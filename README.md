# VEDMAN V4 Firebase Gallery Ready

## Admin panel

- **URL:** `/vedman-panel.html`
- **Auth:** Firebase Email/Password (no credentials in this repo)
- **Setup:** follow **`FIREBASE_USERS_BOOTSTRAP.md`** — create Auth users and Firestore `users/{uid}` documents with roles (`owner`, `admin`, `editor`)

### Roles (panel)

| Role    | Upload | Delete in panel |
|---------|:------:|:---------------:|
| owner   | ✓      | ✓               |
| admin   | ✓      | ✓               |
| editor  | ✓      | ✗               |

Full server-side RBAC (Firestore + Storage rules) is planned in Phase C — see `SECURITY_IMPLEMENTATION_PLAN.md`.

## Before first upload

1. Fill `firebase-config.js` with your Firebase Web App config.
2. Complete **`FIREBASE_USERS_BOOTSTRAP.md`** (Auth, `users` docs, interim Firestore rule for role lookup).
3. Keep Firestore/Storage rules from **`FIREBASE_RULES.txt`** until Phase C secure rules are deployed.
4. Open `/vedman-panel.html` and sign in with your Firebase user.

## Media

**Photos**

- JPG/PNG/WebP → WEBP, max 1600px, quality 80%.
- HEIC is unstable in browsers without extra libraries; on iPhone use Most Compatible or convert to JPG.

**Video**

- MOV/MP4 uploads to Firebase. Client browsers do not reliably compress video without server/FFmpeg.

## V4.0.1 fixes

- `firebase-config.js` filled with VEDMAN-LV project values.
- `index.html` gallery load runs after Firebase module init.
- Footer logo switched to `vedman-logo.png`.
- `vedman-logo-footer.png` no longer required.
