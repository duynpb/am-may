// Kết nối nhiều người qua WebSocket. Nếu không có máy chủ, trang chạy ở chế độ ngoại tuyến.
export const ROOMS = Array.from({ length: 8 }, (_, i) => ({ id: `chanh-dien-${i + 1}`, name: `Chánh điện ${i + 1}` }));

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
export function connect({ room, name, robe, sandals, uid }, timeout = 3000) {
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
