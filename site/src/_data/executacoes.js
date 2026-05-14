import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Mapeia onde cada política federal canônica é executada localmente.
 *
 * Como as fichas réplicas (`is_federal_replica === true`) não geram página
 * própria, este módulo coleta o detalhe local de cada réplica para que a
 * ficha federal canônica possa apresentar a tabela "Execução por estado"
 * (UF × órgão executor + situação) e a página /uf/<sigla>/ possa listar
 * "Políticas federais aplicadas em <UF>" como links para a federal.
 *
 * Saída:
 *   {
 *     porFederal: { [id_interno_da_federal]: [exec, exec, ...] },
 *     porUf:      { [uf]:                    [exec, exec, ...] }
 *   }
 *
 * Cada `exec` traz:
 *   { uf, slugFederal, nomeFederal, situacao, situacao_classe,
 *     orgaos, orgaos_especificados }
 *
 * Fonte: data/derived/latest.json.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return { porFederal: {}, porUf: {} };

  const porId = new Map();
  for (const p of raw) {
    if (p.id_interno) porId.set(p.id_interno, p);
  }

  const porFederal = {};
  const porUf = {};

  for (const r of raw) {
    if (!r.is_federal_replica || !r.federal_source_id) continue;
    const canonica = porId.get(r.federal_source_id);
    if (!canonica) continue;

    const orgaos = Array.isArray(r.orgaos_responsaveis)
      ? r.orgaos_responsaveis
      : r.orgaos_responsaveis ? [r.orgaos_responsaveis] : [];

    const exec = {
      uf: r.uf,
      slugFederal: canonica.slug,
      nomeFederal: canonica.nome,
      situacao: r.situacao_atual || canonica.situacao_atual || null,
      situacao_classe: situacaoClasse(
        r.situacao_atual || canonica.situacao_atual
      ),
      orgaos,
      orgaos_especificados: r.orgaos_responsaveis_com_especificacoes || null,
    };

    if (!porFederal[canonica.id_interno]) porFederal[canonica.id_interno] = [];
    porFederal[canonica.id_interno].push(exec);

    if (!porUf[r.uf]) porUf[r.uf] = [];
    porUf[r.uf].push(exec);
  }

  for (const id of Object.keys(porFederal)) {
    porFederal[id].sort((a, b) => a.uf.localeCompare(b.uf));
  }
  for (const uf of Object.keys(porUf)) {
    porUf[uf].sort((a, b) =>
      (a.nomeFederal || "").localeCompare(b.nomeFederal || "", "pt-BR")
    );
  }

  return { porFederal, porUf };
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