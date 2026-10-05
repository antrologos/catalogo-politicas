# Apresentação pública do catálogo

Pedido do usuário: substituir o subtítulo pela formulação sobre Educação de Jovens, Adultos e Idosos no Brasil; retirar a restrição ao público da Rede; revisar linguagem interna e apresentação de avisos como cards/citações.

Escopo aprovado pelo pedido: home e metadados, notas metodológicas compartilhadas, listas de navegação em Início/Explorar/Buscar, indicadores de UF/categoria, rodapé e páginas institucionais em Sobre. Preservar dados das políticas, referências, quatro seções das fichas, identidade da Rede e diretrizes substantivas internas.

Implementação: usar texto corrido legível para ressalvas, divisórias horizontais discretas e links com identificação visual, reduzindo caixas e fundos decorativos. Reescrever textos institucionais para quem consulta o produto público, sem instruções à equipe ou jargão de desenvolvimento. Corrigir descrições institucionais desatualizadas confrontando com recursos existentes.

Validação: testes Node existentes, build completo, inspeção de telas desktop e celular, navegação e ressalvas legíveis. Commit/push e publicação com autorização persistente da sessão; conferir CI e endereço público.

Status: implementação concluída; validação local aprovada; publicação em andamento.

## Ajuste de escopo durante a execução

O usuário apontou advertências desnecessárias sobre EaD em materiais didáticos e no Cadeja, além da repetição de “Entenda os limites do levantamento”. Retirar advertências genéricas dos templates e das descrições; manter fatos sobre organização do ensino e lacunas concretas de cada experiência. Usar “Metodologia e fontes” e “Cobertura do catálogo” nos links.

As correções de redação nos manifestos existentes não representam nova consulta externa, não alteram referências, datas de consulta, níveis de evidência ou categorias. Registrar antes/depois em auditoria própria, gerar nova versão datada sem sobrescrever o derivado anterior e conferir diferenças/identidades/schema. Os relatórios de origem permanecem intocados.

## Entrada pelo mapa

O usuário pediu uma home mais atraente e identificou o mapa interativo como recurso escondido. Integrar o mapa existente à primeira página como entrada por território, manter a busca em destaque e acrescentar Mapa à navegação principal. Preservar lista alternativa, interação por teclado e celular, e a distinção entre contagens do acervo e oferta territorial.

## Implementação e verificação local

- Home reorganizada com busca, mapa compartilhado, acesso à esfera federal e lista alternativa de 27 UFs. Navegação principal com Início, Buscar, Mapa, Explorar e Sobre.
- Identidade da Rede preservada; apresentação e páginas institucionais revistas para consulta pública, com notas em texto corrido.
- 33 campos editoriais em 29 fichas ajustados, propagados às réplicas federais vinculadas; referências, datas de consulta, IDs, categorias e níveis de evidência preservados. Auditoria antes/depois versionada. Derivado anterior intacto.
- 1.180 registros validados; 48 testes Python específicos e 47 testes Node aprovados; build com 447 HTML e índice de 388 fichas.
- QA em 19 combinações de páginas/larguras, 315 links e âncoras, busca com filtro e abertura de ficha, sem erros ou overflow. Mapa: 27 UFs e 13 percursos com mouse, toque, Enter e Espaço; lista alternativa/sem JavaScript e troca de métrica aprovados. Inspeção visual de home em 1440/390/320 px.
- Corrigida marcação do breadcrumb em páginas Markdown; dois testes reproduzem e protegem a correção. Ajuste do menu para cinco links em telas de 320 px.
- Verificação de redação nos 447 HTML: removidas as três formulações apontadas pelo usuário (advertência sobre materiais digitais, descrição genérica das categorias e chamada repetida sobre limites).

- Conferência focal final: home e páginas AM/SP/CE/DF em 320 px, antes e depois do filtro Educacional, sem overflow. Limitada a largura dos controles de filtros de UF; cinco links principais permanecem na mesma linha.
