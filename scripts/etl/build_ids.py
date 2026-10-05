"""C.1.e — Atribui id_interno (FRM-CP-...) e slug único a cada ficha.

- id_interno: `FRM-CP-{ano}-{eixo}-{seq:04d}`
  - ano = 2026 (ano de entrada no catálogo desta onda)
  - eixo = 3-letter code derivado de tipo_politica:
      'Educacional'                                 → EDU
      'Trabalho e qualificação'                     → TRAB
      'Proteção social com impacto educacional'     → PSOC
  - seq = sequencial 4 dígitos por eixo (não global) para legibilidade

- slug: lowercase ASCII + hífens; gerado de `nome` por regra determinística;
  sufixo `-2`, `-3` em colisão. Mesma política federal e suas réplicas estaduais
  têm slugs distintos por UF (ex.: `pronatec-br`, `pronatec-sp`, `pronatec-rj`).

- Registro persistente (data/derived/registro_fichas.csv, desde 2026-10-04):
  cada ficha é identificada por `uf|nome normalizado|ocorrência`. Fichas já
  registradas mantêm id_interno e slug mesmo se a ordem das linhas mudar; as
  novas recebem o próximo número do eixo e a data do processamento como
  criado_em. IDs e slugs nunca são reaproveitados: ficha que some da planilha
  fica com `ativo=False`. Sem registro (primeira execução), a numeração segue a
  ordem de entrada — o mesmo resultado de antes — e criado_em é a data da onda.

- Substitui `federal_source_nome` por `federal_source_id` (id da federal de
  origem) — pré-requisito para consumir em build_json.

Saída: data/derived/_intermediate/with_ids.csv + data/derived/registro_fichas.csv
"""
from __future__ import annotations

import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd

from novas_experiencias import carregar_novas, adicionar_novas, CHAVE_COLUNA, PREFIXO_CHAVE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "deduped.csv"
OUT_CSV = ROOT / "data" / "derived" / "_intermediate" / "with_ids.csv"
REGISTRO_CSV = ROOT / "data" / "derived" / "registro_fichas.csv"

ANO_CATALOGO = "2026"

# Mapeamento tipo_politica → eixo (3 letras canônicas, ASCII)
TIPO_TO_EIXO: dict[str, str] = {
    "Educacional": "EDU",
    "Trabalho e qualificação": "TRAB",
    "Proteção social com impacto educacional": "PSOC",
}

# Default eixo se tipo_politica não casar (não deveria acontecer; estatística mostra 100%)
EIXO_DEFAULT = "OUTR"

# Data de entrada de cada onda no catálogo (criado_em das fichas pré-registro)
DATAS_ONDA: dict[str, str] = {"1": "2026-05-01", "2": "2026-05-13", "3": "2026-10-04"}

COLUNAS_REGISTRO = [
    "chave", "id_interno", "slug", "uf", "nome", "onda",
    "criado_em", "atualizado_em", "hash_conteudo", "ativo",
]

SLUG_MAX = 120


def slugify(s: object) -> str:
    """Converte string para slug URL-safe: lowercase ASCII + hífens."""
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    s = str(s).strip()
    if not s or s.lower() == "nan":
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    s = re.sub(r"-{2,}", "-", s)
    return s[:120]  # limite do schema


def nome_norm(s: object) -> str:
    """Nome normalizado para a chave do registro (mesma regra do dedupe)."""
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    s = unicodedata.normalize("NFKD", str(s).strip())
    s = s.encode("ascii", "ignore").decode("ascii").lower()
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def chaves(df: pd.DataFrame) -> list[str]:
    """Chave estável por linha: uf|nome normalizado|n-ésima ocorrência."""
    contagem: dict[str, int] = {}
    out: list[str] = []
    for i, (uf, nome) in enumerate(zip(df["uf"], df["nome"])):
        fonte = df[CHAVE_COLUNA].iat[i] if CHAVE_COLUNA in df else None
        if fonte is not None and not pd.isna(fonte) and str(fonte).strip():
            out.append(PREFIXO_CHAVE + str(fonte).strip())
            continue
        base = f"{str(uf).strip()}|{nome_norm(nome)}"
        contagem[base] = contagem.get(base, 0) + 1
        out.append(f"{base}|{contagem[base]}")
    if len(out) != len(set(out)):
        raise ValueError("Chave de identidade duplicada")
    return out


def gerar_slug(nome: object, uf: object, usados: set[str]) -> str:
    """slugify(nome)-uf, com sufixo -2, -3... se já usado; respeita 120 chars."""
    base_full = slugify(nome) or "sem-nome"
    uf = str(uf or "").lower().strip() or "xx"
    max_base = SLUG_MAX - len(uf) - 1 - 3  # -3 reserva para "-99" em colisão
    base = base_full[:max_base].rstrip("-")
    slug = f"{base}-{uf}"
    n = 1
    while slug in usados:
        n += 1
        slug = f"{base}-{uf}-{n}"
    if len(slug) > SLUG_MAX:
        extra = len(slug) - SLUG_MAX
        base = base[: -extra - 1].rstrip("-")
        slug = f"{base}-{uf}-{n}" if n > 1 else f"{base}-{uf}"
    usados.add(slug)
    return slug


def _eixo(tipo: object) -> str:
    return TIPO_TO_EIXO.get(str(tipo or "").strip(), EIXO_DEFAULT)


def atribuir_ids(
    df: pd.DataFrame, registro: pd.DataFrame | None, hoje: str
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Atribui id_interno e slug a cada linha, usando e atualizando o registro.

    Retorna (df com id_interno/slug, registro atualizado).
    """
    df = df.copy()
    df["_chave"] = chaves(df)
    onda = df["onda"] if "onda" in df.columns else pd.Series([""] * len(df))

    if registro is None or registro.empty:
        reg = pd.DataFrame(columns=COLUNAS_REGISTRO)
    else:
        reg = registro.copy()
        for col in COLUNAS_REGISTRO:
            if col not in reg.columns:
                reg[col] = ""
    reg = reg.fillna("")
    por_chave = {r.chave: i for i, r in enumerate(reg.itertuples())}

    usados = set(reg["slug"])
    max_seq: dict[str, int] = {}
    for id_ in reg["id_interno"]:
        m = re.match(rf"FRM-CP-{ANO_CATALOGO}-([A-Z]+)-(\d{{4}})$", str(id_))
        if m:
            max_seq[m.group(1)] = max(max_seq.get(m.group(1), 0), int(m.group(2)))

    primeira_execucao = reg.empty
    ids: list[str] = []
    slugs: list[str] = []
    novas: list[dict] = []
    for i, row in enumerate(df.itertuples(index=False)):
        chave = df["_chave"].iat[i]
        if chave in por_chave:
            r = reg.iloc[por_chave[chave]]
            if chave.startswith(PREFIXO_CHAVE) and r["uf"] != getattr(row, "uf", ""):
                raise ValueError(f"UF alterada para chave persistente {chave}")
            ids.append(r["id_interno"])
            slugs.append(r["slug"])
            continue
        eixo = _eixo(getattr(row, "tipo_politica", ""))
        max_seq[eixo] = max_seq.get(eixo, 0) + 1
        id_ = f"FRM-CP-{ANO_CATALOGO}-{eixo}-{max_seq[eixo]:04d}"
        slug = gerar_slug(getattr(row, "nome", ""), getattr(row, "uf", ""), usados)
        o = str(onda.iat[i] or "")
        criado = DATAS_ONDA.get(o, hoje) if primeira_execucao else hoje
        ids.append(id_)
        slugs.append(slug)
        novas.append({
            "chave": chave, "id_interno": id_, "slug": slug,
            "uf": getattr(row, "uf", ""), "nome": getattr(row, "nome", ""), "onda": o,
            "criado_em": criado, "atualizado_em": criado, "hash_conteudo": "", "ativo": "True",
        })

    if novas:
        reg = pd.concat([reg, pd.DataFrame(novas, columns=COLUNAS_REGISTRO)], ignore_index=True)
    presentes = set(df["_chave"])
    reg["ativo"] = reg["chave"].map(lambda c: "True" if c in presentes else "False")

    df["id_interno"] = ids
    df["slug"] = slugs
    df = df.drop(columns=["_chave"])
    return df, reg[COLUNAS_REGISTRO]


def main() -> int:
    if not IN_CSV.exists():
        print(f"ERRO: rodar dedupe.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas")

    registro = None
    if REGISTRO_CSV.exists():
        registro = pd.read_csv(REGISTRO_CSV, encoding="utf-8", dtype=str, keep_default_na=False)
        print(f"  registro: {len(registro)} fichas conhecidas ({REGISTRO_CSV.name})")
    else:
        print("  registro ausente: primeira execução, numeração pela ordem de entrada")

    experiencias = carregar_novas()
    df = adicionar_novas(df, experiencias)
    print(f"  {len(experiencias)} experiências documentais adicionadas sem replicação")

    hoje = datetime.now().strftime("%Y-%m-%d")
    n_antes = 0 if registro is None else len(registro)
    df, registro = atribuir_ids(df, registro, hoje)

    eixos = df["id_interno"].str.extract(r"FRM-CP-\d{4}-([A-Z]+)-")[0].value_counts().sort_index()
    print("\n  IDs por eixo:")
    for eixo, n in eixos.items():
        print(f"    {eixo}  {n:3d} fichas")
    print(f"  {len(registro) - n_antes} fichas novas no registro; "
          f"{(registro['ativo'] == 'False').sum()} inativas")

    # ─── Resolver federal_source_id ────────────────────────────────────
    # Mapa nome → id_interno (das federais)
    federais = df[df["uf"] == "BR"]
    nome_to_id: dict[str, str] = {}
    for _, row in federais.iterrows():
        nome = str(row.get("nome", "")).strip()
        if nome:
            nome_to_id[nome] = row["id_interno"]
    print(f"\n  {len(nome_to_id)} federais mapeadas para resolução de federal_source_id")

    df["federal_source_id"] = df["federal_source_nome"].map(
        lambda n: nome_to_id.get(str(n).strip(), "") if n else ""
    )
    n_resolvidos = (df["federal_source_id"] != "").sum()
    print(f"  {n_resolvidos} fichas com federal_source_id resolvido")

    # Verificação: nenhum duplicado?
    assert df["slug"].is_unique, "Slug duplicado após geração!"
    assert df["id_interno"].is_unique, "id_interno duplicado após geração!"
    print(f"\n  {df['slug'].nunique()} slugs únicos")

    # Limpa coluna auxiliar federal_source_nome (substituída por federal_source_id)
    df = df.drop(columns=["federal_source_nome"])

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    registro.to_csv(REGISTRO_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")
    print(f"Salvo: {REGISTRO_CSV}  ({len(registro)} fichas)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
