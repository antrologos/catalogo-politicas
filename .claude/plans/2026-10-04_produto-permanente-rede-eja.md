# Plano: Catálogo como produto permanente da Rede EJA (v1.0)

**Status**: APROVADO (2026-10-04) — usuária delegou D1–D6; implementar todas as fases sem pausa
**Data**: 2026-10-04
**Bloco/Rodada**: G

## Contexto

A usuária informou que o catálogo deixou de ser material de apoio do Encontro de 14/mai. Também deixou de ser um produto "da FRM": passou a ser um **produto final e permanente da Rede EJA e Inclusão Produtiva**.

A página da Rede (https://www.frm.org.br/projeto/rede-eja) confirma isso. No menu **"Evidências"** ela tem três itens: *PNE 2026-2036*, *Pesquisas* e **"Catálogos de Políticas"**, este último apontando para o site. A página também se descreve assim:

> A Rede "nasce para colocar o desafio da educação de jovens e adultos e a inclusão produtiva em evidência, produzir e disseminar conhecimento, **mapear políticas que funcionam**, articular diferentes atores [...]. Formada por 16 instituições da sociedade civil e organismos multilaterais [...]"

## Diagnóstico

| Tema | Onde aparece |
|---|---|
| **Links institucionais com problema (URGENTE)** | **ceres-iesp.uerj.br redireciona para um site de spam/apostas** (302 → shortt.ink → dewadora-18.site). O site do Ceres parece comprometido, e o link aparece no rodapé de **todas** as páginas e em /sobre/. Há também dois links mortos: `www.fundacaobradesco.org.br` (o domínio não resolve mais; o site atual é fundacao.bradesco) e `fundacaoitau.org.br/educacao-e-trabalho` (404). |
| **Encontro 14/mai** | `components/banner-evento.njk`, incluído em `layouts/base.njk:46` (todas as páginas). É a única referência pública. |
| **Enquadramento "frente do Projeto Juventudes Fora da Escola sem Educação Básica"** | `site.js` (subtitle, no topo da home), `sobre/index.md:9`, as citações (`eleventy.config.js` OBRA_*, `equipe.js`, `ficha-meta.njk:20,50`, `sobre/index.md:89`, `termos.md:28`), `CITATION.cff` e `README.md` |
| **Enquadramento centrado na FRM** | Rodapé ("Iniciativa Rede EJA — Fundação Roberto Marinho · Fundação Bradesco"), seções Realizadores, Parceiros e Cooperação, aviso "Compor a Rede **não significa** realizar esta pesquisa" em /sobre/, descrição do repositório no GitHub "(FRM/IESP-UERJ)" e `termos.md:50` |
| **Logo quebrado** | /sobre/ referencia `/assets/img/logos/barra-logos.png`, que **não existe** (404 em produção) |
| **Versão "PoC"** | `site.js` "PoC-2026-05-01" (selo no cabeçalho e no rodapé), `transparencia.md`, `CITATION.cff` (com "439 políticas" e "snapshot"), `site/package.json` 0.1.0-poc e `README.md` |
| **Erro do mapa** | `assets/js/mapa.js:361` termina em `})();`, resto de IIFE. `waitForD3(fn)` devolve uma Promise e o `()` final tenta chamá-la, gerando "waitForD3(...) is not a function". O mapa renderiza porque o `init` já rodou, mas o erro aparece em todo carregamento. |
| **Valores fora do vocabulário** | 166 ocorrências, das quais 149 em fichas visíveis. Viram linhas duplicadas nas distribuições de /explorar/. Exemplos: "Curso/Formação" (71) e "Curso/Formação (qualificação/capacitação)" (16); "Misto (fixa + itinerante)" (103) e "Misto" (34); esfera "Distrito Federal" (11); tipo de oferta "." |

## Sites oficiais das 16 instituições (verificados em 2026-10-04)

| Instituição | URL | Observação |
|---|---|---|
| Ação Educativa | https://acaoeducativa.org.br/ | |
| Ashoka | https://www.ashoka.org/pt-br | página Brasil: /pt-br/country/brazil |
| Conhecimento Social – estratégia e gestão | https://conhecimentosocial.com/ | conhecimento.social é outro site |
| Conselho Nacional do SESI | https://www.cnsesi.com.br/ | o certificado venceu em 03/10/2026; reconferir antes de publicar |
| Fundação Arymax | https://arymax.org.br/ | |
| Fundação Bradesco | https://fundacao.bradesco/ | **o link atual (fundacaobradesco.org.br) está morto** |
| Fundação Itaú / Itaú Educação e Trabalho | https://www.itaueducacaoetrabalho.org.br/ (+ https://www.fundacaoitau.org.br/) | **o link atual dá 404** |
| Fundação Roberto Marinho | https://www.frm.org.br/ | |
| GIFE | https://gife.org.br/ | |
| Instituto Rodrigo Mendes | https://institutorodrigomendes.org.br/ | |
| Pacto Global da ONU – Rede Brasil | https://www.pactoglobal.org.br/ | |
| Redes da Maré | https://www.redesdamare.org.br/ | |
| Todos Pela Educação | https://todospelaeducacao.org.br/ | |
| UNESCO no Brasil | https://www.unesco.org/pt/fieldoffice/brasilia | |
| UNICEF Brasil | https://www.unicef.org/brazil/ | |
| United Way Brasil / Juventudes Potentes | https://www.uwb.org.br/ e https://juventudespotentes.org.br/ | |

## Painel de logos (rascunho pronto em scratchpad/logos/painel-recorte.png)

Os 16 logos foram baixados separadamente dos sites oficiais e montados no mesmo layout da barra oficial (5/5/6).

- **Vetoriais (SVG), nitidez total**: Ashoka, Fundação Bradesco, Fundação Itaú, FRM, Pacto Global e UNESCO. O FRM vem do Wikimedia Commons (versão 2021), num azul mais claro que o da barra da Rede.
- **Raster em alta resolução**: Arymax, Itaú Educação e Trabalho, Instituto Rodrigo Mendes, Redes da Maré (kit oficial da Maré, que também tem EPS), UNICEF, Juventudes Potentes + United Way e Todos Pela Educação.
- **Baixa resolução**: Ação Educativa, Conhecimento Social, Conselho Nacional do SESI (selo 80 anos) e GIFE com o descritor. Não achei versão melhor publicada. No rascunho usei o recorte da própria barra oficial da Rede (cerca de 160 px), que fica levemente suave em telas de alta densidade. O ideal é pedir os vetoriais à secretaria da Rede.

**Implementação**: o painel vira um componente HTML (`components/painel-rede.njk`), em vez de uma imagem única.
- Cada logo é um link para o site oficial, com texto alternativo próprio, o que dá acessibilidade e quebra de linha responsiva no celular.
- Os arquivos ficam em `site/src/assets/img/rede/`.
- Os dados (nome, URL e arquivo) ficam em `equipe.js` (`redeEja`).

## Abordagem (fases, um commit por fase, um único push no fim)

### Fase 0 — Links quebrados e comprometidos (URGENTE)
- [ ] Ceres: tirar o link (o nome continua como texto) do rodapé, de /sobre/, da memória e de `equipe.js` até o site ser recuperado.
- [ ] Bradesco: trocar o link por https://fundacao.bradesco/.
- [ ] Itaú: trocar o link por https://www.itaueducacaoetrabalho.org.br/.
- [ ] Avisar a TI do IESP/Ceres sobre o redirecionamento malicioso (fica a cargo da usuária).

### Fase 1 — Remover o Encontro
- [ ] Remover o include de `base.njk` e apagar `banner-evento.njk`.

### Fase 2 — Identidade: produto permanente da Rede EJA
- [ ] `site.js`: subtitle passa a ser "Rede EJA e Inclusão Produtiva"; ajustar a description.
- [ ] `/sobre/`:
  - nova abertura (produto permanente da Rede, parte das "Evidências", link para a página da Rede);
  - **remover** o aviso "compor a Rede não significa…";
  - créditos conforme D1;
  - Projeto Juventudes conforme D2.
- [ ] Painel de logos das 16 instituições (componente acima), substituindo a imagem quebrada. Onde mais exibir: D6.
- [ ] Rodapé: Rede no topo, créditos de D1 e link "Conheça a Rede".
- [ ] Citação conforme D3: `eleventy.config.js`, `equipe.js`, `ficha-meta.njk`, `sobre/index.md`, `termos.md`, `CITATION.cff` e `README.md`.
- [ ] `termos.md:50` (marcas das 16 instituições) e descrição do repositório no GitHub.

### Fase 3 — Versão 1.0
- [ ] Versão nova: `site.js` "1.0", `site/package.json` 1.0.0 e `CITATION.cff` (1.0, data, 366 políticas, 27 UFs).
- [ ] Selo do cabeçalho conforme D4; rodapé com "Versão 1.0 · outubro de 2026".
- [ ] `transparencia.md`: versão atual e histórico. `README.md`: status atualizado.
- [ ] Depois do deploy, criar a tag `v1.0.0` e uma GitHub Release (base para o DOI no Zenodo).

### Fase 4 — Erro do mapa
- [ ] Em `mapa.js:361`, trocar `})();` por `});`.
- [ ] Validar com puppeteer: zero erros, 27 UFs e downloads funcionando.

### Fase 5 — Vocabulário (D5)
- [ ] Aplicar as variantes óbvias:
  - categoria igual com descrição, maiúscula, espaço ou erro de digitação: "Curso/Formação (…)", "Serviço/Atendimento (…)", "Unidade fixa/oferta fixa", "União-Estado", "Compartilha da…";
  - esfera "Distrito Federal" vira "Estado", com o rótulo "Distrito Federal" nas fichas do DF, mesma regra do "Distrital".
- [ ] Rodar o ETL no clone do Drive, com toy test e 0 erros.
- [ ] Gerar a lista dos casos ambíguos para a equipe de pesquisa: "Misto" de arranjo, "Territorializada", "Infraestrutura educacional", "." e os valores colados no campo errado.

### Fase 6 — Validação e publicação
- [ ] Build limpo e puppeteer em home, /sobre/, /mapa/, /explorar/, uma ficha e /uf/df/. Critérios:
  - zero "Encontro" e "PoC";
  - console limpo;
  - 16 logos carregando, todos linkados.
- [ ] Rodar o link-check dos links institucionais.
- [ ] Fazer um push e conferir o CI e o site no ar.
- [ ] Atualizar CLAUDE.md e a memória (incluindo a URL do Ceres em `reference_urls_institucionais.md`).

## Decisões tomadas (delegadas pela usuária em 2026-10-04)
- **D1**: Rede + 16 instituições no topo; "Pesquisa e desenvolvimento: Ceres/IESP-UERJ, MAPE, IESP-UERJ"; papéis originais (realização FRM+Bradesco, parceiros Itaú+Arymax, cooperação UNESCO) mantidos numa seção secundária "Apoio ao levantamento"
- **D2**: "Projeto Juventudes…" sai do título, subtítulo e citação; fica uma linha histórica em /sobre/
- **D3**: editora da citação = "Rede EJA e Inclusão Produtiva" (local: Rio de Janeiro)
- **D4**: selo de versão sai do cabeçalho; "Versão 1.0" no rodapé, em /sobre/transparencia/ e na citação
- **D5**: todas as correções de vocabulário, seguindo o dicionário oficial "Modelos de Categorias" da 3ª onda (inclui as categorias oficiais "Infraestrutura educacional", "Insumo/Bem de apoio" e "Sem informação" em tipo de oferta; valor de outro campo colado vira "Sem informação"; esfera "Distrito Federal" vira "Estado" com rótulo "Distrito Federal" nas fichas do DF)
- **D6**: painel completo em /sobre/ + faixa na home; rodapé com texto e link para a Rede
- **Ceres**: link passa a ser a página oficial do núcleo no IESP (https://iesp.uerj.br/nucleo/ceres/), já que ceres-iesp.uerj.br está comprometido
- **Logos de baixa definição**: busca ampliada delegada a um agente (sites, PDFs oficiais, Commons); nada é pedido a terceiros

## Decisões pendentes (originais)
- **D1 Créditos**: como apresentar FRM, Bradesco, Itaú, Arymax, UNESCO e Ceres/MAPE/IESP
- **D2 Projeto Juventudes Fora da Escola**: remover de vez ou manter uma linha histórica
- **D3 Editora da citação**: Rede EJA, Ceres/IESP-UERJ ou ambas
- **D4 Selo de versão no cabeçalho**: remover ou mostrar "v1.0"
- **D5 Vocabulário**: aplicar as variantes óbvias nesta rodada
- **D6 Onde exibir o painel de logos**: só /sobre/, /sobre/ + rodapé ou /sobre/ + home
