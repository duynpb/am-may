// Chùa Vĩnh Nghiêm (TP. Hồ Chí Minh): cổng tam quan gỗ ba tầng mái, sân rộng, tháp Quan Âm bảy tầng bên trái,
// gác chuông treo đại hồng chung bên phải, chánh điện Đại Hùng Bảo Điện trên nền cao có bậc thang lớn, nhà Tổ phía sau.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, curvedRoof, dragonsOnRidge, THREE, rect, stairY, hallWalk, inHall } from './base.js';
import { makeBuddha, makeThichCa } from '../buddha.js';
import { makeQuanAm } from '../quanam.js';

const GATE_Z = 44;
const PLINTH = { x0: -22, x1: 22, z0: -36, z1: -6, y: 3.2 }; // nền cao chánh điện
const STAIR = { x0: -6, x1: 6, zBottom: 2.2, zTop: -6, y0: 0, y1: PLINTH.y };
const HALL = { x: 0, z0: -10, z1: -30, hx: 16, y: PLINTH.y, plaque: 'ĐẠI HÙNG BẢO ĐIỆN', wallH: 6.6 };
const TO = { x: 0, z0: -44, z1: -54, hx: 9, y: 0, plaque: 'TỔ ĐƯỜNG', wallH: 5 };
const TOWER = { x: -27, z: 16, half: 4.4, tiers: 7 };
const BELL = { x: 27, z: 18 };
const CAULDRON = { x: 0, z: 14 };

const WALK_AREAS = [
  rect(-60, 60, 47.5, 56), // vỉa hè trước cổng
  rect(-2.3, 2.3, 39.5, 48.5), // cửa giữa tam quan
  rect(6.6, 9.0, 39.5, 48.5), rect(-9.0, -6.6, 39.5, 48.5), // hai cửa bên
  rect(-41, 41, 1.0, 40.5), // sân trước
  rect(STAIR.x0 + 0.8, STAIR.x1 - 0.8, STAIR.zTop - 0.8, STAIR.zBottom + 0.6), // bậc thang lên chánh điện
  rect(PLINTH.x0 + 1, PLINTH.x1 - 1, HALL.z0 + 0.6, PLINTH.z1 - 0.6), // thềm trước chánh điện
  rect(PLINTH.x0 + 1, -HALL.hx - 0.9, PLINTH.z0 + 0.8, HALL.z0 + 0.9), rect(HALL.hx + 0.9, PLINTH.x1 - 1, PLINTH.z0 + 0.8, HALL.z0 + 0.9), // hai bên điện
  rect(PLINTH.x0 + 1, PLINTH.x1 - 1, PLINTH.z0 + 0.8, HALL.z1 - 0.5), // sau điện (trên nền)
  ...hallWalk(HALL),
  rect(-41, PLINTH.x0 - 1.4, -58, 2), rect(PLINTH.x1 + 1.4, 41, -58, 2), // lối hai bên nền cao
  rect(-41, 41, TO.z0 + 0.6, PLINTH.z0 - 1.4), // sân sau: dải trước nhà Tổ
  rect(-41, -TO.hx - 1.2, -58, PLINTH.z0 - 1.4), rect(TO.hx + 1.2, 41, -58, PLINTH.z0 - 1.4), rect(-41, 41, -58, TO.z1 - 1.4), // quanh nhà Tổ
  ...hallWalk(TO),
];
const ROUND_OBSTACLES = [
  { x: TOWER.x, z: TOWER.z, r: TOWER.half + 1.6 },
  { x: BELL.x, z: BELL.z, r: 3.9 },
  { x: CAULDRON.x, z: CAULDRON.z, r: 2.4 },
];
const RITUALS = [
  { place: 'dien', y: HALL.y + 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 3, z: HALL.z1 + 3.6 }, face: { x: 0, y: HALL.y + 3.4, z: HALL.z1 + 1.7 } },
  { place: 'san', y: 0, stone: true, burner: { x: CAULDRON.x, z: CAULDRON.z + 4.2 }, merit: { x: CAULDRON.x + 3.6, z: CAULDRON.z + 4.0 }, face: { x: 0, y: 2.4, z: CAULDRON.z } },
  { place: 'to', y: TO.y + 0.25, burner: { x: 0, z: TO.z1 + 3.6 }, merit: { x: TO.hx - 2.6, z: TO.z1 + 3.4 }, face: { x: 0, y: 2.8, z: TO.z1 + 1.7 } },
  { place: 'thap', y: 0, stone: true, burner: { x: TOWER.x, z: TOWER.z + TOWER.half + 4.2 }, merit: { x: TOWER.x + 3.4, z: TOWER.z + TOWER.half + 4.0 }, face: { x: TOWER.x, y: 2.4, z: TOWER.z + TOWER.half } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

function groundY(x, z) {
  const s = stairY(STAIR, x, z);
  if (s != null) return s;
  if (x >= PLINTH.x0 && x <= PLINTH.x1 && z >= PLINTH.z0 && z <= PLINTH.z1) return inHall(HALL, x, z) ? HALL.y + 0.25 : HALL.y;
  if (inHall(TO, x, z)) return 0.25;
  if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3; // nền đá cổng
  return 0;
}

function build(renderer, { quality = 'high' } = {}) {
  const K = createKit(renderer, { quality, skyTop: '#78b0dc', skyBottom: '#ece6d4' });
  const { scene, M, std, mesh, box, cyl, group, floor, terrace, stairs, plaque, pickables, updaters, lods } = K;

  // ---------- Mặt đất: phố, vỉa hè, sân chùa ----------
  {
    const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, K.std('#9aa08a'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, 0, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    floor(-70, 70, 47, 58, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' }); // vỉa hè
    const road = mesh(new THREE.PlaneGeometry(400, 14), std('#4a4a4c', { roughness: 0.95 }), 0, 0.01, 65, { cast: false });
    road.rotation.x = -Math.PI / 2;
    for (let x = -190; x < 190; x += 8) box(4, 0.02, 0.25, M.white, x, 0.02, 65, { cast: false });
    floor(-42, 42, -60, 42, 0, 'slab', { tile: 5.5, macro: 0.05 }); // sân chùa
    // dãy nhà phố hai bên và bên kia đường
    const shop = [std('#d9cdb3'), std('#c8b79a'), std('#e3d7c2'), std('#b9a888')];
    for (let i = 0; i < 26; i++) {
      const x = -125 + i * 10, h = 7 + ((i * 37) % 9);
      box(9.4, h, 10, shop[i % 4], x, h / 2, 78, { cast: false });
      box(9.6, 0.4, 1.4, M.wood, x, 3.4, 72.6, { cast: false });
    }
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
      const h = 8 + ((i * 53) % 10);
      box(12, h, 11, shop[(i + 1) % 4], s * (62 + (i % 2) * 14), h / 2, 30 - i * 12, { cast: false });
    }
  }

  // ---------- Tường bao, cổng tam quan gỗ ----------
  {
    const g = group(0, 0, GATE_Z);
    box(28, 0.3, 6, M.stone, 0, 0.15, 0, { parent: g });
    const Y = 0.3;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.42, 0.48, 6.8, M.red, sx * 3.0, Y + 3.4, sz * 1.9, { parent: g }, 16);
    box(7.2, 0.5, 4.6, M.red, 0, Y + 7.0, 0, { parent: g });
    curvedRoof(g, 0, Y + 7.1, 0, 6.6, 4.2, 1.5, 2.2, { lift: 1.0 });
    box(9.0, 2.3, 3.8, M.wall, 0, Y + 9.6, 0, { parent: g });
    plaque(g, 'VĨNH NGHIÊM TỰ', 0, Y + 9.6, 1.97, 4.8, 1.0);
    plaque(g, 'VĨNH NGHIÊM TỰ', 0, Y + 9.6, -1.97, 4.8, 1.0, Math.PI);
    const top = curvedRoof(g, 0, Y + 10.7, 0, 5.8, 3.4, 2.4, 3.0, { lift: 1.2 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, 0, top.rx);
    for (const sx of [-1, 1]) {
      const cx = sx * 7.8;
      for (const dx of [-1.5, 1.5]) for (const sz of [-1, 1]) cyl(0.3, 0.34, 4.6, M.red, cx + dx, Y + 2.3, sz * 1.6, { parent: g }, 14);
      box(3.6, 0.4, 3.8, M.red, cx, Y + 4.75, 0, { parent: g });
      curvedRoof(g, cx, Y + 4.9, 0, 3.0, 2.8, 1.4, 2.0, { lift: 0.8 });
      box(2.6, 3.6, 0.8, M.wall, sx * 4.6, Y + 1.8, 0, { parent: g });
      box(1.6, 3.2, 0.8, M.wall, sx * 9.9, Y + 1.6, 0, { parent: g });
      // tường bao dọc phố rồi quay vào trong
      box(31, 2.8, 0.7, M.yellowWall, sx * 26.2, 1.4, 0, { parent: g });
      box(31.4, 0.22, 1.1, std('#6a3426'), sx * 26.2, 2.9, 0, { parent: g });
    }
    for (const sx of [-1, 1]) {
      box(0.7, 2.8, 104, M.yellowWall, sx * 42.2, 1.4, -8);
      box(1.1, 0.22, 104.4, std('#6a3426'), sx * 42.2, 2.9, -8);
    }
    box(85, 2.8, 0.7, M.yellowWall, 0, 1.4, -60.3);
    K.lion(-4.2, 0, GATE_Z + 3.4);
    K.lion(4.2, 0, GATE_Z + 3.4);
    K.roofs.push({ minX: -11, maxX: 11, minZ: GATE_Z - 3, maxZ: GATE_Z + 3, lift: 13 });
  }

  // ---------- Sân trước: đỉnh hương giữa sân, đèn, cờ, cây cảnh ----------
  {
    const { x: cx, z: cz } = CAULDRON;
    cyl(1.9, 2.1, 0.5, M.stone, cx, 0.25, cz, {}, 32);
    const prof = [[0, 0], [0.9, 0.05], [1.2, 0.45], [1.25, 1.0], [1.1, 1.3], [1.3, 1.4], [1.3, 1.5]].map(([x, y]) => new THREE.Vector2(x, y));
    const pot = mesh(new THREE.LatheGeometry(prof, 32), M.bronze, cx, 1.2, cz);
    pot.material.side = THREE.DoubleSide;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      cyl(0.13, 0.1, 0.75, M.bronze, cx + Math.cos(a) * 0.75, 0.85, cz + Math.sin(a) * 0.75, {}, 8);
    }
    // mái che nhỏ trên đỉnh hương
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.14, 0.16, 3.6, M.red, cx + sx * 1.9, 1.8, cz + sz * 1.9, {}, 10);
    curvedRoof(scene, cx, 3.6, cz, 2.6, 2.6, 1.1, 2.1, { lift: 0.6 });
    for (const s of [-1, 1]) {
      for (let z = 4; z <= 36; z += 8) K.lampPost(s * 13, 0, z);
      K.flagPole(s * 5, 0, 36, 8);
    }
    // chậu cây cảnh dọc lối giữa
    const pot2 = std('#7a4a2c', { roughness: 0.8 });
    for (const s of [-1, 1]) for (let z = 22; z <= 34; z += 6) {
      cyl(0.55, 0.42, 0.6, pot2, s * 4.4, 0.3, z, {}, 12);
      mesh(new THREE.SphereGeometry(0.75, 10, 8), M.leafD, s * 4.4, 1.2, z).scale.set(1.2, 0.7, 1.2);
    }
    // hai hàng cây cổ thụ hai bên sân
    K.forest([[-36, 34], [-36, 24], [36, 34], [36, 6], [-37, -4], [37, -12], [-37, -30], [37, -40], [-30, -56], [30, -56]], 0, { scale: 1.3 });
  }

  // ---------- Tháp Quan Âm bảy tầng ----------
  {
    const g = group(TOWER.x, 0, TOWER.z);
    box(TOWER.half * 2 + 3, 0.6, TOWER.half * 2 + 3, M.stone, 0, 0.3, 0, { parent: g });
    let y = 0.6, half = TOWER.half;
    const doorM = std('#2c1c12', { roughness: 0.8 });
    for (let t = 0; t < TOWER.tiers; t++) {
      const h = t === 0 ? 4.4 : 3.3 - t * 0.12;
      box(half * 2, h, half * 2, M.wall, 0, y + h / 2, 0, { parent: g });
      // cửa vòm đỏ bốn mặt
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        const dg = new THREE.Group();
        dg.rotation.y = a;
        g.add(dg);
        box(1.2, h * 0.55, 0.06, t === 0 ? doorM : M.red, 0, y + h * 0.4, half + 0.03, { parent: dg });
        box(1.6, 0.18, 0.1, M.gold, 0, y + h * 0.72, half + 0.05, { parent: dg, cast: false });
      }
      y += h;
      curvedRoof(g, 0, y - 0.1, 0, half + 1.0, half + 1.0, 0.9, half * 0.55, { lift: 0.7 });
      y += 0.9;
      half -= 0.36;
    }
    // chóp tháp: búp sen, trụ vàng
    cyl(0.5, 0.9, 1.0, M.gold, 0, y + 0.3, 0, { parent: g }, 12);
    mesh(new THREE.SphereGeometry(0.6, 14, 10), M.gold, 0, y + 1.2, 0, { parent: g }).scale.y = 1.2;
    for (let k = 0; k < 4; k++) cyl(0.35 - k * 0.07, 0.4 - k * 0.07, 0.25, M.gold, 0, y + 1.9 + k * 0.35, 0, { parent: g }, 10);
    mesh(new THREE.ConeGeometry(0.16, 1.4, 8), M.gold, 0, y + 3.8, 0, { parent: g });
    plaque(g, 'BẢO THÁP QUAN ÂM', 0, 3.6, TOWER.half + 0.08, 3.4, 0.6, 0, { size: 90 });
    // tượng Quan Âm trước tháp
    const qa = K.gild(makeQuanAm({ quality: quality === 'high' ? 'high' : 'low' }), { color: '#f1ede4', stone: true });
    qa.position.set(TOWER.x, 0.6, TOWER.z + TOWER.half + 0.9);
    qa.scale.setScalar(0.9);
    scene.add(qa);
    lods.push({ obj: qa, x: TOWER.x, z: TOWER.z, r: 90 });
  }

  // ---------- Gác chuông: bốn cột, hai tầng mái, đại hồng chung treo giữa ----------
  const bells = [];
  {
    const g = group(BELL.x, 0, BELL.z);
    box(7.4, 0.4, 7.4, M.stone, 0, 0.2, 0, { parent: g });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.26, 0.3, 5.6, M.red, sx * 2.7, 3.2, sz * 2.7, { parent: g }, 12);
    box(6.2, 0.4, 6.2, M.red, 0, 6.1, 0, { parent: g });
    curvedRoof(g, 0, 6.2, 0, 3.9, 3.9, 1.0, 2.2, { lift: 0.8 });
    box(3.6, 1.4, 3.6, M.wall, 0, 7.8, 0, { parent: g });
    const top = curvedRoof(g, 0, 8.4, 0, 3.0, 3.0, 1.6, 2.6, { lift: 0.9 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, 0, 1.4);
    box(5.6, 0.25, 0.3, M.wood, 0, 5.6, 0, { parent: g });
    plaque(g, 'CHUÔNG', 0, 6.1, 3.15, 1.6, 0.36, 0, { size: 80 });
    // chuông đồng treo (lắc khi thỉnh)
    const bg = new THREE.Group();
    bg.position.set(BELL.x, 5.5, BELL.z);
    scene.add(bg);
    const prof = [[0.05, 0], [0.55, -0.1], [0.75, -0.8], [0.85, -1.9], [1.05, -2.3], [1.0, -2.4], [0, -2.4]].map(([x, y]) => new THREE.Vector2(x, y));
    const bronze = std('#5f4a2a', { metalness: 0.8, roughness: 0.38 });
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), bronze);
    bell.castShadow = true;
    bg.add(bell);
    for (const yy of [-0.9, -1.6]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8 + (yy < -1 ? 0.06 : 0), 0.04, 6, 28).rotateX(Math.PI / 2), bronze);
      ring.position.y = yy;
      bg.add(ring);
    }
    // chày gỗ treo ngang
    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.4, 10).rotateZ(Math.PI / 2), M.wood);
    ram.position.set(-2.2, -1.6, 0);
    bg.add(ram);
    let swing = 0;
    updaters.push((t, dt) => {
      swing = Math.max(0, swing - dt * 0.25);
      bg.rotation.z = Math.sin(t * 2.4) * 0.05 * swing;
      ram.position.x = -2.2 + Math.max(0, Math.sin(Math.min(1, (1 - swing) * 6) * Math.PI)) * 1.2 * (swing > 0.8 ? 1 : 0);
    });
    bells.push({ group: bg, x: BELL.x, z: BELL.z, spot: { x: BELL.x - 0.2, z: BELL.z + 4.4 }, swing: () => (swing = 1) });
    K.roofs.push({ minX: BELL.x - 4, maxX: BELL.x + 4, minZ: BELL.z - 4, maxZ: BELL.z + 4, lift: 12 });
  }

  // ---------- Nền cao, bậc thang lớn, chánh điện ----------
  {
    terrace(PLINTH.x0, PLINTH.x1, PLINTH.z0, PLINTH.z1, 0, PLINTH.y, { side: std('#a59a86', { roughness: 1 }) });
    stairs(STAIR, { base: 0 });
    // lan can đá quanh mép nền (chừa lối bậc thang)
    for (const s of [-1, 1]) {
      box(PLINTH.x1 - STAIR.x1 - 0.4, 0.8, 0.3, M.stone, s * (PLINTH.x1 + STAIR.x1 + 0.4) / 2, PLINTH.y + 0.4, PLINTH.z1 - 0.15);
      box(0.3, 0.8, PLINTH.z1 - PLINTH.z0, M.stone, s * (PLINTH.x1 - 0.15), PLINTH.y + 0.4, (PLINTH.z0 + PLINTH.z1) / 2);
    }
    box(PLINTH.x1 - PLINTH.x0, 0.8, 0.3, M.stone, 0, PLINTH.y + 0.4, PLINTH.z0 + 0.15);
    for (const s of [-1, 1]) K.lion(s * 7.6, 0, STAIR.zBottom + 0.6);
    K.hall(HALL, (y, z) => {
      const tc = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      tc.position.set(0, y, z);
      tc.scale.setScalar(1.7);
      tc.traverse((m) => (m.castShadow = false));
      scene.add(tc);
      lods.push({ obj: tc, z });
      const side = makeBuddha({ quality: 'low' });
      for (const x of [-7, 7]) {
        const b = x < 0 ? side : side.clone();
        b.position.set(x, y, z + 0.3);
        b.scale.setScalar(1.05);
        b.traverse((m) => (m.castShadow = false));
        scene.add(b);
        lods.push({ obj: b, x, z });
      }
    });
    for (const s of [-1, 1]) K.stoneLamp(s * 19, PLINTH.y, -8);
  }

  // ---------- Nhà Tổ phía sau ----------
  {
    K.hall(TO, (y, z) => {
      // ảnh thờ chư Tổ: khung gỗ, ba bài vị
      for (const x of [-2.2, 0, 2.2]) {
        box(1.2, 1.7, 0.12, M.lacquer, x, y + 0.85, z - 0.4);
        box(1.0, 1.5, 0.02, std('#e9dcc0'), x, y + 0.85, z - 0.33, { cast: false });
      }
    }, { twoTier: false, light: 6 });
    K.forest([[-20, -50], [20, -50], [-28, -44], [28, -44]], 0, { scale: 1.1 });
    K.bamboo([[-36, -50, 10], [36, -50, 10]]);
  }

  // ---------- Cây xa: phố có hàng me, dầu ----------
  K.forest([[-50, 52], [-30, 52.5], [30, 52.5], [50, 52], [-70, 52], [70, 52]], 0, { scale: 1.2 });
  K.palms([[-34, 40], [34, 40], [-20, 39.5], [20, 39.5]]);

  const world = K.finish({ rituals: RITUALS });
  world.bells = bells;
  return world;
}

const PLACE_INFO = {
  dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong Đại Hùng Bảo Điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
  san: { title: 'Thắp nhang trước đỉnh hương giữa sân', text: 'Bạn sẽ bước tới lư hương đá trước đỉnh hương giữa sân chùa, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: '' },
  to: { title: 'Thắp nhang trong nhà Tổ', text: 'Bạn sẽ bước tới lư hương trước bàn thờ chư Tổ, chắp tay vái lạy tưởng nhớ các vị Tổ sư rồi cắm nhang.', done: ' dâng chư Tổ' },
  thap: { title: 'Thắp nhang trước tháp Quan Âm', text: 'Bạn sẽ bước tới lư hương đá trước tượng Quan Âm dưới chân tháp bảy tầng, chắp tay vái lạy rồi cắm nhang.', done: ' dâng Quan Âm Bồ Tát' },
};

export const SITE = {
  id: 'vinhnghiem',
  name: 'Chùa Vĩnh Nghiêm',
  loading: 'Đang mở cổng tam quan',
  hint: 'qua cổng tam quan vào sân, lên bậc thang lớn tới chánh điện',
  info: 'Chùa Vĩnh Nghiêm ở TP. Hồ Chí Minh, mang dáng chùa miền Bắc: cổng tam quan gỗ ba tầng mái, tháp Quan Âm bảy tầng, gác chuông treo đại hồng chung, chánh điện Đại Hùng Bảo Điện trên nền cao và nhà Tổ phía sau. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Thỉnh chuông', 'Chạm vào quả chuông lớn ở gác chuông bên phải sân để đi tới thỉnh một hồi.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp ở lư hương trước bàn thờ; ngoài sân thì ở đỉnh hương giữa sân; dưới chân tháp thì dâng Quan Âm; phía sau thì ở nhà Tổ.'],
  ],
  LAND: 0,
  SPAWN: { x: 0, z: 51.5, ry: Math.PI },
  WALK_AREAS, ROUND_OBSTACLES, groundY,
  placeOf(x, z) {
    if (inHall(HALL, x, z)) return 'dien';
    if (z < PLINTH.z0 - 1) return 'to';
    if (Math.hypot(x - TOWER.x, z - TOWER.z) < 14) return 'thap';
    return 'san';
  },
  defaultPlace: 'san',
  PLACE_INFO,
  bowRy: (x, z) => (Math.hypot(x - TOWER.x, z - TOWER.z) < 13 ? Math.atan2(TOWER.x - x, TOWER.z - z) : Math.PI),
  PLACES: [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 51.5, ry: Math.PI },
    { id: 'san', name: 'Sân chùa', x: 0, z: 22, ry: Math.PI },
    { id: 'thap', name: 'Tháp Quan Âm', x: TOWER.x, z: TOWER.z + 10, ry: Math.PI },
    { id: 'chuong', name: 'Gác chuông', x: BELL.x, z: BELL.z + 6, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 2.2, ry: Math.PI },
    { id: 'to', name: 'Nhà Tổ', x: 0, z: TO.z0 + 4, ry: Math.PI },
  ],
  MAP: {
    box: [-50, -64, 100, 128],
    font: 4.6,
    shapes: [
      { x0: -70, x1: 70, z0: 47, z1: 58, c: 'm-stone' },
      { x0: -42, x1: 42, z0: -60, z1: 42, c: 'm-porch' },
      { x0: PLINTH.x0, x1: PLINTH.x1, z0: PLINTH.z0, z1: PLINTH.z1, c: 'm-terrace' },
      { x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.zTop, z1: STAIR.zBottom, c: 'm-stairs' },
      { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
      { x0: -TO.hx, x1: TO.hx, z0: TO.z1, z1: TO.z0, c: 'm-hall' },
      { x0: -12, x1: 12, z0: GATE_Z - 2, z1: GATE_Z + 2, c: 'm-hall' },
      { x0: TOWER.x - TOWER.half, x1: TOWER.x + TOWER.half, z0: TOWER.z - TOWER.half, z1: TOWER.z + TOWER.half, c: 'm-tower' },
      { x0: BELL.x - 3.5, x1: BELL.x + 3.5, z0: BELL.z - 3.5, z1: BELL.z + 3.5, c: 'm-corridor' },
      { x: CAULDRON.x, z: CAULDRON.z, r: 2.2, c: 'm-statue' },
    ],
    labels: [['gate', 0, 54, 'Cổng tam quan'], ['san', 0, 26, 'Sân chùa'], ['thap', TOWER.x, TOWER.z + 9, 'Tháp Quan Âm'], ['chuong', BELL.x, BELL.z + 7, 'Gác chuông'], ['dien', 0, -20, 'Chánh điện'], ['to', 0, -49, 'Nhà Tổ']],
  },
  OV: { bounds: { x0: -50, x1: 50, z0: -60, z1: 58 }, dist: 110 },
  TRIPS: [
    { x: 0, z: HALL.z1 + 6.5, spread: 4, act: 'bow', say: 'lạy Phật' },
    { x: 0, z: CAULDRON.z + 6, spread: 4, act: 'gassho' },
    { x: TOWER.x, z: TOWER.z + 10, spread: 3, act: 'bow', ry: Math.PI },
    { x: 0, z: TO.z0 - 4, spread: 3, act: 'bow' },
    { x: 0, z: 0, act: 'bell' },
    { x: 15, z: 28, spread: 10, ry: 0, say: 'Sân chùa rộng quá' },
    { x: 0, z: -7.5, spread: 12, ry: 0, say: 'Nhìn ra cổng đẹp ghê' },
  ],
  BOT_SPAWN: [[-30, 30, 4, 38], [-18, 18, -9.5, -7]],
  BOT_SAYS: ['Nam mô A Di Đà Phật', 'Tháp cao quá', 'Chùa giữa phố mà yên tĩnh ghê', 'Tiếng chuông ngân xa thật', 'Lên chánh điện lạy Phật thôi'],
  build,
};
