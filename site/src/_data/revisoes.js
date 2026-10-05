import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { csvParse } from "d3";
import { montarRevisoes } from "../../lib/revisoes.js";

const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/curadoria");
const REGISTRO = resolve(PASTA, "../derived/registro_fichas.csv");

export default function revisoes() {
  const manifestos = readdirSync(PASTA)
    .filter((nome) => /^(correcoes|novas)-.*\.json$/.test(nome)).sort()
    .map((nome) => JSON.parse(readFileSync(resolve(PASTA, nome), "utf-8")));
  const registros = existsSync(REGISTRO) ? csvParse(readFileSync(REGISTRO, "utf-8")) : [];
  return montarRevisoes(manifestos, registros);
}
