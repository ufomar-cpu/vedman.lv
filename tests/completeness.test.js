/**
 * Completeness engine boundary tests.
 * Run: npm run test:completeness
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { getCompletenessScore, PUBLISH_COMPLETENESS_THRESHOLD } from "../js/studio-completeness.js";
import { createMaterial } from "../js/material-model.js";
import { IMAGE_ROLES } from "../js/media-pipeline.js";

function mat(partial = {}) {
  return createMaterial(partial);
}

function withImages(n) {
  const m = mat();
  IMAGE_ROLES.slice(0, n).forEach((role) => {
    m.images[role] = {
      file: role + ".webp",
      available: true,
      url: "https://example.com/" + role + ".webp",
      storagePath: "materials/x/" + role + ".webp",
      alt: role
    };
  });
  m.heroRole = "hero";
  return m;
}

test("empty material scores low", () => {
  const s = getCompletenessScore(mat());
  assert.ok(s.percent < 20);
  assert.equal(s.max, 100);
});

test("hero only adds hero points", () => {
  const s = getCompletenessScore(withImages(1));
  assert.equal(s.sections.find((x) => x.id === "hero").score, 20);
});

test("partial SEO", () => {
  const m = mat();
  m.seo.metaTitle = "Title";
  const s = getCompletenessScore(m);
  assert.ok(s.sections.find((x) => x.id === "seo").score >= 5);
  assert.ok(s.sections.find((x) => x.id === "seo").score < 15);
});

test("one FAQ partial credit", () => {
  const m = mat({ faq: [{ question: "Q?", answer: "A." }] });
  assert.equal(getCompletenessScore(m).sections.find((x) => x.id === "faq").score, 5);
});

test("hidden technical row does not score", () => {
  const m = mat();
  m.technical.rows = m.technical.rows.map((r) =>
    r.key === "fraction" ? { ...r, value: "0-32", verified: true, visible: false } : r
  );
  assert.equal(getCompletenessScore(m).sections.find((x) => x.id === "technical").score, 0);
});

test("unverified technical row does not score", () => {
  const m = mat();
  m.technical.rows = m.technical.rows.map((r) =>
    r.key === "fraction" ? { ...r, value: "0-32", verified: false, visible: true } : r
  );
  assert.equal(getCompletenessScore(m).sections.find((x) => x.id === "technical").score, 0);
});

test("related link counts even if target unpublished", () => {
  const m = mat({ related: [{ materialId: "mat-other", title: "", subtitle: "" }] });
  assert.ok(getCompletenessScore(m).sections.find((x) => x.id === "related").score >= 3);
});

test("all sections complete totals 100 max", () => {
  const m = withImages(5);
  m.basic.title = "Test";
  m.basic.description = "Desc";
  m.basic.catalogMaterial = "Dolomīta šķembas";
  m.applications = [
    { icon: "a", title: "A", text: "t" },
    { icon: "b", title: "B", text: "t" },
    { icon: "c", title: "C", text: "t" }
  ];
  m.faq = [0, 1, 2].map((i) => ({ question: "Q" + i, answer: "A" + i }));
  m.recommendation = { title: "R", text: "T" };
  m.seo = { metaTitle: "t", metaDescription: "d", ogTitle: "o", ogDescription: "o", keywords: "k" };
  m.related = [{ materialId: "x", title: "X" }, { materialId: "y", title: "Y" }];
  m.technical.rows = m.technical.rows.map((r, i) =>
    i < 3 ? { ...r, value: "v", verified: true, visible: true } : r
  );
  const s = getCompletenessScore(m);
  assert.equal(s.max, 100);
  assert.ok(s.total <= 100);
  assert.ok(!Number.isNaN(s.percent));
  assert.equal(s.percent, 100);
});

test("score never NaN", () => {
  assert.ok(!Number.isNaN(getCompletenessScore({}).percent));
});

test("threshold constant", () => {
  assert.equal(PUBLISH_COMPLETENESS_THRESHOLD, 70);
});
