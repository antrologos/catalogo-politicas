---
name: testar-pipeline
description: "Testa pipeline ETL com subset de referência (10 fichas, edge cases)"
when_to_use: "Após qualquer mudança em scripts ETL; antes de commit; em CI; após nova onda; após edição em vocabulário canônico ou schema"
argument-hint: "[--suite toy|unit|integracao|todas] [--verbose] [--gerar-referencia]"
allowed-tools: "Read Bash Write Grep"
disable-model-invocation: false
effort: medium
versao: 0.1
---

# Skill: testar-pipeline

Suite de testes automáticos do pipeline ETL. Garante que mudanças em scripts (normalização, deduplicação, validação) não quebram silenciosamente a saída canônica.

## Propósito

Sem testes, qualquer ajuste em `normalize-categorico`, no schema, ou no `rodar-pipeline` pode introduzir regressão detectável apenas em produção (site quebrado, busca devolvendo zero, gráficos vazios). Esta skill é o **portão de QA**: verde = OK para publicar; vermelho = consertar antes.

Roda em **3 níveis** com tempos de execução crescentes:

| Suite | Tempo | O que testa | Quando rodar |
|---|---|---|---|
| `toy` | < 30 s | Lógica isolada com inputs sintéticos hardcoded | A cada save em script ETL |
| `unit` | < 2 min | 10 fichas reais (subset de referência) | Antes de commit |
| `integracao` | 2-10 min | Onda completa (~439 fichas) end-to-end | Antes de publicar onda; em CI |
| `todas` | 5-15 min | Tudo acima | Antes de release |

## Inputs

| Argumento | Default | Descrição |
|---|---|---|
| `--suite` | `unit` | `toy`, `unit`, `integracao` ou `todas`. |
| `--verbose` | off | Log detalhado de cada assertion (padrão: só sumário). |
| `--gerar-referencia` | off | **Cuidado!** Sobrescreve `data/tests/reference_subset_10fichas.json` com saída atual. Só usar quando comportamento mudou intencionalmente e foi revisado por humano. |

## Outputs

- **Relatório**: `data/tests/test_results_YYYY-MM-DD_HHmmss.json`
- **Symlink/cópia**: `data/tests/test_results_latest.json` → mais recente
- **stdout**: sumário humano-legível
- **stderr**: detalhes de falhas

Exemplo de relatório:

```json
{
  "suite": "unit",
  "timestamp": "2026-05-01T14:30:00Z",
  "duracao_ms": 1850,
  "total": 23,
  "passed": 22,
  "failed": 1,
  "warnings": 0,
  "falhas": [
    {
      "test": "ficha_federal:1_normalizacao_esfera",
      "esperado": "Federal",
      "atual": "federal",
      "diff": "casing divergente — verificar normalize-categorico"
    }
  ],
  "ambiente": {
    "python": "3.11.5",
    "openpyxl": "3.1.2",
    "jsonschema": "4.20.0",
    "platform": "win32"
  }
}
```

Exit codes:
- `0` — todos os testes passaram
- `1` — pelo menos um teste falhou
- `2` — passou com avisos (edge case não-bloqueador detectado)

## Subset de referência

Arquivo: `data/tests/reference_subset_10fichas.json` (versionado em git).

**Composição** — 1 ficha por UF + 1 federal canônica:

| ID | Origem | Por que escolhida |
|---|---|---|
| `federal:1` | Aba federal | PRONATEC — política federal canônica replicada |
| `sp:1` | ` Planilha SP` | Política estadual SP típica, completude alta |
| `rj:1` | ` Planilha RJ` | RJ tem só 27 colunas — testa schema com campos faltantes |
| `mg:1` | `Planilha MG` | MG está limpa — caso "fácil" |
| `pr:1` | `Planilha Paraná` | PR tem links quebrados conhecidos (Y5, Y31) |
| `rs:1` | `Planilha Rio Grande do Sul` | RS tem 3 cols-fantasma vazias |
| `ba:1` | `Planilha Bahia` | BA tem `Coluna 1` em vez de `Id` + 2 duplicatas conhecidas |
| `pa:1` | ` Planilha Pará` | PA tem espaço inicial no nome + 4 cols-fantasma |
| `pe:1` | `Planilha Pernambuco` | PE tem `Coluna 1` |
| `ce:1` | `Planilha Ceará` | CE tem 16 placeholders `Opção 2` (dropdown quebrado) |

Cada entrada do JSON contém: input bruto + output canônico esperado após pipeline completo.

## Edge cases cobertos

A suite `unit` inclui testes de borda explícitos:

1. **Campos vazios** — ficha com `Apresentação` vazia: pipeline aceita, marca `completude_pct < 100`.
2. **Acentos e cedilha preservados** — `"Educação Profissional"` vai e volta sem mojibake (`Educa��o`).
3. **Duplicata exata em BA** — pipeline detecta, marca `duplicated_from_id`, **não** descarta.
4. **URL quebrada** — link 404 não bloqueia pipeline (será capturado pela skill `validar-link` separadamente).
5. **Placeholder Ceará `Opção 2`** — `normalize-categorico` retorna erro específico; pipeline marca aviso, não bloqueia.
6. **Federal replicada em UF** — flag `is_federal_replica=true` + `federal_source_id` apontando para federal canônica.
7. **Cabeçalho divergente** — `Coluna 1` (BA, PE) é re-mapeado para `Id` na etapa `load`.
8. **En-dash em valor categórico** — `"Município – com parcerias"` normaliza para `"Municipal - com parcerias"`.

## Algoritmo (8 passos)

1. **Carregar configuração da suite** (lista de testes a executar).
2. **Carregar referência** (`data/tests/reference_subset_10fichas.json`); se ausente e suite ≠ `toy`, abortar com instrução para gerar.
3. **Executar testes em ordem**:
   - **Toy**: inputs sintéticos hardcoded; sem I/O de arquivo.
   - **Unit**: para cada ficha de referência, rodar pipeline isolado e comparar output campo a campo.
   - **Integração**: rodar pipeline completo (`rodar-pipeline tudo --onda 1`) sobre planilha real; verificar contagens, schema, deduplicações coerentes.
4. **Para cada assertion**: registrar `{test, esperado, atual, status}`; em `--verbose`, imprimir cada uma.
5. **Consolidar resultados** no JSON do relatório.
6. **Imprimir sumário humano**:
   ```
   ✓ toy: 5/5 (250 ms)
   ✓ unit: 22/23 (1.6 s)
     ✗ ficha_federal:1_normalizacao_esfera — esperado "Federal", atual "federal"
   ⚠ avisos: 1 (placeholder Ceará detectado em ce:1, esperado)
   exit: 1
   ```
7. **Em falhas**: sugerir comandos de debug específicos (ex.: `normalize-categorico "Esfera de execução" "federal" --verbose`).
8. **Persistir relatório**; atualizar symlink `test_results_latest.json`.

## `--gerar-referencia` (cuidado!)

Sobrescreve `data/tests/reference_subset_10fichas.json` com a saída atual do pipeline. **Só usar quando**:

- O comportamento do pipeline mudou **intencionalmente** (novo campo, nova regra de normalização, novo schema).
- A mudança foi **revisada por humano** e documentada em `decisions/YYYY-MM-DD_atualizacao-referencia-testes.md`.
- O commit subsequente inclui (a) o novo `reference_subset_10fichas.json`, (b) o ADR justificando, (c) atualização eventual desta skill.

A skill exige confirmação interativa por padrão antes de sobrescrever:

```
ATENÇÃO: vou sobrescrever data/tests/reference_subset_10fichas.json.
Última modificação: 2026-04-15 (16 dias atrás).
Última geração via --gerar-referencia: 2026-03-01.
Motivo desta atualização (será logado em data/tests/REFERENCIA_HISTORY.md):
> _
```

## Casos de erro

| Cenário | Comportamento | Exit |
|---|---|---|
| Subset de referência ausente | Suite `unit`/`integracao`/`todas`: aborta com instrução de gerar; suite `toy` segue normalmente | 1 |
| Subset corrompido (JSON inválido) | Aborta; sugere reverter via git ou gerar novo | 1 |
| Pipeline aborta em meio à `integracao` | Marca todos os testes restantes como `skipped`; relatório completo com causa raiz da etapa que falhou | 1 |
| Python ausente | Aborta na pré-flight com instrução de instalação | 1 |
| Edge case esperado (placeholder Ceará) | Loga como aviso, não falha | 2 |
| Mudança intencional sem `--gerar-referencia` | Falha unitária (output ≠ referência); mensagem sugere se comportamento foi intencional, rodar `--gerar-referencia` | 1 |

## Como testar manualmente

```bash
# Smoke test mais rápido possível
/testar-pipeline --suite toy

# Antes de commit (default)
/testar-pipeline

# Verbose para ver assertion por assertion
/testar-pipeline --suite unit --verbose

# Antes de publicar nova onda
/testar-pipeline --suite todas

# Atualizar referência intencionalmente
/testar-pipeline --suite unit --gerar-referencia
```

## Risco e mitigação

| Risco | Mitigação |
|---|---|
| Referência desatualizada vs. comportamento desejado → falsos vermelhos | Versioná-la em git; ADR obrigatório antes de regenerar; `--gerar-referencia` exige confirmação. |
| Testes lentos desencorajam execução | Suite `toy` < 30 s; `unit` < 2 min; CI roda `integracao` em background. |
| Assertion frágil (compara timestamps voláteis) | Aceitar variações em campos `criado_em`/`atualizado_em` ± 5 s; comparar resto exato. |
| Cobertura insuficiente em UF nova | Quando 11ª UF entrar (próximas ondas), adicionar ficha ao subset + atualizar tabela acima. |
| Subset de 10 não capturar bug específico | Suite `integracao` cobre onda completa; bugs detectados ali viram nova ficha no subset (regression test). |

## Referências

- `.claude/working/R1-A1.3-lacunas.md`, lacuna #23.
- `.claude/working/R2-A2.3-skills-agents-hooks-RAW.md`, seção A.5.
- `.claude/skills/rodar-pipeline/SKILL.md` (etapa `testar` chama esta skill).
- `data/tests/reference_subset_10fichas.json` (a ser criado no início do Bloco C).
- `data/tests/REFERENCIA_HISTORY.md` (changelog das atualizações de referência).
