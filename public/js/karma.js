// Quy tắc điểm phước / nghiệp — dùng chung cho máy chủ (Node) và trình duyệt (khi ngoại tuyến).
// Mỗi việc có giới hạn số lần được tính điểm trong ngày (giờ Việt Nam) để tránh "cày" điểm.

export const RULES = {
  visit: { label: 'Vào chùa lễ Phật', phuoc: 2, cap: 1 },
  bow: { label: 'Lạy Phật', phuoc: 1, cap: 20 },
  greet: { label: 'Chắp tay chào bạn đạo', phuoc: 1, cap: 20, gap: 2e3 },
  incense: { label: 'Thắp nhang', phuoc: 3, cap: 5 },
  merit: { label: 'Góp công đức', phuoc: 10, cap: 3 },
  beads: { label: 'Lần tròn một chuỗi 108 hạt', phuoc: 5, cap: 10, gap: 40e3 },
  // 'chant' được báo mỗi phút nghe; cứ đủ 10 phút trong ngày thì cộng phước
  chant: { label: 'Nghe tụng kinh đủ 10 phút', phuoc: 2, cap: 12 },
  bell: { label: 'Thỉnh chuông, đánh trống', phuoc: 1, cap: 5 },
  noise: { label: 'Làm ồn chánh điện (thỉnh chuông dồn dập)', nghiep: 2, cap: 3 },
  steal: { label: 'Lấy dép của người khác', nghiep: 1, cap: 20 },
  // 'sweep' được báo kèm số lá vừa quét; cứ đủ 15 lá trong ngày thì cộng phước
  sweep: { label: 'Quét lá sân chùa (15 lá)', phuoc: 2, cap: 10 },
};
export const LEAVES_PER_POINT = 15;
const LEAF_DAY_CAP = 600; // tối đa 600 lá được ghi mỗi ngày

// Những việc trình duyệt được tự báo lên máy chủ (các việc khác máy chủ tự ghi nhận)
export const CLIENT_KINDS = ['beads', 'chant', 'greet', 'steal'];
const CHANT_MIN_CAP = 180; // tối đa 180 phút nghe tụng kinh được ghi mỗi ngày
const CHANT_MIN_GAP = 50e3; // mỗi lần báo cách nhau ít nhất 50 giây

const HISTORY_MAX = 60;
export const vnDate = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10);

export function newProfile(name, now = Date.now()) {
  return {
    name,
    created: now,
    phuoc: 0,
    nghiep: 0,
    visits: 0,
    stats: { bow: 0, greet: 0, incense: 0, merit: 0, beads: 0, chant: 0, bell: 0, leaves: 0 },
    history: [],
    day: { date: vnDate(now), counts: {} },
    last: {},
  };
}

// Ghi nhận một việc. Trả về mục lịch sử nếu được tính điểm, null nếu đã quá giới hạn.
export function applyEvent(p, kind, { n = 1 } = {}, now = Date.now()) {
  const rule = RULES[kind];
  if (!rule) return null;
  const today = vnDate(now);
  if (p.day?.date !== today) p.day = { date: today, counts: {} };
  if (kind === 'chant') {
    // ghi thêm 1 phút nghe; chỉ khi tròn mỗi 10 phút mới tính điểm
    const mins = p.day.counts.chantMin || 0;
    if (mins >= CHANT_MIN_CAP || now - (p.last.chantMin || 0) < CHANT_MIN_GAP) return null;
    p.day.counts.chantMin = mins + 1;
    p.last.chantMin = now;
    p.stats.chantMin = (p.stats.chantMin ?? (p.stats.chant || 0) * 10) + 1;
    if ((mins + 1) % 10 !== 0 || (p.day.counts.chant || 0) >= rule.cap) return { silent: true };
    p.day.counts.chant = (p.day.counts.chant || 0) + 1;
    const entry = { at: now, kind, label: rule.label, phuoc: rule.phuoc };
    p.phuoc += rule.phuoc;
    p.history.unshift(entry);
    if (p.history.length > HISTORY_MAX) p.history.length = HISTORY_MAX;
    return entry;
  }
  if (kind === 'sweep') {
    // ghi thêm n lá đã quét; mỗi khi tròn 15 lá trong ngày thì tính điểm
    const done = p.day.counts.leaves || 0;
    const k = Math.max(0, Math.min(n | 0, 12, LEAF_DAY_CAP - done));
    if (!k) return null;
    p.day.counts.leaves = done + k;
    p.stats.leaves = (p.stats.leaves || 0) + k;
    const crossed = Math.floor((done + k) / LEAVES_PER_POINT) > Math.floor(done / LEAVES_PER_POINT);
    if (!crossed || (p.day.counts.sweep || 0) >= rule.cap) return { silent: true };
    p.day.counts.sweep = (p.day.counts.sweep || 0) + 1;
    const entry = { at: now, kind, label: rule.label, phuoc: rule.phuoc };
    p.phuoc += rule.phuoc;
    p.history.unshift(entry);
    if (p.history.length > HISTORY_MAX) p.history.length = HISTORY_MAX;
    return entry;
  }
  const used = p.day.counts[kind] || 0;
  if (used >= rule.cap) return null;
  if (rule.gap && now - (p.last[kind] || 0) < rule.gap) return null;
  p.day.counts[kind] = used + 1;
  p.last[kind] = now;
  if (kind === 'visit') p.visits++;
  else if (kind in p.stats) p.stats[kind] += kind === 'incense' ? n : 1;
  const entry = { at: now, kind, label: kind === 'incense' ? `${rule.label} (${n} nén)` : rule.label };
  if (rule.phuoc) {
    p.phuoc += rule.phuoc;
    entry.phuoc = rule.phuoc;
  }
  if (rule.nghiep) {
    p.nghiep += rule.nghiep;
    entry.nghiep = rule.nghiep;
  }
  p.history.unshift(entry);
  if (p.history.length > HISTORY_MAX) p.history.length = HISTORY_MAX;
  return entry;
}

// Phần hồ sơ người khác được xem
export function publicProfile(p) {
  return {
    name: p.name,
    created: p.created,
    phuoc: p.phuoc,
    nghiep: p.nghiep,
    visits: p.visits,
    stats: p.stats,
    history: p.history.slice(0, 40),
  };
}
