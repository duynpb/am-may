// Đồ thờ dùng chung cho các khu (hiện dùng ở khu Tam Chúc): lư hương có nhang cháy và khói, thùng công đức.
// Cùng cách làm với lư hương, thùng công đức trong chánh điện Am Mây (world.js).
import * as THREE from 'three';
import * as T from './textures.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

// scene: cảnh; updaters: danh sách hàm (t, dt) chạy mỗi khung hình
export function ritualKit({ scene, updaters, pickables }) {
  const glowTex = T.glow();
  const smokeTex = T.smoke();
  const bronze = std('#6e5530', { metalness: 0.75, roughness: 0.4 });
  const stoneM = std('#a9a49a', { roughness: 0.95 });
  const lacquer = std('#7d2217', { roughness: 0.38 });
  const darkWood = std('#2e1c12', { roughness: 0.75 });
  const gold = std('#d9a93e', { metalness: 0.85, roughness: 0.3 });

  // Lư nhang: nhang cắm vào cháy ngắn dần, hết thì tàn; luôn giữ ít nhất `min` nén
  const STEM = 0.14, BODY = 0.42, MAX_STICKS = 30;
  const stemGeo = new THREE.CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0);
  const stemMat = std('#b8322a', { roughness: 0.6 });
  const bodyMat = std('#7a4a2c', { roughness: 0.9 });
  const emberGeo = new THREE.SphereGeometry(0.014, 8, 6);
  const emberMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a' });

  // center: mặt cát trong lư; spots: chỗ đứng để thắp; target: điểm người thắp hướng mặt vào khi vái
  function makeBurner({ center, radius = 0.21, spots, target, smoke = 36, min = 3 }) {
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

  // Lư hương đồng ba chân trên kệ (trong điện) hoặc trên bệ đá (ngoài sân), mặt người thắp quay về -z.
  // x, y, z: chân kệ; kind: 'stand' kệ sơn son, 'stone' bệ đá; spots: chỗ đứng; target: nơi hướng mặt khi vái
  function incenseStand({ x, y, z, kind = 'stand', spots, target }) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    scene.add(g);
    const H = kind === 'stone' ? 0.95 : 0.8;
    const add = (geo, mat, px, py, pz) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      return m;
    };
    if (kind === 'stone') {
      add(new THREE.CylinderGeometry(0.55, 0.65, 0.2, 16), stoneM, 0, 0.1, 0);
      add(new THREE.CylinderGeometry(0.32, 0.42, H - 0.3, 12), stoneM, 0, 0.2 + (H - 0.3) / 2, 0);
      add(new THREE.CylinderGeometry(0.5, 0.45, 0.1, 16), stoneM, 0, H - 0.05, 0);
    } else {
      add(new THREE.BoxGeometry(1.0, H, 0.66), lacquer, 0, H / 2, 0);
      add(new THREE.BoxGeometry(1.06, 0.05, 0.72), gold, 0, H + 0.02, 0);
    }
    // thân lư hương tròn, miệng loe, hai quai, ba chân
    const prof = [[0, 0], [0.26, 0], [0.33, 0.08], [0.36, 0.22], [0.3, 0.32], [0.34, 0.36], [0.3, 0.36]].map(([a, b]) => new THREE.Vector2(a, b));
    const bowl = add(new THREE.LatheGeometry(prof, 24), bronze, 0, H + 0.1, 0);
    bowl.material.side = THREE.DoubleSide;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      add(new THREE.CylinderGeometry(0.03, 0.02, 0.1, 6), bronze, Math.cos(a) * 0.22, H + 0.07, Math.sin(a) * 0.22);
    }
    for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.07, 0.018, 6, 12), bronze, s * 0.36, H + 0.36, 0).rotation.y = Math.PI / 2;
    // cát trong lư
    add(new THREE.CircleGeometry(0.29, 20).rotateX(-Math.PI / 2), std('#8f8778', { roughness: 1 }), 0, H + 0.43, 0);
    return makeBurner({ center: new THREE.Vector3(x, y + H + 0.43, z), spots, target });
  }

  // Thùng công đức sơn son thếp vàng; mặt có chữ quay về +z. spots: chỗ đứng góp
  function meritBox({ x, y, z, spots }) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    scene.add(g);
    const add = (geo, mat, px, py, pz, cast = true) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      m.castShadow = cast;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    add(new THREE.BoxGeometry(1.0, 0.18, 0.7), darkWood, 0, 0.09, 0);
    add(new THREE.BoxGeometry(0.9, 0.8, 0.6), lacquer, 0, 0.58, 0);
    add(new THREE.BoxGeometry(0.96, 0.06, 0.66), gold, 0, 1.0, 0, false);
    add(new THREE.BoxGeometry(0.96, 0.05, 0.66), gold, 0, 0.2, 0, false);
    add(new THREE.BoxGeometry(0.36, 0.015, 0.06), new THREE.MeshStandardMaterial({ color: '#120806' }), 0, 1.035, 0.02, false);
    const front = add(new THREE.PlaneGeometry(0.78, 0.5), std('#ffffff', { map: T.boardTexture(['CÔNG ĐỨC'], { w: 640, h: 400, size: 104 }), roughness: 0.45 }), 0, 0.6, 0.302, false);
    front.userData.kind = 'merit';
    g.userData.kind = 'merit';
    pickables?.push(g);
    const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glowS.position.set(0, 1.1, 0);
    glowS.scale.setScalar(1.6);
    g.add(glowS);
    const slot = new THREE.Vector3(x, y + 1.05, z + 0.02);
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
      spots,
      center: new THREE.Vector3(x, y, z),
      group: g,
      drop(from) {
        const m = new THREE.Mesh(envGeo, envMat);
        m.position.copy(from);
        scene.add(m);
        flying.push({ m, from: from.clone(), t: 0, spin: rnd(-1, 1) });
      },
    };
  }

  return { makeBurner, incenseStand, meritBox };
}
