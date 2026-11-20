import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tieuson',
  name: 'Chùa Tiêu Sơn',
  plaque: 'TIÊU SƠN TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e0c590',
  ground: '#86a05e',
  hill: { h: 16, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng quê Kinh Bắc',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Tiêu Sơn ở Bắc Ninh là ngôi chùa cổ trên núi Tiêu ở Từ Sơn. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa trên núi yên tĩnh', 'Bóng cây mát quá'],
});
