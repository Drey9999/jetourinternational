/**
 * main.js
 * Global initialization shared by every page: pulls contact details from
 * SITE_CONFIG into the DOM so there is exactly one place to update them,
 * and a couple of small page-wide touches (footer year, WhatsApp links).
 *
 * applyConfig() is exposed on window so js/site-content.js can call it
 * again after fetching live values from Supabase, updating the same
 * elements in place once the real contact/branding data arrives.
 */
function applyConfig() {
  document.querySelectorAll("[data-config-text]").forEach((el) => {
    const key = el.dataset.configText;
    if (SITE_CONFIG[key] !== undefined) el.textContent = SITE_CONFIG[key];
  });

  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.dataset.configHref;
    if (key === "phone") {
      el.setAttribute("href", `tel:${SITE_CONFIG.phoneHref}`);
    } else if (key === "email") {
      const subject = el.dataset.mailSubject;
      el.setAttribute("href", subject ? `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}` : `mailto:${SITE_CONFIG.email}`);
    } else if (key === "whatsapp") {
      el.setAttribute("href", whatsappLink(el.dataset.whatsappMessage));
    }
  });

  document.querySelectorAll("[data-hours-list]").forEach((list) => {
    list.innerHTML = SITE_CONFIG.hours
      .map((row) => `<li><span>${row.days}</span><span>${row.time}</span></li>`)
      .join("");
  });
}

window.applyConfig = applyConfig;
applyConfig();

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
