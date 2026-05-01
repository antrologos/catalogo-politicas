"""C.3.c — Captura amostra de URLs (saída de selecionar_amostra.py).

Para cada URL: invoca capturar_norma.capturar() compartilhando RobotsCache e
RateLimiter (eficiência). Imprime progress. Compila relatório resumido.
"""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime
from dataclasses import asdict
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from capturar_norma import capturar
from _http_helpers import RobotsCache, RateLimiter, make_client

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
IN_CSV = ROOT / "data" / "derived" / f"amostra-captura-{DATA_HOJE}.csv"
OUT_JSON = ROOT / "data" / "derived" / f"amostra-resultados-{DATA_HOJE}.json"


def main() -> int:
    in_csv = IN_CSV
    if not in_csv.exists():
        candidatos = sorted((ROOT / "data" / "derived").glob("amostra-captura-*.csv"))
        if not candidatos:
            print("ERRO: rodar selecionar_amostra.py primeiro", file=sys.stderr)
            return 1
        in_csv = candidatos[-1]

    print(f"Lendo: {in_csv}")
    df = pd.read_csv(in_csv, encoding="utf-8")
    print(f"  {len(df)} URLs para capturar\n")

    robots = RobotsCache()
    rate = RateLimiter()
    resultados = []
    t_inicio = time.monotonic()

    with make_client() as client:
        for i, row in enumerate(df.itertuples(), 1):
            url = row.url
            tipo = row.tipo
            print(f"  [{i:2d}/{len(df)}]  {tipo:18s}  {url[:70]}...")
            res = capturar(
                url, tipo_documento=tipo,
                client=client, robots_cache=robots, rate_limiter=rate
            )
            resultados.append(asdict(res))
            print(f"      -> {res.status:18s}  http={res.http_status}  bytes={res.tamanho_bytes}  texto={res.caracteres_extraidos}")

    duracao = time.monotonic() - t_inicio
    print(f"\nTempo total: {duracao:.1f}s")

    OUT_JSON.write_text(json.dumps(resultados, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Salvo: {OUT_JSON}")

    # Sumário
    from collections import Counter
    status_count = Counter(r["status"] for r in resultados)
    print(f"\n=== Sumário ===")
    for s, n in status_count.most_common():
        print(f"  {n:3d}  {s}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
