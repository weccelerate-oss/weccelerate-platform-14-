/* ============================================================================
   WeCcelerate — Scroll-driven cinematic landing
   ----------------------------------------------------------------------------
   The video plays NOT by autoplay but by mapping window scroll → currentTime.
   Driver:
     - .scroll-section is 600vh tall
     - .sticky-stage is sticky 100vh inside it
     - total scrollable distance for the section = 600vh - 100vh = 500vh
     - progress = (scrollY - sectionTop) / (500vh), clamped 0..1
     - video.currentTime = progress * video.duration

   iOS Safari quirk: currentTime seeking is locked until the video has played
   once after a user gesture. On the first touch/click anywhere, we
   play→pause to unlock it.
   ============================================================================ */

(function () {
  'use strict';

  // -------------------- Elements --------------------
  const video         = document.getElementById('hero-video');
  const scrollSection = document.getElementById('scroll-section');
  const sceneNodes    = Array.from(document.querySelectorAll('.scene-text'));
  const dotNodes      = Array.from(document.querySelectorAll('.stage-dot'));
  const counterCurrent = document.getElementById('counter-current');
  const counterFill   = document.getElementById('counter-fill');
  const logoReveal    = document.getElementById('logo-reveal');
  const outroCta      = document.getElementById('outro-cta');

  if (!video || !scrollSection || sceneNodes.length === 0) {
    console.warn('[leumit] missing required elements; aborting.');
    return;
  }

  // -------------------- State --------------------
  const TOTAL_SCENES = 6;             // matches the 6 .scene-text blocks
  const REVEAL_AT    = 0.92;          // logo reveal fades in after this progress

  let videoDuration   = 0;            // filled in once metadata loads
  let sectionTop      = 0;            // cached on resize
  let sectionScrollLen = 1;           // cached on resize (600vh - 100vh)
  let ticking         = false;
  let lastActiveScene = -1;
  let videoReady      = false;
  let iosUnlocked     = false;
  let lastSeekTime    = 0;            // throttle currentTime writes on mobile

  // Coarse pointer = touch device; iOS Safari is the gnarliest.
  const IS_TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // Seek threshold: on touch we write currentTime less aggressively to avoid
  // decoder thrash; on desktop we can afford finer-grained updates.
  const SEEK_THRESHOLD_SEC = IS_TOUCH ? 0.05 : 0.01;

  // -------------------- Layout cache --------------------
  /**
   * Recompute the section's top offset and the scrollable distance inside it.
   * Called on load and on every resize.
   */
  function measureLayout() {
    const rect = scrollSection.getBoundingClientRect();
    sectionTop = rect.top + window.scrollY;
    // Inner sticky stage is 100vh; outer is 600vh; usable scroll = outer - inner
    sectionScrollLen = scrollSection.offsetHeight - window.innerHeight;
    if (sectionScrollLen <= 0) sectionScrollLen = 1;
  }

  // -------------------- Per-frame render --------------------
  /**
   * Compute scroll progress relative to the scroll-section, then update:
   *  - video.currentTime
   *  - active scene-text
   *  - active progress dot
   *  - counter number + bar fill
   *  - logo reveal opacity (last 8%)
   */
  function render() {
    ticking = false;

    const scrolled = window.scrollY - sectionTop;
    let progress = scrolled / sectionScrollLen;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Drive the video by scroll position. Avoid setting currentTime before
    // the video has duration — it would throw on some browsers.
    if (videoReady && videoDuration > 0) {
      const t = progress * videoDuration;
      // Don't write the same value back — avoids decoder thrash on stale frames.
      // Threshold is larger on touch devices (iOS Safari is slow to honor
      // currentTime updates and will queue them, causing visible jitter).
      if (Math.abs(t - lastSeekTime) > SEEK_THRESHOLD_SEC) {
        try {
          video.currentTime = t;
          lastSeekTime = t;
        } catch (_) { /* swallow — iOS pre-unlock or transient decoder state */ }
      }
    }

    // Scene activation. Each scene owns 1/TOTAL_SCENES of the timeline,
    // except scene 5 which extends to 1.0 inclusive.
    const activeScene = Math.min(
      TOTAL_SCENES - 1,
      Math.floor(progress * TOTAL_SCENES),
    );

    if (activeScene !== lastActiveScene) {
      sceneNodes.forEach((node, i) => {
        node.classList.toggle('is-active', i === activeScene);
      });
      dotNodes.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeScene);
        dot.classList.toggle('is-passed', i < activeScene);
      });
      if (counterCurrent) {
        counterCurrent.textContent = String(activeScene + 1).padStart(2, '0');
      }
      lastActiveScene = activeScene;
    }

    // Counter bar fill — smoother than scene-step ticks.
    if (counterFill) {
      counterFill.style.width = (progress * 100).toFixed(2) + '%';
    }

    // Logo reveal — fade in during the last 8% of the scroll section.
    if (logoReveal) {
      logoReveal.classList.toggle('is-visible', progress > REVEAL_AT);
    }
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  // -------------------- Wire up --------------------
  window.addEventListener('scroll', onScrollOrResize, { passive: true });

  // Resize handling — debounced. iOS Safari fires `resize` constantly as the
  // URL bar shows/hides during scroll; running measureLayout every time
  // would thrash layout. 150ms is short enough to feel responsive on real
  // resizes, long enough to let URL-bar fluctuation settle.
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measureLayout();
      onScrollOrResize();
    }, 150);
  };
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });

  // Wait for video metadata before doing the first paint of currentTime.
  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration || 0;
    videoReady = videoDuration > 0;
    measureLayout();
    render();
  }, { once: true });

  // If the video errors, log it but don't break the page — the UI still
  // works as a static layout.
  video.addEventListener('error', (e) => {
    console.error('[leumit] video load error', e, video.error);
  });

  // -------------------- iOS Safari unlock --------------------
  /**
   * iOS Safari refuses to honor `video.currentTime = ...` until the video
   * has been played by a user gesture. So on the first touch/click we
   * silently play → pause to unlock seeking. We attach to multiple events
   * because iOS treats them inconsistently.
   */
  function unlockIosVideo() {
    if (iosUnlocked) return;
    iosUnlocked = true;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => video.pause()).catch(() => { /* user agent blocked, fine */ });
    } else {
      video.pause();
    }
  }

  ['touchstart', 'click'].forEach((ev) => {
    window.addEventListener(ev, unlockIosVideo, { once: true, passive: true });
  });

  // -------------------- Side-dot navigation --------------------
  // Clicking a dot scrolls to that scene's start. Scene i begins at
  // (i / TOTAL_SCENES) of the inner scroll range.
  dotNodes.forEach((dot) => {
    dot.addEventListener('click', () => {
      const sceneIndex = parseInt(dot.dataset.scene || '0', 10);
      const target = sectionTop + (sceneIndex / TOTAL_SCENES) * sectionScrollLen;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  // CTA — anchor placeholder; replace with the real flow later.
  if (outroCta) {
    outroCta.addEventListener('click', (e) => {
      // Let it act as a real anchor if href is set; otherwise just prevent.
      if (!outroCta.getAttribute('href') || outroCta.getAttribute('href') === '#') {
        e.preventDefault();
        console.log('[leumit] CTA clicked — wire up the destination here.');
      }
    });
  }

  // -------------------- First render --------------------
  document.addEventListener('DOMContentLoaded', () => {
    measureLayout();
    render();
  });

  // Belt-and-suspenders: also run once now in case DOMContentLoaded already fired.
  measureLayout();
  render();
})();
