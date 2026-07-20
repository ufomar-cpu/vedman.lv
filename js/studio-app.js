/**
 * VEDMAN Studio — Material Management (Materials · Media · Publish)
 */
import {
  bootAuth,
  loginWithEmail,
  logoutUser,
  getCurrentUserRole,
  canPublishInStudio,
  canDeleteMaterialImages,
  ROLE_LABELS
} from "./firebase-auth.js";
import { IMAGE_ROLES, IMAGE_ROLE_LABELS, prepareImageUpload } from "./media-pipeline.js";
import {
  createMaterial,
  duplicateMaterial,
  computeStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  slugifyUrl,
  hasHeroImage
} from "./material-model.js";
import { validateWrite } from "./studio-validation.js";
import {
  loadStudioData,
  saveMaterial,
  publishMaterial,
  uploadMaterialImage,
  deleteMaterialImage,
  setHeroRole,
  buildSitemapXml
} from "./material-storage.js";
import { safeImageUrl } from "./dom-safe.js";
import {
  getCompletenessScore,
  needsAttention,
  hasMissingSeo,
  PUBLISH_COMPLETENESS_THRESHOLD
} from "./studio-completeness.js";
import { attachWizardController } from "./studio-wizard-controller.js";
import { verifyPublicDeployment } from "./studio-deploy-verify.js";
import { publicMaterialUrl } from "./studio-route-config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const loginEl = $("#studioLogin");
const appEl = $("#studioApp");
const loginError = $("#studioLoginError");
const loginEmail = $("#studioLoginEmail");
const loginPass = $("#studioLoginPass");
const loginBtn = $("#studioLoginBtn");
const logoutBtn = $("#studioLogout");
const roleBadge = $("#studioRole");
const statusBar = $("#studioStatus");
const mainEl = $("#studioMain");
const toastEl = $("#studioToast");
const navBtns = $$(".studio-nav-btn");

let state = {
  view: "materials",
  materials: [],
  manifest: null,
  editing: null,
  mediaMaterialId: null,
  publishMaterialId: null,
  busy: false,
  listQuery: "",
  listFilter: "all",
  listSort: "updated_desc",
  wizard: { open: false, step: 1, materialId: null }
};

const locks = { save: false, publish: false, upload: false };
let mainEventsBound = false;
let wizardCtrl = null;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2600);
}

function showLogin(msg) {
  loginEl.hidden = false;
  appEl.hidden = true;
  if (msg) {
    loginError.textContent = msg;
    loginError.hidden = false;
  } else {
    loginError.hidden = true;
  }
}

function showApp(role) {
  loginEl.hidden = true;
  appEl.hidden = false;
  roleBadge.textContent = ROLE_LABELS[role] || role;
}

function setBusy(on) {
  state.busy = on;
  $$(".studio-btn").forEach((b) => { b.disabled = on && !b.dataset.keepEnabled; });
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch (e) {
    return "—";
  }
}

function countImages(m) {
  return Object.values(m.images || {}).filter((img) => img?.available).length;
}

function filterAndSortMaterials() {
  let list = [...state.materials];
  const q = state.listQuery.trim().toLowerCase();
  if (q) {
    list = list.filter((m) =>
      String(m.basic?.title || "").toLowerCase().includes(q) ||
      String(m.basic?.urlSlug || "").toLowerCase().includes(q) ||
      String(m.basic?.catalogMaterial || "").toLowerCase().includes(q)
    );
  }
  switch (state.listFilter) {
    case "draft":
      list = list.filter((m) => !m.publishedAt);
      break;
    case "published":
      list = list.filter((m) => m.publishedAt);
      break;
    case "needs_attention":
      list = list.filter((m) => needsAttention(m));
      break;
    case "missing_hero":
      list = list.filter((m) => !hasHeroImage(m));
      break;
    case "missing_seo":
      list = list.filter((m) => hasMissingSeo(m));
      break;
    default:
      break;
  }
  switch (state.listSort) {
    case "title_asc":
      list.sort((a, b) => String(a.basic?.title || "").localeCompare(String(b.basic?.title || ""), "lv"));
      break;
    case "complete_desc":
      list.sort((a, b) => getCompletenessScore(b).percent - getCompletenessScore(a).percent);
      break;
    case "status":
      list.sort((a, b) => String(computeStatus(a)).localeCompare(String(computeStatus(b))));
      break;
    default:
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }
  return list;
}

function completenessBar(m) {
  const s = getCompletenessScore(m);
  return `<div class="studio-mini-score" title="${s.percent}%"><span style="width:${s.percent}%"></span></div><span class="studio-mini-pct">${s.percent}%</span>`;
}

function publishErrors(m) {
  if (!m) return ["Nav materiāla"];
  return validateWrite("publish", { material: m }, { materials: state.materials, expectedRevision: m.revision }).errors;
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function statusBadge(status) {
  const color = STATUS_COLORS[status] || "#8a9199";
  return `<span class="studio-badge" style="background:${color}">${esc(STATUS_LABELS[status] || status)}</span>`;
}

function publishedCell(m) {
  if (!m.publishedAt) return '<span class="studio-no">Nē</span>';
  const status = computeStatus(m);
  if (status === "publicly_available") {
    const url = m.publicUrl || publicMaterialUrl(m.basic?.urlSlug || m.urlSlug);
    return `<span class="studio-yes">${esc(STATUS_LABELS.publicly_available)}</span><div class="studio-table-sub">${formatDate(m.publishedAt)}</div><div class="studio-table-sub"><a href="${esc(url)}" target="_blank" rel="noopener">Atvērt pasi</a></div>`;
  }
  if (status === "publish_error") {
    return `<span class="studio-error-badge">${esc(STATUS_LABELS.publish_error)}</span><div class="studio-table-sub">${esc(m.publishError || "")}</div>`;
  }
  const label = STATUS_LABELS[status] || STATUS_LABELS.deployment_pending;
  return `<span class="studio-pending">${esc(label)}</span><div class="studio-table-sub">${formatDate(m.publishedAt)}</div>`;
}

function tableActions(m) {
  const canPub = canPublishInStudio();
  const status = computeStatus(m);
  const canVerify = canPub && m.publishedAt && status !== "publicly_available";
  return `
        <button type="button" class="studio-btn" data-action="wizard" data-id="${esc(m.id)}" title="Material Factory">Fabrika</button>
        <button type="button" class="studio-btn" data-action="wizard-step" data-step="7" data-id="${esc(m.id)}">Pārskats</button>
    <button type="button" class="studio-btn" data-action="preview" data-id="${esc(m.id)}">Priekšsk.</button>
    <button type="button" class="studio-btn" data-action="duplicate" data-id="${esc(m.id)}">Dublēt</button>
    ${canVerify ? `<button type="button" class="studio-btn" data-action="verify-route" data-id="${esc(m.id)}">Pārbaudīt URL</button>` : ""}
    ${canPub ? `<button type="button" class="studio-btn primary" data-action="publish-card" data-id="${esc(m.id)}">Publicēt</button>` : ""}`;
}

function renderMaterialsView() {
  const rows = filterAndSortMaterials().map((m) => {
    const status = computeStatus(m);
    return `
      <tr data-id="${esc(m.id)}">
        <td data-label="Status">${statusBadge(status)}</td>
        <td data-label="Materiāls"><strong>${esc(m.basic?.title || "Bez nosaukuma")}</strong><div class="studio-table-sub">${esc(m.basic?.urlSlug || "—")}</div></td>
        <td data-label="Kategorija">${esc(m.basic?.catalogMaterial || "—")}</td>
        <td data-label="Pilnīgums"><div class="studio-table-score">${completenessBar(m)}</div></td>
        <td data-label="Publicēts">${publishedCell(m)}</td>
        <td data-label="Atjaunots">${formatDate(m.updatedAt)}</td>
        <td data-label="Attēli">${countImages(m)}/5</td>
        <td data-label="Darbības" class="studio-table-actions">${tableActions(m)}</td>
      </tr>`;
  }).join("");

  mainEl.innerHTML = `
    <div class="studio-factory-head">
      <div class="studio-toolbar">
        <button type="button" class="studio-btn primary" id="studioNewMaterial">+ Jauns materiāls</button>
        <button type="button" class="studio-btn" id="studioRefresh">Atjaunot</button>
      </div>
      <div class="studio-factory-filters">
        <input type="search" id="studioSearch" class="studio-field" placeholder="Meklēt materiālu…" value="${esc(state.listQuery)}">
        <select id="studioFilter" class="studio-field">
          <option value="all"${state.listFilter === "all" ? " selected" : ""}>Visi</option>
          <option value="draft"${state.listFilter === "draft" ? " selected" : ""}>Melnraksti</option>
          <option value="published"${state.listFilter === "published" ? " selected" : ""}>Publicēti</option>
          <option value="needs_attention"${state.listFilter === "needs_attention" ? " selected" : ""}>Nepieciešama uzmanība</option>
          <option value="missing_hero"${state.listFilter === "missing_hero" ? " selected" : ""}>Trūkst Hero</option>
          <option value="missing_seo"${state.listFilter === "missing_seo" ? " selected" : ""}>Trūkst SEO</option>
        </select>
        <select id="studioSort" class="studio-field">
          <option value="updated_desc"${state.listSort === "updated_desc" ? " selected" : ""}>Jaunākie</option>
          <option value="title_asc"${state.listSort === "title_asc" ? " selected" : ""}>Nosaukums A–Z</option>
          <option value="complete_desc"${state.listSort === "complete_desc" ? " selected" : ""}>Pilnīgums ↓</option>
          <option value="status"${state.listSort === "status" ? " selected" : ""}>Statuss</option>
        </select>
      </div>
      <p class="hint">Material Factory · publicēšanas minimums ${PUBLISH_COMPLETENESS_THRESHOLD}% pilnīgumam</p>
    </div>
    <div class="studio-table-wrap">
      <table class="studio-table">
        <thead>
          <tr>
            <th>Status</th><th>Materiāls</th><th>Kategorija</th><th>Pilnīgums</th>
            <th>Publicēts</th><th>Atjaunots</th><th>Attēli</th><th>Darbības</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="8">Nav materiālu.</td></tr>`}</tbody>
      </table>
    </div>`;

  $("#studioNewMaterial")?.addEventListener("click", async () => {
    const m = createMaterial({ basic: { title: "Jauns materiāls" } });
    await persist(m);
    openWizard(m.id, 1);
  });
  $("#studioRefresh")?.addEventListener("click", () => refreshData(true));
  $("#studioSearch")?.addEventListener("input", (e) => {
    state.listQuery = e.target.value;
    renderMaterialsView();
  });
  $("#studioFilter")?.addEventListener("change", (e) => {
    state.listFilter = e.target.value;
    renderMaterialsView();
  });
  $("#studioSort")?.addEventListener("change", (e) => {
    state.listSort = e.target.value;
    renderMaterialsView();
  });

  ensureMainDelegation();
}

function ensureMainDelegation() {
  if (mainEventsBound) return;
  mainEventsBound = true;
  mainEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn || !mainEl.contains(btn)) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const m = state.materials.find((x) => x.id === id);
    if (!m) return;
    if (action === "wizard") openWizard(id, 1);
    if (action === "wizard-step") openWizard(id, Number(btn.dataset.step) || 7);
    if (action === "preview") previewMaterial(m);
    if (action === "duplicate") {
      if (locks.save) return;
      const copy = duplicateMaterial(m);
      try {
        await persist(copy);
        toast("Materiāls dublēts");
        render();
      } catch (err) {
        toast(err.message || "Neizdevās dublēt");
      }
    }
    if (action === "publish-card") {
      state.publishMaterialId = id;
      setView("publish");
    }
    if (action === "verify-route") {
      await doVerifyDeployment(id);
    }
  });
}

function bindCardActions() { /* legacy noop */ }

function renderMediaView() {
  const options = state.materials.map((m) =>
    `<option value="${esc(m.id)}"${m.id === state.mediaMaterialId ? " selected" : ""}>${esc(m.basic?.title)}</option>`
  ).join("");

  const m = state.materials.find((x) => x.id === state.mediaMaterialId) || state.materials[0];
  state.mediaMaterialId = m?.id || null;

  const slots = m ? IMAGE_ROLES.map((role) => {
    const img = m.images?.[role];
    const isHero = (m.heroRole || "hero") === role;
    const src = safeImageUrl(img?.url);
    const preview = src
      ? `<img src="${esc(src)}" alt="">`
      : '<span class="ph" aria-hidden="true">📷</span>';
    return `
      <div class="studio-media-slot${isHero ? " is-hero" : ""}" data-role="${role}">
        <div class="studio-media-preview">${preview}</div>
        <div class="studio-media-label">${esc(IMAGE_ROLE_LABELS[role])}${isHero ? " · HERO" : ""}</div>
        <div class="studio-media-actions">
          <button type="button" class="studio-btn" data-media-upload="${role}">Augšup.</button>
          <button type="button" class="studio-btn" data-media-hero="${role}">Hero</button>
          ${img?.available && canDeleteMaterialImages() ? `<button type="button" class="studio-btn danger" data-media-del="${role}">Dzēst</button>` : ""}
        </div>
        <input type="file" accept="image/*,.heic,.heif" capture="environment" hidden data-file="${role}">
      </div>`;
  }).join("") : "";

  mainEl.innerHTML = `
    <div class="studio-section">
      <label for="mediaMaterialPick">Materiāls</label>
      <select id="mediaMaterialPick" class="studio-field" style="margin-top:8px">${options}</select>
    </div>
    <div class="studio-drop" id="studioMediaDrop">
      <p><strong>Ievelc attēlus</strong> vai izvēlies no telefona / galerijas</p>
      <input type="file" id="studioMediaBulk" accept="image/*,.heic,.heif" multiple capture="environment">
      <p class="hint">WEBP sagatavošana klientā (max 1600px, max 10 MB). Servera apstrāde — gatava arhitektūrai.</p>
    </div>
    <div class="studio-media-grid">${slots}</div>`;

  $("#mediaMaterialPick")?.addEventListener("change", (e) => {
    state.mediaMaterialId = e.target.value;
    renderMediaView();
  });

  const drop = $("#studioMediaDrop");
  ["dragenter", "dragover"].forEach((ev) => {
    drop?.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach((ev) => {
    drop?.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); });
  });
  drop?.addEventListener("drop", (e) => {
    handleBulkUpload(e.dataTransfer.files);
  });
  $("#studioMediaBulk")?.addEventListener("change", (e) => {
    handleBulkUpload(e.target.files);
    e.target.value = "";
  });

  if (!m) return;

  IMAGE_ROLES.forEach((role) => {
    mainEl.querySelector(`[data-media-upload="${role}"]`)?.addEventListener("click", () => {
      mainEl.querySelector(`[data-file="${role}"]`)?.click();
    });
    mainEl.querySelector(`[data-file="${role}"]`)?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) await uploadForRole(m.id, role, file);
      e.target.value = "";
    });
    mainEl.querySelector(`[data-media-hero="${role}"]`)?.addEventListener("click", async () => {
      const mat = state.materials.find((x) => x.id === m.id);
      if (!mat) return;
      setHeroRole(mat, role);
      await persist(mat);
      toast("Hero attēls iestatīts");
      renderMediaView();
    });
    mainEl.querySelector(`[data-media-del="${role}"]`)?.addEventListener("click", async () => {
      if (!confirm("Noņemt šo attēlu?")) return;
      const mat = state.materials.find((x) => x.id === m.id);
      if (!mat) return;
      deleteMaterialImage(mat, role);
      await persist(mat);
      renderMediaView();
    });
  });
}

async function handleBulkUpload(fileList) {
  const m = state.materials.find((x) => x.id === state.mediaMaterialId);
  if (!m || !fileList?.length) return;
  const files = [...fileList];
  for (let i = 0; i < Math.min(files.length, IMAGE_ROLES.length); i++) {
    await uploadForRole(m.id, IMAGE_ROLES[i], files[i]);
  }
}

async function uploadForRole(materialId, role, file) {
  if (locks.upload) {
    toast("Augšupielāde jau notiek");
    return;
  }
  locks.upload = true;
  setBusy(true);
  try {
    const m = state.materials.find((x) => x.id === materialId);
    if (!m) return;
    await uploadMaterialImage(m, role, file, prepareImageUpload);
    await persist(m);
    toast(IMAGE_ROLE_LABELS[role] + " augšupielādēts");
    render();
  } catch (e) {
    toast(e.message || "Augšupielādes kļūda");
  } finally {
    locks.upload = false;
    setBusy(false);
  }
}

function renderPublishView() {
  const m = state.materials.find((x) => x.id === state.publishMaterialId)
    || state.materials.find((x) => computeStatus(x) === "ready_to_publish")
    || state.materials[0];
  state.publishMaterialId = m?.id || null;

  const errors = m ? publishErrors(m) : ["Nav materiāla"];
  const status = m ? computeStatus(m) : "draft";
  const score = m ? getCompletenessScore(m) : null;
  const sitemapPreview = state.manifest ? buildSitemapXml(state.manifest) : "";

  mainEl.innerHTML = `
    <div class="studio-publish-box">
      <h3>Publicēt materiālu</h3>
      <div class="studio-field">
        <label for="publishPick">Izvēle</label>
        <select id="publishPick">${state.materials.map((x) =>
    `<option value="${esc(x.id)}"${x.id === m?.id ? " selected" : ""}>${esc(x.basic?.title)} (${esc(STATUS_LABELS[computeStatus(x)])})</option>`
  ).join("")}</select>
      </div>
      ${m ? `
        <p><strong>${esc(m.basic?.title)}</strong> · ${esc(m.basic?.urlSlug)}</p>
        ${statusBadge(status)}
        ${score ? `<div class="studio-score" style="margin-top:10px"><div class="studio-score-bar"><span style="width:${score.percent}%"></span></div><div class="studio-score-meta">Pilnīgums: <strong>${score.percent}%</strong> (minimums ${PUBLISH_COMPLETENESS_THRESHOLD}%)</div></div>` : ""}
        ${errors.length ? `<div class="studio-publish-warn">Nevar publicēt: ${esc(errors.join("; "))}</div>` : `<div class="studio-publish-ok">Gatavs publicēšanai</div>`}
        <button type="button" class="studio-btn primary block" id="studioPublishBtn" ${errors.length ? "disabled" : ""} style="margin-top:12px">Publicēt</button>
      ` : "<p>Nav materiālu.</p>"}
    </div>
    <div class="studio-publish-box">
      <h3>Ko sistēma atjaunina</h3>
      <ul class="studio-publish-list">
        <li>Pases dati → Firebase Storage (<code>studio/published/</code>)</li>
        <li>Manifests un meklēšanas indekss (Storage)</li>
        <li>Storage sitemap priekšskatījums (nav galīgais <code>sitemap.xml</code>)</li>
        <li>Statiskās lapas (<code>materiali/{slug}/</code>) tiek ģenerētas build laikā pirms GitHub Pages izvietošanas</li>
      </ul>
      <p class="hint">Pēc publicēšanas statuss ir “Gaida vietnes izvietošanu”. Pārbaudiet publisko URL tikai pēc veiksmīga deploy.</p>
      <button type="button" class="studio-btn block" id="studioDownloadSitemap" style="margin-top:10px">Lejupielādēt sitemap.xml</button>
      <textarea readonly class="studio-field" style="margin-top:10px;font-size:11px;min-height:80px">${esc(sitemapPreview.slice(0, 800))}${sitemapPreview.length > 800 ? "…" : ""}</textarea>
    </div>`;

  $("#publishPick")?.addEventListener("change", (e) => {
    state.publishMaterialId = e.target.value;
    renderPublishView();
  });

  $("#studioPublishBtn")?.addEventListener("click", () => doPublish(m.id));
  $("#studioDownloadSitemap")?.addEventListener("click", () => {
    const xml = buildSitemapXml(state.manifest || { sitemap: [{ loc: "https://vedman.lv/" }] });
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

async function doVerifyDeployment(id) {
  const m = state.materials.find((x) => x.id === id);
  if (!m || state.busy || locks.save) return;
  locks.save = true;
  setBusy(true);
  try {
    const result = await verifyPublicDeployment(m);
    m.publicationState = "publicly_available";
    m.publicVerifiedAt = result.verifiedAt;
    m.publishError = null;
    await persist(m);
    toast("Publiski pieejams: " + result.url);
    render();
  } catch (e) {
    m.publicationState = "deployment_pending";
    m.publishError = e.message || "Pārbaudes kļūda";
    try { await persist(m); } catch (_) { /* ignore */ }
    toast(e.message || "Publiskā lapa vēl nav pieejama");
    render();
  } finally {
    locks.save = false;
    setBusy(false);
  }
}

async function doPublish(id) {
  const m = state.materials.find((x) => x.id === id);
  if (!m || state.busy || locks.publish) return;
  locks.publish = true;
  setBusy(true);
  try {
    const result = await publishMaterial(m, { expectedRevision: m.revision });
    state.manifest = result.manifest;
    state.materials = result.materials;
    const published = state.materials.find((x) => x.id === id);
    const status = computeStatus(published);
    if (status === "publicly_available") {
      toast("Dati publicēti · " + (published.publicUrl || ""));
    } else {
      toast("Dati publicēti Storage. Lapa būs pieejama pēc vietnes build un izvietošanas.");
    }
    render();
  } catch (e) {
    toast(e.message || "Publicēšanas kļūda");
  } finally {
    locks.publish = false;
    setBusy(false);
  }
}

function initWizard() {
  if (wizardCtrl) return wizardCtrl;
  wizardCtrl = attachWizardController({
    state,
    locks,
    persist,
    toast,
    setBusy,
    render,
    publishErrors,
    uploadForRole,
    doPublish
  });
  return wizardCtrl;
}

function openWizard(id, step = 1) {
  initWizard().openWizard(id, step);
}

function openEdit(id) {
  openWizard(id, 1);
}

function closeWizard() {
  initWizard().closeWizard();
}

function closeEdit() {
  closeWizard();
}

function previewMaterial(m) {
  const slug = m.basic?.urlSlug || m.urlSlug;
  if (slug) window.open("/materiali/" + slug + "/index.html", "_blank", "noopener");
  else toast("Nav URL slug");
}

async function persist(material) {
  const expectedRevision = Number(material.revision || 0);
  const result = await saveMaterial(material, {
    manifest: state.manifest,
    materials: state.materials,
    expectedRevision
  });
  state.manifest = result.manifest;
  state.materials = result.materials;
  return result.material;
}

async function refreshData(forceRemote = false) {
  setBusy(true);
  try {
    const data = await loadStudioData(forceRemote);
    state.materials = data.materials;
    state.manifest = data.manifest;
    statusBar.textContent = "Firebase savienots · " + state.materials.length + " materiāli";
    statusBar.classList.add("ready");
    render();
  } catch (e) {
    statusBar.textContent = "Kļūda: " + (e.message || e);
    toast(e.message || "Kļūda");
  } finally {
    setBusy(false);
  }
}

function setView(view) {
  state.view = view;
  navBtns.forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (state.wizard.open) closeWizard();
  render();
}

function render() {
  if (state.view === "materials") renderMaterialsView();
  if (state.view === "media") renderMediaView();
  if (state.view === "publish") renderPublishView();
}

async function doLogin() {
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = "Pieslēdzas...";
  try {
    await loginWithEmail(loginEmail.value.trim(), loginPass.value);
  } catch (e) {
    loginError.textContent = "Nepareizs e-pasts vai parole.";
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Ieiet";
  }
}

loginBtn?.addEventListener("click", doLogin);
loginPass?.addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });
logoutBtn?.addEventListener("click", async () => {
  await logoutUser();
  showLogin();
});

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

bootAuth(
  async (user, role) => {
    if (!user || !role) {
      showLogin();
      return;
    }
    showApp(role);
    await refreshData();
  },
  (e) => showLogin(e.message)
);
