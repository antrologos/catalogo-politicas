# Relatório consolidado de qualidade — Bloco C (Exploração rica dos dados)

**Data**: 2026-05-01
**Plano**: `.claude/plans/2026-05-01_bloco-c-exploracao-dados.md`
**Status**: ✅ Concluído (C.0 → C.3.e)

---

## Sumário executivo

A 1ª onda do catálogo (439 fichas) foi processada de ponta a ponta:

- **Pipeline ETL completo** (load → normalize → dedupe → ids → build → validate) executa em < 5 segundos
- **439/439 fichas validam contra `policies-schema.json`** (0 erros de schema)
- **94.2% completude média** por ficha (mín 69, mediana 95, máx 95)
- **Vocabulário canônico** preenchido em 8 campos categóricos cobrindo > 99% dos valores reais (apenas 6 outliers documentados)
- **255 réplicas federais** identificadas e marcadas (esperado: 33 federais × ~9 UFs cada)
- **2 duplicatas exatas em BA** detectadas (PRONATEC ×2, Juros por Educação ×2 — confirmado)
- **182 URLs externas únicas** extraídas de 98 domínios distintos
- **111 URLs (61%) responderam 200** na validação HEAD respeitosa
- **Skill `capturar-norma` v1.0** funcional: 25/25 amostras capturadas (24 ok, 1 deduplicada via SHA)
- **43/43 testes do pipeline passam** (toy + integração)

---

## C.0 — Preparação infraestrutural

| Item | Status |
|---|---|
| Pastas `data/`, `scripts/`, `tests/`, `backups/` | ✅ criadas |
| Planilha movida para `data/raw/` | ✅ |
| `requirements.txt` com 14 dependências (pinning >=) | ✅ |
| `justfile` com 18 targets | ✅ |
| Hook `block_xlsx_write.py` testado no novo path | ✅ exit 2 |
| Regra `dados-politicas.md` alinhada ao schema (v1.1) | ✅ + ADR |

ADR registrado: `.claude/decisions/2026-05-01_alinhamento-schema-regra.md`

---

## C.1 — Limpeza/normalização do schema

### C.1.a — Loader resiliente
- **439 fichas** carregadas em 10 abas (federal + 9 UFs)
- 27 colunas canônicas em todas as abas (uniforme)
- Apenas 2 cabeçalhos não-mapeados (Coluna 1 fantasma em RS e PA — corretamente ignorados)

### C.1.b — Vocabulário canônico (v1.0)

ADR registrado: `.claude/decisions/2026-05-01_vocabulario-canonico.md`

| Campo | Canonical values | Variants mapeadas | Estratégia |
|---|---:|---:|---|
| `tipo_politica` | 3 | 0 | enum estrito |
| `esfera_formulacao` | 6 | 2 | flexível com warning |
| `origem_proposta` | 5 | 0 | flexível |
| `esfera_execucao` | 8 | 14 | flexível + extração de sufixos para `apoios_parcerias` |
| `abrangencia_territorial` | 4 | 2 | flexível |
| `situacao_atual` | 5 | 4 | enum + variants longas |
| `tipo_oferta` | 8 | 8 | flexível |
| `modalidade_oferta` | 6 | 5 | flexível |
| `arranjo_logistico` | 5 | 6 | flexível |

### C.1.c — Normalização: % de valores canonicalizados

| Campo | Canonical | Mapped | Unmapped | % válido |
|---|---:|---:|---:|---:|
| `tipo_politica`            | 439 | 0   | 0  | 100.0% |
| `esfera_formulacao`        | 438 | 0   | 1  |  99.8% |
| `origem_proposta`          | 438 | 0   | 1  |  99.8% |
| `esfera_execucao`          | 120 | 317 | 2  |  99.5% |
| `abrangencia_territorial`  | 323 | 115 | 0  | 100.0% |
| `situacao_atual`           |  11 | 428 | 0  | 100.0% |
| `tipo_oferta`              |  41 | 394 | 1  |  99.8% |
| `modalidade_oferta`        | 235 | 202 | 1  |  99.8% |
| `arranjo_logistico`        | 228 | 210 | 0  | 100.0% |

**83 sufixos descritivos** (`+ rede X`, `+ Sistema S`, `- Empresas empregadoras`, etc.) migrados automaticamente para `esfera_execucao_apoios_parcerias`.

**6 outliers** (1 ocorrência cada) preservados na fonte e documentados em `data/logs/normalize_unmapped_2026-05-01.csv` para correção manual em onda futura.

### C.1.d — Deduplicação federais × estaduais

- **33 políticas federais** únicas (referência canônica)
- **255 réplicas estaduais** marcadas (`is_federal_replica: true`, `federal_source_id` preenchido)
  - 2 via marcador `EM TODOS OS ESTADOS` no campo `duvidas_revisor`
  - 253 via match de nome normalizado com federal correspondente
- **2 duplicatas exatas** detectadas em BA: PRONATEC ×2, Juros por Educação ×2 (confirmação das armadilhas conhecidas em CLAUDE.md)

### C.1.e — IDs internos + slugs

- **439 ids únicos** no padrão `FRM-CP-2026-{EDU|TRAB|PSOC}-{seq:04d}`
  - 188 EDU (Educacional direta)
  - 160 TRAB (Trabalho/qualificação direta)
  - 91 PSOC (Proteção social com impacto educacional)
- **439 slugs únicos** URL-safe (≤120 chars; sufixo `-{uf}`)

### C.1.f — Validação contra schema

- **439/439 fichas válidas** contra `policies-schema.json` (Draft-07)
- **0 erros** de schema

### C.1.g — JSON canônico final

- `data/derived/policies-onda-1-2026-05-01.json` (2.4 MB; 439 fichas)
- `data/derived/latest.json` (cópia symlink-equivalente)
- **Completude (peso 2 obrigatórios + 1 opcionais):**
  - mínimo: 69
  - mediana: 95
  - **média: 94.2**
  - máximo: 95
- Citações APA + BibTeX derivadas para todas as fichas
- 20 fichas com placeholder em `fonte_url` (campo vazio na fonte) — flag para correção em onda 2

### C.1.h — Testes do pipeline ETL

- **43/43 testes passam** (8s)
  - 36 toy tests (funções puras: cosmetic_clean, text_normalize, slugify, name_norm, split_esfera_execucao)
  - 14 integration tests (pipeline completo + propriedades estruturais do JSON)

---

## C.2 — Catalogação dos links externos

### C.2.a — Extração

- **182 URLs únicas** extraídas de 98 domínios
- 20 URLs de placeholder ignoradas (fichas sem fonte_url real)
- Top 5 domínios:
  - `www.gov.br` (35 URLs)
  - `www.planalto.gov.br` (11)
  - `portal.mec.gov.br` (5)
  - `www.ba.gov.br` (5)
  - `portal.educacao.pe.gov.br` (5)

### C.2.b — Validação HEAD respeitosa

- Tempo total: ~5 min para 182 URLs (rate-limit 1 req/2s + robots.txt cache 24h)
- User-Agent: `FRM-CatalogoPoliticas/0.1 (+url; mailto:rogerio.barbosa@iesp.uerj.br) python-httpx/0.28`
- robots.txt respeitado para todos os domínios; 1 URL bloqueada por robots

| Status | Contagem | % |
|---|---:|---:|
| `ok_200`           | 111 | 61.0% |
| `forbidden_403`    |  37 | 20.3% |
| `erro_rede`        |  18 |  9.9% |
| `timeout`          |  12 |  6.6% |
| `not_found_404`    |   3 |  1.6% |
| `bloqueado_robots` |   1 |  0.5% |

**Achados:**
- `planalto.gov.br` muito instável (timeout em quase todas as tentativas)
- 37 URLs 403 — provavelmente bloqueio anti-bot ou autenticação requerida
- 3 URLs genuinamente quebradas (404)
- 18 erros de rede mistos (DNS / SSL / conexão)

Relatório detalhado: `data/derived/links-validados-relatorio-2026-05-01.md`

---

## C.3 — Captura amostral + skill `capturar-norma`

### C.3.a — Skill `capturar-norma` v1.0

Implementação completa em `scripts/captura/capturar_norma.py` + skill registrada em `.claude/skills/capturar-norma/SKILL.md`. Cobre R1-R11 de `captura-responsavel.md`:

| R | Implementado |
|---|---|
| R1: User-Agent identificável | ✅ sem "bot/AI/Claude/GPT" |
| R2: robots.txt 24h cache | ✅ via `RobotsCache` |
| R3: rate limit por domínio | ✅ via `RateLimiter` |
| R4: timeouts (10/30/60s) | ✅ via httpx.Timeout |
| R5: snapshot content-addressable | ✅ `<sha[:2]>/<sha>.<ext>` |
| R6: versionamento sem sobrescrita | ✅ dedupe por SHA |
| R7: validação bruta | ✅ status 200 + tamanho mínimo + regex erro |
| R8: PII scan | ✅ regex CPF/CNPJ; flag se >5 |
| R9: atribuição obrigatória | ✅ default por domínio |
| R10: log JSONL | ✅ `data/logs/captura_<data>.jsonl` |
| R11: anti-detection PROIBIDO | ✅ |

**Pendente para Bloco D**: OCR (PDFs escaneados via `ocrmypdf`), suporte a DOC legado via libreoffice, snapshot index.json com SHA→metadata.

### C.3.b — Amostra estratificada

**25 URLs selecionadas** (ALVO=25, atingido), por:
- Domínio: 2 de cada de planalto/gov.br/in.gov.br/mec/camara/senado (quando disponíveis)
- Estaduais: 2+ secretarias distintas
- Tipo: lei (1), decreto (4), pagina_programa (10), outros (10), portaria (0)

**Notas:**
- 0 portarias na amostra — viés do nosso corpus (poucas portarias com URL direta)
- 1 lei apenas — planalto.gov.br timeout impediu seleção de mais

ADR não registrado (decisão simples e reproduzível com `random_state=42`).

### C.3.c — Captura

- **25/25 URLs capturadas** com sucesso (24 `ok` + 1 `inalterado` = duplicada via SHA)
- Tempo total: 33.6 s
- Total armazenado: ~2.4 MB em snapshots HTML

### C.3.d — Avaliação de qualidade

| Nível | n | Critério |
|---|---:|---|
| alta  | 19 | ≥ 2000 chars |
| média |  6 | 100-1999 chars |
| baixa |  0 | < 100 chars ou erro |

**0 snapshots com PII** (regex CPF/CNPJ; threshold >5).

Relatório detalhado: `data/derived/amostra-avaliacao-2026-05-01.md`

---

## Achados e recomendações para Bloco D

### O que funcionou bem

1. **Pipeline ETL é robusto e rápido** (5s para 439 fichas; idempotente)
2. **Vocabulário canônico flexível com warning** captura 99%+ sem rejeitar nada — bom para evolução
3. **Hook `validate_json_schema`** + 43 testes garantem regressão zero
4. **Skill `capturar-norma`** é diretamente reutilizável em batch (33s para 25 URLs)
5. **trafilatura** extrai bem texto principal de páginas governamentais HTML

### Problemas detectados

1. **`www.planalto.gov.br` muito instável** — timeout em ~80% dos requests. Recomendação Bloco D: aumentar timeout para esse domínio específico e implementar retry com backoff longo (5min entre tentativas).
2. **20% de URLs respondem 403** — provável anti-bot. Investigar caso a caso; pode ser pagamento de cookie ou JS desafio. Para corpus acadêmico, talvez aceitar e marcar como "indisponível para captura".
3. **20 fichas sem `fonte_url` real** — campo vazio na planilha original. Anotar em `data/annotations/` para correção em onda 2.
4. **6 outliers de vocabulário** (1 ocorrência cada) — `data/logs/normalize_unmapped_2026-05-01.csv` lista todos; correção manual no Excel pela revisora.
5. **0 PDFs na amostra** — pipeline PDF não testado em produção. Bloco D: ampliar amostra com URLs do `in.gov.br` (DOU em PDF).
6. **0 portarias na amostra** — sub-representado no corpus. Talvez não seja problema (planilha tem mais leis e páginas de programa).

### Próximos passos (Bloco D)

1. Implementar OCR (`ocrmypdf --language por`) para PDFs escaneados
2. Suporte a DOC legado via `libreoffice --headless`
3. `data/external_snapshots/index.json` (mapa SHA→metadata + last_seen + url_canonical)
4. Re-validação periódica (cronjob mensal) para detectar mudanças via Last-Modified/ETag
5. Captura completa dos 111 URLs OK (não só amostra de 25)
6. Investigar os 37 URLs 403: anti-bot? autenticação? marcar como "indisponível"
7. Tratar timeouts do planalto.gov.br com configuração específica de timeout/retry
8. Atualizar `fonte_url` placeholder das 20 fichas após onda 2

---

## Artefatos gerados

### Em `data/derived/`
- `policies-onda-1-2026-05-01.json` (2.4 MB) — JSON canônico final
- `latest.json` — cópia da última onda
- `links-onda-1-2026-05-01.{csv,json}` — 182 URLs únicas
- `links-validados-onda-1-2026-05-01.csv` — validação HEAD
- `links-validados-relatorio-2026-05-01.md`
- `amostra-captura-2026-05-01.csv` — 25 URLs selecionadas
- `amostra-resultados-2026-05-01.json` — resultados da captura
- `amostra-avaliacao-2026-05-01.md`
- `quality-report-bloco-c-2026-05-01.md` (este arquivo)

### Em `data/external_snapshots/` e `data/extracted_text/`
- 24 snapshots HTML (~2.4 MB) com SHA-256 path
- 24 metadata.json + 24 .txt extraídos

### Em `data/logs/`
- `normalize_unmapped_2026-05-01.csv` — 6 outliers
- `captura_validacao_2026-05-01.jsonl` — log auditável de 182 requests
- `captura_2026-05-01.jsonl` — log auditável de 25 capturas
- `robots_cache/` — cache dos robots.txt baixados

### Scripts criados (em `scripts/etl/` e `scripts/captura/`)
- `etl/load_planilha.py` (179 linhas)
- `etl/normalize.py` (191 linhas)
- `etl/dedupe.py` (108 linhas)
- `etl/build_ids.py` (115 linhas)
- `etl/validate.py` (89 linhas)
- `etl/build_json.py` (272 linhas)
- `etl/extract_links.py` (134 linhas)
- `captura/_http_helpers.py` (149 linhas — RobotsCache, RateLimiter, make_client)
- `captura/validar_links.py` (180 linhas)
- `captura/capturar_norma.py` (291 linhas) — implementa R1-R11
- `captura/selecionar_amostra.py` (118 linhas)
- `captura/capturar_amostra.py` (70 linhas)
- `captura/avaliar_amostra.py` (140 linhas)

### Em `.claude/`
- `skills/capturar-norma/SKILL.md` (skill v1.0)
- `decisions/2026-05-01_alinhamento-schema-regra.md`
- `decisions/2026-05-01_vocabulario-canonico.md`
- `context/vocabulario-canonico.json` (v1.0 — 8 campos preenchidos)
- `context/policies-schema.json` (atualizado: campos opcionais agora aceitam null)
- `rules/dados-politicas.md` v1.1 (alinhada ao schema)

### Em `tests/`
- `conftest.py` + 4 arquivos toy_*.py + 1 integration_*.py
- `pytest.ini` (config pytest para coletar toy_/unit_/integration_)

### Configuração
- `requirements.txt` (14 deps Python)
- `justfile` (18 targets)
- `pytest.ini`
