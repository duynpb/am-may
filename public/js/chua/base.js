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
// độ cao sàn trong điện
export const inHall = (H, x, z) => Math.abs(x - (H.x ?? 0)) < H.hx + 0.7 && z < H.z0 + 1.1 && z > H.z1 - 0.5;
