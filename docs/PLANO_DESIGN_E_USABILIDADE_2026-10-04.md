# Catálogo da Rede EJA — plano ampliado de design e usabilidade

**Data:** 4 de outubro de 2026.

**Status:** IMPLEMENTADO, VALIDADO E PUBLICADO — autorizado por “implemente o plano ampliado”. Dados preservados; publicação concluída em 05/10/2026. Consulte o [relatório da implementação](IMPLEMENTACAO_DESIGN_E_USABILIDADE_2026-10-04.md).

**Versão:** revisão 2; consolida e amplia o [plano visual anterior](../.claude/plans/2026-10-04_identidade-visual-rede-eja.md).

## 1. Decisão central

O catálogo deve permitir a um profissional da Rede EJA localizar uma experiência, entender o que o levantamento informa sobre ela, chegar à referência e reutilizar a informação. O design precisa tornar esse percurso evidente e agradável, com a identidade da Rede presente desde a entrada.

A direção visual anterior — logo oficial, roxo, verde-lima, azuis pontuais, superfícies claras e tipografia consistente — permanece. A pesquisa acrescenta decisões sobre descoberta, resultados, filtros, retorno à consulta, impressão e legibilidade. Também identifica correções no estudo visual anterior, que ainda não é uma especificação pronta para execução.

O público definido pelo responsável é formado por membros, coordenadores e funcionários das instituições da Rede. Não presumir que se trata de um serviço de matrícula ou de atendimento direto aos estudantes. A defesa da educação pública presencial e as demais diretrizes editoriais permanecem como base.

## 2. O que a pesquisa sustenta — e seus limites

As fontes têm naturezas distintas: normas de acessibilidade, orientações de equipes de design, pesquisa externa com usuários e exemplos de catálogos. A aplicação ao FRM é uma decisão de projeto. Não houve teste com profissionais da Rede nesta rodada, e não se prometem percentuais de melhora.

| Referência | Achado útil | Consequência para o plano |
|---|---|---|
| [NN/g — efeito estético](https://www.nngroup.com/articles/aesthetic-usability-effect/) | Aparência pode melhorar a percepção de facilidade e também mascarar dificuldades de uso. | Avaliar beleza e realização de tarefas separadamente. Prestígio visual não deve sugerir validação substantiva das políticas. |
| [NN/g — clareza dos links e contexto](https://www.nngroup.com/articles/information-scent/) | Título, resumo e contexto ajudam a pessoa a prever o que encontrará depois do clique. | Resultados devem informar finalidade e território, com rótulos descritivos. Evitar resumos que apenas repitam o nome. |
| [USWDS — busca](https://designsystem.digital.gov/components/search/) | Campo visível na home, consulta preservada e rótulo acessível facilitam a localização. | Busca simples e dominante; caminhos de exploração próximos para quem ainda não sabe o termo. |
| [USWDS — coleções](https://designsystem.digital.gov/components/collection/) | Título, descrição e poucos metadados permitem percorrer uma lista. Imagens precisam acrescentar informação. | Resultado enxuto, sem miniaturas genéricas ou excesso de etiquetas. Não copiar seu limite de pequenas coleções editoriais como regra de paginação. |
| [MoJ — filtros](https://design-patterns.service.justice.gov.uk/components/filter/) | Seleções visíveis e remoção individual tornam o recorte compreensível. | Mostrar o que está filtrado e distinguir limpar filtros de iniciar outra busca. |
| [DfE — filtros](https://design.education.gov.uk/design-system/components/filter) e [governo escocês](https://designsystem.gov.scot/patterns/search-results/search-filters) | Localização do controle, aparência de botão ativo e confirmação no celular são problemas concretos. | Projetar o filtro móvel como uma sequência completa; não basta recolorir checkboxes. |
| [USWDS — tipografia](https://designsystem.digital.gov/components/typography/) e [GOV.UK — layout](https://design-system.service.gov.uk/styles/layout/) | Tamanho efetivo, comprimento das linhas e espaçamento importam tanto quanto a escolha da fonte. | Rever textos pequenos do estudo e limitar a largura dos parágrafos. |
| [GOV.UK — detalhes expansíveis](https://design-system.service.gov.uk/components/details/) | Recolhimento é adequado a informação de interesse secundário para parte dos usuários. | Manter os quatro blocos e as ressalvas essenciais visíveis; recolher descrições adicionais e formatos de citação. |

### Catálogos comparáveis

- **[LitBase, UNESCO/UIL](https://www.uil.unesco.org/en/litbase/list):** combina busca, navegação territorial, temas e lista/mapa. A [ficha do CIEJA](https://www.uil.unesco.org/en/litbase/integrated-centre-adult-and-youth-education-cieja-brazil) separa identificação, contexto, implementação e fontes, e explicita a data de atualização. Inspira a conexão entre descoberta e leitura. Não copiar todas as facetas: nosso acervo não possui a mesma classificação. Tampouco adotar a qualificação “efetivas” para nossas experiências ou tratar a informação datada como confirmação atual.
- **[Base de proteção social da CEPAL](https://dds.cepal.org/bpsnc/acerca?bd=ps):** apresenta características e institucionalidade dos programas, com fontes identificadas e dados de cobertura/investimento quando disponíveis. É referência para deixar claro o alcance da informação. Seus temas e a profundidade da base não precisam ser reproduzidos nesta versão.
- **[Biblioteca de casos OPSI/OCDE](https://oecd-opsi.org/case_type/opsi/):** oferece diversos filtros de casos e etapas. Serve como contraste: podemos aproveitar a localização de experiências, mas não precisamos de tantas facetas, reconhecimentos ou selos. Não há justificativa para classificações como “melhor”, “premiada” ou “forte evidência” em nosso catálogo.

São comparações de organização e recursos observáveis. A presença de um padrão em outro site não comprova que sua interface seja a melhor para a Rede EJA.

## 3. Percursos que orientarão o design

São hipóteses de tarefas derivadas da finalidade aprovada, não resultados de entrevistas:

| Necessidade | Percurso planejado | Resultado útil |
|---|---|---|
| Conheço um nome, sigla ou assunto | Home → busca → filtros opcionais → ficha | Encontrar o registro pertinente sem aprender previamente a taxonomia. |
| Quero conhecer o que foi levantado em uma UF | Explorar → território → lista → ficha | Entender o recorte territorial e suas limitações. |
| Tenho um problema, mas não conheço programas | Exemplos de busca ou área da política → lista → descrição | Descobrir nomes e referências, sem promessa de classificação temática aprofundada. |
| Preciso levar uma referência para uma conversa de trabalho | Ficha → referência → copiar link/citação ou imprimir | Reutilizar informação com fonte, data e ressalvas preservadas. |
| Abri uma ficha e quero continuar procurando | Voltar aos resultados | Recuperar termo, filtros e posição, sem refazer a consulta. |

A orientação de [GOV.UK sobre necessidades dos usuários](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) fundamenta organizar o trabalho por tarefas. Aqui essas tarefas serão usadas na avaliação da implementação; pesquisa direta com a Rede poderá refiná-las depois, sem impor ao responsável revisão de fichas em lotes.

## 4. Estrutura e organização

### Página inicial

Manter quatro itens de navegação: **Início, Buscar, Explorar e Sobre**. Usar rótulos mais descritivos nos acessos internos, como “Explorar por território”, “Explorar por área da política” e “Consultar a referência”.

Composição da home, nesta ordem:

1. Logo da Rede e identificação do catálogo.
2. Título, frase de finalidade e campo de busca com rótulo visível e botão.
3. Dois acessos secundários de exploração: área da política e território.
4. Pequeno conjunto de exemplos de busca que ajude a começar, aproveitando os termos existentes.
5. Uma síntese da cobertura, acompanhada de sua limitação como levantamento.
6. Encerramento institucional compacto e rodapé organizado.

A pesquisa não exige reduzir a home a um campo vazio: é preciso explicar o suficiente para a pessoa reconhecer o valor do acervo. Ao mesmo tempo, as explicações e os logos das instituições não devem afastar a consulta. Evitar repetir a mesma introdução na home, na busca e em cada bloco da ficha.

### Explorar

Priorizar **território** e **área da política**. As demais dimensões existentes continuam disponíveis em posição secundária. A página deve mostrar claramente para qual lista cada opção leva, em vez de apresentar várias grades equivalentes competindo entre si.

“Tema” deve ser usado com cuidado: atualmente significa uma área ampla ou um termo pesquisado. Não existe classificação detalhada suficiente para prometer filtros confiáveis por problema, idade, público ou etapa. Exemplos de busca são consultas sugeridas; não constituem novas categorias da base.

Reordenar as 12 sugestões existentes para dar precedência a EJA, alfabetização e educação integrada ao trabalho. O destaque atual a PRONATEC e a sugestão isolada de EaD precisam ser revistos à luz da centralidade editorial. Os resultados continuam descrevendo fielmente as experiências, inclusive quando divergem das diretrizes da Rede.

Manter mapa e comparação como recursos complementares. O vínculo do registro com uma UF não representa atendimento próximo de quem consulta.

## 5. Busca, filtros e resultados

### O que será reaproveitado

A busca já usa Pagefind, com dez resultados por carregamento, quatro filtros, sugestões e apoio a algumas siglas. Já existem páginas estáticas para exploração e consulta sem termo. A proposta não envolve troca do motor nem uma busca avançada nova.

### Contrato visual dos resultados

Cada resultado apresenta, nesta ordem: **nome clicável → território e área disponíveis → trecho descritivo → acesso à ficha**. O título já pode cumprir a função de acesso; evitar dois controles concorrentes sem necessidade. Metadados adicionais só entram se ajudarem a decidir abrir o registro.

Usar lista com separadores ou superfícies discretas, alinhamento consistente e textos confortáveis. “Situação” não deve receber destaque que sugira funcionamento atual confirmado. Ano de criação não será apresentado como data da oferta, e a contagem não será interpretada como número de serviços em funcionamento.

Conservar a ordenação textual disponível e o comando “Mostrar mais”. Não acrescentar “mais recentes”, “mais importantes” ou “melhores” sem dados e necessidade que sustentem essas opções.

### Filtros compreensíveis

- Mostrar termo e total junto dos resultados, mais um resumo dos filtros ativos.
- Permitir remover uma seleção e limpar os filtros sem apagar involuntariamente a consulta textual.
- Priorizar território e área da política; situação e modalidade permanecem como refinamentos complementares, com significado explícito.
- Verificar a lógica de múltiplas seleções: o comportamento esperado a conferir é OU dentro de uma categoria e E entre categorias. A [pesquisa DfE](https://design-histories.education.gov.uk/find-information-about-products-and-services/improving-search-functionality-and-users-expectations-of-the-service) apoia essa hipótese em outro contexto; não é evidência direta sobre nossos usuários.
- Aproveitar o que a interface Pagefind já oferece antes de acrescentar resumo ou controles duplicados.

**Decisão proposta para o celular:** controle “Filtros”, com indicação de seleções, junto da contagem; painel no fluxo da página, sem uma pequena área com rolagem própria; resumo visível quando fechado. Preservar atualização automática se for o comportamento do componente aproveitado, oferecendo “Ver resultados” para fechar o painel e levar a pessoa à lista. Não chamar essa ação de “Aplicar” se a seleção já tiver sido aplicada.

A orientação escocesa prefere aplicação explícita no celular. A adaptação acima é uma proposta de menor complexidade para o componente existente, não uma equivalência comprovada. Antes da implementação definitiva, conferir se a mudança de resultados é percebida e se consulta, seleções e foco permanecem coerentes. Se esse comportamento não for claro, reavaliar a aplicação explícita usando a API pública, sem trocar o motor ou criar uma segunda lógica de filtros.

### Estados obrigatórios

| Estado | Comportamento planejado |
|---|---|
| Nenhum termo digitado | Exemplos e acessos por área/território; não aparentar erro nem prometer que as 366 fichas serão exibidas pela busca vazia. |
| Carregamento | Mensagem curta e perceptível; impedir estado permanente de “buscando” após falha. |
| Resultados | Total, consulta, filtros e continuidade da lista reconhecíveis. |
| Nenhum resultado | Conservar o que foi digitado e selecionado; oferecer ampliar a consulta ou limpar filtros. Ausência de correspondência não significa inexistência da experiência. |
| Falha técnica | Explicar a indisponibilidade e manter caminhos para listagens estáticas. |

Esses estados seguem a distinção de [ICDS — estado vazio](https://design.sis.gov.uk/components/feedback-progress/empty-state/) e as orientações de [resultados de busca do governo escocês](https://designsystem.gov.scot/patterns/search-results), adaptadas ao catálogo.

### Retorno e compartilhamento

A busca ativa hoje restaura o termo e a UF iniciais, mas não sincroniza integralmente as alterações de todos os filtros com a URL. Planejar a preservação do estado efetivamente usado, inclusive ao voltar de uma ficha; restaurar também a quantidade de resultados carregados e a posição quando possível. A URL deve permitir compartilhar termo e filtros; a posição pode ser mantida no estado de navegação.

O código ativo está em `buscar.njk`. O arquivo `assets/js/busca.js` contém lógica legada ligada a elementos ausentes; não deve ser tomado como comprovação de que a preservação já funciona.

## 6. Fichas e reutilização da informação

Manter **Identificação, Finalidade, Território e Referências** abertas. Os títulos precisam ajudar a percorrer a página; os pares rótulo/valor, a compreender o registro. Evitar que todos os campos tenham a mesma ênfase ou que cada item vire um cartão.

A fonte principal, a incerteza sobre funcionamento e notas como a divergência BR/São Paulo permanecem visíveis. Descrições complementares e formatos de citação continuam expansíveis. A redução da repetição deve preservar as lacunas reconhecíveis; não converter falta de informação em “não se aplica”.

Ações propostas, em posição secundária próxima do título: **Copiar link**, **Como citar** e **Imprimir**. Os quatro formatos de citação e a infraestrutura de cópia já existem; aproveitar esses recursos e seu feedback acessível. Não criar conta, lista pessoal ou novo gerador de PDF nesta rodada.

**Correção funcional identificada para a futura execução:** a regra de impressão que oculta `aside` dentro do corpo indexado também alcança as novas notas editoriais. A versão impressa precisa preservar essas observações, as quatro seções, fontes e datas. Conferir ainda os `details` fechados e evitar a impressão de quatro formatos de citação desnecessariamente.

As relações sugeridas entre fichas representam coincidência de campos, não recomendação ou semelhança substantiva validada. Manter sua posição secundária e seu significado claro.

## 7. Beleza e identidade visual

Manter o [logo oficial](https://www.frm.org.br/static/images/pages/projeto/rede-eja/RedeEJA_Logo-Header.svg), cabeçalho branco e a direção da [página da Rede](https://www.frm.org.br/projeto/rede-eja). Roxo `#665A8E` organiza ações; verde-lima `#BFDE42` aparece em pequenas doses; azuis `#5A83CF` e `#79AABD` apoiam a composição. Superfícies claras e texto escuro favorecem continuidade de leitura.

O acabamento será construído com:

- **Hierarquia:** um foco principal por trecho de tela; na entrada é a busca, no resultado é o nome, na ficha é o conteúdo e sua referência.
- **Ritmo:** margens e separadores consistentes, alternância discreta de superfícies e alinhamento em uma grade comum.
- **Tipografia:** IBM Plex Sans já disponível; poucos pesos e tamanhos com funções estáveis. Títulos expressivos sem dominar repetidamente cada tela.
- **Densidade:** espaço suficiente para distinguir informações, conservando resultados úteis visíveis. Não aumentar vazios só para produzir uma primeira imagem mais impactante.
- **Detalhes:** bordas, raios, ícones e estados de interação coerentes. Ícones acompanham rótulos quando o significado não é evidente.
- **Identidade:** poucos arcos ou círculos de apoio, mantendo a marca autêntica. Fotografia só teria lugar com função informativa e material pertinente; não integra esta rodada.

O estudo anterior contém amostras de resultado e ficha abaixo da abertura. Essas amostras são demonstrações de componentes e **não são seções a acrescentar à home real**.

### Correções do estudo preliminar

O estudo estático não foi alterado nesta etapa. Seus pontos a corrigir na próxima proposta são:

1. Há textos móveis essenciais de 12–14 px. Passar a maior parte da leitura para 17–18 px, com 16 px como limite inferior de projeto para texto essencial e 14–16 px para metadados. Não apresentar esses tamanhos como exigência universal da WCAG.
2. Limitar linhas reais de texto contínuo a aproximadamente 60–75 caracteres; o contêiner pode ser amplo, mas os parágrafos não precisam ocupar toda a largura. Ajustar pela fonte e pelo conteúdo efetivos.
3. Manter as quatro opções de navegação visíveis quando couberem com boa leitura; conferir 320 px e texto ampliado, permitindo quebra organizada. Não diminuir a fonte para forçar a composição.
4. Desenhar também busca com filtros abertos/fechados, ausência de resultados, falha e ficha longa. Uma amostra estática sem controles não demonstra usabilidade funcional.
5. Conferir cores nos estados reais. Branco sobre o roxo tem contraste aproximado de 6,14:1; branco sobre os dois azuis do logo não atende ao alvo de texto normal. Não espalhar cores de marca sem verificar o par utilizado.

## 8. Prioridades da implementação futura

| Prioridade | Entrega | Justificativa |
|---|---|---|
| **P1** | Identidade, tipografia, espaçamentos e componentes comuns | Coerência profissional em todas as páginas, com leitura confortável. |
| **P1** | Entrada por busca e exploração, com sugestões alinhadas à EJA | Ajudar tanto quem conhece nomes quanto quem precisa descobrir experiências. |
| **P1** | Resultados legíveis, recorte compreensível e estados completos da busca | Tornar a consulta previsível e recuperável. |
| **P1** | Retorno à lista preservando a consulta | Evitar refazer trabalho a cada ficha aberta. |
| **P1** | Fichas, referências e impressão com ressalvas preservadas | Manter a utilidade e os limites da informação ao ler ou compartilhar. |
| **P2, na mesma rodada se simples** | Cópia direta do link, acesso rápido à citação e acabamento do rodapé | Reaproveitar infraestrutura existente, com pouco código adicional. |
| **Fora desta versão** | Novas taxonomias aprofundadas, recomendações automáticas, rankings, contas e coleções pessoais | Dependem de evidência de necessidade, dados ou manutenção além do escopo. |

A execução pode ser dividida internamente em componentes, percursos e verificação. Isso não cria lotes de revisão para o responsável nem exige nova pesquisa das políticas como condição de entrega.

## 9. Como conferir o resultado

### Tarefas de ponta a ponta

Conferir: localizar uma experiência por nome; descobrir registros por área; entrar por UF sem termo; combinar e desfazer filtros; abrir uma ficha e voltar à mesma consulta; chegar à fonte; copiar uma citação; imprimir uma ficha que tenha nota editorial. Cada tarefa deve terminar com resultado verificável e sem instrução externa do avaliador.

A avaliação feita pela equipe de execução é uma inspeção especializada. Não deve ser apresentada como teste com usuários reais. Quando houver acesso a profissionais da Rede, uma validação curta desses percursos pode refinar o produto, sem exigir que o responsável organize ou revise lotes de fichas.

### Acessibilidade e responsividade

- Conferir desktop e celular, inclusive 320 CSS px, e ampliação de texto. [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Testar teclado, foco, âncoras e cabeçalho fixo; nenhum elemento focado deve ficar encoberto de forma incompatível com o critério. [W3C — Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- Adotar 44 px como meta confortável dos controles principais. Distinguir isso do critério AA de 24 × 24 CSS px, com suas condições e exceções. [W3C — Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Testar ajustes de espaçamento sem perda de conteúdo: entrelinha 1,5, parágrafo 2, letras 0,12 e palavras 0,16 em relação à fonte. São condições de teste, não a obrigação de publicar com esses valores. [W3C — Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).
- Auditar contraste de texto, bordas necessárias, foco e estados; conservar informação textual além de cor. Respeitar preferência por movimento reduzido.

### Validação técnica e visual

Reexecutar testes existentes e build; conferir busca com EJA + DF e múltiplos filtros, links, erros, versão sem JavaScript, impressão e fonte ausente. Capturar telas reais de home, resultados e ficha longa. Manter arquivos de marca/fontes locais e evitar novas bibliotecas para decoração. Não criar testes que apenas repitam tokens cosméticos.

Avaliar separadamente: identidade institucional reconhecível; consistência dos componentes; leitura confortável; previsibilidade do percurso; preservação das ressalvas. Uma imagem bonita e ausência de overflow são necessárias, mas não encerram essa avaliação.

## 10. Arquivos e limites do trabalho

Implementação futura: `site/tailwind.config.js`, CSS global e de impressão, layouts base/ficha, cabeçalho, rodapé, painel da Rede, `index.njk`, `buscar.njk`, `_data/sinonimos.js`, componentes de citação/cópia e arquivos de marca. Ajustes pontuais nas páginas de exploração, UF, mapa e comparação devem seguir os mesmos componentes. Não alterar valores canônicos para simplificar a interface.

Dados, IDs, slugs, schema, vocabulário, planilhas e ETL permanecem fora do escopo. A finalidade pública, presencialidade, trabalho e cuidados e a colaboração com governos continuam orientando a apresentação. Não confundir inclusão no catálogo com recomendação de uma política.

Este documento substitui o plano anterior como referência principal para a próxima implementação. O HTML e as imagens do estudo anterior permanecem como registro visual preliminar. **Pesquisa, implementação e publicação concluídas. O resultado, as correções e as validações estão no [relatório da implementação](IMPLEMENTACAO_DESIGN_E_USABILIDADE_2026-10-04.md).**
