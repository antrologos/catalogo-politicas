# E.1.A — Atlas Brasil PNUD + comparação inter-UF para gestores

> Output do agent que aprofundou Atlas Brasil PNUD (atlasbrasil.org.br) + Atlas Violência IPEA + OECD Education GPS, com lente "como aplicar isso ao site FRM para gestores comparando UFs".

## Atlas Brasil PNUD — análise

**3 caminhos de comparação:**
1. **Consulta por Mapa**: seleciona 1 estado/município, depois "vizinhos" para expandir
2. **Consulta por Planilha** (atlasbrasil.org.br/consulta/planilha): seleciona N geografias + N indicadores → tabela lado-a-lado
3. **Consulta por Gráfico**: série temporal de 1 indicador em N localidades

**Pontos fortes:** 3 visualizações paralelas (tabela + mapa + gráfico); unidade coerente; treemap IDHM.

**Pontos fracos:**
- Limite de 2 indicadores
- Fluxo seleção desajeitado (sem checkbox claro)
- **URLs NÃO bookmarkáveis** (estado de comparação não persiste)
- Atualização lenta (depende do censo)
- Acessibilidade não declarada

## Atlas Violência IPEA + OECD GPS — comparação rápida

- **Atlas Violência**: API pública, multilíngue, mas sem deep linking, visual datado
- **OECD GPS**: URLs determinísticas bookmarkáveis (`?primaryCountry=USA`), drag-to-select, PDF customizado, **rede visual de políticas (grafo)**

## Especificação detalhada — Wireframe "Comparação inter-UF" para FRM

### Estado inicial (sem seleção)
- Hero: "COMPARAR POLÍTICAS ENTRE ESTADOS"
- Mapa interativo do Brasil (todos cinza)
- Painel lateral: dropdown searchable para selecionar UFs + checkboxes para "dimensões padrão"

### Como adicionar UFs (duplo path, recomendado)
1. **Clique no mapa** — feedback visual imediato (azul)
2. **Dropdown searchable** — fuzzy match nome ou sigla; badges removíveis ("SP ✕ MG ✕ BA")
- **Limite de 9 UFs máximo** (pragmático — tabela/gráfico não explode)

### Apresentação após seleção (4 abas)

**ABA 1 — TABELA COMPARATIVA**
- Linhas: dimensões; colunas: estados + média/Federal
- Sortable por coluna
- Células clicáveis → drill-down

**ABA 2 — GRÁFICO COMPARATIVO**
- Barras horizontais agrupadas
- Dropdown muda dimensão
- Bookmarkável

**ABA 3 — MAPA COMPARATIVO**
- Coroplético com mesma dimensão colorida
- Estados selecionados destacados

**ABA 4 — MODO POLÍTICA-CÊNTRICO** (única, valiosa)
- Dropdown seleciona 1 política
- Mostra: "Presente em [SP, RJ, MG]; ausente em [BA]"
- Diferenças de execução por UF (modalidade, público, arranjo)

### Dimensões padrão (checked)
- Nº políticas total
- Nº políticas ativas
- Distribuição por eixo (EDU/TRAB/PSOC)
- Proporção Federal vs Estadual

### Dimensões opcionais (unchecked)
- Por situação, modalidade, arranjo logístico, público-alvo, cobertura geográfica

### URL determinística (CRÍTICO)
```
/comparacao/politicas?
  estados=sp,rj,mg
  dimensoes=total,por_eixo,federal_estadual
  view=tabela
  ordenar_por=total:desc
  v=2026-05
```
Bookmarkável + compartilhável + cacheável.

### Exportação
- CSV bruto
- PDF customizado (estilo OECD GPS)
- Link compartilhável (botão "Copiar link")

## Top 3 features a importar

1. **Multi-seleção com feedback visual ao vivo** (Atlas Brasil + OECD GPS)
2. **URLs bookmarkáveis com estado** (OECD GPS — `?primaryCountry=USA`)
3. **PDF customizado de seleção** (OECD GPS)

## Top 3 anti-padrões a evitar

1. **Limite rígido sem justificativa** (Atlas Brasil: 2 indicadores)
2. **Seleção via dropdown hierárquico sem busca** (Atlas Brasil)
3. **Estado não persistente em URL** (Atlas Brasil)

## Acessibilidade — práticas garantidas
- SVG mapa: `role="region"` + cada estado `<path role="button" aria-label="São Paulo">`
- Tabelas semânticas com `aria-sort`
- Keyboard nav: tab + enter/space ativam seleção; escape fecha dropdown
- Cores nunca como única representação (hatch patterns ou labels textuais)

## Stack técnica indicada
- React 18+ (state URL binding)
- Plotly.js ou Recharts (suportam PDF export)
- D3 para mapa coroplético customizado
- TanStack Query (URL-as-source-of-truth)
- Puppeteer/Playwright para render PDF

## Padrão "Your URL is Your State"
Toda seleção atualiza query string; navegação browser back/forward funciona; compartilhamento trivial; SEO + acessibilidade ganham; sem necessidade de localStorage/cookies.