# Phase B validation checklist

Manual validation for Firebase Auth + RBAC panel (Phase A–B).

**Do not deploy Phase C secure rules during this checklist** — gallery and Storage rules should remain open per `FIREBASE_RULES.txt` plus the interim `users` read rule from `FIREBASE_USERS_BOOTSTRAP.md`.

---

## Run metadata

| Field | Value |
|-------|-------|
| Date | |
| Tester | |
| Branch / commit | `v5-dev` / `0f0f5c5` |
| Site URL tested | e.g. `https://vedman.lv` or local server |
| Firebase project | `vedman-lv` |
| Panel URL | `/vedman-panel.html` |
| Public gallery URL | `/index.html` |

---

## 1. Firebase Console setup

### 1.1 Project access

**Steps**

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select project **vedman-lv**.
3. Confirm you can access Authentication, Firestore, and Storage.

**Expected result**

- Project loads without errors.
- All three services are visible under **Build**.

**Pass / Fail:** [ ]

---

### 1.2 `firebase-config.js` matches project

**Steps**

1. Open deployed or local `firebase-config.js`.
2. Compare `projectId`, `authDomain`, and `storageBucket` with Firebase Console → Project settings → Your apps.

**Expected result**

- Values match the **vedman-lv** web app config.
- `VEDMAN_FIREBASE_READY` is `true`.

**Pass / Fail:** [ ]

---

### 1.3 Authorized domains

**Steps**

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**.
2. Verify presence of: `localhost`, `vedman-lv.firebaseapp.com`, `vedman-lv.web.app`, `vedman.lv`.

**Expected result**

- All domains required for your test environment are listed.
- No sign-in blocked by “unauthorized domain” on production URL.

**Pass / Fail:** [ ]

---

### 1.4 Site deployed with Phase B commit

**Steps**

1. Confirm the environment serves commit `0f0f5c5` (or later Phase B commit).
2. Open `/vedman-panel.html` source or network tab — confirm Firebase Auth module loads (`firebase-auth.js`).

**Expected result**

- Panel shows email/password login (not username `admin` hardcoded gate).
- No `sessionStorage.vedmanAdmin` bypass in page source.

**Pass / Fail:** [ ]

---

## 2. Authentication

### 2.1 Email/Password provider enabled

**Steps**

1. Firebase Console → **Authentication** → **Sign-in method**.
2. Check **Email/Password** status.

**Expected result**

- Email/Password is **Enabled**.

**Pass / Fail:** [ ]

---

### 2.2 Owner Auth user exists

**Steps**

1. **Authentication** → **Users**.
2. Locate the owner test account (e.g. `owner@vedman.lv`).
3. Copy **User UID** for Firestore checks.

**Expected result**

- Owner user exists with a valid UID.
- UID is recorded in run metadata or a secure note (not in git).

**Pass / Fail:** [ ]

---

### 2.3 Admin test user exists (optional but recommended)

**Steps**

1. Create Auth user for admin testing (Console → **Add user**).
2. Note email and UID.

**Expected result**

- Admin Auth user exists for permission tests in §11.

**Pass / Fail:** [ ]  *(N/A if skipped)*

---

### 2.4 Editor test user exists (optional but recommended)

**Steps**

1. Create Auth user for editor testing.
2. Note email and UID.

**Expected result**

- Editor Auth user exists for permission tests in §9.

**Pass / Fail:** [ ]  *(N/A if skipped)*

---

## 3. Firestore users collection

### 3.1 Owner `users/{uid}` document

**Steps**

1. Firestore → **Data** → collection **`users`**.
2. Open document with ID = owner Auth UID.
3. Verify fields.

**Expected result**

| Field | Expected |
|-------|----------|
| `role` | `owner` (string) |
| `isActive` | `true` (boolean) |

**Pass / Fail:** [ ]

---

### 3.2 Admin `users/{uid}` document

**Steps**

1. Open `users/{adminUid}` in Firestore.
2. Verify fields.

**Expected result**

- `role`: `admin`
- `isActive`: `true`

**Pass / Fail:** [ ]  *(N/A if skipped)*

---

### 3.3 Editor `users/{uid}` document

**Steps**

1. Open `users/{editorUid}` in Firestore.
2. Verify fields.

**Expected result**

- `role`: `editor`
- `isActive`: `true`

**Pass / Fail:** [ ]  *(N/A if skipped)*

---

### 3.4 Interim Firestore rules (users read + open gallery)

**Steps**

1. Firestore → **Rules**.
2. Confirm `users/{userId}` block allows read when `request.auth.uid == userId`.
3. Confirm `users` writes are denied (`allow write: if false`).
4. Confirm `gallery` rules still allow open read/write (Phase B).

**Expected result**

- Interim `users` read rule is published.
- `gallery` remains open read/write per Phase B.

**Pass / Fail:** [ ]

---

## 4. Storage

### 4.1 Storage rules (Phase B — open)

**Steps**

1. Firebase Console → **Storage** → **Rules**.
2. Compare with `FIREBASE_RULES.txt` Storage section.

**Expected result**

- Read and write allowed for all paths (open rules until Phase C).

**Pass / Fail:** [ ]

---

### 4.2 Storage bucket reachable

**Steps**

1. Storage → **Files**.
2. Confirm bucket `vedman-lv.firebasestorage.app` (or configured bucket) loads.
3. Note existing gallery folders if any (e.g. `grants/`, `video/`).

**Expected result**

- Storage console accessible; no permission errors for operator.

**Pass / Fail:** [ ]

---

### 4.3 Upload path convention

**Steps**

1. After an upload test (§7), open Storage **Files**.
2. Locate the new object.

**Expected result**

- File path follows `{category}/{filename}` (e.g. `grants/vedman-123456.webp`).

**Pass / Fail:** [ ]

---

## 5. Login

### 5.1 Owner login — happy path

**Steps**

1. Open `/vedman-panel.html` in a fresh private/incognito window.
2. Enter owner email and correct password.
3. Click **Ieiet**.

**Expected result**

- Login form hides; panel (`#app`) appears.
- Role badge shows **Owner**.
- Status: “Firebase savienots (Owner). Var augšupielādēt.”
- Gallery list loads (or shows “Vēl nav ierakstu.”).

**Pass / Fail:** [ ]

---

### 5.2 Wrong password

**Steps**

1. Open fresh login session.
2. Enter valid owner email + incorrect password.
3. Click **Ieiet**.

**Expected result**

- Error: **Nepareizs e-pasts vai parole.**
- Panel stays hidden; user remains logged out.

**Pass / Fail:** [ ]

---

### 5.3 Empty fields

**Steps**

1. Leave email or password empty.
2. Click **Ieiet**.

**Expected result**

- Error: **Ievadi e-pastu un paroli.**
- No panel access.

**Pass / Fail:** [ ]

---

### 5.4 Auth user without Firestore profile

**Steps**

1. Create Auth user in Console **without** `users/{uid}` document.
2. Sign in on panel with that account.

**Expected result**

- User is signed out automatically.
- Error mentions missing profile / **Lietotāja profils nav atrasts**.

**Pass / Fail:** [ ]

---

### 5.5 Inactive user (`isActive: false`)

**Steps**

1. Set a test user’s `isActive` to `false` in Firestore.
2. Sign in on panel.
3. Restore `isActive: true` after test.

**Expected result**

- Error: **Konts nav aktīvs. Sazinies ar administratoru.**
- User signed out; panel not shown.

**Pass / Fail:** [ ]

---

### 5.6 Invalid role

**Steps**

1. Set a test user’s `role` to `viewer` (or any value outside owner/admin/editor).
2. Sign in on panel.
3. Restore valid role after test.

**Expected result**

- Error: **Nederīga loma. Atļautās: owner, admin, editor.**
- User signed out; panel not shown.

**Pass / Fail:** [ ]

---

### 5.7 Persisted session on page reload

**Steps**

1. Sign in successfully as owner.
2. Reload the page (F5 / pull-to-refresh).

**Expected result**

- User remains authenticated; panel reappears after role check.
- No return to login form unless session expired or denied.

**Pass / Fail:** [ ]

---

## 6. Logout

### 6.1 Logout via **Iziet**

**Steps**

1. Sign in as owner.
2. Click **Iziet**.

**Expected result**

- Login form visible; panel hidden.
- Role badge hidden.
- No error message shown (unless you intentionally left one).

**Pass / Fail:** [ ]

---

### 6.2 Post-logout access blocked

**Steps**

1. After logout, attempt to use browser Back or manually show `#app` via DevTools.
2. Try clicking **Augšupielādēt Firebase** if upload UI is visible.

**Expected result**

- Without active Auth session, upload should not succeed (`firebaseOK` false or Auth required).
- Normal users cannot operate panel after logout without signing in again.

**Pass / Fail:** [ ]

---

### 6.3 Re-login after logout

**Steps**

1. Log out.
2. Sign in again with valid owner credentials.

**Expected result**

- Full panel access restored; role badge and gallery list work.

**Pass / Fail:** [ ]

---

## 7. Upload

### 7.1 Single JPG upload

**Steps**

1. Sign in as owner.
2. Select category (e.g. **Grants**).
3. Enter title and description.
4. Choose one JPG file.
5. Click **Augšupielādēt Firebase**.

**Expected result**

- Progress bar advances; success message **Augšupielāde pabeigta.**
- New item appears in panel list.
- Firestore `gallery` collection has new document.
- Storage contains file under `{category}/`.

**Pass / Fail:** [ ]

---

### 7.2 WEBP compression (JPG/PNG)

**Steps**

1. Upload a JPG or PNG larger than 1600px wide.
2. Inspect Storage object metadata/type.

**Expected result**

- Stored as `.webp` with `image/webp` content type.
- Dimensions reduced to max 1600px width.

**Pass / Fail:** [ ]

---

### 7.3 Video upload (MP4 or MOV)

**Steps**

1. Select category **Video** (or any).
2. Upload a small MP4 or MOV.
3. Wait for completion.

**Expected result**

- Upload succeeds; item shows video preview in list.
- Firestore doc has video `type` and playable `url`.

**Pass / Fail:** [ ]

---

### 7.4 Upload without selected files

**Steps**

1. Sign in as owner.
2. Click **Augšupielādēt Firebase** without choosing files.

**Expected result**

- Error: **Izvēlies vismaz vienu failu.**

**Pass / Fail:** [ ]

---

### 7.5 Public gallery reflects upload

**Steps**

1. After successful upload, open `/index.html` (logged out).
2. Find the new item in the public gallery.

**Expected result**

- New upload visible on public site (may require category filter or scroll).
- No auth prompt on public page.

**Pass / Fail:** [ ]

---

## 8. Delete

### 8.1 Owner delete from panel

**Steps**

1. Sign in as owner.
2. Click **Dzēst** on a test item you uploaded.
3. Confirm the dialog.

**Expected result**

- Item removed from panel list.
- Firestore `gallery` document deleted.
- Storage object removed (or delete attempted — check Storage console).

**Pass / Fail:** [ ]

---

### 8.2 Delete confirmation cancelled

**Steps**

1. Click **Dzēst** on an item.
2. Cancel the confirm dialog.

**Expected result**

- Item remains in list; no data deleted.

**Pass / Fail:** [ ]

---

### 8.3 Public gallery after delete

**Steps**

1. After deleting an item, refresh `/index.html`.

**Expected result**

- Deleted item no longer appears on public gallery.

**Pass / Fail:** [ ]

---

## 9. Editor permissions

### 9.1 Editor login and role badge

**Steps**

1. Sign in with editor account.

**Expected result**

- Panel visible; role badge **Editor**.
- Status mentions **Editor**.

**Pass / Fail:** [ ]

---

### 9.2 Editor can upload

**Steps**

1. As editor, upload one test image.

**Expected result**

- Upload succeeds same as owner/admin.

**Pass / Fail:** [ ]

---

### 9.3 Editor cannot delete (UI)

**Steps**

1. As editor, view gallery list in panel.

**Expected result**

- No **Dzēst** button on items.
- Text shown: **Dzēšana nav pieejama (editor).**

**Pass / Fail:** [ ]

---

### 9.4 Editor refresh list

**Steps**

1. As editor, click **Atjaunot sarakstu**.

**Expected result**

- List reloads without errors.

**Pass / Fail:** [ ]

---

## 10. Owner permissions

### 10.1 Owner full upload access

**Steps**

1. Sign in as owner.
2. Verify upload form, category select, file input, and **Augšupielādēt Firebase** are usable.

**Expected result**

- All upload controls enabled and functional.

**Pass / Fail:** [ ]

---

### 10.2 Owner delete access

**Steps**

1. As owner, confirm **Dzēst** buttons appear on list items.

**Expected result**

- Delete buttons visible and functional (§8).

**Pass / Fail:** [ ]

---

### 10.3 Owner navigation

**Steps**

1. As owner, click **Atpakaļ uz lapu**.

**Expected result**

- Navigates to `/index.html` without breaking Auth session (session may persist in background — acceptable).

**Pass / Fail:** [ ]

---

## 11. Admin permissions

### 11.1 Admin login and role badge

**Steps**

1. Sign in with admin account.

**Expected result**

- Panel visible; role badge **Admin**.

**Pass / Fail:** [ ]  *(N/A if no admin user)*

---

### 11.2 Admin upload

**Steps**

1. As admin, upload one test file.

**Expected result**

- Upload succeeds.

**Pass / Fail:** [ ]  *(N/A if no admin user)*

---

### 11.3 Admin delete

**Steps**

1. As admin, delete a test item.

**Expected result**

- **Dzēst** visible; delete succeeds.

**Pass / Fail:** [ ]  *(N/A if no admin user)*

---

## 12. Mobile

### 12.1 Login on mobile

**Steps**

1. Open `/vedman-panel.html` on a phone (or DevTools device mode with touch).
2. Sign in with owner credentials.

**Expected result**

- Login form readable; inputs do not trigger unwanted zoom (16px font).
- **Ieiet** tappable; panel loads.

**Pass / Fail:** [ ]

---

### 12.2 Mobile upload via file picker

**Steps**

1. On mobile, tap file input and choose a photo from gallery/camera roll.
2. Upload.

**Expected result**

- File picker opens; upload completes.

**Pass / Fail:** [ ]

---

### 12.3 Mobile layout

**Steps**

1. View panel on viewport ≤ 720px width.
2. Scroll upload form, list, and top bar.

**Expected result**

- Single-column grid/list; top bar wraps; buttons remain tappable (≥ 44px height).

**Pass / Fail:** [ ]

---

### 12.4 Mobile logout

**Steps**

1. On mobile, tap **Iziet**.

**Expected result**

- Returns to login screen.

**Pass / Fail:** [ ]

---

## 13. Safari

### 13.1 Safari login (macOS or iOS)

**Steps**

1. Open `/vedman-panel.html` in Safari.
2. Sign in as owner.

**Expected result**

- Auth and role gate succeed; panel loads.

**Pass / Fail:** [ ]

---

### 13.2 Safari JPG upload + WEBP

**Steps**

1. In Safari, upload a JPG.

**Expected result**

- Upload succeeds; WEBP stored (Safari 14+).

**Pass / Fail:** [ ]

---

### 13.3 Safari video preview in list

**Steps**

1. Upload or view a video item in panel list in Safari.

**Expected result**

- Video element renders with controls.

**Pass / Fail:** [ ]

---

### 13.4 Safari private mode

**Steps**

1. Open panel in Safari Private Browsing window.
2. Sign in and upload one small file.

**Expected result**

- Login and upload work (Auth persistence may differ — session may not survive tab close; acceptable).

**Pass / Fail:** [ ]

---

## 14. Chrome

### 14.1 Chrome login

**Steps**

1. Open `/vedman-panel.html` in Chrome (desktop).
2. Sign in as owner.

**Expected result**

- Panel loads with role badge and gallery list.

**Pass / Fail:** [ ]

---

### 14.2 Chrome upload and delete

**Steps**

1. Upload one JPG; delete it.

**Expected result**

- Upload and delete complete without console errors.

**Pass / Fail:** [ ]

---

### 14.3 Chrome DevTools — no hardcoded credentials

**Steps**

1. View page source and Sources tab for `vedman-panel.html`.

**Expected result**

- No `ADMIN_USER`, `ADMIN_PASS`, or `sessionStorage.vedmanAdmin`.

**Pass / Fail:** [ ]

---

## 15. Error handling

### 15.1 Missing Firebase config (optional — staging only)

**Steps**

1. On a test copy only, set `VEDMAN_FIREBASE_READY = false` or break config.
2. Load panel.

**Expected result**

- Login error: config not ready message.
- Panel not accessible.

**Pass / Fail:** [ ]  *(N/A on production)*

---

### 15.2 Missing interim `users` rule (optional — staging only)

**Steps**

1. Temporarily remove `users` read rule in Firestore (staging).
2. Sign in with valid owner.
3. Restore rule after test.

**Expected result**

- Authorization error mentioning permission / bootstrap doc.
- User signed out.

**Pass / Fail:** [ ]  *(N/A if not tested)*

---

### 15.3 Upload error surfaced

**Steps**

1. Simulate failure if possible (e.g. disconnect network mid-upload) OR inspect behavior when Storage rejects.

**Expected result**

- Error message shown in panel (`#errMsg`); page does not crash.

**Pass / Fail:** [ ]  *(N/A if not simulated)*

---

### 15.4 Wrong password does not reveal account existence

**Steps**

1. Enter non-existent email + any password.
2. Enter valid email + wrong password.

**Expected result**

- Same generic message: **Nepareizs e-pasts vai parole.**

**Pass / Fail:** [ ]

---

## 16. Offline mode

### 16.1 Login while offline

**Steps**

1. Disable network (airplane mode / DevTools offline).
2. Attempt login with valid credentials.

**Expected result**

- Login fails with generic credential error or network failure.
- Panel not shown.

**Pass / Fail:** [ ]

---

### 16.2 Persisted session while offline at page load

**Steps**

1. Sign in while online.
2. Reload page, then go offline before/during load (or reload while offline).

**Expected result**

- Role `getDoc` may fail; user signed out with authorization error (fail-closed).
- Document observed behavior; note in sign-off.

**Pass / Fail:** [ ]

---

### 16.3 Upload while offline

**Steps**

1. Sign in while online and reach panel.
2. Go offline.
3. Attempt upload.

**Expected result**

- Upload fails; error message shown in panel.
- No silent success.

**Pass / Fail:** [ ]

---

### 16.4 Public gallery offline

**Steps**

1. Open `/index.html` while offline (after prior online visit).

**Expected result**

- Gallery may show cached/empty/fallback state per browser — document what you see.
- No admin login required on public page.

**Pass / Fail:** [ ]

---

## Sign-off

| Section | Pass | Fail | N/A | Notes |
|---------|:----:|:----:|:---:|-------|
| 1. Firebase Console setup | | | | |
| 2. Authentication | | | | |
| 3. Firestore users collection | | | | |
| 4. Storage | | | | |
| 5. Login | | | | |
| 6. Logout | | | | |
| 7. Upload | | | | |
| 8. Delete | | | | |
| 9. Editor permissions | | | | |
| 10. Owner permissions | | | | |
| 11. Admin permissions | | | | |
| 12. Mobile | | | | |
| 13. Safari | | | | |
| 14. Chrome | | | | |
| 15. Error handling | | | | |
| 16. Offline mode | | | | |

**Overall Phase B validation:** [ ] Pass  [ ] Fail  

**Blockers (if any):**

---

**Validated by:** ____________________  
**Date:** ____________________  

*Awaiting manual validation.*
