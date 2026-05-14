import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../../../data/derived/latest.json");

/**
 * Lista enxuta { slug, nome, uf } de TODAS as fichas — usada pelo fuzzy match
 * da página 404. Embedada inline no HTML; ~30KB descomprimido.
 */
export default function () {
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) return [];

  return raw
    .map((p) => ({
      slug: p.slug,
      nome: p.nome,
      uf: p.uf,
    }))
    .filter((p) => p.slug && p.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}