/* Código Cero — ACCIONA capítulo 11
   Inicialización acotada al root. El vídeo solo se monta si hay id. */
(function () {
  "use strict";

  var YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

  function mountVideo(root) {
    var slot = root.querySelector(".bc-acciona__video");
    if (!slot) return;

    var videoId = (slot.getAttribute("data-youtube-id") || "").trim();
    if (!YOUTUBE_ID.test(videoId)) return;

    var frame = slot.querySelector(".bc-acciona__video-frame");
    if (!frame || frame.querySelector("iframe")) return;

    var title = slot.getAttribute("data-video-title") || "Vídeo de ACCIONA";
    var iframe = document.createElement("iframe");
    iframe.className = "bc-acciona__video-embed";
    iframe.src = "https://www.youtube.com/embed/" + videoId;
    iframe.title = title;
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.replaceChildren(iframe);
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

  function boot() {
    var root = document.querySelector('[data-bc-project="acciona-cap11"]');
    if (!root || root.getAttribute("data-bc-acciona-init") === "true") return;
    root.setAttribute("data-bc-acciona-init", "true");
    mountVideo(root);
    mountNavOffset(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
