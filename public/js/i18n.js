// Đa ngôn ngữ: Tiếng Việt (gốc), English, 中文, Deutsch.
// Cách làm: chữ trong trang vẫn viết bằng tiếng Việt; bộ dịch tự thay mọi chữ hiện lên màn hình
// (chữ trong HTML, nút, thông báo, nhãn tên, bản đồ…) bằng bản dịch trong i18n-data.js.
// Câu có số / tên thay đổi được khớp theo mẫu {0}, {1}… Chữ khắc trong cảnh 3D (hoành phi, câu đối) giữ tiếng Việt.
import DICT from './i18n-data.js';

export const LANGS = { vi: 'Tiếng Việt', en: 'English', zh: '中文', de: 'Deutsch' };
const COL = { en: 0, zh: 1, de: 2 };
const KEY = 'ammay-lang';

// chọn ngôn ngữ: ?lang= trên đường dẫn > đã chọn trước đó > trình duyệt (chỉ khi trình duyệt không có tiếng Việt)
function pickLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS[q]) {
      localStorage.setItem(KEY, q);
      return q;
    }
    const saved = localStorage.getItem(KEY);
    if (saved && LANGS[saved]) return saved;
  } catch { /* trình duyệt chặn bộ nhớ: dùng mặc định */ }
  const navs = (navigator.languages || [navigator.language || 'vi']).map((l) => l.toLowerCase());
  if (navs.some((l) => l.startsWith('vi'))) return 'vi';
  const first = navs[0] || 'vi';
  if (first.startsWith('zh')) return 'zh';
  if (first.startsWith('de')) return 'de';
  if (first.startsWith('en')) return 'en';
  return 'en';
}
export const lang = pickLang();
export function setLang(l) {
  try {
    localStorage.setItem(KEY, l);
  } catch { /* bỏ qua */ }
  // bỏ ?lang= cũ trên đường dẫn (nếu có) để lựa chọn mới có hiệu lực
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  location.replace(u.toString());
}

const col = COL[lang];
const exact = new Map();
const patterns = [];
if (col != null) {
  for (const [vi, tr] of Object.entries(DICT)) {
    const out = tr[col];
    if (!out) continue;
    if (/\{\d\}/.test(vi)) {
      // mẫu: phần chữ khớp nguyên văn, {n} khớp một đoạn bất kỳ
      const src = vi.split(/(\{\d\})/).map((p) => (/^\{\d\}$/.test(p) ? '(.*?)' : p.replace(/[.*+?^$()|[\]\\]/g, '\\$&'))).join('');
      const order = [...vi.matchAll(/\{(\d)\}/g)].map((m) => +m[1]);
      patterns.push({ re: new RegExp('^' + src + '$', 's'), order, out, len: vi.length });
    } else exact.set(vi, out);
  }
  patterns.sort((a, b) => b.len - a.len); // mẫu dài (cụ thể hơn) thử trước
}

// dịch một câu; trả về nguyên văn nếu không có bản dịch
export function t(s, depth = 0) {
  if (col == null || !s) return s;
  const hit = exact.get(s);
  if (hit != null) return hit;
  if (depth > 2) return s;
  for (const p of patterns) {
    const m = p.re.exec(s);
    if (!m) continue;
    const vals = {};
    // phần thay đổi cũng được dịch nếu có (giữ nguyên khoảng trắng hai đầu)
    p.order.forEach((n, i) => {
      const raw = m[i + 1] ?? '', core = raw.trim();
      vals[n] = core ? raw.replace(core, () => t(core, depth + 1)) : raw;
    });
    return p.out.replace(/\{(\d)\}/g, (_, n) => vals[n] ?? '');
  }
  return s;
}

// ---------- Chữ trên bảng hiệu trong cảnh 3D (hoành phi, câu đối, bảng tên) ----------
// khóa = các dòng tiếng Việt nối bằng '|'; giá trị = [en, zh, de], mỗi bản là mảng các dòng
// Tên riêng (AM MÂY, TAM CHÚC) giữ nguyên.
const BOARDS = {
  'ĐẠI HÙNG BẢO ĐIỆN': [['MAIN BUDDHA HALL'], ['大雄宝殿'], ['HAUPTHALLE']],
  'PHẬT TẠI TÂM': [['BUDDHA IS IN THE HEART'], ['佛在心中'], ['BUDDHA IST IM HERZEN']],
  // câu đối dọc: chữ Hán mỗi chữ một dòng; chữ La-tinh một dòng, tự xoay chạy dọc
  'Từ|Bi|Hỷ|Xả': [['Love · Compassion · Joy · Peace'], ['慈', '悲', '喜', '舍'], ['Güte · Mitgefühl · Freude · Ruhe']],
  'Vô|Ngã|Vị|Tha': [['Selfless · Living for Others'], ['无', '我', '利', '他'], ['Selbstlos · Leben für Andere']],
  'CÔNG ĐỨC': [['OFFERING'], ['功德'], ['SPENDE']],
  'VƯỜN KINH': [['SUTRA GARDEN'], ['经园'], ['SUTRA-GARTEN']],
  'QUAN ÂM ĐIỆN': [['GUANYIN HALL'], ['观音殿'], ['GUANYIN-HALLE']],
  'PHÁP CHỦ ĐIỆN': [['DHARMA LORD HALL'], ['法主殿'], ['DHARMA-HERR-HALLE']],
  'TAM THẾ ĐIỆN': [['THREE AGES HALL'], ['三世殿'], ['HALLE DER DREI ZEITALTER']],
  'HÀNH LANG LA HÁN': [['ARHAT CORRIDOR'], ['罗汉长廊'], ['ARHAT-GALERIE']],
  'GÁC CHUÔNG': [['BELL TOWER'], ['钟楼'], ['GLOCKENTURM']],
  'ĐÀI THIỀN': [['MEDITATION TERRACE'], ['禅台'], ['MEDITATIONSTERRASSE']],
  'TĨNH|TÂM': [['INNER', 'PEACE'], ['静', '心'], ['INNERE', 'RUHE']],
  'NHÀ TỰ HỌC': [['STUDY HALL'], ['自习堂'], ['LERNHALLE']],
  'VƯỜN RAU': [['VEGETABLES'], ['菜园'], ['GEMÜSE']],
  'VƯỜN QUẢ': [['ORCHARD'], ['果园'], ['OBSTGARTEN']],
  'LÀNG MÂY': [['CLOUD VILLAGE'], ['云村'], ['WOLKENDORF']],
  'TIẾNG ANH': [['ENGLISH'], ['英语'], ['ENGLISCH']],
  'TIẾNG TRUNG': [['CHINESE'], ['中文'], ['CHINESISCH']],
  'TIẾNG ĐỨC': [['GERMAN'], ['德语'], ['DEUTSCH']],
  'TIẾNG HÀN': [['KOREAN'], ['韩语'], ['KOREANISCH']],
  'PHẬT HỌC': [['BUDDHIST STUDIES'], ['佛学'], ['BUDDHISMUS']],
  // các chùa miền Nam
  'VĨNH NGHIÊM TỰ': [['VĨNH NGHIÊM PAGODA'], ['永严寺'], ['VĨNH-NGHIÊM-PAGODE']],
  'TỔ ĐƯỜNG': [['PATRIARCHS’ HALL'], ['祖堂'], ['HALLE DER PATRIARCHEN']],
  'BẢO THÁP QUAN ÂM': [['GUANYIN TOWER'], ['观音宝塔'], ['GUANYIN-TURM']],
  'CHUÔNG': [['BELL'], ['钟'], ['GLOCKE']],
  'CHÙA DƠI': [['BAT PAGODA'], ['蝙蝠寺'], ['FLEDERMAUS-PAGODE']],
  'CHÁNH ĐIỆN': [['MAIN HALL'], ['大殿'], ['HAUPTHALLE']],
  'NÚI BÀ ĐEN': [['BÀ ĐEN MOUNTAIN'], ['黑婆山'], ['BÀ-ĐEN-BERG']],
  'LINH SƠN TIÊN THẠCH TỰ': [['LINH SƠN TIÊN THẠCH TEMPLE'], ['灵山仙石寺'], ['LINH-SƠN-TIÊN-THẠCH-TEMPEL']],
  'CÁP TREO': [['CABLE CAR'], ['缆车'], ['SEILBAHN']],
  'TƯỢNG PHẬT BÀ TÂY BỔ ĐÀ SƠN': [['GUANYIN OF TÂY BỔ ĐÀ SƠN'], ['西补陀山观音像'], ['GUANYIN VON TÂY BỔ ĐÀ SƠN']],
  'THÍCH CA PHẬT ĐÀI': [['SHAKYAMUNI BUDDHA TERRACE'], ['释迦佛台'], ['SHAKYAMUNI-BUDDHA-TERRASSE']],
  'VƯỜN LỘC UYỂN': [['DEER PARK'], ['鹿野苑'], ['HIRSCHPARK']],
  'BẢO THÁP XÁ LỢI': [['RELIC STUPA'], ['舍利宝塔'], ['RELIQUIEN-STUPA']],
  // các chùa miền Trung
  'THIÊN MỤ TỰ': [['THIÊN MỤ PAGODA'], ['天姥寺'], ['THIÊN-MỤ-PAGODE']],
  'PHƯỚC DUYÊN BẢO THÁP': [['PHƯỚC DUYÊN TOWER'], ['福缘宝塔'], ['PHƯỚC-DUYÊN-TURM']],
  'ĐÌNH BIA': [['STELE PAVILION'], ['碑亭'], ['STELENPAVILLON']],
  'LINH ỨNG TỰ': [['LINH ỨNG PAGODA'], ['灵应寺'], ['LINH-ỨNG-PAGODE']],
  'QUÁN THẾ ÂM BỒ TÁT': [['GUANYIN BODHISATTVA'], ['观世音菩萨'], ['GUANYIN BODHISATTVA']],
  'VƯỜN LA HÁN': [['ARHAT GARDEN'], ['罗汉园'], ['ARHAT-GARTEN']],
  'LONG SƠN TỰ': [['LONG SƠN PAGODA'], ['龙山寺'], ['LONG-SƠN-PAGODE']],
  'PHẬT NHẬP NIẾT BÀN': [['BUDDHA ENTERING NIRVANA'], ['佛入涅槃'], ['BUDDHA GEHT INS NIRWANA EIN']],
  'KIM THÂN PHẬT TỔ': [['GOLDEN-BODY BUDDHA'], ['金身佛祖'], ['GOLDENER BUDDHA']],
  'TRÚC LÂM THIỀN VIỆN': [['TRÚC LÂM ZEN MONASTERY'], ['竹林禅院'], ['TRÚC-LÂM-ZEN-KLOSTER']],
  'NỘI VIỆN': [['INNER COURT'], ['内院'], ['INNERER HOF']],
  'ĐỒI ROBIN': [['ROBIN HILL'], ['罗宾山'], ['ROBIN-HÜGEL']],
  // các chùa miền Nam — đợt hai
  'BỬU LONG TỰ': [['BỬU LONG PAGODA'], ['宝龙寺'], ['BỬU-LONG-PAGODE']],
  'BẢO THÁP GOTAMA': [['GOTAMA STUPA'], ['乔达摩宝塔'], ['GOTAMA-STUPA']],
  'VĨNH TRÀNG TỰ': [['VĨNH TRÀNG PAGODA'], ['永长寺'], ['VĨNH-TRÀNG-PAGODE']],
  'PHẬT DI LẶC': [['MAITREYA BUDDHA'], ['弥勒佛'], ['MAITREYA-BUDDHA']],
  'PHẬT THÍCH CA': [['SHAKYAMUNI BUDDHA'], ['释迦牟尼佛'], ['SHAKYAMUNI-BUDDHA']],
  'TRÚC LÂM HỘ QUỐC': [['TRÚC LÂM HỘ QUỐC'], ['竹林护国'], ['TRÚC LÂM HỘ QUỐC']],
  'TÂY AN CỔ TỰ': [['TÂY AN ANCIENT PAGODA'], ['西安古寺'], ['ALTE TÂY-AN-PAGODE']],
  // các chùa miền Nam — đợt ba
  'GIÁC LÂM TỰ': [['GIÁC LÂM PAGODA'], ['觉林寺'], ['GIÁC-LÂM-PAGODE']],
  'BẢO THÁP PHẬT': [['BUDDHA STUPA'], ['佛塔'], ['BUDDHA-STUPA']],
  'NGỌC HOÀNG TỰ': [['JADE EMPEROR PAGODA'], ['玉皇寺'], ['JADEKAISER-PAGODE']],
  'NGỌC HOÀNG ĐIỆN': [['JADE EMPEROR HALL'], ['玉皇殿'], ['JADEKAISER-HALLE']],
  'HỒ RÙA': [['TURTLE POND'], ['乌龟池'], ['SCHILDKRÖTENTEICH']],
  'VIỆT NAM QUỐC TỰ': [['VIETNAM QUỐC TỰ PAGODA'], ['越南国寺'], ['VIETNAM-QUỐC-TỰ-PAGODE']],
  'QUAN ÂM BỒ TÁT': [['GUANYIN BODHISATTVA'], ['观音菩萨'], ['GUANYIN BODHISATTVA']],
  'CHÙA ÂNG': [['ÂNG PAGODA'], ['翁寺'], ['ÂNG-PAGODE']],
  // các chùa Hà Nội
  'THÁNH CHÚA TỰ': [['THÁNH CHÚA PAGODA'], ['圣主寺'], ['THÁNH-CHÚA-PAGODE']],
  'TAM BẢO': [['THREE JEWELS HALL'], ['三宝殿'], ['HALLE DER DREI JUWELEN']],
  'ĐIỆN MẪU': [['MOTHER GODDESS HALL'], ['母殿'], ['HALLE DER MUTTERGÖTTIN']],
  'CÂY DUYÊN': [['WISHING TREE'], ['姻缘树'], ['WUNSCHBAUM']],
  'LIÊN HOA ĐÀI': [['LOTUS PLATFORM'], ['莲花台'], ['LOTUSPODEST']],
  'DIÊN HỰU TỰ': [['DIÊN HỰU PAGODA'], ['延祐寺'], ['DIÊN-HỰU-PAGODE']],
  'CÂY BỒ ĐỀ': [['BODHI TREE'], ['菩提树'], ['BODHIBAUM']],
  'TRẤN QUỐC TỰ': [['TRẤN QUỐC PAGODA'], ['镇国寺'], ['TRẤN-QUỐC-PAGODE']],
  'QUÁN SỨ TỰ': [['QUÁN SỨ PAGODA'], ['馆使寺'], ['QUÁN-SỨ-PAGODE']],
  // các chùa miền Bắc
  'BÁI ĐÍNH TỰ': [['BÁI ĐÍNH PAGODA'], ['拜顶寺'], ['BÁI-ĐÍNH-PAGODE']],
  'ĐIỆN QUAN ÂM': [['GUANYIN HALL'], ['观音殿'], ['GUANYIN-HALLE']],
  'ĐIỆN PHÁP CHỦ': [['DHARMA LORD HALL'], ['法主殿'], ['DHARMA-HERR-HALLE']],
  'ĐIỆN TAM THẾ': [['THREE AGES HALL'], ['三世殿'], ['HALLE DER DREI ZEITALTER']],
  'ĐẠI HỒNG CHUNG': [['GREAT BELL'], ['大洪钟'], ['GROSSE GLOCKE']],
  'GIẾNG NGỌC': [['JADE WELL'], ['玉井'], ['JADEBRUNNEN']],
  'BẢO THÁP': [['STUPA'], ['宝塔'], ['STUPA']],
  'TRÚC LÂM YÊN TỬ': [['TRÚC LÂM YÊN TỬ'], ['竹林安子'], ['TRÚC LÂM YÊN TỬ']],
  'CHÙA GIẢI OAN': [['GIẢI OAN PAGODA'], ['解冤寺'], ['GIẢI-OAN-PAGODE']],
  'CHÙA ĐỒNG': [['BRONZE PAGODA'], ['铜寺'], ['BRONZEPAGODE']],
  'CHÙA BA VÀNG': [['BA VÀNG PAGODA'], ['三金寺'], ['BA-VÀNG-PAGODE']],
  'THIỀN VIỆN TÂY THIÊN': [['TÂY THIÊN ZEN MONASTERY'], ['西天禅院'], ['TÂY-THIÊN-ZEN-KLOSTER']],
  'ĐỀN THƯỢNG': [['UPPER TEMPLE'], ['上祠'], ['OBERER TEMPEL']],
  'THÁC BẠC': [['SILVER WATERFALL'], ['银瀑'], ['SILBERWASSERFALL']],
};
export function tBoard(lines) {
  if (col == null) return lines;
  return BOARDS[lines.join('|')]?.[col] ?? lines;
}

// ---------- Tự dịch chữ hiện lên trang ----------
const done = new WeakMap(); // nút chữ → chữ đã dịch gần nhất (để không dịch lặp)
// chữ nằm trong phần có data-no-i18n (nội dung bài học ngoại ngữ…) giữ nguyên
const skip = (el) => !!el?.closest?.('[data-no-i18n]');
function fixText(node) {
  if (skip(node.parentElement)) return;
  const v = node.nodeValue;
  if (!v || done.get(node) === v) return;
  const core = v.trim();
  if (!core) return;
  const out = t(core);
  if (out !== core) {
    const nv = v.replace(core, () => out);
    done.set(node, nv);
    node.nodeValue = nv;
  } else done.set(node, v);
}
const ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
function fixAttrs(el) {
  if (skip(el)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute?.(a);
    if (!v) continue;
    const out = t(v.trim());
    if (out !== v.trim()) el.setAttribute(a, out);
  }
}
function walk(root) {
  if (root.nodeType === 3) return fixText(root);
  if (root.nodeType !== 1) return;
  if (root.tagName === 'SCRIPT' || root.tagName === 'STYLE') return;
  fixAttrs(root);
  const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = it.nextNode(); n; n = it.nextNode()) {
    if (n.nodeType === 3) fixText(n);
    else fixAttrs(n);
  }
}
if (col != null) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.title = t(document.title);
  const start = () => {
    walk(document.body);
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixAttrs(m.target);
        else for (const n of m.addedNodes) walk(n);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    // tiêu đề tab đổi theo (vd. khi đổi phòng)
    const title = document.querySelector('title');
    if (title) new MutationObserver(() => {
      const out = t(document.title);
      if (out !== document.title) document.title = out;
    }).observe(title, { childList: true, characterData: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
}
