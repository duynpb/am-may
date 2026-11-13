// Chùa trên đảo (Hoàng Sa, Trường Sa Lớn, Song Tử Tây, Núi Một – Côn Đảo): một hòn đảo nhỏ giữa biển, bãi cát trắng, hàng cây phong ba,
// cột cờ Tổ quốc, ngôi chùa nhỏ mái ngói, có thể thêm ngọn hải đăng và bia chủ quyền. Dùng chung một bộ dựng, mỗi đảo một file riêng.
// (Phỏng theo không khí chùa, không sao chép công trình thật.)
import { createKit, THREE, rect, hallWalk, inHall, makeHill } from './base.js';
import { makeThichCa } from '../buddha.js';

// cfg: { id, name, mapId, desc, loading, hint, info, plaque, lighthouse, mount, pagodaName, says, tipsExtra }
export function makeIslandSite(cfg) {
  const HALL = { x: 0, z0: 4, z1: -12, hx: 7.5, y: 0, plaque: cfg.plaque || 'CHÙA', wallH: 4.8 };
  const SAND = { x0: -33, x1: 33, z0: -30, z1: 38 };
  const FLAG = { x: 18, z: 20 };
  const LIGHT = { x: -22, z: 14, r: 2.2 };
  const STONE = { x: -9, z: 24 }; // bia chủ quyền
  const CENTER = { x: 0, z: 14 };

  const WALK_AREAS = [
    rect(SAND.x0, SAND.x1, HALL.z0 + 0.6, SAND.z1),
    rect(SAND.x0, -HALL.hx - 1.2, SAND.z0, HALL.z0 + 0.9), rect(HALL.hx + 1.2, SAND.x1, SAND.z0, HALL.z0 + 0.9),
    rect(SAND.x0, SAND.x1, SAND.z0, HALL.z1 - 1.4),
    ...hallWalk(HALL),
  ];
  const ROUND_OBSTACLES = [
    { x: FLAG.x, z: FLAG.z, r: 1.3 },
    { x: STONE.x, z: STONE.z, r: 1.4 },
    { x: CENTER.x, z: CENTER.z, r: 1.1 },
  ];
  if (cfg.lighthouse) ROUND_OBSTACLES.push({ x: LIGHT.x, z: LIGHT.z, r: LIGHT.r + 0.8 });
  const RITUALS = [
    { place: 'dien', y: 0.25, burner: { x: 0, z: HALL.z1 + 3.4 }, merit: { x: HALL.hx - 2.4, z: HALL.z1 + 3.2 }, face: { x: 0, y: 3, z: HALL.z1 + 1.7 } },
    { place: 'san', y: 0, stone: true, burner: { x: CENTER.x, z: CENTER.z + 1.8 }, merit: { x: CENTER.x + 3.4, z: CENTER.z + 1.6 }, face: { x: 0, y: 3.5, z: HALL.z0 } },
  ];
  for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });

  function groundY(x, z) {
    return inHall(HALL, x, z) ? 0.25 : 0;
  }

  function build(renderer, { quality = 'high' } = {}) {
    const K = createKit(renderer, { quality, skyTop: '#4f9ee0', skyBottom: '#e3eef2', fog: [160, 800], fogColor: 0xdbe9ee });
    const { scene, M, std, mesh, box, cyl, group, plaque, pickables, updaters, lods } = K;
    const wallC = std('#f1e7cf', { roughness: 0.8 });
    const redC = std('#b5261b', { roughness: 0.5 });

    // ---------- Biển, đảo cát, rạn san hô ----------
    {
      K.water(-1200, 1200, -1200, 1200, -0.6, { color: '#1f86a8' });
      // vùng nước nông màu ngọc quanh đảo
      const shallow = mesh(new THREE.CircleGeometry(95, 64), std('#4fc2c4', { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.55 }), 0, -0.5, 4, { cast: false });
      shallow.rotation.x = -Math.PI / 2;
      // đảo: đĩa cát phẳng, mép thoải xuống nước
      const isle = mesh(new THREE.CylinderGeometry(52, 60, 1.6, 56), std('#efe0b4', { roughness: 1 }), 0, -0.8, 4, { cast: false });
      isle.receiveShadow = true;
      const grass = mesh(new THREE.CylinderGeometry(44, 48, 0.1, 48), std('#9bb36a', { roughness: 1 }), 0, 0.0, 4, { cast: false });
      grass.userData.kind = 'ground';
      pickables.push(isle, grass);
      isle.userData.kind = 'ground';
      // lát sân quanh chùa
      K.floor(SAND.x0 + 6, SAND.x1 - 6, SAND.z0 + 4, SAND.z1 - 4, 0.02, 'slab', { tile: 5.5, macro: 0.05 });
      // đá san hô, đá tảng ven đảo
      const coral = std('#cfc7b6', { roughness: 1, flatShading: true });
      for (let i = 0; i < 24; i++) {
        const a = K.rr() * 6.28, r = 50 + K.rr() * 10;
        mesh(new THREE.IcosahedronGeometry(0.8 + K.rr() * 1.4, 0), coral, Math.cos(a) * r, -0.2, 4 + Math.sin(a) * r, { cast: false }).scale.y = 0.6;
      }
      // cây phong ba, bàng vuông, dừa quanh đảo
      const spots = [];
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + K.rr() * 0.2, r = 40 + K.rr() * 4;
        const x = Math.cos(a) * r, z = 4 + Math.sin(a) * r;
        if (Math.abs(x) < 33 && z > SAND.z0 - 4 && z < SAND.z1 + 4 && Math.hypot(x, z - 4) < 43) continue;
        spots.push([x, z]);
      }
      K.palms(spots);
      // thuyền ngư dân neo ngoài khơi
      const hull = std('#3a6fa5', { roughness: 0.7 }), hull2 = std('#d9a43f', { roughness: 0.7 });
      for (const [x, z, ry] of [[70, 40, 0.5], [-76, 10, 2.4], [30, 82, 1.2]]) {
        const b = group(x, -0.4, z, ry, { merge: false });
        box(1.8, 0.8, 6.5, hull, 0, 0.4, 0, { parent: b });
        box(1.4, 1.2, 2, hull2, 0, 1.2, -1, { parent: b });
        cyl(0.08, 0.08, 3, M.wood, 0, 2.2, 1.8, { parent: b }, 6);
      }
    }

    // ---------- Cột cờ Tổ quốc ----------
    {
      cyl(0.12, 0.18, 14, M.stoneD, FLAG.x, 7, FLAG.z, {}, 10);
      cyl(0.9, 1.1, 0.8, M.stone, FLAG.x, 0.4, FLAG.z, {}, 12);
      const c = document.createElement('canvas');
      c.width = 240;
      c.height = 160;
      const g = c.getContext('2d');
      g.fillStyle = '#da251d';
      g.fillRect(0, 0, 240, 160);
      g.fillStyle = '#ffff00';
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 22 : 56;
        g.lineTo(120 + Math.cos(a) * r, 80 + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const f = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3, 12, 1), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
      f.position.set(FLAG.x + 2.4, 12.2, FLAG.z);
      scene.add(f);
      const p = f.geometry.attributes.position, base = Float32Array.from(p.array);
      updaters.push((t) => {
        for (let i = 0; i < p.count; i++) {
          const u = (base[i * 3] + 2.25) / 4.5;
          p.setZ(i, Math.sin(t * 3.2 + u * 6) * 0.3 * u);
        }
        p.needsUpdate = true;
      });
      // bia chủ quyền
      box(1.6, 0.4, 0.8, M.stoneD, STONE.x, 0.2, STONE.z);
      box(1.1, 1.8, 0.35, M.stone, STONE.x, 1.3, STONE.z);
      plaque(scene, cfg.stoneText || 'VIỆT NAM', STONE.x, 1.4, STONE.z + 0.22, 1.0, 0.6, 0, { size: 70, frame: null });
      // ngọn hải đăng
      if (cfg.lighthouse) {
        cyl(LIGHT.r, LIGHT.r + 0.6, 1.0, M.stone, LIGHT.x, 0.5, LIGHT.z, {}, 16);
        cyl(1.3, 1.9, 12, M.white, LIGHT.x, 7, LIGHT.z, {}, 16);
        cyl(1.7, 1.7, 0.4, redC, LIGHT.x, 13.2, LIGHT.z, {}, 16);
        cyl(1.1, 1.1, 1.8, std('#fff4b0', { emissive: '#ffd070', emissiveIntensity: 0.5, roughness: 0.3 }), LIGHT.x, 14.3, LIGHT.z, {}, 12);
        mesh(new THREE.ConeGeometry(1.4, 1.2, 12), redC, LIGHT.x, 15.8, LIGHT.z);
        K.roofs.push({ minX: LIGHT.x - 3, maxX: LIGHT.x + 3, minZ: LIGHT.z - 3, maxZ: LIGHT.z + 3, lift: 18 });
      }
    }

    // ---------- Chùa nhỏ mái ngói, sân, lư hương ----------
    K.hall(HALL, (y, z) => {
      const b = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
      b.position.set(0, y, z);
      b.scale.setScalar(1.05);
      scene.add(b);
      lods.push({ obj: b, z });
    }, { twoTier: false, wallMat: wallC, colMat: redC, light: 7 });
    cyl(0.9, 1.1, 1.0, M.stone, CENTER.x, 0.5, CENTER.z, {}, 16);
    for (const s of [-1, 1]) K.lampPost(s * 6, 0, 24);
    K.flowers([[-12, 30], [-10, 30], [10, 30], [12, 30]]);
    if (cfg.mount) {
      const hy = makeHill(K, 0, -135, [[0, 46], [26, 44], [60, 22], [95, 6], [130, -1]], { color: '#4f6f3c', clip: { x0: -40, x1: 40, z0: -34, z1: 42, floor: groundY } });
      K.forest(K.scatter(-90, 90, -170, -75, 50).map(([x, z]) => [x, z, Math.max(0, hy(x, z)) - 0.3]), 0, { scale: 1.2 });
    }

    return K.finish({ rituals: RITUALS });
  }

  const PLACE = { gate: 'Bãi cát', flag: 'Cột cờ Tổ quốc' };
  return {
    id: cfg.id,
    mapId: cfg.mapId,
    name: cfg.name,
    loading: cfg.loading,
    hint: cfg.hint,
    info: cfg.info,
    tips: [
      ['Cột cờ và bia chủ quyền', 'Đến cạnh cột cờ Tổ quốc và tấm bia chủ quyền ở sân để chiêm ngưỡng.'],
      ['Thắp nhang', 'Trong chùa thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
    ],
    LAND: 0,
    SPAWN: { x: 0, z: 34, ry: Math.PI },
    WALK_AREAS, ROUND_OBSTACLES, groundY,
    placeOf: (x, z) => (inHall(HALL, x, z) ? 'dien' : 'san'),
    defaultPlace: 'san',
    PLACE_INFO: {
      dien: { title: 'Thắp nhang trong chùa', text: 'Bạn sẽ bước tới lư hương trước bàn thờ Đức Phật Thích Ca trong ngôi chùa nhỏ giữa biển, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.', done: ' dâng Phật' },
      san: { title: 'Thắp nhang giữa sân đảo', text: 'Bạn sẽ bước tới lư hương đá giữa sân đảo, nhìn ra biển, chắp tay vái lạy rồi cắm nhang.', done: '' },
    },
    PLACES: [
      { id: 'bai', name: PLACE.gate, x: 0, z: 34, ry: Math.PI },
      { id: 'co', name: PLACE.flag, x: FLAG.x - 4, z: FLAG.z + 4, ry: Math.PI },
      { id: 'chua', name: 'Ngôi chùa', x: 0, z: HALL.z0 + 3, ry: Math.PI },
      ...(cfg.lighthouse ? [{ id: 'haidang', name: 'Hải đăng', x: LIGHT.x + 4, z: LIGHT.z + 5, ry: Math.PI }] : []),
    ],
    MAP: {
      box: [-56, -40, 112, 100],
      font: 5,
      shapes: [
        { x: 0, z: 4, r: 58, c: 'm-water' },
        { x: 0, z: 4, r: 52, c: 'm-porch' },
        { x0: SAND.x0 + 6, x1: SAND.x1 - 6, z0: SAND.z0 + 4, z1: SAND.z1 - 4, c: 'm-stone' },
        { x0: -HALL.hx, x1: HALL.hx, z0: HALL.z1, z1: HALL.z0, c: 'm-hall' },
        { x: FLAG.x, z: FLAG.z, r: 1.6, c: 'm-corridor' },
        ...(cfg.lighthouse ? [{ x: LIGHT.x, z: LIGHT.z, r: 2.6, c: 'm-white' }] : []),
      ],
      labels: [['bai', 0, 40, PLACE.gate], ['co', FLAG.x, FLAG.z - 3, PLACE.flag], ['chua', 0, -6, 'Ngôi chùa'], ...(cfg.lighthouse ? [['haidang', LIGHT.x, LIGHT.z - 4, 'Hải đăng']] : [])],
    },
    OV: { bounds: { x0: -60, x1: 60, z0: -40, z1: 56 }, dist: 90 },
    TRIPS: [
      { x: 0, z: HALL.z1 + 5.5, spread: 3, act: 'bow', say: 'lạy Phật' },
      { x: CENTER.x, z: CENTER.z + 4.2, spread: 3, act: 'gassho' },
      { x: FLAG.x - 4, z: FLAG.z + 4, spread: 2, ry: Math.PI / 2, say: 'Chào cờ Tổ quốc' },
      { x: 0, z: 34, spread: 24, ry: Math.PI, say: 'Biển xanh quá' },
      { x: STONE.x, z: STONE.z + 3, spread: 1, ry: Math.PI, say: 'Đây là chủ quyền của Việt Nam' },
    ],
    BOT_SPAWN: [[-24, 24, 28, 36], [-20, 20, 6, 12]],
    BOT_SAYS: cfg.says || ['Nam mô A Di Đà Phật', 'Biển xanh quá', 'Gió biển mát ghê', 'Cờ Tổ quốc bay phấp phới', 'Chùa nhỏ giữa biển thiêng liêng'],
    build,
  };
}
