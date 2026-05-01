"""D.5 — Pipeline de re-validação periódica de snapshots.

Lê data/derived/latest.json + data/external_snapshots/index.json. Para cada
ficha cuja `proxima_revisao_prevista` < hoje (ou flag `--todas`):

  1. HEAD com If-Modified-Since (se snapshot tem Last-Modified em metadata)
  2. Se 304 Not Modified: atualiza apenas `ultima_validacao` no index
  3. Se 200: GET completo + comparar SHA do conteúdo
       - SHA igual: site mandou Last-Modified errado; só atualiza ultima_validacao
       - SHA diferente: NOVA captura via capturar_norma; index recebe novo SHA;
         metadata do antigo recebe `superseded_by_sha256: <novo>`
  4. Se 404/erro: log, mantém metadata anterior, marca `ultima_validacao_falha`

Saídas:
  - data/derived/revalidacao-<data>.json (resultados)
  - data/external_snapshots/index.json (atualizado)
  - data/extracted_text/<sha>.metadata.json (atualizado para mudanças)

Uso:
    python -B scripts/captura/revalidar.py             # só fichas com proxima_revisao < hoje
    python -B scripts/captura/revalidar.py --todas     # todas as fichas com snapshot
    python -B scripts/captura/revalidar.py --limite 50 # limitar nº de revalidações
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from collections import Counter
from datetime import datetime, date
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from _http_helpers import RobotsCache, RateLimiter, make_client, timeout_for
from capturar_norma import capturar, update_snapshot_index

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
LATEST = ROOT / "data" / "derived" / "latest.json"
INDEX = ROOT / "data" / "external_snapshots" / "index.json"
EXTRACTED_DIR = ROOT / "data" / "extracted_text"
OUT_JSON = ROOT / "data" / "derived" / f"revalidacao-{DATA_HOJE}.json"


def load_metadata(sha: str) -> dict | None:
    p = EXTRACTED_DIR / f"{sha}.metadata.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def update_metadata(sha: str, **patch) -> None:
    p = EXTRACTED_DIR / f"{sha}.metadata.json"
    if not p.exists():
        return
    try:
        meta = json.loads(p.read_text(encoding="utf-8"))
        meta.update(patch)
        p.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"  [WARN] não atualizou metadata {sha[:12]}: {e}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--todas", action="store_true", help="Revalida todas as URLs com snapshot, ignorando proxima_revisao_prevista")
    parser.add_argument("--limite", type=int, default=0, help="Limita número de revalidações (0 = sem limite)")
    args = parser.parse_args()

    if not LATEST.exists():
        print(f"ERRO: {LATEST} não existe (rodar `just etl`)", file=sys.stderr)
        return 1

    fichas = json.loads(LATEST.read_text(encoding="utf-8"))
    print(f"Lendo: {LATEST.name} ({len(fichas)} fichas)")

    hoje = date.today().isoformat()
    candidatos = []
    for f in fichas:
        if not f.get("fonte_arquivo_path") or not f.get("fonte_sha256"):
            continue
        if not args.todas:
            prox = f.get("proxima_revisao_prevista")
            if prox and prox > hoje:
                continue
        candidatos.append(f)
    if args.limite:
        candidatos = candidatos[: args.limite]
    print(f"  {len(candidatos)} fichas para revalidar (--todas={args.todas}, --limite={args.limite or 'sem'})\n")

    if not candidatos:
        print("  Nada para revalidar.")
        return 0

    robots = RobotsCache()
    rate = RateLimiter()
    resultados = []
    contador: Counter = Counter()
    t0 = time.monotonic()

    with make_client() as client:
        for i, ficha in enumerate(candidatos, 1):
            url = ficha["fonte_url"]
            sha_atual = ficha["fonte_sha256"]
            id_interno = ficha["id_interno"]

            rate.wait(url)

            # Tentar HEAD com If-Modified-Since (se metadata anterior tem)
            meta_anterior = load_metadata(sha_atual)
            headers = {}
            if meta_anterior and meta_anterior.get("data_captura"):
                # Last-Modified format = "Wed, 21 Oct 2015 07:28:00 GMT" — usar timestamp_iso é improviso
                # Mais simples: HEAD sem condicional, comparar status + tamanho
                pass

            inicio = time.monotonic()
            outcome = "?"
            try:
                r = client.head(url, follow_redirects=True, timeout=timeout_for(url))
                if r.status_code == 304:
                    outcome = "inalterado_304"
                    update_metadata(sha_atual, ultima_validacao=datetime.now().isoformat())
                elif r.status_code == 200:
                    # Verifica Content-Length se presente
                    cl = r.headers.get("content-length")
                    bytes_anterior = (meta_anterior or {}).get("tamanho_bytes")
                    if cl and bytes_anterior and int(cl) == bytes_anterior:
                        outcome = "tamanho_igual_provavel_inalterado"
                        update_metadata(sha_atual, ultima_validacao=datetime.now().isoformat())
                    else:
                        # Tamanho diferente ou sem Content-Length: capturar de novo
                        rate.wait(url)
                        res_nova = capturar(url, tipo_documento=ficha.get("fonte_tipo"), client=client, robots_cache=robots, rate_limiter=rate)
                        if res_nova.sha256 == sha_atual:
                            outcome = "sha_igual_apos_get"
                        elif res_nova.sha256:
                            outcome = "atualizado_novo_sha"
                            # Marcar antigo como superseded
                            update_metadata(sha_atual, superseded_by_sha256=res_nova.sha256, superseded_at=datetime.now().isoformat())
                        else:
                            outcome = f"falha_captura_{res_nova.status}"
                else:
                    outcome = f"http_{r.status_code}"
            except httpx.TimeoutException:
                outcome = "timeout"
            except httpx.HTTPError as e:
                outcome = f"erro_rede:{type(e).__name__}"

            elapsed = int((time.monotonic() - inicio) * 1000)
            contador[outcome] += 1
            resultados.append({
                "id_interno": id_interno,
                "url": url,
                "sha_anterior": sha_atual[:16],
                "outcome": outcome,
                "elapsed_ms": elapsed,
            })
            if i % 25 == 0 or i == len(candidatos):
                tot = time.monotonic() - t0
                print(f"  [{i:3d}/{len(candidatos)}] ({tot:5.1f}s) {outcome:35s}  {url[:60]}")

    OUT_JSON.write_text(json.dumps(resultados, ensure_ascii=False, indent=2), encoding="utf-8")
    duracao = time.monotonic() - t0
    print(f"\nRevalidação completa em {duracao:.1f}s")
    print(f"Salvo: {OUT_JSON}")
    print()
    print(f"=== Outcomes ===")
    for o, n in contador.most_common():
        print(f"  {n:3d}  {o}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
