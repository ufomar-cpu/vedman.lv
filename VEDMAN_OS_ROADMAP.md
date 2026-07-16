# VEDMAN OS — Roadmap

| Field | Value |
|-------|-------|
| **Document type** | Phased implementation roadmap (Phases 0–10) |
| **Date** | 2026-07-16 |
| **Status** | Planning |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_OS_MASTER_PLAN.md](VEDMAN_OS_MASTER_PLAN.md) · [VEDMAN_OS_TASK_BACKLOG.md](VEDMAN_OS_TASK_BACKLOG.md) · [VEDMAN_DEVELOPMENT_HANDBOOK.md](VEDMAN_DEVELOPMENT_HANDBOOK.md) · [docs/V5_MASTER_PLAN.md](docs/V5_MASTER_PLAN.md) |

---

## Roadmap principles

1. **Pilot first** — `0-32-dolomite` end-to-end before scaling slugs
2. **Parallel paths** — legacy wa.me works until owner approves cutover
3. **No invented data** — public fields gated on verification
4. **Security before writes** — Firebase RBAC before `customer_requests`
5. **Owner approval gate** — every phase ends with explicit sign-off

---

## Phase 0 — Repository and data audit

| Item | Detail |
|------|--------|
| **Objective** | Establish baseline; align OS plan with repo, security, and knowledge gaps |
| **Deliverables** | Audit report `[TBD: docs/VEDMAN_OS_PHASE0_AUDIT.md]`; updated validation checklist; metric baselines M1/M7 |
| **Dependencies** | Existing docs (handbook, Material Center, security plan) |
| **Security checks** | Review [FIREBASE_RULES.txt](FIREBASE_RULES.txt) vs OS collections; confirm no open writes planned |
| **Test criteria** | Inventory complete: catalog slugs, knowledge `[TBD]` count, security gaps documented |
| **Owner approval gate** | Owner confirms pilot material and priority channels |
| **Rollback plan** | N/A — documentation only |

---

## Phase 1 — Material passport data foundation

| Item | Detail |
|------|--------|
| **Objective** | Define publish pipeline from `knowledge/materials/` to runtime schema |
| **Deliverables** | Validated mapping Git → [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md); publish script spec `[TBD]`; JSON schema for passport export |
| **Dependencies** | Phase 0; [knowledge/materials/_schema/](knowledge/materials/_schema/) |
| **Security checks** | Draft Firestore rules for `materials` public read; no customer PII collections yet |
| **Test criteria** | Dry-run publish of `0-32-dolomite` to JSON export without Firebase write |
| **Owner approval gate** | Owner approves field mapping and verification enums |
| **Rollback plan** | Revert to Git-only authoring |

---

## Phase 2 — 0/32 pilot passport

| Item | Detail |
|------|--------|
| **Objective** | One public digital passport page for Dolomīta šķembas 0-32 |
| **Deliverables** | Static or hybrid page at `[TBD: URL]`; real images in slots hero/closeup/pile/truck/installed; owner prose §7,9,25; FAQ live; schema.org stub |
| **Dependencies** | Phase 1; owner content + photography |
| **Security checks** | No admin endpoints exposed; images on Storage with public read only for published assets |
| **Test criteria** | Mobile Lighthouse ≥ `[TBD]`; all public fields verified or omitted (not `[TBD]` text); CTA visible |
| **Owner approval gate** | Owner signs passport checklist per [knowledge/materials/0-32-dolomite/](knowledge/materials/0-32-dolomite/) |
| **Rollback plan** | Unlink from site nav; keep Git content |

**Blocks on owner:** Photos, description, coefficient source (if shown), quarry display name.

---

## Phase 3 — Structured price request

| Item | Detail |
|------|--------|
| **Objective** | Customer submits structured request stored in Firestore (or interim store) |
| **Deliverables** | Request form on passport page; `customer_requests` writes; validation; dedup; spam controls |
| **Dependencies** | Phase 2; [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) RBAC deployed |
| **Security checks** | Anonymous create-only with schema validation; no read of other requests; PII rules tested |
| **Test criteria** | 10 test submits; dedup works; mobile UX pass; wa.me fallback on failure |
| **Owner approval gate** | Owner confirms form fields match pricing workflow |
| **Rollback plan** | Disable form; CTA reverts to wa.me pre-filled link |

---

## Phase 4 — Owner notification

| Item | Detail |
|------|--------|
| **Objective** | Owner receives structured summary for every new request without reading raw chat |
| **Deliverables** | Notification via `[TBD: email | WhatsApp | panel]`; escalation flags; request ID |
| **Dependencies** | Phase 3 |
| **Security checks** | Notifications contain no supplier_notes; access to request docs role-gated |
| **Test criteria** | Submit → owner receives within `[TBD: 60s]`; escalation flags visible |
| **Owner approval gate** | Owner confirms notification channel and template |
| **Rollback plan** | Manual panel refresh only; disable push |

---

## Phase 5 — One-link customer confirmation

| Item | Detail |
|------|--------|
| **Objective** | Customer receives exactly one concise confirmation with passport link |
| **Deliverables** | On-screen success + optional WhatsApp outbound; tracking M4/M5; no follow-up automation |
| **Dependencies** | Phase 3–4; `[TBD: WhatsApp Business API]` optional |
| **Security checks** | Consent recorded; message template approved; no marketing without opt-in |
| **Test criteria** | Exactly 1 automated message per request; link resolves; preview image ≤1 if used |
| **Owner approval gate** | Owner approves LV confirmation text |
| **Rollback plan** | On-screen only; disable API outbound |

---

## Phase 6 — Controlled assistant

| Item | Detail |
|------|--------|
| **Objective** | Deploy L1/L2/L3 assistant — not open chatbot |
| **Deliverables** | Assistant API; verified-data retrieval; session audit; golden FAQ tests |
| **Dependencies** | Phase 2 passport verified; [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md); AI provider `[TBD]` |
| **Security checks** | Prompt injection tests; supplier_notes never in context; rate limits |
| **Test criteria** | Red team: price/suitability/LA questions → L3; M8/M9 = 0 in test suite |
| **Owner approval gate** | Owner reviews 20 sample conversations |
| **Rollback plan** | Disable widget; form + phone only |

---

## Phase 7 — Owner dashboard

| Item | Detail |
|------|--------|
| **Objective** | Owner manages requests and material publish from panel |
| **Deliverables** | Extend [vedman-panel.html](vedman-panel.html): request queue, status updates, material publish trigger |
| **Dependencies** | Phases 3–5; Firebase Auth RBAC |
| **Security checks** | Role matrix: owner vs editor; editors cannot see supplier_notes |
| **Test criteria** | Owner can close request, mark contacted, trigger publish without developer |
| **Owner approval gate** | Owner accepts daily workflow |
| **Rollback plan** | Read-only request list; Git publish via developer |

---

## Phase 8 — Analytics and learning

| Item | Detail |
|------|--------|
| **Objective** | Measure M1–M10; improve completion and reduce escalation |
| **Deliverables** | Dashboard or export; passport link tracking; abandonment funnel |
| **Dependencies** | Phases 3–6 live |
| **Security checks** | Aggregated analytics only; no PII in third-party analytics without consent `[TBD]` |
| **Test criteria** | Metrics match manual spot-checks |
| **Owner approval gate** | Owner reviews monthly report format |
| **Rollback plan** | Disable tracking scripts; keep server logs |

---

## Phase 9 — Marketing reuse

| Item | Detail |
|------|--------|
| **Objective** | Export same material DB to SS.lv, Facebook, Instagram, GMB drafts |
| **Deliverables** | Export templates; unique text generator with dedup rules [knowledge/channels.md](knowledge/channels.md) |
| **Dependencies** | Phase 2+ verified passports |
| **Security checks** | Exports use public fields only; no auto-post without owner review |
| **Test criteria** | One export per channel for 0-32; uniqueness check passes |
| **Owner approval gate** | Owner approves each published external listing |
| **Rollback plan** | Manual copy only |

---

## Phase 10 — Advanced automation

| Item | Detail |
|------|--------|
| **Objective** | `[TBD: scope after pilot success]` — e.g. delivery scheduling, quote PDF, multi-slug scale, Project Advisor integration |
| **Deliverables** | Backlog refinement after Phase 8 metrics |
| **Dependencies** | Phases 0–8 stable |
| **Security checks** | Per-feature review |
| **Test criteria** | Per-feature |
| **Owner approval gate** | Business case per feature |
| **Rollback plan** | Feature flags |

---

## Timeline (indicative, not committed)

| Phase | Duration estimate | Cumulative |
|-------|-------------------|------------|
| 0 | 1 week | 1 w |
| 1 | 1–2 weeks | 3 w |
| 2 | 2–3 weeks | 6 w — **blocked on owner content** |
| 3 | 2 weeks | 8 w |
| 4 | 1 week | 9 w |
| 5 | 1–2 weeks | 11 w |
| 6 | 3–4 weeks | 15 w |
| 7 | 2–3 weeks | 18 w |
| 8 | 1–2 weeks | 20 w |
| 9 | 2 weeks | 22 w |
| 10 | Ongoing | — |

Parallel work: V5 Milestone 3 UI, Firebase security (P0/P6 in V5 plan).

---

## Pilot completion definition

Phases **2 + 3 + 4 + 5** complete for **`0-32-dolomite`** = **first working pilot**.

Phase 6+ enhances but is not required for minimum viable OS value (structured request + owner time savings).

---

## Dependency graph

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5
                              │                      │
                              └──────────┬───────────┘
                                         ▼
                                    Phase 6
                                         │
                         ┌───────────────┼───────────────┐
                         ▼               ▼               ▼
                    Phase 7         Phase 8         Phase 9
                         │               │               │
                         └───────────────┴───────────────┘
                                         ▼
                                    Phase 10
```

**External blocker:** Firebase security (V5 P6) before Phase 3.

---

*Planning document. Timelines require owner confirmation.*
