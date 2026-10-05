/**
 * Adaptador da API pública Pagefind para o UI distribuído.
 * O UI legado envia arrays com semântica E; este catálogo usa OU na faceta.
 * Não altera o índice nem o código gerado pelo Pagefind.
 */
import { pagefindFilters } from "../catalogo-busca-estado.js";
let modulePromise;
let latestSearch = 0;
const engine = () => modulePromise ||= import("../../../pagefind/pagefind.js");
function announce(name, detail) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(name, { detail }));
}
function withFilters(options = {}) {
  return { ...options, filters: pagefindFilters(options.filters) };
}
export async function options(value) {
  try { return await (await engine()).options(value); }
  catch (error) { announce("catalogo:busca-erro", {}); throw error; }
}
export async function filters() {
  try { return await (await engine()).filters(); }
  catch (error) { announce("catalogo:busca-erro", {}); throw error; }
}
export async function preload(term, options) {
  try { return await (await engine()).preload(term, withFilters(options)); }
  catch { /* A consulta efetiva reporta erros; preload é só uma otimização. */ }
}
export async function search(term, options) {
  const request = ++latestSearch;
  try {
    const response = await (await engine()).search(term, withFilters(options));
    if (request === latestSearch) announce("catalogo:busca-concluida", {
      term, total: response.results.length,
    });
    return response;
  } catch (error) {
    if (request === latestSearch) announce("catalogo:busca-erro", {});
    throw error;
  }
}
export async function destroy() {
  if (modulePromise) (await modulePromise).destroy?.();
}
