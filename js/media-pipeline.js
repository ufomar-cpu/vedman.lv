/**
 * Shared image upload pipeline — validation, orientation, conservative scaling.
 */
export const IMAGE_ROLES = ["hero", "closeup", "pile", "truck", "installed"];

export const IMAGE_ROLE_LABELS = {
  hero: "Galvenā",
  closeup: "Tuvplāns",
  pile: "Kaudze",
  truck: "Piegāde",
  installed: "Objektā"
};

export const MAX_MATERIAL_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_GALLERY_VIDEO_BYTES = 50 * 1024 * 1024;
/** @deprecated use MAX_MATERIAL_IMAGE_BYTES */
export const MAX_UPLOAD_BYTES = MAX_MATERIAL_IMAGE_BYTES;
export const MAX_OUTPUT_WIDTH = 1600;
export const MAX_OUTPUT_HEIGHT = 1600;
export const MAX_CANVAS_PIXELS = 16_000_000;
export const WEBP_QUALITY = 0.82;

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/pjpeg"
]);

export function getExtension(name) {
  const m = String(name || "").toLowerCase().match(/(\.[a-z0-9]+)$/);
  return m ? m[1] : "";
}

export function validateImageFile(file) {
  const errors = [];
  if (!file) return { ok: false, errors: ["Nav faila"] };
  if (!(file instanceof Blob)) errors.push("Nederīgs fails");
  if (file.size <= 0) errors.push("Fails ir tukšs");
  if (file.size > MAX_MATERIAL_IMAGE_BYTES) errors.push("Fails pārāk liels (maks. 10 MB)");
  const ext = getExtension(file.name);
  if (!ALLOWED_EXT.has(ext)) errors.push("Neatbalstīts faila paplašinājums");
  const mime = String(file.type || "").toLowerCase();
  if (mime && !mime.startsWith("image/")) errors.push("Fails nav attēls");
  if (mime && !ALLOWED_MIME.has(mime) && mime !== "image/jpg") {
    if (!/\.heic|\.heif$/i.test(file.name)) errors.push("Neatbalstīts MIME tips");
  }
  return { ok: errors.length === 0, errors };
}

export function safeName(name) {
  return (
    name.toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9āčēģīķļņōŗšūž-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "vedman"
  ) + "-" + Date.now();
}

async function decodeToBitmap(file) {
  if (typeof createImageBitmap !== "undefined") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (e) { /* fallback below */ }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        draw(ctx, w, h) { ctx.drawImage(img, 0, 0, w, h); },
        close() {}
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Attēlu nevar nolasīt. Mēģiniet JPG/PNG vai mazāku failu."));
    };
    img.src = url;
  });
}

function fitDimensions(width, height, maxW, maxH, maxPixels) {
  let w = width;
  let h = height;
  if (w * h > maxPixels) {
    const scale = Math.sqrt(maxPixels / (w * h));
    w = Math.max(1, Math.floor(w * scale));
    h = Math.max(1, Math.floor(h * scale));
  }
  if (w > maxW) {
    h = Math.round(h * maxW / w);
    w = maxW;
  }
  if (h > maxH) {
    w = Math.round(w * maxH / h);
    h = maxH;
  }
  return { w: Math.max(1, w), h: Math.max(1, h) };
}

async function bitmapToWebpBlob(bitmap) {
  const { w, h } = fitDimensions(bitmap.width, bitmap.height, MAX_OUTPUT_WIDTH, MAX_OUTPUT_HEIGHT, MAX_CANVAS_PIXELS);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (bitmap.draw) bitmap.draw(ctx, w, h);
  else ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("WEBP konversija neizdevās"))), "image/webp", WEBP_QUALITY);
  });
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

export async function prepareImageUpload(file) {
  const check = validateImageFile(file);
  if (!check.ok) throw new Error(check.errors.join(". "));

  try {
    const bitmap = await decodeToBitmap(file);
    const blob = await bitmapToWebpBlob(bitmap);
    return { blob, ext: ".webp", mime: "image/webp", webpReady: true, bytes: blob.size };
  } catch (e) {
    const ext = getExtension(file.name);
    if (ext === ".heic" || ext === ".heif") {
      throw new Error("HEIC neizdevās konvertēt šajā pārlūkā. Saglabājiet kā JPG un mēģiniet vēlreiz.");
    }
    throw e;
  }
}

export function canCanvasCompress(file) {
  return validateImageFile(file).ok;
}

/** @deprecated use prepareImageUpload */
export function imageToWebp(file, maxWidth = MAX_OUTPUT_WIDTH, quality = WEBP_QUALITY) {
  return prepareImageUpload(file).then((r) => r.blob);
}
