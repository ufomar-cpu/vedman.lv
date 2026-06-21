# VEDMAN V4 Firebase Gallery Ready

Admin:
- URL: /vedman-panel.html
- Lietotājs: admin
- Parole: vedman2026

Pirms upload strādā:
1. Aizpildi `firebase-config.js` ar Firebase Web App config.
2. Firebase Console → Firestore Rules un Storage Rules ieliec noteikumus no `FIREBASE_RULES.txt`.
3. Atver /vedman-panel.html.
4. Upload foto/video.

Foto:
- JPG/PNG/WebP → WEBP, max 1600px, kvalitāte 80%.
- HEIC pārlūkos nav stabils bez papildbibliotēkas; iPhone iestatījumos izvēlies Most Compatible vai konvertē uz JPG.

Video:
- MOV/MP4 tiek augšupielādēts Firebase. Klienta pārlūks video droši nesaspiež bez servera/FFmpeg.
