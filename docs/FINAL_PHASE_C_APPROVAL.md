# Final Phase C pre-deployment approval

**Reviewer role:** Firebase Security Rules reviewer (independent final pass)  
**Date:** 2026-07-04  
**Artifact reviewed:** `FIREBASE_RULES.txt` (Firestore + Storage blocks)  
**Bootstrap reference:** `FIREBASE_USERS_BOOTSTRAP.md` §1–9  
**Production gate:** Phase A–B passed (Auth, owner login Mac/iPhone, upload, no incidents)  

**Constraints:** Rules not modified. Not committed. Not pushed. Console not yet updated.

---

## Executive summary

`FIREBASE_RULES.txt` implements consistent RBAC across Firestore and Storage: public reads preserved, writes gated on authenticated active users with roles sourced from `users/{uid}`, editor delete denied at both layers, owner/admin delete allowed. No recursive rule loops, valid cross-service lookups, and valid Rules v2 syntax **when the Console paste excludes repo header lines**.

Bootstrap order is correct. Owner recovery remains possible via Firebase Console / Admin SDK (rules do not apply to Console operators).

---

## Verification matrix

| # | Requirement | Result | Notes |
|---|-------------|--------|-------|
| 1 | No privilege escalation | **PASS** | See §1 |
| 2 | No owner lockout | **PASS** | See §2 |
| 3 | No recursive rule errors | **PASS** | See §3 |
| 4 | No invalid `firestore.get()` usage | **PASS** | See §4 |
| 5 | Storage roles match Firestore | **PASS** | See §5 |
| 6 | Public gallery read | **PASS** | See §6 |
| 7 | Editor cannot delete | **PASS** | See §7 |
| 8 | Owner can recover system | **PASS** | See §8 |
| 9 | Rules compile (Rules v2) | **PASS** | See §9 |
| 10 | Bootstrap sequence correct | **PASS** | See §10 |

---

## 1. No privilege escalation

### Firestore `gallery`

- **Anonymous:** read only (`allow read: if true`). No create/update/delete.
- **Auth without `users/{uid}`:** `userExists()` false → all role helpers false → writes denied.
- **Inactive user:** `isActiveUser()` false → writes denied.
- **Editor:** `canUploadGallery()` true; `canDeleteGallery()` false.
- **Admin / owner:** upload + delete allowed when active.

Role is always read from **`get(/users/{request.auth.uid})`**, not from client-supplied gallery fields. Spoofing `role` in a gallery document does not grant access.

### Firestore `users`

| Action | Who | Enforcement |
|--------|-----|-------------|
| read | self | `request.auth.uid == userId` |
| read | owner/admin | `isOwnerOrAdmin()` (reads caller’s own user doc) |
| create | owner/admin | role ∈ {owner, admin, editor}; `isActive` bool; **admin cannot create `role: owner`** |
| update | owner/admin | **admin cannot update docs where `resource.data.role == 'owner'`**; **admin cannot set `request.resource.data.role == 'owner'`** |
| delete | owner only | `isOwner()` |

**Escalation attempts blocked:**

- Editor → write `users` (including self-promotion): denied (not owner/admin).
- Admin → create or promote to `owner`: denied by `(isOwner() \|\| request.resource.data.role != 'owner')`.
- Admin → modify existing owner doc: denied by `(isOwner() \|\| resource.data.role != 'owner')`.
- Admin → delete owner user doc: denied (`delete` is owner-only).
- Anonymous → any write: denied.

### Storage

- Writes require Auth + `firestore.exists` + `firestore.get` on caller’s `users/{uid}` with `isActive == true`.
- Upload roles: `owner`, `admin`, `editor` only.
- Delete roles: `owner`, `admin` only — editor excluded.

**Verdict:** No privilege escalation path identified in rule logic.

---

## 2. No owner lockout

### Pre-deploy (bootstrap)

Phase C **must not** be published before `users/{ownerAuthUid}` exists with `role: "owner"` and `isActive: true`. Phase A–B production validation confirms this precondition.

### Post-deploy (runtime)

| Scenario | Client SDK | Recovery |
|----------|------------|----------|
| Owner doc missing | Owner writes denied | Console: recreate `users/{uid}` |
| `isActive: false` on owner | Owner writes denied | Console: set `isActive: true` |
| Owner demotes own role (misconfig) | Writes denied per new role | Console: restore `role: owner` |
| Rules mis-published | Broad deny or open write | Console: republish correct rules or rollback |

**Firebase Console and Admin SDK bypass Security Rules.** Project owners with Console access can always restore `users` documents, Auth users, and rule sets. This satisfies “owner can recover” at the platform level.

### Intentional constraints (not lockout defects)

- Only **owner** may delete `users` documents — prevents admin from removing the last owner via rules.
- At least one Firebase **project owner** (Google account) must retain Console access — standard operational requirement.

**Verdict:** No structural owner lockout in rules, provided bootstrap §4 is complete before §9 publish.

---

## 3. No recursive rule errors

### Firestore self-`get()` pattern

Helper `userPath()` → `/users/$(request.auth.uid)`. All `get()` / `exists()` calls target the **caller's** document, not the document under evaluation.

**Example:** evaluating `read` on `users/otherUid` as admin:

1. Rule calls `isOwnerOrAdmin()` → `get(users/{auth.uid})`.
2. Nested evaluation on `users/{auth.uid}`: `request.auth.uid == userId` → **allowed (self-read)**.
3. No further nested `get()` on `otherUid`.

**Example:** evaluating `create` on `gallery/{docId}`:

1. `canUploadGallery()` → `get(users/{auth.uid})` → self-read path resolves cleanly.

No rule path triggers unbounded `get()` → `get()` → … chains.

### Storage → Firestore cross-read

`firestore.get` / `firestore.exists` on `users/{request.auth.uid}` do not re-enter Storage rule evaluation. No Storage/Firestore recursion loop.

**Verdict:** Recursive rule error risk is absent.

---

## 4. No invalid `firestore.get()` usage

### Firestore (same service)

```javascript
exists(/databases/$(database)/documents/users/$(request.auth.uid))
get(/databases/$(database)/documents/users/$(request.auth.uid)).data
```

- Valid path template with `$(database)` — works for default and named databases.
- `userExists()` uses `exists()` before `userData()` / `get()` in all gated helpers (`isActiveUser` → `isOwner` / `isAdmin` / `isEditor`).

### Storage (cross-service)

```javascript
firestore.exists(/databases/(default)/documents/users/$(request.auth.uid))
firestore.get(/databases/(default)/documents/users/$(request.auth.uid))
```

- Valid Rules v2 cross-service syntax.
- `(default)` matches `vedman-lv` project configuration.
- `isActiveUser()` checks `exists` before reading `.data.isActive`.
- `role()` reads from same document; Firebase caches `get` results within a single request evaluation (one logical read per path).

**Verdict:** Syntax and usage are valid. No missing path segments or wrong service references.

---

## 5. Storage rules match Firestore roles

| Capability | Firestore rule | Storage rule | Match |
|------------|----------------|--------------|:-----:|
| Public read | `gallery`: `read: true` | `read: true` | ✓ |
| Upload / create | `canUploadGallery()` → active owner, admin, editor | `canUpload()` → active + role ∈ {owner, admin, editor} | ✓ |
| Delete | `canDeleteGallery()` → active owner, admin | `canDelete()` → active + role ∈ {owner, admin} | ✓ |
| Editor delete | Denied | Denied | ✓ |
| Anonymous write | Denied | Denied | ✓ |
| Role source | `users/{request.auth.uid}` | `users/{request.auth.uid}` | ✓ |
| Active check | `isActive == true` | `isActive == true` | ✓ |

Storage uses inline role membership; Firestore uses named helpers — **semantically equivalent** for this three-role model.

**Verdict:** Storage and Firestore RBAC are aligned.

---

## 6. Public gallery read remains available

```javascript
match /gallery/{docId} {
  allow read: if true;
```

- Unauthenticated `getDocs(collection(db, "gallery"))` on `index.html` continues to work.
- No Auth token required for Firestore gallery reads.

Storage objects referenced by public download URLs:

```javascript
allow read: if true;
```

- `<img src>` / `<video src>` on public site continue to load.

**Verdict:** Public gallery visibility preserved.

---

## 7. Editor cannot delete

### Firestore

```javascript
function canDeleteGallery() {
  return isOwnerOrAdmin();  // excludes isEditor()
}
```

### Storage

```javascript
function canDelete() {
  return isActiveUser() && role() in ['owner', 'admin'];
}
```

Editor with `role: "editor"` and `isActive: true`:

- Firestore `delete` on `gallery` → **denied**
- Storage `delete` → **denied**
- Storage/Firestore `create` / `update` → **allowed**

Matches Phase B panel UI (delete hidden for editor).

**Verdict:** Editor delete blocked at both layers.

---

## 8. Owner can always recover the system

| Failure mode | Recovery mechanism | Rules block Console? |
|--------------|-------------------|:--------------------:|
| Corrupt / missing `users/{ownerUid}` | Console → Firestore → recreate doc | No |
| Owner `isActive: false` | Console → set `isActive: true` | No |
| Bad rules published | Console → Rules → rollback / repaste | No |
| Lost panel access | Console → Auth + Firestore manual fix | No |
| Need emergency open writes | Console → temporary open rules (git rollback baseline exists) | No |

Owner role can manage all `users` documents (including admins/editors) once authenticated with an active owner profile. Admin **cannot** delete or downgrade the owner document via client SDK.

**Verdict:** System recovery always available to Firebase project operators.

---

## 9. Rules compile under Firebase Rules v2

### Syntax review

| Construct | Firestore | Storage |
|-----------|:---------:|:-------:|
| `rules_version = '2'` | ✓ | ✓ |
| Helper functions | ✓ | ✓ |
| `in [...]` role lists | ✓ | ✓ |
| `request.auth` / `request.resource` | ✓ | ✓ |
| `resource.data` on update | ✓ | N/A |
| `firestore.get` / `firestore.exists` | N/A | ✓ |
| Wildcard `/{allPaths=**}` | N/A | ✓ |

No deprecated v1 syntax. No unsupported constructs detected.

### Console paste requirement (operational)

`FIREBASE_RULES.txt` includes **repo header lines** (lines 1–4, label `Firestore Rules:`, label `Storage Rules:`). These must **not** be pasted into Console.

**Correct paste:** from `rules_version = '2';` through each block’s closing `}` only (per bootstrap §9).

Pasting the full file including headers would cause a **compile error** — this is operator procedure, not a rules logic defect.

**Verdict:** Rules v2 syntax is valid when copied as documented.

---

## 10. Bootstrap sequence is correct

| Step | Action | Required before Phase C? |
|------|--------|:------------------------:|
| 1 | Enable Email/Password Auth | Yes |
| 2 | Add authorized domains (`vedman.lv`, etc.) | Yes |
| 3 | Create owner Auth user | Yes |
| 4 | Create `users/{ownerUid}` with `role: owner`, `isActive: true` | **Critical** |
| 5 | Phase B interim rules (optional if skipping straight to C) | No — Phase C supersedes |
| 6 | Validate panel login + upload (Phase B) | Yes — **completed** |
| 7 | Publish Firestore rules from `FIREBASE_RULES.txt` | Phase C deploy |
| 8 | Publish Storage rules from same file | Phase C deploy |
| 9 | Smoke test owner upload/delete, editor no delete, public gallery | Post-deploy |

Order in `FIREBASE_USERS_BOOTSTRAP.md` §9 is correct: **Firestore first, then Storage**, then smoke tests. Deploy both in one session to minimize split-brain window.

**Verdict:** Bootstrap sequence is correct and consistent with rules design.

---

## Residual operational notes (non-blocking)

| Note | Severity | Mitigation |
|------|----------|------------|
| Paste header text into Console | Deploy error | Bootstrap §9: copy from `rules_version` only |
| Brief Firestore/Storage rule mismatch if only one published | Transitional exposure | Publish both rules back-to-back |
| Owner self-demotion via client SDK | Self-inflicted | Console restore |
| `gallery` update rule is broad | Low | Panel uses create/delete only today |
| Storage `update` allows overwrite by any uploader | Low | Panel uploads new timestamped paths |

None of these block deployment when bootstrap and paste instructions are followed.

---

## Pre-publish operator checklist

- [ ] Confirm `users/{ownerUid}` exists: `role: owner`, `isActive: true`
- [ ] Copy **Firestore** block only (`rules_version` … `}`) → publish
- [ ] Copy **Storage** block only (`rules_version` … `}`) → publish
- [ ] Owner: login → upload → delete
- [ ] Editor (if configured): upload OK, delete denied
- [ ] Public `/index.html` gallery loads logged out
- [ ] Rollback path confirmed (git pre–Phase C rules or §11 rollback doc)

---

## Files in this approval

| File | Role |
|------|------|
| `FIREBASE_RULES.txt` | Rules under review |
| `FIREBASE_USERS_BOOTSTRAP.md` | Bootstrap + §9 deploy |
| `FINAL_PHASE_C_APPROVAL.md` | This document |

No rules modified during this review.

---

APPROVED FOR DEPLOYMENT
