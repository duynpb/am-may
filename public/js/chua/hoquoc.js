// Thiền viện Trúc Lâm Hộ Quốc (Phú Quốc, An Giang): thiền viện trên sườn đồi nhìn ra biển. Từ bờ biển và bến thuyền đi lên
// bậc thang tới cổng tam quan, qua hai nền đá: nền dưới có gác chuông và vườn thiền, nền trên có chánh điện tường vàng
// nhìn ra vịnh. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const SHORE = 60; // mép nước biển
const T1 = { hx: 32, z0: -14, z1: 30, y: 6 };
const T2 = { hx: 32, z0: -62, z1: -26, y: 14 };
const ST0 = { x0: -5, x1: 5, zBottom: 44, zTop: T1.z1, y0: 0, y1: T1.y };
const ST1 = { x0: -5, x1: 5, zBottom: T1.z0, zTop: T2.z1, y0: T1.y, y1: T2.y };
const GATE_Z = 26;
const HALL = { x: 0, z0: -30, z1: -52, hx: 14, y: T2.y, plaque: 'CHÁNH ĐIỆN', wallH: 6.6 };
const BELL = { x: -21, z: 6 };
const CENTER = { x: 0, z: 2 };

const WALK_AREAS = [
  rect(-44, 44, ST0.zBottom + 0.4, SHORE - 1), // bờ biển, bến
  rect(-1.5, 1.5, SHORE - 2, SHORE + 10),
  rect(ST0.x0 + 0.8, ST0.x1 - 0.8, ST0.zTop - 0.8, ST0.zBottom + 0.8),
  rect(-12, 12, GATE_Z + 2.6, T1.z1 - 0.4), // thềm trước cổng
  ...gateWalk(0, GATE_Z),
  rect(-T1.hx + 1, T1.hx - 1, T1.z0 + 0.8, GATE_Z - 4.4), // nền dưới (vườn thiền, gác chuông)
  rect(ST1.x0 + 0.8, ST1.x1 - 0.8, ST1.zTop - 0.8, ST1.zBottom + 1.2),
  rect(-T2.hx + 1, T2.hx - 1, HALL.z0 + 0.6, T2.z1 - 0.6), // sân trước chánh điện
  rect(-T2.hx + 1, -HALL.hx - 1.2, T2.z0 + 0.8, T2.z1 - 0.6), rect(HALL.hx + 1.2, T2.hx - 1, T2.z0 + 0.8, T2.z1 - 0.6),
  rect(-T2.hx + 1, T2.hx - 1, T2.z0 + 0.8, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: T2.y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: T2.y + 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: T1.y, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: T1.y + 4, z: T1.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  for (const S of [ST0, ST1]) {
    const s = stairY(S, x, z);
    if (s != null) return s;
  }
  if (Math.abs(x) <= T2.hx && z >= T2.z0 && z <= T2.z1) return inHall(HALL, x, z) ? T2.y + 0.25 : T2.y;
  if (Math.abs(x) <= T1.hx && z >= T1.z0 && z <= T1.z1) return Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3 ? T1.y + 0.3 : T1.y;
  if (Math.abs(x) < 1.8 && z > SHORE - 2 && z < SHORE + 11) return 0.1;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#5fa6e0', skyBottom: '#e7eef0', fog: [200, 900], fogColor: 0xdfe9ec });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, lods } = K;
  const yellowWall = std('#e7c66e', { roughness: 0.8 });

  // ---------- Biển, bờ cát, đồi phía sau ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 400), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, SHORE - 200, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, ST0.zBottom, SHORE, 0, 'slab', { tile: 5.5, macro: 0.05 });
    box(800, 1.0, 1.0, M.stone, 0, -0.4, SHORE + 0.4);
    const sand = mesh(new THREE.PlaneGeometry(800, 16), std('#e8d9ac', { roughness: 1 }), 0, -0.5, SHORE + 9, { cast: false });
    sand.rotation.x = -Math.PI / 2;
    K.water(-900, 900, SHORE + 12, SHORE + 900, -0.7, { color: '#2f86a8' });
    // bến gỗ, thuyền nhỏ neo
    box(3, 0.2, 12, std('#8a6a44'), 0, 0.05, SHORE + 6);
    for (const [x, z, ry] of [[10, SHORE + 20, 0.4], [-14, SHORE + 26, -0.3], [22, SHORE + 34, 1.2]]) {
      const b = group(x, -0.4, z, ry, { merge: false });
      box(1.4, 0.6, 5, std('#4a7aa6'), 0, 0.3, 0, { parent: b });
      box(0.2, 2.2, 0.2, M.wood, 0, 1.5, 0.4, { parent: b });
    }
    const hy = makeHill(K, 0, -150, [[0, 40], [40, 38], [80, 20], [120, 6], [160, -1]], { clip: { x0: -50, x1: 50, z0: -66, z1: SHORE + 2, floor: groundY } });
    hillAt = hy;
    K.forest([...K.scatter(-180, 180, -220, -70, 130), ...K.scatter(-140, -36, -70, 60, 50), ...K.scatter(36, 140, -70, 60, 50)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    K.palms([[-40, ST0.zBottom + 4], [40, ST0.zBottom + 4], [-30, SHORE - 3], [30, SHORE - 3], [-46, 56], [46, 56]]);
  }

  // ---------- Bậc thang, hai nền đá ----------
  {
    stairs({ ...ST0, base: -0.5 });
    terrace(-T1.hx, T1.hx, T1.z0, T1.z1, 0, T1.y, { side: std('#857c6c', { roughness: 1 }) });
    stairs({ ...ST1, base: -0.5 });
    terrace(-T2.hx, T2.hx, T2.z0, T2.z1, 0, T2.y, { side: std('#857c6c', { roughness: 1 }) });
    for (const [T, S] of [[T1, ST0], [T2, ST1]]) for (const s of [-1, 1]) {
      box(T.hx - S.x1 - 0.4, 0.8, 0.3, M.stone, s * (T.hx + S.x1 + 0.4) / 2, T.y + 0.4, T.z1 - 0.15);
      box(0.3, 0.8, T.z1 - T.z0, M.stone, s * (T.hx - 0.15), T.y + 0.4, (T.z0 + T.z1) / 2);
    }
    for (const s of [-1, 1]) K.stoneLamp(s * 8, T1.y, T1.z1 - 4);
  }

  // ---------- Nền dưới: cổng, gác chuông, vườn thiền ----------
  K.gate3(0, GATE_Z, 'TRÚC LÂM HỘ QUỐC', { walls: 18, y: T1.y, wall: yellowWall });
  const bells = [K.bellPavilion(BELL.x, BELL.z, T1.y)];
  {
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, T1.y + 0.5, CENTER.z, {}, 16);
    // vườn thiền: sỏi cào, vài tảng đá
    const sand = mesh(new THREE.PlaneGeometry(12, 8), std('#e5ddc9', { roughness: 1 }), 20, T1.y + 0.03, 4, { cast: false });
    sand.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) box(10, 0.04, 0.12, std('#cfc6af'), 20, T1.y + 0.06, 0.8 + i * 1.2, { cast: false });
    for (const [x, z, s] of [[17.5, 2.6, 0.9], [22.4, 5.4, 1.2], [20.5, 3.8, 0.6]]) mesh(new THREE.IcosahedronGeometry(s, 0), std('#6f6a5c', { roughness: 1, flatShading: true }), x, T1.y + s * 0.6, z).scale.y = 0.8;
    K.palms([[-26, 24], [26, 24], [-27, -8], [27, -8]], T1.y);
    K.flowers([[-12, 16], [-10, 16], [10, 16], [12, 16]].map(([x, z]) => [x, z, T1.y]));
  }

  // ---------- Nền trên: chánh điện nhìn ra vịnh ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.7);
    scene.add(b);
    lods.push({ obj: b, z, r: 90 });
  }, { wallMat: yellowWall, light: 10 });
  for (const s of [-1, 1]) {
    for (let z = -32; z >= -44; z -= 6) K.lampPost(s * 17, T2.y, z);
    K.flagPole(s * 6, T2.y, T2.z1 - 2, 8);
  }
  K.forest([[-28, -58], [28, -58], [-28, -30], [28, -30]].map(([x, z]) => [x, z, T2.y]), 0, { scale: 1.1 });

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'hoquoc',
  name: 'Thiền viện Trúc Lâm Hộ Quốc',
  loading: 'Sóng vịnh Phú Quốc đang vỗ bờ',
  hint: 'từ bờ biển lên bậc thang qua cổng tam quan, tới chánh điện nhìn ra vịnh',
  info: 'Thiền viện Trúc Lâm Hộ Quốc nằm trên sườn đồi ở Phú Quốc, An Giang, nhìn ra biển. Từ bờ biển lên bậc thang qua cổng tam quan là nền dưới có gác chuông và vườn thiền sỏi, rồi bậc thang lên nền trên có chánh điện tường vàng nhìn ra vịnh. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông ở gác chuông bên trái nền dưới để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ở nền dưới thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 54, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) || z < T2.z1 + 0.5 ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang ở nền dưới', text: 'Bạn sẽ bước tới lư hương đá giữa sân nền dưới, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'bien', name: 'Bờ biển', x: 0, z: 54, ry: Math.PI },
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 31.5, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 5.2, ry: Math.PI },
    { id: 'thien', name: 'Vườn thiền', x: 18, z: 10, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-46, -66, 92, 146],
    font: 4.6,
    shapes: [
      { x0: -46, x1: 46, z0: SHORE, z1: 80, c: 'm-water' },
      { x0: -44, x1: 44, z0: ST0.zBottom, z1: SHORE, c: 'm-stone' },
      { x0: -T1.hx, x1: T1.hx, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: -T2.hx, x1: T2.hx, z0: T2.z0, z1: T2.z1, c: 'm-terrace' },
      { x0: ST0.x0, x1: ST0.x1, z0: ST0.zTop, z1: ST0.zBottom, c: 'm-stairs' },
      { x0: ST1.x0, x1: ST1.x1, z0: ST1.zTop, z1: ST1.zBottom, c: 'm-stairs' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
    ],
    labels: [['bien', 0, 56, 'Bờ biển'], ['gate', 0, 33, 'Cổng tam quan'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['thien', 20, 14, 'Vườn thiền'], ['dien', 0, -41, 'Chánh điện']],
  },
  OV: { bounds: { x0: -46, x1: 46, z0: -62, z1: 72 }, dist: 130, y: 6 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 4, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 0, act: 'bell' },
    { x: 18, z: 10, spread: 3, ry: 0, say: 'Vườn thiền yên tĩnh quá' },
    { x: 0, z: 56, spread: 24, ry: Math.PI, say: 'Biển Phú Quốc đẹp ghê' },
  ],
  BOT_SPAWN: [[-24, 24, 48, 58], [-20, 20, -10, 12], [-24, 24, -48, -30]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Gió biển mát ghê', 'Thiền viện yên tĩnh thật', 'Biển xanh quá', 'Leo bậc thang mỏi chân'],
  build,
};
