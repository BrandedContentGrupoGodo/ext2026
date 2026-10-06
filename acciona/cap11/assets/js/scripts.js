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

  function boot() {
    var root = document.querySelector('[data-bc-project="acciona-cap11"]');
    if (!root || root.getAttribute("data-bc-acciona-init") === "true") return;
    root.setAttribute("data-bc-acciona-init", "true");
    mountVideo(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
