/**
 * Slider de imágenes con auto-play y navegación accesible
 */
(function() {
  'use strict';

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initSlider();
    initCarousel();
  }

  function initSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const indicators = document.querySelectorAll('.slider-indicator');
    const slides = document.querySelectorAll('.slider-slide');
    
    if (!sliderTrack || indicators.length === 0) {
      return; // Si no existe el slider, salir
    }

    let currentSlide = 0;
    let autoPlayInterval;
    const totalSlides = slides.length;
    const autoPlayDelay = 4000; // 4 segundos

    // Función para mover al slide específico
    function goToSlide(slideIndex) {
      if (slideIndex < 0 || slideIndex >= totalSlides) {
        return;
      }

      currentSlide = slideIndex;
      const translateX = -(currentSlide * 100) / totalSlides;
      sliderTrack.style.transform = `translateX(${translateX}%)`;

      // Actualizar indicadores
      indicators.forEach((indicator, index) => {
        const isActive = index === currentSlide;
        indicator.classList.toggle('active', isActive);
        indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
        indicator.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }

    // Función para avanzar al siguiente slide
    function nextSlide() {
      const next = (currentSlide + 1) % totalSlides;
      goToSlide(next);
    }

    // Función para iniciar auto-play
    function startAutoPlay() {
      stopAutoPlay(); // Limpiar intervalo existente si hay
      autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
    }

    // Función para detener auto-play
    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Event listeners para los indicadores
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', function() {
        goToSlide(index);
        stopAutoPlay();
        // Reiniciar auto-play después de un tiempo
        setTimeout(startAutoPlay, autoPlayDelay * 2);
      });

      // Soporte para teclado (Enter y Espacio)
      indicator.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToSlide(index);
          stopAutoPlay();
          setTimeout(startAutoPlay, autoPlayDelay * 2);
        }
      });
    });

    // Pausar auto-play cuando el usuario hace hover sobre el slider
    const sliderSection = document.querySelector('.slider-section');
    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', stopAutoPlay);
      sliderSection.addEventListener('mouseleave', startAutoPlay);
      sliderSection.addEventListener('focusin', stopAutoPlay);
      sliderSection.addEventListener('focusout', startAutoPlay);
    }

    // Navegación por teclado en la sección del slider
    sliderSection?.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prev);
        stopAutoPlay();
        setTimeout(startAutoPlay, autoPlayDelay * 2);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        stopAutoPlay();
        setTimeout(startAutoPlay, autoPlayDelay * 2);
      }
    });

    // Iniciar auto-play
    startAutoPlay();

    // Pausar auto-play cuando la pestaña no está activa (mejora rendimiento)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    // Pre-cargar imágenes para mejor rendimiento
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img && !img.complete) {
        img.loading = 'lazy';
      }
    });
  }

  function initCarousel() {
    const roots = Array.from(document.querySelectorAll('.eg-carousel'));
    if (roots.length === 0) return;

    roots.forEach(setupCarousel);
  }

  function setupCarousel(root) {
    const viewport = root.querySelector('.eg-carousel__viewport');
    const track = root.querySelector('.eg-carousel__track');
    const slides = Array.from(root.querySelectorAll('.eg-carousel__slide'));
    const prevBtn = root.querySelector('.eg-carousel__arrow--prev');
    const nextBtn = root.querySelector('.eg-carousel__arrow--next');

    if (!viewport || !track || slides.length === 0 || !prevBtn || !nextBtn) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const autoPlayDelay = 4500;
    let autoPlayInterval = null;
    let resumeTimeout = null;

    function getSlideStepPx() {
      const first = slides[0];
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function maxScrollLeft() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function updateButtons() {
      const x = viewport.scrollLeft;
      const max = maxScrollLeft();
      prevBtn.disabled = x <= 1;
      nextBtn.disabled = x >= max - 1;
    }

    function scrollByStep(direction) {
      const step = getSlideStepPx();
      const left = viewport.scrollLeft + direction * step;
      viewport.scrollTo({ left, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    function goToStart() {
      viewport.scrollTo({ left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    }

    function startAutoPlay() {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoPlayInterval = setInterval(() => {
        const max = maxScrollLeft();
        if (viewport.scrollLeft >= max - 1) {
          goToStart();
          return;
        }
        scrollByStep(1);
      }, autoPlayDelay);
    }

    function pauseThenResume() {
      stopAutoPlay();
      resumeTimeout = setTimeout(startAutoPlay, autoPlayDelay * 1.5);
    }

    prevBtn.addEventListener('click', () => {
      scrollByStep(-1);
      pauseThenResume();
    });

    nextBtn.addEventListener('click', () => {
      scrollByStep(1);
      pauseThenResume();
    });

    root.addEventListener('mouseenter', stopAutoPlay);
    root.addEventListener('mouseleave', startAutoPlay);
    root.addEventListener('focusin', stopAutoPlay);
    root.addEventListener('focusout', startAutoPlay);

    viewport.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });

    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByStep(-1);
        pauseThenResume();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByStep(1);
        pauseThenResume();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToStart();
        pauseThenResume();
      } else if (e.key === 'End') {
        e.preventDefault();
        viewport.scrollTo({ left: maxScrollLeft(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        pauseThenResume();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    });

    updateButtons();
    startAutoPlay();
  }
})();
