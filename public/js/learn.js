// Học ở khu tự học: bấm kệ sách → chọn cách học → bảng đen mở ra để học.
// Từ vựng (thẻ ghi nhớ theo cụm / theo câu), ngữ pháp (công thức, ví dụ, bài tập), luyện nghe (chép chính tả
// điền chỗ trống, 3 độ khó), luyện nói (nói đuổi theo mẫu hoặc tự nói, chấm điểm bằng nhận dạng giọng nói).
// Giọng đọc và nhận dạng giọng nói dùng sẵn của trình duyệt (miễn phí, không cần cài thêm).
// Mọi chữ lấy từ dữ liệu đều đưa vào bằng textContent (không dùng innerHTML).
import { COURSES, MODES, PHAT_MODES } from './learn-data.js';
import { STUDY_ROOMS, PHAT_ROOM } from './study.js';
import { t } from './i18n.js';

const ROOMS = Object.fromEntries([...STUDY_ROOMS, PHAT_ROOM].map((r) => [r.key, r]));
const LEVELS = { 1: 'Dễ', 2: 'Vừa', 3: 'Khó' };
const KEY = 'ammay-learn';

// ---------- tiện ích DOM ----------
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return e;
}
// chữ lấy từ bài học: không đưa qua bộ dịch giao diện
const raw = (tag, text, cls) => h(tag, { class: cls, text, 'data-no-i18n': true });
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function save(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch { /* bỏ qua */ }
}

// ---------- giọng đọc ----------
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
function voiceFor(lang) {
  if (!synth) return null;
  const vs = synth.getVoices(), l = lang.toLowerCase(), base = l.slice(0, 2);
  const same = vs.filter((v) => v.lang.replace('_', '-').toLowerCase() === l);
  const near = same.length ? same : vs.filter((v) => v.lang.toLowerCase().startsWith(base));
  return near.find((v) => /natural|google|online/i.test(v.name)) || near[0] || null;
}
synth?.addEventListener?.('voiceschanged', () => {});
function speak(text, lang, rate = 1) {
  if (!synth) return Promise.resolve();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  const v = voiceFor(lang);
  if (v) u.voice = v;
  return new Promise((res) => {
    u.onend = res;
    u.onerror = res;
    synth.speak(u);
    setTimeout(res, 2000 + text.length * 260 / rate); // phòng khi trình duyệt không báo xong
  });
}

// ---------- nhận dạng giọng nói ----------
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
// nghe một lượt: trả { text, conf, alts } — conf là độ rõ máy nghe được (0..1),
// alts: tối đa 5 cách máy hiểu câu vừa nói (chọn cách khớp nhất, để đọc đúng mà máy nghe nhầm thì ít bị bôi đỏ oan)
function listenOnce(lang, { continuous = false, onPartial } = {}) {
  return new Promise((resolve, reject) => {
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = continuous;
    rec.maxAlternatives = 5;
    let finalText = '', confs = [];
    const finals = [];
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finals.push([...r].map((x) => x.transcript.trim()));
          finalText += (finalText ? ' ' : '') + r[0].transcript.trim();
          if (r[0].confidence > 0) confs.push(r[0].confidence);
        } else interim += r[0].transcript;
      }
      onPartial?.((finalText + ' ' + interim).trim());
    };
    rec.onerror = (e) => reject(e.error || 'error');
    rec.onend = () => {
      const alts = [];
      for (let k = 0; k < 5; k++) alts.push(finals.map((f) => f[Math.min(k, f.length - 1)]).join(' '));
      resolve({ text: finalText, conf: confs.length ? confs.reduce((a, b) => a + b) / confs.length : 0, alts: [...new Set(alts)].filter(Boolean) });
    };
    rec.start();
    listenOnce.stop = () => rec.stop();
  });
}

// ---------- so khớp câu (bỏ dấu câu, chữ hoa/thường) ----------
const cjk = (lang) => /^(zh|ko|ja)/.test(lang);
function toks(s, lang) {
  s = s.toLowerCase().normalize('NFC').replace(/['’]/g, '').replace(/[\p{P}\p{S}]/gu, ' ');
  return cjk(lang) ? [...s.replace(/\s+/g, '')] : s.split(/\s+/).filter(Boolean);
}
// đánh dấu từng phần của câu mẫu đã nói đúng (theo dãy con chung dài nhất)
function compare(target, said, lang) {
  const a = toks(target, lang), b = toks(said, lang);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const hit = new Array(a.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) {
      hit[i] = true;
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  const lcs = L[0][0];
  return { sim: a.length + b.length ? (2 * lcs) / (a.length + b.length) : 0, hit, tokens: a };
}
// Kiểm tra phát âm: chia câu mẫu thành các ô để tô màu (tiếng Trung từng chữ, tiếng khác từng từ),
// ô nào máy nghe ra đúng thì xanh, không nghe ra thì đỏ
function units(text, lang) {
  const parts = /^zh/.test(lang) ? [...text] : text.split(/\s+/).filter(Boolean);
  return parts.map((w) => ({ show: w, toks: toks(w, lang), ok: null }));
}
const scoreOf = (U) => {
  const n = U.reduce((a, u) => a + u.toks.length, 0);
  return n ? Math.round((100 * U.reduce((a, u) => a + (u.ok ? u.toks.length : 0), 0)) / n) : 0;
};
function checkSaid(text, alts, lang) {
  const U = units(text, lang), n = U.reduce((a, u) => a + u.toks.length, 0);
  // chấm theo MỘT cách hiểu khớp nhất (không gộp nhiều cách, để từ đọc sai vẫn bị đỏ)
  let hit = new Array(n).fill(false);
  for (const said of alts) {
    const h2 = compare(text, said, lang).hit;
    if (h2.filter(Boolean).length > hit.filter(Boolean).length) hit = h2;
  }
  let k = 0;
  for (const u of U) {
    u.ok = u.toks.length ? u.toks.every((_, j) => hit[k + j]) : null;
    k += u.toks.length;
  }
  return { units: U, score: scoreOf(U) };
}
const norm = (s) => s.toLowerCase().normalize('NFC').replace(/[\p{P}\p{S}\s]/gu, '');
const grade = (sc) => (sc >= 90 ? 'Tuyệt vời!' : sc >= 75 ? 'Rất tốt!' : sc >= 55 ? 'Khá rồi, luyện thêm chút nữa' : 'Cần luyện thêm — nghe mẫu rồi nói lại nhé');

// ---------- bảng học ----------
export function createLearn({ openModal, closeModal, toast, setBoard }) {
  const store = load();
  let room = null, course = null, lang = 'en-US', mode = null;
  const state = {}; // trạng thái từng phòng: { mode, vocab:{...}, grammar:{...}, ... }

  // hộp chọn cách học (mở khi bấm kệ sách)
  const shelfModal = h('div', { class: 'modal', id: 'modal-shelf', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'shelf-title' });
  const shelfSheet = h('div', { class: 'sheet shelf-sheet' });
  shelfModal.append(shelfSheet);
  // bảng đen
  const boardModal = h('div', { class: 'modal board-modal', id: 'modal-board', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'chalk-title' });
  const chalk = h('div', { class: 'chalk' });
  boardModal.append(chalk);
  document.body.append(shelfModal, boardModal);
  for (const m of [shelfModal, boardModal]) {
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('[data-close]')) close(m);
    });
    // gõ chữ trong bảng không làm nhân vật đi
    m.addEventListener('keydown', (e) => e.stopPropagation());
  }
  function close(m) {
    synth?.cancel();
    listenOnce.stop?.();
    closeModal(m);
  }
  const modesOf = (key) => (key === 'phat' ? PHAT_MODES : MODES);

  function openShelf(key) {
    room = ROOMS[key];
    course = COURSES[key];
    lang = room.lang;
    shelfSheet.replaceChildren(
      h('div', { class: 'sheet-head' }, h('h2', { id: 'shelf-title', text: `Kệ sách · ${room.name}` }), h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
      h('p', { class: 'muted', text: 'Chọn cách học — bảng đen trên tường sẽ mở ra. Ngồi vào bàn học thì nhạc học và đồng hồ học / nghỉ vẫn chạy như thường.' }),
      h('div', { class: 'shelf-grid' }, Object.entries(modesOf(key)).map(([id, m]) =>
        h('button', { class: 'shelf-card', onclick: () => { closeModal(shelfModal); openBoard(key, id); } },
          h('span', { class: 'shelf-ico', text: m.icon }),
          h('b', { text: m.name }),
          h('small', { text: m.desc })))),
    );
    openModal('#modal-shelf');
  }

  function openBoard(key, m = null) {
    room = ROOMS[key];
    course = COURSES[key];
    lang = room.lang;
    const modes = modesOf(key);
    const st = (state[key] ??= {});
    mode = (m && modes[m] ? m : null) || (st.mode && modes[st.mode] ? st.mode : null);
    if (!mode) return openShelf(key);
    st.mode = mode;
    render();
    openModal('#modal-board');
  }

  // ----- khung bảng: tiêu đề, các thẻ chuyển cách học, phần nội dung -----
  let body = null;
  function render() {
    const modes = modesOf(room.key);
    const isPhat = room.key === 'phat';
    body = h('div', { class: 'chalk-body' });
    chalk.replaceChildren(
      h('div', { class: 'chalk-head' },
        h('div', {}, h('small', { text: room.name }), h('h2', { id: 'chalk-title', text: modes[mode].name })),
        h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
      h('div', { class: 'chalk-tabs' }, Object.entries(modes).map(([id, md]) =>
        h('button', { class: id === mode ? 'on' : '', onclick: () => { synth?.cancel(); listenOnce.stop?.(); mode = id; state[room.key].mode = id; render(); } }, `${md.icon} `, h('span', { text: md.name })))),
      body,
    );
    if (!isPhat && synth && !voiceFor(lang)) body.append(h('p', { class: 'chalk-note', text: `Máy này chưa có giọng đọc ${room.name}, phát âm có thể chưa đúng. Có thể cài thêm giọng đọc trong cài đặt ngôn ngữ của máy, hoặc dùng Chrome / Edge.` }));
    ({ vocab: viewVocab, grammar: viewGrammar, listen: viewListen, speak: viewSpeak })[mode]();
  }
  const board = (head, lines) => setBoard(room.key, head, lines);
  const sayBtn = (text, rate = 1, label = '🔊 Nghe') => h('button', { class: 'chalk-btn', onclick: () => speak(text, lang, rate) }, label);
  const shown = (s) => (room.key === 'zh' ? s.replaceAll('|', '') : s.replaceAll('|', ''));

  // ===== Từ vựng: thẻ ghi nhớ =====
  function viewVocab() {
    const st = (state[room.key].vocab ??= { topic: 0, kind: 'phrase', queue: null, flip: false });
    const known = new Set((store.known ??= {})[room.key] ?? []);
    const topics = course.vocab;
    const items = topics[st.topic].items;
    if (!st.queue) st.queue = shuffle(items.map((_, i) => i).filter((i) => !known.has(items[i][0])));
    const sel = h('select', { class: 'chalk-sel', onchange: (e) => { st.topic = +e.target.value; st.queue = null; st.flip = false; render(); } },
      topics.map((tp, i) => h('option', { value: i, selected: i === st.topic, text: tp.topic })));
    const seg = h('div', { class: 'chalk-seg' }, [['phrase', 'Theo cụm'], ['sent', 'Theo câu']].map(([k, label]) =>
      h('button', { class: st.kind === k ? 'on' : '', onclick: () => { st.kind = k; st.flip = false; render(); } }, label)));
    const doneN = items.filter((it) => known.has(it[0])).length;
    body.append(h('div', { class: 'chalk-row' }, sel, seg, h('span', { class: 'chalk-meta', text: `Đã nhớ ${doneN}/${items.length}` })));
    if (!st.queue.length) {
      board(modesOf(room.key).vocab.name, [topics[st.topic].topic, 'Đã nhớ hết chủ đề này!']);
      body.append(h('div', { class: 'chalk-card done' }, h('p', { text: 'Bạn đã nhớ hết các từ của chủ đề này. Lành thay!' }),
        h('button', { class: 'chalk-btn', onclick: () => { store.known[room.key] = (store.known[room.key] ?? []).filter((w) => !items.some((it) => it[0] === w)); save(store); st.queue = null; render(); } }, 'Học lại chủ đề này')));
      return;
    }
    const it = items[st.queue[0]];
    const [w, wp, m, ph, php, phm, s, sp, sm] = it;
    const front = st.kind === 'phrase' ? ph : s, frontP = st.kind === 'phrase' ? php : sp, frontM = st.kind === 'phrase' ? phm : sm;
    board(topics[st.topic].topic, [front, frontP || (st.flip ? frontM : '')]);
    const card = h('div', { class: 'chalk-card' + (st.flip ? ' flipped' : ''), role: 'button', tabindex: 0, onclick: () => { st.flip = !st.flip; render(); } },
      raw('div', front, 'card-front'),
      frontP ? raw('div', frontP, 'card-pron') : null,
      st.flip
        ? h('div', { class: 'card-back' }, raw('div', frontM, 'card-mean'), h('div', { class: 'card-word' }, raw('b', w), wp ? raw('i', ` ${wp}`) : null, raw('span', ` — ${m}`)))
        : h('div', { class: 'card-hint', text: 'Chạm vào thẻ để xem nghĩa' }));
    const isPhat = room.key === 'phat';
    body.append(card, h('div', { class: 'chalk-actions' },
      !isPhat ? sayBtn(front) : null, !isPhat ? sayBtn(front, 0.6, '🐢 Đọc chậm') : null,
      h('button', { class: 'chalk-btn ghost', onclick: () => { st.queue.push(st.queue.shift()); st.flip = false; render(); } }, '↻ Chưa nhớ'),
      h('button', { class: 'chalk-btn ok', onclick: () => { st.queue.shift(); (store.known[room.key] ??= []).push(w); save(store); st.flip = false; render(); } }, '✓ Đã nhớ')));
  }

  // ===== Ngữ pháp / giáo lý: công thức → giải thích → ví dụ → bài tập =====
  function viewGrammar() {
    const st = (state[room.key].grammar ??= { i: null });
    const list = course.grammar;
    const isPhat = room.key === 'phat';
    if (st.i == null) {
      board(modesOf(room.key).grammar.name, list.slice(0, 4).map((g, i) => `${i + 1}. ${g.title}`));
      body.append(h('p', { class: 'chalk-sub', text: isPhat ? 'Mỗi bài gồm: tóm tắt, giải thích dễ hiểu, ví dụ minh hoạ, rồi làm bài chọn đáp án và xếp câu.' : 'Mỗi bài gồm: công thức, giải thích dễ hiểu, ví dụ có giọng đọc, rồi làm bài chọn đáp án và xếp câu.' }),
        h('div', { class: 'chalk-list' }, list.map((g, i) => h('button', { class: 'chalk-item', onclick: () => { st.i = i; render(); } }, h('b', { text: `${i + 1}. ` }), raw('span', g.title)))));
      return;
    }
    const g = list[st.i];
    board(g.title, [g.pattern]);
    body.append(
      h('div', { class: 'chalk-row' },
        h('button', { class: 'chalk-btn ghost', onclick: () => { st.i = null; render(); } }, '← Danh sách bài'),
        h('span', { class: 'chalk-meta', text: `Bài ${st.i + 1}/${list.length}` })),
      raw('h3', g.title, 'chalk-h'),
      raw('div', g.pattern, 'chalk-pattern'),
      raw('p', g.explain, 'chalk-text'),
      h('div', { class: 'chalk-ex' }, g.ex.map(([tx, mean, pr]) => h('div', { class: 'ex-row' },
        !isPhat ? h('button', { class: 'chalk-ico', 'aria-label': 'Nghe', onclick: () => speak(tx, lang) }, '🔊') : null,
        h('div', {}, raw('div', tx, 'ex-t'), pr ? raw('div', pr, 'card-pron') : null, raw('div', mean, 'ex-m'))))),
      h('h4', { class: 'chalk-h4', text: 'Luyện tập' }));
    // trắc nghiệm: bấm một đáp án, đúng hiện xanh, sai hiện đỏ kèm đáp án đúng
    let right = 0, answered = 0;
    const score = h('span', { class: 'chalk-meta' });
    const upd = () => (score.textContent = t(`Đúng ${right}/${g.quiz.length}`));
    g.quiz.forEach(([q, opts]) => {
      const row = h('div', { class: 'quiz' }, raw('div', q, 'quiz-q'));
      const btns = h('div', { class: 'quiz-opts' });
      for (const o of shuffle(opts)) {
        btns.append(h('button', { class: 'chalk-opt', 'data-no-i18n': true, text: o, onclick: (e) => {
          if (row.dataset.done) return;
          row.dataset.done = 1;
          answered++;
          const ok = o === opts[0];
          if (ok) right++;
          e.currentTarget.classList.add(ok ? 'good' : 'bad');
          if (!ok) [...btns.children].find((b) => b.textContent === opts[0])?.classList.add('good');
          upd();
          if (answered === g.quiz.length) board(g.title, [g.pattern, t(`Đúng ${right}/${g.quiz.length}`)]);
        } }));
      }
      row.append(btns);
      body.append(row);
    });
    upd();
    body.append(score);
    // xếp các từ thành câu đúng
    const [words, mean] = g.order;
    const sep = room.key === 'zh' ? '' : ' ';
    const pool = h('div', { class: 'order-pool' }), line = h('div', { class: 'order-line' });
    const res = h('div', { class: 'order-res' });
    const chip = (wd, from, to) => {
      const b = h('button', { class: 'chalk-chip', 'data-no-i18n': true, text: wd, onclick: () => { to.append(b); res.textContent = ''; [from, to] = [to, from]; } });
      return b;
    };
    for (const wd of shuffle(words)) pool.append(chip(wd, pool, line));
    body.append(h('div', { class: 'order' },
      h('div', { class: 'quiz-q', text: 'Xếp các từ thành câu đúng:' }), raw('div', mean, 'ex-m'), line, pool,
      h('div', { class: 'chalk-actions' },
        h('button', { class: 'chalk-btn', onclick: () => {
          const said = [...line.children].map((b) => b.textContent).join(sep);
          const ok = said === words.join(sep);
          res.className = 'order-res ' + (ok ? 'good' : 'bad');
          res.textContent = ok ? t('Chính xác!') : `${t('Chưa đúng. Câu đúng là:')} ${words.join(sep)}`;
          if (ok && !isPhat) speak(words.join(sep), lang);
        } }, 'Kiểm tra'),
        h('button', { class: 'chalk-btn ghost', onclick: () => render() }, 'Làm lại'),
        st.i + 1 < list.length ? h('button', { class: 'chalk-btn ghost', onclick: () => { st.i++; render(); } }, 'Bài tiếp →') : null),
      res));
  }

  // ===== Luyện nghe: chép chính tả, điền chỗ trống =====
  function viewListen() {
    const st = (state[room.key].listen ??= { lv: 1, queue: [], cur: null, ok: 0, total: 0 });
    const next = () => {
      if (!st.queue.length) st.queue = shuffle(course.listen.map((_, i) => i).filter((i) => course.listen[i][0] === st.lv));
      st.cur = st.queue.shift();
      st.checked = false;
      st.blanks = null;
    };
    if (st.cur == null || course.listen[st.cur][0] !== st.lv) next();
    const [lv, text, pron, mean] = course.listen[st.cur];
    const sep = room.key === 'zh' ? '' : ' ';
    const words = room.key === 'zh' ? text.split('|') : text.split(' ');
    const plain = words.join(sep);
    // chọn chỗ trống: dễ 1 từ, vừa khoảng 40% số từ, khó: chép cả câu
    if (!st.blanks) {
      const cand = words.map((w, i) => i).filter((i) => norm(words[i]).length > (room.key === 'zh' || room.key === 'ko' ? 0 : 1));
      const n = lv === 1 ? 1 : lv === 2 ? Math.max(2, Math.round(words.length * 0.4)) : words.length;
      st.blanks = new Set(lv === 3 ? words.map((_, i) => i) : shuffle(cand).slice(0, n));
    }
    const seg = h('div', { class: 'chalk-seg' }, [1, 2, 3].map((k) =>
      h('button', { class: st.lv === k ? 'on' : '', onclick: () => { st.lv = k; st.queue = []; st.cur = null; render(); } }, LEVELS[k])));
    body.append(h('div', { class: 'chalk-row' }, seg, h('span', { class: 'chalk-meta', text: `Đúng ${st.ok}/${st.total} chỗ trống` })));
    const rate = lv === 1 ? 0.8 : 0.95;
    body.append(h('p', { class: 'chalk-sub', text: lv === 3 ? 'Nghe rồi chép lại cả câu.' : 'Nghe rồi điền từ còn thiếu vào chỗ trống.' }),
      h('div', { class: 'chalk-actions' }, sayBtn(plain, rate, '🔊 Nghe câu'), sayBtn(plain, 0.55, '🐢 Nghe chậm')));
    const inputs = [];
    const line = h('div', { class: 'dict-line' + (room.key === 'zh' ? ' tight' : '') });
    let full = null;
    if (lv === 3) {
      full = h('textarea', { class: 'dict-full', rows: 2, placeholder: 'Gõ lại câu bạn nghe được…', 'data-no-i18n': false });
      line.append(full);
    } else {
      words.forEach((w, i) => {
        if (st.blanks.has(i)) {
          const inp = h('input', { class: 'dict-in', size: Math.max(3, [...w].length + 1), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
          inp.addEventListener('keydown', (e) => e.key === 'Enter' && check());
          inputs.push([inp, w]);
          line.append(inp);
        } else line.append(raw('span', w, 'dict-w'));
      });
    }
    board(`${modesOf(room.key).listen.name} · ${LEVELS[lv]}`, [lv === 3 ? '…' : words.map((w, i) => (st.blanks.has(i) ? '____' : w)).join(sep)]);
    const res = h('div', { class: 'dict-res' });
    function check() {
      if (st.checked) return;
      st.checked = true;
      let ok = 0, total = 0;
      if (full) {
        const c = compare(plain, full.value, lang);
        total = c.tokens.length;
        ok = c.hit.filter(Boolean).length;
        res.append(h('div', { class: 'said' }, c.tokens.map((tk, i) => raw('span', tk + (cjk(lang) ? '' : ' '), c.hit[i] ? 'tk good' : 'tk bad'))));
      } else {
        for (const [inp, w] of inputs) {
          total++;
          const good = norm(inp.value) === norm(w);
          if (good) ok++;
          inp.classList.add(good ? 'good' : 'bad');
          if (!good) inp.title = w;
          inp.disabled = true;
          if (!good) inp.after(raw('span', ` ${w} `, 'dict-fix'));
        }
      }
      st.ok += ok;
      st.total += total;
      res.prepend(h('div', { class: 'dict-score', text: `${t('Đúng')} ${ok}/${total}` }));
      res.append(...[raw('div', plain, 'ex-t'), pron ? raw('div', pron, 'card-pron') : null, raw('div', mean, 'ex-m')].filter(Boolean));
      board(`${modesOf(room.key).listen.name} · ${LEVELS[lv]}`, [plain, `${ok}/${total}`]);
      (store.listen ??= {})[room.key] = { ok: st.ok, total: st.total };
      save(store);
    }
    body.append(line, h('div', { class: 'chalk-actions' },
      h('button', { class: 'chalk-btn ok', onclick: check }, 'Kiểm tra'),
      h('button', { class: 'chalk-btn ghost', onclick: () => { next(); render(); } }, 'Câu khác →')), res);
    setTimeout(() => (inputs[0]?.[0] ?? full)?.focus(), 60);
  }

  // ===== Luyện nói: đọc câu mẫu, kiểm tra phát âm — từ đúng xanh, từ chưa đúng bôi đỏ, luyện lại từng từ =====
  function viewSpeak() {
    const st = (state[room.key].speak ??= { i: 0, res: null });
    // câu mẫu: các câu luyện nghe + câu ví dụ trong từ vựng
    const pool = [...course.listen.map(([, tx, pr, m]) => [shown(tx), pr, m]), ...course.vocab.flatMap((tp) => tp.items.map((it) => [it[6], it[7], it[8]]))];
    st.i %= pool.length;
    const [tx, pr, m] = pool[st.i];
    const U = st.res?.units ?? units(tx, lang);
    board(modesOf(room.key).speak.name, [tx, st.res ? `${st.res.score}%` : pr]);
    if (!SR) body.append(h('p', { class: 'chalk-note', text: 'Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Hãy mở trang bằng Chrome hoặc Edge (máy tính, Android) để kiểm tra phát âm. Vẫn có thể nghe mẫu và đọc theo.' }));
    body.append(h('p', { class: 'chalk-sub', text: 'Bấm 🎙️ rồi đọc to câu dưới đây. Từ đọc đúng hiện màu xanh, từ đọc chưa đúng bôi đỏ. Bấm vào một từ để nghe cách đọc từ đó.' }));
    const sent = h('div', { class: 'pron-sent' + (room.key === 'zh' ? ' tight' : ''), 'data-no-i18n': true });
    for (const u of U) {
      sent.append(h('button', {
        class: 'pron-w' + (u.ok === true ? ' good' : u.ok === false ? ' bad' : ''),
        text: u.show,
        onclick: () => u.toks.length && speak(u.show.replace(/[\p{P}\p{S}]/gu, ''), lang, 0.75),
      }));
    }
    const live = h('div', { class: 'speak-live', 'data-no-i18n': true });
    const notes = h('div', {});
    body.append(h('div', { class: 'chalk-card pron-card' }, sent, pr ? raw('div', pr, 'card-pron') : null, raw('div', m, 'card-mean')));
    const micErr = (err) => (err === 'not-allowed' || err === 'service-not-allowed'
      ? 'Chưa được dùng micro. Hãy cho phép micro cho trang này (biểu tượng ổ khoá cạnh địa chỉ trang) rồi thử lại.'
      : err === 'no-speech' ? 'Máy chưa nghe thấy tiếng nói. Hãy đọc to, rõ hơn và thử lại.' : `Không nghe được (${err}). Thử lại nhé.`);
    // nút micro: bấm để đọc, bấm lần nữa để dừng sớm
    const label = '🎙️ Bấm để đọc';
    const micBtn = h('button', { class: 'chalk-btn ok', disabled: !SR, onclick: async () => {
      if (micBtn.dataset.on) return listenOnce.stop?.();
      micBtn.dataset.on = 1;
      micBtn.textContent = t('⏹ Dừng');
      synth?.cancel();
      live.textContent = t('Mời bạn đọc…');
      try {
        const r = await listenOnce(lang, { onPartial: (p) => (live.textContent = p) });
        st.res = checkSaid(tx, r.alts.length ? r.alts : [r.text], lang);
        st.heard = r.text;
        render();
      } catch (err) {
        delete micBtn.dataset.on;
        micBtn.textContent = t(label);
        live.textContent = '';
        notes.replaceChildren(h('p', { class: 'chalk-note', text: micErr(err) }));
      }
    } }, label);
    body.append(h('div', { class: 'chalk-actions' },
      sayBtn(tx, 0.9, '🔊 Nghe mẫu'), sayBtn(tx, 0.6, '🐢 Chậm'), micBtn,
      h('button', { class: 'chalk-btn ghost', onclick: () => { st.i = (st.i + 1 + Math.floor(Math.random() * 3)) % pool.length; st.res = null; render(); } }, 'Câu khác →')),
      live, notes);
    if (st.res) {
      const bad = U.filter((u) => u.ok === false);
      body.append(h('div', { class: 'dict-score', text: `${st.res.score}% · ${t(grade(st.res.score))}` }),
        h('div', { class: 'said' }, h('span', { text: 'Máy nghe được: ' }), raw('span', st.heard || '…')));
      if (bad.length) {
        // luyện lại riêng từng từ bị đỏ: máy đọc mẫu rồi bật micro nghe mình đọc từ đó
        body.append(h('div', { class: 'keys' }, h('span', { text: 'Luyện lại từ đỏ:' }), bad.map((u) => {
          const word = u.show.replace(/[\p{P}\p{S}]/gu, '');
          const b = h('button', { class: 'key bad pron-redo', 'data-no-i18n': true, text: `🎙️ ${word}`, disabled: !SR, onclick: async () => {
            if (b.dataset.on) return;
            b.dataset.on = 1;
            try {
              await speak(word, lang, 0.75);
              live.textContent = t('Mời bạn đọc…');
              const r = await listenOnce(lang, { onPartial: (p) => (live.textContent = p) });
              if ((r.alts.length ? r.alts : [r.text]).some((x) => compare(word, x, lang).hit.every(Boolean))) {
                u.ok = true;
                st.res.score = scoreOf(U);
                render();
              } else live.textContent = `${r.text || '…'} — ${t('chưa đúng, thử lại nhé')}`;
            } catch (err) {
              live.textContent = t(micErr(err));
            }
            delete b.dataset.on;
          } });
          return b;
        })));
      } else body.append(h('p', { class: 'chalk-sub', text: 'Bạn đọc đúng hết các từ. Lành thay!' }));
    }
    body.append(h('p', { class: 'chalk-fine', text: 'Kiểm tra phát âm bằng nhận dạng giọng nói có sẵn trong trình duyệt (miễn phí): tiếng nói được gửi tới dịch vụ nhận dạng của trình duyệt (Google hoặc Microsoft) để chuyển thành chữ. Am Mây không ghi âm và không lưu lại.' }));
  }

  return { openShelf, openBoard, toast };
}
