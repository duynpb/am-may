// Chùa Thiên Mụ (Huế): trên đồi Hà Khê bên bờ bắc sông Hương. Từ bến sông lên bậc đá là sân tháp Phước Duyên
// bát giác bảy tầng, hai bên là đình bia (bia đá trên lưng rùa) và gác chuông treo đại hồng chung; qua cổng nghi môn
// vào sân trong tới chánh điện Đại Hùng Bảo Điện, phía sau là vườn thông. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeBuddha, makeThichCa } from '../buddha.js';

const Y = 4; // mặt đồi (sân chùa)
const TER = { x0: -30, x1: 30, z0: -62, z1: 22 };
const STAIR = { x0: -5, x1: 5, zBottom: 30, zTop: TER.z1, y0: 0, y1: Y };
const TOWER = { x: 0, z: 9, r: 3.6 };
const BELL = { x: -17, z: 7 };
const STELE = { x: 17, z: 7 };
const GATE_Z = -8;
const HALL = { x: 0, z0: -26, z1: -42, hx: 11, y: Y, plaque: 'ĐẠI HÙNG BẢO ĐIỆN', wallH: 6 };
const RIVER_Z = 44;

const WALK_AREAS = [
  rect(-40, 40, 30.4, RIVER_Z - 1), // bờ sông
  rect(-1.2, 1.2, RIVER_Z - 2, RIVER_Z + 7), // bến thuyền
  rect(STAIR.x0 + 0.8, STAIR.x1 - 0.8, STAIR.zTop - 0.8, STAIR.zBottom + 0.8), // bậc đá
  rect(TER.x0 + 1, TER.x1 - 1, GATE_Z + 4.4, TER.z1 - 0.6), // sân tháp
  ...gateWalk(0, GATE_Z), // ba cửa nghi môn
  rect(TER.x0 + 1, TER.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân trong
  rect(TER.x0 + 1, -HALL.hx - 1.2, TER.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, TER.x1 - 1, TER.z0 + 1, GATE_Z - 4.4),
  rect(TER.x0 + 1, TER.x1 - 1, TER.z0 + 1, HALL.z1 - 1.4), // vườn thông sau điện
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.r + 2.2 },
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: STELE.x, z: STELE.z, r: 3.7 },
];
const RITUALS = [
  { place: 'dien', y: Y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: Y + 3.2, z: HALL.z1 + 1.7 } },
  { place: 'thap', y: Y, stone: true, burner: { x: TOWER.x, z: TOWER.z + TOWER.r + 4.6 }, merit: { x: TOWER.x + 3.6, z: TOWER.z + TOWER.r + 4.4 }, face: { x: TOWER.x, y: Y + 3, z: TOWER.z } },
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
  if (Math.abs(x) < 1.6 && z > RIVER_Z - 2 && z < RIVER_Z + 8) return 0.1;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7cb2da', skyBottom: '#e9e7da' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables } = K;
  const brick = std('#d9b6a0', { roughness: 0.85 });

  // ---------- Đất, sông Hương, đồi ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 400), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, RIVER_Z - 200, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-44, 44, 30, RIVER_Z, 0, 'slab', { tile: 5.5, macro: 0.05 });
    box(700, 1.2, 1.0, M.stone, 0, -0.5, RIVER_Z + 0.4); // bờ kè
    K.water(-700, 700, RIVER_Z + 1, RIVER_Z + 260, -0.6, { color: '#4f8a86' });
    // bờ nam xa xa: dải đất và cây
    const far = mesh(new THREE.BoxGeometry(900, 2, 200), std('#7e9560'), 0, -0.9, RIVER_Z + 360, { cast: false });
    far.receiveShadow = true;
    K.forest(K.scatter(-300, 300, RIVER_Z + 270, RIVER_Z + 320, 60), 0.1, { scale: 1.4 });
    // bến gỗ, thuyền rồng neo bên bến
    box(2.4, 0.2, 9, std('#8a6a44'), 0, 0, RIVER_Z + 3.5);
    const boat = group(4.2, -0.4, RIVER_Z + 4, 0);
    box(2.2, 0.8, 9, std('#7d2217'), 0, 0.2, 0, { parent: boat });
    box(1.8, 1.6, 4.2, std('#d9a43f'), 0, 1.4, -0.6, { parent: boat });
    curvedRoof(boat, 0, 2.2, -0.6, 1.4, 2.6, 0.6, 1.0, { lift: 0.4 });
    const head = new THREE.CatmullRomCurve3([[0, 0.6, 4.4], [0, 1.4, 5.2], [0, 2.2, 5.0], [0, 2.4, 5.6]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
    mesh(new THREE.TubeGeometry(head, 12, 0.22, 8), M.glaze, 0, 0, 0, { parent: boat });
    // đồi Hà Khê sau chùa
    // đồi lùi ra sau; trong khuôn viên (sân, bậc đá, bờ sông) mặt đồi luôn thấp hơn mặt đất đi lại
    const hy = makeHill(K, 0, -185, [[0, 26], [30, 26], [70, 14], [110, 5], [150, 0.4], [180, -1]], { clip: { x0: -46, x1: 46, z0: -66, z1: RIVER_Z + 1, floor: groundY } });
    K.pines([...K.scatter(-120, 120, -165, -72, 70), ...K.scatter(-110, -38, -66, 26, 30), ...K.scatter(38, 110, -66, 26, 30)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.2]));
  }

  // ---------- Đồi chùa: nền đất đắp, bậc đá từ bến sông ----------
  {
    terrace(TER.x0, TER.x1, TER.z0, TER.z1, 0, Y, { side: std('#8d8574', { roughness: 1 }) });
    stairs({ ...STAIR, base: -0.5 });
    for (const s of [-1, 1]) {
      box(TER.x1 - STAIR.x1 - 0.4, 0.8, 0.3, M.stone, s * (TER.x1 + STAIR.x1 + 0.4) / 2, Y + 0.4, TER.z1 - 0.15);
      K.lion(s * 6.8, 0, STAIR.zBottom + 1);
      K.stoneLamp(s * 26, Y, 18);
    }
  }

  // ---------- Tháp Phước Duyên: bát giác bảy tầng, mỗi tầng có khám thờ ----------
  {
    const g = group(TOWER.x, Y, TOWER.z);
    cyl(TOWER.r + 2.0, TOWER.r + 2.2, 0.8, M.stone, 0, 0.4, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
    let y = 0.8, r = TOWER.r;
    for (let t = 0; t < 7; t++) {
      const h = t === 0 ? 3.6 : 2.6 - t * 0.08;
      cyl(r, r, h, brick, 0, y + h / 2, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
      // khám thờ vòm ở bốn mặt
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        const n = box(0.9, h * 0.5, 0.08, std('#3a2418'), Math.sin(a) * (r * 0.93), y + h * 0.45, Math.cos(a) * (r * 0.93), { parent: g, cast: false });
        n.rotation.y = a;
      }
      y += h;
      // mái hiên bát giác
      cyl(r * 0.92, r + 0.9, 0.5, std('#7a4a2c', { roughness: 0.7 }), 0, y + 0.25, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
      y += 0.5;
      r -= 0.28;
    }
    cyl(0.8, 1.1, 0.8, M.gold, 0, y + 0.4, 0, { parent: g }, 8);
    mesh(new THREE.SphereGeometry(0.7, 12, 10), M.gold, 0, y + 1.3, 0, { parent: g });
    mesh(new THREE.ConeGeometry(0.22, 2.2, 8), M.gold, 0, y + 2.8, 0, { parent: g });
    plaque(g, 'PHƯỚC DUYÊN BẢO THÁP', 0, 4.2, TOWER.r * 0.93 + 0.12, 3.0, 0.5, 0, { size: 80 });
    K.roofs.push({ minX: TOWER.x - 5, maxX: TOWER.x + 5, minZ: TOWER.z - 5, maxZ: TOWER.z + 5, lift: 26 });
  }

  // ---------- Gác chuông (bên trái) và đình bia rùa (bên phải) ----------
  const bells = [K.bellPavilion(BELL.x, BELL.z, Y)];
  {
    const g = group(STELE.x, Y, STELE.z);
    box(7, 0.4, 7, M.stone, 0, 0.2, 0, { parent: g });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.26, 0.3, 4.6, M.red, sx * 2.6, 2.7, sz * 2.6, { parent: g }, 12);
    box(6.0, 0.4, 6.0, M.red, 0, 5.1, 0, { parent: g });
    curvedRoof(g, 0, 5.2, 0, 3.8, 3.8, 1.6, 2.6, { lift: 0.8 });
    // rùa đá đội bia
    mesh(new THREE.SphereGeometry(1.1, 14, 10), M.stoneD, 0, 0.7, 0, { parent: g }).scale.set(1, 0.5, 1.4);
    mesh(new THREE.SphereGeometry(0.34, 10, 8), M.stoneD, 0, 0.8, 1.55, { parent: g });
    box(1.3, 2.4, 0.3, M.stone, 0, 2.1, 0, { parent: g });
    box(1.5, 0.3, 0.42, M.stoneD, 0, 3.4, 0, { parent: g });
    plaque(g, 'ĐÌNH BIA', 0, 4.6, 3.05, 1.8, 0.4, 0, { size: 80 });
  }

  // ---------- Cổng nghi môn, sân trong, chánh điện ----------
  K.gate3(0, GATE_Z, 'THIÊN MỤ TỰ', { walls: 18, y: Y, wall: std('#c9b79a') });
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.55);
    scene.add(b);
    K.lods.push({ obj: b, z });
    const side = makeBuddha({ quality: 'low' });
    for (const x of [-6.2, 6.2]) {
      const s = x < 0 ? side : side.clone();
      s.position.set(x, y, z + 0.3);
      s.scale.setScalar(1.0);
      s.traverse((m) => (m.castShadow = false));
      scene.add(s);
      K.lods.push({ obj: s, x, z });
    }
  });
  for (const s of [-1, 1]) {
    for (let z = -12; z >= -24; z -= 6) K.lampPost(s * 8, Y, z);
    K.flagPole(s * 4.5, Y, -14, 7);
  }
  K.pines([[-24, -48], [24, -48], [-18, -56], [18, -56], [-8, -58], [8, -58], [-26, -30], [26, -30], [-26, -16], [26, -16]], Y);
  K.flowers([[-6, -18], [6, -18], [-14, -20], [14, -20], [-14, -14], [14, -14]].map(([x, z]) => [x, z, Y]));

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'thienmu',
  name: 'Chùa Thiên Mụ',
  loading: 'Thuyền rồng đang cập bến sông Hương',
  hint: 'từ bến sông Hương lên bậc đá tới tháp Phước Duyên, qua cổng nghi môn vào chánh điện',
  info: 'Chùa Thiên Mụ ở Huế, trên đồi Hà Khê bên bờ sông Hương. Tháp Phước Duyên bát giác bảy tầng đứng trước sân, hai bên là gác chuông treo đại hồng chung và đình bia đặt bia đá trên lưng rùa; qua cổng nghi môn là chánh điện Đại Hùng Bảo Điện và vườn thông phía sau. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông ở gác chuông bên trái tháp để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá trước tháp Phước Duyên.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 40, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) || z < GATE_Z - 3 ? 'dien' : 'thap'),
  defaultPlace: 'thap',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    thap: { title: 'Thắp nhang trước tháp Phước Duyên', text: 'Bạn sẽ bước tới lư hương đá trước tháp Phước Duyên, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
  },
  PLACES: [
    { id: 'ben', name: 'Bến sông Hương', x: 0, z: 40, ry: Math.PI },
    { id: 'thap', name: 'Tháp Phước Duyên', x: 0, z: 19.5, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'bia', name: 'Đình bia', x: STELE.x, z: STELE.z + 6, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'vuon', name: 'Vườn thông', x: 0, z: -52, ry: 0 },
  ],
  MAP: {
    box: [-45, -66, 90, 124],
    font: 4.4,
    shapes: [
      { x0: -45, x1: 45, z0: RIVER_Z, z1: 58, c: 'm-water' },
      { x0: -44, x1: 44, z0: 30, z1: RIVER_Z, c: 'm-stone' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: TER.z1, c: 'm-terrace' },
      { x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.zTop, z1: STAIR.zBottom, c: 'm-stairs' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: TOWER.x, z: TOWER.z, r: TOWER.r, c: 'm-tower' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x0: STELE.x - 3.5, x1: STELE.x + 3.5, z0: STELE.z - 3.5, z1: STELE.z + 3.5, c: 'm-corridor' },
    ],
    labels: [['ben', 0, 37, 'Bến sông Hương'], ['thap', 0, 16, 'Tháp Phước Duyên'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['bia', STELE.x, STELE.z - 5, 'Đình bia'], ['dien', 0, -34, 'Chánh điện'], ['vuon', 0, -54, 'Vườn thông']],
  },
  OV: { bounds: { x0: -45, x1: 45, z0: -62, z1: 55 }, dist: 110, y: 3 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: TOWER.z + TOWER.r + 6.8, spread: 3, act: 'gassho' },
    { x: 0, z: 0, act: 'bell' },
    { x: 0, z: 41, spread: 20, ry: 0, say: 'Sông Hương êm quá' },
    { x: STELE.x, z: STELE.z + 6, spread: 2, ry: Math.PI },
    { x: 0, z: -52, spread: 12, ry: 0 },
  ],
  BOT_SPAWN: [[-20, 20, 32, 42], [-20, 20, 14, 20], [-20, 20, -24, -14]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Tháp Phước Duyên đẹp quá', 'Gió sông Hương mát ghê', 'Tiếng chuông Thiên Mụ', 'Vườn thông yên tĩnh thật'],
  build,
};
