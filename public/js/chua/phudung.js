import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phudung',
  name: 'Chùa Phù Dung',
  plaque: 'PHÙ DUNG TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'stupa' },
  wall: '#e6d3a0',
  ground: '#88a85e',
  hill: { h: 16, color: '#6d8a58' },
  trees: 'palm',
  loading: 'Gió biển đang thổi qua núi non Hà Tiên',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và vườn tháp, rồi vào chánh điện',
  info: 'Chùa Phù Dung ở Hà Tiên, An Giang, nằm giữa núi và biển, là ngôi chùa cổ gắn với lịch sử vùng đất này. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải và phía sau là những tháp nhỏ; cuối sân là chánh điện, phía sau là núi. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Hà Tiên gió mát quá', 'Chùa cổ bên núi biển', 'Vườn tháp yên tĩnh quá', 'Sen nở đẹp ghê'],
});
