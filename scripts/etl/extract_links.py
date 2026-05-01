"""C.2.a — Extrai e deduplica todos os links externos das fichas.

Lê data/derived/latest.json (saída de build_json.py). Extrai URLs de:
  - fonte_url (URL principal de cada ficha)
  - base_legal (texto livre; URLs embutidas)
  - informacoes_complementares (texto livre)
  - apresentacao, transferencia_recursos, fonte_financiamento (texto livre, raros)

Normaliza e deduplica por URL canônica (lowercase do domínio, remove fragment,
remove trailing slash). Para cada URL única, lista os ids_referenciantes
(quantas/quais fichas a referenciam).

Saídas:
  - data/derived/links-onda-1-<data>.csv (URL única, contagem, domínio, ids)
  - data/derived/links-onda-1-<data>.json (estrutura aninhada com referenciada_por)
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_JSON = ROOT / "data" / "derived" / "latest.json"

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
OUT_CSV = ROOT / "data" / "derived" / f"links-onda-1-{DATA_HOJE}.csv"
OUT_JSON = ROOT / "data" / "derived" / f"links-onda-1-{DATA_HOJE}.json"

URL_REGEX = re.compile(r"https?://[^\s\"'<>)\]]+", re.IGNORECASE)

PLACEHOLDER_DOMAIN = "placeholder.frm-catalogo.local"


def canonicalize_url(url: str) -> str:
    """URL canônica para deduplicação: scheme/netloc lowercase, sem fragment, sem trailing slash em path raiz."""
    url = url.strip().rstrip(",;.)\"'")
    try:
        p = urlparse(url)
    except Exception:
        return url
    if not p.netloc:
        return url
    netloc = p.netloc.lower()
    # Remove www. prefix? Não — manter como está, alguns sites diferem
    path = p.path
    # Remove trailing slash apenas se o path não for "/"
    if path.endswith("/") and len(path) > 1:
        path = path.rstrip("/")
    # Reconstruir sem fragment
    return urlunparse((p.scheme.lower(), netloc, path, p.params, p.query, ""))


def extract_urls(text: object) -> list[str]:
    """Extrai todas as URLs http(s) de um texto livre."""
    if not text or (isinstance(text, float) and pd.isna(text)):
        return []
    s = str(text)
    return [m.group(0) for m in URL_REGEX.finditer(s)]


def main() -> int:
    if not IN_JSON.exists():
        print(f"ERRO: rodar build_json.py primeiro (ausente: {IN_JSON})", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_JSON}")
    fichas = json.loads(IN_JSON.read_text(encoding="utf-8"))
    print(f"  {len(fichas)} fichas\n")

    # Agregação: url_canonica → {nomedo_campo: [ids], ...}
    agregado: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    placeholders = 0

    campos_busca = [
        "fonte_url",
        "base_legal",
        "informacoes_complementares",
        "apresentacao",
        "transferencia_recursos",
        "fonte_financiamento",
    ]

    for ficha in fichas:
        ficha_id = ficha.get("id_interno", "?")
        for campo in campos_busca:
            val = ficha.get(campo)
            if not val:
                continue
            urls_no_campo = extract_urls(val) if campo != "fonte_url" else [val]
            for u in urls_no_campo:
                cano = canonicalize_url(u)
                if PLACEHOLDER_DOMAIN in cano:
                    placeholders += 1
                    continue
                agregado[cano][campo].append(ficha_id)

    print(f"  {placeholders} URLs de placeholder ignoradas (fichas sem fonte_url real)")
    print(f"  {len(agregado)} URLs únicas extraídas\n")

    # Construir tabela de saída
    linhas = []
    estrutura_json = []
    domain_counts: dict[str, int] = defaultdict(int)

    for url, refs_por_campo in agregado.items():
        try:
            domain = urlparse(url).netloc.lower()
        except Exception:
            domain = ""
        # Lista única de fichas referenciantes (em qualquer campo)
        all_ids = set()
        for ids in refs_por_campo.values():
            all_ids.update(ids)
        n_refs = len(all_ids)
        domain_counts[domain] += 1
        linhas.append({
            "url": url,
            "domain": domain,
            "n_referenciada_por": n_refs,
            "ids_referenciantes": ";".join(sorted(all_ids)[:50]),  # limita a 50 para CSV legível
            "campos_origem": ";".join(sorted(refs_por_campo.keys())),
        })
        estrutura_json.append({
            "url": url,
            "domain": domain,
            "n_referenciada_por": n_refs,
            "referenciada_por": sorted(all_ids),
            "campos_origem": dict(refs_por_campo),
        })

    df_links = pd.DataFrame(linhas).sort_values(
        ["n_referenciada_por", "domain"], ascending=[False, True]
    )

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df_links.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"Salvo CSV: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")

    OUT_JSON.write_text(
        json.dumps(estrutura_json, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"Salvo JSON: {OUT_JSON}  ({OUT_JSON.stat().st_size:,} bytes)")

    print(f"\nTop 15 domínios por número de URLs:")
    top = sorted(domain_counts.items(), key=lambda x: -x[1])[:15]
    for d, n in top:
        print(f"  {n:4d}  {d}")

    print(f"\nTotal: {len(agregado)} URLs únicas em {len(domain_counts)} domínios distintos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
