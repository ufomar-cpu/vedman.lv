# VEDMAN V4 Firebase Gallery Ready

Admin:
- URL: /vedman-panel.html
- Lietotājs: admin
- Parole: admin123

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


V4.0.1 labojumi:
- firebase-config.js aizpildīts ar VEDMAN-LV projekta vērtībām.
- index.html Firebase galerijas ielāde palaista pēc Firebase moduļa inicializācijas.
- footer logo pārslēgts uz vedman-logo.png.
- vedman-logo-footer.png vairs nav vajadzīgs.
