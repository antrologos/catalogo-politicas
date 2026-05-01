---
descricao: Protocolo a executar após compressão de contexto ou início de nova sessão. Hierarquia de fontes para reconstruir entendimento do estado atual.
escopo: universal · todo o projeto
versao: 1.0
ultima_revisao: 2026-05-01
---

# Recuperação de Sessão

**Status:** OBRIGATÓRIA · **Escopo:** todo o projeto FRM_CatalogoPoliticas

Após compressão de contexto ou início de nova sessão, executar este protocolo antes de qualquer ação substantiva.

## Passos

1. **Ler `CLAUDE.md`** na raiz do projeto: `g:/Drives compartilhados/FRM_CatalogoPoliticas/CLAUDE.md`

2. **Ler memória global do projeto**:
   ```
   ~/.claude/projects/g--Drives-compartilhados-FRM-CatalogoPoliticas/memory/MEMORY.md
   ```
   Mais arquivos `<topico>.md` na mesma pasta, on-demand.

3. **Listar regras carregadas** em `.claude/rules/` — confirmar que regras path-scoped relevantes ao trabalho atual estão presentes no contexto.

4. **Verificar planos recentes**:
   ```bash
   ls .claude/plans/
   ```
   Ler o plano mais recente. Verificar status (RASCUNHO / APROVADO / CONCLUIDO). Se APROVADO e não-CONCLUIDO, retomar de onde parou.

5. **Verificar estado do git**:
   ```bash
   git status
   git log --oneline -5
   ```

6. **Se houver pipeline em andamento**, verificar:
   - `data/derived/` — última saída e timestamp
   - `data/external_snapshots/` — última captura
   - `logs/` — últimos eventos relevantes

7. **Declarar entendimento** — dizer à pessoa usuária o que entende ser o estado atual do projeto e da tarefa em andamento. Pedir confirmação antes de continuar.

## Quando ativar

- Após qualquer compressão automática de contexto
- No início de qualquer nova sessão do Claude Code
- Quando a pessoa usuária diz "continue de onde parou" ou similar
- Quando o contexto parece incompleto ou confuso

## Hierarquia de fontes (precedência alta → baixa)

Em caso de conflito de informação, prevalece a fonte mais alta:

1. **Plano mais recente em `.claude/plans/`** — mais específico à tarefa
2. **`MEMORY.md`** (e `<topico>.md`) — notas persistentes entre sessões
3. **`CLAUDE.md`** — contexto e convenções do projeto
4. **`.claude/rules/`** — regras de procedimento
5. **`git log` e `git status`** — estado do repositório

`.claude/decisions/` (ADRs) é fonte autoritativa para "**por que** decidimos X" — consultar quando uma decisão arquitetural for questionada.

## Gestão de contexto

- **Preferir auto-compressão a `/clear`** — auto-compressão preserva memória; `/clear` reinicia
- **Salvar contexto importante em `MEMORY.md`** ANTES de perdê-lo (ver `@.claude/architecture/memoria-persistente.md`)
- **`/clear` apenas quando o contexto estiver genuinamente poluído** (ex.: experimento que deu errado e não tem valor)
- **Ao final de tarefas longas, atualizar `MEMORY.md`** com descobertas relevantes
- **NUNCA perder estado de plano aprovado** — ele está em disco em `.claude/plans/`

## Declaração de entendimento — formato

Após ler as fontes, antes de agir, dizer (in-line, não em arquivo):

> "Entendi o seguinte:
> - **Bloco/Rodada atual**: [se aplicável]
> - **Plano em andamento**: `.claude/plans/<arquivo>.md` (status: APROVADO; passos 1-3 CONCLUIDOS, passo 4 em aberto)
> - **Última ação registrada**: [última entrada relevante de MEMORY.md ou último commit]
> - **Próxima ação proposta**: [...]
>
> Confirma que devo prosseguir?"

Se a declaração estiver errada, a pessoa corrige antes que mudanças sejam feitas.

## Quando o protocolo encontra inconsistências

- Plano APROVADO mas commits divergem do plano → **parar**, reportar, pedir orientação
- `MEMORY.md` contradiz `CLAUDE.md` → **`MEMORY.md` é mais recente**, mas reportar e atualizar `CLAUDE.md`
- Arquivo mencionado no plano não existe → reportar, não tentar adivinhar

## Relação com outras regras

- `@.claude/rules/planejamento-obrigatorio.md` — formato do plano em disco
- `@.claude/architecture/memoria-persistente.md` — quando/como atualizar MEMORY.md
- `@.claude/rules/mudancas-minimas-cirurgicas.md` — fidelidade ao plano aprovado
