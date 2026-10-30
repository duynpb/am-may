// Dép quai ngang và hàng dép trên thềm chánh điện.
import * as THREE from 'three';

// [màu đế, màu quai]
export const SANDAL_COLORS = [
  ['#3b2f2a', '#7a4a2c'],
  ['#2f3540', '#c9a26b'],
  ['#5a3b2a', '#a8322a'],
  ['#1f1f1f', '#3b5b8a'],
  ['#8a6a4a', '#d9b98a'],
  ['#4a4a40', '#6f8a5a'],
  ['#6b4a3a', '#e0c9a0'],
];

const geo = {};
function geos() {
  if (geo.sole) return geo;
  // đế dép: viên nang dẹt, dài theo trục z (mũi dép ở phía +z)
  geo.sole = new THREE.CapsuleGeometry(0.052, 0.15, 4, 12).rotateX(Math.PI / 2).scale(1, 0.3, 1);
  geo.strap = new THREE.TorusGeometry(0.048, 0.013, 6, 14, Math.PI);
  return geo;
}
const mats = new Map();
const mat = (c) => {
  if (!mats.has(c)) mats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
  return mats.get(c);
};

export function makeSandal([soleC, strapC]) {
  const g = geos();
  const s = new THREE.Group();
  const sole = new THREE.Mesh(g.sole, mat(soleC));
  sole.position.y = 0.016;
  const strap = new THREE.Mesh(g.strap, mat(strapC));
  strap.position.set(0, 0.022, 0.045);
  sole.castShadow = strap.castShadow = true;
  sole.receiveShadow = true;
  s.add(sole, strap);
  return s;
}

const rnd = (a, b) => a + Math.random() * (b - a);
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export class SandalRack {
  constructor(scene, { rows = [20.15, 20.85], from = 1.7, to = 7.8, step = 0.5 } = {}) {
    this.scene = scene;
    this.slots = [];
    // xếp từ gần lối giữa ra ngoài, xen kẽ hai bên
    for (const z of rows) {
      for (let x = from; x <= to + 1e-6; x += step) {
        this.slots.push({ x: -x, z, owner: null }, { x, z, owner: null });
      }
    }
    this.pairs = new Map();
    this.anims = [];
  }

  slotOf(id) {
    return this.slots.find((s) => s.owner === id) ?? null;
  }

  // giữ một chỗ để dép cho người này
  reserve(id) {
    const own = this.slotOf(id);
    if (own) return own;
    const s = this.slots.find((x) => x.owner == null);
    if (s) s.owner = id;
    return s ?? null;
  }

  has(id) {
    return this.pairs.has(id);
  }

  // Đặt đôi dép vào chỗ. messy: dép vừa cởi ra — mũi quay vào trong, hơi lệch
  place(id, colors, { messy = false } = {}) {
    const slot = this.reserve(id);
    if (!slot || this.pairs.has(id)) return;
    const pair = new THREE.Group();
    pair.position.set(slot.x, 0, slot.z);
    const sides = [-1, 1].map((side) => {
      const s = makeSandal(colors);
      const neat = { x: side * 0.068, z: 0, r: 0 };
      const from = messy ? { x: side * rnd(0.07, 0.11), z: rnd(-0.05, 0.05), r: Math.PI + rnd(-0.3, 0.3) } : neat;
      s.position.set(from.x, 0, from.z);
      s.rotation.y = from.r;
      pair.add(s);
      return { s, from, neat };
    });
    this.scene.add(pair);
    this.pairs.set(id, { pair, sides });
  }

  // Xoay dép lại cho ngay ngắn, mũi hướng ra sân
  straighten(id, dur = 0.9) {
    const p = this.pairs.get(id);
    if (!p) return;
    this.anims.push({ p, t: 0, dur });
  }

  // Mang dép vào (dép rời khỏi thềm)
  take(id) {
    const p = this.pairs.get(id);
    if (!p) return;
    p.pair.removeFromParent();
    this.pairs.delete(id);
    this.anims = this.anims.filter((a) => a.p !== p);
  }

  release(id) {
    this.take(id);
    const s = this.slotOf(id);
    if (s) s.owner = null;
  }

  clear(keepId) {
    for (const s of this.slots) if (s.owner != null && s.owner !== keepId) this.release(s.owner);
  }

  update(dt) {
    for (let i = this.anims.length - 1; i >= 0; i--) {
      const a = this.anims[i];
      a.t += dt;
      const k = ease(Math.min(1, a.t / a.dur));
      for (const { s, from, neat } of a.p.sides) {
        s.position.x = from.x + (neat.x - from.x) * k;
        s.position.z = from.z + (neat.z - from.z) * k;
        s.rotation.y = from.r + (neat.r - from.r) * k;
      }
      if (k >= 1) this.anims.splice(i, 1);
    }
  }
}
