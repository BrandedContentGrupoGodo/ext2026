// Revelado progresivo al hacer scroll.
// Degrada con elegancia: si esto falla o no hay IntersectionObserver,
// el contenido se muestra igualmente (ver fallback más abajo).
(function () {
  "use strict";

  var revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  // Fallback: sin soporte de IntersectionObserver, mostramos todo.
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // una sola vez: mejor performance
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
  );

  revealItems.forEach(function (el) {
    observer.observe(el);
  });
})();
