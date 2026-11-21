// Đỉnh Bà Nà quanh chùa Linh Ứng: cổng phía đông chùa → quảng trường Làng Pháp → vườn hoa Le Jardin d'Amour →
// con đường dốc lên đồi → Cầu Vàng (đi bộ được, hai bàn tay đá khổng lồ ở giữa cầu) → đài ngắm và ga cáp treo ở đầu bên kia.
// Dáng cầu và hai bàn tay lấy từ mẫu SketchUp "Cầu Vàng Đà Nẵng" (đã xuất nhẹ ra public/models/cau-vang-tay.glb).
// Hệ toạ độ: chùa ở gốc; +x là hướng đông (ra cầu); cổng đông của chùa ở (28, -4,1).
import { THREE, rect, curvedRoof } from './base.js';

const DX = 18; // dịch cả cụm cầu sang đông để có chỗ cho quảng trường và đường dốc
const Y = 11.1; // mặt cầu cao hơn thung lũng
export const ARC = { cx: 206.9554 + DX, cz: 104.654, R: 132, th0: (235.4 * Math.PI) / 180, th1: (304.6 * Math.PI) / 180, y: Y, W: 3.0 };
const arcPt = (th, r = ARC.R) => [ARC.cx + r * Math.cos(th), ARC.cz + r * Math.sin(th)];
export const S = { x: arcPt(ARC.th0)[0], z: arcPt(ARC.th0)[1] }; // chân cầu (đầu phía chùa)
export const E = { x: arcPt(ARC.th1)[0], z: arcPt(ARC.th1)[1] }; // đầu cầu bên kia
const sm = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// Độ cao mặt đất: phẳng ở chùa và quảng trường, dốc lên từ x = 84 tới chân cầu, mỏm cao ở hai đầu cầu, thung lũng ở giữa
export function H(x, z) {
  const dS = Math.hypot(x - S.x, (z - S.z) * 0.8), dE = Math.hypot(x - (E.x + 14), (z - E.z) * 0.8);
  const hS = Y * sm((54 - dS) / 40), hE = Y * sm((62 - dE) / 40);
  let hr = 0;
  if (x < S.x) hr = Y * sm((x - 84) / (S.x - 13 - 84)) * (1 - sm((Math.abs(z - S.z) - 10) / 32));
  return Math.max(hS, hE, hr);
}
// toạ độ trên cầu: góc / bán kính so với tâm cung
export function onBridge(x, z, pad = 0.2) {
  const r = Math.hypot(x - ARC.cx, z - ARC.cz);
  if (Math.abs(r - ARC.R) > ARC.W / 2 + pad) return false;
  const a = Math.atan2(z - ARC.cz, x - ARC.cx);
  const t = a < 0 ? a + Math.PI * 2 : a;
  return t >= ARC.th0 - 0.002 && t <= ARC.th1 + 0.002;
}
export function groundY(x, z) {
  if (x >= S.x - 14.5 && x <= S.x + 0.6 && Math.abs(z - GATE_Z) <= 11.5) return Y; // sân chân cầu
  if (x >= E.x - 0.6 && x <= E.x + 36 && z >= GATE_Z - 22 && z <= GATE_Z + 16) return Y; // sân đầu cầu bên kia
  return onBridge(x, z, 1.3) ? Y : H(x, z); // dải rộng hơn mặt cầu: lỡ bước sát lan can cũng không bị rơi xuống thung lũng
}

// ───────────── khu vực đi bộ (chữ nhật) và vật cản tròn ─────────────
const GATE_Z = -4.1;
const PLAZA = { x0: 36, x1: 78, z0: -33, z1: 25 };
const GARDEN = { x0: 36, x1: 78, z0: -90, z1: -44 };
export const WALK = [
  rect(26, 38, GATE_Z - 3.4, GATE_Z + 3.4), // lối từ cổng đông chùa ra quảng trường
  rect(PLAZA.x0, PLAZA.x1, PLAZA.z0, PLAZA.z1),
  rect(52, 60, -45, -31), // lối từ quảng trường vào vườn hoa
  rect(GARDEN.x0, GARDEN.x1, GARDEN.z0, GARDEN.z1),
  rect(76, S.x - 11, GATE_Z - 4, GATE_Z + 4), // đường dốc lên chân cầu
  rect(S.x - 14, S.x + 0.5, GATE_Z - 11, GATE_Z + 11), // sân chân cầu (dừng đúng chỗ bắt đầu mặt cầu)
  rect(E.x - 0.5, E.x + 34.6, GATE_Z - 20.8, GATE_Z + 14.8), // sân đầu cầu bên kia (đài ngắm, ga cáp treo), bắt đầu đúng chỗ hết mặt cầu; chừa 1,2 m cách lan can đá
];
{
  const L = ARC.R * (ARC.th1 - ARC.th0);
  const n = Math.ceil(L / 0.6); // ô nhỏ sát đường tim cầu: người đi không ra khỏi lan can (cách tim 1,25 m)
  for (let i = 0; i <= n; i++) {
    const th = ARC.th0 + ((ARC.th1 - ARC.th0) * i) / n;
    const [px, pz] = arcPt(th);
    WALK.push(rect(px - 0.8, px + 0.8, pz - 0.8, pz + 0.8));
  }
}
export const OBSTACLES = [
  { x: 57, z: -4, r: 3.8 }, // đài phun nước quảng trường
  { x: 57, z: -67, r: 5.0 }, // đài phun nước Apollo trong vườn hoa
];

// ───────────── điểm ngắm, chuyến đi, nhãn bản đồ ─────────────
const midTh = (ARC.th0 + ARC.th1) / 2;
const handsTh = midTh - 0.02;
const [hx, hz] = arcPt(handsTh);
const tangentRy = (th) => Math.atan2(-Math.cos(th), -Math.sin(th)); // mặt nhìn theo chiều đi từ chân cầu sang đầu kia
export const PLACES = [
  { id: 'congdong', name: 'Cổng đông chùa', x: 26.2, z: GATE_Z, ry: Math.PI / 2 },
  { id: 'langphap', name: 'Quảng trường Làng Pháp', x: 44, z: GATE_Z, ry: Math.PI / 2 },
  { id: 'thapdh', name: 'Tháp đồng hồ', x: 83, z: -6.8, ry: Math.PI },
  { id: 'nhathovs', name: 'Nhà thờ Làng Pháp', x: 72, z: 14, ry: Math.PI / 2 },
  { id: 'vuonhoa', name: "Vườn hoa Le Jardin d'Amour", x: 57, z: -47, ry: Math.PI },
  { id: 'apollo', name: 'Đài phun nước Apollo', x: 57, z: -59.5, ry: Math.PI },
  { id: 'chancau', name: 'Chân Cầu Vàng', x: S.x - 4, z: GATE_Z, ry: Math.PI / 2 },
  { id: 'giuacau', name: 'Giữa cầu, bàn tay đá', x: hx, z: hz, ry: tangentRy(handsTh) },
  { id: 'cuoicau', name: 'Đầu cầu bên kia', x: E.x + 2.5, z: GATE_Z, ry: -Math.PI / 2 },
  { id: 'daingam', name: 'Đài ngắm', x: E.x + 23, z: GATE_Z - 12, ry: -Math.PI / 2 },
  { id: 'gacap', name: 'Ga cáp treo Bà Nà', x: E.x + 12, z: GATE_Z - 2.5, ry: 0 },
];
export const TRIPS = [
  { x: 44, z: GATE_Z, spread: 6, ry: Math.PI / 2, say: 'Làng Pháp trên Bà Nà đẹp quá' },
  { x: 57, z: 12, spread: 10, ry: 0, say: 'Phố cổ kiểu Pháp ghê' },
  { x: 57, z: -50, spread: 3, ry: Math.PI, say: 'Hoa nở rực cả vườn' },
  { x: 57, z: -60, spread: 4, ry: Math.PI, say: 'Tượng Apollo giữa đài phun nước' },
  { x: S.x - 4, z: GATE_Z, spread: 3, ry: Math.PI / 2, say: 'Sắp lên Cầu Vàng rồi' },
  { x: hx, z: hz, spread: 3, ry: tangentRy(handsTh), say: 'Hai bàn tay đá to ghê' },
  { x: E.x + 6, z: GATE_Z - 2, spread: 5, ry: -Math.PI / 2, say: 'Trên cao nhìn mây trôi dưới chân' },
];
export const BOT_SPAWN = [[38, 76, -30, 22], [40, 76, -86, -48], [E.x + 2, E.x + 32, GATE_Z - 18, GATE_Z + 12]];
export const MAP_SHAPES = [
  { x0: 26, x1: 38, z0: GATE_Z - 3, z1: GATE_Z + 3, c: 'm-stone' },
  { x0: PLAZA.x0, x1: PLAZA.x1, z0: PLAZA.z0, z1: PLAZA.z1, c: 'm-stone' },
  { x0: GARDEN.x0, x1: GARDEN.x1, z0: GARDEN.z0, z1: GARDEN.z1, c: 'm-veg' },
  { x0: 52, x1: 60, z0: -45, z1: -31, c: 'm-stone' },
  { x0: 76, x1: S.x - 8, z0: GATE_Z - 3, z1: GATE_Z + 3, c: 'm-stairs' },
  { x0: S.x - 13, x1: S.x + 11, z0: GATE_Z - 10, z1: GATE_Z + 10, c: 'm-terrace' },
  { x0: E.x - 0.5, x1: E.x + 35, z0: GATE_Z - 21, z1: GATE_Z + 15, c: 'm-terrace' },
  { x: 57, z: -4, r: 3.6, c: 'm-water' },
  { x: 57, z: -67, r: 4.6, c: 'm-water' },
];
{
  const L = ARC.R * (ARC.th1 - ARC.th0);
  const n = Math.round(L / 3.2);
  for (let i = 0; i <= n; i++) {
    const [px, pz] = arcPt(ARC.th0 + ((ARC.th1 - ARC.th0) * i) / n);
    MAP_SHAPES.push({ x: px, z: pz, r: 2.2, c: 'm-corridor' });
  }
}
export const MAP_LABELS = [
  ['congdong', 30, GATE_Z - 6, 'Cổng đông'],
  ['langphap', 57, 18, 'Làng Pháp'],
  ['vuonhoa', 57, -80, "Vườn hoa"],
  ['chancau', S.x, GATE_Z - 14, 'Chân cầu'],
  ['giuacau', hx, hz - 7, 'Cầu Vàng'],
  ['daingam', E.x + 15, GATE_Z - 26, 'Đài ngắm'],
  ['gacap', E.x + 14, GATE_Z + 21, 'Ga cáp treo'],
];

// ───────────── dựng cảnh ─────────────
function instanced(scene, geo, mat, items) {
  const im = new THREE.InstancedMesh(geo, mat, items.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  items.forEach((it, i) => {
    o.position.set(it.x, it.y, it.z);
    o.rotation.set(0, it.ry || 0, 0);
    o.scale.set(it.sx ?? 1, it.sy ?? 1, it.sz ?? 1);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    if (it.color) im.setColorAt(i, c.set(it.color));
  });
  im.castShadow = true;
  im.instanceMatrix.needsUpdate = true;
  scene.add(im);
  return im;
}
function ribbon(scene, pts, width, color, pickables) {
  const pos = [], idx = [];
  pts.forEach(([x, y, z], i) => {
    pos.push(x, y, z - width / 2, x, y, z + width / 2);
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  m.userData.kind = 'ground';
  pickables.push(m);
  scene.add(m);
}

export function buildSummit(ctx) {
  const { K, scene, M, std, mesh, box, cyl, plaque, pickables } = ctx;
  const gold = std('#d9a93a', { metalness: 0.55, roughness: 0.38, emissive: '#5a3d08', emissiveIntensity: 0.2 });
  const white = std('#f1ece2', { roughness: 0.7 });
  const L = ARC.R * (ARC.th1 - ARC.th0);

  // ---------- địa hình ----------
  {
    const x0 = 28, x1 = E.x + 70, z0 = -150, z1 = 80, st = 2.5;
    const nx = Math.round((x1 - x0) / st), nz = Math.round((z1 - z0) / st);
    const pos = new Float32Array((nx + 1) * (nz + 1) * 3), col = new Float32Array((nx + 1) * (nz + 1) * 3);
    const idx = [], c = new THREE.Color(), g0 = new THREE.Color('#8a9a6a'), g1 = new THREE.Color('#6f8a52'), r0 = new THREE.Color('#8f8a7a');
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = x0 + i * st, z = z0 + j * st, h = H(x, z), k = j * (nx + 1) + i;
      pos.set([x, h < 0.05 ? -0.24 : h - 0.12, z], k * 3);
      c.copy(g0).lerp(g1, Math.min(1, h / 8)).lerp(r0, Math.min(1, Math.max(0, (h - 9) / 4)) * 0.5);
      col.set([c.r, c.g, c.b], k * 3);
      if (i < nx && j < nz) idx.push(k, k + nx + 1, k + 1, k + 1, k + nx + 1, k + nx + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const t = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    t.receiveShadow = true;
    t.userData.kind = 'ground';
    pickables.push(t);
    scene.add(t);
    // đường đá dọc đường dốc
    const pts = [];
    for (let x = 78; x <= S.x - 6; x += 2) pts.push([x, H(x, GATE_Z) + 0.04, GATE_Z]);
    ribbon(scene, pts, 6.4, '#cdbfa4', pickables);
    // thông trên các sườn đồi
    const spots = K.scatter(86, E.x + 60, -140, 70, 150).filter(([x, z]) => !(x < S.x + 14 && Math.abs(z - GATE_Z) < 12) && !(x > E.x - 2 && x < E.x + 40 && z > GATE_Z - 26 && z < GATE_Z + 20) && !(Math.hypot(x - ARC.cx, z - ARC.cz) < ARC.R + 3 && Math.hypot(x - ARC.cx, z - ARC.cz) > ARC.R - 3));
    K.pines(spots.map(([x, z]) => [x, z, Math.max(H(x, z), 0) - 0.2]), 0, { scale: 1.0 });
  }

  // ---------- cổng đông của chùa ----------
  {
    for (const s of [-1, 1]) {
      cyl(0.42, 0.5, 4.2, M.red, 28.3, 2.1, GATE_Z + s * 3.1, {}, 12);
      box(1.1, 0.5, 1.1, M.stone, 28.3, 0.25, GATE_Z + s * 3.1);
    }
    box(1.0, 0.45, 7.6, M.red, 28.3, 4.4, GATE_Z);
    curvedRoof(scene, 28.3, 4.6, GATE_Z, 1.4, 4.4, 1.0, 0.7, { lift: 0.5 });
    plaque(scene, 'ĐƯỜNG LÊN CẦU VÀNG', 28.95, 3.9, GATE_Z, 4.6, 0.6, Math.PI / 2, { size: 80 });
  }

  // ---------- Quảng trường Làng Pháp ----------
  {
    K.floor(PLAZA.x0, PLAZA.x1, PLAZA.z0, PLAZA.z1, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8dccb' });
    K.floor(26, 38, GATE_Z - 3.4, GATE_Z + 3.4, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8dccb' });
    const facade = (x, z, w, d, h, color, roof, dir) => {
      const wallM = std(color, { roughness: 0.85 }), roofM = std(roof, { roughness: 0.8, flatShading: true });
      box(w, h, d, wallM, x, h / 2, z);
      const fz = z + dir * (d / 2 + 0.05);
      const cols = Math.max(2, Math.floor(w / 3.2));
      const floors = Math.floor(h / 3.4);
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        const wx = x - w / 2 + (w / cols) * (c + 0.5), wy = 1.9 + f * 3.4;
        box(0.95, 1.6, 0.12, std('#2b3a4a', { roughness: 0.3, metalness: 0.2 }), wx, wy, fz, { cast: false });
        const sh = std(f % 2 ? '#3d6a5a' : '#2f5a8a', { roughness: 0.8 });
        for (const sx of [-1, 1]) box(0.38, 1.6, 0.1, sh, wx + sx * 0.72, wy, fz + dir * 0.03, { cast: false });
        if (f > 0) box(1.5, 0.12, 0.7, std('#222'), wx, wy - 0.95, fz + dir * 0.35, { cast: false });
      }
      box(w + 0.4, 0.3, d + 0.4, std('#f3efe6'), x, h + 0.15, z); // gờ mái
      const geo = new THREE.CylinderGeometry(0.62, 0.78, 3.0, 4, 1).rotateY(Math.PI / 4);
      const r = new THREE.Mesh(geo, roofM);
      r.position.set(x, h + 1.8, z);
      r.scale.set(w / 1.1, 1, d / 1.1);
      r.castShadow = true;
      scene.add(r);
      box(0.9, 2.2, 0.9, std('#8a5a44'), x + w * 0.25, h + 2.6, z - dir * d * 0.2); // ống khói
    };
    const north = [[43, 14, 11.5, '#e8c9a0', '#4a5560'], [70, 16, 13.5, '#e3a9a0', '#a8553a']];
    for (const [x, w, h, c, r] of north) facade(x, PLAZA.z0 - 1.3 - 4, w, 8, h, c, r, 1);
    const south = [[43, 14, 12.5, '#e6c46a', '#a8553a'], [57, 14, 10.5, '#a9c4a0', '#4a5560'], [71, 14, 12.0, '#efe3c8', '#4a5560']];
    for (const [x, w, h, c, r] of south) facade(x, PLAZA.z1 + 1.3 + 4, w, 8, h, c, r, -1);
    // đài phun nước và đèn
    cyl(3.5, 3.7, 0.7, M.stone, 57, 0.35, -4, {}, 32);
    mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.1, 32), new THREE.MeshStandardMaterial({ color: '#4f8f95', roughness: 0.1, transparent: true, opacity: 0.85 }), 57, 0.62, -4, { cast: false });
    cyl(0.5, 0.7, 1.8, M.stone, 57, 1.1, -4, {}, 12);
    cyl(1.6, 0.6, 0.3, M.stone, 57, 2.1, -4, {}, 20);
    mesh(new THREE.SphereGeometry(0.4, 12, 10), white, 57, 2.6, -4);
    for (const x of [40, 52, 62, 74]) for (const z of [-30, 22]) K.lampPost(x, 0, z, std('#222'));
    K.flowers([[40, -26], [42, -26], [44, -26], [70, -26], [72, -26], [74, -26], [40, 18], [42, 18], [44, 18], [70, 18], [72, 18], [74, 18]]);
    // tháp đồng hồ
    const tx = 82, tz = -18;
    box(5.2, 1.2, 5.2, M.stoneD, tx, 0.6, tz);
    box(4.2, 19, 4.2, std('#e8c9a0', { roughness: 0.85 }), tx, 10.7, tz);
    for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) {
      const f = new THREE.Mesh(new THREE.CircleGeometry(1.35, 24), std('#fbf6e8', { roughness: 0.4 }));
      f.position.set(tx + dx * 2.15, 17.2, tz + dz * 2.15);
      f.rotation.y = ry;
      scene.add(f);
      const rim = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.42, 24), std('#222'));
      rim.position.set(tx + dx * 2.16, 17.2, tz + dz * 2.16);
      rim.rotation.y = ry;
      scene.add(rim);
      for (const [len, a] of [[0.9, 0.4], [0.65, 2.2]]) {
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, len, 0.05), std('#222'));
        hand.position.set(tx + dx * 2.18 + Math.sin(a) * 0, 17.2, tz + dz * 2.18);
        hand.rotation.y = ry;
        hand.rotation.z = -a;
        scene.add(hand);
      }
    }
    box(4.8, 0.6, 4.8, std('#f3efe6'), tx, 20.5, tz);
    mesh(new THREE.ConeGeometry(3.4, 6.5, 4).rotateY(Math.PI / 4), std('#4f8a78', { roughness: 0.6, flatShading: true }), tx, 24, tz);
    mesh(new THREE.ConeGeometry(0.15, 1.6, 6), gold, tx, 27.6, tz);
    plaque(scene, 'THÁP ĐỒNG HỒ', tx - 2.2, 3.2, tz + 2.2, 2.4, 0.5, 0, { size: 70 });
    // nhà thờ Làng Pháp
    const cx = 85, cz = 17;
    box(13, 0.8, 19, M.stoneD, cx + 1, 0.4, cz);
    box(11, 11, 17, std('#efe3c8', { roughness: 0.85 }), cx + 1.5, 6.3, cz);
    mesh(new THREE.CylinderGeometry(0.2, 6.3, 7.5, 4, 1).rotateY(Math.PI / 4), std('#4a5560', { roughness: 0.8, flatShading: true }), cx + 1.5, 15.8, cz).scale.set(1.24, 1, 1.9);
    box(5.2, 15, 5.2, std('#e8dcc0', { roughness: 0.85 }), cx - 3.4, 8.3, cz - 5.5); // tháp chuông
    mesh(new THREE.ConeGeometry(3.7, 9.5, 4).rotateY(Math.PI / 4), std('#4a5560', { roughness: 0.8, flatShading: true }), cx - 3.4, 20.5, cz - 5.5);
    mesh(new THREE.ConeGeometry(0.12, 1.8, 6), gold, cx - 3.4, 26.2, cz - 5.5);
    const rose = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), std('#5a7ab0', { roughness: 0.3, emissive: '#1a2a50', emissiveIntensity: 0.3 }));
    rose.position.set(cx - 3.4 - 2.65, 12.5, cz - 5.5);
    rose.rotation.y = -Math.PI / 2;
    scene.add(rose);
    for (const dz of [-3, 0, 3, 6]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.2), std('#4a6fa0', { roughness: 0.3, emissive: '#18305a', emissiveIntensity: 0.25 })); a.position.set(cx - 4.04, 5.5, cz + dz + 0.5); a.rotation.y = -Math.PI / 2; scene.add(a); }
    plaque(scene, 'NHÀ THỜ LÀNG PHÁP', cx - 4.5, 3.6, cz + 5, 3.4, 0.55, -Math.PI / 2, { size: 80 });
  }

  // ---------- Vườn hoa Le Jardin d'Amour ----------
  {
    K.floor(GARDEN.x0, GARDEN.x1, GARDEN.z0, GARDEN.z1, 0, 'grass', { tile: 4, macro: 0.06 });
    K.floor(52, 62, GARDEN.z0, -31, 0.02, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8dccb' }); // lối giữa
    const warm = ['#f07a5a', '#f2d24a', '#e08ab8', '#ffffff', '#f09a4a'], cool = ['#7a8fe0', '#b07ae0', '#e08ab8', '#ffffff', '#6aa0e0'];
    const side = (x0, x1, pal) => {
      const spots = [];
      for (let z = -49; z >= -87; z -= 1.5) for (let x = x0; x <= x1; x += 1.5) spots.push([x, z]);
      K.flowers(spots.filter(([x, z]) => Math.hypot(x - 57, z + 67) > 7.2), 0, pal);
    };
    side(38, 50, warm); side(64, 76, cool);
    const ring = [];
    for (let a = 0; a < Math.PI * 2; a += 0.28) for (const r of [6.2, 7.4]) ring.push([57 + Math.cos(a) * r, -67 + Math.sin(a) * r]);
    K.flowers(ring, 0, ['#ffffff', '#e08ab8', '#f2d24a']);
    // hàng rào cây thấp hai bên lối đi
    for (const sx of [-1, 1]) box(0.9, 0.9, 40, std('#3f6e34', { roughness: 1 }), 57 + sx * 4.6, 0.45, -66);
    // giàn hoa vòm dọc lối đi
    const pink = std('#f09ac0', { roughness: 0.8 }), purple = std('#a07ae0', { roughness: 0.8 });
    for (let z = -48; z >= -86; z -= 6.5) {
      if (Math.abs(z + 67) < 6) continue;
      for (const sx of [-1, 1]) { cyl(0.11, 0.13, 3.2, white, 57 + sx * 2.6, 1.6, z, {}, 8); ctx.ROUND_OBSTACLES.push({ x: 57 + sx * 2.6, z, r: 0.3 }); }
      const arch = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.07, 6, 18, Math.PI), white);
      arch.position.set(57, 3.2, z);
      scene.add(arch);
      for (let k = 0; k < 14; k++) {
        const a = (k / 13) * Math.PI;
        mesh(new THREE.IcosahedronGeometry(0.2 + (k % 3) * 0.04, 0), k % 2 ? pink : purple, 57 + Math.cos(a) * 2.6, 3.2 + Math.sin(a) * 2.6, z + ((k * 7) % 5) * 0.05, { cast: false });
      }
    }
    // cổng vườn
    for (const sx of [-1, 1]) { cyl(0.4, 0.45, 4.4, white, 57 + sx * 3.4, 2.2, -43.5, {}, 12); mesh(new THREE.SphereGeometry(0.5, 12, 10), white, 57 + sx * 3.4, 4.6, -43.5); }
    box(7.8, 0.5, 0.7, white, 57, 4.3, -43.5);
    plaque(scene, "LE JARDIN D'AMOUR", 57, 4.3, -43.1, 5.6, 0.6, 0, { size: 80 });
    // đài phun nước Apollo
    const fx = 57, fz = -67;
    cyl(4.4, 4.6, 0.8, M.stone, fx, 0.4, fz, {}, 36);
    mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.1, 36), new THREE.MeshStandardMaterial({ color: '#4f8f95', roughness: 0.1, transparent: true, opacity: 0.85 }), fx, 0.72, fz, { cast: false });
    cyl(1.2, 1.5, 1.8, M.stone, fx, 1.3, fz, {}, 16);
    cyl(0.85, 1.05, 1.4, white, fx, 2.9, fz, {}, 16);
    cyl(0.38, 0.46, 1.5, white, fx, 4.35, fz, {}, 10); // thân tượng
    mesh(new THREE.SphereGeometry(0.3, 12, 10), white, fx, 5.35, fz);
    for (const s of [-1, 1]) {
      const arm = cyl(0.1, 0.13, 1.3, white, fx + s * 0.55, 4.7, fz, {}, 6);
      arm.rotation.z = s * 0.7;
    }
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; mesh(new THREE.SphereGeometry(0.34, 10, 8), white, fx + Math.cos(a) * 2.2, 1.1, fz + Math.sin(a) * 2.2); }
    for (const z of [-50, -60, -74, -84]) for (const sx of [-1, 1]) K.lampPost(57 + sx * 5.3, 0, z, std('#222'));
  }

  // ---------- Đường dốc: đèn, hoa dọc lối ----------
  {
    for (let x = 90; x < S.x - 8; x += 12) for (const s of [-1, 1]) K.lampPost(x, H(x, GATE_Z + s * 3.6), GATE_Z + s * 3.6, std('#222'));
    const beds = [];
    for (let x = 90; x < S.x - 10; x += 3) for (const s of [-1, 1]) beds.push([x, GATE_Z + s * 5.4, H(x, GATE_Z + s * 5.4)]);
    K.flowers(beds, 0, ['#e08ab8', '#ffffff', '#f2d24a', '#b07ae0']);
    // cổng Cầu Vàng ở chân cầu
    const gx = S.x - 1.5, gy = H(gx, GATE_Z);
    for (const s of [-1, 1]) { cyl(0.35, 0.4, 4.4, gold, gx, gy + 2.2, GATE_Z + s * 2.3, {}, 12); mesh(new THREE.SphereGeometry(0.45, 12, 10), gold, gx, gy + 4.6, GATE_Z + s * 2.3); }
    box(0.6, 0.5, 5.4, gold, gx, gy + 4.3, GATE_Z);
    plaque(scene, 'CẦU VÀNG', gx - 0.35, gy + 4.3, GATE_Z, 3.6, 0.55, -Math.PI / 2, { size: 90 });
    plaque(scene, 'CẦU VÀNG', gx + 0.35, gy + 4.3, GATE_Z, 3.6, 0.55, Math.PI / 2, { size: 90 });
    K.floor(S.x - 14, S.x + 0.3, GATE_Z - 11, GATE_Z + 11, Y, 'slab', { tile: 5.5, macro: 0.05 });
    for (const s of [-1, 1]) { K.lampPost(S.x - 10, Y, GATE_Z + s * 9, std('#222')); box(14.5, 0.7, 0.3, M.stone, S.x - 6.9, Y + 0.35, GATE_Z + s * 11.2); }
  }

  // ---------- Cầu Vàng ----------
  {
    const n = Math.ceil(L / 1.0);
    const deck = [], planks = [], bars = [], rails = [], posts = [];
    const wood = new THREE.Color('#c8924a'), wood2 = new THREE.Color('#d6a860');
    for (let i = 0; i < n; i++) {
      const th = ARC.th0 + ((ARC.th1 - ARC.th0) * (i + 0.5)) / n;
      const [px, pz] = arcPt(th);
      const ry = tangentRy(th);
      deck.push({ x: px, y: Y - 0.1, z: pz, ry, color: i % 2 ? '#c8924a' : '#cf9a52', sx: 1.04 });
      for (const sgn of [-1, 1]) {
        const [qx, qz] = arcPt(th, ARC.R + sgn * 1.25);
        rails.push({ x: qx, y: Y + 0.84, z: qz, ry }, { x: qx, y: Y + 0.14, z: qz, ry, sy: 0.7 });
      }
    }
    const nb = Math.ceil(L / 0.28);
    for (let i = 0; i <= nb; i++) {
      const th = ARC.th0 + ((ARC.th1 - ARC.th0) * i) / nb;
      for (const sgn of [-1, 1]) { const [qx, qz] = arcPt(th, ARC.R + sgn * 1.25); bars.push({ x: qx, y: Y + 0.5, z: qz, ry: tangentRy(th) }); }
    }
    const np = Math.ceil(L / 3.0);
    for (let i = 0; i <= np; i++) {
      const th = ARC.th0 + ((ARC.th1 - ARC.th0) * i) / np;
      for (const sgn of [-1, 1]) { const [qx, qz] = arcPt(th, ARC.R + sgn * 1.25); posts.push({ x: qx, y: Y + 0.55, z: qz, ry: tangentRy(th) }); }
    }
    const d = instanced(scene, new THREE.BoxGeometry(1.06, 0.2, ARC.W + 0.1), std('#ffffff', { roughness: 0.75 }), deck);
    d.userData.kind = 'ground';
    d.receiveShadow = true;
    pickables.push(d);
    instanced(scene, new THREE.BoxGeometry(1.04, 0.085, 0.085), gold, rails);
    instanced(scene, new THREE.BoxGeometry(0.03, 0.68, 0.03), gold, bars);
    instanced(scene, new THREE.BoxGeometry(0.1, 1.05, 0.1), gold, posts);
    // bệ đỡ dưới mặt cầu: dầm ngang, cột thép chống xuống đất (chỉ ở đoạn giữa như trong mẫu)
    const steel = std('#9a9fa6', { metalness: 0.5, roughness: 0.45 });
    const t0 = ARC.th0 + (ARC.th1 - ARC.th0) * 0.14, t1 = ARC.th0 + (ARC.th1 - ARC.th0) * 0.86;
    for (let th = t0; th <= t1; th += 0.04) {
      const [px, pz] = arcPt(th);
      const gy = H(px, pz) - 0.4;
      const h = Y - 0.25 - gy;
      if (h < 0.5) continue;
      const g = new THREE.Group();
      g.position.set(px, 0, pz);
      g.rotation.y = tangentRy(th);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, h, 10), steel);
      col.position.y = gy + h / 2;
      g.add(col);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, ARC.W + 0.2), steel);
      beam.position.y = Y - 0.3;
      g.add(beam);
      for (const s of [-1, 1]) {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), steel);
        br.position.set(0, Y - 1.4, s * 0.8);
        br.rotation.x = s * 0.55;
        g.add(br);
      }
      g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
      scene.add(g);
    }
    // hai bàn tay đá khổng lồ và các tảng đá: lấy từ mẫu SketchUp
    import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync('/models/cau-vang-tay.glb')).then((gltf) => {
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry.computeVertexNormals();
        const m = new THREE.Mesh(o.geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, side: THREE.DoubleSide }));
        m.position.x += DX;
        m.castShadow = m.receiveShadow = true;
        scene.add(m);
      });
    }).catch((e) => console.warn('Không nạp được hai bàn tay đá của Cầu Vàng', e));
  }

  // ---------- Đầu cầu bên kia: đài ngắm, ga cáp treo ----------
  {
    K.floor(E.x - 0.2, E.x + 36, GATE_Z - 22, GATE_Z + 16, Y, 'slab', { tile: 5.5, macro: 0.05 });
    // lan can đá quanh sân (phía cầu để hở)
    for (const [x0, x1, z0, z1] of [[E.x - 0.2, E.x + 36, GATE_Z - 22, GATE_Z - 22], [E.x + 36, E.x + 36, GATE_Z - 22, GATE_Z + 16], [E.x - 0.2, E.x + 36, GATE_Z + 16, GATE_Z + 16]]) {
      const w = x1 - x0 || 0.4, d = z1 - z0 || 0.4;
      box(w, 0.8, d, M.stone, (x0 + x1) / 2, Y + 0.4, (z0 + z1) / 2);
    }
    // đài ngắm có mái cong (nền bệ phẳng với sân để không bị lún)
    const px = E.x + 14, pz = GATE_Z - 12;
    box(8.4, 0.5, 8.4, M.stone, px, Y - 0.22, pz);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.22, 0.26, 4.2, M.red, px + sx * 3.5, Y + 2.2, pz + sz * 3.5, {}, 12);
    box(8.0, 0.4, 8.0, M.red, px, Y + 4.5, pz);
    curvedRoof(scene, px, Y + 4.7, pz, 4.6, 4.6, 1.8, 2.2, { lift: 0.8 });
    plaque(scene, 'ĐÀI NGẮM', px + 4.3, Y + 4.0, pz, 2.6, 0.5, Math.PI / 2, { size: 80 });
    ctx.ROUND_OBSTACLES.push(...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => ({ x: px + sx * 3.5, z: pz + sz * 3.5, r: 0.5 })));
    // ga cáp treo hiện đại (cửa và bảng nhìn về phía bắc, về phía đài ngắm)
    const gx = E.x + 12, gz = GATE_Z + 7;
    box(10, 6.4, 8, std('#e9ecef', { roughness: 0.4, metalness: 0.2 }), gx, Y + 3.2, gz);
    box(10.6, 0.5, 8.6, std('#c0392b'), gx, Y + 6.6, gz);
    box(4.2, 3.4, 0.08, std('#3b6e8f', { roughness: 0.15, metalness: 0.5 }), gx, Y + 2.2, gz - 4.04, { cast: false });
    plaque(scene, 'GA CÁP TREO', gx, Y + 5.2, gz - 4.1, 4.0, 0.6, Math.PI, { size: 80 });
    ctx.ROUND_OBSTACLES.push({ x: gx, z: gz, r: 5.6 });
    for (const sz of [-1, 1]) K.lampPost(E.x + 6, Y, GATE_Z + sz * 3, std('#222'));
    K.flowers([[E.x + 26, GATE_Z - 17, Y], [E.x + 28, GATE_Z - 17, Y], [E.x + 30, GATE_Z - 17, Y], [E.x + 28, GATE_Z + 12, Y], [E.x + 30, GATE_Z + 12, Y], [E.x + 3, GATE_Z - 17, Y], [E.x + 5, GATE_Z - 17, Y]], Y, ['#f2d24a', '#ffffff', '#e08ab8']);
  }

  // ---------- Mây trôi dưới thung lũng ----------
  {
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.8, flatShading: true });
    const puffs = [];
    for (let i = 0; i < 36; i++) {
      const g = new THREE.Group();
      for (const [dx, dy, dz, r] of [[0, 0, 0, 4.2], [3.6, -0.3, 0.8, 3.2], [-3.4, -0.2, -0.6, 3.4], [1.0, 1.1, -1.0, 2.6]]) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
        m.position.set(dx, dy, dz);
        m.scale.y = 0.55;
        g.add(m);
      }
      const bx = S.x + 10 + ((i * 37) % 100) / 100 * (E.x - S.x - 20);
      const bz = -90 + ((i * 53) % 100) / 100 * 130;
      g.position.set(bx, 1.0 + ((i * 29) % 100) / 100 * 5, bz);
      puffs.push({ g, bx, y: g.position.y, ph: i * 0.9 });
      scene.add(g);
    }
    K.updaters.push((t) => { for (const p of puffs) { p.g.position.x = p.bx + Math.sin(t * 0.04 + p.ph) * 6; p.g.position.y = p.y + Math.sin(t * 0.2 + p.ph) * 0.35; } });
  }
}
