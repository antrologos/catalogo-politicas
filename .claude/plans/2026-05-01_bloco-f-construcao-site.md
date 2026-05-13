# Plano: Bloco F — Construção do site catálogo de políticas

**Status**: APROVADO
**Data**: 2026-05-01
**Bloco/Rodada**: F (construção)

## Contexto

O Bloco E (UX/benchmark/PoC) foi concluído em 2026-05-01 com:
- **PoC Eleventy validado** em 1.5h (vs 16h alvo). Site no ar em https://antrologos.github.io/catalogo-politicas/.
- **55 Must consolidados** em [E.2.D](.claude/working/E2-D-moscow-consolidado.md) (ADR-010).
- **Stack confirmada**: Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla JS / Alpine + D3 + Cytoscape (ADR-007).
- **8 wireframes definidos** (ambição mantida; sem cortes adversariais — ADR-010).
- **Sistema de design** documentado em [E.5-design-system.md](.claude/working/E5-design-system.md).
- **Política B (a11y) prevalece** em conflitos — Tabs ARIA W3C, mapa→lista mobile, 404 fuzzy match Must.
- **Mantenedor solo até decisão FRM/IESP** (cláusula reabertura ADR-009 vigente até 2026-07-01).

Bloco F transforma o esqueleto PoC (10 fichas, 5 páginas) num site completo com 439 fichas e os 8 wireframes integrados.

## Objetivo

Entregar o MVP público do Catálogo de Políticas Públicas Brasileiras com:
- 439 fichas individuais navegáveis
- Busca facetada com 7+ filtros
- 9 páginas executivas por UF + 1 Federal
- Comparação inter-UF até 9 estados
- Mapa coroplético interativo + lista textual paralela acessível
- Grafo de relacionamentos por política
- Citação acadêmica formal (ABNT/APA/BibTeX/RIS)
- WCAG 2.2 AA + eMAG 3.1 + LBI 13.146/2015
- Política de Privacidade LGPD-compliant
- Backup off-Drive automatizado
- CI/CD bloqueante (axe + Lighthouse + JSON Schema)

## Abordagem — 3 Ondas em sequência

### ONDA F.1 — Esqueleto operacional (~150-280h conforme E.5 + E.4.C)

**Objetivo**: persona técnica completa sessão de 30min com export.

**Entregáveis**:
- W3 Ficha individual (439 rotas via `pagination`)
- W2 Busca facetada (Pagefind + URL state)
- W1 Home/Dashboard (KPIs + autocomplete; mapa diferido para F.3)
- W8 Sobre + sub-rotas (Privacidade LGPD obrigatória)
- W7' 404 com fuzzy match
- CI/CD GitHub Actions com axe-core + Lighthouse + JSON Schema bloqueantes
- Backup off-Drive mensal
- ADRs 007-010 publicados

**Sprints F.1**:
1. **Sprint 0 (preparatório)** — gaps de tokens (`:focus-visible` inset, `prefers-reduced-motion`, mono font, descontinuada tag, self-host Open Sans) + componentes mínimos (`breadcrumb.njk`, `button.njk`, `badge.njk`, `skip-links.njk`).
2. **Sprint 1 (W3 Ficha)** — `tabs.njk` + `tabs.js` (W3C ARIA APG completo, ~18-32h) + `citation-box.njk` + `copy.js` + refator `ficha.njk` + `table-sortable.njk`.
3. **Sprint 2 (W2 Busca)** — `search-input.njk` + `filter-fieldset.njk` + `card-policy.njk` + `pagination.njk` + `filters.js` + `shortcuts.js`.
4. **Sprint 3 (W1 Home)** — KPI Card variant + lista textual UFs + integração tudo. Mapa interativo opcional.
5. **Sprint 4 (W7' 404 + W8 Sobre)** — `fuzzy-404.js` + sub-rotas Sobre + `card-nav.njk` + Citation Box reutilizado.
6. **Sprint 5 (header/footer polish)** — `aria-current`, hambúrguer mobile, VLibras, `/sobre/acessibilidade/` declaração formal.

**Marco M1**: site no ar com 439 fichas + busca + Sobre. Beta privado para 2-3 gestores reais.

### ONDA F.2 — Profundidade UF + comparação (~80-130h)

**Objetivo**: persona estadual tem página dedicada e pode comparar.

**Entregáveis**:
- W4 Página executiva por UF (10 rotas: 9 UFs + Federal)
- W5 Comparação inter-UF (até 9 estados, 4 abas Tabela/Gráfico/Mapa/Por Política)

**Sprints F.2**:
7. **Sprint 6 (W4 UF)** — `card-kpi.njk` + barras horizontais clicáveis + filtros locais escopados.
8. **Sprint 7 (W5 Comparação)** — `comparacao.njk` + 4 abas + mapa interativo seleção múltipla + `comparacao.js`.

**Marco M2**: 10 páginas UF + comparação funcionais. Convite à equipe FRM para revisão.

### ONDA F.3 — Visualizações ricas (~130-220h)

**Objetivo**: explorar visualmente; valor analítico/comunicacional.

**Entregáveis**:
- W6 Mapa coroplético dedicado (com lista textual paralela canônica)
- W7 Grafo de relacionamentos (com lista textual paralela canônica)
- DOI Zenodo do catálogo
- Lançamento público

**Sprints F.3**:
9. **Sprint 8 (W6 Mapa dedicado)** — `mapa.js` D3 + lista textual paralela + filtros dimensão + download PNG/SVG.
10. **Sprint 9 (W7 Grafo)** — `grafo.js` Cytoscape + DOM mirroring + lista textual canônica + toolbar acessível.
11. **Sprint 10 (lançamento)** — DOI Zenodo + revisão final + auditoria a11y manual com NVDA/JAWS/VoiceOver + plano divulgação.

**Marco M3**: lançamento público. Anúncio FRM/IESP, ANPED, ANPOCS, redes acadêmicas.

## Estimativa de tempo total

| Cenário | Esforço total | Duração estimada |
|---|---|---|
| Solo 4h/sem (16h/mês) | 480-1070h | 30-67 meses ≈ **2.5-5.5 anos** |
| Solo 8h/sem (32h/mês, otimista) | 480-1070h | 15-33 meses ≈ **1.3-2.8 anos** |
| Bolsista 28h/sem (112h/mês) | 480-1070h | **4-9.5 meses** |

## Arquivos a modificar/criar

### Em `site/` (clone fora do Drive: `C:/Users/antro/dev/catalogo-politicas/site/`)

**Templates Eleventy** (`src/_includes/`):
- `layouts/{base,ficha,uf,comparacao}.njk`
- `components/{header,footer,tag-status,breadcrumb,button,badge,skip-links,card-policy,card-kpi,card-nav,filter-fieldset,search-input,pagination,citation-box,tabs,table-sortable}.njk`
- `partials/{citacao,metadados,vlibras}.njk`

**Páginas** (`src/`):
- `index.njk` (W1)
- `buscar.njk` (W2)
- `politica/ficha.njk` (W3 — pagination 439 rotas)
- `uf/pagina-uf.njk` (W4 — pagination 10 rotas)
- `comparacao.njk` (W5)
- `mapa.njk` (W6)
- `grafo/index.njk` + `grafo.njk` por política (W7)
- `404.njk` (W7')
- `sobre/{index,metodologia,cobertura,privacidade,termos,acessibilidade,transparencia,changelog,status}.md` (W8)

**Dados** (`src/_data/`):
- `policies.js` (já existe; expandir para 439 fichas via `data/derived/latest.json`)
- `site.js`, `equipe.yml`, `ufs.js`, `comparacoes.js` (build-time agregados), `citacoes-reversas.json` (build-time grep)

**JS Vanilla** (`src/assets/js/`):
- `tabs.js`, `copy.js`, `filters.js`, `shortcuts.js`, `fuzzy-404.js`, `mapa.js` (D3), `grafo.js` (Cytoscape), `comparacao.js`, `sortable-table.js`

**CSS** (`src/assets/css/`):
- `tailwind.css` (expandir; já existe com classes utilitárias)
- `print.css` (para PDF)

**Assets**:
- `public/fonts/` (Open Sans WOFF2 self-hosted)
- `public/snapshots/` (symlink ou copy de `data/external_snapshots/`)
- `public/downloads/` (CSV/JSON brutos para pesquisador)
- `public/assets/geo/br_ufs.json` (GeoJSON UFs estático)

### Fora de `site/`

- `.github/workflows/`:
  - `deploy.yml` (existe; expandir com axe-core + Lighthouse-CI bloqueantes)
  - `validate.yml` (cron diário JSON Schema)
  - `linkcheck.yml` (cron semanal lychee)
  - `lhci.yml` (cron semanal Lighthouse-CI)
  - `backup.yml` (cron mensal tarball)

- `data/derived/`:
  - `latest.json` (já existe; será re-gerado nas próximas ondas)
  - `build-status.json` (gerado a cada build pelo `eleventy.config.js`)

- `.claude/decisions/`:
  - ADR-007, 008, 009, 010 (já criados em E.6)
  - Novos ADRs conforme decisões surgirem em F.1/F.2/F.3

- `docs/RUNBOOK.md` (criar — Sprint 0)

## Arquivos que NÃO serão tocados

- `data/raw/Fichas das Políticas - 1ª onda.xlsx` (fonte primária imutável)
- `data/external_snapshots/<sha[:2]>/<sha>.<ext>` (snapshots imutáveis após captura)
- `scripts/etl/**` (pipeline ETL existente; só leitura via `data/derived/latest.json`)
- `scripts/captura/**` (skill capturar-norma; reutilizada em revalidação)
- `.claude/rules/**`, `.claude/hooks/**`, `.claude/skills/**` (consolidados em Bloco A)

## Testes previstos

### Por sprint
- **Toy/unit tests** em `site/tests/`: filtros Nunjucks (`dataBR`, `filterByUf`, `groupByUf`, `citacaoAbnt`, `citacaoBibtex`).
- **E2E Playwright** em `site/tests/e2e/`: Home/Busca/Ficha smoke; busca com filtros; ficha com snapshot link.
- **A11y axe-core** em CI: `axe-playwright` em todas as páginas-tipo. Bloqueia PR se violação serious/critical.
- **Lighthouse-CI**: Perf ≥90 mobile, A11y axe-core 0 critical, BP ≥90, SEO ≥95. Bloqueia PR se abaixo.
- **JSON Schema**: `ajv-cli validate -s policies-schema.json -d data/derived/latest.json` em CI.

### Por marco
- **M1**: smoke test manual em 5 fichas + 3 buscas + Sobre/Privacidade. Beta privado com 2-3 gestores.
- **M2**: validação de comparação inter-UF + página executiva por UF com equipe FRM.
- **M3**: auditoria a11y manual com NVDA + JAWS + VoiceOver. Validação com 3 gestores reais com deficiência.

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Drive sync × npm install (EBADF) | Alta | Bloqueante | Documentado em RUNBOOK; desenvolvimento em `C:/Users/antro/dev/`. |
| Velocidade real solo abaixo de 8h/sem | Alta | Cronograma estende | Cláusula reabertura ADR-009; cortes E.4.C como contingência. |
| Tabs ARIA W3 quebrar a11y por implementação custom | Média | Alto | Considerar biblioteca testada (ex: `@reach/tabs` se compatível com vanilla); auditoria axe + manual NVDA antes de merge. |
| Cytoscape grafo W7 inacessível por padrão | Alta | Crítico | Lista textual paralela canônica (NF-M-10) é fonte de verdade; grafo é decoração visual; opt-in mobile. |
| Pagefind escala falha em 439 fichas + 148 snapshots | Baixa | Médio | PoC validou com 10 fichas; testar com 100 e 439 antes de F.2. Plano fallback Lunr.js (ADR-008). |
| Mantenedor sumir por 6+ meses | Média | Médio | CONS-M-02 plano de continuidade documentado em Sprint 0. Site continua no ar. |
| Pico de tráfego > 100GB GH Pages free | Baixa | Baixo | CONS-S-02 fallback Cloudflare em frente do GH Pages se necessário (Bloco G). |

## Verificação pós-implementação (por marco)

### M1 (fim de F.1)
- [ ] 439 fichas em `/politica/<slug>/` retornam 200
- [ ] Home com KPIs reais (`439 / 9+Federal / 148`)
- [x] Busca Pagefind funcional com 5 facetas mínimas (PoC F.1+F.2; sinônimos curados em MVP-UX F1)
- [x] Sobre + Privacidade LGPD + Acessibilidade declarada (8 páginas /sobre/ + glossário 32 termos + comece-por-aqui em MVP-UX F3)
- [x] CI bloqueia PR se axe critical+serious > 0 (pa11y-ci AA bloqueante ativo desde PoC)
- [x] Lighthouse Perf ≥90, A11y ≥95, BP ≥90, SEO ≥95 (mantido em todos os pushes; verificado em CI)
- [ ] Beta privado com ≥3 gestores (não acionado; pendente decisão da usuária)

### M2 (fim de F.2)
- [x] 10 páginas `/uf/<sigla>/` funcionais (entregue em F.2)
- [x] Comparação inter-UF até 9 UFs com URL determinística (entregue em F.2; nota visível "comparação semântica em desenvolvimento" adicionada em MVP-UX F4 — versão completa adiada para pós-bolsista por decisão da usuária)
- [ ] Equipe FRM revisou conteúdo (não acionado; pendente decisão da usuária)

### Marcos adicionais inseridos durante execução

#### M1.5 (EX.1+EX.2+EX.3 — descoberta + browse)
- [x] Hub `/explorar/` mosaico visual com 7 cards
- [x] 18 páginas índice por dimensão (`/tipo/X/`, `/situacao/X/`, `/modalidade/X/`, `/abrangencia/X/`)
- [x] Descoberta lateral nas fichas (família federal canônica + replicas + relacionadas)

#### M2.5 (MVP-UX — Onda V + Onda F)
- [x] Onda V (estética): chips canônicos, IBM Plex, paleta autoral, Phosphor inline, hero refactor, footer + print
- [x] Onda F (facilidade): Pagefind sinônimos, Highwire+Schema.org+sitemap, glossário+comece, dedup BA+microcopy
- [x] Tag git `v0.2.0-mvp-ux` (release M1)
- [x] ADR-011 (paleta autoral) + ADR-012 (Phosphor) publicados

### M3 (lançamento)
- [x] Sprint 8.1 — mapa coroplético D3 funcional em `/mapa/` (Sprint 8.2: 3 modos coloração + download SVG/PNG)
- [x] Sprint 8.4 — integração nav + hero + footer + /explorar/ + /uf/ (5 pontos de entrada; commit `70009b7`, 2026-05-03)
- [x] Sprint 8.3 — mobile responsive + a11y polish do mapa (commit `31e9f6b`, 2026-05-03; skip-link + aria-live + tabindex paths cobertos + Pointer Events + reduced-motion + max-h responsiva)
- [x] Sprint 9 — Grafo Cytoscape COMPLETO (commits 31201d8→7c56ea7, 2026-05-03):
  * 9.1 MVP (439 nodes + 255 edges família + lista textual paralela)
  * 9.2 Toolbar com filtros tipo/situação + highlight família ao hover
  * 9.3 Edges 'articulação' por curadoria humana (8 articulações substantivas; substring matching descartado)
  * 9.4 Mobile responsive + a11y polish (tabindex container + setas + Enter + aria-live)
  * 9.5 Integração: nav + hub + footer + hero + ficha (5 pontos de entrada)
- [x] Sprint 9.6 — Refator visual Sprint 9 (LOD + revelação progressiva, commits fc8f9e8/dafc8b0/499d324, 2026-05-03)
- [x] Sprint 9.7+ — Re-arquitetura grafo com compound nodes + drill-down + 438 articulações curadas (commit `534bbab` site + `b0fbb7d` drive, 2026-05-04):
  * Plugin `cytoscape-expand-collapse@4.1.1` UMD CDN
  * 33 famílias federais (compound-federal) + 9 clusters UF (compound-uf), todos colapsados no estado inicial
  * 438 articulações curadas humanamente nas 9 UFs (BA: 62, SP: 37, RJ: 50, PE: 55, MG: 43, CE: 54, PR: 41, RS: 46, PA: 42); citação literal preservada como proveniência
  * Edges de articulação ocultas no estado totalmente colapsado (`.edge-hidden`); reaparecem dinamicamente ao expandir uma família
  * 37 estaduais isoladas filtradas do grafo (preservadas integralmente em `#lista-familias`)
  * **Polish visual adiado por decisão da usuária 2026-05-04** — layout cose-bilkent ainda agrupa compounds num cluster denso na metade inferior; iteração futura documentada em `~/.claude/projects/.../memory/project_grafo_estado_2026_05_04.md`
- [x] Sprint 9.8 — Polish ficha + Sobre (entregue 2026-05-04, commit `dba2467` site + `37302e4` drive):
  * Removida seção "Proveniência" pública da ficha (revisado_por, próxima revisão, versão, ID interno); dados continuam em meta tags HTML, JSON-LD Schema.org e citações acadêmicas
  * Removida data "Revisado em" do header + bloco "Snapshot capturado" + SHA-256
  * Tooltips `<abbr>` em "Tipo de oferta", "Modalidade", "Arranjo logístico" + valores "Misto" + glossário `<details>` ao final da aba Detalhes
  * Refatorada aba "Como citar este verbete": autoria do verbete = equipe de pesquisa (Maria Clara da Gama, Maria Julieta Ramalho Garcia, Cintia Maria Frazão, Jaqueline Sant'ana); organização = Rogério Jerônimo Barbosa; publicação = Ceres/IESP-UERJ. Filtros `citacaoAbnt/Apa/Bibtex/Ris` reescritos + meta tags Highwire + JSON-LD Dataset atualizadas
  * Removido parêntese `(FRM, Fundação Bradesco, IESP-UERJ)` de todos os textos corridos (citation-box, equipe.js, sobre/index.md, sobre/privacidade.md, sobre/termos.md, ficha-meta.njk)
  * CERES e MAPE linkados com URLs oficiais fornecidas pela usuária: `https://ceres-iesp.uerj.br/` e `https://mape.org.br/` (MAPE tem domínio próprio)
  * Legibilidade das referências: `text-sm` → `text-base`, `border-neutral-200` → `border-neutral-300`, `font-medium`
  * Detalhes em `memory/project_sprint_9_8_ficha_polish_2026_05_04.md`
- [ ] Sprint 9.9 — Polish visual do grafo (adiado, sem prazo)
- [ ] Sprint 10 — DOI Zenodo + auditoria a11y manual + plano divulgação institucional (ADIADO por decisão da usuária 2026-05-03)
- [ ] Mapa coroplético + grafo passam NVDA+JAWS+VoiceOver (depende Sprint 10)
- [ ] DOI Zenodo do catálogo emitido (depende Sprint 10)
- [ ] Anúncio público em FRM/IESP + redes acadêmicas (depende Sprint 10)

## Documentação a atualizar ao final do Bloco F

- `CLAUDE.md` (raiz): seção "Onde estamos agora" → "Bloco F concluído. MVP público em https://antrologos.github.io/catalogo-politicas/. Próximo: Bloco G (iteração)."
- `MEMORY.md` global do projeto: registrar lições aprendidas + decisões de Bloco F.
- `README.md` do repo: capturas de tela, link MVP, instruções de contribuição.
- `docs/RUNBOOK.md`: procedimento de manutenção mensal/semestral, troubleshooting.
- `.claude/plans/2026-MM-DD_bloco-g-iteracao.md`: rascunho do próximo bloco.

## Status

- [x] RASCUNHO criado em 2026-05-01
- [x] APROVADO no Checkpoint E.6 (2026-05-01) — usuária optou "Executar E.6 direto"
- [x] Sprint 0 + Sprints 1-5 (F.1+F.2) entregues em PoC
- [x] EX.1+EX.2+EX.3 inseridos (descoberta+browse) entregues 2026-05-02 (commit `db79cb9` + adições)
- [x] M1 atingido (MVP-UX tag `v0.2.0-mvp-ux` em 2026-05-03)
- [x] M2 entregue parcialmente (UF + comparação quantitativa OK; comparação semântica adiada para pós-bolsista)
- [ ] M3 em execução (Sprint 8.1+8.2 entregues; Sprint 8.3, 8.4, 9 pendentes; Sprint 10 ADIADO por decisão da usuária)
- [ ] CONCLUIDO (depende Sprint 9 + decisão sobre Sprint 10)

## Referências cruzadas

- Plano macro: `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`
- ADR-007 (stack Eleventy)
- ADR-008 (fallback Pagefind→Lunr)
- ADR-009 (cláusula reabertura mantenedor — limite 2026-07-01)
- ADR-010 (escopo MVP 55 Must)
- E.1-E.5 outputs em `.claude/working/E{1,2,3,4,5}-*.md`