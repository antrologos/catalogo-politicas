/**
 * Toggle do menu hambúrguer mobile (Sprint 5).
 *
 * Comportamento:
 * - Click no botão #nav-toggle: alterna visibilidade do #nav-principal
 * - aria-expanded reflete estado (assistive tech anuncia "expandido"/"recolhido")
 * - Esc fecha o menu se aberto
 * - Click fora do nav fecha o menu
 *
 * Sem JS: nav permanece com classe "hidden md:flex" (visível só em desktop).
 * Para mobile sem JS, fallback é footer ou skip-link.
 */
(function () {
  "use strict";

  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#nav-principal");
  if (!toggle || !nav) return;

  function open() {
    nav.classList.remove("hidden");
    nav.classList.add("flex");
    nav.dataset.navMobileState = "open";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu de navegação");
    toggle.querySelector("[aria-hidden]").textContent = "✕";
  }

  function close() {
    nav.classList.add("hidden");
    nav.classList.remove("flex");
    nav.dataset.navMobileState = "closed";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu de navegação");
    toggle.querySelector("[aria-hidden]").textContent = "☰";
  }

  toggle.addEventListener("click", () => {
    if (nav.dataset.navMobileState === "open") {
      close();
    } else {
      open();
    }
  });

  // Esc fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.dataset.navMobileState === "open") {
      close();
      toggle.focus();
    }
  });

  // Click fora fecha
  document.addEventListener("click", (e) => {
    if (nav.dataset.navMobileState !== "open") return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  // Resize para desktop fecha (evita estado inconsistente)
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (lastWidth < 768 && window.innerWidth >= 768) {
      close();
      // Em desktop o nav volta a ser visível pela classe md:flex automaticamente
      nav.classList.remove("hidden");
    }
    lastWidth = window.innerWidth;
  });
})();