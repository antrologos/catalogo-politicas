/**
 * Estrutura institucional e equipe do Catálogo de Políticas.
 *
 * Fonte: créditos oficiais fornecidos pela coordenação.
 * Quando atualizar nomes, instituições ou papéis, atualize APENAS este arquivo
 * e a página /sobre/ + footer + LICENSE/CITATION.cff serão regenerados em build.
 */
export default {
  projeto: "Catálogo de Políticas",
  // Desde 2026-10-04 o catálogo é produto permanente da Rede EJA (listado em
  // "Evidências" na página da Rede). O projeto abaixo é só a origem histórica
  // do levantamento; não entra mais no título nem na citação.
  programaGuarda: "Projeto Juventudes Fora da Escola sem Educação Básica",
  iniciativa: "Rede EJA e Inclusão Produtiva",
  redeUrl: "https://www.frm.org.br/projeto/rede-eja",

  realizadores: [
    { nome: "Fundação Roberto Marinho", sigla: "FRM", url: "https://www.frm.org.br/" },
    { nome: "Fundação Bradesco", sigla: "Fundação Bradesco", url: "https://fundacao.bradesco/" },
  ],

  parceiros: [
    { nome: "Fundação Itaú Educação e Trabalho", sigla: "Fundação Itaú", url: "https://www.itaueducacaoetrabalho.org.br/" },
    { nome: "Fundação Arymax", sigla: "Arymax", url: "https://arymax.org.br/" },
  ],

  cooperacao: [
    { nome: "UNESCO — Organização das Nações Unidas para a Educação, a Ciência e a Cultura", sigla: "UNESCO", url: "https://www.unesco.org/pt" },
  ],

  parceriaTecnica: [
    {
      nome: "Centro para o Estudo da Riqueza e da Estratificação Social",
      sigla: "Ceres/IESP-UERJ",
      url: "https://iesp.uerj.br/nucleo/ceres/",
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

  // As 16 instituições que compõem a Rede EJA e Inclusão Produtiva, na ordem e
  // nas linhas (5/5/6) da barra oficial da Rede em frm.org.br/projeto/rede-eja.
  // `logos`: arquivos em src/assets/img/rede/, baixados dos sites oficiais (ou
  // de PDFs/Commons) em 2026-10-04. URLs verificadas na mesma data.
  // Consumido por components/painel-rede.njk.
  redeEja: [
    { nome: "Ação Educativa", url: "https://acaoeducativa.org.br/", linha: 1, logos: ["acao-educativa.png"] },
    { nome: "Ashoka", url: "https://www.ashoka.org/pt-br", linha: 1, logos: ["ashoka.svg"] },
    { nome: "Conhecimento Social – estratégia e gestão", url: "https://conhecimentosocial.com/", linha: 1, logos: ["conhecimento-social.png"] },
    // CN SESI: certificado HTTPS vencido em 03/10/2026 (aviso de segurança no
    // navegador); o site responde por HTTP sem redirecionar. Voltar a https://
    // quando o certificado for renovado.
    { nome: "Conselho Nacional do SESI", url: "http://www.cnsesi.com.br/", linha: 1, logos: ["conselho-nacional-sesi.png"] },
    { nome: "Fundação Arymax", url: "https://arymax.org.br/", linha: 1, logos: ["fundacao-arymax.png"] },
    { nome: "Fundação Bradesco", url: "https://fundacao.bradesco/", linha: 2, logos: ["fundacao-bradesco.svg"] },
    { nome: "Fundação Itaú — Itaú Educação e Trabalho", url: "https://www.itaueducacaoetrabalho.org.br/", linha: 2, logos: ["fundacao-itau.svg", "itau-educacao-e-trabalho.png"] },
    { nome: "Fundação Roberto Marinho", url: "https://www.frm.org.br/", linha: 2, logos: ["fundacao-roberto-marinho.png"] },
    { nome: "GIFE — Grupo de Institutos, Fundações e Empresas", url: "https://gife.org.br/", linha: 2, logos: ["gife.svg"] },
    { nome: "Instituto Rodrigo Mendes", url: "https://institutorodrigomendes.org.br/", linha: 2, logos: ["instituto-rodrigo-mendes.png"] },
    { nome: "Pacto Global da ONU — Rede Brasil", url: "https://www.pactoglobal.org.br/", linha: 3, logos: ["pacto-global.svg"] },
    { nome: "Redes da Maré", url: "https://www.redesdamare.org.br/", linha: 3, logos: ["redes-da-mare.png"] },
    { nome: "Todos Pela Educação", url: "https://todospelaeducacao.org.br/", linha: 3, logos: ["todos-pela-educacao.png"] },
    { nome: "UNESCO", url: "https://www.unesco.org/pt/fieldoffice/brasilia", linha: 3, logos: ["unesco.svg"] },
    { nome: "UNICEF", url: "https://www.unicef.org/brazil/", linha: 3, logos: ["unicef.png"] },
    { nome: "United Way Brasil — Juventudes Potentes", url: "https://www.uwb.org.br/", linha: 3, logos: ["juventudes-potentes-united-way.png"] },
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
  // 2026-10-04 (v1.0): obra e editora passam a ser a Rede EJA.
  atribuicaoCitacao: "BARBOSA, R. J. (org.). Catálogo de Políticas da Rede EJA e Inclusão Produtiva. Versão 1.0. Rio de Janeiro: Rede EJA e Inclusão Produtiva, 2026.",
};