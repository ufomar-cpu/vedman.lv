# VEDMAN Development Handbook

**Version:** 1.2  
**Project:** [vedman.lv](https://vedman.lv)  
**Repository:** `ufomar-cpu/vedman.lv`  
**Hosting:** GitHub Pages (static) + Firebase (gallery, auth, storage)  
**Last updated:** 2026-07-13

The official engineering, product, and business guide for VEDMAN. All contributors — human or AI — should read relevant sections before making changes.

**Related docs:** `docs/V5_MASTER_PLAN.md`, `ARCHITECTURE_REFACTOR_REPORT.md`, `docs/PROJECT_MAP.md`, `docs/FIREBASE_USERS_BOOTSTRAP.md`, `FIREBASE_RULES.txt`

### North Star

Every design decision. Every marketing decision. Every feature. Every line of code.

Must answer one question:

> **Does this make it easier for the customer to buy?**

If the answer is **NO**, question whether it belongs in the product.

Customers do not care how advanced our code is. Customers care that they **understand**, they **trust**, they **order**, and they **receive exactly what they expected**.

Full treatment: **§18 Decision Framework** · **§20 Golden Rule**

### Contents

| Part | Sections |
|------|----------|
| **Foundation** | 1 Vision · 2 Architecture · 3 Git · 4 Cursor |
| **Engineering** | 5 Coding · 6 Firebase · 7 SEO · 8 Performance · 9 UX |
| **Business** | 10 Business Rules · 11 Marketing · 12 AI Roadmap · 13 Roadmap |
| **Brand & decisions** | 14 Brand Voice · 15 Conversion · 16 Photography · 17 AI Knowledge Base · 18 Decision Framework · 19 Principles · 20 Golden Rule |

---

## 1. Project Vision

### Mission

VEDMAN delivers **beramie materiāli** (aggregates), equipment, and related services across Latvia with one clear promise: *Piegādājam vairāk, nekā gaidīji* — one call, full solution. The website converts visitors into qualified leads via **phone** and **WhatsApp**; it supports sales, it does not replace them.

### Business goals

| Goal | Description |
|------|-------------|
| **Lead generation** | Capture quote requests with enough detail for fast pricing |
| **Trust** | Real gallery, clear contact, professional brand (see §16, §19) |
| **Operational efficiency** | Staff manage gallery and content without developer involvement |
| **Discovery** | SEO subpages and local presence for material keywords |
| **Scalable platform** | V5 architecture supports UI, SEO, and AI without rewrites |

### Target customers

- **Private homeowners** — driveways, landscaping, small deliveries
- **Construction companies** — ongoing aggregate supply, manipulator work
- **Municipal / commercial** — larger volumes, invoicing (ar PVN / bez PVN)
- **Geography:** Rīga, Ogre, and **all of Latvia**

### Main KPIs

| KPI | Target | Notes |
|-----|--------|-------|
| Quote requests (WhatsApp + phone) | ↑ | Primary conversion metric |
| Time to first response | ↓ | Same business day during hours |
| Gallery freshness | ↑ | Firebase-managed project photos |
| Organic sessions | ↑ | Milestone 4 |
| Lighthouse Performance (mobile) | ≥ 85 | Milestone 5 |
| Panel auth incidents | 0 | No unauthorized writes/deletes |
| Quote form abandonment | ↓ | Milestone 3 UX polish |

---

## 2. Architecture

### Folder structure

Production URLs must remain compatible with GitHub Pages. Critical entry points stay at **repo root**.

```
/
├── index.html              # Homepage (production entry)
├── vedman-panel.html       # Admin panel (production)
├── firebase-config.js      # Firebase Web config (do not move without updating all refs)
├── gallery.json            # Public JSON gallery fallback
├── FIREBASE_RULES.txt      # Console deploy reference (not runtime)
├── CNAME, robots.txt, sitemap.xml, manifest.json
│
├── assets/
│   ├── icons/              # favicon.png
│   ├── logos/              # vedman-logo.png, variants
│   └── images/             # Design references
│
├── css/
│   ├── tokens.css          # Design tokens (:root)
│   ├── base.css            # Reset, typography, buttons
│   ├── layout.css          # Header, hero, sections, footer
│   ├── components.css      # Modal, materials, gallery, responsive
│   ├── home.css            # @import chain for homepage
│   ├── pages.css           # SEO subpages (former style.css)
│   ├── panel.css           # Admin panel
│   └── privacy.css         # Privacy page
│
├── js/
│   ├── catalog-data.js     # window.VEDMAN_CATALOG
│   ├── quote.js            # Quote modal + WhatsApp handoff
│   ├── gallery-json.js     # loadGallery() JSON fallback
│   ├── gallery-firebase.js # loadFirebaseGallery() ES module
│   └── panel-app.js        # Panel auth + gallery CRUD ES module
│
├── pages/                  # SEO stub subpages (9 files)
├── components/             # Future shared HTML partials
├── firebase/               # README only; config stays at root
├── docs/                   # Planning, security, validation docs
└── archive/                # Legacy code, orphan images — never delete without approval
    ├── backup-v1/
    ├── legacy-admin/
    ├── firebase-legacy/
    └── orphan-images/
```

### CSS architecture

One design system per surface until Milestone 3 unifies them.

| Surface | Stylesheet | Pattern |
|---------|------------|---------|
| Homepage | `css/home.css` | Token → base → layout → components via `@import` |
| SEO subpages | `css/pages.css` | Standalone V2.5 system (Inter, cards) |
| Admin panel | `css/panel.css` | Isolated admin UI |
| Privacy | `css/privacy.css` | Minimal prose layout |

**Rules:** Tokens in `css/tokens.css`. No inline `<style>` in production HTML except emergency hotfixes. Cache-bust with query params (e.g. `?v=502`).

### JavaScript architecture

**Homepage load order:**

```
1. js/catalog-data.js     → window.VEDMAN_CATALOG
2. js/quote.js            → modal, calculator, WhatsApp
3. js/gallery-json.js     → loadGallery() fallback
4. firebase-config.js     → window.VEDMAN_FIREBASE_CONFIG
5. js/gallery-firebase.js → type="module", loadFirebaseGallery()
```

| Module | Role | Must not |
|--------|------|----------|
| `catalog-data.js` | `window.VEDMAN_CATALOG` | Contain UI logic |
| `quote.js` | Quote modal + WhatsApp | Import Firebase |
| `gallery-json.js` | JSON fallback | Write to Firestore |
| `gallery-firebase.js` | Firestore read + render | Change fallback chain without review |
| `panel-app.js` | Admin ES module | Run on public pages |

**Planned:** `js/categories.js`, `js/firebase-init.js` (P0-3, P0-4 in `docs/V5_MASTER_PLAN.md`).

### Firebase architecture

```
index.html (public read) ──▶ Firestore gallery
vedman-panel + panel-app.js ──▶ Firestore gallery + Storage + users/{uid} RBAC
```

| Component | Location | SDK |
|-----------|----------|-----|
| Config | `firebase-config.js` | `window.VEDMAN_FIREBASE_CONFIG` |
| Public gallery | `js/gallery-firebase.js` | Firebase JS **10.12.5** |
| Panel CRUD | `js/panel-app.js` | Firebase JS **10.12.5** |
| Security rules | `FIREBASE_RULES.txt` | Manual Console deploy |
| Legacy | `archive/firebase-legacy/` | 10.8.0 — **do not use** |

**Project ID:** `vedman-lv`

### Gallery architecture

**Primary:** Firestore `gallery`, ordered by `createdAt` desc.  
**Fallback:** `gallery.json` via `loadGallery()` when Firebase fails or returns empty.

**Document schema:** `category`, `title`, `description`, `url`, `path`, `type`, `originalName`, `sizeOriginal`, `sizeOptimized`, `createdAt`.

Category enums are duplicated in `gallery-firebase.js`, `panel-app.js`, and `gallery.json` — unification planned (P0-3). Public rendering uses lazy-loaded images and category filter tabs on `#galerija`.

### Admin architecture

| URL | Access |
|-----|--------|
| `/vedman-panel.html` | Firebase Auth + Firestore `users/{uid}` role |

**Auth flow:** Sign in → read `users/{uid}` → reject if inactive or invalid role → gate delete UI for editors.

**Upload:** Client resize max 1600px → WEBP 80% → Storage `{category}/{filename}.webp` → Firestore doc.

Legacy admin in `archive/` is retired — do not restore.

---

## 3. Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| **`main`** | Production. GitHub Pages deploys from here. |
| **`v5-dev`** | V5 integration branch. Feature work merges here first. |

### Commit strategy

- One logical change per commit; imperative subject line
- Prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `security:`, `chore:`
- Never commit passwords, service account keys, or `.env` secrets
- Separate Firebase rules changes from UI or architecture commits

### Merge policy

1. Develop on `v5-dev` or short-lived feature branches
2. Manual smoke test on changed pages
3. Merge to `main` only after approval for production-impacting work
4. Push → GitHub Pages auto-deploys (~1–2 min)
5. Verify `https://vedman.lv/`

### Rollback strategy

| Scenario | Action |
|----------|--------|
| Bad deploy | `git revert <hash>` on `main`, push |
| Broken Firebase rules | Revert in Firebase Console (version history) |
| Gallery corruption | Firestore backup / re-upload via panel |
| Emergency hotfix | Minimal fix on `main`; backport to `v5-dev` |

Never `git push --force` to `main` without explicit approval.

---

## 4. Cursor Workflow

1. **Planning first** — Read this handbook and `docs/V5_MASTER_PLAN.md`; state constraints explicitly
2. **Small changes** — One milestone task; prefer extraction over rewrite
3. **Self-review** — Diff intended files; verify script order, CSS chain, asset paths
4. **Manual validation** — `python3 -m http.server 8765`; test `/`, panel, affected pages
5. **Commit** — Stage only task files; verify with `git diff --cached --name-only`
6. **Push** — Only when approved; confirm `origin/main` sync
7. **Deployment** — GitHub Pages from `main`; Firebase Console changes are manual and separate

Apply §18 Decision Framework before starting any feature work.

---

## 5. Coding Standards

### ES Modules

- `type="module"` for Firebase CDN imports
- Attach to `window` only when non-module scripts require it (e.g. `VEDMAN_CATALOG`)

### Clean Code & SOLID (frontend-adapted)

- One function, one job; early returns; archive dead code
- One module per domain: quote, gallery, catalog, panel
- Config via `firebase-config.js`, not hardcoded

### Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `gallery-firebase.js` |
| JS functions | camelCase | `loadFirebaseGallery` |
| CSS classes | kebab-case | `material-card` |
| Firestore fields | camelCase | `createdAt` |
| Storage paths | lowercase slug | `skembas/1234-photo.webp` |

### Comments & error handling

- Comment **why**, not **what**
- Gallery: try/catch → JSON fallback; `console.warn` only
- Panel: Latvian UI errors; sign out on auth failure
- Quote: validate material before WhatsApp; never silent failures on upload/delete

---

## 6. Firebase Standards

### Authentication

Email/Password only. Bootstrap: `docs/FIREBASE_USERS_BOOTSTRAP.md`.  
Authorized domains: `localhost`, `vedman.lv`, `vedman-lv.firebaseapp.com`, `vedman-lv.web.app`.  
No credentials in repo.

### Firestore & Storage

| Collection / path | Public read | Write |
|-------------------|-------------|-------|
| `gallery` | Yes | RBAC (see roles below) |
| `users/{uid}` | Self + owner/admin | owner/admin |
| Storage `{category}/*` | Yes | RBAC |

**User schema:** `role` (`owner` | `admin` | `editor`), `isActive` (boolean).

### Security Rules

Source: `FIREBASE_RULES.txt`. Deploy via Console; test in simulator first. Never bundle rule changes with unrelated commits.

### Roles

| Role | Upload | Delete | User management |
|------|:------:|:------:|:---------------:|
| **owner** | ✓ | ✓ | Full |
| **admin** | ✓ | ✓ | Create/update editors and admins |
| **editor** | ✓ | ✗ | None |

UI gates delete for editors; server enforces via Firestore + Storage rules.

---

## 7. SEO Standards

### Metadata (every indexable page)

Unique `<title>`, `<meta name="description">` (150–160 chars, Latvian, geography), `<html lang="lv">`, viewport meta.

### Structured data — Milestone 4

JSON-LD targets: `LocalBusiness`, `FAQPage`, `Product`/`Service` per category.  
LocalBusiness minimum: name, telephone +37122312828, areaServed (Latvia), url.

### Canonical, OpenGraph, sitemap

- Canonical per page under `https://vedman.lv/`
- OpenGraph tags — Milestone 4
- `sitemap.xml` at root; referenced in `robots.txt`
- **Current:** homepage only. **Milestone 4:** all pages with real content
- Exclude `/vedman-panel.html` (disallowed in `robots.txt`)

FAQ content must align with §10 Business Rules and §14 Brand Voice.

---

## 8. Performance Standards

### Targets (Milestone 5)

| Category | Mobile target |
|----------|---------------|
| Lighthouse Performance | ≥ 85 |
| Accessibility | ≥ 90 |
| SEO | ≥ 95 |
| LCP / INP / CLS | < 2.5s / < 200ms / < 0.1 |

### Implementation

- Gallery: `loading="lazy"` (live in `gallery-firebase.js`)
- Panel uploads: WEBP, max 1600px, 80% quality
- Milestone 5: `srcset`, bundling, self-hosted fonts, Lighthouse CI
- Visual assets: follow §16 Photography Standards; technical specs in panel pipeline above

---

## 9. UX Standards

### Mobile first

Design at 375px first. Sticky mobile bar (Zvans + WhatsApp). Touch targets ≥ 44px. Panel must work on iPhone for field uploads.

### Accessibility

`aria-label` on logo; modal closes on Escape/backdrop; labels on all form fields; sufficient contrast; gallery `alt` from Firestore `title`.

### CTAs & quote flow

Technical CTA priority and page-level requirements are defined in **§15 Conversion Rules**. Implementation reference:

| Style | Usage |
|-------|-------|
| `btn-green` | Primary — WhatsApp, Uzzini cenu |
| `btn-light` | Secondary — phone |

**Quote flow:** Uzzini cenu → modal → material / fraction / quantity → optional m³ helper → WhatsApp handoff via `quote.js`. Encourage **tonnas** for aggregates (§10).

---

## 10. Business Rules

Domain knowledge that code, copy, and AI must respect.

### Primary unit: tonnes

VEDMAN **primarily sells aggregates by tonnes (t)**.

| Factor | Tonnes | Cubic metres |
|--------|--------|--------------|
| Density | Direct weight measurement | Varies by fraction, moisture, compaction |
| Truck loading | Billed by weight | Fill level inconsistent |
| Pricing | Industry standard in Latvia | Approximate if density assumed |
| Settlement | Weighbridge certainty | Customer expectation risk |

Fractions (0-32, 0-45, etc.) have different bulk densities. **Confirm tonne quantity for every quote and delivery.**

### m³ calculator — helper only

Quote modal calculator (length × width × thickness) helps customers estimate volume. Label as approximate (*"Aptuveni: X m³"*). Never replace weighbridge billing. Staff confirm tonnes in WhatsApp follow-up.

**Approved copy direction:** see §14 Brand Voice (educate, do not attack alternatives).

### Delivery areas

- **Primary:** Rīga, Ogre (*RĪGA · OGRE · VISĀ LATVIJĀ*)
- **National:** all Latvia — confirm distance and minimum order in quote response
- Address field supports accurate pricing

### Lead channels

| Channel | Role |
|---------|------|
| **WhatsApp** +371 22312828 | Primary digital conversion; quote modal destination |
| **Phone** 22312828 / 20080098 | Equal priority; essential for commercial clients |

Structured WhatsApp template in `quote.js` — do not remove fields without business approval. Target same-day response during business hours.

### Trust signals (on-site)

Benefits strip: Uzticami, Operatīvi, Visa Latvija, Skaidra cena.  
Payment: skaidra nauda, bankas pārskaitījums, ar PVN / bez PVN.  
Photography rules: **§16**.

---

## 11. Marketing Standards

### Channels

| Channel | Role | Priority |
|---------|------|----------|
| **SS.lv** | Classified listings | High |
| **Google Business** | Local discovery, reviews | High |
| **Facebook** | Community, project photos | Medium |
| **Instagram** | Visual portfolio, reels | Medium |
| **TikTok** | Short-form delivery content | Experimental |
| **LinkedIn** | B2B construction | Low–medium |

### Content & SEO rules

- Real VEDMAN work only — **§16 Photography Standards**
- Latvian primary; location context (Rīga, Ogre, reģions)
- Phone + WhatsApp in every external listing
- **Unique text** per channel and subpage — no copy-paste across SS.lv, Google, website
- One primary keyword per subpage; link to `https://vedman.lv/` as canonical brand URL
- Voice and tone: **§14 Brand Voice**

Channel-specific knowledge for AI: **§17 AI Knowledge Base**.

---

## 12. AI Roadmap

Future VEDMAN AI assistants powered by **§17 AI Knowledge Base**.

| Assistant | Purpose |
|-----------|---------|
| **Customer** | FAQ, quote guidance, WhatsApp pre-fill; escalate complex jobs |
| **Marketing** | SS.lv / social drafts from gallery; enforce unique text rules |
| **SEO** | Metadata audit, FAQ proposals, sitemap hygiene |
| **CRM** | Lead logging, follow-up reminders, customer tags |
| **Sales** | m³→t hints with disclaimers, reply templates, commercial lead flags |

**Constraints:** Never quote binding prices without human approval. Follow §14 Brand Voice and §19 Principles.

**Prerequisites:** Milestones 3–5, category unification, analytics (P2-2), structured catalog.

---

## 13. Future Roadmap

Aligned with `docs/V5_MASTER_PLAN.md`.

### Milestone 3 — V5 Experience (UI + Mobile)

Design system, homepage refresh with real photography (§16), quote modal polish, gallery UI, mobile optimization, panel UI, JPEG → Firebase migration.  
**Duration:** ~3–4 weeks.

### Milestone 4 — Growth (SEO + Business)

Unique subpage content, sitemap + JSON-LD, unified pages design, expanded catalog, analytics, WhatsApp templates.  
**Duration:** ~2–3 weeks.

### Milestone 5 — Performance & V5 GA

Image pipeline, bundling, self-hosted fonts, Lighthouse CI ≥ 85 mobile, deprecate JSON fallback, CSP hardening.  
**Duration:** ~2 weeks.

Prioritize work using **§18 Decision Framework** and **§20 Golden Rule**.

---

## 14. Brand Voice

VEDMAN always communicates **positively**. We explain what we do well — we never diminish others.

### Rules

| Do | Don't |
|----|-------|
| Explain benefits to the customer | Criticize competitors |
| Educate on tonnes, precision, delivery | Use fear-based marketing |
| Promise only what we can deliver | Imply others are dishonest |
| Use clear, confident Latvian | Attack m³ users — guide them instead |

### Approved examples

- ✔ Pasūti tonnās. Piegādājam precīzu daudzumu.
- ✔ Izvēlies tonnas – saņem tieši pasūtīto daudzumu.
- ✔ Precīzs svars. Precīza piegāde. Precīzs rezultāts.

### Avoid

- ✘ *"Citi piegādā nepareizi"*
- ✘ *"Kubikos var apkrāpt"*

### Preferred approach

Instead of attacking cubic-metre pricing, **educate**:

- *"Šķembas pārdodam pēc svara — tā saņemat tieši to daudzumu, ko pasūtījāt."*
- *"Nezināt tilpumu? m³ kalkulators palīdzēs aptuveni — galīgo daudzumu tonnās precizēsim kopā."*

Apply this voice everywhere: website, WhatsApp templates, SS.lv, Google Business, social media, and AI-generated copy.

---

## 15. Conversion Rules

Every public page must answer within **5–10 seconds**:

| # | Question |
|---|----------|
| 1 | What do we offer? |
| 2 | Why should the customer trust us? |
| 3 | How can the customer order? |
| 4 | What should the customer do next? |

### Required page elements

| Element | Implementation |
|---------|----------------|
| **Primary CTA** | WhatsApp or *Uzzini cenu* (green button) |
| **Secondary CTA** | Phone (*Zvanīt 22312828*) |
| **Trust elements** | Benefits strip, gallery, payment options, real photos |
| **Clear contact** | Visible phone numbers; WhatsApp link; address prompt in quote flow |

### Homepage reference (current)

- **Offer:** Hero headline + material cards + services
- **Trust:** Uzticami / Operatīvi / Visa Latvija / Skaidra cena + gallery
- **Order:** Quote modal → WhatsApp; direct phone
- **Next step:** *Uzzini cenu* above the fold; mobile bottom bar

SEO stub pages must meet these rules once Milestone 4 content ships — not before with thin placeholder copy indexed.

---

## 16. Photography Standards

All visual content must **increase customer trust**.

### Requirements

- **Only real VEDMAN work** — our deliveries, equipment, materials, sites
- **No stock images**
- **No collages**
- **No artificial effects** — filters, heavy HDR, fake skies
- **Natural colours** — accurate representation of materials
- **Equipment and materials clearly visible** — customer sees what they will receive

### Workflow

1. Capture on site during delivery or project
2. Upload via `vedman-panel.html` (WEBP, max 1600px)
3. Categorize correctly in Firestore gallery
4. Use in website gallery, social media, and marketing (§11)

Archived orphan JPEGs in `archive/orphan-images/` are migration candidates — not long-term homepage placeholders.

---

## 17. AI Knowledge Base

The future VEDMAN AI system requires a structured, maintainable knowledge base. This handbook is the seed document; Milestone 4+ should formalize each domain below.

### Core product knowledge

| Domain | Source / content |
|--------|------------------|
| **Materials** | `js/catalog-data.js`, fractions, use cases |
| **Services** | Catalog *Pakalpojumi*, homepage services section |
| **Delivery areas** | §10 — Rīga, Ogre, all Latvia |
| **Material densities** | Reference tables for m³→t hints (with disclaimers) |
| **FAQ** | Per-material questions; align with SEO subpages |
| **SEO knowledge** | §7 metadata, keywords, sitemap rules |

### Channel knowledge

| Domain | Content |
|--------|---------|
| **SS.lv** | Listing formats, unique text rules, categories |
| **Google Business** | Posts, reviews response tone, local hours |
| **Facebook** | Community tone, photo posts |
| **Instagram** | Visual portfolio, reels |
| **TikTok** | Short delivery/equipment clips |
| **LinkedIn** | B2B construction partnerships |

### Operations knowledge

| Domain | Content |
|--------|---------|
| **Customer support** | Hours, response expectations, escalation to phone |
| **Sales scripts** | Quote follow-up, tonne confirmation, commercial vs private |

All AI outputs must pass **§14 Brand Voice** review before publication.

---

## 18. Decision Framework

Before any design, marketing, feature, or code change, ask the **Golden Question** (§20):

> Does this make it easier for the customer to buy?

If **NO** — stop and question whether it belongs in the product.

### What customers actually care about

| Customer need | What we must deliver |
|---------------|---------------------|
| **Understand** | Clear materials, fractions, units (tonnes), delivery areas |
| **Trust** | Real photos, honest copy, visible contact, precise promises |
| **Order** | Low-friction quote flow, WhatsApp and phone always available |
| **Receive as expected** | Tonne-based precision, transparent follow-up, no surprises |

Customers do not care how advanced our code is. Engineering exists to serve these four outcomes.

### Supporting questions

| # | Question | Maps to |
|---|----------|---------|
| 1 | Does this help the customer **understand** and decide? | Understand |
| 2 | Does this **increase trust**? | Trust |
| 3 | Does this make it **easier to order**? | Order |
| 4 | Does this improve **delivery expectation accuracy**? | Receive |
| 5 | Does this create **measurable business value**? | Conversion / KPIs |

**Scoring:** If most answers are **NO**, defer or reject.

Use in planning (§4), roadmap (§13), and AI scoping (§12).

---

## 19. VEDMAN Principles

Six principles govern every product, engineering, and marketing decision.

### Principle 1 — Precision

We deliver the quantity we promise. Tonnes over approximate volume. Weighbridge truth over guesswork.

### Principle 2 — Trust

We say only what we can deliver. Real photos. Clear pricing process. No exaggeration.

### Principle 3 — Simplicity

Ordering must be easy. One modal. One WhatsApp message. Minimal steps to a quote.

### Principle 4 — Speed

Fast response. Fast quotation. Fast delivery. Same-day reply during business hours.

### Principle 5 — Transparency

We educate customers — on tonnes, materials, and delivery. We never attack competitors (§14).

### Principle 6 — Continuous Improvement

Every version of VEDMAN should be better than the previous one — measured by §1 KPIs and §20 Golden Rule.

---

## 20. Golden Rule

**The most important rule of the entire project.**

Every design decision. Every marketing decision. Every feature. Every line of code must answer:

> **Does this make it easier for the customer to buy?**

If the answer is **NO**, we should question whether it belongs in the product.

### What customers care about

Customers do not care how advanced our code is. Customers care that:

1. They **understand**
2. They **trust**
3. They **order**
4. They **receive exactly what they expected**

Every VEDMAN improvement must move at least one of these forward. Technical elegance, architectural purity, and feature count are not goals in themselves — they are means to a buying decision.

This rule overrides feature requests, technical curiosity, and cosmetic changes that do not serve the customer. When in doubt, apply §18 and defer.

---

## Appendix: Quick reference

| Task | Command / URL |
|------|---------------|
| Local preview | `python3 -m http.server 8765` → http://localhost:8765/ |
| Admin panel | `/vedman-panel.html` |
| Firebase bootstrap | `docs/FIREBASE_USERS_BOOTSTRAP.md` |
| Deploy rules | Firebase Console ← `FIREBASE_RULES.txt` |
| Production | https://vedman.lv/ |

---

*Living document. Update when architecture, business rules, brand voice, or milestones change.*
