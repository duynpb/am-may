// Chùa Bái Đính (Ninh Bình): quần thể chùa trên sườn núi. Qua cổng tam quan là sân dài giữa hai dãy hành lang
// La Hán (tượng các vị La Hán bằng đá xếp hàng), rồi ba nền đá càng lên càng cao: điện Quan Âm (bên trái có gác chuông
// treo đại hồng chung, bên phải giếng Ngọc), điện Pháp Chủ với tượng Phật rất lớn, trên cùng điện Tam Thế và bảo tháp
// mười ba tầng. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill, curvedRoof } from './base.js';
import { makeBuddha, makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const GATE_Z = 60;
const COR = { x0: 18.6, x1: 24.2, z0: 18, z1: 57.5 }; // hành lang La Hán (mỗi bên, đối xứng qua x = 0)
const T1 = { z0: -26, z1: 6, y: 6, hx: 30 };
const T2 = { z0: -66, z1: -38, y: 14, hx: 30 };
const T3 = { z0: -108, z1: -78, y: 24, hx: 30 };
const ST1 = { x0: -5, x1: 5, zBottom: 18, zTop: T1.z1, y0: 0, y1: T1.y };
const ST2 = { x0: -5, x1: 5, zBottom: T1.z0, zTop: T2.z1, y0: T1.y, y1: T2.y };
const ST3 = { x0: -5, x1: 5, zBottom: T2.z0, zTop: T3.z1, y0: T2.y, y1: T3.y };
const H1 = { x: 0, z0: -6, z1: -20, hx: 11, y: T1.y, plaque: 'ĐIỆN QUAN ÂM', wallH: 6 };
const H2 = { x: 0, z0: -44, z1: -62, hx: 14, y: T2.y, plaque: 'ĐIỆN PHÁP CHỦ', wallH: 7 };
const H3 = { x: 0, z0: -84, z1: -102, hx: 16, y: T3.y, plaque: 'ĐIỆN TAM THẾ', wallH: 7.5 };
const BELL = { x: -20, z: -4 };
const WELL = { x: 20, z: -3, r: 1.8 };
const TOWER = { x: 23.5, z: -97, half: 4.4 };
const CENTER = { x: 0, z: 33 };
const COLS = []; // cột hành lang phía trong
for (let z = COR.z0 + 1; z <= COR.z1 - 1; z += 4) for (const s of [-1, 1]) COLS.push({ x: s * COR.x0, z });

const terrRects = (T, H) => [
  rect(-T.hx + 1, T.hx - 1, H.z0 + 0.6, T.z1 - 0.6),
  rect(-T.hx + 1, -H.hx - 1.2, T.z0 + 0.8, T.z1 - 0.6), rect(H.hx + 1.2, T.hx - 1, T.z0 + 0.8, T.z1 - 0.6),
  rect(-T.hx + 1, T.hx - 1, T.z0 + 0.8, H.z1 - 1.4),
  ...hallWalk(H),
];
const WALK_AREAS = [
  rect(-50, 50, GATE_Z + 4.2, 76), // sân trước cổng
  ...gateWalk(0, GATE_Z),
  rect(-COR.x1 + 1.4, COR.x1 - 1.4, ST1.zBottom - 0.6, GATE_Z - 4.4), // sân giữa và lòng hai dãy hành lang
  rect(ST1.x0 + 0.8, ST1.x1 - 0.8, ST1.zTop - 0.8, ST1.zBottom + 0.6),
  ...terrRects(T1, H1),
  rect(ST2.x0 + 0.8, ST2.x1 - 0.8, ST2.zTop - 0.8, ST2.zBottom + 1.2),
  ...terrRects(T2, H2),
  rect(ST3.x0 + 0.8, ST3.x1 - 0.8, ST3.zTop - 0.8, ST3.zBottom + 1.2),
  ...terrRects(T3, H3),
];
const ROUND_OBSTACLES = [
  ...COLS.map((c) => ({ x: c.x, z: c.z, r: 0.55 })),
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: WELL.x, z: WELL.z, r: WELL.r + 0.5 },
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 1.9 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  ...[['quanam', H1], ['phapchu', H2], ['tamthe', H3]].map(([place, H]) => ({ place, y: H.y + 0.25, burner: { x: 0, z: H.z1 + 3.8 }, merit: { x: H.hx - 2.8, z: H.z1 + 3.6 }, face: { x: 0, y: H.y + 3.4, z: H.z1 + 1.7 } })),
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 8, z: H1.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  for (const S of [ST1, ST2, ST3]) {
    const s = stairY(S, x, z);
    if (s != null) return s;
  }
  for (const [T, H] of [[T3, H3], [T2, H2], [T1, H1]]) if (Math.abs(x) <= T.hx && z >= T.z0 && z <= T.z1) return inHall(H, x, z) ? T.y + 0.25 : T.y;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#7fb0d8', skyBottom: '#e6e4da' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, lods } = K;

  // ---------- Đất, núi đá vôi phía sau ----------
  {
    const land = mesh(new THREE.BoxGeometry(800, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -60, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-54, 54, GATE_Z + 3, 78, 0, 'slab', { tile: 5.5, macro: 0.05 });
    floor(-COR.x1, COR.x1, ST1.zBottom - 1, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -215, [[0, 58], [36, 56], [80, 34], [120, 14], [160, 2], [190, -1]], { clip: { x0: -50, x1: 50, z0: -112, z1: 80, floor: groundY } });
    hillAt = hy;
    K.forest([...K.scatter(-200, 200, -260, -116, 150), ...K.scatter(-140, -36, -110, 70, 50), ...K.scatter(36, 140, -110, 70, 50)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    // vài khối núi đá vôi đặc trưng Ninh Bình
    for (const [x, z, r, h] of [[-120, 40, 22, 60], [130, 20, 26, 70], [-90, 140, 30, 55], [110, 150, 24, 48]]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, h, 9), std('#6f7a5c', { roughness: 1, flatShading: true }));
      m.position.set(x, h / 2 - 1, z);
      scene.add(m);
    }
  }

  // ---------- Cổng tam quan, sân giữa, hai dãy hành lang La Hán ----------
  K.gate3(0, GATE_Z, 'BÁI ĐÍNH TỰ', { walls: 13.5 });
  {
    const tile = std('#7a3a26', { roughness: 0.75 });
    const stoneM = std('#c9c2b2', { roughness: 0.9 });
    const len = COR.z1 - COR.z0, cz = (COR.z0 + COR.z1) / 2;
    for (const s of [-1, 1]) {
      box(0.5, 4.4, len, M.wall, s * COR.x1, 2.2, cz); // tường ngoài
      box(COR.x1 - COR.x0 + 0.6, 0.3, len, M.stone, s * (COR.x0 + COR.x1) / 2, 0.15, cz, { cast: false }); // nền hành lang
      box(0.4, 0.4, len, M.red, s * COR.x0, 4.2, cz); // xà
      const roof = box(8.2, 0.25, len + 0.6, tile, s * ((COR.x0 + COR.x1) / 2 + 0.2), 5.0, cz);
      roof.rotation.z = s * 0.3;
      box(0.35, 0.35, len + 0.6, M.wood, s * (COR.x1 + 0.4), 6.2, cz);
    }
    for (const c of COLS) cyl(0.26, 0.3, 4.2, M.red, c.x, 2.1, c.z, {}, 12);
    // tượng La Hán bằng đá xếp hàng sát tường ngoài, quay vào sân
    const spots = [];
    for (let z = COR.z0 + 1.2; z <= COR.z1 - 1; z += 1.6) for (const s of [-1, 1]) spots.push([s * (COR.x1 - 0.9), z, s]);
    const N = spots.length;
    const base = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), M.stoneD, N);
    const lap = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8).scale(1.2, 0.5, 1.0), stoneM, N);
    const body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.38, 0.8, 10), stoneM, N);
    const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8), stoneM, N);
    const o = new THREE.Object3D();
    spots.forEach(([x, z, s], i) => {
      const set = (m, y, sc = 1) => {
        o.position.set(x, y, z);
        o.rotation.set(0, -s * Math.PI / 2, 0);
        o.scale.setScalar(sc);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      };
      const k = 0.9 + K.rr() * 0.25;
      set(base, 0.55);
      set(lap, 0.95, k);
      set(body, 1.35 * k, k);
      set(head, 1.95 * k, k);
    });
    for (const m of [base, lap, body, head]) {
      m.castShadow = true;
      scene.add(m);
    }
    plaque(scene, 'HÀNH LANG LA HÁN', -COR.x0 + 0.2, 3.4, COR.z1 - 2, 3.6, 0.6, Math.PI / 2, { size: 90 });
    plaque(scene, 'HÀNH LANG LA HÁN', COR.x0 - 0.2, 3.4, COR.z1 - 2, 3.6, 0.6, -Math.PI / 2, { size: 90 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (let z = 24; z <= 52; z += 7) {
      K.lampPost(-8, 0, z);
      K.lampPost(8, 0, z);
    }
    K.flagPole(-5, 0, 54, 8);
    K.flagPole(5, 0, 54, 8);
  }

  // ---------- Ba nền đá và bậc thang ----------
  {
    const side = std('#857c6c', { roughness: 1 });
    for (const T of [T1, T2, T3]) {
      terrace(-T.hx, T.hx, T.z0, T.z1, 0, T.y, { side });
      for (const s of [-1, 1]) box(T.hx - 5.4, 0.8, 0.3, M.stone, s * (T.hx + 5.4) / 2, T.y + 0.4, T.z1 - 0.15);
    }
    for (const S of [ST1, ST2, ST3]) stairs({ ...S, base: -0.5 });
    for (const [T, H] of [[T1, H1], [T2, H2], [T3, H3]]) for (const s of [-1, 1]) K.stoneLamp(s * (H.hx + 4), T.y, T.z1 - 3);
  }

  // ---------- Điện Quan Âm, gác chuông, giếng Ngọc ----------
  K.hall(H1, (y, z) => {
    const qa = K.gild(makeQuanAm({ quality: 'low', color: '#f3c560' }), { color: '#f3c560' });
    qa.position.set(0, y, z);
    qa.scale.setScalar(1.25);
    scene.add(qa);
    lods.push({ obj: qa, z });
  });
  const bells = [K.bellPavilion(BELL.x, BELL.z, T1.y, { label: 'ĐẠI HỒNG CHUNG' })];
  {
    cyl(WELL.r, WELL.r + 0.2, 0.9, M.stone, WELL.x, T1.y + 0.45, WELL.z, {}, 24);
    const w = mesh(new THREE.CircleGeometry(WELL.r - 0.25, 24).rotateX(-Math.PI / 2), std('#2f5f63', { roughness: 0.1, metalness: 0.3 }), WELL.x, T1.y + 0.7, WELL.z, { cast: false });
    w.receiveShadow = true;
    plaque(scene, 'GIẾNG NGỌC', WELL.x, T1.y + 1.5, WELL.z + WELL.r + 0.3, 2.0, 0.45, 0, { size: 80 });
  }

  // ---------- Điện Pháp Chủ: tượng Phật Thích Ca rất lớn ----------
  K.hall(H2, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(2.2);
    scene.add(b);
    lods.push({ obj: b, z, r: 90 });
  }, { light: 12 });

  // ---------- Điện Tam Thế: ba đức Phật ----------
  K.hall(H3, (y, z) => {
    const mid = makeThichCa(); // Phật hiện tại Thích Ca, cùng mẫu tượng chánh điện Am Mây
    mid.position.set(0, y, z);
    mid.scale.setScalar(1.5);
    scene.add(mid);
    lods.push({ obj: mid, z, r: 90 });
    const side = makeBuddha({ quality: 'low' });
    for (const x of [-6.5, 6.5]) {
      const b = x < 0 ? side : side.clone();
      b.position.set(x, y, z + 0.3);
      b.scale.setScalar(1.3);
      b.traverse((m) => (m.castShadow = false));
      scene.add(b);
      lods.push({ obj: b, x, z, r: 90 });
    }
  }, { light: 12 });

  // ---------- Bảo tháp mười ba tầng ----------
  {
    const g = group(TOWER.x, T3.y, TOWER.z);
    box(TOWER.half * 2 + 3, 0.6, TOWER.half * 2 + 3, M.stone, 0, 0.3, 0, { parent: g });
    const wallT = std('#e9dfc8', { roughness: 0.85 });
    let y = 0.6, half = TOWER.half;
    for (let t = 0; t < 13; t++) {
      const h = t === 0 ? 4.2 : 2.6 - t * 0.06;
      box(half * 2, h, half * 2, wallT, 0, y + h / 2, 0, { parent: g });
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        const d = box(0.9, h * 0.55, 0.06, std('#3a2418'), Math.sin(a) * (half + 0.03), y + h * 0.42, Math.cos(a) * (half + 0.03), { parent: g, cast: false });
        d.rotation.y = a;
      }
      y += h;
      curvedRoof(g, 0, y - 0.1, 0, half + 0.9, half + 0.9, 0.8, half * 0.55, { lift: 0.6 });
      y += 0.8;
      half -= 0.22;
    }
    cyl(0.5, 0.8, 1.0, M.gold, 0, y + 0.3, 0, { parent: g }, 12);
    mesh(new THREE.ConeGeometry(0.2, 3.0, 8), M.gold, 0, y + 2.2, 0, { parent: g });
    plaque(g, 'BẢO THÁP', 0, 3.4, TOWER.half + 0.08, 2.6, 0.55, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 6, maxX: TOWER.x + 6, minZ: TOWER.z - 6, maxZ: TOWER.z + 6, lift: 48 });
  }
  K.forest([[-26, -70], [26, -72], [-26, -104], [-12, -106], [26, -30], [-27, -30]].map(([x, z]) => [x, z, groundY(x, z)]));

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

const H_INFO = (name, text) => ({ title: `Thắp nhang trong ${name}`, text, done: '' });
export const SITE = {
  id: 'baidinh',
  name: 'Chùa Bái Đính',
  loading: 'Đang mở cổng tam quan Bái Đính',
  hint: 'qua sân giữa hai dãy hành lang La Hán, lên ba nền đá tới điện Quan Âm, Pháp Chủ, Tam Thế',
  info: 'Chùa Bái Đính ở Ninh Bình là quần thể chùa trên sườn núi. Qua cổng tam quan là sân dài giữa hai dãy hành lang có tượng các vị La Hán bằng đá; lên bậc thang là điện Quan Âm với gác chuông treo đại hồng chung và giếng Ngọc, điện Pháp Chủ có tượng Phật rất lớn, trên cùng là điện Tam Thế và bảo tháp mười ba tầng. (Dựng phỏng theo không khí chùa, không phải bản sao; thu nhỏ cho dễ đi.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào đại hồng chung ở gác chuông bên trái điện Quan Âm để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong mỗi điện thì thắp trước bàn thờ điện đó; ở sân giữa hành lang thì ở lư hương đá giữa sân.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 70, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf(x, z) {
    if (z < T3.z1 + 0.5) return 'tamthe';
    if (z < T2.z1 + 0.5) return 'phapchu';
    if (z < T1.z1 + 0.5) return 'quanam';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO: {
    quanam: { title: 'Thắp nhang trong điện Quan Âm', text: 'Bạn sẽ bước tới lư hương trước tượng Quan Âm Bồ Tát trong điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Quan Âm Bồ Tát' },
    phapchu: { title: 'Thắp nhang trong điện Pháp Chủ', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca rất lớn trong điện Pháp Chủ, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
    tamthe: { title: 'Thắp nhang dâng Tam Thế Phật', text: 'Bạn sẽ bước tới lư hương giữa điện Tam Thế, chắp tay vái lạy ba đức Phật rồi cắm nhang.', done: ' dâng Tam Thế Phật' },
    san: { title: 'Thắp nhang giữa sân hành lang', text: 'Bạn sẽ bước tới lư hương đá giữa sân, giữa hai dãy hành lang La Hán, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 70, ry: Math.PI },
    { id: 'lahan', name: 'Hành lang La Hán', x: -21, z: 40, ry: Math.PI },
    { id: 'quanam', name: 'Điện Quan Âm', x: 0, z: H1.z0 + 3, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'phapchu', name: 'Điện Pháp Chủ', x: 0, z: H2.z0 + 3, ry: Math.PI },
    { id: 'tamthe', name: 'Điện Tam Thế', x: 0, z: H3.z0 + 3, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp', x: TOWER.x - 2, z: -84, ry: Math.PI },
  ],
  MAP: {
    box: [-52, -112, 104, 192],
    font: 5,
    shapes: [
      { x0: -54, x1: 54, z0: GATE_Z + 3, z1: 78, c: 'm-stone' },
      { x0: -COR.x1, x1: COR.x1, z0: ST1.zBottom, z1: GATE_Z, c: 'm-porch' },
      { x0: -COR.x1, x1: -COR.x0, z0: COR.z0, z1: COR.z1, c: 'm-corridor' },
      { x0: COR.x0, x1: COR.x1, z0: COR.z0, z1: COR.z1, c: 'm-corridor' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      ...[T1, T2, T3].map((T) => ({ x0: -T.hx, x1: T.hx, z0: T.z0, z1: T.z1, c: 'm-terrace' })),
      ...[ST1, ST2, ST3].map((S) => ({ x0: S.x0, x1: S.x1, z0: S.zTop, z1: S.zBottom, c: 'm-stairs' })),
      ...[H1, H2, H3].map((H) => ({ x0: -H.hx, x1: H.hx, z0: H.z1, z1: H.z0, c: 'm-hall' })),
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x: WELL.x, z: WELL.z, r: WELL.r, c: 'm-water' },
      { x0: TOWER.x - TOWER.half, x1: TOWER.x + TOWER.half, z0: TOWER.z - TOWER.half, z1: TOWER.z + TOWER.half, c: 'm-tower' },
    ],
    labels: [['gate', 0, 70, 'Cổng tam quan'], ['lahan', 0, 40, 'Hành lang La Hán'], ['quanam', 0, -13, 'Điện Quan Âm'], ['chuong', BELL.x, BELL.z - 5, 'Gác chuông'], ['phapchu', 0, -53, 'Điện Pháp Chủ'], ['tamthe', 0, -93, 'Điện Tam Thế'], ['thap', TOWER.x, TOWER.z + 9, 'Bảo tháp']],
  },
  OV: { bounds: { x0: -52, x1: 52, z0: -110, z1: 76 }, dist: 150, y: 8 },
  TRIPS: [
    { x: 0, z: H1.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Quan Âm' },
    { x: 0, z: H2.z1 + 6.5, spread: 4, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: H3.z1 + 6.5, spread: 4, act: 'bow' },
    { x: 0, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 0, act: 'bell' },
    { x: -21, z: 36, spread: 1, ry: -Math.PI / 2, say: 'Tượng La Hán nhiều quá' },
    { x: 21, z: 44, spread: 1, ry: Math.PI / 2 },
    { x: -12, z: -90, spread: 4, ry: 0, say: 'Đứng trên cao nhìn xa quá' },
  ],
  BOT_SPAWN: [[-14, 14, 22, 54], [-20, 20, 0, 5], [-20, 20, -42, -39]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Chùa rộng quá', 'Hành lang La Hán dài ghê', 'Tượng Phật Pháp Chủ to quá', 'Leo bậc thang mỏi chân'],
  build,
};
