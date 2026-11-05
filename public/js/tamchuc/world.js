// Khu Tam Chúc: hồ nước lớn giữa núi đá vôi, đảo đá nhô lên mặt hồ, bờ kè có lan can,
// cổng Tam Quan sát mép hồ mở ra một sân lớn. (Phỏng theo không khí, không sao chép công trình thật.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as T from '../textures.js';
import { curvedRoof, dragonsOnRidge, karstGeometry, karstMaterial, ARCH } from '../arch.js';

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
export const ROUND_OBSTACLES = [{ x: CAULDRON.x, z: CAULDRON.z, r: CAULDRON.r + 0.8 }];
export const SPAWN = { x: 0, z: 47, ry: Math.PI };

export function groundY(x, z) {
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
  const mesh = (geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, parent = scene } = {}) => {
    const m = new THREE.Mesh(geo, mat);
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

  // ---------- Mặt đất, bờ kè, mặt hồ ----------
  {
    const grass = std('#8b9670', { roughness: 1 });
    // khối đất bên bờ: mặt trên là cỏ, mặt trông ra hồ là kè đá
    const land = mesh(new THREE.BoxGeometry(900, 3, 700), [stoneD, stoneD, grass, stoneD, stoneD, stoneD], 0, LAND - 1.5, SHORE - 350, { cast: false });
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
    const prom = mesh(new THREE.PlaneGeometry(140, 13), std('#b9b0a0', { roughness: 1 }), 0, LAND + 0.01, 45.8, { cast: false });
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
    // bậc đá xuống mặt nước (bến thuyền sẽ làm ở đợt sau)
    for (let i = 0; i < 4; i++) box(5, 0.2, 0.6, stone, 0, LAND - 0.2 - i * 0.2, SHORE + 0.3 + i * 0.6);
    // đèn đá dọc bờ hồ
    for (let x = -60; x <= 60; x += 12) {
      if (Math.abs(x) < 6) continue;
      const lg = new THREE.Group();
      lg.position.set(x, LAND, 40.6);
      scene.add(lg);
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
    for (const p of [[0, -150, 60, 95], [-85, -125, 40, 70], [85, -130, 44, 76], [-160, -90, 50, 80], [160, -95, 52, 84], [-240, -20, 60, 90], [240, -10, 60, 92]]) peaks.push([...p, LAND - 3]);
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

  // ---------- Cổng Tam Quan sát hồ: cửa giữa hai tầng mái, hai cửa bên, tường bao ----------
  {
    const g = new THREE.Group();
    scene.add(g);
    const Z = GATE.z, Y = LAND + GATE.plinth;
    box(34, GATE.plinth, 7, stone, 0, LAND + GATE.plinth / 2, Z, { parent: g });
    // cửa giữa: bốn cột lớn, mái dưới, thân gác có biển tên, mái trên với lưỡng long chầu nguyệt
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.42, 0.48, 6.6, red, sx * 3.1, Y + 3.3, Z + sz * 1.9, { parent: g }, 16);
    box(7.4, 0.5, 4.6, red, 0, Y + 6.8, Z, { parent: g });
    curvedRoof(g, 0, Y + 6.9, Z, 6.6, 4.2, 1.5, 2.2, { lift: 1.0 });
    box(9.4, 2.2, 3.8, wallM, 0, Y + 9.4, Z, { parent: g });
    const plaque = (z, rot) => {
      box(5.0, 1.25, 0.08, ARCH.gold, 0, Y + 9.45, z, { parent: g, cast: false });
      const p = mesh(new THREE.PlaneGeometry(4.7, 1.0), std('#ffffff', { map: T.boardTexture(['TAM CHÚC'], { w: 1024, h: 220, size: 130 }), roughness: 0.45 }), 0, Y + 9.45, z, { parent: g, cast: false });
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

  // ---------- Sân lớn sau cổng: lát đá ô vuông, đỉnh đồng giữa sân, đèn và cây ----------
  {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g2 = c.getContext('2d');
    g2.fillStyle = '#bdb4a3';
    g2.fillRect(0, 0, 128, 128);
    g2.strokeStyle = 'rgba(80,70,55,0.35)';
    g2.lineWidth = 3;
    g2.strokeRect(1, 1, 126, 126);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set((PLAZA.maxX - PLAZA.minX) / 2.4, (PLAZA.maxZ - PLAZA.minZ) / 2.4);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plaza = mesh(new THREE.PlaneGeometry(PLAZA.maxX - PLAZA.minX, PLAZA.maxZ - PLAZA.minZ), std('#ffffff', { map: tex, roughness: 1 }), 0, LAND + 0.012, (PLAZA.minZ + PLAZA.maxZ) / 2, { cast: false });
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
    // bậc đá cuối sân, dẫn lên sườn núi (các điện sẽ dựng ở đợt sau)
    for (let i = 0; i < 6; i++) box(16, 0.25 * (i + 1), 0.8, stone, 0, LAND + 0.125 * (i + 1), PLAZA.minZ - 0.4 - i * 0.8);
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

  return {
    scene,
    pickables,
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
