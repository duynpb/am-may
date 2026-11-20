import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'longkhanh',
  name: 'Chùa Long Khánh',
  plaque: 'LONG KHÁNH TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi' },
  wall: '#e8cf9a',
  ground: '#88a85e',
  hill: { h: 6, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên phố biển Quy Nhơn',
  hint: 'đi giữa hai hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Long Khánh ở Quy Nhơn, Gia Lai là ngôi chùa cổ giữa phố biển, có bảo tháp. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Gió biển Quy Nhơn mát quá', 'Bảo tháp cao thiệt'],
});
