import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'sonca',
  mapId: 'sonca',
  name: 'Chùa Sơn Ca',
  plaque: 'CHÙA SƠN CA',
  stoneText: 'SƠN CA',
  loading: 'Gió Biển Đông đang thổi trên đảo Sơn Ca',
  hint: 'dạo bãi cát, chào cờ Tổ quốc và thắp nhang trong ngôi chùa nhỏ giữa đảo',
  info: 'Chùa Sơn Ca trên đặc khu Trường Sa, thuộc Khánh Hòa, là ngôi chùa nhỏ trên đảo san hô giữa Biển Đông: bãi cát trắng, hàng cây phong ba, cột cờ Tổ quốc và bia chủ quyền. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Sơn Ca là của Việt Nam', 'Cờ Tổ quốc bay phấp phới', 'Biển xanh ngắt'],
});
