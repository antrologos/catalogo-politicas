import {
  FILTERS, RETURN_STORAGE_KEY, buildSearchUrl, readSearchState,
  removeFilter, countFilters, staticTerritoryUrl, readReturnState, prepareResult,
} from "./catalogo-busca-estado.js";

const search = document.querySelector("#search");
if (search) initializeSearch(search);

async function initializeSearch(search) {
  const searchPath = new URL("../../buscar/", import.meta.url).pathname;
  const basePath = searchPath.replace(/buscar\/$/, "");
  let state = readSearchState(location.search);
  const territoryUrl = staticTerritoryUrl(state, basePath);
  if (territoryUrl) {
    location.replace(territoryUrl);
    return;
  }

  const controls = document.querySelector("#busca-controles");
  const toggle = document.querySelector("#busca-filtros-toggle");
  const chips = document.querySelector("#busca-filtros-ativos");
  const clearFilters = document.querySelector("#busca-limpar-filtros");
  const failure = document.querySelector("#busca-falha");
  const emptyHelp = document.querySelector("#busca-sem-resultados");
  const initialHelp = document.querySelector("#busca-inicial");
  const viewResults = document.createElement("button");
  viewResults.type = "button";
  viewResults.className = "search-view-results btn btn--primary";
  viewResults.textContent = "Ver resultados";
  const mobile = window.matchMedia("(max-width: 767px)");
  let pagefindUI = null;
  let panelOpen = false;
  let deadline = null;
  let refreshQueued = false;
  let pendingList = null;
  let pending = false;
  let failed = false;
  let activeSignature = "";
  let restored = false;
  let restoring = null;
  let replayQueued = false;
  let responseReady = false;
  let resultCount = 0;

  try {
    const saved = readReturnState(sessionStorage.getItem(RETURN_STORAGE_KEY), location.href);
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;
    const fromRecord = saved && document.referrer &&
      new URL(document.referrer).origin === location.origin &&
      new URL(document.referrer).pathname === saved.resultPath;
    if (saved && (fromRecord || navigationType === "back_forward" || navigationType === "reload")) {
      restoring = saved;
    }
  } catch { /* A consulta continua utilizável quando o armazenamento é bloqueado. */ }

  function syncUrl() {
    const url = buildSearchUrl(state, searchPath);
    if (location.pathname + location.search !== url) history.replaceState(history.state, "", url);
  }

  function setFailure() {
    clearTimeout(deadline);
    pending = Boolean(state.query);
    failed = true;
    search.dataset.searchState = "failure";
    failure.hidden = false;
    emptyHelp.hidden = true;
    queueRefresh();
  }

  function beginSearch() {
    responseReady = false;
    clearTimeout(deadline);
    failed = false;
    failure.hidden = true;
    pending = Boolean(state.query);
    pendingList = search.querySelector(".pagefind-ui__results");
    search.dataset.searchState = pending ? "loading" : "initial";
    if (pending) deadline = setTimeout(setFailure, 20000);
    queueRefresh();
  }

  function setPanelOpen(open, focusResults = false) {
    panelOpen = open;
    search.dataset.filtersOpen = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    if (focusResults) {
      const results = search.querySelector(".pagefind-ui__results-area");
      results?.focus({ preventScroll: true });
      results?.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  function renderSelections() {
    const signature = JSON.stringify(state.filters);
    if (signature !== activeSignature) {
      const focused = document.activeElement;
      const hadChipFocus = chips.contains(focused);
      activeSignature = signature;
      chips.replaceChildren();
      for (const { name, label } of FILTERS) {
        for (const value of state.filters[name] || []) {
          const item = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.className = "search-filter-chip";
          button.textContent = label + ": " + value + " ×";
          button.setAttribute("aria-label", "Remover filtro " + label + ": " + value);
          button.addEventListener("click", () => {
            restoring = null;
            state.filters = removeFilter(state.filters, name, value);
            syncUrl();
            beginSearch();
            pagefindUI?.triggerFilters(state.filters);
            renderSelections();
          });
          item.append(button);
          chips.append(item);
        }
      }
      if (hadChipFocus) {
        (chips.querySelector("button") || search.querySelector(".pagefind-ui__search-input"))?.focus();
      }
    }
    const count = countFilters(state.filters);
    const label = "Filtros" + (count ? " (" + count + ")" : "");
    if (toggle.textContent !== label) toggle.textContent = label;
    chips.hidden = count === 0;
    clearFilters.hidden = count === 0;
    controls.hidden = !state.query && count === 0;
  }

  function restoreResults() {
    if (!responseReady || !restoring || restored || pending || failed) return;
    const links = [...search.querySelectorAll(".pagefind-ui__result-link[href]")];
    const more = search.querySelector(".pagefind-ui__button");
    if (links.length < search.querySelectorAll(".pagefind-ui__result").length) return;
    if (links.length < Math.min(restoring.visibleResults, resultCount) && more && !replayQueued) {
      replayQueued = true;
      requestAnimationFrame(() => {
        more.click();
        replayQueued = false;
      });
      return;
    }
    if (links.length < search.querySelectorAll(".pagefind-ui__result").length) return;
    restored = true;
    const target = restoring;
    restoring = null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const link = links.find((item) => new URL(item.href).pathname === target.resultPath);
      link?.focus({ preventScroll: true });
      window.scrollTo({ top: target.scrollY, behavior: "auto" });
    }));
  }

  function refresh() {
    refreshQueued = false;
    const input = search.querySelector(".pagefind-ui__search-input");
    const form = search.querySelector(".pagefind-ui__form");
    const drawer = search.querySelector(".pagefind-ui__drawer");
    const panel = search.querySelector(".pagefind-ui__filter-panel");
    const results = search.querySelector(".pagefind-ui__results-area");
    const list = search.querySelector(".pagefind-ui__results");
    const message = search.querySelector(".pagefind-ui__message");
    if (input) {
      input.id = "busca-termo";
      input.setAttribute("aria-describedby", "busca-dica");
    }
    if (form) form.setAttribute("role", "search");
    if (drawer && controls.parentElement !== form) form.insertBefore(controls, drawer);
    if (panel) {
      panel.id = "busca-filtros";
      if (viewResults.parentElement !== panel) panel.append(viewResults);
      for (const block of panel.querySelectorAll(".pagefind-ui__filter-block")) {
        const name = block.querySelector("input")?.name;
        const index = FILTERS.findIndex((item) => item.name === name);
        if (index < 0) continue;
        block.style.order = String(index);
        const summary = block.querySelector(".pagefind-ui__filter-name");
        const legend = block.querySelector(".pagefind-ui__filter-group-label");
        for (const element of [summary, legend]) {
          if (element && element.textContent !== FILTERS[index].label) {
            element.textContent = FILTERS[index].label;
          }
        }
      }
    }
    toggle.hidden = !panel;
    if (results) {
      results.id = "busca-resultados";
      results.tabIndex = -1;
      results.setAttribute("aria-label", "Resultados da busca");
    }
    if (message) {
      message.setAttribute("role", "status");
      message.setAttribute("aria-live", "polite");
      message.setAttribute("aria-atomic", "true");
    }
    if (!state.query && !failed) {
      clearTimeout(deadline);
      pending = false;
      failed = false;
      failure.hidden = true;
      search.dataset.searchState = "initial";
    } else if (responseReady && list && (!pending || list !== pendingList)) {
      clearTimeout(deadline);
      pending = false;
      failed = false;
      failure.hidden = true;
      search.dataset.searchState = list.children.length ? "results" : "empty";
    }
    initialHelp.hidden = Boolean(state.query);
    emptyHelp.hidden = search.dataset.searchState !== "empty";
    renderSelections();
    restoreResults();
  }

  function queueRefresh() {
    if (!refreshQueued) {
      refreshQueued = true;
      requestAnimationFrame(refresh);
    }
  }

  document.querySelector("#busca-tentar-novamente").addEventListener("click", () => location.reload());
  toggle.addEventListener("click", () => setPanelOpen(!panelOpen));
  viewResults.addEventListener("click", () => setPanelOpen(false, true));
  clearFilters.addEventListener("click", () => {
    restoring = null;
    state.filters = {};
    syncUrl();
    beginSearch();
    pagefindUI?.triggerFilters({});
    renderSelections();
    search.querySelector(".pagefind-ui__search-input")?.focus();
  });
  mobile.addEventListener("change", () => setPanelOpen(false));
  setPanelOpen(false);

  search.addEventListener("input", (event) => {
    if (!event.target.matches(".pagefind-ui__search-input")) return;
    restoring = null;
    state.query = event.target.value.trim().slice(0, 300);
    syncUrl();
    beginSearch();
  });
  search.addEventListener("change", (event) => {
    const checkbox = event.target;
    if (!checkbox.matches(".pagefind-ui__filter-checkbox")) return;
    restoring = null;
    const name = checkbox.name;
    if (!FILTERS.some((item) => item.name === name)) return;
    const values = new Set(state.filters[name] || []);
    checkbox.checked ? values.add(checkbox.value) : values.delete(checkbox.value);
    state.filters = { ...state.filters, [name]: [...values].sort() };
    if (!values.size) delete state.filters[name];
    syncUrl();
    beginSearch();
    renderSelections();
  });
  search.addEventListener("click", (event) => {
    if (event.target.closest(".pagefind-ui__search-clear")) {
      restoring = null;
      state.query = "";
      syncUrl();
      beginSearch();
    }
    const link = event.target.closest(".pagefind-ui__result-link[href]");
    if (!link) return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin || !destination.pathname.startsWith(basePath + "politica/")) return;
    const value = {
      version: 1,
      url: buildSearchUrl(state, searchPath),
      resultPath: destination.pathname,
      visibleResults: search.querySelectorAll(".pagefind-ui__result-link[href]").length,
      scrollY: Math.round(window.scrollY),
      updatedAt: Date.now(),
    };
    try { sessionStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(value)); } catch { /* Sem armazenamento, a URL mantém termo e filtros. */ }
  }, true);

  new MutationObserver(queueRefresh).observe(search, {
    childList: true, subtree: true, characterData: true,
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) queueRefresh();
  });

  window.addEventListener("catalogo:busca-concluida", (event) => {
    if (event.detail.term !== state.query) return;
    responseReady = true;
    resultCount = event.detail.total;
    queueRefresh();
  });
  window.addEventListener("catalogo:busca-erro", setFailure);

  const libraryDeadline = Date.now() + 8000;
  while (!window.PagefindUI && Date.now() < libraryDeadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!window.PagefindUI) {
    setFailure();
    return;
  }
  try {
    pagefindUI = new window.PagefindUI({
      element: "#search",
      bundlePath: basePath + "assets/js/catalogo-pagefind/",
      baseUrl: basePath,
      showSubResults: false,
      showImages: false,
      pageSize: 10,
      resetStyles: false,
      autofocus: false,
      focusOnSlash: true,
      openFilters: ["UF", "Tipo"],
      processTerm(term) {
        state.query = term.trim().slice(0, 300);
        syncUrl();
        beginSearch();
        return term;
      },
      processResult: prepareResult,
      translations: {
        placeholder: "Nome, sigla, assunto, base legal ou órgão",
        clear_search: "Limpar termo",
        load_more: "Mostrar mais resultados",
        search_label: "Buscar no catálogo",
        filters_label: "Refinar a consulta",
        zero_results: "Nenhum registro encontrado para [SEARCH_TERM].",
        many_results: "[COUNT] registros correspondem a [SEARCH_TERM]",
        one_result: "1 registro corresponde a [SEARCH_TERM]",
        alt_search: "Nenhum resultado para [SEARCH_TERM]. Resultados para [DIFFERENT_TERM].",
        search_suggestion: "Nenhum resultado para [SEARCH_TERM]. Experimente:",
        searching: "Buscando [SEARCH_TERM]…",
      },
    });
    pagefindUI?.triggerFilters(state.filters);
    if (state.query) pagefindUI.triggerSearch(state.query);
    syncUrl();
    queueRefresh();
  } catch {
    setFailure();
  }
}
