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

// Rellena el articleBody del NewsArticle que genera Xalok con el texto de la maqueta.
// No crea un segundo bloque de datos estructurados: modifica el que ya existe.
function bcFillArticleBody(rootSelector) {
  var root = document.querySelector(rootSelector);
  if (!root) return;

  // Texto: titulares, párrafos y elementos de lista, en orden.
  // Excluye lo decorativo (aria-hidden), los créditos y lo marcado con data-bc-nobody.
  var parts = [];
  root.querySelectorAll('h2, h3, p, li:not(:has(p))').forEach(function (el) {
    if (el.closest('[aria-hidden="true"], [data-bc-nobody], .bc-credits, [class*="-credits"]')) return;
    var t = el.textContent.replace(/\s+/g, ' ').trim();
    if (t) parts.push(t);
  });
  var body = parts.join('\n\n');
  if (!body) return;

  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
    var data;
    try { data = JSON.parse(s.textContent); } catch (e) { return; }
    var items = Array.isArray(data) ? data : (data['@graph'] || [data]);
    var changed = false;
    items.forEach(function (it) {
      var type = [].concat(it['@type'] || []).join(',');
      if (/Article/.test(type) && !it.articleBody) {
        it.articleBody = body;
        changed = true;
      }
    });
    if (changed) s.textContent = JSON.stringify(data);
  });
}

bcFillArticleBody('.bc-go-hw'); // en Nissan, el contenedor de ese proyecto
