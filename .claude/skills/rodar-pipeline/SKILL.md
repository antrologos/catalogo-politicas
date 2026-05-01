---
name: rodar-pipeline
description: "Orquestra pipeline ETL (load planilha → normalize → dedupe → validate → build JSON → testes)"
when_to_use: "Quando uma nova onda chega; após mudanças no schema; em CI/CD; antes de publicar uma nova versão do catálogo"
argument-hint: "[etapa: load|normalize|dedupe|validate|build-json|testar|tudo] [--desde-etapa N] [--planilha caminho.xlsx] [--onda numero]"
allowed-tools: "Bash Read Write Glob"
disable-model-invocation: true
effort: high
versao: 0.1
---

# Skill: rodar-pipeline

Wrapper de **orquestração end-to-end** do pipeline ETL do catálogo de políticas. Lê a planilha-fonte, normaliza, deduplica, valida contra schema e gera JSONs canônicos para consumo do site.

> **`disable-model-invocation: true`** — esta skill **executa side effects** (escreve arquivos em `data/derived/`, lê planilha grande, pode falhar pipeline inteiro). Só é invocada por humano via comando explícito ou por automação CI/CD.

## Propósito

Reduzir um fluxo manual de 6+ passos a um único comando idempotente:

```bash
/rodar-pipeline tudo --onda 1
```

Cada etapa pode ser rodada isolada (debug) ou em sequência (produção). Falhas preservam diretórios temporários para inspeção.

## Pré-condições

Antes de iniciar, a skill verifica:

1. **Python ≥ 3.9** disponível no PATH.
2. **Dependências instaladas**: `openpyxl`, `pandas` (opcional), `jsonschema`. Sugerir `pip install -r requirements.txt` se faltar.
3. **Planilha existe** no caminho informado (default: `Fichas das Políticas - 1ª onda.xlsx` na raiz).
4. **Planilha não está aberta**: ausência de lock file `~$Fichas das Políticas - 1ª onda.xlsx` na mesma pasta. Se presente, **abortar** com instrução clara: "feche o Excel e re-execute".
5. **Diretório `data/derived/` existe** (criar se não, com `mkdir -p`).
6. **Schema disponível** em `.claude/context/policies-schema.json`.
7. **Vocabulário canônico** em `.claude/context/vocabulario-canonico.json` (a skill `normalize-categorico` depende dele).

## Inputs

| Argumento | Tipo | Default | Descrição |
|---|---|---|---|
| `etapa` | string | `tudo` | `load`, `normalize`, `dedupe`, `validate`, `build-json`, `testar` ou `tudo`. |
| `--desde-etapa` | string | — | Pula etapas anteriores. Ex.: `--desde-etapa dedupe` assume que `_temp/` já tem `onda{N}_normalized.json`. |
| `--planilha` | path | `Fichas das Políticas - 1ª onda.xlsx` | Caminho da planilha-fonte. Pode apontar para nova onda. |
| `--onda` | int | `1` | Número da onda; usado para nomear outputs em `data/derived/onda{N}/`. |

## Outputs

| Caminho | Descrição |
|---|---|
| `data/derived/onda{N}/politicas_completo.json` | JSON canônico com todas as fichas da onda, validado contra schema. |
| `data/derived/onda{N}/politicas_por_uf.json` | Mesmo conteúdo, indexado/aninhado por UF (incluindo "federal"). |
| `data/derived/onda{N}_report.json` | Relatório-sumário (totais, por UF, federais únicas vs. replicadas, erros, avisos, tempo). |
| `data/derived/_temp/onda{N}_*.json` | Estados intermediários (apagados em sucesso, preservados em falha para debug). |
| `data/derived/pipeline_onda{N}_YYYY-MM-DD_HHmmss.log` | Log da execução com tempos por etapa. |

Exit codes:
- `0` — pipeline completo OK
- `1` — falha bloqueante em alguma etapa (validação, schema, lock file)
- `2` — sucesso com avisos (ex.: 2 duplicatas detectadas em BA, esperado)

## Fluxo de etapas (10 passos detalhados)

### 1. Pré-flight
- Verifica todas as pré-condições acima.
- Cria diretório de log `data/derived/_temp/` se ausente.
- Abre arquivo de log com timestamp; prefixa toda saída com `[etapa]`.

### 2. `load` — leitura da planilha
- Abre `{planilha}` com `openpyxl(read_only=True)` (seguro mesmo se Excel estivesse aberto — mas já validamos isso na pré-flight).
- Para cada uma das 11 abas, normaliza nome (remove espaço inicial em ` Planilha SP`, `Planilha Pará`, etc.; trata aba truncada `Políticas federais (comuns a to`).
- Normaliza cabeçalhos (resolve `Id`/`ID`/`Coluna 1`, `Link`/`Link oficial`, `Dúvidas`/`Dúvida`, etc. — ver `CLAUDE.md` armadilha #1).
- Filtra linhas-fantasma (validações estendidas até linha 998 com poucas fichas reais — ver armadilha #8).
- Saída: `_temp/onda{N}_raw.json` com lista plana de fichas + metadados de origem (aba, linha original).

### 3. `normalize` — vocabulário canônico
- Para cada ficha, em cada um dos 7 campos categóricos críticos, invoca a skill `normalize-categorico` (ver `.claude/skills/normalize-categorico/SKILL.md`).
- Coleta valores não reconhecidos em `valores_desconhecidos_por_campo` para inclusão no relatório.
- Saída: `_temp/onda{N}_normalized.json`.

### 4. `dedupe` — deduplicação federais×estaduais
- Detecta as ~33 políticas federais replicadas em cada planilha estadual (marcador `"EM TODOS OS ESTADOS"` em `Dúvidas` é heurística inicial; ver armadilha #10 para dual-uso).
- Atribui `id_global` com namespace (`federal:1`, `sp:42`, etc.) e flags `is_federal_replica`, `federal_source_id`.
- Detecta duplicatas internas em BA (`Programa Juros por Educação`, `PRONATEC` × 2 cada — ver armadilha #4) e marca `duplicated_from_id`.
- Saída: `_temp/onda{N}_deduped.json`.

### 5. `validate` — validação de schema
- Carrega `.claude/context/policies-schema.json` (JSON Schema v7 incorporando os 10 padrões da R3.2 — ver `Checkpoint3-decisoes.md`).
- Valida cada ficha individualmente; coleta erros estruturados.
- Se houver erros **críticos** (campos obrigatórios ausentes, valores fora do vocabulário fechado), aborta com exit 1 e relatório claro indicando ficha por ficha.
- Avisos (campos opcionais vazios, completude < 60%) não bloqueiam mas vão ao relatório.
- Saída: `_temp/onda{N}_validation_report.json`.

### 6. `build-json` — formato canônico final
- Transforma chaves para `snake_case` ASCII (decisão a ratificar; default mantém PT-BR original).
- Calcula campos derivados: `slug`, `completude_pct`, `citacao_apa`, `citacao_bibtex`, `criado_em`/`atualizado_em` (se ausentes), `proxima_revisao_prevista`.
- Gera 2 arquivos finais:
  - `data/derived/onda{N}/politicas_completo.json` — array plano
  - `data/derived/onda{N}/politicas_por_uf.json` — `{ "federal": [...], "SP": [...], "RJ": [...], ... }`

### 7. `testar` — sanity check
- Invoca skill `testar-pipeline` com `--suite unit` (10 fichas de referência).
- Se falhar, marca pipeline como **sucesso com avisos** (exit 2) — não invalida outputs, mas exige revisão humana antes de publicar.

### 8. Sumário — `onda{N}_report.json`
```json
{
  "onda": 1,
  "data_execucao": "2026-05-01T14:30:00Z",
  "planilha_origem": "Fichas das Políticas - 1ª onda.xlsx",
  "planilha_sha256": "abc123...",
  "politicas_total": 439,
  "por_uf": { "federal": 33, "SP": 53, "RJ": 41, "MG": 45, "PR": 43, "RS": 40, "BA": 51, "PA": 42, "PE": 44, "CE": 45 },
  "federais_unicas": 33,
  "federais_replicadas_total": 264,
  "duplicatas_internas": [
    { "uf": "BA", "nome": "Programa Juros por Educação", "linhas": [12, 47] },
    { "uf": "BA", "nome": "PRONATEC", "linhas": [21, 38] }
  ],
  "validacao_status": "OK",
  "erros_criticos": 0,
  "avisos": [
    "CE: 16 células com valor 'Opção 2' (placeholder dropdown quebrado)",
    "RJ: 4 colunas faltantes vs. schema padrão"
  ],
  "valores_desconhecidos_por_campo": {
    "Esfera de execução": ["Município com parcerias técnicas"]
  },
  "completude_media_pct": 87.4,
  "tempo_total_ms": 5230
}
```

### 9. Tratamento de erro
- Cada etapa que falha:
  - Loga stack trace completo no `pipeline_onda{N}_*.log`
  - Sugere próximo passo (`"Erro na normalização da ficha SP:42. Inspecione com: normalize-categorico 'Esfera de execução' '...' --verbose"`)
  - Permite retomar com `--desde-etapa <etapa-falhou>` após correção
- **Nunca** sobrescreve outputs anteriores em caso de falha parcial; sempre escreve em `_temp/` primeiro e move só na conclusão da etapa.

### 10. Cleanup
- Em sucesso completo: remove `_temp/onda{N}_*.json` (preserva log).
- Em falha: preserva tudo de `_temp/` para debug; escreve `_temp/onda{N}_FAILED.json` com snapshot do erro.

## Casos de erro

| Cenário | Comportamento | Exit code |
|---|---|---|
| Lock file `~$...xlsx` presente | Aborta na pré-flight com instrução para fechar Excel | 1 |
| Planilha não encontrada | Aborta na pré-flight; sugere `--planilha <caminho>` correto | 1 |
| Schema ausente/inválido | Aborta na pré-flight | 1 |
| Vocabulário canônico ausente | Aborta na pré-flight; sugere completar Bloco C | 1 |
| Erro crítico de validação (campo obrigatório ausente) | Etapa `validate` aborta listando fichas problemáticas | 1 |
| Avisos não-críticos (placeholder Ceará, completude baixa) | Continua; reporta em `onda{N}_report.json` | 2 |
| Erro Python inesperado | Stack trace completo no log; aborta na etapa | 1 |
| Onda nova com aba inesperada | Avisa, processa abas conhecidas, marca em `avisos` | 2 |

## Como testar manualmente

```bash
# Pipeline completo, onda 1
/rodar-pipeline tudo --onda 1

# Apenas validar (planilha já carregada/normalizada)
/rodar-pipeline validate --desde-etapa validate --onda 1

# Nova onda com planilha customizada
/rodar-pipeline tudo --planilha "Fichas das Políticas - 2ª onda.xlsx" --onda 2

# Debug isolado de uma etapa
/rodar-pipeline normalize --onda 1
```

## Justfile sugerido (esboço)

Para conveniência fora do Claude Code, criar `justfile` na raiz do projeto:

```just
# justfile — atalhos para o pipeline ETL

default: tudo

tudo onda="1":
    python -m scripts.etl.pipeline tudo --onda {{onda}}

load onda="1":
    python -m scripts.etl.pipeline load --onda {{onda}}

normalize onda="1":
    python -m scripts.etl.pipeline normalize --onda {{onda}}

dedupe onda="1":
    python -m scripts.etl.pipeline dedupe --onda {{onda}}

validate onda="1":
    python -m scripts.etl.pipeline validate --onda {{onda}}

build-json onda="1":
    python -m scripts.etl.pipeline build-json --onda {{onda}}

testar:
    python -m scripts.etl.testar --suite todas
```

(Equivalente Makefile pode ser produzido a partir disto, mas `just` é preferido pela ergonomia em paths Unicode/Windows.)

## Risco e mitigação

| Risco | Mitigação |
|---|---|
| Pipeline quebra em onda nova com formato divergente | Schema versionado; etapa `load` tolera abas desconhecidas com aviso; `testar` antes de publicar. |
| Sobrescrita acidental de output anterior | Outputs sempre em `data/derived/onda{N}/`; nunca em `data/raw/`; `_temp/` isolado. |
| Pipeline lento (planilha grande) | `openpyxl(read_only=True)`; etapas isoladas; `--desde-etapa` permite resume. |
| Dedupe falsa-positiva (federais com órgão executor diferente por UF tratadas como mesma ficha) | `is_federal_replica` mantém **todas** as réplicas com `federal_source_id` apontando para a federal canônica; nada é descartado, só sinalizado. |
| Lock file detectado tardiamente (durante escrita) | Hook `block_xlsx_write.py` (Bloco A.4.3) duplica garantia. |

## Referências

- `CLAUDE.md`, seção "Armadilhas conhecidas".
- `.claude/working/R1-A1.3-lacunas.md`, lacuna #22.
- `.claude/working/R2-A2.3-skills-agents-hooks-RAW.md`, seção A.4.
- `.claude/working/Checkpoint3-decisoes.md`, decisão 1 (10 padrões de schema).
- `.claude/skills/normalize-categorico/SKILL.md` (chamada na etapa 3).
- `.claude/skills/testar-pipeline/SKILL.md` (chamada na etapa 7).
- `.claude/context/policies-schema.json` (validação na etapa 5).