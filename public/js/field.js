// Ruộng lúa phía đông nam sân điện Quan Âm (khu Am Mây) — dùng chung cho máy chủ và trình duyệt.
// Mỗi ô ruộng có "tuổi" (giây kể từ lúc cấy). Lúa lớn dần rồi chín; gặt xong thì cấy lại từ đầu.
export const FIELD = { x0: 27, x1: 56, z0: 44, z1: 76, cols: 4, rows: 5 };
export const PLOTS = FIELD.cols * FIELD.rows;
// mốc tuổi (giây): mạ → xanh → trổ bông → chín
export const RICE_STAGES = [90, 240, 420];
export const RIPE_AGE = RICE_STAGES[2];
export const STAGE_NAMES = ['vừa cấy, còn là mạ', 'đang xanh', 'đang trổ bông', 'đã chín vàng'];

export const riceStage = (age) => (age < RICE_STAGES[0] ? 0 : age < RICE_STAGES[1] ? 1 : age < RICE_STAGES[2] ? 2 : 3);

// hình chữ nhật của ô ruộng i (chừa bờ đất 0,7 m giữa các ô)
export function plotRect(i) {
  const w = (FIELD.x1 - FIELD.x0) / FIELD.cols, d = (FIELD.z1 - FIELD.z0) / FIELD.rows;
  const c = i % FIELD.cols, r = Math.floor(i / FIELD.cols);
  return { minX: FIELD.x0 + c * w + 0.35, maxX: FIELD.x0 + (c + 1) * w - 0.35, minZ: FIELD.z0 + r * d + 0.35, maxZ: FIELD.z0 + (r + 1) * d - 0.35 };
}
// ô ruộng tại (x, z), -1 nếu đang đứng trên bờ hoặc ngoài ruộng
export function plotAt(x, z) {
  for (let i = 0; i < PLOTS; i++) {
    const r = plotRect(i);
    if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return i;
  }
  return -1;
}
