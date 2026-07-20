# VEDMAN Material Center — Master Plan

**Document type:** Product information architecture & knowledge center strategy  
**Date:** 2026-07-16  
**Status:** Planning — no code, no deployment  
**Related:** `knowledge/materials/` · `knowledge/README.md` · `PROJECT_ADVISOR.md` · `MILESTONE3_CONVERSION_SYSTEM.md`

---

## Executive summary

The **VEDMAN Material Center** will be the most professional **construction material library** in Latvia — not a price list, not a simple e-commerce catalog.

Each material gets a **digital passport**: verified facts, educational content, real VEDMAN photography, honest limits (*when NOT to use*), and a path to quote — with **no invented technical data**.

**Research basis (structure only — no copied text):** Public industry patterns from Latvian quarry operators, aggregate suppliers, and declaration-of-performance documents; topic models from Saulstari, Sāļiņi, Aktuves, Oļi, NIKOV-class sites; normative frameworks **LVS EN 12620** (concrete aggregates), **LVS EN 13242** (unbound/hydraulically bound materials), **LVS EN 13043** (road surfacing), **LVS EN 13450** (railway ballast) where applicable.

**VEDMAN rule:** Coefficients, strength classes, frost resistance, and producer claims for **materials VEDMAN delivers** remain `[TBD]` until owner supplies certificate, lab report, or quarry DoP.

---

## Vision

| Not this | This |
|----------|------|
| Product grid with "Buy" | Material passport with education |
| Single stock photo | Hero, pile, truck, installed — real VEDMAN |
| Hidden limitations | *When NOT to use* section |
| m³ price traps | Tonnes-first + calculator with disclaimer |
| Duplicate SS.lv text | Unique SEO + schema per material |
| Siloed website pages | One database → web, WhatsApp, AI, social, SS.lv |

**North Star:** Help customer choose the **right solution** (`PROJECT_ADVISOR.md`) — Material Center supplies **deep material truth** for that decision.

---

## Competitive research — topic map (structure learned, not copied)

Public Latvian/EU aggregate publishers commonly organize content around these **topic clusters**. VEDMAN adopts the structure, writes original content.

### Cluster A — Identity

- Material name (LV + optional EN)
- Material type (dolomīts, granīts, smilts, grants, augsne)
- Fraction designation (d/D mm)
- Producer / quarry / source region `[TBD for VEDMAN supply chain]`
- Certification / DoP reference **when VEDMAN sells certified lot**

### Cluster B — Physical properties

- Particle size distribution / frakcija
- Bulk density (tilpuma blīvums) — **t/m³ for delivery**
- Particle density (grains blīvums) — separate concept
- Shape (plakšņainība / formas indekss) `[TBD when tested]`
- Moisture, absorption `[TBD]`
- Colour, texture (visual)

### Cluster C — Mechanical / durability (when certified)

- Los Angeles (LA) coefficient
- Micro-Deval
- Frost / salt resistance (salumkusumizturība)
- Strength / marka (M series) — **only with certificate**
- Flakiness index

### Cluster D — Application intelligence

- Recommended uses (ceļi, pamati, drenāža, dārzs, bruģis)
- Layer in pavement structure (visual diagram — future)
- When NOT to use
- Typical mistakes
- Alternatives

### Cluster E — Commerce (VEDMAN-specific)

- Delivery geography (Rīga, Ogre, visa Latvija)
- Order unit: **tonnes**
- Quote CTA — never list price unless owner approves
- VEDMAN recommendation (human-reviewed block)
- Related materials

### Cluster F — Discovery

- FAQ per material
- SEO title/description/H1
- Schema.org `Product` + `FAQPage` + optional `HowTo` (calculator)
- Image alt text strategy
- AI knowledge tags

---

## Digital passport — 30 required sections

Every material passport (`material.md`) implements these blocks. Empty = `[TBD]`, not omitted.

| # | Section | Content type | Verification |
|---|---------|--------------|--------------|
| 1 | Hero image | Real photo | VEDMAN capture |
| 2 | Close-up image | Texture/grain | VEDMAN capture |
| 3 | Pile image | Volume context | VEDMAN capture |
| 4 | Truck image | Delivery proof | VEDMAN capture |
| 5 | Installed example | Application context | VEDMAN project |
| 6 | Video placeholder | Optional embed | `[TBD: URL]` |
| 7 | Material description | Original prose | Owner review |
| 8 | Applications | Bullet list | Engineer review |
| 9 | When NOT to use | Honest limits | Owner review |
| 10 | Advantages | Benefits | Brand voice |
| 11 | Possible alternatives | Link other passports | Internal links |
| 12 | Typical mistakes | Education | Sales input |
| 13 | FAQ | Link `faq.md` | Owner review |
| 14 | Coefficient (t/m³) | Bulk density range | **Lab/DoP only** |
| 15 | Density | Particle density | **Lab/DoP only** |
| 16 | Fraction | d/D mm | Catalog [WEBSITE] |
| 17 | Strength class | LA / marka | **Certificate only** |
| 18 | Frost resistance | Test result | **Certificate only** |
| 19 | Material type | Taxonomy | Controlled vocab |
| 20 | Colour | Visual descriptor | Photo-backed |
| 21 | Texture | Visual descriptor | Photo-backed |
| 22 | Producer / Quarry | Source | `[TBD]` |
| 23 | Delivery information | VEDMAN policy | [company-identity.md] |
| 24 | Calculator | m³ helper + disclaimer | Link shared tool |
| 25 | VEDMAN recommendation | Human-authored | Owner sign-off |
| 26 | Related materials | Internal links | Curated |
| 27 | SEO section | Meta, H1, copy | Marketing review |
| 28 | Schema.org | JSON-LD template | Technical spec |
| 29 | Image SEO | Filenames, alt, captions | Per image |
| 30 | Future AI knowledge tags | Structured tags | See taxonomy below |

---

## Image requirements

### Per-material image set (minimum)

| ID | File (webp) | Subject | Purpose |
|----|-------------|---------|---------|
| IMG-H | `hero.webp` | Material + context | Page identity, OG image |
| IMG-C | `closeup.webp` | Grain surface | Texture, colour trust |
| IMG-P | `pile.webp` | Stockpile on site | Volume, quality |
| IMG-B | `bucket.webp` | Loader bucket / grab | Scale reference |
| IMG-T | `truck.webp` | VEDMAN truck unloading | Delivery proof |
| IMG-I | `installed.webp` | In-situ layer or use | Application |
| IMG-F | `finished.webp` | Completed project | Outcome trust |
| IMG-D | `drone.webp` | Optional aerial | Large projects |
| VID | `video/` or embed | Unload / spread | Optional |

### Future

| ID | Format | Status |
|----|--------|--------|
| IMG-360 | 360° viewer | Future milestone |
| PDF | Technical sheet | Future export from passport |

### Technical specs (production)

| Rule | Value |
|------|-------|
| Format | WEBP primary; PNG fallback `[TBD]` |
| Max width | 1600px (align panel upload pipeline) |
| Quality | 80% |
| No stock | Real VEDMAN only — handbook §16 |
| No heavy filters | Natural colour |
| Filename | `{slug}-{type}.webp` e.g. `0-32-dolomite-hero.webp` |

### Image SEO (per image)

```yaml
alt: "[Materiāls] [frakcija] — [scene], VEDMAN piegāde"
title: "[TBD: Latvian caption]"
caption: "[Optional visible caption on page]"
```

---

## Folder architecture

```
knowledge/materials/
├── README.md                    # Material library index & governance
├── MATERIAL_INDEX.md            # All slugs, status, verification
├── _schema/
│   ├── material-passport-template.md
│   ├── faq-template.md
│   ├── image-manifest.yaml      # [TBD: machine-readable future]
│   └── taxonomy.yaml            # Material types, tags, standards refs
├── _shared/
│   ├── delivery-block.md        # Reusable delivery snippet
│   ├── calculator-disclaimer.md
│   └── schema-snippets/         # JSON-LD partials
└── {material-slug}/             # One folder per passport
    ├── material.md              # Full passport (30 sections)
    ├── faq.md                   # Material-specific FAQ
    ├── images/
    │   ├── hero.webp
    │   ├── closeup.webp
    │   ├── pile.webp
    │   ├── bucket.webp
    │   ├── truck.webp
    │   ├── installed.webp
    │   ├── finished.webp
    │   └── drone.webp             # optional
    ├── video/                     # optional
    │   └── README.md              # embed URL [TBD]
    └── meta/
        ├── seo.json               # [TBD: structured export]
        └── ai-tags.json           # [TBD: structured export]
```

### Slug naming convention

```
{fraction-or-type}-{material-family}[-variant]

Examples:
0-32-dolomite
0-45-dolomite
8-32-dolomite-sorted
washed-sand-0-4
topsoil-sieved
gravel-scalped-0-4
```

Rules: lowercase, hyphens, no Latvian diacritics in slug, display name in LV inside `material.md`.

---

## Material inventory (from VEDMAN catalog)

**Source:** `js/catalog-data.js` [WEBSITE] — each row becomes a passport **candidate**. Priority order `[TBD: owner]` suggested below.

### Priority P0 — Homepage featured fractions

| Slug | Display name | Status |
|------|--------------|--------|
| `0-16-dolomite` | Dolomīta šķembas 0-16 | `[TBD: folder]` |
| `0-32-dolomite` | Dolomīta šķembas 0-32 | Example scaffold |
| `0-45-dolomite` | Dolomīta šķembas 0-45 | `[TBD]` |
| `0-56-dolomite` | Dolomīta šķembas 0-56 | `[TBD]` |
| `0-63-dolomite` | Dolomīta šķembas 0-63 | `[TBD]` |
| `sand-washed-0-2` | Smilts mazgāta 0-2 | `[TBD]` |
| `sand-washed-0-4` | Smilts mazgāta 0-4 | `[TBD]` |
| `sand-unwashed` | Smilts nemazgāta | `[TBD]` |
| `gravel-scalped-0-4` | Grants skalota 0-4 | `[TBD]` |
| `gravel-unscalped-0-4` | Grants neskalota 0-4 | `[TBD]` |
| `gravel-natural` | Grants dabīgā | `[TBD]` |
| `topsoil-sieved` | Melnzeme sijāta | `[TBD]` |
| `topsoil-unsieved` | Melnzeme nesijāta | `[TBD]` |
| `asphalt-milled` | Asfalts frēzēts | `[TBD]` |
| `asphalt-hot` | Asfalts karstais | `[TBD]` |

### Priority P1 — Extended catalog

Dolomīta šķirotas (8-32, 5-40, 16-40, 40-70), mazgātas dolomīta frakcijas, granīta šķembas, drupināti būvgruži, oļi, smilts pieberamā, kūtsmēsli, komposts — full list in [knowledge/materials/MATERIAL_INDEX.md](knowledge/materials/MATERIAL_INDEX.md).

---

## Passport content template (section detail)

See [knowledge/materials/_schema/material-passport-template.md](knowledge/materials/_schema/material-passport-template.md).

### Technical fields — verification gate

| Field | May publish when |
|-------|------------------|
| Fraction | In VEDMAN catalog [WEBSITE] |
| t/m³ coefficient | Owner + lab/DoP document on file |
| Particle density | Same |
| LA / strength class | Certificate names exact lot |
| Frost resistance | Test report |
| Producer/quarry | Supply contract or owner confirmation |
| "Complies with LVS EN X" | Only if documented for **that supply** |

### Educational fields — may draft with `[TBD]` and expert review

Applications, when NOT to use, mistakes, alternatives — generic industry education **without claiming VEDMAN-specific test values**.

Example safe language:

> *"Frakcija 0-32 bieži izmantota ceļa un laukumu pamatos Latvijā. Konkrētajam objektam VEDMAN ieteiks slāni un tonnas pēc adreses."*

---

## Standards reference library (for authors, not customer legal claims)

Authors may reference these **topics** when writing applications — do not claim compliance without DoP.

| Standard | Typical use |
|----------|-------------|
| **LVS EN 12620** (+A1) | Minerālmateriāli betonam |
| **LVS EN 13242** | Minerālmateriāli granulētajiem materiāliem (ceļi, pamati) |
| **LVS EN 13043** | Minerālmateriāli segumam |
| **LVS EN 13450** | Dzelzceļa balasts |
| **LVS EN 1097-x** | Test methods (density, LA, etc.) |
| **LVS EN 933-x** | Sieve / particle shape tests |

VEDMAN Material Center **explains** standards in plain Latvian — links to LVS.lv for authority, never copies standard text.

---

## Calculator integration

Per-material calculator block (section 24):

- Input: length, width, thickness OR area + depth
- Output: **approximate m³** + disclaimer
- Optional: **approximate t** only when `coefficient_t_m3` verified in passport
- CTA: *"Precīzu tonnu skaitu un cenu apstiprina VEDMAN"*
- Shared disclaimer: [knowledge/materials/_shared/calculator-disclaimer.md](knowledge/materials/_shared/calculator-disclaimer.md)

Never auto-quote price from calculator.

---

## SEO & Schema strategy

### Per-material page (future URL pattern)

`https://vedman.lv/materiali/{slug}/` `[TBD: routing]`

### SEO section (27) contents

| Element | Rule |
|---------|------|
| Title | `{Materiāls} {frakcija} piegāde Rīgā \| VEDMAN` |
| Meta description | Unique 150-160 chars, geography, tonnes |
| H1 | Human-readable LV name |
| Canonical | Self |
| Internal links | Related materials, PROJECT advisor |
| No duplicate | ≠ SS.lv listing text |

### Schema.org (28) recommendations

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "[TBD: display name]",
      "description": "[TBD: short]",
      "brand": { "@type": "Brand", "name": "VEDMAN" },
      "category": "[TBD: taxonomy]",
      "image": ["[TBD: hero URL]"],
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/PreOrder",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "EUR",
          "description": "Cena pēc pieprasījuma"
        },
        "seller": { "@type": "Organization", "name": "AMAPU SIA" }
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": []
    }
  ]
}
```

**Note:** Do not publish `price` numeric value unless owner approves live pricing.

### Image SEO (29)

- Descriptive filenames (not `IMG_2847.webp`)
- Unique alt per image type
- `loading="lazy"` except hero
- Width/height attributes to reduce CLS `[implementation future]`

---

## AI knowledge tags (30)

Structured tags in `meta/ai-tags.json` `[TBD format]`:

```yaml
material_family: dolomite | granite | sand | gravel | topsoil | asphalt | other
fraction_mm: "0-32"
applications: [road_base, driveway, drainage, concrete_fill]
project_types: [P1, P2, P4]  # links PROJECT_ADVISOR
delivery_unit: tonne
coefficient_t_m3_verified: false
certification: [TBD]
related_slugs: [0-45-dolomite, sand-washed-0-4]
faq_intents: [quantity, delivery, fraction_choice, price_request]
escalate_if: [price_binding, certification_claim, structural_engineering]
```

Feeds `knowledge/ai-operating-rules.md` and future RAG.

---

## Omnichannel reuse — one database, many surfaces

```
knowledge/materials/{slug}/
        │
        ├──► Website material page (future)
        ├──► PDF one-pager export (future)
        ├──► WhatsApp rich message snippets (fraction + use + CTA)
        ├──► Email quote templates
        ├──► AI RAG / advisor context
        ├──► Facebook/Instagram post copy (unique short form)
        ├──► Google Business product posts `[TBD]`
        └──► SS.lv listing module (unique text + phone)
```

### Channel adaptation rules

| Channel | From passport use |
|---------|-------------------|
| **Website** | Full 30 sections |
| **PDF** | Technical table + images + QR to page |
| **WhatsApp** | Short: name, fraction, use hint, quote link |
| **Email** | Formal: description + `[TBD]` specs table |
| **AI** | Tags + FAQ + verified fields only |
| **Facebook/IG** | IMG-F or IMG-T + 2 sentences + CTA |
| **Google Business** | Hero + services link |
| **SS.lv** | Unique intro paragraph + phone — not web copy |

Single source edit → regenerate channel snippets `[TBD: tooling]`.

---

## Content production workflow

```
1. Owner prioritizes slug (MATERIAL_INDEX)
2. Capture image set (IMG-H through IMG-F) on real delivery
3. Draft material.md — applications/mistakes (expert review)
4. Owner supplies verified technical rows OR mark [TBD]
5. Write faq.md from real customer questions
6. SEO + schema review
7. Verification status → Partial → Verified
8. Publish to web `[TBD pipeline]`
9. Log in knowledge/maintenance-log.md
```

### Roles

| Role | Responsibility |
|------|----------------|
| Owner | Technical verification, VEDMAN recommendation, go-live |
| Field team | Photography at delivery |
| Sales | FAQ, mistakes, objections |
| Engineer advisor `[TBD]` | Applications, when NOT to use |
| Marketing | SEO, channel snippets |
| AI maintainer | Tags, RAG sync |

---

## Phased rollout

| Phase | Deliverable |
|-------|-------------|
| **MC-0** | Master plan + folder schema + 1 example passport (this plan) |
| **MC-1** | P0 passports (15 homepage fractions) — images + draft prose |
| **MC-2** | Technical verification batch 1 (top 5 sellers) |
| **MC-3** | Public material pages on website `[TBD URL]` |
| **MC-4** | Schema + sitemap expansion |
| **MC-5** | PDF export + SS.lv sync templates |
| **MC-6** | AI RAG + PROJECT advisor integration |
| **MC-7** | P1 extended catalog |
| **MC-8** | 360° / video standard |

---

## Quality bar — "best in Latvia"

| Dimension | Target |
|-----------|--------|
| **Honesty** | When NOT to use — rare in competitor catalogs |
| **Photography** | Real pile, truck, installed — not one generic image |
| **Education** | Mistakes + alternatives |
| **Standards literacy** | Plain-LV explanation of LVS topics |
| **Tonnes-first** | Delivery reality |
| **No dark patterns** | No fake price, no fake certification |
| **SEO depth** | One URL per fraction, not one page for all šķembas |
| **AI-ready** | Structured tags from day one |

---

## Governance

- Never invent technical data — `[TBD]` until verified
- Never copy competitor or quarry marketing text
- VEDMAN recommendation (section 25) requires owner sign-off
- Price in schema/offers only when owner enables live pricing
- Align brand voice: [knowledge/brand-voice-and-positioning.md](knowledge/brand-voice-and-positioning.md)

---

## Immediate next steps

1. Owner approves master plan and P0 slug list
2. Create `0-32-dolomite` passport — first full example shoot
3. Fill `[TBD]` technical rows from VEDMAN supplier documents `[TBD]`
4. Link Material Center from PROJECT advisor project types
5. Plan website URL structure `[TBD]` without implementing code yet

---

*Planning document. Not committed. Not deployed.*

*Technical values for VEDMAN-delivered lots: verified documents only.*
