(function () {
  "use strict";

  function boot() {
    var root = document.querySelector(".bc-endesa");
    if (!root) return;
    if (root.getAttribute("data-bc-endesa-init") === "1") return;
    root.setAttribute("data-bc-endesa-init", "1");

    var reduceQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    function prefersReducedMotion() {
      return !!(reduceQuery && reduceQuery.matches);
    }

    prepareHero(root, prefersReducedMotion());
    prepareHeroPointer(root);
    prepareIntroImages(root);

    if (!prefersReducedMotion()) {
      root.classList.add("is-enhanced");
      initReveals(root);
    }

    initIndex(root);
    initQuoteStage(root);

    if (reduceQuery) {
      var onReduce = function () {
        if (!prefersReducedMotion()) return;
        root.classList.remove("is-enhanced");
        revealAll(root);
      };
      if (typeof reduceQuery.addEventListener === "function") {
        reduceQuery.addEventListener("change", onReduce);
      } else if (typeof reduceQuery.addListener === "function") {
        reduceQuery.addListener(onReduce);
      }
    }
  }

  function prepareHero(root, reduced) {
    var hero = root.querySelector(".bc-endesa-hero");
    var video = root.querySelector(".bc-endesa-hero__video");
    var light = root.querySelector(".bc-endesa-hero__light");

    function markCanvasFailed() {
      root.classList.remove("is-canvas-ready");
      root.classList.add("is-canvas-failed");
    }

    if (!hero || !video || !light || !light.getContext) {
      markCanvasFailed();
      return;
    }

    var lightCtx = light.getContext("2d", { alpha: true });
    var mask = document.createElement("canvas");
    var maskCtx = mask.getContext("2d");
    if (!lightCtx || !maskCtx) {
      markCanvasFailed();
      return;
    }

    var hasFrame = false;
    var loopOn = false;
    var scheduled = false;
    var progress = reduced ? [1, 1] : [0, 0];
    var resizeTimer = 0;
    var wipeDone = !!reduced;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    function dropLight() {
      video.hidden = true;
      light.hidden = true;
      markCanvasFailed();
    }

    video.addEventListener("error", dropLight);
    var source = video.querySelector("source");
    if (source) source.addEventListener("error", dropLight);

    function clamp01(value) {
      if (value < 0) return 0;
      if (value > 1) return 1;
      return value;
    }

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function drawVideo() {
      if (video.readyState < 2 || !video.videoWidth) return;
      var rect = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      var bw = Math.round(w * dpr);
      var bh = Math.round(h * dpr);
      if (light.width !== bw || light.height !== bh) {
        light.width = bw;
        light.height = bh;
      }
      lightCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var scale = Math.max(w / video.videoWidth, h / video.videoHeight);
      var sw = w / scale;
      var sh = h / scale;
      var sx = (video.videoWidth - sw) / 2;
      var sy = (video.videoHeight - sh) / 2;
      lightCtx.clearRect(0, 0, w, h);
      lightCtx.filter = "brightness(1.26) contrast(1.14)";
      lightCtx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
      lightCtx.filter = "none";
      hasFrame = true;
      if (progress[0] > 0 || progress[1] > 0) {
        root.classList.add("is-canvas-ready");
      }
    }

    function paintMask(amounts) {
      var lines = hero.querySelectorAll(".bc-endesa-hero__line");
      var heroRect = hero.getBoundingClientRect();
      var title = hero.querySelector(".bc-endesa-hero__title");
      if (!lines.length || !title || heroRect.width < 2) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pad = 28;
      var titleRect = title.getBoundingClientRect();
      var cssW = Math.max(1, Math.ceil(titleRect.width + pad * 2));
      var cssH = Math.max(1, Math.ceil(titleRect.height + pad * 2));
      mask.width = Math.round(cssW * dpr);
      mask.height = Math.round(cssH * dpr);
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.clearRect(0, 0, cssW, cssH);
      maskCtx.fillStyle = "#fff";

      var originX = titleRect.left - pad;
      var originY = titleRect.top - pad;
      var i;

      for (i = 0; i < lines.length; i += 1) {
        var amount = amounts && amounts[i] ? amounts[i] : 0;
        if (amount <= 0) continue;
        var line = lines[i];
        var box = line.getBoundingClientRect();
        var cs = window.getComputedStyle(line);
        var fontSize = parseFloat(cs.fontSize) || 16;
        maskCtx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
        if ("letterSpacing" in maskCtx && cs.letterSpacing && cs.letterSpacing !== "normal") {
          maskCtx.letterSpacing = cs.letterSpacing;
        }
        maskCtx.textBaseline = "alphabetic";
        var text = (line.textContent || "").replace(/\s+/g, " ").trim().toLocaleUpperCase("es");
        var metrics = maskCtx.measureText(text);
        var ascent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
        var descent = metrics.fontBoundingBoxDescent || fontSize * 0.22;
        var half = (box.height - fontSize) / 2;
        var baseline = box.top - originY + half + ascent;
        var x = box.left - originX;
        maskCtx.save();
        maskCtx.beginPath();
        maskCtx.rect(x - 8, baseline - ascent - 12, Math.max(metrics.width * amount, 0) + fontSize * 0.35, ascent + descent + 24);
        maskCtx.clip();
        maskCtx.fillText(text, x, baseline);
        maskCtx.restore();
      }

      var url = mask.toDataURL("image/png");
      var posX = titleRect.left - heroRect.left - pad;
      var posY = titleRect.top - heroRect.top - pad;
      light.style.webkitMaskImage = "url(\"" + url + "\")";
      light.style.maskImage = "url(\"" + url + "\")";
      light.style.webkitMaskRepeat = "no-repeat";
      light.style.maskRepeat = "no-repeat";
      light.style.webkitMaskSize = cssW + "px " + cssH + "px";
      light.style.maskSize = cssW + "px " + cssH + "px";
      light.style.webkitMaskPosition = posX + "px " + posY + "px";
      light.style.maskPosition = posX + "px " + posY + "px";
      if (hasFrame && (amounts[0] > 0 || amounts[1] > 0)) {
        root.classList.add("is-canvas-ready");
      }
    }

    function onFrame() {
      scheduled = false;
      if (!loopOn) return;
      drawVideo();
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(onFrame);
      } else {
        scheduled = true;
        window.requestAnimationFrame(onFrame);
      }
    }

    function startLoop() {
      if (loopOn) return;
      loopOn = true;
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(onFrame);
      } else if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(onFrame);
      }
    }

    function stopLoop() {
      loopOn = false;
    }

    function playVideo() {
      if (typeof video.play !== "function") return;
      var pending = video.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch(function () {
          /* Autoplay bloqueado: queda el fondo del hero. */
        });
      }
    }

    function startWipe() {
      if (reduced || document.hidden) {
        progress = [1, 1];
        wipeDone = true;
        paintMask(progress);
        drawVideo();
        return;
      }

      var start = window.performance && performance.now ? performance.now() : Date.now();
      var delay = 180;
      var duration = 920;
      var stagger = 140;

      function frame(now) {
        var elapsed = now - start - delay;
        progress = [
          easeOut(clamp01(elapsed / duration)),
          easeOut(clamp01((elapsed - stagger) / duration))
        ];
        paintMask(progress);
        if (elapsed < duration + stagger) {
          window.requestAnimationFrame(frame);
        } else {
          progress = [1, 1];
          wipeDone = true;
          paintMask(progress);
        }
      }

      window.requestAnimationFrame(frame);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startWipe);
    } else {
      startWipe();
    }

    playVideo();
    video.addEventListener("loadeddata", drawVideo);

    if ("IntersectionObserver" in window) {
      var heroWatch = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) startLoop();
        else stopLoop();
      }, { rootMargin: "120px" });
      heroWatch.observe(hero);
    } else {
      startLoop();
    }

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (wipeDone) progress = [1, 1];
        paintMask(progress);
        drawVideo();
      }, 120);
    });
  }


  function prepareIntroImages(root) {
    var images = root.querySelectorAll(".bc-endesa-intro__photo img");
    var i;

    function hide(img) {
      img.classList.add("is-missing");
    }

    for (i = 0; i < images.length; i += 1) {
      (function (img) {
        if (img.complete && img.naturalWidth === 0) {
          hide(img);
          return;
        }
        img.addEventListener("error", function () {
          hide(img);
        });
      })(images[i]);
    }
  }

  function prepareHeroPointer(root) {
    var hero = root.querySelector(".bc-endesa-hero");
    var hoverQuery = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
    var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!hero || !hoverQuery || !hoverQuery.matches || (reduceQuery && reduceQuery.matches)) return;

    hero.classList.add("is-pointer");

    function place(x, y) {
      hero.style.setProperty("--bc-endesa-mouse-x", x);
      hero.style.setProperty("--bc-endesa-mouse-y", y);
    }

    hero.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      var rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      hero.classList.remove("is-pointer-out");
      place(
        (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%",
        (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%"
      );
    });

    hero.addEventListener("pointerleave", function () {
      hero.classList.add("is-pointer-out");
      place("50%", "140%");
    });
  }

  function initQuoteStage(root) {
    var quotes = root.querySelectorAll(".bc-endesa-quote");
    var stageQuery = window.matchMedia ? window.matchMedia("(min-width: 901px)") : null;
    var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var lead = root.querySelector(".bc-endesa-close__lead");
    var observer = null;
    var ratios = [];
    var i;

    if (!quotes.length) return;

    function placeLead() {
      if (!lead) return;
      if (!stageQuery || !stageQuery.matches) {
        lead.style.removeProperty("--bc-endesa-close-lead-size");
        return;
      }
      lead.style.setProperty("--bc-endesa-close-lead-size", lead.offsetHeight + "px");
    }

    function listen(query, fn) {
      if (!query) return;
      if (typeof query.addEventListener === "function") query.addEventListener("change", fn);
      else if (typeof query.addListener === "function") query.addListener(fn);
    }

    function activate(quote) {
      var n;
      for (n = 0; n < quotes.length; n += 1) {
        quotes[n].classList.toggle("is-active", quotes[n] === quote);
      }
    }

    function stop() {
      root.classList.remove("is-quote-stage");
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      for (i = 0; i < quotes.length; i += 1) quotes[i].classList.remove("is-active");
    }

    function pick() {
      var best = -1;
      var bestRatio = 0;
      var n;
      for (n = 0; n < quotes.length; n += 1) {
        if (ratios[n] > bestRatio) {
          bestRatio = ratios[n];
          best = n;
        }
      }
      if (best < 0) return;
      activate(quotes[best]);
    }

    function start() {
      stop();
      placeLead();
      if (!stageQuery || !stageQuery.matches || (reduceQuery && reduceQuery.matches)) return;
      if (!("IntersectionObserver" in window)) return;

      root.classList.add("is-quote-stage");
      for (i = 0; i < quotes.length; i += 1) ratios[i] = 0;
      activate(quotes[0]);

      try {
        observer = new IntersectionObserver(function (entries) {
          var n;
          var index;
          for (n = 0; n < entries.length; n += 1) {
            index = Array.prototype.indexOf.call(quotes, entries[n].target);
            if (index < 0) continue;
            ratios[index] = entries[n].isIntersecting ? entries[n].intersectionRatio : 0;
          }
          pick();
        }, {
          root: null,
          rootMargin: "-30% 0px -30% 0px",
          threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]
        });
      } catch (err) {
        stop();
        return;
      }

      for (i = 0; i < quotes.length; i += 1) observer.observe(quotes[i]);
    }

    start();
    listen(stageQuery, start);
    listen(reduceQuery, start);
    window.addEventListener("resize", placeLead);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeLead);
  }

  function revealAll(root) {
    var nodes = root.querySelectorAll(".bc-endesa-intro, .bc-endesa-chapter, .bc-endesa-close, .bc-endesa-quote");
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.add("is-in");
    }
  }

  function initReveals(root) {
    var sections = root.querySelectorAll(".bc-endesa-intro, .bc-endesa-chapter, .bc-endesa-close, .bc-endesa-quote");
    var observer = null;
    var pending = [];

    function reveal(section) {
      if (!section) return;
      section.classList.add("is-in");
      if (observer) {
        try {
          observer.unobserve(section);
        } catch (err) {
          /* ignore */
        }
      }
    }

    function isReached(el) {
      return el.getBoundingClientRect().top < window.innerHeight * 0.92;
    }

    function revealReached() {
      var i;
      var left = [];
      for (i = 0; i < pending.length; i += 1) {
        if (isReached(pending[i])) {
          reveal(pending[i]);
        } else {
          left.push(pending[i]);
        }
      }
      pending = left;
      if (!pending.length && scheduled) {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
      }
    }

    var scheduled = false;
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        revealReached();
      });
    }

    if (!sections.length || !("IntersectionObserver" in window)) {
      revealAll(root);
      return;
    }

    try {
      observer = new IntersectionObserver(
        function (entries) {
          var i;
          for (i = 0; i < entries.length; i += 1) {
            if (entries[i].isIntersecting) {
              reveal(entries[i].target);
            }
          }
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
    } catch (err) {
      revealAll(root);
      return;
    }

    var n;
    for (n = 0; n < sections.length; n += 1) {
      if (isReached(sections[n])) {
        reveal(sections[n]);
      } else {
        pending.push(sections[n]);
        observer.observe(sections[n]);
      }
    }

    if (pending.length) {
      scheduled = true;
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
    }

    var focusables = root.querySelectorAll(".bc-endesa-chapter, .bc-endesa-intro, .bc-endesa-close");
    var f;
    for (f = 0; f < focusables.length; f += 1) {
      focusables[f].addEventListener("focusin", function (event) {
        var section = event.currentTarget;
        if (!section.classList.contains("is-in")) {
          reveal(section);
        }
      });
    }
  }

  function initIndex(root) {
    var links = root.querySelectorAll(".bc-endesa-index__link");
    var chapters = root.querySelectorAll(".bc-endesa-chapter");
    if (!links.length || !chapters.length || !("IntersectionObserver" in window)) return;

    var activeId = "";

    function reducedMotion() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function showInMenu(link) {
      var list = root.querySelector(".bc-endesa-index__list");
      if (!list || !link) return;
      var listBox = list.getBoundingClientRect();
      var linkBox = link.getBoundingClientRect();
      if (linkBox.left >= listBox.left + 4 && linkBox.right <= listBox.right - 4) return;
      var next = list.scrollLeft + (linkBox.left - listBox.left) - (listBox.width - linkBox.width) / 2;
      if (next < 0) next = 0;
      if (reducedMotion() || typeof list.scrollTo !== "function") {
        list.scrollLeft = next;
      } else {
        list.scrollTo({ left: next, behavior: "smooth" });
      }
    }

    function setCurrent(id) {
      var i;
      var href;
      var link;
      for (i = 0; i < links.length; i += 1) {
        href = links[i].getAttribute("href") || "";
        if (id && href === "#" + id) {
          links[i].setAttribute("aria-current", "true");
          link = links[i];
        } else {
          links[i].removeAttribute("aria-current");
        }
      }
      for (i = 0; i < chapters.length; i += 1) {
        if (id && chapters[i].id === id) chapters[i].classList.add("is-current");
        else chapters[i].classList.remove("is-current");
      }
      if (id && id !== activeId) showInMenu(link);
      activeId = id || "";
    }

    function chapterInFocus() {
      var best = null;
      var bestArea = 0;
      var vh = window.innerHeight || 1;
      var bar = root.querySelector(".bc-endesa-index");
      var barBottom = 0;
      var i;
      var rect;
      var top;
      var bottom;
      var area;

      if (bar) {
        rect = bar.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < vh * 0.4) barBottom = rect.bottom;
      }

      for (i = 0; i < chapters.length; i += 1) {
        rect = chapters[i].getBoundingClientRect();
        top = Math.max(rect.top, barBottom);
        bottom = Math.min(rect.bottom, vh);
        area = bottom - top;
        if (area > bestArea) {
          bestArea = area;
          best = chapters[i];
        }
      }

      if (!best || bestArea < Math.min(160, vh * 0.22)) return null;
      return best;
    }

    function sync() {
      var current = chapterInFocus();
      setCurrent(current ? current.id : "");
    }

    var observer;
    try {
      observer = new IntersectionObserver(
        function () {
          sync();
        },
        { root: null, rootMargin: "0px", threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      );
    } catch (err) {
      observer = null;
    }

    var n;
    if (observer) {
      for (n = 0; n < chapters.length; n += 1) observer.observe(chapters[n]);
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        sync();
      });
    }, { passive: true });

    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
