// Quy tắc điểm phước / nghiệp — dùng chung cho máy chủ (Node) và trình duyệt (khi ngoại tuyến).
// Mỗi việc có giới hạn số lần được tính điểm trong ngày (giờ Việt Nam) để tránh "cày" điểm.

export const RULES = {
  visit: { label: 'Vào chùa lễ Phật', phuoc: 2, cap: 1 },
  bow: { label: 'Lạy Phật', phuoc: 1, cap: 20 },
  greet: { label: 'Chắp tay chào bạn đạo', phuoc: 1, cap: 20 },
  incense: { label: 'Thắp nhang', phuoc: 3, cap: 5 },
  merit: { label: 'Góp công đức', phuoc: 10, cap: 3 },
  beads: { label: 'Lần tròn một chuỗi 108 hạt', phuoc: 5, cap: 10, gap: 40e3 },
  chant: { label: 'Nghe tụng kinh 10 phút', phuoc: 2, cap: 12, gap: 9 * 60e3 },
  bell: { label: 'Thỉnh chuông, đánh trống', phuoc: 1, cap: 5 },
  noise: { label: 'Làm ồn chánh điện (thỉnh chuông dồn dập)', nghiep: 2, cap: 3 },
};

// Những việc trình duyệt được tự báo lên máy chủ (các việc khác máy chủ tự ghi nhận)
export const CLIENT_KINDS = ['beads', 'chant'];

const HISTORY_MAX = 60;
export const vnDate = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10);

export function newProfile(name, now = Date.now()) {
  return {
    name,
    created: now,
    phuoc: 0,
    nghiep: 0,
    visits: 0,
    stats: { bow: 0, greet: 0, incense: 0, merit: 0, beads: 0, chant: 0, bell: 0 },
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
