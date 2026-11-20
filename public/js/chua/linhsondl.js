import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'linhsondl',
  name: 'Chùa Linh Sơn',
  plaque: 'LINH SƠN TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi' },
  wall: '#efe0b8',
  ground: '#7fa05a',
  hill: { h: 22, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên đồi thông Đà Lạt',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Linh Sơn ở Lâm Đồng là ngôi chùa giữa rừng thông Đà Lạt. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Đà Lạt mát quá', 'Rừng thông thơm ghê'],
});
