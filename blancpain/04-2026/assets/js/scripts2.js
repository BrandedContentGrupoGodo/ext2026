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

function initSplitStickyFallback() {
  const split = document.querySelector(".split");
  const media = split?.querySelector(".split__media");
  if (!split || !media) return;

  const mq = window.matchMedia("(min-width: 900px)");

  // Fallback SOLO si sticky no funciona (muchos CMS rompen sticky por overflow/containers)
  function stickySeemsBroken() {
    if (!mq.matches) return false;
    const rect = split.getBoundingClientRect();
    if (!(rect.top < 0 && rect.bottom > window.innerHeight)) return false;
    // Si sticky funcionara, el top del media estaría muy cerca de 0 cuando el split está “pinneado”
    const mediaRect = media.getBoundingClientRect();
    return Math.abs(mediaRect.top) > 24;
  }

  let pin = {
    active: false,
    left: 0,
    width: 0,
  };

  function reset() {
    pin.active = false;
    media.style.position = "";
    media.style.top = "";
    media.style.left = "";
    media.style.width = "";
    media.style.height = "";
    media.style.bottom = "";
  }

  function update() {
    if (!mq.matches) {
      reset();
      return;
    }

    if (!stickySeemsBroken()) {
      // Si sticky va bien, no tocar estilos inline.
      reset();
      return;
    }

    const splitRect = split.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();
    const inPinRange = splitRect.top <= 0 && splitRect.bottom > window.innerHeight;
    const afterPin = splitRect.bottom <= window.innerHeight;

    if (inPinRange) {
      if (!pin.active) {
        pin.active = true;
        pin.left = mediaRect.left;
        pin.width = mediaRect.width;
      }
      media.style.position = "fixed";
      media.style.top = "0";
      media.style.left = `${pin.left}px`;
      media.style.width = `${pin.width}px`;
      media.style.height = "100vh";
      media.style.bottom = "";
      return;
    }

    if (afterPin) {
      // Ancla al final del split sin desplazar lateralmente
      reset();
      media.style.position = "absolute";
      media.style.left = "0";
      media.style.bottom = "0";
      media.style.width = "100%";
      media.style.height = "100vh";
      return;
    }

    reset();
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => {
    pin.active = false;
    update();
  });
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
