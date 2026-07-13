# Phase A–B code review

**Reviewer:** implementation self-review (pre-commit)  
**Scope:** `vedman-panel.html` RBAC auth changes, `FIREBASE_USERS_BOOTSTRAP.md`, `README.md`, `SECURITY_PHASE_B_TEST_NOTES.md`  
**Out of scope:** Phase C Firestore/Storage rules deploy, `index.html` changes  

**Method:** static analysis of auth flow, role gate, error paths, mobile/Safari patterns, and comparison with `SECURITY_IMPLEMENTATION_PLAN.md` §10.

---

## Summary

The Phase A–B implementation matches the approved design: Firebase Auth replaces hardcoded credentials, `users/{uid}` is checked before the panel is shown, invalid/missing/inactive users are signed out, and delete UI is hidden for `editor`. Upload/delete behavior for authorized roles is unchanged.

No **Critical** or **High** defects were found in the new auth/RBAC code. Residual risk is mostly **accepted Phase B scope** (client-side enforcement, open backend rules) documented for Phase C.

**Recommended to commit.**

---

## Critical

*None.*

---

## High

*None.*

---

## Accepted Phase B security scope (not commit blockers)

These are **known, documented limitations** — not bugs in this diff. They must be tracked for Phase C.

| Item | Notes |
|------|--------|
| Open Firestore/Storage rules | Anyone can still read/write `gallery` and Storage without auth until Phase C. |
| Client-side RBAC only | Hiding delete for `editor` is UI-only; open rules still allow delete via API/Console. |
| No server-side role verification on upload/delete | By design until RBAC rules ship. |
| Interim `users` read rule required in Console | Documented in `FIREBASE_USERS_BOOTSTRAP.md` §5; not in repo rules files. |

---

## Medium

### M1 — Fail-closed on transient Firestore errors during role check

**File:** `vedman-panel.html` — `resolveAuthorization()` catch block (lines 180–186)

Any `getDoc` failure (offline, `unavailable`, timeout) routes through `denyAccess()`, which calls `signOut()`. A user with a valid persisted Auth session who opens the panel on a poor connection is signed out and must re-enter credentials when the network returns.

**Assessment:** Consistent with fail-closed authorization and acceptable for an online-only admin tool, but stricter than the old `sessionStorage` gate (which showed the panel offline with failing Firebase ops). Consider distinguishing `permission-denied` vs network errors in a follow-up (no change required for this commit).

### M2 — No re-validation of `users/{uid}` during an active session

**File:** `vedman-panel.html`

After login, `currentUserRole` is held in memory. If an operator sets `isActive: false` or changes `role` in Console, the user keeps panel access until refresh, logout, or token-driven `onAuthStateChanged` re-fire (role doc is not re-read on upload/delete).

**Assessment:** Expected for Phase B; Phase C rules will enforce server-side.

### M3 — `loadList()` / refresh / delete lack error handling

**File:** `vedman-panel.html` — `loadList()` (438+), delete handler (464+), `#refreshBtn` (479)

`getDocs`, `deleteDoc`, and refresh clicks can throw (offline, quota, permission). Only `initFirebasePanel()` wraps the initial `loadList()` in try/catch. Refresh and delete can cause unhandled promise rejections and silent failures (delete Storage errors are swallowed).

**Assessment:** Pre-existing pattern extended unchanged; worth hardening in a later pass.

### M4 — XSS via unescaped gallery fields in `innerHTML`

**File:** `vedman-panel.html` — `loadList()` template (447–461)

`title`, `description`, `url`, etc. are interpolated into HTML without encoding. Malicious or accidental `<script>` in Firestore data could execute in the panel.

**Assessment:** Pre-existing; not introduced by RBAC work. Fix separately.

### M5 — Generic login error hides network vs credential failures

**File:** `vedman-panel.html` — `doLogin()` catch (212–216)

All `signInWithEmailAndPassword` errors show “Nepareizs e-pasts vai parole.” including `auth/network-request-failed` and `auth/too-many-requests`.

**Assessment:** Good for anti-enumeration; poor for diagnosing offline/unavailable Auth. Document in bootstrap troubleshooting.

### M6 — Editor delete restriction is UI-only (Phase B)

**File:** `vedman-panel.html` — `canDeleteInPanel()` (131–133)

Correct for Phase B scope. With open rules, an `editor` could still delete via DevTools or direct SDK calls.

**Assessment:** Documented; resolved in Phase C.

---

## Low

### L1 — Firebase UID exposed in missing-profile error

**File:** `vedman-panel.html` line 165

Message includes `users/{uid}` for operators debugging bootstrap. Minor information disclosure on the login screen.

### L2 — `status.ready` CSS class not cleared on logout

**File:** `vedman-panel.html` — `showLoginView()` (115–122)

`status.classList.add("ready")` in `initFirebasePanel()` is never removed on logout. Cosmetic on re-login; status text is overwritten.

### L3 — `#configHelp` unreachable when config is missing

**File:** `vedman-panel.html`

If `VEDMAN_FIREBASE_READY` is false, the user stays on `#login` with an error; `#configHelp` lives inside hidden `#app`. Login error text is sufficient; help card is dead in that state.

### L4 — Enter key only bound on password field

**File:** `vedman-panel.html` line 221

Enter in the email field does not submit the form. Minor UX; mobile/Safari unaffected.

### L5 — Password field not cleared on logout

**File:** `vedman-panel.html` — logout handler (222–228)

Password remains in `#loginPass` after **Iziet**. Shared-device hygiene only.

### L6 — Drag-and-drop file assignment may not work in all browsers

**File:** `vedman-panel.html` line 497–498

Assigning `input.files = dataTransfer.files` is read-only in many browsers (including some Safari versions). File picker still works; drag-drop is best-effort. Pre-existing.

### L7 — WEBP canvas encoding on older Safari

**File:** `vedman-panel.html` — `imageToWebp()` (312–346)

`canvas.toBlob(..., "image/webp")` requires Safari 14+ / iOS 14+. Older devices fall back to error path or raw upload branch. Pre-existing; HEIC path documented in README.

### L8 — No loading/disabled state on upload during multi-file upload

**File:** `vedman-panel.html` — upload handler (404–436)

Double-tap on slow mobile networks could start overlapping uploads. Pre-existing.

### L9 — `boot()` has no top-level try/catch

**File:** `vedman-panel.html` lines 230–241

`initializeApp` failure would surface as an uncaught exception. Unlikely with valid committed config.

### L10 — Absolute script path `/firebase-config.js`

**File:** `vedman-panel.html` line 82

Works on production root (`vedman.lv`); breaks on `file://` local open unless served from site root. Pre-existing deployment assumption.

---

## Area-by-area review

### Security

| Check | Result |
|-------|--------|
| Hardcoded credentials removed | ✓ |
| `sessionStorage` bypass removed | ✓ |
| Auth required before `#app` shown | ✓ |
| Missing `users` doc → deny + signOut | ✓ |
| `isActive !== true` (strict boolean) | ✓ |
| Invalid/missing `role` → deny | ✓ |
| Delete hidden for `editor` in UI | ✓ |
| Server-side RBAC | Deferred Phase C (accepted) |

### Firebase Auth flow

| Check | Result |
|-------|--------|
| Single `initializeApp` via `ensureFirebaseApp()` | ✓ |
| `onAuthStateChanged` restores persisted sessions | ✓ |
| Successful sign-in delegated to auth state listener | ✓ |
| `denyAccess()` always signs out when user present | ✓ |
| Logout calls `signOut` + resets panel state | ✓ |

**Flow (matches plan §10.2–10.3):**

```text
email/password → signInWithEmailAndPassword
  → onAuthStateChanged
  → getDoc(users/{uid})
  → pass: showAppView + initFirebasePanel
  → fail: signOut + login error
```

### Firestore user role check

| Check | Result |
|-------|--------|
| Document path `users/{uid}` uses Auth UID | ✓ |
| `snap.exists()` checked before data read | ✓ |
| `isActive` strict equality to `true` | ✓ |
| Role whitelist `owner \| admin \| editor` | ✓ |
| Permission-denied hint points to bootstrap doc | ✓ |

### Error handling

| Scenario | Behavior | OK? |
|----------|----------|-----|
| Wrong password | Login error, no panel | ✓ |
| Missing user doc | signOut + specific message | ✓ |
| Inactive user | signOut + “Konts nav aktīvs” | ✓ |
| Invalid role | signOut + “Nederīga loma” | ✓ |
| Missing config | Login error, no Auth init | ✓ |
| Firestore offline at role check | signOut + generic authz error | Fail-closed (M1) |
| `loadList` fails after login | Status shows error; upload may still work | Acceptable |
| Upload failure | `showErr(e.message)` | ✓ |

### Safari compatibility

| Check | Result |
|-------|--------|
| ES modules + Firebase 10.12 CDN | Supported |
| `type="email"`, `autocomplete` | Supported |
| `font-size: 16px` inputs (no iOS zoom) | ✓ |
| `hidden` on role badge | Supported |
| WEBP compression | Safari 14+ (L7) |
| HEIC upload path | Documented limitation |

### Mobile compatibility

| Check | Result |
|-------|--------|
| Viewport meta | ✓ |
| Touch targets ≥ 44px (`min-height: 44px`) | ✓ |
| Responsive grid/list `@720px` | ✓ |
| Top bar `flex-wrap` | ✓ |
| File input `multiple` + mobile picker | ✓ |
| Login card margin on small screens | ✓ |

### Upload after login

| Check | Result |
|-------|--------|
| `firebaseOK` set only after successful authz + `initFirebasePanel` | ✓ |
| Upload guarded by `firebaseOK` | ✓ |
| `panelReady` prevents double init | ✓ |
| Storage/Firestore upload logic unchanged | ✓ |

### Logout

| Check | Result |
|-------|--------|
| `signOut(auth)` invoked | ✓ |
| Panel hidden, role cleared | ✓ |
| `onAuthStateChanged(null)` also calls `showLoginView` | ✓ (harmless duplicate) |

### Offline mode

| Check | Result |
|-------|--------|
| Login without network | Auth error (generic message) |
| Persisted session + offline at load | Role `getDoc` fails → signOut (M1) |
| Panel visible offline after authz | No — requires successful role read |
| Upload offline | Fails with `showErr` if attempted |

### Firebase unavailable

| Check | Result |
|-------|--------|
| Missing `firebase-config.js` / `READY=false` | Login error; Auth not started |
| CDN/module load failure | Entire script fails (pre-existing) |
| Auth service down | Generic login error |
| Firestore down after login | Upload/list errors via SDK messages |

---

## Documentation cross-check

| Doc | Aligns with code? |
|-----|-------------------|
| `FIREBASE_USERS_BOOTSTRAP.md` | ✓ Auth, `users` schema, interim rule, roles |
| `README.md` | ✓ No passwords; points to bootstrap |
| `SECURITY_PHASE_B_TEST_NOTES.md` | ✓ Test matrix matches behaviors |
| `SECURITY_IMPLEMENTATION_PLAN.md` §10 | ✓ Flow and role UI match |

---

## Pre-commit checklist

- [x] Auth + role gate implemented as specified
- [x] No changes to `FIREBASE_RULES.txt` or `index.html`
- [x] Bootstrap and test notes present
- [ ] Operator runs manual tests T1–T7 after Console bootstrap (post-deploy)
- [ ] Interim `users` read rule published in Firebase Console

---

## Verdict

**Recommended to commit.**

No Critical or High implementation issues. Medium items are either accepted Phase B trade-offs (M2, M6), pre-existing gallery code (M3, M4), or follow-up UX hardening (M1, M5). Proceed with commit after operator completes Firebase Console bootstrap and manual smoke tests.
