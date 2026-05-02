/**
 * Filtros locais nas páginas índice por dimensão (EX.2).
 *
 * Praticamente idêntico ao uf-filtros.js, mas adaptado para tabelas que têm
 * data-uf (em vez de filtrar pela UF da página, aqui filtra ENTRE UFs).
 *
 * Querystring esperada:
 *   - uf:        sigla (ex.: "PE", "SP", "BR")
 *   - situacao:  nome exato da situação
 *   - origem:    "federal" | "estadual"
 *   - snapshot:  "disponivel" | "indisponivel"
 */
(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const filtros = {
    uf: params.get("uf"),
    situacao: params.get("situacao"),
    origem: params.get("origem"),
    snapshot: params.get("snapshot"),
  };

  const ativos = Object.entries(filtros).filter(([_, v]) => v != null && v !== "");
  if (ativos.length === 0) return;

  const rows = document.querySelectorAll(".ficha-row");
  const contador = document.querySelector("#contador-fichas");
  const vazio = document.querySelector("#vazio-ficha");
  const filtrosAtivos = document.querySelector("#filtros-ativos");
  const chipsContainer = document.querySelector("#filtros-chips");
  const limparLinks = document.querySelectorAll(
    "#limpar-filtros, #limpar-filtros-vazio"
  );

  if (!rows.length) return;

  let visiveis = 0;
  for (const row of rows) {
    const matchUf =
      !filtros.uf || row.dataset.uf === filtros.uf.toUpperCase();
    const matchSituacao =
      !filtros.situacao || row.dataset.situacao === filtros.situacao;
    const matchOrigem =
      !filtros.origem || row.dataset.origem === filtros.origem;
    const matchSnapshot =
      !filtros.snapshot || row.dataset.snapshot === filtros.snapshot;

    const visivel = matchUf && matchSituacao && matchOrigem && matchSnapshot;
    row.hidden = !visivel;
    if (visivel) visiveis++;
  }

  if (contador) {
    contador.textContent = `${visiveis} de ${rows.length}`;
  }
  if (vazio) {
    vazio.classList.toggle("hidden", visiveis > 0);
  }

  // Atualiza href dos "Limpar filtros" para ser a URL atual sem queries
  for (const link of limparLinks) {
    link.href = window.location.pathname;
  }

  if (filtrosAtivos && chipsContainer) {
    filtrosAtivos.removeAttribute("hidden");
    const labels = {
      uf: "UF",
      situacao: "Situação",
      origem: "Origem",
      snapshot: "Snapshot",
    };
    const valoresAmigaveis = {
      origem: { federal: "Federal replicada", estadual: "Estadual única" },
      snapshot: { disponivel: "Disponível", indisponivel: "Indisponível" },
    };
    chipsContainer.innerHTML = "";
    for (const [k, v] of ativos) {
      const valorMostrar = (valoresAmigaveis[k] && valoresAmigaveis[k][v]) || v;
      const chip = document.createElement("span");
      chip.className = "tag tag--filter mx-2xs";
      chip.setAttribute("aria-pressed", "true");
      chip.textContent = `${labels[k]}: ${valorMostrar}`;

      const removeUrl = new URL(window.location.href);
      removeUrl.searchParams.delete(k);
      const remove = document.createElement("a");
      remove.href = removeUrl.toString();
      remove.setAttribute("aria-label", `Remover filtro ${labels[k]}`);
      remove.className = "ml-2xs font-bold no-underline hover:text-danger";
      remove.textContent = "✕";
      chip.appendChild(remove);

      chipsContainer.appendChild(chip);
    }
  }
})();