# Checkpoint 1 — Decisões da usuária

> Decisões tomadas pela usuária após apresentação consolidada da Rodada 1, para guiar a Rodada 2.

## Decisão 1 — Consolidação dos 11 arquivos atuais

**Escolha: Consolidação CONSERVADORA — 8-9 arquivos (não 6)**

- Aceito reduzir, **mas não fundir tão agressivamente** quanto a recomendação do Agent 1.1.
- Manter `recuperacao-sessao.md` **separado** de planejamento (não fundir).
- Manter testes em **arquivo próprio** (não fundir com investigate-before-implement).

Implicações para a Rodada 2:
- Estrutura-alvo provável: 8-9 arquivos universais + 1 pipeline-python-etl
- Fusões aceitas: `plan-first.md` + `plan-first-workflow.md`; `development-procedure.md` + `minimal-changes.md`; `pipeline-safety.md` + `protect-originals.md`
- Fusões NÃO aceitas: `investigate-before-implement.md` + `test-first-protocol.md` + `testing-protocol.md` em um arquivo só (mantê-los separados, talvez 2 arquivos: ciclo de investigação + protocolo de testes)
- `recuperacao-sessao.md` permanece arquivo independente

## Decisão 2 — Ambição perante as 28 lacunas

**Escolha: Cobertura MÁXIMA**

- Tudo o que o Agent 1.3 listou entra na proposta inicial.
- Aceitar mais cerimônia em troca de robustez de longo prazo.
- Devil's Advocate na Rodada 2 vai validar/ajustar — **mas não é a usuária que pré-poda**, é o agent crítico que terá que justificar cortes.

Implicações para a Rodada 2:
- Architect (Agent 2.2) deve desenhar estrutura para acomodar **todas as 28 lacunas + 6-9 fusões dos arquivos atuais + 1 regra Python ETL**.
- Skills/Agents/Hooks (Agent 2.3) deve detalhar cada artefato proposto com propósito/gatilho/ferramentas/prioridade.
- Devil's Advocate (Agent 2.1) tem licença total para cortar/suavizar, mas deve **justificar caso a caso**.

## Decisão 3 — Podas a priori

**Escolha: Sem podas a priori — Devil's Advocate decide**

A usuária optou por não excluir nenhuma das 28 lacunas de antemão (sinalizou "não sei decidir"). Confia no Devil's Advocate da Rodada 2 para fazer essa filtragem com base em critérios de utilidade real.

## Diretrizes derivadas para a Rodada 2

1. **Architect** desenha estrutura para cobertura máxima (8-9 arquivos consolidados + 11 novas rules + 5 skills + 4 architecture docs + 2 hooks + 1 schema + 2 configs).
2. **Devil's Advocate** examina criticamente cada item da Rodada 1 (incluindo as 28 lacunas) e propõe vereditos `MANTER / SUAVIZAR / CORTAR` com justificativa concreta.
3. **Skills/Agents/Hooks** especifica em detalhe cada skill, agent customizado e hook propostos — propósito, gatilho, ferramentas necessárias, frontmatter, prioridade na sequência de implementação.
4. Todos consideram o cenário "site na pasta do Drive compartilhado" como restrição base.
5. Todos honram as fusões aceitas e separações solicitadas (Decisão 1).