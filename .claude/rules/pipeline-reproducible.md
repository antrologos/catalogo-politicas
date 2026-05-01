---
descricao: Pipeline reproduzível com justfile/Makefile, testes idempotentes, CI/CD GitHub Actions com windows-latest, validação contra schema.
escopo: pipeline · automação · CI
versao: 1.0
ultima_revisao: 2026-05-01
paths:
  - "scripts/**"
  - "tests/**"
  - "Makefile"
  - "justfile"
  - ".github/workflows/**"
---

# Pipeline Reproduzível

**Status:** OBRIGATÓRIA · **Escopo:** automação do ETL e CI/CD

## Princípio

Toda transformação de dado é **rodável sem clique manual**. `just <target>` ou `make <target>` é a única interface oficial. Cada target é **idempotente** (rodar 2× produz o mesmo resultado). CI/CD valida cada push.

## Justfile (preferido) ou Makefile

`just` é mais legível em Windows; `make` é universal. Escolha do projeto: **`justfile`** com `Makefile` mínimo como fallback.

### Targets obrigatórios

```just
# justfile na raiz do projeto

# Mostra targets disponíveis
default:
    @just --list

# Carrega a planilha em DataFrame e salva CSV bruto
load-planilha:
    python -B scripts/etl/load_planilha.py

# Normaliza cabeçalhos e valores categóricos (drift ortográfico)
normalize:
    python -B scripts/etl/normalize.py

# Detecta e marca duplicatas / réplicas federais
dedupe:
    python -B scripts/etl/dedupe.py

# Valida contra policies-schema.json
validate:
    python -B scripts/etl/validate.py

# Gera o JSON canônico final em data/derived/
build-json:
    python -B scripts/etl/build_json.py

# Pipeline completo
all: load-planilha normalize dedupe validate build-json

# Testes
test:
    pytest tests/ -v

test-toy:
    pytest tests/toy_*.py -v

test-unit:
    pytest tests/unit_*.py -v

test-integration:
    pytest tests/integration_*.py -v --timeout 600

# Limpa derivados (não toca raw nem snapshots)
clean:
    rm -rf data/derived/*.tmp.json
    rm -rf .pytest_cache .ruff_cache __pycache__

# Snapshot de backup
backup:
    tar -czf "backups/snapshot-$(date +%Y-%m-%d).tar.gz" \
        --exclude='node_modules' --exclude='__pycache__' \
        --exclude='.venv' --exclude='.next' .
```

### Idempotência

Cada target deve produzir o mesmo resultado se rodado 2 vezes seguidas:
- `load-planilha` lê a planilha, sobrescreve o CSV bruto temporário (mesmo conteúdo)
- `normalize` lê CSV bruto, sobrescreve CSV normalizado (mesmo conteúdo)
- `build-json` gera JSON com **timestamp do build** mas conteúdo determinístico
- Saída final em `data/derived/<onda>-<data>.json` — o `<data>` muda, mas o conteúdo dado o mesmo input não muda

**Nunca** produzir saída com timestamp interno aleatório que mude a cada run sem mudança de input.

### Ordem das dependências

```
load-planilha → normalize → dedupe → validate → build-json
```

Cada etapa lê o output da anterior; saída de cada etapa em arquivo separado para debug e re-execução parcial:

```
data/derived/_intermediate/raw.csv             # output de load-planilha
data/derived/_intermediate/normalized.csv      # output de normalize
data/derived/_intermediate/deduped.csv         # output de dedupe
data/derived/_intermediate/validated.csv       # output de validate
data/derived/policies-onda-1-<data>.json       # output de build-json (final)
```

## Testes do pipeline

### Subset de testes mínimo

Toda mudança no pipeline ETL roda contra subset de **10 fichas** em `tests/fixtures/planilha-mini.xlsx`:

- 1 ficha por UF (9 fichas)
- 1 ficha federal
- Cobertura de casos limites: cedilha (Pará), espaço inicial (` Planilha SP`), `Coluna 1` (BA), drift ortográfico (`Estadual::`)

### Testes obrigatórios

```python
# tests/unit_load_planilha.py
def test_load_todas_abas():
    """Carrega todas as 11 abas, valida nomes literais."""
    ...

def test_load_aba_com_espaco_inicial():
    """ Planilha SP carrega com espaço."""
    ...

# tests/unit_normalize.py
def test_normalize_esfera_remove_endash():
    """Estadual – SEDUC vira Estadual: SEDUC."""
    ...

def test_normalize_cabecalho_id_variante():
    """ID, Id, Coluna 1 viram id."""
    ...

# tests/unit_dedupe.py
def test_dedupe_pronatec_bahia():
    """BA tem 2× PRONATEC; dedupe marca duplicatas."""
    ...

def test_marca_replica_federal():
    """Ficha estadual com 'EM TODOS OS ESTADOS' vira réplica."""
    ...

# tests/unit_validate.py
def test_validate_schema_v1():
    """Output de build-json passa em policies-schema.json."""
    ...

def test_validate_categoria_invalida_falha():
    """Categoria fora do vocabulário canônico falha validação."""
    ...

# tests/integration_etl_completo.py
def test_pipeline_completo_subset():
    """Roda all → produz JSON; valida estrutura e contagem."""
    assert len(politicas) == 10
    assert all("id" in p and p["id"].startswith("FRM-CP-") for p in politicas)
```

### Edge cases obrigatórios

- Aba com nome com espaço inicial
- Ficha sem `nome_programa` (deve falhar com mensagem clara)
- Ficha com acento em `nome_programa` (`São Paulo`, `Pará`)
- Duplicata exata na mesma UF
- Réplica federal sem `EM TODOS OS ESTADOS` mas com `nome_programa` igual
- Categoria com label PT que tem variante (`Qualificação`, `qualificacao`)

## CI/CD GitHub Actions

### Workflow básico

`.github/workflows/etl-validate.yml`:

```yaml
name: ETL & Validate

on:
  push:
    branches: [main]
    paths:
      - 'data/raw/**'
      - 'scripts/etl/**'
      - 'context/policies-schema.json'
      - 'context/vocabulario-canonico.json'
      - 'tests/**'
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  etl-validate:
    runs-on: windows-latest    # paths Unicode + Windows-like
    timeout-minutes: 20

    env:
      PYTHONDONTWRITEBYTECODE: "1"
      PYTHONIOENCODING: "utf-8"
      LANG: "pt_BR.UTF-8"

    steps:
      - uses: actions/checkout@v4
        with:
          lfs: false

      - name: Configure git for long paths
        run: git config --system core.longpaths true

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Install just
        run: |
          choco install just -y
        shell: powershell

      - name: Run pipeline (subset)
        run: just all
        env:
          USE_FIXTURES: "true"   # usa tests/fixtures/planilha-mini.xlsx

      - name: Run tests
        run: just test

      - name: Validate output schema
        run: |
          python -B scripts/etl/validate.py --strict --file data/derived/policies-onda-1-*.json

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: etl-output
          path: |
            data/derived/policies-onda-1-*.json
            data/derived/_intermediate/
          retention-days: 14
```

### Falhas que bloqueiam o merge

- Schema inválido em `data/derived/*.json` (exit 2)
- Teste unit ou integration falhando
- Categoria referenciada não existe no vocabulário
- Encoding não-UTF-8 em arquivo gerado
- Slug duplicado

### `windows-latest` runner

Usar `windows-latest` (não `ubuntu-latest`) porque:
- O ambiente real de produção é Windows + Drive
- Bugs de path Unicode aparecem em Windows, não em Linux
- Testar onde o usuário roda

Se o tempo de CI for problema, alternativa: `ubuntu-latest` no PR + `windows-latest` no push para `main`.

## Procedimento de rollback

Se um build entra em produção com bug:

```bash
# 1. Identificar o último JSON canônico válido conhecido
ls -lt data/derived/policies-onda-1-*.json

# 2. Atualizar symlink latest.json para apontar para o anterior
ln -sf policies-onda-1-2026-04-15.json data/derived/latest.json

# 3. Investigar com /plan
# 4. Corrigir e re-rodar pipeline
```

JSON canônico anterior é mantido por padrão (`@.claude/rules/protecao-fontes.md` R7 — versionamento sem sobrescrita).

## Anti-padrões proibidos

- Script ETL solto que não está no `justfile`
- Target que precisa de input interativo
- Output que muda a cada run com mesmo input (não-determinístico)
- Hardcode de paths Windows (`g:\...`) em scripts
- Pular `just validate` antes de `just build-json`
- Commitar `data/derived/_intermediate/` (gitignored)
- Workflow CI que roda sem `windows-latest`

## Relação com outras regras

- `@.claude/rules/pipeline-python-etl.md` — convenções Python
- `@.claude/rules/dados-politicas.md` — schema e vocabulário
- `@.claude/rules/protecao-fontes.md` — imutabilidade da fonte
- `@.claude/rules/operacao-drive.md` — paths Windows + Drive
- `@.claude/rules/ciclo-investigacao-teste.md` — protocolo de testes
