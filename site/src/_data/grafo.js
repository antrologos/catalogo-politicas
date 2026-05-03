/**
 * Dados do grafo de relacionamentos (Sprint 9.1 do Bloco F.3, 2026-05-03).
 *
 * Prepara nodes + edges para Cytoscape v3 renderizar em /grafo/.
 *
 * Estrutura final (formato Cytoscape canônico):
 *   {
 *     nodes: [
 *       { data: { id, label, type, uf, tipo, slug, ... } },
 *       ...
 *     ],
 *     edges: [
 *       { data: { id, source, target, type } },
 *       ...
 *     ]
 *   }
 *
 * Categorias de node:
 *   - federal      (33): política federal canônica (uf=BR, !is_federal_replica)
 *   - replica      (255): réplica estadual de uma federal
 *   - estadual     (151): política exclusivamente estadual (sem família federal)
 *
 * Edges (Sprint 9.1 cobre apenas):
 *   - familia      (255): federal → replica
 *
 * Sprint 9.3 vai adicionar:
 *   - integra      (estimado ~50): node ↔ node por integra_outras_politicas (parsing NLP simples)
 *
 * Total atual: 439 nodes, 255 edges.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

export default function () {
  const policies = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(policies)) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];

  for (const p of policies) {
    let type;
    if (p.uf === "BR" && !p.is_federal_replica) {
      type = "federal";
    } else if (p.is_federal_replica) {
      type = "replica";
    } else {
      type = "estadual";
    }

    nodes.push({
      data: {
        id: p.id_interno,
        slug: p.slug,
        label: shortLabel(p.nome, type),
        nomeCompleto: p.nome,
        type,
        uf: p.uf,
        tipo: p.tipo_politica || "Sem classificação",
        situacao: p.situacao_atual || "Sem informação",
        situacao_classe: situacaoClasse(p.situacao_atual),
      },
    });

    // Edge familia: replica → federal canônica (source=replica, target=federal)
    if (type === "replica" && p.federal_source_id) {
      edges.push({
        data: {
          id: `e-fam-${p.id_interno}`,
          source: p.id_interno,
          target: p.federal_source_id,
          type: "familia",
        },
      });
    }
  }

  // Estatísticas para o template
  const stats = {
    totalNodes: nodes.length,
    federais: nodes.filter((n) => n.data.type === "federal").length,
    replicas: nodes.filter((n) => n.data.type === "replica").length,
    estaduais: nodes.filter((n) => n.data.type === "estadual").length,
    totalEdges: edges.length,
  };

  return { nodes, edges, stats };
}

/**
 * Label curto: para federal, sigla extraída entre parênteses se existir;
 * para replica, sigla da UF; para estadual, primeiras 30 chars do nome.
 */
function shortLabel(nome, type) {
  if (!nome) return "?";
  if (type === "replica") {
    return nome.length > 25 ? nome.substring(0, 22) + "…" : nome;
  }
  // Tenta extrair sigla entre parênteses (PRONATEC, EJA, ENCCEJA, etc.)
  const m = nome.match(/\(([A-Z][A-Z0-9-]{1,15})\)/);
  if (m) return m[1];
  // Fallback: primeiras palavras
  return nome.length > 30 ? nome.substring(0, 27) + "…" : nome;
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