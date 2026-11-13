// Chùa Giác Lâm (Tân Bình, TP. Hồ Chí Minh): ngôi chùa cổ hơn hai trăm năm, kiến trúc gỗ mái ngói âm dương. Qua cổng tam quan
// là sân có cây bồ đề, bảo tháp Phật bảy tầng bát giác; chánh điện bằng gỗ nhiều hàng cột sơn son chạm khắc, phía sau là nhà Tổ.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 46;
const YARD = { x0: -28, x1: 28, z0: -44, z1: 43 };
const HALL = { x: 0, z0: -6, z1: -26, hx: 12, y: 0, plaque: 'GIÁC LÂM TỰ', wallH: 6.2 };
const TO = { x: 0, z0: -31, z1: -40, hx: 8, y: 0, plaque: 'TỔ ĐƯỜNG', wallH: 4.8 };
const TOWER = { x: -17, z: 12, half: 3.6, tiers: 7 };
const BODHI = { x: 17, z: 16 };
const CENTER = { x: 0, z: 20 };

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 62),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4),
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, GATE_Z - 4.4),
  rect(YARD.x0 + 1, YARD.x1 - 1, TO.z0 + 0.6, HALL.z1 - 1.4),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, TO.z1 - 1.4),
  ...hallWalk(HALL),
  ...hallWalk(TO),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 2.3 },
  { x: BODHI.x, z: BODHI.z, r: 2.2 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
  { place: 'to', y: 0.25, burner: { x: 0, z: TO.z1 + 3.6 }, merit: { x: TO.hx - 2.4, z: TO.z1 + 3.4 }, face: { x: 0, y: 2.6, z: TO.z1 + 1.7 } },
  { place: 'thap', y: 0, stone: true, burner: { x: TOWER.x, z: TOWER.z + TOWER.half + 4.6 }, merit: { x: TOWER.x + 3.6, z: TOWER.z + TOWER.half + 4.4 }, face: { x: TOWER.x, y: 3, z: TOWER.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z) || inHall(TO, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#76aedb', skyBottom: '#ece5d2' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const woodWall = std('#7a5638', { roughness: 0.7 });
  const woodCol = std('#5a2f1c', { roughness: 0.55 });
  const brick = std('#b9704f', { roughness: 0.85 });

  // ---------- Phố, nhà cao quanh chùa ----------
  {
    const land = mesh(new THREE.BoxGeometry(500, 2, 500), [M.stoneD, M.stoneD, std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 64, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    const road = mesh(new THREE.PlaneGeometry(300, 10), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 69, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -140; x < 140; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 69, { cast: false });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'brick', { tile: 2.4, macro: 0.05 });
    const bld = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888'), std('#cfd4d8')];
    for (let i = 0; i < 22; i++) {
      const x = -105 + i * 10, h = 10 + ((i * 37) % 14);
      box(9.4, h, 10, bld[i % 5], x, h / 2, 80, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
      const h = 10 + ((i * 53) % 12);
      box(12, h, 11, bld[(i + 1) % 5], s * (36 + (i % 2) * 12), h / 2, 36 - i * 11, { cast: false });
    }
  }

  // ---------- Cổng, tường, sân ----------
  K.gate3(0, GATE_Z, 'GIÁC LÂM TỰ', { walls: 14, wall: std('#e8d5a8', { roughness: 0.85 }), col: woodCol });
  for (const s of [-1, 1]) {
    box(0.6, 2.8, GATE_Z - YARD.z0, std('#e8d5a8'), s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.8, 0.6, std('#e8d5a8'), 0, 1.4, YARD.z0 - 0.3);

  // ---------- Bảo tháp Phật bảy tầng bát giác ----------
  {
    const g = group(TOWER.x, 0, TOWER.z);
    cyl(TOWER.half + 2.0, TOWER.half + 2.2, 0.7, M.stone, 0, 0.35, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
    let y = 0.7, r = TOWER.half;
    for (let t = 0; t < TOWER.tiers; t++) {
      const h = t === 0 ? 3.4 : 2.5 - t * 0.08;
      cyl(r, r, h, brick, 0, y + h / 2, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        box(0.9, h * 0.5, 0.08, std('#3a2418'), Math.sin(a) * (r * 0.93), y + h * 0.45, Math.cos(a) * (r * 0.93), { parent: g, cast: false }).rotation.y = a;
      }
      y += h;
      curvedRoof(g, 0, y - 0.1, 0, r + 0.9, r + 0.9, 0.7, r * 0.5, { lift: 0.55 });
      y += 0.7;
      r -= 0.26;
    }
    cyl(0.6, 0.9, 0.8, M.gold, 0, y + 0.4, 0, { parent: g }, 8);
    mesh(new THREE.ConeGeometry(0.22, 2.4, 8), M.gold, 0, y + 2.0, 0, { parent: g });
    plaque(g, 'BẢO THÁP PHẬT', 0, 2.2, TOWER.half * 0.93 + 0.12, 2.6, 0.5, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 5, maxX: TOWER.x + 5, minZ: TOWER.z - 5, maxZ: TOWER.z + 5, lift: 26 });
  }

  // ---------- Cây bồ đề, lư hương đá, đèn ----------
  {
    cyl(0.6, 0.9, 4.5, M.trunk, BODHI.x, 2.25, BODHI.z, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 7, 0, 4.4], [-3, 6, 1, 3], [3, 6.2, -1, 3.2], [0.5, 6.4, 3, 2.6]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, BODHI.x + dx, dy, BODHI.z + dz).scale.set(s, s * 0.7, s);
    cyl(1.6, 1.8, 0.4, M.stone, BODHI.x, 0.2, BODHI.z, {}, 20);
    plaque(scene, 'CÂY BỒ ĐỀ', BODHI.x, 1.0, BODHI.z + 1.8, 1.8, 0.4, 0, { size: 80 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 8; z <= 40; z += 8) K.lampPost(s * 8, 0, z);
      K.flagPole(s * 5, 0, 41, 8);
    }
    K.flowers([[22, 36], [24, 36], [-22, 36], [-24, 36]]);
    K.forest([[-24, -10], [24, -10], [-24, -38], [24, -38]], 0, { scale: 1.1 });
  }

  // ---------- Chánh điện gỗ cổ, nhà Tổ ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.6);
    scene.add(b);
    lods.push({ obj: b, z });
    // hai hàng cột gỗ chạm trong điện
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cyl(0.26, 0.3, 6, woodCol, sx * 6.2, y + 3.2, -9.5 - k * 5, {}, 12);
  }, { wallMat: woodWall, colMat: woodCol, light: 9 });
  K.hall(TO, (y, z) => {
    for (const x of [-2.2, 0, 2.2]) {
      box(1.2, 1.7, 0.12, M.lacquer, x, y + 0.85, z - 0.4);
      box(1.0, 1.5, 0.02, std('#e9dcc0'), x, y + 0.85, z - 0.33, { cast: false });
    }
  }, { twoTier: false, wallMat: woodWall, colMat: woodCol, light: 6 });

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'giaclam',
  name: 'Chùa Giác Lâm',
  loading: 'Mái ngói cổ đang thức dậy giữa phố',
  hint: 'qua cổng tam quan vào sân có bảo tháp Phật và cây bồ đề, vào chánh điện gỗ cổ',
  info: 'Chùa Giác Lâm ở Tân Bình, TP. Hồ Chí Minh là ngôi chùa cổ hơn hai trăm năm, kiến trúc gỗ mái ngói âm dương. Qua cổng tam quan là sân có cây bồ đề và bảo tháp Phật bảy tầng bát giác; chánh điện bằng gỗ nhiều hàng cột sơn son chạm khắc, phía sau là nhà Tổ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân; phía sau thì trong nhà Tổ; dưới chân tháp thì ở lư hương đá của tháp.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 56, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(TO, x, z) || z < TO.z0 + 1) return 'to';
    if (inHall(HALL, x, z)) return 'dien';
    if (Math.hypot(x - TOWER.x, z - TOWER.z) < 14) return 'thap';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
    to: { title: 'Thắp nhang trong nhà Tổ', text: 'Bạn sẽ bước tới lư hương trước bàn thờ chư Tổ, chắp tay vái lạy tưởng nhớ các vị Tổ sư rồi cắm nhang.', done: ' dâng chư Tổ' },
    thap: { title: 'Thắp nhang trước bảo tháp Phật', text: 'Bạn sẽ bước tới lư hương đá trước bảo tháp bảy tầng, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
  },
  bowRy: (x, z) => (z < 40 && Math.hypot(x - TOWER.x, z - TOWER.z) < 13 ? Math.atan2(TOWER.x - x, TOWER.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 56, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 28, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp Phật', x: TOWER.x, z: TOWER.z + TOWER.half + 7.5, ry: Math.PI },
    { id: 'bode', name: 'Cây bồ đề', x: BODHI.x - 4, z: BODHI.z + 5, ry: Math.PI * 0.8 },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'to', name: 'Nhà Tổ', x: 0, z: TO.z0 + 1.6, ry: Math.PI },
  ],
  MAP: {
    box: [-34, -48, 68, 120],
    font: 3.8,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 64, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: -TO.hx, x1: TO.hx, z0: TO.z1, z1: TO.z0, c: 'm-hall' },
      { x: TOWER.x, z: TOWER.z, r: TOWER.half, c: 'm-tower' },
      { x: BODHI.x, z: BODHI.z, r: 3.4, c: 'm-tree' },
    ],
    labels: [['gate', 0, 56, 'Cổng tam quan'], ['san', 0, 28, 'Sân chùa'], ['thap', TOWER.x, TOWER.z - 7, 'Bảo tháp Phật'], ['bode', BODHI.x, BODHI.z - 5, 'Cây bồ đề'], ['dien', 0, -16, 'Chánh điện'], ['to', 0, -36, 'Nhà Tổ']],
  },
  OV: { bounds: { x0: -34, x1: 34, z0: -44, z1: 62 }, dist: 90 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: TOWER.x, z: TOWER.z + TOWER.half + 7.5, spread: 2, act: 'bow', ry: Math.PI },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: TO.z0 - 4, spread: 2, act: 'bow' },
    { x: 0, z: 54, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-20, 20, 10, 40], [-20, 20, -42, -27]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Chùa cổ mà yên tĩnh ghê', 'Gỗ chạm đẹp quá', 'Cây bồ đề to thiệt', 'Cầu bình an cho cả nhà'],
  build,
};
