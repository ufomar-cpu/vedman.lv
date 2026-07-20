/**
 * Firebase Storage persistence for VEDMAN Studio materials.
 * All writes pass through studio-validation.js (fail closed).
 */
import { ref, uploadBytes, getDownloadURL, getBytes, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirebaseStorage, canPublishInStudio, canDeleteMaterialImages } from "./firebase-auth.js";
import { IMAGE_ROLES } from "./media-pipeline.js";
import { dolomiteSeedMaterial, computeStatus } from "./material-model.js";
import {
  validateWrite,
  normalizeMaterialDraft,
  collectReferencedStoragePaths
} from "./studio-validation.js";
import {
  runPublishPipeline,
  rebuildManifestIndexes,
  buildSitemapXml
} from "./studio-publish-engine.js";

const MANIFEST_PATH = "studio/manifest.json";
const DRAFT_PREFIX = "studio/materials/";
const PUBLISHED_PREFIX = "studio/published/";
const LOCAL_KEY = "vedman_studio_materials_v1";

const uploadInflight = new Map();
const writeInflight = new Map();

function storage() {
  const s = getFirebaseStorage();
  if (!s) throw new Error("Firebase Storage nav pieejams.");
  return s;
}

function bucketName() {
  return window.VEDMAN_FIREBASE_CONFIG?.storageBucket || "vedman-lv.firebasestorage.app";
}

export function storagePublicUrl(path) {
  return "https://firebasestorage.googleapis.com/v0/b/" + bucketName() + "/o/" + encodeURIComponent(path) + "?alt=media";
}

async function uploadJson(path, data) {
  const blob = new Blob([JSON.stringify(data, null, 0)], { type: "application/json" });
  await uploadBytes(ref(storage(), path), blob, { contentType: "application/json" });
  return getDownloadURL(ref(storage(), path));
}

async function uploadText(path, text, contentType) {
  const blob = new Blob([text], { type: contentType });
  await uploadBytes(ref(storage(), path), blob, { contentType });
  return getDownloadURL(ref(storage(), path));
}

async function downloadJson(path) {
  try {
    const bytes = await getBytes(ref(storage(), path), 2 * 1024 * 1024);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    return null;
  }
}

async function listDraftMaterials() {
  try {
    const listing = await listAll(ref(storage(), DRAFT_PREFIX));
    const materials = [];
    for (const itemRef of listing.items) {
      if (!itemRef.name.endsWith(".json")) continue;
      const m = await downloadJson(DRAFT_PREFIX + itemRef.name);
      if (m) materials.push(m);
    }
    return materials;
  } catch (e) {
    return [];
  }
}

async function withWriteLock(key, fn) {
  if (writeInflight.get(key)) throw new Error("Cits ieraksts jau notiek. Uzgaidiet.");
  writeInflight.set(key, true);
  try {
    return await fn();
  } finally {
    writeInflight.delete(key);
  }
}

function localCacheRead() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function localCacheWrite(manifest, materials) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ manifest, materials, savedAt: new Date().toISOString() }));
  } catch (e) { /* quota */ }
}

function emptyManifest() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    materials: [],
    sitemap: [{ loc: "https://vedman.lv/", priority: 1 }],
    searchIndex: []
  };
}

export async function fetchPublishedPublic(urlSlug) {
  try {
    const res = await fetch(storagePublicUrl(PUBLISHED_PREFIX + urlSlug + ".json"), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchManifestPublic() {
  try {
    const res = await fetch(storagePublicUrl(MANIFEST_PATH), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function loadStudioData(forceRemote = false) {
  if (!forceRemote) {
    const cached = localCacheRead();
    if (cached?.materials?.length) {
      cached.materials.forEach((m) => { m._status = computeStatus(m); });
      return { manifest: cached.manifest, materials: cached.materials, fromCache: true };
    }
  }

  let manifest = await downloadJson(MANIFEST_PATH) || emptyManifest();
  let materials = await listDraftMaterials();

  if (!materials.length) {
    const seed = dolomiteSeedMaterial();
    seed.revision = 0;
    materials = [seed];
    await uploadJson(DRAFT_PREFIX + seed.id + ".json", seed);
    if (canPublishInStudio()) {
      manifest = rebuildManifestIndexes(emptyManifest(), materials);
      await uploadJson(MANIFEST_PATH, manifest);
    }
  }

  materials.forEach((m) => { m._status = computeStatus(m); });
  localCacheWrite(manifest, materials);
  return { manifest, materials, fromCache: false };
}

export async function saveMaterial(material, options = {}) {
  return withWriteLock("save:" + material.id, async () => {
    const manifest = options.manifest || (await loadStudioData()).manifest;
    let materials = options.materials || (await loadStudioData()).materials;

    const expectedRevision = options.expectedRevision ?? material.revision;
    const validation = validateWrite("save_draft", { material }, { materials, expectedRevision });
    if (!validation.ok) throw new Error(validation.errors.join(". "));

    const normalized = normalizeMaterialDraft(material);
    await uploadJson(DRAFT_PREFIX + normalized.id + ".json", normalized);

    const idx = materials.findIndex((m) => m.id === normalized.id);
    if (idx >= 0) materials[idx] = normalized;
    else materials.push(normalized);

    localCacheWrite(manifest, materials);
    return { manifest, materials, material: normalized };
  });
}

export async function publishMaterial(material, options = {}) {
  return withWriteLock("publish:" + material.id, async () => {
    const loaded = await loadStudioData(true);
    const ctx = {
      materials: loaded.materials,
      manifest: loaded.manifest,
      expectedRevision: options.expectedRevision ?? material.revision
    };

    return runPublishPipeline(material, ctx, {
      uploadJson,
      uploadText,
      downloadJson
    }).then((result) => {
      const materials = loaded.materials.map((m) =>
        m.id === result.material.id ? result.material : m
      );
      localCacheWrite(result.manifest, materials);
      return { ...result, materials };
    });
  });
}

export { buildSitemapXml };

export async function uploadMaterialImage(material, role, file, prepareImageUpload) {
  const inflightKey = material.id + ":" + role;
  if (uploadInflight.get(inflightKey)) throw new Error("Šīs lomas augšupielāde jau notiek");
  uploadInflight.set(inflightKey, true);

  try {
    const validation = validateWrite("upload_image", { material, role, file }, {});
    if (!validation.ok) throw new Error(validation.errors.join(". "));

    const prepared = await prepareImageUpload(file);
    const urlSlug = material.basic?.urlSlug || material.urlSlug;
    const filename = role + prepared.ext;
    const path = "materials/" + urlSlug + "/" + filename;
    const previousPath = material.images?.[role]?.storagePath;
    const previousUrl = material.images?.[role]?.url;

    if (previousUrl && material.images?.[role]?.fileFingerprint === `${file.name}:${file.size}:${file.lastModified}`) {
      throw new Error("Šis attēls jau ir augšupielādēts");
    }

    await uploadBytes(ref(storage(), path), prepared.blob, {
      contentType: prepared.mime,
      customMetadata: {
        role,
        urlSlug,
        webpReady: prepared.webpReady ? "true" : "false"
      }
    });

    const url = await getDownloadURL(ref(storage(), path));
    material.images = material.images || {};
    material.images[role] = {
      file: filename,
      available: true,
      alt: material.images[role]?.alt || (material.basic?.title + " — " + role),
      storagePath: path,
      url,
      fileFingerprint: `${file.name}:${file.size}:${file.lastModified}`
    };
    material.imageBase = url.replace(/\/[^/]+$/, "/");
    material.updatedAt = new Date().toISOString();

    const refs = collectReferencedStoragePaths(material);
    if (previousPath && previousPath !== path && !refs.has(previousPath) && canDeleteMaterialImages()) {
      try { await deleteObject(ref(storage(), previousPath)); } catch (e) { /* ignore */ }
    }

    return material.images[role];
  } finally {
    uploadInflight.delete(inflightKey);
  }
}

export async function deleteMaterialImage(material, role, options = { deleteStorage: true }) {
  const validation = validateWrite("delete_image", { material, role }, {});
  if (!validation.ok) throw new Error(validation.errors.join(". "));

  const oldPath = material.images?.[role]?.storagePath;
  material.images[role] = {
    file: role + ".webp",
    available: false,
    alt: material.images?.[role]?.alt || "",
    storagePath: null,
    url: null,
    fileFingerprint: null
  };
  material.updatedAt = new Date().toISOString();

  if (options.deleteStorage && oldPath) {
    if (!canDeleteMaterialImages()) {
      throw new Error("Nav tiesību dzēst attēlu no krātuves (tikai owner/admin).");
    }
    const refs = collectReferencedStoragePaths(material);
    if (!refs.has(oldPath)) {
      try { await deleteObject(ref(storage(), oldPath)); } catch (e) { /* ignore */ }
    }
  }
  return material;
}

export function setHeroRole(material, role) {
  if (!IMAGE_ROLES.includes(role)) throw new Error("Nederīga attēla loma");
  material.heroRole = role;
  material.updatedAt = new Date().toISOString();
  return material;
}

export function reorderGallery(material, order) {
  material.galleryOrder = order;
  material.updatedAt = new Date().toISOString();
  return material;
}

export async function deleteMaterial(id) {
  return withWriteLock("delete:" + id, async () => {
    const validation = validateWrite("delete_material", { id }, {});
    if (!validation.ok) throw new Error(validation.errors.join(". "));

    const { manifest, materials } = await loadStudioData(true);
    const target = materials.find((m) => m.id === id);
    if (!target) throw new Error("Materiāls nav atrasts");

    const next = materials.filter((m) => m.id !== id);

    try {
      await deleteObject(ref(storage(), DRAFT_PREFIX + id + ".json"));
    } catch (e) { /* ignore missing draft */ }

    if (target.publishedAt) {
      const slug = target.basic?.urlSlug || target.urlSlug;
      try {
        await deleteObject(ref(storage(), PUBLISHED_PREFIX + slug + ".json"));
      } catch (e) { /* ignore missing published */ }

      const nextManifest = rebuildManifestIndexes({ ...manifest }, next);
      const manifestCheck = validateWrite("manifest", { manifest: nextManifest }, { materials: next });
      if (!manifestCheck.ok) throw new Error(manifestCheck.errors.join(". "));

      await uploadJson(MANIFEST_PATH, nextManifest);
      await uploadText("studio/sitemap.xml", buildSitemapXml(nextManifest), "application/xml; charset=utf-8");
      localCacheWrite(nextManifest, next);
      return { manifest: nextManifest, materials: next };
    }

    localCacheWrite(manifest, next);
    return { manifest, materials: next };
  });
}
