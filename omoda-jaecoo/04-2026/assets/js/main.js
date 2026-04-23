(() => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sliders = document.querySelectorAll("[data-omoda-slider]");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-omoda-slider-track]");
    const slides = slider.querySelectorAll("[data-omoda-slide]");
    const prevBtn = slider.querySelector("[data-omoda-slider-prev]");
    const nextBtn = slider.querySelector("[data-omoda-slider-next]");

    if (!track || !slides.length || !prevBtn || !nextBtn) return;

    let index = 0;
    let timerId = null;

    const getSlideStride = () => {
      const first = slides[0];
      if (!first) return 0;
      return first.getBoundingClientRect().width;
    };

    const goTo = (nextIndex, behavior = "smooth") => {
      const stride = getSlideStride();
      if (!stride) return;

      index = ((nextIndex % slides.length) + slides.length) % slides.length;
      track.scrollTo({ left: stride * index, behavior });
    };

    const start = () => {
      if (prefersReducedMotion) return;
      stop();
      timerId = window.setInterval(() => {
        goTo(index + 1, "smooth");
      }, 5200);
    };

    const stop = () => {
      if (timerId) window.clearInterval(timerId);
      timerId = null;
    };

    prevBtn.addEventListener("click", () => {
      stop();
      goTo(index - 1);
      start();
    });

    nextBtn.addEventListener("click", () => {
      stop();
      goTo(index + 1);
      start();
    });

    track.addEventListener("pointerenter", stop);
    track.addEventListener("pointerleave", start);
    track.addEventListener("focusin", stop);
    track.addEventListener("focusout", start);

    window.addEventListener("resize", () => goTo(index, "auto"));

    goTo(0, "auto");
    start();
  });
})();

