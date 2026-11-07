// Khu tự học sau điện Quan Âm: dãy 4 phòng học ngoại ngữ (Anh, Trung, Đức, Hàn) ở tầng trệt,
// lầu học Phật pháp ngay phía sau (tầng dưới là Tàng kinh các đóng cửa, lên tầng 2 bằng cầu thang ngoài trời).
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
  const x0 = 26.5, x1 = 62.5, z0 = -16, z1 = -4, floor = 0.25, roofH = 3.4;
  const rw = (x1 - x0) / STUDY_ROOMS.length;
  const rooms = STUDY_ROOMS.map((r, i) => {
    const rx0 = x0 + i * rw, cx = rx0 + rw / 2;
    return { ...r, x0: rx0, x1: rx0 + rw, cx, shelfX: rx0 + 1.6, boardX: cx + 1.3 };
  });
  // 4 bàn mỗi phòng (2 dãy × 2), ngồi quay mặt về bảng đen phía bắc; bàn ở trước bồ đoàn 0,62 m
  const desks = [];
  for (const r of rooms) for (const z of [-11.4, -7.8]) for (const dx of [-1.9, 2.1]) desks.push({ x: r.cx + dx, z, room: r.key });
  return {
    x0, x1, z0, z1, floor, roofH, rw, rooms, desks, deskDz: -0.62,
    cx: (x0 + x1) / 2, cz: (z0 + z1) / 2,
    door: { x: (x0 + x1) / 2, z: z1 + 2.2 }, // giữa mặt trước (phía nam)
    walls: [x0, ...rooms.slice(1).map((r) => r.x0), x1], // tường hồi hai đầu và vách ngăn giữa các phòng
  };
})();

// Lầu Phật pháp: sàn tầng 2 cao 3,6 m; cầu thang đá dọc mặt đông, lên từ phía nam
export const LIB = (() => {
  const x0 = 42, x1 = 54, z0 = -31, z1 = -20, h = 3.6;
  const desks = [];
  for (const z of [-25.8, -22.6]) for (const x of [44.6, 48.2, 51.8]) desks.push({ x, z, room: 'phat' });
  return {
    x0, x1, z0, z1, h, base: GY, y: GY + h, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2,
    roofH: 3.0,
    floor: { x0: x0 + 0.5, x1: x1 - 0.5, z0: z0 + 0.6, z1: z1 - 0.5 }, // chỗ đi lại trên sàn (trong lan can)
    stair: { x0: 54.3, x1: 55.9, zFoot: -18.4, zTop: -28.6 },
    landing: { x0: 54.3, x1: 55.9, z0: -31, z1: -28.6 },
    foot: { x: 55.1, z: -17.3 }, // ngoài sân, trước chân cầu thang
    entry: { x: 55.1, z: -18.5 }, // bậc đầu tiên
    top: { x: 55.1, z: -29.6 }, // chiếu nghỉ đầu cầu thang
    arrive: { x: 53.2, z: -29.6 }, // bước vào sàn lầu
    shelfX: 43.8, boardX: 49.2,
    desks,
  };
})();
// phòng học ở chỗ (x, z) — tầng trệt hoặc lầu (null nếu không ở khu tự học)
export function studyRoomAt(x, z, upstairs = false) {
  if (upstairs) return PHAT_ROOM;
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
  function shelf(room, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData = { kind: 'shelf', room };
    scene.add(g);
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
  function blackboard(room, title, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData = { kind: 'board', room };
    scene.add(g);
    pickables.push(g);
    const o = { parent: g };
    box(4.3, 2.15, 0.06, frameM, 0, 0, 0.03, o);
    const b = makeBoard(title);
    mesh(new THREE.PlaneGeometry(4.0, 1.95), new THREE.MeshStandardMaterial({ map: b.tex, roughness: 0.92 }), 0, 0, 0.07, { ...o, cast: false });
    box(4.0, 0.05, 0.12, frameM, 0, -1.03, 0.11, o);
    for (const dx of [-1.2, -1.05, 0.9]) box(0.08, 0.025, 0.025, std('#f4f1e6'), dx, -1.0, 0.12, o); // phấn
    boards.set(room, b);
  }
  function desk(x, z, FY) {
    const dz = z + STUDY.deskDz;
    box(1.15, 0.05, 0.55, deskM, x, FY + 0.33, dz);
    for (const sx of [-1, 1]) box(0.06, 0.3, 0.5, deskM, x + sx * 0.52, FY + 0.15, dz);
    const bk = new THREE.Group();
    bk.position.set(x - 0.1, FY + 0.365, dz + 0.05);
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.27), pageM);
      p.position.x = s * 0.1;
      p.rotation.z = -s * 0.08;
      bk.add(p);
    }
    scene.add(bk);
    cyl(0.05, 0.06, 0.03, bronze, x + 0.38, FY + 0.37, dz - 0.12, {}, 10);
    cyl(0.012, 0.012, 0.22, bronze, x + 0.38, FY + 0.47, dz - 0.12, {}, 6);
    cyl(0.06, 0.11, 0.1, lampM, x + 0.38, FY + 0.6, dz - 0.12, { cast: false }, 14);
    cyl(0.035, 0.028, 0.05, cupM, x - 0.38, FY + 0.38, dz + 0.1, {}, 10);
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

  // ===== Dãy 4 phòng học ngoại ngữ =====
  const ST = STUDY, w = ST.x1 - ST.x0, d = ST.z1 - ST.z0, FY = GY + ST.floor;
  box(w + 0.8, ST.floor - 0.02, d + 0.8, stoneL, ST.cx, GY + (ST.floor - 0.02) / 2, ST.cz);
  const floorS = box(w + 0.2, 0.04, d + 0.2, std('#9a6b43', { roughness: 0.7 }), ST.cx, FY - 0.01, ST.cz, { cast: false });
  floorS.userData.kind = 'ground';
  pickables.push(floorS);
  // tường sau, tường hồi hai đầu, vách ngăn giữa các phòng
  box(w + 0.3, ST.roofH, 0.2, sideWall, ST.cx, FY + ST.roofH / 2, ST.z0 - 0.12);
  for (const x of ST.walls) box(0.2, ST.roofH, d, sideWall, x, FY + ST.roofH / 2, ST.cz - 0.3);
  // cột son mặt trước, bậc lên trước mỗi phòng
  for (const r of ST.rooms) {
    for (const x of [r.x0, r.cx, r.x1]) {
      cyl(0.16, 0.19, ST.roofH, sideCol, x, FY + ST.roofH / 2, ST.z1, {}, 10);
      cyl(0.25, 0.25, 0.12, stoneM, x, FY + 0.06, ST.z1, {}, 10);
    }
    box(3.0, ST.floor * 0.5, 0.6, stoneL, r.cx, GY + ST.floor * 0.25, ST.z1 + 0.7);
    // biển tên phòng trên xà trước
    box(2.7, 0.62, 0.07, gold, r.cx, FY + ST.roofH - 0.45, ST.z1 + 0.12);
    mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat([r.plaque], { w: 1024, h: 200, size: 104 }), r.cx, FY + ST.roofH - 0.45, ST.z1 + 0.17, { cast: false });
    shelf(r.key, r.shelfX, FY, ST.z0 - 0.02);
    blackboard(r.key, t(r.name), r.boardX, FY + 1.75, ST.z0 - 0.02);
  }
  for (const k of ST.desks) desk(k.x, k.z, FY);
  // biển NHÀ TỰ HỌC ở đầu hồi phía tây
  box(0.07, 0.62, 2.7, gold, ST.x0 - 0.12, FY + ST.roofH - 0.45, ST.cz);
  mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat(['NHÀ TỰ HỌC'], { w: 1024, h: 200, size: 104 }), ST.x0 - 0.17, FY + ST.roofH - 0.45, ST.cz, { cast: false }).rotation.y = -Math.PI / 2;
  const studyRoof = fadeRoof(ST.cx, ST.cz, FY + ST.roofH, w, d);
  obstacles.push({ minX: ST.x0 - 0.4, maxX: ST.x1 + 0.4, minZ: ST.z0 - 0.5, maxZ: ST.z0 + 0.7 }); // tường sau và kệ sách

  // ===== Lầu Phật pháp: tầng dưới Tàng kinh các (đóng cửa), tầng 2 phòng học =====
  const L = LIB, lw = L.x1 - L.x0, ld = L.z1 - L.z0;
  box(lw + 0.8, 0.2, ld + 0.8, stoneL, L.cx, GY + 0.1, L.cz);
  for (const s of [-1, 1]) {
    box(lw, L.h, 0.3, sideWall, L.cx, GY + L.h / 2, s > 0 ? L.z1 - 0.15 : L.z0 + 0.15);
    box(0.3, L.h, ld, sideWall, s > 0 ? L.x1 - 0.15 : L.x0 + 0.15, GY + L.h / 2, L.cz);
  }
  // cửa gỗ đóng và biển TÀNG KINH CÁC ở mặt nam tầng dưới
  for (const dx of [-0.75, 0.75]) box(1.4, 2.4, 0.08, frameM, L.cx + dx, GY + 1.3, L.z1 + 0.02);
  box(2.9, 0.62, 0.07, gold, L.cx, GY + 3.0, L.z1 + 0.04);
  mesh(new THREE.PlaneGeometry(2.75, 0.5), boardMat(['TÀNG KINH CÁC'], { w: 1024, h: 190, size: 100 }), L.cx, GY + 3.0, L.z1 + 0.09, { cast: false });
  for (const [x, z] of [[L.x0, L.z0], [L.x0, L.z1], [L.x1, L.z0], [L.x1, L.z1]]) cyl(0.22, 0.24, L.h + L.roofH, sideCol, x, GY + (L.h + L.roofH) / 2, z, {}, 10);
  // sàn lầu
  const floorL = box(lw + 0.6, 0.24, ld + 0.6, std('#9a6b43', { roughness: 0.7 }), L.cx, L.y - 0.12, L.cz, { cast: false });
  floorL.userData.kind = 'ground';
  pickables.push(floorL);
  // tường bắc tầng 2 (kệ sách, bảng đen), lan can ba mặt còn lại; chừa lối vào ở góc đông bắc
  box(lw, L.roofH, 0.2, sideWall, L.cx, L.y + L.roofH / 2, L.z0 + 0.1);
  const railM = sideCol;
  const rail = (x0, x1, z0, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    box(along ? len : 0.1, 0.08, along ? 0.1 : len, railM, (x0 + x1) / 2, L.y + 0.9, (z0 + z1) / 2);
    box(along ? len : 0.06, 0.06, along ? 0.06 : len, railM, (x0 + x1) / 2, L.y + 0.4, (z0 + z1) / 2);
    const n = Math.round(len / 1.0);
    for (let i = 0; i <= n; i++) box(0.08, 0.9, 0.08, railM, x0 + ((x1 - x0) * i) / n, L.y + 0.45, z0 + ((z1 - z0) * i) / n);
  };
  rail(L.x0 + 0.1, L.x1 - 0.1, L.z1 - 0.1, L.z1 - 0.1); // nam
  rail(L.x0 + 0.1, L.x0 + 0.1, L.z0 + 0.2, L.z1 - 0.1); // tây
  rail(L.x1 - 0.1, L.x1 - 0.1, L.landing.z1 + 0.1, L.z1 - 0.1); // đông (chừa lối vào từ chiếu nghỉ)
  for (const x of [L.x0 + lw / 3, L.x0 + (2 * lw) / 3]) cyl(0.15, 0.17, L.roofH, sideCol, x, L.y + L.roofH / 2, L.z1 - 0.1, {}, 10);
  // biển PHẬT HỌC trên xà trước tầng 2
  box(2.7, 0.62, 0.07, gold, L.cx, L.y + L.roofH - 0.4, L.z1 + 0.05);
  mesh(new THREE.PlaneGeometry(2.55, 0.5), boardMat([PHAT_ROOM.plaque], { w: 1024, h: 200, size: 104 }), L.cx, L.y + L.roofH - 0.4, L.z1 + 0.1, { cast: false });
  shelf('phat', L.shelfX, L.y, L.z0 + 0.18);
  blackboard('phat', t(PHAT_ROOM.name), L.boardX, L.y + 1.65, L.z0 + 0.2);
  for (const k of L.desks) desk(k.x, k.z, L.y);
  const libRoof = fadeRoof(L.cx, L.cz, L.y + L.roofH, lw, ld);
  // cầu thang đá: các bậc đặc từ đất lên, chiếu nghỉ, tay vịn phía ngoài
  {
    const S = L.stair, n = 18, run = (S.zFoot - S.zTop) / n, sx = (S.x0 + S.x1) / 2, sw = S.x1 - S.x0;
    for (let i = 0; i < n; i++) {
      const top = (L.h * (i + 1)) / n;
      box(sw, top, run + 0.01, stoneL, sx, GY + top / 2, S.zFoot - (i + 0.5) * run);
    }
    const Ld = L.landing;
    box(sw, L.h, Ld.z1 - Ld.z0, stoneL, sx, GY + L.h / 2, (Ld.z0 + Ld.z1) / 2);
    const ang = Math.atan2(L.h, S.zFoot - S.zTop), len = Math.hypot(L.h, S.zFoot - S.zTop);
    const hand = box(0.08, 0.08, len, railM, S.x1 + 0.05, GY + L.h / 2 + 0.9, (S.zFoot + S.zTop) / 2);
    hand.rotation.x = ang;
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      box(0.07, 0.9, 0.07, railM, S.x1 + 0.05, GY + L.h * f + 0.45, S.zFoot - f * (S.zFoot - S.zTop));
    }
  }
  return { studyRoof, libRoof, boards };
}
