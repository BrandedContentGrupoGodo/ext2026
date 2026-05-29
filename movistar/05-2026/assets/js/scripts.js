(() => {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cta = document.querySelector(".cmp-heroCine__cta");
  if (!cta) return;

  let activeRaf = 0;

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const isNaturallyFocusable = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const focusableTags = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"]);
    if (focusableTags.has(el.tagName)) return true;
    const tabindex = el.getAttribute("tabindex");
    return tabindex !== null && tabindex !== "-1";
  };

  const focusTarget = (el) => {
    if (!el || typeof el.focus !== "function") return;

    let hadTempTabindex = false;
    if (!isNaturallyFocusable(el)) {
      el.setAttribute("tabindex", "-1");
      hadTempTabindex = true;
    }

    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }

    if (hadTempTabindex) {
      const cleanup = () => {
        el.removeAttribute("tabindex");
        el.removeEventListener("blur", cleanup);
      };
      el.addEventListener("blur", cleanup, { once: true });
    }
  };

  const smoothScrollTo = ({ top, onDone }) => {
    if (activeRaf) cancelAnimationFrame(activeRaf);

    const startY = window.scrollY || 0;
    const delta = top - startY;
    const distance = Math.abs(delta);

    // Duración adaptativa: más marcada y editorial
    const duration = Math.min(1450, Math.max(650, distance * 0.85));
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);

      // Overshoot sutil al final (más perceptible, sin marear)
      const overshootPx = Math.min(36, Math.max(14, distance * 0.03));
      const overshootPhase = t > 0.78 ? (t - 0.78) / 0.22 : 0;
      const overshootEase = overshootPhase > 0 ? easeInOutCubic(Math.min(1, overshootPhase)) : 0;
      const overshoot = overshootEase * overshootPx;

      const y = startY + delta * eased + overshoot;
      window.scrollTo(0, y);

      if (t < 1) {
        activeRaf = requestAnimationFrame(tick);
      } else {
        activeRaf = 0;
        // Corrige al punto exacto para evitar acumulación
        window.scrollTo(0, top);
        if (typeof onDone === "function") onDone();
      }
    };

    activeRaf = requestAnimationFrame(tick);
  };

  cta.addEventListener("click", (event) => {
    const href = cta.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    if (prefersReducedMotion) return; // deja el salto nativo (anchor)

    event.preventDefault();

    const targetTop =
      (window.scrollY || 0) + target.getBoundingClientRect().top;

    smoothScrollTo({
      top: Math.max(0, targetTop),
      onDone: () => {
        // Actualiza hash sin salto
        try {
          history.pushState(null, "", href);
        } catch {
          // noop
        }
        focusTarget(target);
      },
    });
  });
})();

(() => {
  const v = document.querySelector(".cmp-heroCine__video");
  if (!v) return;

  const tryPlay = () => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  // Intento inicial
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryPlay, { once: true });
  } else {
    tryPlay();
  }

  // Si el navegador bloquea autoplay (battery/data saver), se activará al primer gesto
  const onFirstUserGesture = () => {
    tryPlay();
    window.removeEventListener("pointerdown", onFirstUserGesture, true);
    window.removeEventListener("keydown", onFirstUserGesture, true);
    window.removeEventListener("touchstart", onFirstUserGesture, true);
  };

  window.addEventListener("pointerdown", onFirstUserGesture, true);
  window.addEventListener("keydown", onFirstUserGesture, true);
  window.addEventListener("touchstart", onFirstUserGesture, true);
})();

(() => {
  const dialog = document.querySelector(".cmp-galeriaEditorial__dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const dialogImg = dialog.querySelector(".cmp-galeriaEditorial__dialogImg");
  const closeBtn = dialog.querySelector(".cmp-galeriaEditorial__dialogClose");
  if (!dialogImg || !closeBtn) return;

  const resolveImageUrl = (trigger) => {
    const img = trigger.querySelector("img");
    const imgSrc = img && (img.currentSrc || img.getAttribute("src"));
    if (imgSrc) return imgSrc;

    const href = trigger.getAttribute("href");
    if (!href) return "";
    try {
      return new URL(href, document.baseURI).href;
    } catch {
      return href;
    }
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target && event.target.closest && event.target.closest('a[data-lightbox="true"]');
    if (!trigger) return;

    const imageUrl = resolveImageUrl(trigger);
    if (!imageUrl) return;

    const img = trigger.querySelector("img");
    const alt = img ? img.getAttribute("alt") : "";

    event.preventDefault();
    dialogImg.src = imageUrl;
    dialogImg.alt = alt || "";
    dialog.showModal();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
