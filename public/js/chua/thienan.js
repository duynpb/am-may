// Chùa Thiên Ấn (Quảng Ngãi): ngôi chùa cổ dưới chân núi Thiên Ấn, bên dòng sông Trà. Từ cổng tam quan phải bước qua cầu đá bắc ngang
// dòng sông nhỏ mới vào sân; trong sân có tháp năm tầng và gác chuông, cuối sân là chánh điện, phía sau là núi.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 48;
const YARD = { x0: -28, x1: 28, z0: -34, z1: 45 };
const HALL = { x: 0, z0: -2, z1: -22, hx: 11, y: 0, plaque: 'THIÊN ẤN TỰ', wallH: 5.6 };
const RIVER = { x0: -28, x1: 28, z0: 30, z1: 40 };
const BR = 3; // nửa bề rộng cầu đá
const TOWER = { x: -19, z: 8 };
const BELL = { x: 20, z: 6 };
const CENTER = { x: 0, z: 10 };

const WALK_AREAS = [
  rect(-44, 44, GATE_Z + 4.2, 64),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, RIVER.z1 + 1.2, GATE_Z - 4.4), // trước sông
  rect(-BR, BR, RIVER.z0 - 1.6, RIVER.z1 + 1.6), // cầu đá qua sông
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, RIVER.z0 - 1.2), // sân sau sông, trước điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: 3.0 },
  { x: BELL.x, z: BELL.z, r: 3.9 },
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
  const K = createKit(renderer, { quality, skyTop: '#7fb2dc', skyBottom: '#e9ece4', fog: [140, 620], fogColor: 0xdde4dc });
  const { scene, M, std, mesh, box, cyl, floor, plaque, pickables, lods } = K;
  const wallC = std('#e3cf9c', { roughness: 0.85 });
  const darkWood = std('#5b3a24', { roughness: 0.6 });

  // ---------- Đất, núi Thiên Ấn ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#82a25f'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-48, 48, GATE_Z + 3, 62, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, RIVER.z0, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(YARD.x0, YARD.x1, RIVER.z1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -130, [[0, 34], [40, 30], [80, 14], [120, 4], [160, -1]], { color: '#5b7c44', clip: { x0: -46, x1: 46, z0: -38, z1: 64, floor: groundY } });
    hillAt = hy;
    K.pines([...K.scatter(-150, 150, -190, -60, 80), ...K.scatter(-110, -34, -50, 60, 40), ...K.scatter(34, 110, -50, 60, 40)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.2]), 0, { scale: 1.15 });
    K.pines([[-25, 20], [25, 20], [-25, -14], [25, -26]]);
  }

  // ---------- Cổng, tường ----------
  K.gate3(0, GATE_Z, 'THIÊN ẤN TỰ', { walls: 12, wall: wallC });
  for (const s of [-1, 1]) {
    box(0.6, 2.6, GATE_Z - YARD.z0, wallC, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.6, 0.6, wallC, 0, 1.3, YARD.z0 - 0.3);

  // ---------- Dòng sông nhỏ, cầu đá ----------
  {
    const R = RIVER;
    K.water(R.x0, R.x1, R.z0, R.z1, 0.1, { color: '#3d7a86' });
    for (const z of [R.z0 - 0.3, R.z1 + 0.3]) {
      const seg = (R.x1 - R.x0) / 2 - BR;
      for (const s of [-1, 1]) box(seg + 0.6, 0.8, 0.5, M.stone, s * (BR + seg / 2), 0.4, z);
    }
    const br = box(BR * 2, 0.35, R.z1 - R.z0 + 1.2, M.stoneD, 0, 0.17, (R.z0 + R.z1) / 2);
    br.userData.kind = 'ground';
    pickables.push(br);
    for (const s of [-1, 1]) {
      box(0.3, 0.7, R.z1 - R.z0 + 1.2, M.stone, s * (BR - 0.15), 0.7, (R.z0 + R.z1) / 2);
      for (let z = R.z0; z <= R.z1; z += 4) cyl(0.18, 0.2, 1.0, M.stone, s * (BR - 0.15), 0.9, z, {}, 8);
    }
    // vài tảng đá giữa dòng
    for (const [x, z, r] of [[-14, 33, 1.0], [-9, 37, 0.7], [11, 34, 0.9], [18, 37, 1.1], [-21, 36, 0.8]]) {
      mesh(new THREE.DodecahedronGeometry(r, 0), M.stoneD, x, 0.1 + r * 0.3, z);
    }
  }

  // ---------- Chánh điện ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.5);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: wallC, colMat: darkWood, light: 9 });

  // ---------- Tháp năm tầng, lư hương, đèn ----------
  {
    box(6.4, 0.9, 6.4, M.stoneD, TOWER.x, 0.45, TOWER.z);
    for (let i = 0; i < 5; i++) {
      const w = 4.4 - i * 0.55, y0 = 0.9 + i * 2.6;
      box(w, 1.6, w, M.wall, TOWER.x, y0 + 0.8, TOWER.z);
      mesh(new THREE.ConeGeometry(w * 1.15, 1.0, 4).rotateY(Math.PI / 4), M.red, TOWER.x, y0 + 2.1, TOWER.z);
    }
    mesh(new THREE.ConeGeometry(0.3, 1.8, 8), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), TOWER.x, 15.2, TOWER.z);
    plaque(scene, 'BẢO THÁP', TOWER.x + 3.3, 1.8, TOWER.z, 1.4, 0.34, Math.PI / 2, { size: 70 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = -4; z <= 28; z += 8) K.lampPost(s * 17, 0, z);
      for (const z of [43, 52]) K.flagPole(s * 5, 0, z, 8);
    }
    K.bamboo([[-24, 44, 8], [24, 44, 8]]);
  }
  const bells = [K.bellPavilion(BELL.x, BELL.z, 0)];

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'thienan',
  mapId: 'thienan',
  name: 'Chùa Thiên Ấn',
  loading: 'Sương sớm đang tan bên dòng sông Trà',
  hint: 'qua cổng, bước trên cầu đá bắc ngang sông, ngắm bảo tháp, gác chuông rồi vào chánh điện',
  info: 'Chùa Thiên Ấn ở Quảng Ngãi nằm dưới chân núi Thiên Ấn, bên dòng sông Trà. Qua cổng tam quan là cầu đá bắc ngang một dòng sông nhỏ; trong sân có bảo tháp năm tầng và gác chuông, cuối sân là chánh điện, phía sau là núi xanh. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá qua sông', 'Đi thẳng từ cổng qua cầu đá bắc ngang sông để vào sân chùa.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 56, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân sau cầu, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 56, ry: Math.PI },
    { id: 'cau', name: 'Cầu đá qua sông', x: 0, z: RIVER.z1 + 3, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp', x: TOWER.x + 5.5, z: TOWER.z, ry: Math.PI / 2 },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 5.2, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 14, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-34, -40, 68, 108],
    font: 3.8,
    shapes: [
      { x0: -48, x1: 48, z0: GATE_Z + 3, z1: 62, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: RIVER.x0, x1: RIVER.x1, z0: RIVER.z0, z1: RIVER.z1, c: 'm-water' },
      { x0: -BR, x1: BR, z0: RIVER.z0, z1: RIVER.z1, c: 'm-stairs' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: TOWER.x, z: TOWER.z, r: 3, c: 'm-statue' },
      { x: BELL.x, z: BELL.z, r: 3.5, c: 'm-corridor' },
    ],
    labels: [['gate', 0, 56, 'Cổng tam quan'], ['cau', 0, 35, 'Sông Trà'], ['thap', TOWER.x, TOWER.z - 5, 'Bảo tháp'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['dien', 0, -12, 'Chánh điện']],
  },
  OV: { bounds: { x0: -34, x1: 34, z0: -34, z1: 64 }, dist: 95 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: RIVER.z1 + 3, spread: 2, ry: Math.PI, say: 'Nước sông trong quá' },
    { x: BELL.x, z: BELL.z + 5.2, spread: 1, act: 'bell' },
    { x: TOWER.x + 5.5, z: TOWER.z, spread: 2, ry: Math.PI / 2 },
    { x: 0, z: 56, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 44, 52], [-24, 24, 14, 24]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Núi Thiên Ấn xanh quá', 'Cầu đá qua sông đẹp ghê', 'Tiếng chuông nghe êm tai', 'Chùa cổ thanh tịnh'],
  build,
};
