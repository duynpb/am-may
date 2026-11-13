// Chùa Linh Phước (Đà Lạt): ngôi chùa nổi tiếng với những tác phẩm khảm sành sứ rực rỡ. Qua cổng khảm sứ là sân vườn hoa đủ màu,
// bên trái là tháp chuông bảy tầng, bên phải là con rồng khảm sành uốn lượn dài, giữa sân là chánh điện vàng – đỏ; phía sau là
// đồi thông. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill, curvedRoof } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 44;
const YARD = { x0: -30, x1: 30, z0: -38, z1: 41 };
const HALL = { x: 0, z0: -2, z1: -24, hx: 12, y: 0, plaque: 'LINH PHƯỚC TỰ', wallH: 6.4 };
const TOWER = { x: -22, z: 16, half: 3.2, tiers: 7 };
const CENTER = { x: 0, z: 22 };

const WALK_AREAS = [
  rect(-46, 46, GATE_Z + 4.2, 60),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4),
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, GATE_Z - 4.4),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 2.2 },
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}
let hillAt = () => -1;

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#86b8de', skyBottom: '#e8ece6', fog: [150, 650], fogColor: 0xdfe6e2 });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const yellow = std('#f2c14e', { roughness: 0.7 });
  const redC = std('#c0392b', { roughness: 0.5 });
  const mosaic = [std('#e63946'), std('#f4a261'), std('#2a9d8f'), std('#e9c46a'), std('#457b9d'), std('#ffffff'), std('#8ecae6')];

  // ---------- Đất, đồi thông ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-50, 50, GATE_Z + 3, 62, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
    floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
    const hy = makeHill(K, 0, -130, [[0, 30], [34, 28], [70, 12], [105, 3], [140, -1]], { color: '#5a7442', clip: { x0: -48, x1: 48, z0: -42, z1: 64, floor: groundY } });
    hillAt = hy;
    K.pines([...K.scatter(-150, 150, -190, -60, 90), ...K.scatter(-110, -36, -60, 40, 30), ...K.scatter(36, 110, -60, 40, 30)].map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.2]));
  }

  // ---------- Cổng khảm sành sứ ----------
  K.gate3(0, GATE_Z, 'LINH PHƯỚC TỰ', { walls: 12, wall: yellow, col: redC });
  for (const s of [-1, 1]) {
    box(0.6, 2.8, GATE_Z - YARD.z0, yellow, s * (YARD.x1 + 0.3), 1.4, (GATE_Z + YARD.z0) / 2);
    K.lion(s * 4.2, 0, GATE_Z + 3.4);
  }
  box(YARD.x1 - YARD.x0, 2.8, 0.6, yellow, 0, 1.4, YARD.z0 - 0.3);
  // mảng khảm màu trên tường rào
  for (let i = 0; i < 90; i++) {
    const s = i % 2 ? 1 : -1, z = YARD.z0 + 2 + K.rr() * (GATE_Z - YARD.z0 - 4);
    box(0.7, 0.35, 0.35, mosaic[i % mosaic.length], s * (YARD.x1 + 0.35), 0.5 + K.rr() * 2, z, { cast: false });
  }

  // ---------- Tháp chuông bảy tầng ----------
  {
    const g = group(TOWER.x, 0, TOWER.z);
    box(TOWER.half * 2 + 2.4, 0.6, TOWER.half * 2 + 2.4, M.stone, 0, 0.3, 0, { parent: g });
    let y = 0.6, half = TOWER.half;
    for (let t = 0; t < TOWER.tiers; t++) {
      const h = t === 0 ? 3.2 : 2.3 - t * 0.06;
      box(half * 2, h, half * 2, t % 2 ? yellow : std('#e7b94a'), 0, y + h / 2, 0, { parent: g });
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        box(0.9, h * 0.55, 0.06, redC, Math.sin(a) * (half + 0.03), y + h * 0.42, Math.cos(a) * (half + 0.03), { parent: g, cast: false }).rotation.y = a;
      }
      y += h;
      curvedRoof(g, 0, y - 0.1, 0, half + 0.9, half + 0.9, 0.7, half * 0.55, { lift: 0.55 });
      y += 0.7;
      half -= 0.24;
    }
    // chuông lớn treo trên tầng chót
    const prof = [[0.05, 0], [0.5, -0.1], [0.7, -0.8], [0.8, -1.7], [0.95, -2.0], [0, -2.0]].map(([a, b]) => new THREE.Vector2(a, b));
    mesh(new THREE.LatheGeometry(prof, 20), std('#5f4a2a', { metalness: 0.8, roughness: 0.38 }), 0, y + 2.2, 0, { parent: g });
    cyl(0.5, 0.8, 0.8, M.gold, 0, y + 2.8, 0, { parent: g }, 8);
    mesh(new THREE.ConeGeometry(0.2, 2.0, 8), M.gold, 0, y + 4.0, 0, { parent: g });
    plaque(g, 'THÁP CHUÔNG', 0, 2.0, TOWER.half + 0.08, 2.2, 0.45, 0, { size: 90 });
    K.roofs.push({ minX: TOWER.x - 5, maxX: TOWER.x + 5, minZ: TOWER.z - 5, maxZ: TOWER.z + 5, lift: 24 });
  }

  // ---------- Con rồng khảm sành sứ uốn dọc bên phải sân ----------
  {
    const path = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      path.push(new THREE.Vector3(20 + Math.sin(t * Math.PI * 4) * 3.2, 1.3 + Math.abs(Math.sin(t * Math.PI * 3)) * 2.6, 36 - t * 48));
    }
    const curve = new THREE.CatmullRomCurve3(path);
    const body = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.85, 10), std('#2e9a63', { roughness: 0.4, metalness: 0.2 }));
    body.castShadow = true;
    scene.add(body);
    // vảy khảm sành: những mảnh nhỏ nhiều màu dọc thân
    const N = 160;
    const scales = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.16, 0.34), std('#ffffff', { roughness: 0.35 }), N);
    const o = new THREE.Object3D(), c = new THREE.Color(), cols = ['#e63946', '#f4a261', '#e9c46a', '#8ecae6', '#ffffff', '#457b9d'];
    for (let i = 0; i < N; i++) {
      const t = i / N, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tg, new THREE.Vector3(0, 1, 0)).normalize();
      const ang = (i * 2.3) % (Math.PI * 2);
      o.position.copy(p).addScaledVector(new THREE.Vector3(0, 1, 0), Math.cos(ang) * 0.9).addScaledVector(side, Math.sin(ang) * 0.9);
      o.lookAt(p);
      o.updateMatrix();
      scales.setMatrixAt(i, o.matrix);
      scales.setColorAt(i, c.set(cols[i % cols.length]));
    }
    scene.add(scales);
    // đầu rồng ở phía trước sân: hàm, sừng, râu
    const head = curve.getPointAt(0.0), hg = group(head.x, head.y, head.z, Math.PI, { merge: false });
    const green = std('#2e9a63', { roughness: 0.4 });
    mesh(new THREE.SphereGeometry(1.3, 14, 10), green, 0, 0.3, 0, { parent: hg }).scale.set(1, 0.9, 1.4);
    mesh(new THREE.BoxGeometry(0.9, 0.3, 1.5), green, 0, -0.4, 1.4, { parent: hg });
    for (const s of [-1, 1]) {
      mesh(new THREE.ConeGeometry(0.16, 1.4, 6), M.gold, s * 0.6, 1.5, 0.2, { parent: hg }).rotation.z = s * -0.4;
      mesh(new THREE.SphereGeometry(0.2, 8, 6), std('#ffe14d', { emissive: '#ffb000', emissiveIntensity: 0.4 }), s * 0.65, 0.6, 1.1, { parent: hg });
      const wh = new THREE.CatmullRomCurve3([[s * 0.4, -0.3, 1.9], [s * 1.2, -0.8, 2.6], [s * 1.9, -0.4, 3.4]].map(([a, b, d]) => new THREE.Vector3(a, b, d)));
      mesh(new THREE.TubeGeometry(wh, 10, 0.07, 5), M.gold, 0, 0, 0, { parent: hg });
    }
    plaque(scene, 'RỒNG KHẢM SÀNH SỨ', 25, 1.0, 38.2, 3.4, 0.5, 0, { size: 80 });
  }

  // ---------- Vườn hoa Đà Lạt, lư hương, đèn, chánh điện ----------
  {
    const beds = [];
    for (let z = 36; z >= 0; z -= 1.5) beds.push([-5, z], [5, z], [-11, z], [11, z]);
    K.flowers(beds.filter(([x, z]) => Math.hypot(x - CENTER.x, z - CENTER.z) > 3));
    for (const x of [-5, 5, -11, 11]) box(1.3, 0.3, 36, M.stone, x, 0.15, 18);
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) K.flagPole(s * 7.5, 0, 38, 8);
  }
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z - 0.2);
    b.scale.setScalar(1.65);
    scene.add(b);
    lods.push({ obj: b, z });
  }, { wallMat: yellow, colMat: redC, light: 10 });

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'linhphuoc',
  mapId: 'linhphuoc',
  name: 'Chùa Linh Phước',
  loading: 'Hoa Đà Lạt đang nở khắp sân chùa',
  hint: 'dạo vườn hoa, ngắm con rồng khảm sành sứ và tháp chuông, vào chánh điện vàng – đỏ',
  info: 'Chùa Linh Phước ở Đà Lạt nổi tiếng với những tác phẩm khảm sành sứ rực rỡ. Qua cổng khảm sứ là sân vườn hoa đủ màu; bên trái là tháp chuông bảy tầng, bên phải là con rồng khảm sành uốn lượn dài, giữa sân là chánh điện vàng – đỏ; phía sau là đồi thông. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Rồng khảm sành', 'Đi dọc bên phải sân để thấy thân rồng uốn lượn, phủ những mảnh sành sứ nhiều màu; bạn có thể đi luồn dưới các khúc rồng.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa vườn hoa.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 54, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa vườn hoa', text: 'Bạn sẽ bước tới lư hương đá giữa vườn hoa trước chánh điện, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng khảm sứ', x: 0, z: 54, ry: Math.PI },
    { id: 'hoa', name: 'Vườn hoa', x: 0, z: 30, ry: Math.PI },
    { id: 'rong', name: 'Con rồng khảm sành', x: 27, z: 30, ry: Math.PI },
    { id: 'thap', name: 'Tháp chuông', x: TOWER.x, z: TOWER.z + TOWER.half + 5.5, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ],
  MAP: {
    box: [-34, -42, 68, 108],
    font: 3.8,
    shapes: [
      { x0: -50, x1: 50, z0: GATE_Z + 3, z1: 62, c: 'm-stone' },
      { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -12, x1: 12, z0: 0, z1: 36, c: 'm-veg' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x: TOWER.x, z: TOWER.z, r: TOWER.half, c: 'm-tower' },
      { x0: 17, x1: 24, z0: -12, z1: 36, c: 'm-tree' },
    ],
    labels: [['gate', 0, 54, 'Cổng khảm sứ'], ['hoa', 0, 8, 'Vườn hoa'], ['rong', 22, -16, 'Rồng khảm sành'], ['thap', TOWER.x, TOWER.z - 6, 'Tháp chuông'], ['dien', 0, -13, 'Chánh điện']],
  },
  OV: { bounds: { x0: -34, x1: 34, z0: -40, z1: 62 }, dist: 95 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: 27, z: 30, spread: 2, ry: Math.PI / 2, say: 'Con rồng khảm sành đẹp quá' },
    { x: -8, z: 8, spread: 3, ry: 0, say: 'Hoa Đà Lạt thơm ghê' },
    { x: 0, z: 52, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-24, 24, 28, 40], [-24, 24, -34, -27]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Rồng khảm sành dài quá', 'Đà Lạt mát ghê', 'Hoa nở rực rỡ', 'Tháp chuông cao thiệt'],
  build,
};
