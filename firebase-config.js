window.VEDMAN_FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "vedman-lv.firebaseapp.com",
  projectId: "vedman-lv",
  storageBucket: "vedman-lv.firebasestorage.app",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_APP_ID_HERE"
};

window.VEDMAN_FIREBASE_READY =
  window.VEDMAN_FIREBASE_CONFIG.apiKey &&
  !window.VEDMAN_FIREBASE_CONFIG.apiKey.includes("PASTE_") &&
  window.VEDMAN_FIREBASE_CONFIG.appId &&
  !window.VEDMAN_FIREBASE_CONFIG.appId.includes("PASTE_");
