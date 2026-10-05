// Contratos editoriais da ficha renderizada: sem build, navegador ou escrita.
// Layout/includes reais e filtros/shortcodes da configuração Eleventy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import configurarEleventy from "../eleventy.config.js";
import policies from "../src/_data/policies.js";
import carregarRevisoes from "../src/_data/revisoes.js";
import site from "../src/_data/site.js";
import equipe from "../src/_data/equipe.js";
import ufs from "../src/_data/ufs.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
const INCLUDES = resolve(AQUI, "../src/_includes");
const SECOES = ["identificacao", "finalidade", "territorio", "referencias"];
const lista = policies();
const revisoes = carregarRevisoes();
// Permite executar o baseline anterior à criação deste módulo.
const notasEditoriais = existsSync(resolve(AQUI, "../src/_data/notasEditoriais.js"))
  ? (await import("../src/_data/notasEditoriais.js")).default : {};

function shortcode(nome, executar, assincrono = false) {
  return {
    tags: [nome],
    parse(parser, nodes) {
      const token = parser.nextToken();
      const args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(token.value);
      return assincrono
        ? new nodes.CallExtensionAsync(this, "run", args)
        : new nodes.CallExtension(this, "run", args);
    },
    run(context, ...args) {
      if (!assincrono) return new nunjucks.runtime.SafeString(executar(...args));
      const callback = args.pop();
      Promise.resolve(executar(...args)).then(
        (html) => callback(null, new nunjucks.runtime.SafeString(html)), callback,
      );
    },
  };
}

function ambiente() {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(INCLUDES, { noCache: true }),
    { autoescape: true },
  );
  configurarEleventy({
    addPlugin() {},
    addPassthroughCopy() {},
    addWatchTarget() {},
    addCollection() {},
    addFilter(nome, filtro) { env.addFilter(nome, filtro); },
    addShortcode(nome, executar) {
      env.addExtension(nome, shortcode(nome, executar));
    },
    addAsyncShortcode(nome, executar) {
      env.addExtension(nome, shortcode(nome, executar, true));
    },
  });
  return env;
}

async function renderizar(p, referenciasAuditadas = {}, revisoesTeste = revisoes) {
  // Front matter e encadeamento de layouts pertencem ao Eleventy.
  const fonte = readFileSync(resolve(INCLUDES, "layouts/ficha.njk"), "utf-8")
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  return new Promise((resolver, rejeitar) => {
    ambiente().renderString(fonte, {
      p, site, equipe, ufs, notasEditoriais, revisoes: revisoesTeste, referenciasAuditadas,
      policies: lista, relacionadas: {},
      sinonimos: { aliasesPorSlug: {} },
      page: { url: "/politica/" + p.slug + "/" },
    }, (erro, html) => erro ? rejeitar(erro) : resolver(html));
  });
}

function texto(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);|&#(x[0-9a-f]+|\d+);/gi, (entidade, nome, numero) => {
      if (numero) {
        const hexadecimal = numero.toLowerCase().startsWith("x");
        return String.fromCodePoint(parseInt(hexadecimal ? numero.slice(1) : numero, hexadecimal ? 16 : 10));
      }
      return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }[nome.toLowerCase()];
    }).replace(/\s+/g, " ").trim();
}
function normalizado(html) {
  return texto(html).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Reconhece details aninhados, sem depender de classes ou ordem de atributos.
function blocosDetails(html) {
  const pilha = [];
  const blocos = [];
  for (const tag of html.matchAll(/<\/?details\b[^>]*>/gi)) {
    if (/^<\//.test(tag[0])) {
      const inicio = pilha.pop();
      if (inicio !== undefined) blocos.push(html.slice(inicio, tag.index + tag[0].length));
    } else pilha.push(tag.index);
  }
  return blocos;
}
function semDetails(html) {
  for (const bloco of blocosDetails(html).sort((a, b) => b.length - a.length)) {
    html = html.replace(bloco, "");
  }
  return html;
}
function secao(html, id) {
  const titulos = [...html.matchAll(/<h2\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi)];
  const inicio = titulos.find((m) => m[1] === id);
  assert.ok(inicio, "seção editorial ausente: " + id);
  const restante = html.slice(inicio.index + inicio[0].length);
  const proximo = restante.search(/<h2\b/i);
  return proximo < 0 ? restante : restante.slice(0, proximo);
}
function fichaBase(alteracoes = {}) {
  const real = lista.find((p) => p.uf === "BR");
  assert.ok(real, "o catálogo precisa de uma ficha federal para o teste");
  return { ...real, id_interno: "ficha-de-teste", ...alteracoes };
}

test("ficha oferece quatro seções de leitura sem abas no conteúdo principal", async () => {
  const html = semDetails(await renderizar(fichaBase()));
  const ids = [...html.matchAll(/<h2\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  assert.deepEqual(ids.filter((id) => SECOES.includes(id)), SECOES);
  assert.doesNotMatch(html, /\brole\s*=\s*["'](?:tablist|tabpanel|tab)["']/i);
  assert.doesNotMatch(html, /\bdata-tab(?:s|-target)\b/i);
});

test("fonte não identificada nunca vira hiperlink para domínio .local", async () => {
  for (const fonte_url of [
    "https://fonte.local/ficha", "https://fonte.local", "https://FONTE.LOCAL/ficha",
  ]) {
    const html = await renderizar(fichaBase({ fonte_url }));
    const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)];
    const locais = links.filter((m) => {
      const host = new URL(m[2], "https://catalogo.example").hostname.toLowerCase();
      return host === "local" || host.endsWith(".local");
    });
    assert.equal(locais.length, 0, "placeholder publicado como link: " + fonte_url);
    assert.match(normalizado(secao(html, "referencias")),
      /(?:nao identificad|nao informad|sem (?:fonte|informacao))/);
  }
});

test("fonte externa identificada permanece acessível nas referências", async () => {
  const fonte_url = "https://www.exemplo.gov.br/norma-de-teste";
  const html = await renderizar(fichaBase({ fonte_url }));
  assert.ok(secao(html, "referencias").includes('href="' + fonte_url + '"'));
});

test("ficha incompleta explicita lacunas em vez de ocultar seções", async () => {
  const html = await renderizar(fichaBase({
    tipo_politica: null, esfera_formulacao: null, esfera_execucao: null,
    resumo: null, apresentacao: null, descricao_simples: null, descricao_tecnica: null,
    abrangencia_territorial: null, tipo_oferta: null, modalidade_oferta: null,
    arranjo_logistico: null, carga_horaria: null, ano_criacao: null,
    orgaos_lista: [], integra_lista: [], fonte_financiamento: null,
    transferencia_recursos: null, continuidade_governos: null,
    base_legal: null, fonte_url: null, fonte_data_acesso: null,
    fonte_data_acesso_br: null, situacao_atual: null,
  }));
  for (const id of SECOES) {
    assert.match(normalizado(secao(html, id)),
      /(?:nao (?:informad|cadastrad|identificad|registrad)|sem (?:informacao|descricao|registro))/,
      "lacuna não descrita na seção " + id);
  }
  assert.doesNotMatch(texto(html), /\b(?:undefined|null)\b/);
});

test("situação do levantamento não é funcionamento atual confirmado", async () => {
  const html = await renderizar(fichaBase({ situacao_atual: "Ativa / em execução", statusKey: "ativa" }));
  const conteudo = normalizado(html);
  assert.match(conteudo, /situacao no levantamento/);
  assert.match(conteudo, /funcionamento atual/);
  assert.match(conteudo, /nao[^.]{0,100}(?:confirm|garant|verific)/);
  assert.doesNotMatch(html, /\baria-label\s*=\s*["']Situação atual\b/i);
});

test("data de consulta da fonte não é apresentada como vigência", async () => {
  const html = await renderizar(fichaBase({
    fonte_url: "https://www.exemplo.gov.br/norma-de-teste",
    fonte_data_acesso: "2032-02-03", fonte_data_acesso_br: "03/02/2032",
  }));
  const referencias = normalizado(secao(html, "referencias"));
  assert.match(referencias, /(?:03\/02\/2032|2032-02-03)/);
  assert.match(referencias, /(?:acesso|consult|verific)[^.]{0,100}(?:03\/02\/2032|2032-02-03)/);
  assert.doesNotMatch(referencias,
    /(?:vigencia|vigente)\s*(?:desde|em|:)?\s*(?:03\/02\/2032|2032-02-03)/);
});

test("ficha do DF preserva rótulos distritais sem alterar o dado canônico", async () => {
  const real = lista.find((p) => p.uf === "DF");
  assert.ok(real, "o catálogo precisa conter uma ficha do DF");
  const p = { ...real, esfera_formulacao: "Estado", esfera_execucao: "Estado", abrangencia_territorial: "Estadual" };
  const html = await renderizar(p);
  const valores = [...html.matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].map((m) => texto(m[1]));
  assert.ok(valores.includes("Distrito Federal"));
  assert.ok(valores.includes("Distrital"));
  assert.equal(p.esfera_formulacao, "Estado");
  assert.equal(p.esfera_execucao, "Estado");
  assert.equal(p.abrangencia_territorial, "Estadual");
});

test("citação completa está em details e usa os filtros reais", async () => {
  const html = await renderizar(fichaBase());
  const bibtex = blocosDetails(html).find((bloco) => /@incollection\s*\{/.test(bloco));
  assert.ok(bibtex, "citação BibTeX precisa estar em details");
  assert.match(bibtex, /<summary\b/i);
  assert.match(bibtex, /booktitle\s*=/);
  assert.match(bibtex, /publisher\s*=/);
  assert.match(bibtex, /\/politica\//);
});

test("EJA nacional corrigida apresenta fontes nacionais e alcance da revisão", async () => {
  const p = lista.find((f) => f.slug === "educacao-de-jovens-e-adultos-eja-br");
  assert.ok(p);
  const html = await renderizar(p);
  assert.doesNotMatch(texto(secao(html, "finalidade")), /600 escolas|151 escolas|Seduc-SP/i);
  const referencias = secao(html, "referencias");
  assert.match(referencias, /l9394compilado\.htm/);
  assert.match(normalizado(referencias), /alcance da revisao/);
  assert.match(normalizado(referencias), /05\/10\/2026/);
});

test("data da curadoria não inventa data de captura", async () => {
  const p = lista.find((f) => revisoes[f.id_interno]);
  assert.ok(p);
  const html = await renderizar({ ...p, fonte_data_acesso: null, fonte_data_acesso_br: null });
  const referencias = normalizado(secao(html, "referencias"));
  assert.match(referencias, /consulta registrada na captura/);
  assert.match(referencias, /data nao informada/);
  assert.match(referencias, /nao confirmam a continuidade/);
});

test("referências de revisão são links públicos com título e data e fontes herdadas permanecem acessíveis", async () => {
  assert.ok(Object.keys(revisoes).length > 0);
  for (const p of lista.filter((f) => revisoes[f.id_interno])) {
    const refs = revisoes[p.id_interno].referencias;
    const editorial = revisoes[p.id_interno].nivel === "leitura_editorial_evidencia_insuficiente";
    assert.ok(refs.length > 0 || (editorial && p.duvidas_revisor), p.id_interno + ": ausência de fonte exige alcance editorial explícito");
    assert.ok(refs.every((r) => r.titulo && /^https?:\/\//.test(r.url) && /^\d{4}-\d{2}-\d{2}$/.test(r.consultado_em)));
    const urlsAtuais = revisoes[p.id_interno].urls_da_revisao;
    assert.ok(Array.isArray(urlsAtuais));
    assert.ok(urlsAtuais.every((url) => refs.some((r) => r.url === url)));
    if (p.fonte_url && !/\.local/.test(p.fonte_url) && !urlsAtuais.includes(p.fonte_url)) {
      const html = secao(await renderizar(p), "referencias");
      assert.ok(html.includes('href="' + p.fonte_url.replace(/&/g, "&amp;") + '"'), p.id_interno + ": fonte herdada deve permanecer acessível");
      assert.match(texto(html), /Referência indicada no levantamento — não revalidada nesta revisão/);
    }
  }
});

test("erro de acesso à fonte não se torna encerramento da política", async () => {
  const p = fichaBase({ fonte_url: "https://www.exemplo.gov.br/pagina", situacao_atual: "Ativa / em execução" });
  const html = await renderizar(p, { [p.fonte_url]: {
    mensagem: "O servidor retornou página não encontrada na verificação de acesso.", checado_em: "2026-10-05T04:00:00+00:00",
  } });
  const refs = normalizado(secao(html, "referencias"));
  assert.match(refs, /pagina nao encontrada/);
  assert.match(refs, /nao informa a situacao/);
  assert.doesNotMatch(normalizado(secao(html, "identificacao")), /encerrad/);
});

const NIVEL_EDITORIAL = "leitura_editorial_evidencia_insuficiente";

test("revisão editorial sem nova consulta preserva a fonte original, alcance e datas distintas", async () => {
  const p = fichaBase({
    fonte_url: "https://www.exemplo.gov.br/levantamento",
    fonte_data_acesso_br: "03/02/2025",
    duvidas_revisor: "Leitura editorial: execução atual não confirmada; sem nova consulta a fonte primária.",
  });
  const revisao = { nivel: NIVEL_EDITORIAL, verificado_em: "2026-10-07", referencias: [], tem_referencias_na_revisao: false };
  const html = await renderizar(p, {}, { [p.id_interno]: revisao });
  const refs = secao(html, "referencias");
  assert.ok(refs.includes('href="' + p.fonte_url + '"'));
  assert.match(texto(refs), /Referência indicada no levantamento — não revalidada nesta revisão/);
  assert.doesNotMatch(refs, /<ul\b[^>]*class="policy-references"/);
  assert.doesNotMatch(texto(refs), /Referências da revisão|Consulta em 07\/10\/2026/);
  assert.match(texto(refs), /Alcance da revisão editorial de 07\/10\/2026/);
  assert.match(texto(html), /a revisão indicada na seção Referências/);
  assert.doesNotMatch(texto(html), /revisão documental indicada/);
  assert.match(texto(refs), /Consulta registrada na captura 03\/02\/2025/);
  assert.match(texto(secao(html, "finalidade")), /Descrição revisada editorialmente/);
  assert.doesNotMatch(texto(secao(html, "finalidade")), /revisada com as referências/);
  const semFonte = await renderizar({ ...p, fonte_url: null, fonte_data_acesso_br: null }, {}, { [p.id_interno]: revisao });
  assert.match(texto(secao(semFonte, "referencias")), /Link de referência não identificado/);
  assert.doesNotMatch(texto(secao(semFonte, "referencias")), /Consulta em 07\/10\/2026/);
});

test("revisão editorial posterior não atribui consulta nova às evidências anteriores", async () => {
  const p = fichaBase({ fonte_url: "https://www.exemplo.gov.br/levantamento", duvidas_revisor: "Sem nova consulta." });
  const html = await renderizar(p, {}, { [p.id_interno]: {
    nivel: NIVEL_EDITORIAL, verificado_em: "2026-10-07", tem_referencias_na_revisao: false,
    referencias: [{ url: "https://www.exemplo.gov.br/anterior", titulo: "Fonte da revisão anterior", consultado_em: "2026-10-05" }],
  } });
  const refs = secao(html, "referencias");
  assert.ok(refs.includes('href="' + p.fonte_url + '"'));
  assert.match(texto(refs), /Consulta em 05\/10\/2026/);
  assert.doesNotMatch(texto(refs), /Consulta em 07\/10\/2026/);
  assert.match(texto(refs), /não revalidada nesta revisão/);
});

test("revisão documental com nova norma preserva fonte herdada sem fingir reconsulta", async () => {
  const p = fichaBase({ fonte_url: "https://www.exemplo.gov.br/levantamento", fonte_data_acesso_br: "03/02/2025", duvidas_revisor: "Revisão restrita ao marco legal consultado." });
  const html = await renderizar(p, {}, { [p.id_interno]: {
    nivel: "documental", verificado_em: "2026-10-07", tem_referencias_na_revisao: true,
    urls_da_revisao: ["https://www.exemplo.gov.br/norma"],
    referencias: [{ url: "https://www.exemplo.gov.br/norma", titulo: "Norma consultada", consultado_em: "2026-10-07" }],
  } });
  const refs = secao(html, "referencias");
  assert.ok(refs.includes('href="' + p.fonte_url + '"'));
  assert.ok(refs.includes('href="https://www.exemplo.gov.br/norma"'));
  assert.match(texto(refs), /Consulta em 07\/10\/2026/);
  assert.match(texto(refs), /Referência indicada no levantamento — não revalidada nesta revisão/);
  assert.match(texto(refs), /Consulta registrada na captura 03\/02\/2025/);
  const listaRef = refs.match(/<ul class="policy-references">([\s\S]*?)<\/ul>/)[1];
  assert.ok(!listaRef.includes(p.fonte_url));
});

test("referência contextual não encobre ausência de fonte principal identificada", async () => {
  const p = fichaBase({ fonte_url: null, fonte_data_acesso_br: null, duvidas_revisor: "Fonte do programa não identificada; homônimo descartado." });
  const html = await renderizar(p, {}, { [p.id_interno]: {
    nivel: NIVEL_EDITORIAL, verificado_em: "2026-10-05", tem_referencias_na_revisao: true,
    urls_da_revisao: ["https://www.exemplo.gov.br/homonimo"],
    referencias: [{ url: "https://www.exemplo.gov.br/homonimo", titulo: "Programa distinto: referência de delimitação", consultado_em: "2026-10-05" }],
  } });
  const refs = secao(html, "referencias");
  assert.match(texto(refs), /Link de referência não identificado/);
  assert.match(refs, /href="https:\/\/www.exemplo.gov.br\/homonimo"/);
  assert.doesNotMatch(refs, /<a\b[^>]*class="[^"]*\bpolicy-reference(?:\s|")/);
});