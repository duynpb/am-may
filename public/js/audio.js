// Âm thanh tổng hợp bằng Web Audio: gió, chuông gió, mõ, chuông, trống và giọng tụng.
const SYL = [
  { s: 'Nam', v: 'a', p: 0 },
  { s: 'Mô', v: 'o', p: 0 },
  { s: 'A', v: 'a', p: 2 },
  { s: 'Di', v: 'i', p: 0 },
  { s: 'Đà', v: 'a', p: -2 },
  { s: 'Phật', v: 'a', p: -2 },
];
export const CHANT_SYLLABLES = SYL.map((x) => x.s);
const VOWELS = { a: [730, 1090, 2440], o: [430, 780, 2500], i: [300, 2150, 2900] };
const BEAT = 0.66;
const PHRASE = 'Nam mô A Di Đà Phật';
// vị trí ký tự bắt đầu của từng chữ, để khớp sự kiện 'boundary' của giọng đọc
const SYL_POS = (() => {
  let at = 0;
  return SYL.map((x) => {
    const p = PHRASE.indexOf(x.s, at);
    at = p + x.s.length;
    return p;
  });
})();
export const RECORDING_URL = 'audio/tung-kinh.mp3';

// Giọng tiếng Việt có sẵn trên thiết bị (Web Speech API)
export function vietnameseVoices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter((v) => /^vi\b|^vi[-_]/i.test(v.lang));
}
function bestVoice(name) {
  const vs = vietnameseVoices();
  if (!vs.length) return null;
  return (
    vs.find((v) => v.name === name) ||
    vs.find((v) => /NamMinh/i.test(v.name)) ||
    vs.find((v) => /Natural|Online/i.test(v.name)) ||
    vs.find((v) => /Google/i.test(v.name)) ||
    vs[0]
  );
}

export class Sound {
  constructor(settings) {
    this.s = settings;
    this.ctx = null;
    this.chanting = false;
    this.hidden = false;
    this.hasRecording = false;
    this.beatMarks = [];
    this.ttsMarks = [];
    this.recordingChecked = fetch(RECORDING_URL, { method: 'HEAD', cache: 'no-store' })
      .then((r) => (this.hasRecording = r.ok && !/text\/html/.test(r.headers.get('content-type') || '')))
      .catch(() => false);
    // mốc thời gian từng chữ của bản ghi âm (cho hiệu ứng karaoke)
    fetch(RECORDING_URL.replace(/\.mp3$/, '.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (this.timing = j))
      .catch(() => {});
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.addEventListener?.('voiceschanged', () => this.onVoices?.());
    }
  }

  // 'record' | 'tts' | 'synth' — theo cài đặt và khả năng của thiết bị
  get chantMode() {
    const want = this.s.chantVoice || 'auto';
    if (want === 'record' && this.hasRecording) return 'record';
    if (want === 'synth') return 'synth';
    if (want.startsWith('tts:') && bestVoice(want.slice(4))) return 'tts';
    if (this.hasRecording && want !== 'tts-auto') return 'record';
    if (bestVoice()) return 'tts';
    return 'synth';
  }

  chantModeLabel() {
    const m = this.chantMode;
    if (m === 'record') return 'Đang dùng bản ghi âm tụng kinh.';
    if (m === 'tts') return `Đang dùng giọng tiếng Việt: ${this.ttsVoice()?.name}.`;
    if (this.s.chantVoice === 'synth') return 'Đang dùng giọng ngân tổng hợp.';
    return 'Thiết bị này chưa có giọng tiếng Việt — đang dùng giọng ngân tổng hợp.';
  }

  ttsVoice() {
    const want = this.s.chantVoice || '';
    return bestVoice(want.startsWith('tts:') ? want.slice(4) : undefined);
  }

  speakPhrase() {
    const voice = this.ttsVoice();
    if (!voice || this.s.muted || this.hidden) return;
    const u = new SpeechSynthesisUtterance(PHRASE);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.62;
    u.pitch = 0.8;
    u.volume = Math.min(1, this.s.chantVol * 1.4);
    u.onboundary = (e) => {
      const i = SYL_POS.findIndex((p, k) => e.charIndex >= p && (k === SYL_POS.length - 1 || e.charIndex < SYL_POS[k + 1]));
      if (i >= 0 && this.chanting) {
        this.ttsBoundary = true;
        this.mark(this.ttsMarks, this.ctx.currentTime, i, i === 5 ? 0.6 : 0.4);
      }
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  playRecording() {
    if (!this.recEl) {
      this.recEl = new Audio(RECORDING_URL);
      this.recEl.loop = true;
      this.recEl.crossOrigin = 'anonymous';
      this.ctx.createMediaElementSource(this.recEl).connect(this.bus.chant);
    }
    this.recEl.currentTime = 0;
    this.recEl.play().catch(() => {});
  }

  mark(list, t, i, dur) {
    list.push({ t, i, dur });
    if (list.length > 16) list.shift();
  }

  // Vị trí karaoke hiện tại: { i: chữ đang tụng (0–5), k: phần đã tụng của chữ (0–1) },
  // { all: true } khi không biết mốc, hoặc null khi chưa tới chữ nào.
  karaoke() {
    if (!this.chanting || !this.ctx) return null;
    if (this.mode === 'record') {
      const el = this.recEl, tm = this.timing;
      if (!el || !tm?.beats?.length) return { all: true };
      const b = tm.beats, t = el.currentTime + (tm.offset || 0);
      if (t < b[0]) return null;
      let lo = 0, hi = b.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (b[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      const end = b[lo + 1] ?? (el.duration || b[lo] + 0.7);
      return { i: (lo + (tm.firstSyllable || 0)) % 6, k: Math.min(1, (t - b[lo]) / (end - b[lo])) };
    }
    const list = this.mode === 'tts' && this.ttsBoundary ? this.ttsMarks : this.beatMarks;
    const now = this.ctx.currentTime;
    let cur = null;
    for (const m of list) if (m.t <= now) cur = m;
    if (!cur) return null;
    return { i: cur.i, k: Math.min(1, (now - cur.t) / cur.dur) };
  }

  stopVoices() {
    this.beatMarks = [];
    this.ttsMarks = [];
    clearInterval(this.timer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.recEl?.pause();
  }

  // Phải gọi sau một thao tác của người dùng (chính sách autoplay)
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.hidden) this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(3.6, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    this.reverb.connect(wet).connect(this.master);
    this.bus = {};
    for (const k of ['ambient', 'chant', 'fx']) {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.master);
      g.connect(this.reverb);
      this.bus[k] = g;
    }
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.apply();
    this.startAmbient();
  }

  impulse(sec, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  apply() {
    if (!this.ctx) return;
    const s = this.s, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : 1, t, 0.08);
    this.bus.ambient.gain.setTargetAtTime(s.ambient ? s.ambientVol * 0.9 : 0, t, 0.2);
    this.bus.chant.gain.setTargetAtTime(s.chantVol * 0.9, t, 0.1);
    this.bus.fx.gain.setTargetAtTime(s.fx ? s.fxVol : 0, t, 0.05);
    if (s.muted && 'speechSynthesis' in window) speechSynthesis.cancel();
  }

  setHidden(hidden) {
    this.hidden = hidden;
    if (!this.ctx) return;
    if (hidden && !this.s.bg) {
      this.ctx.suspend();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      this.recEl?.pause();
    } else if (!hidden) {
      this.ctx.resume();
      if (this.chanting && this.mode === 'record') this.recEl?.play().catch(() => {});
    }
  }

  get live() {
    return this.ctx && this.ctx.state === 'running' && !this.s.muted;
  }

  startAmbient() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 480;
    bp.Q.value = 0.6;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 260;
    lfo.connect(lfoG).connect(bp.frequency);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11;
    const lfo2G = ctx.createGain();
    lfo2G.gain.value = 0.07;
    lfo2.connect(lfo2G).connect(g.gain);
    src.connect(bp).connect(lp).connect(g).connect(this.bus.ambient);
    src.start();
    lfo.start();
    lfo2.start();
    const loop = () => {
      setTimeout(() => {
        if (this.live && this.s.ambient) this.windChimes();
        loop();
      }, 3500 + Math.random() * 7500);
    };
    loop();
  }

  tone(freq, t, { dur = 2, gain = 0.1, partials = [[1, 1]], out, type = 'sine', beat = 0 }) {
    const ctx = this.ctx;
    for (const [ratio, amp] of partials) {
      const d = dur / Math.sqrt(ratio);
      for (const det of beat ? [0, beat] : [0]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq * ratio + det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain * amp * (beat ? 0.6 : 1), t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + d + 0.05);
      }
    }
  }

  noiseHit(t, { freq = 2000, q = 1, gain = 0.2, dur = 0.05, out, type = 'bandpass' }) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random());
    src.stop(t + dur + 0.02);
  }

  windChimes() {
    const notes = [1318.5, 1480, 1661, 1976, 2217, 2637];
    const n = 1 + Math.floor(Math.random() * 3);
    let t = this.ctx.currentTime + 0.05;
    for (let i = 0; i < n; i++) {
      this.tone(notes[Math.floor(Math.random() * notes.length)], t, {
        dur: 3.4, gain: 0.035, partials: [[1, 1], [2.76, 0.32], [5.4, 0.1]], out: this.bus.ambient,
      });
      t += 0.12 + Math.random() * 0.4;
    }
  }

  // Chuông chùa: các họa âm không điều hòa + tiếng phách nhẹ
  templeBell(t, base, gain, out) {
    this.tone(base, t, {
      dur: 7, gain, out, beat: 1.3,
      partials: [[0.5, 0.55], [1, 1], [1.19, 0.5], [1.56, 0.35], [2, 0.3], [2.5, 0.18], [3.0, 0.12], [4.1, 0.06]],
    });
    this.noiseHit(t, { freq: 400, q: 0.8, gain: gain * 0.6, dur: 0.08, out });
  }

  mo(t, accent) {
    const ctx = this.ctx, out = this.bus.chant;
    const o = ctx.createOscillator();
    const f = accent ? 640 : 580;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.68, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.36, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.2);
    this.tone(f * 2.3, t, { dur: 0.08, gain: 0.08, out });
    this.noiseHit(t, { freq: 2400, q: 2, gain: 0.18, dur: 0.025, out });
  }

  voice(t, syl, dur, base = 138) {
    const ctx = this.ctx;
    const f0 = base * Math.pow(2, syl.p / 12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.22, t + 0.08);
    env.gain.setValueAtTime(0.2, t + dur * 0.55);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    env.connect(lp).connect(this.bus.chant);
    const mixG = ctx.createGain();
    const F = VOWELS[syl.v];
    [[1, 6], [0.45, 8], [0.18, 10]].forEach(([amp, q], i) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = q;
      // phụ âm mũi (N, M) mở đầu: formant thấp rồi trượt lên nguyên âm
      const nasal = /^[NM]/.test(syl.s) && i === 0;
      bp.frequency.setValueAtTime(nasal ? 260 : F[i], t);
      if (nasal) bp.frequency.linearRampToValueAtTime(F[i], t + 0.1);
      const g = ctx.createGain();
      g.gain.value = amp * 3;
      mixG.connect(bp).connect(g).connect(env);
    });
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.1;
    const vibG = ctx.createGain();
    vibG.gain.value = f0 * 0.012;
    vib.connect(vibG);
    for (const [mult, det, g] of [[1, 0, 0.5], [1, 9, 0.4], [0.5, -6, 0.45]]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f0 * mult;
      o.detune.value = det;
      vibG.connect(o.frequency);
      const og = ctx.createGain();
      og.gain.value = g;
      o.connect(og).connect(mixG);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    vib.start(t);
    vib.stop(t + dur + 0.05);
  }

  setChant(on) {
    this.init();
    if (!this.ctx) return;
    this.chanting = on;
    this.stopVoices();
    if (!on) return;
    this.mode = this.chantMode;
    this.ttsBoundary = false;
    if (this.mode === 'record') {
      this.playRecording();
      return;
    }
    this.beat = 0;
    this.nextT = this.ctx.currentTime + 0.25;
    this.timer = setInterval(() => this.schedule(), 40);
  }

  schedule() {
    const ctx = this.ctx;
    if (ctx.state !== 'running') {
      this.nextT = ctx.currentTime + 0.2;
      return;
    }
    while (this.nextT < ctx.currentTime + 0.2) {
      const i = this.beat % 6, t = this.nextT;
      if (this.beat % 24 === 0) this.templeBell(t, 165, 0.2, this.bus.chant);
      this.mo(t, i === 0);
      if (i === 5) this.mo(t + BEAT, false);
      const delay = Math.max(0, (t - ctx.currentTime) * 1000);
      if (this.mode === 'tts') {
        // giọng đọc tiếng Việt: đọc cả câu mỗi vòng, mõ giữ nhịp đều
        if (i === 0) setTimeout(() => this.chanting && this.speakPhrase(), delay);
      } else {
        this.voice(t, SYL[i], i === 5 ? BEAT * 1.7 : BEAT * 0.94);
      }
      this.mark(this.beatMarks, t, i, i === 5 ? BEAT * 1.6 : BEAT * 0.92);
      this.nextT += i === 5 ? BEAT * 2 : BEAT;
      this.beat++;
    }
  }

  // ---- hiệu ứng ----
  fxReady() {
    this.init();
    return !!this.ctx;
  }
  gassho() {
    if (!this.fxReady()) return;
    this.tone(1568, this.ctx.currentTime + 0.02, { dur: 2.6, gain: 0.07, partials: [[1, 1], [2.4, 0.25]], out: this.bus.fx });
  }
  bow() {
    if (!this.fxReady()) return;
    this.templeBell(this.ctx.currentTime + 0.6, 233, 0.16, this.bus.fx);
  }
  // phong bì rơi vào thùng gỗ, rồi một tiếng chuông nhỏ
  merit() {
    if (!this.fxReady()) return;
    const t = this.ctx.currentTime + 0.02, out = this.bus.fx;
    this.noiseHit(t, { freq: 3500, q: 0.7, gain: 0.12, dur: 0.12, out, type: 'highpass' });
    this.tone(180, t + 0.12, { dur: 0.25, gain: 0.35, out });
    this.noiseHit(t + 0.12, { freq: 500, q: 1.2, gain: 0.25, dur: 0.08, out });
    this.tone(1318.5, t + 0.45, { dur: 2.8, gain: 0.07, partials: [[1, 1], [2.76, 0.3], [5.4, 0.1]], out });
  }

  // quẹt diêm châm nhang, rồi một tiếng chuông nhỏ
  incense() {
    if (!this.fxReady()) return;
    const t = this.ctx.currentTime + 0.02, out = this.bus.fx;
    this.noiseHit(t, { freq: 2500, q: 0.6, gain: 0.3, dur: 0.22, out, type: 'highpass' });
    for (let i = 0; i < 6; i++) this.noiseHit(t + 0.08 + Math.random() * 0.5, { freq: 4000, q: 2, gain: 0.06, dur: 0.02, out });
    this.tone(1760, t + 0.9, { dur: 3, gain: 0.06, partials: [[1, 1], [2.76, 0.3]], out });
  }
  bigBell() {
    if (!this.fxReady()) return;
    this.templeBell(this.ctx.currentTime + 0.02, 98, 0.42, this.bus.fx);
  }
  drum() {
    if (!this.fxReady()) return;
    const ctx = this.ctx, t = ctx.currentTime + 0.02, out = this.bus.fx;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.95, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 1.5);
    this.noiseHit(t, { freq: 260, q: 0.7, gain: 0.5, dur: 0.18, out, type: 'lowpass' });
  }
  bead() {
    if (!this.fxReady()) return;
    const t = this.ctx.currentTime + 0.01, out = this.bus.fx;
    this.noiseHit(t, { freq: 3200, q: 3, gain: 0.35, dur: 0.035, out });
    this.tone(1900, t, { dur: 0.06, gain: 0.05, out });
    this.noiseHit(t + 0.05, { freq: 2600, q: 3, gain: 0.18, dur: 0.03, out });
  }
}
