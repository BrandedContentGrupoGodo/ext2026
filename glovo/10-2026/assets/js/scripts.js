(function () {
  "use strict";

  /*
   * Único punto para actualizar las historias publicadas.
   * Una URL http(s) abre el artículo en la misma pestaña.
   * Con "" el clic no navega. Las tres «Próximamente» no tienen entrada aquí.
   */
  var STORY_URLS = {
    gastronomia: "https://www.lavanguardia.com/comer/20261028/11593743/nietos-bulli-nueva-cocina-catalana-asi-cuece-futuro-gastronomico-barcelona-brl.html",
    arquitectura: "https://www.lavanguardia.com/vida/20261031/11664765/barcelona-futuro-como-cambiara-ciudad-habitamos-brl.html"
  };

  function isRealUrl(value) {
    return /^https?:\/\//i.test(value || "");
  }

  function boot() {
    var root = document.querySelector(".bc-glovo");
    if (!root || root.getAttribute("data-bc-glovo-init") === "1") return;
    root.setAttribute("data-bc-glovo-init", "1");

    var stories = root.querySelectorAll("[data-bc-glovo-story]");
    Array.prototype.forEach.call(stories, function (link) {
      var key = link.getAttribute("data-bc-glovo-story");
      var url = STORY_URLS[key];
      if (isRealUrl(url)) link.setAttribute("href", url);
    });

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var mobile = window.matchMedia("(max-width: 767px)");
    var heroVisual = root.querySelector(".bc-glovo-hero__visual");
    var revealEdge = root.querySelector(".bc-glovo-hero__reveal-edge");
    var revealSheet = root.querySelector(".bc-glovo-hero__reveal-sheet");
    var revealPending = false;
    var revealTravel = 0;

    function measureReveal() {
      if (!revealSheet || !revealEdge) return;
      revealTravel = revealSheet.offsetTop + revealEdge.offsetHeight;
    }

    function updateReveal() {
      revealPending = false;
      if (!heroVisual) return;
      if (reduce.matches || revealTravel <= 0) {
        heroVisual.style.removeProperty("--bc-glovo-reveal");
        return;
      }
      var top = heroVisual.getBoundingClientRect().top;
      var range = heroVisual.offsetHeight * (mobile.matches ? 1.05 : 1.28);
      if (range < 1) range = 1;
      var progress = Math.min(1, Math.max(0, -top / range));
      heroVisual.style.setProperty("--bc-glovo-reveal", (-revealTravel * progress).toFixed(2));
    }

    function requestReveal() {
      if (revealPending) return;
      revealPending = true;
      window.requestAnimationFrame(updateReveal);
    }

    if (heroVisual && revealSheet) {
      measureReveal();
      window.addEventListener("scroll", requestReveal, { passive: true });
      window.addEventListener("resize", function () {
        measureReveal();
        requestReveal();
      });
      if (window.ResizeObserver) {
        var revealObserver = new ResizeObserver(function () {
          measureReveal();
          requestReveal();
        });
        revealObserver.observe(heroVisual);
      }
      if (revealEdge && !revealEdge.complete) {
        revealEdge.addEventListener("load", function () {
          measureReveal();
          requestReveal();
        });
      }
      function onRevealContextChange() {
        measureReveal();
        requestReveal();
      }
      if (mobile.addEventListener) mobile.addEventListener("change", onRevealContextChange);
      if (reduce.addEventListener) reduce.addEventListener("change", onRevealContextChange);
      updateReveal();
    }

    root.addEventListener("click", function (event) {
      var origin = event.target.closest("a");
      if (!origin || !root.contains(origin)) return;

      var story = origin.getAttribute("data-bc-glovo-story");
      if (story) {
        if (!isRealUrl(STORY_URLS[story])) event.preventDefault();
        return;
      }

      var href = origin.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;

      var target = document.getElementById(href.slice(1));
      if (!target || !root.contains(target)) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduce.matches ? "auto" : "smooth",
        block: "start"
      });
      target.focus({ preventScroll: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
