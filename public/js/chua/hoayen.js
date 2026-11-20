import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'hoayen',
  name: 'Chùa Hoa Yên',
  plaque: 'HOA YÊN TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'stupa' },
  wall: '#e6d3a0',
  ground: '#8a9a6a',
  hill: { h: 34, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên núi Yên Tử',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Hoa Yên ở Quảng Ninh là ngôi chùa lớn trên sườn núi Yên Tử, nơi Thiền phái Trúc Lâm có nhiều dấu tích. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có tháp nhỏ, phía sau có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Bậc đá lên chùa dài ghê', 'Rừng thông Yên Tử mát quá'],
});
