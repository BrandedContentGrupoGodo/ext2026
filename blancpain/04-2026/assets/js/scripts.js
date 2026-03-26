document.documentElement.classList.add("js");

function initRevealOnScroll() {
  document.documentElement.classList.add("js-loaded");

  const elementsToReveal = document.querySelectorAll(".reveal-on-scroll");
  if (!elementsToReveal.length) return;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.15,
    },
  );

  elementsToReveal.forEach((item) => observer.observe(item));
}

function initStoryHorizontalScroll() {
  const viewport = document.querySelector(".story__viewport");
  if (!viewport) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const allowSmooth = !reducedMotion;
  const section = viewport.closest(".story");
  if (!section) return;

  function canMove(delta) {
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (max <= 0) return false;
    if (delta > 0) return viewport.scrollLeft < max - 1;
    return viewport.scrollLeft > 1;
  }

  function normalizeDelta(event) {
    const primary = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (event.deltaMode === 1) return primary * 16;
    if (event.deltaMode === 2) return primary * window.innerHeight;
    return primary;
  }

  window.addEventListener(
    "wheel",
    (event) => {
      const rect = section.getBoundingClientRect();
      const active = rect.top < window.innerHeight && rect.bottom > 0;
      if (!active) return;
      const delta = normalizeDelta(event);
      if (!delta || !canMove(delta)) return;
      event.preventDefault();
      viewport.scrollLeft += delta;
    },
    { passive: false, capture: true },
  );

  const hintBtn = section.querySelector(".story__hint");
  hintBtn?.addEventListener("click", () => {
    viewport.scrollBy({ left: viewport.clientWidth, behavior: allowSmooth ? "smooth" : "auto" });
    viewport.focus({ preventScroll: true });
  });
}

function initSplitStickyFallback() {
  const split = document.querySelector(".split");
  const media = split?.querySelector(".split__media");
  if (!split || !media) return;

  const mq = window.matchMedia("(min-width: 900px)");

  function resetStyles() {
    media.style.position = "";
    media.style.top = "";
    media.style.left = "";
    media.style.bottom = "";
    media.style.width = "";
    media.style.height = "";
  }

  function update() {
    if (!mq.matches) {
      resetStyles();
      return;
    }

    const splitRect = split.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();
    const inPinRange = splitRect.top <= 0 && splitRect.bottom > window.innerHeight;
    const afterPin = splitRect.bottom <= window.innerHeight;

    if (inPinRange) {
      media.style.position = "fixed";
      media.style.top = "0";
      media.style.left = `${mediaRect.left}px`;
      media.style.width = `${mediaRect.width}px`;
      media.style.height = "100vh";
      media.style.bottom = "";
      return;
    }

    if (afterPin) {
      media.style.position = "absolute";
      media.style.top = "auto";
      media.style.left = "0";
      media.style.bottom = "0";
      media.style.width = "50%";
      media.style.height = "100vh";
      return;
    }

    resetStyles();
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  initStoryHorizontalScroll();
  initSplitStickyFallback();

  const scrollLink = document.querySelector(".hero__scroll");
  if (scrollLink) {
    scrollLink.addEventListener("click", (event) => {
      const href = scrollLink.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }
});
