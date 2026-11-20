import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'baoquoc',
  name: 'Chùa Báo Quốc',
  plaque: 'BÁO QUỐC TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e8d5a0',
  ground: '#88a85e',
  hill: { h: 14, color: '#6a8a4c' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên kinh thành Huế',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Báo Quốc ở Huế là ngôi chùa cổ trên đồi Hàm Long. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ trên đồi Hàm Long', 'Huế mưa nắng thất thường'],
});
