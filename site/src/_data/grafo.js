/**
 * Dados do grafo de relacionamentos com COMPOUND NODES (Sprint 9.7+, 2026-05-04).
 *
 * Re-arquitetura para escalar a 27 UFs futuras com drill-down obrigatório:
 *   - Cada federal canônica gera um compound parent "fam-{id}" agrupando
 *     ela mesma + suas réplicas estaduais. Default colapsado (api.collapseAll
 *     em assets/js/grafo.js mostra apenas o parent).
 *   - Cada UF com políticas exclusivamente estaduais gera um compound parent
 *     "uf-{UF}" agrupando todas as estaduais únicas da UF.
 *   - Políticas isoladas (estadual única SEM articulação curada e SEM família)
 *     NÃO entram no grafo. Continuam listadas na lista textual canônica
 *     #lista-familias em /grafo/ (NF-M-10).
 *
 * Categorias de node-folha (children dentro de compounds):
 *   - federal: política federal canônica (uf=BR, !is_federal_replica)
 *   - replica: réplica estadual de uma federal
 *   - estadual: política exclusivamente estadual
 *
 * Categorias de node-compound (parents):
 *   - compound-federal: agrupa federal canônica + réplicas
 *   - compound-uf: agrupa estaduais únicas de uma UF
 *
 * Edges:
 *   - familia: replica → federal canônica (255 edges, mantidas)
 *   - articulacao: edge curada do articulacoesCuradas.js (438 totais; cada
 *     edge entra se source e target estão presentes no grafo final)
 *
 * Bibliotecas: Cytoscape v3 + cose-bilkent + cytoscape-expand-collapse 4.1.1
 * (carregadas via UMD em grafo.njk).
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import curadasValidas from "./articulacoesCuradas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

// Mapa UF → nome legível para labels de cluster
const NOME_UF = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

export default function () {
  const policies = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(policies)) {
    return { nodes: [], edges: [], stats: {} };
  }

  // Pré-pass 1: classificar cada política em federal/replica/estadual.
  // Mapas auxiliares para construir compounds e filtrar isolados depois.
  const byId = new Map();
  for (const p of policies) {
    let type;
    if (p.uf === "BR" && !p.is_federal_replica) type = "federal";
    else if (p.is_federal_replica) type = "replica";
    else type = "estadual";
    byId.set(p.id_interno, { p, type });
  }

  // Pré-pass 2: identificar IDs com pelo menos 1 articulação curada (source ou target).
  // Necessário para filtrar estaduais isoladas (sem família E sem articulação).
  const articuladas = curadasValidas(policies);
  const idsComArt = new Set();
  for (const a of articuladas) {
    idsComArt.add(a.source);
    idsComArt.add(a.target);
  }

  // Pré-pass 3: descobrir quais federais têm réplicas (para decidir se vira
  // compound parent ou nó-folha). Federal sem réplicas e sem articulação fica
  // como nó-folha solto.
  const familiasComReplica = new Set();
  for (const { p, type } of byId.values()) {
    if (type === "replica" && p.federal_source_id) {
      familiasComReplica.add(p.federal_source_id);
    }
  }

  // Pré-pass 4: agrupar estaduais únicas por UF (para gerar compound clusters).
  const estaduaisPorUf = new Map();
  for (const { p, type } of byId.values()) {
    if (type !== "estadual") continue;
    const uf = p.uf;
    if (!estaduaisPorUf.has(uf)) estaduaisPorUf.set(uf, []);
    estaduaisPorUf.get(uf).push(p);
  }

  const nodes = [];
  const edges = [];
  let nodesFiltrados = 0;

  // Compound parents — federais
  for (const fedId of familiasComReplica) {
    const fed = byId.get(fedId);
    if (!fed) continue;
    nodes.push({
      data: {
        id: `fam-${fedId}`,
        label: shortLabel(fed.p.nome, "federal", "BR"),
        nomeCompleto: fed.p.nome,
        type: "compound-federal",
      },
      classes: "compound-federal",
    });
  }

  // Compound parents — UFs com estaduais únicas
  // Apenas UFs cujas estaduais únicas tenham pelo menos 1 articulação
  // (caso contrário, todas serão filtradas e o cluster fica vazio).
  for (const [uf, estaduais] of estaduaisPorUf.entries()) {
    const temArticulada = estaduais.some((p) => idsComArt.has(p.id_interno));
    if (!temArticulada) continue;
    nodes.push({
      data: {
        id: `uf-${uf}`,
        label: NOME_UF[uf] || uf,
        nomeCompleto: `Cluster ${NOME_UF[uf] || uf} (${uf})`,
        type: "compound-uf",
        uf,
      },
      classes: "compound-uf",
    });
  }

  // Children — adicionar nós-folha com parent atribuído
  for (const { p, type } of byId.values()) {
    let parent = null;

    if (type === "federal") {
      // Federal vira filho do seu próprio compound (se tem réplicas) OU
      // permanece como nó solto (se sem família e sem articulação)
      if (familiasComReplica.has(p.id_interno)) {
        parent = `fam-${p.id_interno}`;
      } else if (!idsComArt.has(p.id_interno)) {
        nodesFiltrados++;
        continue; // federal isolada — não entra
      }
    } else if (type === "replica") {
      // Réplica sempre vira filho do compound da família federal pai
      if (p.federal_source_id) parent = `fam-${p.federal_source_id}`;
    } else if (type === "estadual") {
      // Estadual única: filho do cluster UF se tem articulação; senão filtra
      if (!idsComArt.has(p.id_interno)) {
        nodesFiltrados++;
        continue;
      }
      parent = `uf-${p.uf}`;
    }

    const node = {
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
    };
    if (parent) node.data.parent = parent;
    nodes.push(node);

    // Edge familia: replica → federal canônica
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

  // Edges articulacao — apenas se ambos os endpoints estão no grafo final
  const idsNoGrafo = new Set(nodes.map((n) => n.data.id));
  for (const a of articuladas) {
    if (!idsNoGrafo.has(a.source) || !idsNoGrafo.has(a.target)) continue;
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
    compoundsFederal: nodes.filter((n) => n.data.type === "compound-federal").length,
    compoundsUf: nodes.filter((n) => n.data.type === "compound-uf").length,
    nodesFiltrados,
    totalEdges: edges.length,
    edgesFamilia: edges.filter((e) => e.data.type === "familia").length,
    edgesArticulacao: edges.filter((e) => e.data.type === "articulacao").length,
  };

  return { nodes, edges, stats };
}

/**
 * Label curto identificando a POLÍTICA (não a UF) em cada nó-folha.
 *   - Federal canônica: "PRONATEC", "EJA", "ENCCEJA"
 *   - Réplica estadual: "PRONATEC-BA", "EJA-SP"
 *   - Estadual única: sigla própria + UF, ou primeiras palavras
 */
function shortLabel(nome, type, uf) {
  if (!nome) return "?";
  const m = nome.match(/\(([A-Z][A-Z0-9-]{1,15})\)/);
  const sigla = m ? m[1] : null;

  if (type === "federal") {
    return sigla || (nome.length > 22 ? nome.substring(0, 19) + "…" : nome);
  }
  if (type === "replica") {
    return sigla ? `${sigla}-${uf}` : `${shortenName(nome, 14)}-${uf}`;
  }
  if (sigla) return `${sigla}-${uf}`;
  return `${shortenName(nome, 14)}-${uf}`;
}

function shortenName(nome, maxLen) {
  if (nome.length <= maxLen) return nome;
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