// Chùa Tây An (Châu Đốc, An Giang): ngôi chùa kiến trúc pha Ấn Độ – Hồi giáo dưới chân núi Sam: mái vòm hành, tháp nhỏ,
// tường trắng, cổng vòm. Sân có tượng sư tử đá và con voi trắng, chánh điện mái vòm lớn ở giữa, hai bên là các tháp vòm nhỏ.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 44;
const YARD = { x0: -34, x1: 34, z0: -34, z1: 41 };
const HALL = { x: 0, z0: -2, z1: -22, hx: 13, y: 0, plaque: 'TÂY AN CỔ TỰ', wallH: 6.4 };
const TOWERS = [[-22, -4], [22, -4]];
const CENTER = { x: 0, z: 16 };
const ELE = [{ x: -9, z: 28 }, { x: 9, z: 28 }];

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 60),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4),
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, GATE_Z - 4.4),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  ...TOWERS.map(([x, z]) => ({ x, z, r: 3.0 })),
  ...ELE.map((e) => ({ x: e.x, z: e.z, r: 2.2 })),
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 5, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6eaee0', skyBottom: '#eee8d6' });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const white = std('#f7f4ec', { roughness: 0.7 });
  const blue = std('#2f7fb5', { roughness: 0.45 });
  const goldM = std('#e2b13c', { metalness: 0.7, roughness: 0.35 });

  // mái vòm hành: nửa cầu hơi nhọn trên trống tròn, có chóp vàng
  const dome = (parent, x, y, z, r, mat = blue) => {
    cyl(r * 0.92, r, r * 0.4, white, x, y + r * 0.2, z, { parent }, 24);
    const d = mesh(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y + r * 0.4, z, { parent });
    d.scale.y = 1.25;
    mesh(new THREE.CylinderGeometry(r * 0.1, r * 0.2, r * 0.5, 10), goldM, x, y + r * 0.4 + r * 1.25 + r * 0.15, z, { parent });
    mesh(new THREE.ConeGeometry(r * 0.08, r * 0.7, 8), goldM, x, y + r * 0.4 + r * 1.25 + r * 0.7, z, { parent });
  };

  // ---------- Đất, núi Sam phía sau, ruộng ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -20, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 62, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -150, [[0, 36], [34, 35], [70, 18], [110, 5], [150, -1]], { clip: { x0: -52, x1: 52, z0: -38, z1: 64, floor: groundY } });
    hillAt = hy;
    K.forest([...K.scatter(-170, 170, -210, -50, 120), ...K.scatter(-120, -42, -40, 40, 25), ...K.scatter(42, 120, -40, 40, 25)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    K.palms([[-40, 56], [40, 56], [-40, 20], [40, 20], [-40, -10], [40, -10]]);
    const paddy = std('#8fb35a', { roughness: 0.95 });
    for (const [x, z, w, d] of [[-110, 90, 120, 100], [110, 90, 120, 100], [0, 150, 280, 60]]) {
      const p = mesh(new THREE.PlaneGeometry(w, d), paddy, x, 0.008, z, { cast: false });
      p.rotation.x = -Math.PI / 2;
    }
  }

  // ---------- Cổng vòm, tường trắng ----------
  {
    const g = group(0, 0, GATE_Z);
    box(30, 0.3, 6, M.stone, 0, 0.15, 0, { parent: g });
    for (const sx of [-1, 1]) {
      box(2.4, 6.6, 3.0, white, sx * 4.2, 3.6, 0, { parent: g });
      cyl(0.5, 0.6, 7.4, white, sx * 6.6, 3.7, 0, { parent: g }, 14);
      dome(g, sx * 6.6, 7.4, 0, 1.0);
      dome(g, sx * 4.2, 6.9, 0, 1.3);
    }
    box(11, 2.2, 3.0, white, 0, 6.0, 0, { parent: g }); // dầm trên cổng vòm
    dome(g, 0, 7.1, 0, 2.2);
    plaque(g, 'TÂY AN CỔ TỰ', 0, 5.8, 1.55, 4.8, 0.9);
    plaque(g, 'TÂY AN CỔ TỰ', 0, 5.8, -1.55, 4.8, 0.9, Math.PI);
    for (const sx of [-1, 1]) {
      box(20, 2.6, 0.6, white, sx * 17.2, 1.3, 0, { parent: g });
      box(20.3, 0.2, 1.0, blue, sx * 17.2, 2.7, 0, { parent: g });
    }
    K.roofs.push({ minX: -9, maxX: 9, minZ: GATE_Z - 3, maxZ: GATE_Z + 3, lift: 14 });
    for (const s of [-1, 1]) {
      box(0.6, 2.6, GATE_Z - YARD.z0 - 3, white, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2 - 1.5);
      K.lion(s * 4.4, 0, GATE_Z + 3.4);
    }
    box(YARD.x1 - YARD.x0, 2.6, 0.6, white, 0, 1.3, YARD.z0 - 0.3);
  }

  // ---------- Sân: tượng voi, lư hương, tháp vòm hai bên ----------
  {
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const e of ELE) {
      const eg = group(e.x, 0, e.z, e.x < 0 ? 0.35 : -0.35);
      box(2.2, 0.5, 3.2, M.stone, 0, 0.25, 0, { parent: eg });
      mesh(new THREE.SphereGeometry(1, 16, 12), white, 0, 1.9, 0, { parent: eg }).scale.set(0.9, 0.9, 1.35);
      for (const [lx, lz] of [[-0.5, 0.75], [0.5, 0.75], [-0.5, -0.75], [0.5, -0.75]]) cyl(0.28, 0.3, 1.3, white, lx, 1.1, lz, { parent: eg }, 10);
      mesh(new THREE.SphereGeometry(0.62, 14, 10), white, 0, 2.5, 1.35, { parent: eg });
      const trunk = new THREE.CatmullRomCurve3([[0, 2.3, 1.85], [0, 1.7, 2.15], [0, 1.0, 2.2], [0, 0.8, 2.45]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
      mesh(new THREE.TubeGeometry(trunk, 12, 0.17, 8), white, 0, 0, 0, { parent: eg });
      box(1.6, 0.12, 1.4, blue, 0, 2.85, -0.1, { parent: eg });
    }
    for (const [x, z] of TOWERS) {
      const g = group(x, 0, z);
      box(3.4, 0.6, 3.4, M.stone, 0, 0.3, 0, { parent: g });
      cyl(1.2, 1.4, 7.6, white, 0, 4.4, 0, { parent: g }, 16);
      for (let k = 0; k < 3; k++) cyl(1.5, 1.5, 0.25, blue, 0, 2.2 + k * 2.2, 0, { parent: g }, 16);
      dome(g, 0, 8.2, 0, 1.5);
    }
    K.flowers([[-12, 36], [-14, 36], [12, 36], [14, 36], [-28, 14], [28, 14]]);
    for (const s of [-1, 1]) {
      for (let z = 8; z <= 40; z += 8) K.lampPost(s * 6.5, 0, z);
      K.flagPole(s * 4, 0, 40, 8);
    }
  }

  // ---------- Chánh điện: mái vòm lớn và bốn vòm nhỏ ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.5);
    scene.add(b);
    lods.push({ obj: b, z });
  }, {
    twoTier: false, wallMat: white, colMat: blue, light: 10,
    roof: ({ x, y, cz, hx, d }) => {
      const g = new THREE.Group();
      scene.add(g);
      box(hx * 2 + 1.0, 0.5, d + 1.0, white, x, y + 0.25, cz, { parent: g });
      dome(g, x, y + 0.5, cz, hx * 0.62);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dome(g, x + dx * (hx - 1.6), y + 0.5, cz + dz * (d / 2 - 1.6), 1.5);
      plaque(scene, 'CHÁNH ĐIỆN', x, y - 1.0, HALL.z0 + 0.06, 3.6, 0.7);
      return { yTop: y + 0.5 + hx * 0.62 * 1.65, rx: 1 };
    },
  });

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'tayan',
  name: 'Chùa Tây An',
  loading: 'Mái vòm đang sáng lên dưới núi Sam',
  hint: 'qua cổng vòm vào sân có voi trắng, vào chánh điện mái vòm dưới chân núi Sam',
  info: 'Chùa Tây An ở Châu Đốc, An Giang là ngôi chùa kiến trúc pha Ấn Độ – Hồi giáo dưới chân núi Sam: mái vòm hành, tháp nhỏ, tường trắng, cổng vòm. Sân có tượng sư tử đá và voi trắng, chánh điện mái vòm lớn ở giữa, hai bên là các tháp vòm. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 54, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân chùa, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng vòm', x: 0, z: 54, ry: Math.PI },
    { id: 'voi', name: 'Voi trắng', x: 0, z: 34, ry: Math.PI },
    { id: 'thap', name: 'Tháp vòm', x: -22, z: 3, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-50, -38, 100, 106],
    font: 4.6,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 62, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-white' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      ...TOWERS.map(([x, z]) => ({ x, z, r: 2.6, c: 'm-tower' })),
      ...ELE.map((e) => ({ x: e.x, z: e.z, r: 1.8, c: 'm-statue' })),
    ],
    labels: [['gate', 0, 56, 'Cổng vòm'], ['voi', 0, 24, 'Voi trắng'], ['thap', -22, 9, 'Tháp vòm'], ['dien', 0, -12, 'Chánh điện']],
  },
  OV: { bounds: { x0: -50, x1: 50, z0: -34, z1: 62 }, dist: 100 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 4, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 0, z: 34, spread: 4, ry: Math.PI, say: 'Con voi trắng to quá' },
    { x: -22, z: 3, spread: 2, ry: Math.PI },
    { x: 0, z: 54, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 8, 40], [-24, 24, -30, -24]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Mái vòm đẹp ghê', 'Chùa lạ mắt thật', 'Núi Sam sau lưng chùa kìa', 'Cầu bình an cho gia đình'],
  build,
};
