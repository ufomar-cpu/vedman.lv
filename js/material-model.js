/**
 * VEDMAN Material Passport — structured data model, status, validation.
 */
import { IMAGE_ROLES } from "./media-pipeline.js";
import { createTechnicalBlock } from "./studio-technical.js";

export const MATERIAL_STATUSES = [
  "draft",
  "needs_photos",
  "needs_verification",
  "ready_to_publish",
  "data_published",
  "deployment_pending",
  "publicly_available",
  "publish_error"
];

export const STATUS_LABELS = {
  draft: "Melnraksts",
  needs_photos: "Trūkst foto",
  needs_verification: "Jāverificē",
  ready_to_publish: "Gatavs publicēšanai",
  data_published: "Dati publicēti",
  deployment_pending: "Gaida vietnes izvietošanu",
  publicly_available: "Publiski pieejams",
  publish_error: "Publicēšanas kļūda"
};

export const STATUS_COLORS = {
  draft: "#8a9199",
  needs_photos: "#d6aa2f",
  needs_verification: "#e07b00",
  ready_to_publish: "#18bf3f",
  data_published: "#3b82f6",
  deployment_pending: "#6a5acd",
  publicly_available: "#0b8f26",
  publish_error: "#c0392b"
};

const FORBIDDEN_PUBLIC = /\[TBD\]|lorem ipsum|TODO|FIXME|margin|supplier price/i;

export function slugifyUrl(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "materials";
}

export function newMaterialId() {
  return "mat-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function emptyImages() {
  const images = {};
  IMAGE_ROLES.forEach((role) => {
    images[role] = {
      file: role + ".webp",
      available: false,
      alt: "",
      storagePath: null,
      url: null
    };
  });
  return images;
}

export function createMaterial(partial = {}) {
  const now = new Date().toISOString();
  const title = partial.basic?.title || "Jauns materiāls";
  const urlSlug = partial.basic?.urlSlug || slugifyUrl(title);
  return {
    id: partial.id || newMaterialId(),
    urlSlug,
    revision: partial.revision ?? 0,
    lastPublishedSlug: partial.lastPublishedSlug || null,
    publishedAt: partial.publishedAt || null,
    updatedAt: now,
    basic: {
      title,
      slug: partial.basic?.slug || urlSlug,
      urlSlug,
      fraction: partial.basic?.fraction || "",
      fractionDisplay: partial.basic?.fractionDisplay || "",
      materialType: partial.basic?.materialType || "",
      catalogMaterial: partial.basic?.catalogMaterial || "",
      catalogFraction: partial.basic?.catalogFraction || "",
      eyebrow: partial.basic?.eyebrow || "Beramie materiāli",
      description: partial.basic?.description || "",
      typicalUse: partial.basic?.typicalUse || ""
    },
    applications: partial.applications || [],
    recommendation: partial.recommendation || { title: "", text: "" },
    faq: partial.faq || [],
    related: partial.related || [],
    seo: partial.seo || {
      metaTitle: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      keywords: ""
    },
    images: partial.images || emptyImages(),
    imageBase: partial.imageBase || "/assets/materials/" + urlSlug + "/",
    heroRole: partial.heroRole || "hero",
    galleryOrder: partial.galleryOrder || [...IMAGE_ROLES],
    technical: partial.technical ? createTechnicalBlock(partial.technical) : createTechnicalBlock(),
    extensions: partial.extensions || {},
    visibility: partial.visibility || {
      showFacts: true,
      showApplications: true,
      showRecommendation: true,
      showFaq: true,
      showTechnical: false,
      showRelated: true
    }
  };
}

export function duplicateMaterial(source) {
  const copy = JSON.parse(JSON.stringify(source));
  const baseTitle = source.basic.title + " (kopija)";
  copy.id = newMaterialId();
  copy.publishedAt = null;
  copy.updatedAt = new Date().toISOString();
  copy.basic.title = baseTitle;
  copy.basic.urlSlug = slugifyUrl(baseTitle);
  copy.basic.slug = copy.basic.urlSlug;
  copy.imageBase = "/assets/materials/" + copy.basic.urlSlug + "/";
  copy.images = emptyImages();
  copy.revision = 0;
  copy.lastPublishedSlug = null;
  return copy;
}

export function hasHeroImage(material) {
  const role = material.heroRole || "hero";
  const img = material.images?.[role];
  return !!(img && img.available && (img.url || img.storagePath));
}

export function hasRecommendation(material) {
  const rec = material.recommendation || {};
  return !!(String(rec.title || "").trim() && String(rec.text || "").trim());
}

export function hasPendingVerification(material) {
  const rows = material.technical?.rows || [];
  return rows.some((r) => r.visible !== false && r.value && !r.verified);
}

export function computeStatus(material) {
  if (material.publishError) return "publish_error";
  if (material.publicationState === "publicly_available") return "publicly_available";
  if (material.publicationState === "deployment_pending") return "deployment_pending";
  if (material.publicationState === "data_published") return "data_published";
  if (material.publishedAt) return "deployment_pending";

  const title = String(material.basic?.title || "").trim();
  const slug = String(material.basic?.urlSlug || material.urlSlug || "").trim();
  if (!title || !slug) return "draft";
  if (!hasHeroImage(material)) return "needs_photos";
  if (!hasRecommendation(material)) return "draft";
  if (hasPendingVerification(material)) return "needs_verification";
  return "ready_to_publish";
}

export function validateForPublish(material) {
  const errors = [];
  if (!String(material.basic?.title || "").trim()) errors.push("Trūkst nosaukuma");
  if (!String(material.basic?.urlSlug || material.urlSlug || "").trim()) errors.push("Trūkst URL slug");
  if (!hasHeroImage(material)) errors.push("Trūkst galvenā (hero) attēla");
  if (!hasRecommendation(material)) errors.push("Trūkst VEDMAN ieteikuma");
  if (hasPendingVerification(material)) errors.push("Ir neverificēti tehniskie parametri");
  return errors;
}

export function sanitizeForPublic(material) {
  const m = JSON.parse(JSON.stringify(material));
  m.basic = m.basic || {};
  m.recommendation = m.recommendation || {};
  m.seo = m.seo || {};

  Object.keys(m).concat(Object.keys(m.basic)).forEach((key) => {
    const val = typeof key === "string" ? m[key] ?? m.basic[key] : null;
    if (typeof val === "string" && FORBIDDEN_PUBLIC.test(val)) {
      if (m[key] !== undefined) m[key] = "";
      if (m.basic[key] !== undefined) m.basic[key] = "";
    }
  });

  if (m.technical?.visible !== true) {
    m.technical = {
      visible: false,
      rows: (m.technical?.rows || []).filter((r) =>
        r.visible !== false && r.verified === true && r.value
      )
    };
  } else {
    m.technical.rows = (m.technical.rows || []).filter((r) =>
      r.visible !== false && r.verified === true && r.value
    );
  }

  m.faq = (m.faq || []).filter((item) => item.question && item.answer && !FORBIDDEN_PUBLIC.test(item.question + item.answer));
  m.applications = (m.applications || []).filter((a) => a.title && !FORBIDDEN_PUBLIC.test(a.title + (a.text || "")));

  delete m._draft;
  delete m._status;
  delete m.revision;
  delete m.lastPublishedSlug;
  delete m.updatedAt;
  return m;
}

export function buildSearchText(material) {
  const parts = [
    material.basic?.title,
    material.basic?.fraction,
    material.basic?.materialType,
    material.basic?.description,
    material.basic?.typicalUse,
    material.recommendation?.text,
    material.seo?.keywords,
    ...(material.applications || []).map((a) => a.title + " " + a.text),
    ...(material.faq || []).map((f) => f.question)
  ];
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 2000);
}

export function toPassportConfig(material) {
  const pub = sanitizeForPublic(material);
  return {
    slug: pub.basic.slug,
    urlSlug: pub.basic.urlSlug,
    title: pub.basic.title,
    catalogMaterial: pub.basic.catalogMaterial,
    catalogFraction: pub.basic.catalogFraction,
    imageBase: pub.imageBase,
    images: pub.images,
    content: {
      eyebrow: pub.basic.eyebrow,
      description: pub.basic.description,
      typicalUse: pub.basic.typicalUse,
      fractionDisplay: pub.basic.fractionDisplay || pub.basic.fraction,
      materialType: pub.basic.materialType,
      applications: pub.applications,
      recommendation: pub.recommendation,
      faq: pub.faq,
      related: pub.related,
      seo: pub.seo,
      technical: pub.technical,
      visibility: pub.visibility,
      galleryOrder: pub.galleryOrder,
      heroRole: pub.heroRole
    }
  };
}

export function dolomiteSeedMaterial() {
  return createMaterial({
    id: "0-32-dolomite",
    urlSlug: "dolomita-skembas-0-32",
    publishedAt: null,
    basic: {
      title: "Dolomīta šķembas 0-32",
      slug: "0-32-dolomite",
      urlSlug: "dolomita-skembas-0-32",
      fraction: "0-32",
      fractionDisplay: "0–32 mm",
      materialType: "Dolomīts",
      catalogMaterial: "Dolomīta šķembas",
      catalogFraction: "0-32",
      eyebrow: "Beramie materiāli · Dolomīts",
      description: "Dolomīta šķembas frakcijā 0–32 mm — beramais minerālmateriāls, ko VEDMAN piegādā Rīgā, Ogrē un visā Latvijā. Pasūtījumi tiek nodrošināti tonnās, lai saņemtu precīzu svaru.",
      typicalUse: "Bieži izmanto inženierbūves un teritoriju sakārtošanas projektos — piemērotība ir atkarīga no objekta."
    },
    applications: [
      { icon: "🛤️", title: "Inženierbūves projekti", text: "Frakciju 0–32 mm bieži izmanto granulētu materiālu slāņos — piemērotība ir atkarīga no konkrēta objekta." },
      { icon: "🏗️", title: "Teritoriju sakārtošana", text: "Materiāls pieejams piegādei ar VEDMAN tehniku — apjomu saskaņojam tonnās." },
      { icon: "⚖️", title: "Precīzs svars", text: "Piegādājam pēc svara — saņemat pasūtīto tonnu daudzumu, nevis aplamu tilpumu." }
    ],
    recommendation: {
      title: "Sazinieties pirms pasūtījuma",
      text: "Katrā objektā apstākļi ir atšķirīgi — piebraukšana, mitrums un slodze ietekmē piemērotu frakciju un apjomu. Zvaniet vai rakstiet WhatsApp — palīdzēsim aprēķināt tonnas un precizēt piegādi."
    },
    faq: [
      { question: "Cik tonnu man vajag?", answer: "Palīdzam aprēķināt. Galīgo daudzumu tonnās apstiprina VEDMAN pēc jūsu objekta un materiāla." },
      { question: "Cik maksā dolomīta šķembas 0-32?", answer: "Cena pēc pieprasījuma — zvaniet 22312828 vai WhatsApp." },
      { question: "Vai piegādājat uz manu adresi?", answer: "Jā — Rīga, Ogre un visa Latvija. Piegādes iespēju precizējam pēc objekta adreses." },
      { question: "Kā pasūtīt?", answer: "WhatsApp, tālrunis +371 22312828 vai pieprasījuma forma šajā lapā." }
    ],
    related: [
      { materialId: null, title: "Dolomīta šķembas 0-16", subtitle: "Smalkāka frakcija", catalogMaterial: "Dolomīta šķembas", catalogFraction: "0-16", passportUrl: null },
      { materialId: null, title: "Dolomīta šķembas 0-45", subtitle: "Lielāka frakcija", catalogMaterial: "Dolomīta šķembas", catalogFraction: "0-45", passportUrl: null },
      { materialId: null, title: "Dolomīta šķembas 0-56", subtitle: "Smagākas frakcijas", catalogMaterial: "Dolomīta šķembas", catalogFraction: "0-56", passportUrl: null }
    ],
    seo: {
      metaTitle: "Dolomīta šķembas 0-32 — piegāde Rīgā un visā Latvijā | VEDMAN",
      metaDescription: "Dolomīta šķembas frakcijā 0-32 mm ar piegādi Rīgā, Ogrē un visā Latvijā. Skaidra informācija, cena pēc pieprasījuma. Pasūti tonnās — VEDMAN.",
      ogTitle: "Dolomīta šķembas 0-32 | VEDMAN",
      ogDescription: "Beramais materiāls frakcijā 0-32 mm. Piegāde Rīgā, Ogrē un visā Latvijā. Uzzini cenu — pasūtījumi tonnās."
    },
    images: (() => {
      const imgs = emptyImages();
      const alts = {
        hero: "Dolomīta šķembas 0-32 — VEDMAN piegāde",
        closeup: "Dolomīta šķembas 0-32 tuvplāns — graudu struktūra",
        pile: "Dolomīta šķembas 0-32 kaudze",
        truck: "Dolomīta šķembas 0-32 piegāde ar VEDMAN tehniku",
        installed: "Dolomīta šķembas 0-32 izmantošana objektā"
      };
      IMAGE_ROLES.forEach((role) => { imgs[role].alt = alts[role]; });
      return imgs;
    })(),
    imageBase: "/assets/materials/dolomita-skembas-0-32/",
    technical: createTechnicalBlock({
      visible: false,
      rows: [
        { key: "fraction", label: "Frakcija", value: "0–32 mm", verified: true, visible: true },
        { key: "unit", label: "Vienība", value: "Tonnas", verified: true, visible: true }
      ]
    }),
  });
}
