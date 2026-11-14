// Chùa Vĩnh Tràng (Mỹ Tho): ngôi chùa kiến trúc pha Việt – Khmer – Âu – Hoa nổi tiếng đồng bằng sông Cửu Long. Qua cổng tam quan
// là sân vườn rộng có ba pho tượng lớn ngoài trời: Phật Di Lặc bụng tròn, Phật Thích Ca ngồi thiền, Phật nằm; chánh điện nhiều
// lớp mái ở giữa, vườn cây ăn trái và cây kiểng xung quanh. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa, loadRecliningBuddha, RELIEF_NAM, loadDiLac } from '../buddha.js';

const GATE_Z = 50;
const YARD = { x0: -42, x1: 42, z0: -52, z1: 47 };
const HALL = { x: 0, z0: 0, z1: -20, hx: 12, y: 0, plaque: 'VĨNH TRÀNG TỰ', wallH: 6.2 };
const DILAC = { x: -26, z: 26, r: 4.2 }; // Phật Di Lặc
const DILAC_H = 4.0; // chiều cao tượng Di Lặc mẫu (rộng ~6,7 m, sâu ~4,3 m, vừa bệ tròn)
const THICHCA = { x: 26, z: 26, r: 4.2 }; // Phật Thích Ca ngồi thiền
const NAM = { x: 0, z: -40, len: 18 }; // Phật nằm sau chánh điện
const CENTER = { x: 0, z: 16 };

const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 66),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân trước chánh điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, GATE_Z - 4.4), // hai bên điện
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4), // sau điện (Phật nằm)
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: DILAC.x, z: DILAC.z, r: DILAC.r + 0.6 },
  { x: THICHCA.x, z: THICHCA.z, r: THICHCA.r + 0.6 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
  { place: 'nam', y: 0, stone: true, burner: { x: NAM.x + 12, z: NAM.z + 7.5 }, merit: { x: NAM.x + 15.6, z: NAM.z + 7.3 }, face: { x: NAM.x, y: 2, z: NAM.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#74b0dc', skyBottom: '#efe7d3' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const wallC = std('#efe0bd', { roughness: 0.8 });
  const white = std('#f4f1ea', { roughness: 0.6 });

  // ---------- Đất, ruộng và vườn cây miền Tây ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -20, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 68, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    K.water(-300, 300, 80, 300, -0.4, { color: '#6b8f6a' }); // sông Tiền xa phía trước
    K.palms([...Array.from({ length: 12 }, (_, i) => [-48 + i * 9, 66.5]), [-46, 30], [-46, 0], [46, 30], [46, 0], [-46, -30], [46, -30]]);
    K.forest(K.scatter(-160, 160, -150, -56, 80), 0, { scale: 1.1 });
  }

  // ---------- Cổng tam quan, tường ----------
  K.gate3(0, GATE_Z, 'VĨNH TRÀNG TỰ', { walls: 28, wall: wallC });
  for (const s of [-1, 1]) {
    box(0.6, 2.6, GATE_Z - YARD.z0, wallC, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.6, 0.6, wallC, 0, 1.3, YARD.z0 - 0.3);

  // ---------- Ba pho tượng lớn ngoài trời ----------
  {
    // Phật Di Lặc (bệ tròn + tượng mẫu)
    const g = group(DILAC.x, 0, DILAC.z, 0.3);
    cyl(DILAC.r, DILAC.r + 0.4, 1.4, white, 0, 0.7, 0, { parent: g }, 28);
    // tượng Di Lặc (mẫu khắc maufree.vn số 6863): nạp xong thì đặt lên bệ; lỗi thì chỉ còn bệ trống
    loadDiLac().then((st) => {
      const m = st.clone();
      m.scale.setScalar(DILAC_H);
      m.position.y = 1.4;
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }).catch((e) => console.warn('Không nạp được tượng Di Lặc mẫu', e));
    plaque(scene, 'PHẬT DI LẶC', DILAC.x + Math.sin(0.3) * (DILAC.r + 0.1), 0.9, DILAC.z + Math.cos(0.3) * (DILAC.r + 0.1), 2.6, 0.5, 0.3, { size: 90 });

    // Phật Thích Ca ngồi thiền trên tòa sen lớn, cùng mẫu tượng chánh điện Am Mây
    const p = group(THICHCA.x, 0, THICHCA.z, -0.3);
    cyl(THICHCA.r, THICHCA.r + 0.4, 1.4, white, 0, 0.7, 0, { parent: p }, 28);
    cyl(THICHCA.r - 0.8, THICHCA.r - 0.5, 1.0, white, 0, 1.9, 0, { parent: p }, 28);
    const b = K.gild(makeThichCa({ stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
    b.position.set(THICHCA.x, 2.4, THICHCA.z);
    b.scale.setScalar(2.6);
    b.rotation.y = -0.3;
    scene.add(b);
    plaque(scene, 'PHẬT THÍCH CA', THICHCA.x - Math.sin(0.3) * (THICHCA.r + 0.1), 0.9, THICHCA.z + Math.cos(0.3) * (THICHCA.r + 0.1), 2.6, 0.5, -0.3, { size: 90 });
    K.roofs.push({ minX: THICHCA.x - 6, maxX: THICHCA.x + 6, minZ: THICHCA.z - 6, maxZ: THICHCA.z + 6, lift: 16 });

    // Phật nằm đá trắng sau chánh điện
    const S = NAM.len / RELIEF_NAM.length;
    box(NAM.len + 2, 0.8, RELIEF_NAM.depth * S + 2, M.stone, NAM.x, 0.4, NAM.z);
    loadRecliningBuddha().then((m) => {
      const t = m.clone();
      t.scale.setScalar(S);
      t.position.set(NAM.x, 0.82, NAM.z);
      t.castShadow = t.receiveShadow = true;
      scene.add(t);
    }).catch((e) => console.warn('Không nạp được tượng Phật nằm', e));
    plaque(scene, 'PHẬT NHẬP NIẾT BÀN', NAM.x, 0.4, NAM.z + RELIEF_NAM.depth * S / 2 + 1.05, 3.6, 0.5, 0, { size: 80 });
  }

  // ---------- Chánh điện nhiều lớp mái ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.6);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: wallC });

  // ---------- Sân: lư hương, cây kiểng, chậu hoa, đèn ----------
  {
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    K.flowers([[-10, 36], [-12, 36], [-14, 36], [10, 36], [12, 36], [14, 36], [-38, 10], [38, 10], [-38, 20], [38, 20]]);
    for (const s of [-1, 1]) {
      for (let z = 8; z <= 44; z += 9) K.lampPost(s * 8, 0, z);
      K.flagPole(s * 5, 0, 46, 8);
    }
    // cây kiểng tỉa hình trong chậu
    const pot = std('#b86a3a', { roughness: 0.8 });
    for (const [x, z] of [[-16, 6], [16, 6], [-16, 40], [16, 40]]) {
      cyl(0.7, 0.5, 0.8, pot, x, 0.4, z, {}, 12);
      mesh(new THREE.SphereGeometry(1.0, 12, 10), M.leaf, x, 1.6, z).scale.y = 1.2;
    }
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'vinhtrang',
  name: 'Chùa Vĩnh Tràng',
  loading: 'Gió sông Tiền thổi vào sân chùa',
  hint: 'qua cổng vào sân vườn, ngắm Phật Di Lặc, Phật Thích Ca ngoài trời và Phật nằm sau chánh điện',
  info: 'Chùa Vĩnh Tràng ở Mỹ Tho là ngôi chùa kiến trúc pha Việt – Khmer – Âu – Hoa nổi tiếng đồng bằng sông Cửu Long. Qua cổng tam quan là sân vườn rộng có ba pho tượng lớn ngoài trời: Phật Di Lặc, Phật Thích Ca ngồi thiền và Phật nằm sau chánh điện; chánh điện nhiều lớp mái ở giữa, quanh chùa là vườn dừa và cây kiểng. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Ba pho tượng lớn', 'Đi dạo trong sân để thấy Phật Di Lặc bên trái, Phật Thích Ca bên phải, và vòng ra sau chánh điện để gặp Phật nằm.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân; phía sau thì trước tượng Phật nằm.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 59, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < HALL.z1 - 1) return 'nam';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
    nam: { title: 'Thắp nhang trước tượng Phật nằm', text: 'Bạn sẽ bước tới lư hương đá trước tượng Phật nhập Niết Bàn sau chánh điện, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 59, ry: Math.PI },
    { id: 'dilac', name: 'Phật Di Lặc', x: DILAC.x + 1, z: DILAC.z + DILAC.r + 4, ry: Math.PI },
    { id: 'thichca', name: 'Phật Thích Ca', x: THICHCA.x - 1, z: THICHCA.z + THICHCA.r + 4, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'nam', name: 'Phật nằm', x: NAM.x, z: NAM.z + 9.5, ry: Math.PI },
  ],
  MAP: {
    box: [-48, -56, 96, 122],
    font: 5,
    shapes: [
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 68, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: DILAC.x, z: DILAC.z, r: DILAC.r, c: 'm-gold' },
      { x: THICHCA.x, z: THICHCA.z, r: THICHCA.r, c: 'm-white' },
      { x0: NAM.x - NAM.len / 2, x1: NAM.x + NAM.len / 2, z0: NAM.z - 2, z1: NAM.z + 2, c: 'm-white' },
    ],
    labels: [['gate', 0, 60, 'Cổng tam quan'], ['dilac', DILAC.x, DILAC.z - 6, 'Phật Di Lặc'], ['thichca', THICHCA.x, THICHCA.z - 6, 'Phật Thích Ca'], ['dien', 0, -10, 'Chánh điện'], ['nam', NAM.x, NAM.z - 5, 'Phật nằm']],
  },
  OV: { bounds: { x0: -48, x1: 48, z0: -52, z1: 66 }, dist: 110 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: DILAC.x + 1, z: DILAC.z + DILAC.r + 4, spread: 2, ry: Math.PI, say: 'Phật Di Lặc cười hiền quá' },
    { x: THICHCA.x - 1, z: THICHCA.z + THICHCA.r + 4, spread: 2, act: 'bow', ry: Math.PI },
    { x: NAM.x + 4, z: NAM.z + 9.5, spread: 5, act: 'gassho' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
  ],
  BOT_SPAWN: [[-30, 30, 10, 46], [-30, 30, -30, -24]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Tượng Phật to quá', 'Chùa pha nhiều kiểu thiệt', 'Gió sông Tiền mát ghê', 'Phật nằm hiền từ quá'],
  build,
};
