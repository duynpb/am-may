import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'hoison',
  name: 'Chùa Hội Sơn',
  plaque: 'HỘI SƠN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#88a85e',
  hill: { h: 6, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên thành phố Hồ Chí Minh',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Hội Sơn ở TP. Hồ Chí Minh là ngôi chùa cổ ở phía đông thành phố, nhiều cây xanh. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Cây xanh mát quá', 'Sen nở trong hồ'],
});
