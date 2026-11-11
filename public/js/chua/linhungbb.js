// Chùa Linh Ứng Bãi Bụt (bán đảo Sơn Trà, Đà Nẵng): chùa trên sườn núi nhìn ra biển. Qua cổng tam quan là sân rộng,
// chánh điện bên trái, vườn mười tám vị La Hán bằng đá bên phải; ở mép sân sát vách đá là tượng Quan Âm trắng rất lớn
// đứng trên tòa sen, mặt hướng ra biển. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const GATE_Z = -30;
const HALL = { x: -24, z0: 4, z1: -12, hx: 10, y: 0, plaque: 'ĐẠI HÙNG BẢO ĐIỆN', wallH: 6 };
const QA = { x: 0, z: 19, r: 7.5 }; // bệ tượng Quan Âm
const EDGE = 35; // mép vách đá
const LAHAN = []; // 18 vị La Hán, hai hàng dọc lối vườn
for (let i = 0; i < 9; i++) for (const x of [21, 33]) LAHAN.push({ x, z: -22 + i * 3.4, ry: x < 27 ? Math.PI / 2 : -Math.PI / 2 });

const WALK_AREAS = [
  rect(-50, 50, -44, GATE_Z + 4.6), // đường núi trước cổng
  ...gateWalk(0, GATE_Z),
  rect(HALL.x + HALL.hx + 1.2, 40, GATE_Z + 4.4, EDGE - 1), // sân chính, vườn La Hán
  rect(-40, 40, HALL.z0 + 0.6, EDGE - 1), // sân trước chánh điện, dọc vách đá
  rect(-40, HALL.x - HALL.hx - 1.2, GATE_Z + 4.4, EDGE - 1),
  rect(-40, 40, GATE_Z + 4.4, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: QA.x, z: QA.z, r: QA.r + 0.8 },
  ...LAHAN.map((l) => ({ x: l.x, z: l.z, r: 1.0 })),
  { x: 27, z: 14, r: 2.4 }, // cây bồ đề
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: HALL.x, z: HALL.z1 + 3.8 }, merit: { x: HALL.x + HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: HALL.x, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'quanam', y: 0, stone: true, burner: { x: QA.x - 5, z: QA.z + QA.r + 3.0 }, merit: { x: QA.x + 4.6, z: QA.z + QA.r + 2.8 }, face: { x: QA.x, y: 20, z: QA.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#5d9fdc', skyBottom: '#e3edf0', fog: [220, 900], fogColor: 0xdde8ec });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables } = K;
  const white = std('#f4f1ea', { roughness: 0.6 });

  // ---------- Sườn núi, vách đá, biển ----------
  {
    const land = mesh(new THREE.BoxGeometry(600, 2, 300), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, EDGE - 150, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-44, 44, GATE_Z + 3, EDGE, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(-60, 60, -46, GATE_Z + 3, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e2dccf' });
    // vách đá đổ xuống biển, đá tảng dưới chân
    const rock = std('#6f6a5c', { roughness: 1, flatShading: true });
    box(600, 24, 3, rock, 0, -13.2, EDGE + 1.0, { cast: false }); // vách đá dựng đứng ngay dưới lan can
    // đá tảng gồ ghề phủ mặt vách và chân vách cho khỏi phẳng lì
    const rockG = std('#77705f', { roughness: 1, flatShading: true });
    for (let i = 0; i < 150; i++) {
      const sz = 1.6 + K.rr() * 3.6, x = -110 + K.rr() * 220, yy = -2.2 - K.rr() * 22;
      const r = mesh(new THREE.IcosahedronGeometry(sz, 0), i % 3 ? rock : rockG, x, yy, EDGE + 2.2 + K.rr() * 2.5 + (yy < -18 ? 4 : 0), { cast: false });
      r.scale.set(1.3, 0.8, 0.7);
      r.rotation.set(K.rr() * 3, K.rr() * 3, 0);
    }
    // lan can đá dọc mép vách
    box(88, 0.9, 0.35, M.stone, 0, 0.45, EDGE - 0.2);
    for (let x = -44; x <= 44; x += 2.2) cyl(0.12, 0.14, 1.0, M.stone, x, 0.5, EDGE - 0.2, {}, 8);
    K.water(-900, 900, EDGE + 4, EDGE + 900, -24, { color: '#3a7fa3' });
    // núi Sơn Trà phía sau
    makeHill(K, 0, -245, [[0, 60], [40, 58], [90, 34], [130, 14], [165, 2], [190, -1]]);
    K.forest([...K.scatter(-200, 200, -230, -60, 140), ...K.scatter(-120, -48, -60, 30, 30), ...K.scatter(48, 120, -60, 30, 30)].map(([x, z]) => {
      const r = Math.hypot(x, z + 245);
      const y = r < 40 ? 60 : r < 90 ? 58 - (r - 40) * 0.48 : r < 130 ? 34 - (r - 90) * 0.5 : r < 165 ? 14 - (r - 130) * 0.34 : 0;
      return [x, z, Math.max(0, y) - 0.3];
    }), 0, { scale: 1.2 });
  }

  // ---------- Cổng tam quan ----------
  K.gate3(0, GATE_Z, 'LINH ỨNG TỰ', { walls: 22, col: std('#b5361f', { roughness: 0.5 }) });
  for (const s of [-1, 1]) {
    K.lion(s * 4.2, 0, GATE_Z - 3.4);
    box(0.6, 2.6, 66, M.wall, s * 43.2, 1.3, GATE_Z + 33);
  }

  // ---------- Chánh điện ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(HALL.x, y, z);
    b.scale.setScalar(1.45);
    scene.add(b);
    K.lods.push({ obj: b, x: HALL.x, z });
  });

  // ---------- Tượng Quan Âm trắng trên tòa sen, quay ra biển ----------
  {
    const g = group(QA.x, 0, QA.z);
    cyl(QA.r, QA.r + 0.4, 1.4, white, 0, 0.7, 0, { parent: g }, 32);
    cyl(QA.r - 1.0, QA.r - 0.6, 3.2, white, 0, 3.0, 0, { parent: g }, 32);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const p = mesh(new THREE.SphereGeometry(1.4, 10, 8), white, Math.cos(a) * (QA.r - 1.4), 5.2, Math.sin(a) * (QA.r - 1.4), { parent: g });
      p.scale.set(0.6, 1.2, 0.3);
      p.rotation.y = -a + Math.PI / 2;
    }
    cyl(QA.r - 2.0, QA.r - 1.8, 0.8, white, 0, 5.6, 0, { parent: g }, 32);
    // cửa vào lòng bệ (điện thờ bên trong) nhìn ra biển
    box(2.2, 2.4, 0.1, std('#3a2418'), 0, 2.6, QA.r - 0.55, { parent: g, cast: false });
    plaque(g, 'QUÁN THẾ ÂM BỒ TÁT', 0, 4.2, QA.r - 0.5, 4.2, 0.7, 0, { size: 80 });
    const qa = K.gild(makeQuanAm({ quality: 'low', stone: '#f6f3ec' }), { color: '#f6f3ec', stone: true });
    qa.position.set(QA.x, 6.0, QA.z);
    qa.scale.setScalar(11);
    scene.add(qa);
    K.roofs.push({ minX: QA.x - QA.r, maxX: QA.x + QA.r, minZ: QA.z - QA.r, maxZ: QA.z + QA.r, lift: 40 });
  }

  // ---------- Vườn La Hán: mười tám tượng đá, cây bồ đề ----------
  {
    const stoneM = std('#cfc8b8', { roughness: 0.85 });
    for (const l of LAHAN) {
      const g = group(l.x, 0, l.z, l.ry);
      box(1.4, 0.5, 1.4, M.stoneD, 0, 0.25, 0, { parent: g });
      mesh(new THREE.SphereGeometry(0.62, 12, 10), stoneM, 0, 0.85, 0, { parent: g }).scale.set(1.25, 0.55, 1.05);
      mesh(new THREE.CylinderGeometry(0.34, 0.55, 1.0, 12), stoneM, 0, 1.4, 0, { parent: g });
      mesh(new THREE.SphereGeometry(0.28, 12, 10), stoneM, 0, 2.15, 0.02, { parent: g });
      mesh(new THREE.SphereGeometry(0.2, 10, 8), stoneM, 0, 1.45, 0.42, { parent: g }).scale.set(1.3, 0.8, 0.8); // tay
    }
    cyl(0.5, 0.8, 4, M.trunk, 27, 2, 14, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 6, 0, 3.8], [-2.4, 5, 1, 2.5], [2.4, 5.2, -0.8, 2.6], [0.4, 5.4, 2, 2.2]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, 27 + dx, dy, 14 + dz).scale.set(s, s * 0.7, s);
    plaque(scene, 'VƯỜN LA HÁN', 27, 2.2, -25.4, 3.2, 0.6, 0, { size: 90 });
    K.flowers(K.scatter(-38, -16, 8, 32, 26));
    K.palms([[-38, 30], [38, 30], [-38, -20], [38, -26]]);
    for (const s of [-1, 1]) K.flagPole(s * 6, 0, GATE_Z + 6, 8);
    for (let z = -20; z <= 2; z += 6) { K.lampPost(-8, 0, z); K.lampPost(8, 0, z); }
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'linhungbb',
  name: 'Chùa Linh Ứng Bãi Bụt',
  loading: 'Gió biển Sơn Trà đang thổi',
  hint: 'qua cổng tam quan, ra mép vách đá chiêm bái tượng Quan Âm nhìn ra biển',
  info: 'Chùa Linh Ứng Bãi Bụt nằm trên bán đảo Sơn Trà, Đà Nẵng, nhìn ra biển. Ở mép sân sát vách đá là tượng Quan Âm màu trắng rất lớn đứng trên tòa sen, mặt hướng ra biển, như che chở cho người đi biển; bên trái là chánh điện, bên phải là vườn mười tám vị La Hán bằng đá. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Tượng Quan Âm', 'Đi vòng ra phía trước tượng, sát lan can vách đá, để thấy mặt tượng hướng ra biển.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá trước tượng Quan Âm.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: -38, ry: 0 },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'quanam'),
  defaultPlace: 'quanam',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    quanam: { title: 'Thắp nhang trước tượng Quan Âm', text: 'Bạn sẽ bước tới lư hương đá trước tượng Quan Âm trắng bên vách đá, chắp tay vái lạy rồi cắm nhang, nguyện cho người đi biển bình an.', done: ' dâng Quan Âm Bồ Tát' },
  },
  bowRy: (x, z) => (Math.hypot(x - QA.x, z - QA.z) < 22 ? Math.atan2(QA.x - x, QA.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: -38, ry: 0 },
    { id: 'quanam', name: 'Tượng Quan Âm', x: -3, z: 32, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: HALL.x, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'lahan', name: 'Vườn La Hán', x: 27, z: -10, ry: 0 },
    { id: 'bien', name: 'Ngắm biển', x: 24, z: 33, ry: 0 },
  ],
  MAP: {
    box: [-46, -48, 92, 92],
    font: 4,
    shapes: [
      { x0: -46, x1: 46, z0: EDGE + 1, z1: 44, c: 'm-water' },
      { x0: -44, x1: 44, z0: GATE_Z + 3, z1: EDGE, c: 'm-porch' },
      { x0: -46, x1: 46, z0: -46, z1: GATE_Z + 3, c: 'm-stone' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: HALL.x - HALL.hx, x1: HALL.x + HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: QA.x, z: QA.z, r: QA.r, c: 'm-white' },
      ...LAHAN.map((l) => ({ x: l.x, z: l.z, r: 0.8, c: 'm-white' })),
      { x: 27, z: 14, r: 3, c: 'm-tree' },
    ],
    labels: [['gate', 0, -38, 'Cổng tam quan'], ['quanam', 0, 30, 'Tượng Quan Âm'], ['dien', HALL.x, -4, 'Chánh điện'], ['lahan', 27, -26, 'Vườn La Hán'], ['bien', 26, 40, 'Biển']],
  },
  OV: { bounds: { x0: -46, x1: 46, z0: -46, z1: 44 }, dist: 110 },
  TRIPS: [
    { x: QA.x - 5, z: QA.z + QA.r + 5.5, spread: 6, act: 'bow', say: 'lạy Mẹ Quan Âm' },
    { x: HALL.x, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 27, z: -6, spread: 3, ry: 0, say: 'Các vị La Hán sống động quá' },
    { x: 20, z: 33, spread: 14, ry: 0, say: 'Biển xanh quá' },
    { x: -26, z: 20, spread: 8, ry: Math.PI },
  ],
  BOT_SPAWN: [[-20, 20, -24, 0], [10, 34, 26, 33]],
  BOT_SAYS: ['Nam mô Quán Thế Âm Bồ Tát', 'Tượng Quan Âm cao quá', 'Đứng đây nhìn thấy cả biển', 'Gió biển mát ghê', 'Mười tám vị La Hán'],
  build,
};
