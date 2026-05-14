import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Para cada uma das 4 dimensões com vocabulário fechado relevantes para
 * páginas índice (Sprint EX.2), gera array de objetos:
 *
 *   { valor, slug, count, fichas: [{slug, nome, uf, situacao, snapshot}],
 *     porUf: { SP: 12, RJ: 8 }, porSituacao: { Ativa: 30, Encerrada: 2 } }
 *
 * Esse array é consumido por templates Eleventy via `pagination.data` para
 * gerar 1 página por valor (ex.: /tipo/educacional-direta/).
 *
 * Dimensões cobertas:
 *   - tipo_politica (3 valores)
 *   - situacao_atual (4-5 valores)
 *   - modalidade_oferta (5-7 valores)
 *   - abrangencia_territorial (4 valores)
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return defaults();

  // Réplicas federais não aparecem em listagens por dimensão — quem aparece
  // é a federal canônica (registrada uma única vez).
  const unicas = raw.filter((p) => !p.is_federal_replica);

  return {
    tipo: agrupar(unicas, "tipo_politica"),
    situacao: agrupar(unicas, "situacao_atual"),
    modalidade: agrupar(unicas, "modalidade_oferta"),
    abrangencia: agrupar(unicas, "abrangencia_territorial"),
  };
}

function agrupar(raw, campo) {
  // Map valor → array de fichas
  const grupos = new Map();
  for (const p of raw) {
    const valor = p[campo];
    if (!valor) continue;
    if (!grupos.has(valor)) grupos.set(valor, []);
    grupos.get(valor).push(p);
  }

  const result = [];
  for (const [valor, fichas] of grupos.entries()) {
    const porUf = countBy(fichas, "uf");
    const porSituacao = countBy(fichas, "situacao_atual");
    const ativas = fichas.filter(
      (p) =>
        (p.situacao_atual || "").toLowerCase().includes("ativa") ||
        (p.situacao_atual || "").toLowerCase().includes("execução")
    ).length;
    result.push({
      valor,
      slug: slugify(valor),
      count: fichas.length,
      ativas,
      porUf,
      porSituacao,
      fichas: fichas
        .map((p) => ({
          slug: p.slug,
          nome: p.nome,
          uf: p.uf,
          tipo: p.tipo_politica,
          situacao: p.situacao_atual,
          situacao_classe: situacaoClasse(p.situacao_atual),
          modalidade: p.modalidade_oferta,
          abrangencia: p.abrangencia_territorial,
          isFederalReplica: false,
        }))
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")),
    });
  }

  // Ordenar grupos por contagem desc para apresentação consistente
  return result.sort((a, b) => b.count - a.count);
}

function countBy(arr, key) {
  const acc = {};
  for (const item of arr) {
    const v = item[key];
    if (v == null) continue;
    acc[v] = (acc[v] || 0) + 1;
  }
  return acc;
}

function situacaoClasse(s) {
  if (!s) return "outras";
  const lower = s.toLowerCase();
  if (lower.includes("ativa") || lower.includes("execução")) return "ativa";
  if (lower.includes("descontinuada")) return "descontinuada";
  if (lower.includes("encerrada")) return "encerrada";
  if (lower.includes("suspensa") || lower.includes("pausada")) return "suspensa";
  if (lower.includes("planejamento")) return "planejamento";
  return "outras";
}

function slugify(s) {
  if (typeof s !== "string") return "";
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function defaults() {
  return { tipo: [], situacao: [], modalidade: [], abrangencia: [] };
}