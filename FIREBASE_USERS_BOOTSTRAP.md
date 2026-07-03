# Firebase users bootstrap (Phase A–B)

Manual steps in **Firebase Console** for project **`vedman-lv`**. Do this once before the panel can authenticate and enforce roles.

**Not included here:** full RBAC Firestore/Storage rules (Phase C). Gallery and Storage rules stay as in `FIREBASE_RULES.txt` until Phase C.

---

## 1. Enable Email/Password sign-in

1. Open [Firebase Console](https://console.firebase.google.com/) → project **vedman-lv**.
2. **Build** → **Authentication** → **Sign-in method**.
3. Enable **Email/Password** (first provider only; leave “Email link” disabled unless you want it later).
4. Save.

---

## 2. Authorized domains

1. **Authentication** → **Settings** → **Authorized domains**.
2. Confirm these exist:
   - `localhost` (local testing)
   - `vedman-lv.firebaseapp.com`
   - `vedman-lv.web.app`
   - **`vedman.lv`** (production GitHub Pages custom domain)
3. Add any missing domain → **Add domain**.

---

## 3. Create the owner Auth user

1. **Authentication** → **Users** → **Add user**.
2. Email: e.g. `owner@vedman.lv` (use your real address).
3. Password: strong password from a password manager (**do not** commit or paste into git).
4. Create user.
5. Copy the user **User UID** (e.g. `AbCdEf1234567890`) — you need it for step 4.

---

## 4. Create `users/{uid}` in Firestore

1. **Build** → **Firestore Database** → **Data**.
2. If there is no **`users`** collection yet: **Start collection** → Collection ID: `users`.
3. **Add document**:
   - **Document ID:** paste the **exact UID** from step 3 (not the email).
   - Fields:

| Field      | Type    | Value   |
|-----------|---------|---------|
| `role`    | string  | `owner` |
| `isActive`| boolean | `true`  |

4. Save.

**Schema (all panel users):**

```text
users/{firebaseAuthUid}
  role:     "owner" | "admin" | "editor"
  isActive: true | false
```

---

## 5. Phase B interim Firestore rule (required for role gate)

The panel reads `users/{uid}` after sign-in. With only `gallery` rules deployed, **`users` is denied by default** and login will fail with a permission error.

Add **one** interim block — still **not** full Phase C RBAC. Keep existing `gallery` rules unchanged.

1. **Firestore Database** → **Rules**.
2. Merge this **inside** `match /databases/{database}/documents { ... }`:

```javascript
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
```

3. Your rules should still include open gallery writes, for example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
    match /gallery/{docId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

4. **Publish**.

**Storage rules:** leave open (see old `FIREBASE_RULES.txt` in git history) until Phase C is deployed.

**After Phase C:** replace **both** Firestore and Storage rules with the Phase C RBAC blocks in `FIREBASE_RULES.txt` (see §9 below). The interim `users` read-only block is included in the full Phase C Firestore rules.

---

## 6. Optional: admin and editor test users

Repeat steps 3–4 for each person:

| Role     | `role` field | Panel delete buttons |
|----------|--------------|----------------------|
| `owner`  | `owner`      | Yes                  |
| `admin`  | `admin`      | Yes                  |
| `editor` | `editor`     | Hidden (upload only) |

Example editor document:

```text
users/{editorUid}
  role: "editor"
  isActive: true
```

To disable access without deleting Auth user: set `isActive` to `false`.

---

## 7. Verify in the panel

1. Deploy or serve the site with updated `vedman-panel.html`.
2. Open `/vedman-panel.html`.
3. Sign in with the owner email/password from step 3.
4. Expect: role badge **Owner**, gallery list loads, upload works, delete works.
5. Sign out → **Iziet**.

**Failure messages (by design):**

| Condition              | Message / behavior                          |
|------------------------|---------------------------------------------|
| Wrong password         | Nepareizs e-pasts vai parole.               |
| No `users/{uid}` doc   | Lietotāja profils nav atrasts               |
| `isActive: false`      | Konts nav aktīvs                            |
| Invalid `role`         | Nederīga loma                               |
| Missing users read rule| Autorizācijas kļūda … permission-denied     |

---

## 8. Security notes

- Passwords live only in Firebase Auth, never in repo or README.
- Phase B enforces roles in **panel UI** only; open gallery/Storage rules still allow anonymous writes until Phase C.
- After Phase C, replace interim `users` rule with RBAC rules from `SECURITY_IMPLEMENTATION_PLAN.md` sections 8–9.
- Treat former hardcoded passwords (`admin123`, `vedman123`) as compromised; do not reuse.

---

## 9. Phase C — Deploy RBAC rules (Firestore + Storage)

**Prerequisites (Phase A–B validated):**

- [ ] Owner Auth login works on production
- [ ] `users/{ownerUid}` exists with `role: owner`, `isActive: true`
- [ ] Upload/delete tested with open rules

**Deploy steps:**

1. Open **`FIREBASE_RULES.txt`** in this repo — copy the **Firestore Rules** block (from `rules_version` through closing `}`).
2. Firebase Console → **Firestore Database** → **Rules** → paste → **Publish**.
3. Copy the **Storage Rules** block from the same file.
4. Firebase Console → **Storage** → **Rules** → paste → **Publish**.
5. Smoke test (see `VALIDATION_CHECKLIST.md` §5–11): owner upload/delete, editor upload without delete, public `index.html` gallery still loads.

**What changes:**

| Resource | Before (Phase B) | After (Phase C) |
|----------|------------------|-----------------|
| `gallery` read | public | public (unchanged) |
| `gallery` write | open | active owner/admin/editor only |
| `gallery` delete | open | active owner/admin only |
| Storage read | public | public (unchanged) |
| Storage write | open | active owner/admin/editor only |
| Storage delete | open | active owner/admin only |
| `users` | interim self-read | full RBAC (self-read + owner/admin manage) |

**Rollback:** restore open rules from git commit before Phase C, or see `SECURITY_IMPLEMENTATION_PLAN.md` §11.

---

## Quick checklist

- [ ] Email/Password enabled
- [ ] `vedman.lv` in authorized domains
- [ ] Owner Auth user created; UID copied
- [ ] `users/{uid}` with `role: owner`, `isActive: true`
- [ ] Interim `users` read rule published (Phase B)
- [ ] Panel login tested; upload/delete work for owner
- [ ] (Optional) Editor user tested — no delete UI
- [ ] Phase C RBAC rules deployed from `FIREBASE_RULES.txt`
- [ ] Post–Phase C smoke test passed
