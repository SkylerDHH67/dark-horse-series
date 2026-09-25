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
  const LS_AUDIENCE = "dhs_audience";

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
    const saved = localStorage.getItem(LS_AUDIENCE);
    const options = F.getAudienceOptions(DATA.audiences);
    if (saved && options.some((a) => a.key === saved)) {
      STATE.audience = saved;
      showDirectory();
      return;
    }
    showAudienceScreen();
  }

  function showAudienceScreen() {
    $("#app").classList.add("hidden");
    $("#audience-screen").classList.remove("hidden");
    const options = F.getAudienceOptions(DATA.audiences);
    R.renderAudiencePicker($("#audience-list"), options, (a) => {
      STATE.audience = a.key;
      localStorage.setItem(LS_AUDIENCE, a.key);
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

    const stageFiltered = STATE.stage === "All" ? audienceScoped : audienceScoped.filter((p) => p.player_stage === STATE.stage);
    const filtered = F.applyFilters(stageFiltered, STATE);
    const sorted = F.sortPlayers(filtered);

    $("#result-meta").textContent = sorted.length + (sorted.length === 1 ? " player" : " players");
    R.renderGrid($("#grid"), sorted, DATA.traitLabels, openProfile);
  }

  function openProfile(player) {
    R.renderProfile($("#profile-overlay"), player, DATA.traitLabels, closeProfile);
  }

  function closeProfile() {
    $("#profile-overlay").classList.add("hidden");
    $("#profile-overlay").innerHTML = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
