---
descricao: Tarefas não-triviais exigem plano formal salvo em disco antes de qualquer edit. Lista paths que forçam Plan Mode.
escopo: universal · todo o projeto
versao: 1.0
ultima_revisao: 2026-05-01
paths_obrigam_plan_mode:
  - "data/raw/**"
  - "scripts/etl/*.py"
  - ".claude/rules/**"
  - ".claude/hooks/**"
  - "*.xlsx"
  - "context/policies-schema.json"
  - "context/vocabulario-canonico.json"
---

# Planejamento Obrigatório

**Status:** OBRIGATÓRIA · **Escopo:** todo o projeto FRM_CatalogoPoliticas

## Princípio

Para qualquer tarefa **não-trivial**, planejar antes de escrever código. Planos sobrevivem à compressão de contexto. Salvar todo plano em disco. Implementar com fidelidade ao plano aprovado — se surgir desvio, parar e expandir o plano antes de continuar.

## O Protocolo

1. **Entrar em modo plano** — `/plan` ou `Shift+Tab×2`
2. **Consultar fontes** — `CLAUDE.md`, `MEMORY.md`, regras relevantes em `.claude/rules/`, planos prévios em `.claude/plans/`
3. **Investigar** — ler o código/arquivo afetado, mapear dependências
4. **Redigir o plano** — quais mudanças, em quais arquivos, em que ordem, com testes previstos
5. **Salvar em disco** — `.claude/plans/YYYY-MM-DD_descricao-curta.md`
6. **Apresentar à pessoa usuária** — aguardar aprovação explícita antes de sair do modo plano
7. **Implementar** — seguir o plano sem desvios; respeitar o ciclo de `@.claude/rules/ciclo-investigacao-teste.md`
8. **Atualizar memória** — registrar decisões e descobertas em `MEMORY.md` (ver `@.claude/architecture/memoria-persistente.md`)

## Plan Mode obrigatório por path

Antes de editar arquivos sob estes paths, é **obrigatório** invocar `/plan` (ou `Shift+Tab×2`) e ter o plano aprovado. Estes paths estão também declarados no frontmatter desta regra (campo `paths_obrigam_plan_mode`):

| Path | Por quê |
|---|---|
| `data/raw/**` | Fonte primária imutável (planilha original) |
| `*.xlsx` | Inclui `Fichas das Políticas - 1ª onda.xlsx`; alterações só com confirmação humana |
| `scripts/etl/*.py` | Pipeline crítico que produz JSON canônico |
| `.claude/rules/**` | Mudar regras muda o comportamento do agente; precisa registro |
| `.claude/hooks/**` | Hooks executam código com privilégios; revisão prévia obrigatória |
| `context/policies-schema.json` | Contrato de dados; impacta tudo a jusante |
| `context/vocabulario-canonico.json` | Vocabulário fechado; mudança quebra filtros e validações |

Para **outros** paths, aplica-se a definição de "não-trivial" abaixo.

## Tarefa não-trivial (REQUER plano)

- Mudança que afeta 2+ arquivos
- Adicionar nova feature ao pipeline ou ao site
- Bug que afeta múltiplos módulos
- Adicionar/remover dependência (`requirements.txt`, `package.json`)
- Mudança em qualquer função compartilhada (ver `@.claude/rules/mudancas-minimas-cirurgicas.md`)
- Edição de schema, vocabulário, ou estrutura de diretórios
- Qualquer mudança em arquivos sob `paths_obrigam_plan_mode`

## Tarefa trivial (SEM plano)

- Corrigir typo em 1 arquivo
- Atualizar comentário ou docstring
- Editar `CLAUDE.md`, `MEMORY.md` (mas NÃO `.claude/rules/**`)
- Atualizar `.gitignore`
- Reformatar 1 arquivo isolado
- Adicionar entrada em arquivo de log existente
- Ler e reportar estado de arquivos

## Formato do arquivo de plano

Salvar em `.claude/plans/YYYY-MM-DD_descricao-curta.md`:

```markdown
# Plano: [título sucinto]

**Status**: RASCUNHO | APROVADO | CONCLUIDO
**Data**: YYYY-MM-DD
**Bloco/Rodada** (se aplicável): A · Rodada 4

## Contexto
[Por que esta mudança é necessária; problema ou objetivo]

## Objetivo
[O que será feito, em uma frase]

## Abordagem
[Como será feito — passos concretos, em ordem]

## Arquivos a modificar
- [ ] `caminho/arquivo.py` — [o que muda]
- [ ] `outro/arquivo.json` — [o que muda]

## Arquivos que NÃO serão tocados
- [lista explícita do que está fora do escopo]

## Testes previstos
- [ ] Toy/unit test que valide a mudança
- [ ] Integração existente que precisa rodar (se aplicável)

## Riscos e mitigações
- Risco 1 → mitigação
- Risco 2 → mitigação

## Verificação pós-implementação
- [ ] Testes passam
- [ ] Output validado contra schema (se aplicável)
- [ ] MEMORY.md atualizado
```

## Status do plano

- **RASCUNHO** — em construção, ainda não submetido
- **APROVADO** — aprovação humana explícita registrada (texto curto da pessoa, ou marca explícita após `/plan`)
- **CONCLUIDO** — implementação finalizada e validada; manter para histórico

## Regras durante a implementação

- **Seguir o plano aprovado** — não adicionar extras não planejados
- **Se surgir necessidade de mudança adicional**: PARAR, reportar, pedir para expandir o plano (status volta a RASCUNHO até nova aprovação)
- **Se um teste falha durante implementação**: PARAR, reportar, NÃO tentar fixes não planejados
- **Marcar cada item do plano como concluído** conforme o progresso (`- [x]`)
- **Não `/clear` durante implementação de plano aprovado** — o plano sobrevive, mas o contexto associado economiza idas ao disco

## Quando o plano cabe em 3 linhas

Tarefa não-trivial pequena (ex.: ajuste em 2 arquivos relacionados, sem schema): aceitável apresentar plano in-line via `/plan` e prosseguir após aprovação, **sem** salvar em `.claude/plans/`. Mas para qualquer toque em `paths_obrigam_plan_mode`, **sempre** salvar em arquivo.

## Checklist final do plano

- [ ] Status mudado para CONCLUIDO
- [ ] MEMORY.md atualizado com descobertas relevantes
- [ ] Decisões arquiteturais (se houver) registradas em `.claude/decisions/YYYY-MM-DD_titulo.md`

## Relação com outras regras

- `@.claude/rules/mudancas-minimas-cirurgicas.md` — fidelidade ao escopo declarado
- `@.claude/rules/ciclo-investigacao-teste.md` — o que fazer dentro de cada etapa do plano
- `@.claude/rules/recuperacao-sessao.md` — como retomar plano após compressão
- `@.claude/architecture/memoria-persistente.md` — quando atualizar MEMORY.md