document.documentElement.classList.add("js");

function initRevealOnScroll() {
  document.documentElement.classList.add("js-loaded");

  const elementsToReveal = document.querySelectorAll(".reveal-on-scroll");
  if (!elementsToReveal.length) return;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.15,
    },
  );

  elementsToReveal.forEach((item) => observer.observe(item));
}

function initHeroScroll() {
  const scrollLink = document.querySelector(".hero__scroll");
  const target = document.querySelector("#capitulos");
  if (!scrollLink || !target) return;

  scrollLink.addEventListener("click", (event) => {
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
}

function initSocialCarousel() {
  const track = document.querySelector(".social-carousel__track");
  const viewport = document.querySelector(".social-carousel__viewport");
  if (!track || !viewport) return;

  const prevBtn = document.querySelector(".social-btn--prev");
  const nextBtn = document.querySelector(".social-btn--next");
  let index = 0;
  let visibleSlides = 1;

  const getSlides = () => Array.from(track.children);

  function update() {
    const slides = getSlides();
    if (!slides.length) return;
    const slideWidth = 100 / visibleSlides;
    track.style.transform = `translateX(${-index * slideWidth}%)`;
  }

  function maxIndex() {
    return Math.max(0, Math.ceil(getSlides().length - visibleSlides));
  }

  function goNext() {
    const max = maxIndex();
    index = index + 1 > max ? 0 : index + 1;
    update();
  }

  function goPrev() {
    const max = maxIndex();
    index = index - 1 < 0 ? max : index - 1;
    update();
  }

  function splitToSingleEmbeds() {
    if (track.dataset.mobileMode === "1") return;

    const embeds = getSlides().flatMap((slide) => Array.from(slide.querySelectorAll(".embed")));
    if (!embeds.length) return;

    track.innerHTML = "";
    embeds.forEach((embed) => {
      const slide = document.createElement("div");
      slide.className = "social-slide";
      const pair = document.createElement("div");
      pair.className = "embed-pair";
      pair.appendChild(embed);
      slide.appendChild(pair);
      track.appendChild(slide);
    });

    track.dataset.mobileMode = "1";
    index = 0;
    update();
  }

  function groupToPairs() {
    if (track.dataset.mobileMode !== "1") return;

    const embeds = getSlides().flatMap((slide) => Array.from(slide.querySelectorAll(".embed")));
    if (!embeds.length) return;

    track.innerHTML = "";
    for (let i = 0; i < embeds.length; i += 2) {
      const slide = document.createElement("div");
      slide.className = "social-slide";
      const pair = document.createElement("div");
      pair.className = "embed-pair";
      pair.appendChild(embeds[i]);
      if (embeds[i + 1]) pair.appendChild(embeds[i + 1]);
      slide.appendChild(pair);
      track.appendChild(slide);
    }

    delete track.dataset.mobileMode;
    index = 0;
    update();
  }

  function measureVisible() {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      visibleSlides = 2;
    } else if (window.matchMedia("(min-width: 900px)").matches) {
      visibleSlides = 1.5;
    } else {
      visibleSlides = 1;
    }

    const isMobile = !window.matchMedia("(min-width: 900px)").matches;
    if (isMobile) splitToSingleEmbeds();
    else groupToPairs();
  }

  let startX = 0;
  let dragging = false;
  function onStart(e) {
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onEnd(e) {
    if (!dragging) return;
    dragging = false;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = endX - startX;
    if (delta > 40) goPrev();
    if (delta < -40) goNext();
  }

  prevBtn?.addEventListener("click", goPrev);
  nextBtn?.addEventListener("click", goNext);
  viewport.addEventListener("mousedown", onStart);
  viewport.addEventListener("mouseup", onEnd);
  viewport.addEventListener("mouseleave", onEnd);
  viewport.addEventListener("touchstart", onStart, { passive: true });
  viewport.addEventListener("touchend", onEnd);

  measureVisible();
  update();

  window.addEventListener("resize", () => {
    measureVisible();
    update();
  });
}

function initVideoPlaceholder() {
  const placeholder = document.querySelector(".video-placeholder");
  if (!placeholder) return;

  const videoId = placeholder.dataset.videoId;
  if (!videoId) return;

  function createIframe() {
    const parent = placeholder.parentElement;
    if (!parent || parent.querySelector("iframe")) return;

    const iframe = document.createElement("iframe");
    iframe.title = "Video de YouTube";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
    parent.innerHTML = "";
    parent.appendChild(iframe);
  }

  placeholder.addEventListener("click", createIframe);
  placeholder.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    createIframe();
  });
}

function initActionsCarousel() {
  const track = document.querySelector(".actions-carousel__track");
  const viewport = document.querySelector(".actions-carousel__viewport");
  if (!track || !viewport) return;

  const prev = document.querySelector(".actions-btn--prev");
  const next = document.querySelector(".actions-btn--next");
  let index = 0;
  let visible = 1;

  const slides = () => Array.from(track.children);

  function measure() {
    visible = window.matchMedia("(min-width: 1200px)").matches ? 4 : 1;
  }

  function update() {
    const allSlides = slides();
    if (!allSlides.length) return;
    const columnWidth = track.scrollWidth / allSlides.length;
    track.style.transform = `translateX(${-index * columnWidth}px)`;
  }

  function goNext() {
    const max = Math.max(0, slides().length - visible);
    index = index + 1 > max ? 0 : index + 1;
    update();
  }

  function goPrev() {
    const max = Math.max(0, slides().length - visible);
    index = index - 1 < 0 ? max : index - 1;
    update();
  }

  prev?.addEventListener("click", goPrev);
  next?.addEventListener("click", goNext);

  let startX = 0;
  let dragging = false;
  function onStart(e) {
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onEnd(e) {
    if (!dragging) return;
    dragging = false;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = endX - startX;
    if (delta > 40) goPrev();
    if (delta < -40) goNext();
  }

  viewport.addEventListener("mousedown", onStart);
  viewport.addEventListener("mouseup", onEnd);
  viewport.addEventListener("mouseleave", onEnd);
  viewport.addEventListener("touchstart", onStart, { passive: true });
  viewport.addEventListener("touchend", onEnd);

  measure();
  update();
  window.addEventListener("resize", () => {
    measure();
    update();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRevealOnScroll();
  initHeroScroll();
  initSocialCarousel();
  initVideoPlaceholder();
  initActionsCarousel();
});
