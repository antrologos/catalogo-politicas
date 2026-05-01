"""D.3 — Captura completa de todas as URLs com status OK (após D.2 retry).

Lê data/derived/links-validados-onda-1-<data>-final.csv (gerado por
consolidação de validar_links + validar_links --apenas-falhas).
Para cada URL ok_200/redirect_3xx, invoca capturar() compartilhando
RobotsCache e RateLimiter.

Saída:
  - data/derived/captura-completa-<data>.json (resultados)
  - data/external_snapshots/<sha[:2]>/<sha>.<ext> (snapshots)
  - data/extracted_text/<sha>.{txt,metadata.json}
  - data/external_snapshots/index.json (atualizado a cada captura)
  - data/logs/captura_<data>.jsonl (linha por captura)

Idempotente: snapshots existentes (mesmo SHA) viram status='inalterado'.
"""
from __future__ import annotations

import json
import sys
import time
from collections import Counter
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from capturar_norma import capturar
from _http_helpers import RobotsCache, RateLimiter, make_client

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
OUT_JSON = ROOT / "data" / "derived" / f"captura-completa-{DATA_HOJE}.json"


def main() -> int:
    # Procura CSV final consolidado
    candidatos = sorted((ROOT / "data" / "derived").glob("links-validados-onda-1-*-final.csv"))
    if not candidatos:
        # Fallback: usa o original (sem retry)
        candidatos = sorted((ROOT / "data" / "derived").glob("links-validados-onda-1-*.csv"))
        candidatos = [c for c in candidatos if "retry" not in c.name and "final" not in c.name]
    if not candidatos:
        print("ERRO: rodar validar_links.py primeiro", file=sys.stderr)
        return 1
    in_csv = candidatos[-1]
    print(f"Lendo: {in_csv}")

    df = pd.read_csv(in_csv, encoding="utf-8")
    df_ok = df[df["status_class"].isin(["ok_200", "redirect_3xx"])].copy()
    print(f"  {len(df_ok)}/{len(df)} URLs com status OK para capturar\n")

    robots = RobotsCache()
    rate = RateLimiter()
    resultados = []
    status_count: Counter = Counter()
    t_inicio = time.monotonic()

    with make_client() as client:
        for i, row in enumerate(df_ok.itertuples(), 1):
            url = row.url
            try:
                res = capturar(url, client=client, robots_cache=robots, rate_limiter=rate)
                resultados.append(asdict(res))
                status_count[res.status] += 1
                status_str = res.status
                snippet = (
                    f"http={res.http_status} bytes={res.tamanho_bytes} "
                    f"ext={res.extensao} chars={res.caracteres_extraidos} "
                    f"ocr={res.ocr_aplicado} pii={res.contem_pii}"
                )
            except Exception as e:
                status_str = "EXCEPTION"
                snippet = f"{type(e).__name__}: {str(e)[:80]}"
                status_count[status_str] += 1
                resultados.append({
                    "url": url, "status": "EXCEPTION",
                    "erro_tipo": type(e).__name__, "erro_msg": str(e)[:200],
                })
            if i % 10 == 0 or i == len(df_ok):
                elapsed = time.monotonic() - t_inicio
                print(f"  [{i:3d}/{len(df_ok)}] ({elapsed:5.1f}s) {status_str:18s}  {snippet}")

    duracao = time.monotonic() - t_inicio
    print(f"\n=== Captura completa em {duracao:.1f}s ({duracao/60:.1f} min) ===")
    for s, n in status_count.most_common():
        print(f"  {n:3d}  {s}")

    OUT_JSON.write_text(json.dumps(resultados, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSalvo: {OUT_JSON}")
    print(f"Snapshots em: data/external_snapshots/  (ver index.json para o catálogo)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
