(() => {
  const root = document.querySelector(".timeline");
  if (!root) return;

  const track = root.querySelector(".timeline__track");
  const slides = Array.from(root.querySelectorAll(".timeline__slide"));
  const prevBtn = root.querySelector(".timeline__nav--prev");
  const nextBtn = root.querySelector(".timeline__nav--next");
  const dialog = root.querySelector(".imgModal");
  const dialogImg = dialog?.querySelector(".imgModal__img");
  const dialogClose = dialog?.querySelector(".imgModal__close");

  if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const getIndexFromScroll = () => {
    const slideWidth = track.clientWidth;
    if (!slideWidth) return 0;
    return Math.round(track.scrollLeft / slideWidth);
  };

  const updateUI = () => {
    const idx = Math.max(0, Math.min(slides.length - 1, getIndexFromScroll()));
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === slides.length - 1;
  };

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, idx));
    const left = clamped * track.clientWidth;
    track.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  prevBtn.addEventListener("click", () => goTo(getIndexFromScroll() - 1));
  nextBtn.addEventListener("click", () => goTo(getIndexFromScroll() + 1));

  let raf = 0;
  track.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateUI);
  }, { passive: true });

  window.addEventListener("resize", () => updateUI(), { passive: true });

  updateUI();

  if (dialog && dialogImg && dialogClose) {
    const openFromImg = (imgEl) => {
      const src = imgEl.getAttribute("src");
      const alt = imgEl.getAttribute("alt") || "";
      if (!src) return;
      dialogImg.src = src;
      dialogImg.alt = alt;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      dialogClose.focus();
    };

    root.addEventListener("click", (e) => {
      const btn = e.target?.closest?.(".timelineCard__zoom");
      if (!btn) return;
      const img = btn.querySelector("img");
      if (img) openFromImg(img);
    });

    dialogClose.addEventListener("click", () => dialog.close?.());

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close?.();
    });

    dialog.addEventListener("close", () => {
      dialogImg.removeAttribute("src");
      dialogImg.alt = "";
    });
  }
})();

(() => {
  const root = document.querySelector(".miniGallery");
  if (!root) return;

  const track = root.querySelector(".miniGallery__slides");
  const slides = Array.from(root.querySelectorAll(".miniGallery__slide"));
  const dots = Array.from(root.querySelectorAll(".miniGallery__dot"));
  const dialog = document.querySelector(".imgModal");
  const dialogImg = dialog?.querySelector(".imgModal__img");
  const dialogClose = dialog?.querySelector(".imgModal__close");

  if (!track || slides.length === 0 || dots.length === 0) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const AUTOPLAY_MS = 3500;
  let autoplayId = 0;
  let activeIdx = 0;

  const getIndexFromScroll = () => {
    const w = track.clientWidth;
    if (!w) return 0;
    return Math.round(track.scrollLeft / w);
  };

  const setActive = (idx) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, idx));
    activeIdx = clamped;
    dots.forEach((d, i) => {
      if (i === clamped) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    const left = clamped * track.clientWidth;
    track.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  const stopAutoplay = () => {
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = 0;
  };

  const startAutoplay = () => {
    if (prefersReducedMotion || autoplayId) return;
    autoplayId = window.setInterval(() => {
      const next = (activeIdx + 1) % slides.length;
      setActive(next);
    }, AUTOPLAY_MS);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-mini-dot"));
      if (!Number.isNaN(idx)) setActive(idx);
      stopAutoplay();
    });
  });

  root.addEventListener("pointerdown", stopAutoplay, { passive: true });
  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);

  let raf = 0;
  track.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const idx = Math.max(0, Math.min(slides.length - 1, getIndexFromScroll()));
      activeIdx = idx;
      dots.forEach((d, i) => {
        if (i === idx) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    });
  }, { passive: true });

  window.addEventListener("resize", () => setActive(activeIdx), { passive: true });

  if (dialog && dialogImg && dialogClose) {
    const openFromImg = (imgEl) => {
      const src = imgEl.getAttribute("src");
      const alt = imgEl.getAttribute("alt") || "";
      if (!src) return;
      dialogImg.src = src;
      dialogImg.alt = alt;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      dialogClose.focus();
    };

    root.addEventListener("click", (e) => {
      const btn = e.target?.closest?.(".miniGallery__zoom");
      if (!btn) return;
      const img = btn.querySelector("img");
      if (img) openFromImg(img);
      stopAutoplay();
    });
  }

  setActive(0);
  startAutoplay();
})();
