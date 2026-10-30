// Dựng chánh điện: sàn, cột, mái, tượng Phật, bàn thờ, chuông trống, cảnh bên ngoài.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as T from './textures.js';

// Vùng được đi lại bên trong chánh điện
export const HALL = { minX: -13.2, maxX: 13.2, minZ: -12.8, maxZ: 17.6 };
export const BUDDHA = new THREE.Vector3(0, 4.6, -18.8);
export const ENTRANCE = new THREE.Vector3(0, 0, 17);
// Thềm đá trước chánh điện (z 19 → 21.6), bậc xuống sân (thấp hơn 0.36)
export const PORCH = { z0: 19, z1: 21.6, courtY: -0.36 };
export const COURTYARD = new THREE.Vector3(0, PORCH.courtY, 31);
export function groundY(x, z) {
  if (z <= PORCH.z1 - 0.05) return 0;
  if (z >= PORCH.z1 + 0.6) return PORCH.courtY;
  return (PORCH.courtY * (z - PORCH.z1 + 0.05)) / 0.65;
}

const SEAT_X = [-10, -7.5, -5, -2.5, 2.5, 5, 7.5, 10];
const SEAT_Z = [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5];

const rnd = (a, b) => a + Math.random() * (b - a);

export function buildWorld(renderer, { quality = 'high' } = {}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe4d9c6, 50, 170);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const updaters = [];
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

  function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, parent = scene } = {}) {
    const m = new THREE.Mesh(geo, mat);
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
  const court = mesh(new THREE.PlaneGeometry(34, 18), std('#978e7e', { roughness: 1 }), 0, PORCH.courtY + 0.005, 30.5, { cast: false });
  court.rotation.x = -Math.PI / 2;
  // lối đi lát gạch giữa sân
  const path = mesh(new THREE.PlaneGeometry(3, 17), std('#a0533a', { roughness: 0.95 }), 0, PORCH.courtY + 0.01, 30.6, { cast: false });
  path.rotation.x = -Math.PI / 2;

  const ridgeColors = ['#8fa3a6', '#a8b8b6', '#c2cbc4'];
  ridgeColors.forEach((c, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: T.ridge(c, i * 1.7 + 1), transparent: true, depthWrite: false });
    const d = 60 + i * 28;
    for (const [x, z, ry] of [[d, 0, -Math.PI / 2], [-d, 0, Math.PI / 2], [0, d + 10, Math.PI]]) {
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
      spots.push([side * rnd(16.6, 30), rnd(-26, 28)]);
    }
    for (let i = 0; i < 24; i++) spots.push([(Math.random() < 0.5 ? -1 : 1) * rnd(8, 28), rnd(34, 44)]);
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

  // ---------- Kiến trúc chánh điện ----------
  const floorTex = T.woodFloor();
  const floor = mesh(new THREE.PlaneGeometry(30, 40), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, 0, -1, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  floor.userData.kind = 'floor';
  pickables.push(floor);

  // Thảm đỏ lối đi giữa
  box(2.2, 0.02, 30.5, std('#7a271c', { roughness: 1 }), 0, 0.01, 2.4, { cast: false });

  const wall = mesh(new THREE.PlaneGeometry(30, 10.2), std('#ffffff', { map: T.lacquerWall(), roughness: 0.5 }), 0, 5.1, -21, { cast: false });

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
    box(30.6, 0.42, depth, porchMat, 0, -0.21, PORCH.z0 + depth / 2, { cast: false });
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

  const buddha = makeBuddha(M);
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
  // Nhang cắm trong lư: cháy ngắn dần, hết thì tàn. Luôn giữ ít nhất 3 nén.
  const BURNER = new THREE.Vector3(0, TY + 0.39, -14.7);
  const STEM = 0.14, BODY = 0.42, MAX_STICKS = 30;
  const stemGeo = new THREE.CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0);
  const stemMat = std('#b8322a', { roughness: 0.6 });
  const bodyMat = std('#7a4a2c', { roughness: 0.9 });
  const emberGeo = new THREE.SphereGeometry(0.014, 8, 6);
  const emberMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a' });
  const sticks = [];
  const v = new THREE.Vector3();

  function addStick({ age = 0, life = rnd(170, 200), mine = false, spread = 1 } = {}) {
    if (sticks.length >= MAX_STICKS) sticks[0].age = Math.max(sticks[0].age, sticks[0].life - 2);
    const g = new THREE.Group();
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.21 * spread;
    g.position.set(BURNER.x + Math.cos(a) * r, BURNER.y, BURNER.z + Math.sin(a) * r);
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
    const s = { g, body, ember, glowS, age, life, seed: Math.random() * 9, mine };
    sticks.push(s);
    return s;
  }
  for (let i = 0; i < 3; i++) addStick({ age: rnd(20, 140) });

  const smokeParts = [];
  for (let i = 0; i < 48; i++) {
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
      const pulse = 0.8 + Math.sin(t * 3 + s.seed) * 0.2;
      s.glowS.scale.setScalar(0.08 * pulse);
    }
    if (sticks.length < 3) addStick();
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
  const incense = {
    // cắm n nén vào lư hương (gom gần nhau như một bó)
    add(n = 1, { mine = false } = {}) {
      for (let i = 0; i < n; i++) addStick({ mine, spread: 1 });
    },
    get count() {
      return sticks.length;
    },
    // điểm đứng trước bàn thờ để thắp nhang
    spots: [-1.6, -0.8, 0, 0.8, 1.6].map((x) => ({ x, z: -12.75 })),
  };

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

  // ---------- Đèn lồng ----------
  {
    const red = std('#c4301e', { emissive: '#ff4a20', emissiveIntensity: 0.55, roughness: 0.6 });
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
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x5a3a26, 1.25));
  const fill = new THREE.DirectionalLight(0xfff2e0, 0.55);
  fill.position.set(-4, 9, 30);
  scene.add(fill);
  const sun = new THREE.DirectionalLight(0xffdfac, 3.4);
  sun.position.set(32, 17, 8);
  sun.target.position.set(0, 0, -1);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const spot = new THREE.SpotLight(0xffd9a0, 160, 30, 0.42, 0.6, 2);
  spot.position.set(0, 9.2, -9);
  spot.target.position.copy(BUDDHA);
  scene.add(spot, spot.target);

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

  function setQuality(q) {
    const size = q === 'high' ? 2048 : 1024;
    sun.shadow.mapSize.set(size, size);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  setQuality(quality);

  return {
    scene,
    seats,
    pickables,
    incense,
    setQuality,
    showMarker(x, z, y = 0.04) {
      marker.position.set(x, y, z);
      markerStart = now;
    },
    update(t, dt) {
      for (const f of updaters) f(t, dt);
    },
  };
}

// Tượng Phật A Di Đà ngồi trên tòa sen — dựng từ khối cơ bản
function makeBuddha(M) {
  const g = new THREE.Group();
  const gold = M.gold;
  const goldDeep = new THREE.MeshStandardMaterial({ color: '#b07a32', metalness: 0.9, roughness: 0.35 });
  const petalMat = new THREE.MeshStandardMaterial({ color: '#d6976a', metalness: 0.55, roughness: 0.35 });
  const add = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const sphere = new THREE.SphereGeometry(1, 40, 28);

  // Tòa sen
  add(new THREE.CylinderGeometry(1.15, 1.3, 0.25, 40), goldDeep, 0, 0.125, 0);
  for (const [n, r, y, tilt, s, off] of [[16, 1.05, 0.42, 0.45, 1, 0], [14, 0.86, 0.58, 0.28, 0.85, 0.22]]) {
    for (let i = 0; i < n; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / n) * Math.PI * 2 + off;
      const petal = new THREE.Mesh(sphere, petalMat);
      petal.scale.set(0.3 * s, 0.42 * s, 0.12 * s);
      petal.position.set(0, y, r);
      petal.rotation.x = tilt;
      petal.castShadow = true;
      p.add(petal);
      g.add(p);
    }
  }
  add(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 40), goldDeep, 0, 0.66, 0);

  // Thân
  add(sphere, gold, 0, 0.92, 0.12, 1.08, 0.32, 0.72); // chân xếp bằng
  add(sphere, gold, 0, 1.55, 0, 0.62, 0.86, 0.46); // thân
  add(sphere, gold, 0, 1.92, -0.02, 0.7, 0.32, 0.46); // vai
  // Tay
  const limb = (a, b, r) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const m = add(new THREE.CapsuleGeometry(r, len, 6, 14), gold, 0, 0, 0);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  };
  for (const s of [-1, 1]) {
    limb([s * 0.6, 1.92, 0], [s * 0.68, 1.3, 0.1], 0.15);
    limb([s * 0.68, 1.3, 0.1], [s * 0.22, 1.02, 0.42], 0.12);
  }
  add(sphere, gold, 0, 1.03, 0.44, 0.34, 0.1, 0.2); // bàn tay ấn thiền
  // Đầu
  add(new THREE.CylinderGeometry(0.17, 0.2, 0.25, 20), gold, 0, 2.28, 0);
  add(sphere, gold, 0, 2.62, 0, 0.4, 0.46, 0.39);
  for (const s of [-1, 1]) add(sphere, gold, s * 0.39, 2.5, -0.02, 0.07, 0.24, 0.12); // tai dài
  const dark = new THREE.MeshStandardMaterial({ color: '#4a3014', metalness: 0.5, roughness: 0.5 });
  for (const s of [-1, 1]) add(sphere, dark, s * 0.14, 2.6, 0.36, 0.075, 0.012, 0.02); // mắt nhìn xuống
  add(sphere, gold, 0, 2.53, 0.38, 0.045, 0.08, 0.05); // mũi
  add(sphere, new THREE.MeshStandardMaterial({ color: '#a0442c', roughness: 0.5 }), 0, 2.42, 0.35, 0.07, 0.015, 0.02);
  add(sphere, dark, 0, 2.76, 0.38, 0.02, 0.02, 0.02); // bạch hào
  // Tóc xoắn ốc (instancing)
  {
    const pts = [];
    const n = 220;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
      if (v.y > 0.12 || (v.z < -0.1 && v.y > -0.25)) pts.push(v);
    }
    const curls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), goldDeep, pts.length);
    const o = new THREE.Object3D();
    pts.forEach((v, i) => {
      o.position.set(v.x * 0.405, 2.62 + v.y * 0.465, v.z * 0.395);
      o.updateMatrix();
      curls.setMatrixAt(i, o.matrix);
    });
    g.add(curls);
  }
  add(sphere, goldDeep, 0, 3.08, -0.02, 0.2, 0.17, 0.2); // nhục kế

  // Hào quang
  const aur = T.aureole();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false }));
  halo.position.set(0, 2.68, -0.46);
  g.add(halo);
  const body = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.9), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false, opacity: 0.85 }));
  body.position.set(0, 1.85, -0.62);
  g.add(body);
  return g;
}
