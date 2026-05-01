#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hook PostToolUse: valida JSON gravado em data/derived/ contra o schema canônico.

Contexto
--------
O schema '.claude/context/policies-schema.json' (JSON Schema draft-07) define
o formato canônico das fichas de políticas. Qualquer JSON gravado em
data/derived/ deve, idealmente, validar contra ele.

Este hook é INFORMATIVO (PostToolUse não bloqueia em conformidade com docs
Anthropic 2025-2026). Apenas avisa via stderr listando os primeiros erros.

Robustez
--------
- Se a lib 'jsonschema' não estiver instalada, faz validação BÁSICA (presença
  de campos obrigatórios apenas).
- Se o schema não existir, sai silenciosamente.
- Se o arquivo gravado não for JSON válido, sai silenciosamente (outro hook
  ou linter cuida).
- Sempre exit 0.
"""

from __future__ import annotations

import io
import json
import os
import sys
from pathlib import Path
from typing import Any

# UTF-8 forçado em stdout/stderr/stdin para evitar UnicodeEncodeError em Windows.
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    sys.stdin.reconfigure(encoding="utf-8")   # type: ignore[attr-defined]
except Exception:
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", line_buffering=True)
        sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")
    except Exception:
        pass

MAX_ERROS_EXIBIDOS = 3


def _projeto_root() -> Path | None:
    env = os.environ.get("CLAUDE_PROJECT_DIR")
    if env:
        return Path(env)
    aqui = Path(__file__).resolve()
    for ancestor in [aqui, *aqui.parents]:
        try:
            if (ancestor / ".claude" / "context" / "policies-schema.json").exists():
                return ancestor
        except Exception:
            continue
    return None


def _eh_alvo(file_path: str, raiz: Path) -> bool:
    """True se file_path termina em .json E está em data/derived/."""
    if not file_path or not file_path.lower().endswith(".json"):
        return False
    try:
        fp = Path(file_path).resolve()
        derivado_root = (raiz / "data" / "derived").resolve()
        fp.relative_to(derivado_root)
        return True
    except (ValueError, Exception):
        return False


def _carregar_schema(raiz: Path) -> dict | None:
    schema_path = raiz / ".claude" / "context" / "policies-schema.json"
    if not schema_path.exists():
        return None
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _carregar_dados(file_path: str) -> Any:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _validar_basico(dados: Any, schema: dict) -> list[str]:
    """Validação mínima sem 'jsonschema': checa campos required no nível raiz.

    Aceita tanto um dicionário (1 política) quanto uma lista (várias).
    """
    required = schema.get("required") or []
    if not required or not isinstance(required, list):
        return []

    erros: list[str] = []

    def _check_obj(obj: Any, prefixo: str = "") -> None:
        if not isinstance(obj, dict):
            erros.append(f"{prefixo or '<root>'}: esperado objeto JSON.")
            return
        for campo in required:
            if campo not in obj:
                erros.append(f"{prefixo or '<root>'}: campo obrigatório ausente: '{campo}'.")

    if isinstance(dados, list):
        for i, item in enumerate(dados):
            _check_obj(item, prefixo=f"[{i}]")
            if len(erros) >= MAX_ERROS_EXIBIDOS:
                break
    else:
        _check_obj(dados)

    return erros


def _validar_jsonschema(dados: Any, schema: dict) -> list[str]:
    """Validação completa via lib 'jsonschema', se disponível."""
    try:
        import jsonschema  # type: ignore
        from jsonschema import Draft7Validator  # type: ignore
    except ImportError:
        return _validar_basico(dados, schema)

    erros: list[str] = []
    validator = Draft7Validator(schema)

    if isinstance(dados, list):
        for i, item in enumerate(dados):
            for err in validator.iter_errors(item):
                caminho = ".".join(str(p) for p in err.absolute_path) or "<root>"
                erros.append(f"[{i}].{caminho}: {err.message}")
                if len(erros) >= MAX_ERROS_EXIBIDOS:
                    return erros
    else:
        for err in validator.iter_errors(dados):
            caminho = ".".join(str(p) for p in err.absolute_path) or "<root>"
            erros.append(f"{caminho}: {err.message}")
            if len(erros) >= MAX_ERROS_EXIBIDOS:
                break

    return erros


def _ler_stdin() -> str:
    try:
        if not sys.stdin.isatty():
            return sys.stdin.buffer.read().decode("utf-8", errors="replace")
    except Exception:
        pass
    try:
        return sys.stdin.read() if not sys.stdin.isatty() else ""
    except Exception:
        return ""


def main() -> int:
    raw = _ler_stdin()
    if not raw.strip():
        return 0
    try:
        evento = json.loads(raw)
    except json.JSONDecodeError:
        return 0
    if not isinstance(evento, dict):
        return 0

    tool_input = evento.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return 0
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""

    raiz = _projeto_root()
    if raiz is None:
        return 0

    if not _eh_alvo(file_path, raiz):
        return 0

    schema = _carregar_schema(raiz)
    if schema is None:
        # Schema ainda não existe — nada a validar (típico em fases iniciais).
        return 0

    dados = _carregar_dados(file_path)
    if dados is None:
        # Não é JSON válido; outro processo cuida.
        return 0

    erros = _validar_jsonschema(dados, schema)
    if not erros:
        return 0

    print(
        f"AVISO [validate_json_schema]: o JSON em '{file_path}' não validou "
        f"contra '.claude/context/policies-schema.json'. "
        f"Mostrando primeiros {min(len(erros), MAX_ERROS_EXIBIDOS)} erro(s):",
        file=sys.stderr,
    )
    for i, e in enumerate(erros[:MAX_ERROS_EXIBIDOS], start=1):
        print(f"  {i}. {e}", file=sys.stderr)
    print(
        "  (Validação informativa — não bloqueia. Corrija antes de promover ao site.)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
