/*
 * site-cms.js — Webflow-style content editor for the client.
 *
 *  ┌────────────────────────────────────────────────────────────────────────┐
 *  │  HOW IT WORKS                                                          │
 *  ├────────────────────────────────────────────────────────────────────────┤
 *  │  1. The page loads with its baked-in HTML (text, images, videos).      │
 *  │     This means the site is fully readable even if Google is down.      │
 *  │  2. This script then fetches two Google Sheet tabs published as CSV    │
 *  │     and swaps any text / image / video URL the client has overridden.  │
 *  │  3. If a cell is blank, the baked-in value stays. If the sheet is      │
 *  │     unreachable, everything keeps its baked-in value — nothing breaks. │
 *  │                                                                        │
 *  │  GOOGLE SHEET LAYOUT (two tabs, each with two columns):                │
 *  │    Tab "copy"   →  key | text                                          │
 *  │    Tab "assets" →  key | url                                           │
 *  │                                                                        │
 *  │  HTML ATTRIBUTES THIS SCRIPT CONSUMES:                                 │
 *  │    <p   data-copy-key="home.hero.body">…fallback text…</p>             │
 *  │    <img data-asset-key="home.product.image" src="…fallback…" />        │
 *  │    <source data-asset-key="home.hero.video" src="…fallback…" />        │
 *  │                                                                        │
 *  │  ALLOWED HTML INSIDE COPY CELLS (handy for the client):                │
 *  │    <br>, <strong>, <em>, <span class="accent-electric">…</span>        │
 *  │                                                                        │
 *  │  SETTING UP THE SHEET (one-off):                                       │
 *  │    1. Create a Google Sheet with two tabs named "copy" and "assets".   │
 *  │    2. Paste the columns from cms-copy-template.csv and                 │
 *  │       cms-assets-template.csv into those tabs.                         │
 *  │    3. File → Share → Publish to web. Publish EACH tab as .csv,         │
 *  │       copy the two URLs.                                               │
 *  │    4. Paste them into COPY_CSV_URL and ASSETS_CSV_URL below.           │
 *  └────────────────────────────────────────────────────────────────────────┘
 */

(() => {
  // ── 1. CONFIG ──
  // Paste the published-CSV URL for each tab. Leave a URL blank to use only
  // baked-in HTML for that category (text, assets, or both).
  const COPY_CSV_URL   = '';
  const ASSETS_CSV_URL = '';

  if (!COPY_CSV_URL && !ASSETS_CSV_URL) {
    console.info('[site-cms] No sheet URLs configured — site uses baked-in HTML only.');
    return;
  }

  // ── 2. CSV PARSER ── (handles quoted fields containing commas/newlines)
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else {
        if (c === '"') quoted = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
          if (field.length || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
          if (c === '\r' && text[i + 1] === '\n') i++;
        } else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function csvToMap(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return {};
    const out = {};
    for (let i = 1; i < rows.length; i++) {
      const key = (rows[i][0] || '').trim();
      const val = (rows[i][1] || '').trim();
      if (key && val) out[key] = val;
    }
    return out;
  }

  // ── 3. APPLIERS ──
  function applyCopy(map) {
    const els = document.querySelectorAll('[data-copy-key]');
    let n = 0;
    els.forEach(el => {
      const key = el.dataset.copyKey;
      if (key in map) { el.innerHTML = map[key]; n++; }
    });
    console.log(`[site-cms] Applied ${n} text override(s) of ${els.length} slot(s).`);
  }

  function applyAssets(map) {
    const els = document.querySelectorAll('[data-asset-key]');
    const videosToReload = new Set();
    let n = 0;
    els.forEach(el => {
      const key = el.dataset.assetKey;
      if (!(key in map)) return;
      const url = map[key];
      const tag = el.tagName.toLowerCase();
      if (tag === 'img' || tag === 'source') {
        el.src = url;
      } else if (tag === 'video') {
        el.poster = url;
      } else {
        el.setAttribute('src', url);
      }
      if (tag === 'source') {
        const v = el.closest('video');
        if (v) videosToReload.add(v);
      }
      n++;
    });
    videosToReload.forEach(v => { try { v.load(); } catch (e) {} });
    console.log(`[site-cms] Applied ${n} asset override(s) of ${els.length} slot(s).`);
  }

  // ── 4. LOAD ──
  async function fetchAndApply(url, applier, label) {
    if (!url) return;
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      applier(csvToMap(await r.text()));
    } catch (err) {
      console.warn(`[site-cms] ${label} sheet failed — keeping baked-in HTML:`, err.message);
    }
  }

  function init() {
    fetchAndApply(COPY_CSV_URL,   applyCopy,   'Copy');
    fetchAndApply(ASSETS_CSV_URL, applyAssets, 'Assets');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
