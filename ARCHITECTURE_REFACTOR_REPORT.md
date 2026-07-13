# Architecture refactor report — V5 Milestone 2

**Date:** 2026-07-13  
**Branch:** `main` (local, uncommitted)  
**Goal:** Refactor project architecture only — no behaviour, Firebase, auth, gallery logic, SEO, or UI changes.

**Status:** Complete — awaiting approval. **Not committed. Not pushed.**

---

## Summary

Production site files remain at GitHub Pages root (`index.html`, `vedman-panel.html`, `firebase-config.js`, `gallery.json`). Inline CSS/JS extracted to `css/` and `js/`. Assets consolidated under `assets/`. Planning docs moved to `docs/`. Legacy and orphan files archived.

---

## 1. Folder structure created

```
/assets
    /images      (existing design references)
    /icons       favicon.png
    /logos       vedman-logo.png, vedman-logo-footer.png, vedman-logo-final.png
/css
    tokens.css, base.css, layout.css, components.css, home.css
    pages.css, panel.css, privacy.css
/js
    catalog-data.js, quote.js, gallery-json.js, gallery-firebase.js
    panel-app.js
/components    README.md (placeholder for future HTML partials)
/pages         unchanged SEO stubs (9 files)
/firebase      README.md (config stays at repo root)
/docs          all planning/security/validation markdown (except README.md)
/archive
    /backup-v1          (existing)
    /legacy-admin       former admin/
    /firebase-legacy    former firebase/firebase.js
    /orphan-images      30 root JPEGs (zero production refs)
    admin.html, app.js
```

---

## 2. Files moved

| From | To | Reason |
|------|-----|--------|
| `style.css` | `css/pages.css` | Subpage stylesheet |
| `favicon.png` | `assets/icons/favicon.png` | Icon asset |
| `vedman-logo.png` | `assets/logos/vedman-logo.png` | Logo asset |
| `vedman-logo-footer.png` | `assets/logos/` | Unused variant (archived path) |
| `assets/vedman-logo-final.png` | `assets/logos/` | Duplicate logo |
| `assets/favicon.png` | `assets/icons/` | Duplicate favicon |
| `*.jpeg` (30 root) | `archive/orphan-images/` | Orphans per dependency report |
| `admin/` | `archive/legacy-admin/admin/` | Superseded by panel |
| `admin.html` | `archive/admin.html` | Legacy JSON admin |
| `app.js` | `archive/app.js` | Orphan script |
| `firebase/firebase.js` | `archive/firebase-legacy/firebase.js` | Legacy SDK 10.8.0 |
| `*.md` (except README) | `docs/` | Documentation |

### Kept at repo root (production)

| File | Why |
|------|-----|
| `index.html` | GitHub Pages entry |
| `vedman-panel.html` | Admin panel URL |
| `firebase-config.js` | Loaded as `/firebase-config.js` — **not moved** |
| `gallery.json` | Public fallback data |
| `FIREBASE_RULES.txt` | Console deploy reference |
| `CNAME`, `robots.txt`, `sitemap.xml`, `manifest.json` | SEO / hosting |
| `README.md` | Repo entry |

---

## 3. JavaScript extraction

### `index.html` → `js/`

| Module | Role | Load order |
|--------|------|------------|
| `catalog-data.js` | `window.VEDMAN_CATALOG` (material DATA) | 1 |
| `quote.js` | Quote modal, calculator, WhatsApp send, `fillMain()` | 2 |
| `gallery-json.js` | `loadGallery()` JSON fallback | 3 |
| `gallery-firebase.js` | ES module: `loadFirebaseGallery()` + calls `loadGallery()` | 5 (after config) |

`firebase-config.js` remains between gallery-json and gallery-firebase (unchanged).

**Logic:** Extracted verbatim from inline scripts. No Firebase imports or gallery rendering logic changed.

### `vedman-panel.html` → `js/panel-app.js`

Single ES module — full panel script (Auth, RBAC gate, upload, list, delete) moved without modification.

**Not split further** to avoid risk to auth/gallery flows in this milestone.

---

## 4. CSS modularization

### Homepage (`index.html`)

| File | Contents |
|------|----------|
| `css/tokens.css` | `:root` variables |
| `css/base.css` | Reset, typography, buttons base, logo-img |
| `css/layout.css` | Header, hero, sections, footer, service strip |
| `css/components.css` | Modal, materials, gallery, admin-square, responsive |
| `css/home.css` | `@import` chain for the above |

**Verification:** Concatenated split files match original inline CSS byte-for-byte (except `content:url` logo path → `../assets/logos/vedman-logo.png`).

### Other pages

| File | Source |
|------|--------|
| `css/pages.css` | Former `style.css` (unchanged content) |
| `css/panel.css` | Former `vedman-panel.html` inline `<style>` |
| `css/privacy.css` | Former `privacy.html` inline `<style>` |

---

## 5. Import path updates

| Page | Changes |
|------|---------|
| `index.html` | `css/home.css`, `assets/icons/favicon.png`, `assets/logos/vedman-logo.png`, 4× `js/` scripts |
| `vedman-panel.html` | `css/panel.css`, `assets/logos/vedman-logo.png`, `js/panel-app.js` |
| `privacy.html` | `css/privacy.css` |
| `pages/*.html` (9) | `../css/pages.css` (was `../style.css`) |
| `README.md` | Doc links → `docs/` prefix |
| `archive/*` | Relative paths fixed for archived admin |

### Unchanged (by design)

- `firebase-config.js` path in HTML
- All SEO `<meta>`, `<title>`, `<link rel="canonical">` on `index.html` and `pages/*`
- `robots.txt`, `sitemap.xml`
- WhatsApp URLs and phone links
- Gallery Firestore query and panel upload/delete code

---

## 6. Archived (not deleted)

| Item | Location |
|------|----------|
| Legacy admin UI | `archive/legacy-admin/admin/` |
| `admin.html` | `archive/admin.html` |
| `app.js` | `archive/app.js` |
| Firebase 10.8.0 module | `archive/firebase-legacy/firebase.js` |
| 30 root JPEGs | `archive/orphan-images/` |

---

## 7. Verification (static)

| Check | Result |
|-------|--------|
| Homepage CSS equivalent to pre-refactor inline | **Pass** (byte match) |
| `index.html` script load order preserved | **Pass** |
| `firebase-config.js` at root, unchanged | **Pass** |
| Panel Auth/RBAC code only relocated | **Pass** (diff = path extraction) |
| `gallery-firebase.js` logic unchanged | **Pass** |
| SEO meta/canonical on `index.html` | **Pass** (untouched) |
| `pages/*` titles/descriptions | **Pass** (untouched) |
| `sitemap.xml` / `robots.txt` | **Pass** (untouched) |
| Production pages exist | **Pass** (index, panel, privacy, 9 pages) |

### Automated smoke tests (local `python3 -m http.server 8765`)

| Check | Result |
|-------|--------|
| All 12 HTML pages return HTTP 200 | **Pass** |
| All CSS/JS/assets return HTTP 200 | **Pass** |
| `index.html` — `VEDMAN_CATALOG`, `fillMain`, `loadGallery`, `loadFirebaseGallery` defined | **Pass** |
| `vedman-panel.html` — login form renders | **Pass** |
| `pages/grants.html` — styled stub renders | **Pass** |

### Manual browser tests (recommended before commit)

- [ ] `index.html` — quote modal, WhatsApp send, gallery (Firebase + JSON fallback)
- [ ] `vedman-panel.html` — login, upload, delete (owner)
- [ ] `privacy.html` — styles load
- [ ] Logo and favicon render on homepage

---

## 8. Constraints compliance

| Rule | Compliance |
|------|------------|
| Do not change website behaviour | **Yes** — logic moved, not rewritten |
| Do not modify Firebase | **Yes** — `firebase-config.js` untouched; gallery/panel Firebase code relocated only |
| Do not modify authentication | **Yes** — `panel-app.js` auth flow identical |
| Do not modify gallery logic | **Yes** |
| Do not change SEO | **Yes** — meta, sitemap, robots unchanged |
| Do not change UI | **Yes** — same CSS rules and HTML structure |
| Archive unused files | **Yes** |
| Commit nothing | **Yes** |
| Push nothing | **Yes** |

---

## 9. Known follow-ups (out of scope)

- P0-3: Unify gallery category enums (`categories.js`)
- P0-4: Consolidate Firebase SDK init module
- P0-5: Update gallery fallback message (`admin.html` → `vedman-panel.html`) — **deferred** (SEO/copy)
- P1: V5 visual redesign (separate milestone)
- Split `panel-app.js` into `js/panel/*` submodules
- HTML components in `components/`

---

## 10. Git state

Many root files show as deleted + new paths untracked. Expected for a move/refactor before staging.

**Also modified (prior work, uncommitted):** `FIREBASE_RULES.txt` (Firestore `userPath()` syntax fix).

**Untracked at root (if present):** `VALIDATION_CHECKLIST.md`, `FINAL_PHASE_C_APPROVAL.md` — not moved to `docs/` in this pass.

---

## Approval checklist

- [ ] Review folder layout
- [ ] Run manual browser tests (§7)
- [ ] Approve commit scope
- [ ] Deploy to staging before production

*Awaiting approval.*
