// Tượng Phật A Di Đà ngồi kiết già trên tòa sen.
// Thân tượng được "điêu khắc" bằng hàm khoảng cách (SDF): các khối hòa liền nhau bằng smooth-min,
// rồi dựng bề mặt bằng marching cubes; pháp tuyến lấy từ gradient, bóng kẽ lõm (AO) tô vào màu đỉnh.
import * as THREE from 'three';
import { edgeTable, triTable } from 'three/addons/objects/MarchingCubes.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
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

export { smin, smax, sph, ell, cone, smooth };

// ---------- Hình khối (dáng tượng đồng ngồi thiền: đầu nhỏ, thân cao, vai rộng) ----------
const NECK = (x, y, z) => cone(x, y, z, [0, 2.0, -0.02], [0, 2.46, 0.0], 0.15, 0.13);
const SPLIT_Y = 2.22; // thân dựng thưa, đầu dựng dày để rõ nét mặt
// Đầu được tạc ở hệ tọa độ riêng (HEAD_SRC) rồi thu nhỏ HEAD_S lần, đặt lên cổ tại HEAD_DST
const HEAD_SRC = [0, 2.3, 0], HEAD_DST = [0, 2.38, 0.02], HEAD_S = 0.92;
const toHead = (x, y, z) => [
  (x - HEAD_DST[0]) / HEAD_S + HEAD_SRC[0], (y - HEAD_DST[1]) / HEAD_S + HEAD_SRC[1], (z - HEAD_DST[2]) / HEAD_S + HEAD_SRC[2],
];
const fromHead = (x, y, z) => [
  (x - HEAD_SRC[0]) * HEAD_S + HEAD_DST[0], (y - HEAD_SRC[1]) * HEAD_S + HEAD_DST[1], (z - HEAD_SRC[2]) * HEAD_S + HEAD_DST[2],
];

// Cổ áo hình chữ U: hai cạnh xuôi từ vai xuống, đáy cong ở giữa bụng
const U_BOTTOM = 1.55, U_R = 0.2;
function uNeck(x, y) {
  const ax = Math.abs(x);
  const dist = Math.min(
    seg2(ax, y, 0.3, 2.07, U_R, U_BOTTOM),
    y < U_BOTTOM ? Math.abs(Math.hypot(x, y - U_BOTTOM) - U_R) : 9,
  );
  const inside = y >= U_BOTTOM ? ax < U_R + ((y - U_BOTTOM) / 0.52) * 0.1 : Math.hypot(x, y - U_BOTTOM) < U_R;
  return inside ? -dist : dist; // âm = bên trong chữ U
}

// Áo cà sa phủ hai vai, áo lót buộc ngang bụng; mọi chuyển tiếp đều mềm để không gãy bề mặt
function robe(x, y, z) {
  if (y > 2.15) return 0;
  const ax = Math.abs(x);
  const front = smooth(0.0, 0.14, z);
  const u = y > 1.25 && y < 2.12 ? uNeck(x, y) : 9;
  const inU = smooth(0.0, -0.03, u) * front;
  // da ngực trong chữ U (trên mép áo lót)
  const skin = inU * smooth(1.44, 1.5, y);
  // nếp dọc dài trên thân áo
  const torso = 0.01 * Math.sin(x * 15 + Math.sin(y * 3) * 1.5) * smooth(1.15, 1.35, y) * smooth(2.12, 1.9, y);
  // tay áo rộng: nếp dọc chạy từ vai xuống
  const sleeve = 0.016 * Math.sin(z * 22 + ax * 9 + y * 1.2) * smooth(0.52, 0.7, ax) * smooth(1.0, 1.2, y) * smooth(1.95, 1.75, y);
  // nếp cong đồng tâm trên chân, tránh vùng bàn tay
  const hands = Math.exp(-((x / 0.38) ** 2 + ((z - 0.54) / 0.24) ** 2 + ((y - 1.26) / 0.12) ** 2));
  const r = Math.hypot(x * 0.8, z - 0.55);
  const legs = 0.017 * Math.sin(r * 24) * smooth(0.72, 0.95, y) * smooth(1.26, 1.1, y) * (1 - hands);
  // vạt áo rủ xuống tòa sen: mép gợn sóng
  const hem = 0.03 * Math.sin(x * 10) * smooth(0.92, 0.74, y) * smooth(0.2, 0.42, z);
  // áo lót trong chữ U: nếp ngang nhỏ
  const under = 0.006 * Math.sin(y * 70) * inU * smooth(1.48, 1.42, y);
  let f = (torso + sleeve + legs + hem) * (1 - inU) + under;
  // mép áo dày cuộn dọc theo chữ U (gờ tròn ngay bên ngoài chữ U)
  if (u < 0.18) f += 0.042 * Math.exp(-(((u - 0.055) / 0.045) ** 2)) * front;
  // mép áo lót ngang bụng
  f += 0.022 * Math.exp(-(((y - 1.46) / 0.022) ** 2)) * inU;
  return skin > 0.99 ? 0 : -f * (1 - skin);
}

function body(x, y, z) {
  // hai chân xếp kiết già, phủ áo
  let d = ell(x, y, z, 0, 0.9, 0.15, 1.05, 0.22, 0.64);
  d = smin(d, cone(x, y, z, [-0.86, 0.96, 0.3], [0.38, 0.99, 0.62], 0.17, 0.12), 0.14);
  d = smin(d, cone(x, y, z, [0.86, 0.93, 0.28], [-0.38, 0.94, 0.57], 0.17, 0.12), 0.14);
  for (const s of [-1, 1]) d = smin(d, sph(x, y, z, s * 0.95, 0.95, 0.32, 0.21), 0.14); // đầu gối
  // vạt áo phủ xuống mép tòa sen phía trước
  d = smin(d, ell(x, y, z, 0, 0.8, 0.45, 0.98, 0.13, 0.42), 0.14);
  // hông, bụng, ngực — thân cao
  d = smin(d, ell(x, y, z, 0, 1.18, 0.0, 0.58, 0.3, 0.42), 0.15);
  d = smin(d, ell(x, y, z, 0, 1.42, 0.05, 0.5, 0.32, 0.37), 0.12);
  d = smin(d, ell(x, y, z, 0, 1.76, 0.02, 0.6, 0.42, 0.37), 0.14);
  // vai rộng, xuôi tròn
  d = smin(d, ell(x, y, z, 0, 2.02, -0.03, 0.55, 0.17, 0.28), 0.14);
  for (const s of [-1, 1]) {
    d = smin(d, sph(x, y, z, s * 0.64, 1.95, -0.03, 0.2), 0.14);
    // cánh tay, cẳng tay
    d = smin(d, cone(x, y, z, [s * 0.68, 1.95, -0.03], [s * 0.8, 1.4, 0.08], 0.18, 0.16), 0.08);
    d = smin(d, cone(x, y, z, [s * 0.8, 1.4, 0.08], [s * 0.33, 1.2, 0.47], 0.16, 0.1), 0.07);
    // tay áo rộng rủ xuống theo cánh tay
    d = smin(d, ell(x, y, z, s * 0.82, 1.3, 0.12, 0.2, 0.44, 0.32), 0.2);
  }
  // hai bàn tay kết ấn thiền định đặt nổi trên lòng: tay phải trên tay trái, hai ngón cái chạm thành vòng
  d = smin(d, ell(x, y, z, 0, 1.23, 0.55, 0.37, 0.08, 0.2), 0.05);
  d = smin(d, ell(x, y, z, 0, 1.3, 0.57, 0.32, 0.07, 0.18), 0.04);
  for (const s of [-1, 1]) {
    d = smin(d, cone(x, y, z, [s * 0.17, 1.32, 0.67], [s * 0.06, 1.41, 0.67], 0.036), 0.025);
    d = smin(d, cone(x, y, z, [s * 0.06, 1.41, 0.67], [0, 1.41, 0.67], 0.036), 0.02);
  }
  d = smin(d, NECK(x, y, z), 0.1);
  // nếp áo chỉ ảnh hưởng sát bề mặt — xa thì khỏi tính
  return Math.abs(d) < 0.07 ? d + robe(x, y, z) : d;
}

// Đầu tạc ở hệ tọa độ riêng: mặt trái xoan, má đầy, tai dài
function headRaw(x, y, z) {
  let d = ell(x, y, z, 0, 2.6, 0.02, 0.34, 0.43, 0.37);
  d = smin(d, ell(x, y, z, 0, 2.47, 0.07, 0.28, 0.25, 0.3), 0.12); // má đầy, hàm thon
  d = smin(d, ell(x, y, z, 0, 2.33, 0.24, 0.1, 0.07, 0.09), 0.09); // cằm tròn
  d = smin(d, sph(x, y, z, 0, 2.97, -0.01, 0.17), 0.05); // nhục kế tròn, tách khỏi đỉnh đầu
  for (const s of [-1, 1]) {
    d = smin(d, ell(x, y, z, s * 0.35, 2.45, -0.01, 0.055, 0.3, 0.11), 0.04); // tai dài
    d = smax(d, -ell(x, y, z, s * 0.4, 2.5, 0.0, 0.025, 0.2, 0.06), 0.02); // lòng tai
    d = smin(d, ell(x, y, z, s * 0.13, 2.612, 0.338, 0.09, 0.04, 0.038), 0.035); // mí mắt khép hờ
  }
  // sống mũi, chóp mũi
  d = smin(d, ell(x, y, z, 0, 2.56, 0.37, 0.045, 0.12, 0.06), 0.04);
  d = smin(d, ell(x, y, z, 0, 2.475, 0.385, 0.062, 0.036, 0.042), 0.03);
  // cung mày
  d = smin(d, cone(x, y, z, [-0.2, 2.7, 0.3], [0.2, 2.7, 0.3], 0.028), 0.06);
  // môi
  d = smin(d, ell(x, y, z, 0, 2.408, 0.352, 0.082, 0.026, 0.042), 0.025);
  d = smin(d, ell(x, y, z, 0, 2.368, 0.345, 0.066, 0.028, 0.042), 0.025);
  return d;
}

function head(x, y, z) {
  const [hx, hy, hz] = toHead(x, y, z);
  let d = headRaw(hx, hy, hz) * HEAD_S;
  if (Math.abs(d) < 0.025) d += faceLines(hx, hy, hz) * HEAD_S;
  return smin(d, NECK(x, y, z), 0.08);
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
// colors: { hi, deep } — màu chỗ nổi và màu kẽ lõm (mặc định vàng thếp)
export function sculpt(parts, { hi = '#f6d273', deep: deepC = '#8c5e1e', grainAmp = 0.07 } = {}) {
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
  const gold = new THREE.Color(hi).convertSRGBToLinear();
  const deep = new THREE.Color(deepC).convertSRGBToLinear();
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
    const grain = 1 - grainAmp + grainAmp * Math.sin(x * 23 + Math.sin(y * 17) * 2) * Math.sin(z * 19 + y * 7);
    const k = ao * grain;
    const m = 0.72 + 0.28 * k;
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
export function petalGeometry({ baseC = '#b8862e', tipC = '#ffe08a' } = {}) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  // cánh tròn mập
  s.bezierCurveTo(0.36, 0.0, 0.38, 0.44, 0, 0.56);
  s.bezierCurveTo(-0.38, 0.44, -0.36, 0.0, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.045, bevelSegments: 5, curveSegments: 20 });
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const base = new THREE.Color(baseC).convertSRGBToLinear();
  const tip = new THREE.Color(tipC).convertSRGBToLinear();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), x = p.getX(i);
    p.setZ(i, p.getZ(i) + 0.16 * (y / 0.56) ** 2 - 0.1 * (x / 0.36) ** 2); // uốn cong nhẹ
    const k = clamp01(y / 0.5);
    col[i * 3] = base.r + (tip.r - base.r) * k;
    col[i * 3 + 1] = base.g + (tip.g - base.g) * k;
    col[i * 3 + 2] = base.b + (tip.b - base.b) * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // gộp đỉnh trùng để đổ bóng mượt (khối đùn mặc định có pháp tuyến phẳng từng mặt)
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  const merged = mergeVertices(g, 1e-4);
  merged.computeVertexNormals();
  return merged;
}

export function makeBuddha({ quality = 'high' } = {}) {
  const g = new THREE.Group();
  const q = quality === 'high' ? 1 : 1.45; // máy yếu: lưới thưa hơn

  const gilt = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, metalness: 0.95, roughness: 0.26, envMapIntensity: 1.8 });
  const goldDeep = new THREE.MeshStandardMaterial({ color: '#e2b24c', metalness: 0.95, roughness: 0.3, envMapIntensity: 1.8 });
  const petalMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.8 });

  // Tòa sen ba tầng cánh
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.28, 0.26, 48), goldDeep);
  base.position.y = 0.13;
  g.add(base);
  const petal = petalGeometry();
  for (const [n, r, y, tilt, s, off] of [[14, 1.0, 0.1, 0.42, 1, 0], [12, 0.84, 0.28, 0.26, 0.92, 0.26], [10, 0.68, 0.42, 0.12, 0.82, 0.1]]) {
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
    { sdf: body, min: [-1.3, 0.6, -0.72], max: [1.3, SPLIT_Y, 0.95], step: 0.02 * q },
    { sdf: head, min: [-0.42, SPLIT_Y, -0.4], max: [0.42, 3.27, 0.5], step: 0.0095 * q },
  ]);
  const statue = new THREE.Mesh(geo, gilt);
  statue.castShadow = statue.receiveShadow = true;
  g.add(statue);

  // Tam đạo (ba ngấn cổ) — cũng che đường nối thân/đầu
  for (const [y, r] of [[2.22, 0.145], [2.27, 0.142], [2.32, 0.14]]) {
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
      // dò trong hệ tọa độ tạc đầu, rồi đổi sang vị trí thật trên tượng
      let t = 0;
      while (t < 0.7 && headRaw(c[0] + dx * t, c[1] + dy * t, c[2] + dz * t) < 0) t += 0.004;
      const x = c[0] + dx * t, y = c[1] + dy * t, z = c[2] + dz * t;
      const hairline = 2.76 - 0.2 * Math.max(0, -dz) - 0.04 * Math.abs(dx);
      if (y < hairline || (Math.abs(x) > 0.3 && y < 2.82)) continue;
      pts.push([...fromHead(x, y, z), dx, dy, dz]);
    }
    const curls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.026 * HEAD_S, 10, 8), goldDeep, pts.length);
    const o = new THREE.Object3D();
    pts.forEach(([x, y, z, dx, dy, dz], i) => {
      o.position.set(x - dx * 0.007, y - dy * 0.007, z - dz * 0.007);
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
  urna.position.set(...fromHead(0, 2.72, 0.395));
  g.add(urna);

  // Hào quang
  const aur = T.aureole();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false }));
  halo.position.set(0, 2.7, -0.42);
  g.add(halo);
  const big = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.9), new THREE.MeshBasicMaterial({ map: aur, transparent: true, depthWrite: false, opacity: 0.85 }));
  big.position.set(0, 1.85, -0.72);
  g.add(big);
  return g;
}
