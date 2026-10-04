"""C.2.c — Consolida a validação de links do dia num CSV "final".

Junta `links-validados-onda-1-<hoje>.csv` (validação completa) com
`links-validados-onda-1-<hoje>-retry.csv` (nova tentativa só das falhas, se
existir): para cada URL retentada, vale o resultado da nova tentativa.

Saída: data/derived/links-validados-onda-1-<hoje>-final.csv, que é a entrada de
capturar_completo.py (ele usa o "-final" mais recente).

Uso: python -B scripts/captura/consolidar_links.py [YYYY-MM-DD]
"""
from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
DERIVED = ROOT / "data" / "derived"


def consolidar(base: pd.DataFrame, retry: pd.DataFrame | None) -> pd.DataFrame:
    """Substitui as linhas de `base` pelas de `retry` com a mesma URL."""
    if retry is None or retry.empty:
        return base.copy()
    b = base.set_index("url")
    b.update(retry.set_index("url"))
    return b.reset_index()[base.columns]


def main() -> int:
    dia = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime("%Y-%m-%d")
    base_p = DERIVED / f"links-validados-onda-1-{dia}.csv"
    retry_p = DERIVED / f"links-validados-onda-1-{dia}-retry.csv"
    final_p = DERIVED / f"links-validados-onda-1-{dia}-final.csv"
    if not base_p.exists():
        print(f"ERRO: rodar validar_links.py primeiro (ausente: {base_p.name})", file=sys.stderr)
        return 1
    base = pd.read_csv(base_p, encoding="utf-8")
    retry = pd.read_csv(retry_p, encoding="utf-8") if retry_p.exists() else None
    final = consolidar(base, retry)
    final.to_csv(final_p, index=False, encoding="utf-8")
    ok = final["status_class"].isin(["ok_200", "redirect_3xx"]).sum()
    print(f"Salvo: {final_p.name} — {len(final)} URLs, {ok} acessíveis "
          f"({'com' if retry is not None else 'sem'} nova tentativa)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
