/**
 * faq.js
 * Accessible accordion (keyboard operable, ARIA state) used on both the
 * homepage FAQ preview and the full FAQ page. Also drives the FAQ page's
 * category tabs, where present.
 */
(function () {
  function setAnswerHeight(answer, isOpen) {
    if (!isOpen) {
      answer.style.maxHeight = "0px";
      return;
    }
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  }

  document.querySelectorAll("[data-faq-question]").forEach((question) => {
    const answer = document.getElementById(question.getAttribute("aria-controls"));
    if (!answer) return;

    question.addEventListener("click", () => {
      const isOpen = question.getAttribute("aria-expanded") === "true";
      question.setAttribute("aria-expanded", String(!isOpen));
      setAnswerHeight(answer, !isOpen);
    });
  });

  // Recalculate open answers on resize so wrapped text isn't clipped.
  window.addEventListener("resize", () => {
    document.querySelectorAll('[data-faq-question][aria-expanded="true"]').forEach((question) => {
      const answer = document.getElementById(question.getAttribute("aria-controls"));
      if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  });

  // Category tabs (FAQ page only).
  const tabs = Array.from(document.querySelectorAll("[data-faq-tab]"));
  const items = Array.from(document.querySelectorAll("[data-faq-item]"));
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.faqTab;

      tabs.forEach((t) => t.setAttribute("aria-current", String(t === tab)));

      items.forEach((item) => {
        const matches = category === "all" || item.dataset.faqCategory === category;
        item.style.display = matches ? "" : "none";
      });
    });
  });
})();
