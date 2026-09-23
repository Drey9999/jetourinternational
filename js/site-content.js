/**
 * site-content.js
 * The page already renders correctly using the defaults baked into
 * js/config.js and the HTML itself, so nothing here is required for
 * the site to work. If Supabase is configured, this quietly fetches
 * the live site_settings rows (edited from admin/settings.html) and
 * updates contact details, the logo, and the homepage hero content
 * in place. Any row, or any field within a row, that is missing or
 * empty is left alone rather than blanking out the default.
 */
(function () {
  if (typeof supabaseClient === "undefined" || !supabaseClient) return;

  function applyContact(contact) {
    if (!contact) return;
    if (contact.phone_display) SITE_CONFIG.phoneDisplay = contact.phone_display;
    if (contact.phone_href) SITE_CONFIG.phoneHref = contact.phone_href;
    if (contact.whatsapp_number) SITE_CONFIG.whatsappNumber = contact.whatsapp_number;
    if (contact.whatsapp_message) SITE_CONFIG.whatsappDefaultMessage = contact.whatsapp_message;
    if (contact.email) SITE_CONFIG.email = contact.email;
    if (contact.address) SITE_CONFIG.address = contact.address;
    if (Array.isArray(contact.hours) && contact.hours.length) SITE_CONFIG.hours = contact.hours;
    if (contact.social) SITE_CONFIG.social = contact.social;
  }

  function applyBranding(branding) {
    if (!branding) return;
    if (branding.company_name) SITE_CONFIG.companyName = branding.company_name;
    if (branding.company_short) SITE_CONFIG.companyShort = branding.company_short;

    if (branding.logo_url) {
      document.querySelectorAll("svg.brand-mark").forEach((svg) => {
        const img = document.createElement("img");
        img.src = branding.logo_url;
        img.alt = (branding.company_name || SITE_CONFIG.companyName) + " logo";
        img.className = svg.getAttribute("class");
        svg.replaceWith(img);
      });
    }
  }

  function applyHero(key, hero) {
    if (!hero) return;
    const slide = document.querySelector(`[data-hero-slide-key="${key}"]`);
    if (!slide) return;

    if (hero.image_url) {
      const media = slide.querySelector(".hero-slide-media");
      if (media) media.style.backgroundImage = `url('${hero.image_url}')`;
    }
    if (hero.headline) {
      const heading = slide.querySelector("h1");
      if (heading) heading.textContent = hero.headline;
    }
    if (hero.subtext) {
      const subtext = slide.querySelector("p");
      if (subtext) subtext.textContent = hero.subtext;
    }
  }

  async function applySiteSettings() {
    const { data, error } = await supabaseClient.from("site_settings").select("*");
    if (error || !data) return;

    const settings = {};
    data.forEach((row) => (settings[row.key] = row.value));

    applyContact(settings.contact);
    applyBranding(settings.branding);

    if (typeof window.applyConfig === "function") window.applyConfig();

    applyHero("automotive", settings.hero_automotive);
    applyHero("agriculture", settings.hero_agriculture);
  }

  applySiteSettings();
})();
