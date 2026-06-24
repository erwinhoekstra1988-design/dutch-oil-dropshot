# Dutch Oil Dropshot — Editor's guide

This site can be edited without touching code, the same way you already edit
stockists. Two things you can change yourself:

1. **Text** anywhere on the site — headlines, paragraphs, button labels.
2. **Images and videos** — any picture or background video on any page.

You do this in **one Google Sheet** (two tabs) plus a free **Cloudinary**
account that holds the actual image and video files.

If anything in the sheet is blank or unreachable, the site falls back to the
text and pictures already on it — so nothing can break.

---

## 1. One-time setup (about 10 minutes)

### Step 1 — Make a Google Sheet with two tabs

1. Create a new Google Sheet. Call it for example **"Dutch Oil — site copy"**.
2. Make two tabs (rename them at the bottom of the sheet). Tab names don't matter to the site, but the columns do.
3. **Tab "copy"** — two columns: `key`, `text`. Open `cms-copy-template.csv` from the repo, copy-paste everything into this tab. You'll see ~60 rows, one for every editable text on the site.
4. **Tab "assets"** — two columns: `key`, `url`. Same thing, from `cms-assets-template.csv`. About 20 rows.

### Step 2 — Publish each tab as CSV

For each tab:

1. Click on the tab.
2. `File → Share → Publish to web`.
3. In the dropdown next to the tab name, pick that tab specifically (not "Entire Document").
4. Format: **Comma-separated values (.csv)**.
5. Click **Publish**, copy the URL.

You'll end up with two URLs — one for the `copy` tab, one for the `assets` tab.

### Step 3 — Paste those two URLs into the site

Open `site-cms.js` (top of the file), find these two lines:

```js
const COPY_CSV_URL   = '';
const ASSETS_CSV_URL = '';
```

Paste the URLs between the quotes. Save. Commit. Push. (Or ask Eric/Claude to do
this step — it's a one-time thing.)

### Step 4 — Make a Cloudinary account (for new images and videos)

You only need this if you want to **swap** an existing image or video for a new
one. The pictures already on the site are baked-in and don't need Cloudinary.

1. Go to <https://cloudinary.com> and sign up — free, no card needed.
2. The free plan gives you 25 GB of storage and roughly 25 GB/month of
   delivery. More than enough.
3. After logging in, go to **Media Library**.

---

## 2. Editing text

1. Open the Google Sheet, **`copy`** tab.
2. Find the row whose `key` matches the text you want to change. Keys read like
   addresses — `home.hero.title` is the big title on the homepage, `product.split1.body1`
   is the first paragraph in the first split section on the product page.
3. Edit the **`text`** column. Save (it auto-saves).
4. Wait about a minute, then reload the live site. The change is live.

### Allowed formatting inside text cells

Most cells are plain text. A few common HTML tags are also allowed, so the site
can keep its mixed-style look:

| Tag | Effect |
|---|---|
| `<br />` | Forces a line break. |
| `<strong>…</strong>` | **Bold** |
| `<em>…</em>` | *Italic* |
| `<span class="accent-electric">…</span>` | Electric-blue accent words (the same blue used in the homepage hero). |

You can also leave a cell blank — the site keeps its original text for that
slot.

### Common mistakes

- **Don't change the key column.** Keys are how the site finds the right text.
  If you change a key, the swap won't happen.
- **Don't add new rows** unless you also add a matching `data-copy-key` in the
  HTML (Claude/Eric will help with this).
- **Quote characters inside HTML must use straight `"`**, not curly `"`. Sheets
  sometimes auto-corrects this; check before saving if the result looks off.

---

## 3. Swapping an image or a video

1. Open Cloudinary → **Media Library**.
2. Drag your new image or MP4 in. Wait a few seconds.
3. Click the file → **Copy URL** (the public delivery URL, looks like
   `https://res.cloudinary.com/.../v123/.../filename.jpg`).
4. Open the Google Sheet, **`assets`** tab.
5. Find the row for the slot you want to swap — e.g. `home.hero.video` is the
   big penguin video on the homepage; `product.split1.image` is the bottle photo
   on the product page.
6. Paste the Cloudinary URL into the **`url`** column. Save.
7. Wait a minute, reload the live site. The new image / video is live.

To go back to the original, just empty the cell again — the baked-in image
returns.

### Tips for media

- **Aspect ratio matters**: the layouts assume the same ratios as the originals.
  See `assets/README.md` for the recommended dimensions per slot.
- **For videos**: use MP4, H.264 codec, no audio (the site mutes them anyway).
  Keep them under ~10 MB for fast loading. Cloudinary can do this automatically
  via its "auto" delivery options.
- **For images**: JPG for photos, PNG for things with transparency, SVG for
  logos. Aim for ~150-400 KB per image.

---

## 4. Key naming cheat sheet

The first segment of every key is the page:

| Prefix | Page |
|---|---|
| `home.*` | Homepage (`index.html`) |
| `product.*` | The Product page |
| `story.*` | The Story page |
| `stockists.*` | Selling Points page |
| `contact.*` | Contact page |

The second segment is the section:

| Segment | What it is |
|---|---|
| `hero` | The big top-of-page banner area |
| `product` | The "Honey × Salt" detail block on the homepage |
| `split1`, `split2` | First / second split-screen section on Product page |
| `split` | The split-screen section on the Story page |
| `fieldreport` | The blue "FIELD REPORT" quote block on the homepage |
| `cards` | The 3-card row at the bottom of the homepage |
| `wild` | The "In The Wild" 4-image grid |
| `list` | The right-hand list on the Selling Points page |
| `card` | The contact card on the Contact page |

The third segment names the slot (`title`, `body1`, `cta`, `image`, etc.).

---

## 5. When something goes wrong

- **The site shows the old text after I saved.** Wait a minute (the sheet
  re-publishes in ~30 seconds), then hard-reload (`Cmd + Shift + R`).
- **Nothing changes at all.** Check that the `key` matches exactly — no typos
  or extra spaces. Then check the URLs in `site-cms.js` still point to the
  published CSV.
- **The text shows raw HTML tags.** A quote character was changed into a curly
  one. Fix the cell using straight `"` quotes.
- **An image is broken.** The Cloudinary URL is wrong, or the file was deleted
  from Cloudinary. Empty the cell to fall back, then paste the right URL.

If in doubt, just empty a cell. The site goes back to its built-in default.

---

## 6. URLs to bookmark

| Purpose | URL |
|---|---|
| Google Sheet — copy + assets | (paste your editable URL here once it exists) |
| Cloudinary | <https://cloudinary.com/console> |
| Live site | <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/> |
| Stockists Sheet (separate) | (your existing stockists sheet URL) |
