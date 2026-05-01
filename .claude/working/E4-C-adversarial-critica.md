# E.4.C — Crítica adversarial dos wireframes A (fluxo de uso) e B (estrutura+a11y)

> **Avaliador adversarial** do sub-bloco E.4 (Wireframes prioritários).
> Missão: ler integralmente E.4.A e E.4.B, criticar ambas com fundamento, expor inconsistências, contestar estimativas, e propor um corte honesto antes de E.5.
> Lente: estado em 2026-05-01 — 439 fichas, 148 snapshots, 55 Must consolidados, mantenedor solo Rogério ~4h/sem (declarado em E.2.D métrica #5), Eleventy 3 condicional (E.3 ainda sob revisão pela usuária após PoC), horizonte 5 anos.
> Coerência com adversariais anteriores: **E.1.F** propôs cortar mapa, grafo e "Como adotar"; **E.2.C** estimou 380-1040h para 55 Must e exigiu cortes drásticos; **E.3.C** apontou que stack é 5-15% do esforço, e que mapa+grafo a11y custam 60-120h com SR real.

---

## 1. TL;DR — 5 decisões críticas

1. **A diz 208-328h só para os 8 wireframes; minha estimativa adversarial é 320-560h** (fator 1.5-1.7×). E ainda assim 8 wireframes são apenas ~12 dos 55 Must. Os outros ~43 Must (CI, schema.org, snapshots, citação 5 formatos, LGPD, backup, continuidade, axe-core enforcement, Lighthouse-CI, redirects, sitemap, JSON-LD, fontes, Tailwind tooling, Pagefind tuning) custam outras 200-450h. **Total honesto Bloco F: 520-1010h.** Coerente com o range 380-1040h de E.2.D, na metade superior. Lança em **2027 sem bolsista. 2026 só com cortes.**

2. **A inconsistência A↔B mais grave é mapa em mobile**: A nunca declara o que acontece em <768px (mantém SVG ou colapsa?); B é categórico — "mapa colapsa para lista textual em mobile". Como A propõe mapa também na Home (W1) e dedicado (W6), há **duas ocorrências silenciosamente em desacordo**. Resolver: B prevalece (NF-M-09 + NF-M-28 são Must), A precisa absorver. Implicação direta para A: estimativa de Home (16-24h) e Mapa (30-50h) ignora **30% extra** para o caminho mobile.

3. **Tabs ARIA W3C-compliant em W3 é o item mais subestimado dos dois.** A diz "abas JS minimal 2-4h". B classifica risco a11y como **ALTO** e admite implementação completa (setas ←→, Home/End, foco vai para tabpanel ativo, fallback `<details>` em mobile). Estimativa honesta: **18-32h** (incluindo testes em 3 SR). A está **6-10× off**. E W3 (Ficha) é a **página mais visitada** — onde tabs quebrarem é onde mais dói.

4. **Cortar 3 wireframes do MVP F.1**: W5 (Comparação inter-UF), W6 (Mapa dedicado) e W7-de-A (Grafo). E.1.F já tinha proposto. Decisão E.1 (manter) virou Decisão E.2.D (manter — usuária preferiu ambição). **Reabrir agora com base em evidência empírica nova**: estimativa W5+W6+W7 = 110-170h (lente A) → 160-260h (lente adversarial). Esses 160-260h são quase metade do MVP otimista. **Cortar essas 3 = lança em 2026 com 5 wireframes; manter = lança em 2027.**

5. **A ordem F.1/F.2/F.3 proposta por A é sensata mas tem 1 dependência escondida séria**: F.1 inclui W3 (Ficha), W2 (Busca), W1 (Home), W8 (Sobre). A Home (W1) **inclui mapa coroplético** mesmo no MVP — A admite isso ("mapa entra em F.2" como redundância, mas o wireframe próprio fala em "SVG coroplético Brasil"). Se F.1 = "tudo menos mapa+grafo+comparação", **a Home tem que ser redesenhada para sem mapa em F.1**. A não fez isso explicitamente. Marco M1 sem mapa = boa ideia; precisa wireframe alternativo Home-light.

---

## 2. Inconsistências entre A e B (lista pareada com resolução)

### 2.1 — Mapa em mobile: SVG ou lista textual?

| | A (E.4.A) | B (E.4.B) |
|---|---|---|
| W1 Home | "SVG coroplético Brasil; UFs cobertas em azul-escuro; hover mostra 'PE: 47 políticas'" — sem menção a mobile | "mobile (320-767) single column + hambúrguer + **mapa colapsa para lista**" |
| W6 Mapa dedicado | "30-50h" | "Mapa SVG inline; Cytoscape **opt-in** em mobile". (B na verdade chama W6 de **Grafo**, não Mapa — outra inconsistência §2.4.) |
| Resolução | **B prevalece**. NF-M-09 (Must) + NF-M-28 (touch + responsivo). Em mobile <768px, render `<table>` sortable em vez de SVG. A precisa absorver. |

**Implicação de horas**: A subestima. Renderizar tabela sortable equivalente é +6-10h por wireframe que tem mapa. W1 + W6 = +12-20h.

### 2.2 — Tabs em W3: ARIA W3C ou `<details>`?

| | A | B |
|---|---|---|
| Decisão | "Abas JS minimal 2-4h" + "abas via JS sem reload + atualizam URL: `?aba=documentos`" | **Tabs ARIA W3C-compliant** (setas ←→, Home/End, Enter/Space ativa, foco para tabpanel) + **`<details>` em mobile** como degradação aceita |
| Resolução | **B prevalece** integralmente. A subestimou em ~6×. Implementação correta de tabs ARIA + fallback `<details>` mobile + sincronização com URL é **18-32h**, não 2-4h. |

**Implicação**: a estimativa de A para W3 (24-40h) já está estourada pela tab — total honesto W3 é **40-65h**.

### 2.3 — W6 vs W7: numeração/nome divergem entre A e B

A:
- W5 = Comparação
- W6 = Mapa coroplético dedicado
- W7 = Grafo de relacionamentos
- W8 = Sobre

B:
- W5 = Comparar inter-UFs
- **W6 = Grafo de relacionamentos** (!)
- W7 = 404
- W8 = Sobre

**A não tem 404 nos 8 wireframes!** A omissão é grave — E.1.F (CONS-M-04 implícito) e B explicitamente listam página 404 com fuzzy match (F-M12 promovido para Must em E.2.A; depois rebaixado para Should em E.2.C; status final em E.2.D não fica claro). Status: **F-M12 fuzzy ficou Should; 404 simples permanece Must**.

**Resolução**: W7 deve ser 404 (B está certo). A pulou um Must. **+8-15h** (404 simples + fuzzy diferido para Bloco G).

E o Mapa coroplético dedicado de A (E.4.A §6) — onde fica? **Resposta adversarial**: virou redundância da Home. Cortar W6-de-A e manter mapa só na Home (W1). Economia 30-50h. Ver §3.6.

### 2.4 — Grafo: A diz `/politica/<slug>/relacionadas/`; B diz `/grafo/` ou `/politica/{uf}/{slug}/grafo/`

| | A | B |
|---|---|---|
| URL | `/politica/<slug>/relacionadas/` (gera 439 páginas em build-time) | `/grafo/` global OU `/politica/{uf}/{slug}/grafo/` |
| Geração | 439 páginas pre-renderizadas | "Cytoscape **opt-in** (não carrega até clicar)" → sugere 1 página global |
| Resolução | **A é mais correto** para fluxo de uso (técnico chega via ficha → ver relacionadas). B propõe URL global que dilui contexto. **MAS** gerar 439 páginas pré-renderizadas é caro: cada uma precisa de cálculo de citações reversas + renderização Cytoscape (canvas inicial) + DOM mirroring (B). **40-60h é otimista**; honesto é **50-90h** se feito por ficha. |

### 2.5 — URL do Grafo: A omite suporte a mobile, B é categórico

A (W7 grafo): "Drag/zoom/pan canvas" — sem menção a mobile.
B (W6 grafo): "mobile (320-767) toggle some + **Cytoscape NÃO carrega por padrão**".

Em mobile, A presume Cytoscape funcional; B diz não. **B prevalece** (responsivo + perf). Implicação: lista textual paralela é fonte canônica em mobile (já era em B), e em A vira obrigatório. **+5-10h** para A absorver.

### 2.6 — Comparação inter-UF: A propõe drag-to-select retângulo, B não

A (W5): "Drag-to-select retângulo no mapa (OECD GPS) — fase 2".
B (W5): tabela com `<caption>` + scope + tabular-nums + scroll horizontal mobile, sem menção a drag.

A já se policia com "fase 2" — fora do MVP. **Mas A inclui isso na estimativa 40-60h sem segregar.** Honestamente: drag-to-select é overkill (E.1.F já criticou OECD GPS; "anos de iteração para fazer bem"). **Cortar drag-to-select reduz W5 em 8-15h.**

### 2.7 — Página `/sobre/` (W8): A propõe 10 seções single-page; B propõe 6 cards + sub-rotas

| | A | B |
|---|---|---|
| Estrutura | Single page com 10 seções + nav lateral sticky + URL hashes | `/sobre/` agregadora + 6 sub-rotas independentes (`/transparencia`, `/privacidade`, `/termos`, `/acessibilidade`, `/cobertura`, `/status`) |
| Estimativa | 12-20h | "~10KB HTML; sub-páginas regeneradas a cada build; cache HTTP" — não estima horas |
| Resolução | **B é arquiteturalmente mais correto** (sub-rotas → URL bookmarkáveis específicas, melhor para SEO de "/sobre/privacidade", melhor para citação de páginas específicas). Mas custa mais wireframes (6 sub-páginas × ~3-5h cada = 18-30h adicionais). **Total honesto Sobre+sub-rotas: 24-40h**, não 12-20h. |

### 2.8 — Filtros com URL state: A diz "URL muda imediatamente"; B silencia sobre fricção

A (W2): "Filtros mudam URL imediatamente (sem botão Aplicar)".
B (W2): "URL state via `history.pushState` permitindo 'Copiar link'" — concorda.

**Mas neither addresses**: cada keystroke em busca debounced 150ms muda URL? Cada checkbox click muda URL? **Se sim**, history stack vira spam (Backbutton 30 vezes para sair). Se não, B inconsistente. **Resolução**: usar `history.replaceState` para mudanças intermediárias e `pushState` apenas em "Search submit" ou "Clear filters". **+2-4h** de polish em W2.

### 2.9 — `aria-live` em contadores: timing imprevisível

B propõe `aria-live="polite"` em `#resultados-titulo` ("42 políticas correspondem"). A não menciona aria-live. **Risco**: SR pode anunciar "42 políticas... 41 políticas... 38 políticas" durante typing rápido — verbosidade insuportável.

**Resolução**: live region só dispara após **debounce 500ms + idle**. B não detalha; é responsabilidade da implementação. **+2-4h** em W2.

### 2.10 — W4 (UF executiva) — tabela em mobile: cards vs scroll horizontal

A (W4): silencia sobre comportamento mobile (apenas "lista paginada 2-4h").
B (W4): "tabela vira **stacked cards** (cada `<tr>` → `<article>`)" — transformação de markup.

**B é mais correto a11y, mas custa**: implementar `display: contents + <th data-label>` para 53 linhas × 6 colunas é **+10-15h** (incluindo testes TalkBack Android). A subestimou.

### Sumário das inconsistências

| # | Inconsistência | Resolução | Custo escondido |
|---|---|---|---|
| 2.1 | Mapa mobile | B (lista textual) | +12-20h (W1+W6) |
| 2.2 | Tabs ARIA | B (W3C completo) | +14-28h (W3) |
| 2.3 | Numeração + 404 ausente em A | Adicionar 404 (W7-B) | +8-15h |
| 2.4 | URL/geração do grafo | A (URL); B (perf) | +10-30h |
| 2.5 | Grafo mobile | B (não carrega) | +5-10h |
| 2.6 | Drag-to-select W5 | Cortar (já era fase 2) | -8-15h |
| 2.7 | Sobre estrutura | B (sub-rotas) | +12-20h |
| 2.8 | URL state | replaceState híbrido | +2-4h |
| 2.9 | aria-live timing | debounce 500ms | +2-4h |
| 2.10 | Tabela mobile W4 | B (cards) | +10-15h |

**Total custo escondido líquido: +67-131h** acima da estimativa de A (208-328h).

---

## 3. Wireframes sob suspeita de baixo ROI — avaliação 1-by-1

Critério: **(uso real pela persona técnica)** vs **(custo de implementação + manutenção a11y)**. Grade A-D.

### 3.1 — W1 Home/Dashboard — Grade **B+**

- **Uso real**: alto. Porta de entrada para 80% dos usuários (chefia envia link, primeira vez). Caminho para `/buscar/` e `/uf/<sigla>/`.
- **Custo (lente A)**: 16-24h.
- **Custo honesto adversarial**: 28-40h (mapa Home + lista textual + autocomplete robusto + KPIs build-time + responsivo + a11y mapa).
- **Veredito**: manter. Mas **cortar mapa coroplético da Home no MVP F.1** — substituir por lista textual de UFs com contadores (E.1.F já recomendou). Mapa entra em F.3. **Economia: 8-12h** + reduz risco a11y na primeira impressão.

### 3.2 — W2 Busca facetada — Grade **A**

- **Uso real**: muito alto. Caminho dominante. Atalho `/`. Persona técnica que sabe nome chega aqui direto.
- **Custo (lente A)**: 30-50h.
- **Custo honesto adversarial**: 50-80h. Pagefind UI default não cobre faceting com URL state — exige UI custom. Live region debounce + foco volta para resultados-titulo + 7 facetas com contadores recalculados em tempo real.
- **Veredito**: manter. **MUST absoluto**. Esta é a única página que **sem ela o site é inútil para a persona**. Aceitar custo alto.

### 3.3 — W3 Ficha individual — Grade **A**

- **Uso real**: muito alto. Destino do fluxo dominante. Onde técnico extrai conteúdo.
- **Custo (lente A)**: 24-40h.
- **Custo honesto adversarial**: 50-80h (incluindo Tabs ARIA W3C completo, 4 formatos de citação build-time, abas via URL, schema.org JSON-LD por ficha, snapshot link, fallback ausência de snapshot, completude badge, breadcrumbs).
- **Veredito**: manter. **MUST absoluto**. Aceitar 50-80h. Page mais cara depois de W2.

### 3.4 — W4 Página executiva por UF — Grade **B**

- **Uso real**: alto para persona estadual (bookmark `/uf/pe/`). Mas pode ser substituída por `/buscar/?uf=pe` no MVP — E.2.C item 1.1 já argumentou rebaixar para Should.
- **Custo (lente A)**: 16-24h.
- **Custo honesto adversarial**: 30-45h (KPIs por UF + barras clicáveis + tabela responsiva mobile + PDF resumo + 9 páginas geradas + filtros locais). PDF resumo: **+8-15h** (Puppeteer ou print-stylesheet — A diz "reuso W3" mas o template é diferente).
- **Veredito**: rebaixar para **F.2 (não F.1)**. F.1 entrega `/buscar/?uf=pe` como substituto. Em F.2 (após beta privado), construir UF dedicada se feedback exigir. **Economia em F.1: 30-45h**. (E.2.C já tinha proposto isso.)

### 3.5 — W5 Comparação inter-UF — Grade **C**

- **Uso real**: **incerto**. A propõe cenário "técnico prepara nota técnica para Secretária — sessão 30min, output PDF". Mas: (i) frequência? Quantas vezes por mês um técnico de SEDUC roda comparação inter-UF? (ii) substituível por: 2 abas com `/uf/sp/` e `/uf/pe/` lado a lado + copy-paste. (iii) E.1.F adversarial: "comparação inter-UF profunda — uso real por gestor é incerto".
- **Custo (lente A)**: 40-60h.
- **Custo honesto adversarial**: 60-100h (mapa interativo seleção múltipla 12-16h + 4 abas Tabela/Gráfico/Mapa/Por Política 16-24h + URL state 5+ params 4-6h + agregação client-side 7+ dimensões 4-6h + PDF custom 4-8h + edge cases 2-4h + mobile com scroll horizontal preservando scope 8-15h + a11y de tabelas wide com NVDA 6-10h).
- **ROI**: 60-100h para feature de uso esporádico (provável <10% das sessões). Pior ROI dos 8.
- **Veredito**: **CORTAR do MVP**. Mover para **Bloco G**. Pode ser implementado em 2027 com base em feedback real (issues GitHub pedindo). **Economia: 60-100h**.

**Contra-argumento da usuária (E.2.D)**: "manter 50 Must ambicioso". W5 não está nas 12 entradas wireframe — F-S04/F-S05 (comparação inter-UF) está marcado **Should** em E.2.A. Cortar do MVP é coerente com Should.

### 3.6 — W6 Mapa coroplético dedicado — Grade **C-**

- **Uso real**: **muito incerto**. A propõe "exploração geográfica visual". Mas: (i) Home já tem mapa interativo (W1); (ii) gestor que conhece sua UF não usa mapa — vai direto para `/uf/<sigla>/`; (iii) E.1.F adversarial recomendou cortar mapa.
- **Custo (lente A)**: 30-50h.
- **Custo honesto adversarial**: 50-90h (D3 mapa coroplético com escala 12-16h + lista textual paralela acessível 6-10h + filtros + URL state 4-6h + download PNG/SVG 2-4h + **a11y completa** com tabindex+aria-label+focus visível auditada com NVDA/JAWS/VoiceOver 20-40h + estados erro 2-4h + responsividade <768px com tabela sortable 6-10h).
- **ROI**: redundante com mapa da Home. **Pior wireframe do conjunto.**
- **Veredito**: **CORTAR**. Manter mapa apenas em W1 Home. **Economia: 50-90h**.

### 3.7 — W7 Grafo de relacionamentos — Grade **D+**

- **Uso real**: **muito baixo**. Persona técnica raramente precisa de grafo. Pesquisador acadêmico talvez. E.1.F adversarial: "valor incremental sobre lista textual de relacionamentos é incerto".
- **Custo (lente A)**: 40-60h.
- **Custo honesto adversarial**: 80-130h (Cytoscape integration+estilo 12-16h + cálculo citações reversas build-time 4-6h + lista textual paralela completa 6-10h + **a11y do canvas 30-60h** — DOM mirroring com sincronização perfeita + atalhos teclado próprios + focus management entre canvas e botões espelho + testes em 3 SR + filtros aresta+profundidade dinâmica 4-6h + estados 4-6h + geração ~439 páginas em build-time 4-8h se for por ficha).
- **ROI**: 80-130h para feature provavelmente <5% das sessões. **Custo a11y é o segundo mais alto** (depois de Tabs W3) e tem **risco CRÍTICO** declarado por B.
- **Veredito**: **CORTAR do MVP**. Substituir por **lista textual de relacionamentos na ficha (W3)** — F-S09 já é Must, e cobre 100% do conteúdo informacional. Cytoscape apenas em Bloco G se houver demanda real. **Economia: 80-130h**.

**Contra-argumento da usuária**: E.2.D Decisão 3 = "Manter mapa + grafo". Reabrir agora com base em **evidência empírica nova** desta crítica adversarial: somando custos honestos de W6 + W7 = 130-220h, equivalente a **40-60% do MVP F.1+F.2 inteiro**. Decisão "manter" foi tomada com estimativa otimista; reavaliar com estimativa honesta é legítimo.

### 3.8 — W7 (versão B) Página 404 — Grade **A**

- **Uso real**: garantido. Slugs vão mudar entre ondas; links vão quebrar.
- **Custo**: 8-15h (simples) ou 25-40h (com fuzzy match).
- **Veredito**: manter **404 simples** em F.1 (Must). Fuzzy match em F.3 ou Bloco G (Should rebaixado).

### 3.9 — W8 Sobre + Privacidade + Citação — Grade **A** (com ressalva)

- **Uso real**: alto para conformidade legal (LGPD CONS-M-05, atribuição CC-BY 4.0 CONS-M-03, citação acadêmica F-S10/NF-M-34) — Bloqueador.
- **Custo (lente A)**: 12-20h.
- **Custo honesto adversarial**: 24-40h. A propõe single-page com 10 seções. B propõe `/sobre/` agregadora + 6 sub-rotas independentes (`/transparencia`, `/privacidade`, `/termos`, `/acessibilidade`, `/cobertura`, `/status`). **B é arquiteturalmente correto** (URLs específicas para citação, melhor SEO). 6 sub-rotas × 3-5h = 18-30h.
- **Veredito**: manter. **MUST**. Mas **decompor em 6 sub-rotas**, não 10 seções single-page. Ressalva: a página `/sobre/status/` (B) com JSON dinâmico de status do build é over-engineering — cortar para o MVP, manter changelog estático.

### Tabela ROI consolidada

| W | Nome | Uso real | Custo honesto (adv) | ROI | Decisão MVP |
|---|---|---|---:|---|---|
| 1 | Home | Alto | 28-40h | Bom | Manter (sem mapa em F.1) |
| 2 | Busca facetada | Muito alto | 50-80h | Excelente | Manter (F.1) |
| 3 | Ficha individual | Muito alto | 50-80h | Excelente | Manter (F.1) |
| 4 | UF executiva | Alto | 30-45h | Médio | F.2 (substituir por busca filtrada em F.1) |
| 5 | Comparação | Baixo | 60-100h | Ruim | **CORTAR** → Bloco G |
| 6 | Mapa dedicado | Muito baixo | 50-90h | Péssimo | **CORTAR** → Bloco G ou nunca |
| 7-A | Grafo | Muito baixo | 80-130h | Péssimo | **CORTAR** → Bloco G |
| 7-B | 404 | Garantido | 8-15h (simples) | Excelente | Manter (F.1) — ausente em A |
| 8 | Sobre + sub-rotas | Alto (legal) | 24-40h | Bom | Manter (F.1) — sem `/status/` dinâmico |

**Cortes propostos: W5, W6, W7-A. Total economizado: 190-320h.**

---

## 4. Re-estimativa honesta de horas

### 4.1 Por wireframe (lente adversarial vs lente A)

| W | Nome | A estima | Adversarial | Delta |
|---|---|---:|---:|---:|
| 1 | Home | 16-24h | 28-40h | +12-16h |
| 2 | Busca facetada | 30-50h | 50-80h | +20-30h |
| 3 | Ficha individual | 24-40h | 50-80h | +26-40h |
| 4 | UF executiva | 16-24h | 30-45h | +14-21h |
| 5 | Comparação | 40-60h | 60-100h | +20-40h |
| 6 | Mapa dedicado | 30-50h | 50-90h | +20-40h |
| 7-A | Grafo | 40-60h | 80-130h | +40-70h |
| 7-B | 404 | (omitido) | 8-15h (simples) / 25-40h (fuzzy) | +8-40h |
| 8 | Sobre+sub-rotas | 12-20h | 24-40h | +12-20h |
| **Total 9 wireframes** | | **208-328h** | **380-620h** | **+172-292h** |

A subestimou em **fator 1.5-1.9×** consistentemente. Erro maior em W3 (Tabs ARIA), W7 (a11y do grafo) e nas dimensões mobile/responsivo.

### 4.2 Por marco (cenário com cortes adversariais)

#### Cenário A — MVP HONESTO (cortar W5, W6, W7-A)

| Marco | Wireframes incluídos | Adv estimate |
|---|---|---:|
| **F.1 (esqueleto operacional)** | W1 Home (sem mapa) + W2 Busca + W3 Ficha + W7-B 404 + W8 Sobre | **160-260h** |
| **F.2 (profundidade UF)** | W4 UF executiva | 30-45h |
| **F.3 (visualizações ricas)** | Mapa Home (adicionado em F.3) + lista textual relacionamentos em W3 | 20-40h |
| **Total wireframes Bloco F** | | **210-345h** |

#### Cenário B — MVP AMBICIOSO (manter os 8 + 404)

| Marco | Wireframes | Adv estimate |
|---|---|---:|
| **F.1** | W1 + W2 + W3 + W7-B 404 + W8 | 160-260h |
| **F.2** | W4 + W5 Comparação | 90-145h |
| **F.3** | W6 Mapa + W7-A Grafo | 130-220h |
| **Total wireframes Bloco F** | | **380-620h** |

#### Itens transversais ausentes (não-wireframe, mas Must)

Os 8 wireframes cobrem ~12 dos 55 Must. Os outros ~43 Must pesam:

| Categoria | Itens (~) | Estimativa adv |
|---|---:|---:|
| CI/CD reproducível + axe-core + Lighthouse-CI + JSON Schema (NF-M-29 + NF-S-22) | 5-7 | 30-50h |
| schema.org JSON-LD por ficha + sitemap + canonical + robots + OG (NF-M-22-25, F-M14) | 4-6 | 20-35h |
| Snapshots (already done; integration site → snapshot link, fallback ausência, deduplicação) | 3-4 | 15-25h |
| Citação 5 formatos + CITATION.cff + DOI Zenodo (F-S10/NF-M-34) | 1-2 | 12-20h |
| LGPD: política de privacidade + retenção + GoatCounter integration + cookies disclaimer (CONS-M-05, NF-M-13-17) | 5 | 18-30h |
| Backup off-Drive + GH Action mensal (CONS-M-01) | 1 | 6-10h |
| Plano continuidade + RUNBOOK + ADRs + readme público (CONS-M-02) | 1 | 8-15h |
| Acordo institucional FRM/IESP-UERJ (CONS-M-03) — não-código mas bloqueador | 1 | 4-8h (interno) |
| Política de correções + SLA + canal único (CONS-M-04) | 1 | 4-8h |
| Performance: bundle budget, Tailwind purge, fontes self-hosted, critical CSS (NF-M-01-05) | 5 | 20-35h |
| Segurança: HTTPS, CSP, SRI, whitelist (NF-M-18-21) | 4 | 10-20h |
| Mobile responsivo + touch targets + breakpoints (NF-M-26-28) | 3 | 15-25h |
| Pagefind tuning + indexar HTMLs satélites de PDFs | 1-2 | 12-20h |
| Tests (toy + unit + integração + axe + Lighthouse) ongoing | transversal | 25-40h |
| Documentação (RUNBOOK + ADRs + páginas Sobre internas + decisões) | transversal | 12-20h |
| Buffer/imprevistos (25%) | — | +60-90h |
| **Subtotal transversais** | | **271-451h** |

#### Total honesto Bloco F (com transversais)

| Cenário | Wireframes | Transversais | **TOTAL** |
|---|---:|---:|---:|
| MVP HONESTO (cortar 3) | 210-345h | 271-451h | **480-800h** |
| MVP AMBICIOSO (manter 8) | 380-620h | 271-451h | **650-1070h** |

Coerente com E.2.D (380-1040h) e E.2.C (342-944h). Range adversarial é **mais conservador na ponta de baixo** (480 vs 380) porque incluí inconsistências A↔B descobertas nesta rodada que não estavam visíveis em E.2.

### 4.3 Tradução em meses

A 4h/sem sustentáveis (alvo declarado em E.2.D métrica #5):

| Cenário | Total | Meses | Lançamento se começar 2026-06 |
|---|---:|---:|---|
| MVP HONESTO otimista | 480h | 30 meses | 2028-12 |
| MVP HONESTO médio | 640h | 40 meses | 2029-10 |
| MVP HONESTO pessimista | 800h | 50 meses | 2030-08 |
| MVP AMBICIOSO otimista | 650h | 41 meses | 2029-11 |
| MVP AMBICIOSO médio | 860h | 54 meses | 2030-12 |
| MVP AMBICIOSO pessimista | 1070h | 67 meses | 2032-01 |

A 4h/sem **lança no melhor cenário em fim de 2028**. Inviável.

A 10h/sem (Rogério forçando o ritmo):

| Cenário | Total | Meses |
|---|---:|---:|
| MVP HONESTO otimista | 480h | 12 meses |
| MVP HONESTO médio | 640h | 16 meses |
| MVP AMBICIOSO médio | 860h | 21 meses |

A 10h/sem **MVP HONESTO lança em 2027 médio caso**. MVP AMBICIOSO lança em **fim de 2027 / início de 2028**.

A 30h/sem (Rogério 10h + bolsista 20h):

| Cenário | Total | Meses |
|---|---:|---:|
| MVP HONESTO médio | 640h | 5 meses |
| MVP AMBICIOSO médio | 860h | 7 meses |

**Conclusão de horas**: solo 4h/sem **lança após 2028 em qualquer cenário**. A janela "lançar em 2026" exige (a) bolsista financiado **e** (b) cortar W5+W6+W7-A. Manter ambição **e** solo é matemática impossível. Coerente com veredito de E.2.C/E.2.D.

---

## 5. Cortes propostos para MVP

### 5.1 Cortar do MVP F.1+F.2+F.3 — mover para Bloco G

| Item | Razão | Economia | Substituto no MVP |
|---|---|---:|---|
| **W5 Comparação inter-UF** | Uso esporádico; substituível por 2 tabs `/uf/X/` lado a lado | 60-100h | nada (fora do MVP) |
| **W6 Mapa coroplético dedicado** | Redundante com mapa Home; pior ROI | 50-90h | mapa apenas na Home (F.3) |
| **W7-A Grafo Cytoscape** | a11y crítica; uso provável <5%; lista textual cobre conteúdo | 80-130h | seção "Relacionadas" em W3 (lista textual já é F-S09 Must) |
| **Drag-to-select retângulo no mapa W5** (já era "fase 2" em A) | Overkill OECD GPS | 8-15h | nada |
| **Aba `/sobre/status/` JSON dinâmico** | Over-engineering; changelog estático cobre | 4-8h | changelog.md estático |
| **Total economizado** | | **202-343h** | |

### 5.2 Diferir para F.3 (não F.1)

| Item | Razão | Em F.1 substituído por |
|---|---|---|
| Mapa coroplético na Home (W1) | a11y custosa; primeira impressão deve ser sólida | Lista textual UFs com contadores |
| Fuzzy match na 404 (W7-B) | Tabela de redirects + JS fuse.js custa 15-25h adicionais | 404 simples com 5 políticas mais consultadas |
| W4 UF executiva | Substituível por `/buscar/?uf=XX` no F.1; entrega F.2 | `/buscar/?uf=XX` |
| PDF download em ficha+busca+UF | Geração PDF custa 4-8h por contexto × 3 | "Imprimir esta página" CSS + tabela copy-paste para email |
| 4 formatos de citação na ficha (ABNT/APA/BibTeX/RIS) | RIS é raríssimo; CITATION.cff fica em /sobre/ | 3 formatos (ABNT+APA+BibTeX) na ficha |

**Diferimentos: -30-60h em F.1 redirecionados para F.3.**

### 5.3 Manter no MVP F.1 (intocado)

- W2 Busca facetada — **MUST absoluto**, mas com Pagefind UI custom (não default)
- W3 Ficha individual — **MUST absoluto** com Tabs ARIA W3C completo
- W7-B 404 simples (5 políticas mais consultadas + busca proeminente)
- W8 Sobre + 5 sub-rotas (transparência, privacidade, termos, acessibilidade, cobertura) — **sem `/status/`**
- W1 Home **sem mapa** — lista textual UFs com contadores

---

## 6. Marcos M1/M2/M3 realistas para mantenedor solo

A propôs marcos com timing implícito; nunca declarou meses. Vou ser explícito.

### 6.1 Premissa: 4-10h/sem sustentáveis para Rogério solo

Métrica #5 de E.2.D = ≤4h/sem. Mas durante Bloco F (construção ativa), pode ser maior — vamos modelar 8h/sem média (Rogério pressionado mas realista; muitas semanas a 4h e algumas a 16h em sprints).

A 8h/sem:

| Cenário cortes | Total | Meses |
|---|---:|---:|
| Cortes adversariais (480-800h) | 480-800h | **15-25 meses** |
| Sem cortes (650-1070h) | 650-1070h | **20-33 meses** |

### 6.2 Marcos propostos

#### Cenário A — COM CORTES adversariais (recomendado), solo 8h/sem

| Marco | Conteúdo | Tempo cumulativo | Lançamento se começar 2026-06 |
|---|---|---:|---|
| **M0 — PoC empírico** (recomendado E.3.C) | Eleventy esqueleto + 10 fichas + mapa dummy + Lighthouse | 1 mês | 2026-07 |
| **M1 — Beta privado** (F.1 completo) | W1 Home (sem mapa), W2 Busca, W3 Ficha, W7-B 404, W8 Sobre + 5 sub-rotas, CI/CD, schema.org JSON-LD por ficha, citação ABNT/APA/BibTeX, snapshots integrados, LGPD privacidade. **Sem mapa, sem grafo, sem comparação.** | +9 meses (8h × 36 sem ≈ 288h) | 2027-04 |
| **M2 — Beta semi-público** (F.2) | W4 UF executiva, mapa coroplético na Home (a11y completa com SR real), backup off-Drive, plano continuidade, acordo institucional formalizado, fuzzy match 404, Pagefind tuning final | +6 meses (192h) | 2027-10 |
| **M3 — Lançamento público** (F.3) | DOI Zenodo, divulgação, polish a11y final, otimização perf, TODAS as 439 fichas validadas, changelog público, RUNBOOK testado | +3 meses (96h) | 2028-01 |
| **TOTAL com cortes** | | **~19 meses** | **2028-01** |

#### Cenário B — SEM CORTES (E.2.D ambição), solo 8h/sem

| Marco | Conteúdo | Tempo cumulativo | Lançamento |
|---|---|---:|---|
| M1 | F.1 completo (incluindo Home com mapa) | +12 meses | 2027-06 |
| M2 | F.2 (W4 + W5 Comparação) | +9 meses | 2028-03 |
| M3 | F.3 (W6 Mapa dedicado + W7-A Grafo) | +8 meses | 2028-11 |
| **TOTAL sem cortes** | | **~29 meses** | **2028-11** |

#### Cenário C — COM CORTES + bolsista 20h/sem, total 28h/sem

| Marco | Tempo cumulativo |
|---|---:|
| M1 | +3 meses (≈ 336h) |
| M2 | +2 meses (≈ 224h) |
| M3 | +1 mês (≈ 112h) |
| **TOTAL** | **~6 meses** |

**Lançamento em 2026-12 viável** apenas com bolsista + cortes.

### 6.3 Comparação com proposta original de A

A não declara meses, mas implica F.1+F.2+F.3 = 208-328h em sequência. A 8h/sem isso é **6-10 meses**. A está **2-3× otimista** em prazo total porque:
- Subestima horas (208-328h vs 380-620h adversarial sem cortes).
- Ignora itens transversais não-wireframe (271-451h).
- Não declara explicitamente meses, mas leitura otimista ("M3 lançamento público" sem qualificar) sugere prazo de ~6-10 meses.

**A proposta de marcos de A é falsificável**: dado um mantenedor solo a 8h/sem, M3 lança no melhor cenário em **fim de 2028**, não em 2027. Para lançar em 2026: bolsista **e** cortes. Para lançar em 2027 com cortes: 14h/sem (insustentável segundo a própria métrica de E.2.D).

---

## 7. Coerência com adversariais anteriores

Esta crítica reafirma e estende as anteriores:

- **E.1.F** propôs cortar mapa, grafo e "Como adotar". Decisão E.1 manteve mapa e grafo. **Reabro o corte** com base em estimativas honestas de a11y e ROI.
- **E.2.C** estimou 380-1040h e propôs ~30-35 Must (cortes drásticos). Usuária recusou (Decisão E.2.D = 55 Must ambicioso). **Confirmo que matemática não fecha**: solo 4h/sem implica lançamento pós-2028 mesmo com cortes; ambição completa implica pós-2030.
- **E.3.C** apontou que stack é 5-15% do esforço total. **Confirmo**: diferença Eleventy↔Astro é ~40-80h num total de 480-1070h. Decisão de cortes pesa **muito mais** que decisão de stack.

A consistência entre minhas três críticas converge num ponto: **a usuária está optando por ambição declarada que matematicamente exige (a) 2027-2028 OU (b) bolsista financiado**. Ambas são decisões legítimas, mas precisam ser feitas explicitamente, não implicitamente.

---

## 8. 3 decisões críticas pré-E.5

### Decisão 1 — Cortar W5+W6+W7-A do MVP, ou aceitar lançamento pós-2028?

**Por que decidir agora**: E.5 (sistema de design + componentes) será dimensionado pelos wireframes confirmados. Se W5+W6+W7-A entram, design system precisa cobrir (a) tabela comparativa wide responsiva, (b) mapa coroplético com filtros, (c) grafo Cytoscape com toolbar — três componentes complexos de a11y que **dobram o trabalho de E.5**.

**Opções**:
- (a) **Cortar W5+W6+W7-A** → E.5 cobre 5 wireframes (Home, Busca, Ficha, 404, Sobre + UF em F.2). Lançamento M3 viável em 2027-09 a 8h/sem.
- (b) **Manter os 8 wireframes** → E.5 cobre 8. Lançamento M3 em 2028-09 a 8h/sem.
- (c) **Híbrido**: cortar W5 e W6 (mapa dedicado), manter W7-A (grafo) por exigência de "ecossistema legal" da pesquisa. Compromisso.

**Recomendação adversarial**: **(a)** com ADR explícito. Se ambição E.2.D for inegociável, então **(b) com aceitação formal de lançamento pós-2028 ou bolsista confirmado**. Não decidir é a pior opção (E.5 sem norte → retrabalho).

### Decisão 2 — Mapa na Home em F.1 ou diferir para F.3?

**Por que decidir agora**: E.5 wireframes detalhados de Home dependem disso. Se mapa fica em F.1, design system precisa cobrir SVG coroplético responsivo + lista textual paralela + a11y desde o início. Se mapa vai para F.3, Home F.1 é mais leve e rápida de implementar.

**Opções**:
- (a) **Manter mapa na Home F.1** (proposta de A) → +8-12h estimados, +risco a11y na primeira impressão.
- (b) **Diferir mapa para F.3** → Home F.1 é lista textual UFs com contadores; mapa entra junto com mapa dedicado em F.3 (se W6 for mantido) ou substitui W6 (se W6 for cortado).
- (c) **Mapa simplificado em F.1** (só visualização estática, sem hover/click) → 4-6h. Acessibilidade trivial. Funcionalidade plena em F.3.

**Recomendação adversarial**: **(c)**. Mapa **estático** em F.1 (apenas legenda visual de cobertura, sem interação) + lista textual interativa abaixo. Em F.3, upgrade para mapa interativo. Custo F.1 cai de 28-40h para 18-26h; primeira impressão sólida; a11y trivial.

### Decisão 3 — Como tratar a inconsistência entre A (lente fluxo) e B (lente estrutura+a11y) sistemicamente em E.5?

**Por que decidir agora**: E.5 (sistema de design + componentes) precisa de **fonte única de verdade**. A propôs interações; B propôs HTML+a11y. Algumas decisões divergem (§2 desta crítica). Em E.5, design system e componentes precisam ser coerentes.

**Opções**:
- (a) **B prevalece em conflitos** (a11y e estrutura HTML semântica sempre vencem) → política coerente com a "a11y é cidadã de primeira classe" (B §1.1). Implica que A precisa absorver fricções (mais horas).
- (b) **A prevalece em conflitos** (fluxo de uso da persona é fonte de verdade primária) → mas viola WCAG 2.2 AA / LBI / NF-M-09 / NF-M-10 que são Must legais.
- (c) **Caso a caso, com ADR por conflito** → flexível mas custa tempo decisorio que solo 4h/sem não tem.

**Recomendação adversarial**: **(a)** com 1 exceção declarada — quando B exigir overhead de implementação >2× sem ganho a11y proporcional, A pode prevalecer com nota explícita. Ex.: drag-to-select retângulo é cortado de A (nem aparece em B), mas isso é fluxo cortado, não conflito. Conflitos a11y reais (mapa mobile, tabs ARIA, tabela mobile, grafo mobile, Sobre estrutura): **B vence**. ADR `2026-05-01_e4-conflitos-a-vs-b.md` consolidando.

---

## 9. Resumo executivo do veredito

| Pergunta da brief | Veredito adversarial |
|---|---|
| **A subestimou horas?** | Sim, fator 1.5-1.9× consistente. Pior em W3 (Tabs ARIA: 6-10× off). 208-328h é otimista; honesto é 380-620h só wireframes. |
| **A11y do mapa+grafo é viável solo?** | **Não**. 130-220h de a11y (NF-M-09+10+W6+W7) com SR real é 16-28% do orçamento total. Solo 4h/sem inviabiliza. **Cortar grafo; mapa só na Home, simplificado em F.1.** |
| **Ordem F.1/F.2/F.3 de A faz sentido?** | Em ordem geral sim, mas com 2 ajustes: (1) Home em F.1 sem mapa (ou mapa estático); (2) `/buscar/?uf=XX` substitui W4 em F.1, W4 entrega em F.2. |
| **Interações JS críticas — solo + 4h/sem aguenta?** | Tabs ARIA W3C em W3 é viável (one-time 18-32h, depois estável). Mapa interativo D3 e grafo Cytoscape **são onde solo quebra** — manutenção contínua + bug em produção + atualização de bibliotecas. |
| **Wireframes sem evidência de uso real?** | W5 Comparação (uso esporádico), W6 Mapa dedicado (redundante), W7-A Grafo (uso <5%). Cortar todos os 3. |
| **W5 vale 60-100h?** | Não. Pior ROI da lista. Substituível por 2 tabs `/uf/X/` + copy-paste manual. Mover para Bloco G se houver demanda. |
| **W8 com 10 seções single-page é viável?** | Sim mas arquiteturalmente inferior à proposta B (sub-rotas). Cortar `/sobre/status/` JSON dinâmico. Manter 5 sub-rotas + agregadora. |
| **CSV/PDF/JSON em 3 contextos** | Excessivo. PDF custa 4-8h por contexto × 3 = 12-24h. **Cortar PDF de busca e UF; manter PDF apenas na ficha (W3)**. CSV simples em 3 contextos (4-8h total). JSON download apenas em /sobre/dados-abertos/. |
| **Marcos M1/M2/M3 realistas?** | Sim em estrutura, otimistas em prazo. M1 a 8h/sem solo: 9 meses. M2: +6 meses. M3: +3 meses. **Total ~19 meses com cortes**, ~29 meses sem cortes. Lançamento 2027-2028 solo. 2026 só com bolsista + cortes. |

### 9.1 — Corte mínimo absoluto recomendado para lançamento 2027

1. **Cortar W5 Comparação inter-UF** → -60-100h
2. **Cortar W6 Mapa coroplético dedicado** → -50-90h
3. **Cortar W7-A Grafo Cytoscape** → -80-130h
4. **Diferir W4 UF executiva para F.2** (não F.1) → realocação interna
5. **Mapa estático na Home em F.1**, interativo em F.3 → -10-15h
6. **Cortar `/sobre/status/` dinâmico** → -4-8h
7. **Cortar PDF download em busca e UF** (manter só em ficha) → -8-16h
8. **Cortar fuzzy match na 404** (manter 404 simples) → -7-15h
9. **Cortar drag-to-select retângulo** (já era "fase 2") → -8-15h
10. **Cortar 4º formato de citação RIS** na ficha (manter 3) → -2-4h

**Total cortes: 229-393h**. Resultado: MVP em **480-800h** (com itens transversais), lança em **15-25 meses solo a 8h/sem**, ou **5-7 meses com bolsista 28h/sem total**.

### 9.2 — Sem cortes (E.2.D ambição inalterada)

Aceitar formalmente lançamento em **2028-2029 solo**, ou exigir bolsista financiado em ≤60 dias (gatilho E.3.C Decisão 3).

### 9.3 — A pergunta certa para a usuária pré-E.5

**"Você prefere lançar em 2027 com 5 wireframes funcionais, ou em 2028-2029 com 8 wireframes? E se a resposta for 8, você está formalizando a aceitação de lançar 1.5-2 anos após a janela natural?"**

Sem decisão explícita pré-E.5, o sistema de design vai ser dimensionado para 8 wireframes (porque "Decisão E.2.D manter ambição"), e em E.6 a usuária descobrirá empiricamente que MVP F.1 estoura prazo. **É melhor decidir agora.**

---

## 10. Apêndice — checklist de auditoria das duas defesas

### 10.1 — Itens que A deveria ter declarado e não declarou

- [ ] Marcos M1/M2/M3 com prazos em meses (não só ordem)
- [ ] Custo de absorver inconsistência mobile do mapa (NF-M-28)
- [ ] Estimativa segregada de PDF download (não embutida em W3 sem detalhe)
- [ ] Custo da página 404 (W7-B em B; ausente em A)
- [ ] Custo de manter 4 formatos de citação (ABNT/APA/BibTeX/RIS) por ficha
- [ ] Custo de geração 439 páginas pré-renderizadas em /politica/<slug>/relacionadas/
- [ ] Estimativa de PoC empírico (E.3.C Decisão 1) antes de F.1
- [ ] Como W5+W6+W7-A se justificam quando E.1.F já recomendou cortar

### 10.2 — Itens que B deveria ter declarado e não declarou

- [ ] Estimativa de horas por wireframe (B se exime — A é mais explícito)
- [ ] Numeração inconsistente W6 (Grafo em B, Mapa em A) sem flag explícito
- [ ] Custo do DOM mirroring para Cytoscape (técnica W3C complexa)
- [ ] Custo de implementar tabs ARIA W3C completo (B classifica risco ALTO mas não estima)
- [ ] Custo de transformação tabela→cards stacked em mobile (W4) com `display: contents`
- [ ] Como integrar VLibras sem comprometer NF-M-04 (bundle budget)
- [ ] Que `<html lang="pt-BR">` global é Must (CONS-S-03 já era Should em E.2.D — promovido?)
- [ ] Estratégia para PDFs a serem indexados em Pagefind (HTMLs satélites)

### 10.3 — Itens que NENHUM dos dois mediu

- [ ] Lighthouse real para 1 wireframe protótipo
- [ ] Tempo até 1ª ação útil em dispositivo Android low-end de SEDUC
- [ ] axe-core scan em 1 ficha protótipo com schema real
- [ ] NVDA/JAWS test em mapa SVG protótipo
- [ ] Pagefind real com 148 snapshots HTML+PDF (E.3.C já apontou)
- [ ] Tempo de manutenção real após 3 meses sem tocar (métrica #5 não validável sem pós-lançamento)

**Veredito final adversarial**: as duas lentes são **complementares e necessárias**, mas insuficientes sozinhas. O caminho honesto é (a) **cortar 3 wireframes do MVP**, (b) **B prevalece em conflitos a11y**, (c) **PoC empírico antes de E.5** para reduzir incerteza. Com isso, MVP F.1 lança em 2027-Q2, M3 em 2027-Q4. Sem cortes ou bolsista, lançamento desliza para 2028-2029.

A pergunta para a usuária pré-E.5 é simples e binária: **Cortes E ambição parcial, ou prazo estendido E ambição completa.** Não há terceira opção viável solo.

— Fim do output adversarial E.4.C.