# THE TEAM — Dark Horse Series

A basketball client marketing portfolio. **Google Sheets is the database. This repository is only the presentation layer.** You should almost never need to touch this repository once it's set up — day-to-day, you only ever edit the Google Sheet.

## The workflow, in one sentence

**Edit a row in the "Players" Google Sheet → save → the live site updates automatically.** No code, no GitHub, no redeploy. The site re-reads both sheets fresh every time someone loads the page.

---

## 1. The two Google Sheets

- **Players** — one row per player. This is where you spend 95% of your time.
- **Config** — a short list of "audiences" (who can see what) and "traits" (the small labeled chips on cards/profiles). You'll touch this rarely — only when adding a brand-new audience type or trait.

Both must stay shared as **"Anyone with the link → Viewer"** (Share button, top right of each sheet) — that's how the site reads them without needing logins or API keys. If you ever see a "Can't load player data" error on the site, this is the first thing to check.

## 2. Adding a player

Add a new row to the **Players** sheet. That's it — a new card appears on the site automatically, no redeploy needed. Column reference:

| Column | What it does |
|---|---|
| `player_id` | **Required.** Permanent unique ID, e.g. `DH-006`. Never reuse or reassign once given to a player. |
| `slug` | Optional URL-safe id. Leave blank and the site generates one from the name automatically. |
| `display_name` | **Required.** Name shown everywhere. |
| `status` | `active` shows the player; anything else (`inactive`, `retired`) removes them from the site entirely. Blank = treated as active. |
| `position`, `secondary_position` | Free text. Position also powers the Filters dropdown. |
| `height`, `wingspan`, `weight` | Free text, e.g. `6'7`. |
| `dob` | Format `YYYY-MM-DD`. The site computes a live age from this. |
| `birth_year` | Fallback if you'd rather not give an exact DOB. |
| `nationality`, `current_team`, `current_league`, `current_country` | Free text. |
| `player_stage` | `Professional`, `College`, or `Youth` — powers the stage tabs at the top of the directory. Use whatever values you want; new ones automatically become new tabs. |
| `contract_status`, `availability` | Free text, shown on the profile. `availability` also shows in the Availability/Contact section if filled in. |
| `audiences` | **The audience-targeting field.** Comma-separated list of keys from the Config sheet's `audience` rows, e.g. `nba, college`. Only visitors who pick a matching audience will see this player. Leave blank and nobody outside "Internal / The Team" will see them. |
| `featured` | `TRUE` bumps the player to the top of the directory (within their audience/filter view). |
| `dark_horse_category` | Optional small badge shown in the corner of the card, e.g. "Draft Watch". Leave blank for no badge. |
| `display_order` | Optional manual sort number. Lower numbers sort first (after featured players). Leave blank for default alphabetical order. |
| `archetype` | Not currently shown directly on the card (kept for your own reference / possible future use), but feel free to use it as shorthand when scanning the sheet. |
| `scouting_snapshot` | The punchy one-liner shown large at the top of the profile. |
| `scouting_summary` | The longer paragraph underneath it. |
| `key_traits` | Comma-separated keys from the Config sheet's `trait` rows, e.g. `shooting, feel, poa_defense`. Rendered as small chips on both the card and profile. Unknown/new keys still render fine (as a plain-text chip) even before you add them to Config — but add them to Config for a clean label. |
| `strength_1..4`, `development_area_1..2` | Free text bullet points in the Scouting Report section. Leave any blank to show fewer. |
| `role_projection`, `best_usage` | Free text, shown in Scouting Report. |
| `comparison_1`, `comparison_2` | Style/role comparisons, e.g. "Style comp: early-career OG Anunoby". The site always adds a disclaimer automatically ("stylistic comparison, not a prediction") — you never have to type that yourself. |
| `highlight_url`, `full_game_url`, `stats_url` | Any links (YouTube, Hudl, Synergy, a stats page, etc). A button only appears if that column is filled in. |
| `stats_summary` | Free text, e.g. `14.2 PPG / 4.1 REB / 3.3 AST`. |
| `accolades` | Free text, e.g. awards, national team caps. |
| `market_fit_note` | Free text paragraph — realistic level/league fit. |
| `photo_url` | Must be a **publicly viewable direct image link**. If blank, the card/profile shows initials instead — this fails gracefully, it won't break anything. |
| `last_updated` | For your own tracking. Not shown on the site. |
| `notes_internal` | **The site's code never reads this column.** Safe for private notes — just never put anything genuinely sensitive (medical info, contracts, IDs) in this sheet at all, since the sheet itself is link-viewable by design. |

## 3. Changing a photo

Edit the `photo_url` cell for that player. The image must be hosted somewhere publicly accessible (a direct image link — right-click an image online and "copy image address" is usually a good link; Google Drive images need to be shared "Anyone with the link" and use a direct-image URL format, not the regular Drive viewer link).

## 4. Changing who sees a player (audience visibility)

Edit the `audiences` cell for that player — comma-separated keys matching the Config sheet's `audience` rows (currently: `nba`, `europe_elite`, `europe`, `college`, `agent`). A visitor only sees a player if they picked a matching audience on the "Who are you?" screen. "Internal / The Team" always sees everyone (as long as `status` is `active`), regardless of the `audiences` column.

To add a brand-new audience (e.g. a 6th category), add a row to the **Config** sheet with `type = audience`, a short lowercase `key` (no spaces — use underscores), and a human-readable `label`. It'll show up as a new option on the "Who are you?" screen automatically.

## 5. Running the site locally (optional — only if you want to preview before it's live)

You don't need this for normal use, since GitHub Pages is always live. But if you ever want to preview changes to the site's *code* (not player data — that never needs a preview) before pushing:

1. Download the repository as a zip from GitHub (Code → Download ZIP) and unzip it, or clone it if you're comfortable with git.
2. Open a terminal in that folder and run `python3 -m http.server 8000` (Mac/Linux) or just open `index.html` directly in a browser — either works since there's no build step.
3. Visit `http://localhost:8000` in your browser.

## 6. Pushing changes to GitHub / deploying

You will almost never do this — only if the *site's code itself* needs to change (a new filter, a design tweak), not for player updates. If that day comes: edit the file directly in GitHub's web interface (open the file, click the pencil icon, edit, commit), or push via git if you're comfortable with it. GitHub Pages redeploys automatically within about a minute of any commit to the `main` branch — no separate deploy step.

## 7. Troubleshooting

- **"Can't load player data" error** → One of the two Google Sheets isn't shared as "Anyone with the link → Viewer" anymore. Re-check the Share settings on both.
- **A player isn't showing up** → Check `status` is `active` (or blank), and that `audiences` includes the audience you're testing with (or test as "Internal / The Team," which always sees everyone).
- **Photo not showing** → The image URL isn't a working public direct-image link. The card falls back to initials automatically, so this never breaks the layout — it's a data fix, not a code fix.
- **A new audience or trait tag isn't showing a proper label** → Add it to the Config sheet with a matching `key`. Until then it still displays fine using the raw key as a fallback label.
- **Change doesn't show up on the live site** → The site re-fetches both sheets on every page load with no caching, so this is almost always a browser cache issue — try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R).

## 8. Repository structure (for reference — you shouldn't need to touch most of this)

```
index.html          the page shell
css/styles.css       all visual design
js/utils.js          pure helper functions (CSV parsing, formatting)
js/config.js         Sheet URLs + site-level settings — the one file worth knowing about
js/data.js           fetches + normalizes both Google Sheets
js/filters.js        audience filtering, search, sorting
js/render.js         turns data into on-screen cards/profiles
js/app.js            wires everything together on page load
```

Sample/demo players (`DH-001` through `DH-005`, all labeled "(DEMO)") are placeholders to prove the mechanics work — delete their rows once you've added real clients.
