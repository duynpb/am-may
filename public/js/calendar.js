// Lịch vạn niên: lịch tháng dương – âm, can chi ngày / tháng / năm, ngày hoàng đạo – hắc đạo, giờ hoàng đạo,
// các ngày lễ trong năm (lễ dương lịch, lễ âm lịch, ngày vía Phật – Bồ Tát) kèm số ngày còn lại.
// Ngày / giờ hoàng đạo tính theo cách phổ biến trong lịch vạn niên Việt Nam (12 trực thần theo tháng âm lịch).
import { solarToLunar, lunarToSolar, jdFromDate } from './lunar.js';
import { t, lang } from './i18n.js';

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const HOUR_RANGE = ['23–1', '1–3', '3–5', '5–7', '7–9', '9–11', '11–13', '13–15', '15–17', '17–19', '19–21', '21–23'];
// 12 vị thần trực ngày / giờ; vị trí 0, 1, 4, 5, 7, 10 là hoàng đạo (tốt), còn lại hắc đạo
const STARS = ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Bảo Quang', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trần'];
const GOOD = new Set([0, 1, 4, 5, 7, 10]);
const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const LMONTH = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];

export const canChiYear = (y) => `${CAN[(y + 6) % 10]} ${CHI[(y + 8) % 12]}`;
export const canChiMonth = (m, y) => `${CAN[(y * 12 + m + 3) % 10]} ${CHI[(m + 1) % 12]}`;
export const canChiDay = (jd) => `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
// vị thần trực ngày: Thanh Long bắt đầu ở Tý (tháng 1, 7), Dần (2, 8), Thìn (3, 9), Ngọ (4, 10), Thân (5, 11), Tuất (6, 12)
export function dayStar(jd, lunarMonth) {
  const i = ((jd + 1) % 12 - ((lunarMonth - 1) % 6) * 2 + 24) % 12;
  return { name: STARS[i], good: GOOD.has(i) };
}
// giờ hoàng đạo trong ngày: Thanh Long giờ bắt đầu ở Thân (ngày Tý, Ngọ), Tuất (Sửu, Mùi), Tý (Dần, Thân)…
export function goodHours(jd) {
  const start = [8, 10, 0, 2, 4, 6][((jd + 1) % 12) % 6];
  return CHI.map((c, h) => ({ chi: c, range: HOUR_RANGE[h], good: GOOD.has((h - start + 12) % 12) })).filter((x) => x.good);
}

// Các ngày lễ trong năm. kind: 'solar' (dương lịch) | 'lunar' (âm lịch) | 'phat' (ngày vía Phật, Bồ Tát)
const SOLAR_DAYS = [
  [1, 1, 'Tết Dương lịch'], [3, 2, 'Ngày thành lập Đảng Cộng sản Việt Nam'], [8, 3, 'Quốc tế Phụ nữ'],
  [30, 4, 'Ngày Giải phóng miền Nam, thống nhất đất nước'], [1, 5, 'Quốc tế Lao động'], [1, 6, 'Quốc tế Thiếu nhi'],
  [2, 9, 'Quốc khánh'], [20, 10, 'Ngày Phụ nữ Việt Nam'], [20, 11, 'Ngày Nhà giáo Việt Nam'],
  [22, 12, 'Ngày thành lập Quân đội nhân dân Việt Nam'], [25, 12, 'Lễ Giáng sinh'],
];
const LUNAR_DAYS = [
  [1, 1, 'Tết Nguyên Đán', 'lunar'], [15, 1, 'Tết Nguyên Tiêu (Rằm tháng Giêng)', 'lunar'],
  [8, 2, 'Vía Đức Phật Thích Ca xuất gia', 'phat'], [15, 2, 'Vía Đức Phật Thích Ca nhập Niết Bàn', 'phat'],
  [19, 2, 'Vía Quán Thế Âm Bồ Tát đản sanh', 'phat'], [3, 3, 'Tết Hàn Thực', 'lunar'], [10, 3, 'Giỗ Tổ Hùng Vương', 'lunar'],
  [15, 4, 'Lễ Phật Đản', 'phat'], [5, 5, 'Tết Đoan Ngọ', 'lunar'], [19, 6, 'Vía Quán Thế Âm Bồ Tát thành đạo', 'phat'],
  [15, 7, 'Lễ Vu Lan báo hiếu', 'phat'], [15, 8, 'Tết Trung Thu', 'lunar'], [19, 9, 'Vía Quán Thế Âm Bồ Tát xuất gia', 'phat'],
  [15, 10, 'Tết Hạ Nguyên', 'lunar'], [17, 11, 'Vía Đức Phật A Di Đà', 'phat'], [8, 12, 'Vía Đức Phật Thích Ca thành đạo', 'phat'],
  [23, 12, 'Tiễn ông Công ông Táo', 'lunar'],
];
const key = (d, m, y) => `${y}-${m}-${d}`;
const cache = new Map();
// mọi ngày lễ có ngày dương rơi vào năm dương lịch y: [{ d, m, y, name, kind }]
export function holidaysOf(y) {
  if (cache.has(y)) return cache.get(y);
  const out = SOLAR_DAYS.map(([d, m, name]) => ({ d, m, y, name, kind: 'solar' }));
  for (const ly of [y - 1, y]) {
    for (const [ld, lm, name, kind] of LUNAR_DAYS) {
      const s = lunarToSolar(ld, lm, ly);
      if (s && s[2] === y) out.push({ d: s[0], m: s[1], y, name, kind, lunar: `${ld}/${lm}` });
    }
    // giao thừa: ngày cuối tháng Chạp (ngay trước Tết năm sau)
    const tet = lunarToSolar(1, 1, ly + 1);
    if (tet) {
      const jd = jdFromDate(...tet) - 1, L = jdDate(jd);
      if (L[2] === y) out.push({ d: L[0], m: L[1], y, name: 'Đêm Giao thừa', kind: 'lunar' });
    }
  }
  out.sort((a, b) => a.m - b.m || a.d - b.d);
  cache.set(y, out);
  return out;
}
function jdDate(jd) {
  const d = new Date(Date.UTC(1970, 0, 1) + (jd - 2440588) * 864e5);
  return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()];
}
// đầy đủ thông tin một ngày dương lịch
export function dayInfo(d, m, y) {
  const jd = jdFromDate(d, m, y), L = solarToLunar(d, m, y), star = dayStar(jd, L.month);
  return {
    d, m, y, jd, lunar: L, weekday: WEEKDAY[(jd + 1) % 7],
    canChi: { day: canChiDay(jd), month: canChiMonth(L.month, L.year), year: canChiYear(L.year) },
    star, hours: goodHours(jd),
    holidays: holidaysOf(y).filter((x) => x.d === d && x.m === m),
    // tiếng Việt: "20 tháng Chín"; giao diện tiếng khác: "20/9" cho dễ hiểu
    lunarName: lang === 'vi' ? `${L.day} tháng ${LMONTH[L.month]}${L.leap ? ' nhuận' : ''}` : `${L.day}/${L.month}${L.leap ? '*' : ''}`,
  };
}

// ---------- Hộp lịch vạn niên ----------
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return e;
}
const vnToday = () => {
  const n = new Date(Date.now() + 7 * 3600e3);
  return [n.getUTCDate(), n.getUTCMonth() + 1, n.getUTCFullYear()];
};

export function createCalendar({ openModal, closeModal }) {
  const modal = h('div', { class: 'modal', id: 'modal-cal', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cal-title' });
  const sheet = h('div', { class: 'sheet cal-sheet' });
  modal.append(sheet);
  document.body.append(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal(modal);
  });
  let [td, tm, ty] = vnToday();
  let view = { m: tm, y: ty }, sel = { d: td, m: tm, y: ty }, tab = 'month';

  function render() {
    [td, tm, ty] = vnToday();
    const head = h('div', { class: 'sheet-head' }, h('h2', { id: 'cal-title', text: 'Lịch vạn niên' }), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' }));
    const tabs = h('div', { class: 'seg cal-tabs' }, [['month', 'Lịch tháng'], ['year', 'Ngày lễ trong năm']].map(([k, label]) =>
      h('button', { class: tab === k ? 'on' : '', onclick: () => { tab = k; render(); } }, label)));
    sheet.replaceChildren(head, tabs, tab === 'month' ? monthView() : yearView());
  }

  function monthView() {
    const wrap = h('div', { class: 'cal-month' });
    const go = (dm) => {
      view.m += dm;
      if (view.m < 1) { view.m = 12; view.y--; }
      if (view.m > 12) { view.m = 1; view.y++; }
      render();
    };
    wrap.append(h('div', { class: 'cal-nav' },
      h('button', { class: 'ghost', 'aria-label': 'Tháng trước', onclick: () => go(-1), text: '‹' }),
      h('div', { class: 'cal-mtitle' }, h('b', { text: `Tháng ${view.m} / ${view.y}` }), h('small', { text: `Âm lịch năm ${canChiYear(solarToLunar(15, view.m, view.y).year)}` })),
      h('button', { class: 'ghost', 'aria-label': 'Tháng sau', onclick: () => go(1), text: '›' }),
      h('button', { class: 'ghost', onclick: () => { view = { m: tm, y: ty }; sel = { d: td, m: tm, y: ty }; render(); }, text: 'Hôm nay' })));
    const grid = h('div', { class: 'cal-grid' });
    for (const w of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) grid.append(h('div', { class: 'cal-wd', text: w }));
    const first = jdFromDate(1, view.m, view.y), lead = (first + 1) % 7 === 0 ? 6 : ((first + 1) % 7) - 1; // thứ Hai đứng đầu
    const days = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
    for (let i = 0; i < lead; i++) grid.append(h('div', { class: 'cal-cell empty' }));
    const hol = holidaysOf(view.y);
    for (let d = 1; d <= days; d++) {
      const jd = first + d - 1, L = solarToLunar(d, view.m, view.y), star = dayStar(jd, L.month);
      const isHol = hol.some((x) => x.d === d && x.m === view.m), wd = (jd + 1) % 7;
      const cls = ['cal-cell', star.good ? 'good' : '', isHol ? 'hol' : '', L.day === 1 || L.day === 15 ? 'ram' : '', wd === 0 ? 'sun' : '',
        d === td && view.m === tm && view.y === ty ? 'today' : '', d === sel.d && view.m === sel.m && view.y === sel.y ? 'sel' : ''].filter(Boolean).join(' ');
      grid.append(h('button', { class: cls, onclick: () => { sel = { d, m: view.m, y: view.y }; render(); } },
        h('span', { class: 'sd', text: d }),
        h('span', { class: 'ld', text: L.day === 1 ? `${L.day}/${L.month}${L.leap ? 'n' : ''}` : L.day })));
    }
    wrap.append(grid, h('div', { class: 'cal-legend' },
      h('span', { class: 'lg good', text: 'Ngày hoàng đạo' }), h('span', { class: 'lg ram', text: 'Mùng một, Rằm' }), h('span', { class: 'lg hol', text: 'Ngày lễ' })));
    if (sel.m === view.m && sel.y === view.y) wrap.append(detail(dayInfo(sel.d, sel.m, sel.y)));
    return wrap;
  }

  function detail(I) {
    return h('div', { class: 'cal-detail' },
      h('div', { class: 'cal-big' },
        h('div', { class: 'cal-bigd', text: I.d }),
        h('div', {}, h('b', { text: `${I.weekday}, ${I.d}/${I.m}/${I.y}` }),
          h('div', { text: `Âm lịch: ngày ${I.lunarName} năm ${I.canChi.year}` }),
          h('div', { class: 'muted', text: `Ngày ${I.canChi.day} · tháng ${I.canChi.month} · năm ${I.canChi.year}` }))),
      h('div', { class: 'cal-star ' + (I.star.good ? 'good' : 'bad') },
        h('b', { text: I.star.good ? 'Ngày hoàng đạo' : 'Ngày hắc đạo' }), h('span', { text: ` (${I.star.name})` })),
      h('div', { class: 'cal-hours' }, h('b', { text: 'Giờ hoàng đạo:' }),
        h('div', { class: 'cal-hlist' }, I.hours.map((x) => h('span', { class: 'cal-h', text: `${x.chi} (${x.range}h)` })))),
      I.holidays.length ? h('div', { class: 'cal-hols' }, I.holidays.map((x) => h('div', { class: 'cal-hol ' + x.kind }, '🎉 ', h('span', { text: x.name })))) : null,
      h('p', { class: 'muted cal-note', text: 'Ngày và giờ hoàng đạo tính theo cách phổ biến trong lịch vạn niên, để tham khảo. Phật dạy: ngày nào làm việc lành, giữ tâm an thì ngày ấy là ngày tốt.' }));
  }

  function yearView() {
    const y = view.y;
    const todayJd = jdFromDate(td, tm, ty);
    const wrap = h('div', { class: 'cal-year' });
    wrap.append(h('div', { class: 'cal-nav' },
      h('button', { class: 'ghost', 'aria-label': 'Năm trước', onclick: () => { view.y--; render(); }, text: '‹' }),
      h('div', { class: 'cal-mtitle' }, h('b', { text: `Năm ${y}` }), h('small', { text: `Âm lịch ${canChiYear(y)}` })),
      h('button', { class: 'ghost', 'aria-label': 'Năm sau', onclick: () => { view.y++; render(); }, text: '›' })));
    const list = h('div', { class: 'cal-list' });
    for (const x of holidaysOf(y)) {
      const jd = jdFromDate(x.d, x.m, x.y), left = jd - todayJd, I = dayInfo(x.d, x.m, x.y);
      list.append(h('button', { class: 'cal-row ' + x.kind + (left < 0 ? ' past' : ''), onclick: () => { view = { m: x.m, y: x.y }; sel = { d: x.d, m: x.m, y: x.y }; tab = 'month'; render(); } },
        h('span', { class: 'cal-rdate', text: `${x.d}/${x.m}` }),
        h('span', { class: 'cal-rname' }, h('b', { text: x.name }), h('small', { text: `${I.weekday} · âm lịch ${I.lunar.day}/${I.lunar.month}` })),
        h('span', { class: 'cal-rleft', text: left === 0 ? t('Hôm nay') : left > 0 ? t(`còn ${left} ngày`) : '' })));
    }
    wrap.append(list);
    return wrap;
  }

  return {
    open() {
      [td, tm, ty] = vnToday();
      view = { m: tm, y: ty };
      sel = { d: td, m: tm, y: ty };
      tab = 'month';
      render();
      openModal('#modal-cal');
    },
  };
}
