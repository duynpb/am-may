// Vị trí tượng La Hán trong hai dãy hành lang — dùng chung cho máy chủ (Node) và trình duyệt.
// Mỗi dãy hai hàng: hàng trước thấp (gần lối đi), hàng sau cao. Mã tượng cố định để mọi người
// thấy cùng một tượng bám bụi / được lau sạch, dù máy yếu chỉ dựng hàng trước.

const Z0 = 43.6 + 1.2, Z1 = 80.4 - 1.2, STEP = 1.12;
export const LAHAN_PER_ROW = Math.floor((Z1 - Z0) / STEP) + 1;

// id = ((bên * 2) + hàng) * LAHAN_PER_ROW + k; bên 0 là phía x âm, hàng 0 là hàng trước
export function lahanSpot(id) {
  const k = id % LAHAN_PER_ROW, row = Math.floor(id / LAHAN_PER_ROW) % 2, side = Math.floor(id / (2 * LAHAN_PER_ROW));
  const s = side ? 1 : -1;
  return {
    id, s, row,
    x: s * (row ? 16.95 : 15.9),
    z: Z0 + k * STEP + (row ? 0.56 : 0),
    // chỗ đứng lau tượng: trên lối đi trong hành lang, trước mặt tượng
    standX: s * 14.95,
  };
}
export const LAHAN_COUNT = 4 * LAHAN_PER_ROW;
export const LAHAN_IDS = Array.from({ length: LAHAN_COUNT }, (_, i) => i);
// Tượng bám bụi và lau được: hàng trước (với tay tới được từ lối đi), cả hai dãy
export const DUST_IDS = LAHAN_IDS.filter((id) => lahanSpot(id).row === 0);
