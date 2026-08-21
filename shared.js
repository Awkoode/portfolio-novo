// shared.js — lógica comum às páginas de área (popups, trimestres, galeria)
document.querySelectorAll('.link-input').forEach((inp) => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = inp.value.trim();
      if (!v) return;
      const dz = inp.closest('.activity').querySelector('[data-label]');
      if (dz) dz.textContent = '↗ link salvo';
      inp.blur();
    }
  });
});

// popup open/close logic
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

// Alternância de Trimestres
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.trimester-tab');
  const sections = document.querySelectorAll('.trimester-section');

  function setTrimester(trimesterTarget) {
    tabs.forEach((tab) => {
      if (tab.dataset.trimester === trimesterTarget) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    sections.forEach((section) => {
      if (section.dataset.trimester === trimesterTarget) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedTrimester = tab.dataset.trimester;
      setTrimester(selectedTrimester);
    });
  });

  setTrimester('1');
});

// Galeria lateral
document.querySelectorAll('.activity--gallery').forEach((card) => {
  const frame = card.querySelector('iframe.gallery-frame');
  const btns = card.querySelectorAll('.gallery-btn');
  if (!frame || !btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      frame.src = btn.dataset.src;
    });
  });
});
