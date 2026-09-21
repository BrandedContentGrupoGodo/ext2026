/* ==========================================================================
   Branded Content — Santander Hub
   Código encapsulado y acotado al root del branded content.
   ========================================================================== */

(function () {
  "use strict";

  const root = document.querySelector('[data-bc-project="santander"]');

  if (!root) return;

  console.log("Santander Hub inicializado correctamente.");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const UPCOMING_LABEL = "PRÓXIMAMENTE";
  const SWAP_MS = 90;

  /* ----------------------------------------------------------------------
     DATOS
     Estados de publicación editables aquí (available: true/false).
     `href` sigue como placeholder hasta URLs reales de lavanguardia.com.
     ---------------------------------------------------------------------- */

  const episodes = [
    {
      number: "01",
      title: "La era de la inteligencia artificial",
      description: "Cómo la IA está transformando la manera en que trabajamos y qué habilidades marcarán la diferencia. (Texto provisional.)",
      image: "assets/img/episode-01-silvia.webp",
      href: "#",
      available: true
    },
    {
      number: "02",
      title: "Nuevas profesiones, nuevas habilidades",
      description: "Los perfiles que están surgiendo y las competencias que piden las empresas hoy. (Texto provisional.)",
      image: "assets/img/episode-02-silvia.webp",
      href: "#",
      available: true
    },
    {
      number: "03",
      title: "Aprender a lo largo de toda la vida",
      description: "Por qué la formación continua se ha vuelto esencial para cualquier carrera. (Texto provisional.)",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "04",
      title: "El valor de las habilidades humanas",
      description: "Empatía, creatividad y pensamiento crítico en un mundo automatizado. (Texto provisional.)",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "05",
      title: "Tecnología con propósito",
      description: "Innovar para mejorar la vida de las personas y el impacto social. (Texto provisional.)",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "06",
      title: "El futuro del trabajo",
      description: "Una mirada a cómo serán los empleos y los equipos en los próximos años. (Texto provisional.)",
      image: null,
      href: "#",
      available: false
    }
  ];

  const stories = [
    {
      number: "01",
      title: "De la hostelería a los datos",
      description: "Dejó la cocina para convertirse en analista de datos tras formarse por su cuenta. (Texto provisional.)",
      image: "assets/img/story-01.webp",
      href: "#",
      available: true
    },
    {
      number: "02",
      title: "Reinventarse a los 50",
      description: "Una nueva etapa profesional cuando parecía que todo estaba decidido. (Texto provisional.)",
      image: "assets/img/story-02.webp",
      href: "#",
      available: true
    },
    {
      number: "03",
      title: "Del aula al laboratorio",
      description: "De enseñar ciencia a investigarla gracias a la formación continua. (Texto provisional.)",
      image: "assets/img/story-03.webp",
      href: "#",
      available: false
    },
    {
      number: "04",
      title: "Emprender con propósito",
      description: "Montó un proyecto con impacto social tras aprender nuevas habilidades. (Texto provisional.)",
      image: "assets/img/story-04.webp",
      href: "#",
      available: false
    },
    {
      number: "05",
      title: "Programar una segunda oportunidad",
      description: "Descubrió el desarrollo de software y cambió por completo su rumbo. (Texto provisional.)",
      image: "assets/img/story-05.webp",
      href: "#",
      available: false
    },
    {
      number: "06",
      title: "Liderar equipos del futuro",
      description: "Aprendió a dirigir personas combinando tecnología y habilidades humanas. (Texto provisional.)",
      image: "assets/img/story-06.webp",
      href: "#",
      available: false
    }
  ];

  /* ----------------------------------------------------------------------
     Microfade al cambiar contenido del destacado (episodios / historias).
     No desplaza layout ni re-ejecuta reveals.
     ---------------------------------------------------------------------- */

  function runSwapFade(container, updateFn) {
    if (!container || typeof updateFn !== "function") {
      if (typeof updateFn === "function") updateFn();
      return;
    }

    const targets = Array.from(container.querySelectorAll(".bc-swap-target"));

    if (prefersReducedMotion || !targets.length || !root.classList.contains("is-enhanced")) {
      updateFn();
      return;
    }

    targets.forEach(function (el) {
      el.classList.add("bc-is-swapping");
    });

    window.setTimeout(function () {
      updateFn();
      window.requestAnimationFrame(function () {
        targets.forEach(function (el) {
          el.classList.remove("bc-is-swapping");
        });
      });
    }, SWAP_MS);
  }

  /* ----------------------------------------------------------------------
     Selector destacado + cards, con soporte de disponibilidad.
     ---------------------------------------------------------------------- */

  function setThumb(el, item, label) {
    if (!el) return;
    if (el.tagName === "IMG") {
      if (item.image) {
        el.src = item.image;
        el.alt = label + item.number + ": " + item.title;
      }
    } else {
      el.textContent = label + item.number;
    }
  }

  /* Tras seleccionar una historia desde una card: si el destacado no está
     cómodamente visible (p. ej. el usuario ha bajado a las cards 5–6),
     hacer scroll suave hasta él. No se aplica a episodios ni a la carga inicial. */
  function ensureStoryFeaturedInView(featuredEl) {
    if (!featuredEl) return;

    const rect = featuredEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight =
      Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const topComfortable = rect.top >= -8 && rect.top <= vh * 0.4;
    const enoughVisible = visibleHeight >= Math.min(140, rect.height * 0.35);

    if (topComfortable && enoughVisible) return;

    featuredEl.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function buildSelector(data, prefix, cardSelector, options) {
    options = options || {};
    const els = {
      eyebrow: root.querySelector("[data-" + prefix + "-eyebrow]"),
      title: root.querySelector("[data-" + prefix + "-title]"),
      desc: root.querySelector("[data-" + prefix + "-desc]"),
      link: root.querySelector("[data-" + prefix + "-link]"),
      thumb: root.querySelector("[data-" + prefix + "-thumb]")
    };
    const cards = Array.from(root.querySelectorAll(cardSelector));
    const eyebrowLabel = prefix === "ep" ? "EPISODIO " : "HISTORIA ";
    const thumbLabel = prefix === "ep" ? "Episodio " : "Historia ";
    const featuredEl =
      typeof options.featuredSelector === "string"
        ? root.querySelector(options.featuredSelector)
        : null;

    function isAvailable(index) {
      return !!(data[index] && data[index].available);
    }

    function applyContent(index) {
      const item = data[index];
      if (!item) return;

      if (els.eyebrow) els.eyebrow.textContent = eyebrowLabel + item.number;
      if (els.title) els.title.textContent = item.title;
      if (els.desc) els.desc.textContent = item.description;
      setThumb(els.thumb, item, thumbLabel);
      if (els.link) els.link.setAttribute("href", item.href);
    }

    function updateCards(index) {
      cards.forEach(function (card, i) {
        if (!isAvailable(i)) return;
        const active = i === index;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function select(index, opts) {
      const item = data[index];
      if (!item || !item.available) return;

      opts = opts || {};
      const animate = opts.animate !== false;

      updateCards(index);

      if (animate && featuredEl) {
        runSwapFade(featuredEl, function () {
          applyContent(index);
        });
      } else {
        applyContent(index);
      }
    }

    cards.forEach(function (card, i) {
      const item = data[i];

      let status = card.querySelector(".bc-card__status");
      if (!status) {
        status = document.createElement("span");
        status.className = "bc-card__status";
        card.appendChild(status);
      }

      if (item && item.available) {
        status.textContent = "";
        card.addEventListener("click", function () {
          select(i, { animate: true });
          if (typeof options.afterCardSelect === "function") {
            options.afterCardSelect();
          }
        });
      } else {
        card.classList.add("is-upcoming");
        card.disabled = true;
        card.setAttribute("aria-disabled", "true");
        card.removeAttribute("aria-pressed");
        status.textContent = UPCOMING_LABEL;
      }
    });

    const firstAvailable = data.findIndex(function (d) {
      return d.available;
    });
    if (firstAvailable >= 0) select(firstAvailable, { animate: false });

    return { select: select, isAvailable: isAvailable };
  }

  const episodeCtrl = buildSelector(episodes, "ep", ".bc-episode-card", {
    featuredSelector: ".bc-episode-featured"
  });
  const storyFeatured = root.querySelector(".bc-story-featured");
  const storyCtrl = buildSelector(stories, "story", ".bc-story-card", {
    featuredSelector: ".bc-story-featured",
    afterCardSelect: function () {
      // En desktop (≥1024) el destacado es sticky: no hace falta scroll automático.
      // En tablet/mobile sí reenfocamos el detalle si no está visible.
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        ensureStoryFeaturedInView(storyFeatured);
      }
    }
  });

  /* ----------------------------------------------------------------------
     Retratos del hero: navegación configurable por data-*
     ---------------------------------------------------------------------- */

  const portraits = Array.from(root.querySelectorAll(".bc-portrait"));

  portraits.forEach(function (portrait) {
    portrait.addEventListener("click", function () {
      const type = portrait.getAttribute("data-type");
      const targetId = portrait.getAttribute("data-target");
      const index = parseInt(portrait.getAttribute("data-index"), 10) || 0;

      const ctrl = type === "story" ? storyCtrl : episodeCtrl;

      if (!ctrl.isAvailable(index)) return;

      ctrl.select(index, { animate: true });

      const section = targetId ? root.querySelector("#" + targetId) : null;
      if (section) {
        section.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  });

  /* ----------------------------------------------------------------------
     MOTION — hero enter + reveals (IntersectionObserver + salvage)
     ---------------------------------------------------------------------- */

  function initMotion() {
    if (prefersReducedMotion) return;

    const supportsObserver = "IntersectionObserver" in window;
    if (!supportsObserver) return;

    root.classList.add("is-enhanced");

    /* Hero: entrada al cargar (no depende de scroll) */
    window.requestAnimationFrame(function () {
      root.classList.add("bc-hero-ready");
    });

    const pending = new Set(
      Array.from(root.querySelectorAll(".reveal")).filter(function (el) {
        return !el.classList.contains("is-visible");
      })
    );

    if (!pending.size) return;

    let rafId = 0;
    let observer = null;

    function cleanup() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function revealEl(el) {
      if (!pending.has(el)) return;
      el.classList.add("is-visible");
      pending.delete(el);
      if (observer) observer.unobserve(el);
      if (!pending.size) cleanup();
    }

    function revealPassed() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      pending.forEach(function (el) {
        const rect = el.getBoundingClientRect();
        /* Visible en viewport o ya rebasado por arriba */
        if (rect.top < vh * 0.92) {
          revealEl(el);
        }
      });
    }

    function onScrollOrResize() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(function () {
        rafId = 0;
        revealPassed();
      });
    }

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealEl(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    pending.forEach(function (el) {
      observer.observe(el);
    });

    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    /* Comprobación inicial (carga desplazada / deep-link) */
    revealPassed();
  }

  initMotion();
})();
