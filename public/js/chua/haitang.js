import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'haitang',
  name: 'Chùa Hải Tạng',
  plaque: 'HẢI TẠNG TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#efe0b8',
  ground: '#cdbb8a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 12, color: '#7a9a62' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên đảo Cù Lao Chàm',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Hải Tạng ở đảo Cù Lao Chàm, Đà Nẵng là ngôi chùa cổ trên đảo, nhìn ra biển. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Cù Lao Chàm biển xanh quá', 'Gió biển mát quá'],
});
