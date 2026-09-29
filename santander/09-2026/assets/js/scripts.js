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
      title: "El futuro ya está aquí: cómo el 'reskilling' o reciclaje profesional ayuda a adaptarse a la era de la IA",
      description: "Silvia Leal aconseja identificar las tareas que la inteligencia artificial ya está transformando, aprender nuevas herramientas y apostar por la formación continua.",
      image: "assets/img/episode-01-silvia.webp",
      href: "https://www.lavanguardia.com/economia/20260915/11624779/futuro-esta-como-reskilling-reciclaje-profesional-ayuda-adaptarse-inteligencia-artificial-brl.html",
      available: true
    },
    {
      number: "02",
      title: "Las competencias que te ayudarán a crecer en tu puesto de trabajo antes de 2030",
      description: "Silvia Leal, experta en tendencias de futuro, aconseja aprovechar la formación online para aprender idiomas, habilidades digitales o inteligencia artificial",
      image: "assets/img/episode-02-silvia.webp",
      href: "https://www.lavanguardia.com/economia/20260929/11625483/competencias-te-ayudaran-crecer-puesto-trabajo-2030-brl.html",
      available: true
    },
    {
      number: "03",
      title: "Próximamente: episodio 3 con Silvia Leal",
      description: "",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "04",
      title: "Próximamente: episodio 4 con Silvia Leal",
      description: "",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "05",
      title: "Próximamente: episodio 5 con Silvia Leal",
      description: "",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "06",
      title: "Próximamente: episodio 6 con Silvia Leal",
      description: "",
      image: null,
      href: "#",
      available: false
    }
  ];

  const stories = [
    {
      number: "01",
      title: "De dirigir RRHH a reinventarse como consultora: María y la importancia de seguir aprendiendo",
      description: "María es un ejemplo de cómo el aprendizaje constante permite rediseñar la propia carrera profesional ante el cambio de paradigma actual",
      image: "assets/img/story-01.webp",
      href: "https://www.lavanguardia.com/vida/20260922/11635295/dirigir-recursos-humanos-reinventarse-consultora-maria-llosent-importancia-seguir-aprendiendo-brl.html",
      available: true
    },
    {
      number: "02",
      title: "¿Qué puede aprender un ingeniero aeroespacial de un diplomático? Esta es la experiencia de Juan",
      description: "El Curso Santander | Jóvenes Líderes Iberoamericanos permitió a Juan Garrido salir de su entorno técnico y compartir experiencias con profesionales de otras disciplinas",
      image: "assets/img/story-02.webp",
      href: "#",
      available: false
    },
    {
      number: "03",
      title: "Próximamente: la historia de Eva",
      description: "",
      image: "assets/img/story-03.webp",
      href: "#",
      available: false
    },
    {
      number: "04",
      title: "Próximamente: la historia de María Cudeiro",
      description: "",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "05",
      title: "Próximamente: la historia de Susana",
      description: "",
      image: null,
      href: "#",
      available: false
    },
    {
      number: "06",
      title: "Próximamente: la historia de Javier",
      description: "",
      image: null,
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

  /* Tras seleccionar una card (episodio / historia): si el destacado no está
     cómodamente visible (p. ej. el usuario ha bajado a las cards 5–6),
     hacer scroll hasta él. No se aplica a la carga inicial ni en desktop ≥1024. */
  function ensureFeaturedInView(featuredEl) {
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
      const titleEl = card.querySelector(".bc-card__title");
      if (titleEl && item) titleEl.textContent = item.title;

      let status = card.querySelector(".bc-card__status");
      if (!status) {
        status = document.createElement("span");
        status.className = "bc-card__status";
        card.appendChild(status);
      }

      /* Historias bloqueadas: nunca mostrar foto (aunque el asset exista). */
      const media = card.querySelector(".bc-card__media");
      if (media && item && !item.available) {
        media.classList.add("bc-card__media--locked");
        const img = media.querySelector("img");
        if (img) img.remove();
        if (!media.querySelector(".bc-lock")) {
          media.insertAdjacentHTML(
            "beforeend",
            '<svg class="bc-lock" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
              '<path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" d="M8 11V8a4 4 0 118 0v3"/>' +
              '<rect x="6" y="11" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/>' +
              "</svg>"
          );
        }
      }

      if (item && item.available) {
        status.textContent = "";
        status.hidden = true;
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
        card.setAttribute("tabindex", "-1");
        card.removeAttribute("aria-pressed");

        const titleHasUpcoming =
          item && /^pr[oó]ximamente\s*:/i.test(String(item.title || ""));
        if (titleHasUpcoming) {
          /* Evitar duplicar "PRÓXIMAMENTE" si el título ya lo dice. */
          status.textContent = "";
          status.hidden = true;
        } else {
          status.textContent = UPCOMING_LABEL;
          status.hidden = false;
        }

        if (prefix === "ep" && !card.querySelector(".bc-card__lock")) {
          const lock = document.createElement("span");
          lock.className = "bc-card__lock";
          lock.setAttribute("aria-hidden", "true");
          lock.innerHTML =
            '<svg class="bc-lock bc-lock--sm" viewBox="0 0 24 24" focusable="false">' +
            '<path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" d="M8 11V8a4 4 0 118 0v3"/>' +
            '<rect x="6" y="11" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/>' +
            "</svg>";
          const num = card.querySelector(".bc-card__num");
          if (num && num.parentNode === card) {
            card.insertBefore(lock, num.nextSibling);
          } else {
            card.appendChild(lock);
          }
        }
      }
    });

    const firstAvailable = data.findIndex(function (d) {
      return d.available;
    });
    if (firstAvailable >= 0) select(firstAvailable, { animate: false });

    return { select: select, isAvailable: isAvailable };
  }

  const episodeFeatured = root.querySelector(".bc-episode-featured");
  const storyFeatured = root.querySelector(".bc-story-featured");

  function afterFeaturedCardSelect(featuredEl) {
    // En desktop (≥1024) no hace falta scroll automático (Historias es sticky).
    // En tablet/mobile sí reenfocamos el detalle si no está visible.
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      ensureFeaturedInView(featuredEl);
    }
  }

  const episodeCtrl = buildSelector(episodes, "ep", ".bc-episode-card", {
    featuredSelector: ".bc-episode-featured",
    afterCardSelect: function () {
      afterFeaturedCardSelect(episodeFeatured);
    }
  });
  const storyCtrl = buildSelector(stories, "story", ".bc-story-card", {
    featuredSelector: ".bc-story-featured",
    afterCardSelect: function () {
      afterFeaturedCardSelect(storyFeatured);
    }
  });

  /* ----------------------------------------------------------------------
     Anchors internos → #episodios: scroll suave (hero + manifiesto)
     ---------------------------------------------------------------------- */

  function scrollToEpisodes(event) {
    const episodesSection = root.querySelector("#episodios");
    if (!episodesSection) return;
    event.preventDefault();
    episodesSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  root.querySelectorAll('a.bc-cta[href="#episodios"]').forEach(function (cta) {
    cta.addEventListener("click", scrollToEpisodes);
  });

  /* ----------------------------------------------------------------------
     Retratos del hero: navegación configurable por data-*
     ---------------------------------------------------------------------- */

  const portraits = Array.from(root.querySelectorAll(".bc-portrait"));

  portraits.forEach(function (portrait) {
    const type = portrait.getAttribute("data-type");
    const targetId = portrait.getAttribute("data-target");
    const index = parseInt(portrait.getAttribute("data-index"), 10) || 0;
    const ctrl = type === "story" ? storyCtrl : episodeCtrl;

    if (!ctrl.isAvailable(index)) {
      portrait.classList.add("is-upcoming");
      portrait.disabled = true;
      portrait.setAttribute("aria-disabled", "true");
      portrait.setAttribute("tabindex", "-1");

      const play = portrait.querySelector(".bc-play");
      if (play) play.hidden = true;

      if (!portrait.querySelector(".bc-portrait__lock")) {
        portrait.insertAdjacentHTML(
          "beforeend",
          '<span class="bc-portrait__lock" aria-hidden="true">' +
            '<svg class="bc-lock" viewBox="0 0 24 24" focusable="false">' +
            '<path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" d="M8 11V8a4 4 0 118 0v3"/>' +
            '<rect x="6" y="11" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/>' +
            "</svg>" +
            "</span>"
        );
      }

      const label = portrait.querySelector(".bc-visually-hidden");
      if (label) {
        label.textContent = "Contenido próximamente disponible";
      }
      return;
    }

    portrait.addEventListener("click", function () {
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
