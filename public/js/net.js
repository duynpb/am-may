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
  // các chùa miền Trung dựng kỹ
  thienmu: { name: 'Chùa Thiên Mụ', page: 'chua.html?site=thienmu', roomLabel: 'Thiên Mụ', desc: 'tháp Phước Duyên bảy tầng bên sông Hương' },
  linhungbb: { name: 'Chùa Linh Ứng Bãi Bụt', page: 'chua.html?site=linhungbb', roomLabel: 'Linh Ứng', desc: 'tượng Quan Âm trắng trên vách đá nhìn ra biển Sơn Trà' },
  longson: { name: 'Chùa Long Sơn', page: 'chua.html?site=longson', roomLabel: 'Long Sơn', desc: 'tượng Phật nằm và Kim Thân Phật Tổ trên đồi Trại Thủy' },
  truclamdl: { name: 'Thiền viện Trúc Lâm Đà Lạt', page: 'chua.html?site=truclamdl', roomLabel: 'Trúc Lâm', desc: 'thiền viện giữa rừng thông bên hồ Tuyền Lâm' },
  // các chùa miền Bắc dựng kỹ (núi thiêng)
  baidinh: { name: 'Chùa Bái Đính', page: 'chua.html?site=baidinh', roomLabel: 'Bái Đính', desc: 'hành lang La Hán, điện Pháp Chủ, bảo tháp mười ba tầng' },
  yentu: { name: 'Chùa Đồng Yên Tử', page: 'chua.html?site=yentu', roomLabel: 'Yên Tử', desc: 'cáp treo lên chùa Đồng trên đỉnh núi thiêng' },
  bavang: { name: 'Chùa Ba Vàng', page: 'chua.html?site=bavang', roomLabel: 'Ba Vàng', desc: 'chánh điện rất lớn trên sườn núi nhìn xuống đồng bằng' },
  taythien: { name: 'Thiền viện Tây Thiên', page: 'chua.html?site=taythien', roomLabel: 'Tây Thiên', desc: 'thiền viện giữa rừng Tam Đảo, cáp treo lên đền Thượng' },
  // các chùa Hà Nội
  chuaha: { name: 'Chùa Hà', page: 'chua.html?site=chuaha', roomLabel: 'Chùa Hà', desc: 'chùa cầu duyên giữa phố, cây duyên treo lụa đỏ' },
  motcot: { name: 'Chùa Một Cột', page: 'chua.html?site=motcot', roomLabel: 'Một Cột', desc: 'điện nhỏ trên một cột đá giữa hồ sen' },
  tranquoc: { name: 'Chùa Trấn Quốc', page: 'chua.html?site=tranquoc', roomLabel: 'Trấn Quốc', desc: 'chùa cổ trên bán đảo Hồ Tây, bảo tháp đỏ mười một tầng' },
  quansu: { name: 'Chùa Quán Sứ', page: 'chua.html?site=quansu', roomLabel: 'Quán Sứ', desc: 'chùa giữa phố, trụ sở Giáo hội Phật giáo Việt Nam' },
  // các chùa miền Nam — đợt hai
  buulong: { name: 'Chùa Bửu Long', page: 'chua.html?site=buulong', roomLabel: 'Bửu Long', desc: 'chùa trên đồi, bảo tháp vàng kiểu Thái' },
  vinhtrang: { name: 'Chùa Vĩnh Tràng', page: 'chua.html?site=vinhtrang', roomLabel: 'Vĩnh Tràng', desc: 'ba pho tượng Phật lớn ngoài trời giữa vườn Mỹ Tho' },
  hoquoc: { name: 'Thiền viện Trúc Lâm Hộ Quốc', page: 'chua.html?site=hoquoc', roomLabel: 'Hộ Quốc', desc: 'thiền viện trên đồi nhìn ra biển Phú Quốc' },
  tayan: { name: 'Chùa Tây An', page: 'chua.html?site=tayan', roomLabel: 'Tây An', desc: 'chùa mái vòm kiểu Ấn – Hồi dưới chân núi Sam' },
  // các chùa miền Nam — đợt ba
  giaclam: { name: 'Chùa Giác Lâm', page: 'chua.html?site=giaclam', roomLabel: 'Giác Lâm', desc: 'chùa cổ bằng gỗ, bảo tháp Phật bảy tầng' },
  ngochoang: { name: 'Chùa Ngọc Hoàng', page: 'chua.html?site=ngochoang', roomLabel: 'Ngọc Hoàng', desc: 'hồ rùa, vòng hương xoắn ốc, điện thờ Ngọc Hoàng' },
  vnquoctu: { name: 'Việt Nam Quốc Tự', page: 'chua.html?site=vnquoctu', roomLabel: 'Quốc Tự', desc: 'hai hồ sen, tượng Quan Âm, chánh điện ba tầng mái' },
  ang: { name: 'Chùa Âng', page: 'chua.html?site=ang', roomLabel: 'Chùa Âng', desc: 'chùa Khmer cổ bên ao Bà Om, cây sao cổ thụ' },
};
// các khu dựng kỹ ở miền Nam: mỗi khu một phòng
const SOUTH = [['vinhnghiem', 'vinh-nghiem', 'Vĩnh Nghiêm'], ['chuadoi', 'chua-doi', 'Chùa Dơi'], ['baden', 'ba-den', 'Núi Bà Đen'], ['phatdai', 'phat-dai', 'Phật Đài'],
  ['thienmu', 'thien-mu', 'Thiên Mụ'], ['linhungbb', 'linh-ung', 'Linh Ứng'], ['longson', 'long-son', 'Long Sơn'], ['truclamdl', 'truc-lam', 'Trúc Lâm'],
  ['baidinh', 'bai-dinh', 'Bái Đính'], ['yentu', 'yen-tu', 'Yên Tử'], ['bavang', 'ba-vang', 'Ba Vàng'], ['taythien', 'tay-thien', 'Tây Thiên'],
  ['chuaha', 'chua-ha', 'Chùa Hà'], ['motcot', 'mot-cot', 'Một Cột'], ['tranquoc', 'tran-quoc', 'Trấn Quốc'], ['quansu', 'quan-su', 'Quán Sứ'],
  ['buulong', 'buu-long', 'Bửu Long'], ['vinhtrang', 'vinh-trang', 'Vĩnh Tràng'], ['hoquoc', 'ho-quoc', 'Hộ Quốc'], ['tayan', 'tay-an', 'Tây An'],
  ['giaclam', 'giac-lam', 'Giác Lâm'], ['ngochoang', 'ngoc-hoang', 'Ngọc Hoàng'], ['vnquoctu', 'quoc-tu', 'Quốc Tự'], ['ang', 'chua-ang', 'Chùa Âng']];
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
