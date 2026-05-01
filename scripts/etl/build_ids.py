"""C.1.e — Atribui id_interno (FRM-CP-...) e slug único a cada ficha.

- id_interno: `FRM-CP-{ano}-{eixo}-{seq:04d}`
  - ano = 2026 (ano de entrada no catálogo desta onda)
  - eixo = 3-letter code derivado de tipo_politica:
      'Educacional direta'                          → EDU
      'Trabalho/qualificação direta'                → TRAB
      'Proteção social com impacto educacional'     → PSOC
  - seq = sequencial 4 dígitos por eixo (não global) para legibilidade

- slug: lowercase ASCII + hífens; gerado de `nome` por regra determinística;
  sufixo `-2`, `-3` em colisão. Mesma política federal e suas réplicas estaduais
  têm slugs distintos por UF (ex.: `pronatec-br`, `pronatec-sp`, `pronatec-rj`).

- Substitui `federal_source_nome` por `federal_source_id` (id da federal de
  origem) — pré-requisito para consumir em build_json.

Saída: data/derived/_intermediate/with_ids.csv
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "deduped.csv"
OUT_CSV = ROOT / "data" / "derived" / "_intermediate" / "with_ids.csv"

ANO_CATALOGO = "2026"

# Mapeamento tipo_politica → eixo (3 letras canônicas, ASCII)
TIPO_TO_EIXO: dict[str, str] = {
    "Educacional direta": "EDU",
    "Trabalho/qualificação direta": "TRAB",
    "Proteção social com impacto educacional": "PSOC",
}

# Default eixo se tipo_politica não casar (não deveria acontecer; estatística mostra 100%)
EIXO_DEFAULT = "OUTR"


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


def main() -> int:
    if not IN_CSV.exists():
        print(f"ERRO: rodar dedupe.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas")

    # ─── Atribuir id_interno ────────────────────────────────────────────
    # Sequencial por eixo, ordem da planilha (estável)
    counters: dict[str, int] = {}
    ids: list[str] = []
    eixos_usados: dict[str, int] = {}
    for _, row in df.iterrows():
        tipo = str(row.get("tipo_politica", "")).strip()
        eixo = TIPO_TO_EIXO.get(tipo, EIXO_DEFAULT)
        eixos_usados[eixo] = eixos_usados.get(eixo, 0) + 1
        counters[eixo] = counters.get(eixo, 0) + 1
        seq = counters[eixo]
        ids.append(f"FRM-CP-{ANO_CATALOGO}-{eixo}-{seq:04d}")
    df["id_interno"] = ids

    print("\n  IDs por eixo:")
    for eixo, n in sorted(eixos_usados.items()):
        print(f"    {eixo}  {n:3d} fichas")

    # ─── Resolver federal_source_id ────────────────────────────────────
    # Mapa nome_normalizado → id_interno (das federais)
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

    # ─── Gerar slug único ──────────────────────────────────────────────
    # Slug = slugify(nome) + '-' + uf.lower(); limite 120 chars conforme schema.
    # Em colisão, sufixo -2, -3... Em nomes muito longos, truncar base preservando sufixo.
    SLUG_MAX = 120
    seen_slugs: dict[str, int] = {}
    slugs: list[str] = []
    for _, row in df.iterrows():
        base_full = slugify(row.get("nome", "")) or "sem-nome"
        uf = str(row.get("uf", "")).lower().strip() or "xx"
        # Reserva pra sufixo -uf e possível -N
        max_base = SLUG_MAX - len(uf) - 1 - 3  # -3 reserva para "-99" em colisão
        base = base_full[:max_base].rstrip("-")
        slug = f"{base}-{uf}"
        n = 1
        while slug in seen_slugs:
            n += 1
            slug = f"{base}-{uf}-{n}"
        if len(slug) > SLUG_MAX:
            # Caso extremo: encurtar mais
            extra = len(slug) - SLUG_MAX
            base = base[: -extra - 1].rstrip("-")
            slug = f"{base}-{uf}-{n}" if n > 1 else f"{base}-{uf}"
        seen_slugs[slug] = 1
        slugs.append(slug)
    df["slug"] = slugs

    # Verificação: nenhum duplicado?
    assert df["slug"].is_unique, "Slug duplicado após geração!"
    print(f"\n  {df['slug'].nunique()} slugs únicos gerados")

    # Limpa coluna auxiliar federal_source_nome (substituída por federal_source_id)
    df = df.drop(columns=["federal_source_nome"])

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
