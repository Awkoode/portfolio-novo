// ===== ADS page: typing effect + particle network =====

// Typing effect
(function typing() {
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    'Console.log(\u2019aprendizado\u2019);',
    'building > coding > shipping.',
    'da sala de aula ao terminal.',
  ];
  let p = 0, i = 0, deleting = false;
  function tick() {
    const full = phrases[p];
    if (!deleting) {
      el.textContent = full.slice(0, i++);
      if (i > full.length) { deleting = true; setTimeout(tick, 1600); return; }
    } else {
      el.textContent = full.slice(0, i--);
      if (i < 0) { deleting = false; p = (p + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 35 : 70);
  }
  tick();
})();

// Particle network
(function particles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.width = innerWidth * DPR;
    h = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 18000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3 * DPR,
      vy: (Math.random() - 0.5) * 0.3 * DPR,
    }));
  }

  const mouse = { x: -9999, y: -9999 };
  addEventListener('mousemove', (e) => { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; });
  addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  addEventListener('resize', resize);
  resize();

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
    }
    // lines
    const max = 130 * DPR;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < max) {
          const o = 1 - dist / max;
          ctx.strokeStyle = `rgba(167,139,250,${o * 0.35})`;
          ctx.lineWidth = DPR;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // mouse link
      const dxm = dots[i].x - mouse.x, dym = dots[i].y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < max * 1.4) {
        const o = 1 - dm / (max * 1.4);
        ctx.strokeStyle = `rgba(34,211,238,${o * 0.6})`;
        ctx.lineWidth = DPR;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    // points
    for (const d of dots) {
      ctx.fillStyle = 'rgba(245,245,245,0.7)';
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.4 * DPR, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// Link input enter
document.querySelectorAll('.link-input').forEach((inp) => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inp.value.trim()) return;
      const dz = inp.closest('.activity').querySelector('[data-label]');
      if (dz) dz.textContent = '↗ link salvo';
      inp.blur();
    }
  });
});

// new: popup open/close logic
(function () {
  const activities = document.querySelectorAll('.activity');

  function closeAll() {
    activities.forEach(a => {
      a.classList.remove('show-popup');
      const btn = a.querySelector('.open-popup');
      const popup = a.querySelector('.popup');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (popup) popup.setAttribute('aria-hidden', 'true');
    });
  }

  document.addEventListener('click', (e) => {
    // open button
    const open = e.target.closest('.open-popup');
    if (open) {
      const article = open.closest('.activity');
      const isOpen = article.classList.contains('show-popup');
      closeAll();
      if (!isOpen) {
        article.classList.add('show-popup');
        open.setAttribute('aria-expanded', 'true');
        const pop = article.querySelector('.popup');
        if (pop) pop.setAttribute('aria-hidden', 'false');
      }
      return;
    }

    // close button inside popup
    const closeBtn = e.target.closest('.close-popup');
    if (closeBtn) {
      const article = closeBtn.closest('.activity');
      if (article) {
        article.classList.remove('show-popup');
        const btn = article.querySelector('.open-popup');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        const pop = article.querySelector('.popup');
        if (pop) pop.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    // click outside any activity popup closes all
    if (!e.target.closest('.activity')) {
      closeAll();
    }
  });

  // close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();

// Alternância de áreas técnicas (IoT / Banco de Dados / Desenvolvimento)
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.area-tab');
  const sections = document.querySelectorAll('.area-section');

  function setArea(areaTarget) {
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.area === areaTarget);
    });
    sections.forEach((section) => {
      section.classList.toggle('active', section.dataset.area === areaTarget);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setArea(tab.dataset.area));
  });

  setArea('desenvolvimento');
});

// funcao mapa

/**
 * Landing — mapa do hero: pan + pin sincronizados com ocorrências
 */
(function () {
  const SCENES = [
    { place: 'Centro', pan: { x: 0, y: 0 }, pin: { x: 46, y: 50 }, duration: 5200 },
    { place: 'Trindade', pan: { x: -24, y: -16 }, pin: { x: 64, y: 44 }, duration: 5200 },
    { place: 'Lagoa da Conceição', pan: { x: -14, y: 20 }, pin: { x: 40, y: 62 }, duration: 5200 },
    { place: 'Ingleses', pan: { x: -30, y: 10 }, pin: { x: 70, y: 40 }, duration: 5200 }
  ];

  const TRANSITION_MS = 1100;
  let sceneIndex = 0;
  let timerId = null;

  function setScene(index) {
    const i = index % SCENES.length;
    const scene = SCENES[i];
    const demo = document.querySelector('.hero-map-demo');
    if (!demo) return;

    const surface = document.getElementById('hero-map-surface');
    const pin = document.getElementById('hero-map-pin');
    const placeEl = document.getElementById('hero-map-place');

    if (surface) {
      surface.style.transform = `translate(${scene.pan.x}%, ${scene.pan.y}%)`;
    }

    if (pin) {
      pin.style.left = `${scene.pin.x}%`;
      pin.style.top = `${scene.pin.y}%`;
    }

    if (placeEl) {
      placeEl.style.opacity = '0';

      window.setTimeout(() => {
        placeEl.textContent = scene.place;
        placeEl.style.opacity = '1';
      }, TRANSITION_MS * 0.35);
    }

    demo.querySelectorAll('.hero-map-card').forEach(card => {
      card.classList.toggle(
        'is-active',
        Number(card.dataset.scene) === i
      );
    });
  }

  function scheduleNext() {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      sceneIndex = (sceneIndex + 1) % SCENES.length;
      setScene(sceneIndex);
      scheduleNext();
    }, SCENES[sceneIndex].duration);
  }

  function init() {
    const surface = document.getElementById('hero-map-surface');
    const pin = document.getElementById('hero-map-pin');
    const placeEl = document.getElementById('hero-map-place');

    if (surface) {
      surface.style.transition =
        `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    }

    if (pin) {
      pin.style.transition =
        `left ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1),
         top ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    }

    if (placeEl) {
      placeEl.style.transition = 'opacity .4s ease';
    }

    setScene(0);
    scheduleNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();