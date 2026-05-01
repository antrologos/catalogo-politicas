# Regras originais — antes do Bloco A (consolidação 2026-05-01)

Estas 11 regras foram **copiadas de outros projetos** (Transcritorio em Python/PySide6 e mensalizacao_pnad em R) como ponto de partida do projeto FRM_CatalogoPoliticas. Passaram por **diagnóstico crítico em 4 rodadas** (com 12 agents totais e 3 checkpoints com a usuária) durante o Bloco A do plano `meu-intuito-criar-composed-pixel.md`.

**Decisão final**: as 11 originais foram **descartadas** e **substituídas por 10 regras consolidadas** + 3 architecture docs em `.claude/`. Conteúdo universal preservado e adaptado; conteúdo stack-específico (PySide6/Qt, PyInstaller, CUDA, R/CRAN/testthat/PNADC/SIDRA) descartado por irrelevância ao projeto-alvo (site web sobre catálogo de políticas).

## Por que guardar?

- **Auditoria**: rastrear o quê foi decidido e por quê
- **Arqueologia**: se uma regra futura precisar contexto histórico
- **Reversão**: se alguém questionar a consolidação

## Mapa de consolidação

| Original | Destino na nova estrutura | Motivo |
|---|---|---|
| `development-procedure.md` | Consolidado em `rules/mudancas-minimas-cirurgicas.md` | 95% sobreposição com `minimal-changes.md`; refs PySide6/PyInstaller removidas |
| `minimal-changes.md` | Consolidado em `rules/mudancas-minimas-cirurgicas.md` | Mesma cabeça em R; tabelas PNADC/SIDRA removidas |
| `plan-first.md` | Consolidado em `rules/planejamento-obrigatorio.md` | 85% sobreposição com `plan-first-workflow.md` |
| `plan-first-workflow.md` | Consolidado em `rules/planejamento-obrigatorio.md` | Idem |
| `investigate-before-implement.md` | Consolidado em `rules/ciclo-investigacao-teste.md` | Mesmo ciclo aparecia em 3 arquivos; consolidado em versão reduzida |
| `test-first-protocol.md` | Consolidado em `rules/ciclo-investigacao-teste.md` + parte em `rules/pipeline-python-etl.md` | Ciclo + hierarquia de testes; refs testthat/devtools removidas |
| `testing-protocol.md` | Consolidado em `rules/ciclo-investigacao-teste.md` + parte em `rules/pipeline-python-etl.md` | Idem; CUDA/PyInstaller removidos |
| `session-recovery.md` | Reescrito em `rules/recuperacao-sessao.md` | Protocolo mantido; paths Transcritorio removidos |
| `pipeline-safety.md` | Consolidado em `rules/protecao-fontes.md` | Princípio de proteção mantido; ASR/WhisperX/pyannote descartados |
| `protect-originals.md` | Consolidado em `rules/protecao-fontes.md` | Adaptado de áudio/vídeo para xlsx + snapshots externos |
| `gui-development.md` | **DESCARTADO INTEIRO** | 100% específico PySide6/Qt; sem analogia para web |

## Conteúdo "ouro" recuperado por novos arquivos

- **`rules/pipeline-python-etl.md`** ← 11 princípios universais Python extraídos de `pipeline-safety.md` (encoding utf-8, python -B), `testing-protocol.md` (pathlib, hierarquia toy/unit/int, protocolo debug)
- **`rules/operacao-drive.md`** ← (NOVO; lacuna #9, #10, #11 do diagnóstico)
- **`rules/captura-responsavel.md`** ← (NOVO; lacuna #5, #6, #7)
- **`rules/dados-politicas.md`** ← (NOVO; lacunas #1, #2, #3 + 10 padrões de schema)
- **`rules/pipeline-reproducible.md`** ← (NOVO; lacunas #22, #23, #25)

## Política de retenção

- Manter indefinidamente em git (espaço negligenciável: 11 arquivos × ~5KB = 55KB)
- Se Bloco G+ precisar arquivar mais, considerar compressão `.tar.gz`

## Material consolidado relacionado

- Diagnóstico completo em `.claude/working/R1-*` (Rodada 1 — universalidade, stack-específico, lacunas)
- Crítica adversarial em `.claude/working/R2-*` (Rodada 2 — devil's advocate, architect, skills/agents/hooks)
- Pesquisa externa em `.claude/working/R3-*` (Rodada 3 — Anthropic docs, benchmarks, scraping responsável)
- Decisões da usuária em `.claude/working/Checkpoint1-decisoes.md`, `Checkpoint2-decisoes.md`, `Checkpoint3-decisoes.md`
- ADR formal: `.claude/decisions/2026-05-01_consolidacao-rules.md` e `.claude/decisions/2026-05-01_estrutura-completa-bloco-a.md`

---

*Arquivado em 2026-05-01 — Bloco A do plano `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`.*