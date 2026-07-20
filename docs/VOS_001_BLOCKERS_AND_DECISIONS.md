# VOS-001 — Blockers & Owner Decisions

| Field | Value |
|-------|-------|
| **Task ID** | VOS-001 |
| **Date** | 2026-07-16 |
| **Parent** | [VOS_001_REPOSITORY_AUDIT.md](VOS_001_REPOSITORY_AUDIT.md) |

---

## A. Critical blockers before 0/32 pilot

### B-A01 — Owner content for 0-32 passport incomplete

| Field | Detail |
|-------|--------|
| **Issue** | Pilot passport is Draft; images missing; prose/coefficient `[TBD]` |
| **Evidence** | [knowledge/materials/0-32-dolomite/material.md](../knowledge/materials/0-32-dolomite/material.md) — verification Draft |
| **Affected file** | `knowledge/materials/0-32-dolomite/*` |
| **Business impact** | Cannot launch trustworthy passport or confirmation link |
| **Security impact** | None |
| **Proposed action** | Owner completes VOS-002 content package |
| **Code change required** | No — owner content + photography |
| **Owner approval** | **Yes** |

---

### B-A02 — No public material passport page

| Field | Detail |
|-------|--------|
| **Issue** | No URL serves digital passport; sitemap has homepage only |
| **Evidence** | [sitemap.xml](../sitemap.xml); no `pages/passport/` or slug routes |
| **Affected file** | N/A — not built |
| **Business impact** | Customer confirmation link has no destination (M5) |
| **Security impact** | None |
| **Proposed action** | VOS-005 — new static passport page |
| **Code change required** | **Yes** (new page — separate from homepage edit policy) |
| **Owner approval** | **Yes** — URL path + go-live |

---

### B-A03 — No materialSlug in production catalog

| Field | Detail |
|-------|--------|
| **Issue** | Quote flow uses Latvian strings only; OS entities keyed by slug |
| **Evidence** | [js/catalog-data.js](../js/catalog-data.js), [js/quote.js](../js/quote.js) |
| **Affected file** | Catalog + quote pipeline |
| **Business impact** | Cannot link requests/passports reliably |
| **Security impact** | Low — mapping errors could send wrong passport |
| **Proposed action** | VOS-003 mapping table in publish exporter; wire in VOS-006 |
| **Code change required** | **Yes** |
| **Owner approval** | Yes — confirm slug convention |

---

### B-A04 — Firebase live rules state unknown

| Field | Detail |
|-------|--------|
| **Issue** | Repo has Phase C RBAC; Console deploy not verified in audit |
| **Evidence** | [docs/FINAL_PHASE_C_APPROVAL.md](FINAL_PHASE_C_APPROVAL.md); [FIREBASE_RULES.txt](../FIREBASE_RULES.txt) |
| **Affected file** | Firebase Console |
| **Business impact** | Gallery spam/delete if old open rules live |
| **Security impact** | **High** if pre-Phase-C rules active |
| **Proposed action** | VOS-004 — Console audit + deploy committed rules |
| **Code change required** | Rules deploy (Console), optional commit local diff separately |
| **Owner approval** | **Yes** |

---

### B-A05 — No customer_requests collection or rules

| Field | Detail |
|-------|--------|
| **Issue** | Structured requests cannot persist |
| **Evidence** | [VEDMAN_DATA_MODEL_PLAN.md](../VEDMAN_DATA_MODEL_PLAN.md); no Firestore writes in quote.js |
| **Affected file** | Future rules + JS |
| **Business impact** | Core OS value blocked |
| **Security impact** | **High** if added without rules — PII exposure |
| **Proposed action** | Design rules with VOS-004; implement VOS-006 |
| **Code change required** | **Yes** |
| **Owner approval** | Yes |

---

### B-A06 — Owner notification channel undecided

| Field | Detail |
|-------|--------|
| **Issue** | No email, WhatsApp API, or panel queue for new requests |
| **Evidence** | [VEDMAN_REQUEST_FLOW.md](../VEDMAN_REQUEST_FLOW.md) — `[TBD]` |
| **Affected file** | N/A |
| **Business impact** | Owner may not see structured requests (M1) |
| **Security impact** | Med — PII in notification channel |
| **Proposed action** | Owner picks primary channel before VOS-007 |
| **Code change required** | **Yes** for automation |
| **Owner approval** | **Yes** |

---

### B-A07 — No consent capture for server-side PII

| Field | Detail |
|-------|--------|
| **Issue** | Quote form has no checkbox; privacy assumes WhatsApp-only |
| **Evidence** | [index.html](../index.html) modal; [privacy.html](../privacy.html) |
| **Affected file** | Form + privacy page |
| **Business impact** | GDPR risk when storing requests in Firestore |
| **Security impact** | **Med** — compliance |
| **Proposed action** | VOS-014 — consent UI + legal text |
| **Code change required** | **Yes** |
| **Owner approval** | **Yes** — LV consent text |

---

## B. Important issues during pilot

### B-B01 — Default unit m³ vs tonnes-first policy

| Field | Detail |
|-------|--------|
| **Issue** | Modal defaults to m³; business policy prefers tonnes |
| **Evidence** | [js/quote.js](../js/quote.js) line 7; [knowledge/pricing-and-ordering.md](../knowledge/pricing-and-ordering.md) |
| **Affected file** | `index.html`, `quote.js` |
| **Business impact** | Misaligned customer expectations |
| **Security impact** | None |
| **Proposed action** | OS form default `t` + education copy |
| **Code change required** | Yes — Phase 3 |
| **Owner approval** | Yes |

---

### B-B02 — Gallery innerHTML XSS surface

| Field | Detail |
|-------|--------|
| **Issue** | Firestore title/description/url inserted via innerHTML |
| **Evidence** | [js/gallery-firebase.js](../js/gallery-firebase.js), [js/panel-app.js](../js/panel-app.js) |
| **Affected file** | Gallery JS |
| **Business impact** | Low if only trusted staff upload |
| **Security impact** | **Med** — compromised panel account |
| **Proposed action** | Escape or use textContent/DOM APIs in hardening pass |
| **Code change required** | Yes |
| **Owner approval** | No |

---

### B-B03 — Missing intendedUse and delivery time fields

| Field | Detail |
|-------|--------|
| **Issue** | OS request schema fields not in current form |
| **Evidence** | [VEDMAN_ASSISTANT_ARCHITECTURE.md](../VEDMAN_ASSISTANT_ARCHITECTURE.md) vs quote modal |
| **Affected file** | `index.html` / future request form |
| **Business impact** | Incomplete owner summaries (M2) |
| **Security impact** | None |
| **Proposed action** | Add on passport request form (VOS-006) |
| **Code change required** | Yes |
| **Owner approval** | Yes — required vs optional |

---

### B-B04 — WhatsApp popup / no on-site confirmation

| Field | Detail |
|-------|--------|
| **Issue** | Customer gets no VEDMAN confirmation; may not send WA message |
| **Evidence** | [js/quote.js](../js/quote.js) — only `window.open` |
| **Affected file** | Quote flow |
| **Business impact** | Lost leads (M7) |
| **Security impact** | None |
| **Proposed action** | VOS-008 success page + optional API |
| **Code change required** | Yes |
| **Owner approval** | Yes — message text |

---

### B-B05 — Duplicate gallery category constants

| Field | Detail |
|-------|--------|
| **Issue** | Same CATEGORIES array in two JS files |
| **Evidence** | [js/panel-app.js](../js/panel-app.js), [js/gallery-firebase.js](../js/gallery-firebase.js) |
| **Affected file** | Both |
| **Business impact** | Drift if one updated |
| **Security impact** | None |
| **Proposed action** | Extract shared module in refactor |
| **Code change required** | Yes |
| **Owner approval** | No |

---

### B-B06 — Material cards use gradients not photos

| Field | Detail |
|-------|--------|
| **Issue** | Violates photography standards; weak trust |
| **Evidence** | [css/layout.css](../css/layout.css) `.mat-img` |
| **Affected file** | Homepage CSS |
| **Business impact** | Trust / conversion |
| **Security impact** | None |
| **Proposed action** | Link cards to passport hero images Phase 2+ |
| **Code change required** | Yes — M3/Material Center |
| **Owner approval** | Yes — photography |

---

### B-B07 — SEO stubs thin / sitemap incomplete

| Field | Detail |
|-------|--------|
| **Issue** | 9 stub pages; no material URLs in sitemap |
| **Evidence** | [pages/materiali.html](../pages/materiali.html), [sitemap.xml](../sitemap.xml) |
| **Affected file** | pages/, sitemap |
| **Business impact** | Discovery delay |
| **Security impact** | None |
| **Proposed action** | Add passport to sitemap on VOS-005 go-live |
| **Code change required** | Yes |
| **Owner approval** | No |

---

## C. Later improvements

### B-C01 — Open Graph and JSON-LD on homepage

Evidence: no `og:` tags in [index.html](../index.html). Phase 4 SEO.

### B-C02 — PWA manifest icons empty

Evidence: [manifest.json](../manifest.json) `"icons":[]`. Low priority.

### B-C03 — Deprecate gallery.json workflow

Evidence: empty state still references admin.html. After Firebase stable.

### B-C04 — Archive legacy admin paths

Evidence: [archive/admin.html](../archive/admin.html). No production link.

### B-C05 — Assistant API (Phase 6)

Evidence: [knowledge/ai-operating-rules.md](../knowledge/ai-operating-rules.md) — library Draft.

### B-C06 — Analytics M1–M10

Evidence: No tracking scripts on quote flow.

### B-C07 — Rate limiting / CAPTCHA on requests

Evidence: No spam controls. Phase 3 hardening (VOS-019).

---

## D. Owner decisions required

| ID | Decision | Blocks | Default if deferred |
|----|----------|--------|---------------------|
| D-01 | Canonical passport URL path | VOS-005, VOS-008 | Cannot send confirmation link |
| D-02 | Primary owner notification channel | VOS-007 | Manual Firestore Console read |
| D-03 | WhatsApp Business API vs on-screen only | VOS-008 | On-screen success only |
| D-04 | 0-32 coefficient: show or hide | Passport calculator | Hide until verified |
| D-05 | Quarry/producer name public for 0-32 | Passport §22 | Omit field |
| D-06 | Consent text (LV) for Firestore storage | VOS-006, VOS-014 | Cannot store PII server-side |
| D-07 | Required request fields (address, phone, intendedUse) | VOS-006 | Keep current loose validation |
| D-08 | Homepage quote modal cutover timing | VOS-016 | Parallel wa.me only on passport |
| D-09 | Commit or revert FIREBASE_RULES.txt local diff | Ops hygiene | Keep uncommitted local edit |
| D-10 | Verify Firebase Console rules match Phase C | VOS-004 | Security unknown |
| D-11 | Optional WhatsApp hero preview image in confirmation | VOS-008 | Link only (recommended) |
| D-12 | Data retention period for requests | Privacy policy | `[TBD]` |

---

## FIREBASE_RULES.txt local modification

| Field | Detail |
|-------|--------|
| **Issue** | Uncommitted refactor in working tree |
| **Evidence** | `git diff FIREBASE_RULES.txt` — inline paths, rename `role()` → `userRole()` |
| **Classification** | Syntax/clarity — **not security functional change** |
| **Risk** | Low; separate from OS pilot |
| **Proposed action** | Owner decides commit separately or discard — **not part of docs commit** |
| **Owner approval** | Yes |

---

*Generated by VOS-001.*
