/**
 * Hemeroteca — interacciones mínimas.
 *
 * Única responsabilidad de JS: reproducir el vídeo de cada episodio al
 * pasar el ratón o enfocar la tarjeta (algo que CSS no puede disparar).
 * Todo lo demás (scroll suave, resaltado del capítulo, hover visual) se
 * resuelve en CSS. Si este script falla, la tarjeta sigue mostrando la
 * foto en blanco y negro: degradación correcta.
 */
(function () {
  "use strict";

  var cards = document.querySelectorAll(".episode__card");
  if (!cards.length) return;

  function playVideo(card) {
    var video = card.querySelector(".episode__video");
    if (!video) return;
    // El vídeo usa preload="none": forzamos la carga solo al interactuar.
    if (video.preload !== "auto") video.preload = "auto";
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {/* autoplay bloqueado: se mantiene la foto */});
    }
  }

  function pauseVideo(card) {
    var video = card.querySelector(".episode__video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () { playVideo(card); });
    card.addEventListener("mouseleave", function () { pauseVideo(card); });
    // Soporte de teclado: al enfocar el enlace interno de la tarjeta.
    card.addEventListener("focusin", function () { playVideo(card); });
    card.addEventListener("focusout", function (event) {
      if (!card.contains(event.relatedTarget)) pauseVideo(card);
    });
  });
})();

/**
 * Barra fija de capítulos: siempre visible al hacer scroll, pero se oculta
 * (deslizándose con transform) en cuanto entra en pantalla cualquier footer.
 * Soporta varios footers marcados con [data-hide-chapter-nav]. Si falla el
 * JS o no hay IntersectionObserver, la barra simplemente queda fija visible.
 */
(function () {
  "use strict";

  var nav = document.querySelector(".chapter-nav");
  var footers = document.querySelectorAll("[data-hide-chapter-nav]");
  if (!nav || !footers.length || !("IntersectionObserver" in window)) return;

  var visibles = 0;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visibles += entry.isIntersecting ? 1 : -1;
    });
    if (visibles < 0) visibles = 0;

    var oculta = visibles > 0;
    nav.classList.toggle("chapter-nav--hidden", oculta);
    // Evita que el teclado alcance la barra mientras está fuera de pantalla.
    if ("inert" in nav) nav.inert = oculta;
    nav.setAttribute("aria-hidden", oculta ? "true" : "false");
  }, { threshold: 0 });

  footers.forEach(function (footer) {
    observer.observe(footer);
  });
})();
