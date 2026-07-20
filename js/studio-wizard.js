/**
 * Material Factory — guided 7-step wizard.
 */
import { IMAGE_ROLES, IMAGE_ROLE_LABELS, prepareImageUpload } from "./media-pipeline.js";
import { slugifyUrl } from "./material-model.js";
import { getCompletenessScore, PUBLISH_COMPLETENESS_THRESHOLD } from "./studio-completeness.js";
import { renderTechnicalEditor, readTechnicalFromForm } from "./studio-technical.js";
import { renderRelatedEditor, readRelatedFromForm } from "./studio-related.js";
import { canPublishInStudio, canDeleteMaterialImages } from "./firebase-auth.js";
import { safeImageUrl } from "./dom-safe.js";

export const WIZARD_STEPS = [
  { step: 1, title: "Pamatinformācija", icon: "📝" },
  { step: 2, title: "Mediji", icon: "📷" },
  { step: 3, title: "Lietojums", icon: "🏗️" },
  { step: 4, title: "FAQ", icon: "❓" },
  { step: 5, title: "Ieteikumi", icon: "💡" },
  { step: 6, title: "SEO", icon: "🔍" },
  { step: 7, title: "Pārskats", icon: "✅" }
];

export const APPLICATION_PRESETS = [
  { icon: "🛤️", title: "Inženierbūves projekti", text: "Materiāls piemērots inženierbūves un granulētu slāņu risinājumiem — atkarībā no objekta." },
  { icon: "🏗️", title: "Teritoriju sakārtošana", text: "Piegāde ar VEDMAN tehniku — apjomu saskaņojam tonnās." },
  { icon: "⚖️", title: "Precīzs svars", text: "Piegādājam pēc svara — saņemat pasūtīto tonnu daudzumu." },
  { icon: "🛣️", title: "Ceļu un laukumu projekti", text: "Frakciju piemērotību precizējam pēc objekta noslodzes." },
  { icon: "🌿", title: "Apzaļumošana un dārzi", text: "Materiāls un apjoms atkarīgs no projekta prasībām." },
  { icon: "🏠", title: "Privātie objekti", text: "Piegāde Rīgā, Ogrē un visā Latvijā." }
];

export function renderWizardShell(material, wizardStep, ctx) {
  const progress = WIZARD_STEPS.map((s) =>
    `<span class="studio-wizard-dot${s.step === wizardStep ? " active" : ""}${s.step < wizardStep ? " done" : ""}" data-step-dot="${s.step}" title="${s.title}"${s.step === wizardStep ? ' aria-current="step"' : ""}>${s.step}</span>`
  ).join("");

  return `
    <div class="studio-wizard" role="dialog" aria-modal="true" aria-labelledby="wizardTitle" aria-describedby="wizardStepLabel">
      <div class="studio-wizard-head">
        <button type="button" class="studio-btn" id="wizardClose" aria-label="Aizvērt vedni">← Aizvērt</button>
        <h2 id="wizardTitle">${esc(material.basic?.title || "Jauns materiāls")}</h2>
        <button type="button" class="studio-btn primary" id="wizardSaveDraft">Saglabāt</button>
      </div>
      <div class="studio-wizard-steps" role="navigation" aria-label="Soli">${progress}</div>
      <div class="studio-wizard-body" id="wizardBody">${renderWizardStep(wizardStep, material, ctx)}</div>
      <div class="studio-wizard-foot">
        <button type="button" class="studio-btn" id="wizardPrev" ${wizardStep <= 1 ? "disabled" : ""}>Atpakaļ</button>
        <span class="studio-wizard-step-label" id="wizardStepLabel" aria-live="polite">${wizardStep} / ${WIZARD_STEPS.length} · ${WIZARD_STEPS[wizardStep - 1].title}</span>
        <button type="button" class="studio-btn primary" id="wizardNext">${wizardStep >= 7 ? "Pabeigt" : "Tālāk"}</button>
      </div>
    </div>`;
}

export function renderWizardStep(step, material, ctx) {
  switch (step) {
    case 1: return stepBasic(material, ctx);
    case 2: return stepMedia(material, ctx);
    case 3: return stepApplications(material);
    case 4: return stepFaq(material);
    case 5: return stepRecommendations(material);
    case 6: return stepSeo(material);
    case 7: return stepReview(material, ctx);
    default: return "";
  }
}

function stepBasic(m, ctx) {
  const cats = Object.keys(window.VEDMAN_CATALOG || {});
  const catOpts = cats.map((c) =>
    `<option value="${esc(c)}"${c === m.basic?.catalogMaterial ? " selected" : ""}>${esc(c)}</option>`
  ).join("");

  return `
    <section class="studio-section">
      <h3>1. Pamatinformācija</h3>
      <div class="studio-field"><label>Materiāla nosaukums</label><input id="wTitle" value="${esc(m.basic?.title)}" placeholder="piem., Dolomīta šķembas 0-32"></div>
      <div class="studio-field"><label>URL slug</label><input id="wSlug" value="${esc(m.basic?.urlSlug)}"><div class="hint">Automātiski no nosaukuma · /materiali/{slug}/</div></div>
      <div class="studio-field"><label>Kategorija</label><select id="wCategory">${catOpts}</select></div>
      <div class="studio-field"><label>Frakcija</label><input id="wFraction" value="${esc(m.basic?.fraction)}" placeholder="0-32"></div>
      <div class="studio-field"><label>Īsais apraksts</label><textarea id="wDescription">${esc(m.basic?.description)}</textarea></div>
    </section>`;
}

function stepMedia(m, ctx) {
  const slots = IMAGE_ROLES.map((role) => {
    const img = m.images?.[role];
    const isHero = (m.heroRole || "hero") === role;
    const src = safeImageUrl(img?.url);
    const preview = src ? `<img src="${esc(src)}" alt="">` : '<span class="ph">📷</span>';
    return `
      <div class="studio-media-slot${isHero ? " is-hero" : ""}" data-w-role="${role}">
        <div class="studio-media-preview">${preview}</div>
        <div class="studio-media-label">${esc(IMAGE_ROLE_LABELS[role])}${isHero ? " · HERO" : ""}</div>
        <div class="studio-media-actions">
          <button type="button" class="studio-btn" data-w-upload="${role}">Augšup.</button>
          <button type="button" class="studio-btn" data-w-hero="${role}">Hero</button>
          ${img?.available && canDeleteMaterialImages() ? `<button type="button" class="studio-btn danger" data-w-del="${role}">Dzēst</button>` : ""}
        </div>
        <input type="file" accept="image/*,.heic,.heif" capture="environment" hidden data-w-file="${role}">
      </div>`;
  }).join("");

  return `
    <section class="studio-section">
      <h3>2. Mediji</h3>
      <p class="hint">Hero · Galerija · Tuvplāns · Kaudze · Piegāde · Objektā (max 10 MB)</p>
      <div class="studio-media-grid">${slots}</div>
    </section>`;
}

function stepApplications(m) {
  const selected = new Set((m.applications || []).map((a) => a.title));
  const presets = APPLICATION_PRESETS.map((p) =>
    `<label class="studio-preset-chip${selected.has(p.title) ? " selected" : ""}">
      <input type="checkbox" data-w-preset value="${esc(p.title)}" ${selected.has(p.title) ? "checked" : ""}>
      <span>${p.icon} ${esc(p.title)}</span>
    </label>`
  ).join("");

  const custom = (m.applications || []).filter((a) =>
    !APPLICATION_PRESETS.some((p) => p.title === a.title)
  ).map((a, i) => `
    <div class="studio-app-item" data-w-custom="${i}">
      <input data-w-app-title value="${esc(a.title)}" placeholder="Virsraksts">
      <textarea data-w-app-text placeholder="Apraksts">${esc(a.text)}</textarea>
      <button type="button" class="studio-btn danger" data-w-app-remove="${i}">Noņemt</button>
    </div>`).join("");

  return `
    <section class="studio-section">
      <h3>3. Lietojums</h3>
      <p class="hint">Izvēlieties vienu vai vairākus lietojumus</p>
      <div class="studio-preset-grid">${presets}</div>
      <div id="wCustomApps">${custom}</div>
      <button type="button" class="studio-btn" id="wAddCustomApp">+ Pievienot pielāgotu</button>
    </section>`;
}

function stepFaq(m) {
  const items = (m.faq || []).length ? m.faq : [{ question: "", answer: "" }];
  const html = items.map((f, i) => `
    <div class="studio-faq-item" data-w-faq="${i}">
      <div class="studio-field"><label>Jautājums</label><input data-w-faq-q value="${esc(f.question)}"></div>
      <div class="studio-field"><label>Atbilde</label><textarea data-w-faq-a>${esc(f.answer)}</textarea></div>
      <button type="button" class="studio-btn danger" data-w-faq-del="${i}">Noņemt</button>
    </div>`).join("");

  return `
    <section class="studio-section">
      <h3>4. FAQ</h3>
      <div id="wFaqList">${html}</div>
      <button type="button" class="studio-btn" id="wAddFaq">+ Jautājums</button>
    </section>`;
}

function stepRecommendations(m) {
  return `
    <section class="studio-section">
      <h3>5. VEDMAN ieteikumi</h3>
      <div class="studio-field"><label>Virsraksts</label><input id="wRecTitle" value="${esc(m.recommendation?.title)}" placeholder="Sazinieties pirms pasūtījuma"></div>
      <div class="studio-field"><label>Ieteikuma teksts</label><textarea id="wRecText">${esc(m.recommendation?.text)}</textarea></div>
    </section>`;
}

function stepSeo(m) {
  const slug = m.basic?.urlSlug || m.urlSlug || "";
  const canonical = slug ? "https://vedman.lv/materiali/" + slug + "/" : "—";
  return `
    <section class="studio-section">
      <h3>6. SEO</h3>
      <div class="studio-field"><label>Meta title</label><input id="wMetaTitle" value="${esc(m.seo?.metaTitle)}"></div>
      <div class="studio-field"><label>Meta description</label><textarea id="wMetaDesc">${esc(m.seo?.metaDescription)}</textarea></div>
      <div class="studio-field"><label>Atslēgvārdi</label><input id="wKeywords" value="${esc(m.seo?.keywords)}" placeholder="dolomīts, šķembas, piegāde"></div>
      <div class="studio-field"><label>OG title</label><input id="wOgTitle" value="${esc(m.seo?.ogTitle)}"></div>
      <div class="studio-field"><label>OG description</label><textarea id="wOgDesc">${esc(m.seo?.ogDescription)}</textarea></div>
      <div class="studio-field"><label>Kanons. URL</label><div class="studio-canonical">${esc(canonical)}</div></div>
    </section>`;
}

function stepReview(m, ctx) {
  const score = getCompletenessScore(m);
  const publishErrors = ctx.publishErrors || [];
  const canPub = canPublishInStudio() && publishErrors.length === 0;

  const missing = score.missing.map((s) =>
    `<button type="button" class="studio-missing-item" data-jump-step="${s.wizardStep}">${esc(s.label)} — ${esc(s.missing)}</button>`
  ).join("");

  return `
    <section class="studio-section">
      <h3>7. Pārskats</h3>
      <div class="studio-score">
        <div class="studio-score-bar"><span style="width:${score.percent}%"></span></div>
        <div class="studio-score-meta"><strong>${score.percent}%</strong> pilnīgums · ${score.total}/${score.max} punkti</div>
      </div>
      ${score.missing.length ? `<div class="studio-missing"><p class="hint">Trūkstošais (klikšķini, lai pārietu):</p>${missing}</div>` : `<p class="studio-publish-ok">Visas sadaļas aizpildītas</p>`}
      ${publishErrors.length ? `<div class="studio-publish-warn">${esc(publishErrors.join("; "))}</div>` : ""}
      ${canPub ? `<button type="button" class="studio-btn primary block" id="wizardPublish" style="margin-top:12px">Publicēt materiālu</button>` : `<p class="hint">Publicēšana pieejama owner/admin ar pilnu validāciju.</p>`}
    </section>
    <section class="studio-section" id="wizardTechnicalSection">
      <h3>Saistītie materiāli</h3>
      <div id="wRelated">${renderRelatedEditor(m, ctx.allMaterials || [])}</div>
    </section>
    <section class="studio-section">
      <h3>Tehniskie dati</h3>
      ${renderTechnicalEditor(m, { compact: true })}
    </section>`;
}

export function collectWizardStepData(step, material, root) {
  if (step === 1) {
    material.basic.title = root.querySelector("#wTitle")?.value.trim() || "";
    material.basic.urlSlug = root.querySelector("#wSlug")?.value.trim() || slugifyUrl(material.basic.title);
    material.basic.slug = material.basic.urlSlug;
    material.urlSlug = material.basic.urlSlug;
    material.basic.catalogMaterial = root.querySelector("#wCategory")?.value || "";
    material.basic.materialType = material.basic.catalogMaterial.split(" ")[0] || "";
    material.basic.fraction = root.querySelector("#wFraction")?.value.trim() || "";
    material.basic.fractionDisplay = material.basic.fraction.replace(/-/g, "–") + (material.basic.fraction ? " mm" : "");
    material.basic.description = root.querySelector("#wDescription")?.value.trim() || "";
    material.basic.eyebrow = material.basic.eyebrow || ("Beramie materiāli · " + (material.basic.materialType || "Materiāls"));
  }

  if (step === 3) {
    const apps = [];
    root.querySelectorAll("[data-w-preset]:checked").forEach((cb) => {
      const preset = APPLICATION_PRESETS.find((p) => p.title === cb.value);
      if (preset) apps.push({ ...preset });
    });
    root.querySelectorAll("[data-w-custom]").forEach((item) => {
      const title = item.querySelector("[data-w-app-title]")?.value.trim();
      const text = item.querySelector("[data-w-app-text]")?.value.trim();
      if (title) apps.push({ icon: "📦", title, text });
    });
    material.applications = apps;
  }

  if (step === 4) {
    material.faq = [...root.querySelectorAll("[data-w-faq]")].map((item) => ({
      question: item.querySelector("[data-w-faq-q]")?.value.trim() || "",
      answer: item.querySelector("[data-w-faq-a]")?.value.trim() || ""
    })).filter((f) => f.question || f.answer);
  }

  if (step === 5) {
    material.recommendation = {
      title: root.querySelector("#wRecTitle")?.value.trim() || "",
      text: root.querySelector("#wRecText")?.value.trim() || ""
    };
  }

  if (step === 6) {
    material.seo = material.seo || {};
    material.seo.metaTitle = root.querySelector("#wMetaTitle")?.value.trim() || "";
    material.seo.metaDescription = root.querySelector("#wMetaDesc")?.value.trim() || "";
    material.seo.keywords = root.querySelector("#wKeywords")?.value.trim() || "";
    material.seo.ogTitle = root.querySelector("#wOgTitle")?.value.trim() || "";
    material.seo.ogDescription = root.querySelector("#wOgDesc")?.value.trim() || "";
  }

  if (step === 7) {
    material.related = readRelatedFromForm(root);
    material.technical = readTechnicalFromForm(root);
  }

  return material;
}

export { prepareImageUpload, PUBLISH_COMPLETENESS_THRESHOLD, getCompletenessScore };

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}
