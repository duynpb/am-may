// Trang chung cho các chùa dựng kỹ (chua.html?site=…): Vĩnh Nghiêm, chùa Dơi, núi Bà Đen, Thích Ca Phật Đài.
// Mỗi chùa có một file cảnh riêng (SITE); phần đi lại, mạng nhiều người, chắp tay, lạy Phật, thắp nhang,
// công đức, tràng hạt, tụng kinh, bản đồ khu, nhìn toàn cảnh… dùng chung ở đây (cùng cách làm với khu Tam Chúc).
import { lang, LANGS, setLang } from '../i18n.js'; // nạp trước để tự dịch chữ trên trang
import * as THREE from 'three';
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

// ---------- Chọn chùa theo địa chỉ trang ----------
const LOAD = {
  vinhnghiem: () => import('./vinhnghiem.js'),
  chuadoi: () => import('./chuadoi.js'),
  baden: () => import('./baden.js'),
  phatdai: () => import('./phatdai.js'),
  // miền Trung
  thienmu: () => import('./thienmu.js'),
  linhungbb: () => import('./linhungbb.js'),
  longson: () => import('./longson.js'),
  truclamdl: () => import('./truclamdl.js'),
  // miền Bắc — núi thiêng
  baidinh: () => import('./baidinh.js'),
  yentu: () => import('./yentu.js'),
  bavang: () => import('./bavang.js'),
  taythien: () => import('./taythien.js'),
  // Hà Nội
  chuaha: () => import('./chuaha.js'),
  motcot: () => import('./motcot.js'),
  tranquoc: () => import('./tranquoc.js'),
  quansu: () => import('./quansu.js'),
};
let siteId = params.get('site');
{
  const r = ROOMS.find((x) => x.id === params.get('room'));
  if (r && !LOAD[r.site]) location.replace(roomUrl(r)); // phòng của khu Am Mây / Tam Chúc
  else if (r) siteId = r.site;
}
if (!LOAD[siteId]) siteId = 'vinhnghiem';
const { SITE } = await LOAD[siteId]();
const { groundY, WALK_AREAS, ROUND_OBSTACLES, SPAWN, LAND = 0 } = SITE;

// chữ trên trang theo chùa
document.title = `${SITE.name} — Am Mây`;
$('#loader h1').textContent = SITE.name;
$('#loader-text').textContent = SITE.loading;
$('#map-title').textContent = `Bản đồ ${SITE.name}`;
$('#info-title').textContent = `Giới thiệu ${SITE.name}`;
$('#info-text').textContent = SITE.info;
$('#scene').setAttribute('aria-label', `${SITE.name} 3D`);
{
  const ul = $('#info-tips');
  for (const [b, t] of SITE.tips || []) {
    const li = document.createElement('li');
    const bb = document.createElement('b');
    bb.textContent = b;
    li.append(bb, ' ' + t);
    ul.append(li);
  }
}

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

const MY_ROOMS = siteRooms(siteId);
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
const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 1600);
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

// tải cả phần chữ tiếng Việt của font trước khi vẽ biển
try { await document.fonts.load('700 40px "Noto Serif"', 'CHÙA ĐẠI HÙNG BẢO ĐIỆN ẤẦẨẪẬ ỀỂỄỆ ỐỒỔỖỘ ỚỜỞỠỢ ỨỪỬỮỰ ĂÂÊÔƠƯ'); } catch { /* dùng font dự phòng */ }
const world = SITE.build(renderer, { quality: settings.quality });
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
    a.nameEl.addEventListener('click', () => openProfile(a));
    labelsEl.append(a.nameEl);
  }
  return a;
}
function removeAvatar(id) {
  const a = avatars.get(id);
  if (!a) return;
  if (rides.has(a)) { // đang ngồi cáp treo thì dọn cabin
    scene.remove(rides.get(a).cab);
    rides.delete(a);
  }
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
const vnMap = createVnMap({ openModal, closeModal, here: SITE.mapId ?? siteId }); // mã chùa trên bản đồ Việt Nam
$('#btn-vn')?.addEventListener('click', () => {
  closeModal($('#modal-map'));
  vnMap.open();
});
$('#btn-vn-nav')?.addEventListener('click', () => vnMap.open());
const duyenDlg = createDuyenDialog({
  openModal,
  closeModal,
  onPray(w, mine) {
    sound.init();
    // chùa có cây duyên (vd chùa Hà): đi tới gốc cây, chắp tay, thắt dải lụa đỏ
    const D = world.duyen;
    if (D?.stand && !rides.has(player)) {
      if (!movePlayerTo(D.stand.x, D.stand.z)) teleport(D.stand);
      duyenRun = { w, mine, started: false };
      toast('Đi tới cây duyên…', 1800);
      return;
    }
    player.act('bow', bowRyAt(player));
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
let duyenRun = null; // { w, mine, started }
function duyenTick() {
  const R = duyenRun, D = world.duyen;
  if (!R || R.started || !D) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - D.stand.x, g.z - D.stand.z) > 0.2) {
    duyenRun = null; // đi chỗ khác: thôi
    return;
  }
  if (player.moving || player.routeTo) return;
  R.started = true;
  player.act('gassho', Math.atan2(D.head.x - player.pos.x, D.head.z - player.pos.z));
  net?.send({ t: 'act', a: 'gassho' });
  bubble(player, 'thắt dải lụa đỏ cầu duyên lành', 3200);
  setTimeout(() => {
    D.addRibbon();
    sound.bead();
    earn('duyen');
    duyenDlg.showCard(R.w, pick(R.w.msgs), R.mine);
    duyenRun = null;
  }, 2600);
}
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
// Hai vùng chồng lên nhau là đi qua lại được, trừ khi khác "tầng" (vd đỉnh núi chỉ lên bằng cáp treo)
const PORTALS = WALK_AREAS.map((a, i) => WALK_AREAS.map((b, j) => {
  if (i === j || (a.zone ?? 0) !== (b.zone ?? 0)) return null;
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
  if (depth > 3) return [];
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
// trả về null nếu không đi bộ tới được (khác tầng)
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
  if (prev[t] < 0) return null;
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
  const pts = routeTo(a.pos.x, a.pos.z, x, z);
  if (!pts) {
    // khác tầng: người khác (mạng) thì đặt thẳng tới nơi
    if (a !== player) a.placeAt(x, z, a.ry);
    return false;
  }
  a.routeTo = { x, z };
  for (const [px, pz] of pts) {
    await a.walk(px, pz);
    if (a.route !== token) return false;
  }
  a.routeTo = null;
  a.walkTo(x, z);
  return true;
}
let net = null;
function sendMove(w) {
  if (!net) return;
  const r = rides.get(player);
  if (r) return net.send({ t: 'move', x: +r.to.x.toFixed(2), z: +r.to.z.toFixed(2), seat: RIDE_SEAT + (r.dir === 'up' ? 0 : 1) });
  const g = player.routeTo ?? player.goal ?? player.pos;
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: null, w: w ? 1 : undefined });
}
const reachable = (x, z) => !!routeTo(player.pos.x, player.pos.z, x, z);
function movePlayerTo(x, z) {
  if (rides.has(player)) {
    toast('Bạn đang ngồi cáp treo — tới ga sẽ ra khỏi cabin', 2600);
    return false;
  }
  [x, z] = clampWalk(x, z);
  if (!reachable(x, z)) {
    toast(SITE.unreachable || 'Chỗ đó chưa đi bộ tới được', 2800);
    return false;
  }
  walkRoute(player, x, z);
  sendMove();
  hideHint();
  return true;
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
const bowRyAt = (a) => SITE.bowRy?.(a.pos.x, a.pos.z) ?? Math.PI;
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
function doBow() {
  sound.init();
  player.act('bow', bowRyAt(player));
  sound.bow();
  net?.send({ t: 'act', a: 'bow' });
  earn('bow');
}
document.querySelectorAll('.actions button').forEach((b) => b.addEventListener('click', () => {
  const act = b.dataset.act;
  if (act === 'gassho') {
    const near = nearestPerson(6);
    doGassho(near);
    if (!near) toast('Chưa có ai ở gần để chào — bạn lại gần một người nhé');
  } else if (act === 'bow') doBow();
  else if (act === 'go') useGoto();
  else if (act === 'incense') {
    sound.init();
    openIncenseDialog();
  } else if (act === 'merit') {
    sound.init();
    openMeritDialog();
  } else if (act === 'beads') {
    sound.init();
    beads.open();
  } else if (act === 'duyen') {
    sound.init();
    duyenDlg.open();
  }
}));

// ---------- Chỗ chuyển nhanh (vd cáp treo lên đỉnh núi): đứng gần thì hiện nút ----------
const GOTOS = SITE.GOTOS || [];
const goBtn = $('[data-act=go]');
let goNear = null, goUiT = 0, going = false;
function gotoTick(dt) {
  if ((goUiT -= dt) > 0) return;
  goUiT = 0.3;
  if (rides.has(player)) {
    goBtn.hidden = false;
    goBtn.querySelector('span').textContent = 'Tới ga ngay';
    return;
  }
  goNear = GOTOS.find((g) => Math.hypot(player.pos.x - g.x, player.pos.z - g.z) < g.r) || null;
  goBtn.hidden = !goNear || going;
  if (goNear) goBtn.querySelector('span').textContent = goNear.label;
}
async function useGoto(g = goNear) {
  if (rides.has(player)) return finishRide(player); // bấm "Tới ga ngay"
  if (!g || going) return;
  sound.init();
  if (g.ride && world.ride) return boardRide(g);
  going = true;
  goBtn.hidden = true;
  toast(g.msg || g.label, 2600);
  const fade = $('#flash');
  fade.classList.add('dark');
  await wait(g.ms || 1400);
  teleport(g.to);
  await wait(200);
  fade.classList.remove('dark');
  going = false;
  if (g.done) toast(g.done, 3600);
}
function teleport(p) {
  player.route = null;
  player.routeTo = null;
  player.placeAt(p.x, p.z, p.ry);
  cam.target.set(player.root.position.x, player.root.position.y + 1.1, player.root.position.z);
  cam.yaw = p.ry + Math.PI;
  net?.send({ t: 'move', x: p.x, z: p.z, seat: null, w: 1 });
}

// ---------- Cáp treo thật (world.ride): bước vào cabin, ngồi xuống, cabin chạy theo dây cáp tới ga bên kia ----------
// Người khác cùng phòng thấy mình ngồi trong cabin: báo chỗ ngồi RIDE_SEAT (đang lên) / RIDE_SEAT + 1 (đang về), toạ độ là ga tới.
const RIDE_SEAT = 70;
const rides = new Map(); // avatar → { cab, dir, t0, dur, to }
const rideV = new THREE.Vector3();
let rideCam = null;
function startRide(a, dir, to) {
  const R = world.ride;
  const cab = R.makeCabin();
  scene.add(cab);
  a.route = null;
  a.routeTo = null;
  a.goal = null;
  a.seat = 'cab'; // tư thế ngồi trên ghế băng
  rides.set(a, { cab, dir, t0: performance.now(), dur: R.duration * 1000, to });
  ridesTick();
}
function finishRide(a) {
  const r = rides.get(a);
  if (!r) return;
  rides.delete(a);
  scene.remove(r.cab);
  a.seat = null;
  a.placeAt(r.to.x, r.to.z, r.to.ry);
  if (a !== player) return;
  if (rideCam) Object.assign(cam, rideCam);
  rideCam = null;
  cam.target.set(player.root.position.x, player.root.position.y + 1.1, player.root.position.z);
  cam.yaw = r.to.ry + Math.PI;
  sendMove(true);
  if (r.g?.done) toast(r.g.done, 3600);
}
function boardRide(g) {
  closeModal($('#modal-map'));
  setOverview(false);
  pendingBell = null;
  startRide(player, g.ride, g.to);
  rides.get(player).g = g;
  rideCam = { dist: cam.dist, pitch: cam.pitch };
  cam.dist = 9;
  cam.pitch = 0.22;
  cam.yaw = world.ride.heading(0, g.ride) + Math.PI; // nhìn theo hướng cabin chạy
  sendMove();
  toast(g.msg || g.label, 4200);
  // chuyến dài thì nhắc thêm còn bao lâu; chuyến ngắn thì thôi
  if (world.ride.duration > 20) setTimeout(() => rides.has(player) && toast(`Cáp treo đang chạy, khoảng ${world.ride.duration} giây tới ga · kéo màn hình để ngắm cảnh`, 4200), 4600);
}
function ridesTick() {
  if (!rides.size) return;
  const R = world.ride, now = performance.now();
  for (const [a, r] of rides) {
    const k = Math.min(1, (now - r.t0) / r.dur);
    if (k >= 1) {
      finishRide(a);
      continue;
    }
    const u = 0.85 * k + 0.15 * k * k * (3 - 2 * k); // rời ga và vào ga chậm hơn một chút
    R.at(u, r.dir, r.cab.position);
    const ry = R.heading(u, r.dir);
    r.cab.rotation.set(Math.sin(now / 900) * 0.015, ry, Math.sin(now / 700) * 0.02); // cabin đung đưa nhẹ
    r.cab.updateMatrixWorld();
    rideV.set(0, -R.hang + 0.56, -0.72).applyMatrix4(r.cab.matrixWorld); // ngồi trên ghế băng sau lưng cabin
    a.pos.set(rideV.x, 0, rideV.z);
    a.root.position.set(rideV.x, rideV.y - 0.04 * a.p.sit, rideV.z);
    a.root.rotation.y = a.ry = a.seatRy = ry;
  }
}

// ---------- Chuông: chạm vào chuông để đi tới thỉnh ----------
let pendingBell = null;
function goBell(b) {
  sound.init();
  if (movePlayerTo(b.spot.x, b.spot.z)) {
    pendingBell = b;
    toast('Đi tới thỉnh chuông…', 1600);
  }
}
let lastBell = 0;
function bellTick() {
  if (!pendingBell || player.moving || player.routeTo) return;
  const b = pendingBell;
  pendingBell = null;
  if (Math.hypot(player.pos.x - b.spot.x, player.pos.z - b.spot.z) > 0.8) return;
  ringBell(b, player);
}
function ringBell(b, by) {
  by.act('gassho', Math.atan2(b.x - by.pos.x, b.z - by.pos.z));
  setTimeout(() => {
    b.swing();
    if (by.pos.distanceTo(player.pos) < 40) sound.greatBell(by === player ? 0.5 : 0.3);
  }, 700);
  if (by !== player) return bubble(by, 'thỉnh chuông', 3000);
  net?.send({ t: 'act', a: 'greatbell' });
  if (!net) earn(performance.now() - lastBell < 8000 ? 'noise' : 'bell');
  lastBell = performance.now();
  toast('Bạn đã thỉnh một hồi chuông — nguyện tiếng chuông vang xa, chúng sinh an lạc', 4000);
}

// ---------- Bản đồ khu và đi nhanh ----------
const PLACES = SITE.PLACES;
function quickTravel(p) {
  closeModal($('#modal-map'));
  setOverview(false);
  pendingBell = null;
  if (rides.has(player)) {
    scene.remove(rides.get(player).cab);
    rides.delete(player);
    player.seat = null;
    if (rideCam) Object.assign(cam, rideCam);
    rideCam = null;
  }
  teleport(p);
  toast(`Bạn đang ở ${p.name}`, 2600);
}
const SVGNS = 'http://www.w3.org/2000/svg';
let mapMe = null, mapOthers = null, mapOpen = false;
function buildMap() {
  const svg = $('#map-svg');
  if (svg.childElementCount) return;
  const [x0, z0, w, h] = SITE.MAP.box;
  svg.setAttribute('viewBox', `${x0} ${z0} ${w} ${h}`);
  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.append(e);
    return e;
  };
  el('rect', { x: x0, y: z0, width: w, height: h, class: 'm-bg' });
  for (const s of SITE.MAP.shapes) {
    if (s.r != null) el('circle', { cx: s.x, cy: s.z, r: s.r, class: s.c });
    else el('rect', { x: s.x0, y: s.z0, width: s.x1 - s.x0, height: s.z1 - s.z0, class: s.c });
  }
  const fs = SITE.MAP.font || 4;
  for (const [id, x, z, text] of SITE.MAP.labels) {
    const g = el('g', { class: 'm-place', role: 'button', tabindex: 0 });
    const t = el('text', { x, y: z + fs * 0.35, 'text-anchor': 'middle' }, g);
    t.style.fontSize = fs + 'px';
    t.textContent = text;
    const go = () => quickTravel(PLACES.find((p) => p.id === id));
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => e.key === 'Enter' && go());
  }
  mapOthers = el('g', {});
  mapMe = el('circle', { r: fs * 0.7, class: 'm-me' });
}
function updateMap() {
  mapMe.setAttribute('cx', player.pos.x);
  mapMe.setAttribute('cy', player.pos.z);
  const others = [...avatars.values()].filter((a) => a !== player);
  while (mapOthers.childElementCount < others.length) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', (SITE.MAP.font || 4) * 0.45);
    c.setAttribute('class', 'm-other');
    mapOthers.append(c);
  }
  [...mapOthers.children].forEach((c, i) => {
    const a = others[i];
    c.style.display = a ? '' : 'none';
    if (!a) return;
    c.setAttribute('cx', a.pos.x);
    c.setAttribute('cy', a.pos.z);
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

// ---------- Khách mô phỏng tham quan (mỗi máy tự cho đi, nhường chỗ khi có người thật) ----------
const bots = new Set();
let botSeq = 0;
const BOT_SAYS = SITE.BOT_SAYS || ['Nam mô A Di Đà Phật', 'Cảnh thật thanh tịnh'];
async function botGo(a, x, z) {
  [x, z] = clampWalk(x, z);
  const rideG = world.ride && !routeTo(a.pos.x, a.pos.z, x, z) && GOTOS.find((g) => g.ride && routeTo(a.pos.x, a.pos.z, g.x, g.z) && routeTo(g.to.x, g.to.z, x, z));
  if (rideG) {
    walkRoute(a, rideG.x + rnd(-1, 1), rideG.z + rnd(-0.6, 0.6));
    await wait(200);
    while (bots.has(a) && (a.moving || a.routeTo)) await wait(300);
    if (!bots.has(a)) return false;
    startRide(a, rideG.ride, { ...rideG.to, x: rideG.to.x + rnd(-1, 1) });
    bubble(a, 'đi cáp treo', 3000);
    while (bots.has(a) && rides.has(a)) await wait(500);
    if (!bots.has(a)) return false;
  }
  if (!routeTo(a.pos.x, a.pos.z, x, z)) {
    // khác tầng (vd đỉnh núi): đi cáp treo — biến mất một lúc rồi hiện ở nơi đến
    a.root.visible = false;
    await wait(rnd(3000, 6000));
    if (!bots.has(a)) return false;
    a.placeAt(x, z, a.ry);
    a.root.visible = true;
    return true;
  }
  walkRoute(a, x, z);
  await wait(200);
  while (bots.has(a) && (a.moving || a.routeTo)) await wait(300);
  return bots.has(a);
}
async function botTrip(a) {
  const T = pick(SITE.TRIPS);
  const s = T.spread ?? 3;
  if (!(await botGo(a, T.x + rnd(-s, s), T.z + rnd(-s * 0.5, s * 0.5)))) return;
  if (T.act === 'bow') {
    a.act('bow', T.ry ?? Math.PI);
    bubble(a, 'lạy Phật', 2500);
  } else if (T.act === 'gassho') {
    a.act('gassho', T.ry ?? Math.PI);
  } else if (T.act === 'bell' && world.bells?.length) {
    const b = world.bells[0];
    if (await botGo(a, b.spot.x, b.spot.z)) ringBell(b, a);
  } else if (T.ry != null) a.faceRy = T.ry;
  if (T.say) bubble(a, T.say, 3000);
  await wait(rnd(5000, 11000));
}
async function botLife(a) {
  await wait(rnd(500, 4000));
  while (bots.has(a)) {
    await botTrip(a);
    if (!bots.has(a)) return;
    if (Math.random() < 0.3) bubble(a, pick(BOT_SAYS), 3500);
    await wait(rnd(3000, 10000));
  }
}
function makeBot() {
  const a = addAvatar(new Avatar({ id: 'bot' + botSeq++, name: `${pick(NOUNS)} ${pick(ADJS)}`, robe: Math.floor(Math.random() * ROBES.length) }));
  a.setSandals(pick(SANDAL_COLORS));
  a.wearSandals(true);
  const [x0, x1, z0, z1] = pick(SITE.BOT_SPAWN);
  const [x, z] = clampWalk(rnd(x0, x1), rnd(z0, z1));
  a.placeAt(x, z, rnd(0, 6.28));
  bots.add(a);
  botLife(a);
}
function syncBots() {
  const max = SITE.BOTS ?? 9;
  const target = net ? Math.max(0, max - onlineCount) : max;
  while (bots.size < target) makeBot();
  for (const a of [...bots]) {
    if (bots.size <= target) break;
    bots.delete(a);
    if (rides.has(a)) {
      scene.remove(rides.get(a).cab);
      rides.delete(a);
    }
    removeAvatar(a.id);
  }
}

// ---------- Hồ sơ Phật tử: điểm phước / nghiệp ----------
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

// ---------- Thắp nhang: lư hương gần nhất theo chỗ đang đứng (SITE.placeOf) ----------
const placeOf = (a) => SITE.placeOf(a.pos.x, a.pos.z);
const burnerOf = (place) => world.burners[place] ?? world.burners[SITE.defaultPlace];
const placeInfo = (place) => SITE.PLACE_INFO[place] ?? SITE.PLACE_INFO[SITE.defaultPlace];
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
function openIncenseDialog() {
  if (ritual) return;
  const st = incenseStats();
  $('#inc-stats').textContent = st.today ? `Hôm nay bạn đã thắp ${st.today} nén nhang.` : '';
  const info = placeInfo(placeOf(player));
  $('#inc-title').textContent = info.title;
  $('#modal-incense .muted').textContent = info.text;
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
  let place = placeOf(player);
  if (!world.burners[place]) place = SITE.defaultPlace;
  const spot = leastCrowded(burnerOf(place).spots, player);
  if (!movePlayerTo(spot.x, spot.z)) return;
  ritual = { n: incN, wish, spot, place, started: false };
  incBtn.disabled = true;
});
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
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang${placeInfo(place).done || ''}`, 4200);
  }, place);
}

// ---------- Thùng công đức (tượng trưng, mỗi người 3 lần/ngày; sổ công đức chung) ----------
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
const meritOf = (a) => world.merits.find((m) => m.place === placeOf(a)) ?? world.merits.find((m) => m.place === SITE.defaultPlace) ?? world.merits[0];
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
  if (!movePlayerTo(spot.x, spot.z)) return;
  meritRun = { spot, box, anon: $('#merit-anon').checked, dedic, started: false };
});
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

// ---------- Nghe tụng kinh ----------
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
    a.download = `am-may-${siteId}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
  const f = $('#flash');
  f.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
  toast('Đã lưu ảnh chụp');
});
$('#btn-info').addEventListener('click', () => openModal('#modal-info'));

// ---------- Cài đặt (dùng chung cài đặt đã lưu) ----------
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
const cam = { yaw: SPAWN.ry + Math.PI, pitch: 0.32, dist: 10, curDist: 18, curPitch: 0.6, target: new THREE.Vector3(SPAWN.x, groundY(SPAWN.x, SPAWN.z) + 1.1, SPAWN.z) };
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
    if (a === player || !a.root.visible) continue;
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
  if (ray.intersectObjects(world.merits.map((m) => m.group), true)[0]) return openMeritDialog();
  if (world.duyen?.group && ray.intersectObjects([world.duyen.group], true)[0]) return duyenDlg.open(); // chạm cây duyên
  const bell = world.bells?.length && ray.intersectObjects(world.bells.map((b) => b.group), true)[0];
  if (bell) return goBell(world.bells.find((b) => bell.object === b.group || b.group.getObjectById(bell.object.id)));
  const goHit = world.gotoHits?.length && ray.intersectObjects(world.gotoHits, true)[0];
  if (goHit) {
    let o = goHit.object;
    while (o && o.userData.goto == null) o = o.parent;
    const g = GOTOS[o?.userData.goto];
    if (g) {
      if (Math.hypot(player.pos.x - g.x, player.pos.z - g.z) < g.r) return useGoto(g);
      movePlayerTo(g.x, g.z);
      return;
    }
  }
  const hit = ray.intersectObjects(world.pickables, true).find((h) => {
    let o = h.object;
    while (o && !o.userData.kind) o = o.parent;
    return o?.userData.kind === 'ground';
  });
  if (hit) movePlayerTo(hit.point.x, hit.point.z);
}
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
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

// ---------- Nhìn toàn cảnh từ trên cao ----------
const OV = { distMin: 30, distMax: 320, pitchMin: 0.45, pitchMax: 1.45, ...SITE.OV };
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
  const s = cam.curDist * 0.0016;
  const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
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
  renderer.shadowMap.autoUpdate = !on;
  renderer.shadowMap.needsUpdate = true;
  scene.fog.near = on ? 300 : FOG.near;
  scene.fog.far = on ? 1100 : FOG.far;
  if (on) {
    ov.saved = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
    const b = OV.bounds;
    ov.focus.set(clamp(player.pos.x, b.x0, b.x1), OV.y ?? LAND, clamp(player.pos.z, b.z0, b.z1));
    cam.yaw = 0;
    cam.pitch = 0.95;
    cam.dist = OV.dist ?? 120;
    showHint(isCoarse ? 'Toàn cảnh chùa · kéo để dời · chụm hai ngón để phóng to · chạm đất để đi tới' : 'Toàn cảnh chùa · kéo để dời · chuột phải kéo để xoay · lăn chuột để phóng to · nhấp đất để đi tới · V để trở lại', 7000);
  } else {
    Object.assign(cam, ov.saved);
    showHint(baseHint, 4000);
  }
}
$('#btn-overview').addEventListener('click', () => setOverview(!ov.on));
function ovMarkerLift() {
  const { x, z } = player.pos;
  for (const r of world.roofs) if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return r.lift;
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
  if (!keys.size || going || rides.has(player)) return;
  let f = 0, s = 0;
  if (keys.has('w') || keys.has('arrowup')) f += 1;
  if (keys.has('s') || keys.has('arrowdown')) f -= 1;
  if (keys.has('a') || keys.has('arrowleft')) s -= 1;
  if (keys.has('d') || keys.has('arrowright')) s += 1;
  if (!f && !s) return;
  const len = Math.hypot(f, s);
  const nx = player.pos.x + ((-Math.sin(cam.yaw) * f + Math.cos(cam.yaw) * s) / len) * 0.7;
  const nz = player.pos.z + ((-Math.cos(cam.yaw) * f - Math.sin(cam.yaw) * s) / len) * 0.7;
  const [cx, cz] = clampWalk(nx, nz);
  // phím di chuyển không được nhảy sang vùng khác tầng
  if ((WALK_AREAS[areaOf(cx, cz)].zone ?? 0) !== (WALK_AREAS[areaOf(player.pos.x, player.pos.z)].zone ?? 0)) return;
  player.route = null;
  player.routeTo = null;
  player.walkTo(cx, cz);
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
  // dịch chuyển xa (cáp treo, đi nhanh): camera nhảy theo luôn
  if (cam.target.distanceTo(want) > 30) cam.target.copy(want);
  cam.target.lerp(want, 1 - Math.exp(-6 * dt));
  cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  const cp = Math.cos(cam.curPitch);
  const px = cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist, pz = cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist;
  camera.position.set(px, Math.max(groundY(cam.target.x, cam.target.z) + 0.5, (SITE.camFloor ?? groundY)(px, pz) + 0.6, cam.target.y + Math.sin(cam.curPitch) * cam.curDist), pz);
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
  el.style.visibility = v3.z > 1 || op === 0 || !a.root.visible ? 'hidden' : 'visible';
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
  const [x, z] = p.z === 16 && p.x === 0 ? [SPAWN.x + rnd(-3, 3), SPAWN.z] : clampWalk(p.x, p.z);
  a.placeAt(x, z, SPAWN.ry);
  // vào phòng lúc người này đang ngồi cáp treo: cho ngồi cabin tới ga đến
  if ((p.seat === RIDE_SEAT || p.seat === RIDE_SEAT + 1) && world.ride) {
    const dir = p.seat === RIDE_SEAT ? 'up' : 'down';
    startRide(a, dir, GOTOS.find((g) => g.ride === dir)?.to ?? { x, z, ry: SPAWN.ry });
  }
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
    if ((m.seat === RIDE_SEAT || m.seat === RIDE_SEAT + 1) && world.ride) {
      const dir = m.seat === RIDE_SEAT ? 'up' : 'down';
      if (!rides.has(a)) {
        startRide(a, dir, GOTOS.find((g) => g.ride === dir)?.to ?? { x: m.x, z: m.z, ry: a.ry });
        bubble(a, 'đi cáp treo', 3000);
      }
      return;
    }
    if (rides.has(a)) finishRide(a);
    const [x, z] = clampWalk(m.x, m.z);
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
      a.act('bow', bowRyAt(a));
      bubble(a, 'lạy Phật');
    } else if (m.a === 'incense') {
      offerIncense(a, m.n === 3 ? 3 : 1, null, world.burners[m.place] ? m.place : placeOf(a));
    } else if (m.a === 'greatbell' && world.bells?.length) {
      const b = world.bells.reduce((p, c) => (Math.hypot(c.x - a.pos.x, c.z - a.pos.z) < Math.hypot(p.x - a.pos.x, p.z - a.pos.z) ? c : p));
      ringBell(b, a);
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
    earn('visit');
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
  sendMove(true);
  syncBots();
}

// ---------- Chọn phòng / khu, tắt tiếng ----------
$('#btn-room').addEventListener('click', async () => {
  const list = $('#room-list');
  const render = (counts) => {
    list.innerHTML = '';
    let lastSite = null;
    for (const r of [...MY_ROOMS, ...ROOMS.filter((x) => x.site !== siteId)]) {
      if (r.site !== lastSite) {
        lastSite = r.site;
        const h = document.createElement('p');
        h.className = 'site-head';
        h.textContent = `${SITES[r.site].name} — ${SITES[r.site].desc}`;
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
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  keyMove(elapsed);
  world.update(elapsed, dt);
  for (const a of avatars.values()) {
    const arrived = a.update(dt);
    if (arrived && a === player) sendMove();
  }
  ridesTick();
  duyenTick();
  gotoTick(dt);
  bellTick();
  if (mapOpen) updateMap();
  if ((lodT -= dt) < 0) {
    lodT = 0.5;
    if (ov.on) world.updateLOD(Infinity, Infinity);
    else world.updateLOD(player.pos.x, player.pos.z);
  }
  if (!ov.on) world.setFocus(player.pos.x, player.pos.z, player.root.position.y);
  updateCamera(dt);
  renderer.render(scene, camera);
  incenseRitual();
  meritRitual();
  updateLabels(performance.now());
  updateGains(performance.now());
  updateCaption();
}
renderer.setAnimationLoop(frame);
renderer.compile(scene, camera);
setTimeout(() => $('#loader').classList.add('done'), 400);
showHint(`Chào mừng đến ${SITE.name} · ${SITE.hint} · ${baseHint}`, 9000);
join();
