---
descricao: Schema canônico das fichas de política, deduplicação federais×estaduais, vocabulário canônico fechado, slug estável, citação acadêmica, completude, tesauro hierárquico.
escopo: dados · ETL · contexto
versao: 1.2
ultima_revisao: 2026-05-01
paths:
  - "data/**"
  - "scripts/etl/**"
  - ".claude/context/**"
---

> **v1.2 (2026-05-01, Bloco D):** schema bumpado para v0.2 — adicionados campos `fonte_sha256` (hash SHA-256 do snapshot), `fonte_extensao` (html/pdf/docx/doc/odt/...), `fonte_ocr_aplicado` (boolean). Migrados de "Evoluções planejadas" para "Campos opcionais atuais". ADR: `decisions/2026-05-01_schema-v0.2-snapshot-info.md`.
>
> **v1.1 (2026-05-01):** alinhada ao `policies-schema.json` v0.1. Nomes de campo agora idênticos ao schema. ADR: `decisions/2026-05-01_alinhamento-schema-regra.md`.

# Dados de Políticas

**Status:** OBRIGATÓRIA · **Escopo:** ficha de política, schema canônico, vocabulário, deduplicação

Esta regra define **como** os dados das 439 fichas (originados em `data/raw/Fichas das Políticas - 1ª onda.xlsx`) são representados, validados, deduplicados e servidos a jusante (site, análises, comparação).

## Princípio

Toda ficha de política é um **objeto canônico validado contra schema**, com identificadores estáveis, vocabulário controlado, citação acadêmica derivável e proveniência (snapshot externo + data + autor).

## ID interno estável (`id_interno`)

Toda ficha tem identificador imutável do projeto:

```
FRM-CP-<ano>-<eixo>-<seq4>
ex.: FRM-CP-2026-EDU-0001
```

- `FRM-CP` — prefixo do projeto
- `<ano>` — ano de entrada no catálogo
- `<eixo>` — código de 3 letras (`EDU` educação, `TRA` trabalho/qualificação, `PSO` proteção social)
- `<seq4>` — sequencial 4 dígitos

ID **nunca muda** depois de atribuído (mesmo se a política for revogada). Mudança de classificação cria entrada nova com link `supersedes_id: <id_antigo>`.

> **Nome do campo no schema:** `id_interno`. Schema valida com pattern `^FRM-CP-\d{4}-[A-Z]{2,5}-\d{4}$`.

## Slug único e estável

Toda ficha tem `slug` URL-safe, único, ASCII lowercase com hífens:

```
pronatec
juros-por-educacao
programa-mais-medicos
```

- Gerado por regra determinística a partir do `nome_programa` (lowercase, remoção de diacríticos, hífens em vez de espaços)
- Único globalmente (suffix `-2`, `-3` em colisão)
- Mudança de slug → registrar em `redirect_from: ["slug-antigo"]` (preserva URLs antigas)

## Schema canônico (resumo)

Schema completo em `.claude/context/policies-schema.json` (JSON Schema v7). Aqui o esqueleto e as regras invioláveis.

### Campos obrigatórios (alinhados ao schema)

```json
{
  "id_interno": "FRM-CP-2026-EDU-0001",
  "slug": "pronatec",

  "nome": "PRONATEC",
  "tipo_politica": "Educacional direta",
  "esfera_formulacao": "Federal",
  "esfera_execucao": "Estadual: SEDUC",

  "fonte_url": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12513.htm",
  "fonte_tipo": "lei",

  "criado_em": "2026-05-01T10:00:00-03:00",
  "atualizado_em": "2026-05-01T10:00:00-03:00"
}
```

Os 10 campos acima são `required` no `policies-schema.json` (draft-07). Schema rejeita ficha sem qualquer um deles.

### Campos altamente recomendados (não required mas devem estar quase sempre)

```json
{
  "abrangencia_territorial": "Nacional",
  "situacao_atual": "Ativa / em execução",
  "ano_criacao": 2011,
  "fonte_data_acesso": "2026-05-01",
  "fonte_arquivo_path": "data/external_snapshots/ab/ab12cd...html",
  "atribuicao": "Brasil. Presidência da República. Casa Civil.",
  "uf": "BR",
  "revisado_por": "Maria Clara Gama",
  "proxima_revisao_prevista": "2026-08-01"
}
```

### Campos opcionais relevantes (alinhados ao schema)

```json
{
  "descricao_simples": "Programa que oferece cursos profissionalizantes...",
  "descricao_tecnica": "Instituído pela Lei 12.513/2011...",
  "resumo": "...",
  "apresentacao": "...",

  "orgaos_responsaveis": ["Ministério da Educação", "Secretaria de Educação Profissional e Tecnológica"],
  "fonte_financiamento": "Tesouro / FUNDEB",
  "transferencia_recursos": "Fundo a fundo",

  "modalidade_oferta": "Presencial",
  "tipo_oferta": "Curso/Formação",
  "arranjo_logistico": "Unidade fixa",
  "carga_horaria": "160 horas",
  "unidade_medida": "horas",
  "publico_alvo": "Jovens, adultos, trabalhadores em busca de qualificação",

  "base_legal": "Lei 12.513/2011; Decreto 7.589/2011",

  "integra_outras_politicas": ["FRM-CP-2026-EDU-0042", "FRM-CP-2026-TRAB-0007"],
  "continuidade_governos": "Sim, com mudanças de desenho ao longo do tempo",

  "categorias_temas": [
    {"id": "qualificacao-profissional", "label_pt": "Qualificação profissional", "parent_id": "edu"},
    {"id": "educacao-tecnica", "label_pt": "Educação técnica", "parent_id": "edu"}
  ],

  "versao": "2024-12-01",
  "data_validade_inicio": "2011-10-26",
  "data_validade_fim": null,
  "supersedes_id": null,
  "superseded_by_id": null,

  "is_federal_replica": false,
  "federal_source_id": null,
  "uf": "BR",

  "informacoes_complementares": null,
  "duvidas_revisor": "EM TODOS OS ESTADOS",

  "completude_pct": 87,
  "licenca_inferida": "dominio_publico_lei_8_iv",

  "citacao_apa": "Brasil. (2011). Lei nº 12.513, de 26 de outubro de 2011...",
  "citacao_bibtex": "@misc{brasil_pronatec_2011,...}",
  "data_versao_catalogo": "2026-05-01",

  "redirect_from": []
}
```

## 13 padrões obrigatórios do schema

### 1. ID interno estável (`id_interno`)

`FRM-CP-<ano>-<eixo>-<seq4>`. Imutável.

### 2. Slug único e estável (`slug`)

URL-safe, derivado por regra determinística. `redirect_from` preserva URLs antigas.

### 3. Fonte URL + snapshot local

Toda ficha tem `fonte_url` (HTTPS validada) + `fonte_tipo` (`lei`, `decreto`, `portaria`, `programa`, `outro`) + `fonte_data_acesso` (ISO 8601) + `fonte_arquivo_path` (snapshot local) + `fonte_sha256`.

Sem snapshot local, ficha é marcada `fonte_arquivo_path: null` e `completude_pct` < 100.

### 4. Completude calculada (`completude_pct`)

Pipeline calcula `completude_pct` (0-100) baseado em proporção de campos preenchidos sobre campos esperados (campos obrigatórios pesam mais que opcionais). Exibido como badge no card (inspirado em data.gouv.fr).

### 5. Unidade de medida controlada (`unidade_medida`)

Vocabulário fechado:
- `BRL/mês`, `BRL/ano`, `BRL/beneficiario`
- `beneficiarios/ano`, `vagas/ano`, `matriculas/ano`
- `% populacao`, `% PIB`
- `horas`, `meses`, `anos`
- `unidades`, `municipios_atendidos`

Permite comparação entre políticas com unidades coerentes.

### 6. Citação acadêmica derivada (`citacao_apa`, `citacao_bibtex`)

Pipeline gera ambas a partir de campos canônicos:

```
APA:    Brasil. (2011). Lei nº 12.513, de 26 de outubro de 2011. Diário Oficial da União.
BibTeX: @misc{brasil_pronatec_2011, author={Brasil}, year={2011}, ...}
```

Inclui `data_versao_catalogo` para citar a versão do catálogo consultada.

### 7. Tesauro hierárquico (`categorias_temas`)

Categorias ficam em `.claude/context/vocabulario-canonico.json`, com estrutura:

```json
{
  "id": "qualificacao-profissional",
  "label_pt": "Qualificação profissional",
  "label_en": "Professional qualification",
  "descricao": "Formação para inserção/recolocação no mercado de trabalho",
  "parent_id": "edu"
}
```

Ficha referencia uma ou mais entradas em `categorias_temas` (array de objetos). Validador rejeita id desconhecido. Schema aceita os 5 campos: `id` e `label_pt` obrigatórios; `label_en`, `descricao`, `parent_id` opcionais.

### 8. Versão + validade temporal

```json
"versao": "2024-12-01",
"data_validade_inicio": "2011-10-26",
"data_validade_fim": null
```

- `versao` — string da última edição/atualização da norma
- `data_validade_inicio` — quando a política entrou em vigor
- `data_validade_fim` — `null` se vigente; data se revogada
- Política revogada → `situacao_atual: "Revogada"` + `succeeded_by: "<id-da-sucessora>"`

### 9. Vocabulário canônico fechado em campos filtráveis

Campos abaixo aceitam **apenas** valores do vocabulário canônico (`.claude/context/vocabulario-canonico.json`):

- `tipo_politica` (3 valores)
- `esfera_formulacao`
- `esfera_execucao`
- `abrangencia_territorial`
- `situacao_atual`
- `modalidade_oferta`
- `arranjo_logistico`
- `tipo_oferta`
- `fonte_tipo`
- `unidade_medida`
- `publico_alvo` (texto livre por enquanto; vocabulário planejado para v0.2)

Schema rejeita valor fora-da-lista. Drift ortográfico (ex.: `Estadual::` `Estadual –` `estadual:`) é normalizado **antes** da validação pela skill `normalize-categorico`.

### 10. Timestamps obrigatórios

```json
"criado_em": "2026-05-01T10:00:00-03:00",
"atualizado_em": "2026-05-01T10:00:00-03:00",
"revisado_por": "Maria Clara Gama",
"proxima_revisao_prevista": "2026-08-01"
```

ISO 8601 com timezone. `proxima_revisao_prevista` deriva do TTL do tipo de fonte.

### 11. Descrição dual: simples + técnica

```json
"descricao_simples": "Cursos profissionalizantes para jovens e adultos.",
"descricao_tecnica": "Instituído pela Lei 12.513/2011, o PRONATEC..."
```

Atende WCAG (linguagem simples) **e** público técnico (jurídico/acadêmico).

### 12. Deduplicação federais × estaduais

As ~33 políticas federais aparecem replicadas em cada uma das 9 abas estaduais (com órgão executor local específico). Marcador típico: campo `duvidas_revisor` contém `"EM TODOS OS ESTADOS"`.

Modelagem:
- Política federal canônica: `uf: "BR"`, `is_federal_replica: false`, `federal_source_id: null`
- Réplica estadual: `uf: "SP"`, `is_federal_replica: true`, `federal_source_id: "<id_interno-da-federal>"`

Pipeline:
1. Carrega todas as fichas de todas as abas
2. Identifica fichas estaduais com marcador `EM TODOS OS ESTADOS` ou `nome_programa` exato igual a uma federal
3. Marca como réplica e linka ao `federal_source_id`
4. **Não duplica dados**: campos da réplica são deltas (`orgaos_responsaveis` local; resto herda da federal por referência)

Saída: site exibe federal + UFs onde executada (não 33 entradas idênticas).

### 13. Tratamento do campo `Dúvidas` (dual-uso)

Coluna `Dúvidas` (col 26 da planilha) é usada para duas coisas:
1. Marcador de replicação federal: `"EM TODOS OS ESTADOS"`
2. Notas reais de revisor: `"NÃO CONSEGUI ENCONTRAR A RESOLUÇÃO..."`

Schema atual (v0.1) tem **um único campo** `duvidas_revisor` (string nullable) que recebe ambos os usos. Pipeline:

- Quando o conteúdo é exatamente `"EM TODOS OS ESTADOS"` (ou variantes triviais), serve como marcador de réplica federal — combinar com matching de `nome` para popular `is_federal_replica` + `federal_source_id`.
- Quando o conteúdo é texto livre de revisor, **manter no campo** `duvidas_revisor` E também extrair para `data/annotations/<id_interno>.md` (Markdown rastreável; ver `@.claude/rules/protecao-fontes.md` R6).

> **Evolução planejada (schema v0.2):** separar em dois campos — `duvidas_marcador` (enum: `EM_TODOS_OS_ESTADOS` | null) e `duvidas_revisor` (texto livre). Documentar quando promover.

## Validação

`@.claude/hooks/validate_json_schema.py` (PostToolUse Write em `data/derived/*.json`) valida toda saída contra `policies-schema.json`. Falhas bloqueiam (exit code 2).

Validação adicional (rodada manual, parte da skill `testar-pipeline`):
- Duplicidades por `nome_programa` dentro da mesma UF (ex.: BA tem 2× PRONATEC)
- Categorias referenciadas existem no vocabulário
- URLs respondem 200 (sample mensal)
- `completude_pct` ≥ 60 para fichas em destaque

## Vocabulário canônico

Estrutura em `.claude/context/vocabulario-canonico.md` (esquema). Valores em `.claude/context/vocabulario-canonico.json` (preencher na rodada de exploração de dados — Bloco C).

Estrutura por dimensão:

```json
{
  "tipo_politica": {
    "tipo": "enum_fechado",
    "valores": [
      {"id": "edu_direta", "label_pt": "Educacional direta"},
      {"id": "tra_direta", "label_pt": "Trabalho/qualificação direta"},
      {"id": "pso_impacto_edu", "label_pt": "Proteção social com impacto educacional"}
    ]
  },
  "categorias_temas": {
    "tipo": "tesauro_hierarquico",
    "valores": [
      {"id": "edu", "label_pt": "Educação", "parent_id": null},
      {"id": "qualificacao-profissional", "label_pt": "Qualificação profissional", "parent_id": "edu"}
    ]
  }
}
```

## Procedimento ETL (visão geral)

```
1. Carregar planilha (openpyxl read_only)
2. Normalizar cabeçalhos (variantes Id/ID/Coluna 1, Link/Link oficial, etc.)
3. Empilhar abas estaduais + federal (atenção: nomes de aba com espaço inicial e truncamento)
4. Normalizar valores categóricos (drift ortográfico) — skill normalize-categorico
5. Atribuir IDs internos (FRM-CP-...)
6. Gerar slugs únicos
7. Detectar e marcar duplicatas / réplicas federais
8. Calcular completude_pct
9. Gerar citacao_apa e citacao_bibtex
10. Validar contra policies-schema.json
11. Salvar data/derived/policies-onda-1-<data>.json
12. Atualizar symlink data/derived/latest.json
```

Detalhes em `@.claude/rules/pipeline-reproducible.md`.

## Campos de snapshot (schema v0.2 — adicionados em Bloco D)

Para cada ficha cuja `fonte_url` foi capturada via skill `capturar-norma`, o pipeline ETL preenche automaticamente:

```json
{
  "fonte_arquivo_path": "data/external_snapshots/ab/ab12cd...html",
  "fonte_sha256": "ab12cd...64chars-hex",
  "fonte_extensao": "html",
  "fonte_ocr_aplicado": false
}
```

- `fonte_sha256`: SHA-256 hex (64 chars; pattern `^[a-f0-9]{64}$`) do snapshot bruto. Verificação de integridade + base do versionamento sem sobrescrita (R5/R6 captura-responsavel) + detecção de mudança em revalidação.
- `fonte_extensao`: enum {html, pdf, docx, doc, odt, txt, json, xml, null}. Permite filtragem na UI ("só políticas com norma em PDF").
- `fonte_ocr_aplicado`: boolean. True se texto extraído via Tesseract+ocrmypdf (PDFs escaneados). Sinaliza menor confiabilidade de extração ao usuário/QA.

Pipeline carrega `data/external_snapshots/index.json` em `build_json.py` e popula via lookup por `fonte_url`.

## Evoluções planejadas (schema v0.3+)

Ideias estruturais que ainda não estão no schema. Cada promoção requer ADR + plan mode + bump de `schema_version`:

| Campo planejado | Tipo | Motivação |
|---|---|---|
| `schema_version` | string (ex.: `"0.3"`) | Cada JSON canônico carrega a versão do schema com que foi gerado |
| `orgaos_responsaveis_detalhes` | array de `{nome, papel, nivel}` | Granularidade (formulador vs executor; ministério vs secretaria interna) |
| `base_legal_estruturada` | array de `{tipo, numero, ano, url}` | Hoje é string concatenada; estrutura facilita filtro/citação por norma |
| `publico_alvo_controlado` | array com vocabulário fechado | Hoje é texto livre; vocabulário permite filtro facetado |
| `carga_horaria_numerica` | objeto `{valor, unidade}` | Hoje é string; estruturar para comparação |
| `duvidas_marcador` (separado de `duvidas_revisor`) | enum | Separar marcador de réplica federal de notas reais de revisor |
| `fonte_versao_capturada` | string | Rastrear versão da norma online quando capturada |
| `fonte_snapshots[]` | array | Múltiplos snapshots por ficha (histórico de versões) |

Não promover sem registro em `.claude/decisions/YYYY-MM-DD_schema-vN.md`.

## Anti-padrões proibidos

- Criar ficha sem snapshot local (`fonte_arquivo_path: null` aceito apenas em casos documentados)
- Inventar valor para campo categórico (sempre vocabulário canônico)
- Duplicar federais como fichas independentes em cada UF
- Editar JSON canônico à mão (corrigir na fonte e re-rodar pipeline)
- Misturar `duvidas` (marcador) e `duvidas_revisao_humana` (texto livre)
- ID interno reaproveitado entre fichas distintas
- Slug com acento ou caractere não-URL-safe
- Adicionar campo ao schema sem ADR + plan mode + atualização desta regra

## Relação com outras regras

- `@.claude/rules/protecao-fontes.md` — imutabilidade da planilha
- `@.claude/rules/pipeline-reproducible.md` — automação ETL
- `@.claude/rules/captura-responsavel.md` — origem dos snapshots
- `.claude/context/policies-schema.json` — schema concreto
- `.claude/context/vocabulario-canonico.md` — esquema do vocabulário
