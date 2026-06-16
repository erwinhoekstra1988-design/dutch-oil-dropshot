# Working on the site

This site lives in **two places**: GitHub (the source of truth, deploys to the live URL) and your local clone (where you edit files). Keep them in sync by following the routine below.

- **Live site:** <https://erwinhoekstra1988-design.github.io/dutch-oil-dropshot/>
- **Repo:** <https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot>

---

## The one rule

> **Pull before you edit. Push after you edit.**

If you sit down at a machine and start changing files without pulling first, you may be editing an outdated copy. Then when you push, git will refuse (or worse, you'll create a merge conflict).

---

## Workflow per machine

### When you sit down

```bash
cd /path/to/dutch-oil-dropshot
git pull
```

That pulls in any changes pushed from your other machine (or by a collaborator).

### When you finish a chunk of work

```bash
git add -A                       # stage everything that changed
git commit -m "Short description of what changed"
git push
```

About **30 seconds later** the live site reflects the change. No manual upload, no re-deploy step.

---

## Setting up a new machine (laptop, second computer, etc.)

One-time per machine:

1. **Install git** — comes preinstalled on macOS Terminal; otherwise <https://git-scm.com/downloads>.
2. **Tell git who you are** (only matters for commit authorship — any name/email works):
   ```bash
   git config --global user.name  "Your Name"
   git config --global user.email "you@example.com"
   ```
3. **Cache GitHub auth** (so you only enter the token once per machine):
   ```bash
   git config --global credential.helper osxkeychain   # macOS
   # or
   git config --global credential.helper store         # Linux/Windows
   ```
4. **Clone the repo**:
   ```bash
   git clone https://github.com/erwinhoekstra1988-design/dutch-oil-dropshot.git
   cd dutch-oil-dropshot
   ```
5. **First push asks for credentials**:
   - Username: your GitHub username
   - Password: a Personal Access Token (`ghp_...`) — generate at <https://github.com/settings/tokens> with **classic**, **`repo`** scope. **Never share this token.**
6. From then on, just `git pull` / `git push` — keychain handles auth silently.

---

## Friendlier alternatives to Terminal

If you'd rather not type git commands:

- **GitHub Desktop** — <https://desktop.github.com>. After installing and signing in, *File → Clone repository* and pick this repo. To pull, click **Fetch origin**. To push, write a message → **Commit to main** → **Push origin**. Same model as Terminal, just buttons.
- **github.dev** — open the repo on github.com and press the `.` key. A full VS Code editor opens in your browser. Edit, commit, and push without installing anything. Great for quick text changes on the road. Limitation: can't run the site locally to preview.
- **VS Code with the GitHub extension** — built-in source-control panel, same idea as GitHub Desktop but inside your editor.

Pick one per machine; you can mix on different machines.

---

## What you can edit on the live site without redeploying

Two things skip the push step entirely because they read live external data:

- **Stockist list** — edit the published Google Sheet linked from `stockists-map.js`. New rows show up on the live map within ~5 minutes (Google Sheets cache). See `stockists.csv` for the column format.
- **Anything served by an external service** (fonts via Google Fonts, etc.) — those refresh independently.

Everything else (HTML, CSS, images, JS) requires a commit + push to update the live site.

---

## Editing images / videos

See `assets/README.md` for the slot-by-slot inventory. To replace an image:

1. Drop the new file into `/assets`, **keep the exact same filename**.
2. Bump the cache-buster across all HTML files so browsers fetch the new version. From the repo root:
   ```bash
   find . -maxdepth 1 -name "*.html" -exec sed -i '' 's/?v=2/?v=3/g' {} +
   ```
   (Replace `2` → `3` with the next pair when you bump again — `3` → `4`, etc.)
3. Commit & push.

Visitors get the new file on their next page load without needing to hard-refresh.

---

## When things go wrong

| Symptom | Fix |
|---|---|
| `git push` says "rejected" / "non-fast-forward" | Someone (or your other machine) pushed first. Run `git pull --rebase`, fix any conflicts, then `git push`. |
| `git pull` reports merge conflicts | You and the other machine edited the same lines. Open the marked files, pick which version to keep, `git add -A`, `git commit`, `git push`. |
| Push asks for credentials every time | You skipped step 3 in *Setting up a new machine* — run that one-liner once and the keychain takes over. |
| Live site doesn't reflect my push | Wait 30–60 s, then hard-refresh (⌘⇧R) in case the browser is caching. Re-bump `?v=N` if you changed an image. |
| Token expired (30-day default) | Generate a new one at <https://github.com/settings/tokens> and force a re-prompt: `git credential-osxkeychain erase` (just press Enter at each prompt), then `git push` and paste the new token. |
