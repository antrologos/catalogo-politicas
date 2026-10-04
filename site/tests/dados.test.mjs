// Testes dos módulos de dados do site (src/_data). Rodam com `npm test`
// (node --test) e no CI. Usam o data/derived/latest.json real do repositório.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import policies from "../src/_data/policies.js";
import agregados from "../src/_data/agregados.js";
import dimensoes from "../src/_data/dimensoes.js";
import equipe from "../src/_data/equipe.js";
import ufs from "../src/_data/ufs.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..", "..");
const vocab = JSON.parse(
  readFileSync(resolve(RAIZ, ".claude/context/vocabulario-canonico.json"), "utf-8")
).campos;

test("policies não expõe réplicas federais e não repete slugs", () => {
  const lista = policies();
  assert.ok(lista.length > 0);
  assert.equal(lista.filter((p) => p.is_federal_replica).length, 0);
  assert.equal(new Set(lista.map((p) => p.slug)).size, lista.length);
});

test("agregados: total bate com policies e cobre a esfera federal + 27 UFs", () => {
  const a = agregados();
  assert.equal(a.total, policies().length);
  assert.equal(a.federaisCount + a.estaduaisUnicasCount, a.total);
  assert.ok(a.ufsCobertas.includes("BR"));
  assert.equal(a.ufsCobertas.length, 28);
  for (const uf of a.ufsCobertas) assert.ok(ufs[uf], `UF sem nome em ufs.js: ${uf}`);
});

test("páginas de dimensão só usam valores do vocabulário canônico", () => {
  const d = dimensoes();
  const mapa = {
    tipo: "tipo_politica",
    situacao: "situacao_atual",
    modalidade: "modalidade_oferta",
    abrangencia: "abrangencia_territorial",
  };
  for (const [dim, campo] of Object.entries(mapa)) {
    const canonicos = new Set(vocab[campo].canonical_values);
    for (const g of d[dim]) {
      assert.ok(canonicos.has(g.valor), `${dim}: valor fora do vocabulário: ${g.valor}`);
    }
  }
});

test("Rede EJA: 16 instituições, cada uma com link e logos existentes", () => {
  assert.equal(equipe.redeEja.length, 16);
  const linhas = equipe.redeEja.reduce((acc, i) => ((acc[i.linha] = (acc[i.linha] || 0) + 1), acc), {});
  assert.deepEqual(linhas, { 1: 5, 2: 5, 3: 6 });
  for (const inst of equipe.redeEja) {
    assert.match(inst.url, /^https?:\/\//, `${inst.nome} sem URL`);
    assert.ok(inst.logos.length >= 1, `${inst.nome} sem logo`);
    for (const arq of inst.logos) {
      const caminho = resolve(AQUI, "..", "src", "assets", "img", "rede", arq);
      assert.ok(existsSync(caminho), `logo ausente: ${arq}`);
    }
  }
});

test("link do Ceres não aponta para o domínio comprometido", () => {
  const todos = JSON.stringify(equipe);
  assert.ok(!todos.includes("ceres-iesp.uerj.br"));
});
