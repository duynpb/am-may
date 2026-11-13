// Việt Nam Quốc Tự (quận 10, TP. Hồ Chí Minh): ngôi chùa lớn xây theo lối hiện đại, mang tính quốc tự. Qua cổng tam quan là sân
// rộng với hai hồ sen hai bên lối giữa, tượng Quan Âm trắng bên hồ; bậc thang rộng lên nền cao có chánh điện đồ sộ ba tầng mái,
// phía sau là nhà Tổ. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const GATE_Z = 56;
const YARD = { x0: -36, x1: 36, z0: 14, z1: 53 };
const T1 = { hx: 40, z0: -56, z1: 2, y: 5 };
const ST = { x0: -6, x1: 6, zBottom: 14, zTop: T1.z1, y0: 0, y1: T1.y };
const HALL = { x: 0, z0: -2, z1: -28, hx: 20, y: T1.y, plaque: 'VIỆT NAM QUỐC TỰ', wallH: 8 };
const TO = { x: 0, z0: -34, z1: -48, hx: 10, y: T1.y, plaque: 'TỔ ĐƯỜNG', wallH: 5.2 };
const PL = { x0: -30, x1: -8, z0: 22, z1: 42 }; // hồ sen trái
const PR = { x0: 8, x1: 30, z0: 22, z1: 42 }; // hồ sen phải
const QA = { x: -19, z: 17, r: 2.4 }; // tượng Quan Âm bên hồ
const CENTER = { x: 0, z: 48 };

const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 74),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, PL.z1 + 1.2, GATE_Z - 4.4), // dải trước hai hồ
  rect(YARD.x0 + 1, PL.x0 - 1.4, ST.zBottom - 0.6, PL.z1 + 1.6), rect(PR.x1 + 1.4, YARD.x1 - 1, ST.zBottom - 0.6, PL.z1 + 1.6), // hai bên hồ
  rect(PL.x1 + 1.5, PR.x0 - 1.5, ST.zBottom - 0.6, PL.z1 + 1.6), // lối giữa
  rect(YARD.x0 + 1, YARD.x1 - 1, ST.zBottom - 0.6, PL.z0 - 1.4), // dải sau hai hồ, trước bậc thang
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.6),
  rect(-T1.hx + 1, T1.hx - 1, HALL.z0 + 0.6, T1.z1 - 0.6),
  rect(-T1.hx + 1, -HALL.hx - 1.2, T1.z0 + 0.8, T1.z1 - 0.6), rect(HALL.hx + 1.2, T1.hx - 1, T1.z0 + 0.8, T1.z1 - 0.6),
  rect(-T1.hx + 1, T1.hx - 1, TO.z0 + 0.6, HALL.z1 - 1.4),
  rect(-T1.hx + 1, T1.hx - 1, T1.z0 + 0.8, TO.z1 - 1.4),
  ...hallWalk(HALL),
  ...hallWalk(TO),
];
const ROUND_OBSTACLES = [
  { x: QA.x, z: QA.z, r: QA.r + 0.4 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: T1.y + 0.25, burner: { x: 0, z: HALL.z1 + 4.4 }, merit: { x: HALL.hx - 3.4, z: HALL.z1 + 4.2 }, face: { x: 0, y: T1.y + 4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 5, z: ST.zTop } },
  { place: 'to', y: T1.y + 0.25, burner: { x: 0, z: TO.z1 + 3.6 }, merit: { x: TO.hx - 2.6, z: TO.z1 + 3.4 }, face: { x: 0, y: T1.y + 2.6, z: TO.z1 + 1.7 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(ST, x, z);
  if (s != null) return s;
  if (Math.abs(x) <= T1.hx && z >= T1.z0 && z <= T1.z1) return inHall(HALL, x, z) || inHall(TO, x, z) ? T1.y + 0.25 : T1.y;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#76aedb', skyBottom: '#ece5d2' });
  const { scene, M, std, mesh, box, cyl, floor, terrace, stairs, plaque, pickables, lods } = K;
  const creamW = std('#efe3c4', { roughness: 0.8 });

  // ---------- Phố, nhà cao, tường ----------
  {
    const land = mesh(new THREE.BoxGeometry(600, 2, 600), [M.stoneD, M.stoneD, std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 76, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    const road = mesh(new THREE.PlaneGeometry(320, 10), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 81, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -150; x < 150; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 81, { cast: false });
    floor(YARD.x0, YARD.x1, YARD.z0 - 1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const bld = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888'), std('#cfd4d8')];
    for (let i = 0; i < 24; i++) {
      const x = -115 + i * 10, h = 12 + ((i * 37) % 16);
      box(9.4, h, 10, bld[i % 5], x, h / 2, 92, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {
      const h = 12 + ((i * 53) % 14);
      box(12, h, 11, bld[(i + 2) % 5], s * (46 + (i % 2) * 12), h / 2, 50 - i * 12, { cast: false });
    }
  }

  // ---------- Cổng, tường bao, hai hồ sen, tượng Quan Âm ----------
  K.gate3(0, GATE_Z, 'VIỆT NAM QUỐC TỰ', { walls: 20, wall: creamW });
  for (const s of [-1, 1]) {
    box(0.6, 2.8, GATE_Z - YARD.z0 + 1, creamW, s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  {
    for (const P of [PL, PR]) {
      for (const z of [P.z0 - 0.3, P.z1 + 0.3]) box(P.x1 - P.x0 + 1.1, 0.8, 0.5, M.stone, (P.x0 + P.x1) / 2, 0.4, z);
      for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.8, P.z1 - P.z0 + 1.1, M.stone, x, 0.4, (P.z0 + P.z1) / 2);
      K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: '#3f7578' });
      const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
      for (let i = 0; i < 24; i++) {
        const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
        mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
        if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
      }
    }
    // tượng Quan Âm trắng trên bệ sen bên hồ trái
    cyl(QA.r, QA.r + 0.3, 1.2, M.white, QA.x, 0.6, QA.z, {}, 24);
    const qa = K.gild(makeQuanAm({ quality: 'low', stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
    qa.position.set(QA.x, 1.2, QA.z);
    qa.scale.setScalar(2.4);
    scene.add(qa);
    plaque(scene, 'QUAN ÂM BỒ TÁT', QA.x, 0.7, QA.z + QA.r + 0.2, 2.4, 0.45, 0, { size: 80 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 18; z <= 50; z += 8) K.lampPost(s * 34, 0, z);
      K.flagPole(s * 5, 0, 52, 8);
    }
    K.palms([[-44, 62], [44, 62], [-44, 40], [44, 40]]);
  }

  // ---------- Nền cao, bậc thang rộng, chánh điện ba tầng mái, nhà Tổ ----------
  {
    terrace(-T1.hx, T1.hx, T1.z0, T1.z1, 0, T1.y, { side: std('#a59a86', { roughness: 1 }) });
    stairs({ ...ST, base: -0.4 });
    for (const s of [-1, 1]) {
      box(T1.hx - ST.x1 - 0.4, 0.9, 0.3, M.stone, s * (T1.hx + ST.x1 + 0.4) / 2, T1.y + 0.45, T1.z1 - 0.15);
      K.stoneLamp(s * 26, T1.y, 0);
    }
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z - 0.2);
      b.scale.setScalar(2.3);
      scene.add(b);
      lods.push({ obj: b, z, r: 90 });
    }, { wallMat: creamW, light: 14 });
    K.hall(TO, (y, z) => {
      for (const x of [-3, 0, 3]) {
        box(1.4, 1.9, 0.12, M.lacquer, x, y + 0.95, z - 0.4);
        box(1.2, 1.7, 0.02, std('#e9dcc0'), x, y + 0.95, z - 0.33, { cast: false });
      }
    }, { twoTier: false, wallMat: creamW, light: 7 });
    K.forest([[-36, -20], [36, -20], [-36, -50], [36, -50]].map(([x, z]) => [x, z, T1.y]), 0, { scale: 1.1 });
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'vnquoctu',
  name: 'Việt Nam Quốc Tự',
  loading: 'Hai hồ sen đang đón nắng sớm',
  hint: 'qua sân hồ sen và tượng Quan Âm, lên bậc thang rộng tới chánh điện ba tầng mái',
  info: 'Việt Nam Quốc Tự ở quận 10, TP. Hồ Chí Minh là ngôi chùa lớn xây theo lối hiện đại, mang tính quốc tự. Qua cổng tam quan là sân rộng với hai hồ sen hai bên lối giữa và tượng Quan Âm trắng bên hồ; bậc thang rộng lên nền cao có chánh điện đồ sộ ba tầng mái, phía sau là nhà Tổ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện và nhà Tổ thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân trước.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 66, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (z < TO.z0 + 1) return 'to';
    if (z < T1.z1 + 0.5) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân trước', text: 'Bạn sẽ bước tới lư hương đá giữa sân trước chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
    to: { title: 'Thắp nhang trong nhà Tổ', text: 'Bạn sẽ bước tới lư hương trước bàn thờ chư Tổ, chắp tay vái lạy tưởng nhớ các vị Tổ sư rồi cắm nhang.', done: ' dâng chư Tổ' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 66, ry: Math.PI },
    { id: 'ho', name: 'Hai hồ sen', x: 0, z: 36, ry: Math.PI },
    { id: 'quanam', name: 'Tượng Quan Âm', x: QA.x + 4.2, z: QA.z + 2.6, ry: Math.PI * 0.75 },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'to', name: 'Nhà Tổ', x: 0, z: TO.z0 + 1.6, ry: Math.PI },
  ],
  MAP: {
    box: [-54, -58, 108, 136],
    font: 5,
    shapes: [
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 76, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: PL.x0, x1: PL.x1, z0: PL.z0, z1: PL.z1, c: 'm-water' },
      { x0: PR.x0, x1: PR.x1, z0: PR.z0, z1: PR.z1, c: 'm-water' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -T1.hx, x1: T1.hx, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: -TO.hx, x1: TO.hx, z0: TO.z1, z1: TO.z0, c: 'm-hall' },
      { x: QA.x, z: QA.z, r: QA.r, c: 'm-white' },
    ],
    labels: [['gate', 0, 66, 'Cổng tam quan'], ['ho', 0, 32, 'Hai hồ sen'], ['quanam', QA.x, QA.z - 4, 'Quan Âm'], ['dien', 0, -15, 'Chánh điện'], ['to', 0, -41, 'Nhà Tổ']],
  },
  OV: { bounds: { x0: -54, x1: 54, z0: -54, z1: 74 }, dist: 130, y: 3 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 6, act: 'bow', say: 'lạy Phật' },
    { x: QA.x + 4.2, z: QA.z + 2.6, spread: 1, act: 'bow', ry: Math.PI * 0.75 },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: TO.z0 - 4, spread: 3, act: 'bow' },
    { x: 0, z: 36, spread: 2, ry: Math.PI, say: 'Sen hai bên đẹp quá' },
    { x: 0, z: 64, spread: 22, ry: Math.PI },
  ],
  BOT_SPAWN: [[-26, 26, 44, 52], [-24, 24, 4, 10], [-24, 24, -32, -29]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Chánh điện to quá', 'Hồ sen thơm ghê', 'Chùa lớn giữa thành phố', 'Cầu bình an cho cả nhà'],
  build,
};
