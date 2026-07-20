#!/usr/bin/env node
/**
 * Generate materiali/{slug}/index.html from data/published-materials/.
 * Also writes authoritative root sitemap.xml.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMaterialPages } from "./lib/material-build-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_DIR = join(REPO_ROOT, "data/published-materials");

const remote = process.argv.includes("--remote");

async function main() {
  if (remote) {
    const { spawnSync } = await import("node:child_process");
    const sync = spawnSync("node", [join(__dirname, "sync-published-data.js")], { stdio: "inherit" });
    if (sync.status !== 0) process.exit(sync.status || 1);
  }

  const results = generateMaterialPages({ repoRoot: REPO_ROOT, dataDir: DATA_DIR });
  console.log("Generated " + results.generated.length + " page(s)");
  if (results.removed.length) console.log("Removed obsolete: " + results.removed.join(", "));
  console.log("Wrote " + results.sitemapPath);
}

main().catch((e) => {
  console.error("generate-material-pages failed:", e.message || e);
  process.exit(1);
});
