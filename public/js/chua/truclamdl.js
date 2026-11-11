// Thiền viện Trúc Lâm Đà Lạt: trên núi Phụng Hoàng bên hồ Tuyền Lâm, giữa rừng thông. Từ bến hồ lên bậc đá tới cổng
// tam quan, vào sân vườn hoa rực rỡ, gác chuông bên trái, chánh điện ở giữa, phía sau là khu thiền (nội viện) yên tĩnh;
// bên phải có ga cáp treo từ đồi Robin bay qua rừng thông. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const Y = 10; // mặt núi nơi đặt thiền viện
const TER = { x0: -30, x1: 30, z0: -62, z1: 18 };
const SHORE = 48; // mép hồ
const STAIR = { x0: -4, x1: 4, zBottom: 38, zTop: TER.z1, y0: 0, y1: Y };
const GATE_Z = 13;
const HALL = { x: 0, z0: -16, z1: -34, hx: 12, y: Y, plaque: 'CHÁNH ĐIỆN', wallH: 6 };
const BELL = { x: -19, z: -4 };
const CENTER = { x: 0, z: -6 }; // lư hương đá giữa sân
const NOI = { z: -46 }; // tường nội viện (khu thiền, không vào)

const WALK_AREAS = [
  rect(-40, 40, STAIR.zBottom + 0.4, SHORE - 1), // bờ hồ
  rect(-1.2, 1.2, SHORE - 2, SHORE + 8), // bến thuyền
  rect(STAIR.x0 + 0.8, STAIR.x1 - 0.8, STAIR.zTop - 0.8, STAIR.zBottom + 0.8),
  rect(TER.x0 + 1, TER.x1 - 1, GATE_Z + 4.4, TER.z1 - 0.4), // thềm trước cổng
  ...gateWalk(0, GATE_Z),
  rect(TER.x0 + 1, TER.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân vườn hoa
  rect(TER.x0 + 1, -HALL.hx - 1.2, NOI.z + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, TER.x1 - 1, NOI.z + 1, GATE_Z - 4.4),
  rect(TER.x0 + 1, TER.x1 - 1, NOI.z + 1, HALL.z1 - 1.4), // sân sau điện, trước nội viện
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: CENTER.x, z: CENTER.z, r: 1.2 },
  { x: 22, z: 2, r: 4 }, // ga cáp treo
];
const RITUALS = [
  { place: 'dien', y: Y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: Y + 3.2, z: HALL.z1 + 1.7 } },
  { place: 'san', y: Y, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: Y + 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(STAIR, x, z);
  if (s != null) return s;
  if (x >= TER.x0 && x <= TER.x1 && z >= TER.z0 && z <= TER.z1) {
    if (inHall(HALL, x, z)) return Y + 0.25;
    if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return Y + 0.3;
    return Y;
  }
  if (Math.abs(x) < 1.6 && z > SHORE - 2 && z < SHORE + 9) return 0.1;
  return 0;
}
const mountY = (x, z) => {
  const r = Math.hypot(x, z + 110);
  return r < 60 ? 30 : r < 100 ? 30 - (r - 60) * 0.4 : r < 140 ? 14 - (r - 100) * 0.3 : r < 170 ? 2 - (r - 140) * 0.07 : 0;
};

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#86b8de', skyBottom: '#e6ebe6', fog: [120, 600], fogColor: 0xdfe6e2 });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables } = K;
  const yellowWall = std('#e7c66e', { roughness: 0.8 });

  // ---------- Hồ Tuyền Lâm, núi Phụng Hoàng, rừng thông ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 400), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, SHORE - 200, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-44, 44, STAIR.zBottom, SHORE, 0, 'slab', { tile: 5.5, macro: 0.05 });
    box(700, 1.0, 1.0, M.stone, 0, -0.4, SHORE + 0.4);
    K.water(-800, 800, SHORE + 1, SHORE + 500, -0.6, { color: '#3f7a78' });
    box(2.4, 0.2, 10, std('#8a6a44'), 0, 0, SHORE + 4);
    // đồi thông bên kia hồ
    for (const [x, z, r, h] of [[-120, 200, 90, 40], [80, 260, 120, 55], [220, 140, 80, 34], [-260, 120, 90, 30]]) {
      const m = new THREE.Mesh(new THREE.LatheGeometry([[r, -1], [r * 0.55, h * 0.6], [r * 0.15, h], [0.01, h]].map(([a, b]) => new THREE.Vector2(a, b)), 40), std('#4c6a3c', { roughness: 0.95, flatShading: true }));
      m.position.set(x, -1, z);
      scene.add(m);
    }
    makeHill(K, 0, -110, [[0, 30], [60, 30], [100, 14], [140, 2], [170, -1]], { color: '#5a7442' });
    const spots = [...K.scatter(-180, 180, -230, -70, 150), ...K.scatter(-140, -36, -70, 44, 60), ...K.scatter(36, 140, -70, 44, 60)];
    K.pines(spots.map(([x, z]) => [x, z, Math.max(mountY(x, z), 0) - 0.2]));
  }

  // ---------- Bậc đá lên núi, nền thiền viện ----------
  {
    stairs({ ...STAIR, base: -0.5 });
    terrace(TER.x0, TER.x1, TER.z0, TER.z1, 0, Y, { side: std('#857c6c', { roughness: 1 }) });
    for (const s of [-1, 1]) {
      box(TER.x1 - STAIR.x1 - 0.4, 0.8, 0.3, M.stone, s * (TER.x1 + STAIR.x1 + 0.4) / 2, Y + 0.4, TER.z1 - 0.15);
      box(0.3, 0.8, TER.z1 - TER.z0, M.stone, s * (TER.x1 - 0.15), Y + 0.4, (TER.z0 + TER.z1) / 2);
    }
  }

  // ---------- Cổng tam quan, sân vườn hoa, gác chuông, chánh điện ----------
  K.gate3(0, GATE_Z, 'TRÚC LÂM THIỀN VIỆN', { walls: 18, y: Y, wall: yellowWall });
  const bells = [K.bellPavilion(BELL.x, BELL.z, Y)];
  cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, Y + 0.5, CENTER.z, {}, 16);
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.6);
    scene.add(b);
    K.lods.push({ obj: b, z });
  }, { wallMat: yellowWall });
  // bồn hoa: hai dải dọc lối giữa, quanh lư hương, hai bên chánh điện
  {
    const beds = [];
    for (let z = GATE_Z - 6; z >= HALL.z0 + 3; z -= 1.4) beds.push([-4.4, z, Y], [4.4, z, Y], [-12, z, Y], [12, z, Y]);
    for (let a = 0; a < 12; a++) beds.push([CENTER.x + Math.cos(a / 1.9) * 3.4, CENTER.z - 1 + Math.sin(a / 1.9) * 2.2, Y]);
    K.flowers(beds.filter(([x, z]) => Math.hypot(x - CENTER.x, z - CENTER.z - 1.8) > 2.2 && Math.hypot(x - BELL.x, z - BELL.z) > 4.5));
    for (const x of [-4.4, 4.4, -12, 12]) box(1.3, 0.3, GATE_Z - 6 - HALL.z0 - 2, M.stone, x, Y + 0.15, (GATE_Z - 6 + HALL.z0 + 3) / 2);
  }
  // nội viện: tường vàng, mái ngói, cổng đóng (khu thiền sinh tu tập)
  {
    box(TER.x1 - TER.x0 - 2, 2.6, 0.5, yellowWall, 0, Y + 1.3, NOI.z);
    box(TER.x1 - TER.x0 - 1.6, 0.2, 0.9, std('#6a3426'), 0, Y + 2.7, NOI.z);
    box(3.4, 2.4, 0.2, std('#5b3a24'), 0, Y + 1.2, NOI.z + 0.3);
    plaque(scene, 'NỘI VIỆN', 0, Y + 3.2, NOI.z + 0.35, 2.4, 0.5, 0, { size: 90 });
    for (const x of [-16, 0, 16]) {
      const g = group(x, Y, NOI.z - 8);
      box(10, 4, 6, yellowWall, 0, 2, 0, { parent: g });
      curvedRoof(g, 0, 4, 0, 5.8, 3.8, 1.6, 2.4, { lift: 0.7 });
    }
  }
  // ga cáp treo (từ đồi Robin): nhà ga, dây cáp, cabin trôi qua rừng thông
  {
    const st = group(22, Y, 2);
    box(7, 4.4, 7, std('#e9ecef', { roughness: 0.4, metalness: 0.2 }), 0, 2.2, 0, { parent: st });
    box(7.4, 0.4, 7.4, std('#c0392b'), 0, 4.6, 0, { parent: st });
    plaque(st, 'CÁP TREO', 0, 3.6, 3.55, 3.0, 0.5, 0, { size: 90 });
    const A = new THREE.Vector3(22, Y + 5, 2), B = new THREE.Vector3(260, 40, 160);
    const pts = [];
    for (let i = 0; i <= 60; i++) pts.push(new THREE.Vector3().lerpVectors(A, B, i / 60).add(new THREE.Vector3(0, -Math.sin(Math.PI * i / 60) * 12, 0)));
    const curve = new THREE.CatmullRomCurve3(pts);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)), new THREE.LineBasicMaterial({ color: '#333' })));
    const cabM = std('#2d6fb3', { roughness: 0.4 });
    const cabins = [];
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.6), cabM);
      c.castShadow = true;
      scene.add(c);
      cabins.push(c);
    }
    K.updaters.push((t) => cabins.forEach((c, i) => c.position.copy(curve.getPointAt(((t / 200) + i / 6) % 1)).add(new THREE.Vector3(0, -1.6, 0))));
  }
  K.pines([[-26, 8], [26, 12], [-26, -20], [26, -24], [-24, -40], [24, -40], [-10, 16], [10, 16]], Y, { scale: 0.9 });
  K.bamboo([[-26, -30, 10], [26, -12, 8]], Y);

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'truclamdl',
  name: 'Thiền viện Trúc Lâm Đà Lạt',
  loading: 'Sương sớm đang tan trên hồ Tuyền Lâm',
  hint: 'từ bến hồ Tuyền Lâm lên bậc đá qua cổng tam quan, dạo vườn hoa tới chánh điện',
  info: 'Thiền viện Trúc Lâm Đà Lạt nằm trên núi Phụng Hoàng bên hồ Tuyền Lâm, giữa rừng thông. Qua cổng tam quan là sân vườn hoa rực rỡ, gác chuông, chánh điện; phía sau là nội viện dành cho thiền sinh tu tập, khách không vào. Cáp treo từ đồi Robin bay qua rừng thông tới cạnh thiền viện. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông ở gác chuông bên trái sân để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa vườn hoa.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 44, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), mountY(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) || z < HALL.z0 ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa vườn hoa', text: 'Bạn sẽ bước tới lư hương đá giữa vườn hoa trước chánh điện, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'ho', name: 'Bến hồ Tuyền Lâm', x: 0, z: 44, ry: Math.PI },
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 17, ry: Math.PI },
    { id: 'hoa', name: 'Vườn hoa', x: 8, z: 0, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'cap', name: 'Ga cáp treo', x: 22, z: 7.6, ry: 0 },
  ],
  MAP: {
    box: [-45, -64, 90, 124],
    font: 4.4,
    shapes: [
      { x0: -45, x1: 45, z0: SHORE, z1: 60, c: 'm-water' },
      { x0: -44, x1: 44, z0: STAIR.zBottom, z1: SHORE, c: 'm-stone' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: TER.z1, c: 'm-terrace' },
      { x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.zTop, z1: STAIR.zBottom, c: 'm-stairs' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -16, x1: 16, z0: HALL.z0 + 3, z1: GATE_Z - 6, c: 'm-veg' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: NOI.z, c: 'm-wall' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x0: 18.5, x1: 25.5, z0: -1.5, z1: 5.5, c: 'm-stairs' },
    ],
    labels: [['ho', 0, 54, 'Hồ Tuyền Lâm'], ['gate', 0, 20, 'Cổng tam quan'], ['hoa', 0, 2, 'Vườn hoa'], ['chuong', BELL.x, BELL.z + 6, 'Gác chuông'], ['dien', 0, -25, 'Chánh điện'], ['cap', 22, 8, 'Cáp treo']],
  },
  OV: { bounds: { x0: -45, x1: 45, z0: -62, z1: 58 }, dist: 110, y: 8 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 0, act: 'bell' },
    { x: 8, z: 2, spread: 4, ry: 0, say: 'Hoa đẹp quá' },
    { x: 0, z: 45, spread: 18, ry: 0, say: 'Hồ Tuyền Lâm yên bình ghê' },
    { x: 18, z: 7, spread: 1.5, ry: 0.6, say: 'Cáp treo kìa' },
  ],
  BOT_SPAWN: [[-20, 20, 40, 46], [-14, 14, -12, 6]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Đà Lạt mát quá', 'Rừng thông thơm ghê', 'Hoa nở khắp sân', 'Thiền viện yên tĩnh thật'],
  build,
};
