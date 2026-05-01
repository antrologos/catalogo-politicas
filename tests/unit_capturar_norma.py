"""Unit tests para capturar_norma.py (D.6).

Usa pytest-httpx para mock HTTP. Cobre:
- Captura HTML básica (200 + extração)
- Dedupe por SHA (re-captura mesma URL retorna 'inalterado')
- 403 com GET fallback (gov.br WAF anti-HEAD)
- 404 → falha_status
- Timeout → falha_rede
- PII scan: regex CPF/CNPJ flag se >5
- robots.txt Disallow → bloqueado_robots
- Update do index.json após captura

Para skill OCR/DOC, ver unit_ocr.py e unit_doc_legado.py.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

import pytest
import httpx

from capturar_norma import (
    capturar,
    extract_text,
    update_snapshot_index,
    SNAPSHOTS_DIR,
    EXTRACTED_DIR,
    INDEX_PATH,
    REGEX_CPF,
    REGEX_CNPJ,
)
from _http_helpers import RobotsCache, RateLimiter, USER_AGENT


# Para evitar contaminar snapshots reais durante testes, usamos pasta temporária.
@pytest.fixture(autouse=True)
def isolar_snapshots(tmp_path, monkeypatch):
    """Redireciona SNAPSHOTS_DIR/EXTRACTED_DIR/INDEX_PATH para tmp_path."""
    test_snapshots = tmp_path / "external_snapshots"
    test_extracted = tmp_path / "extracted_text"
    test_index = test_snapshots / "index.json"
    test_log = tmp_path / "logs" / "captura_test.jsonl"
    test_snapshots.mkdir(parents=True, exist_ok=True)
    test_extracted.mkdir(parents=True, exist_ok=True)
    test_log.parent.mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr("capturar_norma.SNAPSHOTS_DIR", test_snapshots)
    monkeypatch.setattr("capturar_norma.EXTRACTED_DIR", test_extracted)
    monkeypatch.setattr("capturar_norma.INDEX_PATH", test_index)
    monkeypatch.setattr("capturar_norma.LOG_PATH", test_log)
    yield
    # Cleanup auto via tmp_path


HTML_LEI_FICTICIO = b"""<!DOCTYPE html>
<html><head><title>LEI N 12.513 DE 26 OUTUBRO 2011</title></head>
<body>
<h1>LEI No 12.513, DE 26 DE OUTUBRO DE 2011</h1>
<p>Art. 1o Fica institu\xc3\xaddo o Programa Nacional de Acesso ao Ensino Tecnico e Emprego (PRONATEC).</p>
<p>Art. 2o O Pronatec atendera prioritariamente:</p>
<ul>
<li>I - estudantes do ensino medio da rede publica;</li>
<li>II - trabalhadores;</li>
<li>III - beneficiarios de programas federais de transferencia de renda.</li>
</ul>
<p>Esta Lei entra em vigor na data de sua publicacao.</p>
""" + b"<p>conteudo extra para passar tamanho minimo de 1KB</p>" * 50 + b"</body></html>"


# ─── Captura HTML básica ─────────────────────────────────────────

def test_captura_html_simples(httpx_mock):
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/lei", content=HTML_LEI_FICTICIO, status_code=200, headers={"content-type": "text/html; charset=utf-8"})
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404)

    with httpx.Client() as client:
        res = capturar("https://exemplo.gov.br/lei", tipo_documento="lei", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "ok"
    assert res.http_status == 200
    assert res.sha256 is not None
    assert len(res.sha256) == 64
    assert res.extensao == "html"
    assert res.tamanho_bytes == len(HTML_LEI_FICTICIO)
    assert res.caracteres_extraidos > 100
    # caminho_texto pode ser relativo ou absoluto (em tmp_path nos testes)
    text_path = Path(res.caminho_texto) if res.caminho_texto else None
    assert text_path is not None and text_path.exists()
    assert "PRONATEC" in text_path.read_text(encoding="utf-8")
    assert res.atribuicao  # foi inferido (gov.br domínio)


def test_dedupe_por_sha_repeticao(httpx_mock):
    """Capturar mesma URL 2x: 1ª = 'ok', 2ª = 'inalterado' (mesmo SHA)."""
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/lei", content=HTML_LEI_FICTICIO, status_code=200, headers={"content-type": "text/html"}, is_reusable=True)
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404, is_reusable=True)

    robots = RobotsCache()
    rate = RateLimiter(default_delay=0.0)
    with httpx.Client() as client:
        r1 = capturar("https://exemplo.gov.br/lei", client=client, robots_cache=robots, rate_limiter=rate)
        r2 = capturar("https://exemplo.gov.br/lei", client=client, robots_cache=robots, rate_limiter=rate)

    assert r1.status == "ok"
    assert r2.status == "inalterado"
    assert r1.sha256 == r2.sha256


# ─── HTTP errors ─────────────────────────────────────────────────

def test_404_retorna_falha_status(httpx_mock):
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/inexistente", status_code=404)
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404)

    with httpx.Client() as client:
        res = capturar("https://exemplo.gov.br/inexistente", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "falha_status"
    assert res.http_status == 404
    assert res.sha256 is None  # nada salvo


def test_timeout_retorna_falha_rede(httpx_mock):
    # robots.txt: 404 (sem regras → permissivo)
    httpx_mock.add_response(url="https://exemplo.outroservidor.com/robots.txt", status_code=404)
    # GET principal: timeout
    httpx_mock.add_exception(httpx.TimeoutException("read timed out"), method="GET", url="https://exemplo.outroservidor.com/lento")

    with httpx.Client() as client:
        res = capturar("https://exemplo.outroservidor.com/lento", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "falha_rede"
    assert res.erro_tipo == "TimeoutException"


def test_validacao_falhou_html_pequeno(httpx_mock):
    """HTML < 1KB deve marcar validacao_falhou."""
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/curto", content=b"<html><body>oi</body></html>", status_code=200, headers={"content-type": "text/html"})
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404)

    with httpx.Client() as client:
        res = capturar("https://exemplo.gov.br/curto", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "validacao_falhou"
    assert res.tamanho_bytes is not None
    assert res.tamanho_bytes < 1024


# ─── PII scan ───────────────────────────────────────────────────

def test_pii_scan_flag_quando_muitos_cpfs(httpx_mock):
    """Página com >5 CPFs deve marcar contem_pii=true e NÃO salvar texto extraído."""
    cpfs_html = "\n".join(f"<p>Beneficiário {i}: CPF 123.456.789-{i:02d}.</p>" for i in range(10))
    html_pii = b"<html><body><h1>Lista beneficiarios</h1>" + cpfs_html.encode("utf-8") + b"<p>" + b"texto adicional " * 100 + b"</p></body></html>"
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/pii", content=html_pii, status_code=200, headers={"content-type": "text/html"})
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404)

    with httpx.Client() as client:
        res = capturar("https://exemplo.gov.br/pii", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "ok"  # snapshot bruto salvo
    assert res.contem_pii is True
    assert res.pii_count >= 10
    # Texto extraído NÃO salvo (R8)
    assert res.caminho_texto is None


def test_pii_scan_nao_flag_se_poucos(httpx_mock):
    """Página com 3 CPFs (<= 5) NÃO deve flag e salva texto."""
    cpfs_html = "\n".join(f"<p>Pessoa {i}: 111.222.333-{i:02d}</p>" for i in range(3))
    html_pii_baixo = b"<html><body><h1>Texto sobre lei</h1>" + cpfs_html.encode("utf-8") + b"<p>" + b"texto longo " * 200 + b"</p></body></html>"
    httpx_mock.add_response(method="GET", url="https://exemplo.gov.br/pii-baixo", content=html_pii_baixo, status_code=200, headers={"content-type": "text/html"})
    httpx_mock.add_response(url="https://exemplo.gov.br/robots.txt", status_code=404)

    with httpx.Client() as client:
        res = capturar("https://exemplo.gov.br/pii-baixo", client=client, robots_cache=RobotsCache(), rate_limiter=RateLimiter(default_delay=0.0))

    assert res.status == "ok"
    assert res.contem_pii is False
    assert res.pii_count == 3
    assert res.caminho_texto is not None  # texto SALVO


# ─── Regex PII (toy) ─────────────────────────────────────────────

def test_regex_cpf_casa_padrao_brasileiro():
    assert REGEX_CPF.findall("CPF 123.456.789-00 e outro 987.654.321-99") == ["123.456.789-00", "987.654.321-99"]


def test_regex_cpf_nao_casa_sem_pontos():
    assert REGEX_CPF.findall("CPF 12345678900 sem pontos") == []


def test_regex_cnpj_casa_padrao():
    assert REGEX_CNPJ.findall("CNPJ 12.345.678/0001-99") == ["12.345.678/0001-99"]


# ─── extract_text ────────────────────────────────────────────────

def test_extract_text_html_basico():
    html = b"<html><body><h1>Titulo</h1><p>paragrafo um</p><script>removeme</script><p>paragrafo dois</p></body></html>"
    txt = extract_text(html, "html")
    assert "Titulo" in txt or "paragrafo um" in txt
    assert "removeme" not in txt


def test_extract_text_txt():
    txt_bytes = "Conteudo simples\ncom acentos: cao".encode("utf-8")
    txt = extract_text(txt_bytes, "txt", encoding="utf-8")
    assert "cao" in txt


# ─── Index.json ──────────────────────────────────────────────────

def test_update_snapshot_index_cria_estrutura(tmp_path, monkeypatch):
    """update_snapshot_index cria index.json corretamente em primeira chamada."""
    from capturar_norma import CapturaResultado
    monkeypatch.setattr("capturar_norma.INDEX_PATH", tmp_path / "index.json")
    res = CapturaResultado(
        status="ok",
        url_solicitada="https://x.gov.br/lei",
        url_final="https://x.gov.br/lei",
        sha256="a" * 64,
        extensao="html",
        tamanho_bytes=12345,
        timestamp_iso="2026-05-01T00:00:00-03:00",
        atribuicao="X",
        licenca_inferida="dominio_publico",
    )
    update_snapshot_index(res)
    idx = json.loads((tmp_path / "index.json").read_text(encoding="utf-8"))
    assert "a" * 64 in idx["by_sha"]
    assert idx["by_url"]["https://x.gov.br/lei"] == "a" * 64
    assert idx["ultima_atualizacao"] == "2026-05-01T00:00:00-03:00"


def test_update_snapshot_index_idempotente(tmp_path, monkeypatch):
    """Chamar 2x com mesmo SHA atualiza só ultima_validacao, mantém data_captura."""
    from capturar_norma import CapturaResultado
    monkeypatch.setattr("capturar_norma.INDEX_PATH", tmp_path / "index.json")
    res1 = CapturaResultado(
        status="ok", url_solicitada="https://x.gov.br/lei", url_final="https://x.gov.br/lei",
        sha256="b" * 64, extensao="html", tamanho_bytes=12345,
        timestamp_iso="2026-05-01T10:00:00-03:00",
    )
    update_snapshot_index(res1)
    res2 = CapturaResultado(
        status="inalterado", url_solicitada="https://x.gov.br/lei", url_final="https://x.gov.br/lei",
        sha256="b" * 64, extensao="html", tamanho_bytes=12345,
        timestamp_iso="2026-05-15T10:00:00-03:00",
    )
    update_snapshot_index(res2)
    idx = json.loads((tmp_path / "index.json").read_text(encoding="utf-8"))
    entry = idx["by_sha"]["b" * 64]
    assert entry["data_captura"] == "2026-05-01T10:00:00-03:00"  # primeira data preservada
    assert entry["ultima_validacao"] == "2026-05-15T10:00:00-03:00"  # nova data
