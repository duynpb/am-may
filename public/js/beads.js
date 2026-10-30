// Lần tràng hạt 108 hạt — vẽ bằng canvas 2D.
const TOTAL = 108;
const N = 27; // 27 hạt hiển thị, 4 vòng = 108

const easeOut = (k) => 1 - Math.pow(1 - k, 3);

export class Beads {
  constructor(el, { sound, store, onClose }) {
    this.el = el;
    this.sound = sound;
    this.store = store;
    this.onClose = onClose;
    this.canvas = el.querySelector('canvas');
    this.g = this.canvas.getContext('2d');
    this.offset = 0;
    this.anim = null;
    this.drag = null;
    this.count = 0;
    this.round = 1;
    this.$n = el.querySelector('[data-bead-n]');
    this.$round = el.querySelector('[data-bead-round]');
    this.$today = el.querySelector('[data-bead-today]');
    this.$msg = el.querySelector('[data-bead-msg]');
    this.loadStats();
    this.bind();
  }

  loadStats() {
    const today = new Date().toISOString().slice(0, 10);
    const st = this.store.get('beads', {});
    this.stats = st.date === today ? st : { date: today, today: 0, total: st.total || 0 };
  }

  bind() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId);
      this.drag = { y0: e.clientY, x0: e.clientX, base: this.anim ? this.anim.to : this.offset, amt: 0, moved: 0 };
      this.anim = null;
      this.offset = this.drag.base;
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const d = this.drag;
      d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x0, e.clientY - d.y0));
      d.amt = Math.max(0, Math.min(1, (e.clientY - d.y0) / this.spacing));
      this.offset = d.base + d.amt * 0.9;
      this.dirty = true;
    });
    const up = () => {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      if (d.amt > 0.35 || d.moved < 8) this.advance(d.base);
      else this.animate(this.offset, d.base);
    };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    this.el.querySelector('[data-bead-back]').addEventListener('click', () => this.close());
    window.addEventListener('keydown', (e) => {
      if (this.el.hidden) return;
      if (e.key === 'Escape') this.close();
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        this.advance(this.anim ? this.anim.to : this.offset);
      }
    });
    window.addEventListener('resize', () => !this.el.hidden && this.resize());
  }

  get isOpen() {
    return !this.el.hidden;
  }

  open() {
    this.el.hidden = false;
    this.loadStats();
    this.resize();
    this.updateText();
    requestAnimationFrame(() => this.el.classList.add('show'));
    this.running = true;
    const loop = (now) => {
      if (!this.running) return;
      this.frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  close() {
    this.el.classList.remove('show');
    this.running = false;
    setTimeout(() => { this.el.hidden = true; }, 280);
    this.onClose?.();
  }

  animate(from, to) {
    this.anim = { from, to, start: performance.now(), dur: 280 };
  }

  advance(from) {
    const base = Math.round(from);
    this.animate(this.offset, base + 1);
    this.count++;
    this.stats.today++;
    this.stats.total++;
    this.store.set('beads', this.stats);
    this.sound.bead();
    navigator.vibrate?.(8);
    if (this.count % TOTAL === 0) {
      this.round++;
      this.sound.bigBell();
      this.flash('Tròn một chuỗi 108 hạt. Nam mô A Di Đà Phật.');
    }
    this.updateText();
  }

  flash(text) {
    this.$msg.textContent = text;
    this.$msg.classList.add('show');
    clearTimeout(this.msgT);
    this.msgT = setTimeout(() => this.$msg.classList.remove('show'), 3200);
  }

  updateText() {
    this.$n.textContent = this.count % TOTAL;
    this.$round.textContent = `Chuỗi thứ ${this.round}`;
    this.$today.textContent = `Hôm nay: ${this.stats.today.toLocaleString('vi-VN')} hạt`;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.el.clientWidth, h = this.el.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
    this.a = Math.min(w * 0.13, 105);
    this.L = Math.min(h * 0.29, 250);
    this.cx = w / 2;
    this.cy = h * 0.48;
    this.P = 4 * this.L + 2 * Math.PI * this.a;
    this.spacing = this.P / N;
    this.r = Math.min(this.spacing * 0.5, 34);
    this.dirty = true;
  }

  // Điểm trên đường vòng kiểu sân vận động: phải đi xuống, trái đi lên
  point(s) {
    const { a, L, cx, cy } = this;
    let d = (((s % 1) + 1) % 1) * this.P;
    if (d < 2 * L) return { x: cx + a, y: cy - L + d, side: 1 };
    d -= 2 * L;
    if (d < Math.PI * a) {
      const th = d / a;
      return { x: cx + a * Math.cos(th), y: cy + L + a * Math.sin(th), side: Math.cos(th) };
    }
    d -= Math.PI * a;
    if (d < 2 * L) return { x: cx - a, y: cy + L - d, side: -1 };
    d -= 2 * L;
    const th = Math.PI + d / a;
    return { x: cx + a * Math.cos(th), y: cy - L + a * Math.sin(th), side: Math.cos(th) };
  }

  frame(now) {
    if (this.anim) {
      const k = Math.min(1, (now - this.anim.start) / this.anim.dur);
      this.offset = this.anim.from + (this.anim.to - this.anim.from) * easeOut(k);
      if (k >= 1) this.anim = null;
      this.dirty = true;
    }
    if (!this.dirty) return;
    this.dirty = false;
    const g = this.g;
    g.clearRect(0, 0, this.w, this.h);

    // dây xâu hạt
    g.strokeStyle = 'rgba(150,105,60,0.55)';
    g.lineWidth = 2;
    g.beginPath();
    for (let i = 0; i <= 200; i++) {
      const p = this.point(i / 200);
      i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
    }
    g.stroke();

    const beads = [];
    for (let i = 0; i < N; i++) {
      const p = this.point((i + this.offset) / N);
      beads.push({ ...p, guru: i === 0 });
    }
    beads.sort((u, v) => u.side - v.side);
    for (const b of beads) this.bead(b.x, b.y, this.r * (b.guru ? 1.18 : 1) * (0.9 + 0.1 * b.side), 0.75 + 0.25 * b.side, b.guru);
  }

  bead(x, y, r, light, guru) {
    const g = this.g;
    g.fillStyle = 'rgba(90,55,25,0.12)';
    g.beginPath();
    g.ellipse(x + r * 0.15, y + r * 0.25, r * 1.02, r * 0.95, 0, 0, Math.PI * 2);
    g.fill();

    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    const c = guru ? ['#c98250', '#8a401c', '#4a1e0c'] : ['#f8c891', '#d98a4c', '#94491f'];
    gr.addColorStop(0, c[0]);
    gr.addColorStop(0.55, c[1]);
    gr.addColorStop(1, c[2]);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();

    g.save();
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.clip();
    g.strokeStyle = 'rgba(100,45,12,0.2)';
    g.lineWidth = 1.2;
    for (let k = 0; k < 5; k++) {
      g.beginPath();
      g.ellipse(x + r * 0.25, y, r * (0.25 + k * 0.22), r * (0.9 + k * 0.1), 0.4, 0, Math.PI * 2);
      g.stroke();
    }
    if (light < 1) {
      g.fillStyle = `rgba(60,30,10,${(1 - light) * 0.8})`;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.restore();

    const hl = g.createRadialGradient(x - r * 0.38, y - r * 0.45, 0, x - r * 0.38, y - r * 0.45, r * 0.45);
    hl.addColorStop(0, 'rgba(255,255,255,0.6)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
}
