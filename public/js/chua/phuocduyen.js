import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phuocduyen',
  name: 'Chùa Phước Duyên',
  plaque: 'PHƯỚC DUYÊN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e8d5a0',
  ground: '#88a85e',
  hill: { h: 8, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên kinh thành Huế',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Phước Duyên ở Huế là ngôi chùa cổ ở ngoại ô Huế, hồ sen trước sân. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ ngoại ô Huế', 'Sen nở trong hồ'],
});
