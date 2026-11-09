// Bản đồ Việt Nam: đất liền, các đảo, quần đảo Hoàng Sa và Trường Sa, các chùa nổi tiếng đặt đúng toạ độ.
// Am Mây và Tam Chúc (Ninh Bình, địa giới mới từ 1/7/2025) đã dựng: bấm để tới. Chùa chưa dựng: bấm để xem khu đất trống.
import { MAINLAND, BIG_ISLANDS, ISLANDS, HOANG_SA, TRUONG_SA, SEA_LABELS, PAGODAS } from './vnmap-data.js';

const NS = 'http://www.w3.org/2000/svg';
// phép chiếu đơn giản: kinh độ co theo cos(16°), mỗi độ 60 đơn vị
const LON0 = 101.6, LAT0 = 24.0, K = 60, KX = K * Math.cos((16 * Math.PI) / 180);
const X = (lon) => (lon - LON0) * KX, Y = (lat) => (LAT0 - lat) * K;
const W = X(117.8), H = Y(6.6);
const PAGES = { ammay: './', tamchuc: './tamchuc.html' };

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
const path = (pts) => 'M' + pts.map(([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join('L') + 'Z';

// here: chỗ đang đứng (mã chùa: 'ammay', 'tamchuc' hoặc mã khu đất trống); from: khu đã dựng để quay về
export function createVnMap({ openModal, closeModal, here, from = here }) {
  const home = ['ammay', 'tamchuc'].includes(from) ? from : 'ammay';
  const modal = h('div', { class: 'modal', id: 'modal-vn', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'vn-title' });
  const sheet = h('div', { class: 'sheet vn-sheet' });
  modal.append(sheet);
  document.body.append(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal(modal);
  });
  let zoom = 1, built = false, selected = null;
  const scroll = h('div', { class: 'vn-scroll' });
  const svg = el('svg', { viewBox: `0 0 ${W.toFixed(0)} ${H.toFixed(0)}`, class: 'vn-svg', 'aria-label': 'Bản đồ Việt Nam' });
  scroll.append(svg);
  const card = h('div', { class: 'vn-card' });
  const zoomBtns = h('div', { class: 'vn-zoom' },
    h('button', { class: 'ghost', 'aria-label': 'Thu nhỏ', text: '−', onclick: () => setZoom(zoom / 1.5) }),
    h('button', { class: 'ghost', 'aria-label': 'Phóng to', text: '+', onclick: () => setZoom(zoom * 1.5) }));
  sheet.append(
    h('div', { class: 'sheet-head' }, h('h2', { id: 'vn-title', text: 'Bản đồ Việt Nam' }), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
    h('p', { class: 'muted', text: 'Các chùa nổi tiếng khắp ba miền, kể cả trên quần đảo Hoàng Sa và Trường Sa. Hoa sen đỏ là chùa đã dựng trong Am Mây — bấm để tới. Chấm nâu là chùa chưa dựng — bấm để xem khu đất.' }),
    zoomBtns, scroll, card,
  );

  function setZoom(z) {
    const old = zoom;
    zoom = Math.max(1, Math.min(6, z));
    // giữ nguyên điểm giữa khung nhìn khi phóng to / thu nhỏ
    const cx = (scroll.scrollLeft + scroll.clientWidth / 2) / old, cy = (scroll.scrollTop + scroll.clientHeight / 2) / old;
    svg.style.width = `${zoom * 100}%`;
    scroll.scrollLeft = cx * zoom - scroll.clientWidth / 2;
    scroll.scrollTop = cy * zoom - scroll.clientHeight / 2;
  }
  function focusOn(p) {
    const r = svg.getBoundingClientRect(), s = r.width / W;
    scroll.scrollLeft = X(p.lon) * s - scroll.clientWidth / 2;
    scroll.scrollTop = Y(p.lat) * s - scroll.clientHeight / 2;
  }

  function build() {
    built = true;
    el('rect', { x: 0, y: 0, width: W, height: H, class: 'vn-sea' }, svg);
    // lưới kinh – vĩ độ mờ
    const grid = el('g', { class: 'vn-grid' }, svg);
    for (let lon = 102; lon <= 117; lon += 2) el('line', { x1: X(lon), y1: 0, x2: X(lon), y2: H }, grid);
    for (let lat = 8; lat <= 24; lat += 2) el('line', { x1: 0, y1: Y(lat), x2: W, y2: Y(lat) }, grid);
    for (const [name, lon, lat, kind] of SEA_LABELS) {
      const t = el('text', { x: X(lon), y: Y(lat), class: 'vn-sea-label' + (kind ? ` ${kind}` : ''), 'text-anchor': 'middle' }, svg);
      t.textContent = name;
    }
    el('path', { d: path(MAINLAND), class: 'vn-land' }, svg);
    for (const isl of BIG_ISLANDS) el('path', { d: path(isl.pts), class: 'vn-land' }, svg);
    for (const [name, lon, lat] of ISLANDS) {
      el('circle', { cx: X(lon), cy: Y(lat), r: 2.2, class: 'vn-isle' }, svg);
      const t = el('text', { x: X(lon) + 4, y: Y(lat) + 3, class: 'vn-isle-label' }, svg);
      t.textContent = name;
    }
    // Hoàng Sa, Trường Sa: khung đứt nét bao quanh, tên quần đảo kèm "(Việt Nam)"
    for (const A of [HOANG_SA, TRUONG_SA]) {
      const xs = A.isles.map((i) => X(i[1])), ys = A.isles.map((i) => Y(i[2]));
      const pad = 14, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, x1 = Math.max(...xs) + pad, y1 = Math.max(...ys) + pad;
      el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 16, class: 'vn-arch' }, svg);
      for (const [, lon, lat] of A.isles) el('circle', { cx: X(lon), cy: Y(lat), r: 2.4, class: 'vn-isle' }, svg);
      const t = el('text', { x: X(A.label[0]), y: Y(A.label[1]), class: 'vn-arch-label', 'text-anchor': 'middle' }, svg);
      t.textContent = A.name;
      const t2 = el('text', { x: X(A.label[0]), y: Y(A.label[1]) + 15, class: 'vn-arch-sub', 'text-anchor': 'middle' }, svg);
      t2.textContent = '(Việt Nam)';
      if (A.sub) {
        const t3 = el('text', { x: X(A.label[0]), y: Y(A.label[1]) + 28, class: 'vn-arch-sub', 'text-anchor': 'middle', 'data-no-i18n': true }, svg);
        t3.textContent = A.sub;
      }
    }
    // chùa: chưa dựng vẽ trước (chấm nâu), đã dựng vẽ sau cùng cho nổi lên trên (hoa sen đỏ, có tên)
    const order = [...PAGODAS.filter((p) => !p.built), ...PAGODAS.filter((p) => p.built)];
    for (const p of order) {
      const g = el('g', { class: 'vn-pin' + (p.built ? ' built' : '') + (p.id === here ? ' here' : ''), transform: `translate(${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)})`, role: 'button', tabindex: 0 }, svg);
      const ttl = el('title', {}, g);
      ttl.textContent = `${p.name} — ${p.prov}${p.old ? ` (${p.old} cũ)` : ''}`;
      if (p.built) {
        for (let k = 0; k < 6; k++) el('ellipse', { cx: 0, cy: -5, rx: 2.6, ry: 5.2, transform: `rotate(${k * 60})`, class: 'vn-petal' }, g);
        el('circle', { cx: 0, cy: 0, r: 3, class: 'vn-core' }, g);
        const t = el('text', { x: 10, y: 4, class: 'vn-pin-label' }, g);
        t.textContent = p.name;
      } else el('circle', { cx: 0, cy: 0, r: 3.4, class: 'vn-dot' }, g);
      p.node = g;
      const pick = () => select(p);
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => e.key === 'Enter' && pick());
    }
  }

  function select(p) {
    selected?.node?.classList.remove('sel');
    selected = p;
    p.node?.classList.add('sel');
    const go = p.id === here
      ? h('button', { class: 'btn-primary', 'data-close': true, text: 'Bạn đang ở đây' })
      : p.built
        ? h('button', { class: 'btn-primary', text: `Đến ${p.name}`, onclick: () => (location.href = PAGES[p.built]) })
        : h('button', { class: 'btn-primary', text: 'Xem khu đất', onclick: () => (location.href = `./datrong.html?chua=${encodeURIComponent(p.id)}&tu=${home}`) });
    card.replaceChildren(...[
      h('div', { class: 'vn-card-head' }, h('b', { text: p.name }), h('span', { class: 'muted', text: p.prov })),
      p.old ? h('small', { class: 'muted vn-old', text: `Trước 7/2025 thuộc ${p.old}` }) : null,
      h('p', { class: 'muted', text: p.built ? 'Chùa đã dựng trong Am Mây.' : 'Chùa này chưa được dựng trong Am Mây — hiện là khu đất trống chờ ngày dựng chùa.' }),
      go,
    ].filter(Boolean));
  }

  return {
    open() {
      if (!built) build();
      openModal('#modal-vn');
      requestAnimationFrame(() => {
        setZoom(zoom);
        const me = PAGODAS.find((p) => p.id === here);
        if (me && !selected) select(me);
        if (zoom > 1 && me) focusOn(me);
      });
    },
  };
}
