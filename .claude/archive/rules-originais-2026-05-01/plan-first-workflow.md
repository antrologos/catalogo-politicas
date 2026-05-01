# Regra: Fluxo Plano-Primeiro e Recuperação de Sessão

**Status:** OBRIGATÓRIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto mensalizacao_pnad

## Princípio

Para qualquer tarefa não-trivial, **planejar antes de escrever código**.
Planos sobrevivem à compressão de contexto. Salvar todo plano em disco.

## O Protocolo

1. **Entrar em modo plano** — usar `EnterPlanMode`
2. **Consultar fontes** — ler CLAUDE.md, MEMORY.md, regras relevantes
3. **Investigar** — ler o código afetado, mapear dependências
4. **Redigir o plano** — quais mudanças, em quais arquivos, em que ordem
5. **Salvar em disco** — gravar em `.claude/plans/YYYY-MM-DD_descricao.md`
6. **Apresentar ao usuário** — aguardar aprovação via `ExitPlanMode`
7. **Implementar** — seguir o plano aprovado, respeitando o loop de
   investigação (`test-first-protocol.md`)

## Planos em disco

Formato: `.claude/plans/YYYY-MM-DD_descricao-curta.md`

```markdown
# Plano: [título]

**Status**: RASCUNHO | APROVADO | CONCLUÍDO
**Data**: YYYY-MM-DD
**Sub-projeto**: pacote | dashboard | papers | scripts

## Contexto
[Por que essa mudança é necessária]

## Objetivo
[O que será feito]

## Abordagem
[Como será feito — mudanças mínimas]

## Arquivos a modificar
- [ ] `PNADCperiods/R/[arquivo].R` — [o que muda]
- [ ] `PNADCperiods/tests/testthat/test-[arquivo].R` — [teste novo/alterado]

## Loop de Investigação
- [ ] Causa raiz identificada
- [ ] Dependências mapeadas
- [ ] Unit test criado e validado

## Verificação
- [ ] Unit test passa
- [ ] `devtools::test()` sem falhas
- [ ] `devtools::check("PNADCperiods", args = "--as-cran")` sem ERRORs/WARNINGs
- [ ] Exemplos `@examples` ainda funcionam
```

## O que é não-trivial (REQUER plano)

- Alterar qualquer função protegida (ver `minimal-changes.md`)
- Corrigir bug que afeta múltiplos testes
- Adicionar/remover dependência no DESCRIPTION
- Modificar a lógica de calibração de pesos
- Alterar metadados SIDRA (afeta 86+ séries)
- Mudanças no dashboard que afetam unidades ou pipeline de dados
- Qualquer mudança que afete 2+ arquivos R
- Preparação para submissão CRAN
- Mudanças em vignettes que requerem re-precompute

## O que é trivial (SEM plano necessário)

- Corrigir typo em documentação ou comentário
- Ajustar formatação em DESCRIPTION
- Atualizar `.Rbuildignore` ou `.gitignore`
- Editar `CLAUDE.md`, `MEMORY.md`, ou regras em `.claude/`
- Adicionar/remover item cosmético no NEWS.md

## Protocolo de Recuperação de Sessão

**Após compressão de contexto ou início de nova sessão:**

1. **Ler CLAUDE.md** — `d:/Dropbox/Artigos/mensalizacao_pnad/CLAUDE.md`
2. **Ler MEMORY.md** — auto-memory persistente
3. **Verificar planos recentes:**
   ```
   ls .claude/plans/
   ```
   Ler o plano mais recente. Verificar status (RASCUNHO/APROVADO/CONCLUÍDO).
4. **Verificar estado do git:**
   ```
   cd PNADCperiods && git status && git log --oneline -5
   ```
5. **Declarar entendimento:** Dizer ao usuário o que entende ser o
   estado atual do projeto e da tarefa em andamento. Pedir confirmação
   antes de continuar.

### Quando ativar

- Após qualquer compressão automática de contexto
- No início de qualquer nova sessão
- Quando o usuário diz "continue de onde parou" ou similar
- Quando o contexto parece incompleto ou confuso

### Prioridade das fontes

1. Plano mais recente em `.claude/plans/` (mais específico)
2. `MEMORY.md` (notas persistentes entre sessões)
3. `CLAUDE.md` (contexto e convenções do projeto)
4. `.claude/rules/` (regras obrigatórias)

## Gestão de contexto

- Preferir auto-compressão a `/clear`
- Salvar contexto importante em `MEMORY.md` antes de perdê-lo
- `/clear` apenas quando o contexto estiver genuinamente poluído
- Ao final de tarefas longas, atualizar `MEMORY.md` com descobertas
- NUNCA perder estado de um plano aprovado — ele está em disco

## Regra de ouro

> **Nenhuma linha de código de produção deve ser escrita sem que exista
> um plano (aprovado ou trivial) e um teste (criado e rodado) que a
> justifique.**