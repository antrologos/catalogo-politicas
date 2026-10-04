# Plano: MVP-UX — Onda V (Visual) + Onda F (Facilidade)

**Status**: APROVADO
**Data**: 2026-05-02
**Bloco/Rodada**: F (pré-F.3) · MVP-UX após 6 rodadas de auditoria/pesquisa/adversarial
**Esforço total estimado**: ~50h (cabe em ~80-160h disponíveis solo até 2026-07-01)
**Insumos**: 7 documentos das 6 rodadas em `.claude/working/ux-rodada-1/` e `.claude/working/ux-rodada-2/`

---

## Contexto

A usuária declarou em 2026-05-01: **"A versão atual do site não está nem bonita, nem muito fácil de usar"**. Após 6 rodadas (R1.1 dois auditores → R1.2 best practices → R1.3 adversarial → R2.1 dois auditores adversariais → R2.2 best practices estendido → R2.3 adversarial final), o diagnóstico convergiu para uma **dupla coordenada**:

- **"Não bonito"** = Open Sans datada + paleta gov.uk-clone (`#0066cc` + `#00b050`) + 26 emojis como ícones funcionais + 3 paradigmas de chips simultâneos
- **"Não fácil"** = busca sem fuzzy/sinônimos + jargão sem glossário + IA pelo vocabulário da planilha-fonte (não pelo modelo mental do usuário) + Zotero não detecta as fichas

**Decisões de escopo da usuária (P1+P2 da R2.3, 2026-05-02):**
- **P1**: nível **MÉDIO** de ambição estética (Onda V ~25h)
- **P2**: `/comparacao/` semântica vai para **backlog pós-bolsista** (com nota visível "em desenvolvimento")

**Cortes explícitos do MVP** (13 itens em R2.3, "Cláusula de saída"): mapa coroplético D3 interativo, grafo Cytoscape, eixos temáticos curados sobre 439 fichas (entram só 33 federais em ~2h), comparação semântica 3-modos, export batch BibTeX/RIS, onboarding wizard, modo escuro, etc.

## Objetivo

Em ~50h sequenciais (Onda V → Onda F com paralelismos onde possível), entregar um site que:

1. **Não pareça mais "demo Bootstrap institucional 2018"** — tipografia, paleta, ícones, gramática de chips refeitos
2. **Pare de quebrar silenciosamente para o usuário leigo** — busca com sinônimos PT-BR, jargão explicado, página "Comece por aqui"
3. **Seja descoberto e citado** automaticamente pelo Zotero/Mendeley + Google Scholar via Highwire meta + Schema.org
4. **Mantenha CI verde** (pa11y AA + Lighthouse ≥ 90 + build < 5s)
5. **Não atrase F.3** (mapa + grafo + DOI + lançamento) além do necessário

## Princípios de execução

- Ordem do DAG da R2.3 é **obrigatória até o Sprint V3** (paleta depende de fonte; chips dependem de fonte+paleta)
- **Sprint 0 (chips) é pré-condição de tudo** na Onda V — pular = retrabalho garantido
- Ondas V e F são **independentes**: F pode começar em paralelo após V0+V1
- **Cada sprint tem critério de pronto verificável** (CI verde + checklist visual + screenshot antes/depois quando muda visual)
- **Antes de mudança visual de impacto** (V1, V2, V3): apresentar screenshot/preview à usuária — porque "bonito" é por percepção (memória `project_avaliacao_site_atual.md`)
- Mantenedor **solo** até 2026-07-01 — qualquer estouro >10h em sprint individual exige novo checkpoint

---

## SPRINT V0 — Sprint 0 chips (pré-condição) — ~12h

**Objetivo**: estabelecer 4 famílias canônicas de chip/badge, eliminando 5 paradigmas conflitantes hoje em uso.

**Famílias finais:**
- `.tag--<status>` (já existe, manter): cor semântica suave por situação (`ativa-em-execucao`, `encerrada`, `descontinuada`, `suspensa-pausada`)
- `.tag--neutral` (NOVO): chip cinza para metadados sem sentido semântico (UF, ano, modalidade)
- `.tag--filter` (NOVO): chip com `aria-pressed` para filtros ativos (com `✕` para remover)
- `.badge--metric` (NOVO): pill com número + unidade (KPIs, contagens, completude%)

**Arquivos a modificar:**
- [site/tailwind.config.js](C:/Users/antro/dev/catalogo-politicas/site/tailwind.config.js) — adicionar tokens dos 3 novos componentes na seção `theme.extend`
- [site/src/assets/css/tailwind.css](C:/Users/antro/dev/catalogo-politicas/site/src/assets/css/tailwind.css) — definir 3 classes nas `@layer components`
- [site/src/_includes/components/tag-status.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/components/tag-status.njk) — manter, validar
- 6 templates onde substituir gramáticas ad-hoc:
  - `_includes/layouts/ficha.njk` (chips do header + Continue explorando)
  - `_includes/layouts/dimensao.njk` (chips de filtros + KPIs)
  - `index.njk` (KPIs + cards do hero)
  - `explorar.njk` (cards + contagens)
  - `comparacao.njk` (chips na tabela — só substituição, não tocar lógica)
  - `_includes/components/footer.njk` (badges)

**Critério de pronto:**
- Visualmente, todo chip/badge no site é uma das 4 famílias
- pa11y-ci verde em ≥5 URLs amostradas
- Screenshot diff: dimensões antes/depois de cada chip estão dentro de ±10% (não bagunça layout)

**Risco**: regressão de layout em 6 templates simultâneos. **Mitigação**: commits por template, validar visualmente cada um antes do próximo.

---

## ONDA V — Estética mínima (~25h)

### Sprint V1 — Tipografia Plex (~4h)

**Objetivo**: substituir Open Sans (datada 2010-2018) por IBM Plex Sans Variable + Plex Serif (display) + Plex Mono (IDs/código).

**Decisões técnicas (validadas em R2.2):**
- Self-host via `@fontsource-variable/ibm-plex-sans` + `@fontsource/ibm-plex-serif` (700 only para H1/hero) + `@fontsource/ibm-plex-mono` (400 only para `<code>`/IDs)
- Total ~80kb woff2 (vs ~50kb Open Sans atual; delta +30kb aceitável)
- `font-display: swap` para evitar FOIT
- Preload das 2 fontes mais usadas (Plex Sans 400 + 600)

**Arquivos a modificar:**
- `site/package.json` — substituir `@fontsource/open-sans` por `@fontsource-variable/ibm-plex-sans` + `@fontsource/ibm-plex-serif` + `@fontsource/ibm-plex-mono`
- [site/tailwind.config.js:43](C:/Users/antro/dev/catalogo-politicas/site/tailwind.config.js#L43) — `sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif']` + adicionar `serif: ['"IBM Plex Serif"', 'Georgia', 'serif']` + `mono: ['"IBM Plex Mono"', 'Consolas', 'monospace']`
- [site/src/assets/css/tailwind.css](C:/Users/antro/dev/catalogo-politicas/site/src/assets/css/tailwind.css) — `@import "@fontsource-variable/ibm-plex-sans"` etc.
- [site/src/_includes/layouts/base.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/layouts/base.njk) — adicionar `<link rel="preload" as="font">` para Plex Sans 400+600
- H1 e hero principal usam `.font-serif` (Plex Serif 700)
- IDs (`{{ p.id_universal }}`, `{{ p.id_interno }}`) e SHA-256 usam `.font-mono`
- **Bonus** (sem custo extra): aplicar `.prose` com `max-w-prose` (65ch) na ficha (corrige ponto cego #7 da R2.3 sobre leitura longa)

**Critério de pronto:**
- Site renderiza com Plex em todas as páginas
- LCP em mobile-3G simulado fica ≤ 2.5s (Lighthouse)
- Bundle Home ≤ 100kb
- Build < 5s
- Screenshot lado-a-lado (antes Open Sans / depois Plex) gerado e arquivado em `.claude/working/mvp-ux/screenshots/v1-tipografia/`

---

### Sprint V2 — Paleta autoral (~6h)

**Objetivo**: substituir paleta gov.uk-clone (`#0066cc` + `#00b050`) por paleta autoral brasileira+editorial.

**Paleta nova:**

| Token | Hex | Uso |
|---|---|---|
| `primary` (azul-IBGE) | `#1A4F8B` | Marca, links, botões primários |
| `primary-dark` | `#11385F` | Hover, ênfase |
| `success` (verde-floresta) | `#0E7B4A` | Status ativa, sucesso |
| `warning` (sienna-acento) | `#C7521C` | Alerta, descontinuada |
| `info` | `#357AB7` | Tags neutras |
| `papel` | `#FAF7F2` | Background principal (substitui branco puro) |
| `tinta` | `#3C342A` | Texto principal (substitui `#0b0c0c`) |
| `neutral-100..900` | mantém escala mas tonalidade morna | Bordas, fundos cards |
| Foco | `#FFB81C` (âmbar editorial em vez de `#ffdd00` neon) | `:focus-visible` |

**Combinações que precisam validar pa11y AA:**
- `#1A4F8B` sobre `#FAF7F2` → ~9.5:1 ✓
- `#0E7B4A` sobre `#FAF7F2` → ~5.8:1 ✓ (AA, AAA falha — aceitável)
- `#C7521C` sobre `#FAF7F2` → ~5.2:1 ✓ (AA, uso <5%)
- `tag--*` (15% opacity bg + dark text) → recalcular caso a caso

**Arquivos a modificar:**
- [site/tailwind.config.js](C:/Users/antro/dev/catalogo-politicas/site/tailwind.config.js) — substituir tokens em `theme.extend.colors`
- [site/src/assets/css/tailwind.css](C:/Users/antro/dev/catalogo-politicas/site/src/assets/css/tailwind.css) — atualizar variantes `.tag--*` para usar `success`/`warning`/`info` novos
- Criar **ADR-011 paleta autoral** em `.claude/decisions/2026-05-02_adr-011-paleta-autoral.md` — documenta que NÃO há padrão BR canônico (R2.2 confirmou) e a paleta é decisão editorial, não cópia de Fiocruz/IBGE/gov.br

**Critério de pronto:**
- Site renderiza com paleta nova em todas as páginas
- pa11y-ci verde (sem regressão)
- Conferir manualmente ≥30 combinações texto/fundo no Lighthouse a11y
- Reservar 2-3h dentro deste sprint para corrigir contraste em chips de status (provável regressão)
- Screenshot antes/depois arquivado em `.claude/working/mvp-ux/screenshots/v2-paleta/`

**Risco crítico**: regressão pa11y. **Mitigação**: rodar pa11y local antes de cada commit; se reprovar, corrigir tom específico (escurecer 5-10%).

---

### Sprint V3 — Phosphor inline substituindo emojis (~6h)

**Objetivo**: eliminar 26 ocorrências de emojis funcionais em 9 arquivos (verificadas empiricamente em R2.3), substituindo por Phosphor regular inline SVG.

**Decisão técnica (validada em R2.2):**
- **Inline SVG sob demanda** (não webfont 3MB) via shortcode Eleventy
- Pacote: `phosphor-icons` ou plugin equivalente
- Tabela de mapeamento documentada em **ADR-012 ícones Phosphor**

**Mapeamento (a confirmar/refinar nos arquivos):**

| Emoji | Phosphor | Onde |
|---|---|---|
| 🔍 | `MagnifyingGlass` | hero card "Sei o que procuro", footer |
| 🧭 | `Compass` | hero card "Quero explorar" |
| 📊 | `ChartBar` | hero card "Comparar UFs" |
| 🗺️ | `MapTrifold` | hero card "Minha UF" |
| 🌎 | `Globe` | abrangencia |
| 🏫 | `Buildings` | modalidade |
| 📚 | `BookOpen` | tipo |
| ✅ | `CheckCircle` | status/situação |
| ⚠️ | `WarningCircle` | snapshot indisponível |
| ✕ | `X` | remover filtro |
| ↗ | `ArrowUpRight` | link externo |
| → | `ArrowRight` | "Ver todas →" |

**Arquivos a modificar (9 confirmados em R2.3):**
- `site/src/_includes/layouts/dimensao.njk`
- `site/src/modalidade/pagina-modalidade.njk`
- `site/src/index.njk` (8 ocorrências)
- `site/src/explorar.njk` (9 ocorrências)
- `site/src/_includes/components/footer.njk`
- `site/src/_includes/components/button.njk`
- `site/src/abrangencia/pagina-abrangencia.njk`
- `site/src/404.njk`
- `site/src/tipo/pagina-tipo.njk`

**Criar:**
- `site/src/_includes/components/icon.njk` — shortcode `{% icon "MagnifyingGlass", "size-md" %}` que renderiza SVG inline
- `.claude/decisions/2026-05-02_adr-012-icones-phosphor.md`

**Critério de pronto:**
- 0 emojis funcionais nos 9 arquivos (`grep` confirma)
- Build < 5s mantido
- Screenshot antes/depois arquivado

**Risco**: erro de mapeamento (icone errado pra contexto). **Mitigação**: revisar visualmente cada substituição.

---

### Sprint V4 — Hero refactor (~5h)

**Objetivo**: substituir hero atual ("Por onde começar?") por hero com value proposition + 3 exemplos clicáveis + mapa SVG estático Brasil.

**Estrutura nova:**

```
┌─────────────────────────────────────────────────────────────┐
│ HERO                                                         │
│                                                              │
│   [Plex Serif 700, 48px]                                     │
│   439 políticas públicas brasileiras de educação            │
│   de jovens e adultos, qualificação profissional e          │
│   inclusão produtiva — em um catálogo navegável             │
│                                                              │
│   [Plex Sans 16px, sienna-dark]                             │
│   Documentação técnica + texto integral capturado +          │
│   citação acadêmica em 4 formatos.                          │
│                                                              │
│   [3 chips de exemplo, clicáveis, .tag--filter]             │
│   Veja: PRONATEC · Bolsa Família · EJA Federal              │
│                                                              │
│              [SVG Brasil 9 UFs marcadas, lateral right]    │
│                                                              │
│   [Caixa de busca menor, mantém atalho /]                   │
└─────────────────────────────────────────────────────────────┘
```

**Decisões R2.2/R2.3:**
- **Logo institucional NÃO vai no hero** (refutado por R2.2 — padrão BR é footer institucional rico, ver Sprint V5)
- KPIs (439 políticas / 9 UFs / 242 snapshots) saem do hero atual e vão para uma linha tipográfica abaixo (ou para o footer)
- Mapa SVG estático: 9 pontos coloridos sobre silhueta cinza-clara, sem interação (mapa coroplético interativo é F.3)

**Arquivos a modificar:**
- [site/src/index.njk](C:/Users/antro/dev/catalogo-politicas/site/src/index.njk) — refator completo do bloco hero
- Criar `site/src/_includes/components/mapa-brasil-svg.njk` — SVG inline 9 UFs marcadas

**Critério de pronto:**
- Hero novo carrega < 1.5s mobile-3G
- 3 chips de exemplo funcionam (linkam para fichas reais)
- pa11y-ci verde (foco visível no SVG, alt text correto)

---

### Sprint V5 — Footer institucional + print (~4h)

**Objetivo (parte 1, ~2h)**: footer institucional rico (padrão BR validado em R2.2 com Fiocruz/IBGE) — 4 colunas + logos das instituições + nota de licença + ID DOI placeholder.

**Estrutura footer:**

| Coluna 1: Sobre | Coluna 2: Explorar | Coluna 3: Para pesquisador | Coluna 4: Instituições |
|---|---|---|---|
| O catálogo | Por UF | Como citar | FRM (logo) |
| Metodologia | Por tipo | Glossário | IESP-UERJ (logo) |
| Cobertura | Por situação | DOI Zenodo (placeholder) | Fundação Bradesco (logo) |
| LGPD/Privacidade | Comece por aqui | Schema.org | + Rede EJA |

**Objetivo (parte 2, ~2h)**: print stylesheet (`@media print`) que faz ficha caber em 1-2 A4.

**Arquivos a modificar:**
- [site/src/_includes/components/footer.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/components/footer.njk) — refator
- [site/src/assets/css/tailwind.css](C:/Users/antro/dev/catalogo-politicas/site/src/assets/css/tailwind.css) — adicionar bloco `@media print` (esconde nav, footer, breadcrumb, "Continue explorando"; força 1 coluna; tipografia serif)

**Crítico**: solicitar à usuária se logos institucionais (FRM, IESP, Fundação Bradesco, Rede EJA) existem em formato vetorial (SVG/EPS). Sem isso, usar texto estilizado como fallback.

**Critério de pronto:**
- Footer novo no ar
- `Ctrl+P` em qualquer ficha gera 1-2 A4 limpas (sem nav, sem decorativos)
- Lighthouse a11y ≥ 95

---

## ONDA F — Facilidade mínima (~25h)

### Sprint F1 — Pagefind + Lunr fallback + zero-result (~12h)

**Objetivo**: resolver J5 e J8 (busca falha silenciosa) com sinônimos curados + fallback Lunr quando Pagefind não acha + página de zero-result rica.

**Decisão técnica (validada em R2.2 + ADR-008):**
- Pagefind 1.5.2 **não tem fuzzy nem sinônimos nativos** (R2.2 confirmou)
- Caminho real: `data-pagefind-meta aliases` (sinônimos como meta) + Lunr.js como fallback (ADR-008 já previa)
- `disableMainThread: true` + lazy-load índice (ponto cego R2.3 #9)

**Arquivos a criar/modificar:**
- `site/src/_data/sinonimos.js` — array de 50-100 pares (`{ canonico: "Educação de Jovens e Adultos", aliases: ["EJA", "ensino para adultos", "supletivo"] }`)
- [site/src/_includes/layouts/ficha.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/layouts/ficha.njk) — adicionar `<span data-pagefind-meta="aliases">{{ aliases|join(', ') }}</span>`
- `site/src/buscar.njk` — adicionar Lunr fallback + componente zero-result próprio
- `site/src/_data/buscas-comuns.js` — array de 12-15 sugestões para zero-result ("PRONATEC", "Bolsa Família", "EJA SP", etc.)

**Critério de pronto:**
- "EJA" encontra "Educação de Jovens e Adultos"
- "fies" encontra políticas relevantes
- Zero resultado mostra 12-15 sugestões clicáveis
- Bundle JS Home não estoura 100kb
- pa11y-ci verde

---

### Sprint F2 — Highwire meta + Schema.org + SEO (~5h)

**Objetivo**: Zotero/Mendeley detectam fichas automaticamente; Google Scholar indexa.

**Meta tags Highwire Press a adicionar no `<head>` da ficha:**
- `citation_title`
- `citation_author` (revisor + autores institucionais)
- `citation_publication_date` (ano_criacao + data_revisao)
- `citation_journal_title` ("Catálogo de Políticas Públicas Brasileiras")
- `citation_publisher` ("Rede EJA e Inclusão Produtiva — FRM/IESP/Fundação Bradesco")
- `citation_abstract`
- `citation_pdf_url` (se houver snapshot)

**JSON-LD Schema.org:**
- `Dataset` com `provider`, `creator`, `dateCreated`, `description`
- Linkar a `GovernmentService` quando aplicável

**SEO básico (incluso aqui):**
- `sitemap.xml` via `@quasibit/eleventy-plugin-sitemap`
- `robots.txt` (allow all + sitemap)
- `<link rel="canonical">` em cada ficha

**Arquivos a modificar:**
- [site/src/_includes/layouts/ficha.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/layouts/ficha.njk) — adicionar 7 meta tags + JSON-LD no `<head>`
- `site/eleventy.config.js` — adicionar plugin sitemap
- Criar `site/src/robots.txt.njk`
- [site/src/_includes/layouts/base.njk](C:/Users/antro/dev/catalogo-politicas/site/src/_includes/layouts/base.njk) — adicionar `<link rel="canonical">`

**Critério de pronto:**
- Conector Zotero detecta uma ficha real (testar manualmente com extensão browser)
- Validador Schema.org (`https://validator.schema.org/`) aprova JSON-LD
- `https://antrologos.github.io/catalogo-politicas/sitemap.xml` válido
- `<link rel="canonical">` presente em todas as páginas

---

### Sprint F3 — Glossário + Comece por aqui (~5h)

**Objetivo**: jargão deixa de ser opaco; leigo tem caminho explicado.

**Componente glossário inline (`<abbr>`):**
- Shortcode Eleventy `{% abbr "EJA" %}` → `<abbr title="Educação de Jovens e Adultos">EJA</abbr>` com underline pontilhada
- Curadoria: 30-40 termos em `site/src/_data/glossario.js` (EJA, PRONATEC, MEC, FNDE, EAD, IPVL, BPC, CRAS, SINE, SENAI, SESC, SESI, FIES, ProUni, etc.)
- Aplicar 1ª menção/página

**Página `/sobre/comece-por-aqui/`:**
- 3 fluxos curados:
  - "Sou técnico estadual buscando análogo em outra UF" → exemplo concreto (PRONATEC SP vs MG)
  - "Sou pesquisador querendo citar uma política" → ficha-modelo + caixa Citação visível
  - "Sou curioso querendo entender o que existe" → /explorar/ + 3 entradas
- Ficha-modelo: PRONATEC-BR (federal canônica, rica) com anotações no estilo "tour estático"

**Arquivos a criar/modificar:**
- `site/src/_data/glossario.js`
- `site/src/_includes/shortcodes/abbr.njk`
- `site/src/sobre/comece-por-aqui.md` (novo)
- `site/src/sobre/glossario.md` (novo, índice completo dos 30-40 termos)

**Critério de pronto:**
- 1ª menção de "EJA" / "PRONATEC" em cada página tem `<abbr>`
- `/sobre/comece-por-aqui/` no ar
- Link visível no footer e na nav

---

### Sprint F4 — Dedup BA + microcopy + URL state (~3h)

**Objetivo**: 3 fixes pequenos de credibilidade.

**1. Dedup duplicatas BA no ETL (~1h):**
- Conhecidas: `Programa Juros por Educação` (×2), `PRONATEC` (×2)
- Adicionar deduplicação em `scripts/etl/normalize.py` antes de gerar `latest.json`
- Manter id_interno mais antigo, descartar duplicata

**2. Microcopy hero como value proposition (~1h):**
- Substituir "Por onde começar?" por value proposition real (ver Sprint V4)
- Reescrever breadcrumb "UFs" → "Políticas {{ p.uf }}" (já feito em fichas, replicar em listings)

**3. URL state em filtros internos (~1h):**
- `/uf/sp/?situacao=ativa-em-execucao&tipo=qualificacao` deve filtrar e ser bookmarkable
- Atualizar [site/src/assets/js/uf-filtros.js](C:/Users/antro/dev/catalogo-politicas/site/src/assets/js/uf-filtros.js) para sincronizar URL

**Arquivos a modificar:**
- `scripts/etl/normalize.py` (paths protegidos — exige plan mode confirmando este sub-sprint)
- `site/src/assets/js/uf-filtros.js`
- `site/src/index.njk` (microcopy hero — provavelmente já feito em V4)
- `site/src/_includes/components/breadcrumb.njk`

**Critério de pronto:**
- `latest.json` validate-json-schema sem duplicatas
- Bookmark de URL filtrada abre filtrada
- Microcopy hero é value proposition (não pergunta retórica)

---

## SPRINT X — Opcional pós-MVP (~14h)

Se sobrar fôlego antes do prazo de 2026-07-01, executar:

**Skill `auditar-mvp-ux` (R1.3 solução-pai de sustentabilidade):**
- Lighthouse mobile-3G automatizado
- Screenshot diff entre commits (regressão visual)
- pa11y-ci custom (combinações de tokens)
- Validador de drift de vocabulário (ETL → JSON)

**Justificativa para pós-MVP:** R1.3 propôs como instrumento de governança que sobrevive à falta de bolsista; R2.3 confirmou que **não muda percepção da usuária** (não vai pro MVP) mas é seguro de regressão para todo desenvolvimento futuro.

**Arquivos a criar:**
- `.claude/skills/auditar-mvp-ux/`
- Workflow GitHub Actions adicional

---

## Arquivos a modificar (consolidado)

### Modificados
- `site/package.json` — substituir fontes
- `site/tailwind.config.js` — fonte + paleta + tokens chips
- `site/src/assets/css/tailwind.css` — fontes + classes chips + `@media print`
- `site/eleventy.config.js` — plugin sitemap
- `site/src/_includes/layouts/base.njk` — preload fontes + canonical
- `site/src/_includes/layouts/ficha.njk` — Highwire meta + JSON-LD + chips refeitos
- `site/src/_includes/layouts/dimensao.njk` — chips refeitos
- `site/src/_includes/components/footer.njk` — refator institucional
- `site/src/_includes/components/breadcrumb.njk` — microcopy
- `site/src/_includes/components/button.njk` — emoji → Phosphor
- `site/src/_includes/components/tag-status.njk` — manter, validar
- `site/src/index.njk` — hero refactor + Phosphor + chips
- `site/src/explorar.njk` — Phosphor + chips
- `site/src/buscar.njk` — Lunr fallback + zero-result
- `site/src/comparacao.njk` — chips refeitos + nota "comparação semântica em desenvolvimento"
- `site/src/404.njk` — Phosphor
- `site/src/abrangencia/pagina-abrangencia.njk` — Phosphor
- `site/src/modalidade/pagina-modalidade.njk` — Phosphor
- `site/src/tipo/pagina-tipo.njk` — Phosphor
- `site/src/assets/js/uf-filtros.js` — URL state
- `scripts/etl/normalize.py` — dedup BA (REQUER plan mode confirmando este sub-sprint, paths protegidos)

### Criados
- `site/src/_includes/components/icon.njk` — shortcode Phosphor
- `site/src/_includes/components/mapa-brasil-svg.njk` — SVG estático
- `site/src/_includes/shortcodes/abbr.njk` — glossário inline
- `site/src/_data/sinonimos.js` — Pagefind aliases
- `site/src/_data/buscas-comuns.js` — sugestões zero-result
- `site/src/_data/glossario.js` — 30-40 termos
- `site/src/sobre/comece-por-aqui.md` — fluxos curados
- `site/src/sobre/glossario.md` — índice completo
- `site/src/robots.txt.njk`
- `.claude/decisions/2026-05-02_adr-011-paleta-autoral.md`
- `.claude/decisions/2026-05-02_adr-012-icones-phosphor.md`

### Não tocar
- `data/raw/Fichas das Políticas - 1ª onda.xlsx` (planilha-fonte)
- `data/derived/latest.json` (gerado pelo ETL — só é alterado via Sprint F4 dedup)
- `.claude/rules/**`, `.claude/hooks/**`
- `data/external_snapshots/**` (snapshots imutáveis)
- `site/src/_data/policies.js` (439 fichas; não alterar carregamento)
- `site/src/comparacao.njk` (lógica) — apenas adicionar nota visível "em desenvolvimento" e refazer chips

---

## Testes previstos

**Por sprint:**
- Toy/unit test relevante (ex.: para Sprint F1 sinônimos: teste que `EJA` está em `aliases`)
- pa11y-ci local antes de commit (não esperar CI quebrar)
- Lighthouse mobile-3G antes de M1

**Integração:**
- CI bloqueante (validate JSON Schema + build + pa11y + Lighthouse + deploy) já cobre toda mudança

**Manual:**
- Conector Zotero detecta ficha (após Sprint F2)
- Print A4 limpo (após Sprint V5)
- Mobile real iPhone SE / Android médio (antes de M1)

---

## Riscos e mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | Regressão de contraste pa11y após paleta nova (Sprint V2) | ALTA | ALTO | Pa11y local antes de commit; reservar 2-3h dentro do sprint para corrigir |
| 2 | Mapeamento errado de emoji → Phosphor (Sprint V3) | MÉDIA | MÉDIO | ADR-012 documenta tabela; revisar visualmente cada substituição |
| 3 | Bundle Home estoura 100kb (Lunr no Sprint F1 + Plex no V1) | MÉDIA | MÉDIO | Lazy-load Lunr só quando Pagefind retorna 0; preload só 2 fontes |
| 4 | Build > 5s após Phosphor inline + glossário | BAIXA | BAIXO | Cache plugin Phosphor; CI ainda passa se for 6-7s (regra é "<5s ideal") |
| 5 | Logos institucionais não existem em vetor (Sprint V5) | MÉDIA | MÉDIO | Fallback texto estilizado; pedir à usuária com 1 semana de antecedência |
| 6 | Dedup BA quebra `id_universal` em links externos (Sprint F4) | BAIXA | ALTO | Plan mode obrigatório (paths protegidos); manter id_interno mais antigo |
| 7 | Estouro de orçamento (>50h) durante execução | MÉDIA | ALTO | Cláusula re-priorização: pausar e replanejar com a usuária; Sprint X é cortável |
| 8 | Mantenedor solo se cansa antes de 50h | MÉDIA | MÉDIO | Ondas V e F independentes; entregar em commits incrementais; cada sprint é PR separado |

---

## Verificação pós-implementação

### Métricas que devem manter-se
- CI verde em todo push (validate + build + pa11y + Lighthouse + deploy)
- Lighthouse Performance ≥ 88 (aceito 88 em mobile-3G durante Onda V; meta voltar a ≥90 pós-V)
- Lighthouse A11y ≥ 95
- Lighthouse SEO ≥ 92 (sobe pós-Sprint F2 com sitemap+canonical+JSON-LD)
- WCAG 2 AA validado por pa11y-ci em ≥5 URLs amostradas
- Build local em < 5s (preferencialmente; aceito ≤ 7s temporariamente após Sprint V3)
- CSS final ≤ 50 KB
- Bundle JS Home ≤ 100 KB

### Verificação manual antes de M1 (release MVP-UX)
- [ ] Mobile real iPhone SE — site usável, hero não quebra
- [ ] Mobile real Android médio (Moto G ou similar) — idem
- [ ] Conector Zotero detecta automaticamente uma ficha (PRONATEC-BR)
- [ ] Validador Schema.org aprova JSON-LD da ficha
- [ ] `Ctrl+P` em ficha gera 1-2 A4 limpas
- [ ] Busca por "EJA" retorna ≥10 resultados (sinônimos funcionam)
- [ ] Busca por "curso pra adulto trabalhar" mostra zero-result rico (12-15 sugestões)
- [ ] `/sobre/comece-por-aqui/` no ar e linkado em footer + nav
- [ ] Footer institucional rico com 4 colunas + (idealmente) logos
- [ ] Print stylesheet aplicado
- [ ] Screenshots antes/depois arquivados em `.claude/working/mvp-ux/screenshots/`
- [ ] Decisão final da usuária sobre paleta + tipografia (preview enviado em V1+V2)

### Marco M1 (release MVP-UX)
- Tag git `v0.2.0-mvp-ux` no commit final do Sprint F4
- Issue de release no GitHub com checklist de verificação manual
- Mensagem ao stakeholder/usuária com 5-8 prints lado-a-lado mostrando "antes/depois"

---

## Cláusula de re-priorização

Durante a execução, **pausar e replanejar com a usuária** se:
- Algum sprint individual ultrapassar **2× o estimado** (ex.: Sprint V0 chips passa de 12h para 24h)
- CI quebrar de forma persistente após 3 tentativas de correção
- Lighthouse Performance cair abaixo de 85 em mobile-3G mesmo após otimização
- Aparecer trabalho não-previsto que o agente não consegue resolver sozinho (ex.: bug em Eleventy plugin)

Após MVP-UX concluído (Sprint F4 entregue, M1 tagueado), **retomar Bloco F.3** (mapa coroplético D3 + grafo Cytoscape + DOI Zenodo + auditoria a11y manual + lançamento institucional). O grafo de F.3 ganha contexto: vira "browse de relacionamentos" complementando a descoberta lateral instalada em EX.3.

---

## Status

- [x] RASCUNHO — 2026-05-02
- [x] APROVADO pela usuária via ExitPlanMode (P1=médio, P2=sim — 2026-05-02)
- [x] Sprint V0 (chips) entregue — commit `5a31049` (CI verde, 5 paradigmas eliminados, 4 famílias canônicas, +bug fix Tailwind purge)
- [x] Sprint V1 (Plex) entregue — commit `a26291b` (CI verde, +bug fix passthrough fontes nunca servidas em produção)
- [x] Sprint V2 (paleta autoral) entregue — commits `db3dbd7` (paleta) + `8f2a773` (hotfix pa11y bg-success/text-white); CI verde; ADR-011 publicado
- [x] Sprint V3 (Phosphor) entregue — commit `b2435a7`; CI verde; ADR-012 publicado; 24 emojis substituídos + 4 frontmatters dimensaoIcone
- [x] Sprint V4 (hero) entregue — commit `b9b3e0e`; CI verde; hero coeso novo + cobertura visual lateral + KPI tipográfico; -103 linhas em index.njk
- [x] Sprint V5 (footer + print) entregue — commit `43692b8`; CI verde; bloco institucional Plex Serif (sem logos por Q1) + coluna 'Para pesquisador' + @media print stylesheet (resolve R1.3 #4)
- [x] Sprint F1 (Pagefind sinônimos + zero-state rico) entregue — commit `5877c78`; CI verde; aliases curados em 8 fichas federais top + 12 buscas comuns. Lunr.js fallback adiado para F1.2 opcional (custo 8h vs ROI marginal já que aliases cobrem buscas reais)
- [x] Sprint F2 (Highwire+Schema+sitemap+robots) entregue — commit `b6463ba`; CI verde; ~480 URLs em sitemap.xml; Schema.org Dataset JSON-LD validado; Highwire 6 citation_* tags por ficha (Zotero auto-detect)
- [x] Sprint F3 (glossário+comece) entregue — commit `4b0e455`; CI verde; 32 termos em 10 categorias + shortcode {% abbr %} + página /sobre/comece-por-aqui/ com 3 fluxos curados + página /sobre/glossario/ com nav âncoras
- [x] Sprint F4 (transparência BA + breadcrumb + microcopy URL state) entregue — commit `e4a5fc6`; CI verde; nota honesta sobre 2 duplicatas em /uf/ba/ + breadcrumb 'Por UF' (era 'UFs' apontando para /buscar/) + microcopy "filtros via URL bookmarkáveis" no header /uf/
- [x] M1 — release MVP-UX tagueado — tag `v0.2.0-mvp-ux` no commit `e4a5fc6` (2026-05-03)
- [ ] Sprint X (auditar-mvp-ux) — opcional, se sobrar fôlego
- [x] CONCLUÍDO — pronto para retomar F.3 (concluído 2026-05-03)

---

## Pergunta(s) ainda em aberto

**Q1 — Logos institucionais (Sprint V5)**: ~~existem em formato vetorial?~~ → **RESPOSTA 2026-05-02: deixar logos para depois**. Sprint V5 usa fallback texto estilizado com Plex Serif (FRM · IESP-UERJ · Fundação Bradesco · Rede EJA).

**Q2 — Ordem de execução**: ~~sequencial ou paralelo?~~ → **RESPOSTA 2026-05-02: SEQUENCIAL** (V0 → V1 → V2 → V3 → V4 → V5 → F1 → F2 → F3 → F4). Mais previsível, menos risco de regressão.