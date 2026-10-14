(function () {
  "use strict";

  // TODO YouTube Historia 11. Dejar vacío hasta tener el ID.
  // No reutilizar los vídeos de la historia anterior.
  var YOUTUBE_ID_LV = "";
  var YOUTUBE_ID_MD = "";

  // TODO: URLs de publicación. Vacías a propósito.
  // No poner aquí la URL de la historia anterior.
  var SHARE_URL_LV = "";
  var SHARE_URL_MD = "";

  var GSAP_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
  var SCROLL_TRIGGER_URL =
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js";

  function boot() {
    var root = document.querySelector(".bc-caixabank");
    if (!root || root.getAttribute("data-bc-caixabank-init") === "1") return;
    root.setAttribute("data-bc-caixabank-init", "1");

    function q(sel) {
      return root.querySelector(sel);
    }

    function qa(sel) {
      return root.querySelectorAll(sel);
    }

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[src="' + src + '"]')) {
          resolve();
          return;
        }
        var el = document.createElement("script");
        el.src = src;
        el.async = true;
        el.onload = function () {
          resolve();
        };
        el.onerror = reject;
        document.body.appendChild(el);
      });
    }

    function applyAnimationFallback() {
      qa(".hero__image img").forEach(function (img) {
        img.style.opacity = "1";
        img.style.transform = "none";
      });
      var title = q(".hero__title");
      if (title) {
        title.style.opacity = "1";
        title.style.transform = "none";
      }
      var cta = q(".hero__cta");
      if (cta) {
        cta.style.opacity = "1";
        cta.style.transform = "none";
      }
      var reportaje = q("#bc-caixabank-reportaje");
      if (reportaje) {
        reportaje.style.opacity = "1";
        reportaje.style.transform = "none";
      }
    }

    function initGsapAnimations() {
      if (!window.gsap) {
        applyAnimationFallback();
        return;
      }

      var heroImgs = qa(".hero__image img");
      if (heroImgs.length) {
        gsap.fromTo(
          heroImgs,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "power2.out" }
        );
      }

      var title = q(".hero__title");
      if (title) {
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.5,
          ease: "power2.out",
        });
      }

      var cta = q(".hero__cta");
      if (cta) {
        gsap.fromTo(
          cta,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, delay: 1, ease: "elastic.out(1,0.5)" }
        );
      }

      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      var reportaje = q("#bc-caixabank-reportaje");
      if (reportaje) {
        gsap.to(reportaje, {
          scrollTrigger: {
            trigger: reportaje,
            start: "top 80%",
            once: true,
            invalidateOnRefresh: true,
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        });
      }
    }

    function initAnimations() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        applyAnimationFallback();
        return;
      }

      loadScript(GSAP_URL)
        .then(function () {
          return loadScript(SCROLL_TRIGGER_URL);
        })
        .then(initGsapAnimations)
        .catch(applyAnimationFallback);
    }

    function initHeroScroll() {
      var heroCta = q(".hero__cta");
      if (!heroCta) return;
      heroCta.addEventListener("click", function (e) {
        e.preventDefault();
        var videoSection = q("#bc-caixabank-video");
        if (videoSection) {
          videoSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    function initReportajeVisibility() {
      qa(".reportaje").forEach(function (section) {
        section.style.opacity = "1";
      });

      if (!window.MutationObserver) return;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.classList && node.classList.contains("reportaje")) {
              node.style.opacity = "1";
            }
            var nested = node.querySelectorAll ? node.querySelectorAll(".reportaje") : [];
            nested.forEach(function (sec) {
              sec.style.opacity = "1";
            });
          });
        });
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    function youtubeIdFor(wrapper) {
      var slot = wrapper.getAttribute("data-youtube-slot");
      if (slot === "lv") return YOUTUBE_ID_LV;
      if (slot === "md") return YOUTUBE_ID_MD;
      return "";
    }

    function initYoutubeFacade() {
      qa(".video-wrapper[data-youtube-slot]").forEach(function (wrapper) {
        var poster = wrapper.querySelector(".video-wrapper__poster");
        if (!poster) return;

        var id = youtubeIdFor(wrapper);
        if (!id) return;

        poster.classList.remove("video-wrapper__poster--pending");
        poster.addEventListener("click", function () {
          var iframe = document.createElement("iframe");
          iframe.src =
            "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
          iframe.title = poster.getAttribute("aria-label") || "Vídeo de la campaña";
          iframe.loading = "lazy";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          );
          wrapper.replaceChildren(iframe);
        });
      });
    }

    function initLightbox() {
      var lightbox = q("#bc-caixabank-lightbox");
      var lightboxImg = q("#bc-caixabank-lightbox-img");
      var lightboxClose = q("#bc-caixabank-lightbox-close");
      if (!lightbox || !lightboxImg || !lightboxClose) return;

      function openLightbox(img) {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || "";
        lightbox.style.display = "flex";
      }

      function closeLightbox() {
        lightbox.style.display = "none";
        lightboxImg.removeAttribute("src");
        lightboxImg.alt = "";
      }

      qa(".gallery-item").forEach(function (img) {
        img.addEventListener("click", function () {
          openLightbox(img);
        });
      });

      lightboxClose.addEventListener("click", closeLightbox);

      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightbox.style.display === "flex") {
          closeLightbox();
        }
      });
    }

    function observeOnce(el, cb, rootMargin) {
      if (!el) return;
      if (!("IntersectionObserver" in window)) {
        cb();
        return;
      }
      var done = false;
      var obs = new IntersectionObserver(
        function (entries) {
          if (done || !entries[0] || !entries[0].isIntersecting) return;
          done = true;
          obs.disconnect();
          cb();
        },
        { root: null, rootMargin: rootMargin || "0px", threshold: 0.01 }
      );
      obs.observe(el);
    }

    function initLazySocialBar() {
      var bar = q(".social-bar");
      if (!bar) return;
      var slot = bar.getAttribute("data-share-slot") === "md" ? "md" : "lv";
      var configured = slot === "md" ? SHARE_URL_MD : SHARE_URL_LV;
      var ready = /^https?:\/\//i.test(configured || "");
      var iframe = bar.querySelector("iframe");
      var tweet = bar.querySelector(".twitter-share-button");
      // Mientras SHARE_URL_* esté vacío, el botón oficial se pinta
      // pero no apunta al artículo de la historia anterior ni se puede pulsar.
      var widgetUrl = ready
        ? configured
        : slot === "md"
          ? "https://www.mundodeportivo.com/"
          : "https://www.lavanguardia.com/";

      if (!ready) {
        bar.classList.add("is-pending");
        if (tweet) {
          tweet.addEventListener("click", function (e) {
            e.preventDefault();
          });
        }
      }

      if (iframe) {
        iframe.setAttribute(
          "data-src",
          "https://www.facebook.com/plugins/share_button.php?href=" +
            encodeURIComponent(widgetUrl) +
            "&layout&size&width=95&height=20&appId"
        );
      }
      if (tweet) tweet.setAttribute("data-url", widgetUrl);

      function reveal() {
        if (bar.getAttribute("data-share-ready") === "1") return;
        bar.setAttribute("data-share-ready", "1");
        if (iframe && iframe.getAttribute("data-src")) {
          iframe.src = iframe.getAttribute("data-src");
        }
        if (!document.getElementById("twitter-wjs")) {
          var s = document.createElement("script");
          s.id = "twitter-wjs";
          s.async = true;
          s.src = "https://platform.twitter.com/widgets.js";
          document.body.appendChild(s);
        }
      }

      observeOnce(bar, reveal, "200px");
      setTimeout(reveal, 3000);
    }

    function loadQualifio() {
      var container = q(".iframeQualifio");
      if (!container || container.dataset.qualifioLoaded === "true") return;
      if (!q("#qualifio_insert_place_1789279")) return;
      container.dataset.qualifioLoaded = "true";

      (function (b, o, n, u, s) {
        var a, t;
        a = b.createElement(u);
        a.async = 1;
        a.src = s;
        t = b.getElementsByTagName(u)[0];
        t.parentNode.insertBefore(a, t);
        o[n] = o[n] || [];
      })(
        document,
        window,
        "_qual_async",
        "script",
        "https://files.qualifio.com/kit/qualp.2.min.js"
      );

      window._qual_async = window._qual_async || [];
      window._qual_async.push([
        "createIframe",
        "qualifio_insert_place_1789279",
        "lavanguardia.qualifioapp.com",
        "20",
        "10489ED4-E1F3-4A60-9F49-2AFE06C13BAE",
        "100%",
        "670",
        "",
        "",
        "",
        "max-width:810px;margin:0 auto;",
      ]);
    }

    function initLazyQualifio() {
      var container = q(".iframeQualifio");
      observeOnce(container, loadQualifio, "300px");
      setTimeout(loadQualifio, 3500);
    }

    initHeroScroll();
    initReportajeVisibility();
    initYoutubeFacade();
    initLightbox();
    initLazySocialBar();
    initLazyQualifio();
    initAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
