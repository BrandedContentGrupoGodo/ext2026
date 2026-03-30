document.documentElement.classList.add("js");
document.documentElement.dataset.bpLanding = "1";

function getScrollParent(startEl) {
  const scrollingElement = document.scrollingElement || document.documentElement;
  let el = startEl?.parentElement || null;
  while (el) {
    const styles = window.getComputedStyle(el);
    const overflowY = styles.overflowY;
    const canScrollY = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 2;
    if (canScrollY) return el;
    el = el.parentElement;
  }

  // En muchos CMS el scroll ocurre en body/html (scrollingElement)
  if (scrollingElement && scrollingElement.scrollHeight > scrollingElement.clientHeight + 2) {
    return scrollingElement;
  }

  if (document.body && document.body.scrollHeight > document.body.clientHeight + 2) {
    return document.body;
  }

  return window;
}

function getScrollTop(scroller) {
  if (scroller === window) return window.scrollY;
  return scroller.scrollTop || 0;
}

function getViewportHeight(scroller) {
  if (scroller === window) return window.innerHeight;
  return scroller.clientHeight || window.innerHeight;
}

function getRectInScroller(el, scroller) {
  const elRect = el.getBoundingClientRect();
  if (scroller === window) return elRect;
  const scrollerRect = scroller.getBoundingClientRect();
  return {
    top: elRect.top - scrollerRect.top,
    bottom: elRect.bottom - scrollerRect.top,
    left: elRect.left - scrollerRect.left,
    right: elRect.right - scrollerRect.left,
    width: elRect.width,
    height: elRect.height,
  };
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

  const scroller = getScrollParent(section);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function canEnhance() {
    const maxTravelY = section.offsetHeight - viewport.offsetHeight;
    const maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
    return maxTravelY > 8 && maxX > 8;
  }

  function setEnhanced(enabled) {
    if (enabled) section.classList.add("story--enhanced");
    else section.classList.remove("story--enhanced");
  }

  function update() {
    if (!canEnhance()) {
      // Si el CMS rompe alturas/scroll, volvemos al fallback nativo horizontal
      setEnhanced(false);
      track.style.transform = "";
      return;
    }

    setEnhanced(true);
    const rect = getRectInScroller(section, scroller);
    const sectionTop = getScrollTop(scroller) + rect.top;
    const maxTravelY = section.offsetHeight - viewport.offsetHeight;
    const progress =
      maxTravelY > 0 ? clamp((getScrollTop(scroller) - sectionTop) / maxTravelY, 0, 1) : 0;

    const maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const x = -progress * maxX;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  // En algunos CMS los eventos de scroll pueden no dispararse de forma fiable:
  // mantenemos un loop suave por rAF (barato) para sincronizar el track.
  let raf = 0;
  let lastTop = NaN;
  let lastW = -1;
  function tick() {
    const top = getScrollTop(scroller);
    const w = viewport.clientWidth;
    if (top !== lastTop || w !== lastW) {
      lastTop = top;
      lastW = w;
      update();
    }
    raf = window.requestAnimationFrame(tick);
  }

  update();
  raf = window.requestAnimationFrame(tick);
  window.addEventListener("resize", update);

  const hintBtn = section.querySelector(".story__hint");
  hintBtn?.addEventListener("click", () => {
    // Si estamos en modo enhanced, avanzamos “un panel” en vertical; si no, scroll horizontal real
    if (section.classList.contains("story--enhanced") && canEnhance()) {
      const panels = Number.parseInt(getComputedStyle(section).getPropertyValue("--story-panels"), 10) || 6;
      const maxTravelY = section.offsetHeight - viewport.offsetHeight;
      const step = panels > 1 ? maxTravelY / (panels - 1) : 0;
      if (scroller === window) {
        window.scrollTo({ top: window.scrollY + step, behavior: allowSmooth ? "smooth" : "auto" });
      } else {
        scroller.scrollTo({ top: scroller.scrollTop + step, behavior: allowSmooth ? "smooth" : "auto" });
      }
    } else {
      viewport.scrollBy({ left: viewport.clientWidth, behavior: allowSmooth ? "smooth" : "auto" });
      viewport.focus({ preventScroll: true });
    }
  });
}

function initStoryWheelFallback() {
  const viewport = document.querySelector(".story__viewport");
  const section = viewport?.closest?.(".story");
  if (!viewport || !section) return;

  // Este modo NO depende de sticky; es el más compatible en CMS con transforms.
  section.classList.remove("story--enhanced");
  section.classList.add("story--wheel");
  const hintBtn = section.querySelector(".story__hint");

  function normalizeDelta(event) {
    // Prioriza scroll vertical (rueda) para “automatic horizontal”
    const primary = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!primary) return 0;
    if (event.deltaMode === 1) return primary * 16;
    if (event.deltaMode === 2) return primary * window.innerHeight;
    return primary;
  }

  function canMove(delta) {
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (max <= 0) return false;
    if (delta > 0) return viewport.scrollLeft < max - 1;
    return viewport.scrollLeft > 1;
  }

  const scroller = getScrollParent(section);
  const wheelTarget = document;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateHintState(active) {
    if (!hintBtn) return;

    // Mantener el hint “fijo” mientras la story está activa (fallback).
    section.classList.toggle("story--hint-fixed", Boolean(active));

    // En la última slide, atenuarlo mucho para indicar “fin”.
    const max = viewport.scrollWidth - viewport.clientWidth;
    const progress = max > 0 ? clamp(viewport.scrollLeft / max, 0, 1) : 0;
    section.classList.toggle("story--hint-dim", progress > 0.97);
  }

  // En CMS, los eventos pueden fallar; mantenemos un loop rAF barato para:
  // - mostrar/ocultar hint solo en su sección
  // - atenuar en la última slide
  let raf = 0;
  let lastLeft = NaN;
  let lastTop = NaN;
  function tick() {
    const top = getScrollTop(scroller);
    const left = viewport.scrollLeft;
    if (top !== lastTop || left !== lastLeft) {
      lastTop = top;
      lastLeft = left;
      const rect = getRectInScroller(section, scroller);
      const vh = getViewportHeight(scroller);
      const active = rect.top < vh && rect.bottom > 0;
      updateHintState(active);
    }
    raf = window.requestAnimationFrame(tick);
  }
  raf = window.requestAnimationFrame(tick);

  wheelTarget.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) return;

      const rect = getRectInScroller(section, scroller);
      const vh = getViewportHeight(scroller);
      const active = rect.top < vh && rect.bottom > 0;
      if (!active) {
        updateHintState(false);
        return;
      }
      updateHintState(true);

      // Solo intercepta si la intención principal es vertical (rueda/scroll normal)
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const delta = normalizeDelta(event);
      if (!delta || !canMove(delta)) return;

      event.preventDefault();
      viewport.scrollLeft += delta;
      updateHintState(true);
    },
    { passive: false, capture: true },
  );

  viewport.addEventListener(
    "scroll",
    () => {
      const rect = getRectInScroller(section, scroller);
      const vh = getViewportHeight(scroller);
      const active = rect.top < vh && rect.bottom > 0;
      updateHintState(active);
    },
    { passive: true },
  );

  // Estado inicial
  updateHintState(false);
}

function initSplitStickyFallback() {
  const split = document.querySelector(".split");
  const media = split?.querySelector(".split__media");
  if (!split || !media) return;

  // Portal pin (ultra robusto en CMS):
  // movemos el media al <body> durante el rango “sticky” y lo ponemos fixed real.
  // Esto evita que transforms en ancestros rompan fixed/sticky.
  const mq = window.matchMedia("(min-width: 900px)");
  const scroller = getScrollParent(split);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const placeholder = document.createElement("div");
  placeholder.setAttribute("data-split-placeholder", "1");
  let portaled = false;

  function setPortaled(enabled) {
    if (enabled === portaled) return;
    portaled = enabled;

    if (enabled) {
      // Inserta placeholder para mantener el layout
      if (!placeholder.parentNode) media.parentNode?.insertBefore(placeholder, media);
      document.body.appendChild(media);
      media.style.position = "fixed";
      media.style.top = "0";
      media.style.left = "0";
      media.style.margin = "0";
      media.style.transform = "none";
      media.style.zIndex = "20";
      media.style.willChange = "left, width";
    } else {
      media.style.position = "";
      media.style.top = "";
      media.style.left = "";
      media.style.width = "";
      media.style.height = "";
      media.style.zIndex = "";
      media.style.willChange = "";
      media.style.transform = "";
      placeholder.parentNode?.insertBefore(media, placeholder);
      placeholder.remove();
    }
  }

  function update() {
    if (!mq.matches || reducedMotion) {
      split.classList.remove("split--scrollpin");
      setPortaled(false);
      return;
    }

    split.classList.add("split--scrollpin");

    // Activo cuando el split está “entre” top y bottom del viewport
    const rect = split.getBoundingClientRect();
    const vh = window.innerHeight;
    const active = rect.top <= 0 && rect.bottom >= vh;

    setPortaled(active);
    if (!active) return;

    const phRect = placeholder.getBoundingClientRect();
    // Fija el media al tamaño/posición del hueco izquierdo
    media.style.left = `${phRect.left}px`;
    media.style.width = `${phRect.width}px`;
    media.style.height = `${vh}px`;
  }

  // Loop rAF (CMS-safe)
  let raf = 0;
  let lastTop = NaN;
  let lastW = -1;
  function tick() {
    const top = getScrollTop(scroller);
    const w = window.innerWidth;
    if (top !== lastTop || w !== lastW) {
      lastTop = top;
      lastW = w;
      update();
    }
    raf = window.requestAnimationFrame(tick);
  }

  update();
  raf = window.requestAnimationFrame(tick);
  window.addEventListener("resize", update);
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  initStoryHorizontalScroll();
  initStoryWheelFallback();
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
