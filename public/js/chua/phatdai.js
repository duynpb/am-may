// Thích Ca Phật Đài (Vũng Tàu): quần thể chùa trên sườn núi Lớn nhìn ra biển. Qua cổng tam quan là sân dưới với chánh điện
// và vườn Lộc Uyển; bậc thang lên nền giữa có bảo tháp xá lợi màu trắng và đôi voi trắng; lên nữa là Phật đài bát giác
// với tượng Phật Thích Ca ngồi thiền màu trắng rất lớn, mặt hướng ra biển. (Phỏng theo không khí, không sao chép công trình thật.)
import { createKit, curvedRoof, dragonsOnRidge, THREE, rect, stairY, hallWalk, inHall } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 48;
const HALL = { x: -18, z0: 30, z1: 14, hx: 9, y: 0, plaque: 'CHÁNH ĐIỆN', wallH: 6 };
const L1 = { x0: -30, x1: 30, z0: -40, z1: -12, y: 8 }; // nền giữa: bảo tháp, voi trắng
const L2 = { x0: -26, x1: 26, z0: -92, z1: -58, y: 16 }; // Phật đài
const ST1 = { x0: -4, x1: 4, zBottom: 8, zTop: L1.z1, y0: 0, y1: L1.y };
const ST2 = { x0: -4, x1: 4, zBottom: L1.z0, zTop: L2.z1, y0: L1.y, y1: L2.y };
const STUPA = { x: 16, z: -27, r: 4.6 };
const DAI = { x: 0, z: -77, r: 9.4 }; // bệ tượng bát giác
const ELEPHANTS = [{ x: -8, z: -16 }, { x: 8, z: -16 }];
const GARDEN = { x0: 6, x1: 34, z0: 12, z1: 42 }; // vườn Lộc Uyển
const HILL = { x: 0, z: -175 };

const WALK_AREAS = [
  rect(-44, 44, 51.5, 61), // đường trước cổng
  rect(-2.3, 2.3, 44, 52.5), rect(6.6, 9.0, 44, 52.5), rect(-9.0, -6.6, 44, 52.5), // cửa tam quan
  rect(HALL.x + HALL.hx + 1.2, 36, 8.2, 44.5), // sân dưới phía đông (lối giữa, vườn Lộc Uyển)
  rect(-36, 36, HALL.z0 + 0.6, 44.5), // dải trước chánh điện
  rect(-36, HALL.x - HALL.hx - 1.2, 9.5, 44.5), // dải phía tây chánh điện
  rect(-36, 36, 8.2, HALL.z1 - 1.4), // dải sau chánh điện
  ...hallWalk(HALL),
  rect(ST1.x0 + 0.8, ST1.x1 - 0.8, ST1.zTop - 0.8, ST1.zBottom + 0.6),
  rect(L1.x0 + 1, L1.x1 - 1, L1.z0 + 0.8, L1.z1 - 0.6),
  rect(ST2.x0 + 0.8, ST2.x1 - 0.8, ST2.zTop - 0.8, ST2.zBottom + 1.2),
  rect(L2.x0 + 1, L2.x1 - 1, L2.z0 + 1, L2.z1 - 0.6),
];
const ROUND_OBSTACLES = [
  { x: STUPA.x, z: STUPA.z, r: STUPA.r + 2.2 },
  { x: DAI.x, z: DAI.z, r: DAI.r + 0.6 },
  ...ELEPHANTS.map((e) => ({ x: e.x, z: e.z, r: 2.4 })),
  { x: 22, z: 24, r: 2.6 }, // cây bồ đề và tượng giữa vườn Lộc Uyển
];
const RITUALS = [
  { place: 'dien', y: 0.25, burner: { x: HALL.x, z: HALL.z1 + 3.8 }, merit: { x: HALL.x + HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: HALL.x, y: 3.2, z: HALL.z1 + 1.7 } },
  { place: 'thap', y: L1.y, stone: true, burner: { x: STUPA.x, z: STUPA.z + STUPA.r + 4.2 }, merit: { x: STUPA.x + 3.4, z: STUPA.z + STUPA.r + 4.0 }, face: { x: STUPA.x, y: L1.y + 4, z: STUPA.z } },
  { place: 'dai', y: L2.y, stone: true, burner: { x: DAI.x, z: DAI.z + DAI.r + 4.2 }, merit: { x: DAI.x + 3.6, z: DAI.z + DAI.r + 4.0 }, face: { x: DAI.x, y: L2.y + 12, z: DAI.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

// núi Lớn phía sau
const PROFILE = [[0, 34], [30, 34], [55, 26], [80, 14], [110, 6], [150, 0.5], [190, -1.5]];
function hillY(x, z) {
  const r = Math.hypot(x - HILL.x, z - HILL.z);
  for (let i = 1; i < PROFILE.length; i++) if (r <= PROFILE[i][0]) {
    const [r0, y0] = PROFILE[i - 1], [r1, y1] = PROFILE[i];
    return y0 + ((y1 - y0) * (r - r0)) / (r1 - r0);
  }
  return -1.5;
}
function groundY(x, z) {
  for (const S of [ST1, ST2]) {
    const s = stairY(S, x, z);
    if (s != null) return s;
  }
  if (x >= L2.x0 && x <= L2.x1 && z >= L2.z0 && z <= L2.z1) return L2.y;
  if (x >= L1.x0 && x <= L1.x1 && z >= L1.z0 && z <= L1.z1) return L1.y;
  if (inHall(HALL, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#5fa2dc', skyBottom: '#e6eef0', fog: [200, 900], fogColor: 0xdfe8ea });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, updaters } = K;
  const white = std('#f4f1ea', { roughness: 0.6 });

  // ---------- Đất, biển, núi ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 300), [M.stoneD, M.stoneD, std('#8ea06a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -86, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-46, 46, 51, 63, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' }); // đường ven biển
    floor(-38, 38, 8, 46, 0, 'slab', { tile: 5.5, macro: 0.05 }); // sân dưới
    floor(GARDEN.x0, GARDEN.x1, GARDEN.z0, GARDEN.z1, 0.02, 'grass', { tile: 5, macro: 0.3, tint: '#dfe6c4' });
    // bờ kè và biển
    box(700, 1.0, 1.2, M.stone, 0, -0.3, 64);
    const sand = mesh(new THREE.PlaneGeometry(700, 18), std('#e3d3a6', { roughness: 1 }), 0, -0.55, 73, { cast: false });
    sand.rotation.x = -Math.PI / 2;
    sand.rotation.y = 0;
    const sea = mesh(new THREE.PlaneGeometry(2400, 1200), std('#3c7f9c', { roughness: 0.15, metalness: 0.2 }), 0, -0.8, 680, { cast: false });
    sea.rotation.x = -Math.PI / 2;
    const geo = new THREE.LatheGeometry([...PROFILE].reverse().map(([r, y]) => new THREE.Vector2(Math.max(r, 0.01), y)), 72);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x);
      if (y > 0 && y < 33.9) p.setY(i, y + Math.sin(a * 9) * 1.2 + Math.sin(a * 17) * 0.6);
    }
    geo.computeVertexNormals();
    const hill = new THREE.Mesh(geo, std('#56713e', { roughness: 0.95, flatShading: true }));
    hill.position.set(HILL.x, 0, HILL.z);
    hill.receiveShadow = true;
    scene.add(hill);
    const spots = [];
    for (let i = 0; i < 200; i++) {
      const a = K.rr() * Math.PI * 2, r = 10 + K.rr() * 170;
      const x = HILL.x + Math.cos(a) * r, z = HILL.z + Math.sin(a) * r;
      if (z > -100 || Math.abs(x) > 160) continue;
      spots.push([x, z, hillY(x, z) - 0.3]);
    }
    K.forest(spots, 0, { scale: 1.2 });
    K.forest([[-60, 30], [-60, 0], [60, 20], [60, -10], [-50, -40], [50, -50], [-44, -80], [44, -80]], 0, { scale: 1.3 });
  }

  // ---------- Cổng tam quan ----------
  {
    const g = group(0, 0, GATE_Z);
    box(28, 0.3, 6, M.stone, 0, 0.15, 0, { parent: g });
    const Y = 0.3;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.42, 0.48, 6.4, white, sx * 3.0, Y + 3.2, sz * 1.9, { parent: g }, 16);
    box(7.2, 0.5, 4.6, white, 0, Y + 6.6, 0, { parent: g });
    const top = curvedRoof(g, 0, Y + 6.7, 0, 6.2, 4.0, 1.8, 2.4, { lift: 1.0 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, 0, top.rx);
    plaque(g, 'THÍCH CA PHẬT ĐÀI', 0, Y + 5.6, 2.0, 4.6, 0.8);
    plaque(g, 'THÍCH CA PHẬT ĐÀI', 0, Y + 5.6, -2.0, 4.6, 0.8, Math.PI);
    for (const sx of [-1, 1]) {
      const cx = sx * 7.8;
      for (const dx of [-1.5, 1.5]) for (const sz of [-1, 1]) cyl(0.3, 0.34, 4.4, white, cx + dx, Y + 2.2, sz * 1.6, { parent: g }, 14);
      box(3.6, 0.4, 3.8, white, cx, Y + 4.55, 0, { parent: g });
      curvedRoof(g, cx, Y + 4.7, 0, 3.0, 2.8, 1.4, 2.0, { lift: 0.8 });
      box(2.6, 3.4, 0.8, M.wall, sx * 4.6, Y + 1.7, 0, { parent: g });
      box(1.6, 3.0, 0.8, M.wall, sx * 9.9, Y + 1.5, 0, { parent: g });
      box(28.4, 2.4, 0.6, M.wall, sx * 24.8, 1.2, 0, { parent: g });
    }
    for (const sx of [-1, 1]) box(0.6, 2.4, 42, M.wall, sx * 38.8, 1.2, 27);
    K.lion(-4.2, 0, GATE_Z + 3.4);
    K.lion(4.2, 0, GATE_Z + 3.4);
    K.roofs.push({ minX: -11, maxX: 11, minZ: GATE_Z - 3, maxZ: GATE_Z + 3, lift: 11 });
    K.palms([[-20, 56.5], [20, 56.5], [-36, 56.5], [36, 56.5], [-30, 46], [30, 46]]);
  }

  // ---------- Chánh điện (sân dưới, phía tây) ----------
  K.hall(HALL, (y, z) => {
    const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    b.position.set(HALL.x, y, z);
    b.scale.setScalar(1.35);
    b.traverse((m) => (m.castShadow = false));
    scene.add(b);
    K.lods.push({ obj: b, x: HALL.x, z });
  }, { colMat: std('#b5361f', { roughness: 0.5 }) });

  // ---------- Vườn Lộc Uyển: cây bồ đề, Đức Phật thuyết pháp, năm anh em Kiều Trần Như, đàn nai ----------
  {
    const cx = 22, cz = 24;
    cyl(0.5, 0.8, 4, M.trunk, cx, 2, cz - 1.6, {}, 10);
    for (const [dx, dy, dz, s] of [[0, 6, -1.6, 3.6], [-2.2, 5, -0.6, 2.4], [2.2, 5.2, -0.8, 2.4], [0, 5.4, 0.8, 2.2]]) mesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, cx + dx, dy, cz + dz).scale.set(s, s * 0.7, s);
    box(3.2, 0.8, 2.2, M.stone, cx, 0.4, cz);
    const b = K.gild(makeThichCa({ stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
    b.position.set(cx, 0.8, cz);
    b.scale.setScalar(0.85);
    scene.add(b);
    // năm vị đệ tử ngồi nghe (tượng đá trắng giản lược)
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (0.15 + 0.7 * (k / 4));
      const x = cx + Math.cos(a) * 4.4, z = cz + Math.sin(a) * 4.4;
      const g = group(x, 0, z, Math.atan2(cx - x, cz - z));
      mesh(new THREE.SphereGeometry(0.42, 10, 8), white, 0, 0.35, 0, { parent: g }).scale.set(1.2, 0.6, 1);
      mesh(new THREE.CylinderGeometry(0.22, 0.36, 0.7, 10), white, 0, 0.85, 0, { parent: g });
      mesh(new THREE.SphereGeometry(0.17, 10, 8), white, 0, 1.36, 0, { parent: g });
    }
    // đàn nai
    const deerM = std('#b98a5a', { roughness: 0.8 });
    for (const [x, z, ry] of [[12, 36, 0.4], [14, 38, -0.6], [30, 36, 2.2], [10, 16, 1.2]]) {
      const g = group(x, 0, z, ry);
      mesh(new THREE.SphereGeometry(0.4, 10, 8), deerM, 0, 0.9, 0, { parent: g }).scale.set(0.7, 0.7, 1.4);
      for (const [lx, lz] of [[-0.15, 0.35], [0.15, 0.35], [-0.15, -0.35], [0.15, -0.35]]) cyl(0.04, 0.04, 0.7, deerM, lx, 0.35, lz, { parent: g }, 6);
      mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8), deerM, 0, 1.25, 0.5, { parent: g }).rotation.x = -0.5;
      mesh(new THREE.SphereGeometry(0.15, 8, 6), deerM, 0, 1.5, 0.66, { parent: g }).scale.set(0.8, 0.8, 1.3);
    }
    plaque(scene, 'VƯỜN LỘC UYỂN', 20, 2.0, 42.2, 3.6, 0.6, 0, { size: 90 });
    for (const s of [-1, 1]) for (let z = 14; z <= 42; z += 8) K.lampPost(s * 5.4, 0, z);
    K.flagPole(-5.4, 0, 46, 8);
    K.flagPole(5.4, 0, 46, 8);
  }

  // ---------- Bậc thang, nền giữa: bảo tháp xá lợi trắng, đôi voi trắng ----------
  {
    stairs({ ...ST1, base: -0.5 });
    terrace(L1.x0, L1.x1, L1.z0, L1.z1, 0, L1.y, { side: std('#a59a86', { roughness: 1 }) });
    stairs({ ...ST2, base: -0.5 });
    terrace(L2.x0, L2.x1, L2.z0, L2.z1, 0, L2.y, { side: std('#a59a86', { roughness: 1 }) });
    for (const L of [L1, L2]) for (const s of [-1, 1]) {
      box(L.x1 - 4.4, 0.8, 0.3, M.stone, s * (L.x1 + 4.4) / 2, L.y + 0.4, L.z1 - 0.15);
      box(0.3, 0.8, L.z1 - L.z0, M.stone, s * (L.x1 - 0.15), L.y + 0.4, (L.z0 + L.z1) / 2);
    }
    // bảo tháp: bệ vuông, trống tròn, vòm bát úp, đài vuông, lọng vàng
    const g = group(STUPA.x, L1.y, STUPA.z);
    box(STUPA.r * 2 + 2.4, 0.8, STUPA.r * 2 + 2.4, white, 0, 0.4, 0, { parent: g });
    cyl(STUPA.r, STUPA.r + 0.2, 1.6, white, 0, 1.6, 0, { parent: g }, 32);
    const dome = mesh(new THREE.SphereGeometry(STUPA.r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), white, 0, 2.4, 0, { parent: g });
    dome.scale.y = 0.85;
    box(1.8, 0.8, 1.8, M.gold, 0, 2.4 + STUPA.r * 0.85 + 0.3, 0, { parent: g });
    let y = 2.4 + STUPA.r * 0.85 + 0.7;
    cyl(0.12, 0.12, 3.2, M.gold, 0, y + 1.6, 0, { parent: g }, 8);
    for (let k = 0; k < 3; k++) cyl(1.2 - k * 0.3, 1.25 - k * 0.3, 0.12, M.gold, 0, y + 0.8 + k * 0.9, 0, { parent: g }, 16);
    plaque(g, 'BẢO THÁP XÁ LỢI', 0, 1.6, STUPA.r + 0.26, 3.4, 0.6, 0, { size: 90 });
    // voi trắng sáu ngà đứng chầu ở đầu bậc thang
    for (const e of ELEPHANTS) {
      const eg = group(e.x, L1.y, e.z, Math.PI * 0 + (e.x < 0 ? 0.3 : -0.3));
      box(2.2, 0.6, 3.2, M.stone, 0, 0.3, 0, { parent: eg });
      mesh(new THREE.SphereGeometry(1, 16, 12), white, 0, 2.1, 0, { parent: eg }).scale.set(0.9, 0.9, 1.35);
      for (const [lx, lz] of [[-0.5, 0.75], [0.5, 0.75], [-0.5, -0.75], [0.5, -0.75]]) cyl(0.28, 0.3, 1.4, white, lx, 1.2, lz, { parent: eg }, 10);
      mesh(new THREE.SphereGeometry(0.62, 14, 10), white, 0, 2.7, 1.35, { parent: eg });
      for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.5, 10, 8), white, s * 0.6, 2.75, 1.2, { parent: eg }).scale.set(0.25, 1, 0.9);
      const trunk = new THREE.CatmullRomCurve3([[0, 2.5, 1.85], [0, 1.9, 2.15], [0, 1.2, 2.2], [0, 0.95, 2.45]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
      mesh(new THREE.TubeGeometry(trunk, 12, 0.17, 8), white, 0, 0, 0, { parent: eg });
      for (const s of [-1, 1]) {
        const tusk = mesh(new THREE.ConeGeometry(0.07, 0.8, 6), std('#fffaf0'), s * 0.3, 2.25, 1.95, { parent: eg });
        tusk.rotation.x = 1.9;
      }
      box(1.6, 0.12, 1.4, M.red, 0, 3.05, -0.1, { parent: eg }); // tấm phủ lưng
    }
    K.forest([[-24, -18], [-24, -34], [26, -16], [-14, -36]], L1.y, { scale: 1 });
    for (const s of [-1, 1]) K.stoneLamp(s * 5.6, L1.y, -38);
  }

  // ---------- Phật đài bát giác, tượng Phật Thích Ca trắng ngồi thiền nhìn ra biển ----------
  {
    const g = group(DAI.x, L2.y, DAI.z);
    let y = 0;
    for (const [r, h] of [[DAI.r, 1.4], [DAI.r - 1.4, 1.4], [DAI.r - 2.8, 1.6]]) {
      const o = cyl(r, r, h, white, 0, y + h / 2, 0, { parent: g }, 8);
      o.rotation.y = Math.PI / 8;
      cyl(r + 0.1, r + 0.1, 0.16, M.gold, 0, y + h - 0.08, 0, { parent: g, cast: false }, 8).rotation.y = Math.PI / 8;
      y += h;
    }
    // tám bảo vật (bát bửu) trên trụ quanh đài
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      const x = Math.cos(a) * (DAI.r - 0.5), z = Math.sin(a) * (DAI.r - 0.5);
      cyl(0.22, 0.26, 1.2, white, x, 2.0, z, { parent: g }, 8);
      mesh(k % 2 ? new THREE.SphereGeometry(0.3, 10, 8) : new THREE.OctahedronGeometry(0.34), M.gold, x, 2.9, z, { parent: g });
    }
    const b = K.gild(makeThichCa({ stone: '#f6f3ec' }), { color: '#f6f3ec', stone: true });
    b.position.set(DAI.x, L2.y + y, DAI.z);
    b.scale.setScalar(4.2);
    scene.add(b);
    plaque(scene, 'THÍCH CA PHẬT ĐÀI', DAI.x, L2.y + 1.0, DAI.z + DAI.r * 0.93, 4.0, 0.7, 0, { size: 90 });
    K.roofs.push({ minX: DAI.x - DAI.r, maxX: DAI.x + DAI.r, minZ: DAI.z - DAI.r, maxZ: DAI.z + DAI.r, lift: 20 });
    K.forest([[-22, -62], [22, -62], [-22, -88], [22, -88], [-12, -90], [12, -90]], L2.y, { scale: 1.1 });
    for (const s of [-1, 1]) K.flagPole(s * 6.5, L2.y, -60.5, 7);
  }

  return K.finish({ rituals: RITUALS });
}

const PLACE_INFO = {
  dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
  thap: { title: 'Thắp nhang trước bảo tháp', text: 'Bạn sẽ bước tới lư hương đá trước bảo tháp xá lợi màu trắng, chắp tay vái lạy rồi cắm nhang.', done: ' trước bảo tháp' },
  dai: { title: 'Thắp nhang trước Phật đài', text: 'Bạn sẽ bước tới lư hương đá dưới chân Phật đài, ngước nhìn tượng Phật Thích Ca ngồi thiền hướng ra biển, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Phật' },
};

export const SITE = {
  id: 'phatdai',
  name: 'Thích Ca Phật Đài',
  loading: 'Gió biển đang thổi lên núi',
  hint: 'qua cổng lên các bậc thang tới tượng Phật Thích Ca trắng nhìn ra biển',
  info: 'Thích Ca Phật Đài nằm trên sườn núi Lớn, Vũng Tàu, nhìn ra biển. Qua cổng tam quan là chánh điện và vườn Lộc Uyển (Đức Phật thuyết pháp cho năm anh em Kiều Trần Như); lên bậc thang có bảo tháp xá lợi màu trắng và đôi voi trắng; trên cùng là Phật đài bát giác với tượng Phật Thích Ca ngồi thiền màu trắng rất lớn. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Lên Phật đài', 'Đi lối giữa, lên hai đợt bậc thang. Đứng trên Phật đài quay lại sẽ thấy biển.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ở nền giữa thì trước bảo tháp; trên cùng thì dưới chân Phật đài.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 56, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  camFloor: (x, z) => Math.max(groundY(x, z), hillY(x, z)),
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < L2.z1 + 0.5) return 'dai';
    if (z < L1.z1 + 0.5) return 'thap';
    return 'dien';
  },
  defaultPlace: 'dai',
  PLACE_INFO,
  bowRy: (x, z) => (z < L1.z1 && z > L1.z0 && Math.hypot(x - STUPA.x, z - STUPA.z) < 12 ? Math.atan2(STUPA.x - x, STUPA.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 56, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: HALL.x, z: HALL.z0 + 4, ry: Math.PI },
    { id: 'locuyen', name: 'Vườn Lộc Uyển', x: 20, z: 33, ry: Math.PI },
    { id: 'thap', name: 'Bảo tháp', x: STUPA.x - 4, z: -14.5, ry: Math.PI },
    { id: 'dai', name: 'Phật đài', x: 0, z: -61, ry: Math.PI },
    { id: 'view', name: 'Ngắm biển', x: -14, z: -60, ry: 0 },
  ],
  MAP: {
    box: [-46, -96, 92, 162],
    font: 5,
    shapes: [
      { x0: -46, x1: 46, z0: 51, z1: 63, c: 'm-stone' },
      { x0: -46, x1: 46, z0: 64, z1: 66, c: 'm-water' },
      { x0: -38, x1: 38, z0: 8, z1: 46, c: 'm-porch' },
      { x0: GARDEN.x0, x1: GARDEN.x1, z0: GARDEN.z0, z1: GARDEN.z1, c: 'm-grass' },
      { x0: HALL.x - HALL.hx, x1: HALL.x + HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: -12, x1: 12, z0: GATE_Z - 2, z1: GATE_Z + 2, c: 'm-hall' },
      { x0: L1.x0, x1: L1.x1, z0: L1.z0, z1: L1.z1, c: 'm-terrace' },
      { x0: L2.x0, x1: L2.x1, z0: L2.z0, z1: L2.z1, c: 'm-terrace' },
      { x0: ST1.x0, x1: ST1.x1, z0: ST1.zTop, z1: ST1.zBottom, c: 'm-stairs' },
      { x0: ST2.x0, x1: ST2.x1, z0: ST2.zTop, z1: ST2.zBottom, c: 'm-stairs' },
      { x: STUPA.x, z: STUPA.z, r: STUPA.r + 1, c: 'm-white' },
      { x: DAI.x, z: DAI.z, r: DAI.r, c: 'm-white' },
      ...ELEPHANTS.map((e) => ({ x: e.x, z: e.z, r: 1.6, c: 'm-white' })),
    ],
    labels: [['gate', 0, 58, 'Cổng tam quan'], ['dien', HALL.x, 22, 'Chánh điện'], ['locuyen', 20, 30, 'Lộc Uyển'], ['thap', STUPA.x, -34, 'Bảo tháp'], ['dai', 0, -64, 'Phật đài']],
  },
  OV: { bounds: { x0: -46, x1: 46, z0: -95, z1: 62 }, dist: 150, y: 6 },
  TRIPS: [
    { x: 0, z: DAI.z + DAI.r + 7, spread: 5, act: 'bow', say: 'lạy Phật' },
    { x: STUPA.x, z: STUPA.z + STUPA.r + 6.5, spread: 3, act: 'bow' },
    { x: HALL.x, z: HALL.z1 + 6.5, spread: 3, act: 'bow' },
    { x: 18, z: 33, spread: 4, act: 'gassho', say: 'Đức Phật thuyết pháp' },
    { x: -14, z: -61, spread: 6, ry: 0, say: 'Nhìn ra biển đẹp quá' },
    { x: 0, z: 54, spread: 14, ry: 0, say: 'Gió biển mát ghê' },
  ],
  BOT_SPAWN: [[-6, 30, 10, 44], [-20, 20, -36, -20], [-18, 18, -70, -62]],
  BOT_SAYS: ['Nam mô Bổn Sư Thích Ca Mâu Ni Phật', 'Tượng Phật trắng to quá', 'Voi trắng đẹp ghê', 'Đứng trên cao thấy cả biển', 'Leo bậc thang mỏi chân'],
  build,
};
