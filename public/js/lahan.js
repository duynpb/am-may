// Tượng La Hán đá ngồi trên bệ đá — tạc bằng SDF như tượng Phật, ba tư thế khác nhau.
// Mỗi tư thế là một khuôn dùng chung, vẽ hàng loạt bằng InstancedMesh dọc hành lang.
import { sculpt, smin, sph, ell, cone } from './buddha.js';

// Phần chung: bệ đá, chân xếp bằng, thân, vai, cổ, đầu trọc, tai
function core(x, y, z) {
  let d = ell(x, y, z, 0, 0.09, 0, 0.4, 0.1, 0.33); // bệ đá
  d = smin(d, ell(x, y, z, 0, 0.24, 0.07, 0.35, 0.1, 0.24), 0.06); // chân xếp bằng
  d = smin(d, ell(x, y, z, 0, 0.5, 0, 0.21, 0.24, 0.15), 0.08); // thân
  d = smin(d, sph(x, y, z, 0, 0.44, 0.07, 0.14), 0.06); // bụng
  d = smin(d, ell(x, y, z, 0, 0.67, -0.01, 0.23, 0.07, 0.13), 0.07); // vai
  d = smin(d, cone(x, y, z, [0, 0.7, 0], [0, 0.78, 0.01], 0.06), 0.03); // cổ
  d = smin(d, sph(x, y, z, 0, 0.86, 0.01, 0.115), 0.03); // đầu trọc
  d = smin(d, ell(x, y, z, 0, 0.82, 0.06, 0.08, 0.06, 0.06), 0.03); // cằm, má
  for (const s of [-1, 1]) d = smin(d, ell(x, y, z, s * 0.115, 0.85, 0.0, 0.025, 0.045, 0.03), 0.015); // tai
  return d;
}
const arm = (x, y, z, a, b, c, r = 0.045) => Math.min(cone(x, y, z, a, b, r * 1.15, r), cone(x, y, z, b, c, r, r * 0.9));

// 0: thiền định, hai tay đặt trong lòng
function meditate(x, y, z) {
  let d = core(x, y, z);
  for (const s of [-1, 1]) d = smin(d, arm(x, y, z, [s * 0.2, 0.66, 0], [s * 0.23, 0.47, 0.06], [s * 0.05, 0.36, 0.17]), 0.04);
  return smin(d, ell(x, y, z, 0, 0.35, 0.17, 0.1, 0.04, 0.06), 0.03);
}
// 1: tay phải giơ lên trước ngực, tay trái đặt trên gối
function raised(x, y, z) {
  let d = core(x, y, z);
  d = smin(d, arm(x, y, z, [0.2, 0.66, 0], [0.24, 0.5, 0.08], [0.17, 0.72, 0.15]), 0.04);
  d = smin(d, ell(x, y, z, 0.16, 0.77, 0.16, 0.04, 0.07, 0.03), 0.02);
  d = smin(d, arm(x, y, z, [-0.2, 0.66, 0], [-0.25, 0.46, 0.05], [-0.25, 0.32, 0.2]), 0.04);
  return smin(d, ell(x, y, z, -0.25, 0.31, 0.22, 0.05, 0.035, 0.06), 0.02);
}
// 2: hai tay chống gối, ngửa mặt cười (vai rộng, bụng to)
function laughing(x, y, z) {
  let d = core(x, y, z);
  d = smin(d, sph(x, y, z, 0, 0.42, 0.11, 0.16), 0.05);
  for (const s of [-1, 1]) {
    d = smin(d, arm(x, y, z, [s * 0.21, 0.66, 0], [s * 0.3, 0.48, 0.02], [s * 0.27, 0.32, 0.17]), 0.04);
    d = smin(d, ell(x, y, z, s * 0.27, 0.31, 0.19, 0.055, 0.035, 0.06), 0.02);
  }
  return d;
}

// Trả về ba khuôn tượng (BufferGeometry có màu đỉnh). step lớn hơn → nhẹ hơn
export function makeLaHanGeometries({ step = 0.04 } = {}) {
  const box = { min: [-0.46, -0.02, -0.38], max: [0.46, 1.0, 0.4], step };
  return [meditate, raised, laughing].map((sdf) =>
    sculpt([{ sdf, ...box }], { hi: '#d3cdbf', deep: '#5f5a50', grainAmp: 0.05 }),
  );
}
