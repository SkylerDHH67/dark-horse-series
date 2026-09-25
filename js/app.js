/* =========================================================
   THE TEAM — DARK HORSE SERIES
   app.js — boots the app: loads data, wires the audience
   picker, the directory, and the profile view together.
   ========================================================= */

(function () {
  "use strict";
  const U = window.APP_UTILS;
  const F = window.APP_FILTERS;
  const R = window.APP_RENDER;

  function $(sel) { return document.querySelector(sel); }

  let DATA = { players: [], audiences: [], traitLabels: {} };
  let STATE = { audience: null, query: "", position: "", stage: "All" };

  async function boot() {
    try {
      DATA = await window.APP_DATA.loadAppData();
      $("#loading-screen").classList.add("hidden");
      startAudiencePicker();
    } catch (err) {
      $("#loading-screen").classList.add("hidden");
      showLoadError(err);
    }
  }

  function showLoadError(err) {
    const box = $("#error-screen");
    box.classList.remove("hidden");
    const cfg = window.APP_CONFIG;
    box.innerHTML =
      '<div class="empty-state-title">Can\'t load player data</div>' +
      "<p>One of the Google Sheets isn't shared publicly yet, so the site can't read it.</p>" +
      "<p>Open each Sheet, click <b>Share</b> → set general access to <b>\"Anyone with the link\" → Viewer</b>, then reload this page.</p>" +
      '<p><code>' + U.esc((err && err.url) || "") + "</code></p>";
  }

  function startAudiencePicker() {
    // Always land on the audience picker for a fresh page load — the
    // audience choice is intentionally NOT remembered across visits, so
    // every visitor (or every reload) sees "Who are you?" first.
    showAudienceScreen();
  }

  function showAudienceScreen() {
    $("#app").classList.add("hidden");
    $("#audience-screen").classList.remove("hidden");
    const options = F.getAudienceOptions(DATA.audiences);
    R.renderAudiencePicker($("#audience-list"), options, (a) => {
      STATE.audience = a.key;
      $("#audience-screen").classList.add("hidden");
      showDirectory();
    });
  }

  function currentAudienceLabel() {
    const options = F.getAudienceOptions(DATA.audiences);
    const found = options.find((a) => a.key === STATE.audience);
    return found ? found.label : "Guest";
  }

  function showDirectory() {
    $("#audience-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    wireChromeOnce();
    renderAll();
  }

  let chromeWired = false;
  function wireChromeOnce() {
    if (chromeWired) return;
    chromeWired = true;

    $("#search-input").addEventListener("input", () => {
      STATE.query = $("#search-input").value.trim();
      renderAll();
    });

    $("#filter-toggle").addEventListener("click", () => {
      $("#filters-panel").classList.toggle("hidden");
      $("#filter-toggle").classList.toggle("active");
    });

    $("#audience-pill").addEventListener("click", () => {
      showAudienceScreen();
    });

    const brandHomeBtn = $("#brand-home-btn");
    if (brandHomeBtn) {
      brandHomeBtn.addEventListener("click", () => {
        showAudienceScreen();
      });
    }
  }

  function renderAll() {
    $("#audience-pill").innerHTML = "Viewing as <b>" + U.esc(currentAudienceLabel()) + "</b> · Switch";

    const audienceScoped = DATA.players.filter((p) => F.matchesAudience(p, STATE.audience));

    R.renderStageTabs($("#tabs"), audienceScoped, STATE.stage, (stage) => {
      STATE.stage = stage;
      renderAll();
    });

    R.renderFilters($("#filters-panel"), audienceScoped, STATE, (patch) => {
      Object.assign(STATE, patch);
      renderAll();
    });

    // Stage is applied once, inside applyFilters, which treats the "All"
    // sentinel as "no restriction" — do not filter by stage a second time
    // here (that duplicate pass was the root cause of the "All" bug).
    const filtered = F.applyFilters(audienceScoped, STATE);
    const sorted = F.sortPlayers(filtered);

    $("#result-meta").textContent = sorted.length + (sorted.length === 1 ? " player" : " players");
    R.renderGrid($("#grid"), sorted, DATA.traitLabels, openProfile);
  }

  function openProfile(player) {
    R.renderProfile($("#profile-overlay"), player, DATA.traitLabels, closeProfile);
  }

  function closeProfile() {
    const overlay = $("#profile-overlay");
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    // Give the CSS close transition a moment to run before wiping content —
    // falls back instantly if the browser has reduced motion / no transition.
    window.setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.innerHTML = "";
    }, 260);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
