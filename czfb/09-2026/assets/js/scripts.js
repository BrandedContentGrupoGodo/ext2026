(function () {
  "use strict";

  /**
   * ========================================================================
   * BLOQUEO DE PUBLICACIÓN — Capítulo 02
   * ------------------------------------------------------------------------
   * Punto único para la URL definitiva del capítulo 02.
   * Provisional: "#" — la tarjeta se comporta como disponible (enlace,
   * hover, foco, cursor), pero la navegación se bloquea para no saltar
   * al inicio. Sustituir "#" por la URL absoluta confirmada antes del
   * lanzamiento; entonces navegará con normalidad.
   * No mostrar este aviso al lector.
   * ========================================================================
   */
  var BC_CZFB_CHAPTER_02_URL = "#";

  function boot() {
    var root = document.querySelector(".bc-czfb");
    if (!root) return;
    if (root.getAttribute("data-bc-czfb-init") === "1") return;
    root.setAttribute("data-bc-czfb-init", "1");

    enhanceChapter02(root);
    initMotion(root);
    initSmoothScroll(root);
  }

  function enhanceChapter02(root) {
    var card = root.querySelector(".bc-czfb-chapter--cap-02");
    if (!card) return;

    var url = typeof BC_CZFB_CHAPTER_02_URL === "string" ? BC_CZFB_CHAPTER_02_URL.trim() : "";
    if (!url) {
      card.classList.add("bc-czfb-chapter--awaiting-url");
      return;
    }

    card.classList.remove("bc-czfb-chapter--awaiting-url");

    var surface = card.querySelector(".bc-czfb-chapter__surface");
    if (!surface) return;

    var link = document.createElement("a");
    link.className = "bc-czfb-chapter__link";
    link.href = url;
    link.setAttribute(
      "aria-labelledby",
      "bc-czfb-cap-02-label bc-czfb-cap-02-title bc-czfb-cap-02-cta"
    );

    while (surface.firstChild) {
      link.appendChild(surface.firstChild);
    }

    surface.parentNode.replaceChild(link, surface);

    /* Provisional "#": evita salto al inicio; URL real navega normal */
    if (url === "#") {
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }
  }

  function initMotion(root) {
    var reduceQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    var mobileQuery = window.matchMedia
      ? window.matchMedia("(max-width: 800px)")
      : null;
    var chapters = root.querySelectorAll(".bc-czfb-chapter");
    var projectSection = root.querySelector(".bc-czfb-project");
    var projectItems = root.querySelectorAll(".bc-czfb-project .bc-czfb-reveal");
    var observer = null;
    var projectTimers = [];

    function prefersReducedMotion() {
      return !!(reduceQuery && reduceQuery.matches);
    }

    function isMobileLayout() {
      return !!(mobileQuery && mobileQuery.matches);
    }

    function clearProjectTimers() {
      var i;
      for (i = 0; i < projectTimers.length; i += 1) {
        window.clearTimeout(projectTimers[i]);
      }
      projectTimers = [];
    }

    function revealChapter(chapter) {
      if (!chapter) return;
      chapter.classList.add("bc-czfb-chapter--in");
      chapter.classList.remove("bc-czfb-chapter--awaiting");
      if (observer) {
        try {
          observer.unobserve(chapter);
        } catch (err) {
          /* ignore */
        }
      }
    }

    function revealProjectItem(item) {
      if (!item || item.classList.contains("bc-czfb-reveal--in")) return;
      item.classList.add("bc-czfb-reveal--in");
      item.classList.remove("bc-czfb-reveal--awaiting");
      if (observer) {
        try {
          observer.unobserve(item);
        } catch (err) {
          /* ignore */
        }
      }
    }

    function revealProjectSequence() {
      var i;
      if (observer && projectSection) {
        try {
          observer.unobserve(projectSection);
        } catch (err) {
          /* ignore */
        }
      }
      for (i = 0; i < projectItems.length; i += 1) {
        (function (item, delay) {
          var timer = window.setTimeout(function () {
            revealProjectItem(item);
          }, delay);
          projectTimers.push(timer);
        })(projectItems[i], i * 100);
      }
    }

    function revealAll() {
      var i;
      clearProjectTimers();
      for (i = 0; i < chapters.length; i += 1) {
        chapters[i].classList.remove("bc-czfb-chapter--awaiting");
        chapters[i].classList.add("bc-czfb-chapter--in");
      }
      for (i = 0; i < projectItems.length; i += 1) {
        projectItems[i].classList.remove("bc-czfb-reveal--awaiting");
        projectItems[i].classList.add("bc-czfb-reveal--in");
      }
    }

    function cancelMotion() {
      root.classList.remove("bc-czfb--motion-ready");
      revealAll();
      if (observer) {
        try {
          observer.disconnect();
        } catch (err) {
          /* ignore */
        }
        observer = null;
      }
    }

    function startMotion() {
      var i;
      var mobile;

      clearProjectTimers();

      if (observer) {
        try {
          observer.disconnect();
        } catch (err) {
          /* ignore */
        }
        observer = null;
      }

      if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
        cancelMotion();
        return;
      }

      root.classList.add("bc-czfb--motion-ready");
      mobile = isMobileLayout();

      for (i = 0; i < chapters.length; i += 1) {
        chapters[i].classList.add("bc-czfb-chapter--awaiting");
        chapters[i].classList.remove("bc-czfb-chapter--in");
      }

      for (i = 0; i < projectItems.length; i += 1) {
        projectItems[i].classList.add("bc-czfb-reveal--awaiting");
        projectItems[i].classList.remove("bc-czfb-reveal--in");
      }

      observer = new IntersectionObserver(
        function (entries) {
          var j;
          var entry;
          for (j = 0; j < entries.length; j += 1) {
            entry = entries[j];
            if (!entry.isIntersecting) continue;

            if (entry.target === projectSection) {
              revealProjectSequence();
              continue;
            }

            if (entry.target.classList.contains("bc-czfb-chapter")) {
              revealChapter(entry.target);
              continue;
            }

            if (entry.target.classList.contains("bc-czfb-reveal")) {
              revealProjectItem(entry.target);
            }
          }
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
      );

      for (i = 0; i < chapters.length; i += 1) {
        observer.observe(chapters[i]);
      }

      if (mobile) {
        for (i = 0; i < projectItems.length; i += 1) {
          observer.observe(projectItems[i]);
        }
      } else if (projectSection && projectItems.length) {
        observer.observe(projectSection);
      }
    }

    startMotion();

    if (reduceQuery) {
      if (typeof reduceQuery.addEventListener === "function") {
        reduceQuery.addEventListener("change", function () {
          if (prefersReducedMotion()) {
            cancelMotion();
          } else {
            startMotion();
          }
        });
      } else if (typeof reduceQuery.addListener === "function") {
        reduceQuery.addListener(function () {
          if (prefersReducedMotion()) {
            cancelMotion();
          } else {
            startMotion();
          }
        });
      }
    }
  }

  function initSmoothScroll(root) {
    var cta = root.querySelector(".bc-czfb-hero__cta");
    if (!cta) return;

    cta.addEventListener("click", function (event) {
      var href = cta.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var id = href.slice(1);
      if (!id) return;
      var target = root.querySelector("#" + id);
      if (!target) return;

      var reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      event.preventDefault();
      if (typeof target.scrollIntoView === "function") {
        try {
          target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        } catch (err) {
          target.scrollIntoView(true);
        }
      }

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      try {
        target.focus({ preventScroll: true });
      } catch (err2) {
        try {
          target.focus();
        } catch (err3) {
          /* ignore */
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
