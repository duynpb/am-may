import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'nuimot',
  mapId: 'nuimot',
  name: 'Chùa Núi Một',
  plaque: 'CHÙA NÚI MỘT',
  stoneText: 'CÔN ĐẢO',
  mount: true,
  loading: 'Sóng Côn Đảo đang vỗ bờ',
  hint: 'dạo bãi cát dưới chân núi, chào cờ Tổ quốc và thắp nhang trong chùa',
  info: 'Chùa Núi Một ở đặc khu Côn Đảo, TP. Hồ Chí Minh, là ngôi chùa nhỏ dưới chân núi xanh nhìn ra biển: bãi cát trắng, hàng cây phong ba, cột cờ Tổ quốc và bia lưu niệm. Côn Đảo là nơi linh thiêng, gắn với những người đã hy sinh. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Côn Đảo linh thiêng quá', 'Núi xanh biển biếc', 'Cờ Tổ quốc bay phấp phới', 'Tưởng nhớ các anh hùng'],
});
