/** Mapa compartilhado pela página inicial e pela consulta territorial. */
function waitForD3(cb, attempts = 0) {
  if (window.d3) return cb();
  if (attempts < 100) return setTimeout(() => waitForD3(cb, attempts + 1), 30);
  const svg = document.getElementById("mapa-svg");
  if (svg) svg.innerHTML = '<text x="300" y="300" text-anchor="middle" fill="#625F70" font-size="16">Consulte a lista de estados abaixo.</text>';
  const status = document.getElementById("mapa-status");
  if (status) status.textContent = "Mapa indisponível. Consulte a lista de estados.";
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
  const modoNavegacao = svg.dataset.mapaModo === "navegacao";
  const selecao = document.getElementById("mapa-selecao");

  let geo;
  try {
    const res = await fetch(`${pathPrefix}assets/geo/br-ufs.geojson`);
    if (!res.ok) throw new Error(`GeoJSON: HTTP ${res.status}`);
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
  const projection = d3.geoMercator().fitExtent([[12, 12], [width - 12, height - (modoNavegacao ? 18 : 75)]], geo);
  const pathGen = d3.geoPath().projection(projection);

  // === Estado global do mapa: métrica de coloração ativa ===
  const METRICAS = {
    total: { label: "Total de registros", chave: "total" },
    ativas: { label: "Registradas como ativas", chave: "ativas" },
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
        .interpolator(d3.interpolateRgb("#E9E4F1", "#665A8E")),
      max,
      min,
    };
  }

  // Cinza mais perceptível em UFs não cobertas (antes #E5DFD3 era quase
  // indistinguível do background bg-papel #FAF7F2 — fix visibilidade).
  const COR_NAO_COBERTA = "#E1E2EA";

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

  function posicionarTooltip(event) {
    const container = document.getElementById("mapa-container");
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    tooltip.style.left = `${Math.max(0, Math.min(x + 12, rect.width - tooltip.offsetWidth))}px`;
    tooltip.style.top = `${Math.max(0, Math.min(y + 12, rect.height - tooltip.offsetHeight))}px`;
  }

  function restaurarEstado(node, feature) {
    d3.select(node).attr("stroke", "#847C94").attr("stroke-width", .8).attr("fill", node.dataset.fill);
    labels.filter((f) => f === feature).attr("fill", function () { return this.dataset.fill; });
  }

  // === Render dos 27 estados (paths + interação) ===
  // Sprint 8.3: usa Pointer Events (cobre mouse + touch + pen).
  // tabindex=0 apenas em paths clicáveis (evita 17 stops vazios em UFs não-cobertas).
  const paths = g.selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("d", pathGen)
    .attr("stroke", "#847C94")
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
        .attr("stroke", "#493A6D")
        .attr("stroke-width", 2)
        .attr("fill", "#BFDE42");
      if (selecao && agg) selecao.textContent = `${nome} (${sigla}) · ${agg.total} registros`;
      labels.filter((f) => f.properties.sigla === sigla).attr("fill", "#252333");

      let html;
      if (agg) {
        html = `
          <div class="font-semibold">${nome} (${sigla})</div>
          <div class="mt-2xs">${agg.total} registros${modoNavegacao ? "" : ` · ${agg.ativas} com situação ativa no levantamento`}</div>
          <div class="mt-2xs opacity-70">Abrir experiências</div>
        `;
      } else {
        html = `
          <div class="font-semibold">${nome} (${sigla})</div>
          <div class="mt-2xs">Sem registros neste catálogo</div>
        `;
      }
      tooltip.innerHTML = html;
      tooltip.classList.remove("hidden");
      posicionarTooltip(event);
    })
    .on("pointermove", posicionarTooltip)
    .on("pointerleave", function (event, d) {
      if (document.activeElement !== this) restaurarEstado(this, d);
      tooltip.classList.add("hidden");
    })
    .on("focus", function (event, d) {
      const sigla = d.properties.sigla;
      const agg = porUf[sigla];
      if (agg) {
        d3.select(this).attr("stroke", "#493A6D").attr("stroke-width", 2).attr("fill", "#BFDE42");
        labels.filter((f) => f.properties.sigla === sigla).attr("fill", "#252333");
        if (selecao) selecao.textContent = `${d.properties.name} (${sigla}) · ${agg.total} registros`;
        announce(`${d.properties.name}, ${agg.total} registros. Pressione Enter para conhecer as experiências.`);
      }
    })
    .on("blur", function (event, d) { restaurarEstado(this, d); })
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
    .attr("font-size", "14")
    .attr("font-weight", "600")
    .attr("pointer-events", "none")
    .text((d) => d.properties.sigla);

  // === Legenda dinâmica (gradiente + ticks) ===
  const legenda = svgD3.append("g").attr("aria-hidden", "true");
  if (modoNavegacao) legenda.attr("display", "none");
  const defs = svgD3.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "mapa-gradient")
    .attr("x1", "0%").attr("x2", "100%")
    .attr("y1", "0%").attr("y2", "0%");
  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#E9E4F1");
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#665A8E");

  const legendWidth = 200;
  const legendHeight = 12;
  const legendX = width - legendWidth - 20;
  const legendY = height - 35;

  legenda.append("rect")
    .attr("x", legendX).attr("y", legendY)
    .attr("width", legendWidth).attr("height", legendHeight)
    .attr("fill", "url(#mapa-gradient)")
    .attr("stroke", "#847C94").attr("stroke-width", 0.5);

  const legendaTitulo = legenda.append("text")
    .attr("x", legendX).attr("y", legendY - 18)
    .attr("font-size", "10")
    .attr("font-weight", "600")
    .attr("fill", "#3C342A");

  const legendaMin = legenda.append("text")
    .attr("x", legendX).attr("y", legendY - 4)
    .attr("font-size", "9")
    .attr("fill", "#3C342A");

  const legendaMax = legenda.append("text")
    .attr("x", legendX + legendWidth).attr("y", legendY - 4)
    .attr("font-size", "9")
    .attr("text-anchor", "end")
    .attr("fill", "#3C342A");

  function contrasteTexto(corFundo) {
    const cor = d3.color(corFundo).rgb();
    const canais = [cor.r, cor.g, cor.b].map((valor) => {
      const s = valor / 255;
      return s <= .04045 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4);
    });
    const luminancia = .2126 * canais[0] + .7152 * canais[1] + .0722 * canais[2];
    if ((luminancia + .05) / .0685 >= 4.5) return "#252333";
    return 1.05 / (luminancia + .05) >= 4.5 ? "#FFFFFF" : "#000000";
  }

  // === Função de re-coloração (chamada inicial e ao trocar métrica) ===
  function recolorize(metrica) {
    const { scale, max, min } = getColorScale(metrica);
    metricaAtual = metrica;

    paths
      .attr("fill", (d) => {
        const agg = porUf[d.properties.sigla];
        if (!agg || agg[metrica] === 0) return COR_NAO_COBERTA;
        return modoNavegacao ? "#DCD5EA" : scale(agg[metrica]);
      })
      .attr("data-fill", function () { return this.getAttribute("fill"); })
      .attr("aria-label", (d) => {
        const sigla = d.properties.sigla;
        const agg = porUf[sigla];
        if (!agg) return `${d.properties.name} — sem registros`;
        return `${d.properties.name} — ${agg[metrica]} ${METRICAS[metrica].label.toLowerCase()}. Conhecer experiências.`;
      });

    labels
      .attr("fill", (d) => {
        const agg = porUf[d.properties.sigla];
        const cor = modoNavegacao ? "#DCD5EA" : (!agg || agg[metrica] === 0 ? COR_NAO_COBERTA : scale(agg[metrica]));
        return contrasteTexto(cor);
      })
      .attr("data-fill", function () { return this.getAttribute("fill"); });

    legendaTitulo.text(METRICAS[metrica].label);
    legendaMin.text(`${min} registros`);
    legendaMax.text(`${max} registros`);
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
      ctx.fillStyle = "#F6F7FB";
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

  svg.dataset.mapaPronto = "true";
});