// Chùa sân vườn (miền Trung, Tây Nguyên): cổng tam quan, phía trước có hồ sen / sông nhỏ / hai hồ, sân giữa có lư hương, hai bên sân đặt
// gác chuông, bảo tháp, tháp nhỏ, cây bồ đề hoặc tượng Phật lớn, cuối sân là chánh điện và đồi núi phía sau. Mỗi chùa một file riêng chỉ khai báo.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, gateWalk, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

const GATE_Z = 42;
const YARD = { x0: -28, x1: 28, z0: -34, z1: 39 };
const SLOT = { L: [-20, 5], R: [20, 5], RL: [-21, -14], RR: [21, -14] };
const SLOT_R = { bell: 3.9, tower: 3.0, stupa: 1.8, bodhi: 1.7, statue: 3.4 };
const SLOT_NAME = { bell: 'Gác chuông', tower: 'Bảo tháp', stupa: 'Tháp nhỏ', bodhi: 'Cây bồ đề', statue: 'Tượng Phật lớn' };
const CENTER = { x: 0, z: 6 };

// cfg: { id, name, plaque, front: 'ponds'|'pond'|'river'|'none', riverName, slots: {L,R,RL,RR}, wall, sky, ground, hill:{h,color}, trees:'pine'|'forest'|'palm',
//        loading, hint, info, says, tips }
export function makeYardSite(cfg) {
  const HALL = { x: 0, z0: -2, z1: -20, hx: 10, y: 0, plaque: cfg.plaque, wallH: 5.4 };
  const front = cfg.front || 'ponds';
  const slots = Object.entries(cfg.slots || {}).map(([k, type]) => ({ key: k, type, x: SLOT[k][0], z: SLOT[k][1] }));

  // nước phía trước và cầu
  let waters = [], BR = 0, bridgeZ = null, behindZ = HALL.z0 + 0.6, topZ = 12.6;
  const WALK_AREAS = [rect(-44, 44, GATE_Z + 4.2, 58), ...gateWalk(0, GATE_Z)];
  if (front === 'ponds') {
    waters = [{ x0: -13, x1: -4.5, z0: 14, z1: 30 }, { x0: 4.5, x1: 13, z0: 14, z1: 30 }];
    WALK_AREAS.push(rect(YARD.x0 + 1, YARD.x1 - 1, 31.2, GATE_Z - 4.4), rect(YARD.x0 + 1, -14.4, HALL.z0 + 0.6, 32), rect(14.4, YARD.x1 - 1, HALL.z0 + 0.6, 32),
      rect(-4, 4, HALL.z0 + 0.6, 32), rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, 12.6));
  } else if (front === 'pond') {
    waters = [{ x0: -13, x1: 13, z0: 16, z1: 32 }];
    BR = 2.2; bridgeZ = [16, 32];
    WALK_AREAS.push(rect(YARD.x0 + 1, YARD.x1 - 1, 33.2, GATE_Z - 4.4), rect(YARD.x0 + 1, -14.4, HALL.z0 + 0.6, 33.6), rect(14.4, YARD.x1 - 1, HALL.z0 + 0.6, 33.6),
      rect(-BR, BR, 14.4, 33.6), rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, 14.6));
  } else if (front === 'river') {
    waters = [{ x0: -28, x1: 28, z0: 20, z1: 30 }];
    BR = 3; bridgeZ = [20, 30];
    WALK_AREAS.push(rect(YARD.x0 + 1, YARD.x1 - 1, 31.2, GATE_Z - 4.4), rect(-BR, BR, 18.4, 31.6), rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, 18.8));
  } else {
    WALK_AREAS.push(rect(YARD.x0 + 1, YARD.x1 - 1, HALL.z0 + 0.6, GATE_Z - 4.4));
  }
  WALK_AREAS.push(
    rect(YARD.x0 + 1, -HALL.hx - 1.2, YARD.z0 + 1, HALL.z0 + 0.9), rect(HALL.hx + 1.2, YARD.x1 - 1, YARD.z0 + 1, HALL.z0 + 0.9),
    rect(YARD.x0 + 1, YARD.x1 - 1, YARD.z0 + 1, HALL.z1 - 1.4), ...hallWalk(HALL));

  const slotR = (s) => (s.type === 'custom' ? cfg.custom[s.key].r : SLOT_R[s.type]);
  const slotName = (s) => (s.type === 'custom' ? cfg.custom[s.key].name : SLOT_NAME[s.type]);
  const standOff = (s) => (s.type === 'custom' ? Math.max(5.5, cfg.custom[s.key].r + 1) : 5.5); // đứng ngắm cách vật bao xa
  // chỗ đứng ngắm: ô phía sau (RL, RR) sát tường chánh điện nên đứng phía trước nhìn lùi; ô hai bên đứng phía trong sân nhìn ra
  const stand = (s) => (s.key === 'RL' || s.key === 'RR'
    ? { x: s.x, z: s.z + standOff(s) + 1.2, ry: Math.PI }
    : { x: s.x + (s.x < 0 ? standOff(s) : -standOff(s)), z: s.z, ry: s.x < 0 ? -Math.PI / 2 : Math.PI / 2 });
  const slotLabel = (s) => (s.type === 'custom' ? cfg.custom[s.key].label || cfg.custom[s.key].name : SLOT_NAME[s.type]);
  const ROUND_OBSTACLES = [...slots.map((s) => ({ x: s.x, z: s.z, r: slotR(s) })), { x: CENTER.x, z: CENTER.z, r: 1.1 }];
  const RITUALS = [
    { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.8 }, merit: { x: HALL.hx - 2.6, z: HALL.z1 + 3.6 }, face: { x: 0, y: 3.2, z: HALL.z1 + 1.7 } },
    { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 4, z: HALL.z0 } },
  ];
  for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

  const groundY = (x, z) => {
    if (inHall(HALL, x, z)) return 0.25;
    if (Math.abs(x) < 14 && Math.abs(z - GATE_Z) < 3) return 0.3;
    return 0;
  };
  let hillAt = () => -1;
  const hill = cfg.hill || { h: 20, color: '#5f7f48' };

  function build(renderer, { quality = 'high' } = {}) {
    const K = createKit(renderer, { quality, skyTop: cfg.sky?.[0] || '#86b9de', skyBottom: cfg.sky?.[1] || '#eaece4', fog: [130, 600], fogColor: 0xdfe5de });
    const { scene, M, std, mesh, box, cyl, group, floor, plaque, pickables, lods } = K;
    const wallC = std(cfg.wall || '#ecd9a2', { roughness: 0.85 });
    const darkWood = std('#5b3a24', { roughness: 0.6 });

    // ---------- Đất, đồi núi, cây ----------
    {
      const land = mesh(new THREE.BoxGeometry(700, 2, 700), [M.stoneD, M.stoneD, std(cfg.ground || '#80a05e'), M.stoneD, M.stoneD, M.stoneD], 0, -1.02, -30, { cast: false });
      land.userData.kind = 'ground';
      pickables.push(land);
      floor(-48, 48, GATE_Z + 3, 56, 0, 'tile', { tile: 2.5, macro: 0.04, tint: '#e8e0d0' });
      floor(YARD.x0, YARD.x1, YARD.z0, GATE_Z + 3, 0, 'slab', { tile: 5.5, macro: 0.05 });
      const h = hill.h;
      hillAt = makeHill(K, 0, -110, [[0, h], [30, h - 2], [62, h * 0.42], [95, 2], [130, -1]], { color: hill.color, clip: { x0: -46, x1: 46, z0: -38, z1: 58, floor: groundY } });
      const lift = ([x, z]) => [x, z, Math.max(0, hillAt(x, z)) - 0.2];
      const far = [...K.scatter(-130, 130, -160, -50, 70), ...K.scatter(-100, -34, -50, 50, 40), ...K.scatter(34, 100, -50, 50, 40)].map(lift);
      if (cfg.trees === 'palm') {
        K.palms([...K.scatter(-80, -34, -30, 52, 24), ...K.scatter(34, 80, -30, 52, 24)]);
        K.forest(far, 0, { scale: 1.1 });
      } else if (cfg.trees === 'forest') {
        K.forest(far, 0, { scale: 1.2 });
        K.forest([[-25, 30], [25, 30], [-25, -14], [25, -26]]);
      } else {
        K.pines(far, 0, { scale: 1.1 });
        K.pines([[-25, 30], [25, 30], [-25, -14], [25, -26]]);
      }
    }

    // ---------- Cổng, tường ----------
    K.gate3(0, GATE_Z, cfg.plaque, { walls: 12, wall: wallC });
    for (const s of [-1, 1]) {
      box(0.6, 2.6, GATE_Z - YARD.z0, wallC, s * (YARD.x1 + 0.3), 1.3, (GATE_Z + YARD.z0) / 2);
      K.lion(s * 4.2, 0, GATE_Z + 3.4);
    }
    box(YARD.x1 - YARD.x0, 2.6, 0.6, wallC, 0, 1.3, YARD.z0 - 0.3);

    // ---------- Nước phía trước, cầu đá ----------
    {
      const pad = std('#3f7d3a', { roughness: 0.8, side: THREE.DoubleSide }), pink = std('#f2a6bd', { roughness: 0.6 });
      for (const P of waters) {
        const cx = (P.x0 + P.x1) / 2, w = P.x1 - P.x0;
        for (const z of [P.z0 - 0.3, P.z1 + 0.3]) {
          if (BR) {
            const seg = w / 2 - BR;
            for (const s of [-1, 1]) box(seg + 0.6, 0.8, 0.5, M.stone, s * (BR + seg / 2), 0.4, z);
          } else box(w + 1, 0.8, 0.5, M.stone, cx, 0.4, z);
        }
        if (front !== 'river') for (const x of [P.x0 - 0.3, P.x1 + 0.3]) box(0.5, 0.8, P.z1 - P.z0 + 1.1, M.stone, x, 0.4, (P.z0 + P.z1) / 2);
        K.water(P.x0, P.x1, P.z0, P.z1, 0.1, { color: front === 'river' ? '#3d7a86' : '#3f7578' });
        if (front === 'river') {
          for (let i = 0; i < 5; i++) mesh(new THREE.DodecahedronGeometry(0.7 + K.rr() * 0.5, 0), M.stoneD, P.x0 + 4 + K.rr() * (w - 8), 0.3, P.z0 + 1.5 + K.rr() * (P.z1 - P.z0 - 3));
        } else {
          for (let i = 0; i < (front === 'pond' ? 28 : 18); i++) {
            const x = P.x0 + 1 + K.rr() * (w - 2), z = P.z0 + 1 + K.rr() * (P.z1 - P.z0 - 2);
            if (BR && Math.abs(x) < BR + 0.8) continue;
            mesh(new THREE.CircleGeometry(0.45, 10).rotateX(-Math.PI / 2), pad, x, 0.13, z, { cast: false });
            if (i % 3 === 0) mesh(new THREE.ConeGeometry(0.15, 0.3, 7), pink, x + 0.15, 0.3, z);
          }
        }
      }
      if (BR) {
        const [z0, z1] = bridgeZ, len = z1 - z0 + 1.2, zc = (z0 + z1) / 2;
        const br = box(BR * 2, 0.35, len, M.stoneD, 0, 0.17, zc);
        br.userData.kind = 'ground';
        pickables.push(br);
        for (const s of [-1, 1]) {
          box(0.3, 0.7, len, M.stone, s * (BR - 0.15), 0.7, zc);
          for (let z = z0; z <= z1; z += 4) cyl(0.18, 0.2, 1.0, M.stone, s * (BR - 0.15), 0.9, z, {}, 8);
        }
      }
    }

    // ---------- Chánh điện ----------
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z - 0.2);
      b.scale.setScalar(1.45);
      scene.add(b);
      lods.push({ obj: b, z });
    }, { wallMat: wallC, colMat: darkWood, light: 8 });

    // ---------- Các vật bố trí hai bên sân ----------
    const bells = [];
    const gold = std('#d9b04e', { metalness: 0.6, roughness: 0.4 });
    for (const s of slots) {
      const { x, z, type } = s;
      if (type === 'bell') bells.push(K.bellPavilion(x, z, 0));
      else if (type === 'tower') {
        box(6.4, 0.9, 6.4, M.stoneD, x, 0.45, z);
        for (let i = 0; i < 5; i++) {
          const w = 4.4 - i * 0.55, y0 = 0.9 + i * 2.6;
          box(w, 1.6, w, M.wall, x, y0 + 0.8, z);
          mesh(new THREE.ConeGeometry(w * 1.15, 1.0, 4).rotateY(Math.PI / 4), M.red, x, y0 + 2.1, z);
        }
        mesh(new THREE.ConeGeometry(0.3, 1.8, 8), gold, x, 15.2, z);
        plaque(scene, 'BẢO THÁP', x + (x < 0 ? 3.3 : -3.3), 1.8, z, 1.4, 0.34, x < 0 ? Math.PI / 2 : -Math.PI / 2, { size: 70 });
      } else if (type === 'stupa') {
        box(3.4, 0.8, 3.4, M.stoneD, x, 0.4, z);
        for (let i = 0; i < 3; i++) {
          const w = 2.6 - i * 0.5;
          box(w, 1.4, w, M.stone, x, 1.5 + i * 2.0, z);
          mesh(new THREE.ConeGeometry(w * 0.95, 0.9, 4).rotateY(Math.PI / 4), M.red, x, 2.6 + i * 2.0, z);
        }
        mesh(new THREE.ConeGeometry(0.28, 1.2, 8), gold, x, 7.9, z);
      } else if (type === 'bodhi') {
        const bark = std('#5a4631', { roughness: 0.95 }), leaf = std('#4f8a3c', { roughness: 0.85 }), leaf2 = std('#5f9c46', { roughness: 0.85 });
        cyl(0.8, 1.15, 4.5, bark, x, 2.25, z, {}, 10);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          const br = cyl(0.25, 0.4, 3, bark, x + Math.cos(a), 5.2, z + Math.sin(a), {}, 6);
          br.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
        }
        for (const [dx, dy, dz, r, m] of [[0, 8.4, 0, 4.2, leaf], [-3.2, 7.4, 0.8, 3.2, leaf2], [3.0, 7.6, -0.6, 3.4, leaf2], [0.4, 7.2, 3.0, 3.0, leaf], [-0.6, 7.6, -3.0, 3.2, leaf]]) {
          mesh(new THREE.IcosahedronGeometry(r, 1), m, x + dx, dy, z + dz);
        }
        box(3.4, 0.3, 3.4, M.stone, x, 0.15, z, { cast: false });
      } else if (type === 'statue') {
        const white = M.white;
        cyl(3.2, 3.6, 1.4, white, x, 0.7, z, {}, 28);
        cyl(2.4, 2.7, 1.0, white, x, 1.9, z, {}, 28);
        const b = K.gild(makeThichCa({ stone: '#f4f1ea' }), { color: '#f4f1ea', stone: true });
        b.position.set(x, 2.4, z);
        b.scale.setScalar(2.4);
        b.rotation.y = Math.PI * 0.08 * (x < 0 ? -1 : 1);
        scene.add(b);
        K.roofs.push({ minX: x - 6, maxX: x + 6, minZ: z - 6, maxZ: z + 6, lift: 16 });
      }
    }
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) {
      for (let z = 0; z <= 36; z += 9) K.lampPost(s * 17, 0, z);
      K.flagPole(s * 5, 0, 37, 8);
    }
    K.bamboo([[-24, 36, 8], [24, 36, 8]]);

    // chi tiết riêng của từng chùa (tháp, cầu có mái…): file chùa tự dựng, đặt ở slot kiểu 'custom'
    if (cfg.extras) cfg.extras({ K, THREE, scene, M, std, mesh, box, cyl, group, plaque, pickables, slots, ROUND_OBSTACLES, BR, bridgeZ, GATE_Z, YARD, HALL, CENTER, bells });

    const world = K.finish({ rituals: RITUALS });
    if (bells.length) world.bells = bells;
    return world;
  }

  const waterName = front === 'river' ? (cfg.riverName || 'Dòng sông') : front === 'pond' ? 'Hồ sen' : 'Hai hồ sen';
  const bridgeName = cfg.bridgeName || (front === 'river' ? 'Cầu đá qua sông' : 'Cầu đá hồ sen');
  const wz = waters[0] ? waters[0].z1 + 3 : 30;
  const PLACES = [
    { id: 'gate', name: 'Cổng tam quan', x: 0, z: 50, ry: Math.PI },
    ...(waters.length ? [{ id: 'nuoc', name: BR ? bridgeName : waterName, x: 0, z: wz, ry: Math.PI }] : []),
    ...slots.map((s) => ({ id: `v${s.key}`, name: slotName(s), ...stand(s) })),
    ...(cfg.extraPlaces || []),
    { id: 'san', name: 'Sân chùa', x: 0, z: 9, ry: Math.PI },
    { id: 'dien', name: 'Chánh điện', x: 0, z: HALL.z0 + 3, ry: Math.PI },
  ];
  // vị trí đứng ngắm: gác chuông thì đứng phía trước (z + 5,2) như các chùa khác
  for (const p of PLACES) {
    const s = slots.find((q) => `v${q.key}` === p.id);
    if (s && s.type === 'bell') { p.x = s.x; p.z = s.z + 5.2; p.ry = Math.PI; }
  }
  const labels = [['gate', 0, 50, 'Cổng tam quan'], ...(waters.length ? [['nuoc', 0, waters[0].z0 - 2, waterName]] : []), ...slots.map((s) => [`v${s.key}`, s.x, s.z - 5, slotLabel(s)]), ...(cfg.extraLabels || []), ['dien', 0, -12, 'Chánh điện']];
  const TRIPS = [
    { x: 0, z: HALL.z1 + 6.5, spread: 3, act: 'bow', say: 'lạy Phật' },
    { x: CENTER.x, z: CENTER.z + 4.5, spread: 3, act: 'gassho' },
    ...(waters.length ? [{ x: 0, z: wz, spread: 2, ry: Math.PI }] : []),
    ...slots.map((s) => (s.type === 'bell' ? { x: s.x, z: s.z + 5.2, spread: 1, act: 'bell' } : { ...stand(s), spread: 2 })),
    ...(cfg.extraTrips || []),
    { x: 0, z: 48, spread: 20, ry: Math.PI },
  ];

  return {
    id: cfg.id,
    mapId: cfg.mapId || cfg.id,
    name: cfg.name,
    loading: cfg.loading,
    hint: cfg.hint,
    info: cfg.info,
    tips: cfg.tips,
    LAND: 0,
    SPAWN: { x: 0, z: 50, ry: Math.PI },
    WALK_AREAS, ROUND_OBSTACLES, groundY,
    camFloor: (x, z) => Math.max(groundY(x, z), hillAt(x, z)),
    placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
    defaultPlace: 'san',
    PLACE_INFO: {
      dien: { title: 'Thắp nhang trong chánh điện', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong chánh điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
      san: { title: 'Thắp nhang giữa sân chùa', text: 'Bạn sẽ bước tới lư hương đá giữa sân trước điện, chắp tay vái lạy rồi cắm nhang.', done: '' },
    },
    PLACES,
    MAP: {
      box: [-34, -40, 68, 104],
      font: 3.8,
      shapes: [
        { x0: -48, x1: 48, z0: GATE_Z + 3, z1: 56, c: 'm-stone' },
        { x0: YARD.x0, x1: YARD.x1, z0: YARD.z0, z1: GATE_Z, c: 'm-porch' },
        ...waters.map((P) => ({ x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z1, c: 'm-water' })),
        ...(BR ? [{ x0: -BR, x1: BR, z0: bridgeZ[0], z1: bridgeZ[1], c: 'm-stairs' }] : []),
        { x0: -12, x1: 12, z0: GATE_Z - 1.5, z1: GATE_Z + 1.5, c: 'm-hall' },
        { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
        ...slots.map((s) => ({ x: s.x, z: s.z, r: slotR(s) * 0.9, c: s.type === 'bell' ? 'm-corridor' : 'm-statue' })),
      ],
      labels,
    },
    OV: { bounds: { x0: -34, x1: 34, z0: -34, z1: 56 }, dist: 90 },
    TRIPS,
    BOT_SPAWN: [[-24, 24, 34, 40], [-24, 24, -8, -4]],
    BOT_SAYS: cfg.says,
    build,
  };
}
