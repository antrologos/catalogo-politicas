"""Toy tests (<30s) para a incorporação da 3ª onda (plano 2026-10-04).

Cobrem: variante nova de cabeçalho, mapa aba → UF da 3ª onda, variantes de
vocabulário introduzidas pela 3ª onda e cobertura de TIPO_TO_EIXO sobre os
valores canônicos de tipo_politica (regressão do rename de 2026-05-14).
"""
import json

import openpyxl
import pytest

from build_ids import TIPO_TO_EIXO
from load_planilha import ABA_UF_ONDA3, RAW_XLSX_ONDA3, map_header
from normalize import normalize_value, text_normalize

UFS_ONDA3 = {"MS", "RR", "DF", "RO", "PI", "AC", "SE", "TO", "AP"}


@pytest.fixture(scope="module")
def vocab(project_root):
    path = project_root / ".claude" / "context" / "vocabulario-canonico.json"
    return json.loads(path.read_text(encoding="utf-8"))["campos"]


def normalizar(vocab, campo: str, valor: str) -> str | None:
    defn = vocab[campo]
    variants = {text_normalize(k): v for k, v in defn.get("variants", {}).items()}
    novo, _status = normalize_value(valor, variants, set(defn["canonical_values"]))
    return novo


# ─── load_planilha ───────────────────────────────────────────────

def test_header_orgaos_variante_eis_mapeada():
    h = "Órgão(s) responsável(eis) com especificações"
    assert map_header(h, position=11) == "orgaos_responsaveis_detalhe"


def test_aba_uf_onda3_cobre_9_ufs_novas():
    ufs = {uf for uf in ABA_UF_ONDA3.values() if uf}
    assert ufs == UFS_ONDA3


def test_aba_uf_onda3_casa_com_abas_reais():
    if not RAW_XLSX_ONDA3.exists():
        pytest.skip("planilha da 3ª onda ausente")
    wb = openpyxl.load_workbook(RAW_XLSX_ONDA3, read_only=True)
    assert set(ABA_UF_ONDA3) == set(wb.sheetnames)


# ─── vocabulário ─────────────────────────────────────────────────

@pytest.mark.parametrize("campo,valor,esperado", [
    ("situacao_atual", "Ativa / em execução conforme UF", "Ativa / em execução"),
    ("situacao_atual", "Ativa / em desenvolvimento", "Ativa / em execução"),
    ("situacao_atual", "Ativa / em execução ou com implementação vinculada à rede", "Ativa / em execução"),
    ("situacao_atual", "Situação variável por modalidade", "Sem informação"),
    ("situacao_atual", "Sem informação / indeterminada (Não dá para afirmar o status com as fontes disponíveis)", "Sem informação"),
    ("tipo_politica", "Misto", "Proteção social com impacto educacional"),
    ("modalidade_oferta", "Misto (combina múltiplos tipos de oferta sem predominância clara)", "Mista"),
    ("modalidade_oferta", "Itinerante (equipes/unidades móveis; ações em comunidades)", "Presencial"),
    ("abrangencia_territorial", "Distrital", "Estadual"),
    ("abrangencia_territorial", "Estadual/distrital, com diretrizes nacionais", "Estadual"),
    ("abrangencia_territorial", "Estadual, via campi do IFRR", "Estadual"),
    ("abrangencia_territorial", "Estadual, com acesso digital", "Estadual"),
    ("abrangencia_territorial", "Nacional, com execução estadual", "Nacional"),
    ("abrangencia_territorial", "Nacional, com execução local quando aderido", "Nacional"),
])
def test_variantes_onda3_viram_canonico(vocab, campo, valor, esperado):
    assert normalizar(vocab, campo, valor) == esperado


# ─── build_ids ───────────────────────────────────────────────────

def test_tipo_to_eixo_cobre_todos_os_canonicos(vocab):
    """Todo valor canônico de tipo_politica precisa de eixo próprio (não OUTR)."""
    for valor in vocab["tipo_politica"]["canonical_values"]:
        assert valor in TIPO_TO_EIXO, f"{valor!r} cairia em OUTR"
