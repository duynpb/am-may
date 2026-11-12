// Cầu duyên: cây duyên trước điện Quan Âm, treo dải lụa đỏ và thẻ gỗ. Bấm vào cây → chọn điều cầu → nhân vật tới lạy
// Quán Thế Âm Bồ Tát, thắt một dải lụa đỏ lên cây và nhận một lời nhắn theo tinh thần Phật dạy (duyên do tâm tạo).
// Điều mong cầu viết riêng chỉ hiện trên máy mình, không gửi đi đâu, không lưu lại.
import * as THREE from 'three';
import { solarToLunar, jdFromDate } from './lunar.js';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const pad2 = (n) => String(n).padStart(2, '0');

// Kiểm tra và đổi ngày dương lịch (dd/mm/yyyy) → âm lịch
function parseAndValidateSolar(str) {
  const s = (str || '').trim();
  if (!s) return { ok: true, empty: true };
  let dd = 0, mm = 0, yy = 0;
  const m1 = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  const m2 = s.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);
  if (m1) [dd, mm, yy] = [+m1[1], +m1[2], +m1[3]];
  else if (m2) [yy, mm, dd] = [+m2[1], +m2[2], +m2[3]];
  else return { ok: false, error: 'Định dạng ngày dương chưa đúng (nhập dd/mm/yyyy, VD: 15/08/2000)' };
  if (mm < 1 || mm > 12) return { ok: false, error: 'Tháng dương lịch phải từ 01 đến 12' };
  if (yy < 1900 || yy > 2100) return { ok: false, error: 'Năm sinh phải từ 1900 đến 2100' };
  const dt = new Date(yy, mm - 1, dd);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) {
    return { ok: false, error: `Ngày ${pad2(dd)}/${pad2(mm)}/${yy} không tồn tại trong lịch dương` };
  }
  const L = solarToLunar(dd, mm, yy);
  const canChi = `${CAN[(L.year + 6) % 10]} ${CHI[(L.year + 8) % 12]}`;
  return {
    ok: true,
    dd,
    mm,
    yy,
    lunar: L,
    formattedSolar: `${pad2(dd)}/${pad2(mm)}/${yy}`,
    formattedLunar: `${pad2(L.day)}/${pad2(L.month)}/${L.year}${L.leap ? ' (nhuận)' : ''} (năm ${canChi})`,
  };
}

// Kiểm tra định dạng ngày âm lịch độc lập với ngày dương (user có thể tự sửa)
function parseAndValidateLunar(str) {
  const s = (str || '').trim();
  if (!s) return { ok: true, empty: true };
  let dd = 0, mm = 0, yy = 0, suffix = '';
  const m1 = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:\s+(.*))?$/);
  const m2 = s.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})(?:\s+(.*))?$/);
  if (m1) {
    [dd, mm, yy] = [+m1[1], +m1[2], +m1[3]];
    suffix = (m1[4] || '').trim();
  } else if (m2) {
    [yy, mm, dd] = [+m2[1], +m2[2], +m2[3]];
    suffix = (m2[4] || '').trim();
  } else {
    return { ok: false, error: 'Định dạng ngày âm chưa đúng (nhập dd/mm/yyyy, VD: 15/07/2000)' };
  }
  if (mm < 1 || mm > 12) return { ok: false, error: 'Tháng âm lịch phải từ 01 đến 12' };
  if (dd < 1 || dd > 30) return { ok: false, error: 'Ngày âm lịch phải từ 01 đến 30' };
  if (yy < 1900 || yy > 2100) return { ok: false, error: 'Năm âm lịch phải từ 1900 đến 2100' };
  const canChi = `${CAN[(yy + 6) % 10]} ${CHI[(yy + 8) % 12]}`;
  const formattedLunar = `${pad2(dd)}/${pad2(mm)}/${yy}${suffix ? ' ' + suffix : ` (năm ${canChi})`}`;
  return { ok: true, dd, mm, yy, formattedLunar };
}

const GY = -0.36;
export const DUYEN = { x: 22.2, z: 20.4, r: 1.5, stand: { x: 23.4, z: 21.9 } };
// điều cầu và lời nhắn (lời nhắn do Am Mây viết, theo tinh thần từ bi, nhân duyên)
export const WISHES = [
  { id: 'love', icon: '💞', name: 'Duyên lành, tình yêu', msgs: [
    'Thương người như thể thương thân. Khi bạn biết thương chính mình đủ đầy, người thương sẽ tìm thấy bạn.',
    'Duyên lành không vội. Hãy làm người tử tế mỗi ngày, rồi một ngày bạn sẽ gặp người cũng tử tế như thế.',
    'Tình yêu bền lâu cần bốn điều: thương yêu, cảm thông, vui cùng nhau và biết bao dung.',
    'Gặp được nhau là duyên, giữ được nhau là nhờ biết lắng nghe và nói lời dịu dàng.',
  ] },
  { id: 'family', icon: '🏡', name: 'Gia đạo hạnh phúc', msgs: [
    'Gia đình an vui khi mỗi người bớt một lời nặng, thêm một lời thương.',
    'Hiếu thuận với cha mẹ, hoà thuận với anh em, đó là phước lớn nhất trong nhà.',
    'Bếp lửa ấm nhờ người biết nhường nhịn. Nhẫn một chút, cả nhà vui cả ngày.',
    'Cùng nhau ăn một bữa cơm trong chánh niệm, ấy là lúc hạnh phúc có mặt.',
  ] },
  { id: 'friend', icon: '🤝', name: 'Bạn hiền, quý nhân', msgs: [
    'Muốn gặp quý nhân, trước hết hãy là quý nhân của người khác.',
    'Bạn lành như ngọn đèn: gần bạn lành, đường đi sáng hơn.',
    'Cho đi chân thành, bạn bè chân thành sẽ tìm đến.',
    'Một lời cảm ơn, một lần giúp đỡ hôm nay là hạt giống của tình bạn ngày mai.',
  ] },
  { id: 'dharma', icon: '🪷', name: 'Duyên lành với Phật pháp', msgs: [
    'Duyên với Phật pháp bắt đầu từ một hơi thở chánh niệm. Thở vào, tâm an; thở ra, mỉm cười.',
    'Mỗi lần ghé chùa, mỗi lần lạy Phật là thêm một sợi duyên lành với đạo.',
    'Nghe một câu kinh, hiểu một lời dạy, sống theo một điều lành — duyên đạo sẽ lớn dần.',
    'Phật ở trong tâm. Giữ tâm hiền thì lúc nào cũng gần Phật.',
  ] },
];

// ---------- Cây duyên: thân gỗ, tán lá tròn, dải lụa đỏ và thẻ gỗ treo trên cành ----------
// at: { x, y, z, r } để đặt cây ở chùa khác (mặc định: trước điện Quan Âm khu Am Mây)
export function buildDuyenTree({ scene, std, pickables, obstacles, at = null }) {
  const P = at ?? { x: DUYEN.x, y: GY, z: DUYEN.z, r: DUYEN.r };
  const g = new THREE.Group();
  g.position.set(P.x, P.y, P.z);
  g.userData = { kind: 'duyen' };
  scene.add(g);
  pickables.push(g);
  obstacles?.push({ x: P.x, z: P.z, r: P.r });
  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const bark = std('#5a4030', { roughness: 0.95 }), leaf1 = std('#3f6e31', { roughness: 0.85 }), leaf2 = std('#4e8139', { roughness: 0.85 });
  const red = std('#c4222a', { roughness: 0.6, side: THREE.DoubleSide }), red2 = std('#e0453c', { roughness: 0.6, side: THREE.DoubleSide });
  const wood = std('#c9a26a', { roughness: 0.8 }), stone = std('#b5aea0', { roughness: 0.95 });
  // bồn đá tròn quanh gốc
  add(new THREE.CylinderGeometry(1.25, 1.35, 0.4, 20), stone, 0, 0.2, 0);
  add(new THREE.CylinderGeometry(0.22, 0.34, 3.0, 9), bark, 0, 1.7, 0);
  // cành toả ra
  const tips = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3, len = 1.5 + (k % 2) * 0.3;
    const br = add(new THREE.CylinderGeometry(0.05, 0.1, len, 6), bark, Math.cos(a) * len * 0.35, 2.9 + (k % 3) * 0.15, Math.sin(a) * len * 0.35);
    br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    tips.push([Math.cos(a) * len * 0.7, 2.75 + (k % 3) * 0.15, Math.sin(a) * len * 0.7]);
  }
  // tán lá
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2, d = k === 0 ? 0 : 1.15;
    const c = add(new THREE.IcosahedronGeometry(k === 0 ? 1.5 : 1.05, 1), k % 2 ? leaf1 : leaf2, Math.cos(a) * d, 3.9 + (k % 2) * 0.3, Math.sin(a) * d);
    c.scale.y = 0.75;
  }
  // dải lụa đỏ và thẻ gỗ treo dưới tán
  const ribbonGeo = new THREE.PlaneGeometry(0.07, 0.75).translate(0, -0.375, 0), tagGeo = new THREE.BoxGeometry(0.16, 0.24, 0.02);
  const hang = [];
  const hangOne = (i, color) => {
    const a = i * 2.39996, rr = 0.7 + ((i * 37) % 10) * 0.08;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = 2.85 - ((i * 13) % 5) * 0.06;
    const rg = new THREE.Group();
    rg.position.set(x, y, z);
    rg.rotation.y = a;
    g.add(rg);
    const rb = new THREE.Mesh(ribbonGeo, color === 2 ? red2 : red);
    rg.add(rb);
    const tag = new THREE.Mesh(tagGeo, wood);
    tag.position.set(0, -0.82, 0);
    rg.add(tag);
    hang.push({ rg, ph: i * 1.7 });
    return rg;
  };
  for (let i = 0; i < 26; i++) hangOne(i, i % 3 === 0 ? 2 : 1);
  let n = 26;
  // dải lụa khẽ bay trong gió
  const update = (t) => {
    for (const hh of hang) hh.rg.rotation.x = Math.sin(t * 1.3 + hh.ph) * 0.12;
  };
  return {
    update,
    // thắt thêm một dải lụa đỏ (của mình) — nổi bật màu đỏ tươi
    addRibbon() {
      const rg = hangOne(n++, 2);
      rg.scale.setScalar(1.15);
      return rg;
    },
    head: new THREE.Vector3(P.x, P.y + 2.8, P.z),
    group: g,
  };
}

// ---------- Hộp chọn điều cầu và thẻ lời nhắn ----------
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
export function createDuyenDialog({ openModal, closeModal, onPray }) {
  const modal = h('div', { class: 'modal', id: 'modal-duyen', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'duyen-title' });
  const sheet = h('div', { class: 'sheet duyen-sheet' });
  modal.append(sheet);
  document.body.append(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal(modal);
  });
  modal.addEventListener('keydown', (e) => e.stopPropagation());
  const STORAGE_KEY = 'ammay.duyenForm';
  let form = {
    pick: WISHES[0].id,
    fullName: '',
    birthSolar: '',
    birthLunar: '',
    address: '',
    personality: '',
    appearanceAge: '',
    jobEducation: '',
    wishText: '',
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') Object.assign(form, saved);
  } catch { /* ignore */ }
  const saveDraft = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  };

  function makeInput(key, placeholder, opts = {}) {
    const isArea = !!opts.rows;
    const el = h(isArea ? 'textarea' : 'input', {
      class: 'duyen-in',
      rows: opts.rows || undefined,
      type: isArea ? undefined : (opts.type || 'text'),
      maxlength: opts.maxlength || 180,
      placeholder,
      'data-no-i18n': true,
    });
    el.value = form[key] || '';
    el.addEventListener('input', () => {
      form[key] = el.value;
      opts.onInput?.(el.value);
      saveDraft();
    });
    return el;
  }

  function ask() {
    // Nếu đã có ngày dương hợp lệ mà ngày âm đang trống (từ bản lưu trước), tự điền ngày âm
    if (form.birthSolar && !form.birthLunar) {
      const initRes = parseAndValidateSolar(form.birthSolar);
      if (initRes.ok && !initRes.empty) {
        form.birthLunar = initRes.formattedLunar;
        saveDraft();
      }
    }

    let lunarIn = null;
    const solarErr = h('small', { class: 'duyen-err', hidden: true });
    const lunarErr = h('small', { class: 'duyen-err', hidden: true });
    const calPop = h('div', { class: 'duyen-cal-pop', hidden: true });

    const setErr = (inputEl, errEl, msg) => {
      inputEl.classList.toggle('invalid', !!msg);
      errEl.textContent = msg || '';
      errEl.hidden = !msg;
    };

    // Trạng thái tháng / năm đang mở của lịch chọn ngày dương
    const curYear = new Date().getFullYear();
    const parsedInit = parseAndValidateSolar(form.birthSolar);
    let calView = {
      m: parsedInit.ok && !parsedInit.empty ? parsedInit.mm : 8,
      y: parsedInit.ok && !parsedInit.empty ? parsedInit.yy : 2000,
    };

    const solarIn = makeInput('birthSolar', 'Ngày dương lịch (dd/mm/yyyy, VD: 15/08/2000)', {
      maxlength: 40,
      onInput: (val) => {
        const res = parseAndValidateSolar(val);
        if (res.ok && !res.empty) {
          setErr(solarIn, solarErr, '');
          // Tự động điền ngày âm lịch khi ngày dương hợp lệ; sau đó user có thể sửa ngày âm tùy ý
          form.birthLunar = res.formattedLunar;
          if (lunarIn) {
            lunarIn.value = res.formattedLunar;
            setErr(lunarIn, lunarErr, '');
          }
          calView = { m: res.mm, y: res.yy };
          if (!calPop.hidden) renderCalPop();
        } else if (res.empty) {
          setErr(solarIn, solarErr, '');
        } else if (val.trim().length >= 8) {
          setErr(solarIn, solarErr, res.error);
        } else {
          setErr(solarIn, solarErr, '');
        }
      },
    });
    solarIn.addEventListener('blur', () => {
      const res = parseAndValidateSolar(solarIn.value);
      if (!res.ok) {
        setErr(solarIn, solarErr, res.error);
      } else {
        setErr(solarIn, solarErr, '');
        if (!res.empty && solarIn.value !== res.formattedSolar) {
          form.birthSolar = res.formattedSolar;
          solarIn.value = res.formattedSolar;
          saveDraft();
        }
      }
    });

    lunarIn = makeInput('birthLunar', 'Ngày âm lịch (dd/mm/yyyy — tự điền hoặc tự sửa)', {
      maxlength: 60,
      onInput: (val) => {
        // User chỉnh sửa ngày âm độc lập, không ảnh hưởng hay phụ thuộc ngày dương
        const res = parseAndValidateLunar(val);
        if (res.ok) setErr(lunarIn, lunarErr, '');
        else if (val.trim().length >= 8) setErr(lunarIn, lunarErr, res.error);
        else setErr(lunarIn, lunarErr, '');
      },
    });
    lunarIn.addEventListener('blur', () => {
      const res = parseAndValidateLunar(lunarIn.value);
      if (!res.ok) {
        setErr(lunarIn, lunarErr, res.error);
      } else {
        setErr(lunarIn, lunarErr, '');
      }
    });

    function renderCalPop() {
      const monthSel = h('select', {
        class: 'duyen-cal-sel',
        'aria-label': 'Chọn tháng dương lịch',
        onchange: (e) => { calView.m = +e.target.value; renderCalPop(); },
      }, Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const opt = h('option', { value: m, text: `Tháng ${m}` });
        if (m === calView.m) opt.selected = true;
        return opt;
      }));

      const years = [];
      for (let y = curYear; y >= 1920; y--) {
        const opt = h('option', { value: y, text: `Năm ${y}` });
        if (y === calView.y) opt.selected = true;
        years.push(opt);
      }
      const yearSel = h('select', {
        class: 'duyen-cal-sel',
        'aria-label': 'Chọn năm dương lịch',
        onchange: (e) => { calView.y = +e.target.value; renderCalPop(); },
      }, years);

      const stepMonth = (dm) => {
        calView.m += dm;
        if (calView.m < 1) { calView.m = 12; calView.y = Math.max(1920, calView.y - 1); }
        if (calView.m > 12) { calView.m = 1; calView.y = Math.min(curYear, calView.y + 1); }
        renderCalPop();
      };

      const grid = h('div', { class: 'duyen-cal-grid' });
      for (const w of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) {
        grid.append(h('div', { class: 'duyen-cal-wd', text: w }));
      }
      const first = jdFromDate(1, calView.m, calView.y);
      const lead = (first + 1) % 7 === 0 ? 6 : ((first + 1) % 7) - 1;
      const days = new Date(Date.UTC(calView.y, calView.m, 0)).getUTCDate();
      for (let i = 0; i < lead; i++) grid.append(h('div', { class: 'duyen-cal-cell empty' }));

      const curSolar = parseAndValidateSolar(form.birthSolar);
      for (let d = 1; d <= days; d++) {
        const L = solarToLunar(d, calView.m, calView.y);
        const isSel = curSolar.ok && !curSolar.empty && curSolar.dd === d && curSolar.mm === calView.m && curSolar.yy === calView.y;
        grid.append(h('button', {
          type: 'button',
          class: 'duyen-cal-cell' + (isSel ? ' sel' : ''),
          onclick: () => {
            const picked = `${pad2(d)}/${pad2(calView.m)}/${calView.y}`;
            const res = parseAndValidateSolar(picked);
            if (res.ok && !res.empty) {
              form.birthSolar = res.formattedSolar;
              solarIn.value = res.formattedSolar;
              setErr(solarIn, solarErr, '');
              form.birthLunar = res.formattedLunar;
              lunarIn.value = res.formattedLunar;
              setErr(lunarIn, lunarErr, '');
              saveDraft();
            }
            calPop.hidden = true;
          },
        },
        h('span', { class: 'sd', text: d }),
        h('span', { class: 'ld', text: L.day === 1 ? `${L.day}/${L.month}` : L.day })));
      }

      calPop.replaceChildren(
        h('div', { class: 'duyen-cal-bar' },
          h('button', { type: 'button', class: 'ghost duyen-cal-nav', 'aria-label': 'Tháng trước', onclick: () => stepMonth(-1), text: '‹' }),
          monthSel,
          yearSel,
          h('button', { type: 'button', class: 'ghost duyen-cal-nav', 'aria-label': 'Tháng sau', onclick: () => stepMonth(1), text: '›' }),
          h('button', { type: 'button', class: 'ghost duyen-cal-close', onclick: () => { calPop.hidden = true; }, text: 'Đóng' }),
        ),
        grid,
        h('small', { class: 'duyen-cal-hint', text: 'Chạm vào một ngày để chọn ngày dương lịch và tự động điền ngày âm lịch tương ứng.' }),
      );
    }

    const calBtn = h('button', {
      type: 'button',
      class: 'duyen-cal-btn',
      title: 'Chọn ngày dương lịch từ lịch',
      'aria-label': 'Chọn ngày dương lịch từ lịch',
      onclick: () => {
        const res = parseAndValidateSolar(solarIn.value);
        if (res.ok && !res.empty) calView = { m: res.mm, y: res.yy };
        calPop.hidden = !calPop.hidden;
        if (!calPop.hidden) renderCalPop();
      },
    }, '📅');

    const solarCol = h('div', { class: 'duyen-date-col' },
      h('small', { class: 'duyen-sub-lbl', text: 'Ngày dương lịch (nhập dd/mm/yyyy hoặc chọn lịch)' }),
      h('div', { class: 'duyen-input-wrap' }, solarIn, calBtn),
      solarErr,
    );
    const lunarCol = h('div', { class: 'duyen-date-col' },
      h('small', { class: 'duyen-sub-lbl', text: 'Ngày âm lịch (tự điền từ ngày dương, có thể sửa riêng)' }),
      lunarIn,
      lunarErr,
    );

    const prevScroll = sheet.querySelector('.duyen-body')?.scrollTop || 0;
    const body = h('div', { class: 'duyen-body' },
      h('p', { class: 'muted duyen-intro', text: 'Thành tâm dâng sớ cầu duyên trước Quán Thế Âm Bồ Tát. Mọi thông tin bạn điền chỉ lưu trên trình duyệt của bạn, không gửi đi đâu.' }),
      h('div', { class: 'duyen-grid' }, WISHES.map((w) => h('button', {
        type: 'button',
        class: 'duyen-opt' + (w.id === form.pick ? ' on' : ''),
        onclick: () => { form.pick = w.id; saveDraft(); ask(); },
      }, h('span', { class: 'duyen-ico', text: w.icon }), h('span', { text: w.name })))),

      // 1. Thông tin cá nhân để viết sớ và khấn
      h('section', { class: 'duyen-sec' },
        h('h3', { text: '1. Thông tin cá nhân để viết sớ và khấn' }),
        h('p', { class: 'duyen-sec-desc', text: 'Khi đi lễ cầu duyên, bạn sẽ cần ghi thông tin của mình vào sớ (hoặc tự khấn) theo cấu trúc:' }),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Họ và tên:' }), ' ', h('small', { text: 'Tên khai sinh của bạn.' })),
          makeInput('fullName', 'Nhập họ và tên khai sinh của bạn…', { maxlength: 80 }),
        ),
        h('div', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Ngày tháng năm sinh:' }), ' ', h('small', { text: 'Nên chuẩn bị cả ngày dương lịch và ngày âm lịch (vì đi lễ chùa thường dùng lịch âm).' })),
          h('div', { class: 'duyen-date-row' }, solarCol, lunarCol),
          calPop,
        ),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Địa chỉ hiện tại:' }), ' ', h('small', { text: 'Nơi bạn đang sinh sống, học tập hoặc làm việc (nêu rõ số nhà, đường, phường, quận/huyện, tỉnh/thành phố) để “bề trên” biết lối mà tìm.' })),
          makeInput('address', 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố…', { rows: 2, maxlength: 200 }),
        ),
      ),

      // 2. "Hình mẫu" người yêu mong muốn (càng chi tiết càng tốt)
      h('section', { class: 'duyen-sec' },
        h('h3', { text: '2. “Hình mẫu” người yêu mong muốn (càng chi tiết càng tốt)' }),
        h('p', { class: 'duyen-sec-desc', text: 'Khi cầu duyên, bạn không nên chỉ nói chung chung là “xin cho con có người yêu”. Hãy chuẩn bị sẵn trong đầu các tiêu chí cụ thể để khấn rõ ràng:' }),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Tính cách:' }), ' ', h('small', { text: 'Ví dụ như hiền lành, biết quan tâm, có chí tiến thủ, chung thủy…' })),
          makeInput('personality', 'Hiền lành, biết quan tâm, có chí tiến thủ, chung thủy…', { rows: 2, maxlength: 200 }),
        ),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Ngoại hình/Tuổi tác:' }), ' ', h('small', { text: 'Khoảng tuổi mong muốn (hợp tuổi, hơn hoặc kém bao nhiêu tuổi), chiều cao…' })),
          makeInput('appearanceAge', 'Khoảng tuổi mong muốn (hợp tuổi, hơn/kém bao nhiêu tuổi), chiều cao…', { rows: 2, maxlength: 200 }),
        ),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Công việc/Học vấn:' }), ' ', h('small', { text: 'Có công việc ổn định, cùng ngành nghề hoặc định hướng tương lai tương đồng…' })),
          makeInput('jobEducation', 'Công việc ổn định, cùng ngành nghề hoặc định hướng tương lai tương đồng…', { rows: 2, maxlength: 200 }),
        ),
        h('label', { class: 'duyen-field' },
          h('span', { class: 'duyen-lbl' }, h('b', { text: 'Lời khấn / tâm nguyện thêm:' }), ' ', h('small', { text: 'Điều bạn muốn gửi gắm thêm (không bắt buộc).' })),
          makeInput('wishText', 'Lời nguyện riêng của bạn…', { rows: 2, maxlength: 200 }),
        ),
        h('p', { class: 'duyen-warn' }, h('em', { text: 'Lưu ý: Hãy thực tế với mong ước của mình, tránh cầu những tiêu chí quá hoàn hảo, xa rời thực tế.' })),
      ),

      h('button', {
        type: 'button',
        class: 'btn-primary duyen-go',
        onclick: () => {
          const sRes = parseAndValidateSolar(solarIn.value);
          const lRes = parseAndValidateLunar(lunarIn.value);
          setErr(solarIn, solarErr, sRes.ok ? '' : sRes.error);
          setErr(lunarIn, lunarErr, lRes.ok ? '' : lRes.error);
          if (!sRes.ok) {
            solarIn.focus();
            return;
          }
          if (!lRes.ok) {
            lunarIn.focus();
            return;
          }
          if (!sRes.empty) {
            form.birthSolar = sRes.formattedSolar;
            solarIn.value = sRes.formattedSolar;
          }
          saveDraft();
          closeModal(modal);
          const w = WISHES.find((x) => x.id === form.pick) || WISHES[0];
          onPray(w, { ...form });
        },
      }, 'Thành tâm dâng sớ cầu duyên'),
    );

    sheet.replaceChildren(
      h('div', { class: 'sheet-head duyen-head' },
        h('h2', { id: 'duyen-title', text: 'Sớ cầu duyên lành' }),
        h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' }),
      ),
      body,
    );
    if (prevScroll) body.scrollTop = prevScroll;
  }

  function renderSoSummary(mine) {
    if (!mine) return null;
    if (typeof mine === 'string') {
      return mine ? h('p', { class: 'duyen-mine', 'data-no-i18n': true, text: `“${mine}”` }) : null;
    }
    const rows = [
      ['Tín chủ', mine.fullName],
      ['Sinh ngày (DL)', mine.birthSolar],
      ['Sinh ngày (ÂL)', mine.birthLunar],
      ['Ngụ tại', mine.address],
      ['Tính cách mong cầu', mine.personality],
      ['Ngoại hình / Tuổi tác', mine.appearanceAge],
      ['Công việc / Học vấn', mine.jobEducation],
      ['Tâm nguyện', mine.wishText],
    ].filter(([, v]) => v && String(v).trim());
    if (!rows.length) return null;
    return h('div', { class: 'duyen-so', 'data-no-i18n': true },
      h('small', { class: 'duyen-so-title', text: 'Sớ cầu duyên của bạn' }),
      ...rows.map(([k, v]) => h('div', { class: 'duyen-so-row' }, h('b', { text: `${k}: ` }), h('span', { text: String(v).trim() }))),
    );
  }

  let animTimers = [];
  const clearAnim = () => {
    while (animTimers.length) clearTimeout(animTimers.pop());
  };

  function buildFortuneTube() {
    const sticks = [-26, -17, -9, 0, 9, 17, 26].map((x, i) =>
      h('i', { class: `duyen-stick s${i + 1}`, style: `--sx:${x}px;--sd:${(i * 0.07).toFixed(2)}s` }),
    );
    const chosenSlip = h('div', { class: 'duyen-chosen-slip' },
      h('span', { class: 'duyen-slip-knot' }),
      h('span', { class: 'duyen-slip-txt', text: 'Quẻ Duyên' }),
    );
    return h('div', { class: 'duyen-tube-wrap' },
      h('div', { class: 'duyen-glow' }),
      h('div', { class: 'duyen-sparks' },
        h('i', { class: 'sp1', text: '✦' }),
        h('i', { class: 'sp2', text: '✧' }),
        h('i', { class: 'sp3', text: '✦' }),
        h('i', { class: 'sp4', text: '✧' }),
      ),
      h('div', { class: 'duyen-tube' },
        h('div', { class: 'duyen-sticks-back' }, ...sticks),
        chosenSlip,
        h('div', { class: 'duyen-tube-mouth' }),
        h('div', { class: 'duyen-tube-body' },
          h('div', { class: 'duyen-tube-rim top' }),
          h('div', { class: 'duyen-tube-badge' }, h('span', { text: 'Duyên' })),
          h('div', { class: 'duyen-tube-rim bot' }),
        ),
        h('div', { class: 'duyen-tube-base' }),
      ),
    );
  }

  return {
    open() {
      clearAnim();
      ask();
      openModal('#modal-duyen');
    },
    // Hoạt ảnh ống quẻ lắc và lời nhắn bay ra sau khi dâng sớ cầu duyên
    showCard(w, msg, mine) {
      clearAnim();
      const stage = h('div', { class: 'duyen-stage shaking' });
      const tubeWrap = buildFortuneTube();
      const statusTxt = h('p', { class: 'duyen-stage-txt', text: 'Đang thành tâm lắc ống quẻ cầu duyên…' });
      const resultWrap = h('div', { class: 'duyen-result-wrap', hidden: true },
         ...[
          h('div', { class: 'duyen-card duyen-fly-card' },
            h('small', { text: 'Lời nhắn bay ra từ ống quẻ' }),
            h('p', { text: msg }),
          ),
          renderSoSummary(mine),
          h('p', { class: 'muted', text: 'Nguyện cho bạn và mọi người đều gặp duyên lành. Nam mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát.' }),
          h('button', { class: 'btn-primary duyen-go', 'data-close': true }, 'Hoan hỷ'),
        ].filter(Boolean),
      );

      stage.append(tubeWrap, statusTxt);
      const body = h('div', { class: 'duyen-body' }, stage, resultWrap);
      sheet.replaceChildren(
        h('div', { class: 'sheet-head duyen-head' },
          h('h2', { id: 'duyen-title' }, `${w.icon} `, h('span', { text: w.name })),
          h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' }),
        ),
        body,
      );
      openModal('#modal-duyen');

      // Bước 1 (0 -> 1.65s): ống quẻ hiện ra và lắc lắc
      // Bước 2 (1.65s): quẻ duyên phát sáng bay vọt ra khỏi ống quẻ
      animTimers.push(setTimeout(() => {
        stage.classList.remove('shaking');
        stage.classList.add('flying');
        statusTxt.textContent = 'Một quẻ duyên lành đang bay ra từ ống quẻ…';
      }, 1650));

      // Bước 3 (2.45s): lời nhắn mở ra từ quẻ duyên vừa bay lên
      animTimers.push(setTimeout(() => {
        stage.classList.add('done');
        statusTxt.hidden = true;
        resultWrap.hidden = false;
      }, 2450));
    },
  };
}
