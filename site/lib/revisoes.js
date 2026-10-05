// Evidências documentam a revisão; não certificam vigência ou execução.
// Novas entradas usam o mesmo registro persistente de IDs do pipeline.
export function montarRevisoes(manifestos, registros = []) {
  const resultado = {};
  const porChave = new Map();
  for (const registro of registros) {
    if (!registro.chave?.startsWith("curadoria|")) continue;
    if (porChave.has(registro.chave)) throw new Error("Chave duplicada no registro: " + registro.chave);
    porChave.set(registro.chave, registro);
  }
  for (const manifesto of manifestos) {
    if (manifesto.versao !== 1) throw new Error("Curadoria incompatível");
    const novas = Array.isArray(manifesto.experiencias);
    const itens = novas ? manifesto.experiencias : manifesto.correcoes;
    if (!Array.isArray(itens)) throw new Error("Entradas de curadoria ausentes");
    for (const item of itens) {
      let id = item.id_interno;
      if (novas) {
        const registro = porChave.get("curadoria|" + item.chave_fonte);
        if (!registro || registro.ativo !== "True") {
          throw new Error("Nova experiência sem registro ativo: " + item.chave_fonte);
        }
        id = registro.id_interno;
      }
      if (!id) throw new Error("Curadoria sem identidade resolvida");
      const anterior = resultado[id];
      const referencias = new Map((anterior?.referencias || []).map((r) => [r.url, r]));
      for (const referencia of item.referencias) {
        const url = new URL(referencia.url);
        if (!["http:", "https:"].includes(url.protocol)
            || url.hostname === "localhost" || url.hostname.endsWith(".local")
            || url.username || url.password) {
          throw new Error("Referência inválida na curadoria: " + id);
        }
        const anteriorRef = referencias.get(referencia.url);
        if (!anteriorRef || anteriorRef.consultado_em <= referencia.consultado_em) {
          referencias.set(referencia.url, referencia);
        }
      }
      const maisRecente = !anterior || item.verificado_em >= anterior.verificado_em;
      resultado[id] = {
        verificado_em: [anterior?.verificado_em, item.verificado_em].filter(Boolean).sort().at(-1),
        nivel: maisRecente ? (item.nivel || "documental") : anterior.nivel,
        tem_referencias_na_revisao: maisRecente ? item.referencias.length > 0 : anterior.tem_referencias_na_revisao,
        urls_da_revisao: maisRecente ? [...new Set(item.referencias.map((r) => r.url))] : anterior.urls_da_revisao,
        referencias: [...referencias.values()],
      };
    }
  }
  return resultado;
}
