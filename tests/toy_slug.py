"""Toy tests para slugify e geração de IDs."""
from build_ids import slugify, TIPO_TO_EIXO


def test_slugify_remove_acentos():
    assert slugify("Educação Profissional") == "educacao-profissional"


def test_slugify_remove_pontuacao():
    # Nota: "nº" decompõe em "no" via NFKD (correto)
    assert slugify("Lei nº 9.394/96 (LDB)") == "lei-no-9-394-96-ldb"


def test_slugify_url_safe():
    s = slugify("São Paulo: Política #1")
    assert all(c.isalnum() or c == "-" for c in s)
    assert s.startswith("sao-paulo")


def test_slugify_truncamento():
    longo = "Programa " * 30
    s = slugify(longo)
    assert len(s) <= 120


def test_slugify_vazio():
    assert slugify("") == ""
    assert slugify(None) == ""


def test_slugify_apenas_pontuacao():
    s = slugify("---///***")
    assert s == "" or all(c.isalnum() or c == "-" for c in s)


def test_tipo_to_eixo_3_categorias_canonicas():
    assert TIPO_TO_EIXO["Educacional direta"] == "EDU"
    assert TIPO_TO_EIXO["Trabalho/qualificação direta"] == "TRAB"
    assert TIPO_TO_EIXO["Proteção social com impacto educacional"] == "PSOC"
