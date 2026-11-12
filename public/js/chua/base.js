// Bộ khung dựng cảnh dùng chung cho các chùa dựng kỹ (Vĩnh Nghiêm, chùa Dơi, núi Bà Đen, Thích Ca Phật Đài…).
// Mỗi chùa gọi createKit() để có sẵn: trời, nắng, ngày đêm theo giờ Việt Nam, mặt đất bấm được để đi,
// các hàm dựng khối, mái cong, điện thờ, bậc thang, cây cối, lư hương và thùng công đức; cuối cùng gọi finish().
// (Phỏng theo không khí từng chùa, không sao chép công trình thật.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from '../textures.js';
import { curvedRoof, dragonsOnRidge, ARCH } from '../arch.js';
import { ritualKit } from '../rituals.js';

export { curvedRoof, dragonsOnRidge, ARCH, T, THREE };

// ---------- Đi lại: các hàm dựng vùng đi (dùng ở phần khai báo của từng chùa) ----------
export const rect = (minX, maxX, minZ, maxZ, extra) => ({ minX, maxX, minZ, maxZ, ...extra });

// Bậc thang theo trục z: chân ở zBottom (độ cao y0), đỉnh ở zTop (y1); x0..x1 bề ngang
export function stairY(S, x, z) {
  if (x < S.x0 || x > S.x1) return null;
  const lo = Math.min(S.zTop, S.zBottom), hi = Math.max(S.zTop, S.zBottom);
  if (z < lo || z > hi) return null;
  return S.y0 + ((S.y1 - S.y0) * (z - S.zBottom)) / (S.zTop - S.zBottom);
}

export function createKit(renderer, { quality = 'high', skyTop = '#7fb3d9', skyBottom = '#e8e4d6', fog = [150, 650], fogColor = 0xe3e3da, shadowSize = 45 } = {}) {
  const scene = new THREE.Scene();
  const pickables = [];
  const updaters = [];
  const nightHooks = [];
  const lods = [];
  const roofs = []; // vùng có mái che (cho mũi tên toàn cảnh nổi lên trên)
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
  const staticRoots = [];
  let batching = true;
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
  const group = (x = 0, y = 0, z = 0, ry = 0, { merge = true } = {}) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    scene.add(g);
    if (merge) staticRoots.push(g);
    return g;
  };
  const M = {
    stone: std('#b7b0a2', { roughness: 0.95 }),
    stoneD: std('#8f897d', { roughness: 1 }),
    white: std('#f1eee6', { roughness: 0.7 }),
    red: std('#9c2a1c', { roughness: 0.55 }),
    wall: std('#e6dcc6', { roughness: 0.9 }),
    yellowWall: std('#e9c56a', { roughness: 0.85 }),
    leaf: std('#4f7a3a', { roughness: 0.9 }),
    leafD: std('#3a6130', { roughness: 0.9 }),
    trunk: std('#5e4a38', { roughness: 0.95 }),
    wood: std('#5b3a24', { roughness: 0.7 }),
    lacquer: std('#7d2217', { roughness: 0.38 }),
    bronze: std('#6e5530', { metalness: 0.75, roughness: 0.4 }),
    lamp: std('#e9dfc6', { emissive: '#ffb860', emissiveIntensity: 0, roughness: 0.8 }),
    candle: std('#f3e8d0', { emissive: '#ffb860', emissiveIntensity: 0.6, roughness: 0.6 }),
    gold: ARCH.gold,
    glaze: ARCH.glaze,
  };

  // ---------- Trời, sương, ánh sáng ----------
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  scene.fog = new THREE.Fog(fogColor, fog[0], fog[1]);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new THREE.Color(skyTop) }, bottom: { value: new THREE.Color(skyBottom) } },
      vertexShader: 'varying vec3 vP;\nvoid main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP;\nvoid main(){ float h = clamp(normalize(vP).y * 1.6 + 0.08, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }',
    }),
  );
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xdfeaf2, 0x6b6248, 0.9);
  scene.add(hemi);
  const focus = new THREE.Vector3();
  const sun = new THREE.DirectionalLight(0xffe2b4, 3.0);
  sun.castShadow = quality === 'high';
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -shadowSize, right: shadowSize, top: shadowSize, bottom: -shadowSize, near: 1, far: 220 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // ---------- Mặt đất bấm được ----------
  const groundMat = T.groundMaterial;
  const MATS = {};
  const gm = (kind, o) => (MATS[kind + JSON.stringify(o || {})] ||= groundMat(kind, o));
  // tấm nền phẳng (x0..x1, z0..z1) ở độ cao y; kind: grass | slab | tile | dirt | brick
  function floor(x0, x1, z0, z1, y, kind = 'slab', o = { tile: 5.5, macro: 0.05 }) {
    const p = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), gm(kind, o), (x0 + x1) / 2, y + 0.015, (z0 + z1) / 2, { cast: false });
    p.rotation.x = -Math.PI / 2;
    p.userData.kind = 'ground';
    pickables.push(p);
    return p;
  }
  // khối nền (bệ đá) có mặt trên bấm được
  function terrace(x0, x1, z0, z1, yBase, yTop, { side = M.stoneD, kind = 'slab', o } = {}) {
    const h = yTop - yBase;
    if (h > 0.02) box(x1 - x0, h - 0.03, z1 - z0, side, (x0 + x1) / 2, yBase + (h - 0.03) / 2, (z0 + z1) / 2);
    return floor(x0, x1, z0, z1, yTop, kind, o);
  }
  // bậc thang: S = { x0, x1, zTop, zBottom, y0, y1 }; lan can hai bên
  function stairs(S, { mat = std('#b8b1a3', { roughness: 0.95 }), rail = M.stone, railH = 0.9 } = {}) {
    const len = Math.abs(S.zBottom - S.zTop), dir = Math.sign(S.zTop - S.zBottom), rise = S.y1 - S.y0;
    const n = Math.max(4, Math.round(Math.abs(rise) / 0.28));
    const g = new THREE.Group();
    g.userData.kind = 'ground';
    scene.add(g);
    pickables.push(g);
    const w = S.x1 - S.x0, cx = (S.x0 + S.x1) / 2, base = S.base ?? Math.min(S.y0, S.y1) - 0.5;
    for (let i = 0; i < n; i++) {
      const top = S.y0 + ((i + 1) * rise) / n, h = top - base;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, len / n + 0.02), mat);
      m.position.set(cx, base + h / 2, S.zBottom + dir * (i + 0.5) * (len / n));
      m.castShadow = m.receiveShadow = true;
      g.add(m);
    }
    if (rail) {
      const L = Math.hypot(len, rise), tilt = -dir * Math.atan2(rise, len);
      for (const x of [S.x0 - 0.2, S.x1 + 0.2]) {
        const r = box(0.4, railH, L, rail, x, (S.y0 + S.y1) / 2 + railH / 2, (S.zTop + S.zBottom) / 2);
        r.rotation.x = tilt;
      }
    }
    return g;
  }

  // ---------- Đồ trang trí ----------
  function plaque(parent, text, x, y, z, w = 4.6, h = 1.0, ry = 0, { size = 120, frame = M.gold } = {}) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    parent.add(g);
    if (parent === scene && batching) staticRoots.push(g);
    if (frame) box(w + 0.3, h + 0.25, 0.08, frame, 0, 0, 0, { parent: g, cast: false });
    mesh(new THREE.PlaneGeometry(w, h), std('#ffffff', { map: T.boardTexture(Array.isArray(text) ? text : [text], { w: 1024, h: Math.round((1024 * h) / w), size }), roughness: 0.45 }), 0, 0, 0.06, { parent: g, cast: false });
    return g;
  }
  function stoneLamp(x, y, z) {
    const g = group(x, y, z);
    box(0.6, 0.12, 0.6, M.stoneD, 0, 0.06, 0, { parent: g });
    cyl(0.1, 0.12, 0.9, M.stone, 0, 0.57, 0, { parent: g }, 8);
    box(0.55, 0.08, 0.55, M.stoneD, 0, 1.04, 0, { parent: g });
    box(0.36, 0.32, 0.36, M.lamp, 0, 1.24, 0, { parent: g });
    mesh(new THREE.ConeGeometry(0.46, 0.28, 4), M.stoneD, 0, 1.54, 0, { parent: g }).rotation.y = Math.PI / 4;
    return g;
  }
  function lampPost(x, y, z, cap = M.red) {
    cyl(0.12, 0.16, 3.4, M.stoneD, x, y + 1.7, z, {}, 8);
    box(0.6, 0.6, 0.6, M.lamp, x, y + 3.6, z);
    mesh(new THREE.ConeGeometry(0.55, 0.4, 4), cap, x, y + 4.1, z).rotation.y = Math.PI / 4;
  }
  // sư tử / nghê đá đơn giản
  function lion(x, y, z, ry = 0) {
    const g = group(x, y, z, ry);
    box(1.0, 0.7, 1.0, M.stoneD, 0, 0.35, 0, { parent: g });
    mesh(new THREE.SphereGeometry(0.48, 12, 10), M.stone, 0, 1.1, 0.05, { parent: g }).scale.set(0.9, 1.1, 1);
    mesh(new THREE.SphereGeometry(0.34, 12, 10), M.stone, 0, 1.7, 0.2, { parent: g });
    return g;
  }
  // cờ Phật giáo trên cột
  const flagTex = T.buddhistFlag();
  function flagPole(x, y, z, h = 7) {
    cyl(0.05, 0.07, h, M.stoneD, x, y + h / 2, z, {}, 8);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1, 8, 1), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.8 }));
    f.position.set(x + 0.95, y + h - 0.65, z);
    scene.add(f);
    const p = f.geometry.attributes.position, base = Float32Array.from(p.array), seed = Math.random() * 9;
    updaters.push((t) => {
      for (let i = 0; i < p.count; i++) {
        const u = (base[i * 3] + 0.9) / 1.8;
        p.setZ(i, Math.sin(t * 3 + u * 5 + seed) * 0.12 * u);
      }
      p.needsUpdate = true;
    });
  }

  // ---------- Điện thờ kiểu chùa Việt: nền đá, tường, hàng cột son, mái chồng diêm, bàn thờ, đèn ấm ----------
  // H = { x, z0 (mặt trước, +z), z1 (vách sau), hx, y, plaque, wallH }; placeStatue(y, zAltar) đặt tượng
  function hall(H, placeStatue, { twoTier = true, wallMat = M.wall, colMat = M.red, roofLift = 1.1, light = 8, roof = null, carpet = '#7a271c' } = {}) {
    const { x = 0, y } = H, front = H.z0, back = H.z1, hx = H.hx, w = hx * 2, d = front - back, cz = (front + back) / 2, wh = H.wallH ?? 6.4;
    box(w + 1.4, 0.24, d + 1.6, M.stone, x, y + 0.12, cz + 0.3);
    const fl = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: T.woodFloor(), roughness: 0.55 }), x, y + 0.25, cz, { cast: false });
    fl.rotation.x = -Math.PI / 2;
    fl.userData.kind = 'ground';
    pickables.push(fl);
    box(2.4, 0.02, d - 3.5, std(carpet, { roughness: 1 }), x, y + 0.268, cz + 1.4, { cast: false });
    box(w, wh, 0.3, wallMat, x, y + 0.25 + wh / 2, back + 0.15);
    for (const sx of [-1, 1]) {
      box(0.3, wh, d, wallMat, x + sx * (hx - 0.15), y + 0.25 + wh / 2, cz);
      for (let k = 1; k < 4; k++) box(0.08, 1.6, 1.3, std('#2c2018', { roughness: 0.8 }), x + sx * (hx - 0.32), y + 3.2, back + (d * k) / 4);
    }
    for (const cx of [-(hx - 0.5), -hx * 0.55, -3.6, 3.6, hx * 0.55, hx - 0.5]) cyl(0.32, 0.36, wh, colMat, x + cx, y + 0.25 + wh / 2, front - 0.2, {}, 14);
    box(w, 0.5, 0.4, colMat, x, y + wh + 0.05, front - 0.2);
    box(w, 0.1, d, M.wood, x, y + wh + 0.25, cz, { cast: false });
    let top;
    if (roof) top = roof({ x, y: y + wh + 0.25, cz, hx, d, front, back }); // mái riêng (vd mái nhọn chùa Khmer)
    else {
    const s1 = (d / 2 + 1.6) * 0.38;
    top = curvedRoof(scene, x, y + wh + 0.2, cz, hx + 1.6, d / 2 + 1.6, 1.3, s1, { lift: roofLift });
    if (twoTier) {
      box(w * 0.62, 1.9, d * 0.55, wallMat, x, y + wh + 2.4, cz);
      if (H.plaque) plaque(scene, H.plaque, x, y + wh + 2.4, cz + d * 0.275 + 0.03, 5.2, 1.0);
      const hx2 = w * 0.31 + 1.5, hz2 = d * 0.275 + 1.5;
      top = curvedRoof(scene, x, y + wh + 3.35, cz, hx2, hz2, 2.3, hz2 - 0.4, { lift: roofLift + 0.1 });
    } else if (H.plaque) plaque(scene, H.plaque, x, y + wh - 0.6, front + 0.05, 4.6, 0.9);
    dragonsOnRidge(scene, x, top.yTop + 0.42, cz, top.rx);
    }
    // bàn thờ
    const altarZ = back + 1.7;
    box(w * 0.6, 1.1, 2.2, M.lacquer, x, y + 0.8, altarZ);
    box(w * 0.6 + 0.2, 0.08, 2.4, M.gold, x, y + 1.39, altarZ, { cast: false });
    placeStatue?.(y + 1.43, altarZ);
    for (const cx of [-w * 0.24, w * 0.24]) {
      cyl(0.05, 0.05, 0.3, M.candle, x + cx, y + 1.58, back + 2.6, {}, 8);
      cyl(0.1, 0.12, 0.06, M.bronze, x + cx, y + 1.45, back + 2.6, {}, 10);
    }
    const L = new THREE.PointLight('#ffc27a', light, 18, 2);
    L.position.set(x, y + 4.6, cz);
    scene.add(L);
    nightHooks.push((night) => (L.intensity = light + 24 * night));
    roofs.push({ minX: x - hx - 1, maxX: x + hx + 1, minZ: back - 1, maxZ: front + 1, lift: top.yTop - y + 2 });
    return { altarZ, top };
  }

  // Lối đi trong điện (vùng đi) — dùng chung với hall(): cửa giữa + lòng điện
  // (khai báo ở phần vùng đi của từng chùa bằng hallWalk(H))

  // Tượng Phật: dát vàng mặc định; stone = tượng đá trắng
  function gild(obj, { color = '#f3c560', stone = false } = {}) {
    obj.userData.gild = { color, stone };
    const cache = new Map();
    obj.traverse((m) => {
      if (!m.isMesh) return;
      if (!cache.has(m.material)) {
        const g = m.material.clone();
        if (stone) {
          g.vertexColors = false;
          g.color = new THREE.Color(color);
          g.metalness = 0.0;
          g.roughness = 0.75;
          g.envMapIntensity = 0.6;
        } else {
          g.color = new THREE.Color(color);
          g.metalness = 0.85;
          g.roughness = 0.3;
          g.envMapIntensity = 1.6;
        }
        cache.set(m.material, g);
      }
      m.material = cache.get(m.material);
    });
    return obj;
  }

  // ---------- Cây cối ----------
  let seed = 29;
  const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // rừng cây tán tròn: spots = [[x, z, y?]]
  function forest(spots, y0 = 0, { hue = 0.25, scale = 1 } = {}) {
    if (!spots.length) return;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 7).translate(0, 1.5, 0), M.trunk, spots.length);
    const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.9, 1), std('#ffffff', { roughness: 0.9, flatShading: true }), spots.length * 2);
    const o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z, y = y0], i) => {
      const s = (0.8 + rr() * 0.7) * scale;
      o.position.set(x, y, z);
      o.rotation.set(0, rr() * 6.28, 0);
      o.scale.setScalar(s);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 2; k++) {
        o.position.set(x + (k ? 0.7 : -0.3) * s, y + (3.2 + k * 1.1) * s, z + (k ? -0.4 : 0.3) * s);
        o.scale.set(s * (k ? 0.75 : 1.05), s * (k ? 0.7 : 0.8), s * (k ? 0.75 : 1.05));
        o.updateMatrix();
        crown.setMatrixAt(i * 2 + k, o.matrix);
        crown.setColorAt(i * 2 + k, c.setHSL(hue + rr() * 0.06, 0.38 + rr() * 0.15, 0.24 + rr() * 0.1));
      }
    });
    trunk.castShadow = crown.castShadow = true;
    crown.receiveShadow = true;
    scene.add(trunk, crown);
  }
  // cây dừa / cau (miền Nam): thân cong mảnh, chùm tàu lá
  function palms(spots, y0 = 0) {
    if (!spots.length) return;
    const trunkGeo = new THREE.CylinderGeometry(0.13, 0.2, 1, 7).translate(0, 0.5, 0);
    const frondGeo = new THREE.PlaneGeometry(0.7, 3.2, 1, 4).translate(0, 1.6, 0);
    { // tàu lá rủ xuống
      const p = frondGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const v = p.getY(i) / 3.2;
        p.setZ(i, -v * v * 1.3);
        p.setX(i, p.getX(i) * (1 - v * 0.7));
      }
      frondGeo.computeVertexNormals();
    }
    const N = spots.length, F = 8;
    const trunks = new THREE.InstancedMesh(trunkGeo, std('#8a7458', { roughness: 0.95 }), N * 3);
    const fronds = new THREE.InstancedMesh(frondGeo, std('#4f8a3a', { roughness: 0.8, side: THREE.DoubleSide }), N * F);
    const o = new THREE.Object3D(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let ti = 0;
    spots.forEach(([x, z, y = y0], i) => {
      const h = 6 + rr() * 4, lean = (rr() - 0.5) * 0.25, la = rr() * 6.28;
      let px = x, py = y, pz = z;
      for (let k = 0; k < 3; k++) {
        const tilt = lean * (k + 1) * 0.6;
        o.position.set(px, py, pz);
        o.rotation.set(Math.cos(la) * tilt, 0, Math.sin(la) * tilt);
        o.scale.set(1 - k * 0.12, h / 3 + 0.05, 1 - k * 0.12);
        o.updateMatrix();
        trunks.setMatrixAt(ti++, o.matrix);
        const v = new THREE.Vector3(0, h / 3, 0).applyEuler(o.rotation);
        px += v.x;
        py += v.y;
        pz += v.z;
      }
      for (let f = 0; f < F; f++) {
        o.position.set(px, py, pz);
        e.set(1.0 + rr() * 0.4, (f / F) * Math.PI * 2 + rr() * 0.3, 0, 'YXZ');
        o.quaternion.copy(q.setFromEuler(e));
        o.scale.setScalar(0.9 + rr() * 0.3);
        o.updateMatrix();
        fronds.setMatrixAt(i * F + f, o.matrix);
      }
    });
    trunks.count = ti;
    trunks.castShadow = fronds.castShadow = true;
    scene.add(trunks, fronds);
  }
  function bamboo(groves, y0 = 0) {
    const pts = [];
    for (const [cx, cz, n = 12] of groves) for (let i = 0; i < n; i++) pts.push([cx + (rr() - 0.5) * 6, cz + (rr() - 0.5) * 6]);
    if (!pts.length) return;
    const stalks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 5).translate(0, 4.5, 0), std('#7d9a4c', { roughness: 0.6 }), pts.length);
    const leafs = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshStandardMaterial({ map: T.bambooLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), pts.length * 2);
    const o = new THREE.Object3D();
    pts.forEach(([x, z], i) => {
      const s = 0.75 + rr() * 0.45;
      o.position.set(x, y0 - 0.05, z);
      o.rotation.set((rr() - 0.5) * 0.12, 0, (rr() - 0.5) * 0.12);
      o.scale.set(1, s, 1);
      o.updateMatrix();
      stalks.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 2; k++) {
        o.position.set(x + (rr() - 0.5) * 1.6, y0 + (5.5 + rr() * 3.5) * s, z + (rr() - 0.5) * 1.6);
        o.rotation.set(rr() - 0.5, rr() * Math.PI, (rr() - 0.5) * 0.8);
        o.scale.setScalar(0.8 + rr() * 0.6);
        o.updateMatrix();
        leafs.setMatrixAt(i * 2 + k, o.matrix);
      }
    });
    stalks.castShadow = true;
    scene.add(stalks, leafs);
  }
  // rải điểm ngẫu nhiên trong hình chữ nhật, bỏ các điểm rơi vào vùng cấm
  function scatter(x0, x1, z0, z1, n, avoid = []) {
    const out = [];
    for (let i = 0, k = 0; i < n && k < n * 6; k++) {
      const x = x0 + rr() * (x1 - x0), z = z0 + rr() * (z1 - z0);
      if (avoid.some((r) => x > r.minX - 2 && x < r.maxX + 2 && z > r.minZ - 2 && z < r.maxZ + 2)) continue;
      out.push([x, z]);
      i++;
    }
    return out;
  }

  // ---------- Đồ dựng dùng chung thêm (cổng tam quan, gác chuông, mặt nước, rừng thông, bồn hoa) ----------
  // cổng tam quan ba cửa: cửa giữa hai tầng mái có biển tên, hai cửa bên; mặt trước nhìn về +z.
  // walls: chiều dài tường hai bên (0 = không tường). Cửa giữa rộng ±2.3, cửa bên ở x ±6.6..9 (xem gateWalk)
  function gate3(x, z, name, { col = M.red, wall = M.wall, walls = 0, y = 0 } = {}) {
    const g = group(x, y, z);
    box(28, 0.3, 6, M.stone, 0, 0.15, 0, { parent: g });
    const Y = 0.3;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.42, 0.48, 6.6, col, sx * 3.0, Y + 3.3, sz * 1.9, { parent: g }, 16);
    box(7.2, 0.5, 4.6, col, 0, Y + 6.85, 0, { parent: g });
    curvedRoof(g, 0, Y + 6.95, 0, 6.6, 4.2, 1.5, 2.2, { lift: 1.0 });
    box(9.0, 2.3, 3.8, M.wall, 0, Y + 9.45, 0, { parent: g });
    plaque(g, name, 0, Y + 9.45, 1.97, 4.8, 1.0);
    plaque(g, name, 0, Y + 9.45, -1.97, 4.8, 1.0, Math.PI);
    const top = curvedRoof(g, 0, Y + 10.55, 0, 5.8, 3.4, 2.4, 3.0, { lift: 1.2 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, 0, top.rx);
    for (const sx of [-1, 1]) {
      const cx = sx * 7.8;
      for (const dx of [-1.5, 1.5]) for (const sz of [-1, 1]) cyl(0.3, 0.34, 4.6, col, cx + dx, Y + 2.3, sz * 1.6, { parent: g }, 14);
      box(3.6, 0.4, 3.8, col, cx, Y + 4.75, 0, { parent: g });
      curvedRoof(g, cx, Y + 4.9, 0, 3.0, 2.8, 1.4, 2.0, { lift: 0.8 });
      box(2.6, 3.6, 0.8, M.wall, sx * 4.6, Y + 1.8, 0, { parent: g });
      box(1.6, 3.2, 0.8, M.wall, sx * 9.9, Y + 1.6, 0, { parent: g });
      if (walls > 0) {
        box(walls, 2.6, 0.6, wall, sx * (10.7 + walls / 2), 1.3, 0, { parent: g });
        box(walls + 0.3, 0.2, 1.0, std('#6a3426'), sx * (10.7 + walls / 2), 2.7, 0, { parent: g });
      }
    }
    roofs.push({ minX: x - 11, maxX: x + 11, minZ: z - 3, maxZ: z + 3, lift: 13 });
    return g;
  }
  // gác chuông: bốn cột, hai tầng mái, chuông đồng treo lắc khi thỉnh. Trả về một mục cho world.bells
  function bellPavilion(x, z, y = 0, { label = 'CHUÔNG' } = {}) {
    const g = group(x, y, z);
    box(7.4, 0.4, 7.4, M.stone, 0, 0.2, 0, { parent: g });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.26, 0.3, 5.6, M.red, sx * 2.7, 3.2, sz * 2.7, { parent: g }, 12);
    box(6.2, 0.4, 6.2, M.red, 0, 6.1, 0, { parent: g });
    curvedRoof(g, 0, 6.2, 0, 3.9, 3.9, 1.0, 2.2, { lift: 0.8 });
    box(3.6, 1.4, 3.6, M.wall, 0, 7.8, 0, { parent: g });
    const top = curvedRoof(g, 0, 8.4, 0, 3.0, 3.0, 1.6, 2.6, { lift: 0.9 });
    dragonsOnRidge(g, 0, top.yTop + 0.42, 0, 1.4);
    box(5.6, 0.25, 0.3, M.wood, 0, 5.6, 0, { parent: g });
    if (label) plaque(g, label, 0, 6.1, 3.15, 1.6, 0.36, 0, { size: 80 });
    const bg = new THREE.Group();
    bg.position.set(x, y + 5.5, z);
    scene.add(bg);
    const prof = [[0.05, 0], [0.55, -0.1], [0.75, -0.8], [0.85, -1.9], [1.05, -2.3], [1.0, -2.4], [0, -2.4]].map(([a, b]) => new THREE.Vector2(a, b));
    const bronze = std('#5f4a2a', { metalness: 0.8, roughness: 0.38 });
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), bronze);
    bell.castShadow = true;
    bg.add(bell);
    for (const yy of [-0.9, -1.6]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.04, 6, 28).rotateX(Math.PI / 2), bronze);
      ring.position.y = yy;
      bg.add(ring);
    }
    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.4, 10).rotateZ(Math.PI / 2), M.wood);
    ram.position.set(-2.2, -1.6, 0);
    bg.add(ram);
    let swing = 0;
    updaters.push((t, dt) => {
      swing = Math.max(0, swing - dt * 0.25);
      bg.rotation.z = Math.sin(t * 2.4) * 0.05 * swing;
      ram.position.x = -2.2 + (swing > 0.8 ? Math.sin(Math.min(1, (1 - swing) * 6) * Math.PI) * 1.2 : 0);
    });
    roofs.push({ minX: x - 4, maxX: x + 4, minZ: z - 4, maxZ: z + 4, lift: 12 });
    return { group: bg, x, z, spot: { x: x - 0.2, z: z + 4.4 }, swing: () => (swing = 1) };
  }
  // mặt nước (hồ, sông, biển) có gợn sóng trôi
  let waveTex = null;
  function water(x0, x1, z0, z1, y, { color = '#4b858a', repeat = 0.06 } = {}) {
    if (!waveTex) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d'), img = g.createImageData(256, 256);
      const hgt = (x, yy) => Math.sin(x * 0.098 + Math.sin(yy * 0.05) * 2) * 0.5 + Math.sin(yy * 0.123 + x * 0.031) * 0.5 + Math.sin((x + yy) * 0.21) * 0.25;
      for (let yy = 0; yy < 256; yy++) for (let x = 0; x < 256; x++) {
        const dx = hgt(x + 1, yy) - hgt(x - 1, yy), dy = hgt(x, yy + 1) - hgt(x, yy - 1), i = (yy * 256 + x) * 4;
        img.data.set([128 - dx * 60, 128 - dy * 60, 255, 255], i);
      }
      g.putImageData(img, 0, 0);
      waveTex = new THREE.CanvasTexture(c);
      waveTex.wrapS = waveTex.wrapT = THREE.RepeatWrapping;
      updaters.push((t) => waveTex.offset.set(t * 0.004, t * 0.007));
    }
    const tex = waveTex.clone();
    tex.repeat.set((x1 - x0) * repeat, (z1 - z0) * repeat);
    updaters.push(() => tex.offset.copy(waveTex.offset));
    const w = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), std(color, { roughness: 0.12, metalness: 0.15, normalMap: tex, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.4 }), (x0 + x1) / 2, y, (z0 + z1) / 2, { cast: false });
    w.rotation.x = -Math.PI / 2;
    return w;
  }
  // rừng thông: thân thẳng, tán hình nón ba tầng
  function pines(spots, y0 = 0, { scale = 1 } = {}) {
    if (!spots.length) return;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.28, 1, 7).translate(0, 0.5, 0), std('#6b4f3a', { roughness: 0.95 }), spots.length);
    const cone = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0), std('#ffffff', { roughness: 0.9, flatShading: true }), spots.length * 3);
    const o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z, y = y0], i) => {
      const h = (9 + rr() * 6) * scale;
      o.position.set(x, y, z);
      o.rotation.set(0, rr() * 6, 0);
      o.scale.set(1, h * 0.7, 1);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 3; k++) {
        const r = (2.2 - k * 0.6) * scale;
        o.position.set(x, y + h * (0.35 + k * 0.2), z);
        o.scale.set(r, h * 0.42, r);
        o.updateMatrix();
        cone.setMatrixAt(i * 3 + k, o.matrix);
        cone.setColorAt(i * 3 + k, c.setHSL(0.3 + rr() * 0.05, 0.35, 0.18 + rr() * 0.06));
      }
    });
    trunk.castShadow = cone.castShadow = true;
    scene.add(trunk, cone);
  }
  // bồn hoa nhiều màu (cẩm tú cầu, hoa Đà Lạt…): spots = [[x, z, y?]]
  function flowers(spots, y0 = 0, colors = ['#7a8fe0', '#e08ab8', '#f2d24a', '#f07a5a', '#ffffff', '#b07ae0']) {
    if (!spots.length) return;
    const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), std('#3f6e34', { flatShading: true }), spots.length);
    const blooms = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 0), std('#ffffff', { roughness: 0.7 }), spots.length * 6);
    const o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z, y = y0], i) => {
      o.position.set(x, y + 0.3, z);
      o.rotation.set(0, 0, 0);
      o.scale.set(1.1, 0.7, 1.1);
      o.updateMatrix();
      bush.setMatrixAt(i, o.matrix);
      const col = colors[Math.floor(rr() * colors.length)];
      for (let k = 0; k < 6; k++) {
        const a = rr() * 6.28, r = rr() * 0.45;
        o.position.set(x + Math.cos(a) * r, y + 0.55 + rr() * 0.15, z + Math.sin(a) * r);
        o.scale.setScalar(0.8 + rr() * 0.6);
        o.updateMatrix();
        blooms.setMatrixAt(i * 6 + k, o.matrix);
        blooms.setColorAt(i * 6 + k, c.set(col));
      }
    });
    scene.add(bush, blooms);
  }

  // ---------- Hoàn tất: gộp vật đứng yên, ngày đêm, lư hương và thùng công đức ----------
  function finish({ rituals = [], skip = [] } = {}) {
    batching = false;
    // ngày và đêm theo giờ Việt Nam
    const dayTop = new THREE.Color(skyTop), nightTop = new THREE.Color('#0b1424');
    const dayBot = new THREE.Color(skyBottom), nightBot = new THREE.Color('#1b2233');
    const tmp = new THREE.Color();
    let hourOverride = null, night = 0, lastSet = -99;
    const sunDir = new THREE.Vector3(40, 60, 25);
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
      M.lamp.emissiveIntensity = 2.2 * night;
      for (const f of nightHooks) f(night);
    }
    applyHour(vnHour());
    updaters.push((t) => {
      if (t - lastSet < 10) return;
      lastSet = t;
      applyHour(hourOverride ?? vnHour());
    });
    // gộp các vật đứng yên theo vật liệu (bỏ qua vật bấm được)
    {
      const no = new Set(skip);
      for (const p of pickables) p.traverse((x) => no.add(x));
      const groups = new Map();
      for (const root of staticRoots) {
        if (no.has(root) || !root.parent) continue;
        root.updateMatrixWorld(true);
        const list = [];
        root.traverse((m) => m.isMesh && !m.isInstancedMesh && !no.has(m) && !Array.isArray(m.material) && list.push(m));
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
    // lư hương và thùng công đức: R = { place, y, burner:{x,z}, merit:{x,z}, face:{x,y,z}, stone? }
    const kit = ritualKit({ scene, updaters, pickables });
    const burners = {};
    const merits = [];
    for (const R of rituals) {
      const { x: bx, z: bz } = R.burner, { x: mx, z: mz } = R.merit;
      burners[R.place] = kit.incenseStand({
        x: bx, y: R.y, z: bz, kind: R.stone ? 'stone' : 'stand',
        spots: [-1, 0, 1].map((dx) => ({ x: bx + dx, z: bz + 1.25 })),
        target: new THREE.Vector3(R.face.x, R.face.y, R.face.z),
      });
      const mb = kit.meritBox({ x: mx, y: R.my ?? R.y, z: mz, spots: [-0.45, 0, 0.45].map((dx) => ({ x: mx + dx, z: mz + 0.85 })) });
      mb.place = R.place;
      merits.push(mb);
    }
    return {
      scene,
      pickables,
      burners,
      merits,
      roofs,
      updateLOD(x, z) {
        for (const l of lods) l.obj.visible = Math.hypot(x - (l.x ?? 0), z - l.z) < (l.r ?? 70);
      },
      get night() {
        return night;
      },
      setHour(h) {
        hourOverride = h == null || Number.isNaN(h) ? null : ((h % 24) + 24) % 24;
        lastSet = -99;
      },
      setFocus(x, z, y = 0) {
        focus.set(Math.round(x / 4) * 4, y, Math.round(z / 4) * 4);
        sun.position.copy(focus).add(sunDir);
        sun.target.position.copy(focus);
      },
      update(t, dt) {
        for (const f of updaters) f(t, dt);
      },
    };
  }

  return {
    scene, pickables, updaters, nightHooks, lods, roofs, std, M, mesh, box, cyl, group, floor, terrace, stairs,
    plaque, stoneLamp, lampPost, lion, flagPole, hall, gild, forest, palms, bamboo, scatter, rr, finish,
    gate3, bellPavilion, water, pines, flowers,
    stopBatching: () => (batching = false),
    startBatching: () => (batching = true),
    staticRoots,
  };
}

// Vùng đi bên trong một điện dựng bằng hall(): cửa giữa và lòng điện (bàn thờ ở phía sau)
export function hallWalk(H) {
  const x = H.x ?? 0;
  return [
    { minX: x - 3.4, maxX: x + 3.4, minZ: H.z0 - 1.0, maxZ: H.z0 + 1.0 },
    { minX: x - H.hx + 1, maxX: x + H.hx - 1, minZ: H.z1 + 3.0, maxZ: H.z0 - 0.6 },
  ];
}
// vùng đi qua ba cửa của cổng gate3 đặt ở (x, z)
export function gateWalk(x, z) {
  return [rect(x - 2.3, x + 2.3, z - 4.5, z + 4.5), rect(x + 6.6, x + 9.0, z - 4.5, z + 4.5), rect(x - 9.0, x - 6.6, z - 4.5, z + 4.5)];
}
// độ cao sàn trong điện
export const inHall = (H, x, z) => Math.abs(x - (H.x ?? 0)) < H.hx + 0.7 && z < H.z0 + 1.1 && z > H.z1 - 0.5;

// Đồi / núi tiện tròn: profile = [[bán kính, độ cao]…] từ tâm ra ngoài. Trả về hàm độ cao mặt đồi tại (x, z).
export function profileY(profile, r) {
  for (let i = 1; i < profile.length; i++) {
    if (r <= profile[i][0]) {
      const [r0, y0] = profile[i - 1], [r1, y1] = profile[i];
      return y0 + ((y1 - y0) * (r - r0)) / (r1 - r0);
    }
  }
  return profile[profile.length - 1][1];
}
// clip = { x0, x1, z0, z1, floor(x, z) }: trong khuôn viên chùa (hình chữ nhật này), mặt đồi luôn thấp hơn
// mặt sân / nền / bậc thang ít nhất 1,5 m — đồi không bao giờ trồi lên phủ lối đi.
export function makeHill(K, cx, cz, profile, { color = '#56713e', seg = 144, bumps = 1.2, clip = null } = {}) {
  const top = profile[0][1], rMax = profile[profile.length - 1][0];
  // chia dày các vòng (mỗi 3 m) để phần bị hạ thấp trong khuôn viên không bị tam giác lớn kéo trồi lên
  const pts = [];
  for (let r = rMax; r > 0; r -= 3) pts.push(new THREE.Vector2(r, profileY(profile, r)));
  pts.push(new THREE.Vector2(0.01, top));
  const geo = new THREE.LatheGeometry(pts, seg);
  const p = geo.attributes.position;
  const bump = (y, a) => (y > 0 && y < top - 0.1 ? (Math.sin(a * 9) * 1.0 + Math.sin(a * 17) * 0.5) * bumps : 0);
  const yAt = (x, z) => {
    const a = Math.atan2(z - cz, x - cx);
    let y = profileY(profile, Math.hypot(x - cx, z - cz));
    y += bump(y, a);
    if (clip && x > clip.x0 && x < clip.x1 && z > clip.z0 && z < clip.z1) {
      // lấy mặt đất thấp nhất quanh điểm (±7 m) vì các ô của đồi thưa: mép nền cao không kéo đồi trồi lên lối đi bên cạnh
      let f = Infinity;
      for (const dx of [-7, 0, 7]) for (const dz of [-7, 0, 7]) f = Math.min(f, clip.floor(x + dx, z + dz));
      y = Math.min(y, f - 1.5);
    }
    return y;
  };
  for (let i = 0; i < p.count; i++) p.setY(i, yAt(p.getX(i) + cx, p.getZ(i) + cz));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, K.std(color, { roughness: 0.95, flatShading: true }));
  m.position.set(cx, 0, cz);
  m.receiveShadow = true;
  K.scene.add(m);
  return yAt; // độ cao mặt đồi (đã hạ trong khuôn viên) — dùng để trồng cây cho đúng mặt đất
}

// Cabin cáp treo dùng chung (Trúc Lâm, Bà Đen…): khung đỏ, kính trong để thấy người ngồi bên trong, ghế băng,
// thanh treo lên dây. Gốc toạ độ cabin là điểm bám trên dây cáp; sàn thấp hơn dây HANG m.
// makeCabin(true) = cabin chở người (main.js gắn vào cảnh khi đi, gỡ ra khi tới ga); riderCabs: các cabin đó,
// để cabin chạy sẵn trên dây tự ẩn khi trùng chỗ.
export function cableCabins(K) {
  const HANG = 3.0;
  const frameM = K.std('#d6402c', { roughness: 0.45 });
  const glassM = new THREE.MeshStandardMaterial({ color: '#bfe3f2', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const benchM = K.std('#5b3a24');
  const rodM = K.std('#444');
  const riderCabs = [];
  function makeCabin(forRider = true) {
    const g = new THREE.Group();
    if (forRider) {
      for (let i = riderCabs.length - 1; i >= 0; i--) if (!riderCabs[i].parent) riderCabs.splice(i, 1);
      riderCabs.push(g);
    }
    const add = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = mat !== glassM;
      g.add(m);
      return m;
    };
    add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), rodM, 0, -0.5, 0);
    add(new THREE.BoxGeometry(0.5, 0.3, 0.9), rodM, 0, 0.05, 0);
    add(new THREE.BoxGeometry(2.3, 0.14, 2.3), frameM, 0, -HANG, 0); // sàn
    add(new THREE.BoxGeometry(2.4, 0.16, 2.4), frameM, 0, -1.0, 0); // mái
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.1, 2.0, 0.1), frameM, sx * 1.12, -2.0, sz * 1.12);
    add(new THREE.BoxGeometry(2.2, 0.55, 0.06), frameM, 0, -2.72, 1.13); // tấm che chân
    add(new THREE.BoxGeometry(2.2, 0.55, 0.06), frameM, 0, -2.72, -1.13);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.06, 0.55, 2.2), frameM, sx * 1.13, -2.72, 0);
    add(new THREE.BoxGeometry(2.2, 1.35, 0.03), glassM, 0, -1.78, 1.13); // kính
    add(new THREE.BoxGeometry(2.2, 1.35, 0.03), glassM, 0, -1.78, -1.13);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.03, 1.35, 2.2), glassM, sx * 1.13, -1.78, 0);
    add(new THREE.BoxGeometry(1.9, 0.12, 0.5), benchM, 0, -2.5, -0.8); // ghế băng sau lưng
    return g;
  }
  return { HANG, makeCabin, riderCabs };
}
