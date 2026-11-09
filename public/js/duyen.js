// Cầu duyên: cây duyên trước điện Quan Âm, treo dải lụa đỏ và thẻ gỗ. Bấm vào cây → chọn điều cầu → nhân vật tới lạy
// Quán Thế Âm Bồ Tát, thắt một dải lụa đỏ lên cây và nhận một lời nhắn theo tinh thần Phật dạy (duyên do tâm tạo).
// Điều mong cầu viết riêng chỉ hiện trên máy mình, không gửi đi đâu, không lưu lại.
import * as THREE from 'three';

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
  let pick = WISHES[0].id, wishText = '';

  function ask() {
    const note = h('textarea', { class: 'duyen-note', rows: 2, maxlength: 140, placeholder: 'Điều bạn mong cầu (không bắt buộc) — chỉ hiện trên máy bạn, không gửi đi, không lưu lại' });
    note.value = wishText;
    note.addEventListener('input', () => (wishText = note.value));
    sheet.replaceChildren(
      h('div', { class: 'sheet-head' }, h('h2', { id: 'duyen-title', text: 'Cầu duyên' }), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
      h('p', { text: 'Thành tâm cầu duyên lành trước Quán Thế Âm Bồ Tát: bạn sẽ chắp tay lạy, thắt một dải lụa đỏ lên cây duyên và nhận một lời nhắn. Phật dạy duyên do tâm tạo — sống tử tế, chân thành thì duyên lành sẽ đến.' }),
      h('div', { class: 'duyen-grid' }, WISHES.map((w) => h('button', { class: 'duyen-opt' + (w.id === pick ? ' on' : ''), onclick: () => { pick = w.id; ask(); } },
        h('span', { class: 'duyen-ico', text: w.icon }), h('span', { text: w.name })))),
      note,
      h('button', { class: 'btn-primary duyen-go', onclick: () => { closeModal(modal); onPray(WISHES.find((w) => w.id === pick), wishText.trim()); } }, 'Thành tâm cầu duyên'),
    );
  }
  return {
    open() {
      ask();
      openModal('#modal-duyen');
    },
    // thẻ lời nhắn sau khi thắt dải lụa
    showCard(w, msg, mine) {
      sheet.replaceChildren(...[
        h('div', { class: 'sheet-head' }, h('h2', { id: 'duyen-title' }, `${w.icon} `, h('span', { text: w.name })), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
        mine ? h('p', { class: 'duyen-mine', 'data-no-i18n': true, text: `“${mine}”` }) : null,
        h('div', { class: 'duyen-card' }, h('small', { text: 'Lời nhắn từ cây duyên' }), h('p', { text: msg })),
        h('p', { class: 'muted', text: 'Nguyện cho bạn và mọi người đều gặp duyên lành. Nam mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát.' }),
        h('button', { class: 'btn-primary duyen-go', 'data-close': true }, 'Hoan hỷ'),
      ].filter(Boolean));
      openModal('#modal-duyen');
    },
  };
}
