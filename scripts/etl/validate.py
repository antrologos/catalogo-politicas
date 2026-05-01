"""C.1.f — Valida JSON canônico contra .claude/context/policies-schema.json.

Uso:
  python -B scripts/etl/validate.py                       # valida latest.json
  python -B scripts/etl/validate.py --file caminho.json   # valida arquivo específico
  python -B scripts/etl/validate.py --strict              # exit 2 em qualquer erro

Saída: relatório console + JSON em data/derived/_intermediate/validation_report.json.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import jsonschema
from jsonschema import Draft7Validator

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SCHEMA_PATH = ROOT / ".claude" / "context" / "policies-schema.json"
DEFAULT_JSON = ROOT / "data" / "derived" / "latest.json"
REPORT_PATH = ROOT / "data" / "derived" / "_intermediate" / "validation_report.json"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, default=DEFAULT_JSON, help="JSON a validar")
    parser.add_argument("--strict", action="store_true", help="exit 2 se houver erros")
    args = parser.parse_args()

    if not SCHEMA_PATH.exists():
        print(f"ERRO: schema ausente: {SCHEMA_PATH}", file=sys.stderr)
        return 1
    if not args.file.exists():
        print(f"ERRO: arquivo ausente: {args.file}", file=sys.stderr)
        return 1

    print(f"Schema: {SCHEMA_PATH}")
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft7Validator.check_schema(schema)

    print(f"Arquivo: {args.file}")
    data = json.loads(args.file.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        print("ERRO: JSON raiz deve ser array de fichas", file=sys.stderr)
        return 1
    print(f"  {len(data)} fichas para validar\n")

    validator = Draft7Validator(schema)
    erros_por_ficha: list[dict] = []
    erros_por_campo: Counter = Counter()
    fichas_invalidas = 0

    for i, ficha in enumerate(data):
        erros = list(validator.iter_errors(ficha))
        if not erros:
            continue
        fichas_invalidas += 1
        ficha_id = ficha.get("id_interno", f"<sem id @ index {i}>")
        for e in erros:
            campo = ".".join(str(p) for p in e.absolute_path) or "(raiz)"
            erros_por_ficha.append({
                "id_interno": ficha_id,
                "slug": ficha.get("slug", ""),
                "uf": ficha.get("uf", ""),
                "campo": campo,
                "mensagem": e.message[:200],
                "valor": str(e.instance)[:140] if e.instance is not None else None,
            })
            erros_por_campo[campo] += 1

    print(f"Fichas válidas:    {len(data) - fichas_invalidas:4d}/{len(data)}")
    print(f"Fichas inválidas:  {fichas_invalidas:4d}")
    print(f"Total de erros:    {len(erros_por_ficha)}\n")

    if erros_por_campo:
        print("Erros por campo (top 15):")
        for campo, n in erros_por_campo.most_common(15):
            print(f"  {n:4d}  {campo}")
        print()
        print("Primeiros 5 erros detalhados:")
        for e in erros_por_ficha[:5]:
            print(f"  [{e['id_interno']}] campo={e['campo']!r}  msg={e['mensagem']}")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps({
            "arquivo": str(args.file),
            "total_fichas": len(data),
            "fichas_invalidas": fichas_invalidas,
            "total_erros": len(erros_por_ficha),
            "erros_por_campo": dict(erros_por_campo),
            "erros_amostra": erros_por_ficha[:50],
        }, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nRelatório completo: {REPORT_PATH}")

    if args.strict and erros_por_ficha:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
