import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tayyentu',
  name: 'Chùa Tây Yên Tử',
  plaque: 'TÂY YÊN TỬ TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa' },
  wall: '#e6d3a0',
  ground: '#8a9a6a',
  hill: { h: 34, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Mây đang trôi quanh đỉnh Tây Yên Tử',
  hint: 'đi vào sân núi, ghé gác chuông và các tháp nhỏ, rồi lên chánh điện',
  info: 'Chùa Tây Yên Tử ở Bắc Ninh (Bắc Giang cũ) nằm trên dãy núi cao, giữa rừng thông và mây, là một cửa ngõ của Thiền phái Trúc Lâm. Sân chùa rộng và nhiều đá; bên trái có gác chuông, bên phải và góc sân là các tháp nhỏ; cuối sân là chánh điện, phía sau là núi cao. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi cao mây phủ đẹp quá', 'Rừng thông reo vi vu', 'Gió núi mát quá'],
});
