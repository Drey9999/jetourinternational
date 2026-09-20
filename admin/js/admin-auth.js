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
  const errorBanner = document.querySelector("[data-admin-error]");

  function showError(message) {
    console.error("[admin-auth]", message);
    if (errorBanner) {
      errorBanner.querySelector("span").textContent = message;
      errorBanner.style.display = "flex";
    }
  }

  if (!supabaseClient) {
    if (notConfiguredBanner) notConfiguredBanner.style.display = "flex";
    return;
  }

  async function requireSession() {
    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        showError("Could not verify your session: " + error.message);
        return;
      }

      if (!data.session) {
        window.location.href = "/admin/login.html";
        return;
      }

      document.querySelectorAll("[data-admin-email]").forEach((el) => {
        el.textContent = data.session.user.email;
      });

      document.dispatchEvent(new CustomEvent("admin-ready", { detail: { session: data.session } }));
    } catch (err) {
      showError("Something went wrong while checking your session. Open the browser console for details.");
    }
  }

  requireSession();

  // Safety net: if nothing above has redirected or shown an error within
  // a few seconds, something silently failed. Say so instead of leaving
  // the page stuck on its "Loading..." placeholders forever.
  window.setTimeout(() => {
    const stillOnLoginCheck = !document.body.dataset.adminReadyFired;
    if (stillOnLoginCheck && errorBanner && errorBanner.style.display !== "flex") {
      showError("This is taking longer than expected. Check the browser console for errors, and confirm your account has been added to the admins table in Supabase.");
    }
  }, 6000);

  document.addEventListener("admin-ready", () => {
    document.body.dataset.adminReadyFired = "true";
  });

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "/admin/login.html";
    }
  });

  document.querySelectorAll("[data-logout-btn]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "/admin/login.html";
    });
  });
})();
