import * as THREE from 'three';
import { buildWorld, HALL, BUDDHA, ENTRANCE, COURTYARD, PORCH, TOWER, GATE, WALK_AREAS, CORRIDOR, WELL, BELLTOWER, BELL_LOFT, ZEN_LOFT, QAHALL, TERRACE, STAIRS, TAMTHE, FALLS, groundY } from './world.js';
import { Avatar, ROBES } from './avatar.js';
import { Dog } from './dog.js';
import {
  FIELD, PLOTS, plotRect, plotAt, RICE_STAGES, STAGE_NAMES,
  VEG, VEG_PLOTS, vegRect, vegAt, VEG_STAGES, VEG_STAGE_NAMES, VEG_KINDS,
  ORCHARD, ORCHARD_TREES, ORCHARD_COUNT, orchardTreeAt, FRUIT_STAGES, FRUIT_STAGE_NAMES,
} from './field.js';
import { SandalRack, SANDAL_COLORS } from './sandals.js';
import { LeafField } from './leaves.js';
import { Sound, CHANT_SYLLABLES, vietnameseVoices, ZEN_TRACKS } from './audio.js';
import { Beads } from './beads.js';
import { connect, fetchRooms, fetchMerit, ROOMS, SITES, siteRooms, roomUrl } from './net.js';
import { applyEvent, newProfile, publicProfile, RULES, CLIENT_KINDS } from './karma.js';
import { festivalOf, FESTIVAL_PHUOC } from './lunar.js';
import { DUST_IDS, lahanSpot } from './statues.js';

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
// phòng của khu khác (vd. Tam Chúc) thì chuyển sang trang của khu đó
{
  const other = ROOMS.find((r) => r.id === params.get('room') && r.site !== 'ammay');
  if (other) location.replace(roomUrl(other));
}
const MY_ROOMS = siteRooms('ammay');
let roomId = MY_ROOMS.some((r) => r.id === params.get('room')) ? params.get('room') : MY_ROOMS[0].id;

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
Dog.ground = groundY;
// ?gio=20.5 trên địa chỉ trang: xem thử chánh điện lúc 20 giờ 30 (mặc định theo giờ Việt Nam thật)
if (params.has('gio')) world.setHour(parseFloat(params.get('gio')));

// ---------- Ngày lễ: mùng một và ngày Rằm âm lịch ----------
// Hoa đăng trên hồ sen, cờ ngũ sắc dọc trục đường, khách đông hơn, điểm phước nhân đôi.
// ?am=15 (hoặc ?am=1) trên địa chỉ trang: xem thử ngày Rằm / mùng một vào một ngày bất kỳ
// (khi trực tuyến, máy chủ vẫn tính điểm theo ngày âm lịch thật).
const amOverride = [1, 15].includes(parseInt(params.get('am'), 10)) ? parseInt(params.get('am'), 10) : null;
let festival = festivalOf(Date.now(), amOverride);
function applyFestival() {
  world.setFestival(!!festival);
  const b = $('#fest-badge');
  b.hidden = !festival;
  if (!festival) return;
  b.classList.toggle('mung1', festival.kind === 'mung1');
  $('#fest-name').textContent = festival.name;
  b.title = `${festival.name} — điểm phước ×${FESTIVAL_PHUOC}`;
}
applyFestival();
$('#fest-badge').addEventListener('click', () => festival && toast(festivalMsg(), 6000));
const festivalMsg = () =>
  `Hôm nay là ${festival.name}. Điểm phước được nhân ${FESTIVAL_PHUOC} cả ngày; ra hồ sen ngắm hoa đăng, trục đường treo cờ ngũ sắc.`;
// qua nửa đêm (giờ Việt Nam) thì xét lại
setInterval(() => {
  const f = festivalOf(Date.now(), amOverride);
  if (f?.name === festival?.name) return;
  festival = f;
  applyFestival();
  if (online) botTarget = fillTarget();
  if (festival) toast(festivalMsg(), 6000);
}, 60e3);
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
const freeSeats = (except) => seats.filter((s) => !s.out && !seatTaken(s.index, except));

// Trong / ngoài chánh điện: ranh giới là thềm
const zoneOf = (z, x) => (z > 19.3 || z < -21.4 || Math.abs(x) > HALL.maxX + 1.5 ? 'out' : 'in');
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
// gặp giếng Ngọc, gốc cây đa hay chân tháp thì đi vòng.
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
  { x: 10.6, z: 29.4, r: 3.0 }, // gốc cây đa
  { x: 10.9, z: 35.6, rx: 3.0, rz: 2.1 }, // hồ sen nhỏ cạnh cây đa
  { x: -9.2, z: 61, rx: 4.15, rz: 16.55 }, // hồ sen lớn phía tây trục đường
  { x: 9.2, z: 61, rx: 4.15, rz: 16.55 }, // hồ sen lớn phía đông trục đường
  { x: -16.85, z: 62, rx: 1.5, rz: 18.7 }, // bệ tượng và tường hậu hành lang La Hán tây
  { x: 16.85, z: 62, rx: 1.5, rz: 18.7 }, // bệ tượng và tường hậu hành lang La Hán đông
  { x: TOWER.x, z: TOWER.z, r: TOWER.plinthR + 0.7 },
  { x: BELLTOWER.x, z: BELLTOWER.z, r: BELLTOWER.r + 0.5 },
  // chân đài thiền và bậc thang: đi vòng qua, chỉ lên đài bằng cầu thang (người và chó không đi xuyên lên mặt đài)
  { x: ZEN_LOFT.x, z: ZEN_LOFT.z - 1.5, rx: 9.6, rz: 11.2 },
  { x: 29.4, z: QAHALL.z1 - 0.2, r: 0.75 }, // cột mặt tiền điện Quan Âm
  { x: 34.6, z: QAHALL.z1 - 0.2, r: 0.75 },
  { x: -4.4, z: TAMTHE.z1 - 0.2, r: 0.8 }, // cột hai bên cửa giữa điện Tam Thế
  { x: 4.4, z: TAMTHE.z1 - 0.2, r: 0.8 },
  { x: -FALLS.x, z: FALLS.poolZ, r: FALLS.poolR + 0.8 }, // hồ dưới hai thác
  { x: FALLS.x, z: FALLS.poolZ, r: FALLS.poolR + 0.8 },
  { x: 51.8, z: 22.0, r: 1.55 }, // bàn đá giữa vườn cây ăn trái
  ...ORCHARD_TREES.map((t) => ({ x: t.x, z: t.z, r: 0.9 })),
];
// Đoạn thẳng a → b cắt qua chướng ngại tròn / elip thì chèn điểm vòng qua bên cạnh
function detour(ax, az, bx, bz, depth = 0, obs = ROUND_OBSTACLES) {
  if (depth > 2) return [];
  for (const o of obs) {
    const rx = o.rx ?? o.r, rz = o.rz ?? o.r;
    const au = (ax - o.x) / rx, av = (az - o.z) / rz;
    const bu = (bx - o.x) / rx, bv = (bz - o.z) / rz;
    if (Math.hypot(au, av) < 1 || Math.hypot(bu, bv) < 1) continue;
    const du = bu - au, dv = bv - av, L = du * du + dv * dv || 1;
    const t = clamp((-au * du - av * dv) / L, 0, 1);
    let cu = au + du * t, cv = av + dv * t;
    const d = Math.hypot(cu, cv);
    if (d >= 1) continue;
    if (d < 1e-3) [cu, cv] = [-dv, du];
    const n = Math.hypot(cu, cv) || 1;
    const rad = [o.x + (cu / n) * (rx + 0.35), o.z + (cv / n) * (rz + 0.35)];
    let w = rad;
    if (o.rx) {
      const cands = [
        rad,
        [o.x, o.z - rz - 0.45],
        [o.x, o.z + rz + 0.45],
        [o.x - rx - 0.45, o.z],
        [o.x + rx + 0.45, o.z],
      ];
      let bestCost = Infinity;
      for (const c of cands) {
        const cost = Math.hypot(c[0] - ax, c[1] - az) + Math.hypot(bx - c[0], bz - c[1]);
        if (cost < bestCost) {
          bestCost = cost;
          w = c;
        }
      }
    }
    return [...detour(ax, az, w[0], w[1], depth + 1, obs), w, ...detour(w[0], w[1], bx, bz, depth + 1, obs)];
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
  // qua chỗ nối giữa hai khu liên tiếp, hướng thẳng về đích và thu vào trong 0,3 m cho khỏi sát mép
  const pts = [];
  let cx = fx, cz = fz, from = s;
  for (const to of chain) {
    const p = PORTALS[from][to];
    const mx = (p.minX + p.maxX) / 2, mz = (p.minZ + p.maxZ) / 2;
    const ux = Math.abs(tx - cx) > 0.1 ? clamp((mx - cx) / (tx - cx), 0, 1) : 0.5;
    const uz = Math.abs(tz - cz) > 0.1 ? clamp((mz - cz) / (tz - cz), 0, 1) : 0.5;
    const u = (p.maxX - p.minX) < (p.maxZ - p.minZ) ? ux : uz;
    const wx = cx + (tx - cx) * u, wz = cz + (tz - cz) * u;
    const px = clamp(wx, Math.min(p.minX + 0.3, mx), Math.max(p.maxX - 0.3, mx));
    const pz = clamp(wz, Math.min(p.minZ + 0.3, mz), Math.max(p.maxZ - 0.3, mz));
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
// Trên nền đồi sau chánh điện (trong hoặc trước điện Tam Thế)
const inTamThe = (a) => Math.abs(a.pos.x) <= TERRACE.x && a.pos.z >= TERRACE.z0 && a.pos.z < TERRACE.z1 + 0.5;
// Nơi thắp nhang: trong chánh điện, trên tháp, trong điện Quan Âm hay điện Tam Thế (ngoài sân thì tới điện Quan Âm)
const placeOf = (a) => (onTower(a) ? 'tower' : inTamThe(a) ? 'tamthe' : zoneOfA(a) === 'out' ? 'qahall' : 'in');
const PLACE_KINDS = ['tower', 'qahall', 'tamthe'];

// Hướng mặt về nơi thờ: tượng Phật trong chánh điện, xá lợi trên tháp, tượng trong điện Quan Âm (cả khi ở ngoài sân), điện Tam Thế
const SHRINES = { tower: () => world.tower.relic, qahall: () => world.qaHall.head, tamthe: () => world.tamThe.head, in: () => BUDDHA };
const shrineOf = (a) => SHRINES[placeOf(a)]();
const faceShrineRy = (a) => {
  const t = shrineOf(a);
  return Math.atan2(t.x - a.pos.x, t.z - a.pos.z);
};
const burnerOf = (place) => ({ tower: world.incenseTop, qahall: world.incenseQH, tamthe: world.incenseTT })[place] ?? world.incense;
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
  await walkRoute(a, dest ? dest.x : rnd(-1.5, 1.5), dest ? dest.z : COURTYARD.z + 2, dest?.seat ?? null);
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

// ---------- Gác chuông: cầu thang gỗ trong tầng dưới dẫn lên sàn treo đại hồng chung ----------
const BL = BELL_LOFT;
const inBox = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
const onBellXZ = (x, z) => inBox(BL.floor, x, z) || inBox(BL.landing, x, z) || (Math.abs(x - BL.x) <= 4.15 && Math.abs(z - BL.z) <= 4.15 && !(x >= BL.stair.x0 - 0.1 && x <= BL.stair.x1 + 0.05 && z > BL.stair.zTop));
// Giữ điểm đến trên sàn gác: trong lan can, không đứng dưới vành chuông hay dưới chày
function clampBell(x, z) {
  const F = BL.floor, Ld = BL.landing, S = BL.striker;
  z = clamp(z, F.z0, F.z1);
  x = clamp(x, z < Ld.z1 - 0.15 ? Ld.x0 + 0.35 : F.x0 + 0.4, F.x1);
  let dx = x - BL.x, dz = z - BL.z;
  if (Math.hypot(dx, dz) < BL.bellR) {
    if (Math.hypot(dx, dz) < 1e-3) [dx, dz] = [0, 1];
    const n = Math.hypot(dx, dz);
    x = BL.x + (dx / n) * BL.bellR;
    z = BL.z + (dz / n) * BL.bellR;
  }
  if (x > S.x0 && x < S.x1 && Math.abs(z - BL.z) < S.dz) z = BL.z + (z >= BL.z ? S.dz : -S.dz);
  return [x, z];
}
// Đường đi trên sàn gác: thẳng nếu được, không thì đi vòng quanh chuông về phía không có chày
function bellPath(ax, az, bx, bz) {
  const cx = BL.x, cz = BL.z, S = BL.striker;
  let crossStriker = false;
  if ((az - cz) * (bz - cz) < 0) {
    const xc = ax + ((bx - ax) * (cz - az)) / (bz - az);
    crossStriker = xc > S.x0 - 0.3 && xc < S.x1;
  }
  if (!crossStriker && !detour(ax, az, bx, bz, 0, [{ x: cx, z: cz, r: BL.bellR }]).length) return [];
  const R = 1.9, wrap = (t) => Math.atan2(Math.sin(t), Math.cos(t));
  const ta = Math.atan2(az - cz, ax - cx);
  let d = wrap(Math.atan2(bz - cz, bx - cx) - ta);
  // cung đi qua góc 0 (phía có chày) thì đi đường kia
  const hits0 = (from, delta) => (delta > 0 ? from < 0 && from + delta > 0 : from > 0 && from + delta < 0);
  if (hits0(ta, d)) d = d > 0 ? d - Math.PI * 2 : d + Math.PI * 2;
  const n = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 6)));
  const pts = [];
  for (let i = 1; i < n; i++) {
    const t = ta + (d * i) / n;
    pts.push(clampBell(cx + Math.cos(t) * R, cz + Math.sin(t) * R));
  }
  return pts;
}
// Đi lại trên sàn gác; xong khi tới nơi (true), bị lệnh đi khác chen ngang thì false
async function walkLoft(a, x, z) {
  [x, z] = clampBell(x, z);
  const token = (a.route = {});
  a.routeTo = { x, z, seat: null };
  for (const [px, pz] of bellPath(a.pos.x, a.pos.z, x, z)) {
    await a.walk(px, pz);
    if (a.route !== token) return false;
  }
  a.routeTo = null;
  a.walkTo(x, z);
  return new Promise((res) => (a.onArrive = () => res(a.route === token)));
}
// Từ sân bước lên nền đá, leo cầu thang gỗ lên sàn gác
async function bellUp(a) {
  const token = (a.script = {});
  await walkRoute(a, BL.foot.x, BL.foot.z);
  if (!alive(a, token)) return false;
  for (const p of [BL.entry, BL.top, BL.arrive]) {
    await a.walk(p.x, p.z);
    if (!alive(a, token)) return false;
  }
  a.script = null;
  return true;
}
// Từ sàn gác xuống cầu thang, ra tới sân trước chân cầu thang
async function bellDown(a) {
  const token = (a.script = {});
  for (const [px, pz] of [...bellPath(a.pos.x, a.pos.z, BL.arrive.x, BL.arrive.z), [BL.arrive.x, BL.arrive.z]]) {
    await a.walk(px, pz);
    if (!alive(a, token)) return false;
  }
  for (const p of [BL.top, BL.entry, BL.foot]) {
    await a.walk(p.x, p.z);
    if (!alive(a, token)) return false;
  }
  a.script = null;
  return true;
}

// ---------- Đài thiền cao phía trước gác chuông: leo cầu thang đá lên mặt đài cao 9,6 m, ngồi bồ đoàn quanh đài sen thiền định & ngắm toàn cảnh chùa ----------
const ZL = ZEN_LOFT;
const onZenXZ = (x, z) => Math.abs(x - ZL.x) <= 6.2 && Math.abs(z - ZL.z) <= 6.2;
const onZen = (a) => onZenXZ(a.pos.x, a.pos.z);
function clampZen(x, z) {
  const F = ZL.floor;
  x = clamp(x, F.x0, F.x1);
  z = clamp(z, F.z0, F.z1);
  let dx = x - ZL.x, dz = z - ZL.z;
  const d = Math.hypot(dx, dz);
  if (d < ZL.centerR) {
    if (d < 1e-3) [dx, dz] = [0, -1];
    const n = Math.hypot(dx, dz);
    x = ZL.x + (dx / n) * ZL.centerR;
    z = ZL.z + (dz / n) * ZL.centerR;
  }
  return [x, z];
}
function zenPath(ax, az, bx, bz) {
  return detour(ax, az, bx, bz, 0, [{ x: ZL.x, z: ZL.z, r: ZL.centerR }]).map(([px, pz]) => clampZen(px, pz));
}
async function walkZen(a, x, z, seat = null) {
  // có bồ đoàn thì đi tới bồ đoàn rồi ngồi xuống
  [x, z] = seat ? [seat.x, seat.z] : clampZen(x, z);
  const token = (a.route = {});
  a.routeTo = { x, z, seat };
  for (const [px, pz] of zenPath(a.pos.x, a.pos.z, x, z)) {
    await a.walk(px, pz);
    if (a.route !== token) return false;
  }
  a.routeTo = null;
  a.walkTo(x, z, seat);
  return new Promise((res) => (a.onArrive = () => res(a.route === token)));
}
async function zenUp(a) {
  const token = (a.script = {});
  await walkRoute(a, ZL.foot.x, ZL.foot.z);
  if (!alive(a, token)) return false;
  for (const p of [ZL.entry, ZL.top, ZL.arrive]) {
    await a.walk(p.x, p.z);
    if (!alive(a, token)) return false;
  }
  a.script = null;
  if (a === player) {
    // hướng góc nhìn về phía toàn cảnh khuôn viên chùa
    cam.yaw = -1.15;
    cam.dist = Math.max(cam.dist, 12.5);
    syncZenAudio(true);
  }
  return true;
}
async function zenDown(a) {
  const token = (a.script = {});
  for (const [px, pz] of [...zenPath(a.pos.x, a.pos.z, ZL.arrive.x, ZL.arrive.z), [ZL.arrive.x, ZL.arrive.z]]) {
    await a.walk(px, pz);
    if (!alive(a, token)) return false;
  }
  for (const p of [ZL.top, ZL.entry, ZL.foot]) {
    await a.walk(p.x, p.z);
    if (!alive(a, token)) return false;
  }
  a.script = null;
  if (a === player) syncZenAudio(false);
  return true;
}

// Những chỗ trên cao: tầng 13 của tháp, sàn gác chuông và đài thiền
const LOFTS = {
  tower: {
    clamp: clampTower, up: towerUp, down: towerDown, door: TOWER.door, y: TOWER.topY,
    go: (a, x, z) => a.walkTo(...clampTower(x, z)),
    upMsg: 'Vào tháp, lên tầng 13…', downMsg: 'Xuống tháp…',
    arrived: 'Bạn đang ở tầng 13 — có thể lễ xá lợi Phật, thắp nhang và ngắm toàn cảnh chùa',
  },
  bell: {
    clamp: clampBell, up: bellUp, down: bellDown, door: BL.foot, y: BL.y,
    go: walkLoft,
    upMsg: 'Lên cầu thang gác chuông…', downMsg: 'Xuống gác chuông…',
    arrived: 'Bạn đang ở trên gác chuông — chạm vào chuông để nắm dây kéo chày thỉnh đại hồng chung',
  },
  zen: {
    clamp: clampZen, up: zenUp, down: zenDown, door: ZL.foot, y: ZL.y,
    go: walkZen,
    upMsg: 'Lên bậc thang đài thiền…', downMsg: 'Xuống đài thiền…',
    arrived: 'Bạn đang ở trên đài thiền — chạm một bồ đoàn quanh đài sen để ngồi thiền, ngắm toàn cảnh chùa',
  },
};
const loftAt = (x, z) => (onTowerXZ(x, z) ? 'tower' : onBellXZ(x, z) ? 'bell' : onZenXZ(x, z) ? 'zen' : null);
const loftOf = (a) => loftAt(a.pos.x, a.pos.z);

// Đi qua thềm giữa trong và ngoài chánh điện: ra thì mang dép, vào thì cởi dép xếp ngay ngắn.
// Lên / xuống tháp hay gác chuông nếu điểm đến hoặc chỗ đang đứng ở trên đó.
async function crossZone(a, x, z, seat = null) {
  const from = loftOf(a), to = loftAt(x, z);
  if (from && from !== to && !(await LOFTS[from].down(a))) return false;
  if (to) {
    const L = LOFTS[to];
    if (loftOf(a) !== to) {
      if (zoneOfA(a) === 'in' && !(await crossZone(a, L.door.x, L.door.z))) return false;
      if (!(await L.up(a))) return false;
    }
    L.go(a, x, z, seat);
    return true;
  }
  const target = zoneOf(z, x);
  if (target === zoneOfA(a)) {
    // cùng vùng (vd. vừa xuống tháp, điểm đến vẫn ở ngoài sân)
    [x, z] = seat ? [seat.x, seat.z] : clampZone(target, x, z);
    if (target === 'in') a.walkTo(x, z, seat);
    else walkRoute(a, x, z, seat);
    return true;
  }
  [x, z] = seat ? [seat.x, seat.z] : clampZone(target, x, z);
  if (target === 'out') {
    a.seat = null;
    if (!(await exitTemple(a, { x, z, seat }))) return false;
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
    } else if (r < 0.96 && touring() < Math.max(3, bots.size * (festival ? 0.5 : 0.35))) {
      botTour(a);
    }
  }
  if (bots.size < botTarget && Math.random() < 0.004) makeBot({ seated: false });
  if (bots.size > botTarget && Math.random() < 0.01) {
    const a = pick([...bots].filter((b) => !b.leaving && !b.script && !b.busy && !b.trip));
    if (a) botLeave(a);
  }
}

// Khách mô phỏng ra sân: mang dép, thắp nhang trong điện Quan Âm, ngắm hồ sen rồi vào lại chánh điện
async function botGardenTrip(a) {
  a.trip = true;
  const spot = leastCrowded(world.incenseQH.spots, a);
  if (!(await crossZone(a, spot.x, spot.z))) return (a.trip = false);
  await wait(rnd(500, 1500));
  if (!avatars.has(a.id) || a.leaving) return;
  await new Promise((res) => offerIncense(a, Math.random() < 0.6 ? 3 : 1, res, 'qahall'));
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

// Khách mô phỏng đi tham quan khuôn viên: một hai nơi rồi về chánh điện ngồi
const touring = () => [...bots].filter((b) => b.tour).length;
// đi tới (x, z) qua thềm / tháp nếu cần, chờ tới nơi
async function botGo(a, x, z, seat = null) {
  if (!(await crossZone(a, x, z, seat))) return false;
  while (avatars.has(a.id) && !a.leaving && (a.moving || a.routeTo || a.script)) await wait(300);
  return avatars.has(a.id) && !a.leaving;
}
const ringAround = (cx, cz, r) => {
  const t = rnd(0, Math.PI * 2);
  return [cx + Math.cos(t) * r, cz + Math.sin(t) * r];
};
const TOUR = [
  // hành lang La Hán: dạo dọc hàng tượng, chắp tay
  async (a) => {
    const s = Math.random() < 0.5 ? -1 : 1;
    // ngoại tuyến: thỉnh thoảng lau một tượng còn bám bụi
    const dirty = online ? [] : DUST_IDS.filter((id) => dusty.has(id) && lahanSpot(id).s === s && wipeRun?.id !== id);
    if (dirty.length && Math.random() < 0.7) {
      const id = pick(dirty), sp = lahanSpot(id);
      if (!(await botGo(a, sp.standX, sp.z))) return;
      if (!dusty.has(id)) return;
      wipeMotion(a, id);
      await wait(3100);
      if (!avatars.has(a.id) || !dusty.has(id)) return;
      setDusty(id, false);
      world.lahan.sparkle(id);
      await wait(rnd(1500, 4000));
      return;
    }
    if (!(await botGo(a, s * 14.5, rnd(46, 78)))) return;
    a.act('gassho', s > 0 ? Math.PI / 2 : -Math.PI / 2);
    bubble(a, 'chiêm bái La Hán', 3000);
    await wait(rnd(5000, 12000));
  },
  // giếng Ngọc: đứng ngắm
  async (a) => {
    const [x, z] = ringAround(WELL.x, WELL.z, WELL.r + 1.4);
    if (!(await botGo(a, x, z))) return;
    a.faceRy = Math.atan2(WELL.x - a.pos.x, WELL.z - a.pos.z);
    await wait(rnd(6000, 14000));
  },
  // gác chuông: leo cầu thang lên gác; đầu dây chày còn trống thì kéo chày thỉnh đại hồng chung
  async (a) => {
    const s = world.greatBell.spot;
    const busy = [...avatars.values()].some((o) => o !== a && Math.hypot(o.pos.x - s.x, o.pos.z - s.z) < 0.8);
    const ring = !busy && Math.random() < 0.6;
    const t = rnd(Math.PI * 0.6, Math.PI * 1.9);
    const [x, z] = ring ? [s.x, s.z] : clampBell(BL.x + Math.cos(t) * 2.4, BL.z + Math.sin(t) * 2.4);
    if (!(await botGo(a, x, z))) return;
    const c = world.greatBell.center;
    a.act('gassho', ring ? Math.PI : Math.atan2(c.x - a.pos.x, c.z - a.pos.z));
    if (ring) {
      await wait(1100);
      if (!avatars.has(a.id) || a.leaving) return;
      ringGreatBell(a);
    }
    await wait(rnd(5000, 9000));
  },
  // điện Quan Âm và điện Tam Thế: thắp nhang
  ...['qahall', 'tamthe'].map((place) => async (a) => {
    const spot = leastCrowded(burnerOf(place).spots, a);
    if (!(await botGo(a, spot.x, spot.z))) return;
    await new Promise((res) => offerIncense(a, Math.random() < 0.6 ? 3 : 1, res, place));
    await wait(rnd(3000, 8000));
  }),
  // tháp 13 tầng: lên tầng trên cùng lạy Phật
  async (a) => {
    if (!(await botGo(a, TOWER.arrive.x, TOWER.arrive.z + rnd(-0.6, 0.6)))) return;
    a.act('bow', faceShrineRy(a));
    await wait(rnd(6000, 12000));
  },
  // cổng Tam Quan: dạo sân trước cổng
  async (a) => {
    if (!(await botGo(a, rnd(-9, 9), rnd(GATE.z + 4, 97)))) return;
    await wait(rnd(5000, 10000));
  },
  // vườn cây ăn trái kế bên điện Quan Âm: dạo mát ngắm cây hoặc hái quả
  async (a) => {
    const tr = pick(ORCHARD_TREES);
    if (!(await botGo(a, tr.x - 1.3, tr.z))) return;
    a.faceRy = Math.atan2(tr.x - a.pos.x, tr.z - a.pos.z);
    bubble(a, pick(['vườn cây sai quả quá', 'hương quả chín thơm dịu', `ngắm ${tr.name}`]), 3000);
    await wait(rnd(5000, 10000));
  },
  // vườn rau kế bên ruộng lúa: thăm luống rau chùa
  async (a) => {
    const r = vegRect((Math.random() * VEG_PLOTS) | 0);
    if (!(await botGo(a, r.minX - 0.3, (r.minZ + r.maxZ) / 2))) return;
    a.act('stoop');
    bubble(a, pick(['chăm luống rau chùa', 'rau chùa xanh tốt quá']), 3000);
    await wait(rnd(4500, 9000));
  },
  // đài thiền trước gác chuông: lên đài cao, ngồi một bồ đoàn quanh đài sen thiền định một lúc
  async (a) => {
    const free = seats.filter((s) => s.place === 'zen' && !seatTaken(s.index, a));
    if (!free.length) return;
    const s = pick(free);
    if (!(await botGo(a, s.x, s.z, s))) return;
    bubble(a, pick(['ngồi thiền trên đài cao', 'thở vào, thở ra…', 'tâm tĩnh như mặt hồ']), 3800);
    a.act('gassho');
    await wait(rnd(14000, 26000));
  },
];
// ngày lễ: ra bờ hồ sen ngắm hoa đăng
const FEST_TOUR = async (a) => {
  const s = Math.random() < 0.5 ? -1 : 1;
  const z = Math.random() < 0.5 ? rnd(44, 55) : rnd(68, 77);
  if (!(await botGo(a, s * 3.1, z))) return;
  a.act('gassho', s > 0 ? Math.PI / 2 : -Math.PI / 2);
  bubble(a, pick(['ngắm hoa đăng', 'hoa đăng đẹp quá', 'Nam mô A Di Đà Phật']), 3000);
  await wait(rnd(6000, 14000));
};
async function botTour(a) {
  a.trip = a.tour = true;
  try {
    const stops = 1 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < stops; i++) {
      await (festival && Math.random() < 0.4 ? FEST_TOUR : pick(TOUR))(a);
      if (!avatars.has(a.id) || a.leaving) return;
    }
    const s = pick(freeSeats(a));
    await botGo(a, s ? s.x : rnd(-6, 6), s ? s.z : 10);
    if (s && avatars.has(a.id) && !a.leaving && !seatTaken(s.index, a)) a.walkTo(s.x, s.z, s);
  } finally {
    a.trip = a.tour = false;
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
// ngày lễ chùa đông hơn
const fillTarget = () => (online ? Math.max(0, (festival ? 24 : 14) - onlineCount) : botTarget);

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
    const seat = p.seat != null ? seats[p.seat] : null;
    if (seat) a.sitAt(seat);
    else a.placeAt(p.x, p.z, Math.PI);
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
    else if (a.script || zoneOfA(a) !== zoneOf(m.z, m.x) || loftOf(a) !== loftAt(m.x, m.z)) crossZone(a, m.x, m.z, seat);
    else if (loftOf(a)) LOFTS[loftOf(a)].go(a, m.x, m.z, seat);
    else if (zoneOfA(a) === 'out') walkRoute(a, m.x, m.z, seat);
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
      const place = m.place === 'out' ? 'qahall' : m.place; // máy cũ còn gửi 'out' (lư hương đá ngoài sân đã bỏ)
      offerIncense(a, m.n === 3 ? 3 : 1, null, PLACE_KINDS.includes(place) ? place : 'in');
    } else if (m.a === 'greatbell') {
      ringGreatBell(a);
    } else if (m.a === 'wipe' && m.statue != null) {
      wipeMotion(a, m.statue);
    }
  });
  n.on('merit', (m) => {
    Object.assign(meritBoard, { total: m.total, recent: m.recent });
    renderMerit();
    const a = avatars.get('n' + m.id);
    if (a && !a.leaving) offerMerit(a);
  });
  n.on('karma', (m) => showGain(m.entry));
  n.on('field', (m) => {
    world.field.setPlot(m.i, m.age);
    const a = avatars.get('n' + m.by);
    if (a) {
      a.act('stoop');
      bubble(a, 'gặt lúa', 3000);
    }
  });
  n.on('veg', (m) => {
    world.veg.setBed(m.i, m.age);
    if (m.age === 0) sendNoviceForVeg(m.i);
    const a = avatars.get('n' + m.by);
    if (a) {
      a.act('stoop');
      bubble(a, 'hái rau', 3000);
    }
  });
  n.on('orchard', (m) => {
    world.orchard.setTree(m.i, m.age);
    if (m.age === 0) sendNoviceForFruit(m.i);
    const a = avatars.get('n' + m.by);
    if (a) {
      a.act('stoop');
      bubble(a, 'hái trái cây', 3000);
    }
  });
  n.on('leaves', (m) => {
    if (m.add) leaves.add(m.add);
    if (m.gone) {
      const a = avatars.get('n' + m.by);
      leaves.remove(m.gone, a?.pos.x, a?.pos.z);
    }
  });
  n.on('broom', (m) => avatars.get('n' + m.id)?.holdBroom(m.on));
  n.on('dust', (m) => {
    for (const id of m.add || []) setDusty(id, true);
    for (const id of m.gone || []) {
      if (!dusty.has(id)) continue;
      setDusty(id, false);
      world.lahan.sparkle(id);
      if (wipeRun?.id === id && !wipeRun.started) {
        wipeRun = null;
        toast('Có bạn đạo vừa lau sạch tượng này rồi', 2600);
      }
    }
  });
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
  const room = MY_ROOMS.find((r) => r.id === id);
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
    world.field.setAges(n.welcome.field);
    world.veg.setAges(n.welcome.veg);
    world.orchard.setAges(n.welcome.orchard);
    resetDust(n.welcome.dust || []);
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
    botTarget = Math.floor(festival ? rnd(30, 42) : rnd(16, 30));
    earn('visit');
    leaves.reset(makeLeaves(45));
    world.field.setAges(null);
    world.veg.setAges(null);
    world.orchard.setAges(null);
    resetDust(pickDust(22));
  }
  for (let i = 0; i < botTarget; i++) makeBot({ seated: Math.random() < 0.85 });
  makeNovices();
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
    if (festival) toast(festivalMsg(), 6000);
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
  net.send({ t: 'move', x: +g.x.toFixed(2), z: +g.z.toFixed(2), seat: player.routeTo?.seat?.index ?? player.goalSeat?.index ?? player.seat ?? null });
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
  const fromL = loftOf(player), toL = loftAt(x, z);
  if (fromL && fromL === toL) {
    // đi lại trên tầng 13 / trên sàn gác chuông
    const L = LOFTS[toL];
    if (seat) [x, z] = [seat.x, seat.z];
    else [x, z] = L.clamp(x, z);
    L.go(player, x, z, seat);
    world.showMarker(x, z, L.y + 0.04);
    sendMove();
    return;
  }
  if (fromL || toL) {
    // lên hoặc xuống tháp / gác chuông: báo đích đến trước để người khác thấy mình đi
    net?.send({ t: 'move', x: +x.toFixed(2), z: +z.toFixed(2), seat: seat?.index ?? null });
    toast(toL ? LOFTS[toL].upMsg : LOFTS[fromL].downMsg, 2600);
    player.queued = null;
    crossZone(player, x, z, seat).then((ok) => {
      if (!ok) return;
      if (toL && !bellRun) toast(LOFTS[toL].arrived, 4500);
      sendMove();
      goQueued();
    });
    return;
  }
  if (zoneOfA(player) !== target) {
    // đi qua thềm: báo đích đến trước để người khác thấy mình ra / vào
    [x, z] = seat ? [seat.x, seat.z] : clampZone(target, x, z);
    world.showMarker(x, z, groundY(x, z) + (seat ? 0.18 : 0.04));
    net?.send({ t: 'move', x: +x.toFixed(2), z: +z.toFixed(2), seat: seat?.index ?? null });
    toast(target === 'out' ? 'Mang dép vào rồi ra sân…' : 'Để dép ngay ngắn trên thềm rồi vào chánh điện…', 2600);
    if (target === 'in' && player.hasBroom) {
      setBroom(false);
      toast('Đã cất chổi về giá trước khi vào chánh điện', 2600);
    }
    player.queued = null;
    crossZone(player, x, z, seat).then((ok) => {
      if (ok && target === 'out') toast('Bạn đang ở ngoài sân — có thể vào điện Quan Âm thắp nhang dâng Quan Âm Bồ Tát', 3600);
      if (ok) goQueued();
    });
    return;
  }
  [x, z] = seat ? [seat.x, seat.z] : clampZone(target, x, z);
  if (target === 'out') walkRoute(player, x, z, seat);
  else player.walkTo(x, z, seat);
  world.showMarker(x, z, groundY(x, z) + (seat ? 0.18 : 0.04));
  sendMove();
}

// ---------- Lau tượng La Hán: tượng hàng trước bám bụi dần, chạm vào để đến lau ----------
// Trực tuyến: máy chủ giữ danh sách tượng bám bụi (mọi người thấy chung). Ngoại tuyến: tính trên máy.
const dusty = new Set();
let wipeRun = null; // { id, spot, started }
function setDusty(id, on, instant = false) {
  if (on) dusty.add(id);
  else dusty.delete(id);
  world.lahan.setDust(id, on, instant);
}
function resetDust(ids) {
  for (const id of DUST_IDS) setDusty(id, false, true);
  for (const id of ids) if (DUST_IDS.includes(id)) setDusty(id, true, true);
}
const pickDust = (n) => DUST_IDS.filter(() => Math.random() < n / DUST_IDS.length);
// ngoại tuyến: bụi bám thêm dần
setInterval(() => {
  if (online || dusty.size >= 40) return;
  const clean = DUST_IDS.filter((id) => !dusty.has(id));
  if (clean.length) setDusty(pick(clean), true);
}, 30000);
const lahanFace = (id) => (lahanSpot(id).s > 0 ? Math.PI / 2 : -Math.PI / 2);
// cử chỉ lau tượng (người khác nhìn thấy): cầm khăn, xoay tay khoảng 3 giây
function wipeMotion(a, id) {
  a.act('wipe', lahanFace(id));
  a.holdCloth(true);
  clearTimeout(a.clothTimer);
  a.clothTimer = setTimeout(() => a.holdCloth(false), 3200);
  if (a !== player) bubble(a, 'lau tượng La Hán', 3000);
}
function clickLahan(id) {
  if (!dusty.has(id)) {
    toast('Tượng này đã sạch bóng — hãy tìm tượng còn bám bụi (màu xỉn hơn) để lau', 3000);
    return;
  }
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  const sp = lahanSpot(id);
  wipeRun = { id, spot: { x: sp.standX, z: sp.z }, started: false };
  movePlayerTo(sp.standX, sp.z);
  hideHint();
}
// tới trước tượng thì cầm khăn lau; đi chỗ khác thì thôi
function wipeRitual() {
  if (!wipeRun || player.script) return;
  const w = wipeRun;
  if (w.started) {
    // đang lau mà bỏ đi chỗ khác
    if (player.goal) {
      wipeRun = null;
      player.action = null;
      player.holdCloth(false);
    }
    return;
  }
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - w.spot.x, g.z - w.spot.z) > 0.3) {
    wipeRun = null;
    return;
  }
  if (player.moving || player.routeTo) return;
  if (Math.hypot(player.pos.x - w.spot.x, player.pos.z - w.spot.z) > 0.8) {
    wipeRun = null;
    return;
  }
  w.started = true;
  wipeMotion(player, w.id);
  net?.send({ t: 'act', a: 'wipe', id: w.id });
  setTimeout(() => {
    if (wipeRun !== w) return;
    wipeRun = null;
    player.holdCloth(false);
    if (!dusty.has(w.id)) return;
    setDusty(w.id, false);
    world.lahan.sparkle(w.id);
    if (net) net.send({ t: 'wipe', id: w.id });
    else earn('wipe');
    toast('Bạn đã lau sạch một pho tượng La Hán — tâm cũng sáng trong như tượng', 3200);
  }, 3000);
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
  { id: 'banyan', name: 'Cây đa', x: 7.3, z: 29.4, ry: Math.PI / 2 },
  { id: 'tower', name: 'Tháp 13 tầng', x: TOWER.arrive.x, z: TOWER.arrive.z },
  { id: 'lahan', name: 'Hành lang La Hán', x: 14.5, z: 46, ry: Math.PI / 2 },
  { id: 'well', name: 'Giếng Ngọc', x: 0, z: WELL.z - 4.3, ry: 0 },
  { id: 'bell', name: 'Gác chuông', x: BELLTOWER.x, z: BELLTOWER.z + BELLTOWER.r + 0.6, ry: Math.PI },
  { id: 'zen', name: 'Đài thiền', x: ZEN_LOFT.arrive.x, z: ZEN_LOFT.arrive.z, ry: -1.15 },
  { id: 'qahall', name: 'Điện Quan Âm', x: QAHALL.cx, z: 12, ry: Math.PI },
  { id: 'orchard', name: 'Vườn cây ăn trái', x: 46.5, z: 25.5, ry: Math.PI / 2 },
  { id: 'field', name: 'Ruộng lúa', x: 34, z: 42.5, ry: 0 },
  { id: 'veg', name: 'Vườn rau', x: 56.8, z: 54, ry: Math.PI / 2 },
  { id: 'stairs', name: 'Bậc thang lên đồi', x: 0, z: -30.2, ry: Math.PI },
  { id: 'tamthe', name: 'Điện Tam Thế', x: 0, z: TAMTHE.z0 + 8.4, ry: Math.PI },
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
  setOverview(false);
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
  el('rect', { x: -2, y: -45, width: 194, height: 116, class: 'm-bg' });
  for (const s of [-1, 1]) rect(s > 0 ? 16.2 : -20.8, s > 0 ? 20.8 : -16.2, -29, 23.2, 'm-stone'); // lối hai bên
  rect(-20.8, 20.8, -33.2, -26, 'm-stone'); // sân sau
  rect(-TERRACE.x, TERRACE.x, TERRACE.z0, TERRACE.z1, 'm-terrace'); // nền đồi
  rect(-STAIRS.x, STAIRS.x, STAIRS.z0, STAIRS.z1, 'm-stairs'); // bậc thang
  rect(TAMTHE.x0, TAMTHE.x1, TAMTHE.z0, TAMTHE.z1, 'm-hall');
  for (const s of [-1, 1]) {
    el('circle', { cx: mapU(FALLS.poolZ), cy: mapV(s * FALLS.x), r: FALLS.poolR, class: 'm-water' }); // hồ dưới thác
    rect(s * FALLS.x - 0.6, s * FALLS.x + 0.6, FALLS.poolZ, TERRACE.z1, 'm-water'); // suối
  }
  for (const s of [-1, 1]) {
    rect(s > 0 ? 21 : -43, s > 0 ? 43 : -21, 18, 40, 'm-stone'); // sân bên
    rect(s > 0 ? 15.5 : -21.5, s > 0 ? 21.5 : -15.5, 22.6, 24.4, 'm-stone'); // lối sang sân bên
  }
  rect(QAHALL.x0, QAHALL.x1, QAHALL.z0, QAHALL.z1, 'm-hall');
  rect(ORCHARD.x0, ORCHARD.x1, ORCHARD.z0, ORCHARD.z1, 'm-grass'); // vườn cây ăn trái kế bên điện Quan Âm
  for (const tr of ORCHARD_TREES) el('circle', { cx: mapU(tr.z), cy: mapV(tr.x), r: 1.1, class: 'm-tree' });
  rect(30.5, 64, 39, FIELD.z0 + 1, 'm-stone'); // lối xuống ruộng và sang vườn rau
  rect(FIELD.x0, FIELD.x1, FIELD.z0, FIELD.z1, 'm-field'); // ruộng lúa
  rect(VEG.x0, VEG.x1, VEG.z0, VEG.z1, 'm-veg'); // vườn rau kế bên ruộng lúa
  el('rect', { x: mapU(BELLTOWER.z + 4.5), y: mapV(BELLTOWER.x - 4.5), width: 9, height: 9, class: 'm-hall' });
  rect(ZEN_LOFT.x - 6.2, ZEN_LOFT.x + 6.2, ZEN_LOFT.z - 6.2, ZEN_LOFT.z + 6.2, 'm-hall'); // đài thiền trước gác chuông
  el('circle', { cx: mapU(ZEN_LOFT.z), cy: mapV(ZEN_LOFT.x), r: ZEN_LOFT.orbitR, class: 'm-porch' });
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
  el('circle', { cx: mapU(TOWER.z), cy: mapV(TOWER.x), r: 3.4, class: 'm-tower' });
  el('circle', { cx: mapU(29.4), cy: mapV(10.6), r: 1.4, class: 'm-tree' });
  const labels = [
    ['hall', 0, 2, 'Chánh điện'],
    ['banyan', 15.4, 29.4, 'Cây đa'],
    ['tower', -15.2, 30, 'Tháp 13 tầng'],
    ['gate', 0, GATE.z + 5.5, 'Tam Quan'],
    ['well', 0, WELL.z, 'Giếng Ngọc'],
    ['bell', BELLTOWER.x, BELLTOWER.z, 'Gác chuông'],
    ['zen', ZEN_LOFT.x, ZEN_LOFT.z, 'Đài thiền'],
    ['tamthe', 0, TAMTHE.z0 + 7, 'Điện Tam Thế'],
    ['stairs', 6.5, -40, 'Bậc thang'],
    ['qahall', QAHALL.cx, 11, 'Điện Quan Âm'],
    ['orchard', (ORCHARD.x0 + ORCHARD.x1) / 2, (ORCHARD.z0 + ORCHARD.z1) / 2, 'Vườn quả'],
    ['field', (FIELD.x0 + FIELD.x1) / 2, (FIELD.z0 + FIELD.z1) / 2, 'Ruộng lúa'],
    ['veg', (VEG.x0 + VEG.x1) / 2, (VEG.z0 + VEG.z1) / 2, 'Vườn rau'],
    ['lahan', 15.6, 62, 'La Hán'],
    ['lahan', -15.6, 62, 'La Hán'],
  ];
  for (const [id, x, z, text] of labels) {
    const g = el('g', { class: 'm-place', role: 'button', tabindex: 0 });
    const t = el('text', { x: mapU(z), y: mapV(x) + 1.5, 'text-anchor': 'middle' }, g);
    t.textContent = text;
    const go = () => quickTravel(PLACES.find((p) => p.id === id));
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => e.key === 'Enter' && go());
  }
  mapOthers = el('g', {});
  mapMe = el('circle', { r: 2, class: 'm-me' });
}
function updateMap() {
  mapMe.setAttribute('cx', mapU(player.pos.z));
  mapMe.setAttribute('cy', mapV(player.pos.x));
  const others = [...avatars.values()].filter((a) => a !== player && !a.leaving);
  while (mapOthers.childElementCount < others.length) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', 1.1);
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

// ---------- Chó của nhà chùa: các sư thầy, chú tiểu nuôi ----------
// Đi lang thang giữa các sân, nằm nghỉ, thấy người thì chạy lại vẫy đuôi, thỉnh thoảng sủa khẽ.
// Mỗi máy tự cho chó đi (không đồng bộ giữa người chơi).
const DOG_INFO = [
  { name: 'Vàng', owner: 'chú tiểu Tâm', coat: ['#c99a52', '#f1dcb4', '#a8743a'], ears: 'down' },
  { name: 'Mực', owner: 'sư thầy trụ trì', coat: ['#2b2522', '#4a3f38', '#1e1a18'], ears: 'up' },
  { name: 'Bông', owner: 'chú tiểu An', coat: ['#f3eee4', '#ffffff', '#c98a54'], ears: 'down', size: 0.85 },
  { name: 'Lu', owner: 'sư cô Diệu Hạnh', coat: ['#8a5a36', '#d8b48a', '#6b4128'], ears: 'up', size: 1.1 },
];
// sân chùa, trục đường, sân giếng, sân trước cổng, hai sân bên, sân sau, sân trước điện Tam Thế
const DOG_AREAS = WALK_AREAS.filter((r) => r.maxX - r.minX > 6 && r.maxZ - r.minZ > 6 && !(r.minX > QAHALL.x0 - 1 && r.maxZ < QAHALL.z1 + 2) && !(Math.abs(r.minX) < 12 && r.maxZ < TAMTHE.z1 && r.minZ > TAMTHE.z0 - 1));
const dogs = DOG_INFO.slice(0, settings.quality === 'high' ? 4 : 3).map((info) => {
  const d = new Dog(info);
  const [x, z] = world.pushOut(rnd(-12, 12), rnd(24, 37));
  d.placeAt(x, z, rnd(0, 6.28));
  scene.add(d.root);
  d.labelEl = document.createElement('div');
  d.labelEl.className = 'label name dog-label';
  d.labelEl.textContent = d.name;
  d.labelEl.title = `Chó của ${d.owner}`;
  d.labelEl.addEventListener('click', () => petDog(d));
  labelsEl.append(d.labelEl);
  d.restUntil = rnd(1, 6);
  return d;
});
const dogV = new THREE.Vector3();
function pickDog() {
  let best = null, bestD = Infinity;
  for (const d of dogs) {
    dogV.set(d.root.position.x, d.root.position.y + 0.4, d.root.position.z);
    const along = dogV.clone().sub(ray.ray.origin).dot(ray.ray.direction);
    if (ray.ray.distanceToPoint(dogV) < 0.5 && along > 0 && along < bestD) {
      best = d;
      bestD = along;
    }
  }
  return best;
}
function petDog(d) {
  sound.init();
  d.route = null;
  d.routeTo = null;
  d.goal = null;
  d.faceRy = Math.atan2(player.pos.x - d.pos.x, player.pos.z - d.pos.z);
  d.sitting = true;
  d.hop();
  d.restUntil = elapsed + rnd(5, 9);
  if (player.pos.distanceTo(d.pos) < 12) sound.bark(0.18);
  toast(`Bạn xoa đầu ${d.name} — chú chó của ${d.owner}`, 3200);
}
// quanh đài thiền (chân đài, bậc thang, mặt đài): chó không tới
const nearZen = (x, z) => ((x - ZEN_LOFT.x) / 10.4) ** 2 + ((z - ZEN_LOFT.z + 1.5) / 12) ** 2 < 1;
function dogsThink(t, dt) {
  for (const d of dogs) {
    d.update(dt);
    if (d.moving || d.routeTo || t < d.restUntil) continue;
    const near = zoneOfA(player) === 'out' && !loftOf(player) && !nearZen(player.pos.x, player.pos.z) && player.pos.distanceTo(d.pos) < 11;
    const r = Math.random();
    if (near && r < 0.35) {
      // chạy lại chỗ người chơi, ngồi trước mặt vẫy đuôi
      const a = rnd(-0.8, 0.8) + player.ry;
      const [x, z] = clampZone('out', player.pos.x + Math.sin(a) * 1.1, player.pos.z + Math.cos(a) * 1.1);
      d.speed = 3.2;
      walkRoute(d, x, z).then((ok) => {
        if (!ok) return;
        d.faceRy = Math.atan2(player.pos.x - d.pos.x, player.pos.z - d.pos.z);
        d.sitting = true;
        d.happy = 4;
        d.restUntil = elapsed + rnd(5, 10);
        if (Math.random() < 0.3 && player.pos.distanceTo(d.pos) < 6) sound.bark(0.12);
      });
      d.restUntil = Infinity;
    } else if (r < 0.8) {
      // đi tới một chỗ ngẫu nhiên trong sân, tới nơi thì nằm nghỉ
      const area = Math.random() < 0.5 ? DOG_AREAS[0] : pick(DOG_AREAS);
      const [x, z] = clampZone('out', rnd(area.minX + 1, area.maxX - 1), rnd(area.minZ + 1, area.maxZ - 1));
      if (nearZen(x, z)) continue; // chó không lên đài thiền, cũng không nằm sát chân đài
      d.speed = rnd(1.3, 2.0);
      walkRoute(d, x, z).then((ok) => {
        if (!ok) return;
        d.sitting = true;
        d.restUntil = elapsed + rnd(5, 16);
      });
      d.restUntil = Infinity;
    } else {
      // ngồi ngó quanh, thỉnh thoảng sủa khẽ
      d.sitting = true;
      d.faceRy = rnd(-Math.PI, Math.PI);
      d.restUntil = t + rnd(4, 10);
      if (Math.random() < 0.3 && player.pos.distanceTo(d.pos) < 14) sound.bark(0.1);
    }
  }
}

// ---------- Gặt lúa, hái rau, hái trái cây ----------
let harvestRun = null; // { kind: 'rice'|'veg'|'fruit', i, x, z, faceX, faceZ, started }
function clickField(px, pz) {
  sound.init();
  const i = plotAt(px, pz);
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  if (i < 0) {
    movePlayerTo(px, pz);
    return;
  }
  const st = world.field.stageOf(i);
  if (st < 3) {
    const left = Math.max(1, Math.ceil((RICE_STAGES[2] - world.field.ageOf(i)) / 60));
    toast(`Lúa ở ô này ${STAGE_NAMES[st]} — khoảng ${left} phút nữa mới chín`, 3200);
    movePlayerTo(px, pz);
    return;
  }
  const r = plotRect(i);
  const [x, z] = clampZone('out', clamp(px, r.minX + 0.6, r.maxX - 0.6), clamp(pz, r.minZ + 0.6, r.maxZ - 0.6));
  harvestRun = { kind: 'rice', i, x, z, started: false };
  movePlayerTo(x, z);
  hideHint();
}
function clickVeg(hit, obj) {
  sound.init();
  const px = hit.point.x, pz = hit.point.z;
  const i = Number.isInteger(obj.userData.i) ? obj.userData.i : vegAt(px, pz);
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  if (i < 0) {
    movePlayerTo(px, pz);
    return;
  }
  const r = vegRect(i);
  const [x, z] = clampZone('out', clamp(px, r.minX + 0.35, r.maxX - 0.35), clamp(pz, r.minZ + 0.35, r.maxZ - 0.35));
  const st = world.veg.stageOf(i);
  if (st < 3) {
    const left = Math.max(1, Math.ceil(VEG_STAGES[2] - world.veg.ageOf(i)));
    toast(`Luống ${VEG_KINDS[i]} này ${VEG_STAGE_NAMES[st]} — khoảng ${left} giây nữa mới hái được`, 3200);
    movePlayerTo(x, z);
    return;
  }
  harvestRun = { kind: 'veg', i, x, z, faceX: (r.minX + r.maxX) / 2, faceZ: (r.minZ + r.maxZ) / 2, started: false };
  movePlayerTo(x, z);
  hideHint();
}
function clickOrchard(hit, obj) {
  sound.init();
  const px = hit.point.x, pz = hit.point.z;
  const i = Number.isInteger(obj.userData.i) ? obj.userData.i : orchardTreeAt(px, pz);
  if (player.script) {
    toast('Đợi một chút — bạn đang mang / cởi dép ở thềm');
    return;
  }
  if (i < 0) {
    movePlayerTo(px, pz);
    return;
  }
  const tr = ORCHARD_TREES[i];
  let dx = player.pos.x - tr.x, dz = player.pos.z - tr.z;
  const d = Math.hypot(dx, dz) || 1;
  const [x, z] = clampZone(
    'out',
    clamp(tr.x + (dx / d) * 1.25, ORCHARD.x0 + 0.4, ORCHARD.x1 - 0.4),
    clamp(tr.z + (dz / d) * 1.25, ORCHARD.z0 + 0.4, ORCHARD.z1 - 0.4),
  );
  const st = world.orchard.stageOf(i);
  const title = tr.name[0].toUpperCase() + tr.name.slice(1);
  if (st < 3) {
    const left = Math.max(1, Math.ceil((FRUIT_STAGES[2] - world.orchard.ageOf(i)) / 60));
    toast(`${title} này ${FRUIT_STAGE_NAMES[st]} — khoảng ${left} phút nữa quả mới chín`, 3200);
    movePlayerTo(x, z);
    return;
  }
  harvestRun = { kind: 'fruit', i, x, z, faceX: tr.x, faceZ: tr.z, started: false };
  movePlayerTo(x, z);
  hideHint();
}
function harvestTick() {
  if (!harvestRun || harvestRun.started || player.script) return;
  const g = player.routeTo ?? player.goal;
  if (g && Math.hypot(g.x - harvestRun.x, g.z - harvestRun.z) > 0.35) {
    harvestRun = null;
    return;
  }
  if (player.moving || player.routeTo) return;
  const { kind, i, faceX, faceZ } = harvestRun;
  if (player.pos.distanceTo(new THREE.Vector3(harvestRun.x, 0, harvestRun.z)) > 0.9) {
    harvestRun = null;
    return;
  }
  harvestRun.started = true;
  if (faceX != null) player.faceRy = Math.atan2(faceX - player.pos.x, faceZ - player.pos.z);
  player.act('stoop');
  sound.bead();
  setTimeout(() => player.act('stoop'), 1700);
  setTimeout(() => {
    harvestRun = null;
    if (kind === 'rice') {
      if (world.field.stageOf(i) < 3) return toast('Ô lúa này vừa có người gặt rồi', 2600);
      world.field.setPlot(i, 0);
      if (net) net.send({ t: 'harvest', i });
      else earn('harvest');
      toast('Bạn đã gặt xong một ô lúa — hạt gạo nuôi người, công sức nuôi phước', 3600);
    } else if (kind === 'veg') {
      if (world.veg.stageOf(i) < 3) return toast('Luống rau này vừa có người hái rồi', 2600);
      world.veg.setBed(i, 0);
      if (net) net.send({ t: 'pick-veg', i });
      else earn('veg');
      toast(`Bạn đã hái xong một rổ ${VEG_KINDS[i]} tươi — chú tiểu đang ra mang rổ rau vào chùa`, 4200);
      sendNoviceForVeg(i);
    } else if (kind === 'fruit') {
      if (world.orchard.stageOf(i) < 3) return toast('Cây này vừa có người hái quả rồi', 2600);
      const tr = ORCHARD_TREES[i];
      world.orchard.setTree(i, 0);
      if (net) net.send({ t: 'pick-fruit', i });
      else earn('fruit');
      toast(`Bạn đã hái ${tr.fruit} từ ${tr.name} — chú tiểu đang ra mang rổ quả vào cúng Phật`, 4200);
      sendNoviceForFruit(i);
    }
  }, 3400);
}

// ---------- Các chú tiểu trong chùa: đi vòng quanh làm việc hằng ngày, khi có quả vừa hái thì ra bưng vào cúng Phật ----------
const novices = [];
const NOVICE_DEFS = [
  { id: 'novice1', name: 'Chú tiểu Tiểu Minh', x: 35, z: 24 },
  { id: 'novice2', name: 'Chú tiểu Tâm An', x: -6, z: 29 },
  { id: 'novice3', name: 'Chú tiểu Tịnh Giác', x: 54, z: 42 },
  { id: 'novice4', name: 'Chú tiểu Huệ Đăng', x: 4, z: 58 },
];

async function noviceGo(a, x, z, token) {
  if (!avatars.has(a.id) || a.noviceTask !== token) return false;
  const ok = await Promise.race([walkRoute(a, x, z), wait(24000).then(() => false)]);
  return ok && avatars.has(a.id) && a.noviceTask === token;
}

const NOVICE_CHORES = [
  // 1. Quét lá sân chùa
  async (a, token) => {
    if (!(await noviceGo(a, rnd(-9, 9), rnd(24.5, 36.5), token))) return;
    a.holdBroom(true);
    bubble(a, pick(['quét lá sân chùa', 'quét dọn sân chùa sạch sẽ']), 3600);
    for (let k = 0; k < 3; k++) {
      if (!(await noviceGo(a, rnd(-11, 11), rnd(24.5, 37), token))) break;
      if (!online) leaves.takeNear(a.pos.x, a.pos.z, 1.4);
      await wait(rnd(900, 1800));
      if (a.noviceTask !== token) break;
    }
    a.holdBroom(false);
  },
  // 2. Múc nước và tưới các luống rau
  async (a, token) => {
    if (!(await noviceGo(a, VEG.x1 - 1.5, VEG.z0 - 0.5, token))) return;
    a.act('stoop');
    bubble(a, 'múc nước lu sành tưới rau', 3200);
    await wait(1800);
    if (a.noviceTask !== token) return;
    for (let k = 0; k < 2; k++) {
      const idx = (Math.random() * VEG_PLOTS) | 0;
      const r = vegRect(idx);
      if (!(await noviceGo(a, r.minX - 0.25, (r.minZ + r.maxZ) / 2, token))) return;
      a.faceRy = Math.PI / 2;
      a.act('stoop');
      bubble(a, pick([`tưới nước luống ${VEG_KINDS[idx]}`, `nhổ cỏ luống ${VEG_KINDS[idx]}`]), 3400);
      await wait(rnd(2400, 3800));
      if (a.noviceTask !== token) return;
    }
  },
  // 3. Chăm sóc vườn cây ăn trái kế bên điện Quan Âm
  async (a, token) => {
    for (let k = 0; k < 2; k++) {
      const tr = pick(ORCHARD_TREES);
      if (!(await noviceGo(a, tr.x - 1.25, tr.z, token))) return;
      a.faceRy = Math.atan2(tr.x - a.pos.x, tr.z - a.pos.z);
      a.act('stoop');
      bubble(a, pick([`vun gốc ${tr.name}`, `chăm sóc ${tr.name}`, 'nhặt lá khô vườn quả']), 3400);
      await wait(rnd(2600, 4200));
      if (a.noviceTask !== token) return;
    }
  },
  // 4. Thăm đồng lúa
  async (a, token) => {
    const r = plotRect((Math.random() * PLOTS) | 0);
    if (!(await noviceGo(a, r.minX - 0.2, (r.minZ + r.maxZ) / 2, token))) return;
    a.act('gassho');
    bubble(a, pick(['thăm đồng lúa chùa', 'xem nước bờ ruộng', 'canh chim sẻ ngoài ruộng']), 3400);
    await wait(rnd(2800, 4500));
  },
  // 5. Lau bụi tượng La Hán ở hành lang
  async (a, token) => {
    const s = Math.random() < 0.5 ? -1 : 1;
    const z = rnd(47, 76);
    if (!(await noviceGo(a, s * 14.5, z, token))) return;
    a.holdCloth(true);
    a.act('wipe', s > 0 ? Math.PI / 2 : -Math.PI / 2);
    bubble(a, 'lau bụi tượng La Hán', 3400);
    await wait(3200);
    a.holdCloth(false);
  },
  // 6. Múc nước Giếng Ngọc & cho cá koi ăn ở hồ sen
  async (a, token) => {
    const [wx, wz] = ringAround(WELL.x, WELL.z, WELL.r + 1.25);
    if (!(await noviceGo(a, wx, wz, token))) return;
    a.faceRy = Math.atan2(WELL.x - a.pos.x, WELL.z - a.pos.z);
    a.act('stoop');
    bubble(a, 'múc nước Giếng Ngọc về pha trà', 3400);
    await wait(rnd(2600, 4000));
  },
  // 7. Châm dầu đèn & lễ Phật ở điện Quan Âm rồi ra lại sân
  async (a, token) => {
    if (!(await noviceGo(a, QAHALL.cx + rnd(-1.6, 1.6), 9.4, token))) return;
    a.act('bow', Math.PI);
    bubble(a, pick(['châm dầu đèn bàn thờ', 'lễ Quan Âm Bồ Tát', 'Nam mô Quán Thế Âm Bồ Tát']), 3600);
    await wait(3600);
    if (a.noviceTask !== token) return;
    await noviceGo(a, QAHALL.cx + rnd(-4, 4), 24, token);
  },
  // 8. Lên đồi lễ Phật ở điện Tam Thế rồi xuống sân
  async (a, token) => {
    if (!(await noviceGo(a, rnd(-2.5, 2.5), TAMTHE.z0 + 6.5, token))) return;
    a.act('bow', Math.PI);
    bubble(a, pick(['dọn hương án điện Tam Thế', 'lễ Tam Thế Phật']), 3600);
    await wait(3600);
    if (a.noviceTask !== token) return;
    await noviceGo(a, rnd(-6, 6), 27, token);
  },
];

async function noviceCarryFruit(a, i) {
  const tr = ORCHARD_TREES[i];
  if (!tr) return;
  const token = (a.noviceTask = {});
  a.carryingFruit = true;
  a.holdBroom(false);
  a.holdCloth(false);
  try {
    bubble(a, `đi nhận ${tr.fruit} cúng Phật`, 3800);
    const bx = tr.x + 0.65, bz = tr.z + 0.55;
    if (!(await noviceGo(a, bx + 0.35, bz + 0.35, token))) return;
    a.faceRy = Math.atan2(bx - a.pos.x, bz - a.pos.z);
    a.act('stoop');
    await wait(1100);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    const color = world.orchard.takeBasket(i);
    a.holdBasket(color);
    bubble(a, `bưng rổ ${tr.fruit} vào cúng Phật`, 4500);
    await wait(450);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    if (!(await noviceGo(a, QAHALL.cx - 1.1, 8.6, token))) return;
    a.faceRy = Math.PI;
    a.act('stoop');
    await wait(1000);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    a.holdBasket(null);
    world.orchard.placeOffering(i);
    sound.bow();
    await a.walk(QAHALL.cx - 1.1, 9.6);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    a.act('bow', Math.PI);
    bubble(a, `dâng ${tr.fruit} cúng Phật, hồi hướng phước lành`, 4200);
    await wait(3400);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    // lễ xong đi ra sân tiếp tục công việc hằng ngày
    await noviceGo(a, QAHALL.cx + rnd(-3, 5), 23.5, token);
  } finally {
    a.holdBasket(null);
    a.carryingFruit = false;
  }
}

async function noviceCarryVeg(a, i) {
  const kindName = VEG_KINDS[i];
  if (!kindName) return;
  const r = vegRect(i);
  const bx = (r.minX + r.maxX) / 2, bz = r.minZ + 0.45;
  const token = (a.noviceTask = {});
  a.carryingFruit = true;
  a.holdBroom(false);
  a.holdCloth(false);
  try {
    bubble(a, `đi nhận rổ ${kindName} vừa hái`, 3800);
    if (!(await noviceGo(a, bx, r.minZ - 0.25, token))) return;
    a.faceRy = Math.atan2(bx - a.pos.x, bz - a.pos.z);
    a.act('stoop');
    await wait(1100);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    const color = world.veg.takeBasket(i);
    a.holdBasket(color);
    bubble(a, `bưng rổ ${kindName} tươi vào chùa`, 4500);
    await wait(450);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    if (!(await noviceGo(a, QAHALL.cx + 1.1, 8.6, token))) return;
    a.faceRy = Math.PI;
    a.act('stoop');
    await wait(1000);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    a.holdBasket(null);
    world.veg.placeOffering(i);
    sound.bow();
    await a.walk(QAHALL.cx + 1.1, 9.6);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    a.act('bow', Math.PI);
    bubble(a, `dâng ${kindName} tươi thanh tịnh cúng Phật`, 4200);
    await wait(3400);
    if (!avatars.has(a.id) || a.noviceTask !== token) return;
    // lễ xong đi ra sân tiếp tục công việc hằng ngày
    await noviceGo(a, QAHALL.cx + rnd(-3, 5), 23.5, token);
  } finally {
    a.holdBasket(null);
    a.carryingFruit = false;
  }
}

async function noviceLoop(a, startIdx = 0) {
  let step = startIdx;
  while (avatars.has(a.id)) {
    if (a.vegQueue?.length) {
      const bedIdx = a.vegQueue.shift();
      await noviceCarryVeg(a, bedIdx);
      continue;
    }
    if (a.fruitQueue?.length) {
      const treeIdx = a.fruitQueue.shift();
      await noviceCarryFruit(a, treeIdx);
      continue;
    }
    const token = (a.noviceTask = {});
    const chore = NOVICE_CHORES[step % NOVICE_CHORES.length];
    step += 1 + ((Math.random() * 3) | 0);
    await chore(a, token);
    a.holdBroom(false);
    a.holdCloth(false);
    if (!a.vegQueue?.length && !a.fruitQueue?.length) await wait(rnd(600, 1600));
  }
}

function makeNovices() {
  novices.length = 0;
  NOVICE_DEFS.forEach((def, idx) => {
    const a = addAvatar(new Avatar({ id: def.id, name: def.name, novice: true }));
    a.zone = 'out';
    a.setSandals(SANDAL_COLORS[0]);
    a.wearSandals(true);
    a.placeAt(def.x, def.z, rnd(-Math.PI, Math.PI));
    a.fruitQueue = [];
    a.vegQueue = [];
    novices.push(a);
    noviceLoop(a, idx * 2);
  });
}

function sendNoviceForVeg(i) {
  if (!VEG_KINDS[i] || !novices.length) return;
  const r = vegRect(i);
  const bx = (r.minX + r.maxX) / 2, bz = r.minZ + 0.45;
  // chọn chú tiểu đang rảnh và đứng gần luống rau vừa hái nhất
  const free = novices.filter((n) => avatars.has(n.id) && !n.carryingFruit && !n.fruitQueue?.length && !n.vegQueue?.length);
  const pool = free.length ? free : novices.filter((n) => avatars.has(n.id));
  if (!pool.length) return;
  pool.sort((a, b) => Math.hypot(a.pos.x - bx, a.pos.z - bz) - Math.hypot(b.pos.x - bx, b.pos.z - bz));
  const chosen = pool[0];
  chosen.vegQueue.push(i);
  if (!chosen.carryingFruit) {
    // ngắt việc đang làm để ra vườn nhận rổ rau ngay
    chosen.noviceTask = {};
    chosen.stop();
  }
}

function sendNoviceForFruit(i) {
  const tr = ORCHARD_TREES[i];
  if (!tr || !novices.length) return;
  // chọn chú tiểu đang rảnh và đứng gần cây vừa hái nhất
  const free = novices.filter((n) => avatars.has(n.id) && !n.carryingFruit && !n.fruitQueue?.length && !n.vegQueue?.length);
  const pool = free.length ? free : novices.filter((n) => avatars.has(n.id));
  if (!pool.length) return;
  pool.sort((a, b) => Math.hypot(a.pos.x - tr.x, a.pos.z - tr.z) - Math.hypot(b.pos.x - tr.x, b.pos.z - tr.z));
  const chosen = pool[0];
  chosen.fruitQueue.push(i);
  if (!chosen.carryingFruit) {
    // ngắt việc đang làm để đi nhận rổ quả ngay
    chosen.noviceTask = {};
    chosen.stop();
  }
}

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
  const entry = applyEvent(localProfile, kind, { ...opts, fest: festival });
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
  rl.append(el('li', null, `Ngày mùng một và ngày Rằm (âm lịch): điểm phước ×${FESTIVAL_PHUOC}, điểm nghiệp và giới hạn mỗi ngày giữ nguyên${festival ? ` — hôm nay là ${festival.name}` : ''}`));
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
  $('#inc-title').textContent = { tower: 'Thắp nhang dâng xá lợi Phật trên tháp', qahall: 'Thắp nhang trong điện Quan Âm', tamthe: 'Thắp nhang dâng Tam Thế Phật' }[place] ?? 'Thắp nhang';
  $('#modal-incense .muted').textContent = {
    tower: 'Bạn sẽ bước tới trước bàn thờ xá lợi Phật trên tầng 13, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
    qahall: 'Bạn sẽ bước tới trước bàn thờ Quan Âm Bồ Tát trong điện, chắp tay vái lạy rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
    tamthe: 'Bạn sẽ bước tới lư hương giữa điện Tam Thế, chắp tay vái lạy ba đức Phật rồi cắm nhang. Nhang cháy khoảng ba phút, mọi người đều thấy.',
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
    toast(wish ? 'Lời nguyện của bạn đã theo làn khói hương bay lên' : `Bạn đã thắp ${n} nén nhang${{ qahall: ' dâng Quan Âm Bồ Tát', tamthe: ' dâng Tam Thế Phật', tower: ' dâng xá lợi Phật trên tháp' }[place] ?? ''}`, 4200);
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
  const s = world.greatBell.spot;
  // người đứng ở đầu dây thì ngả người kéo chày rồi buông
  if (by && Math.hypot(by.pos.x - s.x, by.pos.z - s.z) < 1.2) by.act('pull', Math.PI);
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
  if (Math.hypot(player.pos.x - bellRun.spot.x, player.pos.z - bellRun.spot.z) > 0.8) {
    bellRun = null;
    return;
  }
  bellRun.started = true;
  // quay mặt vào chày, chắp tay rồi nắm dây kéo
  player.act('gassho', Math.PI);
  setTimeout(() => {
    bellRun = null;
    ringGreatBell(player);
    net?.send({ t: 'act', a: 'greatbell' });
    earnBell();
    toast('Bạn đã thỉnh một hồi đại hồng chung — nguyện tiếng chuông vang xa, chúng sinh an lạc', 4200);
  }, 1100);
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
  if ((sound.chanting || sound.zenMusic) && sound.ctx?.state === 'running' && !settings.muted) chantSec += Math.min(60, (now - chantTick) / 1000);
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
  const dogHit = pickDog();
  if (dogHit && (!firstHit || camera.position.distanceTo(dogHit.root.position) < firstHit.distance + 0.6)) {
    petDog(dogHit);
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
  if (kind === 'field') {
    clickField(firstHit.point.x, firstHit.point.z);
    return;
  }
  if (kind === 'veg') {
    clickVeg(firstHit, o);
    return;
  }
  if (kind === 'orchard') {
    clickOrchard(firstHit, o);
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
  if (kind === 'lahan') {
    clickLahan(o.userData.ids[firstHit.instanceId]);
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
  if (kind === 'zen') {
    // chạm vào đài sen giữa đài thiền: đến ngồi bồ đoàn còn trống gần mình nhất (đang ở dưới thì lên đài trước)
    if (player.seat != null && seats[player.seat]?.place === 'zen') {
      toast('Bạn đang ngồi thiền — chạm chỗ khác trên sàn để đứng dậy', 2600);
    } else {
      const free = seats.filter((s) => s.place === 'zen' && !seatTaken(s.index, player));
      const from = onZen(player) ? player.pos : new THREE.Vector3(ZL.arrive.x, 0, ZL.arrive.z);
      const s = free.sort((p, q) => Math.hypot(p.x - from.x, p.z - from.z) - Math.hypot(q.x - from.x, q.z - from.z))[0];
      if (s) movePlayerTo(s.x, s.z, s);
      else toast('Các bồ đoàn trên đài thiền đều đã có người ngồi', 2600);
    }
    hideHint();
    return;
  }
  if (kind === 'zen-stair') {
    if (onZen(player)) movePlayerTo(ZL.foot.x, ZL.foot.z);
    else movePlayerTo(ZL.arrive.x, ZL.arrive.z);
    hideHint();
    return;
  }
  let seat = null;
  if (kind === 'seat') seat = seats[firstHit.instanceId];
  else if (kind === 'floor' || kind === 'ground') {
    const p = firstHit.point;
    seat = seats.find((s) => Math.abs(s.x - p.x) < 0.65 && Math.abs(s.z - p.z) < 0.75) ?? null;
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
  // nhìn toàn cảnh: chuột phải (hoặc giữ Shift) kéo để xoay, kéo thường để dời góc nhìn
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, rotate: e.button === 2 || e.shiftKey });
  if (pointers.size === 1) dragDist = 0;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: cam.dist };
    dragDist = 999;
  }
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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
      if (ov.on && !p.rotate) {
        panOverview(dx, dy);
      } else if (ov.on) {
        cam.yaw -= dx * 0.005;
        cam.pitch = clamp(cam.pitch + dy * 0.004, OV.pitchMin, OV.pitchMax);
      } else {
        cam.yaw -= dx * 0.0055;
        cam.pitch = clamp(cam.pitch + dy * 0.004, 0.04, 1.15);
      }
      hideHint();
    }
  } else if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const maxD = onZen(player) ? 38 : 18;
    cam.dist = ov.on ? clamp((pinch.dist * pinch.d) / Math.max(d, 1), OV.distMin, OV.distMax) : clamp((pinch.dist * pinch.d) / Math.max(d, 1), 2.8, maxD);
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
  const maxD = onZen(player) ? 38 : 18;
  cam.dist = ov.on ? clamp(cam.dist * k, OV.distMin, OV.distMax) : clamp(cam.dist * k, 2.8, maxD);
}, { passive: false });

// ---------- Nhìn toàn cảnh chùa từ trên cao ----------
// Camera bay lên cao nhìn cả khuôn viên; chạm xuống đất vẫn điều khiển nhân vật đi tới đó.
const OV = { distMin: 35, distMax: 260, pitchMin: 0.45, pitchMax: 1.45, bounds: { x: 75, z0: -110, z1: 130 } };
const ov = { on: false, focus: new THREE.Vector3(0, 0, 6), saved: null };
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
function panOverview(dx, dy) {
  // kéo theo ngón tay: cảnh trôi cùng chiều kéo
  const s = cam.curDist * 0.0016;
  const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw); // sang phải trên màn hình
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw); // hướng camera nhìn tới
  const b = OV.bounds;
  ov.focus.x = clamp(ov.focus.x - rx * dx * s + fx * dy * s, -b.x, b.x);
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
  // sương mù nhẹ đi khi nhìn từ trên cao, để thấy rõ cả khuôn viên
  scene.fog.near = on ? 260 : 60;
  scene.fog.far = on ? 900 : 230;
  if (on) {
    ov.saved = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
    ov.focus.set(clamp(player.pos.x * 0.4, -20, 20), 0, clamp(player.pos.z * 0.4 + 4, -40, 50));
    cam.pitch = 0.95;
    cam.dist = 165;
    showHint(isCoarse ? 'Toàn cảnh chùa · kéo để dời · chụm hai ngón để phóng to · chạm đất để đi tới' : 'Toàn cảnh chùa · kéo để dời · chuột phải kéo để xoay · lăn chuột để phóng to · nhấp đất để đi tới · V để trở lại', 7000);
  } else {
    Object.assign(cam, ov.saved);
    showHint(baseHint, 4000);
  }
}
$('#btn-overview').addEventListener('click', () => setOverview(!ov.on));

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
  canvas.classList.toggle('can-pick', k === 'seat' || k === 'bell' || k === 'drum' || k === 'merit' || k === 'broom' || k === 'field' || k === 'veg' || k === 'orchard' || k === 'tower' || k === 'greatbell' || k === 'zen' || k === 'zen-stair' || k === 'lahan' || ray.intersectObjects(rack.hitboxes(), false).length > 0 || !!pickAvatar() || !!pickDog());
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
  if (k === 'v') setOverview(!ov.on);
  if (k === 'escape' && ov.on) setOverview(false);
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
  const loft = loftOf(player);
  const [x, z] = loft ? LOFTS[loft].clamp(nx, nz) : clampZone(zoneOfA(player), nx, nz);
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
  if (ov.on) {
    cam.target.lerp(ov.focus, 1 - Math.exp(-4 * dt));
    cam.curDist += (cam.dist - cam.curDist) * (1 - Math.exp(-3 * dt));
    cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-3 * dt));
    const cp = Math.cos(cam.curPitch);
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist,
      Math.max(3, cam.target.y + Math.sin(cam.curPitch) * cam.curDist),
      cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist,
    );
    camera.lookAt(cam.target);
    // mũi tên vàng chỉ chỗ mình đứng, to lên khi camera ở xa
    // ở trong điện thì mũi tên nổi lên trên mái cho khỏi bị che
    const roofed = zoneOfA(player) === 'in' ? 18.5 : inQaHall(player) ? 9.5 : inTamThe(player) && player.pos.z < TAMTHE.z1 + 0.5 && Math.abs(player.pos.x) < 12.5 ? 12.5 : 4.6;
    ovMarker.position.set(player.root.position.x, player.root.position.y + roofed + Math.sin(performance.now() / 300) * 0.4, player.root.position.z);
    ovMarker.scale.setScalar(clamp(cam.curDist / 70, 0.6, 3));
    return;
  }
  const want = new THREE.Vector3(player.root.position.x, player.root.position.y + 1.1 - 0.15 * player.p.sit, player.root.position.z);
  cam.target.lerp(want, k);
  const high = onTower(player);
  const zenHigh = onZen(player);
  // trên đài thiền: đẩy xa màn sương để nhìn rõ toàn cảnh khuôn viên chùa
  // mái đài thiền mờ đi khi camera bay cao hơn chân mái mà người chơi đang ở dưới mái
  world.zenRoof?.setFade(zenHigh && camera.position.y > world.zenRoof.eaveY - 0.3 ? 0.18 : 1);
  if (!ov.on) {
    scene.fog.near = zenHigh ? 140 : 60;
    scene.fog.far = zenHigh ? 480 : 230;
  }
  // trong gác chuông: trên cầu thang thì camera thấp dưới mái tầng dưới, trên gác thì giữa lan can và mái trên
  const inBell = Math.abs(player.pos.x - BL.x) < 4.8 && Math.abs(player.pos.z - BL.z) < 4.8;
  const bellLoft = inBell && loftOf(player) === 'bell';
  cam.curDist += (Math.min(cam.dist, high ? 7 : inBell ? 6 : Infinity) - cam.curDist) * (1 - Math.exp(-4 * dt));
  cam.curPitch += (cam.pitch - cam.curPitch) * (1 - Math.exp(-4 * dt));
  // ở ngoài sân / trên thềm thì camera được lùi ra ngoài chánh điện
  const outside = zoneOfA(player) === 'out' || player.pos.z > HALL.maxZ;
  cam.maxZ += ((outside ? 112 : 18.6) - cam.maxZ) * (1 - Math.exp(-3 * dt));
  // sau chánh điện (sân sau, bậc thang, nền đồi): camera không lọt qua tường hậu vào trong
  if (outside && player.pos.z < -21.4 && Math.abs(player.pos.x) < 16) cam.maxZ = -21.9;
  const cp = Math.cos(cam.curPitch);
  camera.position.set(
    clamp(cam.target.x + Math.sin(cam.yaw) * cp * cam.curDist, high ? -19 : zenHigh ? -72 : outside ? -46 : -14.5, outside ? 76 : 14.5),
    clamp(cam.target.y + Math.sin(cam.curPitch) * cam.curDist, bellLoft ? BL.y + 0.8 : zenHigh ? ZL.y + 0.5 : 0.4, high ? TOWER.topY + 3.2 : bellLoft ? BL.y + 3.0 : inBell ? BL.base + 2.2 : zenHigh ? ZL.y + 24 : outside ? Math.max(22, cam.target.y + 9) : 9.4),
    clamp(cam.target.z + Math.cos(cam.yaw) * cp * cam.curDist, outside ? -100 : -15.2, cam.maxZ),
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
  for (const d of dogs) {
    d.labelEl.hidden = !settings.showNames;
    if (settings.showNames) placeLabel(d.labelEl, d, { fade: true });
  }
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
      if (r.site !== 'ammay' && !list.querySelector('.site-head')) {
        const h = document.createElement('p');
        h.className = 'site-head';
        h.textContent = `Khu ${SITES[r.site].name} — hồ lớn, cổng Tam Quan sát mặt nước`;
        list.append(h);
      }
      const b = document.createElement('button');
      b.className = 'room' + (r.id === roomId ? ' current' : '');
      const c = counts?.find((x) => x.id === r.id)?.count;
      const idle = r.site === 'ammay' ? 'Vào chánh điện' : `Sang khu ${SITES[r.site].name}`;
      b.innerHTML = `<b></b><small>${r.id === roomId ? 'Bạn đang ở đây' : c != null ? `${c} người` : idle}</small>`;
      b.querySelector('b').textContent = r.name;
      b.addEventListener('click', () => {
        closeModal($('#modal-room'));
        if (r.site !== 'ammay') location.href = roomUrl(r);
        else if (r.id !== roomId) {
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
// nút đổi bài nhạc thiền: chỉ hiện khi đang ở trên đài thiền
const zenTrackBtn = $('#btn-zen-track');
const zenTrackSel = $('#set-zen-track');
for (const t of ZEN_TRACKS) zenTrackSel.append(new Option(t.name, t.id));
function showZenTrack() {
  zenTrackBtn.querySelector('.txt').textContent = sound.zenTrack.name;
  zenTrackSel.value = sound.zenTrack.id;
}
function pickZenTrack(id) {
  settings.zenTrack = id;
  saveSettings();
  showZenTrack();
  // đang ở trên đài thiền thì phát luôn bài vừa chọn
  if (onZen(player)) {
    sound.setZenMusic(true);
    if (settings.muted) {
      settings.muted = false;
      sound.apply();
      syncMute();
    }
    chantBtn.setAttribute('aria-pressed', true);
    chantBtn.querySelector('.txt').textContent = 'Dừng nhạc thiền';
    toast(`Đang phát nhạc thiền: ${sound.zenTrack.name}`, 2800);
  } else if (sound.zenMusic) sound.setZenMusic(true);
}
zenTrackBtn.addEventListener('click', () => {
  const i = ZEN_TRACKS.findIndex((t) => t.id === sound.zenTrack.id);
  pickZenTrack(ZEN_TRACKS[(i + 1) % ZEN_TRACKS.length].id);
});
zenTrackSel.addEventListener('change', () => pickZenTrack(zenTrackSel.value));
showZenTrack();
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
let wasOnZen = false;
function syncZenAudio(forceOnZen = onZen(player)) {
  const isZen = !!forceOnZen;
  sound.zenOnly = isZen;
  if (isZen) {
    if (sound.chanting) {
      sound.setChant(false);
      sound.setZenMusic(true);
      toast('Trên đài thiền giữ tĩnh lặng — đã chuyển từ tụng kinh sang nhạc thiền không lời', 4000);
    } else if (!wasOnZen && !sound.zenMusic && !settings.muted) {
      sound.setZenMusic(true);
    }
    const on = sound.zenMusic;
    chantBtn.setAttribute('aria-pressed', on);
    chantBtn.querySelector('.txt').textContent = on ? 'Dừng nhạc thiền' : 'Mở nhạc thiền không lời';
    caption.hidden = true;
    zenTrackBtn.hidden = false;
    showZenTrack();
  } else {
    zenTrackBtn.hidden = true;
    if (wasOnZen && sound.zenMusic) {
      sound.setZenMusic(false);
    }
    const on = sound.chanting;
    chantBtn.setAttribute('aria-pressed', on);
    chantBtn.querySelector('.txt').textContent = on ? 'Dừng tụng kinh' : 'Nghe tụng kinh';
    caption.hidden = !on;
  }
  wasOnZen = isZen;
}
chantBtn.addEventListener('click', () => {
  const on = chantBtn.getAttribute('aria-pressed') !== 'true';
  if (onZen(player)) {
    sound.setZenMusic(on);
    if (on && settings.muted) {
      settings.muted = false;
      sound.apply();
      syncMute();
    }
    chantBtn.setAttribute('aria-pressed', on);
    chantBtn.querySelector('.txt').textContent = on ? 'Dừng nhạc thiền' : 'Mở nhạc thiền không lời';
    caption.hidden = true;
    hintEl.classList.add('hide');
    if (on) toast('Đang phát nhạc thiền không lời trên đài thiền', 2800);
    return;
  }
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
const chanting = () => chantBtn.getAttribute('aria-pressed') === 'true' && !onZen(player);

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
let lodT = 0;
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
  dogsThink(elapsed, dt);
  incenseRitual();
  meritRitual();
  broomRitual();
  harvestTick();
  greatBellRitual();
  wipeRitual();
  sweepLeaves(dt);
  scriptWatchdog(dt);
  rack.update(dt);
  leaves.update(dt);
  if (!ov.on) world.setFocus(player.pos.x, player.pos.z); // nhìn toàn cảnh thì giữ nguyên vùng bóng đổ
  if ((lodT -= dt) < 0) {
    lodT = 0.4;
    // nhìn toàn cảnh: tượng đều nằm dưới mái, ẩn hết cho nhẹ
    if (ov.on) world.updateLOD(Infinity, Infinity);
    else world.updateLOD(player.pos.x, player.pos.z);
    const d = Math.min(...world.falls.map((f) => player.root.position.distanceTo(f)));
    sound.setWaterfall(clamp(1 - d / 55, 0, 1));
  }
  if (onZen(player) !== wasOnZen) syncZenAudio();
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
