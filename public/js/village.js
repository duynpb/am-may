// Làng Mây: ngôi làng bên kia dãy núi đá phía đông kênh. Dân làng ở nhà mái ngói / mái rạ, trồng ngô, trồng rau,
// nuôi gà vịt, heo, trâu. Đường làng nối sang chùa qua cầu đá nhỏ trên kênh phía đông (sau vườn cây ăn trái).
// Toạ độ dùng chung cho cảnh (world.js) và cho dân làng / người chơi đi lại (main.js).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './textures.js';

const GY = -0.36; // mặt đất ngoài sân (bằng PORCH.courtY)

export const VILLAGE = {
  x0: 133, x1: 205, z0: -47, z1: 57,
  cx: 169, cz: 5,
  road: { x0: 66, x1: 141, z0: -35, z1: -31, z: -33 }, // đường đất từ bãi cỏ sau vườn quả sang làng
  bridgeX: 76, // cầu đá nhỏ qua kênh phía đông
  gate: { x: 138, z: -33 }, // cổng làng
  street: { x0: 166, x1: 170, z0: -35, z1: 56 }, // đường giữa làng (bắc – nam)
  well: { x: 157, z: -24, r: 1.05 }, // giếng làng
  banyan: { x: 150, z: -41 }, // cây đa đầu làng
  pond: { x: 190, z: -38, rx: 6.5, rz: 4.2 }, // ao vịt
  corn: { x0: 135, x1: 147, z0: -14, z1: 20 }, // ruộng ngô sau dãy nhà phía tây
  veg: { x0: 135, x1: 147, z0: 25, z1: 54 }, // vườn rau
  coop: { x0: 192.5, x1: 203.5, z0: -20.5, z1: -7.5 }, // chuồng gà có rào
  pig: { x0: 194, x1: 202, z0: 0, z1: 8 }, // chuồng heo tường gạch thấp
  shed: { x: 198, z: 22, hw: 2.4, hd: 3.4 }, // chuồng trâu mái rạ
  pasture: { x0: 189, x1: 203, z0: 32, z1: 54 }, // bãi thả trâu
};
// 8 nếp nhà hai bên đường làng; face = 1: mặt nhà nhìn sang đông (ra đường), -1: nhìn sang tây
export const HOUSES = [];
for (const z of [-14, 6, 26, 46]) {
  HOUSES.push({ x: 155, z, face: 1 });
  HOUSES.push({ x: 181, z, face: -1 });
}
// sân gạch trước nhà (chỗ dân làng về nhà), đống rơm ở góc sân
export const yardOf = (h) => ({ x: h.x + h.face * 6.8, z: h.z });
export const HAYS = HOUSES.map((h) => ({ x: h.x + h.face * 9.0, z: h.z - 3.4 }));

// Vùng đi lại (thêm vào WALK_AREAS của chùa)
export const VILLAGE_WALK = [
  { minX: VILLAGE.road.x0, maxX: VILLAGE.road.x1, minZ: VILLAGE.road.z0, maxZ: VILLAGE.road.z1 }, // đường làng sang chùa
  { minX: 134, maxX: 204, minZ: -46, maxZ: 56 }, // trong làng
];
const rect = (x0, x1, z0, z1) => ({ minX: x0, maxX: x1, minZ: z0, maxZ: z1 });
const houseRect = (h) => rect(h.x + (h.face > 0 ? -2.7 : -3.9), h.x + (h.face > 0 ? 3.9 : 2.7), h.z - 4.4, h.z + 4.4);
// Chướng ngại để người không đi xuyên (dạng chữ nhật hoặc tròn / elip)
export const VILLAGE_BLOCKS = [
  ...HOUSES.map(houseRect),
  rect(VILLAGE.coop.x0, VILLAGE.coop.x1, VILLAGE.coop.z0, VILLAGE.coop.z1),
  rect(VILLAGE.pig.x0 - 0.2, VILLAGE.pig.x1 + 0.2, VILLAGE.pig.z0 - 0.2, VILLAGE.pig.z1 + 0.2),
  rect(VILLAGE.shed.x - VILLAGE.shed.hw - 0.3, VILLAGE.shed.x + VILLAGE.shed.hw + 0.3, VILLAGE.shed.z - VILLAGE.shed.hd - 0.3, VILLAGE.shed.z + VILLAGE.shed.hd + 0.3),
  { x: VILLAGE.well.x, z: VILLAGE.well.z, r: 1.45 },
  { x: VILLAGE.banyan.x, z: VILLAGE.banyan.z, r: 1.9 },
  { x: VILLAGE.pond.x, z: VILLAGE.pond.z, rx: VILLAGE.pond.rx + 0.5, rz: VILLAGE.pond.rz + 0.5 },
  ...HAYS.map((p) => ({ x: p.x, z: p.z, r: 1.15 })),
  { x: VILLAGE.gate.x, z: VILLAGE.gate.z - 2.9, r: 0.7 },
  { x: VILLAGE.gate.x, z: VILLAGE.gate.z + 2.9, r: 0.7 },
];
// Cùng các chướng ngại đó ở dạng elip — để tìm đường vòng qua
export const VILLAGE_ROUND = VILLAGE_BLOCKS.map((o) =>
  o.minX != null
    ? { x: (o.minX + o.maxX) / 2, z: (o.minZ + o.maxZ) / 2, rx: ((o.maxX - o.minX) / 2) * 1.2, rz: ((o.maxZ - o.minZ) / 2) * 1.2 }
    : o,
);

// Việc Phật tử giúp dân làng: chỗ đứng, hướng nhìn, lời báo khi làm xong
export const VILLAGE_TASKS = {
  well: { stand: [VILLAGE.well.x, VILLAGE.well.z + 1.7], face: [VILLAGE.well.x, VILLAGE.well.z], msg: 'Bạn đã múc nước giếng, gánh đầy chum giúp bà con' },
  coop: { stand: [VILLAGE.coop.x0 - 1.0, -14], face: [198, -14], msg: 'Bạn đã cho gà ăn, nhặt trứng giúp bà con' },
  pig: { stand: [VILLAGE.pig.x0 - 1.2, 4], face: [198, 4], msg: 'Bạn đã nấu cám, cho heo ăn giúp bà con' },
  shed: { stand: [VILLAGE.shed.x - VILLAGE.shed.hw - 1.2, VILLAGE.shed.z], face: [VILLAGE.shed.x, VILLAGE.shed.z], msg: 'Bạn đã cắt cỏ, cho trâu ăn giúp bà con' },
  corn: { msg: 'Bạn đã nhổ cỏ, vun gốc ruộng ngô giúp bà con' },
  veg: { msg: 'Bạn đã tưới rau giúp bà con trong làng' },
  hay: { msg: 'Bạn đã phụ bà con chất rơm cho gọn' },
};

const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- Dựng làng ----------
export function buildVillage({ scene, std, groundMat, POFF, updaters, nightHooks, staticRoots, pickables, lodAdd }) {
  const V = VILLAGE;
  // phần đứng yên: gắn vào một nhóm để cuối buildWorld gộp theo vật liệu (ít lệnh vẽ)
  const stat = new THREE.Group();
  scene.add(stat);
  staticRoots.push(stat);
  const m = (geo, mat, x, y, z, parent = stat, cast = true) => {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(x, y, z);
    o.castShadow = cast;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const bx = (w, h, d, mat, x, y, z, p) => m(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const cy = (rt, rb, h, mat, x, y, z, p, seg = 10) => m(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, p);
  const flat = (w, d, mat, x, z, y = GY + 0.02, parent = stat) => {
    const o = m(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, false);
    o.rotation.x = -Math.PI / 2;
    return o;
  };
  // vật bấm được (không gộp): userData.kind = 'village', task = việc giúp dân làng
  const pickGroup = (task, extra = {}) => {
    const g = new THREE.Group();
    g.userData = { kind: 'village', task, ...extra };
    scene.add(g);
    pickables.push(g);
    return g;
  };

  const M = {
    wallY: std('#d8bd84', { roughness: 0.95 }),
    wallW: std('#e4dccb', { roughness: 0.95 }),
    wallB: std('#a85d3e', { roughness: 0.9 }),
    plinth: std('#86553a', { roughness: 0.9 }),
    stone: std('#9b968c', { roughness: 0.95 }),
    wood: std('#5a3a24', { roughness: 0.8 }),
    door: std('#4a2d1c', { roughness: 0.7 }),
    tile: std('#93462c', { roughness: 0.85 }),
    ridge: std('#6b3322', { roughness: 0.85 }),
    thatch: std('#b49656', { roughness: 1 }),
    thatchDark: std('#8f7642', { roughness: 1 }),
    straw: std('#d4b263', { roughness: 1 }),
    jar: std('#6b4128', { roughness: 0.45 }),
    bamboo: std('#a8995c', { roughness: 0.9 }),
    leaf: std('#4a7a34', { roughness: 0.85 }),
    leaf2: std('#5d8c3e', { roughness: 0.85 }),
    trunk: std('#6e5a45', { roughness: 0.95 }),
    water: std('#55807a', { roughness: 0.15, metalness: 0.1 }),
    mud: std('#7a6748', { roughness: 1 }),
    bed: std('#6d5338', { roughness: 1 }),
    win: new THREE.MeshStandardMaterial({ color: '#2a1c12', roughness: 0.6, emissive: new THREE.Color('#ffb45e'), emissiveIntensity: 0 }),
  };
  M.gable = { Y: M.wallY.clone(), W: M.wallW.clone(), B: M.wallB.clone() };
  for (const g of Object.values(M.gable)) g.side = THREE.DoubleSide;
  nightHooks.push((n) => (M.win.emissiveIntensity = 1.6 * n)); // đèn trong nhà hắt ra cửa sổ lúc tối
  const dirt = groundMat('dirt', { tile: 3, macro: 0.06, tint: '#d8ccb8', ...POFF });
  const brick = groundMat('brick', { tile: 2.2, macro: 0.05, tint: '#e2cbb9', ...POFF });

  // ---- đường làng, cầu đá nhỏ qua kênh, cổng làng ----
  const R = V.road;
  flat(V.bridgeX - 3.2 - R.x0, R.z1 - R.z0, dirt, (R.x0 + V.bridgeX - 3.2) / 2, R.z);
  flat(V.street.x1 - (V.bridgeX + 3.2), R.z1 - R.z0, dirt, (V.bridgeX + 3.2 + V.street.x1) / 2, R.z);
  flat(V.street.x1 - V.street.x0, V.street.z1 - V.street.z0, dirt, (V.street.x0 + V.street.x1) / 2, (V.street.z0 + V.street.z1) / 2, GY + 0.025);
  // lối nhỏ ra giếng, ra ao, ra chuồng trại phía sau dãy nhà đông
  flat(2, 8, dirt, V.well.x, -28.5);
  flat(18, 2, dirt, 179, -33, GY + 0.022);
  flat(2, 92, dirt, 189, 6, GY + 0.022);
  for (const z of [-14, 4, 22]) flat(3.5, 1.8, dirt, 191.2, z, GY + 0.024);
  // cầu: bản đá phẳng (mặt cao 0,3 m) có lan can thấp
  bx(6.2, 0.3, 3.6, M.stone, V.bridgeX, GY + 0.15, R.z);
  for (const s of [-1, 1]) {
    bx(5.6, 0.12, 0.16, M.stone, V.bridgeX, GY + 0.82, R.z + s * 1.72);
    for (const dx of [-2.6, -0.9, 0.9, 2.6]) bx(0.2, 0.55, 0.2, M.stone, V.bridgeX + dx, GY + 0.57, R.z + s * 1.72);
  }
  {
    // cổng làng: hai trụ gạch, xà ngang, mái ngói nhỏ, biển tên hai mặt
    const G = V.gate;
    for (const s of [-1, 1]) {
      bx(0.9, 4.0, 0.9, M.wallB, G.x, GY + 2.0, G.z + s * 2.9);
      bx(1.1, 0.25, 1.1, M.stone, G.x, GY + 4.12, G.z + s * 2.9);
    }
    bx(0.55, 0.55, 6.7, M.wallB, G.x, GY + 3.75, G.z);
    for (const s of [-1, 1]) {
      const r = bx(1.0, 0.12, 7.6, M.tile, G.x + s * 0.42, GY + 4.38, G.z);
      r.rotation.z = -s * 0.55;
    }
    bx(0.18, 0.2, 7.8, M.ridge, G.x, GY + 4.62, G.z);
    const signMat = new THREE.MeshStandardMaterial({ map: T.boardTexture(['LÀNG MÂY'], { w: 1024, h: 230, size: 120 }), roughness: 0.45 });
    for (const s of [-1, 1]) {
      const p = m(new THREE.PlaneGeometry(3.0, 0.68), signMat, G.x + s * 0.29, GY + 3.75, G.z, stat, false);
      p.rotation.y = s * Math.PI / 2;
    }
  }

  const bananaLeafMat = std('#6aa83c', { roughness: 0.6, side: THREE.DoubleSide, map: T.bananaLeafTex(), alphaTest: 0.5 });
  const bananaLeafGeo = (() => {
    const g = new THREE.PlaneGeometry(0.6, 1.8, 1, 8).rotateX(-Math.PI / 2).translate(0, 0, 0.9);
    const p = g.attributes.position;
    for (let v = 0; v < p.count; v++) {
      const t = p.getZ(v) / 1.8;
      p.setY(v, 0.5 * t - 1.0 * t * t + Math.abs(p.getX(v)) * 0.25);
    }
    g.computeVertexNormals();
    return g;
  })();
  // ---- nhà ở: nhà ba gian có hiên cột gỗ, mái ngói hoặc mái rạ, sân gạch, chum nước, đống rơm, cau, chuối ----
  const smokeSpots = [];
  HOUSES.forEach((H, i) => {
    const g = new THREE.Group();
    g.position.set(H.x, GY, H.z);
    g.rotation.y = H.face > 0 ? 0 : Math.PI;
    stat.add(g);
    const kind = ['Y', 'W', 'Y', 'B', 'W', 'Y', 'B', 'W'][i];
    const wallM = M['wall' + kind], gableM = M.gable[kind];
    const thatch = i % 3 === 2;
    const W = 8, y0 = 0.35, ye = 2.9, xr = 0.6, half = 3.6, rise = 2.1;
    bx(6.4, y0, 8.6, M.plinth, 0.6, y0 / 2, 0, g);
    bx(0.6, 0.18, 2.4, M.stone, 4.1, 0.09, 0, g); // bậc thềm
    const wh = ye - y0, wy = y0 + wh / 2;
    bx(0.22, wh, W, wallM, -2.2, wy, 0, g);
    for (const s of [-1, 1]) {
      bx(4.6, wh, 0.22, wallM, 0, wy, s * 3.9, g);
      bx(0.22, wh, 2.9, wallM, 2.2, wy, s * 2.55, g); // tường trước hai bên cửa
      bx(0.06, 0.8, 1.1, M.win, 2.33, y0 + 1.35, s * 2.7, g); // cửa sổ
      for (let k = -1; k <= 1; k++) bx(0.05, 0.84, 0.05, M.wood, 2.37, y0 + 1.35, s * 2.7 + k * 0.28, g); // song cửa
    }
    bx(0.22, wh - 2.1, 2.2, wallM, 2.2, y0 + 2.1 + (wh - 2.1) / 2, 0, g); // tường trên cửa
    bx(0.08, 2.1, 2.0, M.door, 2.14, y0 + 1.05, 0, g); // cửa bức bàn
    for (const z of [-0.5, 0, 0.5]) bx(0.04, 2.1, 0.04, M.wood, 2.19, y0 + 1.05, z, g);
    // hiên: 4 cột gỗ trên chân tảng, xà hiên
    for (const z of [-3.8, -1.3, 1.3, 3.8]) {
      cy(0.09, 0.1, wh, M.wood, 3.45, wy, z, g, 8);
      bx(0.3, 0.12, 0.3, M.stone, 3.45, y0 + 0.06, z, g);
    }
    bx(0.18, 0.2, 8.4, M.wood, 3.45, ye - 0.1, 0, g);
    // mái hai dốc, nóc chạy theo chiều dài nhà
    const th = Math.atan2(rise, half), L = Math.hypot(half, rise) + 0.15;
    const thick = thatch ? 0.34 : 0.14, Wr = W + (thatch ? 1.1 : 0.9);
    for (const s of [-1, 1]) {
      const r = bx(L, thick, Wr, thatch ? M.thatch : M.tile, xr + (s * half) / 2, ye + rise / 2 + thick / 2, 0, g);
      r.rotation.z = -s * th;
    }
    if (thatch) bx(0.5, 0.3, Wr + 0.1, M.thatchDark, xr, ye + rise + 0.2, 0, g);
    else {
      bx(0.3, 0.26, Wr + 0.2, M.ridge, xr, ye + rise + 0.1, 0, g);
      for (const s of [-1, 1]) bx(0.32, 0.5, 0.3, M.ridge, xr, ye + rise + 0.3, s * (Wr / 2 + 0.05), g); // hai đầu nóc
    }
    // đầu hồi tam giác hai bên
    const rY = (x) => ye + rise * (1 - Math.abs(x - xr) / half);
    const sh = new THREE.Shape();
    sh.moveTo(-2.31, ye - 0.01);
    sh.lineTo(-2.31, rY(-2.31));
    sh.lineTo(xr, ye + rise - 0.02);
    sh.lineTo(2.31, rY(2.31));
    sh.lineTo(2.31, ye - 0.01);
    sh.closePath();
    for (const s of [-1, 1]) m(new THREE.ShapeGeometry(sh), gableM, 0, 0, s * 4.0, g);
    // ống khói bếp
    if (i % 2 === 0) {
      bx(0.45, 1.0, 0.45, M.wallB, -1.2, rY(-1.2) + 0.3, 2.5, g);
      const p = new THREE.Vector3(-1.2, rY(-1.2) + 0.9, 2.5).applyEuler(g.rotation).add(g.position);
      smokeSpots.push(p);
    }
    // sân gạch, chum nước, bụi cây góc sân
    const Y = yardOf(H);
    flat(6, 8.6, brick, Y.x, Y.z, GY + 0.03);
    for (const dz of [3.3, 3.95]) {
      const j = m(new THREE.SphereGeometry(0.32, 12, 10), M.jar, H.x + H.face * 4.15, GY + 0.36, H.z + dz);
      j.scale.y = 1.15;
      cy(0.2, 0.2, 0.05, M.wood, H.x + H.face * 4.15, GY + 0.74, H.z + dz, stat, 10);
    }
    for (const s of [-1, 1]) {
      const b = m(new THREE.IcosahedronGeometry(0.75, 1), s > 0 ? M.leaf : M.leaf2, H.x + H.face * 9.9, GY + 0.5, H.z + s * 4.0);
      b.scale.set(1, 0.75, 1.2);
    }
    // cây cau và khóm chuối sau / bên nhà
    cau(H.x - H.face * 0.4, H.z + 6.2, 6.5 + (i % 3) * 0.8, i);
    cau(H.x + H.face * 1.4, H.z - 6.4, 7.4 - (i % 2) * 0.9, i + 3);
    banana(H.x - H.face * 3.8, H.z - 5.6, i);
  });

  // cây cau: thân mảnh có đốt, tàu lá rủ trên ngọn, buồng cau xanh
  function cau(x, z, h, k) {
    const lean = ((k % 3) - 1) * 0.04;
    const t = cy(0.09, 0.12, h, M.trunk, x, GY + h / 2, z, stat, 7);
    t.rotation.z = lean;
    const top = new THREE.Vector3(x - Math.sin(lean) * h, GY + h, z);
    for (let f = 0; f < 8; f++) {
      const a = (f / 8) * Math.PI * 2 + k;
      const fr = new THREE.Group();
      fr.position.copy(top);
      fr.rotation.set(0, a, 0);
      stat.add(fr);
      const leaf = bx(0.32, 0.03, 1.9, f % 2 ? M.leaf : M.leaf2, 0, 0, 0.9, fr);
      leaf.rotation.x = 0.55 + (f % 3) * 0.15; // rủ xuống
      leaf.position.y = -0.45;
    }
    m(new THREE.SphereGeometry(0.22, 8, 6), M.leaf2, top.x + 0.12, top.y - 0.35, top.z);
  }
  // khóm chuối: thân xanh, 6 tàu lá chuối dài
  function banana(x, z, k) {
    cy(0.13, 0.17, 2.1, M.leaf2, x, GY + 1.05, z, stat, 8);
    for (let f = 0; f < 6; f++) {
      const lg = new THREE.Group();
      lg.position.set(x, GY + 2.05, z);
      lg.rotation.y = (f / 6) * Math.PI * 2 + k;
      stat.add(lg);
      const b = m(bananaLeafGeo, bananaLeafMat, 0, 0, 0, lg);
      b.rotation.x = -0.25 - (f % 2) * 0.2;
    }
  }

  // ---- đống rơm ở góc sân (bấm vào để phụ chất rơm) ----
  HAYS.forEach((p, i) => {
    const g = pickGroup('hay', { i });
    g.position.set(p.x, GY, p.z);
    m(new THREE.CylinderGeometry(0.95, 1.05, 1.3, 12), M.straw, 0, 0.65, 0, g);
    m(new THREE.ConeGeometry(1.0, 1.25, 12), M.straw, 0, 1.92, 0, g);
    m(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), M.wood, 0, 2.7, 0, g);
  });

  // ---- cây đa đầu làng, ghế đá dưới gốc ----
  {
    const B = V.banyan;
    cy(0.85, 1.35, 4.6, M.trunk, B.x, GY + 2.3, B.z, stat, 10);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const r = cy(0.12, 0.3, 1.6, M.trunk, B.x + Math.cos(a) * 1.1, GY + 0.5, B.z + Math.sin(a) * 1.1, stat, 6);
      r.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2, d = k === 0 ? 0 : 3.2 + (k % 2) * 1.2;
      const c = m(new THREE.IcosahedronGeometry(3.4 - (k % 3) * 0.5, 1), k % 2 ? M.leaf : M.leaf2, B.x + Math.cos(a) * d, GY + 6.6 + (k % 3) * 0.7, B.z + Math.sin(a) * d);
      c.scale.y = 0.7;
    }
    for (let k = 0; k < 10; k++) {
      const a = k * 2.4, d = 2.5 + (k % 3);
      cy(0.03, 0.03, 3.4, M.trunk, B.x + Math.cos(a) * d, GY + 3.6, B.z + Math.sin(a) * d, stat, 4); // rễ phụ thả xuống
    }
    for (const dz of [3.4, -3.4]) {
      bx(2.2, 0.12, 0.6, M.stone, B.x, GY + 0.48, B.z + dz);
      for (const dx of [-0.8, 0.8]) bx(0.2, 0.42, 0.5, M.stone, B.x + dx, GY + 0.21, B.z + dz);
    }
  }

  // ---- giếng làng: thành gạch, mặt nước tối, giá gỗ có gàu ----
  {
    const W = V.well;
    const g = pickGroup('well');
    g.position.set(W.x, GY, W.z);
    m(new THREE.CylinderGeometry(W.r, W.r + 0.08, 0.75, 18, 1, true), M.gable.B, 0, 0.375, 0, g);
    m(new THREE.CylinderGeometry(W.r - 0.18, W.r - 0.18, 0.75, 18, 1, true), M.gable.B, 0, 0.375, 0, g);
    const rim = m(new THREE.RingGeometry(W.r - 0.18, W.r + 0.08, 18), M.stone, 0, 0.76, 0, g);
    rim.rotation.x = -Math.PI / 2;
    const wt = m(new THREE.CircleGeometry(W.r - 0.18, 18), std('#1f3a3a', { roughness: 0.1 }), 0, 0.35, 0, g, false);
    wt.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) m(new THREE.BoxGeometry(0.12, 1.9, 0.12), M.wood, s * (W.r + 0.15), 0.95, 0, g);
    m(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M.wood, 0, 1.85, 0, g).rotation.z = Math.PI / 2;
    m(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 4), M.trunk, 0.3, 1.4, 0, g);
    m(new THREE.CylinderGeometry(0.14, 0.11, 0.24, 10), M.wood, 0.3, 0.86, 0, g);
    flat(3.6, 3.6, brick, W.x, W.z, GY + 0.032);
  }

  // ---- ao vịt: mặt nước, bờ đất, khóm lau sậy ----
  {
    const P = V.pond;
    const bank = m(new THREE.CircleGeometry(1, 32), M.mud, P.x, GY + 0.015, P.z, stat, false);
    bank.rotation.x = -Math.PI / 2;
    bank.scale.set(P.rx + 0.9, P.rz + 0.9, 1);
    const w = m(new THREE.CircleGeometry(1, 32), M.water, P.x, GY + 0.03, P.z, stat, false);
    w.rotation.x = -Math.PI / 2;
    w.scale.set(P.rx, P.rz, 1);
    for (let k = 0; k < 26; k++) {
      const a = rnd(0, Math.PI * 2), h = rnd(0.8, 1.5);
      const r = cy(0.015, 0.02, h, M.leaf2, P.x + Math.cos(a) * (P.rx + 0.3), GY + h / 2, P.z + Math.sin(a) * (P.rz + 0.3), stat, 4);
      r.rotation.z = rnd(-0.2, 0.2);
    }
  }

  // ---- ruộng ngô: luống đất, cây ngô có lá dài, bắp và cờ ngô ----
  {
    const C = V.corn;
    const ground = flat(C.x1 - C.x0, C.z1 - C.z0, dirt, (C.x0 + C.x1) / 2, (C.z0 + C.z1) / 2, GY + 0.025, scene);
    ground.userData = { kind: 'village', task: 'corn' };
    pickables.push(ground);
    for (let x = C.x0 + 0.6; x < C.x1; x += 1.0) flat(0.45, C.z1 - C.z0 - 0.6, M.bed, x, (C.z0 + C.z1) / 2, GY + 0.04);
    const parts = [
      paint(new THREE.CylinderGeometry(0.02, 0.032, 1.9, 5).translate(0, 0.95, 0), '#6f9a3a'),
      paint(new THREE.ConeGeometry(0.06, 0.32, 5).translate(0, 2.02, 0), '#c9b26a'),
      paint(new THREE.CylinderGeometry(0.045, 0.05, 0.24, 6).rotateZ(0.35).translate(0.05, 1.1, 0), '#a9b45a'),
    ];
    for (let k = 0; k < 6; k++) {
      const leaf = new THREE.BoxGeometry(0.62, 0.01, 0.07).translate(0.31, 0, 0).rotateZ(-0.35 - (k % 2) * 0.25).rotateY((k * 2.4) % (Math.PI * 2)).translate(0, 0.45 + k * 0.22, 0);
      parts.push(paint(leaf, k % 2 ? '#5d8c34' : '#6c9c3e'));
    }
    const cornGeo = mergeGeometries(parts.map(nonIndexed));
    const pts = [];
    for (let x = C.x0 + 0.6; x < C.x1; x += 1.0) for (let z = C.z0 + 0.5; z < C.z1 - 0.3; z += 0.8) pts.push([x + rnd(-0.08, 0.08), z + rnd(-0.1, 0.1)]);
    const inst = new THREE.InstancedMesh(cornGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }), pts.length);
    const o = new THREE.Object3D(), c = new THREE.Color();
    pts.forEach(([x, z], k) => {
      o.position.set(x, GY + 0.04, z);
      o.rotation.set(rnd(-0.05, 0.05), rnd(0, Math.PI * 2), rnd(-0.05, 0.05));
      o.scale.setScalar(rnd(0.85, 1.12));
      o.updateMatrix();
      inst.setMatrixAt(k, o.matrix);
      inst.setColorAt(k, c.setHSL(0, 0, rnd(0.85, 1.05)));
    });
    inst.castShadow = true;
    inst.receiveShadow = true;
    scene.add(inst);
  }

  // ---- vườn rau: luống đất nhô cao, cây rau xanh nhiều sắc ----
  {
    const G = V.veg;
    const ground = flat(G.x1 - G.x0, G.z1 - G.z0, dirt, (G.x0 + G.x1) / 2, (G.z0 + G.z1) / 2, GY + 0.025, scene);
    ground.userData = { kind: 'village', task: 'veg' };
    pickables.push(ground);
    const beds = [];
    for (let z = G.z0 + 1.2; z < G.z1 - 0.5; z += 1.8) beds.push(z);
    for (const z of beds) bx(G.x1 - G.x0 - 1.2, 0.18, 1.1, M.bed, (G.x0 + G.x1) / 2, GY + 0.09, z, stat);
    const n = beds.length * 19;
    const inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.24, 0), std('#ffffff', { roughness: 0.8, flatShading: true }), n);
    const o = new THREE.Object3D(), c = new THREE.Color();
    let k = 0;
    beds.forEach((z, b) => {
      const hue = [0.27, 0.3, 0.22, 0.33, 0.25][b % 5];
      for (let j = 0; j < 19; j++) {
        o.position.set(G.x0 + 1.0 + j * 0.53, GY + 0.22, z + rnd(-0.15, 0.15));
        o.rotation.set(0, rnd(0, 6.28), 0);
        const s = rnd(0.8, 1.2);
        o.scale.set(s, s * (b % 3 === 1 ? 1.4 : 0.6), s);
        o.updateMatrix();
        inst.setMatrixAt(k, o.matrix);
        inst.setColorAt(k++, c.setHSL(hue + rnd(-0.02, 0.02), 0.5, rnd(0.3, 0.42)));
      }
    });
    inst.castShadow = true;
    scene.add(inst);
    // lu nước tưới ở đầu vườn
    for (const dz of [0, 0.8]) {
      const j = m(new THREE.SphereGeometry(0.34, 12, 10), M.jar, G.x1 + 0.7, GY + 0.38, G.z0 + 0.5 + dz);
      j.scale.y = 1.15;
    }
  }

  // ---- chuồng gà: chòi tre mái rạ, hàng rào tre thấp ----
  {
    const Cp = V.coop;
    const g = pickGroup('coop');
    g.add(new THREE.Mesh(fence(Cp.x0, Cp.x1, Cp.z0, Cp.z1, 0.9), M.bamboo));
    m(new THREE.BoxGeometry(2.4, 1.5, 2.0), M.bamboo, Cp.x1 - 1.6, GY + 0.75, Cp.z0 + 1.4, g);
    for (const s of [-1, 1]) {
      const r = m(new THREE.BoxGeometry(1.6, 0.18, 2.6), M.thatch, Cp.x1 - 1.6 + s * 0.65, GY + 1.85, Cp.z0 + 1.4, g);
      r.rotation.z = -s * 0.6;
    }
    m(new THREE.BoxGeometry(0.06, 0.6, 0.5), M.door, Cp.x1 - 2.82, GY + 0.45, Cp.z0 + 1.4, g);
    m(new THREE.CylinderGeometry(0.35, 0.3, 0.12, 12), M.wood, Cp.x0 + 3, GY + 0.06, (Cp.z0 + Cp.z1) / 2, g); // máng thóc
  }
  // ---- chuồng heo: tường gạch thấp, góc có mái che, máng ăn ----
  {
    const Pg = V.pig;
    const g = pickGroup('pig');
    const parts = [];
    const wall = (w, d, x, z) => parts.push(new THREE.BoxGeometry(w, 0.9, d).translate(x, GY + 0.45, z));
    wall(Pg.x1 - Pg.x0, 0.22, (Pg.x0 + Pg.x1) / 2, Pg.z0);
    wall(Pg.x1 - Pg.x0, 0.22, (Pg.x0 + Pg.x1) / 2, Pg.z1);
    wall(0.22, Pg.z1 - Pg.z0, Pg.x0, (Pg.z0 + Pg.z1) / 2);
    wall(0.22, Pg.z1 - Pg.z0, Pg.x1, (Pg.z0 + Pg.z1) / 2);
    g.add(new THREE.Mesh(mergeGeometries(parts), M.wallB));
    for (const [dx, dz] of [[0, 0], [0, 3], [3, 0], [3, 3]]) m(new THREE.BoxGeometry(0.15, 2.0, 0.15), M.wood, Pg.x1 - 3.2 + dx, GY + 1.0, Pg.z0 + 0.2 + dz, g);
    m(new THREE.BoxGeometry(3.6, 0.16, 3.6), M.thatch, Pg.x1 - 1.7, GY + 2.05, Pg.z0 + 1.7, g).rotation.x = 0.12;
    m(new THREE.BoxGeometry(0.5, 0.3, 2.4), M.stone, Pg.x0 + 0.5, GY + 0.15, (Pg.z0 + Pg.z1) / 2, g); // máng
    const floor = flat(Pg.x1 - Pg.x0, Pg.z1 - Pg.z0, M.mud, (Pg.x0 + Pg.x1) / 2, (Pg.z0 + Pg.z1) / 2, GY + 0.03, g);
    floor.castShadow = false;
  }
  // ---- chuồng trâu mái rạ, đống cỏ khô ----
  {
    const S = V.shed;
    const g = pickGroup('shed');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) m(new THREE.CylinderGeometry(0.1, 0.12, 2.6, 7), M.wood, S.x + sx * S.hw, GY + 1.3, S.z + sz * S.hd, g);
    for (const s of [-1, 1]) {
      const r = m(new THREE.BoxGeometry(3.4, 0.3, S.hd * 2 + 1.0), M.thatch, S.x + s * 1.35, GY + 3.25, S.z, g);
      r.rotation.z = -s * 0.55;
    }
    m(new THREE.BoxGeometry(0.5, 0.3, S.hd * 2 + 1.1), M.thatchDark, S.x, GY + 4.0, S.z, g);
    m(new THREE.BoxGeometry(0.1, 0.1, S.hd * 2), M.wood, S.x - S.hw, GY + 0.9, S.z, g); // thanh chắn
    const hay = m(new THREE.SphereGeometry(1.0, 10, 8), M.straw, S.x + 0.9, GY + 0.2, S.z + 1.6, g);
    hay.scale.set(1, 0.6, 1.4);
    m(new THREE.BoxGeometry(0.6, 0.35, 2.4), M.wood, S.x - 1.4, GY + 0.18, S.z - 1.2, g); // máng cỏ
    flat(S.hw * 2 + 0.6, S.hd * 2 + 0.6, M.mud, S.x, S.z, GY + 0.03, g).castShadow = false;
  }

  // ---- gà, vịt, heo, trâu đi lại; khói bếp ----
  const anim = new THREE.Group();
  scene.add(anim);
  lodAdd(anim, V.cx, V.cz, 150); // ở xa làng thì không vẽ, không cập nhật
  const animalMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  const wanderers = [];
  const add = (geo, x, z, area, speed, kind, y = GY) => {
    const o = new THREE.Mesh(geo, animalMat);
    o.rotation.order = 'YXZ';
    o.position.set(x, y, z);
    o.rotation.y = rnd(0, Math.PI * 2);
    o.castShadow = true;
    anim.add(o);
    wanderers.push({ o, area, speed, kind, y, tx: x, tz: z, wait: rnd(0, 3), ph: rnd(0, 10) });
    return o;
  };
  const inset = (r, d) => ({ x0: r.x0 + d, x1: r.x1 - d, z0: r.z0 + d, z1: r.z1 - d });
  const coopArea = inset(V.coop, 0.7);
  const hens = ['#b07438', '#efe7d6', '#5a3a26', '#c98a4a'].map((c) => chickenGeo(c, c));
  const rooster = chickenGeo('#9c3d1c', '#1f2a24');
  for (let k = 0; k < 9; k++) add(k === 0 ? rooster : hens[k % hens.length], rnd(coopArea.x0, coopArea.x1 - 3), rnd(coopArea.z0 + 3, coopArea.z1), coopArea, 0.7, 'chicken');
  // vài con gà thả rông quanh giếng và đầu đường làng
  const roam = { x0: 158, x1: 176, z0: -31, z1: -20 };
  for (let k = 0; k < 4; k++) add(k === 0 ? rooster : hens[k % hens.length], rnd(roam.x0, roam.x1), rnd(roam.z0, roam.z1), roam, 0.7, 'chicken');
  const pigArea = inset(V.pig, 0.7);
  add(pigGeo('#e8aa9a'), 197, 4, pigArea, 0.35, 'pig');
  add(pigGeo('#2e2a2b'), 199, 6, pigArea, 0.35, 'pig');
  add(pigGeo('#e8aa9a'), 196, 2, pigArea, 0.35, 'pig');
  const pastArea = inset(V.pasture, 1.5);
  const buf = buffaloGeo();
  add(buf, 194, 40, pastArea, 0.45, 'buffalo');
  add(buf, 199, 48, pastArea, 0.45, 'buffalo');
  // vịt bơi vòng trong ao
  const ducks = [];
  for (let k = 0; k < 6; k++) {
    const o = new THREE.Mesh(duckGeo(k % 3 === 0 ? '#7a5a3a' : '#f1eee6'), animalMat);
    o.castShadow = true;
    anim.add(o);
    ducks.push({ o, a: rnd(0, 6.28), k: rnd(0.35, 0.8), sp: rnd(0.18, 0.3) * (k % 2 ? 1 : -1) });
  }
  // khói bếp bay lên từ ống khói
  const smokeTex = T.smoke();
  const puffs = [];
  smokeSpots.forEach((p, si) => {
    for (let k = 0; k < 5; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
      anim.add(s);
      puffs.push({ s, p, ph: k / 5 + si * 0.13 });
    }
  });

  updaters.push((t, dt) => {
    if (!anim.visible) return;
    for (const w of wanderers) {
      const o = w.o;
      if (w.wait > 0) {
        w.wait -= dt;
        if (w.kind === 'chicken') o.rotation.x = Math.max(0, Math.sin((t + w.ph) * 7)) * 0.7; // mổ thóc
        else o.rotation.x = 0.1 + 0.05 * Math.sin(t * 1.4 + w.ph); // cúi gặm cỏ, ủi đất
        if (w.wait <= 0) {
          w.tx = rnd(w.area.x0, w.area.x1);
          w.tz = rnd(w.area.z0, w.area.z1);
        }
        continue;
      }
      o.rotation.x = 0;
      const dx = w.tx - o.position.x, dz = w.tz - o.position.z, d = Math.hypot(dx, dz);
      if (d < 0.05) {
        w.wait = w.kind === 'buffalo' ? rnd(6, 16) : rnd(1.2, 5);
        continue;
      }
      const st = Math.min(d, w.speed * dt);
      o.position.x += (dx / d) * st;
      o.position.z += (dz / d) * st;
      let da = Math.atan2(dx, dz) - o.rotation.y;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      o.rotation.y += da * Math.min(1, dt * 5);
      o.position.y = w.y + (w.kind === 'chicken' ? Math.abs(Math.sin(t * 14 + w.ph)) * 0.03 : 0);
    }
    const P = V.pond;
    for (const dk of ducks) {
      dk.a += (dk.sp * dt) / dk.k / 3;
      const c = Math.cos(dk.a), s = Math.sin(dk.a);
      dk.o.position.set(P.x + c * P.rx * dk.k, GY + 0.03 + Math.sin(t * 2 + dk.a) * 0.01, P.z + s * P.rz * dk.k);
      dk.o.rotation.y = Math.atan2(-s * P.rx * Math.sign(dk.sp), c * P.rz * Math.sign(dk.sp));
    }
    for (const f of puffs) {
      const age = (t * 0.16 + f.ph) % 1;
      f.s.position.set(f.p.x + age * 0.7, f.p.y + age * 3.6, f.p.z + age * 0.3);
      f.s.scale.setScalar(0.5 + age * 2.0);
      f.s.material.opacity = 0.55 * Math.sin(Math.PI * age);
    }
  });
}

// ---------- hình con vật: ghép các khối có màu đỉnh thành một hình (một lệnh vẽ mỗi con) ----------
function nonIndexed(g) {
  return g.index ? g.toNonIndexed() : g;
}
function paint(geo, hex) {
  const g = nonIndexed(geo);
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
// khối geo: co giãn (s), xoay (r), dời tới (x, y, z), tô màu
function part(geo, hex, x, y, z, { r = [0, 0, 0], s = [1, 1, 1] } = {}) {
  geo.scale(...s);
  geo.rotateX(r[0]);
  geo.rotateY(r[1]);
  geo.rotateZ(r[2]);
  geo.translate(x, y, z);
  return paint(geo, hex);
}
function chickenGeo(body, tail) {
  return mergeGeometries([
    part(new THREE.SphereGeometry(0.15, 10, 8), body, 0, 0.2, 0, { s: [0.9, 0.85, 1.2] }),
    part(new THREE.SphereGeometry(0.075, 8, 6), body, 0, 0.34, 0.14),
    part(new THREE.ConeGeometry(0.022, 0.06, 6), '#e0a32a', 0, 0.33, 0.22, { r: [Math.PI / 2, 0, 0] }),
    part(new THREE.BoxGeometry(0.02, 0.06, 0.07), '#c7281e', 0, 0.415, 0.14),
    part(new THREE.SphereGeometry(0.02, 6, 4), '#c7281e', 0, 0.29, 0.19),
    part(new THREE.ConeGeometry(0.07, 0.2, 6), tail, 0, 0.3, -0.17, { r: [-0.9, 0, 0] }),
    part(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 4), '#d9a032', 0.05, 0.06, 0),
    part(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 4), '#d9a032', -0.05, 0.06, 0),
  ]);
}
function duckGeo(body) {
  return mergeGeometries([
    part(new THREE.SphereGeometry(0.18, 10, 8), body, 0, 0.06, 0, { s: [0.85, 0.6, 1.3] }),
    part(new THREE.CylinderGeometry(0.045, 0.055, 0.14, 6), body, 0, 0.16, 0.15),
    part(new THREE.SphereGeometry(0.08, 8, 6), body === '#f1eee6' ? body : '#2f5a3a', 0, 0.25, 0.17),
    part(new THREE.BoxGeometry(0.07, 0.025, 0.1), '#e88a2a', 0, 0.23, 0.27),
    part(new THREE.ConeGeometry(0.06, 0.14, 6), body, 0, 0.12, -0.24, { r: [-1.2, 0, 0] }),
  ]);
}
function pigGeo(c) {
  const light = c === '#e8aa9a' ? '#f0bfb2' : '#4a4446';
  const parts = [
    part(new THREE.SphereGeometry(0.3, 12, 10), c, 0, 0.42, 0, { s: [0.95, 0.85, 1.5] }),
    part(new THREE.SphereGeometry(0.2, 10, 8), c, 0, 0.46, 0.44),
    part(new THREE.CylinderGeometry(0.08, 0.09, 0.1, 10), light, 0, 0.42, 0.63, { r: [Math.PI / 2, 0, 0] }),
    part(new THREE.ConeGeometry(0.06, 0.13, 4), c, 0.1, 0.63, 0.42, { r: [0.4, 0, -0.3] }),
    part(new THREE.ConeGeometry(0.06, 0.13, 4), c, -0.1, 0.63, 0.42, { r: [0.4, 0, 0.3] }),
    part(new THREE.CylinderGeometry(0.015, 0.01, 0.15, 4), c, 0, 0.5, -0.46, { r: [-0.8, 0, 0] }),
  ];
  for (const [x, z] of [[0.15, 0.25], [-0.15, 0.25], [0.15, -0.25], [-0.15, -0.25]]) parts.push(part(new THREE.CylinderGeometry(0.05, 0.05, 0.26, 6), c, x, 0.13, z));
  return mergeGeometries(parts);
}
function buffaloGeo() {
  const c = '#4b4a4d', dark = '#363538', horn = '#d6cbb0';
  const parts = [
    part(new THREE.SphereGeometry(0.6, 14, 10), c, 0, 1.05, 0, { s: [0.9, 0.82, 1.6] }),
    part(new THREE.SphereGeometry(0.36, 10, 8), c, 0, 1.12, 0.85),
    part(new THREE.SphereGeometry(0.26, 10, 8), c, 0, 0.98, 1.25, { s: [0.85, 0.9, 1.3] }),
    part(new THREE.SphereGeometry(0.16, 8, 6), dark, 0, 0.86, 1.52),
    part(new THREE.CylinderGeometry(0.02, 0.015, 0.75, 4), c, 0, 0.82, -0.98, { r: [0.2, 0, 0] }),
  ];
  for (const s of [-1, 1]) {
    parts.push(part(new THREE.CylinderGeometry(0.05, 0.065, 0.32, 6), horn, s * 0.27, 1.24, 1.2, { r: [0, 0, Math.PI / 2] }));
    parts.push(part(new THREE.ConeGeometry(0.052, 0.48, 6), horn, s * 0.45, 1.32, 1.05, { r: [-1.2, 0, 0] }));
    parts.push(part(new THREE.BoxGeometry(0.2, 0.05, 0.1), c, s * 0.28, 1.06, 1.12));
    for (const z of [0.6, -0.6]) {
      parts.push(part(new THREE.CylinderGeometry(0.11, 0.09, 0.78, 7), c, s * 0.3, 0.39, z));
      parts.push(part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 7), dark, s * 0.3, 0.03, z));
    }
  }
  return mergeGeometries(parts);
}
// hàng rào tre thấp quanh hình chữ nhật (một hình gộp)
function fence(x0, x1, z0, z1, h) {
  const parts = [];
  const side = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 1.1));
    for (let i = 0; i <= n; i++) parts.push(new THREE.CylinderGeometry(0.04, 0.045, h, 5).translate(ax + ((bx - ax) * i) / n, GY + h / 2, az + ((bz - az) * i) / n));
    for (const y of [0.35, h - 0.12]) {
      const g = new THREE.CylinderGeometry(0.025, 0.025, L, 5).rotateZ(Math.PI / 2);
      g.rotateY(-Math.atan2(bz - az, bx - ax));
      parts.push(g.translate((ax + bx) / 2, GY + y, (az + bz) / 2));
    }
  };
  side(x0, z0, x1, z0);
  side(x1, z0, x1, z1);
  side(x1, z1, x0, z1);
  side(x0, z1, x0, z0);
  return mergeGeometries(parts);
}
