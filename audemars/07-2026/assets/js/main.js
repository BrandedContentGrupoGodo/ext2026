// Mejora progresiva: scroll suave del CTA del hero al bloque de introducción.
// Si JS falla, el enlace <a href="#intro-offshore"> hace el salto nativo.
(function initOffshoreScroll() {
  const trigger = document.querySelector("[data-scroll-target]");
  if (!trigger) return;

  trigger.addEventListener("click", (event) => {
    const targetId = trigger.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
})();
