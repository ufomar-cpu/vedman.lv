# VOS-001 — File Map

| Field | Value |
|-------|-------|
| **Task ID** | VOS-001 |
| **Date** | 2026-07-16 |
| **Parent** | [VOS_001_REPOSITORY_AUDIT.md](VOS_001_REPOSITORY_AUDIT.md) |

**Legend:** Prod = production · Doc = documentation · Risk: Low / Med / High

---

## Production — website root

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `index.html` | Homepage SPA | Prod | Public | Live | Quote CTA, material cards, gallery host | Med | REFACTOR (M3/OS links only when approved) |
| `privacy.html` | Privacy policy | Prod | Public | Live | Consent copy for OS PII | Low | REVIEW — update when Firestore stores requests |
| `vedman-panel.html` | Gallery admin shell | Prod | Private URL | Live | Extend for OS Phase 7 | Med | KEEP → REFACTOR |
| `firebase-config.js` | Firebase Web config | Prod | Public (client) | Live | All Firebase consumers | Med | KEEP — rules protect data |
| `gallery.json` | Gallery fallback data | Prod | Public | Fallback | Legacy; gallery primary Firebase | Low | KEEP until migration verified |
| `CNAME` | GitHub Pages domain | Prod | Public | Live | — | Low | KEEP |
| `robots.txt` | Crawler rules | Prod | Public | Live | SEO | Low | KEEP — add passport URLs later |
| `sitemap.xml` | URL index | Prod | Public | Minimal | Passport URLs Phase 2 | Low | REFACTOR |
| `manifest.json` | PWA manifest | Prod | Public | Stub (no icons) | Low priority | Low | REVIEW |

## Production — JavaScript

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `js/catalog-data.js` | Material catalog object | Prod | Public | Live | SSOT until OS publish sync | Med | REPLACE → sync from OS index |
| `js/quote.js` | Quote modal + wa.me | Prod | Public | Live | Pilot fallback; extend Phase 3 | Med | KEEP → REFACTOR |
| `js/gallery-json.js` | JSON gallery loader | Prod | Public | Live | Fallback chain | Low | KEEP |
| `js/gallery-firebase.js` | Firestore gallery read | Prod | Public | Live | Media reuse for passports | Med | KEEP — XSS review |
| `js/panel-app.js` | Panel auth + gallery CRUD | Prod | Private | Live | Base for owner dashboard | High | KEEP → REFACTOR |

## Production — CSS & assets

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `css/home.css` | Homepage styles import | Prod | Public | Live | Passport may share tokens | Low | KEEP |
| `css/tokens.css` | Design tokens | Prod | Public | Live | Shared design system | Low | KEEP |
| `css/base.css` | Reset, typography | Prod | Public | Live | Passport pages | Low | KEEP |
| `css/layout.css` | Layout + **gradient mat-img** | Prod | Public | Live | Replace with real photos | Med | REFACTOR |
| `css/components.css` | Modal, gallery, cards | Prod | Public | Live | Request form UX | Low | KEEP |
| `css/pages.css` | SEO subpages | Prod | Public | Live | Passport template candidate | Low | REFACTOR |
| `css/panel.css` | Admin panel | Prod | Private | Live | Dashboard extension | Low | KEEP |
| `css/privacy.css` | Privacy page | Prod | Public | Live | — | Low | KEEP |
| `assets/icons/favicon.png` | Favicon | Prod | Public | Live | — | Low | KEEP |
| `assets/logos/vedman-logo.png` | Brand logo | Prod | Public | Live | Passport header | Low | KEEP |
| `assets/images/` | Design references | Prod | Internal | `[TBD]` | — | Low | REVIEW |

## Production — SEO pages

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `pages/materiali.html` | Materials stub | Prod | Public | Thin placeholder | Passport routing | Low | REPLACE |
| `pages/skembas.html` | Šķembas stub | Prod | Public | Thin | Slug pages | Low | REPLACE |
| `pages/smilts.html` | Smilts stub | Prod | Public | Thin | Slug pages | Low | REPLACE |
| `pages/grants.html` | Grants stub | Prod | Public | Thin | Slug pages | Low | REPLACE |
| `pages/melnzeme.html` | Melnzeme stub | Prod | Public | Thin | Slug pages | Low | REPLACE |
| `pages/pakalpojumi.html` | Services stub | Prod | Public | Thin | — | Low | REFACTOR |
| `pages/manipulators.html` | Manipulator stub | Prod | Public | Thin | — | Low | REFACTOR |
| `pages/objekti.html` | Projects stub | Prod | Public | Thin | — | Low | REFACTOR |
| `pages/kontakti.html` | Contact stub | Prod | Public | Thin | — | Low | REFACTOR |

## Firebase reference (not runtime)

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `FIREBASE_RULES.txt` | Rules deploy reference | Doc/ops | Private repo | **Local diff uncommitted** | Extend for OS collections | High | REVIEW — do not stage with docs |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Alt rules snapshot | Doc/ops | Private repo | Reference | Compare on deploy | Med | REVIEW |
| `firebase/README.md` | Config location note | Doc | — | Current | — | Low | KEEP |

## Documentation — strategy (root)

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `VEDMAN_OS_MASTER_PLAN.md` | OS master plan | Doc | Private repo | Committed d146430 | Core | Low | KEEP |
| `VEDMAN_OS_ROADMAP.md` | Phases 0–10 | Doc | Private repo | Committed | Core | Low | KEEP |
| `VEDMAN_OS_TASK_BACKLOG.md` | Task backlog | Doc | Private repo | Committed | Core | Low | KEEP |
| `VEDMAN_ASSISTANT_ARCHITECTURE.md` | Assistant spec | Doc | Private repo | Committed | Phase 6 | Low | KEEP |
| `VEDMAN_DATA_MODEL_PLAN.md` | Entity design | Doc | Private repo | Committed | Phase 1+ | Low | KEEP |
| `VEDMAN_REQUEST_FLOW.md` | Request lifecycle | Doc | Private repo | Committed | Phase 3+ | Low | KEEP |
| `MATERIAL_CENTER_MASTER_PLAN.md` | Material library | Doc | Private repo | Committed | Phase 2 | Low | KEEP |
| `VEDMAN_DEVELOPMENT_HANDBOOK.md` | Engineering guide | Doc | Private repo | Committed | All phases | Low | KEEP |
| `PROJECT_ADVISOR.md` | Advisor UX spec | Doc | Private repo | Committed | Phase 6+ | Low | KEEP |
| `CUSTOMER_*`, `MILESTONE3_*` | Personas, CRO | Doc | Private repo | Committed | Context | Low | KEEP |
| `VEDMAN_KNOWLEDGE_BASE.md` | Index pointer | Doc | Private repo | Committed | — | Low | KEEP |
| `ARCHITECTURE_REFACTOR_REPORT.md` | M2 report | Doc | Private repo | Committed | Baseline | Low | KEEP |
| `README.md` | Repo readme | Doc | Public repo | Live | — | Low | KEEP |

## Documentation — docs/

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `docs/VOS_001_*.md` | Phase 0 audit | Doc | Private repo | **This audit** | VOS-001 | Low | KEEP |
| `docs/SECURITY_IMPLEMENTATION_PLAN.md` | Security roadmap | Doc | Private repo | Committed | VOS-004 | High | KEEP |
| `docs/VALIDATION_CHECKLIST.md` | QA checklist | Doc | Private repo | Committed | VOS-010 | Low | KEEP |
| `docs/FINAL_PHASE_C_APPROVAL.md` | Phase C sign-off | Doc | Private repo | Committed | Rules deploy | Med | KEEP |
| `docs/V5_MASTER_PLAN.md` | V5 roadmap | Doc | Private repo | Committed | Parallel track | Low | KEEP |
| `docs/PROJECT_MAP.md` | Dependency map | Doc | Private repo | Committed | Reference | Low | KEEP |
| Other `docs/*` | Phase reports | Doc | Private repo | Committed | Historical | Low | ARCHIVE (keep) |

## Knowledge library

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `knowledge/README.md` | Library index | Doc | Private repo | Committed | SSOT governance | Low | KEEP |
| `knowledge/*.md` (18 modules) | Business knowledge | Doc | Private repo | Committed | AI + OS authoring | Low | KEEP |
| `knowledge/materials/` | Material passports | Doc | Private repo | 1 draft slug | **Authoring SSOT** | Low | KEEP |
| `knowledge/materials/_schema/` | Templates | Doc | Private repo | Committed | Publish pipeline | Low | KEEP |
| `knowledge/materials/0-32-dolomite/` | Pilot passport | Doc | Private repo | Draft | Pilot | Low | KEEP — owner fill |

## Archive & legacy

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `archive/admin.html` | Legacy JSON admin | Legacy | — | Not linked | None | Med | ARCHIVE |
| `archive/app.js` | Orphan script | Legacy | — | Not loaded | None | Low | ARCHIVE |
| `archive/backup-v1/*` | V1 snapshots | Legacy | — | Historical | None | Low | ARCHIVE |
| `archive/legacy-admin/*` | Old admin | Legacy | — | Broken | None | Med | ARCHIVE |
| `archive/firebase-legacy/*` | SDK 10.8.0 | Legacy | — | Unused | None | Low | ARCHIVE |
| `archive/orphan-images/` | JPEG orphans | Legacy | — | Migration | Gallery | Low | REVIEW |

## Components (future)

| File / path | Purpose | Prod/Doc | Public/Private | Status | OS relevance | Risk | Action |
|-------------|---------|----------|----------------|--------|--------------|------|--------|
| `components/README.md` | Partial HTML plan | Doc | — | Placeholder | Shared partials | Low | REVIEW |

## Not in repository (noted)

| Referenced | Status |
|------------|--------|
| Root `style.css` | **Absent** — use `css/` |
| Root `quote.js` | **Moved** to `js/quote.js` |
| Root `app.js` | **Only** `archive/app.js` |
| Root `admin.html` | **Only** `archive/admin.html` |

---

*Generated by VOS-001. No files modified except this documentation set.*
