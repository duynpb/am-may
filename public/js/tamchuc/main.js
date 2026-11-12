// Trang khu Tam Chúc: đi dạo bờ hồ, qua cổng Tam Quan vào sân lớn, gặp mọi người cùng phòng.
// Dùng chung nhân vật, kết nối mạng, âm thanh, pháp danh và điểm phước với khu Am Mây.
import { lang, LANGS, setLang } from '../i18n.js'; // nạp trước để tự dịch chữ trên trang
import * as THREE from 'three';
import { buildTamChuc, groundY, WALK_AREAS, ROUND_OBSTACLES, SPAWN, LAND, BOARD, BOATS, PIER, PILLAR_POS, TERRACES, STAIRS, PLAZA, SUTRA_GARDEN, SHORE, GATE, CAULDRON } from './world.js';
import { PILLARS } from './sutras.js';
import { Avatar, ROBES } from '../avatar.js';
import { SANDAL_COLORS } from '../sandals.js';
import { Sound, CHANT_SYLLABLES, vietnameseVoices } from '../audio.js';
import { Beads } from '../beads.js';
import { connect, fetchRooms, fetchMerit, ROOMS, SITES, siteRooms, roomUrl } from '../net.js';
import { applyEvent, newProfile, publicProfile, vnDate, RULES, CLIENT_KINDS } from '../karma.js';
import { festivalOf, FESTIVAL_PHUOC } from '../lunar.js';
import { createVnMap } from '../vnmap.js';
import { createDuyenDialog } from '../duyen.js';

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const params = new URLSearchParams(location.search);

// ---------- Danh tính: chung với khu Am Mây (cùng khóa lưu trong trình duyệt) ----------
const IDENTITY = ['name', 'uid', 'robe', 'sandals'];
const cookie = {
  get(k) {
    const m = document.cookie.match(new RegExp('(?:^|; )ammay_' + k + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  },
  set(k, v) {
    try {
      document.cookie = `ammay_${k}=${encodeURIComponent(v)}; max-age=31536000; path=/; SameSite=Lax`;
    } catch { /* bị chặn cookie */ }
  },
};
const store = {
  get(k, d) {
    let v = null;
    try { v = localStorage.getItem('ammay.' + k); } catch { /* chế độ riêng tư */ }
    if (v == null && IDENTITY.includes(k)) v = cookie.get(k);
    try { return v == null ? d : JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    const s = JSON.stringify(v);
    try { localStorage.setItem('ammay.' + k, s); } catch { /* chế độ riêng tư */ }
    if (IDENTITY.includes(k)) cookie.set(k, s);
  },
};
const NOUNS = ['Mây', 'Sen', 'Trăng', 'Gió', 'Suối', 'Lá', 'Sương', 'Nắng', 'Trúc', 'Sóng'];
const ADJS = ['an nhiên', 'lặng lẽ', 'thong thả', 'dịu dàng', 'hiền hòa', 'thanh tịnh', 'bình yên'];
let myName = store.get('name', null) || `${pick(NOUNS)} ${pick(ADJS)}`;
store.set('name', myName);
const myRobe = store.get('robe', Math.floor(Math.random() * ROBES.length));
store.set('robe', myRobe);
const mySandals = store.get('sandals', Math.floor(Math.random() * SANDAL_COLORS.length)) % SANDAL_COLORS.length;
store.set('sandals', mySandals);
const myUid = store.get('uid', null) || Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => (b % 36).toString(36)).join('');
store.set('uid', myUid);

const isCoarse = matchMedia('(pointer: coarse)').matches;
const settings = Object.assign(
  { ambient: true, ambientVol: 0.45, chantVol: 0.5, fx: true, fxVol: 0.55, bg: true, quality: isCoarse ? 'low' : 'high', muted: false, showNames: true },
  store.get('settings', {}),
);

// phòng của khu này; phòng khu khác thì chuyển trang
const MY_ROOMS = siteRooms('tamchuc');
{
  const other = ROOMS.find((r) => r.id === params.get('room') && r.site !== 'tamchuc');
  if (other) location.replace(roomUrl(other));
}
const roomId = MY_ROOMS.some((r) => r.id === params.get('room')) ? params.get('room') : MY_ROOMS[0].id;
$('#room-name').textContent = MY_ROOMS.find((r) => r.id === roomId).name;

// ---------- Bộ vẽ ----------
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 1400);
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.quality === 'high' ? 2 : 1.25));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = camera.aspect < 0.8 ? 64 : 50;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

// tải cả phần chữ tiếng Việt của font trước khi vẽ biển (Google Fonts tách font theo bộ chữ)
try { await document.fonts.load('700 40px "Noto Serif"', 'TAM CHÚC ĐÀI THIỀN ẤẦẨẪẬ ỀỂỄỆ ỐỒỔỖỘ ỚỜỞỠỢ ỨỪỬỮỰ ĂÂÊÔƠƯ'); } catch { /* dùng font dự phòng */ }
const world = buildTamChuc(renderer, { quality: settings.quality });
const { scene } = world;
if (params.has('gio')) world.setHour(parseFloat(params.get('gio')));
Avatar.ground = groundY;
const sound = new Sound(settings);

// ---------- Nhân vật và nhãn ----------
const labelsEl = $('#labels');
const avatars = new Map();
function addAvatar(a) {
  avatars.set(a.id, a);
  scene.add(a.root);
  a.wearSandals(true);
  if (a.id !== 'me') {
    a.nameEl = document.createElement('div');
    a.nameEl.className = 'label name';
    a.nameEl.textContent = a.name;
    a.nameEl.addEventListener('click', () => openProfile(a)); // xem hồ sơ Phật tử
    labelsEl.append(a.nameEl);
  }
  return a;
}
function removeAvatar(id) {
  const a = avatars.get(id);
  if (!a) return;
  a.dispose();
  a.nameEl?.remove();
  a.bubbleEl?.remove();
  a.chatEl?.remove();
  avatars.delete(id);
}
const player = addAvatar(new Avatar({ id: 'me', name: myName, robe: myRobe, isPlayer: true }));
player.setSandals(SANDAL_COLORS[mySandals]);
player.wearSandals(true);
player.placeAt(SPAWN.x + rnd(-2, 2), SPAWN.z, SPAWN.ry);
player.labelEl = document.createElement('div');
player.labelEl.className = 'label me';
player.labelEl.innerHTML = '<i>Tôi</i>';
player.labelEl.append(myName);
labelsEl.append(player.labelEl);

function bubble(a, text, ms = 2600) {
  if (!a.bubbleEl) {
    a.bubbleEl = document.createElement('div');
    a.bubbleEl.className = 'label bubble hidden';
    labelsEl.append(a.bubbleEl);
  }
  a.bubbleEl.textContent = text;
  a.bubbleEl.classList.remove('hidden');
  a.bubbleUntil = performance.now() + ms;
}
function chatBubble(a, text) {
  if (!a.chatEl) {
    a.chatEl = document.createElement('div');
    a.chatEl.className = 'label chat hidden';
    labelsEl.append(a.chatEl);
  }
  a.chatEl.textContent = a === player || settings.showNames ? text : `${a.name}: ${text}`;
  a.chatEl.classList.remove('hidden');
  a.chatUntil = performance.now() + 5000;
}

// ---------- Thông báo, gợi ý, hộp thoại ----------
let toastT;
function toast(text, ms = 3000) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), ms);
}
const baseHint = isCoarse
  ? 'Chạm đất để đi · Kéo để nhìn quanh · Chụm hai ngón để phóng to'
  : 'Nhấp đất để đi · Kéo để nhìn quanh · Lăn chuột để phóng to · W A S D để đi';
let hintT;
function showHint(text, ms = 7000) {
  const el = $('#hint');
  el.textContent = text;
  el.classList.remove('hide');
  clearTimeout(hintT);
  if (ms) hintT = setTimeout(() => el.classList.add('hide'), ms);
}
function openModal(id) {
  const m = $(id);
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('show'));
}
function closeModal(m) {
  m.classList.remove('show');
  setTimeout(() => !m.classList.contains('show') && (m.hidden = true), 250);
}
// Bản đồ Việt Nam (nút trong hộp Bản đồ khu Tam Chúc)
const vnMap = createVnMap({ openModal, closeModal, here: 'tamchuc' });
$('#btn-vn')?.addEventListener('click', () => {
  closeModal($('#modal-map'));
  vnMap.open();
});
$('#btn-vn-nav')?.addEventListener('click', () => vnMap.open()); // nút "Chùa Việt Nam" ở thanh dưới
const duyenDlg = createDuyenDialog({
  openModal,
  closeModal,
  onPray(w, mine) {
    sound.init();
    player.act('bow', Math.PI);
    sound.bow();
    net?.send({ t: 'act', a: 'bow' });
    bubble(player, 'dâng sớ cầu duyên lành', 3200);
    setTimeout(() => {
      sound.bead();
      earn('duyen');
      duyenDlg.showCard(w, pick(w.msgs), mine);
    }, 2800);
  },
});
document.querySelectorAll('.modal').forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) closeModal(m);
  });
});

// ---------- Đi lại: các vùng hình chữ nhật nối nhau, đi vòng chướng ngại tròn ----------
const inRect = (r, x, z) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
function clampWalk(x, z) {
  let best = [x, z], bestD = Infinity;
  for (const r of WALK_AREAS) {
    const cx = clamp(x, r.minX, r.maxX), cz = clamp(z, r.minZ, r.maxZ);
    const d = Math.hypot(cx - x, cz - z);
    if (d < bestD) {
      bestD = d;
      best = [cx, cz];
    }
  }
  for (const o of ROUND_OBSTACLES) {
    const dx = best[0] - o.x, dz = best[1] - o.z, d = Math.hypot(dx, dz);
    if (d < o.r) best = [o.x + (dx / (d || 1)) * o.r, o.z + (dz / (d || 1)) * o.r];
  }
  return best;
}
const PORTALS = WALK_AREAS.map((a, i) => WALK_AREAS.map((b, j) => {
  if (i === j) return null;
  const r = { minX: Math.max(a.minX, b.minX), maxX: Math.min(a.maxX, b.maxX), minZ: Math.max(a.minZ, b.minZ), maxZ: Math.min(a.maxZ, b.maxZ) };
  return r.minX <= r.maxX && r.minZ <= r.maxZ ? r : null;
}));
function areaOf(x, z) {
  let best = 0, bestD = Infinity;
  WALK_AREAS.forEach((r, i) => {
    const d = inRect(r, x, z) ? -1 : Math.hypot(x - clamp(x, r.minX, r.maxX), z - clamp(z, r.minZ, r.maxZ));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
function detour(ax, az, bx, bz, depth = 0) {
  if (depth > 2) return [];
  for (const o of ROUND_OBSTACLES) {
    if (Math.hypot(ax - o.x, az - o.z) < o.r || Math.hypot(bx - o.x, bz - o.z) < o.r) continue;
    const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1;
    const t = clamp(((o.x - ax) * dx + (o.z - az) * dz) / L, 0, 1);
    let nx = ax + dx * t - o.x, nz = az + dz * t - o.z;
    const d = Math.hypot(nx, nz);
    if (d >= o.r) continue;
    if (d < 1e-3) [nx, nz] = [-dz, dx];
    const n = Math.hypot(nx, nz);
    const w = [o.x + (nx / n) * (o.r + 0.3), o.z + (nz / n) * (o.r + 0.3)];
    return [...detour(ax, az, w[0], w[1], depth + 1), w, ...detour(w[0], w[1], bx, bz, depth + 1)];
  }
  return [];
}
function routeTo(fx, fz, tx, tz) {
  const s = areaOf(fx, fz), t = areaOf(tx, tz);
  const prev = new Array(WALK_AREAS.length).fill(-1);
  prev[s] = s;
  const q = [s];
  while (q.length && prev[t] < 0) {
    const i = q.shift();
    PORTALS[i].forEach((p, j) => {
      if (p && prev[j] < 0) {
        prev[j] = i;
        q.push(j);
      }
    });
  }
  const chain = [];
  for (let i = t; prev[i] >= 0 && i !== s; i = prev[i]) chain.unshift(i);
  const pts = [];
  let cx = fx, cz = fz, from = s;
  for (const to of chain) {
    const p = PORTALS[from][to];
    const px = clamp(cx, Math.min(p.minX + 0.3, (p.minX + p.maxX) / 2), Math.max(p.maxX - 0.3, (p.minX + p.maxX) / 2));
    const pz = clamp(cz, Math.min(p.minZ + 0.3, (p.minZ + p.maxZ) / 2), Math.max(p.maxZ - 0.3, (p.minZ + p.maxZ) / 2));
    pts.push(...detour(cx, cz, px, pz), [px, pz]);
    [cx, cz, from] = [px, pz, to];
  }
  pts.push(...detour(cx, cz, tx, tz));
  return pts;
}
async function walkRoute(a, x, z) {
  const token = (a.route = {});
  a.routeTo = { x, z };
  for (const [px, pz] of routeTo(a.pos.x, a.pos.z, x, z)) {
    await a.walk(px, pz);
    if (a.route !== token) return false;
  }
  a.routeTo = null;
  a.walkTo(x, z);
  return true;
}
let net = null;
function sendMove() {
  if (!net) return;
  const g = ride ? BOARD : player.routeTo ?? player.goal ?? player.pos;
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: ride ? BOAT_SEAT + ride.i : null });
}
function movePlayerTo(x, z) {
  if (ride) {
    toast('Bạn đang ngồi thuyền — thuyền về bến sẽ lên bờ', 2600);
    return;
  }
  pendingBoard = false;
  pendingRead = null;
  [x, z] = clampWalk(x, z);
  walkRoute(player, x, z);
  sendMove();
  hideHint();
}
const hideHint = () => $('#hint').classList.add('hide');

// ---------- Hành động: chắp tay, lạy Phật ----------
function nearestPerson(r) {
  let best = null, bestD = r;
  for (const a of avatars.values()) {
    if (a === player) continue;
    const d = a.pos.distanceTo(player.pos);
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  return best;
}
const faceRy = (a, b) => Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z);
function doGassho(target = null) {
  sound.init();
  player.act('gassho', target ? faceRy(player, target) : null);
  sound.gassho();
  net?.send({ t: 'act', a: 'gassho', to: target?.id?.startsWith('n') ? target.id.slice(1) : undefined });
  if (target) {
    toast(`Bạn chắp tay chào ${target.name}`);
    earn('greet');
  }
}
// lạy về phía núi (các điện sẽ dựng trên sườn núi phía bắc)
function doBow() {
  sound.init();
  player.act('bow', Math.PI);
  sound.bow();
  net?.send({ t: 'act', a: 'bow' });
  earn('bow');
}
document.querySelectorAll('.actions button').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.act === 'gassho') {
    const near = nearestPerson(6);
    doGassho(near);
    if (!near) toast('Chưa có ai ở gần để chào — bạn lại gần một người nhé');
  } else if (b.dataset.act === 'bow') doBow();
  else if (b.dataset.act === 'boat') goBoard();
  else if (b.dataset.act === 'incense') {
    sound.init();
    openIncenseDialog();
  } else if (b.dataset.act === 'merit') {
    sound.init();
    openMeritDialog();
  } else if (b.dataset.act === 'beads') {
    sound.init();
    beads.open();
  } else if (b.dataset.act === 'duyen') {
    sound.init();
    duyenDlg.open();
  }
}));

// ---------- Vườn kinh: chạm vào cột kinh để đi tới đọc ----------
let pendingRead = null; // { i, x, z }
function goRead(i) {
  sound.init();
  if (ride) return toast('Bạn đang ngồi thuyền — thuyền về bến sẽ lên bờ', 2600);
  const p = PILLAR_POS[i];
  // đứng trước mặt cột, phía gần mình hơn
  const s = player.pos.x >= p.x ? 1 : -1;
  const [x, z] = clampWalk(p.x + s * 1.9, p.z);
  movePlayerTo(x, z);
  pendingRead = { i, x, z };
  toast(`Đi tới cột kinh số ${i + 1}…`, 1800);
}
function readTick() {
  if (!pendingRead || player.moving || player.routeTo) return;
  const r = pendingRead;
  pendingRead = null;
  if (Math.hypot(player.pos.x - r.x, player.pos.z - r.z) > 0.6) return;
  const p = PILLAR_POS[r.i];
  player.faceRy = Math.atan2(p.x - player.pos.x, p.z - player.pos.z);
  openSutra(r.i);
}
let reading = -1;
function openSutra(i) {
  reading = i;
  $('#sutra-title').textContent = `Cột kinh số ${i + 1} · ${PILLARS[i].title}`;
  $('#sutra-text').textContent = PILLARS[i].text;
  openModal('#modal-sutra');
}
$('#sutra-done').addEventListener('click', () => {
  closeModal($('#modal-sutra'));
  if (reading < 0) return;
  player.act('gassho');
  sound.gassho();
  net?.send({ t: 'act', a: 'gassho' });
  earn('sutra');
  toast('Bạn đã đọc xong một cột kinh — nguyện an lạc', 3000);
  reading = -1;
});

// ---------- Bản đồ khu Tam Chúc và đi nhanh ----------
const PLACES = [
  { id: 'shore', name: 'Bờ hồ', x: SPAWN.x, z: SPAWN.z, ry: Math.PI },
  { id: 'pier', name: 'Bến thuyền', x: 0, z: 60, ry: 0 },
  { id: 'plaza', name: 'Sân lớn', x: 0, z: 14, ry: Math.PI },
  { id: 'garden', name: 'Vườn kinh', x: -58.5, z: -16, ry: -Math.PI / 2 },
  ...TERRACES.map((T) => ({ id: T.key, name: T.name, x: 0, z: T.hall.back + 7.5, ry: Math.PI })),
];
function quickTravel(p) {
  closeModal($('#modal-map'));
  setOverview(false);
  if (ride) return toast('Bạn đang ngồi thuyền — thuyền về bến sẽ lên bờ', 2600);
  pendingBoard = false;
  pendingRead = null;
  player.route = null;
  player.routeTo = null;
  player.placeAt(p.x, p.z, p.ry);
  cam.target.set(player.root.position.x, player.root.position.y + 1.1, player.root.position.z);
  cam.yaw = p.ry + Math.PI;
  net?.send({ t: 'move', x: p.x, z: p.z, seat: null, w: 1 });
  toast(`Bạn đang ở ${p.name}`, 2600);
}
// bản đồ nằm ngang: bên trái là hồ, bên phải là sườn núi với ba điện
const SVGNS = 'http://www.w3.org/2000/svg';
const mapU = (z) => 90 - z, mapV = (x) => x;
let mapMe = null, mapOthers = null, mapOpen = false;
function buildMap() {
  const svg = $('#map-svg');
  if (svg.childElementCount) return;
  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.append(e);
    return e;
  };
  const rect = (x0, x1, z0, z1, cls) => el('rect', { x: mapU(z1), y: mapV(x0), width: z1 - z0, height: x1 - x0, class: cls });
  el('rect', { x: -10, y: -122, width: 290, height: 190, class: 'm-bg' });
  el('rect', { x: -10, y: -122, width: mapU(SHORE) + 10, height: 190, class: 'm-water' }); // hồ
  rect(-68, 68, 39.5, SHORE, 'm-stone'); // bờ hồ
  rect(-1.7, 1.7, SHORE, 66, 'm-porch'); // bến thuyền
  rect(-60, 60, GATE.z - 0.5, GATE.z + 0.5, 'm-wall'); // tường cổng
  rect(PLAZA.minX, PLAZA.maxX, PLAZA.minZ, PLAZA.maxZ, 'm-stone'); // sân lớn
  el('circle', { cx: mapU(CAULDRON.z), cy: mapV(CAULDRON.x), r: 2.6, class: 'm-statue' });
  rect(SUTRA_GARDEN.minX, -46, -19, -13, 'm-stone');
  rect(SUTRA_GARDEN.minX, SUTRA_GARDEN.maxX, SUTRA_GARDEN.minZ, SUTRA_GARDEN.maxZ, 'm-stone'); // vườn kinh
  for (const p of PILLAR_POS) el('rect', { x: mapU(p.z) - 0.6, y: mapV(p.x) - 0.6, width: 1.2, height: 1.2, class: 'm-wall' });
  for (const T of TERRACES) {
    rect(-T.halfX, T.halfX, T.back, T.front, 'm-terrace');
    rect(-T.hall.hx, T.hall.hx, T.hall.back, T.hall.front, 'm-hall');
  }
  for (const S of STAIRS) rect(-S.x, S.x, S.top, S.bottom, 'm-stairs');
  const labels = [
    ['shore', -34, 46, 'Bờ hồ'], ['pier', 0, 78, 'Bến thuyền'], ['plaza', 0, 20, 'Sân lớn'], ['garden', -84, -3, 'Vườn kinh'],
    ...TERRACES.map((T) => [T.key, 0, (T.hall.front + T.hall.back) / 2, T.name.replace('Điện ', '')]),
  ];
  for (const [id, x, z, text] of labels) {
    const g = el('g', { class: 'm-place', role: 'button', tabindex: 0 });
    el('text', { x: mapU(z), y: mapV(x) + 2.6, 'text-anchor': 'middle' }, g).textContent = text;
    const go = () => quickTravel(PLACES.find((p) => p.id === id));
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => e.key === 'Enter' && go());
  }
  mapOthers = el('g', {});
  mapMe = el('circle', { r: 3, class: 'm-me' });
}
function updateMap() {
  mapMe.setAttribute('cx', mapU(player.pos.z));
  mapMe.setAttribute('cy', mapV(player.pos.x));
  const others = [...avatars.values()].filter((a) => a !== player);
  while (mapOthers.childElementCount < others.length) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', 1.8);
    c.setAttribute('class', 'm-other');
    mapOthers.append(c);
  }
  [...mapOthers.children].forEach((c, i) => {
    const a = others[i];
    c.style.display = a ? '' : 'none';
    if (!a) return;
    c.setAttribute('cx', mapU(a.pos.z));
    c.setAttribute('cy', mapV(a.pos.x));
  });
}
$('#btn-map').addEventListener('click', () => {
  buildMap();
  const list = $('#map-go');
  if (!list.childElementCount) {
    for (const p of PLACES) {
      const b = document.createElement('button');
      b.className = 'room';
      b.innerHTML = '<b></b><small>Đi nhanh tới đây</small>';
      b.querySelector('b').textContent = p.name;
      b.addEventListener('click', () => quickTravel(p));
      list.append(b);
    }
  }
  mapOpen = true;
  updateMap();
  openModal('#modal-map');
});
$('#modal-map').addEventListener('transitionend', () => (mapOpen = $('#modal-map').classList.contains('show')));

// ---------- Đi thuyền quanh hồ ----------
// Thuyền chạy theo giờ chung nên mọi máy thấy thuyền ở cùng chỗ. Ai đang ngồi thuyền thì báo chỗ ngồi = 50 + số thuyền.
const BOAT_SEAT = 50;
const BOAT_SLOTS = [[-0.36, 1.0], [0.36, 1.0], [-0.36, -0.4], [0.36, -0.4]];
let ride = null; // { i, departed }
let pendingBoard = false;
const onPier = (a) => Math.abs(a.pos.x) < PIER.halfW && a.pos.z > PIER.z0 + 2;
function dockedBoat(minLeft = 3) {
  for (let i = 0; i < BOATS; i++) {
    const st = world.boatState(i);
    if (st.docked && st.left > minLeft) return { i, st };
  }
  return null;
}
// bao lâu nữa có thuyền cập bến
function nextBoatIn() {
  let best = Infinity;
  for (let i = 0; i < BOATS; i++) {
    const st = world.boatState(i);
    best = Math.min(best, st.docked ? 0 : st.left);
  }
  return Math.ceil(best);
}
function attachBoat(a, i) {
  const used = [...avatars.values()].filter((b) => b !== a && b.onBoat === i).map((b) => b.boatSlot);
  a.boatSlot = [0, 1, 2, 3].find((k) => !used.includes(k)) ?? 0;
  a.onBoat = i;
  a.seat = 'boat'; // tư thế ngồi
  a.route = null;
  a.routeTo = null;
  a.goal = null;
}
function detachBoat(a, x, z) {
  a.onBoat = null;
  a.seat = null;
  a.placeAt(x, z, Math.PI);
}
function goBoard() {
  sound.init();
  if (ride) return;
  if (Math.hypot(player.pos.x - BOARD.x, player.pos.z - BOARD.z) > 1.2) {
    // đi ra đầu bến trước, tới nơi có thuyền thì lên
    movePlayerTo(BOARD.x, BOARD.z);
    pendingBoard = true;
    const n = nextBoatIn();
    toast(n ? `Ra bến thuyền… thuyền kế tiếp cập bến sau khoảng ${n} giây` : 'Ra bến thuyền…', 3000);
    return;
  }
  const d = dockedBoat();
  if (!d) {
    pendingBoard = true;
    toast(`Thuyền đang đi quanh hồ — chiếc kế tiếp cập bến sau khoảng ${nextBoatIn()} giây`, 3200);
    return;
  }
  pendingBoard = false;
  attachBoat(player, d.i);
  ride = { i: d.i, departed: false };
  sendMove();
  toast(`Đã lên thuyền — thuyền rời bến sau ${Math.ceil(d.st.left)} giây, đi một vòng quanh các đảo`, 4000);
}
// ---------- Khách mô phỏng tham quan (mỗi máy tự cho đi, nhường chỗ khi có người thật) ----------
const bots = new Set();
let botSeq = 0;
const BOT_SAYS = ['Nam mô A Di Đà Phật', 'Hồ đẹp quá', 'Cảnh thật thanh tịnh', 'Lên điện Tam Thế thôi', 'Đi thuyền vui lắm', 'Gió hồ mát ghê'];
async function botGo(a, x, z) {
  [x, z] = clampWalk(x, z);
  walkRoute(a, x, z);
  await wait(200);
  while (bots.has(a) && (a.moving || a.routeTo)) await wait(300);
  return bots.has(a);
}
const TRIPS = [
  // dạo sân lớn, chắp tay trước đỉnh đồng
  async (a) => {
    if (!(await botGo(a, rnd(-6, 6), rnd(8, 12)))) return;
    a.act('gassho', Math.PI);
    await wait(rnd(4000, 8000));
  },
  // đọc kinh ở vườn kinh
  async (a) => {
    const i = Math.floor(Math.random() * PILLAR_POS.length), p = PILLAR_POS[i];
    if (!(await botGo(a, p.x + 1.9, p.z))) return;
    a.faceRy = -Math.PI / 2;
    await wait(rnd(5000, 10000));
    a.act('gassho');
    bubble(a, 'đọc kinh', 2500);
  },
  // lên một điện lạy Phật
  async (a) => {
    const T = pick(TERRACES);
    if (!(await botGo(a, rnd(-4, 4), T.hall.back + rnd(5, 8)))) return;
    a.act('bow', Math.PI);
    bubble(a, 'lạy Phật', 2500);
    await wait(rnd(6000, 10000));
  },
  // ra bờ hồ ngắm cảnh
  async (a) => {
    if (!(await botGo(a, rnd(-60, 60), rnd(48, 51.5)))) return;
    a.faceRy = 0;
    await wait(rnd(8000, 15000));
  },
  // đi thuyền một vòng quanh hồ
  async (a) => {
    if (!(await botGo(a, BOARD.x - rnd(0, 0.8), BOARD.z - rnd(0.5, 2.5)))) return;
    let d = null;
    for (let k = 0; k < 60 && bots.has(a) && !(d = dockedBoat(5)); k++) await wait(1000);
    if (!d || !bots.has(a)) return;
    attachBoat(a, d.i);
    let departed = false;
    while (bots.has(a)) {
      const st = world.boatState(d.i);
      if (!st.docked) departed = true;
      else if (departed) break;
      await wait(1000);
    }
    if (bots.has(a)) detachBoat(a, BOARD.x - 0.4, BOARD.z - 1.2);
  },
];
async function botLife(a) {
  await wait(rnd(500, 4000));
  while (bots.has(a)) {
    await pick(TRIPS)(a);
    if (!bots.has(a)) return;
    if (Math.random() < 0.3) bubble(a, pick(BOT_SAYS), 3500);
    await wait(rnd(3000, 10000));
  }
}
const BOT_NAMES = [['Mây', 'Sen', 'Trăng', 'Gió', 'Suối', 'Lá', 'Sương', 'Nắng', 'Trúc', 'Sóng'], ['an nhiên', 'lặng lẽ', 'thong thả', 'dịu dàng', 'hiền hòa', 'thanh tịnh', 'bình yên']];
function makeBot() {
  const a = addAvatar(new Avatar({ id: 'bot' + botSeq++, name: `${pick(BOT_NAMES[0])} ${pick(BOT_NAMES[1])}`, robe: Math.floor(Math.random() * ROBES.length) }));
  a.setSandals(pick(SANDAL_COLORS));
  a.wearSandals(true);
  const [x, z] = Math.random() < 0.5 ? clampWalk(rnd(-50, 50), rnd(41, 51)) : clampWalk(rnd(-40, 40), rnd(-30, 28));
  a.placeAt(x, z, rnd(0, 6.28));
  bots.add(a);
  botLife(a);
}
function syncBots() {
  const target = net ? Math.max(0, 10 - onlineCount) : 10;
  while (bots.size < target) makeBot();
  for (const a of [...bots]) {
    if (bots.size <= target) break;
    if (a.onBoat != null) continue; // đang đi thuyền thì để về bến
    bots.delete(a);
    removeAvatar(a.id);
  }
}

const boatBtn = document.querySelector('[data-act=boat]');
const slotV = new THREE.Vector3();
let boatUiT = 0;
function boatsTick(dt) {
  // người đang ngồi thuyền: đặt vào chỗ ngồi trên thuyền
  for (const a of avatars.values()) {
    if (a.onBoat == null) continue;
    const g = world.boats[a.onBoat];
    g.updateMatrixWorld();
    const [sx, sz] = BOAT_SLOTS[a.boatSlot % BOAT_SLOTS.length];
    slotV.set(sx, 0.42, sz).applyMatrix4(g.matrixWorld);
    a.pos.set(slotV.x, 0, slotV.z);
    a.root.position.set(slotV.x, slotV.y - 0.04 * a.p.sit, slotV.z);
    a.root.rotation.y = g.rotation.y;
  }
  if (ride) {
    const st = world.boatState(ride.i);
    if (!st.docked) ride.departed = true;
    else if (ride.departed) {
      // thuyền về bến: lên bờ
      ride = null;
      detachBoat(player, BOARD.x - 0.4, BOARD.z - 0.6);
      sendMove();
      toast('Thuyền đã về bến — mời bạn lên bờ', 3200);
    }
  } else if (pendingBoard && !player.moving && !player.routeTo && Math.hypot(player.pos.x - BOARD.x, player.pos.z - BOARD.z) < 1.2 && dockedBoat()) {
    goBoard();
  }
  // nút Lên thuyền: hiện khi đứng trên bến
  if ((boatUiT -= dt) > 0) return;
  boatUiT = 0.5;
  const show = !ride && onPier(player);
  boatBtn.hidden = !show;
  if (show) {
    const d = dockedBoat();
    boatBtn.querySelector('span').textContent = d ? `Lên thuyền (${Math.ceil(d.st.left)}s)` : `Thuyền về sau ${nextBoatIn()}s`;
  }
}

// ---------- Hồ sơ Phật tử: điểm phước / nghiệp (như khu Am Mây) ----------
// Trực tuyến: máy chủ tính điểm và gửi lại ('karma'). Ngoại tuyến: tính ngay trên máy theo cùng quy tắc.
let localProfile = store.get('profile', null) || newProfile(myName);
const saveSettings = () => store.set('settings', settings);
const isBot = (a) => bots.has(a) || String(a.id).startsWith('bot');

function earn(kind, opts) {
  if (net) {
    if (CLIENT_KINDS.includes(kind)) net.send({ t: 'karma', kind });
    return;
  }
  localProfile.name = myName;
  const entry = applyEvent(localProfile, kind, { ...opts, fest: festivalOf(Date.now()) });
  if (!entry) return;
  store.set('profile', localProfile);
  if (!entry.silent) showGain(entry);
}

// Điểm vừa được cộng: nhãn nhỏ bay lên trên đầu mình
const gains = [];
function showGain(entry) {
  if (!entry) return;
  const el = document.createElement('div');
  el.className = 'label gain' + (entry.nghiep ? ' bad' : '');
  el.textContent = entry.phuoc ? `+${entry.phuoc} phước · ${entry.label}` : `+${entry.nghiep} nghiệp · ${entry.label}`;
  labelsEl.append(el);
  gains.push({ el, born: performance.now() });
}
function updateGains(now) {
  for (let i = gains.length - 1; i >= 0; i--) {
    const g = gains[i];
    const k = (now - g.born) / 2200;
    if (k >= 1) {
      g.el.remove();
      gains.splice(i, 1);
      continue;
    }
    placeLabel(g.el, player, { lift: 30 + k * 46 + (gains.length - 1 - i) * 22 });
    g.el.style.opacity = k < 0.7 ? 1 : (1 - k) / 0.3;
  }
}

// Chờ máy chủ trả hồ sơ theo mã yêu cầu
let profileReq = 0;
const profileWaiters = new Map();
function requestProfile(id) {
  return new Promise((resolve) => {
    const req = ++profileReq;
    profileWaiters.set(req, resolve);
    net.send({ t: 'profile', id, req });
    setTimeout(() => profileWaiters.delete(req) && resolve(undefined), 5000);
  });
}
const fmtDate = (t) => new Date(t).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const fmtTime = (t) => new Date(t).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
function renderProfile(name, p, note) {
  $('#pf-avatar').textContent = (name || '?').trim().charAt(0).toUpperCase();
  $('#pf-name').textContent = name;
  $('#pf-since').textContent = p ? `Phật tử từ ${fmtDate(p.created)} · ${p.visits} ngày đến chùa` : '';
  const body = $('#pf-body');
  body.innerHTML = '';
  if (!p) {
    body.append(el('p', 'pf-note', note));
    return;
  }
  const scores = el('div', 'pf-scores');
  const score = p.phuoc - p.nghiep;
  const box = el('div', 'pf-score ' + (score < 0 ? 'nghiep' : 'phuoc'));
  box.append(el('b', null, score.toLocaleString('vi-VN')), el('span', null, 'Điểm phước nghiệp'));
  scores.append(box);
  const s = p.stats;
  const stats = el('div', 'pf-stats');
  for (const [label, val] of [
    ['Lạy Phật', s.bow], ['Chào bạn đạo', s.greet], ['Nén nhang', s.incense],
    ['Góp công đức', s.merit], ['Chuỗi 108 hạt', s.beads], ['Phút tụng kinh', s.chantMin ?? (s.chant || 0) * 10],
    ['Lá đã quét', s.leaves], ['Tượng La Hán đã lau', s.wipe || 0], ['Thỉnh chuông, trống', s.bell], ['Lần vào chùa', p.visits],
  ]) {
    const d = el('div', null, label);
    d.prepend(el('b', null, (val || 0).toLocaleString('vi-VN')));
    stats.append(d);
  }
  const hist = el('div', 'pf-history');
  hist.append(el('h3', null, 'Lịch sử phước / nghiệp'));
  const ul = el('ul');
  if (!p.history.length) ul.append(el('li', 'empty', 'Chưa có — mọi người mới vào đều bắt đầu từ 0 điểm'));
  for (const h of p.history) {
    const li = el('li');
    li.append(el('span', null, h.label), el('small', null, fmtTime(h.at)), el('em', h.nghiep ? 'bad' : null, h.phuoc ? `+${h.phuoc} phước` : `+${h.nghiep} nghiệp`));
    ul.append(li);
  }
  hist.append(ul);
  const rules = el('details', 'pf-rules');
  rules.append(el('summary', null, 'Cách tính điểm'));
  const rl = el('ul');
  for (const r of Object.values(RULES)) rl.append(el('li', null, `${r.label}: +${r.phuoc || r.nghiep} ${r.phuoc ? 'phước' : 'nghiệp'} (tối đa ${r.cap} lần/ngày)`));
  const fest = festivalOf(Date.now());
  rl.append(el('li', null, `Ngày mùng một và ngày Rằm (âm lịch): điểm phước ×${FESTIVAL_PHUOC}, điểm nghiệp và giới hạn mỗi ngày giữ nguyên${fest ? ` — hôm nay là ${fest.name}` : ''}`));
  rules.append(rl);
  body.append(scores, stats, hist, rules);
}
async function openProfile(a) {
  renderProfile(a.name, null, 'Đang mở hồ sơ…');
  openModal('#modal-profile');
  if (isBot(a)) {
    renderProfile(a.name, null, 'Đây là khách mô phỏng nên chưa có hồ sơ Phật tử.');
    return;
  }
  if (!net) {
    if (a === player) renderProfile(myName, publicProfile(localProfile));
    return;
  }
  const p = await requestProfile(a === player ? 'me' : a.id.slice(1));
  if ($('#modal-profile').hidden) return;
  if (p) renderProfile(p.name, p);
  else renderProfile(a.name, null, p === null ? 'Chưa có hồ sơ.' : 'Không tải được hồ sơ, bạn thử lại nhé.');
}
player.labelEl.addEventListener('click', () => openProfile(player));
function renderMyLabel() {
  player.labelEl.innerHTML = '<i>Tôi</i>';
  player.labelEl.append(myName);
}
function setMyName(v) {
  myName = v;
  player.name = v;
  store.set('name', v);
  renderMyLabel();
  net?.send({ t: 'name', name: v });
}

// ---------- Thắp nhang: trong điện thì ở lư hương trước bàn thờ, ngoài sân thì ở lư hương đá trước đỉnh đồng ----------
// Nơi thắp theo chỗ đang đứng: nền của điện nào thì điện đó, còn lại (bờ hồ, sân lớn, vườn kinh) là đỉnh đồng
function placeOf(a) {
  for (const T of TERRACES) if (a.pos.z <= T.front && a.pos.z > T.back && Math.abs(a.pos.x) <= T.halfX) return T.key;
  return 'dinh';
}
const burnerOf = (place) => world.burners[place] ?? world.burners.dinh;
const PLACE_TITLE = {
  quanam: 'Thắp nhang trong điện Quan Âm',
  phapchu: 'Thắp nhang dâng Phật trong điện Pháp Chủ',
  tamthe: 'Thắp nhang dâng Tam Thế Phật',
  dinh: 'Thắp nhang trước đỉnh đồng giữa sân',
};
const PLACE_TEXT = {
  quanam: 'Bạn sẽ bước tới trước bàn thờ Quan Âm Bồ Tát trong điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
  phapchu: 'Bạn sẽ bước tới lư hương trước bàn thờ điện Pháp Chủ, chắp tay vái lạy đức Phật rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
  tamthe: 'Bạn sẽ bước tới lư hương giữa điện Tam Thế, chắp tay vái lạy ba đức Phật rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
  dinh: 'Bạn sẽ bước tới lư hương đá trước đỉnh đồng giữa sân lớn, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
};
const PLACE_DONE = { quanam: ' dâng Quan Âm Bồ Tát', phapchu: ' dâng Phật', tamthe: ' dâng Tam Thế Phật', dinh: '' };
// Chọn chỗ đứng ít người nhất
function leastCrowded(list, except) {
  const crowd = (s) => {
    let n = 0;
    for (const o of avatars.values()) {
      const p = o.goal ?? o.pos;
      if (o !== except && Math.hypot(p.x - s.x, p.z - s.z) < 0.5) n++;
    }
    return n;
  };
  const spots = [...list].sort(() => Math.random() - 0.5);
  return spots.reduce((b, s) => (crowd(s) < crowd(b) ? s : b));
}
// Cầm nhang, vái lạy, rồi cắm vào lư hương
function offerIncense(a, n, onDone, place = placeOf(a)) {
  const burner = burnerOf(place);
  a.busy = true;
  a.holdIncense(n);
  a.act('bow', Math.atan2(burner.target.x - a.pos.x, burner.target.z - a.pos.z));
  if (a !== player) bubble(a, 'thắp nhang', 3600);
  setTimeout(() => {
    a.busy = false;
    if (!avatars.has(a.id)) return;
    a.holdIncense(0);
    burner.add(n, { mine: a === player });
    onDone?.();
  }, 3300);
}
const incBtn = $('[data-act=incense]');
let ritual = null;
let incN = 3;
function incenseStats() {
  const today = new Date().toISOString().slice(0, 10);
  const st = store.get('incense', {});
  return st.date === today ? st : { date: today, today: 0, total: st.total || 0 };
}
function busyMsg() {
  if (ride) return 'Bạn đang ngồi thuyền — thuyền về bến sẽ lên bờ';
  return null;
}
function openIncenseDialog() {
  if (ritual) return;
  const b = busyMsg();
  if (b) return toast(b, 2600);
  const st = incenseStats();
  $('#inc-stats').textContent = st.today ? `Hôm nay bạn đã thắp ${st.today} nén nhang.` : '';
  const place = placeOf(player);
  $('#inc-title').textContent = PLACE_TITLE[place];
  $('#modal-incense .muted').textContent = PLACE_TEXT[place];
  openModal('#modal-incense');
}
$('#inc-count').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  incN = +b.dataset.n;
  $('#inc-count').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
});
$('#inc-go').addEventListener('click', () => {
  closeModal($('#modal-incense'));
  const wishEl = $('#inc-wish');
  const wish = wishEl.value.trim(); // lời nguyện chỉ ở máy người dùng, không gửi đi
  wishEl.value = '';
  const place = placeOf(player);
  const spot = leastCrowded(burnerOf(place).spots, player);
  movePlayerTo(spot.x, spot.z);
  ritual = { n: incN, wish, spot, place, started: false };
  incBtn.disabled = true;
});
// mỗi khung hình: tới nơi thì bắt đầu nghi thức; đi chỗ khác thì hủy
const goalOf = (a) => a.routeTo ?? a.goal;
function incenseRitual() {
  if (!ritual || ritual.started) return;
  const g = goalOf(player);
  if (g && Math.hypot(g.x - ritual.spot.x, g.z - ritual.spot.z) > 0.05) {
    ritual = null;
    incBtn.disabled = false;
    toast('Đã hủy thắp nhang');
    return;
  }
  if (player.moving || player.routeTo) return;
  ritual.started = true;
  const { n, wish, place } = ritual;
  sound.incense();
  net?.send({ t: 'act', a: 'incense', n, place });
  offerIncense(player, n, () => {
    earn('incense', { n });
    ritual = null;
    incBtn.disabled = false;
    const st = incenseStats();
    st.today += n;
    st.total += n;
    store.set('incense', st);
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang${PLACE_DONE[place]}`, 4200);
  }, place);
}

// ---------- Thùng công đức (tượng trưng, mỗi người 3 lần/ngày; sổ công đức chung với khu Am Mây) ----------
const MERIT_PER_DAY = 3;
const meritBoard = { total: 0, recent: [] };
let meritRun = null;
function meritStats() {
  const st = store.get('merit', {});
  return st.date === vnDate() ? st : { date: vnDate(), used: 0, total: st.total || 0 };
}
function setMeritUsed(used) {
  const st = meritStats();
  if (used > st.used) st.total = (st.total || 0) + (used - st.used);
  st.used = Math.min(MERIT_PER_DAY, used);
  store.set('merit', st);
}
// thùng gần nhất: trong điện nào thì thùng điện đó, ngoài sân thì thùng cạnh đỉnh đồng
const meritOf = (a) => world.merits.find((m) => m.place === placeOf(a)) ?? world.merits[world.merits.length - 1];
function renderMerit() {
  const used = meritStats().used, left = MERIT_PER_DAY - used;
  $('#merit-total').textContent = meritBoard.total.toLocaleString('vi-VN');
  $('#merit-left').textContent = left > 0 ? `Còn ${left} lần` : 'Đã góp đủ — hẹn bạn ngày mai';
  $('#merit-dots').querySelectorAll('i').forEach((d, k) => d.classList.toggle('used', k < used));
  const go = $('#merit-go');
  go.disabled = left <= 0;
  go.textContent = left > 0 ? 'Góp công đức' : 'Hôm nay bạn đã góp đủ 3 lần';
  const ul = $('#merit-recent');
  ul.innerHTML = '';
  if (!meritBoard.recent.length) ul.append(el('li', 'empty', 'Chưa có ai góp hôm nay'));
  for (const r of meritBoard.recent.slice(0, 8)) {
    const li = el('li');
    li.append(el('span', null, r.name || 'Một người ẩn danh'), el('small', null, new Date(r.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })));
    ul.append(li);
  }
}
async function openMeritDialog() {
  if (meritRun) return toast('Bạn đang đi tới thùng công đức…');
  const b = busyMsg();
  if (b) return toast(b, 2600);
  renderMerit();
  openModal('#modal-merit');
  if (net) {
    const m = await fetchMerit();
    if (m) {
      Object.assign(meritBoard, { total: m.total, recent: m.recent });
      renderMerit();
    }
  }
}
$('#merit-go').addEventListener('click', () => {
  if (meritStats().used >= MERIT_PER_DAY) return;
  closeModal($('#modal-merit'));
  const dedicEl = $('#merit-dedic');
  const dedic = dedicEl.value.trim(); // lời hồi hướng chỉ ở máy người dùng
  dedicEl.value = '';
  const box = meritOf(player);
  const spot = leastCrowded(box.spots, player);
  movePlayerTo(spot.x, spot.z);
  meritRun = { spot, box, anon: $('#merit-anon').checked, dedic, started: false };
});
// Cầm phong bì, chắp tay, phong bì bay vào khe thùng
function offerMerit(a, onDone, box = meritOf(a)) {
  a.busy = true;
  a.holdEnvelope(true);
  const c = box.center;
  a.act('gassho', Math.atan2(c.x - a.pos.x, c.z - a.pos.z));
  if (a !== player) bubble(a, 'góp công đức', 3000);
  setTimeout(() => {
    if (!avatars.has(a.id)) return;
    box.drop(a.envelope.getWorldPosition(new THREE.Vector3()));
    a.holdEnvelope(false);
    setTimeout(() => {
      a.busy = false;
      if (a === player || a.pos.distanceTo(player.pos) < 9) sound.merit();
      onDone?.();
    }, 750);
  }, 1300);
}
function meritRitual() {
  if (!meritRun || meritRun.started) return;
  const g = goalOf(player);
  if (g && Math.hypot(g.x - meritRun.spot.x, g.z - meritRun.spot.z) > 0.05) {
    meritRun = null;
    toast('Đã hủy góp công đức');
    return;
  }
  if (player.moving || player.routeTo) return;
  meritRun.started = true;
  const { anon, dedic, box } = meritRun;
  offerMerit(player, () => {
    meritRun = null;
    const used = meritStats().used + 1;
    setMeritUsed(used);
    if (net) net.send({ t: 'merit', anon });
    else {
      earn('merit');
      meritBoard.total++;
      meritBoard.recent.unshift({ name: anon ? null : myName, at: Date.now() });
      meritBoard.recent.length = Math.min(meritBoard.recent.length, 12);
    }
    renderMerit();
    const left = MERIT_PER_DAY - used;
    toast(dedic ? `Nguyện hồi hướng: ${dedic}` : 'Công đức của bạn đã được ghi vào sổ', 4000);
    setTimeout(() => {
      toast(left > 0 ? `Hôm nay bạn còn ${left} lần góp công đức` : 'Bạn đã góp đủ 3 lần hôm nay. Hẹn bạn ngày mai.', 3600);
    }, 4200);
  }, box);
}

// ---------- Tràng hạt ----------
const beads = new Beads($('#beads'), { sound, store, onClose: () => {} });
beads.onRound = () => earn('beads');

// ---------- Nghe tụng kinh: chữ chạy theo lời tụng; mỗi phút đang phát được ghi vào hồ sơ ----------
const chantBtn = $('#btn-chant');
const caption = $('#chant-caption');
caption.innerHTML = CHANT_SYLLABLES.map((s) => `<span data-text="${s}">${s}</span>`).join('');
const capSpans = [...caption.querySelectorAll('span')];
function updateCaption() {
  if (caption.hidden) return;
  const pos = sound.karaoke();
  capSpans.forEach((s, k) => {
    const p = !pos ? 0 : pos.all ? 1 : k < pos.i ? 1 : k === pos.i ? pos.k : 0;
    s.style.setProperty('--p', p.toFixed(3));
    s.classList.toggle('on', !!pos && !pos.all && k === pos.i);
  });
}
const syncMute = () => muteBtn.classList.toggle('muted', settings.muted);
chantBtn.addEventListener('click', () => {
  const on = chantBtn.getAttribute('aria-pressed') !== 'true';
  sound.init();
  sound.setChant(on);
  if (on && settings.muted) {
    settings.muted = false;
    sound.apply();
    syncMute();
    saveSettings();
  }
  chantBtn.setAttribute('aria-pressed', on);
  chantBtn.querySelector('.txt').textContent = on ? 'Dừng tụng kinh' : 'Nghe tụng kinh';
  caption.hidden = !on;
  hideHint();
});
const chanting = () => chantBtn.getAttribute('aria-pressed') === 'true';
let chantSec = 0, chantTick = Date.now();
setInterval(() => {
  const now = Date.now();
  if (sound.chanting && sound.ctx?.state === 'running' && !settings.muted) chantSec += Math.min(60, (now - chantTick) / 1000);
  chantTick = now;
  if (chantSec >= 60) {
    chantSec -= 60;
    earn('chant');
  }
}, 10000);

// ---------- Chụp ảnh ----------
$('#btn-shot').addEventListener('click', () => {
  renderer.render(scene, camera);
  canvas.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `am-may-tam-chuc-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
  const f = $('#flash');
  f.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
  toast('Đã lưu ảnh chụp');
});
$('#btn-info').addEventListener('click', () => openModal('#modal-info'));

// ---------- Cài đặt (như khu Am Mây; dùng chung cài đặt đã lưu) ----------
{
  const nameIn = $('#set-name');
  const bind = (sel, key, prop = 'checked') => {
    const e = $(sel);
    e[prop] = settings[key];
    e.addEventListener('input', () => {
      settings[key] = prop === 'checked' ? e.checked : parseFloat(e.value);
      sound.init();
      sound.apply();
      saveSettings();
    });
  };
  bind('#set-ambient', 'ambient');
  bind('#set-ambient-vol', 'ambientVol', 'value');
  bind('#set-chant-vol', 'chantVol', 'value');
  bind('#set-fx', 'fx');
  bind('#set-fx-vol', 'fxVol', 'value');
  bind('#set-bg', 'bg');
  bind('#set-names', 'showNames');
  const seg = $('#set-quality');
  const syncQ = () => seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.q === settings.quality));
  syncQ();
  seg.addEventListener('click', (e) => {
    const q = e.target.closest('button')?.dataset.q;
    if (!q || q === settings.quality) return;
    settings.quality = q;
    syncQ();
    saveSettings();
    // khu Tam Chúc dựng cảnh theo mức đồ họa lúc mở trang: tải lại để đổi
    toast('Đang tải lại trang để đổi đồ họa…', 2000);
    setTimeout(() => location.reload(), 600);
  });
  const voiceSel = $('#set-chant-voice');
  const voiceStatus = $('#voice-status');
  const renderVoices = () => {
    const opts = [['auto', 'Tự động (tốt nhất có sẵn)']];
    if (sound.hasRecording) opts.push(['record', 'Bản ghi âm tụng kinh']);
    for (const v of vietnameseVoices()) opts.push([`tts:${v.name}`, `Giọng đọc: ${v.name.replace(/^Microsoft |\s*\(.*\)$/g, '')}`]);
    opts.push(['synth', 'Giọng ngân tổng hợp']);
    voiceSel.innerHTML = '';
    for (const [value, label] of opts) voiceSel.append(new Option(label, value));
    voiceSel.value = opts.some(([v]) => v === settings.chantVoice) ? settings.chantVoice : 'auto';
    voiceStatus.textContent = sound.chantModeLabel();
  };
  sound.onVoices = renderVoices;
  sound.recordingChecked?.then(renderVoices);
  voiceSel.addEventListener('change', () => {
    settings.chantVoice = voiceSel.value;
    saveSettings();
    voiceStatus.textContent = sound.chantModeLabel();
    if (chanting()) sound.setChant(true);
  });
  const langSel = $('#set-lang');
  for (const [k, name] of Object.entries(LANGS)) langSel.append(new Option(name, k));
  langSel.value = lang;
  langSel.addEventListener('change', () => setLang(langSel.value));
  $('#btn-my-profile').addEventListener('click', () => {
    closeModal($('#modal-settings'));
    openProfile(player);
  });
  $('#btn-settings').addEventListener('click', () => {
    nameIn.value = myName;
    renderVoices();
    openModal('#modal-settings');
  });
  nameIn.addEventListener('change', () => {
    const v = nameIn.value.trim().slice(0, 20);
    if (!v || v === myName) return;
    setMyName(v);
    toast(`Pháp danh của bạn: ${v}`);
  });
}
document.addEventListener('visibilitychange', () => sound.setHidden?.(document.hidden));

// ---------- Chat ----------
const chatInput = $('#chat-input');
let lastChat = 0;
if (isCoarse) chatInput.placeholder = 'Nhắn gì đó…';
$('#chat').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!text) return chatInput.blur();
  if (performance.now() - lastChat < 1200) return toast('Bạn chat nhanh quá, chờ một chút nhé', 1500);
  lastChat = performance.now();
  chatInput.value = '';
  chatInput.blur();
  chatBubble(player, text);
  net?.send({ t: 'chat', text });
});
chatInput.addEventListener('keydown', (e) => e.key === 'Escape' && chatInput.blur());

// ---------- Camera, chạm, kéo, phóng to ----------
const cam = { yaw: 0, pitch: 0.32, dist: 10, curDist: 18, curPitch: 0.6, target: new THREE.Vector3(SPAWN.x, LAND + 1.1, SPAWN.z) };
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const pointers = new Map();
let dragDist = 0, pinch = null;
function setRay(x, y) {
  ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function pickAvatar() {
  let best = null, bestD = Infinity;
  const c = new THREE.Vector3();
  for (const a of avatars.values()) {
    if (a === player) continue;
    c.set(a.root.position.x, a.root.position.y + 0.85, a.root.position.z);
    const along = c.clone().sub(ray.ray.origin).dot(ray.ray.direction);
    if (ray.ray.distanceToPoint(c) < 0.5 && along > 0 && along < bestD) {
      best = a;
      bestD = along;
    }
  }
  return best;
}
function handleTap(x, y) {
  sound.init();
  setRay(x, y);
  const who = pickAvatar();
  if (who) return doGassho(who);
  const boatHit = ray.intersectObjects(world.boats, true)[0];
  if (boatHit) return goBoard();
  const pillarHit = ray.intersectObjects(world.pillars, false)[0];
  if (pillarHit) return goRead(pillarHit.object.userData.index);
  if (ray.intersectObjects(world.merits.map((m) => m.group), true)[0]) return openMeritDialog();
  const hit = ray.intersectObjects(world.pickables, false)[0];
  if (hit) movePlayerTo(hit.point.x, hit.point.z);
}
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  // nhìn toàn cảnh: chuột phải (hoặc giữ Shift) kéo để xoay, kéo thường để dời góc nhìn
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, rotate: e.button === 2 || e.shiftKey });
  if (pointers.size === 1) dragDist = 0;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: cam.dist };
    dragDist = 999;
  }
  chatInput.blur();
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX;
  p.y = e.clientY;
  if (pointers.size === 1) {
    dragDist += Math.abs(dx) + Math.abs(dy);
    if (dragDist > 6) {
      if (ov.on && !p.rotate) {
        panOverview(dx, dy);
      } else if (ov.on) {
        cam.yaw -= dx * 0.005;
        cam.pitch = clamp(cam.pitch + dy * 0.004, OV.pitchMin, OV.pitchMax);
      } else {
        cam.yaw -= dx * 0.0055;
        cam.pitch = clamp(cam.pitch + dy * 0.004, 0.04, 1.2);
      }
      hideHint();
    }
  } else if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const nd = (pinch.dist * pinch.d) / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1);
    cam.dist = ov.on ? clamp(nd, OV.distMin, OV.distMax) : clamp(nd, 3, 40);
  }
});
const endPointer = (e) => {
  if (!pointers.has(e.pointerId)) return;
  if (pointers.size === 1 && dragDist <= 6 && e.type === 'pointerup') handleTap(e.clientX, e.clientY);
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const k = 1 + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.0012;
  cam.dist = ov.on ? clamp(cam.dist * k, OV.distMin, OV.distMax) : clamp(cam.dist * k, 3, 40);
}, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// ---------- Nhìn toàn cảnh khu Tam Chúc từ trên cao (như khu Am Mây) ----------
// Camera bay lên cao nhìn cả hồ, sân lớn, vườn kinh và ba điện trên sườn núi; chạm xuống đất vẫn điều khiển nhân vật đi tới đó.
const OV = { distMin: 35, distMax: 320, pitchMin: 0.45, pitchMax: 1.45, bounds: { x0: -125, x1: 85, z0: -180, z1: 80 } };
const ov = { on: false, focus: new THREE.Vector3(), saved: null };
const ovMarker = new THREE.Group();
{
  const gold = new THREE.MeshBasicMaterial({ color: '#f2c04a' });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 16).rotateX(Math.PI), gold);
  cone.position.y = 0.9;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.18, 8, 32).rotateX(Math.PI / 2), gold);
  ring.position.y = -2.6;
  ovMarker.add(cone, ring);
  ovMarker.visible = false;
  scene.add(ovMarker);
}
const FOG = { near: scene.fog.near, far: scene.fog.far };
function panOverview(dx, dy) {
  // kéo theo ngón tay: cảnh trôi cùng chiều kéo
  const s = cam.curDist * 0.0016;
  const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw); // sang phải trên màn hình
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw); // hướng camera nhìn tới
  const b = OV.bounds;
  ov.focus.x = clamp(ov.focus.x - rx * dx * s + fx * dy * s, b.x0, b.x1);
  ov.focus.z = clamp(ov.focus.z - rz * dx * s + fz * dy * s, b.z0, b.z1);
}
function setOverview(on) {
  if (ov.on === on) return;
  ov.on = on;
  $('#btn-overview').classList.toggle('on', on);
  $('#btn-overview').setAttribute('aria-pressed', on);
  ovMarker.visible = on;
  // từ trên cao không thấy rõ bóng người đi lại: giữ nguyên bóng đổ, khỏi tính lại mỗi khung hình
  renderer.shadowMap.autoUpdate = !on;
  renderer.shadowMap.needsUpdate = true;
  // sương mù nhẹ đi khi nhìn từ trên cao, để thấy rõ cả khu
  scene.fog.near = on ? 300 : FOG.near;
  scene.fog.far = on ? 1000 : FOG.far;
  if (on) {
    ov.saved = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
    // nhìn từ phía hồ vào sườn núi, tâm giữa sân lớn và chỗ mình đứng
    ov.focus.set(clamp(player.pos.x * 0.4, -60, 40), LAND, clamp(player.pos.z * 0.4 - 30, -120, 40));
    cam.yaw = 0;
    cam.pitch = 0.95;
    cam.dist = 190;
    showHint(isCoarse ? 'Toàn cảnh chùa · kéo để dời · chụm hai ngón để phóng to · chạm đất để đi tới' : 'Toàn cảnh chùa · kéo để dời · chuột phải kéo để xoay · lăn chuột để phóng to · nhấp đất để đi tới · V để trở lại', 7000);
  } else {
    Object.assign(cam, ov.saved);
    showHint(baseHint, 4000);
  }
}
$('#btn-overview').addEventListener('click', () => setOverview(!ov.on));
// mũi tên vàng chỉ chỗ mình đứng; trong điện hay dưới cổng Tam Quan thì nổi lên trên mái cho khỏi bị che
function ovMarkerLift() {
  const { x, z } = player.pos;
  for (const T of TERRACES) if (Math.abs(x) < T.hall.hx + 1 && z < T.hall.front + 1 && z > T.hall.back - 1) return 12;
  if (Math.abs(x) < 12 && z > GATE.z - 4 && z < GATE.z + 4) return 12;
  return 4.6;
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select') || document.querySelector('.modal.show') || beads.isOpen) return;
  const k = e.key.toLowerCase();
  if (k === 'enter') {
    e.preventDefault();
    chatInput.focus();
    return;
  }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
    keys.add(k);
    e.preventDefault();
    sound.init();
    hideHint();
  }
  if (k === 'v') setOverview(!ov.on);
  if (k === 'escape' && ov.on) setOverview(false);
  if (k === 'g') doGassho(nearestPerson(6));
  if (k === 'b') doBow();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
let keySendT = 0;
function keyMove(t) {
  if (!keys.size || ride) return;
  pendingBoard = false;
  let f = 0, s = 0;
  if (keys.has('w') || keys.has('arrowup')) f += 1;
  if (keys.has('s') || keys.has('arrowdown')) f -= 1;
  if (keys.has('a') || keys.has('arrowleft')) s -= 1;
  if (keys.has('d') || keys.has('arrowright')) s += 1;
  if (!f && !s) return;
  const len = Math.hypot(f, s);
  const nx = player.pos.x + ((-Math.sin(cam.yaw) * f + Math.cos(cam.yaw) * s) / len) * 0.7;
  const nz = player.pos.z + ((-Math.cos(cam.yaw) * f - Math.sin(cam.yaw) * s) / len) * 0.7;
  player.route = null;
  player.routeTo = null;
  player.walkTo(...clampWalk(nx, nz));
  if (t - keySendT > 0.25) {
    keySendT = t;
    sendMove();
  }
}

function updateCamera(dt) {
  if (ov.on) {
    cam.target.lerp(ov.focus, 1 - Math.exp(-4 * dt));
    cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-3 * dt));
    cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-3 * dt));
    const cp = Math.cos(cam.curPitch);
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist,
      Math.max(groundY(cam.target.x, cam.target.z) + 3, cam.target.y + Math.sin(cam.curPitch) * cam.curDist),
      cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist,
    );
    camera.lookAt(cam.target);
    ovMarker.position.set(player.root.position.x, player.root.position.y + ovMarkerLift() + Math.sin(performance.now() / 300) * 0.4, player.root.position.z);
    ovMarker.scale.setScalar(clamp(cam.curDist / 70, 0.6, 3));
    return;
  }
  const want = new THREE.Vector3(player.root.position.x, player.root.position.y + 1.1, player.root.position.z);
  cam.target.lerp(want, 1 - Math.exp(-6 * dt));
  cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  const cp = Math.cos(cam.curPitch);
  camera.position.set(
    cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist,
    Math.max(groundY(cam.target.x, cam.target.z) + 0.5, cam.target.y + Math.sin(cam.curPitch) * cam.curDist),
    cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist,
  );
  camera.lookAt(cam.target);
}

// ---------- Nhãn trên đầu ----------
const v3 = new THREE.Vector3();
function placeLabel(el, a, { lift = 0, fade = false } = {}) {
  a.labelAnchor(v3);
  v3.y += 0.15;
  const dist = camera.position.distanceTo(v3);
  const s = fade ? clamp(9 / dist, 0.6, 1) : 1;
  const op = fade ? clamp((27 - dist) / 8, 0, 1) : 1;
  v3.project(camera);
  const x = (v3.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v3.y * 0.5 + 0.5) * window.innerHeight - lift * s;
  el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%) scale(${s.toFixed(3)})`;
  el.style.opacity = op;
  el.style.visibility = v3.z > 1 || op === 0 ? 'hidden' : 'visible';
}
function updateLabels(now) {
  placeLabel(player.labelEl, player);
  for (const a of avatars.values()) {
    let lift = a === player || settings.showNames ? 26 : 0;
    if (a !== player) {
      a.nameEl.hidden = !settings.showNames;
      if (settings.showNames) placeLabel(a.nameEl, a, { fade: true });
      if (a.bubbleEl) {
        if (now > a.bubbleUntil) a.bubbleEl.classList.add('hidden');
        placeLabel(a.bubbleEl, a, { lift, fade: true });
        if (now <= a.bubbleUntil) lift += 28;
      }
    }
    if (a.chatEl) {
      if (now > a.chatUntil) a.chatEl.classList.add('hidden');
      else placeLabel(a.chatEl, a, { lift: lift + 4, fade: a !== player });
    }
  }
}

// ---------- Mạng: người khác cùng phòng ----------
let onlineCount = 1;
const updateCount = () => ($('#people').textContent = onlineCount);
function addRemote(p) {
  if (avatars.has('n' + p.id)) return;
  const a = addAvatar(new Avatar({ id: 'n' + p.id, name: p.name, robe: p.robe }));
  a.setSandals(SANDAL_COLORS[(p.sandals ?? +p.id) % SANDAL_COLORS.length]);
  a.wearSandals(true);
  // người mới vào chưa kịp gửi chỗ đứng: đứng ở bờ hồ
  const [x, z] = p.z === 16 && p.x === 0 ? [SPAWN.x + rnd(-3, 3), SPAWN.z] : clampWalk(p.x, p.z);
  a.placeAt(x, z, SPAWN.ry);
  if (p.seat >= BOAT_SEAT && p.seat < BOAT_SEAT + BOATS) attachBoat(a, p.seat - BOAT_SEAT);
}
function wireNet(n) {
  n.on('join', (m) => {
    addRemote(m.p);
    bubble(avatars.get('n' + m.p.id), 'vừa đến chùa', 4000);
  });
  n.on('leave', (m) => removeAvatar('n' + m.id));
  n.on('move', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a) return;
    const [x, z] = clampWalk(m.x, m.z);
    if (m.seat >= BOAT_SEAT && m.seat < BOAT_SEAT + BOATS) {
      if (a.onBoat !== m.seat - BOAT_SEAT) {
        attachBoat(a, m.seat - BOAT_SEAT);
        bubble(a, 'đi thuyền ngắm hồ', 3000);
      }
      return;
    }
    if (a.onBoat != null) detachBoat(a, BOARD.x - 0.4, BOARD.z - 0.6);
    if (m.w) a.placeAt(x, z, a.ry);
    else walkRoute(a, x, z);
  });
  n.on('act', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a) return;
    if (m.a === 'gassho') {
      const toMe = m.to === n.welcome.id;
      a.act('gassho', toMe ? faceRy(a, player) : null);
      bubble(a, 'chắp tay');
      if (toMe) toast(`${a.name} chắp tay chào bạn`);
    } else if (m.a === 'bow') {
      a.act('bow', Math.PI);
      bubble(a, 'lạy Phật');
    } else if (m.a === 'incense') {
      offerIncense(a, m.n === 3 ? 3 : 1, null, world.burners[m.place] ? m.place : placeOf(a));
    }
  });
  n.on('chat', (m) => {
    const a = avatars.get('n' + m.id);
    if (a) chatBubble(a, m.text);
  });
  n.on('name', (m) => {
    const a = avatars.get('n' + m.id);
    if (a) a.nameEl.textContent = a.name = m.name;
  });
  n.on('karma', (m) => showGain(m.entry));
  n.on('profile', (m) => {
    const resolve = profileWaiters.get(m.req);
    if (!resolve) return;
    profileWaiters.delete(m.req);
    resolve(m.profile);
  });
  n.on('merit', (m) => {
    Object.assign(meritBoard, { total: m.total, recent: m.recent });
    renderMerit();
    const a = avatars.get('n' + m.id);
    if (a) offerMerit(a);
  });
  n.on('merit-ok', (m) => {
    Object.assign(meritBoard, { total: m.total, recent: m.recent });
    setMeritUsed(m.used);
    renderMerit();
  });
  n.on('merit-denied', (m) => {
    setMeritUsed(m.used);
    renderMerit();
    toast('Hôm nay bạn đã góp đủ 3 lần công đức. Hẹn bạn ngày mai.');
  });
  n.on('count', (m) => {
    onlineCount = m.n;
    updateCount();
    syncBots();
  });
  n.on('close', () => {
    if (net !== n) return;
    net = null;
    toast('Mất kết nối, đang kết nối lại…');
    setTimeout(join, 3000);
  });
}
async function join() {
  const n = await connect({ room: roomId, name: myName, robe: myRobe, sandals: mySandals, uid: myUid });
  if (!n) {
    toast('Đang chạy ngoại tuyến — chưa kết nối được máy chủ', 4000);
    earn('visit'); // ngoại tuyến: tự ghi lượt vào chùa (trực tuyến thì máy chủ ghi)
    syncBots();
    return;
  }
  for (const id of [...avatars.keys()]) if (id !== 'me' && !id.startsWith('bot')) removeAvatar(id);
  net = n;
  wireNet(n);
  n.welcome.peers.forEach(addRemote);
  if (n.welcome.merit) {
    const { total, recent, used } = n.welcome.merit;
    Object.assign(meritBoard, { total, recent });
    setMeritUsed(used);
  }
  onlineCount = n.welcome.peers.length + 1;
  updateCount();
  sendMove();
  syncBots();
}

// ---------- Chọn phòng / khu, tắt tiếng ----------
$('#btn-room').addEventListener('click', async () => {
  const list = $('#room-list');
  const render = (counts) => {
    list.innerHTML = '';
    let lastSite = null;
    for (const r of [...MY_ROOMS, ...ROOMS.filter((x) => x.site !== 'tamchuc')]) {
      if (r.site !== lastSite) {
        lastSite = r.site;
        const h = document.createElement('p');
        h.className = 'site-head';
        h.textContent = `${r.site === 'tamchuc' || r.site === 'ammay' ? 'Khu ' : ''}${SITES[r.site].name} — ${SITES[r.site].desc}`;
        list.append(h);
      }
      const b = document.createElement('button');
      b.className = 'room' + (r.id === roomId ? ' current' : '');
      const c = counts?.find((x) => x.id === r.id)?.count;
      b.innerHTML = `<b></b><small>${r.id === roomId ? 'Bạn đang ở đây' : c != null ? `${c} người` : `Vào ${r.name}`}</small>`;
      b.querySelector('b').textContent = r.name;
      b.addEventListener('click', () => {
        closeModal($('#modal-room'));
        if (r.id !== roomId) location.href = roomUrl(r);
      });
      list.append(b);
    }
  };
  render(null);
  openModal('#modal-room');
  render(await fetchRooms());
});
const muteBtn = $('#btn-mute');
muteBtn.classList.toggle('muted', settings.muted);
muteBtn.addEventListener('click', () => {
  settings.muted = !settings.muted;
  muteBtn.classList.toggle('muted', settings.muted);
  store.set('settings', settings);
  sound.init();
  sound.apply();
});

// ---------- Vòng lặp ----------
const clock = new THREE.Clock();
let elapsed = 0, lodT = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  keyMove(elapsed);
  world.update(elapsed, dt);
  for (const a of avatars.values()) {
    const arrived = a.update(dt);
    if (arrived && a === player) sendMove();
  }
  boatsTick(dt);
  readTick();
  if (mapOpen) updateMap();
  if ((lodT -= dt) < 0) {
    lodT = 0.5;
    // nhìn toàn cảnh: tượng đều nằm dưới mái, ẩn hết cho nhẹ
    if (ov.on) world.updateLOD(Infinity, Infinity);
    else world.updateLOD(player.pos.x, player.pos.z);
  }
  if (!ov.on) world.setFocus(player.pos.x, player.pos.z); // nhìn toàn cảnh thì giữ nguyên vùng bóng đổ
  updateCamera(dt);
  renderer.render(scene, camera);
  incenseRitual();
  meritRitual();
  updateLabels(performance.now());
  updateGains(performance.now());
  updateCaption();
});
renderer.compile(scene, camera);
setTimeout(() => $('#loader').classList.add('done'), 400);
showHint('Chào mừng đến khu Tam Chúc · đi dạo bờ hồ, qua cổng Tam Quan vào sân lớn · ' + baseHint, 9000);
join();
