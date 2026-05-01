"""Toy tests para name_norm de dedupe.py."""
from dedupe import name_norm, MARCADOR_REPLICA


def test_name_norm_basico():
    assert name_norm("PRONATEC") == "pronatec"
    assert name_norm("Programa Pé de Meia") == "programa pe de meia"


def test_name_norm_acentos_e_pontuacao():
    assert name_norm("Educação Profissional!") == "educacao profissional"
    # Nota: "nº" decompõe em "no" via NFKD (correto)
    assert name_norm("Lei nº 12.513/2011") == "lei no 12 513 2011"


def test_name_norm_espacos_extras():
    assert name_norm("  Programa  Bolsa   Família  ") == "programa bolsa familia"


def test_name_norm_vazio():
    assert name_norm("") == ""
    assert name_norm(None) == ""


def test_marcador_replica_constante():
    """Marcador convencional na coluna duvidas para indicar política federal replicada nas UFs."""
    assert MARCADOR_REPLICA == "EM TODOS OS ESTADOS"
