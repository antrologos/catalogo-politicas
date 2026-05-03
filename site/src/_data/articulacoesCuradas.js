/**
 * Articulações declaradas curadas humanamente (Sprint 9.3 do F.3, 2026-05-03).
 *
 * Lista PROVISÓRIA de articulações entre políticas, validadas por conhecimento
 * estrutural conhecido. Cada articulação representa uma RELAÇÃO SUBSTANTIVA
 * declarada ou estrutural (não substring matching ruidoso).
 *
 * Usada por _data/grafo.js para gerar edges 'integra' que atravessam o grafo,
 * complementando as 255 edges 'familia' (federal→réplica).
 *
 * Tipos de articulação reconhecidos:
 *   - certificacao: política A certifica/avalia público da política B (ex.: ENCCEJA→EJA)
 *   - condicionalidade: política A condiciona benefício à participação em B (ex.: Bolsa Família→EJA)
 *   - intermediacao: política A intermedia/encaminha para B (ex.: SINE→PRONATEC)
 *   - cadastro: política A cadastra/registra público de B (ex.: CADEJA→EJA)
 *   - integracao_modal: política A integra modalidades de B (ex.: PROEJA = profissional + EJA)
 *   - sucessao: política A é sucessora/atualização de B
 *   - complementaridade: políticas que cobrem dimensões diferentes do mesmo problema
 *
 * Como expandir:
 *   - Adicionar item ao array `articulacoes` abaixo
 *   - source/target = id_interno (pode ser federal ou estadual)
 *   - tipo = um dos valores listados acima
 *   - descricao = explicação curta para tooltip e lista textual
 *   - fonte = onde a articulação está documentada (campo da ficha, lei, etc.)
 *
 * Status atual: 8 articulações iniciais. Lista PROVISÓRIA, requer revisão
 * pela equipe FRM/IESP. Ausência de articulação aqui não significa que não
 * exista — só que ainda não foi curada.
 */

// Articulações entre IDs de política. Curadas a partir do conhecimento
// público sobre o desenho institucional dessas políticas. Apenas relações
// estruturais óbvias e documentadas — lista intencionalmente curta (8 itens)
// para revisão pela equipe FRM/IESP antes de expandir.
const articulacoes = [
  // ENCCEJA certifica conclusão do EJA — relação operacional direta
  {
    source: "FRM-CP-2026-EDU-0004", // ENCCEJA
    target: "FRM-CP-2026-EDU-0001", // EJA
    tipo: "certificacao",
    descricao: "ENCCEJA é o exame federal que certifica conclusão do ensino fundamental e médio para o público da EJA",
    fonte: "Decreto MEC; INEP regulamenta",
  },

  // PROEJA = articulação institucional EJA + Educação Profissional
  {
    source: "FRM-CP-2026-EDU-0005", // PROEJA
    target: "FRM-CP-2026-EDU-0001", // EJA
    tipo: "integracao_modal",
    descricao: "PROEJA integra ensino fundamental/médio para adultos (EJA) com formação técnica integrada",
    fonte: "Decreto 5.840/2006 institui PROEJA como modalidade EJA + EPT",
  },

  // CADEJA é o cadastro do público da EJA
  {
    source: "FRM-CP-2026-EDU-0014", // CADEJA
    target: "FRM-CP-2026-EDU-0001", // EJA
    tipo: "cadastro",
    descricao: "CADEJA é o registro nacional do público atendido pela EJA",
    fonte: "Documentação MEC",
  },

  // Bolsa Família condicionalidade educacional → EJA é caminho válido
  {
    source: "FRM-CP-2026-PSOC-0005", // Bolsa Família
    target: "FRM-CP-2026-EDU-0001",  // EJA
    tipo: "condicionalidade",
    descricao: "Bolsa Família tem condicionalidade de frequência escolar; EJA é caminho válido para adultos do programa",
    fonte: "MDS — condicionalidades educacionais",
  },

  // PRONATEC ↔ SINE: qualifica + intermedia
  {
    source: "FRM-CP-2026-TRAB-0006", // PRONATEC
    target: "FRM-CP-2026-TRAB-0008", // SINE
    tipo: "intermediacao",
    descricao: "PRONATEC qualifica trabalhadores; SINE faz intermediação de mão de obra para colocação após qualificação",
    fonte: "Marco institucional MTE/SETEC",
  },

  // Pacto Nacional EJA ↔ Brasil Alfabetizado: ambos atacam analfabetismo adulto
  {
    source: "FRM-CP-2026-EDU-0003", // Pacto Nacional EJA
    target: "FRM-CP-2026-EDU-0002", // Brasil Alfabetizado
    tipo: "complementaridade",
    descricao: "Pacto Nacional EJA e Brasil Alfabetizado convergem na superação do analfabetismo de adultos",
    fonte: "Documentação MEC — agenda EJA",
  },

  // Pronatec Aprendiz é vertente do PRONATEC
  {
    source: "FRM-CP-2026-TRAB-0007", // Pronatec Aprendiz
    target: "FRM-CP-2026-TRAB-0006", // PRONATEC
    tipo: "complementaridade",
    descricao: "Pronatec Aprendiz é vertente do PRONATEC focada em jovens aprendizes em micro e pequenas empresas",
    fonte: "Programa derivado do PRONATEC",
  },

  // PRONATEC ↔ EJA: PRONATEC oferta também a quem está no EJA via cursos FIC
  {
    source: "FRM-CP-2026-TRAB-0006", // PRONATEC
    target: "FRM-CP-2026-EDU-0001",  // EJA
    tipo: "complementaridade",
    descricao: "PRONATEC oferta cursos FIC compatíveis com público do EJA, formando trilha educação básica + qualificação profissional",
    fonte: "Documentação SETEC/MEC",
  },
];

/**
 * Filtra articulações cujos source/target existem realmente no dataset.
 * Articulações com IDs placeholder ('XXXX') são silenciosamente excluídas
 * — espera-se que a equipe substitua por IDs reais.
 */
export default function curadasValidas(policies) {
  const ids = new Set(policies.map((p) => p.id_interno).filter(Boolean));
  const validas = articulacoes.filter(
    (a) => ids.has(a.source) && ids.has(a.target)
  );
  const placeholders = articulacoes.length - validas.length;
  if (placeholders > 0) {
    // Não bloqueia build; apenas avisa
    console.info(`[articulacoesCuradas] ${validas.length} válidas, ${placeholders} com IDs placeholder (revisar)`);
  }
  return validas;
}

export { articulacoes };