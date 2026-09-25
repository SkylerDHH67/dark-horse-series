/* =========================================================
   THE TEAM — DARK HORSE SERIES
   filters.js — audience filtering, search, and the compact
   filter bar logic. No DOM here either.
   ========================================================= */

(function () {
  "use strict";
  const U = window.APP_UTILS;
  const INTERNAL_AUDIENCE_KEY = "internal";

  // "Internal / The Team" bypasses audience tagging entirely —
  // it's a visitor identity, not a value stored on any player row.
  function getAudienceOptions(audiencesFromConfig) {
    return audiencesFromConfig.concat([{ key: INTERNAL_AUDIENCE_KEY, label: "Internal / The Team" }]);
  }

  function matchesAudience(player, audienceKey) {
    if (!audienceKey || audienceKey === INTERNAL_AUDIENCE_KEY) return true;
    return player._audiences.indexOf(audienceKey) !== -1;
  }

  function matchesSearch(player, query) {
    if (!query) return true;
    const hay = [
      player.display_name, player.current_team, player.current_league,
      player.nationality, player.position, player.archetype,
    ].join(" ").toLowerCase();
    return hay.indexOf(query.toLowerCase()) !== -1;
  }

  function uniqueValues(players, field) {
    const set = [];
    players.forEach((p) => {
      const v = (p[field] || "").trim();
      if (v && set.indexOf(v) === -1) set.push(v);
    });
    set.sort();
    return set;
  }

  function applyFilters(players, state) {
    return players.filter((p) => {
      if (!matchesAudience(p, state.audience)) return false;
      if (state.position && p.position !== state.position) return false;
      if (state.stage && p.player_stage !== state.stage) return false;
      if (!matchesSearch(p, state.query)) return false;
      return true;
    });
  }

  function sortPlayers(players) {
    return players.slice().sort((a, b) => {
      if (a._featured !== b._featured) return a._featured ? -1 : 1;
      if (a._displayOrder !== b._displayOrder) return a._displayOrder - b._displayOrder;
      return String(a.display_name || "").localeCompare(String(b.display_name || ""));
    });
  }

  window.APP_FILTERS = {
    INTERNAL_AUDIENCE_KEY, getAudienceOptions, matchesAudience, matchesSearch,
    uniqueValues, applyFilters, sortPlayers,
  };
})();
