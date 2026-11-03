// Lá rơi trên sân chùa: rụng xuống chao nghiêng, nằm trên sân, bị chổi quét thì bay đi rồi biến mất.
// Mỗi lá: [id, x, z, góc xoay, màu] — máy chủ giữ danh sách chung cho cả chánh điện.
import * as THREE from 'three';

const COLORS = ['#d9a43a', '#c8702a', '#8a5a2a', '#b3a043'].map((c) => new THREE.Color(c));
const MAX = 160;
const FALL = 3.2; // giây rơi từ trên cây xuống
const GONE = 0.55; // giây bay đi khi bị quét

function leafGeometry() {
  // phiến lá thon, mũi nhọn, nằm phẳng trên mặt sân (dài theo trục z)
  const s = new THREE.Shape();
  s.moveTo(0, -0.1);
  s.quadraticCurveTo(0.065, -0.03, 0, 0.1);
  s.quadraticCurveTo(-0.065, -0.03, 0, -0.1);
  const g = new THREE.ShapeGeometry(s, 6);
  g.rotateX(-Math.PI / 2);
  g.scale(1.6, 1, 1.6);
  return g;
}

export class LeafField {
  constructor(scene, { groundY, pushOut }) {
    this.groundY = groundY;
    this.pushOut = pushOut;
    this.items = [];
    this.byId = new Map();
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide });
    this.mesh = new THREE.InstancedMesh(leafGeometry(), mat, MAX);
    this.mesh.count = 0;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.m4 = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.v = new THREE.Vector3();
    this.sc = new THREE.Vector3();
  }

  // Đặt lại toàn bộ lá (khi vào phòng)
  reset(list) {
    this.items = [];
    this.byId.clear();
    this.add(list, { fall: false });
  }

  add(list, { fall = true } = {}) {
    for (const [id, x0, z0, rot, c] of list) {
      if (this.byId.has(id) || this.items.length >= MAX) continue;
      const [x, z] = this.pushOut(x0, z0);
      const it = {
        id, x, z, rot, c: COLORS[c % COLORS.length], state: fall ? 'fall' : 'rest',
        t: fall ? -Math.random() * 1.5 : 0, h: 2.6 + Math.random(), sway: Math.random() * 6.28,
      };
      this.items.push(it);
      this.byId.set(id, it);
    }
  }

  get resting() {
    let n = 0;
    for (const it of this.items) if (it.state === 'rest') n++;
    return n;
  }

  // Người khác quét: lá bay đi (từ phía (fx, fz) nếu biết)
  remove(ids, fx = null, fz = null) {
    for (const id of ids) {
      const it = this.byId.get(id);
      if (it && it.state !== 'gone') this.sweep(it, fx ?? it.x, fz ?? it.z);
    }
  }

  // Lá đang nằm trong bán kính r quanh (x, z): quét bay đi, trả về id
  takeNear(x, z, r) {
    const ids = [];
    for (const it of this.items) {
      if (it.state !== 'rest' || Math.hypot(it.x - x, it.z - z) > r) continue;
      this.sweep(it, x, z);
      ids.push(it.id);
    }
    return ids;
  }

  sweep(it, fx, fz) {
    let dx = it.x - fx, dz = it.z - fz;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    it.state = 'gone';
    it.t = 0;
    it.vx = dx * 1.4 + (Math.random() - 0.5) * 0.6;
    it.vz = dz * 1.4 + (Math.random() - 0.5) * 0.6;
    it.spin = (Math.random() - 0.5) * 14;
    this.byId.delete(it.id);
  }

  update(dt) {
    const { m4, q, e, v, sc } = this;
    let n = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.t += dt;
      const g = this.groundY(it.x, it.z) + 0.02;
      let y = g, tilt = 0, s = 1, rot = it.rot, ox = 0, oz = 0;
      if (it.state === 'fall') {
        if (it.t < 0) continue; // chưa tới lượt rụng
        const k = Math.min(1, it.t / FALL);
        y = g + it.h * (1 - k);
        ox = Math.sin(it.t * 2.6 + it.sway) * 0.45 * (1 - k);
        oz = Math.cos(it.t * 1.9 + it.sway) * 0.25 * (1 - k);
        tilt = Math.sin(it.t * 3.1 + it.sway) * 0.8 * (1 - k);
        rot += it.t * 1.5;
        if (k >= 1) {
          it.state = 'rest';
          it.rot = rot;
        }
      } else if (it.state === 'gone') {
        const k = it.t / GONE;
        if (k >= 1) {
          this.items.splice(i, 1);
          continue;
        }
        it.x += it.vx * dt;
        it.z += it.vz * dt;
        y = g + Math.sin(k * Math.PI) * 0.35;
        rot += it.spin * it.t;
        tilt = k * 1.2;
        s = 1 - k * k;
      }
      v.set(it.x + ox, y, it.z + oz);
      e.set(tilt, rot, 0, 'YXZ');
      q.setFromEuler(e);
      sc.setScalar(s);
      m4.compose(v, q, sc);
      this.mesh.setMatrixAt(n, m4);
      this.mesh.setColorAt(n, it.c);
      n++;
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

// Chổi tre: cán dọc theo trục -y từ gốc (chỗ tay cầm), bó chổi xòe ở đầu dưới
export function makeBroom() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.02, 0.7, 8), new THREE.MeshStandardMaterial({ color: '#c9b07a', roughness: 0.7 }));
  handle.position.y = -0.08;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), new THREE.MeshStandardMaterial({ color: '#5a3d22', roughness: 0.8 }));
  ring.position.y = -0.42;
  const twigM = new THREE.MeshStandardMaterial({ color: '#9a7a44', roughness: 0.95, side: THREE.DoubleSide });
  const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 14, 1, true), twigM);
  bristles.position.y = -0.57; // chóp nón ở trên, xòe rộng ra phía dưới
  bristles.scale.z = 0.35;
  g.add(handle, ring, bristles);
  // vài cọng chổi xòe ra cho thật
  const twig = new THREE.CylinderGeometry(0.004, 0.004, 0.34, 3);
  for (let k = -3; k <= 3; k++) {
    const t = new THREE.Mesh(twig, twigM);
    t.position.set(k * 0.022, -0.58, 0.02 * Math.sin(k));
    t.rotation.z = k * 0.07;
    g.add(t);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  return g;
}
