// Âm lịch Việt Nam (múi giờ UTC+7) — thuật toán thiên văn của Hồ Ngọc Đức.
// Dùng chung cho máy chủ (Node) và trình duyệt: biết hôm nay là mùng một hay ngày Rằm.

const TZ = 7;
const { floor: INT, sin, PI } = Math;

function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  return jd;
}

// Ngày (số ngày Julius) có điểm sóc thứ k tính từ 1/1/1900
function newMoonDay(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * sin(M * dr) + 0.0021 * sin(2 * dr * M);
  C1 = C1 - 0.4068 * sin(Mpr * dr) + 0.0161 * sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * sin(dr * 2 * F) - 0.0051 * sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * sin(dr * (M - Mpr)) + 0.0004 * sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * sin(dr * (2 * F - M)) - 0.0006 * sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * sin(dr * (2 * F - Mpr)) + 0.0005 * sin(dr * (2 * Mpr + M));
  const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return INT(jd1 + C1 - deltat + 0.5 + TZ / 24);
}

// Kinh độ mặt trời lúc nửa đêm đầu ngày jdn, chia thành 12 cung (0..11)
function sunLongitude(jdn) {
  const T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * sin(dr * 2 * M) + 0.00029 * sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= PI * 2 * INT(L / (PI * 2));
  return INT((L / PI) * 6);
}

// Ngày bắt đầu tháng 11 âm lịch của năm yy
function lunarMonth11(yy) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = newMoonDay(k);
  if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}

function leapMonthOffset(a11) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last, i = 1, arc = sunLongitude(newMoonDay(k + i));
  do {
    last = arc;
    i++;
    arc = sunLongitude(newMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

// Đổi ngày dương lịch sang âm lịch: { day, month, year, leap }
export function solarToLunar(dd, mm, yy) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);
  let a11 = lunarMonth11(yy), b11 = a11, lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = lunarMonth11(yy - 1);
  } else {
    lunarYear = yy + 1;
    b11 = lunarMonth11(yy + 1);
  }
  const day = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let leap = false, month = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) {
      month = diff + 10;
      if (diff === leapDiff) leap = true;
    }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) lunarYear -= 1;
  return { day, month, year: lunarYear, leap };
}

// Âm lịch của thời điểm t theo giờ Việt Nam
export function vnLunar(t = Date.now()) {
  const d = new Date(t + TZ * 3600e3);
  return solarToLunar(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear());
}

const MONTH_NAME = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];
// Rằm lớn có tên riêng
const BIG_RAM = { 1: 'Rằm tháng Giêng (Tết Nguyên Tiêu)', 4: 'Rằm tháng Tư (Phật Đản)', 7: 'Rằm tháng Bảy (Vu Lan báo hiếu)', 10: 'Rằm tháng Mười (Tết Hạ Nguyên)' };

// Ngày lễ trong tháng âm lịch: mùng một hoặc Rằm (15). Trả về null nếu ngày thường.
// day: ép một ngày âm lịch (để xem thử), bỏ trống = theo ngày thật
export function festivalOf(t = Date.now(), day = null) {
  const L = vnLunar(t);
  const d = day ?? L.day;
  if (d !== 1 && d !== 15) return null;
  const m = `tháng ${MONTH_NAME[L.month]}${L.leap ? ' nhuận' : ''}`;
  const name = d === 15 ? (!L.leap && BIG_RAM[L.month]) || `Rằm ${m}` : `Mùng một ${m}`;
  return { kind: d === 15 ? 'ram' : 'mung1', name, lunar: { ...L, day: d } };
}

// Hệ số nhân điểm phước trong ngày lễ
export const FESTIVAL_PHUOC = 2;

// Số ngày Julius → ngày dương lịch [ngày, tháng, năm]
export function jdToDate(jd) {
  let b, c;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
  return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
}
export { jdFromDate };

// Đổi ngày âm lịch sang dương lịch: [ngày, tháng, năm] (null nếu tháng nhuận không có trong năm đó)
export function lunarToSolar(lDay, lMonth, lYear, leap = false) {
  let a11, b11;
  if (lMonth < 11) {
    a11 = lunarMonth11(lYear - 1);
    b11 = lunarMonth11(lYear);
  } else {
    a11 = lunarMonth11(lYear);
    b11 = lunarMonth11(lYear + 1);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = leapMonthOffset(a11);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (leap && lMonth !== leapMonth) return null;
    if (leap || off >= leapOff) off += 1;
  } else if (leap) return null;
  return jdToDate(newMoonDay(k + off) + lDay - 1);
}
