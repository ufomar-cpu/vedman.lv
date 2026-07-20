#!/usr/bin/env node
/**
 * Validate generated material routes and root sitemap.xml.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateGeneratedRoutes } from "./lib/material-build-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_DIR = join(REPO_ROOT, "data/published-materials");

const result = validateGeneratedRoutes({ repoRoot: REPO_ROOT, dataDir: DATA_DIR });
if (!result.ok) {
  console.error("Route validation failed:");
  result.errors.forEach((e) => console.error("  -", e));
  process.exit(1);
}
console.log("Route validation passed (" + result.count + " material(s))");
