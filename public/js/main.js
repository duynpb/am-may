import * as THREE from 'three';
import { buildWorld, HALL, BUDDHA, ENTRANCE, COURTYARD, PORCH, TOWER, GATE, WALK_AREAS, CORRIDOR, WELL, BELLTOWER, QAHALL, groundY } from './world.js';
import { Avatar, ROBES } from './avatar.js';
import { SandalRack, SANDAL_COLORS } from './sandals.js';
import { LeafField } from './leaves.js';
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
const leaves = new LeafField(scene, { groundY, pushOut: world.pushOut });

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
  a.chatEl?.remove();
  a.nameEl?.remove();
  avatars.delete(id);
  rack.release(id);
}

const player = new Avatar({ id: 'me', name: myName, robe: myRobe, isPlayer: true });
player.setSandals(SANDAL_COLORS[mySandals]);
player.zone = 'in';
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

// Lời chat hiện trên đầu người nói trong 5 giây
const CHAT_MS = 5000;
function chatBubble(a, text) {
  if (!a.chatEl) {
    a.chatEl = document.createElement('div');
    a.chatEl.className = 'label chat hidden';
    labelsEl.append(a.chatEl);
  }
  a.chatEl.textContent = a === player || settings.showNames ? text : `${a.name}: ${text}`;
  a.chatEl.classList.remove('hidden');
  a.chatUntil = performance.now() + CHAT_MS;
}

function seatTaken(index, except) {
  for (const a of avatars.values()) {
    if (a === except) continue;
    if (a.seat === index || a.goalSeat?.index === index) return true;
  }
  return false;
}
const freeSeats = (except) => seats.filter((s) => !seatTaken(s.index, except));

// Trong / ngoài chánh điện: ranh giới là thềm
const zoneOf = (z, x) => (z > 19.3 || Math.abs(x) > HALL.maxX + 1.5 ? 'out' : 'in');
const zoneOfA = (a) => a.zone || 'in';
function clampZone(zone, x, z) {
  if (zone === 'in') return [clamp(x, HALL.minX, HALL.maxX), clamp(z, HALL.minZ, HALL.maxZ)];
  // ngoài chánh điện: kéo về vùng đi lại gần nhất (sân, trục đường, cổng, sân trước cổng)
  let best = null, bestD = Infinity;
  for (const r of WALK_AREAS) {
    const cx = clamp(x, r.minX, r.maxX), cz = clamp(z, r.minZ, r.maxZ);
    const d = Math.hypot(cx - x, cz - z);
    if (d < bestD) {
      bestD = d;
      best = [cx, cz];
    }
  }
  return world.pushOut(...best);
}

// Ngoài sân, các khu (sân chùa, trục đường, cổng, sân trước cổng, sân giếng, hành lang…) là các hình chữ nhật;
// hai khu chồng lên nhau ở đâu thì đó là chỗ đi qua lại. Đi xa thì tìm chuỗi khu ngắn nhất rồi đi qua các chỗ nối,
// gặp giếng Ngọc, bệ tượng Quan Âm hay chân tháp thì đi vòng.
const inRect = (r, x, z) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
const PORTALS = WALK_AREAS.map((a, i) => WALK_AREAS.map((b, j) => {
  if (i === j) return null;
  const r = { minX: Math.max(a.minX, b.minX), maxX: Math.min(a.maxX, b.maxX), minZ: Math.max(a.minZ, b.minZ), maxZ: Math.min(a.maxZ, b.maxZ) };
  return r.minX <= r.maxX && r.minZ <= r.maxZ ? r : null;
}));
function areaOf(x, z) {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < WALK_AREAS.length; i++) {
    const r = WALK_AREAS[i];
    if (inRect(r, x, z)) return i;
    const d = Math.hypot(x - clamp(x, r.minX, r.maxX), z - clamp(z, r.minZ, r.maxZ));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
const ROUND_OBSTACLES = [
  { x: WELL.x, z: WELL.z, r: WELL.r + 0.9 },
  { x: 10.6, z: 29.4, r: 3.0 }, // bệ tượng Quan Âm
  { x: TOWER.x, z: TOWER.z, r: TOWER.plinthR + 0.7 },
  { x: BELLTOWER.x, z: BELLTOWER.z, r: BELLTOWER.r + 0.5 },
  { x: 29.4, z: QAHALL.z1 - 0.2, r: 0.75 }, // cột mặt tiền điện Quan Âm
  { x: 34.6, z: QAHALL.z1 - 0.2, r: 0.75 },
];
// Đoạn thẳng a → b cắt qua chướng ngại tròn thì chèn điểm vòng qua bên cạnh
function detour(ax, az, bx, bz, depth = 0) {
  if (depth > 2) return [];
  for (const o of ROUND_OBSTACLES) {
    if (Math.hypot(ax - o.x, az - o.z) < o.r || Math.hypot(bx - o.x, bz - o.z) < o.r) continue;
    const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1;
    const t = clamp(((o.x - ax) * dx + (o.z - az) * dz) / L, 0, 1);
    const cx = ax + dx * t, cz = az + dz * t;
    let nx = cx - o.x, nz = cz - o.z;
    const d = Math.hypot(nx, nz);
    if (d >= o.r) continue;
    if (d < 1e-3) [nx, nz] = [-dz, dx];
    const n = Math.hypot(nx, nz);
    const w = [o.x + (nx / n) * (o.r + 0.3), o.z + (nz / n) * (o.r + 0.3)];
    return [...detour(ax, az, w[0], w[1], depth + 1), w, ...detour(w[0], w[1], bx, bz, depth + 1)];
  }
  return [];
}
function routeOut(fx, fz, tx, tz) {
  const s = areaOf(fx, fz), t = areaOf(tx, tz);
  // tìm chuỗi khu ngắn nhất (BFS)
  const prev = new Array(WALK_AREAS.length).fill(-1);
  prev[s] = s;
  const queue = [s];
  while (queue.length && prev[t] < 0) {
    const i = queue.shift();
    PORTALS[i].forEach((p, j) => {
      if (p && prev[j] < 0) {
        prev[j] = i;
        queue.push(j);
      }
    });
  }
  const chain = [];
  for (let i = t; prev[i] >= 0 && i !== s; i = prev[i]) chain.unshift(i);
  // qua chỗ nối giữa hai khu liên tiếp, thu vào trong 0,3 m cho khỏi sát mép
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
// Đi theo tuyến tới (x, z); xong khi tới nơi (true), bị lệnh đi khác chen ngang thì false
async function walkRoute(a, x, z, seat = null) {
  const token = (a.route = {});
  a.routeTo = { x, z, seat };
  for (const [px, pz] of routeOut(a.pos.x, a.pos.z, x, z)) {
    await a.walk(px, pz);
    if (a.route !== token) return false;
  }
  a.routeTo = null;
  a.walkTo(x, z, seat);
  return new Promise((res) => (a.onArrive = () => res(a.route === token)));
}
// Tháp 13 tầng: trong bán kính topR quanh tâm tháp là sàn tầng trên cùng (vẫn tính là ngoài sân)
const onTowerXZ = (x, z) => Math.hypot(x - TOWER.x, z - TOWER.z) < TOWER.topR;
const onTower = (a) => onTowerXZ(a.pos.x, a.pos.z);
// Giữ điểm đến trên tầng 13: trong lan can, trước bàn thờ
function clampTower(x, z) {
  const R = TOWER.walkR;
  let dx = Math.max(x - TOWER.x, TOWER.altarDx), dz = z - TOWER.z;
  const d = Math.hypot(dx, dz);
  if (d > R) {
    dx *= R / d;
    dz *= R / d;
  }
  if (dx < TOWER.altarDx) {
    dx = TOWER.altarDx;
    dz = Math.sign(dz) * Math.sqrt(R * R - dx * dx);
  }
  return [TOWER.x + dx, TOWER.z + dz];
}
// Trong điện Quan Âm (sân bên phía đông)
const inQaHall = (a) => a.pos.x > QAHALL.x0 && a.pos.x < QAHALL.x1 && a.pos.z > QAHALL.z0 && a.pos.z < QAHALL.z1 + 0.4;
// Nơi thắp nhang: trong chánh điện, ngoài sân (Quan Âm), trên tháp hay trong điện Quan Âm
const placeOf = (a) => (onTower(a) ? 'tower' : inQaHall(a) ? 'qahall' : zoneOfA(a));
const PLACE_KINDS = ['out', 'tower', 'qahall'];

// Hướng mặt về nơi thờ: tượng Phật trong chánh điện, tượng Quan Âm ngoài sân, tượng Phật trên tháp, tượng trong điện Quan Âm
const SHRINES = { tower: () => world.tower.buddha, qahall: () => world.qaHall.head, out: () => world.quanAm.head, in: () => BUDDHA };
const shrineOf = (a) => SHRINES[placeOf(a)]();
const faceShrineRy = (a) => {
  const t = shrineOf(a);
  return Math.atan2(t.x - a.pos.x, t.z - a.pos.z);
};
const burnerOf = (place) => ({ tower: world.incenseTop, qahall: world.incenseQH, out: world.incenseOut })[place] ?? world.incense;
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
    await walkRoute(a, clamp(slot.x, -3, 3), STEP_Z);
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
    // quay hẳn người lại phía dép (hướng ra sân)…
    a.faceRy = 0;
    await wait(500);
    if (!alive(a, token)) return false;
    // …cúi xuống xoay dép cho ngay ngắn, mũi dép hướng ra sân…
    a.act('stoop');
    await wait(550);
    rack.straighten(a.id, 0.9);
    await wait(1500);
    if (!alive(a, token)) return false;
    // …đứng lên, quay vào chánh điện rồi mới bước vào
    a.faceRy = Math.PI;
    await wait(450);
    if (!alive(a, token)) return false;
  } else {
    a.wearSandals(false);
  }
  a.script = null;
  return true;
}

// Đến chỗ để dép, mang dép vào rồi đi ra sân
async function exitTemple(a, dest = null) {
  const token = (a.script = {});
  const slot = rack.slotOf(a.id);
  if (slot && rack.has(a.id)) {
    // bị lấy dép (kể cả khi đang trên đường ra): không mang dép ra được, quay lại đứng chờ trước thềm
    if (!(await awaitSandal(a, token, dest))) return false;
    await a.walk(slot.x, slot.z - 0.75);
    if (!alive(a, token)) return false;
    if (!(await awaitSandal(a, token, dest))) return false;
    await a.walk(slot.x, slot.z);
    if (!alive(a, token)) return false;
    if (!(await awaitSandal(a, token, dest))) return false;
    rack.release(a.id);
    a.wearSandals(true);
    await wait(300);
    await a.walk(clamp(slot.x, -3, 3), STEP_Z);
  } else {
    a.wearSandals(true);
    await a.walk(rnd(-1.5, 1.5), STEP_Z);
  }
  if (!alive(a, token)) return false;
  await walkRoute(a, dest ? dest.x : rnd(-1.5, 1.5), dest ? dest.z : COURTYARD.z + 2);
  if (!alive(a, token)) return false;
  a.script = null;
  return true;
}

// Chỗ đứng chờ trước bậc thềm, nhìn thẳng ra đôi dép của mình
function sandalWaitSpot(a) {
  const slot = rack.slotOf(a.id);
  return clampZone('in', slot ? slot.x : 0, PORCH.z0 - 0.45);
}
function walkToSandalWait(a) {
  const [x, z] = sandalWaitSpot(a);
  a.walkTo(x, z);
  a.onArrive = () => (a.faceRy = 0);
  return [x, z];
}

// Mất một chiếc dép khi đang ra: trả về true nếu được đi tiếp.
// Khách mô phỏng đứng chờ trước thềm 10 giây rồi ra tiếp. Người chơi (và người thật khác)
// thôi không ra nữa: đứng trước thềm nhìn đôi dép, trong lúc chờ vẫn đi lại trong chánh điện được.
async function awaitSandal(a, token, dest) {
  if (!a.missingSandal || (a.leaving && !bots.has(a))) return true;
  if (bots.has(a)) {
    const [x, z] = sandalWaitSpot(a);
    await a.walk(x, z);
    if (!alive(a, token)) return false;
    a.faceRy = 0;
    bubble(a, 'mất một chiếc dép…', 10000);
    await wait(10000);
    if (!alive(a, token)) return false;
    a.missingSandal = false;
    rack.restore(a.id);
    return true;
  }
  a.script = null;
  walkToSandalWait(a);
  if (a === player) {
    player.queued = null;
    blockedExit(dest);
    sendMove();
  }
  return false;
}

// Màn hình tối dần khi người chơi lên / xuống tháp
const fadeEl = $('#fade');
function fadeTo(on, text = '') {
  if (text) fadeEl.textContent = text;
  fadeEl.classList.toggle('on', on);
  return wait(450);
}

// Vào cửa tháp, leo lên tầng 13. Trả về false nếu bị ngắt giữa chừng.
async function towerUp(a) {
  const token = (a.script = {});
  await walkRoute(a, TOWER.door.x, TOWER.door.z);
  if (!alive(a, token)) return false;
  await a.walk(TOWER.inside.x, TOWER.inside.z);
  if (!alive(a, token)) return false;
  a.root.visible = false;
  if (a === player) await fadeTo(true, 'Đang lên tầng 13…');
  await wait(a === player ? 600 : 1500);
  a.root.visible = true;
  if (!alive(a, token)) return false;
  a.placeAt(TOWER.arrive.x, TOWER.arrive.z, -Math.PI / 2);
  if (a === player) fadeTo(false);
  a.script = null;
  return true;
}

// Từ tầng 13 xuống, ra tới trước cửa tháp
async function towerDown(a) {
  const token = (a.script = {});
  await a.walk(TOWER.arrive.x, TOWER.arrive.z);
  if (!alive(a, token)) return false;
  a.root.visible = false;
  if (a === player) await fadeTo(true, 'Đang xuống tháp…');
  await wait(a === player ? 600 : 1500);
  a.root.visible = true;
  if (!alive(a, token)) return false;
  a.placeAt(TOWER.inside.x, TOWER.inside.z, Math.PI / 2);
  if (a === player) fadeTo(false);
  await a.walk(TOWER.door.x, TOWER.door.z);
  if (!alive(a, token)) return false;
  a.script = null;
  return true;
}

// Đi qua thềm giữa trong và ngoài chánh điện: ra thì mang dép, vào thì cởi dép xếp ngay ngắn.
// Lên / xuống tháp nếu điểm đến hoặc chỗ đang đứng là tầng 13.
async function crossZone(a, x, z, seat = null) {
  if (onTower(a) && !onTowerXZ(x, z)) {
    if (!(await towerDown(a))) return false;
  }
  if (onTowerXZ(x, z)) {
    if (!onTower(a)) {
      if (zoneOfA(a) === 'in' && !(await crossZone(a, TOWER.door.x, TOWER.door.z))) return false;
      if (!(await towerUp(a))) return false;
    }
    a.walkTo(...clampTower(x, z));
    return true;
  }
  const target = zoneOf(z, x);
  if (target === zoneOfA(a)) {
    // vừa xuống tháp, điểm đến vẫn ở ngoài sân
    [x, z] = clampZone(target, x, z);
    walkRoute(a, x, z, seat);
    return true;
  }
  [x, z] = clampZone(target, x, z);
  if (target === 'out') {
    a.seat = null;
    if (!(await exitTemple(a, { x, z }))) return false;
    a.zone = 'out';
  } else {
    if (!(await enterTemple(a))) return false;
    a.zone = 'in';
    a.walkTo(x, z, seat);
  }
  return true;
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
    if (a.leaving || a.script || a.trip) continue;
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
    if (r < 0.32) a.act('bow', faceShrineRy(a));
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
    } else if (r < 0.88) {
      botGardenTrip(a);
    }
  }
  if (bots.size < botTarget && Math.random() < 0.004) makeBot({ seated: false });
  if (bots.size > botTarget && Math.random() < 0.01) {
    const a = pick([...bots].filter((b) => !b.leaving && !b.script && !b.busy));
    if (a) botLeave(a);
  }
}

// Khách mô phỏng ra sân: mang dép, thắp nhang dâng Quan Âm, ngắm hồ sen rồi vào lại chánh điện
async function botGardenTrip(a) {
  a.trip = true;
  const spot = leastCrowded(world.incenseOut.spots, a);
  if (!(await crossZone(a, spot.x, spot.z))) return (a.trip = false);
  await wait(rnd(500, 1500));
  if (!avatars.has(a.id) || a.leaving) return;
  await new Promise((res) => offerIncense(a, Math.random() < 0.6 ? 3 : 1, res, 'out'));
  await wait(rnd(3000, 8000));
  if (!avatars.has(a.id) || a.leaving || a.script) return;
  if (Math.random() < 0.6) {
    const [px, pz] = pick([[7.6, 35.4], [10.8, 38.3], [14.0, 35.8]]);
    await a.walk(px, pz);
    await wait(rnd(4000, 10000));
    if (!avatars.has(a.id) || a.leaving || a.script) return;
  }
  const s = pick(freeSeats(a));
  await crossZone(a, s ? s.x : rnd(-6, 6), s ? s.z : 10, s ?? null);
  a.trip = false;
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
  if (p.missing) {
    a.missingSandal = true;
    rack.takeOne(a.id);
  }
  a.setSandals(SANDAL_COLORS[(p.sandals ?? +p.id) % SANDAL_COLORS.length]);
  if (p.broom) a.holdBroom(true);
  if (entering) {
    a.zone = 'out';
    a.placeAt(rnd(-1.5, 1.5), COURTYARD.z, Math.PI);
    enterTemple(a).then((ok) => {
      if (!ok) return;
      a.zone = 'in';
      a.walkTo(rnd(-1.5, 1.5), ENTRANCE.z - 4);
    });
    return;
  }
  if (zoneOf(p.z, p.x) === 'out') {
    // đang ở ngoài sân: mang dép, không có dép trên thềm
    a.zone = 'out';
    a.wearSandals(true);
    a.placeAt(p.x, p.z, Math.PI);
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
    const seat = m.seat != null ? seats[m.seat] : null;
    if (seat) yieldSeat(seat.index);
    // đổi vùng (hoặc đang mang/cởi dép dở) → đi qua thềm cho đúng
    if (m.w) warpPlace(a, m.x, m.z);
    else if (a.script || zoneOfA(a) !== zoneOf(m.z, m.x) || onTower(a) !== onTowerXZ(m.x, m.z)) crossZone(a, m.x, m.z, seat);
    else if (zoneOfA(a) === 'out' && !onTower(a)) walkRoute(a, m.x, m.z, seat);
    else a.walkTo(m.x, m.z, seat);
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
      a.act('bow', faceShrineRy(a));
      bubble(a, 'lạy Phật');
    } else if (m.a === 'bell' || m.a === 'drum') {
      ringInstrument(m.a, a);
    } else if (m.a === 'incense') {
      offerIncense(a, m.n === 3 ? 3 : 1, null, PLACE_KINDS.includes(m.place) ? m.place : 'in');
    } else if (m.a === 'greatbell') {
      ringGreatBell(a);
    }
  });
  n.on('merit', (m) => {
    Object.assign(meritBoard, { total: m.total, recent: m.recent });
    renderMerit();
    const a = avatars.get('n' + m.id);
    if (a && !a.leaving) offerMerit(a);
  });
  n.on('karma', (m) => showGain(m.entry));
  n.on('leaves', (m) => {
    if (m.add) leaves.add(m.add);
    if (m.gone) {
      const a = avatars.get('n' + m.by);
      leaves.remove(m.gone, a?.pos.x, a?.pos.z);
    }
  });
  n.on('broom', (m) => avatars.get('n' + m.id)?.holdBroom(m.on));
  n.on('chat', (m) => {
    const a = avatars.get('n' + m.id);
    if (a) chatBubble(a, m.text);
  });
  n.on('sandal-taken', (m) => {
    if (m.id === n.welcome.id) {
      if (player.missingSandal) return;
      if (!rack.has('me')) {
        // dép đã mang vào chân trước khi tin tới: coi như không lấy được, trả lại ngay
        n.send({ t: 'sandal-return' });
        return;
      }
      player.missingSandal = true;
      rack.takeOne('me');
      const by = avatars.get('n' + m.by);
      toast(`${by ? by.name : 'Ai đó'} đã lấy mất một chiếc dép của bạn!`, 4000);
      return;
    }
    const a = avatars.get('n' + m.id);
    if (a) a.missingSandal = true;
    rack.takeOne('n' + m.id);
  });
  n.on('sandal-returned', (m) => {
    const a = avatars.get('n' + m.id);
    if (a) a.missingSandal = false;
    rack.restore('n' + m.id);
  });
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
    leaves.reset(n.welcome.leaves || []);
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
    leaves.reset(makeLeaves(45));
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
  player.holdBroom(false);
  broomRun = null;
  rack.release('me');
  player.missingSandal = false;
  clearInterval(sandalTimer);
  sandalTimer = null;
  pendingExit = null;
  player.zone = 'out';
  player.placeAt(rnd(-1, 1), COURTYARD.z, Math.PI);
  cam.yaw = 0;
  showHint('Để dép ngay ngắn ở thềm trước khi vào chánh điện · chạm màn hình để bỏ qua', 0);
  enterTemple(player).then((ok) => {
    if (!ok || !intro) return;
    intro = false;
    player.zone = 'in';
    movePlayerTo(rnd(-1, 1), ENTRANCE.z - 4);
    showHint(baseHint, 8000);
  });
}
function skipIntro() {
  if (!intro) return;
  intro = false;
  cancelScript(player);
  player.zone = 'in';
  player.placeAt(rnd(-1, 1), ENTRANCE.z - 4, Math.PI);
  sendMove();
  showHint(baseHint, 8000);
}

function sendMove() {
  if (!net || intro || player.script) return;
  const g = player.routeTo ?? player.goal ?? player.pos;
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: player.goalSeat?.index ?? player.seat ?? null });
}

// ---------- Hành động ----------
function movePlayerTo(x, z, seat = null) {
  player.routeTo = null;
  if (player.script) {
    // đang mang / cởi dép ở thềm: nhớ chỗ vừa chọn, làm xong sẽ đi tới
    player.queued = { x, z, seat };
    world.showMarker(x, z, groundY(x, z) + 0.04);
    return;
  }
  const target = zoneOf(z, x);
  if (zoneOfA(player) !== target && target === 'out' && player.missingSandal) {
    // chưa ra được: đến đứng trước thềm nhìn đôi dép, có dép thì tự ra tiếp
    const [wx, wz] = walkToSandalWait(player);
    world.showMarker(wx, wz, groundY(wx, wz) + 0.04);
    blockedExit({ x, z, seat });
    sendMove();
    return;
  }
  pendingExit = null; // đi chỗ khác trong lúc chờ: thôi tự ra khi có dép
  if (onTower(player) && onTowerXZ(x, z)) {
    // đi lại trên tầng 13
    [x, z] = clampTower(x, z);
    player.walkTo(x, z);
    world.showMarker(x, z, TOWER.topY + 0.04);
    sendMove();
    return;
  }
  if (onTower(player) || onTowerXZ(x, z)) {
    // lên hoặc xuống tháp: báo đích đến trước để người khác thấy mình đi
    const up = !onTower(player);
    net?.send({ t: 'move', x: +x.toFixed(2), z: +z.toFixed(2), seat: seat?.index ?? null });
    toast(up ? 'Vào tháp, lên tầng 13…' : 'Xuống tháp…', 2600);
    player.queued = null;
    crossZone(player, x, z, seat).then((ok) => {
      if (!ok) return;
      if (up) toast('Bạn đang ở tầng 13 — có thể lạy Phật, thắp nhang và ngắm toàn cảnh chùa', 4500);
      sendMove();
      goQueued();
    });
    return;
  }
  if (zoneOfA(player) !== target) {
    // đi qua thềm: báo đích đến trước để người khác thấy mình ra / vào
    [x, z] = clampZone(target, x, z);
    world.showMarker(x, z, groundY(x, z) + 0.04);
    net?.send({ t: 'move', x: +x.toFixed(2), z: +z.toFixed(2), seat: seat?.index ?? null });
    toast(target === 'out' ? 'Mang dép vào rồi ra sân…' : 'Để dép ngay ngắn trên thềm rồi vào chánh điện…', 2600);
    if (target === 'in' && player.hasBroom) {
      setBroom(false);
      toast('Đã cất chổi về giá trước khi vào chánh điện', 2600);
    }
    player.queued = null;
    crossZone(player, x, z, seat).then((ok) => {
      if (ok && target === 'out') toast('Bạn đang ở ngoài sân — có thể thắp nhang dâng Quan Âm Bồ Tát', 3600);
      if (ok) goQueued();
    });
    return;
  }
  [x, z] = clampZone(target, x, z);
  if (target === 'out') walkRoute(player, x, z);
  else player.walkTo(x, z, seat);
  world.showMarker(x, z, groundY(x, z) + (seat ? 0.21 : 0.04));
  sendMove();
}

// ---------- Quét sân: lấy chổi ở giá góc sân, đi đến đâu lá sạch đến đó ----------
let broomRun = null; // đang đi tới giá chổi để lấy / cất
let sweepBuf = [], sweepWait = 0, leafSeq = 1e6;

// Lá rụng khi chạy ngoại tuyến (trực tuyến thì máy chủ gửi)
function makeLeaves(n) {
  return Array.from({ length: n }, () => [leafSeq++, rnd(-15, 15), rnd(23, 38.5), rnd(0, 6.28), Math.floor(rnd(0, 4))]);
}
setInterval(() => {
  if (!net && leaves.resting < 90) leaves.add(makeLeaves(1 + Math.floor(rnd(0, 3))));
}, 10000);

function setBroom(on) {
  player.holdBroom(on);
  net?.send({ t: 'broom', on });
}

function clickBroom() {
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  const s = world.broom.spot;
  broomRun = { spot: s, take: !player.hasBroom, started: false };
  movePlayerTo(s.x, s.z); // đang ở trong chánh điện thì tự mang dép ra sân
  hideHint();
}

// Chạy mỗi khung hình: tới giá chổi thì cúi xuống lấy / dựng chổi; đi chỗ khác thì thôi
function broomRitual() {
  if (!broomRun || broomRun.started || player.script) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - broomRun.spot.x, g.z - broomRun.spot.z) > 0.3) {
    broomRun = null;
    return;
  }
  if (player.moving || player.routeTo) return;
  if (zoneOfA(player) !== 'out' || player.pos.distanceTo(broomRun.spot) > 0.6) {
    broomRun = null;
    return;
  }
  broomRun.started = true;
  const c = world.broom.center;
  player.act('stoop', Math.atan2(c.x - player.pos.x, c.z - player.pos.z));
  setTimeout(() => {
    const take = broomRun?.take;
    broomRun = null;
    if (take == null) return;
    setBroom(take);
    if (take) toast(leaves.resting ? 'Đã cầm chổi — đi quanh sân để quét lá. Chạm vào giá chổi để cất chổi' : 'Đã cầm chổi — sân đang sạch, chờ lá rụng thêm nhé', 4500);
    else toast('Đã dựng chổi lại giá. Cảm ơn bạn đã quét sân chùa', 3500);
  }, 700);
}

// Cầm chổi bước đi: đầu chổi lướt qua đâu, lá ở đó bay đi
const tipV = new THREE.Vector3();
function sweepLeaves(dt) {
  sweepWait -= dt;
  if (player.hasBroom && player.p.walk > 0.3 && zoneOfA(player) === 'out' && !onTower(player)) {
    player.broomTip(tipV);
    const ids = leaves.takeNear(tipV.x, tipV.z, 0.6);
    if (ids.length) {
      sweepBuf.push(...ids);
      if (!leaves.resting) setTimeout(() => !leaves.resting && toast('Sân chùa đã sạch lá — công đức của bạn', 3500), 600);
    }
  }
  if (!sweepBuf.length || sweepWait > 0) return;
  const ids = sweepBuf.splice(0, 12);
  sweepWait = 0.35;
  if (net) net.send({ t: 'sweep', ids });
  else earn('sweep', { n: ids.length });
}

// ---------- Bản đồ chùa và đi nhanh ----------
const PLACES = [
  { id: 'hall', name: 'Chánh điện', x: 0, z: 9 },
  { id: 'quanam', name: 'Sân Quan Âm', x: world.quanAm.front.x, z: world.quanAm.front.z },
  { id: 'tower', name: 'Tháp 13 tầng', x: TOWER.arrive.x, z: TOWER.arrive.z },
  { id: 'lahan', name: 'Hành lang La Hán', x: 14.5, z: 46, ry: Math.PI / 2 },
  { id: 'well', name: 'Giếng Ngọc', x: 0, z: WELL.z - 4.3, ry: 0 },
  { id: 'bell', name: 'Gác chuông', x: BELLTOWER.x, z: BELLTOWER.z + BELLTOWER.r + 0.6, ry: Math.PI },
  { id: 'qahall', name: 'Điện Quan Âm', x: QAHALL.cx, z: 12, ry: Math.PI },
  { id: 'gate', name: 'Cổng Tam Quan', x: 0, z: GATE.plazaZ },
];

// Hiện ngay ở chỗ mới: tự mang / cởi dép nếu đổi giữa trong và ngoài chánh điện
function warpPlace(a, x, z, ry = null) {
  const to = zoneOf(z, x), from = zoneOfA(a);
  a.script = null;
  a.route = null;
  a.routeTo = null;
  a.seat = null;
  a.goalSeat = null;
  a.root.visible = true;
  if (to === 'out' && from === 'in') {
    rack.release(a.id);
    a.wearSandals(true);
  } else if (to === 'in' && from === 'out') {
    a.wearSandals(false);
    rack.place(a.id, a.sandalColors);
  }
  a.zone = to;
  a.placeAt(x, z, Math.PI);
  if (ry != null) a.ry = ry;
  else if (z < GATE.z && z < 40) a.ry = faceShrineRy(a);
}

let traveling = false;
async function quickTravel(p) {
  closeModal($('#modal-map'));
  if (intro) skipIntro();
  if (traveling || player.script || player.busy || ritual?.started || meritRun?.started || broomRun?.started) {
    toast('Đợi một chút rồi đi nhé');
    return;
  }
  if (player.missingSandal && zoneOfA(player) === 'in' && zoneOf(p.z, p.x) === 'out') {
    movePlayerTo(p.x, p.z); // chưa có dép: đứng chờ trước thềm như khi đi bộ ra
    return;
  }
  // hủy các việc đang đi tới làm dở
  if (ritual) {
    ritual = null;
    incBtn.disabled = false;
  }
  meritRun = null;
  broomRun = null;
  pendingExit = null;
  player.queued = null;
  traveling = true;
  await fadeTo(true, `Đang đến ${p.name}…`);
  if (zoneOf(p.z, p.x) === 'in' && player.hasBroom) setBroom(false);
  warpPlace(player, p.x, p.z, p.ry);
  cam.target.set(player.root.position.x, player.root.position.y + 1.1, player.root.position.z);
  cam.yaw = player.ry + Math.PI; // camera sau lưng, nhìn theo hướng nhân vật
  net?.send({ t: 'move', x: +p.x.toFixed(2), z: +p.z.toFixed(2), seat: null, w: 1 });
  await wait(150);
  fadeTo(false);
  traveling = false;
  toast(`Bạn đang ở ${p.name}`, 2600);
}

// Bản đồ vẽ nằm ngang: bên trái là cổng Tam Quan, bên phải là chánh điện
const SVGNS = 'http://www.w3.org/2000/svg';
const mapU = (z) => 100 - z, mapV = (x) => x;
let mapOpen = false;
let mapMe = null, mapOthers = null;
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
  el('rect', { x: 0, y: -45, width: 124, height: 90, class: 'm-bg' });
  for (const s of [-1, 1]) {
    rect(s > 0 ? 21 : -43, s > 0 ? 43 : -21, 18, 40, 'm-stone'); // sân bên
    rect(s > 0 ? 15.5 : -21.5, s > 0 ? 21.5 : -15.5, 22.6, 24.4, 'm-stone'); // lối sang sân bên
  }
  rect(QAHALL.x0, QAHALL.x1, QAHALL.z0, QAHALL.z1, 'm-hall');
  el('rect', { x: mapU(BELLTOWER.z + 4.5), y: mapV(BELLTOWER.x - 4.5), width: 9, height: 9, class: 'm-hall' });
  rect(-17, 17, 22.4, 39.5, 'm-stone'); // sân chùa
  rect(-3.5, 3.5, 39.4, GATE.z, 'm-stone'); // trục đường
  rect(-13, 13, GATE.z + 1, 99, 'm-stone'); // sân trước cổng
  rect(-5, 5, WELL.z - 5, WELL.z + 5, 'm-stone'); // sân giếng
  for (const s of [-1, 1]) {
    el('ellipse', { cx: mapU(61), cy: mapV(s * 9.2), rx: 16, ry: 3.6, class: 'm-water' }); // hồ sen
    rect(s > 0 ? CORRIDOR.x0 : -CORRIDOR.x1, s > 0 ? CORRIDOR.x1 : -CORRIDOR.x0, CORRIDOR.z0, CORRIDOR.z1, 'm-corridor');
    rect(s > 0 ? 3.4 : -13.6, s > 0 ? 13.6 : -3.4, 79, 81, 'm-stone'); // lối ngang
  }
  el('circle', { cx: mapU(WELL.z), cy: mapV(WELL.x), r: WELL.r, class: 'm-water' });
  el('circle', { cx: mapU(31.8), cy: mapV(11.3), r: 6.6, class: 'm-grass' });
  el('circle', { cx: mapU(TOWER.z), cy: mapV(TOWER.x), r: 6.2, class: 'm-grass' });
  el('ellipse', { cx: mapU(35.6), cy: mapV(10.9), rx: 1.7, ry: 2.6, class: 'm-water' });
  rect(-15, 15, -21, 19, 'm-hall'); // chánh điện
  rect(-9, 9, 19, 21.6, 'm-porch'); // thềm
  rect(-20, 20, GATE.z - 0.4, GATE.z + 0.4, 'm-wall'); // tường cổng
  el('circle', { cx: mapU(29.4), cy: mapV(10.6), r: 2.4, class: 'm-statue' });
  el('circle', { cx: mapU(TOWER.z), cy: mapV(TOWER.x), r: 3.4, class: 'm-tower' });
  const labels = [
    ['hall', 0, 2, 'Chánh điện'],
    ['quanam', 15.4, 29.4, 'Quan Âm'],
    ['tower', -15.2, 30, 'Tháp 13 tầng'],
    ['gate', 0, GATE.z + 7, 'Tam Quan'],
    ['well', 0, WELL.z + 6.5, 'Giếng Ngọc'],
    ['bell', BELLTOWER.x, BELLTOWER.z, 'Gác chuông'],
    ['qahall', QAHALL.cx, 11, 'Điện Quan Âm'],
    ['lahan', 15.6, 62, 'La Hán'],
    ['lahan', -15.6, 62, 'La Hán'],
  ];
  for (const [id, x, z, text] of labels) {
    const g = el('g', { class: 'm-place', role: 'button', tabindex: 0 });
    const t = el('text', { x: mapU(z), y: mapV(x) + 1.1, 'text-anchor': 'middle' }, g);
    t.textContent = text;
    const go = () => quickTravel(PLACES.find((p) => p.id === id));
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => e.key === 'Enter' && go());
  }
  mapOthers = el('g', {});
  mapMe = el('circle', { r: 1.4, class: 'm-me' });
}
function updateMap() {
  mapMe.setAttribute('cx', mapU(player.pos.z));
  mapMe.setAttribute('cy', mapV(player.pos.x));
  const others = [...avatars.values()].filter((a) => a !== player && !a.leaving);
  while (mapOthers.childElementCount < others.length) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', 0.8);
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
function openMap() {
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
}
$('#btn-map').addEventListener('click', openMap);
$('#modal-map').addEventListener('transitionend', () => {
  mapOpen = $('#modal-map').classList.contains('show');
});

// ---------- Lấy dép (đùa vui) ----------
// Bấm vào dép của người khác trên thềm để lấy đi một chiếc
function takeSandal(owner) {
  if (owner === 'me') {
    toast('Đây là dép của bạn');
    return;
  }
  const a = avatars.get(owner);
  if (!a) return;
  if (!rack.takeOne(owner)) {
    toast(`Dép của ${a.name} đã mất một chiếc rồi`);
    return;
  }
  a.missingSandal = true;
  sound.bead();
  toast(`Bạn đã lấy một chiếc dép của ${a.name}`);
  // người thật: máy chủ ghi nghiệp khi nhận lệnh lấy dép; khách mô phỏng: tự ghi
  if (owner.startsWith('n') && net) net.send({ t: 'take-sandal', id: owner.slice(1) });
  else earn('steal');
}

// Mất dép mà muốn ra ngoài: chặn lại, đếm ngược 10 giây rồi dép được trả lại.
// Chỉ bắt đầu đếm khi người chơi định ra ngoài.
let sandalTimer = null, sandalLeft = 0, pendingExit = null;
const showSandalWait = () => toast(`Phật tử đã bị mất dép — chờ ${sandalLeft} giây để dép được trả lại`, 1300);
// Bị chặn ở thềm: nhớ chỗ định ra để khi có dép thì tự đi tiếp (nếu chưa đi chỗ khác)
function blockedExit(dest) {
  pendingExit = dest ? { x: dest.x, z: dest.z, seat: dest.seat ?? null } : null;
  sandalWait();
}
function sandalWait() {
  if (sandalTimer) return showSandalWait();
  sandalLeft = 10;
  showSandalWait();
  sandalTimer = setInterval(() => {
    sandalLeft--;
    if (sandalLeft > 0) return showSandalWait();
    clearInterval(sandalTimer);
    sandalTimer = null;
    player.missingSandal = false;
    rack.restore('me');
    net?.send({ t: 'sandal-return' });
    toast('Dép đã được trả lại — bạn có thể ra ngoài', 3500);
    const go = pendingExit;
    pendingExit = null;
    if (go && !player.sitting && !player.script) movePlayerTo(go.x, go.z, go.seat);
  }, 1000);
}

// Đi tới chỗ người chơi đã chọn trong lúc đang mang / cởi dép
function goQueued() {
  const q = player.queued;
  player.queued = null;
  if (q) movePlayerTo(q.x, q.z, q.seat);
}

// Gỡ kẹt: nếu đoạn mang / cởi dép đứng yên quá lâu (bị ngắt giữa chừng), trả nhân vật về trạng thái bình thường
let scriptStill = 0;
function scriptWatchdog(dt) {
  if (!player.script || intro || player.moving || player.busy || player.action) {
    scriptStill = 0;
    return;
  }
  scriptStill += dt;
  if (scriptStill < 6) return;
  scriptStill = 0;
  player.script = null;
  player.zone = zoneOf(player.pos.z, player.pos.x);
  const out = player.zone === 'out';
  player.wearSandals(out);
  if (out) rack.release('me');
  else if (!rack.has('me')) rack.place('me', player.sandalColors);
  sendMove();
  goQueued();
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
  player.act('bow', faceShrineRy(player));
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
  // một ô duy nhất: phước trừ nghiệp
  const score = p.phuoc - p.nghiep;
  const box = el('div', 'pf-score ' + (score < 0 ? 'nghiep' : 'phuoc'));
  box.append(el('b', null, score.toLocaleString('vi-VN')), el('span', null, 'Điểm phước nghiệp'));
  scores.append(box);
  const s = p.stats;
  const stats = el('div', 'pf-stats');
  for (const [label, val] of [
    ['Lạy Phật', s.bow], ['Chào bạn đạo', s.greet], ['Nén nhang', s.incense],
    ['Góp công đức', s.merit], ['Chuỗi 108 hạt', s.beads], ['Phút tụng kinh', s.chantMin ?? (s.chant || 0) * 10],
    ['Lá đã quét', s.leaves], ['Thỉnh chuông, trống', s.bell], ['Lần vào chùa', p.visits],
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
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  const st = incenseStats();
  $('#inc-stats').textContent = st.today ? `Hôm nay bạn đã thắp ${st.today} nén nhang.` : '';
  const place = placeOf(player);
  $('#inc-title').textContent = { tower: 'Thắp nhang dâng Phật trên tháp', qahall: 'Thắp nhang trong điện Quan Âm', out: 'Thắp nhang dâng Quan Âm Bồ Tát' }[place] ?? 'Thắp nhang';
  $('#modal-incense .muted').textContent = {
    tower: 'Bạn sẽ bước tới trước bàn thờ trên tầng 13, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
    qahall: 'Bạn sẽ bước tới trước bàn thờ Quan Âm Bồ Tát trong điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
    out: 'Bạn sẽ bước tới lư hương đá trước tượng Quan Âm, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
  }[place] ?? 'Bạn sẽ bước lên trước bàn thờ, chắp tay vái lạy rồi cắm nhang vào lư hương. Nhang cháy khoảng ba phút, mọi người trong chánh điện đều thấy.';
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
  ritual = { n: incN, wish, spot, place, started: false };
  incBtn.disabled = true;
  movePlayerTo(spot.x, spot.z);
  hideHint();
});

// Chạy mỗi khung hình: tới nơi thì bắt đầu nghi thức; đi chỗ khác thì hủy
function incenseRitual() {
  if (!ritual || ritual.started || player.script) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - ritual.spot.x, g.z - ritual.spot.z) > 0.01) {
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
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang${{ out: ' dâng Quan Âm Bồ Tát', qahall: ' dâng Quan Âm Bồ Tát', tower: ' dâng Phật trên tháp' }[place] ?? ''}`, 4200);
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
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
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
  if (!meritRun || meritRun.started || player.script) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - meritRun.spot.x, g.z - meritRun.spot.z) > 0.01) {
    meritRun = null;
    toast('Đã hủy góp công đức');
    return;
  }
  if (player.moving || player.routeTo) return;
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

// Đại hồng chung: chày lùi ra rồi lao vào, tiếng ngân vang khắp chùa (xa thì nhỏ dần)
function ringGreatBell(by) {
  const hitAt = world.greatBell.ring();
  if (by && by !== player) bubble(by, 'thỉnh đại hồng chung', 4000);
  setTimeout(() => {
    const d = player.pos.distanceTo(world.greatBell.center);
    sound.greatBell(0.55 * clamp(1.15 - d / 90, 0.3, 1));
  }, hitAt * 1000);
}
let bellRun = null;
function clickGreatBell() {
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  const s = world.greatBell.spot;
  bellRun = { spot: s, started: false };
  movePlayerTo(s.x, s.z);
  hideHint();
}
// tới chân gác chuông thì chắp tay rồi thỉnh chuông; đi chỗ khác thì thôi
function greatBellRitual() {
  if (!bellRun || bellRun.started || player.script) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - bellRun.spot.x, g.z - bellRun.spot.z) > 0.3) {
    bellRun = null;
    return;
  }
  if (player.moving || player.routeTo) return;
  if (player.pos.distanceTo(bellRun.spot) > 0.8) {
    bellRun = null;
    return;
  }
  bellRun.started = true;
  const c = world.greatBell.center;
  player.act('gassho', Math.atan2(c.x - player.pos.x, c.z - player.pos.z));
  setTimeout(() => {
    bellRun = null;
    ringGreatBell(player);
    net?.send({ t: 'act', a: 'greatbell' });
    earnBell();
    toast('Bạn đã thỉnh một hồi đại hồng chung — nguyện tiếng chuông vang xa, chúng sinh an lạc', 4200);
  }, 700);
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
  const sandalHit = ray.intersectObjects(rack.hitboxes(), false)[0];
  if (sandalHit && (!firstHit || sandalHit.distance <= firstHit.distance + 0.05)) {
    takeSandal(sandalHit.object.userData.owner);
    return;
  }
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
  if (kind === 'broom') {
    clickBroom();
    return;
  }
  if (kind === 'greatbell') {
    clickGreatBell();
    return;
  }
  if (kind === 'tower') {
    // chạm vào tháp: vào tháp lên tầng 13 (đang ở trên thì đi tới chỗ vừa chạm)
    const p = firstHit.point;
    if (onTower(player) || onTowerXZ(p.x, p.z)) movePlayerTo(p.x, p.z);
    else movePlayerTo(TOWER.arrive.x, TOWER.arrive.z);
    hideHint();
    return;
  }
  if (kind === 'quanam') {
    // tới trước tượng Quan Âm
    const f = world.quanAm.front;
    movePlayerTo(f.x, f.z + rnd(-0.8, 0.8));
    hideHint();
    return;
  }
  let seat = null;
  if (kind === 'seat') seat = seats[firstHit.instanceId];
  else if (kind === 'floor') {
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
  canvas.classList.toggle('can-pick', k === 'seat' || k === 'bell' || k === 'drum' || k === 'merit' || k === 'quanam' || k === 'broom' || k === 'tower' || k === 'greatbell' || ray.intersectObjects(rack.hitboxes(), false).length > 0 || !!pickAvatar());
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
  if (k === 'enter') {
    e.preventDefault();
    chatInput.focus();
    return;
  }
  if ((k === 'g' || k === 'b') && intro) skipIntro();
  if (k === 'g') doGassho();
  if (k === 'b') doBow();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

// Ô chat ở góc: Enter để gửi, lời chat hiện trên đầu mình 5 giây
const chatForm = $('#chat');
const chatInput = $('#chat-input');
let lastChat = 0;
if (isCoarse) chatInput.placeholder = 'Nhắn gì đó…';
chatInput.addEventListener('focus', () => keys.clear());
canvas.addEventListener('pointerdown', () => chatInput.blur());
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chatInput.blur();
});
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!text) return chatInput.blur();
  const now = performance.now();
  if (now - lastChat < 1200) return toast('Bạn chat nhanh quá, chờ một chút nhé', 1500);
  lastChat = now;
  chatInput.value = '';
  chatInput.blur();
  chatBubble(player, text);
  net?.send({ t: 'chat', text });
});
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
  if (player.script) return;
  const nx = player.pos.x + ((fx * f + rx * s) / len) * 0.7, nz = player.pos.z + ((fz * f + rz * s) / len) * 0.7;
  const [x, z] = onTower(player) ? clampTower(nx, nz) : clampZone(zoneOfA(player), nx, nz);
  player.routeTo = null;
  player.route = null;
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
  const high = onTower(player);
  cam.curDist += (Math.min(cam.dist, high ? 7 : Infinity) - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  // ở ngoài sân / trên thềm thì camera được lùi ra ngoài chánh điện
  const outside = zoneOfA(player) === 'out' || player.pos.z > HALL.maxZ;
  cam.maxZ += ((outside ? 106 : 18.6) - cam.maxZ) * (1 - Math.exp(-3 * dt));
  const cp = Math.cos(cam.curPitch);
  camera.position.set(
    clamp(cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist, high ? -19 : outside ? -46 : -14.5, outside ? 46 : 14.5),
    clamp(cam.target.y + Math.sin(cam.curPitch) * cam.curDist, 0.4, high ? TOWER.topY + 3.2 : outside ? 14 : 9.4),
    clamp(cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist, -15.2, cam.maxZ),
  );
  camera.lookAt(cam.target);
}

// ---------- Nhãn ----------
const v3 = new THREE.Vector3();
// lift: đẩy nhãn lên thêm (px, trước khi co theo khoảng cách); fade: mờ dần khi ở xa
function placeLabel(el, a, { lift = 0, fade = false } = {}) {
  if (!a.root.visible) {
    el.style.visibility = 'hidden';
    return;
  }
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
    // nhãn tên của mình luôn hiện; của người khác tùy cài đặt
    let lift = a === player || settings.showNames ? 26 : 0;
    if (a !== player && a.nameEl) {
      a.nameEl.hidden = !settings.showNames;
      if (settings.showNames) placeLabel(a.nameEl, a, { fade: true });
    }
    if (a !== player && a.bubbleEl) {
      if (now > a.bubbleUntil) a.bubbleEl.classList.add('hidden');
      // khi đang hiện pháp danh, bong bóng hành động nằm ngay trên nhãn tên
      placeLabel(a.bubbleEl, a, { lift, fade: true });
      if (now <= a.bubbleUntil) lift += 28;
    }
    if (a.chatEl) {
      if (now > a.chatUntil) a.chatEl.classList.add('hidden');
      else placeLabel(a.chatEl, a, { lift: lift + 4, fade: a !== player });
    }
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
  broomRitual();
  greatBellRitual();
  sweepLeaves(dt);
  scriptWatchdog(dt);
  rack.update(dt);
  leaves.update(dt);
  world.setFocus(player.pos.x, player.pos.z);
  if (mapOpen) updateMap();
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
