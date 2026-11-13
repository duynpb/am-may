import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'hoangsa',
  mapId: 'hoangsa',
  name: 'Chùa Hoàng Sa',
  plaque: 'CHÙA HOÀNG SA',
  stoneText: 'HOÀNG SA',
  loading: 'Gió biển Hoàng Sa đang thổi',
  hint: 'dạo bãi cát, chào cờ Tổ quốc và thắp nhang trong ngôi chùa nhỏ giữa Biển Đông',
  info: 'Chùa Hoàng Sa trên đặc khu Hoàng Sa, thuộc TP. Đà Nẵng, là ngôi chùa nhỏ giữa Biển Đông: bãi cát trắng, hàng cây phong ba, cột cờ Tổ quốc và bia chủ quyền. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Hoàng Sa là của Việt Nam', 'Cờ Tổ quốc bay phấp phới', 'Biển xanh quá', 'Chùa nhỏ giữa Biển Đông'],
});
