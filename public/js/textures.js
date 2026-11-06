// Các texture vẽ bằng canvas — không cần tải ảnh ngoài.
import * as THREE from 'three';

const rnd = (a, b) => a + Math.random() * (b - a);

export function canvasTexture(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

// Sàn gỗ ván dài
export function woodFloor() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const rows = 8;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd(0, 400);
      while (x < w) {
        const len = rnd(320, 700);
        g.fillStyle = `hsl(${rnd(22, 28)}, ${rnd(36, 46)}%, ${rnd(24, 31)}%)`;
        g.fillRect(x, r * rh, len, rh);
        for (let i = 0; i < 16; i++) {
          g.strokeStyle = `rgba(30,14,4,${rnd(0.04, 0.12)})`;
          g.lineWidth = rnd(1, 2.5);
          g.beginPath();
          const y0 = r * rh + rnd(4, rh - 4);
          g.moveTo(x, y0);
          for (let k = 0; k <= len; k += 32) g.lineTo(x + k, y0 + Math.sin(k * 0.012 + i) * 2.5);
          g.stroke();
        }
        g.fillStyle = 'rgba(12,6,2,0.55)';
        g.fillRect(x, r * rh, 3, rh);
        x += len;
      }
      g.fillStyle = 'rgba(12,6,2,0.65)';
      g.fillRect(0, r * rh, w, 3);
    }
  }, { repeat: [5, 7] });
}

function cloud(g, x, y, r) {
  g.beginPath(); g.arc(x, y, r, Math.PI, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(x - r * 0.95, y + r * 0.2, r * 0.55, Math.PI * 0.9, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(x + r * 0.95, y + r * 0.2, r * 0.55, Math.PI, Math.PI * 2.1); g.stroke();
  g.beginPath(); g.moveTo(x - r * 1.6, y + r * 0.25); g.lineTo(x + r * 1.6, y + r * 0.25); g.stroke();
}

// Tường sơn son phía sau tượng Phật
export function lacquerWall() {
  return canvasTexture(1024, 512, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#2c0e0a');
    bg.addColorStop(0.6, '#4b150f');
    bg.addColorStop(1, '#36110b');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(214,170,90,0.14)';
    g.lineWidth = 2.5;
    for (let y = 50, row = 0; y < h; y += 70, row++) {
      for (let x = (row % 2) * 55 + 30; x < w; x += 110) cloud(g, x, y, 16);
    }
    g.strokeStyle = '#b8893f';
    g.lineWidth = 8;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.lineWidth = 2;
    g.strokeRect(28, 28, w - 56, h - 56);
  });
}

// Hoành phi, câu đối sơn son thếp vàng
export function boardTexture(lines, { w = 1024, h = 256, size = 120 } = {}) {
  return canvasTexture(w, h, (g) => {
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#701b12');
    bg.addColorStop(1, '#4a110b');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d6aa55';
    g.lineWidth = 12;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.lineWidth = 3;
    g.strokeRect(30, 30, w - 60, h - 60);
    g.fillStyle = '#f0cd78';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.shadowColor = 'rgba(0,0,0,.55)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 3;
    const lineH = (h - 84) / lines.length; // chiều cao mỗi dòng bên trong khung viền trong
    lines.forEach((ln, i) => {
      // chữ dài thì tự co cho vừa bề ngang; chữ có dấu chồng (Ề, Ấ, Ổ…) thì co cho vừa bề cao,
      // để dấu không đụng vào viền khung
      g.font = `700 ${size}px "Noto Serif", "Times New Roman", Georgia, serif`;
      let m = g.measureText(ln);
      const fit = Math.min(size, (size * (w - 110)) / m.width, (size * lineH) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent));
      g.font = `700 ${fit}px "Noto Serif", "Times New Roman", Georgia, serif`;
      m = g.measureText(ln);
      // canh giữa theo đúng phần chữ thật (tính cả dấu) trong dòng
      const cy = 42 + lineH * (i + 0.5);
      g.fillText(ln, w / 2, cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    });
  });
}

// Hào quang phía sau tượng
export function aureole() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const cx = w / 2, cy = h / 2, R = w / 2 - 6;
    const rad = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.92);
    rad.addColorStop(0, 'rgba(255,238,190,0.95)');
    rad.addColorStop(0.35, 'rgba(255,208,125,0.55)');
    rad.addColorStop(1, 'rgba(255,175,80,0.05)');
    g.fillStyle = rad;
    g.beginPath(); g.arc(cx, cy, R * 0.9, 0, Math.PI * 2); g.fill();
    g.save();
    g.translate(cx, cy);
    for (let i = 0; i < 120; i++) {
      g.rotate((Math.PI * 2) / 120);
      g.fillStyle = i % 2 ? 'rgba(255,225,150,0.45)' : 'rgba(255,190,90,0.18)';
      g.beginPath();
      g.moveTo(0, -R * 0.12);
      g.lineTo(-R * 0.03, -R * 0.84);
      g.lineTo(R * 0.03, -R * 0.84);
      g.closePath();
      g.fill();
    }
    g.restore();
    g.strokeStyle = 'rgba(232,178,86,0.95)';
    for (const [r, lw] of [[0.86, 12], [0.8, 4], [0.5, 5], [0.46, 2]]) {
      g.lineWidth = lw;
      g.beginPath(); g.arc(cx, cy, R * r, 0, Math.PI * 2); g.stroke();
    }
    // vòng lửa
    g.fillStyle = 'rgba(232,160,60,0.95)';
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      g.save();
      g.translate(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9);
      g.rotate(a + Math.PI / 2);
      g.beginPath();
      g.moveTo(0, -R * 0.09);
      g.quadraticCurveTo(R * 0.045, -R * 0.02, 0, R * 0.03);
      g.quadraticCurveTo(-R * 0.045, -R * 0.02, 0, -R * 0.09);
      g.fill();
      g.restore();
    }
  });
}

export function glow() {
  return canvasTexture(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, w);
  });
}

export function smoke() {
  return canvasTexture(128, 128, (g, w) => {
    for (let i = 0; i < 6; i++) {
      const x = w / 2 + rnd(-14, 14), y = w / 2 + rnd(-14, 14), rr = rnd(26, 44);
      const r = g.createRadialGradient(x, y, 0, x, y, rr);
      r.addColorStop(0, 'rgba(240,236,228,0.35)');
      r.addColorStop(1, 'rgba(240,236,228,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, w, w);
    }
  });
}

// Dãy núi xa
export function ridge(color, seed) {
  return canvasTexture(1024, 256, (g, w, h) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const y = h * 0.62 - (Math.sin(x * 0.004 + seed) * 0.22 + Math.sin(x * 0.011 + seed * 2.1) * 0.12 +
        Math.sin(x * 0.033 + seed * 3.7) * 0.035) * h;
      g.lineTo(x, y);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fill();
  });
}

// Chùm lá tre
export function bambooLeaves() {
  return canvasTexture(512, 512, (g, w) => {
    for (let i = 0; i < 70; i++) {
      const a = rnd(0, Math.PI * 2), d = rnd(0, 180);
      const x = w / 2 + Math.cos(a) * d, y = w / 2 + Math.sin(a) * d * 0.8;
      g.save();
      g.translate(x, y);
      g.rotate(rnd(0.3, 2.8));
      g.fillStyle = `hsl(${rnd(85, 110)}, ${rnd(30, 50)}%, ${rnd(20, 38)}%)`;
      g.beginPath();
      g.ellipse(0, 0, rnd(34, 50), rnd(5, 8), 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  });
}

// Vỏ cây đa: xám nâu, vân dọc và đốm địa y
export function bark() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#8a8070';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const y = rnd(0, h), x = rnd(0, w), l = rnd(30, 120);
      g.strokeStyle = `rgba(${Math.random() < 0.5 ? '60,52,44' : '170,160,140'},${rnd(0.15, 0.4)})`;
      g.lineWidth = rnd(1, 4);
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + rnd(-6, 6), y + l / 3, x + rnd(-6, 6), y + (2 * l) / 3, x + rnd(-4, 4), y + l);
      g.stroke();
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(${rnd(120, 160)},${rnd(140, 160)},${rnd(110, 130)},${rnd(0.15, 0.3)})`;
      g.beginPath();
      g.ellipse(rnd(0, w), rnd(0, h), rnd(4, 14), rnd(3, 9), 0, 0, Math.PI * 2);
      g.fill();
    }
  }, { repeat: [2, 3] });
}

// vẽ một lá đa: phiến bầu dục to, mũi tù, gốc tròn, gân giữa và gân bên nhạt màu
function banyanLeaf(g, len, fill, vein) {
  const w = len * 0.36;
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.bezierCurveTo(w * 1.15, -len * 0.42, w * 1.05, len * 0.3, 0, len / 2);
  g.bezierCurveTo(-w * 1.05, len * 0.3, -w * 1.15, -len * 0.42, 0, -len / 2);
  g.fill();
  g.strokeStyle = vein;
  g.lineWidth = Math.max(1, len * 0.035);
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.lineTo(0, len * 0.47);
  g.stroke();
  g.lineWidth = Math.max(0.6, len * 0.015);
  for (let k = 1; k <= 5; k++) {
    const y = -len / 2 + (k / 6) * len * 0.92;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(0, y);
      g.quadraticCurveTo(s * w * 0.5, y + len * 0.04, s * w * 0.8, y + len * 0.12);
      g.stroke();
    }
  }
}

// Chùm lá đa cho tán cây (nền trong suốt)
export function banyanLeaves() {
  return canvasTexture(512, 512, (g, w) => {
    for (let i = 0; i < 46; i++) {
      const a = rnd(0, Math.PI * 2), d = Math.sqrt(Math.random()) * 190;
      g.save();
      g.translate(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d * 0.85);
      g.rotate(rnd(0, Math.PI * 2));
      const l = rnd(26, 33), li = rnd(18, 34);
      banyanLeaf(g, rnd(78, 104), `hsl(${rnd(95, 118)}, ${rnd(35, 55)}%, ${li}%)`, `hsla(${rnd(70, 90)}, 40%, ${li + l}%, 0.55)`);
      g.restore();
    }
  });
}

// Lá đa rụng nằm trên sân: trắng để tô màu theo từng lá, gân nhạt hơn
export function fallenBanyanLeaf() {
  return canvasTexture(128, 256, (g, w, h) => {
    g.translate(w / 2, h / 2 + 8);
    banyanLeaf(g, 220, '#cfc7b4', 'rgba(255,252,235,0.95)');
    g.fillStyle = '#d8d0b8';
    g.fillRect(-2, -128, 4, 26); // cuống lá
  });
}

// Cờ Phật giáo: năm sọc dọc xanh, vàng, đỏ, trắng, cam; sọc thứ sáu gồm năm màu xếp ngang
export const FLAG_COLORS = ['#2f5fd0', '#f5c400', '#d42a2a', '#f7f4ec', '#f08a1c'];
export function buddhistFlag() {
  return canvasTexture(240, 160, (g, w, h) => {
    const cw = w / 6;
    FLAG_COLORS.forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(i * cw, 0, cw + 1, h);
    });
    FLAG_COLORS.forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(5 * cw, (i * h) / 5, cw, h / 5 + 1);
    });
  });
}

// ---------- Vân mặt nền (lặp liền mạch, trải theo toạ độ trong cảnh) ----------
// số ngẫu nhiên có hạt giống để vân giống nhau ở mọi máy
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
// vẽ lặp ở 9 ô kề nhau để nét chạm mép vẫn nối liền khi lặp
const wrapDraw = (w, h, fn) => {
  for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy);
};
const groundCache = new Map();
const cached = (key, make) => {
  if (!groundCache.has(key)) groundCache.set(key, make());
  return groundCache.get(key);
};

// Cỏ: nền xanh, hàng nghìn nét lá cỏ đậm nhạt, vài đốm cỏ ba lá và đất
export function grassTex() {
  return cached('grass', () => canvasTexture(512, 512, (g, w, h) => {
    const r = seeded(11);
    g.fillStyle = '#6f8a4a';
    g.fillRect(0, 0, w, h);
    // mảng sáng tối lớn
    for (let i = 0; i < 40; i++) {
      const x = r() * w, y = r() * h, rad = 30 + r() * 70;
      wrapDraw(w, h, (dx, dy) => {
        const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
        gr.addColorStop(0, r() < 0.5 ? 'rgba(140,170,90,0.25)' : 'rgba(60,85,40,0.25)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
      });
    }
    // lá cỏ
    for (let i = 0; i < 9000; i++) {
      const x = r() * w, y = r() * h, l = 3 + r() * 7, a = -Math.PI / 2 + (r() - 0.5) * 1.2;
      const hue = 72 + r() * 30, light = 22 + r() * 30;
      g.strokeStyle = `hsl(${hue}, ${35 + r() * 25}%, ${light}%)`;
      g.lineWidth = 0.8 + r() * 0.8;
      wrapDraw(w, h, (dx, dy) => {
        g.beginPath();
        g.moveTo(x + dx, y + dy);
        g.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l);
        g.stroke();
      });
    }
    // đốm đất và hoa cỏ li ti
    for (let i = 0; i < 160; i++) {
      const x = r() * w, y = r() * h;
      g.fillStyle = r() < 0.75 ? `rgba(110,90,60,${0.25 + r() * 0.3})` : r() < 0.5 ? 'rgba(245,240,220,0.8)' : 'rgba(240,210,90,0.8)';
      wrapDraw(w, h, (dx, dy) => {
        g.beginPath();
        g.arc(x + dx, y + dy, 0.8 + r() * 1.6, 0, Math.PI * 2);
        g.fill();
      });
    }
  }, { repeat: [1, 1] }));
}

// Đá lát: tấm đá chữ nhật xếp so le, mỗi tấm đậm nhạt khác nhau, đường ron sẫm, vân đá li ti
export function stoneTex(variant = 'slab') {
  return cached('stone-' + variant, () => canvasTexture(512, 512, (g, w, h) => {
    const r = seeded(variant === 'slab' ? 23 : 37);
    const rows = variant === 'slab' ? 4 : 6;
    const base = variant === 'slab' ? [168, 160, 146] : [176, 168, 152];
    g.fillStyle = '#6e675c';
    g.fillRect(0, 0, w, h);
    const rh = h / rows;
    for (let row = 0; row < rows; row++) {
      // các tấm trong hàng: chiều dài ngẫu nhiên, cộng lại đúng bằng bề ngang ô (để lặp liền)
      const n = variant === 'slab' ? 3 : 4;
      const ws = Array.from({ length: n }, () => 0.7 + r() * 0.6);
      const sum = ws.reduce((a, b) => a + b, 0);
      let x = (row % 2) * (w / n / 2) + r() * 20;
      for (const wi of ws) {
        const sw = (wi / sum) * w;
        const k = 0.86 + r() * 0.24, tint = r() * 10 - 5;
        const col = `rgb(${Math.round(base[0] * k + tint)},${Math.round(base[1] * k)},${Math.round(base[2] * k - tint)})`;
        wrapDraw(w, h, (dx, dy) => {
          g.fillStyle = col;
          g.fillRect(x + dx + 2, row * rh + dy + 2, sw - 4, rh - 4);
        });
        // vân đá: chấm sáng tối và vệt mòn trong tấm
        for (let i = 0; i < 70; i++) {
          const px = x + 3 + r() * (sw - 6), py = row * rh + 3 + r() * (rh - 6);
          const c = r() < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
          wrapDraw(w, h, (dx, dy) => {
            g.fillStyle = c;
            g.fillRect(px + dx, py + dy, 1 + r() * 3, 1 + r() * 2);
          });
        }
        x += sw;
      }
    }
    // rêu nhẹ dọc ron
    for (let i = 0; i < 120; i++) {
      const x = r() * w, y = Math.round(r() * rows) * rh;
      wrapDraw(w, h, (dx, dy) => {
        g.fillStyle = 'rgba(80,100,50,0.18)';
        g.fillRect(x + dx, y + dy - 2, 6 + r() * 14, 4);
      });
    }
  }, { repeat: [1, 1] }));
}

// Gạch đỏ lát lối đi: xếp so le, màu gạch nung đậm nhạt khác nhau, ron vữa sáng
export function brickTex() {
  return cached('brick', () => canvasTexture(512, 512, (g, w, h) => {
    const r = seeded(51);
    g.fillStyle = '#b5a48a';
    g.fillRect(0, 0, w, h);
    const rows = 16, cols = 4, bh = h / rows, bw = w / cols;
    for (let row = 0; row < rows; row++) {
      for (let c = -1; c <= cols; c++) {
        const x = c * bw + (row % 2) * (bw / 2);
        const k = 0.8 + r() * 0.3;
        g.fillStyle = `rgb(${Math.round(168 * k)},${Math.round(84 * k)},${Math.round(58 * k)})`;
        g.fillRect(x + 2, row * bh + 2, bw - 4, bh - 4);
        g.fillStyle = 'rgba(0,0,0,0.08)';
        g.fillRect(x + 2, row * bh + bh - 6, bw - 4, 4);
      }
    }
  }, { repeat: [1, 1] }));
}

// Đất nện: nâu, sỏi nhỏ, vết lõm
export function dirtTex() {
  return cached('dirt', () => canvasTexture(512, 512, (g, w, h) => {
    const r = seeded(77);
    g.fillStyle = '#8a7556';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = r() * w, y = r() * h, s = 0.6 + r() * 2.6;
      const l = 28 + r() * 30;
      g.fillStyle = `hsla(${28 + r() * 14}, ${20 + r() * 20}%, ${l}%, ${0.35 + r() * 0.5})`;
      wrapDraw(w, h, (dx, dy) => {
        g.beginPath();
        g.arc(x + dx, y + dy, s, 0, Math.PI * 2);
        g.fill();
      });
    }
  }, { repeat: [1, 1] }));
}

// ---------- Lá cây cho vườn quả (nền trong suốt; màu lá lấy theo màu vật liệu) ----------
// Chùm lá: nhiều lá bầu dục toả ra từ giữa, đậm nhạt khác nhau, có gân giữa
export function leafClusterTex() {
  return cached('leaf-cluster', () => canvasTexture(256, 256, (g, w, h) => {
    const r = seeded(91);
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2, d = 18 + r() * 80;
      const x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d;
      const L = 26 + r() * 22, W = L * (0.38 + r() * 0.12), rot = a + (r() - 0.5) * 0.9;
      const v = 150 + r() * 105;
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillStyle = `rgb(${v * 0.9},${v},${v * 0.85})`;
      g.beginPath();
      g.ellipse(0, 0, L / 2, W / 2, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = `rgba(255,255,255,0.35)`;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(-L / 2, 0);
      g.lineTo(L / 2, 0);
      g.stroke();
      g.restore();
    }
  }, { srgb: true }));
}

// Lá chuối: phiến dài, gân giữa đậm, gân phụ song song, mép có vài vết rách
export function bananaLeafTex() {
  return cached('banana-leaf', () => canvasTexture(128, 512, (g, w, h) => {
    const r = seeded(131);
    g.clearRect(0, 0, w, h);
    // phiến lá thuôn hai đầu
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.bezierCurveTo(w * 1.02, h * 0.15, w * 1.02, h * 0.8, w / 2, h);
    g.bezierCurveTo(-w * 0.02, h * 0.8, -w * 0.02, h * 0.15, w / 2, 0);
    g.fill();
    // gân phụ chéo
    g.strokeStyle = 'rgba(120,150,90,0.45)';
    g.lineWidth = 1;
    for (let y = 8; y < h; y += 7) {
      g.beginPath();
      g.moveTo(w / 2, y);
      g.lineTo(2, y + 22);
      g.moveTo(w / 2, y);
      g.lineTo(w - 2, y + 22);
      g.stroke();
    }
    // gân giữa
    g.fillStyle = 'rgba(210,225,170,0.95)';
    g.fillRect(w / 2 - 3, 0, 6, h);
    // vết rách ở mép (xoá bớt các dải mỏng)
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 9; i++) {
      const y = 40 + r() * (h - 80), side = r() < 0.5 ? 0 : 1, depth = w * (0.2 + r() * 0.25);
      g.fillRect(side ? w - depth : 0, y, depth, 2 + r() * 2);
    }
    g.globalCompositeOperation = 'source-over';
  }, { srgb: true }));
}

// ---------- Trang trí điện thờ ----------
// Cửa võng: khung gỗ chạm lộng thếp vàng treo trước bàn thờ — dải hoành trên, hai dải võng hai bên rủ xuống,
// mép dưới uốn vòm để lộ tượng; hoa văn mây cuốn chạm thủng, đoá sen ở giữa. aspect = rộng / cao.
// topFrac: bề cao dải hoành trên (phần trăm chiều cao) — Chánh điện để mỏng cho khỏi che hoành phi
export function cuaVongTex(aspect = 2.8, topFrac = 0.2) {
  return cached('cua-vong-' + aspect.toFixed(2) + '-' + topFrac, () => canvasTexture(1536, Math.round(1536 / aspect), (g, w, h) => {
    const r = seeded(201);
    const sb = w * 0.07, tb = h * topFrac, drop = h * 0.78;
    const outline = () => {
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(w, 0);
      g.lineTo(w, drop);
      g.quadraticCurveTo(w - sb * 0.5, drop + h * 0.08, w - sb, drop - h * 0.02); // đầu võng cuốn
      g.bezierCurveTo(w - sb, tb * 1.6, w * 0.64, tb, w / 2, tb * 1.05);
      g.bezierCurveTo(w * 0.36, tb, sb, tb * 1.6, sb, drop - h * 0.02);
      g.quadraticCurveTo(sb * 0.5, drop + h * 0.08, 0, drop);
      g.closePath();
    };
    // nền vàng
    outline();
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#f6d77c');
    gr.addColorStop(0.5, '#d9a63c');
    gr.addColorStop(1, '#b07a22');
    g.fillStyle = gr;
    g.fill();
    g.save();
    outline();
    g.clip();
    // mây cuốn chạm nổi: các xoắn ốc nét sẫm, viền sáng
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h, rad = 8 + r() * 22;
      g.lineWidth = 4;
      g.strokeStyle = 'rgba(110,60,10,0.75)';
      g.beginPath();
      for (let t = 0; t < 4 * Math.PI; t += 0.25) {
        const rr = rad * (1 - t / (4 * Math.PI));
        const px = x + Math.cos(t) * rr, py = y + Math.sin(t) * rr;
        t === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.stroke();
      g.lineWidth = 1.5;
      g.strokeStyle = 'rgba(255,240,180,0.7)';
      g.stroke();
    }
    // chạm thủng: các lỗ hình hạt và hoa thị dọc dải trên và hai dải bên
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 260; i++) {
      let x, y;
      if (i % 3 === 0) { x = sb * 0.2 + r() * sb * 0.6; y = tb * 0.4 + r() * (drop - tb * 0.6); }
      else if (i % 3 === 1) { x = w - sb * 0.8 + r() * sb * 0.6; y = tb * 0.4 + r() * (drop - tb * 0.6); }
      else { x = sb + r() * (w - 2 * sb); y = tb * 0.15 + r() * tb * 0.65; }
      const s = 4 + r() * 7;
      g.beginPath();
      g.ellipse(x, y, s, s * 0.55, r() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    // đoá sen giữa dải trên
    const cx = w / 2, cy = tb * 0.55, pr = tb * 0.42;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI + (k / 8) * Math.PI;
      g.save();
      g.translate(cx + Math.cos(a) * pr * 0.35, cy + Math.sin(a) * pr * 0.2 + pr * 0.25);
      g.rotate(a + Math.PI / 2);
      g.fillStyle = k % 2 ? '#ffe7a6' : '#f0c85c';
      g.beginPath();
      g.ellipse(0, -pr * 0.35, pr * 0.16, pr * 0.42, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(120,70,15,0.8)';
      g.lineWidth = 2;
      g.stroke();
      g.restore();
    }
    g.restore();
    // viền mép
    outline();
    g.lineWidth = 6;
    g.strokeStyle = '#8a5a14';
    g.stroke();
  }));
}

// Tràng phan: dải lụa vàng viền đỏ, mái rủ răng cưa ở đầu, hoa sen, chữ dọc, đuôi xẻ
export function phanTex(words = ['NAM', 'MÔ', 'A', 'DI', 'ĐÀ', 'PHẬT']) {
  return cached('phan-' + words.join(' '), () => canvasTexture(256, 1280, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    // thân lụa
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#e8b832');
    gr.addColorStop(0.5, '#f7d55e');
    gr.addColorStop(1, '#e8b832');
    g.fillStyle = gr;
    g.fillRect(12, 60, w - 24, h - 160);
    // đuôi xẻ hai nhánh
    g.beginPath();
    g.moveTo(12, h - 100);
    g.lineTo(w / 2 - 6, h - 100);
    g.lineTo(w / 2 - 30, h);
    g.lineTo(12, h - 20);
    g.moveTo(w - 12, h - 100);
    g.lineTo(w / 2 + 6, h - 100);
    g.lineTo(w / 2 + 30, h);
    g.lineTo(w - 12, h - 20);
    g.fill();
    // viền đỏ
    g.fillStyle = '#b3261e';
    g.fillRect(12, 60, 18, h - 160);
    g.fillRect(w - 30, 60, 18, h - 160);
    // mái rủ răng cưa đỏ ở đầu
    g.fillStyle = '#a61f18';
    g.fillRect(0, 0, w, 60);
    g.beginPath();
    for (let x = 0; x <= w; x += 32) {
      g.lineTo(x, 60);
      g.lineTo(x + 16, 100);
    }
    g.lineTo(w, 60);
    g.lineTo(0, 60);
    g.fill();
    g.fillStyle = '#e8b832';
    g.fillRect(0, 18, w, 8);
    // hoa sen
    const cx = w / 2, cy = 190;
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (k / 6) * Math.PI;
      g.save();
      g.translate(cx + Math.cos(a) * 18, cy + Math.sin(a) * 8 + 20);
      g.rotate(a + Math.PI / 2);
      g.fillStyle = k % 2 ? '#f2a0b2' : '#e47b95';
      g.beginPath();
      g.ellipse(0, -26, 13, 34, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    // chữ dọc
    g.fillStyle = '#a61f18';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const top = 300, step = (h - 160 - top) / words.length;
    words.forEach((wd, i) => {
      g.font = `700 ${wd.length > 3 ? 62 : 74}px "Noto Serif", "Times New Roman", Georgia, serif`;
      g.fillText(wd, cx, top + step * (i + 0.5));
    });
  }));
}
