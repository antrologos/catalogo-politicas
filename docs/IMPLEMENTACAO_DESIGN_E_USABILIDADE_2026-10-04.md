# Catálogo da Rede EJA — implementação do plano ampliado

**Data:** rodada iniciada em 4 de outubro e concluída em 5 de outubro de 2026.

**Estado:** publicado e verificado em produção em 5 de outubro de 2026, com os dois clones sincronizados.

**Referência:** [Plano ampliado de design e usabilidade](PLANO_DESIGN_E_USABILIDADE_2026-10-04.md), autorizado pelo pedido “implemente o plano ampliado”.

## Resultado

O catálogo recebeu a identidade da Rede EJA, uma entrada centrada na consulta, exploração por território e área, resultados mais legíveis e continuidade entre busca e ficha. A rodada preserva a finalidade de conhecer experiências, finalidades, territórios e referências para fortalecer a EJA pública, presencial e de qualidade.

A versão está disponível no [site público do catálogo](https://antrologos.github.io/catalogo-politicas/). Implementação publicada no commit `a759f6c`, com ajuste final de tipografia no commit `5b1cc49`. A [execução final de publicação](https://github.com/antrologos/catalogo-politicas/actions/runs/37259832186) concluiu todas as etapas com sucesso.

## O que foi implementado

| Frente | Entrega |
|---|---|
| Identidade | Logo integral e favicon oficiais, roxo da Rede, superfícies claras, tipografia Plex Sans local, hierarquia e espaçamentos consistentes. Procedência dos arquivos em `site/src/assets/img/rede/FONTES.txt`. |
| Navegação | Início, Buscar, Explorar e Sobre sempre visíveis, inclusive no celular e sem JavaScript. Cabeçalho fixo somente em telas largas. Atalho de teclado leva o foco ao conteúdo. |
| Entrada | Busca principal, dois caminhos de exploração, exemplos ligados à EJA, um bloco de contexto do acervo e painel compacto das 16 instituições. |
| Exploração | 28 territórios e três áreas como acessos principais. Demais dimensões em posição secundária, com seus limites explícitos. |
| Resultados | Nome, território, área e trecho da descrição original. Sem descrição disponível, conserva-se o trecho encontrado pelo Pagefind. Não há resumo gerado nem interpretação adicional das políticas. |
| Filtros | Seleções visíveis e removíveis; limpar filtros preserva o termo. OU entre valores da mesma categoria e E entre categorias. No celular, painel no fluxo da página e comando “Ver resultados”. |
| Continuidade | Termo e quatro facetas na URL; retorno da ficha restaura resultados carregados, posição de leitura e foco quando o armazenamento da sessão está disponível. |
| Estados da busca | Entrada vazia, carregamento, resultados, ausência de correspondências e falha técnica, com recuperação e acesso às listas estáticas. |
| Fichas | Quatro blocos abertos: Identificação, Finalidade, Território e Referências. Ações de copiar link, citar, imprimir e voltar à consulta de origem. |
| Impressão | Título, quatro blocos, notas editoriais, descrição complementar, referências e datas preservados. Endereço da fonte aparece por extenso. Apenas a citação ABNT é impressa; os quatro formatos continuam disponíveis na tela. |
| Listagens e rodapé | Tabelas com rolagem local acessível no celular, ajuda sem instruções técnicas de URL, créditos e marcas preservados. |

## Correções encontradas durante a verificação

- O componente padrão da busca tratava duas UFs como interseção. Um adaptador pequeno da API pública do Pagefind passou a solicitar união dentro de cada faceta, mantendo o motor e a interface existentes.
- O retorno ocorria antes do fim da renderização e restaurava apenas dez resultados. Agora aguarda a consulta e os resultados carregados.
- O metadado territorial concatenava UF e ano. A busca agora recebe a UF isoladamente, sem sugerir data de oferta.
- As páginas de UF apontavam para uma âncora antiga de Explorar. Os links levam à seção de territórios.
- O estilo de impressão ocultava também o botão que contém a referência. A referência permanece visível como link textual, com sua URL.
- As listas por dimensão usavam o indicador de réplica para rotular a origem. Como as réplicas já são excluídas, os federais apareciam como estaduais. O rótulo agora usa a UF canônica BR; o DF aparece como Distrital, preservando o vocabulário dos filtros.

- A conferência pública detectou que a configuração de títulos emitia uma declaração CSS para cada alternativa de fonte. A lista agora é serializada em uma única declaração, preservando Plex Sans nos títulos das fichas e dos textos institucionais.

## Validação realizada

| Verificação | Resultado |
|---|---|
| Testes do site | **31 aprovados**, incluindo busca, retorno, renderização editorial e integridade do acervo. |
| Build | Eleventy e Tailwind concluídos; **426 páginas HTML**; Pagefind com **366 fichas e quatro filtros**. Índice temporário reconstruído sem fragmentos antigos. |
| Links locais | **22.916 referências**, incluindo **3.156 referências com âncora**; nenhum destino ou âncora ausente, nenhum ID duplicado e prefixo do projeto correto. Links externos não foram revalidados nesta rodada. |
| Busca no navegador | **21 verificações funcionais aprovadas**, incluindo múltiplas seleções, quatro facetas na URL, remoção, limpeza, recarga, ausência de resultados, retorno, celular e armazenamento bloqueado. |
| Exemplo concreto | EJA + DF/SP: 14 resultados; acrescentar área Educacional: 11. Retorno verificado com 20 resultados, mesma posição e foco. |
| Falhas simuladas | Bloqueio do motor e do índice produziu mensagem de recuperação; nova tentativa restaurou EJA + DF após o desbloqueio. |
| Acessibilidade automatizada | Sem violações detectadas pelo axe em Início, Explorar, Buscar, ficha e Sobre, a 1440, 390 e 320 px. A busca foi reavaliada após o ajuste dos trechos; a listagem Educacional também passou em 1440/390 px. |
| Layout e leitura | Inspeção de capturas reais, navegação visível, ausência de transbordamento da página e teste de espaçamento ampliado nas cinco páginas principais. Conferência adicional em 768 px. |
| Ficha e impressão | Link e citação copiados corretamente; leitura sem JavaScript; abertura e restauração dos detalhes; nota BR/São Paulo e URL da referência preservadas na emulação de impressão do Chromium. |
| Páginas secundárias | UF/DF, Educacional, mapa e comparação em 1440/390 px. Mapa com teclado e exportação SVG/PNG; comparação com seleção, limpeza e cópia de URL. |
| Publicação | GitHub Pages concluído; schema, 31 testes, build, pa11y e Lighthouse aprovados. Conferência pública de identidade, quatro seções, nota BR/São Paulo, filtros OU/E, paginação, retorno à mesma posição e layout móvel. |
| Sincronização | **24 arquivos de implementação** sincronizados entre C e Drive, após comparação com o estado inicial e conferência dos hashes. Alterações anteriores preservadas. |

A avaliação foi técnica e visual, sem teste com profissionais da Rede. Auditoria automatizada não equivale a certificação integral de acessibilidade ou a revisão com leitor de tela.

## Preservação do conteúdo e manutenção

Dados, planilhas, IDs, slugs, schema, vocabulário e ETL permanecem inalterados. As descrições do acervo não foram reescritas. A melhora da apresentação não confirma que uma política esteja em funcionamento nem substitui pesquisa substantiva de suas fontes. As ressalvas editoriais continuam visíveis.

As principais fontes de manutenção são os layouts e componentes em `site/src/_includes/`, `index.njk`, `explorar.njk`, `buscar.njk`, o CSS global e `tailwind.config.js`. A busca está em `assets/js/catalogo-busca.js`, com estado e formatação em `catalogo-busca-estado.js`; `catalogo-pagefind/pagefind.js` adapta somente APIs públicas. Ações da ficha estão em `assets/js/ficha.js` e a cópia compartilhada em `copy.js`.

Nenhuma dependência foi adicionada ou atualizada. Ao atualizar Pagefind, manter a verificação dos filtros múltiplos, estados de falha e retorno à lista. O build ainda informa que sua base Browserslist está antiga; isso não impediu a compilação desta rodada.

A publicação foi autorizada explicitamente em 05/10/2026 e concluída. Não foi exigida revisão do responsável em lotes. Os links externos das fontes continuam fora da revalidação desta rodada.

## Capturas da implementação

- [Início — computador](design/2026-10-04_implementacao-home-desktop.png)
- [Início — celular](design/2026-10-04_implementacao-home-mobile.png)
- [Busca — celular](design/2026-10-04_implementacao-busca-mobile.png)
- [Ficha — celular](design/2026-10-04_implementacao-ficha-mobile.png)

Estas imagens registram a implementação real. O estudo estático anterior permanece apenas como histórico do planejamento.
