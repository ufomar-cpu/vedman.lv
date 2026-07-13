# Phase A–B test notes (RBAC panel)

**Scope:** Firebase Auth + Firestore `users/{uid}` role gate in `vedman-panel.html`.  
**Not tested here:** Phase C secure Firestore/Storage rules deploy.

**Prerequisites:** Complete `FIREBASE_USERS_BOOTSTRAP.md` (including interim `users` read rule).

---

## Automated / static checks (done in repo)

| Check | Result |
|-------|--------|
| Hardcoded `ADMIN_USER` / `ADMIN_PASS` removed from `vedman-panel.html` | Pass |
| `sessionStorage.vedmanAdmin` removed | Pass |
| Firebase Auth imports (`signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`) | Pass |
| `getDoc(doc(db, "users", uid))` role gate | Pass |
| Deny: missing doc, `isActive !== true`, invalid role | Pass |
| Valid roles: `owner`, `admin`, `editor` | Pass |
| Delete UI hidden for `editor` (`canDeleteInPanel`) | Pass |
| Upload/delete logic unchanged for authorized roles | Pass |
| `index.html` not modified | Pass |
| `FIREBASE_RULES.txt` not modified | Pass |
| README plaintext passwords removed | Pass |

---

## Manual tests (Firebase Console + browser)

Run after bootstrap. Record date and tester when executing.

### T1 — Owner happy path

1. Sign in with owner email/password.
2. **Expected:** Panel visible, role badge **Owner**, status “Firebase savienots (Owner)”.
3. Upload one image → appears in list and on public `index.html` gallery (if rules open).
4. Delete that item → removed from list.
5. **Iziet** → back to login form.

### T2 — Editor restrictions (UI)

1. Bootstrap editor user + `users/{uid}` with `role: editor`, `isActive: true`.
2. Sign in as editor.
3. **Expected:** Upload works; list shows “Dzēšana nav pieejama (editor)” instead of delete button.
4. **Note:** With open rules, editor could still delete via API — Phase C rules will enforce server-side.

### T3 — Auth user without Firestore doc

1. Create Auth user in Console **without** `users/{uid}` document.
2. Sign in on panel.
3. **Expected:** Signed out automatically; error about missing profile.

### T4 — Inactive user

1. Set owner (or test user) `isActive: false` in Firestore.
2. Sign in.
3. **Expected:** “Konts nav aktīvs”; signed out.
4. Restore `isActive: true` after test.

### T5 — Invalid role

1. Set `role: "viewer"` (or any string not in owner/admin/editor).
2. Sign in.
3. **Expected:** “Nederīga loma”; signed out.

### T6 — Wrong password

1. Sign in with valid email, wrong password.
2. **Expected:** “Nepareizs e-pasts vai parole.” (no panel access).

### T7 — Public site unchanged

1. Open `/index.html` logged out.
2. **Expected:** Gallery loads as before; no auth prompt.

### T8 — Missing interim users rule (optional regression)

1. Temporarily remove `users` read rule in Console (staging only).
2. Sign in with valid owner.
3. **Expected:** Permission-denied message referencing bootstrap doc.
4. Restore rule.

---

## Known limitations (Phase B)

- Authorization is **client-side** until Phase C rules ship.
- Open `gallery` / Storage rules still allow unauthenticated writes.
- User management (create/edit roles) is Console-only until a future admin UI.

---

## Sign-off

| Item | Status |
|------|--------|
| Code implementation | Ready |
| Bootstrap doc | Ready |
| Manual T1–T7 in production/staging | _Pending operator run after bootstrap_ |
