#!/usr/bin/env node
/**
 * Sync sanitized published material data from Firebase Storage (anonymous read).
 *
 * Bootstrap policy (first CI run before any Studio publish):
 * - Remote manifest exists → download, validate, sync all published JSON files.
 * - Remote manifest 404 / object-not-found → keep validated local empty manifest.
 * - Any other error (auth, timeout, 5xx, malformed) → fail the build.
 *
 * No Firebase credentials — only public paths:
 *   studio/manifest.json
 *   studio/published/{slug}.json
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isValidSlug, validatePublishedMaterial } from "./lib/material-build-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_DIR = join(REPO_ROOT, "data/published-materials");
const LOCAL_MANIFEST_PATH = join(DATA_DIR, "manifest.json");
const BUCKET = process.env.VEDMAN_STORAGE_BUCKET || "vedman-lv.firebasestorage.app";
const TIMEOUT_MS = Number(process.env.VEDMAN_FETCH_TIMEOUT_MS || 15000);

const ALLOWED_PREFIX = "studio/published/";
const MANIFEST_PATH = "studio/manifest.json";

function storagePublicUrl(path) {
  if (path !== MANIFEST_PATH && !path.startsWith(ALLOWED_PREFIX)) {
    throw new Error("Path not allowlisted: " + path);
  }
  return "https://firebasestorage.googleapis.com/v0/b/" + BUCKET + "/o/" + encodeURIComponent(path) + "?alt=media";
}

function isManifestNotFound(status, bodyText) {
  if (status === 404) return true;
  const text = String(bodyText || "");
  return /object\s*not\s*found|404|Not Found/i.test(text);
}

function readLocalManifest() {
  if (!existsSync(LOCAL_MANIFEST_PATH)) {
    throw new Error("Missing local bootstrap manifest: " + LOCAL_MANIFEST_PATH);
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(LOCAL_MANIFEST_PATH, "utf8"));
  } catch (e) {
    throw new Error("Local manifest.json is malformed: " + e.message);
  }
  if (!manifest || !Array.isArray(manifest.materials)) {
    throw new Error("Local manifest.json must contain materials[] array");
  }
  return manifest;
}

async function fetchRemote(path) {
  const url = storagePublicUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      const err = new Error("HTTP " + res.status + " — " + path);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      const err = new Error("Malformed JSON response — " + path);
      err.cause = e;
      throw err;
    }
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Timeout fetching " + path + " after " + TIMEOUT_MS + "ms");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMaterialJson(path) {
  return fetchRemote(path);
}

async function syncFromRemote(manifest) {
  const outManifest = {
    version: manifest.version || 0,
    updatedAt: manifest.updatedAt || new Date().toISOString(),
    source: "firebase-storage-anonymous",
    materials: []
  };

  mkdirSync(join(DATA_DIR, "materials"), { recursive: true });
  const seen = new Set();

  for (const entry of manifest.materials) {
    const slug = entry.urlSlug;
    if (!isValidSlug(slug)) throw new Error("Invalid manifest slug: " + slug);
    if (seen.has(slug)) throw new Error("Duplicate manifest slug: " + slug);
    seen.add(slug);

    const payload = await fetchMaterialJson(ALLOWED_PREFIX + slug + ".json");
    if (payload.urlSlug !== slug) throw new Error("Slug mismatch in " + slug + ".json");
    const errors = validatePublishedMaterial(payload, slug);
    if (errors.length) throw new Error(slug + ": " + errors.join("; "));

    writeFileSync(join(DATA_DIR, "materials", slug + ".json"), JSON.stringify(payload, null, 2) + "\n");
    outManifest.materials.push({
      urlSlug: slug,
      title: entry.title || payload.title,
      publishedAt: entry.publishedAt || null,
      id: entry.id || null
    });
  }

  writeFileSync(LOCAL_MANIFEST_PATH, JSON.stringify(outManifest, null, 2) + "\n");
  console.log("Synced " + outManifest.materials.length + " published material(s) to data/published-materials/");
}

async function main() {
  console.log("Syncing published data from Storage (anonymous)…");

  let remoteManifest;
  try {
    remoteManifest = await fetchRemote(MANIFEST_PATH);
  } catch (e) {
    if (e.status === 404 || isManifestNotFound(e.status, e.body)) {
      const local = readLocalManifest();
      if (local.materials.length > 0) {
        throw new Error(
          "Remote manifest not found but local manifest lists " + local.materials.length +
          " material(s). Refusing ambiguous bootstrap."
        );
      }
      console.log("No remote published manifest found; using validated empty build input.");
      return;
    }
    if (e.status === 401 || e.status === 403) {
      throw new Error("Storage permission error fetching manifest: " + (e.message || e));
    }
    if (e.status >= 500) {
      throw new Error("Storage server error fetching manifest: " + (e.message || e));
    }
    throw e;
  }

  if (!remoteManifest?.materials || !Array.isArray(remoteManifest.materials)) {
    throw new Error("Malformed studio/manifest.json — missing materials[]");
  }

  await syncFromRemote(remoteManifest);
}

main().catch((e) => {
  console.error("sync-published-data failed:", e.message || e);
  process.exit(1);
});
