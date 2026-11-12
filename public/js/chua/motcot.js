// Chùa Một Cột (Hà Nội): ngôi điện gỗ nhỏ hình vuông đặt trên một cột đá giữa hồ sen vuông Linh Chiểu, như bông sen
// nở trên mặt nước; bậc gạch dẫn lên điện thờ Quan Âm. Phía sau là chùa Diên Hựu và cây bồ đề.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, stairY, hallWalk, inHall } from './base.js';
import { makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const POND = { x0: -7, x1: 7, z0: 1, z1: 15 }; // hồ Linh Chiểu
const PAV = { x: 0, z: 8, half: 1.8, y: 4.2 }; // điện trên cột
const ST = { x0: -0.8, x1: 0.8, zBottom: 16.2, zTop: PAV.z + PAV.half, y0: 0, y1: PAV.y };
const HALL = { x: 0, z0: -6, z1: -18, hx: 9, y: 0, plaque: 'DIÊN HỰU TỰ', wallH: 5.4 };
const BODHI = { x: 16, z: 6 };

const WALK_AREAS = [
  rect(-30, 30, POND.z1 + 0.8, 46), // sân trước hồ, quảng trường
  rect(-30, POND.x0 - 1, 0.2, 46), rect(POND.x1 + 1, 30, 0.2, 46), // hai bên hồ
  rect(-30, 30, HALL.z0 + 0.6, 0.2), // giữa hồ và chùa Diên Hựu
  rect(-30, -HALL.hx - 1.2, -24, 0.2), rect(HALL.hx + 1.2, 30, -24, 0.2),
  rect(-30, 30, -24, HALL.z1 - 1.4),
  ...hallWalk(HALL),
  rect(ST.x0 + 0.3, ST.x1 - 0.3, ST.zTop - 0.6, ST.zBottom + 0.6), // bậc gạch lên điện
  rect(PAV.x - PAV.half + 0.5, PAV.x + PAV.half - 0.5, PAV.z - PAV.half + 1.0, PAV.z + PAV.half - 0.2), // sàn điện trên cột
];
const ROUND_OBSTACLES = [{ x: BODHI.x, z: BODHI.z, r: 2.0 }];
const RITUALS = [
  { place: 'motcot', y: 0, stone: true, burner: { x: 3.4, z: 19.2 }, merit: { x: -3.4, z: 19.0 }, face: { x: PAV.x, y: PAV.y + 1.6, z: PAV.z } },
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

const onPav = (x, z) => Math.abs(x - PAV.x) <= PAV.half && Math.abs(z - PAV.z) <= PAV.half;
function groundY(x, z) {
  const s = stairY(ST, x, z);
  if (s != null && !onPav(x, z)) return s;
  if (onPav(x, z)) return PAV.y;
  if (inHall(HALL, x, z)) return 0.25;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7fb0d6', skyBottom: '#ebe7dc' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const brick = std('#a8553a', { roughness: 0.9 });

  // ---------- Quảng trường, sân, cây xanh ----------
  {
    const land = mesh(new THREE.BoxGeometry(500, 2, 500), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-32, 32, -26, 48, 0, 'slab', { tile: 5.5, macro: 0.05 });
    K.forest([[-40, 40], [-40, 20], [-40, 0], [-40, -20], [40, 40], [40, 20], [40, -20], [-26, -24], [26, -24], [-28, 44], [28, 44]], 0, { scale: 1.3 });
  }

  // ---------- Hồ Linh Chiểu: nước, sen, lan can gạch ----------
  {
    const P = POND;
    for (const z of [P.z0 - 0.3, P.z1 + 0.3]) {
      if (z > P.z1) { // chừa lối bậc gạch phía trước
        box((P.x1 - P.x0) / 2 - 1.2 + 0.6, 0.9, 0.5, brick, P.x0 - 0.3 + ((P.x1 - P.x0) / 2 - 0.6) / 2, 0.45, z);
        box((P.x1 - P.x0) / 2 - 1.2 + 0.6, 0.9, 0.5, brick, P.x1 + 0.3 - ((P.x1 - P.x0) / 2 - 0.6) / 2, 0.45, z);
      } else box(P.x1 - P.x0 + 1.1, 0.9, 0.5, brick, 0, 0.45, z);
    }
    for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.9, P.z1 - P.z0 + 1.1, brick, x, 0.45, (P.z0 + P.z1) / 2);
    K.water(P.x0, P.x1, P.z0, P.z1, 0.05, { color: '#3f7578' });
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (let i = 0; i < 40; i++) {
      const x = P.x0 + 0.8 + K.rr() * (P.x1 - P.x0 - 1.6), z = P.z0 + 0.8 + K.rr() * (P.z1 - P.z0 - 1.6);
      if (Math.abs(x - PAV.x) < 1.2 && Math.abs(z - PAV.z) < 1.2) continue;
      if (Math.abs(x) < 1.2 && z > PAV.z) continue;
      mesh(new THREE.CircleGeometry(0.4 + K.rr() * 0.25, 12).rotateX(-Math.PI / 2), pad, x, 0.08, z, { cast: false });
      if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.32, 7), pink, x + 0.18, 0.28, z);
    }
  }

  // ---------- Cột đá, điện gỗ vuông như bông sen, bậc gạch ----------
  {
    cyl(0.62, 0.62, PAV.y - 0.3, M.stone, PAV.x, (PAV.y - 0.3) / 2, PAV.z, {}, 20);
    // khung đỡ hình cánh sen dưới sàn điện
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const b = box(0.14, 0.14, 2.2, M.wood, PAV.x + Math.cos(a) * 0.9, PAV.y - 0.55, PAV.z + Math.sin(a) * 0.9);
      b.rotation.y = -a + Math.PI / 2;
      b.rotation.x = 0.55;
    }
    const g = group(PAV.x, PAV.y, PAV.z);
    box(PAV.half * 2 + 0.4, 0.22, PAV.half * 2 + 0.4, M.wood, 0, -0.11, 0, { parent: g });
    const floorM = mesh(new THREE.PlaneGeometry(PAV.half * 2, PAV.half * 2), std('#8a5a34', { roughness: 0.6 }), PAV.x, PAV.y + 0.005, PAV.z, { cast: false });
    floorM.rotation.x = -Math.PI / 2;
    floorM.userData.kind = 'ground';
    pickables.push(floorM);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.12, 0.13, 2.6, M.red, sx * (PAV.half - 0.15), 1.3, sz * (PAV.half - 0.15), { parent: g }, 10);
    box(PAV.half * 2 - 0.1, 0.12, 0.08, M.red, 0, 0.5, -PAV.half + 0.15, { parent: g }); // lan can
    for (const sx of [-1, 1]) box(0.08, 0.12, PAV.half * 2 - 0.1, M.red, sx * (PAV.half - 0.15), 0.5, 0, { parent: g });
    box(PAV.half * 2 + 0.2, 0.25, PAV.half * 2 + 0.2, M.red, 0, 2.7, 0, { parent: g });
    const top = curvedRoof(g, 0, 2.75, 0, PAV.half + 0.9, PAV.half + 0.9, 1.2, 1.55, { lift: 0.75 });
    // nóc mái nhỏ: búp sen vàng thay cho đôi rồng (rồng quá to so với mái)
    mesh(new THREE.SphereGeometry(0.22, 12, 10), M.gold, 0, top.yTop + 0.55, 0, { parent: g }).scale.y = 1.4;
    mesh(new THREE.ConeGeometry(0.08, 0.4, 8), M.gold, 0, top.yTop + 0.95, 0, { parent: g });
    plaque(g, 'LIÊN HOA ĐÀI', 0, 2.25, PAV.half - 0.1, 1.6, 0.34, 0, { size: 80 });
    K.roofs.push({ minX: PAV.x - 2.5, maxX: PAV.x + 2.5, minZ: PAV.z - 2.5, maxZ: PAV.z + 2.5, lift: 9 });
    // tượng Quan Âm thờ trong điện, mặt nhìn ra bậc gạch
    const qa = K.gild(makeQuanAm({ quality: 'low', color: '#f3c560' }), { color: '#f3c560' });
    qa.position.set(PAV.x, PAV.y + 0.3, PAV.z - PAV.half + 0.6);
    qa.scale.setScalar(0.5);
    scene.add(qa);
    box(0.9, 0.3, 0.6, M.lacquer, PAV.x, PAV.y + 0.15, PAV.z - PAV.half + 0.6);
    // bậc gạch
    K.stairs({ ...ST, base: -0.4 }, { mat: brick, rail: brick, railH: 0.6 });
  }

  // ---------- Chùa Diên Hựu, cây bồ đề ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.3);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { twoTier: false });
  {
    cyl(0.6, 0.9, 4.5, M.trunk, BODHI.x, 2.25, BODHI.z, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 7, 0, 4.2], [-3, 6, 1, 3], [3, 6.2, -1, 3.2], [0.5, 6.4, 3, 2.6]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, BODHI.x + dx, dy, BODHI.z + dz).scale.set(s, s * 0.7, s);
    cyl(1.6, 1.8, 0.4, M.stone, BODHI.x, 0.2, BODHI.z, {}, 20);
    plaque(scene, 'CÂY BỒ ĐỀ', BODHI.x, 1.0, BODHI.z + 1.8, 1.8, 0.4, 0, { size: 80 });
    for (const s of [-1, 1]) for (let z = 22; z <= 42; z += 10) K.lampPost(s * 10, 0, z);
    K.flagPole(-14, 0, 22, 8);
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'motcot',
  name: 'Chùa Một Cột',
  loading: 'Bông sen đá đang nở giữa hồ',
  hint: 'ngắm điện nhỏ trên một cột đá giữa hồ sen, lên bậc gạch vái Quan Âm',
  info: 'Chùa Một Cột ở Hà Nội là ngôi điện gỗ nhỏ hình vuông đặt trên một cột đá giữa hồ sen vuông Linh Chiểu, như bông sen nở trên mặt nước; bậc gạch dẫn lên điện thờ Quan Âm. Phía sau là chùa Diên Hựu và cây bồ đề. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Lên điện', 'Đi lên bậc gạch phía trước hồ để vào điện nhỏ trên cột, đứng trước tượng Quan Âm.'],
    ['Thắp nhang', 'Lư hương đá ở chân bậc gạch trước hồ; trong chùa Diên Hựu thì thắp trước bàn thờ Phật.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 40, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) || z < 0 ? 'dien' : 'motcot'),
  defaultPlace: 'motcot',
  PLACE_INFO: {
    motcot: { title: 'Thắp nhang trước chùa Một Cột', text: 'Bạn sẽ bước tới lư hương đá ở chân bậc gạch, hướng về điện thờ Quan Âm trên cột đá giữa hồ sen, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Quan Âm Bồ Tát' },
    dien: { title: 'Thắp nhang trong chùa Diên Hựu', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật trong chùa Diên Hựu, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
  },
  bowRy: (x, z) => (z > 0 ? Math.atan2(PAV.x - x, PAV.z - z) : Math.PI),
  PLACES: [
    { id: 'quang', name: 'Trước hồ sen', x: 0, z: 24, ry: Math.PI },
    { id: 'dien1cot', name: 'Điện trên cột', x: 0, z: PAV.z + 1.2, ry: Math.PI },
    { id: 'dienhuu', name: 'Chùa Diên Hựu', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'bode', name: 'Cây bồ đề', x: BODHI.x - 3, z: BODHI.z + 4, ry: Math.PI * 0.75 },
  ],
  MAP: {
    box: [-32, -26, 64, 74],
    font: 3.4,
    shapes: [
      { x0: -32, x1: 32, z0: -26, z1: 48, c: 'm-porch' },
      { x0: POND.x0, x1: POND.x1, z0: POND.z0, z1: POND.z1, c: 'm-water' },
      { x0: PAV.x - PAV.half, x1: PAV.x + PAV.half, z0: PAV.z - PAV.half, z1: PAV.z + PAV.half, c: 'm-hall' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: BODHI.x, z: BODHI.z, r: 3.5, c: 'm-tree' },
    ],
    labels: [['quang', 0, 24, 'Trước hồ sen'], ['dien1cot', 0, 4, 'Điện trên cột'], ['dienhuu', 0, -12, 'Chùa Diên Hựu'], ['bode', BODHI.x, BODHI.z - 4, 'Cây bồ đề']],
  },
  OV: { bounds: { x0: -32, x1: 32, z0: -26, z1: 46 }, dist: 70 },
  TRIPS: [
    { x: 0, z: 21.5, spread: 4, act: 'bow', say: 'lạy Mẹ Quan Âm' },
    { x: 0, z: PAV.z + 1.0, spread: 0.3, act: 'gassho', ry: Math.PI },
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: -12, z: 8, spread: 3, ry: Math.PI / 2, say: 'Như bông sen nở giữa hồ' },
    { x: 0, z: 36, spread: 16, ry: Math.PI },
  ],
  BOT_SPAWN: [[-20, 20, 18, 42], [-20, 20, -4, -1]],
  BOT_SAYS: ['Nam mô Quán Thế Âm Bồ Tát', 'Chùa nhỏ mà đẹp quá', 'Hồ sen nở rồi kìa', 'Đúng là chỉ có một cột', 'Cây bồ đề to ghê'],
  build,
};
