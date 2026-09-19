/**
 * navigation.js
 * Handles the sticky navbar's mobile menu: open/close, scroll lock,
 * scrim, and keyboard (Escape) dismissal.
 */
(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  const scrim = document.querySelector("[data-nav-scrim]");

  if (!toggle || !links || !scrim) return;

  function openMenu() {
    links.dataset.open = "true";
    scrim.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
    document.body.dataset.navOpen = "true";
  }

  function closeMenu() {
    links.dataset.open = "false";
    scrim.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
    document.body.dataset.navOpen = "false";
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  scrim.addEventListener("click", closeMenu);

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  // Reset menu state if the viewport grows past the mobile breakpoint.
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
})();
