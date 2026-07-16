# Milestone 3 — VEDMAN Conversion System

**Document type:** Conversion strategy (pre-design)  
**Date:** 2026-07-13  
**Status:** Planning — no code, no redesign yet  
**North Star:** Does this make it easier for the customer to buy? (`VEDMAN_DEVELOPMENT_HANDBOOK.md` §20)

**Goal:** Increase phone calls, WhatsApp conversations, and structured quote requests from `vedman.lv` homepage traffic.

**Audience for this doc:** Product owner, designers, developers, marketing — before any Milestone 3 UI work begins.

---

## Executive summary

The current homepage has strong **structural bones**: clear material categories, a quote modal with WhatsApp handoff, multiple contact paths, and a mobile bottom bar. Conversion is held back not by missing features, but by **psychological gaps** — trust evidence arrives too late, the default buying unit sends the wrong signal, the hero does not instantly answer *"can you deliver what I need, here, tomorrow?"*, and empty or technical gallery states can actively create doubt.

Milestone 3 must treat the homepage as a **sales instrument**, not a brochure. Every section earns its place by moving the visitor from *curious* → *confident* → *contact*.

**Priority conversion fixes (strategy only):**

1. Hero must name the job-to-be-done in 3 seconds, not only brand ambition  
2. Trust must be visible before scroll — real work, real geography, real humans  
3. Tonnes-first education woven through calculator and quote flow  
4. CTA hierarchy must remove choice paralysis — one obvious next step per moment  
5. Gallery must never show developer-facing empty states to customers  
6. Mobile must optimize for thumb, anxiety, and interrupted attention  

---

## 1. Customer Journey

### Who arrives

| Visitor type | Mindset | Typical entry |
|--------------|---------|---------------|
| **Urgent private** | *"I need šķembas Saturday for the driveway"* | Google, SS.lv link, word of mouth |
| **Planning private** | *"How much melnzeme for 200 m² garden?"* | Search, Facebook share |
| **Commercial / foreman** | *"Need 20t 0-32, invoice, Rīga"* | Phone-first habit, repeat buyer |
| **Comparison shopper** | *"Who delivers fast with clear price?"* | Search, SS.lv browsing |
| **Service buyer** | *"Need manipulator at site"* | Referral, local search |

None of them arrive to admire architecture. They arrive with **anxiety**: wrong material, wrong amount, wrong price, no-show delivery, hidden fees.

### First 30 seconds — internal monologue

```
0–3s   "What is this? Do they sell what I need?"
       → Scans logo, headline, first visual
       → If unclear: bounce or scroll randomly

3–8s   "Can I trust them? Are they real, local, serious?"
       → Looks for trucks, projects, phones, geography
       → Gradient placeholders feel like template, not supplier

8–15s  "How do I order? Will it be complicated?"
       → Hunts for phone, WhatsApp, price request
       → Too many equal buttons = hesitation

15–22s "Do they deliver to ME?"
       → Rīga/Ogre/Latvia must be explicit
       → Address/distance fear for rural or regional buyers

22–30s Decision fork:
       • High intent → call or WhatsApp now
       • Medium intent → open quote form
       • Low trust → leave to check SS.lv / call someone else
       • Researchers → scroll materials, gallery, process
```

### Journey stages (target state)

| Stage | Customer feeling | Page job |
|-------|------------------|----------|
| **Orient** | *"They have my material"* | Hero + category strip |
| **Validate** | *"They are legitimate"* | Photos, gallery, geography, hours |
| **Commit** | *"Easy to ask"* | Single primary CTA |
| **Act** | *"I know what to say"* | Quote modal guides; WhatsApp pre-filled |
| **Reassure** | *"I chose right"* | Process steps, payment clarity, fast reply promise |

### Current journey friction points

| Moment | Friction | Psychological effect |
|--------|----------|----------------------|
| Hero visual (gradient) | No real delivery proof | *"Is this a real company?"* |
| Headline emphasis | Brand promise > material clarity | *"Nice slogan — but do they have grants 0-4?"* |
| Material cards (CSS textures) | Not photographic | *"Catalog feels generic"* |
| Gallery empty / admin message | Technical copy visible | *"Nobody uses this site"* |
| Quote default unit m³ | Conflicts with weighbridge reality | *"I'll get the wrong amount"* |
| Three green hero buttons | Equal weight | *"Which one is correct?"* |
| No response-time promise | Uncertainty after click | *"Will anyone answer?"* |

---

## 2. Hero Strategy

Forget current layout. Design for **clarity first, ambition second**.

### Headline — recommended direction

The headline must answer **what** and **where** before **why we're better**.

| Option type | Example direction | Psychology |
|-------------|-------------------|------------|
| **Job-first (recommended for cold traffic)** | *Šķembas, smilts, grants, melnzeme ar piegādi Rīgā un visā Latvijā* | Instant category match |
| **Outcome-first** | *Pasūti materiālus tonnās — piegādājam precīzu daudzumu* | Precision + differentiation |
| **Hybrid** | *Beramie materiāli un tehnika — piegāde Rīgā, Ogrē, visā Latvijā* | Matches eyebrow + geography |

Keep *Piegādājam vairāk, nekā gaidīji* as **sub-brand line**, not the only H1 — it works for warm traffic but not for cold search intent.

### Subheadline

Must reduce anxiety in one sentence:

> **Viens zvans vai WhatsApp — precizējam materiālu, daudzumu tonnās un piegādi.**

Why: names the channels, introduces tonnes without lecturing, promises human completion.

Alternative for commercial buyers:

> **Pašizgāzējs un manipulators — pilns risinājums objektā.**

### CTA — hero hierarchy

**Problem today:** three competing actions of similar visual weight.

**Target hierarchy:**

| Priority | Action | Label direction |
|----------|--------|-----------------|
| **Primary** | Quote / WhatsApp path | *Uzzini cenu 2 minūtēs* or *Saņem piedāvājumu WhatsApp* |
| **Secondary** | Phone | *Zvanīt 22312828* |
| **Tertiary** | Direct WhatsApp (no form) | *Rakstīt WhatsApp* — smaller, outline style |

One green button. One clear path. Phone always visible but visually secondary.

### Trust — above the fold (hero zone)

Must appear **inside hero**, not only below:

| Element | Purpose |
|---------|---------|
| Geography badge | *Rīga · Ogre · Visa Latvija* (keep, strengthen) |
| Response promise | *Atbildam tajā pašā dienā* (business hours) |
| Precision line | *Pārdodam šķembas un grants pēc svara (tonnās)* |
| Real hero photo | Truck unloading, material on site — not gradient |
| Micro-proof | *AMAPU SIA* or years active — one line, not hidden in footer |

### Hero visual strategy

Replace abstract hero with **documentary photography**:

- Truck + material + identifiable Latvian context
- Optional: short loop video (Milestone 3+), muted, no autoplay sound
- Customer must think: *"That looks like my yard / my street / my project"*

---

## 3. Trust Building

Trust is not a footer concern. It is the **conversion engine**.

### What must be visible (priority order)

| # | Trust signal | Why it works (Latvia construction) |
|---|--------------|----------------------------------|
| 1 | **Real delivery photos** | Proof of capacity; SS.lv buyers expect this |
| 2 | **Phone number** | Latvian B2B still phone-first; instant legitimacy |
| 3 | **Geographic coverage** | Fear of "Rīga only" suppliers is common |
| 4 | **Operating hours** | *"Can I call now?"* — reduces hesitation |
| 5 | **Payment options** | PVN / bez PVN, invoice — unlocks commercial buyers |
| 6 | **Process clarity** | 3 steps: choose → send → get price |
| 7 | **Gallery with real projects** | Social proof substitute until reviews integrated |
| 8 | **Material specificity** | Fractions visible (0-32, Mazgāta 0-4) — expertise signal |
| 9 | **Company identity** | SIA name, registration context — not anonymous webshop |
| 10 | **Speed claim** (honest) | Same-day response, not fake "1h delivery" |

### What to add in Milestone 3 (strategy)

- **Project count or delivery frequency** — only if truthful (*"Piegādes katru dienu Rīgas reģionā"*)
- **Google review snippet** — when available (Milestone 4); stars in hero zone
- **"Ko iegūsti pasūtot tonnās"** — 3-bullet education block near materials
- **FAQ micro-block** — *Vai piegādājat ārpus Rīgas?* *Kāda ir minimālā pasūtījuma daudzums?*

### What must never be visible to customers

- Admin panel instructions (`gallery.json`, folder paths)
- Empty gallery with developer messages
- Generic stock imagery
- Competing CTAs with equal weight
- Technical jargon without explanation

---

## 4. CTA Strategy

### Primary CTA

**Definition:** The one action we want most visitors to take.

**Recommendation:** *Uzzini cenu* → guided quote modal → WhatsApp

**Why not raw WhatsApp as primary?** Structured quote increases **quote quality** and reduces back-and-forth. Back-and-forth kills conversion for busy buyers. Pre-filled message = staff replies faster = customer feels competent.

**Why not phone as primary?** Phone is highest intent but excludes researchers and after-hours planners. Modal + WhatsApp captures intent asynchronously.

**Copy upgrades:**

| Current | Recommended test |
|---------|------------------|
| Uzzini cenu | *Uzzini cenu — 2 minūtes* |
| Sūtīt WhatsApp | *Nosūtīt pieprasījumu WhatsApp* |
| Aizpildi formu | *Sagatavot piedāvājumu* |

### Secondary CTA

**Phone:** `22312828` — always visible, never hidden behind menu on mobile.

Psychology: *"If the form fails, I can always call."* This safety net **increases** modal usage.

Secondary line `20080098` — footer and contact section; not hero clutter.

### Sticky CTA (desktop + mobile)

**Current:** bottom bar with Zvans | Uzzini cenu | WhatsApp — good foundation.

**Improvements:**

| Rule | Rationale |
|------|-----------|
| Center button = primary (quote) | Thumb natural zone on mobile |
| Persist after first scroll | Intent rises as user researches |
| Hide when modal open | Avoid duplicate actions |
| Subtle shadow / contrast | Must read as action bar, not footer |

### Mobile CTA

- Header: logo + **one** green button (quote); phone as icon or compact tel link
- Bottom bar: keep 3-tap model but **center dominant**
- Sticky tel link in header for commercial users who won't scroll
- After 60s on page (optional test): gentle prompt — *"Nepieciešama konsultācija? Zvaniet."*

### CTA placement map (target)

| Page zone | Primary | Secondary |
|-----------|---------|-----------|
| Hero | Quote | Phone |
| Material card | Quote (pre-filled) | — |
| After gallery | Quote | WhatsApp |
| CTA strip | Phone + WhatsApp + Quote (equal cards OK here — user is already convinced) | — |
| Footer | Phone | Hours / payment |
| Mobile bar | Quote (center) | Phone / WhatsApp |

---

## 5. Calculator Strategy

### Current problem

Calculator is positioned as *"Nezinu daudzumu — aprēķināt m³"* with **m³ as default unit**. Psychologically this teaches the wrong buying model and attracts disputes later.

### Strategic reposition

The calculator is not a **math tool**. It is a **confidence guide**.

**New narrative:**

> *Nezināt cik vajag? Palīdzēsim aprēķināt tilpumu — galīgo daudzumu tonnās precizēsim kopā.*

### Guided calculator flow (concept)

```
Step 1  "Ko būvējat?" → Ceļš / Pamats / Dārzs / Cits
Step 2  "Aptuvenais izmērs?" → L × W × biezums (simple)
Step 3  "Aptuvenais tilpums: X m³" (clearly labelled approximate)
Step 4  "Šim darbam parasti pasūta Y–Z tonnas" (range + disclaimer)
Step 5  "Nosūtīt šo pieprasījumu WhatsApp" (pre-filled with context)
```

### Rules

| Rule | Reason |
|------|--------|
| Default unit in quote: **tonnas** | Aligns with business model |
| m³ always labelled *"aptuveni"* | Sets correct expectation |
| Never auto-promise tonne conversion without human | Density varies by fraction |
| Calculator opens collapsed; invitation text educates | Reduces intimidation |
| Link calculator output to quote fields | Reduces retyping friction |

### Psychology

- **Guided** = *"They understand my problem"*
- **Raw calculator** = *"I'm doing homework for them"*
- **Tonne mention after m³** = *"These people are precise"* — trust, not fear

---

## 6. Quote Strategy

### Current strengths

- Pre-filled material from chips and cards
- Structured WhatsApp message
- Add-ons (pāri žogam, šaura vieta, steidzami) — excellent operational signals
- Address field for delivery pricing

### Friction points

| Friction | Impact | Fix direction |
|----------|--------|---------------|
| Long form appearance | Abandonment | Progressive disclosure — 2 steps |
| m³ default | Wrong orders | Tonnes default + education line |
| amount starts at 0 | Feels incomplete | Placeholder *"piem. 10"* or empty with hint |
| Only material required | Good — keep | Phone optional but encouraged with soft prompt |
| `alert()` on missing material | Harsh | Inline validation copy |
| No progress indicator | Uncertainty | *"1/2 — Kas vajadzīgs?"* *"2/2 — Kur piegādāt?"* |
| Modal title generic | Weak motivation | *"Saņem cenu šodien"* |

### Recommended quote flow (2 steps)

**Step 1 — What**

- Materiāls / frakcija
- Daudzums + unit (tonnas default)
- Guided calculator link
- Add-ons

**Step 2 — Where & contact**

- Adrese
- Vārds, telefons (telefons ar soft prompt: *"Lai varētu ātri atbildēt"*)
- Komentārs
- Send → WhatsApp

### Reduce friction tactics

- Chip selection on homepage **opens modal with fields filled** — already works; make transition obvious (*"Pievienots: Dolomīta šķembas 0-32"*)
- Show preview of WhatsApp message before send (trust + control)
- After send: confirmation screen — *"Piedāvājums sagatavots. Atveriet WhatsApp un nospiediet sūtīt. Atbildēsim tajā pašā dienā."*
- Commercial hint: *"Lieliem apjomiem — zvaniet 22312828"*

---

## 7. WhatsApp Strategy

### Role of WhatsApp

WhatsApp is Latvia's **default business conversation layer** for SMEs. It feels lower commitment than a phone call but faster than email. It is the **bridge** between anonymous browsing and human relationship.

### When WhatsApp should appear

| Moment | Format | Why |
|--------|--------|-----|
| Hero | Secondary/tertiary button | High-intent skimmers |
| Mobile bottom bar | Always | Thumb access |
| After quote completion | Primary send action | Structured handoff |
| CTA strip (mid-page) | Equal card | User already engaged |
| Post-gallery | Contextual line | *"Redzējāt līdzīgu projektu? Rakstiet mums."* |
| Footer | Link | Safety net |

### When WhatsApp should NOT be the only path

- First visit, complex project (manipulator + materials) — guide to quote form first
- Commercial buyers needing invoice — show phone prominently
- Users who selected many add-ons — structured message helps staff

### Message psychology

Pre-filled message must make the customer feel **professional**, not silly:

- Correct Latvian
- Clear sections (already good)
- Include unit explicitly
- End with open question invite: *"Gaidām cenu un piegādes laiku."*

### Response expectation

Site must state: **Atbildam tajā pašā darba dienā (P.–Pk. 07:00–18:00).**

Unanswered WhatsApp is worse than no WhatsApp — it destroys trust faster than no chat button.

---

## 8. Mobile Strategy

~70%+ of Latvian local service research happens on mobile. Milestone 3 is mobile-first conversion.

### Thumb zone map

```
┌─────────────────────────┐
│ Logo          [Cenu]  │  ← one tap quote
├─────────────────────────┤
│                         │
│   Hero + trust          │
│                         │
├─────────────────────────┤
│ 📞 Zvans │ CENU │ 💬 WA │  ← sticky bar (center primary)
└─────────────────────────┘
```

### Mobile rules

| Rule | Detail |
|------|--------|
| Touch targets ≥ 48px | Chips, buttons, add-ons |
| No hover-only affordances | Everything tappable |
| Single-column quote modal | Full-screen sheet on small viewports |
| `inputmode="decimal"` | Already present — keep |
| Phone uses `tel:` | One tap dial |
| Reduce header nav on mobile | Hamburger or fewer links — CTA space priority |
| Material chips wrap cleanly | No horizontal trap |
| Gallery 1 column | Large tap targets on images |

### Mobile-specific anxiety reducers

- Click-to-call in sticky bar — *"Ātrāk par formu"*
- WhatsApp deep link tested on iOS and Android
- Modal scroll lock without layout jump
- Font size ≥ 16px on inputs (no iOS zoom)

### Interrupted attention

Mobile users switch apps. Quote modal state should survive brief interruption (sessionStorage — implementation later). Strategy: *"Your request is still here."*

---

## 9. Psychology

### What creates confidence

| Signal | Mechanism |
|--------|-----------|
| **Specificity** | 0-32, Mazgāta 0-4 — expertise |
| **Photographic proof** | Real trucks, real piles, real sites |
| **Named geography** | Rīga, Ogre, visa Latvija — local operator |
| **Tonnes framing** | Precision, industry norm, fairness |
| **Fast process** | 3 steps — low effort |
| **Human channels** | Phone + WhatsApp — not faceless form |
| **Payment transparency** | PVN, invoice, cash — no surprises |
| **Add-on chips** | *"They understand delivery reality"* |
| **Hours visible** | Legitimate business, not side hustle |
| **Consistent brand voice** | Positive, educational (§14 handbook) |

### What creates doubt

| Signal | Mechanism |
|--------|-----------|
| Generic visuals | *"Template website"* |
| Empty gallery / admin text | *"Abandoned or fake"* |
| m³-first pricing signal | *"Wrong amount risk"* |
| Too many equal CTAs | Decision paralysis |
| No company name early | *"Who am I calling?"* |
| No response-time expectation | *"Will they ghost me?"* |
| Vague headline | *"Pretty words, no facts"* |
| Hidden phone | *"They don't want calls — suspicious"* |
| Overlong form | *"Too much work"* |
| Stock photos (if introduced) | Immediate distrust in construction |

### Emotional arc (target)

```
Anxiety → Recognition → Relief → Action → Confirmation
   ↑           ↑            ↑          ↑           ↑
 "Need      "They       "Easy     "I did    "They'll
  material"   have it"    to ask"    it right"  respond"
```

---

## 10. Competitor Analysis

*Without naming specific companies — patterns observed in the Latvia aggregates and construction logistics market.*

### Market patterns

| Competitor type | Typical strength | Typical weakness |
|-----------------|------------------|------------------|
| **SS.lv listers** | Phone in title, raw pricing hints, fast human answer | Weak web, no brand, inconsistent quality |
| **Large quarries / brands** | Scale, material range | Slow, impersonal, minimum orders, corporate friction |
| **Local hauliers** | Relationship, flexibility | Poor digital, unclear fractions, no gallery |
| **General construction firms** | Full service | Materials not core, opaque pricing |

### Where VEDMAN can win

| Dimension | Opportunity |
|-----------|-------------|
| **Digital + human** | Structured WhatsApp quote + real phone — beats anonymous SS.lv |
| **Precision story** | Tonnes-first education — beats m³ vagueness without attacking |
| **Breadth** | Materials + manipulator + zemes darbi — one supplier simplicity |
| **Geography** | National claim with Rīga/Ogre heart — beats hyper-local only |
| **Proof** | Firebase gallery of real work — beats text-only listers |
| **Speed** | Same-day quote response — beats slow quarry ticket systems |

### Where VEDMAN must not compete

- Race to bottom on published price per m³ — destroys margin and trust
- Fear marketing about others — violates brand voice
- Feature arms race (chatbots, portals) before core conversion works

### Positioning statement (internal)

> **VEDMAN — precīza piegāde tonnās, viens kontakts visam objektam, reāli darbi, ārta atbilde.**

---

## 11. Expected Business Impact

### Assumptions

- Baseline traffic: mixed SEO branded + SS.lv referrals + direct
- Current homepage: multiple CTAs, weak above-fold trust, gallery risk
- Sales team can respond same-day to increased WhatsApp volume
- Milestone 3 implements strategy + real photography + quote UX

### Leading indicators (30 days post-launch)

| Metric | Expected direction | Notes |
|--------|-------------------|-------|
| Quote modal opens | +25–40% | Clearer primary CTA, material pre-fill |
| WhatsApp conversations | +20–35% | Better handoff copy + trust |
| Phone calls | +10–20% | Safety net + trust, not hero clutter |
| Bounce rate (mobile) | −15–25% | Hero clarity + real photos |
| Gallery engagement | +50%+ | Real images vs empty state |
| Quote completion rate | +30–50% | 2-step flow, tonnes default, less friction |

*Ranges are estimates for planning — measure with analytics (Milestone 4).*

### Business outcomes (90 days)

| Outcome | Mechanism |
|---------|-----------|
| **More qualified leads** | Structured WhatsApp = material + qty + address |
| **Faster quotes** | Less back-and-forth; staff has context |
| **Higher close rate** | Tonnes alignment = fewer delivery disputes |
| **Commercial retention** | Phone + PVN visible; professionalism |
| **SS.lv synergy** | Website confirms what ad promised — trust transfer |

### Revenue logic

```
More qualified leads
  × Higher contact rate (phone + WhatsApp)
    × Faster quote turnaround
      × Higher trust (precision + photos)
        = More orders closed
```

Even **one additional delivery per week** from improved conversion likely exceeds Milestone 3 investment.

### Risks if strategy ignored

| Risk | Cost |
|------|------|
| Gallery empty state live | Active trust destruction |
| m³-first remains default | Disputes, refunds, bad reviews |
| No analytics | Cannot prove or improve |
| WhatsApp volume without response SLA | Worse than no button |

### Success criteria for Milestone 3 (conversion)

- [ ] Visitor answers 4 questions in 5–10 seconds (§15 handbook)
- [ ] Hero shows real VEDMAN delivery photography
- [ ] Gallery never shows developer empty state to public
- [ ] Quote flow defaults to tonnes with guided calculator
- [ ] Primary CTA hierarchy unmistakable on mobile
- [ ] Same-day response promise visible near contact actions
- [ ] Manual test: 5 cold users complete quote without help

---

## Implementation sequence (strategy only)

| Phase | Focus | Conversion lever |
|-------|-------|------------------|
| **3A** | Trust layer — hero photo, gallery populated, empty states | Doubt removal |
| **3B** | CTA hierarchy + mobile bar polish | Action clarity |
| **3C** | Quote flow 2-step + tonnes-first + guided calculator | Friction reduction |
| **3D** | Copy pass — hero, micro-trust, response promise | Psychology |
| **3E** | Validation — 5-user test, analytics hooks prep | Measurement |

---

## Alignment with handbook

| Handbook section | This document |
|------------------|---------------|
| §10 Business Rules | Tonnes-first, delivery areas |
| §14 Brand Voice | Positive education, no fear |
| §15 Conversion Rules | 5–10 second test, CTA structure |
| §16 Photography | Real work only |
| §18–§20 Decision filter | Every M3 change must ease buying |

---

## Next step

Review and approve this conversion system. **Only then** begin Milestone 3 visual design and implementation. No code until strategy is signed off.

---

*Planning document. Not committed. Not deployed.*
