import * as THREE from 'three';
import { buildWorld, HALL, BUDDHA, ENTRANCE, COURTYARD, groundY } from './world.js';
import { Avatar, ROBES } from './avatar.js';
import { SandalRack, SANDAL_COLORS } from './sandals.js';
import { Sound, CHANT_SYLLABLES, vietnameseVoices } from './audio.js';
import { Beads } from './beads.js';
import { connect, fetchRooms, fetchMerit, ROOMS } from './net.js';
import { applyEvent, newProfile, publicProfile, RULES, CLIENT_KINDS } from './karma.js';

const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Thông tin nhận diện (pháp danh, áo, dép, mã) lưu thêm vào cookie 1 năm,
// phòng khi bộ nhớ localStorage bị trình duyệt xóa.
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
// xin trình duyệt không tự xóa dữ liệu của trang
navigator.storage?.persist?.().catch(() => {});

const NOUNS = ['Mây', 'Sen', 'Trăng', 'Gió', 'Suối', 'Lá', 'Sương', 'Nắng', 'Trúc', 'Sóng', 'Hạt mưa', 'Cánh hạc', 'Bông súng', 'Ngọn đèn'];
const ADJS = ['an nhiên', 'lặng lẽ', 'thong thả', 'dịu dàng', 'hiền hòa', 'thanh tịnh', 'nhẹ nhàng', 'bình yên', 'tĩnh tại', 'ấm áp'];
const randomName = () => `${pick(NOUNS)} ${pick(ADJS)}`;

const isCoarse = matchMedia('(pointer: coarse)').matches;
const SETTINGS_VERSION = 2;
const settings = Object.assign(
  { ambient: true, ambientVol: 0.45, chantVol: 0.5, fx: true, fxVol: 0.55, bg: true, quality: isCoarse ? 'low' : 'high', muted: false, showNames: true },
  store.get('settings', {}),
);
// v2: "Phát khi chuyển tab" mặc định bật — bật lại một lần cho cài đặt đã lưu từ trước
if ((settings.v || 1) < 2) settings.bg = true;
settings.v = SETTINGS_VERSION;
const saveSettings = () => store.set('settings', settings);
saveSettings();
// chưa có pháp danh → hỏi khi vào chùa lần đầu (xem askName ở cuối file)
const savedName = store.get('name', null);
let myName = savedName || randomName();
const myRobe = store.get('robe', Math.floor(Math.random() * ROBES.length));
store.set('robe', myRobe);
const mySandals = store.get('sandals', Math.floor(Math.random() * SANDAL_COLORS.length)) % SANDAL_COLORS.length;
store.set('sandals', mySandals);
// mã ẩn danh của trình duyệt này — máy chủ dùng để đếm lượt công đức mỗi ngày
const myUid = store.get('uid', null) || Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => (b % 36).toString(36)).join('');
store.set('uid', myUid);

const params = new URLSearchParams(location.search);
let roomId = ROOMS.some((r) => r.id === params.get('room')) ? params.get('room') : ROOMS[0].id;

// ---------- Renderer ----------
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.quality === 'high' ? 2 : 1.25));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = camera.aspect < 0.8 ? 64 : 50;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

try { await document.fonts.load('700 40px "Noto Serif"'); } catch { /* dùng font dự phòng */ }
const world = buildWorld(renderer, { quality: settings.quality });
const { scene, seats } = world;
Avatar.ground = groundY;
// ?gio=20.5 trên địa chỉ trang: xem thử chánh điện lúc 20 giờ 30 (mặc định theo giờ Việt Nam thật)
if (params.has('gio')) world.setHour(parseFloat(params.get('gio')));
const rack = new SandalRack(scene);

const sound = new Sound(settings);

// ---------- Nhân vật ----------
const avatars = new Map();
const labelsEl = $('#labels');

function addAvatar(a) {
  avatars.set(a.id, a);
  scene.add(a.root);
  if (!a.isPlayer) {
    // nhãn pháp danh trên đầu (tắt được trong Cài đặt)
    a.nameEl = document.createElement('div');
    a.nameEl.className = 'label name';
    a.nameEl.textContent = a.name;
    a.nameEl.hidden = true;
    a.nameEl.title = 'Xem hồ sơ';
    a.nameEl.addEventListener('click', () => openProfile(a));
    labelsEl.append(a.nameEl);
  }
  return a;
}
function removeAvatar(id) {
  const a = avatars.get(id);
  if (!a) return;
  a.script = null;
  a.dispose();
  a.bubbleEl?.remove();
  a.nameEl?.remove();
  avatars.delete(id);
  rack.release(id);
}

const player = new Avatar({ id: 'me', name: myName, robe: myRobe, isPlayer: true });
player.setSandals(SANDAL_COLORS[mySandals]);
addAvatar(player);
player.placeAt(0, COURTYARD.z, Math.PI);
player.labelEl = document.createElement('div');
player.labelEl.className = 'label me';
player.labelEl.title = 'Hồ sơ của tôi';
player.labelEl.addEventListener('click', () => openProfile(player));
labelsEl.append(player.labelEl);
const renderMyLabel = () => {
  player.labelEl.innerHTML = '<i>Tôi</i>';
  player.labelEl.append(myName);
};
renderMyLabel();

// Bong bóng hành động; khi đã hiện pháp danh thì không lặp lại tên
function bubble(a, action, ms = 2600) {
  if (!a.bubbleEl) {
    a.bubbleEl = document.createElement('div');
    a.bubbleEl.className = 'label bubble hidden';
    labelsEl.append(a.bubbleEl);
  }
  a.bubbleEl.textContent = settings.showNames ? action : `${a.name} · ${action}`;
  a.bubbleEl.classList.remove('hidden');
  a.bubbleUntil = performance.now() + ms;
}

function seatTaken(index, except) {
  for (const a of avatars.values()) {
    if (a === except) continue;
    if (a.seat === index || a.goalSeat?.index === index) return true;
  }
  return false;
}
const freeSeats = (except) => seats.filter((s) => !seatTaken(s.index, except));

const faceBuddhaRy = (a) => Math.atan2(BUDDHA.x - a.pos.x, BUDDHA.z - a.pos.z);
const faceRy = (a, b) => Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z);

// ---------- Toast ----------
const toastEl = $('#toast');
let toastT;
function toast(text, ms = 3000) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), ms);
}
let lastSocialToast = 0;
function socialToast(text) {
  const now = performance.now();
  if (now - lastSocialToast < 7000) return;
  lastSocialToast = now;
  toast(text);
}

// ---------- Vào / ra chánh điện: dép để trên thềm ----------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const alive = (a, token) => a.script === token && avatars.has(a.id);
const STEP_Z = 22.4; // chân bậc tam cấp

// Từ sân đi lên thềm, cởi dép, quay lại sắp dép ngay ngắn (mũi dép hướng ra sân) rồi mới vào.
// Trả về false nếu bị ngắt giữa chừng.
async function enterTemple(a) {
  const token = (a.script = {});
  a.wearSandals(true);
  const slot = rack.reserve(a.id);
  if (slot) {
    await a.walk(clamp(slot.x, -3, 3), STEP_Z);
    if (!alive(a, token)) return false;
    await a.walk(slot.x, slot.z);
    if (!alive(a, token)) return false;
    a.faceRy = Math.PI;
    await wait(400);
    if (!alive(a, token)) return false;
    // bước ra khỏi dép — dép còn nằm đó, mũi quay vào trong
    a.wearSandals(false);
    rack.place(a.id, a.sandalColors, { messy: true });
    await a.walk(slot.x, slot.z - 0.75);
    if (!alive(a, token)) return false;
    // quay lại, cúi xuống xoay dép cho ngay ngắn
    a.act('stoop', 0);
    await wait(550);
    rack.straighten(a.id, 0.9);
    await wait(1500);
    if (!alive(a, token)) return false;
  } else {
    a.wearSandals(false);
  }
  a.script = null;
  return true;
}

// Đến chỗ để dép, mang dép vào rồi đi ra sân
async function exitTemple(a) {
  const token = (a.script = {});
  const slot = rack.slotOf(a.id);
  if (slot && rack.has(a.id)) {
    await a.walk(slot.x, slot.z - 0.75);
    if (!alive(a, token)) return false;
    await a.walk(slot.x, slot.z);
    if (!alive(a, token)) return false;
    rack.release(a.id);
    a.wearSandals(true);
    await wait(300);
    await a.walk(clamp(slot.x, -3, 3), STEP_Z);
  } else {
    await a.walk(rnd(-1.5, 1.5), STEP_Z);
  }
  if (!alive(a, token)) return false;
  await a.walk(rnd(-1.5, 1.5), COURTYARD.z + 2);
  return alive(a, token);
}

// Ngắt kịch bản đang chạy: dép coi như đã để ngay ngắn trên thềm
function cancelScript(a) {
  if (!a.script) return;
  a.script = null;
  a.wearSandals(false);
  if (!rack.has(a.id)) rack.place(a.id, a.sandalColors);
  else rack.straighten(a.id, 0.01);
}

// ---------- Mạng / khách mô phỏng ----------
let net = null;
let online = false;
let onlineCount = 0;
const bots = new Set();
let botSeq = 0;
let botTarget = 0;

function updateCount() {
  $('#people').textContent = online ? onlineCount : bots.size + 1;
}

function makeBot({ seated }) {
  const a = addAvatar(new Avatar({ id: 'bot' + botSeq++, name: randomName(), robe: Math.floor(Math.random() * ROBES.length) }));
  a.setSandals(pick(SANDAL_COLORS));
  const free = freeSeats();
  const seat = free.length ? pick(free) : null;
  if (seated && seat) {
    a.sitAt(seat);
    rack.place(a.id, a.sandalColors);
  } else {
    a.placeAt(rnd(-1.5, 1.5), COURTYARD.z + rnd(0, 3), Math.PI);
    enterTemple(a).then((ok) => {
      if (!ok) return;
      const s = pick(freeSeats(a));
      if (s) a.walkTo(s.x, s.z, s);
      else a.walkTo(rnd(-8, 8), rnd(-4, 12));
    });
  }
  a.brain = { next: elapsed + rnd(4, 30) };
  bots.add(a);
  updateCount();
  return a;
}

function botsThink(t) {
  for (const a of bots) {
    if (a.leaving || a.script) continue;
    if (a.pendingIncense && !a.moving) {
      const n = a.pendingIncense;
      a.pendingIncense = 0;
      offerIncense(a, n, () => {
        const free = freeSeats(a);
        if (free.length && avatars.has(a.id)) {
          const s = pick(free);
          setTimeout(() => avatars.has(a.id) && !a.leaving && a.walkTo(s.x, s.z, s), rnd(1500, 4000));
        }
      });
      continue;
    }
    if (a.pendingMerit && !a.moving) {
      a.pendingMerit = false;
      offerMerit(a, () => {
        if (!online) {
          meritBoard.total++;
          meritBoard.recent.unshift({ name: Math.random() < 0.25 ? null : a.name, at: Date.now() });
          meritBoard.recent.length = Math.min(meritBoard.recent.length, 12);
          renderMerit();
        }
        const s = pick(freeSeats(a));
        if (s) setTimeout(() => avatars.has(a.id) && !a.leaving && a.walkTo(s.x, s.z, s), rnd(1200, 3500));
      });
      continue;
    }
    if (t < a.brain.next || a.moving || a.leaving || a.busy) continue;
    a.brain.next = t + rnd(10, 45);
    const r = Math.random();
    if (r < 0.32) a.act('bow', faceBuddhaRy(a));
    else if (r < 0.55) {
      a.act('gassho');
      if (player.pos.distanceTo(a.pos) < 4.5) {
        a.act('gassho', a.sitting ? null : faceRy(a, player));
        bubble(a, 'chắp tay');
        socialToast(`${a.name} chắp tay chào bạn`);
      }
    } else if (r < 0.66) {
      const free = freeSeats(a);
      if (free.length) {
        const s = pick(free);
        a.walkTo(s.x, s.z, s);
      }
    } else if (r < 0.7) {
      botLeave(a);
    } else if (r < 0.78) {
      const spot = altarSpot(a);
      a.pendingIncense = Math.random() < 0.6 ? 3 : 1;
      a.walkTo(spot.x, spot.z);
    } else if (r < 0.83) {
      const spot = meritSpot(a);
      a.pendingMerit = true;
      a.walkTo(spot.x, spot.z);
    }
  }
  if (bots.size < botTarget && Math.random() < 0.004) makeBot({ seated: false });
  if (bots.size > botTarget && Math.random() < 0.01) {
    const a = pick([...bots].filter((b) => !b.leaving && !b.script && !b.busy));
    if (a) botLeave(a);
  }
}

function botLeave(a) {
  a.leaving = true;
  exitTemple(a).then(() => {
    if (!bots.has(a)) return;
    bots.delete(a);
    removeAvatar(a.id);
    updateCount();
  });
}

// Khi có người thật, khách mô phỏng nhường chỗ dần
const fillTarget = () => (online ? Math.max(0, 14 - onlineCount) : botTarget);

// Người thật ngồi vào chỗ khách mô phỏng đang ngồi → khách chuyển chỗ
function yieldSeat(index) {
  for (const b of bots) {
    if (b.seat !== index && b.goalSeat?.index !== index) continue;
    const free = freeSeats(b);
    if (free.length) {
      const s = pick(free);
      b.walkTo(s.x, s.z, s);
    } else {
      b.walkTo(b.pos.x + 0.9, b.pos.z + 0.6);
    }
  }
}

function clearOthers(keepMySandals) {
  for (const id of [...avatars.keys()]) if (id !== 'me') removeAvatar(id);
  bots.clear();
  rack.clear(keepMySandals ? 'me' : undefined);
}

// entering: người vừa vào phòng — đi từ sân lên, cởi dép ở thềm
function addRemote(p, { entering = false } = {}) {
  if (avatars.has('n' + p.id)) return;
  const a = addAvatar(new Avatar({ id: 'n' + p.id, name: p.name, robe: p.robe }));
  a.setSandals(SANDAL_COLORS[(p.sandals ?? +p.id) % SANDAL_COLORS.length]);
  if (entering) {
    a.placeAt(rnd(-1.5, 1.5), COURTYARD.z, Math.PI);
    enterTemple(a).then((ok) => ok && a.walkTo(rnd(-1.5, 1.5), ENTRANCE.z - 4));
    return;
  }
  const seat = p.seat != null ? seats[p.seat] : null;
  if (seat) a.sitAt(seat);
  else a.placeAt(p.x, p.z, Math.PI);
  rack.place(a.id, a.sandalColors);
}

function wireNet(n) {
  n.on('join', (m) => {
    addRemote(m.p, { entering: true });
    bubble(avatars.get('n' + m.p.id), 'vừa đến chùa', 4000);
  });
  n.on('leave', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a || a.leaving) return;
    a.leaving = true;
    exitTemple(a).then(() => removeAvatar(a.id));
  });
  n.on('move', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a || a.leaving) return;
    cancelScript(a);
    const seat = m.seat != null ? seats[m.seat] : null;
    if (seat) yieldSeat(seat.index);
    a.walkTo(m.x, m.z, seat);
  });
  n.on('act', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a) return;
    if (m.a === 'gassho') {
      const toMe = m.to === n.welcome.id;
      a.act('gassho', toMe && !a.sitting ? faceRy(a, player) : null);
      bubble(a, 'chắp tay');
      if (toMe) toast(`${a.name} chắp tay chào bạn`);
    } else if (m.a === 'bow') {
      a.act('bow', faceBuddhaRy(a));
      bubble(a, 'lạy Phật');
    } else if (m.a === 'bell' || m.a === 'drum') {
      ringInstrument(m.a, a);
    } else if (m.a === 'incense') {
      offerIncense(a, m.n === 3 ? 3 : 1);
    }
  });
  n.on('merit', (m) => {
    Object.assign(meritBoard, { total: m.total, recent: m.recent });
    renderMerit();
    const a = avatars.get('n' + m.id);
    if (a && !a.leaving) offerMerit(a);
  });
  n.on('karma', (m) => showGain(m.entry));
  n.on('profile', (m) => {
    const resolve = profileWaiters.get(m.req);
    if (!resolve) return;
    profileWaiters.delete(m.req);
    resolve(m.profile);
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
  n.on('name', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a) return;
    a.name = m.name;
    if (a.nameEl) a.nameEl.textContent = m.name;
  });
  n.on('count', (m) => {
    onlineCount = m.n;
    botTarget = fillTarget();
    updateCount();
  });
  n.on('close', () => {
    if (net !== n) return;
    net = null;
    toast('Mất kết nối, đang kết nối lại…');
    setTimeout(() => joinRoom(roomId, { keepPlayer: true }), 3000);
  });
}

async function joinRoom(id, { keepPlayer = false } = {}) {
  roomId = id;
  const room = ROOMS.find((r) => r.id === id);
  $('#room-name').textContent = room.name;
  const url = new URL(location.href);
  url.searchParams.set('room', id);
  history.replaceState(null, '', url);

  if (net) { const old = net; net = null; old.close(); }
  clearOthers(keepPlayer);
  if (!keepPlayer) startIntro();
  const n = await connect({ room: id, name: myName, robe: myRobe, sandals: mySandals, uid: myUid });
  if (roomId !== id) { n?.close(); return; }
  online = !!n;
  if (n) {
    net = n;
    wireNet(n);
    n.welcome.peers.forEach(addRemote);
    onlineCount = n.welcome.peers.length + 1;
    if (n.welcome.merit) {
      const { total, recent, used } = n.welcome.merit;
      Object.assign(meritBoard, { total, recent });
      setMeritUsed(Math.max(used, meritStats().used));
      renderMerit();
    }
    botTarget = fillTarget();
    if (!intro) sendMove();
  } else {
    botTarget = Math.floor(rnd(16, 30));
    earn('visit');
  }
  for (let i = 0; i < botTarget; i++) makeBot({ seated: Math.random() < 0.85 });
  $('#info-mode').textContent = online
    ? 'Bạn đang trực tuyến. Số trên góc phải là số người thật đang ở đây; khi chánh điện còn vắng, vài khách mô phỏng ngồi cùng cho ấm cúng và sẽ nhường chỗ khi có người vào.'
    : 'Đang chạy ngoại tuyến: những người trong chánh điện là khách mô phỏng. Chạy máy chủ (npm start) để gặp người thật.';
  updateCount();
}

// ---------- Mở đầu: từ sân đi vào ----------
let intro = false;
function startIntro() {
  intro = true;
  if (ritual) {
    ritual = null;
    incBtn.disabled = false;
  }
  meritRun = null;
  player.seat = null;
  player.holdIncense(0);
  player.holdEnvelope(false);
  rack.release('me');
  player.placeAt(rnd(-1, 1), COURTYARD.z, Math.PI);
  cam.yaw = 0;
  showHint('Để dép ngay ngắn ở thềm trước khi vào chánh điện · chạm màn hình để bỏ qua', 0);
  enterTemple(player).then((ok) => {
    if (!ok || !intro) return;
    intro = false;
    movePlayerTo(rnd(-1, 1), ENTRANCE.z - 4);
    showHint(baseHint, 8000);
  });
}
function skipIntro() {
  if (!intro) return;
  intro = false;
  cancelScript(player);
  player.placeAt(rnd(-1, 1), ENTRANCE.z - 4, Math.PI);
  sendMove();
  showHint(baseHint, 8000);
}

function sendMove() {
  if (!net || intro) return;
  const g = player.goal ?? player.pos;
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: player.goalSeat?.index ?? player.seat ?? null });
}

// ---------- Hành động ----------
function movePlayerTo(x, z, seat = null) {
  x = clamp(x, HALL.minX, HALL.maxX);
  z = clamp(z, HALL.minZ, HALL.maxZ);
  player.walkTo(x, z, seat);
  world.showMarker(x, z, seat ? 0.21 : 0.04);
  sendMove();
}

// Người (thật hoặc khách) đang đứng/ngồi gần mình nhất trong bán kính r
function nearestPerson(r) {
  let best = null, bestD = r;
  for (const a of avatars.values()) {
    if (a === player || a.leaving || a.script) continue;
    const d = a.pos.distanceTo(player.pos);
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  return best;
}

function doGassho(target = null) {
  sound.init();
  player.act('gassho', target && !player.sitting ? faceRy(player, target) : null);
  sound.gassho();
  net?.send({ t: 'act', a: 'gassho', to: target?.id?.startsWith('n') ? target.id.slice(1) : undefined });
  if (target) {
    toast(`Bạn chắp tay chào ${target.name}`);
    earn('greet');
    if (bots.has(target) && Math.random() < 0.8) {
      setTimeout(() => {
        if (!avatars.has(target.id)) return;
        target.act('gassho', target.sitting ? null : faceRy(target, player));
        bubble(target, 'chắp tay đáp lễ');
        toast(`${target.name} chắp tay đáp lễ`);
      }, rnd(900, 1800));
    }
  } else {
    // vài người gần đó chào lại
    const near = [...bots].filter((b) => b.pos.distanceTo(player.pos) < 5 && !b.moving);
    if (near.length && Math.random() < 0.7) {
      const b = pick(near);
      setTimeout(() => {
        if (!avatars.has(b.id)) return;
        b.act('gassho', b.sitting ? null : faceRy(b, player));
        bubble(b, 'chắp tay');
        socialToast(`${b.name} chắp tay chào lại`);
      }, rnd(1000, 2200));
    }
  }
}

function doBow() {
  sound.init();
  player.act('bow', faceBuddhaRy(player));
  sound.bow();
  net?.send({ t: 'act', a: 'bow' });
  earn('bow');
}

// ---------- Hồ sơ Phật tử: điểm phước / nghiệp ----------
// Trực tuyến: máy chủ tính điểm và gửi lại ('karma'). Ngoại tuyến: tính ngay trên máy theo cùng quy tắc.
let localProfile = store.get('profile', null) || newProfile(myName);
let bellTimes = [];

function earn(kind, opts) {
  if (net) {
    if (CLIENT_KINDS.includes(kind)) net.send({ t: 'karma', kind });
    return;
  }
  localProfile.name = myName;
  const entry = applyEvent(localProfile, kind, opts);
  if (!entry) return;
  store.set('profile', localProfile);
  if (!entry.silent) showGain(entry);
}

// Thỉnh chuông / đánh trống: dồn dập quá (5 lần trong 30 giây) thì thành nghiệp
function earnBell() {
  if (net) return; // máy chủ tự tính
  const now = Date.now();
  bellTimes = bellTimes.filter((t) => now - t < 30e3);
  bellTimes.push(now);
  if (bellTimes.length >= 5) {
    bellTimes = [];
    earn('noise');
  } else {
    earn('bell');
  }
}

// Điểm vừa được cộng: nhãn nhỏ bay lên trên đầu mình
const gains = [];
function showGain(entry) {
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
  for (const [cls, val, label] of [['phuoc', p.phuoc, 'Điểm phước'], ['nghiep', p.nghiep, 'Điểm nghiệp'], ['total', p.phuoc - p.nghiep, 'Tổng (phước − nghiệp)']]) {
    const box = el('div', 'pf-score ' + cls);
    box.append(el('b', null, val.toLocaleString('vi-VN')), el('span', null, label));
    scores.append(box);
  }
  const s = p.stats;
  const stats = el('div', 'pf-stats');
  for (const [label, val] of [
    ['Lạy Phật', s.bow], ['Chào bạn đạo', s.greet], ['Nén nhang', s.incense],
    ['Góp công đức', s.merit], ['Chuỗi 108 hạt', s.beads], ['Phút tụng kinh', s.chantMin ?? (s.chant || 0) * 10],
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
    li.append(
      el('span', null, h.label),
      el('small', null, fmtTime(h.at)),
      el('em', h.nghiep ? 'bad' : null, h.phuoc ? `+${h.phuoc} phước` : `+${h.nghiep} nghiệp`),
    );
    ul.append(li);
  }
  hist.append(ul);
  const rules = el('details', 'pf-rules');
  rules.append(el('summary', null, 'Cách tính điểm'));
  const rl = el('ul');
  for (const r of Object.values(RULES)) {
    rl.append(el('li', null, `${r.label}: +${r.phuoc || r.nghiep} ${r.phuoc ? 'phước' : 'nghiệp'} (tối đa ${r.cap} lần/ngày)`));
  }
  rules.append(rl);
  body.append(scores, stats, hist, rules);
}

async function openProfile(a) {
  renderProfile(a.name, null, 'Đang mở hồ sơ…');
  openModal('#modal-profile');
  if (bots.has(a)) {
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

// ---------- Thắp nhang ----------
// Chọn chỗ đứng trước bàn thờ ít người nhất
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
const altarSpot = (except) => leastCrowded(world.incense.spots, except);
const meritSpot = (except) => leastCrowded(world.merit.spots, except);

// Cầm nhang, vái lạy, rồi cắm vào lư hương
function offerIncense(a, n, onDone) {
  a.busy = true;
  a.holdIncense(n);
  a.act('bow', faceBuddhaRy(a));
  if (a !== player) bubble(a, 'thắp nhang', 3600);
  setTimeout(() => {
    a.busy = false;
    if (!avatars.has(a.id)) return;
    a.holdIncense(0);
    world.incense.add(n, { mine: a === player });
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
  const spot = altarSpot(player);
  ritual = { n: incN, wish, spot, started: false };
  incBtn.disabled = true;
  movePlayerTo(spot.x, spot.z);
  hideHint();
});

// Chạy mỗi khung hình: tới nơi thì bắt đầu nghi thức; đi chỗ khác thì hủy
function incenseRitual() {
  if (!ritual || ritual.started) return;
  const g = player.goal;
  if (g && Math.hypot(g.x - ritual.spot.x, g.z - ritual.spot.z) > 0.01) {
    ritual = null;
    incBtn.disabled = false;
    toast('Đã hủy thắp nhang');
    return;
  }
  if (player.moving) return;
  ritual.started = true;
  const { n, wish } = ritual;
  sound.incense();
  net?.send({ t: 'act', a: 'incense', n });
  offerIncense(player, n, () => {
    earn('incense', { n });
    ritual = null;
    incBtn.disabled = false;
    const st = incenseStats();
    st.today += n;
    st.total += n;
    store.set('incense', st);
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang`, 4200);
  });
}

// ---------- Thùng công đức (tượng trưng, mỗi người 3 lần/ngày) ----------
const MERIT_PER_DAY = 3;
const vnDate = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
// sổ công đức chung; ngoại tuyến thì mô phỏng
const meritBoard = { total: Math.floor(rnd(18, 60)), recent: [] };
for (let i = 0; i < 5; i++) {
  meritBoard.recent.push({ name: Math.random() < 0.25 ? null : randomName(), at: Date.now() - (i + 1) * rnd(4, 25) * 60e3 });
}
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
  if (!meritBoard.recent.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Chưa có ai góp hôm nay';
    ul.append(li);
  }
  for (const r of meritBoard.recent.slice(0, 8)) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = r.name || 'Một người ẩn danh';
    const time = document.createElement('small');
    time.textContent = new Date(r.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
    li.append(name, time);
    ul.append(li);
  }
}

async function openMeritDialog() {
  if (meritRun) {
    toast('Bạn đang đi tới thùng công đức…');
    return;
  }
  renderMerit();
  openModal('#modal-merit');
  if (online) {
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
  const spot = meritSpot(player);
  meritRun = { spot, anon: $('#merit-anon').checked, dedic, started: false };
  movePlayerTo(spot.x, spot.z);
});

// Cầm phong bì, chắp tay, phong bì bay vào khe thùng
function offerMerit(a, onDone) {
  a.busy = true;
  a.holdEnvelope(true);
  const c = world.merit.center;
  a.act('gassho', a.sitting ? null : Math.atan2(c.x - a.pos.x, c.z - a.pos.z));
  if (a !== player) bubble(a, 'góp công đức', 3000);
  setTimeout(() => {
    if (!avatars.has(a.id)) return;
    world.merit.drop(a.envelope.getWorldPosition(new THREE.Vector3()));
    a.holdEnvelope(false);
    setTimeout(() => {
      a.busy = false;
      if (a === player || a.pos.distanceTo(player.pos) < 9) sound.merit();
      onDone?.();
    }, 750);
  }, 1300);
}

// Chạy mỗi khung hình: tới thùng thì góp; đi chỗ khác thì hủy
function meritRitual() {
  if (!meritRun || meritRun.started) return;
  const g = player.goal;
  if (g && Math.hypot(g.x - meritRun.spot.x, g.z - meritRun.spot.z) > 0.01) {
    meritRun = null;
    toast('Đã hủy góp công đức');
    return;
  }
  if (player.moving) return;
  meritRun.started = true;
  const { anon, dedic } = meritRun;
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
  });
}

function ringInstrument(kind, by = null) {
  const obj = world.pickables.find((o) => o.userData.kind === kind);
  if (kind === 'bell') {
    sound.bigBell();
    obj.userData.swing = 1;
  } else {
    sound.drum();
    obj.userData.hit = 1;
  }
  if (by) bubble(by, kind === 'bell' ? 'thỉnh chuông' : 'đánh trống');
}

document.querySelectorAll('.actions button').forEach((b) => {
  b.addEventListener('click', () => {
    const act = b.dataset.act;
    skipIntro();
    if (act === 'gassho') {
      const near = nearestPerson(6);
      doGassho(near);
      if (!near) toast('Chưa có ai ở gần để chào — bạn lại gần một người nhé');
    }
    else if (act === 'bow') doBow();
    else if (act === 'incense') {
      sound.init();
      openIncenseDialog();
    } else if (act === 'merit') {
      sound.init();
      openMeritDialog();
    } else if (act === 'beads') {
      sound.init();
      beads.open();
    }
  });
});

const beads = new Beads($('#beads'), { sound, store, onClose: () => {} });
beads.onRound = () => earn('beads');

// Nghe tụng kinh: mỗi phút đang phát được ghi vào hồ sơ; đủ 10 phút thì được phước
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

// ---------- Camera & điều khiển ----------
const cam = { yaw: 0, pitch: 0.36, dist: 7.5, curDist: 15, curPitch: 0.7, maxZ: 45, target: new THREE.Vector3(0, 1.1, 31) };
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const pointers = new Map();
let dragDist = 0;
let pinch = null;

function setRay(x, y) {
  ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}

function pickAvatar() {
  let best = null, bestD = Infinity;
  const c = new THREE.Vector3();
  for (const a of avatars.values()) {
    if (a === player) continue;
    c.set(a.pos.x, 0.85 - 0.2 * a.p.sit, a.pos.z);
    const d = ray.ray.distanceToPoint(c);
    const along = c.clone().sub(ray.ray.origin).dot(ray.ray.direction);
    if (d < 0.5 && along > 0 && along < bestD) { best = a; bestD = along; }
  }
  return best;
}

function handleTap(x, y) {
  sound.init();
  if (intro) {
    skipIntro();
    return;
  }
  setRay(x, y);
  const hits = ray.intersectObjects(world.pickables, true);
  const avatarHit = pickAvatar();
  const firstHit = hits[0];
  if (avatarHit && (!firstHit || avatarHit.pos.distanceTo(firstHit.point) < 1.2 || camera.position.distanceTo(avatarHit.pos) < firstHit.distance)) {
    doGassho(avatarHit);
    return;
  }
  if (!firstHit) return;
  let o = firstHit.object;
  while (o && !o.userData.kind) o = o.parent;
  const kind = o?.userData.kind;
  if (kind === 'bell' || kind === 'drum') {
    ringInstrument(kind);
    net?.send({ t: 'act', a: kind });
    earnBell();
    return;
  }
  if (kind === 'merit') {
    openMeritDialog();
    return;
  }
  let seat = null;
  if (kind === 'seat') seat = seats[firstHit.instanceId];
  else {
    const p = firstHit.point;
    seat = seats.find((s) => Math.abs(s.x - p.x) < 0.7 && Math.abs(s.z - p.z) < 0.9) ?? null;
  }
  if (seat) {
    if (player.seat === seat.index) return;
    if (seatTaken(seat.index, player)) {
      toast('Bồ đoàn này đã có người ngồi');
      return;
    }
    movePlayerTo(seat.x, seat.z, seat);
  } else {
    movePlayerTo(firstHit.point.x, firstHit.point.z);
  }
  hideHint();
}

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) dragDist = 0;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: cam.dist };
    dragDist = 999;
  }
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) {
    if (e.pointerType === 'mouse') hover(e.clientX, e.clientY);
    return;
  }
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX;
  p.y = e.clientY;
  if (pointers.size === 1) {
    dragDist += Math.abs(dx) + Math.abs(dy);
    if (dragDist > 6) {
      cam.yaw -= dx * 0.0055;
      cam.pitch = clamp(cam.pitch + dy * 0.004, 0.04, 1.15);
      hideHint();
    }
  } else if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    cam.dist = clamp((pinch.dist * pinch.d) / Math.max(d, 1), 2.8, 18);
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
  cam.dist = clamp(cam.dist * (1 + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.0012), 2.8, 18);
}, { passive: false });

let hoverT = 0;
function hover(x, y) {
  const now = performance.now();
  if (now - hoverT < 60) return;
  hoverT = now;
  setRay(x, y);
  const hit = ray.intersectObjects(world.pickables, true)[0];
  let o = hit?.object;
  while (o && !o.userData.kind) o = o.parent;
  const k = o?.userData.kind;
  canvas.classList.toggle('can-pick', k === 'seat' || k === 'bell' || k === 'drum' || k === 'merit' || !!pickAvatar());
}

// Bàn phím (máy tính)
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || beads.isOpen || $('.modal.show')) return;
  const k = e.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
    keys.add(k);
    e.preventDefault();
    sound.init();
    hideHint();
  }
  if ((k === 'g' || k === 'b') && intro) skipIntro();
  if (k === 'g') doGassho();
  if (k === 'b') doBow();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());

let keySendT = 0;
function keyMove(t) {
  if (!keys.size) return;
  if (intro) skipIntro();
  let f = 0, s = 0;
  if (keys.has('w') || keys.has('arrowup')) f += 1;
  if (keys.has('s') || keys.has('arrowdown')) f -= 1;
  if (keys.has('a') || keys.has('arrowleft')) s -= 1;
  if (keys.has('d') || keys.has('arrowright')) s += 1;
  if (!f && !s) return;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
  const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const len = Math.hypot(f, s);
  const x = clamp(player.pos.x + ((fx * f + rx * s) / len) * 0.7, HALL.minX, HALL.maxX);
  const z = clamp(player.pos.z + ((fz * f + rz * s) / len) * 0.7, HALL.minZ, HALL.maxZ);
  player.walkTo(x, z);
  if (t - keySendT > 0.25) {
    keySendT = t;
    sendMove();
  }
}

function updateCamera(dt) {
  const k = 1 - Math.exp(-6 * dt);
  const want = new THREE.Vector3(player.root.position.x, player.root.position.y + 1.1 - 0.15 * player.p.sit, player.root.position.z);
  cam.target.lerp(want, k);
  cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  // ở ngoài sân / trên thềm thì camera được lùi ra ngoài chánh điện
  const outside = player.pos.z > HALL.maxZ;
  cam.maxZ += ((outside ? 45 : 18.6) - cam.maxZ) * (1 - Math.exp(-3 * dt));
  const cp = Math.cos(cam.curPitch);
  camera.position.set(
    clamp(cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist, -14.5, 14.5),
    clamp(cam.target.y + Math.sin(cam.curPitch) * cam.curDist, 0.4, outside ? 14 : 9.4),
    clamp(cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist, -15.2, cam.maxZ),
  );
  camera.lookAt(cam.target);
}

// ---------- Nhãn ----------
const v3 = new THREE.Vector3();
// lift: đẩy nhãn lên thêm (px, trước khi co theo khoảng cách); fade: mờ dần khi ở xa
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
  updateGains(now);
  for (const a of avatars.values()) {
    if (a === player) continue;
    if (a.nameEl) {
      a.nameEl.hidden = !settings.showNames;
      if (settings.showNames) placeLabel(a.nameEl, a, { fade: true });
    }
    if (!a.bubbleEl) continue;
    if (now > a.bubbleUntil) a.bubbleEl.classList.add('hidden');
    // khi đang hiện pháp danh, bong bóng hành động nằm ngay trên nhãn tên
    placeLabel(a.bubbleEl, a, { lift: settings.showNames ? 26 : 0, fade: true });
  }
}

// ---------- Giao diện ----------
const hintEl = $('#hint');
const baseHint = isCoarse
  ? 'Chạm sàn để đi · Kéo để nhìn quanh · Chụm hai ngón để phóng to'
  : 'Nhấp sàn để đi · Kéo để nhìn quanh · Lăn chuột để phóng to · W A S D để đi';
let hintT;
// ms = 0: hiện đến khi được thay
function showHint(text, ms) {
  hintEl.textContent = text;
  hintEl.classList.remove('hide');
  clearTimeout(hintT);
  if (ms) hintT = setTimeout(() => hintEl.classList.add('hide'), ms);
}
function hideHint() {
  if (intro) return;
  clearTimeout(hintT);
  hintT = setTimeout(() => hintEl.classList.add('hide'), 1500);
}

function openModal(id) {
  const m = $(id);
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('show'));
}
function closeModal(m) {
  m.classList.remove('show');
  // chỉ ẩn nếu chưa được mở lại trong lúc đang đóng
  setTimeout(() => !m.classList.contains('show') && (m.hidden = true), 250);
}
document.querySelectorAll('.modal').forEach((m) => {
  m.addEventListener('click', (e) => {
    if (m.dataset.locked == null && (e.target === m || e.target.closest('[data-close]'))) closeModal(m);
  });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.show:not([data-locked])').forEach(closeModal);
});

$('#btn-info').addEventListener('click', () => openModal('#modal-info'));

$('#btn-room').addEventListener('click', async () => {
  const list = $('#room-list');
  const render = (counts) => {
    list.innerHTML = '';
    for (const r of ROOMS) {
      const b = document.createElement('button');
      b.className = 'room' + (r.id === roomId ? ' current' : '');
      const c = counts?.find((x) => x.id === r.id)?.count;
      b.innerHTML = `<b></b><small>${r.id === roomId ? 'Bạn đang ở đây' : c != null ? `${c} người` : 'Vào chánh điện'}</small>`;
      b.querySelector('b').textContent = r.name;
      b.addEventListener('click', () => {
        closeModal($('#modal-room'));
        if (r.id !== roomId) {
          joinRoom(r.id);
          toast(`Đã vào ${r.name}`);
        }
      });
      list.append(b);
    }
  };
  render(null);
  const note = $('#room-note');
  note.hidden = online;
  note.textContent = 'Đang chạy ngoại tuyến — chưa có máy chủ, nên người trong chánh điện là khách mô phỏng.';
  openModal('#modal-room');
  if (online) render(await fetchRooms());
});

const muteBtn = $('#btn-mute');
const syncMute = () => muteBtn.classList.toggle('muted', settings.muted);
syncMute();
muteBtn.addEventListener('click', () => {
  sound.init();
  settings.muted = !settings.muted;
  sound.apply();
  syncMute();
  saveSettings();
});

const chantBtn = $('#btn-chant');
const caption = $('#chant-caption');
caption.innerHTML = CHANT_SYLLABLES.map((s) => `<span data-text="${s}">${s}</span>`).join('');
const capSpans = [...caption.querySelectorAll('span')];

// Hiệu ứng karaoke: chữ đang tụng tô vàng dần từ trái sang phải
function updateCaption() {
  if (caption.hidden) return;
  const pos = sound.karaoke();
  capSpans.forEach((s, k) => {
    const p = !pos ? 0 : pos.all ? 1 : k < pos.i ? 1 : k === pos.i ? pos.k : 0;
    s.style.setProperty('--p', p.toFixed(3));
    s.classList.toggle('on', !!pos && !pos.all && k === pos.i);
  });
}
chantBtn.addEventListener('click', () => {
  const on = chantBtn.getAttribute('aria-pressed') !== 'true';
  sound.setChant(on);
  if (on && settings.muted) {
    settings.muted = false;
    sound.apply();
    syncMute();
  }
  chantBtn.setAttribute('aria-pressed', on);
  chantBtn.querySelector('.txt').textContent = on ? 'Dừng tụng kinh' : 'Nghe tụng kinh';
  caption.hidden = !on;
  hintEl.classList.add('hide');
});
const chanting = () => chantBtn.getAttribute('aria-pressed') === 'true';

$('#btn-shot').addEventListener('click', () => {
  renderer.render(scene, camera);
  canvas.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `am-may-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
  const f = $('#flash');
  f.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
  toast('Đã lưu ảnh chụp');
});

// Cài đặt
{
  const nameIn = $('#set-name');
  const bind = (sel, key, prop = 'checked') => {
    const el = $(sel);
    el[prop] = settings[key];
    el.addEventListener('input', () => {
      settings[key] = prop === 'checked' ? el.checked : parseFloat(el.value);
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
    if (!q) return;
    settings.quality = q;
    world.setQuality(q);
    resize();
    syncQ();
    saveSettings();
  });
  // Chọn giọng tụng
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
  sound.recordingChecked.then(renderVoices);
  voiceSel.addEventListener('change', () => {
    settings.chantVoice = voiceSel.value;
    saveSettings();
    voiceStatus.textContent = sound.chantModeLabel();
    if (chanting()) sound.setChant(true);
  });

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

function setMyName(v) {
  myName = v;
  player.name = v;
  store.set('name', v);
  renderMyLabel();
  net?.send({ t: 'name', name: v });
}

// Lần đầu vào chùa: hỏi pháp danh (gợi ý sẵn một tên, có thể đổi)
function askName() {
  return new Promise((resolve) => {
    const m = $('#modal-welcome');
    const input = $('#welcome-name');
    input.value = myName;
    $('#welcome-suggest').onclick = () => {
      input.value = randomName();
      input.focus();
    };
    const done = (e) => {
      e?.preventDefault();
      setMyName(input.value.trim().slice(0, 20) || myName);
      closeModal(m);
      sound.init();
      resolve();
    };
    $('#welcome-form').onsubmit = done;
    openModal('#modal-welcome');
    setTimeout(() => !isCoarse && input.select(), 300);
  });
}

document.addEventListener('visibilitychange', () => sound.setHidden(document.hidden));

// ---------- Vòng lặp ----------
const clock = new THREE.Clock();
let elapsed = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  keyMove(elapsed);
  for (const a of avatars.values()) {
    const arrived = a.update(dt);
    if (arrived && a === player) sendMove();
  }
  botsThink(elapsed);
  incenseRitual();
  meritRitual();
  rack.update(dt);
  world.update(elapsed, dt);
  updateCamera(dt);
  if (!beads.isOpen) {
    renderer.render(scene, camera);
    updateLabels(performance.now());
    updateCaption();
  }
}

renderer.setAnimationLoop(frame);
// làm nóng shader rồi mới ẩn màn hình chờ
renderer.compile(scene, camera);
if (!savedName) {
  $('#loader').classList.add('done');
  await askName();
} else {
  setTimeout(() => $('#loader').classList.add('done'), 400);
}
await joinRoom(roomId);
