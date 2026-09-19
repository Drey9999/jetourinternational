# Jetour International Ltd.: Public Website

Public-facing website for Jetour International Ltd., built with plain HTML, CSS and JavaScript (no frameworks or build tools). This delivery covers the public site only: Home, About Us, Automotive, Agriculture, FAQ and Contact. The Supabase-backed enquiry system and the private admin dashboard are a separate, later phase and are not part of this build.

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Google Fonts: Plus Jakarta Sans (headings), Inter (body)
- Placeholder imagery via picsum.photos (clearly temporary: see "Images" below)

## File structure

```
index.html
pages/
  about.html
  automotive.html
  agriculture.html
  faq.html
  contact.html
css/
  style.css       : design tokens, reset, typography, layout
  components.css   : navbar, buttons, hero, cards, FAQ, forms, footer
  responsive.css    : breakpoint overrides
js/
  config.js        : SITE_CONFIG: single source of truth for contact details
  navigation.js     : mobile menu
  hero-slider.js    : homepage hero carousel
  faq.js            : FAQ accordion + category tabs
  contact.js        : form validation and submit states
  main.js           : injects SITE_CONFIG into the page, footer year
assets/
  icons/favicon.svg
```

## Before this goes live

**1. Update contact details.** Everything lives in `js/config.js`. Replace the placeholder phone, WhatsApp number, email, address and business hours with the real values before this goes live.

**2. Replace placeholder images.** Every image on the site currently comes from picsum.photos (a placeholder image service) so the layout can be reviewed. Before launch, swap these for real photos of vehicles and farm/livestock operations, or properly licensed stock photography. Search each HTML file for `picsum.photos` to find every instance.

**3. Confirm copy.** No specific vehicle brands, crop types, livestock categories, statistics or company history have been invented anywhere on the site, per the brief. If the client can confirm any of these, the relevant pages (Automotive, Agriculture) can be made more specific.

## Running locally

No build step is required. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
npx serve .
```

## Next phase (not in this delivery)

- Supabase `enquiries` table with Row Level Security (public insert only, authenticated read/update)
- `/admin/login.html`, `/admin/index.html`, `/admin/enquiries.html`
- Wiring `js/contact.js`'s `submitEnquiry()` function to a real Supabase insert (it currently simulates a network call so the form can be demonstrated end to end)
