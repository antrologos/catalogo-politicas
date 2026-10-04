"""Toy tests (<30s) do registro persistente de fichas (plano 2026-10-04_pendencias-pos-v1).

O registro (data/derived/registro_fichas.csv) garante que id_interno e slug
não mudem quando a ordem das linhas da planilha muda, que fichas novas
recebam IDs após o maior já usado e que IDs/slugs nunca sejam reaproveitados.
Também guarda criado_em/atualizado_em e o hash do conteúdo de cada ficha.
"""
import pandas as pd

from build_ids import atribuir_ids
from build_json import datas_da_ficha, hash_conteudo


def _df(linhas):
    return pd.DataFrame(linhas, columns=["uf", "nome", "tipo_politica", "onda"])


BASE = [
    ("BR", "PRONATEC", "Educacional", "1"),
    ("SP", "Programa A", "Trabalho e qualificação", "1"),
    ("SP", "Programa A", "Trabalho e qualificação", "1"),   # duplicata exata
    ("GO", "Programa B", "Educacional", "2"),
]


def test_bootstrap_numera_em_ordem_e_grava_datas_da_onda():
    df, reg = atribuir_ids(_df(BASE), None, "2026-10-04")
    assert list(df["id_interno"]) == [
        "FRM-CP-2026-EDU-0001", "FRM-CP-2026-TRAB-0001",
        "FRM-CP-2026-TRAB-0002", "FRM-CP-2026-EDU-0002",
    ]
    assert df["slug"].is_unique
    criado = dict(zip(reg["id_interno"], reg["criado_em"]))
    assert criado["FRM-CP-2026-EDU-0001"] == "2026-05-01"
    assert criado["FRM-CP-2026-EDU-0002"] == "2026-05-13"


def test_reordenar_linhas_nao_muda_ids_nem_slugs():
    df1, reg = atribuir_ids(_df(BASE), None, "2026-10-04")
    embaralhado = _df(list(reversed(BASE)))
    df2, _ = atribuir_ids(embaralhado, reg, "2026-11-01")
    m1 = {(r.uf, r.nome): (r.id_interno, r.slug) for r in df1.itertuples() if r.nome != "Programa A"}
    m2 = {(r.uf, r.nome): (r.id_interno, r.slug) for r in df2.itertuples() if r.nome != "Programa A"}
    assert m1 == m2
    assert set(df1["id_interno"]) == set(df2["id_interno"])


def test_ficha_nova_recebe_id_apos_o_maximo_e_data_de_hoje():
    _, reg = atribuir_ids(_df(BASE), None, "2026-10-04")
    novo = _df(BASE[:1] + [("RJ", "Programa C", "Educacional", "4")] + BASE[1:])
    df, reg2 = atribuir_ids(novo, reg, "2026-11-01")
    linha = df[df["nome"] == "Programa C"].iloc[0]
    assert linha["id_interno"] == "FRM-CP-2026-EDU-0003"
    assert reg2.set_index("id_interno").loc["FRM-CP-2026-EDU-0003", "criado_em"] == "2026-11-01"
    # os antigos continuam iguais
    assert df[df["nome"] == "Programa B"].iloc[0]["id_interno"] == "FRM-CP-2026-EDU-0002"


def test_ficha_removida_fica_inativa_e_id_nao_e_reaproveitado():
    _, reg = atribuir_ids(_df(BASE), None, "2026-10-04")
    sem_b = _df(BASE[:3])
    _, reg2 = atribuir_ids(sem_b, reg, "2026-11-01")
    r = reg2.set_index("id_interno")
    assert str(r.loc["FRM-CP-2026-EDU-0002", "ativo"]) == "False"
    volta_outro = _df(BASE[:3] + [("PA", "Programa D", "Educacional", "4")])
    df3, _ = atribuir_ids(volta_outro, reg2, "2026-12-01")
    assert df3[df3["nome"] == "Programa D"].iloc[0]["id_interno"] == "FRM-CP-2026-EDU-0003"


def test_atualizado_em_so_muda_quando_o_conteudo_muda():
    ficha = {"nome": "X", "resumo": "a", "fonte_data_acesso": "2026-05-01", "citacao_apa": "..."}
    h = hash_conteudo(ficha)
    # campos voláteis não entram no hash
    assert hash_conteudo({**ficha, "fonte_data_acesso": "2026-10-04", "citacao_apa": "outra"}) == h
    reg = {"criado_em": "2026-05-01", "atualizado_em": "2026-05-01", "hash_conteudo": h}
    assert datas_da_ficha(ficha, reg, "2026-10-04") == ("2026-05-01", "2026-05-01", h)
    mudou = {**ficha, "resumo": "b"}
    criado, atualizado, novo = datas_da_ficha(mudou, reg, "2026-10-04")
    assert (criado, atualizado) == ("2026-05-01", "2026-10-04") and novo != h
    # registro sem hash (primeira execução): atualizado_em = criado_em
    assert datas_da_ficha(ficha, {**reg, "hash_conteudo": ""}, "2026-10-04")[1] == "2026-05-01"
