// Low-poly go-kart model (poly.pizza/m/3hkutVs0AAV, Poly by Google, CC-BY 3.0),
// rendered as monochrome ASCII via three.js + AsciiEffect. Spins slowly in place.
const container = document.getElementById('ascii-canvas');

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
camera.position.set(4, 3, 6);
camera.lookAt(0, 0.3, 0);

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.PointLight(0xffffff, 2.2);
light.position.set(20, 30, 20);
scene.add(light);

const kartGroup = new THREE.Group();
scene.add(kartGroup);

const loader = new THREE.GLTFLoader();
loader.load('assets/go-kart.glb', (gltf) => {
  const model = gltf.scene;
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const scale = 8 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  // recompute the box after scaling: translation happens in the parent's
  // space, so centering has to use the already-scaled bounds, not the raw ones
  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  model.position.sub(center);
  kartGroup.add(model);
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);

// resolution is higher than a simple wireframe kart needs: this model has enough
// small geometry (flag, hubs, roll bar) that it turns to noise below ~0.28
const effect = new THREE.AsciiEffect(renderer, ' .:-=+*#%@', { invert: true, resolution: 0.28 });
effect.setSize(container.clientWidth, container.clientHeight);
effect.domElement.style.color = '#e6e6e6';
effect.domElement.style.backgroundColor = '#0a0a0a'; // matches --bg, so the canvas edge doesn't read as a seam
container.appendChild(effect.domElement);

function onResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  effect.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', onResize);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  kartGroup.rotation.y = time * 0.4;

  effect.render(scene, camera);
}
animate();

// --- HUD: scroll-progress rail + active-section label ---
const railFill = document.getElementById('rail-fill');
const railMarker = document.getElementById('rail-marker');
const railLabel = document.getElementById('rail-label');
const sections = Array.from(document.querySelectorAll('main > section'));

function updateRail() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
  railFill.style.height = pct + '%';
  railMarker.style.top = pct + '%';
  railLabel.style.top = pct + '%';
}

let activeIndex = -1;
function updateActiveSection() {
  const y = window.scrollY + window.innerHeight * 0.4;
  let idx = -1;
  sections.forEach((sec, i) => { if (sec.offsetTop <= y) idx = i; });
  if (idx !== activeIndex) {
    activeIndex = idx;
    const label = idx === -1 ? 'INTRO' : sections[idx].querySelector('h2').textContent.trim().toUpperCase();
    railLabel.textContent = `${String(idx + 1).padStart(2, '0')}/${sections.length} · ${label}`;
  }
}

window.addEventListener('scroll', () => {
  updateRail();
  updateActiveSection();
}, { passive: true });
updateRail();
updateActiveSection();
