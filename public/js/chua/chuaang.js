// Chùa Âng (Angkorajaborey, Trà Vinh): chùa Khmer Nam Tông cổ trên gò đất cao cạnh ao Bà Om. Cổng có rắn thần Naga, sân rộng
// rợp bóng cây sao dầu cổ thụ; chánh điện mái nhiều lớp dốc đứng màu cam, đầu hồi vàng, chung quanh là các tháp cốt;
// bên phải là ao vuông với hàng cây cổ thụ soi bóng. (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 50;
const YARD = { x0: -38, x1: 38, z0: -34, z1: 47 };
const HALL = { x: 0, z0: 2, z1: -18, hx: 9, y: 0, wallH: 5.2 };
const POND = { x0: 12, x1: 32, z0: 10, z1: 32 }; // ao
const STUPAS = [[-22, -4, 1], [-22, -24, 1], [22, -24, 1], [22, -4, 1], [0, -28, 1.5]];
const TREES = [[-30, 36], [-32, 14], [-30, -8], [-28, -28], [-12, 36], [12, -30], [34, -14], [36, 38], [-8, -30]];
const CENTER = { x: 0, z: 14 };

const WALK_AREAS = [
  rect(-48, 48, GATE_Z + 4.2, 64),
  ...gateWalk(0, GATE_Z),
  rect(YARD.x0 + 1, YARD.x1 - 1, POND.z1 + 1.2, GATE_Z - 4.4), // dải trước ao
  rect(YARD.x0 + 1, POND.x0 - 1.4, HALL.z0 + 0.6, POND.z1 + 1.6), // bên trái ao
  rect(POND.x1 + 1.4, YARD.x1 - 1, HALL.z0 + 0.6, POND.z1 + 1.6), // bên phải ao
  rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, POND.z0 - 1.4), // giữa ao và chánh điện
  rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
  rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  ...STUPAS.map(([x, z, s]) => ({ x, z, r: 2.4 * s + 0.6 })),
  ...TREES.map(([x, z]) => ({ x, z, r: 1.3 })),
  { x: CENTER.x, z: CENTER.z, r: 1.1 },
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 4.0 }, merit: { x: HALL.hx - 2.8, z: HALL.z1 + 3.8 }, face: { x: 0, y: 4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6fa9d6', skyBottom: '#efe6cf', fogColor: 0xe8e2cf });
  const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
  const orange = std('#d9772b', { roughness: 0.55 });
  const tileM = std('#c9622a', { roughness: 0.6 });
  const trim = std('#2f7a5c', { roughness: 0.45 });
  const gold = M.gold;
  const wallY = std('#efc65a', { roughness: 0.75 });
  const cream = std('#f3ead2', { roughness: 0.8 });
  const gableM = std('#9a2f1c', { roughness: 0.5 });

  // mái Khmer nhiều lớp (cùng cách dựng với chùa Dơi)
  function gable(parent, x, y, z, W, L, H) {
    const sh = new THREE.Shape();
    sh.moveTo(-W / 2, 0);
    sh.lineTo(W / 2, 0);
    sh.lineTo(0, H);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false });
    geo.translate(0, 0, -L / 2);
    const m = new THREE.Mesh(geo, [gableM, tileM]);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    const slope = Math.hypot(W / 2, H), ang = Math.atan2(H, W / 2);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, L + 0.1), trim);
      e.position.set(x + s * W / 2, y + 0.05, z);
      parent.add(e);
      for (const zz of [z + L / 2 + 0.06, z - L / 2 - 0.06]) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(slope, 0.26, 0.14), gold);
        f.position.set(x + (s * W) / 4, y + H / 2, zz);
        f.rotation.z = -s * ang;
        parent.add(f);
        const p0 = new THREE.Vector3(x + s * W / 2, y, zz);
        const curve = new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(s * 0.35, 0.15, 0)), p0.clone().add(new THREE.Vector3(s * 0.55, 0.65, 0)), p0.clone().add(new THREE.Vector3(s * 0.35, 1.0, 0))]);
        parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.08, 6), gold));
      }
    }
    for (const zz of [z + L / 2 + 0.06, z - L / 2 - 0.06]) {
      const p0 = new THREE.Vector3(x, y + H, zz), dz = Math.sign(zz - z);
      const curve = new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(0, 0.6, dz * 0.25)), p0.clone().add(new THREE.Vector3(0, 1.5, dz * 0.1)), p0.clone().add(new THREE.Vector3(0, 2.1, -dz * 0.35))]);
      parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.12, 6), gold));
      const sun = new THREE.Mesh(new THREE.CircleGeometry(Math.min(W, H) * 0.16, 20), gold);
      sun.position.set(x, y + H * 0.38, zz + dz * 0.02);
      if (dz < 0) sun.rotation.y = Math.PI;
      parent.add(sun);
    }
  }
  function khmerRoof(parent, x, y, z, W, L, tiers = 3, { spire = true, pitch = 0.5 } = {}) {
    let top = y;
    for (let i = 0; i < tiers; i++) {
      const w = W * (1 - 0.22 * i), l = L * (1 - 0.14 * i), h = w * pitch, yy = y + i * W * 0.13;
      gable(parent, x, yy, z, w, l, h);
      top = Math.max(top, yy + h);
    }
    if (spire) {
      const yy = top - 0.4;
      for (let k = 0; k < 5; k++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32 - k * 0.05, 0.42 - k * 0.05, 0.4, 10), gold);
        c.position.set(x, yy + k * 0.4, z);
        parent.add(c);
      }
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 2.2, 8), gold);
      tip.position.set(x, yy + 3.1, z);
      parent.add(tip);
      top = yy + 4.2;
    }
    return top;
  }
  function stupa(x, z, s = 1) {
    const g = group(x, 0, z);
    g.scale.setScalar(s);
    let y = 0;
    for (const [w, h] of [[4.4, 0.5], [3.6, 0.6], [3.0, 1.6], [3.4, 0.3], [2.6, 0.6]]) {
      box(w, h, w, cream, 0, y + h / 2, 0, { parent: g });
      y += h;
    }
    const bellProf = [[0, 0], [1.1, 0], [1.25, 0.4], [1.1, 1.3], [0.75, 2.0], [0.4, 2.3], [0, 2.4]].map(([a, b]) => new THREE.Vector2(a, b));
    mesh(new THREE.LatheGeometry(bellProf, 20), cream, 0, y, 0, { parent: g });
    y += 2.3;
    for (let k = 0; k < 6; k++) cyl(0.36 - k * 0.05, 0.4 - k * 0.05, 0.32, gold, 0, y + 0.16 + k * 0.32, 0, { parent: g }, 10);
    mesh(new THREE.ConeGeometry(0.12, 2.6, 8), gold, 0, y + 3.2, 0, { parent: g });
  }

  // ---------- Đất, ruộng, ao Bà Om ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -20, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-52, 52, -38, 64, 0, 'grass', { tile: 5, macro: 0.3, tint: '#dfe6c4' });
    floor(-44, 44, GATE_Z + 3, 62, 0, 'dirt', { tile: 4, macro: 0.1, tint: '#e6d6b8' });
    floor(-3.2, 3.2, HALL.z0, GATE_Z + 3, 0.02, 'brick', { tile: 2.4, macro: 0.05 });
    const P = POND;
    for (const z of [P.z0 - 0.3, P.z1 + 0.3]) box(P.x1 - P.x0 + 1.1, 0.5, 0.5, M.stone, (P.x0 + P.x1) / 2, 0.25, z);
    for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.5, P.z1 - P.z0 + 1.1, M.stone, x, 0.25, (P.z0 + P.z1) / 2);
    K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: '#5b7f5a' });
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (let i = 0; i < 18; i++) {
      const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
      mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
      if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
    }
    const paddy = std('#8fb35a', { roughness: 0.95 });
    for (const [x, z, w, d] of [[-120, 40, 120, 100], [120, 30, 120, 110], [0, 140, 260, 60], [-110, -100, 120, 90], [110, -100, 120, 90]]) {
      const p = mesh(new THREE.PlaneGeometry(w, d), paddy, x, 0.008, z, { cast: false });
      p.rotation.x = -Math.PI / 2;
    }
    K.palms([...Array.from({ length: 9 }, (_, i) => [-36 + i * 9, 62]), [-44, 30], [44, 30]]);
  }

  // ---------- Cổng Khmer có Naga, tường ----------
  {
    const g = group(0, 0, GATE_Z);
    for (const s of [-1, 1]) {
      box(1.4, 5.4, 1.4, cream, s * 3.4, 2.7, 0, { parent: g });
      box(1.7, 0.3, 1.7, gold, s * 3.4, 5.5, 0, { parent: g });
      box(40, 1.8, 0.5, wallY, s * 23.5, 0.9, 0, { parent: g });
      box(40.2, 0.2, 0.8, orange, s * 23.5, 1.9, 0, { parent: g });
    }
    box(8.2, 1.2, 1.6, cream, 0, 6.2, 0, { parent: g });
    khmerRoof(g, 0, 6.8, 0, 7.4, 2.6, 3);
    plaque(g, 'CHÙA ÂNG', 0, 6.2, 0.86, 3.6, 0.7, 0, { size: 110 });
    for (const s of [-1, 1]) {
      const body = new THREE.CatmullRomCurve3([[s * 4.8, 0.3, 7], [s * 4.8, 0.5, 4], [s * 4.8, 0.7, 2], [s * 4.8, 1.6, 1.2]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
      mesh(new THREE.TubeGeometry(body, 20, 0.22, 8), trim, 0, 0, 0, { parent: g });
      for (let k = -3; k <= 3; k++) {
        const a = (k / 3) * 0.9;
        mesh(new THREE.SphereGeometry(0.2, 8, 6), gold, s * 4.8 + Math.sin(a) * 0.55, 1.75 + Math.cos(a) * 0.55, 1.15, { parent: g });
      }
      mesh(new THREE.SphereGeometry(0.75, 12, 8), trim, s * 4.8, 1.75, 1.05, { parent: g }).scale.set(1, 1, 0.3);
    }
    for (const s of [-1, 1]) {
      box(0.5, 1.8, GATE_Z - YARD.z0, wallY, s * 43.5, 0.9, (GATE_Z + YARD.z0) / 2);
      box(0.8, 0.2, GATE_Z - YARD.z0 + 0.2, orange, s * 43.5, 1.9, (GATE_Z + YARD.z0) / 2);
    }
    box(87, 1.8, 0.5, wallY, 0, 0.9, YARD.z0 - 0.3);
    K.roofs.push({ minX: -5, maxX: 5, minZ: GATE_Z - 2, maxZ: GATE_Z + 2, lift: 14 });
  }

  // ---------- Chánh điện Khmer, tháp cốt, lư hương, cây sao cổ thụ ----------
  K.hall(HALL, (y, z) => {
    box(5.2, 1.4, 2.4, gold, 0, y + 0.7, z - 0.2);
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y + 1.4, z - 0.2);
    b.scale.setScalar(1.55);
    scene.add(b);
    lods.push({ obj: b, z });
  }, {
    wallMat: wallY, colMat: cream, carpet: '#a3461c', light: 9,
    roof: ({ x, y, cz, hx, d }) => {
      const top = khmerRoof(scene, x, y, cz, hx * 2 + 1.6, d + 3, 3);
      for (const s of [-1, 1]) {
        const eave = box(2.6, 0.18, d + 2.4, tileM, x + s * (hx + 0.9), y - 0.55, cz);
        eave.rotation.z = s * -0.42;
      }
      plaque(scene, 'CHÁNH ĐIỆN', x, y - 1.0, HALL.z0 + 0.06, 3.6, 0.7);
      return { yTop: top, rx: 1 };
    },
  });
  for (const [x, z, s] of STUPAS) stupa(x, z, s);
  {
    cyl(0.9, 1.1, 1.0, cream, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) K.flagPole(s * 6, 0, 10, 8);
    // cây sao dầu cổ thụ: thân cao, tán rộng
    const N = TREES.length;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 0.75, 1, 9).translate(0, 0.5, 0), std('#6b5a48', { roughness: 0.95 }), N);
    const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std('#ffffff', { roughness: 0.9, flatShading: true }), N * 4);
    const o = new THREE.Object3D(), c = new THREE.Color();
    TREES.forEach(([x, z], i) => {
      const h = 11 + K.rr() * 5;
      o.position.set(x, 0, z);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, h, 1);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + K.rr(), r = k === 0 ? 0 : 2.6;
        const s = k === 0 ? 4.2 : 3.2;
        o.position.set(x + Math.cos(a) * r, h + (k === 0 ? 2.2 : 0.6), z + Math.sin(a) * r);
        o.scale.set(s, s * 0.62, s);
        o.updateMatrix();
        crown.setMatrixAt(i * 4 + k, o.matrix);
        crown.setColorAt(i * 4 + k, c.setHSL(0.24 + K.rr() * 0.06, 0.4, 0.22 + K.rr() * 0.08));
      }
    });
    trunk.castShadow = crown.castShadow = true;
    crown.receiveShadow = true;
    scene.add(trunk, crown);
    K.forest(K.scatter(-170, 170, -160, -44, 90), 0, { scale: 1.1 });
  }

  return K.finish({ rituals: RITUALS });
}

export const SITE = {
  id: 'ang',
  mapId: 'ang',
  name: 'Chùa Âng',
  loading: 'Cây sao cổ thụ đang soi bóng xuống ao',
  hint: 'qua cổng Naga vào sân rợp bóng cây, ngắm ao Bà Om và chánh điện mái cam',
  info: 'Chùa Âng ở Trà Vinh là ngôi chùa Khmer Nam Tông cổ trên gò đất cao cạnh ao Bà Om. Cổng có rắn thần Naga, sân rộng rợp bóng cây sao dầu cổ thụ; chánh điện mái nhiều lớp dốc đứng màu cam, đầu hồi vàng, chung quanh là các tháp cốt; bên phải là ao vuông soi bóng hàng cây cổ thụ. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thắp nhang', 'Trong chánh điện thì thắp trước tượng Phật; ngoài sân thì ở lư hương trước điện.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 58, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Chùa Khmer Nam Tông thờ duy nhất Đức Phật Thích Ca.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang trước chánh điện', text: 'Bạn sẽ bước tới lư hương đá giữa sân trước chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: '' },
  },
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 58, ry: Math.PI },
    { id: 'ao', name: 'Ao Bà Om', x: POND.x0 - 3, z: POND.z1 + 4, ry: -Math.PI * 0.75 },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 2.4, ry: Math.PI },
    { id: 'thap', name: 'Tháp cốt', x: -22, z: -1, ry: Math.PI },
  ],
  MAP: {
    box: [-48, -38, 96, 110],
    font: 4.4,
    shapes: [
      { x0: -48, x1: 48, z0: -38, z1: 64, c: 'm-grass' },
      { x0: -44, x1: 44, z0: GATE_Z + 3, z1: 62, c: 'm-stone' },
      { x0: -3.2, x1: 3.2, z0: HALL.z0, z1: GATE_Z, c: 'm-porch' },
      { x0: POND.x0, x1: POND.x1, z0: POND.z0, z1: POND.z1, c: 'm-water' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-field' },
      { x0: -5, x1: 5, z0: GATE_Z - 1, z1: GATE_Z + 1, c: 'm-field' },
      ...STUPAS.map(([x, z, s]) => ({ x, z, r: 2.2 * s, c: 'm-white' })),
      ...TREES.map(([x, z]) => ({ x, z, r: 3.2, c: 'm-tree' })),
    ],
    labels: [['gate', 0, 58, 'Cổng chùa'], ['ao', POND.x0 + 10, POND.z1 + 6, 'Ao Bà Om'], ['dien', 0, -8, 'Chánh điện'], ['thap', -22, -8, 'Tháp cốt']],
  },
  OV: { bounds: { x0: -48, x1: 48, z0: -34, z1: 62 }, dist: 100 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    { x: POND.x0 - 3, z: POND.z1 + 4, spread: 2, ry: -Math.PI * 0.75, say: 'Ao Bà Om yên bình quá' },
    { x: -22, z: -1, spread: 1.5, ry: Math.PI },
    { x: 0, z: 56, spread: 20, ry: Math.PI },
  ],
  BOT_SPAWN: [[-30, 30, 34, 46], [-30, 30, 4, 8]],
  BOT_SAYS: ['Nam mô Bụt', 'Cây sao cổ thụ to quá', 'Mái chùa đẹp ghê', 'Ao Bà Om mát quá', 'Chùa Khmer lạ mắt thật'],
  build,
};
