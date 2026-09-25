/* =========================================================
   THE TEAM — DARK HORSE SERIES
   config.js — the only file you should need to touch for
   site-level configuration. Player data itself lives entirely
   in the Google Sheets below, never here.
   ========================================================= */

window.APP_CONFIG = {
  // "Players" Google Sheet, exported live as CSV. Must be shared
  // as "Anyone with the link -> Viewer" or this will fail to load.
  PLAYERS_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1Kfxr08kv2kvifbMhyFaGxvcraw4J1z8hsXPooX4rmd8/export?format=csv&gid=0",

  // "Config" Google Sheet — controlled vocabulary for audiences
  // and trait labels. Add a row there to add a new audience or
  // trait; no code change needed.
  CONFIG_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1HHOv2ge7BRTZ0dsAaiJdxTSzVLxu2MT5zdZ0HYCf2pQ/export?format=csv&gid=0",

  SITE_NAME: "THE TEAM",
  SUB_BRAND: "DARK HORSE SERIES",

  // Shown on a player's profile if that row's own contact_status/
  // notes don't specify something more specific. Fill in with
  // whatever email/contact you want visitors to use.
  CONTACT_EMAIL: "",
  CONTACT_FALLBACK_TEXT: "Contact The Team for full profile, video, or availability.",
};
