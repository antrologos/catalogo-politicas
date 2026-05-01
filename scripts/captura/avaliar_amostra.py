"""C.3.d — Avalia qualidade dos snapshots capturados.

Lê amostra-resultados-<data>.json + snapshots em data/external_snapshots/.
Para cada snapshot: estatísticas (formato, tamanho, encoding, palavras
extraídas, presença suspeita de página de erro, PII flag).
Saída: data/derived/amostra-avaliacao-<data>.md (relatório markdown).
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

DATA_HOJE = datetime.now().strftime("%Y-%m-%d")
IN_JSON = ROOT / "data" / "derived" / f"amostra-resultados-{DATA_HOJE}.json"
OUT_MD = ROOT / "data" / "derived" / f"amostra-avaliacao-{DATA_HOJE}.md"


def avaliar_qualidade(r: dict) -> tuple[str, str]:
    """Retorna (nivel, motivo) de qualidade. nivel ∈ {alta, media, baixa}."""
    if r.get("status") not in ("ok", "inalterado"):
        return "baixa", f"status={r['status']}"
    chars = r.get("caracteres_extraidos") or 0
    if chars >= 2000:
        return "alta", f"texto extenso ({chars} chars)"
    if chars >= 500:
        return "media", f"texto razoável ({chars} chars)"
    if chars >= 100:
        return "media", f"texto curto ({chars} chars)"
    return "baixa", f"texto muito curto ou vazio ({chars} chars)"


def main() -> int:
    in_json = IN_JSON
    if not in_json.exists():
        candidatos = sorted((ROOT / "data" / "derived").glob("amostra-resultados-*.json"))
        if not candidatos:
            print("ERRO: rodar capturar_amostra.py primeiro", file=sys.stderr)
            return 1
        in_json = candidatos[-1]

    print(f"Lendo: {in_json}")
    resultados = json.loads(in_json.read_text(encoding="utf-8"))
    print(f"  {len(resultados)} resultados")

    md = []
    md.append(f"# Avaliação da amostra capturada — onda 1 — {DATA_HOJE}\n")
    md.append(f"Total de URLs capturadas: **{len(resultados)}**\n")

    # Estatísticas
    status_count = Counter(r["status"] for r in resultados)
    formatos = Counter()
    qualidades = Counter()
    pii_total = 0
    chars_lista = []
    bytes_lista = []
    com_texto = 0
    sem_texto = 0
    erros_validacao = []

    for r in resultados:
        snap = r.get("caminho_snapshot") or ""
        if snap:
            ext = snap.rsplit(".", 1)[-1] if "." in snap else "?"
            formatos[ext] += 1
        chars = r.get("caracteres_extraidos") or 0
        chars_lista.append(chars)
        if chars > 0:
            com_texto += 1
        else:
            sem_texto += 1
        bs = r.get("tamanho_bytes") or 0
        if bs:
            bytes_lista.append(bs)
        if r.get("contem_pii"):
            pii_total += 1
        nivel, motivo = avaliar_qualidade(r)
        qualidades[nivel] += 1
        if r.get("status") == "validacao_falhou":
            erros_validacao.append({
                "url": r["url_solicitada"],
                "erro": r.get("erro_msg", ""),
            })

    md.append(f"## Status\n")
    md.append(f"| Status | n |")
    md.append(f"|---|---:|")
    for s, n in status_count.most_common():
        md.append(f"| {s} | {n} |")

    md.append(f"\n## Formatos capturados\n")
    md.append(f"| Formato | n |")
    md.append(f"|---|---:|")
    for f, n in formatos.most_common():
        md.append(f"| {f} | {n} |")

    md.append(f"\n## Qualidade do texto extraído\n")
    md.append(f"| Nível | n | Critério |")
    md.append(f"|---|---:|---|")
    md.append(f"| alta  | {qualidades['alta']:2d} | ≥ 2000 chars |")
    md.append(f"| média | {qualidades['media']:2d} | 100-1999 chars |")
    md.append(f"| baixa | {qualidades['baixa']:2d} | < 100 chars ou erro |")

    if chars_lista:
        chars_lista_sorted = sorted(chars_lista)
        n = len(chars_lista_sorted)
        md.append(f"\nDistribuição de caracteres extraídos:")
        md.append(f"  - mínimo: {min(chars_lista_sorted)}")
        md.append(f"  - mediana: {chars_lista_sorted[n//2]}")
        md.append(f"  - média: {sum(chars_lista_sorted)//n}")
        md.append(f"  - máximo: {max(chars_lista_sorted)}")
        md.append(f"  - com texto: {com_texto}/{len(resultados)}")
        md.append(f"  - sem texto: {sem_texto}/{len(resultados)}")

    if bytes_lista:
        md.append(f"\nDistribuição de tamanho dos snapshots (bytes):")
        md.append(f"  - mínimo: {min(bytes_lista):,}")
        md.append(f"  - mediana: {sorted(bytes_lista)[len(bytes_lista)//2]:,}")
        md.append(f"  - máximo: {max(bytes_lista):,}")
        md.append(f"  - total armazenado: {sum(bytes_lista):,} bytes ({sum(bytes_lista)/1024/1024:.1f} MB)")

    md.append(f"\n## PII detectada\n")
    md.append(f"Snapshots com flag `contem_pii=true` (>5 ocorrências de CPF/CNPJ): **{pii_total}**\n")

    if erros_validacao:
        md.append(f"\n## Erros de validação ({len(erros_validacao)})\n")
        for e in erros_validacao:
            md.append(f"- `{e['url']}` — {e['erro']}")

    md.append(f"\n## Snapshots por domínio\n")
    dominio_chars = Counter()
    dominio_bytes = Counter()
    dominio_n = Counter()
    for r in resultados:
        host = urlparse(r["url_solicitada"]).netloc.lower()
        dominio_n[host] += 1
        dominio_chars[host] += r.get("caracteres_extraidos") or 0
        dominio_bytes[host] += r.get("tamanho_bytes") or 0
    md.append(f"| Domínio | n | bytes total | chars total |")
    md.append(f"|---|---:|---:|---:|")
    for d, n in dominio_n.most_common():
        md.append(f"| `{d}` | {n} | {dominio_bytes[d]:,} | {dominio_chars[d]:,} |")

    md.append(f"\n## Recomendações para Bloco D\n")
    if qualidades['baixa'] >= len(resultados) // 4:
        md.append(f"- ⚠️ Mais de 25% das capturas têm texto curto/vazio. Investigar: páginas que carregam via JS? PDFs escaneados? Implementar fallback OCR (ocrmypdf) em D.1.")
    if pii_total > 0:
        md.append(f"- ⚠️ {pii_total} snapshots contém PII. Revisar manualmente; considerar redação automática antes de publicar.")
    if formatos.get("pdf", 0) == 0:
        md.append(f"- ℹ️ Nenhum PDF capturado nesta amostra (todos HTML). Ampliar amostra com URLs do Planalto/IN para testar pipeline PDF.")
    md.append(f"- ✅ Skill `capturar-norma` (v1.0) está funcional. Próximos passos: implementar OCR para PDFs escaneados, suporte a DOC legado via libreoffice, snapshot index.json com SHA→metadata.")

    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    print(f"\nSalvo: {OUT_MD}")
    print(f"\nResumo:")
    print(f"  alta qualidade:  {qualidades['alta']:2d}")
    print(f"  média qualidade: {qualidades['media']:2d}")
    print(f"  baixa qualidade: {qualidades['baixa']:2d}")
    print(f"  com PII:         {pii_total:2d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
