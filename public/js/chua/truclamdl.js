// Thiền viện Trúc Lâm Đà Lạt: trên núi Phụng Hoàng bên hồ Tuyền Lâm, giữa rừng thông. Từ bến hồ lên bậc đá tới cổng
// tam quan, vào sân vườn hoa rực rỡ, gác chuông bên trái, chánh điện ở giữa, phía sau là khu thiền (nội viện) yên tĩnh;
// bên phải có ga cáp treo: ngồi vào cabin bay qua rừng thông và hồ Tuyền Lâm lên đồi Robin (đồi là một "tầng" riêng,
// chỉ lên xuống bằng cáp treo). (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, curvedRoof, THREE, rect, stairY, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const Y = 10; // mặt núi nơi đặt thiền viện
const TER = { x0: -30, x1: 30, z0: -62, z1: 18 };
const SHORE = 48; // mép hồ
const STAIR = { x0: -4, x1: 4, zBottom: 38, zTop: TER.z1, y0: 0, y1: Y };
const GATE_Z = 13;
const HALL = { x: 0, z0: -16, z1: -34, hx: 12, y: Y, plaque: 'CHÁNH ĐIỆN', wallH: 6 };
const BELL = { x: -19, z: -4 };
const CENTER = { x: 0, z: -6 }; // lư hương đá giữa sân
const NOI = { z: -46 }; // tường nội viện (khu thiền, không vào)
// cáp treo: ga thiền viện (STA) — ga đồi Robin (STB) trên đỉnh đồi ROBIN
const STA = { x: 22, z: 2 };
const ROBIN = { x: 232, z: 168, y: 34, r: 22 };
const STB = { x: 226, z: 158 };
const CABLE_A = { x: STA.x, y: Y + 5, z: STA.z }, CABLE_B = { x: STB.x, y: ROBIN.y + 5, z: STB.z };
const RIDE_SEC = 10; // một chuyến cáp treo chở người chơi (giây)
const LOOP_SEC = 70; // cabin chạy sẵn trên dây: một vòng (giây), chậm cho êm mắt

const WALK_AREAS = [
  rect(-40, 40, STAIR.zBottom + 0.4, SHORE - 1), // bờ hồ
  rect(-1.2, 1.2, SHORE - 2, SHORE + 8), // bến thuyền
  rect(STAIR.x0 + 0.8, STAIR.x1 - 0.8, STAIR.zTop - 0.8, STAIR.zBottom + 0.8),
  rect(TER.x0 + 1, TER.x1 - 1, GATE_Z + 4.4, TER.z1 - 0.4), // thềm trước cổng
  ...gateWalk(0, GATE_Z),
  rect(TER.x0 + 1, TER.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4), // sân vườn hoa
  rect(TER.x0 + 1, -HALL.hx - 1.2, NOI.z + 1, GATE_Z - 4.4), rect(HALL.hx + 1.2, TER.x1 - 1, NOI.z + 1, GATE_Z - 4.4),
  rect(TER.x0 + 1, TER.x1 - 1, NOI.z + 1, HALL.z1 - 1.4), // sân sau điện, trước nội viện
  ...hallWalk(HALL),
  rect(ROBIN.x - 14, ROBIN.x + 14, ROBIN.z - 14, ROBIN.z + 14, { zone: 1 }), // đỉnh đồi Robin (chỉ tới bằng cáp treo)
];
const ROUND_OBSTACLES = [
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: CENTER.x, z: CENTER.z, r: 1.2 },
  { x: STA.x, z: STA.z, r: 4 }, // ga cáp treo thiền viện
  { x: STB.x, z: STB.z, r: 4 }, // ga cáp treo đồi Robin
];
const RITUALS = [
  { place: 'dien', y: Y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: Y + 3.2, z: HALL.z1 + 1.7 } },
  { place: 'san', y: Y, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: Y + 4, z: HALL.z0 } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  if (Math.hypot(x - ROBIN.x, z - ROBIN.z) < ROBIN.r + 1) return ROBIN.y;
  const s = stairY(STAIR, x, z);
  if (s != null) return s;
  if (x >= TER.x0 && x <= TER.x1 && z >= TER.z0 && z <= TER.z1) {
    if (inHall(HALL, x, z)) return Y + 0.25;
    if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return Y + 0.3;
    return Y;
  }
  if (Math.abs(x) < 1.6 && z > SHORE - 2 && z < SHORE + 9) return 0.1;
  return 0;
}
let hillAt = () => -1; // độ cao mặt núi Phụng Hoàng (gán khi dựng cảnh)
let robinAt = () => -1; // độ cao mặt đồi Robin

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#86b8de', skyBottom: '#e6ebe6', fog: [120, 600], fogColor: 0xdfe6e2 });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables } = K;
  const yellowWall = std('#e7c66e', { roughness: 0.8 });

  // ---------- Hồ Tuyền Lâm, núi Phụng Hoàng, rừng thông ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 400), [M.stoneD, M.stoneD, std('#7f9a5c'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, SHORE - 200, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-44, 44, STAIR.zBottom, SHORE, 0, 'slab', { tile: 5.5, macro: 0.05 });
    box(700, 1.0, 1.0, M.stone, 0, -0.4, SHORE + 0.4);
    K.water(-800, 800, SHORE + 1, SHORE + 500, -0.6, { color: '#3f7a78' });
    box(2.4, 0.2, 10, std('#8a6a44'), 0, 0, SHORE + 4);
    // đồi thông bên kia hồ
    for (const [x, z, r, h] of [[-120, 200, 90, 40], [80, 300, 120, 55], [-260, 120, 90, 30]]) {
      const m = new THREE.Mesh(new THREE.LatheGeometry([[r, -1], [r * 0.55, h * 0.6], [r * 0.15, h], [0.01, h]].map(([a, b]) => new THREE.Vector2(a, b)), 40), std('#4c6a3c', { roughness: 0.95, flatShading: true }));
      m.position.set(x, -1, z);
      scene.add(m);
    }
    // núi Phụng Hoàng lùi ra sau; trong khuôn viên (bờ hồ, bậc đá, thiền viện) mặt núi luôn thấp hơn mặt đất đi lại
    const hy = makeHill(K, 0, -175, [[0, 30], [50, 30], [90, 14], [120, 4], [150, -1]], { color: '#5a7442', clip: { x0: -46, x1: 46, z0: -66, z1: SHORE + 1, floor: groundY } });
    hillAt = hy;
    const spots = [...K.scatter(-180, 180, -250, -72, 150), ...K.scatter(-140, -36, -70, 44, 60), ...K.scatter(36, 140, -70, 44, 60)];
    K.pines(spots.map(([x, z]) => [x, z, Math.max(hy(x, z), 0) - 0.2]));
    // đồi Robin bên kia hồ: đỉnh phẳng có ga cáp treo và chỗ ngắm cảnh
    const ry = makeHill(K, ROBIN.x, ROBIN.z, [[0, ROBIN.y], [ROBIN.r, ROBIN.y], [55, 18], [90, 4], [115, -1]], { color: '#56713e' });
    robinAt = ry;
    K.pines(K.scatter(ROBIN.x - 100, ROBIN.x + 100, ROBIN.z - 100, ROBIN.z + 100, 90)
      .filter(([x, z]) => Math.hypot(x - ROBIN.x, z - ROBIN.z) > ROBIN.r + 3 && Math.hypot(x - ROBIN.x, z - ROBIN.z) < 100)
      .map(([x, z]) => [x, z, Math.max(ry(x, z), -0.6) - 0.2]));
    floor(ROBIN.x - 15, ROBIN.x + 15, ROBIN.z - 15, ROBIN.z + 15, ROBIN.y, 'slab', { tile: 5.5, macro: 0.05 });
    for (const s of [-1, 1]) {
      box(30, 0.8, 0.3, M.stone, ROBIN.x, ROBIN.y + 0.4, ROBIN.z + s * 15);
      box(0.3, 0.8, 30, M.stone, ROBIN.x + s * 15, ROBIN.y + 0.4, ROBIN.z);
    }
    plaque(scene, 'ĐỒI ROBIN', ROBIN.x + 6, ROBIN.y + 1.6, ROBIN.z + 14.7, 3.2, 0.6, Math.PI, { size: 90 });
    for (const [dx, dz] of [[-10, 10], [10, 10], [10, -10]]) K.lampPost(ROBIN.x + dx, ROBIN.y, ROBIN.z + dz);
  }

  // ---------- Bậc đá lên núi, nền thiền viện ----------
  {
    stairs({ ...STAIR, base: -0.5 });
    terrace(TER.x0, TER.x1, TER.z0, TER.z1, 0, Y, { side: std('#857c6c', { roughness: 1 }) });
    for (const s of [-1, 1]) {
      box(TER.x1 - STAIR.x1 - 0.4, 0.8, 0.3, M.stone, s * (TER.x1 + STAIR.x1 + 0.4) / 2, Y + 0.4, TER.z1 - 0.15);
      box(0.3, 0.8, TER.z1 - TER.z0, M.stone, s * (TER.x1 - 0.15), Y + 0.4, (TER.z0 + TER.z1) / 2);
    }
  }

  // ---------- Cổng tam quan, sân vườn hoa, gác chuông, chánh điện ----------
  K.gate3(0, GATE_Z, 'TRÚC LÂM THIỀN VIỆN', { walls: 18, y: Y, wall: yellowWall });
  const bells = [K.bellPavilion(BELL.x, BELL.z, Y)];
  cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, Y + 0.5, CENTER.z, {}, 16);
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(0, y, z);
    b.scale.setScalar(1.6);
    scene.add(b);
    K.lods.push({ obj: b, z });
  }, { wallMat: yellowWall });
  // bồn hoa: hai dải dọc lối giữa, quanh lư hương, hai bên chánh điện
  {
    const beds = [];
    for (let z = GATE_Z - 6; z >= HALL.z0 + 3; z -= 1.4) beds.push([-4.4, z, Y], [4.4, z, Y], [-12, z, Y], [12, z, Y]);
    for (let a = 0; a < 12; a++) beds.push([CENTER.x + Math.cos(a / 1.9) * 3.4, CENTER.z - 1 + Math.sin(a / 1.9) * 2.2, Y]);
    K.flowers(beds.filter(([x, z]) => Math.hypot(x - CENTER.x, z - CENTER.z - 1.8) > 2.2 && Math.hypot(x - BELL.x, z - BELL.z) > 4.5));
    for (const x of [-4.4, 4.4, -12, 12]) box(1.3, 0.3, GATE_Z - 6 - HALL.z0 - 2, M.stone, x, Y + 0.15, (GATE_Z - 6 + HALL.z0 + 3) / 2);
  }
  // nội viện: tường vàng, mái ngói, cổng đóng (khu thiền sinh tu tập)
  {
    box(TER.x1 - TER.x0 - 2, 2.6, 0.5, yellowWall, 0, Y + 1.3, NOI.z);
    box(TER.x1 - TER.x0 - 1.6, 0.2, 0.9, std('#6a3426'), 0, Y + 2.7, NOI.z);
    box(3.4, 2.4, 0.2, std('#5b3a24'), 0, Y + 1.2, NOI.z + 0.3);
    plaque(scene, 'NỘI VIỆN', 0, Y + 3.2, NOI.z + 0.35, 2.4, 0.5, 0, { size: 90 });
    for (const x of [-16, 0, 16]) {
      const g = group(x, Y, NOI.z - 8);
      box(10, 4, 6, yellowWall, 0, 2, 0, { parent: g });
      curvedRoof(g, 0, 4, 0, 5.8, 3.8, 1.6, 2.4, { lift: 0.7 });
    }
  }
  // ---------- Cáp treo thiền viện — đồi Robin: hai ga, trụ cáp, dây cáp, cabin chạy liên tục; cabin riêng chở người chơi ----------
  const gotoHits = [];
  const ride = {};
  {
    const station = (x, z, y, goto) => {
      const st = group(x, y, z, 0, { merge: false });
      st.userData.goto = goto;
      box(7, 4.4, 7, std('#e9ecef', { roughness: 0.4, metalness: 0.2 }), 0, 2.2, 0, { parent: st });
      box(7.4, 0.4, 7.4, std('#c0392b'), 0, 4.6, 0, { parent: st });
      box(3.2, 2.6, 0.06, std('#3b6e8f', { roughness: 0.15, metalness: 0.5 }), 0, 1.6, 3.53, { parent: st, cast: false });
      cyl(0.5, 0.5, 1.2, std('#555'), 0, 5.4, 0, { parent: st }, 12);
      plaque(st, 'CÁP TREO', 0, 3.6, 3.55, 3.0, 0.5, 0, { size: 90 });
      gotoHits.push(st);
    };
    station(STA.x, STA.z, Y, 0);
    station(STB.x, STB.z, ROBIN.y, 1);
    const A = new THREE.Vector3(CABLE_A.x, CABLE_A.y, CABLE_A.z), B = new THREE.Vector3(CABLE_B.x, CABLE_B.y, CABLE_B.z);
    const side = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(1.4);
    // đường cáp: võng nhẹ giữa các trụ; hai dây (đi, về) lệch sang hai bên
    const TOWERS = [0.25, 0.5, 0.75];
    const sagAt = (u) => {
      const seg = [0, ...TOWERS, 1];
      for (let k = 1; k < seg.length; k++) if (u <= seg[k]) {
        const t = (u - seg[k - 1]) / (seg[k] - seg[k - 1]);
        return Math.sin(Math.PI * t) * 3.5;
      }
      return 0;
    };
    const lineAt = (u, s, out = new THREE.Vector3()) => out.lerpVectors(A, B, u).addScaledVector(side, s).add(new THREE.Vector3(0, -sagAt(u), 0));
    const cableM = new THREE.LineBasicMaterial({ color: '#2b2b2b' });
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 200; i++) pts.push(lineAt(i / 200, s));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableM));
    }
    // trụ cáp thép (đứng trên mặt đất, mặt đồi hoặc dưới đáy hồ)
    const steel = std('#8c8f93', { metalness: 0.6, roughness: 0.4 });
    for (const u of TOWERS) {
      const p = lineAt(u, 0);
      const gy = Math.max(hillAt(p.x, p.z), robinAt(p.x, p.z), -2);
      const h = p.y - gy + 0.6;
      box(1.0, h, 1.0, steel, p.x, gy + h / 2 - 0.3, p.z);
      const arm = box(0.4, 0.4, 3.6, steel, p.x, p.y + 0.3, p.z);
      arm.rotation.y = Math.atan2(side.x, side.z);
    }
    // cabin: khung đỏ, kính trong để thấy người ngồi bên trong, ghế băng, thanh treo lên cáp
    const frameM = std('#d6402c', { roughness: 0.45 });
    const glassM = new THREE.MeshStandardMaterial({ color: '#bfe3f2', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.2, depthWrite: false, side: THREE.DoubleSide });
    const benchM = std('#5b3a24');
    const HANG = 3.0; // sàn cabin thấp hơn dây cáp 3 m
    const riderCabs = []; // cabin chở người (main.js gắn vào cảnh khi đi, gỡ ra khi tới ga)
    function makeCabin(forRider = true) {
      const g = new THREE.Group();
      if (forRider) {
        for (let i = riderCabs.length - 1; i >= 0; i--) if (!riderCabs[i].parent) riderCabs.splice(i, 1);
        riderCabs.push(g);
      }
      const add = (geo, mat, x, y, z) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.castShadow = mat !== glassM;
        g.add(m);
        return m;
      };
      add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), std('#444'), 0, -0.5, 0);
      add(new THREE.BoxGeometry(0.5, 0.3, 0.9), std('#444'), 0, 0.05, 0);
      add(new THREE.BoxGeometry(2.3, 0.14, 2.3), frameM, 0, -HANG, 0); // sàn
      add(new THREE.BoxGeometry(2.4, 0.16, 2.4), frameM, 0, -1.0, 0); // mái
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.1, 2.0, 0.1), frameM, sx * 1.12, -2.0, sz * 1.12);
      add(new THREE.BoxGeometry(2.2, 0.55, 0.06), frameM, 0, -2.72, 1.13); // tấm che chân
      add(new THREE.BoxGeometry(2.2, 0.55, 0.06), frameM, 0, -2.72, -1.13);
      for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.06, 0.55, 2.2), frameM, sx * 1.13, -2.72, 0);
      add(new THREE.BoxGeometry(2.2, 1.35, 0.03), glassM, 0, -1.78, 1.13); // kính
      add(new THREE.BoxGeometry(2.2, 1.35, 0.03), glassM, 0, -1.78, -1.13);
      for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.03, 1.35, 2.2), glassM, sx * 1.13, -1.78, 0);
      add(new THREE.BoxGeometry(1.9, 0.12, 0.5), benchM, 0, -2.5, -0.8); // ghế băng sau lưng
      return g;
    }
    // cabin chạy liên tục trên hai dây (cho cảnh có sức sống); cabin của người chơi do main.js tạo riêng
    const loop = [];
    for (let i = 0; i < 10; i++) {
      const c = makeCabin(false);
      scene.add(c);
      loop.push({ c, s: i % 2 ? 1 : -1, ph: i / 10 });
    }
    const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
    K.updaters.push((t) => {
      for (const L of loop) {
        let u = (t / LOOP_SEC + L.ph) % 1;
        if (L.s > 0) u = 1 - u; // dây bên kia chạy ngược chiều
        lineAt(u, L.s, L.c.position);
        lineAt(Math.min(1, Math.max(0, u + (L.s > 0 ? -0.01 : 0.01))), L.s, tmp);
        L.c.rotation.y = Math.atan2(tmp.x - L.c.position.x, tmp.z - L.c.position.z);
        // vào ga thì ẩn; trùng chỗ cabin đang chở người thì cũng ẩn
        L.c.visible = u > 0.02 && u < 0.98 && !riderCabs.some((g) => g.parent && g.position.distanceTo(L.c.position) < 6);
      }
    });
    // dữ liệu cho chuyến đi của người chơi: up = thiền viện → đồi Robin (dây bên trái), down = ngược lại (dây bên phải)
    Object.assign(ride, {
      duration: RIDE_SEC,
      hang: HANG,
      makeCabin,
      // k: 0 = vừa rời ga đi, 1 = tới ga đến (chiều về chạy ngược dây từ đồi Robin)
      at(k, dir, out = new THREE.Vector3()) {
        return lineAt(dir === 'up' ? k : 1 - k, dir === 'up' ? -1 : 1, out);
      },
      heading(k, dir) {
        const u = dir === 'up' ? k : 1 - k, s = dir === 'up' ? -1 : 1;
        const a = lineAt(Math.max(0, u - 0.005), s, tmp), b = lineAt(Math.min(1, u + 0.005), s, tmp2);
        return dir === 'up' ? Math.atan2(b.x - a.x, b.z - a.z) : Math.atan2(a.x - b.x, a.z - b.z);
      },
    });
  }
  K.pines([[-26, 8], [26, 12], [-26, -20], [26, -24], [-24, -40], [24, -40], [-10, 16], [10, 16]], Y, { scale: 0.9 });
  K.bamboo([[-26, -30, 10], [26, -12, 8]], Y);

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  world.gotoHits = gotoHits;
  world.ride = ride;
  return world;
}

export const SITE = {
  id: 'truclamdl',
  name: 'Thiền viện Trúc Lâm Đà Lạt',
  loading: 'Sương sớm đang tan trên hồ Tuyền Lâm',
  hint: 'từ bến hồ Tuyền Lâm lên bậc đá qua cổng tam quan, dạo vườn hoa tới chánh điện',
  info: 'Thiền viện Trúc Lâm Đà Lạt nằm trên núi Phụng Hoàng bên hồ Tuyền Lâm, giữa rừng thông. Qua cổng tam quan là sân vườn hoa rực rỡ, gác chuông, chánh điện; phía sau là nội viện dành cho thiền sinh tu tập, khách không vào. Cáp treo từ đồi Robin bay qua rừng thông tới cạnh thiền viện. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông ở gác chuông bên trái sân để đi tới thỉnh một hồi.'],
    ['Đi cáp treo', 'Ra ga cáp treo bên phải sân, bấm “Đi cáp treo lên đồi Robin”: bạn ngồi vào cabin, bay qua rừng thông và hồ Tuyền Lâm khoảng 10 giây (bấm “Tới ga ngay” nếu muốn tới luôn). Trên đồi Robin có ga để về lại.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa vườn hoa.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 44, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z), robinAt(x, z)),
  unreachable: 'Chỗ đó phải đi cáp treo mới tới được',
  // cáp treo đi được: đứng trước nhà ga thì hiện nút; ride: chiều đi (main.js chở người chơi trong cabin theo dây cáp)
  GOTOS: [
    { x: STA.x, z: STA.z + 5.6, r: 4.5, ride: 'up', label: 'Đi cáp treo lên đồi Robin', msg: 'Mời bạn vào cabin — cáp treo đưa bạn bay qua rừng thông và hồ Tuyền Lâm', done: 'Đã tới ga đồi Robin', to: { x: STB.x, z: STB.z + 6, ry: Math.atan2(STA.x - STB.x, STA.z - STB.z) } },
    { x: STB.x, z: STB.z + 5.6, r: 4.5, ride: 'down', label: 'Đi cáp treo về thiền viện', msg: 'Mời bạn vào cabin — cáp treo đưa bạn về Thiền viện Trúc Lâm', done: 'Đã về tới ga Thiền viện Trúc Lâm', to: { x: STA.x, z: STA.z + 6, ry: 0 } },
  ],
  placeOf: (x, z) => (inHall(HALL, x, z) || z < HALL.z0 ? 'dien' : 'san'),
  defaultPlace: 'san',
  PLACE_INFO: {
    dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
    san: { title: 'Thắp nhang giữa vườn hoa', text: 'Bạn sẽ bước tới lư hương đá giữa vườn hoa trước chánh điện, chắp tay vái lạy rồi cắm nhang.', done: '' },
  },
  PLACES: [
    { id: 'ho', name: 'Bến hồ Tuyền Lâm', x: 0, z: 44, ry: Math.PI },
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 17, ry: Math.PI },
    { id: 'hoa', name: 'Vườn hoa', x: 8, z: 0, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
    { id: 'cap', name: 'Ga cáp treo', x: STA.x, z: STA.z + 6, ry: Math.PI },
    { id: 'robin', name: 'Đồi Robin', x: ROBIN.x, z: ROBIN.z + 8, ry: Math.atan2(-ROBIN.x, -ROBIN.z) },
  ],
  MAP: {
    box: [-45, -64, 90, 124],
    font: 4.4,
    shapes: [
      { x0: -45, x1: 45, z0: SHORE, z1: 60, c: 'm-water' },
      { x0: -44, x1: 44, z0: STAIR.zBottom, z1: SHORE, c: 'm-stone' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: TER.z1, c: 'm-terrace' },
      { x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.zTop, z1: STAIR.zBottom, c: 'm-stairs' },
      { x0: -14, x1: 14, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
      { x0: -16, x1: 16, z0: HALL.z0 + 3, z1: GATE_Z - 6, c: 'm-veg' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: TER.x0, x1: TER.x1, z0: TER.z0, z1: NOI.z, c: 'm-wall' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x0: 18.5, x1: 25.5, z0: -1.5, z1: 5.5, c: 'm-stairs' },
    ],
    labels: [['ho', 0, 54, 'Hồ Tuyền Lâm'], ['gate', 0, 20, 'Cổng tam quan'], ['hoa', 0, 2, 'Vườn hoa'], ['chuong', BELL.x, BELL.z + 6, 'Gác chuông'], ['dien', 0, -25, 'Chánh điện'], ['cap', 22, 8, 'Cáp treo']],
  },
  OV: { bounds: { x0: -45, x1: 245, z0: -62, z1: 185 }, dist: 110, y: 8 },
  TRIPS: [
    { x: ROBIN.x - 4, z: ROBIN.z + 10, spread: 6, ry: Math.atan2(-ROBIN.x, -ROBIN.z), say: 'Trên đồi Robin nhìn thấy cả hồ' },
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
    { x: 0, z: 0, act: 'bell' },
    { x: 8, z: 2, spread: 4, ry: 0, say: 'Hoa đẹp quá' },
    { x: 0, z: 45, spread: 18, ry: 0, say: 'Hồ Tuyền Lâm yên bình ghê' },
    { x: 18, z: 7, spread: 1.5, ry: 0.6, say: 'Cáp treo kìa' },
  ],
  BOT_SPAWN: [[-20, 20, 40, 46], [-14, 14, -12, 6], [ROBIN.x - 10, ROBIN.x + 10, ROBIN.z - 2, ROBIN.z + 10]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Đà Lạt mát quá', 'Rừng thông thơm ghê', 'Hoa nở khắp sân', 'Thiền viện yên tĩnh thật'],
  build,
};
