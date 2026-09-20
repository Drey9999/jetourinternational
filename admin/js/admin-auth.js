/**
 * admin-auth.js
 * Include on every admin page EXCEPT login.html. Redirects to
 * login.html if there is no active Supabase session, wires up any
 * [data-logout-btn], and fills in [data-admin-email] once the
 * session is confirmed. Dispatches an "admin-ready" event on
 * document once a session is confirmed, so page-specific scripts
 * (dashboard, enquiries, settings) know it is safe to start
 * fetching data.
 */
(function () {
  const notConfiguredBanner = document.querySelector("[data-supabase-warning]");

  if (!supabaseClient) {
    if (notConfiguredBanner) notConfiguredBanner.style.display = "flex";
    return;
  }

  async function requireSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session) {
      window.location.href = "login.html";
      return;
    }

    document.querySelectorAll("[data-admin-email]").forEach((el) => {
      el.textContent = data.session.user.email;
    });

    document.dispatchEvent(new CustomEvent("admin-ready", { detail: { session: data.session } }));
  }

  requireSession();

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "login.html";
    }
  });

  document.querySelectorAll("[data-logout-btn]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    });
  });
})();
