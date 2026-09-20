# Jetour International Ltd.: Public Website

Website for Jetour International Ltd., built with plain HTML, CSS and JavaScript (no frameworks or build tools). The public site (Home, About Us, Automotive, Agriculture, FAQ, Contact) is complete, the Supabase schema is set up, and the admin panel (login, dashboard, enquiries, settings) is built and wired to Supabase. What's left is connecting the public-facing pages to read live data from Supabase instead of the hardcoded placeholders: see "Next phase" below.

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Google Fonts: Plus Jakarta Sans (headings), Inter (body)
- Placeholder imagery via picsum.photos (clearly temporary: see "Images" below)
- Supabase (Postgres + Auth + Storage) for enquiries and editable site content

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
  reveal.js         : scroll-reveal animations (progressive enhancement)
  main.js           : injects SITE_CONFIG into the page, footer year
assets/
  icons/favicon.svg
supabase/
  schema.sql        : tables, RLS policies, admin allowlist, storage bucket
  seed.sql          : starting site_settings rows (mirrors js/config.js)
admin/
  login.html         : admin sign-in
  index.html          : dashboard (stat cards + recent enquiries)
  enquiries.html      : search, filter, and manage all enquiries
  settings.html       : edit branding, both hero slides, and contact info
  css/admin.css       : admin-only layout and components
  js/
    admin-auth.js      : session guard + logout, shared by every admin page except login
    admin-login.js      : sign-in form handling
    admin-dashboard.js  : dashboard counts and recent enquiries
    admin-enquiries.js  : enquiry list, search/filter, detail panel, status updates
    admin-settings.js   : loads/saves site_settings, handles image uploads
```

## Before this goes live

**1. Update contact details.** Everything lives in `js/config.js`. Replace the placeholder phone, WhatsApp number, email, address and business hours with the real values before this goes live. Once the public pages are wired to `site_settings` (see "Next phase"), this will move to being editable from `admin/settings.html` instead.

**2. Replace placeholder images.** Every image on the site currently comes from picsum.photos (a placeholder image service) so the layout can be reviewed. Before launch, swap these for real photos of vehicles and farm/livestock operations, or properly licensed stock photography. Search each HTML file for `picsum.photos` to find every instance.

**3. Confirm copy.** No specific vehicle brands, crop types, livestock categories, statistics or company history have been invented anywhere on the site, per the brief. If the client can confirm any of these, the relevant pages (Automotive, Agriculture) can be made more specific.

## Running locally

No build step is required. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
npx serve .
```

## Supabase setup

1. In the Supabase SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
2. In **Authentication > Providers > Email**, turn off "Allow new users to sign up." Admin accounts should only be created manually.
3. Create the first admin login under **Authentication > Users > Invite user**.
4. Copy that user's UUID and run:
   ```sql
   insert into public.admins (user_id) values ('paste-the-uuid-here');
   ```
   Without this step, that login can sign in but `is_admin()` will return false and every admin-only policy will deny it.
5. Put the project URL and anon key into `js/config.js`'s `supabase` object. This one file powers both the admin panel and (later) the public site, so it only needs to be set once. Every admin page shows a banner instead of failing silently if this step is skipped.
6. Open `admin/login.html` and sign in with the admin account from step 3.

## What `site_settings` covers

Four rows, each a JSON object, mirroring `SITE_CONFIG`:

- `branding`: company name and logo URL
- `hero_automotive` / `hero_agriculture`: image URL, headline and subtext for each hero slide
- `contact`: phone, WhatsApp number and message, email, address, business hours, social links

All four are editable from `admin/settings.html`, including uploading a new logo or hero image (stored in the `site-media` bucket). **The public site does not read from these yet** - it still uses the hardcoded values in `js/config.js` and the HTML itself, so editing settings in the admin panel will not change the live pages until the wiring described below is done.

## Admin panel

- `admin/login.html`: Supabase Auth sign-in. Redirects to the dashboard if already signed in.
- `admin/index.html`: total/new/vehicle/agriculture counts, plus the 8 most recent enquiries.
- `admin/enquiries.html`: every enquiry (up to 200, newest first), with a search box and type/status filters. Clicking a row opens a detail panel where the status can be changed (saved immediately) and the admin can call, email or WhatsApp the enquirer using their own submitted contact details.
- `admin/settings.html`: one form per `site_settings` row, each with its own Save button.

None of these pages appear in the public navbar, and each is marked `noindex, nofollow`. They still sit at guessable URLs (`/admin/login.html` etc.), which is normal for a small site like this: the real protection is the Supabase session check and `is_admin()` allowlist, not the URL being secret.

## Next phase (not in this delivery)

- Wiring the public pages to read hero copy, images and contact details from `site_settings` at runtime, so admin edits actually show up on the live site
- Optional: pagination on `admin/enquiries.html` if the list ever grows well past 200

