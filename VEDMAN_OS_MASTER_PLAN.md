# VEDMAN OS — Master Plan

| Field | Value |
|-------|-------|
| **Document type** | System master plan — implementation strategy |
| **Date** | 2026-07-16 |
| **Status** | Planning — no production code, no deployment |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) · [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) · [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) · [VEDMAN_OS_ROADMAP.md](VEDMAN_OS_ROADMAP.md) · [VEDMAN_OS_TASK_BACKLOG.md](VEDMAN_OS_TASK_BACKLOG.md) · [MATERIAL_CENTER_MASTER_PLAN.md](MATERIAL_CENTER_MASTER_PLAN.md) · [knowledge/README.md](knowledge/README.md) · [VEDMAN_DEVELOPMENT_HANDBOOK.md](VEDMAN_DEVELOPMENT_HANDBOOK.md) |

---

## Executive summary

**VEDMAN OS** is the operational layer that connects VEDMAN’s business knowledge, material passports, customer requests, and owner workflows into **one source of truth** — entered once, reused everywhere.

It is **not** a generic chatbot product. It is a **controlled digital assistant** plus structured request pipeline that reduces owner manual work while keeping every customer-facing statement accurate, professional, and safe.

**Pilot material:** Dolomīta šķembas 0-32 (`0-32-dolomite`) — see [knowledge/materials/0-32-dolomite/](knowledge/materials/0-32-dolomite/).

**North Star (inherited):** Does this make it easier for the customer to buy? — [VEDMAN_DEVELOPMENT_HANDBOOK.md](VEDMAN_DEVELOPMENT_HANDBOOK.md) §20.

---

## Mission

Reduce the owner’s manual involvement in routine customer interactions while ensuring:

- Customers receive **clear, honest, verified** material information
- Requests arrive **structured and complete** for fast pricing
- The owner is notified once with everything needed to respond
- Customers get **one concise confirmation** — not message spam
- Technical, pricing, and suitability claims are **never invented**

---

## Business goals

| Goal | Description | OS component |
|------|-------------|--------------|
| **G1 — Less owner time per standard request** | Owner reads summary, not unstructured chat | Request intake + owner notification |
| **G2 — One source of truth** | Material data entered once | Knowledge → runtime sync |
| **G3 — Trust through education** | Real photos, honest limits | Material digital passports |
| **G4 — Safe automation** | AI explains verified facts only | Controlled assistant (L1/L2/L3) |
| **G5 — Channel reuse** | Same data → web, WhatsApp link, PDF, social | Export layer |
| **G6 — No regression on leads** | WhatsApp + phone remain primary | Parallel rollout; fallback paths |

---

## Success metrics

| Metric | Definition | Target direction | Phase |
|--------|------------|------------------|-------|
| **M1** | Owner manual time per standard request | ↓ | Phase 4+ |
| **M2** | % complete requests (all required fields) | ↑ | Phase 3+ |
| **M3** | % escalated to owner (L3) | Track baseline | Phase 6+ |
| **M4** | Customer confirmation delivery success rate | ≥ `[TBD: %]` | Phase 5+ |
| **M5** | Material passport link open rate | ↑ | Phase 2+ |
| **M6** | Duplicate request rate | ↓ | Phase 3+ |
| **M7** | Customer abandonment (form / flow) | ↓ | Phase 3+ |
| **M8** | Incorrect AI statement count (audited) | **0** tolerance for unverified claims | Phase 6+ |
| **M9** | Unverified technical statement count | **0** in customer-facing output | All phases |
| **M10** | WhatsApp opt-out or complaint rate | ↓ | Phase 5+ |

Measurement tooling: Phase 8. Baseline capture: Phase 0.

---

## System boundaries

### In scope (VEDMAN OS)

| Area | Scope |
|------|-------|
| Material master data | Slugs, passports, images, FAQs, coefficients with sources |
| Customer request intake | Structured fields, validation, deduplication |
| Owner notification | Structured summary, escalation flags |
| Customer confirmation | One message + one passport link |
| Controlled assistant | L1/L2/L3 decision model — [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) |
| Admin / owner tools | Content verification, request queue `[TBD: UI scope]` |
| Audit logging | Requests, assistant actions, data changes |
| Channel exports | Snippets for web, email, PDF, social drafts |

### Out of scope (initial phases)

| Area | Reason |
|------|--------|
| E-commerce checkout / payment capture | Business model is quote-first [knowledge/pricing-and-ordering.md](knowledge/pricing-and-ordering.md) |
| Autonomous pricing engine | Prices require human approval [knowledge/ai-operating-rules.md](knowledge/ai-operating-rules.md) |
| Engineering design / structural calculations | Not licensed engineering advice |
| Generic open-ended chatbot | Replaced by controlled assistant |
| Replacing phone as primary channel | Phone remains equal priority [VEDMAN_DEVELOPMENT_HANDBOOK.md](VEDMAN_DEVELOPMENT_HANDBOOK.md) §10 |
| Full CRM / ERP | Phase 10+ only if justified |

### Existing systems (unchanged until phased migration)

| System | Role today | OS relationship |
|--------|------------|-----------------|
| `index.html` + `js/quote.js` | Quote modal → WhatsApp deep link | Parallel until Phase 3; then enhanced |
| `js/catalog-data.js` | Material list for UI | Sync **from** OS material index |
| Firebase gallery | Project photos | Separate collection; link from passports `[TBD]` |
| `vedman-panel.html` | Gallery CRUD | Extend for material admin Phase 7 |
| GitHub Pages | Static hosting | Passport pages static or hybrid `[TBD]` |

---

## One source of truth architecture

### Layer model

```
┌─────────────────────────────────────────────────────────────────┐
│  CHANNELS (read-only consumers)                                  │
│  Website · WhatsApp link · Email · PDF · AI · Panel · Social    │
└────────────────────────────┬────────────────────────────────────┘
                             │ read verified public fields only
┌────────────────────────────▼────────────────────────────────────┐
│  RUNTIME DATA (Firebase / CDN)                                   │
│  materials · images · requests · sessions · audit_logs          │
└────────────────────────────┬────────────────────────────────────┘
                             │ publish pipeline (verified only)
┌────────────────────────────▼────────────────────────────────────┐
│  AUTHORING (Git — knowledge/)                                    │
│  knowledge/materials/{slug}/ · policies · FAQs                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ owner verification gate
┌────────────────────────────▼────────────────────────────────────┐
│  GOVERNANCE                                                      │
│  Verification status · source metadata · [TBD] fields           │
└─────────────────────────────────────────────────────────────────┘
```

### Source of truth hierarchy

Inherited from [knowledge/README.md](knowledge/README.md):

1. Owner confirmation
2. Production website (until OS supersedes for a field)
3. Knowledge library + material passports
4. Planning documents (context only)

**VEDMAN OS rule:** Runtime (Firebase) must never contain fields that contradict verified Git authoring without an explicit publish event logged in audit.

### What “enter once” means

| Data type | Authoring location | Consumed by |
|-----------|-------------------|-------------|
| Material description, applications, FAQ | `{slug}/material.md`, `faq.md` | Web passport, AI, PDF export |
| Images | `{slug}/images/` → Storage | Web, OG, optional WhatsApp preview |
| Coefficient + source | Passport §14 + `technical_sources` entity | Calculator, AI (if verified) |
| Delivery snippet | `_shared/delivery-block.md` | All passports, confirmations |
| Request form fields | OS schema (single definition) | Web form, assistant intake, owner summary |

**Do not duplicate:** Passport 30-section spec lives in [MATERIAL_CENTER_MASTER_PLAN.md](MATERIAL_CENTER_MASTER_PLAN.md). This document references it only.

---

## Core components

| Component | Document |
|-----------|----------|
| Controlled assistant | [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) |
| Data entities | [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) |
| Request + confirmation flow | [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) |
| Phased delivery | [VEDMAN_OS_ROADMAP.md](VEDMAN_OS_ROADMAP.md) |
| Task backlog | [VEDMAN_OS_TASK_BACKLOG.md](VEDMAN_OS_TASK_BACKLOG.md) |

---

## Implementation phases (summary)

Full detail: [VEDMAN_OS_ROADMAP.md](VEDMAN_OS_ROADMAP.md).

| Phase | Name | Outcome |
|-------|------|---------|
| 0 | Repository and data audit | Baseline, gaps, security alignment |
| 1 | Material passport data foundation | Schema + sync design |
| 2 | 0/32 pilot passport | One live passport page |
| 3 | Structured price request | Form → stored request |
| 4 | Owner notification | Owner receives structured summary |
| 5 | One-link customer confirmation | Single confirmation + passport URL |
| 6 | Controlled assistant | L1/L2/L3 assistant (not open chat) |
| 7 | Owner dashboard | Verify content, manage requests |
| 8 | Analytics and learning | Metrics M1–M10 |
| 9 | Marketing reuse | Social, SS.lv, GMB exports |
| 10 | Advanced automation | `[TBD: scope after pilot]` |

---

## Dependencies

| Dependency | Status | Blocks |
|------------|--------|--------|
| M2 architecture refactor | Done (`ARCHITECTURE_REFACTOR_REPORT.md`) | Cleaner JS/CSS integration |
| Material Center schema | Done (`knowledge/materials/_schema/`) | Phase 1–2 |
| Firebase security (RBAC) | Planned — [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) | Phase 3+ writes |
| Owner content for 0-32 | `[TBD]` — photos, prose, coefficient source | Phase 2 go-live |
| WhatsApp Business API vs manual | `[TBD: owner decision]` | Phase 5 automation |
| Privacy / consent text | `[TBD: legal review]` | Phase 3+ |
| V5 Milestone 3 UX | Parallel — [MILESTONE3_CONVERSION_SYSTEM.md](MILESTONE3_CONVERSION_SYSTEM.md) | Passport page design |

---

## Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R1 | AI invents technical data | Trust / legal | Verified-only reads; L3 escalation; audit M8/M9 |
| R2 | Dual source of truth (Git vs Firebase drift) | Wrong customer info | Publish pipeline; version stamps; diff checks |
| R3 | WhatsApp API cost / complexity | Delayed Phase 5 | Manual owner send fallback; keep wa.me for Phase 3 |
| R4 | Owner bypasses OS → reverts to unstructured chat | Metrics fail | OS must save time, not add steps |
| R5 | Security rules too open on `requests` | PII leak | Private collections; rules per [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) |
| R6 | Incomplete pilot content (`[TBD]`) | Weak passport | Gate Phase 2 live on owner verification checklist |
| R7 | Customer message spam | Complaints M10 | One confirmation policy — [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) |
| R8 | Scope creep into full CRM | Cost, delay | Phase boundaries; backlog prioritization |

---

## Security principles

Aligned with [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) and [FIREBASE_RULES.txt](FIREBASE_RULES.txt):

| Principle | Application |
|-----------|-------------|
| **Auth + authorization** | Firebase Auth + `users/{uid}` roles for all writes |
| **Public read minimization** | Material passports: public verified fields only; no supplier notes |
| **No security through obscurity** | Panel URL not a control |
| **PII protection** | Customer phone, address in private collections |
| **Audit trail** | All publishes and assistant escalations logged |
| **Fail closed** | If verification status ≠ verified, field not exposed |
| **No client-only gates** | Rules enforce on server (Firestore), not JS alone |

---

## Privacy and consent principles

| Topic | Rule |
|-------|------|
| **Data collected** | Name, phone, address, project context — minimum for quote |
| **Purpose** | Quote preparation and delivery coordination only |
| **Consent** | Explicit checkbox before submit `[TBD: exact LV text]` |
| **Marketing follow-up** | **Opt-in only** — no automatic promotional messages |
| **Retention** | `[TBD: months]` — see [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) |
| **Right to erasure** | Owner process `[TBD]` |
| **Third parties** | AI provider `[TBD]` — data minimization; no supplier margins to AI |
| **WhatsApp** | One transactional confirmation; further messages only if customer asks or owner sends offer |

Reference: [privacy.html](privacy.html) — update in separate task when OS collects data server-side.

---

## Rollback approach

| Phase | Rollback |
|-------|----------|
| 0–1 | Documentation only — no rollback needed |
| 2 | Hide passport URL; revert static page link |
| 3 | Disable Firestore write; restore `quote.js` wa.me-only path |
| 4–5 | Stop automated notifications; owner uses manual WhatsApp |
| 6 | Disable assistant endpoint; static FAQ + human only |
| 7–10 | Feature flags per module; Firebase rules deny new collections |

**Rule:** Every phase ships with the **previous path still working** until owner approves cutover.

---

## Testing strategy

| Layer | Approach |
|-------|----------|
| **Content** | Owner sign-off checklist per passport; no `[TBD]` in public fields |
| **Data model** | Schema validation scripts `[TBD: Phase 1]` |
| **Request flow** | E2E: submit → Firestore → owner summary → customer confirmation |
| **Assistant** | Golden Q&A set from verified FAQ; forbidden-question red team |
| **Security** | Rules unit tests; anonymous cannot read `requests`, `supplier_notes` |
| **Regression** | Quote modal wa.me path unchanged until Phase 3 sign-off |
| **Mobile** | Request form + passport page on real devices |
| **Failure modes** | Firebase down → fallback per [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) |

Checklist reference: [docs/VALIDATION_CHECKLIST.md](docs/VALIDATION_CHECKLIST.md) — extend for OS in Phase 0.

---

## Pilot definition (0-32 dolomite)

When pilot is **complete**, the following must work end-to-end:

| Deliverable | Reference |
|-------------|-----------|
| One verified digital passport page | `0-32-dolomite` |
| Image slots: hero, closeup, pile, truck, installed | [MATERIAL_CENTER_MASTER_PLAN.md](MATERIAL_CENTER_MASTER_PLAN.md) § Image requirements |
| Short practical description | Owner-authored §7 |
| Verified technical fields with sources | §14–18 only when documented |
| Coefficient with source + disclaimer | [_shared/calculator-disclaimer.md](knowledge/materials/_shared/calculator-disclaimer.md) |
| FAQ | `faq.md` |
| One price request CTA | Links to structured intake |
| One customer confirmation | [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) |
| One material passport link in confirmation | Canonical URL `[TBD]` |
| One structured owner notification | Same request record |

**WhatsApp policy for pilot:** One short confirmation; optional one preview image if clean; **link to passport** — not a gallery of images in chat.

---

## Document map

| File | Role |
|------|------|
| **This file** | Mission, architecture, risks, governance |
| [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) | Assistant behaviour |
| [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) | Entities and fields |
| [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) | Request lifecycle |
| [VEDMAN_OS_ROADMAP.md](VEDMAN_OS_ROADMAP.md) | Phases 0–10 |
| [VEDMAN_OS_TASK_BACKLOG.md](VEDMAN_OS_TASK_BACKLOG.md) | Prioritized tasks |

---

*Planning document. No production code. No commit unless owner approves.*
