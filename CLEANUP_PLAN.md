# VEDMAN V5 — Repository Cleanup Plan

**Repository:** `vedman.lv` (`/Users/ufomar/Projects/vedman.lv`)  
**Audit date:** 2026-07-03  
**Current live version:** V4 (Firebase gallery)  
**Target:** VEDMAN V5  
**Deployment:** GitHub Pages → `vedman.lv` (see `CNAME`)

---

## Executive summary

The repo is a static site (~87 tracked files, ~43 MB). Production traffic centers on **`index.html`** (self-contained UI + inline JS/CSS), **`vedman-panel.html`** (Firebase admin), and **`firebase-config.js`**. A large legacy layer remains from earlier versions: **30 root JPEGs (~14 MB)**, **duplicate logos**, **three admin implementations**, a **`backup-v1/`** snapshot, and a stale **`seo/`** folder copied from another project.

This plan proposes a **safe, phased cleanup**. Nothing should be deleted until each phase is reviewed and approved.

**Constraints for V5 (from project rules):**
- Do not delete files yet
- Do not change UI yet
- Do not commit automatically
- Wait for approval before executing cleanup phases

---

## Repository map (high level)

| Area | Role | Size (approx.) |
|------|------|----------------|
| Root HTML/CSS/JS | Live site + admin | ~500 KB code |
| Root `*.jpeg` (30 files) | Legacy gallery images | ~14 MB |
| Logo/favicon files | Brand assets | ~1.3 MB (incl. duplicates) |
| `assets/` | Design refs + duplicate logo/favicon | ~5.8 MB |
| `backup-v1/` | V1 HTML archive | ~112 KB |
| `pages/` | SEO placeholder subpages | ~40 KB |
| `admin/` + `admin.html` | Superseded admin UIs | ~24 KB |
| `firebase/` | Stale Firebase module | ~4 KB |
| Docs/rules | README, rules, test report | ~3 KB |

---

## 1. Production files (KEEP — do not remove)

These files are part of the live site or its operational tooling.

### Core site
| File | Purpose | Referenced by |
|------|---------|---------------|
| `index.html` | Main homepage (V4 UI, inline CSS/JS, quote modal, Firebase gallery loader) | Site entry, footer admin link |
| `privacy.html` | Privacy policy | `index.html` footer nav |
| `favicon.png` | Site favicon | `index.html` `<link rel="icon">` |
| `vedman-logo.png` | Header + footer logo | `index.html`, `vedman-panel.html`, `admin.html` |
| `manifest.json` | PWA manifest (icons array empty) | Not linked in `index.html` today — keep for future |

### Gallery / data
| File | Purpose | Referenced by |
|------|---------|---------------|
| `gallery.json` | Fallback gallery schema + empty `items[]` | `index.html` → `loadGallery()` when Firebase unavailable |
| `firebase-config.js` | Live Firebase Web App config (`VEDMAN-LV` project) | `index.html`, `vedman-panel.html` |

### Admin (current)
| File | Purpose | Referenced by |
|------|---------|---------------|
| `vedman-panel.html` | **Current** Firebase gallery admin (upload, WebP, drag-drop, delete) | `index.html` footer admin square, `README.md`, `robots.txt` disallow |

### Deployment / SEO (live paths)
| File | Purpose | Notes |
|------|---------|-------|
| `CNAME` | Custom domain `vedman.lv` | GitHub Pages |
| `robots.txt` (root) | Crawler rules; disallows `/vedman-panel.html` | **Authoritative** — served at `/robots.txt` |
| `sitemap.xml` (root) | Sitemap | **Authoritative** — only lists homepage today |

### Firebase documentation
| File | Purpose |
|------|---------|
| `FIREBASE_RULES.txt` | Current Firestore + Storage rules (open read/write) |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Planned auth-gated rules for post-login hardening |

### Project docs
| File | Purpose |
|------|---------|
| `README.md` | Setup, admin URL, Firebase instructions |
| `TEST_REPORT.md` | V4 smoke-test checklist |

---

## 2. Duplicate files

Exact or functional duplicates. Consolidate after approval — **do not delete originals until a canonical copy is chosen and references updated.**

| Canonical (recommended) | Duplicate / stale copy | Relationship | Action (later) |
|-------------------------|------------------------|--------------|----------------|
| `vedman-logo-final.png` | `assets/vedman-logo-final.png` | **Identical MD5** (`13157014238e3a90a60ff1a6b0be9faa`) | Keep one copy under `assets/` when V5 asset structure is defined |
| `favicon.png` (root) | `assets/favicon.png` | **Different files** (MD5 differs); root is used in production | Remove `assets/favicon.png` after confirming no future use |
| `robots.txt` (root) | `seo/robots.txt` | Different content; `seo/` points to `mainamies.lv` | Remove `seo/robots.txt` after SEO phase |
| `sitemap.xml` (root) | `seo/sitemap.xml` | Root = homepage only; `seo/` lists 7 `/pages/` URLs | Merge into one sitemap during SEO phase |
| Inline scripts in `index.html` | `app.js` | Same material catalog + quote logic; **`app.js` is never loaded** | Retire `app.js` or extract shared module in V5 refactor (not now) |
| Inline CSS in `index.html` | `style.css` | Different design systems; `style.css` used only by `pages/` and `admin/` | Keep both until UI unification in V5 |

---

## 3. Unused images (not referenced outside `backup-v1/`)

All **30 root-level JPEG files** have **zero references** in production HTML/JS/CSS. They are only used by `backup-v1/*.html` (which reference them as sibling paths, e.g. `src="skemba1.jpeg"`).

**Total size:** ~14 MB  
**Production impact if removed:** None on current `index.html` (gallery loads from Firebase, falls back to `gallery.json`).

### Referenced in `backup-v1/` (22 images — used in old gallery + subpages)
`granst.jpeg`, `grants6.jpeg`, `lapas.jpeg`, `manipul1.jpeg`, `manipul2.jpeg`, `manipul4.jpeg`, `manipul5.jpeg`, `manipul6.jpeg`, `manipul7.jpeg`, `melnz1.jpeg`, `melnz2.jpeg`, `melnz3.jpeg`, `melnz5.jpeg`, `melnz9.jpeg`, `skemba1.jpeg`, `skembas4.jpeg`, `skembas77.jpeg`, `stikls2.jpeg`, `transp1.jpeg`, `transp5.jpeg`, `transp9.jpeg`, `zari1.jpeg`, `zari2.jpeg`

### Not referenced anywhere in repo (8 images — strongest delete candidates after archive)
| File | Size (approx.) | Notes |
|------|----------------|-------|
| `koku stadisana1.jpeg` | 324 KB | Filename contains space |
| `manipul12.jpeg` | 380 KB | |
| `melnz10.jpeg` | 424 KB | |
| `melnz11.jpeg` | 496 KB | |
| `melnz12.jpeg` | 396 KB | |
| `zari7.jpeg` | 544 KB | |
| `zari8.jpeg` | 412 KB | |

### Design reference images (unused everywhere)
| File | Size | Notes |
|------|------|-------|
| `assets/images/design-c-reference.png` | 2.3 MB | No HTML/JS/CSS references |
| `assets/images/hero-reference.png` | 2.1 MB | No HTML/JS/CSS references |

**Recommendation:** Before deletion, upload legacy JPEGs worth keeping into Firebase via `vedman-panel.html`, then move files to `_archive/legacy-images/` rather than deleting.

---

## 4. Duplicate logo files

| File | Size | Status | Used in production? |
|------|------|--------|---------------------|
| `vedman-logo.png` | 104 KB | **Active logo** | Yes — `index.html`, `vedman-panel.html`, `admin.html` |
| `vedman-logo-final.png` | 568 KB | Duplicate of `assets/vedman-logo-final.png` | No references in HTML |
| `assets/vedman-logo-final.png` | 568 KB | Byte-identical duplicate | No references in HTML |
| `vedman-logo-footer.png` | 108 KB | Deprecated | README: *"vedman-logo-footer.png vairs nav vajadzīgs"* — no HTML references |

**Canonical choice for V5:** `vedman-logo.png` (already live). Archive or delete the three unused variants after approval.

---

## 5. Old admin files

Three separate admin implementations exist. Only one is production.

| Path | System | Status | Notes |
|------|--------|--------|-------|
| **`vedman-panel.html`** | Firebase Storage + Firestore, basic login, WebP compression | **PRODUCTION** | Documented in `README.md`; linked from `index.html` |
| `admin.html` (root) | GitHub `gallery/` folder + `gallery.json` via localStorage | **Superseded** | Referenced only in `index.html` error fallback message |
| `admin/login.html` + `admin/login.js` | Firebase Auth email/password login | **Incomplete** | Redirects to `admin/admin.html` |
| `admin/admin.html` + `admin/admin.js` | Firebase upload admin | **Incomplete** | Imports `firebase/firebase.js` with placeholder `XXXX` config |
| `firebase/firebase.js` | Shared Firebase module for `admin/` | **Stale** | SDK 10.8.0, placeholder credentials — not used by live site |

**Recommendation (post-approval):** Archive `admin.html`, `admin/`, and `firebase/firebase.js`. Update `index.html` fallback message to mention `vedman-panel.html` instead of `admin.html` (UI text change — defer to V5 UI phase).

---

## 6. Backup folders

### `backup-v1/` (11 HTML + `nav.js`)

Snapshot of an earlier multi-page site. Not linked from production `index.html`.

| File | Notes |
|------|-------|
| `asfalts.html`, `galerija.html`, `grants.html`, `koks.html`, `kontakti.html`, `manipulators.html`, `par-mums.html`, `skembas.html`, `smilts.html` | Old subpages; reference root JPEGs and missing `css/style.css` |
| `vedman_v2.html` | Early V2 prototype (Unsplash hero, dark theme) |
| `nav.js` | Shared navigation for backup pages |

**Size:** ~112 KB (HTML/JS only; depends on root JPEGs for images)

**Recommendation:** Move entire folder to `_archive/backup-v1/` after exporting any content needed for V5. Do not delete until V5 content migration is complete.

---

## 7. Firebase files

| File | Role | Keep? | Notes |
|------|------|-------|-------|
| `firebase-config.js` | Live config for `index.html` + `vedman-panel.html` | **Yes** | Contains real API keys (public web config — normal for Firebase) |
| `FIREBASE_RULES.txt` | Rules deployed in Firebase Console | **Yes** | Currently open write — security risk documented |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Target rules after auth | **Yes** | Apply when admin auth is hardened in V5 |
| `firebase/firebase.js` | Module for unused `admin/` folder | Archive | Placeholder `XXXX` values; SDK 10.8.0 vs 10.12.5 in production |

**V5 note:** Production uses CDN imports (`firebasejs/10.12.5`) inline in HTML, not `firebase/firebase.js`.

---

## 8. SEO files

### Live (served from repo root)
| File | Current state | Gap |
|------|---------------|-----|
| `robots.txt` | Allows `/`, disallows admin, points to `https://vedman.lv/sitemap.xml` | OK |
| `sitemap.xml` | Single URL: homepage only | Missing 9 `/pages/*.html` URLs |

### Stale / conflicting (`seo/` folder)
| File | Problem |
|------|---------|
| `seo/robots.txt` | Points sitemap to `https://www.mainamies.lv/seo/sitemap.xml` — **wrong domain/project** |
| `seo/sitemap.xml` | Lists 7 `/pages/` URLs but is **not** served (root `sitemap.xml` is) |

### SEO subpages (`pages/`)
Nine placeholder pages using `style.css` + text wordmark (no image logo):

`grants.html`, `kontakti.html`, `manipulators.html`, `materiali.html`, `melnzeme.html`, `objekti.html`, `pakalpojumi.html`, `skembas.html`, `smilts.html`

Each page states: *"Šī ir SEO apakšlapa. Pievieno reālu tekstu…"* — not linked from `index.html` navigation (anchor-based single page).

**Recommendation (SEO phase, after approval):**
1. Merge `seo/sitemap.xml` URLs into root `sitemap.xml`
2. Delete or archive `seo/` folder
3. Decide V5 strategy: expand `pages/` vs. keep single-page + anchors
4. Add canonical tags to `pages/` if they remain indexed

---

## 9. Files that should NOT be changed yet

Per V5 rules: **no UI changes** and **no deletions** until this plan is approved.

### Do not edit (UI / live behavior)
- `index.html` — entire file (inline CSS, layout, gallery, quote modal)
- `vedman-panel.html` — active admin UI
- `pages/*.html` — SEO stubs (content/UI deferred)
- `style.css` — used by `pages/` and legacy `admin/`
- `privacy.html`

### Do not delete (operational)
- `firebase-config.js`
- `gallery.json`
- `CNAME`
- `robots.txt`, `sitemap.xml` (root)
- `favicon.png`, `vedman-logo.png`
- `FIREBASE_RULES*.txt`

### Do not commit automatically
All cleanup execution should be explicit commits after user approval.

---

## Additional findings

### Orphan code (unused but present)
| File | Finding |
|------|---------|
| `app.js` | Full quote-form + material catalog logic; **no `<script src="app.js">` anywhere** |
| `style.css` | Not loaded by `index.html`; parallel design system to inline styles |
| `manifest.json` | Not linked from `index.html`; `icons` array is empty |

### Missing expected paths
- No `/gallery/` directory in repo (old `admin.html` workflow expected manual GitHub uploads)
- `backup-v1/*.html` reference `css/style.css` which does not exist in repo

### Security notes (for V5, not cleanup)
- `README.md` contains admin username/password in plaintext
- `FIREBASE_RULES.txt` allows unauthenticated writes
- `vedman-panel.html` uses client-side login (not Firebase Auth)

---

## Proposed cleanup phases (await approval)

### Phase 0 — Planning only ✅
- [x] Audit repository
- [x] Create this document
- [ ] **STOP — wait for user approval**

### Phase 1 — Archive (no deletions)
Create `_archive/` and **move** (not delete) low-risk items:
- `backup-v1/`
- `seo/`
- `admin/` + root `admin.html`
- `firebase/firebase.js`
- Unused logos: `vedman-logo-final.png`, `vedman-logo-footer.png`, `assets/vedman-logo-final.png`
- `assets/favicon.png`
- `assets/images/*-reference.png`
- Root JPEGs (after optional Firebase upload)
- `app.js` (if confirmed unused)

Verify: site still loads, admin still works, no broken production links.

### Phase 2 — Deduplicate assets
- Single logo path under `assets/`
- Single favicon
- Remove byte-identical duplicates after reference audit

### Phase 3 — SEO consolidation
- Expand root `sitemap.xml` with approved URLs
- Align `robots.txt` with final sitemap
- Link or noindex `pages/` based on V5 SEO strategy

### Phase 4 — Admin + Firebase hardening (V5 feature work)
- Remove archived admin UIs from repo entirely (if approved)
- Apply `FIREBASE_RULES_SECURE_NEXT.txt`
- Replace client-side panel login with Firebase Auth
- Update README credentials section

### Phase 5 — UI refactor (explicitly out of scope until approved)
- Unify `index.html` inline styles with `style.css` or new V5 design system
- Wire or remove `manifest.json`
- Replace placeholder `pages/` content

---

## Pre-cleanup verification checklist

Before any file moves or deletions:

- [ ] Confirm live site matches `index.html` on `main` branch
- [ ] Confirm `vedman-panel.html` upload/delete still works against Firebase
- [ ] Export/list current Firebase gallery items (cloud is source of truth)
- [ ] Decide which legacy JPEGs to upload to Firebase before archiving
- [ ] Confirm GitHub Pages serves root `robots.txt` / `sitemap.xml` (not `seo/`)
- [ ] Search engine: check if any `/pages/` URLs are already indexed
- [ ] User approves this plan

---

## Estimated space recovery (if all approved phases complete)

| Category | Approx. savings |
|----------|-----------------|
| Root JPEGs | ~14 MB |
| Unused logos + duplicate favicon | ~1.2 MB |
| Design reference PNGs | ~4.4 MB |
| `backup-v1/`, `seo/`, old admin | ~150 KB |
| **Total potential** | **~20 MB (~46% of repo)** |

---

## Approval required

**No files have been modified or deleted except this plan document.**

Reply with approval (whole plan or per-phase) before proceeding to Phase 1.

Suggested approval format:
- `Approve Phase 1` — archive only
- `Approve Phase 1 + 2` — archive + dedupe
- `Approve all except UI` — through Phase 4
- Or specify exclusions (e.g. keep JPEGs until Firebase migration done)
