# E.5 — Sistema de Design Enxuto (MVP)

> Sub-bloco E.5 do Bloco E. Contrato de design para Bloco F. Stack-locked: Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla/Alpine + D3 + Cytoscape.
>
> **Política decidida em Checkpoint E.4**: lente B (a11y/estrutura HTML) prevalece em todos conflitos com lente A (fluxo). Tabs W3C-compliant em W3, mapa→lista textual em mobile, 404 com fuzzy match Must, lista textual paralela canônica em mapa+grafo.
>
> **Status PoC (2026-05-01)**: tokens base já implementados em `site/tailwind.config.js` + `site/src/assets/css/tailwind.css`. Header/footer/tag-status já como `_includes`. Layout `ficha.njk` parcial. Este documento consolida o que existe e declara gaps para Bloco F.

---

## Seção 1 — Tokens (base do sistema)

### 1.1 Cores (paleta semântica)

Toda a paleta abaixo já está em `tailwind.config.js`. Contraste calculado contra `#ffffff` (texto/UI sobre branco) ou contra `#0b0c0c` quando o token é fundo claro com texto escuro.

| Token Tailwind | Hex | Papel | Contraste sobre branco | Conformidade WCAG 2.2 |
|---|---|---|---:|---|
| `primary.DEFAULT` | `#0066cc` | Links, botão primário, focus path SVG | 4.6:1 | AA texto pequeno; AAA UI |
| `primary.dark` | `#004c99` | Hover/active links | 8.2:1 | AAA texto |
| `primary.light` | `#3385d6` | Decorativo (banners) | 3.4:1 | AA UI apenas (não texto) |
| `success.DEFAULT` | `#00b050` | Tag "Ativa", ícones de OK | 2.9:1 sobre branco; usar `success.dark` para texto | AA UI; texto exige `success.dark` |
| `success.dark` | `#008a3e` | Texto em chips de "Ativa" | 4.6:1 | AA texto |
| `danger.DEFAULT` | `#c00000` | Tag "Encerrada/Revogada", erros | 5.9:1 | AA texto; AAA UI |
| `danger.dark` | `#990000` | Hover botões danger | 8.4:1 | AAA |
| `warning.DEFAULT` | `#ff9800` | Tag "Suspensa/piloto" | 2.4:1 sobre branco; usar `warning.dark` p/ texto | AA UI; texto exige `warning.dark` |
| `warning.dark` | `#cc7a00` | Texto em chips "Suspensa" | 4.5:1 | AA texto |
| `info.DEFAULT` | `#0a7a7a` | Tag "Em planejamento", badges informativos | 5.2:1 | AA texto |
| `info.dark` | `#085f5f` | Hover info | 7.2:1 | AAA |
| `neutral.900` | `#0b0c0c` | Texto principal | 19:1 | AAA |
| `neutral.700` | `#475569` | Texto secundário, labels | 7.6:1 | AAA |
| `neutral.500` | `#757575` | Borders, divisores | 4.5:1 | AA UI |
| `neutral.200` | `#e2e8f0` | Borders sutis, separadores de tabela | — | decorativo |
| `neutral.100` | `#f5f5f5` | Background de cards, citation box | — | decorativo |
| `focus` | `#ffdd00` | Focus ring (gov.uk) | sobre `#0b0c0c` 16.4:1 | AAA |

**Regra de uso de status (cor + ícone + texto, NUNCA cor isolada):**

| Status | Token chip (bg) | Token texto | Ícone (Unicode) |
|---|---|---|---|
| Ativa / em execução | `bg-success/15` | `text-success-dark` | ● |
| Encerrada / revogada | `bg-danger/15` | `text-danger-dark` | ■ |
| Suspensa / pausada | `bg-warning/15` | `text-warning-dark` | ▲ |
| Em planejamento | `bg-info/15` | `text-info-dark` | ◆ |
| Descontinuada | `bg-neutral-200` | `text-neutral-700` | ○ |

Implementado em `_includes/components/tag-status.njk`.

### 1.2 Tipografia

Stack: `Open Sans, Inter, system-ui, sans-serif`. Open Sans = padrão (Apache, self-hosted via `/assets/fonts/`); Inter como fallback se Google Fonts CDN cair; `system-ui` antes do FOUT.

| Token | Tamanho | Line-height | Weight | Uso |
|---|---|---|---|---|
| `h1` (`.text-3xl`) | 30px / 1.875rem | 1.2 (36px) | 700 bold | Título de página, 1 por página |
| `h2` (`.text-2xl`) | 24px / 1.5rem | 1.3 (32px) | 600 semibold | Seções principais |
| `h3` (`.text-xl`) | 20px / 1.25rem | 1.4 (28px) | 600 | Sub-seções |
| `h4` (`.text-lg`) | 18px / 1.125rem | 1.4 (25px) | 600 | Cards, blocos |
| `h5` (`.text-base font-semibold`) | 16px / 1rem | 1.5 (24px) | 600 | Sub-blocos raros |
| `h6` (`.text-sm font-semibold uppercase tracking-wide`) | 14px / 0.875rem | 1.5 (21px) | 600 | Labels de grupo |
| `body` (default) | 16px / 1rem | 1.6 (25.6px) | 400 | Texto base |
| `lead` (`.text-lg leading-relaxed`) | 18px / 1.125rem | 1.6 (29px) | 400 | Parágrafo de abertura |
| `small` (`.text-sm`) | 14px / 0.875rem | 1.5 (21px) | 400 | Metadados, captions |
| `xs` (`.text-xs`) | 12px / 0.75rem | 1.4 (17px) | 400 | Badges, microcópia |
| `code` (mono) | 14px / 0.875rem | 1.5 | 400 | Citações, IDs, slugs |

Mono fallback: `ui-monospace, SFMono-Regular, Consolas, monospace`. Usado em IDs (`code` inline) e citações (`<pre><code>`).

Largura máxima de linha de texto corrido: `max-w-[75ch]` (~720px) dentro de `container-prose` (1020px) — gov.uk pattern para legibilidade.

### 1.3 Spacing (8 tokens)

Já em `tailwind.config.js`. Uso direto via classes (`p-md`, `mt-lg`, `gap-xs` etc).

| Token | Valor | Pixels | Uso típico |
|---|---|---|---|
| `2xs` | 0.25rem | 4px | gap entre ícone e label |
| `xs` | 0.5rem | 8px | padding interno de tags |
| `sm` | 0.75rem | 12px | padding de botões pequenos |
| `md` | 1rem | 16px | padding base, gap entre itens |
| `lg` | 1.5rem | 24px | margin entre seções |
| `xl` | 2rem | 32px | padding de containers, margin-top de h2 |
| `2xl` | 3rem | 48px | espaçamento entre blocos maiores |
| `3xl` | 4rem | 64px | margin de footer, hero spacing |

### 1.4 Breakpoints

Mobile-first; defaults Tailwind cobrem o suficiente.

| Token | Largura | Persona/dispositivo alvo |
|---|---:|---|
| (default) | < 640px | Mobile (Android low-end SEDUC) |
| `sm:` | ≥ 640px | Mobile grande / tablet pequeno |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop padrão SEDUC |
| `xl:` | ≥ 1200px | Desktop grande / large |

**Breakpoints críticos para layout** (declarados explicitamente em wireframes E.4.B): 320 (mínimo absoluto), 768 (tablet), 1024 (desktop), 1200 (large com container max). Nenhum extra necessário.

### 1.5 Container

`max-w-container` = `1020px` (gov.uk default, evita linhas longas). Aplicado via classe `container-prose` em `tailwind.css`:

```css
.container-prose { @apply max-w-container mx-auto px-md; }
```

Texto corrido dentro do container limitado a `max-w-[75ch]` (~720px) — declarado por wireframe quando aplicável (W8 Sobre, W3 Ficha corpo).

### 1.6 Border-radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-none` | 0 | Tabelas, breadcrumbs |
| `rounded` (`sm`) | 0.25rem (4px) | Tags, chips, badges, botões padrão |
| `rounded-md` | 0.375rem (6px) | Cards |
| `rounded-lg` | 0.5rem (8px) | Citation box, callouts |
| `rounded-full` | 9999px | Avatares, dots de status (opcional) |

### 1.7 Shadow

Uso parcimonioso (gov.uk-style flat predomina). Padrão = sem shadow; usar apenas onde elevação semântica importa.

| Token | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards em hover |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Header sticky (já em uso) |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, dropdowns (autocomplete) |

### 1.8 Focus ring

**Padrão único, gov.uk-inspired**, já implementado em `tailwind.css`:

```css
:focus-visible {
  outline: 3px solid theme('colors.focus'); /* #ffdd00 */
  outline-offset: 2px;
  box-shadow: 0 0 0 6px theme('colors.focus / 30%');
}
```

Wireframes E.4.B pedem também `box-shadow: inset 0 0 0 2px #0b0c0c` para reforço de contraste em fundos claros. **Adicionar em Bloco F**:

```css
:focus-visible {
  outline: 3px solid theme('colors.focus');
  outline-offset: 2px;
  box-shadow:
    0 0 0 6px theme('colors.focus / 30%'),
    inset 0 0 0 2px theme('colors.neutral.900');
}
```

Nunca remover outline sem substituto. Nunca usar `outline: none`.

### 1.9 Transitions

Animação minimalista (gov.uk evita). Usar apenas em `hover`/`focus` de botões e links. Respeitar `prefers-reduced-motion`.

| Token | Valor | Uso |
|---|---|---|
| `duration-150` | 150ms | Hover de links, botões, tags |
| `duration-200` | 200ms | Open/close de `<details>` (CSS) |
| `ease-in-out` | padrão | Default Tailwind |

Wrap obrigatório:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Seção 2 — 12 componentes mínimos

Cada componente declara: propósito · variantes · estados · anatomia HTML · tokens · a11y · cobertura wireframes · snippet.

### 2.1 Button

**Propósito**: ação primária ou secundária (submeter form, copiar, baixar, navegar).

**Variantes**: `primary` (única CTA por seção) · `secondary` (ações alternativas) · `danger` (ações destrutivas, raro) · `link` (visualmente igual a link, semanticamente botão).

**Estados**: default · hover · focus (ring amarelo) · active (escurecimento +10%) · disabled (opacity 50, `aria-disabled="true"`, cursor `not-allowed`) · loading (`aria-busy="true"`, spinner ou texto "Carregando...").

**Anatomia**: sempre `<button type="button|submit">`. Nunca `<a>` para ação. Nunca `<div>` clicável.

**Tokens**: `bg-primary text-white hover:bg-primary-dark` (primary) · `border border-primary text-primary hover:bg-primary/10` (secondary) · `min-height: 44px` + `padding: sm md` para touch.

**A11y**:
- `<button>` nativo (aceita Enter/Space, foco automático).
- Texto visível como label; se só ícone, `aria-label` explícito.
- Touch ≥ 44×44px (NF-M-27). Adicionar `min-h-[44px] px-md py-sm`.
- `aria-pressed` para toggle.
- `aria-busy="true"` quando loading.

**Onde usado**: W1 (busca, CTAs), W2 (limpar filtros, copiar link, baixar), W3 (copiar citação, baixar snapshot, abas), W4 (filtrar, baixar CSV), W5 (comparar, copiar link), W6 (toggle modo, toolbar), W7 (busca), W8 (copiar citação).

**Snippet**:

```html
<button type="button"
        class="inline-flex items-center justify-center gap-xs
               min-h-[44px] px-md py-sm rounded
               bg-primary text-white font-semibold
               hover:bg-primary-dark
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors duration-150">
  Baixar CSV
</button>

<button type="button"
        class="inline-flex items-center justify-center gap-xs
               min-h-[44px] px-md py-sm rounded
               border border-primary text-primary bg-white
               hover:bg-primary/10
               transition-colors duration-150">
  Copiar link
</button>
```

### 2.2 Search Input

**Propósito**: busca textual full-text (Pagefind no W2, fuzzy slug no W7, busca local no W4).

**Variantes**: `header` (compacto, dentro do header) · `hero` (grande, página de busca/Home) · `inline` (busca dentro de UF/seção).

**Estados**: default · focused (ring amarelo) · com texto (mostrar botão "x" para limpar) · sem resultado (renderizado por componente externo).

**Anatomia**: `<form role="search" action="/buscar/" method="get">` + `<label class="sr-only">` + `<input type="search" name="q">` + `<button type="submit">`. **Nunca placeholder como label** (anti-padrão gov.uk #1).

**Tokens**: `border border-neutral-500 px-md py-sm rounded` · `focus:border-primary` · `min-h-[44px]`.

**A11y**:
- `<label for="...">` visível (sentence case, sem dois-pontos).
- Hint text em `<p id="hint-busca">` ligado por `aria-describedby`.
- `<input type="search">` (não `text`) para teclado mobile correto + botão clear nativo.
- Atalho global `/` foca o input (Vanilla JS, respeitar `<input>`/`<textarea>` com foco já).
- Atalho `Esc` limpa.
- Autocomplete usa padrão ARIA combobox (W3C APG).

**Onde usado**: W1, W2, W4 (inline), W7.

**Snippet**:

```html
<form role="search" action="/buscar/" method="get" class="w-full">
  <label for="busca-principal" class="block font-semibold mb-2xs">
    Buscar políticas
  </label>
  <p id="busca-hint" class="text-sm text-neutral-700 mb-xs">
    Por nome, sigla, eixo ou UF. Atalho: tecle / para focar.
  </p>
  <div class="flex gap-xs">
    <input type="search" id="busca-principal" name="q"
           aria-describedby="busca-hint"
           class="flex-1 min-h-[44px] px-md py-sm rounded
                  border border-neutral-500
                  focus:border-primary"
           placeholder="ex: PRONATEC">
    <button type="submit"
            class="min-h-[44px] px-md rounded bg-primary text-white font-semibold">
      Buscar
    </button>
  </div>
</form>
```

### 2.3 Filter / Facet

**Propósito**: filtros facetados de listagem (W2, W4, W5).

**Variantes**: `checkbox-list` (UF, tipo, situação — multi-select OR dentro/AND entre) · `radio-list` (origem em W4 — single-select) · `range` (ano de criação) · `toggle` (tem snapshot? sim/não).

**Estados**: default · selecionado (checkbox/radio marcado) · disabled (faceta sem opções compatíveis com filtros aplicados — opcional, em geral preferir mostrar com contador 0).

**Anatomia**: `<fieldset>` + `<legend>` + `<ul role="list">` com `<li>` envelopando `<input>+<label>+<span class="count">`. Em mobile, envolto em `<details><summary>` colapsável.

**Tokens**: `<li>` com `min-h-[44px]` + `gap-xs`. Contador em `text-sm text-neutral-700`.

**A11y**:
- `<fieldset>+<legend>` indispensáveis para SR agrupar.
- `<input id="...">` ligado a `<label for="...">` clicável.
- Contador anunciado via `aria-describedby` ou dentro do `<label>`: "São Paulo, 53 políticas".
- Touch checkbox+label ≥ 44px.
- Mudança em filtro dispara live region em `#resultados-titulo` (debounce 500ms).

**Onde usado**: W2, W4, W5.

**Snippet**:

```html
<fieldset class="border-0 p-0 m-0">
  <legend class="font-semibold mb-xs">Unidade da Federação</legend>
  <ul role="list" class="space-y-2xs">
    <li>
      <label class="flex items-center gap-xs min-h-[44px] cursor-pointer
                    hover:bg-neutral-100 px-xs rounded">
        <input type="checkbox" name="uf" value="sp"
               class="w-5 h-5 accent-primary">
        <span>São Paulo</span>
        <span class="text-sm text-neutral-700 ml-auto">(53)</span>
      </label>
    </li>
    <!-- ... -->
  </ul>
</fieldset>

<!-- Mobile colapsável -->
<details class="md:hidden border border-neutral-200 rounded p-md">
  <summary class="font-semibold cursor-pointer min-h-[44px] flex items-center">
    Filtros (3 ativos)
  </summary>
  <div class="mt-md">
    <!-- fieldsets aqui -->
  </div>
</details>
```

### 2.4 Tag

**Propósito**: rotular status, tipo, abrangência. Cor + ícone + texto (NUNCA só cor).

**Variantes**: 5 status (ativa/encerrada/suspensa/planejamento/descontinuada) · tipo política (3 cores semânticas — usar `info`/`primary`/`neutral`) · esfera (federal/estadual/municipal — neutro).

**Estados**: estática. Sem hover por padrão (não-clicável). Se for filtro removível, vira componente Button visual de tag (estado focusável + `aria-label="Remover filtro: SP"`).

**Anatomia**: `<span class="tag tag--{status}">` + ícone Unicode em `<span aria-hidden="true">` + texto.

**Tokens**: já em `tailwind.css`:

```css
.tag { @apply inline-flex items-center gap-1 px-sm py-2xs rounded text-sm font-medium; }
.tag--ativa { @apply bg-success/15 text-success-dark; }
.tag--encerrada { @apply bg-danger/15 text-danger-dark; }
.tag--suspensa { @apply bg-warning/15 text-warning-dark; }
.tag--planejamento { @apply bg-info/15 text-info-dark; }
```

**A11y**:
- `aria-label="Situação atual: Ativa"` para SR (já em `tag-status.njk`).
- Ícone com `aria-hidden="true"`.
- Tag de filtro removível: `<button>` com `aria-label="Remover filtro: São Paulo"`, ícone `×` decorativo.

**Onde usado**: W1 (cards), W2 (cards + chips de filtros ativos), W3 (header da ficha), W4 (lista).

**Snippet**: já implementado em `_includes/components/tag-status.njk`. Para tag-filtro removível:

```html
<button type="button"
        class="tag bg-primary/10 text-primary-dark hover:bg-primary/20"
        aria-label="Remover filtro: São Paulo">
  <span>São Paulo</span>
  <span aria-hidden="true">×</span>
</button>
```

### 2.5 Card

**Propósito**: resumo visual de uma política (W1 destaques, W2 resultados) ou de uma seção (W8 sub-rotas).

**Variantes**: `policy` (em listagem de políticas) · `nav` (sub-rotas em /sobre/) · `kpi` (KPIs agregados na Home/UF — número grande + label).

**Estados**: default · hover (border-primary, slight shadow-sm) · focused (ring amarelo no `<a>` interno).

**Anatomia**: `<article>` com `<h3><a>...</a></h3>` (link envolvendo título; a área toda é alvo via `::before` truque, ou JS), `<p>` excerpt, footer com tags e meta.

**Tokens**: `border border-neutral-200 rounded-md p-md hover:border-primary hover:shadow-sm transition-all duration-150` · `min-h-[120px]` em mobile.

**A11y**:
- `<article>` semântico.
- Link no `<h3>` (não no `<article>` inteiro — single-link rule).
- Para tornar área inteira clicável sem quebrar SR: `position: relative` no `<article>` + `<a class="after:absolute after:inset-0">`. Ainda permite selecionar texto.
- `<time datetime="YYYY-MM-DD">` para datas.

**Onde usado**: W1 (destaques), W2 (resultados), W8 (cards de sub-rotas).

**Snippet** (card de política):

```html
<article class="relative border border-neutral-200 rounded-md p-md
                hover:border-primary hover:shadow-sm transition-all duration-150">
  <h3 class="text-lg font-semibold mb-xs">
    <a href="/politica/sp/pronatec/"
       class="after:absolute after:inset-0 text-primary hover:text-primary-dark">
      PRONATEC
    </a>
  </h3>
  <p class="text-sm text-neutral-700 mb-sm">
    Programa Nacional de Acesso ao Ensino Técnico e Emprego.
    Federal, replicado em PE.
  </p>
  <footer class="flex flex-wrap gap-xs items-center text-sm">
    <span class="tag tag--ativa">● Ativa</span>
    <span class="text-neutral-700">Lei 12.513/2011</span>
    <time datetime="2026-05-01" class="text-neutral-700 ml-auto">01/05/2026</time>
  </footer>
</article>
```

### 2.6 Table

**Propósito**: dados tabulares — base legal (W3), lista de políticas por UF (W4), comparação inter-UF (W5).

**Variantes**: `simple` (W3 base legal) · `sortable` (W4 — com `aria-sort`) · `stacked-mobile` (W4 — vira cards em <768px) · `comparison-wide` (W5 — scroll horizontal preservando scope, NÃO converter).

**Estados**: default · linha hover (W4 sortable) · header sortable (`aria-sort="ascending|descending|none"` + `<button aria-pressed>`).

**Anatomia**:

```html
<table>
  <caption>...</caption>
  <thead><tr><th scope="col">...</th></tr></thead>
  <tbody><tr><th scope="row">...</th><td>...</td></tr></tbody>
</table>
```

`<th scope="col">` em colunas + `<th scope="row">` na 1ª coluna (ex.: nome da política em W4).

**Tokens**: `border-collapse` · `border-b border-neutral-200` em `<tr>` · `text-left` default + `text-right tabular-nums` para colunas numéricas · `<caption class="text-sm text-neutral-700 mb-sm text-left">`.

**A11y**:
- `<caption>` obrigatório (descreve conteúdo + ordenação atual).
- `scope` em todos os headers.
- Números à direita com `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`).
- Tabela wide em mobile (W5) → wrapper `<div class="overflow-x-auto" role="region" aria-label="Tabela de comparação" tabindex="0">`.
- Tabela stacked-mobile (W4) → CSS `display: contents` ou render duplo + `display: none` controlado por breakpoint, preservando `<th data-label>`.
- Sortable: `aria-sort` + `<button>` no header + live region anuncia "Ordenado por Nome ascendente, 53 linhas".

**Onde usado**: W3 (base legal), W4 (lista UF), W5 (comparação), W6 (lista textual paralela ao mapa em mobile).

**Snippet** (sortable W4):

```html
<table class="w-full border-collapse">
  <caption class="text-sm text-neutral-700 mb-sm text-left">
    44 políticas mapeadas em Pernambuco. Ordenadas por nome (ascendente).
  </caption>
  <thead class="border-b-2 border-neutral-500">
    <tr>
      <th scope="col" aria-sort="ascending" class="text-left p-sm">
        <button type="button" aria-pressed="true"
                class="font-semibold hover:text-primary">
          Nome <span aria-hidden="true">↑</span>
        </button>
      </th>
      <th scope="col" class="text-left p-sm">Eixo</th>
      <th scope="col" class="text-left p-sm">Origem</th>
      <th scope="col" class="text-left p-sm">Situação</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-neutral-200 hover:bg-neutral-100">
      <th scope="row" class="text-left p-sm font-normal">
        <a href="/politica/pe/bolsa-familia/">Bolsa Família</a>
      </th>
      <td class="p-sm">Proteção social</td>
      <td class="p-sm">Federal</td>
      <td class="p-sm"><span class="tag tag--ativa">● Ativa</span></td>
    </tr>
  </tbody>
</table>
```

### 2.7 Badge

**Propósito**: indicador pequeno (não-interativo) — completude de metadados, contador de filtros ativos, "snapshot disponível".

**Variantes**: `info` (azul/teal) · `success` (verde) · `warning` (laranja) · `neutral` (cinza). Inline ou inline-block.

**Estados**: estática.

**Anatomia**: `<span class="badge badge--{variant}">`.

**Tokens**: `inline-flex items-center px-xs py-2xs rounded text-xs font-semibold`.

**A11y**:
- Texto auto-explicativo. Se semântica adicional: `aria-label`.
- Não usar como link/botão (use Tag ou Button).

**Onde usado**: W2 (chip "Snapshot disponível"), W3 (badge "Completude 92%"), implícito em footer de cards.

**Snippet**:

```html
<span class="inline-flex items-center px-xs py-2xs rounded text-xs font-semibold
             bg-info/10 text-info-dark"
      title="Completude dos metadados">
  Completude: 92%
</span>

<span class="inline-flex items-center px-xs py-2xs rounded text-xs font-semibold
             bg-success/10 text-success-dark">
  Snapshot disponível
</span>
```

### 2.8 Citation Box

**Propósito**: bloco "Como citar" com formatos (ABNT, APA, BibTeX) + botão copiar.

**Variantes**: `inline-details` (atual no PoC, `<details><summary>`) · `tabs` (alternativa em W8 com tabs por formato) · `flat` (todos formatos visíveis simultaneamente).

**Estados**: default · expandido (details aberto) · pós-copia (live region "Citação ABNT copiada").

**Anatomia**: `<section aria-labelledby="cita-h">` + `<h2>` + 3 `<details>` cada um com `<summary>` (formato) + `<pre><code>` (citação) + `<button>Copiar</button>`.

**Tokens**: `bg-neutral-100 p-lg rounded-lg` (container) · `<pre>` em `bg-white p-md rounded border border-neutral-200 text-sm whitespace-pre-wrap`.

**A11y**:
- `<details>` nativo (Enter/Space, sem JS).
- Botão copiar dentro de cada details com `<span class="sr-only">: ABNT</span>` se label "Copiar" se repete.
- Live region `<p role="status" aria-live="polite" id="cita-feedback" class="sr-only">` recebe "Citação ABNT copiada" e limpa em 3s.
- Fallback sem JS: `<a href="/politica/X/citacao.txt">Baixar como TXT</a>`.

**Onde usado**: W3 (ficha — 3 formatos), W8 (Sobre — citação do catálogo, 3 formatos + DOI Zenodo).

**Snippet** (já parcialmente em `ficha.njk`, ampliado):

```html
<section aria-labelledby="cita-h" class="mt-2xl bg-neutral-100 p-lg rounded-lg">
  <h2 id="cita-h" class="text-xl font-semibold mb-md">Como citar</h2>
  <p role="status" aria-live="polite" id="cita-feedback" class="sr-only"></p>

  <details class="mt-sm">
    <summary class="cursor-pointer font-semibold min-h-[44px] flex items-center">
      ABNT
    </summary>
    <pre class="mt-sm whitespace-pre-wrap text-sm bg-white p-md rounded border border-neutral-200"
         id="cita-abnt"><code>{{ p | citacaoAbnt }}</code></pre>
    <button type="button"
            class="mt-xs min-h-[44px] px-md py-sm rounded
                   bg-primary text-white font-semibold"
            data-copy-target="#cita-abnt"
            data-copy-feedback="Citação ABNT copiada">
      Copiar ABNT
    </button>
  </details>
  <!-- repetir para APA e BibTeX -->
</section>
```

### 2.9 Tabs (W3C ARIA-compliant)

**Propósito**: organizar seções da ficha (W3 Resumo / Detalhes / Base legal / Relacionadas / Citação).

**Decisão pré-resolvida (E.4 política B)**: Tabs ARIA W3C-compliant em desktop; degradação para `<details>` em mobile (<768px).

**Variantes**: 5 abas em W3.

**Estados**: tab default · tab ativa (`aria-selected="true"` + `tabindex="0"`) · tab inativa (`aria-selected="false"` + `tabindex="-1"`) · focus visível · panel oculto (`hidden` attr).

**Anatomia (desktop)**:

```html
<div class="hidden md:block">
  <div role="tablist" aria-label="Conteúdo da ficha">
    <button role="tab" aria-selected="true" aria-controls="panel-resumo"
            id="tab-resumo" tabindex="0">Resumo</button>
    <button role="tab" aria-selected="false" aria-controls="panel-detalhes"
            id="tab-detalhes" tabindex="-1">Detalhes</button>
    ...
  </div>
  <section role="tabpanel" id="panel-resumo" aria-labelledby="tab-resumo"
           tabindex="0">...</section>
  <section role="tabpanel" id="panel-detalhes" aria-labelledby="tab-detalhes"
           tabindex="0" hidden>...</section>
</div>
```

**Anatomia (mobile, <768px)**:

```html
<div class="md:hidden">
  <details>
    <summary>Resumo</summary>
    <div>...</div>
  </details>
  <details>
    <summary>Detalhes</summary>
    <div>...</div>
  </details>
</div>
```

**Tokens**: `<button role="tab">` ativo: `border-b-4 border-primary text-primary font-semibold` · inativo: `text-neutral-700 border-b-4 border-transparent hover:border-neutral-200` · `min-h-[44px] px-md py-sm`. Gap entre tabs ≥ 8px.

**A11y (W3C ARIA APG)**:
- Tab order entra com Tab no tab ativo (1 stop), depois ←→ navega entre tabs, Home/End primeiro/último.
- Enter/Space ativa tab focada.
- Foco vai para `<section role="tabpanel">` ativo (este recebe `tabindex="0"`).
- URL sincronizada via `?aba=detalhes` (history.replaceState).
- Sem JS: render duplo (tabs em desktop + details em mobile via CSS).

**Onde usado**: W3 (ficha).

**Snippet JS minimal Vanilla** (~1KB):

```js
// scripts/tabs.js — implementação W3C APG
document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));

  function activate(idx) {
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', i === idx);
      t.setAttribute('tabindex', i === idx ? '0' : '-1');
      panels[i].hidden = i !== idx;
    });
    tabs[idx].focus();
    history.replaceState(null, '', `?aba=${tabs[idx].id.replace('tab-', '')}`);
  }

  tablist.addEventListener('keydown', e => {
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === 'ArrowRight') activate((idx + 1) % tabs.length);
    if (e.key === 'ArrowLeft')  activate((idx - 1 + tabs.length) % tabs.length);
    if (e.key === 'Home')       activate(0);
    if (e.key === 'End')        activate(tabs.length - 1);
  });

  tabs.forEach((t, i) => t.addEventListener('click', () => activate(i)));
});
```

### 2.10 Pagination

**Propósito**: navegar resultados longos em W2 (busca facetada).

**Variantes**: `numbered` (desktop — << 1 2 3 ... 22 >>) · `simple` (mobile — Anterior / Próximo).

**Estados**: página atual (`aria-current="page"`) · disabled (primeira/última) · hover.

**Anatomia**: `<nav aria-label="Paginação">` + `<ol class="pagination">` com `<li>` (cada link de página) + `<a rel="prev|next">`.

**Tokens**: `<a>` com `min-h-[44px] min-w-[44px] flex items-center justify-center px-sm rounded border border-neutral-200 hover:border-primary` · ativo: `bg-primary text-white border-primary`.

**A11y**:
- `<nav aria-label="Paginação">`.
- `<a aria-current="page">` na página atual.
- `<a rel="prev">` e `<a rel="next">` em anterior/próximo.
- Touch ≥ 44×44 cada link.
- Em mobile, mostrar apenas Anterior/Próximo + "Página X de Y".
- Preferir "Mostrar todas (439)" como alternativa (gov.br pattern, anti-padrão paginação cega).

**Onde usado**: W2 (resultados de busca).

**Snippet**:

```html
<nav aria-label="Paginação" class="mt-xl">
  <ol class="flex flex-wrap items-center justify-center gap-2xs">
    <li>
      <a rel="prev" href="?pagina=1"
         class="min-h-[44px] min-w-[44px] flex items-center justify-center px-sm
                rounded border border-neutral-200 hover:border-primary">
        ← Anterior
      </a>
    </li>
    <li>
      <a href="?pagina=1" class="min-h-[44px] min-w-[44px] flex items-center
                                  justify-center px-sm rounded
                                  border border-neutral-200">1</a>
    </li>
    <li>
      <a href="?pagina=2" aria-current="page"
         class="min-h-[44px] min-w-[44px] flex items-center justify-center px-sm
                rounded bg-primary text-white border border-primary">2</a>
    </li>
    <!-- ... -->
    <li>
      <a rel="next" href="?pagina=3"
         class="min-h-[44px] min-w-[44px] flex items-center justify-center px-sm
                rounded border border-neutral-200 hover:border-primary">
        Próxima →
      </a>
    </li>
  </ol>
  <p class="text-sm text-neutral-700 text-center mt-sm">Página 2 de 22</p>
</nav>
```

### 2.11 Footer

**Propósito**: rodapé global. Implementado em `_includes/components/footer.njk`.

**Variantes**: única.

**Estados**: estática.

**Anatomia**: `<footer role="contentinfo">` + grid de 3 colunas (Sobre, Dados, Licença).

**Tokens**: `bg-neutral-100 border-t border-neutral-200 mt-3xl` · grid `gap-lg sm:grid-cols-3`.

**A11y**:
- `role="contentinfo"` (auto via `<footer>` no top-level).
- `<h2>` em cada bloco (não h3 — gov.uk).
- VLibras widget integrado (NF-S-06) — script gov.br oficial; **gap em F**.
- Links externos com `rel="external"` + ícone de "abre em nova aba" + `aria-label`.

**Onde usado**: todos (W1-W8).

**Snippet**: já implementado. **Adicionar em F**:
- Bloco "Acessibilidade" linkando `/sobre/acessibilidade/`.
- VLibras widget.
- Selo "CC-BY 4.0" mais explícito.

### 2.12 Header / Navigation

**Propósito**: header global sticky com logo + nav + (opcional) busca compacta. Implementado em `_includes/components/header.njk`.

**Variantes**: única.

**Estados**: default · sticky scroll · mobile (hambúrguer — **gap em F**).

**Anatomia**: `<header role="banner">` (auto) + logo + `<nav aria-label="Principal">` + `<ul>` de links.

**Tokens**: `bg-primary text-white shadow-md sticky top-0 z-50` · `container-prose py-md flex flex-col sm:flex-row sm:items-center sm:justify-between`.

**A11y**:
- Skip-link `<a href="#conteudo" class="skip-link">Pular para o conteúdo principal</a>` antes do header (já em `base.njk`).
- `<nav aria-label="Principal">`.
- Link ativo com `aria-current="page"` (atual usa `font-semibold` + `underline` — adicionar `aria-current` em F).
- Mobile <640px: implementar hambúrguer com `<button aria-expanded aria-controls="menu-mobile">` (**gap em F**).
- Touch logo + cada link nav ≥ 44px.

**Onde usado**: todos (W1-W8).

**Snippet**: já implementado. **Adicionar em F**:
- `aria-current="page"` no link ativo (não só underline).
- Hambúrguer mobile (Vanilla ~30 LOC).
- Atalho `/` foca busca (busca pode estar no header ou só na página).

---

## Seção 3 — Padrões de a11y transversais

### 3.1 Skip-links

Já implementado em `base.njk` + `tailwind.css`:

```css
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
         focus:bg-focus focus:text-neutral-900 focus:p-sm focus:font-bold;
}
```

```html
<a href="#conteudo" class="skip-link">Pular para o conteúdo principal</a>
```

**Adicionar em F**: skip-link adicional para busca (`#busca-principal`) na Home/Buscar.

### 3.2 Foco visível

Mixin já em `tailwind.css` (Seção 1.8). **Atualizar em F** para incluir `box-shadow inset preto`. Nunca `outline: none`. Auditar via axe-core CI.

### 3.3 Cor não-única

Toda informação semântica = **cor + ícone + texto**. Tags de status (`tag-status.njk`) já cumprem (●/■/▲/◆). Estender para:
- Mapa coroplético: além da escala de azul, padrão de hatch nas UFs sem dados + label numérico no hover/foco.
- Gráfico de barras (W5): textura + rótulo numérico + cor.
- Grafo Cytoscape (cortado): se reintroduzido, linhas sólida/tracejada/pontilhada por tipo de aresta.

### 3.4 Live regions

Templates padrão (todas `polite`; `assertive` apenas em `role="alert"` para erros bloqueantes):

```html
<!-- W2 contador de resultados -->
<h2 id="resultados-titulo" aria-live="polite" aria-busy="false">
  42 políticas correspondem
</h2>

<!-- W3/W8 feedback de copiar -->
<p role="status" aria-live="polite" id="copy-feedback" class="sr-only"></p>

<!-- W7 fuzzy match 404 -->
<p role="status" aria-live="polite" id="fuzzy-status" class="sr-only">
  3 sugestões encontradas
</p>
```

**Regra de timing**: live region só dispara após **debounce 500ms + idle** para evitar verbosidade em SR durante typing rápido. Limpar conteúdo após 3s para não persistir no buffer do SR.

### 3.5 Touch targets ≥ 44×44

Mixin (Tailwind):

```html
class="min-h-[44px] min-w-[44px] px-md py-sm flex items-center justify-center"
```

Aplicar em: botões, links de paginação, checkboxes-em-li (envolver `<label>` com altura 44), tabs, cards inteiros (em mobile), itens de menu, ícones clicáveis.

### 3.6 Tab order discipline

- **Sem `tabindex` positivo** em todo o site. Order = DOM order.
- `tabindex="0"` apenas para tornar focável elemento não-focável nativamente (ex.: `<div role="application">` do grafo, `<svg path>` do mapa).
- `tabindex="-1"` para focar via JS sem entrar no tab order natural (ex.: `<main tabindex="-1">` para foco automático em 404).

### 3.7 Reduced motion

Já declarado em Seção 1.9. Reforço:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

D3 transitions e Cytoscape animations devem checar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` antes de animar.

### 3.8 High contrast / Windows alto-contraste

Validar paleta atual em modo Windows High Contrast (Chrome DevTools Emulate). Pontos de atenção:
- Borders em vez de só background (cards, tabs ativas).
- `forced-colors: active` media query para garantir que elementos não desapareçam:

```css
@media (forced-colors: active) {
  .tag, .badge { border: 1px solid CanvasText; }
  button { border: 1px solid ButtonText; }
}
```

### 3.9 Idioma

`<html lang="pt-BR">` global (já em `base.njk`). Termos estrangeiros: `<span lang="en">snapshot</span>`. Auditar fichas para detectar trechos não-PT durante build.

---

## Seção 4 — Padrões responsivos transversais

### 4.1 Container fluido

`container-prose` (max-width 1020px + `mx-auto px-md`). Texto corrido dentro: `max-w-[75ch]`. Aplicar em W3 (corpo da ficha), W8 (corpo do Sobre).

### 4.2 Stack mobile / 2col tablet / 3col desktop

Padrão para grids de cards/blocos:

```html
<div class="grid gap-md grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- cards -->
</div>
```

Para layout sidebar+main (W2 busca, W4 UF):

```html
<div class="grid gap-lg lg:grid-cols-[280px_1fr]">
  <aside><!-- filtros --></aside>
  <section><!-- resultados --></section>
</div>
```

### 4.3 Tabela → cards stacked em mobile (W4)

Recipe com `display: contents` (sem JS):

```html
<table class="md:table block">
  <caption class="md:caption-side-top">...</caption>
  <thead class="hidden md:table-header-group">
    <tr><th scope="col">Nome</th><th scope="col">Eixo</th></tr>
  </thead>
  <tbody class="block md:table-row-group">
    <tr class="block md:table-row border border-neutral-200 rounded-md p-md mb-sm md:p-0 md:border-0">
      <th scope="row" class="block md:table-cell font-semibold mb-2xs md:mb-0">
        <a href="...">Bolsa Família</a>
      </th>
      <td class="block md:table-cell" data-label="Eixo">
        <span class="md:hidden text-neutral-700 text-sm">Eixo: </span>
        Proteção social
      </td>
    </tr>
  </tbody>
</table>
```

Preserva `<th scope="row">` + estrutura semântica. SR navega corretamente.

### 4.4 Mapa SVG → lista textual em mobile (mandatory)

**Decisão pré-resolvida (E.4 política B)**: em <768px, mapa SVG **não renderiza**. Render apenas a lista textual (Table sortable). Em ≥768px, ambos renderizam mas usuário pode togglear; lista textual é fonte canônica (NF-M-09 + F-S07 Must).

```html
<!-- Sempre no DOM, fonte canônica -->
<section id="lista-ufs">
  <h2>Cobertura por UF</h2>
  <table data-sortable>
    <caption>9 UFs cobertas + Federal</caption>
    <thead><tr>
      <th scope="col">UF</th>
      <th scope="col" class="text-right">Total</th>
    </tr></thead>
    <tbody>
      <tr><th scope="row">São Paulo</th><td class="text-right tabular-nums">53</td></tr>
      <!-- ... -->
    </tbody>
  </table>
</section>

<!-- Apenas em ≥768px, decorativo + interativo -->
<section id="mapa-coropletico" class="hidden md:block" aria-label="Mapa do Brasil">
  <button type="button" data-toggle="lista">Ver como lista</button>
  <svg viewBox="0 0 800 800"><!-- D3 paths --></svg>
</section>
```

### 4.5 Grafo Cytoscape → lista textual em mobile (mandatory)

Idêntico ao mapa: lista textual sempre canônica (F-S09 Must). Cytoscape **opt-in em desktop apenas**, lazy-load via IntersectionObserver. Em mobile (<768px), Cytoscape **não carrega** (poupa ~150KB).

> **Decisão Checkpoint E.4**: usuária optou manter mapa+grafo (W6+W7) — proposta de corte adversarial E.4.C foi recusada. Este DS cobre todos os 8 wireframes.

### 4.6 Filtros → `<details>/<summary>` colapsável em mobile

Em <768px, sidebar de filtros (W2, W4) vira `<details>`:

```html
<details class="md:hidden border border-neutral-200 rounded p-md">
  <summary class="font-semibold cursor-pointer min-h-[44px] flex items-center
                  justify-between">
    <span>Filtros</span>
    <span class="text-sm text-neutral-700">3 ativos</span>
  </summary>
  <div class="mt-md space-y-md">
    <!-- fieldsets -->
  </div>
</details>

<aside class="hidden md:block">
  <!-- mesmos fieldsets -->
</aside>
```

---

## Seção 5 — Decisões pré-resolvidas (política B prevalece)

| # | Decisão | Origem | Implicação para o DS |
|---|---|---|---|
| 1 | **Tabs ARIA W3C-compliant em W3** (não JS minimal) | E.4.B + E.4.C inconsistência §2.2 | Componente Tabs (2.9) implementa setas ←→/Home/End/foco-no-panel, ~1KB JS Vanilla, fallback `<details>` em mobile. |
| 2 | **Mapa em mobile = lista textual** (não SVG) | E.4.B + NF-M-09 Must | Lista textual canônica sempre no DOM (4.4); SVG só em ≥768px. Idem grafo (4.5). |
| 3 | **404 com fuzzy match Must** (não Should) | Decisão Checkpoint E.4 | W7 inclui `<input>` busca + JS fuse.js lazy lendo lista de slugs (~15KB) + live region `#fuzzy-status`. |
| 4 | **Lista textual paralela canônica** em mapa+grafo | F-S07/F-S09 Must | DS oferece pattern Table sortable como cidadão de primeira classe (2.6 stacked-mobile). |
| 5 | **Cor + ícone + texto sempre** | E.4.B § 1 + 3.3 | Tag (2.4) já cumpre; estender ao mapa (hatch) e gráfico W5 (textura). |
| 6 | **Touch ≥ 44×44 universal** | NF-M-27 Must | Mixin em 3.5; aplicar em todos os componentes interativos. |
| 7 | **`<fieldset>+<legend>+<input>+<label>` em forms** | E.4.B Form fields | Filter/Facet (2.3) exige; nunca placeholder como label. |
| 8 | **`history.replaceState` para mudanças intermediárias**, `pushState` apenas em "Search submit"/"Clear filters" | E.4.C §2.8 | URL state pattern documentado para W2/W3/W6 — não polui back button. |
| 9 | **Live regions com debounce 500ms + idle** | E.4.C §2.9 + 3.4 | Padrão de implementação obrigatório em filtros W2 e qualquer contador dinâmico. |
| 10 | **5 sub-rotas em /sobre/** (não single-page com 10 seções) | E.4.B + E.4.C §2.7 | Card (2.5 variant `nav`) cobre os 5 cards da agregadora. |

---

## Seção 6 — Stack de componentes em camadas

Hierarquia de implementação (sempre preferir camada mais baixa):

### Camada 1 — HTML semântico nativo (preferência absoluta)

Usar primeiro, sempre:
- `<button type="button|submit">` (não `<div>` com onClick)
- `<a href>` (não JS click handler)
- `<details><summary>` (filtros mobile, Citation Box, navegação acessível)
- `<input type="search|email|tel|number">` (teclado mobile correto)
- `<table><caption><thead><tbody><th scope>` (dados tabulares)
- `<form action method>` (sempre funcional sem JS)
- `<dialog>` (modais, se necessário; native em todos browsers modernos)
- `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>` (landmarks)

### Camada 2 — Tailwind utility (layout + tokens)

Classes utilitárias para layout, espaçamento, tipografia, cor. Sem custom CSS para o que utilitários cobrem. Componentes em `tailwind.css @layer components` apenas para padrões reusáveis (`.tag`, `.skip-link`, `.container-prose` — já criados).

### Camada 3 — Componentes Eleventy `_includes` (NJK reusables)

Já criados:
- `_includes/layouts/base.njk` — HTML base, meta tags, skip-link
- `_includes/layouts/ficha.njk` — layout específico de política
- `_includes/components/header.njk`
- `_includes/components/footer.njk`
- `_includes/components/tag-status.njk`

A criar em F (lista parcial — mais em §7):
- `components/card-policy.njk`
- `components/card-nav.njk` (W8 sub-rotas)
- `components/badge.njk`
- `components/breadcrumb.njk`
- `components/button.njk` (com variantes via params)
- `components/citation-box.njk`
- `components/filter-fieldset.njk`
- `components/pagination.njk`
- `components/search-input.njk`
- `components/table-sortable.njk`
- `components/tabs.njk` (estrutura HTML; JS em `assets/js/tabs.js`)

### Camada 4 — Alpine/Vanilla JS (apenas onde HTML+CSS não cobrem)

**Regra**: vanilla preferido (sem dependência); Alpine apenas se múltiplos comportamentos reativos no mesmo componente justificarem (~10KB).

Necessário em:
- **Tabs ARIA (2.9)** — vanilla, ~1KB.
- **Botão copiar (2.8)** — vanilla, `navigator.clipboard.writeText` + fallback `execCommand`, ~0.5KB.
- **Atalho `/` foca busca + `Esc` limpa** — vanilla, ~0.3KB.
- **Filtros client-side W2** com URL state e live region debounced — vanilla ou Alpine, ~3KB.
- **Sortable table (W4)** — vanilla lendo `data-sort-value`, ~2KB.
- **Hambúrguer mobile (header)** — vanilla `<button aria-expanded>` + toggle, ~0.5KB.
- **Fuzzy match 404 (W7)** — fuse.js lazy ~10KB + ~0.5KB de glue.
- **Mapa coroplético (W1)** — D3 lazy via IntersectionObserver, ~50KB (apenas em ≥768px).
- **Grafo Cytoscape (W7)** — opt-in click, ~150KB (apenas em ≥768px). Lista textual canônica sempre presente.

---

## Seção 7 — Tokens já implementados no PoC vs gaps

### Já implementado (manter intocado, salvo correções pontuais)

**Em `site/tailwind.config.js`**:
- Paleta `primary/success/danger/warning/info/neutral/focus` completa (Seção 1.1)
- `fontFamily.sans` Open Sans + Inter + system-ui
- `maxWidth.container` 1020px
- 8 spacing tokens 2xs→3xl
- Plugin `@tailwindcss/typography`

**Em `site/src/assets/css/tailwind.css`**:
- Foco amarelo `:focus-visible` (Seção 1.8 — falta `box-shadow inset preto`, gap)
- Body base, h1-h3, p, a (Seção 1.2)
- `.container-prose`
- `.skip-link`
- `.tag` + 4 variantes status

**Em `site/src/_includes/`**:
- `layouts/base.njk` (skeleton + GoatCounter)
- `layouts/ficha.njk` (layout de política — base sólida; falta abas)
- `components/header.njk`
- `components/footer.njk`
- `components/tag-status.njk`

### Gaps a adicionar em Bloco F

**Tokens / CSS**:
- [ ] Atualizar `:focus-visible` com `box-shadow inset preto` (Seção 1.8)
- [ ] Adicionar `prefers-reduced-motion` global (Seção 1.9)
- [ ] Adicionar `forced-colors` media query para alto contraste (Seção 3.8)
- [ ] Adicionar variante `descontinuada` em `.tag` (Seção 1.1)
- [ ] Adicionar mono font stack em `tailwind.config.js` (`fontFamily.mono`)
- [ ] Adicionar `tabular-nums` utility já vem por padrão Tailwind — confirmar uso em tabelas

**Componentes Eleventy**:
- [ ] `components/breadcrumb.njk`
- [ ] `components/button.njk` (3 variantes via params)
- [ ] `components/badge.njk`
- [ ] `components/card-policy.njk` (W2 resultados, W1 destaques)
- [ ] `components/card-nav.njk` (W8 sub-rotas)
- [ ] `components/citation-box.njk` (extrair do `ficha.njk` atual)
- [ ] `components/filter-fieldset.njk` (W2, W4)
- [ ] `components/pagination.njk` (W2)
- [ ] `components/search-input.njk` (header compacto + hero grande)
- [ ] `components/table-sortable.njk` (W4)
- [ ] `components/tabs.njk` (W3)
- [ ] `components/skip-links.njk` (estender com #busca)

**JS Vanilla** (em `site/src/assets/js/`):
- [ ] `tabs.js` (~1KB) — Tabs W3C APG
- [ ] `copy.js` (~0.5KB) — botão copiar com live region
- [ ] `shortcuts.js` (~0.3KB) — atalho `/` e `Esc`
- [ ] `nav-mobile.js` (~0.5KB) — hambúrguer
- [ ] `sortable-table.js` (~2KB) — W4
- [ ] `filters.js` (~3KB) — W2 com debounce, history.replaceState, live region
- [ ] `fuzzy-404.js` (~0.5KB + fuse.js ~10KB) — W7
- [ ] `mapa.js` (~lazy) — D3 + togglável (apenas ≥768px) — quando entrar W6/W1
- [ ] `grafo.js` (Cytoscape v3 ~150KB lazy) — para W7 (grafo) em F.3

**Atualizações em arquivos existentes**:
- [ ] `header.njk`: adicionar `aria-current="page"`, hambúrguer mobile
- [ ] `footer.njk`: adicionar bloco "Acessibilidade" + VLibras + selo CC-BY
- [ ] `ficha.njk`: refatorar para usar `tabs.njk` (5 abas: Resumo/Detalhes/Base legal/Relacionadas/Citação) + `breadcrumb.njk` + `citation-box.njk`

**Self-host de fontes**:
- [ ] Baixar Open Sans (latin-ext, 400/600/700) para `site/src/assets/fonts/` + `@font-face` com `font-display: swap`. Não depender de Google Fonts CDN (NF-M-04 perf + LGPD).

---

## Seção 8 — Plano de roll-out por wireframe

Para cada wireframe, lista de componentes do DS que **devem existir antes** da implementação. Ordem alinhada ao roadmap E.4.A (F.1 → F.2 → F.3).

> **Decisão Checkpoint E.4 (2026-05-01)**: usuária optou por **MANTER 8 WIREFRAMES** (recusou cortes adversariais E.4.C). Política aplicada: B (a11y) prevalece em conflitos. Implicação: lançamento ~2028-11 solo OU 2026-12 com bolsista FRM/IESP confirmado em ≤60 dias (cláusula reabertura E.3 ainda vale).

### W1 — Home (F.1)

**Pré-requisitos do DS**:
- Header (existe; +`aria-current` +hambúrguer)
- Footer (existe; +VLibras +acessibilidade)
- Search Input (hero variant)
- Card (KPI variant + policy variant para destaques)
- Badge
- Tag (existe)
- Table sortable (lista textual de UFs — fonte canônica em mobile)
- Skip-links (existe; +#busca)
- Mapa coroplético D3 + lista textual paralela mobile (canônica)

**Mapa coroplético**: implementado já em F.1 ou diferido para F.3 conforme decisão de sprint. Lista textual sempre canônica (NF-M-09 Must).

### W2 — Busca facetada (F.1)

**Pré-requisitos do DS**:
- Header, Footer, Skip-links (existem)
- Search Input (hero + atalho `/`)
- Filter/Facet (mobile colapsável)
- Card (policy variant)
- Tag (filtros removíveis)
- Badge ("Snapshot disponível")
- Pagination
- Button (limpar, copiar link, baixar CSV)
- Live region pattern (3.4)
- JS: `filters.js`, `shortcuts.js`, `copy.js`

### W3 — Ficha individual (F.1)

**Pré-requisitos do DS**:
- Layout `ficha.njk` (existe; refatorar)
- Breadcrumb
- Header, Footer (existem)
- Tag (status — existe), Badge (completude — existe inline; extrair)
- Tabs ARIA (5 abas)
- Table simple (base legal)
- Citation Box (3 formatos — ABNT/APA/BibTeX)
- Button (copiar, baixar snapshot, comparar)
- JS: `tabs.js`, `copy.js`

### W4 — Página executiva por UF (F.2)

**Pré-requisitos do DS** (todos do F.1 +):
- Filter/Facet (radio + checkbox)
- Table sortable + stacked-mobile (4.3)
- Button (baixar CSV, comparar)
- KPI Card variant
- JS: `sortable-table.js`

**Substituto F.1**: `/buscar/?uf=PE` cobre o caso até W4 entregar.

### W5 — Comparação inter-UF (F.2)

**Decisão Checkpoint E.4**: MANTIDO no MVP (recusada proposta de corte adversarial E.4.C §3.5).

**Pré-requisitos do DS** (todos do F.1 +):
- Filter/Facet (checkboxes UF mín 2 máx 5)
- Table comparison-wide (scroll horizontal `tabindex=0` preservando `<th scope="row">`)
- Button (comparar, copiar link, baixar PDF)
- Padrão `<figure><svg><figcaption>` para gráfico de barras opcional
- Live region em `#resultado-titulo` polite + `#copiar-feedback`
- Mapa Brasil interativo seleção múltipla (reuso do W1)
- JS: `comparacao.js` (cálculo client-side dim×UF), `copy.js`

**Estimativa honesta** (E.4.C): 60-100h (não 40-60h de A). 4 abas Tabela/Gráfico/Mapa/Por Política.

### W6 — Mapa coroplético dedicado (F.3)

**Decisão Checkpoint E.4**: MANTIDO no MVP (recusada proposta de corte adversarial E.4.C §3.6).

**Pré-requisitos do DS** (todos do F.1+F.2 +):
- D3 mapa SVG completo + lista textual paralela canônica (NF-M-09)
- Filter/Facet (dimensão colorida + filtros)
- Button (baixar PNG/SVG/CSV, lista textual)
- Live region em hover/foco UF
- JS: `mapa.js` (D3 v7), serializador SVG→PNG via `canvas.toDataURL`

**Estimativa honesta** (E.4.C): 50-90h. A11y SVG é o item mais arriscado.

### W7 — Grafo de relacionamentos (F.3)

**Decisão Checkpoint E.4**: MANTIDO no MVP (recusada proposta de corte adversarial E.4.C).

**Pré-requisitos do DS** (todos do F.1+F.2 +):
- Lista textual paralela canônica (NF-M-10) — fonte de verdade
- Cytoscape.js v3 com toolbar acessível (zoom +/−, centralizar, ajuda)
- DOM mirroring: `<button>` espelho para cada nó (W3C-recomendado)
- Filter/Facet (tipo de aresta, profundidade 1/2/3)
- Live region `#grafo-status` polite anuncia foco/vizinhos
- JS: `grafo.js` (Cytoscape ~150KB lazy + opt-in mobile)

**Estimativa honesta** (E.4.C): 80-130h. A11y do canvas é o item mais arriscado de todo o site.

### W7' — 404 com fuzzy match (F.1)

**Decisão Checkpoint E.4**: 404 PROMOVIDO de Should para Must (alinhamento com B). Adicionado como wireframe extra (não estava na lista A original).

**Pré-requisitos do DS**:
- Header, Footer, Skip-links (existem)
- Search Input (hero)
- Card (policy variant para "mais consultadas")
- Live region pattern para fuzzy match
- JS: `fuzzy-404.js` + fuse.js (~10KB lazy)
- HTTP 404 real (config Eleventy + hosting)

### W8 — Sobre + sub-rotas (F.1)

**Pré-requisitos do DS**:
- Header, Footer, Skip-links (existem)
- Card (nav variant para sub-rotas)
- Citation Box (do catálogo + DOI Zenodo)
- Button (copiar)
- JS: `copy.js`

**Sub-rotas**: `/sobre/`, `/sobre/transparencia/`, `/sobre/privacidade/`, `/sobre/termos/`, `/sobre/acessibilidade/`, `/sobre/cobertura/`, `/sobre/status/`, `/sobre/changelog/`. Status auto-gerado a partir de `data/derived/build-status.json` em build-time (CONS-S-03 facilitador).

### Ordem recomendada de construção dos componentes em F.1/F.2/F.3

**Onda F.1 — Esqueleto operacional** (~80-150h ajustado pós-adversarial):
1. **Sprint 0 (preparatório)**: gaps de tokens (`:focus-visible` inset, `prefers-reduced-motion`, mono font, descontinuada tag, self-host Open Sans) + `breadcrumb.njk` + `button.njk` + `badge.njk` + `skip-links.njk` estendido.
2. **Sprint 1 (W3 Ficha)**: `tabs.njk` + `tabs.js` (W3C ARIA APG completo, ~18-32h) + `citation-box.njk` + `copy.js` + refator `ficha.njk` + `table-sortable.njk` (base legal usa simples).
3. **Sprint 2 (W2 Busca)**: `search-input.njk` + `filter-fieldset.njk` + `card-policy.njk` + `pagination.njk` + `filters.js` + `shortcuts.js`.
4. **Sprint 3 (W1 Home)**: KPI Card variant + lista textual UFs (Table sortable já criado) + integração tudo. Mapa coroplético interativo opcional (pode diferir para F.3).
5. **Sprint 4 (W7' 404 + W8 Sobre)**: `fuzzy-404.js` + sub-rotas Sobre + `card-nav.njk` + Citation Box reutilizado.
6. **Sprint 5 (header/footer polish)**: `aria-current`, hambúrguer mobile, VLibras, `/sobre/acessibilidade/` declaração formal.

**Onda F.2 — UF + Comparação** (~80-130h):
7. **Sprint 6 (W4 UF executiva)**: `card-kpi.njk` + barras horizontais clicáveis + filtros locais escopados.
8. **Sprint 7 (W5 Comparação)**: `comparacao.njk` + 4 abas Tabela/Gráfico/Mapa/Por Política + mapa interativo seleção múltipla + `comparacao.js`.

**Onda F.3 — Visualizações ricas** (~130-220h):
9. **Sprint 8 (W6 Mapa dedicado)**: `mapa.js` D3 + lista textual paralela canônica + filtros dimensão + download PNG/SVG.
10. **Sprint 9 (W7 Grafo)**: `grafo.js` Cytoscape + DOM mirroring + lista textual canônica + toolbar acessível.

**Total estimado Bloco F**: 380-1070h conforme E.4.C (sem cortes; usuária optou manter ambição).

Cada sprint encerra com auditoria axe-core CI bloqueante (NF-M-29 + NF-S-22 Must).

---

## Apêndice — Checklist de conformidade do DS

Antes de qualquer componente entrar em produção:

- [ ] HTML semântico nativo (não `<div>` com role)
- [ ] Foco visível com mixin padrão
- [ ] Touch ≥ 44×44px
- [ ] Cor não é único indicador
- [ ] Contraste 4.5:1 texto / 3:1 UI declarado
- [ ] Tab order = DOM order (sem tabindex positivo)
- [ ] Live region com debounce + limpeza se aplicável
- [ ] Funciona sem JS (graceful degradation)
- [ ] Funciona em alto contraste (forced-colors)
- [ ] Respeita `prefers-reduced-motion`
- [ ] Testado em NVDA+Firefox e VoiceOver+Safari (mínimo)
- [ ] axe-core 0 violações serious/critical
- [ ] Lighthouse a11y ≥ 95
- [ ] Touch e teclado funcionais (sem mouse)

---

**Fim do documento E.5 — Sistema de design enxuto MVP.**

Documento contrato para Bloco F. Mudanças neste DS exigem ADR formal (`.claude/decisions/`).