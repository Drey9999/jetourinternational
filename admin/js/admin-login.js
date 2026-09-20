/**
 * admin-login.js
 * Handles the login form on admin/login.html. If a session already
 * exists (the admin is already signed in), skips straight to the
 * dashboard instead of showing the form.
 */
(function () {
  const form = document.querySelector("[data-login-form]");
  const errorBox = document.querySelector("[data-login-error]");
  const submitBtn = document.querySelector("[data-login-submit]");
  const notConfiguredBanner = document.querySelector("[data-supabase-warning]");

  if (!supabaseClient) {
    if (notConfiguredBanner) notConfiguredBanner.style.display = "flex";
    if (form) form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
    return;
  }

  supabaseClient.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "/admin/index.html";
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Signing In..." : "Sign In";
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = message ? "flex" : "none";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    setLoading(true);

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      showError("Incorrect email or password. Please try again.");
      return;
    }

    window.location.href = "/admin/index.html";
  });
})();
