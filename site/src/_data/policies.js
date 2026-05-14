import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Carrega TODAS as 439 fichas do JSON canônico (Bloco F.1 Sprint 1).
 *
 * Fonte: data/derived/latest.json — validado contra policies-schema.json v0.2
 * (CI bloqueia se schema falhar antes do build).
 *
 * Cada ficha recebe campos derivados (aliases, datas BR, statusKey) para
 * facilitar uso em templates Nunjucks sem lógica complexa.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) {
    throw new Error(`latest.json não é array. Path: ${DATA_PATH}`);
  }

  const policies = raw.map(normalize);

  // Ordenar: Federal primeiro, depois UFs em ordem alfabética por nome
  policies.sort((a, b) => {
    if (a.uf === "BR" && b.uf !== "BR") return -1;
    if (b.uf === "BR" && a.uf !== "BR") return 1;
    if (a.uf !== b.uf) return a.uf.localeCompare(b.uf);
    return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  });

  return policies;
}

function normalize(p) {
  const orgaosArr = Array.isArray(p.orgaos_responsaveis)
    ? p.orgaos_responsaveis
    : (p.orgaos_responsaveis ? [p.orgaos_responsaveis] : []);
  const integraArr = Array.isArray(p.integra_outras_politicas)
    ? p.integra_outras_politicas
    : (p.integra_outras_politicas ? [p.integra_outras_politicas] : []);

  return {
    ...p,
    nome_programa: p.nome,
    id_universal: p.id_interno,
    data_revisao: p.data_versao_catalogo,
    statusKey: deriveStatusKey(p.situacao_atual),
    isFederal: p.uf === "BR",
    revisado_em_br: formatDateBR(p.data_versao_catalogo),
    proxima_revisao_br: formatDateBR(p.proxima_revisao_prevista),
    fonte_data_acesso_br: formatDateBR(p.fonte_data_acesso),
    snapshot_relativo: p.fonte_arquivo_path
      ? p.fonte_arquivo_path.replace(/^data\/external_snapshots\//, "")
      : null,
    completude_classe:
      p.completude_pct >= 90 ? "alta"
        : p.completude_pct >= 70 ? "media"
        : "baixa",
    orgaos_lista: orgaosArr,
    integra_lista: integraArr,
  };
}

function deriveStatusKey(s) {
  if (!s) return "outras";
  const lower = s.toLowerCase();
  if (lower.includes("ativa") || lower.includes("execução")) return "ativa";
  if (lower.includes("descontinuada")) return "descontinuada";
  if (lower.includes("encerrada")) return "encerrada";
  if (lower.includes("suspensa") || lower.includes("pausada")) return "suspensa";
  if (lower.includes("planejamento")) return "planejamento";
  return "outras";
}

function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return y && m && d ? `${d}/${m}/${y}` : null;
}