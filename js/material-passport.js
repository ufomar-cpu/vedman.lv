/**
 * VEDMAN Material Passport — shared runtime
 * Reads window.VEDMAN_PASSPORT (set by per-material data script).
 */
(function () {
  "use strict";

  var cfg = window.VEDMAN_PASSPORT;
  if (!cfg) return;

  var LABELS = {
    hero: "Galvenā",
    closeup: "Tuvplāns",
    pile: "Kaudze",
    truck: "Piegāde",
    installed: "Objektā"
  };

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function imageUrl(role) {
    var img = cfg.images && cfg.images[role];
    if (!img || !img.available) return null;
    var base = cfg.imageBase || "";
    if (base.charAt(0) === "/") return base + img.file;
    return base + img.file;
  }

  function altText(role) {
    var img = cfg.images && cfg.images[role];
    return (img && img.alt) || cfg.title || "";
  }

  function placeholderHtml(role, compact) {
    var label = LABELS[role] || role;
    var title = compact ? label : cfg.title + " — " + label;
    return (
      '<div class="passport-img-placeholder" role="img" aria-label="' +
      escapeAttr(title) +
      ' — foto drīzumā"><strong>' +
      escapeAttr(title) +
      '</strong><span>Foto drīzumā — VEDMAN</span></div>'
    );
  }

  function renderImage(role, compact) {
    var url = imageUrl(role);
    if (url) {
      return (
        '<img src="' +
        escapeAttr(url) +
        '" alt="' +
        escapeAttr(altText(role)) +
        '" loading="' +
        (role === "hero" ? "eager" : "lazy") +
        '" decoding="async" width="800" height="600" data-passport-role="' +
        escapeAttr(role) +
        '" data-passport-compact="' +
        (compact ? "1" : "0") +
        '">'
      );
    }
    return placeholderHtml(role, compact);
  }

  function attachImageFallback(root) {
    if (!root) return;
    root.querySelectorAll("img[data-passport-role]").forEach(function (img) {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = "1";
      img.addEventListener("error", function () {
        var role = img.getAttribute("data-passport-role");
        var compact = img.getAttribute("data-passport-compact") === "1";
        var wrap = document.createElement("div");
        wrap.innerHTML = placeholderHtml(role, compact);
        if (wrap.firstChild) img.replaceWith(wrap.firstChild);
      });
    });
  }

  function initHero() {
    var el = document.getElementById("passportHeroMedia");
    if (el) {
      el.innerHTML = renderImage("hero", false);
      attachImageFallback(el);
    }
  }

  function initGallery() {
    var main = document.getElementById("passportGalleryMain");
    var thumbs = document.getElementById("passportGalleryThumbs");
    if (!main || !thumbs || !cfg.images) return;

    var roles = ["hero", "closeup", "pile", "truck", "installed"];

    thumbs.innerHTML = roles
      .map(function (role, i) {
        var inner = renderImage(role, true);
        return (
          '<button type="button" class="passport-thumb' +
          (i === 0 ? " active" : "") +
          '" data-role="' +
          role +
          '" role="tab" aria-selected="' +
          (i === 0 ? "true" : "false") +
          '" aria-label="' +
          escapeAttr(LABELS[role] || role) +
          '">' +
          inner +
          '<span class="passport-thumb-label">' +
          (LABELS[role] || role) +
          "</span></button>"
        );
      })
      .join("");

    main.innerHTML = renderImage("hero", false);
    attachImageFallback(main);
    attachImageFallback(thumbs);

    thumbs.querySelectorAll(".passport-thumb").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var role = btn.getAttribute("data-role");
        thumbs.querySelectorAll(".passport-thumb").forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        main.innerHTML = renderImage(role, false);
        attachImageFallback(main);
      });
    });
  }

  function initFaq() {
    document.querySelectorAll(".passport-faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".passport-faq-q").forEach(function (other) {
          if (other !== btn && other.getAttribute("aria-expanded") === "true") {
            other.setAttribute("aria-expanded", "false");
            var otherPanel = other.nextElementSibling;
            if (otherPanel) otherPanel.classList.remove("open");
            var otherIcon = other.querySelector(".passport-faq-icon");
            if (otherIcon) otherIcon.textContent = "+";
          }
        });
        var panel = btn.nextElementSibling;
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (panel) panel.classList.toggle("open", !expanded);
        var icon = btn.querySelector(".passport-faq-icon");
        if (icon) icon.textContent = expanded ? "+" : "−";
      });
    });
  }

  function initTech() {
    var toggle = document.getElementById("passportTechToggle");
    var panel = document.getElementById("passportTechPanel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var chev = toggle.querySelector(".passport-tech-chevron");
      if (chev) chev.textContent = open ? "▲" : "▼";
    });
  }

  function openPassportQuote(material, fraction) {
    if (typeof openQuote !== "function") return;
    openQuote(material || "", fraction || "", "t");
    var hint = document.getElementById("waFallback");
    if (hint) hint.classList.remove("visible");
    var closeBtn = document.getElementById("closeModal");
    if (closeBtn) closeBtn.focus();
  }

  function initQuoteTriggers() {
    document.querySelectorAll("[data-passport-quote]").forEach(function (el) {
      el.addEventListener("click", function () {
        openPassportQuote(cfg.catalogMaterial, cfg.catalogFraction);
      });
    });
  }

  function initRelated() {
    document.querySelectorAll("[data-related-quote]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openPassportQuote(
          btn.getAttribute("data-material") || "",
          btn.getAttribute("data-sub") || ""
        );
      });
    });
  }

  initHero();
  initGallery();
  initFaq();
  initTech();
  initQuoteTriggers();
  initRelated();
})();
