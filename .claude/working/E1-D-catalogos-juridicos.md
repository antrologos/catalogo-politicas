# E.1.D — Catálogos jurídicos e legislativos (avaliador adicional)

> Output do avaliador consensual adicional, com lente "ID universal + relacionamentos tipados + alertas granulares". Sites: EUR-Lex (CELEX), GovTrack.us, CourtListener (Free Law Project), data.gouv.fr.

## Achados-chave

### EUR-Lex — CELEX como ID universal
- **CELEX** (`32016R0679` para GDPR) é imutável, único, decodificável (setor + ano + tipo + número).
- Separação clara entre **ID universal** (imutável, indexável) e **slug** (legível, mutável, redirecionável).
- Deep linking determinístico: `?uri=CELEX:32016R0679` sempre resolve.

**Aplicar ao FRM:**
- ID universal proposto: `FRM-CP-[YYYY]-[EIXO]-[SEQNUM]` (ex.: `FRM-CP-2026-EDU-0042`).
- Schema: campo `id_universal` (imutável) + campo `slug` (bookmarkável, pode mudar) + redirect old → new.

### GovTrack.us — alertas granulares por tag
- Sistema de **subscriptions por tag/tema** (não por documento individual).
- Tag = vocabulário fechado (taxonomia controlada), não freetext.
- Endpoint público: `/api/subscribe?tag=education`.

**Aplicar ao FRM:**
- Vocabulário de tags fechado (eixo, situação, modalidade) já está em vocabulario-canonico.json.
- Endpoint Bloco F: `/api/subscribe?tag=educacao` para alertas de novas políticas / revisões.
- Fora do MVP enxuto, mas schema já preparado.

### CourtListener — Authorities + Citator
- Cada documento mostra "**Esta decisão cita X**" e "**Esta decisão é citada por Y**".
- Relacionamentos tipados, não meros backlinks.

**Aplicar ao FRM:**
- Relacionamentos tipados entre políticas: `substitui` / `altera` / `regulamenta` / `integra-com` / `revoga`.
- Página `/politica/<id>/relacionadas` mostra grafo dirigido com tipos.
- Schema: campo `relacionamentos: [{ id_alvo, tipo, data, fonte }]`.

### data.gouv.fr — badge de qualidade expandido
- Score visual (0-100) com critérios explícitos (frescor, completude, formato, licença, descrição, exemplos...).
- 11+ critérios checados automaticamente.

**Aplicar ao FRM:**
- Badge `completude_pct` (já no schema v0.2) expandido para **score multidimensional**:
  - Frescor (data última revisão)
  - Completude metadados (% campos preenchidos)
  - Fonte oficial verificada
  - Snapshot integral disponível
  - Texto extraído (não só PDF imagem)
  - Citação acadêmica formatada
  - Vocabulário canônico aplicado
  - Relacionamentos mapeados
  - Histórico de revisões
  - Acessibilidade declarada
  - Licença explícita

## Top 4 features a importar

1. **CELEX-style ID universal** (eur-lex.europa.eu) — `FRM-CP-2026-EDU-0042` imutável + slug separado.
2. **Página de relacionamentos tipados** (CourtListener) — `/politica/<id>/relacionadas` com grafo.
3. **Badge multidimensional** (data.gouv.fr) — 11 critérios, não 1.
4. **Schema de alertas por tag** (GovTrack) — preparado mesmo fora do MVP.

## Top 2 anti-padrões a evitar

1. **ID = slug** (acoplamento perigoso) — solução: separação ID universal vs slug.
2. **Relacionamentos como backlinks textuais** — solução: tipagem explícita.

## Implicações para schema v0.3 (futuro)

- Adicionar `id_universal` (string, imutável, indexada).
- Adicionar `slug` (string, mutável, com tabela de redirect).
- Adicionar `relacionamentos` (array de objetos tipados).
- Expandir `completude_pct` para `qualidade: { score, criterios: { ... } }`.