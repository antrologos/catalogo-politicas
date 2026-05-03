/**
 * Mapa coroplético D3 do Brasil (Sprint 8.1 + 8.2 do Bloco F.3, 2026-05-03).
 *
 * Renderiza GeoJSON simplificado das 27 UFs em #mapa-svg, colore proporcionalmente
 * à métrica selecionada (total/ativas/snapshot), gradiente azul-IBGE.
 * UFs cobertas (1ª onda) recebem 5 stops; não cobertas ficam cinza com label
 * "em planejamento" no tooltip.
 *
 * Sprint 8.2 adiciona:
 *   - Toolbar com 3 modos de coloração (total/ativas/snapshot)
 *   - Download SVG (XMLSerializer) e PNG (canvas 1200×1200)
 *
 * Sprint 8.3 vai adicionar mobile collapse + polish a11y.
 *
 * D3 v7 carregado via CDN jsdelivr — ~95KB minified+gz só nesta página.
 *
 * Lista textual paralela em <table> abaixo do mapa é fonte de verdade
 * canônica para leitores de tela (NF-M-10).
 */

/* D3 v7 carregado via UMD em mapa.njk (window.d3 global).
   Wait pelo D3 estar disponível antes de iniciar (defer carrega assíncrono). */
function waitForD3(cb) {
  if (typeof window !== "undefined" && window.d3) return cb();
  setTimeout(() => waitForD3(cb), 30);
}

waitForD3(async function init() {
  "use strict";
  const d3 = window.d3;

  const svg = document.getElementById("mapa-svg");
  const tooltip = document.getElementById("mapa-tooltip");
  const dataEl = document.getElementById("mapa-data");
  if (!svg || !dataEl) {
    console.warn("[mapa] elementos não encontrados");
    return;
  }

  let data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error("[mapa] JSON inválido em #mapa-data:", e);
    return;
  }
  const { porUf, pathPrefix } = data;

  let geo;
  try {
    const res = await fetch(`${pathPrefix}assets/geo/br-ufs.geojson`);
    geo = await res.json();
  } catch (e) {
    console.error("[mapa] falha ao carregar GeoJSON:", e);
    svg.innerHTML = `<text x="300" y="300" text-anchor="middle" fill="#A02323" font-size="14">
      Erro ao carregar mapa. Use a lista textual abaixo.
    </text>`;
    return;
  }

  svg.innerHTML = "";

  const width = 600;
  const height = 600;

  // GeoJSON foi pré-processado: rings revertidos para CCW (RFC 7946 + D3 spec).
  // Sintoma sem essa correção: D3 tratava rings com winding "errado" como
  // "buraco no mundo todo", adicionando moldura mercator infinita ao path
  // (terminava com L0,0 L600,0 Z gigante). Agora paths são limpos.
  const projection = d3.geoMercator().fitSize([width, height], geo);
  const pathGen = d3.geoPath().projection(projection);

  // Diagnóstico inline (visível em DevTools > Console)
  console.info("[mapa] D3 version:", d3.version);
  console.info("[mapa] projection scale:", projection.scale().toFixed(0),
               "translate:", projection.translate().map((n) => n.toFixed(0)));
  // Sanity-check primeiro path
  const firstPath = pathGen(geo.features[0]);
  console.info("[mapa] AC path length:", firstPath ? firstPath.length : "NULL",
               "first 80 chars:", firstPath ? firstPath.substring(0, 80) : "NULL");

  // === Estado global do mapa: métrica de coloração ativa ===
  const METRICAS = {
    total: { label: "Total de políticas", chave: "total" },
    ativas: { label: "Apenas ativas", chave: "ativas" },
    snapshot: { label: "Com snapshot capturado", chave: "snapshot" },
  };
  let metricaAtual = "total";

  // Color scale dinâmica conforme métrica
  function getColorScale(metrica) {
    const valores = Object.entries(porUf)
      .filter(([sigla]) => sigla !== "BR")
      .map(([, agg]) => agg[metrica])
      .filter((n) => n > 0);
    const max = valores.length ? Math.max(...valores) : 1;
    const min = valores.length ? Math.min(...valores) : 0;
    return {
      scale: d3.scaleSequential()
        .domain([Math.max(0, min - 1), max])
        .interpolator(d3.interpolateRgb("#D6E4F2", "#1A4F8B")),
      max,
      min,
    };
  }

  // Cinza mais perceptível em UFs não cobertas (antes #E5DFD3 era quase
  // indistinguível do background bg-papel #FAF7F2 — fix visibilidade).
  const COR_NAO_COBERTA = "#C7BFAE";

  const svgD3 = d3.select("#mapa-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svgD3.append("g");

  // Sprint 8.3: respeitar prefers-reduced-motion para transições do mapa
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionStyle = prefersReducedMotion ? "none" : "fill 0.3s, stroke-width 0.2s";

  // Sprint 8.3: aria-live region para anunciar mudanças de estado
  const statusEl = document.getElementById("mapa-status");
  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // === Render dos 27 estados (paths + interação) ===
  // Sprint 8.3: usa Pointer Events (cobre mouse + touch + pen).
  // tabindex=0 apenas em paths clicáveis (evita 17 stops vazios em UFs não-cobertas).
  const paths = g.selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("d", pathGen)
    .attr("stroke", "#3C342A")
    .attr("stroke-width", 0.8)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("data-sigla", (d) => d.properties.sigla)
    .attr("tabindex", (d) => porUf[d.properties.sigla] ? 0 : null)
    .attr("role", (d) => porUf[d.properties.sigla] ? "link" : null)
    .style("cursor", (d) => porUf[d.properties.sigla] ? "pointer" : "default")
    .style("transition", transitionStyle)
    .on("pointerenter", function (event, d) {
      const sigla = d.properties.sigla;
      const agg = porUf[sigla];
      const nome = d.properties.name;

      d3.select(this)
        .attr("stroke", "#3C342A")
        .attr("stroke-width", 1.5);

      let html;
      if (agg) {
        html = `
          <div class="font-semibold">${nome} (${sigla})</div>
          <div class="mt-2xs">${agg.total} políticas · ${agg.ativas} ativas · ${agg.snapshot} com snapshot</div>
          <div class="mt-2xs opacity-70">Clique para ver página da UF</div>
        `;
      } else {
        html = `
          <div class="font-semibold">${nome} (${sigla})</div>
          <div class="mt-2xs">Em planejamento — não catalogada na 1ª onda</div>
        `;
      }
      tooltip.innerHTML = html;
      tooltip.classList.remove("hidden");
    })
    .on("pointermove", function (event) {
      const container = document.getElementById("mapa-container");
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip.style.left = `${x + 12}px`;
      tooltip.style.top = `${y + 12}px`;
    })
    .on("pointerleave", function () {
      d3.select(this)
        .attr("stroke", "#3C342A")
        .attr("stroke-width", 0.8);
      tooltip.classList.add("hidden");
    })
    .on("focus", function (event, d) {
      // Anunciar para leitores de tela ao receber foco via Tab
      const sigla = d.properties.sigla;
      const agg = porUf[sigla];
      if (agg) {
        announce(`${d.properties.name}, ${agg.total} políticas catalogadas. Pressione Enter para abrir página.`);
      }
    })
    .on("click", function (event, d) {
      const sigla = d.properties.sigla;
      if (!porUf[sigla]) return;
      window.location.href = `${pathPrefix}uf/${sigla.toLowerCase()}/`;
    })
    .on("keydown", function (event, d) {
      if (event.key === "Enter" || event.key === " ") {
        const sigla = d.properties.sigla;
        if (porUf[sigla]) {
          event.preventDefault();
          window.location.href = `${pathPrefix}uf/${sigla.toLowerCase()}/`;
        }
      }
    });

  // Labels com siglas (recolorem dinamicamente)
  const labels = g.selectAll("text")
    .data(geo.features.filter((d) => porUf[d.properties.sigla]))
    .enter()
    .append("text")
    .attr("x", (d) => pathGen.centroid(d)[0])
    .attr("y", (d) => pathGen.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "11")
    .attr("font-weight", "600")
    .attr("pointer-events", "none")
    .text((d) => d.properties.sigla);

  // === Legenda dinâmica (gradiente + ticks) ===
  const defs = svgD3.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "mapa-gradient")
    .attr("x1", "0%").attr("x2", "100%")
    .attr("y1", "0%").attr("y2", "0%");
  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#D6E4F2");
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#1A4F8B");

  const legendWidth = 200;
  const legendHeight = 12;
  const legendX = width - legendWidth - 20;
  const legendY = height - 35;

  svgD3.append("rect")
    .attr("x", legendX).attr("y", legendY)
    .attr("width", legendWidth).attr("height", legendHeight)
    .attr("fill", "url(#mapa-gradient)")
    .attr("stroke", "#3C342A").attr("stroke-width", 0.5);

  const legendaTitulo = svgD3.append("text")
    .attr("x", legendX).attr("y", legendY - 18)
    .attr("font-size", "10")
    .attr("font-weight", "600")
    .attr("fill", "#3C342A");

  const legendaMin = svgD3.append("text")
    .attr("x", legendX).attr("y", legendY - 4)
    .attr("font-size", "9")
    .attr("fill", "#3C342A");

  const legendaMax = svgD3.append("text")
    .attr("x", legendX + legendWidth).attr("y", legendY - 4)
    .attr("font-size", "9")
    .attr("text-anchor", "end")
    .attr("fill", "#3C342A");

  // === Função de re-coloração (chamada inicial e ao trocar métrica) ===
  function recolorize(metrica) {
    const { scale, max, min } = getColorScale(metrica);
    metricaAtual = metrica;

    paths
      .attr("fill", (d) => {
        const agg = porUf[d.properties.sigla];
        if (!agg || agg[metrica] === 0) return COR_NAO_COBERTA;
        return scale(agg[metrica]);
      })
      .attr("aria-label", (d) => {
        const sigla = d.properties.sigla;
        const agg = porUf[sigla];
        if (!agg) return `${d.properties.name} — em planejamento`;
        return `${d.properties.name} — ${agg[metrica]} ${METRICAS[metrica].label.toLowerCase()}`;
      });

    labels
      .attr("fill", (d) => {
        const agg = porUf[d.properties.sigla];
        return agg && agg[metrica] > max * 0.5 ? "#FAF7F2" : "#3C342A";
      });

    legendaTitulo.text(METRICAS[metrica].label);
    legendaMin.text(`${min} pol.`);
    legendaMax.text(`${max} pol.`);
  }

  recolorize("total");

  // === Toolbar: handlers dos botões de coloração ===
  document.querySelectorAll("[data-color-by]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const metrica = btn.dataset.colorBy;
      if (!METRICAS[metrica]) return;
      recolorize(metrica);
      // Atualiza estado visual dos botões (aria-pressed)
      document.querySelectorAll("[data-color-by]").forEach((b) => {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      // Sprint 8.3: anuncia mudança para leitores de tela
      const { max, min } = getColorScale(metrica);
      announce(`Mapa recolorido por ${METRICAS[metrica].label}. Variação de ${min} a ${max} políticas entre as UFs cobertas.`);
    });
  });

  // === Download SVG: serializa SVG inline e força download ===
  document.getElementById("download-svg")?.addEventListener("click", () => {
    const serializer = new XMLSerializer();
    // Clone para adicionar xmlns explicito (browser remove ao injetar inline)
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', svgString],
      { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogo-politicas-mapa-${metricaAtual}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // === Download PNG: render SVG em canvas 1200×1200 e exportar ===
  document.getElementById("download-png")?.addEventListener("click", () => {
    const serializer = new XMLSerializer();
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      // Fundo papel (a paleta V2)
      ctx.fillStyle = "#FAF7F2";
      ctx.fillRect(0, 0, 1200, 1200);
      ctx.drawImage(img, 0, 0, 1200, 1200);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `catalogo-politicas-mapa-${metricaAtual}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = (e) => {
      console.error("[mapa] erro ao gerar PNG:", e);
      alert("Erro ao gerar PNG. Use o download SVG.");
    };
    img.src = svgUrl;
  });

  console.info(`[mapa] sprint 8.2 ready: ${geo.features.length} UFs, métricas total/ativas/snapshot`);
})();