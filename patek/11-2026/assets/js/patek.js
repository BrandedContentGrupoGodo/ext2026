(function () {
  var root = document.querySelector(".bc-patek");
  if (!root || root.getAttribute("data-bc-patek-init") === "1") return;
  root.setAttribute("data-bc-patek-init", "1");

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduce = false;
  }
  if (!reduce) root.classList.add("is-motion");

  root.addEventListener("click", function (event) {
    var link = event.target.closest("a[href^='#']");
    if (!link || !root.contains(link)) return;
    var id = link.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    if (reduce) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  var navLinks = root.querySelectorAll(".bc-patek-nav a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var sections = [];
    navLinks.forEach(function (link) {
      var section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) sections.push({ link: link, section: section });
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (item) {
          if (item.section === entry.target) {
            navLinks.forEach(function (link) { link.removeAttribute("aria-current"); });
            item.link.setAttribute("aria-current", "true");
          }
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (item) { spy.observe(item.section); });
  }

  var track = root.querySelector(".bc-patek-carousel-track");
  var cards = track ? track.querySelectorAll(".bc-patek-card") : [];
  var counter = root.querySelector("[data-bc-patek-counter]");
  function updateCounter() {
    if (!track || !counter || !cards.length) return;
    var edge = track.getBoundingClientRect().left;
    var best = 0;
    var bestDist = Infinity;
    cards.forEach(function (card, index) {
      var dist = Math.abs(card.getBoundingClientRect().left - edge);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    counter.textContent = (best + 1) + " / " + cards.length;
  }
  function cardStep() {
    return cards[0] ? cards[0].getBoundingClientRect().width + 24 : 320;
  }
  function scrollCards(dir) {
    if (!track) return;
    track.scrollBy({ left: dir * cardStep(), behavior: reduce ? "auto" : "smooth" });
  }
  if (track) {
    track.addEventListener("scroll", updateCounter, { passive: true });
    updateCounter();
    root.querySelectorAll("[data-bc-patek-carousel]").forEach(function (button) {
      button.addEventListener("click", function () {
        var dir = button.getAttribute("data-bc-patek-carousel") === "next" ? 1 : -1;
        scrollCards(dir);
      });
    });
    var carousel = track.closest(".bc-patek-carousel");
    if (carousel) {
      carousel.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        scrollCards(event.key === "ArrowRight" ? 1 : -1);
      });
    }
    var pointer = null;
    var suppressClick = false;
    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener("pointermove", function (event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      var dx = event.clientX - pointer.x;
      if (Math.abs(dx) > 6) {
        pointer.moved = true;
        if (!track.hasPointerCapture(event.pointerId)) track.setPointerCapture(event.pointerId);
        track.scrollLeft = pointer.left - dx;
      }
    });
    track.addEventListener("pointerup", function (event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      suppressClick = pointer.moved;
      pointer = null;
    });
    track.addEventListener("pointercancel", function () { pointer = null; });
    track.addEventListener("click", function (event) {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  var dialog = root.querySelector(".bc-patek-dialog");
  var panels = dialog ? dialog.querySelectorAll("[data-bc-patek-panel]") : [];
  var dialogCount = dialog ? dialog.querySelector("[data-bc-patek-dialog-count]") : null;
  var dialogNav = dialog ? dialog.querySelector(".bc-patek-dialog-nav") : null;
  var opener = null;
  var dialogIndex = 0;

  function showPanel(index) {
    if (!panels.length) return;
    var total = panels.length;
    dialogIndex = ((index % total) + total) % total;
    var target = null;
    panels.forEach(function (panel) {
      if (Number(panel.getAttribute("data-bc-patek-panel")) === dialogIndex) target = panel;
    });
    if (target && dialogNav) {
      var copy = target.querySelector(".bc-patek-dialog-copy");
      if (copy) copy.appendChild(dialogNav);
    }
    panels.forEach(function (panel) {
      if (panel === target) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    if (dialogCount) dialogCount.textContent = (dialogIndex + 1) + " / " + total;
  }

  function openDialog(index, source) {
    if (!dialog) return;
    opener = source || null;
    showPanel(index);
    window.setTimeout(function () {
      if (dialog.open) return;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      var closeBtn = dialog.querySelector(".bc-patek-dialog-close");
      if (closeBtn) closeBtn.focus();
    }, 0);
  }

  root.addEventListener("click", function (event) {
    var open = event.target.closest("[data-bc-patek-open]");
    if (!open || !root.contains(open) || (dialog && dialog.contains(open))) return;
    event.preventDefault();
    openDialog(Number(open.getAttribute("data-bc-patek-open")), open);
  });

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
      var prev = event.target.closest("[data-bc-patek-prev]");
      var next = event.target.closest("[data-bc-patek-next]");
      if (prev) showPanel(dialogIndex - 1);
      if (next) showPanel(dialogIndex + 1);
      var close = event.target.closest("[data-bc-patek-close]");
      if (close && typeof dialog.close === "function") dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (opener && opener.focus) opener.focus();
    });
  }

  var compare = root.querySelector(".bc-patek-compare");
  var range = compare ? compare.querySelector(".bc-patek-compare-range") : null;
  if (compare && range) {
    var setPos = function () {
      compare.style.setProperty("--bc-patek-pos", range.value + "%");
    };
    compare.classList.add("is-ready");
    setPos();
    range.addEventListener("input", setPos);
  }

  var video = root.querySelector("[data-bc-patek-video]");
  if (video) {
    var facade = video.querySelector(".bc-patek-video-facade");
    if (facade) {
      facade.addEventListener("click", function (event) {
        event.preventDefault();
        var id = video.getAttribute("data-youtube-id");
        if (!id) return;
        var frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
        frame.title = "Vídeo: Patek Philippe y Unión Suiza";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        frame.setAttribute("allowfullscreen", "");
        frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        video.replaceChildren(frame);
      });
    }
  }
})();
