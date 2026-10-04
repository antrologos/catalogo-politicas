/**
 * Filtros da página /uf/<sigla>/.
 *
 * Campos: tipo, situacao, modalidade. Cada um aceita na URL o valor exato
 * ("Ativa / em execução", usado pelos links da comparação) ou o slug
 * ("ativa-em-execucao", mais legível) — a comparação é feita por slug.
 *
 * - Lê a querystring na carga e aplica o filtro às linhas .ficha-row
 * - Sincroniza os <select> do formulário #filtros-uf
 * - Ao mudar um select, filtra sem recarregar e atualiza a URL
 * - Atualiza contador, chips de filtros ativos e mensagem de vazio
 *
 * Sem JS: o formulário é GET e a tabela mostra todas as fichas.
 */
(function () {
  "use strict";

  const CAMPOS = { tipo: "Tipo", situacao: "Situação", modalidade: "Modalidade" };

  const slug = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const rows = Array.from(document.querySelectorAll(".ficha-row"));
  if (!rows.length) return;

  const form = document.querySelector("#filtros-uf");
  const contador = document.querySelector("#contador-fichas");
  const vazio = document.querySelector("#vazio-ficha");
  const filtrosAtivos = document.querySelector("#filtros-ativos");
  const chipsContainer = document.querySelector("#filtros-chips");

  function lerUrl() {
    const params = new URLSearchParams(window.location.search);
    const filtros = {};
    for (const campo of Object.keys(CAMPOS)) {
      const v = slug(params.get(campo));
      if (v) filtros[campo] = v;
    }
    return filtros;
  }

  function lerForm() {
    const filtros = {};
    if (!form) return filtros;
    for (const campo of Object.keys(CAMPOS)) {
      const sel = form.elements[campo];
      if (sel && sel.value) filtros[campo] = slug(sel.value);
    }
    return filtros;
  }

  // Texto amigável de um valor: o rótulo da opção correspondente no select
  function rotulo(campo, valor) {
    const sel = form && form.elements[campo];
    const opt = sel && Array.from(sel.options).find((o) => slug(o.value) === valor);
    return opt ? opt.dataset.rotulo || opt.textContent.trim() : valor;
  }

  function atualizarUrl(filtros) {
    const params = new URLSearchParams();
    for (const [campo, valor] of Object.entries(filtros)) params.set(campo, valor);
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function aplicar(filtros) {
    const ativos = Object.entries(filtros);
    let visiveis = 0;
    for (const row of rows) {
      const casa = ativos.every(([campo, valor]) => slug(row.dataset[campo]) === valor);
      row.hidden = !casa;
      if (casa) visiveis++;
    }

    if (contador) {
      contador.textContent = ativos.length ? `${visiveis} de ${rows.length}` : String(rows.length);
    }
    if (vazio) vazio.classList.toggle("hidden", visiveis > 0);

    if (form) {
      for (const campo of Object.keys(CAMPOS)) {
        const sel = form.elements[campo];
        if (!sel) continue;
        const opt = Array.from(sel.options).find((o) => slug(o.value) === (filtros[campo] || ""));
        sel.value = opt ? opt.value : "";
      }
    }

    if (filtrosAtivos && chipsContainer) {
      filtrosAtivos.hidden = ativos.length === 0;
      chipsContainer.innerHTML = "";
      for (const [campo, valor] of ativos) {
        const chip = document.createElement("span");
        chip.className = "tag tag--filter tag--filter-ativo mx-2xs";
        chip.textContent = `${CAMPOS[campo]}: ${rotulo(campo, valor)}`;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.setAttribute("aria-label", `Remover filtro ${CAMPOS[campo]}`);
        remover.className = "ml-2xs font-bold bg-transparent border-0 cursor-pointer hover:text-danger";
        remover.textContent = "✕";
        remover.addEventListener("click", () => {
          const novos = { ...filtros };
          delete novos[campo];
          aplicar(novos);
          atualizarUrl(novos);
        });
        chip.appendChild(remover);
        chipsContainer.appendChild(chip);
      }
    }
  }

  if (form) {
    const aoMudar = (ev) => {
      if (ev) ev.preventDefault();
      const filtros = lerForm();
      aplicar(filtros);
      atualizarUrl(filtros);
    };
    form.addEventListener("change", () => aoMudar());
    form.addEventListener("submit", aoMudar);
    // O botão "Aplicar" só é necessário sem JavaScript
    const aplicarBtn = form.querySelector("[data-sem-js]");
    // Com JS o filtro é imediato; o botão fica só para leitores de tela/teclado
    // (formulário sem botão de envio é falha de acessibilidade)
    if (aplicarBtn) aplicarBtn.classList.add("sr-only");
  }

  aplicar(lerUrl());
})();
