"""Curadoria declarativa versionada, aplicada depois da atribuição de IDs.

Contrato v1: correcoes com id_interno, campos {anterior, novo}, justificativa,
referencias [{url, titulo, consultado_em}] e verificado_em. Não grava dados.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import date
import json
from pathlib import Path
from urllib.parse import urlsplit

from jsonschema import Draft7Validator

CAMPOS_PERMITIDOS = frozenset({
    "nome", "tipo_politica", "esfera_formulacao", "esfera_execucao",
    "abrangencia_territorial", "tipo_oferta", "modalidade_oferta",
    "arranjo_logistico", "situacao_atual", "ano_criacao", "base_legal",
    "orgaos_responsaveis", "publico_alvo", "carga_horaria", "unidade_medida",
    "fonte_financiamento", "transferencia_recursos", "integra_outras_politicas",
    "continuidade_governos", "descricao_simples", "descricao_tecnica",
    "resumo", "apresentacao", "informacoes_complementares", "duvidas_revisor",
    "fonte_url", "fonte_tipo", "atribuicao", "licenca_inferida", "revisado_por",
    "versao", "data_validade_inicio", "data_validade_fim",
})
SCHEMA = Path(__file__).resolve().parents[2] / ".claude/context/policies-schema.json"


def carregar_correcoes(pasta: Path) -> list[dict]:
    """Lê manifestos em ordem de data/nome; ausência da pasta não altera o ETL."""
    correcoes = []
    for caminho in sorted(pasta.glob("correcoes-*.json")):
        manifesto = json.loads(caminho.read_text(encoding="utf-8"))
        if type(manifesto.get("versao")) is not int or manifesto["versao"] != 1:
            raise ValueError(f"Curadoria {caminho.name}: versao deve ser 1")
        entradas = manifesto.get("correcoes")
        if not isinstance(entradas, list):
            raise ValueError(f"Curadoria {caminho.name}: correcoes deve ser uma lista")
        ids = [item.get("id_interno") for item in entradas if isinstance(item, dict)]
        if len(ids) != len(entradas) or len(ids) != len(set(ids)):
            raise ValueError(f"Curadoria {caminho.name}: entradas inválidas ou ID repetido")
        correcoes.extend(entradas)
    return correcoes


def _data(valor: object, contexto: str) -> date:
    if not isinstance(valor, str):
        raise ValueError(f"{contexto}: data deve ser YYYY-MM-DD")
    try:
        resultado = date.fromisoformat(valor)
        if resultado.isoformat() != valor:
            raise ValueError
        return resultado
    except ValueError as erro:
        raise ValueError(f"{contexto}: data inválida {valor!r}") from erro


def _url_publica(valor: object) -> bool:
    if not isinstance(valor, str):
        return False
    try:
        url = urlsplit(valor)
        host = url.hostname or ""
        return (
            url.scheme in {"http", "https"} and bool(host)
            and not url.username and not url.password
            and host != "localhost" and not host.endswith(".local")
        )
    except ValueError:
        return False


def _validar_correcao(correcao: dict, propriedades: dict) -> None:
    contexto = f"Curadoria {correcao.get('id_interno', '?')}"
    if not isinstance(correcao.get("justificativa"), str) or not correcao["justificativa"].strip():
        raise ValueError(f"{contexto}: justificativa obrigatória")
    verificado = _data(correcao.get("verificado_em"), contexto)
    referencias = correcao.get("referencias")
    if not isinstance(referencias, list) or not referencias:
        raise ValueError(f"{contexto}: referências obrigatórias")
    for referencia in referencias:
        if not isinstance(referencia, dict) or not _url_publica(referencia.get("url")):
            raise ValueError(f"{contexto}: URL de referência inválida")
        if not isinstance(referencia.get("titulo"), str) or not referencia["titulo"].strip():
            raise ValueError(f"{contexto}: título da referência obrigatório")
        if _data(referencia.get("consultado_em"), contexto) > verificado:
            raise ValueError(f"{contexto}: consulta posterior à verificação")
    campos = correcao.get("campos")
    if not isinstance(campos, dict) or not campos:
        raise ValueError(f"{contexto}: campos obrigatórios")
    for campo, mudanca in campos.items():
        if campo not in CAMPOS_PERMITIDOS:
            raise ValueError(f"{contexto}: campo protegido ou desconhecido {campo!r}")
        if not isinstance(mudanca, dict) or set(mudanca) != {"anterior", "novo"}:
            raise ValueError(f"{contexto}/{campo}: informar anterior e novo")
        validador = Draft7Validator(
            propriedades[campo], format_checker=Draft7Validator.FORMAT_CHECKER,
        )
        erro = next(validador.iter_errors(mudanca["novo"]), None)
        if erro:
            raise ValueError(f"{contexto}/{campo}: novo valor inválido: {erro.message}")
        if campo == "fonte_url" and not _url_publica(mudanca["novo"]):
            raise ValueError(f"{contexto}: fonte_url deve ser URL pública")


def aplicar_curadoria(
    fichas: list[dict], correcoes: list[dict], schema: dict | None = None,
) -> tuple[list[dict], dict[str, set[str]]]:
    """Retorna cópia curada + campos explícitos por ID, sem mutar a entrada.

    Uma correção federal propaga somente seus campos às réplicas vinculadas.
    Valor já igual ao novo é aceito, tornando a reaplicação idempotente.
    """
    resultado = deepcopy(fichas)
    por_id = {f["id_interno"]: f for f in resultado}
    if len(por_id) != len(resultado):
        raise ValueError("Curadoria: id_interno duplicado na entrada")
    propriedades = (schema or json.loads(SCHEMA.read_text(encoding="utf-8")))["properties"]
    curados: dict[str, set[str]] = {}
    for correcao in correcoes:
        _validar_correcao(correcao, propriedades)
        id_ = correcao.get("id_interno")
        if id_ not in por_id:
            raise ValueError(f"Curadoria: ID inexistente {id_!r}")
        origem = por_id[id_]
        for campo, mudanca in correcao["campos"].items():
            atual = origem.get(campo)
            if atual != mudanca["anterior"] and atual != mudanca["novo"]:
                raise ValueError(
                    f"Curadoria {id_}/{campo}: valor anterior divergente; "
                    f"esperado {mudanca['anterior']!r}, encontrado {atual!r}"
                )
        alvos = [origem]
        if origem.get("uf") == "BR" and not origem.get("is_federal_replica"):
            alvos.extend(f for f in resultado if f.get("is_federal_replica")
                         and f.get("federal_source_id") == id_)
        for alvo in alvos:
            campos = curados.setdefault(alvo["id_interno"], set())
            for campo, mudanca in correcao["campos"].items():
                alvo[campo] = deepcopy(mudanca["novo"])
                campos.add(campo)
    return resultado, curados


def snapshots_validos(indice: dict, pasta_metadados: Path) -> dict[str, dict]:
    """Resolve URLs pelo ponteiro atual by_url, nunca pela ordem de by_sha.

    Índices legados sem status exigem comprovação no metadado por SHA. Falhas
    explícitas em qualquer dos dois são rejeitadas; não há captura implícita.
    """
    por_sha = indice.get("by_sha", {})
    por_url = indice.get("by_url", {})
    validos: dict[str, dict] = {}
    for sha, entrada in por_sha.items():
        if not isinstance(entrada, dict):
            continue
        metadata = {}
        caminho = pasta_metadados / f"{sha}.metadata.json"
        if caminho.is_file():
            try:
                metadata = json.loads(caminho.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
        estados = [valor for valor in (entrada.get("status"), metadata.get("status")) if valor]
        if not estados or any(estado not in {"ok", "inalterado"} for estado in estados):
            continue
        validos[sha] = {**entrada, "sha256": sha}

    resultado = {
        url: validos[sha] for url, sha in por_url.items() if sha in validos
    }
    # Índices antigos guardam só a URL final em by_url. Recuperar aliases
    # originais exige que o destino canônico ainda aponte para captura válida.
    aliases: dict[str, set[str]] = {}
    for entrada in por_sha.values():
        original = entrada.get("url_original")
        canonica = entrada.get("url_canonica")
        atual = por_url.get(canonica)
        if original and original not in por_url and atual in validos:
            aliases.setdefault(original, set()).add(atual)
    for url, candidatos in aliases.items():
        if len(candidatos) == 1:
            resultado[url] = validos[next(iter(candidatos))]
    return resultado
