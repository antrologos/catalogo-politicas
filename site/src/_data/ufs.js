/**
 * Lookup de nomes completos das UFs cobertas + planejadas.
 *
 * Decisão E.4 / ADR-010: 9 UFs + Federal estão cobertas.
 * Outras UFs aparecem em /sobre/cobertura/ como "próximas ondas" para
 * combater viés de seleção (E.1.F adversarial blind spot 2).
 */
export default {
  // Cobertas na 1ª onda
  BR: { nome: "Federal (Brasil)", regiao: "Federal", coberta: true },
  SP: { nome: "São Paulo", regiao: "Sudeste", coberta: true },
  RJ: { nome: "Rio de Janeiro", regiao: "Sudeste", coberta: true },
  MG: { nome: "Minas Gerais", regiao: "Sudeste", coberta: true },
  PR: { nome: "Paraná", regiao: "Sul", coberta: true },
  RS: { nome: "Rio Grande do Sul", regiao: "Sul", coberta: true },
  BA: { nome: "Bahia", regiao: "Nordeste", coberta: true },
  PA: { nome: "Pará", regiao: "Norte", coberta: true },
  PE: { nome: "Pernambuco", regiao: "Nordeste", coberta: true },
  CE: { nome: "Ceará", regiao: "Nordeste", coberta: true },

  // Planejadas (ondas futuras)
  AC: { nome: "Acre", regiao: "Norte", coberta: false },
  AL: { nome: "Alagoas", regiao: "Nordeste", coberta: false },
  AM: { nome: "Amazonas", regiao: "Norte", coberta: false },
  AP: { nome: "Amapá", regiao: "Norte", coberta: false },
  DF: { nome: "Distrito Federal", regiao: "Centro-Oeste", coberta: false },
  ES: { nome: "Espírito Santo", regiao: "Sudeste", coberta: false },
  GO: { nome: "Goiás", regiao: "Centro-Oeste", coberta: false },
  MA: { nome: "Maranhão", regiao: "Nordeste", coberta: false },
  MS: { nome: "Mato Grosso do Sul", regiao: "Centro-Oeste", coberta: false },
  MT: { nome: "Mato Grosso", regiao: "Centro-Oeste", coberta: false },
  PB: { nome: "Paraíba", regiao: "Nordeste", coberta: false },
  PI: { nome: "Piauí", regiao: "Nordeste", coberta: false },
  RN: { nome: "Rio Grande do Norte", regiao: "Nordeste", coberta: false },
  RO: { nome: "Rondônia", regiao: "Norte", coberta: false },
  RR: { nome: "Roraima", regiao: "Norte", coberta: false },
  SC: { nome: "Santa Catarina", regiao: "Sul", coberta: false },
  SE: { nome: "Sergipe", regiao: "Nordeste", coberta: false },
  TO: { nome: "Tocantins", regiao: "Norte", coberta: false },
};