/**
 * Ajusta el offset superior cuando el embed vive dentro de un CMS
 * con cabecera/menú fijo. Calcula la altura ocupada en el top del viewport
 * por elementos fixed/sticky externos a `.eg-delonghi` y la expone vía CSS:
 *   --eg-cms-header-height: <px>
 *
 * También ayuda a que el menú propio (`.eg-menu`) se posicione por debajo
 * de esa cabecera cuando pasa a `position: fixed`.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const root = document.querySelector('.eg-delonghi');
    if (!root) return;

    const docEl = document.documentElement;
    let raf = 0;

    function px(n) {
      const v = Math.max(0, Math.round(n));
      return `${v}px`;
    }

    function getTopOffsetPx() {
      // Permite configuración explícita desde el CMS si hace falta:
      // <body data-eg-cms-header-selector=".site-header">
      const selector = document.body?.getAttribute('data-eg-cms-header-selector');
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.height > 0) return r.bottom;
        }
      }

      // Heurística: sumar altura ocupada en el top por elementos fixed/sticky
      // que NO estén dentro del bloque embebido.
      const candidates = Array.from(document.body?.children || []);
      let maxBottom = 0;

      for (const el of candidates) {
        if (!el || el === root) continue;
        if (el.contains(root)) continue;

        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;

        const isFixed = cs.position === 'fixed';
        const isSticky = cs.position === 'sticky' || cs.position === '-webkit-sticky';
        if (!isFixed && !isSticky) continue;

        // Solo consideramos cosas que realmente anclen al top.
        const top = parseFloat(cs.top || 'NaN');
        if (!Number.isFinite(top) || top > 0.5) continue;

        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) continue;

        // Debe tocar el borde superior del viewport (o casi).
        if (r.top > 1) continue;

        maxBottom = Math.max(maxBottom, r.bottom);
      }

      return maxBottom;
    }

    function apply() {
      raf = 0;
      const offset = getTopOffsetPx();
      docEl.style.setProperty('--eg-cms-header-height', px(offset));
    }

    function schedule() {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    }

    // Resize/scroll por si el CMS cambia tamaño (sticky que colapsa, etc.)
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });

    // Cambios de layout tardíos (banners, consent, etc.)
    if (window.MutationObserver) {
      const mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: false, attributes: true });
    }

    apply();
  }
})();
