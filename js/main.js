/* ════════════════════════════════════════════
   STUDIO — main.js
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   SCRAMBLE TEXT  (no GSAP Club required)
   ──────────────────────────────────────────── */
class ScrambleText {
  constructor(el, options = {}) {
    this.el = el;
    this.original = el.textContent.trim();
    this.chars = options.chars ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
      '/;[]=-~!@#$%^&*()+{}:?><€¡¥×«»¶¿çµñ©æáßðøöóíúüþéåä';
    this.duration = options.duration || 1500;
    this.revealDelay = options.revealDelay || 0.2;
    this.speed = options.speed || 0.5;
    this._raf = null;
    this._start = null;
    this.playing = false;
  }

  play() {
    this._cancel();
    this.playing = true;
    this._start = performance.now();
    this.el.classList.add('scrambling');
    this._tick();
  }

  reset() {
    this._cancel();
    this.el.textContent = this.original;
  }

  _cancel() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    this.playing = false;
    this.el.classList.remove('scrambling');
  }

  _tick() {
    const elapsed = performance.now() - this._start;
    const progress = Math.min(elapsed / this.duration, 1);
    const text = this.original;
    const rStart = this.revealDelay;
    let result = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n' || ch === ' ') { result += ch; continue; }
      const threshold = rStart + (i / text.length) * (1 - rStart);
      result += (progress >= threshold)
        ? ch
        : (Math.random() < this.speed
          ? this.chars[Math.floor(Math.random() * this.chars.length)]
          : ch);
    }

    this.el.textContent = result;

    if (progress < 1) {
      this._raf = requestAnimationFrame(() => this._tick());
    } else {
      this.el.textContent = this.original;
      this.el.classList.remove('scrambling');
      this.playing = false;
    }
  }
}

/* ────────────────────────────────────────────
   INIT ALL SCRAMBLE EFFECTS
   Called: (a) after preloader on home, or
           (b) immediately on every other page
   ──────────────────────────────────────────── */
function initScrambles() {

  /* ── 1. LOGO  (play on load + replay on hover) ── */
  const logo = document.querySelector('.navbar-brand');
  if (logo) {
    const st = new ScrambleText(logo, { duration: 800, revealDelay: 0.15, speed: 0.72 });
    st.play();
    logo.addEventListener('mouseenter', () => { if (!st.playing) st.play(); });
  }

  /* ── 2. NAV LINKS  (hover scramble on every page) ── */
  document.querySelectorAll('.nav-link').forEach(link => {
    const st = new ScrambleText(link, { duration: 550, revealDelay: 0.1, speed: 0.75 });
    link.addEventListener('mouseenter', () => { if (!st.playing) st.play(); });
  });

  /* ── 3. HERO TITLE  (play once on load) ── */
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const st = new ScrambleText(heroTitle, { duration: 2200, revealDelay: 0.35, speed: 0.62 });
    setTimeout(() => st.play(), 200);
  }

  /* ── 4. PAGE TITLE on sub-pages  (play on load + click) ── */
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle) {
    const st = new ScrambleText(pageTitle, { duration: 1800, revealDelay: 0.3, speed: 0.65 });
    setTimeout(() => st.play(), 150);
    pageTitle.addEventListener('click', () => st.play());
  }

  /* ── 5. PROJECT COVER TITLE ── */
  const coverTitle = document.querySelector('.cover-title');
  if (coverTitle) {
    const st = new ScrambleText(coverTitle, { duration: 2400, revealDelay: 0.32, speed: 0.6 });
    setTimeout(() => st.play(), 500);
    coverTitle.addEventListener('click', () => st.play());
  }

  /* ── 6. ALL .glitch-text ELEMENTS  (scroll-triggered) ── */
  const scrollTargets = document.querySelectorAll(
    '.glitch-text:not(.navbar-brand):not(.nav-link):not(.hero-title):not(.page-title):not(.cover-title)'
  );

  scrollTargets.forEach(el => {
    const st = new ScrambleText(el, { duration: 1500, revealDelay: 0.38, speed: 0.65 });
    let entered = false;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !entered) {
          st.play(); entered = true;
        } else if (!e.isIntersecting && entered) {
          st.reset(); entered = false;
        }
      });
    }, { threshold: 0.15 });

    io.observe(el);
    el.addEventListener('click', () => st.play());
  });

  /* ── 7. SECTION LABELS (A— B— C—) fade-scramble on scroll ── */
  document.querySelectorAll('.section-label-scramble').forEach(el => {
    const st = new ScrambleText(el, { duration: 700, revealDelay: 0.1, speed: 0.8 });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { st.play(); io.unobserve(el); } });
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* ────────────────────────────────────────────
   PRELOADER  (home page only)
   ──────────────────────────────────────────── */
(function () {
  const fill = document.getElementById('pFill');
  const pNum = document.getElementById('pNum');
  if (!fill) return; /* no preloader on this page */

  let prog = 0;
  const iv = setInterval(() => {
    prog = Math.min(prog + Math.random() * 13, 100);
    fill.style.width = prog + '%';
    if (pNum) pNum.textContent = Math.floor(prog).toString().padStart(2, '0') + '%';

    if (prog >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        const loader = document.getElementById('preloader');
        if (!loader) return;
        loader.classList.add('done');
        setTimeout(() => { loader.remove(); initScrambles(); }, 700);
      }, 150);
    }
  }, 55);
})();

/* On pages WITHOUT a preloader, run immediately */
if (!document.getElementById('preloader')) {
  initScrambles();
}

/* ────────────────────────────────────────────
   NAVBAR — .scrolled class on scroll
   ──────────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const check = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ────────────────────────────────────────────
   HERO CANVAS — particle network
   ──────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function Particle() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - .5) * .28; this.vy = (Math.random() - .5) * .28;
    this.r = Math.random() * 1.4 + .3; this.a = Math.random() * .5 + .1;
    this.hue = 200 + Math.floor(Math.random() * 80);
  }
  function init() {
    resize(); particles = [];
    for (let i = 0; i < Math.floor((W * H) / 6000); i++) particles.push(new Particle());
  }
  function drawLines() {
    const max = 120;
    for (let i = 0; i < particles.length; i++)
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < max) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,150,255,${(1 - d / max) * .1})`;
          ctx.lineWidth = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},65%,65%,${p.a})`; ctx.fill();
    });
    drawLines(); animId = requestAnimationFrame(tick);
  }
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); tick(); });
  init(); tick();
})();

/* ────────────────────────────────────────────
   PROJECT COVER — image slideshow
   ──────────────────────────────────────────── */
(function () {
  const imgs = document.querySelectorAll('.cover-img');
  if (!imgs.length) return;
  let cur = 0;
  imgs[0].classList.add('active');
  setInterval(() => {
    imgs[cur].classList.remove('active');
    cur = (cur + 1) % imgs.length;
    imgs[cur].classList.add('active');
  }, 3500);
})();

/* ────────────────────────────────────────────
   PROJECT PROCESS GALLERY — thumbnail click
   ──────────────────────────────────────────── */
(function () {
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.querySelector('.gallery-main-img');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach((th, i) => {
    th.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      th.classList.add('active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = th.dataset.src;
        mainImg.style.opacity = '1';
      }, 220);
    });
  });
  if (thumbs[0]) thumbs[0].classList.add('active');
})();

/* ────────────────────────────────────────────
   PROJECT CARD — pjFlash on hover
   ──────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.project-card').forEach(card => {
    const flash = card.querySelector('.pjFlash');
    if (!flash) return;
    card.addEventListener('mouseenter', () => {
      flash.classList.remove('flash'); void flash.offsetWidth; flash.classList.add('flash');
    });
  });
})();

/* ────────────────────────────────────────────
   SCROLL REVEAL
   ──────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ────────────────────────────────────────────
   RESEARCH VIDEO MODAL
   ──────────────────────────────────────────── */
(function () {
  const modal = document.getElementById('video-modal');
  const iframe = modal.querySelector('iframe');
  const closeBtn = modal.querySelector('.close');

  function openModal(videoId) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    iframe.src = '';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Click on thumbnails
  document.querySelectorAll('.research-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const videoId = item.dataset.videoId;
      if (videoId) openModal(videoId);
    });
  });

  // Close button
  closeBtn.addEventListener('click', closeModal);
  // Close on overlay click (outside iframe)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
})();
