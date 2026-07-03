# VEDMAN V5 — Phase 1A Cleanup Report

**Branch:** `v5-dev`  
**Date:** 2026-07-03  
**Phase:** 1A — Safe repository cleanup only  
**Reference:** `DEPENDENCY_REPORT.md`

---

## Scope

Phase 1A performed **non-destructive production cleanup**:

- Archived legacy HTML snapshot
- Removed stale duplicate SEO documentation (not served in production)
- Removed one byte-identical duplicate logo file

**Explicitly not changed:**

- `index.html`, `gallery.json`, `firebase-config.js` — untouched
- `app.js` — kept in place
- All `.jpeg` images — kept in place
- All production assets (`favicon.png`, `vedman-logo.png`, etc.) — kept in place

---

## Production impact assessment

| Production path | Status |
|-----------------|--------|
| `/` (`index.html`) | Unchanged |
| `/vedman-panel.html` | Unchanged |
| `/firebase-config.js` | Unchanged |
| `/gallery.json` | Unchanged |
| `/robots.txt` | Unchanged (authoritative root file kept) |
| `/sitemap.xml` | Unchanged (authoritative root file kept) |
| `/favicon.png`, `/vedman-logo.png` | Unchanged |
| All root `*.jpeg` gallery images | Unchanged |

**Expected production behavior change:** None.

---

## Actions performed

### 1. Archived `backup-v1/` → `archive/backup-v1/`

Moved 11 files (git rename). No production file referenced this folder.

| From | To |
|------|-----|
| `backup-v1/asfalts.html` | `archive/backup-v1/asfalts.html` |
| `backup-v1/galerija.html` | `archive/backup-v1/galerija.html` |
| `backup-v1/grants.html` | `archive/backup-v1/grants.html` |
| `backup-v1/koks.html` | `archive/backup-v1/koks.html` |
| `backup-v1/kontakti.html` | `archive/backup-v1/kontakti.html` |
| `backup-v1/manipulators.html` | `archive/backup-v1/manipulators.html` |
| `backup-v1/nav.js` | `archive/backup-v1/nav.js` |
| `backup-v1/par-mums.html` | `archive/backup-v1/par-mums.html` |
| `backup-v1/skembas.html` | `archive/backup-v1/skembas.html` |
| `backup-v1/smilts.html` | `archive/backup-v1/smilts.html` |
| `backup-v1/vedman_v2.html` | `archive/backup-v1/vedman_v2.html` |

**Note:** Archived HTML still references root `.jpeg` files by sibling path (e.g. `src="skemba1.jpeg"`). Those images remain at repo root for future migration phases.

---

### 2. Removed duplicate documentation

Removed stale SEO copies that were **not** served at production paths (`/robots.txt`, `/sitemap.xml`). Root SEO files were kept.

| File removed | Reason | MD5 / notes |
|--------------|--------|-------------|
| `seo/robots.txt` | Duplicate SEO doc; pointed to `mainamies.lv` | Not used by production |
| `seo/sitemap.xml` | Duplicate sitemap; superseded by root `sitemap.xml` | Listed `/pages/` URLs but never linked from live site |

Empty `seo/` directory removed after file deletion.

---

### 3. Removed byte-identical duplicate logo

Verified with `cmp` before removal:

| File removed | Kept copy | MD5 (both identical) |
|--------------|-----------|----------------------|
| `vedman-logo-final.png` (root) | `assets/vedman-logo-final.png` | `13157014238e3a90a60ff1a6b0be9faa` |

**Not removed (not byte-identical or in production use):**

| File | Reason kept |
|------|-------------|
| `vedman-logo.png` | Production logo — `index.html`, `vedman-panel.html` |
| `vedman-logo-footer.png` | Different file (MD5 `9f8a707e…`); not byte-identical |
| `favicon.png` | Production favicon — `index.html` |
| `assets/favicon.png` | Different file (MD5 `7f078233…`); not byte-identical |

---

## Complete change list (14 paths)

| Action | Path |
|--------|------|
| MOVED | `backup-v1/asfalts.html` → `archive/backup-v1/asfalts.html` |
| MOVED | `backup-v1/galerija.html` → `archive/backup-v1/galerija.html` |
| MOVED | `backup-v1/grants.html` → `archive/backup-v1/grants.html` |
| MOVED | `backup-v1/koks.html` → `archive/backup-v1/koks.html` |
| MOVED | `backup-v1/kontakti.html` → `archive/backup-v1/kontakti.html` |
| MOVED | `backup-v1/manipulators.html` → `archive/backup-v1/manipulators.html` |
| MOVED | `backup-v1/nav.js` → `archive/backup-v1/nav.js` |
| MOVED | `backup-v1/par-mums.html` → `archive/backup-v1/par-mums.html` |
| MOVED | `backup-v1/skembas.html` → `archive/backup-v1/skembas.html` |
| MOVED | `backup-v1/smilts.html` → `archive/backup-v1/smilts.html` |
| MOVED | `backup-v1/vedman_v2.html` → `archive/backup-v1/vedman_v2.html` |
| REMOVED | `seo/robots.txt` |
| REMOVED | `seo/sitemap.xml` |
| REMOVED | `vedman-logo-final.png` (root duplicate) |

---

## Files intentionally unchanged

- All production HTML/JS/JSON listed in constraints
- `app.js`
- All 30 root `*.jpeg` images
- `admin/`, `admin.html`, `pages/`, `firebase/`
- Root `robots.txt`, `sitemap.xml`, `CNAME`, `README.md`, Firebase rules docs

---

## Next phases (not executed)

- Archive `admin/`, legacy admin HTML, unused `assets/` design references
- JPEG migration to Firebase before any image removal
- SEO consolidation into root `sitemap.xml`
- UI / code refactors

---

**Phase 1A complete. Awaiting approval for Phase 1B or later.**
