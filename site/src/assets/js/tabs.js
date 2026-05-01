/**
 * Tabs ARIA W3C-compliant (E.5 §2.9, NF-M-07).
 *
 * Implementa W3C ARIA Authoring Practices Guide — Tabs Pattern (manual activation):
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * Comportamento:
 * - Click ou Enter/Space ativa a tab focada
 * - Setas ←→ movem foco entre tabs (sem ativar — manual activation)
 * - Home/End vão para primeira/última tab
 * - Apenas tab ativa tem tabindex=0; demais tabindex=-1
 * - Tabpanel ativo tem hidden=false; demais hidden=true
 *
 * Marcação esperada:
 *   <div class="js-tabs">
 *     <div role="tablist">
 *       <button role="tab" aria-controls="panel-X" aria-selected aria-tabindex>
 *     </div>
 *     <section role="tabpanel" id="panel-X" hidden?>
 *   </div>
 *
 * Sem JS: degradação graciosa — todos panels visíveis (CSS remove [hidden] em .no-js).
 */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("has-js");

  const instances = document.querySelectorAll(".js-tabs");
  for (const root of instances) initTabs(root);

  function initTabs(root) {
    const tablist = root.querySelector('[role="tablist"]');
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

    if (tabs.length === 0 || panels.length === 0) return;

    // Click ativa (manual activation)
    for (const tab of tabs) {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        activateTab(tabs, panels, tab);
      });
    }

    // Teclado no tablist
    tablist.addEventListener("keydown", (e) => {
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      switch (e.key) {
        case "ArrowRight":
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case "ArrowLeft":
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = tabs.length - 1;
          break;
        case "Enter":
        case " ":
          // Manual activation: ativa a tab focada
          activateTab(tabs, panels, document.activeElement);
          e.preventDefault();
          return;
        default:
          return;
      }

      if (nextIndex !== -1) {
        e.preventDefault();
        focusTab(tabs, nextIndex);
      }
    });
  }

  function focusTab(tabs, index) {
    // Atualiza tabindex sem ativar
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute("tabindex", i === index ? "0" : "-1");
    }
    tabs[index].focus();
  }

  function activateTab(tabs, panels, tab) {
    if (!tab || !tab.matches('[role="tab"]')) return;
    const targetId = tab.getAttribute("aria-controls");

    for (const t of tabs) {
      const isActive = t === tab;
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.setAttribute("tabindex", isActive ? "0" : "-1");
      // Atualiza estilo via classes
      if (isActive) {
        t.classList.add("border-primary", "text-primary");
        t.classList.remove("border-transparent", "text-neutral-700");
      } else {
        t.classList.remove("border-primary", "text-primary");
        t.classList.add("border-transparent", "text-neutral-700");
      }
    }

    for (const p of panels) {
      const isActive = p.id === targetId;
      if (isActive) {
        p.removeAttribute("hidden");
      } else {
        p.setAttribute("hidden", "");
      }
    }
  }
})();