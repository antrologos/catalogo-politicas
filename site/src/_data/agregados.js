import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Agregados pré-calculados em build-time para uso em templates.
 *
 * Computa contagens por UF, tipo, situação, snapshot — assim os templates
 * Nunjucks não precisam fazer reduce/groupBy. Performance e legibilidade.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return defaults();

  const total = raw.length;
  const countByUf = countBy(raw, "uf");
  const countByTipo = countBy(raw, "tipo_politica");
  const countBySituacao = countBy(raw, "situacao_atual");
  const countByModalidade = countBy(raw, "modalidade_oferta");
  const countByAbrangencia = countBy(raw, "abrangencia_territorial");
  const countByTipoOferta = countBy(raw, "tipo_oferta");
  const countByArranjo = countBy(raw, "arranjo_logistico");
  const countByEsferaForm = countBy(raw, "esfera_formulacao");
  const snapshotsDisponiveis = raw.filter((p) => p.fonte_arquivo_path).length;
  const snapshotsAusentes = total - snapshotsDisponiveis;

  // Conta também URLs únicas com snapshot (federais replicadas em UFs
  // compartilham mesma URL — index.json mostra 148 únicos)
  const urlsUnicasComSnapshot = new Set(
    raw.filter((p) => p.fonte_arquivo_path).map((p) => p.fonte_arquivo_path)
  ).size;

  // UFs cobertas na 1ª onda
  const ufsCobertas = Object.keys(countByUf).sort((a, b) => {
    if (a === "BR") return -1;
    if (b === "BR") return 1;
    return a.localeCompare(b);
  });

  // Agregados por UF (usado pela página /uf/<sigla>/)
  const porUf = {};
  for (const uf of ufsCobertas) {
    const fichas = raw.filter((p) => p.uf === uf);
    const totalUf = fichas.length;
    const ativas = fichas.filter((p) =>
      (p.situacao_atual || "").toLowerCase().includes("ativa") ||
      (p.situacao_atual || "").toLowerCase().includes("execução")
    ).length;
    const comSnapshot = fichas.filter((p) => p.fonte_arquivo_path).length;
    const tipos = countBy(fichas, "tipo_politica");
    const situacoes = countBy(fichas, "situacao_atual");
    const modalidades = countBy(fichas, "modalidade_oferta");
    const federaisReplicadas = fichas.filter((p) => p.is_federal_replica).length;
    const estaduaisUnicas = totalUf - federaisReplicadas;
    porUf[uf] = {
      total: totalUf,
      ativas,
      comSnapshot,
      federaisReplicadas,
      estaduaisUnicas,
      eixosCobertos: Object.keys(tipos).length,
      distribuicaoTipo: Object.entries(tipos)
        .map(([tipo, n]) => ({ tipo, n, pct: Math.round((n / totalUf) * 100) }))
        .sort((a, b) => b.n - a.n),
      distribuicaoSituacao: Object.entries(situacoes)
        .map(([situacao, n]) => ({ situacao, n, pct: Math.round((n / totalUf) * 100), classe: situacaoClasse(situacao) }))
        .sort((a, b) => b.n - a.n),
      distribuicaoModalidade: Object.entries(modalidades)
        .map(([modalidade, n]) => ({ modalidade, n, pct: Math.round((n / totalUf) * 100) }))
        .sort((a, b) => b.n - a.n),
    };
  }

  // Distribuição por tipo com percentual
  const distribuicaoTipo = Object.entries(countByTipo)
    .map(([tipo, n]) => ({
      tipo,
      n,
      pct: Math.round((n / total) * 100),
    }))
    .sort((a, b) => b.n - a.n);

  // Distribuição por situação com percentual
  const distribuicaoSituacao = Object.entries(countBySituacao)
    .map(([situacao, n]) => ({
      situacao,
      n,
      pct: Math.round((n / total) * 100),
      classe: situacaoClasse(situacao),
    }))
    .sort((a, b) => b.n - a.n);

  const distribuicaoModalidade = mapDist(countByModalidade, total);
  const distribuicaoAbrangencia = mapDist(countByAbrangencia, total);
  const distribuicaoTipoOferta = mapDist(countByTipoOferta, total);
  const distribuicaoArranjo = mapDist(countByArranjo, total);
  const distribuicaoEsferaForm = mapDist(countByEsferaForm, total);

  // Distribuição por origem (federal replicada vs estadual única)
  const replicas = raw.filter((p) => p.is_federal_replica).length;
  const distribuicaoOrigem = [
    { valor: "Federal replicada", n: replicas, pct: Math.round((replicas / total) * 100) },
    { valor: "Estadual única", n: total - replicas, pct: Math.round(((total - replicas) / total) * 100) },
  ];

  // Distribuição por disponibilidade de snapshot
  const distribuicaoSnapshot = [
    { valor: "Disponível", n: snapshotsDisponiveis, pct: Math.round((snapshotsDisponiveis / total) * 100) },
    { valor: "Indisponível", n: snapshotsAusentes, pct: Math.round((snapshotsAusentes / total) * 100) },
  ];

  // Última atualização (mais recente entre todas as fichas)
  const dataUltima = raw
    .map((p) => p.atualizado_em || p.data_versao_catalogo)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return {
    total,
    countByUf,
    countByTipo,
    countBySituacao,
    snapshotsDisponiveis,
    snapshotsAusentes,
    urlsUnicasComSnapshot,
    ufsCobertas,
    distribuicaoTipo,
    distribuicaoSituacao,
    distribuicaoModalidade,
    distribuicaoAbrangencia,
    distribuicaoTipoOferta,
    distribuicaoArranjo,
    distribuicaoEsferaForm,
    distribuicaoOrigem,
    distribuicaoSnapshot,
    porUf,
    dataUltima,
    dataUltimaBR: formatDateBR(dataUltima),
  };
}

function mapDist(counts, total) {
  return Object.entries(counts)
    .map(([valor, n]) => ({ valor, n, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.n - a.n);
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

function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return y && m && d ? `${d}/${m}/${y}` : null;
}

function defaults() {
  return {
    total: 0,
    countByUf: {},
    countByTipo: {},
    countBySituacao: {},
    snapshotsDisponiveis: 0,
    snapshotsAusentes: 0,
    urlsUnicasComSnapshot: 0,
    ufsCobertas: [],
    distribuicaoTipo: [],
    distribuicaoSituacao: [],
    dataUltima: null,
    dataUltimaBR: null,
  };
}