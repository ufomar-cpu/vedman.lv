# Phase C security review — RBAC Firestore + Storage rules

**Reviewer:** implementation self-review (pre-commit)  
**Date:** 2026-07-03  
**Scope:** `FIREBASE_RULES.txt`, `FIREBASE_USERS_BOOTSTRAP.md` §9, `FIREBASE_RULES_SECURE_NEXT.txt`  
**Out of scope:** UI changes, Firebase Console deploy, commit/push  

---

## Phase A–B gate

| Prerequisite | Status |
|--------------|--------|
| Firebase Auth works | **Passed** (operator confirmed) |
| Owner login (Mac + iPhone) | **Passed** |
| Upload works | **Passed** |
| No production issues | **Passed** |
| `users/{ownerUid}` bootstrapped | **Assumed** (required for owner login) |

Phase C rules are safe to **prepare in repo**. Console deploy should follow bootstrap §9 smoke tests.

---

## Summary

Phase C replaces open write access with RBAC enforced in Firestore and Storage rules. Public `gallery` read and Storage read remain open so `index.html` gallery, image/video URLs, WhatsApp links, and SEO are unaffected.

**Verdict:** No **Critical** or **High** issues in the rules design. **Recommended to deploy** after staged commit is approved and Console smoke tests pass.

---

## Critical

*None.*

---

## High

*None.*

---

## Rules semantics (implemented)

### Firestore

| Operation | Anonymous | owner | admin | editor |
|-----------|:---------:|:-----:|:-----:|:------:|
| Read `gallery` | ✓ | ✓ | ✓ | ✓ |
| Create `gallery` | ✗ | ✓* | ✓* | ✓* |
| Update `gallery` | ✗ | ✓* | ✓* | ✓* |
| Delete `gallery` | ✗ | ✓* | ✓* | ✗ |
| Read own `users/{uid}` | ✗ | ✓ | ✓ | ✓ |
| Read other `users` | ✗ | ✓ | ✓ | ✗ |
| Write `users` | ✗ | ✓† | ✓† | ✗ |

\* Requires `isActive == true` and valid role via `users/{uid}` lookup.  
† Owner/admin only; admin cannot create/promote `owner` or modify existing owner doc.

### Storage

| Operation | Anonymous | owner | admin | editor |
|-----------|:---------:|:-----:|:-----:|:------:|
| Read (all paths) | ✓ | ✓ | ✓ | ✓ |
| Create / update | ✗ | ✓* | ✓* | ✓* |
| Delete | ✗ | ✓* | ✓* | ✗ |

\* Firestore cross-read `users/{request.auth.uid}`; `isActive == true`; role in allowed set.

**Note on task wording:** Requirement “Upload/Delete for owner/admin/editor” is implemented as **upload for all three roles; delete for owner and admin only**, matching Phase B panel UI and `SECURITY_IMPLEMENTATION_PLAN.md` §8.3. Editors are server-denied on delete (Firestore + Storage).

---

## Privilege escalation review

| Attack / vector | Mitigation | Result |
|-----------------|------------|--------|
| Anonymous write to `gallery` or Storage | Writes require Auth + active `users` doc | **Blocked** |
| Editor deletes gallery or Storage object | `canDeleteGallery()` / `canDelete()` exclude editor | **Blocked** |
| Editor self-promote to owner via `users` write | `users` write requires `isOwnerOrAdmin()` | **Blocked** |
| Admin creates new `owner` user doc | `create` requires `isOwner()` when `role == 'owner'` | **Blocked** |
| Admin modifies existing owner doc | `update` requires `isOwner()` when `resource.data.role == 'owner'` | **Blocked** |
| Admin deletes owner user doc | `delete` on `users` is owner-only | **Blocked** |
| Auth user without `users/{uid}` doc | `userExists()` false → no upload/delete | **Blocked** |
| Inactive user (`isActive: false`) | `isActiveUser()` false | **Blocked** |
| Invalid role string in `users` doc | Not in `owner/admin/editor` → helper functions false | **Blocked** |
| Spoof `role` in gallery document only | Rules read role from `users/{uid}`, not client payload | **Blocked** |
| Public read blocked (break site) | `allow read: if true` on gallery + Storage | **Preserved** |

### Fix applied vs plan draft

The `users` **update** rule in `SECURITY_IMPLEMENTATION_PLAN.md` §8.2 had ambiguous operator precedence:

```javascript
// Ambiguous — could allow unintended updates
&& resource.data.role != 'owner' || isOwner()
```

Implemented rule uses explicit grouping:

```javascript
&& (isOwner() || resource.data.role != 'owner')
```

---

## Lockout risk review

| Risk | Severity | Mitigation |
|------|----------|------------|
| Deploy Phase C before `users/{ownerUid}` exists | **Would block owner** | Phase A–B passed; bootstrap §4 complete before §9 deploy |
| Owner doc deleted or `isActive: false` | **Owner locked out of writes** | Recover via Firebase Console (Admin SDK / manual doc restore); rules do not block Console |
| Only owner can delete `users` docs | Low | Intentional; keep ≥1 owner doc |
| Storage rules hardcode `(default)` database | Low | Correct for `vedman-lv`; non-default DB would need path update |
| Rules deployed but Auth session stale | Low | Re-login; panel re-reads `users/{uid}` |
| `get()` / `firestore.get()` evaluation failures | Low | Fail closed (deny write) |

**Bootstrap requirement unchanged:** first `users/{owner-uid}` must exist **before** Phase C publish. Operator confirmed owner login works → bootstrap satisfied.

---

## Public site impact

| Feature | Firebase usage | Phase C impact |
|---------|----------------|----------------|
| Gallery on `index.html` | Firestore `getDocs(gallery)` | **None** — read stays public |
| Gallery images/videos | Storage download URLs | **None** — read stays public |
| `gallery.json` fallback | HTTP fetch | **None** — not Firebase |
| WhatsApp CTAs / modal | External `wa.me` links | **None** |
| SEO / meta / static assets | No Firebase | **None** |
| Admin panel | Auth + read/write/delete | **Hardened** — writes require RBAC |

No UI files modified.

---

## Panel compatibility (no code changes)

| Panel action | Role | Firestore rule | Storage rule | UI |
|--------------|------|----------------|--------------|-----|
| Upload | owner/admin/editor | `create` ✓ | `create` ✓ | unchanged |
| Delete | owner/admin | `delete` ✓ | `delete` ✓ | unchanged |
| Delete | editor | `delete` ✗ | `delete` ✗ | button hidden (Phase B) |
| Login role gate | all | read own `users/{uid}` ✓ | — | unchanged |
| List gallery | all authorized | `read` ✓ (public) | — | unchanged |

`addDoc` fields include `category`, `url`, `createdAt` → passes `hasAll` validation.

---

## Medium

### M1 — Deploy ordering dependency

Publishing Phase C **Firestore** rules before **Storage** (or vice versa) creates a brief window where one service is RBAC-hardened and the other open. Deploy both in quick succession; smoke-test immediately.

### M2 — `users` management still Console-only

Phase C allows owner/admin to write `users` via client SDK in theory, but no in-panel UI exists. Operational changes remain Console-driven until a future admin UI.

### M3 — Gallery `update` rule is broad

Any active uploader can update any gallery document field. Panel only uses create/delete today. Tightening field-level validation is optional follow-up.

### M4 — Storage `update` allows overwrite by any uploader

Same as M3 for Storage objects. Acceptable for current panel (upload new paths with timestamp suffix).

---

## Low

### L1 — Firestore rule evaluations on every Storage write

Each Storage create/delete calls `firestore.get()` — normal for cross-service rules; watch quota under heavy upload load.

### L2 — `FIREBASE_RULES_SECURE_NEXT.txt` is now a pointer

Canonical rules live in `FIREBASE_RULES.txt` only. Avoid deploying stale auth-only snippet.

### L3 — Rollback requires Console action

Git rollback of rules files does not change production until republished. Keep pre–Phase C rules snapshot (git history / tag).

---

## Pre-deploy checklist (Console)

- [ ] Confirm `users/{ownerUid}` with `role: owner`, `isActive: true`
- [ ] Copy Firestore rules from `FIREBASE_RULES.txt` → publish
- [ ] Copy Storage rules from `FIREBASE_RULES.txt` → publish
- [ ] Owner: login, upload, delete
- [ ] Editor (if used): login, upload, confirm delete denied in UI **and** via rules
- [ ] Public `index.html`: gallery loads logged out
- [ ] WhatsApp link opens (sanity)

---

## Staged files (this change set)

| File | Change |
|------|--------|
| `FIREBASE_RULES.txt` | Phase C RBAC Firestore + Storage |
| `FIREBASE_RULES_SECURE_NEXT.txt` | Superseded pointer + summary |
| `FIREBASE_USERS_BOOTSTRAP.md` | §9 Phase C deploy steps |
| `PHASE_C_SECURITY_REVIEW.md` | This document |

**Not modified:** `index.html`, `vedman-panel.html`, `README.md`, or any UI.

---

## Verdict

**Recommended to deploy** (after commit approval and Console publish).

No Critical or High issues remain in the rules implementation. Proceed with staged commit review, then Firebase Console deploy per `FIREBASE_USERS_BOOTSTRAP.md` §9.

*Awaiting approval — not committed, not pushed.*
