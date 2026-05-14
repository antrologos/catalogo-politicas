import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Agregados pré-calculados em build-time para uso em templates.
 *
 * Trabalha **apenas com políticas únicas** (federal canônica + estaduais
 * genuínas) — réplicas federais são filtradas antes de qualquer contagem.
 * Isso garante que home, /uf/, /comparacao/, /mapa/ e /explorar/ exibam
 * números coerentes entre si e não inflados por replicação.
 *
 * Contagens auxiliares sobre o universo bruto (`raw`) permanecem em
 * `executacoes.js` (federais aplicadas por UF).
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return defaults();

  const unicas = raw.filter((p) => !p.is_federal_replica);
  const total = unicas.length;
  const federaisCount = unicas.filter((p) => p.uf === "BR").length;
  const estaduaisUnicasCount = total - federaisCount;

  const countByUf = countBy(unicas, "uf");
  const countByTipo = countBy(unicas, "tipo_politica");
  const countBySituacao = countBy(unicas, "situacao_atual");
  const countByModalidade = countBy(unicas, "modalidade_oferta");
  const countByAbrangencia = countBy(unicas, "abrangencia_territorial");
  const countByTipoOferta = countBy(unicas, "tipo_oferta");
  const countByArranjo = countBy(unicas, "arranjo_logistico");
  const countByEsferaForm = countBy(unicas, "esfera_formulacao");

  const ufsCobertasSet = new Set(unicas.map((p) => p.uf));
  // Acrescenta UFs que só têm réplicas federais aplicadas (caso existam)
  for (const r of raw) {
    if (r.is_federal_replica && r.uf) ufsCobertasSet.add(r.uf);
  }
  const ufsCobertas = [...ufsCobertasSet].sort((a, b) => {
    if (a === "BR") return -1;
    if (b === "BR") return 1;
    return a.localeCompare(b);
  });

  // Federais aplicadas por UF (mapa id_interno → conjunto de UFs)
  const aplicacoesPorFederal = new Map();
  for (const r of raw) {
    if (!r.is_federal_replica || !r.federal_source_id) continue;
    if (!aplicacoesPorFederal.has(r.federal_source_id)) {
      aplicacoesPorFederal.set(r.federal_source_id, new Set());
    }
    aplicacoesPorFederal.get(r.federal_source_id).add(r.uf);
  }

  const porUf = {};
  for (const uf of ufsCobertas) {
    const fichas = unicas.filter((p) => p.uf === uf);
    const totalUf = fichas.length;
    const ativas = fichas.filter((p) =>
      (p.situacao_atual || "").toLowerCase().includes("ativa") ||
      (p.situacao_atual || "").toLowerCase().includes("execução")
    ).length;
    const tipos = countBy(fichas, "tipo_politica");
    const situacoes = countBy(fichas, "situacao_atual");
    const modalidades = countBy(fichas, "modalidade_oferta");
    const federaisAplicadas = uf === "BR"
      ? 0
      : raw.filter((p) => p.is_federal_replica && p.uf === uf).length;

    porUf[uf] = {
      total: totalUf,
      ativas,
      estaduaisUnicas: totalUf - (uf === "BR" ? federaisCount : 0),
      federaisAplicadas,
      eixosCobertos: Object.keys(tipos).length,
      distribuicaoTipo: Object.entries(tipos)
        .map(([tipo, n]) => ({ tipo, n, pct: pct(n, totalUf) }))
        .sort((a, b) => b.n - a.n),
      distribuicaoSituacao: Object.entries(situacoes)
        .map(([situacao, n]) => ({ situacao, n, pct: pct(n, totalUf), classe: situacaoClasse(situacao) }))
        .sort((a, b) => b.n - a.n),
      distribuicaoModalidade: Object.entries(modalidades)
        .map(([modalidade, n]) => ({ modalidade, n, pct: pct(n, totalUf) }))
        .sort((a, b) => b.n - a.n),
    };
  }
  // Override BR: estaduaisUnicas não faz sentido lá; substituir pelo total
  if (porUf.BR) {
    porUf.BR.estaduaisUnicas = 0;
    porUf.BR.federaisAplicadas = 0;
  }

  const distribuicaoTipo = Object.entries(countByTipo)
    .map(([tipo, n]) => ({ tipo, n, pct: pct(n, total) }))
    .sort((a, b) => b.n - a.n);

  const distribuicaoSituacao = Object.entries(countBySituacao)
    .map(([situacao, n]) => ({ situacao, n, pct: pct(n, total), classe: situacaoClasse(situacao) }))
    .sort((a, b) => b.n - a.n);

  const distribuicaoModalidade = mapDist(countByModalidade, total);
  const distribuicaoAbrangencia = mapDist(countByAbrangencia, total);
  const distribuicaoTipoOferta = mapDist(countByTipoOferta, total);
  const distribuicaoArranjo = mapDist(countByArranjo, total);
  const distribuicaoEsferaForm = mapDist(countByEsferaForm, total);

  // Distribuição por origem (sobre o universo único): federais canônicas vs
  // exclusivamente estaduais. Réplicas não entram (não somam outra ficha).
  const distribuicaoOrigem = [
    { valor: "Federal", n: federaisCount, pct: pct(federaisCount, total) },
    { valor: "Estadual", n: estaduaisUnicasCount, pct: pct(estaduaisUnicasCount, total) },
  ];

  const dataUltima = unicas
    .map((p) => p.atualizado_em || p.data_versao_catalogo)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return {
    total,
    federaisCount,
    estaduaisUnicasCount,
    countByUf,
    countByTipo,
    countBySituacao,
    ufsCobertas,
    distribuicaoTipo,
    distribuicaoSituacao,
    distribuicaoModalidade,
    distribuicaoAbrangencia,
    distribuicaoTipoOferta,
    distribuicaoArranjo,
    distribuicaoEsferaForm,
    distribuicaoOrigem,
    porUf,
    dataUltima,
    dataUltimaBR: formatDateBR(dataUltima),
  };
}

function mapDist(counts, total) {
  return Object.entries(counts)
    .map(([valor, n]) => ({ valor, n, pct: pct(n, total) }))
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

function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
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
    federaisCount: 0,
    estaduaisUnicasCount: 0,
    countByUf: {},
    countByTipo: {},
    countBySituacao: {},
    ufsCobertas: [],
    distribuicaoTipo: [],
    distribuicaoSituacao: [],
    distribuicaoOrigem: [],
    porUf: {},
    dataUltima: null,
    dataUltimaBR: null,
  };
}