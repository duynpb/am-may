// Khu tự học sau điện Quan Âm: dãy 4 phòng học ngoại ngữ (Anh, Trung, Đức, Hàn) ở tầng trệt,
// tầng 2 ngay phía trên là phòng học Phật pháp (lên bằng cầu thang đá ngoài trời ở đầu hồi phía đông).
// Mỗi phòng có bàn học thấp + bồ đoàn, một kệ sách (bấm để chọn cách học) và một bảng đen trên tường.
import * as THREE from 'three';
import * as T from './textures.js';
import { t } from './i18n.js';

const GY = -0.36; // mặt đất ngoài sân (bằng PORCH.courtY)

// lang: mã giọng đọc / nhận dạng giọng nói của trình duyệt
export const STUDY_ROOMS = [
  { key: 'en', name: 'Tiếng Anh', plaque: 'TIẾNG ANH', lang: 'en-US' },
  { key: 'zh', name: 'Tiếng Trung', plaque: 'TIẾNG TRUNG', lang: 'zh-CN' },
  { key: 'de', name: 'Tiếng Đức', plaque: 'TIẾNG ĐỨC', lang: 'de-DE' },
  { key: 'ko', name: 'Tiếng Hàn', plaque: 'TIẾNG HÀN', lang: 'ko-KR' },
];
export const PHAT_ROOM = { key: 'phat', name: 'Phật pháp', plaque: 'PHẬT HỌC', lang: 'vi-VN' };

export const STUDY = (() => {
  // lùi về phía sau (bắc) để sân trước mặt tiền rộng, thoáng (mặt trước ở z = -16, sân trước kéo tới điện Quan Âm)
  const x0 = 26.5, x1 = 62.5, z0 = -28, z1 = -16, floor = 0.25, roofH = 3.4;
  const rw = (x1 - x0) / STUDY_ROOMS.length;
  const rooms = STUDY_ROOMS.map((r, i) => {
    const rx0 = x0 + i * rw, cx = rx0 + rw / 2;
    return { ...r, x0: rx0, x1: rx0 + rw, cx, shelfX: rx0 + 1.6, boardX: cx + 1.3 };
  });
  // 4 bàn mỗi phòng (2 dãy × 2), ngồi quay mặt về bảng đen phía bắc; bàn ở trước bồ đoàn 0,62 m
  const desks = [];
  for (const r of rooms) for (const z of [z1 - 7.4, z1 - 3.8]) for (const dx of [-1.9, 2.1]) desks.push({ x: r.cx + dx, z, room: r.key });
  return {
    x0, x1, z0, z1, floor, roofH, rw, rooms, desks, deskDz: -0.62,
    cx: (x0 + x1) / 2, cz: (z0 + z1) / 2,
    door: { x: (x0 + x1) / 2, z: z1 + 2.2 }, // giữa mặt trước (phía nam)
    walls: [x0, ...rooms.slice(1).map((r) => r.x0), x1], // tường hồi hai đầu và vách ngăn giữa các phòng
  };
})();

// Tầng 2 học Phật pháp nằm ngay trên dãy 4 phòng ngoại ngữ, lên bằng cầu thang đá ngoài trời ở đầu hồi phía đông.
// Để cách đi lại sẵn có (dựa vào toạ độ x, z) phân biệt được tầng trên / tầng dưới, chỗ đi lại trên tầng 2 dùng
// "toạ độ ảo": z lùi thêm VZ = -200 m. Khi vẽ (nhân vật, bồ đoàn, dấu chỉ đường…) thì đổi về toạ độ thật bằng toReal.
export const UP = (() => {
  const VZ = -200, h = STUDY.floor + 3.6, y = GY + h;
  const desks = [];
  const Z0 = STUDY.z0, Z1 = STUDY.z1;
  for (const z of [Z1 - 7.4, Z1 - 3.8]) for (const x of [36.5, 40.5, 48.5, 52.5]) desks.push({ x, z, room: 'phat' });
  return {
    VZ, h, y, roofH: 3.1,
    // cầu thang (toạ độ thật): dọc đầu hồi phía đông, chân ở phía nam, lên về phía bắc
    stair: { x0: 63.0, x1: 64.6, zFoot: Z1 + 1.6, zTop: Z0 + 1.6 },
    landing: { x0: 63.0, x1: 64.6, z0: Z0, z1: Z0 + 1.6 },
    floor: { x0: STUDY.x0 + 0.5, x1: STUDY.x1 - 0.5, z0: STUDY.z0 + 0.8, z1: STUDY.z1 - 0.6 }, // chỗ đi lại trên tầng 2 (toạ độ thật)
    foot: { x: 63.8, z: Z1 + 2.8 }, // ngoài sân, trước chân cầu thang
    entry: { x: 63.8, z: Z1 + 1.4 }, // bậc đầu tiên
    top: { x: 63.8, z: Z0 + 0.8 }, // chiếu nghỉ đầu cầu thang
    arrive: { x: 61.6, z: Z0 + 0.8 }, // bước vào sàn tầng 2
    shelfX: 40.0, boardX: 44.5,
    desks,
  };
})();
// toạ độ ảo (tầng 2) ↔ toạ độ thật
export const isUp = (z) => z < UP.VZ / 2;
export const toReal = (x, z) => (isUp(z) ? [x, z - UP.VZ] : [x, z]);
export const toUp = (x, z) => [x, z + UP.VZ];
// phòng học ở chỗ (x, z) — null nếu không ở khu tự học
export function studyRoomAt(x, z) {
  if (isUp(z)) return PHAT_ROOM;
  if (x < STUDY.x0 || x > STUDY.x1 || z < STUDY.z0 || z > STUDY.z1 + 0.5) return null;
  return STUDY.rooms.find((r) => x >= r.x0 && x <= r.x1) ?? null;
}

// ---------- Bảng đen: vẽ chữ phấn lên canvas ----------
function makeBoard(title) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const draw = (head, lines = []) => {
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 1024, 512);
    bg.addColorStop(0, '#24392d');
    bg.addColorStop(1, '#1b2c23');
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 512);
    // vệt phấn mờ đã lau
    g.globalAlpha = 0.06;
    g.fillStyle = '#ffffff';
    for (let k = 0; k < 14; k++) g.fillRect(40 + ((k * 137) % 900), 30 + ((k * 89) % 440), 160, 18);
    g.globalAlpha = 1;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#f3f0e2';
    const fit = (s, size, maxW) => {
      g.font = `600 ${size}px "Be Vietnam Pro", "Noto Sans", "Microsoft YaHei", "Malgun Gothic", sans-serif`;
      const w = g.measureText(s).width;
      if (w > maxW) g.font = `600 ${Math.floor((size * maxW) / w)}px "Be Vietnam Pro", "Noto Sans", "Microsoft YaHei", "Malgun Gothic", sans-serif`;
    };
    fit(head, 64, 940);
    g.fillText(head, 512, lines.length ? 90 : 220);
    g.fillStyle = '#e8dcb0';
    g.fillRect(312, lines.length ? 138 : 268, 400, 3);
    g.fillStyle = '#f3f0e2';
    lines.slice(0, 4).forEach((ln, i) => {
      fit(ln, i === 0 ? 56 : 40, 940);
      g.fillText(ln, 512, 205 + i * 78);
    });
    tex.needsUpdate = true;
  };
  draw(title);
  return { tex, draw };
}

// ---------- Dựng khu tự học ----------
export function buildStudy({ scene, std, box, cyl, mesh, boardMat, mats, pickables, obstacles }) {
  const { sideCol, sideWall, sideTile, stoneL, stoneM, gold, bronze } = mats;
  const boards = new Map(); // phòng → bảng đen (vẽ lại khi học)
  const shelfM = std('#5b3a24', { roughness: 0.7 }), shelfBoard = std('#7a5233', { roughness: 0.7 });
  const bookMat = std('#ffffff', { roughness: 0.8 });
  const palette = ['#8c2f24', '#2f4f6b', '#6b5a2f', '#3c5a3a', '#7a6a55', '#a07a3a', '#4a3a5a', '#d8cbb0'];
  const frameM = std('#6b4428', { roughness: 0.6 });
  const deskM = std('#6b4428', { roughness: 0.55 }), pageM = std('#f4ecd8', { roughness: 0.9 });
  const lampM = new THREE.MeshStandardMaterial({ color: '#ffe2a8', emissive: '#ffb84a', emissiveIntensity: 0.9, roughness: 0.6 });
  const cupM = std('#e8e2d2', { roughness: 0.3 });

  // kệ sách dựa tường bắc (bấm vào để chọn cách học)
  function shelf(room, x, y, z, P = scene) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData = { kind: 'shelf', room };
    P.add(g);
    pickables.push(g);
    const o = { parent: g };
    box(2.4, 2.3, 0.45, shelfM, 0, 1.15, 0.22, o);
    for (let k = 0; k < 4; k++) box(2.3, 0.04, 0.42, shelfBoard, 0, 0.25 + k * 0.6, 0.45, { ...o, cast: false });
    const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bookMat, 120);
    const o3 = new THREE.Object3D(), c = new THREE.Color();
    let n = 0;
    for (let k = 0; k < 4; k++) {
      let bx = -1.1;
      while (bx < 1.05 && n < 120) {
        const bw = 0.05 + Math.random() * 0.05, bh = 0.32 + Math.random() * 0.18;
        o3.position.set(bx + bw / 2, 0.27 + k * 0.6 + bh / 2, 0.44);
        o3.scale.set(bw, bh, 0.26);
        o3.rotation.z = Math.random() < 0.08 ? 0.12 : 0;
        o3.updateMatrix();
        books.setMatrixAt(n, o3.matrix);
        books.setColorAt(n, c.set(palette[Math.floor(Math.random() * palette.length)]));
        n++;
        bx += bw + 0.008;
      }
    }
    books.count = n;
    g.add(books);
  }
  // bảng đen khung gỗ treo tường bắc, có máng phấn
  function blackboard(room, title, x, y, z, P = scene) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData = { kind: 'board', room };
    P.add(g);
    pickables.push(g);
    const o = { parent: g };
    box(4.3, 2.15, 0.06, frameM, 0, 0, 0.03, o);
    const b = makeBoard(title);
    mesh(new THREE.PlaneGeometry(4.0, 1.95), new THREE.MeshStandardMaterial({ map: b.tex, roughness: 0.92 }), 0, 0, 0.07, { ...o, cast: false });
    box(4.0, 0.05, 0.12, frameM, 0, -1.03, 0.11, o);
    for (const dx of [-1.2, -1.05, 0.9]) box(0.08, 0.025, 0.025, std('#f4f1e6'), dx, -1.0, 0.12, o); // phấn
    boards.set(room, b);
  }
  function desk(x, z, FY, P = scene) {
    const dz = z + STUDY.deskDz, o = { parent: P };
    box(1.15, 0.05, 0.55, deskM, x, FY + 0.33, dz, o);
    for (const sx of [-1, 1]) box(0.06, 0.3, 0.5, deskM, x + sx * 0.52, FY + 0.15, dz, o);
    const bk = new THREE.Group();
    bk.position.set(x - 0.1, FY + 0.365, dz + 0.05);
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.27), pageM);
      p.position.x = s * 0.1;
      p.rotation.z = -s * 0.08;
      bk.add(p);
    }
    P.add(bk);
    cyl(0.05, 0.06, 0.03, bronze, x + 0.38, FY + 0.37, dz - 0.12, o, 10);
    cyl(0.012, 0.012, 0.22, bronze, x + 0.38, FY + 0.47, dz - 0.12, o, 6);
    cyl(0.06, 0.11, 0.1, lampM, x + 0.38, FY + 0.6, dz - 0.12, { ...o, cast: false }, 14);
    cyl(0.035, 0.028, 0.05, cupM, x - 0.38, FY + 0.38, dz + 0.1, o, 10);
  }
  // mái ngói hai tầng; mờ đi khi camera bay cao hơn chân mái mà người chơi đang ở dưới mái
  function fadeRoof(cx, cz, y, w, d) {
    const roofG = new THREE.Group();
    roofG.position.set(cx, y, cz);
    scene.add(roofG);
    const tileM = sideTile.clone(), beamM = sideCol.clone(), wallM2 = sideWall.clone();
    const fadeMats = [tileM, beamM, wallM2];
    for (const m of fadeMats) m.transparent = true;
    const ro = { parent: roofG };
    for (const s of [-1, 1]) {
      box(w + 0.3, 0.26, 0.24, beamM, 0, -0.13, (s * d) / 2, ro);
      box(0.24, 0.26, d + 0.3, beamM, (s * w) / 2, -0.13, 0, ro);
    }
    const ceil = mesh(new THREE.PlaneGeometry(w + 0.4, d + 0.4).rotateX(Math.PI / 2), std('#4a2e1c', { roughness: 0.85 }), 0, 0.02, 0, { parent: roofG, cast: false });
    const pyr = (pw, pd, h, top) => new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).scale(pw, h, pd);
    const tw = w + 2.6, td = d + 2.6;
    mesh(pyr(tw, td, 1.4, 0.62), tileM, 0, 0.7, 0, ro);
    box(tw * 0.62 - 1.2, 0.7, td * 0.62 - 1.2, wallM2, 0, 1.75, 0, ro);
    mesh(pyr(tw * 0.62 + 1.4, td * 0.62 + 1.4, 1.6, 0.25 + 0.3 * Math.min(1, (tw - td) / tw)), tileM, 0, 2.9, 0, ro);
    let shown = 1;
    return {
      eaveY: y,
      setFade(v) {
        if (Math.abs(v - shown) < 0.01) return;
        shown = v;
        for (const m of fadeMats) {
          m.opacity = v;
          m.depthWrite = v > 0.95;
        }
        ceil.visible = v > 0.95;
      },
    };
  }

  // ===== Tầng trệt: dãy 4 phòng học ngoại ngữ =====
  const ST = STUDY, w = ST.x1 - ST.x0, d = ST.z1 - ST.z0, FY = GY + ST.floor;
  const H1 = UP.y - FY - 0.3; // chiều cao tường tầng trệt (tới dưới sàn tầng 2)
  box(w + 0.8, ST.floor - 0.02, d + 0.8, stoneL, ST.cx, GY + (ST.floor - 0.02) / 2, ST.cz);
  const floorS = box(w + 0.2, 0.04, d + 0.2, std('#9a6b43', { roughness: 0.7 }), ST.cx, FY - 0.01, ST.cz, { cast: false });
  floorS.userData.kind = 'ground';
  pickables.push(floorS);
  // tường sau, tường hồi hai đầu, vách ngăn giữa các phòng
  box(w + 0.3, H1, 0.2, sideWall, ST.cx, FY + H1 / 2, ST.z0 - 0.12);
  for (const x of ST.walls) box(0.2, H1, d, sideWall, x, FY + H1 / 2, ST.cz - 0.3);
  // cột son mặt trước (cao suốt hai tầng), bậc lên trước mỗi phòng
  for (const r of ST.rooms) {
    for (const x of [r.x0, r.cx, r.x1]) {
      if (x !== r.x0 || r === ST.rooms[0]) cyl(0.17, 0.2, UP.h + UP.roofH - ST.floor, sideCol, x, FY + (UP.h + UP.roofH - ST.floor) / 2, ST.z1, {}, 10);
      cyl(0.25, 0.25, 0.12, stoneM, x, FY + 0.06, ST.z1, {}, 10);
    }
    box(3.0, ST.floor * 0.5, 0.6, stoneL, r.cx, GY + ST.floor * 0.25, ST.z1 + 0.7);
    // biển tên phòng trên xà trước tầng trệt
    box(2.7, 0.62, 0.07, gold, r.cx, FY + H1 - 0.45, ST.z1 + 0.12);
    mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat([r.plaque], { w: 1024, h: 200, size: 104 }), r.cx, FY + H1 - 0.45, ST.z1 + 0.17, { cast: false });
    shelf(r.key, r.shelfX, FY, ST.z0 - 0.02);
    blackboard(r.key, t(r.name), r.boardX, FY + 1.75, ST.z0 - 0.02);
  }
  for (const k of ST.desks) desk(k.x, k.z, FY);
  // trần tầng trệt (mặt dưới sàn tầng 2) và mái hiên nhỏ che mặt trước tầng trệt
  mesh(new THREE.PlaneGeometry(w + 0.4, d + 0.4).rotateX(Math.PI / 2), std('#4a2e1c', { roughness: 0.85 }), ST.cx, UP.y - 0.31, ST.cz, { cast: false });
  // biển NHÀ TỰ HỌC ở đầu hồi phía tây
  box(0.07, 0.62, 2.7, gold, ST.x0 - 0.12, FY + H1 - 0.45, ST.cz);
  mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat(['NHÀ TỰ HỌC'], { w: 1024, h: 200, size: 104 }), ST.x0 - 0.17, FY + H1 - 0.45, ST.cz, { cast: false }).rotation.y = -Math.PI / 2;
  obstacles.push({ minX: ST.x0 - 0.4, maxX: ST.x1 + 0.4, minZ: ST.z0 - 0.5, maxZ: ST.z0 + 0.7 }); // tường sau và kệ sách

  // ===== Tầng 2: phòng học Phật pháp, dựng trong nhóm riêng để làm mờ khi mình ở tầng dưới mà camera bay cao =====
  const upG = new THREE.Group();
  scene.add(upG);
  const uo = { parent: upG };
  // mái hiên nhỏ che mặt trước tầng trệt (mờ cùng tầng 2, để camera nhìn được vào phòng bên dưới)
  box(w + 1.6, 0.12, 1.5, sideTile, ST.cx, UP.y - 0.2, ST.z1 + 0.85, uo).rotation.x = 0.28;
  const floorU = box(w + 0.6, 0.3, d + 0.6, std('#9a6b43', { roughness: 0.7 }), ST.cx, UP.y - 0.15, ST.cz, { ...uo, cast: false });
  floorU.userData = { kind: 'ground', up: true };
  pickables.push(floorU);
  // tường bắc (kệ sách, bảng đen), tường hồi tây; tường hồi đông chừa cửa ra chiếu nghỉ cầu thang
  box(w + 0.3, UP.roofH, 0.2, sideWall, ST.cx, UP.y + UP.roofH / 2, ST.z0 - 0.12, uo);
  box(0.2, UP.roofH, d, sideWall, ST.x0, UP.y + UP.roofH / 2, ST.cz - 0.3, uo);
  {
    const z0 = ST.z0, door = UP.landing.z1 + 0.1, z1 = ST.z1 - 0.6;
    box(0.2, UP.roofH, z1 - door, sideWall, ST.x1, UP.y + UP.roofH / 2, (door + z1) / 2, uo);
    box(0.2, UP.roofH - 2.3, door - z0, sideWall, ST.x1, UP.y + 2.3 + (UP.roofH - 2.3) / 2, (z0 + door) / 2, uo);
  }
  // lan can mặt trước tầng 2
  {
    const ry = UP.y, z = ST.z1 + 0.1;
    box(w, 0.08, 0.1, sideCol, ST.cx, ry + 0.9, z, uo);
    box(w, 0.06, 0.06, sideCol, ST.cx, ry + 0.4, z, uo);
    for (let x = ST.x0; x <= ST.x1 + 0.01; x += 1.0) box(0.08, 0.9, 0.08, sideCol, x, ry + 0.45, z, uo);
  }
  // biển PHẬT HỌC ở đầu hồi phía đông, trên cửa ra chiếu nghỉ cầu thang (người leo lên thấy ngay, ở trong phòng không bị che)
  {
    const bz = (ST.z0 + UP.landing.z1) / 2;
    box(0.07, 0.62, 2.7, gold, ST.x1 + 0.13, UP.y + 2.62, bz, uo);
    mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat([PHAT_ROOM.plaque], { w: 1024, h: 200, size: 104 }), ST.x1 + 0.18, UP.y + 2.62, bz, { ...uo, cast: false }).rotation.y = Math.PI / 2;
  }
  shelf('phat', UP.shelfX, UP.y, ST.z0 - 0.02, upG);
  blackboard('phat', t(PHAT_ROOM.name), UP.boardX, UP.y + 1.7, ST.z0 - 0.02, upG);
  for (const k of UP.desks) desk(k.x, k.z, UP.y, upG);
  // tranh chữ TĨNH TÂM giữa hai cụm bàn
  box(1.9, 1.2, 0.05, gold, ST.cx + 6.5, UP.y + 1.9, ST.z0 + 0.02, uo);
  mesh(new THREE.PlaneGeometry(1.75, 1.05), boardMat(['TĨNH', 'TÂM'], { w: 512, h: 320, size: 120 }), ST.cx + 6.5, UP.y + 1.9, ST.z0 + 0.06, { ...uo, cast: false });
  const studyRoof = fadeRoof(ST.cx, ST.cz, UP.y + UP.roofH, w, d);
  // làm mờ cả tầng 2 (vật liệu riêng, không ảnh hưởng chỗ khác)
  const upMats = new Map();
  upG.traverse((m) => {
    if (!m.isMesh) return;
    if (!upMats.has(m.material)) {
      const c = m.material.clone();
      c.transparent = true;
      upMats.set(m.material, c);
    }
    m.material = upMats.get(m.material);
  });
  let upShown = 1;
  const studyUp = {
    get faded() {
      return upShown < 0.95;
    },
    setFade(v) {
      if (Math.abs(v - upShown) < 0.01) return;
      upShown = v;
      for (const m of upMats.values()) {
        m.opacity = v;
        m.depthWrite = v > 0.95;
      }
    },
  };

  // ===== Cầu thang đá ngoài trời ở đầu hồi phía đông: các bậc đặc từ đất lên, chiếu nghỉ, tay vịn =====
  {
    const S = UP.stair, n = 20, run = (S.zFoot - S.zTop) / n, sx = (S.x0 + S.x1) / 2, sw = S.x1 - S.x0;
    for (let i = 0; i < n; i++) {
      const top = (UP.h * (i + 1)) / n;
      box(sw, top, run + 0.01, stoneL, sx, GY + top / 2, S.zFoot - (i + 0.5) * run);
    }
    const Ld = UP.landing;
    box(sw, UP.h, Ld.z1 - Ld.z0, stoneL, sx, GY + UP.h / 2, (Ld.z0 + Ld.z1) / 2);
    const ang = Math.atan2(UP.h, S.zFoot - S.zTop), len = Math.hypot(UP.h, S.zFoot - S.zTop);
    const hand = box(0.08, 0.08, len, sideCol, S.x1 + 0.05, GY + UP.h / 2 + 0.9, (S.zFoot + S.zTop) / 2);
    hand.rotation.x = ang;
    for (let i = 0; i <= 8; i++) {
      const f = i / 8;
      box(0.07, 0.9, 0.07, sideCol, S.x1 + 0.05, GY + UP.h * f + 0.45, S.zFoot - f * (S.zFoot - S.zTop));
    }
    box(0.08, 0.08, Ld.z1 - Ld.z0, sideCol, S.x1 + 0.05, UP.y + 0.9, (Ld.z0 + Ld.z1) / 2);
    box(sw, 0.08, 0.08, sideCol, sx, UP.y + 0.9, Ld.z0 + 0.05);
  }
  return { studyRoof, studyUp, boards };
}
