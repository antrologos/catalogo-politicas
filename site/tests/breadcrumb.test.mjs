import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import markdownIt from "markdown-it";

const includes = resolve(dirname(fileURLToPath(import.meta.url)), "../src/_includes");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(includes, { noCache: true }), { autoescape: true });
// Mesma biblioteca e opções padrão de Markdown do Eleventy; o projeto usa Nunjucks como pré-processador.
const markdown = markdownIt({ html: true }).disable("code");
const entrada = '{% include "components/breadcrumb.njk" %}\n\n# Conteúdo seguinte\n\nTexto da página.';

test("breadcrumb mantém links dentro dos itens após processamento Markdown", () => {
  const html = markdown.render(env.renderString(entrada, { crumbs: [
    { texto: "Início", href: "/" },
    { texto: "Sobre", href: "/sobre/" },
    { texto: "Página atual", href: "/atual/" },
  ] }));
  const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  const itens = [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  assert.equal(itens.length, 3);
  assert.match(itens[0], /<a href="\/">Início<\/a>/);
  assert.match(itens[1], /<a href="\/sobre\/">Sobre<\/a>/);
  assert.match(itens[2], /<span aria-current="page">Página atual<\/span>/);
  assert.doesNotMatch(nav, /<p\b/);
  assert.match(html, /<h1>Conteúdo seguinte<\/h1>/);
});

test("breadcrumb sem passos não produz navegação vazia nem interfere no Markdown", () => {
  const html = markdown.render(env.renderString(entrada, { crumbs: [] }));
  assert.doesNotMatch(html, /<nav\b|<ol\b/);
  assert.match(html, /<h1>Conteúdo seguinte<\/h1>/);
});
