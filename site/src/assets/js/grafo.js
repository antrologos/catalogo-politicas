/**
 * Grafo Cytoscape de relações federal ↔ estadual (Sprint 9.1 do F.3, 2026-05-03).
 *
 * Renderiza grafo em #grafo-container com 439 nodes (33 federais + 255 réplicas
 * + 151 estaduais únicas) e 255 edges (federal→réplica). Layout cose-bilkent
 * agrupa famílias federais como clusters naturais.
 *
 * Sprint 9.2 vai adicionar: filtros tipo/situação + highlight família ao hover.
 * Sprint 9.3 vai adicionar: edges secundárias por integra_outras_politicas.
 * Sprint 9.4 vai adicionar: mobile polish + keyboard navigation a11y.
 *
 * Cytoscape v3 + cose-bilkent carregados via UMD em grafo.njk (~150KB total).
 * Aguarda window.cytoscape disponível antes de iniciar (defer carrega assíncrono).
 *
 * Aplica ADR-013 lições: UMD > ESM, validação local com puppeteer antes de push.
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

  // Registrar layout cose-bilkent se disponível
  if (window.cytoscapeCoseBilkent) {
    cytoscape.use(window.cytoscapeCoseBilkent);
  } else {
    console.warn("[grafo] cose-bilkent não disponível, usando layout cose default");
  }

  // Respeitar prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // === Cores semânticas alinhadas à paleta autoral V2 (ADR-011) ===
  // Tons sólidos para nós; usar opacity em edges para visual leve.
  const COLOR_FEDERAL = "#1A4F8B";       // azul-IBGE (federais canônicas)
  const COLOR_REPLICA = "#357AB7";       // info (réplicas estaduais)
  const COLOR_ESTADUAL = "#0E7B4A";      // verde-floresta (estaduais únicas)
  const COLOR_DESCONTINUADA = "#8A7E70"; // cinza para descontinuadas
  const COLOR_BORDER = "#3C342A";        // tinta morna
  const COLOR_PAPEL = "#FAF7F2";         // papel (label fill)
  const COLOR_EDGE = "#5C5347";          // neutral-700

  const cy = cytoscape({
    container: cyContainer,
    elements: { nodes, edges },
    minZoom: 0.2,
    maxZoom: 4,
    wheelSensitivity: 0.3,

    layout: window.cytoscapeCoseBilkent
      ? {
          name: "cose-bilkent",
          animate: prefersReducedMotion ? false : "end",
          animationDuration: 600,
          randomize: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 80,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,                 // empilha estaduais isoladas em grade
          tilingPaddingVertical: 10,
          tilingPaddingHorizontal: 10,
        }
      : { name: "cose", animate: !prefersReducedMotion },

    style: [
      // Federal: nó grande azul-IBGE
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
        },
      },
      // Réplica: nó pequeno azul-info
      {
        selector: 'node[type="replica"]',
        style: {
          "background-color": COLOR_REPLICA,
          "border-color": COLOR_BORDER,
          "border-width": 0.8,
          width: 14,
          height: 14,
          label: "data(uf)",
          color: COLOR_PAPEL,
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 7,
          "font-weight": 600,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
        },
      },
      // Estadual única: nó médio verde-floresta
      {
        selector: 'node[type="estadual"]',
        style: {
          "background-color": COLOR_ESTADUAL,
          "border-color": COLOR_BORDER,
          "border-width": 0.8,
          width: 12,
          height: 12,
          label: "data(uf)",
          color: COLOR_PAPEL,
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 6,
          "font-weight": 600,
          "font-family": '"IBM Plex Sans Variable", system-ui, sans-serif',
        },
      },
      // Override descontinuada (cinza, semitransparente)
      {
        selector: 'node[situacao_classe="descontinuada"]',
        style: {
          "background-color": COLOR_DESCONTINUADA,
          opacity: 0.5,
        },
      },
      // Edge familia: linha sólida fina
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
      // Hover state
      {
        selector: "node:active, node.hover",
        style: {
          "border-width": 3,
          "border-color": "#FFB81C", // foco âmbar (paleta V2)
          "z-index": 99,
        },
      },
      // Edge conectada quando node em hover
      {
        selector: "edge.hover-edge",
        style: {
          width: 2.5,
          "line-color": COLOR_FEDERAL,
          opacity: 1,
        },
      },
    ],
  });

  // === Tooltip on hover ===
  cy.on("mouseover", "node", (evt) => {
    const node = evt.target;
    node.addClass("hover");
    // Edge connected highlight
    node.connectedEdges().addClass("hover-edge");

    const d = node.data();
    let html = `
      <div class="font-semibold">${d.nomeCompleto || d.label}</div>
      <div class="mt-2xs">${d.tipo}</div>
      <div class="mt-2xs">
        ${d.type === "federal" ? "Federal canônica" : d.type === "replica" ? "Réplica em " + d.uf : "Estadual única (" + d.uf + ")"}
      </div>
      <div class="mt-2xs opacity-70">Click para abrir ficha</div>
    `;
    tooltip.innerHTML = html;
    tooltip.classList.remove("hidden");
  });

  cy.on("mousemove", (evt) => {
    if (!tooltip.classList.contains("hidden")) {
      const rect = cyContainer.getBoundingClientRect();
      // evt.originalEvent existe quando vem de mouse real
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
    tooltip.classList.add("hidden");
  });

  // === Click navega para ficha ===
  cy.on("tap", "node", (evt) => {
    const slug = evt.target.data("slug");
    if (slug) {
      window.location.href = `${pathPrefix}politica/${slug}/`;
    }
  });

  // === Toolbar handlers ===
  document.getElementById("grafo-fit")?.addEventListener("click", () => {
    cy.fit(undefined, 30);
    announce("Grafo reajustado para enquadrar todos os nós.");
  });
  document.getElementById("grafo-center")?.addEventListener("click", () => {
    cy.center();
    announce("Grafo centralizado.");
  });

  // Anuncia quando layout terminar
  cy.one("layoutstop", () => {
    announce(`Grafo carregado: ${nodes.length} políticas e ${edges.length} relações federal-réplica.`);
  });

  console.info(`[grafo] Cytoscape v${cytoscape.version}: ${nodes.length} nodes, ${edges.length} edges`);
});