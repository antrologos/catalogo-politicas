#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hook PreToolUse: bloqueia escrita/edição na planilha-fonte primária.

Contexto
--------
A planilha "Fichas das Políticas - 1ª onda.xlsx" é a fonte primária imutável
do catálogo. Qualquer transformação deve ser gravada em data/derived/. Este
hook impede que Edit/Write/MultiEdit toquem o arquivo original.

Protocolo (conforme docs Anthropic 2025-2026)
---------------------------------------------
- Recebe JSON em stdin: {"tool": "...", "tool_input": {"file_path": "...", ...}, ...}
- Para BLOQUEAR: emitir JSON em stdout com permissionDecision=deny + sair com
  exit code 2.
- Para LIBERAR: sair silenciosamente com exit 0.
- Em caso de erro inesperado (JSON malformado, etc.): exit 0 (NUNCA bloquear
  por bug do hook — preferimos falsos negativos a travar o usuário).
"""

from __future__ import annotations

import io
import json
import os
import sys
from pathlib import Path

# Força encoding UTF-8 em I/O ANTES de qualquer print/read, mesmo em Windows
# com console cp1252. settings.json define PYTHONIOENCODING=utf-8, mas
# blindamos aqui por garantia (rodar via subprocess fora do harness).
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

ARQUIVO_PROTEGIDO = "fichas das políticas - 1ª onda.xlsx"
# Versões alternativas que reconhecemos como "o mesmo arquivo" (variações de
# acentuação ASCII, encoding, etc.). Tudo case-insensitive.
ALIASES_PROTEGIDOS = {
    "fichas das politicas - 1a onda.xlsx",
    "fichas das politicas - 1ª onda.xlsx",
    "fichas das políticas - 1a onda.xlsx",
    ARQUIVO_PROTEGIDO,
}


def _eh_arquivo_protegido(file_path: str) -> bool:
    """True se file_path aponta para a planilha-fonte (qualquer caminho, qualquer caixa)."""
    if not file_path:
        return False
    try:
        nome = Path(file_path).name.strip().lower()
    except Exception:
        # Path() pode falhar em strings exóticas; melhor não bloquear.
        return False
    return nome in ALIASES_PROTEGIDOS


def _emitir_bloqueio(motivo_curto: str, file_path: str) -> None:
    """Emite JSON oficial Anthropic que mostra mensagem ao usuário e bloqueia a tool.

    Escreve diretamente em sys.stdout.buffer (bytes UTF-8) para evitar problemas
    de encoding de console no Windows.
    """
    saida = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": (
                f"BLOQUEADO: tentativa de escrever/editar a planilha-fonte primária "
                f"('{file_path}'). Esta planilha é IMUTÁVEL no projeto FRM_CatalogoPoliticas.\n\n"
                f"Motivo: {motivo_curto}\n\n"
                "O que fazer:\n"
                "  1. Para gerar derivados (CSV/JSON/Parquet/novo .xlsx normalizado), "
                "grave em 'data/derived/' com nome datado, ex.:\n"
                "       data/derived/onda1_normalizada_2026-05-01.json\n"
                "  2. Para corrigir conteúdo da onda original, peça ao revisor humano "
                "para editar via Excel, com lock-file gerenciado pelo Drive (verificar "
                "'~$Fichas das Políticas - 1ª onda.xlsx' antes).\n"
                "  3. Para snapshots de fontes externas (leis, decretos, etc.), use "
                "'data/external_snapshots/' (caminho por SHA-256, conforme "
                "rules/captura-responsavel.md).\n\n"
                "Referências: CLAUDE.md (Convenção de operação no arquivo) + "
                "rules/protecao-fontes.md."
            ),
        }
    }
    # Tenta JSON UTF-8 nativo; se falhar, cai para escape ASCII puro (sempre seguro).
    payload = json.dumps(saida, ensure_ascii=False)
    try:
        sys.stdout.buffer.write(payload.encode("utf-8"))
        sys.stdout.buffer.write(b"\n")
        sys.stdout.buffer.flush()
    except Exception:
        # Fallback: ASCII-only via escape sequences \uXXXX (preserva semântica)
        try:
            payload_ascii = json.dumps(saida, ensure_ascii=True)
            sys.stdout.write(payload_ascii + "\n")
            sys.stdout.flush()
        except Exception:
            # Último recurso: silencioso. O exit code 2 ainda bloqueia.
            pass


def _ler_stdin() -> str:
    """Lê stdin como bytes UTF-8, robusto a qualquer encoding de console.

    Preferir buffer raw evita que problemas de codepage no Windows engolam
    silenciosamente o payload (que sempre vem em UTF-8 do harness).
    """
    try:
        # Pipe? Lê tudo como bytes e decodifica explicitamente.
        if not sys.stdin.isatty():
            data = sys.stdin.buffer.read()
            return data.decode("utf-8", errors="replace")
    except Exception:
        pass
    # Fallback: read() de texto (pode dar problema com encoding mas é o melhor que dá).
    try:
        return sys.stdin.read() if not sys.stdin.isatty() else ""
    except Exception:
        return ""


def main() -> int:
    # --- Leitura defensiva do payload ---
    raw = _ler_stdin()
    if not raw.strip():
        # Sem payload: nada a verificar. Liberar.
        return 0

    try:
        evento = json.loads(raw)
    except json.JSONDecodeError:
        # Payload malformado: não nosso problema; não bloquear.
        return 0

    if not isinstance(evento, dict):
        return 0

    tool_input = evento.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return 0

    # Edit/Write usam 'file_path'; MultiEdit também usa 'file_path' no nível raiz.
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""

    if _eh_arquivo_protegido(file_path):
        _emitir_bloqueio(
            motivo_curto="planilha-fonte primária (arquivo imutável)",
            file_path=file_path,
        )
        return 2  # exit 2 = bloqueia oficialmente a tool

    # Caminho permitido. Liberar silenciosamente.
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Failsafe: nunca derruba a sessão por bug do hook.
        sys.exit(0)