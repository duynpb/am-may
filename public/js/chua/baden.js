// Núi Bà Đen (Tây Ninh): ngọn núi cao nhất Nam Bộ. Dưới chân núi là sân lớn và cổng đá, bậc thang dài lên chùa Bà
// (điện thờ Linh Sơn Thánh Mẫu) lưng chừng núi; ga cáp treo đưa lên đỉnh, nơi có tượng Phật Bà bằng đồng rất lớn giữa mây.
// Đỉnh núi là một "tầng" riêng: chỉ lên xuống bằng cáp treo. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall } from './base.js';
import { makeQuanAm } from '../quanam.js';

const MT = { x: 0, z: -215, top: 88, plateau: 34 }; // núi: tâm, độ cao đỉnh, bán kính mặt bằng đỉnh
const TER = { x0: -26, x1: 26, z0: -62, z1: -30, y: 14 }; // nền chùa Bà lưng chừng núi
const STAIR = { x0: -4, x1: 4, zBottom: 8, zTop: TER.z1, y0: 0, y1: TER.y };
const HALL = { x: 0, z0: -38, z1: -52, hx: 11, y: TER.y, plaque: 'LINH SƠN TIÊN THẠCH TỰ', wallH: 6 };
const GATE_Z = 36;
const STATION = { x: 30, z: 22 }; // ga cáp treo dưới chân núi
const TOPST = { x: 22, z: MT.z + 20 }; // ga cáp treo trên đỉnh
const STATUE = { x: 0, z: MT.z - 6 };
const S = MT.top;

const WALK_AREAS = [
  rect(-44, 44, 8.2, 58), // sân chân núi
  rect(STAIR.x0 + 0.8, STAIR.x1 - 0.8, STAIR.zTop - 0.8, STAIR.zBottom + 0.6), // bậc thang lên chùa Bà
  rect(TER.x0 + 1, TER.x1 - 1, HALL.z0 + 0.6, TER.z1 - 0.6), // sân trước điện
  rect(TER.x0 + 1, -HALL.hx - 0.9, TER.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 0.9, TER.x1 - 1, TER.z0 + 1, HALL.z0 + 0.9),
  rect(TER.x0 + 1, TER.x1 - 1, TER.z0 + 1, HALL.z1 - 0.5),
  ...hallWalk(HALL),
  // đỉnh núi (tầng riêng)
  rect(-23, 23, MT.z - 23, MT.z + 23, { zone: 1 }),
];
const ROUND_OBSTACLES = [
  { x: STATUE.x, z: STATUE.z, r: 7.2 },
  { x: STATION.x, z: STATION.z, r: 3.4 },
  { x: TOPST.x, z: TOPST.z - 1, r: 2.6 },
  ...[-7.5, -2.8, 2.8, 7.5].map((x) => ({ x, z: GATE_Z, r: 0.9 })),
];
const RITUALS = [
  { place: 'ba', y: HALL.y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: HALL.y + 3.4, z: HALL.z1 + 1.7 } },
  { place: 'chan', y: 0, stone: true, burner: { x: 0, z: 17 }, merit: { x: 3.4, z: 16.8 }, face: { x: 0, y: 8, z: TER.z1 } },
  { place: 'dinh', y: S, stone: true, burner: { x: STATUE.x, z: STATUE.z + 10 }, merit: { x: STATUE.x + 3.6, z: STATUE.z + 9.8 }, face: { x: STATUE.x, y: S + 8, z: STATUE.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

// sườn núi: độ cao theo khoảng cách tới tâm núi
const PROFILE = [[0, S], [MT.plateau, S], [52, S - 12], [80, 56], [110, 31], [140, 13], [175, 5], [205, 1.5], [240, -1.5]];
function slopeY(x, z) {
  const r = Math.hypot(x - MT.x, z - MT.z);
  for (let i = 1; i < PROFILE.length; i++) {
    if (r <= PROFILE[i][0]) {
      const [r0, y0] = PROFILE[i - 1], [r1, y1] = PROFILE[i];
      return y0 + ((y1 - y0) * (r - r0)) / (r1 - r0);
    }
  }
  return -1.5;
}
function groundY(x, z) {
  if (Math.hypot(x - MT.x, z - MT.z) < MT.plateau + 2) return S;
  const s = stairY(STAIR, x, z);
  if (s != null) return s;
  if (x >= TER.x0 && x <= TER.x1 && z >= TER.z0 && z <= TER.z1) return inHall(HALL, x, z) ? HALL.y + 0.25 : TER.y;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6ea6d8', skyBottom: '#e9e7dc', fog: [220, 900], shadowSize: 50 });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, updaters, lods } = K;

  // ---------- Đất và ngọn núi ----------
  {
    const land = mesh(new THREE.BoxGeometry(900, 2, 900), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-46, 46, 8, 60, 0, 'slab', { tile: 5.5, macro: 0.05 });
    // núi: tiện tròn theo PROFILE, rồi gồ ghề bằng nhiễu; mặt đỉnh phẳng để đặt tượng
    const pts = [...PROFILE].reverse().map(([r, y]) => new THREE.Vector2(Math.max(r, 0.01), y));
    const geo = new THREE.LatheGeometry(pts, 96);
    const p = geo.attributes.position, col = [];
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x);
      if (r > MT.plateau + 1 && y > 0) {
        const n = Math.sin(a * 7 + y * 0.05) * 0.5 + Math.sin(a * 13 - y * 0.11) * 0.3 + Math.sin(a * 23 + y * 0.2) * 0.2;
        const k = 1 + n * 0.09 * Math.min(1, (S - y) / 20);
        p.setX(i, x * k);
        p.setZ(i, z * k);
        p.setY(i, y + n * 2.2 * Math.min(1, (S - y) / 15));
      }
      const h = p.getY(i) / S;
      if (h > 0.985) c.set('#9d968a');
      else c.setHSL(0.27 - h * 0.05, 0.42 - h * 0.18, 0.17 + n2(a, y) * 0.03 + h * 0.08);
      const dk = h > 0.985 ? 1 : 0.5; // sườn núi tối hơn cây cho rõ khối
      col.push(c.r * dk, c.g * dk, c.b * dk);
    }
    function n2(a, y) { return Math.sin(a * 31 + y * 0.3); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mt = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
    mt.position.set(MT.x, 0, MT.z);
    mt.receiveShadow = true;
    scene.add(mt);
    // các núi nhỏ hai bên (núi Phụng, núi Heo)
    for (const [x, z, r, h] of [[-190, -150, 110, 46], [180, -170, 100, 38]]) {
      const g2 = new THREE.LatheGeometry([[r, -1], [r * 0.6, h * 0.5], [r * 0.2, h], [0.01, h]].map(([a, b]) => new THREE.Vector2(a, b)), 48);
      const m = new THREE.Mesh(g2, new THREE.MeshStandardMaterial({ color: '#4f6a3a', roughness: 0.95, flatShading: true }));
      m.position.set(x, 0, z);
      scene.add(m);
    }
    // rừng trên sườn núi
    const spots = [];
    for (let i = 0; i < 260; i++) {
      const a = K.rr() * Math.PI * 2, r = MT.plateau + 8 + K.rr() * 190;
      const x = MT.x + Math.cos(a) * r, z = MT.z + Math.sin(a) * r;
      if (x > TER.x0 - 6 && x < TER.x1 + 6 && z > TER.z0 - 6 && z < 62) continue; // chừa chùa Bà, bậc thang, sân
      if (Math.abs(x - (STATION.x + TOPST.x) / 2) < 10 && z > TOPST.z && z < STATION.z) continue; // chừa tuyến cáp
      spots.push([x, z, slopeY(x, z) - 0.3]);
    }
    K.forest(spots, 0, { scale: 1.3 });
  }

  // ---------- Sân chân núi: cổng đá, cờ, đèn, lư hương ----------
  {
    const g = group(0, 0, GATE_Z);
    for (const x of [-7.5, -2.8, 2.8, 7.5]) {
      box(1.2, 0.5, 1.2, M.stoneD, x, 0.25, 0, { parent: g });
      box(0.9, x * x < 10 ? 7.5 : 5.6, 0.9, M.stone, x, (x * x < 10 ? 7.5 : 5.6) / 2 + 0.5, 0, { parent: g });
    }
    box(6.8, 0.8, 1.3, M.stone, 0, 8.4, 0, { parent: g });
    for (const s of [-1, 1]) box(5.6, 0.6, 1.1, M.stone, s * 5.15, 6.4, 0, { parent: g });
    plaque(g, 'NÚI BÀ ĐEN', 0, 7.4, 0.5, 4.2, 0.8);
    plaque(g, 'NÚI BÀ ĐEN', 0, 7.4, -0.5, 4.2, 0.8, Math.PI);
    for (const s of [-1, 1]) {
      for (let z = 12; z <= 52; z += 10) K.lampPost(s * 12, 0, z);
      K.flagPole(s * 6, 0, 30, 8);
      K.lion(s * 4.4, 0, 12);
    }
    K.forest([[-38, 50], [-38, 30], [38, 50], [-30, 12], [24, 50]], 0, { scale: 1.2 });
    K.palms([[-18, 44], [18, 44], [-18, 24], [16, 30]]);
  }

  // ---------- Bậc thang dài lên chùa Bà, nền chùa, điện ----------
  {
    stairs({ ...STAIR, base: -0.5 }, { railH: 1.0 });
    terrace(TER.x0, TER.x1, TER.z0, TER.z1, 0, TER.y, { side: std('#857c6c', { roughness: 1 }) });
    for (const s of [-1, 1]) {
      box(TER.x1 - STAIR.x1 - 0.4, 0.8, 0.3, M.stone, s * (TER.x1 + STAIR.x1 + 0.4) / 2, TER.y + 0.4, TER.z1 - 0.15);
      box(0.3, 0.8, TER.z1 - TER.z0, M.stone, s * (TER.x1 - 0.15), TER.y + 0.4, (TER.z0 + TER.z1) / 2);
      K.stoneLamp(s * 15, TER.y, -34);
    }
    K.hall(HALL, (y, z) => {
      // tượng Linh Sơn Thánh Mẫu dát vàng (cùng mẫu chạm khắc với Quan Âm điện ở Am Mây)
      const ba = K.gild(makeQuanAm({ quality: 'low', color: '#f0c25a' }), { color: '#f0c25a' });
      ba.position.set(0, y, z);
      ba.scale.setScalar(1.15);
      ba.traverse((m) => (m.castShadow = false));
      scene.add(ba);
      lods.push({ obj: ba, z });
      // rèm đỏ hai bên khám thờ
      for (const x of [-2.6, 2.6]) box(0.9, 3.6, 0.08, std('#b3261b', { roughness: 0.8 }), x, y + 1.8, z - 0.6);
    });
    K.forest([[-22, -58], [22, -58], [-23, -34], [23, -34]], TER.y, { scale: 1.1 });
  }

  // ---------- Cáp treo: ga dưới chân núi, ga trên đỉnh, trụ, cáp, cabin chạy liên tục ----------
  const gotoHits = [];
  {
    const station = (x, z, y, ry, goto, label) => {
      const g = group(x, y, z, ry, { merge: false });
      g.userData.goto = goto;
      box(6, 0.4, 6, M.stoneD, 0, 0.2, 0, { parent: g });
      box(5.4, 4.2, 5.4, std('#e9ecef', { roughness: 0.4, metalness: 0.2 }), 0, 2.5, 0, { parent: g });
      box(5.8, 0.4, 5.8, std('#c0392b'), 0, 4.8, 0, { parent: g });
      box(3.2, 2.6, 0.06, std('#3b6e8f', { roughness: 0.15, metalness: 0.5 }), 0, 2.0, 2.73, { parent: g, cast: false });
      cyl(0.5, 0.5, 1.2, std('#555'), 0, 5.6, 0, { parent: g }, 12);
      plaque(g, label, 0, 4.0, 2.74, 3.6, 0.6, 0, { size: 90 });
      gotoHits.push(g);
      return g;
    };
    station(STATION.x, STATION.z, 0, Math.atan2(-(TOPST.x - STATION.x), -(TOPST.z - STATION.z)) + Math.PI, 0, 'CÁP TREO');
    station(TOPST.x, TOPST.z, S, Math.atan2(STATION.x - TOPST.x, STATION.z - TOPST.z) + Math.PI, 1, 'CÁP TREO');
    const A = new THREE.Vector3(STATION.x, 5.6, STATION.z), B = new THREE.Vector3(TOPST.x, S + 5.6, TOPST.z);
    const side = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(1.2);
    const lines = [[A.clone().add(side), B.clone().add(side)], [B.clone().sub(side), A.clone().sub(side)]];
    const cableM = new THREE.LineBasicMaterial({ color: '#333' });
    // dây cáp võng nhẹ giữa các trụ
    const sag = (a, b, t) => new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -Math.sin(Math.PI * ((t * 5) % 1)) * 1.2, 0));
    for (const [a, b] of lines) {
      const pts = [];
      for (let i = 0; i <= 100; i++) pts.push(sag(a, b, i / 100));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableM));
    }
    // trụ cáp
    for (let k = 1; k < 5; k++) {
      const t = k / 5, p = new THREE.Vector3().lerpVectors(A, B, t);
      const gy = slopeY(p.x, p.z);
      const h = p.y - gy + 1.0;
      box(0.8, h, 0.8, std('#8c8f93', { metalness: 0.6, roughness: 0.4 }), p.x, gy + h / 2 - 0.5, p.z);
      const arm = box(0.4, 0.4, 3.4, std('#8c8f93', { metalness: 0.6, roughness: 0.4 }), p.x, p.y + 0.3, p.z);
      arm.rotation.y = Math.atan2(side.x, side.z);
    }
    // cabin
    const cabM = std('#d84b3a', { roughness: 0.4 }), glassM = std('#26343f', { roughness: 0.1, metalness: 0.6 });
    const cabins = [];
    for (let i = 0; i < 14; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.8), cabM);
      body.position.y = -2.2;
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.7, 1.84), glassM);
      win.position.y = -1.9;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), std('#444'));
      rod.position.y = -0.7;
      g.add(body, win, rod);
      body.castShadow = true;
      scene.add(g);
      cabins.push({ g, line: lines[i % 2], ph: i / 14 });
    }
    updaters.push((t) => {
      for (const c of cabins) {
        const u = (t / 240 + c.ph) % 1;
        c.g.position.copy(sag(c.line[0], c.line[1], u));
      }
    });
  }

  // ---------- Đỉnh núi: sân đá, lan can, tượng Phật Bà bằng đồng trên tòa sen, mây quanh đỉnh ----------
  {
    floor(MT.x - 24, MT.x + 24, MT.z - 24, MT.z + 24, S, 'slab', { tile: 5.5, macro: 0.05 });
    // lan can đá quanh sân
    for (const s of [-1, 1]) {
      box(48, 0.8, 0.3, M.stone, MT.x, S + 0.4, MT.z + s * 24);
      box(0.3, 0.8, 48, M.stone, MT.x + s * 24, S + 0.4, MT.z);
    }
    // tòa sen ba tầng
    const ped = group(STATUE.x, S, STATUE.z);
    cyl(6.4, 6.8, 1.2, M.stoneD, 0, 0.6, 0, { parent: ped }, 32);
    cyl(5.4, 5.8, 1.6, M.stone, 0, 2.0, 0, { parent: ped }, 32);
    const petalM = std('#8a6a3a', { metalness: 0.7, roughness: 0.4 });
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const p = mesh(new THREE.SphereGeometry(1.2, 10, 8), petalM, Math.cos(a) * 4.4, 3.4, Math.sin(a) * 4.4, { parent: ped });
      p.scale.set(0.6, 1.1, 0.35);
      p.rotation.y = -a + Math.PI / 2;
    }
    cyl(4.2, 4.4, 0.8, petalM, 0, 3.6, 0, { parent: ped }, 32);
    const qa = K.gild(makeQuanAm({ quality: 'low', color: '#8f6c3c' }), { color: '#8f6c3c' });
    qa.position.set(STATUE.x, S + 4.0, STATUE.z);
    qa.scale.setScalar(8);
    scene.add(qa);
    plaque(scene, 'TƯỢNG PHẬT BÀ TÂY BỔ ĐÀ SƠN', STATUE.x, S + 1.6, STATUE.z + 6.9, 6.4, 0.8, 0, { size: 80 });
    K.roofs.push({ minX: STATUE.x - 7, maxX: STATUE.x + 7, minZ: STATUE.z - 7, maxZ: STATUE.z + 7, lift: 30 });
    for (const [x, z] of [[-18, 14], [18, -16], [-18, -16]]) K.stoneLamp(MT.x + x, S, MT.z + z);
    // mây trôi quanh sườn núi
    const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
    const clouds = [];
    for (let i = 0; i < 18; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cloudM);
      const a = (i / 18) * Math.PI * 2, r = 60 + K.rr() * 50;
      c.scale.set(14 + K.rr() * 14, 3 + K.rr() * 3, 9 + K.rr() * 8);
      c.userData = { a, r, y: 45 + K.rr() * 30, sp: 0.004 + K.rr() * 0.004 };
      scene.add(c);
      clouds.push(c);
    }
    updaters.push((t) => {
      for (const c of clouds) {
        const u = c.userData, a = u.a + t * u.sp;
        c.position.set(MT.x + Math.cos(a) * u.r, u.y, MT.z + Math.sin(a) * u.r);
      }
    });
  }

  const world = K.finish({ rituals: RITUALS });
  world.gotoHits = gotoHits;
  return world;
}

const PLACE_INFO = {
  ba: { title: 'Thắp nhang trong điện Bà', text: 'Bạn sẽ bước tới lư hương trước khám thờ Linh Sơn Thánh Mẫu trong chùa Bà, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Bà' },
  chan: { title: 'Thắp nhang dưới chân núi', text: 'Bạn sẽ bước tới lư hương đá trước chân bậc thang lên chùa Bà, chắp tay vái về phía núi rồi cắm nhang.', done: '' },
  dinh: { title: 'Thắp nhang trên đỉnh núi', text: 'Bạn sẽ bước tới lư hương đá trước tượng Phật Bà trên đỉnh núi, giữa mây trời, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật Bà' },
};

const onTop = (x, z) => Math.hypot(x - MT.x, z - MT.z) < MT.plateau + 4;
export const SITE = {
  id: 'baden',
  name: 'Núi Bà Đen',
  loading: 'Cáp treo đang chờ dưới chân núi',
  hint: 'lên bậc thang tới chùa Bà, hoặc ra ga cáp treo lên đỉnh núi',
  info: 'Núi Bà Đen ở Tây Ninh là ngọn núi cao nhất Nam Bộ. Lưng chừng núi có chùa Bà thờ Linh Sơn Thánh Mẫu; trên đỉnh núi có tượng Phật Bà Tây Bổ Đà Sơn bằng đồng rất lớn, đi cáp treo lên ngắm mây. (Dựng phỏng theo không khí, không phải bản sao; núi được thu nhỏ cho dễ đi.)',
  tips: [
    ['Cáp treo', 'Ra ga cáp treo bên phải sân chân núi, bấm nút “Đi cáp treo lên đỉnh” (hoặc chạm vào nhà ga). Trên đỉnh có ga để xuống lại.'],
    ['Thắp nhang', 'Trong chùa Bà thì thắp trước khám thờ; dưới chân núi thì ở lư hương đá trước bậc thang; trên đỉnh thì trước tượng Phật Bà.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 50, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), slopeY(x, z)),
  unreachable: 'Chỗ đó ở tầng khác — hãy đi cáp treo',
  placeOf(x, z) {
    if (onTop(x, z)) return 'dinh';
    if (inHall(HALL, x, z)) return 'ba';
    if (z < TER.z1 + 0.5) return 'ba';
    return 'chan';
  },
  defaultPlace: 'chan',
  PLACE_INFO,
  bowRy: (x, z) => (onTop(x, z) ? Math.atan2(STATUE.x - x, STATUE.z - z) : Math.PI),
  GOTOS: [
    { x: STATION.x - 3.6, z: STATION.z + 3.6, r: 4.5, label: 'Đi cáp treo lên đỉnh', msg: 'Cabin đang đưa bạn lên đỉnh núi…', done: 'Bạn đã lên tới đỉnh núi Bà Đen — tượng Phật Bà ở ngay trước mặt', to: { x: TOPST.x - 4, z: TOPST.z - 4, ry: Math.atan2(STATUE.x - TOPST.x, STATUE.z - TOPST.z) }, ms: 1800 },
    { x: TOPST.x - 3, z: TOPST.z - 3, r: 4.5, label: 'Đi cáp treo xuống chân núi', msg: 'Cabin đang đưa bạn xuống chân núi…', done: 'Bạn đã xuống tới chân núi', to: { x: STATION.x - 4, z: STATION.z + 5, ry: Math.PI }, ms: 1800 },
  ],
  PLACES: [
    { id: 'chan', name: 'Chân núi', x: 0, z: 50, ry: Math.PI },
    { id: 'ga', name: 'Ga cáp treo', x: STATION.x - 4, z: STATION.z + 5, ry: Math.PI },
    { id: 'ba', name: 'Chùa Bà', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'dinh', name: 'Đỉnh núi', x: 0, z: STATUE.z + 16, ry: Math.PI },
  ],
  MAP: {
    box: [-70, -245, 140, 308],
    font: 8,
    shapes: [
      { x: MT.x, z: MT.z, r: 175, c: 'm-tree' },
      { x: MT.x, z: MT.z, r: 52, c: 'm-rock' },
      { x0: MT.x - 24, x1: MT.x + 24, z0: MT.z - 24, z1: MT.z + 24, c: 'm-stone' },
      { x: STATUE.x, z: STATUE.z, r: 6.5, c: 'm-statue' },
      { x0: -46, x1: 46, z0: 8, z1: 60, c: 'm-stone' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: TER.z1, c: 'm-terrace' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.zTop, z1: STAIR.zBottom, c: 'm-stairs' },
      { x0: STATION.x - 3, x1: STATION.x + 3, z0: STATION.z - 3, z1: STATION.z + 3, c: 'm-hall' },
      { x0: TOPST.x - 3, x1: TOPST.x + 3, z0: TOPST.z - 3, z1: TOPST.z + 3, c: 'm-hall' },
    ],
    labels: [['chan', 0, 48, 'Chân núi'], ['ga', STATION.x + 4, STATION.z + 10, 'Cáp treo'], ['ba', 0, -46, 'Chùa Bà'], ['dinh', 0, MT.z - 30, 'Đỉnh núi']],
  },
  OV: { bounds: { x0: -70, x1: 70, z0: -240, z1: 60 }, dist: 230, y: 20 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 4, act: 'bow', say: 'lạy Bà' },
    { x: 0, z: 19.5, spread: 3, act: 'gassho', ry: Math.PI },
    { x: 0, z: STATUE.z + 13, spread: 5, act: 'bow', ry: Math.PI },
    { x: 14, z: MT.z + 20, spread: 4, ry: 0, say: 'Mây bay ngang chân luôn' },
    { x: -12, z: -36, spread: 6, ry: 0, say: 'Leo mỏi chân ghê' },
    { x: 20, z: 44, spread: 10, ry: Math.PI, say: 'Núi cao quá' },
  ],
  BOT_SPAWN: [[-30, 30, 14, 52], [-20, 20, -36, -32], [-18, 18, MT.z + 8, MT.z + 20]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Đi cáp treo lên đỉnh thôi', 'Tượng Phật Bà to quá', 'Trên này gió mát ghê', 'Leo bậc thang mỏi chân'],
  build,
};
