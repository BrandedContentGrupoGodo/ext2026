(function () {
  var CLIPS = {
    "quote-01": { start: 391, end: 410, title: "Fragmento de Deborah García Bello, minuto 6:37" },
    "quote-02": { start: 971, end: 989, title: "Fragmento de la doctora Ana Sánchez Bao, minuto 16:17" },
    vitality: { start: 1338, end: 1348, title: "Fragmento de Federico Luis Moya, minuto 22:18" },
    "quote-03": { start: 950, end: 969, title: "Fragmento de la doctora Ana Sánchez Bao, minuto 15:56" },
    "voice-anpo": { start: 2007, end: 2027, title: "Fragmento de Federico Luis Moya, minuto 33:33" },
    "voice-feh": { start: 779, end: 796, title: "Fragmento de Josep Maria Martínez, minuto 13:05" },
    "quote-05": { start: 1051, end: 1069, title: "Fragmento de la doctora Ana Sánchez Bao, minuto 17:37" },
    "quote-06": { start: 66, end: 82, title: "Fragmento de Deborah García Bello, minuto 1:12" },
    full: { start: 0, title: "Conversación completa. Conexiones reales: hablemos de obesidad" }
  };

  var VIDEO = "eUHpInmhqFQ";
  var roots = document.querySelectorAll(".bc-obesidad");

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  roots.forEach(init);

  function init(root) {
    if (root.getAttribute("data-bc-obesidad-init") === "1") return;
    root.setAttribute("data-bc-obesidad-init", "1");
    root.classList.add("is-ready");

    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var blinkTimer = 0;
    var blinkAnim = null;
    var ringAnim = null;
    var revealObserver = null;

    function clearMotion() {
      window.clearTimeout(blinkTimer);
      if (blinkAnim && blinkAnim.cancel) blinkAnim.cancel();
      blinkAnim = null;
      if (ringAnim && ringAnim.cancel) ringAnim.cancel();
      ringAnim = null;
      root.classList.remove("is-motion");
      root.querySelectorAll(".bc-obesidad-reveal").forEach(function (el) {
        el.classList.add("is-in");
      });
      var iris = root.querySelector(".bc-obesidad-hero__iris");
      var eye = iris ? iris.querySelector("img") : null;
      if (eye) eye.style.transform = "none";
      var ring = root.querySelector(".bc-obesidad-hero__ring");
      if (ring) {
        ring.style.strokeDasharray = "";
        ring.style.strokeDashoffset = "";
        ring.removeAttribute("stroke-dasharray");
        ring.removeAttribute("stroke-dashoffset");
      }
    }

    function drawRing() {
      var ring = root.querySelector(".bc-obesidad-hero__ring");
      if (!ring || ring.getAttribute("data-bc-obesidad-draw") === "1") return;
      function attempt() {
        if (reduced() || !ring || ring.getAttribute("data-bc-obesidad-draw") === "1") return;
        var svg = ring.ownerSVGElement;
        var box = svg.getBoundingClientRect();
        var view = svg.viewBox.baseVal.width || box.width || 1;
        if (!box.width) {
          window.requestAnimationFrame(attempt);
          return;
        }
        var length = ring.getTotalLength() * (box.width / view);
        if (!length) return;
        ring.setAttribute("data-bc-obesidad-draw", "1");
        ring.style.strokeDasharray = length + "px";
        ring.style.strokeDashoffset = length + "px";
        if (!ring.animate) {
          ring.style.strokeDashoffset = "0px";
          return;
        }
        ringAnim = ring.animate(
          [{ strokeDashoffset: length + "px" }, { strokeDashoffset: "0px" }],
          { duration: 1150, easing: "ease-out", fill: "forwards" }
        );
      }
      window.requestAnimationFrame(attempt);
    }

    function armMotion() {
      if (reduced()) {
        clearMotion();
        return;
      }
      root.classList.add("is-motion");
      drawRing();
      var iris = root.querySelector(".bc-obesidad-hero__iris");
      var eye = iris ? iris.querySelector("img") : null;
      if (eye && iris.getAttribute("data-bc-obesidad-blink") !== "1") {
        iris.setAttribute("data-bc-obesidad-blink", "1");
        blinkTimer = window.setTimeout(function () {
          if (reduced() || !eye.animate) return;
          blinkAnim = eye.animate(
            [
              { transform: "scaleY(1)" },
              { transform: "scaleY(0.08)", offset: 0.375 },
              { transform: "scaleY(1)" }
            ],
            { duration: 320, easing: "ease-in-out" }
          );
        }, 1500);
      }
      var items = root.querySelectorAll(".bc-obesidad-reveal");
      if (!("IntersectionObserver" in window)) {
        items.forEach(function (el) { el.classList.add("is-in"); });
        return;
      }
      if (revealObserver) revealObserver.disconnect();
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.25 });
      items.forEach(function (el) {
        if (!el.classList.contains("is-in")) revealObserver.observe(el);
      });
    }

    armMotion();
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", function () {
        if (reduced()) clearMotion();
        else armMotion();
      });
    }

    measureHost(root);
    setupNav(root);
    setupExclusive(root, "[data-bc-obesidad-imc]", ".bc-obesidad-imc__panel", "data-bc-obesidad-view", function (view) {
      root.querySelector("[data-bc-obesidad-imc]").classList.toggle("is-persona", view === "persona");
    });
    setupTabs(root);
    setupExclusive(root, "[data-bc-obesidad-voices]", ".bc-obesidad-voices__panel", "data-bc-obesidad-voice", function () {
      root.querySelectorAll("[data-bc-obesidad-voices] .bc-obesidad-player").forEach(restorePlayer);
    });
    setupPlayers(root);
    setupChapters(root);
    setupAccordions(root);
  }

  function measureHost(root) {
    var nav = root.querySelector(".bc-obesidad-navwrap");
    var header = document.querySelector(".main-header");
    var scheduled = false;

    function apply() {
      scheduled = false;
      var offset = 0;
      if (header && !root.contains(header)) {
        var cs = window.getComputedStyle(header);
        if (cs.position === "fixed" || cs.position === "sticky") {
          var rect = header.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top <= 1) offset = rect.bottom;
        }
      }
      root.style.setProperty("--bc-obesidad-host-offset", Math.round(offset) + "px");
      if (nav) root.style.setProperty("--bc-obesidad-nav-height", nav.offsetHeight + "px");
    }

    function request() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("resize", request);
    window.addEventListener("scroll", request, { passive: true });
    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(request);
      if (header) observer.observe(header);
      if (nav) observer.observe(nav);
    }
  }

  function setupNav(root) {
    var nav = root.querySelector(".bc-obesidad-nav");
    var toggle = root.querySelector(".bc-obesidad-nav__toggle");
    if (!nav || !toggle) return;

    function close(returnFocus) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) close(true);
    });

    root.addEventListener("click", function (event) {
      var link = event.target.closest("a[href^='#']");
      if (!link || !root.contains(link)) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      var id = decodeURIComponent(link.getAttribute("href").slice(1));
      var target = document.getElementById(id);
      if (!target) return;
      var playKey = link.getAttribute("data-bc-obesidad-play");
      if (reduced()) {
        close(false);
        if (playKey) playClip(root, playKey);
        return;
      }
      event.preventDefault();
      close(false);
      window.requestAnimationFrame(function () {
        if (target.getAttribute("tabindex") === null) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", "#" + id);
        }
        if (playKey) playClip(root, playKey);
      });
    });
  }

  function setupExclusive(root, scopeSelector, panelSelector, attr, onChange) {
    var scope = root.querySelector(scopeSelector);
    if (!scope) return;
    var buttons = scope.querySelectorAll("button[aria-pressed]");
    var panels = scope.querySelectorAll(panelSelector);

    function select(value) {
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute(attr) === value ? "true" : "false");
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute(attr) === value;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
        if (on) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      });
      if (onChange) onChange(value);
    }

    var initial = "cifra";
    buttons.forEach(function (button) {
      if (button.getAttribute("aria-pressed") === "true") initial = button.getAttribute(attr);
      button.addEventListener("click", function () {
        select(button.getAttribute(attr));
      });
    });
    select(initial);

    scope.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
      var list = Array.prototype.slice.call(buttons);
      var index = list.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = list.length - 1;
      else if (event.key === "ArrowRight") index = (index + 1) % list.length;
      else index = (index - 1 + list.length) % list.length;
      list[index].focus();
      select(list[index].getAttribute(attr));
    });
  }

  function setupTabs(root) {
    var tabs = root.querySelectorAll("[data-bc-obesidad-tab]");
    var panels = root.querySelectorAll("[data-bc-obesidad-factor]");
    if (!tabs.length) return;

    function select(id) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-bc-obesidad-tab") === id;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute("data-bc-obesidad-factor") === id;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
        if (on) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        select(tab.getAttribute("data-bc-obesidad-tab"));
      });
    });

    var list = root.querySelector("[role='tablist']");
    if (!list) return;
    list.addEventListener("keydown", function (event) {
      var order = Array.prototype.slice.call(tabs);
      var index = order.indexOf(document.activeElement);
      if (index < 0) return;
      var next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % order.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + order.length) % order.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = order.length - 1;
      else return;
      event.preventDefault();
      order[next].focus();
      select(order[next].getAttribute("data-bc-obesidad-tab"));
    });
    select("genetica");
  }

  function restorePlayer(player) {
    var frame = player.querySelector(".bc-obesidad-player__frame, .bc-obesidad-clip__frame");
    if (frame) frame.innerHTML = "";
    player.classList.remove("is-playing");
    var button = player.querySelector("button");
    if (button) button.hidden = false;
  }

  function playClip(root, key) {
    var player = root.querySelector("[data-bc-obesidad-clip='" + key + "']");
    if (!player) return;
    var clip = CLIPS[key];
    if (!clip) return;
    root.querySelectorAll("[data-bc-obesidad-clip].is-playing").forEach(function (other) {
      if (other !== player) restorePlayer(other);
    });
    var slot = player.querySelector(".bc-obesidad-player__frame, .bc-obesidad-clip__frame");
    if (!slot) return;
    if (player.classList.contains("is-playing")) return;
    var params = ["rel=0", "playsinline=1", "autoplay=1", "start=" + clip.start];
    if (typeof clip.end === "number") params.push("end=" + clip.end);
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + VIDEO + "?" + params.join("&");
    iframe.title = clip.title;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    slot.appendChild(iframe);
    player.classList.add("is-playing");
    var button = player.querySelector("button");
    if (button) button.hidden = true;
  }

  function setupPlayers(root) {
    root.querySelectorAll("[data-bc-obesidad-clip] button").forEach(function (button) {
      button.addEventListener("click", function () {
        var player = button.closest("[data-bc-obesidad-clip]");
        playClip(root, player.getAttribute("data-bc-obesidad-clip"));
      });
    });
  }

  function setupChapters(root) {
    var sections = root.querySelectorAll("[data-bc-obesidad-chapter]");
    var links = root.querySelectorAll("[data-bc-obesidad-nav]");
    if (!sections.length) return;

    function setCurrent(key) {
      links.forEach(function (link) {
        if (key && link.getAttribute("data-bc-obesidad-nav") === key) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    function readingLine() {
      var line = 0;
      var header = document.querySelector(".main-header");
      if (header && !root.contains(header)) {
        var headerStyle = window.getComputedStyle(header);
        var headerRect = header.getBoundingClientRect();
        if ((headerStyle.position === "fixed" || headerStyle.position === "sticky") && headerRect.bottom > 0 && headerRect.top <= 1) {
          line = headerRect.bottom;
        }
      }
      var nav = root.querySelector(".bc-obesidad-navwrap");
      if (nav) line += nav.getBoundingClientRect().height;
      return line + 28;
    }

    var scheduled = false;
    function update() {
      scheduled = false;
      var line = readingLine();
      var current = null;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= line) current = section;
      });
      setCurrent(current ? current.getAttribute("data-bc-obesidad-chapter") : null);
    }

    function request() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("hashchange", request);
  }

  function setupAccordions(root) {
    root.querySelectorAll(".bc-obesidad-acc summary").forEach(function (summary) {
      summary.addEventListener("click", function () {
        window.requestAnimationFrame(function () {
          var nav = root.querySelector(".bc-obesidad-navwrap");
          if (nav) root.style.setProperty("--bc-obesidad-nav-height", nav.offsetHeight + "px");
        });
      });
    });
  }
})();
