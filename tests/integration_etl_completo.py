"""Integração: roda pipeline ETL completo (load → normalize → dedupe → ids → build_json → validate)
sobre a planilha real e checa propriedades estruturais do JSON de saída.

Trata-se de teste de regressão: garante que mudanças futuras não quebram o pipeline ou as
contagens estabelecidas no Bloco C.1.

NÃO usa mock: roda os scripts via subprocess, valida data/derived/latest.json contra schema.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest
import jsonschema

ROOT = Path(__file__).resolve().parent.parent
LATEST = ROOT / "data" / "derived" / "latest.json"
SCHEMA = ROOT / ".claude" / "context" / "policies-schema.json"


def run(*args: str) -> subprocess.CompletedProcess:
    """Roda script Python -B com timeout 120s."""
    cmd = [sys.executable, "-B", *args]
    result = subprocess.run(
        cmd,
        capture_output=True, text=True, encoding="utf-8",
        timeout=120, cwd=str(ROOT),
    )
    return result


@pytest.fixture(scope="module")
def pipeline_executado():
    """Roda pipeline completo uma vez para todo o módulo."""
    for script in (
        "scripts/etl/load_planilha.py",
        "scripts/etl/normalize.py",
        "scripts/etl/dedupe.py",
        "scripts/etl/build_ids.py",
        "scripts/etl/build_json.py",
    ):
        result = run(script)
        assert result.returncode == 0, f"{script} falhou: {result.stderr[:500]}"
    return LATEST


@pytest.fixture(scope="module")
def politicas(pipeline_executado) -> list[dict]:
    """Carrega o JSON canônico gerado."""
    data = json.loads(LATEST.read_text(encoding="utf-8"))
    assert isinstance(data, list)
    return data


# ─── Estrutura geral ───────────────────────────────────────────────

def test_total_439_fichas(politicas):
    """Onda 1 tem exatamente 439 fichas (33 federais + 9 UFs)."""
    assert len(politicas) == 439


def test_todas_validam_contra_schema(politicas):
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    validator = jsonschema.Draft7Validator(schema)
    erros: list[str] = []
    for ficha in politicas:
        for e in validator.iter_errors(ficha):
            erros.append(f"[{ficha.get('id_interno')}] {e.message[:120]}")
    assert not erros, "Erros de schema:\n" + "\n".join(erros[:10])


def test_todas_tem_id_interno_padrao(politicas):
    import re
    pattern = re.compile(r"^FRM-CP-\d{4}-[A-Z]{2,5}-\d{4}$")
    for f in politicas:
        assert pattern.match(f["id_interno"]), f"ID inválido: {f['id_interno']}"


def test_slugs_unicos(politicas):
    slugs = [f["slug"] for f in politicas]
    assert len(slugs) == len(set(slugs)), "Slugs duplicados detectados"


def test_slugs_dentro_do_limite_120(politicas):
    for f in politicas:
        assert len(f["slug"]) <= 120, f"Slug longo: {f['slug']}"


# ─── Distribuição por UF ─────────────────────────────────────────

def test_uf_br_tem_33_federais(politicas):
    federais = [f for f in politicas if f["uf"] == "BR"]
    assert len(federais) == 33


def test_todas_9_ufs_estao_presentes(politicas):
    ufs_esperadas = {"BR", "SP", "RJ", "MG", "PR", "RS", "BA", "PA", "PE", "CE"}
    ufs_no_json = {f["uf"] for f in politicas if f.get("uf")}
    assert ufs_no_json == ufs_esperadas


# ─── Vocabulário canônico ─────────────────────────────────────────

def test_tipo_politica_apenas_3_canonicos(politicas):
    canonicos = {
        "Educacional direta",
        "Trabalho/qualificação direta",
        "Proteção social com impacto educacional",
    }
    valores = {f["tipo_politica"] for f in politicas}
    assert valores == canonicos


def test_situacao_atual_nas_5_canonicas(politicas):
    canonicos = {
        "Ativa / em execução", "Encerrada", "Suspensa / pausada",
        "Descontinuada", "Sem informação",
    }
    valores = {f["situacao_atual"] for f in politicas if f.get("situacao_atual")}
    assert valores <= canonicos, f"Valores fora do canônico: {valores - canonicos}"


# ─── Deduplicação ─────────────────────────────────────────────────

def test_pelo_menos_250_replicas_federais(politicas):
    """As ~33 federais aparecem em ~9 UFs cada → ~250+ réplicas."""
    replicas = [f for f in politicas if f.get("is_federal_replica")]
    assert len(replicas) >= 250


def test_replicas_tem_federal_source_id(politicas):
    federal_ids = {f["id_interno"] for f in politicas if f["uf"] == "BR"}
    for f in politicas:
        if f.get("is_federal_replica"):
            assert f.get("federal_source_id") in federal_ids, \
                f"federal_source_id inválido em {f['id_interno']}: {f.get('federal_source_id')}"


# ─── Citações ─────────────────────────────────────────────────────

def test_todas_tem_citacao_apa_e_bibtex(politicas):
    for f in politicas:
        assert f.get("citacao_apa"), f"sem APA: {f['id_interno']}"
        assert f.get("citacao_bibtex", "").startswith("@misc"), f"BibTeX inválido: {f['id_interno']}"


# ─── Completude ───────────────────────────────────────────────────

def test_completude_pct_no_intervalo(politicas):
    for f in politicas:
        c = f.get("completude_pct")
        assert isinstance(c, int) and 0 <= c <= 100, f"completude inválida: {c}"


def test_completude_media_acima_de_85(politicas):
    cs = [f["completude_pct"] for f in politicas]
    media = sum(cs) / len(cs)
    assert media > 85, f"Completude média baixa: {media:.1f}"
