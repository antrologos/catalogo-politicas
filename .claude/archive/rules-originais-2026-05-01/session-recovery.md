---
paths:
  - "**"
---

# Protocolo de Recuperacao de Sessao

**Status:** OBRIGATORIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto Transcritorio

**Apos compressao de contexto ou inicio de nova sessao, executar este protocolo.**

## Passos

1. **Ler CLAUDE.md** na raiz do projeto (`d:/Dropbox/Transcritorio/CLAUDE.md`)

2. **Ler MEMORY.md** em:
   `C:/Users/antro/.claude/projects/d--Dropbox-Transcritorio/memory/MEMORY.md`

3. **Verificar planos recentes:**
   ```
   ls .claude/plans/
   ```
   Ler o plano relevante para a tarefa em andamento. Verificar status
   (RASCUNHO / APROVADO / CONCLUIDO).

4. **Verificar estado do trabalho:**
   ```
   git status
   git log --oneline -5
   ```

5. **Verificar estado do build (se relevante):**
   - Build-venv existe em `%LOCALAPPDATA%\Transcritorio\build-venv\`?
   - Dist existe em `%LOCALAPPDATA%\Transcritorio\packaging\dist\`?
   - Dist tem CUDA? (`_internal/torch/lib/torch_cuda.dll`)
   - Tamanho do dist (esperado: 4+ GB com CUDA)

6. **Declarar entendimento:** Dizer ao usuario o que entende ser o estado
   atual do projeto e da tarefa em andamento. Pedir confirmacao antes de
   continuar.

## Quando ativar

- Apos qualquer compressao automatica de contexto
- No inicio de qualquer nova sessao do Claude Code
- Quando o usuario diz "continue de onde parou" ou similar
- Quando o contexto parece incompleto ou confuso

## Prioridade das fontes

1. Plano mais recente em `.claude/plans/` (mais especifico)
2. `memory/MEMORY.md` (notas persistentes)
3. `CLAUDE.md` (contexto e convencoes do projeto)
4. `.claude/rules/` (regras de procedimento)
5. `git log` e `git status` (estado do repositorio)

## Gestao de contexto

- Preferir auto-compressao a `/clear`
- Salvar contexto importante em `memory/` antes de perde-lo
- `/clear` apenas quando o contexto estiver genuinamente poluido
- Ao final de tarefas longas, atualizar `MEMORY.md` com descobertas relevantes
