---
status: aceito
data: 2026-05-01
contexto: A · Rodada 1 · Checkpoint 1
substituido_por: null
---

# ADR-0001 — Consolidação de 11 → 10 rules

## Contexto

A pasta `.claude/rules/` herdou **11 arquivos de regras** copiados de dois projetos anteriores:
- 8 arquivos do **Transcritorio** (projeto Python/PySide6 de transcrição de áudio)
- 3 arquivos do **mensalizacao_pnad** (projeto R de análise de PNAD Contínua)

Esses arquivos contêm valor universal misturado com referências específicas a stacks que **não fazem parte** do projeto atual (PyInstaller, CUDA, WhisperX, testthat, CRAN, PySide6/Qt). Há também redundâncias claras: a mesma regra aparece em duas versões (uma para Python, outra para R).

Diagnóstico da Rodada 1:
- **`gui-development.md`** — 100% PySide6/Qt. Sem analogia universal.
- **`development-procedure.md` + `minimal-changes.md`** — ~95% sobreposição (mesmo template em 2 stacks).
- **`plan-first.md` + `plan-first-workflow.md`** — ~85% sobreposição.
- **`investigate-before-implement.md` + `test-first-protocol.md` + `testing-protocol.md`** — repetem o mesmo ciclo 3 vezes com pequenas variações.
- **`session-recovery.md`** — universal com paths específicos do Transcritorio.
- **`pipeline-safety.md` + `protect-originals.md`** — proteção de dados; complementares.

A pessoa usuária precisa de uma decisão sobre **quanto** consolidar.

## Alternativas consideradas

### Alternativa A — Consolidação radical (6 arquivos)

Recomendação inicial do Agent 1.1: fundir maximamente, chegando a 6 rules universais + 1 pipeline-python-etl.

- **Pró**: máxima enxutez, baixo carregamento de contexto
- **Contra**: perde granularidade; mistura conceitos (planejamento + ciclo + recovery em um arquivo virado fica denso); difícil de path-scopar depois

### Alternativa B — Conservador (8-9 arquivos)

Aceitar fusões com >80% sobreposição, mas manter separados conceitos distintos.

- **Pró**: balanço entre redução e clareza; preserva separação semântica entre planejamento, teste, recovery
- **Contra**: 1-2 arquivos a mais que a versão radical

### Alternativa C — Sem consolidação (manter 11 + adicionar)

Adicionar arquivos novos (lacunas) sem mexer nos antigos.

- **Pró**: mínima mudança; preserva histórico literal
- **Contra**: paira material claramente obsoleto (Qt, R, CUDA); duplicação confunde; carrega muito contexto

## Decisão

**Adotamos a Alternativa B — Consolidação conservadora.**

Concretamente: **10 rules universais/temáticas** em `.claude/rules/`:

### 6 universais (consolidando os 11 atuais)
1. `mudancas-minimas-cirurgicas.md` ← `development-procedure.md` + `minimal-changes.md`
2. `planejamento-obrigatorio.md` ← `plan-first.md` + `plan-first-workflow.md`
3. `ciclo-investigacao-teste.md` ← `investigate-before-implement.md` + `test-first-protocol.md` + `testing-protocol.md` (em versão reduzida; sem repetição)
4. `recuperacao-sessao.md` ← `session-recovery.md` (paths atualizados, sem refs Transcritorio)
5. `protecao-fontes.md` ← `pipeline-safety.md` + `protect-originals.md` (adaptado para .xlsx + snapshots externos)
6. `pipeline-python-etl.md` (NOVO) — 11 princípios "ouro" extraídos das regras Python descartadas

### 4 temáticos de domínio (cobrem lacunas Top 10 da Rodada 1)
7. `operacao-drive.md`
8. `captura-responsavel.md`
9. `dados-politicas.md`
10. `pipeline-reproducible.md`

### Descartado
- `gui-development.md` — 100% PySide6/Qt, nenhum princípio aproveitável (descartado integralmente; vai para `archive/`)

### Não fundidos (decisão explícita do Checkpoint 1)
- **`recuperacao-sessao.md` permanece independente** (não fundido com planejamento)
- **Testes mantêm arquivo próprio** (não fundidos com `investigate-before-implement` em um único arquivo)

## Justificativa

1. **Conservador respeita estrutura mental** — arquivos por conceito ajudam a localizar regras; agrupar tudo em poucos arquivos densos prejudica leitura sob compressão de contexto.
2. **Path-scoping** (Rodada 3) só funciona bem com arquivos focados — se cada rule cobre 3 conceitos, `paths:` perde precisão.
3. **Material descartado é material descartado** — manter `gui-development.md` "por compatibilidade" gera ruído; o projeto não tem GUI desktop e não terá.
4. **A pessoa usuária pediu cobertura máxima das lacunas** (Checkpoint 1, Decisão 2) — caber 11 arquivos novos em 10 finais exige consolidação dos antigos.
5. **Devil's Advocate (Rodada 2)** validou o número 10 como sustentável; mais que isso vira cerimônia.

## Trade-offs

- **Aceitamos**: 1 arquivo a mais que a versão radical (`recuperacao-sessao.md` independente)
- **Aceitamos**: 10 arquivos vs. 6 — mais carregamento, mas com path-scoping isso fica controlado
- **Aceitamos**: perda do conteúdo Qt/PyInstaller/CUDA específico — mas todo princípio universal foi extraído antes do descarte
- **Mitigamos** redundância via ciclo INVESTIGAR/TESTAR ser definido **uma vez** em `ciclo-investigacao-teste.md` e referenciado por todos

## Consequências

### Positivas
- Estrutura `.claude/rules/` enxuta e focada
- Conteúdo path-scoped reduz contexto carregado
- Pipeline Python tem regra dedicada com 11 princípios extraídos
- Material descartado vai para `archive/` com manifesto

### Negativas
- Migração one-shot (sessão de escrita em massa após Rodada 4)
- Necessário comunicar a fusão a quem só lia uma das 11 antigas

### Neutras
- 6 lacunas adiadas para Bloco E/F/G (a11y, perf, SEO, i18n, mobile, hosting)

## Próximos passos

- [x] Rodada 2 — Devil's Advocate validar lista final
- [x] Rodada 3 — pesquisa externa para enriquecer rules
- [x] Rodada 4 — escrever conteúdo final dos 10 arquivos
- [ ] Migrar 11 originais para `.claude/archive/rules-originais-2026-05-01/` com `MANIFEST.md`
- [ ] Atualizar `CLAUDE.md` com nova estrutura (Bloco B)

## Referências

- `.claude/working/R1-A1.1-universalidade.md` — extração das regras universais
- `.claude/working/R1-A1.2-stack-especifico.md` — material descartado e ouro recuperado
- `.claude/working/R1-A1.3-lacunas.md` — 28 lacunas, das quais 4 viram rules temáticas
- `.claude/working/Checkpoint1-decisoes.md` — decisão da pessoa usuária
- `.claude/working/Checkpoint2-decisoes.md` — validação Devil's Advocate

## Histórico

- 2026-05-01: criado e aceito como parte da consolidação do Bloco A