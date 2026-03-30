document.documentElement.classList.add("js");

function postHeightToParent() {
  // Para iframe embeds en Xalok: ajusta altura sin scroll interno.
  if (window.parent === window) return;
  try {
    const doc = document.documentElement;
    const body = document.body;
    const height = Math.ceil(
      Math.max(
        doc?.scrollHeight || 0,
        body?.scrollHeight || 0,
        doc?.offsetHeight || 0,
        body?.offsetHeight || 0,
        doc?.getBoundingClientRect?.().height || 0,
      ),
    );
    window.parent.postMessage({ type: "bp-iframe-height", height }, "*");
  } catch {
    // noop
  }
}

function pumpHeightForAWhile() {
  // Tras cargar fuentes/imágenes, la altura puede cambiar varias veces.
  const start = Date.now();
  let timer = 0;
  function tick() {
    postHeightToParent();
    if (Date.now() - start < 5000) window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);

  // Además, un “heartbeat” corto por si rAF se pausa en el CMS.
  timer = window.setInterval(() => postHeightToParent(), 250);
  window.setTimeout(() => window.clearInterval(timer), 5000);
}

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
  const track = viewport.querySelector(".story__track");
  if (!section || !track) return;

  section.classList.add("story--enhanced");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function update() {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const maxTravelY = section.offsetHeight - viewport.offsetHeight;
    const progress = maxTravelY > 0 ? clamp((window.scrollY - sectionTop) / maxTravelY, 0, 1) : 0;

    const maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const x = -progress * maxX;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);

  const hintBtn = section.querySelector(".story__hint");
  hintBtn?.addEventListener("click", () => {
    const panels = Number.parseInt(getComputedStyle(section).getPropertyValue("--story-panels"), 10) || 6;
    const maxTravelY = section.offsetHeight - viewport.offsetHeight;
    const step = panels > 1 ? maxTravelY / (panels - 1) : 0;
    window.scrollTo({ top: window.scrollY + step, behavior: allowSmooth ? "smooth" : "auto" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  initStoryHorizontalScroll();
  postHeightToParent();
  pumpHeightForAWhile();
  window.addEventListener("resize", postHeightToParent, { passive: true });
  window.addEventListener("load", () => {
    postHeightToParent();
    pumpHeightForAWhile();
  });

  // Cuando carguen imágenes, vuelve a notificar altura
  try {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", postHeightToParent, { passive: true });
      img.addEventListener("error", postHeightToParent, { passive: true });
    });
  } catch {
    // noop
  }
  // Observa cambios de layout (fuentes, imágenes, etc.)
  try {
    const mo = new MutationObserver(() => postHeightToParent());
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
  } catch {
    // noop
  }

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
      postHeightToParent();
    });
  }
});
