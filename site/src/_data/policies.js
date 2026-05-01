import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Carrega 10 fichas representativas (1 por UF + Federal) do JSON canônico.
 * No PoC, usamos subset; em produção, carrega todas as 439.
 *
 * Fonte: data/derived/latest.json (validado contra policies-schema.json v0.2)
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) {
    throw new Error(`latest.json não é array. Path: ${DATA_PATH}`);
  }

  // Selecionar 1 por UF (BR + 9 estaduais)
  const ufsAlvo = ["BR", "SP", "RJ", "MG", "PR", "RS", "BA", "PA", "PE", "CE"];
  const seenUfs = new Set();
  const subset = [];

  for (const p of raw) {
    if (ufsAlvo.includes(p.uf) && !seenUfs.has(p.uf)) {
      seenUfs.add(p.uf);
      subset.push(normalize(p));
    }
    if (subset.length === ufsAlvo.length) break;
  }

  // Ordenar: Federal primeiro, depois UFs em ordem alfabética
  subset.sort((a, b) => {
    if (a.uf === "BR") return -1;
    if (b.uf === "BR") return 1;
    return a.uf.localeCompare(b.uf);
  });

  return subset;
}

function normalize(p) {
  return {
    ...p,
    // Aliases para legibilidade nos templates
    nome_programa: p.nome,
    id_universal: p.id_interno,
    data_revisao: p.data_versao_catalogo,
    statusKey: deriveStatusKey(p.situacao_atual),
    isFederal: p.uf === "BR",
    revisado_em_br: formatDateBR(p.data_versao_catalogo),
    proxima_revisao_br: formatDateBR(p.proxima_revisao_prevista),
    snapshot_relativo: p.fonte_arquivo_path
      ? p.fonte_arquivo_path.replace(/^data\/external_snapshots\//, "")
      : null,
    completude_classe:
      p.completude_pct >= 90
        ? "alta"
        : p.completude_pct >= 70
        ? "media"
        : "baixa",
  };
}

function deriveStatusKey(s) {
  if (!s) return "outras";
  const lower = s.toLowerCase();
  if (lower.includes("ativa") || lower.includes("execução")) return "ativa";
  if (lower.includes("encerrada") || lower.includes("descontinuada")) return "encerrada";
  if (lower.includes("suspensa") || lower.includes("pausada")) return "suspensa";
  if (lower.includes("planejamento")) return "planejamento";
  return "outras";
}

function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return y && m && d ? `${d}/${m}/${y}` : null;
}
