/**
 * Loads published material passport data from Firebase Storage (public read).
 * Optional static window.VEDMAN_PASSPORT overlay (hand-maintained pages).
 */
(function () {
  "use strict";

  var SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function bucketName() {
    return (window.VEDMAN_FIREBASE_CONFIG && window.VEDMAN_FIREBASE_CONFIG.storageBucket) || "vedman-lv.firebasestorage.app";
  }

  function storagePublicUrl(path) {
    return "https://firebasestorage.googleapis.com/v0/b/" + bucketName() + "/o/" + encodeURIComponent(path) + "?alt=media";
  }

  function urlSlugFromPath() {
    var m = location.pathname.match(/\/materiali\/([^/]+)\/?/);
    return m ? m[1] : (window.VEDMAN_PASSPORT_SLUG || null);
  }

  function isValidSlug(slug) {
    return typeof slug === "string" && SLUG_RE.test(slug) && slug.length <= 80 && slug.indexOf("..") === -1;
  }

  function isValidPublishedPayload(data) {
    return data && typeof data === "object" && typeof data.title === "string" && typeof data.urlSlug === "string";
  }

  function mergePassportConfig(staticCfg, published) {
    if (!published || !isValidPublishedPayload(published)) return staticCfg;
    if (!staticCfg) return published;
    return Object.assign({}, staticCfg, {
      slug: published.slug,
      urlSlug: published.urlSlug,
      title: published.title,
      catalogMaterial: published.catalogMaterial,
      catalogFraction: published.catalogFraction,
      imageBase: published.imageBase,
      images: published.images,
      content: published.content
    });
  }

  function fetchWithTimeout(url, ms) {
    if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
      return fetch(url, { cache: "no-store", signal: AbortSignal.timeout(ms) });
    }
    return fetch(url, { cache: "no-store" });
  }

  window.VEDMAN_PASSPORT_LOADED = false;
  window.VEDMAN_PASSPORT_NOT_FOUND = false;

  window.VEDMAN_PASSPORT_INIT = function () {
    return Promise.resolve(window.VEDMAN_PASSPORT);
  };

  var slug = urlSlugFromPath();
  if (window.VEDMAN_PASSPORT && isValidPublishedPayload(window.VEDMAN_PASSPORT)) {
    window.VEDMAN_PASSPORT_LOADED = true;
    return;
  }

  if (!slug) {
    window.VEDMAN_PASSPORT_LOADED = true;
    return;
  }

  if (!isValidSlug(slug)) {
    window.VEDMAN_PASSPORT_NOT_FOUND = true;
    window.VEDMAN_PASSPORT_LOADED = true;
    return;
  }

  var url = storagePublicUrl("studio/published/" + slug + ".json");

  window.VEDMAN_PASSPORT_INIT = fetchWithTimeout(url, 8000)
    .then(function (res) {
      if (!res.ok) {
        if (!window.VEDMAN_PASSPORT) window.VEDMAN_PASSPORT_NOT_FOUND = true;
        return window.VEDMAN_PASSPORT || null;
      }
      return res.text();
    })
    .then(function (text) {
      if (!text) {
        if (!window.VEDMAN_PASSPORT) window.VEDMAN_PASSPORT_NOT_FOUND = true;
        return window.VEDMAN_PASSPORT || null;
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        if (!window.VEDMAN_PASSPORT) window.VEDMAN_PASSPORT_NOT_FOUND = true;
        return window.VEDMAN_PASSPORT || null;
      }
    })
    .then(function (published) {
      if (published && isValidPublishedPayload(published)) {
        if (published.urlSlug !== slug) {
          window.VEDMAN_PASSPORT_NOT_FOUND = true;
          window.VEDMAN_PASSPORT_LOADED = true;
          return null;
        }
        window.VEDMAN_PASSPORT = mergePassportConfig(window.VEDMAN_PASSPORT, published);
        if (window.VEDMAN_PASSPORT) window.VEDMAN_PASSPORT_PUBLISHED = true;
      } else if (!window.VEDMAN_PASSPORT) {
        window.VEDMAN_PASSPORT_NOT_FOUND = true;
      }
      window.VEDMAN_PASSPORT_LOADED = true;
      return window.VEDMAN_PASSPORT || null;
    })
    .catch(function () {
      if (!window.VEDMAN_PASSPORT) window.VEDMAN_PASSPORT_NOT_FOUND = true;
      window.VEDMAN_PASSPORT_LOADED = true;
      return window.VEDMAN_PASSPORT || null;
    });
})();
