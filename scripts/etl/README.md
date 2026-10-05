# Pipeline ETL — Catálogo de Políticas

Este diretório implementa o ETL que converte as planilhas Excel `Fichas das
Políticas — Nª onda.xlsx` em `data/derived/latest.json`, o JSON canônico
consumido pelo site Eleventy.

## Visão geral

```
data/raw/*.xlsx
       │
       ▼
 1. load_planilha.py    → _intermediate/raw_planilha.csv
       │
       ▼
 2. normalize.py        → _intermediate/normalized.csv
       │
       ▼
 3. dedupe.py           → _intermediate/deduped.csv
       │
       ▼
 4. build_ids.py        → _intermediate/with_ids.csv
       │
       ▼
 5. build_json.py       → policies-onda-N-YYYY-MM-DD.json
       │                  latest.json (cópia)
       ▼
 6. validate.py         → _intermediate/validation_report.json
```

Comando único:

```bash
just etl
```

## Adicionar uma nova onda

Quando uma nova planilha `Fichas das Políticas - Nª onda.xlsx` for produzida,
siga o procedimento abaixo. **Não é necessário tocar em
`normalize.py`/`dedupe.py`/`build_ids.py`/`build_json.py`/`validate.py`** se a
nova onda usar a mesma estrutura de colunas das anteriores.

### 1. Copiar para `data/raw/`

```bash
cp ~/Downloads/"Fichas das Políticas - Nª onda.xlsx" data/raw/
```

Manter o nome exato — o pipeline usa o caminho literal.

### 2. Inspecionar a planilha

Antes de mexer no ETL, descubra:

- Quais abas existem e quantas fichas cada uma tem
- Se a aba "Políticas Federais" duplica a da 1ª onda (pular se sim)
- Se há UFs já cobertas (geralmente não, mas a 2ª onda foi 100% nova)
- Se há nomes de aba com espaço inicial, cedilha ou truncamento Excel (>31 chars)
- Se há colunas-fantasma vazias depois da última coluna válida (`Coluna 28`,
  `Coluna 29`, etc.)
- Se há "headers de typo" como `F`, `G` em alguma aba (vistos na 2ª onda
  para Mato Grosso)

Script de exploração rápida:

```python
import openpyxl
wb = openpyxl.load_workbook("data/raw/Fichas das Políticas - Nª onda.xlsx",
                             read_only=True, data_only=True)
for nome in wb.sheetnames:
    ws = wb[nome]
    print(f"{nome!r}  → {sum(1 for r in ws.iter_rows(min_row=2, max_col=1, values_only=True) if r[0])} fichas")
```

### 3. Atualizar `load_planilha.py`

Adicionar entradas em `SOURCES`:

```python
RAW_XLSX_ONDA3 = ROOT / "data" / "raw" / "Fichas das Políticas - 3ª onda.xlsx"

ABA_UF_ONDA3: dict[str, str | None] = {
    "Modelo de Categorias": None,               # dicionário humano; pular
    "Políticas Federais (Comuns a to": None,    # se duplicada, pular
    "Distrito Federal": "DF",
    "Acre": "AC",
    # ... uma entrada por aba; valor None pula a aba
}

SOURCES = [
    (RAW_XLSX_ONDA1, ABA_UF_ONDA1),
    (RAW_XLSX_ONDA2, ABA_UF_ONDA2),
    (RAW_XLSX_ONDA3, ABA_UF_ONDA3),
]
```

**Convenções**:
- A aba `Modelo de Categorias` (dicionário humano) **sempre** recebe `None`
- A aba federal duplicada **sempre** recebe `None` (a canônica vem da 1ª onda)
- Use o nome **exato** da aba — com espaço inicial, acento e truncamento
  Excel se houver (`'Políticas Federais (Comuns a to'`, sim, truncado)

Se a planilha tiver colunas-fantasma novas (`Coluna 32`, etc.), adicionar
em `GHOST_HEADERS`.

Se a planilha tiver headers digitados errado em alguma coluna (ex.: `F` em
vez de `Nome do Programa` na 2ª onda MT), adicionar em `HEADER_MAP`:

```python
HEADER_MAP = {
    ...
    "f": "nome",   # typo na aba <UF> da Nª onda
}
```

### 4. Rodar o pipeline completo

```bash
just etl
```

Conferir saída:

- `data/derived/_intermediate/raw_planilha.csv` — fichas brutas unificadas
- `data/derived/_intermediate/deduped.csv` — réplicas federais marcadas
- `data/derived/policies-onda-1-YYYY-MM-DD.json` — JSON canônico
- `data/derived/latest.json` — cópia para consumo pelo site

### 5. Validar contra o schema

```bash
python -B scripts/etl/validate.py
```

Para publicação, executar `python -B scripts/etl/validate.py --strict`: erros devem bloquear o avanço. Sem `--strict`, o comando apenas reporta. Erros típicos da
incorporação de nova onda:

- **`situacao_atual` fora do vocabulário**: valor novo como
  "Descontinuada / sem oferta recente identificada" → mapear em
  `normalize.py` para o valor canônico ou adicionar ao vocabulário em
  `.claude/context/vocabulario-canonico.json`.
- **`tipo_politica` fora do vocabulário**: valores como
  "Educacional indireta / infraestrutura" → decidir caso a caso
  se promover a uma 4ª categoria oficial (requer ADR) ou reclassificar
  em uma das 3 existentes.
- **Campos required ausentes (`esfera_formulacao`, `esfera_execucao`)**:
  geralmente indica ficha incompleta na fonte; revisar com a equipe de
  pesquisa.

Cada ficha inválida fica visível em
`data/derived/_intermediate/validation_report.json` (campo `erros_amostra`)
com `id_interno`, `slug`, `uf` e `mensagem`. Compartilhar com a equipe de
pesquisa.

### 6. Validar o site dentro do projeto

Nesta rodada toda escrita fica em `G:/Drives compartilhados/FRM_CatalogoPoliticas`.
O segundo clone é somente leitura; não copiar derivados nem executar build nele.
O site desta árvore lê os derivados do mesmo projeto.

```powershell
.venv/Scripts/python.exe -B scripts/etl/validate.py --strict
Set-Location site
npm test
npm run build
```

Conferir contagens e navegação (`/`, `/sobre/`, `/uf/<sigla>/`). O loader do site
filtra réplicas federais. Usar saída isolada dentro do projeto se houver prévia
concorrente; não apagar saídas ou encerrar processos de outras sessões.

### 7. Commit e publicação

Quando autorizados, revisar o diff e commitar a partir da raiz deste projeto:
manifestos, registro persistente, derivados, código e documentação pertinentes.
Não incluir relatórios privados, caches, snapshots binários ou fontes imutáveis
alteradas. Executar o push diretamente deste repositório G e acompanhar testes
e deploy no GitHub Actions. O tempo de publicação depende da execução da CI.

## Padrões e armadilhas conhecidas

- **Encoding**: todo I/O explicita `encoding="utf-8"`. Sem isso, paths com
  acento (`Ceará`, `Pará`, `Goiás`) quebram silenciosamente no Windows.
- **Nomes de aba**: copiar **literal** (com espaço inicial, cedilha ou
  truncamento Excel). Esses caracteres não aparecem visualmente no Excel
  mas o `openpyxl` os preserva.
- **Coluna fantasma**: o Excel costuma deixar colunas `Coluna 28`/`29`/`30`
  preenchidas com header genérico (mas sem dados) quando o usuário rola
  além da última coluna real. O loader trata via `GHOST_HEADERS`.
- **Typo no header**: a aba "Mato Grosso" da 2ª onda tem coluna B com header
  literal `'F'` em vez de `'Nome do Programa'`. Resolvido via mapping
  específico em `HEADER_MAP`.
- **Aba duplicada**: a aba "Políticas Federais (Comuns a to" da 2ª e da 3ª
  ondas é **quase** idêntica à da 1ª (32 de 33 fichas). Marcamos ambas como
  `None` em `ABA_UF_ONDA2`/`ABA_UF_ONDA3` para evitar duplicar a canônica.
- **Variante de cabeçalho silenciosa** (3ª onda): `Órgão(s) responsável(eis)
  com especificações` não casava com o `HEADER_MAP` e a coluna seria
  descartada sem erro — só aparece na lista "Cabeçalhos NÃO mapeados" do
  log do `load_planilha.py`. **Sempre conferir essa lista** ao incorporar onda.
- **Valores fora do vocabulário** quebram o job `validate` do deploy
  (`situacao_atual`, `tipo_politica`) ou criam páginas de faceta espúrias no
  site (`abrangencia_territorial`, `modalidade_oferta`). Mapear em
  `variants` do `vocabulario-canonico.json`. "Distrital" (DF) mapeia para
  "Estadual"; o site exibe o rótulo "Distrital" nas fichas do DF.
- **Renomear categoria de `tipo_politica`** exige atualizar `TIPO_TO_EIXO`
  em `build_ids.py` — senão os IDs caem em `OUTR` (aconteceu entre
  2026-05-14 e 2026-10-04; `tests/toy_onda3.py` agora pega isso).
- **Réplicas federais**: o `dedupe.py` marca `is_federal_replica=true`
  quando (a) o campo `duvidas_revisor` contém `"EM TODOS OS ESTADOS"` ou
  (b) o `nome` normalizado de uma ficha estadual casa com uma federal
  canônica. **Não há configuração adicional necessária para novas UFs.**

## Estrutura de IDs

`build_ids.py` atribui `id_interno` no formato `FRM-CP-<ano>-<eixo>-<seq4>`:

- `<ano>` — ano do catálogo (`2026`)
- `<eixo>` — `EDU` / `TRAB` / `PSOC` / `OUTR` (derivado do `tipo_politica`)
- `<seq4>` — sequencial por eixo

A sequência é **global** entre ondas: a 2ª onda começa onde a 1ª parou.
IDs **nunca** são reaproveitados — política revogada mantém seu ID.

### Registro persistente (desde 2026-10-04)

`data/derived/registro_fichas.csv` guarda, para cada ficha, a chave
`uf|nome normalizado|ocorrência`, o `id_interno`, o `slug`, a onda, as datas
`criado_em`/`atualizado_em` e o hash do conteúdo. Com ele:

- reordenar linhas na planilha **não** muda IDs nem slugs;
- fichas novas recebem o próximo número do eixo e a data do processamento;
- ficha que some da planilha fica `ativo=False` (ID e slug não voltam a ser usados);
- renomear uma política na planilha cria uma chave nova (novo ID) — se for
  só correção de grafia, ajuste o registro à mão antes de rodar o ETL;
- `atualizado_em` só muda quando o hash do conteúdo muda (build_json.py).

**Commitar o registro** junto com o `latest.json`.

## Histórico

| Data | Ação | Resultado |
|---|---|---|
| 2026-05-01 | 1ª onda incorporada | 439 fichas em 9 UFs + Federal |
| 2026-05-13 | 2ª onda incorporada | 843 fichas em 18 UFs + Federal (308 únicas após dedup) |
| 2026-05-13 | Filtro de linhas-fantasma (MA) | 822 fichas (287 únicas) |
| 2026-10-04 | 3ª onda incorporada (MS, RR, DF, RO, PI, AC, SE, TO, AP) + 2ª onda revisada | 1158 fichas em 27 UFs + Federal (366 únicas após dedup) |
| 2026-10-04 | Correções de vocabulário pelo dicionário oficial "Modelos de Categorias" da 3ª onda | 0 valores fora do vocabulário (eram 166) |

## Veja também

- `.claude/rules/pipeline-python-etl.md` — convenções Python
- `.claude/rules/pipeline-reproducible.md` — automação via justfile
- `.claude/rules/dados-politicas.md` — schema canônico e vocabulário
- `.claude/context/policies-schema.json` — JSON Schema v0.2
- `.claude/context/vocabulario-canonico.json` — valores aceitos por campo

## Novas experiências documentais (sem modificar planilhas)

Manifestos data/curadoria/novas-*.json usam versao: 1 e experiencias.
Cada entrada contém chave_fonte estável, campos canônicos, justificativa,
referencias públicas (url, titulo, consultado_em) e verificado_em.
Nome, UF, tipo de política, fonte pública e descrição são obrigatórios.

build_ids.py acrescenta as entradas após dedupe e preserva sua identidade no
mesmo registro_fichas.csv, sob curadoria|chave_fonte. Não modificar a chave
quando corrigir o título. Novas BR não são replicadas automaticamente nas UFs.
Campos de ID, slug, captura e datas derivadas não são aceitos no manifesto.

build_json.py aplica os campos tipados antes das capturas e das correções.
A consulta de uma referência não cria data de captura. Com novas entradas,
a saída padrão passa a policies-curadoria-YYYY-MM-DD.json, preservando o
produto da onda anterior. Um nome explícito também pode ser usado:

    python -B scripts/etl/build_json.py --output data/derived/policies-relatorios-2026-10-05.json

O caminho deve ficar dentro do projeto e ser distinto de latest.json; a
cópia latest continua sendo atualizada. Executar depois `python -B scripts/etl/validate.py --strict`.

## Revisão editorial e ausência de fonte

Correções sem consulta externa usam `nivel: leitura_editorial_evidencia_insuficiente`,
`referencias: []`, justificativa e nota explícita em `duvidas_revisor`. Não são
confirmações substantivas. Uma fonte incompatível pode ser removida com `novo: null`;
o pipeline limpa sua proveniência e gera citação sem URL. Novas experiências
continuam exigindo fonte pública. Ver o ADR de 05/10/2026 sobre revisão editorial.
