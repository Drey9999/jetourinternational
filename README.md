# Jetour International Ltd.: Public Website

Static website for Jetour International Ltd.: plain HTML, CSS and JavaScript, no frameworks, no build step, no backend. The site's job is to present the company clearly and get a visitor to call or WhatsApp directly; there is no contact form, no database, and no admin login required for it to work.

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Google Fonts: Plus Jakarta Sans (headings), Inter (body)
- Placeholder imagery via picsum.photos (clearly temporary: see "Before this goes live" below)

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
  components.css   : navbar, buttons, hero, cards, FAQ, footer
  responsive.css    : breakpoint overrides
js/
  config.js        : SITE_CONFIG: single source of truth for contact details
  images.js         : SITE_IMAGES: single source of truth for every picture on the site
  navigation.js     : mobile menu
  hero-slider.js    : homepage hero carousel
  faq.js            : FAQ accordion + category tabs
  reveal.js         : scroll-reveal animations (progressive enhancement)
  main.js           : injects SITE_CONFIG into the page (phone/WhatsApp/email links, hours, footer year)
assets/
  icons/favicon.svg
```

## Before this goes live

**1. Update contact details.** Everything the site shows (phone, WhatsApp, email, address, hours) comes from one place: `js/config.js`. Replace the placeholder values with the real ones.

**2. Replace placeholder images.** Every image on the site currently comes from picsum.photos (a placeholder image service) so the layout can be reviewed. All of them are listed in one file, `js/images.js`, with a plain-English comment on what each one is and roughly what shape it should be (wide banner vs square tile). Change the URL there and it updates everywhere that image appears; no need to search through the HTML. See "Updating images" below.

**3. Confirm copy.** No specific vehicle brands, crop types, livestock categories, statistics or company history have been invented anywhere on the site. If the client can confirm any of these, the relevant pages (Automotive, Agriculture) can be made more specific.

## Updating images

Open `js/images.js`. It's one object, `SITE_IMAGES`, with a key for every picture on the site (hero slides, page banners, the two showcase grids). Replace the URL for whichever key you want to change and save; every page that uses that image updates automatically, no HTML editing required.

If you're hosting the real photos somewhere (your own server, Cloudinary, Imgur, etc.), just paste that image's URL in. It doesn't have to be picsum.photos, any direct image URL works.

## How contact works (no backend)

There is no contact form and nothing is stored anywhere. Every enquiry-style button is either:

- A `tel:` link ("Talk to Us" / "Call Us") built from `SITE_CONFIG.phoneHref`, or
- A `wa.me` WhatsApp link, often with a pre-filled message specific to what the visitor clicked (e.g. Automotive's "Request a Vehicle" opens WhatsApp already saying so), or
- A `mailto:` link, optionally with a pre-filled subject.

All three are handled generically by `js/main.js`: any element with `data-config-href="phone"`, `"email"`, or `"whatsapp"` gets its `href` filled in from `SITE_CONFIG` automatically. Add `data-whatsapp-message="..."` for a custom pre-filled WhatsApp message, or `data-mail-subject="..."` for a pre-filled email subject. A floating WhatsApp button is present on every page.

## Running locally

No build step is required. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
npx serve .
```

## Paused: admin panel and Supabase backend

An earlier phase of this project included a full admin panel (`admin/`) and a Supabase backend (`supabase/schema.sql`, `supabase/seed.sql`) covering: an enquiries database with an admin dashboard to search, filter, update and delete submissions; a `site_settings` table letting an admin edit branding, both hero slides, and contact info, with the public site reading those values live (`js/site-content.js`, `js/supabase-client.js`).

That work is **paused, not deleted**, at the client's request due to budget. The files are still in this project:

```
admin/       : login, dashboard, enquiries, settings (Supabase Auth + Postgres)
supabase/    : schema.sql, seed.sql
js/supabase-client.js, js/site-content.js
```

None of it is linked from the live site or loaded by any public page right now, so it has no effect on performance, security surface, or hosting cost. To bring it back later:

1. Re-add the Supabase CDN script, `js/config.js`, `js/supabase-client.js` (and `js/site-content.js`, on public pages) to whichever pages need them.
2. Follow the setup steps that were previously documented here: run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL editor, disable public sign-up, invite the admin, and add their UUID to `public.admins`.
3. Fill in `js/config.js`'s `supabase.url` / `supabase.anonKey`.

Nothing about the current static site needs to change for this to work again; it was designed to layer on top without conflicting.
