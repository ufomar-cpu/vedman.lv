/**
 * Renders material passport page sections from structured VEDMAN_PASSPORT.content.
 */
import { safeHttpUrl, safeImageUrl } from "./dom-safe.js";

function setText(sel, text) {
  const el = document.querySelector(sel);
  if (el && text != null && text !== "") el.textContent = text;
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function appendFact(dl, label, value) {
  const wrap = document.createElement("div");
  wrap.className = "passport-fact";
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  wrap.appendChild(dt);
  wrap.appendChild(dd);
  dl.appendChild(wrap);
}

function renderFacts(content) {
  const dl = document.querySelector(".passport-facts");
  if (!dl) return;
  clearChildren(dl);
  const rows = [
    ["Frakcija", content.fractionDisplay || content.fraction || ""],
    ["Materiāla tips", content.materialType || ""],
    ["Piegāde", "Rīga · Ogre · Visa Latvija"],
    ["Pasūtījuma vienība", "Tonnas (t)"]
  ].filter((r) => r[1]);
  rows.forEach((r) => appendFact(dl, r[0], r[1]));
}

function renderApplications(apps) {
  const wrap = document.querySelector(".passport-apps");
  if (!wrap || !apps?.length) return;
  clearChildren(wrap);
  apps.forEach((a) => {
    const art = document.createElement("article");
    art.className = "passport-app";
    const icon = document.createElement("div");
    icon.className = "passport-app-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = a.icon || "📦";
    const body = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = a.title || "";
    const p = document.createElement("p");
    p.textContent = a.text || "";
    body.appendChild(h3);
    body.appendChild(p);
    art.appendChild(icon);
    art.appendChild(body);
    wrap.appendChild(art);
  });
}

function renderRecommendation(rec) {
  if (!rec) return;
  const titleEl = document.querySelector(".passport-reco h2");
  if (titleEl && rec.title) titleEl.textContent = rec.title;
  const p = document.querySelector(".passport-reco p:not(.passport-reco-kicker)");
  if (p && rec.text) p.textContent = rec.text;
}

function renderFaq(faq) {
  const wrap = document.querySelector(".passport-faq");
  if (!wrap || !faq?.length) return;
  clearChildren(wrap);
  faq.forEach((item, i) => {
    const n = i + 1;
    const itemEl = document.createElement("div");
    itemEl.className = "passport-faq-item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "passport-faq-q";
    btn.id = "faq-q" + n;
    btn.setAttribute("aria-controls", "faq-a" + n);
    btn.setAttribute("aria-expanded", "false");
    btn.appendChild(document.createTextNode(item.question || ""));
    const icon = document.createElement("span");
    icon.className = "passport-faq-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";
    btn.appendChild(icon);
    const ans = document.createElement("div");
    ans.className = "passport-faq-a";
    ans.id = "faq-a" + n;
    ans.setAttribute("role", "region");
    ans.setAttribute("aria-labelledby", "faq-q" + n);
    ans.textContent = item.answer || "";
    itemEl.appendChild(btn);
    itemEl.appendChild(ans);
    wrap.appendChild(itemEl);
  });
}

function renderRelated(related) {
  const wrap = document.querySelector(".passport-related");
  if (!wrap) return;
  clearChildren(wrap);
  (related || []).forEach((r) => {
    const card = document.createElement("article");
    card.className = "passport-related-card";
    const visual = document.createElement("div");
    visual.className = "passport-related-visual";
    visual.setAttribute("aria-hidden", "true");
    const body = document.createElement("div");
    body.className = "passport-related-body";
    const h3 = document.createElement("h3");
    h3.textContent = r.title || "";
    const p = document.createElement("p");
    p.textContent = r.subtitle || "";
    body.appendChild(h3);
    body.appendChild(p);
    const href = safeHttpUrl(r.passportUrl);
    if (href) {
      const a = document.createElement("a");
      a.className = "passport-related-btn";
      a.href = href;
      a.textContent = "Skatīt";
      body.appendChild(a);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "passport-related-btn";
      btn.setAttribute("data-related-quote", "");
      btn.dataset.material = r.catalogMaterial || "";
      btn.dataset.sub = r.catalogFraction || "";
      btn.textContent = "Uzzini cenu";
      body.appendChild(btn);
    }
    card.appendChild(visual);
    card.appendChild(body);
    wrap.appendChild(card);
  });
}

function renderTechnical(technical) {
  if (!technical || technical.visible !== true) return;
  const tbody = document.querySelector(".passport-tech-table tbody");
  if (!tbody) return;
  const rows = (technical.rows || []).filter((r) => r.verified && r.value);
  if (!rows.length) return;
  clearChildren(tbody);
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = r.label || "";
    const td = document.createElement("td");
    td.textContent = r.value || "";
    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
}

function updateMeta(cfg, seo) {
  if (seo.metaTitle) document.title = seo.metaTitle;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && seo.metaDescription) desc.setAttribute("content", seo.metaDescription);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && cfg.urlSlug) {
    canonical.setAttribute("href", "https://vedman.lv/materiali/" + cfg.urlSlug + "/");
  }
  [["og:title", seo.ogTitle || seo.metaTitle], ["og:description", seo.ogDescription || seo.metaDescription]].forEach(([prop, val]) => {
    const el = document.querySelector('meta[property="' + prop + '"]');
    if (el && val) el.setAttribute("content", val);
  });
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && cfg.urlSlug) ogUrl.setAttribute("content", "https://vedman.lv/materiali/" + cfg.urlSlug + "/");
  const hero = cfg.images?.[cfg.heroRole || "hero"];
  const ogImg = safeImageUrl(hero?.url);
  if (ogImg) {
    const el = document.querySelector('meta[property="og:image"]');
    if (el) el.setAttribute("content", ogImg);
  }
}

window.VEDMAN_PASSPORT_RENDER = function (cfg) {
  if (!cfg?.content) return;
  const c = cfg.content;
  const seo = c.seo || {};

  setText(".passport-hero .eyebrow", c.eyebrow);
  setText("#passport-title", cfg.title);
  setText(".passport-lead", c.description);
  setText(".passport-cta-band p", (cfg.title || "") + " — pieprasījums sagatavosies WhatsApp");
  setText(".passport-breadcrumb [aria-current=\"page\"]", cfg.title);

  if (c.typicalUse) {
    const note = document.querySelector(".passport-apps-note");
    if (note) note.textContent = c.typicalUse;
  }

  updateMeta(cfg, seo);

  if (c.visibility?.showFacts !== false) renderFacts(c);
  if (c.visibility?.showApplications !== false) renderApplications(c.applications);
  if (c.visibility?.showRecommendation !== false) renderRecommendation(c.recommendation);
  if (c.visibility?.showFaq !== false) renderFaq(c.faq);
  if (c.visibility?.showRelated !== false) renderRelated(c.related);
  if (c.visibility?.showTechnical === true) renderTechnical(c.technical);
};
