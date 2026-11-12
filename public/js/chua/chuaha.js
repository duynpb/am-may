// Chùa Hà (Thánh Chúa tự, Cầu Giấy, Hà Nội): ngôi chùa nhỏ giữa phố, nổi tiếng là nơi các bạn trẻ đến cầu duyên.
// Qua cổng tam quan là sân có cây duyên treo dải lụa đỏ, giếng cổ, cây đa; chánh điện thờ Phật, bên phải điện Mẫu.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';
import { buildDuyenTree } from '../duyen.js';

const GATE_Z = 32;
const YARD = { x0: -24, x1: 24, z0: -20, z1: 29 };
const HALL = { x: -6, z0: 2, z1: -14, hx: 10, y: 0, plaque: 'TAM BẢO', wallH: 5.6 };
const MAU = { x: 15, z0: 0, z1: -10, hx: 6, y: 0, plaque: 'ĐIỆN MẪU', wallH: 4.8 };
const TREE = { x: -10, y: 0, z: 15, r: 1.5 }; // cây duyên
const STAND = { x: -9, z: 17.6, ry: Math.atan2(-10 + 9, 15 - 17.6) }; // chỗ đứng thắt lụa
const WELL = { x: 15, z: 16, r: 1.6 };
const BANYAN = { x: 17, z: 25 };
const CENTER = { x: 2, z: 13 };

const WALK_AREAS = [
  rect(-44, 44, GATE_Z + 4.2, 44), // phố Chùa Hà
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân trước
  rect(YARD.x0 + 1, HALL.x - HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), // lối trái
  rect(HALL.x + HALL.hx + 1.2, MAU.x - MAU.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), // lối giữa chánh điện và điện Mẫu
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4), // sân sau
  rect(MAU.x - MAU.hx - 1.2, YARD.x1 - 1, YARD.z0 + 1, MAU.z1 - 1.4),
  rect(HALL.x + HALL.hx + 1.2, YARD.x1 - 1, MAU.z0 + 0.6, HALL.z0 + 1.0), // trước cửa điện Mẫu
  ...hallWalk(HALL),
  ...hallWalk(MAU),
];
const ROUND_OBSTACLES = [
  { x: TREE.x, z: TREE.z, r: TREE.r + 0.2 },
  { x: WELL.x, z: WELL.z, r: WELL.r + 0.5 },
  { x: BANYAN.x, z: BANYAN.z, r: 1.6 },
  { x: CENTER.x, z: CENTER.z, r: 1.0 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: HALL.x, z: HALL.z1 + 3.8 }, merit: { x: HALL.x + HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: HALL.x, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'mau', y: 0.25, burner: { x: MAU.x, z: MAU.z1 + 3.8 }, merit: { x: MAU.x + MAU.hx - 2.4, z: MAU.z1 + 3.6 }, face: { x: MAU.x, y: 2.6, z: MAU.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: HALL.x, y: 3, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z) || inHall(MAU, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7fb0d6', skyBottom: '#ebe7dc' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, updaters, lods } = K;
  const ochre = std('#e3b45a', { roughness: 0.85 });

  // ---------- Phố, nhà phố hai bên ----------
  {
    const land = mesh(new THREE.BoxGeometry(500, 2, 500), [M.stoneD, M.stoneD, std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 46, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    const road = mesh(new THREE.PlaneGeometry(300, 10), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 51, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -140; x < 140; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 51, { cast: false });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'brick', { tile: 2.4, macro: 0.05 });
    const shop = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888'), std('#e6c9a8')];
    for (let i = 0; i < 22; i++) {
      const x = -105 + i * 10, h = 8 + ((i * 37) % 10);
      box(9.4, h, 10, shop[i % 5], x, h / 2, 62, { cast: false });
      box(9.6, 0.4, 1.4, std('#7a3a26'), x, 3.4, 56.6, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const h = 9 + ((i * 53) % 9);
      box(12, h, 11, shop[(i + 2) % 5], s * (34 + (i % 2) * 12), h / 2, 22 - i * 11, { cast: false });
    }
  }

  // ---------- Cổng tam quan, tường bao ----------
  K.gate3(0, GATE_Z, 'THÁNH CHÚA TỰ', { walls: 13, wall: ochre });
  for (const s of [-1, 1]) {
    box(0.6, 2.8, GATE_Z - YARD.z0, ochre, s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.8, 0.6, ochre, 0, 1.4, YARD.z0 - 0.3);

  // ---------- Sân: cây duyên treo lụa đỏ, giếng cổ, cây đa, lư hương đá ----------
  const tree = buildDuyenTree({ scene, std, pickables, at: TREE });
  updaters.push((t) => tree.update(t));
  plaque(scene, 'CÂY DUYÊN', TREE.x, 1.0, TREE.z + 1.5, 1.8, 0.4, 0, { size: 80 });
  {
    cyl(WELL.r, WELL.r + 0.2, 0.9, M.stone, WELL.x, 0.45, WELL.z, {}, 24);
    mesh(new THREE.CircleGeometry(WELL.r - 0.25, 24).rotateX(-Math.PI / 2), std('#2f5f63', { roughness: 0.1, metalness: 0.3 }), WELL.x, 0.7, WELL.z, { cast: false });
    for (const s of [-1, 1]) box(0.14, 1.8, 0.14, M.wood, WELL.x + s * 1.2, 1.3, WELL.z);
    box(2.6, 0.14, 0.14, M.wood, WELL.x, 2.2, WELL.z);
    // cây đa cổ thụ
    cyl(0.7, 1.0, 5, M.trunk, BANYAN.x, 2.5, BANYAN.z, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 7, 0, 4.4], [-3, 6, 1, 3], [3, 6.2, -1, 3.2], [1, 6.6, 3, 2.8]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leafD, BANYAN.x + dx, dy, BANYAN.z + dz).scale.set(s, s * 0.7, s);
    for (let k = 0; k < 8; k++) cyl(0.04, 0.04, 3, M.trunk, BANYAN.x - 2 + k * 0.6, 3.6, BANYAN.z + 1.5 - (k % 3), {}, 5); // rễ phụ
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    K.flowers([[-20, 26], [-18, 26], [-16, 26], [20, 6], [20, 8], [-20, 4], [-20, 6], [8, 26], [10, 26]]);
    // đèn lồng đỏ treo dọc lối giữa
    const lantern = std('#d23a2a', { emissive: '#ff5a30', emissiveIntensity: 0.35, roughness: 0.6 });
    for (let z = 6; z <= 26; z += 4) for (const x of [-3.5, 3.5]) {
      cyl(0.03, 0.03, 1.2, M.wood, x, 3.4, z, {}, 5);
      mesh(new THREE.SphereGeometry(0.32, 10, 8), lantern, x, 2.6, z).scale.y = 1.25;
    }
    for (const s of [-1, 1]) K.flagPole(s * 6, 0, 27, 7);
  }

  // ---------- Chánh điện (Tam Bảo) và điện Mẫu ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(HALL.x, y, z);
    b.scale.setScalar(1.35);
    scene.add(b);
    lods.push({ obj: b, x: HALL.x, z });
    for (const dx of [-5.2, 5.2]) {
      const qa = K.gild(makeQuanAm({ quality: 'low', color: '#f3c560' }), { color: '#f3c560' });
      qa.position.set(HALL.x + dx, y, z + 0.3);
      qa.scale.setScalar(0.85);
      scene.add(qa);
      lods.push({ obj: qa, x: HALL.x + dx, z });
    }
  }, { wallMat: ochre });
  K.hall(MAU, (y, z) => {
    // khám thờ Thánh Mẫu đóng rèm đỏ, ba bài vị
    const red = std('#b3261b', { roughness: 0.8 });
    box(3.0, 2.4, 1.1, M.lacquer, MAU.x, y + 1.2, z - 0.3);
    box(3.2, 0.2, 1.3, M.gold, MAU.x, y + 2.5, z - 0.3);
    box(2.4, 1.8, 0.05, red, MAU.x, y + 1.3, z + 0.28);
    for (const x of [-0.8, 0, 0.8]) box(0.45, 0.8, 0.08, M.gold, MAU.x + x, y + 0.4, z + 0.65);
  }, { twoTier: false, wallMat: ochre, light: 6 });

  const world = K.finish({ rituals: RITUALS });
  world.duyen = { ...tree, stand: STAND, addRibbon: tree.addRibbon };
  return world;
}

export const SITE = {
  id: 'chuaha',
  name: 'Chùa Hà',
  loading: 'Cây duyên đang đợi những dải lụa đỏ',
  hint: 'chùa nhỏ giữa phố nổi tiếng cầu duyên — bấm “Cầu duyên” để viết sớ và thắt dải lụa đỏ lên cây duyên',
  info: 'Chùa Hà (Thánh Chúa tự) ở Cầu Giấy, Hà Nội là ngôi chùa nhỏ giữa phố, nổi tiếng là nơi các bạn trẻ đến cầu duyên. Qua cổng tam quan là sân có cây duyên treo dải lụa đỏ, giếng cổ, cây đa; chánh điện thờ Phật và Quan Âm, bên phải là điện Mẫu. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu duyên', 'Bấm “Cầu duyên” ở thanh dưới (hoặc chạm vào cây duyên), viết sớ rồi dâng: bạn đi tới gốc cây, chắp tay và thắt một dải lụa đỏ lên cây; mọi người thấy dải lụa của bạn.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ Phật; trong điện Mẫu thì trước khám thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 40, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(MAU, x, z)) return 'mau';
    if (inHall(HALL, x, z)) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    mau: { title: 'Thắp nhang trong điện Mẫu', text: 'Bạn sẽ bước tới lư hương trước khám thờ Thánh Mẫu, chắp tay vái lạy rồi cắm nhang.', done: '' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 40, ry: Math.PI },
    { id: 'duyen', name: 'Cây duyên', x: STAND.x, z: STAND.z + 1, ry: STAND.ry },
    { id: 'dien', name: 'Chánh điện', x: HALL.x, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'mau', name: 'Điện Mẫu', x: MAU.x, z: MAU.z0 + 3, ry: Math.PI },
    { id: 'gieng', name: 'Giếng cổ', x: WELL.x - 3.5, z: WELL.z + 3, ry: Math.PI * 0.75 },
  ],
  MAP: {
    box: [-30, -24, 60, 72],
    font: 3.4,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 46, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: HALL.x - HALL.hx, x1: HALL.x + HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: MAU.x - MAU.hx, x1: MAU.x + MAU.hx, z0: MAU.z1, z1: MAU.z0, c: 'm-hall' },
      { x: TREE.x, z: TREE.z, r: 2, c: 'm-tree' },
      { x: BANYAN.x, z: BANYAN.z, r: 3.5, c: 'm-tree' },
      { x: WELL.x, z: WELL.z, r: WELL.r, c: 'm-water' },
    ],
    labels: [['gate', 0, 40, 'Cổng chùa'], ['duyen', TREE.x, TREE.z + 4, 'Cây duyên'], ['dien', HALL.x, -6, 'Chánh điện'], ['mau', MAU.x, -5, 'Điện Mẫu'], ['gieng', WELL.x, WELL.z - 3, 'Giếng cổ']],
  },
  OV: { bounds: { x0: -30, x1: 30, z0: -22, z1: 44 }, dist: 80 },
  TRIPS: [
    { x: HALL.x, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: MAU.x, z: MAU.z1 + 6, spread: 2, act: 'bow' },
    { x: STAND.x - 1.5, z: STAND.z + 0.8, spread: 1.5, act: 'gassho', ry: Math.atan2(TREE.x - STAND.x + 1.5, TREE.z - STAND.z - 0.8), say: 'Cầu cho gặp được người thương' },
    { x: CENTER.x, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 40, spread: 20, ry: 0 },
  ],
  BOT_SPAWN: [[-18, 18, 6, 26], [-30, 30, 37, 42]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Mong năm nay có người yêu', 'Cây duyên nhiều lụa đỏ quá', 'Chùa nhỏ mà ấm cúng ghê', 'Cầu cho gia đình bình an'],
  build,
};
