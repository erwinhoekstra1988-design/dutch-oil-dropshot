# Asset slots — where each image / video appears

Every file in this folder is referenced by name from one or more HTML pages.
**To replace an image:** overwrite the file in place, keep the exact same name, then bump the cache-buster (see bottom of this doc).

If you want to send a developer a new image, tell them which **slot** it's for using the names below — that's clearer than just "this is the new bar photo".

---

## File-by-file inventory

| File | Type | Used in | Recommended size |
|---|---|---|---|
| `penguin-iceberg.png` | image | Homepage hero (video poster), Contact hero, Age-gate (video poster) | **1920 × 1080+** (16:9, dark scene) |
| `Penguin_grabs_bottle_on_iceberg.mp4` | video | Homepage hero loop | **1920 × 1080, ≥4 s, H.264 MP4, muted, ≤8 MB** |
| `honey-spill.jpeg` | image | Product hero (video poster) | **1920 × 1080+** (16:9) |
| `honey-spill.mp4` | video | Product hero loop, Age-gate loop | **1920 × 1080, ≥4 s, H.264 MP4, muted, ≤15 MB** |
| `oil-spill.mp4` | video | Stockists hero loop | **1920 × 1080, ≥4 s, H.264 MP4, muted, ≤15 MB** |
| `bottle-bar.png` | image | Product page – section 02 image (left half), Stockists hero (video poster) | **1280 × 720+** (16:9) |
| `bottle-blue-bar.png` | image | Homepage card 02 (The Product), Product page split 02 image, Story page split 02 image, Product page wild-tile 4, Contact card | **960 × 900+** (~1:1) |
| `bottle-wood-bar.png` | image | Homepage card 04 (Selling Points), Product page split 03 image, Story page wild-tile 4 | **960 × 900+** (~1:1) |
| `man-bottle.png` | image | Homepage card 03 (The Story) | **960 × 900+** (~1:1) |
| `bottle-mini-iceberg.png` | image | Product + Story "In The Wild" tile 2 | **720 × 720+** (1:1 square) |
| `shots-tray-club.png` | image | Product + Story "In The Wild" tile 1 | **720 × 720+** (1:1 square) |
| `drum.jpeg` | image | Product + Story "In The Wild" tile 3 | **720 × 720+** (1:1 square) |
| `groningen.png` | image | Story hero background | **2000 × 800+** (wide aerial / cinema-strip) |
| `stoker.jpeg` | image | *(not currently used — legacy from old design)* | — |

---

## Page-by-page (cross-reference)

### Homepage (`index.html`)
- Hero: video `Penguin_grabs_bottle_on_iceberg.mp4`, poster `penguin-iceberg.png`
- `02 // THE PRODUCT` image: `bottle-bar.png`
- Three modular cards:
  - **The Product** → `bottle-blue-bar.png`
  - **The Story** → `man-bottle.png`
  - **Selling Points** → `bottle-wood-bar.png`

### Product page (`product.html`)
- Hero: video `honey-spill.mp4`, poster `honey-spill.jpeg`
- `MORE THAN A DROPSHOT` image: `bottle-blue-bar.png`
- `CRAFTED FOR THE NIGHT` image: `bottle-wood-bar.png`
- `IN THE WILD` tiles (left → right): `shots-tray-club.png`, `bottle-mini-iceberg.png`, `drum.jpeg`, `bottle-blue-bar.png`

### Story page (`story.html`)
- Hero: image `groningen.png`
- `THE BOOZE COMPANY` image: `bottle-blue-bar.png`
- `IN THE WILD` tiles (left → right): `shots-tray-club.png`, `bottle-mini-iceberg.png`, `drum.jpeg`, `bottle-wood-bar.png`

### Selling Points (`stockists.html`)
- Hero: video `oil-spill.mp4`, poster `bottle-bar.png`
- (Map area is dynamic — no image asset)

### Contact (`contact.html`)
- Hero: image `penguin-iceberg.png`
- Contact card: `bottle-blue-bar.png`

### Age-gate (`age-gate.html`)
- Background: video `honey-spill.mp4`, poster `penguin-iceberg.png`

---

## Replacing an image (the workflow)

1. **Keep the filename identical** — same name, same extension. If you want a different filename for a slot, edit the HTML too (or ask the dev).
2. **Match the aspect ratio** from the table above as closely as possible. Mismatched ratios will be cropped center-cover.
3. **Match the file type when possible** — replacing a `.png` with the same `.png` is easiest. If you replace a `.png` with a `.jpg`, the HTML reference needs updating.
4. **Compress before uploading** — large unoptimized images make the page slow. Run images through TinyPNG or Squoosh first. Aim for under 500 KB per image, under 15 MB per video.
5. **Bump the cache-buster** so browsers actually fetch the new file (see below). Otherwise visitors still see the old image until their cache expires.

### Image size sanity check

If you're not sure what size to send: a **JPEG at the recommended pixel dimensions, around 200–500 KB, sharp at 100 % zoom** is the sweet spot for hero/section images. Tile/card images can be smaller.

---

## Cache-buster (`?v=N`)

After replacing an image (or any CSS/JS), bump every `?v=N` query string in the HTML files by one. The browser sees a "new" URL and forces a re-download.

Find/replace approach in the project root (`dutch-oil-dropshot/`):

```bash
# bumps every ?v=2 → ?v=3 across all 6 HTML files
find . -maxdepth 1 -name "*.html" -exec sed -i '' 's/?v=2/?v=3/g' {} +
```

(Repeat with the next pair when you bump again — `3` → `4`, etc. Use the right side of the previous bump as the new left side.)

Visitors get the new file on their next page load with no hard-refresh needed.
