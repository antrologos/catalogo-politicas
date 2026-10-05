import test from "node:test";
import assert from "node:assert/strict";
import { csvParse } from "d3";
import { montarRevisoes } from "../lib/revisoes.js";

const ref = (url, data = "2026-10-05") => ({ url, titulo: "Fonte pública", consultado_em: data });
const nova = (key = "am:programa") => ({
  versao: 1, experiencias: [{
    chave_fonte: key, campos: { nome: "Título que pode mudar" },
    verificado_em: "2026-10-05", referencias: [ref("https://www.gov.br/fonte")],
  }],
});
const registro = [{ chave: "curadoria|am:programa", id_interno: "FRM-CP-2026-EDU-0999", ativo: "True" }];

test("referências resolvem pela chave persistente, sem depender do nome ou ordem", () => {
  const csv = 'chave,id_interno,nome,ativo\ncuradoria|am:programa,FRM-CP-2026-EDU-0999,"Título, com vírgula\ne quebra",True\n';
  const resultado = montarRevisoes([nova()], csvParse(csv));
  assert.equal(resultado["FRM-CP-2026-EDU-0999"].referencias[0].url, "https://www.gov.br/fonte");
  assert.equal(resultado["FRM-CP-2026-EDU-0999"].verificado_em, "2026-10-05");
});

test("correção posterior agrega evidências sem recuar a data e deduplica URLs", () => {
  const correcao = { versao: 1, correcoes: [{
    id_interno: registro[0].id_interno, verificado_em: "2026-10-06",
    referencias: [ref("https://www.gov.br/fonte", "2026-10-06"), ref("https://www.gov.br/outra", "2026-10-06")],
  }] };
  const resultado = montarRevisoes([correcao, nova()], registro)[registro[0].id_interno];
  assert.equal(resultado.verificado_em, "2026-10-06");
  assert.equal(resultado.referencias.length, 2);
  assert.equal(resultado.referencias.find((r) => r.url.endsWith("/fonte")).consultado_em, "2026-10-06");
});

test("sem identidade ativa e registro ambíguo impedem associação errada", () => {
  assert.throws(() => montarRevisoes([nova()], []), /sem registro ativo/);
  assert.throws(() => montarRevisoes([nova()], [{ ...registro[0], ativo: "False" }]), /sem registro ativo/);
  assert.throws(() => montarRevisoes([nova()], [...registro, ...registro]), /duplicada/);
});

test("referências locais ou credenciais não são publicadas", () => {
  for (const url of ["https://placeholder.local/fonte", "http://localhost/fonte", "https://user:pass@exemplo.gov.br/fonte"]) {
    const entrada = nova();
    entrada.experiencias[0].referencias = [ref(url)];
    assert.throws(() => montarRevisoes([entrada], registro), /inválida/);
  }
});

const NIVEL_EDITORIAL = "leitura_editorial_evidencia_insuficiente";

test("revisão editorial preserva nível e não se torna consulta documental", () => {
  const id = registro[0].id_interno;
  const entrada = { versao: 1, correcoes: [{
    id_interno: id, verificado_em: "2026-10-07", nivel: NIVEL_EDITORIAL, referencias: [],
  }] };
  const apenas = montarRevisoes([entrada])[id];
  assert.equal(apenas.nivel, NIVEL_EDITORIAL);
  assert.equal(apenas.tem_referencias_na_revisao, false);
  assert.deepEqual(apenas.referencias, []);
  const comHistorico = montarRevisoes([entrada, nova()], registro)[id];
  assert.equal(comHistorico.nivel, NIVEL_EDITORIAL);
  assert.equal(comHistorico.verificado_em, "2026-10-07");
  assert.equal(comHistorico.tem_referencias_na_revisao, false);
  assert.equal(comHistorico.referencias[0].consultado_em, "2026-10-05");
});
test("fonte herdada não é marcada como consulta da revisão mais recente", () => {
  const id = registro[0].id_interno;
  const antiga = nova();
  const recente = { versao: 1, correcoes: [{
    id_interno: id, verificado_em: "2026-10-07",
    referencias: [ref("https://www.gov.br/norma-nova", "2026-10-07")],
  }] };
  const resultado = montarRevisoes([recente, antiga], registro)[id];
  assert.deepEqual(resultado.urls_da_revisao, ["https://www.gov.br/norma-nova"]);
  assert.equal(resultado.referencias.length, 2);
  assert.equal(resultado.referencias.find(r => r.url === "https://www.gov.br/fonte").consultado_em, "2026-10-05");
});
test("carregador real do Eleventy executa o módulo de revisões globais", async () => {
  const { EleventyImport } = await import("../node_modules/@11ty/eleventy/src/Util/Require.js");
  const { fileURLToPath } = await import("node:url");
  const carregar = await EleventyImport(fileURLToPath(new URL("../src/_data/revisoes.js", import.meta.url)), "esm");
  assert.equal(typeof carregar, "function", "exports nomeados impedem o Eleventy de executar o default");
  const dados = await carregar();
  assert.ok(Object.keys(dados).some(id => /^FRM-CP-/.test(id)));
  assert.ok(Object.values(dados).every(r => Array.isArray(r.referencias) && Array.isArray(r.urls_da_revisao)));
});