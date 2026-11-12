// Cầu duyên: cây duyên trước điện Quan Âm, treo dải lụa đỏ và thẻ gỗ. Bấm vào cây → chọn điều cầu → nhân vật tới lạy
// Quán Thế Âm Bồ Tát, thắt một dải lụa đỏ lên cây và nhận một lời nhắn theo tinh thần Phật dạy (duyên do tâm tạo).
// Điều mong cầu viết riêng chỉ hiện trên máy mình, không gửi đi đâu, không lưu lại.
import * as THREE from 'three';
import { solarToLunar } from './lunar.js';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
function autoLunarBirth(str) {
  const s = (str || '').trim();
  let dd = 0, mm = 0, yy = 0;
  const m1 = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  const m2 = s.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);
  if (m1) [dd, mm, yy] = [+m1[1], +m1[2], +m1[3]];
  else if (m2) [yy, mm, dd] = [+m2[1], +m2[2], +m2[3]];
  if (!dd || mm < 1 || mm > 12 || dd > 31 || yy < 1900 || yy > 2100) return '';
  const dt = new Date(yy, mm - 1, dd);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return '';
  const [ld, lm, ly, leap] = solarToLunar(dd, mm, yy);
  const pad = (n) => String(n).padStart(2, '0');
  const canChi = `${CAN[(ly + 6) % 10]} ${CHI[(ly + 8) % 12]}`;
  return `${pad(ld)}/${pad(lm)}/${ly}${leap ? ' (nhuận)' : ''} (năm ${canChi})`;
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
export function buildDuyenTree({ scene, std, pickables, obstacles }) {
  const g = new THREE.Group();
  g.position.set(DUYEN.x, GY, DUYEN.z);
  g.userData = { kind: 'duyen' };
  scene.add(g);
  pickables.push(g);
  obstacles.push({ x: DUYEN.x, z: DUYEN.z, r: DUYEN.r });
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
    head: new THREE.Vector3(DUYEN.x, GY + 2.8, DUYEN.z),
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
    let lunarIn = null;
    const solarIn = makeInput('birthSolar', 'Ngày dương lịch (VD: 15/08/2000)', {
      maxlength: 40,
      onInput: (val) => {
        const auto = autoLunarBirth(val);
        if (auto && lunarIn) {
          form.birthLunar = auto;
          lunarIn.value = auto;
        }
      },
    });
    lunarIn = makeInput('birthLunar', 'Ngày âm lịch (tự tính khi nhập ngày dương hoặc tự ghi)', { maxlength: 60 });

    sheet.replaceChildren(
      h('div', { class: 'sheet-head' },
        h('h2', { id: 'duyen-title', text: 'Sớ cầu duyên lành' }),
        h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' }),
      ),
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
          h('div', { class: 'duyen-date-row' }, solarIn, lunarIn),
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
          closeModal(modal);
          const w = WISHES.find((x) => x.id === form.pick) || WISHES[0];
          onPray(w, { ...form });
        },
      }, 'Thành tâm dâng sớ cầu duyên'),
    );
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

  return {
    open() {
      ask();
      openModal('#modal-duyen');
    },
    // thẻ lời nhắn sau khi thắt dải lụa / dâng sớ
    showCard(w, msg, mine) {
      sheet.replaceChildren(...[
        h('div', { class: 'sheet-head' }, h('h2', { id: 'duyen-title' }, `${w.icon} `, h('span', { text: w.name })), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
        renderSoSummary(mine),
        h('div', { class: 'duyen-card' }, h('small', { text: 'Lời nhắn từ cây duyên' }), h('p', { text: msg })),
        h('p', { class: 'muted', text: 'Nguyện cho bạn và mọi người đều gặp duyên lành. Nam mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát.' }),
        h('button', { class: 'btn-primary duyen-go', 'data-close': true }, 'Hoan hỷ'),
      ].filter(Boolean));
      openModal('#modal-duyen');
    },
  };
}
