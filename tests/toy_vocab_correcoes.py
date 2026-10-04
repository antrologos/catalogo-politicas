"""Toy tests (<30s) das correções de vocabulário de 2026-10-04.

Cada valor fora do vocabulário observado em `normalize_unmapped_2026-10-04.csv`
precisa normalizar para um valor canônico, seguindo o dicionário oficial
"Modelos de Categorias" da 3ª onda.
"""
import json

import pytest

from normalize import normalize_value, text_normalize


@pytest.fixture(scope="module")
def vocab(project_root):
    path = project_root / ".claude" / "context" / "vocabulario-canonico.json"
    return json.loads(path.read_text(encoding="utf-8"))["campos"]


def normalizar(vocab, campo: str, valor: str):
    defn = vocab[campo]
    variants = {text_normalize(k): v for k, v in defn.get("variants", {}).items()}
    return normalize_value(valor, variants, set(defn["canonical_values"]))


@pytest.mark.parametrize("campo,valor,esperado", [
    # tipo de oferta
    ("tipo_oferta", "Curso/Formação (qualificação/capacitação)", "Curso/Formação"),
    ("tipo_oferta", "Serviço/Atendimento (orientação/tutoria/acompanhamento/busca ativa/encaminhamento/apoio à trajetória)", "Serviço/Atendimento"),
    ("tipo_oferta", "Benefício/Auxílio financeiro (bolsa/subsídio/vale-transporte/incentivo condicionado à frequência etc.)", "Benefício/Auxílio financeiro"),
    ("tipo_oferta", "Infraestrutura educacional (construção/reforma/ampliação de unidades/polos)", "Infraestrutura educacional"),
    ("tipo_oferta", ".", "Sem informação"),
    ("tipo_oferta", "Presencial", "Sem informação"),
    # arranjo logístico
    ("arranjo_logistico", "Misto", "Misto (fixa + itinerante)"),
    ("arranjo_logistico", "Unidade fixa/oferta fixa", "Unidade fixa"),
    ("arranjo_logistico", "Misto (fixa + polos/ofertas semipresenciais)", "Misto (fixa + itinerante)"),
    ("arranjo_logistico", "Misto (CEEJAs + superintendências regionais + atendimento administrativo)", "Misto (fixa + itinerante)"),
    ("arranjo_logistico", "Territorializada (priorização de áreas vulneráveis)", "Sem informação"),
    ("arranjo_logistico", "Mista (múltiplas modalidades sem predominância clara", "Sem informação"),
    # modalidade
    ("modalidade_oferta", "Unidade fixa / oferta fixa", "Sem informação"),
    # esferas
    ("esfera_formulacao", "Distrito Federal", "Estado"),
    ("esfera_formulacao", "União-Estado", "Interfederativa: União-Estado"),
    ("esfera_formulacao", "Interfederativa: União - Estado", "Interfederativa: União-Estado"),
    ("esfera_formulacao", "União-Estado/Distrito Federal", "Interfederativa: União-Estado"),
    ("esfera_execucao", "Distrito Federal", "Estado"),
    ("esfera_execucao", "Estado-Município", "Compartilhada interfederativa: Estado-Município"),
    ("esfera_execucao", "Compartilhada Interfederativa: União-Município", "Compartilhada interfederativa: União-Município"),
    ("esfera_execucao", "Compartilha da Interfederativa: União - Município", "Compartilhada interfederativa: União-Município"),
    ("esfera_execucao", "União-Estado/Distrito Federal", "Compartilhada interfederativa: União-Estado"),
    ("esfera_execucao", "União-Estado/Município/Distrito Federal", "Compartilhada interfederativa: União-Estado-Município"),
    ("esfera_execucao", "Estado + rede de execução + instituições de ensino públicas/privadas", "Estado"),
    ("esfera_execucao", "União-Estado-Município", "Compartilhada interfederativa: União-Estado-Município"),
    ("esfera_execucao", "União-Estado", "Compartilhada interfederativa: União-Estado"),
    ("esfera_execucao", "Compartilhada interfederativamente: Estado + União", "Compartilhada interfederativa: União-Estado"),
    # origem e abrangência
    ("origem_proposta", "Governamental / cooperação técnica", "Governamental"),
    ("origem_proposta", "Incentivo financeiro-educacional federal para apoiar permanência e conclusão do ensino médio.", "Governamental"),
    ("abrangencia_territorial", "Nacional, com incidência estadual", "Nacional"),
])
def test_valor_vira_canonico(vocab, campo, valor, esperado):
    novo, status = normalizar(vocab, campo, valor)
    assert status in ("canonical", "mapped"), f"{valor!r} continua fora do vocabulário"
    assert novo == esperado
    assert novo in vocab[campo]["canonical_values"]
