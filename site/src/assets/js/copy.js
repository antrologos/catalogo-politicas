/**
 * Copy-to-clipboard com live region (E.5 §2.8 + §3.4).
 *
 * Uso: <button class="js-copy" data-copy-target="#meu-id" aria-describedby="feedback-id">
 *      <pre id="meu-id"><code>...</code></pre>
 *      <p id="feedback-id" role="status" aria-live="polite" class="visually-hidden"></p>
 *
 * Comportamento:
 * - Click: copia textContent do alvo via Clipboard API (fallback execCommand).
 * - Anuncia "Citação copiada" no aria-live polite.
 * - Limpa anúncio após 3s (evita poluição do screen reader).
 * - Texto temporário no botão visualmente: "Copiado ✓" por 1.5s.
 */
(function () {
  "use strict";

  const buttons = document.querySelectorAll(".js-copy");
  for (const btn of buttons) {
    btn.addEventListener("click", () => handleCopy(btn));
  }

  async function handleCopy(btn) {
    const targetSel = btn.getAttribute("data-copy-target");
    const feedbackSel = "#" + btn.getAttribute("aria-describedby");
    const target = targetSel ? document.querySelector(targetSel) : null;
    const feedback = document.querySelector(feedbackSel);

    if (!target) return;
    const text = target.textContent.trim();
    const label = (btn.textContent || "Citação").trim().replace(/^Copiar\s+/i, "");

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        // Fallback para HTTP / browsers antigos
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch (e) {
      ok = false;
    }

    // Feedback visual no botão
    const original = btn.textContent;
    btn.textContent = ok ? "Copiado ✓" : "Erro ao copiar";
    btn.setAttribute("aria-pressed", "true");
    setTimeout(() => {
      btn.textContent = original;
      btn.removeAttribute("aria-pressed");
    }, 1500);

    // Live region (anúncio para screen reader)
    if (feedback) {
      feedback.textContent = ok
        ? `${label} copiada para a área de transferência.`
        : `Erro ao copiar ${label}. Tente selecionar o texto manualmente.`;
      setTimeout(() => {
        feedback.textContent = "";
      }, 3000);
    }
  }
})();