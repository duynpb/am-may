// Khu Tam Chúc: hồ nước lớn giữa núi đá vôi, đảo đá nhô lên mặt hồ, bờ kè có lan can,
// cổng Tam Quan sát mép hồ mở ra một sân lớn. (Phỏng theo không khí, không sao chép công trình thật.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from '../textures.js';
import { curvedRoof, dragonsOnRidge, karstGeometry, karstMaterial, ARCH } from '../arch.js';
import { PILLARS } from './sutras.js';
import { makeBuddha, makeThichCa } from '../buddha.js';
import { makeQuanAm, swapToCarvedQuanAm } from '../quanam.js';
import { ritualKit } from '../rituals.js';

// Mặt đất đi lại cao 0,8 m so với mặt hồ; bờ kè thẳng ở z = SHORE
export const LAND = 0.8;
export const SHORE = 53;
export const GATE = { z: 36, plinth: 0.3 };
export const PLAZA = { minX: -48, maxX: 48, minZ: -40, maxZ: 33 };
export const CAULDRON = { x: 0, z: 4, r: 2.6 };
// Vùng đi lại (hình chữ nhật). Hai vùng chồng lên nhau là đi qua lại được.
export const WALK_AREAS = [
  { minX: -68, maxX: 68, minZ: 39.5, maxZ: 52.2 }, // bờ hồ
  { minX: -2.5, maxX: 2.5, minZ: 32.5, maxZ: 39.8 }, // cửa giữa cổng Tam Quan
  { minX: 8.5, maxX: 10.9, minZ: 32.5, maxZ: 39.8 }, // hai cửa bên
  { minX: -10.9, maxX: -8.5, minZ: 32.5, maxZ: 39.8 },
  PLAZA, // sân lớn
];
// Bến thuyền gỗ chìa ra hồ ở giữa bờ kè; thuyền đậu sát bên phải đầu bến
export const PIER = { halfW: 1.7, z0: SHORE - 0.3, z1: 66, y: 0.45, ramp: 2 };
export const BERTH = { x: 2.9, z: 62.5 };
export const BOARD = { x: 1.0, z: 62.5 }; // chỗ đứng trên bến để bước xuống thuyền
WALK_AREAS.push({ minX: -1.4, maxX: 1.4, minZ: 51.5, maxZ: 64.8 }); // bến thuyền
// Thuyền chạy theo giờ chung: mỗi vòng BOAT_PERIOD giây, đậu bến BOAT_DOCK giây rồi đi một vòng quanh đảo
export const BOAT_PERIOD = 150, BOAT_DOCK = 24, BOATS = 3;
export const ROUND_OBSTACLES = [{ x: CAULDRON.x, z: CAULDRON.z, r: CAULDRON.r + 0.8 }];
// Vườn kinh phía tây sân lớn: 32 cột đá khắc kinh (4 hàng × 8), phù điêu đá ở cuối vườn
export const SUTRA_GARDEN = { minX: -111, maxX: -56, minZ: -30, maxZ: 24, wallX: -112.8 };
export const PILLAR_POS = [];
for (const z of [-24, -10, 4, 18]) for (let i = 0; i < 8; i++) PILLAR_POS.push({ x: -61 - 6.6 * i, z });
WALK_AREAS.push(SUTRA_GARDEN, { minX: -58, maxX: -46, minZ: -19, maxZ: -13 }); // vườn và lối từ sân sang
ROUND_OBSTACLES.push(...PILLAR_POS.map((p) => ({ x: p.x, z: p.z, r: 1.4 })));
// Sườn núi sau sân lớn: ba nền đá, càng vào trong càng cao, mỗi nền một điện.
// front/back: mép trước / sau của nền (z); hall: điện giữa nền; lối lên nền kế tiếp ở phía sau điện.
export const TERRACES = [
  { key: 'quanam', name: 'Điện Quan Âm', plaque: 'QUAN ÂM ĐIỆN', y: LAND + 6, front: -52, back: -92, halfX: 24, hall: { hx: 9, front: -58, back: -70 } },
  { key: 'phapchu', name: 'Điện Pháp Chủ', plaque: 'PHÁP CHỦ ĐIỆN', y: LAND + 14, front: -92, back: -130, halfX: 26, hall: { hx: 12, front: -98, back: -112 } },
  { key: 'tamthe', name: 'Điện Tam Thế', plaque: 'TAM THẾ ĐIỆN', y: LAND + 24, front: -130, back: -170, halfX: 30, hall: { hx: 15, front: -138, back: -154 } },
];
// bậc thang: top là mép nền trên, bottom là chân bậc (z), y0 → y1
export const STAIRS = [
  { x: 4, top: -52, bottom: -40.4, y0: LAND, y1: TERRACES[0].y },
  { x: 4, top: -92, bottom: -80, y0: TERRACES[0].y, y1: TERRACES[1].y },
  { x: 4, top: -130, bottom: -117, y0: TERRACES[1].y, y1: TERRACES[2].y },
];
for (const T of TERRACES) {
  const H = T.hall;
  WALK_AREAS.push(
    { minX: -T.halfX + 1, maxX: T.halfX - 1, minZ: H.front + 0.6, maxZ: T.front - 0.6 }, // sân trước điện
    { minX: -T.halfX + 1, maxX: -H.hx - 0.9, minZ: H.back - 0.6, maxZ: H.front + 0.9 }, // lối hai bên điện
    { minX: H.hx + 0.9, maxX: T.halfX - 1, minZ: H.back - 0.6, maxZ: H.front + 0.9 },
    { minX: -T.halfX + 1, maxX: T.halfX - 1, minZ: T.back + 0.6, maxZ: H.back - 0.4 }, // sân sau điện
    { minX: -3.4, maxX: 3.4, minZ: H.front - 1.0, maxZ: H.front + 1.0 }, // cửa giữa
    { minX: -H.hx + 1, maxX: H.hx - 1, minZ: H.back + 3.0, maxZ: H.front - 0.6 }, // trong điện (bàn thờ ở phía sau)
  );
}
// Lư hương và thùng công đức: trước bàn thờ mỗi điện, và trước đỉnh đồng giữa sân lớn (dựng trong buildTamChuc)
export const RITUALS = [
  ...TERRACES.map((T) => ({ place: T.key, y: T.y + 0.25, burner: { x: 0, z: T.hall.back + 3.6 }, merit: { x: T.hall.hx - 2.4, z: T.hall.back + 3.4 }, face: { x: 0, y: T.y + 2.8, z: T.hall.back + 1.7 } })),
  { place: 'dinh', y: LAND, burner: { x: CAULDRON.x, z: CAULDRON.z + 4.6 }, merit: { x: CAULDRON.x + 3.4, z: CAULDRON.z + 4.4 }, face: { x: CAULDRON.x, y: LAND + 2.4, z: CAULDRON.z } },
];
for (const R of RITUALS) ROUND_OBSTACLES.push({ x: R.burner.x, z: R.burner.z, r: 0.8 }, { x: R.merit.x, z: R.merit.z, r: 0.7 });
for (const S of STAIRS) WALK_AREAS.push({ minX: -S.x + 0.8, maxX: S.x - 0.8, minZ: S.top - 1.0, maxZ: S.bottom + 0.4 });
export const SPAWN = { x: 0, z: 47, ry: Math.PI };

export function groundY(x, z) {
  if (z < PLAZA.minZ - 0.3) {
    const ax = Math.abs(x);
    for (const S of STAIRS) {
      if (ax <= S.x && z <= S.bottom && z >= S.top) return S.y0 + ((S.y1 - S.y0) * (S.bottom - z)) / (S.bottom - S.top);
    }
    for (const T of TERRACES) {
      if (ax <= T.halfX && z <= T.front && z >= T.back) {
        const H = T.hall;
        return ax < H.hx + 0.7 && z < H.front + 1.1 && z > H.back - 0.5 ? T.y + 0.25 : T.y;
      }
    }
    return LAND;
  }
  // bến thuyền: dốc gỗ từ bờ kè xuống mặt bến, rồi phẳng
  if (Math.abs(x) < PIER.halfW && z > PIER.z0 && z < PIER.z1) {
    const k = Math.min(1, Math.max(0, (z - SHORE) / PIER.ramp));
    return LAND + (PIER.y - LAND) * k;
  }
  if (z > SHORE + 0.2) return 0;
  if (Math.abs(x) < 17 && Math.abs(z - GATE.z) < 3.5) return LAND + GATE.plinth; // nền đá cổng
  return LAND;
}

export function buildTamChuc(renderer, { quality = 'high' } = {}) {
  const scene = new THREE.Scene();
  const pickables = [];
  const updaters = [];
  const nightHooks = [];
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
  // mặt nền như khu Am Mây: cỏ có vân, đá tấm có ron, đá lát ô nhỏ — vân trải theo toạ độ cảnh nên đúng kích thước thật
  const groundMat = T.groundMaterial;
  // Vật đứng yên tạo trong lúc batching = true (hoặc nhóm được đánh dấu) được gộp theo vật liệu
  // ở cuối hàm để giảm số lệnh vẽ — quan trọng cho điện thoại.
  let batching = false;
  const staticRoots = [];
  const mesh = (geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, parent = scene } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    if (batching && parent === scene) staticRoots.push(m);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = recv;
    parent.add(m);
    return m;
  };
  const box = (w, h, d, mat, x, y, z, o) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, o);
  const cyl = (rt, rb, h, mat, x, y, z, o, seg = 18) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, o);
  const stone = std('#b7b0a2', { roughness: 0.95 });
  const stoneD = std('#8f897d', { roughness: 1 });
  const red = std('#9c2a1c', { roughness: 0.55 });
  const wallM = std('#e6dcc6', { roughness: 0.9 });
  const leafM = std('#4f7a3a', { roughness: 0.9 });
  const leafD = std('#3a6130', { roughness: 0.9 });
  const lampMat = std('#e9dfc6', { emissive: '#ffb860', emissiveIntensity: 0, roughness: 0.8 });

  // ---------- Trời, sương, ánh sáng ----------
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  scene.fog = new THREE.Fog(0xdfe2da, 140, 620);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new THREE.Color('#7fb3d9') }, bottom: { value: new THREE.Color('#e4e2d6') } },
      vertexShader: 'varying vec3 vP;\nvoid main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP;\nvoid main(){ float h = clamp(normalize(vP).y * 1.6 + 0.08, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }',
    }),
  );
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xdfeaf2, 0x6b6248, 0.9);
  scene.add(hemi);
  const focus = new THREE.Vector3(0, 0, 30);
  const sun = new THREE.DirectionalLight(0xffe2b4, 3.0);
  sun.castShadow = quality === 'high';
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  batching = true;
  // ---------- Mặt đất, bờ kè, mặt hồ ----------
  {
    const grass = groundMat('grass', { tile: 5, macro: 0.3, tint: '#dbe2c8' });
    // khối đất bên bờ: mặt trên là cỏ, mặt trông ra hồ là kè đá (hạ thấp 4 cm so với LAND để các sân lát đá bên trên không bị nhấp nháy Z-fighting)
    const land = mesh(new THREE.BoxGeometry(900, 3, 700), [stoneD, stoneD, grass, stoneD, stoneD, stoneD], 0, LAND - 1.54, SHORE - 350, { cast: false });
    land.userData.kind = 'ground';
    pickables.push(land);
    // mặt hồ: gợn sóng vẽ bằng canvas, trôi chậm
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    const hgt = (x, y) => Math.sin(x * 0.098 + Math.sin(y * 0.05) * 2) * 0.5 + Math.sin(y * 0.123 + x * 0.031) * 0.5 + Math.sin((x + y) * 0.21) * 0.25;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const dx = hgt(x + 1, y) - hgt(x - 1, y), dy = hgt(x, y + 1) - hgt(x, y - 1);
        const i = (y * 256 + x) * 4;
        img.data[i] = 128 - dx * 60;
        img.data[i + 1] = 128 - dy * 60;
        img.data[i + 2] = 255;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const normal = new THREE.CanvasTexture(c);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(90, 90);
    const water = mesh(new THREE.PlaneGeometry(1400, 1400), std('#4b858a', { roughness: 0.12, metalness: 0.15, normalMap: normal, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.4 }), 0, 0, SHORE + 690, { cast: false });
    water.rotation.x = -Math.PI / 2;
    updaters.push((t) => normal.offset.set(t * 0.004, t * 0.007));
    // bờ hồ lát đá
    const prom = mesh(new THREE.PlaneGeometry(140, 13), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, LAND + 0.015, 45.8, { cast: false });
    prom.rotation.x = -Math.PI / 2;
    prom.userData.kind = 'ground';
    pickables.push(prom);
    // gờ kè và lan can đá dọc mép hồ (chừa lối xuống bến thuyền ở giữa)
    box(140, 0.35, 0.6, stone, 0, LAND + 0.17, SHORE - 0.3);
    for (let x = -69; x <= 69; x += 1.6) {
      if (Math.abs(x) < 2.6) continue;
      box(0.22, 0.8, 0.22, stone, x, LAND + 0.75, SHORE - 0.35);
    }
    for (const s of [-1, 1]) box(66.4, 0.14, 0.3, stone, s * 36, LAND + 1.2, SHORE - 0.35);
    // bến thuyền gỗ: dốc xuống từ bờ kè, mặt bến lát ván, cọc gỗ cắm xuống nước, lan can thấp, đèn ở đầu bến
    const plank = std('#8a6a44', { roughness: 0.8 });
    const post = std('#5b3b22', { roughness: 0.9 });
    const W = PIER.halfW * 2;
    const ramp = box(W, 0.12, Math.hypot(PIER.ramp, LAND - PIER.y) + 0.1, plank, 0, (LAND + PIER.y) / 2 - 0.06, SHORE + PIER.ramp / 2);
    ramp.rotation.x = -Math.atan2(PIER.y - LAND, PIER.ramp);
    const deckLen = PIER.z1 - SHORE - PIER.ramp;
    const deck = box(W, 0.14, deckLen, plank, 0, PIER.y - 0.07, SHORE + PIER.ramp + deckLen / 2);
    deck.userData.kind = 'ground';
    pickables.push(deck);
    for (let z = SHORE + 2.4; z <= PIER.z1 - 0.2; z += 2.2) {
      for (const s of [-1, 1]) {
        cyl(0.11, 0.13, 1.4, post, s * (PIER.halfW - 0.05), PIER.y - 0.6, z, {}, 8);
        // lan can thấp; phía thuyền đậu (bên phải) chừa trống đoạn đầu bến để bước xuống thuyền
        if (z < PIER.z1 - 3 && (s < 0 || z < BERTH.z - 4)) box(0.08, 0.5, 2.2, post, s * (PIER.halfW - 0.05), PIER.y + 0.25, z + 1.1);
      }
    }
    for (const s of [-1, 1]) {
      const lg = new THREE.Group();
      lg.position.set(s * (PIER.halfW - 0.2), PIER.y, PIER.z1 - 0.4);
      scene.add(lg);
      staticRoots.push(lg);
      cyl(0.06, 0.07, 1.6, post, 0, 0.8, 0, { parent: lg }, 8);
      box(0.3, 0.32, 0.3, lampMat, 0, 1.7, 0, { parent: lg });
      mesh(new THREE.ConeGeometry(0.3, 0.2, 4), post, 0, 1.95, 0, { parent: lg }).rotation.y = Math.PI / 4;
    }
    // đèn đá dọc bờ hồ
    for (let x = -60; x <= 60; x += 12) {
      if (Math.abs(x) < 6) continue;
      const lg = new THREE.Group();
      lg.position.set(x, LAND, 40.6);
      scene.add(lg);
      staticRoots.push(lg);
      box(0.6, 0.12, 0.6, stoneD, 0, 0.06, 0, { parent: lg });
      cyl(0.1, 0.12, 0.9, stone, 0, 0.57, 0, { parent: lg }, 8);
      box(0.55, 0.08, 0.55, stoneD, 0, 1.04, 0, { parent: lg });
      box(0.36, 0.32, 0.36, lampMat, 0, 1.24, 0, { parent: lg });
      mesh(new THREE.ConeGeometry(0.46, 0.28, 4), stoneD, 0, 1.54, 0, { parent: lg }).rotation.y = Math.PI / 4;
    }
  }

  // ---------- Núi đá vôi: đảo giữa hồ, núi quanh hồ, dãy núi phía sau chùa ----------
  {
    const karstM = karstMaterial();
    const geos = [karstGeometry(1.3), karstGeometry(4.7), karstGeometry(8.1), karstGeometry(2.6, 0.1)];
    const peaks = [];
    // đảo giữa hồ (x, z, bán kính, cao)
    for (const p of [[-110, 150, 16, 46], [-58, 205, 12, 34], [24, 165, 14, 52], [96, 138, 10, 30], [150, 220, 20, 62], [-175, 255, 22, 70], [70, 280, 18, 58], [-10, 330, 26, 80], [200, 150, 9, 26], [-35, 120, 7, 18]]) peaks.push([...p, -2]);
    // núi quanh hồ
    let seed = 11;
    const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (0.05 + 0.9 * (i / 25)), d = 380 + rr() * 140;
      peaks.push([Math.cos(a) * d * 1.2, SHORE + Math.sin(a) * d, 30 + rr() * 30, 60 + rr() * 70, -2]);
    }
    // dãy núi phía sau chùa (ba điện sẽ dựng trên sườn núi ở các đợt sau)
    for (const p of [[0, -225, 70, 110], [-95, -185, 42, 80], [95, -190, 46, 86], [-165, -110, 50, 80], [165, -115, 52, 84], [-240, -20, 60, 90], [240, -10, 60, 92]]) peaks.push([...p, LAND - 3]);
    const insts = geos.map((g) => new THREE.InstancedMesh(g, karstM, 40));
    const used = geos.map(() => 0);
    const o = new THREE.Object3D();
    peaks.forEach(([x, z, r, h, y], i) => {
      const v = i % geos.length;
      o.position.set(x, y, z);
      o.rotation.set(0, rr() * 6.28, 0);
      o.scale.set(r, h, r * (0.75 + rr() * 0.5));
      o.updateMatrix();
      insts[v].setMatrixAt(used[v]++, o.matrix);
    });
    insts.forEach((m, v) => {
      m.count = used[v];
      m.receiveShadow = true;
      scene.add(m);
    });
  }

  // ---------- Thuyền gỗ chở khách quanh hồ: mái che cong, cô lái đội nón lá chèo ở đuôi ----------
  // Đường đi: lùi ra khỏi bến, vòng qua các đảo rồi cập bến lại, mũi thuyền hướng vào bờ.
  const route = new THREE.CatmullRomCurve3([
    [BERTH.x, BERTH.z], [3.4, 72], [16, 90], [52, 110], [66, 158], [52, 212], [8, 238], [-28, 205], [-30, 168], [-72, 150], [-70, 112], [-40, 92], [-6, 86], [4.5, 74], [BERTH.x, BERTH.z],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const boats = [];
  {
    const hullM = std('#5b3b22', { roughness: 0.75 });
    const plankM = std('#8a6a44', { roughness: 0.8 });
    const canopyM = std('#b48a52', { roughness: 0.85, side: THREE.DoubleSide });
    const hatM = std('#d9c48a', { roughness: 0.9 });
    const shirtM = std('#4b5d6e', { roughness: 0.9 });
    const skinM = std('#e3b48c', { roughness: 0.8 });
    // thân thuyền: khối hộp vuốt nhọn hai đầu, hai đầu cong vểnh lên
    const hullGeo = new THREE.BoxGeometry(1.7, 0.55, 6.4, 2, 1, 14);
    {
      const p = hullGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const z = p.getZ(i) / 3.2, k = z * z;
        p.setX(i, p.getX(i) * (1 - 0.85 * k * (p.getY(i) < 0 ? 1.05 : 1)));
        p.setY(i, p.getY(i) + 0.38 * k * k);
      }
      hullGeo.computeVertexNormals();
    }
    for (let i = 0; i < BOATS; i++) {
      const g = new THREE.Group();
      g.userData = { kind: 'boat', index: i };
      scene.add(g);
      mesh(hullGeo, hullM, 0, 0.02, 0, { parent: g });
      box(1.3, 0.06, 4.4, plankM, 0, 0.27, 0, { parent: g, cast: false });
      for (const z of [-1.4, 0.2, 1.6]) box(1.25, 0.06, 0.3, plankM, 0, 0.45, z, { parent: g });
      // mái che cong bằng tre đan ở giữa thuyền
      const canopy = mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.4, 14, 1, true, -Math.PI / 2, Math.PI), canopyM, 0, 0.75, 0.3, { parent: g });
      canopy.rotation.x = Math.PI / 2;
      canopy.rotation.y = Math.PI / 2;
      // cô lái đứng ở đuôi thuyền, đội nón lá, cầm mái chèo
      const rower = new THREE.Group();
      rower.position.set(0, 0.3, -2.5);
      g.add(rower);
      mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.85, 10), shirtM, 0, 0.45, 0, { parent: rower });
      mesh(new THREE.SphereGeometry(0.15, 12, 10), skinM, 0, 1.02, 0, { parent: rower });
      mesh(new THREE.ConeGeometry(0.42, 0.26, 18), hatM, 0, 1.22, 0, { parent: rower });
      const oar = new THREE.Group();
      oar.position.set(0.35, 0.75, 0);
      rower.add(oar);
      const shaft = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), plankM, 0, -0.6, -0.5, { parent: oar });
      shaft.rotation.x = 0.55;
      mesh(new THREE.BoxGeometry(0.06, 0.6, 0.18), plankM, 0, -1.65, -1.25, { parent: oar }).rotation.x = 0.55;
      g.userData.oar = oar;
      boats.push(g);
    }
  }
  // vị trí thuyền i lúc `now` (giây, đồng hồ chung): đậu bến hay đang đi, toạ độ, hướng, còn bao lâu
  const bp = new THREE.Vector3(), bt = new THREE.Vector3();
  route.getTangentAt(1, bt);
  const dockRy = Math.atan2(bt.x, bt.z); // đậu bến: mũi hướng vào bờ như lúc cập bến
  const turn = (a, b, k) => a + ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI) * k;
  function boatState(i, now = Date.now() / 1000) {
    const s = (((now + (i * BOAT_PERIOD) / BOATS) % BOAT_PERIOD) + BOAT_PERIOD) % BOAT_PERIOD;
    if (s < BOAT_DOCK) return { docked: true, left: BOAT_DOCK - s, x: BERTH.x, z: BERTH.z, ry: dockRy, u: 0 };
    const u0 = (s - BOAT_DOCK) / (BOAT_PERIOD - BOAT_DOCK), u = u0 * u0 * (3 - 2 * u0); // rời bến và cập bến chậm
    route.getPointAt(u, bp);
    route.getTangentAt(u, bt);
    let ry = Math.atan2(bt.x, bt.z);
    // lúc rời bến thuyền lùi ra, cách bến vài mét mới quay mũi ra hồ
    if (u0 < 0.5) ry = turn(dockRy, ry, Math.min(1, Math.max(0, (bp.z - BERTH.z - 4) / 8)));
    return { docked: false, left: BOAT_PERIOD - s, x: bp.x, z: bp.z, ry, u };
  }
  updaters.push((t) => {
    const now = Date.now() / 1000;
    boats.forEach((g, i) => {
      const st = boatState(i, now);
      g.position.set(st.x, Math.sin(t * 1.3 + i) * 0.05, st.z);
      g.rotation.set(Math.sin(t * 0.9 + i) * 0.02, st.ry, Math.sin(t * 1.1 + i * 2) * 0.03);
      g.userData.oar.rotation.y = st.docked ? 0.2 : Math.sin(t * 1.6 + i) * 0.5;
    });
  });

  // ---------- Cổng Tam Quan sát hồ: cửa giữa hai tầng mái, hai cửa bên, tường bao ----------
  {
    const g = new THREE.Group();
    scene.add(g);
    staticRoots.push(g);
    const Z = GATE.z, Y = LAND + GATE.plinth;
    box(34, GATE.plinth, 7, stone, 0, LAND + GATE.plinth / 2, Z, { parent: g });
    // cửa giữa: bốn cột lớn, mái dưới, thân gác có biển tên, mái trên với lưỡng long chầu nguyệt
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.42, 0.48, 6.6, red, sx * 3.1, Y + 3.3, Z + sz * 1.9, { parent: g }, 16);
    box(7.4, 0.5, 4.6, red, 0, Y + 6.8, Z, { parent: g });
    curvedRoof(g, 0, Y + 6.9, Z, 6.6, 4.2, 1.5, 2.2, { lift: 1.0 });
    box(9.4, 2.2, 3.8, wallM, 0, Y + 9.4, Z, { parent: g });
    const plaque = (z, rot) => {
      box(5.0, 1.25, 0.08, ARCH.gold, 0, Y + 9.45, z, { parent: g, cast: false });
      // tấm chữ nằm trước khung viền (không thì bị khung che mất)
      const p = mesh(new THREE.PlaneGeometry(4.7, 1.0), std('#ffffff', { map: T.boardTexture(['TAM CHÚC'], { w: 1024, h: 220, size: 130 }), roughness: 0.45 }), 0, Y + 9.45, z + Math.sign(z - Z) * 0.06, { parent: g, cast: false });
      p.rotation.y = rot;
    };
    plaque(Z + 1.97, 0);
    plaque(Z - 1.97, Math.PI);
    const top = curvedRoof(g, 0, Y + 10.4, Z, 5.8, 3.4, 2.4, 3.0, { lift: 1.2 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, Z, top.rx);
    // hai cửa bên: cột, mái một tầng
    for (const sx of [-1, 1]) {
      const cx = sx * 9.7;
      for (const dx of [-1.6, 1.6]) for (const sz of [-1, 1]) cyl(0.3, 0.34, 4.6, red, cx + dx, Y + 2.3, Z + sz * 1.6, { parent: g }, 14);
      box(3.8, 0.4, 3.8, red, cx, Y + 4.75, Z, { parent: g });
      curvedRoof(g, cx, Y + 4.9, Z, 3.0, 2.8, 1.4, 2.0, { lift: 0.8 });
      // tường nối và tường bao chạy dọc bờ ra hai phía
      box(3.6, 3.4, 0.8, wallM, sx * 5.0, Y + 1.7, Z, { parent: g });
      box(47, 2.8, 0.7, wallM, sx * 35.5, LAND + 1.4, Z, { parent: g });
      box(47.4, 0.22, 1.1, std('#6a3426', { roughness: 0.75 }), sx * 35.5, LAND + 2.9, Z, { parent: g });
    }
    // sư tử đá trông ra hồ
    for (const sx of [-1, 1]) {
      box(1.0, 0.7, 1.0, stoneD, sx * 4.0, Y + 0.35, Z + 3.0, { parent: g });
      mesh(new THREE.SphereGeometry(0.48, 12, 10), stone, sx * 4.0, Y + 1.1, Z + 3.05, { parent: g }).scale.set(0.9, 1.1, 1);
      mesh(new THREE.SphereGeometry(0.34, 12, 10), stone, sx * 4.0, Y + 1.7, Z + 3.2, { parent: g });
    }
  }

  // ---------- Sân lớn sau cổng: lát đá tấm, đỉnh đồng giữa sân, đèn và cây ----------
  {
    const plaza = mesh(new THREE.PlaneGeometry(PLAZA.maxX - PLAZA.minX, PLAZA.maxZ - PLAZA.minZ), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, LAND + 0.015, (PLAZA.minZ + PLAZA.maxZ) / 2, { cast: false });
    plaza.rotation.x = -Math.PI / 2;
    plaza.userData.kind = 'ground';
    pickables.push(plaza);
    // đỉnh đồng ba chân giữa sân
    const bronze = std('#6e5530', { metalness: 0.75, roughness: 0.4 });
    const { x: cx, z: cz } = CAULDRON;
    cyl(2.4, 2.6, 0.5, stone, cx, LAND + 0.25, cz, {}, 32);
    const prof = [[0, 0], [1.1, 0.05], [1.45, 0.5], [1.5, 1.1], [1.35, 1.45], [1.55, 1.55], [1.55, 1.65]].map(([x, y]) => new THREE.Vector2(x, y));
    const pot = mesh(new THREE.LatheGeometry(prof, 32), bronze, cx, LAND + 1.3, cz);
    pot.material.side = THREE.DoubleSide;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      cyl(0.16, 0.12, 0.85, bronze, cx + Math.cos(a) * 0.9, LAND + 0.9, cz + Math.sin(a) * 0.9, {}, 8);
    }
    for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.35, 0.07, 8, 16), bronze, cx + s * 1.6, LAND + 3.0, cz).rotation.y = Math.PI / 2;
    // hai hàng cột đèn và cây xanh hai bên sân
    const trunkM = std('#5e4a38', { roughness: 0.9 });
    for (const s of [-1, 1]) {
      for (let z = -32; z <= 26; z += 10) {
        cyl(0.12, 0.16, 3.4, stoneD, s * 14, LAND + 1.7, z, {}, 8);
        box(0.6, 0.6, 0.6, lampMat, s * 14, LAND + 3.6, z);
        mesh(new THREE.ConeGeometry(0.55, 0.4, 4), red, s * 14, LAND + 4.1, z).rotation.y = Math.PI / 4;
      }
      for (let z = -34; z <= 28; z += 12) {
        const tx = s * 44;
        cyl(0.3, 0.4, 1.0, stoneD, tx, LAND + 0.5, z, {}, 12);
        mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.4, 8), trunkM, tx, LAND + 2, z);
        mesh(new THREE.SphereGeometry(1.8, 14, 10), leafM, tx, LAND + 4.2, z).scale.set(1, 0.8, 1);
        mesh(new THREE.SphereGeometry(1.2, 12, 9), leafD, tx + s * 0.4, LAND + 5.0, z - 0.4);
      }
    }
  }

  // ---------- Vườn kinh: cột đá khắc kinh, lối đi, cổng đá, phù điêu đời Đức Phật ----------
  const pillars = [];
  {
    const G = SUTRA_GARDEN;
    // nền lát đá ô nhỏ cho vườn và lối sang từ sân
    const floor = mesh(new THREE.PlaneGeometry(G.maxX - G.minX + 2, G.maxZ - G.minZ + 2), groundMat('tile', { tile: 3, macro: 0.04, tint: '#f2ece0' }), (G.minX + G.maxX) / 2, LAND + 0.015, (G.minZ + G.maxZ) / 2, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    floor.userData.kind = 'ground';
    pickables.push(floor);
    const lane = mesh(new THREE.PlaneGeometry(7, 6), groundMat('tile', { tile: 4, macro: 0.05 }), -51.5, LAND + 0.015, -16, { cast: false });
    lane.rotation.x = -Math.PI / 2;
    lane.userData.kind = 'ground';
    pickables.push(lane);
    // tường đá thấp bao quanh vườn (chừa lối vào phía sân)
    const wallLow = std('#9f988a', { roughness: 1 });
    for (const z of [G.minZ - 0.6, G.maxZ + 0.6]) box(G.maxX - G.wallX + 1, 0.7, 0.5, wallLow, (G.maxX + G.wallX) / 2 + 0.5, LAND + 0.35, z);
    box(0.5, 0.7, -19.6 - (G.minZ - 0.6), wallLow, G.maxX + 0.6, LAND + 0.35, (-19.6 + G.minZ - 0.6) / 2);
    box(0.5, 0.7, G.maxZ + 0.6 + 12.4, wallLow, G.maxX + 0.6, LAND + 0.35, (G.maxZ + 0.6 - 12.4) / 2);
    // cổng đá "VƯỜN KINH" trên lối vào
    {
      const gw = new THREE.Group();
      gw.position.set(-51.5, LAND, -16);
      gw.rotation.y = Math.PI / 2;
      scene.add(gw);
      staticRoots.push(gw);
      for (const s of [-1, 1]) box(0.6, 3.6, 0.6, stone, s * 3.6, 1.8, 0, { parent: gw });
      box(8.2, 0.5, 0.8, stone, 0, 3.75, 0, { parent: gw });
      curvedRoof(gw, 0, 4.0, 0, 4.4, 1.1, 0.8, 0.8, { lift: 0.5 });
      box(3.4, 0.7, 0.06, ARCH.gold, 0, 3.15, 0.42, { parent: gw, cast: false });
      mesh(new THREE.PlaneGeometry(3.2, 0.56), std('#ffffff', { map: T.boardTexture(['VƯỜN KINH'], { w: 1024, h: 180, size: 110 }), roughness: 0.45 }), 0, 3.15, 0.46, { parent: gw, cast: false });
    }
    // cột kinh: bệ đá, thân vuông khắc chữ bốn mặt, đầu cột hoa sen, bầu đá trên cùng
    const res = quality === 'high' ? 1 : 0.6;
    const carvedTex = (p, i) => {
      const w = Math.round(128 * res), h = Math.round(768 * res);
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const g = cv.getContext('2d');
      g.fillStyle = '#bcb5a6';
      g.fillRect(0, 0, w, h);
      for (let k = 0; k < 900 * res; k++) {
        g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '60,55,45'},${Math.random() * 0.08})`;
        g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      g.strokeStyle = 'rgba(70,60,45,0.5)';
      g.lineWidth = 2;
      g.strokeRect(6 * res, 6 * res, w - 12 * res, h - 12 * res);
      // chữ khắc lõm: nét tối, viền sáng phía dưới
      const write = (txt, y, size, color) => {
        g.font = `700 ${size}px "Noto Serif", "Times New Roman", Georgia, serif`;
        g.textAlign = 'center';
        g.fillStyle = 'rgba(255,250,235,0.55)';
        g.fillText(txt, w / 2, y + 1.2);
        g.fillStyle = color;
        g.fillText(txt, w / 2, y);
      };
      write(`${i + 1}`, 34 * res, 22 * res, '#6b2a1c');
      const words = p.text.split(' ');
      const lines = [];
      let line = '';
      g.font = `700 ${15 * res}px "Noto Serif", "Times New Roman", Georgia, serif`;
      for (const wd of words) {
        const t = line ? line + ' ' + wd : wd;
        if (g.measureText(t).width > w - 22 * res && line) {
          lines.push(line);
          line = wd;
        } else line = t;
      }
      if (line) lines.push(line);
      lines.forEach((ln, k) => write(ln, (70 + k * 24) * res, 15 * res, '#3d342a'));
      // hoa sen chạm ở chân cột
      g.strokeStyle = 'rgba(60,50,40,0.55)';
      g.lineWidth = 2 * res;
      const cy = h - 70 * res;
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.ellipse(w / 2 + k * 14 * res, cy, 8 * res, 22 * res, k * 0.3, 0, Math.PI * 2);
        g.stroke();
      }
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const capM = std('#b7b0a2', { roughness: 0.9 });
    PILLAR_POS.forEach((p, i) => {
      box(1.6, 0.5, 1.6, stoneD, p.x, LAND + 0.25, p.z);
      box(1.25, 0.25, 1.25, stone, p.x, LAND + 0.62, p.z);
      const shaft = box(0.9, 5.4, 0.9, std('#ffffff', { map: carvedTex(PILLARS[i], i), roughness: 0.9 }), p.x, LAND + 0.75 + 2.7, p.z);
      shaft.userData = { kind: 'pillar', index: i };
      pillars.push(shaft);
      cyl(0.75, 0.5, 0.5, capM, p.x, LAND + 6.4, p.z, {}, 16);
      mesh(new THREE.SphereGeometry(0.45, 14, 10), capM, p.x, LAND + 6.95, p.z).scale.y = 0.8;
      mesh(new THREE.ConeGeometry(0.16, 0.6, 10), capM, p.x, LAND + 7.55, p.z);
    });
    // phù điêu đá cuối vườn: sáu cảnh đời Đức Phật
    {
      const scenes = ['Đản sinh', 'Xuất gia', 'Khổ hạnh', 'Thành đạo', 'Chuyển pháp luân', 'Nhập Niết Bàn'];
      const W = 512, H = 256;
      const draw = (g, k) => {
        g.fillStyle = '#b3ab9b';
        g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(70,60,45,0.6)';
        g.lineWidth = 6;
        g.strokeRect(8, 8, W - 16, H - 16);
        // hình nổi: vẽ bóng tối lệch xuống rồi phủ màu sáng
        const relief = (fn) => {
          g.save();
          g.translate(3, 4);
          g.fillStyle = 'rgba(60,50,38,0.55)';
          fn();
          g.restore();
          g.fillStyle = '#d8d0bf';
          fn();
        };
        const circle = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
        const ell = (x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
        const seated = (x, y, s = 1) => { circle(x, y - 46 * s, 14 * s); ell(x, y - 14 * s, 22 * s, 26 * s); ell(x, y + 12 * s, 40 * s, 12 * s); };
        const tree = (x, y, r) => { g.fillRect(x - 5, y, 10, 70); circle(x, y, r); circle(x - r * 0.7, y + 12, r * 0.7); circle(x + r * 0.7, y + 12, r * 0.7); };
        relief(() => {
          if (k === 0) { // Đản sinh: em bé đứng trên hoa sen, bảy đóa sen
            circle(256, 92, 13); ell(256, 128, 14, 26); ell(256, 166, 34, 9);
            for (let j = 0; j < 7; j++) ell(100 + j * 52, 200, 14, 7);
          } else if (k === 1) { // Xuất gia: ngựa phi, người cưỡi
            ell(250, 140, 70, 28); ell(330, 105, 18, 32, -0.6); g.fillRect(200, 155, 10, 50); g.fillRect(290, 155, 10, 50);
            circle(240, 82, 13); ell(240, 112, 13, 20);
          } else if (k === 2) { // Khổ hạnh: ngồi dưới gốc cây, thân gầy
            tree(130, 70, 46); seated(290, 170, 0.9);
          } else if (k === 3) { // Thành đạo: ngồi thiền dưới cội bồ đề
            circle(256, 78, 70); seated(256, 185, 1.1);
          } else if (k === 4) { // Chuyển pháp luân: bánh xe pháp, hai con nai
            circle(256, 110, 50); ell(140, 180, 36, 16); ell(372, 180, 36, 16); circle(165, 158, 9); circle(347, 158, 9);
          } else { // Nhập Niết Bàn: nằm nghiêng giữa hai cây
            tree(80, 70, 40); tree(432, 70, 40); ell(256, 170, 110, 20); circle(160, 158, 15);
          }
        });
        if (k === 4) {
          g.strokeStyle = 'rgba(70,60,45,0.6)';
          g.lineWidth = 4;
          for (let j = 0; j < 8; j++) {
            const a = (j / 8) * Math.PI * 2;
            g.beginPath();
            g.moveTo(256, 110);
            g.lineTo(256 + Math.cos(a) * 46, 110 + Math.sin(a) * 46);
            g.stroke();
          }
        }
        g.font = '700 26px "Noto Serif", "Times New Roman", Georgia, serif';
        g.textAlign = 'center';
        g.fillStyle = '#4a3d2e';
        g.fillText(scenes[k], W / 2, H - 22);
      };
      const G2 = SUTRA_GARDEN;
      const span = G2.maxZ - G2.minZ + 1.2, pw = span / 6;
      box(1.0, 5.2, span + 0.8, stoneD, G2.wallX - 0.5, LAND + 2.6, (G2.minZ + G2.maxZ) / 2);
      box(1.4, 0.4, span + 1.2, stone, G2.wallX - 0.5, LAND + 5.4, (G2.minZ + G2.maxZ) / 2);
      scenes.forEach((_, k) => {
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        draw(cv.getContext('2d'), k);
        const t = new THREE.CanvasTexture(cv);
        t.colorSpace = THREE.SRGBColorSpace;
        const pnl = mesh(new THREE.PlaneGeometry(pw - 0.4, (pw - 0.4) / 2), std('#ffffff', { map: t, roughness: 0.95 }), G2.wallX + 0.02, LAND + 2.6, G2.maxZ + 0.6 - pw * (k + 0.5), { cast: false });
        pnl.rotation.y = Math.PI / 2;
      });
    }
    // cây bồ đề và đèn đá trong vườn
    const trunk = std('#6b5a48', { roughness: 0.95 });
    for (const [tx, tz] of [[-58, -28], [-58, 22], [-109, -28], [-109, 22], [-84, -28], [-84, 22]]) {
      cyl(0.3, 0.45, 2.8, trunk, tx, LAND + 1.4, tz, {}, 10);
      mesh(new THREE.SphereGeometry(2.2, 14, 10), leafM, tx, LAND + 4.4, tz).scale.set(1.1, 0.75, 1.1);
      mesh(new THREE.SphereGeometry(1.5, 12, 9), leafD, tx + 0.8, LAND + 5.2, tz - 0.4);
    }
    for (const z of [-3, 11]) { // lối giữa các hàng cột (lối -17 là đường vào, để trống)
      for (let x = -64; x >= -106; x -= 13.2) {
        cyl(0.1, 0.12, 1.0, stone, x, LAND + 0.5, z, {}, 8);
        box(0.36, 0.32, 0.36, lampMat, x, LAND + 1.15, z);
        mesh(new THREE.ConeGeometry(0.44, 0.26, 4), stoneD, x, LAND + 1.45, z).rotation.y = Math.PI / 4;
      }
    }
  }

  // ---------- Sườn núi: ba nền đá, bậc thang, ba điện (Quan Âm, Pháp Chủ, Tam Thế) ----------
  const lods = [];
  {
    const retainM = std('#8f897d', { roughness: 1 });
    const paveM = groundMat('slab', { tile: 5.5, macro: 0.05 });
    const stepM = std('#b8b1a3', { roughness: 0.95 });
    const floorTex = T.woodFloor();
    for (const Tr of TERRACES) {
      const d = Tr.front - Tr.back, cz = (Tr.front + Tr.back) / 2, h = Tr.y - LAND;
      box(Tr.halfX * 2, h - 0.04, d, retainM, 0, LAND + (h - 0.04) / 2, cz);
      const top = mesh(new THREE.PlaneGeometry(Tr.halfX * 2, d), paveM, 0, Tr.y + 0.015, cz, { cast: false });
      top.rotation.x = -Math.PI / 2;
      top.userData.kind = 'ground';
      pickables.push(top);
      // lan can đá dọc mép trước nền (chừa lối bậc thang)
      for (const s of [-1, 1]) box(Tr.halfX - 4.6, 0.7, 0.3, stone, s * (Tr.halfX + 4.6) / 2, Tr.y + 0.35, Tr.front - 0.2);
    }
    // bậc thang đá có lan can dốc hai bên
    for (const S of STAIRS) {
      const len = S.bottom - S.top, rise = S.y1 - S.y0, n = Math.max(8, Math.round(rise / 0.3));
      const steps = new THREE.Group();
      steps.userData.kind = 'ground';
      scene.add(steps);
      pickables.push(steps);
      for (let i = 0; i < n; i++) {
        const hh = (S.y0 - LAND) + ((i + 1) * rise) / n;
        box(S.x * 2, hh, len / n + 0.02, stepM, 0, LAND + hh / 2, S.bottom - (i + 0.5) * (len / n), { parent: steps });
      }
      const L = Math.hypot(len, rise), tilt = Math.atan2(rise, len);
      for (const s of [-1, 1]) {
        const rail = box(0.4, 0.9, L, stone, s * (S.x + 0.2), (S.y0 + S.y1) / 2 + 0.45, (S.top + S.bottom) / 2);
        rail.rotation.x = tilt;
      }
    }
    // điện: nền, sàn gỗ, tường, cột son, mái chồng diêm có lưỡng long chầu nguyệt, bàn thờ, tượng, nến, đèn ấm
    const candleM = std('#f3e8d0', { emissive: '#ffb860', emissiveIntensity: 0.6, roughness: 0.6 });
    const lacquer = std('#7d2217', { roughness: 0.38 });
    function hall(Tr, placeStatue) {
      const H = Tr.hall, y = Tr.y, w = H.hx * 2, d = H.front - H.back, cz = (H.front + H.back) / 2;
      box(w + 1.4, 0.24, d + 1.6, stone, 0, y + 0.12, cz + 0.3);
      const fl = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, y + 0.25, cz, { cast: false });
      fl.rotation.x = -Math.PI / 2;
      fl.userData.kind = 'ground';
      pickables.push(fl);
      box(2.4, 0.02, d - 3.5, std('#7a271c', { roughness: 1 }), 0, y + 0.268, cz + 1.4, { cast: false });
      box(w, 6.4, 0.3, wallM, 0, y + 3.45, H.back + 0.15);
      for (const sx of [-1, 1]) {
        box(0.3, 6.4, d, wallM, sx * (H.hx - 0.15), y + 3.45, cz);
        for (let k = 1; k < 4; k++) box(0.08, 1.6, 1.3, std('#2c2018', { roughness: 0.8 }), sx * (H.hx - 0.32), y + 3.2, H.back + (d * k) / 4);
      }
      for (const cx of [-(H.hx - 0.5), -H.hx * 0.55, -3.6, 3.6, H.hx * 0.55, H.hx - 0.5]) cyl(0.32, 0.36, 6.4, red, cx, y + 3.45, H.front - 0.2, {}, 14);
      box(w, 0.5, 0.4, red, 0, y + 6.45, H.front - 0.2);
      box(w, 0.1, d, std('#5b3a24', { roughness: 0.7 }), 0, y + 6.65, cz, { cast: false });
      // mái chồng diêm
      const s1 = (d / 2 + 1.6) * 0.38;
      curvedRoof(scene, 0, y + 6.6, cz, H.hx + 1.6, d / 2 + 1.6, 1.3, s1, { lift: 1.1 });
      box(w * 0.62, 1.9, d * 0.55, wallM, 0, y + 8.8, cz);
      box(5.4, 1.15, 0.06, ARCH.gold, 0, y + 8.8, cz + d * 0.275 + 0.03, { cast: false });
      mesh(new THREE.PlaneGeometry(5.2, 1.0), std('#ffffff', { map: T.boardTexture([Tr.plaque], { w: 1024, h: 196, size: 110 }), roughness: 0.45 }), 0, y + 8.8, cz + d * 0.275 + 0.07, { cast: false });
      const hx2 = w * 0.31 + 1.5, hz2 = d * 0.275 + 1.5;
      const top = curvedRoof(scene, 0, y + 9.75, cz, hx2, hz2, 2.3, hz2 - 0.4, { lift: 1.2 });
      dragonsOnRidge(scene, 0, top.yTop + 0.42, cz, top.rx);
      // bàn thờ, tượng, nến
      box(w * 0.6, 1.1, 2.2, lacquer, 0, y + 0.8, H.back + 1.7);
      box(w * 0.6 + 0.2, 0.08, 2.4, ARCH.gold, 0, y + 1.39, H.back + 1.7, { cast: false });
      placeStatue(y + 1.43, H.back + 1.7);
      for (const cx of [-w * 0.24, w * 0.24]) {
        cyl(0.05, 0.05, 0.3, candleM, cx, y + 1.58, H.back + 2.6, {}, 8);
        cyl(0.1, 0.12, 0.06, std('#6e5530', { metalness: 0.75, roughness: 0.4 }), cx, y + 1.45, H.back + 2.6, {}, 10);
      }
      const L = new THREE.PointLight('#ffc27a', 8, 18, 2);
      L.position.set(0, y + 4.6, cz);
      scene.add(L);
      nightHooks.push((night) => (L.intensity = 8 + 24 * night));
    }
    const q = quality === 'high' ? 'high' : 'low';
    // điện Quan Âm: tượng Quan Âm đứng trên tòa sen, dát vàng
    hall(TERRACES[0], (y, z) => {
      const qa = makeQuanAm({ quality: q });
      const gilt = new Map();
      qa.traverse((m) => {
        if (!m.isMesh) return;
        if (!gilt.has(m.material)) {
          const gm = m.material.clone();
          gm.color = new THREE.Color('#f3c560');
          gm.metalness = 0.85;
          gm.roughness = 0.3;
          gm.envMapIntensity = 1.6;
          gilt.set(m.material, gm);
        }
        m.material = gilt.get(m.material);
        m.castShadow = false;
      });
      qa.position.set(0, y, z);
      qa.scale.setScalar(1.2);
      scene.add(qa);
      lods.push({ obj: qa, z });
      swapToCarvedQuanAm(qa).catch((e) => console.warn('Không nạp được tượng mẫu Quan Âm, giữ tượng cũ', e));
    });
    // điện Pháp Chủ: một tượng Phật lớn ấn xúc địa; điện Tam Thế: ba tượng Phật
    const thichca = makeThichCa(); // cùng mẫu tượng chánh điện Am Mây
    hall(TERRACES[1], (y, z) => {
      thichca.position.set(0, y, z);
      thichca.scale.setScalar(1.45);
      thichca.traverse((m) => (m.castShadow = false));
      scene.add(thichca);
      lods.push({ obj: thichca, z });
    });
    const thien = makeBuddha({ quality: 'low' });
    hall(TERRACES[2], (y, z) => {
      for (const x of [-5.4, 0, 5.4]) {
        const b = x === 0 ? thien : thien.clone();
        b.position.set(x, y, z);
        b.scale.setScalar(1.1);
        b.traverse((m) => (m.castShadow = false));
        scene.add(b);
        lods.push({ obj: b, z });
      }
    });
    // đèn đá hai bên sân trước mỗi điện
    for (const Tr of TERRACES) {
      for (const s of [-1, 1]) {
        const lx = s * (Tr.hall.hx + 4), lz = Tr.front - 3;
        cyl(0.1, 0.12, 1.0, stone, lx, Tr.y + 0.5, lz, {}, 8);
        box(0.4, 0.36, 0.4, lampMat, lx, Tr.y + 1.18, lz);
        mesh(new THREE.ConeGeometry(0.48, 0.28, 4), stoneD, lx, Tr.y + 1.5, lz).rotation.y = Math.PI / 4;
      }
    }
  }

  batching = false;

  // ---------- Cây cối: rừng cây và bụi tre quanh bờ hồ, sân lớn, vườn kinh, hai bên sườn núi ----------
  {
    let seed = 29;
    const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const spots = [];
    const area = (x0, x1, z0, z1, n) => {
      for (let i = 0; i < n; i++) spots.push([x0 + rr() * (x1 - x0), z0 + rr() * (z1 - z0)]);
    };
    for (const s of [-1, 1]) {
      area(s > 0 ? 72 : -135, s > 0 ? 135 : -72, 18, 50, 34); // hai đầu bờ hồ
      area(s > 0 ? 34 : -70, s > 0 ? 75 : -32, -175, -48, 40); // hai bên sườn núi
    }
    area(52, 105, -42, 30, 30); // phía đông sân lớn
    area(-110, -60, 26.5, 33.5, 10); // giữa vườn kinh và tường cổng
    area(-135, -116, -32, 26, 12); // sau bức phù điêu
    // thân và hai lớp tán, mỗi cây một sắc lá hơi khác
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 7).translate(0, 1.5, 0), std('#5e4a38', { roughness: 0.95 }), spots.length);
    const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.9, 1), std('#ffffff', { roughness: 0.9, flatShading: true }), spots.length * 2);
    const o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z], i) => {
      const s = 0.8 + rr() * 0.7;
      o.position.set(x, LAND, z);
      o.rotation.set(0, rr() * 6.28, 0);
      o.scale.setScalar(s);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 2; k++) {
        o.position.set(x + (k ? 0.7 : -0.3) * s, LAND + (3.2 + k * 1.1) * s, z + (k ? -0.4 : 0.3) * s);
        o.scale.set(s * (k ? 0.75 : 1.05), s * (k ? 0.7 : 0.8), s * (k ? 0.75 : 1.05));
        o.updateMatrix();
        crown.setMatrixAt(i * 2 + k, o.matrix);
        crown.setColorAt(i * 2 + k, c.setHSL(0.25 + rr() * 0.06, 0.38 + rr() * 0.15, 0.24 + rr() * 0.1));
      }
    });
    trunk.castShadow = crown.castShadow = true;
    crown.receiveShadow = true;
    scene.add(trunk, crown);
    // bụi tre: thân thẳng, chùm lá ở ngọn
    const bamboo = [];
    const grove = (cx, cz, n) => {
      for (let i = 0; i < n; i++) bamboo.push([cx + (rr() - 0.5) * 6, cz + (rr() - 0.5) * 6]);
    };
    for (const [x, z] of [[-76, 46], [76, 46], [-95, 30], [95, 32], [-52, 30], [52, 30], [-60, -40], [60, -45], [-36, -100], [36, -105], [-40, -150], [40, -155]]) grove(x, z, 14);
    const stalks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 5).translate(0, 4.5, 0), std('#7d9a4c', { roughness: 0.6 }), bamboo.length);
    const leafs = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshStandardMaterial({ map: T.bambooLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), bamboo.length * 2);
    bamboo.forEach(([x, z], i) => {
      const s = 0.75 + rr() * 0.45;
      o.position.set(x, LAND - 0.05, z);
      o.rotation.set((rr() - 0.5) * 0.12, 0, (rr() - 0.5) * 0.12);
      o.scale.set(1, s, 1);
      o.updateMatrix();
      stalks.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 2; k++) {
        o.position.set(x + (rr() - 0.5) * 1.6, LAND + (5.5 + rr() * 3.5) * s, z + (rr() - 0.5) * 1.6);
        o.rotation.set((rr() - 0.5), rr() * Math.PI, (rr() - 0.5) * 0.8);
        o.scale.setScalar(0.8 + rr() * 0.6);
        o.updateMatrix();
        leafs.setMatrixAt(i * 2 + k, o.matrix);
      }
    });
    stalks.castShadow = true;
    scene.add(stalks, leafs);
  }

  // ---------- Ngày và đêm theo giờ Việt Nam ----------
  const dayTop = new THREE.Color('#7fb3d9'), nightTop = new THREE.Color('#0b1424');
  const dayBot = new THREE.Color('#e4e2d6'), nightBot = new THREE.Color('#1b2233');
  const tmp = new THREE.Color();
  let hourOverride = null, night = 0, lastSet = -99;
  const vnHour = () => (((Date.now() / 3.6e6 + 7) % 24) + 24) % 24;
  function applyHour(h) {
    const th = (Math.PI * (h - 6)) / 12, el = Math.sin(th);
    const day = Math.min(1, Math.max(0, el * 3 + 0.25));
    night = 1 - day;
    sky.material.uniforms.top.value.copy(nightTop).lerp(dayTop, day);
    sky.material.uniforms.bottom.value.copy(nightBot).lerp(dayBot, day);
    scene.fog.color.copy(tmp.copy(nightBot).lerp(dayBot, day));
    sun.intensity = 3.0 * day + 0.15;
    sun.color.set(el < 0.25 ? '#ffc890' : '#ffe2b4');
    hemi.intensity = 0.25 + 0.75 * day;
    scene.environmentIntensity = 0.12 + 0.25 * day;
    sunDir.set(Math.cos(th) * 60, 20 + Math.max(el, 0.1) * 70, 25);
    lampMat.emissiveIntensity = 2.2 * night;
    for (const f of nightHooks) f(night);
  }
  const sunDir = new THREE.Vector3(40, 60, 25);
  applyHour(vnHour());
  updaters.push((t) => {
    if (t - lastSet < 10) return;
    lastSet = t;
    applyHour(hourOverride ?? vnHour());
  });

  // Gộp các vật đứng yên theo vật liệu (bỏ qua vật bấm được, cột kinh, vật nhiều vật liệu)
  {
    const skip = new Set(pillars);
    for (const p of pickables) p.traverse((x) => skip.add(x));
    const groups = new Map();
    for (const root of staticRoots) {
      if (skip.has(root) || !root.parent) continue;
      root.updateMatrixWorld(true);
      const list = [];
      root.traverse((m) => m.isMesh && !m.isInstancedMesh && !skip.has(m) && !Array.isArray(m.material) && list.push(m));
      for (const m of list) {
        const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld);
        if (!g.attributes.uv || !g.attributes.normal) continue;
        for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
        const key = `${m.material.uuid}|${m.castShadow}|${m.receiveShadow}`;
        if (!groups.has(key)) groups.set(key, { mat: m.material, cast: m.castShadow, recv: m.receiveShadow, geos: [] });
        groups.get(key).geos.push(g);
        m.removeFromParent();
      }
    }
    for (const { mat, cast, recv, geos } of groups.values()) {
      const merged = new THREE.Mesh(mergeGeometries(geos), mat);
      merged.castShadow = cast;
      merged.receiveShadow = recv;
      scene.add(merged);
    }
  }

  // ---------- Lư hương có nhang cháy và thùng công đức (vị trí ở RITUALS) ----------
  const kit = ritualKit({ scene, updaters, pickables });
  const burners = {};
  const merits = [];
  for (const R of RITUALS) {
    const { x: bx, z: bz } = R.burner, { x: mx, z: mz } = R.merit;
    burners[R.place] = kit.incenseStand({
      x: bx, y: R.y, z: bz, kind: R.place === 'dinh' ? 'stone' : 'stand',
      spots: [-1, 0, 1].map((dx) => ({ x: bx + dx, z: bz + 1.25 })),
      target: new THREE.Vector3(R.face.x, R.face.y, R.face.z),
    });
    const mb = kit.meritBox({ x: mx, y: R.y, z: mz, spots: [-0.45, 0, 0.45].map((dx) => ({ x: mx + dx, z: mz + 0.85 })) });
    mb.place = R.place;
    merits.push(mb);
  }

  return {
    scene,
    pickables,
    burners,
    merits,
    boats,
    boatState,
    pillars,
    // tượng trong các điện chỉ vẽ khi người chơi ở gần
    updateLOD(x, z) {
      for (const l of lods) l.obj.visible = Math.hypot(x, z - l.z) < 70;
    },
    get night() {
      return night;
    },
    setHour(h) {
      hourOverride = h == null || Number.isNaN(h) ? null : ((h % 24) + 24) % 24;
      lastSet = -99;
    },
    // bóng đổ theo chỗ người chơi (làm tròn 4 m cho bóng khỏi rung)
    setFocus(x, z) {
      focus.set(Math.round(x / 4) * 4, 0, Math.round(z / 4) * 4);
      sun.position.copy(focus).add(sunDir);
      sun.target.position.copy(focus);
    },
    update(t, dt) {
      for (const f of updaters) f(t, dt);
    },
  };
}
