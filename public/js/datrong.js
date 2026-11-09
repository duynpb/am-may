// Khu đất trống chờ dựng chùa: bãi cỏ rộng có cắm mốc và dây căng ranh giới, biển gỗ ghi tên chùa và tỉnh,
// vài gốc cây, núi xa. Xoay / phóng to bằng chuột hoặc ngón tay. Mở từ Bản đồ Việt Nam (?chua=<mã>&tu=<khu>).
import { t } from './i18n.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as T from './textures.js';
import { pagodaById } from './vnmap-data.js';
import { createVnMap } from './vnmap.js';

const q = new URLSearchParams(location.search);
const P = pagodaById(q.get('chua')) ?? { name: 'Khu đất chờ dựng chùa', prov: '' };
const from = ['ammay', 'tamchuc'].includes(q.get('tu')) ? q.get('tu') : 'ammay';
const $ = (s) => document.querySelector(s);
$('#dt-name').textContent = P.name;
$('#dt-prov').textContent = P.old ? `${P.prov} (${t(`trước 7/2025: ${P.old}`)})` : P.prov;
document.title = `${P.name} — ${t('Khu đất chờ dựng chùa')}`;
const back = $('#dt-back');
back.href = from === 'tamchuc' ? './tamchuc.html' : './';
$('#dt-back-text').textContent = t(from === 'tamchuc' ? 'Về Tam Chúc' : 'Về Am Mây');

// ---------- cảnh ----------
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfdde0');
scene.fog = new THREE.Fog('#d8e2df', 60, 220);
const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 500);
camera.position.set(22, 13, 30);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 8;
controls.maxDistance = 90;

scene.add(new THREE.HemisphereLight('#fff3dc', '#5d6b48', 1.1));
const sun = new THREE.DirectionalLight('#fff0d0', 2.2);
sun.position.set(30, 40, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 });
scene.add(sun);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const add = (geo, mat, x, y, z, parent = scene) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};

// bãi cỏ rộng, nền khu đất hơi sẫm (đã phát quang), lối đất vào
const ground = add(new THREE.PlaneGeometry(500, 500), T.groundMaterial('grass', { tile: 5, macro: 0.3, tint: '#dbe2c8' }), 0, 0, 0);
ground.rotation.x = -Math.PI / 2;
const lot = add(new THREE.PlaneGeometry(40, 30), T.groundMaterial('dirt', { tile: 4, macro: 0.08, tint: '#c9b99a', polygonOffset: true, polygonOffsetFactor: -1 }), 0, 0.01, 0);
lot.rotation.x = -Math.PI / 2;
const lane = add(new THREE.PlaneGeometry(3, 40), T.groundMaterial('dirt', { tile: 3, macro: 0.06, tint: '#d6c8ad', polygonOffset: true, polygonOffsetFactor: -1 }), 0, 0.012, 35);
lane.rotation.x = -Math.PI / 2;

// cọc mốc và dây căng ranh giới (đỏ – trắng)
{
  const stake = std('#8a6a44'), red = std('#c4222a'), white = std('#f2efe6');
  const corners = [[-20, -15], [20, -15], [20, 15], [-20, 15]];
  const ropeAt = (a, b) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 1.2);
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n;
      const x = a[0] + ((b[0] - a[0]) * (f0 + f1)) / 2, z = a[1] + ((b[1] - a[1]) * (f0 + f1)) / 2;
      const seg = add(new THREE.CylinderGeometry(0.025, 0.025, L / n, 5), i % 2 ? red : white, x, 0.75, z);
      seg.rotation.z = Math.PI / 2;
      seg.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    }
  };
  for (let k = 0; k < 4; k++) {
    const a = corners[k], b = corners[(k + 1) % 4];
    // chừa lối vào ở giữa cạnh phía nam (z = 15)
    if (k === 2) {
      ropeAt(a, [2, 15]);
      ropeAt([-2, 15], b);
    } else ropeAt(a, b);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 5);
    for (let i = 0; i < n; i++) add(new THREE.BoxGeometry(0.14, 1.0, 0.14), stake, a[0] + ((b[0] - a[0]) * i) / n, 0.5, a[1] + ((b[1] - a[1]) * i) / n);
  }
  for (const [x, z] of corners) {
    add(new THREE.BoxGeometry(0.3, 1.2, 0.3), white, x, 0.6, z);
    add(new THREE.BoxGeometry(0.32, 0.2, 0.32), red, x, 1.25, z);
  }
}

// biển gỗ ở lối vào: tên chùa, tỉnh, "Khu đất chờ dựng chùa"
{
  const wood = std('#6b4428', { roughness: 0.7 });
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.1, 0.12, 2.6, 8), wood, s * 1.5, 1.3, 16.5);
  add(new THREE.BoxGeometry(3.4, 1.35, 0.12), wood, 0, 2.05, 16.5);
  const title = (P.name || '').toUpperCase();
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshStandardMaterial({ map: T.boardTexture([title, t('KHU ĐẤT CHỜ DỰNG CHÙA')], { w: 1024, h: 384, size: 92 }), roughness: 0.5 }));
  sign.position.set(0, 2.05, 16.57);
  scene.add(sign);
}

// vài cây cổ thụ quanh khu đất, đá tảng, đồi núi xa
{
  const bark = std('#5a4030', { roughness: 0.95 }), leaf = std('#4a7a34'), leaf2 = std('#5d8c3e'), rock = std('#9a998c', { roughness: 1, flatShading: true });
  const tree = (x, z, s) => {
    add(new THREE.CylinderGeometry(0.25 * s, 0.4 * s, 3.2 * s, 8), bark, x, 1.6 * s, z);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      add(new THREE.IcosahedronGeometry(1.6 * s, 1), k % 2 ? leaf : leaf2, x + Math.cos(a) * 1.1 * s, 3.9 * s + (k % 2) * 0.4, z + Math.sin(a) * 1.1 * s).scale.y = 0.75;
    }
  };
  for (const [x, z, s] of [[-27, -10, 1.3], [26, -18, 1.1], [-24, 20, 0.9], [29, 12, 1.2], [8, -26, 1.0], [-10, -27, 1.15]]) tree(x, z, s);
  for (const [x, z, s] of [[12, -6, 0.6], [-14, 6, 0.5], [5, 9, 0.35], [-6, -9, 0.45]]) add(new THREE.DodecahedronGeometry(s, 0), rock, x, s * 0.5, z);
  // núi đá vôi xa
  const peaks = new THREE.MeshStandardMaterial({ color: '#8f9b8c', roughness: 1, flatShading: true });
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + 0.2, d = 120 + (k % 3) * 25;
    const m = add(new THREE.ConeGeometry(14 + (k % 4) * 5, 30 + (k % 5) * 10, 7), peaks, Math.cos(a) * d, 12 + (k % 5) * 5, Math.sin(a) * d);
    m.castShadow = false;
  }
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

// ---------- bản đồ Việt Nam: mở lại để chọn chùa khác ----------
function openModal(id) {
  const m = $(id);
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('show'));
}
function closeModal(m) {
  m.classList.remove('show');
  setTimeout(() => !m.classList.contains('show') && (m.hidden = true), 250);
}
const vnMap = createVnMap({ openModal, closeModal, here: q.get('chua'), from });
$('#dt-map').addEventListener('click', () => vnMap.open());
