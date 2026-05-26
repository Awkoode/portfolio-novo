// Shared scripts: header scroll, nav toggle, reveal-on-scroll
(function () {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');

  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Staggered fadeUp reveal
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const idx = Array.from(items).indexOf(e.target);
        e.target.style.transitionDelay = (Math.min(idx, 8) * 80) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  items.forEach((el) => io.observe(el));

  // Dropzones
  document.querySelectorAll('.dropzone').forEach((dz) => {
    const input = dz.querySelector('input[type=file]');
    const label = dz.querySelector('[data-label]');
    dz.addEventListener('click', () => input && input.click());
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.style.background = 'rgba(0,0,0,.05)'; });
    dz.addEventListener('dragleave', () => { dz.style.background = ''; });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.style.background = '';
      const f = e.dataTransfer.files[0];
      if (f && label) label.textContent = '✓ ' + f.name;
    });
    if (input && label) {
      input.addEventListener('change', () => {
        if (input.files[0]) label.textContent = '✓ ' + input.files[0].name;
      });
    }
  });
})();
