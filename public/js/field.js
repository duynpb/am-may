// Ruộng lúa, vườn rau và vườn cây ăn trái phía đông điện Quan Âm (khu Am Mây) — dùng chung cho máy chủ và trình duyệt.
// Mỗi ô ruộng / luống rau / cây ăn trái có "tuổi" (giây). Lớn dần rồi chín; thu hoạch xong thì mọc lại từ đầu.
export const FIELD = { x0: 27, x1: 56, z0: 44, z1: 76, cols: 4, rows: 5 };
export const PLOTS = FIELD.cols * FIELD.rows;
// mốc tuổi lúa (giây): mạ → xanh → trổ bông → chín
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

// ---------- Vườn rau kế bên ruộng lúa (8 luống rau: 2 cột × 4 hàng) ----------
export const VEG = { x0: 57.6, x1: 68.8, z0: 44, z1: 72, cols: 2, rows: 4 };
export const VEG_PLOTS = VEG.cols * VEG.rows;
export const VEG_STAGES = [20, 45, 75];
export const VEG_RIPE_AGE = VEG_STAGES[2];
export const VEG_STAGE_NAMES = ['mới gieo hạt, vừa nảy mầm', 'đang lên lá non', 'đang xanh tốt', 'đã tươi tốt, có thể hái'];
export const VEG_KINDS = [
  'rau cải xanh',
  'bắp cải',
  'cà chua',
  'rau muống',
  'bí đỏ',
  'củ cải trắng',
  'rau dền đỏ',
  'cải ngọt',
];

export const vegStage = (age) => (age < VEG_STAGES[0] ? 0 : age < VEG_STAGES[1] ? 1 : age < VEG_STAGES[2] ? 2 : 3);

// hình chữ nhật của luống rau i (chừa lối đi giữa các luống)
export function vegRect(i) {
  const w = (VEG.x1 - VEG.x0) / VEG.cols, d = (VEG.z1 - VEG.z0) / VEG.rows;
  const c = i % VEG.cols, r = Math.floor(i / VEG.cols);
  return { minX: VEG.x0 + c * w + 0.45, maxX: VEG.x0 + (c + 1) * w - 0.45, minZ: VEG.z0 + r * d + 0.5, maxZ: VEG.z0 + (r + 1) * d - 0.5 };
}
export function vegAt(x, z) {
  for (let i = 0; i < VEG_PLOTS; i++) {
    const r = vegRect(i);
    if (x >= r.minX - 0.25 && x <= r.maxX + 0.25 && z >= r.minZ - 0.25 && z <= r.maxZ + 0.25) return i;
  }
  return -1;
}

// ---------- Vườn cây ăn trái kế bên điện Quan Âm ----------
export const ORCHARD = { x0: 41, x1: 62, z0: 5, z1: 38.5 };
export const FRUIT_STAGES = [75, 180, 300];
export const FRUIT_RIPE_AGE = FRUIT_STAGES[2];
export const FRUIT_STAGE_NAMES = ['đang đơm hoa', 'đang kết trái non', 'quả đang lớn', 'quả đã chín trĩu cành'];
export const fruitStage = (age) => (age < FRUIT_STAGES[0] ? 0 : age < FRUIT_STAGES[1] ? 1 : age < FRUIT_STAGES[2] ? 2 : 3);

export const ORCHARD_TREES = [
  { x: 44.5, z: 8.5, kind: 'mango', name: 'cây xoài', fruit: 'xoài chín vàng' },
  { x: 51.5, z: 8.0, kind: 'pomelo', name: 'cây bưởi', fruit: 'bưởi thanh trà' },
  { x: 58.5, z: 9.0, kind: 'longan', name: 'cây nhãn', fruit: 'chùm nhãn lồng' },
  { x: 44.2, z: 15.2, kind: 'persimmon', name: 'cây hồng', fruit: 'hồng chín đỏ' },
  { x: 52.0, z: 14.8, kind: 'jackfruit', name: 'cây mít', fruit: 'mít mật chín thơm' },
  { x: 59.0, z: 16.0, kind: 'starfruit', name: 'cây khế', fruit: 'khế ngọt chín vàng' },
  { x: 45.5, z: 23.0, kind: 'guava', name: 'cây ổi', fruit: 'ổi đào giòn thơm' },
  { x: 58.5, z: 23.2, kind: 'banana', name: 'khóm chuối', fruit: 'nải chuối tiêu chín' },
  { x: 45.5, z: 30.8, kind: 'pomelo', name: 'cây bưởi', fruit: 'bưởi vàng trĩu quả' },
  { x: 52.8, z: 29.8, kind: 'mango', name: 'cây xoài', fruit: 'xoài cát chín thơm' },
  { x: 59.0, z: 31.0, kind: 'persimmon', name: 'cây hồng', fruit: 'hồng giòn chín đỏ' },
  { x: 49.0, z: 35.8, kind: 'starfruit', name: 'cây khế', fruit: 'khế vàng mọng nước' },
  { x: 56.5, z: 35.8, kind: 'banana', name: 'khóm chuối', fruit: 'buồng chuối chín vàng' },
];
export const ORCHARD_COUNT = ORCHARD_TREES.length;

export function orchardTreeAt(x, z, maxR = 2.2) {
  let best = -1, bestD = maxR;
  for (let i = 0; i < ORCHARD_COUNT; i++) {
    const t = ORCHARD_TREES[i];
    const d = Math.hypot(x - t.x, z - t.z);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
