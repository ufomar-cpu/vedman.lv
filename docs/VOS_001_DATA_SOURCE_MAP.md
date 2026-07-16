# VOS-001 — Data Source Map

| Field | Value |
|-------|-------|
| **Task ID** | VOS-001 |
| **Date** | 2026-07-16 |
| **Parent** | [VOS_001_REPOSITORY_AUDIT.md](VOS_001_REPOSITORY_AUDIT.md) |

---

## Summary hierarchy (target vs today)

| Priority | Target (VEDMAN OS) | Today |
|----------|-------------------|-------|
| 1 | Owner confirmation | Owner verbal |
| 2 | `knowledge/materials/` (verified) | Partial — draft only |
| 3 | Firestore published runtime | Gallery only |
| 4 | `js/catalog-data.js` | **De facto production catalog** |
| 5 | Hard-coded `index.html` | Homepage subset |

---

## Data sources

### DS-01 — Hard-coded HTML (`index.html`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Engineering / marketing |
| **Contents** | Hero copy, 6 material cards, chips, services, contact, hours, footer |
| **Consumers** | Browser render |
| **SSOT status** | **Duplicate** of catalog for fractions shown on cards |
| **Duplication** | Chips vs `catalog-data.js` (Smilts missing Pieberamā on card) |
| **Migration target** | Generate cards from OS material index OR keep curated homepage subset with slug links |
| **Verification** | Manual — phones/hours match [knowledge/company-identity.md](../knowledge/company-identity.md) |

---

### DS-02 — JavaScript catalog (`js/catalog-data.js`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Engineering (sync from business) |
| **Contents** | `window.VEDMAN_CATALOG` — 12 categories, 53 entries |
| **Consumers** | `js/quote.js` (modal dropdowns) |
| **SSOT status** | **Production SSOT** for quote material names |
| **Duplication** | Mirrored in `knowledge/materials-catalog.md`; partial in HTML chips |
| **Migration target** | Generated from `knowledge/materials/MATERIAL_INDEX.md` + slug map |
| **Verification** | [WEBSITE] — matches committed file |

**Slug gap:** No `materialSlug` field — OS must map `"Dolomīta šķembas" + "0-32"` → `0-32-dolomite`.

---

### DS-03 — Quote modal HTML (`index.html` #quoteModal)

| Attribute | Value |
|-----------|-------|
| **Owner** | Engineering |
| **Contents** | Form fields, add-on buttons, unit toggle, calculator UI |
| **Consumers** | `js/quote.js` |
| **SSOT status** | UI structure only |
| **Duplication** | Add-ons not in catalog object — hard-coded `.addon` buttons |
| **Migration target** | Shared request schema [VEDMAN_DATA_MODEL_PLAN.md](../VEDMAN_DATA_MODEL_PLAN.md) |
| **Verification** | Field list vs [knowledge/pricing-and-ordering.md](../knowledge/pricing-and-ordering.md) |

**Add-ons (hard-coded):** Pāri žogam, Šaura vieta, Izlīdzināt, Steidzami, Vajag konsultāciju.

---

### DS-04 — WhatsApp message template (`js/quote.js`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Business / sales |
| **Contents** | Latvian structured message with emoji headers |
| **Consumers** | Customer via wa.me |
| **SSOT status** | **Implicit** — only in JS |
| **Duplication** | Described in [knowledge/pricing-and-ordering.md](../knowledge/pricing-and-ordering.md) |
| **Migration target** | Template in knowledge + OS notification formatter |
| **Verification** | Owner review |

---

### DS-05 — JSON gallery (`gallery.json`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Staff via legacy admin or manual edit |
| **Contents** | `categories[]`, `items[]` with `src`, `title`, `description`, `category` |
| **Consumers** | `js/gallery-json.js` when Firebase empty/fails |
| **SSOT status** | **Fallback only** — Firebase primary |
| **Duplication** | Category IDs overlap panel CATEGORIES |
| **Migration target** | Deprecate after Firebase migration verified (V5 P4) |
| **Verification** | File present; may be empty or stale |

---

### DS-06 — Firestore `gallery` collection

| Attribute | Value |
|-----------|-------|
| **Owner** | Staff via panel |
| **Contents** | `category`, `title`, `description`, `url`, `path`, `type`, timestamps, sizes |
| **Consumers** | `gallery-firebase.js`, `panel-app.js` |
| **SSOT status** | **SSOT for public gallery** when populated |
| **Duplication** | Category list hard-coded in JS (2 places) |
| **Migration target** | Link items to `materialSlug` optional metadata Phase 2+ |
| **Verification** | Live data — not inspected in this audit |

---

### DS-07 — Firebase Storage (gallery media)

| Attribute | Value |
|-----------|-------|
| **Owner** | Staff uploads |
| **Contents** | WEBP/MP4 under `{category}/` paths |
| **Consumers** | Gallery URLs in Firestore |
| **SSOT status** | **SSOT for gallery binary assets** |
| **Duplication** | Separate from material passport `images/` in Git |
| **Migration target** | `material_images` entity + passport folder sync |
| **Verification** | Real VEDMAN photos per handbook §16 |

---

### DS-08 — Firestore `users/{uid}`

| Attribute | Value |
|-----------|-------|
| **Owner** | Owner bootstrap |
| **Contents** | `role`, `isActive` |
| **Consumers** | `panel-app.js`, security rules |
| **SSOT status** | **SSOT for panel authorization** |
| **Duplication** | None |
| **Migration target** | Extend for OS admin roles if needed |
| **Verification** | Bootstrap per [docs/FIREBASE_USERS_BOOTSTRAP.md](FIREBASE_USERS_BOOTSTRAP.md) |

---

### DS-09 — Git knowledge modules (`knowledge/*.md`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Business owner |
| **Contents** | Policies, FAQ, voice, catalog mirror, channels |
| **Consumers** | Future AI, staff, planning |
| **SSOT status** | **Target SSOT** for business facts |
| **Duplication** | Catalog mirrors `catalog-data.js`; entry points mirror root planning docs |
| **Migration target** | Runtime read via publish pipeline |
| **Verification** | Mostly Partial/Draft |

---

### DS-10 — Git material passports (`knowledge/materials/{slug}/`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Business owner |
| **Contents** | `material.md`, `faq.md`, `images/` per [MATERIAL_CENTER_MASTER_PLAN.md](../MATERIAL_CENTER_MASTER_PLAN.md) |
| **Consumers** | Planned: web, AI, PDF, confirmations |
| **SSOT status** | **Target SSOT** for material education |
| **Duplication** | Not yet wired to production |
| **Migration target** | Firestore `materials/{slug}` publish |
| **Verification** | `0-32-dolomite` = Draft; most fields `[TBD]` |

---

### DS-11 — Shared snippets (`knowledge/materials/_shared/`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Business |
| **Contents** | Delivery block, calculator disclaimer |
| **Consumers** | Passport template, future confirmations |
| **SSOT status** | **SSOT** for reusable blocks |
| **Duplication** | Calculator logic duplicated in `quote.js` (formula only) |
| **Migration target** | Single disclaimer component on web + messages |
| **Verification** | Partial |

---

### DS-12 — CSS material visuals (`css/layout.css`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Design |
| **Contents** | Gradient backgrounds `.stones`, `.sand`, etc. |
| **Consumers** | Homepage material cards |
| **SSOT status** | **Not factual material data** — placeholder visuals |
| **Duplication** | Conflicts with photography standards |
| **Migration target** | Real `hero.webp` per passport |
| **Verification** | N/A — replace with photos |

---

### DS-13 — External links (hard-coded)

| Attribute | Value |
|-----------|-------|
| **Owner** | Business |
| **Contents** | `tel:+37122312828`, `tel:+37120080098`, `https://wa.me/37122312828` |
| **Consumers** | All pages |
| **SSOT status** | Duplicated across HTML |
| **Duplication** | Also in [knowledge/company-identity.md](../knowledge/company-identity.md) |
| **Migration target** | Single config snippet (future) |
| **Verification** | [WEBSITE] |

---

### DS-14 — SEO stub pages (`pages/*.html`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Engineering placeholder |
| **Contents** | Minimal H1 + WhatsApp CTA |
| **Consumers** | Direct URL / future SEO |
| **SSOT status** | **Not material data** |
| **Duplication** | Competes with future passport URLs |
| **Migration target** | Replace with passport pages or 301 |
| **Verification** | Thin content — do not index heavily until filled |

---

### DS-15 — Panel category list (`js/panel-app.js` CATEGORIES)

| Attribute | Value |
|-----------|-------|
| **Owner** | Engineering |
| **Contents** | 10 gallery category id/label pairs |
| **Consumers** | Panel upload, gallery-firebase tabs |
| **SSOT status** | **Duplicate** — same list in two JS files |
| **Duplication** | `gallery-firebase.js` lines 18–19 identical list |
| **Migration target** | Single `gallery-categories.js` or Firestore config |
| **Verification** | Manual sync risk |

---

### DS-16 — Firebase client config (`firebase-config.js`)

| Attribute | Value |
|-----------|-------|
| **Owner** | Firebase project |
| **Contents** | apiKey, projectId, storageBucket, etc. |
| **Consumers** | Panel, gallery module |
| **SSOT status** | **SSOT for client Firebase identity** |
| **Duplication** | None in repo |
| **Migration target** | Optional build-time inject (V5 P8) |
| **Verification** | Public client config — protect via rules |

---

## Planned sources (not implemented)

| ID | Source | Migration from |
|----|--------|----------------|
| DS-P1 | Firestore `materials/{slug}` | Git passports |
| DS-P2 | Firestore `customer_requests` | Quote form |
| DS-P3 | Firestore `audit_logs` | Assistant + publish |
| DS-P4 | Owner notification channel | N/A |
| DS-P5 | Customer confirmation template | [VEDMAN_REQUEST_FLOW.md](../VEDMAN_REQUEST_FLOW.md) |
| DS-P6 | Assistant verified read API | Git + Firestore |

---

## Catalog ↔ slug mapping (pilot)

| Production selection | OS slug | Status |
|---------------------|---------|--------|
| Dolomīta šķembas + 0-32 | `0-32-dolomite` | Mapping **not in code** — documented only |
| Smilts + Mazgāta 0-2 | `sand-washed-0-2` | Not wired |
| Grants + Skalota 0-4 | `gravel-scalped-0-4` | Not wired |

**Recommendation:** Add mapping table in publish exporter (VOS-003) — not in production JS until Phase 3.

---

## Duplication heat map

| Data | Locations | Severity |
|------|-----------|----------|
| Material fractions (homepage) | HTML + catalog-data.js | Med |
| Full catalog | catalog-data.js + materials-catalog.md | Low (intentional mirror) |
| Gallery categories | panel-app.js + gallery-firebase.js | Med |
| Contact phones | index, pages, knowledge | Low |
| Calculator formula | quote.js + knowledge disclaimers | Low |
| WhatsApp template | quote.js + knowledge pricing doc | Med |

---

*Generated by VOS-001.*
