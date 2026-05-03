/**
 * Mapa coroplético D3 do Brasil (Sprint 8.1 do Bloco F.3, 2026-05-03).
 *
 * Renderiza GeoJSON simplificado das 27 UFs em #mapa-svg, colore proporcionalmente
 * à contagem de políticas catalogadas (gradiente azul-IBGE), aplica handlers de
 * tooltip + click navega para /uf/<sigla>/.
 *
 * UFs cobertas (1ª onda) recebem 5 stops de cor; não cobertas ficam cinza
 * neutro com label "em planejamento" no tooltip.
 *
 * D3 v7 carregado via CDN jsdelivr — pesa ~95KB minified+gz mas só nesta página.
 *
 * Sprint 8.2 vai estender com 3 modos de coloração (total/ativas/snapshot) +
 * download SVG/PNG via canvas.
 * Sprint 8.3 adiciona mobile collapse + polish a11y.
 *
 * Dados embarcados como JSON em <script id="mapa-data"> (lido aqui).
 * Lista textual paralela em <table> abaixo do mapa é fonte de verdade
 * canônica para leitores de tela (NF-M-10).
 */

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

(async function init() {
  "use strict";

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

  // Buscar GeoJSON simplificado (121 KB)
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

  // Limpa loading state
  svg.innerHTML = "";

  // Projection ajustada para o Brasil (mercator é OK pra esta escala)
  const width = 600;
  const height = 600;
  const projection = d3.geoMercator()
    .center([-54, -15])  // Centro aproximado do Brasil
    .scale(700)
    .translate([width / 2, height / 2]);
  const pathGen = d3.geoPath().projection(projection);

  // Color scale: azul-IBGE 5 stops para UFs cobertas (paleta autoral V2)
  // Domínio = [min, max] das contagens das UFs cobertas (excluindo zero)
  const cobertas = Object.entries(porUf).filter(([sigla]) => sigla !== "BR");
  const totals = cobertas.map(([, agg]) => agg.total).filter((n) => n > 0);
  const maxTotal = totals.length ? Math.max(...totals) : 1;
  const minTotal = totals.length ? Math.min(...totals) : 0;

  const colorScale = d3.scaleSequential()
    .domain([Math.max(0, minTotal - 5), maxTotal])
    .interpolator(d3.interpolateRgb("#D6E4F2", "#1A4F8B"));  // azul-IBGE light → dark

  // Cor para UFs não cobertas
  const COR_NAO_COBERTA = "#E5DFD3";  // neutral-200 morno (paleta V2)

  // Criar grupo SVG para os paths
  const g = d3.select("#mapa-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g");

  // Render dos 27 estados
  g.selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("d", pathGen)
    .attr("fill", (d) => {
      const sigla = d.properties.sigla;
      const agg = porUf[sigla];
      if (!agg || agg.total === 0) return COR_NAO_COBERTA;
      return colorScale(agg.total);
    })
    .attr("stroke", "#FAF7F2")
    .attr("stroke-width", 0.6)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("data-sigla", (d) => d.properties.sigla)
    .attr("aria-label", (d) => {
      const sigla = d.properties.sigla;
      const agg = porUf[sigla];
      if (!agg) return `${d.properties.name} — em planejamento (não catalogada na 1ª onda)`;
      return `${d.properties.name} — ${agg.total} políticas catalogadas`;
    })
    .style("cursor", (d) => porUf[d.properties.sigla] ? "pointer" : "default")
    .style("transition", "fill 0.2s, stroke-width 0.2s")
    .on("mouseenter", function (event, d) {
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
          <div class="mt-2xs text-papel/70">Clique para ver página da UF</div>
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
    .on("mousemove", function (event) {
      const container = document.getElementById("mapa-container");
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip.style.left = `${x + 12}px`;
      tooltip.style.top = `${y + 12}px`;
    })
    .on("mouseleave", function () {
      d3.select(this)
        .attr("stroke", "#FAF7F2")
        .attr("stroke-width", 0.6);
      tooltip.classList.add("hidden");
    })
    .on("click", function (event, d) {
      const sigla = d.properties.sigla;
      if (!porUf[sigla]) return;  // UFs não-cobertas não são clicáveis
      window.location.href = `${pathPrefix}uf/${sigla.toLowerCase()}/`;
    })
    .on("keydown", function (event, d) {
      // Permite ativação por Enter/Space (foco via Tab)
      if (event.key === "Enter" || event.key === " ") {
        const sigla = d.properties.sigla;
        if (porUf[sigla]) {
          event.preventDefault();
          window.location.href = `${pathPrefix}uf/${sigla.toLowerCase()}/`;
        }
      }
    });

  // Adicionar labels com sigla nas UFs cobertas (legibilidade rápida)
  g.selectAll("text")
    .data(geo.features.filter((d) => porUf[d.properties.sigla]))
    .enter()
    .append("text")
    .attr("x", (d) => pathGen.centroid(d)[0])
    .attr("y", (d) => pathGen.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "11")
    .attr("font-weight", "600")
    .attr("fill", (d) => {
      const agg = porUf[d.properties.sigla];
      // Texto branco em UFs com cor mais escura, tinta nas mais claras
      return agg && agg.total > maxTotal * 0.5 ? "#FAF7F2" : "#3C342A";
    })
    .attr("pointer-events", "none")
    .text((d) => d.properties.sigla);

  // Legenda: barra de cores horizontal abaixo do mapa
  const legendWidth = 200;
  const legendHeight = 12;
  const legendX = width - legendWidth - 20;
  const legendY = height - 30;

  // Defs para gradiente
  const defs = d3.select("#mapa-svg").append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "mapa-gradient")
    .attr("x1", "0%").attr("x2", "100%")
    .attr("y1", "0%").attr("y2", "0%");
  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#D6E4F2");
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#1A4F8B");

  d3.select("#mapa-svg").append("rect")
    .attr("x", legendX).attr("y", legendY)
    .attr("width", legendWidth).attr("height", legendHeight)
    .attr("fill", "url(#mapa-gradient)")
    .attr("stroke", "#3C342A").attr("stroke-width", 0.5);

  d3.select("#mapa-svg").append("text")
    .attr("x", legendX).attr("y", legendY - 4)
    .attr("font-size", "10")
    .attr("fill", "#3C342A")
    .text(`${minTotal} políticas`);
  d3.select("#mapa-svg").append("text")
    .attr("x", legendX + legendWidth).attr("y", legendY - 4)
    .attr("font-size", "10")
    .attr("text-anchor", "end")
    .attr("fill", "#3C342A")
    .text(`${maxTotal} políticas`);

  console.info(`[mapa] renderizado: ${geo.features.length} UFs, ${cobertas.length} cobertas`);
})();