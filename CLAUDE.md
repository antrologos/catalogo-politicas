# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Status: Blocos A, B, C, D e E concluídos (2026-05-01).** Site PoC no ar em https://antrologos.github.io/catalogo-politicas/. Próximo: Bloco F (construção site MVP completo). Antes de qualquer trabalho, leia `.claude/README.md` para o mapa da meta-estrutura e o plano formal `.claude/plans/2026-05-01_bloco-f-construcao-site.md`.

## Propósito do projeto

Construir, a partir da planilha-catálogo `Fichas das Políticas - 1ª onda.xlsx`, **um site web interativo, bonito, navegável e exploratório** sobre políticas públicas brasileiras (federais e estaduais), com foco em EJA, qualificação profissional, inclusão produtiva e transferência de renda condicionada à educação.

Princípios declarados:
- **Linkar + capturar texto integral**: cada ficha referencia leis/decretos/portarias/sites oficiais; o site não só linka, **armazena snapshot do texto integral** desses normativos para garantir disponibilidade, busca interna e proteção contra link rot.
- **UI/UX cuidadosa**: stack, sistema de design e padrões de interação **serão decididos após uma fase formal de pesquisa/benchmark** (Bloco E). Até lá, a infraestrutura de regras/skills do Claude é mantida **stack-agnóstica**.
- **Repositório na própria pasta do Drive**: `g:\Drives compartilhados\FRM_CatalogoPoliticas\`. Vai exigir `.gitignore` agressivo (excluir `node_modules/`, builds, caches) e cuidado com sync do Google Drive.
- **Múltiplas rodadas, com checkpoints**: trabalho é decomposto em rodadas com 3 agents cada e validação humana entre rodadas.

## Roadmap macro

```
[BLOCO A] Adaptação da infraestrutura .claude/ (4 rodadas + plano final)
[BLOCO B] Atualização definitiva deste CLAUDE.md
[BLOCO C] Exploração rica dos dados (vocabulário canônico, links, amostragem)
[BLOCO D] Captura integral de conteúdo externo (skill + armazenamento + revalidação)
[BLOCO E] Pesquisa UI/UX + benchmark + decisão de stack
[BLOCO F] Construção do site
[BLOCO G] Iteração (próximas ondas, novas UFs, monitoramento)
```

Plano detalhado: `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md`.

## Onde estamos agora

**Blocos A, B, C, D e E concluídos** (2026-05-01). Próximo: **Bloco F (construção do site MVP)**. Plano formal: `.claude/plans/2026-05-01_bloco-f-construcao-site.md`.

### Estado dos dados (Blocos C+D)
- **439 fichas** validadas (schema v0.2, completude média 94.5%) em `data/derived/policies-onda-1-2026-05-01.json` + `latest.json`
- **242 fichas com snapshot capturado**; **148 snapshots únicos** (124 HTML + 12 PDF + 12 dedup) em `data/external_snapshots/<sha[:2]>/<sha>.<ext>` com `index.json`
- **Vocabulário canônico v1.0** + drift normalizado em 99%+ dos valores
- **136 URLs OK** (75% dos 182 únicos); 71 com falha persistente (gov.br WAF, planalto timeout)
- **Skill `capturar-norma` v2.0**: GET fallback 403, retry planalto, OCR PDF, DOC/ODT, dedup SHA-256
- **Pipeline de revalidação** funcional (`just revalidar` / `just revalidar-todas`)
- **57/57 testes passam**; 0 erros JSON Schema v0.2
- **Tesseract OCR + LibreOffice** instalados (paths em `scripts/captura/_external_tools.py`)

### Bloco E — UX/Stack/Wireframes/Design (concluído 2026-05-01)
- **PoC Eleventy validado em ~1.5h** (vs 16h alvo). Site no ar em **https://antrologos.github.io/catalogo-politicas/**
- **Repositório público**: https://github.com/antrologos/catalogo-politicas (CC-BY 4.0)
- **Stack confirmada**: Eleventy 3 + Tailwind 3 + Pagefind 1 + Vanilla JS / Alpine + D3 + Cytoscape (ADR-007)
- **55 Must consolidados** (E.2.D + ADR-010); 8 wireframes ambiciosos: W1 Home, W2 Busca, W3 Ficha, W4 UF, W5 Comparação, W6 Mapa, W7 Grafo, W8 Sobre + W7' 404
- **Sistema de design enxuto** documentado em `.claude/working/E5-design-system.md` (12 componentes mínimos, paleta gov.uk-inspired #0066cc + foco amarelo #ffdd00, política B prevalece em conflitos a11y)
- **Persona primária**: Técnico/Coordenador estadual; **secundária**: Pesquisador acadêmico (citação ABNT/APA/BibTeX/RIS + DOI Zenodo)
- Outputs em `.claude/working/`: 6 de E.1 + 4 de E.2 + 4 de E.3 + 3 de E.4 + 1 de E.5 = **18 documentos**
- **4 ADRs** publicados em `.claude/decisions/`: ADR-007 (stack Eleventy), ADR-008 (fallback Pagefind→Lunr), ADR-009 (cláusula reabertura mantenedor — limite 2026-07-01), ADR-010 (escopo MVP 55 Must)
- **Mantenedor solo** até 2026-07-01 (cláusula reabertura). Estimativa Bloco F: 480-1070h (~2.5-5.5 anos solo / 4-9.5 meses com bolsista 28h/sem)

### Próximos passos imediatos (Bloco F.1 — esqueleto operacional)
1. **Sprint 0** (preparatório): gaps de tokens + componentes mínimos
2. **Sprint 1** (W3 Ficha): Tabs ARIA W3C completo + Citation Box + 439 rotas
3. **Sprint 2** (W2 Busca): Pagefind + facetas + URL state
4. **Sprint 3** (W1 Home): KPIs + lista UFs textual
5. **Sprint 4** (W7' 404 + W8 Sobre): fuzzy match + Privacidade LGPD
6. **Sprint 5** (header/footer polish): aria-current + hambúrguer + VLibras

**Marco M1**: 439 fichas + busca + Sobre no ar com beta privado para 2-3 gestores reais.
**Limite 2026-07-01**: confirmação institucional FRM/IESP sobre bolsista (cláusula ADR-009).

## Estrutura `.claude/` (meta-infraestrutura do projeto)

A pasta `.claude/` foi construída em 4 rodadas com 12 agents (Bloco A do plano). Mapa rápido:

| Pasta | Conteúdo | Quando consultar |
|---|---|---|
| `.claude/README.md` | Mapa completo da meta-estrutura, convenções, fluxo de rodadas | Sempre, em sessão nova |
| `.claude/rules/` | **10 regras** (4 universais + 6 técnicas path-scoped) | Norte do trabalho |
| `.claude/skills/` | **3 skills** (`normalize-categorico`, `rodar-pipeline`, `testar-pipeline`); outras em Bloco D+ | Quando uma skill se aplica |
| `.claude/agents/` | **2 stubs** (`data-auditor`, `web-scraper-respeitoso`) — implementação real em Bloco D | Quando análise profunda separada |
| `.claude/hooks/` | **3 hooks Python** (block_xlsx_write, warn_lock_file, validate_json_schema) registrados em settings.json | Auto-executados pelo harness |
| `.claude/context/` | `policies-schema.json` (JSON Schema canônico), `vocabulario-canonico.{json,md}` (stub para Bloco C) | Validação de dados |
| `.claude/architecture/` | 3 docs (`captura-estrategia.md`, `memoria-persistente.md`, `privacidade-lgpd.md`) | Decisões arquiteturais |
| `.claude/decisions/` | ADRs leves (TEMPLATE + 2 históricos do Bloco A) | Registrar/consultar decisões |
| `.claude/plans/` | Planos aprovados (formato `YYYY-MM-DD_*.md`) | Início de cada rodada |
| `.claude/working/` | Outputs intermediários das rodadas (R1, R2, R3 + Checkpoints) | Auditoria do processo |
| `.claude/archive/rules-originais-2026-05-01/` | 11 regras antigas preservadas + MANIFEST | Arqueologia |
| `.claude/settings.json` | Permissões + 3 hooks + env vars Python | (auto-aplicado) |

### Plan Mode obrigatório

`.claude/rules/planejamento-obrigatorio.md` lista paths que **forçam `/plan` antes de editar** (`data/raw/**`, `scripts/etl/*.py`, `.claude/rules/**`, `.claude/hooks/**`, `*.xlsx`). Respeite.

### Hooks ativos
- **`block_xlsx_write`** (PreToolUse, exit 2 = bloqueia): impede escrita em `Fichas das Políticas - 1ª onda.xlsx`. Use `data/derived/` para qualquer derivado.
- **`warn_lock_file`** (PostToolUse, aviso): alerta se gerou JSON com lock file Excel `~$...xlsx` presente (planilha aberta = possível incoerência).
- **`validate_json_schema`** (PostToolUse, aviso): valida JSON em `data/derived/*.json` contra `policies-schema.json`; lista erros mas não bloqueia.

## Convenções de operação no Drive compartilhado

- **Git é problemático no Google Drive.** Quando o repo for inicializado aqui, `.gitignore` deve excluir `node_modules/`, `.next/`, `dist/`, `out/`, `.cache/`, qualquer pasta de build pesada. Considerar marcar essas pastas como "no sync" via configurações do Google Drive Desktop.
- **Paths têm espaços e acentos** (`Drives compartilhados`, `Políticas`, etc.) — sempre quotar em comandos shell e validar handling em scripts.
- **`data/raw/Fichas das Políticas - 1ª onda.xlsx` é fonte primária imutável.** Qualquer derivado (CSV, JSON, Parquet) vai para `data/derived/`. Nunca sobrescrever o original sem confirmação humana explícita; verificar lock file `~$...xlsx` antes de qualquer escrita.
- **Idioma padrão: PT-BR** em todo conteúdo (regras, skills, código, comentários, derivados). Inglês apenas quando exigido pela ferramenta (ex.: nomes de pacotes npm).

## Natureza do diretório

Hoje a pasta contém apenas a planilha-fonte. O site (e tudo que o suporta) será adicionado **aqui mesmo** ao longo dos blocos do roadmap. A pasta `.claude/` recebeu **regras provisórias copiadas de outros projetos** (Transcritorio em Python/PySide6 e mensalizacao_pnad em R) — todas serão revisadas, adaptadas, expurgadas ou substituídas no Bloco A antes de qualquer construção.

## Convenção de operação no arquivo

- Usar **`openpyxl(read_only=True)`** ou `pandas.read_excel` para leitura — é seguro mesmo com Excel aberto.
- Antes de **escrever** no `.xlsx`, verificar se existe `~$Fichas das Políticas - 1ª onda.xlsx` na pasta. Se existir, o arquivo está aberto no Excel — pedir ao usuário para fechar antes de salvar. **Nunca** sobrescrever o original sem confirmação explícita; preferir gravar derivados (CSV/Parquet/novo .xlsx com sufixo).
- O arquivo já foi reescrito por openpyxl ao menos uma vez (core.xml: `Creator = openpyxl`, `lastModifiedBy = "Autor"`, modificado 2026-05-01). Metadados de autoria humana original foram perdidos — não confiar neles.

## Arquitetura do catálogo

11 abas, todas visíveis, sem named ranges, sem fórmulas, sem macros, sem proteção, sem células mescladas. Cada linha = uma política.

| Aba | Papel | Fichas |
|---|---|---:|
| `Modelo categorias` | dicionário humano de 8 dimensões categóricas — **NÃO** governa as validações inline | 89 linhas-doc |
| `Políticas federais (comuns a to` | políticas federais (nome truncado pelo limite de 31 chars do Excel) | 33 |
| ` Planilha SP` *(espaço inicial)* | políticas estaduais SP | 53 |
| ` Planilha RJ` *(espaço inicial; só 27 cols, faltam 4)* | RJ | 41 |
| `Planilha MG` | MG | 45 |
| `Planilha Paraná` | PR | 43 |
| `Planilha Rio Grande do Sul` *(+3 cols-fantasma vazias)* | RS | 40 |
| `Planilha Bahia` *(col 1 chamada `Coluna 1` em vez de `Id`)* | BA | 53 (51 únicas — 2 duplicatas) |
| ` Planilha Pará` *(espaço inicial; +4 cols-fantasma)* | PA | 42 |
| `Planilha Pernambuco` *(col 1 chamada `Coluna 1`)* | PE | 44 |
| `Planilha Ceará` *(16 dropdowns "envenenados" com `Opção 2`)* | CE | 45 |

**Schema-padrão (~27 colunas):** Id, Nome do Programa, Tipo de Política, Esfera de formulação, Origem da proposta/diretriz, Esfera de formulação detalhamento, Esfera de execução, Esfera de execução (apoios e parcerias), Fonte de financiamento, Transferência de recursos, Órgão(s) responsável(eis), Órgão(s) responsável(eis) com especificações, Ano de criação, Situação atual, Base legal, Abrangência territorial, Resumo, Apresentação, Tipo de oferta, Modalidade da oferta, Arranjo logístico-territorial, Carga horária, Integra com outras políticas, Continuidade entre governos, Link, Informações complementares, Dúvidas.

**Redundância intencional:** as ~33 políticas federais são replicadas em cada planilha estadual (com órgão executor local específico). Marcador típico no campo `Dúvidas`: `"EM TODOS OS ESTADOS"`.

## Armadilhas conhecidas (relevantes para qualquer análise)

1. **Cabeçalhos divergentes entre 8 das 9 abas estaduais** — `Id`/`ID`/`Coluna 1`, `Link`/`Link oficial`, `Dúvidas`/`Dúvida`, instruções `(Verificar planilha Categorias)` embutidas em headers de RS/BA/PE/CE. **Empilhar ingenuamente quebra.** Normalizar cabeçalhos antes de qualquer `UNION`/`pd.concat`.
2. **4 abas começam com espaço** no nome (` Planilha SP`, ` Planilha RJ`, ` Planilha Pará`). Strings literais.
3. **Nome da aba federal está truncado em 31 chars** (`Políticas federais (comuns a to`). Qualquer referência cross-sheet precisa usar o nome literal.
4. **Duplicatas conhecidas em Bahia:** `Programa Juros por Educação` (×2) e `PRONATEC` (×2).
5. **Drift ortográfico em campos categóricos** — sério em `Esfera de execução` (31 valores únicos para vocabulário oficial de ~20): mistura hífen `-` / en-dash `–`, aspas retas/curvas, dois-pontos duplos `::`, capitalização variável. `Arranjo logístico` também tem variantes com/sem aspas tipográficas. **Mapear para o vocabulário canônico de `Modelo categorias` antes de agregar.**
6. **Ceará tem 16 células com dropdowns quebrados** contendo `Opção 2` como placeholder literal (cols D, G, N, P, S nas linhas 37-45) — sintoma de edição manual desfeita.
7. **`Modelo categorias` é referência humana**, não está vinculada às validações: todos os dropdowns têm listas hardcoded inline. Alterar vocabulário exige propagação manual aba por aba.
8. **Validações aplicadas até linhas 998-1027** com apenas ~40-53 fichas reais (RS/BA/PE) — arquivo inflado, abertura lenta.
9. **18 comentários de revisão abertos** (Maria Clara Gama é a revisora principal; também Maria Julieta Ramallo Garcia em PR, Cíntia Frazão em resoluções, Hellen Guicheney em Modelo categorias, Jaqueline Sant'ana em RJ). Apontam links quebrados (Y5/Y31 do Paraná, Y8 do Ceará) e definições vagas a corrigir.
10. **Campo `Dúvidas` (col 26) é dual-uso**: tanto "EM TODOS OS ESTADOS" (marcador de replicação federal) quanto notas reais de revisor ("NÃO CONSEGUI ENCONTRAR A RESOLUÇÃO..."). Filtrar antes de tratar como dado substantivo.

## Vocabulário canônico (de `Modelo categorias`)

- `Tipo de Política` — 3 valores: `Educacional direta` · `Trabalho/qualificação direta` · `Proteção social com impacto educacional`.
- `Situação atual` — 5 valores oficiais; em uso: `Ativa / em execução` · `Encerrada` · `Suspensa / pausada` · `Descontinuada`.
- `Abrangência territorial` — 8 oficiais; em uso: `Nacional` · `Estadual` · `Municipal` · `Sem recorte territorial específico/difusa`.
- `Esfera de formulação`, `Esfera de execução`, `Tipo de oferta`, `Modalidade da oferta`, `Arranjo logístico-territorial` — listas extensas em `Modelo categorias` (col A, blocos numerados com bullets `•`).

## Idioma

Tudo em português brasileiro. Manter qualquer derivado (CSVs, scripts de normalização, relatórios) em português, com nomes de coluna preservando os originais até que se decida explicitamente uma normalização (ex.: `snake_case` ASCII).
