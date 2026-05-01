# E.2.D — MoSCoW Consolidado (após Checkpoint E.2)

> Síntese final do sub-bloco E.2 incorporando decisões da usuária no Checkpoint E.2 (2026-05-01).

## Decisões da usuária no Checkpoint E.2

1. **Manter 50 Must ambicioso** — não aceitar rebaixamentos adversariais. Implica janela Bloco F estendida (8-14 meses solo OU 5 meses com bolsista).
2. **Mantenedor: assumir solo até negociação institucional** — ADR não-bloqueante; pode mudar.
3. **Manter mapa coroplético + grafo** — decisão E.1 confirmada; custo a11y 30-50h aceito.

## Movimentos aplicados (não-materiais — só consolidação)

**A** Resolver conflitos diretos entre A (funcional) e B (não-funcional):
- F-S07 (Should em A) → **Must** (alinha com NF-M-09 em B). Lista textual paralela ao mapa.
- F-S09 (Should em A) → **Must** (alinha com NF-M-10 em B). Lista textual de relacionamentos.
- F-S12 (Should em A) → **Must**. Changelog público — sem ele, citação acadêmica não tem versão a citar.
- F-M12 (Must em A) — mantido como Must (alinha com a ambição declarada; B classificou apenas a parte fuzzy como Should mas usuária quer ambição).
- NF-S-13 (Should em B) → **Must**. Dependabot bloqueia high/critical.
- NF-S-22 (parte CI bloqueador) → **Must**. axe + Lighthouse + JSON Schema bloqueiam merge.

**B** Consolidar 6 pares duplicados A↔B sem alterar escopo:
- F-M11 ↔ NF-M-13 (Política de Privacidade) — implementação única atende ambos.
- F-M15 + F-A01 + F-A04 ↔ NF-M-29 + NF-S-22 (build reproducível + CI/CD) — sistema único de CI/CD unificado.
- F-M14 ↔ NF-M-22 partial (data de revisão) — UX e SEO puxam do mesmo campo do schema.
- F-S10 ↔ NF-M-34 (citação acadêmica) — F-S10 promove para Must e converge formato com NF-M-34 (APA + ABNT + BibTeX + RIS + CITATION.cff).
- F-S06 + F-S07 ↔ NF-M-09 (mapa + lista textual) — visão consolidada.
- F-S08 + F-S09 ↔ NF-M-10 (grafo + lista textual) — visão consolidada.

**C** Adicionar 5 itens AUSENTES Must (riscos reais não cobertos por A nem B):

| ID novo | Categoria | Nome | Justificativa |
|---|---|---|---|
| **CONS-M-01** | RESILIENCIA | Backup off-Drive periódico | Mantenedor único + pasta sincada Drive = risco existencial de corrupção sincronizada. GH Action mensal cria release artifact com tarball completo de `data/` retido por 5 anos. |
| **CONS-M-02** | MANUTENCAO | Plano de continuidade do mantenedor | "Modo dormente" documentado: site continua no ar mesmo sem updates; issues sem resposta geram reply automático "em hibernação"; chave-mestra do repo está com FRM/IESP, não só conta pessoal. |
| **CONS-M-03** | CONFORMIDADE | Acordo institucional FRM/IESP-UERJ | Atribuição CC-BY 4.0 a "FRM/IESP-UERJ" pressupõe acordo formal. Antes do lançamento: ata/email institucional fechando titularidade, atribuição, uso da marca. Sem isso, retrabalho em DOI Zenodo, BibTeX, atribuição. |
| **CONS-M-04** | CONFORMIDADE | Política de correções com SLA | Sistema de comentários cortado (F-W03) mas relato de erros via issue/email precisa: canal único, SLA realista ("revisão em até 90 dias"), versão pública do que está sendo investigado, histórico em changelog. Risco reputacional sem isso. |
| **CONS-M-05** | PRIVACIDADE | Política de retenção e descarte LGPD | NF-M-13 trata coleta; **falta retenção** (LGPD art. 16). Declarar em `/sobre/privacidade`: logs GoatCounter retidos X meses; snapshots com PII detectada são revisados antes de publicação. |

**Adições adicionais (Should/Could):**

| ID novo | Bucket | Categoria | Nome |
|---|---|---|---|
| **CONS-S-01** | Should | RESILIENCIA | Versionamento imutável dos snapshots (regra anti-mutação) |
| **CONS-S-02** | Should | RESILIENCIA | Fallback Cloudflare em frente do GH Pages para "thundering herd" |
| **CONS-S-03** | Should | ACESSIBILIDADE | `<html lang="pt-BR">` global + auditoria de fichas para texto não-PT |

---

## Total consolidado

| Bucket | A original | B original | Mudanças líquidas | **Total final** |
|---|---:|---:|---:|---:|
| Must | 15 (+4 automação) | 35 | +5 promoções + 5 ausentes − 0 rebaixamentos | **~55 Must** |
| Should | 12 | 29 | −5 promoções + 3 novos | ~39 |
| Could | 9 | 12 | 0 | ~21 |
| Won't | 5 | 12 | 0 | ~17 |
| **Total** | 41 | 88 | +13 | **~132** |

**Must = 55** (acima dos 50 originais). Implicação direta: estimativa de horas sobe proporcionalmente.

---

## Estimativa de TCO atualizada (com 55 Must)

| Cenário | Horas | Semanas a 10h sustentáveis (solo) | Semanas a 30h (solo + bolsista 20h) |
|---|---:|---:|---:|
| Otimista | 380h | 38 sem ≈ **9 meses** solo | 13 sem ≈ **3 meses** com bolsista |
| Médio | 660h | 66 sem ≈ **15 meses** solo | 22 sem ≈ **5 meses** com bolsista |
| Pessimista | 1040h | 104 sem ≈ **24 meses** solo | 35 sem ≈ **8 meses** com bolsista |

**Conclusão**: a viabilidade de Bloco F dentro de janela razoável (3-6 meses) **depende criticamente** de:
- (a) bolsista financiado pela FRM/IESP, OU
- (b) janela de Bloco F estendida para 9-15 meses (muda roadmap macro), OU
- (c) revisitar este consolidado em E.6 com novos cortes informados pelo Bloco F já em andamento.

A decisão do mantenedor (Decisão 2 do Checkpoint E.2 = "decidir depois") significa que **E.3 prossegue assumindo solo**, e cortes podem ser aplicados em E.6 se até lá não houver bolsista confirmado.

---

## Lista final de Must (55 itens consolidados, com IDs estáveis)

### Funcionais (18 Must, contando promoções)

F-M01, F-M02, F-M03, F-M04, F-M05, F-M06, F-M07, F-M08, F-M09, F-M10, F-M11, F-M12, F-M13, F-M14, F-M15, F-A01, F-A02, F-A04 +
**F-S07** (promovido — lista textual mapa), **F-S09** (promovido — lista textual grafo), **F-S10** (promovido — citação ABNT/APA/BibTeX), **F-S12** (promovido — changelog público).

### Não-funcionais (35 Must originais de B)

NF-M-01 a NF-M-35 (sem mudanças exceto consolidações de duplicatas).

### Adições consolidadas (5 novos Must)

CONS-M-01, CONS-M-02, CONS-M-03, CONS-M-04, CONS-M-05.

### Promoções dentro de B (2 novos Must)

NF-S-13 (npm audit + Dependabot) → Must.
NF-S-22 (parte CI bloqueador axe + Lighthouse + JSON Schema) → Must.

---

## Métricas-chave do MVP (5 originais de B + ajustes)

| # | Métrica | Alvo | Status pós-crítica |
|---|---|---|---|
| 1 | Lighthouse mobile p75 | Perf ≥90, **A11y axe-core 0 critical/serious + WCAG 2.2 AA auditado** (substitui "100"), BP ≥90, SEO ≥95 | **Métrica refinada** após crítica adversarial |
| 2 | Tempo até 1ª busca útil em 4G | ≤ 1.5s p75 | OK |
| 3 | Violações axe-core serious+critical | = 0 em build | OK |
| 4 | % URLs externas com snapshot funcional | ≥ 90% (rebaixado de 95%; hoje 75%; gov.br WAF persistente) | **Alvo recalibrado** |
| 5 | Manutenção semanal real (após 3 meses) | ≤ **4h/semana** (rebaixado de 2h; sem benchmark histórico) | **Alvo realista** |

---

## ADR pendente

**ADR `2026-05-01_cortes-must-mvp.md`** declarando:
- Decisão da usuária: manter 50 Must ambicioso (Checkpoint E.2).
- Implicação: lançamento estimado em 2027 sem bolsista; em 2026 com bolsista (5 meses).
- Mantenedor: solo até negociação institucional FRM/IESP.
- Mapa + grafo: mantidos com a11y reforçada (NF-M-09, NF-M-10, F-S07, F-S09 todos Must).
- 5 ausentes Must adicionados (CONS-M-01 a CONS-M-05).

---

## Próximo passo: E.3 (decisão de stack)

A lista consolidada de 55 Must será input para E.3, que vai aplicar metodologia **2 consensuais + 1 adversarial** investigando candidatos:
- **Astro 5.x + Tailwind + Pagefind + ilhas React** (provável recomendação: estático, deploy GH Pages, build-time index)
- **Next.js 15 + Tailwind + Pagefind/MeiliSearch** (mais dinâmico, static export possível)
- **Eleventy / Hugo / Quarto** (simples, pode limitar mapa+grafo interativos)

Sub-checkpoint E.3: aprovar stack escolhida (ADR formal) antes de E.4 (wireframes).