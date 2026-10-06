(function () {
  "use strict";

  /**
   * Capítulo 02 — URL definitiva (mantener coherente con el href del HTML).
   */
  var BC_CZFB_CHAPTER_02_URL =
    "https://www.lavanguardia.com/dinero/20261007/11649354/nuevas-profesiones-abren-paso-industria-4-0-oficios-nueva-industria-brl.html";

  function boot() {
    var root = document.querySelector(".bc-czfb");
    if (!root) return;
    if (root.getAttribute("data-bc-czfb-init") === "1") return;
    root.setAttribute("data-bc-czfb-init", "1");

    syncChapter02(root);
    initMotion(root);
    initSmoothScroll(root);
  }

  function syncChapter02(root) {
    var link = root.querySelector(".bc-czfb-chapter--cap-02 .bc-czfb-chapter__link");
    if (!link) return;
    var url = typeof BC_CZFB_CHAPTER_02_URL === "string" ? BC_CZFB_CHAPTER_02_URL.trim() : "";
    if (url) {
      link.setAttribute("href", url);
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
