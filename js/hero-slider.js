/**
 * hero-slider.js
 * Drives the two-slide homepage hero: automatic rotation, manual dot
 * controls, prev/next buttons, and touch swipe. Autoplay is skipped
 * entirely when the visitor prefers reduced motion.
 */
(function () {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prevBtn = slider.querySelector("[data-hero-prev]");
  const nextBtn = slider.querySelector("[data-hero-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROTATION_MS = 6500;

  let activeIndex = slides.findIndex((slide) => slide.dataset.heroSlide === "active");
  if (activeIndex < 0) activeIndex = 0;
  let timer = null;

  function render() {
    slides.forEach((slide, index) => {
      slide.dataset.active = index === activeIndex ? "true" : "false";
    });
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  function goTo(index) {
    activeIndex = (index + slides.length) % slides.length;
    render();
    restartAutoplay();
  }

  function next() { goTo(activeIndex + 1); }
  function prev() { goTo(activeIndex - 1); }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2) return;
    timer = window.setInterval(next, ROTATION_MS);
  }

  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index));
  });

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  // Pause on hover/focus so a reading visitor isn't interrupted mid-slide.
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  // Touch swipe support.
  let touchStartX = null;
  slider.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      deltaX < 0 ? next() : prev();
    } else {
      startAutoplay();
    }
    touchStartX = null;
  });

  render();
  startAutoplay();
})();
