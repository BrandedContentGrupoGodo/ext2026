(function () {
  "use strict";

  /* Única lista de disponibilidad. 01–03 publicados; 04–06 próximos. */
  var episodeState = {
    "01": "available",
    "02": "available",
    "03": "available",
    "04": "soon",
    "05": "soon",
    "06": "soon"
  };

  function applyEpisodeState(root) {
    var cards = root.querySelectorAll("[data-bc-adeslas-episode]");
    Array.prototype.forEach.call(cards, function (card) {
      var id = card.getAttribute("data-bc-adeslas-episode");
      var available = episodeState[id] === "available";
      card.classList.toggle("bc-adeslas-episode--soon", !available);
      if (available) {
        card.removeAttribute("aria-disabled");
        return;
      }
      card.setAttribute("aria-disabled", "true");
      if (card.tagName === "A") {
        card.removeAttribute("href");
      }
    });
  }

  function boot() {
    var root = document.querySelector(".bc-adeslas");
    if (!root || root.getAttribute("data-bc-adeslas-init") === "1") return;
    root.setAttribute("data-bc-adeslas-init", "1");
    applyEpisodeState(root);

    var reduce = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    root.addEventListener("click", function (event) {
      var link = event.target.closest("a.bc-adeslas-hero__link");
      if (!link || !root.contains(link)) return;

      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;

      var target = root.querySelector(href);
      if (!target) return;

      var heading = target.matches("h1, h2, h3")
        ? target
        : target.querySelector("h2, h3");
      var destination = heading || target;

      event.preventDefault();
      var reduced = !!(reduce && reduce.matches);
      destination.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start"
      });
      if (destination.getAttribute("tabindex") === null) {
        destination.setAttribute("tabindex", "-1");
      }
      destination.focus({ preventScroll: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
