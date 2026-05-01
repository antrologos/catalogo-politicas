/**
 * Busca + filtros facetados — vanilla JS (sem framework).
 *
 * Estratégia: como o PoC tem 10 fichas pré-renderizadas, fazemos filtragem
 * client-side em DOM. Em produção (439 fichas), trocamos por Pagefind.
 *
 * URL como estado: filtros sincronizam com query string (?uf=SP,MG&situacao=Ativa).
 */
(function () {
  "use strict";

  const lista = document.querySelector("#lista-resultados");
  const contador = document.querySelector("#contador");
  const busca = document.querySelector("#busca-input");
  const vazio = document.querySelector("#vazio");
  const filtros = document.querySelectorAll(".filter-input");

  if (!lista || !contador) return;

  // ---- Carregar estado inicial da URL
  const params = new URLSearchParams(window.location.search);
  for (const inp of filtros) {
    const valores = (params.get(inp.name) || "").split(",").filter(Boolean);
    if (valores.includes(inp.value)) inp.checked = true;
  }
  if (params.has("q")) busca.value = params.get("q");

  // ---- Aplicar filtros
  function aplicar() {
    const q = (busca.value || "").trim().toLowerCase();
    const filtrosAtivos = {};
    for (const inp of filtros) {
      if (!inp.checked) continue;
      (filtrosAtivos[inp.name] ??= new Set()).add(inp.value);
    }

    let visiveis = 0;
    for (const item of lista.querySelectorAll(".resultado")) {
      const matchTexto =
        !q ||
        item.dataset.nome.includes(q) ||
        item.dataset.resumo.includes(q);

      const matchFiltros = Object.entries(filtrosAtivos).every(
        ([key, valores]) => valores.has(item.dataset[key])
      );

      const visivel = matchTexto && matchFiltros;
      item.hidden = !visivel;
      if (visivel) visiveis++;
    }

    contador.textContent = visiveis;
    vazio.classList.toggle("hidden", visiveis > 0);
    atualizarUrl(filtrosAtivos, q);
  }

  function atualizarUrl(filtrosAtivos, q) {
    const params = new URLSearchParams();
    for (const [key, valores] of Object.entries(filtrosAtivos)) {
      params.set(key, [...valores].join(","));
    }
    if (q) params.set("q", q);
    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState(null, "", newUrl);
  }

  // ---- Eventos
  busca.addEventListener("input", debounce(aplicar, 150));
  for (const inp of filtros) inp.addEventListener("change", aplicar);

  // ---- Aplicar estado inicial
  aplicar();

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
})();
