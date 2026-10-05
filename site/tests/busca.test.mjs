import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RETURN_MAX_AGE, buildSearchUrl, readSearchState, normalizeFilters,
  removeFilter, countFilters, staticTerritoryUrl, readReturnState, prepareResult, pagefindFilters,
} from "../src/assets/js/catalogo-busca-estado.js";

test("URL compartilha todas as facetas com seleções múltiplas e acentos", () => {
  const state = {
    query: "Educação e trabalho",
    filters: {
      UF: ["SP", "DF", "DF"],
      Tipo: ["Educacional"],
      "Situação": ["Ativa / em execução", "Sem informação"],
      Modalidade: ["Presencial", "Mista"],
    },
  };
  const url = buildSearchUrl(state);
  const params = new URL(url, "https://catalogo.example").searchParams;
  assert.deepEqual(params.getAll("uf"), ["DF", "SP"]);
  assert.deepEqual(params.getAll("situacao"), ["Ativa / em execução", "Sem informação"]);
  assert.deepEqual(readSearchState(params.toString()), {
    query: state.query, filters: normalizeFilters(state.filters),
  });
});

test("filtros inválidos e valores duplicados não entram no estado compartilhado", () => {
  assert.deepEqual(readSearchState("?q=%20EJA%20&uf=df&uf=DF&uf=XX&tipo=Educacional&tipo=Educacional&desconhecido=valor"), {
    query: "EJA", filters: { UF: ["DF"], Tipo: ["Educacional"] },
  });
  assert.deepEqual(normalizeFilters({ Tipo: ["", null, "  Educacional  "], Outro: ["x"] }), {
    Tipo: ["Educacional"],
  });
});

test("remover seleção não apaga o termo nem outras categorias", () => {
  const original = { UF: ["DF", "SP"], Tipo: ["Educacional"] };
  const filters = removeFilter(original, "UF", "DF");
  assert.equal(countFilters(filters), 2);
  assert.deepEqual(original.UF, ["DF", "SP"]);
  assert.equal(buildSearchUrl({ query: "EJA", filters }), "/catalogo-politicas/buscar/?q=EJA&uf=SP&tipo=Educacional");
  assert.equal(buildSearchUrl({ query: "EJA", filters: {} }), "/catalogo-politicas/buscar/?q=EJA");
});

test("consulta territorial antiga sem termo continua levando à lista estática", () => {
  assert.equal(staticTerritoryUrl(readSearchState("?uf=df")), "/catalogo-politicas/uf/df/");
  assert.equal(staticTerritoryUrl(readSearchState("?q=EJA&uf=DF")), null);
  assert.equal(staticTerritoryUrl(readSearchState("?uf=DF&uf=SP")), null);
  assert.equal(staticTerritoryUrl(readSearchState("?uf=DF&tipo=Educacional")), null);
});

const now = 1_800_000_000_000;
const current = "https://catalogo.example/catalogo-politicas/buscar/?q=EJA&uf=DF";
const validReturn = {
  version: 1, url: "/catalogo-politicas/buscar/?uf=DF&q=EJA",
  resultPath: "/catalogo-politicas/politica/projovem-urbano-e-campo-df/",
  visibleResults: 20, scrollY: 1234, updatedAt: now - 1000,
};
const read = (overrides = {}, url = current) =>
  readReturnState(JSON.stringify({ ...validReturn, ...overrides }), url, now);

test("retorno preserva quantidade e posição somente para a mesma consulta", () => {
  assert.equal(read().visibleResults, 20);
  assert.equal(read().scrollY, 1234);
  assert.equal(read({}, current.replace("uf=DF", "uf=SP")), null);
  assert.equal(read({}, current.replace("q=EJA", "q=PROEJA")), null);
});

test("retorno expirado ou malformado é descartado sem quebrar a busca", () => {
  assert.equal(read({ updatedAt: now - RETURN_MAX_AGE - 1 }), null);
  assert.equal(read({ updatedAt: now + 1000 }), null);
  assert.equal(read({ visibleResults: -1 }), null);
  assert.equal(read({ scrollY: "1000" }), null);
  assert.equal(readReturnState("{inválido", current, now), null);
});

test("estado de retorno não aceita endereços externos ou outra rota", () => {
  assert.equal(read({ url: "//outro.example/catalogo-politicas/buscar/?q=EJA&uf=DF" }), null);
  assert.equal(read({ url: "https://outro.example/catalogo-politicas/buscar/?q=EJA&uf=DF" }), null);
  assert.equal(read({ url: "/catalogo-politicas/sobre/?q=EJA&uf=DF" }), null);
  assert.equal(read({ resultPath: "/outro-projeto/politica/registro/" }), null);
  assert.equal(read({ resultPath: "/catalogo-politicas/politica/registro/#fragmento" }), null);
});

test("metadados do resultado mostram território e área sem apresentar ano como oferta", () => {
  const original = {
    url: "/politica/exemplo/", excerpt: "Texto com <mark>EJA</mark>.",
    meta: { title: "Exemplo", uf: "BR", tipo: "Educacional", ano: "1996", interno: "código" },
  };
  const result = prepareResult(original);
  assert.deepEqual(result.meta, { title: "Exemplo", "território": "Federal (Brasil)", "área": "Educacional" });
  assert.equal(result.excerpt, original.excerpt);
  assert.equal(original.meta.ano, "1996");
  assert.deepEqual(prepareResult({ meta: { title: "Sem metadados" } }).meta, { title: "Sem metadados" });
});

test("API Pagefind recebe OU nas quatro facetas e E entre facetas", () => {
  assert.deepEqual(pagefindFilters({ UF: ["SP", "DF"], Tipo: ["Educacional"], "Situação": ["Sem informação", "Ativa / em execução"], Modalidade: ["Mista", "Presencial"] }), {
    UF: { any: ["DF", "SP"] }, Tipo: { any: ["Educacional"] }, "Situação": { any: ["Ativa / em execução", "Sem informação"] }, Modalidade: { any: ["Mista", "Presencial"] },
  });
  assert.deepEqual(pagefindFilters({}), {});
  assert.deepEqual(pagefindFilters({ UF: ["XX"] }), {});
});

test("trecho prefere descrição original e escapa HTML sem alterar a fonte", () => {
  const original = {
    excerpt: "Campos <mark>EJA</mark> concatenados.",
    meta: { title: "Exemplo", descricao: '  Atende jovens & adultos.\nTexto com <script>alert("x")</script> e \'aspas\'.  ' },
  };
  const result = prepareResult(original);
  assert.equal(result.excerpt, "Atende jovens &amp; adultos. Texto com &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; e &#39;aspas&#39;.");
  assert.equal(original.excerpt, "Campos <mark>EJA</mark> concatenados.");
  assert.ok(original.meta.descricao.includes("<script>"));
  assert.deepEqual(result.meta, { title: "Exemplo" });
});

test("descrição longa termina em palavra completa e mantém o conteúdo original", () => {
  const description = "Apoio à permanência de jovens e adultos na educação. ".repeat(12).trim();
  const excerpt = prepareResult({ meta: { descricao: description } }).excerpt;
  assert.ok(excerpt.length >= 280 && excerpt.length <= 301);
  assert.ok(excerpt.endsWith("…"));
  const retained = excerpt.slice(0, -1);
  assert.ok(description.startsWith(retained));
  assert.equal(description[retained.length], " ");
  assert.equal(prepareResult({ meta: { descricao: "Descrição curta e fiel." } }).excerpt, "Descrição curta e fiel.");
});

test("ausência de descrição conserva trecho Pagefind e marcação de destaque", () => {
  const excerpt = "Texto com <mark>EJA</mark>.";
  for (const descricao of [undefined, null, "", "  \n  "]) {
    assert.equal(prepareResult({ excerpt, meta: { descricao } }).excerpt, excerpt);
  }
});
