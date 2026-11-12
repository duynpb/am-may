// Thiền viện Tây Thiên (núi Tam Đảo): Thiền viện Trúc Lâm Tây Thiên trên sườn núi giữa rừng già, cạnh có thác nước;
// cáp treo đưa lên đỉnh núi (một "tầng" riêng) có đền Thượng thờ Quốc Mẫu Tây Thiên giữa mây.
// (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill, cableway } from './base.js';
import { makeThichCa } from '../buddha.js';

const Y = 6; // nền thiền viện
const TER = { x0: -30, x1: 30, z0: -30, z1: 36 };
const ST = { x0: -4, x1: 4, zBottom: 46, zTop: TER.z1, y0: 0, y1: Y };
const GATE_Z = 32;
const HALL = { x: 0, z0: -4, z1: -22, hx: 12, y: Y, plaque: 'CHÁNH ĐIỆN', wallH: 6 };
const BELL = { x: -19, z: 6 };
const STA = { x: 21, z: 10 }; // ga cáp treo (trên nền thiền viện)
const MT = { x: 0, z: -200 };
const S = 70; // đỉnh núi
const DEN = { x: 0, z0: MT.z - 2, z1: MT.z - 12, hx: 7, y: S, plaque: 'ĐỀN THƯỢNG', wallH: 4.6 };
const STB = { x: 12, z: MT.z + 10 }; // ga cáp treo trên đỉnh
const FALL = { x: -44, z: 34 }; // thác nước (nhìn thấy từ sân dưới chân núi)

const Z1 = (r) => ({ ...r, zone: 1 });
const WALK_AREAS = [
  rect(-50, 50, ST.zBottom + 0.4, 64), // sân dưới chân núi
  rect(ST.x0 + 0.8, ST.x1 - 0.8, ST.zTop - 0.8, ST.zBottom + 0.8),
  rect(-12, 12, GATE_Z + 2.6, TER.z1 - 0.4), // thềm trước cổng
  ...gateWalk(0, GATE_Z),
  rect(TER.x0 + 1, TER.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4),
  rect(TER.x0 + 1, -HALL.hx - 1.2, TER.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, TER.x1 - 1, TER.z0 + 1, GATE_Z - 4.4),
  rect(TER.x0 + 1, TER.x1 - 1, TER.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
  // đỉnh núi (chỉ tới bằng cáp treo)
  Z1(rect(-18, 18, DEN.z0 + 0.6, MT.z + 18)),
  Z1(rect(-18, -DEN.hx - 1.2, MT.z - 18, MT.z + 18)), Z1(rect(DEN.hx + 1.2, 18, MT.z - 18, MT.z + 18)),
  Z1(rect(-18, 18, MT.z - 18, DEN.z1 - 1.4)),
  ...hallWalk(DEN).map(Z1),
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: STA.x, z: STA.z, r: 4 },
  { x: STB.x, z: STB.z, r: 4 },
];
const RITUALS = [
  { place: 'dien', y: Y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: Y + 3.2, z: HALL.z1 + 1.7 } },
  { place: 'den', y: S + 0.25, burner: { x: 0, z: DEN.z1 + 3.8 }, merit: { x: DEN.hx - 2.6, z: DEN.z1 + 3.6 }, face: { x: 0, y: S + 2.6, z: DEN.z1 + 1.7 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

const onTop = (x, z) => Math.hypot(x - MT.x, z - MT.z) < 28;
function groundY(x, z) {
  if (onTop(x, z)) return inHall(DEN, x, z) ? S + 0.25 : S;
  const s = stairY(ST, x, z);
  if (s != null) return s;
  if (x >= TER.x0 && x <= TER.x1 && z >= TER.z0 && z <= TER.z1) {
    if (inHall(HALL, x, z)) return Y + 0.25;
    if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return Y + 0.3;
    return Y;
  }
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7fb2d6', skyBottom: '#e3e8e2', fog: [160, 700], fogColor: 0xdfe6e1 });
  const { scene, M, std, mesh, box, cyl, floor, terrace, stairs, plaque, pickables, updaters } = K;

  // ---------- Đất, núi Tam Đảo, rừng già ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 700), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -80, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, ST.zBottom, 66, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, MT.x, MT.z, [[0, S], [26, S], [50, 56], [80, 34], [115, 14], [150, 3], [180, -1]], { color: '#4c6a3c', clip: { x0: -52, x1: 52, z0: -34, z1: 68, floor: groundY } });
    hillAt = hy;
    const spots = [];
    for (let i = 0; i < 300; i++) {
      const a = K.rr() * Math.PI * 2, r = 30 + K.rr() * 160;
      const x = MT.x + Math.cos(a) * r, z = MT.z + Math.sin(a) * r;
      if (x > -56 && x < 56 && z > -36) continue;
      if (Math.abs(x - (STA.x + STB.x) / 2) < 8 && z > STB.z && z < STA.z) continue;
      spots.push([x, z, Math.max(0, hy(x, z)) - 0.3]);
    }
    K.forest(spots, 0, { scale: 1.3, hue: 0.27 });
    K.forest([...K.scatter(-140, -58, -30, 70, 40), ...K.scatter(58, 140, -30, 70, 40)], 0, { scale: 1.3, hue: 0.27 });
    K.bamboo([[-40, 40, 12], [40, 38, 12], [-36, -24, 10]]);
  }

  // ---------- Thác nước bên trái thiền viện: vách đá, dòng nước trắng chảy, hồ nhỏ ----------
  {
    const rock = std('#6f6a5c', { roughness: 1, flatShading: true });
    for (let i = 0; i < 14; i++) mesh(new THREE.IcosahedronGeometry(3 + K.rr() * 3, 0), rock, FALL.x - 6 + K.rr() * 12, 2 + K.rr() * 12, FALL.z - 6 - K.rr() * 4, { cast: false }).scale.set(1.2, 1.4, 0.9);
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 128;
    const g = c.getContext('2d');
    for (let y = 0; y < 128; y++) for (let x = 0; x < 32; x++) {
      const v = 200 + Math.random() * 55;
      g.fillStyle = `rgba(${v},${v + 5 > 255 ? 255 : v + 5},255,${0.55 + Math.random() * 0.4})`;
      g.fillRect(x, y, 1, 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    const fall = mesh(new THREE.PlaneGeometry(5, 16), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.2, depthWrite: false }), FALL.x, 8, FALL.z - 3.4, { cast: false });
    updaters.push((t) => (tex.offset.y = t * 1.2));
    fall.renderOrder = 2;
    K.water(FALL.x - 6, FALL.x + 6, FALL.z - 3, FALL.z + 5, 0.05, { color: '#4f8a86' });
    plaque(scene, 'THÁC BẠC', FALL.x + 6, 1.4, FALL.z + 5.4, 2.4, 0.5, 0, { size: 90 });
  }

  // ---------- Bậc đá, nền thiền viện, cổng, chánh điện, gác chuông ----------
  {
    stairs({ ...ST, base: -0.5 });
    terrace(TER.x0, TER.x1, TER.z0, TER.z1, 0, Y, { side: std('#857c6c', { roughness: 1 }) });
    for (const s of [-1, 1]) box(0.3, 0.8, TER.z1 - TER.z0, M.stone, s * (TER.x1 - 0.15), Y + 0.4, (TER.z0 + TER.z1) / 2);
    K.gate3(0, GATE_Z, 'THIỀN VIỆN TÂY THIÊN', { walls: 16, y: Y });
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z);
      b.scale.setScalar(1.55);
      scene.add(b);
      K.lods.push({ obj: b, z });
    });
    for (const s of [-1, 1]) {
      for (let z = 2; z <= 24; z += 7) K.lampPost(s * 7, Y, z);
      K.flagPole(s * 4.5, Y, 25, 7);
    }
    K.forest([[-26, -26], [26, -26], [-26, 24], [-26, -8], [26, -10]].map(([x, z]) => [x, z, Y]));
  }
  const bells = [K.bellPavilion(BELL.x, BELL.z, Y)];

  // ---------- Cáp treo thiền viện — đỉnh núi ----------
  const cw = cableway(K, {
    A: { x: STA.x, y: Y + 5.6, z: STA.z }, B: { x: STB.x, y: S + 5.6, z: STB.z },
    stations: [{ x: STA.x, y: Y, z: STA.z }, { x: STB.x, y: S, z: STB.z }],
    ground: (x, z) => Math.max(0, hillAt(x, z)), towers: [0.25, 0.5, 0.75], sag: 1.8, loopN: 10, loopSec: 200,
  });

  // ---------- Đỉnh núi: sân đá, đền Thượng thờ Quốc Mẫu Tây Thiên, mây ----------
  {
    floor(MT.x - 19, MT.x + 19, MT.z - 19, MT.z + 19, S, 'slab', { tile: 5.5, macro: 0.05 });
    for (const s of [-1, 1]) {
      box(38, 0.8, 0.3, M.stone, MT.x, S + 0.4, MT.z + s * 19);
      box(0.3, 0.8, 38, M.stone, MT.x + s * 19, S + 0.4, MT.z);
    }
    K.hall(DEN, (y, z) => {
      // khám thờ đóng rèm đỏ, ba bài vị, đôi hạc chầu
      const red = std('#b3261b', { roughness: 0.8 });
      box(3.2, 2.6, 1.2, std('#7d2217', { roughness: 0.4 }), 0, y + 1.3, z - 0.3);
      box(3.4, 0.2, 1.4, M.gold, 0, y + 2.7, z - 0.3);
      box(2.6, 2.0, 0.05, red, 0, y + 1.4, z + 0.32);
      for (const x of [-0.9, 0, 0.9]) box(0.5, 0.9, 0.08, M.gold, x, y + 0.45, z + 0.7);
      for (const s of [-1, 1]) {
        cyl(0.06, 0.06, 1.2, M.bronze, s * 2.4, y + 0.6, z + 0.6, {}, 8);
        mesh(new THREE.SphereGeometry(0.22, 10, 8), M.bronze, s * 2.4, y + 1.3, z + 0.6).scale.set(0.8, 1, 1.6);
      }
    }, { twoTier: false, light: 7 });
    for (const [x, z] of [[-12, MT.z + 12], [-12, MT.z - 14], [12, MT.z - 14]]) K.stoneLamp(x, S, z);
    K.forest([[-16, MT.z - 16], [16, MT.z - 16], [-16, MT.z + 4]].map(([x, z]) => [x, z, S]), 0, { scale: 0.8, hue: 0.27 });
    const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
    const clouds = [];
    for (let i = 0; i < 16; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cloudM);
      c.scale.set(12 + K.rr() * 12, 3 + K.rr() * 3, 8 + K.rr() * 8);
      c.userData = { a: (i / 16) * Math.PI * 2, r: 50 + K.rr() * 40, y: 40 + K.rr() * 22, sp: 0.004 + K.rr() * 0.004 };
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
  world.bells = bells;
  world.ride = cw.ride;
  world.gotoHits = cw.gotoHits;
  return world;
}

export const SITE = {
  id: 'taythien',
  name: 'Thiền viện Tây Thiên',
  loading: 'Rừng Tam Đảo đang vào sương',
  hint: 'lên bậc đá vào thiền viện, rồi đi cáp treo lên đền Thượng trên đỉnh núi',
  info: 'Tây Thiên trên núi Tam Đảo: Thiền viện Trúc Lâm Tây Thiên nằm giữa rừng già, cạnh thác Bạc; cáp treo đưa lên đỉnh núi có đền Thượng thờ Quốc Mẫu Tây Thiên giữa mây. (Dựng phỏng theo không khí, không phải bản sao; núi được thu nhỏ cho dễ đi.)',
  tips: [
    ['Đi cáp treo', 'Ga cáp treo ở bên phải sân thiền viện: bấm “Đi cáp treo lên đền Thượng”, bạn ngồi vào cabin bay lên đỉnh khoảng 10 giây (bấm “Tới ga ngay” nếu muốn tới luôn). Trên đỉnh có ga để xuống lại.'],
    ['Thắp nhang', 'Trong thiền viện thì thắp trước bàn thờ chánh điện; trên đỉnh thì trong đền Thượng.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 58, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  unreachable: 'Chỗ đó ở tầng khác — hãy đi cáp treo',
  placeOf: (x, z) => (onTop(x, z) ? 'den' : 'dien'),
  defaultPlace: 'dien',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện thiền viện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    den: { title: 'Thắp nhang trong đền Thượng', text: 'Bạn sẽ bước tới lư hương trước khám thờ Quốc Mẫu Tây Thiên trong đền Thượng trên đỉnh núi, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  GOTOS: [
    { x: STA.x, z: STA.z + 5.6, r: 4.5, ride: 'up', label: 'Đi cáp treo lên đền Thượng', msg: 'Mời bạn vào cabin — cáp treo đưa bạn lên đền Thượng trên đỉnh núi', done: 'Bạn đã lên tới đỉnh núi — đền Thượng ở ngay phía trước', to: { x: STB.x - 5, z: STB.z + 4, ry: Math.atan2(-STB.x, DEN.z0 - STB.z) } },
    { x: STB.x, z: STB.z + 5.6, r: 4.5, ride: 'down', label: 'Đi cáp treo về thiền viện', msg: 'Mời bạn vào cabin — cáp treo đưa bạn về thiền viện', done: 'Bạn đã về tới thiền viện', to: { x: STA.x - 4, z: STA.z + 6, ry: Math.PI } },
  ],
  PLACES: [
    { id: 'chan', name: 'Chân núi', x: 0, z: 58, ry: Math.PI },
    { id: 'thac', name: 'Thác Bạc', x: FALL.x + 4, z: 48, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'ga', name: 'Ga cáp treo', x: STA.x - 4, z: STA.z + 6, ry: Math.PI },
    { id: 'den', name: 'Đền Thượng', x: 0, z: DEN.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-60, -222, 120, 290],
    font: 6.5,
    shapes: [
      { x: MT.x, z: MT.z, r: 150, c: 'm-tree' },
      { x: MT.x, z: MT.z, r: 50, c: 'm-rock' },
      { x0: -19, x1: 19, z0: MT.z - 19, z1: MT.z + 19, c: 'm-stone' },
      { x0: -DEN.hx, x1: DEN.hx, z0: DEN.z1, z1: DEN.z0, c: 'm-hall' },
      { x0: -54, x1: 54, z0: ST.zBottom, z1: 66, c: 'm-stone' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: TER.z1, c: 'm-terrace' },
      { x0: ST.x0, x1: ST.x1, z0: ST.zTop, z1: ST.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: STA.x - 3, x1: STA.x + 3, z0: STA.z - 3, z1: STA.z + 3, c: 'm-hall' },
      { x: FALL.x, z: FALL.z, r: 6, c: 'm-water' },
    ],
    labels: [['chan', 0, 58, 'Chân núi'], ['thac', FALL.x, FALL.z + 12, 'Thác Bạc'], ['dien', 0, -13, 'Chánh điện'], ['ga', STA.x, STA.z + 9, 'Cáp treo'], ['den', 0, MT.z - 24, 'Đền Thượng']],
  },
  OV: { bounds: { x0: -60, x1: 60, z0: -220, z1: 64 }, dist: 200, y: 15 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: DEN.z1 + 6.5, spread: 3, act: 'bow' },
    { x: 0, z: 0, act: 'bell' },
    { x: -10, z: MT.z + 14, spread: 5, ry: 0, say: 'Mây bay ngang luôn' },
    { x: -40, z: 49, spread: 4, ry: Math.PI, say: 'Thác nước mát quá' },
    { x: 0, z: 20, spread: 14, ry: 0 },
  ],
  BOT_SPAWN: [[-20, 20, 50, 60], [-20, 20, 0, 24], [-14, 14, MT.z + 4, MT.z + 16]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Rừng Tam Đảo mát ghê', 'Thiền viện yên tĩnh thật', 'Đi cáp treo lên đền Thượng thôi', 'Tiếng chuông vang cả núi'],
  build,
};
