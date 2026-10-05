"""Contratos da curadoria e da proveniência; apenas dados sintéticos/temporários."""
from copy import deepcopy
import json

import pytest

from build_json import (
    infer_atribuicao, vincular_fonte, datas_da_ficha, hash_conteudo,
)
from curadoria import aplicar_curadoria, carregar_correcoes, snapshots_validos

BR = "FRM-CP-2026-EDU-0001"
SP = "FRM-CP-2026-EDU-0002"


def fichas():
    return [
        {
            "id_interno": BR, "slug": "programa-br", "uf": "BR",
            "is_federal_replica": False, "federal_source_id": None,
            "nome": "Programa", "resumo": "Texto anterior",
            "orgaos_responsaveis": ["Órgão federal"],
            "fonte_url": "https://www.gov.br/programa-antigo",
            "revisado_por": "Pesquisadora original",
        },
        {
            "id_interno": SP, "slug": "programa-sp", "uf": "SP",
            "is_federal_replica": True, "federal_source_id": BR,
            "nome": "Programa", "resumo": "Texto estadual anterior",
            "orgaos_responsaveis": ["Secretaria local"],
            "fonte_url": "https://educacao.sp.gov.br/pagina-antiga",
            "revisado_por": "Pesquisquisadora local",
        },
        {
            "id_interno": "FRM-CP-2026-EDU-0003", "slug": "outro-df", "uf": "DF",
            "is_federal_replica": False, "federal_source_id": None,
            "nome": "Outro", "resumo": "Sem mudança",
        },
    ]


def correcao(campos=None, id_=BR):
    return {
        "id_interno": id_,
        "campos": campos or {"resumo": {"anterior": "Texto anterior", "novo": "Texto corrigido"}},
        "justificativa": "Texto confrontado com referência oficial.",
        "referencias": [{
            "url": "https://www.gov.br/referencia", "titulo": "Referência oficial",
            "consultado_em": "2026-10-05",
        }],
        "verificado_em": "2026-10-05",
    }


def test_aplica_sem_mutar_identidade_e_propaga_so_campos_corrigidos():
    original = fichas()
    preservado = deepcopy(original)
    resultado, campos = aplicar_curadoria(original, [correcao()])
    assert original == preservado
    assert [f["resumo"] for f in resultado] == ["Texto corrigido", "Texto corrigido", "Sem mudança"]
    assert campos == {BR: {"resumo"}, SP: {"resumo"}}
    for antes, depois in zip(original, resultado):
        for chave in ("id_interno", "slug", "uf", "is_federal_replica", "federal_source_id"):
            assert depois.get(chave) == antes.get(chave)
    assert resultado[1]["orgaos_responsaveis"] == ["Secretaria local"]
    assert resultado[1]["fonte_url"] == original[1]["fonte_url"]


def test_reaplicacao_idempotente_e_datas_mudam_so_por_conteudo():
    original = fichas()
    corrigido, _ = aplicar_curadoria(original, [correcao()])
    repetido, _ = aplicar_curadoria(corrigido, [correcao()])
    assert repetido == corrigido
    registro = {"criado_em": "2026-05-01", "atualizado_em": "2026-05-01",
                "hash_conteudo": hash_conteudo(original[0])}
    criado, atualizado, hash_ = datas_da_ficha(corrigido[0], registro, "2026-10-05")
    assert (criado, atualizado) == ("2026-05-01", "2026-10-05")
    assert datas_da_ficha(repetido[0], {**registro, "atualizado_em": atualizado,
                          "hash_conteudo": hash_}, "2026-10-06")[1] == atualizado


def test_revisao_automatica_pode_limpar_autoria_sem_atribuir_nova_pessoa():
    dados, campos = aplicar_curadoria(fichas(), [correcao({
        "revisado_por": {"anterior": "Pesquisadora original", "novo": None},
    })])
    assert dados[0]["revisado_por"] is None
    assert dados[1]["revisado_por"] is None
    assert campos[SP] == {"revisado_por"}


@pytest.mark.parametrize("campo", [
    "id_interno", "slug", "uf", "is_federal_replica", "federal_source_id",
    "fonte_data_acesso", "criado_em",
])
def test_campos_de_identidade_e_datas_de_proveniencia_protegidos(campo):
    with pytest.raises(ValueError, match="protegido"):
        aplicar_curadoria(fichas(), [correcao({campo: {"anterior": None, "novo": None}})])


def test_conflito_ou_id_desconhecido_interrompe_sem_mutar_entrada():
    original = fichas()
    preservado = deepcopy(original)
    with pytest.raises(ValueError, match="anterior divergente"):
        aplicar_curadoria(original, [correcao({"resumo": {"anterior": "Não corresponde", "novo": "Novo"}})])
    with pytest.raises(ValueError, match="ID inexistente"):
        aplicar_curadoria(original, [correcao(id_="FRM-CP-2026-EDU-9999")])
    assert original == preservado


def test_exige_evidencias_datas_e_valor_compativel_com_schema():
    sem_evidencia = correcao()
    sem_evidencia["referencias"] = []
    with pytest.raises(ValueError, match="referências"):
        aplicar_curadoria(fichas(), [sem_evidencia])
    invalida = correcao()
    invalida["verificado_em"] = "2026-02-31"
    with pytest.raises(ValueError, match="data inválida"):
        aplicar_curadoria(fichas(), [invalida])
    with pytest.raises(ValueError, match="novo valor inválido"):
        aplicar_curadoria(fichas(), [correcao({"situacao_atual": {"anterior": None, "novo": "Certamente ativa"}})])


def test_manifestos_versionados_carregados_em_ordem_e_sem_duplicatas(tmp_path):
    assert carregar_correcoes(tmp_path / "ausente") == []
    documento = {"versao": 1, "correcoes": [correcao()]}
    caminho = tmp_path / "correcoes-2026-10-05.json"
    caminho.write_text(json.dumps(documento), encoding="utf-8")
    assert carregar_correcoes(tmp_path) == [correcao()]
    documento["correcoes"].append(correcao())
    caminho.write_text(json.dumps(documento), encoding="utf-8")
    with pytest.raises(ValueError, match="ID repetido"):
        carregar_correcoes(tmp_path)


def test_troca_fonte_nao_herda_snapshot_data_licenca_nem_atribuicao():
    original = fichas()
    original[0].update({
        "fonte_sha256": "a" * 64, "fonte_data_acesso": "2026-05-01",
        "fonte_arquivo_path": "antigo.html", "fonte_extensao": "html",
        "fonte_ocr_aplicado": True, "proxima_revisao_prevista": "2026-06-01",
        "atribuicao": "Órgão antigo", "licenca_inferida": "Licença antiga",
    })
    novo_url = "https://www.educacao.sp.gov.br/nova-referencia"
    documento = correcao({
        "fonte_url": {"anterior": original[0]["fonte_url"], "novo": novo_url},
    })
    corrigido, campos = aplicar_curadoria(original, [documento])
    for ficha in corrigido[:2]:
        vincular_fonte(ficha, {}, campos[ficha["id_interno"]])
        assert ficha["fonte_sha256"] is None
        assert ficha["fonte_data_acesso"] is None
        assert ficha["fonte_arquivo_path"] is None
        assert ficha["proxima_revisao_prevista"] is None
        assert ficha["fonte_ocr_aplicado"] is False
        assert ficha["licenca_inferida"] == "sem_licenca_explicita"
        assert "São Paulo" in ficha["atribuicao"]
    assert corrigido[1]["fonte_url"] == novo_url


def test_captura_da_nova_fonte_define_data_real_e_preserva_campos_curados():
    ficha = fichas()[0]
    url = ficha["fonte_url"]
    ficha.update({"fonte_tipo": "pagina_programa", "atribuicao": "Autoria documentada",
                  "licenca_inferida": "Licença explicitada na referência"})
    snapshot = {"sha256": "b" * 64, "extensao": "html", "data_captura": "2026-09-01",
                "ultima_validacao": "2026-10-02T12:00:00-03:00",
                "atribuicao": "Autoria antiga", "licenca_inferida": "Outra licença"}
    vincular_fonte(ficha, {url: snapshot}, {"fonte_tipo", "atribuicao", "licenca_inferida"})
    assert ficha["fonte_data_acesso"] == "2026-10-02"
    assert ficha["proxima_revisao_prevista"] == "2026-11-01"
    assert ficha["atribuicao"] == "Autoria documentada"
    assert ficha["licenca_inferida"] == "Licença explicitada na referência"


def test_ponteiro_atual_prevalece_sobre_ordem_e_preserva_alias(tmp_path):
    antigo, novo = "a" * 64, "b" * 64
    indice = {
        "by_sha": {
            novo: {"status": "ok", "url_original": "https://x.gov.br/nova",
                   "url_canonica": "https://x.gov.br/final"},
            antigo: {"status": "ok", "url_original": "https://x.gov.br/antiga",
                     "url_canonica": "https://x.gov.br/final"},
        },
        "by_url": {"https://x.gov.br/final": novo},
    }
    selecionados = snapshots_validos(indice, tmp_path)
    assert selecionados["https://x.gov.br/final"]["sha256"] == novo
    assert selecionados["https://x.gov.br/antiga"]["sha256"] == novo
    assert selecionados["https://x.gov.br/nova"]["sha256"] == novo


def test_snapshot_rejeitado_ou_sem_status_nao_e_promovido(tmp_path):
    sha = "c" * 64
    indice = {"by_sha": {sha: {"url_canonica": "https://x.gov.br/fonte"}},
              "by_url": {"https://x.gov.br/fonte": sha}}
    assert snapshots_validos(indice, tmp_path) == {}
    metadata = tmp_path / f"{sha}.metadata.json"
    metadata.write_text(json.dumps({"status": "validacao_falhou"}), encoding="utf-8")
    assert snapshots_validos(indice, tmp_path) == {}
    metadata.write_text(json.dumps({"status": "ok"}), encoding="utf-8")
    assert snapshots_validos(indice, tmp_path)["https://x.gov.br/fonte"]["sha256"] == sha
    indice["by_sha"][sha]["status"] = "validacao_falhou"
    assert snapshots_validos(indice, tmp_path) == {}


def test_atribuicao_usa_hostname_real_e_nao_presume_licenca():
    assert "São Paulo" in infer_atribuicao("https://www.educacao.sp.gov.br/pagina")
    assert infer_atribuicao("https://www.gov.br/mec") == "Governo Federal — gov.br"
    for url in ["https://exemplo.com/gov.br/lei", "https://gov.br.exemplo.com/",
                "https://www.gov.br@exemplo.com/", "https://outro.sp.gov.br/"]:
        assert "Governo Federal" not in infer_atribuicao(url)
    ficha = {**fichas()[0], "fonte_url": "https://www.gov.br/programa"}
    vincular_fonte(ficha, {ficha["fonte_url"]: {
        "sha256": "d" * 64, "data_captura": "2026-05-01",
        "licenca_inferida": "CC BY-ND 3.0 (presumida; gov.br)",
    }})
    assert ficha["licenca_inferida"] == "sem_licenca_explicita"
