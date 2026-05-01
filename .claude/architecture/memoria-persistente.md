---
descricao: Template e padrão de uso da memória global Claude. O que registrar, quando atualizar, estrutura de MEMORY.md e arquivos por tópico.
escopo: arquitetura · processo
versao: 1.0
ultima_revisao: 2026-05-01
---

# Memória Persistente

Padrão de uso da memória global do Claude para o projeto FRM_CatalogoPoliticas.

## Localização

Memória global do projeto fica em:

```
~/.claude/projects/g--Drives-compartilhados-FRM-CatalogoPoliticas/memory/
├── MEMORY.md                              # auto-memory principal (primeiras 200 linhas auto-carregam)
├── project_catalogo_politicas.md          # nota canônica do projeto
├── processo_construcao_site.md            # estado dos blocos A–G
└── <topico>.md                            # outros tópicos on-demand
```

**Hierarquia de carregamento** (ver `@.claude/rules/recuperacao-sessao.md`):

1. `.claude/plans/` mais recente — mais específico
2. `MEMORY.md` — auto-memory (primeiras 200 linhas sempre carregadas)
3. `<topico>.md` — carregado on-demand quando relevante
4. `CLAUDE.md` — contexto e convenções
5. `.claude/rules/` — regras de procedimento
6. git log/status — estado do repositório

## O que registrar

### SIM, registrar em MEMORY.md

- **Descobertas substantivas** — armadilhas, padrões, restrições do dado
- **Decisões consenso** — escolha entre alternativas, com 1 linha de justificativa
- **Pontos de atenção** — coisas a lembrar ao retomar trabalho
- **Estado de blocos/rodadas** — qual rodada terminou, qual está em andamento
- **Próximos passos** — itens claramente pendentes
- **Bugs conhecidos não resolvidos** — com contexto suficiente para retomar

### NÃO registrar em MEMORY.md

- Conteúdo já em `CLAUDE.md` (não duplicar)
- Detalhes de implementação que estão no código
- Logs de execução (`logs/`)
- Conteúdo efêmero de uma sessão (use scratch local)
- Material em construção que ainda não tem decisão (use `.claude/working/`)

## Quando atualizar

- **Ao final de cada rodada de trabalho** (com 3 agents) — sintetizar discoveries e decisões
- **Ao final de cada checkpoint** — registrar a decisão da pessoa usuária
- **Ao final de tarefa longa** — descobertas relevantes
- **Ao descobrir armadilha** que vai afetar trabalho futuro
- **Antes de `/clear`** — salvar contexto importante que vai sumir

**Não atualizar a cada commit.** Memória não é changelog.

## Estrutura sugerida do MEMORY.md

```markdown
# MEMORY — FRM_CatalogoPoliticas

> Auto-memory persistente. Primeiras 200 linhas sempre carregam.
> Notas substantivas; sem changelog.

## Estado atual

- **Bloco**: A · Rodada 4 · Checkpoint 4 pendente
- **Última ação**: Agent 4.1 produziu 10 rules + 3 architecture + 3 ADRs (2026-05-01)
- **Próximo**: Aprovação humana → escrita em massa em `.claude/`

## Decisões consenso

- 11 → 10 rules consolidadas (Checkpoint 1, conservador)
- Path-scoped rules adotadas (Checkpoint 3)
- Snapshot integral content-addressable, não live fetch (Checkpoint 3)
- 3 hooks essenciais: block_xlsx_write, warn_lock_file, validate_json_schema
- Stack Python: httpx + trafilatura + pdfplumber + pydantic + tenacity
- Sem GA/Matomo padrão (LGPD); sem cookie consent (não tem tracking)

## Descobertas relevantes

### Planilha
- 4 abas começam com espaço (` Planilha SP`, ` Planilha RJ`, ` Planilha Pará`)
- Aba federal truncada em 31 chars: `Políticas federais (comuns a to`
- 16 dropdowns "envenenados" com `Opção 2` em CE (cols D, G, N, P, S, linhas 37-45)
- Bahia tem 2× PRONATEC e 2× "Programa Juros por Educação"
- Drift ortográfico em `Esfera de execução`: 31 valores únicos para ~20 oficiais
- Validações inline aplicadas até linhas 998-1027 (mas só ~40-53 fichas reais → arquivo inflado)
- Campo `Dúvidas` (col 26) é dual-uso: marcador `EM TODOS OS ESTADOS` + nota humana

### Captura externa
- in.gov.br bloqueia tokens "GPT/Claude/Bot/AI" no robots.txt
- Senado declara `Crawl-delay: 10` (mais restritivo)
- planalto.gov.br não retorna robots.txt (socket reset) → default conservador 1 req/2s

### Drive + Windows
- Lock files Excel (`~$...xlsx`) precisam estar no .gitignore
- `git config core.longpaths true` é necessário
- Acentos quebram silenciosamente sem `encoding="utf-8"` em Python
- Marcar `node_modules/`, `.venv/`, `__pycache__/` como "no offline sync" no Drive Desktop

## Pontos de atenção

- Bloco B: atualizar `CLAUDE.md` com nova estrutura `.claude/`
- Bloco C: 6 lacunas adiadas (a11y, perf, SEO, i18n, mobile, hosting)
- Skill `capturar-norma` adiada para Bloco D (estrutura em `captura-responsavel.md`)
- ADRs históricos em `.claude/decisions/` precisam ser linkados em `CLAUDE.md`

## Rodadas anteriores (resumo)

### Bloco A · Rodada 1 (2026-05-01)
- 3 agents leem 11 rules existentes, produzem matrizes
- Saída: `.claude/working/R1-A1.{1,2,3}-*.md`

### Bloco A · Rodada 2 (2026-05-01)
- Devil's advocate, architect, skills/agents/hooks
- Decisão: 10 rules + 3 hooks + 3 skills (Checkpoint 2)

### Bloco A · Rodada 3 (2026-05-01)
- Pesquisa: docs Anthropic, benchmark catálogos, scraping responsável
- Saída: frontmatter oficial; 10 padrões para schema; R1-R11 captura

### Bloco A · Rodada 4 (em andamento)
- Editor de Regras, Engenheiro de Skills, Operador de Settings
```

## Estrutura de arquivos por tópico

Para tópicos grandes, criar arquivo separado e referenciar de MEMORY.md:

```
memory/
├── MEMORY.md                           # auto-load
├── project_catalogo_politicas.md       # canônico do projeto (escopo, propósito)
├── processo_construcao_site.md         # estado dos blocos A–G
├── armadilhas_planilha.md              # detalhamento das 10+ armadilhas
├── vocabulario_drift.md                # mapeamento de variantes ortográficas (Bloco C)
└── decisoes_capturas.md                # log de capturas excepcionais (Bloco D)
```

Cada arquivo `<topico>.md` tem cabeçalho:

```markdown
# <Tópico>

> Carregado on-demand. Não é auto-memory.
> Atualizado: YYYY-MM-DD

## Resumo
[1-2 parágrafos]

## Conteúdo detalhado
...
```

## Convenções

- **Idioma**: PT-BR
- **Tom**: telegráfico; bullet points > prosa
- **Datas**: ISO 8601 (`2026-05-01`)
- **Links**: paths relativos a partir da raiz do projeto, ou `@.claude/...`
- **Atualização**: em vez de adicionar "histórico", reescrever a seção quando o estado muda; histórico vai para `decisions/`

## Diferença entre MEMORY, CLAUDE, decisions, plans

| Arquivo | Função | Ciclo de vida |
|---|---|---|
| `CLAUDE.md` | Convenções e contexto **estáveis** do projeto | Atualizado quando estrutura muda |
| `MEMORY.md` | Estado **atual** + descobertas + decisões consenso | Atualizado a cada rodada/checkpoint |
| `.claude/decisions/<adr>.md` | **Por quê** decidimos X | Imutável após `aceito` |
| `.claude/plans/<plano>.md` | **Como** vamos fazer Y | Vivo até `CONCLUIDO` |
| `.claude/working/*.md` | Material intermediário das rodadas | Arquivado após checkpoint |

## Quando consultar MEMORY.md

- **Sempre** no início de sessão (`@.claude/rules/recuperacao-sessao.md`)
- **Antes de tomar decisão arquitetural** (verificar se já decidida)
- **Antes de criar nova rule/skill/hook** (verificar se já discutido)
- **Antes de declarar entendimento** ao usuário

## Quando NÃO consultar MEMORY.md

- Para detalhes de implementação (consulte código)
- Para checagem rápida de path (`ls`, não MEMORY)
- Para verificar git log (use git, não MEMORY)

## Higiene

A cada checkpoint:
- Mover descobertas estabilizadas para `CLAUDE.md`
- Mover decisões fechadas para `.claude/decisions/`
- Mover material intermediário para `.claude/working/archive/`
- Manter MEMORY.md focado em **estado atual e próximos passos**