-- ============================================================
-- JETOUR INTERNATIONAL LTD. -- SEED DATA
-- ============================================================
-- Run after schema.sql. Populates public.site_settings with the
-- same placeholder values currently hardcoded in js/config.js and
-- in the hero markup, so the admin dashboard has something real
-- to load and edit from day one instead of starting blank.
-- Safe to re-run: existing rows are left untouched.
-- ============================================================

insert into public.site_settings (key, value) values

('branding', '{
  "company_name": "Jetour International Ltd.",
  "company_short": "Jetour",
  "logo_url": ""
}'::jsonb),

('hero_automotive', '{
  "image_url": "",
  "headline": "Move With Confidence.",
  "subtext": "Jetour International Ltd. sources and imports vehicles for customers who need a dependable transportation solution, handled from enquiry through to delivery. We take the guesswork out of the process so you can focus on what the vehicle is for, not how to get it."
}'::jsonb),

('hero_agriculture', '{
  "image_url": "",
  "headline": "Grow With Purpose.",
  "subtext": "Jetour International Ltd. is also involved in farming, livestock rearing, and related agricultural activities, run with the same care as our automotive work. It is a slower, longer-term side of the business, and we treat it that way."
}'::jsonb),

('contact', '{
  "phone_display": "+234 800 000 0000",
  "phone_href": "+2348000000000",
  "whatsapp_number": "2348000000000",
  "whatsapp_message": "Hello Jetour International, I would like to make an enquiry.",
  "email": "info@jetourinternational.com",
  "address": "Lagos, Nigeria",
  "hours": [
    {"days": "Monday to Friday", "time": "8:00 AM to 6:00 PM"},
    {"days": "Saturday", "time": "9:00 AM to 3:00 PM"},
    {"days": "Sunday", "time": "Closed"}
  ],
  "social": {
    "instagram": "",
    "facebook": "",
    "x": ""
  }
}'::jsonb)

on conflict (key) do nothing;
