/**
 * Sinônimos curados para busca (Sprint F1 do MVP-UX, 2026-05-03).
 *
 * Pagefind 1.5 NÃO tem fuzzy nem sinônimos nativos (R2.2 confirmou). O caminho
 * recomendado pelo time Pagefind é injetar aliases como meta no documento via
 * <span data-pagefind-meta="aliases">termo1 · termo2 · termo3</span>, fazendo
 * com que o índice trate esses termos como conteúdo da página.
 *
 * Este arquivo exporta para cada slug canônico de ficha federal os aliases
 * que devem ser indexados além do nome oficial. Cobre principalmente:
 *   - Siglas vs nome completo (EJA ↔ Educação de Jovens e Adultos)
 *   - Vocabulário coloquial (curso pra adulto trabalhar ↔ EJA + PRONATEC)
 *   - Variações ortográficas (PROEJA, Proeja)
 *
 * Resolve R2.1-B-J5 ("encontrou em reportagem, busca por isso") e R2.1-B-J8
 * ("técnico municipal sem jargão").
 */

// Aliases por slug (~30 fichas federais — replicas estaduais herdam via mesma lógica de busca)
export const aliasesPorSlug = {
  "educacao-de-jovens-e-adultos-eja-br": [
    "EJA",
    "ensino para adultos",
    "estudar à noite",
    "voltar a estudar",
    "supletivo",
    "ensino noturno",
    "alfabetização de adultos",
    "ensino fundamental para adultos",
    "ensino médio para adultos",
  ],
  "programa-nacional-de-acesso-ao-ensino-tecnico-e-emprego-pronatec-br": [
    "PRONATEC",
    "Pronatec",
    "curso técnico gratuito",
    "qualificação profissional",
    "FIC",
    "formação inicial e continuada",
    "Bolsa-Formação",
  ],
  "exame-nacional-para-certificacao-de-competencias-de-jovens-e-adultos-encceja-br": [
    "ENCCEJA",
    "Encceja",
    "certificação ensino fundamental",
    "certificação ensino médio",
    "exame supletivo",
    "prova para terminar ensino médio",
  ],
  "programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-na-modalidade-de-educacao-de-jovens-br": [
    "PROEJA",
    "Proeja",
    "EJA profissional",
    "educação profissional para adultos",
  ],
  "bolsa-familia-br": [
    "Bolsa Família",
    "BF",
    "PBF",
    "transferência de renda",
    "auxílio às famílias",
    "programa social",
    "renda mínima",
  ],
  "pronatec-aprendiz-na-micro-e-pequena-empresa-br": [
    "Pronatec Aprendiz",
    "jovem aprendiz",
    "primeiro emprego",
    "aprendizagem profissional",
  ],
  "cadastro-da-eja-cadeja-br": [
    "CADEJA",
    "cadastro EJA",
  ],
  "pacto-nacional-pela-superacao-do-analfabetismo-e-qualificacao-da-eja-pacto-nacional-da-eja-br": [
    "Pacto Nacional EJA",
    "alfabetização adultos",
    "Brasil Alfabetizado",
  ],
};

/**
 * Buscas comuns sugeridas no zero-result e no estado vazio da busca.
 * Cada entrada vira um chip clicável que dispara a busca via ?q=.
 *
 * Ordenadas por demanda esperada (siglas conhecidas primeiro, depois temas
 * amplos, depois UFs específicas).
 */
export const buscasComuns = [
  { q: "PRONATEC", label: "PRONATEC", contexto: "Curso técnico gratuito" },
  { q: "EJA", label: "EJA", contexto: "Educação de Jovens e Adultos" },
  { q: "Bolsa Família", label: "Bolsa Família", contexto: "Transferência de renda" },
  { q: "ENCCEJA", label: "ENCCEJA", contexto: "Certificação supletiva" },
  { q: "qualificação profissional", label: "Qualificação profissional", contexto: "Tema amplo" },
  { q: "alfabetização", label: "Alfabetização", contexto: "Tema amplo" },
  { q: "jovem aprendiz", label: "Jovem aprendiz", contexto: "Primeiro emprego" },
  { q: "transferência de renda", label: "Transferência de renda", contexto: "Tema amplo" },
  { q: "EAD", label: "EAD", contexto: "Educação a distância" },
  { q: "SINE", label: "SINE", contexto: "Intermediação de mão de obra" },
  { q: "PROEJA", label: "PROEJA", contexto: "EJA profissional" },
  { q: "CRAS", label: "CRAS", contexto: "Assistência social" },
];

export default { aliasesPorSlug, buscasComuns };