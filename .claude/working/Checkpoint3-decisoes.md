# Checkpoint 3 — Decisões da usuária

> Decisões tomadas após Rodada 3 (pesquisa externa), para guiar a Rodada 4 (implementação executável).

## Decisão 1 — Incorporar TODOS os 10 padrões de schema da R3.2

Schema `policies-schema.json` + regra `dados-politicas.md` devem incluir:

1. **`slug`** único e estável por política (gerado por regra determinística)
2. **`fonte_url`** (HTTPS validada) + **`fonte_tipo`** + **`fonte_data_acesso`** + **`fonte_arquivo_path`** (snapshot local)
3. **`completude_pct`** (0-100) calculado pelo pipeline
4. **`unidade_medida`** controlada (BRL/mês, % população, beneficiários/ano, etc.) — vocabulário fechado
5. **`citacao_apa`** + **`citacao_bibtex`** derivados, com `data_versao_catalogo`
6. **Tesauro hierárquico**: cada categoria/tema com `id`, `label_pt`, `label_en` (futuro), `descricao`, `parent_id`
7. **`versao`** + **`data_validade_inicio`** + **`data_validade_fim`** por política; revogada → `status: revogada` + link sucessora
8. **Vocabulário canônico fechado** em todos campos filtráveis (esfera, eixo, modalidade, público-alvo, etc.); schema rejeita fora-da-lista
9. **`criado_em`** + **`atualizado_em`** + **`revisado_por`** + **`proxima_revisao_prevista`** (timestamps obrigatórios)
10. **`descricao_simples`** + **`descricao_tecnica`** (acessibilidade WCAG)

**Bônus**: ID estável universal interno do projeto (ex.: `FRM-CP-2026-EDU-0001`), separado de IDs externos.

## Decisão 2 — Path-scoped rules: SIM, em todas que fazem sentido

Adicionar `paths:` em frontmatter das rules técnicas:
- `pipeline-python-etl.md` → `paths: ["scripts/**/*.py", "tests/**/*.py", "*.py"]`
- `dados-politicas.md` → `paths: ["data/**", "scripts/etl/**", ".claude/context/**"]`
- `captura-responsavel.md` → `paths: ["scripts/captura/**", "data/external_snapshots/**", "data/extracted_text/**"]`
- `operacao-drive.md` → `paths: ["**"]` (sempre carrega — afeta tudo no Drive)
- `pipeline-reproducible.md` → `paths: ["scripts/**", "tests/**", "Makefile", "justfile", ".github/workflows/**"]`
- `protecao-fontes.md` → `paths: ["data/raw/**", "*.xlsx", "data/external_snapshots/**"]`

Regras universais SEM `paths:` (sempre carregam):
- `mudancas-minimas-cirurgicas.md`
- `planejamento-obrigatorio.md`
- `ciclo-investigacao-teste.md`
- `recuperacao-sessao.md`

## Decisão 3 — Plan Mode obrigatório por path

Adicionar a `planejamento-obrigatorio.md` seção que força `/plan` antes de editar:

```yaml
---
paths_obrigam_plan_mode:
  - "data/raw/**"          # fonte primária imutável
  - "scripts/etl/*.py"     # pipeline crítico
  - ".claude/rules/**"     # alterar regras requer plano
  - ".claude/hooks/**"     # alterar hooks requer plano
---
```

Texto da regra explica por que e como invocar `/plan` ou `Shift+Tab×2`.

## Decisão 4 — Adotar esboços R3.3 quase as-is

Os 2 textos-rascunho do Agent 3.3 viram base direta:
- `rules/captura-responsavel.md` (R1-R11 numeradas, 2-3 págs)
- `skills/capturar-norma/SKILL.md` (algoritmo 11 etapas)

Rodada 4 polir formatação, ajustar para frontmatter oficial Anthropic (R3.1), mas **manter estrutura e conteúdo legal-técnico**.

## Diretrizes consolidadas para Rodada 4

A Rodada 4 implementa o material acordado nas Rodadas 1-3 + Checkpoints 1-3. Estrutura final:

### .claude/ — 10 rules + 3 skills + 3 hooks + schemas + configs

```
.claude/
├── README.md                              # meta-estrutura (NOVO)
├── settings.json                          # permissões + 3 hooks + env vars (NOVO)
├── settings.local.json.template           # variações locais (NOVO)
├── .gitignore                             # exclusões locais (NOVO)
│
├── rules/                                 # 10 arquivos consolidados
│   ├── mudancas-minimas-cirurgicas.md     # universal (sem paths:)
│   ├── planejamento-obrigatorio.md        # universal (sem paths:; mas inclui paths_obrigam_plan_mode)
│   ├── ciclo-investigacao-teste.md        # universal (sem paths:)
│   ├── recuperacao-sessao.md              # universal (sem paths:)
│   ├── protecao-fontes.md                 # paths: [data/raw/**, *.xlsx, data/external_snapshots/**]
│   ├── pipeline-python-etl.md             # paths: [scripts/**/*.py, tests/**/*.py, *.py]
│   ├── operacao-drive.md                  # paths: ["**"] — sempre
│   ├── captura-responsavel.md             # paths: [scripts/captura/**, data/external_snapshots/**]
│   ├── dados-politicas.md                 # paths: [data/**, scripts/etl/**, .claude/context/**]
│   └── pipeline-reproducible.md           # paths: [scripts/**, tests/**, Makefile, justfile, .github/workflows/**]
│
├── skills/                                # 3 implementadas em A; outras adiadas
│   ├── normalize-categorico/
│   │   └── SKILL.md
│   ├── rodar-pipeline/
│   │   └── SKILL.md
│   └── testar-pipeline/
│       └── SKILL.md
│
├── agents/                                # vazio em A; criados em Bloco D+ (data-auditor, web-scraper-respeitoso)
│
├── hooks/                                 # 3 essenciais
│   ├── block_xlsx_write.py                # PreToolUse Edit|Write em *.xlsx
│   ├── warn_lock_file.py                  # PostToolUse Write em data/derived/*.json
│   └── validate_json_schema.py            # PostToolUse Write em data/derived/*.json
│
├── context/                               # schemas + vocabulário canônico
│   ├── policies-schema.json               # JSON Schema com 10 padrões R3.2
│   ├── vocabulario-canonico.md            # esquema do vocabulário (estrutura)
│   └── vocabulario-canonico.json          # dicionário concreto (preencher em Bloco C)
│
├── architecture/                          # docs de arquitetura (3 docs)
│   ├── captura-estrategia.md              # snapshot vs. live (decidido: snapshot)
│   ├── memoria-persistente.md             # template MEMORY.md
│   └── privacidade-lgpd.md                # 1-2 páginas, "sem tracking padrão"
│
├── decisions/                             # ADRs leves
│   ├── TEMPLATE.md                        # template ADR
│   ├── 2026-05-01_consolidacao-rules.md   # ADR da decisão das Rodadas 1-2
│   └── 2026-05-01_estrutura-completa.md   # ADR da decisão das Rodadas 3
│
├── memory/                                # se quisermos memory local; mas auto-memory global já cobre
│
├── plans/                                 # planos aprovados (já tem o plano macro)
│
├── working/                               # outputs intermediários das rodadas (versionar)
│   ├── R1-A1.1-universalidade.md
│   ├── R1-A1.2-stack-especifico.md
│   ├── R1-A1.3-lacunas.md
│   ├── Checkpoint1-decisoes.md
│   ├── R2-A2.1-devils-advocate.md         # (a salvar)
│   ├── R2-A2.2-architect.md               # (a salvar)
│   ├── R2-A2.3-skills-agents-hooks-RAW.md # (já salvo)
│   ├── Checkpoint2-decisoes.md
│   ├── R3-A3.1-anthropic-docs.md
│   ├── R3-A3.2-benchmark-catalogos.md
│   ├── R3-A3.3-scraping-responsavel.md
│   └── Checkpoint3-decisoes.md
│
└── archive/                               # regras antigas preservadas (após migração)
    └── rules-originais-2026-05-01/
        ├── MANIFEST.md
        └── *.md (11 arquivos antigos)
```

### Raiz do projeto

- **`CLAUDE.md`** atualizado com seção "Estrutura .claude/" (apontar para README.md interno)
- **`.gitignore`** raiz: `node_modules/`, `.next/`, `dist/`, `.cache/`, `__pycache__/`, `.venv/`, `~$*.xlsx`, `.DS_Store`, `Thumbs.db`, `.claude/settings.local.json`, `data/external_snapshots/*.html`, `data/external_snapshots/*.pdf`, `data/external_snapshots/*.docx` (mas mantém `index.json` e `*.meta.json`)
- **Inicializar git** com `git config core.longpaths true`

## Diretrizes derivadas para Rodada 4

A Rodada 4 deve produzir **conteúdo executável final** dos arquivos. Não apenas listar — escrever. 3 agents em paralelo:

### Agent 4.1 — Editor de Regras
Para cada uma das 10 rules + 3 architecture docs + 1 ADR template:
- Frontmatter completo conforme R3.1 (`paths:` quando aplicável)
- Conteúdo final em PT-BR
- Exemplos concretos
- Path-scoped quando aplicável
- Para `captura-responsavel.md`, basear no esboço R3.3
- Para `dados-politicas.md`, incorporar 10 padrões da R3.2
- Para `planejamento-obrigatorio.md`, incluir `paths_obrigam_plan_mode`

### Agent 4.2 — Engenheiro de Skills
Para cada uma das 3 skills (normalize-categorico, rodar-pipeline, testar-pipeline):
- Frontmatter Anthropic oficial completo (R3.1: `disable-model-invocation`, `effort`, `allowed-tools`, `argument-hint`)
- SKILL.md em PT-BR < 500 linhas
- Pseudocódigo / fluxo concreto
- Casos de erro tratados
- Referência a supporting files (examples/, scripts/) se aplicável

Plus stubs de agents (sem implementação): `data-auditor.md`, `web-scraper-respeitoso.md` em `agents/` para Bloco D usar.

### Agent 4.3 — Operador de Settings/Hooks/Context
- `settings.json` final (permissões + 3 hooks com sintaxe oficial R3.1 + env vars Python)
- `settings.local.json.template`
- `.claude/.gitignore` + `.gitignore` raiz (modelos comentados)
- 3 hooks Python (`block_xlsx_write.py`, `warn_lock_file.py`, `validate_json_schema.py`) — implementação real, exit code 2, JSON via stdout
- `context/policies-schema.json` (JSON Schema v7 com 10 padrões R3.2)
- `context/vocabulario-canonico.md` (estrutura/esquema; valores serão preenchidos em Bloco C)
- `.claude/README.md` (meta-estrutura)
- `decisions/TEMPLATE.md` (template ADR)

**Saída final do Bloco A:** plano de implementação detalhado (lista de arquivos com conteúdo final pronto para escrita) → usuária aprova → escrita em massa em `.claude/`.