# Estado do Catálogo de Políticas da Rede EJA e Inclusão Produtiva

**Relatório de passagem de contexto para o Claude responsável pela página**  
**Data:** 4 de outubro de 2026, após as alterações da manhã e da tarde.  
**Referência do código:** `main`, commit `6cd84f4f013285bacfd199abc2d35119af6a7461` (16:01:26, America/Sao_Paulo).  
**Produto publicado:** versão 1.0; release `v1.0.0`.

Este relatório substitui o diagnóstico produzido mais cedo em 04/10, antes da incorporação da terceira onda e da mudança de identidade. Foi preparado a partir de nova leitura dos dois clones, dados, código, planos, memória e GitHub. Os pontos de manutenção abaixo são achados para continuidade; não foram implementados nesta auditoria. O arquivo é uma fotografia do estado observado, e deve ser confrontado com eventuais commits posteriores do Claude que continua trabalhando.

## 1. Estado executivo

O catálogo foi ampliado e publicado hoje como **produto permanente da Rede EJA e Inclusão Produtiva**, com cobertura das **27 unidades da federação e da esfera federal**. A referência pública deixou de ser material de apoio do Encontro de maio ou uma frente do Projeto Juventudes. O Projeto Juventudes permanece como origem histórica do levantamento.

| Indicador | Situação anterior, até maio | Situação após as alterações de 04/10 |
|---|---:|---:|
| Registros no JSON canônico | 822 | **1.158** |
| Réplicas federais preservadas no JSON | 535 | **792** |
| Verbetes exibíveis, após filtro de réplicas | 287 | **366** |
| Verbetes federais canônicos | 33 | **33** |
| Verbetes estaduais/distritais | 254 | **333** |
| UFs com levantamento estadual/distrital | 18 | **27** |
| Ondas incorporadas | 2 | **3**, com revisão da segunda |
| Identidade do produto | Enquadramento anterior do Projeto Juventudes/Encontro | **Produto permanente da Rede EJA** |
| Versão pública | Identificadores históricos de PoC/MVP | **1.0 / release v1.0.0** |

“Verbetes únicos” significa, aqui, os registros que passam pelo filtro `!is_federal_replica`. Não representa uma garantia de que todo programa semelhante foi substantivamente deduplicado. A cobertura das 27 UFs também **não transforma o levantamento em censo de políticas**; a ressalva metodológica continua válida.

O README principal já foi atualizado para a versão 1.0. A descrição anterior de um projeto sem commits desde maio, com nove UFs faltantes, banner do Encontro ainda ativo e teste de integração preso a 439 fichas **não deve orientar o trabalho atual**.

## 2. Publicação e versão efetivamente entregue

- Repositório: [antrologos/catalogo-politicas](https://github.com/antrologos/catalogo-politicas).
- Site: [Catálogo de Políticas](https://antrologos.github.io/catalogo-politicas/).
- Release: [v1.0.0 — Catálogo de Políticas da Rede EJA e Inclusão Produtiva](https://github.com/antrologos/catalogo-politicas/releases/tag/v1.0.0), publicada em **04/10/2026 às 16:00:33**, horário de Brasília.
- Primeira publicação de hoje, com a terceira onda: [run 37218482276](https://github.com/antrologos/catalogo-politicas/actions/runs/37218482276), concluída com sucesso às **14:00:25**.
- Publicação da versão 1.0: [run 37226231159](https://github.com/antrologos/catalogo-politicas/actions/runs/37226231159), concluída com sucesso às **15:59:27**, sobre o commit `6c7425e`.
- O commit posterior `6cd84f4` apenas marca o plano da versão 1.0 como concluído. A diferença entre o HEAD e o SHA do último deploy não indica, neste caso, funcionalidade pendente de publicação.

Na última execução de CI foram confirmados como aprovados: **JSON Schema, build Eleventy/Tailwind/Pagefind, pa11y WCAG2AA, Lighthouse e deploy GitHub Pages**. A etapa de auditoria npm também retornou sucesso nessa execução, embora sua configuração permita prosseguir caso falhe.

A tentativa de abrir o site diretamente pela ferramenta web desta auditoria retornou `Cache miss`. Por isso, a publicação está confirmada pelo GitHub, mas este relatório não apresenta essa tentativa como nova inspeção visual de produção. Os planos concluídos registram validações anteriores com Puppeteer realizadas durante a implementação de hoje.

## 3. O que mudou hoje

### 3.1 Terceira onda e revisão da segunda

As nove UFs adicionadas foram **AC, AP, DF, MS, PI, RO, RR, SE e TO**. Juntas acrescentam **79 verbetes exibíveis**. O crescimento do JSON completo foi de **336 registros**, incluindo réplicas federais.

Fontes de entrada atuais:

- `data/raw/Fichas das Políticas - 1ª onda.xlsx`;
- `data/raw/Fichas das Políticas - 2ª onda (rev. 2026-10).xlsx`;
- `data/raw/Fichas das Políticas - 3ª onda.xlsx`.

A segunda onda original foi preservada. Segundo a investigação registrada no plano, a versão revisada tinha 61 células diferentes: 58 na aba federal ignorada pelo ETL e três alterações estaduais relevantes — MA/PEESP, MA/Bolsa Família e AM/PMQ. Não foi feita nova comparação célula a célula das planilhas nesta auditoria.

O loader passou a tratar a terceira onda, a variante de cabeçalho `Órgão(s) responsável(eis) com especificações` e novas colunas-fantasma. A aba federal duplicada das ondas 2 e 3 é ignorada; a canônica vem da primeira onda. A normalização evita que descrições extensas gerem categorias e páginas de faceta espúrias.

Artefatos principais:

- `scripts/etl/load_planilha.py`;
- `scripts/etl/build_ids.py`;
- `.claude/context/vocabulario-canonico.json`;
- `data/derived/latest.json`;
- `data/derived/policies-onda-1-2026-10-04.json`;
- `data/derived/_intermediate/validation_report.json`;
- `tests/toy_onda3.py` e `tests/toy_vocab_correcoes.py`.

O nome `policies-onda-1-2026-10-04.json` é uma convenção histórica do gerador: o arquivo atual reúne **as três ondas**, não apenas a primeira.

### 3.2 Correção dos identificadores

O renomeamento de categorias de maio deixou `TIPO_TO_EIXO`, em `build_ids.py`, com nomes antigos. O resultado era a classificação de 637 registros em IDs `OUTR`, em vez de `EDU`/`TRAB`. O commit `bbbafed` corrige o mapeamento, com regressão coberta por testes.

Essa mudança deve ser tratada como correção de um bug, não como motivo para reintroduzir as categorias antigas. Os tipos atuais são:

1. `Educacional`;
2. `Trabalho e qualificação`;
3. `Proteção social com impacto educacional`.

O plano registra restauração dos IDs anteriores ao erro e preservação das URLs. IDs também são usados em metadados, citações e articulações do grafo, embora o grafo esteja oculto.

### 3.3 Vocabulário e tratamento do Distrito Federal

O commit `70d8758` registra a redução de **166 ocorrências fora do vocabulário para zero**, usando o dicionário oficial “Modelos de Categorias” da terceira onda. Foram incluídas/mapeadas categorias como `Infraestrutura educacional`, `Insumo/Bem de apoio` e `Sem informação` nos campos apropriados.

Decisões já tomadas e que devem ser preservadas:

- **Abrangência do DF:** armazenar `Estadual` para agrupar com as demais UFs; exibir **“Distrital”** na ficha quando `uf == DF` e o valor for `Estadual`.
- **Esfera do DF:** armazenar `Estado`; exibir **“Distrito Federal”** nos campos correspondentes da ficha do DF.
- Não criar uma faceta territorial independente para o DF apenas por causa do rótulo de apresentação.
- `Itinerante` foi normalizado para `Presencial` no caso documentado do Qualifica Piauí.
- “Misto”, no tipo do ProJovem Urbano e Campo do DF, foi classificado como `Proteção social com impacto educacional`.
- A situação atual desse ProJovem distrital ficou **`Sem informação`**, porque o material disponível não sustentava afirmar sua situação vigente. Esse ponto continua merecendo esclarecimento da equipe de pesquisa.

Zero erro de schema e zero valor fora do vocabulário demonstram conformidade estrutural/categórica. Não substituem a validação substantiva de cada classificação e do estado atual de cada política.

### 3.4 Identidade institucional, créditos e citação

Foram entregues:

- Remoção do banner do Encontro de Formação de 14 de maio e do arquivo `banner-evento.njk`.
- Subtítulo público **“Rede EJA e Inclusão Produtiva”**.
- Retirada do enquadramento do Projeto Juventudes do título, subtítulo e citação; manutenção de referência histórica ao levantamento.
- Rede e suas 16 instituições em posição principal; **Ceres/IESP-UERJ, MAPE e IESP-UERJ** como pesquisa e desenvolvimento.
- Realização FRM/Bradesco, parceiros Itaú/Arymax e cooperação UNESCO preservados em seção secundária de apoio ao levantamento.
- Painel completo de instituições em `/sobre/` e faixa de logos na home; rodapé com texto e link para a Rede.
- Versão **1.0**, com selo removido do cabeçalho e informação de versão no rodapé/transparência/citação.
- Título da obra **“Catálogo de Políticas da Rede EJA e Inclusão Produtiva”** e editora **“Rede EJA e Inclusão Produtiva”**, local Rio de Janeiro.
- Atualização de `README.md`, `CITATION.cff`, filtros de citação e metadados.

O componente central é `site/src/_includes/components/painel-rede.njk`; a lista institucional fica em `site/src/_data/equipe.js`, propriedade `redeEja`; os arquivos de imagem e suas fontes ficam em `site/src/assets/img/rede/`, incluindo `FONTES.txt`. A sequência de referência do painel é 5/5/6 instituições.

As 16 instituições são: Ação Educativa; Ashoka; Conhecimento Social; Conselho Nacional do SESI; Fundação Arymax; Fundação Bradesco; Fundação Itaú/Itaú Educação e Trabalho; Fundação Roberto Marinho; GIFE; Instituto Rodrigo Mendes; Pacto Global da ONU — Rede Brasil; Redes da Maré; Todos Pela Educação; UNESCO; UNICEF; United Way Brasil/Juventudes Potentes.

URLs institucionais corrigidas no código:

| Instituição | Referência atual |
|---|---|
| Ceres | `https://iesp.uerj.br/nucleo/ceres/` |
| Fundação Bradesco | `https://fundacao.bradesco/` |
| Itaú Educação e Trabalho | `https://www.itaueducacaoetrabalho.org.br/` |
| MAPE | `https://mape.org.br/` |
| Página da Rede | `https://www.frm.org.br/projeto/rede-eja` |

Não restaurar o domínio antigo do Ceres: a equipe registrou redirecionamento indevido e já adotou a página oficial do núcleo no IESP. Essa ocorrência está documentada no plano; não foi repetida uma investigação do domínio nesta auditoria.

### 3.5 Correção do mapa

O commit `9d654ca` removeu a chamada extra ao final de `waitForD3(...)` em `site/src/assets/js/mapa.js`, que gerava `waitForD3(...) is not a function`. O plano registra validação de renderização, 27 UFs e downloads após a correção. Não reintroduzir o fechamento antigo de IIFE nesse trecho.

## 4. Mapa da interface para continuidade

| Área | Implementação e comportamento esperado |
|---|---|
| Home `/` | Contagens derivadas dos verbetes exibíveis, navegação para exploração/mapa/busca, ressalva metodológica e painel da Rede. |
| Explorar `/explorar/` | Navegação por dimensões; páginas por tipo, situação, abrangência e modalidade. |
| Busca `/buscar/` | Pagefind e filtros; universo de verbetes sem réplicas federais. |
| Ficha `/politica/<slug>/` | Abas acessíveis, dados da política, referências e citação em ABNT/APA/BibTeX/RIS; rótulos próprios do DF. |
| UF `/uf/<sigla>/` | Verbetes estaduais/distritais da UF. As federais ficam em `/uf/br/` e nas próprias fichas federais. |
| Comparação `/comparacao/` | Seleção de UFs, tabela e visualização, com limite de seleção implementado no JavaScript. Ver pendência do atalho “Todas” adiante. |
| Mapa `/mapa/` | D3, geometria das 27 UFs, controles, tabela paralela e exportação; correção de JavaScript entregue hoje. |
| Sobre `/sobre/` | Identidade da Rede, instituições, equipe e apoio ao levantamento; subpáginas de metodologia, cobertura, transparência, acessibilidade, privacidade, termos, glossário e introdução. |
| Grafo `/grafo/` | **Oculto por decisão anterior**, via `permalink: false`. Código e articulações preservados; não reativar como parte automática da versão 1.0. |

A seleção pública parte de `site/src/_data/policies.js`, que filtra `is_federal_replica`. Os 792 registros marcados continuam na base canônica, mas não devem voltar a inflar contagens, listagens, busca ou páginas de verbetes.

A tabela “Execução por estado” nas fichas federais e a seção “Políticas federais aplicadas em <UF>” nas páginas estaduais foram removidas em maio por decisão de simplificação. Elas não devem reaparecer apenas porque arquivos antigos de memória ainda descrevem sua criação.

## 5. Clones, sincronização e estado de trabalho

Há **dois clones do mesmo repositório**, não dois projetos independentes:

| Local | Papel operacional |
|---|---|
| `G:/Drives compartilhados/FRM_CatalogoPoliticas` | Fontes e ETL, dados, documentação e histórico do projeto. |
| `C:/Users/antro/dev/catalogo-politicas` | Trabalho operacional de build e validação da interface, fora do Drive sincronizado. |

Ambos foram encontrados em `main`, com `HEAD` e `origin/main` em `6cd84f4`. O remoto foi conferido pela API do GitHub: a informação não depende apenas do cache local de `origin/main`.

O clone operacional estava limpo na leitura. No Drive, `git status` marcou `CLAUDE.md` como modificado, porém o diff de conteúdo estava vazio e o hash Git do arquivo era **idêntico ao HEAD e ao clone operacional** (`0b6f75d483b4ada1ff15aedbff630e83ae12a79b`). Portanto, a marcação não foi tratada como edição textual nova; é compatível com atualização de metadados do Drive.

Continuam presentes arquivos locais não versionados de rodadas antigas: ADRs de paleta/ícones/GeoJSON, plano MVP-UX, regra de validação visual, materiais de investigação de articulações e UX, `policies-onda-1-2026-05-14.json`, log de normalização de maio e `scheduled_tasks.lock`. Não foram apagados nem incorporados a commits nesta auditoria.

Antes de editar, conferir o estado atual dos dois clones, pois o Claude pode ter avançado depois deste relatório. Para sincronizar dados/código, privilegiar o histórico Git e o fluxo documentado em `project_dois_clones_workflow.md`; o trecho antigo do README ETL que propõe cópia manual de `latest.json` não deve ser aplicado indiscriminadamente sobre alterações concorrentes.

## 6. Histórico de hoje para localizar as decisões

Todos os horários abaixo são de Brasília, em 04/10/2026.

| Hora | Commit | Entrega |
|---|---|---|
| 13:46:37 | `bbbafed` | Correção de `TIPO_TO_EIXO` e IDs. |
| 13:46:51 | `dfc7716` | Terceira onda, revisão da segunda, testes e dados. |
| 13:54:02 | `208a866` | Textos para 27 UFs e rótulo “Distrital”. |
| 14:01:32 | `cecfd26` | Plano da terceira onda marcado como concluído. |
| 15:11:30 | `70d8758` | Correções de vocabulário, 166 ocorrências para zero. |
| 15:14:05 | `ff85cc0` | Links institucionais corrigidos. |
| 15:14:15 | `0225c02` | Banner do Encontro removido. |
| 15:15:01 | `9d654ca` | Erro `waitForD3` corrigido. |
| 15:16:08 | `502d64f` | Rótulo “Distrito Federal” nas esferas. |
| 15:24:49 | `60dac11` | Produto permanente da Rede, painel e versão 1.0. |
| 15:53:26 | `b5dc42f` | Logos em melhor definição e link do CN SESI. |
| 15:54:29 | `6c7425e` | Status da versão 1.0 em `CLAUDE.md`; SHA do deploy. |
| 16:01:26 | `6cd84f4` | Plano da versão 1.0 marcado como concluído. |

Planos autoritativos de hoje:

- [Incorporação da terceira onda](../.claude/plans/2026-10-04_incorporar-3a-onda.md).
- [Produto permanente da Rede EJA](../.claude/plans/2026-10-04_produto-permanente-rede-eja.md).

Ambos estão **CONCLUÍDOS**. As subseções “Decisões pendentes (originais)” foram mantidas como histórico e não significam que as decisões continuem abertas. Usar as seções de decisões aprovadas/tomadas e o código final.


## 7. Auditoria direta dos dados atuais

A contagem foi refeita sobre `latest.json`, sem executar o ETL nem alterar fontes ou derivados. A validação foi executada em memória com `Draft7Validator`.

| Verificação | Resultado |
|---|---|
| Registros / réplicas / exibíveis | 1.158 / 792 / 366 |
| IDs e slugs | Todos únicos |
| Nomes vazios | Nenhum |
| Completude média registrada | 94,44% |
| IDs por eixo | EDU: 500; TRAB: 389; PSOC: 269; OUTR: **0** |
| Vínculos das réplicas com federais canônicas | Todos resolvidos na checagem |
| Erros no JSON Schema | **0**, tanto no relatório gravado quanto na validação em memória |
| Valores fora de `canonical_values` nos campos categóricos verificados | **0**, confirmado diretamente nos dados |
| Log `normalize_unmapped_2026-10-04.csv` | **0 linhas de dados** |
| Slugs de maio preservados | **822 de 822**, nenhum removido |
| Registros novos | 336, das nove UFs adicionadas |
| IDs dos registros antigos versus 14/05 | 637 corrigidos |
| IDs dos registros antigos versus 13/05 | Nenhuma diferença: restauração confirmada |
| `latest.json` do Drive e do clone operacional | Idênticos byte a byte |
| Vocabulário e índice de fontes preservadas entre os clones | Idênticos byte a byte |
| Schema entre os clones | Mesmo JSON; diferenças apenas de serialização |

Entre os 366 verbetes exibíveis, os tipos se distribuem em **189 Educacional**, **135 Trabalho e qualificação** e **42 Proteção social com impacto educacional**.

SHA-256 do `latest.json` examinado:

```text
d7c9c8b71b979809e9f7df679f2be3c052afe1f2168f93ddbb8d5c64bab38e2d
```

### 7.1 Cobertura por UF

“Exibíveis” corresponde ao filtro de réplicas usado no site. A linha BR representa a esfera federal; não é uma 28ª UF.

| UF | Registros canônicos | Réplicas federais | Verbetes exibíveis |
|---|---:|---:|---:|
| BR — Federal | 33 | 0 | 33 |
| AC | 38 | 31 | 7 |
| AL | 39 | 29 | 10 |
| AM | 45 | 30 | 15 |
| AP | 37 | 31 | 6 |
| BA | 53 | 27 | 26 |
| CE | 45 | 30 | 15 |
| DF | 35 | 22 | 13 |
| ES | 43 | 30 | 13 |
| GO | 49 | 30 | 19 |
| MA | 39 | 32 | 7 |
| MG | 45 | 33 | 12 |
| MS | 39 | 30 | 9 |
| MT | 46 | 38 | 8 |
| PA | 42 | 30 | 12 |
| PB | 38 | 31 | 7 |
| PE | 44 | 27 | 17 |
| PI | 38 | 33 | 5 |
| PR | 43 | 26 | 17 |
| RJ | 41 | 23 | 18 |
| RN | 42 | 27 | 15 |
| RO | 39 | 28 | 11 |
| RR | 35 | 25 | 10 |
| RS | 40 | 27 | 13 |
| SC | 42 | 33 | 9 |
| SE | 41 | 30 | 11 |
| SP | 53 | 32 | 21 |
| TO | 34 | 27 | 7 |
| **Total** | **1.158** | **792** | **366** |

### 7.2 Preservação de fontes: o que existe e o que não foi atualizado

- **489 de 1.158 registros** possuem referência a fonte preservada; várias referências apontam ao mesmo arquivo.
- Entre os verbetes exibíveis, são **133 de 366 — 36,34%**. Antes eram os mesmos 133 em 287 verbetes — 46,34%. A expansão territorial não foi acompanhada de ampliação equivalente da preservação dos verbetes únicos.
- O índice mantém **138 arquivos: 126 HTML e 12 PDF**, todos presentes no Drive. Os registros atuais referenciam 118 hashes diferentes. Nenhum caminho de arquivo vinculado faltou na verificação local.
- As datas de captura e de última validação desses arquivos continuam em **01/05/2026**.
- O aumento de 374 para 489 registros associados a arquivos preservados não significa 115 novos documentos capturados: inclui novas réplicas que reutilizam fontes existentes.
- Os templates atuais da aba Documentos mostram a URL oficial externa, atribuição e licença; não exibem o texto integral arquivado nem um link para o arquivo preservado. **Existência no acervo local e acesso público pela interface são capacidades distintas.**

Há também valores de `fonte_url` com domínio **`.local`**, usados como placeholders, não como fontes oficiais reais. Foram observados exemplos em Emprega Mulheres e Jovens (BR) e Consórcio Social da Juventude (SP/RJ). O total de placeholders não foi inventariado nesta auditoria. Para a continuidade, revisar seu tratamento na interface e na curadoria sem apresentá-los como links oficiais utilizáveis.

### 7.3 Datas de processamento não equivalem a revisão substantiva

O JSON foi regenerado em **04/10/2026, por volta de 15:11**. Todos os 1.158 registros têm `fonte_data_acesso = 2026-10-04`, mas nos 489 registros vinculados a fontes preservadas a captura real continua em maio.

A causa está no gerador: `scripts/etl/build_json.py` atribui `DATA_HOJE` à data de acesso, usa o instante de execução em timestamps e recalcula a próxima revisão a partir de um TTL. Isso explica por que a rodada atual passou a mostrar prazos futuros:

| Próxima revisão registrada | Registros |
|---|---:|
| 03/11/2026 | 201 |
| 02/01/2027 | 822 |
| 02/04/2027 | 33 |
| 04/10/2027 | 102 |

Portanto, a observação anterior de “730 registros com revisão vencida” **não descreve mais os campos atuais**, mas o recálculo dos prazos também **não comprova rechecagem das fontes**. Se a interface/metadados forem revisados, distinguir data da versão do catálogo, processamento, acesso real à fonte, captura e revisão humana.

## 8. Pendências atuais da interface

Os achados abaixo foram obtidos por leitura do código atual. Onde o efeito depende de interação, está explicitado que falta reprodução em navegador. Os números de linha são referências do estado auditado e podem mudar após novas edições.

### 8.1 Textos e contagens: correções localizadas

| Arquivo/referência | Achado | Ajuste sugerido |
|---|---|---|
| `site/src/index.njk:166` | Ainda diz “Mapa coroplético interativo virá em fase posterior”. | Atualizar para o mapa já disponível. |
| `site/src/index.njk:108` | KPI usa “1 federal + 27 estados”. | Usar “27 UFs” ou “26 estados e Distrito Federal”. |
| `site/src/index.njk:218` e `site/src/explorar.njk:289` | Comparação descrita como “2 a 9 estados”. | Adequar a UFs e esclarecer a opção Federal. |
| `site/src/explorar.njk:4` | Meta description ainda fixa em **439 políticas**. | Atualizar para a cobertura vigente ou gerar pelo dado. |
| `site/src/explorar.njk:179` | Texto explica federais replicadas versus estaduais, embora a distribuição já use o universo sem réplicas. | Descrever federais canônicas e verbetes estaduais/distritais. |
| `site/src/uf/pagina-uf.njk` | Aviso da Bahia afirma que PRONATEC/Juros por Educação seguem visíveis em duplicidade, com `-2`. | Remover/atualizar o aviso público: as quatro entradas continuam no JSON, mas todas são réplicas e estão fora das 26 fichas estaduais exibidas. |
| Home e aba Documentos | Promessa genérica de texto integral preservado versus preservação parcial e ausência de acesso aos arquivos pela aba. | Alinhar a redação à disponibilidade real; eventual publicação do acervo é tarefa separada. |

### 8.2 Comparação entre UFs: prioridade de teste funcional

**Evidência direta no código:** `site/src/comparacao.njk:52` contém o atalho “Todas” com `?ufs=br,sp,rj,mg,pr,rs,ba,pa,pe,ce`. São dez opções do universo antigo — Federal mais nove UFs. O atalho omite 18 UFs hoje disponíveis e contradiz o limite anunciado de nove seleções.

Em `site/src/assets/js/comparacao.js:31–45`, a inicialização lê a lista separada por vírgulas e renderiza diretamente. A limitação de nove está no evento `change`, sem equivalente no carregamento da URL. Assim, o caminho de inicialização permite as dez opções do atalho. Corrigir essa incoerência exige decidir o comportamento do atalho e do limite; apenas acrescentar todas as siglas ao endereço não resolve.

Outros caminhos a reproduzir em navegador antes de alterar:

1. **Selecionar caixas e pressionar Comparar:** o formulário GET produz parâmetros `ufs` repetidos, mas a inicialização usa `params.get("ufs")` e espera uma lista única separada por vírgulas. Não foi encontrado handler de `submit` que harmonize os contratos; há risco de conservar apenas a primeira seleção após o envio.
2. **Limpar seleção:** o botão é `reset`, mas o script observa `change`; conferir se tabela, gráfico e URL são atualizados junto das caixas.
3. **Abrir um link compartilhado e copiar imediatamente:** a inicialização renderiza sem chamar `atualizarUrl`; `#link-atual` começa vazio e é preenchido nessa função. Conferir se o botão copia corretamente a URL antes de qualquer nova interação.

Esses três comportamentos são inferências sustentadas pelo fluxo do código, **não testes interativos executados nesta auditoria**.

### 8.3 Filtros das páginas de UF

`site/src/uf/pagina-uf.njk:39` ensina a usar `?situacao=ativa-em-execucao`, mas `site/src/assets/js/uf-filtros.js:43–44` compara estritamente com o valor completo **`Ativa / em execução`**. O exemplo publicado e o contrato do script precisam ser alinhados.

A página também promete filtros por situação/tipo/modalidade “nos botões abaixo”, enquanto o template examinado apresenta tabela e chips de filtros provenientes da URL, sem aqueles controles; o script trata tipo/situação/origem, sem modalidade. Revisar a promessa e a implementação conjuntamente.

### 8.4 Pontos residuais de baixa prioridade

- `site/src/_data/ufs.js` mantém `coberta:false` em 18 UFs das ondas 2/3. Nas páginas examinadas, a cobertura vem dos agregados calculados do JSON; não foi constatado que a flag quebre o mapa. É informação técnica obsoleta a limpar quando pertinente.
- O link do Conselho Nacional do SESI está deliberadamente em `http://www.cnsesi.com.br/`. O comentário de `equipe.js` registra certificado HTTPS vencido e orienta retorno ao HTTPS quando renovado. Revalidar oportunamente; não considerar a escolha atual um esquecimento de URL.
- Há **16 instituições e 17 arquivos de logos referenciados**, todos presentes na árvore Git; Fundação Itaú usa dois arquivos. A existência foi conferida, mas não houve nova inspeção visual de nitidez/responsividade nesta auditoria. O diagnóstico antigo de quatro logos de baixa resolução foi parcialmente superado pelo commit `b5dc42f`; conferir o estado atual antes de repetir essa pendência.

## 9. Saúde técnica e limites das validações

### 9.1 Stack e execução

O site usa Eleventy 3, Tailwind 3, Pagefind, JavaScript no cliente e D3 para o mapa; o código Cytoscape está preservado para o grafo oculto. O ETL é Python e segue a sequência carregar → normalizar → marcar duplicatas/réplicas → IDs → JSON → validar.

`site/package.json` está em **1.0.0**, mas sua descrição ainda menciona PoC. As dependências e o CI não receberam atualização substancial de stack hoje; a alteração do lockfile foi de versão do projeto. Node local observado: **24.13.1**; configuração do CI em `.nvmrc`: **22**. Essa diferença não provou falha, mas deve ser considerada ao reproduzir um problema de build.

A busca efetiva examinada oferece **quatro facetas: UF, Situação, Tipo e Modalidade**. A menção a cinco facetas no README merece reconciliação com a interface atual.

### 9.2 Testes Python e Node nesta auditoria

Foram selecionados **91 testes toy/unit**, sem executar a integração que regrava o conjunto real:

- **85 passaram**: os 77 testes toy, incluindo os de terceira onda e vocabulário, mais oito testes unitários de captura.
- **Seis testes de captura falharam por `PermissionError` de escrita** de arquivos/índice no diretório temporário criado dentro do workspace. Não foram falhas de asserção demonstrando seis defeitos no capturador.
- O bloqueio de I/O persistiu mesmo após usar um diretório temporário novo no workspace; a limpeza também recebeu `WinError 5`. A árvore temporária `G:/Drives compartilhados/FRM_CatalogoPoliticas/frm-pytest-auditoria-r2wnytni`, criada para esta verificação, foi removida no fechamento da auditoria após conferência do caminho e autorização do ambiente.
- `tests/integration_etl_completo.py` **foi atualizado hoje** para 1.158 fichas, 27 UFs + BR e os tipos canônicos atuais. O diagnóstico anterior de asserções em 439/9 está superado. Restam docstrings antigas.
- A integração não foi reexecutada nesta auditoria porque sua fixture roda o ETL sobre os diretórios reais. Os planos da implementação de hoje registram sua aprovação, mas esse registro é diferente de uma nova execução independente aqui.
- O script de teste Node aponta para `site/tests/`, que não existe no clone examinado. A tentativa com `node --test tests/` respondeu **`Could not find tests/`**. O comando precisa de implementação ou ajuste antes de ser apresentado como verificação disponível.

Não houve instalação de dependências, nova captura, build ou reexecução do ETL para produzir este relatório.

### 9.3 O que o CI cobre — e o que não cobre

O último deploy passou, mas os testes automáticos do workflow têm escopo limitado:

- **pa11y:** home, busca, sobre, privacidade e cobertura.
- **Lighthouse:** home, busca, sobre e privacidade; a configuração ignora `errors-in-console`.
- Nenhuma dessas listas cobre diretamente todas as fichas, mapa, comparação e páginas de UF.
- O workflow de deploy não executa a suíte Python nem os testes unitários Node.
- `npm audit` está configurado com `continue-on-error: true`.
- O job de publicação só executa em `push` para `main`; disparar manualmente `workflow_dispatch` não satisfaz, por si só, essa condição de deploy.

Portanto, CI verde não é prova de que os fluxos de comparação/filtros acima estejam corretos, nem substitui auditoria manual de acessibilidade com leitores de tela.

### 9.4 Citações do dado e citações do site

A interface atual usa a nova obra/editora da Rede EJA em `site/eleventy.config.js` e `ficha-meta.njk`. Porém, o gerador `scripts/etl/build_json.py`, aproximadamente nas linhas 176, 186 e 199, ainda contém **“Catálogo FRM de Políticas Públicas”** nos formatos de citação.

Esse é um ponto concreto para reconciliar a saída do ETL com os filtros do site. Conferir os campos de citação do JSON e o comportamento do próximo processamento antes de declarar que a identidade nova está uniforme em todos os artefatos. Preservar a distinção entre autoria dos verbetes, organização do catálogo e editora institucional.


Conferência adicional no JSON atual: 1158 registros com a marca antiga Catálogo FRM em `citacao_apa`; 1158 registros com a marca antiga Catálogo FRM em `citacao_bibtex`. A discrepância está presente nos campos de citação do dado examinado, além do gerador; os filtros da interface usam a identidade nova.

### 9.5 Estabilidade futura dos IDs

A restauração dos 637 IDs foi verificada nesta rodada. Entretanto, `scripts/etl/build_ids.py:74–83` reinicia contadores e atribui sequências conforme a ordem de entrada; não mantém um cadastro persistente de IDs. Reordenar, excluir ou inserir linhas antes de registros existentes pode alterar IDs em um processamento futuro. Esse é um risco do algoritmo para a manutenção, e não uma afirmação de que os slugs ou IDs restaurados estejam errados hoje. Não prometer estabilidade independente da ordem das fontes sem tratar essa condição.

## 10. Backup, documentação e continuidade

### 10.1 Backup

O backup mensal mais recente foi concluído em **01/10/2026**, [run 36819267571](https://github.com/antrologos/catalogo-politicas/actions/runs/36819267571), com a [release backup-2026-10-01](https://github.com/antrologos/catalogo-politicas/releases/tag/backup-2026-10-01). Ele é anterior à terceira onda e à versão 1.0; as alterações de hoje estão no Git, mas não naquele pacote mensal.

O workflow `.github/workflows/backup.yml` guarda derivados, índice/metadados, schema, vocabulário e documentação selecionada. Exclui os documentos integrais HTML/PDF/DOC/ODT etc. O comando `tar` suprime erros e termina com `|| true`, de modo que sucesso do workflow não assegura, isoladamente, completude do pacote ou restauração validada.

As planilhas de `data/raw/` também não integram a lista de caminhos desse pacote mensal. Preservação pelo Git/Drive e conteúdo do tarball são mecanismos diferentes.

A manutenção recomendada é verificar a integridade/restauração do pacote e definir preservação separada dos documentos originais capturados. A release `v1.0.0` existe sem assets anexados; sua existência não equivale a um pacote completo do acervo nem a DOI Zenodo já emitido.

### 10.2 Documentação e memória

Fontes mais úteis para a próxima sessão:

1. Os dois planos concluídos de 04/10 citados na seção 6.
2. `README.md`, já atualizado para a identidade e contagens atuais.
3. `scripts/etl/README.md`, com procedimento de ondas e histórico novo.
4. Topo de `CLAUDE.md`, com estado da manhã e da tarde de hoje.
5. Memórias em `C:/Users/antro/.claude/projects/g--Drives-compartilhados-FRM-CatalogoPoliticas/memory/`:
   - `project_3a_onda_2026_10_04.md`;
   - `project_v1_rede_eja_2026_10_04.md`;
   - `project_dois_clones_workflow.md`;
   - `reference_urls_institucionais.md`.

O corpo antigo de `CLAUDE.md` ainda contém “439 fichas”, “308 verbetes”, “26 fichas pendentes”, sprints antigos, banner permanente, tabela de execução federal e até descrição de pasta contendo só uma planilha. Essas passagens são históricas e conflitam com o topo atualizado. Não usar como checklist vigente.

O README já não precisa ser refeito como se ainda estivesse inteiramente em maio, mas permanecem detalhes pontuais antigos, como contagem de 57 testes e cinco facetas. A própria descrição de `package.json` ainda menciona PoC. Reconciliar esses itens sem reabrir decisões concluídas.

Também permanecem metadados históricos no vocabulário (data de maio e exploração de 439 fichas) e uma descrição textual do schema que menciona versão 0.1, embora a operação use o contrato referido como v0.2. São resíduos documentais, sem erro de validação demonstrado. O RUNBOOK ainda reflete maio e deve ser confrontado com os comandos, limites e cobertura reais do CI atual.

### 10.3 Backlog que não deve ser confundido com entrega faltante de hoje

- DOI/Zenodo continua anunciado como “em preparação”; a release 1.0 fornece um marco, mas o DOI não foi confirmado.
- Auditoria manual com leitores de tela continua distinta dos checks pa11y/Lighthouse.
- Grafo permanece oculto por decisão. Reativação e acabamento visual são trabalho separado.
- Revisão substantiva de políticas, fontes-placeholder e situação do ProJovem DF continua assunto da equipe de pesquisa.
- Captura/revalidação de fontes, particularmente dos novos verbetes, não foi realizada por simples incorporação da terceira onda.
- Divulgação institucional ampliada aparece no backlog histórico; não foi inferida como pendência bloqueadora da versão 1.0.

## 11. Sequência sugerida para o Claude que está editando

Estas são recomendações desta auditoria, não novas decisões do usuário nem autorização para modificar todo o projeto de uma vez.

1. **Conferir o HEAD e o trabalho em curso.** Partir da versão 1.0 e preservar alterações posteriores ao SHA deste relatório.
2. **Corrigir os textos pontuais comprovadamente antigos.** Home/mapa, 27 UFs, meta description de exploração, legenda de origem e aviso obsoleto da Bahia.
3. **Reproduzir e corrigir os fluxos de comparação e filtros de UF.** Cobrir inicialização por URL, limite de seleção, submit, reset, cópia e exemplo de situação. Usar uma UF nova e o DF na validação.
4. **Alinhar as promessas de fontes com a disponibilidade real.** Distinguir link oficial, placeholder e arquivo preservado; não pressupor acervo integral público.
5. **Reconciliar citações e datas no ETL.** Separar processamento de revisão real e garantir a identidade Rede EJA nos artefatos gerados, com mudança planejada e testes apropriados.
6. **Ajustar documentação e verificações disponíveis.** Corrigir descrições desatualizadas, resolver o script Node sem testes e considerar cobertura de CI para os fluxos atualmente ausentes.
7. **Tratar curadoria e preservação em uma rodada própria.** Situação substantiva das políticas, placeholders, recaptura/revalidação e backup integral.

Para validar alterações de interface, o roteiro mínimo recomendado é: home desktop/mobile; `/sobre/` e painel; uma ficha federal, uma do DF e uma das novas UFs; busca e suas quatro facetas; filtro por URL de UF; comparação por seleção e por link; mapa e exportação. Isso é uma proposta de QA para a próxima edição, não uma alegação de que todos esses passos foram executados nesta auditoria.

## 12. Instrução curta de passagem de contexto

> Use este relatório como referência do estado em 04/10/2026, após `6cd84f4`. O catálogo já está na versão 1.0 da Rede EJA, com 1.158 registros, 792 réplicas e 366 verbetes em 27 UFs + Federal. Terceira onda, revisão da segunda, IDs, vocabulário, banner, identidade e mapa foram tratados e publicados hoje. Preserve essas decisões. Antes de editar, confira commits posteriores e o trabalho local. Priorize as inconsistências comprovadas de texto, comparação e filtros descritas aqui; não restaure seções federais removidas nem o grafo oculto. Diferencie reprocessamento dos dados de revisão das fontes e informe com precisão o que foi testado. Este relatório é diagnóstico e passagem de contexto; não executou as correções propostas.

---

**Escopo da auditoria:** leitura dos dois clones, histórico e estado Git, contagens e validação em memória, comparação com arquivos históricos, inspeção estática de templates/JavaScript, testes toy/unit selecionados e consulta ao GitHub (commits, releases e jobs). Não foi feita auditoria jurídica dos atos, recaptura de fontes, comparação completa das planilhas, nova inspeção visual de produção nem publicação de mudanças. Somente este relatório foi produzido como entrega documental; arquivos temporários de teste são descritos na seção 9.2.
