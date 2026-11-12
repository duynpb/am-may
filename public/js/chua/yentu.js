// Chùa Đồng Yên Tử (Quảng Ninh): núi thiêng của Thiền phái Trúc Lâm do Phật hoàng Trần Nhân Tông sáng lập. Dưới chân núi
// là cổng Trúc Lâm Yên Tử và chùa Giải Oan, ga cáp treo; cáp treo đưa lên đỉnh núi (một "tầng" riêng), rồi leo bậc đá
// lên mỏm đá cao nhất có chùa Đồng nhỏ đúc bằng đồng giữa mây trời. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill, curvedRoof, cableway } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 50;
const YARD = { x0: -30, x1: 30, z0: -22, z1: 47 };
const HALL = { x: 0, z0: 0, z1: -14, hx: 10, y: 0, plaque: 'CHÙA GIẢI OAN', wallH: 6 };
const STA = { x: 20, z: 22 }; // ga cáp treo chân núi
const MT = { x: 0, z: -230 };
const S = 86; // mặt bằng đỉnh núi
const P = MT.z;
const PEAK = { x0: -9, x1: 9, z0: P - 14, z1: P + 2, y: S + 6 }; // mỏm đá cao nhất
const PST = { x0: -2.5, x1: 2.5, zBottom: P + 12, zTop: PEAK.z1, y0: S, y1: PEAK.y }; // bậc đá lên mỏm
const DONG = { x: 0, z0: P - 1, z1: P - 9, hx: 6.4, y: PEAK.y, wallH: 3.6 }; // chùa Đồng
const STB = { x: 16, z: P + 16 }; // ga cáp treo trên đỉnh
const PROFILE = [[0, S], [34, S], [52, S - 12], [80, 58], [110, 34], [140, 15], [175, 5], [205, 1.5], [240, -1.5]];

const Z1 = (r) => ({ ...r, zone: 1 });
const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 66), // sân trước cổng
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân chùa Giải Oan
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, GATE_Z - 4.4),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
  // đỉnh núi (chỉ tới bằng cáp treo)
  Z1(rect(-23, 23, P + 12.6, P + 23)),
  Z1(rect(-23, -9.8, P - 23, P + 23)), Z1(rect(9.8, 23, P - 23, P + 23)),
  Z1(rect(-23, 23, P - 23, P - 14.8)),
  Z1(rect(-9.8, -3.3, PEAK.z1 + 0.6, P + 13)), Z1(rect(3.3, 9.8, PEAK.z1 + 0.6, P + 13)),
  Z1(rect(PST.x0 + 0.8, PST.x1 - 0.8, PST.zTop - 0.8, PST.zBottom + 0.8)),
  Z1(rect(PEAK.x0 + 1, PEAK.x1 - 1, DONG.z0 + 0.6, PEAK.z1 - 0.6)),
  Z1(rect(PEAK.x0 + 1, -DONG.hx - 1.0, PEAK.z0 + 1, PEAK.z1 - 0.6)), Z1(rect(DONG.hx + 1.0, PEAK.x1 - 1, PEAK.z0 + 1, PEAK.z1 - 0.6)),
  Z1(rect(PEAK.x0 + 1, PEAK.x1 - 1, PEAK.z0 + 1, DONG.z1 - 1.2)),
  ...hallWalk(DONG).map(Z1),
];
const ROUND_OBSTACLES = [
  { x: STA.x, z: STA.z, r: 4 },
  { x: STB.x, z: STB.z, r: 4 },
];
const RITUALS = [
  { place: 'giaioan', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'dong', y: S, stone: true, burner: { x: 0, z: P + 15.5 }, merit: { x: 3.8, z: P + 15.3 }, face: { x: 0, y: PEAK.y + 2, z: (DONG.z0 + DONG.z1) / 2 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

const onTop = (x, z) => Math.hypot(x - MT.x, z - MT.z) < 36;
function groundY(x, z) {
  if (onTop(x, z)) {
    const s = stairY(PST, x, z);
    if (s != null) return s;
    if (x >= PEAK.x0 && x <= PEAK.x1 && z >= PEAK.z0 && z <= PEAK.z1) return inHall(DONG, x, z) ? PEAK.y + 0.25 : PEAK.y;
    return S;
  }
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6ea6d8', skyBottom: '#e8eae4', fog: [220, 900], shadowSize: 50 });
  const { scene, M, std, mesh, box, cyl, floor, terrace, stairs, plaque, pickables, updaters } = K;
  const bronze = std('#8a6a3c', { metalness: 0.8, roughness: 0.35 });

  // ---------- Đất, núi Yên Tử, rừng tùng ----------
  {
    const land = mesh(new THREE.BoxGeometry(900, 2, 900), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -100, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 68, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, MT.x, MT.z, PROFILE, { color: '#4f6a3a', clip: { x0: -52, x1: 52, z0: -26, z1: 70, floor: groundY } });
    hillAt = hy;
    // rừng tùng cổ thụ trên sườn núi (chừa tuyến cáp)
    const spots = [];
    for (let i = 0; i < 280; i++) {
      const a = K.rr() * Math.PI * 2, r = 40 + K.rr() * 190;
      const x = MT.x + Math.cos(a) * r, z = MT.z + Math.sin(a) * r;
      if (x > -56 && x < 56 && z > -30) continue;
      if (Math.abs(x - (STA.x + STB.x) / 2) < 9 && z > STB.z && z < STA.z) continue;
      spots.push([x, z, Math.max(0, hy(x, z)) - 0.3]);
    }
    K.pines(spots, 0, { scale: 1.1 });
    // núi xa
    for (const [x, z, r, h] of [[-200, -160, 110, 50], [190, -190, 100, 44], [-60, -420, 160, 70]]) {
      const m = new THREE.Mesh(new THREE.LatheGeometry([[r, -1], [r * 0.6, h * 0.5], [r * 0.2, h], [0.01, h]].map(([a, b]) => new THREE.Vector2(a, b)), 40), std('#56703f', { roughness: 0.95, flatShading: true }));
      m.position.set(x, 0, z);
      scene.add(m);
    }
  }

  // ---------- Chân núi: cổng Trúc Lâm Yên Tử, sân, chùa Giải Oan ----------
  K.gate3(0, GATE_Z, 'TRÚC LÂM YÊN TỬ', { walls: 18 });
  {
    for (const s of [-1, 1]) box(0.6, 2.6, GATE_Z - YARD.z0, M.wall, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
    box(YARD.x1 - YARD.x0, 2.6, 0.6, M.wall, 0, 1.3, YARD.z0 - 0.3);
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z);
      b.scale.setScalar(1.4);
      scene.add(b);
      K.lods.push({ obj: b, z });
    });
    for (const s of [-1, 1]) {
      for (let z = 8; z <= 40; z += 8) K.lampPost(s * 7, 0, z);
      K.flagPole(s * 4.5, 0, 42, 8);
    }
    K.pines([[-24, 40], [-24, 24], [-24, 8], [24, 40], [-20, -18], [20, -18], [-34, 58], [34, 58]]);
  }

  // ---------- Cáp treo chân núi — đỉnh núi ----------
  const cw = cableway(K, {
    A: { x: STA.x, y: 5.6, z: STA.z }, B: { x: STB.x, y: S + 5.6, z: STB.z },
    stations: [{ x: STA.x, y: 0, z: STA.z }, { x: STB.x, y: S, z: STB.z }],
    ground: (x, z) => Math.max(0, hillAt(x, z)), towers: [0.2, 0.4, 0.6, 0.8], sag: 1.6, loopN: 12, loopSec: 240,
  });

  // ---------- Đỉnh núi: sân đá, mỏm đá, bậc đá, chùa Đồng ----------
  {
    floor(MT.x - 24, MT.x + 24, P - 24, P + 24, S, 'slab', { tile: 5.5, macro: 0.05 });
    for (const s of [-1, 1]) {
      box(48, 0.8, 0.3, M.stone, MT.x, S + 0.4, P + s * 24);
      box(0.3, 0.8, 48, M.stone, MT.x + s * 24, S + 0.4, P);
    }
    // mỏm đá: khối đá xám gồ ghề, mặt trên phẳng lát đá
    const rock = std('#7b7668', { roughness: 1, flatShading: true });
    terrace(PEAK.x0, PEAK.x1, PEAK.z0, PEAK.z1, S - 0.5, PEAK.y, { side: rock, kind: 'slab' });
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2, rx = 9.6 * Math.cos(a), rz = 8.6 * Math.sin(a);
      if (Math.abs(rx) < 3.6 && rz > 0) continue; // chừa bậc đá
      const r = mesh(new THREE.IcosahedronGeometry(1.4 + K.rr() * 1.4, 0), rock, MT.x + rx, S + 1.4 + K.rr() * 2.6, (PEAK.z0 + PEAK.z1) / 2 + rz, { cast: false });
      r.scale.set(1.2, 1.4, 1);
    }
    stairs({ ...PST, base: S - 0.5 });
    // chùa Đồng: tường, cột, mái đúc đồng
    K.hall({ ...DONG, plaque: 'CHÙA ĐỒNG' }, (y, z) => {
      const b = makeThichCa();
      b.position.set(0, y, z);
      b.scale.setScalar(0.85);
      scene.add(b);
    }, {
      twoTier: false, wallMat: bronze, colMat: bronze, light: 5,
      roof: ({ x, y, cz, hx, d }) => {
        const g = new THREE.Group();
        const top = curvedRoof(g, x, y, cz, hx + 1.2, d / 2 + 1.2, 1.4, d / 2 * 0.6, { lift: 0.8 });
        g.traverse((m) => m.isMesh && (m.material = bronze));
        scene.add(g);
        mesh(new THREE.SphereGeometry(0.32, 12, 10), M.gold, x, top.yTop + 0.5, cz);
        plaque(scene, 'CHÙA ĐỒNG', x, y - 0.5, DONG.z0 + 0.06, 2.4, 0.5, 0, { size: 90 });
        return { yTop: top.yTop, rx: 1 };
      },
    });
    K.roofs.push({ minX: -10, maxX: 10, minZ: PEAK.z0, maxZ: PEAK.z1, lift: 14 });
    K.pines([[-18, P - 18], [18, P - 18], [-18, P + 6], [20, P - 4]].map(([x, z]) => [x, z, S]), 0, { scale: 0.7 });
    for (const [x, z] of [[-14, P + 18], [14, P + 4], [-14, P - 2]]) K.stoneLamp(x, S, z);
    // mây trôi quanh đỉnh
    const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
    const clouds = [];
    for (let i = 0; i < 18; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cloudM);
      c.scale.set(14 + K.rr() * 14, 3 + K.rr() * 3, 9 + K.rr() * 8);
      c.userData = { a: (i / 18) * Math.PI * 2, r: 60 + K.rr() * 50, y: 48 + K.rr() * 28, sp: 0.004 + K.rr() * 0.004 };
      scene.add(c);
      clouds.push(c);
    }
    updaters.push((t) => {
      for (const c of clouds) {
        const u = c.userData, a = u.a + t * u.sp;
        c.position.set(MT.x + Math.cos(a) * u.r, u.y, MT.z + Math.sin(a) * u.r);
      }
    });
  }

  const world = K.finish({ rituals: RITUALS });
  world.ride = cw.ride;
  world.gotoHits = cw.gotoHits;
  return world;
}

export const SITE = {
  id: 'yentu',
  name: 'Chùa Đồng Yên Tử',
  loading: 'Cáp treo Yên Tử đang chờ',
  hint: 'viếng chùa Giải Oan, rồi đi cáp treo lên đỉnh núi, leo bậc đá tới chùa Đồng',
  info: 'Yên Tử ở Quảng Ninh là núi thiêng của Thiền phái Trúc Lâm do Phật hoàng Trần Nhân Tông sáng lập. Dưới chân núi là cổng Trúc Lâm Yên Tử và chùa Giải Oan; cáp treo đưa lên đỉnh núi, rồi leo bậc đá lên mỏm đá cao nhất có chùa Đồng nhỏ đúc bằng đồng giữa mây trời. (Dựng phỏng theo không khí, không phải bản sao; núi được thu nhỏ cho dễ đi.)',
  tips: [
    ['Đi cáp treo', 'Ra ga cáp treo bên phải sân chùa Giải Oan, bấm “Đi cáp treo lên đỉnh”: bạn ngồi vào cabin, bay theo dây cáp lên đỉnh khoảng 10 giây (bấm “Tới ga ngay” nếu muốn tới luôn). Trên đỉnh có ga để xuống lại.'],
    ['Thắp nhang', 'Dưới chân núi thì thắp trong chùa Giải Oan; trên đỉnh thì ở lư hương đá dưới chân bậc đá lên chùa Đồng.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 60, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  unreachable: 'Chỗ đó ở tầng khác — hãy đi cáp treo',
  placeOf: (x, z) => (onTop(x, z) ? 'dong' : 'giaioan'),
  defaultPlace: 'giaioan',
  PLACE_INFO: {
    giaioan: { title: 'Thắp nhang trong chùa Giải Oan', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật trong chùa Giải Oan, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    dong: { title: 'Thắp nhang trước chùa Đồng', text: 'Bạn sẽ bước tới lư hương đá dưới chân bậc đá lên chùa Đồng trên đỉnh Yên Tử, giữa mây trời, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
  },
  bowRy: (x, z) => (onTop(x, z) ? Math.atan2(MT.x - x, (DONG.z0 + DONG.z1) / 2 - z) : Math.PI),
  GOTOS: [
    { x: STA.x, z: STA.z + 5.6, r: 4.5, ride: 'up', label: 'Đi cáp treo lên đỉnh', msg: 'Mời bạn vào cabin — cáp treo đưa bạn lên đỉnh Yên Tử', done: 'Bạn đã lên tới đỉnh Yên Tử — leo bậc đá phía trước để tới chùa Đồng', to: { x: STB.x - 5, z: STB.z + 4, ry: Math.atan2(-STB.x, P - STB.z) } },
    { x: STB.x, z: STB.z + 5.6, r: 4.5, ride: 'down', label: 'Đi cáp treo xuống chân núi', msg: 'Mời bạn vào cabin — cáp treo đưa bạn xuống chân núi', done: 'Bạn đã xuống tới chân núi', to: { x: STA.x - 4, z: STA.z + 6, ry: Math.PI } },
  ],
  PLACES: [
    { id: 'gate', name: 'Cổng Trúc Lâm Yên Tử', x: 0, z: 60, ry: Math.PI },
    { id: 'giaioan', name: 'Chùa Giải Oan', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'ga', name: 'Ga cáp treo', x: STA.x - 4, z: STA.z + 6, ry: Math.PI },
    { id: 'dinh', name: 'Đỉnh núi', x: 0, z: P + 20, ry: Math.PI },
    { id: 'dong', name: 'Chùa Đồng', x: 0, z: PEAK.z1 - 1.2, ry: Math.PI },
  ],
  MAP: {
    box: [-60, -258, 120, 330],
    font: 7,
    shapes: [
      { x: MT.x, z: MT.z, r: 175, c: 'm-tree' },
      { x: MT.x, z: MT.z, r: 52, c: 'm-rock' },
      { x0: -24, x1: 24, z0: P - 24, z1: P + 24, c: 'm-stone' },
      { x0: PEAK.x0, x1: PEAK.x1, z0: PEAK.z0, z1: PEAK.z1, c: 'm-terrace' },
      { x0: -DONG.hx, x1: DONG.hx, z0: DONG.z1, z1: DONG.z0, c: 'm-gold' },
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 68, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: STA.x - 3, x1: STA.x + 3, z0: STA.z - 3, z1: STA.z + 3, c: 'm-hall' },
      { x0: STB.x - 3, x1: STB.x + 3, z0: STB.z - 3, z1: STB.z + 3, c: 'm-hall' },
    ],
    labels: [['gate', 0, 62, 'Cổng'], ['giaioan', 0, -7, 'Chùa Giải Oan'], ['ga', STA.x, STA.z + 9, 'Cáp treo'], ['dinh', 0, P + 30, 'Đỉnh núi'], ['dong', 0, P - 20, 'Chùa Đồng']],
  },
  OV: { bounds: { x0: -60, x1: 60, z0: -255, z1: 66 }, dist: 230, y: 20 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: P + 18, spread: 4, act: 'bow', ry: Math.PI, say: 'lạy Phật' },
    { x: 0, z: PEAK.z1 - 1, spread: 3, act: 'gassho', ry: Math.PI },
    { x: -16, z: P + 14, spread: 4, ry: 0, say: 'Mây bay dưới chân luôn' },
    { x: 0, z: 30, spread: 14, ry: 0 },
  ],
  BOT_SPAWN: [[-20, 20, 10, 44], [-18, 18, P + 14, P + 22]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Yên Tử linh thiêng quá', 'Chùa Đồng nhỏ mà đẹp ghê', 'Đi cáp treo lên đỉnh thôi', 'Trên này lạnh ghê'],
  build,
};
