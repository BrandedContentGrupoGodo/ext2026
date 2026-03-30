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

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  }

  update();
  (scroller === window ? window : scroller).addEventListener("scroll", onScroll, { passive: true });
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

  function normalizeDelta(event) {
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
  const target = scroller === window ? window : scroller;

  target.addEventListener(
    "wheel",
    (event) => {
      const rect = getRectInScroller(section, scroller);
      const vh = getViewportHeight(scroller);
      const active = rect.top < vh && rect.bottom > 0;
      if (!active) return;
      if (event.ctrlKey) return;

      const delta = normalizeDelta(event);
      if (!delta || !canMove(delta)) return;
      event.preventDefault();
      viewport.scrollLeft += delta;
    },
    { passive: false, capture: true },
  );
}

function initSplitStickyFallback() {
  const split = document.querySelector(".split");
  const media = split?.querySelector(".split__media");
  if (!split || !media) return;

  const mq = window.matchMedia("(min-width: 900px)");
  const scroller = getScrollParent(split);

  // Fallback SOLO si sticky no funciona (muchos CMS rompen sticky por overflow/containers)
  function stickySeemsBroken() {
    if (!mq.matches) return false;
    const rect = getRectInScroller(split, scroller);
    const vh = getViewportHeight(scroller);
    if (!(rect.top < 0 && rect.bottom > vh)) return false;
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

    // En CMS con transforms, sticky suele romperse aunque a veces "parezca" funcionar.
    // Forzamos el fallback cuando el split entra en rango de pin.

    const splitRect = getRectInScroller(split, scroller);
    const mediaRect = media.getBoundingClientRect();
    const vh = getViewportHeight(scroller);
    const inPinRange = splitRect.top <= 0 && splitRect.bottom > vh;
    const afterPin = splitRect.bottom <= vh;

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
  (scroller === window ? window : scroller).addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => {
    pin.active = false;
    update();
  });
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
