/**
 * Glossário de termos e siglas (Sprint F3 do MVP-UX, 2026-05-03).
 *
 * 32 termos cobrindo o jargão técnico mais frequente em políticas de
 * educação de jovens e adultos, qualificação profissional, transferência
 * condicionada e inclusão produtiva. Foi curado a partir de:
 *   - Vocabulário recorrente nas 439 fichas
 *   - Termos institucionais (FNDE, MEC, INEP, CRAS, etc.)
 *   - Formatos acadêmicos para a aba Como citar (ABNT, APA, BibTeX, RIS)
 *
 * Uso:
 *   - Shortcode {% abbr "EJA" %} → <abbr title="Educação de Jovens e Adultos">EJA</abbr>
 *   - Página /sobre/glossario/ itera sobre este array para listagem completa
 *
 * Resolve R2.1-B-H6 (jargão opaco para leigo) e R2.1-B-F2 (trust building
 * + onboarding) atacando a fricção cognitiva que técnico municipal /
 * jornalista / leigo enfrentam ao chegar no catálogo sem ter visto o
 * acrônimo antes.
 */

const termos = [
  // === Educação ===
  {
    sigla: "EJA",
    expansao: "Educação de Jovens e Adultos",
    categoria: "Educação",
    descricao: "Modalidade de ensino destinada a quem não concluiu ensino fundamental ou médio na idade regular. Oferece percursos formativos adaptados (presencial, EAD, semipresencial). Marco legal: LDB 9.394/96.",
  },
  {
    sigla: "PRONATEC",
    expansao: "Programa Nacional de Acesso ao Ensino Técnico e Emprego",
    categoria: "Qualificação profissional",
    descricao: "Política federal criada em 2011 para ampliar a oferta de educação profissional e tecnológica. Atua via Bolsa-Formação para cursos técnicos e de FIC (formação inicial e continuada).",
  },
  {
    sigla: "ENCCEJA",
    expansao: "Exame Nacional para Certificação de Competências de Jovens e Adultos",
    categoria: "Educação",
    descricao: "Exame federal anual que certifica conclusão do ensino fundamental e médio para pessoas de 15+ (fundamental) ou 18+ (médio) que não tiveram oportunidade na idade regular. Substitui supletivo presencial.",
  },
  {
    sigla: "PROEJA",
    expansao: "Programa Nacional de Integração da Educação Profissional com a Educação Básica na Modalidade EJA",
    categoria: "Educação",
    descricao: "Política federal de 2006 que articula ensino fundamental/médio para adultos com formação técnica integrada. Ofertado principalmente pela Rede Federal (IFs).",
  },
  {
    sigla: "MEC",
    expansao: "Ministério da Educação",
    categoria: "Instituição",
    descricao: "Órgão federal responsável pela política educacional brasileira em todos os níveis (básico, técnico, superior).",
  },
  {
    sigla: "FNDE",
    expansao: "Fundo Nacional de Desenvolvimento da Educação",
    categoria: "Instituição",
    descricao: "Autarquia vinculada ao MEC que executa programas de financiamento da educação básica (PNAE, PDDE, PNATE, etc.).",
  },
  {
    sigla: "INEP",
    expansao: "Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira",
    categoria: "Instituição",
    descricao: "Autarquia federal responsável por avaliações educacionais (SAEB, ENEM, ENCCEJA) e Censos da Educação Básica e Superior.",
  },
  {
    sigla: "EAD",
    expansao: "Educação a Distância",
    categoria: "Modalidade",
    descricao: "Modalidade de ensino mediada por tecnologias digitais, sem necessidade de presença física do estudante na maior parte do percurso. Regulamentada por decreto federal.",
  },
  {
    sigla: "FIES",
    expansao: "Fundo de Financiamento Estudantil",
    categoria: "Educação superior",
    descricao: "Programa federal de financiamento a estudantes de cursos superiores não-gratuitos com reembolso após formatura.",
  },
  {
    sigla: "ProUni",
    expansao: "Programa Universidade para Todos",
    categoria: "Educação superior",
    descricao: "Política federal de bolsas integrais e parciais em instituições privadas de ensino superior, vinculada ao desempenho no ENEM.",
  },
  {
    sigla: "IFs",
    expansao: "Institutos Federais de Educação, Ciência e Tecnologia",
    categoria: "Instituição",
    descricao: "Rede de 38 institutos federais (lei 11.892/2008) que oferecem cursos técnicos integrados ao médio, FIC, graduação tecnológica e pós-graduação. Antiga Rede CEFET.",
  },
  {
    sigla: "LDB",
    expansao: "Lei de Diretrizes e Bases da Educação Nacional (Lei 9.394/96)",
    categoria: "Legislação",
    descricao: "Marco legal central da educação brasileira; estabelece princípios, estruturas, modalidades (incluindo EJA) e responsabilidades dos entes federativos.",
  },

  // === Assistência social e transferência de renda ===
  {
    sigla: "BPC",
    expansao: "Benefício de Prestação Continuada",
    categoria: "Assistência social",
    descricao: "Benefício assistencial constitucional (1 salário mínimo) para idosos 65+ ou pessoas com deficiência em famílias de baixa renda. Operacionalizado pelo INSS, financiado pelo SUAS.",
  },
  {
    sigla: "CRAS",
    expansao: "Centro de Referência de Assistência Social",
    categoria: "Assistência social",
    descricao: "Unidade municipal pública do SUAS responsável pela proteção social básica. Porta de entrada para Bolsa Família, BPC, e ações de inclusão produtiva no território.",
  },
  {
    sigla: "CREAS",
    expansao: "Centro de Referência Especializado de Assistência Social",
    categoria: "Assistência social",
    descricao: "Unidade municipal/regional do SUAS para proteção social especial — atende casos de violação de direitos, situação de rua, trabalho infantil.",
  },
  {
    sigla: "SUAS",
    expansao: "Sistema Único de Assistência Social",
    categoria: "Assistência social",
    descricao: "Sistema descentralizado e participativo da política de assistência social (Lei 12.435/2011), análogo ao SUS. Articula CRAS, CREAS, benefícios e serviços.",
  },

  // === Trabalho e emprego ===
  {
    sigla: "SINE",
    expansao: "Sistema Nacional de Emprego",
    categoria: "Trabalho",
    descricao: "Rede pública federal/estadual de intermediação de mão de obra, qualificação profissional e seguro-desemprego. Operada por estados/municípios em convênio com o MTE.",
  },
  {
    sigla: "SENAI",
    expansao: "Serviço Nacional de Aprendizagem Industrial",
    categoria: "Sistema S",
    descricao: "Instituição privada vinculada à CNI (Confederação Nacional da Indústria) que oferta qualificação profissional industrial. Sistema S.",
  },
  {
    sigla: "SENAC",
    expansao: "Serviço Nacional de Aprendizagem Comercial",
    categoria: "Sistema S",
    descricao: "Instituição privada vinculada à CNC (comércio) que oferta qualificação profissional para serviços. Sistema S.",
  },
  {
    sigla: "SESI",
    expansao: "Serviço Social da Indústria",
    categoria: "Sistema S",
    descricao: "Instituição privada vinculada à CNI focada em educação básica para trabalhadores da indústria e suas famílias. Sistema S.",
  },
  {
    sigla: "SESC",
    expansao: "Serviço Social do Comércio",
    categoria: "Sistema S",
    descricao: "Instituição privada vinculada à CNC com atuação em educação, saúde, cultura e lazer para trabalhadores do comércio. Sistema S.",
  },
  {
    sigla: "CBO",
    expansao: "Classificação Brasileira de Ocupações",
    categoria: "Trabalho",
    descricao: "Sistema oficial de codificação de ocupações no Brasil, mantido pelo MTE. Base para qualificação profissional e estatísticas de emprego.",
  },
  {
    sigla: "RAIS",
    expansao: "Relação Anual de Informações Sociais",
    categoria: "Trabalho",
    descricao: "Registro administrativo anual obrigatório para empresas; principal fonte de dados sobre vínculos formais de trabalho no Brasil.",
  },
  {
    sigla: "CAGED",
    expansao: "Cadastro Geral de Empregados e Desempregados",
    categoria: "Trabalho",
    descricao: "Registro mensal de admissões e demissões formais, base para acompanhar mercado de trabalho.",
  },

  // === Estatística e fontes ===
  {
    sigla: "IBGE",
    expansao: "Instituto Brasileiro de Geografia e Estatística",
    categoria: "Instituição",
    descricao: "Fundação pública responsável pelo Censo, PNAD e principais estatísticas oficiais do Brasil.",
  },
  {
    sigla: "IPEA",
    expansao: "Instituto de Pesquisa Econômica Aplicada",
    categoria: "Instituição",
    descricao: "Fundação pública vinculada ao MPO; produz pesquisas e dados sobre políticas públicas e desenvolvimento.",
  },
  {
    sigla: "PNAD",
    expansao: "Pesquisa Nacional por Amostra de Domicílios",
    categoria: "Estatística",
    descricao: "Pesquisa amostral domiciliar contínua do IBGE; principal fonte de dados sobre mercado de trabalho, educação e demografia entre Censos.",
  },

  // === Direito e governança ===
  {
    sigla: "LAI",
    expansao: "Lei de Acesso à Informação (Lei 12.527/2011)",
    categoria: "Legislação",
    descricao: "Garante a qualquer cidadão o direito de acesso a informações de órgãos públicos. Marco da transparência ativa e passiva no Brasil.",
  },
  {
    sigla: "LGPD",
    expansao: "Lei Geral de Proteção de Dados (Lei 13.709/2018)",
    categoria: "Legislação",
    descricao: "Regula o tratamento de dados pessoais por organizações públicas e privadas no Brasil. Inspirada no GDPR europeu.",
  },

  // === Citação acadêmica ===
  {
    sigla: "ABNT",
    expansao: "Associação Brasileira de Normas Técnicas",
    categoria: "Citação acadêmica",
    descricao: "Organização que define normas técnicas brasileiras, incluindo a NBR 6023 (referências bibliográficas), padrão dominante em trabalhos acadêmicos no Brasil.",
  },
  {
    sigla: "BibTeX",
    expansao: "Sistema de citação para LaTeX",
    categoria: "Citação acadêmica",
    descricao: "Formato textual `.bib` para gerenciamento de referências em documentos LaTeX. Importável em Zotero, Mendeley, JabRef.",
  },
  {
    sigla: "RIS",
    expansao: "Research Information Systems format",
    categoria: "Citação acadêmica",
    descricao: "Formato padrão `.ris` de intercâmbio de citações entre gerenciadores bibliográficos (Zotero, Mendeley, EndNote).",
  },
];


// Listar categorias unicas em ordem de primeira aparicao (Nunjucks nao permite
// mutar dict, entao pre-computamos aqui em JS).
const categorias = [];
for (const t of termos) {
  if (!categorias.includes(t.categoria)) categorias.push(t.categoria);
}

export default { termos, categorias };
