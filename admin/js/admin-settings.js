/**
 * admin-settings.js
 * Loads the four site_settings rows and lets the admin edit and
 * save each section independently. Image uploads go straight to
 * the "site-media" storage bucket on file select; the resulting
 * public URL is only written to site_settings when that section's
 * Save button is pressed, same as every other field in the form.
 */
(function () {
  if (!supabaseClient) return;

  const pendingImageUrls = {}; // key -> url, staged until that section is saved

  function setSectionStatus(key, message, isError) {
    const el = document.querySelector(`[data-settings-status="${key}"]`);
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? "#B91C1C" : "var(--color-green-dark)";
  }

  async function uploadImage(key, file) {
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `${key}/${Date.now()}.${ext}`;

    const { error } = await supabaseClient.storage.from("site-media").upload(path, file, { upsert: true });
    if (error) {
      setSectionStatus(key, "Image upload failed. Please try again.", true);
      return;
    }

    const { data } = supabaseClient.storage.from("site-media").getPublicUrl(path);
    pendingImageUrls[key] = data.publicUrl;

    const preview = document.querySelector(`[data-image-preview="${key}"]`);
    if (preview) preview.src = data.publicUrl;
  }

  function currentImageUrl(key, fallback) {
    return pendingImageUrls[key] || fallback || "";
  }

  function addHourRow(container, entry) {
    const row = document.createElement("div");
    row.className = "hours-row";
    row.innerHTML = `
      <input type="text" placeholder="Days, e.g. Monday to Friday" value="${entry ? entry.days : ""}" data-hour-days>
      <input type="text" placeholder="Time, e.g. 8:00 AM to 6:00 PM" value="${entry ? entry.time : ""}" data-hour-time>
      <button type="button" class="btn btn-outline btn-small" data-remove-hour>Remove</button>
    `;
    row.querySelector("[data-remove-hour]").addEventListener("click", () => row.remove());
    container.appendChild(row);
  }

  async function loadSettings() {
    const { data, error } = await supabaseClient.from("site_settings").select("*");
    if (error) {
      document.querySelectorAll("[data-settings-form]").forEach((form) => {
        form.innerHTML = "<p>Could not load settings.</p>";
      });
      return;
    }

    const settings = {};
    data.forEach((row) => (settings[row.key] = row.value));

    // Branding
    const branding = settings.branding || {};
    document.querySelector("[name=branding_company_name]").value = branding.company_name || "";
    document.querySelector("[name=branding_company_short]").value = branding.company_short || "";
    if (branding.logo_url) document.querySelector('[data-image-preview="branding"]').src = branding.logo_url;

    // Hero automotive / agriculture
    ["hero_automotive", "hero_agriculture"].forEach((key) => {
      const hero = settings[key] || {};
      document.querySelector(`[name=${key}_headline]`).value = hero.headline || "";
      document.querySelector(`[name=${key}_subtext]`).value = hero.subtext || "";
      if (hero.image_url) document.querySelector(`[data-image-preview="${key}"]`).src = hero.image_url;
    });

    // Contact
    const contact = settings.contact || {};
    document.querySelector("[name=contact_phone_display]").value = contact.phone_display || "";
    document.querySelector("[name=contact_phone_href]").value = contact.phone_href || "";
    document.querySelector("[name=contact_whatsapp_number]").value = contact.whatsapp_number || "";
    document.querySelector("[name=contact_whatsapp_message]").value = contact.whatsapp_message || "";
    document.querySelector("[name=contact_email]").value = contact.email || "";
    document.querySelector("[name=contact_address]").value = contact.address || "";
    document.querySelector("[name=contact_instagram]").value = (contact.social || {}).instagram || "";
    document.querySelector("[name=contact_facebook]").value = (contact.social || {}).facebook || "";
    document.querySelector("[name=contact_x]").value = (contact.social || {}).x || "";

    const hoursContainer = document.querySelector("[data-hours-editor]");
    hoursContainer.innerHTML = "";
    (contact.hours || []).forEach((entry) => addHourRow(hoursContainer, entry));
  }

  async function saveRow(key, value) {
    const { error } = await supabaseClient.from("site_settings").update({ value }).eq("key", key);
    setSectionStatus(key, error ? "Could not save. Please try again." : "Saved.", Boolean(error));
  }

  document.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("change", (event) => {
      uploadImage(input.dataset.imageInput, event.target.files[0]);
    });
  });

  const addHourBtn = document.querySelector("[data-add-hour]");
  if (addHourBtn) {
    addHourBtn.addEventListener("click", () => {
      addHourRow(document.querySelector("[data-hours-editor]"));
    });
  }

  const brandingForm = document.querySelector('[data-settings-form="branding"]');
  if (brandingForm) {
    brandingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveRow("branding", {
        company_name: brandingForm.elements.branding_company_name.value.trim(),
        company_short: brandingForm.elements.branding_company_short.value.trim(),
        logo_url: currentImageUrl("branding")
      });
    });
  }

  ["hero_automotive", "hero_agriculture"].forEach((key) => {
    const form = document.querySelector(`[data-settings-form="${key}"]`);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveRow(key, {
        headline: form.elements[`${key}_headline`].value.trim(),
        subtext: form.elements[`${key}_subtext`].value.trim(),
        image_url: currentImageUrl(key)
      });
    });
  });

  const contactForm = document.querySelector('[data-settings-form="contact"]');
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const hours = Array.from(document.querySelectorAll("[data-hours-editor] .hours-row"))
        .map((row) => ({
          days: row.querySelector("[data-hour-days]").value.trim(),
          time: row.querySelector("[data-hour-time]").value.trim()
        }))
        .filter((entry) => entry.days || entry.time);

      saveRow("contact", {
        phone_display: contactForm.elements.contact_phone_display.value.trim(),
        phone_href: contactForm.elements.contact_phone_href.value.trim(),
        whatsapp_number: contactForm.elements.contact_whatsapp_number.value.trim(),
        whatsapp_message: contactForm.elements.contact_whatsapp_message.value.trim(),
        email: contactForm.elements.contact_email.value.trim(),
        address: contactForm.elements.contact_address.value.trim(),
        hours,
        social: {
          instagram: contactForm.elements.contact_instagram.value.trim(),
          facebook: contactForm.elements.contact_facebook.value.trim(),
          x: contactForm.elements.contact_x.value.trim()
        }
      });
    });
  }

  window.adminReady.then(loadSettings);
})();
