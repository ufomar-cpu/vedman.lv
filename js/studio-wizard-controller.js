/**
 * Material Factory wizard — UI controller (7-step flow).
 */
import { IMAGE_ROLES } from "./media-pipeline.js";
import { slugifyUrl } from "./material-model.js";
import {
  renderWizardShell,
  renderWizardStep,
  collectWizardStepData,
  WIZARD_STEPS
} from "./studio-wizard.js";
import {
  setHeroRole,
  deleteMaterialImage
} from "./material-storage.js";

export function attachWizardController(ctx) {
  let wizardReturnFocus = null;
  let wizardKeyHandler = null;

  function focusFirstWizardField() {
    const root = document.querySelector("#studioWizard");
    if (!root) return;
    const focusable = root.querySelector(
      "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
    );
    (focusable || root.querySelector("#wizardClose"))?.focus();
  }

  function bindWizardAccessibility() {
    const root = document.querySelector("#studioWizard");
    if (!root) return;
    wizardKeyHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeWizard();
      }
    };
    root.addEventListener("keydown", wizardKeyHandler);
    focusFirstWizardField();
  }

  function unbindWizardAccessibility() {
    const root = document.querySelector("#studioWizard");
    if (root && wizardKeyHandler) root.removeEventListener("keydown", wizardKeyHandler);
    wizardKeyHandler = null;
  }
  function getMaterial() {
    return ctx.state.materials.find((m) => m.id === ctx.state.wizard.materialId);
  }

  function wizardStepBody(step, m) {
    return renderWizardStep(step, m, {
      allMaterials: ctx.state.materials,
      publishErrors: ctx.publishErrors(m)
    });
  }

  function updateWizardNav() {
    const prev = document.querySelector("#wizardPrev");
    const next = document.querySelector("#wizardNext");
    const label = document.querySelector(".studio-wizard-step-label");
    if (prev) prev.disabled = ctx.state.wizard.step <= 1;
    if (next) next.textContent = ctx.state.wizard.step >= WIZARD_STEPS.length ? "Pabeigt" : "Tālāk";
    if (label) {
      label.textContent = ctx.state.wizard.step + " / " + WIZARD_STEPS.length + " · " + WIZARD_STEPS[ctx.state.wizard.step - 1].title;
    }
    document.querySelector("#studioWizard")?.querySelectorAll("[data-step-dot]").forEach((dot) => {
      const n = Number(dot.dataset.stepDot);
      dot.classList.toggle("active", n === ctx.state.wizard.step);
      dot.classList.toggle("done", n < ctx.state.wizard.step);
    });
  }

  async function saveWizardDraft() {
    const m = getMaterial();
    const body = document.querySelector("#wizardBody");
    if (!m || !body || ctx.locks.save) return;
    collectWizardStepData(ctx.state.wizard.step, m, body);
    ctx.locks.save = true;
    ctx.setBusy(true);
    try {
      await ctx.persist(m);
      ctx.toast("Melnraksts saglabāts");
    } catch (e) {
      ctx.toast(e.message || "Neizdevās saglabāt");
    } finally {
      ctx.locks.save = false;
      ctx.setBusy(false);
    }
  }

  function bindWizardStepEvents(m) {
    const body = document.querySelector("#wizardBody");
    if (!body) return;

    document.querySelector("#wTitle")?.addEventListener("input", (e) => {
      const slugInput = document.querySelector("#wSlug");
      if (slugInput && !slugInput.dataset.touched) slugInput.value = slugifyUrl(e.target.value);
    });
    document.querySelector("#wSlug")?.addEventListener("input", (e) => {
      e.target.dataset.touched = "1";
    });

    if (ctx.state.wizard.step === 2) bindWizardMedia(m, body);
    if (ctx.state.wizard.step === 3) bindWizardApplications(m, body);
    if (ctx.state.wizard.step === 4) bindWizardFaq(m, body);
    if (ctx.state.wizard.step === 7) bindWizardReview(m, body);
  }

  function bindWizardMedia(m, body) {
    IMAGE_ROLES.forEach((role) => {
      body.querySelector(`[data-w-upload="${role}"]`)?.addEventListener("click", () => {
        body.querySelector(`[data-w-file="${role}"]`)?.click();
      });
      body.querySelector(`[data-w-file="${role}"]`)?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          await ctx.uploadForRole(m.id, role, file);
          const mat = getMaterial();
          body.innerHTML = wizardStepBody(2, mat);
          bindWizardStepEvents(mat);
        }
        e.target.value = "";
      });
      body.querySelector(`[data-w-hero="${role}"]`)?.addEventListener("click", async () => {
        const mat = getMaterial();
        if (!mat) return;
        setHeroRole(mat, role);
        await ctx.persist(mat);
        body.innerHTML = wizardStepBody(2, mat);
        bindWizardStepEvents(mat);
      });
      body.querySelector(`[data-w-del="${role}"]`)?.addEventListener("click", async () => {
        if (!confirm("Noņemt šo attēlu?")) return;
        const mat = getMaterial();
        if (!mat) return;
        try {
          deleteMaterialImage(mat, role);
          await ctx.persist(mat);
          body.innerHTML = wizardStepBody(2, mat);
          bindWizardStepEvents(mat);
        } catch (err) {
          ctx.toast(err.message || "Neizdevās dzēst");
        }
      });
    });
  }

  function bindWizardApplications(m, body) {
    document.querySelector("#wAddCustomApp")?.addEventListener("click", () => {
      m.applications = m.applications || [];
      m.applications.push({ icon: "📦", title: "", text: "" });
      collectWizardStepData(3, m, body);
      body.innerHTML = wizardStepBody(3, m);
      bindWizardStepEvents(m);
    });
    body.querySelectorAll("[data-w-app-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        collectWizardStepData(3, m, body);
        m.applications.splice(+btn.dataset.wAppRemove, 1);
        body.innerHTML = wizardStepBody(3, m);
        bindWizardStepEvents(m);
      });
    });
  }

  function bindWizardFaq(m, body) {
    document.querySelector("#wAddFaq")?.addEventListener("click", () => {
      collectWizardStepData(4, m, body);
      m.faq = m.faq || [];
      m.faq.push({ question: "", answer: "" });
      body.innerHTML = wizardStepBody(4, m);
      bindWizardStepEvents(m);
    });
    body.querySelectorAll("[data-w-faq-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        collectWizardStepData(4, m, body);
        m.faq.splice(+btn.dataset.wFaqDel, 1);
        body.innerHTML = wizardStepBody(4, m);
        bindWizardStepEvents(m);
      });
    });
  }

  function bindWizardReview(m, body) {
    body.querySelectorAll("[data-jump-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        collectWizardStepData(7, m, body);
        ctx.state.wizard.step = Number(btn.dataset.jumpStep);
        document.querySelector("#wizardBody").innerHTML = wizardStepBody(ctx.state.wizard.step, m);
        bindWizardStepEvents(m);
        updateWizardNav();
      });
    });
    document.querySelector("#addRelated")?.addEventListener("click", () => {
      collectWizardStepData(7, m, body);
      m.related = m.related || [];
      m.related.push({ materialId: "", title: "", subtitle: "" });
      body.innerHTML = wizardStepBody(7, m);
      bindWizardStepEvents(m);
    });
    body.querySelectorAll("[data-rel-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        collectWizardStepData(7, m, body);
        m.related.splice(+btn.dataset.relRemove, 1);
        body.innerHTML = wizardStepBody(7, m);
        bindWizardStepEvents(m);
      });
    });
    document.querySelector("#wizardPublish")?.addEventListener("click", async () => {
      collectWizardStepData(7, m, body);
      await ctx.persist(m);
      await ctx.doPublish(m.id);
      closeWizard();
    });
  }

  function bindWizardEvents(m) {
    const root = document.querySelector("#studioWizard");
    const body = document.querySelector("#wizardBody");
    if (!root || !body) return;

    document.querySelector("#wizardClose")?.addEventListener("click", closeWizard);
    document.querySelector("#wizardSaveDraft")?.addEventListener("click", saveWizardDraft);

    document.querySelector("#wizardPrev")?.addEventListener("click", () => {
      collectWizardStepData(ctx.state.wizard.step, m, body);
      if (ctx.state.wizard.step > 1) {
        ctx.state.wizard.step -= 1;
        body.innerHTML = wizardStepBody(ctx.state.wizard.step, m);
        bindWizardStepEvents(m);
        updateWizardNav();
      }
    });

    document.querySelector("#wizardNext")?.addEventListener("click", async () => {
      collectWizardStepData(ctx.state.wizard.step, m, body);
      if (ctx.state.wizard.step < WIZARD_STEPS.length) {
        ctx.state.wizard.step += 1;
        body.innerHTML = wizardStepBody(ctx.state.wizard.step, m);
        bindWizardStepEvents(m);
        updateWizardNav();
        if (ctx.state.wizard.step === WIZARD_STEPS.length) await saveWizardDraft();
      } else {
        await saveWizardDraft();
        closeWizard();
      }
    });

    root.querySelectorAll("[data-step-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        collectWizardStepData(ctx.state.wizard.step, m, body);
        ctx.state.wizard.step = Number(dot.dataset.stepDot);
        body.innerHTML = wizardStepBody(ctx.state.wizard.step, m);
        bindWizardStepEvents(m);
        updateWizardNav();
      });
    });

    bindWizardStepEvents(m);
  }

  function renderWizardOverlay() {
    const m = getMaterial();
    if (!m) return closeWizard();
    document.querySelector("#studioWizard")?.remove();

    const el = document.createElement("div");
    el.id = "studioWizard";
    el.className = "studio-wizard-root";
    el.innerHTML = renderWizardShell(m, ctx.state.wizard.step, {
      allMaterials: ctx.state.materials,
      publishErrors: ctx.publishErrors(m)
    });
    document.body.appendChild(el);
    bindWizardEvents(m);
    bindWizardAccessibility();
  }

  function openWizard(id, step = 1) {
    wizardReturnFocus = document.activeElement;
    ctx.state.wizard = { open: true, step, materialId: id };
    document.body.style.overflow = "hidden";
    renderWizardOverlay();
  }

  function closeWizard() {
    unbindWizardAccessibility();
    ctx.state.wizard = { open: false, step: 1, materialId: null };
    document.body.style.overflow = "";
    document.querySelector("#studioWizard")?.remove();
    ctx.render();
    if (wizardReturnFocus && typeof wizardReturnFocus.focus === "function") {
      wizardReturnFocus.focus();
    }
    wizardReturnFocus = null;
  }

  return { openWizard, closeWizard };
}
