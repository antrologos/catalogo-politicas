---
status: aceito
data: 2026-05-01
contexto: E · E.2 + E.4 (consolidação de escopo MVP)
substituido_por: null
---

# ADR-010 — Escopo MVP: 55 Must consolidados + 8 wireframes ambiciosos (sem cortes adversariais)

## Contexto

O Bloco E.2 produziu 41 requisitos funcionais (15 Must) + 88 não-funcionais (35 Must) + crítica adversarial (E.2.C) que apontou subestimação por fator 2-4× e propôs cortes para ~30 Must. Adversarial E.4.C reforçou: solo 4-8h/sem é **matematicamente incompatível** com 55 Must.

A usuária foi confrontada com 3 decisões críticas no Checkpoint E.2 e 3 no Checkpoint E.4. Optou consistentemente por **manter ambição** apesar dos alertas.

## Alternativas consideradas

### Alternativa A — Aceitar cortes adversariais (~30 Must)

- **Pró**: lançamento em 2026-12 com bolsista OU 2027-09 solo. Realismo declarado.
- **Contra**: corta features valiosas (mapa coroplético dedicado, comparação inter-UF, grafo de relacionamentos, página executiva por UF).

### Alternativa B — 50 Must originais (E.2.A + E.2.B)

- **Pró**: documentação rica.
- **Contra**: tem inconsistências A↔B (F-S07 Should vs NF-M-09 Must para lista textual mapa) e duplicações (citação ABNT em F-S10 e NF-M-34).

### Alternativa C — 55 Must consolidados (escolhida)

Conforme E.2.D: aplicados movimentos não-materiais (resolver conflitos A↔B, dedup de 6 pares, adicionar 5 ausentes Must — backup, continuidade, acordo institucional, política de correções, retenção LGPD).

- **Pró**: cobertura ambiciosa do que o catálogo precisa ser; resolve inconsistências A↔B; alinhada com identidade gov.uk.
- **Contra**: lançamento estimado em ~2028 solo OU 2026-12 com bolsista. Acima da janela "natural" de Bloco F (3-4 meses).

## Decisão

**Adotamos a Alternativa C — 55 Must consolidados, mantendo todos os 8 wireframes (W1 Home, W2 Busca, W3 Ficha, W4 UF executiva, W5 Comparação, W6 Mapa coroplético, W7 Grafo, W8 Sobre + W7' 404 obrigatório).**

### Estimativa de esforço (E.4.C honesta)

- **Wireframes apenas**: 380-620h (vs 208-328h da estimativa A original).
- **Itens transversais** (a11y, schema.org por ficha, automação CI, cron de revalidação, backup, plano continuidade): 271-451h.
- **Total Bloco F**: 480-1070h.

### Cenários de tempo (mantenedor)

| Cenário | Capacidade | Duração estimada |
|---|---|---|
| Solo 4h/sem | 16h/mês | 30-67 meses ≈ **2.5-5.5 anos** |
| Solo 8h/sem (otimista) | 32h/mês | 15-33 meses ≈ **1.3-2.8 anos** |
| Bolsista 28h/sem (8h Rogério + 20h bolsista) | 112h/mês | 4-9.5 meses |

### Mitigações

1. **Cláusula de reabertura** ADR-009 — bolsista FRM/IESP em ≤60 dias muda equação.
2. **Cortes adversariais reservados como contingência** — se em E.6 ou Bloco F.2 a velocidade for insuficiente, W5/W6/W7 podem ser movidos para Bloco G.
3. **Política B prevalece em conflitos a11y** (Checkpoint E.4) — Tabs ARIA W3C completo, mapa→lista mobile, 404 fuzzy Must.
4. **Métricas-chave de sucesso refinadas** (E.2.D): manutenção semanal real ≤4h/sem (não 2h); URL externa com snapshot ≥90% (não 95%); axe-core 0 critical/serious; Lighthouse Perf ≥90 mobile p75.

## Consequências

### Positivas
- Catálogo entregue tem cobertura conceitual completa (não é "subset com gaps").
- Coerência com decisões anteriores (E.1: persona técnica + pesquisador formal; identidade gov.uk).
- Mantém valor analítico (comparação inter-UF + grafo) para uso acadêmico.

### Negativas
- Risco real de "lixo digital em 18 meses" se mantenedor solo ficar sem tempo (E.2.C alerta).
- Cronograma de lançamento é incerto (depende de bolsista).
- Pressão sobre cada sprint para atingir alvos a11y exigentes.

### Cláusulas de revisão

Este escopo será revisitado em:
- **Sub-checkpoint E.6** (validação humana antes de Bloco F).
- **Marco F.1 (fim do esqueleto operacional)** — primeira oportunidade de cortar W5/W6/W7 se velocidade real for insuficiente.
- **Marco F.2 (UF + Comparação)** — segunda oportunidade.

## Referências

- E.2.A `working/E2-A-moscow-funcionais.md`
- E.2.B `working/E2-B-moscow-nao-funcionais.md`
- E.2.C `working/E2-C-adversarial-critica.md`
- E.2.D `working/E2-D-moscow-consolidado.md`
- E.4.A/B/C `working/E4-{A,B,C}-*.md`
- ADR-009 (cláusula reabertura mantenedor)