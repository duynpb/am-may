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
// nghe một lượt: trả { text, conf } — conf là độ rõ máy nghe được (0..1)
function listenOnce(lang, { continuous = false, onPartial } = {}) {
  return new Promise((resolve, reject) => {
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = continuous;
    rec.maxAlternatives = 1;
    let finalText = '', confs = [];
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalText += (finalText ? ' ' : '') + r[0].transcript.trim();
          if (r[0].confidence > 0) confs.push(r[0].confidence);
        } else interim += r[0].transcript;
      }
      onPartial?.((finalText + ' ' + interim).trim());
    };
    rec.onerror = (e) => reject(e.error || 'error');
    rec.onend = () => resolve({ text: finalText, conf: confs.length ? confs.reduce((a, b) => a + b) / confs.length : 0 });
    rec.start();
    listenOnce.stop = () => rec.stop();
  });
}

// ---------- so khớp câu (bỏ dấu câu, chữ hoa/thường) ----------
const cjk = (lang) => /^(zh|ko|ja)/.test(lang);
function toks(s, lang) {
  s = s.toLowerCase().normalize('NFC').replace(/[\p{P}\p{S}]/gu, ' ');
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
    const st = (state[key] ??= {});
    mode = m || st.mode;
    if (!mode) return openShelf(key);
    st.mode = mode;
    render();
    openModal('#modal-board');
  }

  // ----- khung bảng: tiêu đề, các thẻ chuyển cách học, phần nội dung -----
  let body = null;
  function render() {
    const modes = modesOf(room.key);
    body = h('div', { class: 'chalk-body' });
    chalk.replaceChildren(
      h('div', { class: 'chalk-head' },
        h('div', {}, h('small', { text: room.name }), h('h2', { id: 'chalk-title', text: modes[mode].name })),
        h('button', { class: 'x', 'data-close': true, 'aria-label': 'Đóng', text: '×' })),
      h('div', { class: 'chalk-tabs' }, Object.entries(modes).map(([id, md]) =>
        h('button', { class: id === mode ? 'on' : '', onclick: () => { synth?.cancel(); listenOnce.stop?.(); mode = id; state[room.key].mode = id; render(); } }, `${md.icon} `, h('span', { text: md.name })))),
      body,
    );
    if (synth && !voiceFor(lang)) body.append(h('p', { class: 'chalk-note', text: `Máy này chưa có giọng đọc ${room.name}, phát âm có thể chưa đúng. Có thể cài thêm giọng đọc trong cài đặt ngôn ngữ của máy, hoặc dùng Chrome / Edge.` }));
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
    body.append(card, h('div', { class: 'chalk-actions' },
      sayBtn(front), sayBtn(front, 0.6, '🐢 Đọc chậm'),
      h('button', { class: 'chalk-btn ghost', onclick: () => { st.queue.push(st.queue.shift()); st.flip = false; render(); } }, '↻ Chưa nhớ'),
      h('button', { class: 'chalk-btn ok', onclick: () => { st.queue.shift(); (store.known[room.key] ??= []).push(w); save(store); st.flip = false; render(); } }, '✓ Đã nhớ')));
  }

  // ===== Ngữ pháp / giáo lý: công thức → giải thích → ví dụ → bài tập =====
  function viewGrammar() {
    const st = (state[room.key].grammar ??= { i: null });
    const list = course.grammar;
    if (st.i == null) {
      board(modesOf(room.key).grammar.name, list.slice(0, 4).map((g, i) => `${i + 1}. ${g.title}`));
      body.append(h('p', { class: 'chalk-sub', text: 'Mỗi bài gồm: công thức, giải thích dễ hiểu, ví dụ có giọng đọc, rồi làm bài chọn đáp án và xếp câu.' }),
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
        h('button', { class: 'chalk-ico', 'aria-label': 'Nghe', onclick: () => speak(tx, lang) }, '🔊'),
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
          if (ok) speak(words.join(sep), lang);
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

  // ===== Luyện nói: nói đuổi (shadowing) hoặc tự nói, chấm điểm =====
  function viewSpeak() {
    const st = (state[room.key].speak ??= { kind: 'shadow', i: 0, p: 0 });
    const seg = h('div', { class: 'chalk-seg' }, [['shadow', 'Nói đuổi theo mẫu'], ['free', 'Tự nói']].map(([k, label]) =>
      h('button', { class: st.kind === k ? 'on' : '', onclick: () => { st.kind = k; render(); } }, label)));
    body.append(h('div', { class: 'chalk-row' }, seg));
    if (!SR) {
      body.append(h('p', { class: 'chalk-note', text: 'Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Hãy mở trang bằng Chrome hoặc Edge (máy tính, Android) để luyện nói có chấm điểm. Vẫn có thể nghe mẫu và đọc theo.' }));
    }
    const res = h('div', { class: 'speak-res' });
    const live = h('div', { class: 'speak-live', 'data-no-i18n': true });
    const micBtn = (label, run) => {
      const b = h('button', { class: 'chalk-btn ok', disabled: !SR, onclick: async () => {
        if (b.dataset.on) {
          listenOnce.stop?.();
          return;
        }
        b.dataset.on = 1;
        const was = b.textContent;
        b.textContent = t('⏹ Dừng');
        res.replaceChildren();
        try {
          await run((p) => (live.textContent = p));
        } catch (err) {
          res.append(h('p', { class: 'chalk-note', text: err === 'not-allowed' || err === 'service-not-allowed' ? 'Chưa được dùng micro. Hãy cho phép micro cho trang này (biểu tượng ổ khoá cạnh địa chỉ trang) rồi thử lại.' : err === 'no-speech' ? 'Máy chưa nghe thấy tiếng nói. Hãy nói to, rõ hơn và thử lại.' : `Không nghe được (${err}). Thử lại nhé.` }));
        }
        delete b.dataset.on;
        b.textContent = was;
      } }, label);
      return b;
    };
    if (st.kind === 'shadow') {
      // câu mẫu: các câu luyện nghe + câu ví dụ trong từ vựng
      const pool = [...course.listen.map(([, tx, pr, m]) => [shown(tx), pr, m]), ...course.vocab.flatMap((tp) => tp.items.map((it) => [it[6], it[7], it[8]]))];
      st.i %= pool.length;
      const [tx, pr, m] = pool[st.i];
      board(modesOf(room.key).speak.name, [tx, pr]);
      body.append(h('p', { class: 'chalk-sub', text: 'Nghe câu mẫu, rồi bấm "Nói theo": máy đọc mẫu xong sẽ bật micro để bạn nói lại ngay, sau đó chấm điểm.' }),
        h('div', { class: 'chalk-card' }, raw('div', tx, 'card-front'), pr ? raw('div', pr, 'card-pron') : null, raw('div', m, 'card-mean')),
        h('div', { class: 'chalk-actions' }, sayBtn(tx, 0.9, '🔊 Nghe mẫu'), sayBtn(tx, 0.6, '🐢 Chậm'),
          micBtn('🎙️ Nói theo', async (onPartial) => {
            await speak(tx, lang, 0.9);
            live.textContent = t('Mời bạn nói…');
            const r = await listenOnce(lang, { onPartial });
            showScore(tx, r);
          }),
          micBtn('🎙️ Tự đọc', async (onPartial) => {
            live.textContent = t('Mời bạn nói…');
            const r = await listenOnce(lang, { onPartial });
            showScore(tx, r);
          }),
          h('button', { class: 'chalk-btn ghost', onclick: () => { st.i = (st.i + 1 + Math.floor(Math.random() * 3)) % pool.length; render(); } }, 'Câu khác →')),
        live, res);
    } else {
      const P = course.speak[st.p % course.speak.length];
      board(modesOf(room.key).speak.name, [P.q]);
      const sample = h('div', { class: 'sample', hidden: true }, raw('div', P.sample, 'ex-t'), sayBtn(P.sample, 0.9));
      body.append(raw('h3', P.q, 'chalk-h'),
        h('p', { class: 'chalk-sub', text: 'Bấm "Bắt đầu nói", nói vài câu theo đề, xong bấm "Dừng". Máy chấm theo: dùng đủ từ gợi ý, nói đủ dài và nói rõ.' }),
        h('div', { class: 'keys' }, h('span', { text: 'Từ gợi ý:' }), P.keys.map((k) => raw('span', k, 'key'))),
        h('div', { class: 'chalk-actions' },
          micBtn('🎙️ Bắt đầu nói', async (onPartial) => {
            live.textContent = t('Mời bạn nói…');
            const r = await listenOnce(lang, { continuous: true, onPartial });
            const said = norm(r.text);
            const used = P.keys.filter((k) => said.includes(norm(k)));
            const len = toks(r.text, lang).length, need = cjk(lang) ? 12 : 8;
            const sc = Math.round(60 * (used.length / P.keys.length) + 25 * Math.min(1, len / need) + 15 * (r.conf || (len ? 0.7 : 0)));
            res.replaceChildren(...[
              h('div', { class: 'dict-score', text: `${sc}/100 · ${t(grade(sc))}` }),
              h('div', { class: 'said' }, h('span', { text: 'Máy nghe được: ' }), raw('span', r.text || '…')),
              h('div', { class: 'keys' }, h('span', { text: 'Từ gợi ý:' }), P.keys.map((k) => raw('span', k, 'key ' + (used.includes(k) ? 'good' : 'bad')))),
              len < need ? h('p', { class: 'chalk-sub', text: 'Thử nói dài hơn một chút, thêm một hai câu nữa.' }) : null].filter(Boolean));
            board(P.q, [r.text.slice(0, 60), `${sc}/100`]);
          }),
          h('button', { class: 'chalk-btn ghost', onclick: () => (sample.hidden = !sample.hidden) }, 'Xem câu mẫu'),
          h('button', { class: 'chalk-btn ghost', onclick: () => { st.p++; render(); } }, 'Đề khác →')),
        sample, live, res);
    }
    body.append(h('p', { class: 'chalk-fine', text: 'Chấm điểm bằng nhận dạng giọng nói có sẵn trong trình duyệt: tiếng nói được gửi tới dịch vụ nhận dạng của trình duyệt (Google hoặc Microsoft) để chuyển thành chữ. Am Mây không ghi âm và không lưu lại.' }));
    function showScore(target, r) {
      const c = compare(target, r.text, lang);
      const sc = Math.round(100 * (r.conf ? 0.85 * c.sim + 0.15 * r.conf : c.sim));
      res.replaceChildren(...[
        h('div', { class: 'dict-score', text: `${sc}/100 · ${t(grade(sc))}` }),
        h('div', { class: 'said' }, c.tokens.map((tk, i) => raw('span', tk + (cjk(lang) ? '' : ' '), c.hit[i] ? 'tk good' : 'tk bad'))),
        h('div', { class: 'said' }, h('span', { text: 'Máy nghe được: ' }), raw('span', r.text || '…')),
        h('p', { class: 'chalk-sub', text: 'Chữ xanh là phần nói đúng, chữ đỏ là phần máy chưa nghe ra — nghe mẫu rồi nói lại phần đó.' })].filter(Boolean));
      board(modesOf(room.key).speak.name, [target, `${sc}/100`]);
      const best = ((store.speak ??= {})[room.key] ??= 0);
      if (sc > best) {
        store.speak[room.key] = sc;
        save(store);
      }
    }
  }

  return { openShelf, openBoard, toast };
}
