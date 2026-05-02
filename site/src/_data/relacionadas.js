import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Calcula, para cada ficha, conjuntos de fichas relacionadas que abrem
 * caminhos de descoberta lateral (Sprint EX.3).
 *
 * Saída: objeto indexado por slug, cada valor com 4 chaves:
 *
 *   {
 *     [slug]: {
 *       mesmaFamilia: [{slug, nome, uf, situacao_classe, situacao}],
 *       mesmoTipoUf:  [{slug, nome, uf, situacao_classe, situacao, tipo}],
 *       mesmaModalidadeUf: [{slug, nome, uf, situacao_classe, situacao, modalidade}],
 *       apareceEm:    [{slug, nome, uf, situacao_classe, situacao}]
 *     }
 *   }
 *
 * Regras:
 *   - mesmaFamilia: para uma réplica (is_federal_replica), todas as outras
 *     réplicas + a canônica federal. Para a canônica (uf=BR), suas réplicas
 *     em UFs estaduais. Vazio para estaduais únicas.
 *   - mesmoTipoUf: top 5 fichas com mesmo tipo_politica + mesma uf, excluindo
 *     a própria; ordenadas alfabeticamente.
 *   - mesmaModalidadeUf: top 3 fichas com mesma modalidade_oferta + mesma uf,
 *     excluindo a própria e excluindo as que já apareceriam em mesmoTipoUf
 *     (evita repetição visual).
 *   - apareceEm: para canônica federal apenas, lista das réplicas (apenas
 *     UF + slug + nome), para chips no topo da ficha. Vazio em qualquer
 *     outra situação.
 *
 * NB: integra_outras_politicas é texto livre (817 itens, 0 batem com
 * id_interno, apenas 24 com nome) — não dereferenciamos. O texto integral
 * permanece visível na aba "Detalhes" da própria ficha.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return {};

  // Index por id_interno → ficha (para resolver federal_source_id)
  const porId = new Map();
  for (const p of raw) {
    if (p.id_interno) porId.set(p.id_interno, p);
  }

  // Index famílias federais: federal_source_id → [réplicas]
  const familias = new Map();
  for (const p of raw) {
    if (p.is_federal_replica && p.federal_source_id) {
      if (!familias.has(p.federal_source_id)) {
        familias.set(p.federal_source_id, []);
      }
      familias.get(p.federal_source_id).push(p);
    }
  }

  const result = {};
  for (const ficha of raw) {
    if (!ficha.slug) continue;
    result[ficha.slug] = computar(ficha, raw, porId, familias);
  }
  return result;
}

function computar(ficha, raw, porId, familias) {
  return {
    mesmaFamilia: mesmaFamiliaDe(ficha, porId, familias),
    mesmoTipoUf: mesmoTipoUfDe(ficha, raw),
    mesmaModalidadeUf: mesmaModalidadeUfDe(ficha, raw),
    apareceEm: apareceEmDe(ficha, familias),
  };
}

function mesmaFamiliaDe(ficha, porId, familias) {
  // Caso 1: ficha é réplica → família = canônica + outras réplicas
  if (ficha.is_federal_replica && ficha.federal_source_id) {
    const fam = [];
    const canonica = porId.get(ficha.federal_source_id);
    if (canonica) fam.push(canonica);
    const replicas = familias.get(ficha.federal_source_id) || [];
    for (const r of replicas) {
      if (r.slug !== ficha.slug) fam.push(r);
    }
    return fam.map(simplificar).sort(ordenarUf);
  }

  // Caso 2: ficha é canônica federal (uf=BR, !is_federal_replica) → réplicas
  if (ficha.uf === "BR" && !ficha.is_federal_replica && ficha.id_interno) {
    const replicas = familias.get(ficha.id_interno) || [];
    return replicas.map(simplificar).sort(ordenarUf);
  }

  // Caso 3: estadual única → sem família
  return [];
}

function mesmoTipoUfDe(ficha, raw) {
  if (!ficha.tipo_politica || !ficha.uf) return [];
  return raw
    .filter(
      (p) =>
        p.slug !== ficha.slug &&
        p.uf === ficha.uf &&
        p.tipo_politica === ficha.tipo_politica
    )
    .map(simplificar)
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    .slice(0, 5);
}

function mesmaModalidadeUfDe(ficha, raw) {
  if (!ficha.modalidade_oferta || !ficha.uf) return [];
  // Excluir as que já apareceriam em mesmoTipoUf (evita repetição visual)
  const jaListadas = new Set(
    mesmoTipoUfDe(ficha, raw).map((p) => p.slug)
  );
  return raw
    .filter(
      (p) =>
        p.slug !== ficha.slug &&
        p.uf === ficha.uf &&
        p.modalidade_oferta === ficha.modalidade_oferta &&
        !jaListadas.has(p.slug)
    )
    .map(simplificar)
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    .slice(0, 3);
}

function apareceEmDe(ficha, familias) {
  // Apenas para canônica federal: chips de "executada em" cada UF
  if (
    ficha.uf !== "BR" ||
    ficha.is_federal_replica ||
    !ficha.id_interno
  ) {
    return [];
  }
  const replicas = familias.get(ficha.id_interno) || [];
  return replicas
    .map((r) => ({
      slug: r.slug,
      nome: r.nome,
      uf: r.uf,
      situacao: r.situacao_atual,
      situacao_classe: situacaoClasse(r.situacao_atual),
    }))
    .sort(ordenarUf);
}

function simplificar(p) {
  return {
    slug: p.slug,
    nome: p.nome,
    uf: p.uf,
    situacao: p.situacao_atual,
    situacao_classe: situacaoClasse(p.situacao_atual),
    tipo: p.tipo_politica,
    modalidade: p.modalidade_oferta,
  };
}

function ordenarUf(a, b) {
  // BR primeiro (canônica), depois UFs em ordem alfabética
  if (a.uf === "BR") return -1;
  if (b.uf === "BR") return 1;
  return (a.uf || "").localeCompare(b.uf || "");
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