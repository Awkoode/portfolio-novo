/**
 * Configuração Centralizada do Componente
 */
const CONFIG = {
  size: 900,            // Diâmetro/dimensão do container em pixels
  opacity: 0.08,        // Opacidade geral do wireframe (entre 0.06 e 0.10)
  color: "#4d4d4d",     // Cor primária das linhas do globo
  glowColor: "#ffffff", // Cor discreta para o efeito de iluminação suave
  lineWidth: 1,         // Espessura das linhas
  rotationSpeed: 0.0007,// Velocidade de rotação contínua (~45 a 60s por volta)
  tilt: 23.5,           // Inclinação do eixo terrestre em graus
  glow: true            // Ativa o brilho/glow sutil nas bordas
};

(function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  // 1. Criação da Cena e Câmera
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45, 
    1, // Aspect ratio inicial 1:1 (quadrado)
    0.1, 
    1000
  );
  camera.position.z = 1200;

  // 2. Renderizador de Alta Performance com Antialiasing
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,         // Permite fundo totalmente transparente
    antialias: true,     // Suavização de serrilhados
    powerPreference: "high-performance"
  });
  
  renderer.setSize(CONFIG.size, CONFIG.size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limita a 2px para otimizar retina displays
  container.appendChild(renderer.domElement);

  // 3. Grupo Principal do Globo (para rotação e inclinação)
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Aplica a inclinação do eixo terrestre (de graus para radianos)
  const tiltInRadians = (CONFIG.tilt * Math.PI) / 180;
  globeGroup.rotation.z = tiltInRadians;

  // 4. Geometria da Esfera em Wireframe
  // Raio: 400, Segmentos: 36 x 36 (cria a malha perfeita de linhas geodésicas)
  const geometry = new THREE.SphereGeometry(400, 36, 36);
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);

  // Material das linhas com opacidade e transparência
  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(CONFIG.color),
    transparent: true,
    opacity: CONFIG.opacity,
    linewidth: CONFIG.lineWidth
  });

  const globeLines = new THREE.LineSegments(wireframeGeometry, lineMaterial);
  globeGroup.add(globeLines);

  // 5. Glow Discreto nas Bordas (Fresnel Rim Effect Sutil)
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
          // Calcula a intensidade com base no ângulo da superfície em relação à câmera
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(${new THREE.Color(CONFIG.glowColor).r}, ${new THREE.Color(CONFIG.glowColor).g}, ${new THREE.Color(CONFIG.glowColor).b}, 1.0) * intensity * 0.04;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });

    const glowSphere = new THREE.Mesh(geometry, glowMaterial);
    glowSphere.scale.set(1.002, 1.002, 1.002); // Ligeiramente maior que a malha para envolver os vértices
    globeGroup.add(glowSphere);
  }

  // 6. Loop de Animação Contínua (60 FPS)
  function animate() {
    requestAnimationFrame(animate);

    // Rotação suave no eixo Y
    globeGroup.rotation.y += CONFIG.rotationSpeed;

    // Renderiza a cena
    renderer.render(scene, camera);
  }

  animate();

  // 7. Redimensionamento Responsivo
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    if (newWidth > 0 && newHeight > 0) {
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
  });
})();