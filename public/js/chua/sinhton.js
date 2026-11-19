import { makeIslandSite } from './dao.js';

export const SITE = makeIslandSite({
  id: 'sinhton',
  mapId: 'sinhton',
  name: 'Chùa Sinh Tồn',
  plaque: 'CHÙA SINH TỒN',
  stoneText: 'SINH TỒN',
  lighthouse: true,
  loading: 'Sóng Sinh Tồn đang vỗ bờ san hô',
  hint: 'dạo bãi cát, chào cờ Tổ quốc, ngắm hải đăng và thắp nhang trong chùa',
  info: 'Chùa Sinh Tồn trên đặc khu Trường Sa, thuộc Khánh Hòa, là ngôi chùa nhỏ trên đảo san hô: bãi cát trắng, hàng cây phong ba, cột cờ Tổ quốc, bia chủ quyền và ngọn hải đăng. (Dựng phỏng theo không khí, không phải bản sao.)',
  says: ['Nam mô A Di Đà Phật', 'Sinh Tồn là của Việt Nam', 'Hải đăng sáng quá', 'Đảo xa mà ấm lòng'],
});
