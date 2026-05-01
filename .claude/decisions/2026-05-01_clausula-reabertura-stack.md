---
status: aceito
data: 2026-05-01
contexto: E · E.3 (cláusula condicional de reabertura)
substituido_por: null
---

# ADR-009 — Cláusula de reabertura da decisão de stack se bolsista FRM/IESP for confirmado em ≤60 dias

## Contexto

A decisão de stack (ADR-007 — Eleventy 3 + Vanilla JS) foi tomada **sob a premissa explícita de mantenedor solo** (Rogério, 4-8h/sem). A defesa B do E.3 ganhou contra a defesa A (Astro 5 + React + TS + Zod) porque mantenedor solo não consegue absorver curva cognitiva de 4 ferramentas independentes (Astro/React/TS/Zod).

Adversarial E.3.C alertou: **se essa premissa mudar (bolsista financiado de 20h/sem)**, a equação muda — Astro deixa de ser arriscado e ganha valor com Content Collections tipadas.

A usuária optou no Checkpoint E.4 por "adiar decisão de mantenedor até E.6". Bloco F começa assumindo solo, mas a janela de reabertura precisa estar registrada.

## Alternativas consideradas

### Alternativa A — Decisão de stack imutável

- **Pró**: simplicidade.
- **Contra**: se bolsista vier, mantenedor solo arquitetural permanece subótimo para o novo cenário.

### Alternativa B — Reabertura aberta (sem prazo)

- **Pró**: máxima flexibilidade.
- **Contra**: vira cláusula que nunca é exercida; cria incerteza sem benefício.

### Alternativa C — Janela de 60 dias com critério explícito (escolhida)

- **Pró**: força negociação institucional ou aceitação consciente do solo; depois disso, ADR-007 fica firme.
- **Contra**: pressão de prazo na FRM/IESP.

## Decisão

**Adotamos a Alternativa C — Janela de reabertura de 60 dias (até 2026-07-01) com critério explícito.**

### Critério de reabertura

A decisão de stack (ADR-007) é reaberta se TODAS as condições abaixo forem atendidas até **2026-07-01**:

1. **Confirmação institucional formal** da FRM/IESP-UERJ por email/ata declarando alocação de bolsista.
2. **Carga horária mínima**: 20h/sem dedicadas ao projeto.
3. **Duração mínima**: 12 meses contratados (cobrir todo o Bloco F).
4. **Conhecimento prévio do bolsista** em pelo menos 2 de: TypeScript, React, Astro, Zod (caso contrário, curva de aprendizado do bolsista anula o ganho).

### Procedimento de reabertura

Se as 4 condições forem confirmadas em ≤60 dias:

1. Marcar ADR-007 como `substituido_por: 2026-MM-DD_stack-mvp-astro.md`.
2. Criar novo ADR `2026-MM-DD_stack-mvp-astro.md` com decisão Astro 5 + Tailwind + Pagefind + ilhas React + Zod.
3. Repetir PoC empírico (16h alvo) em Astro com 10 fichas reais.
4. Migrar `site/` existente: Eleventy `.njk` → Astro `.astro`. Estimativa 40-80h por bolsista.
5. Bloco F prossegue na nova stack a partir do PoC Astro.

### Procedimento sem reabertura

Se 2026-07-01 chegar sem confirmação:

1. ADR-009 muda status para `aceito (expirado)`.
2. ADR-007 (Eleventy) torna-se decisão definitiva.
3. Bloco F prossegue solo, com cortes adversariais E.4.C disponíveis como contingência caso a janela de lançamento exceda 12 meses.

## Consequências

### Positivas
- Mantém otimalidade do stack para o cenário real (qualquer que seja).
- Força decisão institucional explícita em vez de procrastinação indefinida.

### Negativas
- Atrasa o início do Bloco F em até 60 dias se houver expectativa de bolsista.
- Cria incerteza temporal (Bloco F com possível rebase de stack).

### Mitigação da incerteza temporal

- Sprint 0 do Bloco F (preparatório de tokens/componentes mínimos) é **stack-agnóstico** (Tailwind + Markdown + estrutura de pastas). Pode começar imediatamente sem risco de retrabalho.
- Sprints 1+ (Tabs ARIA, busca facetada) começam APENAS após 2026-07-01 (decisão definitiva).

## Referências

- ADR-007 `2026-05-01_stack-mvp-eleventy.md`
- E.3.C `working/E3-C-adversarial-critica.md` (alerta original)
- E.4 Checkpoint (decisão "adiar decisão de mantenedor até E.6")