import * as THREE from 'three';
import { buildWorld, HALL, BUDDHA, ENTRANCE } from './world.js';
import { Avatar, ROBES } from './avatar.js';
import { Sound, CHANT_SYLLABLES, vietnameseVoices } from './audio.js';
import { Beads } from './beads.js';
import { connect, fetchRooms, ROOMS } from './net.js';

const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('ammay.' + k);
      return v == null ? d : JSON.parse(v);
    } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('ammay.' + k, JSON.stringify(v)); } catch { /* chế độ riêng tư */ }
  },
};

const NOUNS = ['Mây', 'Sen', 'Trăng', 'Gió', 'Suối', 'Lá', 'Sương', 'Nắng', 'Trúc', 'Sóng', 'Hạt mưa', 'Cánh hạc', 'Bông súng', 'Ngọn đèn'];
const ADJS = ['an nhiên', 'lặng lẽ', 'thong thả', 'dịu dàng', 'hiền hòa', 'thanh tịnh', 'nhẹ nhàng', 'bình yên', 'tĩnh tại', 'ấm áp'];
const randomName = () => `${pick(NOUNS)} ${pick(ADJS)}`;

const isCoarse = matchMedia('(pointer: coarse)').matches;
const settings = Object.assign(
  { ambient: true, ambientVol: 0.45, chantVol: 0.5, fx: true, fxVol: 0.55, bg: false, quality: isCoarse ? 'low' : 'high', muted: false },
  store.get('settings', {}),
);
const saveSettings = () => store.set('settings', settings);
let myName = store.get('name', null) || randomName();
store.set('name', myName);
const myRobe = store.get('robe', Math.floor(Math.random() * ROBES.length));
store.set('robe', myRobe);

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

const sound = new Sound(settings);

// ---------- Nhân vật ----------
const avatars = new Map();
const labelsEl = $('#labels');

function addAvatar(a) {
  avatars.set(a.id, a);
  scene.add(a.root);
  return a;
}
function removeAvatar(id) {
  const a = avatars.get(id);
  if (!a) return;
  a.dispose();
  a.bubbleEl?.remove();
  avatars.delete(id);
}

const player = new Avatar({ id: 'me', name: myName, robe: myRobe, isPlayer: true });
addAvatar(player);
player.placeAt(ENTRANCE.x, ENTRANCE.z - 4, Math.PI);
player.labelEl = document.createElement('div');
player.labelEl.className = 'label';
labelsEl.append(player.labelEl);
const renderMyLabel = () => {
  player.labelEl.innerHTML = '<i>Tôi</i>';
  player.labelEl.append(myName);
};
renderMyLabel();

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
  const free = freeSeats();
  const seat = free.length ? pick(free) : null;
  if (seated && seat) a.sitAt(seat);
  else {
    a.placeAt(rnd(-1.5, 1.5), HALL.maxZ, Math.PI);
    if (seat) a.walkTo(seat.x, seat.z, seat);
    else a.walkTo(rnd(-8, 8), rnd(-4, 12));
  }
  a.brain = { next: elapsed + rnd(4, 30) };
  bots.add(a);
  updateCount();
  return a;
}

function botsThink(t) {
  for (const a of bots) {
    if (a.leaving && !a.moving) {
      bots.delete(a);
      removeAvatar(a.id);
      updateCount();
      continue;
    }
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
    if (t < a.brain.next || a.moving || a.leaving || a.busy) continue;
    a.brain.next = t + rnd(10, 45);
    const r = Math.random();
    if (r < 0.32) a.act('bow', faceBuddhaRy(a));
    else if (r < 0.55) {
      a.act('gassho');
      if (player.pos.distanceTo(a.pos) < 4.5) {
        a.act('gassho', a.sitting ? null : faceRy(a, player));
        bubble(a, a.name);
        socialToast(`${a.name} chắp tay chào bạn`);
      }
    } else if (r < 0.66) {
      const free = freeSeats(a);
      if (free.length) {
        const s = pick(free);
        a.walkTo(s.x, s.z, s);
      }
    } else if (r < 0.7) {
      a.leaving = true;
      a.walkTo(rnd(-1.5, 1.5), HALL.maxZ + 1);
    } else if (r < 0.78) {
      const spot = altarSpot(a);
      a.pendingIncense = Math.random() < 0.6 ? 3 : 1;
      a.walkTo(spot.x, spot.z);
    }
  }
  if (bots.size < botTarget && Math.random() < 0.004) makeBot({ seated: false });
  if (bots.size > botTarget && Math.random() < 0.01) {
    const a = pick([...bots].filter((b) => !b.leaving));
    if (a) {
      a.leaving = true;
      a.walkTo(rnd(-1.5, 1.5), HALL.maxZ + 1);
    }
  }
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

function clearOthers() {
  for (const id of [...avatars.keys()]) if (id !== 'me') removeAvatar(id);
  bots.clear();
}

function addRemote(p) {
  if (avatars.has('n' + p.id)) return;
  const a = addAvatar(new Avatar({ id: 'n' + p.id, name: p.name, robe: p.robe }));
  const seat = p.seat != null ? seats[p.seat] : null;
  if (seat) a.sitAt(seat);
  else a.placeAt(p.x, p.z, Math.PI);
}

function wireNet(n) {
  n.on('join', (m) => {
    addRemote(m.p);
    bubble(avatars.get('n' + m.p.id), m.p.name);
  });
  n.on('leave', (m) => removeAvatar('n' + m.id));
  n.on('move', (m) => {
    const a = avatars.get('n' + m.id);
    if (!a) return;
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
      bubble(a, a.name);
      if (toMe) toast(`${a.name} chắp tay chào bạn`);
    } else if (m.a === 'bow') {
      a.act('bow', faceBuddhaRy(a));
      bubble(a, `${a.name} · lạy Phật`);
    } else if (m.a === 'bell' || m.a === 'drum') {
      ringInstrument(m.a, a);
    } else if (m.a === 'incense') {
      offerIncense(a, m.n === 3 ? 3 : 1);
    }
  });
  n.on('name', (m) => {
    const a = avatars.get('n' + m.id);
    if (a) a.name = m.name;
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
  clearOthers();
  if (!keepPlayer) {
    player.placeAt(rnd(-1, 1), ENTRANCE.z - 4, Math.PI);
    cam.yaw = 0;
  }
  const n = await connect({ room: id, name: myName, robe: myRobe });
  if (roomId !== id) { n?.close(); return; }
  online = !!n;
  if (n) {
    net = n;
    wireNet(n);
    n.welcome.peers.forEach(addRemote);
    onlineCount = n.welcome.peers.length + 1;
    botTarget = fillTarget();
    sendMove();
  } else {
    botTarget = Math.floor(rnd(16, 30));
  }
  for (let i = 0; i < botTarget; i++) makeBot({ seated: Math.random() < 0.85 });
  $('#info-mode').textContent = online
    ? 'Bạn đang trực tuyến. Số trên góc phải là số người thật đang ở đây; khi chánh điện còn vắng, vài khách mô phỏng ngồi cùng cho ấm cúng và sẽ nhường chỗ khi có người vào.'
    : 'Đang chạy ngoại tuyến: những người trong chánh điện là khách mô phỏng. Chạy máy chủ (npm start) để gặp người thật.';
  updateCount();
}

function sendMove() {
  if (!net) return;
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

function doGassho(target = null) {
  sound.init();
  player.act('gassho', target && !player.sitting ? faceRy(player, target) : null);
  sound.gassho();
  net?.send({ t: 'act', a: 'gassho', to: target?.id?.startsWith('n') ? target.id.slice(1) : undefined });
  if (target) {
    toast(`Bạn chắp tay chào ${target.name}`);
    if (bots.has(target) && Math.random() < 0.8) {
      setTimeout(() => {
        if (!avatars.has(target.id)) return;
        target.act('gassho', target.sitting ? null : faceRy(target, player));
        bubble(target, target.name);
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
        bubble(b, b.name);
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
}

// ---------- Thắp nhang ----------
// Chọn chỗ đứng trước bàn thờ ít người nhất
function altarSpot(except) {
  const crowd = (s) => {
    let n = 0;
    for (const o of avatars.values()) {
      const p = o.goal ?? o.pos;
      if (o !== except && Math.hypot(p.x - s.x, p.z - s.z) < 0.5) n++;
    }
    return n;
  };
  const spots = [...world.incense.spots].sort(() => Math.random() - 0.5);
  return spots.reduce((b, s) => (crowd(s) < crowd(b) ? s : b));
}

// Cầm nhang, vái lạy, rồi cắm vào lư hương
function offerIncense(a, n, onDone) {
  a.busy = true;
  a.holdIncense(n);
  a.act('bow', faceBuddhaRy(a));
  if (a !== player) bubble(a, `${a.name} · thắp nhang`, 3600);
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
    ritual = null;
    incBtn.disabled = false;
    const st = incenseStats();
    st.today += n;
    st.total += n;
    store.set('incense', st);
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang`, 4200);
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
  if (by) bubble(by, `${by.name} · ${kind === 'bell' ? 'thỉnh chuông' : 'đánh trống'}`);
}

document.querySelectorAll('.actions button').forEach((b) => {
  b.addEventListener('click', () => {
    const act = b.dataset.act;
    if (act === 'gassho') doGassho();
    else if (act === 'bow') doBow();
    else if (act === 'incense') {
      sound.init();
      openIncenseDialog();
    } else if (act === 'beads') {
      sound.init();
      beads.open();
    }
  });
});

const beads = new Beads($('#beads'), { sound, store, onClose: () => {} });

// ---------- Camera & điều khiển ----------
const cam = { yaw: 0, pitch: 0.36, dist: 7.5, curDist: 15, curPitch: 0.7, target: new THREE.Vector3(0, 1.1, 14) };
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
  canvas.classList.toggle('can-pick', k === 'seat' || k === 'bell' || k === 'drum' || !!pickAvatar());
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
  if (k === 'g') doGassho();
  if (k === 'b') doBow();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());

let keySendT = 0;
function keyMove(t) {
  if (!keys.size) return;
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
  const want = new THREE.Vector3(player.root.position.x, 1.1 - 0.15 * player.p.sit, player.root.position.z);
  cam.target.lerp(want, k);
  cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  const cp = Math.cos(cam.curPitch);
  camera.position.set(
    clamp(cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist, -14.5, 14.5),
    clamp(cam.target.y + Math.sin(cam.curPitch) * cam.curDist, 0.4, 9.4),
    clamp(cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist, -15.2, 18.6),
  );
  camera.lookAt(cam.target);
}

// ---------- Nhãn ----------
const v3 = new THREE.Vector3();
function placeLabel(el, a, now) {
  a.labelAnchor(v3);
  v3.y += 0.15;
  v3.project(camera);
  const behind = v3.z > 1;
  const x = (v3.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v3.y * 0.5 + 0.5) * window.innerHeight;
  el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  el.style.visibility = behind ? 'hidden' : 'visible';
}
function updateLabels(now) {
  placeLabel(player.labelEl, player, now);
  for (const a of avatars.values()) {
    if (!a.bubbleEl) continue;
    if (now > a.bubbleUntil) a.bubbleEl.classList.add('hidden');
    placeLabel(a.bubbleEl, a, now);
  }
}

// ---------- Giao diện ----------
const hintEl = $('#hint');
hintEl.textContent = isCoarse
  ? 'Chạm sàn để đi · Kéo để nhìn quanh · Chụm hai ngón để phóng to'
  : 'Nhấp sàn để đi · Kéo để nhìn quanh · Lăn chuột để phóng to · W A S D để đi';
let hintHidden = false;
function hideHint() {
  if (hintHidden) return;
  hintHidden = true;
  setTimeout(() => hintEl.classList.add('hide'), 1500);
}
setTimeout(hideHint, 9000);

function openModal(id) {
  const m = $(id);
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('show'));
}
function closeModal(m) {
  m.classList.remove('show');
  setTimeout(() => (m.hidden = true), 250);
}
document.querySelectorAll('.modal').forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) closeModal(m);
  });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach(closeModal);
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

  $('#btn-settings').addEventListener('click', () => {
    nameIn.value = myName;
    renderVoices();
    openModal('#modal-settings');
  });
  nameIn.addEventListener('change', () => {
    const v = nameIn.value.trim().slice(0, 20);
    if (!v || v === myName) return;
    myName = v;
    player.name = v;
    store.set('name', v);
    renderMyLabel();
    net?.send({ t: 'name', name: v });
    toast(`Tên của bạn: ${v}`);
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
  world.update(elapsed, dt);
  updateCamera(dt);
  if (!beads.isOpen) {
    renderer.render(scene, camera);
    updateLabels(performance.now());
    updateCaption();
  }
}

await joinRoom(roomId);
renderer.setAnimationLoop(frame);
// làm nóng shader rồi mới ẩn màn hình chờ
renderer.compile(scene, camera);
setTimeout(() => $('#loader').classList.add('done'), 400);
