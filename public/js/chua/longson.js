// Chùa Long Sơn (Nha Trang): chánh điện dưới chân đồi Trại Thủy, mái gắn rồng khảm sành sứ; bậc thang bên phải đưa lên
// nền giữa có tượng Phật nằm bằng đá trắng, lên nữa tới đỉnh đồi là tượng Kim Thân Phật Tổ — Phật Thích Ca ngồi thiền
// màu trắng trên tòa sen, nhìn xuống thành phố. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa, loadRecliningBuddha, RELIEF_NAM } from '../buddha.js';

const GATE_Z = 40;
const HALL = { x: 0, z0: 6, z1: -10, hx: 12, y: 0, plaque: 'LONG SƠN TỰ', wallH: 6 };
const T1 = { x0: 8, x1: 40, z0: -34, z1: -14, y: 7 }; // nền Phật nằm
const T2 = { x0: -16, x1: 30, z0: -80, z1: -52, y: 16 }; // đỉnh đồi: Kim Thân Phật Tổ
const ST1 = { x0: 18, x1: 24, zBottom: 6, zTop: T1.z1, y0: 0, y1: T1.y };
const ST2 = { x0: 9.5, x1: 14.5, zBottom: T1.z0, zTop: T2.z1, y0: T1.y, y1: T2.y };
const NAM = { x: 27, z: -31, len: 16 }; // tượng Phật nằm
const KT = { x: 6, z: -68, r: 7 }; // bệ Kim Thân Phật Tổ

const WALK_AREAS = [
  rect(-40, 40, GATE_Z + 3.2, 56), // phố trước cổng
  ...gateWalk(0, GATE_Z),
  rect(-30, 30, HALL.z0 + 0.6, GATE_Z - 4.4), // sân trước chánh điện
  rect(-30, -HALL.hx - 1.2, -13.3, GATE_Z - 4.4), rect(HALL.hx + 1.2, ST1.x0 - 0.8, -13.3, GATE_Z - 4.4), rect(ST1.x1 + 0.8, 30, -13.3, GATE_Z - 4.4),
  rect(-30, ST1.x0 - 0.8, -13.3, HALL.z1 - 1.4), // sau chánh điện
  ...hallWalk(HALL),
  rect(ST1.x0 + 0.8, ST1.x1 - 0.8, ST1.zTop - 0.8, ST1.zBottom + 0.8),
  rect(T1.x0 + 1, T1.x1 - 1, NAM.z + 4.2, T1.z1 - 0.6), // nền Phật nằm (trước tượng)
  rect(T1.x0 + 1, ST2.x1 + 0.7, T1.z0 + 0.8, T1.z1 - 0.6), // lối sang bậc thang lên đỉnh
  rect(ST2.x0 + 0.8, ST2.x1 - 0.8, ST2.zTop - 0.8, ST2.zBottom + 1.2),
  rect(T2.x0 + 1, T2.x1 - 1, T2.z0 + 1, T2.z1 - 0.6),
];
const ROUND_OBSTACLES = [{ x: KT.x, z: KT.z, r: KT.r + 0.6 }];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'nam', y: T1.y, stone: true, burner: { x: NAM.x, z: NAM.z + 6.4 }, merit: { x: NAM.x + 3.6, z: NAM.z + 6.2 }, face: { x: NAM.x, y: T1.y + 2, z: NAM.z } },
  { place: 'kimthan', y: T2.y, stone: true, burner: { x: KT.x, z: KT.z + KT.r + 3.2 }, merit: { x: KT.x + 3.6, z: KT.z + KT.r + 3.0 }, face: { x: KT.x, y: T2.y + 12, z: KT.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

const HILL = [[0, 22], [26, 22], [60, 12], [100, 4], [140, 0.3], [170, -1]];
function groundY(x, z) {
  for (const S of [ST1, ST2]) {
    const s = stairY(S, x, z);
    if (s != null) return s;
  }
  if (x >= T2.x0 && x <= T2.x1 && z >= T2.z0 && z <= T2.z1) return T2.y;
  if (x >= T1.x0 && x <= T1.x1 && z >= T1.z0 && z <= T1.z1) return T1.y;
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#62a4dc', skyBottom: '#e8ecea' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables } = K;
  const white = std('#f4f1ea', { roughness: 0.6 });
  const hillY = (x, z) => {
    const r = Math.hypot(x - 6, z + 150);
    return r < 26 ? 22 : r < 60 ? 22 - (r - 26) * 0.29 : r < 100 ? 12 - (r - 60) * 0.2 : r < 140 ? 4 - (r - 100) * 0.09 : 0;
  };

  // ---------- Phố, sân, đồi Trại Thủy ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -50, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-44, 44, GATE_Z + 3, 58, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e2dccf' });
    floor(-32, 32, -14, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const shop = [std('#e7d8bd'), std('#d4c09c'), std('#efe3cf')];
    for (let i = 0; i < 20; i++) {
      const h = 7 + ((i * 41) % 8);
      box(9.4, h, 10, shop[i % 3], -95 + i * 10, h / 2, 68, { cast: false });
    }
    makeHill(K, 6, -150, HILL);
    K.forest([...K.scatter(-140, 150, -260, -84, 120), ...K.scatter(-110, -20, -84, -14, 40), ...K.scatter(44, 140, -84, 20, 40)].map(([x, z]) => [x, z, hillY(x, z) - 0.3]), 0, { scale: 1.2 });
  }

  // ---------- Cổng, chánh điện mái rồng khảm sành ----------
  K.gate3(0, GATE_Z, 'LONG SƠN TỰ', { walls: 20 });
  for (const s of [-1, 1]) box(0.6, 2.6, 56, M.wall, s * 31.4, 1.3, GATE_Z - 26);
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.55);
    scene.add(b);
    K.lods.push({ obj: b, z });
  });
  // rồng khảm sành sứ uốn trên bờ mái chánh điện
  {
    const glaze = std('#3f9a6e', { roughness: 0.35, metalness: 0.2 });
    for (const s of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(s * (2 + k * 0.55), 12.2 + Math.sin(k * 0.9) * 0.6 - k * 0.12, HALL.z0 - 6 + Math.cos(k * 0.7) * 0.3));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.28, 8), glaze);
      mesh(new THREE.SphereGeometry(0.5, 10, 8), glaze, s * 2, 12.5, HALL.z0 - 6);
    }
  }
  for (const s of [-1, 1]) {
    for (let z = 12; z <= 34; z += 8) K.lampPost(s * 7, 0, z);
    K.flagPole(s * 4, 0, 34, 8);
  }
  K.palms([[-26, 30], [26, 30], [-26, 14], [-18, 34], [18, 34]]);
  K.flowers(K.scatter(-28, -15, 8, 32, 14));

  // ---------- Bậc thang, nền Phật nằm ----------
  {
    stairs({ ...ST1, base: -0.5 });
    terrace(T1.x0, T1.x1, T1.z0, T1.z1, 0, T1.y, { side: std('#a59a86', { roughness: 1 }) });
    stairs({ ...ST2, base: -0.5 });
    terrace(T2.x0, T2.x1, T2.z0, T2.z1, 0, T2.y, { side: std('#a59a86', { roughness: 1 }) });
    // bệ và vách sau lưng tượng Phật nằm
    const S = NAM.len / RELIEF_NAM.length;
    box(NAM.len + 1.6, 0.8, RELIEF_NAM.depth * S + 1.6, M.stone, NAM.x, T1.y + 0.4, NAM.z);
    box(NAM.len + 2.4, 5.2, 0.8, std('#8d8574', { roughness: 1 }), NAM.x, T1.y + 2.6, T1.z0 + 0.6);
    loadRecliningBuddha().then((m) => {
      const t = m.clone();
      t.scale.setScalar(S);
      t.position.set(NAM.x, T1.y + 0.82, NAM.z);
      t.castShadow = t.receiveShadow = true;
      scene.add(t);
    }).catch((e) => console.warn('Không nạp được tượng Phật nằm', e));
    plaque(scene, 'PHẬT NHẬP NIẾT BÀN', NAM.x, T1.y + 0.4, NAM.z + RELIEF_NAM.depth * S / 2 + 0.85, 3.6, 0.5, 0, { size: 80 });
    // lan can mép trước hai nền (chừa chỗ bậc thang)
    box(ST1.x0 - T1.x0 - 0.4, 0.8, 0.3, M.stone, (T1.x0 + ST1.x0 - 0.4) / 2, T1.y + 0.4, T1.z1 - 0.15);
    box(T1.x1 - ST1.x1 - 0.4, 0.8, 0.3, M.stone, (T1.x1 + ST1.x1 + 0.4) / 2, T1.y + 0.4, T1.z1 - 0.15);
    box(ST2.x0 - T2.x0 - 0.4, 0.8, 0.3, M.stone, (T2.x0 + ST2.x0 - 0.4) / 2, T2.y + 0.4, T2.z1 - 0.15);
    box(T2.x1 - ST2.x1 - 0.4, 0.8, 0.3, M.stone, (T2.x1 + ST2.x1 + 0.4) / 2, T2.y + 0.4, T2.z1 - 0.15);
  }

  // ---------- Đỉnh đồi: tòa sen, tượng Kim Thân Phật Tổ trắng ----------
  {
    const g = group(KT.x, T2.y, KT.z);
    cyl(KT.r, KT.r + 0.3, 1.6, white, 0, 0.8, 0, { parent: g }, 32);
    cyl(KT.r - 1.2, KT.r - 0.9, 2.4, white, 0, 2.8, 0, { parent: g }, 32);
    // bảy vị Bồ Tát quanh bệ (tượng đắp nổi giản lược)
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * (0.15 + (0.7 * k) / 6);
      const x = Math.cos(a) * (KT.r - 0.6), z = Math.sin(a) * (KT.r - 0.6);
      const f = group(KT.x + x, T2.y + 1.6, KT.z + z, Math.atan2(x, z));
      mesh(new THREE.CylinderGeometry(0.22, 0.35, 1.0, 10), white, 0, 0.5, 0, { parent: f });
      mesh(new THREE.SphereGeometry(0.2, 10, 8), white, 0, 1.2, 0, { parent: f });
    }
    const b = K.gild(makeThichCa({ stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
    b.position.set(KT.x, T2.y + 4.0, KT.z);
    b.scale.setScalar(4.4);
    scene.add(b);
    plaque(scene, 'KIM THÂN PHẬT TỔ', KT.x, T2.y + 2.4, KT.z + KT.r - 0.7, 3.6, 0.6, 0, { size: 90 });
    K.roofs.push({ minX: KT.x - KT.r, maxX: KT.x + KT.r, minZ: KT.z - KT.r, maxZ: KT.z + KT.r, lift: 22 });
    for (const s of [-1, 1]) K.flagPole(KT.x + s * 8, T2.y, T2.z1 - 2, 7);
    K.forest([[-12, -56], [26, -56], [-12, -76], [26, -76]], T2.y);
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'longson',
  name: 'Chùa Long Sơn',
  loading: 'Đang lên đồi Trại Thủy',
  hint: 'vào chánh điện, rồi theo bậc thang bên phải lên tượng Phật nằm và tượng Kim Thân Phật Tổ trên đỉnh đồi',
  info: 'Chùa Long Sơn ở Nha Trang, dưới chân đồi Trại Thủy. Chánh điện có mái gắn rồng khảm sành sứ; theo bậc thang lên đồi sẽ gặp tượng Phật nằm bằng đá trắng, rồi tới đỉnh đồi là tượng Kim Thân Phật Tổ — Phật Thích Ca ngồi thiền màu trắng trên tòa sen, quanh bệ có bảy vị Bồ Tát. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Lên đỉnh đồi', 'Đi bậc thang bên phải chánh điện lên nền Phật nằm, rẽ trái theo bậc thang thứ hai lên đỉnh.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ở nền giữa thì trước tượng Phật nằm; trên đỉnh thì trước tượng Kim Thân Phật Tổ.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 49, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => {
    const r = Math.hypot(x - 6, z + 150);
    const h = r < 26 ? 22 : r < 60 ? 22 - (r - 26) * 0.29 : r < 100 ? 12 - (r - 60) * 0.2 : r < 140 ? 4 - (r - 100) * 0.09 : 0;
    return Math.max(groundY(x, z), h);
  },
  placeOf(x, z) {
    if (z < T2.z1 + 0.5) return 'kimthan';
    if (x > T1.x0 - 1 && z < T1.z1 + 0.5 && z > T1.z0 - 1) return 'nam';
    return 'dien';
  },
  defaultPlace: 'dien',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    nam: { title: 'Thắp nhang trước tượng Phật nằm', text: 'Bạn sẽ bước tới lư hương đá trước tượng Phật nhập Niết Bàn, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
    kimthan: { title: 'Thắp nhang trước Kim Thân Phật Tổ', text: 'Bạn sẽ bước tới lư hương đá dưới chân tượng Kim Thân Phật Tổ trên đỉnh đồi, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
  },
  bowRy: (x, z) => (z < T2.z1 + 0.5 ? Math.atan2(KT.x - x, KT.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 49, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'nam', name: 'Phật nằm', x: NAM.x, z: -21, ry: Math.PI },
    { id: 'kimthan', name: 'Kim Thân Phật Tổ', x: KT.x, z: -55, ry: Math.PI },
    { id: 'view', name: 'Ngắm thành phố', x: -10, z: -54, ry: 0 },
  ],
  MAP: {
    box: [-42, -84, 84, 142],
    font: 4.4,
    shapes: [
      { x0: -44, x1: 44, z0: GATE_Z + 3, z1: 58, c: 'm-stone' },
      { x0: -32, x1: 32, z0: -14, z1: GATE_Z + 3, c: 'm-porch' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: T1.x0, x1: T1.x1, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: T2.x0, x1: T2.x1, z0: T2.z0, z1: T2.z1, c: 'm-terrace' },
      { x0: ST1.x0, x1: ST1.x1, z0: ST1.zTop, z1: ST1.zBottom, c: 'm-stairs' },
      { x0: ST2.x0, x1: ST2.x1, z0: ST2.zTop, z1: ST2.zBottom, c: 'm-stairs' },
      { x0: NAM.x - NAM.len / 2, x1: NAM.x + NAM.len / 2, z0: NAM.z - 2, z1: NAM.z + 2, c: 'm-white' },
      { x: KT.x, z: KT.z, r: KT.r, c: 'm-white' },
    ],
    labels: [['gate', 0, 50, 'Cổng chùa'], ['dien', 0, -2, 'Chánh điện'], ['nam', NAM.x, -24, 'Phật nằm'], ['kimthan', KT.x, -58, 'Kim Thân Phật Tổ']],
  },
  OV: { bounds: { x0: -42, x1: 42, z0: -82, z1: 56 }, dist: 130, y: 5 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: NAM.x, z: NAM.z + 9, spread: 4, act: 'bow' },
    { x: KT.x, z: KT.z + KT.r + 6, spread: 5, act: 'bow', say: 'lạy Phật' },
    { x: -10, z: -54, spread: 4, ry: 0, say: 'Nhìn thấy cả Nha Trang' },
    { x: 0, z: 28, spread: 14, ry: 0 },
  ],
  BOT_SPAWN: [[-20, 20, 12, 34], [10, 36, -22, -16], [-12, 26, -60, -54]],
  BOT_SAYS: ['Nam mô Bổn Sư Thích Ca Mâu Ni Phật', 'Rồng trên mái đẹp quá', 'Tượng Phật nằm hiền từ ghê', 'Leo bậc thang mỏi chân', 'Trên đỉnh nhìn xa quá'],
  build,
};
