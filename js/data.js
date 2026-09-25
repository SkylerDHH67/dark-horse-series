/* =========================================================
   THE TEAM — DARK HORSE SERIES
   data.js — fetches both Google Sheets as CSV and normalizes
   them into plain JS objects. Nothing here touches the DOM.
   ========================================================= */

(function () {
  "use strict";
  const U = window.APP_UTILS;

  async function fetchCSV(url) {
    if (U.isBlank(url)) throw new Error("MISSING_SHEET_URL");
    const bust = url + (url.indexOf("?") !== -1 ? "&" : "?") + "_=" + Date.now();
    const res = await fetch(bust, { credentials: "omit", cache: "no-store" });
    const text = await res.text();
    const looksLikeHTML = /^\s*</.test(text) && /<html/i.test(text);
    if (!res.ok || looksLikeHTML) {
      const err = new Error("SHEET_NOT_PUBLIC");
      err.url = url;
      throw err;
    }
    return U.rowsToObjects(U.parseCSV(text));
  }

  function normalizePlayer(raw) {
    const p = Object.assign({}, raw);
    p._audiences = U.splitList(raw.audiences);
    p._keyTraits = U.splitList(raw.key_traits);
    p._featured = U.truthy(raw.featured);
    const order = parseFloat(raw.display_order);
    p._displayOrder = isNaN(order) ? Infinity : order;
    p._age = U.ageFromDOB(raw.dob);
    p._slug = U.isBlank(raw.slug)
      ? U.slugify(raw.display_name || raw.player_id || "")
      : raw.slug.trim();
    return p;
  }

  function buildConfigMaps(configRows) {
    const audiences = [];
    const traitLabels = {};

    configRows.forEach((r) => {
      const type = (r.type || "").trim().toLowerCase();
      const key = (r.key || "").trim().toLowerCase();
      const label = (r.label || "").trim();
      if (!key || !label) return;
      if (type === "audience") audiences.push({ key, label });
      else if (type === "trait") traitLabels[key] = label;
    });

    return { audiences, traitLabels };
  }

  async function loadAppData() {
    const [playerRows, configRows] = await Promise.all([
      fetchCSV(window.APP_CONFIG.PLAYERS_CSV_URL),
      fetchCSV(window.APP_CONFIG.CONFIG_CSV_URL),
    ]);

    const players = playerRows
      .filter((r) => !U.isBlank(r.player_id))
      .filter((r) => U.isBlank(r.status) || String(r.status).trim().toLowerCase() === "active")
      .map(normalizePlayer);

    const { audiences, traitLabels } = buildConfigMaps(configRows);

    return { players, audiences, traitLabels };
  }

  window.APP_DATA = { loadAppData };
})();
