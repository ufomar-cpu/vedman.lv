/**
 * Material page generator tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  GENERATED_MARKER,
  validatePublishedMaterial,
  generateMaterialPages,
  validateGeneratedRoutes,
  isGeneratedFile,
  renderMaterialPage,
  buildSitemapXml,
  publicMaterialUrl,
  sha256,
  isValidSlug,
  resolveMaterialOutputDir,
  serializePassportJson
} from "../scripts/lib/material-build-core.js";

function samplePayload(overrides = {}) {
  const base = JSON.parse(readFileSync(new URL("./fixtures/sample-material.json", import.meta.url), "utf8"));
  return { ...base, ...overrides, content: { ...base.content, ...(overrides.content || {}) } };
}

function setupRepo(materials = []) {
  const root = mkdtempSync(join(tmpdir(), "vedman-gen-"));
  const dataDir = join(root, "data/published-materials");
  mkdirSync(join(dataDir, "materials"), { recursive: true });
  mkdirSync(join(root, "materiali"), { recursive: true });
  const manifest = { version: 1, materials: materials.map((m) => ({ urlSlug: m.urlSlug, title: m.title })) };
  writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest));
  for (const m of materials) {
    writeFileSync(join(dataDir, "materials", m.urlSlug + ".json"), JSON.stringify(m.payload));
  }
  return { root, dataDir };
}

test("validatePublishedMaterial accepts valid sample", () => {
  const p = samplePayload();
  assert.deepEqual(validatePublishedMaterial(p, "test-granulas"), []);
});

test("validatePublishedMaterial rejects invalid slug", () => {
  const p = samplePayload({ urlSlug: "BAD_SLUG" });
  assert.ok(validatePublishedMaterial(p).some((e) => e.includes("slug")));
});

test("isValidSlug rejects traversal patterns", () => {
  assert.equal(isValidSlug("evil.slug"), false);
  assert.equal(isValidSlug("../etc"), false);
  assert.equal(isValidSlug("a/b"), false);
  assert.equal(isValidSlug("test-granulas"), true);
});

test("resolveMaterialOutputDir blocks traversal", () => {
  const root = mkdtempSync(join(tmpdir(), "vedman-path-"));
  const materialiDir = join(root, "materiali");
  mkdirSync(materialiDir, { recursive: true });
  assert.throws(() => resolveMaterialOutputDir(materialiDir, "../secrets"), /blocked|Nederīgs/);
  rmSync(root, { recursive: true, force: true });
});

test("serializePassportJson prevents script breakout", () => {
  const p = samplePayload({ title: "</script><script>alert(1)//" });
  const json = serializePassportJson(p);
  assert.ok(!json.includes("</script>"));
  const html = renderMaterialPage(p);
  const inline = html.match(/<script>window\.VEDMAN_PASSPORT=([\s\S]*?)<\/script>/);
  assert.ok(inline, "inline passport script missing");
  assert.ok(!inline[1].includes("</script>"));
});

test("validatePublishedMaterial rejects duplicate slug mismatch", () => {
  const p = samplePayload();
  assert.ok(validatePublishedMaterial(p, "other-slug").length > 0);
});

test("validatePublishedMaterial rejects malformed material", () => {
  assert.ok(validatePublishedMaterial(null).length > 0);
  assert.ok(validatePublishedMaterial({ urlSlug: "x", title: "TBD test" }).length > 0);
});

test("generate one published material page", () => {
  const p = samplePayload();
  const { root, dataDir } = setupRepo([{ urlSlug: "test-granulas", title: p.title, payload: p }]);
  const result = generateMaterialPages({ repoRoot: root, dataDir });
  assert.equal(result.generated.length, 1);
  const html = readFileSync(join(root, "materiali/test-granulas/index.html"), "utf8");
  assert.ok(isGeneratedFile(html));
  assert.ok(html.includes("Testa granulas 0-16"));
  assert.ok(html.includes(publicMaterialUrl("test-granulas")));
  assert.ok(existsSync(join(root, "sitemap.xml")));
  rmSync(root, { recursive: true, force: true });
});

test("generate multiple materials", () => {
  const p1 = samplePayload();
  const p2 = samplePayload({ urlSlug: "test-otras", title: "Otras granulas", slug: "test-otras" });
  const { root, dataDir } = setupRepo([
    { urlSlug: "test-granulas", title: p1.title, payload: p1 },
    { urlSlug: "test-otras", title: p2.title, payload: p2 }
  ]);
  const result = generateMaterialPages({ repoRoot: root, dataDir });
  assert.equal(result.generated.length, 2);
  rmSync(root, { recursive: true, force: true });
});

test("duplicate slug in manifest throws", () => {
  const p = samplePayload();
  const root = mkdtempSync(join(tmpdir(), "vedman-dup-"));
  const dataDir = join(root, "data/published-materials");
  mkdirSync(join(dataDir, "materials"), { recursive: true });
  writeFileSync(join(dataDir, "manifest.json"), JSON.stringify({
    materials: [{ urlSlug: "test-granulas" }, { urlSlug: "test-granulas" }]
  }));
  writeFileSync(join(dataDir, "materials/test-granulas.json"), JSON.stringify(p));
  assert.throws(() => generateMaterialPages({ repoRoot: root, dataDir }), /Dublēts slug/);
  rmSync(root, { recursive: true, force: true });
});

test("renamed slug cleanup removes obsolete generated folder", () => {
  const p = samplePayload({ urlSlug: "jauns-slug", title: "Jauns", slug: "jauns-slug" });
  const { root, dataDir } = setupRepo([{ urlSlug: "jauns-slug", title: "Jauns", payload: p }]);
  mkdirSync(join(root, "materiali/vecs-slug"), { recursive: true });
  writeFileSync(join(root, "materiali/vecs-slug/index.html"), GENERATED_MARKER + "\n<html></html>");
  const result = generateMaterialPages({ repoRoot: root, dataDir });
  assert.ok(result.removed.includes("vecs-slug"));
  assert.ok(!existsSync(join(root, "materiali/vecs-slug")));
  rmSync(root, { recursive: true, force: true });
});

test("hand-maintained page protection", () => {
  const p = samplePayload();
  const { root, dataDir } = setupRepo([{ urlSlug: "test-granulas", title: p.title, payload: p }]);
  mkdirSync(join(root, "materiali/test-granulas"), { recursive: true });
  writeFileSync(join(root, "materiali/test-granulas/index.html"), "<html>Hand maintained</html>");
  assert.throws(() => generateMaterialPages({ repoRoot: root, dataDir }), /Roku uzturēta/);
  rmSync(root, { recursive: true, force: true });
});

test("canonical and sitemap generation", () => {
  const p = samplePayload();
  const { root, dataDir } = setupRepo([{ urlSlug: "test-granulas", title: p.title, payload: p }]);
  generateMaterialPages({ repoRoot: root, dataDir });
  const validation = validateGeneratedRoutes({ repoRoot: root, dataDir });
  assert.equal(validation.ok, true, validation.errors.join("; "));
  const xml = readFileSync(join(root, "sitemap.xml"), "utf8");
  assert.ok(xml.includes(publicMaterialUrl("test-granulas")));
  assert.ok(xml.includes("https://vedman.lv/privacy.html"));
  rmSync(root, { recursive: true, force: true });
});

test("deterministic repeated build", () => {
  const p = samplePayload();
  const { root, dataDir } = setupRepo([{ urlSlug: "test-granulas", title: p.title, payload: p }]);
  generateMaterialPages({ repoRoot: root, dataDir });
  const h1 = sha256(readFileSync(join(root, "materiali/test-granulas/index.html"), "utf8"));
  generateMaterialPages({ repoRoot: root, dataDir });
  const h2 = sha256(readFileSync(join(root, "materiali/test-granulas/index.html"), "utf8"));
  assert.equal(h1, h2);
  rmSync(root, { recursive: true, force: true });
});

test("renderMaterialPage includes static SEO without JS", () => {
  const html = renderMaterialPage(samplePayload());
  assert.ok(html.includes("<title>Testa granulas 0-16 | VEDMAN</title>"));
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('property="og:title"'));
  assert.ok(html.includes('id="passport-title">Testa granulas 0-16</h1>'));
  assert.ok(html.includes("application/ld+json"));
});

test("buildSitemapXml escapes XML", () => {
  const xml = buildSitemapXml(["https://vedman.lv/materiali/test/"]);
  assert.ok(xml.startsWith('<?xml version="1.0"'));
  assert.ok(xml.includes("<loc>https://vedman.lv/materiali/test/</loc>"));
});
