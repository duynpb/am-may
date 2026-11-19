// Chùa Từ Đàm (Huế): Tổ đình cổ của Phật giáo xứ Huế. Qua cổng tam quan là con đường giữa hai hồ sen nhỏ, bên trái có gác chuông,
// bên phải là cây bồ đề cổ thụ và tháp nhỏ, cuối sân là chánh điện mái ngói vàng kiểu Huế.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 42;
const YARD = { x0: -28, x1: 28, z0: -34, z1: 39 };
const HALL = { x: 0, z0: -2, z1: -20, hx: 10, y: 0, plaque: 'TỪ ĐÀM TỰ', wallH: 5.4 };
const PONDS = [{ x0: -13, x1: -4.5, z0: 14, z1: 30 }, { x0: 4.5, x1: 13, z0: 14, z1: 30 }];
const PATH = 4.0; // nửa bề rộng lối giữa
const BELL = { x: -20, z: 4 };
const BODHI = { x: 18, z: 4 };
const STUPA = { x: 22, z: -10 };
const CENTER = { x: 0, z: 6 };

const WALK_AREAS = [
  rect(-44, 44, GATE_Z + 4.2, 58),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, 31.2, GATE_Z - 4.4), // trước hai hồ
  rect(YARD.x0 + 1, -14.4, HALL.z0 + 0.6, 32), rect(14.4, YARD.x1 - 1, HALL.z0 + 0.6, 32), // hai bên hồ
  rect(-PATH, PATH, HALL.z0 + 0.6, 32), // lối giữa hai hồ
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, 12.6), // sau hồ, trước điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: BODHI.x, z: BODHI.z, r: 1.7 },
  { x: STUPA.x, z: STUPA.z, r: 1.8 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#86b9de', skyBottom: '#eaece4', fog: [130, 600], fogColor: 0xdfe5de });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const wallC = std('#ecd9a2', { roughness: 0.85 });
  const darkWood = std('#5b3a24', { roughness: 0.6 });

  // ---------- Đất, đồi thông ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#80a05e'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-48, 48, GATE_Z + 3, 56, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -110, [[0, 20], [30, 18], [62, 8], [95, 2], [130, -1]], { color: '#5f7f48', clip: { x0: -46, x1: 46, z0: -38, z1: 58, floor: groundY } });
    hillAt = hy;
    K.pines([...K.scatter(-130, 130, -160, -50, 70), ...K.scatter(-100, -34, -50, 50, 40), ...K.scatter(34, 100, -50, 50, 40)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.2]), 0, { scale: 1.1 });
    K.pines([[-25, 30], [25, 30], [-25, -14], [25, -26]]);
  }

  // ---------- Cổng, tường ----------
  K.gate3(0, GATE_Z, 'TỪ ĐÀM TỰ', { walls: 12, wall: wallC });
  for (const s of [-1, 1]) {
    box(0.6, 2.6, GATE_Z - YARD.z0, wallC, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.6, 0.6, wallC, 0, 1.3, YARD.z0 - 0.3);

  // ---------- Hai hồ sen nhỏ ----------
  {
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (const P of PONDS) {
      box(P.x1 - P.x0 + 1, 0.8, 0.5, M.stone, (P.x0 + P.x1) / 2, 0.4, P.z0 - 0.3);
      box(P.x1 - P.x0 + 1, 0.8, 0.5, M.stone, (P.x0 + P.x1) / 2, 0.4, P.z1 + 0.3);
      for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.8, P.z1 - P.z0 + 1.1, M.stone, x, 0.4, (P.z0 + P.z1) / 2);
      K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: '#3f7578' });
      for (let i = 0; i < 18; i++) {
        const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
        mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
        if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
      }
    }
  }

  // ---------- Chánh điện ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.45);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: wallC, colMat: darkWood, light: 8 });

  // ---------- Cây bồ đề cổ thụ, tháp nhỏ, lư hương, đèn ----------
  {
    const bark = std('#5a4631', { roughness: 0.95 }), leaf = std('#4f8a3c', { roughness: 0.85 }), leaf2 = std('#5f9c46', { roughness: 0.85 });
    cyl(0.8, 1.15, 4.5, bark, BODHI.x, 2.25, BODHI.z, {}, 10);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const br = cyl(0.25, 0.4, 3, bark, BODHI.x + Math.cos(a) * 1.0, 5.2, BODHI.z + Math.sin(a) * 1.0, {}, 6);
      br.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    }
    for (const [dx, dy, dz, r, m] of [[0, 8.4, 0, 4.2, leaf], [-3.2, 7.4, 0.8, 3.2, leaf2], [3.0, 7.6, -0.6, 3.4, leaf2], [0.4, 7.2, 3.0, 3.0, leaf], [-0.6, 7.6, -3.0, 3.2, leaf]]) {
      mesh(new THREE.IcosahedronGeometry(r, 1), m, BODHI.x + dx, dy, BODHI.z + dz);
    }
    box(3.4, 0.3, 3.4, M.stone, BODHI.x, 0.15, BODHI.z, { cast: false });
    // tháp nhỏ ba tầng
    box(3.4, 0.8, 3.4, M.stoneD, STUPA.x, 0.4, STUPA.z);
    for (let i = 0; i < 3; i++) {
      const w = 2.6 - i * 0.5;
      box(w, 1.4, w, M.stone, STUPA.x, 1.5 + i * 2.0, STUPA.z);
      mesh(new THREE.ConeGeometry(w * 0.95, 0.9, 4).rotateY(Math.PI / 4), M.red, STUPA.x, 2.6 + i * 2.0, STUPA.z);
    }
    mesh(new THREE.ConeGeometry(0.28, 1.2, 8), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), STUPA.x, 7.9, STUPA.z);
    plaque(scene, 'THÁP', STUPA.x - 2.2, 1.5, STUPA.z, 1.0, 0.3, -Math.PI / 2, { size: 60 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 0; z <= 36; z += 9) K.lampPost(s * 17, 0, z);
      K.flagPole(s * 5, 0, 37, 8);
    }
    K.bamboo([[-24, 36, 8], [24, 36, 8]]);
  }
  const bells = [K.bellPavilion(BELL.x, BELL.z, 0)];

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'tudam',
  mapId: 'tudam',
  name: 'Chùa Từ Đàm',
  loading: 'Sương sớm đang tan trên đồi Huế',
  hint: 'đi giữa hai hồ sen, ghé gác chuông, cây bồ đề cổ thụ rồi vào chánh điện',
  info: 'Chùa Từ Đàm ở Huế là một Tổ đình cổ của Phật giáo xứ Huế. Qua cổng tam quan là con đường giữa hai hồ sen nhỏ; bên trái có gác chuông, bên phải là cây bồ đề cổ thụ và một tháp nhỏ; cuối sân là chánh điện mái ngói vàng kiểu Huế. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá trước điện.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 50, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân trước điện, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 50, ry: Math.PI },
    { id: 'ho', name: 'Hai hồ sen', x: 0, z: 33.5, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 5.2, ry: Math.PI },
    { id: 'bode', name: 'Cây bồ đề', x: BODHI.x, z: BODHI.z + 4, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 9, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-34, -40, 68, 104],
    font: 3.8,
    shapes: [
      { x0: -48, x1: 48, z0: GATE_Z + 3, z1: 56, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      ...PONDS.map((P) => ({ x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z1, c: 'm-water' })),
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: BELL.x, z: BELL.z, r: 3.5, c: 'm-corridor' },
      { x: BODHI.x, z: BODHI.z, r: 3, c: 'm-statue' },
      { x: STUPA.x, z: STUPA.z, r: 1.8, c: 'm-statue' },
    ],
    labels: [['gate', 0, 50, 'Cổng tam quan'], ['ho', 0, 24, 'Hồ sen'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['bode', BODHI.x, BODHI.z - 5, 'Cây bồ đề'], ['dien', 0, -12, 'Chánh điện']],
  },
  OV: { bounds: { x0: -34, x1: 34, z0: -34, z1: 56 }, dist: 90 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: 33.5, spread: 3, ry: Math.PI, say: 'Sen nở đẹp quá' },
    { x: BELL.x, z: BELL.z + 5.2, spread: 1, act: 'bell' },
    { x: BODHI.x, z: BODHI.z + 4, spread: 2, ry: Math.PI },
    { x: 0, z: 48, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 34, 40], [-24, 24, -8, -4]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Cây bồ đề già quá', 'Hai hồ sen đẹp ghê', 'Chùa cổ Huế thanh tịnh', 'Tiếng chuông nghe êm tai'],
  build,
};
