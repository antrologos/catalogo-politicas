#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hook PostToolUse: avisa se um derivado foi criado/editado enquanto a planilha
está aberta no Excel (lock file '~$...xlsx' presente).

Contexto
--------
No Drive compartilhado, vários revisores editam a planilha-fonte simultânea ou
sequencialmente. Quando alguém abre o .xlsx no Excel, o sistema cria um lock
file '~$Fichas das Políticas - 1ª onda.xlsx' no mesmo diretório. Se o pipeline
gerar derivados (em data/derived/) com a planilha aberta, há risco do derivado
estar baseado em estado intermediário inconsistente.

Este hook é INFORMATIVO (PostToolUse não bloqueia em conformidade com docs
Anthropic 2025-2026). Apenas avisa via stderr para o usuário decidir.
"""

from __future__ import annotations

import io
import json
import os
import sys
from pathlib import Path

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

NOME_LOCK = "~$Fichas das Políticas - 1ª onda.xlsx"
# Aliases de lock file (variações sem acentuação)
ALIASES_LOCK = {
    NOME_LOCK,
    "~$Fichas das Politicas - 1a onda.xlsx",
    "~$Fichas das Politicas - 1ª onda.xlsx",
    "~$Fichas das Políticas - 1a onda.xlsx",
}


def _projeto_root() -> Path | None:
    """Resolve a raiz do projeto via $CLAUDE_PROJECT_DIR; fallback heurístico."""
    env = os.environ.get("CLAUDE_PROJECT_DIR")
    if env:
        return Path(env)
    # Fallback: subir até encontrar a planilha-fonte.
    aqui = Path(__file__).resolve()
    for ancestor in [aqui, *aqui.parents]:
        try:
            for nome in ("Fichas das Políticas - 1ª onda.xlsx",
                         "Fichas das Politicas - 1a onda.xlsx"):
                if (ancestor / nome).exists():
                    return ancestor
        except Exception:
            continue
    return None


def _lock_existe(raiz: Path) -> Path | None:
    """Retorna caminho do lock se existir, senão None."""
    try:
        for nome in ALIASES_LOCK:
            candidato = raiz / nome
            if candidato.exists():
                return candidato
    except Exception:
        return None
    return None


def _eh_derivado(file_path: str, raiz: Path) -> bool:
    """True se file_path está dentro de data/derived/ do projeto."""
    if not file_path:
        return False
    try:
        fp = Path(file_path).resolve()
    except Exception:
        return False
    try:
        derivado_root = (raiz / "data" / "derived").resolve()
    except Exception:
        return False
    try:
        fp.relative_to(derivado_root)
        return True
    except ValueError:
        return False


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

    if not _eh_derivado(file_path, raiz):
        return 0

    lock = _lock_existe(raiz)
    if lock is None:
        return 0

    # Avisar via stderr (visível ao usuário sem bloquear).
    print(
        "AVISO [warn_lock_file]: você acabou de gravar/editar um derivado em "
        f"'{file_path}', mas a planilha-fonte parece ESTAR ABERTA no Excel "
        f"(lock detectado: '{lock}').\n"
        "  - Se o derivado foi gerado a partir da planilha NESTE momento, ele "
        "pode estar baseado em estado intermediário (um revisor pode estar com "
        "alterações não-salvas).\n"
        "  - Recomendado: peça para fechar a planilha (Salvar+Fechar no Excel), "
        "delete o lock se persistir, e regenere o derivado.\n"
        "  - Veja CLAUDE.md (Convenção de operação no arquivo) e "
        "rules/operacao-drive.md.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)