// Chó nhỏ của nhà chùa (các sư thầy, chú tiểu nuôi): dáng chibi, đi lang thang, ngồi nghỉ, vẫy đuôi.
import * as THREE from 'three';

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const dampAngle = (a, b, k, dt) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * (1 - Math.exp(-k * dt));
};
const mats = new Map();
const mat = (c, r = 0.8) => {
  const k = c + r;
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: r }));
  return mats.get(k);
};

// coat: [màu lông chính, màu bụng/mõm, màu tai]; ears: 'up' (tai dựng) | 'down' (tai cụp)
export class Dog {
  constructor({ name, owner, coat = ['#c99a52', '#f1dcb4', '#a8743a'], ears = 'down', size = 1 }) {
    this.name = name;
    this.owner = owner;
    this.pos = new THREE.Vector3();
    this.ry = 0;
    this.faceRy = null;
    this.goal = null;
    this.onArrive = null;
    this.speed = 1.7;
    this.sitting = false;
    this.happy = 0; // còn bao nhiêu giây vẫy đuôi mừng
    this.phase = Math.random() * 6;
    this.p = { walk: 0, sit: 0, hop: 0 };
    this.root = new THREE.Group();
    this.root.scale.setScalar(size);
    this.build(coat, ears);
  }

  build([fur, belly, ear], ears) {
    const F = mat(fur), B = mat(belly), E = mat(ear), dark = mat('#1d1715', 0.4);
    const add = (geo, m, parent, x, y, z) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      parent.add(o);
      return o;
    };
    const sph = (r) => new THREE.SphereGeometry(r, 14, 10);
    this.body = new THREE.Group();
    this.root.add(this.body);
    add(sph(1), F, this.body, 0, 0.34, -0.02).scale.set(0.2, 0.18, 0.3);
    add(sph(1), B, this.body, 0, 0.31, 0.12).scale.set(0.15, 0.13, 0.14); // ngực
    // đầu to kiểu chibi
    this.head = new THREE.Group();
    this.head.position.set(0, 0.56, 0.24);
    this.body.add(this.head);
    add(sph(0.19), F, this.head, 0, 0.04, 0);
    add(sph(1), B, this.head, 0, -0.03, 0.15).scale.set(0.09, 0.07, 0.1); // mõm
    add(sph(0.032), dark, this.head, 0, 0.0, 0.25); // mũi
    for (const s of [-1, 1]) {
      add(sph(0.026), dark, this.head, s * 0.075, 0.07, 0.16);
      const earM = add(new THREE.ConeGeometry(0.07, 0.16, 8), E, this.head, s * 0.12, ears === 'up' ? 0.2 : 0.12, -0.02);
      earM.rotation.set(ears === 'up' ? -0.1 : 0.3, 0, ears === 'up' ? -s * 0.25 : s * 2.4);
    }
    // vòng cổ đỏ có lục lạc nhỏ
    const collar = add(new THREE.TorusGeometry(0.13, 0.022, 6, 18), mat('#b8281c', 0.5), this.body, 0, 0.44, 0.17);
    collar.rotation.x = Math.PI / 2 - 0.5;
    add(sph(0.028), mat('#e2b85e', 0.3), this.body, 0, 0.36, 0.27);
    // bốn chân: xoay quanh hông / vai
    this.legs = [];
    for (const [x, z] of [[-0.1, 0.15], [0.1, 0.15], [-0.1, -0.17], [0.1, -0.17]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.27, z);
      this.body.add(pivot);
      add(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), F, pivot, 0, -0.12, 0);
      add(sph(0.05), B, pivot, 0, -0.24, 0.015).scale.set(1, 0.6, 1.3);
      this.legs.push(pivot);
    }
    // đuôi cong lên
    this.tail = new THREE.Group();
    this.tail.position.set(0, 0.42, -0.3);
    this.body.add(this.tail);
    const t = add(new THREE.CylinderGeometry(0.025, 0.04, 0.22, 8), F, this.tail, 0, 0.09, -0.04);
    t.rotation.x = -0.5;
  }

  placeAt(x, z, ry = this.ry) {
    this.pos.set(x, 0, z);
    this.ry = ry;
    this.goal = null;
    this.sync(0);
  }

  get moving() {
    return !!this.goal;
  }

  walkTo(x, z) {
    this.goal = new THREE.Vector3(x, 0, z);
    this.faceRy = null;
    this.sitting = false;
    this.onArrive = null;
  }

  walk(x, z) {
    this.walkTo(x, z);
    return new Promise((res) => (this.onArrive = res));
  }

  update(dt) {
    let wantRy = this.faceRy ?? this.ry;
    if (this.goal) {
      const dx = this.goal.x - this.pos.x, dz = this.goal.z - this.pos.z, dist = Math.hypot(dx, dz);
      if (dist < 0.05) {
        this.pos.copy(this.goal);
        this.goal = null;
        const cb = this.onArrive;
        this.onArrive = null;
        cb?.();
      } else {
        const step = Math.min(dist, this.speed * dt * Math.min(1, 0.3 + this.p.walk));
        this.pos.x += (dx / dist) * step;
        this.pos.z += (dz / dist) * step;
        wantRy = Math.atan2(dx, dz);
      }
    }
    this.ry = dampAngle(this.ry, wantRy, 8, dt);
    this.happy = Math.max(0, this.happy - dt);
    const p = this.p;
    p.walk = damp(p.walk, this.goal ? 1 : 0, 8, dt);
    p.sit = damp(p.sit, this.sitting && !this.goal ? 1 : 0, 5, dt);
    p.hop = damp(p.hop, 0, 6, dt);
    this.phase += dt * (6 + this.speed * 4) * p.walk;
    this.sync(dt);
  }

  // nhảy cẫng lên mừng (khi được xoa đầu)
  hop() {
    this.p.hop = 1;
    this.happy = 4;
  }

  sync() {
    const p = this.p;
    const bob = Math.abs(Math.sin(this.phase)) * 0.035 * p.walk + p.hop * 0.18;
    this.root.position.set(this.pos.x, Dog.ground(this.pos.x, this.pos.z) + bob, this.pos.z);
    this.root.rotation.y = this.ry;
    // ngồi: hạ mông, ngóc đầu
    this.body.rotation.x = -0.38 * p.sit;
    this.body.position.y = -0.06 * p.sit;
    this.head.rotation.x = 0.25 * p.sit + Math.sin(this.phase * 2) * 0.05 * p.walk;
    this.legs.forEach((leg, i) => {
      const front = i < 2, s = i % 2 ? 1 : -1;
      const swing = Math.sin(this.phase + (front ? 0 : Math.PI) + (s > 0 ? Math.PI : 0)) * 0.55 * p.walk;
      leg.rotation.x = swing + (front ? 0.38 * p.sit : -1.0 * p.sit);
    });
    const wag = this.happy > 0 ? 14 : 5;
    const t = performance.now() / 1000;
    this.tail.rotation.y = Math.sin(t * wag + this.phase) * (this.happy > 0 ? 0.7 : 0.3 + 0.2 * p.walk);
  }

  labelAnchor(v) {
    return v.set(this.root.position.x, this.root.position.y + 0.9, this.root.position.z);
  }
}

// Độ cao mặt đất — main.js gán
Dog.ground = () => 0;
