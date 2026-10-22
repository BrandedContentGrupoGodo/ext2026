(function () {
  var root = document.querySelector(".bc-go-hw");
  if (!root || root.getAttribute("data-bc-go-hw-init") === "1") {
    return;
  }
  root.setAttribute("data-bc-go-hw-init", "1");

  if (!("IntersectionObserver" in window)) {
    return;
  }

  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) {
    return;
  }

  var nodes = root.querySelectorAll(".bc-go-hw-reveal, .bc-go-hw-lenses, .bc-go-hw-rings, .bc-go-hw-step");
  if (!nodes.length) {
    return;
  }

  root.setAttribute("data-bc-go-hw-motion", "1");

  function show(node) {
    node.classList.add("is-in");
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }
      show(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.2
  });

  var scheduled = false;

  function scan() {
    nodes.forEach(function (node) {
      if (node.classList.contains("is-in")) {
        return;
      }
      var rect = node.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight * 0.92) {
        return;
      }
      show(node);
      observer.unobserve(node);
    });
  }

  function requestScan() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      scan();
    });
  }

  window.addEventListener("scroll", requestScan, { passive: true });
  window.addEventListener("resize", requestScan);

  var pending = [];
  nodes.forEach(function (node) {
    var rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      pending.push(node);
    } else {
      observer.observe(node);
    }
  });

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      pending.forEach(show);
      scan();
    });
  });

  if (motion.addEventListener) {
    motion.addEventListener("change", function (event) {
      if (!event.matches) {
        return;
      }
      root.removeAttribute("data-bc-go-hw-motion");
      observer.disconnect();
    });
  }
})();
