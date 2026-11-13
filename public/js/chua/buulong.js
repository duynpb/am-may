// Chùa Bửu Long (Thủ Đức, TP. Hồ Chí Minh): chùa trên đồi nhỏ, kiến trúc pha Thái – Ấn – Việt. Qua cổng tam quan là sân có
// hồ sen, bậc thang lên nền cao có chánh điện nhiều lớp mái, bên phải là bảo tháp Gotama thếp vàng cao vút, bên trái bảo tháp
// trắng nhỏ. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill, curvedRoof } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 52;
const YARD = { x0: -32, x1: 32, z0: 6, z1: 49 };
const T1 = { hx: 34, z0: -64, z1: -10, y: 7 };
const ST = { x0: -5, x1: 5, zBottom: 6, zTop: T1.z1, y0: 0, y1: T1.y };
const HALL = { x: 0, z0: -14, z1: -36, hx: 13, y: T1.y, plaque: 'CHÁNH ĐIỆN', wallH: 6.4 };
const GOLD = { x: 25, z: -44, r: 3.4 }; // bảo tháp vàng
const WHITE = { x: -25, z: -42, r: 2.6 }; // bảo tháp trắng
const POND = { x: -17, z: 28, r: 5.5 };
const CENTER = { x: 6, z: 30 };

const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 70),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, ST.zBottom - 0.6, GATE_Z - 4.4),
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.6),
  rect(-T1.hx + 1, T1.hx - 1, HALL.z0 + 0.6, T1.z1 - 0.6),
  rect(-T1.hx + 1, -HALL.hx - 1.2, T1.z0 + 0.8, T1.z1 - 0.6), rect(HALL.hx + 1.2, T1.hx - 1, T1.z0 + 0.8, T1.z1 - 0.6),
  rect(-T1.hx + 1, T1.hx - 1, T1.z0 + 0.8, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: GOLD.x, z: GOLD.z, r: GOLD.r + 2.2 },
  { x: WHITE.x, z: WHITE.z, r: WHITE.r + 2.0 },
  { x: POND.x, z: POND.z, r: POND.r + 0.6 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: T1.y + 0.25, burner: { x: 0, z: HALL.z1 + 4.0 }, merit: { x: HALL.hx - 3, z: HALL.z1 + 3.8 }, face: { x: 0, y: T1.y + 3.6, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 6, z: ST.zTop } },
  { place: 'thap', y: T1.y, stone: true, burner: { x: GOLD.x, z: GOLD.z + GOLD.r + 4.6 }, merit: { x: GOLD.x - 3.6, z: GOLD.z + GOLD.r + 4.4 }, face: { x: GOLD.x, y: T1.y + 4, z: GOLD.z } },
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
  const K = createKit(renderer, { quality, skyTop: '#76aedb', skyBottom: '#ece5d2' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, lods } = K;
  const creamW = std('#f0e3c4', { roughness: 0.8 });
  const goldM = std('#e2b13c', { metalness: 0.7, roughness: 0.35 });

  // ---------- Đất, đồi nhỏ phía sau ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -50, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 72, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(YARD.x0, YARD.x1, YARD.z0 - 1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -150, [[0, 30], [30, 29], [70, 14], [110, 3], [140, -1]], { clip: { x0: -52, x1: 52, z0: -68, z1: 74, floor: groundY } });
    hillAt = hy;
    K.forest([...K.scatter(-170, 170, -200, -70, 100), ...K.scatter(-120, -50, -70, 60, 30), ...K.scatter(50, 120, -70, 60, 30)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    K.palms([[-40, 56], [40, 56], [-40, 30], [40, 30], [-40, 8], [40, 8]]);
  }

  // ---------- Cổng, sân, hồ sen ----------
  K.gate3(0, GATE_Z, 'BỬU LONG TỰ', { walls: 22, wall: creamW });
  {
    for (const s of [-1, 1]) {
      box(0.6, 2.6, GATE_Z - YARD.z0 + 1, creamW, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
      K.lion(s * 4.2, 0, GATE_Z + 3.4);
      for (let z = 12; z <= 46; z += 8) K.lampPost(s * 10, 0, z);
      K.flagPole(s * 5, 0, 46, 8);
    }
    cyl(POND.r + 0.5, POND.r + 0.5, 0.5, M.stone, POND.x, 0.25, POND.z, {}, 28);
    mesh(new THREE.CircleGeometry(POND.r, 28).rotateX(-Math.PI / 2), std('#3f7578', { roughness: 0.12, metalness: 0.2 }), POND.x, 0.52, POND.z, { cast: false });
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (let i = 0; i < 22; i++) {
      const a = K.rr() * 6.28, r = Math.sqrt(K.rr()) * (POND.r - 0.6);
      const x = POND.x + Math.cos(a) * r, z = POND.z + Math.sin(a) * r;
      mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.55, z, { cast: false });
      if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.16, 0.34, 7), pink, x + 0.2, 0.75, z);
    }
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    K.flowers([[24, 40], [26, 40], [28, 40], [-24, 12], [-26, 12], [24, 12], [26, 12]]);
  }

  // ---------- Nền cao, bậc thang, chánh điện nhiều lớp mái ----------
  {
    terrace(-T1.hx, T1.hx, T1.z0, T1.z1, 0, T1.y, { side: std('#8d8574', { roughness: 1 }) });
    stairs({ ...ST, base: -0.5 });
    for (const s of [-1, 1]) {
      box(T1.hx - ST.x1 - 0.4, 0.8, 0.3, M.stone, s * (T1.hx + ST.x1 + 0.4) / 2, T1.y + 0.4, T1.z1 - 0.15);
      K.stoneLamp(s * 12, T1.y, -12);
    }
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z - 0.2);
      b.scale.setScalar(1.85);
      scene.add(b);
      lods.push({ obj: b, z, r: 90 });
    }, { wallMat: creamW, light: 11 });
  }

  // ---------- Bảo tháp vàng (kiểu Thái) và bảo tháp trắng ----------
  {
    const g = group(GOLD.x, T1.y, GOLD.z);
    let y = 0;
    for (const [w, h] of [[GOLD.r * 2 + 3.6, 0.8], [GOLD.r * 2 + 2.2, 0.8], [GOLD.r * 2 + 1.0, 1.0]]) {
      box(w, h, w, creamW, 0, y + h / 2, 0, { parent: g });
      y += h;
    }
    const bellProf = [[0, 0], [GOLD.r + 0.6, 0], [GOLD.r + 0.7, 0.8], [GOLD.r, 2.8], [GOLD.r * 0.62, 5.2], [GOLD.r * 0.34, 7.2], [GOLD.r * 0.18, 9], [0, 9.2]].map(([a, b]) => new THREE.Vector2(a, b));
    mesh(new THREE.LatheGeometry(bellProf, 24), goldM, 0, y, 0, { parent: g });
    for (let k = 0; k < 7; k++) cyl(0.5 - k * 0.05, 0.56 - k * 0.05, 0.32, goldM, 0, y + 9.2 + k * 0.32, 0, { parent: g }, 12);
    mesh(new THREE.ConeGeometry(0.16, 3.2, 8), goldM, 0, y + 12.9, 0, { parent: g });
    plaque(g, 'BẢO THÁP GOTAMA', 0, 1.0, GOLD.r + 1.7, 3.0, 0.5, 0, { size: 90 });
    K.roofs.push({ minX: GOLD.x - 6, maxX: GOLD.x + 6, minZ: GOLD.z - 6, maxZ: GOLD.z + 6, lift: 36 });

    const w = group(WHITE.x, T1.y, WHITE.z);
    let wy = 0;
    for (const [s, h] of [[WHITE.r * 2 + 2.4, 0.7], [WHITE.r * 2 + 1.2, 0.8], [WHITE.r * 2, 1.4]]) {
      box(s, h, s, M.white, 0, wy + h / 2, 0, { parent: w });
      wy += h;
    }
    mesh(new THREE.SphereGeometry(WHITE.r * 0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.white, 0, wy, 0, { parent: w }).scale.y = 1.1;
    for (let k = 0; k < 6; k++) cyl(0.4 - k * 0.05, 0.45 - k * 0.05, 0.3, M.white, 0, wy + 2.6 + k * 0.3, 0, { parent: w }, 10);
    mesh(new THREE.ConeGeometry(0.12, 1.8, 8), goldM, 0, wy + 5, 0, { parent: w });
    K.forest([[-30, -58], [30, -58], [-30, -14], [-12, -58], [12, -58]].map(([x, z]) => [x, z, T1.y]), 0, { scale: 1.1 });
  }

  const world = K.finish({ rituals: RITUALS });
  return world;
}

export const SITE = {
  id: 'buulong',
  name: 'Chùa Bửu Long',
  loading: 'Bảo tháp vàng đang lên nắng',
  hint: 'qua sân hồ sen, lên bậc thang tới chánh điện; ngắm bảo tháp vàng cao vút',
  info: 'Chùa Bửu Long ở Thủ Đức, TP. Hồ Chí Minh nằm trên đồi nhỏ, kiến trúc pha Thái – Ấn – Việt. Qua cổng tam quan là sân có hồ sen, bậc thang lên nền cao có chánh điện nhiều lớp mái; bên phải là bảo tháp Gotama thếp vàng cao vút, bên trái là bảo tháp trắng nhỏ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân; trước bảo tháp vàng thì ở lư hương đá của tháp.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 62, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < T1.z1 + 0.5 && Math.hypot(x - GOLD.x, z - GOLD.z) < 16) return 'thap';
    if (z < T1.z1 + 0.5) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
    thap: { title: 'Thắp nhang trước bảo tháp vàng', text: 'Bạn sẽ bước tới lư hương đá trước bảo tháp Gotama thếp vàng, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
  },
  bowRy: (x, z) => (z < T1.z1 && Math.hypot(x - GOLD.x, z - GOLD.z) < 14 ? Math.atan2(GOLD.x - x, GOLD.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 62, ry: Math.PI },
    { id: 'ho', name: 'Hồ sen', x: POND.x + 7, z: POND.z + 6, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp vàng', x: GOLD.x, z: GOLD.z + GOLD.r + 7.5, ry: Math.PI },
    { id: 'thaptrang', name: 'Bảo tháp trắng', x: WHITE.x, z: WHITE.z + WHITE.r + 6, ry: Math.PI },
  ],
  MAP: {
    box: [-54, -66, 108, 138],
    font: 5,
    shapes: [
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 72, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -T1.hx, x1: T1.hx, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: POND.x, z: POND.z, r: POND.r, c: 'm-water' },
      { x: GOLD.x, z: GOLD.z, r: GOLD.r + 0.6, c: 'm-gold' },
      { x: WHITE.x, z: WHITE.z, r: WHITE.r, c: 'm-white' },
    ],
    labels: [['gate', 0, 63, 'Cổng tam quan'], ['ho', POND.x, POND.z + 11, 'Hồ sen'], ['dien', 0, -26, 'Chánh điện'], ['thap', GOLD.x, GOLD.z - 7, 'Tháp vàng'], ['thaptrang', WHITE.x, WHITE.z - 6, 'Tháp trắng']],
  },
  OV: { bounds: { x0: -54, x1: 54, z0: -62, z1: 70 }, dist: 120, y: 4 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 5, act: 'bow', say: 'lạy Phật' },
    { x: GOLD.x, z: GOLD.z + GOLD.r + 7.5, spread: 2, act: 'bow', ry: Math.PI },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: POND.x + 7, z: POND.z + 6, spread: 2, ry: -Math.PI * 0.75, say: 'Sen nở đẹp quá' },
    { x: 0, z: 60, spread: 18, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 12, 48], [-24, 24, -34, -12]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Tháp vàng sáng quá', 'Chùa kiến trúc lạ ghê', 'Sen trong hồ nở rồi', 'Lên chánh điện lạy Phật thôi'],
  build,
};
