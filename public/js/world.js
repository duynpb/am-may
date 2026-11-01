// Dựng chánh điện: sàn, cột, mái, tượng Phật, bàn thờ, chuông trống, cảnh bên ngoài.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './textures.js';
import { makeBuddha } from './buddha.js';
import { makeQuanAm } from './quanam.js';
import { makeBroom } from './leaves.js';
import { makeLaHanGeometries } from './lahan.js';

// Vùng được đi lại bên trong chánh điện
export const HALL = { minX: -13.2, maxX: 13.2, minZ: -12.8, maxZ: 17.6 };
export const BUDDHA = new THREE.Vector3(0, 4.6, -18.8);
export const ENTRANCE = new THREE.Vector3(0, 0, 17);
// Thềm đá trước chánh điện (z 19 → 21.6), bậc xuống sân (thấp hơn 0.36)
export const PORCH = { z0: 19, z1: 21.6, courtY: -0.36 };
export const COURTYARD = new THREE.Vector3(0, PORCH.courtY, 31);
// Vùng đi lại ngoài sân (ngoài chánh điện)
export const GARDEN = { minX: -16, maxX: 16, minZ: 22.4, maxZ: 39 };
// Cổng Tam Quan ở cuối trục đường chính, nhìn thẳng vào chánh điện
export const GATE = { z: 84, plazaZ: 92 };
// Hai dãy hành lang La Hán dọc hai bên trục đường (x dương và âm), nền cao hơn sân
export const CORRIDOR = { x0: 13.2, x1: 18, z0: 43.6, z1: 80.4, floor: 0.3 };
// Giếng Ngọc giữa trục đường, có sân tròn đi vòng quanh
export const WELL = { x: 0, z: 62, r: 2.7 };
// Hai sân bên chánh điện: phía tây có gác chuông (đại hồng chung), phía đông có điện Quan Âm
export const BELLTOWER = { x: -32, z: 29, r: 6.4 };
export const QAHALL = { x0: 25, x1: 39, z0: 5, z1: 17, cx: 32 };
// Sau chánh điện: sân sau, bậc thang đá lên nền đồi cao 8 m, trên đó là điện Tam Thế
export const TERRACE = { x: 18.6, z0: -67, z1: -47.6, y: PORCH.courtY + 8 };
export const STAIRS = { x: 3.6, z0: -48, z1: -32.9 };
export const TAMTHE = { x0: -12, x1: 12, z0: -64, z1: -52 };
// Các vùng đi lại được ngoài chánh điện (hình chữ nhật). Hai vùng chồng lên nhau là đi qua lại được.
export const WALK_AREAS = [
  GARDEN,
  { minX: -3.4, maxX: 3.4, minZ: 38, maxZ: GATE.z - 1.4 }, // trục đường chính
  { minX: -1.6, maxX: 1.6, minZ: GATE.z - 2, maxZ: GATE.z + 2 }, // lối qua cửa giữa cổng Tam Quan
  { minX: -12, maxX: 12, minZ: GATE.z + 1.6, maxZ: 99 }, // sân trước cổng
  { minX: -5, maxX: 5, minZ: WELL.z - 5, maxZ: WELL.z + 5 }, // sân giếng Ngọc
  ...[-1, 1].flatMap((s) => {
    const xr = (a, b) => (s > 0 ? { minX: a, maxX: b } : { minX: -b, maxX: -a });
    return [
      { ...xr(13.6, 15.4), minZ: 38.5, maxZ: 80.6 }, // lối đi trong hành lang La Hán
      { ...xr(3.2, 13.8), minZ: 79, maxZ: 81 }, // lối ngang nối trục đường với cuối hành lang
      { ...xr(15.5, 21.5), minZ: 22.6, maxZ: 24.4 }, // lối từ sân chùa sang sân bên
      { ...xr(21, 43), minZ: 18, maxZ: 40 }, // sân bên
    ];
  }),
  { minX: QAHALL.x0 + 1, maxX: QAHALL.x1 - 1, minZ: 8.6, maxZ: 18.3 }, // trong điện Quan Âm
  ...[-1, 1].map((s) => ({ minX: s > 0 ? 16.2 : -20.8, maxX: s > 0 ? 20.8 : -16.2, minZ: -29, maxZ: 23.2 })), // lối dọc hai bên chánh điện
  { minX: -20.8, maxX: 20.8, minZ: -33.2, maxZ: -26 }, // sân sau chánh điện
  { minX: -3, maxX: 3, minZ: STAIRS.z0 - 0.2, maxZ: STAIRS.z1 + 0.3 }, // bậc thang
  { minX: -18, maxX: 18, minZ: -51.6, maxZ: TERRACE.z1 }, // sân trước điện Tam Thế
  { minX: -4, maxX: 4, minZ: TAMTHE.z1 - 1.2, maxZ: TAMTHE.z1 + 0.8 }, // cửa giữa điện Tam Thế
  { minX: TAMTHE.x0 + 1, maxX: TAMTHE.x1 - 1, minZ: -60.4, maxZ: TAMTHE.z1 - 0.8 }, // trong điện Tam Thế
];
// Tháp 13 tầng phía bên kia sân, đối diện tượng Quan Âm. Mỗi tầng nhỏ và thấp dần lên trên.
const TOWER_LEVELS = Array.from({ length: 13 }, (_, i) => ({ r: 3.3 - i * 0.08, h: 2.0 - i * 0.03 }));
const TOWER_BASE = 0.22; // nền đá quanh chân tháp
export const TOWER = (() => {
  const x = -10.8, z = 30, plinthR = 4.0;
  let y = PORCH.courtY + TOWER_BASE;
  for (let i = 0; i < 12; i++) y += TOWER_LEVELS[i].h;
  return {
    x, z, plinthR,
    floorY: y, // đáy tầng 13
    topY: y + 0.12, // mặt sàn tầng 13
    topR: 2.0, // trong bán kính này là sàn tầng 13
    walkR: 1.5, // chỗ đi lại được trên tầng 13
    altarDx: 0.15, // phía sau (x nhỏ hơn) là bàn thờ
    door: { x: x + plinthR + 0.55, z }, // trước cửa tháp, dưới sân
    inside: { x: x + 2.85, z }, // ngưỡng cửa
    arrive: { x: x + 1.15, z }, // lên tới tầng 13 thì đứng ở đây
  };
})();

export function groundY(x, z) {
  const ax = Math.abs(x);
  if (z < -32.5) {
    // bậc thang: dốc đều từ sân sau lên nền đồi; nền đồi phẳng
    if (ax <= STAIRS.x && z > STAIRS.z0) return PORCH.courtY + (8 * Math.max(0, STAIRS.z1 - z)) / (STAIRS.z1 - STAIRS.z0);
    if (ax <= TERRACE.x && z <= TERRACE.z1 && z >= TERRACE.z0) return TERRACE.y;
    return PORCH.courtY;
  }
  if (z > CORRIDOR.z0 && z < CORRIDOR.z1 && ax > CORRIDOR.x0 && ax < CORRIDOR.x1) return PORCH.courtY + CORRIDOR.floor;
  if (z > 24 && z < 36) {
    const d = Math.hypot(x - TOWER.x, z - TOWER.z);
    if (d < TOWER.topR) return TOWER.topY;
    if (d < TOWER.plinthR) return PORCH.courtY + TOWER_BASE;
  }
  if (x > QAHALL.x0 && x < QAHALL.x1 && z > QAHALL.z0 && z < QAHALL.z1 + 0.3) return PORCH.courtY + 0.21; // sàn điện Quan Âm
  if (ax > 15.6 || z < -21.6) return PORCH.courtY; // ngoài chánh điện và thềm
  if (z <= PORCH.z1 - 0.05) return 0;
  if (z >= PORCH.z1 + 0.6) return PORCH.courtY;
  return (PORCH.courtY * (z - PORCH.z1 + 0.05)) / 0.65;
}

const SEAT_X = [-10, -7.5, -5, -2.5, 2.5, 5, 7.5, 10];
const SEAT_Z = [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5];

const rnd = (a, b) => a + Math.random() * (b - a);

export function buildWorld(renderer, { quality = 'high' } = {}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe4d9c6, 60, 230);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const updaters = [];
  const nightHooks = []; // f(night 0..1) — gọi khi đổi giờ
  const pickables = [];

  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
  const M = {
    wood: std('#4a2d1c', { roughness: 0.7 }),
    darkWood: std('#2e1c12', { roughness: 0.75 }),
    lacquer: std('#7d2217', { roughness: 0.38 }),
    lacquerDark: std('#561710', { roughness: 0.45 }),
    gold: std('#d9a54e', { metalness: 0.9, roughness: 0.28 }),
    bronze: std('#7c5a32', { metalness: 0.8, roughness: 0.38 }),
    stone: std('#9b968c', { roughness: 0.95 }),
    plaster: std('#e6dcc8', { roughness: 0.95 }),
    mat: std('#777a6f', { roughness: 0.95 }),
    cushion: std('#b8893c', { roughness: 0.9 }),
    candle: std('#f3e8d0', { roughness: 0.6 }),
  };

  // Vật đứng yên tạo trong lúc batching = true (hoặc nhóm được đánh dấu) sẽ được gộp theo vật liệu
  // ở cuối buildWorld để giảm số lệnh vẽ — quan trọng cho điện thoại.
  let batching = false;
  const staticRoots = [];
  // Tượng nặng chỉ vẽ khi người chơi ở gần
  const lods = [];
  const lodAdd = (obj, x, z, r) => lods.push({ obj, x, z, r });
  function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, parent = scene } = {}) {
    const m = new THREE.Mesh(geo, mat);
    if (batching && parent === scene) staticRoots.push(m);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = recv;
    parent.add(m);
    return m;
  }
  const box = (w, h, d, mat, x, y, z, o) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, o);
  const cyl = (rt, rb, h, mat, x, y, z, o, seg = 24) =>
    mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, o);
  const lathe = (pts, mat, x, y, z, o) =>
    mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), 32), mat, x, y, z, o);

  // ---------- Bầu trời & cảnh ngoài ----------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(260, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#7ea7c6') },
        mid: { value: new THREE.Color('#d6e3e4') },
        bottom: { value: new THREE.Color('#efe1c4') },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
        void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, bottom, smoothstep(0.0, -0.15, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(sky);

  const ground = mesh(new THREE.PlaneGeometry(500, 500), std('#8b9670', { roughness: 1 }), 0, PORCH.courtY - 0.03, 0, { cast: false });
  ground.rotation.x = -Math.PI / 2;
  ground.userData.kind = 'ground';
  pickables.push(ground);
  const court = mesh(new THREE.PlaneGeometry(34, 18), std('#978e7e', { roughness: 1 }), 0, PORCH.courtY + 0.005, 30.5, { cast: false });
  court.rotation.x = -Math.PI / 2;
  court.userData.kind = 'ground';
  pickables.push(court);
  // lối đi lát gạch giữa sân
  const path = mesh(new THREE.PlaneGeometry(3, 17), std('#a0533a', { roughness: 0.95 }), 0, PORCH.courtY + 0.01, 30.6, { cast: false });
  path.rotation.x = -Math.PI / 2;
  path.userData.kind = 'ground';
  pickables.push(path);

  const ridgeColors = ['#8fa3a6', '#a8b8b6', '#c2cbc4'];
  const ridgeMats = [];
  ridgeColors.forEach((c, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: T.ridge(c, i * 1.7 + 1), transparent: true, depthWrite: false });
    ridgeMats.push(mat);
    const d = 60 + i * 28;
    for (const [x, z, ry] of [[d, 0, -Math.PI / 2], [-d, 0, Math.PI / 2], [0, d + 85, Math.PI]]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(320, 70), mat);
      p.position.set(x, 18 - i * 3, z);
      p.rotation.y = ry;
      p.renderOrder = -10 + i;
      scene.add(p);
    }
  });

  // Rừng tre hai bên
  {
    const spots = [];
    for (let i = 0; i < 110; i++) {
      const side = i % 2 ? 1 : -1;
      spots.push(i < 60 ? [side * rnd(21.8, 27), rnd(-42, 3)] : [side * rnd(45, 58), rnd(-12, 46)]);
    }
    for (let i = 0; i < 44; i++) spots.push([(Math.random() < 0.5 ? -1 : 1) * rnd(19.5, 26), rnd(48, 82)]);
    const stalkGeo = new THREE.CylinderGeometry(0.07, 0.1, 11, 6);
    stalkGeo.translate(0, 5.5, 0);
    const stalks = new THREE.InstancedMesh(stalkGeo, std('#7d9a4c', { roughness: 0.6 }), spots.length);
    const leafGeo = new THREE.PlaneGeometry(3, 3);
    const leafMat = new THREE.MeshStandardMaterial({
      map: T.bambooLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8,
    });
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, spots.length * 4);
    const o = new THREE.Object3D();
    let li = 0;
    spots.forEach(([x, z], i) => {
      const s = rnd(0.75, 1.15);
      o.position.set(x, PORCH.courtY - 0.05, z);
      o.rotation.set(rnd(-0.06, 0.06), 0, rnd(-0.06, 0.06));
      o.scale.set(1, s, 1);
      o.updateMatrix();
      stalks.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 4; k++) {
        o.position.set(x + rnd(-1, 1), rnd(5.5, 11) * s, z + rnd(-1, 1));
        o.rotation.set(rnd(-0.5, 0.5), rnd(0, Math.PI), rnd(-0.4, 0.4));
        o.scale.setScalar(rnd(0.8, 1.4));
        o.updateMatrix();
        leaves.setMatrixAt(li++, o.matrix);
      }
    });
    stalks.castShadow = true;
    scene.add(stalks, leaves);
    updaters.push((t) => {
      leaves.rotation.z = Math.sin(t * 0.6) * 0.004;
    });
  }

  // từ chánh điện tới hết điện Quan Âm: vật đứng yên được gộp (chuông, trống, thùng công đức, cá koi… là nhóm riêng nên không bị gộp)
  batching = true;
  // ---------- Kiến trúc chánh điện ----------
  const floorTex = T.woodFloor();
  const floor = mesh(new THREE.PlaneGeometry(30, 40), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, 0, -1, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  floor.userData.kind = 'floor';
  pickables.push(floor);

  // Thảm đỏ lối đi giữa
  box(2.2, 0.02, 30.5, std('#7a271c', { roughness: 1 }), 0, 0.01, 2.4, { cast: false });

  const wall = mesh(new THREE.PlaneGeometry(30, 10.2), std('#ffffff', { map: T.lacquerWall(), roughness: 0.5 }), 0, 5.1, -21, { cast: false });
  box(30.6, 10.4, 0.3, M.plaster, 0, 5.0, -21.2); // mặt ngoài tường hậu

  for (const side of [-1, 1]) {
    const x = side * 15;
    box(0.3, 1.3, 40, M.wood, x, 0.65, -1);
    box(0.3, 3.4, 40, M.plaster, x, 8.4, -1);
    box(0.34, 0.12, 40, M.darkWood, x, 1.36, -1);
    box(0.34, 0.16, 40, M.darkWood, x, 6.65, -1);
    for (const y of [2.6, 4.0, 5.4]) box(0.08, 0.06, 40, M.darkWood, x, y, -1);
  }
  // Song cửa (chấn song) hai bên — dùng instancing
  {
    const zs = [];
    for (let z = -20.8; z <= 18.8; z += 0.45) zs.push(z);
    const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 5.2, 0.07), M.darkWood, zs.length * 2);
    const o = new THREE.Object3D();
    let i = 0;
    for (const side of [-1, 1]) for (const z of zs) {
      o.position.set(side * 15, 4.0, z);
      o.updateMatrix();
      bars.setMatrixAt(i++, o.matrix);
    }
    bars.castShadow = true;
    scene.add(bars);
  }
  // Thềm đá + bậc tam cấp
  {
    const porchMat = std('#9d9587', { roughness: 0.92 });
    const edgeMat = std('#7d766a', { roughness: 0.95 });
    const depth = PORCH.z1 - PORCH.z0;
    const porchTop = box(30.6, 0.42, depth, porchMat, 0, -0.21, PORCH.z0 + depth / 2, { cast: false });
    porchTop.userData.kind = 'ground';
    pickables.push(porchTop);
    box(30.6, 0.06, 0.18, edgeMat, 0, -0.03, PORCH.z1 - 0.09, { cast: false });
    box(9, 0.24, 0.34, edgeMat, 0, -0.24, PORCH.z1 + 0.17);
    box(9, 0.12, 0.34, porchMat, 0, -0.30, PORCH.z1 + 0.5);
    // ranh giới gỗ giữa thềm và sàn chánh điện
    box(30.6, 0.05, 0.14, M.darkWood, 0, 0.02, PORCH.z0 + 0.04, { cast: false });
  }

  // Mặt tiền
  box(30, 3.0, 0.4, M.plaster, 0, 8.5, 19);
  box(30, 0.5, 0.5, M.darkWood, 0, 6.95, 19);

  // Trần, xà, rui
  box(30.6, 0.2, 40.6, M.darkWood, 0, 10.1, -1);
  const colZ = [-18, -12, -6, 0, 6, 12, 18];
  for (const z of colZ) box(26.4, 0.55, 0.45, M.darkWood, 0, 9.55, z);
  for (const side of [-1, 1]) box(0.45, 0.55, 40, M.darkWood, side * 13, 9.55, -1);
  {
    const n = 40;
    const rafters = new THREE.InstancedMesh(new THREE.BoxGeometry(30, 0.14, 0.16), M.wood, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(0, 9.93, -20.5 + i);
      o.updateMatrix();
      rafters.setMatrixAt(i, o.matrix);
    }
    scene.add(rafters);
  }

  // Cột sơn son
  const columns = [];
  for (const side of [-1, 1]) for (const z of colZ) columns.push([side * 13, z]);
  columns.push([-9.6, -16.2], [9.6, -16.2]);
  for (const [x, z] of columns) {
    cyl(0.38, 0.42, 10, M.lacquer, x, 5, z);
    cyl(0.62, 0.68, 0.35, M.stone, x, 0.175, z);
    cyl(0.44, 0.44, 0.14, M.gold, x, 8.9, z, { cast: false });
    cyl(0.44, 0.44, 0.1, M.gold, x, 0.5, z, { cast: false });
  }

  // ---------- Bệ thờ & tượng Phật ----------
  box(18, 0.6, 5.2, M.lacquerDark, 0, 0.3, -18.4);
  box(18, 0.06, 0.05, M.gold, 0, 0.58, -15.78, { cast: false });
  box(18, 0.25, 0.5, M.wood, 0, 0.125, -15.55);
  box(5.6, 1.4, 4.2, M.lacquer, 0, 1.3, -18.8);
  box(5.8, 0.12, 4.4, M.gold, 0, 2.0, -18.8);
  box(5.8, 0.12, 4.4, M.gold, 0, 0.66, -18.8);

  const buddha = makeBuddha({ quality });
  lodAdd(buddha, 0, -18.8, 100);
  // bản tượng nhẹ hơn cho các tượng sao (trên tháp, điện Tam Thế); máy yếu thì tượng chính đã là bản nhẹ
  const buddhaLite = quality === 'high' ? makeBuddha({ quality: 'low' }) : buddha;
  buddha.position.set(0, 2.06, -18.8);
  buddha.scale.setScalar(1.7);
  scene.add(buddha);

  // Hoành phi & câu đối
  const boardMat = (lines, o) => std('#ffffff', { map: T.boardTexture(lines, o), roughness: 0.45 });
  box(6.7, 1.75, 0.08, M.gold, 0, 8.75, -20.95, { cast: false });
  mesh(new THREE.PlaneGeometry(6.4, 1.5), boardMat(['PHẬT TẠI TÂM']), 0, 8.75, -20.9, { cast: false });
  for (const [x, lines] of [[-4.8, ['Từ', 'Bi', 'Hỷ', 'Xả']], [4.8, ['Vô', 'Ngã', 'Vị', 'Tha']]]) {
    box(1.15, 4.7, 0.08, M.gold, x, 5.0, -20.95, { cast: false });
    mesh(new THREE.PlaneGeometry(1.0, 4.5), boardMat(lines, { w: 256, h: 1152, size: 130 }), x, 5.0, -20.9, { cast: false });
  }

  // Bàn thờ phía trước
  const TY = 1.08;
  box(5, 1.0, 1.3, M.lacquer, 0, 0.5, -14.6);
  box(5.2, 0.08, 1.45, M.lacquerDark, 0, 1.04, -14.6);
  box(5.0, 0.05, 0.02, M.gold, 0, 0.85, -13.94, { cast: false });
  box(5.0, 0.05, 0.02, M.gold, 0, 0.15, -13.94, { cast: false });

  // Lư hương + nhang + khói
  const glowTex = T.glow();
  const smokeTex = T.smoke();
  lathe([[0, 0], [0.26, 0], [0.33, 0.08], [0.36, 0.22], [0.3, 0.32], [0.34, 0.36], [0.3, 0.36]], M.bronze, 0, TY + 0.06, -14.7);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    cyl(0.03, 0.02, 0.1, M.bronze, Math.cos(a) * 0.22, TY + 0.03, -14.7 + Math.sin(a) * 0.22);
  }
  // Lư nhang: nhang cắm vào cháy ngắn dần, hết thì tàn; luôn giữ ít nhất `min` nén
  const STEM = 0.14, BODY = 0.42, MAX_STICKS = 30;
  const stemGeo = new THREE.CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0);
  const stemMat = std('#b8322a', { roughness: 0.6 });
  const bodyMat = std('#7a4a2c', { roughness: 0.9 });
  const emberGeo = new THREE.SphereGeometry(0.014, 8, 6);
  const emberMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a' });

  // center: mặt cát trong lư; spots: chỗ đứng để thắp; target: điểm người thắp hướng mặt vào khi vái
  function makeBurner({ center, radius = 0.21, spots, target, smoke = 48, min = 3 }) {
    const sticks = [];
    function addStick({ age = 0, life = rnd(170, 200), mine = false } = {}) {
      if (sticks.length >= MAX_STICKS) sticks[0].age = Math.max(sticks[0].age, sticks[0].life - 2);
      const g = new THREE.Group();
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * radius;
      g.position.set(center.x + Math.cos(a) * r, center.y, center.z + Math.sin(a) * r);
      g.rotation.set(rnd(-0.12, 0.12), rnd(0, 6), rnd(-0.12, 0.12));
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.scale.y = STEM;
      const body = new THREE.Mesh(stemGeo, bodyMat);
      body.position.y = STEM;
      const ember = new THREE.Mesh(emberGeo, emberMat);
      const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff7a30', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glowS.scale.setScalar(0.09);
      g.add(stem, body, ember, glowS);
      scene.add(g);
      sticks.push({ g, body, ember, glowS, age, life, seed: Math.random() * 9, mine });
    }
    for (let i = 0; i < min; i++) addStick({ age: rnd(20, 140) });

    const smokeParts = [];
    for (let i = 0; i < smoke; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
      s.userData = { age: Math.random() * 6, life: rnd(5, 7), seed: Math.random() * 10, tip: new THREE.Vector3(), live: false };
      scene.add(s);
      smokeParts.push(s);
    }
    updaters.push((t, dt) => {
      for (let i = sticks.length - 1; i >= 0; i--) {
        const s = sticks[i];
        s.age += dt;
        const k = s.age / s.life;
        if (k >= 1) {
          s.g.removeFromParent();
          s.glowS.material.dispose();
          sticks.splice(i, 1);
          continue;
        }
        const len = Math.max(0.001, BODY * (1 - k));
        s.body.scale.y = len;
        s.ember.position.y = s.glowS.position.y = STEM + len;
        s.glowS.scale.setScalar(0.08 * (0.8 + Math.sin(t * 3 + s.seed) * 0.2));
      }
      if (sticks.length < min) addStick();
      for (const p of smokeParts) {
        const u = p.userData;
        u.age += dt;
        if (u.age > u.life) {
          u.age = 0;
          u.seed = Math.random() * 10;
          const s = sticks[Math.floor(Math.random() * sticks.length)];
          u.live = !!s;
          if (s) s.g.localToWorld(u.tip.copy(s.ember.position));
        }
        const k = u.age / u.life;
        p.position.set(u.tip.x + Math.sin(t * 0.9 + u.seed) * 0.25 * k + Math.sin(u.seed) * 0.4 * k * k,
          u.tip.y + u.age * 0.42, u.tip.z + Math.cos(t * 0.7 + u.seed) * 0.15 * k);
        p.scale.setScalar(0.12 + k * 1.1);
        p.material.opacity = u.live ? 0.3 * Math.sin(Math.PI * k) : 0;
      }
    });
    return {
      // cắm n nén vào lư hương
      add(n = 1, { mine = false } = {}) {
        for (let i = 0; i < n; i++) addStick({ mine });
      },
      get count() {
        return sticks.length;
      },
      spots,
      target,
    };
  }
  const incense = makeBurner({
    center: new THREE.Vector3(0, TY + 0.39, -14.7),
    spots: [-1.6, -0.8, 0, 0.8, 1.6].map((x) => ({ x, z: -12.75 })),
    target: BUDDHA,
  });

  const flames = [];
  function flame(x, y, z, size = 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffb257', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(x, y, z);
    s.scale.set(0.14 * size, 0.24 * size, 1);
    s.userData.size = size;
    scene.add(s);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff3d0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    core.scale.set(0.05 * size, 0.1 * size, 1);
    core.position.set(x, y - 0.02 * size, z);
    scene.add(core);
    flames.push(s);
  }
  // Nến nhỏ trên bàn
  for (const x of [-1.95, 1.95]) {
    cyl(0.1, 0.13, 0.06, M.bronze, x, TY + 0.03, -14.75);
    cyl(0.05, 0.05, 0.28, M.candle, x, TY + 0.2, -14.75);
    flame(x, TY + 0.4, -14.75, 0.9);
  }
  // Bình sen
  for (const x of [-1.15, 1.15]) {
    lathe([[0, 0], [0.12, 0], [0.18, 0.12], [0.16, 0.3], [0.07, 0.42], [0.1, 0.5], [0.09, 0.5]],
      std('#e8eef0', { roughness: 0.25 }), x, TY, -14.85);
    for (let k = 0; k < 3; k++) {
      const ox = (k - 1) * 0.12, h = 0.5 + k * 0.08;
      cyl(0.008, 0.008, h, std('#5e7f3a'), x + ox * 0.5, TY + 0.5 + h / 2, -14.85, { cast: false }, 5).rotation.z = -ox;
      lotus(x + ox * 1.4, TY + 0.5 + h, -14.85, 0.11);
    }
  }
  function lotus(x, y, z, r) {
    const g = new THREE.Group();
    const pm = std('#f2a0b2', { roughness: 0.6 });
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Group();
        p.rotation.y = (i / 8) * Math.PI * 2 + layer * 0.4;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), pm);
        petal.scale.set(r * 0.35, r * 0.75, r * 0.14);
        petal.position.set(0, r * 0.5, r * (0.45 - layer * 0.2));
        petal.rotation.x = 0.6 - layer * 0.35;
        p.add(petal);
        g.add(p);
      }
    }
    const c = new THREE.Mesh(new THREE.SphereGeometry(r * 0.25, 10, 8), std('#f0c64e'));
    c.position.y = r * 0.45;
    g.add(c);
    g.position.set(x, y, z);
    scene.add(g);
  }
  // Mâm ngũ quả
  for (const x of [-0.6, 0.6]) {
    cyl(0.22, 0.17, 0.04, std('#d8cca5', { roughness: 0.4 }), x, TY + 0.02, -14.3);
    ['#f08a24', '#8bbd3c', '#e8c33a', '#d44f3a', '#f2a541'].forEach((c, i) => {
      const a = (i / 5) * Math.PI * 2;
      mesh(new THREE.SphereGeometry(i === 4 ? 0.08 : 0.07, 12, 10), std(c, { roughness: 0.5 }),
        x + (i === 4 ? 0 : Math.cos(a) * 0.1), TY + (i === 4 ? 0.17 : 0.1), -14.3 + (i === 4 ? 0 : Math.sin(a) * 0.1));
    });
  }
  // Đèn đứng hai bên + ánh sáng
  const candleLights = [];
  for (const x of [-3.6, 3.6]) {
    cyl(0.26, 0.32, 0.08, M.bronze, x, 0.04, -14.6);
    cyl(0.05, 0.07, 1.5, M.bronze, x, 0.8, -14.6);
    cyl(0.2, 0.1, 0.06, M.bronze, x, 1.58, -14.6);
    cyl(0.07, 0.07, 0.25, M.candle, x, 1.74, -14.6);
    flame(x, 1.97, -14.6, 1.3);
    const L = new THREE.PointLight(0xffa860, 5, 11, 2);
    L.position.set(x, 2.15, -14.4);
    scene.add(L);
    candleLights.push(L);
  }
  updaters.push((t) => {
    flames.forEach((f, i) => {
      const n = 1 + Math.sin(t * 13 + i * 2) * 0.06 + Math.sin(t * 7.3 + i) * 0.05;
      f.scale.set(0.14 * f.userData.size * n, 0.24 * f.userData.size * (2 - n), 1);
    });
    candleLights.forEach((L, i) => { L.intensity = 5 + Math.sin(t * 11 + i * 3) * 0.5 + Math.sin(t * 5.7 + i) * 0.4; });
  });

  // ---------- Chuông & trống ----------
  {
    const bell = new THREE.Group();
    bell.position.set(-11, 0, -14);
    scene.add(bell);
    for (const dx of [-0.95, 0.95]) {
      box(0.18, 3.4, 0.18, M.lacquer, dx, 1.7, 0, { parent: bell });
      box(0.5, 0.12, 0.5, M.stone, dx, 0.06, 0, { parent: bell });
    }
    box(2.4, 0.22, 0.26, M.lacquer, 0, 3.35, 0, { parent: bell });
    // Chuông treo từ điểm xoay ở xà ngang
    const b = new THREE.Group();
    b.position.set(0, 3.22, 0);
    bell.add(b);
    lathe([[0.001, 0], [0.18, 0], [0.32, -0.08], [0.4, -0.3], [0.43, -0.6], [0.46, -0.95], [0.54, -1.24], [0.56, -1.3]],
      std('#6f5a35', { metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide }), 0, 0, 0, { parent: b });
    cyl(0.04, 0.04, 0.16, M.bronze, 0, 0.06, 0, { parent: b });
    for (const y of [-0.85, -0.4]) {
      const ring = mesh(new THREE.TorusGeometry(0.43 - y * 0.03, 0.02, 6, 32), M.bronze, 0, y, 0, { parent: b });
      ring.rotation.x = Math.PI / 2;
    }
    bell.userData.kind = 'bell';
    pickables.push(bell);
    bell.userData.swing = 0;
    updaters.push((t, dt) => {
      bell.userData.swing *= Math.exp(-dt * 1.2);
      b.rotation.z = Math.sin(t * 4) * bell.userData.swing * 0.05;
    });

    const drum = new THREE.Group();
    drum.position.set(11, 0, -14);
    scene.add(drum);
    for (const dx of [-0.95, 0.95]) {
      box(0.18, 2.4, 0.18, M.lacquer, dx, 1.2, 0, { parent: drum });
      box(0.5, 0.12, 0.5, M.stone, dx, 0.06, 0, { parent: drum });
    }
    box(2.4, 0.2, 0.24, M.lacquer, 0, 2.35, 0, { parent: drum });
    const body = new THREE.Group();
    body.position.set(0, 1.55, 0);
    drum.add(body);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.9, 32, 1, true), std('#8a2418', { roughness: 0.4, side: THREE.DoubleSide }));
    shell.scale.set(1, 1, 1);
    shell.castShadow = true;
    body.add(shell);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 16), M.lacquer);
    belly.scale.set(1, 0.62, 1);
    body.add(belly);
    for (const y of [-0.45, 0.45]) {
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 32), std('#d9c49c', { roughness: 0.9 }));
      skin.position.y = y;
      body.add(skin);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.025, 6, 32), M.gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = y;
      body.add(rim);
    }
    body.rotation.x = Math.PI / 2;
    drum.userData.kind = 'drum';
    drum.userData.hit = 0;
    pickables.push(drum);
    updaters.push((t, dt) => {
      drum.userData.hit *= Math.exp(-dt * 6);
      body.scale.setScalar(1 + drum.userData.hit * 0.03 * Math.sin(t * 40));
    });
  }

  // ---------- Thùng công đức ----------
  const merit = (() => {
    const g = new THREE.Group();
    g.position.set(5.2, 0, -13.25);
    scene.add(g);
    box(1.0, 0.18, 0.7, M.darkWood, 0, 0.09, 0, { parent: g });
    box(0.9, 0.8, 0.6, M.lacquer, 0, 0.58, 0, { parent: g });
    box(0.96, 0.06, 0.66, M.gold, 0, 1.0, 0, { parent: g, cast: false });
    box(0.96, 0.05, 0.66, M.gold, 0, 0.2, 0, { parent: g, cast: false });
    box(0.36, 0.015, 0.06, new THREE.MeshStandardMaterial({ color: '#120806' }), 0, 1.035, 0.02, { parent: g, cast: false });
    const front = mesh(new THREE.PlaneGeometry(0.78, 0.5),
      std('#ffffff', { map: T.boardTexture(['CÔNG ĐỨC'], { w: 640, h: 400, size: 104 }), roughness: 0.45 }),
      0, 0.6, 0.302, { parent: g, cast: false });
    front.userData.kind = 'merit';
    g.userData.kind = 'merit';
    pickables.push(g);

    const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glowS.position.set(0, 1.1, 0);
    glowS.scale.setScalar(1.6);
    g.add(glowS);
    const slot = new THREE.Vector3(5.2, 1.05, -13.23);

    // phong bì đỏ bay từ tay vào khe thùng
    const envGeo = new THREE.BoxGeometry(0.16, 0.1, 0.012);
    const envMat = std('#c8261b', { roughness: 0.5 });
    const flying = [];
    let glowT = 0;
    updaters.push((t, dt) => {
      for (let i = flying.length - 1; i >= 0; i--) {
        const f = flying[i];
        f.t += dt;
        const k = Math.min(1, f.t / 0.75);
        f.m.position.lerpVectors(f.from, slot, k);
        f.m.position.y += Math.sin(Math.PI * k) * 0.45;
        f.m.rotation.set(-Math.PI / 2 * k, f.spin * k, 0);
        f.m.scale.setScalar(1 - 0.3 * k);
        if (k >= 1) {
          f.m.removeFromParent();
          flying.splice(i, 1);
          glowT = 1;
        }
      }
      glowT = Math.max(0, glowT - dt * 0.8);
      glowS.material.opacity = 0.7 * glowT;
    });
    return {
      spots: [-0.45, 0, 0.45].map((dx) => ({ x: 5.2 + dx, z: -12.45 })),
      center: new THREE.Vector3(5.2, 0, -13.25),
      drop(from) {
        const m = new THREE.Mesh(envGeo, envMat);
        m.position.copy(from);
        scene.add(m);
        flying.push({ m, from: from.clone(), t: 0, spin: rnd(-1, 1) });
      },
    };
  })();

  // ---------- Khu cầu nguyện ngoài sân: tượng Quan Âm, lư hương đá, hồ sen, tiểu cảnh ----------
  const GY = PORCH.courtY;
  const QA = new THREE.Vector3(10.6, GY, 29.4); // tâm bệ tượng
  const URN = new THREE.Vector3(7.9, GY, 29.4); // lư hương đá trước tượng
  const PD = { x: 10.9, z: 35.6, rx: 2.6, rz: 1.7 }; // hồ sen
  const stoneM = std('#a9a49a', { roughness: 0.95 });
  const stoneL = std('#cbc6ba', { roughness: 0.9 });
  const rockM = std('#86837a', { roughness: 1 });
  const leafM = std('#4f7a3a', { roughness: 0.9 });
  const leafD = std('#3a6130', { roughness: 0.9 });
  const obstacles = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // thảm cỏ
  const grass = mesh(new THREE.CircleGeometry(6.6, 48), std('#6c8a4a', { roughness: 1 }), 11.3, GY + 0.008, 31.8, { cast: false });
  grass.rotation.x = -Math.PI / 2;
  grass.userData.kind = 'ground';
  pickables.push(grass);

  // bệ đá hai tầng + trụ bát giác + tượng
  const shrine = new THREE.Group();
  shrine.position.copy(QA);
  shrine.userData.kind = 'quanam';
  scene.add(shrine);
  pickables.push(shrine);
  cyl(2.3, 2.45, 0.34, stoneM, 0, 0.17, 0, { parent: shrine }, 40);
  cyl(1.75, 1.85, 0.3, stoneL, 0, 0.49, 0, { parent: shrine }, 40);
  cyl(0.82, 0.95, 1.1, stoneL, 0, 1.19, 0, { parent: shrine }, 8);
  cyl(0.98, 0.98, 0.08, stoneM, 0, 1.78, 0, { parent: shrine }, 8);
  const quanAm = makeQuanAm({ quality });
  quanAm.position.y = 1.82;
  quanAm.rotation.y = -Math.PI / 2; // nhìn ra lối đi giữa sân
  quanAm.scale.setScalar(1.45);
  shrine.add(quanAm);
  obstacles.push({ x: QA.x, z: QA.z, r: 2.55 });

  // Mái che nhỏ cho tượng: 4 cột sơn son trên bệ đá, mái ngói cong, bốn đầu đao vểnh, hồ lô trên chóp
  {
    const pav = new THREE.Group();
    shrine.add(pav);
    const C = 1.5; // cột đặt ở (±C, ±C)
    const H = 6.75; // độ cao đầu cột (trên tượng và hào quang)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(0.13, 0.15, H - 0.34, M.lacquer, sx * C, 0.34 + (H - 0.34) / 2, sz * C, { parent: pav }, 12);
      cyl(0.24, 0.27, 0.22, stoneM, sx * C, 0.45, sz * C, { parent: pav }, 12);
      cyl(0.16, 0.16, 0.08, M.gold, sx * C, H - 0.3, sz * C, { parent: pav, cast: false }, 12);
    }
    for (const s of [-1, 1]) {
      box(2 * C + 0.42, 0.22, 0.2, M.darkWood, 0, H, s * C, { parent: pav });
      box(0.2, 0.22, 2 * C + 0.42, M.darkWood, s * C, H, 0, { parent: pav });
    }

    // mặt mái: nón 64 cạnh nắn thành hình vuông, lõm nhẹ giữa mái, góc vểnh lên thành đầu đao
    const R = 2.35, RH = 1.75, SAG = 0.32, CURL = 0.6, BASE = H + 0.14;
    const roofY = (t, corner) => BASE + RH * (1 - t) - SAG * Math.sin(Math.PI * Math.min(t, 1)) + CURL * corner ** 3 * t ** 4;
    const squareR = (th) => 1 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
    const roofGeo = new THREE.ConeGeometry(1, 1, 64, 10, true);
    const rp = roofGeo.attributes.position;
    for (let i = 0; i < rp.count; i++) {
      const t = 0.5 - rp.getY(i); // 0 ở chóp, 1 ở mép mái
      const th = Math.atan2(rp.getZ(i), rp.getX(i));
      const sq = squareR(th);
      const corner = (sq - 1) / (Math.SQRT2 - 1); // 0 giữa cạnh, 1 ở góc
      const r = t * R * sq;
      rp.setXYZ(i, Math.cos(th) * r, roofY(t, corner), Math.sin(th) * r);
    }
    roofGeo.computeVertexNormals();
    const tiles = T.canvasTexture(256, 256, (g, w) => {
      g.fillStyle = '#8a4129';
      g.fillRect(0, 0, w, w);
      for (let x = 0; x < w; x += 16) {
        // rãnh ngói âm dương
        g.fillStyle = 'rgba(40,14,6,0.45)';
        g.fillRect(x, 0, 4, w);
        g.fillStyle = 'rgba(255,190,150,0.12)';
        g.fillRect(x + 8, 0, 3, w);
      }
      for (let y = 0; y < w; y += 32) {
        g.fillStyle = 'rgba(30,10,4,0.3)';
        g.fillRect(0, y, w, 3);
      }
    }, { repeat: [20, 4] });
    const roof = new THREE.Mesh(roofGeo, std('#ffffff', { map: tiles, roughness: 0.85, side: THREE.DoubleSide }));
    roof.castShadow = roof.receiveShadow = true;
    pav.add(roof);

    // bốn bờ nóc chạy xuống góc mái, cuối cong vút lên (đầu đao)
    const ridgeM = std('#d9c9a6', { roughness: 0.8 });
    for (let k = 0; k < 4; k++) {
      const th = Math.PI / 4 + (k * Math.PI) / 2;
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const t = (i / 14) * 1.1; // vượt mép mái một chút để làm đầu đao
        const r = t * R * Math.SQRT2;
        pts.push(new THREE.Vector3(Math.cos(th) * r, roofY(t, 1) + 0.07 + (t > 1 ? (t - 1) * 3.2 : 0), Math.sin(th) * r));
      }
      const ridge = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.065, 8), ridgeM);
      ridge.castShadow = true;
      pav.add(ridge);
      const tip = pts[pts.length - 1];
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), ridgeM);
      curl.position.copy(tip);
      pav.add(curl);
    }
    // hồ lô trên chóp mái
    const gourd = lathe([[0, 0], [0.14, 0], [0.18, 0.1], [0.11, 0.24], [0.06, 0.28], [0.12, 0.38], [0.13, 0.47], [0.06, 0.58], [0.02, 0.66], [0, 0.68]], M.gold, 0, BASE + RH - 0.06, 0, { parent: pav });
    gourd.castShadow = true;
  }
  // đèn chiếu tượng, sáng hơn về đêm
  const qaLight = new THREE.SpotLight(0xfff0dd, 0, 18, 0.45, 0.6, 2);
  qaLight.position.set(QA.x - 5, GY + 6, QA.z + 1);
  qaLight.target.position.set(QA.x, GY + 4.2, QA.z);
  scene.add(qaLight, qaLight.target);

  // lư hương đá + nền đá chỗ đứng thắp nhang
  box(1.5, 0.04, 2.8, stoneL, 6.75, GY + 0.02, URN.z, { cast: false });
  cyl(0.32, 0.38, 0.25, stoneM, URN.x, GY + 0.125, URN.z, {}, 16);
  lathe([[0, 0], [0.3, 0], [0.42, 0.12], [0.46, 0.3], [0.4, 0.42], [0.44, 0.46], [0.4, 0.46]], stoneM, URN.x, GY + 0.25, URN.z);
  obstacles.push({ x: URN.x, z: URN.z, r: 0.6 });
  const incenseOut = makeBurner({
    center: new THREE.Vector3(URN.x, GY + 0.66, URN.z),
    radius: 0.3,
    spots: [28.6, 29.4, 30.2].map((z) => ({ x: 6.75, z })),
    target: new THREE.Vector3(QA.x, GY + 4.6, QA.z),
    smoke: 30,
    min: 2,
  });

  // hồ sen: đáy tối, mặt nước trong, viền đá, lá sen, hoa sen, non bộ, cá koi
  const pondBottom = mesh(new THREE.CircleGeometry(1, 40), std('#1a2a27', { roughness: 1 }), PD.x, GY + 0.012, PD.z, { cast: false });
  pondBottom.scale.set(PD.rx, PD.rz, 1);
  pondBottom.rotation.x = -Math.PI / 2;
  const water = mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({
    color: '#2e5c63', roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.78, envMapIntensity: 1.6,
  }), PD.x, GY + 0.07, PD.z, { cast: false });
  water.scale.set(PD.rx, PD.rz, 1);
  water.rotation.x = -Math.PI / 2;
  obstacles.push({ x: PD.x, z: PD.z, rx: PD.rx + 0.35, rz: PD.rz + 0.35 });
  {
    const n = 30;
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rockM, n + 4);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.05, 0.05);
      o.position.set(PD.x + Math.cos(a) * (PD.rx + 0.12), GY + 0.02, PD.z + Math.sin(a) * (PD.rz + 0.12));
      o.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
      o.scale.set(rnd(0.24, 0.38), rnd(0.14, 0.26), rnd(0.22, 0.36));
      o.updateMatrix();
      rocks.setMatrixAt(i, o.matrix);
    }
    // non bộ nhỏ giữa hồ
    [[1.1, 0.25, -0.3, 0.42, 0.7], [1.45, 0.1, -0.15, 0.3, 0.45], [0.8, 0.05, -0.55, 0.26, 0.35], [1.25, 0.6, -0.35, 0.22, 0.4]].forEach(([dx, y, dz, s, h], k) => {
      o.position.set(PD.x + dx, GY + y, PD.z + dz);
      o.rotation.set(rnd(0, 0.4), rnd(0, 3), rnd(0, 0.4));
      o.scale.set(s, h, s);
      o.updateMatrix();
      rocks.setMatrixAt(n + k, o.matrix);
    });
    rocks.castShadow = rocks.receiveShadow = true;
    scene.add(rocks);
    // cây bonsai nhỏ trên non bộ
    cyl(0.025, 0.04, 0.4, std('#5a4330'), PD.x + 1.2, GY + 1.05, PD.z - 0.35, { cast: false }, 6);
    for (const [dx, dy, dz, r] of [[0, 1.3, 0, 0.2], [0.15, 1.22, 0.08, 0.14], [-0.14, 1.2, -0.05, 0.13]]) {
      mesh(new THREE.SphereGeometry(r, 10, 8), leafD, PD.x + 1.2 + dx, GY + dy, PD.z - 0.35 + dz);
    }

    const padGeo = new THREE.CircleGeometry(0.3, 20, 0.35, Math.PI * 2 - 0.7);
    const padMat = std('#4c7a35', { roughness: 0.85, side: THREE.DoubleSide });
    const pinkM = std('#f3a3b6', { roughness: 0.6 });
    const yellowM = std('#f0c64e');
    [[-1.4, 0.4], [-0.9, -0.6], [-0.3, 0.7], [0.4, -0.2], [-1.8, -0.3], [0.2, 0.9], [-0.6, 0.1]].forEach(([dx, dz], i) => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.set(-Math.PI / 2, 0, rnd(0, 6));
      pad.position.set(PD.x + dx, GY + 0.078, PD.z + dz);
      pad.scale.setScalar(rnd(0.8, 1.3));
      scene.add(pad);
      if (i % 2 === 0) {
        // hoa sen nở trên lá
        const f = new THREE.Group();
        f.position.set(PD.x + dx + 0.08, GY + 0.08, PD.z + dz);
        for (let k = 0; k < 8; k++) {
          const p = new THREE.Group();
          p.rotation.y = (k / 8) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), pinkM);
          petal.scale.set(0.04, 0.09, 0.02);
          petal.position.set(0, 0.07, 0.05);
          petal.rotation.x = 0.55;
          p.add(petal);
          f.add(p);
        }
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), yellowM);
        c.position.y = 0.06;
        f.add(c);
        scene.add(f);
      }
    });

    // cá koi bơi vòng trong hồ
    const koiBody = new THREE.SphereGeometry(1, 12, 8);
    const koiTail = new THREE.ConeGeometry(0.05, 0.12, 6).rotateX(Math.PI / 2);
    const koi = ['#f07a2a', '#f4efe6', '#e8452c', '#f2a03a'].map((c, i) => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(koiBody, std(c, { roughness: 0.5 }));
      b.scale.set(0.055, 0.026, 0.16);
      const tail = new THREE.Mesh(koiTail, b.material);
      tail.position.z = -0.2;
      g.add(b, tail);
      g.userData = { phase: (i / 4) * Math.PI * 2, speed: rnd(0.18, 0.3) * (i % 2 ? 1 : -1), r: rnd(0.45, 0.8), tail };
      scene.add(g);
      return g;
    });
    updaters.push((t) => {
      for (const g of koi) {
        const u = g.userData;
        const a = u.phase + t * u.speed;
        const x = PD.x - 0.4 + Math.cos(a) * PD.rx * u.r * 0.7, z = PD.z + Math.sin(a) * PD.rz * u.r * 0.7;
        g.position.set(x, GY + 0.04, z);
        g.lookAt(x - Math.sin(a) * Math.sign(u.speed), GY + 0.04, z + Math.cos(a) * Math.sign(u.speed));
        u.tail.rotation.y = Math.sin(t * 8 + u.phase) * 0.4;
      }
      water.material.opacity = 0.76 + Math.sin(t * 0.8) * 0.02;
    });
  }

  // đèn đá: sáng lên về đêm
  const lampMat = std('#e9dfc6', { emissive: '#ffb860', emissiveIntensity: 0, roughness: 0.8 });
  const lampGlows = [];
  function stoneLantern(x, z) {
    const g = new THREE.Group();
    g.position.set(x, GY, z);
    scene.add(g);
    staticRoots.push(g); // phần đá được gộp, quầng sáng đèn giữ nguyên
    box(0.55, 0.12, 0.55, stoneM, 0, 0.06, 0, { parent: g });
    cyl(0.09, 0.11, 0.8, stoneL, 0, 0.52, 0, { parent: g }, 8);
    box(0.5, 0.08, 0.5, stoneM, 0, 0.96, 0, { parent: g });
    box(0.34, 0.3, 0.34, lampMat, 0, 1.15, 0, { parent: g });
    const roof = mesh(new THREE.ConeGeometry(0.44, 0.26, 4), stoneM, 0, 1.43, 0, { parent: g });
    roof.rotation.y = Math.PI / 4;
    mesh(new THREE.SphereGeometry(0.06, 8, 6), stoneM, 0, 1.6, 0, { parent: g });
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffb46a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    gl.position.y = 1.15;
    gl.scale.setScalar(1.6);
    g.add(gl);
    lampGlows.push(gl);
    obstacles.push({ x, z, r: 0.45 });
  }
  stoneLantern(7.5, 25.8);
  stoneLantern(7.3, 33.2);

  // giá chổi tre ở góc sân, cạnh thềm: chạm vào để lấy chổi quét lá
  const BROOM = new THREE.Vector3(6.1, GY, 23.35);
  {
    const woodM = std('#6b4a2e', { roughness: 0.85 });
    const g = new THREE.Group();
    g.position.copy(BROOM);
    g.userData.kind = 'broom';
    scene.add(g);
    pickables.push(g);
    for (const s of [-1, 1]) box(0.07, 1.0, 0.07, woodM, s * 0.42, 0.5, 0, { parent: g });
    box(0.96, 0.06, 0.06, woodM, 0, 0.95, 0, { parent: g });
    for (const [x, ry] of [[-0.2, 0.12], [0.16, -0.1]]) {
      const b = makeBroom();
      b.position.set(x, 0.68, 0.12);
      b.rotation.set(-0.35, ry, 0, 'YXZ');
      g.add(b);
    }
    // sọt tre đựng lá
    mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 16, 1, true), std('#a8834e', { roughness: 0.95, side: THREE.DoubleSide }), 0.78, 0.17, 0.12, { parent: g });
    cyl(0.16, 0.16, 0.02, std('#8a6a3a', { roughness: 1 }), 0.78, 0.03, 0.12, { parent: g }, 16);
    for (const [dx, dz, c] of [[-0.05, 0.02, '#c8702a'], [0.06, -0.04, '#d9a43a'], [0.0, 0.07, '#8a5a2a']]) {
      const l = mesh(new THREE.SphereGeometry(0.07, 6, 4), std(c, { roughness: 0.9 }), 0.78 + dx, 0.3, 0.12 + dz, { parent: g, cast: false });
      l.scale.set(1, 0.25, 0.6);
    }
    obstacles.push({ x: BROOM.x + 0.2, z: BROOM.z + 0.1, r: 0.75 });
  }

  // bụi cây và bồn hoa quanh bệ tượng
  const flowerColors = ['#f3a3b6', '#f6d36b', '#ffffff', '#e2534a', '#c58ae0'].map((c) => std(c, { roughness: 0.7 }));
  function bush(x, z, s = 1) {
    const was = batching;
    batching = true;
    for (let k = 0; k < 3; k++) {
      mesh(new THREE.SphereGeometry(rnd(0.38, 0.55) * s, 12, 10), k % 2 ? leafM : leafD,
        x + rnd(-0.35, 0.35) * s, GY + rnd(0.25, 0.4) * s, z + rnd(-0.35, 0.35) * s);
    }
    obstacles.push({ x, z, r: 0.7 * s });
    batching = was;
  }
  function flowers(x, z, n = 14) {
    const was = batching;
    batching = true;
    for (let k = 0; k < n; k++) {
      const a = rnd(0, 6.28), r = rnd(0, 0.55);
      mesh(new THREE.SphereGeometry(0.06, 6, 5), pick(flowerColors), x + Math.cos(a) * r, GY + rnd(0.12, 0.22), z + Math.sin(a) * r, { cast: false });
    }
    mesh(new THREE.SphereGeometry(0.42, 10, 8), leafM, x, GY + 0.05, z, { cast: false }).scale.set(1.4, 0.35, 1.4);
    batching = was;
  }
  bush(13.6, 26.0); bush(14.2, 28.3, 1.1); bush(14.1, 31.0); bush(13.4, 32.9, 0.9); bush(9.9, 26.2, 0.8);
  flowers(8.7, 26.4); flowers(8.6, 32.4); flowers(12.6, 25.4, 10); flowers(14.6, 34.4, 10);

  // cây hoa sứ (đại) cạnh hồ
  {
    const trunkM = std('#8a7a68', { roughness: 0.95 });
    const tx = 15.0, tz = 36.8;
    const curve = new THREE.CatmullRomCurve3([[0, 0, 0], [0.15, 0.9, 0.05], [0.05, 1.8, 0.2], [0.35, 2.6, 0.1]].map((p) => new THREE.Vector3(tx + p[0], GY + p[1], tz + p[2])));
    mesh(new THREE.TubeGeometry(curve, 20, 0.12, 8), trunkM);
    for (const [dx, dz] of [[-0.6, 0.3], [0.7, -0.2], [0.2, 0.7]]) {
      const c = new THREE.CatmullRomCurve3([new THREE.Vector3(tx + 0.3, GY + 2.4, tz + 0.1), new THREE.Vector3(tx + 0.3 + dx * 0.6, GY + 2.9, tz + 0.1 + dz * 0.6), new THREE.Vector3(tx + 0.3 + dx, GY + 3.2, tz + 0.1 + dz)]);
      mesh(new THREE.TubeGeometry(c, 10, 0.06, 6), trunkM);
      mesh(new THREE.SphereGeometry(0.6, 12, 10), leafM, tx + 0.3 + dx, GY + 3.35, tz + 0.1 + dz).scale.set(1, 0.6, 1);
      for (let k = 0; k < 6; k++) {
        mesh(new THREE.SphereGeometry(0.07, 6, 5), flowerColors[2], tx + 0.3 + dx + rnd(-0.45, 0.45), GY + 3.55 + rnd(-0.05, 0.1), tz + 0.1 + dz + rnd(-0.45, 0.45), { cast: false });
      }
    }
    obstacles.push({ x: tx, z: tz, r: 0.5 });
  }

  // ---------- Trục đường chính từ sân chùa ra cổng Tam Quan ----------
  {
    const roadLen = GATE.z - 39.4;
    const road = mesh(new THREE.PlaneGeometry(7, roadLen), std('#a39a88', { roughness: 1 }), 0, GY + 0.006, 39.4 + roadLen / 2, { cast: false });
    road.rotation.x = -Math.PI / 2;
    road.userData.kind = 'ground';
    pickables.push(road);
    // viền đá hai bên đường
    for (const s of [-1, 1]) box(0.25, 0.12, roadLen, stoneL, s * 3.62, GY + 0.06, 39.4 + roadLen / 2);
    // đèn đá dọc đường (tránh sân giếng Ngọc và lối ngang sang hành lang)
    for (const z of [45, 51, 72, 77]) for (const s of [-1, 1]) stoneLantern(s * 4.6, z);
    // cây xanh hai góc sân trước cổng
    const trunkM = std('#5e4a38', { roughness: 0.9 });
    for (const [tx, tz] of [[-10, 95.5], [10, 95.5], [-10, 88.5], [10, 88.5]]) {
      mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.4, 8), trunkM, tx, GY + 1.2, tz);
      mesh(new THREE.SphereGeometry(1.5, 14, 10), leafM, tx, GY + 3.2, tz).scale.set(1, 0.8, 1);
      mesh(new THREE.SphereGeometry(1.1, 12, 9), leafD, tx + Math.sign(tx) * 0.5, GY + 3.9, tz - 0.4);
      obstacles.push({ x: tx, z: tz, r: 0.5 });
    }
    // sân trước cổng
    const plaza = mesh(new THREE.PlaneGeometry(26, 14), std('#a39a88', { roughness: 1 }), 0, GY + 0.006, GATE.plazaZ, { cast: false });
    plaza.rotation.x = -Math.PI / 2;
    plaza.userData.kind = 'ground';
    pickables.push(plaza);
  }

  // ---------- Hai hồ sen giữa trục đường và hành lang ----------
  const waterM = std('#3d6a72', { roughness: 0.15, metalness: 0.1 });
  const lotusLeafM = std('#4f8a3c', { roughness: 0.7, side: THREE.DoubleSide });
  const lotusM = std('#f3a3b6', { roughness: 0.6 });
  for (const s of [-1, 1]) {
    const cx = s * 9.2, cz = 61, rx = 3.6, rz = 16;
    const rim = mesh(new THREE.CircleGeometry(1, 48), stoneL, cx, GY + 0.012, cz, { cast: false });
    rim.scale.set(rx + 0.45, rz + 0.45, 1);
    rim.rotation.x = -Math.PI / 2;
    const water = mesh(new THREE.CircleGeometry(1, 48), waterM, cx, GY + 0.03, cz, { cast: false });
    water.scale.set(rx, rz, 1);
    water.rotation.x = -Math.PI / 2;
    // lá sen và hoa sen nổi trên mặt hồ
    const n = 46;
    const leaves = new THREE.InstancedMesh(new THREE.CircleGeometry(0.42, 14, 0.35, Math.PI * 2 - 0.35).rotateX(-Math.PI / 2), lotusLeafM, n);
    const flowers = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.26, 8).translate(0, 0.13, 0), lotusM, 12);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * 0.85;
      o.position.set(cx + Math.cos(a) * r * rx, GY + 0.045, cz + Math.sin(a) * r * rz);
      o.rotation.set(0, rnd(0, 6.28), 0);
      o.scale.setScalar(rnd(0.7, 1.3));
      o.updateMatrix();
      leaves.setMatrixAt(i, o.matrix);
      if (i < 12) {
        o.position.y = GY + 0.06;
        o.scale.setScalar(rnd(0.8, 1.1));
        o.updateMatrix();
        flowers.setMatrixAt(i, o.matrix);
      }
    }
    scene.add(leaves, flowers);
  }

  // ---------- Giếng Ngọc: giếng tròn lớn, thành đá có lan can, nước xanh ngọc ----------
  {
    const { x: wx, z: wz, r } = WELL;
    const disc = mesh(new THREE.CircleGeometry(5.6, 40), std('#b3aa98', { roughness: 1 }), wx, GY + 0.009, wz, { cast: false });
    disc.rotation.x = -Math.PI / 2;
    disc.userData.kind = 'ground';
    pickables.push(disc);
    const jade = mesh(new THREE.CircleGeometry(r - 0.15, 40), std('#1f6a62', { roughness: 0.45, envMapIntensity: 0.4 }), wx, GY + 0.35, wz, { cast: false });
    jade.rotation.x = -Math.PI / 2;
    mesh(new THREE.CylinderGeometry(r + 0.1, r + 0.18, 0.5, 40, 1, true), stoneL, wx, GY + 0.25, wz).material.side = THREE.DoubleSide;
    mesh(new THREE.TorusGeometry(r + 0.12, 0.09, 8, 48).rotateX(Math.PI / 2), stoneM, wx, GY + 0.52, wz);
    // lan can đá: trụ nhỏ quanh thành giếng, tay vịn tròn
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      box(0.1, 0.42, 0.1, stoneL, wx + Math.cos(a) * (r + 0.12), GY + 0.74, wz + Math.sin(a) * (r + 0.12));
    }
    mesh(new THREE.TorusGeometry(r + 0.12, 0.05, 6, 48).rotateX(Math.PI / 2), stoneL, wx, GY + 0.96, wz);
    // đài sen đá giữa giếng
    cyl(0.35, 0.45, 0.3, stoneL, wx, GY + 0.45, wz);
    mesh(new THREE.SphereGeometry(0.32, 14, 10), stoneL, wx, GY + 0.72, wz).scale.y = 0.6;
    obstacles.push({ x: wx, z: wz, r: r + 0.5 });
  }

  // ---------- Hai dãy hành lang La Hán: mái ngói, cột son, tượng La Hán đá hai hàng ----------
  {
    const C = CORRIDOR, len = C.z1 - C.z0, cz = (C.z0 + C.z1) / 2;
    const colM = std('#9c2a1c', { roughness: 0.55 });
    const tileM = std('#6a3426', { roughness: 0.75 });
    const wallM = std('#e6dcc6', { roughness: 0.9 });
    const ceilM = std('#5b3a24', { roughness: 0.7 });
    // tượng: hai hàng (hàng sau cao hơn), ba tư thế xen kẽ; máy yếu chỉ dựng hàng trước
    const geos = makeLaHanGeometries({ step: quality === 'high' ? 0.036 : 0.05 });
    const statueM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    const spots = [];
    for (const s of [-1, 1]) {
      const xFront = s * 15.9, xBack = s * 16.95;
      // nền, tường hậu, trần, mái
      box(C.x1 - C.x0, C.floor, len, stoneL, s * (C.x0 + C.x1) / 2, GY + C.floor / 2, cz);
      box(0.3, 3.2, len, wallM, s * (C.x1 - 0.15), GY + C.floor + 1.6, cz);
      box(C.x1 - C.x0 + 0.2, 0.08, len + 0.2, ceilM, s * (C.x0 + C.x1) / 2, GY + 3.42, cz, { cast: false });
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * 0.4, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), tileM);
      roof.scale.set(C.x1 - C.x0 + 1.6, 1.5, len + 1.6);
      roof.position.set(s * (C.x0 + C.x1) / 2, GY + 3.46 + 0.75, cz);
      roof.castShadow = roof.receiveShadow = true;
      scene.add(roof);
      box(0.18, 0.18, len * 0.4, colM, s * (C.x0 + C.x1) / 2, GY + 4.98, cz);
      // cột son phía trông ra hồ
      for (let z = C.z0 + 0.3; z <= C.z1 - 0.2; z += 3) cyl(0.17, 0.19, 3.1, colM, s * (C.x0 + 0.2), GY + C.floor + 1.55, z, {}, 12);
      // bậc tượng: hàng trước thấp, hàng sau cao
      box(0.9, 0.3, len - 1, stoneM, xFront, GY + C.floor + 0.15, cz);
      box(0.9, 0.75, len - 1, stoneM, xBack, GY + C.floor + 0.375, cz);
      for (let z = C.z0 + 1.2; z <= C.z1 - 1.2; z += 1.12) {
        spots.push([xFront, GY + C.floor + 0.3, z, s]);
        if (quality === 'high') spots.push([xBack, GY + C.floor + 0.75, z + 0.56, s]);
      }
      // biển hành lang ở đầu phía sân chùa
      const bz = C.z0 - 0.05;
      box(3.0, 0.8, 0.06, M.gold, s * (C.x0 + C.x1) / 2, GY + 3.0, bz, { cast: false });
      mesh(new THREE.PlaneGeometry(2.8, 0.66), boardMat(['HÀNH LANG LA HÁN'], { w: 1024, h: 240, size: 96 }), s * (C.x0 + C.x1) / 2, GY + 3.0, bz - 0.04, { cast: false }).rotation.y = Math.PI;
    }
    const o = new THREE.Object3D();
    const tint = new THREE.Color();
    geos.forEach((g, v) => {
      const mine = spots.filter((_, i) => i % 3 === v);
      const inst = new THREE.InstancedMesh(g, statueM, mine.length);
      mine.forEach(([x, y, z, s], i) => {
        o.position.set(x, y, z);
        o.rotation.set(0, -s * Math.PI / 2 + rnd(-0.12, 0.12), 0);
        o.scale.setScalar(rnd(0.95, 1.08));
        o.updateMatrix();
        inst.setMatrixAt(i, o.matrix);
        inst.setColorAt(i, tint.setHSL(0.1, rnd(0.02, 0.1), rnd(0.82, 1)));
      });
      inst.receiveShadow = true;
      scene.add(inst);
      lodAdd(inst, 0, 62, 85);
    });
  }

  // mái chữ nhật bốn mái (chóp cụt 4 cạnh: đáy w × d, đỉnh còn top, cao h), có bờ nóc và đầu đao vểnh
  function rectRoof(x, y, z, w, d, h, mat, { top = 0.45, ridge = true, tips = true } = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), mat);
    m.scale.set(w, h, d);
    m.position.set(x, y + h / 2, z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    if (ridge) {
      box(w * top * 0.95, 0.16, 0.2, M.lacquer, x, y + h + 0.06, z);
      for (const sx of [-1, 1]) mesh(new THREE.ConeGeometry(0.1, 0.5, 6), M.gold, x + sx * w * top * 0.5, y + h + 0.2, z).rotation.z = -sx * 0.5;
    }
    if (tips) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const tip = mesh(new THREE.ConeGeometry(0.09, 0.6, 6), mat, x + sx * (w / 2 + 0.05), y + 0.14, z + sz * (d / 2 + 0.05));
        tip.rotation.set(sz * 0.7, 0, -sx * 0.7);
      }
    }
    return m;
  }
  const sideTile = std('#6a3426', { roughness: 0.75 });
  const sideCol = std('#9c2a1c', { roughness: 0.55 });
  const sideWall = std('#e6dcc6', { roughness: 0.9 });
  const pave = std('#a39a88', { roughness: 1 });

  // lối đi và nền lát của hai sân bên
  for (const s of [-1, 1]) {
    const lane = mesh(new THREE.PlaneGeometry(6, 1.8), pave, s * 18.5, GY + 0.007, 23.5, { cast: false });
    lane.rotation.x = -Math.PI / 2;
    lane.userData.kind = 'ground';
    pickables.push(lane);
    const court = mesh(new THREE.PlaneGeometry(22, 22), pave, s * 32, GY + 0.006, 29, { cast: false });
    court.rotation.x = -Math.PI / 2;
    court.userData.kind = 'ground';
    pickables.push(court);
    // bồn cây và đèn đá quanh sân
    for (const [dx, dz] of [[-9.5, 9.5], [9.5, 9.5], [-9.5, -9.2], [9.5, -9.2]]) stoneLantern(s * 32 + dx, 29 + dz);
    bush(s * 42, 20, 0.9); bush(s * 42, 38, 0.9); bush(s * 22.5, 38.5, 0.8);
  }

  // ---------- Sau chánh điện: lối hai bên, sân sau, bậc thang đá, nền đồi ----------
  const H = TERRACE.y;
  {
    for (const s of [-1, 1]) {
      const lane = mesh(new THREE.PlaneGeometry(4.6, 52.2), pave, s * 18.5, GY + 0.007, -2.9, { cast: false });
      lane.rotation.x = -Math.PI / 2;
      lane.userData.kind = 'ground';
      pickables.push(lane);
    }
    const back = mesh(new THREE.PlaneGeometry(41.6, 7.2), pave, 0, GY + 0.008, -29.6, { cast: false });
    back.rotation.x = -Math.PI / 2;
    back.userData.kind = 'ground';
    pickables.push(back);
    // bậc thang đá: 24 bậc, mỗi bậc cao 1/3 m
    const n = 24, run = (STAIRS.z1 - STAIRS.z0) / n, rise = 8 / n;
    const stepM = std('#b8b1a3', { roughness: 0.95 });
    const steps = new THREE.Group();
    steps.userData.kind = 'ground';
    scene.add(steps);
    pickables.push(steps);
    for (let i = 0; i < n; i++) {
      box(STAIRS.x * 2, (i + 1) * rise, run + 0.02, stepM, 0, GY + ((i + 1) * rise) / 2, STAIRS.z1 - (i + 0.5) * run, { parent: steps });
    }
    // lan can đá dốc hai bên bậc thang, trụ đèn đá ở chân
    const L = Math.hypot(STAIRS.z1 - STAIRS.z0, 8), tilt = Math.atan2(8, STAIRS.z1 - STAIRS.z0);
    for (const s of [-1, 1]) {
      const rail = box(0.4, 0.9, L, stoneM, s * (STAIRS.x + 0.2), GY + 4 + 0.45, (STAIRS.z0 + STAIRS.z1) / 2);
      rail.rotation.x = tilt;
      stoneLantern(s * 5.2, -33.6);
    }
    // nền đồi: hai khối tường đá chắn hai bên bậc thang, khối giữa phía sau bậc trên cùng
    const retainM = std('#8f897d', { roughness: 1 });
    const dz = TERRACE.z1 - TERRACE.z0, czT = (TERRACE.z0 + TERRACE.z1) / 2;
    for (const s of [-1, 1]) {
      box(TERRACE.x - STAIRS.x, 8, dz, retainM, s * (STAIRS.x + TERRACE.x) / 2, GY + 4, czT);
      // lan can đá dọc mép nền
      box(TERRACE.x - STAIRS.x - 0.6, 0.7, 0.3, stoneL, s * (STAIRS.x + TERRACE.x) / 2 + s * 0.3, H + 0.35, TERRACE.z1 - 0.15);
    }
    box(STAIRS.x * 2, 8, TERRACE.z1 - 0.4 - TERRACE.z0, retainM, 0, GY + 4, (TERRACE.z0 + TERRACE.z1 - 0.4) / 2);
    const top = mesh(new THREE.PlaneGeometry(TERRACE.x * 2, dz), std('#aaa292', { roughness: 1 }), 0, H + 0.012, czT, { cast: false });
    top.rotation.x = -Math.PI / 2;
    top.userData.kind = 'ground';
    pickables.push(top);
    // đồi xanh phía sau và hai bên
    const hillM = std('#5f7a45', { roughness: 1 });
    mesh(new THREE.SphereGeometry(1, 36, 18), hillM, 0, GY - 8, -98, { cast: false }).scale.set(75, 26, 40);
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(1, 28, 14), hillM, s * 40, GY - 6, -70, { cast: false }).scale.set(26, 17, 30);
    // cây trên nền đồi
    const trunkM = std('#5e4a38', { roughness: 0.9 });
    for (const [tx, tz] of [[-16, -50], [16, -50], [-16, -62], [16, -62], [-15, -66], [15, -66]]) {
      mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.6, 8), trunkM, tx, H + 1.3, tz);
      mesh(new THREE.SphereGeometry(1.6, 14, 10), leafM, tx, H + 3.4, tz).scale.set(1, 0.85, 1);
      mesh(new THREE.SphereGeometry(1.1, 12, 9), leafD, tx + 0.5, H + 4.1, tz - 0.4);
    }
  }

  // ---------- Điện Tam Thế: ba tượng Phật lớn (quá khứ, hiện tại, vị lai), mái chồng diêm ----------
  const TT = TAMTHE;
  const TT_HEAD = new THREE.Vector3(0, H + 3.0, TT.z0 + 1.6);
  let incenseTT = null;
  {
    const w = TT.x1 - TT.x0, d = TT.z1 - TT.z0, cz = (TT.z0 + TT.z1) / 2;
    box(w + 1.2, 0.2, d + 1.2, stoneL, 0, H + 0.1, cz);
    const floorT = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, H + 0.21, cz, { cast: false });
    floorT.rotation.x = -Math.PI / 2;
    floorT.userData.kind = 'ground';
    pickables.push(floorT);
    box(2.4, 0.02, d - 3, std('#7a271c', { roughness: 1 }), 0, H + 0.22, cz + 1.2, { cast: false });
    box(w, 6, 0.3, sideWall, 0, H + 3.2, TT.z0 + 0.15);
    for (const sx of [-1, 1]) {
      box(0.3, 6, d, sideWall, sx * (w / 2 - 0.15), H + 3.2, cz);
      for (const wz of [-61, -57.5, -54]) box(0.08, 1.6, 1.2, std('#2c2018', { roughness: 0.8 }), sx * (w / 2 - 0.32), H + 3.0, wz);
    }
    for (const cx of [-11.4, -8, -4.4, 4.4, 8, 11.4]) cyl(0.3, 0.33, 6, sideCol, cx, H + 3.2, TT.z1 - 0.2, {}, 12);
    box(w, 0.5, 0.4, sideCol, 0, H + 6.0, TT.z1 - 0.2);
    box(w, 0.1, d, std('#5b3a24', { roughness: 0.7 }), 0, H + 6.25, cz, { cast: false });
    rectRoof(0, H + 6.2, cz, w + 3.4, d + 3.4, 1.3, sideTile, { top: 0.66, ridge: false });
    box(w * 0.66, 1.9, d * 0.62, sideWall, 0, H + 8.4, cz);
    box(5.6, 1.15, 0.06, M.gold, 0, H + 8.4, cz + d * 0.31 + 0.02);
    mesh(new THREE.PlaneGeometry(5.4, 1.0), boardMat(['TAM THẾ ĐIỆN'], { w: 1024, h: 190, size: 110 }), 0, H + 8.4, cz + d * 0.31 + 0.06, { cast: false });
    rectRoof(0, H + 9.35, cz, w * 0.66 + 3, d * 0.62 + 3, 2.3, sideTile, { top: 0.33 });
    mesh(new THREE.SphereGeometry(0.4, 14, 10), M.gold, 0, H + 11.9, cz);
    // bàn thờ dài, ba tượng Phật (dùng chung khuôn tượng trong chánh điện)
    box(15, 1.2, 2.2, M.lacquer, 0, H + 0.8, TT.z0 + 1.6);
    box(15.2, 0.08, 2.4, M.gold, 0, H + 1.44, TT.z0 + 1.6, { cast: false });
    for (const x of [-4.6, 0, 4.6]) {
      const b = buddhaLite.clone();
      b.traverse((m) => (m.castShadow = false));
      lodAdd(b, x, TT.z0, 60);
      b.position.set(x, H + 1.48, TT.z0 + 1.6);
      b.scale.setScalar(1.15);
      scene.add(b);
    }
    for (const x of [-6.8, -2.3, 2.3, 6.8]) {
      cyl(0.08, 0.1, 0.06, M.bronze, x, H + 1.51, TT.z0 + 2.5);
      cyl(0.045, 0.045, 0.26, M.candle, x, H + 1.67, TT.z0 + 2.5);
      flame(x, H + 1.88, TT.z0 + 2.5, 0.9);
    }
    // kệ lư hương giữa điện, bồ đoàn hai hàng
    box(1.0, 0.8, 0.7, M.lacquer, 0, H + 0.61, -59.8);
    cyl(0.26, 0.22, 0.22, M.bronze, 0, H + 1.12, -59.8);
    incenseTT = makeBurner({
      center: new THREE.Vector3(0, H + 1.2, -59.8),
      radius: 0.16,
      spots: [-1, 0, 1].map((dx) => ({ x: dx, z: -58.4 })),
      target: TT_HEAD,
      smoke: 26,
      min: 3,
    });
    for (const x of [-7, -5, -3, 3, 5, 7]) for (const z of [-56.4, -54.6]) {
      cyl(0.36, 0.38, 0.1, std('#c9a23e', { roughness: 0.8 }), x, H + 0.26, z, {}, 18);
    }
    const ttLight = new THREE.PointLight('#ffc27a', 8, 16, 2);
    ttLight.position.set(0, H + 4.6, -58);
    scene.add(ttLight);
    nightHooks.push((night) => (ttLight.intensity = 8 + 26 * night));
  }

  // ---------- Gác chuông: hai tầng mái, tầng trên treo đại hồng chung, chày gỗ treo ngang ----------
  const BT = BELLTOWER;
  let greatBell = null;
  {
    const g = new THREE.Group();
    g.userData.kind = 'greatbell';
    g.position.set(BT.x, GY, BT.z);
    scene.add(g);
    pickables.push(g);
    const o = { parent: g };
    box(9.4, 0.4, 9.4, stoneL, 0, 0.2, 0, o);
    box(8.6, 0.2, 8.6, stoneM, 0, 0.5, 0, o);
    // 12 cột son quanh chu vi, cao suốt hai tầng
    for (const a of [-3.6, -1.2, 1.2, 3.6]) {
      for (const [cx, cz] of [[a, -3.6], [a, 3.6]]) cyl(0.2, 0.23, 7.2, sideCol, cx, 0.6 + 3.6, cz, o, 12);
    }
    for (const a of [-1.2, 1.2]) for (const cx of [-3.6, 3.6]) cyl(0.2, 0.23, 7.2, sideCol, cx, 0.6 + 3.6, a, o, 12);
    // sàn tầng trên, lan can
    box(8.2, 0.22, 8.2, std('#5b3a24', { roughness: 0.7 }), 0, 4.0, 0, o);
    for (const sz of [-1, 1]) {
      box(8.0, 0.08, 0.08, sideCol, 0, 4.75, sz * 3.6, o);
      box(0.08, 0.08, 8.0, sideCol, sz * 3.6, 4.75, 0, o);
    }
    // biển gác chuông ở tầng trên, mặt trông ra sân
    box(2.6, 0.75, 0.06, M.gold, 0, 7.1, 3.72, o);
    mesh(new THREE.PlaneGeometry(2.4, 0.6), boardMat(['GÁC CHUÔNG'], { w: 1024, h: 256, size: 130 }), 0, 7.1, 3.76, o);
    // xà treo chuông
    box(5.2, 0.3, 0.3, std('#5b3a24', { roughness: 0.7 }), 0, 7.45, 0, o);
    // đại hồng chung: thân chuông đồng tiện tròn, núm treo hình rồng cách điệu
    const bellG = new THREE.Group();
    bellG.position.set(0, 7.3, 0);
    g.add(bellG);
    const prof = [[0, -2.25], [0.98, -2.25], [1.0, -2.05], [0.9, -1.8], [0.82, -1.2], [0.8, -0.4], [0.74, -0.1], [0.55, 0.04], [0, 0.06]].map(([x, y]) => new THREE.Vector2(x, y));
    const bronze = std('#6e5530', { metalness: 0.75, roughness: 0.42 });
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), bronze);
    bell.material.side = THREE.DoubleSide;
    bell.castShadow = true;
    bellG.add(bell);
    for (const y of [-0.5, -1.3, -1.95]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(y < -1.9 ? 0.95 : 0.81, 0.035, 6, 40).rotateX(Math.PI / 2), bronze);
      band.position.y = y;
      bellG.add(band);
    }
    const knob = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 8, 16), bronze);
    knob.position.y = 0.16;
    bellG.add(knob);
    // chày gỗ treo ngang bằng hai sợi thừng, chĩa vào sườn chuông
    const strikerG = new THREE.Group();
    strikerG.position.set(2.3, 7.4, 0);
    g.add(strikerG);
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.0, 12).rotateZ(Math.PI / 2), std('#8a6a44', { roughness: 0.8 }));
    log.position.y = -1.85;
    strikerG.add(log);
    for (const dx of [-0.6, 0.6]) {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.85, 4), std('#c9b07a', { roughness: 1 }));
      rope.position.set(dx, -0.92, 0);
      strikerG.add(rope);
    }
    // hai tầng mái
    rectRoof(BT.x, GY + 3.7, BT.z, 10.6, 10.6, 0.7, sideTile, { top: 0.72, ridge: false });
    rectRoof(BT.x, GY + 7.8, BT.z, 10.2, 10.2, 1.5, sideTile, { top: 0.32 });
    mesh(new THREE.SphereGeometry(0.28, 14, 10), M.gold, BT.x, GY + 9.6, BT.z);
    obstacles.push({ x: BT.x, z: BT.z, r: BT.r });
    // thỉnh chuông: chày lùi ra rồi lao vào, chuông lắc nhẹ
    const anim = { t: 99 };
    updaters.push((t, dt) => {
      anim.t += dt;
      const k = anim.t;
      // 0–0,9 s kéo chày lùi ra; 0,9–1,05 s chày lao vào chạm chuông; sau đó rung nhẹ tắt dần
      strikerG.rotation.z = k < 0.9 ? Math.sin((k / 0.9) * Math.PI * 0.5) * 0.5
        : k < 1.05 ? 0.5 * (1 - (k - 0.9) / 0.15)
          : Math.sin((k - 1.05) * 6) * 0.08 * Math.exp(-(k - 1.05) * 2);
      bellG.rotation.z = k > 1.05 ? Math.sin((k - 1.05) * 3.2) * 0.035 * Math.exp(-(k - 1.05) * 0.5) : 0;
    });
    greatBell = {
      spot: new THREE.Vector3(BT.x, 0, BT.z + BT.r + 0.6),
      center: new THREE.Vector3(BT.x, GY + 6, BT.z),
      // trả về thời điểm chày chạm chuông (giây) để phát tiếng đúng lúc
      ring() {
        anim.t = 0;
        return 1.05;
      },
    };
  }

  // ---------- Điện Quan Âm: hai tầng mái, tượng Quan Âm dát vàng, lư hương, nến ----------
  const QH = QAHALL;
  let incenseQH = null;
  const QH_HEAD = new THREE.Vector3(QH.cx, GY + 3.6, QH.z0 + 1.3);
  {
    const w = QH.x1 - QH.x0, d = QH.z1 - QH.z0, cz = (QH.z0 + QH.z1) / 2;
    box(w + 1.2, 0.2, d + 1.4, stoneL, QH.cx, GY + 0.1, cz + 0.2);
    const floorQ = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: floorTex, roughness: 0.55 }), QH.cx, GY + 0.21, cz, { cast: false });
    floorQ.rotation.x = -Math.PI / 2;
    floorQ.userData.kind = 'ground';
    pickables.push(floorQ);
    box(2.2, 0.02, d - 2, std('#7a271c', { roughness: 1 }), QH.cx, GY + 0.22, cz + 1, { cast: false });
    // tường sau và hai tường bên, có cửa sổ
    box(w, 4.4, 0.3, sideWall, QH.cx, GY + 2.4, QH.z0 + 0.15);
    for (const sx of [-1, 1]) {
      box(0.3, 4.4, d, sideWall, QH.cx + sx * (w / 2 - 0.15), GY + 2.4, cz);
      for (const wz of [8.5, 12.5]) box(0.08, 1.3, 1.1, std('#2c2018', { roughness: 0.8 }), QH.cx + sx * (w / 2 - 0.32), GY + 2.5, wz);
    }
    // hàng cột son mặt tiền (để trống ở giữa làm lối vào), cột trong điện
    for (const cx of [QH.x0 + 0.6, 29.4, 34.6, QH.x1 - 0.6]) cyl(0.24, 0.27, 4.4, sideCol, cx, GY + 2.4, QH.z1 - 0.2, {}, 12);
    box(w, 0.45, 0.35, sideCol, QH.cx, GY + 4.4, QH.z1 - 0.2);
    box(w, 0.1, d, std('#5b3a24', { roughness: 0.7 }), QH.cx, GY + 4.62, cz, { cast: false });
    // mái chồng diêm: mái dưới, thân gác, mái trên
    rectRoof(QH.cx, GY + 4.6, cz, w + 2.6, d + 2.6, 1.0, sideTile, { top: 0.66, ridge: false });
    box(w * 0.66, 1.4, d * 0.62, sideWall, QH.cx, GY + 6.1, cz);
    box(4.4, 0.95, 0.06, M.gold, QH.cx, GY + 6.1, cz + d * 0.31 + 0.02);
    mesh(new THREE.PlaneGeometry(4.2, 0.8), boardMat(['QUAN ÂM ĐIỆN'], { w: 1024, h: 196, size: 110 }), QH.cx, GY + 6.1, cz + d * 0.31 + 0.06, { cast: false });
    rectRoof(QH.cx, GY + 6.8, cz, w * 0.66 + 2.4, d * 0.62 + 2.4, 1.6, sideTile, { top: 0.35 });
    mesh(new THREE.SphereGeometry(0.3, 14, 10), M.gold, QH.cx, GY + 8.7, cz);
    // bàn thờ và tượng Quan Âm dát vàng (dùng lại khuôn tượng ngoài sân)
    box(5.2, 1.0, 1.7, M.lacquer, QH.cx, GY + 0.7, QH.z0 + 1.2);
    box(5.4, 0.08, 1.9, M.gold, QH.cx, GY + 1.22, QH.z0 + 1.2, { cast: false });
    const gilt = new Map();
    const qa2 = quanAm.clone();
    qa2.traverse((m) => {
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
    });
    qa2.traverse((m) => (m.castShadow = false));
    lodAdd(qa2, QH.cx, QH.z0, 50);
    qa2.position.set(QH.cx, GY + 1.26, QH.z0 + 1.25);
    qa2.rotation.y = 0;
    qa2.scale.setScalar(1.12);
    scene.add(qa2);
    for (const sx of [-1, 1]) {
      cyl(0.08, 0.1, 0.06, M.bronze, QH.cx + sx * 2.0, GY + 1.29, QH.z0 + 1.9);
      cyl(0.045, 0.045, 0.24, M.candle, QH.cx + sx * 2.0, GY + 1.44, QH.z0 + 1.9);
      flame(QH.cx + sx * 2.0, GY + 1.64, QH.z0 + 1.9, 0.9);
    }
    // kệ lư hương trước bàn thờ
    box(0.9, 0.7, 0.6, M.lacquer, QH.cx, GY + 0.56, 7.7);
    cyl(0.24, 0.2, 0.2, M.bronze, QH.cx, GY + 1.01, 7.7);
    incenseQH = makeBurner({
      center: new THREE.Vector3(QH.cx, GY + 1.09, 7.7),
      radius: 0.15,
      spots: [-1, 0, 1].map((dx) => ({ x: QH.cx + dx, z: 9.0 })),
      target: QH_HEAD,
      smoke: 26,
      min: 2,
    });
    // bồ đoàn cho người lễ
    for (const dx of [-3, -1.5, 1.5, 3]) for (const z of [11, 13]) {
      cyl(0.36, 0.38, 0.1, std('#c9a23e', { roughness: 0.8 }), QH.cx + dx, GY + 0.26, z, {}, 18);
    }
    // đèn ấm trong điện
    const qhLight = new THREE.PointLight('#ffc27a', 6, 12, 2);
    qhLight.position.set(QH.cx, GY + 3.6, 9);
    scene.add(qhLight);
    nightHooks.push((night) => (qhLight.intensity = 6 + 20 * night));
  }

  batching = false;

  // ---------- Núi đá vôi, sông, ruộng lúa quanh chùa (cảnh xa kiểu Tràng An) ----------
  {
    // khối núi đá vôi: vách dựng đứng, đỉnh tròn, cây phủ trên đỉnh và các gờ đá
    const prof = [[1, 0], [1.02, 0.18], [0.96, 0.38], [0.93, 0.55], [0.85, 0.72], [0.7, 0.85], [0.48, 0.95], [0.2, 1.0], [0, 1.01]];
    const cliff = new THREE.Color('#9a998c'), dark = new THREE.Color('#6f7266'), green = new THREE.Color('#4f6b3a'), green2 = new THREE.Color('#5f7d44');
    const peakGeo = (seed) => {
      const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 18).toNonIndexed();
      const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
      const n = (x, y, z) => Math.sin(x * 3.1 + seed) * Math.sin(z * 2.7 - seed * 1.3) + 0.5 * Math.sin(y * 9 + x * 5 + seed * 2);
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const k = 1 + 0.16 * n(x, y, z);
        p.setXYZ(i, x * k, y * (1 + 0.05 * n(z, x, y)), z * k);
        const leafy = y > 0.78 || (Math.sin(y * 26 + seed) > 0.75 && y > 0.25);
        c.copy(leafy ? (n(x, z, y) > 0 ? green : green2) : (n(y, x, z) > 0.3 ? dark : cliff));
        col.set([c.r, c.g, c.b], i * 3);
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    const karstM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    const geos = [peakGeo(1), peakGeo(4.2), peakGeo(7.7)];
    const insts = geos.map((g) => new THREE.InstancedMesh(g, karstM, 16));
    const used = [0, 0, 0];
    const o = new THREE.Object3D();
    let seed = 7;
    const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      const a = rr() * Math.PI * 2, d = 105 + rr() * 85;
      const x = Math.cos(a) * d, z = 15 + Math.sin(a) * d;
      const v = i % 3;
      if (used[v] >= 16) continue;
      const r = 9 + rr() * 12, h = 26 + rr() * 42;
      o.position.set(x, GY - 1, z);
      o.rotation.set(0, rr() * 6.28, 0);
      o.scale.set(r, h, r * (0.75 + rr() * 0.5));
      o.updateMatrix();
      insts[v].setMatrixAt(used[v]++, o.matrix);
    }
    insts.forEach((m, v) => {
      m.count = used[v];
      scene.add(m);
    });
    // sông uốn lượn phía nam, sau sân trước cổng
    const segs = 80, pts = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const x = -230 + (460 * i) / segs, zc = 132 + Math.sin(x / 38) * 14 + Math.sin(x / 13) * 3, w = 9 + Math.sin(x / 21) * 2;
      pts.push(x, GY - 0.01, zc - w, x, GY - 0.01, zc + w);
      if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const riverG = new THREE.BufferGeometry();
    riverG.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    riverG.setIndex(idx);
    riverG.computeVertexNormals();
    const river = new THREE.Mesh(riverG, std('#4d7f84', { roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide }));
    scene.add(river);
    // ruộng lúa ô bàn cờ giữa chùa và sông
    const paddy = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), std('#ffffff', { roughness: 0.9 }), 160);
    const pc = new THREE.Color();
    let pi = 0;
    for (let gx = -9; gx < 9 && pi < 160; gx++) {
      for (let gz = 0; gz < 9 && pi < 160; gz++) {
        const x = gx * 13 + 6.5, z = 106 + gz * 6.2;
        if (Math.abs(x) < 16 && z < 112) continue;
        if (z > 132 + Math.sin(x / 38) * 14 - 13) continue; // không lấn xuống sông
        o.position.set(x, GY - 0.015, z);
        o.rotation.set(0, 0, 0);
        o.scale.set(12.2, 1, 5.6);
        o.updateMatrix();
        paddy.setMatrixAt(pi, o.matrix);
        paddy.setColorAt(pi++, pc.setHSL(0.22 + rr() * 0.06, 0.45, 0.32 + rr() * 0.12));
      }
    }
    paddy.count = pi;
    scene.add(paddy);
  }

  // ---------- Cổng Tam Quan: cửa giữa hai tầng mái, hai cửa bên một tầng mái ----------
  {
    const wallM = std('#e6dcc6', { roughness: 0.9 });
    const tileM = std('#6a3426', { roughness: 0.75 });
    const colM = std('#9c2a1c', { roughness: 0.55 });
    const GZ = GATE.z;
    const gate = new THREE.Group();
    scene.add(gate);
    staticRoots.push(gate);
    const o = { parent: gate };
    // mái chữ nhật bốn mái: khối chóp cụt 4 cạnh, đầu đao vểnh ở bốn góc, bờ nóc trên cùng
    function hipRoof(x, y, w, d, h) {
      // khối chóp cụt 4 cạnh: đáy w × d, đỉnh còn 45%, cao 2h
      const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * 0.45, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), tileM);
      m.scale.set(w, h * 2, d);
      m.position.set(x, y + h, GZ);
      m.castShadow = m.receiveShadow = true;
      gate.add(m);
      box(w * 0.42, 0.16, 0.18, colM, x, y + h * 1.92, GZ, o);
      for (const sx of [-1, 1]) {
        const ridgeEnd = mesh(new THREE.ConeGeometry(0.1, 0.5, 6), M.gold, x + sx * w * 0.22, y + h * 2.05, GZ, o);
        ridgeEnd.rotation.z = -sx * 0.5;
        for (const sz of [-1, 1]) {
          const tip = mesh(new THREE.ConeGeometry(0.08, 0.55, 6), tileM, x + sx * (w / 2 + 0.05), y + 0.12, GZ + sz * (d / 2 + 0.05), o);
          tip.rotation.set(sz * 0.7, 0, -sx * 0.7);
        }
      }
    }
    // bậc nền
    box(30, 0.24, 6, stoneL, 0, GY + 0.12, GZ, o);
    // cửa giữa: bốn cột lớn, hai tầng mái, gác có biển tên chùa
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.32, 0.36, 4.6, colM, sx * 2.3, GY + 0.24 + 2.3, GZ + sz * 1.5, o, 14);
    box(5.4, 0.4, 3.6, colM, 0, GY + 4.85, GZ, o);
    hipRoof(0, GY + 4.6, 8.4, 5.6, 0.75);
    box(4.6, 1.8, 2.8, wallM, 0, GY + 6.9, GZ, o);
    for (const sz of [-1, 1]) {
      box(3.1, 0.95, 0.06, M.gold, 0, GY + 6.95, GZ + sz * 1.43, o);
      const plaque = mesh(new THREE.PlaneGeometry(2.9, 0.8), boardMat(['AM MÂY TỰ']), 0, GY + 6.95, GZ + sz * 1.47, o);
      if (sz < 0) plaque.rotation.y = Math.PI;
    }
    hipRoof(0, GY + 7.75, 6.6, 4.4, 0.7);
    mesh(new THREE.SphereGeometry(0.24, 14, 10), M.gold, 0, GY + 7.75 + 1.65, GZ, o);
    // hai cửa bên
    for (const sx of [-1, 1]) {
      const cx = sx * 6.2;
      for (const dx of [-1.45, 1.45]) cyl(0.24, 0.27, 3.4, colM, cx + dx, GY + 0.24 + 1.7, GZ, o, 12);
      box(3.2, 0.3, 0.5, colM, cx, GY + 3.55, GZ, o);
      hipRoof(cx, GY + 3.5, 5.0, 3.8, 0.6);
      // cửa bên đóng: cánh gỗ sơn son
      box(2.6, 3.1, 0.12, std('#7d2217', { roughness: 0.5 }), cx, GY + 1.8, GZ, o);
      // tường nối cửa giữa với cửa bên, tường bao chạy ra hai phía
      box(1.3, 3.0, 0.7, wallM, sx * 3.7, GY + 1.74, GZ, o);
      box(0.9, 0.2, 0.9, tileM, sx * 3.7, GY + 3.34, GZ, o);
      box(12, 2.4, 0.6, wallM, sx * 13.7, GY + 1.44, GZ, o);
      box(12.2, 0.18, 0.9, tileM, sx * 13.7, GY + 2.72, GZ, o);
    }
    // hai sư tử đá giữ cửa, phía sân trước
    for (const sx of [-1, 1]) {
      box(0.9, 0.6, 0.9, stoneM, sx * 3.0, GY + 0.54, GZ + 3.4, o);
      mesh(new THREE.SphereGeometry(0.42, 12, 10), stoneL, sx * 3.0, GY + 1.2, GZ + 3.45, o).scale.set(0.9, 1.1, 1);
      mesh(new THREE.SphereGeometry(0.3, 12, 10), stoneL, sx * 3.0, GY + 1.72, GZ + 3.6, o);
    }
  }

  // ---------- Tháp 13 tầng và tiểu cảnh, phía đối diện tượng Quan Âm ----------
  const TW = TOWER;
  const towerParts = { wall: [], tile: [], red: [], trim: [], gold: [], win: [], wood: [] };
  const towerMats = {
    wall: std('#ece3cf', { roughness: 0.9 }),
    tile: std('#6a3426', { roughness: 0.75 }),
    red: std('#9c2a1c', { roughness: 0.55 }),
    trim: std('#bdb4a2', { roughness: 0.9 }),
    gold: M.gold,
    win: std('#2c2018', { emissive: '#ffb25e', emissiveIntensity: 0, roughness: 0.8 }),
    wood: std('#6b3f26', { roughness: 0.6 }),
  };
  // thêm một khối hình vào tháp (gộp lại theo vật liệu): nghiêng rz, xoay quanh trục đứng ry, đặt lệch (x, z) so với tâm tháp
  function tp(key, geo, x, y, z, ry = 0, rz = 0) {
    if (rz) geo.rotateZ(rz);
    if (ry) geo.rotateY(ry);
    geo.translate(TW.x + x, y, TW.z + z);
    towerParts[key].push(geo.index ? geo.toNonIndexed() : geo);
  }
  const oct = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 8).rotateY(Math.PI / 8);
  const COS8 = Math.cos(Math.PI / 8);
  {
    // nền đá bát giác
    tp('trim', oct(TW.plinthR, TW.plinthR + 0.1, TOWER_BASE), 0, GY + TOWER_BASE / 2, 0);
    let y = GY + TOWER_BASE;
    TOWER_LEVELS.forEach(({ r, h }, i) => {
      const rw = r * 0.86; // tường
      if (i < 12) {
        const wh = h - 0.3;
        tp('wall', oct(rw * 0.97, rw, wh), 0, y + wh / 2, 0);
        tp('trim', oct(rw + 0.1, rw + 0.12, 0.1), 0, y + 0.05, 0); // gờ chân tường
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('red', new THREE.BoxGeometry(0.13, wh, 0.13), Math.sin(a) * (rw + 0.02), y + wh / 2, Math.cos(a) * (rw + 0.02), a);
          // cửa sổ vòm trên mỗi mặt; mặt trông ra sân ở tầng trệt là cửa vào
          const f = (k * Math.PI) / 4, ap = rw * COS8 * 0.985;
          const door = i === 0 && k === 2;
          const ww = door ? 1.05 : Math.max(0.3, 0.46 - i * 0.012), wh2 = door ? 1.65 : Math.max(0.5, 0.78 - i * 0.02);
          const wy = door ? y + wh2 / 2 + 0.05 : y + wh * 0.52;
          tp('gold', new THREE.BoxGeometry(ww + 0.14, wh2 + 0.14, 0.04), Math.sin(f) * ap, wy, Math.cos(f) * ap, f);
          tp('win', new THREE.BoxGeometry(ww, wh2, 0.06), Math.sin(f) * (ap + 0.01), wy, Math.cos(f) * (ap + 0.01), f);
          if (door) tp('red', new THREE.BoxGeometry(1.4, 0.32, 0.05), Math.sin(f) * (ap + 0.03), wy + wh2 / 2 + 0.3, Math.cos(f) * (ap + 0.03), f);
        }
        // mái hiên bát giác, đầu đao vểnh lên ở tám góc (nghiêng ra ngoài theo hướng xuyên tâm)
        const ey = y + wh + 0.17;
        tp('tile', oct(rw * 0.88, r * 1.1, 0.34), 0, ey, 0);
        tp('red', oct(r * 1.1, r * 1.11, 0.05), 0, ey - 0.17, 0);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('tile', new THREE.ConeGeometry(0.06, 0.34, 6), Math.sin(a) * r * 1.11, ey - 0.06, Math.cos(a) * r * 1.11, a - Math.PI / 2, -0.55);
        }
      } else {
        // tầng 13: điện thờ mở bốn phía, cột son, lan can thấp
        tp('trim', oct(r * 0.98, r * 0.98, 0.12), 0, y + 0.06, 0);
        tp('wood', oct(TW.topR + 0.15, TW.topR + 0.15, 0.02), 0, TW.topY + 0.005, 0);
        const ch = 1.95, rc = r * 0.86;
        const side = 2 * rc * Math.sin(Math.PI / 8);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('red', new THREE.CylinderGeometry(0.075, 0.085, ch, 10), Math.sin(a) * rc, TW.topY + ch / 2, Math.cos(a) * rc);
          const f = (k * Math.PI) / 4, ap = rc * COS8;
          tp('red', new THREE.BoxGeometry(side - 0.1, 0.07, 0.07), Math.sin(f) * ap, TW.topY + 0.5, Math.cos(f) * ap, f);
          for (let j = -2; j <= 2; j++) {
            tp('red', new THREE.BoxGeometry(0.035, 0.45, 0.035), Math.sin(f) * ap + Math.cos(f) * j * side * 0.18, TW.topY + 0.25, Math.cos(f) * ap - Math.sin(f) * j * side * 0.18);
          }
          tp('gold', new THREE.BoxGeometry(side - 0.1, 0.12, 0.05), Math.sin(f) * ap, TW.topY + ch - 0.12, Math.cos(f) * ap, f);
        }
        // trần gỗ, mái lớn và chóp tháp
        const ry = TW.topY + ch;
        tp('wood', oct(r * 0.95, r * 0.95, 0.08), 0, ry + 0.04, 0);
        tp('tile', oct(0.55, r * 1.28, 1.0), 0, ry + 0.58, 0);
        tp('red', oct(r * 1.28, r * 1.29, 0.06), 0, ry + 0.08, 0);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('gold', new THREE.ConeGeometry(0.06, 0.4, 6), Math.sin(a) * r * 1.29, ry + 0.16, Math.cos(a) * r * 1.29, a - Math.PI / 2, -0.55);
        }
        const sy = ry + 1.08;
        tp('gold', new THREE.CylinderGeometry(0.3, 0.42, 0.3, 16), 0, sy + 0.15, 0);
        tp('gold', new THREE.CylinderGeometry(0.035, 0.05, 1.9, 8), 0, sy + 1.25, 0);
        for (let j = 0; j < 7; j++) tp('gold', new THREE.CylinderGeometry(0.3 - j * 0.03, 0.3 - j * 0.03, 0.05, 16), 0, sy + 0.45 + j * 0.2, 0);
        tp('gold', new THREE.SphereGeometry(0.2, 16, 12), 0, sy + 2.0, 0);
        tp('gold', new THREE.SphereGeometry(0.13, 14, 10), 0, sy + 2.3, 0);
        tp('gold', new THREE.ConeGeometry(0.06, 0.4, 10), 0, sy + 2.6, 0);
      }
      y += h;
    });
    const tower = new THREE.Group();
    tower.userData.kind = 'tower';
    for (const [key, list] of Object.entries(towerParts)) {
      const m = new THREE.Mesh(mergeGeometries(list), towerMats[key]);
      m.castShadow = m.receiveShadow = true;
      tower.add(m);
    }
    scene.add(tower);
    pickables.push(tower);
    obstacles.push({ x: TW.x, z: TW.z, r: TW.plinthR + 0.35 });
  }
  nightHooks.push((night) => (towerMats.win.emissiveIntensity = 0.85 * night));

  // tầng 13: bàn thờ, tượng Phật (như trong chánh điện), lư hương, nến
  const TOP_BUDDHA = new THREE.Vector3(TW.x - 1.15, TW.topY + 0.45 + 0.8, TW.z);
  {
    box(1.4, 0.45, 1.5, M.lacquer, TW.x - 1.12, TW.topY + 0.225, TW.z);
    box(1.46, 0.06, 1.56, M.gold, TW.x - 1.12, TW.topY + 0.45, TW.z, { cast: false });
    const b = buddhaLite.clone();
    b.traverse((m) => (m.castShadow = false));
    lodAdd(b, TW.x, TW.z, 45);
    b.position.set(TW.x - 1.15, TW.topY + 0.48, TW.z);
    b.scale.setScalar(0.5);
    b.rotation.y = Math.PI / 2; // nhìn ra sân, về phía tượng Quan Âm
    scene.add(b);
    for (const dz of [-0.62, 0.62]) {
      cyl(0.05, 0.06, 0.04, M.bronze, TW.x - 0.55, TW.topY + 0.5, TW.z + dz);
      cyl(0.03, 0.03, 0.16, M.candle, TW.x - 0.55, TW.topY + 0.6, TW.z + dz);
      flame(TW.x - 0.55, TW.topY + 0.74, TW.z + dz, 0.8);
    }
    // đèn ấm trong điện thờ, sáng hơn về đêm
    const topLight = new THREE.PointLight('#ffc27a', 4, 6, 2);
    topLight.position.set(TW.x - 0.2, TW.topY + 1.7, TW.z);
    scene.add(topLight);
    nightHooks.push((night) => (topLight.intensity = 4 + 14 * night));
    // kệ nhỏ đặt lư hương trước bàn thờ
    box(0.34, 0.5, 0.5, M.lacquer, TW.x - 0.2, TW.topY + 0.25, TW.z);
    cyl(0.15, 0.12, 0.14, M.bronze, TW.x - 0.2, TW.topY + 0.57, TW.z);
  }
  const incenseTop = makeBurner({
    center: new THREE.Vector3(TW.x - 0.2, TW.topY + 0.62, TW.z),
    radius: 0.09,
    spots: [-0.45, 0, 0.45].map((dz) => ({ x: TW.x + 0.45, z: TW.z + dz })),
    target: TOP_BUDDHA,
    smoke: 24,
    min: 2,
  });

  // tiểu cảnh quanh tháp: thảm cỏ, đường đá, đèn đá, cây cảnh, tùng, đá
  {
    const grassT = mesh(new THREE.CircleGeometry(6.2, 48), std('#6c8a4a', { roughness: 1 }), TW.x, GY + 0.008, TW.z, { cast: false });
    grassT.rotation.x = -Math.PI / 2;
    grassT.userData.kind = 'ground';
    pickables.push(grassT);
    for (let x = TW.x + TW.plinthR + 0.45; x < -1.7; x += 0.8) {
      const st = mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.05, 12), stoneL, x, GY + 0.025, TW.z + rnd(-0.08, 0.08), { cast: false });
      st.scale.z = rnd(0.75, 0.95);
    }
    stoneLantern(TW.x + 5.0, TW.z - 1.9);
    stoneLantern(TW.x + 5.0, TW.z + 1.9);
    // hai chậu cây cảnh hai bên cửa tháp
    for (const dz of [-1.25, 1.25]) {
      const px = TW.x + 4.35, pz = TW.z + dz;
      cyl(0.26, 0.2, 0.3, std('#5b4a3c', { roughness: 0.8 }), px, GY + 0.15, pz);
      mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), std('#5a4030', { roughness: 0.9 }), px, GY + 0.5, pz);
      for (const [dx, dy, dzz, s] of [[0, 0.82, 0, 0.32], [0.18, 0.66, 0.1, 0.22], [-0.16, 0.7, -0.08, 0.2]]) {
        mesh(new THREE.SphereGeometry(s, 10, 8), leafD, px + dx, GY + dy, pz + dzz).scale.y = 0.6;
      }
      obstacles.push({ x: px, z: pz, r: 0.35 });
    }
    bush(TW.x - 4.7, TW.z - 2.6); bush(TW.x - 4.9, TW.z + 2.4, 1.1); bush(TW.x - 2.2, TW.z - 5.0, 0.9); bush(TW.x + 2.6, TW.z + 5.0, 0.8);
    flowers(TW.x + 3.3, TW.z - 3.6); flowers(TW.x + 3.3, TW.z + 3.6); flowers(TW.x - 1.0, TW.z + 5.4, 10);
    // cây tùng nhiều tầng tán
    {
      const px = TW.x - 3.2, pz = TW.z + 5.0;
      mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.6, 8), std('#5a4030', { roughness: 0.9 }), px, GY + 0.8, pz);
      for (const [y, r] of [[1.2, 1.0], [1.85, 0.8], [2.45, 0.58], [2.95, 0.36]]) {
        mesh(new THREE.ConeGeometry(r, 0.75, 9), leafD, px, GY + y, pz);
      }
      obstacles.push({ x: px, z: pz, r: 0.6 });
    }
    // cụm đá
    for (const [x, z, s] of [[TW.x + 2.4, TW.z - 5.2, 0.5], [TW.x + 2.9, TW.z - 4.8, 0.32], [TW.x - 5.4, TW.z - 0.2, 0.45], [TW.x - 5.6, TW.z + 0.5, 0.3]]) {
      const r = mesh(new THREE.DodecahedronGeometry(s, 0), rockM, x, GY + s * 0.45, z);
      r.scale.set(1.2, 0.75, 1);
      r.rotation.y = rnd(0, 6);
      obstacles.push({ x, z, r: s + 0.25 });
    }
  }

  nightHooks.push((night) => {
    lampMat.emissiveIntensity = 2.2 * night;
    for (const g of lampGlows) g.material.opacity = 0.7 * night;
    qaLight.intensity = 80 * night;
  });

  // Đẩy điểm đến ra khỏi bệ tượng, hồ, cây… (đi lại ngoài sân)
  function pushOut(x, z) {
    for (const o of obstacles) {
      if (o.rx) {
        const nx = (x - o.x) / o.rx, nz = (z - o.z) / o.rz;
        const d = Math.hypot(nx, nz);
        if (d < 1) {
          const k = d < 1e-3 ? 1 : 1.02 / d;
          x = o.x + (d < 1e-3 ? -o.rx * 1.02 : nx * k * o.rx);
          z = o.z + nz * (d < 1e-3 ? 0 : k * o.rz);
        }
      } else {
        const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz);
        if (d < o.r) {
          const k = d < 1e-3 ? 1 : (o.r * 1.02) / d;
          x = o.x + (d < 1e-3 ? -o.r * 1.02 : dx * k);
          z = o.z + (d < 1e-3 ? 0 : dz * k);
        }
      }
    }
    return [x, z];
  }

  // ---------- Đèn lồng ----------
  let lanternMat;
  const lanternGlows = [];
  {
    const red = (lanternMat = std('#c4301e', { emissive: '#ff4a20', emissiveIntensity: 0.55, roughness: 0.6 }));
    const lanterns = [];
    for (const x of [-5, 5]) for (const z of [-8, 0, 8]) {
      const g = new THREE.Group();
      g.position.set(x, 9.4, z);
      scene.add(g);
      cyl(0.01, 0.01, 2.0, M.darkWood, 0, -1.0, 0, { parent: g, cast: false }, 4);
      const body = mesh(new THREE.SphereGeometry(0.45, 20, 14), red, 0, -2.6, 0, { parent: g, cast: false });
      body.scale.set(1, 1.25, 1);
      cyl(0.2, 0.25, 0.12, M.gold, 0, -2.0, 0, { parent: g, cast: false });
      cyl(0.25, 0.2, 0.12, M.gold, 0, -3.18, 0, { parent: g, cast: false });
      cyl(0.03, 0.06, 0.5, std('#e0b04a'), 0, -3.5, 0, { parent: g, cast: false }, 6);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff8a4a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
      gl.scale.set(2.4, 2.8, 1);
      lanternGlows.push(gl);
      gl.position.y = -2.6;
      g.add(gl);
      g.userData.seed = Math.random() * 6;
      lanterns.push(g);
    }
    updaters.push((t) => lanterns.forEach((g) => {
      g.rotation.z = Math.sin(t * 0.7 + g.userData.seed) * 0.015;
      g.rotation.x = Math.cos(t * 0.5 + g.userData.seed) * 0.01;
    }));
  }

  // ---------- Chiếu & bồ đoàn ----------
  const seats = [];
  for (const z of SEAT_Z) for (const x of SEAT_X) seats.push({ index: seats.length, x, z });
  const matMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.05, 1.9), M.mat, seats.length);
  const cushionMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.45, 0.16, 24), M.cushion, seats.length);
  {
    const o = new THREE.Object3D();
    for (const s of seats) {
      o.position.set(s.x, 0.025, s.z);
      o.updateMatrix();
      matMesh.setMatrixAt(s.index, o.matrix);
      o.position.set(s.x, 0.11, s.z + 0.05);
      o.updateMatrix();
      cushionMesh.setMatrixAt(s.index, o.matrix);
    }
  }
  matMesh.receiveShadow = true;
  cushionMesh.castShadow = cushionMesh.receiveShadow = true;
  matMesh.userData.kind = cushionMesh.userData.kind = 'seat';
  scene.add(matMesh, cushionMesh);
  pickables.push(matMesh, cushionMesh);

  // ---------- Ánh sáng ----------
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x5a3a26, 1.25);
  scene.add(hemi);
  const fill = new THREE.DirectionalLight(0xfff2e0, 0.55);
  fill.position.set(-4, 9, 30);
  scene.add(fill);
  // vùng có bóng đổ đi theo người chơi (làm tròn 4 m cho bóng khỏi rung)
  const focus = new THREE.Vector3(0, 0, -1);
  const sun = new THREE.DirectionalLight(0xffdfac, 3.4);
  sun.position.set(32, 17, 8);
  sun.target.position.set(0, 0, -1);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const spot = new THREE.SpotLight(0xffd9a0, 230, 30, 0.42, 0.6, 2);
  spot.position.set(0, 9.2, -9);
  spot.target.position.copy(BUDDHA);
  scene.add(spot, spot.target);
  // đèn chiếu mặt từ bên trái, tạo khối cho gương mặt
  const faceLight = new THREE.SpotLight(0xffe4bd, 120, 22, 0.22, 0.5, 2);
  faceLight.position.set(-3.5, 7.5, -10.5);
  faceLight.target.position.set(0, 6.4, -18.6);
  // đèn hắt viền từ phía sau, làm sáng đường viền vàng
  const rim = new THREE.SpotLight(0xffc27a, 110, 14, 0.7, 0.6, 2);
  rim.position.set(0, 9.6, -21.2);
  rim.target.position.set(0, 4.5, -18.6);
  scene.add(faceLight, faceLight.target, rim, rim.target);

  // Vòng đánh dấu điểm đến
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.34, 40),
    new THREE.MeshBasicMaterial({ color: '#fff6df', transparent: true, opacity: 0, depthWrite: false }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.04;
  scene.add(marker);
  let markerStart = -10;
  let now = 0;
  updaters.push((t) => {
    now = t;
    const k = (t - markerStart) / 0.9;
    marker.visible = k < 1;
    if (marker.visible) {
      marker.scale.setScalar(0.6 + k * 0.9);
      marker.material.opacity = 0.9 * (1 - k);
    }
  });

  // ---------- Ngày và đêm theo giờ Việt Nam (UTC+7) ----------
  // [giờ, đỉnh trời, chân trời, mặt đất xa, màu nắng, độ nắng, độ sáng trời, mức đêm 0..1]
  const DAY_KEYS = [
    [0, '#050a1a', '#0f1830', '#0a0d16', '#000000', 0, 0.22, 1],
    [4.8, '#08102a', '#1c2240', '#10121c', '#000000', 0, 0.26, 1],
    [5.6, '#22335c', '#c27a62', '#4a3a40', '#ff9a60', 0.4, 0.5, 0.55],
    [6.5, '#5a80b0', '#f2b98a', '#a08070', '#ffc48a', 1.8, 0.85, 0.1],
    [8, '#7ea7c6', '#d6e3e4', '#efe1c4', '#ffe4b8', 3.0, 1.15, 0],
    [12, '#7ea7c6', '#d6e3e4', '#efe1c4', '#fff2da', 3.4, 1.25, 0],
    [16.5, '#7aa2c2', '#e8dcc4', '#ead8b8', '#ffdcaa', 3.0, 1.15, 0],
    [17.6, '#4d6a98', '#f2a26e', '#a07058', '#ff9c5c', 1.6, 0.8, 0.1],
    [18.4, '#22305a', '#b0605a', '#4a3438', '#ff7a48', 0.4, 0.5, 0.5],
    [19.2, '#0a1228', '#28284a', '#14141e', '#000000', 0, 0.28, 1],
    [24, '#050a1a', '#0f1830', '#0a0d16', '#000000', 0, 0.22, 1],
  ].map(([h, top, mid, bottom, sunC, sunI, hemiI, night]) => ({
    h, top: new THREE.Color(top), mid: new THREE.Color(mid), bottom: new THREE.Color(bottom), sunC: new THREE.Color(sunC), sunI, hemiI, night,
  }));

  // Sao và trăng (chỉ hiện về đêm)
  const starGeo = new THREE.BufferGeometry();
  {
    const pts = [];
    for (let i = 0; i < 900; i++) {
      const y = rnd(0.08, 1), r = Math.sqrt(1 - y * y), a = rnd(0, Math.PI * 2);
      pts.push(Math.cos(a) * r * 230, y * 230, Math.sin(a) * r * 230);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  scene.add(stars);
  const moonTex = T.canvasTexture(256, 256, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(255,252,235,1)');
    r.addColorStop(0.17, 'rgba(250,244,220,1)');
    r.addColorStop(0.2, 'rgba(220,230,255,0.35)');
    r.addColorStop(1, 'rgba(160,180,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, w);
  });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  moon.position.set(-70, 95, 170);
  moon.scale.setScalar(55);
  scene.add(moon);
  const moonLight = new THREE.DirectionalLight(0x9fb4ff, 0);
  moonLight.position.set(-20, 30, 25);
  scene.add(moonLight);
  // đèn trong chánh điện bật sáng về đêm
  const nightLamps = [new THREE.Vector3(0, 7, -7), new THREE.Vector3(0, 7, 4)].map((p) => {
    const L = new THREE.PointLight(0xffb070, 0, 15, 2);
    L.position.copy(p);
    scene.add(L);
    return L;
  });

  const vnHour = () => ((((Date.now() / 3.6e6 + 7) % 24) + 24) % 24);
  let hourOverride = null;
  const dayCol = { top: new THREE.Color(), mid: new THREE.Color(), bottom: new THREE.Color(), sun: new THREE.Color() };
  const hemiDay = new THREE.Color(0xfff0d8), hemiNight = new THREE.Color(0x7d8cc0);
  const ridgeNight = new THREE.Color('#1c2440'), white = new THREE.Color('#ffffff');
  let night = 0;
  function applyDayTime(h) {
    let k = 0;
    while (k < DAY_KEYS.length - 2 && h >= DAY_KEYS[k + 1].h) k++;
    const a = DAY_KEYS[k], b = DAY_KEYS[k + 1];
    const t = (h - a.h) / (b.h - a.h);
    const mix = (x, y) => x + (y - x) * t;
    dayCol.top.lerpColors(a.top, b.top, t);
    dayCol.mid.lerpColors(a.mid, b.mid, t);
    dayCol.bottom.lerpColors(a.bottom, b.bottom, t);
    dayCol.sun.lerpColors(a.sunC, b.sunC, t);
    night = mix(a.night, b.night);
    sky.material.uniforms.top.value.copy(dayCol.top);
    sky.material.uniforms.mid.value.copy(dayCol.mid);
    sky.material.uniforms.bottom.value.copy(dayCol.bottom);
    scene.fog.color.copy(dayCol.mid).lerp(dayCol.bottom, 0.4);
    // mặt trời mọc ở phía đông (+x) lúc 6 giờ, lặn ở phía tây lúc 18 giờ
    const th = (Math.PI * (h - 6)) / 12;
    sun.intensity = mix(a.sunI, b.sunI);
    sun.color.copy(dayCol.sun);
    sun.position.set(focus.x + Math.cos(th) * 30, 6 + Math.max(Math.sin(th), 0.05) * 22, focus.z + 12);
    hemi.intensity = mix(a.hemiI, b.hemiI);
    hemi.color.copy(hemiDay).lerp(hemiNight, night);
    fill.intensity = 0.55 * (1 - night) + 0.08 * night;
    moonLight.intensity = 0.35 * night;
    for (const L of nightLamps) L.intensity = 60 * night;
    if (lanternMat) lanternMat.emissiveIntensity = 0.55 + 1.5 * night;
    for (const g of lanternGlows) g.material.opacity = 0.35 + 0.45 * night;
    for (const m of ridgeMats) m.color.copy(white).lerp(ridgeNight, night);
    stars.material.opacity = night;
    moon.material.opacity = night;
    stars.visible = moon.visible = night > 0.02;
    scene.environmentIntensity = 0.35 * (1 - 0.85 * night);
    renderer.toneMappingExposure = 1.05 + 0.1 * night;
    for (const f of nightHooks) f(night);
  }
  let lastDay = -99;
  updaters.push((t) => {
    if (t - lastDay < 10) return; // cập nhật mỗi 10 giây là đủ
    lastDay = t;
    applyDayTime(hourOverride ?? vnHour());
  });
  applyDayTime(vnHour());

  function setQuality(q) {
    sun.castShadow = q === 'high';
    const size = q === 'high' ? 2048 : 1024;
    sun.shadow.mapSize.set(size, size);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  setQuality(quality);

  // Gộp các vật đứng yên theo vật liệu (bỏ qua vật bấm được, vật vẽ hàng loạt)
  {
    const skip = new Set();
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

  return {
    // ẩn tượng nặng khi người chơi ở xa
    updateLOD(x, z) {
      for (const l of lods) l.obj.visible = Math.hypot(x - l.x, z - l.z) < l.r;
    },
    // ép một giờ cụ thể (để xem thử), null = theo giờ thật
    setHour(h) {
      hourOverride = h == null || Number.isNaN(h) ? null : ((h % 24) + 24) % 24;
      lastDay = -99;
    },
    get night() {
      return night;
    },
    scene,
    seats,
    pickables,
    incense,
    incenseOut,
    incenseTop,
    incenseQH,
    qaHall: { head: QH_HEAD },
    tamThe: { head: TT_HEAD },
    incenseTT,
    greatBell,
    merit,
    tower: { ...TOWER, buddha: TOP_BUDDHA },
    // khu Quan Âm: tâm bệ tượng, điểm đứng chiêm bái phía trước
    quanAm: { center: QA, front: new THREE.Vector3(6.75, 0, QA.z), head: new THREE.Vector3(QA.x, GY + 4.6, QA.z) },
    pushOut,
    // giá chổi: chỗ đứng để lấy / trả chổi
    broom: { center: BROOM, spot: new THREE.Vector3(BROOM.x, 0, BROOM.z + 1.05) },
    setQuality,
    // bóng đổ theo người chơi
    setFocus(x, z) {
      const nx = Math.round(x / 4) * 4, nz = Math.round(z / 4) * 4 - 1;
      if (nx === focus.x && nz === focus.z) return;
      sun.position.x += nx - focus.x;
      sun.position.z += nz - focus.z;
      focus.set(nx, 0, nz);
      sun.target.position.copy(focus);
    },
    showMarker(x, z, y = 0.04) {
      marker.position.set(x, y, z);
      markerStart = now;
    },
    update(t, dt) {
      for (const f of updaters) f(t, dt);
    },
  };
}
