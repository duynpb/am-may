// Nhân vật chibi mặc áo tràng: đi, ngồi bồ đoàn, chắp tay, lạy.
import * as THREE from 'three';
import { makeSandal } from './sandals.js';

export const ROBES = [
  { robe: '#9a9e98', sash: '#d9b44a' },
  { robe: '#8b6b4e', sash: '#e6b354' },
  { robe: '#bdb5a3', sash: '#c98a3c' },
  { robe: '#6f8088', sash: '#e3c06b' },
  { robe: '#a8784a', sash: '#f0d48a' },
  { robe: '#7d8a6c', sash: '#e2b85e' },
];
const SKINS = ['#f1c9a0', '#e9b98c', '#f5d3b0', '#dfb087'];

const G = {};
function geos() {
  if (G.ready) return G;
  G.skirt = new THREE.CylinderGeometry(0.3, 0.44, 0.4, 22).translate(0, 0.2, 0);
  G.torso = new THREE.CylinderGeometry(0.25, 0.31, 0.44, 22).translate(0, 0.22, 0);
  G.sash = new THREE.BoxGeometry(0.1, 0.56, 0.03);
  G.collar = new THREE.TorusGeometry(0.19, 0.045, 8, 22).rotateX(Math.PI / 2);
  G.head = new THREE.SphereGeometry(0.36, 28, 20);
  G.eye = new THREE.SphereGeometry(0.032, 10, 8);
  G.smile = new THREE.TorusGeometry(0.035, 0.009, 6, 12, Math.PI).rotateZ(Math.PI);
  G.cheek = new THREE.SphereGeometry(0.05, 10, 8);
  G.ear = new THREE.SphereGeometry(0.07, 10, 8);
  G.sleeve = new THREE.CylinderGeometry(0.075, 0.11, 0.34, 12).translate(0, -0.17, 0);
  G.hand = new THREE.SphereGeometry(0.07, 12, 10);
  G.foot = new THREE.SphereGeometry(0.09, 12, 8);
  G.incStick = new THREE.CylinderGeometry(0.012, 0.012, 1, 6).translate(0, 0.5, 0);
  G.ember = new THREE.SphereGeometry(0.018, 8, 6);
  G.emberMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a' });
  G.ready = true;
  return G;
}
const matCache = new Map();
function mat(color, rough = 0.85) {
  const k = color + rough;
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough }));
  return matCache.get(k);
}

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const mix = (a, b, t) => a + (b - a) * t;
function dampAngle(a, b, k, dt) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * (1 - Math.exp(-k * dt));
}

export class Avatar {
  constructor({ id, name, robe = 0, skin, isPlayer = false, speed }) {
    this.id = id;
    this.name = name;
    this.isPlayer = isPlayer;
    this.speed = speed ?? (isPlayer ? 2.8 : 1.7);
    this.pos = new THREE.Vector3();
    this.ry = Math.PI;
    this.faceRy = null;
    this.goal = null;
    this.goalSeat = null;
    this.seat = null;
    this.action = null;
    this.seed = Math.random() * 100;
    this.p = { walk: 0, sit: 0, gassho: 0, bow: 0, stoop: 0 };
    this.phase = 0;
    this.time = 0;
    this.onArrive = null;
    this.wearing = false;
    this.build(ROBES[robe % ROBES.length], skin ?? SKINS[Math.floor(Math.random() * SKINS.length)]);
  }

  // Đôi dép của nhân vật (màu [đế, quai]); wearSandals(true) = đang mang
  setSandals(colors) {
    this.sandalColors = colors;
    this.soles?.forEach((s) => s.removeFromParent());
    this.soles = this.feet.map(() => {
      const s = makeSandal(colors);
      s.visible = false;
      this.lower.add(s);
      return s;
    });
    this.wearSandals(this.wearing);
  }
  wearSandals(on) {
    this.wearing = on;
    this.soles?.forEach((s) => (s.visible = on));
  }

  build(colors, skin) {
    const g = geos();
    const root = (this.root = new THREE.Group());
    const add = (geo, m, parent, x = 0, y = 0, z = 0) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const robe = mat(colors.robe), sash = mat(colors.sash), skinM = mat(skin, 0.7);

    this.lower = new THREE.Group();
    root.add(this.lower);
    this.skirt = add(g.skirt, robe, this.lower);
    this.feet = [-1, 1].map((s) => {
      const f = add(g.foot, mat('#3d3833'), this.lower, s * 0.13, 0.04, 0.1);
      f.scale.set(1, 0.6, 1.4);
      return f;
    });

    this.upper = new THREE.Group();
    this.upper.position.y = 0.4;
    root.add(this.upper);
    add(g.torso, robe, this.upper);
    const s1 = add(g.sash, sash, this.upper, 0.02, 0.22, 0.27);
    s1.rotation.set(-0.12, 0, 0.62);
    add(g.collar, sash, this.upper, 0, 0.43, 0);

    this.head = new THREE.Group();
    this.head.position.y = 0.76;
    this.upper.add(this.head);
    add(g.head, skinM, this.head);
    const eyeM = mat('#2b211b', 0.4);
    for (const s of [-1, 1]) {
      add(g.eye, eyeM, this.head, s * 0.12, 0.0, 0.33).scale.set(1.3, 0.5, 0.6);
      add(g.cheek, mat('#f19c8c', 0.9), this.head, s * 0.2, -0.08, 0.28).scale.set(1, 0.6, 0.4);
      add(g.ear, skinM, this.head, s * 0.35, -0.01, 0).scale.set(0.6, 1, 0.8);
    }
    add(g.smile, eyeM, this.head, 0, -0.1, 0.34);

    this.arms = [-1, 1].map((s) => {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.29, 0.37, 0);
      this.upper.add(pivot);
      add(g.sleeve, robe, pivot);
      add(g.hand, skinM, pivot, 0, -0.37, 0);
      pivot.userData.side = s;
      return pivot;
    });

    // Bó nhang cầm giữa hai bàn tay chắp
    this.incense = new THREE.Group();
    this.incense.position.set(0, 0.2, 0.31);
    this.incense.visible = false;
    this.upper.add(this.incense);
    this.incenseSticks = [-1, 0, 1].map((k) => {
      const st = new THREE.Group();
      st.rotation.z = k * 0.12;
      const stem = new THREE.Mesh(g.incStick, mat('#b8322a', 0.6));
      stem.scale.y = 0.13;
      const body = new THREE.Mesh(g.incStick, mat('#7a4a2c', 0.9));
      body.position.y = 0.13;
      body.scale.y = 0.3;
      const ember = new THREE.Mesh(g.ember, g.emberMat);
      ember.position.y = 0.43;
      st.add(stem, body, ember);
      this.incense.add(st);
      return st;
    });
  }

  // Cầm phong bì công đức giữa hai tay chắp
  holdEnvelope(on) {
    if (!this.envelope) {
      this.envelope = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.012), mat('#c8261b', 0.5));
      const seal = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.014), mat('#e8b84a', 0.4));
      this.envelope.add(seal);
      this.envelope.position.set(0, 0.3, 0.33);
      this.upper.add(this.envelope);
    }
    this.envelope.visible = on;
  }

  // Cầm n nén nhang (0 = bỏ xuống)
  holdIncense(n) {
    this.incense.visible = n > 0;
    this.incenseSticks.forEach((s, k) => (s.visible = n >= 3 || k === 1));
  }

  get moving() {
    return !!this.goal;
  }
  get sitting() {
    return this.seat != null;
  }

  placeAt(x, z, ry = Math.PI) {
    this.pos.set(x, 0, z);
    this.ry = ry;
    this.goal = null;
    this.sync();
  }

  // Đi tới điểm (x, z); nếu có seat thì ngồi xuống khi tới
  walkTo(x, z, seat = null) {
    this.goal = new THREE.Vector3(x, 0, z);
    this.goalSeat = seat;
    this.seat = null;
    this.faceRy = null;
    this.onArrive = null;
    if (this.action?.kind === 'bow' || this.action?.kind === 'stoop') this.action = null;
  }

  // walkTo dạng Promise — xong khi tới nơi (không xong nếu bị lệnh đi khác chen vào)
  walk(x, z) {
    this.walkTo(x, z);
    return new Promise((res) => (this.onArrive = res));
  }

  sitAt(seat) {
    this.placeAt(seat.x, seat.z, Math.PI);
    this.seat = seat.index;
    this.p.sit = 1;
    this.sync();
  }

  stop() {
    this.goal = null;
  }

  // kind: 'gassho' (chắp tay) | 'bow' (lạy) | 'stoop' (cúi xuống sắp dép)
  act(kind, faceRy = null) {
    this.action = { kind, start: this.time };
    if (faceRy != null && !this.sitting) {
      this.goal = null;
      this.faceRy = faceRy;
    }
  }

  update(dt) {
    this.time += dt;
    let arrived = false;
    let wantRy = this.faceRy ?? (this.sitting ? Math.PI : this.ry);
    if (this.goal) {
      const dx = this.goal.x - this.pos.x, dz = this.goal.z - this.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.04) {
        this.pos.copy(this.goal);
        this.goal = null;
        arrived = true;
        if (this.goalSeat) {
          this.seat = this.goalSeat.index;
          this.goalSeat = null;
        }
        const cb = this.onArrive;
        this.onArrive = null;
        cb?.();
      } else {
        const step = Math.min(dist, this.speed * dt * Math.min(1, 0.4 + this.p.walk));
        this.pos.x += (dx / dist) * step;
        this.pos.z += (dz / dist) * step;
        wantRy = Math.atan2(dx, dz);
      }
    }
    this.ry = dampAngle(this.ry, wantRy, 9, dt);

    let gT = 0, bT = 0, sT = 0;
    if (this.action) {
      const e = this.time - this.action.start;
      if (this.action.kind === 'gassho') {
        gT = e < 2.2 ? 1 : 0;
        if (e > 2.8) this.action = null;
      } else if (this.action.kind === 'stoop') {
        sT = e < 1.5 ? 1 : 0;
        if (e > 2.0) this.action = null;
      } else {
        gT = e < 3.6 ? 1 : 0;
        bT = e > 0.6 && e < 2.5 ? 1 : 0;
        if (e > 4.2) this.action = null;
      }
    }
    const p = this.p;
    p.walk = damp(p.walk, this.goal ? 1 : 0, 8, dt);
    p.sit = damp(p.sit, this.sitting ? 1 : 0, 6, dt);
    p.gassho = damp(p.gassho, gT, 7, dt);
    p.bow = damp(p.bow, bT, 3.5, dt);
    p.stoop = damp(p.stoop, sT, 5, dt);
    this.phase += dt * 9.5 * p.walk;
    this.sync();
    return arrived;
  }

  sync() {
    const p = this.p, t = this.time + this.seed;
    const bob = Math.abs(Math.sin(this.phase)) * 0.06 * p.walk;
    this.root.position.set(this.pos.x, Avatar.ground(this.pos.x, this.pos.z) + bob - 0.04 * p.sit, this.pos.z);
    this.root.rotation.y = this.ry;
    this.root.rotation.z = Math.sin(this.phase) * 0.04 * p.walk;

    this.skirt.scale.set(1 + 0.42 * p.sit, 1 - 0.48 * p.sit, 1 + 0.42 * p.sit);
    this.feet.forEach((f, i) => {
      const s = i ? 1 : -1;
      f.position.z = 0.1 + Math.sin(this.phase + (i ? Math.PI : 0)) * 0.14 * p.walk + 0.22 * p.sit;
      f.position.x = s * (0.13 + 0.12 * p.sit);
      f.visible = p.sit < 0.6;
      const sole = this.soles?.[i];
      if (sole) {
        sole.position.set(f.position.x, 0, f.position.z - 0.02);
        sole.visible = this.wearing && f.visible;
      }
    });

    this.upper.position.y = 0.4 - 0.18 * p.sit;
    this.upper.rotation.x = p.bow * mix(0.62, 0.95, p.sit) + p.stoop * 0.95;
    this.upper.scale.y = 1 + Math.sin(t * 1.7) * 0.012;
    this.head.rotation.x = 0.16 * p.sit * (1 - p.bow) + Math.sin(this.phase * 2) * 0.03 * p.walk;
    this.head.rotation.z = Math.sin(t * 0.4) * 0.04 * (1 - p.walk);

    for (const arm of this.arms) {
      const s = arm.userData.side;
      const swing = Math.sin(this.phase + (s > 0 ? 0 : Math.PI)) * 0.6 * p.walk;
      let rx = mix(0, -0.55, p.sit) + swing;
      let rz = mix(s * 0.12, -s * 0.38, p.sit);
      rx = mix(rx, -1.15, p.gassho);
      rz = mix(rz, -s * 0.64, p.gassho);
      rx = mix(rx, -0.6, p.stoop); // với tay xuống sắp dép
      rz = mix(rz, -s * 0.2, p.stoop);
      arm.rotation.set(rx, 0, rz);
    }
  }

  // Vị trí trên đầu (để đặt nhãn tên)
  labelAnchor(v) {
    return v.set(this.root.position.x, this.root.position.y + 1.5 - 0.2 * this.p.sit, this.root.position.z);
  }

  dispose() {
    this.root.removeFromParent();
  }
}

// Độ cao mặt đất tại (x, z) — main.js gán theo thềm và sân
Avatar.ground = () => 0;
