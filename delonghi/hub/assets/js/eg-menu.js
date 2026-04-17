(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const root = document.querySelector('.eg-delonghi');
    const hero = document.querySelector('.eg-delonghi .eg-hero');
    const menu = document.querySelector('.eg-delonghi .eg-menu');

    if (!root || !hero || !menu) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // Spacer para evitar salto de layout cuando el menú pasa a fixed
    const spacer = document.createElement('div');
    spacer.className = 'eg-menu-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.display = 'none';
    menu.parentNode.insertBefore(spacer, menu);

    let ticking = false;
    let lastFixed = null;

    function heroBottomY() {
      const r = hero.getBoundingClientRect();
      return r.bottom;
    }

    function update() {
      ticking = false;

      // Consideramos "contenido visible" cuando el hero ya no está en viewport
      const shouldFix = heroBottomY() <= 0;

      if (shouldFix === lastFixed) return;
      lastFixed = shouldFix;

      if (shouldFix) {
        const h = menu.getBoundingClientRect().height;
        spacer.style.height = `${h}px`;
        spacer.style.display = 'block';
        menu.classList.add('eg-menu--fixed');
        if (!prefersReducedMotion) menu.classList.add('eg-menu--fixed-anim');
      } else {
        menu.classList.remove('eg-menu--fixed', 'eg-menu--fixed-anim');
        spacer.style.display = 'none';
        spacer.style.height = '0px';
      }
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    update();
  }
})();
