/**
 * Filtros locais na página /uf/<sigla>/ (Sprint 6b).
 *
 * Lê querystring (?tipo=... &situacao=... &origem=...) e:
 * - Esconde linhas (.ficha-row) que não casam
 * - Atualiza contador
 * - Mostra chips de filtros ativos com botão "remover"
 * - Esconde tabela e mostra mensagem se 0 resultados
 *
 * Querystring esperada (chave: valor):
 * - tipo:        nome exato do tipo (ex.: "Educacional direta")
 * - situacao:    nome exato da situação (ex.: "Ativa / em execução")
 * - origem:      "federal" | "estadual"
 *
 * Sem JS: tabela permanece com todas as fichas (degradação aceita).
 */
(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const filtros = {
    tipo: params.get("tipo"),
    situacao: params.get("situacao"),
    origem: params.get("origem"),
  };

  // Sem nenhum filtro? Não faz nada.
  const ativos = Object.entries(filtros).filter(([_, v]) => v != null && v !== "");
  if (ativos.length === 0) return;

  const rows = document.querySelectorAll(".ficha-row");
  const contador = document.querySelector("#contador-fichas");
  const vazio = document.querySelector("#vazio-ficha");
  const filtrosAtivos = document.querySelector("#filtros-ativos");
  const chipsContainer = document.querySelector("#filtros-chips");

  if (!rows.length) return;

  let visiveis = 0;
  for (const row of rows) {
    const matchTipo =
      !filtros.tipo || row.dataset.tipo === filtros.tipo;
    const matchSituacao =
      !filtros.situacao || row.dataset.situacao === filtros.situacao;
    const matchOrigem =
      !filtros.origem || row.dataset.origem === filtros.origem;

    const visivel =
      matchTipo && matchSituacao && matchOrigem;
    row.hidden = !visivel;
    if (visivel) visiveis++;
  }

  // Atualiza contador
  if (contador) {
    contador.textContent = `${visiveis} de ${rows.length}`;
  }

  // Mostra/esconde mensagem de vazio
  if (vazio) {
    vazio.classList.toggle("hidden", visiveis > 0);
  }

  // Renderiza chips
  if (filtrosAtivos && chipsContainer) {
    filtrosAtivos.removeAttribute("hidden");
    const labels = {
      tipo: "Tipo",
      situacao: "Situação",
      origem: "Origem",
    };
    const valoresAmigaveis = {
      origem: { federal: "Federal replicada", estadual: "Estadual única" },
    };
    chipsContainer.innerHTML = "";
    for (const [k, v] of ativos) {
      const valorMostrar = (valoresAmigaveis[k] && valoresAmigaveis[k][v]) || v;
      const chip = document.createElement("span");
      chip.className = "tag tag--filter mx-2xs";
      chip.setAttribute("aria-pressed", "true");
      chip.textContent = `${labels[k]}: ${valorMostrar}`;

      // Botão "remover este filtro"
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