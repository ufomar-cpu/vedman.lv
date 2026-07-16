# Customer Entry Points — VEDMAN Platform Strategy

**Document type:** Entry-point architecture & CRO strategy  
**Date:** 2026-07-13  
**Status:** Planning — no code, no redesign, no implementation  
**Related:** `CUSTOMER_PERSONAS_AND_JOURNEYS.md`, `MILESTONE3_CONVERSION_SYSTEM.md`, `VEDMAN_DEVELOPMENT_HANDBOOK.md`

**Goal:** Design the VEDMAN platform around **how customers arrive**, not around website pages. Every entry point has different intent, trust, urgency, and optimal route to quote → order → repeat.

**North Star:** Does this make it easier for the customer to buy?

---

## Executive summary

Customers do not experience VEDMAN as `index.html`. They experience VEDMAN as:

- A Google result at 22:00 on their phone  
- A phone number on a truck door  
- A neighbour's recommendation  
- An SS.lv listing with a price hint  
- A WhatsApp contact saved from last spring  

The current platform is **page-centric** (homepage → sections → modal). The future platform must be **entry-centric** (need → best route → action). Milestone 3–4 UX should implement smart routing concepts; Milestone 6 architecture should formalize them.

---

# Part 1 — Entry Point Profiles

For each entry: **why they came · what they know · what they need · concern · urgency · trust · expected action · best landing · best CTA · best follow-up**

---

## 1. Google Search

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Active problem — needs material or delivery now/planned; comparing options |
| **What they already know** | Search term (*šķembas Rīga*, *melnzeme piegāde*, *manipulators*) — partial intent only |
| **What they still need** | Confirmation VEDMAN sells that exact thing; delivery to their area; how to get price |
| **Biggest concern** | Wrong supplier / wasted time / hidden delivery cost |
| **Urgency** | Medium–high (search = intent) |
| **Trust level** | Low — anonymous tab among 5+ results |
| **Expected action** | Scan 10 seconds → call, WhatsApp, or bounce |
| **Best landing page** | Material-specific page matching keyword (Milestone 4) — today: homepage with keyword-visible hero |
| **Best CTA** | *Uzzini cenu* if researching; phone if urgent query (*piegāde šodien*) |
| **Best follow-up** | Same-day WhatsApp/phone reply with price + delivery window |

**Personas:** 1, 3, 4, 5 · **Journey:** C

---

## 2. Google Maps / Google Business

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Local discovery — *"kas piegādā šķembas man tuvumā?"* |
| **What they already know** | VEDMAN exists locally; sees name, maybe reviews, hours |
| **What they still need** | Phone, directions, hours, confirmation still active |
| **Biggest concern** | Business closed / wrong location / outdated listing |
| **Urgency** | Medium–high — often mobile, near purchase |
| **Trust level** | Medium — Google legitimacy layer |
| **Expected action** | **Call** or **Directions** — Maps-native behaviour |
| **Best landing page** | Google Business profile (primary) — website confirms scale |
| **Best CTA** | Click-to-call on Maps; hours visible on site if they click through |
| **Best follow-up** | Answer call; invite to save WhatsApp for future |

**Personas:** 1, 2, 3, 5 · **Journey:** C variant

---

## 3. SS.lv

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Latvian habit — classifieds = real prices, real phones, fast humans |
| **What they already know** | Material category, maybe price hint *"no X €/t"*, phone number |
| **What they still need** | Trust that website company = SS.lv lister; seriousness beyond ad |
| **Biggest concern** | Website = markup; ad was simpler and cheaper |
| **Urgency** | High — SS.lv browsers are buyers |
| **Trust level** | Medium on SS.lv — low until website validates |
| **Expected action** | **Phone call** first; website optional validation |
| **Best landing page** | Homepage or material page — proof layer, not form layer |
| **Best CTA** | Phone (match SS.lv number exactly); secondary WhatsApp |
| **Best follow-up** | Immediate answer; reference SS.lv listing if they mention it |

**Personas:** 1, 3, 5 · **Journey:** D

---

## 4. Facebook

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Saw post/story/ad — project photo, seasonal offer, friend engagement |
| **What they already know** | Visual outcome (*"nice driveway"*, *"garden soil"*) — emotional hook |
| **What they still need** | Who is VEDMAN; can they do same for me; how to contact |
| **Biggest concern** | Ad looks good but company fake; no local presence |
| **Urgency** | Low–medium — inspiration phase unless ad says *steidzami* |
| **Trust level** | Medium if photo real; low if stock |
| **Expected action** | WhatsApp or Messenger; browse gallery |
| **Best landing page** | Homepage gallery + matching project type; or dedicated FB landing section |
| **Best CTA** | WhatsApp — Meta ecosystem native |
| **Best follow-up** | Photo reply of similar project; warm tone |

**Personas:** 1, 4 · **Journey:** E

---

## 5. Instagram

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Visual discovery — reels of delivery, before/after, equipment |
| **What they already know** | Brand aesthetic; VEDMAN does deliveries |
| **What they still need** | Price path; geography; material match |
| **Biggest concern** | Instagram pretty ≠ reliable supplier |
| **Urgency** | Low–medium |
| **Trust level** | Medium — visual proof strong for Persona 4 |
| **Expected action** | WhatsApp via bio link; save post |
| **Best landing page** | Gallery-heavy; landscaping / stone paths for IG audience |
| **Best CTA** | WhatsApp *"Raksti mums"* |
| **Best follow-up** | Quick visual reply — site photo from similar job |

**Personas:** 4, 1 · **Journey:** E

---

## 6. TikTok

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Entertainment → curiosity — truck unloading, satisfying drop, equipment |
| **What they already know** | VEDMAN name; memorable visual |
| **What they still need** | Everything practical — price, area, material |
| **Biggest concern** | Viral clip ≠ serious business |
| **Urgency** | Low — impulse curiosity unless tied to project |
| **Trust level** | Low–medium |
| **Expected action** | Follow; maybe click bio; rare immediate buy |
| **Best landing page** | Short hero video + phone; don't bury in long form |
| **Best CTA** | WhatsApp or phone — one tap |
| **Best follow-up** | Casual, fast reply — match TikTok energy professionally |

**Personas:** 1 (younger), 4 · **Journey:** E variant

---

## 7. LinkedIn

| Dimension | Detail |
|-----------|--------|
| **Why they came** | B2B — construction firm, municipal contact, partnership |
| **What they already know** | VEDMAN as supplier candidate; company page |
| **What they still need** | Scale, reliability, invoice, references |
| **Biggest concern** | Too small for contract; informal process |
| **Urgency** | Low — procurement cycle |
| **Trust level** | Medium — professional context |
| **Expected action** | Message, email, or call procurement contact |
| **Best landing page** | Homepage footer + services; future commercial page |
| **Best CTA** | Phone + *"Lieliem pasūtījumiem"* |
| **Best follow-up** | Formal quote email; project references |

**Personas:** 3, 6 · **Journey:** long-cycle B2B

---

## 8. Word of Mouth

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Trusted recommendation — neighbour, colleague, contractor |
| **What they already know** | *"Zvani VEDMAN — labi piegādā"* — high pre-trust |
| **What they still need** | Phone number; optional validation |
| **Biggest concern** | Waste referrer's reputation if bad experience |
| **Urgency** | Medium–high — often project-driven |
| **Trust level** | **High** — best trust of all entry points |
| **Expected action** | **Phone call** immediately |
| **Best landing page** | Optional — phone from referrer may skip site |
| **Best CTA** | Answer phone fast; website secondary |
| **Best follow-up** | Ask *"Kas ieteica?"*; extra care on first delivery |

**Personas:** All · **Journey:** F

---

## 9. Returning Customer

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Reorder — knows product and process |
| **What they already know** | Materials, quality, phone, maybe WhatsApp thread |
| **What they still need** | Availability, price today, delivery slot |
| **Biggest concern** | Friction increased; slower than last time |
| **Urgency** | **High** |
| **Trust level** | **High** |
| **Expected action** | Phone or WhatsApp — **not** full website journey |
| **Best landing page** | Minimal — phone sticky; future Quick Reorder |
| **Best CTA** | Click-to-call; saved WhatsApp |
| **Best follow-up** | *"Tā pati adrese? Tāds pats daudzums?"* — speed |

**Personas:** 2, 3, 5 · **Journey:** B

---

## 10. Direct Phone Referral

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Someone gave number directly — *"šis ir numurs"* |
| **What they already know** | Phone only; maybe material hint |
| **What they still need** | Human answer; confirmation they called right place |
| **Biggest concern** | Wrong number; rude reception |
| **Urgency** | **High** |
| **Trust level** | High (transfer of referrer trust) |
| **Expected action** | Call — may never visit website |
| **Best landing page** | N/A — telephony is the product |
| **Best CTA** | Professional phone greeting |
| **Best follow-up** | Send WhatsApp summary after call — lock in order |

**Personas:** 1, 3, 5, F · **Journey:** F

---

## 11. QR Code on Truck

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Saw delivery in their street — curiosity + social proof in situ |
| **What they already know** | VEDMAN delivers here; real truck seen |
| **What they still need** | Easy save contact; what else VEDMAN sells |
| **Biggest concern** | QR spam / useless page |
| **Urgency** | Low–medium — bookmark for later project |
| **Trust level** | **High** — witnessed real delivery |
| **Expected action** | Scan → mobile homepage or WhatsApp deep link |
| **Best landing page** | Mobile-first; phone + WhatsApp + *"Redzējāt mūs kaimiņos"* |
| **Best CTA** | WhatsApp *"Sveiki — redzēju piegādi"* pre-filled |
| **Best follow-up** | Friendly reply; offer quote for their project |

**Personas:** 1, 4 · **Journey:** hybrid F + visual trust

---

## 12. Business Card

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Met at site, expo, networking — face-to-face trust |
| **What they already know** | Human name; VEDMAN brand; phone |
| **What they still need** | Reminder when project starts — weeks later |
| **Biggest concern** | Card lost; forget who they met |
| **Urgency** | Low at receipt — high when project starts |
| **Trust level** | Medium–high — personal connection |
| **Expected action** | Save contact; call when ready |
| **Best landing page** | Homepage with team/company credibility |
| **Best CTA** | Phone; save WhatsApp contact card (future) |
| **Best follow-up** | CRM note if possible; optional check-in call |

**Personas:** 3, 4, 6 · **Journey:** delayed B

---

## 13. Email

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Formal inquiry — company, municipality, documented quote |
| **What they already know** | VEDMAN from web/search/referral; needs paper trail |
| **What they still need** | Written quote; specs; delivery terms |
| **Biggest concern** | No response; informal reply |
| **Urgency** | Low–medium — process-driven |
| **Trust level** | Medium |
| **Expected action** | Send requirements; wait for quote |
| **Best landing page** | Contact section with email visible (future dedicated) |
| **Best CTA** | Reply within 24h with structured quote |
| **Best follow-up** | PDF/email quote; phone call to confirm |

**Personas:** 6, 3 · **Journey:** B2B procurement

---

## 14. YouTube (bonus — realistic channel)

| Dimension | Detail |
|-----------|--------|
| **Why they came** | How-to / project video — delivery footage, equipment |
| **What they already know** | VEDMAN operates at scale |
| **What they still need** | Local service; contact |
| **Biggest concern** | Video company ≠ local supplier |
| **Urgency** | Low |
| **Trust level** | Medium |
| **Expected action** | Subscribe; link click |
| **Best landing page** | Homepage + geography emphasis |
| **Best CTA** | WhatsApp |
| **Best follow-up** | Standard quote flow |

---

## 15. Direct URL / Bookmark

| Dimension | Detail |
|-----------|--------|
| **Why they came** | Typed vedman.lv or saved bookmark |
| **What they already know** | Brand fully |
| **What they still need** | Depends — reorder vs browse |
| **Biggest concern** | Site changed / broken |
| **Urgency** | Variable |
| **Trust level** | High |
| **Expected action** | Fast path to contact or quote |
| **Best landing page** | Homepage with immediate recognition |
| **Best CTA** | Phone + quote |
| **Best follow-up** | Persona-dependent |

**Personas:** 2 · **Journey:** B

---

# Part 2 — Entry Point Matrix

| Entry source | Intent | Trust | Urgency | Needs | CTA | Conversion probability |
|--------------|--------|-------|---------|-------|-----|------------------------|
| Google Search | High — active need | Low | Med–High | Material match, area, price path | Quote / Phone | **Medium** |
| Google Maps | High — local buy | Med | Med–High | Phone, hours, directions | **Phone** | **High** |
| SS.lv | High — buyer | Med | High | Same phone, proof, price talk | **Phone** | **Very High** |
| Facebook | Med — inspired | Med | Low–Med | Trust, WhatsApp | WhatsApp | Medium |
| Instagram | Med — visual | Med | Low–Med | Gallery, WhatsApp | WhatsApp | Medium |
| TikTok | Low–Med — curious | Low–Med | Low | Contact simplicity | WhatsApp | Low |
| LinkedIn | Med — B2B eval | Med | Low | Scale, invoice, refs | Phone / Email | Medium (high value) |
| Word of mouth | High | **Very High** | Med–High | Answer phone | **Phone** | **Very High** |
| Returning customer | **Very High** | **Very High** | **High** | Speed, slot, price | **Phone / WA** | **Very High** |
| Direct phone referral | High | Very High | **High** | Human answer | **Phone** | **Very High** |
| QR on truck | Med | High | Low–Med | Save contact | WhatsApp | Medium–High |
| Business card | Med | Med–High | Low (delayed) | Remember, call later | Phone | Medium |
| Email | Med — formal | Med | Low | Written quote | Email reply | Medium (high value) |
| Direct URL | High | High | Variable | Fast route | Phone / Quote | High |

**Conversion probability** = likelihood of contact → qualified lead → order, given current platform (not optimized V6).

---

# Part 3 — Smart Routing

Smart routing = **detect entry context → minimize steps → right action**.

Not all routable today without UTM/analytics (Milestone 4). Strategy defines target behaviour.

---

## Routing patterns

### Google Search

```
Google (keyword: e.g. "melnzeme Rīga")
  → Material landing (melnzeme) — keyword confirmation
    → Guided calculator (area m² → aptuveni tonnas)
      → Quote modal (pre-filled: Melnzeme, Sijāta)
        → WhatsApp send
          → [fallback] Phone if no reply 2h
```

**Urgent variant** (*šķembas šodien*): skip calculator → phone prominent above quote.

---

### Google Maps

```
Google Maps
  → [Primary] Phone — one tap
  → [Secondary] Directions / Hours
  → [If website click] Mobile homepage — phone hero, hours, map footer
    → No long form first
```

---

### SS.lv

```
SS.lv ad
  → Phone (70% convert here — do not fight it)
  → [If website] Trust layer only:
      Real photos + same phone + "Skaidra cena pēc pieprasījuma"
    → WhatsApp (secondary)
```

---

### Facebook / Instagram

```
Social post
  → Project-type landing anchor (#galerija or material section)
    → Trust (matching photo in gallery)
      → WhatsApp (pre-filled: "Sveiki, redzēju Jūsu projektu — vajag līdzīgu")
        → Quote modal only if WhatsApp idle
```

---

### TikTok

```
TikTok bio link
  → 10-second hero video + 2 buttons: WhatsApp | Zvanīt
    → No scroll required for action
```

---

### LinkedIn

```
LinkedIn
  → Commercial trust page (future) or homepage services + footer
    → Phone / email for lielie pasūtījumi
      → Formal quote — no WhatsApp-only dead end
```

---

### Word of mouth / Direct phone referral

```
Referral
  → Phone (immediate)
    → Staff: warm tone, ask referrer name
      → Post-call WhatsApp summary + saved contact
        → First delivery excellence → Persona 2 loop
```

---

### Returning customer

```
Returning (direct / bookmark / saved WA)
  → Quick path: Phone | WhatsApp thread
  → [Future] Quick Reorder — last material, tonnes, address
  → Website: phone sticky, no forced education
```

---

### QR on truck

```
QR scan
  → Mobile micro-landing: "Piegādājam arī Jums" + WhatsApp + Phone
  → Pre-filled: "Redzēju Jūsu piegādi — interesē [materiāls]"
```

---

### Business card

```
Card (weeks later)
  → Homepage recognition
    → Phone or WhatsApp
      → "Runājām pie objekta — tagad gatavs pasūtīt?"
```

---

### Email

```
Email inquiry
  → Structured reply template — material, tonnes, address, PVN
    → Phone follow-up within 24h
      → Written quote attached
```

---

## Routing principles

| Principle | Rule |
|-----------|------|
| **Don't fight the channel** | SS.lv/Maps/referral → phone wins |
| **Match trust to friction** | Low trust → more proof before form |
| **High trust → fewer steps** | Returning → skip calculator |
| **Urgency → phone** | Pavers, same-day → tel first |
| **Research → guide** | Homeowners → calculator + education |
| **Always escape hatch** | Form stuck → phone visible |

---

# Part 4 — Top 20 Opportunities

*Outperform market by customer experience only — no competitor names.*

1. **Same-day response guarantee** — stated on every entry landing  
2. **Tonnes-first education** — precision without fear marketing  
3. **Structured WhatsApp quote** — beats unstructured SS.lv messages for quote quality  
4. **Real delivery gallery** — beats text-only classifieds  
5. **One supplier breadth** — materials + manipulator + zemes darbi in one contact  
6. **Guided calculator for beginners** — reduces Persona 1 paralysis  
7. **Phone always visible** — respects Latvian phone-first buyers  
8. **Geographic clarity** — Rīga, Ogre, visa Latvija — reduces distance fear  
9. **Access add-ons** — šaura vieta, pāri žogam — proves site experience understanding  
10. **QR → WhatsApp** — converts street-level proof to lead  
11. **Referral recognition** — *"Kas ieteica?"* — honors trust chain  
12. **Repeat customer speed** — recognize and shortcut  
13. **Google Maps ↔ site consistency** — hours, phone, photos synced  
14. **Material-specific landings** — keyword match for Google intent  
15. **Post-call WhatsApp summary** — locks verbal orders  
16. **Invoice/PVN clarity upfront** — unlocks B2B without friction  
17. **Proactive delivery updates** — beats silent suppliers  
18. **Honest approximate m³** — builds long-term trust vs false precision  
19. **Seasonal entry campaigns** — spring garden, autumn road — matched routing  
20. **Multi-channel unique copy** — SS.lv ≠ Google ≠ IG — same brand, native feel  

---

# Part 5 — VEDMAN Platform Architecture V6

## Current model (page-centric)

```
Homepage
    ↓
Pages (sections)
    ↓
Design system
    ↓
Hope customer finds CTA
```

**Problem:** Every entry point dumps into same homepage. A returning paver and a scared first-time homeowner see identical friction.

---

## V6 model (entry-centric)

```
Customer
    ↓
Entry point (Google / SS.lv / Referral / QR / …)
    ↓
Detected or declared NEED
    (material · urgency · expertise · trust level)
    ↓
Best ROUTE
    (phone-first · guided quote · quick reorder · commercial)
    ↓
QUOTE
    (structured · channel-native)
    ↓
ORDER
    (confirmed · tonnes · address · time)
    ↓
REPEAT CUSTOMER
    (CRM memory · quick path · referral loop)
```

---

## V6 logical components (not pages)

| Component | Purpose |
|-----------|---------|
| **Entry layer** | UTM, referrer, QR params, `?need=skembas`, Maps |
| **Intent router** | Maps entry → phone hero; Google → material landing |
| **Trust layer** | Photos, reviews, geography — scaled to trust deficit |
| **Guidance layer** | Calculator wizard, job-based paths — for low expertise |
| **Action layer** | Phone, WhatsApp, quote modal — one primary per route |
| **Quote engine** | Structured message, tonnes default, channel send |
| **Fulfillment comms** | Confirmation, delivery window, proactive delay |
| **Memory layer** | Repeat customer, referrer, commercial account |

---

## V6 vs current site map

| Today | V6 equivalent |
|-------|---------------|
| `index.html` | Hub + router fallback |
| `pages/*.html` | Material **need** destinations |
| Quote modal | Quote engine (route-aware) |
| `vedman-panel.html` | Operations — not customer-facing |
| Phone in header | Action layer — route-prioritized |
| Gallery | Trust layer — entry-matched |

---

## V6 entry → route map (target)

| Entry | Primary route | Secondary route |
|-------|---------------|-----------------|
| Google (material) | Material page → quote | Phone |
| Google (urgent) | Phone | WhatsApp |
| Maps | Phone | Hours |
| SS.lv | Phone | Trust homepage |
| Social | WhatsApp | Gallery |
| Referral | Phone | WA summary |
| Returning | Quick reorder / phone | WhatsApp thread |
| QR truck | WhatsApp pre-fill | Phone |
| Email | Formal quote | Phone confirm |
| LinkedIn | Commercial contact | Email |

---

# Part 6 — Top 10 Highest ROI Improvements

Ranked by impact × feasibility × alignment with entry points. **Strategy only.**

| Rank | Improvement | Entry points helped | Why high ROI |
|------|-------------|---------------------|--------------|
| **1** | **Answer phone fast + same-day response promise on site** | Referral, SS.lv, Maps, Returning, Paver | Converts highest-trust entries; zero dev cost |
| **2** | **Phone + WhatsApp sticky mobile — zero scroll** | All mobile entries | Removes #1 friction across channels |
| **3** | **Real photos in gallery + hero — kill empty states** | Google, Social, SS.lv validation | Trust multiplier for low-trust entries |
| **4** | **SS.lv ↔ website phone/brand consistency** | SS.lv | Highest-volume Latvian buyer habit |
| **5** | **Google Maps profile optimized + synced hours/photos** | Maps | High-intent local; often overlooked |
| **6** | **Material-specific landing content (Milestone 4)** | Google Search | Keyword match = lower bounce |
| **7** | **Tonnes-first quote + guided calculator** | Google, Social, Homeowner | Fewer disputes; higher close rate |
| **8** | **QR on truck → WhatsApp deep link** | QR, Word of mouth visual | Converts witnessed proof to leads |
| **9** | **Post-call WhatsApp order summary** | Phone entries | Locks verbal orders; reduces errors |
| **10** | **UTM + entry analytics (Milestone 4)** | All | Enables smart routing; measure what works |

---

## Implementation phasing (strategy)

| Phase | Focus |
|-------|-------|
| **Now (ops)** | Phone SLA, SS.lv sync, Maps profile, referral ask |
| **Milestone 3** | Trust photos, CTA hierarchy, tonnes quote, mobile sticky |
| **Milestone 4** | Material landings, UTM, analytics, JSON-LD local |
| **V6** | Intent router, quick reorder, commercial path, CRM memory |

---

## Alignment checklist

| Handbook / doc | This document |
|----------------|---------------|
| §20 Golden Rule | Every route eases buying |
| Personas 1–6 | Entry → persona mapping |
| MILESTONE3 Conversion | Hero, quote, calculator tactics |
| §11 Marketing | Channel-native copy per entry |

---

## Summary

VEDMAN wins not by having more pages, but by **recognizing how the customer arrived** and routing them through trust → action in the fewest steps. Phone entries want voice. Google entries want confirmation. Social entries want WhatsApp. Returning entries want speed. The platform must bend to the entry — not the other way around.

---

*Planning document. Business strategy only. Not committed. Not deployed.*
