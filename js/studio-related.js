/**
 * Material Factory — related materials by ID (not manual HTML links).
 */
export function normalizeRelatedEntry(entry, allMaterials = []) {
  const materialId = entry?.materialId || null;
  const linked = materialId ? allMaterials.find((m) => m.id === materialId) : null;

  return {
    materialId,
    title: String(entry?.title || linked?.basic?.title || "").trim(),
    subtitle: String(entry?.subtitle || linked?.basic?.fractionDisplay || linked?.basic?.fraction || "").trim(),
    catalogMaterial: String(entry?.catalogMaterial || linked?.basic?.catalogMaterial || "").trim(),
    catalogFraction: String(entry?.catalogFraction || linked?.basic?.catalogFraction || "").trim(),
    passportUrl: null
  };
}

export function normalizeRelatedList(related, allMaterials = []) {
  return (related || [])
    .map((r) => normalizeRelatedEntry(r, allMaterials))
    .filter((r) => r.materialId || r.title);
}

export function resolveRelatedByIds(material, allMaterials = []) {
  const m = JSON.parse(JSON.stringify(material));
  m.related = (m.related || []).map((rel) => {
    const copy = { ...rel };
    if (copy.materialId) {
      const match = allMaterials.find((x) => x.id === copy.materialId && x.publishedAt);
      if (match) {
        copy.passportUrl = "/materiali/" + (match.basic?.urlSlug || match.urlSlug) + "/";
        if (!copy.title) copy.title = match.basic?.title || "";
        if (!copy.subtitle) copy.subtitle = match.basic?.fractionDisplay || match.basic?.fraction || "";
      }
      return copy;
    }
    if (copy.catalogMaterial && copy.catalogFraction) {
      const match = allMaterials.find((x) =>
        x.publishedAt &&
        x.basic?.catalogMaterial === copy.catalogMaterial &&
        x.basic?.catalogFraction === copy.catalogFraction
      );
      if (match) {
        copy.passportUrl = "/materiali/" + (match.basic?.urlSlug || match.urlSlug) + "/";
        copy.materialId = match.id;
      }
    }
    return copy;
  });
  return m;
}

export function relatedMaterialOptions(allMaterials, currentId, selectedId = "") {
  const empty = `<option value="">— izvēlēties materiālu —</option>`;
  return empty + allMaterials
    .filter((m) => m.id !== currentId)
    .map((m) => {
      const label = (m.basic?.title || m.id) + (m.publishedAt ? " · publicēts" : " · melnraksts");
      return `<option value="${escapeAttr(m.id)}"${m.id === selectedId ? " selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

export function readRelatedFromForm(root) {
  return [...root.querySelectorAll(".studio-related-item")].map((item) => ({
    materialId: item.querySelector("[data-rel-id]")?.value || null,
    title: item.querySelector("[data-rel-title]")?.value.trim() || "",
    subtitle: item.querySelector("[data-rel-subtitle]")?.value.trim() || ""
  })).filter((r) => r.materialId || r.title);
}

export function renderRelatedEditor(material, allMaterials) {
  const items = (material.related || []).length
    ? material.related
    : [{ materialId: "", title: "", subtitle: "" }];

  const html = items.map((r, i) => `
    <div class="studio-related-item" data-ridx="${i}">
      <div class="studio-field">
        <label>Saistītais materiāls (ID)</label>
        <select data-rel-id>${relatedMaterialOptions(allMaterials, material.id, r.materialId || "")}</select>
      </div>
      <div class="studio-field">
        <label>Virsraksts (pārrakstīt)</label>
        <input data-rel-title value="${escapeAttr(r.title || "")}" placeholder="Automātiski no materiāla">
      </div>
      <div class="studio-field">
        <label>Apakšvirsraksts</label>
        <input data-rel-subtitle value="${escapeAttr(r.subtitle || "")}" placeholder="Frakcija u.c.">
      </div>
      <button type="button" class="studio-btn danger" data-rel-remove="${i}">Noņemt</button>
    </div>`).join("");

  return `${html}<button type="button" class="studio-btn" id="addRelated">+ Pievienot saistīto</button>`;
}
