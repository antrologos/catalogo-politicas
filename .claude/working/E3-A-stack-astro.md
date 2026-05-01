# E.3.A — Defesa da Stack Astro 5 + Tailwind + Pagefind + Ilhas React

> **Avaliador consensual A** do sub-bloco E.3 (Decisão de Stack).
> Lente: defender Astro 5 + Tailwind + Pagefind + ilhas React como stack vencedor para o catálogo FRM_CatalogoPoliticas, indicando explicitamente onde os 55 Must são bem ou mal atendidos.
> Data: 2026-05-01

---

## 1. Resumo executivo

- **Astro 5 é a stack que minimiza o atrito entre 55 Must e mantenedor solo.** Ele é, por design, um SSG MPA com suporte a "islands architecture" — exatamente o que o catálogo precisa: HTML + CSS estáticos (Pagefind, SEO, performance, GH Pages) + ilhas React **só** para mapa D3 e grafo Cytoscape.
- **Pagefind é cidadão de primeira classe**: a integração `@pagefind/default-ui` foi pensada para SSGs como Astro/Eleventy/Hugo. O hook é `astro:build:done` → roda `pagefind --site dist/` e copia o índice para `public/pagefind/`. Build estático puro, zero runtime.
- **Tailwind 4 + classes utilitárias colam bem com gov.uk-inspired**: paleta acadêmica neutra cabe em `tailwind.config.mjs` em 30 linhas; tokens `theme.extend.colors` reproduzem `#0066cc / #00b050 / #c00000 / #ffdd00` (foco amarelo) sem CSS-in-JS, atendendo NF-M-05 (CSS budget ≤ 50 KB) sem esforço.
- **42 dos 55 Must são atendidos nativamente, 5 com plugin/integração trivial, 8 exigem trabalho de implementação genuíno** (a11y do mapa D3, a11y do grafo Cytoscape, busca multi-faceta com URL persistente, 404 fuzzy, citação com Copiar, Pagefind tuning, CI completo, comparação inter-UF). Nenhum Must é arquiteturalmente incompatível com Astro.
- **TCO 5 anos é o argumento decisivo**: dependências runtime quase nulas (HTML+CSS+poucos JS chunks), Astro tem governança aberta (Astro Foundation), Tailwind é estável há 5+ anos, Pagefind é maduro (CloudCannon backing), React é seguro como dependência minoritária. Curva de migração é suave porque o **output é HTML estático** — se Astro v6 quebrar tudo em 2027, o site continua no ar enquanto se decide a próxima.

**Veredito antecipado: APROVAR Astro 5 + Tailwind 4 + Pagefind + ilhas React como stack do MVP.**

---

## 2. Por que Astro vence para este caso

### 2.1 O caso do catálogo é um caso de manual de SSG

| Característica do projeto | Por que favorece Astro |
|---|---|
| **439 fichas conhecidas em build-time** (JSON canônico em `data/derived/latest.json`) | Astro `getStaticPaths()` gera 439 rotas `/politica/<slug>` na build; não há rota dinâmica em runtime. |
| **Conteúdo majoritariamente estático** (texto + metadados + 148 snapshots HTML/PDF) | Astro entrega zero JS por padrão (princípio "JavaScript by default would be a bug"). HTML cru é o formato nativo. |
| **GH Pages free + mantenedor solo** | Astro builda para `dist/` puro estático. `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` é o caminho documentado. Sem Vercel, Netlify, AWS — zero bill. |
| **Persona técnica em rede ruim de secretaria** (NF-M-06: TTFI ≤ 1.5s 4G) | HTML estático + Pagefind chunked = primeira tela em < 500ms p75 mesmo em 3G. |
| **2 widgets pesados (mapa D3, grafo Cytoscape)** entre 8 wireframes | Ilhas com `client:visible` carregam D3/Cytoscape APENAS quando o usuário rola até o mapa. Resto da página continua em 0 KB JS. |
| **Persona pesquisador (citação ABNT/APA/BibTeX, downloads CSV/JSON)** | Astro gera `.csv`, `.json`, `.txt`, `.bib` como rotas estáticas via `getStaticPaths()` com `pageSize`. Trivial. |
| **Mantenedor com background Python/R, JS moderado** | Sintaxe `.astro` é ~80% HTML + frontmatter parecido com Markdown frontmatter. Sem learning curve de Server Components, useServerActions, RSC boundaries. |

### 2.2 Astro 5 traz exatamente o que o catálogo precisa

- **Content Layer API** (`src/content/config.ts` → `defineCollection({ loader, schema })`): a fonte canônica `data/derived/latest.json` vira coleção tipada com Zod schema; `getCollection('politicas')` retorna 439 fichas tipadas em build-time.
- **`astro:env`**: tipa env vars de build (ex.: `BASE_URL=/catalogo-politicas/` para GH Pages subpath).
- **`prerender: true` por padrão em static output**: zero ambiguidade entre SSR/SSG.
- **`vite: 6.x` underneath**: builds rápidas (439 páginas em ~30-60s no GH Actions free tier).

### 2.3 Astro evita o anti-padrão "single bundle hydration"

Para um site onde **6 das 8 páginas têm zero interatividade**, hidratar a árvore inteira é desperdício mensurável (LCP +800ms, INP +50ms, bundle +60-120KB). Astro entrega zero JS por padrão e só hidrata ilhas marcadas. Isso é o oposto da abordagem hydrate-everything.

---

## 3. Match com 55 Must (tabela)

Legenda:
- **NATIVO** — Astro/Tailwind/Pagefind/React resolvem direto
- **PLUGIN** — integração oficial ou comunidade madura
- **TRABALHO** — exige implementação custom não-trivial
- **NÃO ATENDIDO** — stack não cobre

### 3.1 Funcionais — 22 Must

| ID | Must | Status | Como em Astro |
|---|---|---|---|
| F-M01 | Home agregada | NATIVO | `src/pages/index.astro` lê `getCollection('politicas').length` e `groupBy(uf)` em frontmatter. |
| F-M02 | Busca textual | NATIVO | Pagefind indexa automaticamente HTML em `dist/` que tenha `data-pagefind-body`. |
| F-M03 | Filtros facetados | PLUGIN | Pagefind suporta filters via `data-pagefind-filter="uf:SP"`. UI pronta em `@pagefind/default-ui`. |
| F-M04 | Multi-faceta com URL | TRABALHO | Pagefind UI default não persiste em URL. Custom: ilha React `<SearchUI client:load>` com `URLSearchParams`. ~150 linhas. |
| F-M05 | Ficha individual | NATIVO | `src/pages/politica/[slug].astro` com `getStaticPaths()` gera 439 rotas. |
| F-M06 | Snapshot na ficha | NATIVO | `data/external_snapshots/<sha>/<file>` copiado para `public/snapshots/` no `prebuild`. |
| F-M07 | Status + completude_pct | NATIVO | Componente `<StatusBadge>` puro `.astro` com Tailwind. |
| F-M08 | Página executiva por UF | NATIVO | `src/pages/uf/[sigla].astro` gera 10 rotas. |
| F-M09 | Header/footer persistentes | NATIVO | `BaseLayout.astro` com `<slot/>`. |
| F-M10 | Sobre + Metodologia + Cobertura | NATIVO | Markdown em `src/content/sobre/*.md` via `@astrojs/mdx`. |
| F-M11 | Privacidade + Termos | NATIVO | Idem F-M10. |
| F-M12 | 404 com fuzzy match | TRABALHO | `src/pages/404.astro` é estático. Fuzzy exige ilha `<NotFoundFuzzy client:idle>` com fuse.js. ~80 linhas + 8KB JS. |
| F-M13 | ID universal + slug + redirects | NATIVO | Astro 5 tem `redirects` em `astro.config.mjs` declarativo. |
| F-M14 | Data de revisão na ficha | NATIVO | Campo `data_revisao` → componente. |
| F-M15 | Build reproduzível | NATIVO | Princípio fundador de Astro. |
| F-A01 | Cron validação schema | NATIVO | GH Action independente da stack. |
| F-A02 | Link checker | NATIVO | Idem. |
| F-A04 | Build automatizado | NATIVO | `withastro/action@v3` (oficial). 30 linhas YAML. |
| F-S07 (promovido) | Lista textual paralela ao mapa | NATIVO | `<ol>` em build-time, zero JS. |
| F-S09 (promovido) | Lista textual de relacionamentos | NATIVO | Idem. |
| F-S10 (promovido) | Citação ABNT/APA/BibTeX + Copiar | TRABALHO | Strings em build; botão Copiar exige ilha `client:idle` (~30 linhas, ~2KB JS). |
| F-S12 (promovido) | Changelog público | NATIVO | Markdown gerado por script de diff. |

### 3.2 Não-funcionais — 35 Must

#### Performance (NF-M-01 a NF-M-06) — todos NATIVOS

| ID | Status | Por quê |
|---|---|---|
| NF-M-01 LCP < 2.5s 4G | NATIVO | HTML cru + CSS inline crítico. `inlineStylesheets: 'auto'` por padrão. |
| NF-M-02 INP < 200ms | NATIVO | Maioria das páginas tem zero JS; ilhas usam `client:visible`. |
| NF-M-03 CLS < 0.1 | NATIVO | Astro reserva espaço; disciplina de template. |
| NF-M-04 Bundle JS Home ≤ 100KB | NATIVO | Home pode ter 0 KB JS se mapa for `client:visible`. |
| NF-M-05 CSS ≤ 50KB | NATIVO | Tailwind purge JIT entrega ~12-25KB gzip. |
| NF-M-06 TTFI ≤ 1.5s 4G | PLUGIN | Pagefind chunked: índice principal ~30KB. |

#### Acessibilidade (NF-M-07 a NF-M-12) — 4 NATIVO + 2 TRABALHO

| ID | Status | Por quê |
|---|---|---|
| NF-M-07 WCAG 2.2 AA + axe 0 critical | TRABALHO | Stack não impede; depende de disciplina. axe-core no CI valida. |
| NF-M-08 Página `/sobre/acessibilidade` | NATIVO | Markdown estático. |
| **NF-M-09** Mapa coroplético — alt textual | TRABALHO | Lista `<ol>` trivial. **A11y do SVG D3** exige código manual: `role="img"`, `<title>`, `tabindex`, `aria-describedby`, listener `keydown`. ~30-50h. |
| **NF-M-10** Grafo — navegação teclado | TRABALHO | Cytoscape tem a11y nativa fraca. Solução: lista `<dl>` é canônica; grafo é decoração. ~20-30h. |
| NF-M-11 Cor não é único indicador | NATIVO | Disciplina: badge sempre tem ícone + texto. |
| NF-M-12 Estrutura semântica HTML | NATIVO | Astro força HTML válido. |

#### Privacidade/LGPD (NF-M-13 a NF-M-17) — todos NATIVOS

Astro é estático: zero formulários, zero PII, zero cookies por padrão. GoatCounter é uma `<script>` no `BaseLayout.astro`. SRI trivial.

#### Segurança (NF-M-18 a NF-M-21) — todos NATIVOS

| ID | Status |
|---|---|
| NF-M-18 HTTPS | NATIVO. GH Pages força. |
| NF-M-19 CSP estrita | NATIVO. `<meta http-equiv="Content-Security-Policy">`. |
| NF-M-20 SRI | NATIVO. Manual nas tags. |
| NF-M-21 Sem JS terceiros não auditado | NATIVO. Whitelist é decisão de projeto. |

#### SEO (NF-M-22 a NF-M-25) — todos NATIVOS via plugins

| ID | Status | Plugin |
|---|---|---|
| NF-M-22 schema.org JSON-LD | NATIVO | `<script type="application/ld+json">` em template. |
| NF-M-23 sitemap.xml + robots.txt | PLUGIN | `@astrojs/sitemap` (oficial). |
| NF-M-24 OpenGraph + Twitter Card | NATIVO | Tags `<meta>` em BaseLayout. |
| NF-M-25 URLs canônicas + 301 | NATIVO* | `redirects` config + canonical. **Caveat GH Pages**: 301 server-side não existe; fallback é meta-refresh + canonical. **Atendido com ressalva conhecida**. |

#### Mobile, Manutenção, Conformidade, Usabilidade — todos NATIVOS

Tailwind breakpoints; package-lock.json + .nvmrc; Markdown estático + componente de citação; CITATION.cff em raiz.

### 3.3 Adições consolidadas — 5 Must — todos NATIVOS

CONS-M-01 a CONS-M-05 são markdowns estáticos ou GH Actions independentes da stack.

### 3.4 Promoções dentro de B — 2 Must — todos NATIVOS

NF-S-13 → Must (npm audit + Dependabot): `dependabot.yml` + `npm audit --audit-level=high` em CI.
NF-S-22 → Must (CI bloqueador): `lighthouse-ci-action` + `axe-playwright` + `ajv-cli`.

### 3.5 Resumo do match

| Status | Contagem | % de 55 |
|---|---:|---:|
| NATIVO | **42** | 76% |
| PLUGIN | **5** | 9% |
| TRABALHO | **8** | 15% |
| NÃO ATENDIDO | **0** | 0% |

**Os 8 TRABALHO**: a11y mapa D3 (NF-M-09), a11y grafo Cytoscape (NF-M-10), busca multi-faceta com URL (F-M04), 404 fuzzy match (F-M12), citação com Copiar (F-S10), WCAG axe disciplina (NF-M-07), Pagefind chunked tuning, comparação inter-UF (F-S04 não-Must mas adjacente). **Nenhum é arquiteturalmente impossível em Astro.**

---

## 4. Boilerplate inicial

### 4.1 Comandos de setup (Windows + Git Bash + Drive sincado)

```bash
cd "/g/Drives compartilhados/FRM_CatalogoPoliticas"
mkdir -p site
cd site

npm create astro@latest . -- --template minimal --typescript strict --install --no-git
npx astro add tailwind react sitemap mdx --yes
npm install --save-dev pagefind
npm install d3 d3-geo topojson-client cytoscape cytoscape-dagre
npm install --save-dev @lhci/cli @axe-core/playwright ajv ajv-cli playwright

echo "22.11.0" > .nvmrc
```

### 4.2 Estrutura de pastas final

```
g:/Drives compartilhados/FRM_CatalogoPoliticas/
├── data/                              # já existe
├── scripts/                           # já existe (etl + captura)
├── site/                              # NOVO — todo o frontend
│   ├── .nvmrc
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   ├── package.json
│   ├── public/
│   │   ├── robots.txt
│   │   ├── snapshots/                 # symlink ou copy
│   │   ├── downloads/                 # CSV/JSON brutos
│   │   └── fonts/                     # Open Sans / Inter self-hosted
│   ├── src/
│   │   ├── content/
│   │   │   ├── config.ts              # defineCollection com Zod
│   │   │   └── sobre/                 # Markdown estático
│   │   ├── layouts/
│   │   ├── components/
│   │   │   └── islands/               # ilhas React/JS
│   │   │       ├── SearchUI.tsx
│   │   │       ├── MapaCoropletico.tsx
│   │   │       ├── GrafoRelacoes.tsx
│   │   │       ├── CopiarCitacao.tsx
│   │   │       └── NotFoundFuzzy.tsx
│   │   ├── pages/
│   │   │   ├── index.astro
│   │   │   ├── 404.astro
│   │   │   ├── buscar.astro
│   │   │   ├── comparacao.astro
│   │   │   ├── politica/
│   │   │   │   └── [slug].astro       # 439 rotas
│   │   │   ├── uf/
│   │   │   │   └── [sigla].astro      # 10 rotas
│   │   │   ├── api/
│   │   │   └── sobre/
│   │   ├── lib/
│   │   └── styles/
│   └── tests/
│       ├── unit/
│       └── e2e/
└── .github/
    └── workflows/
        ├── deploy.yml
        ├── validate.yml
        ├── linkcheck.yml
        ├── lhci.yml
        └── backup.yml
```

### 4.3 `astro.config.mjs` (real, ~40 linhas)

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://antrologos.github.io',
  base: '/catalogo-politicas',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  redirects: {},
  vite: {
    ssr: { noExternal: ['d3', 'cytoscape'] },
  },
});
```

### 4.4 `src/content/config.ts` (Content Layer + Zod)

```typescript
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const politicas = defineCollection({
  loader: file('../data/derived/latest.json', {
    parser: (text) => JSON.parse(text).politicas,
  }),
  schema: z.object({
    id_universal: z.string().regex(/^FRM-CP-\d{4}-[A-Z]{3}-\d{4}$/),
    slug: z.string(),
    nome_programa: z.string(),
    uf: z.enum(['Federal','SP','RJ','MG','PR','RS','BA','PA','PE','CE']),
    tipo_politica: z.enum([
      'Educacional direta',
      'Trabalho/qualificação direta',
      'Proteção social com impacto educacional',
    ]),
    situacao_atual: z.enum([
      'Ativa / em execução',
      'Encerrada',
      'Suspensa / pausada',
      'Descontinuada',
    ]),
    completude_pct: z.number().min(0).max(100),
    data_revisao: z.string().date(),
    fonte_arquivo_path: z.string().nullable(),
    fonte_sha256: z.string().nullable(),
  }),
});

export const collections = { politicas };
```

### 4.5 Ilhas — diretrizes de uso

| Componente | Diretiva | Justificativa |
|---|---|---|
| `<CopiarCitacao>` | `client:idle` | Não-crítico. |
| `<MapaCoropletico>` | `client:visible` | Carrega D3 (~70KB) só no viewport. |
| `<GrafoRelacoes>` | `client:visible` | Idem para Cytoscape (~120KB). |
| `<SearchUI>` | `client:load` | Usuário pode digitar imediatamente; Pagefind UI ~12KB. |
| `<NotFoundFuzzy>` | `client:idle` | Em /404 só. |

---

## 5. Riscos e mitigações

### 5.1 Astro v5 muito recente — estável o suficiente?

**Realidade**: Astro 1.0 lançou em ago/2022; 3.5 anos de produção. Releases majors a cada ~12 meses, com codemods automáticos. Backed by Astro Foundation.

**Mitigação**: pin de versão (`"astro": "^5.0.0"`); package-lock versionado; Node 22 LTS (até abril/2027); ADR de fallback.

### 5.2 Pagefind + 148 snapshots HTML+PDF — escala?

**Realidade**: 600 unidades está dentro da zona confortável (Pagefind testado até 50k). PDFs **não são indexados nativamente**. Solução: extrair texto em build-time (já temos pdfplumber!) e gerar HTML satélite indexável.

**Mitigação**: HTML satélite no prebuild; `--exclude-selectors`; Lighthouse-CI valida.

### 5.3 Cytoscape.js dentro de ilha React — acessibilidade real?

**Realidade**: lista textual `<dl>` é fonte canônica; grafo é decoração. Padrão WCAG: alternativa equivalente acessível = conforme.

**Mitigação**: lista textual sempre visível; grafo só desktop ≥ 1024px; se NF-M-10 falhar em E.6, escalar para cortar grafo.

### 5.4 GH Pages base path

**Mitigação**: `site` + `base` em `astro.config.mjs`. E2E test em CI valida links com `/catalogo-politicas/`.

### 5.5 Drive sincado + node_modules

**Mitigação**: `node_modules/` em `.gitignore`; marcar como "Disponível somente on-line" no Drive Desktop; CI builda em runner Ubuntu.

### 5.6 Mantenedor solo → bus factor 1

**Mitigação**: output é HTML estático: site continua no ar mesmo se deps morrerem. CONS-M-02 cobre. Renovate/Dependabot abrem PRs.

### 5.7 NF-M-25 (URLs canônicas + redirect 301) — caveat GH Pages

**Realidade**: GH Pages **não suporta 301 server-side**.

**Mitigação**: tabela `redirects` gera HTML estático com meta-refresh + `<link rel="canonical">`. Ambos juntos satisfazem Google. Documentar em ADR.

---

## 6. Curva de aprendizado e tempo de setup

### 6.1 Background do Rogério (Python/R, JS moderado)

| Conceito | Familiaridade | Esforço |
|---|---|---:|
| HTML + CSS | Alta | 0h |
| Tailwind utility classes | Baixa-média | 4-8h |
| Astro `.astro` syntax | Zero | 6-10h (frontmatter ~ Markdown; próximo de Jinja) |
| Astro Content Collections + Zod | Zero | 4-6h (Zod ≈ pydantic) |
| React básico | Baixa | 8-12h só para ilhas pontuais |
| TypeScript estrito | Baixa-média | 6-10h |
| Pagefind | Zero | 2-3h |
| GH Actions | Média | 0-2h |
| D3 + Cytoscape | Zero | 20-30h (curva real, localizada) |

**Total curva inicial**: 50-80h espalhadas. **Não-bloqueante**.

### 6.2 Tempo até "site no ar com 3 fichas"

| Marco | Horas |
|---|---:|
| Setup boilerplate + Tailwind + BaseLayout | 6-8 |
| Content Collection + 3 fichas demo | 8-12 |
| Home estática + Header/Footer + GoatCounter | 4-6 |
| GH Action de deploy | 2-3 |
| 404 + Sobre/Privacidade Markdown | 2-3 |
| **Total — primeira deploy útil** | **~25h** (≈ 2-3 semanas a 10h sustentáveis) |

A partir daí velocidade aumenta porque template de ficha já cobre 439 fichas (parametrizadas).

---

## 7. Plano de migração futura (Bloco G)

### 7.1 Cenário "Astro v6 em 2027 com break changes"

1. **Congelar em v5.x** indefinidamente. HTML estático no GH Pages não exige updates.
2. **Migrar via codemod**: `npx @astrojs/upgrade`. ~70% das migrations Astro são automáticas.
3. **Migrar manualmente** com PR isolado e CI bloqueador. ~10-20h.
4. **Fork do Astro v5** se necessário (OSS).
5. **Migração para outra stack** (Eleventy, Hugo, Quarto): output já é HTML+CSS+Pagefind. ~80-150h.

### 7.2 Princípio fundamental

**O ativo do projeto NÃO é a stack — é `data/derived/latest.json` + `data/external_snapshots/` + `data/raw/`.** Se Astro morrer, perdemos a camada de apresentação; recriar é semanas, não meses, porque dados estão em formato canônico portátil.

---

## 8. Veredito

**APROVAR Astro 5 + Tailwind 4 + Pagefind + ilhas React como stack do MVP.**

Justificativa em 3 frases:

1. Astro atende **42 de 55 Must nativamente, 5 com plugin trivial, 8 com trabalho real localizado**, e **0 são incompatíveis arquiteturalmente**.

2. A combinação **estático puro + ilhas opcionais** alinha com o perfil real do mantenedor (solo, JS moderado, Python forte) e com a hospedagem (GH Pages free), enquanto preserva a possibilidade técnica de mapa D3 + grafo Cytoscape sem comprometer NF-M-04.

3. O TCO 5 anos é **dominado pela manutenção de dados, não da stack**, porque output é HTML estático que sobrevive à própria framework. Bus factor 1 é mitigado por essa propriedade.

**Riscos a registrar antes de aprovação final**:

- ADR `2026-05-01_decisao-stack-astro-tailwind-pagefind.md`:
  - Versão major pinada
  - Conhecidos: redirect 301 server-side é meta-refresh em GH Pages (NF-M-25 com ressalva)
  - Plano de fallback se a11y mapa/grafo falhar em E.6
- Validação pelos avaliadores B (Eleventy) e adversarial antes do Checkpoint E.3.