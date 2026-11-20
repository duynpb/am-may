import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tramgian',
  name: 'Chùa Trăm Gian',
  plaque: 'TRĂM GIAN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi' },
  wall: '#e0c590',
  ground: '#88a85e',
  hill: { h: 8, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên núi Tiên Hà Nội',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Trăm Gian ở Hà Nội là ngôi chùa cổ nổi tiếng với những dãy nhà gỗ nhiều gian. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Nhiều gian nhà gỗ quá', 'Chùa gỗ đẹp ghê'],
});
