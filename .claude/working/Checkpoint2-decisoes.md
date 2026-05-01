# Checkpoint 2 — Decisões da usuária

> Decisões tomadas após Rodada 2, para guiar a Rodada 3 e a implementação final.

## Decisão 1 — Consolidação das rules: versão Devil's Advocate (~10 arquivos)

**10 arquivos temáticos** em `.claude/rules/`:

### 6 arquivos universais (consolidados a partir dos 11 atuais)
1. `mudancas-minimas-cirurgicas.md` (consolida `development-procedure.md` + `minimal-changes.md`)
2. `planejamento-obrigatorio.md` (consolida `plan-first.md` + `plan-first-workflow.md`)
3. `ciclo-investigacao-teste.md` (consolida `investigate-before-implement.md` + `test-first-protocol.md` + `testing-protocol.md`, em versão reduzida)
4. `recuperacao-sessao.md` (mantém `session-recovery.md` independente, com paths atualizados)
5. `protecao-fontes.md` (consolida `pipeline-safety.md` + `protect-originals.md`, adaptado para .xlsx + derivados + snapshots externos)
6. `pipeline-python-etl.md` (NOVO — 11 princípios ouro do Agent 1.2)

### 4 arquivos temáticos de domínio (consolidam lacunas)
7. `operacao-drive.md` (consolida lacunas #9 .gitignore + #10 paths Unicode + #11 lock file)
8. `captura-responsavel.md` (consolida lacunas #5 robots/rate-limit + #6 atribuição/licença + #7 estratégia snapshot vs. live)
9. `dados-politicas.md` (consolida lacunas #1 schema JSON + #2 deduplicação + #3 vocabulário canônico)
10. `pipeline-reproducible.md` (consolida lacunas #22 justfile + #23 testes pipeline + #25 CI/CD)

### Arquivos descartados
- `gui-development.md` → DESCARTAR (100% PySide6)

### Outros artefatos vão para outras pastas
- `.claude/architecture/` ou docs: privacidade-lgpd.md (1 página), registro-decisoes.md (template ADR), memoria-persistente.md (template MEMORY.md)

## Decisão 2 — Aceitar integralmente a poda de 8 lacunas do Devil's Advocate

**20 lacunas em Bloco A** (11 AP + 9 MP):

| # | Lacuna | Prioridade |
|---|---|---|
| 1 | Schema JSON canônico | AP |
| 2 | Deduplicação federais×estaduais | AP |
| 3 | Vocabulário canônico × drift | AP |
| 4 | Proteção .xlsx + versionamento derivados | AP |
| 5 | Robots.txt + rate limiting | AP |
| 7 | Estratégia snapshot vs. live | AP |
| 9 | .gitignore agressivo Drive | AP |
| 10 | Paths Unicode+Windows | AP |
| 22 | Pipeline reproduzível (justfile/make) | AP |
| 23 | Testes do pipeline | AP |
| 25 | CI/CD GitHub Actions | AP |
| 6 | Atribuição/licença Lei 9.610 | MP |
| 8 | Parsing PDF/HTML/DOC | MP (skill stub em A; detalhes em D) |
| 11 | Lock file Excel colaborativo | MP (aviso, não bloqueio) |
| 18 | Privacidade LGPD | MP (1-2 páginas, sem tracking padrão) |
| 20 | Registro de decisões (ADR) | MP (template leve) |
| 21 | Memória persistente padrão | MP (template) |
| 26 | Monitoramento link rot | MP (implementar em D.3 ou G) |
| 27 | Colaboração researchers | MP (1 página) |
| 28 | Versionamento de ondas | MP (1 página) |

**6 ADIADAS para blocos próprios** (a11y, perf, SEO, i18n, mobile, hosting — Blocos E/F).

**2 CORTADAS** (#12 backup vs Drive já em CLAUDE.md; #19 cookie consent contradiz "sem tracking").

## Decisão 3 — Escopo temporal: Bloco A "fundação"

**O que entra em Bloco A (~10-15 dias):**
- Regras consolidadas (10 arquivos em `rules/`) + 4 architecture docs em `architecture/` ou similar
- Estrutura de diretórios completa (`.claude/{rules,skills,agents,hooks,context,decisions,memory,plans,working,archive}/` + `data/{raw,derived,external_snapshots}/`)
- Schemas e configs (`context/policies-schema.json`, `context/vocabulario-canonico.md`, `.gitignore`, `settings.json`)
- **3 skills básicas implementadas**: `normalize-categorico`, `rodar-pipeline`, `testar-pipeline`
- **3 hooks essenciais**: block-xlsx-write, warn-lock-file, validate-json-schema
- Inicialização git (`git init` + primeiro commit)
- Migração das 11 regras antigas para `archive/rules-originais-bloco-a-2026-05-01/`
- Atualização final do CLAUDE.md (Bloco B do plano)

**O que NÃO entra em Bloco A (vai em blocos próprios):**
- Skills de captura externa (`capturar-norma`, `extrair-texto-documento`, `validar-link`) → Bloco D
- Skills auxiliares (`extrair-ficha`, `auditar-derivado`) → Bloco D ou C
- Subagents (`data-auditor`, `web-scraper-respeitoso`, `revisor-redacao-pt-br`, `documentador-decisoes`) → quando usados, Blocos C/D/F
- CI/CD GitHub Actions workflow concreto → Bloco G (ou quando primeiro deploy)
- Hooks adicionais (audit-log-prompt, remind-memory) → cargo cult; não criar

## Decisão 4 — 3 hooks essenciais

1. **`block-xlsx-write`** (PreToolUse, P1) — bloqueia escrita em `Fichas das Políticas - 1ª onda.xlsx` (Edit/Write/MultiEdit)
2. **`warn-lock-file`** (PostToolUse, P2) — avisa se derivado JSON foi criado com lock file `~$...xlsx` presente (não bloqueia)
3. **`validate-json-schema`** (PostToolUse, P1) — valida JSON criado em `data/derived/*.json` contra schema; bloqueia se inválido

## Diretrizes derivadas para Rodada 3

A Rodada 3 deve fazer **pesquisa externa** para enriquecer/validar as decisões anteriores, com 3 lentes:

1. **Pesquisa Anthropic / Claude Code**: documentação oficial sobre skills, hooks, agents, settings.json, plugins, MCP. Validar se nossa proposta está alinhada com práticas oficiais 2025-2026. Identificar ajustes técnicos.

2. **Pesquisa Web Dev + Dados (catálogos governamentais)**: benchmark de catálogos similares (políticas públicas, open data, transparência) Brasil/exterior. Identificar padrões UI/UX recorrentes (filtros facetados, comparação, visualizações). Esse material ALIMENTA o Bloco E (UI/UX), mas pode informar regras agora (ex.: "todo dado exibido tem fonte clicável").

3. **Pesquisa Scraping Responsável + Direitos**: melhores práticas para portais governamentais brasileiros (planalto, gov.br, MEC, secretarias estaduais). Robots.txt, rate limits razoáveis, Lei 9.610 (obras públicas), LGPD, atribuição. Output entra direto na rule `captura-responsavel.md` e na skill `capturar-norma`.