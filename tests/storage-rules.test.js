/**
 * @firebase/rules-unit-testing — VEDMAN Studio Storage candidate rules.
 * Run: npm run test:storage
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from "@firebase/rules-unit-testing";
import {
  ref,
  uploadBytes,
  uploadString,
  getBytes,
  listAll,
  deleteObject
} from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = "vedman-lv-test";
const BUCKET = `${PROJECT_ID}.appspot.com`;

const storageRules = readFileSync(resolve(__dirname, "../storage.rules"), "utf8");
const firestoreRules = readFileSync(resolve(__dirname, "../firestore.emulator.rules"), "utf8");

const USERS = {
  owner: { uid: "uid-owner", role: "owner" },
  admin: { uid: "uid-admin", role: "admin" },
  editor: { uid: "uid-editor", role: "editor" },
  unknown: { uid: "uid-unknown", role: "guest" },
  inactive: { uid: "uid-inactive", role: "owner", isActive: false }
};

let pass = 0;
let fail = 0;

function track(name, fn) {
  return async () => {
    try {
      await fn();
      pass += 1;
    } catch (e) {
      fail += 1;
      console.error("FAIL:", name, e.message || e);
    }
  };
}

function jsonBlob(data, size) {
  const body = JSON.stringify(data);
  if (size && body.length < size) {
    return new Blob(["x".repeat(size)], { type: "application/json" });
  }
  return new Blob([body], { type: "application/json" });
}

async function seedUsers(firestore) {
  for (const [key, u] of Object.entries(USERS)) {
    await setDoc(doc(firestore, "users", u.uid), {
      role: u.role,
      isActive: u.isActive !== false
    });
  }
}

async function setupEnv() {
  const env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules, host: "127.0.0.1", port: 8080 },
    storage: { rules: storageRules, host: "127.0.0.1", port: 9199 }
  });

  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await seedUsers(db);

    const storage = ctx.storage();
    await uploadString(ref(storage, "studio/published/demo-slug.json"), "{}", "raw", {
      contentType: "application/json"
    });
    await uploadString(ref(storage, "studio/manifest.json"), "{}", "raw", {
      contentType: "application/json"
    });
    await uploadString(ref(storage, "studio/sitemap.xml"), "<urlset></urlset>", "raw", {
      contentType: "application/xml; charset=utf-8"
    });
    await uploadString(ref(storage, "materials/demo-slug/hero.webp"), "fake", "raw", {
      contentType: "image/webp"
    });
    await uploadString(ref(storage, "skembas/vedman-1.webp"), "fake", "raw", {
      contentType: "image/webp"
    });
  });

  return env;
}

async function runTests(env) {
  const anon = env.unauthenticatedContext();
  const anonStorage = anon.storage();

  const editorCtx = env.authenticatedContext(USERS.editor.uid, { email: "editor@test.lv" });
  const editorStorage = editorCtx.storage();

  const adminCtx = env.authenticatedContext(USERS.admin.uid, { email: "admin@test.lv" });
  const adminStorage = adminCtx.storage();

  const ownerCtx = env.authenticatedContext(USERS.owner.uid, { email: "owner@test.lv" });
  const ownerStorage = ownerCtx.storage();

  const unknownCtx = env.authenticatedContext(USERS.unknown.uid, { email: "bad@test.lv" });
  const unknownStorage = unknownCtx.storage();

  const inactiveCtx = env.authenticatedContext(USERS.inactive.uid, { email: "inactive@test.lv" });
  const inactiveStorage = inactiveCtx.storage();

  const missingCtx = env.authenticatedContext("uid-missing", { email: "missing@test.lv" });
  const missingStorage = missingCtx.storage();

  // ANONYMOUS
  await track("anon: draft read denied", () =>
    assertFails(getBytes(ref(anonStorage, "studio/materials/mat-1.json")))
  )();

  await track("anon: draft list denied", () =>
    assertFails(listAll(ref(anonStorage, "studio/materials/")))
  )();

  await track("anon: published JSON read allowed", () =>
    assertSucceeds(getBytes(ref(anonStorage, "studio/published/demo-slug.json")))
  )();

  await track("anon: manifest read allowed", () =>
    assertSucceeds(getBytes(ref(anonStorage, "studio/manifest.json")))
  )();

  await track("anon: sitemap read allowed", () =>
    assertSucceeds(getBytes(ref(anonStorage, "studio/sitemap.xml")))
  )();

  await track("anon: public image read allowed", () =>
    assertSucceeds(getBytes(ref(anonStorage, "materials/demo-slug/hero.webp")))
  )();

  await track("anon: write denied", () =>
    assertFails(uploadBytes(ref(anonStorage, "studio/materials/x.json"), jsonBlob({}), { contentType: "application/json" }))
  )();

  // EDITOR
  await track("editor: draft list allowed", () =>
    assertSucceeds(listAll(ref(editorStorage, "studio/materials/")))
  )();

  await track("editor: draft read allowed", () =>
    assertSucceeds(getBytes(ref(editorStorage, "studio/materials/mat-1.json")).catch(async () => {
      await assertSucceeds(uploadBytes(ref(editorStorage, "studio/materials/mat-1.json"), jsonBlob({ id: "mat-1" }), { contentType: "application/json" }));
      return getBytes(ref(editorStorage, "studio/materials/mat-1.json"));
    }))
  )();

  await track("editor: draft write allowed", () =>
    assertSucceeds(uploadBytes(ref(editorStorage, "studio/materials/mat-2.json"), jsonBlob({ id: "mat-2" }), { contentType: "application/json" }))
  )();

  await track("editor: draft delete denied", () =>
    assertFails(deleteObject(ref(editorStorage, "studio/materials/mat-2.json")))
  )();

  await track("editor: image upload allowed", () =>
    assertSucceeds(uploadBytes(ref(editorStorage, "materials/demo-slug/closeup.webp"), new Blob(["x"], { type: "image/webp" }), { contentType: "image/webp" }))
  )();

  await track("editor: image delete denied", () =>
    assertFails(deleteObject(ref(editorStorage, "materials/demo-slug/hero.webp")))
  )();

  await track("editor: publish JSON denied", () =>
    assertFails(uploadBytes(ref(editorStorage, "studio/published/new-slug.json"), jsonBlob({}), { contentType: "application/json" }))
  )();

  await track("editor: manifest write denied", () =>
    assertFails(uploadBytes(ref(editorStorage, "studio/manifest.json"), jsonBlob({ materials: [] }), { contentType: "application/json" }))
  )();

  await track("editor: sitemap write denied", () =>
    assertFails(uploadBytes(ref(editorStorage, "studio/sitemap.xml"), new Blob(["<x/>"], { type: "application/xml" }), { contentType: "application/xml" }))
  )();

  // ADMIN
  await track("admin: draft delete allowed", async () => {
    await uploadBytes(ref(adminStorage, "studio/materials/admin-del.json"), jsonBlob({}), { contentType: "application/json" });
    await assertSucceeds(deleteObject(ref(adminStorage, "studio/materials/admin-del.json")));
  })();

  await track("admin: published JSON write allowed", () =>
    assertSucceeds(uploadBytes(ref(adminStorage, "studio/published/admin-slug.json"), jsonBlob({ urlSlug: "admin-slug", title: "T" }), { contentType: "application/json" }))
  )();

  await track("admin: published JSON delete allowed", () =>
    assertSucceeds(deleteObject(ref(adminStorage, "studio/published/admin-slug.json")))
  )();

  await track("admin: manifest write allowed", () =>
    assertSucceeds(uploadBytes(ref(adminStorage, "studio/manifest.json"), jsonBlob({ materials: [], version: 1 }), { contentType: "application/json" }))
  )();

  await track("admin: manifest delete denied", () =>
    assertFails(deleteObject(ref(adminStorage, "studio/manifest.json")))
  )();

  await track("admin: sitemap write allowed", () =>
    assertSucceeds(uploadBytes(ref(adminStorage, "studio/sitemap.xml"), new Blob(["<?xml version=\"1.0\"?><urlset></urlset>"], { type: "application/xml" }), { contentType: "application/xml" }))
  )();

  await track("admin: image delete allowed", () =>
    assertSucceeds(deleteObject(ref(adminStorage, "materials/demo-slug/closeup.webp")))
  )();

  // OWNER
  await track("owner: manifest delete allowed", () =>
    assertSucceeds(deleteObject(ref(ownerStorage, "studio/manifest.json")).catch(async () => {
      await uploadBytes(ref(ownerStorage, "studio/manifest.json"), jsonBlob({ materials: [] }), { contentType: "application/json" });
      return deleteObject(ref(ownerStorage, "studio/manifest.json"));
    }))
  )();

  await track("owner: sitemap delete allowed", () =>
    assertSucceeds(deleteObject(ref(ownerStorage, "studio/sitemap.xml")).catch(async () => {
      await uploadBytes(ref(ownerStorage, "studio/sitemap.xml"), new Blob(["<urlset></urlset>"], { type: "application/xml" }), { contentType: "application/xml" });
      return deleteObject(ref(ownerStorage, "studio/sitemap.xml"));
    }))
  )();

  // INVALID
  await track("invalid: SVG denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "materials/demo-slug/hero.webp"), new Blob(["<svg>"], { type: "image/svg+xml" }), { contentType: "image/svg+xml" }))
  )();

  await track("invalid: HTML denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "materials/demo-slug/hero.webp"), new Blob(["<html>"], { type: "text/html" }), { contentType: "text/html" }))
  )();

  await track("invalid: JS denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "materials/demo-slug/hero.webp"), new Blob(["alert(1)"], { type: "application/javascript" }), { contentType: "application/javascript" }))
  )();

  await track("invalid: oversized JSON denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "studio/published/big.json"), jsonBlob({}, 600000), { contentType: "application/json" }))
  )();

  await track("invalid: oversized image denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "materials/demo-slug/hero.webp"), new Blob([new Uint8Array(11 * 1024 * 1024)], { type: "image/webp" }), { contentType: "image/webp" }))
  )();

  await track("invalid: bad slug denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "studio/published/BAD_SLUG.json"), jsonBlob({}), { contentType: "application/json" }))
  )();

  await track("invalid: bad filename denied", () =>
    assertFails(uploadBytes(ref(adminStorage, "materials/demo-slug/evil.js"), new Blob(["x"], { type: "image/jpeg" }), { contentType: "image/jpeg" }))
  )();

  await track("invalid: unknown role denied", () =>
    assertFails(uploadBytes(ref(unknownStorage, "studio/materials/x.json"), jsonBlob({}), { contentType: "application/json" }))
  )();

  await track("invalid: inactive user denied", () =>
    assertFails(uploadBytes(ref(inactiveStorage, "studio/materials/x.json"), jsonBlob({}), { contentType: "application/json" }))
  )();

  await track("invalid: missing user doc denied", () =>
    assertFails(uploadBytes(ref(missingStorage, "studio/materials/x.json"), jsonBlob({}), { contentType: "application/json" }))
  )();
}

const env = await setupEnv();
try {
  await runTests(env);
} finally {
  await env.cleanup();
}

console.log(`\nStorage rules tests: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) process.exit(1);
