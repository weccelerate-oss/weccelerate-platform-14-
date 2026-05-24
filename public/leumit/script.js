/* ============================================================================
   לאומית × WeCcelerate — Cinematic landing
   - Scroll position → video.currentTime (Apple-style scroll-jacked video)
   - Floating cyan/gold particle canvas in the hero
   - Scene + dot + counter activation
   - iOS Safari currentTime unlock on first user gesture
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
  const particlesCanvas = document.getElementById('particles');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------- Floating particles in the hero --------------------
  // Cyan + gold orbs drifting around the hero. Matches the FloatingOrbs +
  // Sparkles components on the real Leumit site, but in vanilla canvas so
  // this static landing has no React dependency.
  function startParticles() {
    if (!particlesCanvas || reduceMotion) return;
    const ctx = particlesCanvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 12 : 24;
    let width = 0, height = 0, dpr = 1;
    const particles = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const hero = particlesCanvas.parentElement;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      particlesCanvas.width = width * dpr;
      particlesCanvas.height = height * dpr;
      particlesCanvas.style.width = width + 'px';
      particlesCanvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        // ~25% gold sparkles (small), 75% cyan orbs (slightly bigger).
        const isGold = Math.random() < 0.25;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: isGold ? 1 + Math.random() * 1.5 : 2 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          color: isGold ? 'rgba(212, 175, 55, ' : 'rgba(103, 232, 249, ',
          baseAlpha: isGold ? 0.55 : 0.35,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(now - last, 50);
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx * dt * 0.05;
        p.y += p.vy * dt * 0.05;
        p.phase += dt * 0.001;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        // Subtle twinkle on alpha.
        const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, p.color + alpha + ')');
        grad.addColorStop(1, p.color + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    resize();
    spawn();
    requestAnimationFrame(frame);

    let resizeT = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = window.setTimeout(() => { resize(); spawn(); }, 150);
    }, { passive: true });
  }

  // -------------------- Scroll-driven video --------------------
  if (!video || !scrollSection || sceneNodes.length === 0) {
    console.warn('[leumit] missing required scroll-driven elements; particles only.');
    if (document.readyState !== 'loading') startParticles();
    else document.addEventListener('DOMContentLoaded', startParticles);
    return;
  }

  const TOTAL_SCENES = 6;
  const REVEAL_AT = 0.92;
  const IS_TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const SEEK_THRESHOLD_SEC = IS_TOUCH ? 0.05 : 0.01;

  let videoDuration = 0;
  let sectionTop = 0;
  let sectionScrollLen = 1;
  let ticking = false;
  let lastActiveScene = -1;
  let videoReady = false;
  let iosUnlocked = false;
  let lastSeekTime = 0;

  function measureLayout() {
    const rect = scrollSection.getBoundingClientRect();
    sectionTop = rect.top + window.scrollY;
    sectionScrollLen = scrollSection.offsetHeight - window.innerHeight;
    if (sectionScrollLen <= 0) sectionScrollLen = 1;
  }

  function render() {
    ticking = false;
    const scrolled = window.scrollY - sectionTop;
    let progress = scrolled / sectionScrollLen;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    if (videoReady && videoDuration > 0) {
      const t = progress * videoDuration;
      if (Math.abs(t - lastSeekTime) > SEEK_THRESHOLD_SEC) {
        try {
          video.currentTime = t;
          lastSeekTime = t;
        } catch (_) { /* iOS pre-unlock or transient decoder state */ }
      }
    }

    const activeScene = Math.min(TOTAL_SCENES - 1, Math.floor(progress * TOTAL_SCENES));
    if (activeScene !== lastActiveScene) {
      sceneNodes.forEach((node, i) => node.classList.toggle('is-active', i === activeScene));
      dotNodes.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeScene);
        dot.classList.toggle('is-passed', i < activeScene);
      });
      if (counterCurrent) counterCurrent.textContent = String(activeScene + 1).padStart(2, '0');
      lastActiveScene = activeScene;
    }

    if (counterFill) counterFill.style.width = (progress * 100).toFixed(2) + '%';
    if (logoReveal)  logoReveal.classList.toggle('is-visible', progress > REVEAL_AT);
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });

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

  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration || 0;
    videoReady = videoDuration > 0;
    measureLayout();
    render();
  }, { once: true });

  video.addEventListener('error', (e) => {
    console.error('[leumit] video load error', e, video.error);
  });

  // iOS Safari refuses to honor video.currentTime = ... until the video has
  // been played once by a user gesture. Unlock on first touch/click.
  function unlockIosVideo() {
    if (iosUnlocked) return;
    iosUnlocked = true;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => video.pause()).catch(() => { /* blocked; fine */ });
    } else {
      video.pause();
    }
  }
  ['touchstart', 'click', 'pointerdown'].forEach((ev) => {
    window.addEventListener(ev, unlockIosVideo, { once: true, passive: true });
  });

  dotNodes.forEach((dot) => {
    dot.addEventListener('click', () => {
      const sceneIndex = parseInt(dot.dataset.scene || '0', 10);
      const target = sectionTop + (sceneIndex / TOTAL_SCENES) * sectionScrollLen;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    measureLayout();
    render();
    startParticles();
  });

  measureLayout();
  render();
  if (document.readyState !== 'loading') startParticles();
})();
