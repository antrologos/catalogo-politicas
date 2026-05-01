# E.4.B — Wireframes prioritários: estrutura semântica HTML, acessibilidade técnica e responsividade

> Output do **avaliador consensual B** do sub-bloco E.4.
> Lente: **estrutura HTML semântica + a11y técnica (WCAG 2.2 AA, eMAG 3.1, LBI 13.146/2015) + responsividade mobile-first 320px–1920px**.
> Pareado com avaliador A (fluxo de uso) e adversarial C (anti-padrões).
> Stack confirmada: Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla/Alpine + D3 + Cytoscape.

---

## 1. Resumo executivo

- **A11y é cidadã de primeira classe, não verniz final.** WCAG 2.2 AA + eMAG 3.1 + LBI são obrigações legais (NF-M-07/08) — toda decisão estrutural prioriza isso, mesmo em prejuízo de "elegância" visual. Foco amarelo `#ffdd00` (gov.uk), contraste mínimo 4.5:1 texto / 3:1 UI, cor nunca isolada.
- **HTML semântico antes de ARIA.** Padrão é `<main>`, `<nav>`, `<article>`, `<section>`, `<table>`, `<form>`, `<button>` reais. ARIA só onde a semântica nativa não cobre (live regions, comboboxes customizados, mapa/grafo). "First rule of ARIA: don't use ARIA" (W3C).
- **Mobile-first com 4 breakpoints declarados** (320 / 768 / 1024 / 1200+px) e `max-width: 1020px` de container (gov.uk pattern, evita linhas longas). Em mobile o mapa coroplético colapsa para lista textual sortable e o grafo para lista de relacionamentos — a versão acessível é a **fonte canônica** (NF-M-09, NF-M-10), e a visualização gráfica é progressivamente adicionada.
- **Toques táteis ≥ 44×44px** em TODO controle interativo (NF-M-27). Skip-link em cada página visível ao receber foco. Tab order lógico ditado pela ordem do DOM (sem `tabindex` positivo). Foco visível com 3px outline amarelo + offset 2px.
- **Live regions criteriosamente.** Apenas onde a alteração é **resultado de ação do usuário** (ex.: contador "X políticas correspondem" em `aria-live="polite"`). Nunca em loaders persistentes (causa verbosidade em screen reader).

---

## 2. Os 8 wireframes (estrutura HTML + responsivo + a11y)

> Notação dos snippets: pseudo-HTML5 omitindo classes Tailwind por brevidade. `[componente]` indica reutilização do design system (12 mínimos do E.1.B).

---

### 2.1 W1 — Home (landing + busca proeminente + mapa + contadores)

**URL canônica**: `/`

**Estrutura HTML**: `<header role="banner">` com nav principal; `<main id="conteudo-principal" tabindex="-1">` com 4 sections (hero+busca, contadores `<dl>`, mapa coroplético com toggle, destaques cards); `<footer role="contentinfo">` com nav rodapé + VLibras + licença CC-BY 4.0. Skip-links no topo (#conteudo-principal, #busca-principal). Mapa SVG: cada UF como `<path tabindex="0" role="link" aria-label="São Paulo: 53 políticas">` + `<title>` interno; lista textual `<table data-sortable>` sempre no DOM (oculta via CSS quando mapa visível, mas focável em modo lista).

**Responsivo**: mobile (320-767) single column + hambúrguer + mapa colapsa para lista; tablet (768-1023) nav horizontal + mapa 600×600 + cards 2col; desktop (1024-1199) layout completo + mapa 800×800; large (1200+) max-width 1020px.

**A11y específica**: Tab order = skip-links → logo → nav → busca → toggle → mapa paths em ordem geográfica → cards → footer. Foco amarelo `outline: 3px solid #ffdd00; outline-offset: 2px; box-shadow: inset 0 0 0 2px #0b0c0c`. Mapa SVG com fallback automático para lista via `<noscript>`. Touch ≥ 44×44 em hambúrguer/toggle/cards. Cor não-única: tags com ícone+texto+cor.

**Componentes DS**: Header, Search Input, Button, Card, Tag, Footer.

**Estados erro a11y**: snapshot N/A (Home não exibe); JS desabilitado → form busca via GET ainda funciona; mapa cai para lista textual via `<noscript>`.

**Performance**: mapa SVG inline ~25KB; D3 lazy via IntersectionObserver (NF-S-04); reservar `aspect-ratio: 1/1` para 0 CLS; busca apenas ao submit (zero JS na Home além de GoatCounter).

---

### 2.2 W2 — Busca facetada

**URL canônica**: `/buscar/?q=...&uf=sp&situacao=ativa`

**Estrutura HTML**: breadcrumb `<ol class="breadcrumb">`; `<aside aria-labelledby="filtros-titulo">` com `<form>` GET → 4 `<fieldset>` (UF, Situação, Tipo, Abrangência) cada um com `<legend>` + checkboxes `<input type="checkbox" id="..." aria-describedby="...-count">` + contador. Section resultados `<aria-live="polite" aria-busy="false">` com h2 contador + chips de filtros ativos (botões "Remover filtro: SP") + select de ordenação + `<ul role="list">` de cards + paginação `<nav aria-label="Paginação"><ol class="pagination">` com `aria-current="page"`/`rel="prev"`/`rel="next"`.

**Responsivo**: mobile (320-767) filtros em `<details><summary>` colapsável + paginação simplificada; tablet (768-1023) sidebar 30% sticky; desktop (1024-1199) 25/75; large 1200+ container 1020px.

**A11y específica**: live region `aria-live="polite"` em `#resultados-titulo` anuncia "42 políticas correspondem"; `aria-busy` durante carregamento Pagefind; foco volta a `#resultados-titulo` após filtragem; chips removíveis com `aria-label="Remover filtro: São Paulo"` (não só "X"); `<fieldset>+<legend>` indispensáveis para SR; touch checkboxes envelopados em `<li>` com `min-height: 44px` + 8px gap.

**Componentes DS**: + Filter/Facet, Pagination, Badge.

**Estados erro a11y**: sem resultados → `role="status"` polite "Nenhuma política para 'X'. Limpar filtros ou tentar busca livre"; erro Pagefind índice corrompido → `role="alert"` assertivo; JS off → form GET com Eleventy renderizando combinações comuns + `<noscript>` lista paginada estática.

**Performance**: Pagefind UI lazy ao primeiro keystroke ou submit; URL state via `history.pushState` permitindo "Copiar link"; `content-visibility: auto + contain-intrinsic-size: 200px` para virtualização leve sem JS.

---

### 2.3 W3 — Ficha individual

**URL canônica**: `/politica/{uf}/{slug}/`

**Estrutura HTML**: breadcrumb 3 níveis; `<article aria-labelledby="ficha-titulo">` com `<header>` (h1 + tags + `<dl class="meta-ficha">`); **Tabs ARIA W3C-compliant**: `<div role="tablist">` com 5 `<button role="tab" aria-controls="..." aria-selected="..." tabindex="0|-1">` (Resumo/Detalhes/Base legal/Relacionadas/Como citar); 5 `<section role="tabpanel" tabindex="0">` com h2 visualmente oculto (h2.visually-hidden) + conteúdo. Tab "Base legal" tem `<table>` com `<caption>` + `<th scope="col">` + `<th scope="row">`. Tab "Como citar" usa [Citation Box] com 3 `<pre><code>` (ABNT/APA/BibTeX) + botões "Copiar" + `role="status" aria-live="polite"` para feedback. `<aside aria-labelledby>` com recursos relacionados.

**Responsivo**: mobile (320-767) tabs colapsam para `<details>/<summary>` (aceito W3C); aside abaixo do article; tabela base legal vira **stacked cards** com `<th data-label>`. Tablet (768+) tabs em linha + tabela com scroll horizontal. Desktop 2-col article 70%/aside sticky 30%. Large 1200+ max-width 1020px + article max-width 75ch.

**A11y específica**: Tabs implementação W3C ARIA Authoring Practices: setas ←→ navegam, Home/End primeiro/último, Enter/Space ativa, foco vai para `<section role="tabpanel">` ativo; live region `#copy-feedback` polite anuncia "Citação ABNT copiada" e limpa após 3s; tabela com `caption` descritivo + scope row/col; links externos `rel="external"` + `aria-label="(abre em nova aba)"`; touch tabs ≥ 44×44 com gap 8px.

**Componentes DS**: + Tabs, Table, Citation Box, Badge.

**Estados erro a11y**: snapshot faltando (197 das 439) → `role="status"` informativo, não vermelho; URL externa quebrada mas snapshot ok → tag aviso "URL original indisponível em DD/MM/AAAA"; JS off → tabs colapsam para `<details>` via CSS-only fallback; botão copiar substituído por link `?cite=abnt` para ver citação manualmente.

**Performance**: HTML estático 0 KB JS para conteúdo; tabs ~1 KB JS vanilla; copiar usa `navigator.clipboard.writeText()` + fallback `execCommand`; JSON-LD inline ~1 KB para SEO.

---

### 2.4 W4 — Listagem por UF

**URL canônica**: `/uf/{slug}/` (ex.: `/uf/sp/`)

**Estrutura HTML**: breadcrumb; `<header>` com h1 + lead + `<dl class="resumo-uf">` (Total/Ativas/Encerradas/Última revisão). Section filtros: `<form action="/uf/sp/" method="get">` com `<fieldset>+<legend>Origem</legend>` (radio Todas/Estaduais/Federais com execução em SP) + fieldset Tipo + Aplicar. Section listagem `<aria-live="polite">` com h2 contador + `<table>` com `<caption>` + `<thead>` (`<th scope="col" aria-sort="..."><button type="button" aria-pressed>Nome</button></th>` × 6) + `<tbody>` com `<tr><th scope="row"><a>...</a></th><td>...</td>...</tr>` × 53. `<aside>` com link "Comparar com outras UFs".

**Responsivo**: mobile (320-767) tabela vira **stacked cards** (cada `<tr>` → `<article>` com `<dl>`) preservando `<th scope="row">` como `<h3>` e `<td data-label>` exibido visualmente; filtros em `<details>`. Tablet (768-1023) tabela com scroll horizontal + caption sticky + sidebar 30%. Desktop (1024+) sticky `<thead>`. Large max 1020px.

**A11y específica**: `<caption>` obrigatório com ordenação atual; `<th scope="col">` cabeçalhos coluna + `<th scope="row">` primeira coluna (nome); `aria-sort="ascending|descending|none"` no `<th>` ativo + `<button aria-pressed>`; live region anuncia "Tabela ordenada por Nome ascendente, 53 linhas"; sem `tabindex` positivo.

**Componentes DS**: Filter, Button, Table, Tag.

**Estados erro a11y**: filtro sem resultados → `<tr><td colspan="6"><p role="status">Nenhuma política estadual em SP para estes filtros</p></td></tr>`; JS off → ordenação cai para alfabética padrão, filtros via form GET ainda funcionam; UF inexistente → 404.

**Performance**: 53 linhas leve sem virtualização; sticky thead via CSS `position: sticky`; ordenação JS ~2 KB lendo `data-sort-value`.

---

### 2.5 W5 — Comparação inter-UFs

**URL canônica**: `/comparar/?ufs=sp,rj,mg`

**Estrutura HTML**: breadcrumb; h1 + `<form>` com `<fieldset>+<legend>` checkboxes UF (mín 2, máx 5, hint via `aria-describedby`) + botão Comparar. Section resultado `aria-live="polite"`: h2 + `<div role="region" aria-label="Tabela de comparação" tabindex="0">` envolvendo `<table>` com `<caption>` + `<th scope="col">` UFs + `<th scope="row">` indicadores + `<td class="num">` valores. Section gráfica opcional: toggle Barras/Tabela + `<figure role="img" aria-describedby="grafico-desc"><svg aria-hidden="true">D3</svg><figcaption>...</figcaption></figure>`. Section políticas comuns + botão "Copiar link" com feedback `aria-live`.

**Responsivo**: mobile (320-767) tabela com scroll horizontal preservando scope (não converter — comparação só faz sentido em tabela); wrapper `tabindex="0"` permite scroll teclado; toggle "Tabela apenas" default em <480px (NF-M-28); gráfico viewBox 400×300. Tablet+ tabela full-width.

**A11y específica**: wrapper `role="region" aria-label="Tabela de comparação" tabindex="0"` para scroll teclado (W3C-recomendado para tabelas overflow); números à direita `text-align: right; font-variant-numeric: tabular-nums` (gov.uk pattern); validação <2 ou >5 UFs → `role="alert" aria-live="assertive"`; foco vai para `#resultado-titulo` ao submit; gráfico de barras com **textura + rótulo numérico + cor** (NF-M-11).

**Componentes DS**: Filter, Button, Table; padrão `<figure><svg><figcaption>` para gráfico.

**Estados erro a11y**: seleção inválida → `role="alert"`; dado ausente em célula → `<td>—</td>` com `aria-label="dado não disponível"` + nota em caption; JS off → gráfico não renderiza, tabela é fonte canônica + `<noscript>` esconde toggle.

**Performance**: dados pré-indexados em build (`_data/comparacoes.js`) para até 3 UFs (NF-S-28: ≤500ms); D3 lazy IntersectionObserver; `tabular-nums` evita reflow.

---

### 2.6 W6 — Grafo de relacionamentos

**URL canônica**: `/grafo/` ou `/politica/{uf}/{slug}/grafo/`

**Estrutura HTML**: breadcrumb; h1 + lead **"A lista textual abaixo é a fonte canônica"**; toggle modo Grafo visual / Lista textual. **Section LISTA TEXTUAL (canônica)** sempre presente: 4 `<h3>` (Depende / Coopera / Deriva / Similares em outras UFs) cada um com `<ul role="list">` de relacionamentos. **Section GRAFO VISUAL** opt-in: toolbar `role="toolbar"` (zoom +/−, centralizar, ajuda), `<figure role="img" aria-describedby><div id="cy-grafo" tabindex="0" role="application" aria-label="Use Tab/Enter/Esc/setas">Cytoscape</div><figcaption></figure>` + **DOM mirroring**: `<ul class="nos-focaveis"><li><button data-no-id aria-pressed>Programa Vira Vida</button></li>...</ul>` para acessibilidade + `aria-live="polite"` em `#grafo-status`.

**Responsivo**: mobile (320-767) toggle some + lista textual obrigatória + Cytoscape NÃO carrega por padrão; tablet (768-1023) toggle visível, lista default, grafo opt-in 100% largura altura 400px; desktop (1024+) split-view 40/60 lista/grafo; large 1200+ max 1020px + grafo 600px altura.

**A11y específica**: lista textual canônica navegável por SR via atalhos H (cabeçalhos); grafo `role="application"` aceita atalhos próprios; nós espelhados (técnica W3C "DOM mirroring") com `<button>` correspondente para cada nó Cytoscape; **atalhos**: Tab próximo nó, Shift+Tab anterior, Enter abre ficha, Esc sai do modo grafo, ←→↑↓ entre vizinhos diretos, +/− zoom; live region `#grafo-status` anuncia "Foco em PRONATEC. 8 vizinhos. Tipo: dependência"; toolbar com setas ←→ entre botões (W3C); foco visível em nó: amarelo no botão espelho + borda 3px laranja `#ff9800` no canvas; cor não-única: linhas sólida/tracejada/pontilhada por tipo.

**Componentes DS**: Button (toolbar/toggle); padrão DOM mirroring é novo.

**Estados erro a11y**: sem relacionamentos → `role="status"` neutro; falha Cytoscape → `role="alert"` "Não foi possível carregar grafo. Use a lista textual"; JS off → toggle escondido CSS-only, lista sempre visível.

**Performance**: Cytoscape **opt-in** (não carrega até clicar) — economiza ~150KB JS; canvas com width/height declarados → 0 CLS; dados grafo (nós+arestas) JSON inline ~2KB por ficha.

---

### 2.7 W7 — Página 404

**URL canônica**: qualquer URL inexistente; **HTTP 404 real** (NF-S-16).

**Estrutura HTML**: `<main id="conteudo-principal" tabindex="-1">` com `<h1>Página não encontrada (erro 404)</h1>` + lead com URL solicitada (escapada); section sugestões `<ul>`; section busca `<form action="/buscar/" role="search">`; section URLs parecidas com `<ul id="lista-fuzzy" data-fuzzy-match>` + `aria-live="polite" id="fuzzy-status"`; section "Mais consultadas"; section "Reportar erro" com link issue GitHub.

**Responsivo**: mobile single column busca proeminente; tablet+ max-width 600-720px centralizado; desktop+ pode ter busca + fuzzy 2-col se útil; large max 1020px com conteúdo 720px (gov.uk).

**A11y específica**: HTTP 404 real (não 200 com "404"); foco automático no `<main>` ao carregar via JS `document.querySelector('main').focus()`; mensagem em PT-BR plain language; tab order header → main h1 → busca → fuzzy → consultadas → footer; live region `#fuzzy-status` anuncia "3 sugestões: PRONATEC Federal, Pronatec MG..."; tom calmo neutro (sem cor vermelha alarmista).

**Componentes DS**: Header, Search Input, Button, Footer.

**Estados erro a11y**: fuzzy falha → `<li>Nenhuma URL parecida</li>`; JS off → fuzzy vazio mas busca/links funcionam.

**Performance**: HTML ~6KB; fuzzy lê lista slugs ~15KB JSON lazy; sem analytics no 404.

---

### 2.8 W8 — Sobre + sub-páginas

**URL canônica**: `/sobre/` (com sub-rotas `/sobre/{transparencia,privacidade,termos,acessibilidade,cobertura,status}/`).

**Estrutura HTML (`/sobre/`)**: breadcrumb; h1 + lead; `<nav aria-labelledby>` com `<ul role="list" class="cards-grid">` de 6 cards (transparência LAI / privacidade LGPD / termos CC-BY / acessibilidade WCAG-eMAG / cobertura / status), cada card `<article><h3><a></a></h3><p></p></article>`; section metodologia; section equipe (lista revisores); section "Como citar o catálogo" com [Citation Box] (5 formatos: ABNT/APA/BibTeX/RIS/DOI).

**Responsivo**: mobile single column cards full-width; tablet 2col; desktop 3col + main max 720px texto + grid 1020px; large 1020px com texto 720px centralizado.

**A11y específica**: estrutura h1→h2→h3 rígida; `/sobre/acessibilidade/` declara formalmente conformidade WCAG 2.2 AA + eMAG 3.1, data última auditoria, tecnologias compatíveis (NVDA/Firefox, JAWS/Edge, VoiceOver/Safari), canal relato barreira (issue GitHub + email FRM/IESP), SLA 90 dias (CONS-M-04); cards inteiros clicáveis com `min-height: 120px` em mobile.

**Componentes DS**: Card, Citation Box, Button, Header, Footer.

**Estados erro a11y**: `/sobre/status/` JSON ausente → `role="alert"` "Status não disponível neste build. Última conhecida: DD/MM/AAAA"; JS off → tudo funciona; botão Copiar cai para `<a href="/sobre/citacao.txt">Baixar como TXT</a>`.

**Performance**: ~10KB HTML; sub-páginas regeneradas a cada build; cache HTTP `max-age=3600`.

---

## 3. Tabela consolidada — wireframes × estrutura × responsivo

| Wireframe | Landmarks | Form fields | Tabela `<caption>+scope` | ARIA live | Breakpoints críticos | Componentes DS |
|---|---|---|---|---|---|---|
| **W1 Home** | banner, nav, main, contentinfo | search input | — | mapa→lista toggle | mobile colapsa mapa→lista | Header, Search, Button, Card, Tag, Footer |
| **W2 Busca** | banner, nav, main (aside+section), contentinfo | fieldset×4, checkbox×N, select, search | — | `#resultados-titulo` polite | mobile: filtros em `<details>` | + Filter, Pagination, Badge |
| **W3 Ficha** | banner, nav (breadcrumb), main (article+aside), contentinfo | botão copiar | sim — base legal | `#copy-feedback` polite | mobile: tabs→`<details>`, tabela→cards | + Tabs, Table, Citation Box, Badge |
| **W4 UF** | banner, nav, main (filtros+section+aside), contentinfo | fieldset×2, radio×3, checkbox×N | sim — política list | `#lista-uf-titulo` polite | mobile: tabela→cards stacked | Filter, Button, Table, Tag |
| **W5 Comparar** | banner, nav, main (form+section), contentinfo | fieldset, checkbox×N | sim — comparação | `#resultado-titulo` + `#copiar-feedback` polite | mobile: tabela scroll horizontal `tabindex=0` | Filter, Button, Table |
| **W6 Grafo** | banner, nav, main (lista+grafo sections), contentinfo | toggle modo | — | `#grafo-status` polite | mobile: lista textual obrigatória | Button (toolbar) |
| **W7 404** | banner, main (sections múltiplas), contentinfo | search input | — | `#fuzzy-status` polite | sempre 1 col | Header, Search, Button, Footer |
| **W8 Sobre** | banner, nav, main (sections+nav cards), contentinfo | botão copiar (citação) | — | `#copy-feedback` polite | mobile: 1col; desktop: 3col cards | Card, Citation Box, Button |

### Cobertura dos 12 componentes mínimos do design system

| # | Componente | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | Button | x | x | x | x | x | x | x | x |
| 2 | Search Input | x | x | | | | | x | |
| 3 | Filter/Facet | | x | | x | x | | | |
| 4 | Tag | x | x | x | x | | | | |
| 5 | Card | x | x | | | | | | x |
| 6 | Table | | | x | x | x | | | |
| 7 | Badge | | x | x | | | | | |
| 8 | Citation Box | | | x | | | | | x |
| 9 | Tabs | | | x | | | | | |
| 10 | Pagination | | x | | | | | | |
| 11 | Footer | x | x | x | x | x | x | x | x |
| 12 | Header/Nav | x | x | x | x | x | x | x | x |

Todos os 12 componentes mínimos exercitados. Mais reutilizados: Header+Footer+Button (8/8). Mais nichado: Citation Box (W3+W8).

---

## 4. Auditoria de risco a11y por wireframe

| Wireframe | Risco a11y | Justificativa | Mitigação |
|---|:-:|---|---|
| **W1 Home** | **MÉDIO** | Mapa SVG interativo; cada `<path>` precisa focável + ARIA + título; D3 lazy não pode degradar fonte canônica | Lista textual sempre no DOM; toggle só controla visibilidade; UF com `tabindex=0`+`role=link`+`aria-label`; auditar NVDA+Firefox em PR |
| **W2 Busca** | **MÉDIO** | `<fieldset>+<legend>` correto; live region em contador é frágil (timing); filtros sem reload podem perder foco | Foco automático em `#resultados-titulo` após filtragem; `aria-busy` true/false; testar JAWS+Edge (live regions ignoradas em tabs ocultas) |
| **W3 Ficha** | **ALTO** | Tabs ARIA é o componente customizado mais complexo; precisa W3C Authoring Practices integral (setas, Home/End, foco); tabela scroll mobile + citação inline | Biblioteca testada OU implementação manual com axe; nunca `tabindex` positivo; auditar NVDA+JAWS+VoiceOver iOS; botão copiar fallback `<noscript>` |
| **W4 UF** | **MÉDIO** | Tabela 53 linhas vira cards em mobile (transformação visual sem perder semântica); ordenação client-side com `aria-sort` | Renderizar `<table>` + `<ul class="cards">` controlados por CSS display, OU `display: contents`+`<th data-label>`; live region anuncia ordenação; testar TalkBack Android |
| **W5 Comparar** | **MÉDIO** | Tabela scroll horizontal precisa `tabindex=0` no wrapper; gráfico SVG opcional, dados na tabela | Wrapper `role=region`+`aria-label`; gráfico `aria-describedby` com descrição completa; testar NVDA (tabelas wide difíceis) |
| **W6 Grafo** | **CRÍTICO** | Cytoscape canvas inacessível por padrão; mirroring DOM exige sincronização perfeita; mobile não deve carregar Cytoscape; atalhos podem conflitar com SR | **Lista textual canônica** (NF-M-10); grafo opt-in; mobile desabilitado; auditar 3 SRs + leitor de teclado puro; estimar 30-50h só de a11y do grafo |
| **W7 404** | **BAIXO** | Página simples; estrutura clara; foco automático em `<main>` | HTTP 404 real (não 200); foco em main ao carregar; testar `curl -I` em build |
| **W8 Sobre** | **BAIXO** | Conteúdo estático; `<h1>→<h2>→<h3>` clara; cards são `<a>` envolvendo `<h3>+<p>` | Validar axe+lighthouse em CI; auditar `/sobre/acessibilidade/` manualmente (declara conformidade) |

### Resumo de risco

- **Crítico**: 1 (W6 Grafo)
- **Alto**: 1 (W3 Ficha — Tabs ARIA)
- **Médio**: 4 (W1, W2, W4, W5)
- **Baixo**: 2 (W7, W8)

### Recomendações de auditoria

1. **CI bloqueante** (NF-M-29 + NF-S-22): axe-core + Lighthouse + JSON Schema em cada PR; bloqueia em violação serious/critical.
2. **Auditoria manual com SR** (semestral) em W3, W6, W4 — os mais arriscados.
3. **Auditoria de teclado** (sem mouse) em W6 antes do lançamento — invariável.
4. **Auditoria modo daltonismo** (Chrome DevTools + NoCoffee) — validar NF-M-11.
5. **Auditoria zoom 200% e 400%** (WCAG 2.2 SC 1.4.10 Reflow) — validar NF-M-26.
6. **Testes com usuários reais com deficiência** (Bloco F final, antes do lançamento) — única validação ecológica.

---

## 5. Notas finais

- **A11y do mapa (W1) e do grafo (W6) é o calcanhar de Aquiles arquitetônico** — alertas E.2.C confirmados. NF-M-09 e NF-M-10 transferem o risco para Bloco F. Esta lente reforça: **lista textual é fonte canônica em ambos**; visualização é progressivamente adicionada.
- **Tabs ARIA (W3) é o segundo ponto crítico** — implementação errada quebra a ficha (página mais visitada). Considerar `<details>/<summary>` em mobile como degradação aceita.
- **Form fields consistentemente `<fieldset>+<legend>+<input>+<label>`** em W2, W4, W5. Sem placeholder como label (anti-padrão gov.uk #1).
- **Nenhum `tabindex` positivo** em todo o site. Order = DOM order. Skip-links resolvem casos pontuais.
- **Live regions com parcimônia** — contador W2, copy W3+W8, grafo W6, fuzzy W7, ordenação W4, comparar W5. Todas `polite`. `assertive` apenas em `role="alert"` para erros bloqueantes.
- **Touch ≥ 44×44 universal** — `min-height: 44px + padding-block: 12px`.
- **Foco amarelo `#ffdd00`** + `outline 3px solid + outline-offset 2px + box-shadow inset preto` — combinação gov.uk testada para contraste em qualquer fundo.
- **Cor primária `#0066cc`** (azul-ciência, contraste 8.6:1, AAA) — preferida sobre `#1351b4` gov.br por reconhecibilidade em data viz.
- **`<html lang="pt-BR">` global + `<span lang="en">` em termos estrangeiros** (CONS-S-03 Should). SR pronuncia corretamente.
- **VLibras widget** integrado em `<footer>` (NF-S-06) — script gov.br oficial, não bloqueia.

Pareamento esperado com avaliador A: ele cobre fluxo de uso (cliques, jornada, ordem semântica), eu cubro estrutura HTML (landmarks, form, tabela, ARIA). Adversarial C deve atacar mapa/grafo (já alertado), Tabs ARIA W3, e tabelas wide em mobile W4+W5.