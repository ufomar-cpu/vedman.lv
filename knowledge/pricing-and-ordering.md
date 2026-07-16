# Pricing & Ordering

| Field | Value |
|-------|-------|
| **Purpose** | Define how VEDMAN prices, bills, accepts payment, and processes orders |
| **Scope** | Policies and process — not specific price numbers |
| **Last Updated** | 2026-07-16 |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Verification Status** | Partial — payment methods and process from website [WEBSITE] |
| **Cross References** | [materials-catalog.md](materials-catalog.md) · [quantities-and-densities.md](quantities-and-densities.md) · [sales-scripts.md](sales-scripts.md) · [ai-operating-rules.md](ai-operating-rules.md) |

---

## Pricing model [POLICY]

| Rule | Detail |
|------|--------|
| Published prices on website | **None** — quotes on request [WEBSITE] |
| Primary billing unit (aggregates) | **Tonnes** [POLICY] |
| m³ quotes | Approximate helper only — final in tonnes [POLICY] |
| Price includes delivery | `[TBD: vai cena ir ar piegādi vai atsevišķi]` |
| Minimum order | `[TBD: minimālās tonnas / minimālā summa]` |
| Urgent / weekend surcharge | `[TBD]` |
| Invoice / PVN | Ar PVN / Bez PVN available [WEBSITE] |

## Payment methods [WEBSITE]

- Skaidra nauda
- Bankas pārskaitījums
- Ar PVN / Bez PVN

`[TBD: priekšapmaksa / pēcapmaksa / komercklientu nosacījumi]`

## Ordering process [WEBSITE]

1. **Izvēlies** — materiālu vai pakalpojumu
2. **Nosūti** — pieprasījums sagatavojas WhatsApp
3. **Saņem cenu** — precizējam piegādi un darbu

**Channels:** Phone, WhatsApp (quote modal → structured message), `[TBD: e-pasts lieliem pasūtījumiem]`

## Quote message structure [WEBSITE]

Typical WhatsApp pieprasījums satur:

- Materiāls / pakalpojums + frakcija
- Daudzums + mērvienība (m³ vai t)
- Objekta adrese
- Papildus (add-ons) — see [services-and-equipment.md](services-and-equipment.md)
- Vārds, telefons, komentārs

**AI rule:** May help customer prepare this — must not invent prices in the message.
