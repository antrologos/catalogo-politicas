---
status: aceito
data: 2026-05-01
contexto: E · E.3 (decisão de stack do MVP)
substituido_por: null
---

# ADR-007 — Stack do MVP: Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla JS / Alpine + D3 + Cytoscape

## Contexto

O Bloco E (UX/benchmark) precisava decidir a stack do MVP do site catálogo. Restrições declaradas:
- Hospedagem: GitHub Pages estático em `antrologos.github.io/catalogo-politicas/`.
- Mantenedor: Rogério solo, ~4-8h/sem.
- 55 Must consolidados em E.2.D incluindo mapa coroplético D3, grafo Cytoscape, busca facetada, citação acadêmica formal.
- Persona técnica + persona pesquisador.
- Identidade gov.uk-inspired.

## Alternativas consideradas

### Alternativa A — Astro 5 + Tailwind + Pagefind + ilhas React

Defensor: avaliador consensual A do E.3.

- **Pró**: Content Layer API tipada (Zod), 76% Must atendidos nativamente, ecosystem rico de plugins, ilhas para mapa+grafo.
- **Contra**: Astro 5 lançou em nov/2024 (apenas 6 meses de produção; minor releases agressivos); TS estrito + Zod + React + Vite 6 = 4 ferramentas independentemente atualizáveis; estimativa subestimada por fator 2-4× (E.3.C).

### Alternativa B — Eleventy 3 + Tailwind + Pagefind + Vanilla JS / Alpine + D3 + Cytoscape (escolhida)

Defensor: avaliador consensual B do E.3.

- **Pró**: "boring tech" deliberada; 6 dev-deps; 0 deps runtime client; build estático puro; mantenedor Python/R consegue ler em frio depois de 6 meses; 53/55 Must atendidos diretamente; Tailwind/D3/Cytoscape são ferramentas independentes.
- **Contra**: comunidade menor; sem tipagem estática (drift de schema sem aviso); vanilla JS pode ser verbose em wireframes complexos.

### Alternativa C — Hugo + Pagefind

Mencionada apenas pelo adversarial E.3.C ("menção honrosa ignorada por viés JS-first"). Excluída por dificuldade de integrar Cytoscape (grafo) que é dependência client-side JS.

## Decisão

**Adotamos a Alternativa B — Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla JS / Alpine + D3 + Cytoscape.**

Razão central: o projeto tem três restrições não-negociáveis que essa stack respeita melhor que alternativas plausíveis:
1. Mantenedor único, ~4h/semana, horizonte de 5 anos — stack legível em frio.
2. Site é catálogo de dados imutáveis em build — não há requisito real para SSR/ISR/edge functions.
3. TCO 5 anos baixo e previsível — zero hosting pago, zero break change forçando reescrita.

Validação empírica: PoC executado em ~1.5h (vs 16h alvo, 10× abaixo) confirma viabilidade. Site no ar em https://antrologos.github.io/catalogo-politicas/ com 10 fichas reais, build em 3.5s, CSS 25.5KB ≤50KB, 0 KB JS na Home.

## Consequências

### Positivas
- Mantenedor consegue retomar projeto em frio depois de 6 meses sem tocar.
- Output é HTML estático que sobrevive à própria framework (bus factor 1 mitigado).
- Zero custo de hospedagem; zero custo de licença.
- Deploy reproduzível em GH Actions ~30s.

### Negativas / caveats
- **Drive sync × npm install**: documentado em RUNBOOK; desenvolvimento ativo em `C:/Users/antro/dev/catalogo-politicas/` (clone fora do Drive).
- **Config naming**: `eleventy.config.js` (sem dot inicial), não `.eleventy.config.js`.
- **Tailwind config**: `import` estático no topo, NÃO top-level await (incompatível com jiti loader).
- **Sem tipagem schema**: drift fica silencioso; mitigação via `ajv-cli` em CI bloqueante.
- **Comunidade menor**: suporte de IA/StackOverflow é mais raro; mitigação via documentação oficial Eleventy v3 + Discord.

### Cláusulas de reabertura

Esta decisão pode ser reaberta se:
1. **Bolsista FRM/IESP confirmado em ≤60 dias** (até 2026-07-01) — ver ADR `2026-05-01_clausula-reabertura-stack.md`.
2. **Pagefind descontinuado** — ver ADR `2026-05-01_fallback-pagefind-lunr.md`.
3. **Eleventy v6 com break changes não-migráveis em 2027+** — congelar em v5 indefinidamente OU migrar para Astro/Hugo (output é HTML estático portável).

## Versões pinadas

```json
{
  "@11ty/eleventy": "^3.0.0",
  "tailwindcss": "^3.4.17",
  "pagefind": "^1.1.1",
  "@11ty/eleventy-navigation": "^0.3.5",
  "@11ty/eleventy-plugin-rss": "^2.0.2"
}
```

Node 22 LTS (suportado até abril/2027).

## Referências

- E.3.A `working/E3-A-stack-astro.md` (defesa Astro)
- E.3.B `working/E3-B-stack-eleventy.md` (defesa Eleventy)
- E.3.C `working/E3-C-adversarial-critica.md` (crítica adversarial)
- E.3.D `working/E3-D-poc-eleventy-resultado.md` (PoC empírico aprovado)