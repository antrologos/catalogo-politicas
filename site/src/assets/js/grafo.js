/**
 * Grafo Cytoscape com COMPOUND NODES + drill-down (Sprint 9.7+, 2026-05-04).
 *
 * Re-arquitetura: o grafo abre COLAPSADO. Cada quadrado azul é uma família
 * federal (compound parent agregando federal canônica + réplicas). Cada
 * quadrado verde tracejado é um cluster UF (compound parent agregando
 * estaduais únicas da UF que tenham articulação curada). Click expande/colapsa.
 *
 * Bibliotecas (UMD via CDN): Cytoscape v3 + cose-bilkent + expand-collapse 4.1.1.
 *
 * Funcionalidades preservadas da Sprint 9.6:
 *   - LOD via min-zoomed-font-size (réplica/estadual labels só em zoom alto)
 *   - family-highlight ao hover em federal canônica
 *   - kb-focus + setas para navegar entre famílias (Home/End/Esc)
 *   - filtros tipo + situação
 *   - tooltip + click navega para ficha
 *   - aria-live announce
 *
 * Mudanças:
 *   - Click em compound parent expande/colapsa (não navega para ficha)
 *   - kb-focus navega entre compound-federal (33 deles)
 *   - applyFilters considera compounds: parent visível se ANY filho passa filtro
 */

function waitForCytoscape(cb) {
  if (typeof window !== "undefined" && window.cytoscape) return cb();
  setTimeout(() => waitForCytoscape(cb), 30);
}

waitForCytoscape(function init() {
  "use strict";
  const cytoscape = window.cytoscape;
  const cyContainer = document.getElementById("grafo-container");
  const tooltip = document.getElementById("grafo-tooltip");
  const dataEl = document.getElementById("grafo-data");
  const statusEl = document.getElementById("grafo-status");

  if (!cyContainer || !dataEl) {
    console.warn("[grafo] elementos não encontrados");
    return;
  }

  let data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error("[grafo] JSON inválido em #grafo-data:", e);
    return;
  }
  const { nodes, edges, pathPrefix } = data;

  // Registrar layouts e plugins
  if (window.cytoscapeCoseBilkent) {
    cytoscape.use(window.cytoscapeCoseBilkent);
  } else {
    console.warn("[grafo] cose-bilkent não disponível, usando layout cose default");
  }
  if (window.cytoscapeExpandCollapse) {
    cytoscape.use(window.cytoscapeExpandCollapse);
  } else {
    console.warn("[grafo] expand-collapse plugin não disponível, drill-down desabilitado");
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // === Cores semânticas alinhadas à paleta autoral V2 (ADR-011) ===
  const COLOR_FEDERAL = "#1A4F8B";       // azul-IBGE (federais canônicas + compound-federal border)
  const COLOR_REPLICA = "#357AB7";       // info (réplicas estaduais)
  const COLOR_ESTADUAL = "#0E7B4A";      // verde-floresta (estaduais únicas + compound-uf border)
  const COLOR_DESCONTINUADA = "#8A7E70"; // cinza para descontinuadas
  const COLOR_BORDER = "#3C342A";        // tinta morna
  const COLOR_PAPEL = "#FAF7F2";         // papel (label fill)
  const COLOR_PAPEL_ESCURO = "#F0EBE2";  // papel mais escuro (compound bg)
  const COLOR_EDGE = "#5C5347";          // neutral-700
  const COLOR_FOCO = "#FFB81C";          // âmbar editorial (focus visible)

  const cy = cytoscape({
    container: cyContainer,
    elements: { nodes, edges },
    minZoom: 0.2,
    maxZoom: 4,
    wheelSensitivity: 0.3,

    layout: window.cytoscapeCoseBilkent
      ? {
          // Sprint 9.7+: como as 438 edges de articulação ficam ocultas no
          // estado inicial colapsado (.edge-hidden), o layout só precisa lidar
          // com 255 edges família + 42 compound parents. Parâmetros voltam a
          // valores moderados, similares à Sprint 9.6.
          name: "cose-bilkent",
          animate: prefersReducedMotion ? false : "end",
          animationDuration: 600,
          randomize: true,
          nodeRepulsion: 8000,
          idealEdgeLength: 120,
          edgeElasticity: 0.3,
          nestingFactor: 0.1,
          gravity: 0.15,
          numIter: 2500,
          tile: true,
          tilingPaddingVertical: 15,
          tilingPaddingHorizontal: 15,
          nodeDimensionsIncludeLabels: true,
        }
      : { name: "cose", animate: !prefersReducedMotion },

    style: [
      // Compound parent: família federal (azul-IBGE com fundo papel translúcido)
      {
        selector: 'node[type="compound-federal"]',
        style: {
          "background-color": COLOR_PAPEL,
          "background-opacity": 0.5,
          "border-color": COLOR_FEDERAL,
          "border-width": 1.5,
          "border-style": "solid",
          shape: "round-rectangle",
          label: "data(label)",
          color: COLOR_FEDERAL,
          "text-valign": "top",
          "text-halign": "center",
          "text-margin-y": -4,
          "font-size": 11,
          "font-weight": 700,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
          "text-max-width": 100,
          padding: 10,
        },
      },
      // Compound parent: cluster por UF (verde-floresta tracejado)
      {
        selector: 'node[type="compound-uf"]',
        style: {
          "background-color": COLOR_PAPEL_ESCURO,
          "background-opacity": 0.55,
          "border-color": COLOR_ESTADUAL,
          "border-width": 1.5,
          "border-style": "dashed",
          shape: "round-rectangle",
          label: "data(label)",
          color: COLOR_ESTADUAL,
          "text-valign": "top",
          "text-halign": "center",
          "text-margin-y": -4,
          "font-size": 12,
          "font-weight": 700,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
          padding: 10,
        },
      },
      // Federal canônica (nó-folha dentro do compound-federal)
      {
        selector: 'node[type="federal"]',
        style: {
          "background-color": COLOR_FEDERAL,
          "border-color": COLOR_BORDER,
          "border-width": 1.5,
          width: 32,
          height: 32,
          label: "data(label)",
          color: COLOR_PAPEL,
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 9,
          "font-weight": 600,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
          "text-outline-color": COLOR_FEDERAL,
          "text-outline-width": 1,
          "text-max-width": 60,
        },
      },
      // Réplica estadual
      {
        selector: 'node[type="replica"]',
        style: {
          "background-color": COLOR_REPLICA,
          "border-color": COLOR_BORDER,
          "border-width": 0.8,
          width: 14,
          height: 14,
          label: "data(label)",
          color: COLOR_PAPEL,
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 7,
          "font-weight": 600,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
          "min-zoomed-font-size": 8,
          "text-max-width": 40,
          "opacity": 0.75,
        },
      },
      // Estadual única
      {
        selector: 'node[type="estadual"]',
        style: {
          "background-color": COLOR_ESTADUAL,
          "border-color": COLOR_BORDER,
          "border-width": 0.8,
          width: 12,
          height: 12,
          label: "data(label)",
          color: COLOR_PAPEL,
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 6,
          "font-weight": 600,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
          "min-zoomed-font-size": 7,
          "text-max-width": 40,
          "opacity": 0.75,
        },
      },
      // Override descontinuada (apenas em nós-folha; não aplicar em compound)
      {
        selector: 'node[situacao_classe="descontinuada"]',
        style: {
          "background-color": COLOR_DESCONTINUADA,
          opacity: 0.5,
        },
      },
      // Edge familia
      {
        selector: 'edge[type="familia"]',
        style: {
          width: 1.2,
          "line-color": COLOR_EDGE,
          "curve-style": "bezier",
          opacity: 0.55,
          "target-arrow-shape": "none",
        },
      },
      // Edge articulação curada
      {
        selector: 'edge[type="articulacao"]',
        style: {
          width: 2,
          "line-color": "#C7521C",
          "line-style": "dashed",
          "curve-style": "bezier",
          "control-point-step-size": 60,
          opacity: 0.85,
          "target-arrow-color": "#C7521C",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.2,
        },
      },
      // Sprint 9.7+: edges de articulação ocultas por padrão quando ambos os
      // endpoints estão dentro de compounds colapsados. Reduz o "novelo" visual
      // de 438 edges sienna no estado inicial. As edges são reveladas
      // dinamicamente quando uma família/cluster é expandido (handler abaixo).
      {
        selector: 'edge[type="articulacao"].edge-hidden',
        style: {
          display: "none",
        },
      },
      // Hover state — apenas em nós-folha (compounds têm cue do plugin)
      {
        selector: 'node[type="federal"]:active, node[type="federal"].hover, node[type="replica"]:active, node[type="replica"].hover, node[type="estadual"]:active, node[type="estadual"].hover',
        style: {
          "border-width": 3,
          "border-color": COLOR_FOCO,
          "z-index": 99,
        },
      },
      // Hover em compound parent — apenas reforça borda
      {
        selector: 'node[type="compound-federal"].hover, node[type="compound-uf"].hover',
        style: {
          "border-width": 2.5,
          "border-color": COLOR_FOCO,
        },
      },
      {
        selector: "edge.hover-edge",
        style: {
          width: 2.5,
          "line-color": COLOR_FEDERAL,
          opacity: 1,
        },
      },
      // Atenuação dos não-destacados
      {
        selector: ".dimmed",
        style: {
          opacity: 0.15,
          "text-opacity": 0.15,
        },
      },
      // Família destacada — z-index alto
      {
        selector: ".family-highlight",
        style: {
          "z-index": 50,
        },
      },
      // Revelação de labels em família destacada — sobrescreve LOD
      {
        selector: 'node.family-highlight[type="replica"], node.family-highlight[type="estadual"]',
        style: {
          "min-zoomed-font-size": 0,
          "opacity": 1,
          "text-opacity": 1,
        },
      },
      // Filtro: ocultar nó (display:none cobre nó-folha; compound parent oculta separadamente)
      {
        selector: ".filtered-out",
        style: {
          display: "none",
        },
      },
      // Foco via teclado em compound-federal: anel âmbar largo
      {
        selector: "node.kb-focus",
        style: {
          "border-width": 5,
          "border-color": COLOR_FOCO,
          "border-opacity": 1,
          "min-zoomed-font-size": 0,
          "text-opacity": 1,
          "z-index": 999,
        },
      },
    ],
  });

  // === Inicializar expand-collapse ===
  // Plugin precisa estar inicializado antes de qualquer chamada à API,
  // mas collapseAll() só pode ser chamado depois que o layout inicial terminar
  // (caso contrário todos os compounds colapsam sobrepostos num único ponto).
  let api = null;
  if (window.cytoscapeExpandCollapse) {
    api = cy.expandCollapse({
      // layoutBy aplica este layout após cada expand/collapse para reposicionar
      // os elementos visíveis. Mantém os mesmos parâmetros do layout inicial.
      layoutBy: {
        name: window.cytoscapeCoseBilkent ? "cose-bilkent" : "cose",
        animate: prefersReducedMotion ? false : "end",
        randomize: false,
        animationDuration: 400,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        edgeElasticity: 0.3,
        nestingFactor: 0.1,
        gravity: 0.15,
        numIter: 1500,
        tile: true,
        nodeDimensionsIncludeLabels: true,
      },
      fisheye: true,
      animate: !prefersReducedMotion,
      animationDuration: 400,
      undoable: false,
      cueEnabled: true,
      expandCollapseCuePosition: "top-left",
      expandCollapseCueSize: 14,
      expandCollapseCueLineSize: 10,
      groupEdgesOfSameTypeOnCollapse: true,
    });
  }

  // === Tooltip + Highlight família on hover ===
  cy.on("mouseover", "node", (evt) => {
    const node = evt.target;
    const d = node.data();
    node.addClass("hover");

    // Compound parents: tooltip simples + highlight + dim
    if (d.type === "compound-federal" || d.type === "compound-uf") {
      const escopo = node.union(node.descendants()).union(node.connectedEdges()).union(node.descendants().connectedEdges());
      cy.elements().not(escopo).addClass("dimmed");
      escopo.addClass("family-highlight");
      tooltip.innerHTML = `
        <div class="font-semibold">${d.nomeCompleto || d.label}</div>
        <div class="mt-2xs">${d.type === "compound-federal" ? "Família federal" : "Cluster UF"}</div>
        <div class="mt-2xs opacity-70">Click para ${api && api.isCollapsible(node) ? "expandir" : "recolher"}</div>
      `;
      tooltip.classList.remove("hidden");
      return;
    }

    node.connectedEdges().addClass("hover-edge");

    // Hover em federal canônica destaca família inteira (federal + réplicas + edges)
    if (d.type === "federal") {
      const familia = node.union(node.connectedEdges()).union(node.outgoers());
      cy.elements().not(familia).addClass("dimmed");
      familia.addClass("family-highlight");
    } else if (d.type === "replica") {
      const edge = node.connectedEdges().filter('[type="familia"]').first();
      if (edge && edge.length > 0) {
        const federal = edge.target();
        const familia = federal.union(federal.connectedEdges()).union(federal.outgoers());
        cy.elements().not(familia).addClass("dimmed");
        familia.addClass("family-highlight");
      }
    }

    const ufTexto = d.type === "federal"
      ? "Federal canônica"
      : d.type === "replica"
        ? "Réplica em " + d.uf
        : "Estadual única (" + d.uf + ")";
    tooltip.innerHTML = `
      <div class="font-semibold">${d.nomeCompleto || d.label}</div>
      <div class="mt-2xs">${d.tipo}</div>
      <div class="mt-2xs">${ufTexto}</div>
      <div class="mt-2xs opacity-70">Click para abrir ficha</div>
    `;
    tooltip.classList.remove("hidden");
  });

  cy.on("mousemove", (evt) => {
    if (!tooltip.classList.contains("hidden")) {
      const rect = cyContainer.getBoundingClientRect();
      const oe = evt.originalEvent;
      if (oe) {
        tooltip.style.left = `${oe.clientX - rect.left + 12}px`;
        tooltip.style.top = `${oe.clientY - rect.top + 12}px`;
      }
    }
  });

  cy.on("mouseout", "node", (evt) => {
    const node = evt.target;
    node.removeClass("hover");
    node.connectedEdges().removeClass("hover-edge");
    cy.elements().removeClass("dimmed family-highlight");
    tooltip.classList.add("hidden");
  });

  // === Click: compound expande/colapsa; nó-folha navega para ficha ===
  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    const d = node.data();
    if (d.type === "compound-federal" || d.type === "compound-uf") {
      if (api) {
        if (api.isCollapsible(node)) api.collapse(node);
        else if (api.isExpandable(node)) api.expand(node);
      }
      return;
    }
    if (d.slug) {
      window.location.href = `${pathPrefix}politica/${d.slug}/`;
    }
  });

  // === Estado dos filtros (Sprint 9.2) ===
  let filterTipo = "all";
  let filterSitu = "all";

  function applyFilters() {
    let visibleCount = 0;
    cy.batch(() => {
      // Folhas: aplicar filtro tipo+situação
      cy.nodes().forEach((n) => {
        const d = n.data();
        if (d.type === "compound-federal" || d.type === "compound-uf") return;
        const matchTipo = filterTipo === "all" || d.tipo === filterTipo;
        const matchSitu = filterSitu === "all" || d.situacao_classe === filterSitu;
        if (matchTipo && matchSitu) {
          n.removeClass("filtered-out");
          visibleCount++;
        } else {
          n.addClass("filtered-out");
        }
      });
      // Compound parents: visíveis se pelo menos 1 filho passa filtro
      cy.nodes('[type="compound-federal"], [type="compound-uf"]').forEach((parent) => {
        const algumVisivel = parent.descendants().some((c) => !c.hasClass("filtered-out"));
        if (algumVisivel) parent.removeClass("filtered-out");
        else parent.addClass("filtered-out");
      });
      // Edges: visíveis só quando ambos endpoints visíveis
      cy.edges().forEach((e) => {
        const sv = !e.source().hasClass("filtered-out");
        const tv = !e.target().hasClass("filtered-out");
        if (sv && tv) e.removeClass("filtered-out");
        else e.addClass("filtered-out");
      });
    });
    announce(`Filtros aplicados: ${visibleCount} de ${nodes.filter(n => n.data.type !== "compound-federal" && n.data.type !== "compound-uf").length} políticas visíveis.`);
  }

  function setFilterButton(group, value) {
    document.querySelectorAll(`[data-filter-${group}]`).forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset[`filter${group.charAt(0).toUpperCase() + group.slice(1)}`] === value ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-filter-tipo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterTipo = btn.dataset.filterTipo;
      setFilterButton("tipo", filterTipo);
      applyFilters();
    });
  });
  document.querySelectorAll("[data-filter-situ]").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterSitu = btn.dataset.filterSitu;
      setFilterButton("situ", filterSitu);
      applyFilters();
    });
  });

  // === Toolbar handlers ===
  document.getElementById("grafo-fit")?.addEventListener("click", () => {
    cy.fit(cy.elements().not(".filtered-out"), 30);
    announce("Grafo reajustado para enquadrar nós visíveis.");
  });
  document.getElementById("grafo-center")?.addEventListener("click", () => {
    cy.center();
    announce("Grafo centralizado.");
  });
  document.getElementById("grafo-reset")?.addEventListener("click", () => {
    filterTipo = "all";
    filterSitu = "all";
    setFilterButton("tipo", "all");
    setFilterButton("situ", "all");
    applyFilters();
    if (api) api.collapseAll();
    cy.fit(undefined, 30);
    announce("Filtros limpos e grafo recolhido para visualização inicial.");
  });

  // Helper: o plugin expand-collapse, quando colapsa um compound, agrupa as
  // edges entre filhos do compound em meta-edges entre os COMPOUND PARENTS.
  // Para esconder o "novelo" no estado totalmente colapsado, ocultamos as
  // edges em que ambos os endpoints são compounds colapsados (estado inicial).
  // Quando o usuário expande um compound, o plugin re-roteia automaticamente
  // os edges para os filhos visíveis e nossa função reavalia os endpoints.
  function ehCompoundColapsado(node) {
    if (!api) return false;
    const t = node.data("type");
    if (t !== "compound-federal" && t !== "compound-uf") return false;
    return api.isExpandable(node); // expand-collapse: isExpandable = colapsado
  }
  function reavaliarVisibilidadeArticulacoes() {
    cy.batch(() => {
      cy.edges('[type="articulacao"]').forEach((e) => {
        const ambosColapsados =
          ehCompoundColapsado(e.source()) && ehCompoundColapsado(e.target());
        if (ambosColapsados) e.addClass("edge-hidden");
        else e.removeClass("edge-hidden");
      });
    });
  }

  // Após cada layout (inicial + re-layouts do plugin expand-collapse), reenquadra
  // o viewport. cose-bilkent posiciona nós em coordenadas longe de (0,0); sem
  // fit() o canvas mostra área vazia. Usar .on() (não .one()) garante que
  // expansões/colapsos subsequentes também reenquadram.
  let initialCollapseDone = false;
  cy.on("layoutstop", () => {
    if (!initialCollapseDone && api) {
      initialCollapseDone = true;
      api.collapseAll();
      // collapseAll dispara seu próprio layout — não fit aqui, deixa o próximo
      // layoutstop cuidar do fit no estado colapsado.
      return;
    }
    reavaliarVisibilidadeArticulacoes();
    cy.fit(undefined, 40);
  });

  // Eventos do plugin: re-aplica visibilidade após expand/collapse
  cy.on("expandcollapse.beforecollapse expandcollapse.afterexpand", () => {
    reavaliarVisibilidadeArticulacoes();
  });

  // Anuncia uma única vez quando layout inicial terminar
  cy.one("layoutstop", () => {
    const cf = nodes.filter((n) => n.data.type === "compound-federal").length;
    const cu = nodes.filter((n) => n.data.type === "compound-uf").length;
    const eArt = edges.filter((e) => e.data.type === "articulacao").length;
    announce(`Grafo carregado: ${cf} famílias federais e ${cu} clusters UF colapsados, ${eArt} articulações curadas. Click em uma família para expandir suas réplicas; click em um cluster UF para ver políticas estaduais únicas. Use setas para navegar entre famílias.`);
  });

  // === Navegação por teclado entre compound-federal nodes ===
  // Cytoscape usa canvas: nodes não recebem foco DOM. Setas circulam entre os
  // 33 compound-federal (ordenados por label). Enter abre ficha da canônica.
  let kbIdx = -1;
  const compoundsFed = cy.nodes('node[type="compound-federal"]').sort((a, b) =>
    a.data("label").localeCompare(b.data("label"))
  );

  function focusCompoundFederal(idx) {
    cy.elements().removeClass("kb-focus family-highlight dimmed");
    if (compoundsFed.length === 0) return;
    kbIdx = ((idx % compoundsFed.length) + compoundsFed.length) % compoundsFed.length;
    const compound = compoundsFed[kbIdx];
    compound.addClass("kb-focus");
    // Highlight = compound + descendants + edges relacionadas
    const escopo = compound.union(compound.descendants()).union(compound.connectedEdges()).union(compound.descendants().connectedEdges());
    escopo.addClass("family-highlight");
    cy.elements().not(escopo).addClass("dimmed");
    cy.center(compound);
    const d = compound.data();
    const filhos = compound.descendants().length;
    announce(`Foco em ${d.nomeCompleto}. ${filhos} políticas na família. Pressione Enter para abrir ficha da canônica, setas para navegar, Esc para sair.`);
  }

  cyContainer.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusCompoundFederal(kbIdx + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusCompoundFederal(kbIdx - 1);
        break;
      case "Enter":
      case " ":
        if (kbIdx >= 0 && compoundsFed.length > 0) {
          e.preventDefault();
          // Abrir ficha do nó federal canônico (filho do compound focado)
          const canonica = compoundsFed[kbIdx].descendants().filter('[type="federal"]').first();
          const slug = canonica && canonica.length > 0 ? canonica.data("slug") : null;
          if (slug) window.location.href = `${pathPrefix}politica/${slug}/`;
        }
        break;
      case "Home":
        e.preventDefault();
        focusCompoundFederal(0);
        break;
      case "End":
        e.preventDefault();
        focusCompoundFederal(compoundsFed.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        cy.elements().removeClass("kb-focus family-highlight dimmed");
        kbIdx = -1;
        cy.fit(undefined, 30);
        announce("Foco do teclado limpo. Visualização reajustada.");
        break;
    }
  });

  cyContainer.addEventListener("focus", () => {
    if (kbIdx === -1) {
      announce(`Grafo focado. ${compoundsFed.length} famílias federais navegáveis. Use setas para navegar, Enter para abrir ficha da canônica focada, Esc para sair, Home/End para ir ao primeiro/último.`);
    }
  });

  console.info(`[grafo] Cytoscape v${cytoscape.version}: ${nodes.length} nodes (${compoundsFed.length} compound-federal + clusters UF), ${edges.length} edges`);
});