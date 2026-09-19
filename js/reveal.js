/**
 * reveal.js
 * Adds a one-time "is-visible" class to [data-reveal] elements as they
 * enter the viewport. Purely additive: the .js class (set inline in
 * <head>, before this file loads) is what turns on the hidden starting
 * state in CSS, so a visitor without JavaScript simply sees everything
 * in place, no animation, nothing missing.
 */
(function () {
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));

  // Safety net: never leave content invisible if something above goes wrong.
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }, 4000);
})();
