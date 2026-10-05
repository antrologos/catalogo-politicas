# CLAUDE.md

Orientações para o Claude Code (claude.ai/code) neste repositório. O histórico detalhado das rodadas de maio a outubro de 2026 está em `.claude/archive/CLAUDE-historico-ate-2026-10-04.md`. Use-o como arqueologia, não como checklist.

## Orientação editorial aprovada em 04/10/2026

- Público prioritário: membros, coordenadores e profissionais das instituições da Rede EJA.
- Finalidade: conhecer experiências, suas finalidades, funcionamento básico, território e referências, fortalecendo o direito à EJA pública, presencial e de qualidade e o diálogo com os governos.
- Inclusão produtiva é um componente; educação e trabalho abrangem também cuidados, direitos, desigualdades e formação crítica. O projeto não defende privatização nem EaD para EJA.
- A rodada autorizada aproveita o acervo existente, sem depender de revisão do responsável em lotes. As diretrizes completas estão em [docs/DIRETRIZES_E_PLANO_EDITORIAL_2026-10-04.md](docs/DIRETRIZES_E_PLANO_EDITORIAL_2026-10-04.md).
- As fichas passam a quatro blocos visíveis: Identificação, Finalidade, Território e Referências. A situação e a abrangência reproduzem o levantamento; não comprovam oferta atual. Datas de consulta e do catálogo não comprovam vigência.
- A fonte do site foi reorganizada localmente, com testes de renderização em `site/tests/editorial.test.mjs`. Dados, IDs, slugs, schema e vocabulário permanecem preservados. A publicação remota ainda não faz parte desta rodada.
- A nota em `_data/notasEditoriais.js` sinaliza que a ficha federal de EJA contém descrição e órgãos de São Paulo, sem alterar o registro original.

## Implementação do plano ampliado de design (concluída em 2026-10-05)

- Concluída localmente e sincronizada nos dois clones, conforme pedido “implemente o plano ampliado”. Sem commit, push ou publicação.
- Logo oficial da Rede, navegação visível, home por busca, exploração por território/área, filtros compartilháveis e retorno à consulta; ficha com cópia, citação e impressão das ressalvas.
- Validação: 31 testes aprovados; build e índice com 366 fichas; 22.916 referências locais sem destinos ou âncoras ausentes; verificações de navegador, acessibilidade e responsividade documentadas.
- Busca: `catalogo-busca.js` + `catalogo-busca-estado.js`; adaptador público `catalogo-pagefind/pagefind.js` garante OU dentro da faceta. Não substituir pelos scripts legados sem revalidar os percursos.
- Relatório: [docs/IMPLEMENTACAO_DESIGN_E_USABILIDADE_2026-10-04.md](docs/IMPLEMENTACAO_DESIGN_E_USABILIDADE_2026-10-04.md). Plano de referência: [docs/PLANO_DESIGN_E_USABILIDADE_2026-10-04.md](docs/PLANO_DESIGN_E_USABILIDADE_2026-10-04.md).

## Estado atual (2026-10-04)

- **Produto**: Catálogo de Políticas da **Rede EJA e Inclusão Produtiva**, um produto permanente da Rede (16 instituições). A página da Rede (https://www.frm.org.br/projeto/rede-eja) lista o catálogo em "Evidências".
  - Site: https://antrologos.github.io/catalogo-politicas/
  - Repositório público: https://github.com/antrologos/catalogo-politicas (CC BY 4.0)
  - Versão **1.0** (tag/release `v1.0.0`)
- **Dados**:
  - `data/derived/latest.json` tem **1158 fichas**: 792 réplicas federais e **366 verbetes únicos** (33 federais e 333 estaduais/distritais), cobrindo **27 UFs + esfera federal** em três ondas.
  - Validação: 0 erros de schema e 0 valores fora do vocabulário.
- **Decisões da usuária em vigor**:
  - o grafo continua **oculto**;
  - o endereço do site **não muda** por agora;
  - a divulgação institucional será feita pela Rede.
- **Planos recentes** (`.claude/plans/`, todos concluídos ou em execução):
  - `2026-10-04_incorporar-3a-onda.md`;
  - `2026-10-04_produto-permanente-rede-eja.md`;
  - `2026-10-04_pendencias-pos-v1.md`.
- **Pendências que dependem de terceiros**:
  - DOI no Zenodo: o `.zenodo.json` está pronto; falta a usuária ativar a integração GitHub ↔ Zenodo.
  - Auditoria manual com leitor de tela.
  - Revisão da equipe de pesquisa: `docs/revisao-equipe-pesquisa-2026-10.md`.

## Organização

- **Dois clones do mesmo repositório** (não são projetos separados):
  - `G:/Drives compartilhados/FRM_CatalogoPoliticas`: planilhas, ETL, captura e documentação;
  - `C:/Users/antro/dev/catalogo-politicas`: build do site e validação com puppeteer (tem `site/node_modules`).
  - Fluxo: commitar num clone, `git pull --ff-only` no outro, um único push.
  - No Drive, o Git às vezes marca arquivos como modificados sem diff de conteúdo, por causa da sincronização. Confira com `git show HEAD:<arq> | cmp - <arq>`.
- **Pastas principais**:
  - `data/raw/`: planilhas-fonte, imutáveis.
  - `scripts/etl/` e `scripts/captura/`: pipeline de dados e captura de fontes.
  - `data/derived/`: `latest.json`, `registro_fichas.csv` e derivados datados.
  - `data/external_snapshots/`: só o `index.json` vai para o Git; os binários ficam no Drive.
  - `site/`: Eleventy.
  - `tests/`: pytest. `site/tests/`: node --test.
- **Pipeline** (`just etl` ou os scripts nesta ordem): `load_planilha` → `normalize` → `dedupe` → `build_ids` → `build_json` → `validate`.
  - `build_ids` usa o **registro persistente** `data/derived/registro_fichas.csv`. IDs e slugs não mudam com a ordem das linhas e nunca são reaproveitados.
  - `build_json` grava datas reais:
    - `criado_em` = entrada da onda;
    - `atualizado_em` só muda se o conteúdo muda;
    - `fonte_data_acesso` = captura/validação real da fonte.
  - Procedimento de nova onda: `scripts/etl/README.md`.
  - Rodada de captura de fontes: `docs/RUNBOOK.md`.
- **Site**: Eleventy 3 + Tailwind 3 + Pagefind + D3 (mapa).
  - `_data/policies.js` filtra as réplicas federais.
  - `_data/equipe.js` guarda créditos e a lista `redeEja` (16 instituições, logos em `site/src/assets/img/rede/`, procedência em `FONTES.txt`).
  - `_data/agregados.js` e `_data/dimensoes.js` alimentam contagens e facetas.
- **CI**:
  - `deploy.yml`: schema, `npm test`, build, pa11y em 20 páginas, Lighthouse em 9, deploy.
  - `tests.yml`: pytest toy, unit e integração.
  - `backup.yml`: mensal, com restauração verificada.

## Decisões vigentes — não reverter sem pedido explícito

- **Identidade**:
  - produto da Rede EJA, sem referência ao Encontro de 14/mai, sem "PoC" e sem enquadramento FRM-cêntrico;
  - créditos em `/sobre/`: Rede (painel dos 16 logos) → Pesquisa e desenvolvimento (Ceres/IESP-UERJ, MAPE, IESP-UERJ) → Apoio ao levantamento (realização FRM e Fundação Bradesco; parceiros Itaú Educação e Trabalho e Arymax; cooperação UNESCO).
- **Citação**:
  - obra "Catálogo de Políticas da Rede EJA e Inclusão Produtiva", editora "Rede EJA e Inclusão Produtiva", Rio de Janeiro;
  - autoria dos verbetes: equipe de pesquisa; organização: Rogério Jerônimo Barbosa.
- **Réplicas federais**: ficam no JSON e saem da interface. Não há tabela "Execução por estado" nem seção de federais nas páginas de UF.
- **Fontes**: "snapshot" não aparece na interface e as cópias de arquivo não são publicadas. Placeholders de fonte (domínio `.local`) aparecem como "fonte oficial não identificada".
- **Distrito Federal**: "Distrital" e "Distrito Federal" valem Estadual/Estado nos dados e nas facetas; só o rótulo da ficha do DF muda (ADR `2026-10-04_vocabulario-3a-onda`).
- **Links institucionais**:
  - Ceres via https://iesp.uerj.br/nucleo/ceres/ (o domínio `ceres-iesp.uerj.br` foi comprometido);
  - Conselho Nacional do SESI em `http://` enquanto o certificado estiver vencido.

## Infraestrutura `.claude/`

| Pasta | Conteúdo |
|---|---|
| `.claude/rules/` | Regras obrigatórias (planejamento, mudanças mínimas, ciclo de teste, Drive, captura responsável, dados, pipeline, validação visual local) |
| `.claude/skills/` | `normalize-categorico`, `testar-pipeline` |
| `.claude/hooks/` | `block_xlsx_write`, `warn_lock_file`, `validate_json_schema` |
| `.claude/context/` | `policies-schema.json` (v0.2) e `vocabulario-canonico.json` |
| `.claude/decisions/` | ADRs |
| `.claude/plans/` | Planos (`YYYY-MM-DD_*.md`) |
| `.claude/working/` | Material de rodadas anteriores |
| `.claude/archive/` | Regras antigas e o CLAUDE.md histórico |

**Plan Mode obrigatório** antes de editar `data/raw/**`, `*.xlsx`, `scripts/etl/*.py`, `.claude/rules/**`, `.claude/hooks/**`, `policies-schema.json` e `vocabulario-canonico.json` (ver `.claude/rules/planejamento-obrigatorio.md`). Mudanças visuais com D3, SVG ou JS são validadas com puppeteer local antes do push (`validar-visual-local.md`).

## Convenções de operação no Drive

- Os paths têm espaços e acentos: sempre entre aspas.
- No Git Bash, rotas como `/sobre/` passadas a programas são convertidas em caminhos do Windows; use `MSYS_NO_PATHCONV=1`.
- `data/raw/` é **imutável**: derivados vão para `data/derived/` e versões revisadas entram com sufixo (ex.: `2ª onda (rev. 2026-10)`). Antes de ler uma planilha, verifique o lock `~$…xlsx`.
- Idioma: **português brasileiro** em código, comentários, dados e documentação.
- Commits sem menção a IA no texto.

## Planilhas-fonte

| Arquivo | Conteúdo |
|---|---|
| `Fichas das Políticas - 1ª onda.xlsx` | Aba federal canônica (33) + SP, RJ, MG, PR, RS, BA, PA, PE, CE |
| `Fichas das Políticas - 2ª onda (rev. 2026-10).xlsx` | GO, ES, SC, MA, AM, MT, PB, AL, RN (o arquivo original da 2ª onda fica preservado ao lado) |
| `Fichas das Políticas - 3ª onda.xlsx` | MS, RR, DF, RO, PI, AC, SE, TO, AP; a aba **"Modelos de Categorias"** é o dicionário oficial vigente |

Cada linha é uma política. As federais se repetem em cada aba estadual: são as réplicas, marcadas por `dedupe.py` pelo nome ou por "EM TODOS OS ESTADOS" no campo Dúvidas. As abas federais das ondas 2 e 3 duplicam a da 1ª e são puladas.

**Armadilhas conhecidas**:
- cabeçalhos divergentes entre abas (`Id`/`ID`/`Coluna 1`, `Link`/`Link oficial`, `Dúvidas`/`Dúvida`, instruções embutidas no texto do cabeçalho);
- abas com espaço inicial (` Planilha SP`) e nome federal truncado (`Políticas federais (comuns a to`);
- aba Mato Grosso com cabeçalho "F" no lugar de "Nome do Programa";
- variante silenciosa `Órgão(s) responsável(eis) com especificações`;
- colunas e linhas-fantasma (MA);
- campo Dúvidas com dois usos (marcador de réplica ou nota de revisor);
- drift ortográfico nos campos categóricos, normalizado por `vocabulario-canonico.json`.

Sempre confira a lista "Cabeçalhos NÃO mapeados" do `load_planilha.py` ao incorporar uma onda.

## Vocabulário canônico

O arquivo é `.claude/context/vocabulario-canonico.json`, com `canonical_values` e `variants` por campo. Valores principais:
- **Tipo de política** (3): Educacional · Trabalho e qualificação · Proteção social com impacto educacional.
- **Situação atual** (5): Ativa / em execução · Encerrada · Suspensa / pausada · Descontinuada · Sem informação.
- **Abrangência**: Nacional · Estadual · Municipal · Sem recorte territorial específico/difusa.
- **Esferas, tipo de oferta, modalidade, arranjo**: listas do dicionário oficial; ver o JSON.

Toda mudança de vocabulário requer um ADR em `.claude/decisions/`.
