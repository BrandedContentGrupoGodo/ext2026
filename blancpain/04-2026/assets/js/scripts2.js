document.documentElement.classList.add("js");
document.documentElement.dataset.bpLanding = "1";

function neutralizeXalokScrollHijack() {
  // Intento best-effort (solo v2): Xalok a veces bloquea el scroll con overflow:hidden o body fixed,
  // o instala manejadores wheel que impiden preventDefault. Aquí revertimos scroll-lock y evitamos
  // “smooth scroll” que suele interferir con wheel/scroll.
  try {
    document.documentElement.style.scrollBehavior = "auto";
    document.body && (document.body.style.scrollBehavior = "auto");

    const htmlStyles = window.getComputedStyle(document.documentElement);
    const bodyStyles = document.body ? window.getComputedStyle(document.body) : null;

    if (htmlStyles.overflowY === "hidden") {
      document.documentElement.style.overflowY = "auto";
    }
    if (bodyStyles && bodyStyles.overflowY === "hidden") {
      document.body.style.overflowY = "auto";
    }

    // Si el CMS “congela” el scroll poniendo body fixed, lo revertimos conservando posición.
    if (bodyStyles && bodyStyles.position === "fixed") {
      const top = Number.parseInt(bodyStyles.top || "0", 10) || 0;
      const y = Math.abs(top);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, y);
    }

    // Style guard: reduce interferencias de scroll managers
    const id = "bp-scroll-unlock";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        html, body { scroll-behavior: auto !important; }
        html { overscroll-behavior: auto !important; }
        body { overscroll-behavior: auto !important; }
        .body-blancpain { overscroll-behavior: auto !important; touch-action: pan-y !important; }
      `;
      document.head.appendChild(style);
    }

    // Monkey-patch: evita que scripts cargados DESPUÉS capturen la rueda globalmente.
    // No afecta a listeners ya instalados (si existen), pero ayuda en Xalok cuando inyecta tarde.
    const key = "__bp_patched_addEventListener__";
    if (!window[key]) {
      window[key] = true;
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (type === "wheel" && (this === window || this === document || this === document.documentElement || this === document.body)) {
          // Permitimos nuestro propio listener (marcado) y el resto lo degradamos a no-capture.
          const isBp = typeof listener === "function" && listener.__bp === true;
          if (!isBp) {
            const nextOptions = typeof options === "boolean" ? false : { ...(options || {}), capture: false, passive: true };
            return original.call(this, type, listener, nextOptions);
          }
        }
        return original.call(this, type, listener, options);
      };
    }
  } catch {
    // noop
  }
}

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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function canEnhance() {
    const maxTravelY = section.offsetHeight - viewport.offsetHeight;
    const maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
    return maxTravelY > 8 && maxX > 8;
  }

  function setEnhanced(enabled) {
    if (enabled) {
      section.classList.add("story--enhanced");
      section.classList.remove("story--wheel");
    } else {
      section.classList.remove("story--enhanced");
    }
  }

  function update() {
    if (!canEnhance()) {
      // Si el CMS rompe alturas/scroll, volvemos al fallback nativo horizontal
      setEnhanced(false);
      track.style.transform = "";
      return;
    }

    setEnhanced(true);
    // Basado en viewport: no depende del contenedor de scroll del CMS.
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxTravelY = Math.max(1, section.offsetHeight - vh);
    const progress = clamp((-rect.top) / maxTravelY, 0, 1);

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
    // En CMS el scroll puede ocurrir en un contenedor (window.scrollY no cambia).
    // Usamos la geometría real en viewport.
    const top = Math.round(section.getBoundingClientRect().top);
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
      const maxTravelY = Math.max(0, section.offsetHeight - window.innerHeight);
      const step = panels > 1 ? maxTravelY / (panels - 1) : 0;
      window.scrollTo({ top: window.scrollY + step, behavior: allowSmooth ? "smooth" : "auto" });
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
  const btnLeft = section.querySelector(".story__nav-btn--left");
  const btnRight = section.querySelector(".story__nav-btn--right");

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

  const wheelTarget = document;
  // Marcar handler BP para que el patch no lo degrade.
  function mark(fn) {
    try {
      fn.__bp = true;
    } catch {
      // noop
    }
    return fn;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateHintState() {
    // En la última slide, atenuarlo para indicar “fin” (pero no ocultarlo).
    const max = viewport.scrollWidth - viewport.clientWidth;
    const progress = max > 0 ? clamp(viewport.scrollLeft / max, 0, 1) : 0;
    section.classList.toggle("story--hint-dim", progress > 0.97);

    // Estado de botones
    if (btnLeft) btnLeft.disabled = viewport.scrollLeft <= 1;
    if (btnRight) btnRight.disabled = viewport.scrollLeft >= max - 1;
  }

  // Click: avanza un panel; si ya estás al final, baja a la siguiente sección.
  hintBtn?.addEventListener("click", () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const remaining = max - viewport.scrollLeft;
    if (remaining > 2) {
      viewport.scrollBy({ left: viewport.clientWidth, behavior: "smooth" });
      viewport.focus({ preventScroll: true });
      updateHintState();
      return;
    }

    const next = section.nextElementSibling;
    if (next && typeof next.scrollIntoView === "function") {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  btnLeft?.addEventListener("click", () => {
    viewport.scrollBy({ left: -viewport.clientWidth, behavior: "smooth" });
    viewport.focus({ preventScroll: true });
    updateHintState();
  });

  btnRight?.addEventListener("click", () => {
    viewport.scrollBy({ left: viewport.clientWidth, behavior: "smooth" });
    viewport.focus({ preventScroll: true });
    updateHintState();
  });

  // En CMS, los eventos pueden fallar; mantenemos un loop rAF barato para:
  // - atenuar en la última slide
  let raf = 0;
  let lastLeft = NaN;
  let lastTop = NaN;
  function tick() {
    const top = Math.round(section.getBoundingClientRect().top);
    const left = viewport.scrollLeft;
    if (top !== lastTop || left !== lastLeft) {
      lastTop = top;
      lastLeft = left;
      updateHintState();
    }
    raf = window.requestAnimationFrame(tick);
  }
  raf = window.requestAnimationFrame(tick);

  // Listener principal: engancha la rueda DIRECTO en el viewport.
  // Así funciona aunque Xalok bloquee wheel en document/window.
  viewport.addEventListener(
    "wheel",
    mark((event) => {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const delta = normalizeDelta(event);
      if (!delta || !canMove(delta)) return;

      event.preventDefault();
      viewport.scrollLeft += delta;
      updateHintState();
    }),
    { passive: false },
  );

  wheelTarget.addEventListener(
    "wheel",
    mark((event) => {
      if (event.ctrlKey) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const active = rect.top < vh && rect.bottom > 0;
      if (!active) return;

      // Solo intercepta si la intención principal es vertical (rueda/scroll normal)
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const delta = normalizeDelta(event);
      if (!delta || !canMove(delta)) return;

      event.preventDefault();
      viewport.scrollLeft += delta;
      updateHintState();
    }),
    { passive: false, capture: true },
  );

  viewport.addEventListener(
    "scroll",
    () => {
      updateHintState();
    },
    { passive: true },
  );

  // Estado inicial
  updateHintState();
}

function initSplitStickyFallback() {
  const split = document.querySelector(".split");
  const media = split?.querySelector(".split__media");
  if (!split || !media) return;

  // Scrollpin por translateY (estable y sin “huecos” en el layout).
  const mq = window.matchMedia("(min-width: 900px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function update() {
    if (!mq.matches || reducedMotion) {
      split.classList.remove("split--scrollpin");
      media.style.transform = "";
      return;
    }

    split.classList.add("split--scrollpin");

    // Basado en viewport: no depende del contenedor de scroll del CMS.
    const rect = split.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxTravel = Math.max(0, split.offsetHeight - vh);
    const rawY = Math.min(maxTravel, Math.max(0, -rect.top));
    // Evita vibración en umbrales de píxel: monotónico hacia abajo.
    const y = Math.floor(rawY);

    const next = `translate3d(0, ${y}px, 0)`;
    if (media.style.transform !== next) media.style.transform = next;
  }

  // Loop rAF (CMS-safe)
  let raf = 0;
  let lastTop = NaN;
  let lastH = -1;
  function tick() {
    const top = Math.round(split.getBoundingClientRect().top);
    const h = split.offsetHeight;
    if (top !== lastTop || h !== lastH) {
      lastTop = top;
      lastH = h;
      update();
    }
    raf = window.requestAnimationFrame(tick);
  }

  update();
  raf = window.requestAnimationFrame(tick);
  window.addEventListener("resize", update);
}

document.addEventListener("DOMContentLoaded", () => {
  neutralizeXalokScrollHijack();
  initRevealOnScroll();
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
