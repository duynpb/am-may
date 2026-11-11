// Chùa Dơi (Sóc Trăng): chùa Khmer Nam Tông giữa vườn cây sao, dầu cổ thụ, hàng nghìn con dơi treo mình trên cành,
// chiều tối bay ra kiếm ăn. Cổng mái nhọn có rắn thần Naga, chánh điện trên nền cao, mái nhiều lớp dốc đứng màu cam,
// đầu đao vàng cong vút (chovea), quanh điện là các tháp cốt nhọn, ao sen bên trái, nhà sala bên phải.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, stairY, hallWalk, inHall } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 44;
const BASE = { x0: -12, x1: 12, z0: -37, z1: -6, y: 1.6 }; // nền cao chánh điện
const STAIR = { x0: -3.6, x1: 3.6, zBottom: -0.8, zTop: -6, y0: 0, y1: BASE.y };
const HALL = { x: 0, z0: -9.5, z1: -33, hx: 8.4, y: BASE.y, wallH: 6.4 };
const POND = { x0: -37, x1: -19, z0: 8, z1: 28 };
const SALA = { x0: 21, x1: 35, z0: 8, z1: 22 };
const STUPAS = [
  { x: -18, z: -10, s: 1 }, { x: 18, z: -10, s: 1 }, { x: -18, z: -32, s: 1 }, { x: 18, z: -32, s: 1 },
  { x: 0, z: -48, s: 1.6 }, { x: -12, z: -50, s: 0.8 }, { x: 12, z: -50, s: 0.8 },
];
// cây sao, dầu cổ thụ (có dơi treo)
const BIG_TREES = [
  [-30, -6], [-38, -20], [-28, -34], [-40, -46], [-26, -52], [30, -4], [38, -18], [28, -40], [40, -50], [26, -54],
  [-14, 36], [14, 36], [-36, 38], [38, 34], [-10, 18], [12, 26], [-42, 2], [42, 0],
];
const CENTER = { x: 0, z: 6 }; // lư hương đá trước chánh điện

const WALK_AREAS = [
  rect(-40, 40, 47.5, 57), // sân trước cổng
  rect(-2.6, 2.6, 40, 48.5), // cửa cổng
  rect(-44, -38.2, 4, 42.5), rect(-17.8, 44, 4, 42.5), rect(-44, 44, 29.2, 42.5), // vườn trước (vòng qua ao sen)
  rect(-44, 44, -4.6, 6.6), // sân trước nền điện
  rect(-44, BASE.x0 - 1.4, -58, 6.6), rect(BASE.x1 + 1.4, 44, -58, 6.6), rect(-44, 44, -58, BASE.z0 - 1.4), // vòng quanh nền
  rect(STAIR.x0 + 0.6, STAIR.x1 - 0.6, STAIR.zTop - 0.8, STAIR.zBottom + 0.4), // bậc thang
  rect(BASE.x0 + 0.8, BASE.x1 - 0.8, HALL.z0 + 0.6, BASE.z1 - 0.5), // thềm trước điện
  rect(BASE.x0 + 0.8, -HALL.hx - 0.9, BASE.z0 + 0.7, HALL.z0 + 0.9), rect(HALL.hx + 0.9, BASE.x1 - 0.8, BASE.z0 + 0.7, HALL.z0 + 0.9),
  rect(BASE.x0 + 0.8, BASE.x1 - 0.8, BASE.z0 + 0.7, HALL.z1 - 0.5),
  ...hallWalk(HALL),
];
const ROUND_OBSTACLES = [
  ...STUPAS.map((s) => ({ x: s.x, z: s.z, r: 2.4 * s.s + 0.6 })),
  ...BIG_TREES.map(([x, z]) => ({ x, z, r: 1.3 })),
  { x: CENTER.x, z: CENTER.z, r: 1.0 },
];
// cột nhà sala
for (const x of [SALA.x0 + 0.5, SALA.x1 - 0.5]) for (const z of [SALA.z0 + 0.5, (SALA.z0 + SALA.z1) / 2, SALA.z1 - 0.5]) ROUND_OBSTACLES.push({ x, z, r: 0.5 });
const RITUALS = [
  { place: 'dien', y: HALL.y + 0.25, burner: { x: 0, z: HALL.z1 + 4.2 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 4.0 }, face: { x: 0, y: HALL.y + 4.2, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.6 }, merit: { x: CENTER.x + 3.2, z: CENTER.z + 1.4 }, face: { x: 0, y: 4, z: BASE.z1 } },
  { place: 'thap', y: 0, stone: true, burner: { x: 0, z: -42 }, merit: { x: 3.2, z: -42.2 }, face: { x: 0, y: 3, z: -48 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(STAIR, x, z);
  if (s != null) return s;
  if (x >= BASE.x0 && x <= BASE.x1 && z >= BASE.z0 && z <= BASE.z1) return inHall(HALL, x, z) ? HALL.y + 0.25 : BASE.y;
  if (x > SALA.x0 && x < SALA.x1 && z > SALA.z0 && z < SALA.z1) return 0.35;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#6fa9d6', skyBottom: '#efe6cf', fogColor: 0xe8e2cf });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, updaters, nightHooks, lods } = K;
  const orange = std('#d9772b', { roughness: 0.55 });
  const tileM = std('#c9622a', { roughness: 0.6 });
  const trim = std('#2f7a5c', { roughness: 0.45 });
  const gold = M.gold;
  const wallY = std('#efc65a', { roughness: 0.75 });
  const cream = std('#f3ead2', { roughness: 0.8 });
  const gableM = std('#9a2f1c', { roughness: 0.5 });

  // ---------- Mái Khmer: nhiều lớp mái dốc đứng, đầu hồi vàng, đầu đao chovea, chóp nhọn giữa nóc ----------
  // gable roof theo trục z (đầu hồi nhìn ra trước). W: bề ngang, L: bề dài, H: chiều cao
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
    // viền xanh dọc mép mái, khung vàng đầu hồi
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
        // naga ở chân mái: móc cong lên
        const p0 = new THREE.Vector3(x + s * W / 2, y, zz);
        const curve = new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(s * 0.35, 0.15, 0)), p0.clone().add(new THREE.Vector3(s * 0.55, 0.65, 0)), p0.clone().add(new THREE.Vector3(s * 0.35, 1.0, 0))]);
        parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.08, 6), gold));
      }
    }
    // chovea: sừng vàng cong vút ở đỉnh đầu hồi
    for (const zz of [z + L / 2 + 0.06, z - L / 2 - 0.06]) {
      const p0 = new THREE.Vector3(x, y + H, zz);
      const dz = Math.sign(zz - z);
      const curve = new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(0, 0.6, dz * 0.25)), p0.clone().add(new THREE.Vector3(0, 1.5, dz * 0.1)), p0.clone().add(new THREE.Vector3(0, 2.1, -dz * 0.35))]);
      parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.12, 6), gold));
      // hoa văn mặt trời trong đầu hồi
      const sun = new THREE.Mesh(new THREE.CircleGeometry(Math.min(W, H) * 0.16, 20), gold);
      sun.position.set(x, y + H * 0.38, zz + dz * 0.02);
      if (dz < 0) sun.rotation.y = Math.PI;
      parent.add(sun);
    }
    return m;
  }
  function khmerRoof(parent, x, y, z, W, L, tiers = 3, { spire = true, pitch = 0.5 } = {}) {
    let top = y;
    for (let i = 0; i < tiers; i++) {
      const w = W * (1 - 0.22 * i), l = L * (1 - 0.14 * i), h = w * pitch;
      const yy = y + i * W * 0.13;
      gable(parent, x, yy, z, w, l, h);
      top = Math.max(top, yy + h);
    }
    if (spire) {
      // chóp nhọn giữa nóc: các tầng búp sen vàng
      let yy = top - 0.4;
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
  // tháp cốt Khmer: bệ vuông nhiều cấp, thân chuông, chóp nhọn dài vàng
  function stupa(x, z, s = 1) {
    const g = group(x, 0, z);
    g.scale.setScalar(s);
    let y = 0;
    for (const [w, h] of [[4.4, 0.5], [3.6, 0.6], [3.0, 1.6], [3.4, 0.3], [2.6, 0.6]]) {
      box(w, h, w, cream, 0, y + h / 2, 0, { parent: g });
      y += h;
    }
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const p = box(0.8, 1.0, 0.06, gold, Math.sin(a) * 1.51, 1.9, Math.cos(a) * 1.51, { parent: g, cast: false });
      p.rotation.y = a;
    }
    const bellProf = [[0, 0], [1.1, 0], [1.25, 0.4], [1.1, 1.3], [0.75, 2.0], [0.4, 2.3], [0, 2.4]].map(([a, b]) => new THREE.Vector2(a, b));
    mesh(new THREE.LatheGeometry(bellProf, 20), cream, 0, y, 0, { parent: g });
    y += 2.3;
    for (let k = 0; k < 6; k++) cyl(0.36 - k * 0.05, 0.4 - k * 0.05, 0.32, gold, 0, y + 0.16 + k * 0.32, 0, { parent: g }, 10);
    mesh(new THREE.ConeGeometry(0.12, 2.6, 8), gold, 0, y + 3.2, 0, { parent: g });
  }

  // ---------- Mặt đất: cỏ vườn, lối đi lát gạch ----------
  {
    const grass = K.std('#7a9a52');
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, grass, M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-48, 48, -62, 44, 0, 'grass', { tile: 5, macro: 0.3, tint: '#dfe6c4' });
    floor(-40, 40, 46, 58, 0, 'dirt', { tile: 4, macro: 0.1, tint: '#e6d6b8' });
    floor(-3.2, 3.2, -1, 46, 0.02, 'brick', { tile: 2.4, macro: 0.05 }); // lối giữa
    floor(-16, 16, -4.8, 8, 0.02, 'brick', { tile: 2.4, macro: 0.05 }); // sân trước điện
    floor(-6, 6, -46, -38, 0.02, 'brick', { tile: 2.4, macro: 0.05 }); // sân trước tháp lớn
    // ruộng lúa và hàng thốt nốt xa xa
    const paddy = std('#8fb35a', { roughness: 0.95 });
    for (const [x, z, w, d] of [[-120, 40, 120, 90], [120, 30, 120, 110], [0, 130, 260, 60], [-110, -90, 120, 90], [110, -100, 120, 90]]) {
      const p = mesh(new THREE.PlaneGeometry(w, d), paddy, x, 0.008, z, { cast: false });
      p.rotation.x = -Math.PI / 2;
    }
  }

  // ---------- Tường rào, cổng Khmer có rắn thần Naga ----------
  {
    const g = group(0, 0, GATE_Z);
    for (const s of [-1, 1]) {
      box(1.4, 5.4, 1.4, cream, s * 3.4, 2.7, 0, { parent: g });
      box(1.7, 0.3, 1.7, gold, s * 3.4, 5.5, 0, { parent: g });
      // tường rào thấp quét vàng hai bên cổng, quay vào trong
      box(44, 1.8, 0.5, wallY, s * 26, 0.9, 0, { parent: g });
      box(44.2, 0.2, 0.8, orange, s * 26, 1.9, 0, { parent: g });
    }
    box(8.2, 1.2, 1.6, cream, 0, 6.2, 0, { parent: g });
    khmerRoof(g, 0, 6.8, 0, 7.4, 2.6, 3);
    plaque(g, 'CHÙA DƠI', 0, 6.2, 0.86, 3.6, 0.7, 0, { size: 110 });
    // naga bảy đầu chầu hai bên cổng
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
      box(0.5, 1.8, 104, wallY, s * 48, 0.9, -8);
      box(0.8, 0.2, 104.2, orange, s * 48, 1.9, -8);
    }
    box(96.5, 1.8, 0.5, wallY, 0, 0.9, -60);
    K.roofs.push({ minX: -5, maxX: 5, minZ: GATE_Z - 2, maxZ: GATE_Z + 2, lift: 14 });
  }

  // ---------- Nền cao, bậc thang có lan can naga, chánh điện mái Khmer ----------
  {
    terrace(BASE.x0, BASE.x1, BASE.z0, BASE.z1, 0, BASE.y, { side: cream, kind: 'tile', o: { tile: 2.2, macro: 0.04, tint: '#f4ecdc' } });
    stairs({ ...STAIR, base: 0 }, { rail: null });
    for (const s of [-1, 1]) {
      // lan can là thân rắn naga uốn dọc bậc thang, đầu ngóc lên ở chân
      const x = s * (STAIR.x1 + 0.3);
      const body = new THREE.CatmullRomCurve3([[x, BASE.y + 0.7, STAIR.zTop - 0.2], [x, BASE.y * 0.5 + 0.7, (STAIR.zTop + STAIR.zBottom) / 2], [x, 0.7, STAIR.zBottom], [x, 1.6, STAIR.zBottom + 0.9]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
      mesh(new THREE.TubeGeometry(body, 24, 0.24, 8), trim);
      for (let k = -2; k <= 2; k++) mesh(new THREE.SphereGeometry(0.2, 8, 6), gold, x + Math.sin(k * 0.45) * 0.5, 1.8 + Math.cos(k * 0.45) * 0.5, STAIR.zBottom + 0.95);
      // lan can quanh mép nền
      box(BASE.x1 - STAIR.x1 - 0.6, 0.7, 0.3, cream, s * (BASE.x1 + STAIR.x1 + 0.6) / 2, BASE.y + 0.35, BASE.z1 - 0.15);
      box(0.3, 0.7, BASE.z1 - BASE.z0, cream, s * (BASE.x1 - 0.15), BASE.y + 0.35, (BASE.z0 + BASE.z1) / 2);
    }
    box(BASE.x1 - BASE.x0, 0.7, 0.3, cream, 0, BASE.y + 0.35, BASE.z0 + 0.15);
    K.hall(HALL, (y, z) => {
      // tượng Phật Thích Ca kiểu Khmer: ngồi trên bệ hai cấp dát vàng vừa tầm dưới trần điện
      box(4.6, 0.34, 2.2, gold, 0, y + 0.17, z);
      box(3.6, 0.26, 1.8, gold, 0, y + 0.47, z);
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y + 0.6, z + 0.05);
      b.scale.setScalar(1.22);
      b.traverse((m) => (m.castShadow = false));
      scene.add(b);
      lods.push({ obj: b, z });
      // hai tượng nhỏ hai bên
      for (const x of [-4.2, 4.2]) {
        const sb = makeThichCa();
        sb.position.set(x, y, z + 0.4);
        sb.scale.setScalar(0.85);
        scene.add(sb);
        lods.push({ obj: sb, x, z });
      }
    }, {
      wallMat: wallY, colMat: cream, carpet: '#a3461c', light: 9,
      roof: ({ x, y, cz, hx, d }) => {
        const top = khmerRoof(scene, x, y, cz, hx * 2 + 1.6, d + 3, 3);
        // diềm mái hai bên thấp (mái hiên)
        for (const s of [-1, 1]) {
          const eave = box(2.6, 0.18, d + 2.4, tileM, x + s * (hx + 0.9), y - 0.55, cz);
          eave.rotation.z = s * -0.42;
        }
        // biển tên trên cửa
        plaque(scene, 'CHÁNH ĐIỆN', x, y - 1.0, HALL.z0 + 0.06, 3.6, 0.7);
        return { yTop: top, rx: 1 };
      },
    });
    for (const s of [-1, 1]) K.stoneLamp(s * 10.4, BASE.y, -7.4);
  }

  // ---------- Tháp cốt quanh điện ----------
  for (const s of STUPAS) stupa(s.x, s.z, s.s);

  // ---------- Ao sen bên trái, nhà sala bên phải ----------
  {
    const P = POND;
    box(P.x1 - P.x0 + 1.2, 0.35, 0.6, cream, (P.x0 + P.x1) / 2, 0.17, P.z0 - 0.3);
    box(P.x1 - P.x0 + 1.2, 0.35, 0.6, cream, (P.x0 + P.x1) / 2, 0.17, P.z1 + 0.3);
    box(0.6, 0.35, P.z1 - P.z0, cream, P.x0 - 0.3, 0.17, (P.z0 + P.z1) / 2);
    box(0.6, 0.35, P.z1 - P.z0, cream, P.x1 + 0.3, 0.17, (P.z0 + P.z1) / 2);
    const water = mesh(new THREE.PlaneGeometry(P.x1 - P.x0, P.z1 - P.z0), std('#3f7578', { roughness: 0.15, metalness: 0.2 }), (P.x0 + P.x1) / 2, 0.07, (P.z0 + P.z1) / 2, { cast: false });
    water.rotation.x = -Math.PI / 2;
    const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
    for (let i = 0; i < 46; i++) {
      const x = P.x0 + 1 + K.rr() * (P.x1 - P.x0 - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
      mesh(new THREE.CircleGeometry(0.45 + K.rr() * 0.3, 12).rotateX(-Math.PI / 2), pad, x, 0.1, z, { cast: false });
      if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.16, 0.34, 7), pink, x + 0.2, 0.3, z);
    }
    // nhà sala: sàn gỗ cao, cột, mái Khmer
    const S = SALA, g = group();
    const cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2;
    terrace(S.x0, S.x1, S.z0, S.z1, 0, 0.35, { side: cream, kind: 'tile', o: { tile: 2, macro: 0.04, tint: '#e9dcc4' } });
    for (const x of [S.x0 + 0.5, S.x1 - 0.5]) for (const z of [S.z0 + 0.5, cz, S.z1 - 0.5]) cyl(0.2, 0.22, 3.6, cream, x, 2.15, z, { parent: g }, 10);
    box(S.x1 - S.x0, 0.3, S.z1 - S.z0, M.wood, cx, 4.1, cz, { parent: g });
    const sg = new THREE.Group();
    sg.position.set(cx, 0, cz);
    sg.rotation.y = Math.PI / 2;
    scene.add(sg);
    K.staticRoots.push(sg);
    khmerRoof(sg, 0, 4.2, 0, S.z1 - S.z0 + 1.6, S.x1 - S.x0 + 1.4, 2, { spire: false, pitch: 0.36 });
    for (let k = 0; k < 4; k++) box(2.4, 0.4, 0.8, M.wood, cx - 3.6 + k * 2.4, 0.55, cz + 3);
    K.roofs.push({ minX: S.x0, maxX: S.x1, minZ: S.z0, maxZ: S.z1, lift: 10 });
  }

  // ---------- Lư hương đá lớn trước điện, cột cờ ----------
  {
    cyl(0.8, 1.0, 1.1, cream, CENTER.x, 0.55, CENTER.z, {}, 16);
    for (const s of [-1, 1]) K.flagPole(s * 6, 0, 10, 8);
  }

  // ---------- Cây sao, dầu cổ thụ: thân cao, tán rộng; dơi treo dưới tán ----------
  const batSpots = [];
  {
    const N = BIG_TREES.length;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 0.75, 1, 9).translate(0, 0.5, 0), std('#6b5a48', { roughness: 0.95 }), N);
    const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std('#ffffff', { roughness: 0.9, flatShading: true }), N * 4);
    const o = new THREE.Object3D(), c = new THREE.Color();
    BIG_TREES.forEach(([x, z], i) => {
      const h = 11 + K.rr() * 5;
      o.position.set(x, 0, z);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, h, 1);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + K.rr(), r = k === 0 ? 0 : 2.6;
        const cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r, cy = h + (k === 0 ? 2.2 : 0.6), s = k === 0 ? 4.2 : 3.2;
        o.position.set(cx, cy, cz);
        o.scale.set(s, s * 0.62, s);
        o.updateMatrix();
        crown.setMatrixAt(i * 4 + k, o.matrix);
        crown.setColorAt(i * 4 + k, c.setHSL(0.24 + K.rr() * 0.06, 0.4, 0.22 + K.rr() * 0.08));
        // dơi treo ở mép dưới tán
        for (let b = 0; b < 9; b++) {
          const ba = K.rr() * Math.PI * 2, br = s * (0.4 + K.rr() * 0.5);
          batSpots.push([cx + Math.cos(ba) * br, cy - s * 0.42 - K.rr() * 0.3, cz + Math.sin(ba) * br]);
        }
      }
    });
    trunk.castShadow = crown.castShadow = true;
    crown.receiveShadow = true;
    scene.add(trunk, crown);
    // dơi treo ngược: thân thuôn, cánh xếp
    const batGeo = new THREE.SphereGeometry(0.13, 7, 5).scale(1, 2.4, 0.8);
    const bats = new THREE.InstancedMesh(batGeo, std('#2a211c', { roughness: 0.9 }), batSpots.length);
    batSpots.forEach(([x, y, z], i) => {
      o.position.set(x, y, z);
      o.rotation.set(0, K.rr() * 6, 0);
      o.scale.setScalar(0.8 + K.rr() * 0.5);
      o.updateMatrix();
      bats.setMatrixAt(i, o.matrix);
    });
    scene.add(bats);
  }
  // dơi bay: ban ngày vài con, chiều tối bay ra từng đàn quanh tán cây
  {
    const N = 60;
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.18, 0, 0, -0.18, 0.55, 0.0, 0, 0, 0, 0.18, -0.55, 0, 0, 0, 0, -0.18], 3));
    wing.computeVertexNormals();
    const batM = new THREE.MeshBasicMaterial({ color: '#1d1714', side: THREE.DoubleSide });
    const flyers = [];
    for (let i = 0; i < N; i++) {
      const m = new THREE.Mesh(wing.clone(), batM);
      const [tx, tz] = BIG_TREES[i % BIG_TREES.length];
      m.userData = { cx: tx, cz: tz, r: 4 + K.rr() * 9, h: 9 + K.rr() * 10, sp: (0.4 + K.rr() * 0.5) * (K.rr() < 0.5 ? -1 : 1), ph: K.rr() * 6.28, fl: 9 + K.rr() * 5 };
      m.frustumCulled = false;
      scene.add(m);
      flyers.push(m);
    }
    let night = 0;
    nightHooks.push((n) => (night = n));
    updaters.push((t) => {
      const show = 6 + Math.round(night * (N - 6));
      flyers.forEach((m, i) => {
        const u = m.userData;
        m.visible = i < show;
        if (!m.visible) return;
        const a = t * u.sp + u.ph;
        m.position.set(u.cx + Math.cos(a) * u.r, u.h + Math.sin(t * 1.3 + u.ph) * 1.2, u.cz + Math.sin(a) * u.r);
        m.rotation.y = -a + (u.sp > 0 ? 0 : Math.PI);
        const p = m.geometry.attributes.position, f = Math.sin(t * u.fl + u.ph) * 0.35;
        p.setY(2, f);
        p.setY(4, f);
        p.needsUpdate = true;
      });
    });
  }

  // ---------- Hàng thốt nốt, dừa, cây vườn ----------
  {
    const palmSpots = [];
    for (let z = 10; z <= 40; z += 6) palmSpots.push([-8.5, z], [8.5, z]);
    for (let x = -36; x <= 36; x += 9) palmSpots.push([x, 61]);
    K.palms(palmSpots);
    const avoid = [{ minX: -18, maxX: 18, minZ: -40, maxZ: 10 }, { minX: POND.x0, maxX: POND.x1, minZ: POND.z0, maxZ: POND.z1 }, { minX: SALA.x0, maxX: SALA.x1, minZ: SALA.z0, maxZ: SALA.z1 }, { minX: -8, maxX: 8, minZ: -55, maxZ: 46 }];
    K.forest(K.scatter(-46, 46, -58, 42, 26, avoid), 0, { scale: 0.9 });
    K.forest([...K.scatter(-150, -55, -120, 80, 40), ...K.scatter(55, 150, -120, 80, 40), ...K.scatter(-150, 150, -150, -70, 40)], 0, { scale: 1.2 });
  }

  const world = K.finish({ rituals: RITUALS });
  return world;
}

const PLACE_INFO = {
  dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước tượng Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Chùa Khmer Nam Tông thờ duy nhất Đức Phật Thích Ca.', done: ' dâng Phật' },
  san: { title: 'Thắp nhang trước chánh điện', text: 'Bạn sẽ bước tới lư hương đá giữa sân trước chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: '' },
  thap: { title: 'Thắp nhang trước tháp cốt', text: 'Bạn sẽ bước tới lư hương trước ngôi tháp lớn phía sau chánh điện, chắp tay tưởng nhớ người đã khuất rồi cắm nhang.', done: '' },
};

export const SITE = {
  id: 'chuadoi',
  mapId: 'doi', // mã trên bản đồ Việt Nam
  name: 'Chùa Dơi',
  loading: 'Đàn dơi đang treo mình trên cành',
  hint: 'chùa Khmer giữa vườn cây cổ thụ, ngước nhìn đàn dơi treo trên cành',
  info: 'Chùa Dơi (Mahatup) ở Sóc Trăng là ngôi chùa Khmer Nam Tông: cổng có rắn thần Naga, chánh điện mái nhiều lớp dốc đứng, đầu đao vàng cong vút, quanh điện là các tháp cốt. Vườn cây sao, dầu cổ thụ là nơi hàng nghìn con dơi treo mình ban ngày, chiều tối bay đi kiếm ăn. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Đàn dơi', 'Ban ngày dơi treo dưới tán cây; khi trời tối (theo giờ Việt Nam) dơi bay ra từng đàn quanh vườn.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước tượng Phật; ngoài sân thì ở lư hương đá trước điện; phía sau thì trước tháp cốt lớn.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 51, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < BASE.z0 - 1) return 'thap';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO,
  PLACES: [
    { id: 'gate', name: 'Cổng chùa', x: 0, z: 51, ry: Math.PI },
    { id: 'path', name: 'Lối thốt nốt', x: 0, z: 24, ry: Math.PI },
    { id: 'pond', name: 'Ao sen', x: -28, z: 32, ry: Math.PI },
    { id: 'sala', name: 'Nhà sala', x: 28, z: 25, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 2.4, ry: Math.PI },
    { id: 'thap', name: 'Tháp cốt', x: 0, z: -39, ry: Math.PI },
    { id: 'bats', name: 'Vườn dơi', x: -33, z: -26, ry: -Math.PI / 2 },
  ],
  MAP: {
    box: [-52, -64, 104, 126],
    font: 4.6,
    shapes: [
      { x0: -48, x1: 48, z0: -60, z1: 44, c: 'm-grass' },
      { x0: -40, x1: 40, z0: 46, z1: 58, c: 'm-stone' },
      { x0: -3.2, x1: 3.2, z0: -1, z1: 46, c: 'm-porch' },
      { x0: POND.x0, x1: POND.x1, z0: POND.z0, z1: POND.z1, c: 'm-water' },
      { x0: SALA.x0, x1: SALA.x1, z0: SALA.z0, z1: SALA.z1, c: 'm-corridor' },
      { x0: BASE.x0, x1: BASE.x1, z0: BASE.z0, z1: BASE.z1, c: 'm-terrace' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-field' },
      { x0: -5, x1: 5, z0: GATE_Z - 1, z1: GATE_Z + 1, c: 'm-field' },
      ...STUPAS.map((s) => ({ x: s.x, z: s.z, r: 2.2 * s.s, c: 'm-white' })),
      ...BIG_TREES.map(([x, z]) => ({ x, z, r: 3.2, c: 'm-tree' })),
    ],
    labels: [['gate', 0, 53, 'Cổng chùa'], ['path', 0, 30, 'Lối thốt nốt'], ['pond', -28, 18, 'Ao sen'], ['sala', 28, 15, 'Nhà sala'], ['dien', 0, -21, 'Chánh điện'], ['thap', 0, -54, 'Tháp cốt'], ['bats', -34, -28, 'Vườn dơi']],
  },
  OV: { bounds: { x0: -52, x1: 52, z0: -60, z1: 56 }, dist: 110 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 7, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CENTER.z + 3.5, spread: 3, act: 'gassho' },
    { x: 0, z: -40.5, spread: 3, act: 'bow' },
    { x: -33, z: -26, spread: 4, ry: -Math.PI / 2, say: 'Dơi nhiều quá!' },
    { x: 34, z: -10, spread: 4, ry: Math.PI / 2, say: 'Nhìn kìa, dơi treo trên cành' },
    { x: -28, z: 31, spread: 5, ry: Math.PI, say: 'Sen nở đẹp ghê' },
    { x: 28, z: 15, spread: 4, ry: 0 },
  ],
  BOT_SPAWN: [[-30, 30, 30, 40], [-14, 14, -3, 5], [20, 40, -50, -10]],
  BOT_SAYS: ['Nam mô Bụt', 'Mái chùa đẹp quá', 'Dơi treo kín cành luôn', 'Chùa Khmer lạ mắt thật', 'Gió vườn mát ghê'],
  build,
};
