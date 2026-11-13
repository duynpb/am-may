// Chùa Từ Hiếu (Huế): ngôi chùa trong rừng thông yên tĩnh, nơi các vị công công xưa về nương tựa. Qua cổng tam quan là hồ sen có
// cầu đá bắc qua, chánh điện mái ngói kiểu Huế, hai bên là rừng thông và các ngôi mộ đá nhỏ.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 42;
const YARD = { x0: -28, x1: 28, z0: -34, z1: 39 };
const HALL = { x: 0, z0: -2, z1: -20, hx: 10, y: 0, plaque: 'TỪ HIẾU TỰ', wallH: 5.4 };
const POND = { x0: -13, x1: 13, z0: 16, z1: 32 };
const BR = 2.2; // nửa bề rộng cầu đá
const TOMBS = [[-22, 8], [-21, -6], [22, 8], [21, -8], [-23, -24], [23, -26]];
const CENTER = { x: 0, z: 8 };

const WALK_AREAS = [
  rect(-44, 44, GATE_Z + 4.2, 58),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, POND.z1 + 1.2, GATE_Z - 4.4), // trước hồ
  rect(YARD.x0 + 1, POND.x0 - 1.4, HALL.z0 + 0.6, POND.z1 + 1.6), rect(POND.x1 + 1.4, YARD.x1 - 1, HALL.z0 + 0.6, POND.z1 + 1.6), // hai bên hồ
  rect(-BR, BR, POND.z0 - 1.6, POND.z1 + 1.6), // cầu đá qua hồ
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, POND.z0 - 1.4), // sau hồ, trước điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  ...TOMBS.map(([x, z]) => ({ x, z, r: 1.2 })),
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
  const K = createKit(renderer, { quality, skyTop: '#82b6dc', skyBottom: '#e8ebe2', fog: [130, 600], fogColor: 0xdfe5de });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const wallC = std('#e8d3a0', { roughness: 0.85 });
  const darkWood = std('#5b3a24', { roughness: 0.6 });

  // ---------- Đất, đồi thông ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-48, 48, GATE_Z + 3, 56, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -120, [[0, 24], [34, 22], [70, 10], [105, 3], [140, -1]], { color: '#5c7a45', clip: { x0: -46, x1: 46, z0: -38, z1: 58, floor: groundY } });
    hillAt = hy;
    K.pines([...K.scatter(-140, 140, -170, -50, 90), ...K.scatter(-100, -34, -50, 50, 50), ...K.scatter(34, 100, -50, 50, 50)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.2]), 0, { scale: 1.1 });
    K.pines([[-24, 30], [24, 30], [-25, -14], [25, -14], [-24, -30], [24, -32]]);
  }

  // ---------- Cổng, tường ----------
  K.gate3(0, GATE_Z, 'TỪ HIẾU TỰ', { walls: 12, wall: wallC });
  for (const s of [-1, 1]) {
    box(0.6, 2.6, GATE_Z - YARD.z0, wallC, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.6, 0.6, wallC, 0, 1.3, YARD.z0 - 0.3);

  // ---------- Hồ sen, cầu đá ----------
  {
    const P = POND;
    for (const z of [P.z0 - 0.3, P.z1 + 0.3]) {
      const seg = (P.x1 - P.x0) / 2 - BR;
      for (const s of [-1, 1]) box(seg + 0.6, 0.8, 0.5, M.stone, s * (BR + seg / 2), 0.4, z);
    }
    for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.8, P.z1 - P.z0 + 1.1, M.stone, x, 0.4, (P.z0 + P.z1) / 2);
    K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: '#3f7578' });
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (let i = 0; i < 28; i++) {
      const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
      if (Math.abs(x) < BR + 0.8) continue;
      mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
      if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
    }
    // cầu đá bắc qua hồ, có lan can
    const br = box(BR * 2, 0.35, P.z1 - P.z0 + 1.2, M.stoneD, 0, 0.17, (P.z0 + P.z1) / 2);
    br.userData.kind = 'ground';
    pickables.push(br);
    for (const s of [-1, 1]) {
      box(0.3, 0.7, P.z1 - P.z0 + 1.2, M.stone, s * (BR - 0.15), 0.7, (P.z0 + P.z1) / 2);
      for (let z = P.z0; z <= P.z1; z += 4) cyl(0.18, 0.2, 1.0, M.stone, s * (BR - 0.15), 0.9, z, {}, 8);
    }
  }

  // ---------- Chánh điện, mộ đá, lư hương, đèn ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.45);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: wallC, colMat: darkWood, light: 8 });
  {
    for (const [x, z] of TOMBS) {
      box(1.6, 0.35, 2.2, M.stoneD, x, 0.17, z);
      box(1.2, 0.7, 1.7, M.stone, x, 0.7, z);
      box(0.5, 1.5, 0.18, M.stone, x, 1.2, z - 0.8);
    }
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 0; z <= 36; z += 9) K.lampPost(s * 17, 0, z);
      K.flagPole(s * 5, 0, 37, 8);
    }
    K.bamboo([[-24, 36, 8], [24, 36, 8]]);
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'tuhieu',
  mapId: 'tuhieu',
  name: 'Chùa Từ Hiếu',
  loading: 'Sương sớm đang tan trong rừng thông Huế',
  hint: 'qua cổng, bước trên cầu đá qua hồ sen, vào chánh điện giữa rừng thông yên tĩnh',
  info: 'Chùa Từ Hiếu ở Huế nằm trong rừng thông yên tĩnh, nơi các vị công công xưa về nương tựa. Qua cổng tam quan là hồ sen có cầu đá bắc qua, chánh điện mái ngói kiểu Huế; hai bên là rừng thông và các ngôi mộ đá nhỏ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá phía sau hồ.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 50, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang sau hồ sen', text: 'Bạn sẽ bước tới lư hương đá giữa sân sau hồ sen, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 50, ry: Math.PI },
    { id: 'cau', name: 'Cầu đá hồ sen', x: 0, z: POND.z1 + 3, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 4, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'mo', name: 'Khu mộ đá', x: -18, z: 3, ry: Math.PI / 2 },
  ],
  MAP: {
    box: [-34, -40, 68, 104],
    font: 3.8,
    shapes: [
      { x0: -48, x1: 48, z0: GATE_Z + 3, z1: 56, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: POND.x0, x1: POND.x1, z0: POND.z0, z1: POND.z1, c: 'm-water' },
      { x0: -BR, x1: BR, z0: POND.z0, z1: POND.z1, c: 'm-stairs' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      ...TOMBS.map(([x, z]) => ({ x, z, r: 1.4, c: 'm-statue' })),
    ],
    labels: [['gate', 0, 50, 'Cổng tam quan'], ['cau', 0, 24, 'Hồ sen'], ['san', 0, 4, 'Sân chùa'], ['dien', 0, -12, 'Chánh điện'], ['mo', -22, -2, 'Mộ đá']],
  },
  OV: { bounds: { x0: -34, x1: 34, z0: -34, z1: 56 }, dist: 90 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: POND.z1 + 3, spread: 2, ry: Math.PI, say: 'Sen nở đẹp quá' },
    { x: -18, z: 3, spread: 2, ry: Math.PI / 2 },
    { x: 0, z: 48, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 34, 40], [-24, 24, -8, -4]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Rừng thông yên tĩnh quá', 'Cầu đá qua hồ sen đẹp ghê', 'Chùa cổ Huế thanh tịnh', 'Gió thông nghe vui tai'],
  build,
};
