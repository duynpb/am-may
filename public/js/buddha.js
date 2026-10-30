// Tượng Phật A Di Đà ngồi kiết già trên tòa sen.
// Thân tượng được "điêu khắc" bằng hàm khoảng cách (SDF): các khối hòa liền nhau bằng smooth-min,
// rồi dựng bề mặt bằng marching cubes; pháp tuyến lấy từ gradient, bóng kẽ lõm (AO) tô vào màu đỉnh.
import * as THREE from 'three';
import { edgeTable, triTable } from 'three/addons/objects/MarchingCubes.js';
import * as T from './textures.js';

// ---------- Hàm khoảng cách cơ bản ----------
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
const smax = (a, b, k) => -smin(-a, -b, k);
function sph(x, y, z, cx, cy, cz, r) {
  const dx = x - cx, dy = y - cy, dz = z - cz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
}
function ell(x, y, z, cx, cy, cz, rx, ry, rz) {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz;
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = px / rx, qy = py / ry, qz = pz / rz;
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
// đoạn thẳng a→b, bán kính đổi dần từ r1 sang r2
function cone(x, y, z, a, b, r1, r2 = r1) {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2];
  const px = x - a[0], py = y - a[1], pz = z - a[2];
  const h = clamp01((px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz));
  const dx = px - bx * h, dy = py - by * h, dz = pz - bz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + (r2 - r1) * h);
}
const smooth = (e0, e1, v) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
// khoảng cách 2D từ điểm tới đoạn thẳng (dùng cho mép áo)
function seg2(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const h = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy));
  const ex = px - ax - dx * h, ey = py - ay - dy * h;
  return Math.sqrt(ex * ex + ey * ey);
}

// ---------- Hình khối ----------
const NECK = (x, y, z) => cone(x, y, z, [0, 1.9, -0.01], [0, 2.34, 0.02], 0.155, 0.145);
const SPLIT_Y = 2.2; // thân dựng thưa, đầu dựng dày để rõ nét mặt

// Nếp áo cà sa: phủ hai vai, cổ áo hình chữ V để lộ ngực
// (mọi vùng chuyển tiếp đều mềm để không tạo đường gãy trên bề mặt)
function robe(x, y, z) {
  if (y > 2.1) return 0;
  const ax = Math.abs(x);
  // vùng da trong cổ chữ V: không có nếp áo
  const skin = smooth(0.0, 0.05, (y - 1.48) * 0.72 - ax) * smooth(0.05, 0.15, z) * smooth(2.04, 1.96, y);
  const cloth = 1 - skin;
  // vạt áo phủ lên chân: nếp tỏa ra từ giữa lòng
  const a = Math.atan2(z - 0.15, x);
  const legs = 0.02 * Math.sin(a * 17 + Math.sin(x * 4) * 0.8) * smooth(0.7, 0.95, y) * smooth(1.3, 1.12, y);
  // nếp chéo trên thân
  const torso = 0.011 * Math.sin((x * 0.9 - y * 1.1) * 26 + ax * 6) * smooth(1.12, 1.3, y) * smooth(2.08, 1.86, y);
  // nếp ngang trên tay áo
  const sleeve = 0.013 * Math.sin(y * 30 + z * 8) * smooth(0.5, 0.66, ax) * smooth(1.0, 1.15, y);
  let f = (legs + torso + sleeve) * cloth;
  // mép cổ áo nổi lên
  if (z > 0.0 && y > 1.38 && y < 2.1) {
    const e = Math.min(seg2(x, y, -0.43, 2.0, -0.02, 1.47), seg2(x, y, 0.43, 2.0, 0.02, 1.47));
    f += 0.024 * Math.exp(-(e * e) / 0.0009) * smooth(0.0, 0.1, z);
  }
  // viền vạt áo vắt ngang lòng
  f += 0.02 * Math.exp(-((y - 1.18) ** 2) / 0.0012) * smooth(0.15, 0.3, z) * smooth(0.62, 0.5, ax);
  return -f;
}

function body(x, y, z) {
  // hai chân xếp kiết già
  let d = ell(x, y, z, 0, 0.9, 0.15, 1.04, 0.24, 0.64);
  d = smin(d, cone(x, y, z, [-0.84, 0.98, 0.3], [0.42, 1.03, 0.6], 0.16, 0.12), 0.12);
  d = smin(d, cone(x, y, z, [0.84, 0.94, 0.28], [-0.42, 0.95, 0.55], 0.16, 0.12), 0.12);
  for (const s of [-1, 1]) d = smin(d, sph(x, y, z, s * 0.92, 0.95, 0.32, 0.2), 0.12); // đầu gối
  // bàn chân ngửa trên đùi
  d = smin(d, ell(x, y, z, 0.43, 1.12, 0.4, 0.21, 0.065, 0.11), 0.05);
  d = smin(d, ell(x, y, z, -0.4, 1.06, 0.37, 0.19, 0.06, 0.1), 0.05);
  // hông, bụng, ngực
  d = smin(d, ell(x, y, z, 0, 1.15, 0.0, 0.56, 0.3, 0.42), 0.15);
  d = smin(d, ell(x, y, z, 0, 1.36, 0.06, 0.47, 0.3, 0.36), 0.12);
  d = smin(d, ell(x, y, z, 0, 1.65, 0.02, 0.55, 0.42, 0.36), 0.14);
  // vai xuôi tròn: cơ thang từ cổ xuống, bờ vai thấp dần ra ngoài
  d = smin(d, ell(x, y, z, 0, 1.9, -0.03, 0.5, 0.17, 0.27), 0.14);
  for (const s of [-1, 1]) {
    d = smin(d, sph(x, y, z, s * 0.56, 1.84, -0.03, 0.18), 0.14);
    // cánh tay, cẳng tay
    d = smin(d, cone(x, y, z, [s * 0.6, 1.84, -0.03], [s * 0.73, 1.34, 0.06], 0.17, 0.15), 0.08);
    d = smin(d, cone(x, y, z, [s * 0.73, 1.34, 0.06], [s * 0.27, 1.1, 0.42], 0.15, 0.1), 0.07);
    // tay áo rủ xuống hai bên
    d = smin(d, ell(x, y, z, s * 0.78, 1.17, 0.14, 0.18, 0.32, 0.32), 0.18);
  }
  // hai bàn tay kết ấn thiền định, hai ngón cái chạm nhau
  d = smin(d, ell(x, y, z, 0, 1.08, 0.45, 0.3, 0.07, 0.17), 0.06);
  d = smin(d, cone(x, y, z, [-0.1, 1.14, 0.5], [0.1, 1.14, 0.5], 0.036), 0.03);
  d = smin(d, NECK(x, y, z), 0.1);
  // nếp áo chỉ ảnh hưởng sát bề mặt — xa thì khỏi tính
  return Math.abs(d) < 0.06 ? d + robe(x, y, z) : d;
}

function head(x, y, z) {
  let d = ell(x, y, z, 0, 2.6, 0.02, 0.34, 0.43, 0.37);
  d = smin(d, ell(x, y, z, 0, 2.47, 0.07, 0.26, 0.25, 0.3), 0.12); // má, hàm thon
  d = smin(d, ell(x, y, z, 0, 2.33, 0.24, 0.1, 0.07, 0.09), 0.09); // cằm tròn
  d = smin(d, sph(x, y, z, 0, 2.99, -0.01, 0.2), 0.1); // nhục kế
  for (const s of [-1, 1]) {
    d = smin(d, ell(x, y, z, s * 0.35, 2.48, -0.01, 0.055, 0.26, 0.11), 0.04); // tai dài
    d = smax(d, -ell(x, y, z, s * 0.4, 2.52, 0.0, 0.025, 0.17, 0.06), 0.02); // lòng tai
    // mí mắt khép hờ nhìn xuống + nếp mí
    d = smin(d, ell(x, y, z, s * 0.13, 2.612, 0.338, 0.09, 0.04, 0.038), 0.035);
  }
  // sống mũi, chóp mũi
  d = smin(d, ell(x, y, z, 0, 2.56, 0.37, 0.045, 0.12, 0.06), 0.04);
  d = smin(d, ell(x, y, z, 0, 2.475, 0.385, 0.062, 0.036, 0.042), 0.03);
  // cung mày
  d = smin(d, cone(x, y, z, [-0.2, 2.7, 0.3], [0.2, 2.7, 0.3], 0.028), 0.06);
  // môi và khóe miệng
  d = smin(d, ell(x, y, z, 0, 2.408, 0.352, 0.082, 0.026, 0.042), 0.025); // môi trên
  d = smin(d, ell(x, y, z, 0, 2.368, 0.345, 0.066, 0.028, 0.042), 0.025); // môi dưới
  d = smin(d, NECK(x, y, z), 0.1);
  return Math.abs(d) < 0.03 ? d + faceLines(x, y, z) : d;
}

// Nếp mí mắt và đường môi: rãnh lõm mềm (rộng hơn ô lưới để không bị thủng)
function faceLines(x, y, z) {
  if (z < 0.28 || y < 2.33 || y > 2.66) return 0;
  let g = 0;
  for (const s of [-1, 1]) {
    const u = (x - s * 0.13) / 0.082;
    if (Math.abs(u) < 1) {
      const yc = 2.596 - 0.012 * u * u - 0.004 * s * u; // mí khép hờ, đuôi mắt hơi xếch xuống
      g += 0.0075 * Math.exp(-(((y - yc) / 0.0085) ** 2)) * (1 - u * u);
    }
  }
  const m = x / 0.078;
  if (Math.abs(m) < 1) {
    const yc = 2.388 + 0.009 * m * m; // khóe môi hơi cong lên: nụ cười nhẹ
    g += 0.009 * Math.exp(-(((y - yc) / 0.0075) ** 2)) * Math.sqrt(1 - m * m);
  }
  return g;
}

// ---------- Marching cubes có chia sẻ đỉnh ----------
const CORNER = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
// cạnh: [góc đầu, góc cuối, trục] theo bảng của Paul Bourke
const EDGE = [[0, 1, 0], [1, 2, 1], [3, 2, 0], [0, 3, 1], [4, 5, 0], [5, 6, 1], [7, 6, 0], [4, 7, 1], [0, 4, 2], [1, 5, 2], [2, 6, 2], [3, 7, 2]];

function polygonize(sdf, [x0, y0, z0], [x1, y1, z1], step, out) {
  const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step), nz = Math.ceil((z1 - z0) / step);
  const sx = nx + 1, sy = ny + 1, sz = nz + 1;
  const field = new Float32Array(sx * sy * sz);
  const id = (i, j, k) => (k * sy + j) * sx + i;
  // Lưới thô: khối B×B×B ô nào ở xa bề mặt thì mọi điểm trong khối lấy luôn giá trị tâm khối
  // (cùng dấu nên không sinh mặt), chỉ tính kỹ những khối sát bề mặt.
  const B = 4;
  const bx = Math.ceil(sx / B), by = Math.ceil(sy / B), bz = Math.ceil(sz / B);
  const coarse = new Float32Array(bx * by * bz);
  const far = 1.6 * B * step * 0.87 + 0.04;
  for (let c = 0; c < bz; c++) for (let b = 0; b < by; b++) for (let a = 0; a < bx; a++) {
    const v = sdf(x0 + (a * B + (B - 1) / 2) * step, y0 + (b * B + (B - 1) / 2) * step, z0 + (c * B + (B - 1) / 2) * step);
    coarse[(c * by + b) * bx + a] = Math.abs(v) > far ? v : NaN;
  }
  for (let k = 0; k < sz; k++) {
    const z = z0 + k * step;
    for (let j = 0; j < sy; j++) {
      const y = y0 + j * step;
      const row = ((k / B | 0) * by + (j / B | 0)) * bx;
      for (let i = 0; i < sx; i++) {
        const cv = coarse[row + (i / B | 0)];
        field[id(i, j, k)] = cv === cv ? cv : sdf(x0 + i * step, y, z);
      }
    }
  }
  const edgeVert = new Int32Array(sx * sy * sz * 3).fill(-1);
  const pos = out.pos, idx = out.idx;
  const vals = new Float32Array(8);
  const cv = new Int32Array(12);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let cube = 0;
    for (let c = 0; c < 8; c++) {
      const o = CORNER[c];
      vals[c] = field[id(i + o[0], j + o[1], k + o[2])];
      if (vals[c] < 0) cube |= 1 << c;
    }
    const bits = edgeTable[cube];
    if (!bits) continue;
    for (let e = 0; e < 12; e++) {
      if (!(bits & (1 << e))) continue;
      const [ca, cb, axis] = EDGE[e];
      const oa = CORNER[ca];
      const key = id(i + oa[0], j + oa[1], k + oa[2]) * 3 + axis;
      let v = edgeVert[key];
      if (v < 0) {
        const t = vals[ca] / (vals[ca] - vals[cb]);
        const ob = CORNER[cb];
        v = pos.length / 3;
        pos.push(
          x0 + (i + oa[0] + (ob[0] - oa[0]) * t) * step,
          y0 + (j + oa[1] + (ob[1] - oa[1]) * t) * step,
          z0 + (k + oa[2] + (ob[2] - oa[2]) * t) * step,
        );
        edgeVert[key] = v;
      }
      cv[e] = v;
    }
    for (let t = cube * 16; triTable[t] !== -1; t += 3) idx.push(cv[triTable[t]], cv[triTable[t + 1]], cv[triTable[t + 2]]);
  }
}

// Dựng lưới từ SDF: pháp tuyến theo gradient, bóng kẽ lõm + vân thếp vàng vào màu đỉnh
function sculpt(parts) {
  const out = { pos: [], idx: [] };
  const owner = [];
  for (const p of parts) {
    const start = out.pos.length / 3;
    polygonize(p.sdf, p.min, p.max, p.step, out);
    for (let v = start; v < out.pos.length / 3; v++) owner.push(p.sdf);
  }
  const n = out.pos.length / 3;
  const pos = new Float32Array(out.pos);
  const nor = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const gold = new THREE.Color('#f2cf73').convertSRGBToLinear();
  const deep = new THREE.Color('#7a5220').convertSRGBToLinear();
  const e = 0.004;
  for (let v = 0; v < n; v++) {
    const f = owner[v];
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    let gx = f(x + e, y, z) - f(x - e, y, z);
    let gy = f(x, y + e, z) - f(x, y - e, z);
    let gz = f(x, y, z + e) - f(x, y, z - e);
    const gl = Math.hypot(gx, gy, gz) || 1;
    gx /= gl; gy /= gl; gz /= gl;
    nor.set([gx, gy, gz], v * 3);
    // bóng kẽ lõm: lấy mẫu dọc pháp tuyến
    let occ = 0, w = 1;
    for (let s = 1; s <= 5; s++) {
      const h = 0.028 * s;
      occ += (h - f(x + gx * h, y + gy * h, z + gz * h)) * w;
      w *= 0.62;
    }
    const ao = clamp01(1 - occ * 3.2);
    // vân thếp vàng loang nhẹ
    const grain = 0.93 + 0.07 * Math.sin(x * 23 + Math.sin(y * 17) * 2) * Math.sin(z * 19 + y * 7);
    const k = ao * grain;
    const m = 0.6 + 0.4 * k;
    col[v * 3] = (deep.r + (gold.r - deep.r) * ao) * m;
    col[v * 3 + 1] = (deep.g + (gold.g - deep.g) * ao) * m;
    col[v * 3 + 2] = (deep.b + (gold.b - deep.b) * ao) * m;
  }
  // sửa chiều tam giác cho khớp pháp tuyến (mặt ngoài hướng ra ngoài)
  const idx = new Uint32Array(out.idx);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const wx = pos[c] - pos[a], wy = pos[c + 1] - pos[a + 1], wz = pos[c + 2] - pos[a + 2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    if (fx * nor[a] + fy * nor[a + 1] + fz * nor[a + 2] < 0) {
      const tmp = idx[t + 1];
      idx[t + 1] = idx[t + 2];
      idx[t + 2] = tmp;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

// Cánh sen: hình giọt nước đùn khối, uốn cong mũi cánh ra ngoài, màu đậm ở gốc nhạt ở mũi
function petalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.24, 0.04, 0.3, 0.36, 0, 0.64);
  s.bezierCurveTo(-0.3, 0.36, -0.24, 0.04, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3, curveSegments: 18 });
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const base = new THREE.Color('#b8823a').convertSRGBToLinear();
  const tip = new THREE.Color('#f6dc9a').convertSRGBToLinear();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), x = p.getX(i);
    p.setZ(i, p.getZ(i) + 0.32 * (y / 0.64) ** 2 - 0.08 * (x / 0.3) ** 2); // uốn cong
    const k = clamp01(y / 0.64);
    col[i * 3] = base.r + (tip.r - base.r) * k;
    col[i * 3 + 1] = base.g + (tip.g - base.g) * k;
    col[i * 3 + 2] = base.b + (tip.b - base.b) * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export function makeBuddha({ quality = 'high' } = {}) {
  const g = new THREE.Group();
  const q = quality === 'high' ? 1 : 1.45; // máy yếu: lưới thưa hơn

  const gilt = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, metalness: 0.9, roughness: 0.34 });
  const goldDeep = new THREE.MeshStandardMaterial({ color: '#c0913f', metalness: 0.9, roughness: 0.38 });
  const petalMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, metalness: 0.7, roughness: 0.36 });

  // Tòa sen ba tầng cánh
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.28, 0.26, 48), goldDeep);
  base.position.y = 0.13;
  g.add(base);
  const petal = petalGeometry();
  for (const [n, r, y, tilt, s, off] of [[18, 1.0, 0.12, 0.55, 1, 0], [16, 0.86, 0.28, 0.38, 0.9, 0.2], [14, 0.7, 0.42, 0.22, 0.78, 0.1]]) {
    for (let i = 0; i < n; i++) {
      const pv = new THREE.Group();
      pv.rotation.y = (i / n) * Math.PI * 2 + off;
      const m = new THREE.Mesh(petal, petalMat);
      m.position.set(0, y, r);
      m.rotation.x = tilt;
      m.scale.setScalar(s);
      m.castShadow = true;
      pv.add(m);
      g.add(pv);
    }
  }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.02, 0.1, 48), goldDeep);
  top.position.y = 0.68;
  g.add(top);

  // Thân và đầu tượng
  const geo = sculpt([
    { sdf: body, min: [-1.25, 0.62, -0.72], max: [1.25, SPLIT_Y, 0.92], step: 0.02 * q },
    { sdf: head, min: [-0.47, SPLIT_Y, -0.44], max: [0.47, 3.24, 0.5], step: 0.0105 * q },
  ]);
  const statue = new THREE.Mesh(geo, gilt);
  statue.castShadow = statue.receiveShadow = true;
  g.add(statue);

  // Tam đạo (ba ngấn cổ) — cũng che đường nối thân/đầu
  for (const [y, r] of [[2.13, 0.158], [2.2, 0.153], [2.27, 0.15]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.009, 8, 40), goldDeep);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, y, 0.005);
    g.add(ring);
  }

  // Tóc xoắn ốc: dò bề mặt đầu theo các hướng phân bố đều
  {
    const pts = [];
    const N = quality === 'high' ? 1300 : 700;
    const c = [0, 2.72, -0.01];
    for (let i = 0; i < N; i++) {
      const yy = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = i * 2.399963;
      const dx = Math.cos(th) * rr, dy = yy, dz = Math.sin(th) * rr;
      if (dy < -0.35) continue;
      let t = 0;
      while (t < 0.7 && head(c[0] + dx * t, c[1] + dy * t, c[2] + dz * t) < 0) t += 0.004;
      const x = c[0] + dx * t, y = c[1] + dy * t, z = c[2] + dz * t;
      const hairline = 2.76 - 0.2 * Math.max(0, -dz) - 0.04 * Math.abs(dx);
      if (y < hairline || (Math.abs(x) > 0.3 && y < 2.82)) continue;
      pts.push([x, y, z, dx, dy, dz]);
    }
    const curls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.026, 10, 8), goldDeep, pts.length);
    const o = new THREE.Object3D();
    pts.forEach(([x, y, z, dx, dy, dz], i) => {
      o.position.set(x - dx * 0.008, y - dy * 0.008, z - dz * 0.008);
      o.scale.set(1, 0.8, 1);
      o.lookAt(x + dx, y + dy, z + dz);
      o.updateMatrix();
      curls.setMatrixAt(i, o.matrix);
    });
    curls.castShadow = true;
    g.add(curls);
  }
  // bạch hào giữa hai chân mày
  const urna = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), goldDeep);
  urna.position.set(0, 2.72, 0.395);
  g.add(urna);

  // Hào quang
  const aur = T.aureole();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false }));
  halo.position.set(0, 2.68, -0.5);
  g.add(halo);
  const big = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.9), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false, opacity: 0.85 }));
  big.position.set(0, 1.85, -0.72);
  g.add(big);
  return g;
}
