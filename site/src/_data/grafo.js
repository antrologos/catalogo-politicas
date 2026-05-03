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
import curadasValidas from "./articulacoesCuradas.js";

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
        label: shortLabel(p.nome, type, p.uf),
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

  // Sprint 9.3 (versão revisada): edges 'articulacao' apenas a partir da
  // CURADORIA HUMANA em _data/articulacoesCuradas.js. Substring matching
  // automático foi descartado por gerar ruído (ver decisão da usuária 2026-05-03).
  // Cada articulação aqui representa uma relação institucional substantiva
  // documentada (certificação, condicionalidade, intermediação, etc.).
  const articuladas = curadasValidas(policies);
  for (const a of articuladas) {
    edges.push({
      data: {
        id: `e-art-${a.source}-${a.target}`,
        source: a.source,
        target: a.target,
        type: "articulacao",
        tipoArticulacao: a.tipo,
        descricao: a.descricao,
      },
    });
  }

  // Estatísticas para o template
  const stats = {
    totalNodes: nodes.length,
    federais: nodes.filter((n) => n.data.type === "federal").length,
    replicas: nodes.filter((n) => n.data.type === "replica").length,
    estaduais: nodes.filter((n) => n.data.type === "estadual").length,
    totalEdges: edges.length,
    edgesFamilia: edges.filter((e) => e.data.type === "familia").length,
    edgesArticulacao: edges.filter((e) => e.data.type === "articulacao").length,
  };

  return { nodes, edges, stats };
}

/**
 * Label curto identificando a POLÍTICA (não a UF) em cada nó.
 * Cada nó é uma política específica:
 *   - Federal canônica: "PRONATEC", "EJA", "ENCCEJA" (sigla entre parênteses)
 *   - Réplica estadual: "PRONATEC-BA", "EJA-SP" (sigla federal + UF)
 *   - Estadual única: sigla própria entre parênteses + UF, ou primeiras palavras
 *
 * (Sprint 9.3 fix: antes mostrava só "BA"/"SP" em réplicas, dando impressão
 * de que o nó era a UF — confusão semântica reportada pela usuária.)
 */
function shortLabel(nome, type, uf) {
  if (!nome) return "?";
  // Sigla entre parênteses no próprio nome
  const m = nome.match(/\(([A-Z][A-Z0-9-]{1,15})\)/);
  const sigla = m ? m[1] : null;

  if (type === "federal") {
    return sigla || (nome.length > 22 ? nome.substring(0, 19) + "…" : nome);
  }
  if (type === "replica") {
    // Sigla da política + UF (ex.: "PRONATEC-BA"). Identifica a política
    // específica, não confunde com nome da UF.
    return sigla ? `${sigla}-${uf}` : `${shortenName(nome, 14)}-${uf}`;
  }
  // Estadual única: sigla se existir + UF, senão primeiras palavras + UF
  if (sigla) return `${sigla}-${uf}`;
  return `${shortenName(nome, 14)}-${uf}`;
}

function shortenName(nome, maxLen) {
  if (nome.length <= maxLen) return nome;
  // Pega só palavras significativas (>3 chars), join, trunca
  const words = nome.split(/\s+/).filter((w) => w.length > 3 && !/^(de|da|do|para|com|em|na|no|os|as|à|à)$/i.test(w));
  const compact = words.join(" ");
  return compact.length > maxLen ? compact.substring(0, maxLen - 1) + "…" : compact;
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