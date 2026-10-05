"""C.1.g — Gera JSON canônico final a partir de data/derived/_intermediate/with_ids.csv.

Mapeia colunas internas (snake_case) para os nomes do schema
(.claude/context/policies-schema.json), calcula completude_pct, gera citações
APA/BibTeX simples e as datas da ficha. Desde 2026-10-04 as datas são reais e
o build é determinístico (regra pipeline-reproducible):
  - criado_em / atualizado_em vêm do registro (data/derived/registro_fichas.csv,
    criado por build_ids.py); atualizado_em só muda quando o hash do conteúdo
    da ficha muda;
  - fonte_data_acesso é a data da captura/validação da fonte no índice de
    snapshots (ausente quando a fonte nunca foi capturada), e
    proxima_revisao_prevista é calculada a partir dela.
Salva:

  data/derived/policies-onda-1-<YYYY-MM-DD>.json

E atualiza link/cópia 'data/derived/latest.json' (no Windows, usar cópia em vez
de symlink — Drive sync não lida bem com links).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlsplit

from curadoria import carregar_correcoes, aplicar_curadoria, snapshots_validos
from novas_experiencias import carregar_novas, aplicar_campos_novos, CHAVE_COLUNA

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "with_ids.csv"
SCHEMA = ROOT / ".claude" / "context" / "policies-schema.json"
SNAPSHOT_INDEX = ROOT / "data" / "external_snapshots" / "index.json"
CURADORIA_DIR = ROOT / "data" / "curadoria"
EXTRACTED_DIR = ROOT / "data" / "extracted_text"

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
TZ_BR = timezone(timedelta(hours=-3))
TIMESTAMP_AGORA = datetime.now(TZ_BR).isoformat(timespec="seconds")
DATA_VERSAO_CATALOGO = DATA_HOJE

OUT_JSON = ROOT / "data" / "derived" / f"policies-onda-1-{DATA_HOJE}.json"
LATEST = ROOT / "data" / "derived" / "latest.json"
REGISTRO_CSV = ROOT / "data" / "derived" / "registro_fichas.csv"

OBRA_CATALOGO = "Catálogo de Políticas da Rede EJA e Inclusão Produtiva"

# Campos que NÃO entram no hash de conteúdo: datas, derivados e proveniência
# do snapshot (mudam sem que o conteúdo levantado da política mude).
CAMPOS_FORA_DO_HASH = {
    "criado_em", "atualizado_em", "fonte_data_acesso", "proxima_revisao_prevista",
    "data_versao_catalogo", "citacao_apa", "citacao_bibtex", "completude_pct",
    "fonte_arquivo_path", "fonte_sha256", "fonte_extensao", "fonte_ocr_aplicado",
    "atribuicao", "licenca_inferida", "revisado_por",
}

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

# Atribuição pelo hostname real; portais estaduais não herdam a autoria federal.
ATRIBUICAO_POR_DOMINIO = [
    ("planalto.gov.br", "Brasil. Presidência da República. Casa Civil."),
    ("in.gov.br", "Diário Oficial da União — Imprensa Nacional"),
    ("camara.leg.br", "Câmara dos Deputados"),
    ("senado.leg.br", "Senado Federal"),
    ("mec.gov.br", "Ministério da Educação"),
    ("inep.gov.br", "INEP — Ministério da Educação"),
    ("gov.br", "Governo Federal — gov.br"),
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
    """Identifica hosts conhecidos sem casar texto de path, query ou domínio falso."""
    try:
        host = (urlsplit(url).hostname or "").lower().rstrip(".")
    except ValueError:
        return ""
    for dominio, atribuicao in ATRIBUICAO_POR_DOMINIO:
        if dominio == "gov.br":
            if host in {"gov.br", "www.gov.br"}:
                return atribuicao
        elif host == dominio or host.endswith("." + dominio):
            return atribuicao
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
    """Gera citacao_apa e citacao_bibtex a partir de campos canônicos.

    Cita a política (autoria = órgão atribuído à fonte) dentro do catálogo da
    Rede EJA. Placeholders de fonte (domínio .local) não entram como URL, e a
    data de acesso só aparece quando a fonte foi de fato acessada.
    """
    nome = ficha.get("nome", "")
    ano = ficha.get("ano_criacao", "")
    url = ficha.get("fonte_url") or ""
    if ".local/" in url:
        url = ""
    atrib = ficha.get("atribuicao") or "Brasil"
    data_acesso = ficha.get("fonte_data_acesso")
    versao = ficha.get("data_versao_catalogo", DATA_VERSAO_CATALOGO)

    # APA-like simples
    apa_partes = [atrib]
    if ano:
        apa_partes.append(f"({ano})")
    apa_partes.append(f"{nome}.")
    apa_partes.append(f"{OBRA_CATALOGO} (versão {versao}).")
    if url and data_acesso:
        apa_partes.append(f"Recuperado em {data_acesso} de {url}")
    elif url:
        apa_partes.append(url)
    citacao_apa = " ".join(apa_partes)

    # BibTeX
    chave = ficha.get("slug", "ficha").replace("-", "_")
    linhas = [
        f"@misc{{{chave},",
        f"  author       = {{{atrib}}},",
        f"  title        = {{{nome}}},",
        f"  year         = {{{ano if ano else 'n.d.'}}},",
        f"  howpublished = {{{OBRA_CATALOGO}, versão {versao}}},",
    ]
    if url:
        linhas.append(f"  url          = {{{url}}},")
    if url and data_acesso:
        linhas.append(f"  urldate      = {{{data_acesso}}},")
    linhas[-1] = linhas[-1].rstrip(",")
    citacao_bibtex = "\n".join(linhas) + "\n}"
    return citacao_apa, citacao_bibtex


def hash_conteudo(ficha: dict) -> str:
    """SHA-256 (16 hex) do conteúdo da ficha, ignorando campos voláteis."""
    conteudo = {k: v for k, v in ficha.items() if k not in CAMPOS_FORA_DO_HASH}
    bruto = json.dumps(conteudo, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(bruto.encode("utf-8")).hexdigest()[:16]


def datas_da_ficha(ficha: dict, reg: dict, hoje: str) -> tuple[str, str, str]:
    """(criado_em, atualizado_em, hash) a partir do registro da ficha.

    atualizado_em muda para `hoje` só quando o hash do conteúdo muda. Na
    primeira execução com registro (hash vazio), atualizado_em = criado_em.
    """
    novo = hash_conteudo(ficha)
    criado = reg.get("criado_em") or hoje
    anterior = reg.get("hash_conteudo") or ""
    if not anterior:
        atualizado = reg.get("atualizado_em") or criado
    elif anterior != novo:
        atualizado = hoje
    else:
        atualizado = reg.get("atualizado_em") or criado
    return criado, atualizado, novo


def data_acesso_snapshot(snap: dict) -> str | None:
    """Data (YYYY-MM-DD) do último acesso real à fonte: validação ou captura."""
    datas = [str(snap.get(k))[:10] for k in ("ultima_validacao", "data_captura") if snap.get(k)]
    return max(datas) if datas else None


def iso_meia_noite(d: str) -> str:
    """'2026-05-01' → '2026-05-01T00:00:00-03:00' (formato date-time do schema)."""
    return f"{d}T00:00:00-03:00"


def vincular_fonte(
    ficha: dict, snapshots_por_url: dict[str, dict], campos_curados: set[str] | None = None,
) -> None:
    """Refaz a proveniência pela URL atual; nenhuma data vem da curadoria."""
    curados = campos_curados or set()
    url = ficha.get("fonte_url") or ""
    if "fonte_tipo" not in curados:
        ficha["fonte_tipo"] = infer_fonte_tipo(url)
    if "atribuicao" not in curados:
        ficha["atribuicao"] = infer_atribuicao(url)
    if "licenca_inferida" not in curados:
        ficha["licenca_inferida"] = "sem_licenca_explicita"
    ficha.update({
        "fonte_arquivo_path": None, "fonte_sha256": None,
        "fonte_extensao": None, "fonte_ocr_aplicado": False,
        "fonte_data_acesso": None, "proxima_revisao_prevista": None,
    })
    snap = snapshots_por_url.get(url)
    if not snap:
        return
    sha = snap["sha256"]
    ext = snap.get("extensao") or "html"
    ficha.update({
        "fonte_arquivo_path": f"data/external_snapshots/{sha[:2]}/{sha}.{ext}",
        "fonte_sha256": sha, "fonte_extensao": ext,
        "fonte_ocr_aplicado": bool(snap.get("ocr_aplicado", False)),
        "fonte_data_acesso": data_acesso_snapshot(snap),
    })
    atribuicao = snap.get("atribuicao")
    host = (urlsplit(url).hostname or "").lower().rstrip(".")
    federal_generico_incorreto = (
        str(atribuicao or "").startswith("Governo Federal — gov.br")
        and host not in {"gov.br", "www.gov.br"}
    )
    if atribuicao and not federal_generico_incorreto and "atribuicao" not in curados:
        ficha["atribuicao"] = atribuicao
    licenca = snap.get("licenca_inferida")
    if licenca and "presumida" not in licenca.lower() and "licenca_inferida" not in curados:
        ficha["licenca_inferida"] = licenca
    if ficha["fonte_data_acesso"]:
        base = datetime.strptime(ficha["fonte_data_acesso"], "%Y-%m-%d")
        ttl = TTL_DIAS.get(ficha["fonte_tipo"], 90)
        ficha["proxima_revisao_prevista"] = (base + timedelta(days=ttl)).strftime("%Y-%m-%d")


def destino_saida(output: str | Path | None, tem_novas: bool = False) -> Path:
    """Saída opcional fica no projeto; novas entradas não sobrescrevem a onda antiga."""
    destino = Path(output) if output is not None else (
        ROOT / "data/derived" / f"policies-curadoria-{DATA_HOJE}.json" if tem_novas else OUT_JSON
    )
    if not destino.is_absolute():
        destino = ROOT / destino
    destino = destino.resolve()
    if not destino.is_relative_to(ROOT.resolve()) or destino.suffix.lower() != ".json":
        raise ValueError("Saída deve ser JSON dentro da raiz do projeto")
    if destino == LATEST.resolve():
        raise ValueError("Saída deve ser distinta de latest.json")
    return destino


def main(output: str | Path | None = None) -> int:
    novas = carregar_novas(CURADORIA_DIR)
    novas_por_chave = {item["chave_fonte"]: item for item in novas}
    campos_novos: dict[str, set[str]] = {}
    novas_encontradas: set[str] = set()
    out_json = destino_saida(output, bool(novas))
    if not IN_CSV.exists():
        print(f"ERRO: rodar build_ids.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas")

    # Ponteiros atuais do índice; capturas rejeitadas não viram proveniência.
    snapshot_by_url: dict[str, dict] = {}
    if SNAPSHOT_INDEX.exists():
        idx = json.loads(SNAPSHOT_INDEX.read_text(encoding="utf-8"))
        snapshot_by_url = snapshots_validos(idx, EXTRACTED_DIR)
        print(f"  {len(snapshot_by_url)} URLs com snapshot validado")
    correcoes = carregar_correcoes(CURADORIA_DIR)

    # Registro de fichas (criado por build_ids.py): id_interno → linha
    registro: dict[str, dict] = {}
    reg_df = None
    if REGISTRO_CSV.exists():
        reg_df = pd.read_csv(REGISTRO_CSV, encoding="utf-8", dtype=str, keep_default_na=False)
        registro = {r["id_interno"]: r for r in reg_df.to_dict("records")}
        print(f"  registro: {len(registro)} fichas")
    else:
        print("  [WARN] registro_fichas.csv ausente; criado_em/atualizado_em = hoje", file=sys.stderr)

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
            "esfera_formulacao": clean(row.get("esfera_formulacao")) or "Sem informação",
            "esfera_execucao": clean(row.get("esfera_execucao")) or clean(row.get("esfera_formulacao")) or "Sem informação",
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
            "fonte_data_acesso": None,  # data real de acesso, se houver snapshot
            "fonte_arquivo_path": None,  # preenchido abaixo se snapshot existe
            "fonte_sha256": None,
            "fonte_extensao": None,
            "fonte_ocr_aplicado": False,
            "atribuicao": atribuicao,
            "licenca_inferida": "sem_licenca_explicita",
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
            "criado_em": None,       # preenchidos abaixo a partir do registro
            "atualizado_em": None,
            "revisado_por": REVISOR_DEFAULT,
            "data_versao_catalogo": DATA_VERSAO_CATALOGO,
            "proxima_revisao_prevista": None,
        }

        campos_entrada = aplicar_campos_novos(ficha, row, novas_por_chave)
        if campos_entrada:
            novas_encontradas.add(row[CHAVE_COLUNA])
            campos_novos[ficha["id_interno"]] = campos_entrada
        vincular_fonte(ficha, snapshot_by_url, campos_entrada)
        fichas.append(ficha)

    if novas_encontradas != set(novas_por_chave):
        faltantes = sorted(set(novas_por_chave) - novas_encontradas)
        raise ValueError(f"Novas experiências ausentes em with_ids.csv: {faltantes}; executar build_ids novamente")

    # Confrontar valores anteriores no objeto canônico enriquecido. Só então
    # reaplicar a proveniência pela URL corrigida, antes de hash/datas/citações.
    fichas, campos_curados = aplicar_curadoria(fichas, correcoes)
    print(f"  curadoria: {len(correcoes)} entradas, {len(campos_curados)} fichas alcançadas")
    for posicao, ficha in enumerate(fichas):
        vincular_fonte(ficha, snapshot_by_url, campos_novos.get(ficha["id_interno"], set()) | campos_curados.get(ficha["id_interno"], set()))
        com_snapshot += bool(ficha.get("fonte_sha256"))

        # Datas da ficha a partir do registro (build_ids.py): atualizado_em só
        # muda quando o conteúdo muda.
        reg = registro.get(ficha["id_interno"], {})
        criado, atualizado, novo_hash = datas_da_ficha(ficha, reg, DATA_HOJE)
        ficha["criado_em"] = iso_meia_noite(criado)
        ficha["atualizado_em"] = iso_meia_noite(atualizado)
        if reg:
            reg.update({"criado_em": criado, "atualizado_em": atualizado, "hash_conteudo": novo_hash})

        # Completude calculada por último
        ficha["completude_pct"] = calc_completude(ficha)

        # Citações derivadas
        apa, bibtex = gerar_citacoes(ficha)
        ficha["citacao_apa"] = apa
        ficha["citacao_bibtex"] = bibtex

        # Limpeza: remover chaves None (schema aceita ausência ou null; preferir ausência para opcionais)
        # MAS preservar Nones onde schema declara `["string", "null"]`
        nullable_keys = {
            "fonte_url",
            "fonte_arquivo_path", "data_validade_fim", "supersedes_id",
            "superseded_by_id", "federal_source_id", "informacoes_complementares",
            "duvidas_revisor", "unidade_medida", "proxima_revisao_prevista", "revisado_por",
        }
        fichas[posicao] = {k: v for k, v in ficha.items() if v is not None or k in nullable_keys}

    placeholders_finais = sum(
        (urlsplit(ficha.get("fonte_url") or "").hostname or "").endswith(".local")
        for ficha in fichas
    )
    print(f"  {sem_fonte_url} registros sem fonte_url na extração original (antes da curadoria)")
    print(f"  {placeholders_finais} registros com fonte placeholder após a curadoria")
    print(f"  {com_snapshot} fichas com snapshot capturado em data/external_snapshots/")

    # Grava de volta o registro com hash e atualizado_em
    if reg_df is not None:
        cols = list(reg_df.columns)
        pd.DataFrame(list(registro.values()), columns=cols).to_csv(
            REGISTRO_CSV, index=False, encoding="utf-8", lineterminator="\n"
        )
        print(f"  registro atualizado: {REGISTRO_CSV.name}")

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(
        json.dumps(fichas, ensure_ascii=False, indent=2),
        encoding="utf-8", newline="\n"
    )
    print(f"\nSalvo: {out_json}  ({out_json.stat().st_size:,} bytes)  {len(fichas)} fichas")

    # Atualiza latest.json (cópia, não symlink — Drive sync)
    try:
        shutil.copyfile(out_json, LATEST)
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", help="JSON versionado de saída dentro do projeto; latest também é atualizado")
    sys.exit(main(parser.parse_args().output))
