/**
 * Shared Firebase Auth + Firestore RBAC for VEDMAN Panel and Studio.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const VALID_ROLES = ["owner", "admin", "editor"];
export const ROLE_LABELS = { owner: "Owner", admin: "Admin", editor: "Editor" };

let app = null;
let auth = null;
let storage = null;
let db = null;
let currentUserRole = null;
let readyCallbacks = [];

export function getFirebaseApp() { return app; }
export function getFirebaseAuth() { return auth; }
export function getFirebaseStorage() { return storage; }
export function getFirebaseDb() { return db; }
export function getCurrentUserRole() { return currentUserRole; }
export function canDeleteInPanel() { return currentUserRole === "owner" || currentUserRole === "admin"; }
export function canDeleteInStudio() { return canDeleteInPanel(); }
export function canDeleteMaterialImages() { return canDeleteInPanel(); }
export function canPublishInStudio() { return currentUserRole === "owner" || currentUserRole === "admin"; }

export async function ensureFirebaseApp() {
  if (app) return true;
  if (!window.VEDMAN_FIREBASE_READY || !window.VEDMAN_FIREBASE_CONFIG) return false;
  app = initializeApp(window.VEDMAN_FIREBASE_CONFIG);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  return true;
}

export function onStudioReady(cb) {
  if (currentUserRole) cb(currentUserRole);
  else readyCallbacks.push(cb);
}

function notifyReady(role) {
  readyCallbacks.forEach((cb) => {
    try { cb(role); } catch (e) { console.error(e); }
  });
  readyCallbacks = [];
}

export async function denyAccess(message) {
  currentUserRole = null;
  if (auth && auth.currentUser) {
    try { await signOut(auth); } catch (e) { /* ignore */ }
  }
  throw new Error(message || "Nav piekļuves.");
}

export async function resolveAuthorization(user) {
  if (!user) {
    currentUserRole = null;
    return null;
  }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    await denyAccess("Nav piekļuves. Lietotāja profils nav atrasts (users/" + user.uid + ").");
  }
  const data = snap.data();
  if (data.isActive !== true) {
    await denyAccess("Konts nav aktīvs. Sazinies ar administratoru.");
  }
  if (!VALID_ROLES.includes(data.role)) {
    await denyAccess("Nederīga loma. Atļautās: owner, admin, editor.");
  }
  currentUserRole = data.role;
  notifyReady(data.role);
  return data.role;
}

export async function loginWithEmail(email, password) {
  if (!await ensureFirebaseApp()) throw new Error("Firebase config nav gatavs.");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  if (auth) {
    try { await signOut(auth); } catch (e) { console.error(e); }
  }
  currentUserRole = null;
}

export function watchAuth(onUser, onError) {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) {
        currentUserRole = null;
        onUser(null, null);
        return;
      }
      const role = await resolveAuthorization(user);
      onUser(user, role);
    } catch (e) {
      onError(e);
      onUser(null, null);
    }
  });
}

export async function bootAuth(onUser, onError) {
  if (!await ensureFirebaseApp()) {
    onError(new Error("Firebase config nav gatavs. Pārbaudi firebase-config.js."));
    onUser(null, null);
    return () => {};
  }
  return watchAuth(onUser, onError);
}
