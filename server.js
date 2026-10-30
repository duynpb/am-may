// Máy chủ Am Mây: phục vụ file tĩnh + WebSocket cho các chánh điện nhiều người.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { applyEvent, newProfile, publicProfile, vnDate, CLIENT_KINDS } from './public/js/karma.js';
import { openStorage } from './storage.js';

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const MAX_PER_ROOM = 120;
const ROOMS = Array.from({ length: 8 }, (_, i) => ({ id: `chanh-dien-${i + 1}`, name: `Chánh điện ${i + 1}` }));
const rooms = new Map(ROOMS.map((r) => [r.id, new Map()]));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/rooms') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(ROOMS.map((r) => ({ ...r, count: rooms.get(r.id).size }))));
    return;
  }
  if (url.pathname === '/api/merit') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(meritPublic()));
    return;
  }
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error('not file');
    const ext = path.extname(file);
    const modified = s.mtime.toUTCString();
    const headers = {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'last-modified': modified,
      'accept-ranges': 'bytes',
    };
    // trình duyệt đã có bản mới nhất
    const since = Date.parse(req.headers['if-modified-since'] || '');
    if (since && Math.floor(s.mtimeMs / 1000) * 1000 <= since) {
      res.writeHead(304, headers).end();
      return;
    }
    const body = await readFile(file);
    // tải theo đoạn — Safari cần để phát audio
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      let start = range[1] ? +range[1] : body.length - +range[2];
      let end = range[1] && range[2] ? +range[2] : body.length - 1;
      start = Math.max(0, start);
      end = Math.min(end, body.length - 1);
      if (start > end) {
        res.writeHead(416, { 'content-range': `bytes */${body.length}` }).end();
        return;
      }
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${body.length}`, 'content-length': end - start + 1 });
      res.end(req.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { ...headers, 'content-length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Không tìm thấy');
  }
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 2048 });
let nextId = 1;

const clean = (s) => String(s ?? '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 20) || 'Khách';
const clamp = (v, a, b) => (Number.isFinite(+v) ? Math.min(b, Math.max(a, +v)) : 0);

// ---------- Công đức: đếm chung cả chùa theo ngày giờ Việt Nam ----------
const MERIT_PER_DAY = 3; // mỗi người
const MERIT_PER_IP = 30; // chặn lạm dụng (nhiều người dùng chung mạng vẫn đủ)
const merit = { date: vnDate(), total: 0, recent: [], byUser: new Map(), byIp: new Map() };
let meritDirty = false;
function meritToday() {
  const d = vnDate();
  if (merit.date !== d) {
    Object.assign(merit, { date: d, total: 0, recent: [], byUser: new Map(), byIp: new Map() });
    meritDirty = true;
  }
  return merit;
}
const meritPublic = () => ({ date: meritToday().date, total: merit.total, recent: merit.recent });

// ---------- Lưu trữ lâu dài (Postgres hoặc file) ----------
const storage = await openStorage({ dataDir: DATA_DIR });
const profiles = await storage.loadProfiles();
console.log(`Lưu trữ: ${storage.kind === 'postgres' ? 'cơ sở dữ liệu Postgres' : 'file trong ' + DATA_DIR} · đã nạp ${profiles.size} hồ sơ Phật tử`);
{
  const saved = await storage.loadKV('merit');
  if (saved?.date === vnDate()) {
    Object.assign(merit, { ...saved, byUser: new Map(saved.byUser), byIp: new Map(saved.byIp) });
  }
}
const dirtyProfiles = new Set();
let flushing = null;
// Ghi những hồ sơ đã đổi + sổ công đức (gom lại mỗi vài giây)
async function flush() {
  if (flushing) return flushing;
  const uids = [...dirtyProfiles];
  const meritChanged = meritDirty;
  if (!uids.length && !meritChanged) return;
  dirtyProfiles.clear();
  meritDirty = false;
  flushing = (async () => {
    try {
      await storage.saveProfiles(uids.map((u) => [u, profiles.get(u)]));
      if (meritChanged) {
        await storage.saveKV('merit', { ...merit, byUser: [...merit.byUser], byIp: [...merit.byIp] });
      }
    } catch (e) {
      // lỗi mạng tạm thời: để lần sau ghi lại
      console.error('Không lưu được dữ liệu:', e.message);
      uids.forEach((u) => dirtyProfiles.add(u));
      if (meritChanged) meritDirty = true;
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}
setInterval(flush, 4000);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    await flush();
    await flush(); // phần đổi trong lúc đang ghi
    await storage.close();
    process.exit(0);
  });
}

// ---------- Hồ sơ Phật tử: điểm phước / nghiệp ----------
function getProfile(uid, name) {
  let p = profiles.get(uid);
  if (!p) {
    p = newProfile(name);
    profiles.set(uid, p);
    dirtyProfiles.add(uid);
  }
  return p;
}
// Ghi nhận một việc; nếu được tính điểm thì báo cho chính người đó
function award(ws, uid, kind, opts) {
  const p = profiles.get(uid);
  const entry = p && applyEvent(p, kind, opts);
  if (!entry) return;
  dirtyProfiles.add(uid);
  if (!entry.silent) ws.send(JSON.stringify({ t: 'karma', entry, phuoc: p.phuoc, nghiep: p.nghiep }));
}

function broadcast(roomId, msg, exceptId) {
  const data = JSON.stringify(msg);
  for (const [id, m] of rooms.get(roomId)) if (id !== exceptId && m.ws.readyState === 1) m.ws.send(data);
}
const sendCount = (roomId) => broadcast(roomId, { t: 'count', n: rooms.get(roomId).size });

wss.on('connection', (ws, req) => {
  let me = null;
  let roomId = null;
  let uid = null;
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
  let tokens = 20;
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
  const refill = setInterval(() => (tokens = Math.min(20, tokens + 5)), 1000);
  let bellTimes = []; // phát hiện thỉnh chuông dồn dập

  ws.on('message', (buf) => {
    if (--tokens < 0) return; // giới hạn tốc độ
    let m;
    try { m = JSON.parse(buf); } catch { return; }

    if (m.t === 'hello' && !me) {
      roomId = rooms.has(m.room) ? m.room : ROOMS[0].id;
      const members = rooms.get(roomId);
      if (members.size >= MAX_PER_ROOM) {
        ws.send(JSON.stringify({ t: 'full' }));
        ws.close();
        return;
      }
      me = {
        id: String(nextId++), name: clean(m.name), robe: clamp(m.robe, 0, 50) | 0,
        sandals: clamp(m.sandals, 0, 50) | 0, x: 0, z: 16, seat: null,
      };
      uid = typeof m.uid === 'string' && /^[a-z0-9]{8,32}$/i.test(m.uid) ? m.uid : 'ip:' + ip;
      const used = meritToday().byUser.get(uid) || 0;
      getProfile(uid, me.name).name = me.name;
      dirtyProfiles.add(uid);
      ws.send(JSON.stringify({
        t: 'welcome', id: me.id, room: roomId, peers: [...members.values()].map((p) => p.p),
        merit: { ...meritPublic(), used },
      }));
      broadcast(roomId, { t: 'join', p: me });
      members.set(me.id, { ws, p: me, uid });
      sendCount(roomId);
      award(ws, uid, 'visit');
      return;
    }
    if (!me) return;

    if (m.t === 'move') {
      // trong chánh điện và ngoài sân (khu Quan Âm)
      me.x = clamp(m.x, -17, 17);
      me.z = clamp(m.z, -14, 40);
      me.seat = Number.isInteger(m.seat) && m.seat >= 0 && m.seat < 64 ? m.seat : null;
      broadcast(roomId, { t: 'move', id: me.id, x: me.x, z: me.z, seat: me.seat }, me.id);
    } else if (m.t === 'act' && ['gassho', 'bow', 'bell', 'drum', 'incense'].includes(m.a)) {
      const to = typeof m.to === 'string' ? m.to.slice(0, 12) : undefined;
      const n = m.a === 'incense' ? (m.n === 3 ? 3 : 1) : undefined;
      const place = m.a === 'incense' && m.place === 'out' ? 'out' : undefined;
      broadcast(roomId, { t: 'act', id: me.id, a: m.a, to, n, place }, me.id);
      if (m.a === 'bow') award(ws, uid, 'bow');
      else if (m.a === 'incense') award(ws, uid, 'incense', { n });
      else if (m.a === 'bell' || m.a === 'drum') {
        const now = Date.now();
        bellTimes = bellTimes.filter((t) => now - t < 30e3);
        bellTimes.push(now);
        if (bellTimes.length >= 5) {
          bellTimes = [];
          award(ws, uid, 'noise');
        } else {
          award(ws, uid, 'bell');
        }
      }
    } else if (m.t === 'merit') {
      const st = meritToday();
      const used = st.byUser.get(uid) || 0;
      const ipUsed = st.byIp.get(ip) || 0;
      if (used >= MERIT_PER_DAY || ipUsed >= MERIT_PER_IP) {
        ws.send(JSON.stringify({ t: 'merit-denied', used: Math.max(used, MERIT_PER_DAY) }));
        return;
      }
      st.byUser.set(uid, used + 1);
      st.byIp.set(ip, ipUsed + 1);
      st.total++;
      const name = m.anon ? null : me.name;
      st.recent.unshift({ name, at: Date.now() });
      st.recent.length = Math.min(st.recent.length, 12);
      meritDirty = true;
      ws.send(JSON.stringify({ t: 'merit-ok', used: used + 1, total: st.total, recent: st.recent }));
      broadcast(roomId, { t: 'merit', id: me.id, total: st.total, recent: st.recent }, me.id);
      award(ws, uid, 'merit');
    } else if (m.t === 'karma' && CLIENT_KINDS.includes(m.kind)) {
      award(ws, uid, m.kind);
    } else if (m.t === 'profile') {
      // xem hồ sơ: 'me' hoặc mã người đang ở cùng chánh điện (không lộ mã người dùng)
      const member = m.id === 'me' ? { uid } : rooms.get(roomId).get(String(m.id));
      const p = member && profiles.get(member.uid);
      ws.send(JSON.stringify({ t: 'profile', req: m.req, profile: p ? publicProfile(p) : null }));
    } else if (m.t === 'take-sandal') {
      // lấy một chiếc dép của người đang ở cùng chánh điện
      const target = rooms.get(roomId).get(String(m.id));
      if (!target || target.p.id === me.id || target.p.missing) return;
      target.p.missing = true;
      broadcast(roomId, { t: 'sandal-taken', id: target.p.id, by: me.id });
    } else if (m.t === 'sandal-return') {
      if (!me.missing) return;
      me.missing = false;
      broadcast(roomId, { t: 'sandal-returned', id: me.id }, me.id);
    } else if (m.t === 'name') {
      me.name = clean(m.name);
      const p = profiles.get(uid);
      if (p) {
        p.name = me.name;
        dirtyProfiles.add(uid);
      }
      broadcast(roomId, { t: 'name', id: me.id, name: me.name }, me.id);
    }
  });

  ws.on('close', () => {
    clearInterval(refill);
    if (!me) return;
    rooms.get(roomId).delete(me.id);
    broadcast(roomId, { t: 'leave', id: me.id });
    sendCount(roomId);
  });
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log(`Am Mây đang chạy tại http://localhost:${PORT}`));
