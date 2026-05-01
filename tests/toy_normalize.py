"""Toy tests (<30s, sintéticos) para funções puras de normalize.py."""
from normalize import (
    cosmetic_clean,
    text_normalize,
    SUFIXO_PATTERN,
    split_esfera_execucao,
)


# ─── cosmetic_clean ───────────────────────────────────────────────

def test_cosmetic_endash_para_hifen():
    assert cosmetic_clean("União–Estado") == "União-Estado"
    assert cosmetic_clean("Estado—Município") == "Estado-Município"


def test_cosmetic_aspas_curvas_para_retas():
    assert cosmetic_clean("“Misto”") == 'Misto'  # aspas envolventes removidas
    assert cosmetic_clean("‘Itinerante’") == 'Itinerante'


def test_cosmetic_aspas_francesas_removidas():
    assert cosmetic_clean("«Misto (fixa + itinerante)»") == "Misto (fixa + itinerante)"


def test_cosmetic_aspas_envolventes_duplas():
    assert cosmetic_clean('"Misto"') == "Misto"
    assert cosmetic_clean("'Itinerante'") == "Itinerante"


def test_cosmetic_dois_pontos_duplos():
    assert cosmetic_clean("interfederativa::União") == "interfederativa:União"


def test_cosmetic_espacos_multiplos():
    assert cosmetic_clean("União    -    Estado") == "União - Estado"


def test_cosmetic_idempotente():
    s = "União – Estado"
    assert cosmetic_clean(cosmetic_clean(s)) == cosmetic_clean(s)


# ─── text_normalize ───────────────────────────────────────────────

def test_text_normalize_remove_acentos_e_lowercase():
    assert text_normalize("São Paulo") == "sao paulo"
    assert text_normalize("EDUCAÇÃO") == "educacao"


def test_text_normalize_endash_vira_hifen_antes_de_remover_unicode():
    """Bug detectado: en-dash era removido sem virar hífen, quebrando lookup."""
    assert text_normalize("União–Estado") == "uniao-estado"


def test_text_normalize_remove_aspas_internas():
    assert text_normalize('"Itinerante" (móveis)') == "itinerante (moveis)"


def test_text_normalize_idempotente():
    s = "Compartilhada Interfederativa: União–Estado"
    assert text_normalize(text_normalize(s)) == text_normalize(s)


# ─── SUFIXO_PATTERN / split_esfera_execucao ─────────────────────

def test_split_simples_sem_sufixo():
    tronco, sufixos = split_esfera_execucao("União")
    assert tronco == "União"
    assert sufixos == []


def test_split_sufixo_unico_com_mais():
    tronco, sufixos = split_esfera_execucao("União + rede ofertante")
    assert tronco == "União"
    assert sufixos == ["rede ofertante"]


def test_split_sufixo_unico_com_menos():
    """Bug detectado: regex inicial só pegava +, perdíamos hífens."""
    tronco, sufixos = split_esfera_execucao("União - Empresas empregadoras")
    assert tronco == "União"
    assert sufixos == ["Empresas empregadoras"]


def test_split_sufixos_encadeados():
    """Bug detectado: split só pegava o último; agora itera."""
    tronco, sufixos = split_esfera_execucao("União - Empresas empregadoras + Entidades qualificadoras")
    assert tronco == "União"
    assert sufixos == ["Empresas empregadoras", "Entidades qualificadoras"]


def test_split_compartilhada_com_sufixo():
    tronco, sufixos = split_esfera_execucao(
        "Compartilhada Interfederativa: União-Estado-Município + rede executora"
    )
    assert "União-Estado-Município" in tronco
    assert sufixos == ["rede executora"]


def test_split_nao_quebra_compartilhada_pura():
    tronco, sufixos = split_esfera_execucao("Compartilhada interfederativa: União-Estado-Município")
    assert tronco == "Compartilhada interfederativa: União-Estado-Município"
    assert sufixos == []
