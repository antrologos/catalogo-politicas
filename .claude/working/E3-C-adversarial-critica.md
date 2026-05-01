# E.3.C — Crítica adversarial das defesas Astro (E.3.A) e Eleventy (E.3.B)

> **Avaliador adversarial** do sub-bloco E.3 (Decisão de Stack).
> Missão: ler integralmente E.3.A e E.3.B, criticar ambas com fundamento, encontrar buracos, expor o que cada defensor escolheu não dizer, e propor um veredito mais honesto que qualquer um dos dois.
> Lente: estado do projeto em 2026-05-01 (439 fichas, 148 snapshots, 55 Must, mantenedor solo ~4h/semana sem garantia de regularidade, GH Pages, horizonte 5 anos com 4 ondas futuras).
> Data: 2026-05-01

---

## 1. TL;DR — recomendação adversarial em 5 bullets

1. **Nenhuma das duas defesas é honesta sobre o tamanho real do trabalho.** Astro promete "25h até primeiro deploy útil" e Eleventy promete "1-2 dias úteis". Ambos ignoram que o gargalo não é a stack — é os 8 wireframes complexos, a a11y do mapa D3 + grafo Cytoscape, a curadoria do schema.org por ficha, a infraestrutura de citação, e os 7 GH Actions. **A diferença de stack são ~50-100h de um total de 380-1040h. Um rounding error na incerteza.**

2. **Eleventy é a recomendação correta para este projeto, mas a defesa B vendeu pelo motivo errado.** O motivo certo não é "boring tech" abstrato — é que **Astro 5 tem 6 meses de produção em projetos sérios, sua Content Layer API é experimental até v5.6, e o ecossistema de plugins (sitemap v3 ainda em RC, MDX com edge cases) não amadureceu o suficiente para mantenedor solo 4h/sem**. Eleventy 3 é a stack onde a probabilidade de "sessão de manutenção produtiva em 30 minutos depois de 4 meses sem tocar" é mais alta — e essa é a métrica que importa.

3. **Astro deveria ser rejeitado pelos riscos não declarados em E.3.A**: TypeScript estrito + Zod + React + Vite 6 introduz uma stack de **4 ferramentas independentemente atualizáveis** num projeto onde o mantenedor é Python/R. Cada `npm update` carrega risco de falha em silêncio (peer dep mismatch, type narrowing change, Vite plugin incompatibility). E.3.A admite "8 itens TRABALHO" mas NÃO conta o overhead de **manter o build funcionando** durante 5 anos — esse é o trabalho invisível que mata projetos solo.

4. **Hugo merece uma menção honrosa que NENHUM dos dois fez**: binário único Go, 0 dependências runtime, build mais rápido das três opções (~1-3s para 500 páginas), ecossistema acadêmico crescente (Quarto usa Hugo internamente), e a curva real para Rogério é de horas, não dias. **Foi excluído sem justificativa em ambas as defesas — sintoma de viés "JS-first" de quem escreveu os documentos.** Se este fosse um projeto de blog acadêmico puro, Hugo venceria limpo. Para o catálogo, perde apenas pelo grafo Cytoscape e pela curva de templates Go (que é real).

5. **Decisão recomendada com 3 condicionais explícitas**:
   - **Default: Eleventy 3 + Tailwind + Pagefind + Alpine + D3/Cytoscape** (E.3.B) — assume Rogério solo, 4h/sem, ondas 2-4 futuras.
   - **SE bolsista financiado for confirmado em ≤ 60 dias**: reabrir como Astro 5 (E.3.A) — bolsista absorve a curva de Astro/React/TS/Zod e ganhamos Content Collections tipadas.
   - **SE escopo for cortado para 4 wireframes em E.6 (Home/Busca/Ficha/Sobre)**: considerar Hugo + Pagefind. Mais estável que ambos, build instantâneo, mas perde o grafo (Cytoscape em Hugo é doloroso).

---

## 2. Crítica detalhada à defesa de Astro (E.3.A)

### 2.1. "Astro 5 é estável" subestima a juventude de v5

**O que E.3.A diz**: "Astro 1.0 lançou em ago/2022; 3.5 anos de produção. Releases majors a cada ~12 meses, com codemods automáticos."

**O que E.3.A não diz**:
- **Astro 5.0 lançou em 11/nov/2024 — apenas 5-6 meses antes desta decisão.** Isso não é "3.5 anos de produção" para v5; é v5 + legado v4 + legado v3.
- Releases minor de Astro 5 saíram em ritmo agressivo: 5.1 (dez/2024), 5.2 (jan/2025), 5.3 (fev/2025), 5.4 (mar/2025), 5.5 (abr/2025). Cada minor introduziu **mudanças não-trivais em Content Layer API** (que E.3.A propõe como base do projeto).
- A própria **Content Layer API** mencionada como argumento principal foi marcada "experimental" até 5.0 e **estável apenas a partir de 5.0** — ou seja, o argumento "tipa o JSON canônico via Zod" é construído sobre uma API com 6 meses de estabilidade.
- "Codemods automáticos" cobrem ~50-70% dos breaks; o resto é manual e requer ler RFC + commits + Discord. Mantenedor solo 4h/sem **não vai fazer isso**.

**Implicação**: a probabilidade de Rogério em 2027 abrir o projeto após 4 meses, rodar `npm install`, e ver build quebrar por incompatibilidade de plugin oficial (que precisou bump major) é **não-trivial**. Em Eleventy 3, essa probabilidade é menor por construção (menos surface area, plugins independentes do core).

### 2.2. "React como ilha" minimiza o custo cognitivo real

**O que E.3.A diz**: "React é seguro como dependência minoritária."

**O que E.3.A não diz**:
- Adicionar React introduz **5 novas dependências mínimas**: `react`, `react-dom`, `@astrojs/react`, `@types/react`, `@types/react-dom`. Cada uma com seu cycle de breaking changes.
- React 19 (lançado dez/2024) tem **breaks reais** que Astro 5 ainda está absorvendo: removed APIs (`forwardRef` em function components não é mais necessário, mas continua compilando), `useFormState` → `useActionState`, novo handling de `defaultProps`. Quem mantém isso para o Rogério?
- "Ilha" só carrega quando visível, sim — mas em **dev time** (`astro dev`), a ilha React é compilada, type-checked, e qualquer erro em qualquer arquivo `.tsx` quebra o servidor de dev. Em Eleventy + Alpine, JS quebrado quebra **só a página com aquele JS**, e dev server continua.
- **Por que React e não Preact, Solid, ou Svelte?** E.3.A escolheu React sem justificar. Preact tem ~3KB vs ~45KB de React+ReactDOM e API quase idêntica. Solid tem reactividade real e bundle menor. Svelte é a escolha "mais boring" entre frameworks. **A escolha de React é cargo-cult — copiar o que outros projetos Astro fazem.**

**Implicação**: o "ilha React" tem custo cognitivo e custo de manutenção que E.3.A omite. Para 5 ilhas (`SearchUI`, `MapaCoropletico`, `GrafoRelacoes`, `CopiarCitacao`, `NotFoundFuzzy`), o custo agregado de manter React + React DOM + tipos + integração é **maior** que escrever as 5 funções em vanilla JS + Alpine.

### 2.3. TypeScript estrito + Zod adicionam carga em projeto sem ROI claro

**O que E.3.A diz**: "Zod ≈ pydantic, 4-6h."

**O que E.3.A não diz**:
- O JSON canônico **já é validado pelo schema JSON oficial do projeto** (`policies-schema.json`, draft-07, ajv-cli no CI). Validar de novo no build com Zod é **redundância**, não defesa em profundidade. Se o JSON passa no schema mas falha no Zod, descobrimos que **schemas divergiram** — isso é problema, não feature.
- Zod schemas precisam ser **mantidos em sincronia** com `policies-schema.json` manualmente. Toda mudança em E.6 (ex.: adicionar campo) exige atualização em 2 lugares. Mantenedor solo esquece e ganha bug silencioso.
- TypeScript estrito força anotações em frontmatter de páginas, em filtros, em integrações. **Custo cognitivo para Python/R dev é maior que E.3.A admite** — 6-10h é realista só se a pessoa já pensa em tipos. Rogério vem de pandas e dplyr; pensar em union types discriminados não é natural.
- **Alternativa em Eleventy**: filtros JS sem tipo + `ajv validate` no CI. Funciona igual, sem segunda fonte de verdade.

**Implicação**: TS estrito + Zod é tax cognitivo que **não compra robustez incremental** porque ajv já existe. É uma escolha de "modernidade" sem ROI.

### 2.4. "Build complexity" foi minimizada — Vite 6 + integrações é mais frágil que admitido

**O que E.3.A diz**: `astro.config.mjs` ~40 linhas, `vite: 6.x` underneath.

**O que E.3.A não diz**:
- Vite 6 saiu em nov/2024 — **mesma juventude de Astro 5**. Plugins Vite que dependiam de Vite 5 ainda estão em transição.
- Cada integração (`@astrojs/tailwind`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/mdx`) é um pacote independente com cycle próprio. **4 integrações = 4 vetores de break em `npm update`.**
- `@astrojs/sitemap` v3 está em RC desde 2024 com bugs conhecidos em rotas dinâmicas. E.3.A propõe `getStaticPaths` para 439 rotas e cita sitemap como NATIVO. **Se sitemap quebrar com 439 URLs, Rogério solo vai descobrir que é bug do plugin e não do código dele depois de quanto tempo?**
- `@astrojs/mdx` propaga MDX 3 → MDX 4 transitions com break em remark/rehype plugins. E.3.A propõe MDX para "Sobre + Metodologia + Cobertura" mas markdown puro basta. **MDX é over-engineering para conteúdo estático.**
- Build em GH Actions free tier para 439 páginas Astro: **realista 60-120s**, não "30-60s". Astro 5 não é tão rápido quanto Hugo (instantâneo) ou Eleventy (5-15s).

**Implicação**: a build de Astro tem **mais componentes móveis** que E.3.A admite. Cada componente é um ponto de falha cumulativo. Em Eleventy + Tailwind CLI + Pagefind, são **3 ferramentas independentes** que falham independentemente — recuperação é localizada. Em Astro, falha de Vite plugin pode mascarar como erro Astro.

### 2.5. "8 itens TRABALHO" subestima drasticamente o esforço

**O que E.3.A diz**: 8 itens "TRABALHO" com estimativas individuais nunca somadas.

**O que E.3.A não diz**:

| Item TRABALHO | E.3.A estima | Estimativa adversarial honesta | Justificativa |
|---|---:|---:|---|
| F-M04 Busca multi-faceta com URL | "~150 linhas" | **40-80h** | Pagefind UI default não persiste em URL → custom UI; integrar com filters Pagefind; sincronizar URL ↔ estado React; testes de regressão |
| F-M12 404 fuzzy | "~80 linhas + 8KB JS" | **15-30h** | fuse.js + carregar índice + UX de "você quis dizer?" + design + testes a11y |
| F-S10 Citação Copiar | "~30 linhas, ~2KB JS" | **8-15h** | 3 formatos (ABNT/APA/BibTeX/RIS/CITATION.cff) + clipboard API + feedback visual + a11y |
| NF-M-09 a11y mapa D3 | "~30-50h" | **60-120h** | SVG ARIA, keyboard nav, screen reader testing real (NVDA + JAWS), tooltip a11y, focus management |
| NF-M-10 a11y grafo Cytoscape | "~20-30h" | **40-80h** | Cytoscape a11y é **muito fraca**; provavelmente exige reimplementar interação em DOM paralelo |
| NF-M-07 axe disciplina | "depende" | **30-50h** | Auditar 8 wireframes × ~20 elementos cada com axe + manual + corrigir |
| Pagefind tuning | "—" | **10-20h** | Excluir seletores, configurar filters, indexar HTML satélite de PDFs, perf tuning |
| F-S04 Comparação inter-UF | "—" | **30-60h** | Tabela comparativa + filtros + export + a11y de tabelas grandes |
| **Total honesto** | **~100h** | **~230-455h** | **2-4× a estimativa de E.3.A** |

**Implicação**: a defesa de Astro está construída sobre uma estimativa de esforço **subestimada por fator 2-4×**. Eleventy não escapa disso — os mesmos itens custam o mesmo trabalho — mas a defesa B foi mais honesta em não estimar item por item.

### 2.6. "Bus factor 1 é mitigado porque output é HTML estático" é parcialmente verdade

**O que E.3.A diz**: "Se Astro v6 quebrar tudo em 2027, o site continua no ar enquanto se decide a próxima."

**O que E.3.A não diz**:
- Site continua no ar — sim. Mas **adicionar 1 ficha nova** exige rebuild. Se rebuild quebra (porque `npm install` puxou versão incompatível), não dá para publicar correções até alguém debugar.
- **Lock file (`package-lock.json`) é sua única defesa** contra esse cenário. E.3.A menciona pinagem mas não enfatiza: **NUNCA rodar `npm update` sem CI verde + branch de teste**. Mantenedor solo 4h/sem **vai esquecer e quebrar**.
- O mesmo se aplica a Eleventy, mas com **menos surface**: 6 dev-deps vs ~20+ dev-deps de Astro full. Probabilidade de quebra cumulativa é menor.

**Implicação**: o argumento "HTML continua no ar" é fraco demais. O que importa é "build continua reproduzível em 2027 sem intervenção heroica". Eleventy ganha aqui por simplicidade estrutural, não por superioridade conceitual.

### 2.7. Crítica meta a E.3.A: tom de marketing

A defesa A usa frases como **"Astro vence"**, **"caso de manual de SSG"**, **"princípio fundador"**. Essa retórica é apropriada para post de blog, não para decisão arquitetural de catálogo público com 5 anos de horizonte. Quando uma defesa precisa convencer com slogans, é sinal de que os números não fecham sozinhos. Em E.3.A, o slogan que mais incomoda é "**76% nativos**" — métrica artificial baseada em rótulos NATIVO/PLUGIN/TRABALHO que **a própria defesa criou**. Recategorizar 4 itens muda essa porcentagem completamente, e a defesa não auditou o critério.

---

## 3. Crítica detalhada à defesa de Eleventy (E.3.B)

### 3.1. "Boring tech" virou mantra defensivo

**O que E.3.B diz**: "Eleventy é boring tech deliberada."

**O que E.3.B não diz**:
- "Boring" não é virtude se a documentação for incompleta. Eleventy 3 **mudou de CommonJS para ESM** e isso quebra exemplos antigos (Stack Overflow, blog posts pré-2024) que Rogério vai encontrar quando pesquisar dúvidas. **Resposta de IA (Claude, ChatGPT) frequentemente cita exemplos v2 desatualizados.**
- Eleventy 3 introduziu **bundling oficial e suporte TypeScript** mas a comunidade está dividida: alguns plugins migraram, outros não. `@11ty/eleventy-plugin-rss` v2 saiu em 2024 mas v1 ainda é o que aparece em tutoriais antigos.
- O ecossistema de filtros Nunjucks/Liquid é **menor que jinja2/Django** — quando Rogério precisar de algo não trivial (formatar data ABNT, gerar BibTeX), vai escrever filtro custom. Cada filtro custom é 10-30 linhas de JS + teste — somam.
- **"Liquid é mais fácil que React"** é verdade num contexto, mas **escrever um helper acessível de citação em Nunjucks puro** vs **escrever um React component** depende do que cada lado dá out-of-the-box. Para citação simples: Nunjucks ganha. Para SearchUI complexa com URL state: React com hooks ganha (porque hooks tornam state management trivial; em Alpine + Nunjucks, é manual).

**Implicação**: "boring" é direção certa mas a defesa B vendeu como bala de prata. A realidade é que **Eleventy é boring no core e razoavelmente moderno na periferia (ESM, TS opcional)** — esse split causa friction que B omite.

### 3.2. Vanilla JS + Alpine para 8 wireframes complexos é mais doloroso que B admite

**O que E.3.B diz**: "Alpine cobre ~90% com sintaxe declarativa, resto vira funções vanilla. Custo: ~150-300 linhas extras."

**O que E.3.B não diz**:
- **8 wireframes ambiciosos** (Home/Dashboard, Busca facetada, Ficha, UF executiva, Comparação, Mapa, Grafo, Sobre+) cada um com componentes de UI: filtros multi-faceta, tabelas comparativas, modais de citação, tooltips a11y, breadcrumbs com estado, autocomplete em busca. Em React com `useState`, isso é centenas de linhas; em Alpine, é mais. **A estimativa "150-300 linhas extras" é para 1 wireframe simples.**
- Alpine **não tem boundary de componente real**. `x-data` cria scope mas não tem props tipadas, slots, lifecycle hooks. Para reutilizar um "FiltroFacetado" em 3 wireframes, você copia HTML. **Duplicação de markup escala mal.** Em React (mesmo via ilha), a reutilização é trivial.
- Estado compartilhado entre 2+ Alpine components na mesma página exige `Alpine.store()` global ou eventos `$dispatch`. **Para Comparação inter-UF (selecionar 2 UFs e ver tabela), o código vira spaghetti rápido.**
- Debug de Alpine é **mais difícil que React**: Alpine DevTools existe mas é pobre; estado interno em `x-data` não aparece no React DevTools (porque não é React). Em Astro + React ilhas, você tem React DevTools profissional.

**Implicação**: Eleventy + Alpine é **viável** para 8 wireframes mas exige disciplina de **arquitetura de componentes Nunjucks + manual JS**. B não documenta esse custo — pinta como se fosse plug-and-play.

### 3.3. D3 + Cytoscape em CDN é frágil, não conservador

**O que E.3.B diz**: "Versão pinada via `<script src="...d3@7.x.x">` com SRI."

**O que E.3.B não diz**:
- **CDN single-source-of-failure**. Se cdnjs/jsdelivr/unpkg cair (já caiu — set/2022 fastly outage tirou metade da web), o mapa do site para de funcionar até CDN voltar. **Bundle local elimina isso.**
- SRI hash é só verificação — se CDN responder 404 ou for bloqueada por firewall corporativo (algumas redes governamentais bloqueiam jsdelivr), o site quebra.
- D3 v7 tem **8 minor releases sem break**, sim — mas D3 é **modular** (`d3-selection`, `d3-scale`, `d3-geo`...). Importar `d3` inteiro em CDN puxa ~80KB. Para usar só `geoMercator + scaleSequential + interpolateBlues`, bundle local com tree-shaking entrega ~25KB. **B usa CDN como atalho mas sacrifica perf real.**
- Cytoscape em CDN não tem versão "subset". É 80KB+ inteiro. Pior, plugins (`cytoscape-dagre`, `cytoscape-popper`) também precisam ser carregados em CDN, **cada um com seu próprio SRI**. Manter SRI atualizado em N scripts manualmente é trabalho — em Astro com bundle, isso é automático.
- **CDN viola NF-M-21 ("whitelist JS terceiros não auditado")** mais facilmente que bundle local: se cdnjs muda algoritmo de cache ou versão `latest`, comportamento pode mudar. Bundle local é determinístico.

**Implicação**: B escolheu CDN para não complicar build, mas **CDN é menos robusto que bundle local + npm**. Astro (e Eleventy bem configurado) faz bundle local trivial. **B perdeu pontos onde teoricamente é forte.**

### 3.4. Falta de Content Collections tipadas — drift de schema sem aviso

**O que E.3.B diz**: filtros Nunjucks acessam `policies` direto.

**O que E.3.B não diz**:
- `_data/policies.js` carrega o JSON e devolve array. **Se schema mudar (ex.: campo `revisado_em` virar `data_revisao`), templates que usam `p.revisado_em` ficam silenciosamente vazios** — sem erro de build, sem warning.
- Sem TS, **typo em filtro Nunjucks** (`p.nome_progrma` vs `p.nome_programa`) renderiza string vazia silenciosamente. Astro + TS pega isso em build.
- A defesa B compensa com "ajv validate no CI" — mas ajv valida o JSON, não os templates. Drift entre template e schema **não é capturado**.
- **Risco real**: em Bloco G (onda 2), schema ganha campos novos. Templates antigos não usam → fichas antigas mostram informação parcial. Sem tipagem, ninguém vê isso até alguém clicar.

**Implicação**: tipagem (Zod ou TS) **tem ROI defensivo real** num projeto com schema evoluindo. B subestima esse ROI. Mas A também superdimensiona — não é o que vende Astro sozinho. **Trade-off honesto**: tipagem custa 6-10h de aprendizado e protege contra X horas/ano de bugs silenciosos. Para mantenedor solo 4h/sem com pressão de tempo, **a proteção pode valer**.

### 3.5. Comunidade menor e suporte de IA — argumento que B ignora

**O que E.3.B diz**: "Discord ativo; padrões Liquid/Nunjucks são interlinguagem."

**O que E.3.B não diz**:
- **GitHub stars (proxy bruto de mindshare)**:
  - Astro: ~46k stars
  - Eleventy: ~17k stars
  - Hugo: ~76k stars
  - Next.js: ~125k stars
- **Stack Overflow questions/ano (Eleventy)**: ~150-300/ano. Astro: ~1500-2500/ano. Quando Rogério travar à 1h da manhã antes do deploy, **probabilidade de encontrar resposta é maior em Astro** simplesmente porque mais gente tropeça nos mesmos problemas.
- **Suporte de Claude/ChatGPT**: ambos modelos têm corpus pequeno de Eleventy 3 (lançado out/2024). Astro 5 é mais novo (nov/2024) mas tem **mais variedade de exemplos públicos** porque a comunidade gera mais blog posts/tutoriais. **Para Rogério usando IA como copiloto, Astro pode ter mais help out-of-the-box** apesar de ser mais novo — porque Astro tem mais "buzz".
- B ignorou isso completamente. É um argumento PRÓ-Astro que B teria que enfrentar e não enfrentou.

**Implicação**: para mantenedor solo dependente de IA + StackOverflow, o tamanho da comunidade IMPORTA. **Eleventy perde aqui de Astro**. Não muda o veredito (Eleventy ainda ganha por outros motivos), mas é honesto admitir.

### 3.6. "Boring tech" e Pagefind: contradição interna

**O que E.3.B diz**: Pagefind é "estável desde 2023, escrito em Rust, sem dependência de Node além do CLI."

**O que E.3.B não diz**:
- **Pagefind é projeto de single-maintainer (Liam Bigelow + suporte CloudCannon). Lançado out/2022.** É mais recente que Astro 5 — só tem 3 anos. Chamar de "boring tech" é generoso.
- CloudCannon mantém Pagefind como side-project. **Se CloudCannon mudar prioridades, Pagefind pode entrar em modo manutenção sem aviso.** Bus factor é 1-2.
- Pagefind tem **0 alternativas drop-in** com mesma qualidade no espaço estático: Lunr.js (~10× mais lento, índice maior), ElasticLunr (deprecated), MeiliSearch (precisa servidor). **Se Pagefind morrer, migração custa caro em qualquer stack.**
- B menciona isso de leve em Riscos mas não como ameaça existencial.

**Implicação**: Pagefind é o **ponto mais frágil** da stack proposta — em ambas as defesas. Vale ter ADR explícito documentando: "Pagefind é dependência crítica; se descontinuado, fallback é Lunr.js (degradação aceita)".

### 3.7. Crítica meta a E.3.B: vendeu humildade demais

A defesa B é mais honesta que A em alguns pontos (custos de manutenção, comunidade, frameworks pesados como peso morto), mas peca pelo extremo oposto: **pinta Eleventy como "óbvio" e Astro como "moda".** Astro tem méritos reais (Content Layer API, ilhas com `client:visible`, ecosystem de integrações testadas). B descarta sem confrontar. Veredito mais maduro reconhece que **a escolha é de trade-off, não de superioridade absoluta**.

---

## 4. Críticas comuns às duas defesas

### 4.1. Stacks excluídas sem justificativa

**Hugo** (Go-based SSG):
- Build mais rápido das três (instantâneo para 500 páginas).
- Binário único, **0 dependências runtime, 0 npm**.
- Maturidade: 12 anos (lançado 2014); v0.146 atual; ecosystem estável.
- Pagefind funciona com Hugo (Pagefind é stack-agnóstico).
- Desvantagem real: **templates Go são mais alienígenas que Liquid/Nunjucks/JSX**. Curva ~10-15h.
- Desvantagem para grafo: **Cytoscape em Hugo é doloroso** — não há ecosystem de integrações, vira tudo `{{ partial }}` + `<script>` manual.

**Por que foi excluído por A e B?** A é Astro-evangelista. B foca em "Node-based porque mantenedor já tem Node". **Mas Rogério não tem preferência declarada por Node — tem expertise Python/R.** Hugo é Python-friendly em termos de filosofia (binário, sem package manager hell). **Foi excluído por viés.**

**Quarto** (R-friendly, baseado em Pandoc + Hugo):
- Acadêmico de fato — gera artigos, livros, sites.
- **Excelente para citação acadêmica** (já tem ABNT/APA built-in via CSL).
- Suporte nativo a R/Python notebooks como conteúdo.
- Desvantagem: Quarto é mais "publishing system" que "site framework" — para 8 wireframes interativos com mapa+grafo, exige escapar para Hugo subjacente.
- **Rogério é R user** — Quarto seria a única stack onde ele tem expertise prévia.

**Por que foi excluído por A e B?** Nenhum dos dois mencionou. Sintoma de **viés JS-first**. Quarto perde para Eleventy/Astro pelo escopo (8 wireframes interativos é muito além de "site de publicação"), mas **merecia mencão no shortlist**.

**Jekyll** (Ruby-based, default GitHub Pages):
- Suportado nativamente por GH Pages **sem GH Actions**.
- 12+ anos (mais maduro que Hugo).
- Ecosystem decadente — comunidade migrou para Hugo/Eleventy.
- Excluir Jekyll é **defensável** (ecosystem morto), mas ambos os defensores deveriam ter dito explicitamente.

**Plain HTML + JS + Pagefind**:
- O extremo do "boring": HTML manual + Pagefind + script de geração customizado em Python.
- Inviável para 439 fichas + manutenção, mas **define o limite teórico** de simplicidade.
- Útil como contraprova: se nem Eleventy é simples o bastante, isso é a alternativa.

### 4.2. Estimativas de horas são otimistas em ambas

**E.3.A**: "25h até primeiro deploy útil."
**E.3.B**: "1-2 dias úteis para MVP esqueleto com 1 ficha real."

**Realidade adversarial**:
- "Primeiro deploy" ≠ "MVP funcional com 8 wireframes + 55 Must atendidos".
- Setup inicial é a parte fácil. **O trabalho real começa quando você tenta atender NF-M-09 (a11y mapa) e descobre que SVG ARIA é deep work.**
- Para um catálogo do porte deste, **MVP funcional honesto custa 380-1040h** (já consolidado em E2-D). Diferença de stack é ~50-100h sobre esse total.
- **Ambas as defesas sub-vendem o trabalho** porque vender o trabalho honestamente exigiria reconhecer que stack é decisão de **5%-15% do esforço total**, não decisão de viabilidade.

### 4.3. Acessibilidade do mapa D3 + grafo Cytoscape: NINGUÉM mediu

Tanto A quanto B prometem que mapa coroplético D3 + grafo Cytoscape são **acessíveis** com:
- Lista textual paralela `<ol>` / `<dl>` (renderizada em build).
- ARIA roles em SVG.
- Navegação por teclado.

**Realidade**:
- **Nenhum dos dois testou com NVDA + JAWS**. WCAG 2.2 AA exige verificação manual com screen readers reais. axe-core só pega ~30% dos issues a11y.
- Cytoscape `aria-label` em nodes funciona em alguns SR e não outros. **Não há benchmark público.**
- D3 com `tabindex=0` em paths SVG **vira nightmare de focus management** com 27 estados — Tab cycle infinito sem ESC handler é violação WCAG 2.2 (2.1.2 No Keyboard Trap).
- Estimativa honesta: **mapa D3 acessível custa 60-120h de iteração com testes reais com SR**. NF-M-09 vai estourar prazo independente da stack.

**Implicação**: a a11y é problema de **design + tempo + teste**, não de stack. Tanto Astro quanto Eleventy passam responsabilidade adiante. **Decisão crítica para E.6**: dispor de orçamento real para a11y testing (NVDA license? consulta com pessoa cega?), ou rebaixar mapa+grafo para Should/Could.

### 4.4. Pagefind: ninguém testou com 148 snapshots

Tanto A quanto B prometem que Pagefind escala para 148 snapshots HTML+PDF. **Nenhum dos dois rodou benchmark real com este corpus.**

**O que sabemos**:
- Pagefind documenta tested-up-to 50k pages.
- 148 snapshots × ~50KB-500KB de HTML cada = **estimado 7-75MB de texto bruto**.
- Pagefind chunked: índice principal ~30KB; chunks por página ~10-50KB.
- **PDFs não são indexados nativamente** — A propõe extrair com pdfplumber (que já temos) e gerar HTML satélite. B não menciona estratégia.

**Risco real**:
- 148 HTMLs satélites + 439 fichas + 50 páginas auxiliares = ~640 unidades indexadas. **Dentro do confortável**, mas alguns snapshots podem ter 500KB+ de markup com tabelas (DOU, planalto.gov.br) — perf de busca degrada.
- Pagefind UI pode ficar lenta com >10MB de chunks totais carregados.

**Decisão crítica para E.6**: rodar Pagefind real contra os 148 snapshots já capturados em **prova de conceito** antes de E.4 (wireframes). Custo: ~2h. Não fazer isso é negligência.

### 4.5. Bundle JS Home — "0 KB" vs "12 KB"

A diz Home **pode ter 0 KB** se mapa for `client:visible`.
B diz Home tem ~12 KB (Alpine).

**A está tecnicamente certa** mas é otimista. Em Astro com `client:visible`, Home tem 0 JS até usuário rolar — sim. **Mas filtros facetados na Home (F-M03) exigem JS imediato** ou são apenas links estáticos. Se Home tem barra de busca interativa (NF-M-06: TTFI ≤ 1.5s), Pagefind UI carrega — ~12KB mínimo.

**B está realista**. ~12KB Alpine + Pagefind UI = ~30-40KB JS na Home. Dentro do budget NF-M-04 (≤ 100KB), com folga.

Diferença: A vende ideal, B vende real. **B é mais honesto aqui.**

---

## 5. 4 cenários de crise — qual stack sobrevive melhor

### Cenário 1: Rogério fica 12 meses sem tocar (sabático? doença? mudança de prioridade)

**Astro**:
- 12 meses: Astro 5.X → provável 5.10 ou 6.0. **Várias minor releases acumuladas.**
- `npm install` reproduzível com lock file → deve funcionar.
- **MAS**: deps transitivos (Vite, React) podem ter security advisory exigindo update. Dependabot abre PRs, mas ninguém merge.
- Probabilidade de "site continua funcionando com snapshots já gerados": **alta**.
- Probabilidade de "primeira sessão de manutenção em 30 minutos consegue gerar build novo": **baixa-média** (60-70%).

**Eleventy**:
- 12 meses: Eleventy 3.X → provável 3.5 ou 4.0. **Muito menos churn.**
- 6 dev-deps: probabilidade cumulativa de break é menor.
- **MAS**: Pagefind pode ter atualizado (single-maintainer); plugins pode ter quebrado.
- Probabilidade de "site continua funcionando": **alta**.
- Probabilidade de "primeira sessão de manutenção em 30 minutos consegue gerar build novo": **alta** (75-85%).

**Vencedor**: Eleventy. Menos surface, recuperação mais rápida.

### Cenário 2: Pagefind descontinuado em 2028

Cenário comum: maintainer único de Pagefind muda foco; CloudCannon descontinua. Pagefind continua funcional mas sem updates de segurança.

**Astro**:
- Migrar para Lunr/Fuse/MeiliSearch: integração existente em Astro ecosystem.
- **Reescrever ilha SearchUI**: ~20-40h (porque já é React; troca biblioteca de busca).
- Index gerado em build hook (`astro:build:done` → script novo): ~10h.

**Eleventy**:
- Migrar para Lunr.js (mais provável): roda em Node, fácil integração.
- **Reescrever filtro busca em Alpine + Lunr**: ~30-50h (Alpine + JS manual).
- Index via build script no `package.json`: ~5h.

**Vencedor**: empate técnico, **Astro com leve vantagem por ter ilha React** (modular). Eleventy precisa reescrever em Alpine que é menos modular.

**Mas o ponto crítico**: ambos sobrevivem. Pagefind morrer não é stack-decisive.

### Cenário 3: gov.br muda layout em massa em 2027 e quebra 50 snapshots

Snapshots já capturados estão em `data/external_snapshots/` por SHA — **imutáveis**. Layout novo do gov.br não invalida snapshots antigos; apenas requer **re-captura**.

Re-captura é responsabilidade do **pipeline Python** (`scripts/captura/capturar_norma.py`), **não da stack do site**. O site só linka para snapshot pelo `fonte_arquivo_path`.

**Astro vs Eleventy**: irrelevante. Ambos entregam HTML estático apontando para snapshots locais.

**Vencedor**: empate. Stack do site não influencia.

**Mas há uma sutileza**: Astro com Content Collections + Zod **força** que `fonte_arquivo_path` seja string válida em build. Se snapshot não existe, build falha. **Isso é defesa em profundidade.** Eleventy renderizaria link quebrado silenciosamente.

**Vencedor revisado**: Astro **leve vantagem** (validação build-time pega o problema antes do deploy).

### Cenário 4: Catálogo cresce para 2000 fichas (Bloco G ondas 2-4)

**Astro**:
- Build de 2000 páginas: ~2-4 minutos no GH Actions free tier (10 min/job limit).
- Pagefind index de 2000 fichas + 600 snapshots: **provavelmente entra em zona desconfortável** (>50MB de chunks). Pode exigir tuning.
- TS strict + Zod: validação fica mais lenta, mas linear.
- Vite hot reload em dev: começa a engasgar com 2000 entries.

**Eleventy**:
- Build de 2000 páginas: ~30-60s (incremental). **Vence facilmente.**
- Pagefind: mesmo problema.
- Sem TS: dev server permanece rápido.

**Vencedor**: Eleventy. Build escala melhor. **Mas ambos atingem teto Pagefind ao mesmo tempo** — o problema de search não é da stack, é do indexador.

### Resumo cenários

| Cenário | Astro | Eleventy | Hugo (excluído) |
|---|---|---|---|
| 12 meses parado | 60-70% recover | 75-85% recover | 85-95% recover |
| Pagefind morre | empate (leve A) | empate | empate |
| gov.br muda | empate (leve A) | empate | empate |
| Cresce para 2000 fichas | 70% OK | 90% OK | 99% OK |

**Hugo seria vencedor em 3/4 cenários** se grafo Cytoscape não fosse Must. **Eleventy é vencedor pragmático** dado que grafo é Must.

---

## 6. Métricas reais que ninguém mediu

### 6.1. Build time real com 439 fichas + 148 snapshots em GH Actions free tier

**A diz**: 30-60s para Astro.
**B diz**: 5-15s para Eleventy.

**Ninguém mediu**. Plano de E.4 deve incluir **prova de conceito** com:
- Setup mínimo (estrutura do boilerplate)
- 10 fichas reais carregadas via Content Collection / `_data`
- Build em GH Actions runner ubuntu-latest
- Medir: tempo total, tamanho output, tamanho índice Pagefind

Custo: 4-6h. **Antes de E.4 wireframes, isso reduz incerteza em 50%.**

### 6.2. Lighthouse score real para 1 ficha + 1 home + 1 mapa

**A e B prometem** Lighthouse Performance ≥90. Ninguém validou com setup real.

**Riscos não medidos**:
- Tailwind CSS final size em produção: Astro vs Eleventy differ marginalmente, mas há casos de purge mal configurado entregando 200KB+.
- Inline critical CSS: Astro faz auto, Eleventy precisa plugin (`postcss-critical-css` ou inline manual). **Eleventy pode perder Performance** sem tuning.
- Fontes self-hosted (Open Sans/Inter): preload + font-display swap são manuais em ambos.

### 6.3. Bundle size por página em produção

**A diz**: Home pode ter 0KB JS.
**B diz**: Home tem 12KB.

**Realidade só medível com build real**. Sugestão: criar repos protótipo `pocs/site-astro-poc/` e `pocs/site-eleventy-poc/` com 5 fichas, rodar Lighthouse-CI, comparar.

Custo: 12-16h. **Reduz risco da decisão de stack por fator 3-5×.**

### 6.4. Tempo até primeira ação útil em dispositivo real

NF-M-35: ≤10s para 1ª ação. Ambas as defesas dizem "atendido". **Ninguém testou em dispositivo Android low-end (R$ 400-700, 2-3GB RAM, 4G real de secretaria estadual).**

Sugestão: **antes do MVP final**, fazer 1 sessão de field-testing em equipamento equivalente ao usado por técnicos de SEDUC. **Sem isso, NF-M-06 e NF-M-35 são alvos no papel.**

### 6.5. A11y real do mapa coroplético + grafo

Já mencionado em §4.3. **Métrica que falta**: passar 1 hora com screen reader + mapa D3 protótipo. Decisão pode mudar a viabilidade de NF-M-09.

---

## 7. Veredito final

### 7.1. Recomendação acionável

**Adotar Eleventy 3 + Tailwind CLI 3 + Pagefind 1.x + Alpine.js 3 + D3 v7 + Cytoscape v3 (todos via npm + bundle local, NÃO CDN)**, com 5 ressalvas explícitas:

1. **Bundle local de D3 e Cytoscape via npm + esbuild ou rollup**, não CDN. Defesa B errou aqui — corrigir.
2. **ADR explícito sobre Pagefind como dependência crítica** com fallback documentado (Lunr.js se Pagefind morrer).
3. **Eleventy 3 ESM com `package-lock.json` versionado e Node 22 LTS pinado em `.nvmrc`** — sem upgrades de Node até 2027.
4. **Renovate / Dependabot configurado, mas com merge manual obrigatório** (não auto-merge). Mantenedor solo NÃO deve auto-merge.
5. **Tailwind 3.x pinado** (não migrar para 4 até comunidade Eleventy ter exemplos estáveis).

### 7.2. Por que Eleventy e não Astro — em uma frase

**Eleventy tem menos partes móveis (1 build engine vs Astro+Vite+integrações), comunidade menor mas estilo de templates familiar (Liquid/Nunjucks ≈ Jinja), e menos churn de breaking changes — três propriedades que importam mais que tipagem TS+Zod num projeto onde o gargalo real é tempo do mantenedor solo, não correção de bugs em produção.**

### 7.3. Por que NÃO Hugo (apesar de ganhar 3/4 cenários de crise)

- Templates Go são mais alienígenas que Nunjucks para Python/R dev.
- Cytoscape integration em Hugo exige `{{ partial }}` + JS manual sem ergonomia.
- Documentação Hugo é vasta mas inconsistente (várias versões coexistindo).
- Comunidade ativa, mas sem foco no caso "catálogo institucional com mapa+grafo".

**Hugo é a stack tecnicamente superior se grafo for cortado em E.6. Reabrir essa decisão se grafo cair.**

### 7.4. 3 decisões críticas pré-E.4

#### Decisão 1 — Prova de conceito empírica antes de E.4 (não-opcional)

Antes de avançar para E.4 (wireframes), executar **proof-of-concept de 1-2 dias** com:
- Repo `pocs/site-eleventy-poc/` com Eleventy 3 + Tailwind 3 + Pagefind + Alpine.
- 10 fichas reais (1 federal + 9 UFs).
- 1 mapa D3 esquelético (5 estados coloridos).
- 1 grafo Cytoscape com 5 nodes.
- Build em GH Actions; Lighthouse-CI; bundle analyzer.

**Custo**: 12-16h Rogério (ou bolsista se confirmado).
**Output**: medições reais de build time, bundle size, Lighthouse, dev experience.
**Decisão depois do PoC**: confirmar Eleventy ou reabrir caso o PoC mostrar bottleneck inesperado.

**Sem PoC, decisão de stack é especulativa.**

#### Decisão 2 — Pagefind tem fallback documentado em ADR antes de E.4

Pagefind é o **componente mais frágil** da stack proposta (single-maintainer, 3 anos). Se descontinuado, custo de migração é 30-80h.

**Ação**: ADR `2026-05-01_pagefind-fallback.md` documentando:
- Pagefind é dependência crítica.
- Fallback é Lunr.js (degradação aceita: índice maior, busca mais lenta, mas sem servidor).
- Critério de gatilho: se Pagefind sem release há 12 meses + 3+ issues críticas abertas → migrar.
- Estimativa de migração: 30-50h em Eleventy (Alpine+Lunr); 20-40h em Astro (React+Lunr).

**Sem ADR, fragilidade real fica oculta na decisão.**

#### Decisão 3 — Reavaliar stack se mantenedor mudar (gatilho explícito)

A decisão Eleventy assume Rogério solo, 4h/sem, expertise Python/R+JS moderado.

**Se em ≤ 60 dias bolsista financiado FRM/IESP for confirmado**:
- Bolsista absorve curva de aprendizado de Astro/React/TS.
- Tipagem (Zod) ganha ROI defensivo real (bolsista pode esquecer de atualizar campos).
- Astro 5 + Tailwind + Pagefind + ilhas React vira escolha defensável.
- **Reabrir E.3 com PoC duplo (Astro + Eleventy)** se bolsista chegar.

**Se em > 60 dias sem bolsista**:
- Confirmar Eleventy.
- Avaliar cortes adicionais em E.6 (cortar grafo Cytoscape liberaria Hugo como alternativa).

**Esta condicionalidade DEVE estar no ADR final** — não é detalhe operacional, é o ponto que distingue uma decisão sustentável de uma "definitiva" que vai precisar ser revertida.

---

## 8. Apêndice — checklist de auditoria das defesas

### 8.1. Itens que A (Astro) deveria ter mencionado e não mencionou

- [ ] Astro 5 lançou nov/2024; v5 ainda tem ≤6 meses de produção real.
- [ ] Content Layer API estável apenas a partir de v5.0.
- [ ] React 19 breaks ainda sendo absorvidos por integrações Astro.
- [ ] Vite 6 também tem ≤6 meses; plugins em transição.
- [ ] `@astrojs/sitemap` v3 em RC com bugs em rotas dinâmicas.
- [ ] Estimativa "8 itens TRABALHO" subestima 2-4×.
- [ ] Pagefind é single-maintainer; risco existencial.
- [ ] Bundle local de D3 ainda é ~70KB; "ilha sob demanda" mascara budget.
- [ ] TypeScript estrito custa cognitivamente para Python/R dev.
- [ ] React vs Preact/Solid/Svelte foi escolha não justificada.

### 8.2. Itens que B (Eleventy) deveria ter mencionado e não mencionou

- [ ] Eleventy 3 ESM + TS support são novos; comunidade dividida.
- [ ] Comunidade de Eleventy é 3-5× menor que Astro; suporte IA mais raro.
- [ ] CDN para D3+Cytoscape é frágil e viola NF-M-21 indiretamente.
- [ ] Alpine não tem boundary de componente; reuso vira copy-paste.
- [ ] Sem tipagem, drift de schema fica silencioso.
- [ ] Pagefind tem mesmo risco que em Astro — não é argumento PRO Eleventy.
- [ ] Hugo e Quarto não foram consideradas.
- [ ] "1-2 dias para MVP" é para esqueleto, não para 8 wireframes + 55 Must.

### 8.3. Itens que NENHUMA das duas defesas mediu

- [ ] Build time real em GH Actions free tier.
- [ ] Bundle size real em produção.
- [ ] Lighthouse real em página com mapa.
- [ ] A11y real do mapa D3 com NVDA/JAWS.
- [ ] Pagefind real com 148 snapshots HTML+PDF.
- [ ] Tempo de manutenção real após 3 meses sem tocar.

**Veredito final adversarial**: as duas defesas são **plausíveis mas insuficientes** para uma decisão de 5 anos. Eleventy ganha por trade-off pragmático. **Mas o passo crítico antes de E.4 é o PoC empírico — não outra rodada de prosa.**

---

## 9. Resumo executivo do veredito

| Critério | Astro | Eleventy | Hugo (excluído) |
|---|:---:|:---:|:---:|
| Match com 55 Must | Alto | Alto | Alto (perde no grafo) |
| Estabilidade da stack | Média (v5 jovem) | Alta | Alta |
| Curva para mantenedor solo | Média-alta (TS+React) | Baixa-média | Média (Go templates) |
| Comunidade + suporte IA | Alta | Média | Alta |
| Bus factor da stack | Alto (Astro Foundation) | Alto (Zach Leatherman + comunidade) | Muito alto |
| Sobrevivência 12 meses sem touch | 60-70% | 75-85% | 85-95% |
| Sobrevivência se Pagefind morre | Bom | Médio | Bom |
| Sobrevivência crescimento 2000 fichas | Bom | Excelente | Excelente |
| Build time GH Actions free tier | 60-120s | 10-30s | 5-15s |
| Bundle size típico | 12-100KB conforme rota | 12-92KB conforme rota | 0-90KB conforme rota |
| Risco de break em `npm update` | Médio-alto | Baixo-médio | Quase zero (binário) |
| **Recomendação para este projeto** | **NÃO (sem bolsista)** | **SIM (default)** | **Reabrir se grafo cair** |

**Decisão recomendada**: **Eleventy 3 + Tailwind 3 + Pagefind + Alpine + D3/Cytoscape (bundle local via npm)**, condicionada a:
1. PoC empírico de 12-16h antes de E.4.
2. ADR explícito sobre fallback Pagefind.
3. Cláusula de revisão se bolsista financiado for confirmado em ≤ 60 dias.

Sem essas três condições, qualquer escolha de stack é fé, não engenharia.