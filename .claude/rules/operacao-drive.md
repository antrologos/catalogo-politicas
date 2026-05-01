---
descricao: Operação no Google Drive compartilhado em Windows. .gitignore agressivo, paths Unicode, lock files Excel, backup vs sync, longpaths.
escopo: infra · sempre carrega
versao: 1.0
ultima_revisao: 2026-05-01
paths:
  - "**"
---

# Operação no Drive

**Status:** OBRIGATÓRIA · **Escopo:** todo o projeto (sempre carrega)

O repositório vive em `g:\Drives compartilhados\FRM_CatalogoPoliticas\` — pasta sincronizada via Google Drive Desktop em Windows. Esta combinação tem armadilhas específicas que estas regras endereçam.

## Princípios

1. **Drive sincroniza arquivos, não estado de repositório.** Git é frágil em Drive sincado (race conditions, lock de arquivos, atrasos).
2. **Excluir agressivamente artefatos pesados** do Drive sync (via marcação "no offline sync" no Drive Desktop) e do git (via `.gitignore`).
3. **Paths são Unicode + têm espaços + podem ser longos.** Sempre quotar em shell; sempre `pathlib.Path` em Python.
4. **Backup é responsabilidade separada** — Drive não substitui git e nem snapshot externo periódico.

## `.gitignore` agressivo (raiz do projeto)

```gitignore
# Builds e dependências (web)
node_modules/
.next/
dist/
build/
out/
.cache/
.parcel-cache/
.turbo/
.vercel/
.netlify/

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/

# Lock files Excel (Windows + Drive sync)
~$*.xlsx
~$*.xls
~$*.docx

# OS
.DS_Store
Thumbs.db
desktop.ini

# Editores
.idea/
.vscode/
*.swp
*~

# Claude
.claude/settings.local.json

# Snapshots binários grandes (manter index e meta; conteúdo é volumoso)
data/external_snapshots/**/*.html
data/external_snapshots/**/*.pdf
data/external_snapshots/**/*.docx
data/external_snapshots/**/*.doc
data/external_snapshots/**/*.odt
!data/external_snapshots/**/index.json
!data/external_snapshots/**/*.metadata.json

# Logs
logs/*.jsonl
logs/*.log

# Env
.env
.env.local
*.env

# Backups
backups/*.tar.gz
backups/*.zip
```

`.gitignore` adicional em `.claude/`:

```gitignore
# Outputs de rodada (manter na pasta do drive, mas não versionar até decisão)
working/*.tmp
working/*.scratch.md

# Settings locais
settings.local.json
```

## Marcar pastas pesadas como "no offline sync" no Google Drive Desktop

Para reduzir impacto no Drive sync (não impede ferramentas de criarem essas pastas localmente; só evita que sejam sincadas):

- `node_modules/`
- `.next/`, `dist/`, `build/`, `out/`
- `.venv/`, `venv/`
- `__pycache__/` (todas as instâncias)
- `data/external_snapshots/` se ficar muito grande (>1GB)

**Procedimento:** botão direito na pasta no Explorer → "Disponibilidade off-line" → "Disponível somente on-line". (Drive Desktop precisa estar configurado em modo "Stream files".)

## Paths Unicode + Windows

### Em bash (Git Bash, WSL, ambiente Claude Code)

**Sempre quotar paths com espaços e acentos:**

```bash
# CORRETO
ls "data/raw/Fichas das Políticas - 1ª onda.xlsx"
python -B "scripts/etl/normalize.py"

# ERRADO (espaço quebra)
ls data/raw/Fichas das Políticas - 1ª onda.xlsx
```

**Trabalhar em sintaxe Unix mesmo no Windows** (este ambiente roda bash):
```bash
# CORRETO no nosso bash
output > /dev/null
ls -la
python -B scripts/etl/main.py

# ERRADO no nosso bash
output > NUL
dir
```

### Em Python

**Sempre `pathlib.Path`**, nunca string concat:

```python
from pathlib import Path
RAW = Path("data") / "raw" / "Fichas das Políticas - 1ª onda.xlsx"
assert RAW.exists(), f"Não encontrado: {RAW}"
```

Strings literais com cedilha/acento exigem `# -*- coding: utf-8 -*-` no topo só em Python 2 (não usamos); Python 3 lê fonte como UTF-8 por padrão.

### Em git

```bash
git config core.longpaths true       # caminhos > 260 chars (Windows)
git config core.autocrlf false       # evita conversão CRLF/LF aleatória
git config core.quotepath false      # mostra acentos em git status
```

Aplicar **localmente** (no clone), não global:
```bash
cd "g:/Drives compartilhados/FRM_CatalogoPoliticas"
git config core.longpaths true
git config core.autocrlf false
git config core.quotepath false
```

### Exemplos com cedilha/acento que devem funcionar

```python
# Nomes de aba (com espaço inicial e cedilha)
ABAS_ESTADUAIS = [
    " Planilha SP",       # espaço inicial!
    " Planilha RJ",
    " Planilha Pará",     # cedilha
    "Planilha MG",
    "Planilha Paraná",
    "Planilha Rio Grande do Sul",
    "Planilha Bahia",
    "Planilha Pernambuco",
    "Planilha Ceará",
]
ABA_FEDERAL = "Políticas federais (comuns a to"   # truncada em 31 chars

# Validação
import openpyxl
wb = openpyxl.load_workbook(RAW, read_only=True)
for nome in ABAS_ESTADUAIS + [ABA_FEDERAL]:
    assert nome in wb.sheetnames, f"Aba ausente: {nome!r}"
```

## Lock files Excel

Quando Excel abre `Fichas das Políticas - 1ª onda.xlsx`, cria lock file `~$Fichas das Políticas - 1ª onda.xlsx` na mesma pasta.

**Antes** de qualquer operação que escreva derivado:

```python
from pathlib import Path
RAW = Path("data/raw/Fichas das Políticas - 1ª onda.xlsx")
LOCK = RAW.parent / f"~${RAW.name}"

if LOCK.exists():
    print("AVISO: planilha aberta no Excel; derivado pode capturar versão não salva.")
    # NÃO bloqueia; apenas avisa
```

Hook `warn_lock_file.py` (PostToolUse, ver `.claude/settings.json`) executa essa verificação automaticamente após Write em `data/derived/*.json`.

`~$*.xlsx` está no `.gitignore` — nunca commitar lock files.

## Backup vs. Drive sync

**Drive sync ≠ backup ≠ controle de versão.**

| Mecanismo | Garante | Não garante |
|---|---|---|
| Google Drive sync | Cópia em nuvem; revisão Google das últimas N versões | Histórico explícito; portabilidade; recuperação seletiva |
| `git` | Histórico completo; portabilidade | Cópia off-site; arquivos não-versionados (`data/external_snapshots/*.html`) |
| Snapshot externo periódico | Recuperação total em desastre | Frequência alta (é manual ou cron) |

**Procedimento de snapshot recomendado** (mensal ou ao final de cada bloco):

```bash
DATA=$(date +%Y-%m-%d)
tar -czf "backups/snapshot-${DATA}.tar.gz" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.venv' \
    --exclude='.next' \
    .
```

Mover o `.tar.gz` para fora do Drive (HD externo, ou outro provedor de armazenamento) — proteção contra corrupção sincronizada.

## Inicialização do repositório

Ao inicializar git pela primeira vez:

```bash
cd "g:/Drives compartilhados/FRM_CatalogoPoliticas"
git init
git config core.longpaths true
git config core.autocrlf false
git config core.quotepath false
git add .gitignore CLAUDE.md .claude/
git commit -m "Initial commit: estrutura .claude/ Bloco A"
```

## Anti-padrões proibidos

- Versionar `node_modules/`, `__pycache__/`, ou snapshots binários
- Ignorar lock files (`~$...xlsx`) no git
- Path com `\` em arquivo de configuração ou código (não-portátil)
- `cd` para `g:/Drives compartilhados/` em script Python (raiz pode mover)
- Confiar em Drive sync como única backup
- Rodar `git gc --aggressive` em pasta sincada (cria/remove muitos arquivos pequenos rapidamente; estressa o sync)
- `rm -rf` ou `git clean -fdx` sem revisar (pode deletar `data/raw/` se não está em `.gitignore` cuidadoso)

## Quando algo dá errado no sync

Sintomas: arquivo "fantasma", conflito de versão, Drive parado.

1. Verificar status do Google Drive Desktop (ícone na barra)
2. **NÃO editar nada** durante "Sincronização em andamento"
3. Se conflito: Drive cria `arquivo (1).ext`; preservar manualmente
4. Para resolver: fechar todos os editores, esperar sync terminar, então decidir entre versões

## Relação com outras regras

- `@.claude/rules/protecao-fontes.md` — proteção da planilha original
- `@.claude/rules/pipeline-python-etl.md` — `pathlib`, encoding, env vars Python
- `@.claude/rules/pipeline-reproducible.md` — Makefile/justfile com paths corretos