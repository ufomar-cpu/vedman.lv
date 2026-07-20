# VEDMAN OS — Data Model Plan

| Field | Value |
|-------|-------|
| **Document type** | Entity design specification (not implemented) |
| **Date** | 2026-07-16 |
| **Status** | Planning |
| **Owner** | `[TBD: VEDMAN business owner]` |
| **Cross References** | [VEDMAN_OS_MASTER_PLAN.md](VEDMAN_OS_MASTER_PLAN.md) · [MATERIAL_CENTER_MASTER_PLAN.md](MATERIAL_CENTER_MASTER_PLAN.md) · [knowledge/materials/_schema/](knowledge/materials/_schema/) · [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) |

---

## Design principles

| Principle | Application |
|-----------|-------------|
| **Author once** | Git `knowledge/materials/` is human authoring; Firestore is published runtime |
| **Verification gates** | Public fields require `verificationStatus` ≥ threshold |
| **Source metadata** | Every technical value links to `technical_sources` |
| **Public / private split** | Customer sees public projection only |
| **No invented defaults** | Missing = null / omitted — never placeholder numbers in runtime |
| **Slug stability** | `materialSlug` immutable after publish |

Passport **30 sections** defined in [MATERIAL_CENTER_MASTER_PLAN.md](MATERIAL_CENTER_MASTER_PLAN.md) — mapped to entities below, not repeated.

---

## Entity relationship overview

```
materials ─────┬──── material_passports (1:1 published view)
               ├──── material_images (1:N)
               ├──── material_faqs (1:N)
               ├──── technical_sources (1:N)
               └──── coefficients (1:N, versioned)

quarries ──────┬──── materials (N:M via quarry_materials)
               └──── supplier_notes (1:N, private)

projects ──────┴──── materials (N:M suggested links)

customer_requests ─── customers (N:1 optional)
                    ├── quotes (1:N)
                    ├── deliveries (1:N)
                    └── assistant_sessions (N:1 optional)

communication_consent ─── customers (1:1 or 1:N history)

audit_logs ─── (references any entity)
```

---

## 1. materials

| Attribute | Value |
|-----------|-------|
| **Purpose** | Master record for each catalog material variant (slug) |
| **Public / private** | Public metadata; links to private supplier data |
| **Collection** | `materials/{slug}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | e.g. `0-32-dolomite` |
| `displayNameLv` | string | Customer-facing |
| `materialFamily` | enum | From [taxonomy.md](knowledge/materials/_schema/taxonomy.md) |
| `fractionMm` | string | e.g. `0-32` |
| `verificationStatus` | enum | `empty` \| `draft` \| `partial` \| `verified` \| `live` |
| `catalogCategory` | string | From `catalog-data.js` parent key |
| `updatedAt` | timestamp | |
| `publishedAt` | timestamp? | When last pushed to runtime |

### Optional fields

| Field | Type | Notes |
|-------|------|-------|
| `displayNameEn` | string | |
| `relatedSlugs` | string[] | |
| `applicationTags` | string[] | Controlled vocab |
| `passportUrl` | string | Canonical public URL |
| `seoPrimaryKeyword` | string | |
| `sortPriority` | number | P0/P1 ordering |

### Verification

| Field | Rule |
|-------|------|
| `live` status | Owner approval + all mandatory public fields verified |
| Fraction | May be `partial` from catalog [WEBSITE] |

### Source metadata

| Field | Type |
|-------|------|
| `authoringPath` | string — Git path |
| `authoringCommit` | string — publish trace |

### Relationships

- 1:1 `material_passports`
- 1:N `material_images`, `coefficients`, `material_faqs`
- N:M `quarries` via junction

### Retention

Indefinite while in catalog. Archive flag instead of delete.

---

## 2. material_passports

| Attribute | Value |
|-----------|-------|
| **Purpose** | Published customer-facing content bundle (30-section projection) |
| **Public / private** | **Public** (verified fields only) |
| **Collection** | `material_passports/{slug}` or embedded in `materials/{slug}` |

**Design choice `[TBD]`:** Separate collection vs embedded document. Recommendation: **embedded `public` map** on `materials/{slug}` for single read; Git remains full authoring.

### Required fields (public projection)

| Field | Section # | Verified required for `live` |
|-------|-----------|------------------------------|
| `description` | 7 | Yes |
| `applications` | 8 | Yes |
| `whenNotToUse` | 9 | Yes |
| `advantages` | 10 | Partial OK |
| `alternatives` | 11 | Links only |
| `typicalMistakes` | 12 | Partial OK |
| `vedmanRecommendation` | 25 | Yes — owner-authored |
| `deliverySnippet` | 23 | From shared block |
| `materialType` | 19 | Yes |
| `colour` | 20 | Photo-backed |
| `texture` | 21 | Photo-backed |
| `producerQuarryDisplay` | 22 | `[TBD]` until verified |

### Optional / conditional fields

| Field | Section | Gate |
|-------|---------|------|
| `coefficientBulkTM3` | 14 | `coefficients` entity verified |
| `densityParticle` | 15 | Lab/DoP |
| `strengthClass` | 17 | Certificate |
| `frostResistance` | 18 | Certificate |
| `calculatorEnabled` | 24 | Only if coefficient verified |
| `schemaOrgJson` | 28 | Generated at publish |
| `aiTags` | 30 | Structured object |

### Verification status

Per-field: `{ value, verified: bool, sourceId?, verifiedAt?, verifiedBy? }`

Unverified fields **omitted** from public API — not `[TBD]` strings to customers.

### Relationships

- Parent: `materials/{slug}`
- References: `technical_sources`, `material_images`

### Retention

Version history `[TBD: subcollection passport_versions]` for rollback.

---

## 3. material_images

| Attribute | Value |
|-----------|-------|
| **Purpose** | Image assets per material with SEO metadata |
| **Public / private** | **Public** URLs; Storage paths gated by rules |
| **Collection** | `materials/{slug}/images/{imageId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `imageId` | string | e.g. `hero`, `closeup`, `pile`, `truck`, `installed` |
| `storagePath` | string | Firebase Storage |
| `publicUrl` | string | CDN URL |
| `role` | enum | `hero` \| `closeup` \| `pile` \| `bucket` \| `truck` \| `installed` \| `finished` \| `drone` \| `video` |
| `verificationStatus` | enum | Real VEDMAN photo confirmed |
| `altTextLv` | string | |
| `updatedAt` | timestamp | |

### Optional fields

| Field | Type |
|-------|------|
| `captionLv` | string |
| `width`, `height` | number |
| `ogDefault` | boolean — use for WhatsApp preview |
| `galleryProjectId` | string — link to gallery item `[TBD]` |

### Verification

Owner confirms real VEDMAN capture per [VEDMAN_DEVELOPMENT_HANDBOOK.md](VEDMAN_DEVELOPMENT_HANDBOOK.md) §16.

### Retention

Keep superseded versions `[TBD: 90 days]` then delete Storage object.

---

## 4. technical_sources

| Attribute | Value |
|-----------|-------|
| **Purpose** | Traceability for any technical claim |
| **Public / private** | **Private** metadata; customer sees type label only |
| **Collection** | `technical_sources/{sourceId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `sourceId` | string | |
| `sourceType` | enum | `manufacturer` \| `standard` \| `lab_report` \| `dop` \| `vedman_practice` |
| `title` | string | Internal description |
| `documentRef` | string | File path or URL (private Storage) |
| `applicableSlugs` | string[] | |
| `createdAt` | timestamp | |
| `verifiedBy` | string | Owner uid |

### Optional fields

| Field | Type |
|-------|------|
| `expiryDate` | date |
| `notes` | string (private) |

### Relationships

Linked from `coefficients`, passport technical fields.

### Retention

Life of material + `[TBD: legal hold years]`

---

## 5. coefficients

| Attribute | Value |
|-----------|-------|
| **Purpose** | Bulk density (t/m³) and related conversion data — versioned |
| **Public / private** | Public **only when verified** |
| **Collection** | `materials/{slug}/coefficients/{versionId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `valueMin` | number? | Range if applicable |
| `valueMax` | number? | |
| `valueTypical` | number? | Single value if fixed |
| `unit` | string | `t/m³` |
| `sourceId` | string | FK → technical_sources |
| `verificationStatus` | enum | Must be `verified` to expose |
| `disclaimerRef` | string | Link to calculator disclaimer |
| `effectiveFrom` | timestamp | |

### Optional fields

| Field | Type |
|-------|------|
| `conditions` | string — moisture, compaction |
| `supersedes` | versionId |

### Relationships

- Used by calculator and assistant (L1) only when verified.

### Retention

All versions kept for audit.

---

## 6. material_faqs

| Attribute | Value |
|-----------|-------|
| **Purpose** | Per-material Q&A for web, schema, assistant |
| **Public / private** | Public when verified |
| **Collection** | `materials/{slug}/faqs/{faqId}` |

### Required fields

| Field | Type |
|-------|------|
| `questionLv` | string |
| `answerLv` | string |
| `sortOrder` | number |
| `verificationStatus` | enum |

### Optional fields

| Field | Type |
|-------|------|
| `schemaEnabled` | boolean |

### Relationships

Mirrors Git `faq.md` at publish.

### Retention

Indefinite; deprecate with `active: false`.

---

## 7. projects (use cases)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Project types for Project Advisor routing (P1–P10) |
| **Public / private** | Public |
| **Collection** | `projects/{projectId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `projectId` | string | e.g. `P1` |
| `nameLv` | string | |
| `descriptionLv` | string | Direction only |
| `suggestedMaterialFamilies` | string[] | Not binding |
| `verificationStatus` | enum | |

### Optional fields

| Field | Type |
|-------|------|
| `suggestedSlugs` | string[] — soft links |
| `advisorQuestions` | string[] |

### Relationships

Links to materials via suggestions only.

Source: [PROJECT_ADVISOR.md](PROJECT_ADVISOR.md) — do not duplicate full project list in runtime until Phase 6.

### Retention

Indefinite.

---

## 8. customer_requests

| Attribute | Value |
|-----------|-------|
| **Purpose** | Structured price / delivery request |
| **Public / private** | **Private** — owner and authorized roles |
| **Collection** | `customer_requests/{requestId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `requestId` | string | UUID |
| `materialSlug` | string | |
| `quantity` | number | |
| `unit` | string | `t` \| `m³` |
| `address` | string | |
| `intendedUse` | string | |
| `customerName` | string | |
| `customerPhone` | string | E.164 |
| `consentContact` | boolean | Must be true |
| `status` | enum | `new` \| `contacted` \| `quoted` \| `won` \| `lost` \| `duplicate` \| `spam` |
| `sourceChannel` | enum | |
| `createdAt` | timestamp | |

### Optional fields

| Field | Type |
|-------|------|
| `preferredDeliveryTime` | string |
| `comment` | string |
| `addOns` | string[] |
| `customerId` | string |
| `sessionId` | string |
| `escalationReason` | string |
| `passportUrlSent` | string |
| `confirmationSentAt` | timestamp |
| `ownerNotifiedAt` | timestamp |
| `duplicateOf` | requestId |
| `idempotencyKey` | string — dedup |

### Verification

N/A — transactional data.

### Source metadata

| Field | Type |
|-------|------|
| `userAgent` | string |
| `ipHash` | string — privacy-safe dedup/spam |

### Relationships

- Optional `customers/{customerId}`
- 1:N `quotes`, `deliveries`
- N:1 `assistant_sessions`

### Retention

`[TBD: 24 months]` then archive or anonymize per privacy policy.

---

## 9. customers

| Attribute | Value |
|-----------|-------|
| **Purpose** | Repeat customer recognition (minimal CRM) |
| **Public / private** | **Private** |
| **Collection** | `customers/{customerId}` |

### Required fields

| Field | Type |
|-------|------|
| `customerId` | string |
| `phone` | string — primary key normalized |
| `createdAt` | timestamp |

### Optional fields

| Field | Type |
|-------|------|
| `name` | string |
| `lastRequestAt` | timestamp |
| `requestCount` | number |
| `tags` | string[] — `[TBD: b2b, repeat]` |

### Retention

Until erasure request or `[TBD: inactive months]`.

---

## 10. communication_consent

| Attribute | Value |
|-----------|-------|
| **Purpose** | GDPR-style consent for contact and marketing |
| **Public / private** | **Private** |
| **Collection** | `communication_consent/{consentId}` |

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `customerPhone` or `customerId` | string | |
| `consentType` | enum | `quote_processing` \| `marketing` |
| `granted` | boolean | |
| `grantedAt` | timestamp | |
| `channel` | string | Where captured |
| `textVersion` | string | Consent copy version |

### Optional fields

| Field | Type |
|-------|------|
| `revokedAt` | timestamp |

### Retention

Life of customer + legal minimum.

---

## 11. quotes

| Attribute | Value |
|-----------|-------|
| **Purpose** | Owner-created offer linked to request |
| **Public / private** | **Private** |
| **Collection** | `quotes/{quoteId}` |

### Required fields

| Field | Type |
|-------|------|
| `quoteId` | string |
| `requestId` | string |
| `createdBy` | uid |
| `createdAt` | timestamp |
| `status` | enum — `draft` \| `sent` \| `accepted` \| `expired` |

### Optional fields

| Field | Type |
|-------|------|
| `priceTotal` | number — **never AI-generated** |
| `currency` | string |
| `validUntil` | timestamp |
| `notes` | string |
| `sentVia` | enum — `whatsapp` \| `phone` \| `email` |

### Retention

`[TBD: 7 years]` if accounting requires — owner decision.

---

## 12. deliveries

| Attribute | Value |
|-----------|-------|
| **Purpose** | Post-quote delivery record (future) |
| **Public / private** | **Private** |
| **Collection** | `deliveries/{deliveryId}` |

### Required fields

| Field | Type |
|-------|------|
| `deliveryId` | string |
| `requestId` or `quoteId` | string |
| `scheduledDate` | date? |
| `status` | enum — `[TBD]` |

### Optional fields

| Field | Type |
|-------|------|
| `tonnesDelivered` | number |
| `truckId` | string `[TBD]` |
| `driverNotes` | string |

Phase 10+ scope. Schema reserved.

### Retention

`[TBD]`

---

## 13. quarries

| Attribute | Value |
|-----------|-------|
| **Purpose** | Source location metadata for materials |
| **Public / private** | Display name public; logistics private |
| **Collection** | `quarries/{quarryId}` |

### Required fields

| Field | Type |
|-------|------|
| `quarryId` | string |
| `displayNameLv` | string — customer-safe |

### Optional fields

| Field | Type | Visibility |
|-------|------|------------|
| `region` | string | Public |
| `coordinates` | geopoint | Private |
| `contactInternal` | string | Private |

### Relationships

N:M materials

### Retention

Indefinite.

---

## 14. supplier_notes (private)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Margins, supplier prices, stock, negotiation notes |
| **Public / private** | **Strictly private** — owner/admin only |
| **Collection** | `supplier_notes/{noteId}` |

### Required fields

| Field | Type |
|-------|------|
| `noteId` | string |
| `quarryId` or `materialSlug` | string |
| `body` | string |
| `createdBy` | uid |
| `createdAt` | timestamp |

**Never** exposed to assistant, website, or customer API.

### Retention

Indefinite internal.

---

## 15. assistant_sessions

| Attribute | Value |
|-----------|-------|
| **Purpose** | Trace assistant conversations for audit and escalation |
| **Public / private** | **Private** |
| **Collection** | `assistant_sessions/{sessionId}` |

### Required fields

| Field | Type |
|-------|------|
| `sessionId` | string |
| `channel` | enum |
| `startedAt` | timestamp |
| `decisionLevelMax` | enum — highest L used |

### Optional fields

| Field | Type |
|-------|------|
| `materialSlug` | string |
| `requestId` | string |
| `messageCount` | number |
| `escalationReasons` | string[] |
| `endedAt` | timestamp |

### Retention

`[TBD: 90 days]` full transcript; summary longer.

---

## 16. audit_logs

| Attribute | Value |
|-----------|-------|
| **Purpose** | Immutable event log for compliance and debugging |
| **Public / private** | **Private** — owner/admin |
| **Collection** | `audit_logs/{logId}` |

### Required fields

| Field | Type |
|-------|------|
| `logId` | string |
| `eventType` | string |
| `timestamp` | timestamp |
| `actorType` | enum — `system` \| `owner` \| `assistant` \| `customer` |
| `entityType` | string |
| `entityId` | string |

### Optional fields

| Field | Type |
|-------|------|
| `payload` | map — no PII in clear if avoidable |
| `uid` | string |

### Retention

`[TBD: 12 months minimum]`

---

## Firestore security summary (planned)

| Collection | Anonymous read | Customer write | Owner/admin |
|------------|----------------|----------------|-------------|
| `materials` (public fields) | Yes | No | Publish |
| `material_passports` | Yes | No | Publish |
| `material_images` | Yes (URLs) | No | Upload |
| `customer_requests` | No | Create only `[TBD: rules]` | Full |
| `supplier_notes` | No | No | Read/write |
| `audit_logs` | No | No | Read |
| `technical_sources` | No | No | Read |

Align with [docs/SECURITY_IMPLEMENTATION_PLAN.md](docs/SECURITY_IMPLEMENTATION_PLAN.md) before implementation.

---

## Git ↔ Firebase sync (planned)

| Step | Action |
|------|--------|
| 1 | Owner edits `knowledge/materials/{slug}/` |
| 2 | Verification status updated in Git |
| 3 | Publish command `[TBD: script]` validates schema |
| 4 | Writes to Firestore with `authoringCommit` |
| 5 | `audit_logs` event `material_published` |

---

*Design only. No Firestore collections created yet.*
