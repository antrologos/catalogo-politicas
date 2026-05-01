# Plano: Bloco C — Exploração rica dos dados (limpeza + catalogação + amostragem)

**Status**: CONCLUIDO (2026-05-01)
**Data**: 2026-05-01
**Bloco/Rodada**: C (executável após Blocos A+B concluídos)

## Contexto

Blocos A e B fecharam a meta-infraestrutura `.claude/` (10 rules, 3 skills, 3 hooks, schema, vocabulário stub). O Bloco C transforma os 439 fichas da planilha em um **dataset canônico JSON** validado contra schema, com vocabulário canônico preenchido com base nos dados reais, links externos catalogados/validados, e uma amostra de 20-30 documentos externos capturados.

## Objetivo

Produzir `data/derived/policies-onda-1-2026-05-01.json` (canônico, validado), `data/derived/links-onda-1-2026-05-01.csv` (catalogado e validado), 20-30 snapshots externos em `data/external_snapshots/` + relatório consolidado de qualidade.

## Decisões da usuária (via AskUserQuestion antes deste plano)

1. **Mover planilha** para `data/raw/` (alinhar com `protecao-fontes.md`)
2. **Alinhar regra `dados-politicas.md` ao schema** (schema é o contrato concreto; mais auditado)
3. **Escopo: Tudo + extras** — C.1 + C.2 + C.3 completo + skill `capturar-norma` completa (não apenas MVP). Vira mini-Bloco D dentro de C.

## Abordagem

Estruturado em sub-blocos sequenciais. Cada sub-bloco tem entregável próprio, validado antes de passar para o próximo.

### C.0 — Preparação infraestrutural (precondição)

- [ ] Criar pastas: `data/raw/`, `data/external_snapshots/`, `data/extracted_text/`, `data/annotations/`, `data/derived/_intermediate/`, `data/logs/`, `scripts/etl/`, `scripts/captura/`, `tests/fixtures/`, `backups/`
- [ ] Mover `Fichas das Políticas - 1ª onda.xlsx` da raiz para `data/raw/`
- [ ] Atualizar CLAUDE.md (path da planilha)
- [ ] Criar `requirements.txt` (httpx, tenacity, trafilatura, pdfplumber, pypdf, python-docx, charset-normalizer, puremagic, jsonschema, pytest, openpyxl, pandas, pyyaml, python-dotenv, pydantic)
- [ ] Criar `justfile` com targets `load-planilha`, `normalize`, `dedupe`, `validate`, `build-json`, `extract-links`, `validate-links`, `capturar-amostra`, `all`, `test`, `clean`
- [ ] Sanity check: hook `block_xlsx_write.py` ainda funciona com novo path
- [ ] (Opcional) `git init` + primeiro commit
- [ ] Alinhar `dados-politicas.md` ao schema (tarefa de housekeeping; **plan mode obrigatório** porque toca `.claude/rules/`)

### C.1 — Limpeza / normalização do schema

#### C.1.a — Loader resiliente (`scripts/etl/load_planilha.py`)

- [ ] Lê todas as 11 abas com nomes literais (incluir espaços iniciais ` Planilha SP`, ` Planilha RJ`, ` Planilha Pará` e truncamento `Políticas federais (comuns a to`)
- [ ] Normaliza cabeçalhos: mapeia `Id`/`ID`/`Coluna 1` → `id`; `Link`/`Link oficial` → `link`; `Dúvidas`/`Dúvida` → `duvidas`
- [ ] Remove instruções `(Verificar planilha Categorias)` dos cabeçalhos (regex)
- [ ] Remove colunas-fantasma vazias (RS tem 3, PA tem 4)
- [ ] Adiciona coluna `aba_origem` e `uf` por linha
- [ ] Saída: `data/derived/_intermediate/raw_planilha.csv`
- [ ] Toy test: carregar 10 fichas (1/UF + federal) e verificar headers normalizados

#### C.1.b — Vocabulário canônico (preencher `vocabulario-canonico.json`)

**⚠️ Plan Mode obrigatório** (toca `paths_obrigam_plan_mode`).

Sub-tarefa em si requer:
- [ ] Investigar todas as variantes de cada um dos 7 campos categóricos: `tipo_politica`, `esfera_formulacao`, `esfera_execucao`, `abrangencia_territorial`, `tipo_oferta`, `modalidade_oferta`, `arranjo_logistico` (mais `situacao_atual`)
- [ ] Listar valores únicos brutos em cada campo (já documentado parcialmente no CLAUDE.md)
- [ ] Definir vocabulário canônico (consultar aba `Modelo categorias` da planilha; cruzar com Devil's Advocate para evitar inflar)
- [ ] Mapear variantes ortográficas → canônico (en-dash → hífen, aspas curvas → retas, dois-pontos duplos → um, capitalização)
- [ ] ADR documentando escolhas: `.claude/decisions/2026-05-01_vocabulario-canonico.md`
- [ ] Atualizar `vocabulario-canonico.json` com `canonical_values` + `variants` por campo

#### C.1.c — Normalização (`scripts/etl/normalize.py`)

- [ ] Aplica `vocabulario-canonico.json` em cada coluna categórica
- [ ] Logs todos os valores não-mapeados em `data/logs/normalize_unmapped_2026-05-01.csv` para revisão
- [ ] Saída: `data/derived/_intermediate/normalized.csv`

#### C.1.d — Deduplicação (`scripts/etl/dedupe.py`)

- [ ] Identifica fichas estaduais com marcador `EM TODOS OS ESTADOS` em coluna `duvidas` → marca como `is_federal_replica: true`
- [ ] Linka `federal_source_id` para a federal correspondente (matching por `nome` normalizado)
- [ ] Detecta duplicatas exatas conhecidas (BA: 2× PRONATEC, 2× Juros) → marca a 2ª como `duplicada_de`
- [ ] Saída: `data/derived/_intermediate/deduped.csv`

#### C.1.e — Construção de IDs e slugs (`scripts/etl/build_ids.py`)

- [ ] Atribui `id_interno`: `FRM-CP-2026-{EDU/TRAB/PSOC}-{seq:04d}` (escopo derivado de `tipo_politica`)
- [ ] Gera `slug` único: lowercase + remoção de diacríticos + hífens; sufixo `-2`, `-3` em colisão
- [ ] Saída: `data/derived/_intermediate/with_ids.csv`

#### C.1.f — Validação contra schema (`scripts/etl/validate.py`)

- [ ] Carrega `.claude/context/policies-schema.json`
- [ ] Valida cada linha contra schema; lista violações
- [ ] Tolera campos opcionais ausentes; não tolera obrigatórios ausentes
- [ ] Relatório: `data/derived/_intermediate/validation_report.json`

#### C.1.g — Build JSON canônico (`scripts/etl/build_json.py`)

- [ ] Calcula `completude_pct` (peso por campo: obrigatórios=2, opcionais=1; ratio preenchido/total)
- [ ] Gera `citacao_apa` e `citacao_bibtex` (formato simples baseado em `nome` + `ano_criacao` + `fonte_url`; iterar)
- [ ] `criado_em`/`atualizado_em`/`data_versao_catalogo` = `2026-05-01T...`
- [ ] `revisado_por` = "Maria Clara Gama" (das anotações do workbook)
- [ ] Saída final: `data/derived/policies-onda-1-2026-05-01.json` + symlink `latest.json`

#### C.1.h — Tests do pipeline ETL

- [ ] `tests/fixtures/planilha-mini.xlsx`: 10 fichas reais (1/UF + 1 federal) — extraídas da planilha real
- [ ] `tests/unit_load_planilha.py`: cobre abas com espaço inicial, truncamento, colunas-fantasma
- [ ] `tests/unit_normalize.py`: en-dash → hífen, aspas curvas → retas, "Estadual::" → "Estadual:"
- [ ] `tests/unit_dedupe.py`: marca PRONATEC duplicado em BA, marca réplicas federais
- [ ] `tests/unit_validate.py`: schema rejeita ficha com `tipo_politica` inválida
- [ ] `tests/integration_etl_completo.py`: roda pipeline completo no subset; ≥10 políticas no JSON; todas com `id_interno` e `slug`

### C.2 — Catalogação dos links externos

#### C.2.a — Extração de URLs (`scripts/etl/extract_links.py`)

- [ ] Extrai URLs de `link`, `link_oficial`, `base_legal`, `informacoes_complementares` (URLs embutidas em texto livre via regex)
- [ ] Deduplica por URL canônica (lowercase, remove fragment, normaliza trailing slash)
- [ ] Classifica por domínio (`planalto.gov.br`, `gov.br`, `mec.gov.br`, etc.)
- [ ] Para cada URL: lista de `id_interno` que a referenciam (relação muitos-para-muitos)
- [ ] Saída: `data/derived/links-onda-1-2026-05-01.csv` + `data/derived/links-onda-1-2026-05-01.json` (estruturado com `referenciada_por`)

#### C.2.b — Validação HEAD (`scripts/captura/validar_links.py`)

- [ ] Implementa rate-limit por domínio (R3 captura-responsavel: 1 req/2s)
- [ ] Respeita `robots.txt` cacheado 24h
- [ ] User-Agent identificável (R1)
- [ ] HEAD em todos os links; classifica: 200, 301/302, 403, 404, 5xx, timeout
- [ ] Em 301/302: segue até 5 hops; registra URL final + redirect chain
- [ ] Saída: `data/derived/links-validados-onda-1-2026-05-01.csv` + relatório `data/derived/links-validados-relatorio-2026-05-01.md` (% por status, links quebrados por domínio)

### C.3 — Amostragem de conteúdo externo + skill `capturar-norma` completa

#### C.3.a — Implementar skill `capturar-norma` (versão completa)

**⚠️ Plan Mode obrigatório** (toca `.claude/skills/`; também escreve `scripts/captura/`).

Conforme esboço em `.claude/working/R3-A3.3-scraping-responsavel.md` e `R2-A2.3-skills-agents-hooks-RAW.md`:

- [ ] `.claude/skills/capturar-norma/SKILL.md` (frontmatter + algoritmo 11 etapas)
- [ ] `scripts/captura/capturar_norma.py` (implementação Python):
  - Pre-flight (validar URL, robots.txt cacheado, Crawl-delay)
  - Aguardar slot (rate-limit por domínio)
  - HEAD opcional (se snapshot anterior existe; comparar Last-Modified/ETag)
  - GET com User-Agent, timeouts (10/30/60), follow redirects (5 max), backoff em 429/503
  - Validação bruta (status 200, tamanho ≥ 1KB HTML / 5KB PDF, MIME match)
  - Hash SHA-256 + dedupe (se hash existe, atualizar `ultimo_visto`)
  - Salvar snapshot em `data/external_snapshots/<sha[:2]>/<sha>.<ext>`
  - Extração de texto:
    - HTML: `trafilatura.extract`
    - PDF: `pdfplumber` (fallback `pypdf` se vazio); OCR via `ocrmypdf --language por` se PDF escaneado
    - DOCX: `python-docx`
    - DOC legado: `subprocess libreoffice --headless --convert-to txt`
    - ODT: `odfpy`
  - Validação extraído (sem regex de erro; palavras-chave por tipo; PII scan CPF/CNPJ — flag se > 5)
  - Metadata `<sha>.metadata.json` + log JSONL
  - Atualizar `data/external_snapshots/index.json`

#### C.3.b — Selecionar amostra estratificada (`scripts/captura/selecionar_amostra.py`)

- [ ] Lê `data/derived/links-validados-onda-1-2026-05-01.csv`
- [ ] Seleciona 20-30 URLs amostradas estratificadas:
  - Por domínio: pelo menos 2 de gov.br, planalto, in.gov.br, mec, secretarias estaduais
  - Por tipo: lei, decreto, portaria, página de programa
  - Apenas com status 200 (válidos)
- [ ] Saída: `data/derived/amostra-captura-2026-05-01.csv` (lista de URLs)
- [ ] ADR documentando critérios: `.claude/decisions/2026-05-01_amostra-captura.md`

#### C.3.c — Capturar amostra (`just capturar-amostra`)

- [ ] Para cada URL da amostra: invoca `capturar-norma`
- [ ] Salva snapshots em `data/external_snapshots/`
- [ ] Compila relatório por captura

#### C.3.d — Avaliar amostra (`scripts/captura/avaliar_amostra.py`)

- [ ] Para cada snapshot capturado: estatísticas (formato, tamanho, encoding, palavras extraídas, PII flag)
- [ ] Identifica problemas (sites que retornam 200 com erro, PDFs scaneados sem OCR, textos curtos suspeitos)
- [ ] Saída: `data/derived/amostra-avaliacao-2026-05-01.md` com tabela + análise + recomendações para Bloco D

#### C.3.e — Relatório consolidado de qualidade do Bloco C

- [ ] `data/derived/quality-report-bloco-c-2026-05-01.md`:
  - Sumário: 439 fichas processadas, X% schema válido, Y campos com vocabulário fechado preenchido
  - Vocabulário canônico: tabela final por campo (canonical_values + N variantes mapeadas)
  - Deduplicação: N réplicas federais identificadas, N duplicatas exatas tratadas
  - Links externos: N únicos, % por status (200/301/404), top 10 domínios
  - Amostra: 30 URLs capturadas, % por formato, % com texto extraído, casos problemáticos
  - Próximos passos para Bloco D

### Verificação pós-implementação

- [ ] `data/derived/policies-onda-1-2026-05-01.json` existe e valida contra schema
- [ ] `data/derived/links-validados-onda-1-2026-05-01.csv` tem todas as URLs deduplicadas
- [ ] `data/external_snapshots/` tem 20-30 snapshots
- [ ] Todos os testes passam (`just test`)
- [ ] CLAUDE.md atualizado (path da planilha + status para "Bloco C concluído")
- [ ] `MEMORY.md` do projeto atualizado com descobertas
- [ ] ADRs registrados em `.claude/decisions/`
- [ ] Hook `validate_json_schema.py` valida o JSON gerado sem erros críticos

## Arquivos a modificar

### Pastas a criar
- `data/raw/`, `data/derived/_intermediate/`, `data/external_snapshots/`, `data/extracted_text/`, `data/annotations/`, `data/logs/`
- `scripts/etl/`, `scripts/captura/`
- `tests/`, `tests/fixtures/`
- `backups/`
- `.claude/skills/capturar-norma/`

### Arquivos a criar (estimativa: ~25 arquivos)
- `requirements.txt`, `justfile`
- `scripts/etl/{load_planilha,normalize,dedupe,build_ids,validate,build_json,extract_links}.py`
- `scripts/captura/{validar_links,capturar_norma,selecionar_amostra,avaliar_amostra}.py`
- `scripts/captura/_robots.py`, `scripts/captura/_rate_limit.py` (helpers)
- `tests/conftest.py`, `tests/unit_*.py` (5+), `tests/integration_*.py`, `tests/toy_*.py` (poucos)
- `tests/fixtures/planilha-mini.xlsx` (extraída da real)
- `.claude/skills/capturar-norma/SKILL.md`
- `.claude/decisions/2026-05-01_vocabulario-canonico.md`
- `.claude/decisions/2026-05-01_amostra-captura.md`
- `data/derived/policies-onda-1-2026-05-01.json` (output)
- `data/derived/links-onda-1-2026-05-01.{csv,json}` (output)
- `data/derived/links-validados-onda-1-2026-05-01.csv` (output)
- `data/derived/amostra-captura-2026-05-01.csv`, `amostra-avaliacao-2026-05-01.md`, `quality-report-bloco-c-2026-05-01.md`

### Arquivos a modificar
- `CLAUDE.md` — path da planilha (`Fichas das Políticas - 1ª onda.xlsx` → `data/raw/Fichas das Políticas - 1ª onda.xlsx`); status atualizado
- `.claude/context/vocabulario-canonico.json` — preencher canonical_values + variants (em sub-bloco C.1.b com plan mode próprio)
- `.claude/rules/dados-politicas.md` — alinhar nomes de campo ao schema (housekeeping; em C.0 com plan mode próprio)

## Arquivos que NÃO serão tocados

- `Fichas das Políticas - 1ª onda.xlsx` em si (apenas movido por `mv`, não editado; hook bloqueia Edit/Write)
- `.claude/rules/*.md` exceto `dados-politicas.md`
- `.claude/hooks/*.py`
- `.claude/context/policies-schema.json` (a menos que descobertas em C.1 forcem ajuste; nesse caso, plan mode próprio)
- `.claude/settings.json`
- 11 regras antigas em `.claude/archive/`

## Testes previstos

- **Toy** (`tests/toy_*.py`): normalização de en-dash, geração de slug, hash de string conhecida
- **Unit** (`tests/unit_*.py`): load 10 fichas, normalize, dedupe, build_ids, validate (5 arquivos)
- **Integration** (`tests/integration_etl_completo.py`): pipeline completo no subset 10 fichas + assertions de saída
- **Integration captura** (`tests/integration_captura_minima.py`): captura 1 URL conhecida (ex.: planalto.gov.br/ccivil_03/leis/l9394.htm) e valida snapshot + metadata + texto extraído

## Riscos e mitigações

- **Risco**: Hook `validate_json_schema.py` bloqueia escrita do JSON se schema falhar → **Mitigação**: rodar `just validate` antes de `build_json`; se hook bloquear, rever schema vs. output e iterar.
- **Risco**: Vocabulário canônico fica gigante (drift muito alto) → **Mitigação**: aceitar `_outros` como bucket inicial; documentar variantes em ADR; tratar em ondas posteriores.
- **Risco**: Captura de amostra falha em vários sites (gov.br instável) → **Mitigação**: retry com backoff (já em R3); logar falhas; aceitar amostra menor (≥10) se necessário.
- **Risco**: PII scan flagra muitos snapshots → **Mitigação**: revisar caso a caso; se for falso-positivo (ex.: CPF de exemplo na lei), refinar regex.
- **Risco**: Tempo total alto (3-7 dias?) → **Mitigação**: dividir em sessões, atualizar `MEMORY.md` ao fim de cada sub-bloco; usar `just <target>` para retomar parcial.
- **Risco**: Schema vs. regra `dados-politicas.md` divergem em mais lugares que mapeei → **Mitigação**: housekeeping em C.0 documenta diferenças e alinha; revisão humana antes de aplicar.
- **Risco**: Mover planilha quebra hooks → **Mitigação**: hook `block_xlsx_write.py` é path-agnostic (verifica nome do arquivo, não caminho completo); testar antes de qualquer write.

## Status

- [x] C.0 Preparação infraestrutural
- [x] C.1 Limpeza/normalização (a-h) — 439/439 fichas válidas
- [x] C.2 Catalogação de links (a, b) — 182 URLs; 61% OK
- [x] C.3 Amostragem + skill capturar-norma (a-e) — 25/25 capturados
- [x] Verificação pós-implementação — 43/43 testes; 0 erros schema
- [x] CLAUDE.md atualizado
- [x] MEMORY.md (project_catalogo_politicas.md) atualizado
- [x] Status mudado para CONCLUIDO

## Relação com outras regras/planos

- `@.claude/rules/planejamento-obrigatorio.md` — sub-tarefas C.1.b e C.3.a exigem plan mode próprio
- `@.claude/rules/protecao-fontes.md` — planilha imutável; hook bloqueia escrita
- `@.claude/rules/dados-politicas.md` — schema, vocabulário, deduplicação
- `@.claude/rules/pipeline-python-etl.md` — encoding, pathlib, subprocess, stack
- `@.claude/rules/pipeline-reproducible.md` — justfile, testes, idempotência
- `@.claude/rules/captura-responsavel.md` — robots.txt, rate-limit, snapshot, atribuição
- `@.claude/rules/ciclo-investigacao-teste.md` — ciclo invest→plan→test→implement
- `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md` — plano macro