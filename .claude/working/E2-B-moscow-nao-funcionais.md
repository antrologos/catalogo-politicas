# E.2.B — MoSCoW de Requisitos NÃO-FUNCIONAIS (Avaliador Consensual B)

> Lente: **qualidades que o sistema TEM** (performance, acessibilidade, privacidade, segurança, SEO, i18n, mobile, observabilidade, manutenção, resiliência, conformidade, usabilidade). Funcionais (o que o sistema FAZ) são do Avaliador A.

**Pressupostos fechados (Checkpoint E.1):**
- Hospedagem GitHub Pages estático em `antrologos.github.io/catalogo-politicas/`.
- Analytics GoatCounter (free, sem cookies, IPs anonimizados).
- Mantenedor único (Rogério) sem garantia de tempo regular → automação agressiva.
- Identidade gov.uk-inspired (paleta neutra acadêmica).
- 8 wireframes MVP, incluindo mapa coroplético + grafo (com a11y reforçada).
- 439 fichas / 9 UFs + Federal / 148 snapshots integrais.

---

## MUST (sem isso o MVP NÃO existe — bloqueia lançamento)

### Performance

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-01** | PERFORMANCE | Core Web Vitals — LCP | LCP < 2.5s em 4G simulada (Lighthouse mobile p75). Crítico para SEO e abandono. Bloqueia se p75 > 4s. |
| **NF-M-02** | PERFORMANCE | Core Web Vitals — INP | INP (sucessor de FID em 2024) < 200ms p75. Mede responsividade real após clique/teclado. |
| **NF-M-03** | PERFORMANCE | Core Web Vitals — CLS | CLS < 0.1 p75. Reservar espaço para mapa SVG, VLibras, GoatCounter. |
| **NF-M-04** | PERFORMANCE | Bundle JS budget | Rota Home ≤ 100 KB gzipped; Ficha ≤ 60 KB; mapa/grafo lazy import. CI valida a cada PR. |
| **NF-M-05** | PERFORMANCE | Bundle CSS budget | CSS crítico inline ≤ 14 KB; total da rota ≤ 50 KB gzipped. Sem CSS-in-JS no MVP. |
| **NF-M-06** | PERFORMANCE | Tempo até 1ª busca útil (TTFI) | Digitar e ver resultados em ≤ 1.5s p75 4G. Pagefind build-time, sem API runtime. |

### Acessibilidade

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-07** | ACESSIBILIDADE | WCAG 2.2 AA + eMAG 3.1 | Contraste ≥ 4.5:1 / 3:1 UI; foco amarelo `#ffdd00`; aria-describedby; tab order lógico. **0 violações axe-core "serious"/"critical"** no build. |
| **NF-M-08** | ACESSIBILIDADE | Lei 13.146/2015 (LBI) declarada | Página `/sobre/acessibilidade` declarando conformidade WCAG 2.2 AA + eMAG 3.1 + LBI. Canal de relato de barreira. |
| **NF-M-09** | ACESSIBILIDADE | Mapa coroplético — alternativa textual | Lista textual paralela das 9 UFs com mesma informação (rank cobertura, contagem). Toggle visível. `role="img"` + `aria-label` no SVG; cada UF é `<path>` com `<title>` e `tabindex="0"`. |
| **NF-M-10** | ACESSIBILIDADE | Grafo — navegação por teclado | Lista textual de relacionamentos é fonte canônica; grafo é visualização opcional. Nós focalizáveis por Tab; Enter ativa; Esc fecha; aria-live anuncia mudança. |
| **NF-M-11** | ACESSIBILIDADE | Cor nunca é único indicador | Status (Ativa/Encerrada/Suspensa) sempre tem ícone + texto além de cor. Validado por axe + revisão em modo daltonismo. |
| **NF-M-12** | ACESSIBILIDADE | Estrutura semântica HTML | h1 único, landmarks (`<main>`, `<nav>`), `<table>` com `<caption>` e `scope`, listas reais. |

### Privacidade / LGPD

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-13** | PRIVACIDADE | Política de Privacidade visível | `/sobre/privacidade` obrigatória mesmo sem cookies. Declarar dados, finalidade, retenção, base legal LGPD art. 7º IX, DPO, transferência internacional. **Link no footer de TODA página.** |
| **NF-M-14** | PRIVACIDADE | Sem cookies não-essenciais | Zero cookies analytics/marketing. GoatCounter `no-tracking`. Banner LGPD não obrigatório. |
| **NF-M-15** | PRIVACIDADE | Logs anonimizados | GoatCounter com IP anonimizado (último octeto zerado). Sem fingerprint. |
| **NF-M-16** | PRIVACIDADE | Transferência internacional declarada | GitHub Pages = EUA; GoatCounter = UE. Declarado em `/sobre/privacidade` (LGPD art. 33). |
| **NF-M-17** | PRIVACIDADE | Sem formulários PII no MVP | Sem cadastro/comentário/email/contato. Feedback via issue GitHub. Elimina ~90% do risco LGPD. |

### Segurança

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-18** | SEGURANCA | HTTPS obrigatório | GitHub Pages força HTTPS. HSTS via meta. Sem fallback HTTP. |
| **NF-M-19** | SEGURANCA | Content Security Policy | `default-src 'self'`; `script-src 'self' https://gc.zgo.at`; sem `unsafe-inline`. Testar em csp-evaluator.withgoogle.com. |
| **NF-M-20** | SEGURANCA | Subresource Integrity | Toda CDN externa com `integrity="sha384-..."` + `crossorigin="anonymous"`. |
| **NF-M-21** | SEGURANCA | Sem JS de terceiros não auditado | Whitelist: GoatCounter + VLibras + fontes self-hosted. Documentado em `/sobre/dependencias`. |

### SEO

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-22** | SEO | schema.org JSON-LD em cada ficha | `Dataset` ou `GovernmentService` + `CreativeWork` com name/description/dateCreated/dateModified/license/creator/spatialCoverage/temporalCoverage. Validado em search.google.com/test/rich-results. |
| **NF-M-23** | SEO | sitemap.xml + robots.txt | Sitemap com todas 439 fichas + lastmod real. Submetido a Google/Bing. |
| **NF-M-24** | SEO | OpenGraph + Twitter Card | og:title/description/image/url/type + twitter:card="summary_large_image". |
| **NF-M-25** | SEO | URLs canônicas estáveis | Slugs determinísticos `/politica/{uf}/{slug}/`. `<link rel="canonical">`. Redirect 301 em mudanças. |

### Mobile

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-26** | MOBILE | Responsivo desde 320px | Layout funcional em iPhone SE 1ª gen. Sem scroll horizontal involuntário. |
| **NF-M-27** | MOBILE | Touch targets ≥ 44×44 px | gov.uk recomenda 44×44 (WCAG mínimo 24×24). Aplicar a botões/links/ícones/nós do grafo. |
| **NF-M-28** | MOBILE | Mapa + grafo com fallback mobile | Em < 768px: mapa → lista UFs sortable; grafo → lista textual. Sem pinch-zoom em SVG complexo. |

### Manutenção / Resiliência

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-29** | MANUTENCAO | Build reproducível | `just build` em máquina limpa = site idêntico. lock file + `.nvmrc`. CI valida. |
| **NF-M-30** | RESILIENCIA | Snapshot fallback | Toda referência externa exibe URL original + "Ver snapshot capturado em DD/MM/AAAA". Já em schema v0.2. |
| **NF-M-31** | RESILIENCIA | Sem dependência de serviços pagos | 100% em GitHub Pages free + GoatCounter free + GH Actions free. |

### Conformidade

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-32** | CONFORMIDADE | LAI — link "Sobre os dados" | Footer → `/sobre/transparencia` com política de revisão, histórico, changelog, canal de relato (Lei 12.527/2011). |
| **NF-M-33** | CONFORMIDADE | Licença CC-BY 4.0 visível | Footer + `/sobre/termos` + cada ficha + `LICENSE` na raiz. Atribuição FRM/IESP-UERJ. |
| **NF-M-34** | CONFORMIDADE | Citação acadêmica formal | APA + ABNT + BibTeX + RIS + botão "Copiar". CITATION.cff. (Persona pesquisador.) |

### Usabilidade

| ID | Categoria | Nome curto | Descrição + métrica |
|---|---|---|---|
| **NF-M-35** | USABILIDADE | Tempo até 1ª ação útil | ≤ 10s da Home até digitar busca ou clicar UF. Mede com 5 usuários no Bloco F. |

---

## SHOULD

### Performance
- **NF-S-01** PERFORMANCE — Imagens WebP/AVIF + `loading="lazy"` + `<picture>` srcset.
- **NF-S-02** PERFORMANCE — Fonts self-hosted (não Google Fonts CDN); `font-display: swap`; WOFF2.
- **NF-S-03** PERFORMANCE — Cache HTTP agressivo (`max-age=31536000, immutable` para hashed assets).
- **NF-S-04** PERFORMANCE — Mapa coroplético lazy-loaded via IntersectionObserver com skeleton.
- **NF-S-05** PERFORMANCE — Pagefind chunked search index (≤ 5 MB total, ≤ 200 KB típico baixado).

### Acessibilidade
- **NF-S-06** ACESSIBILIDADE — VLibras widget (vlibras.gov.br) — script oficial gov.br.
- **NF-S-07** ACESSIBILIDADE — Skip links visíveis ao receber foco.
- **NF-S-08** ACESSIBILIDADE — Modo escuro `prefers-color-scheme` + toggle (localStorage = exceção funcional, não tracking).
- **NF-S-09** ACESSIBILIDADE — `aria-live="polite"` para "X resultados encontrados" em busca.

### Privacidade
- **NF-S-10** PRIVACIDADE — `<meta name="robots" content="noai, noimageai">` + `ai.txt` (formaliza atribuição esperada para LLMs).
- **NF-S-11** PRIVACIDADE — DPO declarado em `/sobre/privacidade` (LGPD art. 41 boa prática).

### Segurança
- **NF-S-12** SEGURANCA — Headers extras (X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- **NF-S-13** SEGURANCA — `npm audit` no CI + Dependabot; bloqueia merge em vuln high/critical.

### SEO
- **NF-S-14** SEO — Breadcrumb schema.org (BreadcrumbList JSON-LD).
- **NF-S-15** SEO — RSS/Atom feed `/feed.xml` (atrai pesquisadores e LLMs legítimos).
- **NF-S-16** SEO — Pretty 404 com fuzzy match + 5 mais consultadas + busca; HTTP 404 real.

### Observabilidade
- **NF-S-17** OBSERVABILIDADE — GoatCounter dashboards (top pages, busca interna via `data-goatcounter-click`, referrers).
- **NF-S-18** OBSERVABILIDADE — Link broken alerts via cron GH Action semanal; abre issue se ≥ 5% quebram.
- **NF-S-19** OBSERVABILIDADE — Erro client-side capturado (Sentry free OU `window.onerror` → GoatCounter).

### Manutenção
- **NF-S-20** MANUTENCAO — `docs/RUNBOOK.md` (onboarding ≤ 1 dia).
- **NF-S-21** MANUTENCAO — Cron de revalidação semestral via GH Actions (já tem `just revalidar`); abre PR com diff.
- **NF-S-22** MANUTENCAO — CI roda JSON Schema + axe + Lighthouse-CI; bloqueia merge.
- **NF-S-23** MANUTENCAO — Página `/sobre/status` auto-gerada (último build, % snapshot, % URLs OK).

### Conformidade
- **NF-S-24** CONFORMIDADE — DOI Zenodo a cada release; em citação acadêmica.
- **NF-S-25** CONFORMIDADE — Página `/sobre/cobertura` combatendo viés 9 UFs (blind spot 2 adversarial).
- **NF-S-26** CONFORMIDADE — SemVer do catálogo (v1.0.0…); release tagueada; `/sobre/versoes`.

### Usabilidade
- **NF-S-27** USABILIDADE — Pagefind primeiro resultado em ≤ 200ms (após índice carregado).
- **NF-S-28** USABILIDADE — Comparação inter-UF em ≤ 500ms; dados pré-indexados em build.
- **NF-S-29** USABILIDADE — URL como estado (filtros/UFs/query/aba) + botão "Copiar link desta visão".

---

## COULD

| ID | Categoria | Item |
|---|---|---|
| **NF-C-01** | PERFORMANCE | Service Worker offline-first (Workbox) |
| **NF-C-02** | PERFORMANCE | Pre-fetch de rotas em hover/visible |
| **NF-C-03** | I18N | Estrutura pronta para EN/ES (i18next + 1 locale) |
| **NF-C-04** | I18N | Atributos `lang` por bloco (`<span lang="en">`) |
| **NF-C-05** | OBSERVABILIDADE | Heatmap free (Microsoft Clarity) — só se passar revisão LGPD |
| **NF-C-06** | MANUTENCAO | Histórico de mudanças por ficha (versionamento JSON) |
| **NF-C-07** | MANUTENCAO | Endpoint CKAN/DCAT-AP-BR `/api/dataset.json` |
| **NF-C-08** | RESILIENCIA | Mirror em arweave/IPFS |
| **NF-C-09** | USABILIDADE | Atalhos de teclado documentados (`?` `/` `Esc` `j/k`) |
| **NF-C-10** | USABILIDADE | Modo "compare lado a lado" (picker + diff) |
| **NF-C-11** | SEO | Sitemap de imagens |
| **NF-C-12** | CONFORMIDADE | ISBN para volume publicado (se houver PDF impresso) |

---

## WON'T (fora do MVP)

| ID | Categoria | Item — Por que NÃO |
|---|---|---|
| **NF-W-01** | OBSERVABILIDADE | Google Analytics / Meta Pixel — gera obrigação LGPD + transferência internacional + banner |
| **NF-W-02** | OBSERVABILIDADE | A/B testing platform — público nicho não justifica |
| **NF-W-03** | I18N | Tradução completa EN/ES — 40-80h profissional, Bloco G |
| **NF-W-04** | USABILIDADE | Login/cadastro/favoritos — implica LGPD complexa, BD, autenticação |
| **NF-W-05** | USABILIDADE | Comentários/fórum — sem moderador, spam mata |
| **NF-W-06** | USABILIDADE | Newsletter por email — coleta PII + SMTP + opt-in. RSS cobre |
| **NF-W-07** | PERFORMANCE | CDN paga — GH Pages usa Fastly free; suficiente |
| **NF-W-08** | SEGURANCA | WAF/DDoS pago — sem dados sensíveis |
| **NF-W-09** | RESILIENCIA | Multi-region failover — site estático já é multi-region |
| **NF-W-10** | MANUTENCAO | Painel admin no site — edição via git+PR; reduz superfície de ataque |
| **NF-W-11** | OBSERVABILIDADE | Alerting realtime (PagerDuty) — site estático sem incidente contínuo |
| **NF-W-12** | CONFORMIDADE | WCAG 2.2 AAA — conflita com decisões de design; AAA pontual fica em Could |

---

## Resumo executivo

| Bucket | Quantidade |
|---|---:|
| **Must** | **35** |
| **Should** | **29** |
| **Could** | **12** |
| **Won't** | **12** |
| **Total** | **88** |

### 5 métricas-chave de sucesso do MVP

| # | Métrica | Alvo | Ferramenta | Por quê |
|---|---|---|---|---|
| 1 | Lighthouse mobile p75 | Perf ≥90, A11y =100, BP ≥90, SEO ≥95 | Lighthouse-CI no GH Actions | Resume Performance + A11y + SEO num número defensável; bloqueia regressão |
| 2 | Tempo até 1ª busca útil em 4G | ≤ 1.5s p75 | RUM via GoatCounter / `PerformanceObserver` | Persona técnico/coordenador estadual em rede ruim de secretaria |
| 3 | Violações axe-core serious+critical | = 0 em build | axe-core CI + auditoria semestral com leitor de tela | Não-conformidade WCAG = risco legal (Lei 13.146/2015) + barreira real |
| 4 | % URLs externas com snapshot funcional | ≥ 95% (hoje 55%) | Cron de revalidação + `/sobre/status` | Promessa central é "proteção contra link rot"; abaixo de 95% promessa é falsa |
| 5 | Manutenção semanal real (após 3 meses) | ≤ 2h/semana | Time-tracking pessoal do Rogério | Mantenedor único é a maior dívida técnica; > 2h/semana → catálogo se degrada em 18 meses (alerta E.1.F) |

---

## Notas finais

- **35 Must é alto, mas todos têm justificativa de bloqueio** (legal: LGPD/LBI/LAI/CC-BY; SEO core; performance core; a11y crítica; resiliência fundamental).
- **A11y do mapa e grafo é o ponto mais arriscado:** decisão E.1 manteve mapa coroplético + grafo apesar do alerta adversarial. NF-M-09 e NF-M-10 transferem o risco para implementação — se não cumpridos no Bloco F, recomendo escalar de volta para a usuária e cortar mapa/grafo.
- **Manutenção é o calcanhar de Aquiles:** NF-M-29 + NF-S-18 + NF-S-21 + NF-S-22 + métrica-chave #5 são o sistema de defesa contra "lixo digital em 18 meses".
- **LGPD foi tratada como obrigatória, não opcional** (NF-M-13 a NF-M-17), conforme blind spot 1 adversarial.
- **Viés 9 UFs** entra como Should (NF-S-25 página `/sobre/cobertura`) — é mais funcional que não-funcional, mas a transparência declarativa é qualidade do sistema.