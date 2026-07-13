# VEDMAN V5 — Security Implementation Plan

**Phase:** Milestone 1 — Secure Foundation (revised)  
**Branch target:** `v5-dev` → merge after verification  
**Planning date:** 2026-07-03  
**Revision:** RBAC via Firestore `users/{uid}` — approved in principle, **awaiting final approval before code**  
**Status:** Plan updated — **no production code modified yet**

**Inputs:** `PROJECT_MAP.md`, `V5_MASTER_PLAN.md`, `FIREBASE_RULES.txt`, stakeholder revisions

---

## Revision summary (approved direction)

| Requirement | Plan response |
|-------------|---------------|
| Role-based access: **owner**, **admin**, **editor** | Permission matrix in Section 4; enforced in rules + panel |
| Do **not** rely on Firebase Auth alone | Auth + Firestore `users/{uid}` with `role`, `isActive` |
| Rules verify **authentication and authorization** | Helper functions read `users/{uid}` in Firestore + Storage rules |
| Do **not** depend on hiding admin link | Footer admin link is **not** a security control; removed from hardening scope |
| Zero public downtime | Unchanged — public gallery read stays open |

---

## 1. Objective

Replace the current **client-only admin gate** and **open Firebase write rules** with a **two-layer security model**:

1. **Authentication** — Firebase Auth (email/password) on `vedman-panel.html`
2. **Authorization** — Firestore document `users/{uid}` with `role` and `isActive`; Security Rules enforce both

Additionally:

- Remove hardcoded credentials from source and documentation
- Enforce **owner / admin / editor** permissions server-side (Rules), not only in UI
- Keep public gallery **read** open for `index.html` visitors

**Security does not depend on:** obscuring `/vedman-panel.html`, removing the footer admin link, or `robots.txt` disallow.

---

## 2. Current state (baseline)

| Component | Current behavior | Risk |
|-----------|------------------|------|
| `vedman-panel.html` | `ADMIN_USER` / `ADMIN_PASS` in JS; `sessionStorage.vedmanAdmin` | **Critical** |
| `README.md` | Plaintext username/password (`vedman123`) | **Critical** |
| Code vs README | Panel uses `admin123`; README says `vedman123` | **Inconsistent** |
| Firestore rules | `gallery/*`: read/write **true** for everyone | **Critical** |
| Storage rules | all paths: read/write **true** for everyone | **Critical** |
| `users` collection | **Does not exist** | — |
| `index.html` | Firestore read-only on `gallery` | Unaffected by write-rule change |
| `firebase-config.js` | Valid `authDomain`, project `vedman-lv` | Auth-ready |

**Important:** Anonymous clients can upload/delete gallery data today via Firebase API regardless of panel UI.

---

## 3. Target state

### 3.1 Authentication (who you are)

| Component | Target |
|-----------|--------|
| Panel login | `signInWithEmailAndPassword()` — Firebase Auth SDK 10.12.5 |
| Session | Firebase Auth persistence; **remove** `sessionStorage.vedmanAdmin` |
| Sign-out | `signOut(auth)` |

### 3.2 Authorization (what you may do)

| Component | Target |
|-----------|--------|
| User profile | Firestore `users/{uid}` where `{uid}` === `request.auth.uid` |
| Required fields | `role` (`owner` \| `admin` \| `editor`), `isActive` (`true` \| `false`) |
| Panel gate | After Auth success, **read** `users/{uid}`; deny access if missing, inactive, or unknown role |
| Rules gate | Every protected write checks Auth **and** active user doc **and** role |

### 3.3 Data access (unchanged for public)

| Resource | Public read | Writes |
|----------|-------------|--------|
| `gallery/*` | **Allowed** (homepage) | Role-gated |
| Storage media URLs | **Allowed** | Role-gated |
| `users/*` | Denied (except own doc for signed-in user) | owner/admin only |

---

## 4. Role model

### 4.1 Role definitions

| Role | Purpose | Typical holder |
|------|---------|----------------|
| **owner** | Full control; bootstrap account; manage all users | Business owner / technical owner |
| **admin** | Gallery management + user administration (except owner accounts) | Trusted manager |
| **editor** | Content upload only | Staff uploading photos |

### 4.2 Permission matrix

| Action | owner | admin | editor | anonymous |
|--------|:-----:|:-----:|:------:|:---------:|
| View public gallery (`index.html`) | ✓ | ✓ | ✓ | ✓ |
| Sign in to panel (Auth) | ✓ | ✓ | ✓ | — |
| Access panel app (`users` doc active) | ✓ | ✓ | ✓ | ✗ |
| List gallery in panel | ✓ | ✓ | ✓ | ✗ |
| Upload gallery media (Storage + Firestore) | ✓ | ✓ | ✓ | ✗ |
| Delete gallery items | ✓ | ✓ | ✗ | ✗ |
| Read own `users/{uid}` | ✓ | ✓ | ✓ | ✗ |
| Read all `users/*` | ✓ | ✓ | ✗ | ✗ |
| Create/update `users/*` | ✓ | ✓* | ✗ | ✗ |
| Set `role: owner` | ✓ | ✗ | ✗ | ✗ |
| Deactivate users (`isActive: false`) | ✓ | ✓* | ✗ | ✗ |

\* **admin** may manage **editor** and **admin** accounts only — **not** owner accounts (enforced in rules).

### 4.3 UI enforcement (defense in depth — not sufficient alone)

Panel UI should hide/disable controls by role (e.g. hide delete buttons for **editor**), but **Security Rules are the authoritative control**.

---

## 5. Firestore `users/{uid}` schema

### 5.1 Document path

```
users/{uid}     where uid === Firebase Auth UID
```

### 5.2 Required fields (M1)

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `role` | string | `owner`, `admin`, `editor` | Invalid/missing role → deny |
| `isActive` | boolean | `true`, `false` | `false` → deny panel + writes |

### 5.3 Recommended optional fields (M1 or later)

| Field | Type | Purpose |
|-------|------|---------|
| `email` | string | Display in panel; mirror Auth email |
| `displayName` | string | Operator-friendly name |
| `createdAt` | timestamp | Audit |
| `updatedAt` | timestamp | Audit |
| `createdBy` | string (uid) | Who invited the user |

### 5.4 Example documents

**Owner (bootstrap):**

```json
{
  "role": "owner",
  "isActive": true,
  "email": "owner@vedman.lv",
  "displayName": "VEDMAN Owner",
  "createdAt": "<server timestamp>"
}
```

**Editor:**

```json
{
  "role": "editor",
  "isActive": true,
  "email": "foto@vedman.lv",
  "displayName": "Gallery Editor",
  "createdBy": "<owner-uid>"
}
```

### 5.5 Escalation prevention (rules)

- User **cannot** set their own `role` to `owner`
- User **cannot** set their own `isActive` to `true` if currently false
- **editor** cannot write any `users/*` document
- **admin** cannot modify documents where existing `role == 'owner'`

---

## 6. Files to modify

### 6.1 Production code (required — after final approval)

| File | Changes |
|------|---------|
| **`vedman-panel.html`** | Remove hardcoded login + `sessionStorage`. Add Firebase Auth. After login: `getDoc(users/{uid})` — verify `isActive` + valid `role`. Role-aware UI (delete hidden for editor). Logout button. Upload/delete unchanged structurally but gated by rules. |
| **`README.md`** | Remove plaintext passwords. Document: Auth setup, bootstrap `users/{uid}` owner doc, role meanings, rules deploy order. |
| **`FIREBASE_RULES.txt`** | Replace with RBAC Firestore + Storage rules (Section 8–9) after Console deploy. |
| **`FIREBASE_RULES_SECURE_NEXT.txt`** | **Update or supersede** — current text is auth-only; replace with RBAC version matching Section 8–9. |

### 6.2 New files (recommended)

| File | Purpose |
|------|---------|
| **`FIREBASE_USERS_BOOTSTRAP.md`** | Operator runbook: create first Auth user + `users/{uid}` doc in Console (not committed secrets) |
| **`js/admin-auth.js`** (optional) | Shared auth + role loader — defer if keeping single-file panel for M1 |

### 6.3 Files explicitly NOT modified (M1)

| File | Reason |
|------|--------|
| **`index.html`** | Read-only gallery; no auth. Optional **text-only** fallback message fix — not security-critical. |
| **`index.html` admin link** | **No change required for security.** Link may stay visible; protection is Auth + RBAC. |
| **`firebase-config.js`** | Already valid; no schema change |
| **`gallery.json`** | Fallback unchanged |
| **`robots.txt`** | Disallow panel is SEO/crawler hint only — not authorization |

### 6.4 Out of scope M1 (document for later)

| Item | Notes |
|------|-------|
| In-panel user management UI | Users created via Console or later milestone |
| Cloud Functions for invite flow | Optional P8 |
| Custom JWT claims | Using Firestore `users/{uid}` instead |

---

## 7. Migration strategy

### Guiding rules

1. **Bootstrap `users/{uid}` before RBAC rules** — otherwise even the owner cannot write.
2. **Panel auth + role check code before RBAC rules** — panel must work against open rules first.
3. **Public reads unchanged throughout** — zero downtime for `index.html`.

### Phase A — Firebase Console bootstrap (no git deploy)

| Step | Action | Downtime |
|------|--------|----------|
| A1 | Enable **Email/Password** in Authentication | None |
| A2 | Create Auth user for **owner** (strong password via password manager — not git) | None |
| A3 | Copy Auth **UID** from Console | None |
| A4 | Firestore → create document **`users/{uid}`** with `role: "owner"`, `isActive: true`, `email` | None |
| A5 | Add **`vedman.lv`** to Authentication → Settings → **Authorized domains** | None |
| A6 | (Optional) Create additional Auth users + `users/{uid}` for admin/editor testing | None |
| A7 | **Do not publish RBAC rules yet** | None |

**Checkpoint A7:** At least one `users/{uid}` owner document exists.

### Phase B — Deploy panel code (GitHub Pages)

| Step | Action | Downtime |
|------|--------|----------|
| B1 | Implement Auth + `users/{uid}` authorization gate in `vedman-panel.html` | None |
| B2 | Implement role-aware UI (delete disabled/hidden for editor) | None |
| B3 | Update `README.md`; add `FIREBASE_USERS_BOOTSTRAP.md` | None |
| B4 | Deploy to GitHub Pages | None |
| B5 | Owner signs in → panel loads → upload + delete work (**open rules still active**) | None |
| B6 | Editor test account: upload works; delete blocked in UI | None |
| B7 | Auth user **without** `users/{uid}` doc → panel shows access denied | None |
| B8 | User with `isActive: false` → panel denies access | None |

**Checkpoint B8:** Client authorization logic works; rules still permissive.

### Phase C — Deploy RBAC Security Rules (Firebase Console)

| Step | Action | Downtime |
|------|--------|----------|
| C1 | Publish Firestore rules (Section 8.3) | **Zero** public impact |
| C2 | Publish Storage rules (Section 9.3) | **Zero** public impact |
| C3 | Owner: upload + delete → success | None |
| C4 | Admin: upload + delete → success | None |
| C5 | Editor: upload → success; delete → **permission-denied** | None |
| C6 | Anonymous: any write → **permission-denied** | None |
| C7 | Public homepage gallery → still loads | **Zero** |

**Checkpoint C7:** Server-side RBAC enforced.

### Phase D — Documentation & credential hygiene

| Step | Action |
|------|--------|
| D1 | Update `FIREBASE_RULES.txt` + `FIREBASE_RULES_SECURE_NEXT.txt` in repo |
| D2 | Rotate/treat as compromised: `admin123`, `vedman123` |
| D3 | Update `TEST_REPORT.md` with RBAC test IDs |
| D4 | Git tag e.g. `security-rbac-m1` |

### Phase E — Post-M1 (optional, not security dependencies)

| Step | Action |
|------|--------|
| E1 | Firebase App Check |
| E2 | Archive legacy `admin/`, `admin.html` |
| E3 | In-panel user management for owner/admin |
| E4 | Optional `index.html` fallback message text fix |

**Explicitly excluded from security scope:** removing footer `.admin-square` link.

---

## 8. Firestore Security Rules

### 8.1 Current (production)

See `FIREBASE_RULES.txt` — open read/write on `gallery/*`.

### 8.2 Target — helper functions (RBAC)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userPath() {
      return /databases/$(database)/documents/users/$(request.auth.uid);
    }

    function userExists() {
      return isSignedIn() && exists(userPath());
    }

    function userData() {
      return get(userPath()).data;
    }

    function isActiveUser() {
      return userExists() && userData().isActive == true;
    }

    function role() {
      return userData().role;
    }

    function isOwner() {
      return isActiveUser() && role() == 'owner';
    }

    function isAdmin() {
      return isActiveUser() && role() == 'admin';
    }

    function isEditor() {
      return isActiveUser() && role() == 'editor';
    }

    function isOwnerOrAdmin() {
      return isOwner() || isAdmin();
    }

    function canUploadGallery() {
      return isOwner() || isAdmin() || isEditor();
    }

    function canDeleteGallery() {
      return isOwnerOrAdmin();
    }

    // --- users collection ---

    match /users/{userId} {
      allow read: if isSignedIn() && (
        request.auth.uid == userId ||
        isOwnerOrAdmin()
      );

      allow create: if isOwnerOrAdmin()
        && request.resource.data.role in ['owner', 'admin', 'editor']
        && request.resource.data.isActive is bool
        && (isOwner() || request.resource.data.role != 'owner');

      allow update: if isOwnerOrAdmin()
        && resource.data.role != 'owner' || isOwner()
        && (isOwner() || request.resource.data.role != 'owner')
        && request.resource.data.role in ['owner', 'admin', 'editor'];

      allow delete: if isOwner();
    }

    // --- gallery collection ---

    match /gallery/{docId} {
      allow read: if true;

      allow create: if canUploadGallery()
        && request.resource.data.keys().hasAll(['category', 'url', 'createdAt']);

      allow update: if canUploadGallery();

      allow delete: if canDeleteGallery();
    }
  }
}
```

**Note:** Exact `update`/`create` field validation to be tightened during implementation. Rules above express intent; validate against Firebase Rules simulator before publish.

### 8.3 Semantics table

| Operation | owner | admin | editor | anonymous |
|-----------|:-----:|:-----:|:------:|:---------:|
| Read `gallery` | ✓ | ✓ | ✓ | ✓ |
| Create `gallery` | ✓ | ✓ | ✓ | ✗ |
| Update `gallery` | ✓ | ✓ | ✓ | ✗ |
| Delete `gallery` | ✓ | ✓ | ✗ | ✗ |
| Read own `users/{uid}` | ✓ | ✓ | ✓ | ✗ |
| Read all `users` | ✓ | ✓ | ✗ | ✗ |
| Write `users` | ✓ | ✓* | ✗ | ✗ |

### 8.4 Bootstrap note

The **first** `users/{owner-uid}` document must be created **manually in Firebase Console** (or via Admin SDK offline) because rules prevent unauthenticated/unauthorized creation.

---

## 9. Storage Security Rules

Storage rules cross-read Firestore via `firestore.get()` / `firestore.exists()`.

### 9.1 Target (RBAC)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function userDoc() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid));
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isActiveUser() {
      return isSignedIn()
        && firestore.exists(/databases/(default)/documents/users/$(request.auth.uid))
        && userDoc().data.isActive == true;
    }

    function role() {
      return userDoc().data.role;
    }

    function canUpload() {
      return isActiveUser() && role() in ['owner', 'admin', 'editor'];
    }

    function canDelete() {
      return isActiveUser() && role() in ['owner', 'admin'];
    }

    match /{allPaths=**} {
      allow read: if true;

      allow create, update: if canUpload();

      allow delete: if canDelete();
    }
  }
}
```

**Project ID note:** Replace `(default)` with actual database ID if non-default — verify in Firebase Console (`vedman-lv` uses default).

### 9.2 Path patterns (unchanged)

Panel uploads to `{category}/{filename}.webp` (or video ext). Public `<img src>` uses download URLs — **read stays open**.

---

## 10. Authentication & authorization (panel code)

### 10.1 Remove from `vedman-panel.html`

- `ADMIN_USER`, `ADMIN_PASS`, `doLogin()`, `sessionStorage.vedmanAdmin`

### 10.2 Authentication flow

```
User submits email + password
  → signInWithEmailAndPassword(auth, email, password)
  → onAuthStateChanged fires
```

### 10.3 Authorization flow (required — not optional)

```
Auth user present
  → getDoc(doc(db, 'users', user.uid))
  → if !exists OR isActive != true OR role not in [owner, admin, editor]:
       signOut(auth)
       show error: "Nav piekļuves. Sazinies ar administratoru."
  → else:
       store role in memory
       show #app
       initFirebasePanel()
       apply role UI (hide delete if editor)
```

**Firebase Auth alone is insufficient** — user with valid password but no `users/{uid}` doc must **not** access panel features.

### 10.4 Panel UI by role

| UI element | owner | admin | editor |
|------------|:-----:|:-----:|:------:|
| Upload form | ✓ | ✓ | ✓ |
| Delete buttons | ✓ | ✓ | hidden/disabled |
| Refresh list | ✓ | ✓ | ✓ |
| User management (future) | ✓ | ✓ | ✗ |

### 10.5 `index.html`

No authentication changes. Public gallery read unchanged.

**Admin footer link:** May remain. Security = Auth + RBAC only.

---

## 11. Rollback strategy

### 11.1 Rollback triggers

- Public gallery stops loading (T10 failure)
- Owner cannot upload/delete after rule deploy
- Editor incorrectly allowed to delete
- Active owner locked out (missing `users` doc)

### 11.2 Rollback procedure

| Order | Action | Public site |
|-------|--------|-------------|
| **R1** | Restore **original open** Firestore rules from git history / `FIREBASE_RULES.txt` (pre-RBAC backup) | **No impact** |
| **R2** | Restore **original open** Storage rules | **No impact** |
| **R3** | Git revert panel RBAC commit(s) | **No impact** on homepage |
| **R4** | `users` collection can remain — harmless while rules open | — |

**Time:** 2–5 minutes. **Downtime:** zero for public site.

### 11.3 Pre-migration backup

1. Save current open Firestore + Storage rules (in repo `FIREBASE_RULES.txt`)
2. `git tag pre-security-rbac`
3. Export list of existing `gallery` docs (Console)

---

## 12. Testing plan

### 12.1 Pre-deployment

- [ ] Owner Auth user + `users/{uid}` with `role: owner`, `isActive: true`
- [ ] Test admin and editor Auth users + matching `users/{uid}` docs
- [ ] Auth user **without** `users` doc prepared for negative test
- [ ] Rules simulator validated in Firebase Console

### 12.2 Phase B tests (open rules, RBAC client gate)

| ID | Test | Expected |
|----|------|----------|
| T1 | Public homepage | Loads; gallery visible |
| T2 | Owner login + valid `users` doc | Panel app visible |
| T3 | Auth OK but **no** `users` doc | Access denied; signed out |
| T4 | `isActive: false` | Access denied |
| T5 | Editor login | Upload UI visible; delete hidden |
| T6 | Owner upload (open rules) | Success |

### 12.3 Phase C tests (RBAC rules live)

| ID | Test | Expected |
|----|------|----------|
| T10 | Public gallery incognito | **Zero-downtime** — loads |
| T11 | Anonymous Firestore write | `permission-denied` |
| T12 | Anonymous Storage write | `permission-denied` |
| T13 | Owner upload + delete | Success |
| T14 | Admin upload + delete | Success |
| T15 | Editor upload | Success |
| T16 | Editor delete (UI bypass via API) | **`permission-denied`** |
| T17 | Deactivated user write | `permission-denied` |
| T18 | Auth user without `users` doc write | `permission-denied` |
| T19 | Direct media URL in browser | Still loads (read open) |
| T20 | Panel URL known publicly | Upload fails without auth + role |

### 12.4 Role matrix verification (required sign-off)

| Account | Upload | Delete | Manage users doc |
|---------|:------:|:------:|:----------------:|
| owner | ✓ | ✓ | Console/M1 manual |
| admin | ✓ | ✓ | Console/M1 manual |
| editor | ✓ | ✗ | ✗ |
| anonymous | ✗ | ✗ | ✗ |

---

## 13. Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R1 | RBAC rules before `users/{uid}` bootstrap | Owner locked out | Phase A before C; manual owner doc |
| R2 | Rules before panel code | Writes fail | Phase B before C |
| R3 | Public gallery read accidentally restricted | **Outage** | Keep `allow read: if true` on gallery |
| R4 | Storage `firestore.get` wrong database path | All uploads fail | Test in Rules simulator; verify `(default)` |
| R5 | Admin modifies owner doc (escalation) | Privilege abuse | Rules block admin touching `role: owner` |
| R6 | Editor deletes via crafted API | Data loss | `canDeleteGallery()` in Firestore + Storage |
| R7 | Auth-only user (no Firestore doc) | Confusing UX | Clear error + signOut |
| R8 | Old passwords in git history | Account compromise | Rotate; RBAC limits blast radius |
| R9 | `users` doc deleted in Console | Lockout | Owner backup doc; break-glass open rules rollback |
| R10 | Hiding admin link assumed safe | False confidence | **Explicitly not relied upon** |

---

## 14. Estimated downtime

| Surface | Downtime |
|---------|----------|
| Public website `index.html` | **Zero** |
| Public gallery viewing | **Zero** |
| Quote / WhatsApp flow | **Zero** |
| SEO pages | **Zero** |
| Panel (correct migration order) | **Zero** |
| Panel (mis-ordered rules deploy) | Temporary admin lockout — **not** public outage |

---

## 15. Implementation checklist

**Awaiting final approval after this revision.**

- [ ] **A** Console: Auth users + `users/{uid}` documents (owner, test admin, test editor)
- [ ] **B** Code: `vedman-panel.html` Auth + authorization gate + role UI
- [ ] **B** Docs: `README.md`, `FIREBASE_USERS_BOOTSTRAP.md`
- [ ] **B** Tests T1–T6
- [ ] **C** Console: RBAC Firestore + Storage rules
- [ ] **C** Tests T10–T20 + role matrix
- [ ] **D** Sync `FIREBASE_RULES*.txt`; tag release; rotate compromised passwords

---

## 16. Approval gate

**Original plan approved with revisions. This document reflects those revisions.**

**Do not implement code or publish rules until explicitly confirmed:**

> **Approve RBAC Security Implementation Plan — proceed with Phase A–D**

Or scoped:

> **Approve Phase A–B only** (bootstrap + panel code; defer rules)

---

## Related documents

| Document | Relevance |
|----------|-----------|
| `V5_MASTER_PLAN.md` | Milestone 1 — update P5/P6 tasks for RBAC |
| `PROJECT_MAP.md` | Risks S1–S3 |
| `FIREBASE_RULES.txt` | Rollback baseline (open rules) |
| `TEST_REPORT.md` | Extend with T1–T20 |

---

**Planning only. No production code, Firebase rules, or Console settings have been changed since this revision.**
