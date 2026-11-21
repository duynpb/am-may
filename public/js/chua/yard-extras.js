// Chi tiết riêng cho một số chùa sân vườn (gắn vào makeYardSite qua cfg.extras và slot kiểu 'custom').
// Mỗi hàm nhận ngữ cảnh ctx do yard.js đưa vào. (Phỏng theo dáng công trình, không sao chép.)
import { curvedRoof, dragonsOnRidge } from './base.js';

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
export function coveredBridge(ctx) {
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
  for (const [z, ry, label] of [[z1 + 0.8, 0, 'LAI VIỄN KIỀU'], [z0 - 0.8, Math.PI, 'LAI VIỄN KIỀU']]) {
    const tri = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-span, 0), new THREE.Vector2(span, 0), new THREE.Vector2(0, rise)])), woodD);
    tri.position.set(0, deck + postH + 0.15, z);
    tri.rotation.y = ry;
    scene.add(tri);
    plaque(scene, label, 0, deck + postH - 0.45, z + (ry === 0 ? 0.25 : -0.25), 3.0, 0.55, ry, { size: 80 });
  }
  // miếu nhỏ giữa cầu (sát lan can phía đông): ba vách gỗ và bàn thờ
  const mx = BR - 1.3, mz = zc;
  box(0.18, 2.4, 2.6, woodD, mx + 0.9, deck + 1.2, mz);
  box(1.8, 2.4, 0.18, woodD, mx, deck + 1.2, mz - 1.3);
  box(1.8, 2.4, 0.18, woodD, mx, deck + 1.2, mz + 1.3);
  box(0.9, 0.6, 1.2, std('#7a1f1a'), mx + 0.35, deck + 0.3, mz); // bàn thờ
  mesh(new THREE.SphereGeometry(0.22, 12, 10), std('#d9b04e', { metalness: 0.6, roughness: 0.4 }), mx + 0.35, deck + 0.9, mz);
  ROUND_OBSTACLES.push({ x: mx + 0.2, z: mz, r: 1.35 });
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
  for (const s of [-1, 1]) { sit(s * (BR + 0.9), z1 + 1.2, 0, true); sit(s * (BR + 0.9), z0 - 1.2, Math.PI, false); }
}
