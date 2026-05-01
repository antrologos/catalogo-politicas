# Vocabulário Canônico — esquema e processo

> Status: ESTRUTURA criada (Bloco A, Rodada 4); VALORES a preencher em Bloco C após exploração rica dos dados.

## Propósito

A planilha-fonte tem **drift ortográfico sério** em campos categóricos — em particular `Esfera de execução` mostra **31 valores únicos para um vocabulário oficial de ~20**. Variantes incluem:

- Hífen `-` vs en-dash `–` vs travessão `—`
- Aspas retas `"..."` vs aspas tipográficas `"..."` `«...»`
- Dois-pontos `:` vs `::`
- Capitalização inconsistente
- Espaços extras em borda
- Acentuação inconsistente

Filtros, gráficos e comparações no site (Bloco F) **quebram** se dados não forem normalizados antes. O **vocabulário canônico** define para cada campo categórico:
1. Os valores aceitos (`canonical_values` — lista fechada);
2. Mapeamento de variantes → valor canônico (`variants`).

A skill `normalize-categorico` (Agent 4.2) consome este artefato para padronizar derivados em `data/derived/`.

## Estrutura JSON esperada

```json
{
  "campos": {
    "<nome_do_campo>": {
      "canonical_values": ["Valor A", "Valor B", "Valor C"],
      "variants": {
        "valor a": "Valor A",
        "valor  a (com espaços)": "Valor A",
        "VALOR A": "Valor A"
      },
      "descricao": "Texto humano sobre o campo, fonte oficial, regras especiais."
    }
  }
}
```

### Convenções

- `canonical_values`: case-sensitive; deve refletir o valor "oficial" da aba `Modelo categorias` da planilha-fonte (após decisão humana em Bloco C).
- `variants`: chaves são lower-case + strip + collapse-whitespace (a skill `normalize-categorico` aplica esses transforms antes de consultar). Valor é o canonical exato.
- `descricao`: texto livre em PT-BR; explica origem do vocabulário, contagem oficial, observações relevantes.

## Os 8 campos com vocabulário canônico fechado

Inicialmente, **8 campos** têm vocabulário canônico fechado:

| # | Campo                       | Valores oficiais (~) | Em uso real (~) | Drift conhecido |
|---|-----------------------------|---------------------:|----------------:|---|
| 1 | `tipo_politica`             | 3                   | 3              | Baixo (já preenchido) |
| 2 | `esfera_formulacao`         | 12                  | 7              | Médio |
| 3 | `esfera_execucao`           | 20                  | 31 variantes!  | **Alto** (alvo crítico) |
| 4 | `tipo_oferta`               | 10                  | ?              | A medir |
| 5 | `modalidade_oferta`         | 6                   | ?              | A medir |
| 6 | `arranjo_logistico`         | 5                   | ?              | Médio (aspas) |
| 7 | `abrangencia_territorial`   | 8                   | 4              | Baixo (já preenchido) |
| 8 | `situacao_atual`            | 5                   | 5              | Baixo (já preenchido) |

Outros campos (`base_legal`, `orgaos_responsaveis`, `publico_alvo`, etc.) **não** têm vocabulário canônico fechado — são texto livre estruturado (com normalizações leves: trim, capitalização sentence-case).

## Processo de atualização

Toda mudança no vocabulário canônico **deve**:

1. **Abrir ADR** em `.claude/decisions/YYYY-MM-DD_vocabulario-<campo>.md` documentando:
   - Contexto (que drift foi observado, com contagens)
   - Decisão (canonical adotado e justificativa)
   - Alternativas consideradas
   - Impacto downstream (skill normalize-categorico, build do site)

2. **Bumpar `_versao_schema`** em `vocabulario-canonico.json`:
   - `0.1` → `0.2` se mudança de variante
   - `0.x` → `1.0` quando todos os campos preenchidos
   - `x.y` → `(x+1).0` se quebrar compat

3. **Re-rodar pipeline completo** (`/rodar-pipeline`) para gerar derivados normalizados, e `/testar-pipeline` para validar.

4. **Commit** com mensagem clara: `vocabulario(esfera_execucao): adicionar variante "Estado-MEC :: parceria"`.

## Onde isso aparece

- **Schema** (`policies-schema.json`): campos `tipo_politica`, `situacao_atual`, `abrangencia_territorial` têm `enum` direto (validação dura). Os demais aceitam string livre, mas a skill `normalize-categorico` deve ter sido aplicada antes da validação.
- **Hook** `validate_json_schema.py`: valida JSON em `data/derived/*.json` contra o schema.
- **Skill** `normalize-categorico` (Bloco A, Rodada 4): consome `vocabulario-canonico.json` para mapeamento.
- **Site** (Bloco F): usa `canonical_values` para popular dropdowns de filtros facetados.

## Status atual (2026-05-01)

- ✅ `tipo_politica` — preenchido (3 valores)
- ✅ `abrangencia_territorial` — parcial (4 valores em uso, 4 oficiais a confirmar)
- ✅ `situacao_atual` — preenchido (5 valores)
- ⬜ `esfera_formulacao` — Bloco C
- ⬜ `esfera_execucao` — Bloco C (prioridade máxima — maior drift)
- ⬜ `tipo_oferta` — Bloco C
- ⬜ `modalidade_oferta` — Bloco C
- ⬜ `arranjo_logistico` — Bloco C

## Referências

- Aba `Modelo categorias` da planilha-fonte (col A, blocos numerados com bullets `•`)
- `CLAUDE.md` § Vocabulário canônico (de Modelo categorias)
- `.claude/working/R1-A1.3-lacunas.md` lacunas #3 e #5
- `.claude/working/Checkpoint3-decisoes.md` decisão #1