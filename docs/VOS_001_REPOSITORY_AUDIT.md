# VOS-001 — Repository, Architecture & Data Audit

| Field | Value |
|-------|-------|
| **Task ID** | VOS-001 |
| **Date** | 2026-07-16 |
| **Baseline commit** | `d146430830b43a6056e96ba2d6858f1d7970d6c7` |
| **Status** | Complete |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VOS_001_FILE_MAP.md](VOS_001_FILE_MAP.md) · [VOS_001_DATA_SOURCE_MAP.md](VOS_001_DATA_SOURCE_MAP.md) · [VOS_001_BLOCKERS_AND_DECISIONS.md](VOS_001_BLOCKERS_AND_DECISIONS.md) · [../VEDMAN_OS_MASTER_PLAN.md](../VEDMAN_OS_MASTER_PLAN.md) |

---

## Executive summary

VEDMAN.lv is a **static GitHub Pages site** with a **modular V5 frontend** (post-M2 refactor), **Firebase-backed gallery**, and **WhatsApp-first quote flow**. Planning documentation for Material Center, Knowledge Base, and VEDMAN OS is committed; **implementation has not started**.

**Key findings:**

1. **Quote flow is client-only** — no server persistence, no customer confirmation, no owner notification pipeline.
2. **Material data is triple-duplicated** — `index.html` chips, `js/catalog-data.js`, and hard-coded modal options; no slug layer or passport URLs.
3. **Material cards use CSS gradients**, not real photography — conflicts with Material Center / handbook §16.
4. **Firebase Phase C RBAC rules exist in repo** but **live Console state unverified** in this audit; local `FIREBASE_RULES.txt` has an **uncommitted syntax refactor** only.
5. **Panel uses Firebase Auth + Firestore `users/{uid}`** — improved from legacy hardcoded login; gallery write/delete gated in UI by role.
6. **VEDMAN OS pilot (0-32) is BLOCKED** on owner content, passport page, Firestore `customer_requests` collection + rules, and notification channel decision.
7. **Legacy wa.me flow is the correct pilot fallback** — must remain until Phase 5 cutover.

**Recommended sequence:** VOS-002 (owner content) → VOS-004 (rules deploy verification) → VOS-003 (publish exporter) → VOS-005 (passport page) → VOS-006–008 (request pipeline).

---

## Repository map

### Root — production (GitHub Pages entry points)

| Path | Role |
|------|------|
| `index.html` | Homepage — hero, materials, services, gallery, quote modal |
| `vedman-panel.html` | Admin — Firebase Auth + gallery upload |
| `privacy.html` | Privacy policy (minimal) |
| `firebase-config.js` | Firebase Web SDK config (public client keys) |
| `gallery.json` | Gallery JSON fallback |
| `CNAME`, `robots.txt`, `sitemap.xml`, `manifest.json` | Hosting / SEO / PWA stub |

### Root — reference / deploy (not runtime JS)

| Path | Role |
|------|------|
| `FIREBASE_RULES.txt` | Firestore + Storage rules reference for Console deploy |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Alternate rules snapshot |

### Application code

| Path | Role |
|------|------|
| `js/catalog-data.js` | `window.VEDMAN_CATALOG` — material/service list |
| `js/quote.js` | Quote modal logic + WhatsApp handoff |
| `js/gallery-json.js` | Gallery loader — Firebase first, JSON fallback |
| `js/gallery-firebase.js` | Firestore `gallery` read (ES module) |
| `js/panel-app.js` | Panel auth, upload, list, delete (ES module) |
| `css/` | Design tokens, layout, components, page styles |
| `assets/icons/`, `assets/logos/` | Brand assets |
| `pages/*.html` (9) | SEO stub subpages — thin placeholder content |

### Documentation (committed d146430)

| Path | Role |
|------|------|
| `VEDMAN_*`, `MATERIAL_*`, `PROJECT_*`, `CUSTOMER_*`, `MILESTONE3_*` | Strategy & OS planning |
| `knowledge/` | Modular business knowledge + `materials/` passports |
| `docs/` | V5 security, validation, phase approvals |
| `ARCHITECTURE_REFACTOR_REPORT.md` | M2 refactor record |

### Legacy / archive (not production)

| Path | Role |
|------|------|
| `archive/backup-v1/` | V1 HTML snapshots |
| `archive/legacy-admin/` | Old Firebase admin attempt |
| `archive/admin.html` | Legacy JSON gallery editor |
| `archive/app.js` | Orphan legacy script |
| `archive/firebase-legacy/` | Old SDK 10.8.0 module |
| `archive/orphan-images/` | Migration candidates (per handbook) |

### Not present at root (audit note)

| Requested in brief | Actual location |
|--------------------|-----------------|
| `style.css` | **Does not exist** — use `css/home.css`, `css/pages.css` |
| `app.js` | **Only** `archive/app.js` — not loaded by production |
| `admin.html` | **`archive/admin.html`** — not production; panel is `vedman-panel.html` |
| `quote.js` (root) | **`js/quote.js`** |

Full path inventory: [VOS_001_FILE_MAP.md](VOS_001_FILE_MAP.md).

---

## Production architecture

### Page structure (`index.html`)

Single-page layout with anchor sections:

1. **Header** — logo, nav, phone, quote CTA  
2. **Hero** — headline, benefits, CTAs  
3. **Service strip** — quick category buttons → quote modal  
4. **#materiali** — 6 material cards (subset of catalog)  
5. **#pakalpojumi** — 3 service cards (static copy)  
6. **Process** — 3-step “WhatsApp quote” explainer  
7. **#galerija** — Firebase/JSON gallery  
8. **CTA strip + footer + mobile bottom bar**  
9. **#quoteModal** — quote form overlay  

### Script loading order

```
1. js/catalog-data.js     → window.VEDMAN_CATALOG
2. js/quote.js            → modal, calculator, wa.me send
3. js/gallery-json.js     → defines loadGallery()
4. firebase-config.js     → VEDMAN_FIREBASE_CONFIG
5. js/gallery-firebase.js → module; sets loadFirebaseGallery; calls loadGallery()
```

**Fragility:** Gallery depends on `loadGallery` global from step 3 before module in step 5. Quote has no module bundler — globals only.

### Major UI components

| Component | Implementation |
|-----------|----------------|
| Quote modal | HTML in `index.html`, logic `js/quote.js` |
| Material cards | Hard-coded HTML + CSS gradient `.mat-img` |
| m³ calculator | Collapsible in modal; `calcM3()` in `quote.js` |
| Gallery | Dynamic innerHTML from Firestore or `gallery.json` |
| Mobile bar | Fixed bottom — phone, quote, WhatsApp |

### Admin entry points

| Entry | Target |
|-------|--------|
| Footer `.admin-square` | `vedman-panel.html` |
| `robots.txt` | Disallow `/vedman-panel.html` (not a security control) |

### Current data sources

See [VOS_001_DATA_SOURCE_MAP.md](VOS_001_DATA_SOURCE_MAP.md).

---

## Current request flow

### End-to-end trace

```
Customer click (.js-open | [data-material] | #sendBtn)
  → quote.js openQuote() pre-fills mainCat/subCat
  → Customer fills form (optional fields mostly optional)
  → sendBtn click
  → validate: material required only (alert if missing)
  → build WhatsApp template string
  → window.open("https://wa.me/37122312828?text=" + encodeURIComponent(msg), "_blank")
  → NO on-site confirmation
  → NO server-side record
  → Customer must send message manually in WhatsApp
  → Owner receives unstructured chat message
```

### Fields collected

| Field | ID | Required | In WhatsApp msg |
|-------|-----|----------|-----------------|
| Category | `mainCat` | Yes | Yes |
| Fraction/sub | `subCat` | No | Yes if selected |
| Quantity | `amount` | No (defaults 0) | Yes |
| Unit | unit toggle | No (default **m³**) | Yes |
| Address | `address` | No | Yes or "Nav norādīta" |
| Add-ons | `.addon` | No | Yes or "Nav" |
| Name | `name` | No | Yes or "Nav norādīts" |
| Phone | `phone` | No | Yes or "Nav norādīts" |
| Comment | `comment` | No | Yes or "Nav" |

**Missing vs VEDMAN OS spec:** `intendedUse`, `preferredDeliveryTime`, `materialSlug`, consent checkboxes, `requestId`.

### Validation rules

- Only `!material` → `alert("Izvēlies materiālu vai pakalpojumu.")`
- No phone format check, no quantity > 0, no address requirement

### WhatsApp URL

- Base: `https://wa.me/37122312828`
- Encoding: `encodeURIComponent` on full message — **correct for injection safety**
- Opens new tab/window — **Safari popup blocker risk** if not direct user gesture (click is OK)

### Failure states

| State | Behaviour |
|-------|-----------|
| Popup blocked | Silent failure — customer may think message sent |
| No material selected | Alert only |
| Customer closes WhatsApp without sending | **No VEDMAN visibility** — lost lead |
| Wrong fraction in catalog vs chip | User can still pick any catalog entry in dropdown |

### Pilot fallback

**Keep entire `js/quote.js` wa.me path** until Firestore request + confirmation proven. OS form should fall back to same URL on write failure per [VEDMAN_REQUEST_FLOW.md](../VEDMAN_REQUEST_FLOW.md).

---

## Material catalog audit

### Source of truth today

**Production:** `js/catalog-data.js` (53 line items across 12 categories including services).

**Also duplicated in:** `index.html` material chips (homepage subset only).

### Catalog inventory (materials only — 41 fractions/types)

| Category | Fractions/types | On homepage card |
|----------|-----------------|------------------|
| Dolomīta šķembas | 5 | Yes (5 chips) |
| Dolomīta šķembas (šķirotas) | 4 | No |
| Dolomīta šķembas (mazgātas) | 5 | No |
| Granīta šķembas | 5 | No |
| Drupināti būvgruži | 7 | No |
| Oļi | 2 | No |
| Smilts | 4 | Yes (3 chips — **Pieberamā missing on card**) |
| Grants | 3 | Yes |
| Melnzeme | 2 | Yes |
| Asfalts | 2 | Yes |
| Kūtsmēsli / Komposts | 2 | No |

Plus **12 Pakalpojumi** in catalog (Manipulator on homepage as service card).

### Images

| Location | Type |
|----------|------|
| Material cards | **CSS gradients** (`css/layout.css` `.stones`, `.sand`, etc.) — not photos |
| Gallery | Firebase Storage URLs or `gallery.json` paths |
| Passport pilot | `knowledge/materials/0-32-dolomite/images/` — **placeholders only** |

### Naming inconsistencies

| Issue | Production | Knowledge OS slug |
|-------|------------|-------------------|
| Slug system | None — Latvian strings | `0-32-dolomite` |
| Sand labels | `Mazgāta 0-2` | `sand-washed-0-2` |
| Asphalt | `Frēzēts` / `Karstais` | `asphalt-milled` / `asphalt-hot` |
| Category split | Single catalog key | MATERIAL_INDEX splits variants |

### Comparison with knowledge layer

| Source | Alignment |
|--------|-----------|
| `knowledge/materials-catalog.md` | Mirrors `catalog-data.js` [WEBSITE] — **aligned** |
| `knowledge/materials/MATERIAL_INDEX.md` | P0/P1 slugs; **1 draft folder** (`0-32-dolomite`) |
| `knowledge/quantities-and-densities.md` | All densities `[TBD]` |
| `knowledge/materials/0-32-dolomite/` | Draft — only fraction + taxonomy verified |

### SEO URL readiness

- **No material-specific URLs** on production site
- `pages/materiali.html` is generic stub — no fractions
- `sitemap.xml` lists homepage only
- Passport URL `[TBD]` — structure not implemented

### CTA behaviour

All material CTAs → quote modal → WhatsApp. **No link to educational content.**

---

## Firebase audit

### SDK versions

| Consumer | Version | Load |
|----------|---------|------|
| `gallery-firebase.js` | 10.12.5 | ES module CDN |
| `panel-app.js` | 10.12.5 | ES module CDN |
| `archive/firebase-legacy/firebase.js` | 10.8.0 | Archived |

### Initialization

- **Homepage:** `firebase-config.js` sets globals; module calls `initializeApp(config)` inside `loadFirebaseGallery`
- **Panel:** `ensureFirebaseApp()` → Auth, Storage, Firestore

**Risk:** Duplicate `initializeApp` on same page if extended — currently single call path on index.

### Auth usage

| Surface | Auth |
|---------|------|
| `index.html` | None — public |
| `vedman-panel.html` | Email/password Firebase Auth |
| Authorization | Firestore `users/{uid}` — role + `isActive` |

### Firestore collections (in use)

| Collection | Read | Write |
|------------|------|-------|
| `gallery` | Public (homepage) | Panel — Auth + rules |
| `users` | Signed-in own doc + owner/admin | owner/admin per rules |

**Not implemented:** `materials`, `customer_requests`, `audit_logs` (VEDMAN OS planned).

### Storage

- Path pattern: `{category}/{filename}.webp`
- Public read per Phase C Storage rules in repo
- Upload/delete via panel

### Config exposure

- `firebase-config.js` contains standard **public** Firebase Web API key — expected for client SDK; security relies on **rules**, not key secrecy

### Fallback behaviour

- Gallery: Firebase fail → `gallery.json` → empty message referencing legacy admin
- Panel: Shows error strings; permission-denied hints bootstrap doc

### FIREBASE_RULES.txt local diff (uncommitted)

| Aspect | Assessment |
|--------|------------|
| **What changed** | Removed `userPath()` helper; inlined document paths; renamed `role()` → `userRole()` in Firestore helpers |
| **Intentional** | Appears **syntax/clarity refactor** — same logic |
| **Security impact** | **None** if deployed equivalently |
| **Functional impact** | **None** observed |
| **Risk** | Low locally; **live Console rules may differ from either version** — must verify in Firebase Console |
| **Action** | Owner decision: commit refactor or revert; **separate from VEDMAN OS** |

**Note:** Storage rules in file still use `role()` function name — unchanged between versions.

---

## Admin and panel audit

### Login flow

1. `loginEmail` + `loginPass` → `signInWithEmailAndPassword`
2. `onAuthStateChanged` → `resolveAuthorization`
3. Read `users/{uid}` — deny if missing, inactive, invalid role
4. Show gallery app

**No hardcoded credentials in production panel** (legacy removed per Phase B).

### Authorization checks

| Layer | Enforcement |
|-------|-------------|
| UI | `canDeleteInPanel()` — owner/admin only |
| Firestore rules | RBAC in committed Phase C rules |
| **Gap** | UI allows upload for all roles; rules must match — **verify live deploy** |

### Owner workflow today

1. Sign in to panel  
2. Upload images/videos with category, title, description  
3. WEBP compression client-side (1600px)  
4. Optional delete (owner/admin)  
5. **No quote/request management**  
6. **No material content management**

### Missing validation

- Upload: no file size cap in JS (Firebase limits apply)
- Title/description optional — defaults to category label
- No virus/malware scanning (expected for static SMB site)

### Safari / macOS risks

- **HEIC upload:** Falls back to raw upload with warning — OK
- **Canvas WEBP:** Supported modern Safari — OK
- **Drag-drop:** Implemented on panel drop zone

### Duplicated admin logic

- `archive/admin.html` — local JSON gallery editor (**obsolete**)
- `archive/legacy-admin/` — separate admin stack
- Production: **only** `vedman-panel.html`

---

## Security and privacy audit

| Category | Finding | Location |
|----------|---------|----------|
| Hardcoded passwords | **Not found** in production JS | — |
| Public Firebase config | Present — **expected** | `firebase-config.js` |
| Gallery XSS | **innerHTML** with Firestore `title`, `description`, `url` | `gallery-firebase.js`, `panel-app.js` |
| Quote XSS | N/A — data goes to WhatsApp not DOM HTML | `quote.js` |
| Open redirect | wa.me fixed number — **OK** | `quote.js` |
| Admin obscurity | Footer link + robots disallow — **not security** | `index.html`, `robots.txt` |
| PII handling | Collected in form → WhatsApp only; **no retention policy on site** | `privacy.html` partial |
| Consent | **No checkbox** in quote form | `index.html` |
| Rate limiting | **None** on quote | — |
| Spam | **None** | — |
| Live rules vs repo | **Unknown** — if old open rules still live, gallery writable by anyone | Firebase Console |

**No secret values documented in this audit.**

---

## SEO and discoverability audit

| Element | Status |
|---------|--------|
| `<title>` | Present on homepage — good |
| `meta description` | Present — good |
| `canonical` | `https://vedman.lv/` — homepage only |
| Open Graph | **Missing** on homepage |
| JSON-LD | **Missing** |
| `sitemap.xml` | Single URL |
| `robots.txt` | Allows `/`, disallows panel |
| H1 | One on homepage — good |
| Material URLs | **None** |
| Image alt | Logo yes; material cards **no images**; gallery uses titles |
| Internal links | Nav anchors only; stub pages weak |
| Duplicate content | Stub `pages/*` thin — low risk today, high if indexed without content |

**Passport support:** Static `pages/` pattern can host passport HTML; **no router, no slug URLs yet**.

---

## Performance and compatibility audit

| Check | Finding |
|-------|---------|
| Images | Gallery lazy-load; material cards are CSS — lightweight but off-brand |
| Render-blocking | Google Fonts external — blocking |
| Inline HTML size | `index.html` ~173 lines — reasonable post-refactor |
| Duplicate listeners | Quote binds once at load — OK |
| Mobile | Bottom bar, modal, viewport meta — OK |
| Broken refs | Gallery empty state mentions `/gallery/` paths — **legacy copy** |
| manifest.json | **Empty icons array** — PWA incomplete |
| Console errors | Firebase fail → `console.warn` only — graceful |

---

## VEDMAN OS readiness matrix

| Capability | Status | Why |
|------------|--------|-----|
| **0/32 digital passport** | **BLOCKED** | No public page; images/content `[TBD]`; only Git draft |
| **Structured request form** | **PARTIALLY READY** | Modal exists; missing OS fields, consent, slug binding |
| **Firestore request storage** | **BLOCKED** | No collection, rules, or write code |
| **Owner notification** | **BLOCKED** | No channel implemented |
| **Customer one-link confirmation** | **BLOCKED** | Current flow opens WhatsApp only |
| **Controlled assistant** | **PARTIALLY READY** | Knowledge + rules documented; no API/runtime |
| **Media library** | **PARTIALLY READY** | Gallery Storage + panel upload; not linked to material slugs |
| **Owner dashboard** | **PARTIALLY READY** | Panel for gallery only; no requests/materials admin |

---

## Critical blockers (summary)

1. Owner content for 0-32 passport (photos, prose, verified fields)  
2. Firebase rules **live deploy** verification + `customer_requests` rules design  
3. No material slug mapping in production catalog  
4. No passport URL / page template  
5. Owner decision: notification + confirmation channels  
6. Consent / privacy alignment for server-side PII storage  

Detail: [VOS_001_BLOCKERS_AND_DECISIONS.md](VOS_001_BLOCKERS_AND_DECISIONS.md).

---

## Recommended sequence

1. **VOS-002** — Owner completes 0-32 content  
2. **VOS-004** — Verify/deploy Firebase RBAC; extend rules spec for `customer_requests`  
3. **VOS-003** — Git → JSON publish exporter (dry-run)  
4. **VOS-005** — Static passport page (new page, not modifying existing homepage logic beyond link)  
5. **VOS-006–009** — Request form, rules tests, notifications, confirmation  
6. **VOS-010** — E2E pilot sign-off  

---

## Metrics baseline (Phase 0)

| Metric | Baseline note |
|--------|---------------|
| M1 Owner time per request | **Not measured** — unstructured WhatsApp |
| M2 Complete requests | **Unknown** — many optional fields empty |
| M7 Abandonment | **Not tracked** |
| M5 Passport link opens | N/A — no passport URL |

Recommend owner time study during pilot week 1.

---

*Inspection-only audit. No production files modified.*
