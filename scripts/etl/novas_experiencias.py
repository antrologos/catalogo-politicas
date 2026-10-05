"""Entradas documentais normalizadas, sem editar planilhas ou replicar federais.

Contrato v1: experiencias [{chave_fonte, campos, justificativa, referencias,
verificado_em}]. A identidade usa curadoria|chave_fonte no registro existente.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import date
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

import pandas as pd
from jsonschema import Draft7Validator

from curadoria import CAMPOS_PERMITIDOS

ROOT = Path(__file__).resolve().parents[2]
PASTA = ROOT / "data/curadoria"
CHAVE_COLUNA = "curadoria_chave_fonte"
PREFIXO_CHAVE = "curadoria|"
CAMPOS_ENTRADA = (CAMPOS_PERMITIDOS | {"uf", "categorias_temas"}) - {"versao"}


def _publica(valor: object) -> bool:
    if not isinstance(valor, str):
        return False
    try:
        url = urlsplit(valor)
        host = (url.hostname or "").lower()
        return (url.scheme in {"https", "http"} and bool(host)
                and host != "localhost" and not host.endswith(".local")
                and not url.username and not url.password)
    except ValueError:
        return False


def _data(valor: object, contexto: str) -> date:
    try:
        data = date.fromisoformat(valor)
        if data.isoformat() != valor:
            raise ValueError
        return data
    except (ValueError, TypeError):
        raise ValueError(f"{contexto}: data inválida {valor!r}") from None


def validar_experiencias(experiencias: list[dict]) -> None:
    """Rejeita identidade ambígua, campos derivados e valores não normalizados."""
    schema = json.loads((ROOT / ".claude/context/policies-schema.json").read_text(encoding="utf-8"))
    vocab = json.loads((ROOT / ".claude/context/vocabulario-canonico.json").read_text(encoding="utf-8"))["campos"]
    chaves = set()
    for item in experiencias:
        if not isinstance(item, dict):
            raise ValueError("Nova experiência: entrada deve ser objeto")
        chave = item.get("chave_fonte")
        ctx = f"Nova experiência {chave!r}"
        if not isinstance(chave, str) or not re.fullmatch(r"[a-z0-9][a-z0-9:_-]{2,159}", chave):
            raise ValueError(f"{ctx}: chave_fonte inválida")
        if chave in chaves:
            raise ValueError(f"{ctx}: chave_fonte duplicada")
        chaves.add(chave)
        if set(item) != {"chave_fonte", "campos", "justificativa", "referencias", "verificado_em"}:
            raise ValueError(f"{ctx}: contrato exige chave, campos, justificativa, referências e data")
        if not isinstance(item["justificativa"], str) or not item["justificativa"].strip():
            raise ValueError(f"{ctx}: justificativa obrigatória")
        verificado = _data(item["verificado_em"], ctx)
        referencias = item["referencias"]
        if not isinstance(referencias, list) or not referencias:
            raise ValueError(f"{ctx}: referências obrigatórias")
        for ref in referencias:
            if not isinstance(ref, dict) or not _publica(ref.get("url")):
                raise ValueError(f"{ctx}: referência pública inválida")
            if not isinstance(ref.get("titulo"), str) or not ref["titulo"].strip():
                raise ValueError(f"{ctx}: título da referência obrigatório")
            if _data(ref.get("consultado_em"), ctx) > verificado:
                raise ValueError(f"{ctx}: consulta posterior à verificação")
        campos = item["campos"]
        if not isinstance(campos, dict):
            raise ValueError(f"{ctx}: campos deve ser objeto")
        for obrigatorio in ("uf", "nome", "tipo_politica", "fonte_url"):
            if not isinstance(campos.get(obrigatorio), str) or not campos[obrigatorio].strip():
                raise ValueError(f"{ctx}: campo obrigatório {obrigatorio}")
        if not any(isinstance(campos.get(k), str) and campos[k].strip()
                   for k in ("descricao_tecnica", "descricao_simples", "resumo")):
            raise ValueError(f"{ctx}: descrição obrigatória")
        if campos["uf"] not in "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO BR".split():
            raise ValueError(f"{ctx}: UF inválida")
        if not _publica(campos["fonte_url"]):
            raise ValueError(f"{ctx}: fonte_url pública obrigatória")
        if campos.get("revisado_por") is not None:
            raise ValueError(f"{ctx}: revisão automatizada não atribui autoria humana")
        for campo, valor in campos.items():
            if campo not in CAMPOS_ENTRADA:
                raise ValueError(f"{ctx}: campo protegido ou desconhecido {campo!r}")
            erro = next(Draft7Validator(
                schema["properties"][campo],
                format_checker=Draft7Validator.FORMAT_CHECKER,
            ).iter_errors(valor), None)
            if erro:
                raise ValueError(f"{ctx}/{campo}: schema inválido: {erro.message}")
            if valor is not None and campo in vocab and valor not in vocab[campo]["canonical_values"]:
                raise ValueError(f"{ctx}/{campo}: valor fora do vocabulário canônico: {valor!r}")


def carregar_novas(pasta: Path = PASTA) -> list[dict]:
    experiencias = []
    for caminho in sorted(pasta.glob("novas-*.json")):
        manifesto = json.loads(caminho.read_text(encoding="utf-8"))
        if type(manifesto.get("versao")) is not int or manifesto["versao"] != 1:
            raise ValueError(f"{caminho.name}: versao deve ser 1")
        if not isinstance(manifesto.get("experiencias"), list):
            raise ValueError(f"{caminho.name}: experiencias deve ser lista")
        experiencias.extend(manifesto["experiencias"])
    validar_experiencias(experiencias)
    # IDs iniciais das novas entradas independem da ordem dentro dos manifestos.
    return sorted(experiencias, key=lambda item: item["chave_fonte"])


def adicionar_novas(df: pd.DataFrame, experiencias: list[dict]) -> pd.DataFrame:
    """Anexa após dedupe; nenhuma chamada à replicação de fichas federais."""
    validar_experiencias(experiencias)
    from build_ids import nome_norm  # import tardio evita ciclo entre as etapas
    resultado = df.copy()
    if CHAVE_COLUNA in resultado and resultado[CHAVE_COLUNA].fillna("").astype(str).str.strip().ne("").any():
        raise ValueError("Entrada já contém experiências documentais; usar deduped.csv original")
    nomes = {(str(r.uf).strip(), nome_norm(r.nome)) for r in resultado.itertuples()}
    novos = []
    for item in sorted(experiencias, key=lambda e: e["chave_fonte"]):
        campos = item["campos"]
        nome_chave = (campos["uf"], nome_norm(campos["nome"]))
        if nome_chave in nomes:
            raise ValueError(f"Nova experiência {item['chave_fonte']}: nome/UF já presente no acervo")
        nomes.add(nome_chave)
        novos.append({
            CHAVE_COLUNA: item["chave_fonte"], "uf": campos["uf"],
            "nome": campos["nome"], "tipo_politica": campos["tipo_politica"],
            "onda": "curadoria", "federal_source_nome": "", "is_federal_replica": False,
            "link": campos["fonte_url"],
        })
    if novos:
        resultado = pd.concat([resultado, pd.DataFrame(novos)], ignore_index=True)
    return resultado


def aplicar_campos_novos(ficha: dict, linha: dict, por_chave: dict[str, dict]) -> set[str]:
    """Restaura tipos canônicos antes da proveniência; não inventa data de acesso."""
    chave = linha.get(CHAVE_COLUNA)
    if chave is None or (isinstance(chave, float) and pd.isna(chave)) or not str(chave).strip():
        return set()
    if chave not in por_chave:
        raise ValueError(f"Manifesto ausente para nova experiência {chave!r}; executar build_ids novamente")
    campos = por_chave[chave]["campos"]
    for campo in ("uf", "nome", "tipo_politica"):
        if linha.get(campo) != campos[campo]:
            raise ValueError(f"Manifesto alterado após build_ids: {chave}/{campo}")
    ficha.update(deepcopy(campos))
    ficha["revisado_por"] = None
    ficha["is_federal_replica"] = False
    ficha["federal_source_id"] = None
    return set(campos)
