// Chi tiết riêng cho một số chùa sân vườn (gắn vào makeYardSite qua cfg.extras và slot kiểu 'custom').
// Mỗi hàm nhận ngữ cảnh ctx do yard.js đưa vào. (Phỏng theo dáng công trình, không sao chép.)
import { curvedRoof, dragonsOnRidge } from './base.js';
import { makeThichCa } from '../buddha.js';

const slotOf = (ctx, key) => ctx.slots.find((s) => s.key === key);

// Tháp chuông nhiều tầng mái cong (như Xá Lợi: vuông, trắng ngà, mái đỏ)
export function tieredBellTower(ctx, key, { tiers = 7, half = 2.5, wall = '#efe6cf', h = 2.4 } = {}) {
  const { THREE, scene, M, std, box, cyl, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const wallM = std(wall, { roughness: 0.8 });
  box(half * 2 + 2, 0.9, half * 2 + 2, M.stoneD, x, 0.45, z);
  let y = 0.9;
  for (let i = 0; i < tiers; i++) {
    const hw = half - i * (half * 0.5 / tiers);
    box(hw * 2 - 0.5, h, hw * 2 - 0.5, wallM, x, y + h / 2, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.14, 0.14, h, M.red, x + sx * (hw - 0.25), y + h / 2, z + sz * (hw - 0.25), {}, 8);
    // cửa sổ nhỏ mỗi mặt
    for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) {
      const w = box(0.7, 1.1, 0.06, M.wood, x + dx * (hw - 0.22), y + h * 0.55, z + dz * (hw - 0.22), { cast: false });
      w.rotation.y = ry;
    }
    const roof = curvedRoof(scene, x, y + h, z, hw + 0.8, hw + 0.8, 0.8, hw * 0.6, { lift: 0.55 });
    y += h + 0.8;
    if (i === tiers - 1) {
      dragonsOnRidge(scene, x, roof.yTop + 0.2, z, 1.2);
      mesh(new THREE.ConeGeometry(0.22, 2.2, 8), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), x, y + 1.1, z);
    }
  }
  plaque(scene, 'THÁP CHUÔNG', x + (x < 0 ? half + 1.2 : -(half + 1.2)), 2.0, z, 1.8, 0.4, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
}

// Bảo tháp gạch nhiều tầng thu nhỏ dần, mỗi tầng một gờ nhô (như Phổ Minh)
export function brickTower(ctx, key, { tiers = 14, base = 4.6, top = 2.0, h = 1.5, brick = '#a45f3f' } = {}) {
  const { THREE, scene, M, std, box, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const bm = std(brick, { roughness: 0.95 }), ledge = std('#7d4a32', { roughness: 0.95 });
  box(base + 2, 0.9, base + 2, M.stoneD, x, 0.45, z);
  let y = 0.9;
  for (let i = 0; i < tiers; i++) {
    const w = base - (base - top) * (i / (tiers - 1));
    box(w, h, w, bm, x, y + h / 2, z);
    box(w + 0.5, 0.2, w + 0.5, ledge, x, y + h + 0.1, z);
    // ô cửa vòm nhỏ ở các tầng dưới
    if (i < tiers - 2) for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) {
      const d = box(0.4, 0.7, 0.05, std('#2a1c14'), x + dx * (w / 2 + 0.02), y + h * 0.55, z + dz * (w / 2 + 0.02), { cast: false });
      d.rotation.y = ry;
    }
    y += h + 0.2;
  }
  mesh(new THREE.ConeGeometry(top * 0.6, 2.2, 4).rotateY(Math.PI / 4), ledge, x, y + 1.1, z);
  mesh(new THREE.ConeGeometry(0.16, 1.4, 8), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), x, y + 2.7, z);
  plaque(scene, 'BẢO THÁP', x + (x < 0 ? base / 2 + 1.5 : -(base / 2 + 1.5)), 1.8, z, 1.4, 0.34, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
}

// Gác chuông gỗ ba tầng, bốn cột mỗi tầng, mái cong chồng lên nhau (như chùa Keo)
export function woodBellTower(ctx, key, { tiers = 3, half = 2.6 } = {}) {
  const { THREE, scene, M, std, box, cyl, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const wood = std('#6b4528', { roughness: 0.7 }), woodD = std('#4a2e1a', { roughness: 0.7 });
  box(half * 2 + 2.2, 0.7, half * 2 + 2.2, M.stone, x, 0.35, z);
  let y = 0.7;
  const h = 2.8;
  for (let i = 0; i < tiers; i++) {
    const hw = half - i * 0.55;
    box(hw * 2 + 0.3, 0.25, hw * 2 + 0.3, woodD, x, y + 0.12, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.2, 0.22, h, wood, x + sx * (hw - 0.1), y + 0.25 + h / 2, z + sz * (hw - 0.1), {}, 10);
    for (const s of [-1, 1]) { box(hw * 2 - 0.2, 0.18, 0.12, woodD, x, y + h * 0.35, z + s * (hw - 0.1)); box(0.12, 0.18, hw * 2 - 0.2, woodD, x + s * (hw - 0.1), y + h * 0.35, z); }
    const roof = curvedRoof(scene, x, y + 0.25 + h, z, hw + 0.9, hw + 0.9, 0.9, hw * 0.55, { lift: 0.7 });
    y += 0.25 + h + 0.55;
    if (i === 0) {
      // quả chuông treo ở tầng trên cùng được vẽ ở dưới
    }
    if (i === tiers - 1) dragonsOnRidge(scene, x, roof.yTop + 0.2, z, 1.0);
  }
  // chuông đồng treo ở tầng trên
  const prof = [[0.05, 0], [0.5, -0.1], [0.7, -0.7], [0.8, -1.7], [0.95, -2.1], [0.9, -2.2], [0, -2.2]].map(([a, b]) => new THREE.Vector2(a, b));
  const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), std('#5f4a2a', { metalness: 0.8, roughness: 0.38 }));
  bell.position.set(x, 0.7 + 2 * (0.25 + h + 0.55) + h - 0.4, z);
  bell.castShadow = true;
  scene.add(bell);
  plaque(scene, 'GÁC CHUÔNG', x + (x < 0 ? half + 1.5 : -(half + 1.5)), 2.0, z, 1.8, 0.4, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
}

// Cầu có mái che bắc qua sông, miếu nhỏ ở giữa, tượng chó và khỉ đá ở hai đầu (như Chùa Cầu Hội An)
export function coveredBridge(ctx, { shrine = true, animals = true, label: bridgeLabel = 'LAI VIỄN KIỀU' } = {}) {
  const { THREE, scene, M, std, box, cyl, mesh, plaque, ROUND_OBSTACLES, BR, bridgeZ } = ctx;
  const [z0, z1] = bridgeZ, zc = (z0 + z1) / 2, len = z1 - z0 + 1.6;
  const red = M.red, tile = std('#9c4a30', { roughness: 0.75 }), woodD = std('#4a2e1a', { roughness: 0.7 });
  const deck = 0.35, postH = 3.4;
  // cột dọc hai bên, xà ngang
  const zs = [];
  for (let z = z0 + 0.5; z <= z1 - 0.4; z += (z1 - z0 - 1) / 4) zs.push(z);
  for (const s of [-1, 1]) {
    for (const z of zs) cyl(0.2, 0.22, postH, red, s * (BR - 0.45), deck + postH / 2, z, {}, 10);
    box(0.25, 0.3, len - 0.6, woodD, s * (BR - 0.45), deck + postH + 0.1, zc);
    box(0.12, 0.7, len - 1.0, woodD, s * (BR - 0.45), deck + 0.9, zc, { cast: false }); // lan can gỗ thấp
  }
  // mái hai dốc
  const span = BR + 0.9, rise = 1.7, L = Math.hypot(span, rise), ang = Math.atan2(rise, span);
  for (const s of [-1, 1]) {
    const slab = box(L + 0.2, 0.2, len + 1.2, tile, s * span / 2, deck + postH + 0.2 + rise / 2, zc);
    slab.rotation.z = -s * ang;
  }
  box(0.5, 0.3, len + 1.2, std('#d9b04e', { metalness: 0.5, roughness: 0.45 }), 0, deck + postH + 0.2 + rise + 0.1, zc);
  // đầu hồi: hai mặt tam giác bằng gỗ, bảng tên chữ nổi
  for (const [z, ry, label] of [[z1 + 0.8, 0, bridgeLabel], [z0 - 0.8, Math.PI, bridgeLabel]]) {
    const tri = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-span, 0), new THREE.Vector2(span, 0), new THREE.Vector2(0, rise)])), woodD);
    tri.position.set(0, deck + postH + 0.15, z);
    tri.rotation.y = ry;
    scene.add(tri);
    plaque(scene, label, 0, deck + postH - 0.45, z + (ry === 0 ? 0.25 : -0.25), 3.0, 0.55, ry, { size: 80 });
  }
  // miếu nhỏ giữa cầu (sát lan can phía đông): ba vách gỗ và bàn thờ
  const mx = BR - 1.3, mz = zc;
  if (shrine) {
  box(0.18, 2.4, 2.6, woodD, mx + 0.9, deck + 1.2, mz);
  box(1.8, 2.4, 0.18, woodD, mx, deck + 1.2, mz - 1.3);
  box(1.8, 2.4, 0.18, woodD, mx, deck + 1.2, mz + 1.3);
  box(0.9, 0.6, 1.2, std('#7a1f1a'), mx + 0.35, deck + 0.3, mz); // bàn thờ
  mesh(new THREE.SphereGeometry(0.22, 12, 10), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), mx + 0.35, deck + 0.9, mz);
  ROUND_OBSTACLES.push({ x: mx + 0.2, z: mz, r: 1.35 });
  }
  // tượng chó (đầu nam) và khỉ (đầu bắc) ngồi hai bên đường vào cầu
  const sit = (x, z, ry, dog) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const stone = M.stone;
    const add = (geo, px, py, pz) => { const m = new THREE.Mesh(geo, stone); m.position.set(px, py, pz); m.castShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(0.9, 0.3, 0.9), 0, 0.15, 0);
    add(new THREE.BoxGeometry(0.55, 0.7, 0.7), 0, 0.65, -0.05);
    add(new THREE.SphereGeometry(0.3, 12, 10), 0, 1.15, 0.12);
    if (dog) { add(new THREE.ConeGeometry(0.1, 0.3, 6), -0.17, 1.45, 0.05); add(new THREE.ConeGeometry(0.1, 0.3, 6), 0.17, 1.45, 0.05); add(new THREE.BoxGeometry(0.2, 0.2, 0.3), 0, 1.08, 0.38); }
    else { add(new THREE.SphereGeometry(0.1, 8, 6), -0.3, 1.2, 0.1); add(new THREE.SphereGeometry(0.1, 8, 6), 0.3, 1.2, 0.1); add(new THREE.BoxGeometry(0.4, 0.15, 0.3), 0, 1.02, 0.35); }
    scene.add(g);
  };
  if (animals) for (const s of [-1, 1]) { sit(s * (BR + 0.9), z1 + 1.2, 0, true); sit(s * (BR + 0.9), z0 - 1.2, Math.PI, false); }
}

// ───────────── Giác Viên: tượng gỗ thếp vàng (hàng trăm pho tượng nhỏ) ─────────────
// Vẽ nhiều pho tượng ngồi bằng InstancedMesh (3 khối: đài sen, thân, đầu) cho nhẹ.
// list: [x, y, z, tỉ lệ, góc quay quanh trục y]
function figureField(ctx, list, { color = '#d9b04e', metal = 0.55 } = {}) {
  const { THREE, scene, std } = ctx;
  const gold = std(color, { metalness: metal, roughness: 0.45 });
  const dark = std('#8a5a2a', { roughness: 0.7 });
  const parts = [
    [new THREE.CylinderGeometry(0.34, 0.4, 0.12, 12), dark, 0.06],
    [new THREE.CylinderGeometry(0.15, 0.3, 0.52, 10), gold, 0.38],
    [new THREE.SphereGeometry(0.15, 10, 8), gold, 0.78],
    [new THREE.SphereGeometry(0.06, 8, 6), gold, 0.96],
  ];
  const o = new THREE.Object3D();
  for (const [geo, mat, dy] of parts) {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, y, z, s, ry], i) => {
      o.position.set(x, y + dy * s, z);
      o.rotation.set(0, ry, 0);
      o.scale.setScalar(s);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    im.castShadow = false;
    scene.add(im);
  }
}

// Kệ gỗ hai bên trong chánh điện, mỗi bên hai tầng tượng gỗ thếp vàng quay vào giữa điện
export function woodStatueHall(ctx) {
  const { box, std, HALL } = ctx;
  const wood = std('#5b3a24', { roughness: 0.7 });
  const list = [];
  const zA = HALL.z0 - 3.8, zB = HALL.z1 + 3.4;
  for (const s of [-1, 1]) {
    const x = s * (HALL.hx - 0.65);
    for (const [y, tier] of [[1.15, 0], [2.3, 1]]) {
      box(0.6, 0.1, zA - zB + 1.2, wood, x, HALL.y + 0.25 + y, (zA + zB) / 2);
      for (let z = zA; z >= zB; z -= 0.95) list.push([x, HALL.y + 0.25 + y + 0.05, z, 0.62, s < 0 ? Math.PI / 2 : -Math.PI / 2]);
    }
    box(0.12, 2.6, zA - zB + 1.2, wood, x + (s < 0 ? -0.34 : 0.34), HALL.y + 0.25 + 1.5, (zA + zB) / 2, { cast: false });
  }
  figureField(ctx, list);
}

// Nhà tượng gỗ: mái cong, hai tầng kệ dọc vách sau, hơn hai chục pho tượng nhìn ra sân
export function statueHouse(ctx, key) {
  const { THREE, scene, K, M, std, box, cyl, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const dir = x < 0 ? 1 : -1; // hướng về giữa sân
  const wood = std('#5b3a24', { roughness: 0.7 });
  box(7.6, 0.5, 10.6, M.stoneD, x, 0.25, z);
  for (const px of [-3.2, 3.2]) for (const pz of [-4.7, 0, 4.7]) cyl(0.22, 0.25, 3.6, M.red, x + px, 0.5 + 1.8, z + pz, {}, 10);
  box(0.3, 3.4, 10.4, wood, x - dir * 3.35, 0.5 + 1.7, z);
  for (const s of [-1, 1]) box(7.2, 0.3, 0.3, M.red, x, 4.0, z + s * 4.8);
  box(7.4, 0.3, 10.6, M.red, x, 4.1, z);
  const list = [];
  for (const y of [1.1, 2.4]) {
    box(1.0, 0.12, 9.4, wood, x - dir * 2.75, 0.5 + y, z);
    for (let zz = -4.2; zz <= 4.2; zz += 0.95) list.push([x - dir * 2.75, 0.5 + y + 0.06, z + zz, y > 2 ? 0.8 : 0.9, dir > 0 ? Math.PI / 2 : -Math.PI / 2]);
  }
  figureField(ctx, list);
  curvedRoof(scene, x, 4.25, z, 4.7, 6.1, 1.4, 2.6, { lift: 0.75 });
  plaque(scene, 'NHÀ TƯỢNG GỖ', x + dir * 3.9, 3.2, z, 3.0, 0.5, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { size: 80 });
  K.roofs.push({ minX: x - 6, maxX: x + 6, minZ: z - 7, maxZ: z + 7, lift: 9 });
}

// ───────────── Linh Ứng Bà Nà: tượng Phật Thích Ca lớn trên đài sen cao ─────────────
export function bigBuddha(ctx, key, { scale = 4.4 } = {}) {
  const { THREE, scene, K, M, std, cyl, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const white = M.white;
  cyl(4.8, 5.2, 1.4, white, x, 0.7, z, {}, 36);
  cyl(4.0, 4.4, 1.2, white, x, 2.0, z, {}, 36);
  cyl(3.3, 3.7, 1.0, white, x, 3.1, z, {}, 36);
  for (let i = 0; i < 16; i++) { // cánh sen quanh đài
    const a = (i / 16) * Math.PI * 2;
    const p = mesh(new THREE.ConeGeometry(0.55, 1.7, 6), std('#f3e4ee', { roughness: 0.6 }), x + Math.cos(a) * 3.55, 4.15, z + Math.sin(a) * 3.55);
    p.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
  }
  const b = K.gild(makeThichCa({ stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
  b.position.set(x, 3.6, z);
  b.scale.setScalar(scale);
  b.rotation.y = Math.PI * 0.08 * (x < 0 ? -1 : 1);
  scene.add(b);
  plaque(scene, 'THÍCH CA MÂU NI PHẬT', x + (x < 0 ? 5.6 : -5.6), 1.6, z, 3.2, 0.5, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 80 });
  K.roofs.push({ minX: x - 8, maxX: x + 8, minZ: z - 8, maxZ: z + 8, lift: 24 });
}

// Cầu Vàng: dải cầu vàng uốn cong, nâng đỡ ở giữa bởi hai bàn tay đá khổng lồ nằm hai bên cầu, ngón xoè ra ngoài.
// Dựng ngoài tường phía phải để ngắm từ sân.
export function goldenBridge(ctx, { x0 = 46, x1 = 84, zc = -6, y = 8 } = {}) {
  const { THREE, scene, std } = ctx;
  const rock = std('#9a9386', { roughness: 1, flatShading: true });
  const gold = std('#e2b441', { metalness: 0.5, roughness: 0.4, emissive: '#7a5a10', emissiveIntensity: 0.25 });
  const N = 48, W = 3.0;
  const P = (t) => new THREE.Vector3(x0 + (x1 - x0) * t, y + 0.6 * Math.sin(Math.PI * t), zc + 6 * Math.sin(Math.PI * t));
  const add = (geo, mat, p, ry = 0, rz = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.copy(p); m.rotation.set(0, ry, rz); m.castShadow = true; parent.add(m); return m; };
  for (let i = 0; i < N; i++) {
    const a = P(i / N), b = P((i + 1) / N), d = new THREE.Vector3().subVectors(b, a);
    const len = Math.hypot(d.x, d.z) + 0.05, ry = -Math.atan2(d.z, d.x), mid = a.clone().add(b).multiplyScalar(0.5);
    add(new THREE.BoxGeometry(len, 0.25, W), gold, mid, ry);
    const nrm = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(W / 2);
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(len, 0.07, 0.07), gold, mid.clone().add(nrm.clone().multiplyScalar(s)).add(new THREE.Vector3(0, 1.0, 0)), ry);
      if (i % 3 === 0) add(new THREE.BoxGeometry(0.07, 1.0, 0.07), gold, mid.clone().add(nrm.clone().multiplyScalar(s)).add(new THREE.Vector3(0, 0.5, 0)), ry);
    }
  }
  // hai đầu cầu tựa vào hai tảng đá
  for (const t of [0, 1]) {
    const p = P(t);
    add(new THREE.CylinderGeometry(3.0, 4.2, p.y + 2, 9), rock, new THREE.Vector3(p.x + (t ? 1.5 : -1.5), (p.y - 2) / 2 - 0.2, p.z));
  }
  // hai bàn tay đá ở giữa cầu: một trái một phải, lòng bàn tay ngửa, các ngón xoè ra hai bên (về phía người nhìn)
  const m = P(0.5), HY = m.y - 0.7;
  for (const s of [-1, 1]) {
    const hz = m.z + s * 3.5;
    add(new THREE.CylinderGeometry(3.4, 4.8, HY + 2, 9), rock, new THREE.Vector3(m.x + 1.2, (HY - 2) / 2 - 0.3, hz + s * 0.6));
    const g = new THREE.Group();
    g.position.set(m.x, HY, hz);
    g.rotation.y = s * 0.45; // ngón xoè ra ngoài
    scene.add(g);
    add(new THREE.BoxGeometry(6.0, 1.1, 4.6), rock, new THREE.Vector3(1.2, 0, 0), 0, 0, g);
    for (let f = 0; f < 4; f++) {
      const fz = -1.7 + f * 1.13, len = 5.0 - Math.abs(f - 1.5) * 0.6;
      const fm = add(new THREE.CylinderGeometry(0.42, 0.5, len, 10), rock, new THREE.Vector3(-(1.8 + len / 2 - 0.4), 0.25, fz), 0, 0, g);
      fm.rotation.set(0, 0, Math.PI / 2 - 0.1);
      add(new THREE.SphereGeometry(0.44, 10, 8), rock, new THREE.Vector3(-(1.8 + len - 0.2), 0.75, fz), 0, 0, g);
    }
    const th = add(new THREE.CylinderGeometry(0.5, 0.58, 3.0, 10), rock, new THREE.Vector3(-0.8, 0.2, -s * 2.9), 0, 0, g);
    th.rotation.set(0, -s * 0.6, Math.PI / 2 - 0.3);
  }
}

// ───────────── Chùa Thầy: thủy đình (sân khấu rối nước) trên hồ ─────────────
export function waterStage(ctx, x, z) {
  const { THREE, scene, M, std, box, cyl, plaque } = ctx;
  const wood = std('#6b4528', { roughness: 0.7 }), red = M.red;
  for (const sx of [-2.2, 2.2]) for (const sz of [-1.8, 1.8]) cyl(0.2, 0.22, 1.6, wood, x + sx, -0.2, z + sz, {}, 8); // cọc chống dưới nước
  box(6.0, 0.35, 5.0, wood, x, 0.75, z);
  for (const sx of [-2.6, 2.6]) for (const sz of [-2.1, 2.1]) cyl(0.2, 0.22, 3.4, red, x + sx, 0.9 + 1.7, z + sz, {}, 10);
  box(6.0, 3.0, 0.2, std('#5b1d17'), x, 0.9 + 1.5, z - 2.2); // vách sau (phông đỏ)
  for (const s of [-1, 1]) box(0.2, 2.4, 2.4, wood, x + s * 2.7, 0.9 + 1.2, z - 0.9);
  box(6.2, 0.3, 5.2, red, x, 4.4, z);
  curvedRoof(ctx.scene, x, 4.55, z, 3.6, 3.1, 1.3, 1.6, { lift: 0.75 });
  plaque(scene, 'THỦY ĐÌNH', x, 3.9, z + 2.35, 2.4, 0.5, 0, { size: 80 });
}

// ───────────── Bút Tháp: tháp đá Cửu phẩm liên hoa (chín tầng cánh sen) ─────────────
export function lotusTower(ctx, key, { tiers = 9 } = {}) {
  const { THREE, scene, M, std, cyl, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const stone = std('#a8a196', { roughness: 0.9, flatShading: true }), stoneD = std('#7d776d', { roughness: 0.95 });
  cyl(3.0, 3.3, 0.9, M.stoneD, x, 0.45, z, {}, 24);
  let y = 0.9;
  for (let i = 0; i < tiers; i++) {
    const r = 2.5 - i * 0.2;
    cyl(r * 0.55, r * 0.6, 1.0, stone, x, y + 0.5, z, {}, 16); // thân
    cyl(r, r, 0.18, stoneD, x, y + 1.1, z, {}, 24); // đài
    const n = 12;
    for (let k = 0; k < n; k++) { // cánh sen quanh mỗi tầng
      const a = (k / n) * Math.PI * 2 + (i % 2) * 0.26;
      const p = mesh(new THREE.ConeGeometry(0.28, 0.9, 5), stone, x + Math.cos(a) * r * 0.82, y + 1.45, z + Math.sin(a) * r * 0.82);
      p.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    }
    y += 1.35;
  }
  mesh(new THREE.ConeGeometry(0.5, 1.8, 8), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), x, y + 0.9, z);
  plaque(scene, 'CỬU PHẨM LIÊN HOA', x + (x < 0 ? 3.7 : -3.7), 1.8, z, 2.4, 0.42, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
}

// ───────────── Tây Phương: tượng La Hán gỗ đứng hai bên trong chánh điện ─────────────
export function arhatHall(ctx, { count = 9 } = {}) {
  const { box, std, HALL } = ctx;
  const wood = std('#5b3a24', { roughness: 0.7 });
  const list = [];
  const zA = HALL.z0 - 3.4, step = (zA - (HALL.z1 + 3.4)) / (count - 1);
  for (const s of [-1, 1]) {
    const x = s * (HALL.hx - 1.1);
    box(1.4, 0.35, zA - HALL.z1 - 5.4 + 1.2, wood, x, HALL.y + 0.25 + 0.17, (zA + HALL.z1 + 3.4) / 2);
    for (let i = 0; i < count; i++) list.push([x, HALL.y + 0.25 + 0.35, zA - i * step, 1.5 + (i % 3) * 0.12, s < 0 ? Math.PI / 2 : -Math.PI / 2]);
  }
  figureField(ctx, list, { color: '#8a5a32', metal: 0.1 });
}

// ───────────── Chùa Hương: thuyền chở khách trên suối Yến ─────────────
// Mỗi thuyền lướt chầm chậm qua lại trong khoảng nước hai bên cầu, người chèo đội nón lá.
export function yenBoats(ctx, { count = 6, z0 = 21.4, z1 = 28.6 } = {}) {
  const { THREE, scene, K, std } = ctx;
  const hullM = std('#7a5a36', { roughness: 0.8 }), hatM = std('#e6d3a0', { roughness: 0.9 }), cloth = [std('#6a7f55'), std('#a8532f'), std('#4d6a8a'), std('#8a6a9a')];
  const boats = [];
  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.34, 1.05), hullM);
    hull.position.y = 0.12;
    g.add(hull);
    for (const s of [-1, 1]) { // mũi và lái vút lên
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.95), hullM);
      e.position.set(s * 1.85, 0.3, 0);
      e.rotation.z = -s * 0.45;
      g.add(e);
    }
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.7, 8), cloth[i % cloth.length]);
    body.position.set(-1.0, 0.65, 0);
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), std('#d9b48a'));
    head.position.set(-1.0, 1.15, 0);
    g.add(head);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.26, 12), hatM);
    hat.position.set(-1.0, 1.33, 0);
    g.add(hat);
    const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 5), hullM);
    oar.position.set(-1.0, 0.45, 0.8);
    oar.rotation.x = 1.0;
    g.add(oar);
    // khách ngồi giữa thuyền
    const guest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), cloth[(i + 1) % cloth.length]);
    guest.position.set(0.5, 0.5, 0);
    g.add(guest);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    const left = i % 2 === 0;
    const c = left ? -14 - (i % 3) * 3 : 14 + (i % 3) * 3;
    const z = z0 + (i / (count - 1)) * (z1 - z0);
    boats.push({ g, c, z, A: 7, ph: i * 1.3, w: 0.16 + (i % 3) * 0.02 });
    scene.add(g);
  }
  K.updaters.push((t) => {
    for (const b of boats) {
      const a = t * b.w + b.ph;
      b.g.position.set(b.c + Math.sin(a) * b.A, 0.12 + Math.sin(t * 1.4 + b.ph) * 0.03, b.z + Math.sin(a * 0.7) * 0.5);
      b.g.rotation.y = Math.cos(a) >= 0 ? 0 : Math.PI;
      b.g.rotation.z = Math.sin(t * 1.1 + b.ph) * 0.02;
    }
  });
}

// ───────────── Chùa Hương: cửa động Hương Tích (khối đá có vòm tối, tượng Phật nhỏ bên trong) ─────────────
export function caveMouth(ctx, key) {
  const { THREE, scene, K, std, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const rock = std('#8e978a', { roughness: 1, flatShading: true }), rockD = std('#6f786c', { roughness: 1, flatShading: true });
  const dark = std('#0b0907', { roughness: 1 });
  const add = (geo, mat, px, py, pz, sx = 1, sy = 1, sz = 1, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.rotation.y = ry; m.castShadow = true; scene.add(m); return m; };
  // khối núi đá bao quanh cửa động
  const D = new THREE.DodecahedronGeometry(1, 0);
  add(D, rock, x, 2.6, z - 1.8, 5.2, 3.6, 3.8, 0.3);
  add(D, rockD, x - 3.4, 1.8, z - 0.8, 2.8, 2.6, 2.6, 1.1);
  add(D, rockD, x + 3.4, 1.8, z - 0.8, 2.8, 2.6, 2.6, 2.1);
  add(D, rock, x - 1.6, 4.6, z - 2.0, 3.0, 2.2, 2.4, 0.6);
  add(D, rock, x + 1.8, 4.4, z - 2.2, 2.6, 2.0, 2.2, 1.6);
  add(D, rock, x, 5.6, z - 2.6, 2.0, 1.4, 1.6, 0.9);
  // vòm cửa động
  add(new THREE.BoxGeometry(2.8, 2.6, 2.6), dark, x, 1.3, z + 0.6);
  const arch = add(new THREE.CylinderGeometry(1.4, 1.4, 2.6, 16, 1, false, -Math.PI / 2, Math.PI), dark, x, 2.6, z + 0.6);
  arch.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) add(D, rock, x + s * 1.9, 1.2, z + 1.8, 0.9, 1.3, 0.9, s); // trụ đá hai bên cửa
  add(D, rock, x, 4.1, z + 1.6, 2.2, 0.7, 1.0, 0.4); // đá đỉnh vòm
  for (let i = -3; i <= 3; i++) { // nhũ đá rủ xuống mép vòm
    const h = 0.4 + (((i * 7) % 3) + 3) % 3 * 0.18;
    const c = add(new THREE.ConeGeometry(0.1, h, 5), rockD, x + i * 0.36, 3.75 - Math.abs(i) * 0.14 - h / 2, z + 1.85);
    c.rotation.z = Math.PI;
  }
  // tượng Phật nhỏ phát sáng trong động
  const gold = std('#e0b64a', { metalness: 0.5, roughness: 0.4, emissive: '#8a6212', emissiveIntensity: 0.6 });
  add(new THREE.CylinderGeometry(0.5, 0.6, 0.18, 12), gold, x, 0.1, z - 0.2);
  add(new THREE.CylinderGeometry(0.22, 0.45, 0.8, 10), gold, x, 0.6, z - 0.2);
  add(new THREE.SphereGeometry(0.22, 10, 8), gold, x, 1.15, z - 0.2);
  plaque(scene, 'HƯƠNG TÍCH ĐỘNG', x, 4.6, z + 2.3, 3.2, 0.52, 0, { size: 80 });
  K.roofs.push({ minX: x - 6, maxX: x + 6, minZ: z - 6, maxZ: z + 4, lift: 8 });
}

// ───────────── Hoa Yên: cây tùng cổ, vườn tháp Huệ Quang, biển mây ─────────────
export function ancientPine(ctx, key) {
  const { THREE, scene, std, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const bark = std('#4e3a28', { roughness: 1, flatShading: true }), leaf = std('#3f6a3a', { roughness: 0.9, flatShading: true }), leaf2 = std('#4c7c42', { roughness: 0.9, flatShading: true });
  const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = true; scene.add(m); return m; };
  add(new THREE.CylinderGeometry(0.7, 1.1, 3.6, 8), bark, x, 1.8, z).rotation.z = 0.05;
  add(new THREE.CylinderGeometry(0.5, 0.7, 3.4, 8), bark, x + 0.5, 4.9, z).rotation.z = -0.22;
  add(new THREE.CylinderGeometry(0.35, 0.5, 3.0, 8), bark, x - 0.2, 7.8, z + 0.2).rotation.z = 0.18;
  // tán lá xoè từng tầng như thông cổ thụ
  for (const [dx, dy, dz, r, m] of [[0.2, 9.6, 0.2, 2.6, leaf], [-2.8, 6.4, 0.6, 2.6, leaf2], [3.0, 7.0, -0.8, 2.8, leaf], [0.6, 5.0, 2.8, 2.2, leaf2], [-1.6, 8.0, -2.2, 2.4, leaf2]]) {
    const b = add(new THREE.IcosahedronGeometry(r, 1), m, x + dx, dy, z + dz);
    b.scale.set(1.25, 0.55, 1.25);
  }
  for (const [dx, dy, a] of [[-1.5, 5.2, 0.9], [1.6, 6.4, -0.9], [-0.9, 7.2, 0.5]]) { // cành ngang
    add(new THREE.CylinderGeometry(0.16, 0.28, 3.0, 6), bark, x + dx, dy, z).rotation.z = Math.PI / 2 - a * 0.3;
  }
  add(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 10), std('#7d776d', { roughness: 1 }), x, 0.15, z);
  plaque(scene, 'TÙNG CỔ', x + (x < 0 ? 2.4 : -2.4), 1.4, z, 1.4, 0.34, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
}

// Vườn tháp: nhiều tháp gạch nhỏ nhiều tầng quây quanh một tháp chính (như vườn tháp tổ trên Yên Tử)
export function stupaGarden(ctx, key, { label = 'THÁP HUỆ QUANG' } = {}) {
  const { THREE, scene, M, std, box, mesh, plaque } = ctx;
  const { x, z } = slotOf(ctx, key);
  const brick = std('#8c6a4a', { roughness: 0.95 }), ledge = std('#6a4a32', { roughness: 0.95 });
  const gold = std('#d9b04e', { metalness: 0.6, roughness: 0.4 });
  const one = (px, pz, tiers, w0) => {
    box(w0 + 1.0, 0.5, w0 + 1.0, M.stoneD, px, 0.25, pz);
    let y = 0.5;
    for (let i = 0; i < tiers; i++) {
      const w = w0 * (1 - i * 0.11);
      box(w, 1.15, w, brick, px, y + 0.575, pz);
      box(w + 0.35, 0.16, w + 0.35, ledge, px, y + 1.23, pz);
      y += 1.31;
    }
    mesh(new THREE.ConeGeometry(w0 * 0.3, 1.4, 4).rotateY(Math.PI / 4), ledge, px, y + 0.7, pz);
    mesh(new THREE.ConeGeometry(0.12, 0.9, 6), gold, px, y + 1.8, pz);
  };
  one(x, z, 6, 2.2);
  one(x - 3.2, z + 1.8, 4, 1.6); one(x + 3.2, z + 1.8, 4, 1.6);
  one(x - 2.8, z - 2.6, 3, 1.4); one(x + 2.8, z - 2.6, 3, 1.4);
  plaque(scene, label, x, 1.5, z + 4.4, 2.6, 0.42, 0, { size: 76 });
}

// Biển mây: những cụm mây trắng trôi chậm quanh chùa trên núi cao
export function cloudSea(ctx, { n = 16, minX = 32, maxX = 60, z0 = -30, z1 = 45, y0 = 1.5, y1 = 7 } = {}) {
  const { THREE, scene, K } = ctx;
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.82, flatShading: true });
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    for (const [dx, dy, dz, r] of [[0, 0, 0, 3.2], [2.8, -0.3, 0.6, 2.4], [-2.6, -0.2, -0.5, 2.6], [0.8, 0.9, -0.8, 2.0]]) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
      m.position.set(dx, dy, dz);
      m.scale.y = 0.6;
      g.add(m);
    }
    const side = i % 2 ? 1 : -1;
    const bx = side * (minX + (((i * 37) % 100) / 100) * (maxX - minX));
    g.position.set(bx, y0 + (((i * 53) % 100) / 100) * (y1 - y0), z0 + (((i * 29) % 100) / 100) * (z1 - z0));
    puffs.push({ g, bx, ph: i * 0.9, y: g.position.y });
    scene.add(g);
  }
  K.updaters.push((t) => {
    for (const p of puffs) { p.g.position.x = p.bx + Math.sin(t * 0.05 + p.ph) * 5; p.g.position.y = p.y + Math.sin(t * 0.2 + p.ph) * 0.3; }
  });
}
