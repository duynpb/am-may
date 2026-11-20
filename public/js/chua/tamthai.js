import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tamthai',
  name: 'Chùa Tam Thai',
  plaque: 'TAM THAI TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e0c590',
  ground: '#a89f7a',
  hill: { h: 28, color: '#8a8f78' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên Ngũ Hành Sơn',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Tam Thai ở Đà Nẵng là ngôi chùa trên núi Thủy Sơn thuộc Ngũ Hành Sơn. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Ngũ Hành Sơn hùng vĩ', 'Bậc đá lên chùa cao quá'],
});
