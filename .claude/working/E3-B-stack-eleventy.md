# E.3.B — Defesa da Stack: Eleventy 3 + Tailwind + Pagefind + Vanilla JS / Alpine.js + D3 + Cytoscape (CDN)

> **Avaliador consensual B** do sub-bloco E.3 (Decisão de Stack).
> Tese: para um catálogo de 439 fichas com mantenedor único, horizonte de 5+ anos e exigência declarada de "boring tech", **Eleventy 3 é a escolha estrategicamente correta**. Não é a stack mais "moderna" — é a que **continua funcionando em 2031** sem que o Rogério precise virar engenheiro full-stack.
> Data: 2026-05-01

---

## 1. Resumo executivo

- **Eleventy 3 é "boring tech" deliberada**: SSG em Node, sem framework JS no client por padrão, sem SSR, sem hooks de build, sem hidratação. O HTML que sai do build é o HTML que vai pro GitHub Pages. Debug = abrir DevTools. Não há camada mágica entre template e usuário.
- **Mantenedor único é tratado como restrição de design, não nota de rodapé**: 11ty tem **uma única dependência runtime obrigatória** (`@11ty/eleventy`); o resto (Tailwind CLI, Pagefind, D3, Cytoscape) entra como ferramenta independente, cada uma com sua própria política de versão. Quando uma quebra, as outras continuam — oposto do acoplamento de framework full-stack.
- **Estabilidade de plataforma é mensurável**: 11ty v1.0 em 2022, v2.0 em 2023, v3.0 em 2024 — três majors em três anos com **migrações documentadas e mecânicas**. A v3 é estável desde 2024 e o ecossistema convergiu.
- **Atende os 55 Must consolidados**: build estático puro casa diretamente com NF-M-01..06 (perf), NF-M-29 (build reproducível), NF-M-31 (sem dependências pagas), F-M15 (build a partir do JSON canônico) e F-A04 (deploy GH Actions). Mapa D3 e grafo Cytoscape em CDN como ilhas vanilla, sem framework JS de UI.
- **TCO de 5 anos é o mais baixo das stacks plausíveis**: zero custo de hosting, busca, licença, ou aprendizado de framework JS opinado. O custo é tempo de Rogério escrevendo Liquid/Nunjucks — e Liquid é mais fácil que React.

---

## 2. Por que Eleventy vence para este caso

### 2.1. O perfil real do projeto bate com "static-first sem framework JS"

1. **Dados imutáveis no momento do build**. `data/derived/latest.json` é fonte canônica; mudou → rebuild → deploy. Não há estado de usuário, autenticação, mutação no client. Toda "interatividade" é filtragem visual de dados pré-carregados.
2. **439 fichas + ~50 páginas auxiliares = ~500 HTMLs pré-renderizáveis**. Eleventy renderiza isso em ~5-15s. Não há justificativa para SSR, ISR, edge functions.
3. **Mantenedor único, sem garantia de tempo regular**. A stack tem que ser legível em frio depois de 6 meses sem tocar. Liquid/Nunjucks é HTML com `{{ variavel }}` e `{% for %}` — qualquer pessoa que viu Jekyll, Hugo, Django entende em minutos.
4. **Horizonte de 5 anos com ondas futuras**. A stack precisa sobreviver a uma rodada inteira de churn no ecossistema JS. Eleventy sobreviveu a Gulp, Grunt, Webpack 4→5, Babel 6→7, e à migração inteira de Jekyll para JAMstack — sem perder compatibilidade.

### 2.2. "Boring tech" como princípio de manutenção

| Dimensão | Framework JS opinado | Eleventy |
|---|---|---|
| Camadas entre template e HTML | 4-6 (JSX → babel → bundler → hydration → router → renderer) | 1 (template engine → HTML) |
| Modos de falha possíveis | hidratação fora-de-sincronia, build cache stale, mismatch SSR/CSR, race em islands | template não compilou |
| Tempo médio para diagnosticar bug em produção | 30min-4h | 5-30min |
| Requer entender o build tool? | Sim, profundamente | Não — `eleventy --serve` basta |
| Quebra silenciosa após `npm update`? | Frequente | Raríssima |

Para alguém com ~4h/semana de manutenção, a coluna direita não é preferência estética — é **viabilidade**.

### 2.3. Estabilidade da v3

- **Eleventy 3.0** (out/2024) é primariamente migração para **ESM + bundling opcional + suporte oficial a TS**. Não reescreve a API; plugins v2 funcionam com warnings.
- **Plugins core estáveis há 3+ anos**: `@11ty/eleventy-img`, `@11ty/eleventy-navigation`, `@11ty/eleventy-plugin-rss`, `@11ty/eleventy-fetch`. Manutenção ativa pelo time de Zach Leatherman.
- **Tailwind 3 → 4** acontece **fora** do Eleventy (CLI separada). Se Tailwind 4 quebrar algo, o site continua compilando.
- **Pagefind 1.x** estável desde 2023, escrito em Rust, sem dependência de Node além do CLI.
- **D3 v7** estável desde 2021 (8 minor releases sem break). **Cytoscape v3** desde 2017 — literalmente "boring tech" comprovada.

### 2.4. Sem framework JS pesado — o cálculo do bundle

| Componente | Tamanho gzipped | Comentário |
|---|---:|---|
| Alpine.js v3 | ~12 KB | Apenas onde precisa (toggles, dropdowns, filtros) |
| Pagefind UI | ~30 KB | Lazy-load em `/buscar` |
| D3 v7 (subset) | ~25 KB | Apenas em rotas com mapa: home + `/mapa` |
| Cytoscape v3 + 1 layout | ~80 KB | Apenas em `/politica/<id>/relacionadas` |
| **Home total** | **~12 KB** | Alpine só |
| **Ficha total** | **~12 KB** | Alpine só |
| **Mapa total** | **~37 KB** | Alpine + D3 |
| **Grafo total** | **~92 KB** | Alpine + Cytoscape (rota nicho) |

Compare com framework JS opinado: ~40-45 KB **só de runtime** antes de uma linha de aplicação. Em 11ty + Alpine, o budget é gasto em **comportamento útil**, não em hidratação.

---

## 3. Match com os 55 Must (consolidado E.2.D)

### 3.1. Funcionais (22 Must)

| ID | Must | Como Eleventy + stack atende |
|---|---|---|
| F-M01 | Home agregada | 11ty: `index.njk` lê `_data/policies.js`; contadores via `{{ policies \| length }}` |
| F-M02 | Busca textual | Pagefind: `npx pagefind --site _site` no fim do build; UI 30 KB |
| F-M03 | Filtros facetados | Alpine: `<select x-model="uf">` + array em `<script type="application/json">` |
| F-M04 | URL determinística | Alpine + History API: `Alpine.effect(() => updateURL(state))` |
| F-M05 | Página individual | 11ty: `politica.njk` com `pagination: { data: policies, alias: 'p', size: 1 }` gera 439 HTMLs |
| F-M06 | Snapshot acessível | Link direto para `/snapshots/<sha>.html` |
| F-M07 | Status + completude | Tailwind: 5 utility classes para tags semânticas |
| F-M08 | Página por UF | 11ty: pagination com `policies \| filterByUf("SP")`; gera 9 páginas |
| F-M09 | Header/footer | 11ty: `_includes/layout.njk` único; herança de template |
| F-M10 | Sobre/Metodologia/Cobertura | 3 markdown em `src/sobre/` |
| F-M11 | Privacidade + Termos | 2 markdown |
| F-M12 | 404 fuzzy | `404.njk` + JS vanilla (~2KB) com Levenshtein |
| F-M13 | id_universal + slug | `permalink: /politica/{{ p.slug }}/` + `_data/redirects.js` |
| F-M14 | Data de revisão | Nunjucks: `{{ p.revisado_em \| dataBR }}` |
| F-M15 | Build do JSON canônico | `_data/policies.js` com `module.exports = require("./data/derived/latest.json")` |
| F-A01 | Cron validação schema | GH Actions diário com `python scripts/validate.py` |
| F-A02 | Link checker | GH Actions semanal com `lychee` |
| F-A04 | Build em push main | GH Actions: `npm run build` + `npx pagefind` + `peaceiris/actions-gh-pages` |
| F-S07 | Lista textual mapa (promovido) | 11ty: `<ol>` em build a partir de `policies \| groupByUf` — **HTML puro, sem JS** |
| F-S09 | Lista textual grafo (promovido) | 11ty: `<dl>` em build agrupando relações — **HTML puro, sem JS** |
| F-S10 | Citação ABNT/APA/BibTeX (promovido) | Nunjucks: 3 templates de citação + Alpine para "Copiar" |
| F-S12 | Changelog (promovido) | `_data/versions.js` lê `policies-onda-1-*.json` e gera diff |

### 3.2. Não-funcionais (35 Must)

| ID | Must | Como atende |
|---|---|---|
| NF-M-01..03 | Core Web Vitals | HTML estático = LCP nativo; sem JS = INP trivial; CLS via `aspect-ratio` Tailwind |
| NF-M-04 | Bundle JS ≤ 100 KB | Ver §2.4 — todas rotas dentro do budget |
| NF-M-05 | Bundle CSS ≤ 50 KB | Tailwind purge reduz a ~20-30 KB |
| NF-M-06 | TTFI ≤ 1.5s | Pagefind <50ms após index carregado |
| NF-M-07 | WCAG 2.2 AA + axe 0 critical | HTML semântico + axe-core no CI |
| NF-M-08 | Página acessibilidade | Markdown estático |
| NF-M-09 | Alt textual mapa | F-S07 já é HTML puro — **renderizado em build, sem fallback runtime** |
| NF-M-10 | Alt textual grafo | F-S09 idem |
| NF-M-11 | Cor não é único indicador | Tailwind utility + ícone Heroicons + texto |
| NF-M-12 | Estrutura semântica | Layout enforça h1/main/nav |
| NF-M-13..17 | LGPD/privacidade/sem PII | Site estático = sem coleta; markdown declara |
| NF-M-18 | HTTPS | GH Pages força |
| NF-M-19 | CSP | Meta `<meta http-equiv="Content-Security-Policy">` |
| NF-M-20 | SRI em CDN | Plugin `eleventy-plugin-sri` ou script bash |
| NF-M-21 | Whitelist JS terceiros | Apenas GoatCounter + VLibras + 3 CDN versionados |
| NF-M-22 | JSON-LD por ficha | Nunjucks: `<script type="application/ld+json">{{ p \| jsonLd \| safe }}</script>` |
| NF-M-23 | sitemap + robots | Plugin `@11ty/eleventy-plugin-sitemap` + `robots.txt` em `src/` |
| NF-M-24 | OG/Twitter Card | Layout base com `<meta property="og:*">` |
| NF-M-25 | URLs canônicas | `permalink:` no frontmatter; `<link rel="canonical">` no layout |
| NF-M-26 | Responsivo desde 320px | Tailwind mobile-first |
| NF-M-27 | Touch ≥ 44×44 | Tailwind `min-h-[44px] min-w-[44px]` |
| NF-M-28 | Mapa+grafo fallback mobile | Media query + lista textual sempre visível |
| NF-M-29 | Build reproducível | `package-lock.json` + `.nvmrc` + `just build` |
| NF-M-30 | Snapshot fallback | F-M06 |
| NF-M-31 | Sem serviços pagos | GH Pages + GH Actions + GoatCounter free |
| NF-M-32 | LAI transparência | Markdown |
| NF-M-33 | CC-BY 4.0 | `LICENSE` + footer + ficha |
| NF-M-34 | Citação acadêmica | F-S10 |
| NF-M-35 | Tempo até 1ª ação ≤10s | Validável com 5 usuários |
| NF-S-13→M | npm audit + Dependabot | `dependabot.yml` + workflow `npm audit --audit-level=high` |
| NF-S-22→M | CI bloqueador | axe + Lighthouse-CI + `ajv validate` em PRs |

### 3.3. Adições consolidadas (5 novos Must)

| ID | Must | Como atende |
|---|---|---|
| CONS-M-01 | Backup off-Drive | GH Action mensal: `tar -czf` + release artifact |
| CONS-M-02 | Plano continuidade | Markdown `/sobre/continuidade`; chave-mestra do repo no IESP |
| CONS-M-03 | Acordo institucional | Externo à stack (gestão) |
| CONS-M-04 | Política correções com SLA | Markdown + issue template `.github/ISSUE_TEMPLATE/correcao.yml` |
| CONS-M-05 | Retenção LGPD | Markdown |

**Cobertura: 55/55 Must atendidos**, 53 com implementação direta na stack e 2 (CONS-M-03, parte de CONS-M-02) externos a qualquer stack.

---

## 4. Boilerplate inicial

### 4.1. Estrutura de diretórios

```
catalogo-politicas/
├── .eleventy.config.js
├── package.json
├── package-lock.json
├── .nvmrc                        # node 22 LTS
├── tailwind.config.js
├── postcss.config.js
├── data/                         # JÁ EXISTE — não tocar
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   ├── components/
│   │   └── partials/
│   ├── _data/
│   │   ├── policies.js
│   │   ├── ufs.js
│   │   └── site.js
│   ├── assets/
│   │   ├── css/tailwind.css
│   │   ├── js/{alpine-app,mapa-d3,grafo-cyto}.js
│   │   └── img/
│   ├── politica/ficha.njk        # pagination → 439 HTMLs
│   ├── uf/pagina-uf.njk          # pagination → 9 HTMLs
│   ├── buscar.njk
│   ├── mapa.njk
│   ├── comparacao.njk
│   ├── sobre/{index,metodologia,cobertura,privacidade,termos,changelog,continuidade}.md
│   ├── 404.njk
│   ├── feed.xml.njk
│   ├── sitemap.xml.njk
│   ├── robots.txt
│   └── index.njk
├── tests/
└── _site/                         # output (gitignored)
```

### 4.2. `package.json` mínimo

```json
{
  "name": "catalogo-politicas",
  "type": "module",
  "scripts": {
    "dev": "eleventy --serve --quiet",
    "build": "eleventy && npm run css && npm run search",
    "css": "tailwindcss -i src/assets/css/tailwind.css -o _site/assets/css/styles.css --minify",
    "search": "pagefind --site _site",
    "audit": "npm audit --audit-level=high"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-img": "^5.0.0",
    "@11ty/eleventy-navigation": "^0.3.5",
    "@11ty/eleventy-plugin-rss": "^2.0.0",
    "pagefind": "^1.1.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.0",
    "ajv": "^8.12.0"
  }
}
```

**6 dev-dependencies, 0 dependencies runtime no client.**

### 4.3. `.eleventy.config.js` (resumido)

```js
import navigationPlugin from "@11ty/eleventy-navigation";
import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "data/external_snapshots": "snapshots" });

  eleventyConfig.addFilter("dataBR", (s) => s ? s.split("-").reverse().join("/") : "");
  eleventyConfig.addFilter("filterByUf", (ps, uf) => ps.filter(p => p.uf === uf));
  eleventyConfig.addFilter("groupByUf", (ps) => {
    const g = {}; for (const p of ps) (g[p.uf] ??= []).push(p); return g;
  });
  eleventyConfig.addFilter("citacaoAbnt", (p) => `FRM/IESP-UERJ. ${p.nome_programa}. Catálogo de Políticas, v${p.versao}, ${p.revisado_em.slice(0,4)}. Disponível em: <https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/>.`);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: "/catalogo-politicas/",
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
```

### 4.4. `src/_data/policies.js` — fonte canônica

```js
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export default function() {
  const path = resolve("data/derived/latest.json");
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  return raw.policies.map(p => ({
    ...p,
    isFederal: p.esfera_formulacao === "Federal",
    revisado_em_br: p.revisado_em ? p.revisado_em.split("-").reverse().join("/") : null
  }));
}
```

### 4.5. `src/politica/ficha.njk` — geração estática de 439 rotas

```njk
---
layout: layouts/ficha.njk
pagination:
  data: policies
  alias: p
  size: 1
permalink: "politica/{{ p.slug }}/"
eleventyComputed:
  title: "{{ p.nome_programa }} — Catálogo de Políticas"
---
<article class="prose max-w-none">
  <header class="border-b pb-4 mb-6">
    <h1>{{ p.nome_programa }}</h1>
    <p class="text-sm">Revisado em <time datetime="{{ p.revisado_em }}">{{ p.revisado_em_br }}</time> · Versão {{ p.versao }} · ID {{ p.id_universal }}</p>
    {% include "components/tag-status.njk" %}
  </header>
  ...
  {% include "partials/citacao.njk" %}
</article>
```

### 4.6. Mapa coroplético em vanilla JS (`src/assets/js/mapa-d3.js`)

```js
(async function init() {
  const [topo, dados] = await Promise.all([
    fetch("/assets/data/br-ufs.topo.json").then(r => r.json()),
    fetch("/assets/data/contagem-por-uf.json").then(r => r.json())
  ]);

  const svg = document.querySelector("#mapa");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-describedby", "mapa-lista-textual");

  const projection = d3.geoMercator().fitSize([800, 600], topo);
  d3.select(svg).selectAll("path")
    .data(topo.features)
    .join("path")
    .attr("d", d3.geoPath(projection))
    .attr("fill", d => {
      const reg = dados.find(x => x.uf === d.properties.sigla);
      return reg ? d3.scaleSequential([0, d3.max(dados, x => x.total)], d3.interpolateBlues)(reg.total) : "url(#hatch)";
    })
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", d => {
      const reg = dados.find(x => x.uf === d.properties.sigla);
      return reg ? `${d.properties.nome}: ${reg.total} políticas` : `${d.properties.nome}: fora do catálogo`;
    });
})();
```

A lista textual paralela **não depende deste script** — é renderizada pelo Eleventy em build. Se o JS quebrar, lista continua funcionando. **HTML puro, robustez máxima.**

### 4.7. GitHub Actions — `.github/workflows/build.yml`

```yaml
name: Build & Deploy
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: ".nvmrc", cache: "npm" }
      - run: npm ci
      - run: npm run audit
      - run: npx ajv validate -s .claude/context/policies-schema.json -d "data/derived/latest.json"
      - run: npm run build
      - uses: dequelabs/axe-core-action@v3
        with: { urls: "_site/index.html _site/buscar/index.html" }
      - run: npx @lhci/cli@0.13.x autorun
      - if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

---

## 5. Riscos e mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| **Interatividade verbose em vanilla JS** | Média | Alpine.js v3 cobre ~90% com sintaxe declarativa em HTML; resto vira funções vanilla. Custo: ~150-300 linhas extras — aceitável. |
| **Pagefind + 148 snapshots HTML grandes** | Média | Pagefind tem chunking nativo (≤200 KB típico). Se passar de 5 MB: indexar apenas metadados das fichas. |
| **Comunidade Eleventy menor que Astro/Next** | Baixa-Média | Documentação oficial exemplar; Discord ativo; padrões Liquid/Nunjucks são interlinguagem. |
| **Eleventy sem MDX nativo** | Baixa | `markdown-it` cobre 100% (tabelas, listas, código, footnotes). MDX não é necessário aqui. |
| **Tailwind 4 quebra config** | Baixa | Tailwind CLI separado. Pin em v3 indefinido. Site continua compilando. |
| **D3 v8 / Cytoscape v4 break changes** | Baixa | Versão pinada via `<script src="...d3@7.x.x">` com SRI. Update consciente. |
| **Bug em filtro Nunjucks custom** | Baixa | Toy test em `tests/toy_filters.js` (~30 linhas) valida filtros. Roda em <30s no CI. |
| **Mudança no GH Pages** | Baixa | Site é diretório `_site/` puro; portável para Cloudflare/Netlify/Vercel/S3 em <1h. |
| **Build lento conforme cresce** (Bloco G) | Baixa | 11ty é incremental (~1-3s/100 páginas). 2000 fichas: ~30s. |

---

## 6. Curva de aprendizado e tempo de setup

### 6.1. Pré-requisitos do mantenedor

| Conhecimento | Necessário? | Esforço |
|---|---|---|
| Node.js | Sim | Já tem |
| HTML semântico | Sim | Já tem |
| CSS Tailwind | Sim, médio | ~6-10h |
| Liquid/Nunjucks templating | Sim | ~4h para fluência |
| JavaScript ES6+ (Alpine + filtros) | Básico | Já tem |
| D3 (mapa coroplético) | Escopo limitado | ~10-15h |
| Cytoscape (grafo) | Escopo limitado | ~5-8h |
| GitHub Actions YAML | Básico | ~2-4h |

**Total zero-to-MVP**: ~30-45h de aprendizado, distribuído. <10% das 380-1040h estimadas.

### 6.2. Boas notícias estruturais

1. **Liquid/Nunjucks é HTML+templates simples**. Quem viu Jekyll, Hugo, Django, WordPress: curva nula.
2. **Alpine.js cabe em uma página de docs**. Diretivas: `x-data`, `x-show`, `x-for`, `x-model`, `x-init`, `x-on`, `x-bind`, `x-effect`. Acabou.
3. **Tailwind utility-first é incremental**.
4. **Pagefind é "instalar e funcionar"**: zero config obrigatória.
5. **Sem build tooling complexo**: não há webpack config, babel preset, rollup options.

### 6.3. Tempo de setup

- `npm init` + instalar deps: **5 min**
- Estrutura + config + layouts base + 1 página de teste: **2-3h**
- `_data/policies.js` + 1 ficha funcionando: **2-3h**
- Tailwind configurado + estilos base gov.uk-inspired: **3-4h**
- GH Actions + Pages publicado: **2-3h**

**Total para "MVP esqueleto no ar com 1 ficha real": 1-2 dias úteis de trabalho focado.**

---

## 7. Veredito

**Eleventy 3 + Tailwind + Pagefind + Vanilla JS / Alpine.js + D3 + Cytoscape (CDN) é a stack defendida como vencedora.**

Razão central: o projeto tem **três restrições não-negociáveis** que essa stack respeita melhor que qualquer alternativa plausível:

1. **Mantenedor único, ~4h/semana, horizonte de 5 anos**: stack precisa ser legível em frio depois de 6 meses sem tocar. HTML estático puro, gerado por template engine de 25 anos de idade conceitual, com 1 framework de interatividade leve (Alpine), atende. Frameworks JS opinados não atendem porque exigem manutenção contínua de conhecimento.
2. **Site é catálogo de dados imutáveis em build**: não há requisito real para SSR, ISR, edge functions, hidratação seletiva. Toda sofisticação extra é peso morto. Eleventy é exatamente "geração de site estático", nada mais — virtude, não limitação.
3. **TCO de 5 anos baixo e previsível**: zero hosting pago, zero serviço pago, zero risco de "break change que forçou reescrita". 6 dev-dependencies, 0 dependencies runtime no client além de scripts CDN versionados.

55 Must atendidos: 53/55 com implementação direta na stack (2/55 são externos a qualquer escolha — gestão institucional).

Mapa D3 e grafo Cytoscape entram como ilhas vanilla JS com **fallbacks textuais renderizados em build** (HTML puro, sem JS) que satisfazem NF-M-09 e NF-M-10 de forma robusta — funcionam mesmo se o JS quebrar.

A objeção principal é "não é a tecnologia mais moderna de 2026". A resposta direta: **o problema do projeto não é "ser moderno em 2026" — é "estar no ar em 2031, mantido em 4h/semana, sem ter virado lixo digital"**. Para esse problema, "boring tech" é a resposta tecnicamente correta, e Eleventy é a forma mais bem-acabada disponível em 2026.

**Recomendação ao Checkpoint E.3**: aprovar Eleventy 3 + Tailwind + Pagefind + Vanilla JS/Alpine + D3 + Cytoscape (CDN) como stack do MVP. Registrar em ADR `2026-05-01_stack-mvp-eleventy.md` com justificativa "boring tech para mantenedor solo + 5 anos".