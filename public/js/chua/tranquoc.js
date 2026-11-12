// Chùa Trấn Quốc (Hồ Tây, Hà Nội): ngôi chùa cổ trên bán đảo nhỏ giữa Hồ Tây. Từ đường Thanh Niên đi theo lối đê qua
// mặt hồ, qua cổng vào sân có bảo tháp đỏ mười một tầng, mỗi tầng có tượng Phật ngọc trắng trong ô cửa; phía sau là
// chánh điện, bên cạnh có cây bồ đề. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa } from '../buddha.js';

const ISLAND = { x0: -30, x1: 30, z0: -40, z1: 27 };
const GATE_Z = 24;
const ROAD = { z0: 58, z1: 70 };
const TOWER = { x: 0, z: 8, half: 3.0, tiers: 11 };
const HALL = { x: 0, z0: -10, z1: -26, hx: 11, y: 0, plaque: 'TRẤN QUỐC TỰ', wallH: 5.6 };
const BODHI = { x: -18, z: -2 };

const WALK_AREAS = [
  rect(-60, 60, ROAD.z0 + 0.4, ROAD.z1), // đường Thanh Niên ven hồ
  rect(-2.6, 2.6, ISLAND.z1 - 0.5, ROAD.z0 + 1), // lối đê qua mặt hồ
  ...gateWalk(0, GATE_Z),
  rect(ISLAND.x0 + 1.5, ISLAND.x1 - 1.5, HALL.z0 + 0.6, GATE_Z - 4.4), // sân tháp
  rect(ISLAND.x0 + 1.5, -HALL.hx - 1.2, ISLAND.z0 + 1.5, GATE_Z - 4.4), rect(HALL.hx + 1.2, ISLAND.x1 - 1.5, ISLAND.z0 + 1.5, GATE_Z - 4.4),
  rect(ISLAND.x0 + 1.5, ISLAND.x1 - 1.5, ISLAND.z0 + 1.5, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 2.3 },
  { x: BODHI.x, z: BODHI.z, r: 2.0 },
];
const RITUALS = [
  { place: 'thap', y: 0, stone: true, burner: { x: TOWER.x, z: TOWER.z + TOWER.half + 4.6 }, merit: { x: TOWER.x + 3.6, z: TOWER.z + TOWER.half + 4.4 }, face: { x: TOWER.x, y: 3, z: TOWER.z } },
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7aaed8', skyBottom: '#e6eaea', fog: [180, 800], fogColor: 0xdfe6e8 });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, plaque, pickables, lods } = K;
  const brickRed = std('#a8452f', { roughness: 0.85 });

  // ---------- Hồ Tây, bán đảo, lối đê, đường ven hồ ----------
  {
    K.water(-700, 700, -500, ROAD.z0 - 1, -0.6, { color: '#4b858a' });
    const bank = std('#8f897d', { roughness: 1 });
    // bán đảo: nền đất kè đá cao hơn mặt hồ
    terrace(ISLAND.x0, ISLAND.x1, ISLAND.z0, ISLAND.z1, -1.2, 0, { side: bank, kind: 'slab' });
    // lối đê
    terrace(-3, 3, ISLAND.z1, ROAD.z0, -1.2, 0, { side: bank, kind: 'tile', o: { tile: 2.4, macro: 0.04, tint: '#e2dccf' } });
    for (const s of [-1, 1]) for (let z = ISLAND.z1 + 1; z < ROAD.z0; z += 2.2) cyl(0.1, 0.12, 0.8, M.stone, s * 2.9, 0.4, z, {}, 8);
    // bờ đường ven hồ và phố phía sau
    const land = mesh(new THREE.BoxGeometry(800, 2, 300), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, ROAD.z0 + 150, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-70, 70, ROAD.z0, ROAD.z1 + 2, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    box(800, 1.0, 0.8, M.stone, 0, -0.3, ROAD.z0 - 0.4);
    K.forest([...Array.from({ length: 14 }, (_, i) => [-65 + i * 10, ROAD.z1 + 4])], 0, { scale: 1.2 });
    const shop = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888')];
    for (let i = 0; i < 20; i++) {
      const h = 8 + ((i * 41) % 9);
      box(9.4, h, 10, shop[i % 4], -95 + i * 10, h / 2, ROAD.z1 + 16, { cast: false });
    }
    // thuyền thiên nga và đảo xa trên hồ
    const swanM = std('#f4f1ea', { roughness: 0.6 });
    for (const [x, z] of [[-40, 30], [46, 10], [-60, -30]]) {
      const g = group(x, -0.5, z, Math.random() * 6, { merge: false });
      box(1.6, 0.5, 2.4, swanM, 0, 0.25, 0, { parent: g });
      const neck = new THREE.CatmullRomCurve3([[0, 0.4, 0.9], [0, 1.2, 1.1], [0, 1.6, 0.8], [0, 1.6, 1.2]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
      mesh(new THREE.TubeGeometry(neck, 10, 0.12, 6), swanM, 0, 0, 0, { parent: g });
    }
  }

  // ---------- Cổng, sân, cây xanh bán đảo ----------
  K.gate3(0, GATE_Z, 'TRẤN QUỐC TỰ', { walls: 0 });
  {
    for (const s of [-1, 1]) {
      box(ISLAND.x1 - 11, 1.0, 0.4, M.stone, s * (ISLAND.x1 + 11) / 2, 0.5, ISLAND.z1 - 0.3);
      box(0.4, 1.0, ISLAND.z1 - ISLAND.z0, M.stone, s * (ISLAND.x1 - 0.3), 0.5, (ISLAND.z0 + ISLAND.z1) / 2);
    }
    box(ISLAND.x1 - ISLAND.x0, 1.0, 0.4, M.stone, 0, 0.5, ISLAND.z0 + 0.3);
    K.forest([[-26, 20], [26, 20], [-26, -36], [26, -36], [26, -10], [-26, -20], [24, 4]], 0, { scale: 1.2 });
    for (const s of [-1, 1]) K.lampPost(s * 7, 0, 18);
  }

  // ---------- Bảo tháp đỏ mười một tầng, tượng Phật ngọc trắng trong ô cửa ----------
  {
    const g = group(TOWER.x, 0, TOWER.z);
    box(TOWER.half * 2 + 3.2, 0.7, TOWER.half * 2 + 3.2, M.stone, 0, 0.35, 0, { parent: g });
    let y = 0.7, half = TOWER.half;
    const niches = [];
    for (let t = 0; t < TOWER.tiers; t++) {
      const h = t === 0 ? 2.6 : 1.55 - t * 0.03;
      box(half * 2, h, half * 2, brickRed, 0, y + h / 2, 0, { parent: g });
      box(half * 2 + 0.5, 0.18, half * 2 + 0.5, std('#7a2f20'), 0, y + h + 0.09, 0, { parent: g }); // gờ mái mỗi tầng
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        const n = (t === 0 ? 1 : 3);
        for (let k = 0; k < n; k++) {
          const off = (k - (n - 1) / 2) * (half * 0.6);
          const nx = Math.sin(a) * (half + 0.02) + Math.cos(a) * off, nz = Math.cos(a) * (half + 0.02) - Math.sin(a) * off;
          const d = box(0.42, h * 0.6, 0.05, std('#3a1f16'), nx, y + h * 0.45, nz, { parent: g, cast: false });
          d.rotation.y = a;
          niches.push([TOWER.x + nx + Math.sin(a) * 0.05, y + h * 0.22, TOWER.z + nz + Math.cos(a) * 0.05, a]);
        }
      }
      y += h + 0.18;
      half -= 0.16;
    }
    // đài sen và chóp chín tầng trên đỉnh
    cyl(half + 0.3, half + 0.1, 0.5, std('#e8e1d2'), 0, y + 0.25, 0, { parent: g }, 16);
    for (let k = 0; k < 9; k++) cyl(0.5 - k * 0.04, 0.55 - k * 0.04, 0.32, std('#e8e1d2'), 0, y + 0.65 + k * 0.32, 0, { parent: g }, 12);
    mesh(new THREE.ConeGeometry(0.18, 1.2, 8), M.gold, 0, y + 4.1, 0, { parent: g });
    // tượng Phật ngọc trắng nhỏ trong các ô cửa
    const jade = std('#f3f0e6', { roughness: 0.5 });
    const body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.17, 0.32, 8), jade, niches.length);
    const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 6), jade, niches.length);
    const o = new THREE.Object3D();
    niches.forEach(([x, yy, z, a], i) => {
      o.position.set(x, yy + 0.16, z);
      o.rotation.set(0, a, 0);
      o.updateMatrix();
      body.setMatrixAt(i, o.matrix);
      o.position.set(x, yy + 0.4, z);
      o.updateMatrix();
      head.setMatrixAt(i, o.matrix);
    });
    scene.add(body, head);
    plaque(g, 'BẢO THÁP', 0, 1.6, TOWER.half + 0.06, 2.2, 0.45, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 5, maxX: TOWER.x + 5, minZ: TOWER.z - 5, maxZ: TOWER.z + 5, lift: 24 });
  }

  // ---------- Chánh điện, cây bồ đề ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.4);
    scene.add(b);
    lods.push({ obj: b, z });
  });
  {
    cyl(0.6, 0.9, 4.5, M.trunk, BODHI.x, 2.25, BODHI.z, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 7, 0, 4.2], [-3, 6, 1, 3], [3, 6.2, -1, 3.2], [0.5, 6.4, 3, 2.6]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, BODHI.x + dx, dy, BODHI.z + dz).scale.set(s, s * 0.7, s);
    cyl(1.6, 1.8, 0.4, M.stone, BODHI.x, 0.2, BODHI.z, {}, 20);
    plaque(scene, 'CÂY BỒ ĐỀ', BODHI.x, 1.0, BODHI.z + 1.8, 1.8, 0.4, 0, { size: 80 });
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'tranquoc',
  name: 'Chùa Trấn Quốc',
  loading: 'Gió Hồ Tây đang thổi',
  hint: 'theo lối đê qua mặt Hồ Tây vào chùa, thắp nhang trước bảo tháp đỏ mười một tầng',
  info: 'Chùa Trấn Quốc là ngôi chùa cổ trên bán đảo nhỏ giữa Hồ Tây, Hà Nội. Từ đường ven hồ đi theo lối đê qua mặt nước vào sân có bảo tháp đỏ mười một tầng, mỗi tầng có tượng Phật ngọc trắng trong ô cửa; phía sau là chánh điện, bên cạnh có cây bồ đề. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Bảo tháp', 'Đi vòng quanh bảo tháp để thấy các tượng Phật nhỏ trong ô cửa ở cả bốn mặt.'],
    ['Thắp nhang', 'Trước bảo tháp có lư hương đá; trong chánh điện thì thắp trước bàn thờ Phật.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 63, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) || z < HALL.z0 ? 'dien' : 'thap'),
  defaultPlace: 'thap',
  PLACE_INFO: {
    thap: { title: 'Thắp nhang trước bảo tháp', text: 'Bạn sẽ bước tới lư hương đá trước bảo tháp đỏ mười một tầng, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
  },
  bowRy: (x, z) => (z > HALL.z0 && Math.hypot(x - TOWER.x, z - TOWER.z) < 14 ? Math.atan2(TOWER.x - x, TOWER.z - z) : Math.PI),
  PLACES: [
    { id: 'duong', name: 'Đường ven Hồ Tây', x: 0, z: 63, ry: Math.PI },
    { id: 'de', name: 'Lối đê qua hồ', x: 0, z: 42, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp', x: 0, z: TOWER.z + TOWER.half + 7, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'bode', name: 'Cây bồ đề', x: BODHI.x + 3, z: BODHI.z + 4, ry: -Math.PI * 0.75 },
  ],
  MAP: {
    box: [-40, -44, 80, 116],
    font: 4,
    shapes: [
      { x0: -40, x1: 40, z0: -44, z1: ROAD.z0, c: 'm-water' },
      { x0: -40, x1: 40, z0: ROAD.z0, z1: ROAD.z1 + 2, c: 'm-stone' },
      { x0: -3, x1: 3, z0: ISLAND.z1, z1: ROAD.z0, c: 'm-porch' },
      { x0: ISLAND.x0, x1: ISLAND.x1, z0: ISLAND.z0, z1: ISLAND.z1, c: 'm-porch' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: TOWER.x - TOWER.half, x1: TOWER.x + TOWER.half, z0: TOWER.z - TOWER.half, z1: TOWER.z + TOWER.half, c: 'm-corridor' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: BODHI.x, z: BODHI.z, r: 3.5, c: 'm-tree' },
    ],
    labels: [['duong', 0, 66, 'Đường ven hồ'], ['de', 0, 42, 'Lối đê'], ['thap', 0, TOWER.z - 5, 'Bảo tháp'], ['dien', 0, -18, 'Chánh điện'], ['bode', BODHI.x, BODHI.z - 4, 'Cây bồ đề']],
  },
  OV: { bounds: { x0: -40, x1: 40, z0: -42, z1: 68 }, dist: 100 },
  TRIPS: [
    { x: 0, z: TOWER.z + TOWER.half + 7, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow' },
    { x: 1.5, z: 44, spread: 1, ry: Math.PI / 2, say: 'Hồ Tây đẹp quá' },
    { x: 12, z: 8, spread: 3, ry: -Math.PI / 2 },
    { x: 0, z: 64, spread: 30, ry: Math.PI },
  ],
  BOT_SPAWN: [[-30, 30, 60, 68], [-20, 20, 14, 19]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Hồ Tây lộng gió quá', 'Tháp đỏ cao ghê', 'Chùa cổ nhất Hà Nội đó', 'Hoàng hôn ở đây đẹp lắm'],
  build,
};
