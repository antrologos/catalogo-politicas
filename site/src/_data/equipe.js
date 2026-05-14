/**
 * Estrutura institucional e equipe do Catálogo de Políticas.
 *
 * Fonte: créditos oficiais fornecidos pela coordenação.
 * Quando atualizar nomes, instituições ou papéis, atualize APENAS este arquivo
 * e a página /sobre/ + footer + LICENSE/CITATION.cff serão regenerados em build.
 */
export default {
  projeto: "Catálogo de Políticas",
  programaGuarda: "Projeto Juventudes Fora da Escola sem Educação Básica",
  iniciativa: "Rede EJA e Inclusão Produtiva",

  realizadores: [
    { nome: "Fundação Roberto Marinho", sigla: "FRM", url: "https://www.frm.org.br/" },
    { nome: "Fundação Bradesco", sigla: "Fundação Bradesco", url: "https://www.fundacaobradesco.org.br/" },
  ],

  parceiros: [
    { nome: "Fundação Itaú Educação e Trabalho", sigla: "Fundação Itaú", url: "https://www.fundacaoitau.org.br/educacao-e-trabalho" },
    { nome: "Fundação Arymax", sigla: "Arymax", url: "https://arymax.org.br/" },
  ],

  cooperacao: [
    { nome: "UNESCO — Organização das Nações Unidas para a Educação, a Ciência e a Cultura", sigla: "UNESCO", url: "https://www.unesco.org/pt" },
  ],

  parceriaTecnica: [
    {
      nome: "Centro para o Estudo da Riqueza e da Estratificação Social",
      sigla: "Ceres/IESP-UERJ",
      url: "https://ceres-iesp.uerj.br/",
    },
    {
      nome: "Laboratório de Monitoramento e Avaliação de Políticas e Eleições",
      sigla: "MAPE/IESP-UERJ",
      url: "https://mape.org.br/",
    },
    {
      nome: "Instituto de Estudos Sociais e Políticos",
      sigla: "IESP-UERJ",
      url: "http://www.iesp.uerj.br/",
    },
  ],

  // Instituições que compõem a Rede EJA e Inclusão Produtiva — distinta de
  // "realizadores", "parceiros" e "cooperação" deste catálogo: compor a Rede
  // não significa cooperação técnica direta nesta pesquisa.
  // Ordem definida pela coordenação (mantida idêntica ao enunciado de origem).
  // URLs deixadas em branco para revisão humana antes do preenchimento.
  redeEja: [
    { nome: "Ashoka", url: null },
    { nome: "Associação Redes de Desenvolvimento da Maré", url: null },
    { nome: "Conhecimento Social", url: null },
    { nome: "Conselho Nacional do SESI", url: null },
    { nome: "Fundação Arymax", url: "https://arymax.org.br/" },
    { nome: "Fundação Bradesco", url: "https://www.fundacaobradesco.org.br/" },
    { nome: "Fundação Roberto Marinho", url: "https://www.frm.org.br/" },
    { nome: "GIFE", url: null },
    { nome: "Instituto Rodrigo Mendes", url: null },
    { nome: "Pacto Global da ONU", url: null },
    { nome: "Todos pela Educação", url: null },
    { nome: "United Way Brasil — Juventudes Potentes", url: null },
    { nome: "Fundação Itaú — Itaú Educação e Trabalho", url: "https://www.fundacaoitau.org.br/educacao-e-trabalho" },
    { nome: "UNICEF", url: null },
    { nome: "Ação Educativa", url: null },
    { nome: "UNESCO", url: "https://www.unesco.org/pt" },
  ],

  coordenacao: [
    { nome: "Rogério Jerônimo Barbosa", papel: "Coordenação Geral" },
    { nome: "Hellen Guicheney", papel: "Gerência Técnica e Integração das Equipes" },
    { nome: "Bruno Schaefer", papel: "Coordenação da frente OQF" },
    { nome: "Maria Clara da Gama", papel: "Coordenação da frente de Políticas" },
  ],

  pesquisa: [
    { nome: "Maria Clara da Gama", papel: "Coordenação da pesquisa" },
    { nome: "Maria Julieta Ramalho Garcia", papel: "Pesquisa" },
    { nome: "Cintia Maria Frazão", papel: "Pesquisa" },
    { nome: "Jaqueline Sant'ana", papel: "Pesquisa" },
  ],

  designSite: [
    { nome: "Rogério Jerônimo Barbosa", papel: "Design do aplicativo e site" },
  ],

  // Atribuição curta para citação acadêmica e meta tags.
  // Sprint 9.8: removido parêntese institucional `(FRM, Fundação Bradesco, ...)`
  // por decisão da usuária — instituições aparecem na seção /sobre/, não
  // embutidas em texto corrido.
  atribuicaoCurta: "Catálogo de Políticas — Rede EJA e Inclusão Produtiva",
  // Citação do CATÁLOGO INTEIRO (não do verbete individual). Para citar uma
  // ficha, usar os filtros `citacaoAbnt`/`citacaoApa`/`citacaoBibtex`/`citacaoRis`
  // em eleventy.config.js, que usam a equipe de pesquisa como autores.
  atribuicaoCitacao: "BARBOSA, R. J. (org.). Catálogo de Políticas — Projeto Juventudes Fora da Escola sem Educação Básica. Rede EJA e Inclusão Produtiva. Rio de Janeiro: Ceres/IESP-UERJ, 2026.",
};