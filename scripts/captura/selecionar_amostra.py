"""C.3.b — Seleciona amostra estratificada de 20-30 URLs para captura.

Critérios:
  - Apenas URLs com status 200 ou redirect (validar_links output)
  - Estratificação por domínio: pelo menos 2 de cada um destes (se disponíveis):
      planalto.gov.br, gov.br, in.gov.br, mec.gov.br, camara.leg.br
      + 2 secretarias estaduais distintas
  - Estratificação por tipo (heurística pela URL):
      lei, decreto, portaria, instrucao_normativa, pagina_programa
  - Total alvo: 25 URLs

Saída: data/derived/amostra-captura-<data>.csv
"""
from __future__ import annotations

import json
import random
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
IN_CSV = ROOT / "data" / "derived" / f"links-validados-onda-1-{DATA_HOJE}.csv"
OUT_CSV = ROOT / "data" / "derived" / f"amostra-captura-{DATA_HOJE}.csv"
ALVO = 25

DOMINIOS_PRIORITARIOS = [
    "planalto.gov.br",
    "www.planalto.gov.br",
    "www.gov.br",
    "in.gov.br",
    "www.in.gov.br",
    "portal.mec.gov.br",
    "www.mec.gov.br",
    "www.camara.leg.br",
    "www25.senado.leg.br",
]


def infer_tipo(url: str) -> str:
    u = url.lower()
    if re.search(r"/leis?/|l\d{4,5}\.htm", u):
        return "lei"
    if re.search(r"/decreto|d\d{4,5}\.htm", u):
        return "decreto"
    if "portaria" in u:
        return "portaria"
    if "instrucao-normativa" in u or "/in/" in u:
        return "instrucao_normativa"
    if "/programas/" in u or "programa" in u:
        return "pagina_programa"
    return "outros"


def main() -> int:
    in_csv = IN_CSV
    if not in_csv.exists():
        candidatos = sorted((ROOT / "data" / "derived").glob("links-validados-onda-1-*.csv"))
        if not candidatos:
            print("ERRO: rodar validar_links.py primeiro", file=sys.stderr)
            return 1
        in_csv = candidatos[-1]

    print(f"Lendo: {in_csv}")
    df = pd.read_csv(in_csv, encoding="utf-8")
    total_inicial = len(df)
    df = df[df["status_class"].isin(["ok_200", "redirect_3xx"])].copy()
    print(f"  {len(df)}/{total_inicial} URLs com status válido (200/3xx)")

    df["tipo"] = df["url"].apply(infer_tipo)

    selecionadas: list[dict] = []
    selecionadas_urls: set[str] = set()

    random.seed(42)  # reprodutibilidade

    # Etapa 1: tentar selecionar 2 de cada domínio prioritário
    for dom in DOMINIOS_PRIORITARIOS:
        candidatos = df[df["domain"] == dom]
        n_selecionar = min(2, len(candidatos))
        if n_selecionar == 0:
            continue
        # Preferir URLs mais referenciadas
        amostra = candidatos.sort_values("n_referenciada_por", ascending=False).head(n_selecionar)
        for _, row in amostra.iterrows():
            if row["url"] not in selecionadas_urls:
                selecionadas.append(row.to_dict())
                selecionadas_urls.add(row["url"])
        print(f"  [{dom}] selecionadas {len(amostra)}")

    # Etapa 2: garantir ≥ 2 secretarias estaduais distintas (educacao.<uf>.gov.br)
    estaduais = df[df["domain"].str.contains("educacao", regex=False, na=False)]
    estaduais_por_dom = estaduais.groupby("domain").first().reset_index()
    for _, row in estaduais_por_dom.head(4).iterrows():
        if row["url"] not in selecionadas_urls:
            selecionadas.append(row.to_dict())
            selecionadas_urls.add(row["url"])

    # Etapa 3: estratificar por tipo (preencher cotas)
    by_tipo = defaultdict(int)
    for s in selecionadas:
        by_tipo[s["tipo"]] += 1

    while len(selecionadas) < ALVO:
        candidatos_restantes = df[~df["url"].isin(selecionadas_urls)]
        if candidatos_restantes.empty:
            break
        # Tipo subrepresentado primeiro
        tipos_ordenados = sorted(["lei", "decreto", "portaria", "pagina_programa", "outros"], key=lambda t: by_tipo[t])
        for tipo_alvo in tipos_ordenados:
            cands = candidatos_restantes[candidatos_restantes["tipo"] == tipo_alvo]
            if cands.empty:
                continue
            row = cands.sample(1, random_state=len(selecionadas)).iloc[0]
            selecionadas.append(row.to_dict())
            selecionadas_urls.add(row["url"])
            by_tipo[tipo_alvo] += 1
            break
        else:
            break

    print(f"\n  Total selecionado: {len(selecionadas)}")
    print(f"  Distribuição por tipo:")
    for t, n in sorted(by_tipo.items()):
        print(f"    {t:25s}  {n}")

    df_out = pd.DataFrame(selecionadas)
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df_out.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
