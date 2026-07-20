/**
 * Transaction-style publish pipeline for VEDMAN Studio.
 * Fail closed — never marks published until all steps succeed.
 */
import { ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirebaseStorage } from "./firebase-auth.js";
import {
  validateWrite,
  normalizeMaterialDraft,
  buildPublicPassportPayload,
  verifyPublicPassportPayload,
  resolveRelatedLinks
} from "./studio-validation.js";
import { buildSearchText, computeStatus } from "./material-model.js";
import { sanitizePublishedImages } from "./dom-safe.js";
import { isValidPublicSlug, publicMaterialUrl, PUBLIC_ROUTE_STRATEGY } from "./studio-route-config.js";

const MANIFEST_PATH = "studio/manifest.json";
const DRAFT_PREFIX = "studio/materials/";
const PUBLISHED_PREFIX = "studio/published/";

function storage() {
  const s = getFirebaseStorage();
  if (!s) throw new Error("Firebase Storage nav pieejams.");
  return s;
}

async function uploadJson(path, data, uploadJsonFn) {
  await uploadJsonFn(path, data);
}

async function downloadJson(path, downloadJsonFn) {
  return downloadJsonFn(path);
}

async function tryDeletePath(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage(), path));
  } catch (e) { /* ignore missing */ }
}

function manifestEntry(material) {
  const status = computeStatus(material);
  const hero = material.images?.[material.heroRole || "hero"];
  return {
    id: material.id,
    urlSlug: material.basic?.urlSlug || material.urlSlug,
    title: material.basic?.title || "",
    fraction: material.basic?.fraction || "",
    status,
    publishedAt: material.publishedAt || null,
    updatedAt: material.updatedAt,
    heroUrl: hero?.url || null
  };
}

export function rebuildManifestIndexes(manifest, materials) {
  manifest.materials = materials.filter((m) => m.publishedAt).map(manifestEntry);
  manifest.updatedAt = new Date().toISOString();
  manifest.version = Number(manifest.version || 0) + 1;
  manifest.sitemap = [{ loc: "https://vedman.lv/", priority: 1 }];
  manifest.searchIndex = [];
  materials.forEach((m) => {
    if (!m.publishedAt) return;
    const slug = m.basic?.urlSlug || m.urlSlug;
    manifest.sitemap.push({ loc: "https://vedman.lv/materiali/" + slug + "/", priority: 0.8 });
    manifest.searchIndex.push({ urlSlug: slug, title: m.basic?.title || "", text: buildSearchText(m) });
  });
  return manifest;
}

export function buildSitemapXml(manifest) {
  const urls = (manifest.sitemap || []).map((u) => "<url><loc>" + u.loc + "</loc></url>").join("");
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + "</urlset>";
}

export async function runPublishPipeline(material, ctx, io) {
  const rollback = [];
  const draftSnapshot = JSON.parse(JSON.stringify(material));
  draftSnapshot.publishedAt = material.publishedAt || null;

  try {
    // 1 Validate
    const v1 = validateWrite("publish", { material }, ctx);
    if (!v1.ok) throw new Error(v1.errors.join(". "));

    // 2 Normalize
    const normalized = normalizeMaterialDraft(material);
    normalized.publishedAt = null;

    // 3 Build public JSON
    const materialsForLinks = (ctx.materials || []).map((m) =>
      m.id === normalized.id ? { ...normalized, publishedAt: normalized.publishedAt || "pending" } : m
    );
    let payload = buildPublicPassportPayload(normalized, materialsForLinks);

    // 4 Verify
    const verifyErrors = verifyPublicPassportPayload(payload);
    if (verifyErrors.length) throw new Error(verifyErrors.join(". "));

    const urlSlug = payload.urlSlug;
    const previousSlug = material.lastPublishedSlug ||
      (material.publishedAt ? (material.basic?.urlSlug || material.urlSlug) : null);
    const publishedPath = PUBLISHED_PREFIX + urlSlug + ".json";

    // 5 Publish public JSON
    await uploadJson(publishedPath, payload, io.uploadJson);
    rollback.push({
      type: "published",
      path: publishedPath,
      deleteOnRollback: !(material.publishedAt && previousSlug === urlSlug)
    });

    // 6 Verify written public JSON
    const written = await downloadJson(publishedPath, io.downloadJson);
    const writtenErrors = verifyPublicPassportPayload(written);
    if (writtenErrors.length) throw new Error("Publicētais fails neiztur pārbaudi pēc ierakstīšanas");

    // Prepare published material record (not committed locally until step 9)
    const publishedMaterial = resolveRelatedLinks(normalized, ctx.materials || []);
    publishedMaterial.publishedAt = new Date().toISOString();
    publishedMaterial.updatedAt = publishedMaterial.publishedAt;
    publishedMaterial.lastPublishedSlug = urlSlug;
    publishedMaterial.images = sanitizePublishedImages(publishedMaterial.images);

    const materials = [...(ctx.materials || [])];
    const idx = materials.findIndex((m) => m.id === material.id);
    if (idx >= 0) materials[idx] = publishedMaterial;
    else materials.push(publishedMaterial);

    const manifest = rebuildManifestIndexes({ ...(ctx.manifest || {}), version: ctx.manifest?.version || 0 }, materials);

    // 7 Update manifest + sitemap
    const manifestValidation = validateWrite("manifest", { manifest }, ctx);
    if (!manifestValidation.ok) throw new Error(manifestValidation.errors.join(". "));

    await uploadJson(MANIFEST_PATH, manifest, io.uploadJson);
    await io.uploadText("studio/sitemap.xml", buildSitemapXml(manifest), "application/xml; charset=utf-8");

    // 8 Verify manifest
    const verifyManifest = await downloadJson(MANIFEST_PATH, io.downloadJson);
    if (!verifyManifest?.materials?.some((e) => e.id === material.id && e.urlSlug === urlSlug)) {
      throw new Error("Manifests neapstiprina publicēto materiālu");
    }

    if (!isValidPublicSlug(urlSlug)) throw new Error("Nederīgs publiskais URL slug");

    publishedMaterial.publicationState = "deployment_pending";
    publishedMaterial.publicUrl = publicMaterialUrl(urlSlug);
    publishedMaterial.publicRouteStrategy = PUBLIC_ROUTE_STRATEGY;
    publishedMaterial.publishError = null;
    publishedMaterial.publicVerifiedAt = null;

    // 9 Complete — persist draft + remove obsolete slug
    await uploadJson(DRAFT_PREFIX + material.id + ".json", publishedMaterial, io.uploadJson);

    if (previousSlug && previousSlug !== urlSlug) {
      await tryDeletePath(PUBLISHED_PREFIX + previousSlug + ".json");
    }

    return {
      material: publishedMaterial,
      manifest: verifyManifest,
      passportPayload: written
    };
  } catch (err) {
    for (const item of rollback.reverse()) {
      if (item.type === "published" && item.deleteOnRollback) {
        await tryDeletePath(item.path);
      }
    }
    const safeDraft = JSON.parse(JSON.stringify(draftSnapshot));
    safeDraft.publishedAt = material.publishedAt || null;
    throw new Error(err.message || "Publicēšana neizdevās");
  }
}
