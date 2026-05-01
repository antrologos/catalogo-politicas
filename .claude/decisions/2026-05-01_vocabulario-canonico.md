---
status: aceito
data: 2026-05-01
contexto: "Sub-bloco C.1.b do Bloco C — preencher vocabulario-canonico.json baseado em análise de frequência dos valores reais nas 439 fichas. Decisões de canonicalização, tratamento de outliers, e estratégia (estrita vs flexível)."
---

# Vocabulário canônico v1.0 — Bloco C.1.b

## Contexto

A planilha-fonte tem 9 campos categóricos com **drift ortográfico significativo**, especialmente `esfera_execucao` (31 valores únicos para vocabulário oficial de ~20). Antes do pipeline ETL gerar o JSON canônico, é preciso decidir:

1. Quais valores são **canônicos** (lista fechada)
2. Quais variantes ortográficas mapeiam para cada canônico
3. O que fazer com outliers (descrições livres no campo errado, sufixos descritivos)
4. Estratégia: **rejeitar** valores fora-da-lista (estrita) ou **avisar** e prosseguir (flexível)

## Análise dos dados

Rodada de `python -B scripts/etl/load_planilha.py` + `value_counts()` em cada campo (output em sessão de chat 2026-05-01):

| Campo | Valores únicos brutos | Canônicos finais |
|---|---:|---:|
| `tipo_politica` | 3 | 3 (sem drift) |
| `esfera_formulacao` | 7 | 6 + 1 outlier |
| `origem_proposta` | 6 | 5 + 1 outlier |
| `esfera_execucao` | **31** | 8 + sufixos descritivos a migrar |
| `abrangencia_territorial` | 4 | 4 (drift cosmético) |
| `situacao_atual` | 6 | 5 (drift: descrições entre parênteses) |
| `tipo_oferta` | 10 | 8 + 1 outlier (`Presencial`) |
| `modalidade_oferta` | 8 | 6 + 1 outlier (`Unidade fixa`) |
| `arranjo_logistico` | 8 | 5 (drift: aspas tipográficas) |

Total de variantes mapeadas: ~35.
Total de outliers/anomalias detectadas: ~6 (preservados; logados; correção em onda futura).

## Alternativas consideradas

### Estratégia (estrita vs flexível)

1. **Estrita**: schema rejeita qualquer valor fora-da-lista canônica via `enum`. Pipeline aborta em primeira violação.
   - Pro: dados 100% limpos garantidos
   - Con: ondas futuras com novos valores quebram pipeline; força revisão imediata
2. **Flexível com warning** ✅ ESCOLHIDO
   - Schema aceita `string` para a maioria dos campos (apenas `tipo_politica` e `situacao_atual` usam enum por ter pouca variação)
   - Pipeline mapeia variantes via `vocabulario-canonico.json`; valores não-mapeados são preservados como-estão e logados em `data/logs/normalize_unmapped_2026-05-01.csv`
   - Pro: pipeline robusto, ondas novas não quebram, revisão é assíncrona
   - Con: pode mascarar drift novo se ninguém olhar os logs

### Sufixos descritivos em `esfera_execucao`

Vários valores têm sufixos como `+ rede ofertante`, `+ Sistema S`, `+ Empresas empregadoras`. Decisões:

1. **Tratar como variantes do tronco** (todos viram canônico básico, sufixo perdido) — ❌ perde info
2. **Tratar como canônicos próprios** (cada combinação vira valor) — ❌ explode N valores; impossível
3. **Migrar sufixo para `esfera_execucao_apoios_parcerias`** ✅ ESCOLHIDO — preserva info no campo correto (que já existe!); tronco vira canônico simples

Implementação: `normalize.py` detecta padrão `(tronco)\s*[-+]\s*(sufixo)` em `esfera_execucao`; tronco vai para canonical, sufixo para `esfera_execucao_apoios_parcerias` (concatenado se já houver conteúdo).

### Outliers individuais (1 ocorrência cada)

Valores únicos descritivos no campo errado:
- `tipo_oferta = "Presencial"` (1) — é valor de `modalidade_oferta`
- `modalidade_oferta = "Unidade fixa / oferta fixa"` (1) — é valor de `arranjo_logistico`
- `origem_proposta = "Incentivo financeiro-educacional federal..."` (1) — frase livre, não categoria
- `esfera_formulacao = "interfederativa/interinstitucional: ..."` (1) — descrição muito longa

Decisões:
1. **Pipeline preserva valor original** — não tenta adivinhar correção
2. **Loga em `_outliers_observados` no JSON** + arquivo `data/logs/normalize_unmapped_*.csv`
3. **Não cria variant** para outlier de 1 ocorrência (variant só justifica se padrão repetitivo)
4. **Correção fica para onda futura** — registrar em `data/annotations/duvidas-onda-1-outliers.md` para revisor humano corrigir na fonte

## Decisão final

Vocabulário canônico v1.0 escrito em `.claude/context/vocabulario-canonico.json`:

- 8 campos canônicos preenchidos com `canonical_values` + `variants`
- Estratégia **flexível com warning**
- Sufixos descritivos em `esfera_execucao` migram para `esfera_execucao_apoios_parcerias` via lógica em `normalize.py`
- Outliers individuais preservados, logados, correção em onda futura
- `_versao_schema` bumpado de `0.1` para `1.0`

## Justificativa

- Catálogo é **organismo vivo** (futuras ondas terão variações novas); pipeline rígido demais quebra a cada onda
- Devil's Advocate da Rodada 2 já tinha apontado que cerimônia em projeto pequeno é tóxica
- Schema continua como contrato; vocabulário é guideline humano consultável (`vocabulario-canonico.md`)
- Drift ortográfico documentado vai pra onda 2 (revisora pode corrigir na fonte e canonical fica limpo natural)

## Trade-offs

- Aceito risco de drift novo passar despercebido se logs não forem revisados → **mitigação:** rodar `just validate` em CI/CD inclui contagem de unmapped, alerta humano
- Sufixos perdem ordem (se houver "+A +B +C" vira "A; B; C" em apoios_parcerias) → aceitável
- 6 outliers ficam pendentes de correção humana → registrar em `data/annotations/`

## Próximos passos

1. ✅ `vocabulario-canonico.json` v1.0 escrito (FEITO 2026-05-01)
2. ✅ ADR registrada (este doc)
3. C.1.c — implementar `scripts/etl/normalize.py` que consome este vocabulário
4. C.1.f — `validate.py` confere que % de valores canonicalizados ≥ 95%
5. Em onda 2: re-rodar análise de frequência; promover novos valores a canonical se padrão se repetir; bump `_versao_schema` se mudança breaking

## Relacionado

- `.claude/context/vocabulario-canonico.json` v1.0
- `.claude/context/vocabulario-canonico.md` (esquema/instruções)
- `.claude/rules/dados-politicas.md` v1.1 (campo "Vocabulário canônico fechado em campos filtráveis")
- `.claude/skills/normalize-categorico/SKILL.md` (skill que consome este vocabulário)
- `.claude/plans/2026-05-01_bloco-c-exploracao-dados.md` (sub-bloco C.1.b)