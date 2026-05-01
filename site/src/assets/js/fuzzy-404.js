/**
 * Fuzzy match para página 404.
 *
 * Lê window.SLUGS (array { slug, nome, uf } embedado no HTML pelo template)
 * e o slug solicitado da URL. Calcula similaridade simples (Dice coefficient
 * sobre bigramas) entre o slug solicitado e cada slug existente. Mostra top 5.
 *
 * Sem dependência externa (~1KB minificado).
 */
(function () {
  "use strict";

  if (!Array.isArray(window.SLUGS) || window.SLUGS.length === 0) return;

  // Extrai o slug requisitado da URL atual.
  // Para URL /catalogo-politicas/politica/foo-bar/ → "foo-bar"
  // Para URL /catalogo-politicas/qualquer-outra-coisa → "qualquer-outra-coisa"
  const path = window.location.pathname.replace(/\/$/, "");
  const lastSegment = path.split("/").pop() || "";
  const requestedSlug = lastSegment.toLowerCase();

  if (!requestedSlug || requestedSlug === "404.html") return;

  // Computa similaridade entre o requisitado e cada candidato.
  const matches = window.SLUGS
    .map((p) => ({
      ...p,
      similarity: dice(requestedSlug, p.slug),
    }))
    .filter((p) => p.similarity > 0.3) // limiar mínimo
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  if (matches.length === 0) return;

  // Renderiza no <ul id="lista-fuzzy">
  const lista = document.querySelector("#lista-fuzzy");
  const status = document.querySelector("#fuzzy-status");
  if (!lista) return;

  for (const m of matches) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "/catalogo-politicas/politica/" + m.slug + "/";
    a.textContent = m.nome;
    li.appendChild(a);
    const span = document.createElement("span");
    span.className = "text-xs text-neutral-700 ml-sm";
    span.textContent = ` · ${m.uf} · ${Math.round(m.similarity * 100)}% parecido`;
    li.appendChild(span);
    lista.appendChild(li);
  }

  // Anuncia em live region (acessibilidade)
  if (status) {
    const plural = matches.length === 1 ? "sugestão" : "sugestões";
    status.textContent = `Encontramos ${matches.length} ${plural} parecidas com a URL solicitada.`;
  }

  // Mostra a seção (estava com hidden)
  const section = document.querySelector("#secao-fuzzy");
  if (section) section.removeAttribute("hidden");

  /**
   * Dice coefficient sobre bigramas — similaridade entre 0 e 1.
   * Boa para nomes/slugs com erros de digitação ou ordenação trocada.
   */
  function dice(a, b) {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    const bigramsA = bigrams(a);
    const bigramsB = bigrams(b);
    const intersection = bigramsA.filter((bg) => {
      const idx = bigramsB.indexOf(bg);
      if (idx === -1) return false;
      bigramsB.splice(idx, 1);
      return true;
    }).length;
    return (2 * intersection) / (bigrams(a).length + bigrams(b).length);
  }

  function bigrams(s) {
    const result = [];
    for (let i = 0; i < s.length - 1; i++) {
      result.push(s.slice(i, i + 2));
    }
    return result;
  }
})();