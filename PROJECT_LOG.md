# Dutch Oil Dropshot — Project Log

A reference for anyone (or any AI) picking the project up: what's here, why each decision was made, and the gotchas that cost time to figure out. Last updated 2026-06-16.

- **Live site:** <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/>
- **Repo:** <https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot>
- **Companion docs:** [`WORKFLOW.md`](WORKFLOW.md) for git/deploy mechanics · [`assets/README.md`](assets/README.md) for image slots.

---

## 1. What this is

A static brand site for **Dutch Oil Dropshot** — a Groningen-based herbal shot drink (23 % ABV, honey × salt, "Built for the night"). Five marketing pages plus an age verification gate. The aesthetic is **industrial / dark / electric-blue** — black backgrounds, asphalt-grey alternating sections, electric-blue accent, hazard-tape strips between sections, oversized Oswald display type, JetBrains Mono labels.

### Tech stack (deliberately minimal)

- **Plain HTML, CSS, JS.** No framework, no build step, no package.json. Every file in the repo is exactly what gets served.
- **GitHub Pages** for hosting (free tier, deploys on push to `main`).
- **Leaflet 1.9.4 + CARTO dark-tile basemap** for the stockists map (loaded from unpkg, no install needed locally).
- **Google Sheets as the stockists CMS** — published to web as CSV, fetched at page load. No backend.
- **Google Fonts**: Oswald, Archivo, JetBrains Mono.

This minimal stack is deliberate: the client should be able to update content (stockists list, images) without anyone running a build or redeploying. Everything that *does* require a code change goes through `git push` → GitHub Pages auto-deploys.

---

## 2. File layout

```
dutch-oil-dropshot/
├── index.html              Homepage — penguin/iceberg hero, product teaser, field report, 3 cards
├── product.html            Product page — honey-spill hero, two split sections, in-the-wild tiles
├── story.html              Story page — Groningen aerial hero, The Booze Company section, in-the-wild
├── stockists.html          Selling Points — oil-spill hero, Leaflet map + grouped list
├── contact.html            Contact page — penguin iceberg hero, contact card with email CTA
├── age-gate.html           Full-screen "are you 18+?" splash. Sets localStorage on YES.
│
├── styles.css              All visual rules. ~900 lines. Single stylesheet, no preprocessor.
├── nav.js                  Loaded on every page. Wires hamburger, menu-roll, button-arrow injection.
├── stockists-map.js        Loaded on stockists.html only. Fetches Sheet → renders Leaflet map + list.
├── site-cms.js             Loaded on every page. Fetches the copy + assets Google Sheet tabs and
│                           swaps any text/image/video the client has overridden. See §15.
│
├── stockists.csv             Template/seed for the stockists Google Sheet.
├── stockists kopie.csv       User's manual backup; safe to delete.
├── cms-copy-template.csv     Starter rows for the site-CMS "copy" tab (63 editable text slots).
├── cms-assets-template.csv   Starter rows for the site-CMS "assets" tab (21 editable media slots).
│
├── WORKFLOW.md             Git/deploy how-to for non-developers.
├── CMS.md                  Editor's guide for the non-technical client (text + media editing).
├── PROJECT_LOG.md          This file.
├── .gitignore              macOS/.DS_Store, editor junk, .claude/.
│
└── assets/                 Images + videos + slot inventory.
    ├── README.md           Slot-by-slot map: which file shows up on which page section.
    ├── penguin-iceberg.png (home + contact + age-gate poster)
    ├── Penguin_grabs_bottle_on_iceberg.mp4   (home hero loop — capital P! see Gotchas)
    ├── honey-spill.jpeg + .mp4                (product hero + age-gate video)
    ├── oil-spill.mp4                          (stockists hero)
    ├── groningen.png                          (story hero)
    ├── bottle-bar.png, bottle-blue-bar.png, bottle-wood-bar.png   (split-section images, cards)
    ├── man-bottle.png                         (homepage "The Story" card)
    ├── bottle-mini-iceberg.png, shots-tray-club.png, drum.jpeg   (In The Wild tiles)
    ├── stoker.jpeg                            (LEGACY — not referenced by current HTML)
    └── hero.png                               (LEGACY — not referenced, can delete)
```

---

## 3. Design system

### 3.1 Colour tokens

All colours are CSS custom properties in `:root` at the top of `styles.css`:

| Token | Hex | Role |
|---|---|---|
| `--black` | `#0a0a0a` | Primary background |
| `--asphalt` | `#1d1d1f` | Secondary background (alternating sections) |
| `--asphalt-2` | `#2a2a2c` | Form fields, sub-surfaces (rarely used) |
| `--steel` | `#3a3a3d` | Dividers, borders |
| `--concrete` | `#6b6b70` | Muted text, secondary captions |
| `--bone` | `#d6d3cc` | Originally the warm off-white; now mostly replaced by `--white` |
| `--white` | `#ffffff` | Primary text on dark |
| `--electric` | `#1fa9ff` | **Brand accent.** Replaces the original `--orange` from Figma. |
| `--orange` | `#ff5a1f` | Legacy from the earlier "Devil Shot"-style design — kept in the token list but rarely used. |

The design was **originally orange** in Figma. The client redesigned in Figma to use an electric-blue accent and we re-synced. There are no orange-painted elements remaining on the live site — orange survives only as a token nobody references.

### 3.2 Typography

Three families from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Archivo:wght@400;600;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

- **Oswald** (`.display`, `.stencil`) — every uppercase headline, button label, section title. 700 for headlines, 600 for sub-titles and menu items.
- **Archivo** (`.body`, default `<p>`) — all paragraph copy. 400 regular, 700 bold (for emphasis like "Dutch Oil: The Best Tasting Dropshot."), 800 ExtraBold for `.split-tagline`.
- **JetBrains Mono** — labels, eyebrows, breadcrumbs, captions, addresses, the `02 //` section numbers. Always uppercase, letter-spacing 0.18em–0.30em.

### 3.3 Spacing

- Section vertical padding: 60 px desktop, 28 px mobile.
- Section header (`.sec-header`) padding: `16px 32px`.
- Card/split padding: 60 px desktop.
- Card gaps inside grids: 0 px — sections share borders, not whitespace. This is intentional and contributes to the brutalist feel.
- Border radii: **0 everywhere.** No rounded corners on the entire site. This is a brand rule.

### 3.4 Hazard tape

Recurring 18-px strip between sections. Built with one orange rectangle as a base and ~80 rotated black rectangles (16 × diag, 45°) layered on top to make the diagonal stripes. The stripes are **blue + black** in the current design (re-coloured from the original orange + black). All four hazard-tape strips per page share the same DOM structure.

---

## 4. Pages — what each one shows

### `index.html` (Home)
1. Sticky nav (logo, menu, lang chips)
2. Hero — `Penguin_grabs_bottle_on_iceberg.mp4` background, "The Shot That **Starts** The Night" headline, `WAAR VERKRIJGBAAR` solid CTA, scroll hint
3. Hazard tape
4. `02 // THE PRODUCT` — image left, copy right ("HONEY × SALT."), 4-spec grid (23% / 70 cl / Cold / Freezer), ghost CTA `MEER OVER DUTCH OIL DROPSHOT`
5. Field Report — blue background, centered quote `"Niet zomaar een shotje. Een statement."`
6. Three modular cards: The Product · The Story · Selling Points (each with image + READ →)
7. Marquee `DARE · DRINK · DROP · REPEAT` (animated CSS loop, blue bg)
8. Hazard tape
9. Footer

### `product.html` (The Product)
1. Nav
2. Hero — `honey-spill.mp4` background, eyebrow → blue "Thick. Smooth. Unforgettable." prefix → giant white "Honey×Salt." (note: no space between Honey and ×) → body
3. Hazard tape
4. `02 // THE PRODUCT` split — image left (`bottle-blue-bar.png`), copy right ("More Than A Dropshot"), eyebrow `HISTORY`, two paragraphs
5. `CRAFTED FOR THE NIGHT` split — copy left (heading all blue), bullet list (Niet meer dat..., etc.), bold blue tagline "Dutch Oil: The Best Tasting Dropshot.", image right (`bottle-wood-bar.png`)
6. Marquee
7. `04 // IN THE WILD` — 4-tile photo grid
8. Hazard tape
9. Footer

### `story.html` (The Story)
1. Nav
2. Hero — `groningen.png` aerial nighttime city, "From Groningen To Every Bar." (first line blue)
3. Hazard tape
4. `02 // THE STORY` split — image left (`bottle-blue-bar.png`), copy right with eyebrow `HISTORY`, headline "The Booze Company.", body, **bold blue intro line "Dutch Oil staat voor:"** above a white-text bullet list of 4 brand values
5. Marquee
6. In The Wild grid (4 tiles)
7. Footer

### `stockists.html` (Selling Points)
1. Nav
2. Hero — `oil-spill.mp4` (scaled 1.2× via inline `transform`, no gradient overlay), all-blue title "Always Close To The Next Round."
3. Hazard tape
4. `04 // SELLING POINTS` — 50/50 split: left half is the **interactive Leaflet map**, right half is the headline "Where To Find Dutch Oil" + three groups (Bars & Cafés / Slijterijen / Groothandel) each as a `<ul data-group="…">` populated by JS
5. Hazard tape · Marquee · Hazard tape
6. Footer

### `contact.html` (Contact)
1. Nav
2. Hero — `penguin-iceberg.png` background, "Let's Talk!" headline
3. Contact card — image left, copy right ("Ready To Bring Dutch Oil To Your Bar?"), **`GET IN TOUCH` ghost button** linking to `mailto:info@theboozecompany.nl`
4. Hazard tape
5. Footer

### `age-gate.html` (Age verification)
- Full-screen splash, background `honey-spill.mp4` with dark radial+linear overlay
- Logo · `⚠ AGE VERIFICATION` eyebrow · "Are you of legal drinking age in your country of residence?" headline
- Two buttons: **YES, I AM** (solid blue → sets `localStorage['dutch-oil-age-ok']='1'` and redirects to original destination) · **NO** (ghost, links to drinkwijzer.info)
- Disclaimer text + drinkwijzer / drinkaware links
- Hazard tape pinned to bottom

---

## 5. Component patterns

### 5.1 Buttons (`.btn`, `.btn-ghost`, `.btn-dark`)

Match the Figma `Btn-solid` / `Btn-ghost` component sets exactly.

```
DEFAULT                 HOVER (Figma-spec)
─────────────           ──────────────────
.btn       solid blue,  hover: bg flips to white, text to blue,
           white text,  border to white, gap 4→12 (button grows +8px wider)
           gap 4px
.btn-ghost transparent, hover: bg fills blue, text flips to white,
           blue border, gap 4→12
           blue text
.btn-dark  black bg,    mirrors solid hover
           blue text
```

**Critical implementation detail:** the trailing `→` arrow is **not** baked into the button text. It's a `<span class="btn-arrow">` auto-injected by `nav.js` so that flex `gap` actually has two real items between which to expand. Without this, the +8 px hover-grow doesn't animate. The button text in HTML should *not* end with " →" — the script adds it.

### 5.2 Menu items (text-roll on hover)

Each `.menu-item` is wrapped on load (by `nav.js`) into two stacked `.menu-text` spans — one white, one electric-blue:

```html
<a class="menu-item">
  <span class="menu-text">Home</span>             ← visible by default
  <span class="menu-text menu-text-blue">Home</span>   ← hidden below
</a>
```

The `.menu-item` has `overflow: hidden` and a fixed `height: 1.5em` (line-height). On hover, the inner translates `-1.5em` so the white slides out the top and the blue slides up into view. 260 ms `cubic-bezier(0.4, 0, 0.2, 1)` — fast enough to feel snappy, slow enough to read the cross-over. **No underline.** (We tried the Figma-spec 4-px nub underline earlier; the client asked for this roll effect instead.)

On the mobile drawer (≤ 900 px), the overflow + transform are disabled and the blue duplicate is `display:none` — items just colour-shift on focus, with the row borders carrying the visual rhythm.

### 5.3 Hamburger toggle

Appears below 900 px. Three CSS-drawn `<span>` bars (3 px tall, 5 px gap, centered vertically in a 44 × 44 tap target). When `aria-expanded="true"`, top bar translates `+8px` & rotates 45°, middle fades to 0, bottom translates `-8px` & rotates -45° → forms an X. Toggling is keyboard-accessible and closes on outside click, `Esc`, link click, or viewport resize past 901 px.

### 5.4 Hero sections

Two flavours:

1. **Image hero** — `<img class="hero-bg">` for static backgrounds (e.g. story, contact).
2. **Video hero** — `<video class="hero-bg" autoplay loop muted playsinline poster="…">` with an `<source src=…mp4>` child. The image at `poster=` shows during buffering and is also a fallback for browsers that block autoplay.

Heroes have `min-height: 720px` (or 610 px for shorter pages). Content sits in `.hero-inner` (left-padded 60 px, content stacks bottom-up via `justify-content: flex-end`). The hero has no max-width — content always aligns flush left with the logo at the same `60 px` padding, even on ultrawide screens (this was a fix; the original `max-width: 1440px; margin: 0 auto;` caused the hero text to drift right of the logo on > 1440 px viewports).

### 5.5 Split sections

`.split-grid` is `grid-template-columns: 1fr 1fr` — a balanced 50/50. Two child divs: `.split-img` (clipped to `overflow: hidden`) and `.split-copy`. Image fills its half via `object-fit: cover`. `.split-grid.image-left` / `.image-right` are kept as semantic markers in HTML but no longer change the ratio (we tried 1.4fr/1fr earlier; the client asked for 1:1).

### 5.6 Hazard tape

`.hazard-tape` — 18 px tall, full-width. Built once as a frame:
- Bottom layer: full-bleed `--electric` rectangle.
- Top layer: ~80 rotated `--black` rectangles (16 px wide, rotated 45°) creating diagonal stripes.

This is identical structurally to the Figma `HazardTape` component. The decorative rectangles inflate the DOM (≈ 80 elements per tape × 4 tapes per page) but compress well over HTTP.

### 5.7 Field Report

Centered blue strip with eyebrow "⚠ FIELD REPORT", a giant Oswald quote, and a mono credit line. The hue is electric blue not orange in the current design — both the hazard-tape stripes and the Field Report bg switched from `--orange` to `--electric` when the brand pivoted.

### 5.8 Marquee

Single horizontal scroll loop `DARE · DRINK · DROP · REPEAT ·` with `animation: marquee 32s linear infinite` translating `-50%`. The track contains the string 4× over, set to `white-space: nowrap`, parent has `overflow: hidden`. Blue background, black bold text.

---

## 6. The age gate

### Flow

1. Visitor lands on any page → an **inline synchronous `<script>`** at the very top of `<head>` checks `localStorage['dutch-oil-age-ok']`.
2. If missing: stores the requested page in `sessionStorage['dutch-oil-age-return']` and `location.replace('age-gate.html')` — synchronous redirect, no flash of unverified content.
3. Visitor clicks **YES, I AM** → JS sets `localStorage['dutch-oil-age-ok']='1'` and `location.replace(returnTo)` (or `index.html` if no return marker).
4. Visitor clicks **NO** → external `mailto`-style link to `drinkwijzer.info`.
5. On any return visit (same browser, same origin) the localStorage flag is still set → check passes → gate skipped.

### Implementation notes

- The check **must run synchronously** in `<head>` before any rendering, otherwise visitors see a flash of the page before the redirect. We don't use `defer` for this script.
- The age-gate page itself omits the snippet so visitors can actually reach it.
- `try/catch` blocks around storage access so cookies-disabled browsers don't break (they just always show the gate).
- The "NO" destination is currently `drinkwijzer.info` — change this with your legal team's preferred destination.

---

## 7. The stockists CMS (Google Sheet)

This is the original CMS — covers only the stockists list. The **site-wide CMS** for editable text + images + videos is a separate, later subsystem; see **§15** below.

The map and list on `stockists.html` are populated at page load from a Google Sheet, which the client edits directly.

### How the client uses it

1. They open the Sheet, add a row: `Type | Name | City | Address`.
2. They save. (No publish step — that's done once at setup.)
3. Within ~5 minutes the live site picks up the row (Google's CSV cache window).

### How the code uses it

`stockists-map.js` at page load:

1. `fetch(SHEET_CSV_URL)` — the "Publish to web → CSV" URL (must end with `/pub?output=csv`, **not** `/pubhtml`).
2. `parseCSV()` — handles quoted fields with embedded commas, auto-detects `,` vs `;` delimiter (NL/DE locales export with `;`).
3. **Repair pass** — if the sheet has the entire row stuffed into column A (because it was pasted in unsplit), each row is re-parsed as a CSV line. Means the page still works even if the client never ran "Split text to columns".
4. For each parsed row: look up `city` (lowercased) in `CITY_COORDS` — a static table of ~40 Dutch cities with lat/lon. Unknown cities log a warning and the entry appears in the list but without a pin.
5. Group by type (`Bar`/HQ → `bars`, `Slijterij` → `slijterijen`, `Groothandel` → `groothandel`) and append to `<ul data-group="…">`.
6. Multiple stockists in the same city get a golden-angle spiral jitter (~6 m apart visually) so pins don't stack.
7. HQ entry gets a dashed blue ring around its pin.
8. Each `<li>` has hover + focus + click handlers to highlight + open the corresponding pin's popup. Click also flies the map to zoom 13.
9. If the fetch fails or the URL is the placeholder, the script renders a baked-in `FALLBACK` array of 15 stockists so the page is never empty.

### The Sheet URL

Currently configured in `stockists-map.js` line 32:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vS9-snwhhFfOE0Qww97vnfWAu7pvcUreYyl8ihJc9hI24_NO7XchpGgJ5ho7mVxAfXZ8nXmLLgLK7f-/pub?gid=0&single=true&output=csv
```

If the client moves to a different sheet, update that one line.

### Adding a new city

The client just types a city name in the sheet. If the city isn't in `CITY_COORDS` (lookup table at the top of `stockists-map.js`), the entry shows up in the list but with no map pin and a console warning. Dev adds a one-line entry to the table and ships:

```js
'sneek': [53.0317, 5.6586],
```

The seed table includes the ~40 largest Dutch cities. Maintenance is low.

---

## 8. Cache-busting (`?v=N`)

GitHub Pages and the local Python dev server both let browsers cache CSS/JS/images aggressively. Without a busting convention, edits don't show up until visitors hard-refresh — which they won't do.

Solution: every reference to a local `.css`, `.js`, image, or video in the HTML carries `?v=N` (currently `?v=2`). When a file changes, bump the version site-wide:

```bash
find . -maxdepth 1 -name "*.html" -exec sed -i '' 's/?v=2/?v=3/g' {} +
```

Next page load, browsers see a "new" URL and re-download. No hard-refresh needed.

External resources (Google Fonts, Leaflet, CARTO tiles) are NOT versioned — they have their own caching strategies.

---

## 9. Asset workflow

See [`assets/README.md`](assets/README.md) for the full slot inventory. Summary:

- Each image slot has a fixed filename. To swap an image, drop the new file in `assets/` with the same name.
- Bump the cache-buster (above) so browsers re-fetch.
- Recommended sizes are in the assets README.
- Three hero videos sit between 5–15 MB each — well within GitHub's per-file limits.

### The "baked-in PNG frame" trick

Some source PNGs (notably `bottle-blue-bar.png` and `bottle-wood-bar.png`) have a 1–2 px grey frame baked into the image edges. `.split-img img` has `transform: scale(1.03)` with `overflow: hidden` on the parent, so the visible image is overzoomed 3 % and the frame is cropped off. If you replace one of those PNGs with a frame-free version, the scale doesn't hurt — it just zooms in 3 % which is invisible.

---

## 10. Deployment

- **Mechanism:** GitHub Pages serves the repo from `main` branch, `/` root.
- **Trigger:** `git push` to `main`.
- **Latency:** ~30 seconds from push to live.
- **URL:** <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/>
- **Custom domain:** not configured. To wire one: add a `CNAME` file at repo root with the domain (e.g. `dutchoil.nl`), set DNS at the registrar (A records to GitHub's IPs for apex domain, CNAME to `…github.io` for subdomain), then **Settings → Pages → Custom domain** + Enforce HTTPS.

### Auth on a Mac

After the first successful `git push` (which prompts for a Personal Access Token), macOS's keychain integration silently stores the credential. Subsequent pushes are interactive-free, including ones I run on the user's behalf. If the token expires (30 days by default), the next push prompts again.

---

## 11. Gotchas — things that wasted time, documented so they don't again

1. **GitHub Pages is case-sensitive; macOS is not.** `Penguin_grabs_bottle_on_iceberg.mp4` (capital P) must be referenced exactly. Lower-casing it on disk would still work locally but 404 on Pages.

2. **Browser caching of unversioned CSS/JS.** macOS Python `SimpleHTTP` server sends `Last-Modified` but no `Cache-Control`, so Chrome/Safari aggressively re-use cached copies. `?v=N` is the fix.

3. **Google Sheets `;` delimiter.** Sheets in NL/DE locales export CSV with semicolons, not commas. The parser auto-detects.

4. **Sheet "all in column A" trap.** When semicolon-separated CSV is pasted into Sheets without doing **Data → Split text to columns**, every row stays as one giant string in column A. The parser has a repair pass that re-parses each cell as its own CSV line. **Long-term fix:** the client should run "Split text to columns" once to make their sheet sane.

5. **`/pubhtml` vs `/pub?output=csv`.** The default "Publish to web" URL is the HTML preview, not the CSV export. The format dropdown matters. Wrong URL silently fails — fetch returns HTML, parser reads `<!DOCTYPE…>` as the only "cell".

6. **GitHub fine-grained tokens vs classic.** Fine-grained PATs (`github_pat_…`) require per-repo allow-listing. Classic tokens (`ghp_…`) with `repo` scope work universally. We use classic.

7. **Flex `gap` needs real children, not just text.** The button arrow has to be a separate `<span>` for `gap: 4px → 12px` on hover to actually animate the button width. With the arrow inline as text, `gap` has no siblings to expand between. Auto-injected by `nav.js`.

8. **`getComputedStyle()` during transitions.** Reads the *current animated value*, not the target. When DOM-testing whether hover styles apply, set `transition: none` first or you'll see intermediate values and think the rule isn't being applied.

9. **`max-width: 1440px; margin: 0 auto;` on `.hero-inner`** caused the hero content to drift right of the logo on ultrawide screens (the logo is in a full-width nav with no max-width). Removed.

10. **PNG baked-in frames** — see Asset workflow section.

11. **`figma.currentPage`-related** (in Figma plugin scripts, when re-syncing the design): always use `await figma.setCurrentPageAsync(page)` not the sync setter. Not relevant to runtime site code but tripped us when re-syncing from Figma.

12. **Browser `localStorage` is per-origin.** Visitors who passed the age gate on `localhost:5173` will be re-prompted once when the live URL becomes the first origin they visit. Expected behaviour.

13. **Don't ever paste a PAT into a chat / commit / screenshot.** Tokens are equivalent to passwords for the granted scopes. Always revoke + regenerate if exposed.

14. **macOS hidden `.DS_Store` files.** Excluded via `.gitignore`.

---

## 12. Design decisions / preferences captured from the client

- Brand accent colour switched from **orange** to **electric blue (`#1fa9ff`)** mid-project.
- **No rounded corners anywhere.** Border-radius 0 is a brand rule.
- **No underline on menu items** — text-roll instead.
- **50/50 split layouts** preferred over asymmetric grids.
- The "Crafted For The Night" CTA was a button initially; client wanted it as **bold blue text** instead.
- The "Dutch Oil staat voor:" intro is **bold blue Archivo, sentence case** (not the uppercase mono eyebrow style).
- Bullet lists in split sections use the **body font (Archivo)**, not JetBrains Mono.
- The hero on each page is left-aligned with the logo — no max-width centering.
- Logo hover: **colour swap only** (text → blue, dot → white). No letter-spacing change.
- Hamburger lines are **3 px thick, 5 px apart** (thicker than the initial 2 × 8 spec).
- Address in the footer: `THE BOOZE COMPANY · DUTCH OIL DROPSHOT · HIDDEMAHEERD 168 — 9737JK GRONINGEN · INFO@THEBOOZECOMPANY.NL` (the email line is a `mailto:` link).
- "VERHAAL" → "HISTORY" eyebrow across the site.

---

## 13. Known gaps / future work

These were noted during the build but not done. None of them are bugs — just unfinished work or deferred decisions.

- **Custom domain** — not yet set up. CNAME file + DNS records when ready.
- **Real horeca sample-request form** — the contact CTA is `mailto:` only. No server-side form processing.
- **Internationalisation** — language switcher chips (NL/EN/DE) are visible but not wired. Site is bilingual NL/EN at the copy level.
- **Stockists CMS lifecycle**: token in the Sheet URL will keep working as long as the sheet stays "published to web". If the client unpublishes by accident, the page falls back to the baked-in `FALLBACK` array.
- **Accessibility audit** — never run a formal a11y pass (axe / Lighthouse). Site uses semantic landmarks, `aria-label`s on icon buttons, `:focus-visible` rules on interactive elements. Should hold up but hasn't been verified.
- **Performance** — never measured. Three MP4 heroes (~35 MB combined) load on first visit. Could move them to a CDN + lazy-load posters first.
- **Older browser support** — uses `gap` on flex, `clamp()`, CSS custom properties, `aspect-ratio`. All work in any browser from ~2021 onward. Pre-2021 browsers (IE11 etc.) will degrade ungracefully — not a target.
- **Analytics** — none. If the client wants visitor stats, drop a Plausible / Fathom / Cloudflare Web Analytics snippet into a shared `<head>` partial. (No partials yet — would mean duplicating into all 6 HTML pages, or doing a tiny build step.)

---

## 14. Bootstrapping Claude on a new machine

After `git clone` on a laptop and `claude` in the project directory, send this as the first message:

> Read **`PROJECT_LOG.md`**, **`WORKFLOW.md`**, **`CMS.md`**, and **`assets/README.md`** then summarise the project so I can confirm you have full context. Don't make any changes yet.

I'll surface my reconstructed understanding and you can correct anything that's drifted.

---

## 15. Site CMS — editable text + images + videos

A **separate** CMS from the stockists one (§7). This one covers all marketing copy and media across the 5 pages. Same idea: a Google Sheet published as CSV, fetched at page load, applied non-destructively over the baked-in HTML.

The client's view of it lives in [`CMS.md`](CMS.md). This section is the engineering view.

### Files

| File | Purpose |
|---|---|
| `site-cms.js` | Loader. Included on every HTML page after `nav.js`. ~110 lines. Self-contained IIFE. |
| `cms-copy-template.csv` | 63-row starter for the "copy" sheet tab — every editable text slot on the site with its current value. |
| `cms-assets-template.csv` | 21-row starter for the "assets" sheet tab — every editable image/video slot with its current relative path. |
| `CMS.md` | Non-technical editor guide written for the client. |

### How it works

1. Each HTML element that should be editable has `data-copy-key="…"` (for text) or `data-asset-key="…"` (for images/videos). The opening tag is unchanged otherwise — the **fallback content is the inline HTML/src already there**, so the page is fully usable if the sheet is unreachable.
2. On `DOMContentLoaded`, `site-cms.js` fetches the two CSVs in parallel (no blocking).
3. Each CSV is parsed (same parser pattern as `stockists-map.js`) into a `{ key → value }` map.
4. For each `[data-copy-key]` whose key is in the copy map → `el.innerHTML = map[key]` (innerHTML, not textContent, so the client can include `<br>`, `<strong>`, `<em>`, `<span class="accent-electric">` in the sheet).
5. For each `[data-asset-key]` whose key is in the asset map:
   - `<img>` or `<source>` → swap `src`
   - `<video>` → swap `poster`
   - any `<source>` swap triggers `parent.load()` so the new video file actually plays
6. Empty cells, missing keys, fetch failures → silently keep the baked-in HTML. No flicker for slots that aren't overridden.

### Key naming convention

`{page}.{section}.{slot}` — kebab-segments separated by dots. Examples:

- `home.hero.title`, `home.hero.cta`
- `product.split1.body1`, `product.split2.tagline`
- `story.split.list.item1`
- `stockists.list.group2.title`
- `contact.card.body3`

The full inventory is in the two CSV templates.

### Where the assets live

For NEW images/videos the client wants to swap in, the convention is **Cloudinary** (free tier, 25 GB) — they paste the Cloudinary delivery URL into the `url` column of the assets tab. Existing baked-in assets remain in `assets/` and serve as fallback if Cloudinary is unreachable or the URL is wrong.

### Configuring the sheet URLs

`site-cms.js` lines 35–36:

```js
const COPY_CSV_URL   = '';   // paste "Publish to web → CSV" URL for the copy tab
const ASSETS_CSV_URL = '';   // same for the assets tab
```

Both blank ⇒ script logs `[site-cms] No sheet URLs configured` and exits without fetching. This is the safe default state — the site renders identically to a non-CMS build.

### Why innerHTML and not textContent

textContent would lose the `<span class="accent-electric">` accents in headlines like the homepage hero. Trusting innerHTML is acceptable here because the only writer is the site owner editing their own sheet — the same trust boundary as the source HTML itself. Sheet-rendered curly quotes can break the markup; document this in `CMS.md` and the client uses straight quotes.

### Adding a new editable slot

1. Add `data-copy-key="{page}.{section}.{slot}"` or `data-asset-key="…"` to the element in the HTML.
2. Append a row to `cms-copy-template.csv` / `cms-assets-template.csv` with the same key + current value.
3. Tell the client to add the matching row to their live Google Sheet (or do it for them).

### Limitations

- No live preview while editing — client edits sheet, waits ~30 s, reloads page.
- No rich-text editor — basic HTML tags only.
- Sheet is publicly readable (it's a published CSV) — fine for marketing copy, not for anything private.
- 1-2 round-trips per page load — fast (CSV is tiny, both fetches in parallel), but slower than a build-time inline.
