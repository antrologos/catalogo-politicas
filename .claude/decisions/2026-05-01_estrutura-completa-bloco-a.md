---
status: aceito
data: 2026-05-01
contexto: A · Rodadas 1-3 · Checkpoint 3
substituido_por: null
---

# ADR-0002 — Estrutura completa da .claude/ no fim do Bloco A

## Contexto

O Bloco A do plano (`C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`) é a "fundação" do projeto: define a infraestrutura `.claude/` (rules, skills, hooks, settings, schemas, contexto, decisões) sobre a qual os blocos seguintes (C–G) construirão.

Após 3 rodadas de 3 agents cada e 3 checkpoints com a pessoa usuária, há decisões consolidadas a registrar:
- Quais rules entram (ADR-0001 já cobre)
- Quais skills, hooks, architecture docs, schemas, ADRs
- Quais lacunas são cobertas no Bloco A vs. adiadas
- Quais podas (artefatos NÃO criados, deliberadamente)

Este ADR registra o **escopo final do Bloco A** para servir de referência ao Bloco B (atualização do `CLAUDE.md`) e aos blocos seguintes.

## Alternativas consideradas

### Alternativa A — Bloco A "magro" (só rules)

Apenas as 10 rules; deixar skills/hooks/schemas para blocos posteriores.

- **Pró**: entrega rápida; menos coisa para revisar
- **Contra**: rules referenciam skills e hooks que não existem; estrutura `.claude/` fica incompleta; usuária terá de recomeçar configuração

### Alternativa B — Bloco A "completo" (rules + skills + hooks + schemas + ADRs)

Tudo necessário para que o agente opere com regras + automação básica + validação.

- **Pró**: estrutura coerente; agente pode operar em produção desde já; rules referenciam artefatos que existem
- **Contra**: mais escrita up-front; mais artefatos para revisar

### Alternativa C — Bloco A "máximo" (alternativa B + skills de captura + agents customizados)

Inclui também `capturar-norma`, `extrair-texto-documento`, `data-auditor`, etc.

- **Pró**: tudo pronto para Bloco D imediatamente
- **Contra**: skills de captura dependem de exploração de dados (Bloco C) e benchmark (Bloco E); construir agora arrisca retrabalho

## Decisão

**Adotamos a Alternativa B — Bloco A "completo".**

Estrutura final do Bloco A:

```
.claude/
├── README.md                              # meta-estrutura (Agent 4.3)
├── settings.json                          # permissões + 3 hooks + env vars (Agent 4.3)
├── settings.local.json.template           # variações locais (Agent 4.3)
├── .gitignore                             # exclusões locais (Agent 4.3)
│
├── rules/                                 # 10 arquivos (Agent 4.1)
│   ├── mudancas-minimas-cirurgicas.md
│   ├── planejamento-obrigatorio.md
│   ├── ciclo-investigacao-teste.md
│   ├── recuperacao-sessao.md
│   ├── protecao-fontes.md
│   ├── pipeline-python-etl.md
│   ├── operacao-drive.md
│   ├── captura-responsavel.md
│   ├── dados-politicas.md
│   └── pipeline-reproducible.md
│
├── skills/                                # 3 implementadas (Agent 4.2)
│   ├── normalize-categorico/
│   │   └── SKILL.md
│   ├── rodar-pipeline/
│   │   └── SKILL.md
│   └── testar-pipeline/
│       └── SKILL.md
│
├── agents/                                # vazio em A; criados em D+
│
├── hooks/                                 # 3 essenciais (Agent 4.3)
│   ├── block_xlsx_write.py
│   ├── warn_lock_file.py
│   └── validate_json_schema.py
│
├── context/                               # schemas + vocabulário (Agent 4.3)
│   ├── policies-schema.json
│   ├── vocabulario-canonico.md
│   └── vocabulario-canonico.json          # esqueleto; preenchido em Bloco C
│
├── architecture/                          # 3 docs (Agent 4.1)
│   ├── captura-estrategia.md
│   ├── memoria-persistente.md
│   └── privacidade-lgpd.md
│
├── decisions/                             # ADRs (Agent 4.1)
│   ├── TEMPLATE.md
│   ├── 2026-05-01_consolidacao-rules.md       # ADR-0001
│   └── 2026-05-01_estrutura-completa-bloco-a.md  # ESTE
│
├── plans/                                 # plano macro do projeto + planos por bloco
│
├── working/                               # outputs intermediários das rodadas
│   └── (R1-A1.{1,2,3}, Checkpoint{1,2,3}, R2-A2.{1,2,3}, R3-A3.{1,2,3})
│
└── archive/                               # 11 rules originais (após migração)
    └── rules-originais-2026-05-01/
        ├── MANIFEST.md
        └── *.md (11 arquivos antigos)
```

Na **raiz do projeto** (não em `.claude/`):
- `CLAUDE.md` atualizado no Bloco B
- `.gitignore` raiz com exclusões agressivas (Drive sync)
- `data/` com subdivisões `raw/`, `derived/`, `external_snapshots/`, `extracted_text/`, `annotations/`
- `scripts/` (vazio em A)
- `tests/` (vazio em A; estrutura definida)

## Justificativa

### Cobertura de 20 lacunas (das 28 originais da Rodada 1)

**11 alta prioridade**:
- #1 Schema JSON canônico → `dados-politicas.md` + `policies-schema.json`
- #2 Deduplicação federais×estaduais → `dados-politicas.md`
- #3 Vocabulário canônico × drift → `dados-politicas.md` + skill `normalize-categorico` + `vocabulario-canonico.md`
- #4 Proteção .xlsx → `protecao-fontes.md` + hook `block_xlsx_write.py`
- #5 Robots.txt + rate limiting → `captura-responsavel.md`
- #7 Estratégia snapshot vs. live → `captura-estrategia.md`
- #9 .gitignore agressivo Drive → `operacao-drive.md`
- #10 Paths Unicode+Windows → `operacao-drive.md`
- #22 Pipeline reproduzível (justfile) → `pipeline-reproducible.md`
- #23 Testes do pipeline → `pipeline-reproducible.md` + skill `testar-pipeline`
- #25 CI/CD GitHub Actions → `pipeline-reproducible.md`

**9 média prioridade**:
- #6 Atribuição/licença Lei 9.610 → `captura-responsavel.md`
- #8 Parsing PDF/HTML/DOC → stack documentada em `pipeline-python-etl.md`; skills detalhadas no Bloco D
- #11 Lock file Excel → `protecao-fontes.md` + hook `warn_lock_file.py`
- #18 Privacidade LGPD → `privacidade-lgpd.md`
- #20 Registro de decisões (ADR) → `decisions/TEMPLATE.md` + 2 ADRs históricos
- #21 Memória persistente padrão → `memoria-persistente.md`
- #26 Monitoramento link rot → adiado para Bloco D.3 (mas estratégia em `captura-estrategia.md`)
- #27 Colaboração researchers → adiado (sessão dedicada em Bloco G)
- #28 Versionamento de ondas → adiado (Bloco G; estrutura em `protecao-fontes.md`)

### Podas (deliberadamente NÃO criados em A)

| Item proposto | Status | Razão |
|---|---|---|
| Cookie consent banner | **Não criar** | Decisão "sem tracking padrão" em `privacidade-lgpd.md` torna desnecessário |
| Backup vs. Drive doc separado | **Não criar** | Coberto suficientemente em `operacao-drive.md` |
| Skill `capturar-norma` implementada | **Adiada** Bloco D | Estrutura em `captura-responsavel.md`; implementação requer Bloco C antes |
| Skill `extrair-texto-documento` | **Adiada** Bloco D | Idem |
| Skill `validar-link` | **Adiada** Bloco G | Monitoramento periódico |
| Subagents `data-auditor`, `web-scraper-respeitoso` | **Adiados** | Vão usar skills que ainda não existem |
| Hook adicional `audit-log-prompt`, `remind-memory` | **Não criar** | Cargo cult; sem valor concreto |
| CI/CD workflow .yml concreto | **Adiado** Bloco G | Estrutura em `pipeline-reproducible.md` |
| Wireframes UI | **Adiado** Bloco E | Bloco dedicado a UI/UX |

### 6 lacunas adiadas para blocos próprios

A Rodada 2 (Devil's Advocate) e Checkpoint 2 confirmaram que estas lacunas não cabem no Bloco A:

- **#13 Acessibilidade WCAG** → Bloco F (construção do site)
- **#14 Performance Core Web Vitals** → Bloco F
- **#15 SEO + slugs + structured data** → Bloco F (slugs já cobertos em schema)
- **#16 i18n PT-BR / EN / ES** → Bloco E ou F
- **#17 Responsividade mobile-first** → Bloco F
- **#24 Hosting decision** → Bloco E

## Trade-offs

- **Aceitamos** que o Bloco A é "denso" — 10 rules + 3 architecture + 3 ADRs + 3 skills + 3 hooks + schemas + configs em uma rodada de escrita
- **Aceitamos** que skills de captura (Bloco D) terão de ser desenhadas com base nas regras do Bloco A — boa restrição
- **Aceitamos** que CI/CD concreto fica para Bloco G — mas a forma está documentada
- **Mitigamos** complexidade via separação clara `architecture/` (decisões macro), `decisions/` (ADRs), `rules/` (operacionais)

## Consequências

### Positivas
- Estrutura `.claude/` coerente e referenciável
- Cada artefato com propósito explícito
- Rules referenciam-se por path relativo (`@.claude/rules/...`)
- 20 lacunas cobertas; 6 adiadas com plano
- 2 ADRs históricos servem de referência futura

### Negativas
- Bloco B (atualizar CLAUDE.md) tem trabalho adicional para refletir nova estrutura
- 11 rules antigas para arquivar com cuidado (manifest)

### Neutras
- Migração de 11 → estrutura nova é one-shot após aprovação da Rodada 4

## Próximos passos

- [ ] Pessoa usuária aprova outputs da Rodada 4 (Agents 4.1, 4.2, 4.3)
- [ ] Sessão de escrita em massa cria todos os arquivos em `.claude/`
- [ ] Migrar 11 originais para `.claude/archive/rules-originais-2026-05-01/` com `MANIFEST.md`
- [ ] **Bloco B**: atualizar `CLAUDE.md` com nova estrutura `.claude/` (apontar para `README.md` interno)
- [ ] Atualizar `MEMORY.md` com estado pós-Bloco A
- [ ] Inicializar git no repositório (`git init` + primeiro commit)
- [ ] **Bloco C**: explorar dados, preencher `vocabulario-canonico.json`

## Referências

- Plano macro: `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`
- ADR-0001: `.claude/decisions/2026-05-01_consolidacao-rules.md`
- Checkpoints: `.claude/working/Checkpoint{1,2,3}-decisoes.md`
- Rodadas: `.claude/working/R{1,2,3}-A{1,2,3}.{1,2,3}-*.md`

## Histórico

- 2026-05-01: criado e aceito como decisão final do Bloco A