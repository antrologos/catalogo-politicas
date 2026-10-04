# Plano: Pendências pós-v1.0 (grupos 1–5 do levantamento de 04/10)

**Status**: CONCLUIDO (2026-10-04). A usuária pediu: "resolva o que der para resolver dos grupos 1, 2, 3, 4 e 5". O grafo continua oculto, por decisão dela.
**Data**: 2026-10-04
**Base**: relatório `docs/RELATORIO_ESTADO_FRM_CATALOGO_2026-10-04.md` e o diagnóstico da sessão

## Rodada A — Erros visíveis no site (grupo 1)
- [x] A1 Textos:
  - home: "mapa virá em fase posterior" e "1 federal + 27 estados";
  - "2 a 9 estados" na home, em Explorar e em Comparar;
  - meta de Explorar com "439";
  - texto de Explorar sobre "federais replicadas";
  - aviso obsoleto da Bahia, onde 0 duplicatas aparecem (conferido: 0 grupos duplicados entre os verbetes visíveis);
  - `package.json` com "PoC".
- [x] A2 Comparação (`comparacao.js`/`.njk`):
  - aceitar `ufs` repetido (submit do formulário GET) e separado por vírgula;
  - limite de 9 também na URL;
  - "Limpar seleção" atualiza tabela e URL;
  - link de cópia preenchido já na carga;
  - atalhos por região no lugar de "Todas" (Nordeste = 9; demais < 9);
  - remover a linha redundante "Exclusivamente estaduais".
- [x] A3 Filtros da página de UF:
  - selects de Tipo, Situação e Modalidade (progressive enhancement), atualizando a URL;
  - `uf-filtros.js` aceita valor exato ou slug (`?situacao=ativa-em-execucao`);
  - `data-modalidade` nas linhas;
  - texto de ajuda coerente com a interface.

## Rodada B — Fontes e dados (grupo 2 + citações do ETL)
- [x] B1 Placeholders `*.local`:
  - a ficha não oferece "Acessar no portal oficial"; mostra "Fonte oficial não identificada no levantamento";
  - meta `citation_pdf_url` omitida.
- [x] B2 Promessa de "texto integral preservado": a redação passa a refletir a realidade (link para a fonte oficial; cópia preservada internamente para parte das políticas, não publicada no site).
- [x] B3 ETL `build_json.py`:
  - citações dos dados sem "Catálogo FRM" (Rede EJA);
  - `fonte_data_acesso` = data real (captura/validação do índice de snapshots), não a do processamento;
  - `proxima_revisao_prevista` calculada a partir dela;
  - `criado_em` = data de entrada da onda;
  - `atualizado_em` muda só quando o conteúdo da ficha muda (registro persistente com hash), o que torna o build determinístico (regra pipeline-reproducible).
- [x] B4 Captura e revalidação das fontes, incluindo as fichas da 3ª onda:
  - `extract_links` → `validar_links` (+ retry) → CSV final do dia → `capturar_completo` → `revalidar --todas`, respeitando robots e rate-limit;
  - em seguida, ETL para vincular os snapshots.

## Rodada C — Base técnica (grupo 3)
- [x] C1 Registro persistente de IDs/slugs (`data/derived/registro_fichas.csv`):
  - `build_ids` reaproveita IDs de chaves conhecidas, numera as novas após o máximo e nunca reusa IDs;
  - toy test com a ordem embaralhada.
- [x] C2 CI:
  - job de testes Python (toy/unit);
  - `npm test` com testes Node reais em `site/tests/`;
  - pa11y/Lighthouse cobrindo mapa, comparação, página de UF, ficha e explorar, depois de validar localmente.
- [x] C3 Backup mensal:
  - incluir `data/raw/*.xlsx`;
  - parar de mascarar erro (`|| true`);
  - verificar a restauração (extrair e validar o JSON);
  - os snapshots binários (fora do Git) ficam fora, e isso fica documentado.
- [x] C4 Mobile: overflow horizontal em /sobre/ e na home.
- [x] C5 Documentação: corpo do CLAUDE.md, RUNBOOK, README (testes/facetas), metadados do vocabulário e do schema.
- [x] C6 Favicon (evita o 404 no console de todas as páginas).

## Rodada D — Itens que dependem de terceiros (grupo 4): o que dá para fazer daqui
- ~~D1 Monitoramento de links institucionais~~ — descartado: a usuária aceitou os links atuais (Ceres via página do IESP; CN SESI em http enquanto funcionar).
- ~~D2 Nota técnica do incidente do Ceres~~ — descartado pela mesma razão.
- [x] D3 Lista de revisão para a equipe de pesquisa (`docs/`): ProJovem DF, valores de outro campo, placeholders, fichas novas sem fonte capturada.

## Rodada E — Backlog (grupo 5): o que dá para fazer daqui
- [x] E1 DOI: `.zenodo.json` com os metadados. Ativar a integração no Zenodo exige login da usuária.
- [x] E2 Acessibilidade: varredura automática axe/pa11y em todos os tipos de página e correção do que aparecer. A auditoria com leitor de tela continua manual.
- Grafo: **continua oculto** (decisão da usuária).
- Endereço do site: **não muda por agora** (decisão da usuária). Divulgação: será feita pela Rede depois; fora do escopo.

## Validação e publicação
- Cada rodada é validada localmente (puppeteer, pytest, build) antes do push, seguindo o fluxo dos dois clones.
- Deploy ao fim de cada rodada que mexer no site.

## Resultado (2026-10-04)

- **Rodada A**: no ar (commits 207aa06, e7ba163, 16ee74c; deploy verde). Testes funcionais de comparação e filtros, pa11y 20/20 e Lighthouse acima dos limites.
- **Rodada B**:
  - captura e revalidação: 218 fontes novas copiadas; 755 de 1158 fichas e 245 de 366 verbetes com cópia de arquivo (eram 489 e 133); 40 das 79 políticas da 3ª onda;
  - `fonte_data_acesso` real: 643 em 04/10, 112 em 01/05 e 403 sem acesso registrado.
- **Rodada C**:
  - registro persistente `data/derived/registro_fichas.csv`: IDs e slugs idênticos aos anteriores (1158/1158), ETL determinístico (duas execuções com saída idêntica);
  - CI com pytest e npm test; backup verificado; CLAUDE.md reescrito, com o histórico em `.claude/archive/`.
- **Rodada D**: `docs/revisao-equipe-pesquisa-2026-10.md`.
- **Rodada E**: `.zenodo.json`. Falta a usuária ativar a integração no Zenodo; a varredura de acessibilidade ficou coberta pelo CI ampliado.
- **Lição operacional**: no clone do Drive, `git pull` com a árvore suja usa autostash e falha por causa das marcas fantasma do Drive. Limpar com `git checkout -- <arq>` (após `cmp` com HEAD) antes de reaplicar o stash.
