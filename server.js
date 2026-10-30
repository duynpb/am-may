// Máy chủ Am Mây: phục vụ file tĩnh + WebSocket cho các chánh điện nhiều người.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
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

function broadcast(roomId, msg, exceptId) {
  const data = JSON.stringify(msg);
  for (const [id, m] of rooms.get(roomId)) if (id !== exceptId && m.ws.readyState === 1) m.ws.send(data);
}
const sendCount = (roomId) => broadcast(roomId, { t: 'count', n: rooms.get(roomId).size });

wss.on('connection', (ws) => {
  let me = null;
  let roomId = null;
  let tokens = 20;
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
  const refill = setInterval(() => (tokens = Math.min(20, tokens + 5)), 1000);

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
      me = { id: String(nextId++), name: clean(m.name), robe: clamp(m.robe, 0, 50) | 0, x: 0, z: 16, seat: null };
      ws.send(JSON.stringify({ t: 'welcome', id: me.id, room: roomId, peers: [...members.values()].map((p) => p.p) }));
      broadcast(roomId, { t: 'join', p: me });
      members.set(me.id, { ws, p: me });
      sendCount(roomId);
      return;
    }
    if (!me) return;

    if (m.t === 'move') {
      me.x = clamp(m.x, -14, 14);
      me.z = clamp(m.z, -14, 18);
      me.seat = Number.isInteger(m.seat) && m.seat >= 0 && m.seat < 64 ? m.seat : null;
      broadcast(roomId, { t: 'move', id: me.id, x: me.x, z: me.z, seat: me.seat }, me.id);
    } else if (m.t === 'act' && ['gassho', 'bow', 'bell', 'drum', 'incense'].includes(m.a)) {
      broadcast(roomId, {
        t: 'act', id: me.id, a: m.a,
        to: typeof m.to === 'string' ? m.to.slice(0, 12) : undefined,
        n: m.a === 'incense' ? (m.n === 3 ? 3 : 1) : undefined,
      }, me.id);
    } else if (m.t === 'name') {
      me.name = clean(m.name);
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
