/* =========================================================
   THE TEAM — DARK HORSE SERIES
   render.js — turns data + state into DOM. No fetching here,
   no filtering logic here (see data.js / filters.js).
   ========================================================= */

(function () {
  "use strict";
  const U = window.APP_UTILS;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function initials(name) {
    if (U.isBlank(name)) return "?";
    return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function cardYear(p) {
    if (p._age !== null && p._age !== undefined) return p._age + " yo";
    if (!U.isBlank(p.birth_year)) return "'" + String(p.birth_year).slice(-2);
    return "";
  }

  function traitChip(key, traitLabels) {
    const label = traitLabels[key] || key.replace(/_/g, " ");
    return '<span class="trait-chip"><span class="trait-mono">' + U.esc(U.monogram(key)) + '</span>' + U.esc(label) + "</span>";
  }

  // ---------------------------------------------------------
  // Audience picker ("Who are you?")
  // ---------------------------------------------------------
  function renderAudiencePicker(container, audienceOptions, onSelect) {
    container.innerHTML = "";
    audienceOptions.forEach((a) => {
      const opt = el("div", "audience-option");
      opt.innerHTML =
        '<div class="audience-option-label">' + U.esc(a.label) + "</div>" +
        '<div class="audience-option-arrow">→</div>';
      opt.addEventListener("click", () => onSelect(a));
      container.appendChild(opt);
    });
  }

  // ---------------------------------------------------------
  // Stage tabs (Professional / College / Youth / All)
  // ---------------------------------------------------------
  function renderStageTabs(container, players, currentStage, onSelect) {
    container.innerHTML = "";
    const stages = [];
    players.forEach((p) => {
      const s = (p.player_stage || "").trim();
      if (s && stages.indexOf(s) === -1) stages.push(s);
    });
    stages.sort();
    const all = ["All"].concat(stages);

    all.forEach((s) => {
      const count = s === "All" ? players.length : players.filter((p) => p.player_stage === s).length;
      const btn = el("button", "tab" + (s === currentStage ? " active" : ""));
      btn.innerHTML = U.esc(s) + ' <span class="tab-count">' + count + "</span>";
      btn.addEventListener("click", () => onSelect(s));
      container.appendChild(btn);
    });
  }

  // ---------------------------------------------------------
  // Filters panel (Position — generated from data)
  // ---------------------------------------------------------
  function renderFilters(container, players, state, onChange) {
    container.innerHTML = "";
    const F = window.APP_FILTERS;

    const posSel = el("select");
    posSel.innerHTML = '<option value="">All positions</option>' +
      F.uniqueValues(players, "position").map((v) => '<option value="' + U.esc(v) + '">' + U.esc(v) + "</option>").join("");
    posSel.value = state.position;
    posSel.addEventListener("change", () => onChange({ position: posSel.value }));

    container.appendChild(posSel);
  }

  // ---------------------------------------------------------
  // Card grid
  // ---------------------------------------------------------
  function renderCard(p, traitLabels, onClick) {
    const card = el("div", "card");
    const teamLine = [p.current_team, p.current_league].filter((v) => !U.isBlank(v)).join(" · ");
    const metaParts = [p.height, cardYear(p)].filter((v) => !U.isBlank(v));
    const posAbbrev = U.abbreviatePosition(p.position);
    const traits = p._keyTraits.slice(0, 4);

    const photoHTML = !U.isBlank(p.photo_url)
      ? '<img src="' + U.esc(p.photo_url) + '" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=&quot;card-photo-fallback&quot;>' + U.esc(initials(p.display_name)) + '</div>\'">'
      : '<div class="card-photo-fallback">' + U.esc(initials(p.display_name)) + "</div>";

    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-photo">' + photoHTML + "</div>" +
        (posAbbrev ? '<div class="card-badge">' + U.esc(posAbbrev) + "</div>" : "") +
        (!U.isBlank(p.dark_horse_category) ? '<div class="card-ribbon"><span>' + U.esc(p.dark_horse_category) + "</span></div>" : "") +
        '<div class="card-nameplate">' +
          '<div class="card-name">' + U.esc(p.display_name) + "</div>" +
          (metaParts.length ? '<div class="card-meta">' + U.esc(metaParts.join(" · ")) + "</div>" : "") +
          (teamLine ? '<div class="card-team">' + U.esc(teamLine) + "</div>" : "") +
          (traits.length ? '<div class="card-traits">' + traits.map((t) => traitChip(t, traitLabels)).join("") + "</div>" : "") +
        "</div>" +
      "</div>";

    card.addEventListener("click", () => onClick(p));
    return card;
  }

  function renderGrid(container, players, traitLabels, onCardClick) {
    container.innerHTML = "";
    if (!players.length) {
      const empty = el("div", "empty-state");
      empty.innerHTML = '<div class="empty-state-title">No players match</div><div>Try a different filter or audience.</div>';
      container.appendChild(empty);
      return;
    }
    players.forEach((p) => container.appendChild(renderCard(p, traitLabels, onCardClick)));
  }

  // ---------------------------------------------------------
  // Profile
  // ---------------------------------------------------------
  function kvGrid(items) {
    if (!items.length) return "";
    return '<div class="kv-grid">' + items.map((i) =>
      '<div class="kv"><div class="kv-label">' + U.esc(i[0]) + '</div><div class="kv-value">' + U.esc(i[1]) + "</div></div>"
    ).join("") + "</div>";
  }

  function sectionWrap(title, inner) {
    return '<div class="section"><div class="section-title">' + U.esc(title) + "</div>" + inner + "</div>";
  }

  function tagList(vals) {
    return '<div class="tag-list">' + vals.map((v) => '<div class="tag-item">' + U.esc(v) + "</div>").join("") + "</div>";
  }

  function overviewSection(p) {
    const items = [];
    if (p._age !== null && p._age !== undefined) items.push(["Age", p._age]);
    else if (!U.isBlank(p.birth_year)) items.push(["Birth Year", p.birth_year]);
    if (!U.isBlank(p.height)) items.push(["Height", p.height]);
    if (!U.isBlank(p.wingspan)) items.push(["Wingspan", p.wingspan]);
    if (!U.isBlank(p.weight)) items.push(["Weight", p.weight]);
    if (!U.isBlank(p.position)) items.push(["Position", p.position]);
    if (!U.isBlank(p.secondary_position)) items.push(["Secondary", p.secondary_position]);
    if (!U.isBlank(p.nationality)) items.push(["Nationality", p.nationality]);
    if (!U.isBlank(p.current_team)) items.push(["Current Team", p.current_team]);
    if (!U.isBlank(p.current_league)) items.push(["League", p.current_league]);
    if (!U.isBlank(p.contract_status)) items.push(["Status", p.contract_status]);
    return items.length ? sectionWrap("Overview", kvGrid(items)) : "";
  }

  function traitsSection(p, traitLabels) {
    if (!p._keyTraits.length) return "";
    return sectionWrap("Key Traits", '<div class="card-traits profile-traits">' + p._keyTraits.map((t) => traitChip(t, traitLabels)).join("") + "</div>");
  }

  function scoutingReportSection(p) {
    const strengths = [p.strength_1, p.strength_2, p.strength_3, p.strength_4].filter((v) => !U.isBlank(v));
    const dev = [p.development_area_1, p.development_area_2].filter((v) => !U.isBlank(v));
    let html = "";
    if (strengths.length) html += '<div class="report-block"><div class="report-label">Strengths</div>' + tagList(strengths) + "</div>";
    if (dev.length) html += '<div class="report-block"><div class="report-label">Development Areas</div>' + tagList(dev) + "</div>";
    if (!U.isBlank(p.role_projection)) html += '<div class="report-block"><div class="report-label">Role Projection</div><div class="section-text">' + U.esc(p.role_projection) + "</div></div>";
    if (!U.isBlank(p.best_usage)) html += '<div class="report-block"><div class="report-label">Best Usage</div><div class="section-text">' + U.esc(p.best_usage) + "</div></div>";
    return html ? sectionWrap("Scouting Report", html) : "";
  }

  function comparisonsSection(p) {
    const comps = [p.comparison_1, p.comparison_2].filter((v) => !U.isBlank(v));
    if (!comps.length) return "";
    return sectionWrap("Player Comparisons",
      tagList(comps) + '<div class="disclaimer">Stylistic / role comparisons only — not a prediction that this player will reach the comparison player’s level.</div>'
    );
  }

  function filmSection(p) {
    const btns = [];
    if (!U.isBlank(p.highlight_url)) btns.push('<a class="film-btn" href="' + U.esc(p.highlight_url) + '" target="_blank" rel="noopener">▶ Highlights</a>');
    if (!U.isBlank(p.full_game_url)) btns.push('<a class="film-btn" href="' + U.esc(p.full_game_url) + '" target="_blank" rel="noopener">▶ Full Game</a>');
    if (!U.isBlank(p.stats_url)) btns.push('<a class="film-btn film-btn-secondary" href="' + U.esc(p.stats_url) + '" target="_blank" rel="noopener">Stats</a>');
    return btns.length ? sectionWrap("Film", '<div class="film-row">' + btns.join("") + "</div>") : "";
  }

  function careerSection(p) {
    let html = "";
    if (!U.isBlank(p.stats_summary)) html += '<div class="report-block"><div class="section-text">' + U.esc(p.stats_summary) + "</div></div>";
    if (!U.isBlank(p.accolades)) html += '<div class="report-block"><div class="report-label">Accolades</div><div class="section-text">' + U.esc(p.accolades) + "</div></div>";
    return html ? sectionWrap("Career & Performance", html) : "";
  }

  function marketFitSection(p) {
    return U.isBlank(p.market_fit_note) ? "" : sectionWrap("Market Fit", '<div class="section-text">' + U.esc(p.market_fit_note) + "</div>");
  }

  function contactSection(p) {
    const cfg = window.APP_CONFIG;
    const line = !U.isBlank(p.availability)
      ? U.esc(p.availability)
      : (!U.isBlank(cfg.CONTACT_EMAIL) ? "Contact <b>" + U.esc(cfg.CONTACT_EMAIL) + "</b>" : U.esc(cfg.CONTACT_FALLBACK_TEXT));
    return sectionWrap("Availability / Contact", '<div class="contact-box">' + line + "</div>");
  }

  function renderProfile(container, p, traitLabels, onBack) {
    const badgeParts = [p.height, p.position, cardYear(p), p.nationality].filter((v) => !U.isBlank(v));
    const teamLine = [p.current_team, p.current_league].filter((v) => !U.isBlank(v)).join(" · ");

    const photoHTML = !U.isBlank(p.photo_url)
      ? '<img class="profile-photo" src="' + U.esc(p.photo_url) + '" alt="" onerror="this.outerHTML=\'<div class=&quot;profile-photo-fallback&quot;>' + U.esc(initials(p.display_name)) + '</div>\'">'
      : '<div class="profile-photo-fallback">' + U.esc(initials(p.display_name)) + "</div>";

    container.innerHTML =
      '<div class="profile-close-bar"><div class="profile-back" id="profile-back-btn">← Back to players</div></div>' +
      '<div class="profile-wrap">' +
        '<div class="profile-hero">' +
          photoHTML +
          "<div>" +
            (!U.isBlank(p.player_stage) ? '<div class="profile-stage">' + U.esc(p.player_stage) + "</div>" : "") +
            '<div class="profile-name">' + U.esc(p.display_name) + "</div>" +
            (badgeParts.length ? '<div class="profile-badges">' + badgeParts.map((b) => "<span>" + U.esc(b) + "</span>").join("") + "</div>" : "") +
            (teamLine ? '<div class="profile-team">' + U.esc(teamLine) + "</div>" : "") +
          "</div>" +
        "</div>" +
        (!U.isBlank(p.scouting_snapshot) ? '<div class="profile-quote">' + U.esc(p.scouting_snapshot) + "</div>" : "") +
        (!U.isBlank(p.scouting_summary) ? '<div class="section-text profile-summary">' + U.esc(p.scouting_summary) + "</div>" : "") +
        overviewSection(p) +
        traitsSection(p, traitLabels) +
        scoutingReportSection(p) +
        comparisonsSection(p) +
        filmSection(p) +
        careerSection(p) +
        marketFitSection(p) +
        contactSection(p) +
      "</div>";

    container.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    $("#profile-back-btn", container).addEventListener("click", onBack);
  }

  window.APP_RENDER = {
    renderAudiencePicker, renderStageTabs, renderFilters, renderGrid, renderProfile,
  };
})();
