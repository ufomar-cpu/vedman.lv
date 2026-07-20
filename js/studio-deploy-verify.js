/**
 * Post-deploy public route verification for Studio.
 */
import { publicMaterialUrl, GENERATED_MARKER } from "./studio-route-config.js";

export async function verifyPublicDeployment(material) {
  const slug = material.basic?.urlSlug || material.urlSlug;
  if (!slug) throw new Error("Trūkst URL slug");

  const url = publicMaterialUrl(slug);
  let res;
  try {
    res = await fetch(url, { method: "GET", cache: "no-store" });
  } catch (e) {
    throw new Error("Nevar sasniegt publisko URL. Pārbaudiet pēc vietnes izvietošanas.");
  }

  if (!res.ok) {
    throw new Error("Publiskā lapa atgrieza HTTP " + res.status + " — maršruts vēl nav izvietots.");
  }

  const html = await res.text();
  const title = String(material.basic?.title || "").trim();

  if (html.includes(GENERATED_MARKER)) {
    if (!html.includes('id="passport-title">' + escapeHtml(title) + "</h1>")) {
      throw new Error("Publicētā lapa nesakrīt ar materiāla nosaukumu.");
    }
  } else if (!html.includes('rel="canonical" href="' + url + '"')) {
    throw new Error("Lapa nav atpazīta kā derīga materiāla pase.");
  }

  return {
    url,
    verifiedAt: new Date().toISOString(),
    httpStatus: res.status
  };
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
