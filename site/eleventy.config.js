import navigationPlugin from "@11ty/eleventy-navigation";
import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // ---- Plugins
  eleventyConfig.addPlugin(navigationPlugin);
  eleventyConfig.addPlugin(rssPlugin);

  // ---- Passthrough copy (assets)
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  // CSS é gerado pelo Tailwind CLI direto em _site/assets/css/

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

  eleventyConfig.addFilter("citacaoAbnt", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    const acesso = new Date().toLocaleDateString("pt-BR");
    return `FRM/IESP-UERJ. ${p.nome_programa}. Catálogo de Políticas Públicas Brasileiras (1ª onda), ${ano}. Disponível em: <https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/>. Acesso em: ${acesso}.`;
  });

  eleventyConfig.addFilter("citacaoBibtex", (p) => {
    const ano = (p.data_revisao || "2026-05-01").slice(0, 4);
    return `@misc{${p.id_universal || p.slug},
  author       = {{FRM/IESP-UERJ}},
  title        = {${p.nome_programa}},
  year         = {${ano}},
  howpublished = {Cat\\'alogo de Pol\\'iticas P\\'ublicas Brasileiras},
  url          = {https://antrologos.github.io/catalogo-politicas/politica/${p.slug}/}
}`;
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
