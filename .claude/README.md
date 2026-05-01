# `.claude/` — meta-estrutura

> Versão: 0.1 (Bloco A, Rodada 4) · Última atualização: 2026-05-01
> Mantenedor: Rogério Barbosa (rogerio.barbosa@iesp.uerj.br)

Este diretório centraliza **toda** a infraestrutura de operação do Claude Code para o projeto **FRM_CatalogoPoliticas**: regras, skills, agents, hooks, contexto, decisões, planos e working notes.

## Mapa rápido — onde está o quê

```
.claude/
├── README.md                   ← este arquivo
├── settings.json               ← permissões + hooks + env vars (versionado)
├── settings.local.json.template ← modelo de overrides pessoais (gitignored ao copiar)
├── .gitignore                  ← exclusões internas (settings.local, cache, logs)
│
├── rules/                      ← regras de operação (markdown + frontmatter)
├── skills/                     ← skills invocáveis (cada uma em pasta própria)
├── agents/                     ← subagents declarados (vazio em A; criados em D+)
├── hooks/                      ← scripts Python executados pelo harness
├── context/                    ← schemas e vocabulários canônicos
├── architecture/               ← documentos de arquitetura (decisões macro)
├── decisions/                  ← ADRs leves (registro de decisões técnicas)
├── memory/                     ← memória local persistente (opcional)
├── plans/                      ← planos aprovados em curso (Plan Mode + manuais)
├── working/                    ← outputs intermediários das rodadas (versionar)
└── archive/                    ← regras antigas preservadas após migração
```

## Convenções

### Idioma
- **PT-BR** em conteúdo, comentários, descrições, nomes humanos.
- **Inglês apenas** quando exigido por ferramenta (nomes de pacotes npm, palavras-chave de frontmatter Anthropic, comandos shell).

### Nomenclatura
- **Arquivos públicos** (rules/, skills/, agents/, plans/): `kebab-case.md`.
- **Scripts Python** (hooks/, scripts/): `snake_case.py`.
- **Decisões** (decisions/): `YYYY-MM-DD_titulo-curto.md`.
- **Working notes** (working/): `R{rodada}-A{agent}.{n}-{topico}.md`.

### Frontmatter por tipo

#### Rules (`rules/*.md`)
```yaml
---
descricao: "uma frase explicando para que serve"
escopo: bloco-A | bloco-B | ... | universal
paths: ["scripts/**/*.py", "data/**"]   # opcional — path-scoped loading
versao: 0.1
ultima_revisao: 2026-05-01
---
```
- Sem `paths:` ⇒ regra **sempre** carregada (universal).
- Com `paths:` ⇒ carregada **apenas** quando contexto incluir esses paths.

#### Skills (`skills/<nome>/SKILL.md`)
```yaml
---
name: kebab-name
description: "≤ 1.536 chars (description + when_to_use)"
when_to_use: "quando Claude deve auto-invocar"
argument-hint: "[arg1] [arg2]"
allowed-tools: "Read Grep Bash(python *)"
disable-model-invocation: false   # true = só humano invoca
effort: low | medium | high | xhigh | max
versao: 0.1
---
```

#### Agents (`agents/<nome>.md`)
```yaml
---
name: nome-opcional   # default = nome do arquivo
description: "o que faz"
---
```
- **Sem** campo `tools` (perms vêm de `settings.json`).
- **Sem** campo `model` (usa modelo da session).

#### Plans (`plans/<nome>.md`)
```yaml
---
titulo: "Plano X"
status: rascunho | aprovado | em-execucao | concluido | abandonado
data_inicio: 2026-05-01
data_aprovacao: 2026-05-01
aprovador: "Rogério Barbosa"
---
```

#### Decisions (`decisions/YYYY-MM-DD_titulo.md`)
```yaml
---
data: 2026-05-01
status: aceita | superada | rejeitada
contexto_breve: "uma linha"
substitui: null | "decisions/YYYY-MM-DD_anterior.md"
---
```
Corpo segue template em `decisions/TEMPLATE.md`: **Contexto · Alternativas · Decisão · Justificativa · Trade-offs · Próximos passos**.

## Quem mantém o quê

| Pasta | Responsabilidade primária | Quem altera |
|---|---|---|
| `rules/` | Princípios de operação do Claude no projeto | Rogério + revisão de Claude |
| `skills/` | Comportamentos invocáveis por slash-command ou pelo modelo | Rogério |
| `agents/` | Subagents especializados (Bloco D+) | Rogério |
| `hooks/` | Validações automáticas executadas pelo harness | Rogério (testar com `python .claude/hooks/<nome>.py < /dev/null`) |
| `context/` | Schemas + vocabulários (consumidos por hooks e skills) | Rogério (mudança requer ADR) |
| `architecture/` | Decisões macro de arquitetura (snapshot vs. live, memória, LGPD) | Rogério |
| `decisions/` | ADRs leves de toda decisão técnica significativa | Quem tomou a decisão |
| `working/` | Outputs intermediários das rodadas (NÃO editar após checkpoint) | Agents das rodadas |
| `plans/` | Planos macro/microaprovados em curso | Rogério |
| `archive/` | Regras antigas preservadas após migração | Append-only |

## Fluxo típico de uma rodada

1. **Ler plano** atual em `plans/` (e `CLAUDE.md` na raiz).
2. **Carregar rules** universais + path-scoped que se aplicam ao trabalho.
3. **Invocar skills** quando o trabalho casa com o `when_to_use`.
4. **Atualizar working notes** durante a rodada em `working/R{n}-A{x}.{y}-{topico}.md`.
5. **Registrar decisão** em `decisions/` se algo arquitetônico foi escolhido.
6. **Atualizar memory/** (se uso local; senão, auto-memory do harness cuida).
7. **Checkpoint humano** entre rodadas: usuária aprova `Checkpoint{n}-decisoes.md`.

## Hooks ativos (resumo)

| Evento | Matcher | Hook | O que faz |
|---|---|---|---|
| `PreToolUse` | `Edit\|Write\|MultiEdit` | `block_xlsx_write.py` | Bloqueia (exit 2 + JSON deny) escrita na planilha-fonte primária. |
| `PostToolUse` | `Write\|Edit\|MultiEdit` | `warn_lock_file.py` | Avisa via stderr se derivado foi gravado com `~$...xlsx` presente. |
| `PostToolUse` | `Write\|Edit` | `validate_json_schema.py` | Valida JSON em `data/derived/` contra `context/policies-schema.json`. |

Documentação técnica completa: ver docstrings dos próprios hooks e `.claude/working/R3-A3.1-anthropic-docs.md`.

## Permissões (resumo de `settings.json`)

- **allow**: leitura/glob/grep do projeto inteiro; `python`/`pytest`; git read-only; escrita em `data/derived/`, `data/external_snapshots/`, `data/extracted_text/`, `data/logs/`, `.claude/working|decisions|plans/`, `.claude/`, `CLAUDE.md`, `scripts/`; WebFetch nos domínios `gov.br`, `planalto.gov.br`, `in.gov.br`, `mec.gov.br`, `inep.gov.br`, `camara.leg.br`, `senado.leg.br`.
- **deny**: edit/write na planilha-fonte (`Fichas das Políticas - 1ª onda.xlsx`); `rm -rf`; `git push --force`.
- **ask**: `git push`, `git reset --hard`.

## Versão e atualização

Este README é mantido manualmente. Atualizá-lo quando:
- Nova subpasta criada;
- Nova convenção introduzida;
- Mudança em hooks ativos;
- Mudança em permissões padrão.

Toda alteração estrutural significativa abre ADR em `decisions/`.