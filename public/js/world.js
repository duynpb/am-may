// Dựng chánh điện: sàn, cột, mái, tượng Phật, bàn thờ, chuông trống, cảnh bên ngoài.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './textures.js';
import { karstGeometry } from './arch.js';
import { makeBuddha, swapToCarvedBuddha, CARVED, loadCarved, loadRecliningBuddha, RELIEF_NAM } from './buddha.js';
import { makeQuanAm, swapToCarvedQuanAm } from './quanam.js';
import { makeBroom } from './leaves.js';
import { makeLaHanGeometries } from './lahan.js';
import { lahanSpot, LAHAN_IDS } from './statues.js';
import { VILLAGE, VILLAGE_WALK, VILLAGE_BLOCKS, buildVillage } from './village.js';
import { STUDY, UP, isUp, toReal, buildStudy } from './study.js';
import { buildDuyenTree } from './duyen.js';
export { STUDY, UP } from './study.js';
import { FIELD, PLOTS, plotRect, riceStage, VEG, VEG_PLOTS, VEG_RIPE_AGE, vegRect, vegStage, ORCHARD, ORCHARD_TREES, ORCHARD_COUNT, fruitStage } from './field.js';

// Vùng được đi lại bên trong chánh điện
export const HALL = { minX: -13.2, maxX: 13.2, minZ: -12.8, maxZ: 17.6 };
export const BUDDHA = new THREE.Vector3(0, 4.6, -18.8);
export const ENTRANCE = new THREE.Vector3(0, 0, 17);
// Thềm đá trước chánh điện (z 19 → 21.6), bậc xuống sân (thấp hơn 0.36)
export const PORCH = { z0: 19, z1: 21.6, courtY: -0.36 };
export const COURTYARD = new THREE.Vector3(0, PORCH.courtY, 31);
// Vùng đi lại ngoài sân (ngoài chánh điện)
export const GARDEN = { minX: -16, maxX: 16, minZ: 22.4, maxZ: 39 };
// Cổng Tam Quan ở cuối trục đường chính, nhìn thẳng vào chánh điện
export const GATE = { z: 84, plazaZ: 92 };
// Hai dãy hành lang La Hán dọc hai bên trục đường (x dương và âm), nền cao hơn sân
export const CORRIDOR = { x0: 13.2, x1: 18, z0: 43.6, z1: 80.4, floor: 0.3 };
// Giếng Ngọc giữa trục đường, có sân tròn đi vòng quanh
export const WELL = { x: 0, z: 62, r: 2.7 };
// Hai sân bên chánh điện: phía tây có gác chuông (đại hồng chung), phía đông có điện Quan Âm
export const BELLTOWER = { x: -32, z: 29, r: 6.4 };
// Tầng trên gác chuông: cầu thang gỗ trong tầng dưới (phía tây) dẫn lên sàn treo đại hồng chung
export const BELL_LOFT = (() => {
  const { x, z } = BELLTOWER;
  const base = PORCH.courtY + 0.6, y = PORCH.courtY + 4.11;
  return {
    x, z, y, base,
    stair: { x0: x - 3.35, x1: x - 2.25, zTop: z - 2.2, zFoot: z + 3.9 }, // dốc từ nền đá lên sàn trên
    landing: { x0: x - 3.35, x1: x - 2.25, z0: z - 3.3, z1: z - 2.2 }, // chiếu nghỉ đầu cầu thang
    floor: { x0: x - 2.25, x1: x + 3.25, z0: z - 3.25, z1: z + 3.25 }, // sàn đi lại được
    bellR: 1.5, // không đứng dưới vành chuông
    striker: { x0: x + 1.0, x1: x + 3.6, dz: 0.55 }, // không đứng dưới chày
    foot: { x: x - 2.8, z: z + 7.5 }, // ngoài sân, trước chân cầu thang
    entry: { x: x - 2.8, z: z + 4.1 }, // bậc đầu tiên
    top: { x: x - 2.8, z: z - 2.75 }, // đầu cầu thang
    arrive: { x: x - 1.4, z: z - 2.75 }, // bước lên sàn
    pull: { x: x + 2.9, z: z + 0.95 }, // chỗ đứng nắm dây kéo chày (quay mặt vào chày)
  };
})();
// Đài thiền cao phía trước gác chuông: ba tầng đài đá cổ kính vươn cao ngắm toàn cảnh chùa, mặt trên có mái che,
// 12 bồ đoàn xếp vòng quanh đài sen để ngồi thiền
export const ZEN_LOFT = (() => {
  const x = -32, z = 54;
  const base = PORCH.courtY, y = PORCH.courtY + 9.6;
  return {
    x, z, y, base,
    stair: { x0: x - 1.4, x1: x + 1.4, zFoot: 41.6, zTop: 47.8 },
    floor: { x0: x - 5.6, x1: x + 5.6, z0: z - 5.6, z1: z + 5.6 },
    centerR: 1.35, // đài sen đá & lư trầm ở tâm đài
    orbitR: 3.1,   // vòng bồ đoàn ngồi thiền quanh đài sen
    roofH: 3.6,    // mái che: chân mái cao 3,6 m trên mặt đài
    foot: { x, z: 40.8 },   // ngoài sân, trước chân cầu thang đài thiền (đối diện gác chuông)
    entry: { x, z: 41.8 },  // bậc đầu tiên
    top: { x, z: 47.9 },    // đầu cầu thang
    arrive: { x, z: 49.4 }, // bước lên mặt đài thiền
  };
})();
// Khu tượng Phật nằm ngoài trời phía tây (bên trái) chánh điện: tượng chạm đá trắng dài 15 m tựa vách núi,
// bệ đá, sân lát đá phía trước có lư hương; mặt tượng nhìn về phía nam (ra sân trước)
export const NGOA = (() => {
  // Tượng nằm dọc theo chánh điện (chiều dài theo hướng bắc nam), mặt tượng quay về phía chánh điện (hướng đông).
  // Toạ độ "tại chỗ": lx dọc thân tượng (lx âm là phía đầu), lz hướng ra trước mặt tượng; quay ry = 90° ra toạ độ chùa.
  const x = -34, z = -4, len = 15, S = len / RELIEF_NAM.length, D = RELIEF_NAM.depth * S;
  const plinthH = 0.7, ry = Math.PI / 2;
  const toW = (lx, lz) => ({ x: x + lz, z: z - lx });
  const court = { x0: x + D / 2 + 1.6, x1: x + D / 2 + 9.6, z0: z - len / 2 - 1, z1: z + len / 2 + 1 };
  const hw = toW(-0.73 * S, 0.1 * S);
  return {
    x, z, len, S, D, plinthH, ry, toW,
    back: x - D / 2, front: x + D / 2, // theo trục x của chùa
    head: new THREE.Vector3(hw.x, PORCH.courtY + plinthH + 0.6 * S, hw.z),
    burner: toW(0, D / 2 + 4.5),
    court,
  };
})();
export const QAHALL = { x0: 25, x1: 39, z0: 5, z1: 17, cx: 32 };
// Kênh nước: từ hai hồ dưới chân hai thác điện Tam Thế, chảy vòng hai bên khuôn viên chùa rồi đổ ra sông phía nam.
// Mỗi kênh là đường gấp khúc (x, z), bo tròn ở góc; rộng 3 m, có bờ đá hai bên.
export const CANALS = [
  { w: 3, path: [[-22.8, -45.6], [-44, -45.6], [-47.5, -42], [-47.5, 116]] },
  { w: 3, path: [[22.8, -45.6], [72.5, -45.6], [76, -42], [76, 138]] },
];
// Cầu đá vòm bắc qua sông trên trục chính (nối sân trước cổng Tam Quan sang khu mới bên kia sông)
export const BRIDGE = { z0: 119, z1: 145, zc: 132, half: 1.9, rise: 2.2 };
export const bridgeRise = (z) => Math.max(0, BRIDGE.rise * Math.cos(((z - BRIDGE.zc) / (BRIDGE.z1 - BRIDGE.zc)) * (Math.PI / 2)));
export const NEWZONE = { x0: -13, x1: 13, z0: 145, z1: 158 }; // sân đá bên kia sông, chỗ khởi đầu khu mới
// Núi đá phía đông kênh, sát bờ sông: đỉnh bằng có sàn đá bát giác chìa ra ngoài vách, tháp ba tầng ở giữa;
// cầu thang đá uốn lượn vòng quanh vách núi từ chân lên đỉnh (0,9 vòng). Toạ độ góc: x = cos, z = sin.
export const PEAK = (() => {
  const x = 106.5, z = 118.6, r = 15, h = 34;
  const prof = [[1, 0], [1.02, 0.18], [0.96, 0.38], [0.92, 0.55], [0.85, 0.72], [0.76, 0.86], [0.68, 0.95], [0.64, 1.0]];
  // bán kính vách núi ở độ cao y (thêm 6% cho phần gồ ghề)
  const rockR = (y) => {
    const t = Math.min(1, Math.max(0, y / h));
    for (let i = 1; i < prof.length; i++) {
      if (t <= prof[i][1]) {
        const [r0, y0] = prof[i - 1], [r1, y1] = prof[i];
        return r * 1.06 * (r0 + ((r1 - r0) * (t - y0)) / (y1 - y0));
      }
    }
    return r * 1.06 * prof[prof.length - 1][0];
  };
  const th0 = -Math.PI / 2, span = Math.PI * 2 * 0.9, W = 1.8, platR = 12.4;
  // điểm trên đường thang ở tham số s (0 = chân núi, 1 = đỉnh)
  const at = (s) => {
    // lên tới mặt sàn đỉnh (cao h + 0,3) ở 93% đường, đoạn cuối là lối đi bằng nối vào sàn
    const y = Math.min(h + 0.3, ((h + 0.3) * s) / 0.93);
    // luôn đi ở ngoài mép sàn đỉnh; tới cuối đường mới rẽ thẳng vào sàn qua lối chừa ở lan can
    return { th: th0 + span * s, R: Math.max(rockR(y) + 1.8, platR + 1.0), y };
  };
  const p0 = at(0), p1 = at(1);
  const end = { x: x + Math.cos(p1.th) * p1.R, z: z + Math.sin(p1.th) * p1.R };
  return {
    x, z, r, h, prof, rockR, th0, span, W, platR, at,
    top: PORCH.courtY + h + 0.3, // mặt sàn trên đỉnh
    pagodaHalf: 3.6, // nửa cạnh tầng dưới của tháp
    foot: { x: x + Math.cos(p0.th) * (p0.R + 1.6), z: z + Math.sin(p0.th) * (p0.R + 1.6) }, // chân thang, trên lối đá
    entry: { x: x + Math.cos(p1.th) * (platR - 1.6), z: z + Math.sin(p1.th) * (platR - 1.6) }, // bước vào sàn đỉnh, ngay trong lối chừa ở lan can
    lane: { x0: 68, x1: x + 1.6, z0: 99.2, z1: 102.6 }, // lối đá từ sân trước cổng sang chân núi, qua cầu nhỏ trên kênh
  };
})();
// Sau chánh điện: sân sau, bậc thang đá lên nền đồi cao 8 m, trên đó là điện Tam Thế
export const TERRACE = { x: 26, z0: -86, z1: -47.6, y: PORCH.courtY + 8 };
export const STAIRS = { x: 3.6, z0: -48, z1: -32.9 };
export const TAMTHE = { x0: -12, x1: 12, z0: -78, z1: -66 };
// Hai thác hai bên điện Tam Thế: đổ từ vách núi xuống hồ trên nền đồi (x = ±FALLS.x)
export const FALLS = { x: 21, z: -83.8, poolZ: -81.5, poolR: 2.8 };
// Các vùng đi lại được ngoài chánh điện (hình chữ nhật). Hai vùng chồng lên nhau là đi qua lại được;
// phủ toàn bộ khuôn viên chùa để Phật tử tự do dạo bước trên sân, bãi cỏ, quanh hồ sen, vườn cây, ruộng lúa.
export const WALK_AREAS = [
  { minX: -44, maxX: 70, minZ: 22.2, maxZ: 82.6 }, // toàn bộ sân trước, bãi cỏ, quanh hồ sen, hành lang La Hán, hai sân bên, ruộng lúa, vườn rau
  { minX: -1.7, maxX: 1.7, minZ: GATE.z - 2.2, maxZ: GATE.z + 2.2 }, // lối qua cửa giữa cổng Tam Quan
  { minX: -44, maxX: -20.2, minZ: 82.0, maxZ: 86.0 }, // vòng qua đầu tường cổng phía tây
  { minX: 20.2, maxX: 70, minZ: 82.0, maxZ: 86.0 }, // vòng qua đầu tường cổng phía đông
  { minX: -44, maxX: 70, minZ: GATE.z + 1.6, maxZ: 102 }, // toàn bộ sân và bãi cỏ trước cổng Tam Quan
  { minX: -1.8, maxX: 1.8, minZ: 101, maxZ: 120 }, // lối đá xuyên ruộng ra chân cầu
  { minX: -1.5, maxX: 1.5, minZ: 119, maxZ: 146 }, // cầu đá qua sông
  { minX: -12.5, maxX: 12.5, minZ: 145.4, maxZ: 157.5 }, // sân đá bên kia sông (khu mới)
  { minX: 66, maxX: 108, minZ: 99.4, maxZ: 102.4 }, // lối đá sang chân núi đá có tháp (qua cầu nhỏ trên kênh phía đông)
  { minX: 16.0, maxX: 70, minZ: 17.2, maxZ: 23.2 }, // khoảng sân nối trước điện Quan Âm và vườn cây ăn trái
  { minX: QAHALL.x0 + 0.8, maxX: QAHALL.x1 - 0.8, minZ: 8.5, maxZ: 18.0 }, // trong điện Quan Âm
  { minX: 39.6, maxX: 70, minZ: STUDY.z1 - 0.6, maxZ: 18.0 }, // vườn cây ăn trái và bãi cỏ phía đông điện Quan Âm (tới mặt trước dãy phòng học)
  // quanh dãy phòng học: sân trước, bãi cỏ phía sau (có lầu Phật pháp), lối vòng hai đầu hồi; mỗi phòng chỉ vào từ mặt trước
  { minX: 23.6, maxX: 70, minZ: -33.2, maxZ: STUDY.z0 - 0.8 }, // bãi cỏ sau dãy phòng học
  { minX: UP.stair.x1 + 0.45, maxX: 70, minZ: -33.2, maxZ: 4.4 }, // lối vòng đầu hồi phía đông (ngoài cầu thang lên tầng 2)
  { minX: 23.6, maxX: STUDY.x0 - 0.6, minZ: -33.2, maxZ: 4.4 }, // lối vòng đầu hồi phía tây
  ...STUDY.rooms.map((r) => ({ minX: r.x0 + 0.4, maxX: r.x1 - 0.4, minZ: STUDY.z0 + 0.7, maxZ: STUDY.z1 + 0.3 })), // trong từng phòng học
  { minX: 16.0, maxX: 24.4, minZ: -33.2, maxZ: 18.0 }, // khoảng sân dọc giữa chánh điện và điện Quan Âm
  { minX: 23.6, maxX: 40.4, minZ: STUDY.z1 - 0.6, maxZ: 4.4 }, // bãi cỏ phía sau điện Quan Âm (trước dãy phòng học)
  { minX: -44, maxX: -16.0, minZ: -33.2, maxZ: 23.2 }, // toàn bộ khuôn viên phía tây chánh điện
  { minX: -44, maxX: 44, minZ: -33.2, maxZ: -25.4 }, // sân sau chánh điện
  { minX: -44, maxX: -4.2, minZ: -44.0, maxZ: -32.5 }, // bãi cỏ sau chùa phía tây bậc thang (ra chân thác dưới)
  { minX: 4.2, maxX: 44, minZ: -44.0, maxZ: -32.5 }, // bãi cỏ sau chùa phía đông bậc thang (ra chân thác dưới)
  { minX: -3.2, maxX: 3.2, minZ: STAIRS.z0 - 0.3, maxZ: STAIRS.z1 + 0.4 }, // bậc thang đá lên đồi
  { minX: -25.2, maxX: 25.2, minZ: TAMTHE.z1 + 0.3, maxZ: TERRACE.z1 }, // sân trước điện Tam Thế trên đồi
  ...[-1, 1].map((s) => ({ minX: s > 0 ? 12.6 : -25.2, maxX: s > 0 ? 25.2 : -12.6, minZ: TERRACE.z0 + 1.2, maxZ: TAMTHE.z1 + 0.8 })), // hai bên điện Tam Thế, ra tới hồ thác
  { minX: -25.2, maxX: 25.2, minZ: TERRACE.z0 + 1.2, maxZ: TAMTHE.z0 - 0.6 }, // lối sau lưng điện Tam Thế trên nền đồi
  { minX: -4, maxX: 4, minZ: TAMTHE.z1 - 1.2, maxZ: TAMTHE.z1 + 0.8 }, // cửa giữa điện Tam Thế
  { minX: TAMTHE.x0 + 0.8, maxX: TAMTHE.x1 - 0.8, minZ: TAMTHE.z0 + 3.6, maxZ: TAMTHE.z1 - 0.6 }, // trong điện Tam Thế
  ...VILLAGE_WALK, // đường đất sang Làng Mây và trong làng
];
// Tháp 13 tầng phía bên kia sân, đối diện tượng Quan Âm. Mỗi tầng nhỏ và thấp dần lên trên.
const TOWER_LEVELS = Array.from({ length: 13 }, (_, i) => ({ r: 4.8 - i * 0.1, h: 2.15 - i * 0.03 }));
const TOWER_BASE = 0.24; // nền đá quanh chân tháp
export const TOWER = (() => {
  const x = -11.8, z = 30.2, plinthR = 5.8;
  let y = PORCH.courtY + TOWER_BASE;
  for (let i = 0; i < 12; i++) y += TOWER_LEVELS[i].h;
  return {
    x, z, plinthR,
    floorY: y, // đáy tầng 13
    topY: y + 0.12, // mặt sàn tầng 13
    topR: 3.15, // trong bán kính này là sàn tầng 13
    walkR: 2.5, // chỗ đi lại được trên tầng 13
    altarDx: -0.25, // phía sau (x nhỏ hơn) là bàn thờ
    door: { x: x + plinthR + 0.6, z }, // trước cửa tháp, dưới sân
    inside: { x: x + 4.15, z }, // ngưỡng cửa
    arrive: { x: x + 1.6, z }, // lên tới tầng 13 thì đứng ở đây
  };
})();

export function groundY(x, z) {
  const ax = Math.abs(x);
  // tầng 2 khu tự học (toạ độ ảo, xem study.js): mặt sàn tầng 2
  if (isUp(z)) return UP.y;
  {
    // cầu thang đá ngoài trời ở đầu hồi phía đông dãy phòng học: dốc đều lên chiếu nghỉ
    const S = UP.stair;
    if (x >= S.x0 - 0.15 && x <= S.x1 + 0.2 && z >= UP.landing.z0 - 0.2 && z <= S.zFoot + 0.3) {
      if (z <= S.zTop) return UP.y;
      return PORCH.courtY + UP.h * Math.min(1, Math.max(0, (S.zFoot - z) / (S.zFoot - S.zTop)));
    }
  }
  if (ax <= BRIDGE.half + 0.3 && z > BRIDGE.z0 && z < BRIDGE.z1) return PORCH.courtY + bridgeRise(z); // mặt cầu vòm
  {
    // núi đá có tháp: sàn trên đỉnh, cầu thang uốn quanh vách núi, cầu nhỏ qua kênh phía đông
    const dx = x - PEAK.x, dz = z - PEAK.z, d = Math.hypot(dx, dz);
    if (d < PEAK.r + 6) {
      if (d < PEAK.platR) return PEAK.top;
      const a = (((Math.atan2(dz, dx) - PEAK.th0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const s = a / PEAK.span;
      if (s <= 1) {
        const p = PEAK.at(s);
        if (Math.abs(d - p.R) <= PEAK.W / 2 + 0.45) return PORCH.courtY + p.y;
      }
    }
    if (Math.abs(x - VILLAGE.bridgeX) < 2.6 && z > VILLAGE.road.z0 - 0.2 && z < VILLAGE.road.z1 + 0.2) return PORCH.courtY + 0.3; // cầu đá nhỏ sang làng
    if (Math.abs(x - 76) < 2.6 && z > PEAK.lane.z0 - 0.2 && z < PEAK.lane.z1 + 0.2) return PORCH.courtY + 0.3; // cầu đá nhỏ qua kênh
  }
  if (z < -32.5) {
    // bậc thang: dốc đều từ sân sau lên nền đồi; nền đồi phẳng
    if (ax <= STAIRS.x && z > STAIRS.z0) return PORCH.courtY + (8 * Math.max(0, STAIRS.z1 - z)) / (STAIRS.z1 - STAIRS.z0);
    // nền điện Tam Thế cao hơn mặt nền đồi 0,21 m
    if (x > TAMTHE.x0 - 0.6 && x < TAMTHE.x1 + 0.6 && z > TAMTHE.z0 - 0.6 && z < TAMTHE.z1 + 0.6) return TERRACE.y + 0.21;
    if (ax <= TERRACE.x && z <= TERRACE.z1 && z >= TERRACE.z0) return TERRACE.y;
    return PORCH.courtY;
  }
  // nền đá cổng Tam Quan (30 × 6 m, cao 0,24 m)
  if (ax < 15 && Math.abs(z - GATE.z) < 3) return PORCH.courtY + 0.24;
  if (z > CORRIDOR.z0 && z < CORRIDOR.z1 && ax > CORRIDOR.x0 && ax < CORRIDOR.x1) return PORCH.courtY + CORRIDOR.floor;
  {
    // gác chuông: cầu thang, sàn trên, nền đá trước chân cầu thang
    const B = BELL_LOFT, S = B.stair, dx = x - B.x, dz = z - B.z;
    if (Math.abs(dx) < 4.7 && Math.abs(dz) < 4.7) {
      if (x >= S.x0 - 0.1 && x <= S.x1 + 0.05 && z > S.zTop && z < S.zFoot) return B.base + ((B.y - B.base) * (S.zFoot - z)) / (S.zFoot - S.zTop);
      if (dz > 3.9) return dz < 4.3 ? B.base : PORCH.courtY + 0.4;
      return B.y;
    }
  }
  {
    // đài thiền cao phía trước gác chuông: bậc thang đá dốc đều từ sân lên mặt đài cao 9,6 m
    const Z = ZEN_LOFT, S = Z.stair;
    if (x >= S.x0 - 0.15 && x <= S.x1 + 0.15 && z >= S.zFoot && z <= S.zTop) {
      return Z.base + ((Z.y - Z.base) * (z - S.zFoot)) / (S.zTop - S.zFoot);
    }
    if (Math.abs(x - Z.x) <= 6.2 && Math.abs(z - Z.z) <= 6.2) return Z.y;
  }
  if (z > 22 && z < 38) {
    const d = Math.hypot(x - TOWER.x, z - TOWER.z);
    if (d < TOWER.topR) return TOWER.topY;
    if (d < TOWER.plinthR) return PORCH.courtY + TOWER_BASE;
  }
  if (x > QAHALL.x0 - 0.6 && x < QAHALL.x1 + 0.6 && z > QAHALL.z0 - 0.5 && z < QAHALL.z1 + 0.9) return PORCH.courtY + 0.21; // nền và sàn điện Quan Âm
  if (x > STUDY.x0 - 0.3 && x < STUDY.x1 + 0.3 && z > STUDY.z0 - 0.3 && z < STUDY.z1 + 0.3) return PORCH.courtY + STUDY.floor; // sàn nhà tự học
  if (x > FIELD.x0 && x < FIELD.x1 && z > FIELD.z0 && z < FIELD.z1) return PORCH.courtY - 0.1; // lội xuống ruộng
  if (ax > 15.6 || z < -21.6) return PORCH.courtY; // ngoài chánh điện và thềm
  if (z <= PORCH.z1 - 0.05) return 0;
  if (z >= PORCH.z1 + 0.6) return PORCH.courtY;
  return (PORCH.courtY * (z - PORCH.z1 + 0.05)) / 0.65;
}

const SEAT_X = [-10, -7.5, -5, -2.5, 2.5, 5, 7.5, 10];
const SEAT_Z = [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5];

const rnd = (a, b) => a + Math.random() * (b - a);

export function buildWorld(renderer, { quality = 'high' } = {}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe4d9c6, 60, 230);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const updaters = [];
  const nightHooks = []; // f(night 0..1) — gọi khi đổi giờ
  const pickables = [];

  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
  // Vật liệu mặt nền dùng chung với khu Tam Chúc (xem groundMaterial trong textures.js)
  const groundMat = T.groundMaterial;
  const POFF = { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 };
  const M = {
    wood: std('#4a2d1c', { roughness: 0.7 }),
    darkWood: std('#2e1c12', { roughness: 0.75 }),
    lacquer: std('#7d2217', { roughness: 0.38 }),
    lacquerDark: std('#561710', { roughness: 0.45 }),
    gold: std('#d9a54e', { metalness: 0.9, roughness: 0.28 }),
    bronze: std('#7c5a32', { metalness: 0.8, roughness: 0.38 }),
    stone: std('#9b968c', { roughness: 0.95 }),
    plaster: std('#e6dcc8', { roughness: 0.95 }),
    mat: std('#777a6f', { roughness: 0.95 }),
    cushion: std('#b8893c', { roughness: 0.9 }),
    candle: std('#f3e8d0', { roughness: 0.6 }),
  };

  // Vật đứng yên tạo trong lúc batching = true (hoặc nhóm được đánh dấu) sẽ được gộp theo vật liệu
  // ở cuối buildWorld để giảm số lệnh vẽ — quan trọng cho điện thoại.
  let batching = false;
  const staticRoots = [];
  // Tượng nặng chỉ vẽ khi người chơi ở gần
  const lods = [];
  const lodAdd = (obj, x, z, r) => lods.push({ obj, x, z, r });
  function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, parent = scene } = {}) {
    const m = new THREE.Mesh(geo, mat);
    if (batching && parent === scene) staticRoots.push(m);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = recv;
    parent.add(m);
    return m;
  }
  const box = (w, h, d, mat, x, y, z, o) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, o);
  const cyl = (rt, rb, h, mat, x, y, z, o, seg = 24) =>
    mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, o);
  const lathe = (pts, mat, x, y, z, o) =>
    mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), 32), mat, x, y, z, o);

  // ---------- Bầu trời & cảnh ngoài ----------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(260, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#7ea7c6') },
        mid: { value: new THREE.Color('#d6e3e4') },
        bottom: { value: new THREE.Color('#efe1c4') },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
        void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, bottom, smoothstep(0.0, -0.15, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(sky);

  const ground = mesh(new THREE.PlaneGeometry(500, 500), groundMat('grass', { tile: 5, macro: 0.3, tint: '#dbe2c8' }), 0, PORCH.courtY - 0.06, 0, { cast: false });
  ground.rotation.x = -Math.PI / 2;
  ground.userData.kind = 'ground';
  pickables.push(ground);
  const court = mesh(new THREE.PlaneGeometry(34, 18), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, PORCH.courtY + 0.015, 30.5, { cast: false });
  court.rotation.x = -Math.PI / 2;
  court.userData.kind = 'ground';
  pickables.push(court);
  // lối đi lát gạch giữa sân
  const path = mesh(new THREE.PlaneGeometry(3, 17), groundMat('brick', { tile: 3, macro: 0.04, ...POFF }), 0, PORCH.courtY + 0.035, 30.6, { cast: false });
  path.rotation.x = -Math.PI / 2;
  path.userData.kind = 'ground';
  pickables.push(path);

  const ridgeColors = ['#8fa3a6', '#a8b8b6', '#c2cbc4'];
  const ridgeMats = [];
  ridgeColors.forEach((c, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: T.ridge(c, i * 1.7 + 1), transparent: true, depthWrite: false });
    ridgeMats.push(mat);
    // phông núi xa: đặt ngoài hai dòng kênh (x = -47,5 và 76) và bên kia sông, để không đè lên kênh khi nhìn từ trên cao
    const d = 125 + i * 28;
    // phía đông lùi ra sau Làng Mây
    for (const [x, z, ry] of [[246 + i * 6, 0, -Math.PI / 2], [-d, 0, Math.PI / 2], [0, d + 85, Math.PI]]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(420, 80), mat);
      p.position.set(x, 18 - i * 3, z);
      p.rotation.y = ry;
      p.renderOrder = -10 + i;
      scene.add(p);
    }
  });

  // Rừng tre hai bên (bên đông chừa chỗ cho vườn cây ăn trái kế bên điện Quan Âm)
  {
    const spots = [];
    for (let i = 0; i < 110; i++) {
      const side = i % 2 ? 1 : -1;
      // bên tây, đoạn ngang khu tượng Phật nằm: dời tre ra sau vách núi sau lưng tượng
      const zt = rnd(-42, 3), west = side < 0 && zt > NGOA.z - NGOA.len / 2 - 4 && zt < NGOA.z + NGOA.len / 2 + 4;
      spots.push(
        i < 60
          ? west ? [-rnd(50.5, 57), zt] : side > 0 && zt > STUDY.z0 - 4 && zt < STUDY.z1 + 4 ? [rnd(21.8, 27), rnd(-42, STUDY.z0 - 4)] : [side * rnd(21.8, 27), zt]
          : side < 0
            ? [-rnd(50.5, 60), rnd(-12, 41)]
            : Math.random() < 0.55
              ? // chừa chỗ cho dãy phòng học và lầu Phật pháp: tre mọc phía đông dãy phòng hoặc sau hai phòng đầu
                Math.random() < 0.5 ? [rnd(64.5, 72), rnd(-29, 2.5)] : [rnd(28.5, 40.5), rnd(-31.5, -18.6)]
              : [rnd(64.5, 72), rnd(4, 39)],
      );
    }
    for (let i = 0; i < 44; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const z = rnd(48, 82);
      // bên tây chừa khoảng trống quanh đài thiền (x = -32, z = 54) để cành lá tre không xuyên vào sàn đài
      const x = side < 0 && z < 65 ? -rnd(19.5, 21.8) : side * rnd(19.5, 26);
      spots.push([x, z]);
    }
    const stalkGeo = new THREE.CylinderGeometry(0.07, 0.1, 11, 6);
    stalkGeo.translate(0, 5.5, 0);
    const stalks = new THREE.InstancedMesh(stalkGeo, std('#7d9a4c', { roughness: 0.6 }), spots.length);
    const leafGeo = new THREE.PlaneGeometry(3, 3);
    const leafMat = new THREE.MeshStandardMaterial({
      map: T.bambooLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8,
    });
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, spots.length * 4);
    const o = new THREE.Object3D();
    let li = 0;
    spots.forEach(([x, z], i) => {
      const s = rnd(0.75, 1.15);
      o.position.set(x, PORCH.courtY - 0.05, z);
      o.rotation.set(rnd(-0.06, 0.06), 0, rnd(-0.06, 0.06));
      o.scale.set(1, s, 1);
      o.updateMatrix();
      stalks.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 4; k++) {
        o.position.set(x + rnd(-1, 1), rnd(5.5, 11) * s, z + rnd(-1, 1));
        o.rotation.set(rnd(-0.5, 0.5), rnd(0, Math.PI), rnd(-0.4, 0.4));
        o.scale.setScalar(rnd(0.8, 1.4));
        o.updateMatrix();
        leaves.setMatrixAt(li++, o.matrix);
      }
    });
    stalks.castShadow = true;
    scene.add(stalks, leaves);
    updaters.push((t) => {
      leaves.rotation.z = Math.sin(t * 0.6) * 0.004;
    });
  }

  // từ chánh điện tới hết điện Quan Âm: vật đứng yên được gộp (chuông, trống, thùng công đức, cá koi… là nhóm riêng nên không bị gộp)
  batching = true;
  // ---------- Kiến trúc chánh điện ----------
  const floorTex = T.woodFloor();
  const floor = mesh(new THREE.PlaneGeometry(30, 40), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, 0, -1, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  floor.userData.kind = 'floor';
  pickables.push(floor);

  // Thảm đỏ lối đi giữa
  box(2.2, 0.02, 30.5, std('#7a271c', { roughness: 1 }), 0, 0.018, 2.4, { cast: false });

  const wall = mesh(new THREE.PlaneGeometry(30, 10.2), std('#ffffff', { map: T.lacquerWall(), roughness: 0.5 }), 0, 5.1, -21, { cast: false });
  box(30.6, 10.4, 0.3, M.plaster, 0, 5.0, -21.2); // mặt ngoài tường hậu

  for (const side of [-1, 1]) {
    const x = side * 15;
    box(0.3, 1.3, 40, M.wood, x, 0.65, -1);
    box(0.3, 3.4, 40, M.plaster, x, 8.4, -1);
    box(0.34, 0.12, 40, M.darkWood, x, 1.36, -1);
    box(0.34, 0.16, 40, M.darkWood, x, 6.65, -1);
    for (const y of [2.6, 4.0, 5.4]) box(0.08, 0.06, 40, M.darkWood, x, y, -1);
  }
  // Song cửa (chấn song) hai bên — dùng instancing
  {
    const zs = [];
    for (let z = -20.8; z <= 18.8; z += 0.45) zs.push(z);
    const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 5.2, 0.07), M.darkWood, zs.length * 2);
    const o = new THREE.Object3D();
    let i = 0;
    for (const side of [-1, 1]) for (const z of zs) {
      o.position.set(side * 15, 4.0, z);
      o.updateMatrix();
      bars.setMatrixAt(i++, o.matrix);
    }
    bars.castShadow = true;
    scene.add(bars);
  }
  // Thềm đá + bậc tam cấp
  {
    const porchMat = std('#9d9587', { roughness: 0.92 });
    const edgeMat = std('#7d766a', { roughness: 0.95 });
    const depth = PORCH.z1 - PORCH.z0;
    const porchTop = box(30.6, 0.42, depth, porchMat, 0, -0.21, PORCH.z0 + depth / 2, { cast: false });
    porchTop.userData.kind = 'ground';
    pickables.push(porchTop);
    box(30.6, 0.06, 0.18, edgeMat, 0, -0.03, PORCH.z1 - 0.09, { cast: false });
    box(9, 0.24, 0.34, edgeMat, 0, -0.24, PORCH.z1 + 0.17);
    box(9, 0.12, 0.34, porchMat, 0, -0.30, PORCH.z1 + 0.5);
    // ranh giới gỗ giữa thềm và sàn chánh điện
    box(30.6, 0.05, 0.14, M.darkWood, 0, 0.02, PORCH.z0 + 0.04, { cast: false });
  }

  // Mặt tiền
  box(30, 3.0, 0.4, M.plaster, 0, 8.5, 19);
  box(30, 0.5, 0.5, M.darkWood, 0, 6.95, 19);

  // ---------- Mái chánh điện kiểu chùa Việt (bố cục chữ Đinh) ----------
  // Tiền đường phía trước: mái chồng diêm hai tầng, nóc chạy ngang mặt tiền, lưỡng long chầu nguyệt.
  // Chánh điện phía sau: một mái lớn. Mặt mái lõm (thoải ở diềm, dốc dần lên nóc), bốn góc đầu đao cong vút.
  const roofTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#6e3524';
    g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 16) {
      g.fillStyle = 'rgba(255,190,150,0.10)';
      g.fillRect(0, y, 128, 5); // mép viên ngói
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(0, y + 14, 128, 2);
    }
    for (let x = 0; x < 128; x += 16) {
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(x, 0, 3, 128); // rãnh ngói âm dương
      g.fillStyle = 'rgba(255,200,160,0.08)';
      g.fillRect(x + 7, 0, 3, 128);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const roofM = std('#ffffff', { map: roofTex, roughness: 0.75, side: THREE.DoubleSide });
  const ridgeM = std('#4a2219', { roughness: 0.6 });
  const glazeM = std('#2f7a5c', { roughness: 0.35, metalness: 0.2 }); // rồng sành men xanh
  // halfX, halfZ: nửa bề ngang, nửa bề sâu ở diềm mái; shrink: mỗi phía thu vào bao nhiêu khi lên tới nóc
  function curvedRoof(cx, y0, cz, halfX, halfZ, h, shrink, { lift = 1.1 } = {}) {
    const R = 8, K = 24;
    const pos = [], uv = [];
    const ringPts = [];
    const reach = 0.42 * Math.min(halfX, halfZ);
    for (let j = 0; j <= R; j++) {
      const t = j / R, f = 1 - (1 - t) ** 2;
      const hx = halfX - shrink * f, hz = halfZ - shrink * f;
      const ring = [];
      // bốn cạnh: trước (+z), trái (-x), sau (-z), phải (+x); mỗi cạnh K đoạn
      const sides = [[[hx, hz], [-hx, hz]], [[-hx, hz], [-hx, -hz]], [[-hx, -hz], [hx, -hz]], [[hx, -hz], [hx, hz]]];
      const eaveLen = [2 * halfX, 2 * halfZ, 2 * halfX, 2 * halfZ];
      sides.forEach(([a, b], si) => {
        for (let i = 0; i <= K; i++) {
          const u = i / K;
          let x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u;
          // gần góc thì diềm mái cong vút lên và vươn ra
          const c = Math.max(0, 1 - (Math.min(u, 1 - u) * eaveLen[si]) / reach);
          const k = c * c * (1 - t) ** 2;
          const y = y0 + h * t + lift * k;
          x += Math.sign(x) * lift * 0.45 * k;
          z += Math.sign(z) * lift * 0.45 * k;
          ring.push([cx + x, y, cz + z, u * eaveLen[si] / 1.6, (t * Math.hypot(h, shrink)) / 1.2]);
        }
      });
      ringPts.push(ring);
    }
    const quad = (a, b, c2, d) => {
      for (const p of [a, b, c2, a, c2, d]) {
        pos.push(p[0], p[1], p[2]);
        uv.push(p[3], p[4]);
      }
    };
    for (let j = 0; j < R; j++) {
      for (let i = 0; i < ringPts[j].length - 1; i++) {
        if ((i + 1) % (K + 1) === 0) continue; // không nối giữa hai cạnh
        quad(ringPts[j][i], ringPts[j][i + 1], ringPts[j + 1][i + 1], ringPts[j + 1][i]);
      }
    }
    const top = ringPts[R];
    quad(top[0], top[K], top[2 * (K + 1)], top[3 * (K + 1)]); // nắp phẳng trên nóc
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    mesh(geo, roofM, 0, 0, 0);
    // bờ mái dọc bốn góc và đầu đao cuộn ở chân
    for (let s = 0; s < 4; s++) {
      const pts = ringPts.map((r) => new THREE.Vector3(r[s * (K + 1)][0], r[s * (K + 1)][1] + 0.12, r[s * (K + 1)][2]));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.13, 6), ridgeM, 0, 0, 0);
      const p0 = pts[0], d = new THREE.Vector3(Math.sign(p0.x - cx), 0, Math.sign(p0.z - cz)).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const curl = [p0, p0.clone().addScaledVector(d, 0.5).addScaledVector(up, 0.3), p0.clone().addScaledVector(d, 0.85).addScaledVector(up, 0.95), p0.clone().addScaledVector(d, 0.6).addScaledVector(up, 1.4)];
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 12, 0.11, 6), ridgeM, 0, 0, 0);
      mesh(new THREE.SphereGeometry(0.12, 8, 6), M.gold, curl[3].x, curl[3].y, curl[3].z);
    }
    // bờ nóc, hai đầu cong lên
    const rx = halfX - shrink, yTop = y0 + h;
    box(2 * rx + 0.4, 0.42, 0.42, ridgeM, cx, yTop + 0.2, cz);
    for (const s of [-1, 1]) {
      const e = new THREE.Vector3(cx + s * (rx + 0.2), yTop + 0.2, cz);
      const curl = [e, e.clone().add(new THREE.Vector3(s * 0.45, 0.25, 0)), e.clone().add(new THREE.Vector3(s * 0.6, 0.8, 0)), e.clone().add(new THREE.Vector3(s * 0.35, 1.15, 0))];
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 10, 0.16, 6), ridgeM, 0, 0, 0);
    }
    return { rx, yTop };
  }

  // chánh điện phía sau: một mái lớn
  const back = curvedRoof(0, 10.1, -7, 17.6, 16.4, 6.4, 15.9, { lift: 1.3 });
  mesh(new THREE.SphereGeometry(0.42, 14, 10), M.gold, 0, back.yTop + 0.75, -7); // bầu trên nóc
  // tiền đường: mái dưới (diềm che thềm), thân gác, mái trên
  curvedRoof(0, 9.9, 15, 19, 7, 2.0, 3.0, { lift: 1.0 });
  box(31.4, 1.8, 7.6, M.darkWood, 0, 12.75, 15);
  for (let x = -14; x <= 14; x += 2) box(1.3, 0.9, 0.06, std('#c9a46a', { roughness: 0.6 }), x, 12.75, 18.82); // ô cửa chấn song trên gác
  const front = curvedRoof(0, 13.5, 15, 17.6, 5.6, 3.8, 5.2, { lift: 1.3 });
  // lưỡng long chầu nguyệt trên bờ nóc tiền đường
  {
    const y = front.yTop + 0.42;
    mesh(new THREE.SphereGeometry(0.42, 16, 12), std('#d9542a', { emissive: '#ff7a2a', emissiveIntensity: 0.35, roughness: 0.4 }), 0, y + 0.55, 15);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const fl = mesh(new THREE.ConeGeometry(0.1, 0.42, 6), M.gold, Math.cos(a) * 0.52, y + 0.55 + Math.sin(a) * 0.52, 15);
      fl.rotation.z = a - Math.PI / 2;
    }
    for (const s of [-1, 1]) {
      const pts = [[5.6, 0.1], [4.6, 0.75], [3.6, 0.25], [2.6, 0.85], [1.6, 0.55], [1.05, 0.75]].map(([x, dy]) => new THREE.Vector3(s * x, y + dy, 15));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.17, 8), glazeM, 0, 0, 0);
      mesh(new THREE.SphereGeometry(0.27, 12, 10), glazeM, s * 0.95, y + 0.82, 15);
      const snout = mesh(new THREE.ConeGeometry(0.13, 0.4, 8), M.gold, s * 0.62, y + 0.8, 15);
      snout.rotation.z = s * Math.PI / 2; // hướng vào mặt trăng
      for (const dz of [-0.12, 0.12]) {
        const horn = mesh(new THREE.ConeGeometry(0.04, 0.32, 6), M.gold, s * 1.1, y + 1.1, 15 + dz);
        horn.rotation.z = -s * 0.6;
      }
      for (let k = 0; k < 4; k++) {
        const fin = mesh(new THREE.ConeGeometry(0.06, 0.28, 5), M.gold, s * (4.8 - k * 1.0), y + (k % 2 ? 0.5 : 1.0), 15);
        fin.rotation.z = -s * 0.3;
      }
    }
  }
  // hoành phi trước tiền đường
  box(9.4, 1.9, 0.12, M.gold, 0, 8.55, 19.25, { cast: false });
  mesh(new THREE.PlaneGeometry(9, 1.6), std('#ffffff', { map: T.boardTexture(['ĐẠI HÙNG BẢO ĐIỆN'], { w: 1536, h: 280, size: 150 }), roughness: 0.45 }), 0, 8.55, 19.32, { cast: false });
  // hàng cột son dưới hiên (chừa khoảng giữa rộng cho lối đi và chỗ để dép), xà ngang
  for (const x of [-15.1, -12.4, -9.6, 9.6, 12.4, 15.1]) {
    cyl(0.34, 0.38, 9.9, M.lacquer, x, 4.95, 21.15);
    cyl(0.55, 0.6, 0.3, M.stone, x, 0.15, 21.15);
    cyl(0.4, 0.4, 0.12, M.gold, x, 8.8, 21.15, { cast: false });
  }
  box(30.8, 0.5, 0.45, M.darkWood, 0, 9.75, 21.15);
  // bệ đá quanh nền chánh điện (lộ ra ở hai bên và phía sau)
  box(31.4, 0.42, 41.2, M.stone, 0, -0.22, -1.1, { cast: false });

  // Trần, xà, rui
  box(30.6, 0.2, 40.6, M.darkWood, 0, 10.1, -1);
  const colZ = [-18, -12, -6, 0, 6, 12, 18];
  for (const z of colZ) box(26.4, 0.55, 0.45, M.darkWood, 0, 9.55, z);
  for (const side of [-1, 1]) box(0.45, 0.55, 40, M.darkWood, side * 13, 9.55, -1);
  {
    const n = 40;
    const rafters = new THREE.InstancedMesh(new THREE.BoxGeometry(30, 0.14, 0.16), M.wood, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(0, 9.93, -20.5 + i);
      o.updateMatrix();
      rafters.setMatrixAt(i, o.matrix);
    }
    scene.add(rafters);
  }

  // Cột sơn son
  const columns = [];
  for (const side of [-1, 1]) for (const z of colZ) columns.push([side * 13, z]);
  columns.push([-9.6, -16.2], [9.6, -16.2]);
  for (const [x, z] of columns) {
    cyl(0.38, 0.42, 10, M.lacquer, x, 5, z);
    cyl(0.62, 0.68, 0.35, M.stone, x, 0.175, z);
    cyl(0.44, 0.44, 0.14, M.gold, x, 8.9, z, { cast: false });
    cyl(0.44, 0.44, 0.1, M.gold, x, 0.5, z, { cast: false });
  }

  // ---------- Bệ thờ & tượng Phật ----------
  box(18, 0.6, 5.2, M.lacquerDark, 0, 0.3, -18.4);
  box(18, 0.06, 0.05, M.gold, 0, 0.58, -15.78, { cast: false });
  box(18, 0.25, 0.5, M.wood, 0, 0.125, -15.55);
  box(5.6, 1.4, 4.2, M.lacquer, 0, 1.3, -18.8);
  box(5.8, 0.12, 4.4, M.gold, 0, 2.0, -18.8);
  box(5.8, 0.12, 4.4, M.gold, 0, 0.66, -18.8);

  const buddha = makeBuddha({ quality, style: 'thichca' }); // Thích Ca Mâu Ni, ấn xúc địa
  lodAdd(buddha, 0, -18.8, 100);
  // bản tượng nhẹ hơn (ấn thiền định) cho các tượng sao trên tháp, điện Tam Thế; máy yếu thì dùng luôn tượng chính
  const buddhaLite = quality === 'high' ? makeBuddha({ quality: 'low' }) : buddha;
  buddha.position.set(0, 2.06, -18.8);
  buddha.scale.setScalar(1.7);
  scene.add(buddha);
  // thay bằng tượng mẫu chạm khắc khi tải xong (giữ tượng dựng bằng mã nếu lỗi)
  swapToCarvedBuddha(buddha).catch((e) => console.warn('Không nạp được tượng mẫu, giữ tượng cũ', e));

  // Hoành phi & câu đối
  const boardMat = (lines, o) => std('#ffffff', { map: T.boardTexture(lines, o), roughness: 0.45 });
  box(6.7, 1.75, 0.08, M.gold, 0, 8.75, -20.95, { cast: false });
  mesh(new THREE.PlaneGeometry(6.4, 1.5), boardMat(['PHẬT TẠI TÂM']), 0, 8.75, -20.9, { cast: false });
  for (const [x, lines] of [[-4.8, ['Từ', 'Bi', 'Hỷ', 'Xả']], [4.8, ['Vô', 'Ngã', 'Vị', 'Tha']]]) {
    box(1.15, 4.7, 0.08, M.gold, x, 5.0, -20.95, { cast: false });
    mesh(new THREE.PlaneGeometry(1.0, 4.5), boardMat(lines, { w: 256, h: 1152, size: 130 }), x, 5.0, -20.9, { cast: false });
  }

  // Bàn thờ phía trước
  const TY = 1.08;
  box(5, 1.0, 1.3, M.lacquer, 0, 0.5, -14.6);
  box(5.2, 0.08, 1.45, M.lacquerDark, 0, 1.04, -14.6);
  box(5.0, 0.05, 0.02, M.gold, 0, 0.85, -13.94, { cast: false });
  box(5.0, 0.05, 0.02, M.gold, 0, 0.15, -13.94, { cast: false });

  // Lư hương + nhang + khói
  const glowTex = T.glow();
  const smokeTex = T.smoke();
  lathe([[0, 0], [0.26, 0], [0.33, 0.08], [0.36, 0.22], [0.3, 0.32], [0.34, 0.36], [0.3, 0.36]], M.bronze, 0, TY + 0.06, -14.7);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    cyl(0.03, 0.02, 0.1, M.bronze, Math.cos(a) * 0.22, TY + 0.03, -14.7 + Math.sin(a) * 0.22);
  }
  // Lư nhang: nhang cắm vào cháy ngắn dần, hết thì tàn; luôn giữ ít nhất `min` nén
  const STEM = 0.14, BODY = 0.42, MAX_STICKS = 30;
  const stemGeo = new THREE.CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0);
  const stemMat = std('#b8322a', { roughness: 0.6 });
  const bodyMat = std('#7a4a2c', { roughness: 0.9 });
  const emberGeo = new THREE.SphereGeometry(0.014, 8, 6);
  const emberMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a' });

  // center: mặt cát trong lư; spots: chỗ đứng để thắp; target: điểm người thắp hướng mặt vào khi vái
  function makeBurner({ center, radius = 0.21, spots, target, smoke = 48, min = 3 }) {
    const sticks = [];
    function addStick({ age = 0, life = rnd(170, 200), mine = false } = {}) {
      if (sticks.length >= MAX_STICKS) sticks[0].age = Math.max(sticks[0].age, sticks[0].life - 2);
      const g = new THREE.Group();
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * radius;
      g.position.set(center.x + Math.cos(a) * r, center.y, center.z + Math.sin(a) * r);
      g.rotation.set(rnd(-0.12, 0.12), rnd(0, 6), rnd(-0.12, 0.12));
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.scale.y = STEM;
      const body = new THREE.Mesh(stemGeo, bodyMat);
      body.position.y = STEM;
      const ember = new THREE.Mesh(emberGeo, emberMat);
      const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff7a30', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glowS.scale.setScalar(0.09);
      g.add(stem, body, ember, glowS);
      scene.add(g);
      sticks.push({ g, body, ember, glowS, age, life, seed: Math.random() * 9, mine });
    }
    for (let i = 0; i < min; i++) addStick({ age: rnd(20, 140) });

    const smokeParts = [];
    for (let i = 0; i < smoke; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
      s.userData = { age: Math.random() * 6, life: rnd(5, 7), seed: Math.random() * 10, tip: new THREE.Vector3(), live: false };
      scene.add(s);
      smokeParts.push(s);
    }
    updaters.push((t, dt) => {
      for (let i = sticks.length - 1; i >= 0; i--) {
        const s = sticks[i];
        s.age += dt;
        const k = s.age / s.life;
        if (k >= 1) {
          s.g.removeFromParent();
          s.glowS.material.dispose();
          sticks.splice(i, 1);
          continue;
        }
        const len = Math.max(0.001, BODY * (1 - k));
        s.body.scale.y = len;
        s.ember.position.y = s.glowS.position.y = STEM + len;
        s.glowS.scale.setScalar(0.08 * (0.8 + Math.sin(t * 3 + s.seed) * 0.2));
      }
      if (sticks.length < min) addStick();
      for (const p of smokeParts) {
        const u = p.userData;
        u.age += dt;
        if (u.age > u.life) {
          u.age = 0;
          u.seed = Math.random() * 10;
          const s = sticks[Math.floor(Math.random() * sticks.length)];
          u.live = !!s;
          if (s) s.g.localToWorld(u.tip.copy(s.ember.position));
        }
        const k = u.age / u.life;
        p.position.set(u.tip.x + Math.sin(t * 0.9 + u.seed) * 0.25 * k + Math.sin(u.seed) * 0.4 * k * k,
          u.tip.y + u.age * 0.42, u.tip.z + Math.cos(t * 0.7 + u.seed) * 0.15 * k);
        p.scale.setScalar(0.12 + k * 1.1);
        p.material.opacity = u.live ? 0.3 * Math.sin(Math.PI * k) : 0;
      }
    });
    return {
      // cắm n nén vào lư hương
      add(n = 1, { mine = false } = {}) {
        for (let i = 0; i < n; i++) addStick({ mine });
      },
      get count() {
        return sticks.length;
      },
      spots,
      target,
    };
  }
  const incense = makeBurner({
    center: new THREE.Vector3(0, TY + 0.39, -14.7),
    spots: [-1.6, -0.8, 0, 0.8, 1.6].map((x) => ({ x, z: -12.75 })),
    target: BUDDHA,
  });

  const flames = [];
  function flame(x, y, z, size = 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffb257', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(x, y, z);
    s.scale.set(0.14 * size, 0.24 * size, 1);
    s.userData.size = size;
    scene.add(s);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff3d0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    core.scale.set(0.05 * size, 0.1 * size, 1);
    core.position.set(x, y - 0.02 * size, z);
    scene.add(core);
    flames.push(s);
  }
  // Nến nhỏ trên bàn
  for (const x of [-1.95, 1.95]) {
    cyl(0.1, 0.13, 0.06, M.bronze, x, TY + 0.03, -14.75);
    cyl(0.05, 0.05, 0.28, M.candle, x, TY + 0.2, -14.75);
    flame(x, TY + 0.4, -14.75, 0.9);
  }
  // Bình sen
  for (const x of [-1.15, 1.15]) {
    lathe([[0, 0], [0.12, 0], [0.18, 0.12], [0.16, 0.3], [0.07, 0.42], [0.1, 0.5], [0.09, 0.5]],
      std('#e8eef0', { roughness: 0.25 }), x, TY, -14.85);
    for (let k = 0; k < 3; k++) {
      const ox = (k - 1) * 0.12, h = 0.5 + k * 0.08;
      cyl(0.008, 0.008, h, std('#5e7f3a'), x + ox * 0.5, TY + 0.5 + h / 2, -14.85, { cast: false }, 5).rotation.z = -ox;
      lotus(x + ox * 1.4, TY + 0.5 + h, -14.85, 0.11);
    }
  }
  function lotus(x, y, z, r) {
    const g = new THREE.Group();
    const pm = std('#f2a0b2', { roughness: 0.6 });
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Group();
        p.rotation.y = (i / 8) * Math.PI * 2 + layer * 0.4;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), pm);
        petal.scale.set(r * 0.35, r * 0.75, r * 0.14);
        petal.position.set(0, r * 0.5, r * (0.45 - layer * 0.2));
        petal.rotation.x = 0.6 - layer * 0.35;
        p.add(petal);
        g.add(p);
      }
    }
    const c = new THREE.Mesh(new THREE.SphereGeometry(r * 0.25, 10, 8), std('#f0c64e'));
    c.position.y = r * 0.45;
    g.add(c);
    g.position.set(x, y, z);
    scene.add(g);
  }
  // Mâm ngũ quả
  for (const x of [-0.6, 0.6]) {
    cyl(0.22, 0.17, 0.04, std('#d8cca5', { roughness: 0.4 }), x, TY + 0.02, -14.3);
    ['#f08a24', '#8bbd3c', '#e8c33a', '#d44f3a', '#f2a541'].forEach((c, i) => {
      const a = (i / 5) * Math.PI * 2;
      mesh(new THREE.SphereGeometry(i === 4 ? 0.08 : 0.07, 12, 10), std(c, { roughness: 0.5 }),
        x + (i === 4 ? 0 : Math.cos(a) * 0.1), TY + (i === 4 ? 0.17 : 0.1), -14.3 + (i === 4 ? 0 : Math.sin(a) * 0.1));
    });
  }
  // Đèn đứng hai bên + ánh sáng
  const candleLights = [];
  for (const x of [-3.6, 3.6]) {
    cyl(0.26, 0.32, 0.08, M.bronze, x, 0.04, -14.6);
    cyl(0.05, 0.07, 1.5, M.bronze, x, 0.8, -14.6);
    cyl(0.2, 0.1, 0.06, M.bronze, x, 1.58, -14.6);
    cyl(0.07, 0.07, 0.25, M.candle, x, 1.74, -14.6);
    flame(x, 1.97, -14.6, 1.3);
    const L = new THREE.PointLight(0xffa860, 5, 11, 2);
    L.position.set(x, 2.15, -14.4);
    scene.add(L);
    candleLights.push(L);
  }
  updaters.push((t) => {
    flames.forEach((f, i) => {
      const n = 1 + Math.sin(t * 13 + i * 2) * 0.06 + Math.sin(t * 7.3 + i) * 0.05;
      f.scale.set(0.14 * f.userData.size * n, 0.24 * f.userData.size * (2 - n), 1);
    });
    candleLights.forEach((L, i) => { L.intensity = 5 + Math.sin(t * 11 + i * 3) * 0.5 + Math.sin(t * 5.7 + i) * 0.4; });
  });

  // ---------- Chuông & trống ----------
  {
    const bell = new THREE.Group();
    bell.position.set(-11, 0, -14);
    scene.add(bell);
    for (const dx of [-0.95, 0.95]) {
      box(0.18, 3.4, 0.18, M.lacquer, dx, 1.7, 0, { parent: bell });
      box(0.5, 0.12, 0.5, M.stone, dx, 0.06, 0, { parent: bell });
    }
    box(2.4, 0.22, 0.26, M.lacquer, 0, 3.35, 0, { parent: bell });
    // Chuông treo từ điểm xoay ở xà ngang
    const b = new THREE.Group();
    b.position.set(0, 3.22, 0);
    bell.add(b);
    lathe([[0.001, 0], [0.18, 0], [0.32, -0.08], [0.4, -0.3], [0.43, -0.6], [0.46, -0.95], [0.54, -1.24], [0.56, -1.3]],
      std('#6f5a35', { metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide }), 0, 0, 0, { parent: b });
    cyl(0.04, 0.04, 0.16, M.bronze, 0, 0.06, 0, { parent: b });
    for (const y of [-0.85, -0.4]) {
      const ring = mesh(new THREE.TorusGeometry(0.43 - y * 0.03, 0.02, 6, 32), M.bronze, 0, y, 0, { parent: b });
      ring.rotation.x = Math.PI / 2;
    }
    bell.userData.kind = 'bell';
    pickables.push(bell);
    bell.userData.swing = 0;
    updaters.push((t, dt) => {
      bell.userData.swing *= Math.exp(-dt * 1.2);
      b.rotation.z = Math.sin(t * 4) * bell.userData.swing * 0.05;
    });

    const drum = new THREE.Group();
    drum.position.set(11, 0, -14);
    scene.add(drum);
    for (const dx of [-0.95, 0.95]) {
      box(0.18, 2.4, 0.18, M.lacquer, dx, 1.2, 0, { parent: drum });
      box(0.5, 0.12, 0.5, M.stone, dx, 0.06, 0, { parent: drum });
    }
    box(2.4, 0.2, 0.24, M.lacquer, 0, 2.35, 0, { parent: drum });
    const body = new THREE.Group();
    body.position.set(0, 1.55, 0);
    drum.add(body);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.9, 32, 1, true), std('#8a2418', { roughness: 0.4, side: THREE.DoubleSide }));
    shell.scale.set(1, 1, 1);
    shell.castShadow = true;
    body.add(shell);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 16), M.lacquer);
    belly.scale.set(1, 0.62, 1);
    body.add(belly);
    for (const y of [-0.45, 0.45]) {
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 32), std('#d9c49c', { roughness: 0.9 }));
      skin.position.y = y;
      body.add(skin);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.025, 6, 32), M.gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = y;
      body.add(rim);
    }
    body.rotation.x = Math.PI / 2;
    drum.userData.kind = 'drum';
    drum.userData.hit = 0;
    pickables.push(drum);
    updaters.push((t, dt) => {
      drum.userData.hit *= Math.exp(-dt * 6);
      body.scale.setScalar(1 + drum.userData.hit * 0.03 * Math.sin(t * 40));
    });
  }

  // ---------- Thùng công đức ----------
  const merit = (() => {
    const g = new THREE.Group();
    g.position.set(5.2, 0, -13.25);
    scene.add(g);
    box(1.0, 0.18, 0.7, M.darkWood, 0, 0.09, 0, { parent: g });
    box(0.9, 0.8, 0.6, M.lacquer, 0, 0.58, 0, { parent: g });
    box(0.96, 0.06, 0.66, M.gold, 0, 1.0, 0, { parent: g, cast: false });
    box(0.96, 0.05, 0.66, M.gold, 0, 0.2, 0, { parent: g, cast: false });
    box(0.36, 0.015, 0.06, new THREE.MeshStandardMaterial({ color: '#120806' }), 0, 1.035, 0.02, { parent: g, cast: false });
    const front = mesh(new THREE.PlaneGeometry(0.78, 0.5),
      std('#ffffff', { map: T.boardTexture(['CÔNG ĐỨC'], { w: 640, h: 400, size: 104 }), roughness: 0.45 }),
      0, 0.6, 0.302, { parent: g, cast: false });
    front.userData.kind = 'merit';
    g.userData.kind = 'merit';
    pickables.push(g);

    const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glowS.position.set(0, 1.1, 0);
    glowS.scale.setScalar(1.6);
    g.add(glowS);
    const slot = new THREE.Vector3(5.2, 1.05, -13.23);

    // phong bì đỏ bay từ tay vào khe thùng
    const envGeo = new THREE.BoxGeometry(0.16, 0.1, 0.012);
    const envMat = std('#c8261b', { roughness: 0.5 });
    const flying = [];
    let glowT = 0;
    updaters.push((t, dt) => {
      for (let i = flying.length - 1; i >= 0; i--) {
        const f = flying[i];
        f.t += dt;
        const k = Math.min(1, f.t / 0.75);
        f.m.position.lerpVectors(f.from, slot, k);
        f.m.position.y += Math.sin(Math.PI * k) * 0.45;
        f.m.rotation.set(-Math.PI / 2 * k, f.spin * k, 0);
        f.m.scale.setScalar(1 - 0.3 * k);
        if (k >= 1) {
          f.m.removeFromParent();
          flying.splice(i, 1);
          glowT = 1;
        }
      }
      glowT = Math.max(0, glowT - dt * 0.8);
      glowS.material.opacity = 0.7 * glowT;
    });
    return {
      spots: [-0.45, 0, 0.45].map((dx) => ({ x: 5.2 + dx, z: -12.45 })),
      center: new THREE.Vector3(5.2, 0, -13.25),
      drop(from) {
        const m = new THREE.Mesh(envGeo, envMat);
        m.position.copy(from);
        scene.add(m);
        flying.push({ m, from: from.clone(), t: 0, spin: rnd(-1, 1) });
      },
    };
  })();

  // ---------- Tiểu cảnh ngoài sân: thảm cỏ, hồ sen, đèn đá, bụi hoa ----------
  const GY = PORCH.courtY;
  const PD = { x: 10.9, z: 35.6, rx: 2.6, rz: 1.7 }; // hồ sen
  const stoneM = std('#a9a49a', { roughness: 0.95 });
  const stoneL = std('#cbc6ba', { roughness: 0.9 });
  const rockM = std('#86837a', { roughness: 1 });
  const leafM = std('#4f7a3a', { roughness: 0.9 });
  const leafD = std('#3a6130', { roughness: 0.9 });
  const obstacles = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // thảm cỏ
  const grass = mesh(new THREE.CircleGeometry(6.6, 48), groundMat('grass', { tile: 4, macro: 0.08, tint: '#f4ffe8', ...POFF }), 11.3, GY + 0.032, 31.8, { cast: false });
  grass.rotation.x = -Math.PI / 2;
  grass.userData.kind = 'ground';
  pickables.push(grass);

  // ---------- Cây đa cổ thụ (chỗ tượng Quan Âm cũ): thân nhiều gốc quấn, rễ bạnh, rễ phụ buông, tán xòe rộng ----------
  const BANYAN = { x: 10.6, z: 29.4 };
  {
    const barkM = std('#ffffff', { map: T.bark(), roughness: 0.95 });
    const P = (x, y, z) => new THREE.Vector3(BANYAN.x + x, GY + y, BANYAN.z + z);
    const UP = new THREE.Vector3(0, 1, 0);
    // ống cong thuôn dần: bán kính r0 ở đầu, r1 ở cuối
    const taper = (pts, r0, r1, seg = 8, n = 12) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, n, 1, seg, false);
      const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
      for (let i = 0; i <= n; i++) {
        curve.getPointAt(i / n, c);
        const r = r0 + (r1 - r0) * (i / n);
        for (let j = 0; j <= seg; j++) {
          const k = i * (seg + 1) + j;
          v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c);
          p.setXYZ(k, v.x, v.y, v.z);
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    // thân: lõi giữa và sáu gốc quấn xoắn vào nhau
    mesh(taper([P(0, -0.1, 0), P(0.05, 2.2, 0), P(0, 4.5, 0.05)], 0.6, 0.42, 12, 8), barkM);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rnd(-0.2, 0.2), r = rnd(0.42, 0.58);
      const pts = [];
      for (let k = 0; k <= 5; k++) {
        const t = k / 5, tw = a + t * 1.2;
        const rr = r * (1 - 0.4 * t) + 0.2 * t * t;
        pts.push(P(Math.cos(tw) * rr, -0.1 + t * 4.4, Math.sin(tw) * rr));
      }
      mesh(taper(pts, rnd(0.3, 0.38), rnd(0.2, 0.26), 9, 14), barkM);
    }
    // rễ bạnh nổi trên mặt đất, tỏa ra quanh gốc
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rnd(-0.15, 0.15), L = rnd(1.4, 2.2), bend = rnd(-0.25, 0.25);
      const pts = [0, 0.3, 0.65, 1].map((t) => {
        const aa = a + bend * t, rr = 0.45 + t * L;
        return P(Math.cos(aa) * rr, 0.75 * (1 - t) ** 2 + 0.02, Math.sin(aa) * rr);
      });
      mesh(taper(pts, rnd(0.26, 0.32), 0.04, 7, 10), barkM);
    }

    // cành lớn vươn ngang (tránh phía chánh điện), chia nhánh; ghi lại ngọn cành và chỗ buông rễ phụ
    const tips = [], hang = [];
    function limb(p0, dir, len, r, depth) {
      const pts = [p0.clone()];
      const d = dir.clone();
      let p = p0.clone();
      for (let k = 1; k <= 4; k++) {
        d.x += rnd(-0.15, 0.15);
        d.z += rnd(-0.15, 0.15);
        d.y += rnd(-0.1, 0.08);
        d.normalize();
        p = p.clone().addScaledVector(d, len / 4);
        pts.push(p);
      }
      const r1 = r * 0.55;
      mesh(taper(pts, r, r1, depth > 1 ? 9 : 6, depth > 1 ? 14 : 8), barkM);
      if (depth >= 1) for (let k = 1; k < pts.length; k++) if (Math.random() < 0.8) hang.push(pts[k].clone().lerp(pts[k - 1], Math.random()));
      tips.push(p);
      if (depth === 0) return;
      const n = depth > 1 ? 3 : 2 + (Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const nd = d.clone().applyAxisAngle(UP, rnd(-0.75, 0.75));
        nd.y += rnd(0.05, 0.3);
        limb(p, nd.normalize(), len * rnd(0.55, 0.7), r1, depth - 1);
      }
    }
    for (const a of [-0.5, 0.3, 1.0, 1.6, 2.2, 2.9, 3.65]) {
      const a2 = a + rnd(-0.12, 0.12);
      const dir = new THREE.Vector3(Math.cos(a2), rnd(0.3, 0.45), Math.sin(a2)).normalize();
      limb(P(Math.cos(a2) * 0.3, rnd(3.7, 4.4), Math.sin(a2) * 0.3), dir, rnd(3.6, 4.4), rnd(0.28, 0.34), 2);
    }

    // rễ phụ: gần gốc vài rễ to cắm xuống đất thành cột, xa hơn là chùm rễ mảnh buông lơ lửng trên đầu người
    let pillars = 0;
    for (const h of hang) {
      const dx = h.x - BANYAN.x, dz = h.z - BANYAN.z, dist = Math.hypot(dx, dz);
      if (dist < 1.0) continue;
      if (dist < 2.3 && pillars < 5 && Math.random() < 0.5) {
        pillars++;
        const top = h.y - GY;
        mesh(taper([P(dx, top, dz), P(dx + rnd(-0.1, 0.1), top * 0.5, dz + rnd(-0.1, 0.1)), P(dx + rnd(-0.15, 0.15), -0.05, dz + rnd(-0.15, 0.15))], 0.05, rnd(0.09, 0.14), 6, 6), barkM);
        continue;
      }
      for (let s = 0, n = 1 + Math.floor(rnd(0, 3)); s < n; s++) {
        const x = dx + rnd(-0.25, 0.25), z = dz + rnd(-0.25, 0.25);
        const bottom = Math.max(2.5, h.y - GY - rnd(1.2, 3.6));
        if (h.y - GY - bottom < 0.4) continue;
        mesh(taper([P(x, h.y - GY, z), P(x + rnd(-0.05, 0.05), (h.y - GY + bottom) / 2, z + rnd(-0.05, 0.05)), P(x + rnd(-0.08, 0.08), bottom, z + rnd(-0.08, 0.08))], rnd(0.02, 0.03), 0.008, 4, 5), barkM, 0, 0, 0, { cast: false });
      }
    }

    // tán lá: các chùm lá đa ở ngọn cành, thêm lá phủ kín vòm tán; lay nhẹ theo gió
    const crown = new THREE.Group();
    crown.position.set(BANYAN.x, GY, BANYAN.z);
    scene.add(crown);
    const cardMat = new THREE.MeshStandardMaterial({ map: T.banyanLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 });
    const spots = [];
    for (const t of tips) for (let k = 0; k < 4; k++) spots.push([t.x - BANYAN.x + rnd(-1, 1), t.y - GY + rnd(-0.4, 1.0), t.z - BANYAN.z + rnd(-1, 1)]);
    for (let i = 0; i < 220; i++) {
      const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 6.6;
      const x = Math.cos(a) * r, z = Math.sin(a) * r + 0.8;
      if (z < -3.2) continue; // chừa phía mái chánh điện
      spots.push([x, 6.6 + 3.0 * Math.sqrt(Math.max(0, 1 - (r / 7) ** 2)) + rnd(-0.6, 0.4), z]);
    }
    const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.3, 2.3), cardMat, spots.length);
    const o = new THREE.Object3D();
    const tint = new THREE.Color();
    spots.forEach(([x, y, z], i) => {
      o.position.set(x, y, z);
      o.rotation.set(rnd(-0.9, 0.9) - Math.PI / 2 * 0.4, rnd(0, Math.PI), rnd(-0.5, 0.5));
      o.scale.setScalar(rnd(0.85, 1.3));
      o.updateMatrix();
      cards.setMatrixAt(i, o.matrix);
      cards.setColorAt(i, tint.setHSL(0, 0, y > 8.6 ? rnd(0.95, 1.1) : rnd(0.7, 0.9))); // lá trong tán tối hơn
    });
    cards.castShadow = true;
    cards.receiveShadow = true;
    crown.add(cards);
    updaters.push((t) => {
      crown.rotation.z = Math.sin(t * 0.5) * 0.004;
      crown.rotation.x = Math.sin(t * 0.37 + 1) * 0.003;
    });
    obstacles.push({ x: BANYAN.x, z: BANYAN.z, r: 2.55 });
  }

  // hồ sen: đáy tối, mặt nước trong, viền đá, lá sen, hoa sen, non bộ, cá koi
  const pondBottom = mesh(new THREE.CircleGeometry(1, 40), std('#1a2a27', { roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), PD.x, GY + 0.042, PD.z, { cast: false });
  pondBottom.scale.set(PD.rx, PD.rz, 1);
  pondBottom.rotation.x = -Math.PI / 2;
  const water = mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({
    color: '#2e5c63', roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.78, envMapIntensity: 1.6,
  }), PD.x, GY + 0.08, PD.z, { cast: false });
  water.scale.set(PD.rx, PD.rz, 1);
  water.rotation.x = -Math.PI / 2;
  obstacles.push({ x: PD.x, z: PD.z, rx: PD.rx + 0.35, rz: PD.rz + 0.35 });
  {
    const n = 30;
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rockM, n + 4);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.05, 0.05);
      o.position.set(PD.x + Math.cos(a) * (PD.rx + 0.12), GY + 0.02, PD.z + Math.sin(a) * (PD.rz + 0.12));
      o.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
      o.scale.set(rnd(0.24, 0.38), rnd(0.14, 0.26), rnd(0.22, 0.36));
      o.updateMatrix();
      rocks.setMatrixAt(i, o.matrix);
    }
    // non bộ nhỏ giữa hồ
    [[1.1, 0.25, -0.3, 0.42, 0.7], [1.45, 0.1, -0.15, 0.3, 0.45], [0.8, 0.05, -0.55, 0.26, 0.35], [1.25, 0.6, -0.35, 0.22, 0.4]].forEach(([dx, y, dz, s, h], k) => {
      o.position.set(PD.x + dx, GY + y, PD.z + dz);
      o.rotation.set(rnd(0, 0.4), rnd(0, 3), rnd(0, 0.4));
      o.scale.set(s, h, s);
      o.updateMatrix();
      rocks.setMatrixAt(n + k, o.matrix);
    });
    rocks.castShadow = rocks.receiveShadow = true;
    scene.add(rocks);
    // cây bonsai nhỏ trên non bộ
    cyl(0.025, 0.04, 0.4, std('#5a4330'), PD.x + 1.2, GY + 1.05, PD.z - 0.35, { cast: false }, 6);
    for (const [dx, dy, dz, r] of [[0, 1.3, 0, 0.2], [0.15, 1.22, 0.08, 0.14], [-0.14, 1.2, -0.05, 0.13]]) {
      mesh(new THREE.SphereGeometry(r, 10, 8), leafD, PD.x + 1.2 + dx, GY + dy, PD.z - 0.35 + dz);
    }

    const padGeo = new THREE.CircleGeometry(0.3, 20, 0.35, Math.PI * 2 - 0.7);
    const padMat = std('#4c7a35', { roughness: 0.85, side: THREE.DoubleSide });
    const pinkM = std('#f3a3b6', { roughness: 0.6 });
    const yellowM = std('#f0c64e');
    [[-1.4, 0.4], [-0.9, -0.6], [-0.3, 0.7], [0.4, -0.2], [-1.8, -0.3], [0.2, 0.9], [-0.6, 0.1]].forEach(([dx, dz], i) => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.set(-Math.PI / 2, 0, rnd(0, 6));
      pad.position.set(PD.x + dx, GY + 0.078, PD.z + dz);
      pad.scale.setScalar(rnd(0.8, 1.3));
      scene.add(pad);
      if (i % 2 === 0) {
        // hoa sen nở trên lá
        const f = new THREE.Group();
        f.position.set(PD.x + dx + 0.08, GY + 0.08, PD.z + dz);
        for (let k = 0; k < 8; k++) {
          const p = new THREE.Group();
          p.rotation.y = (k / 8) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), pinkM);
          petal.scale.set(0.04, 0.09, 0.02);
          petal.position.set(0, 0.07, 0.05);
          petal.rotation.x = 0.55;
          p.add(petal);
          f.add(p);
        }
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), yellowM);
        c.position.y = 0.06;
        f.add(c);
        scene.add(f);
      }
    });

    // cá koi bơi vòng trong hồ
    const koiBody = new THREE.SphereGeometry(1, 12, 8);
    const koiTail = new THREE.ConeGeometry(0.05, 0.12, 6).rotateX(Math.PI / 2);
    const koi = ['#f07a2a', '#f4efe6', '#e8452c', '#f2a03a'].map((c, i) => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(koiBody, std(c, { roughness: 0.5 }));
      b.scale.set(0.055, 0.026, 0.16);
      const tail = new THREE.Mesh(koiTail, b.material);
      tail.position.z = -0.2;
      g.add(b, tail);
      g.userData = { phase: (i / 4) * Math.PI * 2, speed: rnd(0.18, 0.3) * (i % 2 ? 1 : -1), r: rnd(0.45, 0.8), tail };
      scene.add(g);
      return g;
    });
    updaters.push((t) => {
      for (const g of koi) {
        const u = g.userData;
        const a = u.phase + t * u.speed;
        const x = PD.x - 0.4 + Math.cos(a) * PD.rx * u.r * 0.7, z = PD.z + Math.sin(a) * PD.rz * u.r * 0.7;
        g.position.set(x, GY + 0.04, z);
        g.lookAt(x - Math.sin(a) * Math.sign(u.speed), GY + 0.04, z + Math.cos(a) * Math.sign(u.speed));
        u.tail.rotation.y = Math.sin(t * 8 + u.phase) * 0.4;
      }
      water.material.opacity = 0.76 + Math.sin(t * 0.8) * 0.02;
    });
  }

  // đèn đá: sáng lên về đêm
  const lampMat = std('#e9dfc6', { emissive: '#ffb860', emissiveIntensity: 0, roughness: 0.8 });
  const lampGlows = [];
  function stoneLantern(x, z) {
    const g = new THREE.Group();
    g.position.set(x, GY, z);
    scene.add(g);
    staticRoots.push(g); // phần đá được gộp, quầng sáng đèn giữ nguyên
    box(0.55, 0.12, 0.55, stoneM, 0, 0.06, 0, { parent: g });
    cyl(0.09, 0.11, 0.8, stoneL, 0, 0.52, 0, { parent: g }, 8);
    box(0.5, 0.08, 0.5, stoneM, 0, 0.96, 0, { parent: g });
    box(0.34, 0.3, 0.34, lampMat, 0, 1.15, 0, { parent: g });
    const roof = mesh(new THREE.ConeGeometry(0.44, 0.26, 4), stoneM, 0, 1.43, 0, { parent: g });
    roof.rotation.y = Math.PI / 4;
    mesh(new THREE.SphereGeometry(0.06, 8, 6), stoneM, 0, 1.6, 0, { parent: g });
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffb46a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    gl.position.y = 1.15;
    gl.scale.setScalar(1.6);
    g.add(gl);
    lampGlows.push(gl);
    obstacles.push({ x, z, r: 0.45 });
  }
  stoneLantern(7.5, 25.8);
  stoneLantern(7.3, 33.2);

  // giá chổi tre ở góc sân, cạnh thềm: chạm vào để lấy chổi quét lá
  const BROOM = new THREE.Vector3(6.1, GY, 23.35);
  {
    const woodM = std('#6b4a2e', { roughness: 0.85 });
    const g = new THREE.Group();
    g.position.copy(BROOM);
    g.userData.kind = 'broom';
    scene.add(g);
    pickables.push(g);
    for (const s of [-1, 1]) box(0.07, 1.0, 0.07, woodM, s * 0.42, 0.5, 0, { parent: g });
    box(0.96, 0.06, 0.06, woodM, 0, 0.95, 0, { parent: g });
    for (const [x, ry] of [[-0.2, 0.12], [0.16, -0.1]]) {
      const b = makeBroom();
      b.position.set(x, 0.68, 0.12);
      b.rotation.set(-0.35, ry, 0, 'YXZ');
      g.add(b);
    }
    // sọt tre đựng lá
    mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 16, 1, true), std('#a8834e', { roughness: 0.95, side: THREE.DoubleSide }), 0.78, 0.17, 0.12, { parent: g });
    cyl(0.16, 0.16, 0.02, std('#8a6a3a', { roughness: 1 }), 0.78, 0.03, 0.12, { parent: g }, 16);
    for (const [dx, dz, c] of [[-0.05, 0.02, '#c8702a'], [0.06, -0.04, '#d9a43a'], [0.0, 0.07, '#8a5a2a']]) {
      const l = mesh(new THREE.SphereGeometry(0.07, 6, 4), std(c, { roughness: 0.9 }), 0.78 + dx, 0.3, 0.12 + dz, { parent: g, cast: false });
      l.scale.set(1, 0.25, 0.6);
    }
    obstacles.push({ x: BROOM.x + 0.2, z: BROOM.z + 0.1, r: 0.75 });
  }

  // bụi cây và bồn hoa trên thảm cỏ
  const flowerColors = ['#f3a3b6', '#f6d36b', '#ffffff', '#e2534a', '#c58ae0'].map((c) => std(c, { roughness: 0.7 }));
  function bush(x, z, s = 1) {
    const was = batching;
    batching = true;
    for (let k = 0; k < 3; k++) {
      mesh(new THREE.SphereGeometry(rnd(0.38, 0.55) * s, 12, 10), k % 2 ? leafM : leafD,
        x + rnd(-0.35, 0.35) * s, GY + rnd(0.25, 0.4) * s, z + rnd(-0.35, 0.35) * s);
    }
    obstacles.push({ x, z, r: 0.7 * s });
    batching = was;
  }
  function flowers(x, z, n = 14) {
    const was = batching;
    batching = true;
    for (let k = 0; k < n; k++) {
      const a = rnd(0, 6.28), r = rnd(0, 0.55);
      mesh(new THREE.SphereGeometry(0.06, 6, 5), pick(flowerColors), x + Math.cos(a) * r, GY + rnd(0.12, 0.22), z + Math.sin(a) * r, { cast: false });
    }
    mesh(new THREE.SphereGeometry(0.42, 10, 8), leafM, x, GY + 0.05, z, { cast: false }).scale.set(1.4, 0.35, 1.4);
    batching = was;
  }
  bush(13.6, 26.0); bush(14.2, 28.3, 1.1); bush(14.1, 31.0); bush(13.4, 32.9, 0.9); bush(9.9, 26.2, 0.8);
  flowers(8.7, 26.4); flowers(8.6, 32.4); flowers(12.6, 25.4, 10); flowers(14.6, 34.4, 10);

  // cây hoa sứ (đại) cạnh hồ
  {
    const trunkM = std('#8a7a68', { roughness: 0.95 });
    const tx = 15.0, tz = 36.8;
    const curve = new THREE.CatmullRomCurve3([[0, 0, 0], [0.15, 0.9, 0.05], [0.05, 1.8, 0.2], [0.35, 2.6, 0.1]].map((p) => new THREE.Vector3(tx + p[0], GY + p[1], tz + p[2])));
    mesh(new THREE.TubeGeometry(curve, 20, 0.12, 8), trunkM);
    for (const [dx, dz] of [[-0.6, 0.3], [0.7, -0.2], [0.2, 0.7]]) {
      const c = new THREE.CatmullRomCurve3([new THREE.Vector3(tx + 0.3, GY + 2.4, tz + 0.1), new THREE.Vector3(tx + 0.3 + dx * 0.6, GY + 2.9, tz + 0.1 + dz * 0.6), new THREE.Vector3(tx + 0.3 + dx, GY + 3.2, tz + 0.1 + dz)]);
      mesh(new THREE.TubeGeometry(c, 10, 0.06, 6), trunkM);
      mesh(new THREE.SphereGeometry(0.6, 12, 10), leafM, tx + 0.3 + dx, GY + 3.35, tz + 0.1 + dz).scale.set(1, 0.6, 1);
      for (let k = 0; k < 6; k++) {
        mesh(new THREE.SphereGeometry(0.07, 6, 5), flowerColors[2], tx + 0.3 + dx + rnd(-0.45, 0.45), GY + 3.55 + rnd(-0.05, 0.1), tz + 0.1 + dz + rnd(-0.45, 0.45), { cast: false });
      }
    }
    obstacles.push({ x: tx, z: tz, r: 0.5 });
  }

  // ---------- Trục đường chính từ sân chùa ra cổng Tam Quan ----------
  {
    const roadLen = GATE.z - 3 - 39.5;
    const roadCz = 39.5 + roadLen / 2;
    const road = mesh(new THREE.PlaneGeometry(7, roadLen), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, GY + 0.015, roadCz, { cast: false });
    road.rotation.x = -Math.PI / 2;
    road.userData.kind = 'ground';
    pickables.push(road);
    // viền đá hai bên đường
    for (const s of [-1, 1]) box(0.25, 0.12, roadLen, stoneL, s * 3.62, GY + 0.06, roadCz);
    // đèn đá dọc đường (tránh sân giếng Ngọc và lối ngang sang hành lang)
    for (const z of [45, 51, 72, 77]) for (const s of [-1, 1]) stoneLantern(s * 4.6, z);
    // cây xanh hai góc sân trước cổng
    const trunkM = std('#5e4a38', { roughness: 0.9 });
    for (const [tx, tz] of [[-10, 95.5], [10, 95.5], [-10, 88.5], [10, 88.5]]) {
      mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.4, 8), trunkM, tx, GY + 1.2, tz);
      mesh(new THREE.SphereGeometry(1.5, 14, 10), leafM, tx, GY + 3.2, tz).scale.set(1, 0.8, 1);
      mesh(new THREE.SphereGeometry(1.1, 12, 9), leafD, tx + Math.sign(tx) * 0.5, GY + 3.9, tz - 0.4);
      obstacles.push({ x: tx, z: tz, r: 0.5 });
    }
    // sân trước cổng (bắt đầu từ mép nam nền cổng z = 87 để không chồng lên thềm cổng)
    const plaza = mesh(new THREE.PlaneGeometry(26, 13), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, GY + 0.015, GATE.plazaZ + 1.5, { cast: false });
    plaza.rotation.x = -Math.PI / 2;
    plaza.userData.kind = 'ground';
    pickables.push(plaza);
  }

  // ---------- Hai hồ sen giữa trục đường và hành lang ----------
  const waterM = std('#3d6a72', { roughness: 0.15, metalness: 0.1 });
  const lotusLeafM = std('#4f8a3c', { roughness: 0.7, side: THREE.DoubleSide });
  const lotusM = std('#f3a3b6', { roughness: 0.6 });
  for (const s of [-1, 1]) {
    const cx = s * 9.2, cz = 61, rx = 3.6, rz = 16;
    const rim = mesh(new THREE.CircleGeometry(1, 48), stoneL, cx, GY + 0.025, cz, { cast: false });
    rim.scale.set(rx + 0.45, rz + 0.45, 1);
    rim.rotation.x = -Math.PI / 2;
    const water = mesh(new THREE.CircleGeometry(1, 48), waterM, cx, GY + 0.045, cz, { cast: false });
    water.scale.set(rx, rz, 1);
    water.rotation.x = -Math.PI / 2;
    // lá sen và hoa sen nổi trên mặt hồ
    const n = 46;
    const leaves = new THREE.InstancedMesh(new THREE.CircleGeometry(0.42, 14, 0.35, Math.PI * 2 - 0.35).rotateX(-Math.PI / 2), lotusLeafM, n);
    const flowers = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.26, 8).translate(0, 0.13, 0), lotusM, 12);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * 0.85;
      o.position.set(cx + Math.cos(a) * r * rx, GY + 0.06, cz + Math.sin(a) * r * rz);
      o.rotation.set(0, rnd(0, 6.28), 0);
      o.scale.setScalar(rnd(0.7, 1.3));
      o.updateMatrix();
      leaves.setMatrixAt(i, o.matrix);
      if (i < 12) {
        o.position.y = GY + 0.075;
        o.scale.setScalar(rnd(0.8, 1.1));
        o.updateMatrix();
        flowers.setMatrixAt(i, o.matrix);
      }
    }
    scene.add(leaves, flowers);
    obstacles.push({ x: cx, z: cz, rx: rx + 0.55, rz: rz + 0.55 });
  }

  // ---------- Giếng Ngọc: giếng tròn lớn, thành đá có lan can, nước xanh ngọc ----------
  {
    const { x: wx, z: wz, r } = WELL;
    const disc = mesh(new THREE.CircleGeometry(5.6, 40), groundMat('tile', { tile: 3, macro: 0.04, tint: '#fbf6ec', ...POFF }), wx, GY + 0.038, wz, { cast: false });
    disc.rotation.x = -Math.PI / 2;
    disc.userData.kind = 'ground';
    pickables.push(disc);
    const jade = mesh(new THREE.CircleGeometry(r - 0.15, 40), std('#1f6a62', { roughness: 0.45, envMapIntensity: 0.4 }), wx, GY + 0.35, wz, { cast: false });
    jade.rotation.x = -Math.PI / 2;
    mesh(new THREE.CylinderGeometry(r + 0.1, r + 0.18, 0.5, 40, 1, true), stoneL, wx, GY + 0.25, wz).material.side = THREE.DoubleSide;
    mesh(new THREE.TorusGeometry(r + 0.12, 0.09, 8, 48).rotateX(Math.PI / 2), stoneM, wx, GY + 0.52, wz);
    // lan can đá: trụ nhỏ quanh thành giếng, tay vịn tròn
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      box(0.1, 0.42, 0.1, stoneL, wx + Math.cos(a) * (r + 0.12), GY + 0.74, wz + Math.sin(a) * (r + 0.12));
    }
    mesh(new THREE.TorusGeometry(r + 0.12, 0.05, 6, 48).rotateX(Math.PI / 2), stoneL, wx, GY + 0.96, wz);
    // đài sen đá giữa giếng
    cyl(0.35, 0.45, 0.3, stoneL, wx, GY + 0.45, wz);
    mesh(new THREE.SphereGeometry(0.32, 14, 10), stoneL, wx, GY + 0.72, wz).scale.y = 0.6;
    obstacles.push({ x: wx, z: wz, r: r + 0.5 });
  }

  // ---------- Hai dãy hành lang La Hán: mái ngói, cột son, tượng La Hán đá hai hàng ----------
  const lahan = new Map(); // mã tượng → { vị trí, instance, mức bụi }
  const lahanBusy = new Set(); // tượng đang đổi màu
  const sparkles = []; // ánh lấp lánh khi lau sạch
  const LAHAN_DUSTY = new THREE.Color('#8f8166'); // màu bụi phủ lên đá
  const lahanCol = new THREE.Color();
  function paintLahan(st) {
    st.inst.setColorAt(st.i, lahanCol.copy(st.clean).lerp(LAHAN_DUSTY, st.dust * 0.75));
    st.inst.instanceColor.needsUpdate = true;
  }
  {
    const C = CORRIDOR, len = C.z1 - C.z0, cz = (C.z0 + C.z1) / 2;
    const colM = std('#9c2a1c', { roughness: 0.55 });
    const tileM = std('#6a3426', { roughness: 0.75 });
    const wallM = std('#e6dcc6', { roughness: 0.9 });
    const ceilM = std('#5b3a24', { roughness: 0.7 });
    // tượng: hai hàng (hàng sau cao hơn), ba tư thế xen kẽ; máy yếu chỉ dựng hàng trước
    const geos = makeLaHanGeometries({ step: quality === 'high' ? 0.036 : 0.05 });
    const statueM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    for (const s of [-1, 1]) {
      const xFront = s * 15.9, xBack = s * 16.95;
      // nền, tường hậu, trần, mái
      box(C.x1 - C.x0, C.floor, len, stoneL, s * (C.x0 + C.x1) / 2, GY + C.floor / 2, cz);
      box(0.3, 3.2, len, wallM, s * (C.x1 - 0.15), GY + C.floor + 1.6, cz);
      box(C.x1 - C.x0 + 0.2, 0.08, len + 0.2, ceilM, s * (C.x0 + C.x1) / 2, GY + 3.42, cz, { cast: false });
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * 0.4, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), tileM);
      roof.scale.set(C.x1 - C.x0 + 1.6, 1.5, len + 1.6);
      roof.position.set(s * (C.x0 + C.x1) / 2, GY + 3.46 + 0.75, cz);
      roof.castShadow = roof.receiveShadow = true;
      scene.add(roof);
      box(0.18, 0.18, len * 0.4, colM, s * (C.x0 + C.x1) / 2, GY + 4.98, cz);
      // cột son phía trông ra hồ
      for (let z = C.z0 + 0.3; z <= C.z1 - 0.2; z += 3) cyl(0.17, 0.19, 3.1, colM, s * (C.x0 + 0.2), GY + C.floor + 1.55, z, {}, 12);
      // bậc tượng: hàng trước thấp, hàng sau cao
      box(0.9, 0.3, len - 1, stoneM, xFront, GY + C.floor + 0.15, cz);
      box(0.9, 0.75, len - 1, stoneM, xBack, GY + C.floor + 0.375, cz);
      obstacles.push(s > 0
        ? { minX: 15.4, maxX: 18.3, minZ: C.z0 - 0.2, maxZ: C.z1 + 0.2 }
        : { minX: -18.3, maxX: -15.4, minZ: C.z0 - 0.2, maxZ: C.z1 + 0.2 });
      // biển hành lang ở đầu phía sân chùa
      const bz = C.z0 - 0.05;
      box(3.0, 0.8, 0.06, M.gold, s * (C.x0 + C.x1) / 2, GY + 3.0, bz, { cast: false });
      mesh(new THREE.PlaneGeometry(2.8, 0.66), boardMat(['HÀNH LANG LA HÁN'], { w: 1024, h: 240, size: 96 }), s * (C.x0 + C.x1) / 2, GY + 3.0, bz - 0.04, { cast: false }).rotation.y = Math.PI;
    }
    // mỗi tượng có mã cố định (statues.js); máy yếu chỉ dựng hàng trước
    const spots = LAHAN_IDS.map(lahanSpot).filter((t) => quality === 'high' || t.row === 0);
    const o = new THREE.Object3D();
    geos.forEach((g, v) => {
      const mine = spots.filter((t) => (t.id + t.row) % 3 === v);
      const inst = new THREE.InstancedMesh(g, statueM, mine.length);
      mine.forEach((t, i) => {
        o.position.set(t.x, GY + C.floor + (t.row ? 0.75 : 0.3), t.z);
        o.rotation.set(0, -t.s * Math.PI / 2 + rnd(-0.12, 0.12), 0);
        o.scale.setScalar(rnd(0.95, 1.08));
        o.updateMatrix();
        inst.setMatrixAt(i, o.matrix);
        const clean = new THREE.Color().setHSL(0.1, rnd(0.02, 0.1), rnd(0.86, 1));
        lahan.set(t.id, { ...t, inst, i, clean, dust: 0, want: 0, y: GY + C.floor + (t.row ? 0.75 : 0.3) });
        inst.setColorAt(i, clean);
      });
      inst.receiveShadow = true;
      scene.add(inst);
      lodAdd(inst, 0, 62, 85);
    });
    // hộp vô hình trùm lên mỗi tượng để chạm chọn (nhẹ hơn dò cả khối tượng)
    const all = [...lahan.values()].filter((t) => t.row === 0);
    const hit = new THREE.InstancedMesh(new THREE.BoxGeometry(0.85, 1.05, 0.85).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ visible: false }), all.length);
    all.forEach((t, i) => {
      o.position.set(t.x, t.y, t.z);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      hit.setMatrixAt(i, o.matrix);
    });
    hit.userData = { kind: 'lahan', ids: all.map((t) => t.id) };
    hit.frustumCulled = false;
    scene.add(hit);
    pickables.push(hit);
    // bụi bám dần / sạch dần: đổi màu từ từ
    updaters.push((t, dt) => {
      for (const st of lahanBusy) {
        st.dust += Math.sign(st.want - st.dust) * Math.min(Math.abs(st.want - st.dust), dt * (st.want > st.dust ? 0.25 : 0.9));
        paintLahan(st);
        if (st.dust === st.want) lahanBusy.delete(st);
      }
      for (let k = sparkles.length - 1; k >= 0; k--) {
        const sp = sparkles[k];
        sp.life += dt;
        const u = sp.life / 1.6;
        sp.obj.position.y = sp.y0 + u * 0.6;
        sp.obj.material.opacity = Math.sin(Math.min(u, 1) * Math.PI) * 0.9;
        sp.obj.scale.setScalar(0.5 + u * 0.7);
        if (u >= 1) {
          sp.obj.removeFromParent();
          sp.obj.material.dispose();
          sparkles.splice(k, 1);
        }
      }
    });
  }

  // mái chữ nhật bốn mái (chóp cụt 4 cạnh: đáy w × d, đỉnh còn top, cao h), có bờ nóc và đầu đao vểnh
  function rectRoof(x, y, z, w, d, h, mat, { top = 0.45, ridge = true, tips = true, hollow = false } = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1, hollow).rotateY(Math.PI / 4), mat);
    m.scale.set(w, h, d);
    m.position.set(x, y + h / 2, z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    if (ridge) {
      box(w * top * 0.95, 0.16, 0.2, M.lacquer, x, y + h + 0.06, z);
      for (const sx of [-1, 1]) mesh(new THREE.ConeGeometry(0.1, 0.5, 6), M.gold, x + sx * w * top * 0.5, y + h + 0.2, z).rotation.z = -sx * 0.5;
    }
    if (tips) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const tip = mesh(new THREE.ConeGeometry(0.09, 0.6, 6), mat, x + sx * (w / 2 + 0.05), y + 0.14, z + sz * (d / 2 + 0.05));
        tip.rotation.set(sz * 0.7, 0, -sx * 0.7);
      }
    }
    return m;
  }
  const sideTile = std('#6a3426', { roughness: 0.75 });
  const sideCol = std('#9c2a1c', { roughness: 0.55 });
  const sideWall = std('#e6dcc6', { roughness: 0.9 });
  const pave = groundMat('tile', { tile: 4, macro: 0.05 });

  // lối đi và nền lát của hai sân bên (khớp mép với sân chính x = ±17 và sân bên x = ±21..±43 để không chồng mặt phẳng)
  for (const s of [-1, 1]) {
    const lane = mesh(new THREE.PlaneGeometry(4, 1.8), pave, s * 19, GY + 0.015, 23.5, { cast: false });
    lane.rotation.x = -Math.PI / 2;
    lane.userData.kind = 'ground';
    pickables.push(lane);
    const court = mesh(new THREE.PlaneGeometry(22, 22), pave, s * 32, GY + 0.015, 29, { cast: false });
    court.rotation.x = -Math.PI / 2;
    court.userData.kind = 'ground';
    pickables.push(court);
    // bồn cây và đèn đá quanh sân
    for (const [dx, dz] of [[-9.5, 9.5], [9.5, 9.5], [-9.5, -9.2], [9.5, -9.2]]) stoneLantern(s * 32 + dx, 29 + dz);
    bush(s * 42, 20, 0.9); bush(s * 42, 38, 0.9); bush(s * 22.5, 38.5, 0.8);
  }

  // ---------- Sau chánh điện: lối hai bên, sân sau, bậc thang đá, nền đồi ----------
  const H = TERRACE.y;
  {
    for (const s of [-1, 1]) {
      const lane = mesh(new THREE.PlaneGeometry(4, 48.6), pave, s * 19, GY + 0.015, -1.7, { cast: false });
      lane.rotation.x = -Math.PI / 2;
      lane.userData.kind = 'ground';
      pickables.push(lane);
    }
    const back = mesh(new THREE.PlaneGeometry(42, 7.2), pave, 0, GY + 0.015, -29.6, { cast: false });
    back.rotation.x = -Math.PI / 2;
    back.userData.kind = 'ground';
    pickables.push(back);
    // bậc thang đá: 24 bậc, mỗi bậc cao 1/3 m
    const n = 24, run = (STAIRS.z1 - STAIRS.z0) / n, rise = 8 / n;
    const stepM = std('#b8b1a3', { roughness: 0.95 });
    const steps = new THREE.Group();
    steps.userData.kind = 'ground';
    scene.add(steps);
    pickables.push(steps);
    for (let i = 0; i < n; i++) {
      box(STAIRS.x * 2, (i + 1) * rise, run + 0.02, stepM, 0, GY + ((i + 1) * rise) / 2, STAIRS.z1 - (i + 0.5) * run, { parent: steps });
    }
    // lan can đá dốc hai bên bậc thang, trụ đèn đá ở chân
    const L = Math.hypot(STAIRS.z1 - STAIRS.z0, 8), tilt = Math.atan2(8, STAIRS.z1 - STAIRS.z0);
    for (const s of [-1, 1]) {
      const rail = box(0.4, 0.9, L, stoneM, s * (STAIRS.x + 0.2), GY + 4 + 0.45, (STAIRS.z0 + STAIRS.z1) / 2);
      rail.rotation.x = tilt;
      stoneLantern(s * 5.2, -33.6);
    }
    // nền đồi: hai khối tường đá chắn hai bên bậc thang, khối giữa phía sau bậc trên cùng
    const retainM = std('#8f897d', { roughness: 1 });
    const dz = TERRACE.z1 - TERRACE.z0, czT = (TERRACE.z0 + TERRACE.z1) / 2;
    for (const s of [-1, 1]) {
      box(TERRACE.x - STAIRS.x, 7.96, dz, retainM, s * (STAIRS.x + TERRACE.x) / 2, GY + 3.98, czT);
      // lan can đá dọc mép nền
      box(TERRACE.x - STAIRS.x - 0.6, 0.7, 0.3, stoneL, s * (STAIRS.x + TERRACE.x) / 2 + s * 0.3, H + 0.35, TERRACE.z1 - 0.15);
    }
    box(STAIRS.x * 2, 7.96, TERRACE.z1 - 0.4 - TERRACE.z0, retainM, 0, GY + 3.98, (TERRACE.z0 + TERRACE.z1 - 0.4) / 2);
    const top = mesh(new THREE.PlaneGeometry(TERRACE.x * 2, dz), groundMat('slab', { tile: 5.5, macro: 0.05 }), 0, H + 0.015, czT, { cast: false });
    top.rotation.x = -Math.PI / 2;
    top.userData.kind = 'ground';
    pickables.push(top);
    // cây trên nền đồi (tránh hai dòng suối ở x = ±21)
    const trunkM = std('#5e4a38', { roughness: 0.9 });
    for (const [tx, tz] of [[-16, -50], [16, -50], [-24, -55], [24, -55], [-24, -68], [24, -68]]) {
      mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.6, 8), trunkM, tx, H + 1.3, tz);
      mesh(new THREE.SphereGeometry(1.6, 14, 10), leafM, tx, H + 3.4, tz).scale.set(1, 0.85, 1);
      mesh(new THREE.SphereGeometry(1.1, 12, 9), leafD, tx + 0.5, H + 4.1, tz - 0.4);
      obstacles.push({ x: tx, z: tz, r: 0.55 });
    }
  }

  // ---------- Điện Tam Thế: ba tượng Phật lớn (quá khứ, hiện tại, vị lai), mái chồng diêm ----------
  const TT = TAMTHE;
  const TT_HEAD = new THREE.Vector3(0, H + 3.0, TT.z0 + 1.6);
  let incenseTT = null;
  {
    const w = TT.x1 - TT.x0, d = TT.z1 - TT.z0, cz = (TT.z0 + TT.z1) / 2;
    box(w + 1.2, 0.2, d + 1.2, stoneL, 0, H + 0.1, cz);
    const floorT = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: floorTex, roughness: 0.55 }), 0, H + 0.21, cz, { cast: false });
    floorT.rotation.x = -Math.PI / 2;
    floorT.userData.kind = 'ground';
    pickables.push(floorT);
    box(2.4, 0.02, d - 3, std('#7a271c', { roughness: 1 }), 0, H + 0.228, cz + 1.2, { cast: false });
    box(w, 6, 0.3, sideWall, 0, H + 3.2, TT.z0 + 0.15);
    for (const sx of [-1, 1]) {
      box(0.3, 6, d, sideWall, sx * (w / 2 - 0.15), H + 3.2, cz);
      for (const wz of [TT.z0 + 3, TT.z0 + 6.5, TT.z0 + 10]) box(0.08, 1.6, 1.2, std('#2c2018', { roughness: 0.8 }), sx * (w / 2 - 0.32), H + 3.0, wz);
    }
    for (const cx of [-11.4, -8, -4.4, 4.4, 8, 11.4]) cyl(0.3, 0.33, 6, sideCol, cx, H + 3.2, TT.z1 - 0.2, {}, 12);
    box(w, 0.5, 0.4, sideCol, 0, H + 6.0, TT.z1 - 0.2);
    box(w, 0.1, d, std('#5b3a24', { roughness: 0.7 }), 0, H + 6.25, cz, { cast: false });
    rectRoof(0, H + 6.2, cz, w + 3.4, d + 3.4, 1.3, sideTile, { top: 0.66, ridge: false });
    box(w * 0.66, 1.9, d * 0.62, sideWall, 0, H + 8.4, cz);
    box(5.6, 1.15, 0.06, M.gold, 0, H + 8.4, cz + d * 0.31 + 0.02);
    mesh(new THREE.PlaneGeometry(5.4, 1.0), boardMat(['TAM THẾ ĐIỆN'], { w: 1024, h: 190, size: 110 }), 0, H + 8.4, cz + d * 0.31 + 0.06, { cast: false });
    rectRoof(0, H + 9.35, cz, w * 0.66 + 3, d * 0.62 + 3, 2.3, sideTile, { top: 0.33 });
    mesh(new THREE.SphereGeometry(0.4, 14, 10), M.gold, 0, H + 11.9, cz);
    // bàn thờ dài, ba tượng Phật chạm khắc: tượng giữa như chánh điện, hai bên một mẫu khác
    box(15, 1.2, 2.2, M.lacquer, 0, H + 0.8, TT.z0 + 1.6);
    box(15.2, 0.08, 2.4, M.gold, 0, H + 1.44, TT.z0 + 1.6, { cast: false });
    for (const x of [-4.6, 0, 4.6]) {
      const b = buddhaLite.clone();
      b.traverse((m) => (m.castShadow = false));
      lodAdd(b, x, TT.z0, 60);
      b.position.set(x, H + 1.48, TT.z0 + 1.6);
      b.scale.setScalar(1.15);
      scene.add(b);
      // tượng giữa dùng tượng chạm khắc giống chánh điện (lớn hơn), hai tượng bên dùng mẫu chạm khắc thứ hai
      const opt = x === 0 ? { url: CARVED.main, height: 3.3 } : { url: CARVED.side, height: 2.9 };
      swapToCarvedBuddha(b, { ...opt, shadow: false }).catch((e) => console.warn('Không nạp được tượng mẫu cho điện Tam Thế', e));
    }
    for (const x of [-6.8, -2.3, 2.3, 6.8]) {
      cyl(0.08, 0.1, 0.06, M.bronze, x, H + 1.51, TT.z0 + 2.5);
      cyl(0.045, 0.045, 0.26, M.candle, x, H + 1.67, TT.z0 + 2.5);
      flame(x, H + 1.88, TT.z0 + 2.5, 0.9);
    }
    // kệ lư hương giữa điện, bồ đoàn hai hàng
    box(1.0, 0.8, 0.7, M.lacquer, 0, H + 0.61, TT.z0 + 4.2);
    cyl(0.26, 0.22, 0.22, M.bronze, 0, H + 1.12, TT.z0 + 4.2);
    incenseTT = makeBurner({
      center: new THREE.Vector3(0, H + 1.2, TT.z0 + 4.2),
      radius: 0.16,
      spots: [-1, 0, 1].map((dx) => ({ x: dx, z: TT.z0 + 5.6 })),
      target: TT_HEAD,
      smoke: 26,
      min: 3,
    });
    obstacles.push(
      { minX: TT.x0 - 0.4, maxX: TT.x1 + 0.4, minZ: TT.z0 - 0.4, maxZ: TT.z0 + 3.4 },
      { minX: TT.x0 - 0.4, maxX: TT.x0 + 0.5, minZ: TT.z0 + 3.4, maxZ: TT.z1 + 0.2 },
      { minX: TT.x1 - 0.5, maxX: TT.x1 + 0.4, minZ: TT.z0 + 3.4, maxZ: TT.z1 + 0.2 },
    );
    const ttLight = new THREE.PointLight('#ffc27a', 8, 16, 2);
    ttLight.position.set(0, H + 4.6, TT.z0 + 6);
    scene.add(ttLight);
    nightHooks.push((night) => (ttLight.intensity = 8 + 26 * night));
  }

  // ---------- Gác chuông: hai tầng mái, tầng trên treo đại hồng chung, chày gỗ treo ngang ----------
  const BT = BELLTOWER;
  let greatBell = null;
  {
    const g = new THREE.Group();
    g.userData.kind = 'greatbell';
    g.position.set(BT.x, GY, BT.z);
    scene.add(g);
    pickables.push(g);
    const o = { parent: g };
    box(9.4, 0.4, 9.4, stoneL, 0, 0.2, 0, o);
    box(8.6, 0.2, 8.6, stoneM, 0, 0.5, 0, o);
    // 12 cột son quanh chu vi, cao suốt hai tầng
    for (const a of [-3.6, -1.2, 1.2, 3.6]) {
      for (const [cx, cz] of [[a, -3.6], [a, 3.6]]) cyl(0.2, 0.23, 7.2, sideCol, cx, 0.6 + 3.6, cz, o, 12);
    }
    for (const a of [-1.2, 1.2]) for (const cx of [-3.6, 3.6]) cyl(0.2, 0.23, 7.2, sideCol, cx, 0.6 + 3.6, a, o, 12);
    // sàn tầng trên (chừa lỗ cầu thang phía tây), lan can
    const L = BELL_LOFT, S = L.stair;
    const floorM = std('#5b3a24', { roughness: 0.7 });
    const hx0 = S.x0 - BT.x - 0.05, hx1 = S.x1 - BT.x, hz0 = S.zTop - BT.z, hz1 = 3.45; // lỗ cầu thang
    for (const [x0, x1, z0, z1] of [[hx1, 4.1, -4.1, 4.1], [-4.1, hx1, -4.1, hz0], [-4.1, hx0, hz0, 4.1], [hx0, hx1, hz1, 4.1]]) {
      const f = box(x1 - x0, 0.22, z1 - z0, floorM, (x0 + x1) / 2, 4.0, (z0 + z1) / 2, o);
      f.userData.kind = 'ground'; // chạm sàn thì đi tới đó
    }
    for (const sz of [-1, 1]) {
      box(8.0, 0.08, 0.08, sideCol, 0, 4.75, sz * 3.6, o);
      box(0.08, 0.08, 8.0, sideCol, sz * 3.6, 4.75, 0, o);
    }
    // lan can quanh lỗ cầu thang
    const railM = std('#7a4a2c', { roughness: 0.7 });
    box(0.07, 0.07, hz1 - hz0, railM, hx1, 4.11 + 0.75, (hz0 + hz1) / 2, o);
    box(hx1 - hx0, 0.07, 0.07, railM, (hx0 + hx1) / 2, 4.11 + 0.75, hz1, o);
    for (let zz = hz0; zz <= hz1 + 0.01; zz += (hz1 - hz0) / 6) box(0.06, 0.75, 0.06, railM, hx1, 4.11 + 0.375, zz, o);
    // cầu thang gỗ: hai tấm limon, bậc gỗ, tay vịn
    const stairM = std('#6b4329', { roughness: 0.75 });
    const run = S.zFoot - S.zTop, rise = L.y - L.base, n = 24;
    const sx = (S.x0 + S.x1) / 2 - BT.x, sw = S.x1 - S.x0;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      box(sw - 0.08, 0.05, run / n + 0.02, stairM, sx, 0.6 + rise * u - 0.02, S.zFoot - BT.z - run * u, o);
    }
    const slope = Math.atan2(rise, run), len = Math.hypot(rise, run);
    for (const side of [S.x0 - BT.x + 0.03, S.x1 - BT.x - 0.03]) {
      const st = box(0.06, 0.24, len, stairM, side, 0.6 + rise / 2 - 0.1, (S.zFoot + S.zTop) / 2 - BT.z, o);
      st.rotation.x = slope;
      const hr = box(0.05, 0.05, len, railM, side, 0.6 + rise / 2 + 0.75, (S.zFoot + S.zTop) / 2 - BT.z, o);
      hr.rotation.x = slope;
    }
    // biển gác chuông ở tầng trên, mặt trông ra sân
    box(2.6, 0.75, 0.06, M.gold, 0, 7.1, 3.72, o);
    mesh(new THREE.PlaneGeometry(2.4, 0.6), boardMat(['GÁC CHUÔNG'], { w: 1024, h: 256, size: 130 }), 0, 7.1, 3.76, o);
    // xà treo chuông
    box(5.2, 0.3, 0.3, std('#5b3a24', { roughness: 0.7 }), 0, 7.45, 0, o);
    // đại hồng chung: thân chuông đồng tiện tròn, núm treo hình rồng cách điệu
    const bellG = new THREE.Group();
    bellG.position.set(0, 7.3, 0);
    g.add(bellG);
    const prof = [[0, -2.25], [0.98, -2.25], [1.0, -2.05], [0.9, -1.8], [0.82, -1.2], [0.8, -0.4], [0.74, -0.1], [0.55, 0.04], [0, 0.06]].map(([x, y]) => new THREE.Vector2(x, y));
    const bronze = std('#6e5530', { metalness: 0.75, roughness: 0.42 });
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), bronze);
    bell.material.side = THREE.DoubleSide;
    bell.castShadow = true;
    bellG.add(bell);
    for (const y of [-0.5, -1.3, -1.95]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(y < -1.9 ? 0.95 : 0.81, 0.035, 6, 40).rotateX(Math.PI / 2), bronze);
      band.position.y = y;
      bellG.add(band);
    }
    const knob = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 8, 16), bronze);
    knob.position.y = 0.16;
    bellG.add(knob);
    // chày gỗ treo ngang bằng hai sợi thừng, chĩa vào sườn chuông
    const strikerG = new THREE.Group();
    strikerG.position.set(2.3, 7.4, 0);
    g.add(strikerG);
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.0, 12).rotateZ(Math.PI / 2), std('#8a6a44', { roughness: 0.8 }));
    log.position.y = -1.85;
    strikerG.add(log);
    const ropeM = std('#c9b07a', { roughness: 1 });
    for (const dx of [-0.6, 0.6]) {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.85, 4), ropeM);
      rope.position.set(dx, -0.92, 0);
      strikerG.add(rope);
    }
    // dây kéo buộc ở đầu chày, buông xuống chỗ người thỉnh chuông đứng
    {
      const a = new THREE.Vector3(0.6, -1.85, 0), b = new THREE.Vector3(0.6, -2.55, 0.5);
      const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, a.distanceTo(b), 5), ropeM);
      pull.position.copy(a).add(b).multiplyScalar(0.5);
      pull.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      strikerG.add(pull);
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), std('#a8443a', { roughness: 0.9 }));
      knot.position.copy(b);
      strikerG.add(knot);
    }
    // hai tầng mái (mái tầng dưới rỗng lòng và thấp hơn mặt sàn gỗ GY + 4.11 để không che sàn thỉnh chuông)
    rectRoof(BT.x, GY + 3.35, BT.z, 10.6, 10.6, 0.67, sideTile, { top: 0.76, ridge: false, hollow: true });
    rectRoof(BT.x, GY + 7.8, BT.z, 10.2, 10.2, 1.5, sideTile, { top: 0.32 });
    mesh(new THREE.SphereGeometry(0.28, 14, 10), M.gold, BT.x, GY + 9.6, BT.z);
    obstacles.push({ x: BT.x, z: BT.z, r: BT.r });
    // thỉnh chuông: chày lùi ra rồi lao vào, chuông lắc nhẹ
    const anim = { t: 99 };
    updaters.push((t, dt) => {
      anim.t += dt;
      const k = anim.t;
      // 0–0,9 s kéo chày lùi ra; 0,9–1,05 s chày lao vào chạm chuông; sau đó rung nhẹ tắt dần
      strikerG.rotation.z = k < 0.9 ? Math.sin((k / 0.9) * Math.PI * 0.5) * 0.5
        : k < 1.05 ? 0.5 * (1 - (k - 0.9) / 0.15)
          : Math.sin((k - 1.05) * 6) * 0.08 * Math.exp(-(k - 1.05) * 2);
      bellG.rotation.z = k > 1.05 ? Math.sin((k - 1.05) * 3.2) * 0.035 * Math.exp(-(k - 1.05) * 0.5) : 0;
    });
    greatBell = {
      spot: new THREE.Vector3(L.pull.x, L.y, L.pull.z), // trên gác, nắm dây kéo chày
      center: new THREE.Vector3(BT.x, GY + 6, BT.z),
      // trả về thời điểm chày chạm chuông (giây) để phát tiếng đúng lúc
      ring() {
        anim.t = 0;
        return 1.05;
      },
    };
  }

  // ---------- Đài thiền cao phía trước gác chuông: 3 tầng đài đá vươn cao ngắm toàn cảnh chùa, mái che, bồ đoàn ngồi thiền ----------
  let zenRoof = null;
  {
    const Z = ZEN_LOFT, S = Z.stair;
    const g = new THREE.Group();
    g.position.set(Z.x, GY, Z.z);
    scene.add(g);
    const o = { parent: g };
    const retainM = std('#8c8578', { roughness: 0.95 });
    const deckWoodM = std('#6a452b', { roughness: 0.72 });
    const railM = std('#7a4a2c', { roughness: 0.7 });
    const stepM = std('#b8b1a3', { roughness: 0.95 });

    // lối đá nối từ sân gác chuông (mép nam z = 40) đến chân cầu thang đài thiền
    const zenLane = mesh(new THREE.PlaneGeometry(5.2, 2.8), pave, Z.x, GY + 0.015, 41.4, { cast: false });
    zenLane.rotation.x = -Math.PI / 2;
    zenLane.userData.kind = 'ground';
    pickables.push(zenLane);
    stoneLantern(Z.x - 2.6, 41.2);
    stoneLantern(Z.x + 2.6, 41.2);

    // 3 tầng thân đài đá & cột gỗ cổ kính nâng sàn thiền hành lên độ cao 9,6 m
    // (tầng trên cùng kết thúc ở y = 9,34 m — thấp hơn đáy sàn gỗ 9,36 m để không bị trùng mặt phẳng gây nhấp nháy Z-fighting)
    const tiers = [
      { w: 15.0, h: 3.2, y0: 0, roofW: 16.2, ry: 2.65 },
      { w: 13.6, h: 3.2, y0: 3.2, roofW: 14.8, ry: 5.85 },
      { w: 12.4, h: 2.94, y0: 6.4, roofW: 13.8, ry: 9.05 },
    ];
    for (const t of tiers) {
      // khối đài đá vững chãi ở giữa (tách biệt độ cao giữa chân đế, thân và gờ đá để không trùng mặt)
      const coreH = t.h - 0.48, coreY = t.y0 + 0.26 + coreH / 2;
      box(t.w - 0.6, coreH, t.w - 0.6, retainM, 0, coreY, 0, o);
      box(t.w, 0.26, t.w, stoneL, 0, t.y0 + 0.13, 0, o);
      box(t.w + 0.2, 0.22, t.w + 0.2, stoneM, 0, t.y0 + t.h - 0.11, 0, o);
      // cột son quanh 4 mặt tầng đài
      const cOff = t.w / 2 - 0.15;
      for (const u of [-cOff, -cOff * 0.35, cOff * 0.35, cOff]) {
        for (const s of [-1, 1]) {
          cyl(0.18, 0.21, coreH, sideCol, u, coreY, s * cOff, o, 10);
          cyl(0.18, 0.21, coreH, sideCol, s * cOff, coreY, u, o, 10);
        }
      }
      // diềm mái ngói cổ truyền ở ranh giới mỗi tầng (thấp hơn mặt sàn trên cùng để không che tầm nhìn)
      rectRoof(Z.x, GY + t.ry, Z.z, t.roofW, t.roofW, 0.52, sideTile, { top: 0.82, ridge: false, hollow: true });
    }

    // mặt sàn rộng trên đỉnh đài thiền (cao 9,6 m so với mặt sân, nhìn toàn cảnh khuôn viên chùa;
    // tắt castShadow trên sàn để tránh bóng răng cưa tự đổ lên mặt sàn khi xoay góc nhìn)
    const deckW = 12.6;
    const deckFloor = box(deckW, 0.24, deckW, deckWoodM, 0, 9.6 - 0.12, 0, { parent: g, cast: false });
    deckFloor.userData.kind = 'ground';
    pickables.push(deckFloor);

    // vòng đá sáng dưới hàng bồ đoàn ngồi thiền quanh đài sen (bồ đoàn dựng chung với bồ đoàn trong các điện)
    const ringMat = stoneL.clone();
    ringMat.polygonOffset = true;
    ringMat.polygonOffsetFactor = -1;
    ringMat.polygonOffsetUnits = -2;
    const pathRing = mesh(new THREE.RingGeometry(Z.orbitR - 0.6, Z.orbitR + 0.6, 48).rotateX(-Math.PI / 2), ringMat, 0, 9.615, 0, { parent: g, cast: false });
    pathRing.userData.kind = 'ground';
    pickables.push(pathRing);

    // mái che: hàng cột son, xà, mái chồng diêm hai tầng; camera bay lên cao hơn mái thì mái mờ đi cho thấy người bên dưới
    {
      const roofG = new THREE.Group();
      roofG.position.y = 9.6;
      g.add(roofG);
      const ro = { parent: roofG };
      const RH = Z.roofH, cOff = 5.65;
      const tileM = sideTile.clone(), wallM = sideWall.clone(), goldM = M.gold.clone(), beamM = sideCol.clone();
      const fadeMats = [tileM, wallM, goldM, beamM];
      for (const m of fadeMats) m.transparent = true;
      // cột: 4 góc, giữa các cạnh đông, tây, nam; cạnh bắc chừa lối lên cầu thang
      const cols = [];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cols.push([sx * cOff, sz * cOff]);
      for (const s of [-1, 1]) cols.push([s * 1.9, cOff], [s * 2.5, -cOff], [cOff, s * 1.9], [-cOff, s * 1.9]);
      for (const [cx, cz] of cols) {
        cyl(0.17, 0.2, RH, sideCol, cx, RH / 2, cz, ro, 10);
        cyl(0.26, 0.26, 0.14, stoneM, cx, 0.07, cz, ro, 10);
      }
      // xà ngang đỡ mái
      for (const s of [-1, 1]) {
        box(cOff * 2 + 0.4, 0.3, 0.26, beamM, 0, RH - 0.15, s * cOff, ro);
        box(0.26, 0.3, cOff * 2 + 0.4, beamM, s * cOff, RH - 0.15, 0, ro);
      }
      // trần gỗ dưới mái
      const ceil = mesh(new THREE.PlaneGeometry(cOff * 2 + 0.6, cOff * 2 + 0.6).rotateX(Math.PI / 2), std('#4a2e1c', { roughness: 0.85 }), 0, RH + 0.02, 0, { parent: roofG, cast: false });
      ceil.renderOrder = 1;
      // mái dưới, thân gác nhỏ, mái trên
      const pyramid = (w, h, top) => new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).scale(w, h, w);
      const lowW = 15.4, lowH = 1.6, lowTop = 0.55;
      const low = mesh(pyramid(lowW, lowH, lowTop), tileM, 0, RH + lowH / 2, 0, ro);
      const mid = box(lowW * lowTop - 1.4, 0.9, lowW * lowTop - 1.4, wallM, 0, RH + lowH + 0.45, 0, ro);
      const upW = 9.6, upH = 2.0;
      const up = mesh(pyramid(upW, upH, 0.2), tileM, 0, RH + lowH + 0.9 + upH / 2, 0, ro);
      const ballY = RH + lowH + 0.9 + upH;
      const ball = mesh(new THREE.SphereGeometry(0.32, 14, 10), goldM, 0, ballY + 0.2, 0, ro);
      const spire = mesh(new THREE.ConeGeometry(0.12, 0.9, 8), goldM, 0, ballY + 0.75, 0, ro);
      // đầu đao cong vút ở 8 góc mái
      for (const [w, y] of [[lowW, RH], [upW, RH + lowH + 0.9]]) {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          const tip = mesh(new THREE.ConeGeometry(0.12, 0.9, 6), goldM, sx * (w / 2 + 0.1), y + 0.25, sz * (w / 2 + 0.1), ro);
          tip.rotation.set(sz * 0.75, 0, -sx * 0.75);
        }
      }
      void low; void mid; void up; void ball; void spire;
      let shown = 1;
      zenRoof = {
        // 1 = rõ, nhỏ hơn = mờ (khi camera ở trên cao nhìn xuống người đang ở trên đài)
        setFade(v) {
          if (Math.abs(v - shown) < 0.01) return;
          shown = v;
          for (const m of fadeMats) {
            m.opacity = v;
            m.depthWrite = v > 0.95;
          }
          ceil.visible = v > 0.95;
        },
        eaveY: Z.y + RH,
      };
    }

    // đài sen đá thanh tịnh, lư trầm và chuông xoay thiền định ở tâm đài (thấp gọn để không chắn tầm nhìn 360°)
    const centerG = new THREE.Group();
    centerG.position.set(0, 9.6, 0);
    centerG.userData.kind = 'zen';
    g.add(centerG);
    pickables.push(centerG);
    cyl(1.15, 1.28, 0.22, stoneL, 0, 0.11, 0, { parent: centerG }, 24);
    cyl(0.85, 0.98, 0.24, stoneM, 0, 0.34, 0, { parent: centerG }, 20);
    // cánh sen đá quanh bệ tâm đài
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const p = mesh(new THREE.ConeGeometry(0.18, 0.36, 6), stoneL, Math.cos(a) * 0.82, 0.52, Math.sin(a) * 0.82, { parent: centerG });
      p.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
    }
    cyl(0.46, 0.54, 0.38, M.lacquer, 0, 0.65, 0, { parent: centerG }, 16);
    cyl(0.5, 0.5, 0.05, M.gold, 0, 0.86, 0, { parent: centerG }, 16);
    // lư trầm đồng và chuông xoay Tây Tạng trên bàn thiền
    cyl(0.18, 0.15, 0.18, M.bronze, 0, 0.97, -0.1, { parent: centerG }, 14);
    mesh(new THREE.SphereGeometry(0.16, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65), M.gold, 0.24, 0.98, 0.14, { parent: centerG }).rotation.x = Math.PI;

    // lan can gỗ trầm quanh 4 cạnh mặt đài (chừa lối cầu thang ở cạnh phía bắc z = -6.0)
    const rOff = deckW / 2 - 0.2;
    const gateHalf = (S.x1 - S.x0) / 2 + 0.08;
    // cạnh nam, đông, tây nguyên vẹn
    box(deckW - 0.4, 0.08, 0.08, railM, 0, 9.6 + 0.82, rOff, o);
    box(deckW - 0.4, 0.06, 0.06, railM, 0, 9.6 + 0.42, rOff, o);
    for (const sx of [-1, 1]) {
      box(0.08, 0.08, deckW - 0.4, railM, sx * rOff, 9.6 + 0.82, 0, o);
      box(0.06, 0.06, deckW - 0.4, railM, sx * rOff, 9.6 + 0.42, 0, o);
      // hai đoạn lan can cạnh bắc hai bên đầu cầu thang
      const segW = rOff - gateHalf;
      const segCx = sx * (gateHalf + segW / 2);
      box(segW, 0.08, 0.08, railM, segCx, 9.6 + 0.82, -rOff, o);
      box(segW, 0.06, 0.06, railM, segCx, 9.6 + 0.42, -rOff, o);
    }
    // con tiện lan can và 4 trụ đèn góc đài
    for (let u = -rOff; u <= rOff + 0.01; u += 0.95) {
      cyl(0.04, 0.04, 0.84, railM, u, 9.6 + 0.42, rOff, o, 6);
      if (Math.abs(u) >= gateHalf) cyl(0.04, 0.04, 0.84, railM, u, 9.6 + 0.42, -rOff, o, 6);
      cyl(0.04, 0.04, 0.84, railM, -rOff, 9.6 + 0.42, u, o, 6);
      cyl(0.04, 0.04, 0.84, railM, rOff, 9.6 + 0.42, u, o, 6);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(0.09, 0.1, 1.08, sideCol, sx * rOff, 9.6 + 0.54, sz * rOff, o, 8);
      mesh(new THREE.SphereGeometry(0.11, 10, 8), M.gold, sx * rOff, 9.6 + 1.12, sz * rOff, o);
    }

    // cầu thang đá 32 bậc từ sân trước gác chuông (zFoot = 41.6) lên mép bắc mặt đài (zTop = 47.8)
    const nSteps = 32, run = S.zTop - S.zFoot, rise = Z.y - Z.base, sw = S.x1 - S.x0, stepD = run / nSteps;
    const stairsG = new THREE.Group();
    stairsG.userData.kind = 'zen-stair';
    g.add(stairsG);
    pickables.push(stairsG);
    for (let i = 0; i < nSteps; i++) {
      // bậc cuối thấp hơn mặt sàn 0,04 m và dừng đúng mép bắc sàn gỗ để không đè lên mặt sàn
      const h = ((i + 1) / nSteps) * (rise - 0.04);
      const sz = S.zFoot - Z.z + (i + 0.5) * stepD;
      box(sw, h, stepD, stepM, 0, h / 2, sz, { parent: stairsG });
    }
    const slope = Math.atan2(rise, run), sLen = Math.hypot(rise, run), sMidZ = (S.zFoot + S.zTop) / 2 - Z.z;
    for (const sx of [-1, 1]) {
      const bal = box(0.28, 0.85, sLen, stoneM, sx * (sw / 2 + 0.14), rise / 2 + 0.35, sMidZ, o);
      bal.rotation.x = -slope;
      // trụ đá ở chân cầu thang
      box(0.42, 1.15, 0.42, stoneL, sx * (sw / 2 + 0.14), 0.575, S.zFoot - Z.z - 0.15, o);
      mesh(new THREE.SphereGeometry(0.16, 10, 8), M.gold, sx * (sw / 2 + 0.14), 1.22, S.zFoot - Z.z - 0.15, o);
    }

    // cổng chào và biển gỗ ĐÀI THIỀN ở chân cầu thang (nhìn về phía gác chuông)
    const gateZ = S.zFoot - Z.z - 0.05;
    for (const sx of [-1, 1]) cyl(0.13, 0.15, 3.6, sideCol, sx * (sw / 2 + 0.14), 1.8, gateZ, o, 10);
    box(sw + 1.1, 0.22, 0.22, sideCol, 0, 3.55, gateZ, o);
    box(2.9, 0.68, 0.07, M.gold, 0, 3.25, gateZ - 0.08, o);
    const signF = mesh(new THREE.PlaneGeometry(2.74, 0.54), boardMat(['ĐÀI THIỀN'], { w: 1024, h: 220, size: 106 }), 0, 3.25, gateZ - 0.125, o);
    signF.rotation.y = Math.PI;
    const signB = mesh(new THREE.PlaneGeometry(2.74, 0.54), boardMat(['ĐÀI THIỀN'], { w: 1024, h: 220, size: 106 }), 0, 3.25, gateZ - 0.035, o);
    signB.userData.kind = signF.userData.kind = 'zen-stair';
    pickables.push(signF, signB);

    // vật cản dưới mặt đất quanh chân đài (chừa lối vào cầu thang ở phía bắc)
    obstacles.push(
      { minX: Z.x - 7.7, maxX: Z.x + 7.7, minZ: Z.z - 6.0, maxZ: Z.z + 7.7 },
      { minX: Z.x - 2.0, maxX: Z.x - 1.35, minZ: S.zFoot - 0.2, maxZ: Z.z - 5.8 },
      { minX: Z.x + 1.35, maxX: Z.x + 2.0, minZ: S.zFoot - 0.2, maxZ: Z.z - 5.8 },
    );
  }

  // ---------- Khu tượng Phật nằm phía tây chánh điện, nằm dọc theo chánh điện, mặt quay về chánh điện ----------
  let incenseNgoa = null;
  {
    const NG = NGOA, D = NG.D;
    // dựng trong nhóm "tại chỗ" rồi quay cả nhóm: lx dọc thân tượng, lz hướng ra trước mặt tượng
    const g = new THREE.Group();
    g.position.set(NG.x, GY, NG.z);
    g.rotation.y = NG.ry;
    scene.add(g);
    const o = { parent: g };
    // bệ đá ba lớp, mặt trên mỗi lớp cao khác nhau để không bị chớp (z-fighting)
    const pd = D + 1.4;
    box(NG.len + 1.8, 0.22, pd + 0.6, stoneL, 0, 0.11, 0, o);
    box(NG.len + 1.2, NG.plinthH - 0.22, pd, stoneM, 0, 0.22 + (NG.plinthH - 0.22) / 2, 0, o);
    box(NG.len + 1.5, 0.12, pd + 0.3, stoneL, 0, NG.plinthH - 0.16, 0, o); // gờ viền thấp hơn mặt bệ
    // tượng: tải xong mới gắn vào, đặt cao hơn mặt bệ 2 cm cho đáy tượng không trùng mặt bệ
    loadRecliningBuddha().then((m) => {
      const t = m.clone();
      t.scale.setScalar(NG.S);
      t.position.set(0, NG.plinthH + 0.02, 0);
      t.castShadow = t.receiveShadow = true;
      g.add(t);
      lodAdd(t, NG.x, NG.z, 140);
    }).catch((e) => console.warn('Không nạp được tượng Phật nằm', e));
    // vách núi đá vôi phía sau lưng tượng, lùi hẳn ra sau để đá không lấn vào tượng
    const rockM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    for (const [lx, sx, sy, sz, seed] of [
      [-7.0, 3.6, 10.0, 2.4, 1.3], [-2.6, 4.2, 12.5, 2.6, 2.7], [2.0, 4.0, 11.0, 2.5, 4.1],
      [6.4, 3.8, 9.0, 2.4, 5.6], [-10.2, 2.6, 6.5, 2.2, 8.4], [9.8, 2.6, 6.0, 2.2, 7.2],
    ]) {
      const r = new THREE.Mesh(karstGeometry(seed, 0.2), rockM);
      r.scale.set(sx, sy, sz);
      // mép trước của khối đá (bán kính lớn nhất ~1,3 lần) cách lưng tượng ít nhất 0,6 m
      r.position.set(lx, -0.2, -D / 2 - 0.6 - 1.3 * sz);
      r.rotation.y = seed * 0.3;
      r.castShadow = r.receiveShadow = true;
      g.add(r);
    }
    // sân lát đá trước mặt tượng (cao hơn mặt cỏ, có lệch chiều sâu để không chớp)
    const C = NG.court;
    const courtMat = groundMat('slab', { tile: 5.5, macro: 0.05, ...POFF });
    const courtM = mesh(new THREE.PlaneGeometry(C.x1 - C.x0, C.z1 - C.z0), courtMat, (C.x0 + C.x1) / 2, GY + 0.03, (C.z0 + C.z1) / 2, { cast: false });
    courtM.rotation.x = -Math.PI / 2;
    courtM.userData.kind = 'ground';
    pickables.push(courtM);
    // lư hương đồng trên đôn đá giữa sân, hai đèn đá hai bên
    const B = NG.burner;
    box(1.1, 0.7, 1.1, stoneL, B.x, GY + 0.35, B.z);
    cyl(0.42, 0.32, 0.42, M.bronze, B.x, GY + 0.92, B.z, {}, 18);
    cyl(0.46, 0.46, 0.05, M.bronze, B.x, GY + 1.155, B.z, {}, 18);
    incenseNgoa = makeBurner({
      center: new THREE.Vector3(B.x, GY + 1.12, B.z),
      radius: 0.3,
      spots: [-1, 0, 1].map((dx) => NG.toW(dx, D / 2 + 6.0)),
      target: NG.head,
      smoke: 26,
      min: 3,
    });
    for (const s of [-1, 1]) {
      const p = NG.toW(s * 6.5, D / 2 + 7.6);
      stoneLantern(p.x, p.z);
    }
    // bồn sen ở hai đầu bệ tượng
    for (const s of [-1, 1]) {
      const p = NG.toW(s * (NG.len / 2 + 2.0), D / 2 + 0.6);
      cyl(1.0, 1.1, 0.5, stoneL, p.x, GY + 0.25, p.z, {}, 20);
      cyl(0.9, 0.9, 0.04, std('#3d5a3a', { roughness: 0.4 }), p.x, GY + 0.51, p.z, { cast: false }, 20); // mặt nước nhô trên miệng bồn 1 cm
      for (let k = 0; k < 4; k++) {
        const a = k * 1.7 + s;
        mesh(new THREE.SphereGeometry(0.14, 8, 6), std('#f2a7b8', { roughness: 0.7 }), p.x + Math.cos(a) * 0.5, GY + 0.62, p.z + Math.sin(a) * 0.5);
      }
    }
    obstacles.push({ minX: NG.back - 7.0, maxX: NG.front + 0.9, minZ: NG.z - NG.len / 2 - 1.4, maxZ: NG.z + NG.len / 2 + 1.4 });
    obstacles.push({ x: B.x, z: B.z, r: 0.85 });
  }

  // ---------- Khu tự học sau điện Quan Âm: 4 phòng ngoại ngữ, tầng 2 Phật pháp (xem study.js) ----------
  const study = buildStudy({
    scene, std, box, cyl, mesh, boardMat,
    mats: { sideCol, sideWall, sideTile, stoneL, stoneM, gold: M.gold, bronze: M.bronze },
    pickables, obstacles,
  });
  const studyRoof = study.studyRoof;
  // cây duyên trước điện Quan Âm (cầu duyên: thắt dải lụa đỏ)
  const duyen = buildDuyenTree({ scene, std, pickables, obstacles });
  updaters.push((t) => duyen.update(t));
  // cầu thang lên tầng 2: đi ở dưới đất không xuyên qua (chỉ lên bằng lối cầu thang)
  obstacles.push({ minX: UP.stair.x0 - 0.2, maxX: UP.stair.x1 + 0.3, minZ: UP.landing.z0 - 0.2, maxZ: UP.stair.zFoot - 0.3 });

  // ---------- Điện Quan Âm: hai tầng mái, tượng Quan Âm dát vàng, lư hương, nến ----------
  const QH = QAHALL;
  let incenseQH = null;
  const QH_HEAD = new THREE.Vector3(QH.cx, GY + 3.6, QH.z0 + 1.3);
  {
    const w = QH.x1 - QH.x0, d = QH.z1 - QH.z0, cz = (QH.z0 + QH.z1) / 2;
    box(w + 1.2, 0.2, d + 1.4, stoneL, QH.cx, GY + 0.1, cz + 0.2);
    const floorQ = mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), std('#ffffff', { map: floorTex, roughness: 0.55 }), QH.cx, GY + 0.21, cz, { cast: false });
    floorQ.rotation.x = -Math.PI / 2;
    floorQ.userData.kind = 'ground';
    pickables.push(floorQ);
    box(2.2, 0.02, d - 2, std('#7a271c', { roughness: 1 }), QH.cx, GY + 0.228, cz + 1, { cast: false });
    // tường sau và hai tường bên, có cửa sổ
    box(w, 4.4, 0.3, sideWall, QH.cx, GY + 2.4, QH.z0 + 0.15);
    for (const sx of [-1, 1]) {
      box(0.3, 4.4, d, sideWall, QH.cx + sx * (w / 2 - 0.15), GY + 2.4, cz);
      for (const wz of [8.5, 12.5]) box(0.08, 1.3, 1.1, std('#2c2018', { roughness: 0.8 }), QH.cx + sx * (w / 2 - 0.32), GY + 2.5, wz);
    }
    // hàng cột son mặt tiền (để trống ở giữa làm lối vào), cột trong điện
    for (const cx of [QH.x0 + 0.6, 29.4, 34.6, QH.x1 - 0.6]) cyl(0.24, 0.27, 4.4, sideCol, cx, GY + 2.4, QH.z1 - 0.2, {}, 12);
    box(w, 0.45, 0.35, sideCol, QH.cx, GY + 4.4, QH.z1 - 0.2);
    box(w, 0.1, d, std('#5b3a24', { roughness: 0.7 }), QH.cx, GY + 4.62, cz, { cast: false });
    // mái chồng diêm: mái dưới, thân gác, mái trên
    rectRoof(QH.cx, GY + 4.6, cz, w + 2.6, d + 2.6, 1.0, sideTile, { top: 0.66, ridge: false });
    box(w * 0.66, 1.4, d * 0.62, sideWall, QH.cx, GY + 6.1, cz);
    box(4.4, 0.95, 0.06, M.gold, QH.cx, GY + 6.1, cz + d * 0.31 + 0.02);
    mesh(new THREE.PlaneGeometry(4.2, 0.8), boardMat(['QUAN ÂM ĐIỆN'], { w: 1024, h: 196, size: 110 }), QH.cx, GY + 6.1, cz + d * 0.31 + 0.06, { cast: false });
    rectRoof(QH.cx, GY + 6.8, cz, w * 0.66 + 2.4, d * 0.62 + 2.4, 1.6, sideTile, { top: 0.35 });
    mesh(new THREE.SphereGeometry(0.3, 14, 10), M.gold, QH.cx, GY + 8.7, cz);
    // bàn thờ và tượng Quan Âm dát vàng
    box(5.2, 1.0, 1.7, M.lacquer, QH.cx, GY + 0.7, QH.z0 + 1.2);
    box(5.4, 0.08, 1.9, M.gold, QH.cx, GY + 1.22, QH.z0 + 1.2, { cast: false });
    const gilt = new Map();
    const qa2 = makeQuanAm({ quality });
    qa2.traverse((m) => {
      if (!m.isMesh) return;
      if (!gilt.has(m.material)) {
        const gm = m.material.clone();
        gm.color = new THREE.Color('#f3c560');
        gm.metalness = 0.85;
        gm.roughness = 0.3;
        gm.envMapIntensity = 1.6;
        gilt.set(m.material, gm);
      }
      m.material = gilt.get(m.material);
    });
    qa2.traverse((m) => (m.castShadow = false));
    lodAdd(qa2, QH.cx, QH.z0, 50);
    qa2.position.set(QH.cx, GY + 1.26, QH.z0 + 1.25);
    qa2.rotation.y = 0;
    qa2.scale.setScalar(1.12);
    scene.add(qa2);
    // thay bằng tượng Quan Âm mẫu chạm khắc khi tải xong (giữ tượng dựng bằng mã nếu lỗi)
    swapToCarvedQuanAm(qa2).catch((e) => console.warn('Không nạp được tượng mẫu Quan Âm, giữ tượng cũ', e));
    for (const sx of [-1, 1]) {
      cyl(0.08, 0.1, 0.06, M.bronze, QH.cx + sx * 2.0, GY + 1.29, QH.z0 + 1.9);
      cyl(0.045, 0.045, 0.24, M.candle, QH.cx + sx * 2.0, GY + 1.44, QH.z0 + 1.9);
      flame(QH.cx + sx * 2.0, GY + 1.64, QH.z0 + 1.9, 0.9);
    }
    // kệ lư hương trước bàn thờ
    box(0.9, 0.7, 0.6, M.lacquer, QH.cx, GY + 0.56, 7.7);
    cyl(0.24, 0.2, 0.2, M.bronze, QH.cx, GY + 1.01, 7.7);
    incenseQH = makeBurner({
      center: new THREE.Vector3(QH.cx, GY + 1.09, 7.7),
      radius: 0.15,
      spots: [-1, 0, 1].map((dx) => ({ x: QH.cx + dx, z: 9.0 })),
      target: QH_HEAD,
      smoke: 26,
      min: 2,
    });
    obstacles.push(
      { minX: QH.x0 - 0.4, maxX: QH.x1 + 0.4, minZ: QH.z0 - 0.4, maxZ: 8.3 },
      { minX: QH.x0 - 0.4, maxX: QH.x0 + 0.5, minZ: 8.3, maxZ: QH.z1 + 0.2 },
      { minX: QH.x1 - 0.5, maxX: QH.x1 + 0.4, minZ: 8.3, maxZ: QH.z1 + 0.2 },
    );
    // đèn ấm trong điện
    const qhLight = new THREE.PointLight('#ffc27a', 6, 12, 2);
    qhLight.position.set(QH.cx, GY + 3.6, 9);
    scene.add(qhLight);
    nightHooks.push((night) => (qhLight.intensity = 6 + 20 * night));
  }

  batching = false;

  let peak = { head: new THREE.Vector3(PEAK.x, PEAK.top + 1.6, PEAK.z) }, incensePeak = null;
  // ---------- Núi đá vôi, sông, ruộng lúa quanh chùa (cảnh xa kiểu Tràng An) ----------
  {
    // khối núi đá vôi: vách dựng đứng, đỉnh tròn, cây phủ trên đỉnh và các gờ đá
    const prof = [[1, 0], [1.02, 0.18], [0.96, 0.38], [0.93, 0.55], [0.85, 0.72], [0.7, 0.85], [0.48, 0.95], [0.2, 1.0], [0, 1.01]];
    const cliff = new THREE.Color('#9a998c'), dark = new THREE.Color('#6f7266'), green = new THREE.Color('#4f6b3a'), green2 = new THREE.Color('#5f7d44');
    const peakGeo = (seed, amp = 0.16) => {
      const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 18).toNonIndexed();
      const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
      const n = (x, y, z) => Math.sin(x * 3.1 + seed) * Math.sin(z * 2.7 - seed * 1.3) + 0.5 * Math.sin(y * 9 + x * 5 + seed * 2);
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const k = 1 + amp * n(x, y, z);
        p.setXYZ(i, x * k, y * (1 + 0.05 * n(z, x, y)), z * k);
        const leafy = y > 0.78 || (Math.sin(y * 26 + seed) > 0.75 && y > 0.25);
        c.copy(leafy ? (n(x, z, y) > 0 ? green : green2) : (n(y, x, z) > 0.3 ? dark : cliff));
        col.set([c.r, c.g, c.b], i * 3);
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    const karstM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    const geos = [peakGeo(1), peakGeo(4.2), peakGeo(7.7)];
    const insts = geos.map((g) => new THREE.InstancedMesh(g, karstM, 16));
    const used = [0, 0, 0];
    const o = new THREE.Object3D();
    let seed = 7;
    const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      const a = rr() * Math.PI * 2, d = 105 + rr() * 85;
      const x = Math.cos(a) * d, z = 15 + Math.sin(a) * d;
      const v = i % 3;
      if (used[v] >= 16) continue;
      const r = 9 + rr() * 12, h = 26 + rr() * 42;
      // chừa chỗ cho hai kênh, cầu và khu mới bên kia sông
      // chừa chỗ cho Làng Mây và đường đất sang làng (vẫn rút số ngẫu nhiên để các núi khác giữ nguyên chỗ)
      const nearRect = (x0, x1, z0, z1) => Math.hypot(x - Math.min(Math.max(x, x0), x1), z - Math.min(Math.max(z, z0), z1)) < r * 1.2 + 1;
      if (nearRect(VILLAGE.x0, VILLAGE.x1, VILLAGE.z0, VILLAGE.z1) || nearRect(78, VILLAGE.x0, VILLAGE.road.z0, VILLAGE.road.z1)) {
        rr();
        rr();
        continue;
      }
      if (Math.hypot(x - PEAK.x, z - PEAK.z) < r * 1.1 + PEAK.r + 8 || (Math.abs(x + 47.5) < r * 1.2 + 4 && z < 122) || (Math.abs(x - 76) < r * 1.2 + 4 && z < 142) || (Math.abs(x) < r * 1.2 + 16 && z > 110 && z < 175)) continue;
      o.position.set(x, GY - 1, z);
      o.rotation.set(0, rr() * 6.28, 0);
      o.scale.set(r, h, r * (0.75 + rr() * 0.5));
      o.updateMatrix();
      insts[v].setMatrixAt(used[v]++, o.matrix);
    }
    insts.forEach((m, v) => {
      m.count = used[v];
      scene.add(m);
    });
    // dãy núi đá sau lưng Làng Mây (phía đông): núi thật thay cho tấm phông khi đứng gần
    for (let k = 0; k < 10; k++) {
      const z = -125 + k * 28 + rr() * 8, x = 224 + rr() * 16;
      const m = new THREE.Mesh(geos[k % 3], karstM);
      m.position.set(x, GY - 1, z);
      m.rotation.y = rr() * 6.28;
      m.scale.set(13 + rr() * 8, 38 + rr() * 34, 12 + rr() * 8);
      scene.add(m);
    }
    // ---------- Làng Mây bên kia dãy núi đá phía đông ----------
    buildVillage({ scene, std, groundMat, POFF, updaters, nightHooks, staticRoots, pickables, lodAdd });
    obstacles.push(...VILLAGE_BLOCKS);
    // núi đá lớn sau lưng điện Tam Thế, hai núi nhỏ hai bên (ít gồ ghề để vách núi sát sau điện)
    for (const [x, z, sx, sy, sz, seed, amp] of [[0, -106, 48, 58, 24, 3.3, 0.07], [-40, -96, 18, 44, 16, 5.1, 0.12], [40, -96, 18, 46, 16, 8.9, 0.12]]) {
      const m = new THREE.Mesh(peakGeo(seed, amp), karstM);
      m.position.set(x, GY - 1, z);
      m.scale.set(sx, sy, sz);
      m.receiveShadow = true;
      scene.add(m);
    }

    // hai thác nước: đổ từ vách núi xuống hồ trên nền đồi, chảy thành suối ra mép nền, đổ tiếp xuống hồ dưới chân
    const fallTex = (() => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = 'rgba(205,232,240,0.42)';
      g.fillRect(0, 0, 64, 256);
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * 64, w = 1 + Math.random() * 3, y = Math.random() * 256, h = 30 + Math.random() * 120;
        g.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`;
        g.fillRect(x, y, w, h);
        g.fillRect(x, y - 256, w, h); // nối liền khi lặp lại
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const fallMats = [];
    const fallMat = (repeatY) => {
      const t = fallTex.clone();
      t.repeat.set(1, repeatY);
      t.needsUpdate = true;
      const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      fallMats.push(m);
      return m;
    };
    const poolM = std('#3f7f86', { roughness: 0.15, metalness: 0.1 });
    const mist = [];
    const fallTop = H + 30;
    for (const s of [-1, 1]) {
      const fx = s * FALLS.x;
      // thác chính: dải nước cong nhẹ áp vào vách núi
      const fg = new THREE.PlaneGeometry(3.6, fallTop - H, 1, 12);
      const p = fg.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i) / (fallTop - H) + 0.5; // 0 dưới, 1 trên
        p.setZ(i, -Math.pow(y, 1.6) * 1.6);
        p.setX(i, p.getX(i) * (0.8 + 0.4 * (1 - y)));
      }
      const fall = new THREE.Mesh(fg, fallMat(3));
      fall.position.set(fx, (fallTop + H) / 2, FALLS.z);
      scene.add(fall);
      // hồ dưới thác
      const rim = new THREE.Mesh(new THREE.TorusGeometry(FALLS.poolR + 0.15, 0.22, 8, 40).rotateX(Math.PI / 2), stoneM);
      rim.position.set(fx, H + 0.12, FALLS.poolZ);
      scene.add(rim);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(FALLS.poolR, 40).rotateX(-Math.PI / 2), poolM);
      pool.position.set(fx, H + 0.06, FALLS.poolZ);
      scene.add(pool);
      // suối chảy ra mép nền
      const z0 = FALLS.poolZ + FALLS.poolR - 0.3, z1 = TERRACE.z1, len = z0 - z1;
      const bed = new THREE.Mesh(new THREE.PlaneGeometry(1.2, len).rotateX(-Math.PI / 2), poolM);
      bed.position.set(fx, H + 0.03, (z0 + z1) / 2);
      scene.add(bed);
      const flow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, len).rotateX(-Math.PI / 2), fallMat(len / 6));
      flow.material.opacity = 0.55; // vân nước trôi về phía mép nền
      flow.position.set(fx, H + 0.05, (z0 + z1) / 2);
      scene.add(flow);
      for (const dx of [-0.75, 0.75]) {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, len), stoneL);
        curb.position.set(fx + dx, H + 0.1, (z0 + z1) / 2);
        scene.add(curb);
      }
      // thác nhỏ đổ qua tường đá xuống hồ dưới chân
      const drop = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 8), fallMat(1.2));
      drop.position.set(fx, GY + 4, TERRACE.z1 + 0.08);
      scene.add(drop);
      const rim2 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.2, 8, 36).rotateX(Math.PI / 2), stoneM);
      rim2.position.set(fx, GY + 0.1, TERRACE.z1 + 2.2);
      scene.add(rim2);
      const pool2 = new THREE.Mesh(new THREE.CircleGeometry(2.0, 36).rotateX(-Math.PI / 2), poolM);
      pool2.position.set(fx, GY + 0.05, TERRACE.z1 + 2.2);
      scene.add(pool2);
      obstacles.push({ x: fx, z: FALLS.poolZ, r: FALLS.poolR + 0.5 }, { x: fx, z: TERRACE.z1 + 2.2, r: 2.5 });
      // bụi nước bốc lên ở chân thác
      for (const [mx, mz, my, sz] of [[0, FALLS.poolZ - 1.2, H + 0.8, 4], [0, TERRACE.z1 + 1.2, GY + 0.7, 2.4]]) {
        for (let k = 0; k < 6; k++) {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0 }));
          sp.userData = { x: fx + mx, z: mz, y: my, size: sz, t: k / 6 };
          scene.add(sp);
          mist.push(sp);
        }
      }
    }
    updaters.push((t, dt) => {
      for (const m of fallMats) m.map.offset.y += dt * 0.9;
      for (const sp of mist) {
        const u = sp.userData;
        u.t = (u.t + dt * 0.35) % 1;
        sp.position.set(u.x + Math.sin(u.t * 6 + u.size) * 0.6, u.y + u.t * 2.2, u.z + Math.cos(u.t * 5) * 0.4);
        sp.scale.setScalar(u.size * (0.5 + u.t));
        sp.material.opacity = 0.32 * Math.sin(u.t * Math.PI);
      }
    });

    // sông uốn lượn phía nam, sau sân trước cổng
    const segs = 80, pts = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const x = -230 + (460 * i) / segs, zc = 132 + Math.sin(x / 38) * 14 + Math.sin(x / 13) * 3, w = 9 + Math.sin(x / 21) * 2;
      pts.push(x, GY - 0.015, zc - w, x, GY - 0.015, zc + w);
      if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const riverG = new THREE.BufferGeometry();
    riverG.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    riverG.setIndex(idx);
    riverG.computeVertexNormals();
    const river = new THREE.Mesh(riverG, std('#4d7f84', { roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide }));
    scene.add(river);
    // ruộng lúa ô bàn cờ giữa chùa và sông
    const paddy = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), std('#ffffff', { roughness: 0.9 }), 160);
    const pc = new THREE.Color();
    let pi = 0;
    for (let gx = -9; gx < 9 && pi < 160; gx++) {
      for (let gz = 0; gz < 9 && pi < 160; gz++) {
        const x = gx * 13 + 6.5, z = 106 + gz * 6.2;
        if (Math.abs(x) < 16 && z < 112) continue;
        if (z > 132 + Math.sin(x / 38) * 14 - 13) continue; // không lấn xuống sông
        if (Math.abs(x) < 8 || Math.abs(x + 47.5) < 8.2 || Math.abs(x - 76) < 8.2 || Math.hypot(x - PEAK.x, z - PEAK.z) < PEAK.r + 12) continue; // chừa lối ra cầu, hai kênh, núi đá có tháp
        o.position.set(x, GY - 0.03, z);
        o.rotation.set(0, 0, 0);
        o.scale.set(12.2, 1, 5.6);
        o.updateMatrix();
        paddy.setMatrixAt(pi, o.matrix);
        paddy.setColorAt(pi++, pc.setHSL(0.22 + rr() * 0.06, 0.45, 0.32 + rr() * 0.12));
      }
    }
    paddy.count = pi;
    scene.add(paddy);

    // ---------- Kênh nước từ hai thác, chảy vòng hai bên chùa ra sông ----------
    {
      const flowM = (len) => {
        const m = fallMat(len / 7);
        m.opacity = 0.45;
        return m;
      };
      const waterM = std('#3f7f86', { roughness: 0.12, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
      const curbGeo = new THREE.BoxGeometry(1, 1, 1);
      const curbPts = [];
      for (const C of CANALS) {
        // bo góc: đường cong qua các điểm gấp khúc, lấy mẫu đều
        const curve = new THREE.CatmullRomCurve3(C.path.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal', 0.1);
        const L = curve.getLength(), n = Math.ceil(L / 1.2);
        const pts = curve.getSpacedPoints(n);
        const ribbon = (half, y) => {
          const pos = [], uv = [], idx = [];
          let acc = 0;
          for (let i = 0; i <= n; i++) {
            const p = pts[i], q = pts[Math.min(n, i + 1)], r0 = pts[Math.max(0, i - 1)];
            const tx = q.x - r0.x, tz = q.z - r0.z, tl = Math.hypot(tx, tz) || 1;
            const nx = -tz / tl, nz = tx / tl;
            if (i) acc += p.distanceTo(pts[i - 1]);
            pos.push(p.x + nx * half, y, p.z + nz * half, p.x - nx * half, y, p.z - nz * half);
            uv.push(0, acc / 7, 1, acc / 7);
            if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
            // gờ đá hai bên bờ kênh
            if (i < n && y < GY + 0.03) {
              for (const s of [-1, 1]) curbPts.push({ x: (p.x + q.x) / 2 + nx * s * (half + 0.22), z: (p.z + q.z) / 2 + nz * s * (half + 0.22), len: p.distanceTo(q) + 0.05, ry: Math.atan2(q.x - p.x, q.z - p.z) });
            }
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
          g.setIndex(idx);
          g.computeVertexNormals();
          return g;
        };
        const water = new THREE.Mesh(ribbon(C.w / 2, GY + 0.02), waterM);
        water.receiveShadow = true;
        scene.add(water);
        const flow = new THREE.Mesh(ribbon(C.w / 2 - 0.1, GY + 0.045), flowM(1));
        flow.material.map.repeat.set(1, 1);
        scene.add(flow);
      }
      const curbs = new THREE.InstancedMesh(curbGeo, stoneL, curbPts.length);
      const o3 = new THREE.Object3D();
      curbPts.forEach((c, i) => {
        o3.position.set(c.x, GY + 0.1, c.z);
        o3.rotation.set(0, c.ry, 0);
        o3.scale.set(0.44, 0.26, c.len);
        o3.updateMatrix();
        curbs.setMatrixAt(i, o3.matrix);
      });
      curbs.receiveShadow = true;
      scene.add(curbs);
    }

    // ---------- Lối đá xuyên ruộng, cầu đá vòm qua sông, sân đá bên kia sông (khu mới) ----------
    {
      const B = BRIDGE, hw = B.half;
      const paveM2 = groundMat('tile', { tile: 4, macro: 0.05, ...POFF });
      const lane = mesh(new THREE.PlaneGeometry(3.6, B.z0 - 101 + 0.5), paveM2, 0, GY + 0.03, (101 + B.z0) / 2, { cast: false });
      lane.rotation.x = -Math.PI / 2;
      lane.userData.kind = 'ground';
      pickables.push(lane);
      // ---------- Lối tre: rừng tre cao, thân cong vào lối đi, ngọn khép lại phía trên như mái vòm ----------
      {
        const zA = 101.8, zB = B.z0 - 0.6; // từ sân trước cổng tới chân cầu
        const H = 15, BEND = 2.8; // thân cao 15 m, ngọn nghiêng vào lối đi tới 2,8 m
        const stalkG = new THREE.CylinderGeometry(0.06, 0.1, H, 6, 12).translate(0, H / 2, 0);
        const sp = stalkG.attributes.position;
        for (let i = 0; i < sp.count; i++) {
          const y = sp.getY(i) / H;
          sp.setX(i, sp.getX(i) + BEND * y * y); // cong dần về phía +x
        }
        stalkG.computeVertexNormals();
        const spots2 = [];
        for (let z = zA; z < zB; z += 0.5) {
          for (const side of [-1, 1]) for (let k = 0; k < 3; k++) spots2.push({ side, x: side * rnd(2.5, 7.8), z: z + rnd(-0.25, 0.25), s: rnd(0.75, 1.25), h: rnd(0.8, 1.1), ry: rnd(-0.35, 0.35) });
        }
        const stalkM = std('#86a24f', { roughness: 0.55 });
        const tunnelStalks = new THREE.InstancedMesh(stalkG, stalkM, spots2.length);
        const leafM2 = new THREE.MeshStandardMaterial({ map: T.bambooLeaves(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8, color: '#d8f0a0' });
        const tunnelLeaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4, 2.4), leafM2, spots2.length * 6);
        const o2 = new THREE.Object3D(), c2 = new THREE.Color();
        let li2 = 0;
        spots2.forEach((t, i) => {
          // thân bên trái (x âm) cong về +x, thân bên phải xoay ngược lại để cong về -x; cây càng xa lối đi càng cong ít
          const dir = t.side < 0 ? 0 : Math.PI, near = 1 - (Math.abs(t.x) - 2.5) / 6;
          o2.position.set(t.x, GY - 0.05, t.z);
          o2.rotation.set(0, dir + t.ry * (1 - near * 0.6), 0);
          o2.scale.set(t.s * (0.5 + near * 0.7), t.h, t.s);
          o2.updateMatrix();
          tunnelStalks.setMatrixAt(i, o2.matrix);
          tunnelStalks.setColorAt(i, c2.setHSL(0.2 + rnd(-0.02, 0.03), 0.42, 0.42 + rnd(-0.08, 0.08)));
          // lá ở phần ngọn, đặt theo đường cong của thân
          const bend = BEND * t.s * (0.5 + near * 0.7);
          for (let k = 0; k < 6; k++) {
            const y = rnd(0.5, 1.0), along = bend * y * y;
            const lx = Math.cos(dir + t.ry) * along, lz = -Math.sin(dir + t.ry) * along;
            o2.position.set(t.x + lx + rnd(-0.5, 0.5), GY + y * H * t.h, t.z + lz + rnd(-0.5, 0.5));
            o2.rotation.set(rnd(-0.6, 0.6), rnd(0, Math.PI), rnd(-0.5, 0.5));
            o2.scale.setScalar(rnd(1.1, 1.9));
            o2.updateMatrix();
            tunnelLeaves.setMatrixAt(li2++, o2.matrix);
          }
        });
        tunnelLeaves.count = li2;
        tunnelStalks.castShadow = true;
        scene.add(tunnelStalks, tunnelLeaves);
        updaters.push((t) => {
          tunnelLeaves.rotation.z = Math.sin(t * 0.5) * 0.003;
        });
        // hàng rào cành khô màu nâu đỏ dưới chân tre, phía trước là lan can tre thấp
        const brushTex = (() => {
          const cv = document.createElement('canvas');
          cv.width = 256;
          cv.height = 128;
          const g = cv.getContext('2d');
          g.fillStyle = '#7a3f22';
          g.fillRect(0, 0, 256, 128);
          for (let i = 0; i < 900; i++) {
            const x = Math.random() * 256, y = Math.random() * 128, l = 10 + Math.random() * 40;
            g.strokeStyle = `hsl(${18 + Math.random() * 14}, ${45 + Math.random() * 25}%, ${22 + Math.random() * 28}%)`;
            g.lineWidth = 0.6 + Math.random() * 1.4;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + (Math.random() - 0.5) * 10, y - l);
            g.stroke();
          }
          const tx = new THREE.CanvasTexture(cv);
          tx.wrapS = THREE.RepeatWrapping;
          tx.colorSpace = THREE.SRGBColorSpace;
          tx.repeat.set((zB - zA) / 3, 1);
          return tx;
        })();
        const brushM = std('#ffffff', { map: brushTex, roughness: 1 });
        const railM = std('#b89a5e', { roughness: 0.7 });
        for (const side of [-1, 1]) {
          box(0.7, 1.1, zB - zA, brushM, side * 2.55, GY + 0.55, (zA + zB) / 2);
          // lan can tre: cọc thấp và một thanh ngang
          for (let z = zA; z <= zB; z += 1.8) cyl(0.045, 0.05, 0.75, railM, side * 2.05, GY + 0.375, z, {}, 6);
          const pole = cyl(0.04, 0.04, zB - zA, railM, side * 2.05, GY + 0.62, (zA + zB) / 2, {}, 6);
          pole.rotation.x = Math.PI / 2;
        }
      }
      // mặt cầu: các tấm đá nối theo đường vòm
      const deckM = std('#bdb6a6', { roughness: 0.9 });
      const N = 24, step = (B.z1 - B.z0) / N;
      for (let i = 0; i < N; i++) {
        const za = B.z0 + i * step, zb = za + step, ya = bridgeRise(za), yb = bridgeRise(zb);
        const len = Math.hypot(step, yb - ya) + 0.02, ang = Math.atan2(yb - ya, step);
        const slab = box(hw * 2 + 0.2, 0.3, len, deckM, 0, GY + (ya + yb) / 2 - 0.15, (za + zb) / 2);
        slab.rotation.x = -ang;
        slab.userData.kind = 'ground';
        pickables.push(slab);
        // lòng cầu đá dày bên dưới mặt cầu và lan can đá hai bên
        const under = box(hw * 2, 0.7, len, stoneM, 0, GY + (ya + yb) / 2 - 0.6, (za + zb) / 2);
        under.rotation.x = -ang;
        for (const s of [-1, 1]) {
          const rail = box(0.22, 0.6, len, stoneL, s * (hw + 0.05), GY + (ya + yb) / 2 + 0.3, (za + zb) / 2);
          rail.rotation.x = -ang;
        }
      }
      // trụ đá đầu cầu có quả cầu vàng
      for (const z of [B.z0 - 0.2, B.z1 + 0.2]) for (const s of [-1, 1]) {
        box(0.5, 1.2, 0.5, stoneL, s * (hw + 0.1), GY + 0.6, z);
        mesh(new THREE.SphereGeometry(0.2, 12, 8), M.gold, s * (hw + 0.1), GY + 1.35, z);
      }
      // sân đá bên kia sông: chỗ khởi đầu khu mới, có đèn đá ở bốn góc
      const NZ = NEWZONE;
      const pad = mesh(new THREE.PlaneGeometry(NZ.x1 - NZ.x0, NZ.z1 - NZ.z0), paveM2, 0, GY + 0.03, (NZ.z0 + NZ.z1) / 2, { cast: false });
      pad.rotation.x = -Math.PI / 2;
      pad.userData.kind = 'ground';
      pickables.push(pad);
      for (const x of [NZ.x0 + 1.5, NZ.x1 - 1.5]) for (const z of [NZ.z0 + 1.5, NZ.z1 - 1.5]) stoneLantern(x, z);
      // trên cầu không có vật cản; hai bên lối đi là ruộng
    }

    // ---------- Núi đá có tháp: vách núi, cầu thang uốn lượn, sàn đỉnh chìa ra ngoài, tháp ba tầng ----------
    {
      const P = PEAK, PY = GY;
      // khối núi riêng: vách dựng, đỉnh bằng, cây phủ trên đỉnh và các gờ đá
      {
        const g = new THREE.LatheGeometry(P.prof.map(([r, y]) => new THREE.Vector2(r, y)).concat([new THREE.Vector2(0, 1.0)]), 28).toNonIndexed();
        const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
        const n = (x, y, z) => Math.sin(x * 3.1 + 2.3) * Math.sin(z * 2.7 - 3) + 0.5 * Math.sin(y * 9 + x * 5 + 4.6);
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
          const k = y > 0.99 ? 1 : 1 + 0.05 * n(x, y, z);
          p.setXYZ(i, x * k, y, z * k);
          const leafy = (y > 0.8 && y < 0.99) || (Math.sin(y * 26 + 2.3) > 0.72 && y > 0.12);
          c.copy(leafy ? (n(x, z, y) > 0 ? green : green2) : n(y, x, z) > 0.3 ? dark : cliff);
          col.set([c.r, c.g, c.b], i * 3);
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        g.computeVertexNormals();
        const rock = new THREE.Mesh(g, karstM);
        rock.position.set(P.x, PY - 0.5, P.z);
        rock.scale.set(P.r, P.h + 0.5, P.r);
        rock.castShadow = rock.receiveShadow = true;
        scene.add(rock);
      }
      // lối đá từ sân trước cổng sang chân núi, cầu đá nhỏ bắc qua kênh phía đông
      {
        const L = P.lane;
        const laneM = groundMat('tile', { tile: 4, macro: 0.05, ...POFF });
        for (const [x0, x1] of [[L.x0, 73.6], [78.4, L.x1]]) {
          const m = mesh(new THREE.PlaneGeometry(x1 - x0, L.z1 - L.z0), laneM, (x0 + x1) / 2, PY + 0.03, (L.z0 + L.z1) / 2, { cast: false });
          m.rotation.x = -Math.PI / 2;
          m.userData.kind = 'ground';
          pickables.push(m);
        }
        const fb = box(5.2, 0.3, L.z1 - L.z0 + 0.2, std('#bdb6a6', { roughness: 0.9 }), 76, PY + 0.15, (L.z0 + L.z1) / 2);
        fb.userData.kind = 'ground';
        pickables.push(fb);
        for (const s of [-1, 1]) box(5.2, 0.45, 0.18, stoneL, 76, PY + 0.52, (L.z0 + L.z1) / 2 + s * ((L.z1 - L.z0) / 2 + 0.05));
      }
      // cầu thang đá uốn quanh vách núi: bậc đá, lan can phía ngoài, cột chống bên dưới
      {
        const N = 170;
        // các bậc thang dựng thành một khối liền: mặt bậc, mặt đứng, hai bên thành và mặt dưới — bậc nối khít, không chồng lên nhau nên không chớp
        const pos = [];
        const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
        const pt = (th, R, y) => [P.x + Math.cos(th) * R, PY + y, P.z + Math.sin(th) * R];
        const TH = 0.45; // độ dày bản thang
        let prevY = null;
        const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.07, 1, 6).translate(0, 0.5, 0), std('#7a5a3a', { roughness: 0.8 }), Math.ceil(N / 3) + 1);
        const props = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 1, 0.28).translate(0, -0.5, 0), stoneM, Math.ceil(N / 10) + 1);
        const o3 = new THREE.Object3D();
        const railPts = [];
        let pi2 = 0, qi = 0;
        for (let i = 0; i < N; i++) {
          const s0 = i / N, s1 = (i + 1) / N;
          const a0 = P.at(s0), a1 = P.at(s1), am = P.at((s0 + s1) / 2);
          const y = a1.y, R = am.R, ri = R - P.W / 2, ro = R + P.W / 2;
          const t0 = a0.th, t1 = a1.th;
          quad(pt(t0, ri, y), pt(t0, ro, y), pt(t1, ro, y), pt(t1, ri, y)); // mặt bậc
          const yb = prevY ?? y - 0.2;
          if (y - yb > 1e-4) quad(pt(t0, ri, yb), pt(t0, ro, yb), pt(t0, ro, y), pt(t0, ri, y)); // mặt đứng
          quad(pt(t0, ro, y), pt(t0, ro, y - TH), pt(t1, ro, y - TH), pt(t1, ro, y)); // thành ngoài
          quad(pt(t0, ri, y), pt(t1, ri, y), pt(t1, ri, y - TH), pt(t0, ri, y - TH)); // thành trong
          quad(pt(t0, ri, y - TH), pt(t1, ri, y - TH), pt(t1, ro, y - TH), pt(t0, ro, y - TH)); // mặt dưới
          prevY = y;
          const ox = P.x + Math.cos(am.th) * (ro + 0.05), oz = P.z + Math.sin(am.th) * (ro + 0.05);
          if (i % 3 === 0) {
            o3.position.set(ox, PY + y, oz);
            o3.rotation.set(0, 0, 0);
            o3.scale.set(1, 1.0, 1);
            o3.updateMatrix();
            posts.setMatrixAt(pi2++, o3.matrix);
          }
          if (i % 10 === 5 && y > 2.5) {
            o3.position.set(ox - Math.cos(am.th) * 0.2, PY + y - TH, oz - Math.sin(am.th) * 0.2);
            o3.rotation.set(0, 0, 0);
            o3.scale.set(1, Math.min(4.5, y - TH), 1);
            o3.updateMatrix();
            props.setMatrixAt(qi++, o3.matrix);
          }
          railPts.push(new THREE.Vector3(ox, PY + y + 1.0, oz));
        }
        const stairG = new THREE.BufferGeometry();
        stairG.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        stairG.computeVertexNormals();
        const steps = new THREE.Mesh(stairG, std('#c9c1b0', { roughness: 0.9, side: THREE.DoubleSide }));
        // bản đá nối từ đầu cầu thang vào sàn đỉnh (thấp hơn mặt sàn 2 cm, phần nằm dưới sàn bị sàn che)
        {
          const e = P.at(1), len = P.W + 2.2;
          const slab = box(len, 0.3, P.W, std('#c9c1b0', { roughness: 0.9 }), P.x + Math.cos(e.th) * (e.R - len / 2 + P.W / 2), PY + e.y - 0.17, P.z + Math.sin(e.th) * (e.R - len / 2 + P.W / 2));
          slab.rotation.y = -e.th;
        }
        posts.count = pi2;
        props.count = qi;
        steps.castShadow = steps.receiveShadow = true;
        steps.userData.kind = 'peak-stair';
        pickables.push(steps);
        scene.add(steps, posts, props);
        const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), N * 2, 0.05, 6), std('#7a5a3a', { roughness: 0.8 }));
        scene.add(rail);
      }
      // sàn đá bát giác trên đỉnh, chìa ra ngoài vách núi, lan can đá quanh mép (chừa lối lên cầu thang)
      const T0 = P.top;
      {
        const plat = new THREE.Mesh(new THREE.CylinderGeometry(P.platR, P.platR - 0.6, 0.9, 8), std('#b8b0a0', { roughness: 0.9 }));
        plat.position.set(P.x, T0 - 0.45, P.z);
        plat.rotation.y = Math.PI / 8;
        plat.castShadow = plat.receiveShadow = true;
        plat.userData.kind = 'ground';
        scene.add(plat);
        pickables.push(plat);
        // dầm đá đỡ dưới sàn
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          const br = box(0.5, 2.4, 0.5, stoneM, P.x + Math.cos(a) * (P.platR - 1.6), T0 - 1.9, P.z + Math.sin(a) * (P.platR - 1.6));
          br.rotation.z = 0.25 * Math.cos(a);
          br.rotation.x = -0.25 * Math.sin(a);
        }
        // lan can: tám cạnh, chừa khoảng trống nơi cầu thang lên sàn
        const ea = Math.atan2(P.entry.z - P.z, P.entry.x - P.x);
        const railR = P.platR - 0.35;
        for (let k = 0; k < 8; k++) {
          const a0 = (k / 8) * Math.PI * 2, a1 = ((k + 1) / 8) * Math.PI * 2;
          const n = 10;
          for (let j = 0; j < n; j++) {
            const t0 = a0 + ((a1 - a0) * j) / n, t1 = a0 + ((a1 - a0) * (j + 1)) / n, tm = (t0 + t1) / 2;
            let da = Math.abs(((tm - ea + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            if (da < (P.W / 2 + 0.25) / railR) continue; // lối lên: chừa đúng bề ngang cầu thang
            const x0 = P.x + Math.cos(t0) * railR, z0 = P.z + Math.sin(t0) * railR, x1 = P.x + Math.cos(t1) * railR, z1 = P.z + Math.sin(t1) * railR;
            const len = Math.hypot(x1 - x0, z1 - z0);
            const seg = box(len + 0.02, 0.12, 0.16, stoneL, (x0 + x1) / 2, T0 + 0.95, (z0 + z1) / 2);
            seg.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
            const lower = box(len + 0.02, 0.5, 0.1, std('#8e877a', { roughness: 0.9 }), (x0 + x1) / 2, T0 + 0.5, (z0 + z1) / 2);
            lower.rotation.y = seg.rotation.y;
            cyl(0.08, 0.08, 1.0, stoneL, x0, T0 + 0.5, z0, {}, 6);
          }
        }
      }
      // tháp ba tầng: tường đỏ, cửa sổ chấn song, mái ngói xám đầu đao cong, khám thờ tượng Phật mặt trước (quay về phía chùa)
      let peakHead = new THREE.Vector3(P.x - P.pagodaHalf, T0 + 1.6, P.z);
      {
        const redM = std('#a8432e', { roughness: 0.7 }), tileM = std('#4a4744', { roughness: 0.8 }), latM = std('#6e2a1c', { roughness: 0.6 });
        const roofP = (y, w, h, top) => {
          const m = mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).scale(w, h, w), tileM, P.x, y + h / 2, P.z);
          m.castShadow = true;
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
            const tip = mesh(new THREE.ConeGeometry(0.14, 1.1, 6), tileM, P.x + sx * (w / 2 + 0.15), y + 0.35, P.z + sz * (w / 2 + 0.15));
            tip.rotation.set(sz * 0.8, 0, -sx * 0.8);
          }
        };
        const tiers = [
          { w: P.pagodaHalf * 2, h: 4.2, roofW: 10.6, roofH: 1.7 },
          { w: 5.6, h: 3.2, roofW: 8.6, roofH: 1.5 },
          { w: 4.4, h: 2.9, roofW: 7.2, roofH: 2.3, top: 0.12 },
        ];
        let y = T0;
        box(P.pagodaHalf * 2 + 1.2, 0.35, P.pagodaHalf * 2 + 1.2, stoneL, P.x, y + 0.17, P.z);
        y += 0.35;
        tiers.forEach((t, k) => {
          box(t.w, t.h, t.w, redM, P.x, y + t.h / 2, P.z);
          // cửa sổ chấn song mỗi mặt (mặt tây tầng dưới là khám thờ)
          for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (k === 0 && nx === -1) continue;
            for (const off of k === 0 ? [-1.6, 1.6] : [0]) {
              const wx = P.x + nx * (t.w / 2 + 0.03) + (nz ? off : 0), wz = P.z + nz * (t.w / 2 + 0.03) + (nx ? off : 0);
              box(nx ? 0.06 : 1.1, 1.3, nz ? 0.06 : 1.1, latM, wx, y + t.h * 0.55, wz, { cast: false });
            }
          }
          if (k > 0) {
            // ban công lan can quanh tầng trên
            for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) box(nx ? 0.1 : t.w + 0.9, 0.55, nz ? 0.1 : t.w + 0.9, std('#8a3524', { roughness: 0.7 }), P.x + nx * (t.w / 2 + 0.45), y + 0.28, P.z + nz * (t.w / 2 + 0.45));
          }
          y += t.h;
          roofP(y - 0.25, t.roofW, t.roofH, t.top ?? 0.58);
          y += t.roofH * (t.top ? 1 : 0.62) - 0.2;
        });
        cyl(0.07, 0.09, 2.2, M.gold, P.x, y + 1.0, P.z, {}, 8);
        mesh(new THREE.SphereGeometry(0.28, 12, 10), M.gold, P.x, y + 0.2, P.z);
        // khám thờ ở mặt tây tầng dưới: hốc tối viền vàng, tượng Phật đứng trên tòa sen thếp vàng (mẫu chạm khắc 7022)
        const nx = P.x - P.pagodaHalf;
        box(0.4, 3.3, 2.2, std('#2a1612', { roughness: 0.8 }), nx + 0.1, T0 + 0.35 + 1.75, P.z);
        box(0.12, 3.6, 2.5, M.gold, nx - 0.02, T0 + 0.35 + 1.8, P.z, { cast: false });
        box(0.9, 0.3, 1.8, stoneL, nx - 0.5, T0 + 0.35 + 0.15, P.z); // bệ đá dưới chân tượng
        const SH = 2.7; // tượng cao 2,7 m
        loadCarved(CARVED.standing).then(({ geo, gold }) => {
          // file mẫu bị nghiêng sẵn (~3,7° sang ngang, ~0,9° ra trước): xoay bù cho đáy bệ phẳng, tượng đứng thẳng
          const g2 = geo.clone();
          g2.rotateZ(-0.064);
          g2.rotateX(0.015);
          g2.computeBoundingBox();
          g2.translate(0, -g2.boundingBox.min.y, 0);
          const st = new THREE.Mesh(g2, gold);
          st.scale.setScalar(SH);
          st.rotation.y = -Math.PI / 2; // quay mặt về phía tây (về phía chùa)
          st.position.set(nx - 0.55, T0 + 0.35 + 0.3, P.z);
          st.castShadow = true;
          scene.add(st);
        }).catch((e) => console.warn('Không nạp được tượng Phật đứng', e));
        peakHead = new THREE.Vector3(nx - 0.6, T0 + 0.65 + SH * 0.9, P.z);
        // lư hương trước khám thờ
        box(0.8, 0.6, 0.8, stoneL, nx - 2.6, T0 + 0.3, P.z);
        cyl(0.3, 0.24, 0.3, M.bronze, nx - 2.6, T0 + 0.75, P.z, {}, 16);
        incensePeak = makeBurner({
          center: new THREE.Vector3(nx - 2.6, T0 + 0.9, P.z),
          radius: 0.22,
          spots: [-1, 0, 1].map((dz) => ({ x: nx - 4.0, z: P.z + dz })),
          target: peakHead,
          smoke: 20,
          min: 2,
        });
      }
      peak = { head: peakHead };
    }
  }

  // ---------- Ruộng lúa phía đông nam sân điện Quan Âm: 20 ô, lúa lớn dần rồi chín, gặt xong cấy lại ----------
  const field = (() => {
    const F = FIELD, GY2 = PORCH.courtY;
    // nền ruộng: mặt nước đục, bấm vào để gặt / lội xuống
    const water = mesh(new THREE.PlaneGeometry(F.x1 - F.x0, F.z1 - F.z0), std('#6d7a52', { roughness: 0.25, metalness: 0.05 }), (F.x0 + F.x1) / 2, GY2 + 0.015, (F.z0 + F.z1) / 2, { cast: false });
    water.rotation.x = -Math.PI / 2;
    water.userData.kind = 'field';
    pickables.push(water);
    // bờ ruộng đắp đất giữa các ô và quanh ruộng (bờ ngang cao hơn bờ dọc 8 mm để các ngã tư không trùng mặt phẳng)
    const dykeM = std('#7a6a4a', { roughness: 1 });
    const w = (F.x1 - F.x0) / F.cols, d = (F.z1 - F.z0) / F.rows;
    for (let c = 0; c <= F.cols; c++) box(0.6, 0.16, F.z1 - F.z0 + 0.6, dykeM, F.x0 + c * w, GY2 + 0.08, (F.z0 + F.z1) / 2, { cast: false });
    for (let r = 0; r <= F.rows; r++) box(F.x1 - F.x0 + 0.6, 0.168, 0.6, dykeM, (F.x0 + F.x1) / 2, GY2 + 0.084, F.z0 + r * d, { cast: false });
    // lối đất từ mép nam sân bên (z = 40) xuống bờ ruộng (z = 43.7)
    const lane = mesh(new THREE.PlaneGeometry(7, 3.7), groundMat('dirt', { tile: 3, macro: 0.06 }), 34, GY2 + 0.015, 41.85, { cast: false });
    lane.rotation.x = -Math.PI / 2;
    lane.userData.kind = 'ground';
    pickables.push(lane);
    // khóm lúa: 8 × 8 khóm mỗi ô; mỗi khóm 9 lá dài cong ra ngoài (gốc đậm, ngọn nhạt), cao dần và đổi màu;
    // trổ bông thì có bông lúa xanh nhạt, chín thì bông vàng trĩu xuống
    const per = 64, grid = 8;
    const riceClumpGeo = (() => {
      const geos = [];
      const rr = (() => { let sd = 5; return () => ((sd = (sd * 16807) % 2147483647) / 2147483647); })();
      for (let j = 0; j < 9; j++) {
        const a = (j / 9) * Math.PI * 2 + rr() * 0.5, lean = 0.12 + rr() * 0.26, hh = 0.72 + rr() * 0.32, wb = 0.022 + rr() * 0.01;
        const pos = [], colA = [], idx = [];
        for (let k = 0; k <= 5; k++) {
          const t = k / 5, y = t * hh, out = lean * t * t, wd = wb * (1 - t * 0.9);
          const cx = Math.cos(a) * out, cz = Math.sin(a) * out, px = -Math.sin(a) * wd, pz = Math.cos(a) * wd;
          pos.push(cx - px, y, cz - pz, cx + px, y, cz + pz);
          const c = 0.5 + 0.5 * t;
          colA.push(c, c, c, c, c, c);
          if (k < 5) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        geos.push(g);
      }
      return mergeGeometries(geos);
    })();
    // bông lúa: 4 bông nhỏ rủ xuống quanh ngọn khóm
    const panicleGeo = (() => {
      const geos = [];
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * Math.PI * 2 + 0.4;
        const c = new THREE.ConeGeometry(0.02, 0.22, 4).translate(0, -0.11, 0).rotateZ(-1.0).rotateY(-a).translate(Math.cos(a) * 0.1, 0.9, Math.sin(a) * 0.1);
        geos.push(c);
      }
      return mergeGeometries(geos);
    })();
    const rice = new THREE.InstancedMesh(riceClumpGeo, std('#ffffff', { roughness: 0.8, vertexColors: true, side: THREE.DoubleSide }), PLOTS * per);
    const panicles = new THREE.InstancedMesh(panicleGeo, std('#ffffff', { roughness: 0.75 }), PLOTS * per);
    scene.add(panicles);
    const sheaf = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 0.7, 7).translate(0, 0.35, 0), std('#c9a24a', { roughness: 0.9 }), PLOTS * 3);
    rice.receiveShadow = true;
    sheaf.castShadow = true;
    scene.add(rice, sheaf);
    const STAGE_LOOK = [
      { h: 0.28, c: '#8fc45a', tilt: 0 }, // mạ
      { h: 0.6, c: '#5f9e3a', tilt: 0.05 }, // xanh
      { h: 0.85, c: '#8fae3e', tilt: 0.08 }, // trổ bông
      { h: 0.9, c: '#d6bb4e', tilt: 0.2 }, // chín vàng, bông trĩu
    ];
    const planted = new Float64Array(PLOTS); // thời điểm cấy theo đồng hồ máy này (ms)
    const shown = new Int8Array(PLOTS).fill(-1);
    const o = new THREE.Object3D(), col = new THREE.Color();
    const jitter = Array.from({ length: PLOTS * per }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() * 6.28, 0.8 + Math.random() * 0.4]);
    const ageOf = (i) => (Date.now() - planted[i]) / 1000;
    function drawPlot(i) {
      const st = riceStage(ageOf(i));
      shown[i] = st;
      const r = plotRect(i), L = STAGE_LOOK[st];
      // vừa gặt (đầu giai đoạn mạ) thì là rạ thấp màu rơm
      const stubble = st === 0 && ageOf(i) < 45;
      for (let k = 0; k < per; k++) {
        const [jx, jz, rot, s] = jitter[i * per + k];
        const gx = k % grid, gz = Math.floor(k / grid);
        o.position.set(r.minX + ((gx + 0.5 + jx * 0.4) / grid) * (r.maxX - r.minX), GY2, r.minZ + ((gz + 0.5 + jz * 0.4) / grid) * (r.maxZ - r.minZ));
        o.rotation.set(L.tilt * Math.cos(rot), rot, L.tilt * Math.sin(rot));
        const h = (stubble ? 0.14 : L.h) * s;
        o.scale.set(stubble ? 0.8 : 1.15 + h * 0.45, h, stubble ? 0.8 : 1.15 + h * 0.45);
        o.updateMatrix();
        rice.setMatrixAt(i * per + k, o.matrix);
        rice.setColorAt(i * per + k, col.set(stubble ? '#b8a36a' : L.c));
        // bông lúa: chỉ có khi trổ bông (xanh nhạt) và khi chín (vàng óng, trĩu hơn)
        if (st >= 2 && !stubble) {
          o.rotation.set(L.tilt * Math.cos(rot) + (st === 3 ? 0.15 : 0), rot, L.tilt * Math.sin(rot));
          o.scale.set(1, h, 1);
        } else o.scale.setScalar(0.0001);
        o.updateMatrix();
        panicles.setMatrixAt(i * per + k, o.matrix);
        panicles.setColorAt(i * per + k, col.set(st === 3 ? '#e7b43a' : '#c9d27c'));
      }
      // bó lúa dựng trong ô vừa gặt
      for (let k = 0; k < 3; k++) {
        o.position.set(r.minX + 1 + k * 1.6, GY2, (r.minZ + r.maxZ) / 2 + (k - 1) * 0.6);
        o.rotation.set(0, k, 0);
        o.scale.setScalar(stubble ? 1 : 0.0001);
        o.updateMatrix();
        sheaf.setMatrixAt(i * 3 + k, o.matrix);
      }
      rice.instanceMatrix.needsUpdate = sheaf.instanceMatrix.needsUpdate = panicles.instanceMatrix.needsUpdate = true;
      if (rice.instanceColor) rice.instanceColor.needsUpdate = true;
      if (panicles.instanceColor) panicles.instanceColor.needsUpdate = true;
    }
    // bù nhìn đội nón lá giữa ruộng, chòi canh ở góc ruộng
    {
      const cx = F.x0 + 2 * w, cz = F.z0 + 2.5 * d;
      const wood = std('#6b4a2e', { roughness: 0.9 });
      cyl(0.05, 0.06, 2.2, wood, cx, GY2 + 1.1, cz, {}, 6);
      box(1.5, 0.08, 0.08, wood, cx, GY2 + 1.7, cz);
      box(0.6, 0.7, 0.3, std('#5a6e8a', { roughness: 0.9 }), cx, GY2 + 1.45, cz);
      mesh(new THREE.SphereGeometry(0.2, 10, 8), std('#d9c48a', { roughness: 0.9 }), cx, GY2 + 2.0, cz);
      mesh(new THREE.ConeGeometry(0.45, 0.28, 16), std('#d9c48a', { roughness: 0.9 }), cx, GY2 + 2.25, cz);
      const hx = F.x1 - 2, hz = F.z1 + 3;
      for (const [dx, dz] of [[-1.3, -1.1], [1.3, -1.1], [-1.3, 1.1], [1.3, 1.1]]) cyl(0.08, 0.09, 2.6, wood, hx + dx, GY2 + 1.3, hz + dz, {}, 6);
      box(3.0, 0.1, 2.6, wood, hx, GY2 + 1.1, hz);
      const roof = mesh(new THREE.ConeGeometry(2.4, 1.4, 4), std('#b49a5e', { roughness: 1 }), hx, GY2 + 3.2, hz);
      roof.rotation.y = Math.PI / 4;
      obstacles.push({ x: hx, z: hz, r: 1.8 });
    }
    let nextCheck = 0;
    updaters.push((t) => {
      if (t < nextCheck) return;
      nextCheck = t + 1.5;
      for (let i = 0; i < PLOTS; i++) {
        const st = riceStage(ageOf(i));
        if (st !== shown[i] || (st === 0 && ageOf(i) < 47)) drawPlot(i);
      }
    });
    return {
      // tuổi các ô (giây) từ máy chủ, hoặc tự tạo khi ngoại tuyến
      setAges(ages) {
        for (let i = 0; i < PLOTS; i++) {
          planted[i] = Date.now() - (ages?.[i] ?? Math.random() * 600) * 1000;
          drawPlot(i);
        }
      },
      setPlot(i, age = 0) {
        planted[i] = Date.now() - age * 1000;
        drawPlot(i);
      },
      stageOf: (i) => riceStage(ageOf(i)),
      ageOf,
    };
  })();

  // ---------- Vườn rau kế bên ruộng lúa: 8 luống rau nhiều loại, phật tử chạm vào để hái ----------
  const veg = (() => {
    const V = VEG, GY2 = PORCH.courtY;
    const groundV = mesh(new THREE.PlaneGeometry(V.x1 - V.x0 + 1.6, V.z1 - V.z0 + 1.0), groundMat('dirt', { tile: 3, macro: 0.06, tint: '#d8ccb8' }), (V.x0 + V.x1) / 2, GY2 + 0.015, (V.z0 + V.z1) / 2 + 0.2, { cast: false });
    groundV.rotation.x = -Math.PI / 2;
    groundV.userData.kind = 'veg';
    pickables.push(groundV);
    // lối đất nối từ lối xuống ruộng (x = 37.5) sang vườn rau và vườn cây ăn trái, khớp mép z = 40..43.7
    const connLane = mesh(new THREE.PlaneGeometry(26.5, 3.7), groundMat('dirt', { tile: 3, macro: 0.06 }), 50.75, GY2 + 0.015, 41.85, { cast: false });
    connLane.rotation.x = -Math.PI / 2;
    connLane.userData.kind = 'ground';
    pickables.push(connLane);

    const soilM = std('#59412c', { roughness: 0.98 });
    const soilTopM = std('#4a3523', { roughness: 1 });
    const stakeM = std('#9c8454', { roughness: 0.9 });
    for (let i = 0; i < VEG_PLOTS; i++) {
      const r = vegRect(i);
      const cx = (r.minX + r.maxX) / 2, cz = (r.minZ + r.maxZ) / 2;
      const bw = r.maxX - r.minX, bd = r.maxZ - r.minZ;
      const b1 = box(bw, 0.16, bd, soilM, cx, GY2 + 0.08, cz, { cast: false });
      const b2 = box(bw - 0.2, 0.05, bd - 0.2, soilTopM, cx, GY2 + 0.165, cz, { cast: false });
      b1.userData = b2.userData = { kind: 'veg', i };
      pickables.push(b1, b2);
      // luống cà chua (i === 2) có giàn cọc tre đỡ cây
      if (i === 2) {
        for (let gz = 0; gz < 6; gz++) {
          const pz = r.minZ + ((gz + 0.5) / 6) * bd;
          for (const gx of [0.22, 0.78]) cyl(0.018, 0.022, 0.72, stakeM, r.minX + gx * bw, GY2 + 0.5, pz, {}, 5);
          box(bw * 0.62, 0.025, 0.025, stakeM, cx, GY2 + 0.72, pz);
        }
      }
    }

    // khóm rau: 7 lá thật xoè theo vòng xoắn, lá hình thìa có cuống, uốn cong vươn lên rồi rủ nhẹ, gân giữa sáng
    const rosetteGeo = (() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.05, 0.2, 0.32, 0.45, 0.24, 0.8);
      shape.bezierCurveTo(0.18, 1.0, -0.18, 1.0, -0.24, 0.8);
      shape.bezierCurveTo(-0.32, 0.45, -0.05, 0.2, 0, 0);
      const geos = [];
      for (let j = 0; j < 7; j++) {
        const g = new THREE.ShapeGeometry(shape, 8);
        const p = g.attributes.position, colA = [];
        const len = 0.42 + (j % 3) * 0.06, rise = 0.32 + (j % 2) * 0.1;
        for (let v = 0; v < p.count; v++) {
          const x = p.getX(v), t = p.getY(v);
          // t: dọc theo lá (0 = cuống, 1 = chóp); lá vươn ra ngoài (z), cao lên rồi rủ, mép hơi khum lên
          p.setXYZ(v, x * len, (rise * t - 0.26 * t * t) * len * 2.2 + Math.abs(x) * 0.08, t * len);
          const c = 0.72 + 0.28 * t - (Math.abs(x) < 0.03 ? -0.15 : 0);
          colA.push(c, Math.min(1, c + 0.02), c);
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3));
        g.rotateY(j * 2.39996); // góc vàng: lá xếp xoắn ốc không chồng nhau
        g.computeVertexNormals();
        geos.push(g);
      }
      return mergeGeometries(geos);
    })();
    const per = 18; // 3 × 6 khóm mỗi luống
    const leaves = new THREE.InstancedMesh(rosetteGeo, std('#ffffff', { roughness: 0.7, vertexColors: true, side: THREE.DoubleSide }), VEG_PLOTS * per);
    const produce = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 16, 12).translate(0, 0.12, 0), std('#ffffff', { roughness: 0.5 }), VEG_PLOTS * per);
    const basketRim = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.2, 0.22, 10).translate(0, 0.11, 0), std('#bfa065', { roughness: 0.9 }), VEG_PLOTS);
    const basketFull = new THREE.InstancedMesh(new THREE.SphereGeometry(0.23, 10, 7).scale(1, 0.55, 1).translate(0, 0.22, 0), std('#ffffff', { roughness: 0.8 }), VEG_PLOTS);
    leaves.receiveShadow = true;
    produce.castShadow = basketRim.castShadow = true;
    leaves.userData.kind = produce.userData.kind = 'veg';
    pickables.push(leaves, produce);
    scene.add(leaves, produce, basketRim, basketFull);

    // mâm rau củ tươi dâng cúng trên bàn thờ điện Quan Âm và bàn thờ Chánh điện (hiện lên khi chú tiểu mang rau vào)
    const vegOfferPlates = [];
    for (const [ox, oy, oz] of [[QH.cx + 1.25, GY2 + 1.26, QH.z0 + 1.65], [2.1, 1.66, -15.3]]) {
      const pg = new THREE.Group();
      pg.position.set(ox, oy, oz);
      pg.visible = false;
      scene.add(pg);
      cyl(0.1, 0.16, 0.12, M.gold, 0, 0.06, 0, { parent: pg }, 12);
      cyl(0.28, 0.12, 0.06, M.lacquer, 0, 0.14, 0, { parent: pg }, 16);
      const vm = std('#78cf52', { roughness: 0.55 });
      for (const [dx, dy, dz, r] of [[0, 0.24, 0, 0.095], [-0.1, 0.2, 0.06, 0.075], [0.1, 0.2, 0.06, 0.075], [0, 0.2, -0.1, 0.075], [-0.08, 0.2, -0.07, 0.07], [0.08, 0.2, -0.07, 0.07]]) {
        mesh(new THREE.SphereGeometry(r, 10, 8), vm, dx, dy, dz, { parent: pg });
      }
      vegOfferPlates.push({ pg, vm });
    }

    // Màu lá, màu củ/quả/bắp và tỉ lệ riêng cho 8 loại rau
    const BED_LOOK = [
      { leaf: '#49a835', fruit: '#78cf52', fs: [0.85, 0.9, 0.85], fy: 0.04, h: 1.0 },   // 0: rau cải xanh
      { leaf: '#3d8734', fruit: '#98de7a', fs: [1.35, 1.15, 1.35], fy: 0.05, h: 0.9 },  // 1: bắp cải
      { leaf: '#38782b', fruit: '#e63926', fs: [0.95, 0.9, 0.95], fy: 0.24, h: 1.45 },  // 2: cà chua
      { leaf: '#4da336', fruit: '#6ac449', fs: [0.75, 0.75, 0.75], fy: 0.03, h: 0.95 }, // 3: rau muống
      { leaf: '#3b7828', fruit: '#eb7d22', fs: [1.5, 1.0, 1.5], fy: 0.02, h: 0.85 },    // 4: bí đỏ
      { leaf: '#54a63b', fruit: '#f5f2eb', fs: [0.7, 1.5, 0.7], fy: -0.02, h: 0.95 },   // 5: củ cải trắng
      { leaf: '#8c2646', fruit: '#c43560', fs: [0.85, 0.95, 0.85], fy: 0.04, h: 1.05 }, // 6: rau dền đỏ
      { leaf: '#58b03c', fruit: '#f2cc33', fs: [0.85, 0.65, 0.85], fy: 0.26, h: 1.2 },  // 7: cải ngọt
    ];
    const STAGE_SCALE = [0.28, 0.55, 0.82, 1.08];
    const planted = new Float64Array(VEG_PLOTS);
    const shown = new Int8Array(VEG_PLOTS).fill(-1);
    const basketTaken = new Uint8Array(VEG_PLOTS);
    const o = new THREE.Object3D(), col = new THREE.Color();
    const jitter = Array.from({ length: VEG_PLOTS * per }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() * 6.28, 0.88 + Math.random() * 0.24]);
    const ageOf = (i) => (Date.now() - planted[i]) / 1000;

    function drawBed(i) {
      const st = vegStage(ageOf(i));
      shown[i] = st;
      const r = vegRect(i), B = BED_LOOK[i % BED_LOOK.length];
      const regrow = st === 0 && ageOf(i) < 35;
      const freshPick = st === 0 && ageOf(i) < 40 && !basketTaken[i];
      const sc = regrow ? 0.18 : STAGE_SCALE[st];
      for (let k = 0; k < per; k++) {
        const [jx, jz, rot, s] = jitter[i * per + k];
        const gx = k % 3, gz = Math.floor(k / 3);
        const px = r.minX + ((gx + 0.5 + jx * 0.28) / 3) * (r.maxX - r.minX);
        const pz = r.minZ + ((gz + 0.5 + jz * 0.28) / 6) * (r.maxZ - r.minZ);
        o.position.set(px, GY2 + 0.17, pz);
        o.rotation.set(0, rot, 0);
        o.scale.set(sc * s, sc * B.h * s, sc * s);
        o.updateMatrix();
        leaves.setMatrixAt(i * per + k, o.matrix);
        leaves.setColorAt(i * per + k, col.set(st === 0 ? '#7ab856' : B.leaf));

        // củ / quả / bắp rõ dần khi sang giai đoạn 2–3
        const fScale = st < 2 ? 0.0001 : (st === 2 ? 0.55 : 1.0) * s;
        o.position.set(px, GY2 + 0.17 + B.fy * sc, pz);
        o.scale.set(B.fs[0] * fScale, B.fs[1] * fScale, B.fs[2] * fScale);
        o.updateMatrix();
        produce.setMatrixAt(i * per + k, o.matrix);
        produce.setColorAt(i * per + k, col.set(st === 2 && (i === 2 || i === 4) ? '#8ab83e' : B.fruit));
      }
      // rổ rau đan tre đặt ở đầu luống vừa hái
      o.position.set((r.minX + r.maxX) / 2, GY2 + 0.17, r.minZ + 0.45);
      o.rotation.set(0, i * 0.7, 0);
      o.scale.setScalar(freshPick ? 1 : 0.0001);
      o.updateMatrix();
      basketRim.setMatrixAt(i, o.matrix);
      basketFull.setMatrixAt(i, o.matrix);
      basketFull.setColorAt(i, col.set(B.fruit));

      leaves.instanceMatrix.needsUpdate = produce.instanceMatrix.needsUpdate = true;
      basketRim.instanceMatrix.needsUpdate = basketFull.instanceMatrix.needsUpdate = true;
      if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
      if (produce.instanceColor) produce.instanceColor.needsUpdate = true;
      if (basketFull.instanceColor) basketFull.instanceColor.needsUpdate = true;
    }

    // hàng rào tre thấp, biển VƯỜN RAU và hai lu nước tưới rau ở góc vườn
    {
      const bambooM = std('#9e8b52', { roughness: 0.85 });
      const woodM = std('#6b4a2e', { roughness: 0.9 });
      const fx1 = V.x1 + 0.55, fz1 = V.z1 + 0.45;
      for (let z = V.z0; z <= fz1; z += 2.4) cyl(0.04, 0.045, 0.75, bambooM, fx1, GY2 + 0.37, z, {}, 6);
      for (const h of [0.28, 0.58]) box(0.05, 0.05, fz1 - V.z0, bambooM, fx1, GY2 + h, (V.z0 + fz1) / 2);
      for (let x = V.x0; x <= fx1; x += 2.4) cyl(0.04, 0.045, 0.75, bambooM, x, GY2 + 0.37, fz1, {}, 6);
      for (const h of [0.28, 0.58]) box(fx1 - V.x0, 0.05, 0.05, bambooM, (V.x0 + fx1) / 2, GY2 + h, fz1);
      // hai lu nước sành tưới rau
      const jarM = std('#8c432b', { roughness: 0.75 });
      for (const [jx, jz, sc] of [[V.x1 - 0.8, V.z0 - 1.2, 1], [V.x1 - 1.85, V.z0 - 1.0, 0.82]]) {
        lathe([[0, 0], [0.34 * sc, 0], [0.46 * sc, 0.38 * sc], [0.42 * sc, 0.72 * sc], [0.34 * sc, 0.86 * sc], [0.38 * sc, 0.92 * sc]], jarM, jx, GY2, jz);
        mesh(new THREE.CircleGeometry(0.33 * sc, 14).rotateX(-Math.PI / 2), std('#4a7b82', { roughness: 0.2 }), jx, GY2 + 0.82 * sc, jz, { cast: false });
      }
      obstacles.push({ x: V.x1 - 1.3, z: V.z0 - 1.1, r: 1.1 });
      // biển gỗ VƯỜN RAU
      const sx = V.x0 + 2.2, sz = V.z0 - 0.6;
      for (const dx of [-0.65, 0.65]) cyl(0.05, 0.06, 1.5, woodM, sx + dx, GY2 + 0.75, sz, {}, 6);
      box(1.6, 0.46, 0.06, woodM, sx, GY2 + 1.28, sz);
      mesh(new THREE.PlaneGeometry(1.48, 0.38), boardMat(['VƯỜN RAU'], { w: 512, h: 160, size: 92 }), sx, GY2 + 1.28, sz - 0.035, { cast: false }).rotation.y = Math.PI;
      mesh(new THREE.PlaneGeometry(1.48, 0.38), boardMat(['VƯỜN RAU'], { w: 512, h: 160, size: 92 }), sx, GY2 + 1.28, sz + 0.035, { cast: false });
    }

    let nextCheck = 0;
    updaters.push((t) => {
      if (t < nextCheck) return;
      nextCheck = t + 1.5;
      for (let i = 0; i < VEG_PLOTS; i++) {
        const st = vegStage(ageOf(i));
        if (st !== shown[i] || (st === 0 && ageOf(i) < 42)) drawBed(i);
      }
    });
    return {
      setAges(ages) {
        for (let i = 0; i < VEG_PLOTS; i++) {
          planted[i] = Date.now() - (ages?.[i] ?? (VEG_RIPE_AGE + 10 + Math.random() * 60)) * 1000;
          basketTaken[i] = 1;
          drawBed(i);
        }
      },
      setBed(i, age = 0) {
        planted[i] = Date.now() - age * 1000;
        basketTaken[i] = age === 0 ? 0 : 1;
        drawBed(i);
      },
      takeBasket(i) {
        basketTaken[i] = 1;
        drawBed(i);
        return BED_LOOK[i % BED_LOOK.length]?.fruit || '#78cf52';
      },
      placeOffering(i) {
        const c = BED_LOOK[i % BED_LOOK.length]?.fruit || '#78cf52';
        for (const { pg, vm } of vegOfferPlates) {
          vm.color.set(c);
          pg.visible = true;
        }
      },
      stageOf: (i) => vegStage(ageOf(i)),
      ageOf,
    };
  })();

  // ---------- Vườn cây ăn trái kế bên điện Quan Âm: xoài, bưởi, mít, hồng, khế, ổi, nhãn, chuối ----------
  const orchard = (() => {
    const O = ORCHARD, GY2 = PORCH.courtY;
    // thảm cỏ vườn quả xanh mát bên hông điện Quan Âm (bắt đầu từ x = 43 và kéo tới z = 40 để khớp mép với sân bên & lối đất, không chồng mặt phẳng)
    const grass = mesh(new THREE.PlaneGeometry(O.x1 - 43, 40 - O.z0), groundMat('grass', { tile: 4, macro: 0.1, tint: '#f4ffe8' }), (43 + O.x1) / 2, GY2 + 0.015, (O.z0 + 40) / 2, { cast: false });
    grass.rotation.x = -Math.PI / 2;
    grass.userData.kind = 'ground';
    pickables.push(grass);

    // lối đá dạo vườn nối từ sân điện Quan Âm vào giữa vườn và xuống ruộng lúa / vườn rau
    const stepStoneM = std('#aba393', { roughness: 0.95 });
    const stoneSpots = [
      [42.6, 26.5], [44.2, 26.2], [45.8, 25.6], [47.4, 24.6], [49.0, 23.4], [50.4, 22.2],
      [50.2, 19.6], [49.4, 17.4], [48.6, 15.0], [48.4, 12.4], [48.4, 9.8],
      [53.4, 22.0], [55.2, 21.2], [56.2, 19.2],
      [51.8, 24.4], [51.8, 26.8], [51.6, 29.4], [51.6, 32.0], [51.6, 34.6], [51.6, 37.2], [51.6, 39.4],
    ];
    for (const [sx, sz] of stoneSpots) {
      const st = mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.04, 10), stepStoneM, sx, GY2 + 0.038, sz, { cast: false });
      st.scale.set(1.1, 1, 0.85);
      st.userData.kind = 'ground';
      pickables.push(st);
    }

    // cổng gỗ nhỏ đề biển VƯỜN QUẢ ở lối từ sân điện Quan Âm bước vào
    const woodM = std('#6b4429', { roughness: 0.85 });
    const gx = 43.2, gz = 26.5;
    for (const dz of [-1.35, 1.35]) cyl(0.09, 0.11, 2.7, woodM, gx, GY2 + 1.35, gz + dz, {}, 8);
    box(0.18, 0.18, 3.2, woodM, gx, GY2 + 2.68, gz);
    box(0.06, 0.52, 1.9, M.gold, gx - 0.08, GY2 + 2.42, gz);
    mesh(new THREE.PlaneGeometry(1.76, 0.42), boardMat(['VƯỜN QUẢ'], { w: 512, h: 160, size: 92 }), gx - 0.12, GY2 + 2.42, gz, { cast: false }).rotation.y = -Math.PI / 2;

    // bàn đá và 4 đôn đá dưới bóng mát giữa vườn
    const tx = 51.8, tz = 22.0;
    cyl(0.75, 0.75, 0.09, stepStoneM, tx, GY2 + 0.68, tz, {}, 18);
    cyl(0.24, 0.34, 0.64, stoneM, tx, GY2 + 0.32, tz, {}, 12);
    for (const [dx, dz] of [[-1.15, 0], [1.15, 0], [0, -1.15], [0, 1.15]]) {
      cyl(0.24, 0.2, 0.42, stepStoneM, tx + dx, GY2 + 0.21, tz + dz, {}, 12);
    }
    // ấm trà gốm trên bàn đá
    cyl(0.09, 0.11, 0.14, std('#8c4a32', { roughness: 0.5 }), tx, GY2 + 0.79, tz, {}, 10);
    obstacles.push({ x: tx, z: tz, r: 1.45 });

    // cấu hình từng loài cây ăn trái: màu vỏ cây, tán lá, hình dáng & màu sắc quả chín / xanh / hoa
    const TREE_SPECIES = {
      mango:     { bark: '#523a26', leaf1: '#336626', leaf2: '#3f7830', ripe: '#f5b82e', green: '#6ea33f', flower: '#f7f2c6', fScale: [0.11, 0.16, 0.1], crownH: 3.3, crownR: 1.85 },
      pomelo:    { bark: '#5c4330', leaf1: '#427d2e', leaf2: '#51913a', ripe: '#d8e048', green: '#5b9636', flower: '#ffffff', fScale: [0.18, 0.18, 0.18], crownH: 3.0, crownR: 1.65 },
      persimmon: { bark: '#422f22', leaf1: '#4c7330', leaf2: '#5c853a', ripe: '#f05522', green: '#82a83e', flower: '#f5e8b8', fScale: [0.13, 0.1, 0.13], crownH: 3.1, crownR: 1.6 },
      jackfruit: { bark: '#594026', leaf1: '#2f5e22', leaf2: '#3b6e2c', ripe: '#b89e30', green: '#6e8c35', flower: '#d9cf7a', fScale: [0.22, 0.34, 0.22], crownH: 3.5, crownR: 1.75 },
      starfruit: { bark: '#6b5037', leaf1: '#599436', leaf2: '#6ba844', ripe: '#f2c529', green: '#7eb33e', flower: '#e695cf', fScale: [0.1, 0.16, 0.1], crownH: 2.9, crownR: 1.55 },
      guava:     { bark: '#7d563a', leaf1: '#4a8035', leaf2: '#589440', ripe: '#b5d656', green: '#689e3c', flower: '#ffffff', fScale: [0.11, 0.12, 0.11], crownH: 2.7, crownR: 1.45 },
      longan:    { bark: '#4f3927', leaf1: '#2c5921', leaf2: '#386b2b', ripe: '#c9923e', green: '#6e8f38', flower: '#ede3a8', fScale: [0.14, 0.11, 0.14], crownH: 3.2, crownR: 1.75 },
      banana:    { bark: '#658f35', leaf1: '#559432', leaf2: '#66a83e', ripe: '#f0c933', green: '#6ca138', flower: '#7a2438', fScale: [0.18, 0.26, 0.18], crownH: 2.4, crownR: 1.4 },
    };

    const fruitMeshes = []; // mảng các danh sách mesh quả của từng cây để cập nhật độ lớn / màu
    const basketMeshes = [];
    const bananaLeafMat = std('#6aa83c', { roughness: 0.6, side: THREE.DoubleSide, map: T.bananaLeafTex(), alphaTest: 0.5 });
    // lá chuối: phiến dài 1,9 m, cuống thẳng rồi cong rủ xuống ở nửa ngoài
    const bananaLeafGeo = (() => {
      const g = new THREE.PlaneGeometry(0.62, 1.9, 1, 10).rotateX(-Math.PI / 2).translate(0, 0, 0.95);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const z = p.getZ(v), t = z / 1.9;
        p.setY(v, 0.55 * t - 1.05 * t * t + Math.abs(p.getX(v)) * 0.25); // vươn lên rồi rủ, phiến hơi khum
      }
      g.computeVertexNormals();
      return g;
    })();
    // chùm lá cây ăn quả: tấm lá vẽ nhiều lá nhỏ (nền trong suốt), dùng chung cho mọi cây
    const leafCardTex = T.leafClusterTex();
    const basketMat = std('#bfa065', { roughness: 0.9 });

    ORCHARD_TREES.forEach((tr, idx) => {
      const sp = TREE_SPECIES[tr.kind] || TREE_SPECIES.mango;
      const g = new THREE.Group();
      g.position.set(tr.x, GY2, tr.z);
      scene.add(g);
      const o = { parent: g };
      const barkM = std(sp.bark, { roughness: 0.9 });
      const leafM1 = std(sp.leaf1, { roughness: 0.85 });
      const leafM2 = std(sp.leaf2, { roughness: 0.85 });
      const fruitM = std(sp.ripe, { roughness: 0.55 });
      const fruits = [];

      if (tr.kind === 'banana') {
        // khóm chuối: thân chuối xanh, cây con bên cạnh, 8 tàu lá chuối vươn cong và buồng chuối + bắp chuối đỏ tím
        cyl(0.14, 0.19, 2.35, barkM, 0, 1.17, 0, o, 10);
        cyl(0.08, 0.11, 1.35, leafM1, 0.36, 0.67, 0.22, o, 8);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + idx * 0.3;
          const leafG = new THREE.Group();
          leafG.position.set(0, 2.28, 0);
          leafG.rotation.y = a;
          g.add(leafG);
          const blade = new THREE.Mesh(bananaLeafGeo, bananaLeafMat);
          blade.rotation.x = -0.25 - (k % 2) * 0.2;
          blade.rotation.z = (k % 3 - 1) * 0.12;
          blade.scale.setScalar(0.85 + (k % 3) * 0.12);
          blade.castShadow = blade.receiveShadow = true;
          leafG.add(blade);
        }
        // cuống buồng chuối và bắp chuối tím
        cyl(0.03, 0.025, 0.65, barkM, 0.32, 1.95, 0, o, 6).rotation.z = -0.45;
        mesh(new THREE.ConeGeometry(0.11, 0.32, 8), std('#7a2438', { roughness: 0.7 }), 0.48, 1.32, 0, o).rotation.x = Math.PI;
        for (let tier = 0; tier < 4; tier++) {
          for (let b = 0; b < 3; b++) {
            const a = (b - 1) * 0.55;
            const fm = mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.24, 7), fruitM, 0.44 + Math.cos(a) * 0.08, 1.88 - tier * 0.11, Math.sin(a) * 0.1, o);
            fm.rotation.z = 0.4;
            fruits.push({ m: fm, baseScale: [1, 1, 1] });
          }
        }
      } else {
        // thân gỗ hơi nghiêng, rễ nổi ở gốc, 5 cành lớn toả lên đỡ tán
        const th = sp.crownH - 0.8;
        const trunk = cyl(0.16, 0.27, th, barkM, 0, th / 2, 0, o, 9);
        trunk.rotation.z = ((idx % 3) - 1) * 0.05;
        for (let b = 0; b < 4; b++) {
          const ra = (b * Math.PI) / 2 + idx * 0.7;
          const root = cyl(0.04, 0.09, 0.55, barkM, Math.cos(ra) * 0.22, 0.12, Math.sin(ra) * 0.22, o, 6);
          root.rotation.set(Math.sin(ra) * 1.1, 0, -Math.cos(ra) * 1.1);
        }
        for (let b = 0; b < 5; b++) {
          const ba = (b * Math.PI * 2) / 5 + idx * 0.5, tilt = 0.45 + (b % 2) * 0.25, len = 1.1 + (b % 3) * 0.25;
          const br = cyl(0.05, 0.11, len, barkM, Math.cos(ba) * 0.32, th + 0.2 + (b % 2) * 0.15, Math.sin(ba) * 0.32, o, 7);
          br.rotation.set(Math.sin(ba) * tilt, 0, -Math.cos(ba) * tilt);
        }
        // tán lá: lõi gồ ghề nhiều khối (sẫm bên trong) + hàng chục chùm lá thật phủ ngoài
        const R = sp.crownR, Hc = sp.crownH;
        const lumpy = (r, seed) => {
          const gq = new THREE.IcosahedronGeometry(r, 2);
          const pp = gq.attributes.position;
          for (let v = 0; v < pp.count; v++) {
            const x = pp.getX(v), y = pp.getY(v), z = pp.getZ(v);
            const k = 1 + 0.16 * Math.sin(x * 4.1 + seed) * Math.sin(z * 3.7 - seed) + 0.1 * Math.sin(y * 5.3 + seed * 2);
            pp.setXYZ(v, x * k, y * k, z * k);
          }
          gq.computeVertexNormals();
          return gq;
        };
        // lõi tán sẫm màu (phần lá khuất bóng bên trong), nhỏ hơn lớp lá ngoài để không lộ khối
        const shadeM = std(new THREE.Color(sp.leaf1).multiplyScalar(0.55), { roughness: 0.95 });
        const core = mesh(lumpy(R * 0.78, idx), shadeM, 0, Hc, 0, o);
        core.scale.set(1, 0.8, 1);
        for (let c = 0; c < 5; c++) {
          const ca = (c * Math.PI * 2) / 5 + idx * 0.4;
          const sub = mesh(lumpy(R * 0.5, idx + c * 1.7), shadeM, Math.cos(ca) * R * 0.5, Hc - 0.2 + (c % 2) * 0.4, Math.sin(ca) * R * 0.5, o);
          sub.scale.set(1, 0.85, 1);
        }
        {
          const cards = [];
          const nCard = 130;
          for (let c = 0; c < nCard; c++) {
            // điểm trên mặt tán (phân bố đều trên mặt cầu dẹt), hướng tấm lá ngẫu nhiên
            const u = (c + 0.5) / nCard, phi = Math.acos(1 - 2 * u * 0.92), th2 = c * 2.39996 + idx;
            const rr = R * (0.72 + ((c * 37) % 17) / 45);
            const cx = Math.sin(phi) * Math.cos(th2) * rr, cy = Math.cos(phi) * rr * 0.8, cz = Math.sin(phi) * Math.sin(th2) * rr;
            const pg = new THREE.PlaneGeometry(1.25, 1.25);
            pg.rotateX(((c * 53) % 31) / 10);
            pg.rotateY(((c * 71) % 29) / 10);
            pg.translate(cx, Hc + cy, cz);
            cards.push(pg);
          }
          const leafCards = new THREE.Mesh(mergeGeometries(cards), new THREE.MeshStandardMaterial({ color: sp.leaf2, map: leafCardTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }));
          leafCards.castShadow = true;
          g.add(leafCards);
        }
        // vị trí quả: mít treo quanh thân và cành thấp; các cây khác treo quanh tán lá
        const fCount = tr.kind === 'jackfruit' ? 7 : 12;
        for (let f = 0; f < fCount; f++) {
          const fa = (f / fCount) * Math.PI * 2 + f * 0.4;
          let fx, fy, fz;
          if (tr.kind === 'jackfruit') {
            const cr = f < 4 ? 0.28 : 0.48;
            fx = Math.cos(fa) * cr;
            fz = Math.sin(fa) * cr;
            fy = 1.05 + (f / fCount) * 1.15;
          } else {
            const cr = R * (0.62 + (f % 3) * 0.16);
            fx = Math.cos(fa) * cr;
            fz = Math.sin(fa) * cr;
            fy = Hc - 0.55 + (f % 3) * 0.32;
          }
          const geo = tr.kind === 'starfruit' ? new THREE.OctahedronGeometry(1, 1) : new THREE.SphereGeometry(1, 10, 8);
          const fm = mesh(geo, fruitM, fx, fy, fz, o);
          fruits.push({ m: fm, baseScale: sp.fScale });
        }
      }

      // rổ trái cây đan tre dưới gốc khi vừa hái xong
      const bGroup = new THREE.Group();
      bGroup.position.set(0.65, 0, 0.55);
      g.add(bGroup);
      mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.22, 10), basketMat, 0, 0.11, 0, { parent: bGroup });
      mesh(new THREE.SphereGeometry(0.22, 10, 7), std(sp.ripe, { roughness: 0.6 }), 0, 0.22, 0, { parent: bGroup }).scale.set(1, 0.55, 1);
      basketMeshes.push(bGroup);
      fruitMeshes.push({ fruits, mat: fruitM, sp });

      // hộp vô hình để bấm chọn cây ăn trái
      const hit = mesh(new THREE.CylinderGeometry(1.45, 1.45, 4.2, 8), new THREE.MeshBasicMaterial({ visible: false }), tr.x, GY2 + 2.1, tr.z, { cast: false, recv: false });
      hit.userData = { kind: 'orchard', i: idx };
      pickables.push(hit);
      obstacles.push({ x: tr.x, z: tr.z, r: 0.65 });
    });

    // mâm bồng trái cây cúng Phật trên bàn thờ điện Quan Âm và bàn thờ Chánh điện (hiện lên khi chú tiểu dâng quả)
    const offerPlates = [];
    for (const [ox, oy, oz] of [[QH.cx - 1.25, GY2 + 1.26, QH.z0 + 1.65], [-2.1, 1.66, -15.3]]) {
      const pg = new THREE.Group();
      pg.position.set(ox, oy, oz);
      pg.visible = false;
      scene.add(pg);
      cyl(0.1, 0.16, 0.12, M.gold, 0, 0.06, 0, { parent: pg }, 12);
      cyl(0.28, 0.12, 0.06, M.lacquer, 0, 0.14, 0, { parent: pg }, 16);
      const fm = std('#f5b82e', { roughness: 0.5 });
      for (const [dx, dy, dz, r] of [[0, 0.24, 0, 0.09], [-0.1, 0.2, 0.06, 0.075], [0.1, 0.2, 0.06, 0.075], [0, 0.2, -0.1, 0.075], [-0.08, 0.2, -0.07, 0.07], [0.08, 0.2, -0.07, 0.07]]) {
        mesh(new THREE.SphereGeometry(r, 10, 8), fm, dx, dy, dz, { parent: pg });
      }
      offerPlates.push({ pg, fm });
    }

    const planted = new Float64Array(ORCHARD_COUNT);
    const shown = new Int8Array(ORCHARD_COUNT).fill(-1);
    const basketTaken = new Uint8Array(ORCHARD_COUNT);
    const ageOf = (i) => (Date.now() - planted[i]) / 1000;

    function drawTree(i) {
      const st = fruitStage(ageOf(i));
      shown[i] = st;
      const { fruits, mat, sp } = fruitMeshes[i];
      const freshPick = st === 0 && ageOf(i) < 40 && !basketTaken[i];
      // st 0: hoa nhỏ; st 1: trái non xanh; st 2: quả lớn dần; st 3: quả chín rực rỡ
      mat.color.set(st === 0 ? sp.flower : st === 1 ? sp.green : st === 2 ? sp.green : sp.ripe);
      const mult = st === 0 ? 0.42 : st === 1 ? 0.58 : st === 2 ? 0.85 : 1.12;
      for (const { m, baseScale } of fruits) {
        m.scale.set(baseScale[0] * mult, baseScale[1] * mult, baseScale[2] * mult);
      }
      basketMeshes[i].visible = freshPick;
    }

    let nextCheck = 0;
    updaters.push((t) => {
      if (t < nextCheck) return;
      nextCheck = t + 1.5;
      for (let i = 0; i < ORCHARD_COUNT; i++) {
        const st = fruitStage(ageOf(i));
        if (st !== shown[i] || (st === 0 && ageOf(i) < 42)) drawTree(i);
      }
    });

    return {
      setAges(ages) {
        for (let i = 0; i < ORCHARD_COUNT; i++) {
          planted[i] = Date.now() - (ages?.[i] ?? Math.random() * 480) * 1000;
          basketTaken[i] = 1;
          drawTree(i);
        }
      },
      setTree(i, age = 0) {
        planted[i] = Date.now() - age * 1000;
        basketTaken[i] = age === 0 ? 0 : 1;
        drawTree(i);
      },
      takeBasket(i) {
        basketTaken[i] = 1;
        if (basketMeshes[i]) basketMeshes[i].visible = false;
        return fruitMeshes[i]?.sp.ripe || '#f5b82e';
      },
      placeOffering(i) {
        const c = fruitMeshes[i]?.sp.ripe || '#f5b82e';
        for (const { pg, fm } of offerPlates) {
          fm.color.set(c);
          pg.visible = true;
        }
      },
      stageOf: (i) => fruitStage(ageOf(i)),
      ageOf,
    };
  })();

  // ---------- Cổng Tam Quan: cửa giữa hai tầng mái, hai cửa bên một tầng mái ----------
  {
    const wallM = std('#e6dcc6', { roughness: 0.9 });
    const tileM = std('#6a3426', { roughness: 0.75 });
    const colM = std('#9c2a1c', { roughness: 0.55 });
    const GZ = GATE.z;
    const gate = new THREE.Group();
    scene.add(gate);
    staticRoots.push(gate);
    const o = { parent: gate };
    // mái chữ nhật bốn mái: khối chóp cụt 4 cạnh, đầu đao vểnh ở bốn góc, bờ nóc trên cùng
    function hipRoof(x, y, w, d, h) {
      // khối chóp cụt 4 cạnh: đáy w × d, đỉnh còn 45%, cao 2h
      const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.SQRT1_2 * 0.45, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4), tileM);
      m.scale.set(w, h * 2, d);
      m.position.set(x, y + h, GZ);
      m.castShadow = m.receiveShadow = true;
      gate.add(m);
      box(w * 0.42, 0.16, 0.18, colM, x, y + h * 1.92, GZ, o);
      for (const sx of [-1, 1]) {
        const ridgeEnd = mesh(new THREE.ConeGeometry(0.1, 0.5, 6), M.gold, x + sx * w * 0.22, y + h * 2.05, GZ, o);
        ridgeEnd.rotation.z = -sx * 0.5;
        for (const sz of [-1, 1]) {
          const tip = mesh(new THREE.ConeGeometry(0.08, 0.55, 6), tileM, x + sx * (w / 2 + 0.05), y + 0.12, GZ + sz * (d / 2 + 0.05), o);
          tip.rotation.set(sz * 0.7, 0, -sx * 0.7);
        }
      }
    }
    // bậc nền
    box(30, 0.24, 6, stoneL, 0, GY + 0.12, GZ, o);
    // cửa giữa: bốn cột lớn, hai tầng mái, gác có biển tên chùa
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.32, 0.36, 4.6, colM, sx * 2.3, GY + 0.24 + 2.3, GZ + sz * 1.5, o, 14);
    box(5.4, 0.4, 3.6, colM, 0, GY + 4.85, GZ, o);
    hipRoof(0, GY + 4.6, 8.4, 5.6, 0.75);
    box(4.6, 1.8, 2.8, wallM, 0, GY + 6.9, GZ, o);
    for (const sz of [-1, 1]) {
      box(3.1, 0.95, 0.06, M.gold, 0, GY + 6.95, GZ + sz * 1.43, o);
      const plaque = mesh(new THREE.PlaneGeometry(2.9, 0.8), boardMat(['AM MÂY']), 0, GY + 6.95, GZ + sz * 1.47, o);
      if (sz < 0) plaque.rotation.y = Math.PI;
    }
    hipRoof(0, GY + 7.75, 6.6, 4.4, 0.7);
    mesh(new THREE.SphereGeometry(0.24, 14, 10), M.gold, 0, GY + 7.75 + 1.65, GZ, o);
    // hai cửa bên
    for (const sx of [-1, 1]) {
      const cx = sx * 6.2;
      for (const dx of [-1.45, 1.45]) cyl(0.24, 0.27, 3.4, colM, cx + dx, GY + 0.24 + 1.7, GZ, o, 12);
      box(3.2, 0.3, 0.5, colM, cx, GY + 3.55, GZ, o);
      hipRoof(cx, GY + 3.5, 5.0, 3.8, 0.6);
      // cửa bên đóng: cánh gỗ sơn son
      box(2.6, 3.1, 0.12, std('#7d2217', { roughness: 0.5 }), cx, GY + 1.8, GZ, o);
      // tường nối cửa giữa với cửa bên, tường bao chạy ra hai phía
      box(1.3, 3.0, 0.7, wallM, sx * 3.7, GY + 1.74, GZ, o);
      box(0.9, 0.2, 0.9, tileM, sx * 3.7, GY + 3.34, GZ, o);
      box(12, 2.4, 0.6, wallM, sx * 13.7, GY + 1.44, GZ, o);
      box(12.2, 0.18, 0.9, tileM, sx * 13.7, GY + 2.72, GZ, o);
      obstacles.push(sx > 0
        ? { minX: 1.75, maxX: 20.1, minZ: GZ - 1.9, maxZ: GZ + 1.9 }
        : { minX: -20.1, maxX: -1.75, minZ: GZ - 1.9, maxZ: GZ + 1.9 });
    }
    // hai sư tử đá giữ cửa, phía sân trước
    for (const sx of [-1, 1]) {
      box(0.9, 0.6, 0.9, stoneM, sx * 3.0, GY + 0.54, GZ + 3.4, o);
      mesh(new THREE.SphereGeometry(0.42, 12, 10), stoneL, sx * 3.0, GY + 1.2, GZ + 3.45, o).scale.set(0.9, 1.1, 1);
      mesh(new THREE.SphereGeometry(0.3, 12, 10), stoneL, sx * 3.0, GY + 1.72, GZ + 3.6, o);
    }
  }

  // ---------- Tháp 13 tầng và tiểu cảnh, phía đối diện tượng Quan Âm ----------
  const TW = TOWER;
  const towerParts = { wall: [], tile: [], red: [], trim: [], gold: [], win: [], wood: [] };
  const towerMats = {
    wall: std('#ece3cf', { roughness: 0.9 }),
    tile: std('#6a3426', { roughness: 0.75 }),
    red: std('#9c2a1c', { roughness: 0.55 }),
    trim: std('#bdb4a2', { roughness: 0.9 }),
    gold: M.gold,
    win: std('#2c2018', { emissive: '#ffb25e', emissiveIntensity: 0, roughness: 0.8 }),
    wood: std('#6b3f26', { roughness: 0.6 }),
  };
  // thêm một khối hình vào tháp (gộp lại theo vật liệu): nghiêng rz, xoay quanh trục đứng ry, đặt lệch (x, z) so với tâm tháp
  function tp(key, geo, x, y, z, ry = 0, rz = 0) {
    if (rz) geo.rotateZ(rz);
    if (ry) geo.rotateY(ry);
    geo.translate(TW.x + x, y, TW.z + z);
    towerParts[key].push(geo.index ? geo.toNonIndexed() : geo);
  }
  const oct = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 8).rotateY(Math.PI / 8);
  const COS8 = Math.cos(Math.PI / 8);
  {
    // nền đá bát giác
    tp('trim', oct(TW.plinthR, TW.plinthR + 0.1, TOWER_BASE), 0, GY + TOWER_BASE / 2, 0);
    let y = GY + TOWER_BASE;
    TOWER_LEVELS.forEach(({ r, h }, i) => {
      const rw = r * 0.86; // tường
      if (i < 12) {
        const wh = h - 0.3;
        tp('wall', oct(rw * 0.97, rw, wh), 0, y + wh / 2, 0);
        tp('trim', oct(rw + 0.1, rw + 0.12, 0.1), 0, y + 0.05, 0); // gờ chân tường
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('red', new THREE.BoxGeometry(0.13, wh, 0.13), Math.sin(a) * (rw + 0.02), y + wh / 2, Math.cos(a) * (rw + 0.02), a);
          // cửa sổ vòm trên mỗi mặt; mặt trông ra sân ở tầng trệt là cửa vào
          const f = (k * Math.PI) / 4, ap = rw * COS8 * 0.985;
          const door = i === 0 && k === 2;
          const ww = door ? 1.35 : Math.max(0.38, 0.58 - i * 0.014), wh2 = door ? 1.8 : Math.max(0.55, 0.88 - i * 0.02);
          const wy = door ? y + wh2 / 2 + 0.05 : y + wh * 0.52;
          tp('gold', new THREE.BoxGeometry(ww + 0.16, wh2 + 0.16, 0.04), Math.sin(f) * ap, wy, Math.cos(f) * ap, f);
          tp('win', new THREE.BoxGeometry(ww, wh2, 0.06), Math.sin(f) * (ap + 0.01), wy, Math.cos(f) * (ap + 0.01), f);
          if (door) tp('red', new THREE.BoxGeometry(1.75, 0.34, 0.05), Math.sin(f) * (ap + 0.03), wy + wh2 / 2 + 0.3, Math.cos(f) * (ap + 0.03), f);
        }
        // mái hiên bát giác, đầu đao vểnh lên ở tám góc (nghiêng ra ngoài theo hướng xuyên tâm)
        const ey = y + wh + 0.17;
        tp('tile', oct(rw * 0.88, r * 1.1, 0.36), 0, ey, 0);
        tp('red', oct(r * 1.1, r * 1.11, 0.05), 0, ey - 0.18, 0);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('tile', new THREE.ConeGeometry(0.07, 0.38, 6), Math.sin(a) * r * 1.11, ey - 0.06, Math.cos(a) * r * 1.11, a - Math.PI / 2, -0.55);
        }
      } else {
        // tầng 13: điện thờ mở bốn phía, cột son, lan can thấp
        tp('trim', oct(r * 0.98, r * 0.98, 0.12), 0, y + 0.06, 0);
        tp('wood', oct(TW.topR + 0.18, TW.topR + 0.18, 0.02), 0, TW.topY + 0.005, 0);
        const ch = 2.15, rc = r * 0.86;
        const side = 2 * rc * Math.sin(Math.PI / 8);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('red', new THREE.CylinderGeometry(0.095, 0.11, ch, 10), Math.sin(a) * rc, TW.topY + ch / 2, Math.cos(a) * rc);
          const f = (k * Math.PI) / 4, ap = rc * COS8;
          tp('red', new THREE.BoxGeometry(side - 0.12, 0.075, 0.075), Math.sin(f) * ap, TW.topY + 0.54, Math.cos(f) * ap, f);
          for (let j = -3; j <= 3; j++) {
            tp('red', new THREE.BoxGeometry(0.04, 0.48, 0.04), Math.sin(f) * ap + Math.cos(f) * j * side * 0.13, TW.topY + 0.27, Math.cos(f) * ap - Math.sin(f) * j * side * 0.13);
          }
          tp('gold', new THREE.BoxGeometry(side - 0.12, 0.14, 0.055), Math.sin(f) * ap, TW.topY + ch - 0.13, Math.cos(f) * ap, f);
        }
        // trần gỗ, mái lớn và chóp tháp
        const ry = TW.topY + ch;
        tp('wood', oct(r * 0.95, r * 0.95, 0.08), 0, ry + 0.04, 0);
        tp('tile', oct(0.75, r * 1.28, 1.15), 0, ry + 0.65, 0);
        tp('red', oct(r * 1.28, r * 1.29, 0.06), 0, ry + 0.08, 0);
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          tp('gold', new THREE.ConeGeometry(0.07, 0.45, 6), Math.sin(a) * r * 1.29, ry + 0.16, Math.cos(a) * r * 1.29, a - Math.PI / 2, -0.55);
        }
        const sy = ry + 1.22;
        tp('gold', new THREE.CylinderGeometry(0.4, 0.56, 0.34, 16), 0, sy + 0.17, 0);
        tp('gold', new THREE.CylinderGeometry(0.045, 0.065, 2.1, 8), 0, sy + 1.35, 0);
        for (let j = 0; j < 7; j++) tp('gold', new THREE.CylinderGeometry(0.38 - j * 0.038, 0.38 - j * 0.038, 0.055, 16), 0, sy + 0.5 + j * 0.22, 0);
        tp('gold', new THREE.SphereGeometry(0.24, 16, 12), 0, sy + 2.2, 0);
        tp('gold', new THREE.SphereGeometry(0.15, 14, 10), 0, sy + 2.54, 0);
        tp('gold', new THREE.ConeGeometry(0.07, 0.45, 10), 0, sy + 2.88, 0);
      }
      y += h;
    });
    const tower = new THREE.Group();
    tower.userData.kind = 'tower';
    for (const [key, list] of Object.entries(towerParts)) {
      const m = new THREE.Mesh(mergeGeometries(list), towerMats[key]);
      m.castShadow = m.receiveShadow = true;
      tower.add(m);
    }
    scene.add(tower);
    pickables.push(tower);
    obstacles.push({ x: TW.x, z: TW.z, r: TW.plinthR + 0.35 });
  }
  nightHooks.push((night) => (towerMats.win.emissiveIntensity = 0.85 * night));

  // tầng 13: bàn thờ, xá lợi Phật tròn phát sáng trên đài sen, lư hương, nến
  const TOP_RELIC = new THREE.Vector3(TW.x - 1.75, TW.topY + 1.26, TW.z);
  {
    box(1.6, 0.48, 1.85, M.lacquer, TW.x - 1.72, TW.topY + 0.24, TW.z);
    box(1.68, 0.06, 1.92, M.gold, TW.x - 1.72, TW.topY + 0.48, TW.z, { cast: false });
    const R = TOP_RELIC;
    const relic = new THREE.Group();
    relic.position.copy(R);
    scene.add(relic);
    // đài sen vàng: chân tròn, hai lớp cánh sen ngửa đỡ viên xá lợi
    const lotusGold = std('#d9a54e', { metalness: 0.85, roughness: 0.3 });
    cyl(0.22, 0.28, 0.12, lotusGold, R.x, TW.topY + 0.57, R.z, { cast: false }, 20);
    cyl(0.08, 0.13, 0.32, lotusGold, R.x, TW.topY + 0.79, R.z, { cast: false }, 14);
    const petalGeo = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    for (const [n, r, y, tilt, sx] of [[12, 0.2, -0.3, 0.75, 0.085], [8, 0.13, -0.26, 0.45, 0.07]]) {
      for (let k = 0; k < n; k++) {
        const a = ((k + (n === 8 ? 0.5 : 0)) / n) * Math.PI * 2;
        const pg = new THREE.Group();
        pg.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        pg.rotation.y = -a + Math.PI / 2;
        const p = new THREE.Mesh(petalGeo, lotusGold);
        p.scale.set(sx, 0.17, 0.04);
        p.rotation.x = -tilt;
        pg.add(p);
        relic.add(pg);
      }
    }
    // viên xá lợi: lõi sáng trắng ngà, vỏ ngọc trong suốt bao ngoài
    const coreM = new THREE.MeshStandardMaterial({ color: '#fff6dc', emissive: '#ffe2a0', emissiveIntensity: 1.6, roughness: 0.25 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 20), coreM);
    relic.add(core);
    const shellM = new THREE.MeshBasicMaterial({ color: '#ffe9b8', transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 20), shellM);
    relic.add(shell);
    // hào quang tỏa tròn và vòng sáng xoay chậm
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd67a', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(1.3);
    relic.add(halo);
    const haloBig = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffb84a', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    haloBig.scale.setScalar(3.2);
    relic.add(haloBig);
    const ringM = new THREE.MeshBasicMaterial({ color: '#ffe0a0', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const rings = [0.3, 0.38].map((r, k) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 64), ringM);
      ring.rotation.set(Math.PI / 2 + (k ? 0.5 : -0.4), 0, 0);
      relic.add(ring);
      return ring;
    });
    // tia sáng nhẹ quanh viên ngọc
    const motes = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 28 }, () => new THREE.Vector3().randomDirection().multiplyScalar(rnd(0.26, 0.5)))),
      new THREE.PointsMaterial({ map: glowTex, color: '#fff0c0', size: 0.06, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    relic.add(motes);
    const relicLight = new THREE.PointLight('#ffd690', 3, 7, 2);
    relic.add(relicLight);
    let nightK = 0;
    nightHooks.push((night) => (nightK = night));
    updaters.push((t) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
      core.position.y = shell.position.y = Math.sin(t * 0.9) * 0.015;
      coreM.emissiveIntensity = 1.4 + 0.6 * pulse;
      halo.material.opacity = 0.55 + 0.25 * pulse;
      halo.scale.setScalar(1.15 + 0.15 * pulse);
      haloBig.material.opacity = (0.15 + 0.15 * pulse) * (0.6 + 0.6 * nightK);
      relicLight.intensity = (2.5 + 1.5 * pulse) * (1 + 2.5 * nightK);
      rings[0].rotation.z = t * 0.5;
      rings[1].rotation.z = -t * 0.35;
      motes.rotation.y = t * 0.25;
    });
    for (const dz of [-0.76, 0.76]) {
      cyl(0.055, 0.065, 0.04, M.bronze, TW.x - 1.05, TW.topY + 0.53, TW.z + dz);
      cyl(0.032, 0.032, 0.18, M.candle, TW.x - 1.05, TW.topY + 0.64, TW.z + dz);
      flame(TW.x - 1.05, TW.topY + 0.79, TW.z + dz, 0.85);
    }
    // đèn ấm trong điện thờ, sáng hơn về đêm
    const topLight = new THREE.PointLight('#ffc27a', 5, 8, 2);
    topLight.position.set(TW.x - 0.3, TW.topY + 1.9, TW.z);
    scene.add(topLight);
    nightHooks.push((night) => (topLight.intensity = 5 + 16 * night));
    // kệ nhỏ đặt lư hương trước bàn thờ
    box(0.42, 0.52, 0.58, M.lacquer, TW.x - 0.65, TW.topY + 0.26, TW.z);
    cyl(0.16, 0.13, 0.15, M.bronze, TW.x - 0.65, TW.topY + 0.59, TW.z);
  }
  const incenseTop = makeBurner({
    center: new THREE.Vector3(TW.x - 0.65, TW.topY + 0.65, TW.z),
    radius: 0.1,
    spots: [-0.55, 0, 0.55].map((dz) => ({ x: TW.x + 0.1, z: TW.z + dz })),
    target: TOP_RELIC,
    smoke: 24,
    min: 2,
  });

  // tiểu cảnh quanh tháp: thảm cỏ, đường đá, đèn đá, cây cảnh, tùng, đá
  {
    const grassT = mesh(new THREE.CircleGeometry(8.2, 48), groundMat('grass', { tile: 4, macro: 0.08, tint: '#f4ffe8', ...POFF }), TW.x, GY + 0.032, TW.z, { cast: false });
    grassT.rotation.x = -Math.PI / 2;
    grassT.userData.kind = 'ground';
    pickables.push(grassT);
    for (let x = TW.x + TW.plinthR + 0.45; x < -1.7; x += 0.8) {
      const st = mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.05, 12), stoneL, x, GY + 0.045, TW.z + rnd(-0.08, 0.08), { cast: false });
      st.scale.z = rnd(0.75, 0.95);
    }
    stoneLantern(TW.x + 6.6, TW.z - 2.1);
    stoneLantern(TW.x + 6.6, TW.z + 2.1);
    // hai chậu cây cảnh hai bên cửa tháp
    for (const dz of [-1.45, 1.45]) {
      const px = TW.x + 6.1, pz = TW.z + dz;
      cyl(0.26, 0.2, 0.3, std('#5b4a3c', { roughness: 0.8 }), px, GY + 0.15, pz);
      mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), std('#5a4030', { roughness: 0.9 }), px, GY + 0.5, pz);
      for (const [dx, dy, dzz, s] of [[0, 0.82, 0, 0.32], [0.18, 0.66, 0.1, 0.22], [-0.16, 0.7, -0.08, 0.2]]) {
        mesh(new THREE.SphereGeometry(s, 10, 8), leafD, px + dx, GY + dy, pz + dzz).scale.y = 0.6;
      }
      obstacles.push({ x: px, z: pz, r: 0.35 });
    }
    bush(TW.x - 6.4, TW.z - 3.2); bush(TW.x - 6.6, TW.z + 3.0, 1.1); bush(TW.x - 2.8, TW.z - 6.7, 0.9); bush(TW.x + 3.2, TW.z + 6.7, 0.8);
    flowers(TW.x + 4.6, TW.z - 4.8); flowers(TW.x + 4.6, TW.z + 4.8); flowers(TW.x - 1.2, TW.z + 7.1, 10);
    // cây tùng nhiều tầng tán
    {
      const px = TW.x - 4.2, pz = TW.z + 6.6;
      mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.6, 8), std('#5a4030', { roughness: 0.9 }), px, GY + 0.8, pz);
      for (const [y, r] of [[1.2, 1.0], [1.85, 0.8], [2.45, 0.58], [2.95, 0.36]]) {
        mesh(new THREE.ConeGeometry(r, 0.75, 9), leafD, px, GY + y, pz);
      }
      obstacles.push({ x: px, z: pz, r: 0.6 });
    }
    // cụm đá
    for (const [x, z, s] of [[TW.x + 3.2, TW.z - 6.8, 0.5], [TW.x + 3.8, TW.z - 6.3, 0.32], [TW.x - 7.1, TW.z - 0.3, 0.45], [TW.x - 7.3, TW.z + 0.5, 0.3]]) {
      const r = mesh(new THREE.DodecahedronGeometry(s, 0), rockM, x, GY + s * 0.45, z);
      r.scale.set(1.2, 0.75, 1);
      r.rotation.y = rnd(0, 6);
      obstacles.push({ x, z, r: s + 0.25 });
    }
  }

  nightHooks.push((night) => {
    lampMat.emissiveIntensity = 2.2 * night;
    for (const g of lampGlows) g.material.opacity = 0.7 * night;
  });

  // Đẩy điểm đến ra khỏi bệ tượng, hồ, cây, tường bao… (đi lại ngoài sân)
  obstacles.push({ minX: -15.9, maxX: 15.9, minZ: -25.3, maxZ: 22.1 }); // khối kiến trúc chánh điện khi đi ngoài sân
  function pushOut(x, z) {
    for (const o of obstacles) {
      if (o.minX != null) {
        if (x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ) {
          const dl = x - o.minX, dr = o.maxX - x, db = z - o.minZ, dt = o.maxZ - z;
          const m = Math.min(dl, dr, db, dt);
          if (m === dl) x = o.minX - 0.05;
          else if (m === dr) x = o.maxX + 0.05;
          else if (m === db) z = o.minZ - 0.05;
          else z = o.maxZ + 0.05;
        }
      } else if (o.rx) {
        const nx = (x - o.x) / o.rx, nz = (z - o.z) / o.rz;
        const d = Math.hypot(nx, nz);
        if (d < 1) {
          const k = d < 1e-3 ? 1 : 1.02 / d;
          x = o.x + (d < 1e-3 ? -o.rx * 1.02 : nx * k * o.rx);
          z = o.z + nz * (d < 1e-3 ? 0 : k * o.rz);
        }
      } else {
        const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz);
        if (d < o.r) {
          const k = d < 1e-3 ? 1 : (o.r * 1.02) / d;
          x = o.x + (d < 1e-3 ? -o.r * 1.02 : dx * k);
          z = o.z + (d < 1e-3 ? 0 : dz * k);
        }
      }
    }
    return [x, z];
  }

  // ---------- Đèn lồng ----------
  let lanternMat;
  const lanternGlows = [];
  {
    const red = (lanternMat = std('#c4301e', { emissive: '#ff4a20', emissiveIntensity: 0.55, roughness: 0.6 }));
    const lanterns = [];
    for (const x of [-5, 5]) for (const z of [-8, 0, 8]) {
      const g = new THREE.Group();
      g.position.set(x, 9.4, z);
      scene.add(g);
      cyl(0.01, 0.01, 2.0, M.darkWood, 0, -1.0, 0, { parent: g, cast: false }, 4);
      const body = mesh(new THREE.SphereGeometry(0.45, 20, 14), red, 0, -2.6, 0, { parent: g, cast: false });
      body.scale.set(1, 1.25, 1);
      cyl(0.2, 0.25, 0.12, M.gold, 0, -2.0, 0, { parent: g, cast: false });
      cyl(0.25, 0.2, 0.12, M.gold, 0, -3.18, 0, { parent: g, cast: false });
      cyl(0.03, 0.06, 0.5, std('#e0b04a'), 0, -3.5, 0, { parent: g, cast: false }, 6);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff8a4a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
      gl.scale.set(2.4, 2.8, 1);
      lanternGlows.push(gl);
      gl.position.y = -2.6;
      g.add(gl);
      g.userData.seed = Math.random() * 6;
      lanterns.push(g);
    }
    updaters.push((t) => lanterns.forEach((g) => {
      g.rotation.z = Math.sin(t * 0.7 + g.userData.seed) * 0.015;
      g.rotation.x = Math.cos(t * 0.5 + g.userData.seed) * 0.01;
    }));
  }

  // ---------- Trang trí các điện: cửa võng thếp vàng, tràng phan, hạc chầu trên lưng rùa, bình gốm cắm sen ----------
  {
    const giltM = (map) => new THREE.MeshStandardMaterial({ map, color: '#ffffff', metalness: 0.85, roughness: 0.32, envMapIntensity: 1.6, alphaTest: 0.5, side: THREE.DoubleSide });
    // cửa võng: tấm chạm lộng treo trước bàn thờ (mặt nhìn về phía người lễ: hướng +z)
    const cuaVong = (cx, z, yBot, yTop, halfW, topFrac = 0.2) => {
      const wv = halfW * 2, hv = yTop - yBot;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(wv, hv), giltM(T.cuaVongTex(wv / hv, topFrac)));
      m.position.set(cx, (yBot + yTop) / 2, z);
      scene.add(m);
      // xà gỗ sơn son đỡ phía trên
      box(wv + 0.3, 0.22, 0.24, M.lacquer, cx, yTop + 0.11, z - 0.05);
      return m;
    };
    // tràng phan: dải lụa treo từ trần, khẽ lay
    const phans = [];
    const phan = (x, yTop, z, len, wid = 0.75, words) => {
      const g = new THREE.Group();
      g.position.set(x, yTop, z);
      scene.add(g);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(wid, len, 1, 8).translate(0, -len / 2, 0), new THREE.MeshStandardMaterial({ map: T.phanTex(words), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 }));
      g.add(cloth);
      cyl(0.03, 0.03, wid + 0.2, M.gold, 0, 0, 0, { parent: g, cast: false }, 6).rotation.z = Math.PI / 2;
      for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(0.05, 8, 6), M.gold, sx * (wid / 2 + 0.12), 0, 0, { parent: g, cast: false });
      g.userData.seed = Math.random() * 6;
      phans.push(g);
    };
    // hạc đồng đứng trên lưng rùa (biểu tượng trường thọ, hài hoà trời đất), quay mặt ra phía trước
    const bronzeH = std('#7a5a2e', { metalness: 0.75, roughness: 0.38, envMapIntensity: 1.3 });
    const hacRua = (x, y, z, sc = 1, ry = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = ry;
      g.scale.setScalar(sc);
      scene.add(g);
      const add = (geo, px, py, pz, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
        const m = new THREE.Mesh(geo, bronzeH);
        m.position.set(px, py, pz);
        m.rotation.set(rx, 0, rz);
        m.scale.set(sx, sy, sz);
        m.castShadow = true;
        g.add(m);
        return m;
      };
      // rùa: mai vòm, đầu ngẩng, bốn chân
      add(new THREE.SphereGeometry(0.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.12, 0, 0, 0, 1.15, 0.65, 1.4);
      add(new THREE.CylinderGeometry(0.62, 0.66, 0.12, 20), 0, 0.12, 0, 0, 0, 1, 1, 1.2);
      add(new THREE.SphereGeometry(0.15, 12, 10), 0, 0.3, 0.78, 0, 0, 1, 0.85, 1.25);
      for (const [lx, lz] of [[-0.5, 0.45], [0.5, 0.45], [-0.5, -0.45], [0.5, -0.45]]) add(new THREE.SphereGeometry(0.13, 10, 8), lx, 0.08, lz, 0, 0, 1.2, 0.6, 1.4);
      // hạc: hai chân cao, thân thon, cánh khép, cổ dài cong, mỏ ngậm (hướng +z)
      for (const lx of [-0.12, 0.12]) add(new THREE.CylinderGeometry(0.028, 0.035, 0.95, 8), lx, 0.75, 0.0);
      add(new THREE.SphereGeometry(0.3, 16, 12), 0, 1.35, 0, -0.25, 0, 0.75, 0.8, 1.35);
      for (const sx of [-1, 1]) add(new THREE.SphereGeometry(0.28, 12, 8), sx * 0.16, 1.4, -0.08, -0.35, sx * 0.25, 0.25, 0.7, 1.35);
      const neck = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.5, 0.3), new THREE.Vector3(0, 1.85, 0.42), new THREE.Vector3(0, 2.2, 0.32), new THREE.Vector3(0, 2.42, 0.42)]), 16, 0.055, 8);
      add(neck, 0, 0, 0);
      add(new THREE.SphereGeometry(0.1, 12, 10), 0, 2.46, 0.46, 0, 0, 1, 0.9, 1.2);
      add(new THREE.ConeGeometry(0.035, 0.32, 8), 0, 2.44, 0.68, Math.PI / 2 + 0.25);
      add(new THREE.ConeGeometry(0.12, 0.45, 10), 0, 1.25, -0.6, -Math.PI / 2 - 0.4); // đuôi
    };
    // bình gốm men lam cắm sen (đặt dưới đất)
    const vaseM = std('#eef1f2', { roughness: 0.22 }), blueM = std('#2d4f8f', { roughness: 0.3 });
    const binhSen = (x, y, z, sc = 1) => {
      lathe([[0, 0], [0.22 * sc, 0], [0.34 * sc, 0.25 * sc], [0.36 * sc, 0.55 * sc], [0.22 * sc, 0.85 * sc], [0.15 * sc, 1.0 * sc], [0.19 * sc, 1.08 * sc], [0.18 * sc, 1.08 * sc]], vaseM, x, y, z);
      for (const [hy, rr] of [[0.25, 0.34], [0.55, 0.36], [0.95, 0.165]]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rr * sc, 0.018 * sc, 6, 28).rotateX(Math.PI / 2), blueM);
        ring.position.set(x, y + hy * sc, z);
        scene.add(ring);
      }
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2, lean = 0.12 * sc, hh = (0.6 + (k % 3) * 0.12) * sc;
        const stem = cyl(0.01 * sc, 0.012 * sc, hh, std('#5e7f3a'), x + Math.cos(a) * lean * 0.5, y + 1.08 * sc + hh / 2, z + Math.sin(a) * lean * 0.5, { cast: false }, 5);
        stem.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2);
        lotus(x + Math.cos(a) * lean * 1.1, y + 1.08 * sc + hh, z + Math.sin(a) * lean * 1.1, 0.13 * sc);
      }
      // lá sen to xoè trên miệng bình
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1;
        const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.22 * sc, 18, 0.3, Math.PI * 2 - 0.6), std('#3f7a34', { roughness: 0.6, side: THREE.DoubleSide }));
        leaf.position.set(x + Math.cos(a) * 0.2 * sc, y + (1.3 + k * 0.08) * sc, z + Math.sin(a) * 0.2 * sc);
        leaf.rotation.set(-Math.PI / 2 + Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
        scene.add(leaf);
      }
    };

    // Chánh điện: cửa võng giữa hai cột trước bệ thờ (dải trên mỏng, treo cao hơn hoành phi), tràng phan, hạc, bình sen
    cuaVong(0, -16.15, 3.9, 9.85, 9.15, 0.06);
    for (const s of [-1, 1]) {
      phan(s * 8.0, 9.6, -15.4, 4.6, 0.8);
      binhSen(s * 8.0, 0, -14.9, 1.05);
      hacRua(s * 6.5, 0, -14.2, 1.0, 0); // tránh thùng công đức ở x = 5,2
      obstacles.push({ x: s * 6.5, z: -14.2, r: 0.8 }, { x: s * 8.0, z: -14.9, r: 0.5 });
    }
    // Điện Quan Âm: cửa võng trước bàn thờ, tràng phan "Nam Mô Quan Thế Âm Bồ Tát", hạc, bình sen
    {
      const QG = PORCH.courtY + 0.21;
      cuaVong(QAHALL.cx, QAHALL.z0 + 2.65, QG + 1.85, QG + 4.25, 3.6, 0.17);
      for (const s of [-1, 1]) {
        phan(QAHALL.cx + s * 4.6, QG + 4.25, QAHALL.z0 + 2.3, 3.0, 0.62, ['NAM', 'MÔ', 'QUAN', 'THẾ', 'ÂM', 'BỒ', 'TÁT']);
        binhSen(QAHALL.cx + s * 4.6, QG, QAHALL.z0 + 2.9, 0.8);
        hacRua(QAHALL.cx + s * 3.0, QG, QAHALL.z0 + 3.5, 0.72, 0);
        obstacles.push({ x: QAHALL.cx + s * 3.0, z: QAHALL.z0 + 3.5, r: 0.6 });
      }
    }
    // Điện Tam Thế: cửa võng rộng trước ba tượng, tràng phan, hạc, bình sen
    {
      const TG = TERRACE.y + 0.21;
      cuaVong(0, TAMTHE.z0 + 3.0, TG + 2.5, TG + 6.0, 10.4, 0.1);
      for (const s of [-1, 1]) {
        phan(s * 9.0, TG + 5.9, TAMTHE.z0 + 2.6, 3.8, 0.75);
        binhSen(s * 9.0, TG, TAMTHE.z0 + 3.2, 0.95);
        hacRua(s * 3.3, TG, TAMTHE.z0 + 4.8, 0.85, 0);
        obstacles.push({ x: s * 3.3, z: TAMTHE.z0 + 4.8, r: 0.7 });
      }
    }
    updaters.push((t) => phans.forEach((g) => {
      g.rotation.x = Math.sin(t * 0.6 + g.userData.seed) * 0.025;
      g.rotation.z = Math.sin(t * 0.43 + g.userData.seed * 1.7) * 0.015;
    }));
  }

  // ---------- Hoa đăng trên hồ sen (trôi giữa các lá sen, hoa sen), cờ Phật giáo ngũ sắc dọc trục đường ----------
  // Dựng sẵn; main.js bật bằng setFestival(true) — nay ngày nào cũng hiển thị. Không gộp lô để vẫn bật / tắt được.
  const fest = new THREE.Group();
  fest.visible = false;
  scene.add(fest);
  {
    // hoa đăng: đế lá xanh, cánh sen giấy hồng, ngọn nến sáng, trôi chậm theo vòng trong hồ
    const ponds = [
      { x: PD.x - 0.6, z: PD.z + 0.15, rx: PD.rx * 0.62, rz: PD.rz * 0.62, n: 7, y: GY + 0.075 },
      { x: -9.2, z: 61, rx: 3.6 * 0.72, rz: 16 * 0.85, n: 22, y: GY + 0.035 },
      { x: 9.2, z: 61, rx: 3.6 * 0.72, rz: 16 * 0.85, n: 22, y: GY + 0.035 },
    ];
    const total = ponds.reduce((s, p) => s + p.n, 0);
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.17, 0.035, 10);
    const cupGeo = new THREE.CylinderGeometry(0.17, 0.07, 0.13, 8, 1, true).translate(0, 0.085, 0);
    const petalGeo = new THREE.ConeGeometry(0.06, 0.16, 4).translate(0, 0.08, 0);
    const baseM = std('#3f7a34', { roughness: 0.8 });
    const cupM = std('#f6a9b8', { emissive: '#ff7a8a', emissiveIntensity: 0.25, roughness: 0.7, side: THREE.DoubleSide });
    const petalM = std('#f8c0cc', { emissive: '#ff8a9a', emissiveIntensity: 0.2, roughness: 0.7 });
    const PET = 6;
    const bases = new THREE.InstancedMesh(baseGeo, baseM, total);
    const cups = new THREE.InstancedMesh(cupGeo, cupM, total);
    const petals = new THREE.InstancedMesh(petalGeo, petalM, total * PET);
    for (const m of [bases, cups, petals]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = false;
      m.frustumCulled = false;
      fest.add(m);
    }
    const flameGeo = new THREE.BufferGeometry();
    const flamePos = new Float32Array(total * 3);
    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3).setUsage(THREE.DynamicDrawUsage));
    const flames = new THREE.Points(flameGeo, new THREE.PointsMaterial({
      map: glowTex, color: '#ffc46a', size: 0.55, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    flames.frustumCulled = false;
    fest.add(flames);
    const items = [];
    for (const p of ponds) for (let i = 0; i < p.n; i++) {
      items.push({ p, a: rnd(0, Math.PI * 2), r: 0.25 + 0.75 * Math.sqrt(Math.random()), w: rnd(0.012, 0.035) * (Math.random() < 0.5 ? -1 : 1), spin: rnd(0, 6), seed: rnd(0, 6) });
    }
    const o = new THREE.Object3D(), q = new THREE.Object3D();
    let lastT = null;
    updaters.push((t) => {
      if (!fest.visible) return;
      const dt = lastT == null ? 0 : Math.min(t - lastT, 0.1);
      lastT = t;
      items.forEach((it, i) => {
        it.a += it.w * dt;
        it.spin += it.w * 2 * dt;
        const x = it.p.x + Math.cos(it.a) * it.r * it.p.rx, z = it.p.z + Math.sin(it.a) * it.r * it.p.rz;
        const y = it.p.y + Math.sin(t * 1.3 + it.seed) * 0.006;
        o.position.set(x, y, z);
        o.rotation.set(Math.sin(t * 0.9 + it.seed) * 0.04, it.spin, Math.cos(t * 0.8 + it.seed) * 0.04);
        o.scale.setScalar(1);
        o.updateMatrix();
        bases.setMatrixAt(i, o.matrix);
        cups.setMatrixAt(i, o.matrix);
        for (let k = 0; k < PET; k++) {
          const ang = (k / PET) * Math.PI * 2;
          q.position.set(Math.cos(ang) * 0.15, 0.02, Math.sin(ang) * 0.15);
          q.rotation.set(0, -ang, 0);
          q.rotateZ(-0.55);
          q.updateMatrix();
          q.matrix.premultiply(o.matrix);
          petals.setMatrixAt(i * PET + k, q.matrix);
        }
        flamePos[i * 3] = x;
        flamePos[i * 3 + 1] = y + 0.17;
        flamePos[i * 3 + 2] = z;
      });
      bases.instanceMatrix.needsUpdate = cups.instanceMatrix.needsUpdate = petals.instanceMatrix.needsUpdate = true;
      flameGeo.attributes.position.needsUpdate = true;
    });
    nightHooks.push((night) => {
      cupM.emissiveIntensity = 0.25 + 1.4 * night;
      petalM.emissiveIntensity = 0.2 + 1.1 * night;
      flames.material.opacity = 0.35 + 0.6 * night;
      flames.material.size = 0.45 + 0.5 * night;
    });

    // cờ ngũ sắc: cột tre hai bên trục đường (tránh sân giếng và lối ngang sang hành lang)
    const flagTex = T.buddhistFlag();
    const poleM = std('#c9b27a', { roughness: 0.75 });
    const flagM = new THREE.MeshStandardMaterial({ map: flagTex, roughness: 0.85, side: THREE.DoubleSide });
    const POLE_H = 5.2, FW = 1.2, FH = 0.8;
    const poleZ = [41.5, 48, 54.5, 69, 74.5]; // xen giữa các đèn đá (z 45, 51, 72, 77)
    const flags = [];
    for (const z of poleZ) for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, POLE_H, 6), poleM);
      pole.position.set(s * 4.6, GY + POLE_H / 2, z);
      pole.castShadow = true;
      fest.add(pole);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M.gold);
      tip.position.set(s * 4.6, GY + POLE_H + 0.05, z);
      fest.add(tip);
      // lá cờ treo bên cột, bay ra phía ngoài trục đường; lưới nhiều ô để gợn sóng
      const geo = new THREE.PlaneGeometry(FW, FH, 10, 4).translate(FW / 2, 0, 0);
      const flag = new THREE.Mesh(geo, flagM);
      flag.position.set(s * 4.6, GY + POLE_H - FH / 2 - 0.08, z);
      flag.rotation.y = s > 0 ? 0 : Math.PI;
      flag.castShadow = true;
      flag.userData = { base: Float32Array.from(geo.attributes.position.array), seed: rnd(0, 6) };
      fest.add(flag);
      flags.push(flag);
    }
    updaters.push((t) => {
      if (!fest.visible) return;
      for (const f of flags) {
        const pos = f.geometry.attributes.position, b = f.userData.base;
        for (let i = 0; i < pos.count; i++) {
          const x = b[i * 3], y = b[i * 3 + 1];
          const k = x / FW; // càng xa cột càng gợn nhiều
          pos.setZ(i, Math.sin(t * 3.2 - x * 4.5 + f.userData.seed) * 0.09 * k);
          pos.setY(i, y - k * k * 0.06 + Math.sin(t * 2.1 + x * 3 + f.userData.seed) * 0.02 * k);
        }
        pos.needsUpdate = true;
        f.geometry.computeVertexNormals();
      }
    });

    // dây cờ đuôi nheo năm màu: chăng ngang qua đường giữa hai cột, và dọc theo mỗi bên
    const pennantGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.11, 0, 0), new THREE.Vector3(0.11, 0, 0), new THREE.Vector3(0, -0.3, 0)]);
    pennantGeo.computeVertexNormals();
    const top = GY + POLE_H - 0.15;
    const spans = poleZ.map((z) => [new THREE.Vector3(-4.6, top, z), new THREE.Vector3(4.6, top, z), 0.9]);
    for (let i = 0; i < poleZ.length - 1; i++) {
      if (poleZ[i + 1] - poleZ[i] > 10) continue; // không chăng qua sân giếng Ngọc
      for (const s of [-1, 1]) spans.push([new THREE.Vector3(s * 4.6, top, poleZ[i]), new THREE.Vector3(s * 4.6, top, poleZ[i + 1]), 0.55]);
    }
    const SPACING = 0.34;
    const slots = spans.map(([a, b, sag]) => ({ a, b, sag, n: Math.floor(a.distanceTo(b) / SPACING) }));
    const nP = slots.reduce((s, x) => s + x.n, 0);
    const pennants = new THREE.InstancedMesh(pennantGeo, new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide }), nP);
    const ropeM = new THREE.LineBasicMaterial({ color: '#5a4a3a' });
    const c = new THREE.Color();
    let j = 0;
    for (const { a, b, sag, n } of slots) {
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        pts.push(new THREE.Vector3().lerpVectors(a, b, u).setY(a.y - sag * 4 * u * (1 - u)));
      }
      fest.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ropeM));
      const dir = new THREE.Vector3().subVectors(b, a).setY(0).normalize();
      const ry = Math.atan2(-dir.z, dir.x);
      for (let i = 0; i < n; i++, j++) {
        const u = (i + 0.5) / n;
        o.position.lerpVectors(a, b, u).setY(a.y - sag * 4 * u * (1 - u));
        o.rotation.set(0, ry, 0);
        o.scale.setScalar(1);
        o.updateMatrix();
        pennants.setMatrixAt(j, o.matrix);
        pennants.setColorAt(j, c.set(T.FLAG_COLORS[j % 5]));
      }
    }
    pennants.castShadow = true;
    fest.add(pennants);
  }

  // ---------- Chiếu & bồ đoàn ----------
  const seats = [];
  for (const z of SEAT_Z) for (const x of SEAT_X) seats.push({ index: seats.length, x, z, y: 0, zone: 'in' });
  const hallSeatCount = seats.length;
  // Bồ đoàn trong điện Quan Âm (8 chỗ) và điện Tam Thế (12 chỗ) — đều bấm ngồi được
  for (const z of [11, 13]) for (const dx of [-3, -1.5, 1.5, 3]) {
    seats.push({ index: seats.length, x: QH.cx + dx, z, y: GY + 0.21, zone: 'out', out: true, place: 'qahall' });
  }
  for (const z of [TT.z0 + 7.6, TT.z0 + 9.4]) for (const x of [-7, -5, -3, 3, 5, 7]) {
    seats.push({ index: seats.length, x, z, y: H + 0.21, zone: 'out', out: true, place: 'tamthe' });
  }
  // bồ đoàn trước các bàn học: 16 chỗ ở 4 phòng ngoại ngữ, 6 chỗ trên lầu Phật pháp (ngồi quay mặt về bảng đen phía bắc)
  for (const k of STUDY.desks) seats.push({ index: seats.length, x: k.x, z: k.z, y: PORCH.courtY + STUDY.floor, zone: 'out', out: true, place: 'study', room: k.room });
  for (const k of UP.desks) seats.push({ index: seats.length, x: k.x, z: k.z + UP.VZ, y: UP.y, zone: 'out', out: true, place: 'study', room: k.room }); // tầng 2: toạ độ ảo
  // 12 bồ đoàn xếp vòng quanh đài sen trên đài thiền, ngồi xuống thì quay mặt vào đài sen
  for (let k = 0; k < 12; k++) {
    const a = ((k + 0.5) / 12) * Math.PI * 2;
    const x = ZEN_LOFT.x + Math.cos(a) * ZEN_LOFT.orbitR, z = ZEN_LOFT.z + Math.sin(a) * ZEN_LOFT.orbitR;
    seats.push({ index: seats.length, x, z, y: ZEN_LOFT.y, zone: 'out', out: true, place: 'zen', ry: Math.atan2(ZEN_LOFT.x - x, ZEN_LOFT.z - z) });
  }
  const matMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.05, 1.9), M.mat, hallSeatCount);
  const cushionMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.45, 0.16, 24), M.cushion, seats.length);
  {
    const o = new THREE.Object3D();
    for (const s of seats) {
      if (!s.out) {
        o.position.set(s.x, s.y + 0.025, s.z);
        o.updateMatrix();
        matMesh.setMatrixAt(s.index, o.matrix);
      }
      const [rx, rz] = toReal(s.x, s.z); // bồ đoàn tầng 2 đặt ở chỗ thật
      o.position.set(rx, s.y + (s.out ? 0.08 : 0.11), rz + (s.out ? 0 : 0.05));
      o.updateMatrix();
      cushionMesh.setMatrixAt(s.index, o.matrix);
    }
  }
  matMesh.receiveShadow = true;
  cushionMesh.castShadow = cushionMesh.receiveShadow = true;
  matMesh.userData.kind = cushionMesh.userData.kind = 'seat';
  scene.add(matMesh, cushionMesh);
  pickables.push(matMesh, cushionMesh);
  {
    // bồ đoàn tầng 2 khu tự học ẩn theo khi tầng 2 mờ đi (mình ở phòng tầng dưới, camera bay cao)
    const upSeats = seats.filter((s) => isUp(s.z)), keep = upSeats.map((s) => {
      const m = new THREE.Matrix4();
      cushionMesh.getMatrixAt(s.index, m);
      return m;
    });
    const hideM = new THREE.Matrix4().makeScale(0, 0, 0), setFade = study.studyUp.setFade;
    let hidden = false;
    study.studyUp.setFade = (v) => {
      setFade(v);
      if (v < 0.95 === hidden) return;
      hidden = v < 0.95;
      upSeats.forEach((s, i) => cushionMesh.setMatrixAt(s.index, hidden ? hideM : keep[i]));
      cushionMesh.instanceMatrix.needsUpdate = true;
    };
  }

  // ---------- Ánh sáng ----------
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x5a3a26, 1.25);
  scene.add(hemi);
  const fill = new THREE.DirectionalLight(0xfff2e0, 0.55);
  fill.position.set(-4, 9, 30);
  scene.add(fill);
  // vùng có bóng đổ đi theo người chơi (làm tròn 4 m cho bóng khỏi rung)
  const focus = new THREE.Vector3(0, 0, -1);
  const sun = new THREE.DirectionalLight(0xffdfac, 3.4);
  sun.position.set(32, 17, 8);
  sun.target.position.set(0, 0, -1);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const spot = new THREE.SpotLight(0xffd9a0, 230, 30, 0.42, 0.6, 2);
  spot.position.set(0, 9.2, -9);
  spot.target.position.copy(BUDDHA);
  scene.add(spot, spot.target);
  // đèn chiếu mặt từ bên trái, tạo khối cho gương mặt
  const faceLight = new THREE.SpotLight(0xffe4bd, 120, 22, 0.22, 0.5, 2);
  faceLight.position.set(-3.5, 7.5, -10.5);
  faceLight.target.position.set(0, 6.4, -18.6);
  // đèn hắt viền từ phía sau, làm sáng đường viền vàng
  const rim = new THREE.SpotLight(0xffc27a, 110, 14, 0.7, 0.6, 2);
  rim.position.set(0, 9.6, -21.2);
  rim.target.position.set(0, 4.5, -18.6);
  scene.add(faceLight, faceLight.target, rim, rim.target);

  // Vòng đánh dấu điểm đến
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.34, 40),
    new THREE.MeshBasicMaterial({ color: '#fff6df', transparent: true, opacity: 0, depthWrite: false }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.04;
  scene.add(marker);
  let markerStart = -10;
  let now = 0;
  updaters.push((t) => {
    now = t;
    const k = (t - markerStart) / 0.9;
    marker.visible = k < 1;
    if (marker.visible) {
      marker.scale.setScalar(0.6 + k * 0.9);
      marker.material.opacity = 0.9 * (1 - k);
    }
  });

  // ---------- Ngày và đêm theo giờ Việt Nam (UTC+7) ----------
  // [giờ, đỉnh trời, chân trời, mặt đất xa, màu nắng, độ nắng, độ sáng trời, mức đêm 0..1]
  const DAY_KEYS = [
    [0, '#050a1a', '#0f1830', '#0a0d16', '#000000', 0, 0.22, 1],
    [4.8, '#08102a', '#1c2240', '#10121c', '#000000', 0, 0.26, 1],
    [5.6, '#22335c', '#c27a62', '#4a3a40', '#ff9a60', 0.4, 0.5, 0.55],
    [6.5, '#5a80b0', '#f2b98a', '#a08070', '#ffc48a', 1.8, 0.85, 0.1],
    [8, '#7ea7c6', '#d6e3e4', '#efe1c4', '#ffe4b8', 3.0, 1.15, 0],
    [12, '#7ea7c6', '#d6e3e4', '#efe1c4', '#fff2da', 3.4, 1.25, 0],
    [16.5, '#7aa2c2', '#e8dcc4', '#ead8b8', '#ffdcaa', 3.0, 1.15, 0],
    [17.6, '#4d6a98', '#f2a26e', '#a07058', '#ff9c5c', 1.6, 0.8, 0.1],
    [18.4, '#22305a', '#b0605a', '#4a3438', '#ff7a48', 0.4, 0.5, 0.5],
    [19.2, '#0a1228', '#28284a', '#14141e', '#000000', 0, 0.28, 1],
    [24, '#050a1a', '#0f1830', '#0a0d16', '#000000', 0, 0.22, 1],
  ].map(([h, top, mid, bottom, sunC, sunI, hemiI, night]) => ({
    h, top: new THREE.Color(top), mid: new THREE.Color(mid), bottom: new THREE.Color(bottom), sunC: new THREE.Color(sunC), sunI, hemiI, night,
  }));

  // Sao và trăng (chỉ hiện về đêm)
  const starGeo = new THREE.BufferGeometry();
  {
    const pts = [];
    for (let i = 0; i < 900; i++) {
      const y = rnd(0.08, 1), r = Math.sqrt(1 - y * y), a = rnd(0, Math.PI * 2);
      pts.push(Math.cos(a) * r * 230, y * 230, Math.sin(a) * r * 230);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  scene.add(stars);
  const moonTex = T.canvasTexture(256, 256, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(255,252,235,1)');
    r.addColorStop(0.17, 'rgba(250,244,220,1)');
    r.addColorStop(0.2, 'rgba(220,230,255,0.35)');
    r.addColorStop(1, 'rgba(160,180,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, w);
  });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  moon.position.set(-70, 95, 170);
  moon.scale.setScalar(55);
  scene.add(moon);
  const moonLight = new THREE.DirectionalLight(0x9fb4ff, 0);
  moonLight.position.set(-20, 30, 25);
  scene.add(moonLight);
  // đèn trong chánh điện bật sáng về đêm
  const nightLamps = [new THREE.Vector3(0, 7, -7), new THREE.Vector3(0, 7, 4)].map((p) => {
    const L = new THREE.PointLight(0xffb070, 0, 15, 2);
    L.position.copy(p);
    scene.add(L);
    return L;
  });

  const vnHour = () => ((((Date.now() / 3.6e6 + 7) % 24) + 24) % 24);
  let hourOverride = null;
  const dayCol = { top: new THREE.Color(), mid: new THREE.Color(), bottom: new THREE.Color(), sun: new THREE.Color() };
  const hemiDay = new THREE.Color(0xfff0d8), hemiNight = new THREE.Color(0x7d8cc0);
  const ridgeNight = new THREE.Color('#1c2440'), white = new THREE.Color('#ffffff');
  let night = 0;
  function applyDayTime(h) {
    let k = 0;
    while (k < DAY_KEYS.length - 2 && h >= DAY_KEYS[k + 1].h) k++;
    const a = DAY_KEYS[k], b = DAY_KEYS[k + 1];
    const t = (h - a.h) / (b.h - a.h);
    const mix = (x, y) => x + (y - x) * t;
    dayCol.top.lerpColors(a.top, b.top, t);
    dayCol.mid.lerpColors(a.mid, b.mid, t);
    dayCol.bottom.lerpColors(a.bottom, b.bottom, t);
    dayCol.sun.lerpColors(a.sunC, b.sunC, t);
    night = mix(a.night, b.night);
    sky.material.uniforms.top.value.copy(dayCol.top);
    sky.material.uniforms.mid.value.copy(dayCol.mid);
    sky.material.uniforms.bottom.value.copy(dayCol.bottom);
    scene.fog.color.copy(dayCol.mid).lerp(dayCol.bottom, 0.4);
    // mặt trời mọc ở phía đông (+x) lúc 6 giờ, lặn ở phía tây lúc 18 giờ
    const th = (Math.PI * (h - 6)) / 12;
    sun.intensity = mix(a.sunI, b.sunI);
    sun.color.copy(dayCol.sun);
    sun.position.set(focus.x + Math.cos(th) * 30, 6 + Math.max(Math.sin(th), 0.05) * 22, focus.z + 12);
    hemi.intensity = mix(a.hemiI, b.hemiI);
    hemi.color.copy(hemiDay).lerp(hemiNight, night);
    fill.intensity = 0.55 * (1 - night) + 0.08 * night;
    moonLight.intensity = 0.35 * night;
    for (const L of nightLamps) L.intensity = 60 * night;
    if (lanternMat) lanternMat.emissiveIntensity = 0.55 + 1.5 * night;
    for (const g of lanternGlows) g.material.opacity = 0.35 + 0.45 * night;
    for (const m of ridgeMats) m.color.copy(white).lerp(ridgeNight, night);
    stars.material.opacity = night;
    moon.material.opacity = night;
    stars.visible = moon.visible = night > 0.02;
    scene.environmentIntensity = 0.35 * (1 - 0.85 * night);
    renderer.toneMappingExposure = 1.05 + 0.1 * night;
    for (const f of nightHooks) f(night);
  }
  let lastDay = -99;
  updaters.push((t) => {
    if (t - lastDay < 10) return; // cập nhật mỗi 10 giây là đủ
    lastDay = t;
    applyDayTime(hourOverride ?? vnHour());
  });
  applyDayTime(vnHour());

  function setQuality(q) {
    sun.castShadow = q === 'high';
    const size = q === 'high' ? 2048 : 1024;
    sun.shadow.mapSize.set(size, size);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  setQuality(quality);

  // Gộp các vật đứng yên theo vật liệu (bỏ qua vật bấm được, vật vẽ hàng loạt)
  {
    const skip = new Set();
    for (const p of pickables) p.traverse((x) => skip.add(x));
    const groups = new Map();
    for (const root of staticRoots) {
      if (skip.has(root) || !root.parent) continue;
      root.updateMatrixWorld(true);
      const list = [];
      root.traverse((m) => m.isMesh && !m.isInstancedMesh && !skip.has(m) && !Array.isArray(m.material) && list.push(m));
      for (const m of list) {
        const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld);
        if (!g.attributes.uv || !g.attributes.normal) continue;
        for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
        const key = `${m.material.uuid}|${m.castShadow}|${m.receiveShadow}`;
        if (!groups.has(key)) groups.set(key, { mat: m.material, cast: m.castShadow, recv: m.receiveShadow, geos: [] });
        groups.get(key).geos.push(g);
        m.removeFromParent();
      }
    }
    for (const { mat, cast, recv, geos } of groups.values()) {
      const merged = new THREE.Mesh(mergeGeometries(geos), mat);
      merged.castShadow = cast;
      merged.receiveShadow = recv;
      scene.add(merged);
    }
  }

  return {
    // ẩn tượng nặng khi người chơi ở xa
    updateLOD(x, z) {
      for (const l of lods) l.obj.visible = Math.hypot(x - l.x, z - l.z) < l.r;
    },
    // ép một giờ cụ thể (để xem thử), null = theo giờ thật
    setHour(h) {
      hourOverride = h == null || Number.isNaN(h) ? null : ((h % 24) + 24) % 24;
      lastDay = -99;
    },
    get night() {
      return night;
    },
    // tượng La Hán: vị trí, bám bụi / lau sạch (instant = đổi màu ngay, không chuyển dần)
    lahan: {
      get(id) {
        return lahan.get(id);
      },
      has: (id) => lahan.has(id),
      setDust(id, dusty, instant = false) {
        const st = lahan.get(id);
        if (!st) return;
        st.want = dusty ? 1 : 0;
        if (!instant) return void lahanBusy.add(st);
        st.dust = st.want;
        lahanBusy.delete(st);
        paintLahan(st);
      },
      sparkle(id) {
        const st = lahan.get(id);
        if (!st) return;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff2c4', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        sp.position.set(st.x, st.y + 0.6, st.z);
        scene.add(sp);
        sparkles.push({ obj: sp, life: 0, y0: st.y + 0.5 });
      },
    },
    // bật / tắt trang trí ngày lễ (hoa đăng, cờ ngũ sắc)
    setFestival(on) {
      fest.visible = !!on;
    },
    scene,
    seats,
    pickables,
    incense,
    incenseTop,
    incenseQH,
    duyen,
    qaHall: { head: QH_HEAD },
    tamThe: { head: TT_HEAD },
    ngoa: { head: NGOA.head },
    peak,
    incensePeak,
    studyRoof,
    studyUp: study.studyUp,
    studyBoards: study.boards,
    incenseNgoa,
    falls: [-1, 1].map((s) => new THREE.Vector3(s * FALLS.x, TERRACE.y + 6, FALLS.z)),
    incenseTT,
    zenRoof,
    field,
    veg,
    orchard,
    greatBell,
    merit,
    tower: { ...TOWER, relic: TOP_RELIC },
    pushOut,
    // giá chổi: chỗ đứng để lấy / trả chổi
    broom: { center: BROOM, spot: new THREE.Vector3(BROOM.x, 0, BROOM.z + 1.05) },
    setQuality,
    // bóng đổ theo người chơi
    setFocus(x, z) {
      const nx = Math.round(x / 4) * 4, nz = Math.round(z / 4) * 4 - 1;
      if (nx === focus.x && nz === focus.z) return;
      sun.position.x += nx - focus.x;
      sun.position.z += nz - focus.z;
      focus.set(nx, 0, nz);
      sun.target.position.copy(focus);
    },
    showMarker(x, z, y = 0.04) {
      [x, z] = toReal(x, z); // điểm đến trên tầng 2 khu tự học: hiện ở chỗ thật
      marker.position.set(x, y, z);
      markerStart = now;
    },
    update(t, dt) {
      for (const f of updaters) f(t, dt);
    },
  };
}
