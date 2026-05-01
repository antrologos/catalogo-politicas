---
descricao: Princípio universal de mudanças mínimas, cirúrgicas e planejadas. Sem refactor oportunista, sem cosmética não solicitada, ordem obrigatória de implementação.
escopo: universal · todo o projeto
versao: 1.0
ultima_revisao: 2026-05-01
---

# Mudanças Mínimas e Cirúrgicas

**Status:** OBRIGATÓRIA · **Escopo:** todo o projeto FRM_CatalogoPoliticas

## Princípio

Toda alteração no código, dados ou configuração deve ser **mínima, cirúrgica e planejada**. Nunca modificar mais do que o estritamente necessário para o objetivo imediato. Não "aproveitar" para fazer correções ou melhorias em áreas não solicitadas.

## Antes de editar qualquer arquivo

1. **Investigar** — ler o código/arquivo existente, entender o fluxo, mapear dependências
2. **Planejar** — descrever em texto as mudanças ANTES de qualquer edit (quais linhas, por quê)
3. **Verificar dependências** — toda função alterada → quem a chama? toda chave de schema adicionada → quem consome?
4. **Medir impacto** — quantos arquivos/testes são afetados? A mudança quebra exemplos, snapshots ou pipeline?

## Regras de edição

- **Uma mudança por vez** — não misturar fix de bug com feature nova
- **Sem refactor oportunista** — se não foi pedido, não refatorar
- **Sem "melhorias" cosméticas** — não renomear variáveis, adicionar comentários, type hints, ou reorganizar código que não faz parte da tarefa
- **Sem editar funções/módulos compartilhados** sem plano aprovado (afetam todo o pipeline)
- **Testar ANTES de editar o arquivo real** — criar toy/unit test que valide a mudança isoladamente (ver `@.claude/rules/ciclo-investigacao-teste.md`)
- **Preferir Edit a Write** — edições pontuais (Edit tool) são mais seguras que reescritas completas (Write tool); só use Write para criar arquivos novos ou rewrites totais

## Ordem obrigatória de implementação

```
1. INVESTIGAR  → ler código, entender dependências, identificar causa raiz
2. PLANEJAR    → texto descritivo da mudança; salvar em .claude/plans/ se não-trivial
3. CRIAR TESTE → toy/unit test que valide a mudança em contexto restrito
4. EDITAR      → mudança mínima no arquivo real, seguindo o plano
5. VALIDAR     → rodar o teste; rodar suite afetada; verificar saída
6. COMMITAR    → apenas se tudo passou e se solicitado
```

A ordem não é negociável. Pular o passo 3 (teste prévio) é a violação mais comum e a mais perigosa.

## Funções/áreas protegidas — exigem plano aprovado

Em qualquer momento que estes existirem no projeto, alterações requerem `/plan` aprovado antes do edit:

| Área | Razão |
|---|---|
| `data/raw/Fichas das Políticas - 1ª onda.xlsx` | Fonte primária imutável |
| `scripts/etl/*.py` (pipeline ETL) | Afeta normalização e build do JSON canônico |
| `data/derived/*.json` canônico | Saída validada contra schema; consumida pelo site |
| `.claude/rules/**`, `.claude/hooks/**` | Mudar regras muda o comportamento do agente |
| `context/policies-schema.json` | Contrato de dados; afeta tudo a jusante |
| `context/vocabulario-canonico.json` | Vocabulário fechado; mudança quebra filtros |
| `data/external_snapshots/**` | Snapshots imutáveis após captura |

## O que fazer quando um teste falha

1. **NÃO** editar a função compartilhada para "resolver" rapidamente
2. Investigar: o teste está errado ou a função tem bug real?
3. Se for bug real: planejar o fix separadamente, com evidência empírica
4. Se for limitação conhecida: contornar localmente, não na função compartilhada
5. **NUNCA** entrar em loop "edit → testar → falha → edit → testar" sem parar para entender a causa raiz

## Anti-padrões proibidos

- Editar 3+ arquivos em uma única mudança sem plano aprovado
- "Melhorar" código vizinho ao que está sendo corrigido (escopo creep)
- Renomear símbolos, mover arquivos, ajustar formatação no mesmo commit que faz fix
- Adicionar dependência ao `requirements.txt` / `package.json` sem justificativa explícita
- Reescrever um arquivo inteiro com Write quando 3 Edits resolveriam
- Commitar com testes falhando ou warnings novos
- Fazer "fix" cego iterativo sem entender a causa raiz

## Tarefa trivial (sem plano)

Estas são as únicas exceções à ordem obrigatória:

- Corrigir typo em 1 arquivo
- Atualizar comentário ou docstring
- Editar `CLAUDE.md`, `MEMORY.md`, ou arquivo em `.claude/` (mas mudanças em `.claude/rules/` e `.claude/hooks/` SÃO não-triviais — ver `@.claude/rules/planejamento-obrigatorio.md`)
- Atualizar `.gitignore`
- Adicionar entrada em arquivo de log/decisões existente

Para tudo mais, o ciclo completo é obrigatório.

## Checklist antes de qualquer commit

- [ ] Mudança é mínima e focada em UM objetivo
- [ ] Nenhuma função compartilhada foi alterada sem necessidade
- [ ] Teste (toy/unit) existe e passa
- [ ] Verificação pós-implementação feita
- [ ] Nenhum arquivo fora do escopo foi alterado
- [ ] Sem menção a Claude/AI no commit (ver convenções de commit do projeto)

## Relação com outras regras

- `@.claude/rules/planejamento-obrigatorio.md` — define quando plano é obrigatório
- `@.claude/rules/ciclo-investigacao-teste.md` — detalha o ciclo INVESTIGAR→PLANEJAR→TESTAR
- `@.claude/rules/recuperacao-sessao.md` — protocolo após compressão de contexto

Em conflito, esta regra cede para `ciclo-investigacao-teste.md` (que tem prioridade máxima).