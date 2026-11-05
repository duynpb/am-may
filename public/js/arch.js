// Công cụ dựng kiến trúc dùng chung giữa các khu: mái cong kiểu chùa Việt, núi đá vôi.
import * as THREE from 'three';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

// Ngói âm dương: vân ngói vẽ bằng canvas, lặp lại theo mét
let roofTex = null;
function tileTexture() {
  if (roofTex) return roofTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#6e3524';
  g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 16) {
    g.fillStyle = 'rgba(255,190,150,0.10)';
    g.fillRect(0, y, 128, 5);
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(0, y + 14, 128, 2);
  }
  for (let x = 0; x < 128; x += 16) {
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.fillRect(x, 0, 3, 128);
    g.fillStyle = 'rgba(255,200,160,0.08)';
    g.fillRect(x + 7, 0, 3, 128);
  }
  roofTex = new THREE.CanvasTexture(c);
  roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
  roofTex.colorSpace = THREE.SRGBColorSpace;
  return roofTex;
}

export const ARCH = {
  roof: null,
  ridge: std('#4a2219', { roughness: 0.6 }),
  gold: std('#d9a43f', { metalness: 0.85, roughness: 0.3 }),
  glaze: std('#2f7a5c', { roughness: 0.35, metalness: 0.2 }),
};
const roofMat = () => (ARCH.roof ||= std('#ffffff', { map: tileTexture(), roughness: 0.75, side: THREE.DoubleSide }));

function add(parent, geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Mái cong: mặt mái lõm (thoải ở diềm, dốc dần lên nóc), bốn góc đầu đao cong vút.
// halfX, halfZ: nửa bề ngang / bề sâu ở diềm; shrink: mỗi phía thu vào bao nhiêu khi lên tới nóc; lift: góc vểnh cao bao nhiêu.
// Trả về { rx, yTop } (nửa chiều dài bờ nóc, độ cao nóc) để gắn thêm đồ trang trí.
export function curvedRoof(parent, cx, y0, cz, halfX, halfZ, h, shrink, { lift = 1.1 } = {}) {
  const R = 8, K = 24;
  const pos = [], uv = [], ringPts = [];
  const reach = 0.42 * Math.min(halfX, halfZ);
  for (let j = 0; j <= R; j++) {
    const t = j / R, f = 1 - (1 - t) ** 2;
    const hx = halfX - shrink * f, hz = halfZ - shrink * f;
    const ring = [];
    const sides = [[[hx, hz], [-hx, hz]], [[-hx, hz], [-hx, -hz]], [[-hx, -hz], [hx, -hz]], [[hx, -hz], [hx, hz]]];
    const eaveLen = [2 * halfX, 2 * halfZ, 2 * halfX, 2 * halfZ];
    sides.forEach(([a, b], si) => {
      for (let i = 0; i <= K; i++) {
        const u = i / K;
        let x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u;
        const c = Math.max(0, 1 - (Math.min(u, 1 - u) * eaveLen[si]) / reach);
        const k = c * c * (1 - t) ** 2;
        x += Math.sign(x) * lift * 0.45 * k;
        z += Math.sign(z) * lift * 0.45 * k;
        ring.push([cx + x, y0 + h * t + lift * k, cz + z, (u * eaveLen[si]) / 1.6, (t * Math.hypot(h, shrink)) / 1.2]);
      }
    });
    ringPts.push(ring);
  }
  const quad = (a, b, c2, d) => {
    for (const p of [a, b, c2, a, c2, d]) {
      pos.push(p[0], p[1], p[2]);
      uv.push(p[3], p[4]);
    }
  };
  for (let j = 0; j < R; j++) {
    for (let i = 0; i < ringPts[j].length - 1; i++) {
      if ((i + 1) % (K + 1) === 0) continue;
      quad(ringPts[j][i], ringPts[j][i + 1], ringPts[j + 1][i + 1], ringPts[j + 1][i]);
    }
  }
  const top = ringPts[R];
  quad(top[0], top[K], top[2 * (K + 1)], top[3 * (K + 1)]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  add(parent, geo, roofMat());
  // bờ mái bốn góc, đầu đao cuộn ở chân
  for (let s = 0; s < 4; s++) {
    const pts = ringPts.map((r) => new THREE.Vector3(r[s * (K + 1)][0], r[s * (K + 1)][1] + 0.12, r[s * (K + 1)][2]));
    add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.13, 6), ARCH.ridge);
    const p0 = pts[0], d = new THREE.Vector3(Math.sign(p0.x - cx), 0, Math.sign(p0.z - cz)).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const curl = [p0, p0.clone().addScaledVector(d, 0.5).addScaledVector(up, 0.3), p0.clone().addScaledVector(d, 0.85).addScaledVector(up, 0.95), p0.clone().addScaledVector(d, 0.6).addScaledVector(up, 1.4)];
    add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 12, 0.11, 6), ARCH.ridge);
    add(parent, new THREE.SphereGeometry(0.12, 8, 6), ARCH.gold, curl[3].x, curl[3].y, curl[3].z);
  }
  // bờ nóc, hai đầu cong lên
  const rx = halfX - shrink, yTop = y0 + h;
  add(parent, new THREE.BoxGeometry(2 * rx + 0.4, 0.42, 0.42), ARCH.ridge, cx, yTop + 0.2, cz);
  for (const s of [-1, 1]) {
    const e = new THREE.Vector3(cx + s * (rx + 0.2), yTop + 0.2, cz);
    const curl = [e, e.clone().add(new THREE.Vector3(s * 0.45, 0.25, 0)), e.clone().add(new THREE.Vector3(s * 0.6, 0.8, 0)), e.clone().add(new THREE.Vector3(s * 0.35, 1.15, 0))];
    add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 10, 0.16, 6), ARCH.ridge);
  }
  return { rx, yTop };
}

// Lưỡng long chầu nguyệt trên bờ nóc (bờ nóc chạy theo trục x, tâm cx, độ cao y, dài nửa rx)
export function dragonsOnRidge(parent, cx, y, cz, rx) {
  add(parent, new THREE.SphereGeometry(0.42, 16, 12), std('#d9542a', { emissive: '#ff7a2a', emissiveIntensity: 0.35, roughness: 0.4 }), cx, y + 0.55, cz);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    add(parent, new THREE.ConeGeometry(0.1, 0.42, 6), ARCH.gold, cx + Math.cos(a) * 0.52, y + 0.55 + Math.sin(a) * 0.52, cz).rotation.z = a - Math.PI / 2;
  }
  const len = Math.min(rx - 0.6, 5.6);
  for (const s of [-1, 1]) {
    const pts = [[len, 0.1], [len * 0.82, 0.75], [len * 0.64, 0.25], [len * 0.46, 0.85], [len * 0.29, 0.55], [1.05, 0.75]].map(([x, dy]) => new THREE.Vector3(cx + s * x, y + dy, cz));
    add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.17, 8), ARCH.glaze);
    add(parent, new THREE.SphereGeometry(0.27, 12, 10), ARCH.glaze, cx + s * 0.95, y + 0.82, cz);
    add(parent, new THREE.ConeGeometry(0.13, 0.4, 8), ARCH.gold, cx + s * 0.62, y + 0.8, cz).rotation.z = (s * Math.PI) / 2;
  }
}

// Khối núi đá vôi: vách dựng đứng, đỉnh tròn, cây phủ trên đỉnh và các gờ đá (màu theo đỉnh)
const PROFILE = [[1, 0], [1.02, 0.18], [0.96, 0.38], [0.93, 0.55], [0.85, 0.72], [0.7, 0.85], [0.48, 0.95], [0.2, 1.0], [0, 1.01]];
export function karstGeometry(seed, amp = 0.16) {
  const cliff = new THREE.Color('#9a998c'), dark = new THREE.Color('#6f7266'), green = new THREE.Color('#4f6b3a'), green2 = new THREE.Color('#5f7d44');
  const g = new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 18).toNonIndexed();
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  const n = (x, y, z) => Math.sin(x * 3.1 + seed) * Math.sin(z * 2.7 - seed * 1.3) + 0.5 * Math.sin(y * 9 + x * 5 + seed * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + amp * n(x, y, z);
    p.setXYZ(i, x * k, y * (1 + 0.05 * n(z, x, y)), z * k);
    const leafy = y > 0.78 || (Math.sin(y * 26 + seed) > 0.75 && y > 0.25);
    c.copy(leafy ? (n(x, z, y) > 0 ? green : green2) : n(y, x, z) > 0.3 ? dark : cliff);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
export const karstMaterial = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
