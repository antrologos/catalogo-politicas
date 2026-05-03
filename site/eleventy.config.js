import navigationPlugin from "@11ty/eleventy-navigation";
import rssPlugin from "@11ty/eleventy-plugin-rss";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHOSPHOR_REGULAR_DIR = resolve(
  __dirname,
  "node_modules/@phosphor-icons/core/assets/regular"
);
const iconCache = new Map();

export default function (eleventyConfig) {
  // ---- Plugins
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(rssPlugin);

  // ---- Passthrough copy (assets)
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  // CSS é gerado pelo Tailwind CLI direto em _site/assets/css/
  // Fontes self-hosted via @fontsource: o CSS importado referencia
  // url(files/...) relativo a _site/assets/css/, então copiamos os .woff2
  // dos pacotes @fontsource* para esse mesmo diretório. Browser baixa
  // apenas os subsets unicode-range que precisa (latin para PT-BR).
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/ibm-plex-sans/files": "assets/css/files",
    "node_modules/@fontsource/ibm-plex-serif/files": "assets/css/files",
    "node_modules/@fontsource/ibm-plex-mono/files": "assets/css/files",
  });

  // ---- Watch targets (dev server reage a mudanças no JSON canônico)
  eleventyConfig.addWatchTarget("../data/derived/latest.json");
  eleventyConfig.addWatchTarget("./src/assets/css/");

  // ---- Filtros customizados
  eleventyConfig.addFilter("dataBR", (str) => {
    if (!str || typeof str !== "string") return "";
    const [y, m, d] = str.split("T")[0].split("-");
    if (!y || !m || !d) return str;
    return `${d}/${m}/${y}`;
  });

  eleventyConfig.addFilter("filterByUf", (policies, uf) =>
    Array.isArray(policies) ? policies.filter((p) => p.uf === uf) : []
  );

  eleventyConfig.addFilter("groupByUf", (policies) => {
    if (!Array.isArray(policies)) return {};
    const groups = {};
    for (const p of policies) {
      const uf = p.uf || "Desconhecido";
      (groups[uf] ??= []).push(p);
    }
    return groups;
  });

  // Agrupa siglas de UFs por região via lookup em `ufs` (data/ufs.js).
  // Saída: { Norte: ["PA"], Nordeste: ["BA","CE","PE"], Sudeste: ["MG","RJ","SP"], Sul: ["PR","RS"] }
  // Federal "BR" é tratado separadamente no template (não vai em região).
  eleventyConfig.addFilter("groupByRegiao", (siglas, ufs) => {
    if (!Array.isArray(siglas) || !ufs) return {};
    const ORDEM = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
    const groups = {};
    for (const sigla of siglas) {
      if (sigla === "BR") continue;
      const info = ufs[sigla];
      const regiao = (info && info.regiao) || "Outras";
      if (!groups[regiao]) groups[regiao] = [];
      groups[regiao].push(sigla);
    }
    const ordered = {};
    for (const r of ORDEM) {
      if (groups[r]) ordered[r] = groups[r].sort();
    }
    for (const r of Object.keys(groups)) {
      if (!ordered[r]) ordered[r] = groups[r].sort();
    }
    return ordered;
  });

  eleventyConfig.addFilter("countByKey", (policies, key) => {
    if (!Array.isArray(policies)) return {};
    const counts = {};
    for (const p of policies) {
      const v = p[key] || "—";
      counts[v] = (counts[v] || 0) + 1;
    }
    return counts;
  });

  eleventyConfig.addFilter("statusKey", (situacao) => {
    if (!situacao) return "";
    const lower = situacao.toLowerCase();
    if (lower.includes("ativa") || lower.includes("execução")) return "ativa";
    if (lower.includes("encerrada") || lower.includes("descontinuada")) return "encerrada";
    if (lower.includes("suspensa") || lower.includes("pausada")) return "suspensa";
    if (lower.includes("planejamento")) return "planejamento";
    return "outras";
  });

  eleventyConfig.addFilter("statusLabel", (situacao) => situacao || "Não informado");

  // Filtro startsWith para Nunjucks (não tem nativo). Útil para detectar
  // página ativa na nav: {% if urlAtual | startsWith(item.href) %}
  eleventyConfig.addFilter("startsWith", (str, prefix) => {
    if (typeof str !== "string" || typeof prefix !== "string") return false;
    return str.startsWith(prefix);
  });

  // Shortcode `icon` — renderiza SVG inline da família Phosphor regular.
  // Uso: {% icon "magnifying-glass" %} ou {% icon "compass", "size-2xl" %}.
  // O SVG vem com fill="currentColor", então herda text-color do parent.
  // Cache em memória evita re-leitura disco para mesmo ícone (ADR-012).
  eleventyConfig.addShortcode("icon", function (name, classes = "") {
    if (!iconCache.has(name)) {
      try {
        const svg = readFileSync(
          resolve(PHOSPHOR_REGULAR_DIR, `${name}.svg`),
          "utf-8"
        );
        iconCache.set(name, svg);
      } catch (e) {
        console.warn(`[icon] Phosphor não encontrado: '${name}.svg' — render vazio`);
        iconCache.set(name, "");
      }
    }
    const svg = iconCache.get(name);
    if (!svg) return "";
    const cls = classes ? `icon ${classes}` : "icon";
    return svg.replace(
      "<svg ",
      `<svg class="${cls}" aria-hidden="true" focusable="false" `
    );
  });

  // Shortcode `abbr` — wrap texto em <abbr title="..."> usando _data/glossario.
  // Uso: {% abbr "EJA" %}, {% abbr "PRONATEC" %}. Tailwind preflight � estiliza
  // <abbr[title]> com underline pontilhada. Adicionamos cursor:help via base.
  // Cache lookup em memória via Map (lazy build na primeira chamada).
  let _glossarioMap = null;
  async function loadGlossario() {
    if (_glossarioMap) return _glossarioMap;
    const mod = await import("./src/_data/glossario.js");
    _glossarioMap = new Map(mod.default.termos.map((g) => [g.sigla, g]));
    return _glossarioMap;
  }
  eleventyConfig.addAsyncShortcode("abbr", async function (sigla) {
    const map = await loadGlossario();
    const entry = map.get(sigla);
    if (!entry) return sigla;
    const titleAttr = entry.expansao.replace(/"/g, "&quot;");
    return `<abbr title="${titleAttr}">${sigla}</abbr>`;
  });

  // Filtro slug — converte texto categórico em URL-safe deterministicamente.
  // "Educacional direta" → "educacional-direta"
  // "Trabalho/qualificação direta" → "trabalho-qualificacao-direta"
  // "Ativa / em execução" → "ativa-em-execucao"
  // Usado para gerar permalinks de páginas índice por dimensão (EX.2).
  eleventyConfig.addFilter("slug", (str) => {
    if (typeof str !== "string") return "";
    return str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // remove diacríticos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  });

  // Atribuição institucional fixa para todas as citações.
  // Coordenadores como autores nominais; Rede EJA e Inclusão Produtiva como
  // organização editora; Catálogo de Políticas como obra; subtítulo como série.
  const AUTORES_ABNT = "BARBOSA, R. J.; GAMA, M. C. da; GUICHENEY, H.; SCHAEFER, B. (Coords.)";
  const AUTORES_APA = "Barbosa, R. J., Gama, M. C. da, Guicheney, H., & Schaefer, B.";
  const AUTORES_BIB = "{Barbosa, Rog{\\'e}rio Jer{\\^o}nimo and Gama, Maria Clara da and Guicheney, Hellen and Schaefer, Bruno}";
  const EDITORA = "Rede EJA e Inclus\\~ao Produtiva (FRM, Funda\\c{c}\\~ao Bradesco, IESP-UERJ)";
  const EDITORA_PLAIN = "Rede EJA e Inclusão Produtiva (FRM, Fundação Bradesco, IESP-UERJ)";
  const SERIE = "Cat\\'alogo de Pol\\'iticas — Projeto Juventudes Fora da Escola sem Educa\\c{c}\\~ao B\\'asica";
  const SERIE_PLAIN = "Catálogo de Políticas — Projeto Juventudes Fora da Escola sem Educação Básica";

  eleventyConfig.addFilter("citacaoAbnt", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    const acesso = new Date().toLocaleDateString("pt-BR");
    return `${AUTORES_ABNT}. ${p.nome_programa}. In: ${SERIE_PLAIN}. ${EDITORA_PLAIN}, ${ano}. Disponível em: <https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/>. Acesso em: ${acesso}.`;
  });

  eleventyConfig.addFilter("citacaoApa", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    const acesso = new Date().toLocaleDateString("pt-BR");
    return `${AUTORES_APA} (${ano}). ${p.nome_programa}. In ${SERIE_PLAIN}. ${EDITORA_PLAIN}. Recuperado em ${acesso}, de https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/`;
  });

  eleventyConfig.addFilter("citacaoBibtex", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    return `@incollection{${p.id_universal || p.slug},
  author       = ${AUTORES_BIB},
  title        = {${p.nome_programa}},
  booktitle    = {${SERIE}},
  publisher    = {${EDITORA}},
  year         = {${ano}},
  url          = {https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/}
}`;
  });

  eleventyConfig.addFilter("citacaoRis", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    return `TY  - CHAP
AU  - Barbosa, Rogério Jerônimo
AU  - Gama, Maria Clara da
AU  - Guicheney, Hellen
AU  - Schaefer, Bruno
TI  - ${p.nome_programa}
T2  - ${SERIE_PLAIN}
PB  - ${EDITORA_PLAIN}
PY  - ${ano}
UR  - https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/
LA  - pt-BR
ER  - `;
  });

  // ---- Coleções derivadas
  eleventyConfig.addCollection("politicasPorUf", (collectionApi) => {
    // mantemos vazio aqui; lógica fica no template via _data/policies.js
    return [];
  });

  // ---- Configuração final
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: "/catalogo-politicas/",
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: false,
  };
}
