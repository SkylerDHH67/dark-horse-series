/* =========================================================
   THE TEAM — DARK HORSE SERIES
   utils.js — pure helper functions, no DOM, no fetch.
   Shared by data.js, filters.js, render.js.
   ========================================================= */

(function () {
  "use strict";

  function isBlank(v) {
    return v === undefined || v === null || String(v).trim() === "";
  }

  function truthy(v) {
    if (isBlank(v)) return false;
    const s = String(v).trim().toLowerCase();
    return s === "true" || s === "yes" || s === "1";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  // "nba, europe_elite" -> ["nba", "europe_elite"]
  function splitList(v) {
    if (isBlank(v)) return [];
    return String(v).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  }

  function ageFromDOB(dob) {
    if (isBlank(dob)) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  }

  function slugify(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // First 2 letters of each significant word, e.g. "rim_protection" -> "RP", "shooting" -> "SH"
  function monogram(key) {
    const clean = String(key || "").replace(/[_-]+/g, " ").trim();
    if (!clean) return "?";
    const words = clean.split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  // RFC4180-ish CSV parser: handles quoted fields, embedded commas,
  // doubled quotes, and newlines inside quoted fields.
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += c;
        }
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ",") { row.push(field); field = ""; }
        else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
        else field += c;
      }
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((f) => String(f).trim() !== ""));
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map((h) => String(h).trim());
    return rows.slice(1).map((r) => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] !== undefined ? String(r[idx]).trim() : ""); });
      return obj;
    });
  }


  function abbreviatePosition(pos) {
    if (isBlank(pos)) return "";
    const words = String(pos).trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
  }

  window.APP_UTILS = {
    isBlank, truthy, esc, splitList, ageFromDOB, slugify, monogram, abbreviatePosition, parseCSV, rowsToObjects,
  };
})();
