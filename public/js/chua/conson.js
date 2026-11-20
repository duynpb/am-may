import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'conson',
  name: 'Chùa Côn Sơn',
  plaque: 'CÔN SƠN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'tower' },
  wall: '#e6d3a0',
  ground: '#7fa05a',
  hill: { h: 22, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Gió đang reo trong rừng thông Côn Sơn',
  hint: 'qua cầu đá hồ nước, ghé gác chuông, tháp và các tháp nhỏ dưới rừng thông, rồi vào chánh điện',
  info: 'Chùa Côn Sơn ở Hải Phòng (Hải Dương cũ) nằm giữa rừng thông và đá, gắn với danh nhân Nguyễn Trãi. Qua cổng tam quan là hồ nước có cầu đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có bảo tháp; cuối sân là chánh điện, phía sau là núi thông. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Rừng thông Côn Sơn reo vui', 'Nhớ thơ Nguyễn Trãi', 'Chùa cổ giữa rừng thông'],
});
