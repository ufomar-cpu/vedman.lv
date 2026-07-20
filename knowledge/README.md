# VEDMAN Knowledge Library

| Field | Value |
|-------|-------|
| **Purpose** | Define how VEDMAN business knowledge is organized, maintained, and used as the future source of truth for humans and AI |
| **Scope** | All files under `knowledge/` — not production code, not Firebase, not website HTML |
| **Last Updated** | 2026-07-16 |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Verification Status** | Draft — library structure approved; content placeholders incomplete |
| **Cross References** | `../VEDMAN_KNOWLEDGE_BASE.md` (legacy index) · `../VEDMAN_DEVELOPMENT_HANDBOOK.md` · `../CUSTOMER_PERSONAS_AND_JOURNEYS.md` · `../CUSTOMER_ENTRY_POINTS.md` |

---

## What this library is

The `knowledge/` folder is the **authoritative business knowledge base** for VEDMAN. It holds facts, policies, voice, catalog data, customer intelligence, and channel playbooks — everything AI and staff need to sell, support, and market accurately.

This is **not** a technical document. Engineering lives in `VEDMAN_DEVELOPMENT_HANDBOOK.md` and the codebase.

---

## Source of truth hierarchy

When information conflicts, resolve in this order:

1. **Owner confirmation** — verbal or written approval from `[TBD: VEDMAN business owner]`
2. **Production website** — `vedman.lv` live content (`index.html`, `js/catalog-data.js`)
3. **This knowledge library** — after verification status is updated
4. **Planning documents** — `docs/`, personas, entry points (context only until promoted here)

Never let AI or marketing invent facts that skip this hierarchy.

---

## Library map

| File | Topic |
|------|-------|
| [company-identity.md](company-identity.md) | Brand, legal entity, contact, hours, geography |
| [brand-voice-and-positioning.md](brand-voice-and-positioning.md) | Mission, positioning, voice, golden rule |
| [materials-catalog.md](materials-catalog.md) | All materials and fractions |
| [services-and-equipment.md](services-and-equipment.md) | Services, equipment, quote add-ons |
| [pricing-and-ordering.md](pricing-and-ordering.md) | Pricing model, payment, ordering process |
| [quantities-and-densities.md](quantities-and-densities.md) | Tonnes policy, densities, calculator |
| [faq.md](faq.md) | Customer-facing FAQ |
| [objections.md](objections.md) | Objections and response directions |
| [trust-builders.md](trust-builders.md) | Trust elements and status |
| [customer-types.md](customer-types.md) | Persona summary for AI tone |
| [entry-points.md](entry-points.md) | How customers arrive — routing summary |
| [seo.md](seo.md) | SEO metadata, keywords, rules |
| [channels.md](channels.md) | SS.lv, Google, social playbooks |
| [customer-support.md](customer-support.md) | Support channels, escalation, after-sale |
| [sales-scripts.md](sales-scripts.md) | Phone and WhatsApp templates |
| [ai-operating-rules.md](ai-operating-rules.md) | Rules for future VEDMAN AI |
| [maintenance-log.md](maintenance-log.md) | Change history |
| [placeholder-checklist.md](placeholder-checklist.md) | Owner completion checklist |

### Material library (`materials/`)

Per-material **digital passports** — one folder per slug. See [MATERIAL_CENTER_MASTER_PLAN.md](../MATERIAL_CENTER_MASTER_PLAN.md).

| Path | Topic |
|------|-------|
| [materials/README.md](materials/README.md) | Material library governance |
| [materials/MATERIAL_INDEX.md](materials/MATERIAL_INDEX.md) | Slug inventory and status |
| [materials/_schema/](materials/_schema/) | Passport and FAQ templates |
| [materials/_shared/](materials/_shared/) | Delivery block, calculator disclaimer |
| [materials/0-32-dolomite/](materials/0-32-dolomite/) | Example passport (draft) |

### VEDMAN OS (operational layer)

System plans at repo root — implementation strategy, not production code:

| Document | Topic |
|----------|-------|
| [../VEDMAN_OS_MASTER_PLAN.md](../VEDMAN_OS_MASTER_PLAN.md) | Mission, SSOT architecture, risks |
| [../VEDMAN_ASSISTANT_ARCHITECTURE.md](../VEDMAN_ASSISTANT_ARCHITECTURE.md) | Controlled assistant L1/L2/L3 |
| [../VEDMAN_DATA_MODEL_PLAN.md](../VEDMAN_DATA_MODEL_PLAN.md) | Entity design |
| [../VEDMAN_REQUEST_FLOW.md](../VEDMAN_REQUEST_FLOW.md) | Request lifecycle |
| [../VEDMAN_OS_ROADMAP.md](../VEDMAN_OS_ROADMAP.md) | Phases 0–10 |
| [../VEDMAN_OS_TASK_BACKLOG.md](../VEDMAN_OS_TASK_BACKLOG.md) | Prioritized tasks VOS-001+ |

---

## Required metadata (every document)

Every file in `knowledge/` must begin with this table:

```markdown
| Field | Value |
|-------|-------|
| **Purpose** | Why this document exists |
| **Scope** | What is included and excluded |
| **Last Updated** | YYYY-MM-DD |
| **Owner** | Who approves content |
| **Verification Status** | See statuses below |
| **Cross References** | Related knowledge files and planning docs |
```

---

## Verification statuses

| Status | Meaning | AI may use for customer-facing answers? |
|--------|---------|----------------------------------------|
| **Draft** | Structure only; many `[TBD]` | No — internal planning only |
| **Partial** | Website-verified facts only | Limited — no prices or TBD fields |
| **Verified** | Owner reviewed and approved | Yes — except binding prices |
| **Production AI** | All required placeholders filled per [placeholder-checklist.md](placeholder-checklist.md) | Yes — prices still require human per [ai-operating-rules.md](ai-operating-rules.md) |

---

## Placeholder conventions

| Marker | Meaning |
|--------|---------|
| `[TBD: …]` | Unknown — owner must supply fact |
| `[WEBSITE]` | Confirmed on vedman.lv (cite page when updating) |
| `[POLICY]` | Confirmed business direction; numeric details may still be TBD |

**Never invent** prices, densities, addresses, registration numbers, minimum orders, or delivery fees.

---

## How to maintain

### Adding a fact

1. Confirm with **Owner** (not AI, not guesswork)
2. Edit the **single** file that owns that topic
3. Update **Last Updated** and **Verification Status** if materially changed
4. Log the change in [maintenance-log.md](maintenance-log.md)
5. If the fact appears on the website, update production in a **separate** task — keep knowledge and site aligned

### Adding a new document

1. Create file in `knowledge/` with full metadata header
2. Add row to this README library map
3. Add cross-references from related documents
4. Log in [maintenance-log.md](maintenance-log.md)

### Splitting a document

Prefer **one topic per file**. If a file exceeds ~300 lines or serves multiple AI domains, split and cross-reference. Do not duplicate facts — link instead.

### Promoting from planning docs

Personas, conversion system, and entry points live at repo root as **research**. When a fact becomes operational policy, copy it into `knowledge/` and mark verification status. Do not delete planning docs.

### Website sync checklist

When `index.html` or `catalog-data.js` changes, review:

- [company-identity.md](company-identity.md)
- [materials-catalog.md](materials-catalog.md)
- [services-and-equipment.md](services-and-equipment.md)
- [pricing-and-ordering.md](pricing-and-ordering.md)
- [faq.md](faq.md)

---

## AI consumption (future)

1. Load [ai-operating-rules.md](ai-operating-rules.md) first
2. Load topic files relevant to the query
3. Refuse to answer when file status is **Draft** and field is `[TBD]`
4. Escalate to human per [customer-support.md](customer-support.md)
5. Never cite internal file names to customers

---

## Governance

| Role | Responsibility |
|------|----------------|
| **Owner** | Approves facts, prices, policies, legal data |
| **Sales** | Proposes FAQ, scripts, objections updates from real calls |
| **Marketing** | Proposes channel playbooks, SEO keywords |
| **Engineering** | Syncs catalog from `catalog-data.js`; does not invent business facts |

---

## Legacy monolith

`../VEDMAN_KNOWLEDGE_BASE.md` is now an **index pointer** to this library. Do not edit the monolith for content changes — edit modular files only.

---

*Future source of truth for VEDMAN business knowledge. Not committed unless owner approves.*
