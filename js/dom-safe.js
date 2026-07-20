/**
 * DOM safety helpers — escape text and allowlist URLs for href/src.
 */

export function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeHttpUrl(raw, opts = {}) {
  const allowRelative = opts.allowRelative !== false;
  const s = String(raw || "").trim();
  if (!s) return null;
  if (allowRelative && s.startsWith("/") && !s.startsWith("//")) {
    if (/^\/materiali\/[a-z0-9-]+\/?$/i.test(s)) return s;
    if (/^\/assets\//i.test(s)) return s;
    return null;
  }
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    if (host.endsWith(".firebasestorage.app") || host === "firebasestorage.googleapis.com") return u.href;
    if (host === "vedman.lv" || host.endsWith(".vedman.lv")) return u.href;
  } catch (e) { /* invalid */ }
  return null;
}

export function safeImageUrl(raw) {
  return safeHttpUrl(raw, { allowRelative: true });
}

export function sanitizePublishedImages(images) {
  if (!images || typeof images !== "object") return images;
  const out = { ...images };
  Object.keys(out).forEach((role) => {
    const img = out[role];
    if (!img || typeof img !== "object") return;
    const safe = safeImageUrl(img.url);
    out[role] = {
      ...img,
      url: safe,
      available: !!(img.available && safe)
    };
  });
  return out;
}
