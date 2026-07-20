/**
 * Material Factory — content completeness scoring (0–100).
 */
import { hasHeroImage, hasRecommendation } from "./material-model.js";
import { IMAGE_ROLES } from "./media-pipeline.js";

export const PUBLISH_COMPLETENESS_THRESHOLD = 70;

export const COMPLETENESS_SECTIONS = [
  { id: "hero", label: "Hero", weight: 20, wizardStep: 2 },
  { id: "gallery", label: "Galerija", weight: 15, wizardStep: 2 },
  { id: "applications", label: "Lietojums", weight: 10, wizardStep: 3 },
  { id: "faq", label: "FAQ", weight: 15, wizardStep: 4 },
  { id: "recommendations", label: "Ieteikumi", weight: 10, wizardStep: 5 },
  { id: "seo", label: "SEO", weight: 15, wizardStep: 6 },
  { id: "related", label: "Saistītie materiāli", weight: 5, wizardStep: 7 },
  { id: "technical", label: "Tehniskie dati", weight: 5, wizardStep: 7 },
  { id: "images", label: "Attēli", weight: 5, wizardStep: 2 }
];

function countAvailableImages(material) {
  return IMAGE_ROLES.filter((role) => {
    const img = material.images?.[role];
    return !!(img?.available && (img.url || img.storagePath));
  }).length;
}

function countGalleryImages(material) {
  const hero = material.heroRole || "hero";
  return IMAGE_ROLES.filter((role) => {
    if (role === hero) return false;
    const img = material.images?.[role];
    return !!(img?.available && (img.url || img.storagePath));
  }).length;
}

function scoreHero(material) {
  return hasHeroImage(material) ? 20 : 0;
}

function scoreGallery(material) {
  const n = countGalleryImages(material);
  if (n >= 3) return 15;
  if (n >= 2) return 10;
  if (n >= 1) return 5;
  return 0;
}

function scoreApplications(material) {
  const n = (material.applications || []).filter((a) => String(a.title || "").trim()).length;
  if (n >= 3) return 10;
  if (n >= 1) return 6;
  return 0;
}

function scoreFaq(material) {
  const n = (material.faq || []).filter((f) => f.question && f.answer).length;
  if (n >= 3) return 15;
  if (n >= 2) return 10;
  if (n >= 1) return 5;
  return 0;
}

function scoreRecommendations(material) {
  return hasRecommendation(material) ? 10 : 0;
}

function scoreSeo(material) {
  const seo = material.seo || {};
  const fields = [
    seo.metaTitle,
    seo.metaDescription,
    seo.ogTitle,
    seo.ogDescription,
    seo.keywords
  ];
  const filled = fields.filter((v) => String(v || "").trim()).length;
  if (filled >= 5) return 15;
  if (filled >= 3) return 10;
  if (filled >= 1) return 5;
  return 0;
}

function scoreRelated(material) {
  const n = (material.related || []).filter((r) => r.materialId || r.title).length;
  if (n >= 2) return 5;
  if (n >= 1) return 3;
  return 0;
}

function scoreTechnical(material) {
  const rows = material.technical?.rows || [];
  const visibleVerified = rows.filter((r) => r.visible !== false && r.verified && String(r.value || "").trim());
  if (visibleVerified.length >= 3) return 5;
  if (visibleVerified.length >= 1) return 3;
  return 0;
}

function scoreImages(material) {
  const n = countAvailableImages(material);
  // Bonus for near-complete image set only (hero/gallery scored separately).
  if (n >= 5) return 5;
  if (n >= 4) return 3;
  return 0;
}

const SCORERS = {
  hero: scoreHero,
  gallery: scoreGallery,
  applications: scoreApplications,
  faq: scoreFaq,
  recommendations: scoreRecommendations,
  seo: scoreSeo,
  related: scoreRelated,
  technical: scoreTechnical,
  images: scoreImages
};

export function getCompletenessScore(material) {
  const sections = COMPLETENESS_SECTIONS.map((def) => {
    const score = SCORERS[def.id](material);
    return {
      id: def.id,
      label: def.label,
      weight: def.weight,
      score,
      complete: score >= def.weight,
      wizardStep: def.wizardStep,
      missing: score >= def.weight ? null : missingHint(def.id, material)
    };
  });

  const total = sections.reduce((sum, s) => sum + s.score, 0);
  const max = sections.reduce((sum, s) => sum + s.weight, 0);
  const percent = max ? Math.round((total / max) * 100) : 0;

  return { total, max, percent, sections, missing: sections.filter((s) => !s.complete) };
}

function missingHint(id, material) {
  switch (id) {
    case "hero": return "Pievienojiet hero attēlu";
    case "gallery": return "Pievienojiet vēl galerijas attēlus (tuvplāns, kaudze u.c.)";
    case "applications": return "Pievienojiet vismaz vienu lietojumu";
    case "faq": return "Pievienojiet FAQ jautājumus";
    case "recommendations": return "Aizpildiet VEDMAN ieteikumu";
    case "seo": return "Aizpildiet SEO laukus un atslēgvārdus";
    case "related": return "Saistiet ar citu materiālu";
    case "technical": return "Verificējiet vismaz vienu tehnisko rindu";
    case "images": return "Pievienojiet vairāk attēlu";
    default: return "Nepilnīgs";
  }
}

export function hasMissingSeo(material) {
  const seo = material.seo || {};
  return !String(seo.metaTitle || "").trim() || !String(seo.metaDescription || "").trim();
}

export function needsAttention(material) {
  const score = getCompletenessScore(material);
  return score.percent < PUBLISH_COMPLETENESS_THRESHOLD
    || !hasHeroImage(material)
    || hasMissingSeo(material);
}
