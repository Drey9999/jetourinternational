/**
 * images.js
 * Every picture on the site, in one place. Change a URL here and it
 * updates wherever that image is used, no need to search through the
 * HTML files. Each key corresponds to a data-img (for <img> tags) or
 * data-bg-img (for background-image sections) attribute already
 * placed in the HTML.
 *
 * The HTML also has the current picsum.photos URL baked in as a
 * plain src/style, so a page still looks right even before this
 * script runs. This file just overrides that default once it loads,
 * which is what makes editing here enough on its own.
 *
 * Sizes noted are a guide, not a strict requirement. Every image on
 * this site is displayed with cover/crop behavior, so a real photo
 * just needs to be roughly the same shape (wide banner vs square
 * tile) to look right. Larger than the noted size is always fine.
 */
const SITE_IMAGES = {
  // Homepage hero slider - wide, landscape, roughly 1800x1200
  "hero-automotive": "assets/images/Mercedes-Benz GLE Coupé_ Luxo, Desempenho e Tecnologia em um SUV Premium.jfif",
  "hero-agriculture": "assets/images/livestock.png",

  // Page banners - wide, roughly 1800x900 (Contact and FAQ are shorter, 1800x700)
  "about-hero": "https://picsum.photos/seed/jetour-about-hero/1800/900",
  "automotive-hero": "https://picsum.photos/seed/jetour-auto-hero/1800/900",
  "agriculture-hero": "https://picsum.photos/seed/jetour-agri-hero/1800/900",
  "contact-hero": "https://picsum.photos/seed/jetour-contact-hero/1800/700",
  "faq-hero": "https://picsum.photos/seed/jetour-faq-hero/1800/700",

  // Homepage showcase grid: 1 is large/square, 2-3 and 5 are small, 4 is wide
  "home-showcase-1": "https://picsum.photos/seed/jetour-show-1/900/900",
  "home-showcase-2": "https://picsum.photos/seed/jetour-show-2/500/300",
  "home-showcase-3": "https://picsum.photos/seed/jetour-show-3/500/300",
  "home-showcase-4": "https://picsum.photos/seed/jetour-show-4/900/400",
  "home-showcase-5": "https://picsum.photos/seed/jetour-show-5/500/300",

  // Agriculture page showcase grid, same layout pattern as the homepage one
  "agri-showcase-1": "https://picsum.photos/seed/jetour-agri-show-1/900/900",
  "agri-showcase-2": "https://picsum.photos/seed/jetour-agri-show-2/500/300",
  "agri-showcase-3": "https://picsum.photos/seed/jetour-agri-show-3/500/300",
  "agri-showcase-4": "https://picsum.photos/seed/jetour-agri-show-4/900/400",
  "agri-showcase-5": "https://picsum.photos/seed/jetour-agri-show-5/500/300"
};

function applyImages() {
  document.querySelectorAll("[data-img]").forEach((el) => {
    const url = SITE_IMAGES[el.dataset.img];
    if (url) el.setAttribute("src", url);
  });

  document.querySelectorAll("[data-bg-img]").forEach((el) => {
    const url = SITE_IMAGES[el.dataset.bgImg];
    if (url) el.style.backgroundImage = `url('${url}')`;
  });
}

applyImages();
