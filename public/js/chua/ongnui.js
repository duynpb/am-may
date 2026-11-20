import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'ongnui',
  name: 'Chùa Ông Núi',
  plaque: 'ÔNG NÚI TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e6d3a0',
  ground: '#a89f7a',
  hill: { h: 24, color: '#7a8a62' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên núi Bình Định',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Ông Núi ở Gia Lai là ngôi chùa nằm trên sườn núi giữa rừng cây. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa nằm giữa rừng cây', 'Gió núi mát quá'],
});
