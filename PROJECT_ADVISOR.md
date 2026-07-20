# VEDMAN Project Advisor — Design Specification

**Document type:** Product & UX strategy (pre-implementation)  
**Date:** 2026-07-16  
**Status:** Planning — no code, no deployment  
**Related:** `knowledge/` · `CUSTOMER_PERSONAS_AND_JOURNEYS.md` · `MILESTONE3_CONVERSION_SYSTEM.md` · `CUSTOMER_ENTRY_POINTS.md`

---

## Executive summary

The **VEDMAN Project Advisor** is a guided conversation — on website, WhatsApp prep, or future AI — that helps customers choose the **right solution for their project**, not a SKU from a catalog.

It asks about the job (ceļš, dārzs, pamati, objekts), collects context, educates on tonnes and delivery reality, and **prepares** a structured handoff to VEDMAN staff. It does **not** guarantee a product, a fraction, or a price.

| Advisor does | Advisor does not |
|--------------|------------------|
| Clarify project type and goals | Pick final fraction without human |
| Ask smart questions | Quote binding prices |
| Suggest solution **directions** | Replace VEDMAN expertise |
| Build confidence and trust | Push fear or attack competitors |
| Prepare WhatsApp / phone context | Close the sale autonomously |

**Final recommendation always belongs to VEDMAN** — phone or WhatsApp with a human who confirms material, tonnes, delivery, and price.

---

## Design principles

1. **Solution first, product second** — *"Ko Tu būvē?"* before *"0-32 vai 0-45?"*
2. **Prepare, don't promise** — *"Parasti šādiem darbiem risinājums ir… VEDMAN precizēs."*
3. **Tonnes education woven in** — not a lecture; one line when relevant
4. **Escape to human always visible** — phone + WhatsApp on every step
5. **Golden rule** — every step must make buying easier (`VEDMAN_DEVELOPMENT_HANDBOOK.md` §20)
6. **Brand voice** — positive, educational (`knowledge/brand-voice-and-positioning.md`)

---

# 1. Project types

The advisor starts from **what the customer is trying to accomplish**, not from material names.

## 1.1 Primary project categories

| ID | Project type (LV) | Customer intent | Typical solution areas (direction only) |
|----|-------------------|-----------------|----------------------------------------|
| **P1** | Piebraucamais ceļš / laukums | Drive, park, access | Šķembas, grants, bieznes, piegāde, `[TBD: izlīdzināšana]` |
| **P2** | Mājas pamati / drenāža | Foundation, drainage | Šķembas frakcijas, smilts, `[TBD: ieteikumi]` |
| **P3** | Dārzs / apstādījumi | Garden, lawn, beds | Melnzeme, smilts, komposts, `[TBD: dekoratīvie]` |
| **P4** | Bruģēšana / segums | Paving base | Šķembas 0-32 / 0-45, `[TBD: slāņi]` |
| **P5** | Teritorijas sagatavošana | Site prep, leveling | Zemes darbi, melnzeme, izvešana, manipulators |
| **P6** | Būvlaukums / komercobjekts | Commercial site | Lielāki apjomi, pašizgāzējs, rēķins, `[TBD]` |
| **P7** | Koku / atkritumu izvešana | Trees, branches, cleanup | Koku serviss, manipulators, `[TBD]` |
| **P8** | Manipulatora darbs objektā | Lift, place, greifer | Manipulators pakalpojums, ne tikai materiāls |
| **P9** | Esmu profesionālis — zinu ko vajag | Expert buyer | Short path → material + tonnes → contact |
| **P10** | Nezinu / vajag konsultāciju | Uncertain | Human-first routing |

## 1.2 Sub-context (optional second step)

| Sub-context | Affects |
|-------------|---------|
| Privātmāja vs komercobjekts | Channel tone, invoice, minimum order `[TBD]` |
| Steidzami | Phone-first escalation |
| Šaura piebraukšana / pāri žogam | Add-ons in handoff |
| Tikai materiāls vs materiāls + darbs | Services scope |
| Aptuvenais apjoms (m², garums) | Calculator helper only |

## 1.3 Mapping note

Detailed project → material mapping lives in `knowledge/quantities-and-densities.md` and `[TBD: owner-approved use tables]`. The advisor uses **soft language**:

> *"Šāda veida projektiem bieži izmanto [materiālu grupu]. VEDMAN pēc adreses un apjoma precizēs frakciju un tonnas."*

Never: *"Jums obligāti vajag 0-32."*

---

# 2. Customer questions

Questions the advisor **asks** (grouped by phase). Wording is Latvian, plain language.

## Phase A — Project (required)

| # | Question | Why |
|---|----------|-----|
| A1 | Ko plānojat darīt? *(project type tiles)* | Solution anchor |
| A2 | Kur atrodas objekts? *(pilsēta / adrese)* | Delivery feasibility |
| A3 | Kad materiāls vai darbs vajadzīgs? | Urgency routing |

## Phase B — Scope (conditional)

| # | Question | When |
|---|----------|------|
| B1 | Aptuvenais platums / garums / platība? | P1, P3, P4 |
| B2 | Vai zināt biezumu vai slāni? | P1, P4 — calculator helper |
| B3 | Vai mašīnai ir ērti piebraukt? Šaurs vārtu caurums? | Access add-ons |
| B4 | Vai vajag tikai piegādi, vai arī izlīdzināšanu / rakšanu? | P5, P3 |
| B5 | Aptuvenais apjoms tonnās? | P9 expert path only |
| B6 | Vai nepieciešams rēķins ar PVN? | Commercial hint |

## Phase C — Contact prep (before handoff)

| # | Question | Why |
|---|----------|-----|
| C1 | Jūsu vārds | WhatsApp message |
| C2 | Telefons | Callback / WhatsApp |
| C3 | Papildu komentārs? | Edge cases |

## Questions the advisor **anticipates** (FAQ-style, not interrogation)

Shown as expandable *"Bieži jautā"* during flow:

- Cik tonnu vajag? → Educate + `[TBD: diapazons]` + human confirms
- Pēc tonnām vai m³? → Tonnes policy
- Cik maksā? → Never price — prepare quote request
- Vai piegādājat uz manu vietu? → Rīga, Ogre, visa Latvija `[TBD: exceptions]`

Source: `knowledge/faq.md`

---

# 3. Decision flow

## 3.1 High-level flow

```
START
  │
  ├─► [Expert: "Zinu ko vajag"] ──► Short form (material hint + tonnes + address)
  │                                      │
  └─► [Project tiles P1–P10] ──► Sub-context questions (B1–B6)
              │                           │
              ▼                           ▼
         Solution brief              (same)
         (direction, not SKU)
              │
              ▼
         Confidence messages
              │
              ▼
         Human required? ──YES──► Phone / WhatsApp now
              │
              NO (prepared only)
              ▼
         Review summary → Send WhatsApp / Call
              │
              ▼
         VEDMAN human: final material + tonnes + price
```

## 3.2 Decision nodes

| Node | Condition | Route |
|------|-----------|-------|
| **Urgent** | "Šodien" / "Steidzami" | Skip long wizard → phone prominent |
| **Expert** | P9 selected | 3 fields max → WhatsApp |
| **Uncertain** | P10 or abandoned mid-flow | *"Varam palīdzēt pa tālruni"* |
| **Commercial** | P6 or PVN yes | Note in handoff + phone option |
| **Large unknown scope** | No dimensions, high anxiety | Human consultation required |
| **Access risk** | Šaura / pāri žogam | Flag in handoff |

## 3.3 Solution brief output (internal)

Not shown as final answer to customer. Example structure:

```
Project: P4 Bruģēšana
Context: ~40 m², biezums [aptuveni X cm], Adrese: [Y]
Direction: Šķembu pamats — frakciju un tonnas precizēs VEDMAN
Access: [none / šaura / pāri žogam]
Urgency: [date]
Customer: [name, phone]
Disclaimer: Nav saistošs piedāvājums — gaida VEDMAN atbildi
```

---

# 4. Information to collect

## 4.1 Minimum for prepared handoff

| Field | Required | Used for |
|-------|----------|----------|
| Project type | Yes | Solution framing |
| Adrese / vieta | Yes | Quote |
| Laiks / steidzamība | Recommended | Scheduling |
| Aptuvenais apjoms | If known | Helper only |
| Access flags | If relevant | Operations |
| Vārds | Recommended | Personal touch |
| Telefons | Recommended | Follow-up |

## 4.2 Never collected as binding

| Field | Rule |
|-------|------|
| Final fraction | Staff decides |
| Final tonnes | Staff confirms on scale |
| Price | Staff only |
| "Guaranteed suitable" checkbox | Do not exist |

## 4.3 WhatsApp handoff payload

Align with existing quote structure (`knowledge/pricing-and-ordering.md`):

```
*PROJEKTA PIETeikums — VEDMAN*

🏗 Projekts: [P1–P10 label]
📋 Apraksts: [solution direction — not binding]
📏 Aptuvenais apjoms: [X m² / m³ aptuveni / Y t — if provided]
📍 Adrese: [address]
⚠ Piebraukšana: [add-ons]
📅 Termiņš: [when]
👤 [name], [phone]
📝 [comment]

➡ Gaidām VEDMAN ieteikumu un cenu.
```

---

# 5. Confidence-building messages

Shown between steps — short, positive, educational. Never fear-based.

## 5.1 Universal

| Moment | Message |
|--------|---------|
| Start | *"Palīdzēsim saprast, kas Jūsu projektam vispiemērotāk — bez saistošas cenas."* |
| After project pick | *"Labs sākums. VEDMAN piegādā materiālus un risinājumus visā Latvijā."* |
| Before handoff | *"Nosūtīsim pieprasījumu — VEDMAN precizēs materiālu, tonnas un cenu."* |
| Tonnes touch | *"Šķembas un grants parasti pasūtām tonnās — saņemat precīzu svaru."* |

## 5.2 By project type

| Project | Message |
|---------|---------|
| P1 Ceļš | *"Piebraucamajam ceļam svarīgs pareizs pamats un biezums — palīdzēsim to noskaidrot."* |
| P2 Pamati | *"Pamatiem un drenāžai materiāls atkarīgs no projekta — VEDMAN ieteiks pēc Jūsu plāna."* |
| P3 Dārzs | *"Dārzam svarīga melnzemes kvalitāte — varam ieteikt sijātu vai nesijātu pēc mērķa."* |
| P4 Bruģe | *"Bruģa pamatam parasti izvēlas šķembu frakciju pēc seguma — precizēsim kopā."* |
| P10 Nezinu | *"Nav jāzina viss — pietiek ar īsu sarunu. Zvaniet vai rakstiet."* |

## 5.3 Trust micro-signals

- *"Atbildēsim darba laikā."* `[TBD: SLA text]`
- *"Rīga · Ogre · visa Latvija"*
- *"Skaidra cena pēc pieprasījuma — bez slēptiem."*
- Real photo snippet from gallery when project type matches `[TBD: gallery links]`

Approved voice: `knowledge/brand-voice-and-positioning.md`

---

# 6. When human consultation is required

The advisor **must not** continue solo — immediate human path.

| Trigger | Action |
|---------|--------|
| Customer selects **Steidzami / šodien** | Show phone first: *"Ātrākai atbildei — zvaniet 22312828"* |
| **P6** commercial / large volume | *"Lieliem pasūtījumiem — zvaniet"* `[TBD: threshold]` |
| **P10** + high anxiety signals | Offer call, skip product hints |
| Customer asks **"Cik maksā?"** repeatedly | Explain quote process → human |
| **Manipulator / zemes darbi** complex scope | Human — site visit may be needed `[TBD]` |
| Access impossible to describe | Phone + photo via WhatsApp |
| Customer disputes advisor suggestion | Defer to human — no argument |
| **Institutional** (pašvaldība, saimniecība) | Email/phone formal path `[TBD]` |
| AI confidence low / `[TBD]` field needed | Escalate per `knowledge/ai-operating-rules.md` |
| Customer requests **binding confirmation** | *"Galīgo apstiprinā VEDMAN pēc pieprasījuma."* |

## Soft human offer (optional, not forced)

After solution brief for P1–P5:

> *"Vēlaties īsu konsultāciju pa tālruni pirms nosūtīšanas?"* [Jā → call] [Nē → WhatsApp]

---

# 7. Transfer to phone or WhatsApp

## 7.1 Channel selection logic

| Customer signal | Primary transfer |
|-----------------|------------------|
| Steidzams | **Phone** `tel:+37122312828` |
| Expert (P9) | Phone or WhatsApp — user choice |
| First-time, anxious (P1, P10) | WhatsApp with prepared text (lower pressure) |
| Has site photos | **WhatsApp** |
| Commercial | **Phone** + `[TBD: email]` |
| After hours | WhatsApp + *"Atbildēsim nākamajā darba dienā"* |

## 7.2 Transfer UX pattern

```
┌─────────────────────────────────────┐
│  Jūsu pieprasījums ir sagatavots    │
│  [Summary card — editable]           │
│                                      │
│  [ 💬 Nosūtīt WhatsApp ]  PRIMARY    │
│  [ 📞 Zvanīt 22312828 ]   SECONDARY  │
│                                      │
│  VEDMAN apstiprinās materiālu,       │
│  tonnas un cenu.                     │
└─────────────────────────────────────┘
```

## 7.3 WhatsApp transfer

1. Show full message preview (customer can edit)
2. Tap → `wa.me/37122312828?text=...` (existing pattern)
3. Reminder screen: *"Nospiediet sūtīt WhatsApp — mēs atbildēsim [TBD: SLA]."*

## 7.4 Phone transfer

1. Tap → `tel:+37122312828`
2. Optional copy-to-clipboard of summary for customer to read to operator
3. Post-call: staff sends WhatsApp summary `[TBD: process]` per `knowledge/sales-scripts.md`

## 7.5 What transfer is NOT

- Not an automated order
- Not a confirmed quote
- Not a product reservation

---

# 8. UX wireframe (desktop)

ASCII wireframe — entry from homepage hero or dedicated *"Palīdzība projektam"* CTA.

```
┌──────────────────────────────────────────────────────────────────┐
│ VEDMAN logo          Nav    [Uzzini cenu]  [22312828]            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROJEKTA PADOMNIEKS                                             │
│  Palīdzēsim izvēlēties risinājumu — ne tikai materiālu.          │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│  Ko plānojat darīt?                                              │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ 🛣 Ceļš │ │ 🏠Pamati│ │ 🌿 Dārzs│ │ 🧱 Bruģe│                │
│  └─────────┘ └─────────┘ └─────────┘ ┌─────────┐ ┌─────────┐    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │🚜 Objekts│ │❓ Nezinu│    │
│  │ Zemes   │ │ Koki    │ │ Manipul.│ └─────────┘ └─────────┘    │
│  │ darbi   │ │         │ │         │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💡 Zinu precīzi ko vajag — īss ceļš                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Vai zvaniet: 22312828 · WhatsApp                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ footer                                                           │
└──────────────────────────────────────────────────────────────────┘

        ─── After tile selection (example: Dārzs) ───

┌──────────────────────────────────────────────────────────────────┐
│  ← Atpakaļ          Solis 2 no 3                                 │
│                                                                  │
│  Dārzs / apstādījumi                                             │
│  ✓ "Palīdzēsim izvēlēties melnzemi un risinājumu."               │
│                                                                  │
│  Kur atrodas objekts?                                            │
│  [________________________ adreses lauks]                          │
│                                                                  │
│  Aptuvenā platība (m²)?  [____]  (nav obligāti)                   │
│  [ ] Vajag konsultāciju                                          │
│                                                                  │
│            [ Turpināt → ]                                        │
│                                                                  │
│  📞 Ātrākai atbildei — zvaniet                                  │
└──────────────────────────────────────────────────────────────────┘

        ─── Summary step ───

┌──────────────────────────────────────────────────────────────────┐
│  Jūsu pieprasījuma kopsavilkums                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Projekts: Dārzs · Platība: ~80 m² · Adrese: ...            │  │
│  │ Virziens: Melnzeme / smilts — VEDMAN precizēs              │  │
│  │ ⚠ Nav saistošs piedāvājums                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [    💬 Sagatavot WhatsApp    ]  ← primary green                │
│  [    📞 Zvanīt tagad          ]                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 8.1 Placement options (future)

| Entry | When |
|-------|------|
| Hero secondary CTA | *"Palīdzība projektam"* |
| Replace long quote modal step 1 | Milestone 3 integration |
| Standalone `/projekta-padomnieks` | `[TBD]` SEO page |
| WhatsApp deep link pre-step | QR on truck |

---

# 9. Mobile flow

Mobile-first — majority of Latvian research on phone.

## 9.1 Flow steps (thumb zone)

```
[1] Full-screen project tiles (2 columns, large tap)
      ↓
[2] One question per screen (reduce cognitive load)
      ↓
[3] Optional calculator expando (collapsed by default)
      ↓
[4] Summary card + sticky bottom bar
      [ WhatsApp ]  [ Zvans ]
```

## 9.2 Mobile-specific rules

| Rule | Rationale |
|------|-----------|
| One primary action per screen | Persona 1 anxiety |
| Sticky bottom: WhatsApp + Phone | Zero-scroll escape |
| Full-screen modal sheet | Not tiny centered modal |
| Inputs `font-size ≥ 16px` | No iOS zoom |
| Progress dots (1/3, 2/3, 3/3) | Reduces abandon |
| Back always top-left | Control |
| Save draft in sessionStorage | Interrupted attention `[implementation later]` |

## 9.3 Mobile wireframe (summary step)

```
┌─────────────────────┐
│ ←  Kopsavilkums     │
├─────────────────────┤
│                     │
│  🌿 Dārzs           │
│  ~80 m²             │
│  Adrese: ...        │
│                     │
│  VEDMAN precizēs    │
│  materiālu un       │
│  tonnas.            │
│                     │
│  ⚠ Nav saistošs     │
│                     │
├─────────────────────┤
│ 📞    [ WhatsApp ]  │  ← sticky
│ Zvans   (primary)   │
└─────────────────────┘
```

## 9.4 Expert short path (P9)

```
┌─────────────────────┐
│ Īss pieprasījums    │
│ Materiāls [dropdown]│
│ Daudzums  [___] t    │
│ Adrese    [_______]  │
│ [ WhatsApp ]        │
└─────────────────────┘
```

Still no price. Still human confirms.

---

# 10. Business benefits

## 10.1 For customers

| Benefit | Mechanism |
|---------|-----------|
| Less fear of wrong order | Solution framing, not fraction quiz |
| Feels guided, not sold | Advisor tone |
| Clear next step | WhatsApp / phone with context |
| Honest expectations | No fake prices or guarantees |

## 10.2 For VEDMAN sales

| Benefit | Mechanism |
|---------|-----------|
| **Higher quality leads** | Structured project context in WhatsApp |
| **Faster quotes** | Less back-and-forth on basics |
| **Fewer disputes** | Tonnes education early |
| **Right channel** | Urgent → phone; research → WhatsApp |
| **Expert time saved** | P9 short path; human for complex only |

## 10.3 For operations

| Benefit | Mechanism |
|---------|-----------|
| Access flags upfront | šaura vieta, pāri žogam |
| Realistic urgency | Steidzami routed correctly |
| `[TBD: CRM]` | Project type tags for analytics |

## 10.4 For marketing & AI (future)

| Benefit | Mechanism |
|---------|-----------|
| Trainable flows | Maps to `knowledge/` + personas |
| Entry-point routing | Google → project tile by keyword `[TBD]` |
| Differentiation | Solution advisor vs catalog-only competitors |
| Brand trust | Prepare-only honesty |

## 10.5 KPIs to measure (when live)

| KPI | Target direction |
|-----|------------------|
| Advisor start → handoff rate | ↑ |
| WhatsApp messages with project type field | ↑ |
| Quote-to-order with fewer messages | ↑ |
| Wrong-material callbacks | ↓ |
| Phone calls from urgent path | Track separately |

`[TBD: baseline and targets after launch]`

---

# Governance & constraints

## Absolute prohibitions

| Prohibited | Instead |
|------------|---------|
| "Jums vajag tieši 0-32" | "Parasti izmanto šķembu pamatu — VEDMAN precizēs" |
| "Cena būs X €" | "Sagatavosim piedāvājumu" |
| "Garantējam pietiekamu daudzumu" | "Piegādājam pēc svara tonnās" |
| Competitor comparisons | Positive education only |

## Relationship to existing quote modal

| Today | Future |
|-------|--------|
| Quote modal = material-first | Advisor = project-first optional entry |
| Both end in same WhatsApp handoff | Shared summary format |
| Advisor does not replace modal | Coexist — user chooses path |

## Knowledge dependencies before build

- [ ] Owner fills project → material direction table `[TBD]`
- [ ] Job quantity hints in `knowledge/quantities-and-densities.md`
- [ ] Response SLA in `knowledge/customer-support.md`
- [ ] Gallery photos per project type

## Implementation note

This document is **strategy and UX only**. Implementation belongs to Milestone 3+ after owner approval. AI version must follow `knowledge/ai-operating-rules.md`.

---

*Planning document. Not committed. Not deployed.*

*Final recommendation always belongs to VEDMAN.*
