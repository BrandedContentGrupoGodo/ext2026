/* Código Cero — ACCIONA capítulo 12
   Inicialización acotada al root. El vídeo solo se monta si hay un ID válido. */
(function () {
  "use strict";

  var YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

  function mountVideo(root) {
    var slot = root.querySelector(".bc-acciona__video");
    if (!slot) return;

    var videoId = (slot.getAttribute("data-youtube-id") || "").trim();
    if (!YOUTUBE_ID.test(videoId)) {
      slot.hidden = true;
      return;
    }

    var frame = slot.querySelector(".bc-acciona__video-frame");
    if (!frame || frame.querySelector("iframe")) {
      slot.hidden = false;
      return;
    }

    var title = slot.getAttribute("data-video-title") || "Vídeo de ACCIONA";
    var iframe = document.createElement("iframe");
    iframe.className = "bc-acciona__video-embed";
    iframe.src = "https://www.youtube.com/embed/" + videoId;
    iframe.title = title;
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.replaceChildren(iframe);
    slot.hidden = false;
  }

  function fixedStripBottom(el, root) {
    if (!el || root.contains(el)) return 0;
    var cs = window.getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") return 0;
    if (cs.display === "none" || cs.visibility === "hidden") return 0;
    var rect = el.getBoundingClientRect();
    if (rect.width < window.innerWidth * 0.6) return 0;
    if (rect.height < 8 || rect.height > 160) return 0;
    if (rect.bottom <= 0 || rect.top > 80) return 0;
    return rect.bottom;
  }

  function readHeaderOffset(root) {
    var header = document.querySelector("header.header");
    if (!header) return 0;
    var maxBottom = fixedStripBottom(header, root);
    var nodes = header.querySelectorAll("*");
    for (var i = 0; i < nodes.length; i++) {
      var bottom = fixedStripBottom(nodes[i], root);
      if (bottom > maxBottom) maxBottom = bottom;
    }
    return Math.max(0, Math.round(maxBottom));
  }

  function mountNavOffset(root) {
    var nav = root.querySelector(".bc-acciona__nav");
    if (!nav) return;

    var scheduled = false;
    var applied = "0px";

    function apply() {
      scheduled = false;
      var next = readHeaderOffset(root) + "px";
      if (next === applied) return;
      applied = next;
      root.style.setProperty("--acciona-nav-offset", next);
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", schedule, { passive: true });
      window.visualViewport.addEventListener("scroll", schedule, { passive: true });
    }

    var header = document.querySelector("header.header");
    if (header) {
      header.addEventListener("transitionend", schedule, { passive: true });
      header.addEventListener("animationend", schedule, { passive: true });
    }

    schedule();
  }

  function mountWheel(root) {
    var wheel = root.querySelector(".bc-acciona__wheel");
    if (!wheel) return;

    var hits = Array.prototype.slice.call(wheel.querySelectorAll(".bc-acciona__hit"));
    var cards = Array.prototype.slice.call(root.querySelectorAll(".bc-acciona__factor"));
    if (!hits.length) return;

    function factorOf(el) {
      return el.getAttribute("data-factor");
    }

    function select(id) {
      wheel.setAttribute("data-active", id);
      hits.forEach(function (hit) {
        var on = factorOf(hit) === id;
        hit.classList.toggle("is-active", on);
        hit.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cards.forEach(function (card) {
        var on = factorOf(card) === id;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function move(list, current, delta) {
      var index = list.indexOf(current);
      if (index < 0) index = 0;
      var next = list[(index + delta + list.length) % list.length];
      select(factorOf(next));
      next.focus();
    }

    function onKeys(list) {
      return function (event) {
        var current = event.currentTarget;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          move(list, current, 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          move(list, current, -1);
        } else if (event.key === "Home") {
          event.preventDefault();
          select(factorOf(list[0]));
          list[0].focus();
        } else if (event.key === "End") {
          event.preventDefault();
          select(factorOf(list[list.length - 1]));
          list[list.length - 1].focus();
        }
      };
    }

    hits.forEach(function (hit) {
      hit.addEventListener("click", function () {
        select(factorOf(hit));
      });
      hit.addEventListener("keydown", onKeys(hits));
    });

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        select(factorOf(card));
      });
      card.addEventListener("keydown", onKeys(cards));
    });
  }

  function boot() {
    var root = document.querySelector('[data-bc-project="acciona-cap12"]');
    if (!root || root.getAttribute("data-bc-acciona-init") === "true") return;
    root.setAttribute("data-bc-acciona-init", "true");
    mountVideo(root);
    mountNavOffset(root);
    mountWheel(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
