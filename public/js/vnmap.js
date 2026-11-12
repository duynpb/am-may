// Bản đồ Việt Nam: đất liền, các đảo, quần đảo Hoàng Sa và Trường Sa, các chùa nổi tiếng đặt đúng toạ độ.
// Am Mây và Tam Chúc (Ninh Bình, địa giới mới từ 1/7/2025) đã dựng: bấm để tới. Chùa chưa dựng: bấm để xem khu đất trống.
import { MAINLAND, BIG_ISLANDS, ISLANDS, HOANG_SA, TRUONG_SA, SEA_LABELS, PAGODAS } from './vnmap-data.js';

const NS = 'http://www.w3.org/2000/svg';
// phép chiếu đơn giản: kinh độ co theo cos(16°), mỗi độ 60 đơn vị
const LON0 = 101.6, LAT0 = 24.0, K = 60, KX = K * Math.cos((16 * Math.PI) / 180);
const X = (lon) => (lon - LON0) * KX, Y = (lat) => (LAT0 - lat) * K;
const W = X(117.8), H = Y(6.6);
const PAGES = {
  ammay: './', tamchuc: './tamchuc.html',
  // các chùa miền Nam dựng kỹ: chung trang chua.html
  vinhnghiem: './chua.html?site=vinhnghiem', chuadoi: './chua.html?site=chuadoi', baden: './chua.html?site=baden', phatdai: './chua.html?site=phatdai',
  thienmu: './chua.html?site=thienmu', linhungbb: './chua.html?site=linhungbb', longson: './chua.html?site=longson', truclamdl: './chua.html?site=truclamdl',
  baidinh: './chua.html?site=baidinh', yentu: './chua.html?site=yentu', bavang: './chua.html?site=bavang', taythien: './chua.html?site=taythien',
  chuaha: './chua.html?site=chuaha', motcot: './chua.html?site=motcot', tranquoc: './chua.html?site=tranquoc', quansu: './chua.html?site=quansu',
};

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.append(e);
  return e;
}
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
const BAC = ['Hà Nội', 'Ninh Bình', 'Hưng Yên', 'Bắc Ninh', 'Quảng Ninh', 'Hải Phòng', 'Phú Thọ', 'Lạng Sơn'];
const TRUNG = ['Nghệ An', 'Huế', 'Đà Nẵng', 'Quảng Ngãi', 'Gia Lai', 'Khánh Hòa', 'Lâm Đồng', 'Đắk Lắk'];
const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Biển đảo'];
const regionOf = (p) => (p.prov.startsWith('Đặc khu') ? 3 : BAC.includes(p.prov) ? 0 : TRUNG.includes(p.prov) ? 1 : 2);
const path = (pts) => 'M' + pts.map(([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join('L') + 'Z';

// here: chỗ đang đứng (mã chùa: 'ammay', 'tamchuc' hoặc mã khu đất trống); from: khu đã dựng để quay về
// Xem bản đồ: kéo thả tự do (chuột hoặc một ngón tay), lăn chuột / chụm hai ngón để phóng to đúng chỗ đang chỉ,
// nút + / − và "Toàn cảnh". Chữ, chấm giữ nguyên cỡ trên màn hình khi phóng to.
export function createVnMap({ openModal, closeModal, here, from = here }) {
  const home = ['ammay', 'tamchuc'].includes(from) ? from : 'ammay';
  const modal = h('div', { class: 'modal vn-modal', id: 'modal-vn', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'vn-title' });
  const sheet = h('div', { class: 'sheet vn-sheet' });
  modal.append(sheet);
  document.body.append(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal(modal);
  });
  let built = false, selected = null;
  const view = h('div', { class: 'vn-view' });
  const svg = el('svg', { class: 'vn-svg', 'aria-label': 'Bản đồ Việt Nam' });
  view.append(svg);
  const card = h('div', { class: 'vn-card' });
  const tools = h('div', { class: 'vn-zoom' },
    h('button', { 'aria-label': 'Phóng to', title: 'Phóng to', text: '+', onclick: () => zoomBy(1 / 1.6) }),
    h('button', { 'aria-label': 'Thu nhỏ', title: 'Thu nhỏ', text: '−', onclick: () => zoomBy(1.6) }),
    h('button', { class: 'vn-fit', title: 'Toàn cảnh', text: 'Toàn cảnh', onclick: () => { fit(); apply(); } }));
  view.append(tools, card);
  // danh sách chùa bên phải: ô tìm, chia theo miền; di chuột / chạm vào tên thì sáng tên và chấm trên bản đồ
  const search = h('input', { class: 'vn-search', type: 'search', placeholder: 'Tìm chùa hoặc tỉnh…', 'aria-label': 'Tìm chùa hoặc tỉnh' });
  const listBox = h('div', { class: 'vn-list-items' });
  const count = h('small', { class: 'muted vn-count' });
  const side = h('aside', { class: 'vn-list', 'aria-label': 'Danh sách chùa' }, h('div', { class: 'vn-list-head' }, h('b', { text: 'Danh sách chùa' }), count), search, listBox);
  sheet.append(
    h('div', { class: 'sheet-head' }, h('h2', { id: 'vn-title', text: 'Bản đồ Việt Nam' }), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
    h('p', { class: 'muted vn-help', text: 'Kéo để di chuyển · lăn chuột hoặc chụm hai ngón để phóng to. Chấm đỏ là chùa đã dựng trong Am Mây, chấm nâu là chùa chưa dựng. Di chuột vào tên trong danh sách để thấy chùa trên bản đồ, bấm để xem.' }),
    h('div', { class: 'vn-body' }, view, side),
  );

  // ---------- khung nhìn (viewBox): x, y, rộng w; cao tính theo tỉ lệ khung ----------
  const vb = { x: 0, y: 0, w: W, h: H };
  let fitW = W;
  const size = () => [view.clientWidth || 1, view.clientHeight || 1];
  function fit() {
    const [cw, ch] = size(), a = cw / ch;
    vb.w = W / H > a ? W : H * a;
    vb.w *= 1.02;
    vb.h = vb.w / a;
    vb.x = (W - vb.w) / 2;
    vb.y = (H - vb.h) / 2;
    fitW = vb.w;
  }
  function clampVb() {
    const [cw, ch] = size();
    vb.w = Math.min(Math.max(vb.w, fitW / 14), fitW * 1.3);
    vb.h = vb.w / (cw / ch);
    // giữ một phần bản đồ luôn trong khung
    vb.x = Math.min(Math.max(vb.x, -vb.w * 0.6), W - vb.w * 0.4);
    vb.y = Math.min(Math.max(vb.y, -vb.h * 0.6), H - vb.h * 0.4);
  }
  const fixes = []; // nhóm giữ cỡ cố định trên màn hình: { g, x, y }
  function apply() {
    clampVb();
    svg.setAttribute('viewBox', `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`);
    const s = vb.w / size()[0]; // số đơn vị bản đồ cho một điểm ảnh màn hình
    for (const f of fixes) f.g.setAttribute('transform', `translate(${f.x.toFixed(1)},${f.y.toFixed(1)}) scale(${s.toFixed(4)})`);
    svg.classList.toggle('vn-names', fitW / vb.w >= 2.6); // phóng to vừa: hiện tên chùa đã dựng
    svg.classList.toggle('vn-names2', fitW / vb.w >= 6); // phóng to nhiều: hiện tên mọi chùa
    svg.classList.toggle('vn-mid', fitW / vb.w >= 1.5); // điện thoại: tên đảo nhỏ hiện khi đã phóng to một chút
  }
  // phóng to / thu nhỏ quanh một điểm trên màn hình (mặc định giữa khung)
  function zoomAt(px, py, newW) {
    const [cw, ch] = size();
    const fx = px / cw, fy = py / ch, ux = vb.x + fx * vb.w, uy = vb.y + fy * vb.h;
    vb.w = Math.min(Math.max(newW, fitW / 14), fitW * 1.3);
    vb.h = vb.w / (cw / ch);
    vb.x = ux - fx * vb.w;
    vb.y = uy - fy * vb.h;
    apply();
  }
  const zoomBy = (k) => { const [cw, ch] = size(); zoomAt(cw / 2, ch / 2, vb.w * k); };
  function centerOn(lon, lat, w = vb.w) {
    const [cw, ch] = size();
    vb.w = w;
    vb.h = vb.w / (cw / ch);
    vb.x = X(lon) - vb.w / 2;
    vb.y = Y(lat) - vb.h / 2;
    apply();
  }

  // ---------- kéo thả, chụm hai ngón, lăn chuột ----------
  const pts = new Map();
  let moved = 0, pinch = null;
  const local = (e) => {
    const r = view.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  view.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.vn-zoom, .vn-card')) return;
    pts.set(e.pointerId, local(e));
    if (pts.size === 1) moved = 0;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, w: vb.w };
      moved = 99;
    }
    view.classList.add('drag');
  });
  window.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const q = local(e), dx = q[0] - p[0], dy = q[1] - p[1];
    pts.set(e.pointerId, q);
    if (pts.size === 1) {
      moved += Math.abs(dx) + Math.abs(dy);
      const s = vb.w / size()[0];
      vb.x -= dx * s;
      vb.y -= dy * s;
      apply();
    } else if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
      zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (pinch.w * pinch.d) / d);
    }
  });
  const up = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) view.classList.remove('drag');
  };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  view.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [x, y] = local(e);
    zoomAt(x, y, vb.w * Math.pow(1.0018, e.deltaY * (e.deltaMode === 1 ? 30 : 1)));
  }, { passive: false });
  view.addEventListener('dblclick', (e) => {
    if (e.target.closest('.vn-zoom, .vn-card, .vn-pin')) return;
    const [x, y] = local(e);
    zoomAt(x, y, vb.w / 1.8);
  });
  window.addEventListener('resize', () => {
    if (modal.hidden) return;
    const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
    const [cw, ch] = size();
    vb.h = vb.w / (cw / ch);
    vb.x = cx - vb.w / 2;
    vb.y = cy - vb.h / 2;
    apply();
  });

  // ---------- vẽ ----------
  const fixed = (x, y, parent = svg, attrs = {}) => {
    const g = el('g', attrs, parent);
    fixes.push({ g, x, y });
    return g;
  };
  function build() {
    built = true;
    el('rect', { x: -W, y: -H, width: W * 3, height: H * 3, class: 'vn-sea' }, svg);
    // lưới kinh – vĩ độ mờ
    const grid = el('g', { class: 'vn-grid' }, svg);
    for (let lon = 102; lon <= 117; lon += 1) el('line', { x1: X(lon), y1: -H, x2: X(lon), y2: H * 2 }, grid);
    for (let lat = 7; lat <= 24; lat += 1) el('line', { x1: -W, y1: Y(lat), x2: W * 2, y2: Y(lat) }, grid);
    el('path', { d: path(MAINLAND), class: 'vn-land' }, svg);
    for (const isl of BIG_ISLANDS) el('path', { d: path(isl.pts), class: 'vn-land' }, svg);
    // Hoàng Sa, Trường Sa: khung đứt nét bao quanh, tên quần đảo kèm "(Việt Nam)" và đặc khu
    for (const A of [HOANG_SA, TRUONG_SA]) {
      const xs = A.isles.map((i) => X(i[1])), ys = A.isles.map((i) => Y(i[2]));
      const pad = 14, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, x1 = Math.max(...xs) + pad, y1 = Math.max(...ys) + pad;
      el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 16, class: 'vn-arch' }, svg);
    }
    const labels = el('g', {}, svg);
    for (const [name, lon, lat, kind] of SEA_LABELS) {
      const t = el('text', { x: 0, y: 0, class: 'vn-sea-label' + (kind ? ` ${kind}` : ''), 'text-anchor': 'middle' }, fixed(X(lon), Y(lat), labels));
      t.textContent = name;
    }
    for (const [name, lon, lat] of ISLANDS) {
      const g = fixed(X(lon), Y(lat), labels);
      el('circle', { cx: 0, cy: 0, r: 2.6, class: 'vn-isle' }, g);
      const t = el('text', { x: 6, y: 3.5, class: 'vn-isle-label' }, g);
      t.textContent = name;
    }
    for (const A of [HOANG_SA, TRUONG_SA]) {
      for (const [name, lon, lat] of A.isles) {
        const g = fixed(X(lon), Y(lat), labels, { class: 'vn-isle-g' });
        el('circle', { cx: 0, cy: 0, r: 2.6, class: 'vn-isle' }, g);
        const t = el('text', { x: 5, y: 3.5, class: 'vn-isle-label vn-zoom-only', 'data-no-i18n': true }, g);
        t.textContent = name;
      }
      const g = fixed(X(A.label[0]), Y(A.label[1]), labels);
      const t = el('text', { x: 0, y: 0, class: 'vn-arch-label', 'text-anchor': 'middle' }, g);
      t.textContent = A.name;
      const t2 = el('text', { x: 0, y: 15, class: 'vn-arch-sub', 'text-anchor': 'middle' }, g);
      t2.textContent = '(Việt Nam)';
      if (A.sub) {
        const t3 = el('text', { x: 0, y: 28, class: 'vn-arch-sub', 'text-anchor': 'middle', 'data-no-i18n': true }, g);
        t3.textContent = A.sub;
      }
    }
    // chùa: chưa dựng vẽ trước (chấm nâu), đã dựng vẽ sau cùng cho nổi lên trên (chấm đỏ to hơn, có tên)
    const order = [...PAGODAS.filter((p) => !p.built), ...PAGODAS.filter((p) => p.built)];
    for (const p of order) {
      const g = fixed(X(p.lon), Y(p.lat), svg, { class: 'vn-pin' + (p.built ? ' built' : '') + (p.id === here ? ' here' : ''), role: 'button', tabindex: 0 });
      const ttl = el('title', {}, g);
      ttl.textContent = `${p.name} — ${p.prov}${p.old ? ` (${p.old} cũ)` : ''}`;
      el('circle', { cx: 0, cy: 0, r: 11, class: 'vn-hit' }, g); // vùng bấm rộng cho dễ chạm
      if (p.built) {
        el('circle', { cx: 0, cy: 0, r: 6, class: 'vn-dot-built' }, g);
        const t = el('text', { x: 10, y: 4, class: 'vn-pin-label', 'data-no-i18n': true }, g);
        t.textContent = p.name;
      } else {
        el('circle', { cx: 0, cy: 0, r: 4, class: 'vn-dot' }, g);
        const t = el('text', { x: 7, y: 4, class: 'vn-name', 'data-no-i18n': true }, g);
        t.textContent = p.name;
      }
      p.node = g;
      const pick = () => moved < 6 && select(p); // kéo bản đồ thì không tính là bấm chùa
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => e.key === 'Enter' && select(p));
      g.addEventListener('pointerenter', () => highlight(p, true));
      g.addEventListener('pointerleave', () => highlight(null));
    }
    buildList();
  }

  // ---------- danh sách chùa ----------
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  function buildList() {
    const nBuilt = PAGODAS.filter((p) => p.built).length;
    count.textContent = `${PAGODAS.length} chùa · ${nBuilt} đã dựng`;
    const groups = REGIONS.map((name) => ({ name, items: [] }));
    for (const p of PAGODAS) groups[regionOf(p)].items.push(p);
    for (const g of groups) {
      // chùa đã dựng lên trước, rồi từ bắc xuống nam
      g.items.sort((a, b) => (!!b.built - !!a.built) || b.lat - a.lat);
      const head = h('div', { class: 'vn-group' }, h('span', { text: g.name }), h('small', { text: String(g.items.length) }));
      g.head = head;
      listBox.append(head);
      for (const p of g.items) {
        const row = h('button', { class: 'vn-item' + (p.built ? ' built' : '') + (p.id === here ? ' here' : ''), type: 'button' },
          h('i', { class: 'vn-item-dot' }),
          h('span', { class: 'vn-item-text' }, h('b', { text: p.name, 'data-no-i18n': true }), h('small', { text: p.prov, 'data-no-i18n': true })),
          p.id === here ? h('em', { text: 'Bạn đang ở đây' }) : null);
        row.addEventListener('pointerenter', () => highlight(p));
        row.addEventListener('pointerleave', () => highlight(null));
        row.addEventListener('focus', () => highlight(p));
        row.addEventListener('blur', () => highlight(null));
        row.addEventListener('click', () => {
          select(p);
          // đưa chùa vào giữa bản đồ; đang nhìn toàn cảnh thì phóng to vừa phải
          centerOn(p.lon, p.lat, Math.min(vb.w, fitW / 3));
        });
        p.row = row;
        p.key = norm(`${p.name} ${p.prov} ${p.old || ''}`);
        listBox.append(row);
      }
    }
    search.addEventListener('input', () => {
      const q = norm(search.value.trim());
      for (const g of groups) {
        let shown = 0;
        for (const p of g.items) {
          const ok = !q || p.key.includes(q);
          p.row.hidden = !ok;
          shown += ok;
        }
        g.head.hidden = !shown;
      }
    });
  }
  // làm sáng một chùa: tên trong danh sách và chấm trên bản đồ (đưa chấm lên trên cùng cho khỏi bị che)
  let hl = null;
  function highlight(p, fromMap = false) {
    if (hl === p) return;
    if (hl) {
      hl.node?.classList.remove('hl');
      hl.row?.classList.remove('hl');
    }
    hl = p;
    if (!p) return;
    p.node?.classList.add('hl');
    p.node?.parentNode?.append(p.node);
    p.row?.classList.add('hl');
    if (fromMap && p.row && !p.row.hidden) p.row.scrollIntoView({ block: 'nearest' });
  }

  function select(p) {
    selected?.node?.classList.remove('sel');
    selected?.row?.classList.remove('sel');
    selected = p;
    p.node?.classList.add('sel');
    p.row?.classList.add('sel');
    p.node?.parentNode?.append(p.node);
    const go = p.id === here
      ? h('button', { class: 'btn-primary', 'data-close': true, text: 'Bạn đang ở đây' })
      : p.built
        ? h('button', { class: 'btn-primary', text: `Đến ${p.name}`, onclick: () => (location.href = PAGES[p.built]) })
        : h('button', { class: 'btn-primary', text: 'Xem khu đất', onclick: () => (location.href = `./datrong.html?chua=${encodeURIComponent(p.id)}&tu=${home}`) });
    card.replaceChildren(...[
      h('button', { class: 'x vn-card-x', 'aria-label': 'Đóng', text: '×', onclick: () => { card.replaceChildren(); selected?.node?.classList.remove('sel'); selected?.row?.classList.remove('sel'); selected = null; } }),
      h('div', { class: 'vn-card-head' }, h('b', { text: p.name }), h('span', { class: 'muted', text: p.prov })),
      p.old ? h('small', { class: 'muted vn-old', text: `Trước 7/2025 thuộc ${p.old}` }) : null,
      h('p', { class: 'muted', text: p.built ? 'Chùa đã dựng trong Am Mây.' : 'Chùa này chưa được dựng trong Am Mây — hiện là khu đất trống chờ ngày dựng chùa.' }),
      go,
    ].filter(Boolean));
  }

  let first = true;
  return {
    open() {
      if (!built) build();
      openModal('#modal-vn');
      // đợi hộp hiện ra (có kích thước) rồi mới tính khung nhìn
      const start = () => {
        if (!view.clientWidth) return requestAnimationFrame(start);
        if (first) {
          first = false;
          fit();
          const me = PAGODAS.find((p) => p.id === here);
          if (me) {
            select(me);
            me.row?.scrollIntoView({ block: 'center' });
          }
        }
        apply();
      };
      setTimeout(start, 30);
    },
  };
}
