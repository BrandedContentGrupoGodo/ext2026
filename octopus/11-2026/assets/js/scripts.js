(function () {
  function init() {
    var root = document.querySelector(".oe-hub");
    if (!root || root.getAttribute("data-oe-init") === "true") return;
    root.setAttribute("data-oe-init", "true");

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reveals = [];
    var introTitle = root.querySelector(".oe-intro__title");
    var feature = root.querySelector(".oe-feature");
    var moreTitle = root.querySelector(".oe-block--more .oe-block__title");

    if (introTitle) reveals.push(introTitle);
    if (feature) reveals.push(feature);
    if (moreTitle) reveals.push(moreTitle);

    root.querySelectorAll(".oe-card").forEach(function (card, index) {
      card.style.setProperty("--oe-delay", (index * 100) + "ms");
      reveals.push(card);
    });

    reveals.forEach(function (el) {
      el.classList.add("oe-reveal");
    });

    root.classList.add("oe-js");

    if (!reduce && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.2 });

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    }

    root.querySelectorAll(".oe-hero__inner > *").forEach(function (el) {
      el.addEventListener("animationend", function (event) {
        if (event.target !== el) return;
        el.classList.add("is-settled");
      });
    });

    var cta = root.querySelector(".oe-hero__cta");
    if (!cta) return;

    cta.addEventListener("click", function (event) {
      var target = document.getElementById("episodios");
      if (!target) return;
      event.preventDefault();
      var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
