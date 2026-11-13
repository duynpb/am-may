import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'tslon',
  mapId: 'tslon',
  name: 'Chùa Trường Sa Lớn',
  plaque: 'CHÙA TRƯỜNG SA',
  stoneText: 'TRƯỜNG SA',
  lighthouse: true,
  loading: 'Sóng Trường Sa đang vỗ bờ san hô',
  hint: 'dạo bãi cát, chào cờ Tổ quốc, ngắm ngọn hải đăng và thắp nhang trong chùa',
  info: 'Chùa Trường Sa Lớn trên đặc khu Trường Sa, thuộc Khánh Hòa, là ngôi chùa nhỏ trên đảo san hô: bãi cát trắng, hàng cây phong ba, cột cờ Tổ quốc, bia chủ quyền và ngọn hải đăng. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Trường Sa là của Việt Nam', 'Hải đăng sáng quá', 'Cờ Tổ quốc bay phấp phới', 'Đảo xa mà ấm lòng'],
});
