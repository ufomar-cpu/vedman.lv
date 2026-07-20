/**
 * Central validation layer for all VEDMAN Studio write operations.
 * Fail closed — single source of truth for save, publish, media, manifest.
 */
import { canPublishInStudio, canDeleteInStudio, canDeleteMaterialImages } from "./firebase-auth.js";
import { safeHttpUrl, sanitizePublishedImages } from "./dom-safe.js";
import {
  slugifyUrl,
  hasHeroImage,
  hasRecommendation,
  hasPendingVerification,
  sanitizeForPublic,
  toPassportConfig
} from "./material-model.js";
import { validateImageFile } from "./media-pipeline.js";
import { getCompletenessScore, PUBLISH_COMPLETENESS_THRESHOLD } from "./studio-completeness.js";
import { resolveRelatedByIds } from "./studio-related.js";
import { createTechnicalBlock } from "./studio-technical.js";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN_PUBLIC = /\[TBD\]|lorem ipsum|\bTODO\b|\bFIXME\b|margin|supplier price/i;

const PRIVATE_KEYS = new Set([
  "_status", "_draft", "revision", "lastPublishedSlug", "publishedAt", "updatedAt"
]);

export function normalizeSlug(raw) {
  const s = slugifyUrl(String(raw || "").trim());
  if (!SLUG_RE.test(s)) return null;
  return s.slice(0, 80);
}

export function findSlugCollision(slug, materialId, materials) {
  if (!slug) return "Nederīgs URL slug";
  return (materials || []).find((m) =>
    m.id !== materialId && (m.basic?.urlSlug || m.urlSlug) === slug
  ) || null;
}

export function containsForbiddenText(value) {
  return typeof value === "string" && FORBIDDEN_PUBLIC.test(value);
}

export function scanForbiddenFields(material) {
  const hits = [];
  const walk = (obj, path) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, path + "[" + i + "]"));
      return;
    }
    Object.keys(obj).forEach((k) => {
      const next = path ? path + "." + k : k;
      const v = obj[k];
      if (typeof v === "string" && containsForbiddenText(v)) hits.push(next);
      else if (v && typeof v === "object") walk(v, next);
    });
  };
  walk(material, "");
  return hits;
}

export function normalizeMaterialDraft(material) {
  const m = JSON.parse(JSON.stringify(material));
  m.basic = m.basic || {};
  m.basic.title = String(m.basic.title || "").trim().slice(0, 200);
  m.basic.urlSlug = normalizeSlug(m.basic.urlSlug || m.urlSlug || m.basic.title) || "";
  m.basic.slug = normalizeSlug(m.basic.slug || m.basic.urlSlug) || m.basic.urlSlug;
  m.urlSlug = m.basic.urlSlug;
  m.basic.fraction = String(m.basic.fraction || "").trim().slice(0, 40);
  m.basic.fractionDisplay = String(m.basic.fractionDisplay || m.basic.fraction || "").trim().slice(0, 60);
  m.basic.description = String(m.basic.description || "").trim().slice(0, 4000);
  m.basic.typicalUse = String(m.basic.typicalUse || "").trim().slice(0, 2000);
  m.basic.eyebrow = String(m.basic.eyebrow || "").trim().slice(0, 120);
  m.basic.materialType = String(m.basic.materialType || "").trim().slice(0, 80);
  m.basic.catalogMaterial = String(m.basic.catalogMaterial || "").trim().slice(0, 120);
  m.basic.catalogFraction = String(m.basic.catalogFraction || "").trim().slice(0, 40);
  m.recommendation = {
    title: String(m.recommendation?.title || "").trim().slice(0, 200),
    text: String(m.recommendation?.text || "").trim().slice(0, 4000)
  };
  m.seo = m.seo || {};
  ["metaTitle", "metaDescription", "ogTitle", "ogDescription", "keywords"].forEach((k) => {
    m.seo[k] = String(m.seo[k] || "").trim().slice(0, k.includes("Description") ? 320 : k === "keywords" ? 500 : 120);
  });
  m.applications = (m.applications || []).map((a) => ({
    icon: String(a.icon || "📦").slice(0, 8),
    title: String(a.title || "").trim().slice(0, 120),
    text: String(a.text || "").trim().slice(0, 1000)
  })).filter((a) => a.title);
  m.faq = (m.faq || []).map((f) => ({
    question: String(f.question || "").trim().slice(0, 240),
    answer: String(f.answer || "").trim().slice(0, 2000)
  })).filter((f) => f.question && f.answer);
  m.related = (m.related || []).map((r) => ({
    materialId: r.materialId || null,
    title: String(r.title || "").trim().slice(0, 120),
    subtitle: String(r.subtitle || "").trim().slice(0, 160),
    catalogMaterial: String(r.catalogMaterial || "").trim().slice(0, 120),
    catalogFraction: String(r.catalogFraction || "").trim().slice(0, 40),
    passportUrl: safeHttpUrl(r.passportUrl) || null
  })).filter((r) => r.materialId || r.title);
  m.technical = createTechnicalBlock(m.technical || {});
  m.revision = Number(m.revision || 0) + 1;
  m.updatedAt = new Date().toISOString();
  if (m.images) m.images = sanitizePublishedImages(m.images);
  delete m._status;
  return m;
}

export function resolveRelatedLinks(material, materials) {
  return resolveRelatedByIds(material, materials);
}

export function buildPublicPassportPayload(material, materials) {
  let m = sanitizeForPublic(material);
  m = resolveRelatedLinks(m, materials);
  m.images = sanitizePublishedImages(m.images);
  const payload = toPassportConfig(m);
  payload.images = sanitizePublishedImages(payload.images);
  return payload;
}

export function verifyPublicPassportPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") errors.push("Trūkst publicējamā satura");
  if (!payload?.title) errors.push("Trūkst nosaukuma publicētajā saturā");
  if (!payload?.urlSlug || !SLUG_RE.test(payload.urlSlug)) errors.push("Nederīgs publicētais slug");
  if (!hasHeroImage({ images: payload?.images, heroRole: payload?.content?.heroRole || "hero" })) {
    errors.push("Trūkst hero attēla publicētajā saturā");
  }
  const forbidden = scanForbiddenFields(payload);
  if (forbidden.length) errors.push("Publicētajā saturā ir aizliegts teksts");
  const walkPrivate = (obj, depth) => {
    if (!obj || typeof obj !== "object" || depth > 6) return;
    Object.keys(obj).forEach((k) => {
      if (PRIVATE_KEYS.has(k)) errors.push("Publicētajā saturā ir privāts lauks: " + k);
      else walkPrivate(obj[k], depth + 1);
    });
  };
  walkPrivate(payload, 0);
  return errors;
}

export function validateWrite(operation, data, ctx = {}) {
  const errors = [];
  const material = data?.material;
  const materials = ctx.materials || [];

  if (operation === "save_draft") {
    if (!material?.id) errors.push("Trūkst materiāla ID");
    if (!String(material?.basic?.title || "").trim()) errors.push("Trūkst nosaukuma");
    const slug = normalizeSlug(material?.basic?.urlSlug || material?.urlSlug);
    if (!slug) errors.push("Nederīgs URL slug");
    const collision = slug ? findSlugCollision(slug, material.id, materials) : null;
    if (collision) errors.push("URL slug jau izmanto: " + slug);
    if (ctx.expectedRevision != null && Number(material.revision || 0) !== Number(ctx.expectedRevision)) {
      errors.push("Materiāls tika mainīts citur. Atjaunojiet sarakstu.");
    }
    scanForbiddenFields(material).forEach(() => errors.push("Melnrakstā ir aizliegts teksts ([TBD]/TODO u.c.)"));
    return { ok: errors.length === 0, errors };
  }

  if (operation === "publish") {
    if (!canPublishInStudio()) errors.push("Nav tiesību publicēt (tikai owner/admin)");
    if (!material?.id) errors.push("Trūkst materiāla ID");
    if (!String(material?.basic?.title || "").trim()) errors.push("Trūkst nosaukuma");
    const slug = normalizeSlug(material?.basic?.urlSlug || material?.urlSlug);
    if (!slug) errors.push("Nederīgs URL slug");
    if (findSlugCollision(slug, material.id, materials)) errors.push("URL slug jau izmanto cits materiāls");
    if (!hasHeroImage(material)) errors.push("Trūkst galvenā (hero) attēla");
    if (!hasRecommendation(material)) errors.push("Trūkst VEDMAN ieteikuma");
    if (hasPendingVerification(material)) errors.push("Ir neverificēti tehniskie parametri");
    const completeness = getCompletenessScore(material);
    if (completeness.percent < PUBLISH_COMPLETENESS_THRESHOLD) {
      errors.push("Pilnīgums " + completeness.percent + "% — minimums " + PUBLISH_COMPLETENESS_THRESHOLD + "%");
    }
    scanForbiddenFields(material).forEach(() => errors.push("Publicēšanai nav atļauts aizliegts teksts"));
    if (ctx.expectedRevision != null && Number(material.revision || 0) !== Number(ctx.expectedRevision)) {
      errors.push("Materiāls tika mainīts citur. Saglabājiet un mēģiniet vēlreiz.");
    }
    return { ok: errors.length === 0, errors };
  }

  if (operation === "upload_image") {
    const fileResult = validateImageFile(data?.file);
    if (!fileResult.ok) errors.push(...fileResult.errors);
    if (!material?.id) errors.push("Trūkst materiāla");
    if (!normalizeSlug(material?.basic?.urlSlug || material?.urlSlug)) errors.push("Vispirms iestatiet derīgu URL slug");
    if (!data?.role) errors.push("Trūkst attēla lomas");
    return { ok: errors.length === 0, errors };
  }

  if (operation === "delete_image") {
    if (!canDeleteMaterialImages()) errors.push("Nav tiesību dzēst attēlu no krātuves (tikai owner/admin)");
    if (!material?.id) errors.push("Trūkst materiāla");
    if (!data?.role) errors.push("Trūkst attēla lomas");
    return { ok: errors.length === 0, errors };
  }

  if (operation === "delete_material") {
    if (!canDeleteInStudio()) errors.push("Nav tiesību dzēst materiālu (tikai owner/admin)");
    if (!data?.id) errors.push("Trūkst materiāla ID");
    return { ok: errors.length === 0, errors };
  }

  if (operation === "manifest") {
    if (!data?.manifest || !Array.isArray(data.manifest.materials)) errors.push("Nederīgs manifests");
    return { ok: errors.length === 0, errors };
  }

  errors.push("Nezināma write operācija");
  return { ok: false, errors };
}

export function collectReferencedStoragePaths(material) {
  const paths = new Set();
  Object.values(material?.images || {}).forEach((img) => {
    if (img?.storagePath) paths.add(img.storagePath);
  });
  return paths;
}
