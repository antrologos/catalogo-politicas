/**
 * Comparação inter-UF (Sprint 7).
 *
 * Lê window.AGREGADOS_UF (objeto { sigla: { total, ativas, ... } }) e
 * window.UFS_INFO (lookup { sigla: { nome, regiao } }) embedados pelo template.
 *
 * Comportamento:
 * - Lê ?ufs=sp,rj,mg da URL
 * - Marca os checkboxes correspondentes
 * - Renderiza tabela comparativa
 * - Atualiza URL ao alterar checkboxes (sem reload, via History API)
 * - Botão "Copiar link desta comparação" usa data-copy-target apontando para
 *   span #link-atual que é atualizado dinamicamente
 */
(function () {
  "use strict";

  if (!window.AGREGADOS_UF || !window.UFS_INFO) return;

  const checkboxes = document.querySelectorAll(".comp-ufs-input");
  const resultados = document.querySelector("#resultados");
  const vazio = document.querySelector("#vazio");
  const status = document.querySelector("#resultados-status");
  const thead = document.querySelector("#comp-thead");
  const tbody = document.querySelector("#comp-tbody");
  const linkAtualSpan = document.querySelector("#link-atual");

  if (!checkboxes.length || !thead || !tbody) return;

  // Lê seleção da URL
  const params = new URLSearchParams(window.location.search);
  const ufsParam = (params.get("ufs") || "").toLowerCase();
  const ufsSelecionadas = ufsParam ? ufsParam.split(",").filter(Boolean) : [];

  // Marca checkboxes
  for (const cb of checkboxes) {
    if (ufsSelecionadas.includes(cb.value.toLowerCase())) {
      cb.checked = true;
    }
    cb.addEventListener("change", atualizar);
  }

  // Renderiza ao carregar se houver pelo menos 2 UFs
  if (ufsSelecionadas.length >= 2) {
    renderizar(ufsSelecionadas.map((s) => s.toUpperCase()));
  }

  function atualizar() {
    const selecionadas = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value.toUpperCase());

    if (selecionadas.length > 9) {
      // Desfazer última seleção
      const ultima = Array.from(checkboxes).find(
        (cb) => cb.checked && cb === document.activeElement
      );
      if (ultima) ultima.checked = false;
      alert("Máximo de 9 UFs por comparação. Remova alguma para adicionar nova.");
      return;
    }

    if (selecionadas.length < 2) {
      resultados.setAttribute("hidden", "");
      vazio.removeAttribute("hidden");
      atualizarUrl([]);
      return;
    }

    renderizar(selecionadas);
    atualizarUrl(selecionadas);
  }

  function renderizar(siglas) {
    vazio.setAttribute("hidden", "");
    resultados.removeAttribute("hidden");

    // Cada indicador define como gerar URL de drill-down para a página da UF.
    // filtroUrl(sigla) retorna a querystring (sem o ?) ou "" para sem filtro.
    const indicadores = [
      {
        chave: "total",
        rotulo: "Total de políticas catalogadas",
        filtroUrl: () => "",
      },
      {
        chave: "ativas",
        rotulo: "Políticas ativas / em execução",
        filtroUrl: () => "situacao=" + encodeURIComponent("Ativa / em execução"),
      },
      {
        chave: "federaisAplicadas",
        rotulo: "Federais aplicadas em UF",
        filtroUrl: null,
      },
      {
        chave: "estaduaisUnicas",
        rotulo: "Exclusivamente estaduais",
        filtroUrl: null,
      },
      {
        chave: "eixosCobertos",
        rotulo: "Eixos temáticos cobertos (de 3)",
        filtroUrl: null, // não vira link (é meta-informação)
      },
    ];

    // Cabeçalho
    let theadHtml = '<tr class="border-b-2 border-neutral-500 text-left">';
    theadHtml += '<th scope="col" class="p-sm font-semibold">Indicador</th>';
    for (const sigla of siglas) {
      const nome = (window.UFS_INFO[sigla] && window.UFS_INFO[sigla].nome) || sigla;
      theadHtml += `<th scope="col" class="p-sm font-semibold num">
        <a href="/catalogo-politicas/uf/${sigla.toLowerCase()}/" class="text-primary">${escapeHtml(nome)}</a>
      </th>`;
    }
    theadHtml += "</tr>";
    thead.innerHTML = theadHtml;

    // Corpo
    let tbodyHtml = "";
    for (const ind of indicadores) {
      tbodyHtml += '<tr class="border-b border-neutral-200">';
      tbodyHtml += `<th scope="row" class="p-sm font-medium">${ind.rotulo}</th>`;

      const valores = siglas.map((s) => {
        const agg = window.AGREGADOS_UF[s];
        return agg ? (agg[ind.chave] || 0) : 0;
      });
      const maxValor = Math.max(...valores);

      for (let i = 0; i < siglas.length; i++) {
        const v = valores[i];
        const sigla = siglas[i];
        const destaque = v === maxValor && maxValor > 0 ? "font-bold" : "";
        const cell = celulaNumero(v, sigla, ind.filtroUrl, destaque);
        tbodyHtml += `<td class="p-sm num">${cell}</td>`;
      }
      tbodyHtml += "</tr>";
    }

    // Linha de distribuição por tipo (3 valores oficiais)
    const tiposCanonicos = [
      "Educacional direta",
      "Trabalho/qualificação direta",
      "Proteção social com impacto educacional",
    ];
    for (const tipo of tiposCanonicos) {
      tbodyHtml += '<tr class="border-b border-neutral-200">';
      tbodyHtml += `<th scope="row" class="p-sm font-medium text-sm">↳ ${escapeHtml(tipo)}</th>`;
      const valores = siglas.map((s) => {
        const agg = window.AGREGADOS_UF[s];
        if (!agg || !agg.distribuicaoTipo) return 0;
        const found = agg.distribuicaoTipo.find((d) => d.tipo === tipo);
        return found ? found.n : 0;
      });
      const maxValor = Math.max(...valores);
      const filtroTipo = () => "tipo=" + encodeURIComponent(tipo);

      for (let i = 0; i < siglas.length; i++) {
        const v = valores[i];
        const sigla = siglas[i];
        const destaque = v === maxValor && maxValor > 0 ? "font-bold" : "";
        const cell = celulaNumero(v, sigla, filtroTipo, destaque);
        tbodyHtml += `<td class="p-sm num">${cell}</td>`;
      }
      tbodyHtml += "</tr>";
    }

    tbody.innerHTML = tbodyHtml;

    // Status anunciado em live region
    status.textContent = `Comparando ${siglas.length} UFs: ${siglas.join(", ")}. ${indicadores.length + tiposCanonicos.length} indicadores na tabela. Clique em um número para ver as políticas correspondentes na página da UF.`;
  }

  /**
   * Renderiza uma célula de número:
   * - Se valor > 0 e há filtroUrl: link clicável para /uf/<sigla>/?filtro
   * - Se valor === 0 ou sem filtroUrl: texto puro (sem link inútil)
   * - Aplica classe de destaque se for o maior da linha
   */
  function celulaNumero(valor, sigla, filtroUrlFn, destaqueClasse) {
    if (valor === 0 || !filtroUrlFn) {
      return `<span class="${destaqueClasse}">${valor}</span>`;
    }
    const filtroQs = filtroUrlFn();
    const url = `/catalogo-politicas/uf/${sigla.toLowerCase()}/${filtroQs ? "?" + filtroQs : ""}`;
    return `<a href="${url}" class="${destaqueClasse} text-primary underline" title="Ver as ${valor} políticas na página de ${sigla}">${valor}</a>`;
  }

  function atualizarUrl(siglas) {
    const newParams = new URLSearchParams();
    if (siglas.length > 0) {
      newParams.set("ufs", siglas.map((s) => s.toLowerCase()).join(","));
    }
    const newUrl =
      window.location.pathname +
      (newParams.toString() ? "?" + newParams.toString() : "");
    window.history.replaceState(null, "", newUrl);

    // Atualiza span do botão Copiar com URL completo
    if (linkAtualSpan) {
      linkAtualSpan.textContent = window.location.href;
    }
  }

  function escapeHtml(s) {
    if (typeof s !== "string") return "";
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();