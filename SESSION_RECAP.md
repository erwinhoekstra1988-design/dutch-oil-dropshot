# Dutch Oil Dropshot — Session Recap

Most of the project knowledge already lives in the repo. This recap captures the **meta-context** that isn't in those docs, plus what's changed since the last commit of `PROJECT_LOG.md`, plus exactly how to bootstrap a fresh chat.

---

## 1. The project at a glance

- **What it is.** A static brand site for **Dutch Oil Dropshot** — a Groningen-based herbal shot drink (21% ABV, honey × salt). 5 marketing pages + age verification gate.
- **Aesthetic.** Industrial, dark, electric-blue. Black backgrounds, asphalt-grey alternating sections, hazard-tape strips between sections, Oswald display type, JetBrains Mono labels.
- **Tech stack.** Pure HTML + CSS + JS. No framework, no build step. Leaflet for the stockist map. Google Sheets as the CMS. Google Fonts.
- **Live URL:** <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/>
- **GitHub repo:** <https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot>
- **GitHub Pages deploy:** automatic on push to `main` (~30 s lead time).

---

## 2. Three docs in the repo do most of the work

| File | What it covers |
|---|---|
| [`PROJECT_LOG.md`](PROJECT_LOG.md) | Full project context: design tokens, file layout, per-page architecture, component patterns, age gate, stockists CMS, cache busting, deployment, gotchas, future work. **418 lines, exhaustive.** |
| [`WORKFLOW.md`](WORKFLOW.md) | Git/deploy how-to per machine. Pull-before / push-after habit, multi-machine setup, common-trouble fixes. |
| [`assets/README.md`](assets/README.md) | Image slot inventory — which file shows up where, with recommended pixel dimensions. |

If you ever read just one in a fresh session, read `PROJECT_LOG.md`.

---

## 3. Conversation arc (chronological)

We worked through these phases. Each one usually involved iteration with the client over design choices.

| # | Phase | Outcome |
|---|---|---|
| 1 | Original Figma bundle (PDP + homepage wireframes) | Built initial homepage as static HTML/CSS |
| 2 | Mirrored homepage to Figma | New Figma file via the use_figma plugin API |
| 3 | PDP handoff bundle | Built PDP artboard in the same Figma file |
| 4 | **Major Figma redesign** by the client — 5 fully-designed pages, accent shifted **orange → electric blue** | Re-synced everything from Figma back to code, downloaded the 8 new image assets |
| 5 | Iteration phase: 50/50 split layouts, "verhaal" → "history", grey-border PNG fix, image cache-busting | All baked into `styles.css` + HTML |
| 6 | **Stockists CMS:** Leaflet map + Google Sheet feed | `stockists-map.js`, `stockists.csv` template, city-coords lookup table |
| 7 | Age gate | `age-gate.html` + inline sync-redirect script at the top of every page's `<head>` |
| 8 | Documentation: `PROJECT_LOG.md`, `WORKFLOW.md`, `assets/README.md` | Committed to repo |
| 9 | **GitHub deploy:** repo init → push → Pages enabled → live URL up | Push via macOS keychain after first PAT prompt |
| 10 | **Custom SVG logo** swap (replaced text logo) | `assets/dutch-oil-logo.svg` + black-letters variant for hover |
| 11 | Various refinements: logo size up to 80 px, "The Night" turned blue, hazard tape below marquee on product page, footer logo became clickable link | (See "Recent changes" below) |

---

## 4. Recent changes — *not yet* in `PROJECT_LOG.md`

Everything in §3 phases 10–11 is post the log being written. These are the deltas:

### Logo

- **New file:** `assets/dutch-oil-logo.svg` (provided by the client — wordmark on a blue splash, white letters, ~10 KB).
- **New variant:** `assets/dutch-oil-logo-hover.svg` — same SVG with `.cls-1 { fill: #000 }` instead of `#fff`. Used for the hover state.
- Replaced text logo in **11 places** across all 6 HTML files (`<img class="logo-img">`).
- **Size:** 80 px nav, 64 px footer, 56 / 48 px on phones (≤600 px). SVG keeps its 2.33:1 aspect ratio.
- **Hover effect:** `.logo` carries a `background-image: dutch-oil-logo-hover.svg` (black letters) behind the `<img>` (white letters). On `:hover` / `:focus-visible` the `<img>` becomes `visibility: hidden`, revealing the black-letters background. No layout shift, no JS needed.
- **Footer logo** turned from `<div>` into `<a href="index.html">` (5 pages updated) so the hover rule (`a.logo:hover`) applies. Also adds standard "click footer logo to go home" UX.

### Hero title

- Homepage h1 now has **two blue spans**: both `Starts` and `The Night` are `.accent-electric`. White words left are "The Shot / That".

### Product page

- A new `<div class="hazard-tape">` sits **between the marquee and the In The Wild grid**. Now the marquee is sandwiched.

### Cache buster

- All local CSS, JS, image and video references carry `?v=2`. **Bump to `?v=3` next** when anything in `styles.css` / `nav.js` / `stockists-map.js` / an asset changes:
  ```bash
  find . -maxdepth 1 -name "*.html" -exec sed -i '' 's/?v=2/?v=3/g' {} +
  ```

---

## 5. Things still to decide / not done

| Topic | State |
|---|---|
| Custom domain (e.g. `dutchoil.nl`) | Not configured. Add a `CNAME` file at the repo root + DNS records when ready. |
| "NO" destination on age gate | Currently `drinkwijzer.info`. Confirm with legal team. |
| Sample-request form | The contact CTA is `mailto:info@dutchoil.nl`. No backend form. |
| Language switcher (NL/EN/DE) | Chips visible in nav but not wired. |
| Real stockist data | The Google Sheet (URL hard-coded in `stockists-map.js` line 32) has ~17 entries right now. Client edits the sheet → live within ~5 min. |
| Accessibility audit | Never formally run (axe / Lighthouse). |
| Analytics | None installed. |
| Logo colour | The SVG uses light blue `#61afd5` for the splash — slightly different from the site's `--electric: #1fa9ff`. Edit the SVG file if you want them to match. |

---

## 6. Hard-won gotchas (the ones that cost the most time)

These are all in `PROJECT_LOG.md` §11 in more detail, but worth flagging:

1. **GitHub Pages is case-sensitive.** `Penguin_grabs_bottle_on_iceberg.mp4` (capital P) must be referenced exactly.
2. **Cache the browser hangs onto** breaks "I changed something but nothing shows up" workflows. Use `?v=N` and bump.
3. **Google Sheets CSV traps:** the URL must end with `/pub?output=csv`, **not** `/pubhtml`. NL/DE locales use `;` not `,`. If data was pasted unsplit into Sheets, every row lives in column A — the parser repairs this automatically, but the fix is `Data → Split text to columns` in the Sheet.
4. **Fine-grained PATs** require per-repo allow-listing. Classic tokens with `repo` scope work universally. We use classic.
5. **Don't paste a PAT anywhere except a Terminal password prompt.** If you do, revoke it immediately at <https://github.com/settings/tokens>.

---

## 7. Bootstrapping a fresh chat session (here or on the laptop)

### On the same Mac

The project is at `/Users/ericjongsma/CLAUDE/dutch-oil-dropshot`. Just open a new Claude Code session in that directory and say:

> Read **`PROJECT_LOG.md`**, **`SESSION_RECAP.md`**, **`WORKFLOW.md`**, and **`assets/README.md`** then summarise the project so I can confirm you have full context.

### On a new machine (laptop, etc.)

```bash
# wherever you want the project to live — NOT inside an iCloud-synced folder
mkdir -p ~/Developer
cd ~/Developer
git clone https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot.git
cd dutch-oil-dropshot
git config --global credential.helper osxkeychain
claude
```

Then use the same first message as above. macOS keychain will cache your GitHub token after the first push.

### After every edit

```bash
git pull            # before you start
# … edit / Claude edits …
git add -A
git commit -m "what changed in one line"
git push            # live ~30 s later
```

If a CSS/JS/image file changed, bump `?v=N` across all HTML files first (sed command above).

---

## 8. URLs you'll want bookmarked

| Purpose | URL |
|---|---|
| Live site | <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/> |
| GitHub repo | <https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot> |
| Pages settings | <https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot/settings/pages> |
| Personal access tokens | <https://github.com/settings/tokens> |
| Stockists Google Sheet — **published CSV** (read-only feed used by the site) | `https://docs.google.com/spreadsheets/d/e/2PACX-1vS9-snwhhFfOE0Qww97vnfWAu7pvcUreYyl8ihJc9hI24_NO7XchpGgJ5ho7mVxAfXZ8nXmLLgLK7f-/pub?gid=0&single=true&output=csv` |

You'll also need the editable Sheet URL — that's the one with `/edit?…` rather than `/pub?…` and isn't in the repo. Keep that bookmarked in your browser.
