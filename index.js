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
  const itemsArray = Array.from(items);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const idx = itemsArray.indexOf(e.target);
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

function createBackgroundGlobe(containerId, customConfig = {}) {
  const container = typeof containerId === 'string' 
    ? document.getElementById(containerId) 
    : containerId;

  if (!container || typeof THREE === 'undefined') {
    console.error('Globe: Container não encontrado ou Three.js não carregado.');
    return;
  }

  const CONFIG = {
    opacity: 0.75,
    color: "#4d4d4d",
    glowColor: "#ffffff",
    lineWidth: 1,
    rotationSpeed: 0.0007,
    tilt: 23.5,
    glow: true,
    ...customConfig
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 1200;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true, 
    powerPreference: "high-performance" 
  });

  const updateSize = () => {
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 900;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  updateSize();
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);
  globeGroup.rotation.z = (CONFIG.tilt * Math.PI) / 180;

  const geometry = new THREE.SphereGeometry(400, 36, 36);
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(CONFIG.color),
    transparent: true,
    opacity: CONFIG.opacity,
    linewidth: CONFIG.lineWidth
  });

  const globeLines = new THREE.LineSegments(wireframeGeometry, lineMaterial);
  globeGroup.add(globeLines);

  if (CONFIG.glow) {
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(${new THREE.Color(CONFIG.glowColor).r}, ${new THREE.Color(CONFIG.glowColor).g}, ${new THREE.Color(CONFIG.glowColor).b}, 1.0) * intensity * 0.04;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });

    const glowSphere = new THREE.Mesh(geometry, glowMaterial);
    glowSphere.scale.set(1.002, 1.002, 1.002);
    globeGroup.add(glowSphere);
  }

  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    globeGroup.rotation.y += CONFIG.rotationSpeed;
    renderer.render(scene, camera);
  }
  animate();

  const handleResize = () => updateSize();
  window.addEventListener('resize', handleResize);

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }
  };
}

// Inicializa o globo de fundo em qualquer página que tenha o container
(function () {
  if (document.getElementById('globe-container') && typeof THREE !== 'undefined') {
    createBackgroundGlobe('globe-container');
  }
})();

// Tema claro/escuro
(function () {
  const body = document.body;
  const header = document.getElementById('header');
  if (!header || document.getElementById('theme-toggle')) return;

  // Página A.D.S. tem tema único (dark de fábrica) — sem alternador
  if (body.classList.contains('ads-dark')) return;

  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // Monta o botão de tema e adiciona ao header
  const controls = document.createElement('div');
  controls.className = 'theme-controls';
  controls.innerHTML =
    '<button type="button" class="theme-toggle" id="theme-toggle" aria-label="Alternar tema claro/escuro">' +
    '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
    '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
    '</button>';
  header.appendChild(controls);

  const toggle = document.getElementById('theme-toggle');

  const applyTheme = (dark) => {
    body.classList.toggle('dark', dark);
    if (toggle) toggle.setAttribute('aria-pressed', String(dark));
  };

  // Restaura preferência salva
  applyTheme(store.get('pw-theme') === 'dark');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const dark = !body.classList.contains('dark');
      applyTheme(dark);
      store.set('pw-theme', dark ? 'dark' : 'light');
    });
  }
})();