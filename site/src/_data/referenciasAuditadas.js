import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/auditoria");

export default function referenciasAuditadas() {
  if (!existsSync(PASTA)) return {};
  const nomes = readdirSync(PASTA).filter((nome) => /^referencias-http-\d{4}-\d{2}-\d{2}\.json$/.test(nome)).sort().reverse();
  const dados = nomes.map((nome) => JSON.parse(readFileSync(resolve(PASTA, nome), "utf-8"))).find((item) => item.concluido);
  if (!dados) return {};
  const porUrl = {};
  for (const item of dados.resultados || []) {
    let mensagem = null;
    if (item.status_class === "not_found_404") {
      mensagem = "O servidor retornou página não encontrada na verificação de acesso. O endereço permanece registrado para identificar a referência.";
    } else if (item.alertas?.includes("redirecionamento_para_pagina_generica")) {
      mensagem = "Na verificação de acesso, o endereço levou a uma página genérica, em vez do documento esperado.";
    } else if (item.alertas?.some((a) => ["destino_de_autenticacao", "titulo_indica_erro_ou_bloqueio"].includes(a))) {
      mensagem = "Na verificação de acesso, o endereço apresentou uma página de autenticação, erro ou restrição.";
    }
    if (mensagem) porUrl[item.url] = { mensagem, checado_em: item.checado_em };
  }
  return porUrl;
}
