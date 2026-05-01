---
descricao: Boas práticas Python para o pipeline de ETL e captura. Encoding, pathlib, subprocess, isolamento de credenciais, organização de testes, stack recomendada.
escopo: pipeline · ETL · captura
versao: 1.0
ultima_revisao: 2026-05-01
paths:
  - "scripts/**/*.py"
  - "tests/**/*.py"
  - "*.py"
  - "requirements.txt"
  - "pyproject.toml"
---

# Pipeline Python — boas práticas

**Status:** OBRIGATÓRIA · **Escopo:** todo código Python no projeto

Este projeto roda em **Windows + Google Drive compartilhado**, com paths Unicode (cedilha, acento) e nomes longos. Estas regras evitam armadilhas conhecidas dessa combinação.

## 11 princípios de ouro

### 1. Encoding UTF-8 explícito em todo I/O

```python
# CORRETO
with open(path, "r", encoding="utf-8") as f:
    conteudo = f.read()

path.read_text(encoding="utf-8")
path.write_text(texto, encoding="utf-8", newline="\n")
```

Nunca confiar no encoding padrão do sistema (Windows é cp1252; Linux é utf-8). Strings com `Políticas`, `São Paulo`, `Pará` quebram silenciosamente sem `encoding="utf-8"` explícito.

### 2. `python -B` ou `PYTHONDONTWRITEBYTECODE=1`

Pasta `__pycache__` no Drive sincado gera conflitos de versão entre máquinas. Sempre rodar com:

```bash
python -B scripts/etl/main.py
# ou
PYTHONDONTWRITEBYTECODE=1 python scripts/etl/main.py
```

Já está em `.claude/settings.json`:
```json
"env": { "PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8" }
```

### 3. `pathlib.Path` sempre, nunca string concat

```python
# CORRETO
from pathlib import Path
RAW = Path("data") / "raw" / "Fichas das Políticas - 1ª onda.xlsx"

# ERRADO
raw = "data" + "/" + "raw" + "/" + "Fichas..." + ".xlsx"
raw = "data\\raw\\Fichas..."  # quebra em Linux
```

Em paths que começam de um arquivo de configuração, resolver pelo arquivo (não pelo `cwd`):

```python
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent  # sobe até a raiz do projeto
DADOS = ROOT / "data"
```

### 4. `subprocess.run` com `capture_output=True`

```python
import subprocess
result = subprocess.run(
    ["python", "-B", "scripts/etl/normalize.py"],
    capture_output=True, text=True, encoding="utf-8",
    timeout=300,
)
if result.returncode != 0:
    raise RuntimeError(f"normalize falhou:\n{result.stderr}")
```

- Sempre `capture_output=True` (não vaza stdout/stderr no terminal)
- Sempre `text=True` + `encoding="utf-8"` (evita bytes)
- Sempre `timeout=` (pipeline travado é pior que pipeline que falha)
- Verificar `returncode` explicitamente

### 5. Nunca rodar com CWD = Drive/Dropbox raiz

Rodar Python diretamente com `cwd` em raiz de pasta sincada contamina `sys.path` (qualquer `.py` solto vira módulo importável). Sempre rodar de uma pasta de scripts:

```bash
cd scripts/etl
python -B main.py
```

Ou usar `python -m`:
```bash
python -B -m scripts.etl.main
```

### 6. Caminhos relativos em config resolvem ao arquivo

YAML/JSON de configuração que lista paths relativos: paths são relativos ao **arquivo de config**, não ao `cwd`.

```yaml
# config/etl.yaml
paths:
  raw: "../../data/raw/Fichas das Políticas - 1ª onda.xlsx"
  derived: "../../data/derived/"
```

```python
config_path = Path("config/etl.yaml").resolve()
config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
RAW = (config_path.parent / config["paths"]["raw"]).resolve()
```

### 7. Isolar credenciais em env vars; nunca hardcoded

```python
import os
TOKEN = os.environ["HF_TOKEN"]  # explode rápido se faltar; melhor que tarde
EMAIL = os.environ.get("CONTACT_EMAIL", "rogerio.barbosa@iesp.uerj.br")
```

- `.env` (gitignored) carrega via `python-dotenv` em desenvolvimento
- Em CI/CD: variáveis secret do GitHub Actions
- **Nunca** commitar `.env` ou tokens

### 8. Hierarquia de testes

Definida em `@.claude/rules/ciclo-investigacao-teste.md`:

| Nível | Localização | Tempo | Contexto |
|---|---|---|---|
| Toy | `tests/toy_<funcao>.py` | < 30s | sintético, função isolada |
| Unit | `tests/unit_<funcao>.py` | < 2min | dados reais mínimos |
| Integração | `tests/integration_<pipeline>.py` | sem limite | pipeline completo |

### 9. Organização de testes

```
tests/
├── conftest.py                      # fixtures pytest
├── toy_normalize_esfera.py          # toy: sem dados reais
├── toy_dedupe_federais.py
├── unit_load_planilha.py            # unit: planilha real, 10 fichas
├── unit_validate_schema.py
├── integration_etl_completo.py      # full pipeline
└── fixtures/
    ├── planilha-mini.xlsx           # 10 fichas (1/UF + federal)
    └── snapshot-modelo.html
```

Convenção de nome de teste:
```python
def test_normalize_esfera_remove_endash():
    ...
def test_dedupe_federais_marca_replicas():
    ...
```

### 10. App Service / Orquestrador centralizado

Para o pipeline ETL, módulo central que orquestra todas as etapas:

```python
# scripts/etl/orchestrator.py
class ETLOrchestrator:
    def __init__(self, config_path: Path):
        self.config = self._load_config(config_path)

    def run_all(self):
        df = self.load_planilha()
        df = self.normalize(df)
        df = self.dedupe(df)
        self.validate(df)
        self.build_json(df)
```

Não escalar I/O e regras de negócio espalhados em scripts soltos.

### 11. Sem dependências pesadas sem necessidade

- Para 412 URLs estáveis: **não** usar `scrapy` (overkill); use `httpx + tenacity`
- Para texto público: **não** usar `playwright/selenium` (alvo não exige JS); use `httpx`
- Para Excel: `openpyxl(read_only=True)` ou `pandas.read_excel`; nunca instalar Excel-COM no servidor

## Stack Python recomendada

Definida considerando captura responsável (`@.claude/rules/captura-responsavel.md`) e ETL.

| Função | Lib | Justificativa |
|---|---|---|
| HTTP client | `httpx` | HTTP/2, API moderna |
| HTML extraction | `trafilatura` | F1=0.945; fallback `bs4 + lxml` |
| PDF text | `pdfplumber` | Bom em tabelas; fallback `pypdf` |
| PDF OCR | `ocrmypdf` | Tesseract `--language por` |
| DOCX | `python-docx` | Padrão de facto |
| Encoding detection | `charset-normalizer` | Sem GPL; vem com httpx |
| MIME magic | `puremagic` | Zero deps; libmagic não garantido em Windows |
| Retry/backoff | `tenacity` | Decorators; jitter, exponencial |
| Schema validation | `pydantic` | Modelo claro; exporta JSON-Schema |
| Excel | `openpyxl`, `pandas` | Leitura segura; data analysis |
| YAML | `pyyaml` | Padrão |
| dotenv | `python-dotenv` | Carrega `.env` em dev |

### `requirements.txt` esboço

```text
# Core ETL
pandas>=2.0
openpyxl>=3.1
pyyaml>=6.0
python-dotenv>=1.0
pydantic>=2.0

# Captura externa
httpx>=0.27
tenacity>=8.0
trafilatura>=1.10
beautifulsoup4>=4.12
lxml>=5.0
pdfplumber>=0.11
pypdf>=4.0
python-docx>=1.1
charset-normalizer>=3.3
puremagic>=1.27

# OCR opcional (requires tesseract no PATH)
ocrmypdf>=16.0

# Testes
pytest>=8.0
pytest-cov>=5.0
```

Pinning de versões major: para ambientes reproduzíveis, gerar `requirements.lock` com `pip-tools compile`.

## Padrões de código

- **Type hints sempre** em assinatura pública (`def fn(x: str) -> Path:`)
- **Docstring curta** em função pública (PT-BR; o que faz e o que retorna)
- **Logging via `logging` module** (não `print`) em código de produção; `print` ok em scripts toy
- **Sem `from x import *`**
- **Constantes em UPPERCASE** no topo do módulo

## Anti-padrões proibidos

- Hardcode de tokens, paths absolutos da máquina, ou caminhos com letra de drive (`g:\...`)
- `os.path.join` quando `Path / "subdir"` resolveria
- `open(path)` sem `encoding="utf-8"`
- `requests` quando o projeto padronizou `httpx`
- Loops `while True` sem `break` claro nem timeout
- Captura de exceção genérica (`except:` ou `except Exception:` sem re-raise)
- Modificar `sys.path` em runtime para "fazer import funcionar"
- Rodar `pip install` dentro de scripts de produção

## Relação com outras regras

- `@.claude/rules/ciclo-investigacao-teste.md` — protocolo de teste
- `@.claude/rules/operacao-drive.md` — paths Windows + Drive
- `@.claude/rules/captura-responsavel.md` — uso de httpx, trafilatura, etc.
- `@.claude/rules/pipeline-reproducible.md` — automação via justfile/Makefile