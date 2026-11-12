// Chùa Quán Sứ (Hà Nội): ngôi chùa giữa phố, nơi đặt trụ sở Trung ương Giáo hội Phật giáo Việt Nam. Qua cổng tam quan là
// sân nhỏ có đỉnh hương, bậc thang lên chánh điện hai tầng mái đặt trên nền cao, hành lang hai bên treo đèn lồng;
// phía sau là nhà Tổ. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk } from './base.js';
import { makeBuddha, makeThichCa } from '../buddha.js';

const GATE_Z = 34;
const YARD = { x0: -26, x1: 26, z0: -38, z1: 31 };
const PL = { x0: -16, x1: 16, z0: -24, z1: 2, y: 1.8 }; // nền cao chánh điện
const ST = { x0: -5, x1: 5, zBottom: 6.5, zTop: PL.z1, y0: 0, y1: PL.y };
const HALL = { x: 0, z0: -2, z1: -20, hx: 12, y: PL.y, plaque: 'QUÁN SỨ TỰ', wallH: 6 };
const TO = { x: 0, z0: -27, z1: -36, hx: 8, y: 0, plaque: 'TỔ ĐƯỜNG', wallH: 4.6 };
const CAULDRON = { x: 0, z: 18 };

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 46), // phố Quán Sứ
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, ST.zBottom - 0.6, GATE_Z - 4.4), // sân trước
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.6), // bậc thang
  rect(PL.x0 + 0.8, PL.x1 - 0.8, HALL.z0 + 0.6, PL.z1 - 0.5), // thềm trước chánh điện
  rect(PL.x0 + 0.8, -HALL.hx - 1.0, PL.z0 + 0.7, HALL.z0 + 0.9), rect(HALL.hx + 1.0, PL.x1 - 0.8, PL.z0 + 0.7, HALL.z0 + 0.9),
  ...hallWalk(HALL),
  rect(YARD.x0 + 1, PL.x0 - 1.2, YARD.z0 + 1, ST.zBottom + 0.6), rect(PL.x1 + 1.2, YARD.x1 - 1, YARD.z0 + 1, ST.zBottom + 0.6), // lối hai bên nền
  rect(YARD.x0 + 1, YARD.x1 - 1, TO.z0 + 0.6, PL.z0 - 1.2), // sân sau, trước nhà Tổ
  rect(YARD.x0 + 1, -TO.hx - 1.2, YARD.z0 + 1, PL.z0 - 1.2), rect(TO.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, PL.z0 - 1.2),
  ...hallWalk(TO),
];
const ROUND_OBSTACLES = [{ x: CAULDRON.x, z: CAULDRON.z, r: 2.4 }];
const RITUALS = [
  { place: 'dien', y: PL.y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: PL.y + 3.2, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CAULDRON.x, z: CAULDRON.z + 4.2 }, merit: { x: CAULDRON.x + 3.6, z: CAULDRON.z + 4.0 }, face: { x: 0, y: 2.4, z: CAULDRON.z } },
  { place: 'to', y: 0.25, burner: { x: 0, z: TO.z1 + 3.6 }, merit: { x: TO.hx - 2.4, z: TO.z1 + 3.4 }, face: { x: 0, y: 2.6, z: TO.z1 + 1.7 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(ST, x, z);
  if (s != null) return s;
  if (x >= PL.x0 && x <= PL.x1 && z >= PL.z0 && z <= PL.z1) return inHall(HALL, x, z) ? PL.y + 0.25 : PL.y;
  if (inHall(TO, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7fb0d6', skyBottom: '#ebe7dc' });
  const { scene, M, std, mesh, box, cyl, floor, terrace, stairs, plaque, pickables, lods } = K;
  const yellow = std('#e7c66e', { roughness: 0.8 });

  // ---------- Phố, nhà cao tầng quanh chùa ----------
  {
    const land = mesh(new THREE.BoxGeometry(500, 2, 500), [M.stoneD, M.stoneD, std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 48, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    const road = mesh(new THREE.PlaneGeometry(300, 10), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 53, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -140; x < 140; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 53, { cast: false });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const bld = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888'), std('#cfd4d8')];
    for (let i = 0; i < 22; i++) {
      const x = -105 + i * 10, h = 10 + ((i * 37) % 14);
      box(9.4, h, 10, bld[i % 5], x, h / 2, 64, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
      const h = 12 + ((i * 53) % 12);
      box(12, h, 11, bld[(i + 1) % 5], s * (38 + (i % 2) * 12), h / 2, 28 - i * 11, { cast: false });
    }
  }

  // ---------- Cổng, tường, sân, đỉnh hương ----------
  K.gate3(0, GATE_Z, 'QUÁN SỨ TỰ', { walls: 15, wall: yellow });
  {
    for (const s of [-1, 1]) {
      box(0.6, 2.8, GATE_Z - YARD.z0, yellow, s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
      K.lion(s * 4.2, 0, GATE_Z + 3.4);
    }
    box(YARD.x1 - YARD.x0, 2.8, 0.6, yellow, 0, 1.4, YARD.z0 - 0.3);
    const { x: cx, z: cz } = CAULDRON;
    cyl(1.9, 2.1, 0.5, M.stone, cx, 0.25, cz, {}, 32);
    const prof = [[0, 0], [0.9, 0.05], [1.2, 0.45], [1.25, 1.0], [1.1, 1.3], [1.3, 1.4], [1.3, 1.5]].map(([x, y]) => new THREE.Vector2(x, y));
    const pot = mesh(new THREE.LatheGeometry(prof, 32), M.bronze, cx, 1.2, cz);
    pot.material.side = THREE.DoubleSide;
    for (const s of [-1, 1]) {
      for (let z = 10; z <= 28; z += 6) K.lampPost(s * 8, 0, z);
      K.flagPole(s * 5, 0, 29, 8);
    }
    // đèn lồng đỏ dọc hai bên sân
    const lantern = std('#d23a2a', { emissive: '#ff5a30', emissiveIntensity: 0.35, roughness: 0.6 });
    for (const s of [-1, 1]) for (let z = 8; z <= 28; z += 4) {
      cyl(0.03, 0.03, 1.2, M.wood, s * 20, 3.6, z, {}, 5);
      mesh(new THREE.SphereGeometry(0.34, 10, 8), lantern, s * 20, 2.8, z).scale.y = 1.25;
    }
    K.forest([[-22, 26], [22, 26], [-22, -6], [22, -6], [-22, -34], [22, -34]], 0, { scale: 1.1 });
  }

  // ---------- Nền cao, bậc thang, chánh điện ----------
  {
    terrace(PL.x0, PL.x1, PL.z0, PL.z1, 0, PL.y, { side: std('#a59a86', { roughness: 1 }) });
    stairs({ ...ST, base: -0.4 });
    for (const s of [-1, 1]) box(PL.x1 - ST.x1 - 0.4, 0.8, 0.3, M.stone, s * (PL.x1 + ST.x1 + 0.4) / 2, PL.y + 0.4, PL.z1 - 0.15);
    K.hall(HALL, (y, z) => {
      const mid = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      mid.position.set(0, y, z);
      mid.scale.setScalar(1.5);
      scene.add(mid);
      lods.push({ obj: mid, z });
      const side = makeBuddha({ quality: 'low' });
      for (const x of [-5.6, 5.6]) {
        const b = x < 0 ? side : side.clone();
        b.position.set(x, y, z + 0.3);
        b.scale.setScalar(1.05);
        b.traverse((m) => (m.castShadow = false));
        scene.add(b);
        lods.push({ obj: b, x, z });
      }
    }, { wallMat: yellow });
  }

  // ---------- Nhà Tổ phía sau ----------
  K.hall(TO, (y, z) => {
    for (const x of [-2.2, 0, 2.2]) {
      box(1.2, 1.7, 0.12, M.lacquer, x, y + 0.85, z - 0.4);
      box(1.0, 1.5, 0.02, std('#e9dcc0'), x, y + 0.85, z - 0.33, { cast: false });
    }
  }, { twoTier: false, wallMat: yellow, light: 6 });

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'quansu',
  name: 'Chùa Quán Sứ',
  loading: 'Đang mở cổng chùa Quán Sứ',
  hint: 'qua cổng vào sân, lên bậc thang tới chánh điện trên nền cao, phía sau là nhà Tổ',
  info: 'Chùa Quán Sứ ở Hà Nội là ngôi chùa giữa phố, nơi đặt trụ sở Trung ương Giáo hội Phật giáo Việt Nam. Qua cổng tam quan là sân có đỉnh hương, bậc thang lên chánh điện hai tầng mái trên nền cao; phía sau là nhà Tổ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở đỉnh hương; phía sau thì trong nhà Tổ.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 42, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(TO, x, z) || z < PL.z0 - 1) return 'to';
    if (x >= PL.x0 && x <= PL.x1 && z >= PL.z0 && z <= PL.z1) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang trước đỉnh hương giữa sân', text: 'Bạn sẽ bước tới lư hương đá trước đỉnh hương giữa sân chùa, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: '' },
    to: { title: 'Thắp nhang trong nhà Tổ', text: 'Bạn sẽ bước tới lư hương trước bàn thờ chư Tổ, chắp tay vái lạy tưởng nhớ các vị Tổ sư rồi cắm nhang.', done: ' dâng chư Tổ' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 42, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 26, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 2.5, ry: Math.PI },
    { id: 'to', name: 'Nhà Tổ', x: 0, z: TO.z0 + 1.2, ry: Math.PI },
  ],
  MAP: {
    box: [-30, -40, 60, 88],
    font: 3.6,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 48, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: PL.x0, x1: PL.x1, z0: PL.z0, z1: PL.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: -TO.hx, x1: TO.hx, z0: TO.z1, z1: TO.z0, c: 'm-hall' },
      { x: CAULDRON.x, z: CAULDRON.z, r: 2.2, c: 'm-statue' },
    ],
    labels: [['gate', 0, 42, 'Cổng chùa'], ['san', 0, 26, 'Sân chùa'], ['dien', 0, -11, 'Chánh điện'], ['to', 0, -31.5, 'Nhà Tổ']],
  },
  OV: { bounds: { x0: -30, x1: 30, z0: -38, z1: 46 }, dist: 85 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CAULDRON.z + 6.2, spread: 3, act: 'gassho' },
    { x: 0, z: TO.z0 - 4, spread: 2, act: 'bow' },
    { x: 0, z: 42, spread: 20, ry: 0 },
    { x: -20, z: 16, spread: 3, ry: Math.PI / 2 },
  ],
  BOT_SPAWN: [[-20, 20, 10, 30], [-30, 30, 39, 44]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Chùa giữa phố mà yên tĩnh', 'Đèn lồng đẹp quá', 'Đi lễ đầu tháng', 'Cầu cho cả nhà bình an'],
  build,
};
