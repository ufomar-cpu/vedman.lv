# VEDMAN OS — Task Backlog

| Field | Value |
|-------|-------|
| **Document type** | Prioritized implementation backlog |
| **Date** | 2026-07-16 |
| **Status** | Planning |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_OS_ROADMAP.md](VEDMAN_OS_ROADMAP.md) · [VEDMAN_OS_MASTER_PLAN.md](VEDMAN_OS_MASTER_PLAN.md) |

**Legend:** P0 = critical path to pilot · P1 = soon after pilot · P2 = later  
**Owner approval:** ✓ = required before merge/deploy

---

## P0 — Pilot critical path

### VOS-001 — Phase 0 repository and knowledge audit ✅ COMPLETED

| Field | Value |
|-------|-------|
| **Status** | **Completed** 2026-07-16 |
| **Priority** | P0 |
| **Business value** | Prevents building on wrong assumptions; baseline metrics |
| **Risk** | Low |
| **Complexity** | 2 |
| **Dependencies** | None |
| **Owner approval** | ✓ sign-off on audit findings |
| **Deliverables** | [docs/VOS_001_REPOSITORY_AUDIT.md](docs/VOS_001_REPOSITORY_AUDIT.md) · [docs/VOS_001_FILE_MAP.md](docs/VOS_001_FILE_MAP.md) · [docs/VOS_001_DATA_SOURCE_MAP.md](docs/VOS_001_DATA_SOURCE_MAP.md) · [docs/VOS_001_BLOCKERS_AND_DECISIONS.md](docs/VOS_001_BLOCKERS_AND_DECISIONS.md) |
| **Acceptance criteria** | Catalog slugs mapped to MATERIAL_INDEX; all `[TBD]` counted; security gap list; M1/M7 baseline notes — **met** |

---

### VOS-002 — Complete 0-32-dolomite owner content package

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Unblocks live passport — pilot cannot ship without content |
| **Risk** | Medium — schedule blocker |
| **Complexity** | 1 (owner work, not dev) |
| **Dependencies** | Photography on site |
| **Owner approval** | ✓ content verification |
| **Files likely affected** | [knowledge/materials/0-32-dolomite/material.md](knowledge/materials/0-32-dolomite/material.md), [faq.md](knowledge/materials/0-32-dolomite/faq.md), `images/*.webp` |
| **Acceptance criteria** | §7,8,9,25 filled; 5 image slots populated; FAQ ≥5 Q&A; coefficient `[TBD]` or verified with source doc; status → Partial minimum |

---

### VOS-003 — Material publish schema and dry-run exporter

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | One source of truth Git → runtime |
| **Risk** | Medium — schema drift |
| **Complexity** | 3 |
| **Dependencies** | VOS-001, Phase 1 |
| **Owner approval** | ✓ field mapping |
| **Files likely affected** | `scripts/` or `tools/` `[TBD]`, [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md), [knowledge/materials/_schema/](knowledge/materials/_schema/) |
| **Acceptance criteria** | CLI exports `0-32-dolomite` to validated JSON; unverified fields omitted; no Firebase write yet |

---

### VOS-004 — Firebase security RBAC (V5 P6) for OS collections

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Safe customer_requests writes |
| **Risk** | High if skipped |
| **Complexity** | 4 |
| **Dependencies** | [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) |
| **Owner approval** | ✓ before rules deploy |
| **Files likely affected** | [FIREBASE_RULES.txt](FIREBASE_RULES.txt), [FIREBASE_RULES_SECURE_NEXT.txt](FIREBASE_RULES_SECURE_NEXT.txt), [js/panel-app.js](js/panel-app.js), [vedman-panel.html](vedman-panel.html) |
| **Acceptance criteria** | Auth + users/{uid} roles; gallery writes gated; anonymous cannot read requests; public gallery read unchanged |

---

### VOS-005 — Pilot passport static page (0-32)

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Customer education + SEO + confirmation link target |
| **Risk** | Medium — URL structure |
| **Complexity** | 3 |
| **Dependencies** | VOS-002, VOS-003 |
| **Owner approval** | ✓ before index/link |
| **Files likely affected** | `pages/materiali/` or `pages/passport/` `[TBD]`, `css/pages.css`, [knowledge/materials/0-32-dolomite/](knowledge/materials/0-32-dolomite/) |
| **Acceptance criteria** | Mobile page live at canonical URL; 30-section layout per Material Center; schema.org Product stub; no `[TBD]` visible to customer |

---

### VOS-006 — Structured request form (passport CTA)

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Core OS value — structured leads |
| **Risk** | High — regression on quotes |
| **Complexity** | 4 |
| **Dependencies** | VOS-004, VOS-005 |
| **Owner approval** | ✓ field list |
| **Files likely affected** | New `js/request-form.js` `[TBD]`, passport page, Firestore rules |
| **Acceptance criteria** | All pilot fields validated; creates `customer_requests`; dedup; wa.me fallback on failure; legacy [js/quote.js](js/quote.js) unchanged on homepage until cutover |

---

### VOS-007 — Owner notification (Phase 4 minimum)

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Reduces M1 owner manual time |
| **Risk** | Low |
| **Complexity** | 3 |
| **Dependencies** | VOS-006 |
| **Owner approval** | ✓ channel + template |
| **Files likely affected** | Firebase Function or `[TBD]` email service, [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) |
| **Acceptance criteria** | Owner receives structured summary with requestId, escalation flags, passport link within SLA |

---

### VOS-008 — Customer one-link confirmation

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Professional closure; drives M5 passport opens |
| **Risk** | Medium — WhatsApp API |
| **Complexity** | 3 |
| **Dependencies** | VOS-006 |
| **Owner approval** | ✓ LV message text |
| **Files likely affected** | Success page, optional WhatsApp API integration `[TBD]` |
| **Acceptance criteria** | Exactly 1 automated message; passport URL; on-screen success always; no image gallery in WhatsApp |

---

### VOS-009 — Firestore rules unit tests for requests

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Prevents PII leak |
| **Risk** | High if missing |
| **Complexity** | 2 |
| **Dependencies** | VOS-004, VOS-006 |
| **Owner approval** | — |
| **Files likely affected** | `docs/` or `tests/firestore/` `[TBD]` |
| **Acceptance criteria** | Tests pass: anon create request, anon cannot read; editor cannot read supplier_notes |

---

### VOS-010 — Pilot E2E test checklist execution

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Business value** | Confirms pilot ready |
| **Risk** | Low |
| **Complexity** | 2 |
| **Dependencies** | VOS-005 through VOS-008 |
| **Owner approval** | ✓ pilot go-live |
| **Files likely affected** | [docs/VALIDATION_CHECKLIST.md](docs/VALIDATION_CHECKLIST.md) |
| **Acceptance criteria** | All items in [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) pilot acceptance checked |

---

## P1 — Post-pilot (first 10 recommended = P0 above)

### VOS-011 — Extend passport template to P0 slug batch

| Priority P1 · Value: scale content · Risk: low · Complexity: 2 · Deps: VOS-010 · Owner ✓  
**Files:** [knowledge/materials/MATERIAL_INDEX.md](knowledge/materials/MATERIAL_INDEX.md), 14 P0 folders  
**Acceptance:** Empty scaffold folders for P0 slugs; MATERIAL_INDEX updated

---

### VOS-012 — Publish pipeline Firebase write (materials collection)

| P1 · Value: runtime SSOT · Risk: medium · Complexity: 3 · Deps: VOS-003, VOS-004 · Owner ✓  
**Files:** publish script, Firestore, Storage for images  
**Acceptance:** Publish 0-32 to Firestore; public read matches JSON export

---

### VOS-013 — Panel request queue (read-only)

| P1 · Value: owner visibility · Risk: low · Complexity: 3 · Deps: VOS-006, VOS-004 · Owner ✓  
**Files:** [vedman-panel.html](vedman-panel.html), [js/panel-app.js](js/panel-app.js)  
**Acceptance:** Owner sees new requests sorted by date; open detail view

---

### VOS-014 — Consent capture UI + communication_consent records

| P1 · Value: GDPR · Risk: medium · Complexity: 2 · Deps: VOS-006 · Owner ✓ legal text  
**Files:** request form, [privacy.html](privacy.html) update task  
**Acceptance:** consentContact required; consentMarketing opt-in; stored in Firestore

---

### VOS-015 — Coefficient display with source (when verified)

| P1 · Value: trust · Risk: high if unverified · Complexity: 2 · Deps: owner lab doc · Owner ✓  
**Files:** passport page, [knowledge/materials/_shared/calculator-disclaimer.md](knowledge/materials/_shared/calculator-disclaimer.md)  
**Acceptance:** Coefficient shown only with source link + disclaimer; hidden if `[TBD]`

---

### VOS-016 — Homepage quote modal → OS integration (optional cutover)

| P1 · Value: funnel volume · Risk: high regression · Complexity: 4 · Deps: VOS-010 · Owner ✓  
**Files:** [js/quote.js](js/quote.js), [index.html](index.html)  
**Acceptance:** Feature flag; when on, submits to OS; when off, wa.me only

---

### VOS-017 — Assistant API skeleton (L1 FAQ only)

| P1 · Value: Phase 6 foundation · Risk: medium · Complexity: 4 · Deps: VOS-012 · Owner ✓  
**Files:** `[TBD: functions/]`  
**Acceptance:** Returns verified FAQ answers for 0-32; L3 on price questions; audit log

---

### VOS-018 — Analytics events for M4/M5/M7

| P1 · Value: metrics · Risk: low · Complexity: 2 · Deps: VOS-008 · Owner ✓  
**Files:** `[TBD: analytics]`  
**Acceptance:** confirmation_success, passport_link_click, form_abandon tracked

---

### VOS-019 — Spam protection (honeypot + rate limit)

| P1 · Value: owner time · Risk: low · Complexity: 2 · Deps: VOS-006  
**Acceptance:** Rate limit blocks burst; honeypot catches bots

---

### VOS-020 — SS.lv export draft for 0-32

| P1 · Value: channel reuse · Risk: low · Complexity: 2 · Deps: VOS-005 · Owner ✓ per post  
**Files:** export template [knowledge/channels.md](knowledge/channels.md)  
**Acceptance:** Unique text; links to passport; owner manual post

---

## P2 — Later backlog (summary)

| ID | Task | Phase |
|----|------|-------|
| VOS-021 | Full assistant L2/L3 | 6 |
| VOS-022 | Panel material publish UI | 7 |
| VOS-023 | Project Advisor integration | 10 |
| VOS-024 | PDF passport export | 9 |
| VOS-025 | WhatsApp Business API inbound | 6 |
| VOS-026 | Multi-slug publish batch | 9 |
| VOS-027 | Quote entity UI | 10 |
| VOS-028 | Delivery scheduling | 10 |
| VOS-029 | AI red team automation | 8 |
| VOS-030 | catalog-data.js sync from OS index | 1 |

---

## First 10 recommended implementation tasks

Execute in order:

1. **VOS-001** — Phase 0 audit  
2. **VOS-002** — Owner content for 0-32 *(owner — parallel)*  
3. **VOS-004** — Firebase RBAC  
4. **VOS-003** — Publish schema + dry-run  
5. **VOS-005** — Pilot passport page  
6. **VOS-006** — Structured request form  
7. **VOS-009** — Firestore rules tests  
8. **VOS-007** — Owner notification  
9. **VOS-008** — Customer confirmation  
10. **VOS-010** — Pilot E2E sign-off  

---

*Backlog only. No code until owner approves phase start.*
