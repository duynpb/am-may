// Tượng Quan Âm Bồ Tát đứng trên tòa sen — đá trắng, tạc bằng SDF giống tượng Phật trong chánh điện.
// Tay phải giơ trước ngực, tay trái cầm bình cam lộ cắm cành dương liễu; khăn choàng trùm đầu phủ xuống vai.
import * as THREE from 'three';
import { sculpt, petalGeometry, smin, smax, sph, ell, cone, smooth } from './buddha.js';

const SPLIT_Y = 2.06; // thân dựng thưa, đầu dựng dày để rõ nét mặt
const NECK = (x, y, z) => cone(x, y, z, [0, 1.86, -0.01], [0, 2.16, 0.01], 0.07, 0.062);
// khăn choàng từ đầu phủ xuống hai vai, khoét phía trước để lộ cổ
function drape(x, y, z) {
  let d = ell(x, y, z, 0, 1.97, -0.07, 0.25, 0.27, 0.16);
  return smax(d, -ell(x, y, z, 0, 2.02, 0.15, 0.16, 0.32, 0.14), 0.03);
}
function seg2(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const h = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - dx * h, py - ay - dy * h);
}

// Nếp áo: nếp dọc trên vạt áo dài, dây thắt lưng, cổ áo chữ V nhỏ
function robe(x, y, z) {
  let f = 0;
  const a = Math.atan2(z, x);
  f += 0.012 * Math.sin(a * 16 + y * 1.5) * smooth(1.32, 1.12, y);
  f += 0.012 * Math.exp(-(((y - 1.36) / 0.018) ** 2)) * smooth(-0.05, 0.08, z);
  if (z > 0 && y > 1.6 && y < 1.96) {
    const e = Math.min(seg2(x, y, -0.13, 1.93, 0, 1.7), seg2(x, y, 0.13, 1.93, 0, 1.7));
    f += 0.012 * Math.exp(-(e * e) / 0.0003);
  }
  return -f;
}

function body(x, y, z) {
  // áo dài chạm gót, gấu áo xòe nhẹ
  let d = cone(x, y, z, [0, 0.04, 0], [0, 1.32, 0], 0.37, 0.25);
  d = smin(d, ell(x, y, z, 0, 0.1, 0.03, 0.43, 0.13, 0.36), 0.12);
  d = smin(d, ell(x, y, z, 0, 1.3, 0.0, 0.27, 0.2, 0.2), 0.1); // hông
  d = smin(d, ell(x, y, z, 0, 1.66, 0.01, 0.27, 0.3, 0.19), 0.1); // ngực
  d = smin(d, ell(x, y, z, 0, 1.9, -0.01, 0.31, 0.09, 0.16), 0.1); // vai
  // tay phải: khuỷu sát hông, bàn tay dựng trước ngực
  d = smin(d, cone(x, y, z, [0.29, 1.88, 0], [0.34, 1.5, 0.05], 0.065, 0.055), 0.05);
  d = smin(d, cone(x, y, z, [0.34, 1.5, 0.05], [0.17, 1.72, 0.2], 0.05, 0.04), 0.04);
  d = smin(d, ell(x, y, z, 0.155, 1.775, 0.215, 0.032, 0.066, 0.024), 0.02);
  // tay trái: đỡ bình cam lộ trước bụng
  d = smin(d, cone(x, y, z, [-0.29, 1.88, 0], [-0.33, 1.48, 0.04], 0.065, 0.055), 0.05);
  d = smin(d, cone(x, y, z, [-0.33, 1.48, 0.04], [-0.13, 1.38, 0.22], 0.05, 0.04), 0.04);
  d = smin(d, ell(x, y, z, -0.12, 1.37, 0.24, 0.046, 0.03, 0.042), 0.02);
  // tay áo rộng rủ xuống
  d = smin(d, ell(x, y, z, 0.33, 1.28, 0.12, 0.1, 0.3, 0.11), 0.08);
  d = smin(d, ell(x, y, z, -0.32, 1.22, 0.12, 0.1, 0.32, 0.11), 0.08);
  // khăn choàng rủ sau lưng
  d = smin(d, ell(x, y, z, 0, 1.6, -0.13, 0.3, 0.5, 0.11), 0.1);
  d = smin(d, drape(x, y, z), 0.06);
  d = smin(d, NECK(x, y, z), 0.06);
  return Math.abs(d) < 0.05 ? d + robe(x, y, z) : d;
}

// Nếp mí mắt, đường môi: rãnh lõm mềm
function faceLines(x, y, z) {
  if (z < 0.1 || y < 2.16 || y > 2.32) return 0;
  let g = 0;
  for (const s of [-1, 1]) {
    const u = (x - s * 0.045) / 0.033;
    if (Math.abs(u) < 1) g += 0.003 * Math.exp(-(((y - (2.286 - 0.005 * u * u)) / 0.0035) ** 2)) * (1 - u * u);
  }
  const m = x / 0.029;
  if (Math.abs(m) < 1) g += 0.002 * Math.exp(-(((y - (2.186 + 0.004 * m * m)) / 0.003) ** 2)) * Math.sqrt(1 - m * m);
  return g;
}

function head(x, y, z) {
  let d = ell(x, y, z, 0, 2.28, 0.02, 0.118, 0.15, 0.13);
  d = smin(d, ell(x, y, z, 0, 2.215, 0.05, 0.095, 0.085, 0.105), 0.05); // má đầy, cằm thon
  d = smin(d, ell(x, y, z, 0, 2.27, 0.143, 0.016, 0.045, 0.022), 0.015); // sống mũi
  d = smin(d, ell(x, y, z, 0, 2.235, 0.152, 0.022, 0.014, 0.016), 0.012); // chóp mũi
  for (const s of [-1, 1]) d = smin(d, ell(x, y, z, s * 0.045, 2.292, 0.13, 0.035, 0.014, 0.014), 0.012); // mí mắt
  d = smin(d, ell(x, y, z, 0, 2.193, 0.145, 0.03, 0.009, 0.014), 0.008); // môi trên
  d = smin(d, ell(x, y, z, 0, 2.179, 0.142, 0.024, 0.009, 0.014), 0.008); // môi dưới
  // khăn trùm đầu, khoét phía trước để lộ gương mặt
  let hood = ell(x, y, z, 0, 2.3, -0.03, 0.165, 0.22, 0.17);
  hood = smax(hood, -ell(x, y, z, 0, 2.24, 0.14, 0.125, 0.19, 0.13), 0.02);
  d = smin(d, hood, 0.02);
  d = smin(d, ell(x, y, z, 0, 2.405, 0.14, 0.02, 0.024, 0.01), 0.01); // tượng Phật nhỏ trên mũ miện
  d = smin(d, drape(x, y, z), 0.06);
  d = smin(d, NECK(x, y, z), 0.04);
  return Math.abs(d) < 0.02 ? d + faceLines(x, y, z) : d;
}

export function makeQuanAm({ quality = 'high' } = {}) {
  const g = new THREE.Group();
  const q = quality === 'high' ? 1 : 1.4;
  const marble = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.38, metalness: 0 });
  const stone = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.55 });

  // Tòa sen trắng hồng
  const petal = petalGeometry({ baseC: '#d9b8ae', tipC: '#fff4ee' });
  const petalMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.42 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 40), stone);
  base.position.y = 0.06;
  g.add(base);
  for (const [n, r, y, tilt, s, off] of [[12, 0.5, 0.02, 0.42, 0.62, 0], [10, 0.38, 0.13, 0.22, 0.54, 0.3]]) {
    for (let i = 0; i < n; i++) {
      const pv = new THREE.Group();
      pv.rotation.y = (i / n) * Math.PI * 2 + off;
      const m = new THREE.Mesh(petal, petalMat);
      m.position.set(0, y, r);
      m.rotation.x = tilt;
      m.scale.setScalar(s);
      m.castShadow = true;
      pv.add(m);
      g.add(pv);
    }
  }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.06, 40), stone);
  top.position.y = 0.33;
  g.add(top);

  // Thân tượng
  const figure = new THREE.Group();
  figure.position.y = 0.34;
  g.add(figure);
  const geo = sculpt([
    { sdf: body, min: [-0.6, -0.02, -0.4], max: [0.6, SPLIT_Y, 0.46], step: 0.014 * q },
    { sdf: head, min: [-0.36, SPLIT_Y, -0.38], max: [0.36, 2.62, 0.3], step: 0.0068 * q },
  ], { hi: '#fbf8f1', deep: '#8f8a82', grainAmp: 0.025 });
  const statue = new THREE.Mesh(geo, marble);
  statue.castShadow = statue.receiveShadow = true;
  figure.add(statue);

  // Chuỗi anh lạc quanh cổ (cũng che đường nối giữa phần thân và phần đầu)
  const beadMat = new THREE.MeshStandardMaterial({ color: '#f1e3c2', roughness: 0.3, metalness: 0.2 });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 8, 6), beadMat, 40);
  {
    const o = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      // vòng ôm quanh khăn choàng, phía trước võng xuống thành hình chữ U
      const front = Math.max(0, Math.sin(a));
      o.position.set(Math.cos(a) * 0.262, SPLIT_Y + 0.004 - front * front * 0.006, -0.07 + Math.sin(a) * (0.172 + front * 0.012));
      o.updateMatrix();
      beads.setMatrixAt(i, o.matrix);
    }
  }
  figure.add(beads);

  // Bình cam lộ + cành dương liễu trên tay trái
  const vase = new THREE.Mesh(
    new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.045, 0.04], [0.05, 0.09], [0.035, 0.14], [0.014, 0.17], [0.02, 0.2], [0.012, 0.205]].map(([r, h]) => new THREE.Vector2(r, h)), 24),
    marble.clone(),
  );
  vase.material.vertexColors = false;
  vase.material.color.set('#f4efe6');
  vase.position.set(-0.12, 1.39, 0.245);
  vase.castShadow = true;
  figure.add(vase);
  const willowMat = new THREE.MeshStandardMaterial({ color: '#6f8f4a', roughness: 0.7 });
  const twig = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.12, 1.59, 0.245], [-0.1, 1.72, 0.26], [-0.04, 1.8, 0.29], [0.02, 1.78, 0.33]].map((p) => new THREE.Vector3(...p))), 16, 0.004, 5),
    willowMat,
  );
  figure.add(twig);
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), willowMat);
    leaf.scale.set(0.006, 0.03, 0.004);
    const k = i / 8;
    leaf.position.set(-0.11 + k * 0.13, 1.66 + Math.sin(k * Math.PI) * 0.12, 0.25 + k * 0.08);
    leaf.rotation.z = (i % 2 ? 1 : -1) * 0.9;
    figure.add(leaf);
  }

  // Vầng hào quang sau đầu
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.008, 8, 64), new THREE.MeshStandardMaterial({ color: '#f2dfa8', emissive: '#f6e2a6', emissiveIntensity: 0.35, roughness: 0.4 }));
  halo.position.set(0, 2.3, -0.2);
  figure.add(halo);
  return g;
}
