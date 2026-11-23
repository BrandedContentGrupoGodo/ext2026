(function () {
  var PHASES = 5;
  var MILESTONES = [1, 7, 14, 21, 30];
  var MAP_NAMES = ["1 Llegada", "2 Barrera", "3 Defensas", "4 Beneficios", "5 Hábito"];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function reducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function init() {
    var root = document.querySelector(".bc-actimel");
    if (!root || root.getAttribute("data-bc-actimel-init") === "1") return;
    root.setAttribute("data-bc-actimel-init", "1");

    var reduce = reducedMotion();
    if (!reduce) root.classList.add("is-motion");

    initAnchors(root, reduce);
    initRuler(root);
    initQuiz(root);
    initPlan(root, reduce);
    initHabits(root);
    initFaq(root);
    initScrollDepth(root);
  }

  function initAnchors(root, reduce) {
    root.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (target.tabIndex < 0) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  function initRuler(root) {
    var pin = root.querySelector("[data-ruler-pin]");
    var dayEl = root.querySelector("[data-ruler-day]");
    if (!pin && !dayEl) return;
    var desk = pin ? pin.parentNode : null;
    var dark = [].slice.call(root.querySelectorAll(".bc-actimel-plan, .bc-actimel-cta"));

    function place() {
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      var pct = total <= 0 ? 1 : scrolled / total;
      var day = Math.round(1 + pct * 29);
      if (day < 1) day = 1;
      if (day > 30) day = 30;
      if (pin) pin.style.top = ((day - 1) / 29 * 100) + "%";
      if (dayEl) dayEl.textContent = String(day);
      if (desk) {
        var mid = window.innerHeight / 2;
        var onDark = dark.some(function (s) {
          var r = s.getBoundingClientRect();
          return r.top < mid && r.bottom > mid;
        });
        desk.classList.toggle("is-dark", onDark);
      }
    }

    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
  }

  function initQuiz(root) {
    var quiz = root.querySelector("[data-quiz]");
    if (!quiz) return;
    var buttons = quiz.querySelectorAll("[data-track='quiz-opcion']");
    var card = root.querySelector("[data-quiz-card]");
    var ph = root.querySelector("[data-quiz-ph]");
    var kicker = root.querySelector("[data-quiz-k]");
    var hint = quiz.querySelector(".bc-actimel-quiz-hint");
    var done = false;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (done) return;
        done = true;
        var correct = btn.getAttribute("data-value") === "intestino";
        buttons.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute("data-value") === "intestino") {
            b.classList.add("is-correct");
          } else if (b === btn && !correct) {
            b.classList.add("is-wrong");
          }
        });
        if (kicker) kicker.textContent = correct ? "CORRECTO" : "ERA EN EL INTESTINO";
        if (ph) ph.hidden = true;
        if (hint) hint.style.visibility = "hidden";
        if (card) {
          card.hidden = false;
        }
      });
    });
  }

  function milestoneLeft(day) {
    return ((day - 1) / 29) * 100;
  }

  function initPlan(root, reduce) {
    var plan = root.querySelector("[data-plan]");
    if (!plan) return;
    var tabs = [].slice.call(plan.querySelectorAll("[role='tab']"));
    var panels = [].slice.call(plan.querySelectorAll("[role='tabpanel']"));
    var track = plan.querySelector("[data-plan-track]");
    var fill = plan.querySelector("[data-plan-fill]");
    var marks = [].slice.call(plan.querySelectorAll("[data-plan-mark]"));
    var pins = [].slice.call(plan.querySelectorAll("[data-pin]"));
    var labels = [].slice.call(plan.querySelectorAll("[data-map-label]"));
    var now = plan.querySelector("[data-map-now]");
    var counters = [].slice.call(plan.querySelectorAll("[data-plan-count]"));
    var prevs = [].slice.call(plan.querySelectorAll("[data-plan-prev]"));
    var nexts = [].slice.call(plan.querySelectorAll("[data-plan-next]"));
    var live = plan.querySelector("[data-plan-live]");
    var index = 0;

    function videoOf(panel) {
      return panel ? panel.querySelector("video") : null;
    }

    function syncVideos() {
      panels.forEach(function (panel, i) {
        var video = videoOf(panel);
        if (!video) return;
        var active = i === index;
        var rect = panel.getBoundingClientRect();
        var onScreen = rect.bottom > 80 && rect.top < window.innerHeight - 40 && rect.width > 0;
        if (!active || !onScreen || reduce) {
          video.pause();
          return;
        }
        video.muted = true;
        video.playsInline = true;
        if (!video.getAttribute("src")) {
          var src = video.getAttribute("data-src");
          if (src) video.setAttribute("src", src);
        }
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      });
    }

    function go(nextIndex, source) {
      if (nextIndex < 0 || nextIndex >= PHASES) return;
      index = nextIndex;
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel, i) {
        var on = i === index;
        panel.classList.toggle("is-active", on);
        panel.querySelectorAll("a, button").forEach(function (el) {
          if (on) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", "-1");
        });
      });
      if (track) {
        var card = panels[0];
        var gap = 20;
        try { gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20; } catch (e) {}
        var w = card ? card.getBoundingClientRect().width : 0;
        track.style.transform = "translateX(" + (-index * (w + gap)) + "px)";
      }
      var left = milestoneLeft(MILESTONES[index]);
      if (fill) fill.style.width = left + "%";
      marks.forEach(function (mark, i) {
        mark.classList.toggle("is-done", i <= index);
        mark.classList.toggle("is-current", i === index);
      });
      pins.forEach(function (pin, i) {
        pin.classList.toggle("is-active", i === index);
      });
      labels.forEach(function (label, i) {
        label.classList.toggle("is-active", i === index);
      });
      if (now) now.textContent = MAP_NAMES[index];
      counters.forEach(function (counter) { counter.textContent = (index + 1) + " / " + PHASES; });
      prevs.forEach(function (prev) {
        prev.disabled = index === 0;
        prev.setAttribute("data-fase", String(Math.max(1, index)));
      });
      nexts.forEach(function (next) {
        next.disabled = index === PHASES - 1;
        next.setAttribute("data-fase", String(Math.min(PHASES, index + 2)));
      });
      if (live && source) {
        var title = panels[index].querySelector("h3");
        live.textContent = "Fase " + (index + 1) + " de " + PHASES + (title ? ": " + title.textContent.trim() : "");
      }
      plan.setAttribute("data-fase", String(index + 1));
      syncVideos();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { go(i, true); });
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener("keydown", function (e) {
        var dest = null;
        if (e.key === "ArrowRight") dest = (i + 1) % PHASES;
        else if (e.key === "ArrowLeft") dest = (i - 1 + PHASES) % PHASES;
        else if (e.key === "Home") dest = 0;
        else if (e.key === "End") dest = PHASES - 1;
        if (dest === null) return;
        e.preventDefault();
        tabs[dest].focus();
        go(dest, true);
      });
    });

    prevs.forEach(function (prev) { prev.addEventListener("click", function () { go(index - 1, true); }); });
    nexts.forEach(function (next) { next.addEventListener("click", function () { go(index + 1, true); }); });

    panels.forEach(function (panel, i) {
      panel.addEventListener("click", function (e) {
        if (i === index) return;
        if (e.target.closest("a, button")) return;
        go(i, true);
      });
    });

    plan.addEventListener("keydown", function (e) {
      if (e.target.closest("[role='tab']")) return;
      if (!plan.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, true); }
    });

    var startX = 0;
    var startY = 0;
    var tracking = false;
    var swipeEl = plan.querySelector(".bc-actimel-slider") || plan;
    swipeEl.addEventListener("touchstart", function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      tracking = true;
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });
    swipeEl.addEventListener("touchend", function (e) {
      if (!tracking || !e.changedTouches || !e.changedTouches[0]) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? index + 1 : index - 1, true);
    }, { passive: true });

    window.addEventListener("resize", function () { go(index, false); });

    if ("IntersectionObserver" in window) {
      try {
        var io = new IntersectionObserver(function () { syncVideos(); }, { threshold: [0, 0.25, 0.6] });
        panels.forEach(function (panel) { io.observe(panel); });
      } catch (e) {
        window.addEventListener("scroll", syncVideos, { passive: true });
      }
    } else {
      window.addEventListener("scroll", syncVideos, { passive: true });
    }
    window.addEventListener("scroll", syncVideos, { passive: true });

    root.classList.add("is-ready");
    go(0, false);
  }

  function initHabits(root) {
    var buttons = [].slice.call(root.querySelectorAll("[data-track='habito-toggle']"));
    var count = root.querySelector("[data-habit-count]");
    if (!buttons.length) return;

    function paint() {
      var n = buttons.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).length;
      if (count) count.textContent = String(n);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", on ? "false" : "true");
        paint();
      });
    });
    paint();
  }

  function initFaq(root) {
    var items = [].slice.call(root.querySelectorAll("[data-faq-btn]"));
    if (!items.length) return;

    function close(btn) {
      btn.setAttribute("aria-expanded", "false");
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.hidden = true;
    }

    function open(btn) {
      btn.setAttribute("aria-expanded", "true");
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.hidden = false;
    }

    items.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        if (expanded) {
          close(btn);
          return;
        }
        items.forEach(close);
        open(btn);
      });
    });
  }

  function initScrollDepth(root) {
    var fired = { 25: false, 50: false, 75: false, 100: false };

    function check() {
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      var pct = total <= 0 ? 100 : (scrolled / total) * 100;
      [25, 50, 75, 100].forEach(function (mark) {
        if (fired[mark] || pct < mark) return;
        fired[mark] = true;
        document.dispatchEvent(new CustomEvent("bc:scroll", { detail: { pct: mark } }));
      });
    }

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
  }

  ready(init);
})();
