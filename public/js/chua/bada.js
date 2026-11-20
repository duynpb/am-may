import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'bada',
  name: 'Chùa Bà Đá',
  plaque: 'BÀ ĐÁ TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e0c590',
  ground: '#8aa05e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên phố phường Hà Nội',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Bà Đá ở Hà Nội là ngôi chùa cổ giữa phố cổ, gắn với một truyền thuyết về tảng đá. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa nhỏ giữa phố cổ', 'Nghe nói có truyền thuyết tảng đá'],
});
