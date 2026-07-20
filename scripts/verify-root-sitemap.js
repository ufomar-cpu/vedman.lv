#!/usr/bin/env node
/**
 * Verify root sitemap.xml exists and contains required static URLs.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_ORIGIN,
  STATIC_SITEMAP_PATHS,
  publicMaterialUrl,
  discoverHandMaintainedSlugs,
  escapeXml,
  readBuildManifest,
  loadPublishedMaterials
} from "./lib/material-build-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_DIR = join(REPO_ROOT, "data/published-materials");
const sitemapPath = join(REPO_ROOT, "sitemap.xml");

const errors = [];

if (!existsSync(sitemapPath)) {
  console.error("Missing root sitemap.xml");
  process.exit(1);
}

const xml = readFileSync(sitemapPath, "utf8");
if (!xml.startsWith('<?xml version="1.0"')) errors.push("sitemap.xml missing XML declaration");
if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
  errors.push("sitemap.xml missing urlset namespace");
}

for (const path of STATIC_SITEMAP_PATHS) {
  const loc = path === "/" ? SITE_ORIGIN + "/" : SITE_ORIGIN + path;
  if (!xml.includes("<loc>" + escapeXml(loc) + "</loc>") && !xml.includes("<loc>" + loc + "</loc>")) {
    errors.push("Missing static sitemap URL: " + loc);
  }
}

const handSlugs = discoverHandMaintainedSlugs(join(REPO_ROOT, "materiali"));
for (const slug of handSlugs) {
  const loc = publicMaterialUrl(slug);
  if (!xml.includes(loc)) errors.push("Missing hand-maintained material URL: " + loc);
}

try {
  const manifest = readBuildManifest(DATA_DIR);
  const materials = loadPublishedMaterials(DATA_DIR, manifest);
  for (const { slug } of materials) {
    const loc = publicMaterialUrl(slug);
    if (!xml.includes(loc)) errors.push("Missing generated material URL in sitemap: " + loc);
  }
} catch (e) {
  errors.push("Build manifest validation during sitemap check: " + e.message);
}

if (errors.length) {
  console.error("Root sitemap verification failed:");
  errors.forEach((e) => console.error("  -", e));
  process.exit(1);
}

console.log("Root sitemap verification passed (" + handSlugs.length + " hand-maintained, static URLs OK)");
