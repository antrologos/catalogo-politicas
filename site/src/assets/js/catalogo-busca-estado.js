/**
 * Estado compartilhável da busca e retorno por sessão.
 * Não depende do DOM nem de detalhes internos do Pagefind.
 */
export const RETURN_STORAGE_KEY = "catalogo:busca:retorno:v1";
export const RETURN_MAX_AGE = 24 * 60 * 60 * 1000;
export const FILTERS = [
  { name: "UF", param: "uf", label: "Território (UF)" },
  { name: "Tipo", param: "tipo", label: "Área da política" },
  { name: "Situação", param: "situacao", label: "Situação no levantamento" },
  { name: "Modalidade", param: "modalidade", label: "Modalidade informada" },
];
const UFS = new Set("BR AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));

export function normalizeFilters(filters = {}) {
  const normalized = {};
  for (const { name } of FILTERS) {
    const values = Array.isArray(filters[name]) ? filters[name] : [];
    const clean = values
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value && value.length <= 200)
      .map((value) => name === "UF" ? value.toUpperCase() : value)
      .filter((value) => name !== "UF" || UFS.has(value));
    if (clean.length) normalized[name] = [...new Set(clean)].sort();
  }
  return normalized;
}

export function readSearchState(search) {
  const params = new URLSearchParams(search);
  return {
    query: (params.get("q") || "").trim().slice(0, 300),
    filters: normalizeFilters(Object.fromEntries(
      FILTERS.map(({ name, param }) => [name, params.getAll(param)])
    )),
  };
}

export function buildSearchUrl(state, pathname = "/catalogo-politicas/buscar/") {
  const params = new URLSearchParams();
  const query = String(state.query || "").trim().slice(0, 300);
  if (query) params.set("q", query);
  const filters = normalizeFilters(state.filters);
  for (const { name, param } of FILTERS) {
    for (const value of filters[name] || []) params.append(param, value);
  }
  return pathname + (params.size ? "?" + params.toString() : "");
}

export function removeFilter(filters, name, value) {
  return normalizeFilters({
    ...filters,
    [name]: (filters[name] || []).filter((item) => item !== value),
  });
}

export function countFilters(filters) {
  return Object.values(normalizeFilters(filters)).reduce((count, values) => count + values.length, 0);
}

export function staticTerritoryUrl(state, basePath = "/catalogo-politicas/") {
  const filters = normalizeFilters(state.filters);
  if (!state.query && Object.keys(filters).length === 1 && filters.UF?.length === 1) {
    return basePath + "uf/" + filters.UF[0].toLowerCase() + "/";
  }
  return null;
}

export function readReturnState(serialized, currentUrl, now = Date.now()) {
  try {
    const value = JSON.parse(serialized);
    const current = new URL(currentUrl);
    if (!value || value.version !== 1 || typeof value.url !== "string" ||
        !value.url.startsWith("/") || value.url.startsWith("//") ||
        typeof value.resultPath !== "string") return null;
    const stored = new URL(value.url, current.origin);
    const basePath = current.pathname.replace(/buscar\/$/, "");
    if (!current.pathname.endsWith("/buscar/") || stored.origin !== current.origin ||
        stored.pathname !== current.pathname ||
        !value.resultPath.startsWith(basePath + "politica/") ||
        /[?#\\]/.test(value.resultPath) ||
        !Number.isFinite(value.updatedAt) || now < value.updatedAt ||
        now - value.updatedAt > RETURN_MAX_AGE) return null;
    if (buildSearchUrl(readSearchState(stored.search), stored.pathname) !==
        buildSearchUrl(readSearchState(current.search), current.pathname)) return null;
    if (!Number.isFinite(value.visibleResults) || value.visibleResults < 1 ||
        !Number.isFinite(value.scrollY) || value.scrollY < 0) return null;
    return {
      ...value,
      visibleResults: Math.min(1000, Math.floor(value.visibleResults)),
      scrollY: Math.min(1000000, Math.floor(value.scrollY)),
    };
  } catch {
    return null;
  }
}

export function prepareResult(result) {
  const original = result.meta || {};
  const meta = {};
  for (const key of ["title", "url", "image", "image_alt"]) {
    if (original[key]) meta[key] = original[key];
  }
  if (original.uf) meta["território"] = original.uf === "BR" ? "Federal (Brasil)" : original.uf;
  if (original.tipo) meta["área"] = original.tipo;
  const description = typeof original.descricao === "string"
    ? original.descricao.replace(/\s+/g, " ").trim()
    : "";
  if (!description) return { ...result, meta };
  let excerpt = description;
  if (excerpt.length > 300) {
    const boundary = excerpt.lastIndexOf(" ", 300);
    excerpt = excerpt.slice(0, boundary > 0 ? boundary : 300).trimEnd() + "…";
  }
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  excerpt = excerpt.replace(/[&<>"']/g, (character) => entities[character]);
  return { ...result, meta, excerpt };
}

/** OU entre valores da mesma faceta; o Pagefind mantém E entre facetas. */
export function pagefindFilters(filters) {
  return Object.fromEntries(Object.entries(normalizeFilters(filters)).map(([name, values]) => [name, { any: values }]));
}
