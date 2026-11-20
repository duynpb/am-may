import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'huongtich',
  name: 'Chùa Hương Tích',
  plaque: 'HƯƠNG TÍCH TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e6d3a0',
  ground: '#7fa05e',
  hill: { h: 24, color: '#6a8a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên núi Hồng Lĩnh',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Hương Tích ở Hà Tĩnh là ngôi chùa cổ dưới chân núi Hồng Lĩnh ở Can Lộc. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi Hồng Lĩnh xanh ghê', 'Chùa cổ xứ Hà Tĩnh'],
});
