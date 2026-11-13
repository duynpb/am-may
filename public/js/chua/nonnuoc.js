// Chùa Linh Ứng Non Nước (Ngũ Hành Sơn, Đà Nẵng): chùa dưới chân núi đá cẩm thạch. Qua cổng tam quan là sân lát đá, bậc thang
// lên nền cao có chánh điện, bên trái là tháp nhỏ nhiều tầng, bên phải tượng Quan Âm trắng; xung quanh là những ngọn núi đá
// xám nhô lên giữa đồng bằng. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const GATE_Z = 42;
const YARD = { x0: -28, x1: 28, z0: 14, z1: 39 };
const T1 = { hx: 28, z0: -46, z1: 0, y: 7 };
const ST = { x0: -4.5, x1: 4.5, zBottom: 14, zTop: T1.z1, y0: 0, y1: T1.y };
const HALL = { x: 0, z0: -4, z1: -26, hx: 11, y: T1.y, plaque: 'LINH ỨNG TỰ', wallH: 6.2 };
const TOWER = { x: -21, z: -38, half: 2.8 };
const QA = { x: 21, z: -36, r: 3.2 };
const CENTER = { x: 0, z: 26 };

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 60),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, ST.zBottom - 0.6, GATE_Z - 4.4),
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.6),
  rect(-T1.hx + 1, T1.hx - 1, HALL.z0 + 0.6, T1.z1 - 0.6),
  rect(-T1.hx + 1, -HALL.hx - 1.2, T1.z0 + 0.8, T1.z1 - 0.6), rect(HALL.hx + 1.2, T1.hx - 1, T1.z0 + 0.8, T1.z1 - 0.6),
  rect(-T1.hx + 1, T1.hx - 1, T1.z0 + 0.8, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 2.0 },
  { x: QA.x, z: QA.z, r: QA.r + 0.6 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: T1.y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: T1.y + 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 6, z: ST.zTop } },
  { place: 'quanam', y: T1.y, stone: true, burner: { x: QA.x, z: QA.z + QA.r + 3.6 }, merit: { x: QA.x - 3.4, z: QA.z + QA.r + 3.4 }, face: { x: QA.x, y: T1.y + 4, z: QA.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(ST, x, z);
  if (s != null) return s;
  if (Math.abs(x) <= T1.hx && z >= T1.z0 && z <= T1.z1) return inHall(HALL, x, z) ? T1.y + 0.25 : T1.y;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6eaee0', skyBottom: '#ece7d8' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, lods } = K;
  const marble = std('#9d978c', { roughness: 0.95, flatShading: true });
  const marbleL = std('#b9b3a6', { roughness: 0.95, flatShading: true });

  // ---------- Đất, núi đá cẩm thạch Ngũ Hành Sơn ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#9ba76a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 62, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0 - 1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -140, [[0, 46], [28, 44], [60, 24], [95, 6], [130, -1]], { color: '#8d8a7d', clip: { x0: -52, x1: 52, z0: -50, z1: 64, floor: groundY } });
    hillAt = hy;
    // các ngọn núi đá nhô lên: nhiều khối đá chồng, ba bên chùa
    const peaks = [[-70, -20, 24, 40], [78, -10, 28, 48], [-96, 40, 20, 30], [100, 50, 22, 36], [-50, -90, 30, 50], [60, -96, 26, 44]];
    for (const [x, z, r, h] of peaks) {
      for (let k = 0; k < 4; k++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), k % 2 ? marble : marbleL);
        const s = r * (1 - k * 0.2);
        m.scale.set(s, h * (0.5 + k * 0.18) / 1.2, s * 0.9);
        m.position.set(x + (k - 1.5) * 3, h * 0.28 * (k + 1) * 0.7, z + (k % 2) * 4);
        m.rotation.y = k;
        m.castShadow = m.receiveShadow = true;
        scene.add(m);
      }
    }
    K.forest(K.scatter(-120, 120, -150, -50, 40).map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.1 });
    K.palms([[-40, 56], [40, 56], [-42, 30], [42, 30]]);
    // cửa hàng đá mỹ nghệ ven đường: tượng đá nhỏ
    for (let i = 0; i < 6; i++) {
      const g = group(-40 + i * 6, 0, 48, 0, { merge: false });
      box(1.4, 0.4, 1.4, M.stoneD, 0, 0.2, 0, { parent: g });
      mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.2 + (i % 3) * 0.3, 8), M.white, 0, 1.0, 0, { parent: g });
      mesh(new THREE.SphereGeometry(0.3, 8, 6), M.white, 0, 1.8 + (i % 3) * 0.3, 0, { parent: g });
    }
  }

  // ---------- Cổng, sân ----------
  K.gate3(0, GATE_Z, 'LINH ỨNG TỰ', { walls: 14, wall: std('#efe3c4') });
  for (const s of [-1, 1]) {
    box(0.6, 2.6, GATE_Z - YARD.z0 + 1, std('#efe3c4'), s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
    for (let z = 20; z <= 38; z += 6) K.lampPost(s * 12, 0, z);
    K.flagPole(s * 5, 0, 38, 8);
  }
  cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
  K.flowers([[-20, 34], [-18, 34], [20, 34], [18, 34]]);

  // ---------- Nền cao, bậc thang, chánh điện, tháp, tượng Quan Âm ----------
  terrace(-T1.hx, T1.hx, T1.z0, T1.z1, 0, T1.y, { side: std('#8d8574', { roughness: 1 }) });
  stairs({ ...ST, base: -0.4 });
  for (const s of [-1, 1]) {
    box(T1.hx - ST.x1 - 0.4, 0.8, 0.3, M.stone, s * (T1.hx + ST.x1 + 0.4) / 2, T1.y + 0.4, T1.z1 - 0.15);
    K.stoneLamp(s * 12, T1.y, -2);
  }
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.65);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: std('#efe3c4', { roughness: 0.8 }) });
  {
    const g = group(TOWER.x, T1.y, TOWER.z);
    box(TOWER.half * 2 + 2, 0.6, TOWER.half * 2 + 2, M.stone, 0, 0.3, 0, { parent: g });
    let y = 0.6, half = TOWER.half;
    for (let t = 0; t < 5; t++) {
      const h = t === 0 ? 3.2 : 2.4;
      box(half * 2, h, half * 2, M.wall, 0, y + h / 2, 0, { parent: g });
      y += h;
      curvedRoof(g, 0, y - 0.1, 0, half + 0.9, half + 0.9, 0.8, half * 0.55, { lift: 0.6 });
      y += 0.8;
      half -= 0.2;
    }
    mesh(new THREE.ConeGeometry(0.2, 2.2, 8), M.gold, 0, y + 1.1, 0, { parent: g });
    plaque(g, 'THÁP XÁ LỢI', 0, 2.0, TOWER.half + 0.08, 2.2, 0.45, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 4, maxX: TOWER.x + 4, minZ: TOWER.z - 4, maxZ: TOWER.z + 4, lift: 24 });
    // tượng Quan Âm trắng cao trên bệ sen
    cyl(QA.r, QA.r + 0.3, 1.2, M.white, QA.x, T1.y + 0.6, QA.z, {}, 24);
    cyl(QA.r - 0.8, QA.r - 0.5, 1.2, M.white, QA.x, T1.y + 1.8, QA.z, {}, 24);
    const qa = K.gild(makeQuanAm({ quality: 'low', stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
    qa.position.set(QA.x, T1.y + 2.4, QA.z);
    qa.scale.setScalar(5.2);
    scene.add(qa);
    plaque(scene, 'QUAN ÂM BỒ TÁT', QA.x, T1.y + 1.0, QA.z + QA.r + 0.15, 2.8, 0.5, 0, { size: 80 });
    K.roofs.push({ minX: QA.x - 4, maxX: QA.x + 4, minZ: QA.z - 4, maxZ: QA.z + 4, lift: 16 });
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'linhungnn',
  name: 'Chùa Linh Ứng Non Nước',
  loading: 'Núi đá cẩm thạch đang lên nắng',
  hint: 'qua cổng vào sân, lên bậc thang tới chánh điện, ngắm tháp và tượng Quan Âm giữa núi đá',
  info: 'Chùa Linh Ứng Non Nước ở Ngũ Hành Sơn, Đà Nẵng, nằm dưới chân núi đá cẩm thạch. Qua cổng tam quan là sân lát đá, bậc thang lên nền cao có chánh điện; bên trái là tháp nhỏ nhiều tầng, bên phải là tượng Quan Âm trắng; xung quanh là những ngọn núi đá xám nhô lên giữa đồng bằng. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân; trên nền cao thì trước tượng Quan Âm.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 54, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < T1.z1 + 0.5 && Math.hypot(x - QA.x, z - QA.z) < 14) return 'quanam';
    if (z < T1.z1 + 0.5) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
    quanam: { title: 'Thắp nhang trước tượng Quan Âm', text: 'Bạn sẽ bước tới lư hương đá trước tượng Quan Âm trắng trên nền cao, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Quan Âm Bồ Tát' },
  },
  bowRy: (x, z) => (z < T1.z1 && Math.hypot(x - QA.x, z - QA.z) < 14 ? Math.atan2(QA.x - x, QA.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 54, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 32, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'thap', name: 'Tháp xá lợi', x: TOWER.x, z: TOWER.z + TOWER.half + 5.5, ry: Math.PI },
    { id: 'quanam', name: 'Tượng Quan Âm', x: QA.x, z: QA.z + QA.r + 7, ry: Math.PI },
  ],
  MAP: {
    box: [-46, -52, 92, 120],
    font: 4.4,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 62, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -T1.hx, x1: T1.hx, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: TOWER.x, z: TOWER.z, r: TOWER.half, c: 'm-tower' },
      { x: QA.x, z: QA.z, r: QA.r, c: 'm-white' },
    ],
    labels: [['gate', 0, 54, 'Cổng tam quan'], ['san', 0, 30, 'Sân chùa'], ['dien', 0, -15, 'Chánh điện'], ['thap', TOWER.x, TOWER.z - 5, 'Tháp xá lợi'], ['quanam', QA.x, QA.z - 5, 'Quan Âm']],
  },
  OV: { bounds: { x0: -46, x1: 46, z0: -48, z1: 60 }, dist: 100 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: QA.x, z: QA.z + QA.r + 7, spread: 3, act: 'bow', ry: Math.PI },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: -14, z: -2, spread: 5, ry: 0, say: 'Núi đá xám đẹp quá' },
    { x: 0, z: 52, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-20, 20, 18, 38], [-22, 22, -10, -2]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Núi đá cẩm thạch đẹp ghê', 'Tượng Quan Âm trắng quá', 'Leo bậc thang mỏi chân', 'Cầu bình an cho cả nhà'],
  build,
};
