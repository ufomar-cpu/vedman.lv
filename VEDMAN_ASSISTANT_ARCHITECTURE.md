# VEDMAN Assistant — Architecture

| Field | Value |
|-------|-------|
| **Document type** | Assistant behaviour and technical architecture |
| **Date** | 2026-07-16 |
| **Status** | Planning — no implementation |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_OS_MASTER_PLAN.md](VEDMAN_OS_MASTER_PLAN.md) · [knowledge/ai-operating-rules.md](knowledge/ai-operating-rules.md) · [PROJECT_ADVISOR.md](PROJECT_ADVISOR.md) · [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) · [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) |

---

## What this is (and is not)

| This is | This is not |
|---------|-------------|
| Controlled VEDMAN digital assistant | Generic ChatGPT-style chatbot |
| Material education from **verified** data | Open-domain construction consultant |
| Structured request collection | Autonomous sales closer |
| One useful link per interaction | Multi-message nurture sequences |
| Escalation to owner when uncertain | Guesswork on price, suitability, delivery |

Behavioural rules inherit from [knowledge/ai-operating-rules.md](knowledge/ai-operating-rules.md). Project-type guidance aligns with [PROJECT_ADVISOR.md](PROJECT_ADVISOR.md) — **solution directions only**, never binding product selection.

---

## Customer assistant responsibilities

| Responsibility | Detail |
|----------------|--------|
| **Explain verified material information** | From published passport fields only |
| **Show material passport** | Single canonical URL per material |
| **Collect structured request** | Fields defined in [VEDMAN_REQUEST_FLOW.md](VEDMAN_REQUEST_FLOW.md) |
| **Calculate estimates** | m³ helper **only** with disclaimer; t hint **only** if coefficient verified |
| **Confirm request receipt** | One concise LV message template |
| **Ask clarifying questions (L2)** | Missing fields, ambiguous fraction, unclear use |
| **Offer verified alternatives (L2)** | Link to related passports — no suitability guarantee |
| **Escalate (L3)** | Flag owner; stop autonomous advice |

---

## Prohibited actions

| # | Prohibited | Reason |
|---|------------|--------|
| P1 | Invent prices, discounts, or delivery fees | [knowledge/pricing-and-ordering.md](knowledge/pricing-and-ordering.md) |
| P2 | Invent coefficients, LA, frost, strength, quarry data | Material Center verification rule |
| P3 | Guarantee material suitability for a specific build | Not engineering design |
| P4 | Present owner practical tips as universal technical fact | Source type distinction |
| P5 | Send multiple automated WhatsApp messages | Spam / M10 risk |
| P6 | Send image galleries via WhatsApp | Policy: link to passport |
| P7 | Marketing follow-up without consent | Privacy |
| P8 | Expose supplier margins, internal quarry notes, stock levels | Commercial confidentiality |
| P9 | Criticize competitors | [knowledge/brand-voice-and-positioning.md](knowledge/brand-voice-and-positioning.md) |
| P10 | Cite internal file names, admin URLs, Firebase paths | Customer-facing hygiene |
| P11 | Bind quotes or delivery dates | Owner authority only |
| P12 | Continue when verification status is Draft or field is `[TBD]` | Fail closed |

---

## Decision model — three levels

### Level 1 — Automatic (no owner required)

| Action | Conditions |
|--------|------------|
| Answer FAQ from verified `faq.md` / published FAQ entity | Match confidence ≥ threshold `[TBD]` |
| Display passport link | Material slug known and status ≥ Partial |
| Run m³ calculator | Always show disclaimer from [_shared/calculator-disclaimer.md](knowledge/materials/_shared/calculator-disclaimer.md) |
| Accept complete request form | Validation passes |
| Send receipt confirmation | Once per request ID |

### Level 2 — Guided (assistant-led, still no binding claims)

| Action | Conditions |
|--------|------------|
| Ask clarifying questions | Required field missing; ambiguous material |
| Suggest related materials | Links only; language: *"bieži izmanto… VEDMAN precizēs"* |
| Explain difference between two materials | Compare **verified** fields only |
| Flag incomplete request | Prompt customer to complete before submit |
| Soft project-type routing | Per PROJECT_ADVISOR — directions not prescriptions |

### Level 3 — Owner escalation (stop autonomous advice)

| Trigger | Assistant behaviour |
|---------|---------------------|
| Uncertain material selection | *"VEDMAN sazināsies, lai precizētu"* + collect request |
| Complex construction advice | Decline design role; offer phone 22312828 |
| Unverified technical requirement | Do not cite LA/frost; escalate |
| Large or unusual order | `[TBD: tonne threshold]` → priority flag |
| Special quarry selection | Escalate |
| Delivery access problems | Collect facts; owner decides feasibility |
| Exact pricing | Always L3 |
| Exact delivery promise | Always L3 |
| Complaints or disputes | Immediate L3; empathetic handoff |
| Customer angry / legal threat | L3 + no AI argument |
| AI confidence below threshold | L3 |

---

## Confidence and escalation rules

```
                    ┌──────────────┐
                    │ User input   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Intent       │
                    │ classifier   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         L3 trigger?   Data verified?  Request?
              │            │            │
              ▼            ▼            ▼
         Escalate     L1 answer    Intake flow
              │            │            │
              └────────────┴────────────┘
                           │
                    ┌──────▼───────┐
                    │ Log session  │
                    │ + audit      │
                    └──────────────┘
```

| Signal | Threshold | Action |
|--------|-----------|--------|
| Field verification | `verified === false` | Do not speak field; L2 or L3 |
| Intent = price | Any | L3 — prepare request only |
| Intent = suitability guarantee | Any | L3 |
| FAQ match score | `[TBD: e.g. ≥ 0.85]` | L1 |
| FAQ match score | `[TBD: 0.5–0.85]` | L2 clarify |
| FAQ match score | `< threshold` | L3 or *"Zvaniet 22312828"* |
| Material slug unknown | — | L3 |

---

## Conversation flow

### Flow A — Material-known request (pilot: 0-32)

```
1. Customer selects material (0-32 dolomite)
2. Assistant shows passport link (optional: one-line verified summary)
3. Collect: quantity, unit, address, intended use, preferred delivery time,
            name, phone, optional comment
4. Validate → submit request
5. Owner notification (async)
6. Customer: ONE confirmation + passport link
7. END (no further automated messages)
```

### Flow B — Material unknown (Project Advisor lite)

```
1. Ask project type (P1–P10) — [PROJECT_ADVISOR.md](PROJECT_ADVISOR.md)
2. L2: suggest material **family** directions
3. Offer passport links for candidates (max 2–3)
4. Merge into Flow A or escalate L3
```

### Flow C — Customer asks follow-up question

```
1. Only after customer initiates
2. L1 if verified FAQ match
3. L2 if needs clarification
4. L3 if price / suitability / complaint
5. Still: no message burst — prefer single reply
```

### Flow D — Website embed vs WhatsApp

| Surface | Behaviour |
|---------|-----------|
| **Website** | Form + optional inline assistant panel Phase 6 |
| **WhatsApp inbound** | `[TBD: API]` — assistant reads thread; same L1/L2/L3 |
| **Phone** | Human only — assistant does not intercept |

---

## Request intake fields

Canonical schema — detail in [VEDMAN_DATA_MODEL_PLAN.md](VEDMAN_DATA_MODEL_PLAN.md) `customer_requests`:

| Field | Required | Notes |
|-------|----------|-------|
| `materialSlug` | Yes (pilot) | e.g. `0-32-dolomite` |
| `materialDisplayName` | Denormalized | From material entity |
| `quantity` | Yes | Number |
| `unit` | Yes | `t` \| `m³` \| `[TBD]` |
| `address` | Yes | Delivery location |
| `intendedUse` | Yes (pilot) | Free text or enum `[TBD]` |
| `preferredDeliveryTime` | Optional | Not a promise |
| `customerName` | Yes | |
| `customerPhone` | Yes | E.164 normalized |
| `comment` | Optional | |
| `addOns` | Optional | From catalog services |
| `consentContact` | Yes | Processing for quote |
| `consentMarketing` | No default | Opt-in only |
| `sourceChannel` | Auto | `web` \| `whatsapp` \| `assistant` |
| `sessionId` | Optional | Link to assistant session |

---

## Owner handoff

### Owner notification payload

Structured summary (not raw chat):

```
VEDMAN — Jauns pieprasījums #{requestId}
Materiāls: Dolomīta šķembas 0-32
Daudzums: {quantity} {unit}
Adrese: {address}
Lietojums: {intendedUse}
Vēlamais laiks: {preferredDeliveryTime | Nav norādīts}
Klients: {name} · {phone}
Komentārs: {comment | —}
Papildu: {addOns | —}
Escalation: {none | reason}
Passport: {url}
Received: {timestamp}
```

Delivery channel Phase 4: `[TBD: WhatsApp to owner | email | panel push]`

### Owner actions (Phase 7+)

| Action | Effect |
|--------|--------|
| Mark contacted | Updates request status |
| Send offer | Manual — triggers optional customer message (owner-initiated) |
| Close duplicate | Links to primary request |
| Escalation resolved | Clears flag |

Assistant **never** sends offer on owner's behalf in initial phases.

---

## WhatsApp response policy

| Rule | Detail |
|------|--------|
| **Messages per request** | **1** automated confirmation |
| **Content** | Thanks + passport link + *"VEDMAN sazināsies par piedāvājumu"* |
| **Preview image** | **Optional** — hero.webp only if API supports clean OG-style send `[TBD]` |
| **No image gallery** | Customer views photos on passport page |
| **Follow-up** | Only if customer messages first, owner sends offer, or explicit opt-in |
| **Link format** | Canonical passport URL — one link |
| **Language** | Latvian default |

### Approved confirmation template (LV)

```
Paldies! Jūsu pieprasījums ir saņemts.
Informācija un reālas fotogrāfijas par izvēlēto materiālu:
{passportUrl}
VEDMAN sazināsies ar Jums par piedāvājumu.
```

Owner may customize wording in Phase 5 — must preserve single-message rule.

---

## Audit logging

Every assistant interaction writes to `audit_logs` (see data model):

| Event | Fields logged |
|-------|---------------|
| `session_started` | channel, materialSlug?, timestamp |
| `l1_answer` | question hash, sources used, field IDs |
| `l2_clarify` | missing fields |
| `l3_escalate` | reason code |
| `request_submitted` | requestId |
| `confirmation_sent` | channel, success/fail |
| `policy_violation_blocked` | prohibited action type |
| `fallback_triggered` | reason |

**Retention:** `[TBD: months]` — align with privacy policy.

**Review:** Owner samples sessions weekly Phase 6+ for M8/M9.

---

## Failure states

| Failure | Customer experience | Owner experience |
|---------|---------------------|------------------|
| Firebase unavailable | Form saves to `[TBD: queue/local]` or fallback wa.me with pre-filled text | Alert `[TBD]` |
| AI provider unavailable | Static FAQ + form only; phone CTA prominent | Requests still via form/wa.me |
| Confirmation send failed | Show on-screen success + *"Ja nesaņēmāt ziņu, zvaniet 22312828"* | Retry queue + alert |
| Passport page 404 | Confirmation uses homepage + apology | Fix content pipeline |
| Rate limit / spam detected | CAPTCHA or block `[TBD]` | — |
| Unverified material requested | L3; no technical claims | Flag in summary |

---

## Fallback when AI or Firebase unavailable

**Priority order:**

1. **Phone** +371 22312828 — always visible
2. **Existing wa.me** flow via [js/quote.js](js/quote.js) — unchanged until cutover
3. **Static passport page** (if hosted) — no dynamic features
4. **Email** `[TBD: address]` — Phase 5 fallback channel

Assistant UI degrades to:

- Material passport link (static)
- HTML form POST → `[TBD: serverless function]` or mailto `[TBD]`
- No AI chat widget

---

## Technical architecture (planned)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Web / WA    │────▶│ Assistant API    │────▶│ Verified data   │
│ client      │     │ (serverless)     │     │ read layer      │
└─────────────┘     └────────┬─────────┘     └────────┬────────┘
                             │                        │
                             ▼                        ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ LLM (restricted) │     │ Firestore       │
                    │ system prompt +  │     │ materials       │
                    │ tool: getMaterial│     │ requests        │
                    │ tool: submitReq  │     │ audit_logs      │
                    └──────────────────┘     └─────────────────┘
```

**Implementation note:** LLM receives **retrieved verified fields only** — not raw Git files. RAG over `[TBD]` fields is forbidden.

Hosting options: `[TBD: Firebase Functions | Cloudflare Workers]` — decision Phase 6.

---

## Source type presentation (customer-facing)

When assistant cites information, internal tagging distinguishes:

| Type | Label (internal) | Customer phrasing |
|------|------------------|-------------------|
| Manufacturer / DoP data | `source:manufacturer` | *"Ražotāja dokumentācijā…"* |
| Standard / documented | `source:standard` | *"Atbilstoši [standarts] prasībām…"* — no compliance claim without DoP |
| VEDMAN experience | `source:vedman_practice` | *"VEDMAN praksē bieži…"* — not universal fact |

Never merge types into a single authoritative claim.

---

*Planning document. Implements rules from knowledge/ai-operating-rules.md — do not duplicate full rule tables here.*
