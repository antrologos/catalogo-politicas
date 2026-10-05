"""Regressões da auditoria GET limitada, sem rede nem snapshots."""
import json
import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "captura"))
import auditar_referencias as audit
import _http_helpers


@pytest.fixture
def make_auditor(tmp_path, monkeypatch):
    monkeypatch.setattr(_http_helpers, "ROBOTS_CACHE_DIR", tmp_path / "robots")
    clients = []
    def make(handler):
        client = httpx.Client(transport=httpx.MockTransport(handler), headers=audit.DEFAULT_HEADERS)
        clients.append(client)
        instance = audit.LimitedHTTP(client)
        waits = []
        instance.rate.wait = lambda url: waits.append(url)
        return instance, waits
    yield make
    for client in clients:
        client.close()


def test_redirect_checks_target_robots_before_get(make_auditor):
    calls = []
    def handler(request):
        calls.append(str(request.url))
        assert request.method == "GET"
        assert request.headers["user-agent"] == audit.USER_AGENT
        if request.url.path == "/robots.txt":
            body = "User-agent: *\nDisallow: /secret" if request.url.host == "destino.gov.br" else ""
            return httpx.Response(200, text=body)
        return httpx.Response(302, headers={"location": "https://destino.gov.br/secret"})
    instance, waits = make_auditor(handler)
    result = instance.audit({"url": "https://origem.gov.br/fonte", "prioridade": 0})
    assert result["status_class"] == "bloqueado_robots"
    assert "https://destino.gov.br/secret" not in calls
    assert calls == waits
    assert result["robots"][-1]["permitido"] is False


class NeverRead(httpx.SyncByteStream):
    def __iter__(self):
        raise AssertionError("O corpo binário não deve ser baixado")
        yield b""


def test_pdf_reads_headers_only(make_auditor):
    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, headers={"content-type": "application/pdf"}, stream=NeverRead())
    instance, _ = make_auditor(handler)
    result = instance.audit({"url": "https://origem.gov.br/plano.pdf", "prioridade": 0})
    assert result["status_class"] == "ok_200"
    assert result["bytes_lidos"] == 0
    assert result["titulo"] is None
    assert "robots_indisponivel_politica_permissiva" in result["alertas"]


def test_html_title_and_prefix_limit(make_auditor):
    body = b"<html><head><title>Plano &amp; Metas</title></head>" + b"x" * 100000
    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(200, text="User-agent: *\nCrawl-delay: 5")
        return httpx.Response(200, headers={"content-type": "text/html"}, content=body)
    instance, _ = make_auditor(handler)
    result = instance.audit({"url": "https://origem.gov.br/plano", "prioridade": 0})
    assert result["titulo"] == "Plano & Metas"
    assert result["bytes_lidos"] <= 2048
    assert instance.rate._delay_override["origem.gov.br"] == 5


def test_missing_title_stops_at_cap_and_5xx_is_not_retried(make_auditor):
    calls = []
    def handler(request):
        calls.append(str(request.url))
        if request.url.path == "/robots.txt":
            return httpx.Response(200, text="")
        return httpx.Response(503, headers={"content-type": "text/html"}, content=b"x" * 100000)
    instance, _ = make_auditor(handler)
    result = instance.audit({"url": "https://origem.gov.br/plano", "prioridade": 0})
    assert result["status_class"] == "server_err_5xx"
    assert result["bytes_lidos"] == audit.HTML_LIMIT
    assert result["prefixo_limitado"] is True
    assert calls.count("https://origem.gov.br/plano") == 1


def test_redirect_home_and_soft_error_are_flags_not_validity_claim(make_auditor):
    def handler(request):
        if request.url.path == "/robots.txt":
            return httpx.Response(200, text="")
        if request.url.path == "/plano":
            return httpx.Response(301, headers={"location": "/"})
        return httpx.Response(200, headers={"content-type": "text/html"},
                              text="<title>Página não encontrada</title>")
    instance, _ = make_auditor(handler)
    result = instance.audit({"url": "https://origem.gov.br/plano", "prioridade": 0})
    assert result["status_http"] == 200
    assert result["status_class"] == "ok_com_alerta"
    assert set(result["alertas"]) == {
        "redirecionamento_para_pagina_generica", "titulo_indica_erro_ou_bloqueio"
    }


def test_input_collects_unique_primary_and_proposals_ignores_local(tmp_path):
    primary = tmp_path / "latest.json"
    primary.write_text(json.dumps([
        {"id_interno": "A", "fonte_url": "https://origem.gov.br/a"},
        {"id_interno": "B", "fonte_url": "https://placeholder.local/x"},
        {"id_interno": "C", "is_federal_replica": True, "fonte_url": "https://replica.gov.br/a"},
    ]), encoding="utf-8")
    proposals = tmp_path / "propostas"
    proposals.mkdir()
    (proposals / "propostas-a.json").write_text(json.dumps({"correcoes": [{
        "id_interno": "A", "campos": {"fonte_url": {"novo": "https://nova.gov.br/doc"}},
        "referencias": [{"url": "https://nova.gov.br/doc"}, {"url": "https://outra.gov.br/lei"}],
    }]}), encoding="utf-8")
    entries, info = audit.collect_inputs(primary, proposals, None)
    assert {e["url"] for e in entries} == {
        "https://origem.gov.br/a", "https://nova.gov.br/doc", "https://outra.gov.br/lei"
    }
    assert info["fichas_unicas_lidas"] == 2
    assert len(info["origens_omitidas"]) == 1
    assert info["origens_omitidas"][0]["origem"]["id_interno"] == "B"
    assert len(next(e for e in entries if e["url"] == "https://nova.gov.br/doc")["origens"]) == 2


def test_public_url_keeps_query_but_rejects_private_redirects():
    assert audit.public_url("HTTPS://EXAMPLE.GOV.BR/a?q=1#anchor") == "https://example.gov.br/a?q=1"
    assert audit.public_url("http://127.0.0.1/internal") is None
    assert audit.public_url("https://placeholder.frm.local/internal") is None
    assert audit.public_url("file:///x") is None


def test_plone_require_login_is_authentication_destination():
    flags = audit.destination_flags("https://www.gov.br/trabalho/rede-sine",
                                    "https://www.gov.br/trabalho/acl_users/credentials_cookie_auth/require_login?came_from=x")
    assert "destino_de_autenticacao" in flags


def test_resume_only_fetches_missing_and_marks_old_scope(tmp_path, monkeypatch):
    primary = tmp_path / "latest.json"
    primary.write_text(json.dumps([
        {"id_interno": "A", "fonte_url": "https://origem.gov.br/a"},
        {"id_interno": "B", "fonte_url": "https://origem.gov.br/b"},
    ]), encoding="utf-8")
    proposals = tmp_path / "propostas"
    proposals.mkdir()
    output = tmp_path / "audit.json"
    def cached(url, final=None):
        return {
            "url": url, "url_final": final or url, "titulo": None,
            "status_http": 200, "status_class": "ok_200", "prioridade": 0,
            "checado_em": audit.now(), "origens": [], "alertas": [],
        }
    output.write_text(json.dumps({"resultados": [
        cached("https://origem.gov.br/a", "https://origem.gov.br/acl_users/require_login"),
        cached("https://origem.gov.br/retirada"),
    ]}), encoding="utf-8")
    calls = []
    class FakeAuditor:
        def __init__(self):
            self.client = self
        def close(self):
            pass
        def audit(self, entry):
            calls.append(entry["url"])
            return {**cached(entry["url"]), **entry}
    monkeypatch.setattr(audit, "LimitedHTTP", FakeAuditor)
    monkeypatch.setattr(sys, "argv", ["auditar_referencias.py", "--input", str(primary),
                                    "--propostas", str(proposals), "--output", str(output),
                                    "--workers", "1"])
    assert audit.main() == 0
    assert calls == ["https://origem.gov.br/b"]
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["concluido"] is True
    assert report["urls_verificadas"] == 3
    assert report["urls_verificadas_no_escopo"] == 2
    login = next(r for r in report["resultados"] if r["url"].endswith("/a"))
    assert login["status_class"] == "ok_com_alerta"
    assert "destino_de_autenticacao" in login["alertas"]
    removed = next(r for r in report["resultados"] if r["url"].endswith("/retirada"))
    assert removed["fora_escopo_atual"] is True
