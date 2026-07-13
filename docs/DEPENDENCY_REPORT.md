# VEDMAN V5 — Dependency Verification Report

**Phase:** 0.5 — Dependency verification  
**Branch:** `v5-dev`  
**Audit date:** 2026-07-03  
**Method:** Full-repository text search (79 auditable files). Planning docs (`CLEANUP_PLAN.md`) excluded from referrer counts.  
**Status:** Analysis only — no files modified or deleted.

---

## Methodology

For each auditable file we searched all other repo files for:
- Static references: `href=`, `src=`, `link rel=`, `script src=`, CSS `url()`, `@import`
- Dynamic references: `fetch()`, ES `import`, `location.href`, template literals (`${i.src}`, `${i.url}`)
- Cross-folder relative paths (`../style.css`, `../firebase/firebase.js`)

**Production referrer** = any referrer outside `backup-v1/`, `admin/`, root `admin.html`, and markdown docs.

**Entry point** = file served directly by URL even if no inbound repo reference (e.g. `robots.txt`).

---

## Summary

| Metric | Count |
|--------|-------|
| Auditable files | 79 |
| Files with zero inbound repo refs | 38 |
| Files with zero production inbound refs | 62 |
| Orphan JS (`app.js`) | 0 importers confirmed |

---

## Priority targets (requested verification)

### `index.html`

| Field | Value |
|-------|-------|
| Referenced? | **Yes** — production entry point + inbound links |
| Referenced by | `vedman-panel.html:27` (href), all 9 `pages/*.html` (href `../index.html`), `admin.html:7` (href) |
| Dynamically loaded? | **No** — served as document entry point |
| Safe to delete? | **No** |
| Safe to archive? | **No** |
| Risk | **Critical** |

**Outbound dependencies (loads at runtime):**

| Target | Load type | Line(s) |
|--------|-----------|---------|
| `favicon.png` | static `<link rel="icon">` | 9 |
| `vedman-logo.png` | static `<img src>` + CSS `content:url()` | 508, 561, 672 |
| `privacy.html` | static `<a href>` | 568 |
| `vedman-panel.html` | static `<a href>` (admin square) | 679 |
| `firebase-config.js` | static `<script src>` | 862 |
| `gallery.json` | **dynamic `fetch()`** | 843 |
| Firebase CDN modules | **dynamic ES `import`** | 864–865 |
| Firebase Storage URLs | **dynamic template** `${i.url}` in gallery | 887 |
| `gallery.json` item paths | **dynamic template** `${i.src}` (fallback mode) | 850 |

**Does NOT load:** `style.css`, `app.js`, any root `.jpeg`, `manifest.json`.

### `style.css`

| Field | Value |
|-------|-------|
| Referenced? | **Yes** |
| Referenced by | `pages/grants.html:7`, `pages/kontakti.html:7`, `pages/manipulators.html:7`, `pages/materiali.html:7`, `pages/melnzeme.html:7`, `pages/objekti.html:7`, `pages/pakalpojumi.html:7`, `pages/skembas.html:7`, `pages/smilts.html:7`, `admin/login.html:1`, `admin/admin.html:1` |
| Dynamically loaded? | **No** — static `<link rel="stylesheet">` only |
| Safe to delete? | **No** — breaks all `pages/` and `admin/` UIs |
| Safe to archive? | **No** |
| Risk | **Medium** (not used by live homepage) |

**Note:** `index.html` uses fully inline CSS — no reference to `style.css`. `backup-v1/*.html` reference missing `css/style.css` (file not in repo).

### `app.js`

| Field | Value |
|-------|-------|
| Referenced? | **No** |
| Referenced by | *(none — searched for `src="app.js"`, `import "app.js"`, `fetch("app.js"`)* |
| Dynamically loaded? | **No** |
| Safe to delete? | **Yes** — orphan; logic duplicated inline in `index.html:708–835` |
| Safe to archive? | **Yes** |
| Risk | **Low** |

**False-positive note:** `firebase-app.js` CDN URLs contain substring `app.js` but are not imports of `./app.js`.

### `firebase-config.js`

| Field | Value |
|-------|-------|
| Referenced? | **Yes** |
| Referenced by | `index.html:862` (`<script src="firebase-config.js?v=101">`), `vedman-panel.html:79` (`<script src="/firebase-config.js?v=500">`), `README.md:9,23` (docs) |
| Dynamically loaded? | **No** — static script tag; exposes `window.VEDMAN_FIREBASE_CONFIG` |
| Safe to delete? | **No** |
| Safe to archive? | **No** |
| Risk | **Critical** |

### `gallery.json`

| Field | Value |
|-------|-------|
| Referenced? | **Yes** |
| Referenced by | `index.html:843` (**dynamic `fetch("gallery.json?v=101")`**), `index.html:655,855` (UI text), `admin.html:9,15,22,24,40` (legacy admin workflow) |
| Dynamically loaded? | **Yes** — fetched when Firebase gallery unavailable |
| Safe to delete? | **No** — fallback data for gallery |
| Safe to archive? | **No** |
| Risk | **Critical** |

### `vedman-panel.html`

| Field | Value |
|-------|-------|
| Referenced? | **Yes** |
| Referenced by | `index.html:679` (admin link), `robots.txt:3` (Disallow), `README.md:4,11` (docs) |
| Dynamically loaded? | **No** — direct navigation entry point |
| Safe to delete? | **No** |
| Safe to archive? | **No** |
| Risk | **Critical** |

**Outbound dependencies:**

| Target | Load type | Line(s) |
|--------|-----------|---------|
| `vedman-logo.png` | static `<img src>` | 14, 26 |
| `index.html` | static `<a href>` | 27 |
| `/firebase-config.js` | static `<script src>` | 79 |
| Firebase CDN (Storage + Firestore) | **dynamic ES `import`** | 82–84 |
| Uploaded media URLs | **dynamic template** `${i.url}` | 319–320 |

---

## Folder verification

### `admin/`

| File | Referenced? | Referenced by | Dynamic? | Safe delete? | Safe archive? | Risk |
|------|-------------|---------------|----------|--------------|---------------|------|
| `admin/login.html` | No inbound refs | Entry: user navigates to /admin/login.html | No | Yes — superseded | Yes | Low |
| `admin/login.js` | No inbound refs* | Loaded by login.html `<script type="module" src="login.js">` | static import | Yes — superseded | Yes | Low |
| `admin/admin.html` | No inbound refs* | login.js:11 `location.href = admin.html` (relative → admin/admin.html) | dynamic navigation | Yes — superseded | Yes | Low |
| `admin/admin.js` | No inbound refs* | Loaded by admin/admin.html `<script type="module" src="admin.js">` | static import | Yes — superseded | Yes | Low |

**Dependency chain:** `login.html` → `login.js` → `firebase/firebase.js` → (on success) → `admin.html` → `admin.js` → `firebase/firebase.js`

**Production links:** None from `index.html` (links to `vedman-panel.html` instead).

### `pages/`

| File | Referenced? | Referenced by | Dynamic? | Safe delete? | Safe archive? | Risk |
|------|-------------|---------------|----------|--------------|---------------|------|
| `pages/grants.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |
| `pages/kontakti.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |
| `pages/manipulators.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |
| `pages/materiali.html` | No | *(no inbound refs)* | No | Review — not in seo/sitemap.xml | Yes — with SEO plan | Medium |
| `pages/melnzeme.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |
| `pages/objekti.html` | No | *(no inbound refs)* | No | Review — not in seo/sitemap.xml | Yes — with SEO plan | Medium |
| `pages/pakalpojumi.html` | No | *(no inbound refs)* | No | Review — not in seo/sitemap.xml | Yes — with SEO plan | Medium |
| `pages/skembas.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |
| `pages/smilts.html` | Yes | seo/sitemap.xml (URL listing) | No | No — may be indexed | Yes — with SEO plan | Medium |

**Note:** `index.html` does not link to `/pages/` — subpages are standalone SEO stubs.

### `assets/`

| File | Referenced? | Referenced by | Dynamic? | Safe delete? | Safe archive? | Risk |
|------|-------------|---------------|----------|--------------|---------------|------|
| `assets/favicon.png` | **No** | *(none)* | No | Yes | Yes | Low |
| `assets/vedman-logo-final.png` | **No** | *(none)* | No | Yes — duplicate of root `vedman-logo-final.png` | Yes | Low |
| `assets/images/design-c-reference.png` | **No** | *(none)* | No | Yes | Yes | Low |
| `assets/images/hero-reference.png` | **No** | *(none)* | No | Yes | Yes | Low |

### `backup-v1/`

No production file links into `backup-v1/`. Internal dependencies only.

| File | Referenced? | Referenced by | Dynamic? | Safe delete? | Safe archive? | Risk |
|------|-------------|---------------|----------|--------------|---------------|------|
| `backup-v1/asfalts.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/galerija.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/grants.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/koks.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/kontakti.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/manipulators.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/nav.js` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/par-mums.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/skembas.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/smilts.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |
| `backup-v1/vedman_v2.html` | No | *(no inbound refs — orphan within backup)* | No | Yes — after archive | Yes | Low |

**Broken dependencies inside backup:** all HTML files reference missing `css/style.css` and `js/nav.js` (actual file is `backup-v1/nav.js`, not `js/nav.js`). Root `.jpeg` files referenced as sibling paths (`src="skemba1.jpeg"`).

---

## Full file inventory

| File | Ref? | Prod ref? | Referenced by (production) | Load type | Safe delete? | Safe archive? | Risk |
|------|------|-----------|----------------------------|-----------|--------------|---------------|------|
| `CNAME` | Yes | Yes | GitHub Pages custom domain config | entry-point | No | No | Critical |
| `FIREBASE_RULES.txt` | No | No | README.md (manual Firebase Console deployment) | — | No — operational docs | No | Medium |
| `FIREBASE_RULES_SECURE_NEXT.txt` | No | No | Planned rules — no code refs | — | No — operational docs | No | Medium |
| `admin.html` | Yes | Yes | index.html:855 | dynamic-navigation, text-reference | Yes — superseded by vedman-panel.html | Yes | Medium |
| `admin/admin.html` | No | No | — | — | Yes — superseded by vedman-panel.html | Yes | Low |
| `admin/admin.js` | No | No | — | — | Yes — superseded by vedman-panel.html | Yes | Low |
| `admin/login.html` | No | No | — | — | Yes — superseded by vedman-panel.html | Yes | Low |
| `admin/login.js` | No | No | — | — | Yes — superseded by vedman-panel.html | Yes | Low |
| `app.js` | No | No | — | — | Yes — orphan (0 script imports) | Yes | Low |
| `assets/favicon.png` | No | No | — | — | Yes — 0 production refs | Yes | Low |
| `assets/images/design-c-reference.png` | No | No | — | — | Yes — 0 refs | Yes | Low |
| `assets/images/hero-reference.png` | No | No | — | — | Yes — 0 refs | Yes | Low |
| `assets/vedman-logo-final.png` | No | No | — | — | Yes — 0 production refs | Yes | Low |
| `backup-v1/asfalts.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/galerija.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/grants.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/koks.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/kontakti.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/manipulators.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/nav.js` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/par-mums.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/skembas.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/smilts.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `backup-v1/vedman_v2.html` | No | No | — | — | Yes — after archive | Yes | Low |
| `favicon.png` | Yes | Yes | index.html:9 | static | No | Review | Critical |
| `firebase-config.js` | Yes | Yes | index.html:862, vedman-panel.html:75, vedman-panel.html:79 (+2 more) | static, text-reference | No | No | Critical |
| `firebase/firebase.js` | Yes | No | — | dynamic-import | Yes — superseded by vedman-panel.html | Yes | Low |
| `gallery.json` | Yes | Yes | index.html:655, index.html:843, index.html:855 | dynamic-fetch, static, text-reference | No | No | Critical |
| `granst.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `grants6.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `index.html` | Yes | Yes | pages/grants.html:10, pages/grants.html:11, pages/kontakti.html:10 (+16 more) | entry-point | No | No | Critical |
| `koku stadisana1.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `lapas.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manifest.json` | Yes | Yes | PWA manifest — not linked in HTML; may be requested at /manifest.json | entry-point | Review | No | Medium |
| `manipul1.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manipul12.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `manipul2.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manipul4.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manipul5.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manipul6.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `manipul7.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `melnz1.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `melnz10.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `melnz11.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `melnz12.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `melnz2.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `melnz3.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `melnz5.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `melnz9.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `pages/grants.html` | Yes | Yes | seo/sitemap.xml:5 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/kontakti.html` | Yes | Yes | seo/sitemap.xml:9 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/manipulators.html` | Yes | Yes | seo/sitemap.xml:8 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/materiali.html` | No | No | — | — | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/melnzeme.html` | Yes | Yes | seo/sitemap.xml:6 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/objekti.html` | No | No | — | — | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/pakalpojumi.html` | No | No | — | — | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/skembas.html` | Yes | Yes | seo/sitemap.xml:4 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `pages/smilts.html` | Yes | Yes | seo/sitemap.xml:7 | text-reference | No — URLs in seo/sitemap.xml; may be indexed | Yes — with SEO plan | Medium |
| `privacy.html` | Yes | Yes | index.html:568 | entry-point | No | No | Critical |
| `robots.txt` | Yes | Yes | Served at /robots.txt (GitHub Pages root) | entry-point | No | No | Critical |
| `seo/robots.txt` | No | No | — | — | Yes — stale; not served at root path | Yes | Low |
| `seo/sitemap.xml` | Yes | Yes | seo/robots.txt:3 | text-reference | Yes — stale; not served at root path | Yes | Low |
| `sitemap.xml` | Yes | Yes | robots.txt:4, seo/robots.txt:3 | entry-point | No | No | Critical |
| `skemba1.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `skembas4.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `skembas77.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `stikls2.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `style.css` | Yes | Yes | pages/grants.html:7, pages/kontakti.html:7, pages/manipulators.html:7 (+6 more) | static | No | No | Medium |
| `transp1.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `transp5.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `transp9.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `vedman-logo-final.png` | No | No | — | — | Yes — 0 production refs | Yes | Low |
| `vedman-logo-footer.png` | No | No | — | — | Yes — 0 production refs | Yes | Low |
| `vedman-logo.png` | Yes | Yes | index.html:508, index.html:557, index.html:561 (+3 more) | dynamic-css, static, text-reference | No | Review | Critical |
| `vedman-panel.html` | Yes | Yes | index.html:679, robots.txt:3 | entry-point | No | No | Critical |
| `zari1.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `zari2.jpeg` | Yes | No | — | static, text-reference | Yes — after archive / Firebase migration | Yes | Low |
| `zari7.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |
| `zari8.jpeg` | No | No | — | — | Yes — after archive / Firebase migration | Yes | Low |

---

## Root JPEG dependency matrix

| File | Total refs | backup-v1 refs | Production refs | Referenced by | Safe delete? | Risk |
|------|------------|----------------|-----------------|---------------|--------------|------|
| `granst.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/grants.html | Yes — after archive | Low |
| `grants6.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/grants.html | Yes — after archive | Low |
| `koku stadisana1.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `lapas.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `manipul1.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `manipul12.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `manipul2.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `manipul4.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `manipul5.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/par-mums.html | Yes — after archive | Low |
| `manipul6.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/par-mums.html | Yes — after archive | Low |
| `manipul7.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `melnz1.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `melnz10.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `melnz11.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `melnz12.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `melnz2.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `melnz3.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `melnz5.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `melnz9.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `skemba1.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/skembas.html | Yes — after archive | Low |
| `skembas4.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/skembas.html | Yes — after archive | Low |
| `skembas77.jpeg` | 4 | 4 | 0 | backup-v1/galerija.html, backup-v1/skembas.html | Yes — after archive | Low |
| `stikls2.jpeg` | 2 | 2 | 0 | backup-v1/galerija.html | Yes — after archive | Low |
| `transp1.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/par-mums.html | Yes — after archive | Low |
| `transp5.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `transp9.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/smilts.html | Yes — after archive | Low |
| `zari1.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `zari2.jpeg` | 3 | 3 | 0 | backup-v1/galerija.html, backup-v1/manipulators.html | Yes — after archive | Low |
| `zari7.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |
| `zari8.jpeg` | 0 | 0 | 0 | — | Yes — after archive | Low |

---

## Firebase files

| File | Referenced? | Referenced by | Dynamic? | Safe delete? | Safe archive? | Risk |
|------|-------------|---------------|----------|--------------|---------------|------|
| `firebase-config.js` | Yes | `index.html:862`, `vedman-panel.html:79` | static script | No | No | Critical |
| `firebase/firebase.js` | Yes | `admin/admin.js:1`, `admin/login.js:1` | ES module import | Yes — breaks admin/ only | Yes | Low |
| `FIREBASE_RULES.txt` | No code refs | `README.md:10` (manual ops) | — | No | No | Medium |
| `FIREBASE_RULES_SECURE_NEXT.txt` | No refs | — | — | No | No | Low |

---

## SEO files

| File | Served at | Referenced by | Safe delete? | Risk |
|------|-----------|---------------|--------------|------|
| `robots.txt` (root) | `/robots.txt` | Entry point; links `sitemap.xml` | No | Critical |
| `sitemap.xml` (root) | `/sitemap.xml` | `robots.txt:4` | No | Critical |
| `seo/robots.txt` | `/seo/robots.txt` only if requested | *(none in production)* | Yes — wrong domain | Low |
| `seo/sitemap.xml` | `/seo/sitemap.xml` only if requested | `seo/robots.txt:3` | Yes — superseded | Low |

---

## Findings requiring approval before cleanup

1. **`app.js`** — confirmed orphan (0 importers). Safe to archive.
2. **30 root JPEGs** — 0 production refs; 22 used only by `backup-v1/`; 8 completely unreferenced.
3. **`admin/` + `admin.html`** — superseded by `vedman-panel.html`; still mentioned in `index.html:855` error text.
4. **`style.css`** — required by `pages/` and `admin/` but not by live homepage.
5. **`pages/materiali.html`, `pages/objekti.html`, `pages/pakalpojumi.html`** — no inbound refs; not listed in `seo/sitemap.xml`.
6. **`assets/*`** — 4 files, 0 production references.
7. **Duplicate logos** — `vedman-logo-final.png`, `vedman-logo-footer.png`, `assets/vedman-logo-final.png` unused in HTML.

---

**No files were modified or deleted during this audit.**

**Awaiting approval before Phase 1 (archive moves).**