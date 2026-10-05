"""Integração: roda pipeline ETL completo (load → normalize → dedupe → ids → build_json → validate)
sobre a planilha real e checa propriedades estruturais do JSON de saída.

Trata-se de teste de regressão: garante que mudanças futuras não quebram o pipeline ou as
contagens estabelecidas no Bloco C.1.

NÃO usa mock: roda os scripts via subprocess, valida data/derived/latest.json contra schema.
"""
from __future__ import annotations

import json
import csv
import subprocess
import sys
from pathlib import Path

import pytest
import jsonschema

ROOT = Path(__file__).resolve().parent.parent
LATEST = ROOT / "data" / "derived" / "latest.json"
SCHEMA = ROOT / ".claude" / "context" / "policies-schema.json"
with (ROOT / "data/derived/registro_fichas.csv").open(encoding="utf-8", newline="") as registro_inicial:
    IDENTIDADES_ANTES = {p["id_interno"]: p["slug"] for p in csv.DictReader(registro_inicial)}



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

def test_total_1158_fichas(politicas):
    """Ondas 1-3 somam 1158 fichas (33 federais + 26 UFs, réplicas incluídas)."""
    assert len(politicas) == 1158


def test_todas_validam_contra_schema(politicas):
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    validator = jsonschema.Draft7Validator(schema, format_checker=jsonschema.Draft7Validator.FORMAT_CHECKER)
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


def test_todas_27_ufs_estao_presentes(politicas):
    ufs_esperadas = {
        "BR",
        "SP", "RJ", "MG", "PR", "RS", "BA", "PA", "PE", "CE",   # 1ª onda
        "GO", "ES", "SC", "MA", "AM", "MT", "PB", "AL", "RN",   # 2ª onda
        "MS", "RR", "DF", "RO", "PI", "AC", "SE", "TO", "AP",   # 3ª onda
    }
    ufs_no_json = {f["uf"] for f in politicas if f.get("uf")}
    assert ufs_no_json == ufs_esperadas


# ─── Vocabulário canônico ─────────────────────────────────────────

def test_tipo_politica_apenas_3_canonicos(politicas):
    canonicos = {
        "Educacional",
        "Trabalho e qualificação",
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


def test_curadoria_preserva_identidades_registradas(politicas):
    por_id = {p["id_interno"]: p["slug"] for p in politicas}
    assert all(por_id.get(id_) == slug for id_, slug in IDENTIDADES_ANTES.items())


def test_curadoria_aplicada_e_propagada_sem_mudar_territorio(politicas):
    por_id = {p["id_interno"]: p for p in politicas}
    for arquivo in sorted((ROOT / "data/curadoria").glob("correcoes-*.json")):
        for correcao in json.loads(arquivo.read_text(encoding="utf-8"))["correcoes"]:
            origem = por_id[correcao["id_interno"]]
            alvos = [origem] + [p for p in politicas if p.get("is_federal_replica")
                               and p.get("federal_source_id") == origem["id_interno"]]
            for alvo in alvos:
                for campo, mudanca in correcao["campos"].items():
                    assert alvo.get(campo) == mudanca["novo"], (alvo["id_interno"], campo)


def test_curadoria_nao_introduz_categorias_fora_do_vocabulario(politicas):
    vocab = json.loads((ROOT / ".claude/context/vocabulario-canonico.json").read_text(encoding="utf-8"))["campos"]
    for ficha in politicas:
        for campo, regra in vocab.items():
            valor = ficha.get(campo)
            if valor is not None:
                assert valor in regra["canonical_values"], (ficha["id_interno"], campo, valor)


def test_curadoria_nao_atribui_revisao_automatizada_a_pessoa(politicas):
    por_id = {p["id_interno"]: p for p in politicas}
    for arquivo in sorted((ROOT / "data/curadoria").glob("correcoes-*.json")):
        for correcao in json.loads(arquivo.read_text(encoding="utf-8"))["correcoes"]:
            ficha = por_id[correcao["id_interno"]]
            assert ficha.get("revisado_por") is None, ficha["id_interno"]
            assert ficha.get("duvidas_revisor"), ficha["id_interno"]
