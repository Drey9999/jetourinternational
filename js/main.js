/**
 * main.js
 * Global initialization shared by every page: pulls contact details from
 * SITE_CONFIG into the DOM so there is exactly one place to update them,
 * and a couple of small page-wide touches (footer year, WhatsApp links).
 */
(function () {
  document.querySelectorAll("[data-config-text]").forEach((el) => {
    const key = el.dataset.configText;
    if (SITE_CONFIG[key] !== undefined) el.textContent = SITE_CONFIG[key];
  });

  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.dataset.configHref;
    if (key === "phone") {
      el.setAttribute("href", `tel:${SITE_CONFIG.phoneHref}`);
    } else if (key === "email") {
      el.setAttribute("href", `mailto:${SITE_CONFIG.email}`);
    } else if (key === "whatsapp") {
      el.setAttribute("href", whatsappLink(el.dataset.whatsappMessage));
    }
  });

  document.querySelectorAll("[data-hours-list]").forEach((list) => {
    list.innerHTML = SITE_CONFIG.hours
      .map((row) => `<li><span>${row.days}</span><span>${row.time}</span></li>`)
      .join("");
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
