import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/curadoria");

// Evidências da curadoria são separadas do schema das fichas. Não certificam
// vigência, cobertura ou resultados; apenas documentam a revisão identificada.
export default function revisoes() {
  const resultado = {};
  for (const nome of readdirSync(PASTA).filter((n) => /^correcoes-.*\.json$/.test(n)).sort()) {
    const manifesto = JSON.parse(readFileSync(resolve(PASTA, nome), "utf-8"));
    if (manifesto.versao !== 1) throw new Error(`Curadoria incompatível: ${nome}`);
    for (const item of manifesto.correcoes) {
      const anterior = resultado[item.id_interno];
      const referencias = new Map((anterior?.referencias || []).map((r) => [r.url, r]));
      for (const referencia of item.referencias) {
        const url = new URL(referencia.url);
        if (!["http:", "https:"].includes(url.protocol) || url.hostname.endsWith(".local")) {
          throw new Error(`Referência inválida na curadoria: ${item.id_interno}`);
        }
        referencias.set(referencia.url, referencia);
      }
      resultado[item.id_interno] = {
        verificado_em: item.verificado_em,
        referencias: [...referencias.values()],
      };
    }
  }
  return resultado;
}
