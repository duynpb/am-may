// Kết nối nhiều người qua WebSocket. Nếu không có máy chủ, trang chạy ở chế độ ngoại tuyến.
// Mỗi khu là một trang riêng: Am Mây, Tam Chúc, và các chùa miền Nam (chua.html?site=…)
export const SITES = {
  ammay: { name: 'Am Mây', page: './', roomLabel: 'Chánh điện', desc: 'chánh điện, tháp, hành lang La Hán' },
  tamchuc: { name: 'Tam Chúc', page: 'tamchuc.html', roomLabel: 'Tam Chúc', desc: 'hồ lớn, cổng Tam Quan sát mặt nước' },
  // các chùa miền Nam dựng kỹ: chung một trang chua.html, mỗi chùa một file cảnh (js/chua/)
  vinhnghiem: { name: 'Chùa Vĩnh Nghiêm', page: 'chua.html?site=vinhnghiem', roomLabel: 'Vĩnh Nghiêm', desc: 'tam quan gỗ, tháp bảy tầng, đại hồng chung' },
  chuadoi: { name: 'Chùa Dơi', page: 'chua.html?site=chuadoi', roomLabel: 'Chùa Dơi', desc: 'chùa Khmer mái nhọn, vườn cây cổ thụ có đàn dơi' },
  baden: { name: 'Núi Bà Đen', page: 'chua.html?site=baden', roomLabel: 'Núi Bà Đen', desc: 'chùa Bà lưng chừng núi, cáp treo lên tượng Phật Bà trên đỉnh' },
  phatdai: { name: 'Thích Ca Phật Đài', page: 'chua.html?site=phatdai', roomLabel: 'Phật Đài', desc: 'tượng Phật Thích Ca trắng trên sườn núi nhìn ra biển' },
};
// các khu dựng kỹ ở miền Nam: mỗi khu một phòng
const SOUTH = [['vinhnghiem', 'vinh-nghiem', 'Vĩnh Nghiêm'], ['chuadoi', 'chua-doi', 'Chùa Dơi'], ['baden', 'ba-den', 'Núi Bà Đen'], ['phatdai', 'phat-dai', 'Phật Đài']];
export const ROOMS = [
  ...Array.from({ length: 2 }, (_, i) => ({ id: `chanh-dien-${i + 1}`, name: `Chánh điện ${i + 1}`, site: 'ammay' })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `tam-chuc-${i + 1}`, name: `Tam Chúc ${i + 1}`, site: 'tamchuc' })),
  ...SOUTH.map(([site, id, name]) => ({ id: `${id}-1`, name: `${name} 1`, site })),
];
export const siteRooms = (site) => ROOMS.filter((r) => r.site === site);
// đường dẫn tới một phòng (sang trang của khu đó)
export const roomUrl = (r) => `${SITES[r.site].page}${SITES[r.site].page.includes('?') ? '&' : '?'}room=${r.id}`;

export async function fetchMerit() {
  try {
    const r = await fetch('/api/merit', { cache: 'no-store' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function fetchRooms() {
  try {
    const r = await fetch('/api/rooms', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

class Net {
  constructor(ws) {
    this.ws = ws;
    this.handlers = {};
    this.welcome = null;
    ws.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') this.welcome = m;
      (this.handlers[m.t] || []).forEach((f) => f(m));
    };
    ws.onclose = () => (this.handlers.close || []).forEach((f) => f());
  }
  on(type, fn) {
    (this.handlers[type] ||= []).push(fn);
  }
  send(obj) {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }
  close() {
    this.handlers = {};
    this.ws.close();
  }
}

// Trả về Net khi đã nhận 'welcome', hoặc null nếu không kết nối được
// timeout rộng: lúc mới mở trang, máy yếu còn bận dựng cảnh 3D
export function connect({ room, name, robe, sandals, uid }, timeout = 8000) {
  return new Promise((resolve) => {
    if (!/^https?:$/.test(location.protocol)) return resolve(null);
    let ws;
    try {
      ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    } catch {
      return resolve(null);
    }
    const net = new Net(ws);
    const timer = setTimeout(() => { ws.close(); resolve(null); }, timeout);
    ws.onopen = () => net.send({ t: 'hello', room, name, robe, sandals, uid });
    ws.onerror = () => { clearTimeout(timer); resolve(null); };
    net.on('welcome', () => { clearTimeout(timer); resolve(net); });
    net.on('full', () => { clearTimeout(timer); resolve(null); });
  });
}
