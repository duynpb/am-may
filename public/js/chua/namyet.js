import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'namyet',
  mapId: 'namyet',
  name: 'Chùa Nam Yết',
  plaque: 'CHÙA NAM YẾT',
  stoneText: 'NAM YẾT',
  lighthouse: true,
  loading: 'Nắng sớm đang lên trên đảo Nam Yết',
  hint: 'dạo bãi cát, chào cờ Tổ quốc, ngắm hải đăng và thắp nhang trong chùa',
  info: 'Chùa Nam Yết trên đặc khu Trường Sa, thuộc Khánh Hòa, là ngôi chùa nhỏ trên đảo san hô: có cột cờ Tổ quốc, bia chủ quyền và ngọn hải đăng giữa biển khơi. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Nam Yết là của Việt Nam', 'Hải đăng sáng quá', 'Cờ Tổ quốc bay phấp phới'],
});
