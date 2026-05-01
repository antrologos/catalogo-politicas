"""C.1.g — Gera JSON canônico final a partir de data/derived/_intermediate/with_ids.csv.

Mapeia colunas internas (snake_case) para os nomes do schema
(.claude/context/policies-schema.json), calcula completude_pct, gera citações
APA/BibTeX simples, adiciona timestamps. Salva:

  data/derived/policies-onda-1-<YYYY-MM-DD>.json

E atualiza link/cópia 'data/derived/latest.json' (no Windows, usar cópia em vez
de symlink — Drive sync não lida bem com links).
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "with_ids.csv"
SCHEMA = ROOT / ".claude" / "context" / "policies-schema.json"
SNAPSHOT_INDEX = ROOT / "data" / "external_snapshots" / "index.json"

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
TZ_BR = timezone(timedelta(hours=-3))
TIMESTAMP_AGORA = datetime.now(TZ_BR).isoformat(timespec="seconds")
DATA_VERSAO_CATALOGO = DATA_HOJE

OUT_JSON = ROOT / "data" / "derived" / f"policies-onda-1-{DATA_HOJE}.json"
LATEST = ROOT / "data" / "derived" / "latest.json"

# Defaults de revisão por padrão
REVISOR_DEFAULT = "Maria Clara Gama"

# TTL em dias por fonte_tipo (define proxima_revisao_prevista)
TTL_DIAS = {
    "lei": 365,
    "decreto": 180,
    "portaria": 90,
    "instrucao_normativa": 90,
    "resolucao": 90,
    "edital": 90,
    "pagina_programa": 30,
    "outros": 90,
}

# Atribuição padrão por domínio (substring match em fonte_url)
ATRIBUICAO_POR_DOMINIO = [
    ("planalto.gov.br", "Brasil. Presidência da República. Casa Civil."),
    ("in.gov.br", "Diário Oficial da União — Imprensa Nacional"),
    ("camara.leg.br", "Câmara dos Deputados"),
    ("senado.leg.br", "Senado Federal"),
    ("mec.gov.br", "Ministério da Educação"),
    ("inep.gov.br", "INEP — Ministério da Educação"),
    ("gov.br", "Governo Federal — gov.br (CC BY-ND 3.0)"),
    ("educacao.sp.gov.br", "Secretaria da Educação do Estado de São Paulo"),
    ("educacao.mg.gov.br", "Secretaria de Educação do Estado de Minas Gerais"),
    ("educacao.rj.gov.br", "Secretaria de Estado de Educação do Rio de Janeiro"),
    ("educacao.pr.gov.br", "Secretaria da Educação do Estado do Paraná"),
    ("educacao.rs.gov.br", "Secretaria da Educação do Estado do Rio Grande do Sul"),
    ("educacao.ba.gov.br", "Secretaria da Educação do Estado da Bahia"),
    ("educacao.pa.gov.br", "Secretaria de Estado de Educação do Pará"),
    ("educacao.pe.gov.br", "Secretaria de Educação e Esportes de Pernambuco"),
    ("educacao.ce.gov.br", "Secretaria da Educação do Estado do Ceará"),
]

# fonte_tipo inferido de fonte_url (regex/substring → enum do schema)
def infer_fonte_tipo(url: str) -> str:
    if not url:
        return "outros"
    u = url.lower()
    if re.search(r"/lei|l\d{4,5}\.htm|/leis/", u):
        return "lei"
    if re.search(r"/decreto|/d\d{4,5}\.htm", u):
        return "decreto"
    if "portaria" in u:
        return "portaria"
    if "/in/" in u or "instrucao-normativa" in u:
        return "instrucao_normativa"
    if "/resolucao" in u or "resolução" in u:
        return "resolucao"
    if "edital" in u:
        return "edital"
    if "/programas/" in u or "programa" in u:
        return "pagina_programa"
    return "outros"


def infer_atribuicao(url: str) -> str:
    """Retorna atribuição padrão para o primeiro domínio matched, ou string vazia."""
    if not url:
        return ""
    u = url.lower()
    for sub, atr in ATRIBUICAO_POR_DOMINIO:
        if sub in u:
            return atr
    return ""


def primeiro_url(s: object) -> str:
    """Extrai primeiro URL http(s) de uma string (links múltiplos separados por espaço/;)."""
    if not s or (isinstance(s, float) and pd.isna(s)):
        return ""
    s = str(s).strip()
    m = re.search(r"https?://\S+", s)
    if m:
        # Remove trailing punctuation
        return m.group(0).rstrip(",;.)")
    return ""


def empty(v: object) -> bool:
    if v is None:
        return True
    if isinstance(v, float) and pd.isna(v):
        return True
    s = str(v).strip()
    return s == "" or s.lower() == "nan"


def clean(v: object) -> str | None:
    """Converte NaN/None/string vazia/'nan' literal → None; senão retorna string limpa."""
    if empty(v):
        return None
    return str(v).strip()


def clean_list(v: object, sep: str = ";") -> list[str] | None:
    """Converte string separada por `sep` em lista; None se vazio."""
    s = clean(v)
    if not s:
        return None
    items = [x.strip() for x in s.split(sep) if x.strip()]
    return items if items else None


# Pesos de cada campo do schema para cálculo de completude_pct.
# Obrigatórios pesam 2; opcionais relevantes pesam 1.
PESOS_COMPLETUDE = {
    # Obrigatórios (peso 2)
    "id_interno": 2, "slug": 2, "nome": 2,
    "esfera_formulacao": 2, "esfera_execucao": 2, "tipo_politica": 2,
    "fonte_url": 2, "fonte_tipo": 2,
    "criado_em": 2, "atualizado_em": 2,
    # Opcionais relevantes (peso 1)
    "abrangencia_territorial": 1, "situacao_atual": 1, "ano_criacao": 1,
    "fonte_data_acesso": 1, "atribuicao": 1, "uf": 1,
    "tipo_oferta": 1, "modalidade_oferta": 1, "arranjo_logistico": 1,
    "carga_horaria": 1, "publico_alvo": 1, "fonte_financiamento": 1,
    "transferencia_recursos": 1, "orgaos_responsaveis": 1, "base_legal": 1,
    "resumo": 1, "apresentacao": 1, "informacoes_complementares": 1,
    "continuidade_governos": 1, "revisado_por": 1,
    "descricao_simples": 1, "descricao_tecnica": 1,
}


def calc_completude(ficha: dict) -> int:
    """Calcula completude_pct (0-100) com base em PESOS_COMPLETUDE."""
    total_peso = sum(PESOS_COMPLETUDE.values())
    peso_preenchido = sum(
        peso for campo, peso in PESOS_COMPLETUDE.items()
        if campo in ficha and not empty(ficha.get(campo))
    )
    return round(100 * peso_preenchido / total_peso)


def gerar_citacoes(ficha: dict) -> tuple[str, str]:
    """Gera citacao_apa e citacao_bibtex a partir de campos canônicos."""
    nome = ficha.get("nome", "")
    ano = ficha.get("ano_criacao", "")
    url = ficha.get("fonte_url", "")
    atrib = ficha.get("atribuicao", "Catálogo FRM de Políticas Públicas")
    data_acesso = ficha.get("fonte_data_acesso", DATA_HOJE)
    versao = ficha.get("data_versao_catalogo", DATA_VERSAO_CATALOGO)

    # APA-like simples
    apa_partes = []
    apa_partes.append(atrib if atrib else "Brasil")
    if ano:
        apa_partes.append(f"({ano})")
    apa_partes.append(f"{nome}.")
    apa_partes.append(f"Catálogo FRM de Políticas Públicas (versão {versao}).")
    if url:
        apa_partes.append(f"Recuperado em {data_acesso} de {url}")
    citacao_apa = " ".join(apa_partes)

    # BibTeX
    chave = ficha.get("slug", "ficha").replace("-", "_")
    citacao_bibtex = (
        f"@misc{{{chave},\n"
        f"  author       = {{{atrib if atrib else 'Brasil'}}},\n"
        f"  title        = {{{nome}}},\n"
        f"  year         = {{{ano if ano else 'n.d.'}}},\n"
        f"  howpublished = {{Catálogo FRM de Políticas Públicas, versão {versao}}},\n"
        f"  url          = {{{url}}},\n"
        f"  urldate      = {{{data_acesso}}}\n"
        f"}}"
    )
    return citacao_apa, citacao_bibtex


def main() -> int:
    if not IN_CSV.exists():
        print(f"ERRO: rodar build_ids.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas")

    # Carregar index.json de snapshots (D.4) — chave url_canonica → sha
    snapshot_by_url: dict[str, dict] = {}
    if SNAPSHOT_INDEX.exists():
        try:
            idx = json.loads(SNAPSHOT_INDEX.read_text(encoding="utf-8"))
            for sha, entry in idx.get("by_sha", {}).items():
                url_orig = entry.get("url_original")
                url_canon = entry.get("url_canonica")
                # indexar por ambos
                rec = {**entry, "sha256": sha}
                if url_orig:
                    snapshot_by_url[url_orig] = rec
                if url_canon and url_canon != url_orig:
                    snapshot_by_url[url_canon] = rec
            print(f"  {len(idx.get('by_sha', {}))} snapshots no index.json")
        except Exception as e:
            print(f"  [WARN] index.json corrompido: {e}", file=sys.stderr)
    else:
        print("  [INFO] index.json não existe; campos fonte_sha256/fonte_extensao ficam null")

    fichas: list[dict] = []
    sem_fonte_url = 0
    com_snapshot = 0

    for _, row in df.iterrows():
        nome = str(row.get("nome", "")).strip()

        # Extrair primeiro URL de `link` ou `base_legal`
        fonte_url = primeiro_url(row.get("link", ""))
        if not fonte_url:
            fonte_url = primeiro_url(row.get("base_legal", ""))
        if not fonte_url:
            fonte_url = primeiro_url(row.get("informacoes_complementares", ""))

        if not fonte_url:
            sem_fonte_url += 1
            # Schema exige fonte_url; usar placeholder até onda 2 (será re-coletado)
            fonte_url = f"https://placeholder.frm-catalogo.local/sem-fonte/{row['id_interno']}"

        fonte_tipo = infer_fonte_tipo(fonte_url)
        atribuicao = infer_atribuicao(fonte_url)

        ficha: dict = {
            "id_interno": row["id_interno"],
            "slug": row["slug"],
            "nome": nome,
            "tipo_politica": clean(row.get("tipo_politica")),
            "esfera_formulacao": clean(row.get("esfera_formulacao")),
            "esfera_execucao": clean(row.get("esfera_execucao")),
            "abrangencia_territorial": clean(row.get("abrangencia_territorial")),
            "tipo_oferta": clean(row.get("tipo_oferta")),
            "modalidade_oferta": clean(row.get("modalidade_oferta")),
            "arranjo_logistico": clean(row.get("arranjo_logistico")),
            "situacao_atual": clean(row.get("situacao_atual")) or "Sem informação",
            "ano_criacao": clean(row.get("ano_criacao")),
            "base_legal": clean(row.get("base_legal")),
            "orgaos_responsaveis": clean_list(row.get("orgaos_responsaveis_resumo")),
            "publico_alvo": None,
            "carga_horaria": clean(row.get("carga_horaria")),
            "fonte_financiamento": clean(row.get("fonte_financiamento")),
            "transferencia_recursos": clean(row.get("transferencia_recursos")),
            "integra_outras_politicas": clean_list(row.get("integra_outras_politicas")),
            "continuidade_governos": clean(row.get("continuidade_governos")),
            "fonte_url": fonte_url,
            "fonte_tipo": fonte_tipo,
            "fonte_data_acesso": DATA_HOJE,
            "fonte_arquivo_path": None,  # preenchido abaixo se snapshot existe
            "fonte_sha256": None,
            "fonte_extensao": None,
            "fonte_ocr_aplicado": False,
            "atribuicao": atribuicao,
            "licenca_inferida": "dominio_publico_lei_8_iv" if fonte_tipo in {"lei", "decreto", "portaria", "instrucao_normativa", "resolucao"} else "sem_licenca_explicita",
            "versao": None,
            "data_validade_inicio": None,
            "data_validade_fim": None,
            "supersedes_id": None,
            "superseded_by_id": None,
            "is_federal_replica": (str(row.get("is_federal_replica", "")).lower() == "true"),
            "federal_source_id": clean(row.get("federal_source_id")),
            "uf": clean(row.get("uf")),
            "categorias_temas": [],
            "unidade_medida": None,
            "descricao_simples": None,
            "descricao_tecnica": clean(row.get("apresentacao")),
            "resumo": clean(row.get("resumo")),
            "apresentacao": clean(row.get("apresentacao")),
            "informacoes_complementares": clean(row.get("informacoes_complementares")),
            "duvidas_revisor": clean(row.get("duvidas_revisor")),
            "criado_em": TIMESTAMP_AGORA,
            "atualizado_em": TIMESTAMP_AGORA,
            "revisado_por": REVISOR_DEFAULT,
            "data_versao_catalogo": DATA_VERSAO_CATALOGO,
        }

        # Próxima revisão prevista a partir do TTL
        ttl = TTL_DIAS.get(fonte_tipo, 90)
        proxima = (datetime.now(TZ_BR) + timedelta(days=ttl)).strftime("%Y-%m-%d")
        ficha["proxima_revisao_prevista"] = proxima

        # D.4: popular info de snapshot a partir do index.json
        if fonte_url in snapshot_by_url:
            snap = snapshot_by_url[fonte_url]
            sha = snap["sha256"]
            ext = snap.get("extensao") or "html"
            ficha["fonte_arquivo_path"] = f"data/external_snapshots/{sha[:2]}/{sha}.{ext}"
            ficha["fonte_sha256"] = sha
            ficha["fonte_extensao"] = ext
            ficha["fonte_ocr_aplicado"] = bool(snap.get("ocr_aplicado", False))
            # Atribuição/licença mais precisa do snapshot
            if snap.get("atribuicao"):
                ficha["atribuicao"] = snap["atribuicao"]
            if snap.get("licenca_inferida"):
                ficha["licenca_inferida"] = snap["licenca_inferida"]
            com_snapshot += 1

        # Completude calculada por último
        ficha["completude_pct"] = calc_completude(ficha)

        # Citações derivadas
        apa, bibtex = gerar_citacoes(ficha)
        ficha["citacao_apa"] = apa
        ficha["citacao_bibtex"] = bibtex

        # Limpeza: remover chaves None (schema aceita ausência ou null; preferir ausência para opcionais)
        # MAS preservar Nones onde schema declara `["string", "null"]`
        nullable_keys = {
            "fonte_arquivo_path", "data_validade_fim", "supersedes_id",
            "superseded_by_id", "federal_source_id", "informacoes_complementares",
            "duvidas_revisor", "unidade_medida", "proxima_revisao_prevista",
        }
        ficha = {k: v for k, v in ficha.items() if v is not None or k in nullable_keys}

        fichas.append(ficha)

    print(f"  {sem_fonte_url} fichas sem fonte_url (placeholder gerado)")
    print(f"  {com_snapshot} fichas com snapshot capturado em data/external_snapshots/")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(
        json.dumps(fichas, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nSalvo: {OUT_JSON}  ({OUT_JSON.stat().st_size:,} bytes)  {len(fichas)} fichas")

    # Atualiza latest.json (cópia, não symlink — Drive sync)
    try:
        shutil.copyfile(OUT_JSON, LATEST)
        print(f"Latest atualizado: {LATEST}")
    except Exception as e:
        print(f"  [WARN] não consegui atualizar latest.json: {e}", file=sys.stderr)

    # Estatísticas de completude
    completudes = [f["completude_pct"] for f in fichas]
    print(f"\nCompletude (0-100):")
    print(f"  média:  {sum(completudes)/len(completudes):.1f}")
    print(f"  mediana: {sorted(completudes)[len(completudes)//2]}")
    print(f"  min:     {min(completudes)}")
    print(f"  max:     {max(completudes)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
