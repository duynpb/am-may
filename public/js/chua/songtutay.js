import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'songtutay',
  mapId: 'songtutay',
  name: 'Chùa Song Tử Tây',
  plaque: 'CHÙA SONG TỬ TÂY',
  stoneText: 'SONG TỬ TÂY',
  lighthouse: true,
  loading: 'Đảo Song Tử Tây đang đón nắng sớm',
  hint: 'dạo bãi cát, chào cờ Tổ quốc, ngắm hải đăng và thắp nhang trong chùa',
  info: 'Chùa Song Tử Tây trên đặc khu Trường Sa, thuộc Khánh Hòa, là ngôi chùa nhỏ trên đảo xanh nhiều cây bàng vuông, phong ba: có cột cờ Tổ quốc, bia chủ quyền và ngọn hải đăng. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Song Tử Tây xanh quá', 'Hải đăng sáng quá', 'Cờ Tổ quốc bay phấp phới', 'Cây bàng vuông mát ghê'],
});
