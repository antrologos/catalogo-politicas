"""C.1.d — Detecção de réplicas federais e duplicatas exatas.

Lê data/derived/_intermediate/normalized.csv. Marca:
- `is_federal_replica` (bool): ficha estadual cuja `nome` (normalizada) bate com
  alguma ficha federal (uf=BR), OU cujo campo `duvidas_revisor` contém
  marcador 'EM TODOS OS ESTADOS'.
- `federal_source_id`: nome normalizado da federal correspondente
  (placeholder; será trocado por id_interno em build_ids.py).
- `duplicada_de`: nome normalizado da primeira ocorrência da mesma ficha na
  mesma UF (ex.: BA tem 2× PRONATEC).

Saída: data/derived/_intermediate/deduped.csv
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "normalized.csv"
OUT_CSV = ROOT / "data" / "derived" / "_intermediate" / "deduped.csv"


MARCADOR_REPLICA = "EM TODOS OS ESTADOS"


def name_norm(s: object) -> str:
    """Normaliza nome para matching: lowercase + sem acentos + sem pontuação extra."""
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return ""
    s = str(s).strip()
    if not s or s.lower() == "nan":
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    # Remove tudo que não é alfanumérico ou espaço
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def main() -> int:
    if not IN_CSV.exists():
        print(f"ERRO: rodar normalize.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas")

    # 1. Mapa nome_normalizado → primeiro id_planilha (federal) — referência canônica
    federais = df[df["uf"] == "BR"].copy()
    federais["_nome_norm"] = federais["nome"].apply(name_norm)
    nomes_federais = {
        row["_nome_norm"]: row["nome"]
        for _, row in federais.iterrows()
        if row["_nome_norm"]
    }
    print(f"  {len(nomes_federais)} políticas federais únicas (referência)")

    # 2. Marcar fichas estaduais como réplicas
    df["_nome_norm"] = df["nome"].apply(name_norm)
    df["is_federal_replica"] = False
    df["federal_source_nome"] = ""

    repl_total = 0
    repl_marcador = 0
    repl_match_nome = 0
    for idx, row in df.iterrows():
        if row["uf"] == "BR":
            continue
        nn = row["_nome_norm"]
        duvidas = str(row.get("duvidas_revisor", "")).strip().upper()
        is_replica = False
        # Critério 1: marcador explícito
        if MARCADOR_REPLICA in duvidas:
            is_replica = True
            repl_marcador += 1
        # Critério 2: nome bate com federal
        if nn and nn in nomes_federais:
            is_replica = True
            if MARCADOR_REPLICA not in duvidas:
                repl_match_nome += 1
            df.at[idx, "federal_source_nome"] = nomes_federais[nn]
        df.at[idx, "is_federal_replica"] = is_replica
        if is_replica:
            repl_total += 1

    print(f"\n  {repl_total} réplicas federais marcadas")
    print(f"    via marcador 'EM TODOS OS ESTADOS': {repl_marcador}")
    print(f"    via match de nome (sem marcador):    {repl_match_nome}")

    # 3. Detectar duplicatas exatas dentro da mesma UF (BA tem 2× PRONATEC, 2× Juros)
    df["duplicada_de"] = ""
    duplicadas = 0
    for uf, grupo in df.groupby("uf"):
        seen: dict[str, str] = {}
        for idx, row in grupo.iterrows():
            nn = row["_nome_norm"]
            if not nn:
                continue
            if nn in seen:
                df.at[idx, "duplicada_de"] = seen[nn]
                duplicadas += 1
            else:
                seen[nn] = str(row.get("nome", ""))

    print(f"\n  {duplicadas} duplicatas exatas detectadas dentro da mesma UF")
    if duplicadas:
        dup_list = df[df["duplicada_de"] != ""][["uf", "nome", "duplicada_de"]]
        for _, r in dup_list.iterrows():
            print(f"    [{r['uf']}] {r['nome']!r} — duplicata de {r['duplicada_de']!r}")

    # Limpar coluna auxiliar
    df = df.drop(columns=["_nome_norm"])

    # Salvar
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")
    print(f"  {len(df)} fichas")
    print(f"  {df['is_federal_replica'].sum()} réplicas")
    print(f"  {(df['duplicada_de'] != '').sum()} duplicatas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
