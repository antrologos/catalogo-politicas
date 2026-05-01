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
- [ ] Busca Pagefind funcional com 5 facetas mínimas
- [ ] Sobre + Privacidade LGPD + Acessibilidade declarada
- [ ] CI bloqueia PR se axe critical+serious > 0
- [ ] Lighthouse Perf ≥90, A11y ≥95, BP ≥90, SEO ≥95
- [ ] Beta privado com ≥3 gestores

### M2 (fim de F.2)
- [ ] 10 páginas `/uf/<sigla>/` funcionais
- [ ] Comparação inter-UF até 9 UFs com URL determinística
- [ ] Equipe FRM revisou conteúdo

### M3 (lançamento)
- [ ] Mapa coroplético interativo + lista textual canônica passa NVDA+JAWS+VoiceOver
- [ ] Grafo Cytoscape + DOM mirroring passa auditoria a11y manual
- [ ] DOI Zenodo do catálogo emitido
- [ ] Anúncio público em FRM/IESP + redes acadêmicas (ANPED, ANPOCS)

## Documentação a atualizar ao final do Bloco F

- `CLAUDE.md` (raiz): seção "Onde estamos agora" → "Bloco F concluído. MVP público em https://antrologos.github.io/catalogo-politicas/. Próximo: Bloco G (iteração)."
- `MEMORY.md` global do projeto: registrar lições aprendidas + decisões de Bloco F.
- `README.md` do repo: capturas de tela, link MVP, instruções de contribuição.
- `docs/RUNBOOK.md`: procedimento de manutenção mensal/semestral, troubleshooting.
- `.claude/plans/2026-MM-DD_bloco-g-iteracao.md`: rascunho do próximo bloco.

## Status

- [x] RASCUNHO criado em 2026-05-01
- [x] APROVADO no Checkpoint E.6 (2026-05-01) — usuária optou "Executar E.6 direto"
- [ ] Sprint 0 iniciado (preparatório)
- [ ] M1 atingido
- [ ] M2 atingido
- [ ] M3 atingido (lançamento)
- [ ] CONCLUIDO

## Referências cruzadas

- Plano macro: `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`
- ADR-007 (stack Eleventy)
- ADR-008 (fallback Pagefind→Lunr)
- ADR-009 (cláusula reabertura mantenedor — limite 2026-07-01)
- ADR-010 (escopo MVP 55 Must)
- E.1-E.5 outputs em `.claude/working/E{1,2,3,4,5}-*.md`