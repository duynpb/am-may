import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'linhunbana',
  name: 'Chùa Linh Ứng Bà Nà',
  plaque: 'LINH ỨNG BÀ NÀ TỰ',
  front: 'none',
  slots: { L: 'statue', R: 'bell', RL: 'stupa' },
  wall: '#efe0b8',
  ground: '#8a9a6a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 34, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên núi Bà Nà',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Linh Ứng Bà Nà ở Đà Nẵng là ngôi chùa trên núi Bà Nà, giữa mây và rừng. Qua cổng tam quan là sân rộng; bên trái có tượng Phật lớn, bên phải là gác chuông, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Mây bay dưới chân', 'Bà Nà mát quá'],
});
