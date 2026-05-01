---
paths:
  - "**"
---

# Regra: Protocolo de Testes

**Status:** OBRIGATORIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto Transcritorio

## Principio

Toda mudanca no codigo de producao deve ser precedida por um teste em
contexto restrito. Nunca testar diretamente no pipeline completo como
primeira abordagem.

## Hierarquia de testes

### Nivel 1: Toy Example (obrigatorio)

Script Python autonomo que:
- Cria dados sinteticos OU usa um subset minimo de dados reais
- Executa APENAS a funcao alterada
- Verifica o resultado com `assert` ou comparacao explicita
- Roda em < 30 segundos
- Usa `python -B` (sem bytecode)

Localizacao: `tests/toy_[funcao].py`

```python
# Exemplo: tests/toy_resolve_executable.py
"""Toy test para runtime.resolve_executable()."""
from __future__ import annotations

import os
import tempfile
from pathlib import Path

from transcribe_pipeline.runtime import resolve_executable

# Criar estrutura de teste
with tempfile.TemporaryDirectory() as tmpdir:
    # Simular bundle com ffmpeg
    vendor_bin = Path(tmpdir) / "vendor" / "ffmpeg" / "bin"
    vendor_bin.mkdir(parents=True)
    ffmpeg_exe = vendor_bin / "ffmpeg.exe"
    ffmpeg_exe.touch()

    os.environ["TRANSCRITORIO_RUNTIME_DIR"] = tmpdir
    try:
        result = resolve_executable("ffmpeg")
        assert result == str(ffmpeg_exe), f"Expected {ffmpeg_exe}, got {result}"
        print("PASS: resolve_executable encontra ffmpeg no vendor dir")
    finally:
        del os.environ["TRANSCRITORIO_RUNTIME_DIR"]

print("PASS: toy_resolve_executable")
```

### Nivel 2: Unit Test com dados reais (recomendado)

Script Python que:
- Usa dados reais minimos (1 audio curto, 1 config real)
- Executa a funcao com dados reais
- Verifica propriedades do resultado
- Roda em < 2 minutos

Localizacao: `tests/unit_[funcao].py`

### Nivel 3: Integracao (so apos niveis 1 e 2)

Rodar o pipeline completo ou o build completo.
So rodar quando os niveis 1 e 2 passaram.

### Para o pipeline de build especificamente

Verificacoes obrigatorias antes de qualquer rebuild:

```python
# tests/toy_build_prerequisites.py
"""Verifica prerequisitos do build antes de rodar build.ps1."""
import os
import sys
from pathlib import Path

venv = Path(os.environ["LOCALAPPDATA"]) / "Transcritorio" / "build-venv"
python = venv / "Scripts" / "python.exe"

# 1. Build-venv existe?
assert python.exists(), f"Build-venv nao encontrado: {python}"

# 2. Torch com CUDA?
import subprocess
result = subprocess.run(
    [str(python), "-B", "-c",
     "import torch; print(torch.__version__); print(torch.cuda.is_available())"],
    capture_output=True, text=True
)
lines = result.stdout.strip().split("\n")
assert "True" in lines[1], f"CUDA nao disponivel no build-venv: {lines}"
print(f"PASS: torch {lines[0]} com CUDA")

# 3. whisperx disponivel?
result = subprocess.run(
    [str(python), "-B", "-c", "from whisperx.__main__ import cli; print('OK')"],
    capture_output=True, text=True
)
assert "OK" in result.stdout, "whisperx nao disponivel no build-venv"
print("PASS: whisperx disponivel")
```

Verificacoes obrigatorias apos build:

```
- _internal/torch/lib/torch_cuda.dll existe
- Bundle >= 3 GB (4+ GB esperado com CUDA)
- Tres executaveis presentes: Transcritorio.exe, transcritorio-cli.exe, whisperx.exe
- vendor/ffmpeg/bin/ffmpeg.exe presente
- transcritorio-cli.exe --help roda sem erro
```

## Regras Python no Windows

- **Sempre usar `python -B`** ou `PYTHONDONTWRITEBYTECODE=1` — sem __pycache__ no Dropbox
- Caminhos: sempre `pathlib.Path`, nunca strings concatenadas
- Encoding: sempre `encoding="utf-8"` em `open()`, `read_text()`, `write_text()`
- Subprocessos: usar `subprocess.run()` com `capture_output=True`
- Nunca rodar Python de dentro do Dropbox como CWD (contamina sys.path)

## Quando um teste falha

1. Ler a mensagem de erro COMPLETA
2. Identificar a linha exata do erro (traceback)
3. Criar um toy example AINDA MENOR que reproduz o erro
4. Corrigir no toy example primeiro
5. So entao aplicar a correcao no codigo real
6. **NUNCA** entrar em loop de tentativa-e-erro sem entender a causa

## Diretorio de testes

```
tests/
  toy_resolve_executable.py
  toy_config_parser.py
  toy_build_prerequisites.py
  unit_whisperx_runner.py
  unit_render.py
```

## Politica de tracking (0.3+)

**Mudanca em 2026-04-20**: os arquivos `tests/*.py` passam a ser
**parte do repositorio** e rodam no CI do GitHub Actions a cada push.
Antes eram gitignored como "testes locais" — mudanca motivada pela
adicao de CI multiplataforma no item 1 do backlog 0.3+.

O que fica trackeado:
- `tests/toy_*.py` e `tests/smoke_*.py` — parte do repo e do CI

O que continua local (gitignored):
- `tests/*.csv` — benchmarks e dados experimentais
- `tests/benchmarks/` — relatorios de performance
- `tests/.tmp/` — scratch de debug

Ao adicionar um teste novo que depende de um modulo pesado (torch,
pyannote, whisperx), documentar no topo do arquivo e marcar com skip
condicional se o modulo falta — o CI usa um conjunto minimo de
dependencias (sem torch/pyannote) para rodar rapido.
