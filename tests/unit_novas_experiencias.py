"""Novas entradas declarativas: identidade, validação e proveniência."""
from copy import deepcopy
import json
import pandas as pd
import pytest
from build_ids import atribuir_ids
from build_json import vincular_fonte, destino_saida, ROOT, LATEST
from novas_experiencias import (
    adicionar_novas, aplicar_campos_novos, carregar_novas,
    validar_experiencias, CHAVE_COLUNA,
)

def nova(chave="am:exemplo", nome="Experiência", uf="AM"):
    return {
        "chave_fonte": chave,
        "campos": {"nome": nome, "uf": uf, "tipo_politica": "Educacional",
            "situacao_atual": "Sem informação", "modalidade_oferta": "Presencial",
            "fonte_url": "https://www.gov.br/fonte", "fonte_tipo": "pagina_programa",
            "descricao_tecnica": "Oferta descrita por fonte pública, sem confirmação de execução atual.",
            "orgaos_responsaveis": ["Órgão público"]},
        "justificativa": "Experiência confirmada documentalmente.",
        "referencias": [{"url": "https://www.gov.br/fonte", "titulo": "Fonte",
                        "consultado_em": "2026-10-05"}],
        "verificado_em": "2026-10-05",
    }

def base():
    return pd.DataFrame([{"uf": "SP", "nome": "Original", "tipo_politica": "Educacional",
                          "onda": "1", "federal_source_nome": "", "is_federal_replica": False}])

def test_reordenar_e_renomear_preserva_identidade_e_registro_original():
    original, registro = atribuir_ids(base(), None, "2026-10-04")
    entrada = [nova("am:z", "Programa Z"), nova("am:a", "Programa A")]
    primeira, reg = atribuir_ids(adicionar_novas(base(), entrada), registro, "2026-10-05")
    esperado = dict(zip(primeira[CHAVE_COLUNA].fillna("original"), zip(primeira.id_interno, primeira.slug)))
    renomeada = deepcopy(entrada)
    renomeada[0]["campos"]["nome"] = "Título corrigido"
    depois, reg2 = atribuir_ids(adicionar_novas(base(), renomeada[::-1]).iloc[::-1], reg, "2026-10-06")
    atual = dict(zip(depois[CHAVE_COLUNA].fillna("original"), zip(depois.id_interno, depois.slug)))
    assert atual == esperado
    assert esperado["original"] == (original.id_interno.iloc[0], original.slug.iloc[0])
    assert len(reg2) == len(reg)
    assert set(reg2.criado_em) == {"2026-05-01", "2026-10-05"}

def test_primeira_atribuicao_independe_ordem_e_nao_replica_br():
    entradas = [nova("br:b", "Programa B", "BR"), nova("br:a", "Programa A", "BR")]
    a, _ = atribuir_ids(adicionar_novas(base(), entradas), None, "2026-10-05")
    b, _ = atribuir_ids(adicionar_novas(base(), entradas[::-1]), None, "2026-10-05")
    assert a[["id_interno", "slug"]].equals(b[["id_interno", "slug"]])
    assert len(a) == 3
    assert a.uf.tolist() == ["SP", "BR", "BR"]
    assert not a.is_federal_replica.any()
    assert a.federal_source_nome.eq("").all()

def test_remover_reinserir_nao_reutiliza_id_e_uf_nao_muda():
    entrada = nova()
    primeiro, reg = atribuir_ids(adicionar_novas(base(), [entrada]), None, "2026-10-05")
    _, reg2 = atribuir_ids(base(), reg, "2026-10-06")
    assert reg2.loc[reg2.chave.eq("curadoria|am:exemplo"), "ativo"].item() == "False"
    depois, _ = atribuir_ids(adicionar_novas(base(), [entrada]), reg2, "2026-10-07")
    assert primeiro.id_interno.tolist() == depois.id_interno.tolist()
    entrada["campos"]["uf"] = "PA"
    with pytest.raises(ValueError, match="UF alterada"):
        atribuir_ids(adicionar_novas(base(), [entrada]), reg2, "2026-10-07")

def test_chave_duplicada_e_colisao_nominal_nao_criam_segunda_ficha():
    with pytest.raises(ValueError, match="duplicada"):
        adicionar_novas(base(), [nova(), nova()])
    with pytest.raises(ValueError, match="já presente"):
        adicionar_novas(base(), [nova(nome="Original", uf="SP")])

@pytest.mark.parametrize("campo,valor", [
    ("id_interno", "FRM-CP-2026-EDU-0999"), ("slug", "inventado"),
    ("fonte_data_acesso", "2026-10-05"), ("is_federal_replica", True),
    ("situacao_atual", "Vigente"), ("uf", "XX"), ("tipo_oferta", "tipo inventado"),
    ("orgaos_responsaveis", "Lista deve continuar lista"),
    ("fonte_url", "https://placeholder.local/fonte"), ("revisado_por", "Pessoa não revisora"),
])
def test_rejeita_campos_derivados_schema_vocabulario_e_autoria(campo, valor):
    item = nova()
    item["campos"][campo] = valor
    with pytest.raises(ValueError):
        validar_experiencias([item])

def test_exige_referencia_publica_e_consulta_nao_posterior():
    for ajuste in ({"referencias": []}, {"referencias": [{"url": "http://localhost/a", "titulo": "a", "consultado_em": "2026-10-05"}]},
                   {"verificado_em": "2026-10-04"}):
        item = nova()
        item.update(ajuste)
        with pytest.raises(ValueError):
            validar_experiencias([item])

def test_loader_valida_duplicatas_entre_arquivos_e_ordena(tmp_path):
    for i, item in enumerate([nova("am:z", "Programa Z"), nova("am:a", "Programa A")]):
        (tmp_path / f"novas-{i}.json").write_text(json.dumps({"versao": 1, "experiencias": [item]}), encoding="utf-8")
    assert [e["chave_fonte"] for e in carregar_novas(tmp_path)] == ["am:a", "am:z"]
    (tmp_path / "novas-2.json").write_text(json.dumps({"versao": 1, "experiencias": [nova("am:a", "Programa A")]}), encoding="utf-8")
    with pytest.raises(ValueError, match="duplicada"):
        carregar_novas(tmp_path)

def test_campos_preservam_listas_sem_confundir_consulta_com_captura():
    item = nova()
    row = adicionar_novas(base(), [item]).iloc[-1].to_dict()
    ficha = {"id_interno": "FRM-CP-2026-EDU-0999", "slug": "experiencia-am",
             "fonte_data_acesso": None, "revisado_por": "Default antigo"}
    campos = aplicar_campos_novos(ficha, row, {item["chave_fonte"]: item})
    vincular_fonte(ficha, {}, campos)
    assert ficha["orgaos_responsaveis"] == ["Órgão público"]
    assert ficha["fonte_data_acesso"] is None
    assert ficha["revisado_por"] is None
    assert ficha["is_federal_replica"] is False
    assert ficha["federal_source_id"] is None
    assert ficha["id_interno"] == "FRM-CP-2026-EDU-0999"
    assert item["referencias"][0]["consultado_em"] == "2026-10-05"
    alterada = deepcopy(item)
    alterada["campos"]["nome"] = "Mudou depois de IDs"
    with pytest.raises(ValueError, match="Manifesto alterado"):
        aplicar_campos_novos(ficha, row, {item["chave_fonte"]: alterada})
    with pytest.raises(ValueError, match="Manifesto ausente"):
        aplicar_campos_novos(ficha, row, {})

def test_saida_preserva_onda_e_nao_sai_do_projeto():
    assert destino_saida(None, True).name.startswith("policies-curadoria-")
    assert destino_saida(".claude/working/curadoria-relatorios-2026-10-05/ensaio.json").is_relative_to(ROOT)
    for caminho in (ROOT.parent / "fora.json", LATEST, ROOT / "saida.csv"):
        with pytest.raises(ValueError):
            destino_saida(caminho)


def test_build_json_completo_isolado_preserva_onda_e_campos_tipados(tmp_path, monkeypatch):
    import build_json
    from jsonschema import Draft7Validator
    pasta = tmp_path / "curadoria"
    pasta.mkdir()
    entrada = nova()
    entrada["campos"]["atribuicao"] = "Instituição responsável"
    entrada["campos"]["resumo"] = "Resumo distinto"
    entrada["campos"]["apresentacao"] = "Apresentação distinta"
    (pasta / "novas-teste.json").write_text(json.dumps({"versao": 1, "experiencias": [entrada]}), encoding="utf-8")
    frame, registro = atribuir_ids(adicionar_novas(base(), [entrada]), None, "2026-10-05")
    entrada_csv, reg_csv = tmp_path / "with_ids.csv", tmp_path / "registro.csv"
    frame.to_csv(entrada_csv, index=False)
    registro.to_csv(reg_csv, index=False)
    anterior = tmp_path / "onda-anterior.json"
    anterior.write_text("preservado", encoding="utf-8")
    latest = tmp_path / "latest.json"
    saida = tmp_path / "curadoria.json"
    for nome, valor in {
        "CURADORIA_DIR": pasta, "IN_CSV": entrada_csv, "REGISTRO_CSV": reg_csv,
        "OUT_JSON": anterior, "LATEST": latest,
        "SNAPSHOT_INDEX": tmp_path / "sem-indice.json",
        "EXTRACTED_DIR": tmp_path / "sem-captura",
    }.items():
        monkeypatch.setattr(build_json, nome, valor)
    assert build_json.main(saida) == 0
    assert anterior.read_text(encoding="utf-8") == "preservado"
    dados = json.loads(saida.read_text(encoding="utf-8"))
    assert json.loads(latest.read_text(encoding="utf-8")) == dados
    nova_ficha = next(f for f in dados if f["uf"] == "AM")
    for campo, esperado in entrada["campos"].items():
        assert nova_ficha.get(campo) == esperado
    assert not nova_ficha.get("fonte_data_acesso")
    assert not nova_ficha.get("fonte_sha256")
    schema = json.loads(build_json.SCHEMA.read_text(encoding="utf-8"))
    assert not list(Draft7Validator(schema).iter_errors(nova_ficha))
    # Retirada editorial explícita mantém a chave required com null no JSON final.
    retirada = {"id_interno": nova_ficha["id_interno"],
        "nivel": "leitura_editorial_evidencia_insuficiente",
        "campos": {"fonte_url": {"anterior": entrada["campos"]["fonte_url"], "novo": None},
                   "duvidas_revisor": {"anterior": None, "novo": "Fonte retirada por incompatibilidade de objeto."}},
        "justificativa": "Não substituir uma fonte incompatível por outra sem prova.",
        "referencias": [], "verificado_em": "2026-10-05"}
    (pasta / "correcoes-retirada.json").write_text(json.dumps({"versao": 1,
        "correcoes": [retirada]}), encoding="utf-8")
    assert build_json.main(saida) == 0
    retirada_final = next(f for f in json.loads(saida.read_text(encoding="utf-8")) if f["uf"] == "AM")
    assert "fonte_url" in retirada_final and retirada_final["fonte_url"] is None
    assert not retirada_final.get("fonte_sha256")
    assert not retirada_final.get("fonte_data_acesso")
    assert "https://" not in retirada_final["citacao_apa"]
    assert "urldate" not in retirada_final["citacao_bibtex"]
    assert not list(Draft7Validator(schema, format_checker=Draft7Validator.FORMAT_CHECKER).iter_errors(retirada_final))
    # Mudança de manifesto sem reatribuir IDs não pode omitir silenciosamente entrada.
    segunda = nova("am:segunda", "Outra experiência")
    (pasta / "novas-outra.json").write_text(json.dumps({"versao": 1, "experiencias": [segunda]}), encoding="utf-8")
    antes = saida.read_bytes()
    with pytest.raises(ValueError, match="ausentes em with_ids"):
        build_json.main(saida)
    assert saida.read_bytes() == antes


def test_execucao_nao_governamental_e_ausencia_de_fonte_sao_contratos_distintos():
    item = nova()
    item["campos"].update(esfera_formulacao="Não governamental",
                           esfera_execucao="Não governamental")
    validar_experiencias([item])
    item["campos"]["esfera_formulacao"] = "Sem informação"
    validar_experiencias([item])
    item["campos"]["fonte_url"] = None
    with pytest.raises(ValueError):
        validar_experiencias([item])
