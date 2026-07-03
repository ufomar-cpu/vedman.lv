# VEDMAN V5 — Master Roadmap

**Branch:** `v5-dev`  
**Baseline:** V4 production (Firebase gallery, single-page `index.html`)  
**Planning inputs:** `PROJECT_MAP.md`, `DEPENDENCY_REPORT.md`, `CLEANUP_PHASE1_REPORT.md`  
**Completed:** Phase 0 (audit), Phase 0.5 (dependencies), Phase 1A (safe archive)  
**Date:** 2026-07-03

---

## Executive summary

VEDMAN V5 evolves a static GitHub Pages site from a monolithic V4 homepage into a **secure, unified, SEO-ready, mobile-first** product. Production today depends on three critical paths: `index.html`, `vedman-panel.html`, and `firebase-config.js`.

This roadmap splits **remaining work** into nine priority bands (P0–P8), each with scoped tasks. **Security and architecture come before UI redesign.** Business value (leads via WhatsApp) must not break at any milestone.

### Guiding principles

1. **No big-bang rewrite** — ship incrementally on `v5-dev`, merge when milestone-tested.
2. **Firebase-first gallery** — retire JSON/GitHub gallery workflow after migration verified.
3. **One design system** — merge inline `index.html` CSS and `style.css` during P1, not before P0 security.
4. **Docs before deletes** — archive legacy code; JPEG removal only after Firebase upload.

### Complexity scale

| Score | Meaning |
|-------|---------|
| 1 | Few hours; single file; low regression risk |
| 2 | 1–2 days; 2–4 files; isolated feature |
| 3 | 3–5 days; cross-file; needs testing |
| 4 | 1–2 weeks; architectural; staging required |
| 5 | Multi-week; redesign or infra; high coordination |

---

## Global execution order (recommended)

```
P0 → P5 + P6 (parallel where possible) → P1 → P7 → P2 → P3 → P4 → P1B cleanup → P8
```

| Order | ID | Rationale |
|-------|-----|-----------|
| 1 | P0-1 … P0-5 | Foundation before UI |
| 2 | P5-1 … P5-4, P6-1 … P6-6 | Close critical security gaps immediately |
| 3 | P0-6, P1B | Finish repo hygiene after architecture decisions |
| 4 | P1, P7 | Visual + mobile pass on unified codebase |
| 5 | P2, P3 | Revenue and discovery |
| 6 | P4 | Optimize after features stable |
| 7 | P8 | Optional enhancements |

---

## P0 — Critical Architecture

Foundation work that unblocks all other phases. **No visual redesign yet.**

### P0-1 — Define V5 folder structure

| Field | Detail |
|-------|--------|
| **Description** | Document and create target layout: `assets/`, `js/`, `css/`, `pages/`, `archive/`, shared modules. Align with GitHub Pages paths. |
| **Files affected** | New dirs; docs; future moves from root |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — faster dev, fewer broken paths |
| **Dependencies** | Phase 1A complete ✓ |
| **Execution order** | **1** |

### P0-2 — Extract shared JavaScript modules

| Field | Detail |
|-------|--------|
| **Description** | Move inline `index.html` logic (quote modal, gallery loader, material `DATA`) into `js/` modules. Keep behavior identical. |
| **Files affected** | `index.html`, new `js/quote.js`, `js/gallery.js`, `js/catalog.js` |
| **Complexity** | 4 |
| **Risk** | High — regression on quote + gallery |
| **Business value** | High — maintainability, testability |
| **Dependencies** | P0-1 |
| **Execution order** | **3** |

### P0-3 — Unify category enums

| Field | Detail |
|-------|--------|
| **Description** | Single source of truth for gallery categories across `gallery.json`, `index.html` Firebase tabs, `vedman-panel.html` `CATEGORIES`. |
| **Files affected** | `gallery.json`, `index.html`, `vedman-panel.html`, new `js/categories.js` or JSON |
| **Complexity** | 2 |
| **Risk** | Medium |
| **Business value** | Medium — fewer filter mismatches |
| **Dependencies** | P0-2 (optional parallel if careful) |
| **Execution order** | **4** |

### P0-4 — Consolidate Firebase SDK usage

| Field | Detail |
|-------|--------|
| **Description** | Standardize on Firebase JS **10.12.5** everywhere; retire `firebase/firebase.js` (10.8.0 + XXXX). Shared init module reading `firebase-config.js`. |
| **Files affected** | `firebase/firebase.js`, `admin/*`, `index.html`, `vedman-panel.html`, new `js/firebase-init.js` |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | Medium — one SDK, fewer bugs |
| **Dependencies** | P6-2 (auth module) |
| **Execution order** | **5** |

### P0-5 — Fix gallery fallback messaging

| Field | Detail |
|-------|--------|
| **Description** | Update `index.html:855` error text from `admin.html` → `vedman-panel.html`. Decide fate of JSON fallback (`gallery.json` empty). |
| **Files affected** | `index.html` (text only) |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Low — operator clarity |
| **Dependencies** | None |
| **Execution order** | **2** |

### P0-6 — Phase 1B repository cleanup

| Field | Detail |
|-------|--------|
| **Description** | Archive `admin/`, `admin.html`, `app.js`, unused assets (`vedman-logo-footer.png`, design refs), pick canonical favicon. **Do not remove JPEGs yet.** |
| **Files affected** | `admin/`, `admin.html`, `app.js`, `assets/*`, `archive/` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Low — repo clarity |
| **Dependencies** | P6-4 (confirm panel replaces legacy admin) |
| **Execution order** | **8** |

---

## P1 — UX/UI

Visual and interaction redesign. **Starts after P0 extract + P5/P6 security baseline.**

### P1-1 — V5 design system (tokens + components)

| Field | Detail |
|-------|--------|
| **Description** | Define CSS variables, typography, buttons, cards matching brand (green/gold). Reference `assets/images/*-reference.png`. |
| **Files affected** | New `css/v5-tokens.css`, `css/v5-components.css` |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | High — professional trust |
| **Dependencies** | P0-1 |
| **Execution order** | **9** |

### P1-2 — Homepage layout refresh

| Field | Detail |
|-------|--------|
| **Description** | Rebuild `index.html` sections (hero, materials, services, gallery, footer) using external CSS; replace CSS gradient placeholders with real photos where approved. |
| **Files affected** | `index.html`, `css/v5-*.css`, `assets/images/` |
| **Complexity** | 5 |
| **Risk** | High |
| **Business value** | Very high — conversion |
| **Dependencies** | P1-1, P0-2 |
| **Execution order** | **11** |

### P1-3 — Unify `pages/` with homepage design

| Field | Detail |
|-------|--------|
| **Description** | Replace placeholder SEO stubs with V5 header/footer/components; retire standalone `style.css` V2.5 look or merge into V5 system. |
| **Files affected** | `pages/*.html`, `style.css` → `css/v5-pages.css` |
| **Complexity** | 4 |
| **Risk** | Medium |
| **Business value** | High — consistent brand |
| **Dependencies** | P1-1, P3-2 (content) |
| **Execution order** | **15** |

### P1-4 — Quote modal UX polish

| Field | Detail |
|-------|--------|
| **Description** | Validation (phone, material required), clearer steps, progress indicator, preserve WhatsApp handoff. |
| **Files affected** | `js/quote.js`, `index.html` modal markup, CSS |
| **Complexity** | 2 |
| **Risk** | Medium — lead flow |
| **Business value** | Very high — fewer abandoned quotes |
| **Dependencies** | P0-2 |
| **Execution order** | **10** |

### P1-5 — Gallery UI (skeleton, lightbox, empty states)

| Field | Detail |
|-------|--------|
| **Description** | Loading skeletons, optional lightbox, improved empty/error states for Firebase failures. |
| **Files affected** | `js/gallery.js`, `index.html` `#galerija`, CSS |
| **Complexity** | 3 |
| **Risk** | Low |
| **Business value** | Medium — credibility |
| **Dependencies** | P0-2, P6-3 |
| **Execution order** | **12** |

### P1-6 — Panel UI alignment

| Field | Detail |
|-------|--------|
| **Description** | Restyle `vedman-panel.html` to match V5 admin aesthetic; extract inline CSS. |
| **Files affected** | `vedman-panel.html`, `css/v5-admin.css` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Low — operator experience |
| **Dependencies** | P1-1, P6-1 |
| **Execution order** | **14** |

---

## P2 — Business Features

Revenue and operations features beyond visual polish.

### P2-1 — Expand material catalog

| Field | Detail |
|-------|--------|
| **Description** | Sync `DATA` / `MATERIAL_CATALOG` with full product list (granīts, būvgruži, oļi, kūtsmēsli, etc.) from `app.js` orphan + business input. |
| **Files affected** | `js/catalog.js`, `index.html` material cards |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | High — more quote types |
| **Dependencies** | P0-2 |
| **Execution order** | **16** |

### P2-2 — CTA and conversion analytics

| Field | Detail |
|-------|--------|
| **Description** | Wire `trackEvent` for quote open/submit, phone, WhatsApp clicks (GA4 / Meta Pixel if approved). |
| **Files affected** | `js/analytics.js`, `index.html`, `pages/*.html` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | High — measure marketing |
| **Dependencies** | P0-2 |
| **Execution order** | **17** |

### P2-3 — Legacy JPEG → Firebase migration

| Field | Detail |
|-------|--------|
| **Description** | Bulk upload 22+ archived-referenced JPEGs via panel; tag categories; verify on homepage gallery. |
| **Files affected** | Firebase Storage/Firestore; optional migration script; root `*.jpeg` |
| **Complexity** | 3 |
| **Risk** | Medium — content quality |
| **Business value** | High — gallery populated offline |
| **Dependencies** | P6-1, P6-3 |
| **Execution order** | **13** |

### P2-4 — WhatsApp message templates by segment

| Field | Detail |
|-------|--------|
| **Description** | Pre-filled messages per material/service with UTM-aware deep links for campaigns. |
| **Files affected** | `js/quote.js`, marketing params in URL |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — campaign attribution |
| **Dependencies** | P2-2 |
| **Execution order** | **18** |

### P2-5 — Privacy and legal completeness

| Field | Detail |
|-------|--------|
| **Description** | Add AMAPU SIA rekvizīti, data controller info, cookie notice if analytics added. |
| **Files affected** | `privacy.html`, optional `cookie-banner.js` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Medium — compliance |
| **Dependencies** | P2-2 (if cookies) |
| **Execution order** | **19** |

---

## P3 — SEO

Discovery and indexing improvements.

### P3-1 — Sitemap expansion

| Field | Detail |
|-------|--------|
| **Description** | Add all live `/pages/*.html` URLs + future content pages to root `sitemap.xml` with `lastmod`. |
| **Files affected** | `sitemap.xml` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Medium — indexing |
| **Dependencies** | P3-2 (real content preferred) |
| **Execution order** | **20** |

### P3-2 — SEO subpage content

| Field | Detail |
|-------|--------|
| **Description** | Replace placeholder text on 9 `pages/` with unique copy, FAQs, internal links to `index.html` anchors. |
| **Files affected** | `pages/*.html` |
| **Complexity** | 4 |
| **Risk** | Low |
| **Business value** | Very high — long-tail traffic |
| **Dependencies** | P1-3 (design) or content-first draft |
| **Execution order** | **15** (content draft can start earlier) |

### P3-3 — Structured data (JSON-LD)

| Field | Detail |
|-------|--------|
| **Description** | Add `LocalBusiness`, `Service`, `FAQPage` schema on homepage and key landing pages. |
| **Files affected** | `index.html`, `pages/kontakti.html`, `pages/skembas.html`, etc. |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — rich results |
| **Dependencies** | P3-2 |
| **Execution order** | **21** |

### P3-4 — Canonical tags and meta hygiene

| Field | Detail |
|-------|--------|
| **Description** | Add `<link rel="canonical">` to all `pages/`; align titles/descriptions with keyword strategy. |
| **Files affected** | `pages/*.html`, `index.html` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Medium |
| **Dependencies** | P3-2 |
| **Execution order** | **20** |

### P3-5 — Indexing strategy for stubs

| Field | Detail |
|-------|--------|
| **Description** | Until content ready: `noindex` on thin pages OR remove from sitemap. Document decision. |
| **Files affected** | `pages/materiali.html`, `objekti.html`, `pakalpojumi.html`, `robots.txt` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Medium — avoid thin-content penalty |
| **Dependencies** | None |
| **Execution order** | **6** (early guardrail) |

---

## P4 — Performance

Speed and asset optimization after features stabilize.

### P4-1 — Image pipeline (WebP, lazy load, sizes)

| Field | Detail |
|-------|--------|
| **Description** | Ensure gallery uses `loading="lazy"`, `width/height` hints; hero assets as WebP; CDN cache headers via Firebase. |
| **Files affected** | `js/gallery.js`, `assets/images/`, panel upload settings |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — mobile speed |
| **Dependencies** | P2-3, P1-2 |
| **Execution order** | **22** |

### P4-2 — CSS/JS bundling and cache busting

| Field | Detail |
|-------|--------|
| **Description** | Single minified CSS/JS with version query; remove duplicate inline blocks. |
| **Files affected** | `css/*`, `js/*`, `index.html` |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | Medium — LCP, maintainability |
| **Dependencies** | P0-2, P1-2 |
| **Execution order** | **23** |

### P4-3 — Font self-hosting

| Field | Detail |
|-------|--------|
| **Description** | Self-host Inter (subset LV chars) instead of Google Fonts CDN. |
| **Files affected** | `css/v5-tokens.css`, `assets/fonts/`, remove Google `<link>` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Low — privacy + minor perf |
| **Dependencies** | P1-1 |
| **Execution order** | **24** |

### P4-4 — Root JPEG archive after migration

| Field | Detail |
|-------|--------|
| **Description** | Move 30 root JPEGs to `archive/legacy-images/` once Firebase copies verified; ~14 MB repo savings. |
| **Files affected** | `*.jpeg`, `archive/` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Low — deploy speed |
| **Dependencies** | P2-3 |
| **Execution order** | **25** |

### P4-5 — Lighthouse budget CI

| Field | Detail |
|-------|--------|
| **Description** | Add GitHub Action or manual checklist: LCP, CLS, performance score targets. |
| **Files affected** | `.github/workflows/` or `TEST_REPORT.md` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — prevent regressions |
| **Dependencies** | P4-2 |
| **Execution order** | **26** |

---

## P5 — Security

**Highest priority after P0 planning.** Several items are **Critical** per `PROJECT_MAP.md` S1–S3.

### P5-1 — Deploy secure Firebase rules

| Field | Detail |
|-------|--------|
| **Description** | Apply `FIREBASE_RULES_SECURE_NEXT.txt` in Firebase Console: public read, auth-gated write/delete. |
| **Files affected** | Firebase Console; `FIREBASE_RULES.txt` (update to match deployed) |
| **Complexity** | 2 |
| **Risk** | **Critical** if delayed — public write abuse |
| **Business value** | Critical — data integrity |
| **Dependencies** | P6-1 (auth must work before rules) |
| **Execution order** | **6** |

### P5-2 — Remove hardcoded credentials from repo

| Field | Detail |
|-------|--------|
| **Description** | Delete `ADMIN_USER`/`ADMIN_PASS` from `vedman-panel.html` and passwords from `README.md`. |
| **Files affected** | `vedman-panel.html`, `README.md` |
| **Complexity** | 1 |
| **Risk** | **Critical** |
| **Business value** | Critical |
| **Dependencies** | P6-1 |
| **Execution order** | **7** |

### P5-3 — Firebase App Check (optional hardening)

| Field | Detail |
|-------|--------|
| **Description** | Enable App Check for web app to reduce API abuse. |
| **Files affected** | Firebase Console, `js/firebase-init.js` |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | Medium |
| **Dependencies** | P5-1 |
| **Execution order** | **27** |

### P5-4 — CSP and SRI for CDN scripts

| Field | Detail |
|-------|--------|
| **Description** | Content-Security-Policy via meta or GitHub Pages headers; SRI on Firebase CDN if feasible. |
| **Files affected** | `index.html`, `vedman-panel.html`, hosting config |
| **Complexity** | 3 |
| **Risk** | Medium — can break Firebase |
| **Business value** | Medium |
| **Dependencies** | P0-4 |
| **Execution order** | **28** |

### P5-5 — Hide or protect admin entry point

| Field | Detail |
|-------|--------|
| **Description** | Remove footer `.admin-square` from public site OR gate behind auth-only URL bookmark. Keep `robots.txt` disallow. |
| **Files affected** | `index.html`, `robots.txt` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Low — security through obscurity + real auth |
| **Dependencies** | P6-1 |
| **Execution order** | **8** |

---

## P6 — Admin & Firebase

Operational tooling for gallery and content.

### P6-1 — Firebase Authentication for panel

| Field | Detail |
|-------|--------|
| **Description** | Replace `doLogin()` / `sessionStorage` with Firebase Auth (email/password or Google). Protect all write paths. |
| **Files affected** | `vedman-panel.html`, new `js/admin-auth.js`, Firebase Console |
| **Complexity** | 3 |
| **Risk** | **Critical** |
| **Business value** | Critical — secure operations |
| **Dependencies** | P0-4 |
| **Execution order** | **5** |

### P6-2 — Shared Firebase init module

| Field | Detail |
|-------|--------|
| **Description** | Single `initFirebase()` used by gallery read + panel; reads `firebase-config.js`. |
| **Files affected** | `js/firebase-init.js`, `index.html`, `vedman-panel.html` |
| **Complexity** | 2 |
| **Risk** | Medium |
| **Business value** | Medium |
| **Dependencies** | P0-4 |
| **Execution order** | **4** |

### P6-3 — Gallery admin enhancements

| Field | Detail |
|-------|--------|
| **Description** | Edit metadata, reorder, bulk upload progress, category filter in panel. |
| **Files affected** | `vedman-panel.html`, Firestore schema |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | High — content velocity |
| **Dependencies** | P6-1 |
| **Execution order** | **14** |

### P6-4 — Retire legacy admin systems

| Field | Detail |
|-------|--------|
| **Description** | Archive `admin.html`, `admin/`, `firebase/firebase.js` after P6-1 verified. |
| **Files affected** | `admin/*`, `admin.html`, `firebase/firebase.js`, `archive/` |
| **Complexity** | 1 |
| **Risk** | Low |
| **Business value** | Low |
| **Dependencies** | P6-1, P0-6 |
| **Execution order** | **9** |

### P6-5 — Deprecate `gallery.json` fallback

| Field | Detail |
|-------|--------|
| **Description** | After Firebase stable: simplify `loadGallery()` to Firebase-only + friendly offline message; keep JSON schema doc only. |
| **Files affected** | `index.html`, `gallery.json`, `js/gallery.js` |
| **Complexity** | 2 |
| **Risk** | Medium |
| **Business value** | Medium — simpler architecture |
| **Dependencies** | P2-3, P6-3 |
| **Execution order** | **24** |

### P6-6 — Firebase config build pipeline

| Field | Detail |
|-------|--------|
| **Description** | Inject config from env at build time (GitHub Actions secret) instead of committed file if desired. |
| **Files affected** | `firebase-config.js`, CI workflow |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | Low — keys are public anyway |
| **Dependencies** | P0-1 |
| **Execution order** | **29** (optional) |

---

## P7 — Mobile UX

Mobile-specific improvements (site is responsive but V4 has known mobile CSS patches).

### P7-1 — Audit mobile quote flow

| Field | Detail |
|-------|--------|
| **Description** | Test modal on 320–430px; fix qty controls, keyboard overlap, sticky bottom bar conflicts. |
| **Files affected** | `index.html` mobile CSS, `js/quote.js` |
| **Complexity** | 2 |
| **Risk** | Medium |
| **Business value** | Very high — majority mobile traffic |
| **Dependencies** | P1-4 |
| **Execution order** | **12** |

### P7-2 — Touch targets and bottom bar

| Field | Detail |
|-------|--------|
| **Description** | Ensure 44px min tap targets; bottom bar doesn't cover footer CTAs; safe-area insets. |
| **Files affected** | CSS (`env(safe-area-inset-*)`), `index.html` `.bottom-bar` |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | High |
| **Dependencies** | P1-2 |
| **Execution order** | **13** |

### P7-3 — Mobile gallery grid

| Field | Detail |
|-------|--------|
| **Description** | Optimize 2-column grid, swipe-friendly filters, video playback on iOS. |
| **Files affected** | `js/gallery.js`, gallery CSS |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium |
| **Dependencies** | P1-5 |
| **Execution order** | **14** |

### P7-4 — Panel mobile upload

| Field | Detail |
|-------|--------|
| **Description** | Camera roll upload from phone, responsive panel layout for field photo uploads. |
| **Files affected** | `vedman-panel.html`, CSS |
| **Complexity** | 2 |
| **Risk** | Low |
| **Business value** | Medium — on-site uploads |
| **Dependencies** | P6-1 |
| **Execution order** | **15** |

---

## P8 — Future Features

Post-V5 launch backlog. Not required for V5 GA.

### P8-1 — PWA / offline shell

| Field | Detail |
|-------|--------|
| **Description** | Complete `manifest.json` icons, service worker for offline homepage shell. |
| **Files affected** | `manifest.json`, `sw.js`, `index.html` |
| **Complexity** | 3 |
| **Risk** | Medium |
| **Business value** | Low |
| **Dependencies** | P4-2 |
| **Execution order** | **30** |

### P8-2 — Multi-language (LV / RU / EN)

| Field | Detail |
|-------|--------|
| **Description** | i18n layer; reference archived `archive/backup-v1/nav.js` translations. |
| **Files affected** | All HTML, new `js/i18n.js` |
| **Complexity** | 5 |
| **Risk** | High |
| **Business value** | Medium — RU segment |
| **Dependencies** | P0-2, P1-2 |
| **Execution order** | **31** |

### P8-3 — Price estimator (governed)

| Field | Detail |
|-------|--------|
| **Description** | Optional m³ × rate calculator like archived `smilts.html` — **only with approved price table**. |
| **Files affected** | `js/pricing.js`, new config JSON |
| **Complexity** | 4 |
| **Risk** | High — legal/pricing accuracy |
| **Business value** | Medium |
| **Dependencies** | Business approval |
| **Execution order** | **32** |

### P8-4 — Server-side lead capture

| Field | Detail |
|-------|--------|
| **Description** | Optional Cloud Function / Formspree relay instead of WhatsApp-only PII in URLs. |
| **Files affected** | New backend, `js/quote.js` |
| **Complexity** | 4 |
| **Risk** | Medium |
| **Business value** | Medium — CRM integration |
| **Dependencies** | Budget for backend |
| **Execution order** | **33** |

### P8-5 — Customer object portfolio

| Field | Detail |
|-------|--------|
| **Description** | Revive `admin/admin.js` `objects` concept as public `/objekti` case studies fed by Firestore. |
| **Files affected** | `pages/objekti.html`, Firestore `objects`, panel |
| **Complexity** | 4 |
| **Risk** | Medium |
| **Business value** | High — social proof |
| **Dependencies** | P6-3, P3-2 |
| **Execution order** | **34** |

### P8-6 — Video gallery improvements

| Field | Detail |
|-------|--------|
| **Description** | Poster frames, lazy video load, FFmpeg server-side compression note for large MOV. |
| **Files affected** | `vedman-panel.html`, `js/gallery.js` |
| **Complexity** | 3 |
| **Risk** | Low |
| **Business value** | Medium |
| **Dependencies** | P6-3 |
| **Execution order** | **35** |

---

## Milestone plan

Five shippable milestones from `v5-dev` to V5 production merge.

---

### Milestone 1 — **Secure Foundation**

**Goal:** Stop critical security exposure without changing public UI.

| Tasks | Priority IDs |
|-------|----------------|
| Firebase Auth on panel | P6-1 |
| Deploy secure Firestore/Storage rules | P5-1 |
| Remove hardcoded credentials | P5-2 |
| Shared Firebase init | P6-2 |
| Fix gallery fallback message | P0-5 |
| SEO noindex guardrail for thin pages | P3-5 |

**Exit criteria:**
- Panel requires Firebase login; rules deny anonymous writes
- No passwords in source or README
- Smoke test: upload, list, delete, public gallery read

**Estimated duration:** 1–2 weeks  
**Business outcome:** Protected gallery and admin; reduced abuse risk

---

### Milestone 2 — **Architecture & Cleanup**

**Goal:** Maintainable codebase; legacy retired.

| Tasks | Priority IDs |
|-------|----------------|
| V5 folder structure | P0-1 |
| Extract JS modules | P0-2 |
| Unify categories | P0-3 |
| Consolidate Firebase SDK | P0-4 |
| Archive legacy admin + orphans | P0-6, P6-4 |
| Hide admin square (optional) | P5-5 |

**Exit criteria:**
- `index.html` loads external `js/` modules; behavior matches V4
- `admin/`, `admin.html`, `app.js` in `archive/`
- Single category source of truth

**Estimated duration:** 2–3 weeks  
**Business outcome:** Faster V5 feature development; lower bug risk

---

### Milestone 3 — **V5 Experience (UI + Mobile)**

**Goal:** Ship visible V5 redesign and mobile-optimized lead flow.

| Tasks | Priority IDs |
|-------|----------------|
| Design system | P1-1 |
| Quote modal polish | P1-4 |
| Homepage refresh | P1-2 |
| Gallery UI | P1-5 |
| Mobile quote + bottom bar | P7-1, P7-2 |
| Mobile gallery | P7-3 |
| Panel UI | P1-6 |
| JPEG → Firebase migration | P2-3 |

**Exit criteria:**
- Visual sign-off against design references
- Mobile quote flow tested on iOS + Android
- Gallery shows migrated real project photos

**Estimated duration:** 3–4 weeks  
**Business outcome:** Higher trust and conversion; populated portfolio

---

### Milestone 4 — **Growth (SEO + Business)**

**Goal:** Discovery, content, and measurable leads.

| Tasks | Priority IDs |
|-------|----------------|
| SEO subpage content | P3-2 |
| Sitemap + canonicals | P3-1, P3-4 |
| JSON-LD structured data | P3-3 |
| Unified pages design | P1-3 |
| Expanded catalog | P2-1 |
| Analytics | P2-2 |
| Privacy/legal | P2-5 |
| WhatsApp campaign templates | P2-4 |

**Exit criteria:**
- All indexed pages have unique content (>500 words or equivalent)
- `sitemap.xml` lists all public URLs
- Analytics receiving quote + CTA events

**Estimated duration:** 2–3 weeks  
**Business outcome:** Organic traffic growth; measurable marketing

---

### Milestone 5 — **Performance & V5 GA**

**Goal:** Production-ready launch on `main`; perf budget met.

| Tasks | Priority IDs |
|-------|----------------|
| Image pipeline | P4-1 |
| CSS/JS bundling | P4-2 |
| Font self-host | P4-3 |
| Archive root JPEGs | P4-4 |
| Lighthouse CI | P4-5 |
| Deprecate JSON gallery fallback | P6-5 |
| CSP hardening | P5-4 |
| Optional: App Check | P5-3 |

**Exit criteria:**
- Lighthouse performance ≥ 85 mobile (target)
- Repo size reduced; no orphan JPEGs at root
- `TEST_REPORT.md` updated for V5
- Merge `v5-dev` → `main` after stakeholder approval

**Estimated duration:** 1–2 weeks  
**Business outcome:** Fast, maintainable V5 live at vedman.lv

---

## Post-GA backlog (P8)

Schedule after Milestone 5 based on business priority:

1. P8-5 — Object portfolio / case studies  
2. P8-2 — RU/EN languages  
3. P8-1 — PWA  
4. P8-3 — Price estimator (if pricing approved)  
5. P8-4 — Server lead capture  
6. P8-6 — Video gallery polish  

---

## Task count summary

| Priority | Tasks | Critical security items |
|----------|-------|-------------------------|
| P0 | 6 | 0 direct (foundation) |
| P1 | 6 | 0 |
| P2 | 5 | 0 |
| P3 | 5 | 0 |
| P4 | 5 | 0 |
| P5 | 5 | 3 (P5-1, P5-2, P5-3) |
| P6 | 6 | 1 (P6-1) |
| P7 | 4 | 0 |
| P8 | 6 | 0 |
| **Total** | **48** | **4 must ship in M1** |

---

## Related documents

| Document | Role |
|----------|------|
| `PROJECT_MAP.md` | Current system map |
| `DEPENDENCY_REPORT.md` | Reference graph |
| `CLEANUP_PHASE1_REPORT.md` | Phase 1A log |
| `CLEANUP_PLAN.md` | Original cleanup phases |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Target security rules |
| `TEST_REPORT.md` | QA checklist template |

---

**This roadmap is planning only. No production code was modified.**

**Next recommended action:** Approve **Milestone 1** (P6-1 + P5-1 + P5-2) before any UI work.
