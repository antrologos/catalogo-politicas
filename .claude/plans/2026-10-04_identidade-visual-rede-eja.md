# Plano: identidade visual e usabilidade do Catálogo da Rede EJA
> **Revisão ampliada:** após a pesquisa de boas práticas solicitada pelo usuário, o [Plano ampliado de design e usabilidade](../../docs/PLANO_DESIGN_E_USABILIDADE_2026-10-04.md) passa a ser a referência principal. Este documento e o estudo estático registram a proposta preliminar; tamanhos móveis, estados da busca e retorno à lista devem seguir a revisão. A implementação posterior da revisão ampliada está concluída localmente; ver [relatório](../../docs/IMPLEMENTACAO_DESIGN_E_USABILIDADE_2026-10-04.md).

**Data:** 4 de outubro de 2026.

**Status:** HISTÓRICO — proposta preliminar substituída pelo plano ampliado, já implementado e validado localmente.

**Escopo:** uma rodada de acabamento visual e usabilidade sobre a reorganização editorial já concluída.

## Objetivo e direção

Dar ao catálogo uma identidade institucional reconhecível e um acabamento consistente, com consulta fácil em computador e celular. Incorporar o logo autêntico e alguns elementos da Rede EJA: roxo, verde-lima, azuis e formas circulares discretas. A página deve comunicar cuidado, clareza e pertencimento à Rede desde o primeiro contato.

O centro continua sendo conhecer experiências, finalidades, territórios e referências para fortalecer a EJA pública, presencial e de qualidade. A interface preserva os quatro blocos aprovados e as ressalvas sobre o levantamento. Qualidade gráfica não pode sugerir validação factual que a pesquisa ainda não realizou.

## Diagnóstico da versão atual

A rodada anterior resolveu principalmente organização e linguagem. Há uma base funcional, mas o acabamento visual ainda é pouco conectado à Rede:

- Cabeçalho azul apenas textual, sem o logo da Rede. Fundo creme e títulos serifados produzem uma identidade distinta da referência institucional.
- A home acumula margens superiores e dois parágrafos antes da busca. O painel das instituições e o rodapé ocupam muito espaço em relação à função de consulta.
- Busca, filtros e resultados usam personalizações próprias, inclusive cores duplicadas fora dos tokens gerais. Precisam parecer partes do mesmo produto.
- Nas fichas, rótulos, valores e notas de interpretação têm pouca diferenciação visual. Muitos textos auxiliares usam tamanho reduzido.
- O cabeçalho fixo exige compensação na rolagem para as quatro âncoras. Os destinos não têm `scroll-margin` hoje.
- O rodapé concentra grupos de links, créditos e uma lista de UFs com alvos pequenos. Isso prolonga a página, especialmente no celular.

O diagnóstico combina leitura dos componentes com inspeção visual da home. Busca, ficha e rodapé também foram examinados no código; a execução deverá incluir sua inspeção visual na nova composição.

## Referência verificada e logo

Referência: [página da Rede EJA](https://www.frm.org.br/projeto/rede-eja), destino de [redeeja.org.br](https://redeeja.org.br/). Foram examinados os arquivos públicos da página, seu cabeçalho, banner e estilos. A renderização direta recebeu 403; a inspeção visual foi possível com os mesmos recursos públicos obtidos por HTTP. Trata-se de observação da página, não de um manual de marca.

- [Logo horizontal oficial em SVG](https://www.frm.org.br/static/images/pages/projeto/rede-eja/RedeEJA_Logo-Header.svg): vetorial, 6.221 bytes, proporção 477,03 × 99,59; lettering e símbolo em caminhos, sem dependências externas.
- [Favicon oficial](https://www.frm.org.br/static/images/pages/projeto/rede-eja/EJA_favicon.png): PNG de 100 × 100 px.
- O SVG contém roxo `#665A8E`, verde `#BFDE42`, azul `#5A83CF`, azul claro `#79AABD` e lettering preto. O CSS da landing usa variantes próximas; a proposta toma o SVG como referência de cor.
- A landing declara DT Ampla Book nos títulos e Roboto no texto. Para o catálogo, a proposta é aproveitar IBM Plex Sans, já instalada e servida localmente, aproximando a linguagem por composição, peso e cores.

**Aplicação proposta:** logo completo, com cores e proporção originais, sobre cabeçalho branco. Preservar o nome institucional, inclusive “Inclusão Produtiva”, sem alterar a centralidade editorial da EJA. Associar a marca ao título “Catálogo de Políticas”. O conjunto leva ao início do catálogo; o link para o site institucional permanece explícito no rodapé. Guardar SVG e favicon localmente e registrar a origem em `FONTES.txt`.

Usar cerca de 240–280 px para o logo no desktop e dimensionamento próprio no celular, mantendo leitura do lettering e alvos de navegação de 44 px. Não deformar, recortar, recolorir ou recriar a marca. Usar o favicon oficial, sem extrair arbitrariamente uma parte do logotipo.

## Sistema visual proposto

| Elemento | Decisão | Aplicação |
|---|---|---|
| Cor principal | Roxo `#665A8E` | Botão de busca, links, item ativo da navegação e pequenos destaques de seção. |
| Cor de apoio | Verde-lima `#BFDE42` | Pequenas faixas, detalhes gráficos e realces com texto escuro. |
| Azuis da marca | `#5A83CF` e `#79AABD` | Formas de apoio e detalhes pontuais; uso contido. |
| Superfícies | Branco e `#F6F7FB` | Cabeçalho branco, área de leitura clara e fundos suaves para separar funções. |
| Texto | Principal `#252333`; secundário `#625F70` | Contraste forte, com hierarquia por peso e espaço, sem depender de texto muito pequeno. |
| Bordas | `#E1E2EA`; estados com roxo mais escuro | Separadores discretos; contornos de controles devem ser reforçados quando necessários à identificação. |
| Formas | Arcos ou círculos discretos, derivados da linguagem da página | Um detalhe na abertura e, no máximo, outro no encerramento; fora da área de texto e busca. |
| Componentes | Raios de 6–10 px, bordas leves, pouca sombra | Linguagem uniforme em campo, botão, filtros e caixas informativas. |

A maior parte da tela permanece clara. O roxo organiza as ações e o verde acrescenta identidade em pequenas doses. Não usar todas as cores ao mesmo tempo em cada componente. As cores institucionais não devem atribuir validade, eficácia ou aprovação às políticas.

Cálculo de contraste das combinações propostas: branco/roxo ≈ 6,14:1; texto `#252333`/verde ≈ 10,05:1. Branco sobre os azuis do logo resulta em ≈ 3,76:1 e 2,53:1; portanto, esses pares não serão usados em texto corrente ou rótulos pequenos. Contraste será novamente verificado nos componentes renderizados, incluindo foco, hover e desabilitado.

### Tipografia e proporções

- IBM Plex Sans também em H1/H2, substituindo a serifada da interface. Pesos 400, 500 e 600–650; fonte mono apenas em citações técnicas/código.
- H1 de aproximadamente 44–48 px no desktop e 32–36 px no celular; H2 de 26–30 px; texto de leitura de 17–18 px com entrelinha de 1,55–1,65. Metadados de 14–16 px, sem encolher notas importantes.
- Contêiner geral de aproximadamente 1.120 px; leitura contínua limitada a cerca de 720–760 px. Na busca, reservar uma coluna de filtros e uma coluna confortável para resultados.
- Escala consistente de espaços de 8, 12, 16, 24, 32 e 48 px; reduzir o padding duplicado da home.
- Estados de foco visíveis, contraste e texto nos estados ativos. Transições discretas de cor, respeitando preferência por movimento reduzido.

## Alterações por tela

### 1. Cabeçalho e página inicial

Cabeçalho branco com logo, identificação do catálogo e os quatro acessos existentes: Início, Buscar, Explorar e Sobre. O estado ativo deve ser claro por peso e sublinhado, além da cor. No celular, os quatro acessos ficam visíveis numa segunda linha, como no estudo, com foco e área de toque consistentes. Conferir a composição também a 320 px, sem encolher texto a ponto de prejudicar a leitura.

Na abertura, manter o título e uma frase curta sobre experiências e referências para a EJA pública presencial. Aproximar a busca do título e dar ao campo e ao botão a principal ênfase visual. A composição deve permitir localizar a busca no primeiro quadro em desktop e em celular de 390 × 844 px. Explicações adicionais ficam abaixo da ação principal, com menor peso visual.

Manter uma única síntese da cobertura: 366 verbetes, 27 UFs e esfera federal, sempre apresentada como universo do levantamento. Não transformar contagem do acervo em indicador de impacto ou atendimento. Tratar o painel da Rede como encerramento institucional compacto, com logos equilibrados por dimensão visual e proporção preservada.

### 2. Busca e resultados

Aproximar o campo do título “Buscar”. Aplicar os mesmos estilos de campo, botão, fonte, borda e foco da home ao Pagefind. Centralizar as cores em tokens, eliminando valores divergentes no CSS da busca.

No desktop, filtros em coluna lateral; no celular, usar a organização expansível já disponível no componente, com seleção e forma de limpar claramente reconhecíveis. Preservar a consulta por URL e os filtros existentes.

Resultados como lista de blocos arejados: nome da experiência em destaque, território/metadados existentes em segundo plano e trecho descritivo legível. Evitar uma grade de cartões que dificulte comparar textos. Manter separação consistente entre resultados e realce de termos pesquisados com contraste.

Conferir visualmente os estados de entrada sem termo, carregamento, resultados, ausência de resultados, filtros ativos e limpeza. As orientações devem aparecer onde ajudam a agir; reduzir o bloco de instruções antes da busca. A reformulação não envolve troca do motor de busca.

### 3. Ficha da experiência

Preservar Identificação, Finalidade, Território e Referências como seções visíveis. Dar ritmo aos blocos com títulos, separadores e espaços previsíveis; não transformar cada campo em um cartão.

Destacar nome e contexto do registro. Usar pares rótulo/valor com pesos distintos e boa leitura no celular. Manter notas de interpretação próximas das informações a que se referem, em um padrão discreto e consistente. A observação sobre a divergência BR/São Paulo permanece perceptível.

As quatro âncoras devem ter áreas de toque confortáveis e organização em duas linhas quando necessário. Compensar a altura do cabeçalho com `scroll-margin-top`, para que o título de destino fique visível. Descrições complementares e citação continuam em `details`, com indicação clara de expansão.

Dar destaque reconhecível à ação de consultar a referência, preservando a informação de abertura em nova aba e a explicação para link ausente. Evitar selos ou ícones que sugiram política validada.

### 4. Páginas secundárias e encerramento

Propagar os mesmos tokens, títulos, controles e espaçamentos a Explorar, UF, dimensões, mapa, comparação e Sobre. Preservar a função e as URLs dessas páginas. No mapa, manter cores e legendas funcionais legíveis; cor de marca não deve substituir codificação de dados sem avaliação específica.

Simplificar o rodapé em três grupos claros: consulta, informações do catálogo e referências/créditos. Substituir a repetição das 27 UFs por um acesso à exploração territorial existente. Manter mapa, comparação, metodologia, acessibilidade, termos e créditos acessíveis. A redução de repetição não exclui instituições ou altera sua atribuição.

## Execução proposta

Uma rodada concentrada, sem revisão do usuário ficha a ficha:

1. Adicionar os arquivos oficiais de marca e sua procedência; definir os tokens e a tipografia.
2. Aplicar o sistema ao cabeçalho, à home e aos componentes comuns.
3. Harmonizar busca e ficha; completar ajustes de navegação por teclado, âncoras e celular.
4. Propagar o acabamento às telas secundárias e ao rodapé.
5. Gerar a prévia e validar o conjunto; corrigir inconsistências visuais encontradas antes de apresentar o resultado.

O [estudo visual estático](../../docs/design/2026-10-04_estudo-visual-rede-eja.html) ilustra essa direção. É um artefato de planejamento, com amostras de home, resultado e ficha; seus controles não executam consultas. Não substitui a validação da interface implementada.

## Arquivos previstos

- `site/tailwind.config.js` e `site/src/assets/css/tailwind.css`: tokens, tipografia, superfícies, espaçamentos e componentes.
- `site/src/assets/img/rede/`: logo/favicons oficiais e atualização de `FONTES.txt`.
- `site/src/_includes/layouts/base.njk`: composição geral e referência ao favicon, conservando metadados e carregamento local.
- `site/src/_includes/components/header.njk`, `footer.njk` e `painel-rede.njk`: identidade, navegação e créditos.
- `site/src/index.njk` e `site/src/buscar.njk`: hierarquia da abertura, formulário e aparência Pagefind.
- `site/src/_includes/layouts/ficha.njk` e componentes de referência/situação: acabamento das quatro seções, âncoras e controles, sem reclassificação.
- Ajustes localizados em templates de UF, dimensões, Explorar, Mapa, Comparação e Sobre somente onde os tokens comuns não forem suficientes.
- Registro final da implementação e atualização das orientações do projeto.

## Validação e critérios de conclusão

- Inspeção visual de home, busca e ficha longa em 1440 e 390 px; conferir também 320/360 e 768 px para quebras de navegação e ausência de overflow.
- Logo legível e sem deformação; nome do catálogo reconhecível; consistência entre campo e botão da home e da busca.
- Primeiro acesso à busca evidente, sem competir com blocos institucionais; resultados fáceis de distinguir e percorrer.
- Teclado, foco, navegação móvel, expansão de detalhes e âncoras funcionam; destino das âncoras não fica encoberto.
- Contraste de texto e controles, zoom de 200%, áreas de toque de pelo menos 44 px nos controles principais e preferência por movimento reduzido conferidos.
- Reexecutar os 14 testes existentes e build Eleventy/Tailwind/Pagefind. Conferir EJA + DF, recarga com filtro, ficha sem fonte, ficha com nota editorial, mapa e comparação. Não criar testes que apenas repitam valores cosméticos.
- Auditoria automática de acessibilidade nas telas alteradas, acompanhada de inspeção de teclado e foco. Não apresentar o resultado como certificação integral.
- Verificar ausência de downloads remotos de fonte/logo, imagens pesadas ou bibliotecas acrescentadas para decoração. Conferir links, console e integridade de dados/IDs.
- Entregar capturas desktop/celular e resumo curto do resultado. A revisão visual e técnica cabe à execução desta rodada; não depende de lotes de revisão de políticas pelo responsável.

## Limites

Este plano não altera dados canônicos, planilhas, IDs, slugs, schema, vocabulário ou ETL; não acrescenta pesquisa de políticas, filtros, rankings ou indicadores. Não reabre a estrutura editorial nem altera a posição sobre educação pública, presencialidade, trabalho e cuidados. Não prevê carrossel, fotografia de banco, animações decorativas ou reprodução do banner institucional inteiro.

Publicação e commit não foram realizados durante o planejamento. A próxima ação de implementação depende da orientação do usuário, que nesta mensagem pediu somente o plano.
