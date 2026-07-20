/**
 * Material Factory — structured technical data editor (no free-form HTML).
 */
export const TECHNICAL_ROW_DEFS = [
  { key: "fraction", label: "Frakcija" },
  { key: "unit", label: "Vienība" },
  { key: "density", label: "Blīvums" },
  { key: "deliveryUnit", label: "Piegādes vienība" },
  { key: "suitableFor", label: "Piemērots" },
  { key: "color", label: "Krāsa" },
  { key: "origin", label: "Izcelsme" },
  { key: "certification", label: "Sertifikācija" }
];

export function defaultTechnicalRows(partial = {}) {
  const byKey = {};
  (partial.rows || []).forEach((r) => { if (r.key) byKey[r.key] = r; });

  return TECHNICAL_ROW_DEFS.map((def) => {
    const existing = byKey[def.key] || {};
    return {
      key: def.key,
      label: def.label,
      value: String(existing.value || "").trim(),
      verified: existing.verified === true,
      visible: existing.visible !== false
    };
  });
}

export function createTechnicalBlock(partial = {}) {
  return {
    visible: partial.visible === true,
    rows: defaultTechnicalRows(partial)
  };
}

/** Rows hidden or unverified are stripped on publish via sanitizeForPublic. */
export function visibleVerifiedRows(technical) {
  return (technical?.rows || []).filter((r) =>
    r.visible !== false && r.verified === true && String(r.value || "").trim()
  );
}

export function readTechnicalFromForm(root) {
  const rows = TECHNICAL_ROW_DEFS.map((def, i) => {
    const rowEl = root.querySelector(`[data-tech-row="${def.key}"]`);
    if (!rowEl) return null;
    return {
      key: def.key,
      label: def.label,
      value: rowEl.querySelector("[data-tech-value]")?.value.trim() || "",
      verified: rowEl.querySelector("[data-tech-verified]")?.checked || false,
      visible: rowEl.querySelector("[data-tech-visible]")?.checked !== false
    };
  }).filter(Boolean);

  return {
    visible: root.querySelector("#techVisible")?.checked || false,
    rows
  };
}

export function renderTechnicalEditor(material, { compact = false } = {}) {
  const technical = material.technical || createTechnicalBlock();
  const rows = defaultTechnicalRows(technical);

  const rowHtml = rows.map((r) => `
    <div class="studio-tech-row" data-tech-row="${r.key}">
      <div class="studio-tech-row-head">
        <strong>${r.label}</strong>
        <label class="studio-tech-toggle"><input type="checkbox" data-tech-visible ${r.visible !== false ? "checked" : ""}> Rādīt</label>
      </div>
      <input class="studio-field-input" data-tech-value value="${escapeAttr(r.value)}" placeholder="${escapeAttr(r.label)}">
      <label class="studio-tech-verify"><input type="checkbox" data-tech-verified ${r.verified ? "checked" : ""}> Verificēts</label>
    </div>`).join("");

  return `
    <div class="studio-tech-editor${compact ? " compact" : ""}">
      <label class="studio-tech-section-toggle">
        <input type="checkbox" id="techVisible" ${technical.visible ? "checked" : ""}>
        Rādīt tehnisko sadaļu klientiem (tikai verificētas un redzamas rindas)
      </label>
      <div class="studio-tech-rows">${rowHtml}</div>
      <p class="hint">Slēptās rindas netiek publicētas. Neverificētas rindas netiek rādītas publiski.</p>
    </div>`;
}

function escapeAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
