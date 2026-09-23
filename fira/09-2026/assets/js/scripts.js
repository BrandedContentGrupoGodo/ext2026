(function () {
  "use strict";

  function boot() {
    var root = document.querySelector(".bc-fira");
    if (!root) return;
    if (root.getAttribute("data-bc-fira-init") === "1") return;
    root.setAttribute("data-bc-fira-init", "1");

    var reduceQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    var episodes = root.querySelectorAll(".bc-fira-episode");
    var observer = null;

    function prefersReducedMotion() {
      return !!(reduceQuery && reduceQuery.matches);
    }

    function revealEpisode(episode) {
      if (!episode) return;
      episode.classList.add("bc-fira-episode--in");
      if (observer) {
        try {
          observer.unobserve(episode);
        } catch (err) {
          /* ignore */
        }
      }
    }

    function revealAllEpisodes() {
      var i;
      for (i = 0; i < episodes.length; i += 1) {
        episodes[i].classList.remove("bc-fira-episode--awaiting");
        episodes[i].classList.add("bc-fira-episode--in");
      }
    }

    function cancelMotion() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      root.classList.remove("bc-fira--motion-ready");
      revealAllEpisodes();
    }

    function isBelowViewport(el) {
      return el.getBoundingClientRect().top >= window.innerHeight;
    }

    function isReachedOrAbove(el) {
      return el.getBoundingClientRect().top < window.innerHeight;
    }

    function revealReachedOrAbove() {
      var i;
      for (i = 0; i < episodes.length; i += 1) {
        if (
          !episodes[i].classList.contains("bc-fira-episode--in") &&
          isReachedOrAbove(episodes[i])
        ) {
          revealEpisode(episodes[i]);
        }
      }
    }

    function initEpisodeReveal() {
      if (!episodes.length) return;
      if (prefersReducedMotion()) {
        revealAllEpisodes();
        return;
      }
      if (!("IntersectionObserver" in window)) {
        revealAllEpisodes();
        return;
      }

      try {
        observer = new IntersectionObserver(
          function (entries) {
            var j;
            for (j = 0; j < entries.length; j += 1) {
              if (entries[j].isIntersecting) {
                revealEpisode(entries[j].target);
              }
            }
          },
          { threshold: 0 }
        );
      } catch (err) {
        observer = null;
        revealAllEpisodes();
        return;
      }

      var awaiting = [];
      var i;
      for (i = 0; i < episodes.length; i += 1) {
        if (isBelowViewport(episodes[i])) {
          awaiting.push(episodes[i]);
        } else {
          episodes[i].classList.add("bc-fira-episode--in");
        }
      }

      root.classList.add("bc-fira--motion-ready");

      for (i = 0; i < awaiting.length; i += 1) {
        awaiting[i].classList.add("bc-fira-episode--awaiting");
        observer.observe(awaiting[i]);
      }

      for (i = 0; i < episodes.length; i += 1) {
        episodes[i].addEventListener("focusin", function (event) {
          var row = event.currentTarget;
          if (!row.classList.contains("bc-fira-episode--in")) {
            revealEpisode(row);
          }
        });
      }
    }

    function focusDestination(target) {
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      try {
        target.focus({ preventScroll: true });
      } catch (err) {
        target.focus();
      }
    }

    function initHeroCta() {
      var cta = root.querySelector(".bc-fira-hero__cta");
      if (!cta) return;

      cta.addEventListener("click", function (event) {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        var href = cta.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;

        var id = href.slice(1);
        if (!id) return;

        var target = root.querySelector("#" + id);
        if (!target) return;

        event.preventDefault();

        if (history.pushState) {
          history.pushState(null, "", href);
        } else {
          location.hash = href;
        }

        revealReachedOrAbove();

        if (prefersReducedMotion()) {
          target.scrollIntoView();
          focusDestination(target);
          return;
        }

        try {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (err) {
          target.scrollIntoView();
        }
        focusDestination(target);
      });
    }

    function onMotionPreferenceChange(event) {
      if (event.matches) {
        cancelMotion();
      }
    }

    initEpisodeReveal();
    initHeroCta();
    revealReachedOrAbove();

    window.addEventListener("pageshow", function () {
      if (prefersReducedMotion()) {
        cancelMotion();
        return;
      }
      revealReachedOrAbove();
    });

    window.addEventListener("hashchange", function () {
      revealReachedOrAbove();
    });

    if (reduceQuery) {
      if (typeof reduceQuery.addEventListener === "function") {
        reduceQuery.addEventListener("change", onMotionPreferenceChange);
      } else if (typeof reduceQuery.addListener === "function") {
        reduceQuery.addListener(onMotionPreferenceChange);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
