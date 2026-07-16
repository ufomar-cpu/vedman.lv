# VEDMAN OS — Request Flow

| Field | Value |
|-------|-------|
| **Document type** | End-to-end request lifecycle specification |
| **Date** | 2026-07-16 |
| **Status** | Planning |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_OS_MASTER_PLAN.md](VEDMAN_OS_MASTER_PLAN.md) · [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) · [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) · [js/quote.js](js/quote.js) · [knowledge/pricing-and-ordering.md](knowledge/pricing-and-ordering.md) |

---

## Overview

The VEDMAN OS request flow replaces **unstructured WhatsApp-only** handoff with a **structured pipeline** while preserving WhatsApp and phone as primary customer channels.

**Pilot path:** Customer selects **Dolomīta šķembas 0-32** → submits structured fields → owner receives summary → customer receives **one** confirmation with **one** passport link.

Current baseline: [js/quote.js](js/quote.js) opens `wa.me` with a formatted message — remains fallback until Phase 3 cutover.

---

## Actors

| Actor | Role |
|-------|------|
| **Customer** | Submits request via web (Phase 3+) or assistant |
| **VEDMAN OS** | Validates, stores, deduplicates, notifies |
| **Owner / sales** | Prices, responds, sends offer manually |
| **Assistant** | Optional — collects fields; does not price (Phase 6) |

---

## Price request flow (happy path)

```
┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Customer │───▶│ Intake form │───▶│ Validate +   │───▶│ Firestore   │
│          │    │ (web / asst)│    │ dedupe       │    │ request doc │
└──────────┘    └─────────────┘    └──────────────┘    └──────┬──────┘
                                                               │
                    ┌──────────────────────────────────────────┤
                    │                                          │
                    ▼                                          ▼
            ┌───────────────┐                          ┌───────────────┐
            │ Owner         │                          │ Customer      │
            │ notification  │                          │ confirmation  │
            │ (1 message)   │                          │ (1 message)   │
            └───────────────┘                          └───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ Owner prices  │
            │ manually      │
            └───────────────┘
```

### Step 1 — Entry points

| Entry | Phase | Behaviour |
|-------|-------|-----------|
| Passport page CTA | 2+ | Pre-filled `materialSlug=0-32-dolomite` |
| Homepage quote modal | 3+ | Enhanced submit → OS; legacy wa.me until cutover |
| Assistant | 6+ | Same schema |
| Direct phone | Always | Human — no OS required |
| Legacy wa.me | Until cutover | No Firestore write |

### Step 2 — Intake fields

See [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) and [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) `customer_requests`.

**Pilot required:** material, quantity, unit, address, intended use, name, phone, consent.

**Pilot optional:** preferred delivery time, comment, add-ons.

### Step 3 — Validation

| Check | Failure UX |
|-------|------------|
| Required fields present | Inline errors; mobile-friendly |
| Phone format | LV validation `[TBD: regex]` |
| Quantity > 0 | Block submit |
| `consentContact === true` | Block submit |
| Material slug exists and `live` or `partial` | Warn if draft; allow with L3 flag |
| Rate limit | CAPTCHA / cooldown |

### Step 4 — Persist

Create `customer_requests/{requestId}` with status `new`.

Generate `idempotencyKey` from hash(phone + materialSlug + quantity + 5min window) for dedup.

### Step 5 — Parallel async actions

| Action | Must succeed for UX |
|--------|---------------------|
| Owner notification | No — retry; owner may see in panel |
| Customer confirmation | Preferred — show on-screen success regardless |

---

## Customer confirmation

### Channel priority

| Priority | Channel | Phase |
|----------|---------|-------|
| 1 | On-screen success page | 3+ |
| 2 | WhatsApp outbound `[TBD: API]` | 5 |
| 3 | SMS `[TBD]` | Future |
| 4 | Email `[TBD: if collected]` | 5 fallback |

### Message content (exactly one automated message)

```
Paldies! Jūsu pieprasījums ir saņemts.
Informācija un reālas fotogrāfijas par izvēlēto materiālu:
{passportUrl}
VEDMAN sazināsies ar Jums par piedāvājumu.
```

### WhatsApp image policy

| Rule | Detail |
|------|--------|
| Default | **No images** — link only |
| Optional | Single `hero.webp` preview if API supports without gallery behaviour |
| Forbidden | Pile, truck, multi-image sends |
| Rationale | Keeps chat clean; full gallery on passport page |

### On-screen success (always show)

- Same text as confirmation
- Clickable passport link
- Phone **22312828** escape hatch
- Request reference `#requestId` for customer support

---

## Owner notification

### Payload

See [VEDMAN_ASSISTANT_ARCHITECTURE.md](VEDMAN_ASSISTANT_ARCHITECTURE.md) owner handoff template.

### Delivery options `[TBD: owner chooses one primary]`

| Option | Pros | Cons |
|--------|------|------|
| WhatsApp to owner number | Fast | Requires Business API |
| Email | Simple | Less immediate |
| Panel push / badge | Centralized | Requires Phase 7 UI |
| SMS | Reliable | Cost |

**Phase 4 minimum:** Email or panel list — even before WhatsApp API.

### Escalation flags in summary

| Flag | When |
|------|------|
| `L3_UNCERTAIN_MATERIAL` | Customer unsure |
| `L3_LARGE_ORDER` | Quantity > `[TBD]` |
| `L3_ACCESS` | Comment mentions narrow access |
| `L3_COMPLAINT` | Sentiment / keyword |
| `INCOMPLETE` | Submitted via partial validation override |

---

## Material passport link generation

| Field | Rule |
|-------|------|
| **Canonical URL** | `https://vedman.lv/materiali/{slug}/` `[TBD: confirm path Phase 2]` |
| **Source** | `materials/{slug}.passportUrl` at publish time |
| **UTM** | `[TBD: ?utm_source=request_confirmation]` for M5 tracking |
| **Short link** | Optional `[TBD]` — must resolve to canonical |

Link included in:

- Customer confirmation (required)
- Owner summary (required)
- Not duplicated elsewhere in same flow

---

## Duplicate request handling

| Scenario | Detection | Action |
|----------|-----------|--------|
| Double-click submit | Same `idempotencyKey` | Return existing `requestId`; one confirmation |
| Same phone + material within 24h | Query recent requests | Mark `duplicate`; notify owner with link to original |
| Same phone different material | No auto-merge | Separate requests |
| Customer resubmits with corrections | New request | Owner sees both; optional manual merge |

Customer message on duplicate: *"Jūsu pieprasījums jau ir reģistrēts (#…). VEDMAN sazināsies."* — still **one** message.

---

## Incomplete request handling

| Stage | Behaviour |
|-------|-----------|
| **Draft in form** | Browser localStorage optional `[TBD]` — not server draft |
| **Assistant partial** | L2 prompts for missing fields before submit |
| **Abandon** | No confirmation; no owner notify; track M7 |
| **Save incomplete server-side** | **No** — avoid PII without consent |

If customer calls instead: human completes outside OS — optional manual request entry Phase 7.

---

## Spam protection

| Control | Phase |
|---------|-------|
| Honeypot field | 3 |
| Rate limit per IP / phone | 3 |
| CAPTCHA `[TBD: provider]` | 3 if abuse |
| Keyword blocklist | 3 |
| Manual `spam` status | 4 |

Spam requests: no customer confirmation; no owner WhatsApp — panel quarantine only.

---

## WhatsApp limitations

| Limitation | Mitigation |
|------------|------------|
| No server-side write via wa.me alone | Phase 3 web form writes Firestore first |
| 24-hour session window (Business API) | Confirmation sent immediately on submit |
| Template approval for outbound | Prepare templates Phase 4–5 `[TBD]` |
| Media messages complexity | Link-first policy |
| Customer must opt-in to Business chat | Confirmation is transactional reply to request |
| Inbound unstructured messages | Phase 6 assistant L1/L2/L3 |

**Critical:** Phase 3 can work **without** WhatsApp API — web form + on-screen success + owner email; customer uses existing wa.me manually if they prefer.

---

## Email fallback

| Use case | Flow |
|----------|------|
| WhatsApp confirmation failed | Send email if address collected `[TBD: optional field]` |
| Owner notification | Email summary with request link |
| B2B formal quotes | Owner sends manually Phase 4+ |

Email template: same LV text as WhatsApp confirmation.

---

## Failure recovery

| Failure | Recovery |
|---------|----------|
| Firestore write failed | Show error + wa.me fallback with pre-filled text from form |
| Owner notify failed | Retry 3x; panel shows pending; alert `[TBD]` |
| Confirmation failed | On-screen success + *"Ja nesaņēmāt ziņu, zvaniet…"* |
| Passport URL broken | Fallback to `https://vedman.lv/` + material anchor `[TBD]` |
| Partial outage | Degrade to [js/quote.js](js/quote.js) behaviour |

All failures logged to `audit_logs`.

---

## Mobile UX requirements

| Requirement | Detail |
|-------------|--------|
| Single column form | Thumb-friendly |
| Large tap targets | Match M3 design system |
| Unit toggle | `t` / `m³` — educate tonnes [knowledge/quantities-and-densities.md](knowledge/quantities-and-densities.md) |
| Address | Autocomplete `[TBD: optional Phase 3]` |
| Phone | `tel:` keyboard |
| Success state | Full-screen; passport link above fold |
| No modal-on-modal | Passport CTA opens form cleanly |
| Performance | Works on 3G — minimal JS Phase 3 |

Align with [MILESTONE3_CONVERSION_SYSTEM.md](MILESTONE3_CONVERSION_SYSTEM.md) when implementing UI.

---

## Status lifecycle

```
new → contacted → quoted → won | lost
         ↓
      duplicate
         ↓
       spam
```

Owner updates status Phase 7+. OS sets initial `new` only.

---

## Pilot acceptance (0-32)

- [ ] Submit request with all required fields from mobile
- [ ] Owner receives structured summary within `[TBD: SLA]`
- [ ] Customer receives exactly one confirmation with passport link
- [ ] Duplicate submit does not duplicate notifications
- [ ] Firestore down → wa.me fallback works
- [ ] No price or delivery date in any automated message
- [ ] No multi-image WhatsApp send

---

*Planning document. Current production flow unchanged.*
