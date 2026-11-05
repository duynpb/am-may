// Trang khu Tam Chúc: đi dạo bờ hồ, qua cổng Tam Quan vào sân lớn, gặp mọi người cùng phòng.
// Dùng chung nhân vật, kết nối mạng, âm thanh, pháp danh và điểm phước với khu Am Mây.
import * as THREE from 'three';
import { buildTamChuc, groundY, WALK_AREAS, ROUND_OBSTACLES, SPAWN, LAND } from './world.js';
import { Avatar, ROBES } from '../avatar.js';
import { SANDAL_COLORS } from '../sandals.js';
import { Sound } from '../audio.js';
import { connect, fetchRooms, ROOMS, SITES, siteRooms, roomUrl } from '../net.js';

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
const myName = store.get('name', null) || `${pick(NOUNS)} ${pick(ADJS)}`;
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
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1400);
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
  const g = player.routeTo ?? player.goal ?? player.pos;
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: null });
}
function movePlayerTo(x, z) {
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
    net?.send({ t: 'karma', kind: 'greet' });
  }
}
// lạy về phía núi (các điện sẽ dựng trên sườn núi phía bắc)
function doBow() {
  sound.init();
  player.act('bow', Math.PI);
  sound.bow();
  net?.send({ t: 'act', a: 'bow' });
}
document.querySelectorAll('.actions button').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.act === 'gassho') {
    const near = nearestPerson(6);
    doGassho(near);
    if (!near) toast('Chưa có ai ở gần để chào — bạn lại gần một người nhé');
  } else if (b.dataset.act === 'bow') doBow();
}));

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
  const hit = ray.intersectObjects(world.pickables, false)[0];
  if (hit) movePlayerTo(hit.point.x, hit.point.z);
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
      cam.yaw -= dx * 0.0055;
      cam.pitch = clamp(cam.pitch + dy * 0.004, 0.04, 1.2);
      hideHint();
    }
  } else if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    cam.dist = clamp((pinch.dist * pinch.d) / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1), 3, 40);
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
  cam.dist = clamp(cam.dist * (1 + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.0012), 3, 40);
}, { passive: false });

const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || document.querySelector('.modal.show')) return;
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
  if (k === 'g') doGassho(nearestPerson(6));
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
  n.on('karma', (m) => {
    const e = m.entry;
    if (e?.phuoc) toast(`+${e.phuoc} phước · ${e.label}`, 2600);
    else if (e?.nghiep) toast(`+${e.nghiep} nghiệp · ${e.label}`, 2600);
  });
  n.on('count', (m) => {
    onlineCount = m.n;
    updateCount();
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
    return;
  }
  for (const id of [...avatars.keys()]) if (id !== 'me') removeAvatar(id);
  net = n;
  wireNet(n);
  n.welcome.peers.forEach(addRemote);
  onlineCount = n.welcome.peers.length + 1;
  updateCount();
  sendMove();
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
        h.textContent = r.site === 'tamchuc' ? 'Khu Tam Chúc — hồ lớn, cổng Tam Quan sát mặt nước' : `Khu ${SITES[r.site].name} — chánh điện, tháp, hành lang La Hán`;
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
let elapsed = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  keyMove(elapsed);
  for (const a of avatars.values()) {
    const arrived = a.update(dt);
    if (arrived && a === player) sendMove();
  }
  world.setFocus(player.pos.x, player.pos.z);
  world.update(elapsed, dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  updateLabels(performance.now());
});
renderer.compile(scene, camera);
setTimeout(() => $('#loader').classList.add('done'), 400);
showHint('Chào mừng đến khu Tam Chúc · đi dạo bờ hồ, qua cổng Tam Quan vào sân lớn · ' + baseHint, 9000);
join();
