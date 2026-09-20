/**
 * supabase-client.js
 * Creates the single Supabase client instance used across the admin
 * area. Depends on the Supabase JS library (loaded via CDN in each
 * admin page's <head>, before this file) and on SITE_CONFIG.supabase
 * (see js/config.js) being filled in with the real project URL and
 * anon key.
 */
const supabaseClient = (function () {
  const { url, anonKey } = SITE_CONFIG.supabase;

  if (!url || !anonKey) {
    console.warn(
      "Supabase URL/anon key are not set in js/config.js yet. " +
      "Admin pages will not be able to load or save data until they are."
    );
    return null;
  }

  return supabase.createClient(url, anonKey);
})();
