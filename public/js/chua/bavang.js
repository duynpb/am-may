// Chùa Ba Vàng (Uông Bí, Quảng Ninh): chùa trên sườn núi Thành Đẳng nhìn xuống đồng bằng. Qua cổng tam quan là sân lớn
// có đỉnh hương đồng, bậc thang rất rộng lên nền cao; trên nền là chánh điện hai tầng mái rất lớn, bên trái gác chuông,
// bên phải bảo tháp bát giác. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill, curvedRoof } from './base.js';
import { makeBuddha, makeThichCa } from '../buddha.js';

const GATE_Z = 56;
const YARD = { x0: -32, x1: 32, z0: 22, z1: 53 };
const T1 = { hx: 40, z0: -42, z1: 4, y: 9 };
const ST = { x0: -8, x1: 8, zBottom: 22, zTop: T1.z1, y0: 0, y1: T1.y };
const HALL = { x: 0, z0: -6, z1: -30, hx: 22, y: T1.y, plaque: 'ĐẠI HÙNG BẢO ĐIỆN', wallH: 8 };
const BELL = { x: -31, z: -2 };
const TOWER = { x: 31, z: -22, r: 3.6 };
const CAULDRON = { x: 0, z: 36 };

const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 74), // sân trước cổng
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, ST.zBottom - 0.6, GATE_Z - 4.4), // sân lớn
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.6), // bậc thang rộng
  rect(-T1.hx + 1, T1.hx - 1, HALL.z0 + 0.6, T1.z1 - 0.6), // thềm trước chánh điện
  rect(-T1.hx + 1, -HALL.hx - 1.2, T1.z0 + 0.8, T1.z1 - 0.6), rect(HALL.hx + 1.2, T1.hx - 1, T1.z0 + 0.8, T1.z1 - 0.6),
  rect(-T1.hx + 1, T1.hx - 1, T1.z0 + 0.8, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: TOWER.x, z: TOWER.z, r: TOWER.r + 2.2 },
  { x: CAULDRON.x, z: CAULDRON.z, r: 2.6 },
];
const RITUALS = [
  { place: 'dien', y: T1.y + 0.25, burner: { x: 0, z: HALL.z1 + 4.2 }, merit: { x: HALL.hx - 3.2, z: HALL.z1 + 4.0 }, face: { x: 0, y: T1.y + 4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CAULDRON.x, z: CAULDRON.z + 4.4 }, merit: { x: CAULDRON.x + 3.6, z: CAULDRON.z + 4.2 }, face: { x: 0, y: 2.4, z: CAULDRON.z } },
  { place: 'thap', y: T1.y, stone: true, burner: { x: TOWER.x, z: TOWER.z + TOWER.r + 4.6 }, merit: { x: TOWER.x - 3.6, z: TOWER.z + TOWER.r + 4.4 }, face: { x: TOWER.x, y: T1.y + 3, z: TOWER.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(ST, x, z);
  if (s != null) return s;
  if (Math.abs(x) <= T1.hx && z >= T1.z0 && z <= T1.z1) return inHall(HALL, x, z) ? T1.y + 0.25 : T1.y;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7aaed8', skyBottom: '#e8e6dc' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, lods } = K;
  const goldWall = std('#e8c46a', { roughness: 0.8 });
  const brick = std('#d9b6a0', { roughness: 0.85 });

  // ---------- Đất, núi Thành Đẳng ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -50, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 76, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(YARD.x0, YARD.x1, YARD.z0 - 1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -175, [[0, 52], [40, 50], [80, 28], [120, 9], [150, 0.5], [175, -1]], { clip: { x0: -52, x1: 52, z0: -46, z1: 78, floor: groundY } });
    hillAt = hy;
    K.forest([...K.scatter(-200, 200, -240, -48, 150), ...K.scatter(-140, -46, -48, 70, 50), ...K.scatter(46, 140, -48, 70, 50)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    // đồng bằng và ruộng phía trước
    const paddy = std('#8fb35a', { roughness: 0.95 });
    for (const [x, z, w, d] of [[-110, 150, 160, 120], [110, 150, 160, 120], [0, 260, 320, 80]]) {
      const p = mesh(new THREE.PlaneGeometry(w, d), paddy, x, 0.008, z, { cast: false });
      p.rotation.x = -Math.PI / 2;
    }
  }

  // ---------- Cổng tam quan, sân lớn, đỉnh hương đồng ----------
  K.gate3(0, GATE_Z, 'CHÙA BA VÀNG', { walls: 22, wall: goldWall });
  {
    for (const s of [-1, 1]) box(0.6, 2.6, GATE_Z - YARD.z0 + 1, goldWall, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    const { x: cx, z: cz } = CAULDRON;
    cyl(2.3, 2.5, 0.5, M.stone, cx, 0.25, cz, {}, 32);
    const prof = [[0, 0], [1.1, 0.05], [1.45, 0.5], [1.5, 1.1], [1.35, 1.45], [1.55, 1.55], [1.55, 1.65]].map(([x, y]) => new THREE.Vector2(x, y));
    const pot = mesh(new THREE.LatheGeometry(prof, 32), M.bronze, cx, 1.3, cz);
    pot.material.side = THREE.DoubleSide;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      cyl(0.16, 0.12, 0.85, M.bronze, cx + Math.cos(a) * 0.9, 0.9, cz + Math.sin(a) * 0.9, {}, 8);
    }
    for (const s of [-1, 1]) {
      for (let z = 26; z <= 50; z += 8) K.lampPost(s * 12, 0, z);
      K.flagPole(s * 5, 0, 50, 8);
    }
    // đèn lồng vàng treo dọc hai bên sân
    const lantern = std('#f2c14e', { emissive: '#ffb030', emissiveIntensity: 0.4, roughness: 0.6 });
    for (const s of [-1, 1]) for (let z = 26; z <= 50; z += 4) mesh(new THREE.SphereGeometry(0.35, 10, 8), lantern, s * 22, 3.2, z).scale.y = 1.3;
    K.palms([[-28, 26], [28, 26], [-28, 48], [28, 48]]);
  }

  // ---------- Nền cao, bậc thang rộng, chánh điện rất lớn ----------
  {
    terrace(-T1.hx, T1.hx, T1.z0, T1.z1, 0, T1.y, { side: std('#8d8574', { roughness: 1 }) });
    stairs({ ...ST, base: -0.5 });
    for (const s of [-1, 1]) {
      box(T1.hx - ST.x1 - 0.4, 0.9, 0.3, M.stone, s * (T1.hx + ST.x1 + 0.4) / 2, T1.y + 0.45, T1.z1 - 0.15);
      K.lion(s * 10.4, 0, ST.zBottom + 1);
      K.stoneLamp(s * 26, T1.y, 0);
    }
    K.hall(HALL, (y, z) => {
      const mid = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      mid.position.set(0, y, z - 0.2);
      mid.scale.setScalar(2.3);
      scene.add(mid);
      lods.push({ obj: mid, z, r: 90 });
      const side = makeBuddha({ quality: 'low' });
      for (const x of [-8.5, 8.5]) {
        const b = x < 0 ? side : side.clone();
        b.position.set(x, y, z + 0.3);
        b.scale.setScalar(1.6);
        b.traverse((m) => (m.castShadow = false));
        scene.add(b);
        lods.push({ obj: b, x, z, r: 90 });
      }
    }, { wallMat: goldWall, light: 14 });
  }

  // ---------- Gác chuông bên trái, bảo tháp bát giác bên phải ----------
  const bells = [K.bellPavilion(BELL.x, BELL.z, T1.y)];
  {
    const g = group(TOWER.x, T1.y, TOWER.z);
    cyl(TOWER.r + 2.0, TOWER.r + 2.2, 0.8, M.stone, 0, 0.4, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
    let y = 0.8, r = TOWER.r;
    for (let t = 0; t < 9; t++) {
      const h = t === 0 ? 3.6 : 2.5 - t * 0.06;
      cyl(r, r, h, brick, 0, y + h / 2, 0, { parent: g }, 8).rotation.y = Math.PI / 8;
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        box(0.9, h * 0.5, 0.08, std('#3a2418'), Math.sin(a) * (r * 0.93), y + h * 0.45, Math.cos(a) * (r * 0.93), { parent: g, cast: false }).rotation.y = a;
      }
      y += h;
      const eave = new THREE.Group();
      eave.position.set(0, 0, 0);
      g.add(eave);
      curvedRoof(eave, 0, y - 0.1, 0, r + 0.8, r + 0.8, 0.6, r * 0.5, { lift: 0.5 });
      y += 0.6;
      r -= 0.22;
    }
    cyl(0.6, 0.9, 0.8, M.gold, 0, y + 0.4, 0, { parent: g }, 8);
    mesh(new THREE.ConeGeometry(0.22, 2.6, 8), M.gold, 0, y + 2.1, 0, { parent: g });
    plaque(g, 'BẢO THÁP', 0, 4.0, TOWER.r * 0.93 + 0.12, 2.4, 0.5, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 5, maxX: TOWER.x + 5, minZ: TOWER.z - 5, maxZ: TOWER.z + 5, lift: 32 });
  }
  K.forest([[-36, -38], [36, -38], [-36, -20], [-12, -38], [12, -38]].map(([x, z]) => [x, z, T1.y]));

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

export const SITE = {
  id: 'bavang',
  name: 'Chùa Ba Vàng',
  loading: 'Đang lên núi Thành Đẳng',
  hint: 'qua sân lớn, lên bậc thang rộng tới chánh điện; đứng trên nền cao nhìn xuống đồng bằng',
  info: 'Chùa Ba Vàng ở Uông Bí, Quảng Ninh, nằm trên sườn núi Thành Đẳng nhìn xuống đồng bằng. Qua cổng tam quan là sân lớn có đỉnh hương đồng, bậc thang rất rộng lên nền cao; trên nền là chánh điện hai tầng mái rất lớn, bên trái gác chuông, bên phải bảo tháp bát giác. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông ở gác chuông bên trái chánh điện để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở đỉnh hương đồng; bên phải nền cao thì trước bảo tháp.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 68, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < T1.z1 + 0.5 && Math.hypot(x - TOWER.x, z - TOWER.z) < 14) return 'thap';
    if (z < T1.z1 + 0.5) return 'dien';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca rất lớn trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang trước đỉnh hương đồng', text: 'Bạn sẽ bước tới lư hương đá trước đỉnh hương đồng giữa sân lớn, chắp tay vái lạy rồi cắm nhang.', done: '' },
    thap: { title: 'Thắp nhang trước bảo tháp', text: 'Bạn sẽ bước tới lư hương đá trước bảo tháp bát giác, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
  },
  bowRy: (x, z) => (z < T1.z1 && Math.hypot(x - TOWER.x, z - TOWER.z) < 13 ? Math.atan2(TOWER.x - x, TOWER.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 68, ry: Math.PI },
    { id: 'san', name: 'Sân lớn', x: 0, z: 46, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 5.2, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp', x: TOWER.x, z: TOWER.z + TOWER.r + 7, ry: Math.PI },
    { id: 'view', name: 'Ngắm đồng bằng', x: -14, z: 2.5, ry: 0 },
  ],
  MAP: {
    box: [-52, -46, 104, 124],
    font: 4.6,
    shapes: [
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 76, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -T1.hx, x1: T1.hx, z0: T1.z0, z1: T1.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x: TOWER.x, z: TOWER.z, r: TOWER.r, c: 'm-tower' },
      { x: CAULDRON.x, z: CAULDRON.z, r: 2.4, c: 'm-statue' },
    ],
    labels: [['gate', 0, 68, 'Cổng tam quan'], ['san', 0, 46, 'Sân lớn'], ['dien', 0, -18, 'Chánh điện'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['thap', TOWER.x, TOWER.z - 7, 'Bảo tháp']],
  },
  OV: { bounds: { x0: -52, x1: 52, z0: -44, z1: 74 }, dist: 120, y: 5 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 5, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CAULDRON.z + 6.5, spread: 4, act: 'gassho' },
    { x: TOWER.x, z: TOWER.z + TOWER.r + 7, spread: 2, act: 'bow', ry: Math.PI },
    { x: 0, z: 0, act: 'bell' },
    { x: -14, z: 2.5, spread: 8, ry: 0, say: 'Nhìn xuống đồng bằng đẹp quá' },
    { x: 0, z: 46, spread: 16, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 26, 50], [-30, 30, -4, 3]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Chánh điện to quá', 'Bậc thang rộng ghê', 'Đứng trên này mát quá', 'Chùa đẹp thật'],
  build,
};
