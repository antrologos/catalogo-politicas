"""C.2.b — Valida ~182 links externos via HEAD respeitoso.

Lê data/derived/links-onda-1-<data>.json (saída de extract_links.py). Para cada
URL única, faz HEAD respeitando robots.txt + rate-limit por domínio (R3 da
captura-responsavel). Classifica por status (200/30x/403/404/5xx/timeout/erro).
Se HEAD retornar 403/405/501, tenta GET (gov.br tem WAF anti-HEAD).

Flags:
  --apenas-falhas: lê links-validados-onda-1-*.csv e revalida só os não-2xx/3xx
                   (escreve <basename>-retry.csv)

Saídas:
  - data/derived/links-validados-onda-1-<data>.csv (uma linha por URL)
  - data/derived/links-validados-relatorio-<data>.md (sumário por status/domínio)
  - data/logs/captura_validacao_<data>.jsonl (log auditável; uma linha por request)
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse

import httpx

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from _http_helpers import RobotsCache, RateLimiter, make_client, USER_AGENT

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
TZ_BR = timezone(timedelta(hours=-3))

IN_JSON = ROOT / "data" / "derived" / f"links-onda-1-{DATA_HOJE}.json"
# Paths default (sem suffix); main() substitui se --apenas-falhas
DEFAULT_OUT_CSV = ROOT / "data" / "derived" / f"links-validados-onda-1-{DATA_HOJE}.csv"
DEFAULT_OUT_REPORT = ROOT / "data" / "derived" / f"links-validados-relatorio-{DATA_HOJE}.md"
DEFAULT_LOG_PATH = ROOT / "data" / "logs" / f"captura_validacao_{DATA_HOJE}.jsonl"


def classify_status(s: int) -> str:
    if 200 <= s < 300:
        return "ok_200"
    if 300 <= s < 400:
        return "redirect_3xx"
    if s == 403:
        return "forbidden_403"
    if s == 404:
        return "not_found_404"
    if 400 <= s < 500:
        return f"client_err_{s}"
    if 500 <= s < 600:
        return f"server_err_{s}"
    return f"other_{s}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apenas-falhas", action="store_true",
        help="Lê links-validados-onda-1-*.csv mais recente e revalida só os não-2xx/3xx",
    )
    args = parser.parse_args()

    # Modo apenas-falhas: lê CSV anterior e filtra
    if args.apenas_falhas:
        import pandas as pd
        candidatos_csv = sorted((ROOT / "data" / "derived").glob("links-validados-onda-1-*.csv"))
        candidatos_csv = [c for c in candidatos_csv if "-retry" not in c.name]
        if not candidatos_csv:
            print("ERRO: nenhum links-validados-onda-1-*.csv encontrado", file=sys.stderr)
            return 1
        in_csv = candidatos_csv[-1]
        print(f"Lendo (apenas falhas): {in_csv}")
        df_prev = pd.read_csv(in_csv, encoding="utf-8")
        falhas = df_prev[~df_prev["status_class"].isin(["ok_200", "redirect_3xx"])].copy()
        links = [
            {"url": r.url, "n_referenciada_por": int(r.n_referenciada_por or 0)}
            for r in falhas.itertuples()
        ]
        print(f"  {len(links)} URLs falhas para revalidar")
        suffix = "-retry"
    else:
        # Resolve último arquivo (caso a data não bata)
        in_json = IN_JSON
        if not in_json.exists():
            candidatos = sorted((ROOT / "data" / "derived").glob("links-onda-1-*.json"))
            if not candidatos:
                print("ERRO: rodar extract_links.py primeiro", file=sys.stderr)
                return 1
            in_json = candidatos[-1]
            print(f"  [usando arquivo mais recente: {in_json.name}]")

        print(f"Lendo: {in_json}")
        links = json.loads(in_json.read_text(encoding="utf-8"))
        print(f"  {len(links)} URLs únicas para validar")
        suffix = ""
    print(f"  User-Agent: {USER_AGENT}\n")

    OUT_CSV = DEFAULT_OUT_CSV.with_name(DEFAULT_OUT_CSV.stem + suffix + DEFAULT_OUT_CSV.suffix)
    OUT_REPORT = DEFAULT_OUT_REPORT.with_name(DEFAULT_OUT_REPORT.stem + suffix + DEFAULT_OUT_REPORT.suffix)
    LOG_PATH = DEFAULT_LOG_PATH.with_name(DEFAULT_LOG_PATH.stem + suffix + DEFAULT_LOG_PATH.suffix)

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    log_fh = open(LOG_PATH, "w", encoding="utf-8", buffering=1)

    robots_cache = RobotsCache()
    rate_limiter = RateLimiter()
    resultados: list[dict] = []
    status_counter: Counter = Counter()
    domain_status: dict[str, Counter] = defaultdict(Counter)

    t_inicio = time.monotonic()

    with make_client() as client:
        for i, link in enumerate(links, 1):
            url = link["url"]
            host = urlparse(url).netloc.lower() or "(sem-host)"

            # Robots
            robots = robots_cache.check(url, client)
            if robots.crawl_delay:
                rate_limiter.set_delay(host, robots.crawl_delay)

            if not robots.allowed:
                rec = {
                    "url": url, "domain": host,
                    "status_code": None, "status_class": "bloqueado_robots",
                    "url_final": None, "elapsed_ms": 0,
                    "n_referenciada_por": link["n_referenciada_por"],
                    "erro": None,
                }
                resultados.append(rec)
                status_counter["bloqueado_robots"] += 1
                domain_status[host]["bloqueado_robots"] += 1
                log_fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
                if i % 25 == 0:
                    print(f"  [{i:3d}/{len(links)}]  {host}  [bloqueado_robots]")
                continue

            # Rate limit
            rate_limiter.wait(url)

            t0 = time.monotonic()
            try:
                r = client.head(url, follow_redirects=True)
                elapsed_ms = int((time.monotonic() - t0) * 1000)
                code = r.status_code
                cls = classify_status(code)
                # Alguns servers respondem mal a HEAD; tentar GET se 403/405/501
                # (gov.br tem WAF que bloqueia HEAD mas aceita GET)
                if code in (403, 405, 501):
                    try:
                        r = client.get(url, follow_redirects=True)
                        elapsed_ms = int((time.monotonic() - t0) * 1000)
                        code = r.status_code
                        cls = classify_status(code)
                    except Exception:
                        cls = "erro_get_apos_head"
                rec = {
                    "url": url, "domain": host,
                    "status_code": code, "status_class": cls,
                    "url_final": str(r.url),
                    "elapsed_ms": elapsed_ms,
                    "n_referenciada_por": link["n_referenciada_por"],
                    "erro": None,
                }
            except httpx.TimeoutException:
                rec = {
                    "url": url, "domain": host,
                    "status_code": None, "status_class": "timeout",
                    "url_final": None,
                    "elapsed_ms": int((time.monotonic() - t0) * 1000),
                    "n_referenciada_por": link["n_referenciada_por"],
                    "erro": "TimeoutException",
                }
            except httpx.HTTPError as e:
                rec = {
                    "url": url, "domain": host,
                    "status_code": None, "status_class": "erro_rede",
                    "url_final": None,
                    "elapsed_ms": int((time.monotonic() - t0) * 1000),
                    "n_referenciada_por": link["n_referenciada_por"],
                    "erro": type(e).__name__ + ": " + str(e)[:160],
                }
            except Exception as e:
                rec = {
                    "url": url, "domain": host,
                    "status_code": None, "status_class": "erro_inesperado",
                    "url_final": None,
                    "elapsed_ms": int((time.monotonic() - t0) * 1000),
                    "n_referenciada_por": link["n_referenciada_por"],
                    "erro": type(e).__name__ + ": " + str(e)[:160],
                }

            resultados.append(rec)
            status_counter[rec["status_class"]] += 1
            domain_status[host][rec["status_class"]] += 1
            log_fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

            if i % 25 == 0 or i == len(links):
                print(f"  [{i:3d}/{len(links)}]  {host[:40]:<40s}  {rec['status_class']:<25s}  ({rec['elapsed_ms']}ms)")

    log_fh.close()
    duracao = time.monotonic() - t_inicio

    # CSV
    import pandas as pd
    pd.DataFrame(resultados).to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo CSV: {OUT_CSV}")

    # Relatório markdown
    relatorio = []
    relatorio.append(f"# Validação de links — onda 1 — {DATA_HOJE}")
    relatorio.append(f"\nGerado em {datetime.now(TZ_BR).isoformat(timespec='seconds')}")
    relatorio.append(f"\nUser-Agent: `{USER_AGENT}`")
    relatorio.append(f"\n**Tempo total:** {duracao:.1f}s ({len(links)} URLs em {len(domain_status)} domínios)\n")
    relatorio.append(f"## Status agregado\n")
    relatorio.append(f"| Status | Contagem | % |")
    relatorio.append(f"|---|---:|---:|")
    total = sum(status_counter.values())
    for s, n in status_counter.most_common():
        relatorio.append(f"| `{s}` | {n} | {100*n/total:.1f}% |")

    relatorio.append(f"\n## Top 10 domínios por nº de URLs\n")
    relatorio.append(f"| Domínio | URLs | OK | Erros |")
    relatorio.append(f"|---|---:|---:|---:|")
    sorted_domains = sorted(domain_status.items(), key=lambda x: -sum(x[1].values()))[:10]
    for d, sc in sorted_domains:
        tot = sum(sc.values())
        ok = sc.get("ok_200", 0) + sc.get("redirect_3xx", 0)
        err = tot - ok
        relatorio.append(f"| `{d}` | {tot} | {ok} | {err} |")

    relatorio.append(f"\n## URLs com problema (não-2xx, não-redirect)\n")
    problemas = [r for r in resultados if r["status_class"] not in ("ok_200", "redirect_3xx")]
    relatorio.append(f"Total: **{len(problemas)} URLs** ({100*len(problemas)/total:.1f}%).\n")
    relatorio.append(f"| Status | URL | refs | domínio |")
    relatorio.append(f"|---|---|---:|---|")
    for p in sorted(problemas, key=lambda r: -r["n_referenciada_por"])[:30]:
        url_short = p["url"] if len(p["url"]) <= 80 else p["url"][:77] + "..."
        relatorio.append(f"| `{p['status_class']}` | `{url_short}` | {p['n_referenciada_por']} | {p['domain']} |")

    OUT_REPORT.write_text("\n".join(relatorio), encoding="utf-8")
    print(f"Salvo relatório: {OUT_REPORT}")
    print(f"Salvo log JSONL: {LOG_PATH}")

    print(f"\n=== Sumário ===")
    for s, n in status_counter.most_common():
        print(f"  {n:4d}  {s}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
