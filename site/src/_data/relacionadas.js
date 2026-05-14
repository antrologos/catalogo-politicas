import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Calcula, para cada ficha **única** (não-réplica), conjuntos de fichas
 * relacionadas que abrem caminhos de descoberta lateral.
 *
 * Saída: objeto indexado por slug, cada valor com 4 chaves:
 *
 *   {
 *     [slug]: {
 *       mesmaFamilia: [], // sempre vazio: réplicas estaduais não geram página
 *       mesmoTipoUf:  [{slug, nome, uf, situacao_classe, situacao, tipo}],
 *       mesmaModalidadeUf: [{slug, nome, uf, situacao_classe, situacao, modalidade}],
 *       apareceEm:    [{uf, situacao, situacao_classe, orgao_local}]
 *     }
 *   }
 *
 * Regras:
 *   - apareceEm: apenas para canônica federal — lista das UFs onde a política
 *     é aplicada, com órgão executor local. Link aponta para /uf/<sigla>/
 *     (réplicas não têm página própria desde a dedup de 2026-05-13).
 *   - mesmoTipoUf: top 5 fichas únicas com mesmo tipo_politica + mesma uf,
 *     excluindo a própria; ordenadas alfabeticamente.
 *   - mesmaModalidadeUf: top 3 fichas únicas com mesma modalidade_oferta +
 *     mesma uf, excluindo as que já estão em mesmoTipoUf.
 *   - mesmaFamilia: vazio. A informação foi absorvida por apareceEm (federal)
 *     e por "Execução por estado" (via executacoes.js) na própria ficha federal.
 *
 * NB: integra_outras_politicas é texto livre (817 itens, 0 batem com
 * id_interno) — não dereferenciamos.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return {};

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

  // Conjunto único usado para "mesmo tipo/modalidade na UF" — réplicas saem.
  const unicas = raw.filter((p) => !p.is_federal_replica);

  const result = {};
  for (const ficha of unicas) {
    if (!ficha.slug) continue;
    result[ficha.slug] = {
      mesmaFamilia: [],
      mesmoTipoUf: mesmoTipoUfDe(ficha, unicas),
      mesmaModalidadeUf: mesmaModalidadeUfDe(ficha, unicas),
      apareceEm: apareceEmDe(ficha, familias),
    };
  }
  return result;
}

function mesmoTipoUfDe(ficha, pool) {
  if (!ficha.tipo_politica || !ficha.uf) return [];
  return pool
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

function mesmaModalidadeUfDe(ficha, pool) {
  if (!ficha.modalidade_oferta || !ficha.uf) return [];
  const jaListadas = new Set(
    mesmoTipoUfDe(ficha, pool).map((p) => p.slug)
  );
  return pool
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
      uf: r.uf,
      situacao: r.situacao_atual,
      situacao_classe: situacaoClasse(r.situacao_atual),
      orgao_local: orgaoLocalDe(r),
    }))
    .sort((a, b) => (a.uf || "").localeCompare(b.uf || ""));
}

function orgaoLocalDe(r) {
  if (r.orgaos_responsaveis_com_especificacoes) {
    return r.orgaos_responsaveis_com_especificacoes;
  }
  if (Array.isArray(r.orgaos_responsaveis) && r.orgaos_responsaveis.length) {
    return r.orgaos_responsaveis.join(", ");
  }
  if (typeof r.orgaos_responsaveis === "string") {
    return r.orgaos_responsaveis;
  }
  return null;
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