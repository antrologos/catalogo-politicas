# Plano: PoC empírico Eleventy 3 + Tailwind + Pagefind

**Status**: RASCUNHO
**Data**: 2026-05-01
**Bloco/Rodada**: E · E.3 (sub-bloco PoC)

## Contexto

Decisão E.3 da usuária: **fazer PoC empírico de 12-16h antes de escolher stack final**. Adversarial recomendou Eleventy como default; PoC valida ou rejeita.

Métrica-chave única declarada pela usuária: **tempo de implementação real ≤ 16h** define aprovação. Lighthouse, bundle, a11y, build time são medidos mas não bloqueiam — são insumo para decisão informada.

## Objetivo

Validar empiricamente se Eleventy 3 + Tailwind + Pagefind + Alpine consegue produzir esqueleto funcional do catálogo em ≤16h de trabalho focado, atendendo um subset crítico dos 55 Must.

## Critério de "PoC aprovado"

Esqueleto no ar em `antrologos.github.io/catalogo-politicas/` com TODOS os itens abaixo:

1. ✅ 10 fichas reais geradas a partir de `data/derived/latest.json` (não mock)
2. ✅ Home agregada com contadores (439 / 9 UFs+Federal / data revisão)
3. ✅ Página de busca Pagefind funcionando (sem facetas no PoC)
4. ✅ Página 404 estática
5. ✅ Página `/sobre/privacidade` (markdown)
6. ✅ GH Action de build + deploy publicando no GH Pages
7. ✅ Build local roda em ≤30s
8. ✅ Lighthouse mobile na Home: Perf ≥80 (alvo 90, mas PoC pode ser parcial)
9. ✅ Tempo total de implementação ≤16h (incluindo investigação, debug, learning curve)

Se 1-7 sim mas tempo estourar 16h: **PoC FALHA, partir para PoC Astro** (significa que estimativa Eleventy era otimista).

Se 1-7 não: **PoC FALHA por incompletude**, investigar onde travou.

Se todos sim e em ≤16h: **PoC APROVADO, Eleventy é a stack final do MVP**.

## Abordagem

### Etapa 1 — Setup boilerplate (alvo 3-4h)
- Criar `site/` na raiz do projeto
- `npm init -y` + `package.json` ESM
- Instalar dependências: `@11ty/eleventy@^3`, `@11ty/eleventy-img`, `@11ty/eleventy-navigation`, `@11ty/eleventy-plugin-rss`, `pagefind`, `tailwindcss@^3`, `@tailwindcss/typography`, `ajv`, `alpinejs`
- `.nvmrc` (node 22 LTS)
- `tailwind.config.js` + `postcss.config.js` + `src/assets/css/tailwind.css` com paleta gov.uk-inspired (#0066cc + #00b050 + #c00000 + #ffdd00 + #0a7a7a)
- `.eleventy.config.js` com filtros mínimos (`dataBR`, `filterByUf`)
- Gitignore: `node_modules/`, `_site/`, `pagefind/`, `*.log`

### Etapa 2 — Dados + Layouts base (alvo 2-3h)
- `src/_data/policies.js` lendo `../../data/derived/latest.json` e filtrando 10 fichas (1 federal + 9 estaduais — 1 por UF)
- `src/_data/site.js` com config global (title, base URL, etc)
- `src/_includes/layouts/base.njk` — header sticky + footer com licença CC-BY 4.0
- `src/_includes/components/header.njk`, `footer.njk`, `tag-status.njk`

### Etapa 3 — Páginas core (alvo 3-4h)
- `src/index.njk` (Home agregada com contadores)
- `src/politica/ficha.njk` (pagination → 10 HTMLs, layout completo da ficha com snapshot link)
- `src/buscar.njk` (input + Pagefind UI básico)
- `src/404.njk` (estática)
- `src/sobre/privacidade.md` (markdown LGPD básico)

### Etapa 4 — GH Action + Pagefind (alvo 2-3h)
- `.github/workflows/poc-deploy.yml` (Node 22 LTS + npm ci + build + Pagefind + deploy GH Pages)
- Configurar GH Pages settings (source: GH Actions, branch padrão)
- Validar deploy local primeiro (`npx eleventy --serve`)
- Push para branch `poc-eleventy` para testar Action

### Etapa 5 — Validação (alvo 2-3h)
- Lighthouse mobile na Home + 1 ficha + busca (script `npx lhci collect`)
- axe-core via Playwright (1 página) — opcional se sobrar tempo
- Bundle size: medir CSS final + JS Alpine + Pagefind UI
- Documentar tempo real gasto por etapa

### Etapa 6 — Relatório (alvo 1h)
- Salvar `g:/Drives compartilhados/FRM_CatalogoPoliticas/.claude/working/E3-D-poc-eleventy-resultado.md`
- Estrutura: tempo real vs estimado por etapa, métricas Lighthouse, bundle, decisão APROVADO/FALHA, próximo passo

**Total estimado**: 13-18h. Buffer de 2h dentro do alvo de 16h.

## Arquivos a criar

```
g:/Drives compartilhados/FRM_CatalogoPoliticas/
├── site/                              # NOVO
│   ├── .nvmrc
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json (gerado)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eleventy.config.js
│   ├── src/
│   │   ├── index.njk
│   │   ├── 404.njk
│   │   ├── buscar.njk
│   │   ├── _data/
│   │   │   ├── policies.js
│   │   │   └── site.js
│   │   ├── _includes/
│   │   │   ├── layouts/
│   │   │   │   ├── base.njk
│   │   │   │   └── ficha.njk
│   │   │   └── components/
│   │   │       ├── header.njk
│   │   │       ├── footer.njk
│   │   │       └── tag-status.njk
│   │   ├── politica/
│   │   │   └── ficha.njk
│   │   ├── sobre/
│   │   │   └── privacidade.md
│   │   └── assets/
│   │       └── css/tailwind.css
│   └── _site/                         # output gitignored
└── .github/
    └── workflows/
        └── poc-deploy.yml             # NOVO
```

## Arquivos que NÃO serão tocados

- `data/raw/Fichas das Políticas - 1ª onda.xlsx` (fonte primária imutável)
- `data/derived/*.json` (apenas LIDO, não escrito)
- `data/external_snapshots/**` (apenas referenciado por path, não copiado para PoC)
- `scripts/etl/**` (pipeline ETL existente)
- `scripts/captura/**` (skill capturar-norma)
- `.claude/rules/**`
- `.claude/skills/**`
- `.claude/hooks/**`
- `.claude/agents/**`
- `.claude/context/**`
- `CLAUDE.md`

## Testes previstos

- Toy test: `tests/toy_filters.js` validando filtros Nunjucks customizados (`dataBR`, `filterByUf`)
- Smoke test manual: `npx eleventy --serve` + abrir localhost:8080 + clicar 3 fichas + buscar 1 termo
- CI test: GH Action deve passar em PR antes de merge para `main`

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Estourar 16h por curva Eleventy/Nunjucks | Limitar escopo a critério mínimo; documentar em E3-D que isso é sinal de estimativa otimista; partir para Astro PoC |
| GH Pages não publicar (config GH Actions) | Testar workflow `pages: write` permission ANTES de tudo; usar action oficial `actions/deploy-pages@v4` |
| Pagefind falhar em escala — mas 10 fichas é trivial, então PoC não testa isso | Anotar como pendência para validar com 100+ fichas em E.6 |
| Drive sync travar com `node_modules/` | Marcar `node_modules/` como "Disponível somente on-line" no Drive Desktop ANTES de `npm install` |
| Conflito de `node_modules` no Drive | Manter `package-lock.json` versionado; rodar `npm ci` em GH Action runner; CI builda |

## Verificação pós-implementação

- [ ] 10 fichas no ar em `antrologos.github.io/catalogo-politicas/politica/<slug>/`
- [ ] Home funcional em `antrologos.github.io/catalogo-politicas/`
- [ ] Busca Pagefind funcional
- [ ] Lighthouse mobile p75: Perf, A11y, BP, SEO medidos e documentados
- [ ] Tempo real por etapa documentado
- [ ] Relatório `working/E3-D-poc-eleventy-resultado.md` salvo
- [ ] MEMORY.md / project_catalogo_politicas.md atualizado com decisão final de stack

## Decisão pendente da usuária ANTES de executar

**Quem executa o PoC?**
- (a) Eu (Claude) executo, com checkpoints a cada etapa para você revisar
- (b) Você (Rogério) executa, eu apenas planejo passo-a-passo
- (c) Híbrido: eu executo etapas 1-4 (técnicas), você executa etapa 5 (Lighthouse manual)

**Push para repo GitHub real?**
- (a) Eu posso fazer push direto para `antrologos/catalogo-politicas` (você confirma credencial)
- (b) Eu preparo tudo localmente, você faz o push manualmente
- (c) Você cria o repo vazio antes; eu envio commits após sua aprovação

**O repo `antrologos/catalogo-politicas` já existe ou precisa criar?**
- Se não existe, precisa decidir nome, visibilidade (público recomendado para projeto open data), README inicial, LICENSE (CC-BY 4.0).

## Status

- [ ] RASCUNHO criado em 2026-05-01
- [ ] APROVADO pela usuária com decisões sobre execução/push/repo
- [ ] PoC executado
- [ ] CONCLUIDO com decisão final de stack