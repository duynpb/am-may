// Chùa Hang (Lý Sơn, Quảng Ngãi): ngôi chùa trong hang đá núi lửa trên đảo Lý Sơn. Từ bãi biển đá đi vào cửa hang, bên trong là
// điện thờ Phật dưới mái đá, nhũ đá rủ xuống; ngoài bãi có ruộng tỏi xanh và hàng cây cứng cỏi chịu gió biển.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const SEA_Z = 62;
const HALL = { x: 0, z0: -4, z1: -22, hx: 9, y: 0, plaque: 'CHÙA HANG', wallH: 5.0 };
const AREA = { x0: -34, x1: 34, z0: -30, z1: 56 };
const CENTER = { x: 0, z: 22 };

const WALK_AREAS = [
  rect(AREA.x0, AREA.x1, HALL.z0 + 0.6, AREA.z1),
  rect(AREA.x0, -HALL.hx - 1.2, AREA.z0, HALL.z0 + 0.9), rect(HALL.hx + 1.2, AREA.x1, AREA.z0, HALL.z0 + 0.9),
  rect(AREA.x0, AREA.x1, AREA.z0, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [{ x: CENTER.x, z: CENTER.z, r: 1.1 }];
const RITUALS = [
  { place: 'hang', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.6 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.4 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'bai', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  return inHall(HALL, x, z) ? 0.25 : 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#5aa0e0', skyBottom: '#e7eef0', fog: [200, 900], fogColor: 0xdfe9ec });
  const { scene, M, std, mesh, box, cyl, floor, plaque, pickables, lods } = K;
  const rock = std('#4e4a45', { roughness: 1, flatShading: true });
  const rockL = std('#6b655d', { roughness: 1, flatShading: true });

  // ---------- Biển, bãi đá núi lửa, núi Thới Lới ----------
  {
    K.water(-900, 900, SEA_Z, SEA_Z + 900, -0.6, { color: '#238bb0' });
    const land = mesh(new THREE.BoxGeometry(800, 2, 400), [M.stoneD, M.stoneD, std('#8a9760'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, SEA_Z - 200, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    const sand = mesh(new THREE.PlaneGeometry(800, 14), std('#d9c9a0', { roughness: 1 }), 0, 0.01, SEA_Z - 5, { cast: false });
    sand.rotation.x = -Math.PI / 2;
    floor(-30, 30, HALL.z0, 54, 0, 'slab', { tile: 5.5, macro: 0.05 });
    // đá bazan đen ven biển
    for (let i = 0; i < 40; i++) {
      const x = -110 + K.rr() * 220, z = SEA_Z - 2 + K.rr() * 8;
      mesh(new THREE.IcosahedronGeometry(0.8 + K.rr() * 2, 0), i % 2 ? rock : rockL, x, 0.2, z, { cast: false }).scale.y = 0.7;
    }
    const hy = makeHill(K, 0, -120, [[0, 40], [28, 38], [60, 20], [95, 6], [130, -1]], { color: '#5c6b45', clip: { x0: -40, x1: 40, z0: -34, z1: 58, floor: groundY } });
    hillAt = hy;
    K.forest(K.scatter(-110, 110, -160, -70, 40).map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.0 });
    // ruộng tỏi xanh hai bên
    const garlic = std('#7ab04a', { roughness: 0.95 });
    for (const [x0, x1, z0, z1] of [[-90, -40, -20, 40], [40, 90, -20, 40]]) {
      const p = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), garlic, (x0 + x1) / 2, 0.012, (z0 + z1) / 2, { cast: false });
      p.rotation.x = -Math.PI / 2;
      for (let z = z0 + 2; z < z1; z += 3) box(x1 - x0, 0.14, 0.4, std('#5f8f38', { roughness: 1 }), (x0 + x1) / 2, 0.08, z, { cast: false });
    }
    K.palms([[-38, 50], [38, 50], [-38, 20], [38, 20]]);
  }

  // ---------- Cổng hang: hai khối đá lớn và vòm đá phía trên ----------
  {
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const m = mesh(new THREE.IcosahedronGeometry(1, 1), k % 2 ? rock : rockL, s * (12 + k * 3), 2.6 + k * 1.4, -2 - k * 3, { recv: true });
        m.scale.set(6.5 - k * 0.8, 5.4 + k * 1.1, 5.0);
        m.rotation.y = k + s;
      }
    }
    K.roofs.push({ minX: -9, maxX: 9, minZ: HALL.z1 - 2, maxZ: HALL.z0 + 2, lift: 12 });
  }

  // ---------- Điện trong hang: mái đá, nhũ đá, tượng Phật ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.45);
    scene.add(b);
    lods.push({ obj: b, z });
    // nhũ đá rủ từ trần
    for (let i = 0; i < 16; i++) {
      const cx = -7 + (i % 4) * 4.6 + (K.rr() - 0.5) * 1.6, cz = z + 4 + Math.floor(i / 4) * 3.8;
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.28 + K.rr() * 0.25, 1.4 + K.rr() * 1.8, 7), rockL);
      c.rotation.x = Math.PI;
      c.position.set(cx, y + 5.6, cz);
      scene.add(c);
    }
  }, {
    twoTier: false, wallMat: rock, colMat: rockL, light: 8, carpet: '#4a3a2a',
    roof: ({ x, y, cz, hx, d }) => {
      // vòm đá nửa cầu úp lên bốn bức tường (đáy mở để nhìn từ trong hang)
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4e4a45', roughness: 1, flatShading: true, side: THREE.DoubleSide }));
      m.scale.set(hx + 3, 5.4, d / 2 + 3);
      m.position.set(x, y - 0.4, cz);
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
      plaque(scene, 'CHÙA HANG', x, y - 0.9, HALL.z0 + 0.2, 3.2, 0.7);
      return { yTop: y + 5.6, rx: 1 };
    },
  });

  // ---------- Bãi: lư hương, cột cờ, đèn ----------
  cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
  for (const s of [-1, 1]) {
    for (let z = 10; z <= 50; z += 10) K.lampPost(s * 8, 0, z);
    K.flagPole(s * 5, 0, 48, 8);
  }
  K.flowers([[-14, 40], [-12, 40], [14, 40], [12, 40]]);

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'hanglyson',
  mapId: 'hanglyson',
  name: 'Chùa Hang (Lý Sơn)',
  loading: 'Sóng biển Lý Sơn đang vỗ vào đá núi lửa',
  hint: 'từ bãi biển đi vào cửa hang đá, thắp nhang trong điện thờ Phật dưới mái đá',
  info: 'Chùa Hang trên đảo Lý Sơn, Quảng Ngãi, nằm trong hang đá núi lửa: từ bãi biển đá bazan đi vào cửa hang, bên trong là điện thờ Phật dưới mái đá có nhũ đá rủ xuống; hai bên bãi là ruộng tỏi xanh. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Vào hang', 'Đi thẳng từ bãi vào cửa hang giữa hai khối đá lớn để tới điện thờ Phật.'],
    ['Thắp nhang', 'Trong hang thì thắp trước bàn thờ Phật; ngoài bãi thì ở lư hương đá giữa bãi.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 50, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'hang' : 'bai'),
  defaultPlace: 'bai',
  PLACE_INFO: {
    hang: { title: 'Thắp nhang trong hang', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật trong hang đá, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    bai: { title: 'Thắp nhang ngoài bãi', text: 'Bạn sẽ bước tới lư hương đá giữa bãi trước cửa hang, nhìn ra biển, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'bien', name: 'Bãi biển', x: 0, z: 54, ry: Math.PI },
    { id: 'bai', name: 'Bãi trước hang', x: 0, z: 14, ry: Math.PI },
    { id: 'hang', name: 'Trong hang', x: 0, z: HALL.z0 - 2.5, ry: Math.PI },
  ],
  MAP: {
    box: [-40, -36, 80, 112],
    font: 4,
    shapes: [
      { x0: -40, x1: 40, z0: SEA_Z - 6, z1: 76, c: 'm-water' },
      { x0: AREA.x0, x1: AREA.x1, z0: AREA.z0, z1: AREA.z1, c: 'm-porch' },
      { x0: -30, x1: 30, z0: HALL.z0, z1: 54, c: 'm-stone' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-rock' },
      { x0: -40, x1: -12, z0: -10, z1: 6, c: 'm-rock' },
      { x0: 12, x1: 40, z0: -10, z1: 6, c: 'm-rock' },
    ],
    labels: [['bien', 0, 58, 'Bãi biển'], ['bai', 0, 24, 'Bãi trước hang'], ['hang', 0, -14, 'Hang chùa']],
  },
  OV: { bounds: { x0: -40, x1: 40, z0: -34, z1: 70 }, dist: 90 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 52, spread: 22, ry: Math.PI, say: 'Biển Lý Sơn đẹp quá' },
    { x: -14, z: 36, spread: 5, ry: 0 },
  ],
  BOT_SPAWN: [[-24, 24, 36, 54], [-6, 6, 4, 10]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Hang đá mát ghê', 'Tỏi Lý Sơn xanh quá', 'Đá núi lửa đen thui', 'Biển xanh trong vắt'],
  build,
};
