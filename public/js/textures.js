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
    g.textBaseline = 'middle';
    g.font = `700 ${size}px "Noto Serif", Georgia, serif`;
    g.shadowColor = 'rgba(0,0,0,.55)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 3;
    lines.forEach((ln, i) => g.fillText(ln, w / 2, (h * (i + 0.5)) / lines.length + size * 0.04));
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
