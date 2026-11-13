// Chùa Ngọc Hoàng (Phước Hải, Đa Kao, TP. Hồ Chí Minh): ngôi chùa của người Hoa thờ Ngọc Hoàng Thượng Đế. Qua cổng tam quan
// là sân có hai hồ nuôi rùa hai bên lối giữa; điện chính màu son – vàng, mái ngói lưu ly xanh, trong điện treo những vòng
// hương xoắn ốc và đặt tượng Ngọc Hoàng cùng tứ đại thiên vương. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeBuddha } from '../buddha.js';

const GATE_Z = 40;
const YARD = { x0: -27, x1: 27, z0: -34, z1: 37 };
const HALL = { x: 0, z0: 0, z1: -20, hx: 12, y: 0, plaque: 'NGỌC HOÀNG ĐIỆN', wallH: 6.4 };
const PL = { x0: -22, x1: -6, z0: 9, z1: 28 }; // hồ rùa trái
const PR = { x0: 6, x1: 22, z0: 9, z1: 28 }; // hồ rùa phải
const CENTER = { x: 0, z: 18 };

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 58),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, PL.z1 + 1.2, GATE_Z - 4.4), // dải trước hai hồ
  rect(YARD.x0 + 1, PL.x0 - 1.5, HALL.z0 + 0.6, PL.z1 + 1.6), rect(PR.x1 + 1.5, YARD.x1 - 1, HALL.z0 + 0.6, PL.z1 + 1.6), // hai bên hồ
  rect(PL.x1 + 1.5, PR.x0 - 1.5, HALL.z0 + 0.6, PL.z1 + 1.6), // lối giữa
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, PL.z0 - 1.5), // dải giữa hồ và điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [{ x: CENTER.x, z: CENTER.z, r: 1.1 }];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 4.0 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.8 }, face: { x: 0, y: 3.6, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#76aedb', skyBottom: '#ece3d0' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, updaters, lods } = K;
  const redC = std('#b5261b', { roughness: 0.5 });
  const wall = std('#d84a2c', { roughness: 0.7 });
  const tile = std('#2f8a6a', { roughness: 0.35, metalness: 0.2 });

  // ---------- Phố, nhà cao ----------
  {
    const land = mesh(new THREE.BoxGeometry(500, 2, 500), [M.stoneD, M.stoneD, std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 60, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    const road = mesh(new THREE.PlaneGeometry(300, 10), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 64, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -140; x < 140; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 64, { cast: false });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const bld = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888'), std('#cfd4d8')];
    for (let i = 0; i < 22; i++) {
      const x = -105 + i * 10, h = 10 + ((i * 37) % 14);
      box(9.4, h, 10, bld[i % 5], x, h / 2, 75, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const h = 10 + ((i * 53) % 12);
      box(12, h, 11, bld[(i + 1) % 5], s * (34 + (i % 2) * 12), h / 2, 30 - i * 11, { cast: false });
    }
  }

  // ---------- Cổng đỏ, tường ----------
  K.gate3(0, GATE_Z, 'NGỌC HOÀNG TỰ', { walls: 12, wall, col: redC });
  for (const s of [-1, 1]) {
    box(0.6, 2.8, GATE_Z - YARD.z0, wall, s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.8, 0.6, wall, 0, 1.4, YARD.z0 - 0.3);

  // ---------- Hai hồ rùa ----------
  {
    for (const P of [PL, PR]) {
      for (const z of [P.z0 - 0.3, P.z1 + 0.3]) box(P.x1 - P.x0 + 1.1, 0.8, 0.5, M.stone, (P.x0 + P.x1) / 2, 0.4, z);
      for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.8, P.z1 - P.z0 + 1.1, M.stone, x, 0.4, (P.z0 + P.z1) / 2);
      K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: '#4c8b72' });
      const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
      for (let i = 0; i < 10; i++) {
        const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
        mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
        if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
      }
      // rùa: mai tròn nhô khỏi mặt nước, chậm rãi bơi vòng
      const shell = std('#5a4a2a', { roughness: 0.8 }), skin = std('#6e5f38', { roughness: 0.8 });
      const turtles = [];
      for (let i = 0; i < 7; i++) {
        const t = new THREE.Group();
        mesh(new THREE.SphereGeometry(0.42, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), shell, 0, 0, 0, { parent: t, cast: false }).scale.set(1, 0.55, 1.2);
        mesh(new THREE.SphereGeometry(0.14, 8, 6), skin, 0, 0.04, 0.55, { parent: t, cast: false });
        scene.add(t);
        turtles.push({ t, cx: (P.x0 + P.x1) / 2 + (K.rr() - 0.5) * (P.x1 - P.x0 - 5), cz: (P.z0 + P.z1) / 2 + (K.rr() - 0.5) * (P.z1 - P.z0 - 5), r: 0.8 + K.rr() * 1.6, sp: (0.08 + K.rr() * 0.1) * (K.rr() < 0.5 ? -1 : 1), ph: K.rr() * 6.28 });
      }
      updaters.push((tm) => {
        for (const u of turtles) {
          const a = tm * u.sp + u.ph;
          u.t.position.set(u.cx + Math.cos(a) * u.r, 0.12, u.cz + Math.sin(a) * u.r);
          u.t.rotation.y = -a + (u.sp > 0 ? 0 : Math.PI);
        }
      });
    }
    plaque(scene, 'HỒ RÙA', 0, 1.0, 29.4, 1.8, 0.4, 0, { size: 90 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 4; z <= 36; z += 8) K.lampPost(s * 24, 0, z);
      K.flagPole(s * 5, 0, 38, 8);
    }
    K.forest([[-24, -28], [24, -28], [-24, 4], [24, 4]], 0, { scale: 1.1 });
  }

  // ---------- Điện chính: son vàng, ngói lưu ly, vòng hương treo, Ngọc Hoàng và tứ thiên vương ----------
  K.hall(HALL, (y, z) => {
    // Ngọc Hoàng Thượng Đế: tượng ngồi thếp vàng, mũ miện, long bào
    const jade = makeBuddha({ quality: 'low' });
    const g = K.gild(jade, { color: '#e8c15a' });
    g.position.set(0, y, z - 0.2);
    g.scale.setScalar(1.35);
    g.traverse((m) => (m.castShadow = false));
    scene.add(g);
    lods.push({ obj: g, z });
    box(2.6, 0.12, 0.9, M.gold, 0, y + 3.5, z + 0.5);
    // tứ đại thiên vương đứng hai bên
    const armor = std('#c0392b', { roughness: 0.5 }), skin = std('#e6b78d', { roughness: 0.7 });
    for (const [x, zz, c] of [[-7.4, z + 0.8, '#c0392b'], [-4.6, z + 1.0, '#2c6fa3'], [4.6, z + 1.0, '#2e8b57'], [7.4, z + 0.8, '#b8860b']]) {
      const f = group(x, y, zz, 0, { merge: false });
      mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.5, 10), std(c, { roughness: 0.5 }), 0, 0.95, 0, { parent: f });
      mesh(new THREE.SphereGeometry(0.28, 10, 8), skin, 0, 1.95, 0, { parent: f });
      mesh(new THREE.ConeGeometry(0.34, 0.5, 8), M.gold, 0, 2.4, 0, { parent: f });
      box(0.1, 2.6, 0.1, M.wood, 0.7, 1.3, 0.2, { parent: f });
      scene.add(f);
      lods.push({ obj: f, x, z: zz, r: 60 });
    }
    // vòng hương xoắn ốc treo dưới xà
    const coil = std('#9a6a3a', { roughness: 0.8 }), rope = std('#2a1a10');
    for (let i = 0; i < 12; i++) {
      const cx = -9 + (i % 4) * 6, cz = z + 3.5 + Math.floor(i / 4) * 3.4;
      cyl(0.015, 0.015, 2.2, rope, cx, y + 5.1, cz, {}, 4);
      const cone = mesh(new THREE.ConeGeometry(0.55, 1.1, 14, 1, true), coil, cx, y + 3.7, cz, { cast: false });
      cone.rotation.x = Math.PI;
      cone.material.side = THREE.DoubleSide;
    }
  }, { wallMat: wall, colMat: redC, light: 10, carpet: '#7a1a12' });

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'ngochoang',
  name: 'Chùa Ngọc Hoàng',
  loading: 'Khói hương xoắn ốc đang bay lên',
  hint: 'qua cổng vào sân có hai hồ rùa, vào điện thờ Ngọc Hoàng có vòng hương treo',
  info: 'Chùa Ngọc Hoàng (Phước Hải) ở Đa Kao, TP. Hồ Chí Minh là ngôi chùa của người Hoa thờ Ngọc Hoàng Thượng Đế. Qua cổng tam quan là sân có hai hồ nuôi rùa hai bên lối giữa; điện chính màu son – vàng, mái ngói lưu ly xanh, trong điện treo những vòng hương xoắn ốc, đặt tượng Ngọc Hoàng cùng tứ đại thiên vương. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Hồ rùa', 'Đứng bên bờ hai hồ ở sân trước để xem những chú rùa chậm rãi bơi quanh.'],
    ['Thắp nhang', 'Trong điện thì thắp trước bàn thờ Ngọc Hoàng; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 50, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong điện Ngọc Hoàng', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Ngọc Hoàng Thượng Đế trong điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Ngọc Hoàng' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 50, ry: Math.PI },
    { id: 'ho', name: 'Hồ rùa', x: PL.x1 + 3, z: PL.z1 + 3, ry: Math.PI * 0.75 },
    { id: 'san', name: 'Sân chùa', x: 0, z: 4.5, ry: Math.PI },
    { id: 'dien', name: 'Điện Ngọc Hoàng', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-30, -38, 60, 102],
    font: 3.4,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 60, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: PL.x0, x1: PL.x1, z0: PL.z0, z1: PL.z1, c: 'm-water' },
      { x0: PR.x0, x1: PR.x1, z0: PR.z0, z1: PR.z1, c: 'm-water' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-corridor' },
    ],
    labels: [['gate', 0, 50, 'Cổng chùa'], ['ho', 0, 31, 'Hồ rùa'], ['san', 0, 5, 'Sân chùa'], ['dien', 0, -10, 'Điện Ngọc Hoàng']],
  },
  OV: { bounds: { x0: -30, x1: 30, z0: -34, z1: 58 }, dist: 85 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 4, act: 'bow', say: 'lạy Ngọc Hoàng' },
    { x: PL.x1 + 3, z: PL.z1 + 3, spread: 2, ry: Math.PI * 0.75, say: 'Rùa bơi chậm ghê' },
    { x: PR.x0 - 3, z: PR.z1 + 3, spread: 2, ry: -Math.PI * 0.75, say: 'Nhiều rùa quá' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: 48, spread: 18, ry: Math.PI },
  ],
  BOT_SPAWN: [[-20, 20, 30, 36], [-20, 20, 2, 6]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Khói hương thơm quá', 'Vòng hương treo đẹp ghê', 'Rùa nhiều quá trời', 'Cầu bình an cho cả nhà'],
  build,
};
