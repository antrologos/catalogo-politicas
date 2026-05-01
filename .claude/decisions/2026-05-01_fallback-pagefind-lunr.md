---
status: aceito
data: 2026-05-01
contexto: E · E.3 (cláusula de continuidade da stack)
substituido_por: null
---

# ADR-008 — Fallback Pagefind → Lunr.js se descontinuado

## Contexto

A stack do MVP (ADR-007) adota **Pagefind 1.x** como motor de busca client-side. Pagefind é mantido por **CloudCannon** (uma empresa, não fundação) e tem ~3 anos de produção. Risco identificado pelo adversarial E.3.C: se Pagefind for descontinuado em 2028+, o site não pode mais regenerar índice de busca.

## Alternativas consideradas

### Alternativa A — Sem fallback declarado

- **Pró**: zero overhead agora.
- **Contra**: se Pagefind morrer, mantenedor solo enfrenta migração emergencial sem plano.

### Alternativa B — Lunr.js como fallback declarado (escolhida)

[Lunr.js](https://lunrjs.com/) é uma biblioteca de busca client-side em JavaScript puro, com ~10 anos de produção, MIT, manutenção comunitária ativa.

- **Pró**: estabilidade de longuíssimo prazo; sem dependência de empresa única; documentação consolidada.
- **Contra**: indexação em build-time exige código custom (não tem CLI standalone como Pagefind); UX é mais simples (sem facetas nativas).

### Alternativa C — MeiliSearch self-hosted

- **Pró**: search dinâmico potente.
- **Contra**: exige servidor; quebra restrição "GitHub Pages estático"; viola NF-M-31 ("Sem dependência de serviços pagos").

## Decisão

**Adotamos a Alternativa B — Lunr.js como fallback declarado.**

Plano de migração (executar SE/QUANDO Pagefind for descontinuado):

1. **Detecção**: GitHub issue de "Pagefind discontinued" no repo upstream OU release oficial cancelando manutenção.
2. **Preparação**: gerar índice Lunr em build-time (~50-150 linhas de JS em `_data/lunr-index.js`).
3. **UI**: substituir Pagefind UI por busca custom com `lunr.search(q)`. Estrutura HTML do W2 já é compatível (`data-pagefind-body` vira `data-search-body`).
4. **Facetas**: Lunr não tem facetas nativas; recriar com filtros client-side em vanilla JS sobre dataset embarcado.
5. **Estimativa de migração**: 30-60h de Bloco G ou hotfix dedicado.

Esta decisão NÃO altera o stack atual — Pagefind continua sendo a primeira escolha. É um plano de continuidade documentado.

## Consequências

### Positivas
- Mantenedor solo tem caminho documentado se Pagefind morrer.
- Estrutura HTML do site é neutra à biblioteca de busca (`<article data-pagefind-body>` é genérico).
- Lunr é "boring tech" alinhada com filosofia da decisão de stack (ADR-007).

### Negativas
- Migração não é trivial (30-60h); mas é viável por mantenedor solo.
- Lunr não tem UI pronta como Pagefind; UI custom precisará ser desenvolvida.

## Referências

- E.3.C `working/E3-C-adversarial-critica.md` (crítica que motivou esta cláusula)
- ADR-007 `2026-05-01_stack-mvp-eleventy.md`
- https://lunrjs.com/