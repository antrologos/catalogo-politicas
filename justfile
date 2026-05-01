# FRM_CatalogoPoliticas — orquestração reproduzível
# Uso: `just <target>` ou `just` para listar targets
# Convenções em @.claude/rules/pipeline-reproducible.md

# Padrão: lista targets disponíveis
default:
    @just --list

# === ETL — pipeline da planilha → JSON canônico ===

# C.1.a — Carrega .xlsx, normaliza cabeçalhos, salva CSV bruto
load-planilha:
    python -B scripts/etl/load_planilha.py

# C.1.c — Aplica vocabulário canônico (drift ortográfico)
normalize:
    python -B scripts/etl/normalize.py

# C.1.d — Marca réplicas federais e duplicatas exatas
dedupe:
    python -B scripts/etl/dedupe.py

# C.1.e — Atribui id_interno (FRM-CP-...) e slug
build-ids:
    python -B scripts/etl/build_ids.py

# C.1.f — Valida contra .claude/context/policies-schema.json
validate:
    python -B scripts/etl/validate.py

# C.1.g — Gera JSON canônico final + symlink latest.json
build-json:
    python -B scripts/etl/build_json.py

# Pipeline ETL completo
etl: load-planilha normalize dedupe build-ids validate build-json

# === Links externos (C.2) ===

# C.2.a — Extrai e deduplica URLs das fichas
extract-links:
    python -B scripts/etl/extract_links.py

# C.2.b — HEAD em todos os links com rate-limit + robots.txt
validate-links:
    python -B scripts/captura/validar_links.py

# === Captura amostral (C.3) ===

# C.3.b — Seleciona 20-30 URLs estratificadas
selecionar-amostra:
    python -B scripts/captura/selecionar_amostra.py

# C.3.c — Captura amostra (snapshot integral + metadata)
capturar-amostra:
    python -B scripts/captura/capturar_amostra.py

# C.3.d — Avaliar qualidade da amostra capturada
avaliar-amostra:
    python -B scripts/captura/avaliar_amostra.py

# Captura completa (selecionar → capturar → avaliar)
captura: selecionar-amostra capturar-amostra avaliar-amostra

# D.3 — Captura completa de todas as URLs OK
capturar-completo:
    python -B scripts/captura/capturar_completo.py

# D.5 — Revalidação periódica de snapshots (apenas fichas com proxima_revisao < hoje)
revalidar:
    python -B scripts/captura/revalidar.py

# D.5 — Revalidação total (todas as fichas com snapshot)
revalidar-todas:
    python -B scripts/captura/revalidar.py --todas

# === Pipeline completo do Bloco C ===

all: etl extract-links validate-links captura

# === Testes ===

test:
    python -B -m pytest tests/ -v

test-toy:
    python -B -m pytest tests/toy_*.py -v

test-unit:
    python -B -m pytest tests/unit_*.py -v

test-integration:
    python -B -m pytest tests/integration_*.py -v --timeout 600

# === Higiene ===

# Limpa derivados intermediários (não toca raw nem snapshots)
clean:
    rm -rf data/derived/_intermediate/*
    rm -rf .pytest_cache __pycache__ .ruff_cache
    find . -type d -name "__pycache__" -exec rm -rf {} +

# Snapshot de backup (excluindo node_modules, builds)
backup:
    tar -czf "backups/snapshot-$(date +%Y-%m-%d).tar.gz" \
        --exclude='node_modules' --exclude='__pycache__' \
        --exclude='.venv' --exclude='.next' --exclude='backups' \
        --exclude='data/external_snapshots/*.html' \
        --exclude='data/external_snapshots/*.pdf' .

# === Setup ===

# Instala dependências Python
install:
    python -m pip install --upgrade pip
    pip install -r requirements.txt
