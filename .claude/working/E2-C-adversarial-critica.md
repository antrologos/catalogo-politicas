# E.2.C — Crítica Adversarial dos MoSCoW Funcionais (A) e Não-Funcionais (B)

> Output do agent ADVERSARIAL do sub-bloco E.2. Leu integralmente E.2.A (41 funcionais), E.2.B (88 não-funcionais), E.1.F (adversarial anterior) e `project_catalogo_politicas.md`. Missão: discordar com fundamento; achar buracos.
> Data: 2026-05-01

## TL;DR

**50 Must (15 funcionais + 35 não-funcionais) é INSUSTENTÁVEL para mantenedor único.**

A meta declarada no próprio E.2.B é "≤ 2h/semana de manutenção real após 3 meses" (NF-M-35-correlato; métrica-chave #5). Esse alvo é **incompatível** com o conjunto Must apresentado. A própria nota final de B admite "35 Must é alto", e A já sugere rebaixamentos (F-M08, F-M12) na última linha. Esta crítica formaliza esses sinais.

Veredito antecipado: **cortes drásticos exigidos** — recomendo reduzir Must para ~30 (≈10 funcionais + ~20 não-funcionais), com 5 movimentos de rebaixamento, 5 de promoção, deduplicação de 6 pares e adição de 5 itens ausentes.

---

## 1. Top 5 itens para REBAIXAR de Must para Should

Critério: a ausência do item **não bloqueia lançamento**, e mantê-lo como Must drena horas que comprometem itens genuinamente bloqueadores.

### 1.1 — F-M08 "Página executiva por UF" → SHOULD

- **Razão:** funcionalidade pode ser obtida combinando F-M02 (busca) + F-M03 (filtro UF) sem página dedicada. O autor de A reconhece isso na recomendação final ("substituível pela combinação F-M02 + F-M03"). 9 páginas executivas exigem 9 layouts cuidados, KPIs por UF, distribuição por eixo, ordenação — trabalho não-trivial cuja ausência **degrada UX mas não invalida MVP**.
- **Risco compensador:** persona primária (técnico estadual) entra direto pelo seu estado. Mitigação: home oferece dropdown "Selecione sua UF" → leva a `/buscar?uf=XX`. Hotfix em 4 semanas se sentir falta.
- **Economia estimada:** 12-20h.

### 1.2 — F-M12 "Página 404 com fuzzy match" → SHOULD

- **Razão:** 404 estática com lista de 5 políticas mais consultadas + caixa de busca já cumpre WCAG e SEO. Fuzzy match em slugs requer JS adicional e tabela de redirects mantida (o que é trabalho contínuo). Lançar com 404 simples não é antiprofissional. NF-S-16 (B) já classifica esse mesmo item como Should, **criando conflito** entre A e B.
- **Risco compensador:** baixo — 404 simples ainda redireciona, sitemap é estável no MVP.
- **Economia estimada:** 6-10h.

### 1.3 — NF-M-04 e NF-M-05 "Bundle JS/CSS budgets numéricos enforced em CI" → SHOULD

- **Razão:** budget enforcement em CI (≤100KB Home, ≤60KB Ficha, ≤14KB CSS crítico inline) é **engenharia de site grande**. Para 439 fichas estáticas em GitHub Pages, com Pagefind como busca, o bundle natural já tende a ficar pequeno. Configurar `bundlewatch`/`size-limit` + falhar PR é trabalho de infra ongoing. Lighthouse-CI (NF-S-22) já cobre o sintoma (LCP, INP, CLS) sem disciplina de gramas-de-bytes.
- **Risco compensador:** se LCP/INP/CLS ficarem dentro dos targets (NF-M-01/02/03), o budget é instrumentação, não objetivo.
- **Economia estimada:** 6-12h iniciais + ~30min por PR ao longo do projeto.

### 1.4 — NF-M-19 "Content Security Policy strict" → SHOULD

- **Razão:** CSP com `default-src 'self'` + whitelist específica é **necessária e desejável**, mas há um gradiente: começar com CSP report-only é prática responsável. Tornar CSP-enforce um Must significa que **qualquer regressão (ex.: imagem hot-linked, Google Font carregada acidentalmente) bloqueia deploy**. Mantenedor único depurando CSP em sexta-feira à noite é cenário ruim. Headers extras (NF-S-12) já cobrem proteção básica.
- **Risco compensador:** site não tem dados pessoais nem login; superfície de XSS é mínima (conteúdo controlado por build).
- **Economia estimada:** 4-8h debug iterativo.

### 1.5 — NF-M-22 "schema.org JSON-LD em CADA ficha" → SHOULD (mas manter parcial em Must)

- **Razão:** JSON-LD é alto valor para SEO, mas **439 fichas × 1 bloco JSON-LD validado** é trabalho de templating cuidadoso. Enquanto não há acordo formal sobre `Dataset` vs `GovernmentService` (escolha que afeta Google Dataset Search vs rich snippets normais), padronizar agora pode dar retrabalho. Manter JSON-LD na **home + página de cobertura + 1 ficha exemplar** como Must garante descoberta; nas outras 438 fichas pode entrar como Should.
- **Risco compensador:** sitemap.xml (NF-M-23, mantido como Must) ainda permite indexação básica.
- **Economia estimada:** 4-8h iniciais + manutenção.

**Total economizado de Must rebaixados: ~32-58 horas.**

---

## 2. Top 5 itens para PROMOVER de Should para Must

Critério: ausência do item gera **risco legal, bloqueio efetivo de público-alvo, ou perda irrecuperável** que dano reputacional não cobre.

### 2.1 — F-S07 "Lista textual paralela ao mapa" → MUST

- **Razão:** o **próprio E.2.B classifica NF-M-09 (mapa — alternativa textual) como Must obrigatório**. Há **conflito direto** entre A (S07) e B (NF-M-09). Como a decisão E.1 manteve mapa coroplético explicitamente apesar de risco a11y, a alternativa textual é o **único mecanismo que evita violação de LBI/Lei 13.146/2015 e WCAG 2.2 AA**. Sem ela, mapa = barreira jurídica.
- **Risco se ficar Should:** processo civil por discriminação a pessoas com deficiência visual. Não é hipotético — Lei 13.146 é frequentemente invocada.
- **Status correto:** Must.

### 2.2 — F-S09 "Lista textual de relacionamentos como fallback do grafo" → MUST

- **Razão:** mesma lógica de 2.1. NF-M-10 em B já é Must. Manter como Should em A é **inconsistência interna** que precisa ser resolvida agora.
- **Status correto:** Must.

### 2.3 — F-S12 "Changelog público" → MUST

- **Razão:** sem changelog explícito, citação acadêmica (F-S10/NF-M-34) **não tem o que citar como versão**. Pesquisador cita "v2026-05" mas não consegue verificar o que mudou — quebra reproducibilidade científica, que é o pilar da persona secundária formal. NF-S-26 (SemVer) já é Should, e SemVer **sem changelog** não tem valor humano. LAI (Lei 12.527) também recomenda histórico explícito de mudanças metodológicas.
- **Risco se ficar Should:** persona secundária (pesquisador FRM/IESP) é o público real do produto institucional. Lançar sem changelog desautoriza citação responsável.
- **Status correto:** Must.

### 2.4 — NF-S-16 "Pretty 404 com fuzzy match" + NF-S-22 "CI bloqueia merge" → MUST (a parte CI)

- **Razão:** O CI bloqueador (axe + Lighthouse + JSON Schema) é o **único mecanismo automático que substitui revisor humano** num projeto de mantenedor único. Sem ele, mudança qualquer pode quebrar a11y/perf silenciosamente. Métrica-chave #5 (≤2h/semana) **só é alcançável** com gates automáticos. Tornar CI bloqueador um Should significa que ele pode ser desligado em pressa de deploy.
- **Status correto da parte CI de NF-S-22:** Must.

### 2.5 — NF-S-13 "npm audit + Dependabot bloqueia high/critical" → MUST

- **Razão:** site estático ainda tem dependências (build toolchain, Pagefind, framework eventual). CVE em dependência transitive (caso `event-stream` 2018, `node-ipc` 2022, `xz` 2024) atinge supply chain — **risco real e crescente**. Para mantenedor único sem leitura diária de mailing lists de segurança, **automação de detecção é única defesa viável**. Custo de configuração é mínimo (Dependabot é nativo GitHub).
- **Status correto:** Must.

**Total adicional para Must: 5 itens, mas 2 deles (F-S07, F-S09) já são Must em B — formalmente promove 3 itens novos.**

---

## 3. Itens duplicados/sobrepostos entre A e B

Cobertura redundante (mesmo conteúdo coberto por dois IDs distintos): **6 pares**, mais 2 conflitos diretos.

| # | A (funcional) | B (não-funcional) | Tipo | Resolução proposta |
|---|---|---|---|---|
| 1 | F-S06 / F-S07 (mapa + lista textual) | NF-M-09 (mapa — alternativa textual) | DUPLICATA + CONFLITO de classe | Manter NF-M-09 (Must); F-S07 promove para Must (item 2.1); F-S06 fica Should. |
| 2 | F-S08 / F-S09 (grafo + lista textual) | NF-M-10 (grafo — teclado/lista) | DUPLICATA + CONFLITO | Mesma lógica: NF-M-10 Must; F-S09 promove para Must; F-S08 fica Should. |
| 3 | F-M11 (`/sobre/privacidade` + termos) | NF-M-13 (Política de Privacidade visível) | DUPLICATA exata | Consolidar num único requisito de catálogo cruzado A↔B; manter ambos rastreáveis mas deduplicar implementação. |
| 4 | F-M15 (build reproduzível) + F-A04 (build em push) + F-A01 (cron schema) | NF-M-29 (build reproducible) + NF-S-22 (CI bloqueia) | DUPLICATA tripla | Reescrever como **um sistema de CI/CD** unificado. A nota final de A já admite "F-A01, F-A02, F-A04 estão também contabilizados como Must — F-M15 abrange-os". Inflate-o-tempo. |
| 5 | F-M14 (data de revisão visível) | NF-M-22 partial (`dateModified` em JSON-LD) | SOBREPOSIÇÃO | OK manter ambos — um é UX, outro é SEO; mas garantir que ambos puxam do mesmo campo do schema. |
| 6 | F-S10 (citação ABNT/APA/BibTeX) | NF-M-34 (APA/ABNT/BibTeX/RIS + CITATION.cff) | DUPLICATA + B vai além | NF-M-34 é mais completo e Must. F-S10 promove para Must e converge formato. |
| 7 (conflito) | F-M12 Must (404 fuzzy) | NF-S-16 Should (Pretty 404 fuzzy) | CONFLITO de prioridade | Resolver: 404 simples = Must; fuzzy = Should. (Ver item 1.2.) |
| 8 (conflito) | F-S04/F-S05 Should (comparação inter-UF) | NF-S-28 Should (comparação ≤500ms) | OK consistente | Sem conflito, ambos Should. |

**Implicação:** das 50 Must declaradas, **pelo menos 6 são contagens duplicadas**. Número real de "obrigações independentes" Must é ~44, ainda alto.

---

## 4. Itens AUSENTES que deveriam estar (mínimo 5; entrego 8)

Cobertura insuficiente identificada:

### 4.1 — Backup off-Drive periódico (MUST)

- **Razão:** `operacao-drive.md` já alerta "Drive sync ≠ backup ≠ controle de versão" e recomenda snapshot mensal `.tar.gz` para fora do Drive. **Nenhum dos 88 NF nem 41 F mencionam backup**. Para mantenedor único em pasta sincada, perda de dados é **risco existencial**: corrupção sincronizada = catástrofe. Ausência grave.
- **Implementação Must:** GH Action mensal cria release artifact com tarball completo do `data/derived/` + `data/external_snapshots/index.json` + JSON canônico, retido por 5 anos.

### 4.2 — Plano de continuidade do mantenedor (MUST)

- **Razão:** "Rogério sozinho sem garantia de tempo regular" é declarado em `project_catalogo_politicas.md`. **O que acontece se Rogério ficar 6 meses sem disponibilidade?** Bloco D blind spot 3 do adversarial E.1.F apontou exatamente isso e ficou sem resposta. Site estático sobrevive sem manutenção, mas: link rot avança, vocabulário envelhece, novas leis sem snapshot, secretarias mudam. **Ausência de "modo dormente" documentado é gap.**
- **Implementação Must:** documento `docs/CONTINUIDADE.md` declarando: (a) o site continua no ar mesmo sem updates; (b) snapshots e dados ficam congelados na última versão; (c) issues sem resposta geram reply automático "em hibernação"; (d) chave-mestra do repo está com FRM/IESP (não só conta pessoal de Rogério).

### 4.3 — Acordo institucional FRM/IESP-UERJ sobre titularidade (MUST)

- **Razão:** atribuição CC-BY 4.0 a "FRM/IESP-UERJ" (NF-M-33) **pressupõe acordo formal** que ainda não consta como decidido. Lançar com atribuição errada gera retrabalho (inclusive em DOI Zenodo, BibTeX gerados, PDFs baixados) e potencial conflito institucional. Marca FRM no logo precisa de aprovação.
- **Implementação Must:** ata/email institucional fechando: titularidade, atribuição, uso da marca. Antes do lançamento, não depois.

### 4.4 — Política de tratamento de fichas com erros reportados (MUST)

- **Razão:** F-W03 corta sistema de comentários (correto), mas **não define o que acontece quando alguém reporta erro via issue GitHub** ou e-mail institucional. Sem SLA declarado e sem template de resposta, **expectativa pública de correção rápida** colide com "mantenedor único sem garantia de tempo". Risco reputacional.
- **Implementação Must:** página `/sobre/correcoes` declarando: (a) canal único (issues GitHub OU e-mail); (b) SLA realista ("revisão em até 90 dias"); (c) versão pública do que está sendo investigado; (d) histórico de correções em changelog.

### 4.5 — Política de retenção e descarte de dados (MUST p/ LGPD)

- **Razão:** NF-M-15 (logs anonimizados) e NF-M-13 (privacidade visível) tratam coleta. **Não há requisito sobre retenção** — quanto tempo logs do GoatCounter ficam? E os snapshots (que podem conter PII residual em PDFs governamentais)? Sem política de retenção declarada, **descumprimento direto da LGPD art. 16**.
- **Implementação Must:** declarar em `/sobre/privacidade`: logs GoatCounter retidos X meses; snapshots com PII detectada são revisados antes de publicação (já consta no Bloco D que 0 PII foi detectada, mas a política precisa estar declarada em texto).

### 4.6 — Internacionalização do conteúdo das fichas (declarar atributo `lang`) (MUST)

- **Razão:** WCAG 2.2 success criterion 3.1.1 exige `<html lang="pt-BR">`. **Não consta explicitamente em B** — está implícito em NF-M-12 (estrutura semântica), mas merece destaque. Trecho em outra língua (citação de norma internacional, termo técnico) precisa `lang` próprio. NF-C-04 (atributos lang por bloco) é Could; **lang no `<html>` é Must**.
- **Implementação Must:** template global `<html lang="pt-BR">`; auditoria de fichas para identificar texto não-PT.

### 4.7 — Versionamento dos snapshots e regra anti-mutação (MUST)

- **Razão:** schema v0.2 tem `superseded_by_sha256`, mas **não há requisito explícito** de que snapshots históricos **nunca** são apagados. Se snapshot velho for deletado, citações acadêmicas que dependiam dele quebram silenciosamente. CourtListener jamais apaga decisão antiga. NF-M-30 (snapshot fallback) trata exibição, não imutabilidade.
- **Implementação Must:** regra documentada: snapshots em `data/external_snapshots/<sha[:2]>/<sha>.<ext>` são imutáveis; deleção exige ADR + nota pública em changelog.

### 4.8 — Teste de carga / "thundering herd" (MUST defensivo)

- **Razão:** GitHub Pages tem limites de tráfego (100GB/mês soft cap, throttling em picos). **O que acontece se uma matéria viralizar e 50k visitas chegarem em 1h?** Nem A nem B preveem cenário. Para um catálogo com chance de cobertura midiática (FRM publica, IESP divulga, jornalista cita), saturar GH Pages free é cenário previsível.
- **Implementação Must:** declarar em runbook: (a) fallback para Cloudflare em frente do GH Pages se trigger; (b) cache headers agressivos (NF-S-03 já cobre); (c) snapshot Wayback Machine como mirror de emergência.

**Total ausentes a adicionar: 8. Pelo menos 5 (4.1, 4.2, 4.3, 4.4, 4.5) são realmente Must defensáveis.**

---

## 5. Cálculo grosseiro de TCO / esforço — 50 Must em horas reais

### Premissas

- Mantenedor único (Rogério), sem outro desenvolvedor.
- Trabalho fora-de-pesquisa: ~10h/semana sustentáveis.
- Bloco F = construção do site = janela ~3-4 meses sem atrasar outros blocos.
- Hora de trabalho **inclui investigação + planejamento + teste + implementação + revisão** (regra `ciclo-investigacao-teste.md`).

### Estimativa (baixa-média-alta) por agrupamento

| Agrupamento Must | Itens | Horas (baixa) | Horas (média) | Horas (alta) |
|---|---:|---:|---:|---:|
| Setup técnico (build, repo, CI/CD, deploy GHPages) | F-M15, F-A01-04, NF-M-29, NF-S-22 partial | 20 | 40 | 60 |
| Schema/dados/ID universal/redirects | F-M13, F-M14, F-M12 (parte simples), F-S12 (changelog) | 12 | 24 | 36 |
| Templates de página + identidade visual gov.uk | F-M01, F-M09, F-M10, F-M11 | 30 | 50 | 80 |
| Ficha individual com 50 campos + snapshot link | F-M05, F-M06, F-M07 | 25 | 40 | 60 |
| Página por UF | F-M08 (se mantido Must) | 12 | 20 | 30 |
| Busca + Pagefind + index | F-M02, NF-M-06 | 15 | 25 | 40 |
| Filtros facetados + URL state | F-M03, F-M04 | 20 | 35 | 55 |
| Performance (LCP/INP/CLS budget + bundle budgets enforced) | NF-M-01-05 | 20 | 35 | 55 |
| A11y técnica (WCAG 2.2 AA, axe-core 0 violations, mapa textual, grafo teclado, semântica HTML, cor) | NF-M-07 a NF-M-12 | 30 | 50 | 80 |
| Privacidade/LGPD (5 requisitos) | NF-M-13-17 | 8 | 14 | 22 |
| Segurança (HTTPS, CSP, SRI, whitelist) | NF-M-18-21 | 10 | 18 | 30 |
| SEO (JSON-LD, sitemap, OG, canonical) | NF-M-22-25 | 12 | 22 | 35 |
| Mobile responsivo + touch targets + fallbacks | NF-M-26-28 | 12 | 20 | 32 |
| Manutenção/Resiliência (snapshot fallback, sem deps pagas) | NF-M-30, NF-M-31 | 4 | 8 | 14 |
| Conformidade (LAI, CC-BY visível, citação acadêmica formal) | NF-M-32-34 | 8 | 14 | 22 |
| Usabilidade (10s 1ª ação útil) — incl. teste com 5 usuários | NF-M-35 | 6 | 12 | 20 |
| Testes (toy + unit + integração + axe + Lighthouse) ongoing | transversal | 20 | 35 | 55 |
| Documentação (RUNBOOK + ADRs + páginas Sobre) | transversal | 10 | 18 | 30 |
| Buffer/imprevistos (regra: 25% sobre soma) | — | 68 | 120 | 188 |
| **TOTAL** | **50 Must** | **342** | **600** | **944** |

### Tradução em semanas de Bloco F

A 10h sustentáveis/semana:
- Cenário **otimista** (342h): ~34 semanas ≈ **8 meses**.
- Cenário **médio** (600h): ~60 semanas ≈ **14 meses**.
- Cenário **pessimista** (944h): ~94 semanas ≈ **22 meses**.

### Implicação central

A janela natural de Bloco F é **3-4 meses** se o objetivo é lançar antes que o catálogo fique desatualizado. Mesmo o cenário otimista (8 meses) **excede em 2x**. Cenário médio é **3.5x maior** do que cabe.

**Conclusão TCO:** o conjunto Must atual implica **lançamento em 2027 (não 2026)** com Rogério sozinho. Para lançar dentro da janela, **cortes de Must ~50% são necessários**.

### TCO 5 anos pós-lançamento (continuidade)

- Domínio: R$ 250-500 (5 anos)
- GitHub Pages + Actions: R$ 0 (free tier)
- GoatCounter: R$ 0 (free) ou R$ 30/mês se cresce = ~R$ 1.800
- Storage snapshots crescentes: R$ 0 enquanto cabe em repo (limite 1GB para Pages, 5GB para repo)
- Manutenção humana: 2h/semana × 50 sem × 5 anos = **500h** (alvo declarado em B); cenário realista 4h/semana × 50 × 5 = **1.000h**.

A 500-1000h de manutenção é o **componente caro**. Sem bolsista financiado, recai sobre Rogério. Dimensiona a urgência de cortar Must.

---

## 6. Três decisões críticas que a usuária precisa tomar ANTES de E.3 (decisão de stack)

### Decisão 1 — Conjunto Must mínimo viável: ~30 Must ou ~50?

**Por que decidir agora:** stack Astro+Tailwind+Pagefind é compatível com 30 Must em 3-4 meses. Stack mesmo mais completa (Next.js + ilhas) **não viabiliza 50 Must em 3-4 meses**. Decisão de Must precede decisão de stack — caso contrário, escolhe-se stack errada.

**Opções:**
- (a) **Aceitar cortes propostos** (rebaixar 5, deduplicar 6, aplicar lista realista de ~30 Must) → lança em 2026.
- (b) **Manter ambição** (50 Must conforme A+B atuais) → lança em 2027 OU contrata bolsista FRM/IESP financiado.
- (c) **Híbrido**: lança parcial em 2026 com 30 Must, bumps para 50 após 6 meses pós-lançamento (mas então alguns "Must" viram "v1.1 mandatory", o que é semanticamente Should).

**Recomendação adversarial:** (a) com declaração explícita de cortes em ADR.

### Decisão 2 — Mantenedor único é definitivo OU há janela para bolsista?

**Por que decidir agora:** todas as estimativas acima pressupõem solo. Bolsista 20h/semana muda completamente o cálculo:
- 600h (cenário médio) ÷ (10h Rogério + 20h bolsista) = 20 semanas = ~5 meses. Lança em 2026.

**Opções:**
- (a) **Solo definitivo** → cortes de Must obrigatórios.
- (b) **Bolsista FRM/IESP financiado** → mantém ambição, mas precisa de **decisão institucional ANTES de E.3**, não depois.
- (c) **Solo + revisor voluntário** (Maria Clara Gama, equipe de revisão atual) → revisão de conteúdo, não código. Mantém ambição de conteúdo mas não de implementação.

**Recomendação adversarial:** declaração explícita em ADR — "Mantenedor: Rogério solo, sem bolsista, sem voluntário técnico" é uma decisão tão importante quanto stack.

### Decisão 3 — Mapa coroplético + grafo: aceitar o custo a11y ou cortar?

**Por que decidir agora:** decisão E.1 manteve ambos apesar do alerta adversarial anterior. **NF-M-09, NF-M-10, F-S07, F-S09 + estimativa de a11y técnica = ~30-50h só para fallbacks textuais**. Se cortar mapa+grafo, esses 30-50h voltam para itens core.

**Opções:**
- (a) **Manter** (decisão E.1 atual) → aceitar custo a11y, planejar testes com leitor de tela, contar com fallback textual robusto (NF-M-09/10 promovidos a Must definitivos com NF-S-04 lazy-load).
- (b) **Cortar mapa, manter grafo** → mapa é o pior em a11y (SVG do Brasil com 27 paths); grafo de relacionamentos numa única ficha é mais contido.
- (c) **Cortar ambos para v1.0**, reentrar em Bloco G → maximiza foco em ficha+busca+filtros, que é o core.

**Recomendação adversarial:** (b) ou (c). Posição E.1 atual ((a)) é **otimista demais** para mantenedor único. Esta decisão tem prazo: tomar antes de E.3 evita escolher stack para feature que vai ser cortada.

---

## 7. Riscos não declarados em A nem B

Lista breve de riscos que **nenhum dos dois avaliadores capturou**:

1. **Risco de viralização**: cobertura midiática gera pico de tráfego que ultrapassa GitHub Pages free (100GB/mês). Sem fallback Cloudflare, site cai. (Cobertura em item 4.8 acima.)
2. **Risco de DMCA/notice-and-takedown contra snapshots**: embora Lei 9.610 art. 8º IV libere atos normativos, secretaria estadual pode reclamar de snapshot de página institucional. **Sem política de takedown declarada**, mantenedor único enfrenta legal individualmente.
3. **Risco de mudança de governo nas UFs**: 2026 é ano eleitoral municipal; 2026/27 estaduais. Nova gestão pode reformular dezenas de políticas em meses. **Snapshot delta + revalidação semestral** (NF-S-21) pode ser frequência insuficiente — gap de 6 meses captura 1 governo inteiro.
4. **Risco de obsolescência da stack escolhida**: Astro está em v5; Pagefind v1.2 é estável mas pequeno. Em 5 anos (TCO janela), pelo menos 1 dependência principal dará break change. **Ninguém previu plano de migração técnica.**
5. **Risco de bloqueio em CDN governamental**: alguns governos brasileiros bloqueiam GitHub Pages (firewall de TI estadual). **Persona primária (técnico estadual) pode não conseguir acessar do trabalho.** Hospedagem alternativa em IESP-UERJ pode ser necessária.
6. **Risco de que GoatCounter desligue free tier**: serviço é mantido por uma pessoa (Martin Tournoij). Se ele parar, perda de analytics. **Sem fallback declarado.**
7. **Risco de desalinhamento entre snapshot e site oficial**: se gov.br muda layout, snapshot velho pode parecer "errado" ao leitor (porque ele compara mentalmente com novo). **Sem aviso visual claro de "data do snapshot vs hoje".**

---

## 8. Métricas não-realistas

Análise das métricas declaradas em B:

| Métrica | Alvo declarado | Realismo | Comentário |
|---|---|---|---|
| Lighthouse Perf ≥90 mobile p75 | ≥90 | OK | Atingível em estático com Astro/Hugo. |
| Lighthouse A11y =100 | =100 | **DUVIDOSO** | "100" é arbitrário; axe-core e Lighthouse a11y diferem; passar Lighthouse =100 não garante WCAG real (faltam testes humanos). Deveria ser "axe-core 0 critical/serious + WCAG 2.2 AA auditado". |
| ≤1.5s p75 4G TTFI | 1.5s | OK-arriscado | Pagefind chunked + Brasil rural com 3G real pode estourar. Aceitar p75 vs p95? |
| 0 violações axe-core "serious"/"critical" | 0 | OK | Atingível e mensurável. |
| ≥95% URLs externas com snapshot funcional | ≥95% | **OTIMISTA** | Hoje está em 75% (136/182). Subir para 95% exige tratar URLs gov.br com WAF persistente (71 falhas). Pode ser inalcançável sem mudança de fonte. |
| ≤2h/semana de manutenção | 2h | **AMBICIOSO** | Auto-declarado como "alvo". Sem dados históricos de catálogos similares brasileiros. Realista: 4h/semana. |
| Build ≤100KB Home gzipped | 100KB | OK | Atingível, mas precisa disciplina. |

**Crítica geral às métricas:** falta declaração de **freqüência de medição** e **resposta quando métrica violada**. "Lighthouse 100 a11y" sem rotina de medição é decoração.

---

## 9. Coerência com decisão E.1 (manter mapa + grafo) — viabilidade a11y

A decisão E.1 manteve mapa coroplético + grafo de relacionamentos apesar do alerta adversarial. O agent B traduziu isso em **NF-M-09 e NF-M-10 (Must)** — alternativas textuais. Análise da viabilidade:

### Mapa coroplético

- **Item B Must:** lista textual paralela (toggle visível) + role="img" + aria-label + cada UF como `<path>` com `<title>` + tabindex="0".
- **Avaliação adversarial:** isto é **mínimo aceitável**, mas faltam:
  - Resposta a `prefers-reduced-motion` (sem transições animadas).
  - Anúncio aria-live ao mudar UF focada.
  - Teste com leitor de tela real (NVDA/JAWS/VoiceOver) — sem isso, "ARIA + path" pode falhar na prática.
  - Fallback mobile (NF-M-28) está coberto: lista UFs sortable em <768px. OK.
- **Estimativa de horas adicionais:** 15-25h para auditoria a11y real do mapa.

### Grafo de relacionamentos

- **Item B Must:** lista textual canônica + grafo opcional + Tab/Enter/Esc + aria-live.
- **Avaliação adversarial:**
  - Cytoscape.js (provável escolha) tem suporte a teclado limitado nativo; exige customização.
  - Para grafo com >10 nós (algumas políticas têm múltiplas relações), navegação sequencial Tab é tediosa — precisa estrutura hierárquica ou agrupamento por tipo de relação.
  - **Lista textual cobre 100% do conteúdo informacional** — então grafo é decoração. Vale a pena gastar 20-30h de a11y para decoração?
- **Recomendação adversarial:** rebaixar grafo para Should (ou Could). Lista textual de relacionamentos sobe para Must.

### Veredito sobre coerência E.1 ↔ E.2.B

E.2.B fez o trabalho correto traduzindo E.1 em requisitos. Mas isso **expõe que E.1 manteve features caras em a11y**, e E.2 não tem mandato para reverter. A pergunta que sobra: **a usuária revisita E.1 com base no custo agora explícito, ou aceita?**

---

## 10. Veredito final e recomendação acionável

### Veredito

**O conjunto Must atual (50 itens entre A e B) NÃO É VIÁVEL para mantenedor único na janela 3-4 meses do Bloco F.** O cálculo de TCO (Seção 5) mostra excesso de **2-3x** sobre a capacidade. Mesmo o cenário otimista (342h) ultrapassa a janela natural.

A viabilidade exige UMA das opções:
- **(a)** Cortes drásticos em Must (~30 Must, conforme detalhado nesta crítica);
- **(b)** Bolsista financiado (decisão institucional pendente);
- **(c)** Janela de Bloco F estendida para 8-14 meses (muda o roadmap inteiro).

### Recomendação acionável (em ordem de prioridade)

**P1. Decidir com a usuária as 3 perguntas críticas da Seção 6** antes de E.3.

**P2. Aplicar os movimentos propostos:**
- Rebaixar para Should: F-M08, F-M12, NF-M-04, NF-M-05, NF-M-19 (parcial), NF-M-22 (parcial).
- Promover para Must: F-S07, F-S09, F-S12, NF-S-13, NF-S-22 (parte CI bloqueador).
- Deduplicar 6 pares listados na Seção 3.
- Adicionar 5 itens ausentes Must (Seção 4: backup, continuidade, acordo institucional, política correções, retenção LGPD).

**P3. Resultado esperado:**

| Bucket | A+B atual | Pós-crítica |
|---|---:|---:|
| Must | 50 | ~32-35 |
| Should | 41 | ~50 |
| Could | 21 | ~21 |
| Won't | 17 | ~17 |
| **Total** | **129** | **~120-125** |

**P4. Salvar ADR** `2026-05-?? _cortes-must-mvp.md` declarando explicitamente o que ficou de fora e por quê — necessário para Bloco F não retomar features cortadas em pressa de implementação.

**P5. Revisitar E.1** se decisão 3 da Seção 6 for "cortar mapa e/ou grafo" — propaga para os requisitos.

**P6. Antes de E.3 (decisão de stack), entregar à usuária:**
- Lista final de Must (~30) com IDs estáveis.
- Tabela de Should que pode subir em hotfixes pós-lançamento.
- ADR de cortes.
- Confirmação de mantenedor (solo OU bolsista).

Sem isso, decisão de stack em E.3 é construída sobre escopo inflado.

---

## Anexo — Resumo dos números

- **Must em A:** 15 funcionais + 4 automação (3 deles redundantes com F-M15) = **~16 efetivos**
- **Must em B:** 35 não-funcionais
- **Total declarado:** 50 (15+35)
- **Após dedup A↔B:** ~44 obrigações independentes
- **Após cortes propostos (5 rebaixamentos):** ~39
- **Após promoções (3 novos Must):** ~42
- **Após adições (5 ausentes Must):** ~47
- **Recomendação líquida:** revisar para que reste **~32-35 Must** consolidados, com ADR explícito.

A escolha não é entre "Must ou Should" — é entre "lançar em 2026" e "lançar em 2027". Esta crítica argumenta que lançar em 2026 com versão menor e crescer em 2027 é estratégia melhor que lançar perfeito em 2027 e ter o conteúdo desatualizado no dia do lançamento.

— Fim do output adversarial E.2.C.