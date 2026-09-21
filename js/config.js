/**
 * SITE_CONFIG
 * Single source of truth for all client-specific values.
 * Replace every value marked REPLACE with the real Jetour International Ltd. detail
 * before handing the site to the client. Nothing below is presented on the site
 * as confirmed fact until it is replaced.
 */
const SITE_CONFIG = {
  companyName: "Jetour International Ltd.",
  companyShort: "Jetour",
  foundedNote: "", // leave blank unless the client confirms a founding year

  // REPLACE with the real Nigerian number in international format, e.g. +2348012345678
  phoneDisplay: "+234 800 000 0000",
  phoneHref: "+2348000000000",

  // REPLACE with the real WhatsApp number in international format, no symbols
  whatsappNumber: "2348000000000",
  whatsappDefaultMessage: "Hello Jetour International, I would like to make an enquiry.",

  // REPLACE with the real business email
  email: "info@jetourinternational.com",

  // REPLACE with the real business address
  address: "Lagos, Nigeria",

  // REPLACE with real business hours
  hours: [
    { days: "Monday to Friday", time: "8:00 AM to 6:00 PM" },
    { days: "Saturday", time: "9:00 AM to 3:00 PM" },
    { days: "Sunday", time: "Closed" }
  ],

  // Leave empty and hide the related footer icons until the client supplies real links
  social: {
    instagram: "",
    facebook: "",
    x: ""
  },

  // Supabase project values are intentionally left blank in this build.
  // The public site is being reviewed with the client before the enquiry
  // backend and admin dashboard are wired up.
  supabase: {
    url: "https://shvgmcwagdzhryjrimii.supabase.co",
    anonKey: "sb_publishable_Y6GZ3Fdyur09G1JJgn4aXg_c3_TH6XQ"
  }
};

function whatsappLink(customMessage) {
  const message = encodeURIComponent(customMessage || SITE_CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${message}`;
}
