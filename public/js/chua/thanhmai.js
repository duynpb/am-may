import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'thanhmai',
  name: 'Chùa Thanh Mai',
  plaque: 'THANH MAI TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'stupa' },
  wall: '#e6d3a0',
  ground: '#86a05e',
  hill: { h: 24, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Sương sớm đang tan trên núi Chí Linh',
  hint: 'đi vào sân núi, ghé gác chuông và vườn tháp tổ, rồi lên chánh điện',
  info: 'Chùa Thanh Mai ở Chí Linh, Hải Phòng (Hải Dương cũ), nằm trên núi giữa rừng thông, gắn với Thiền phái Trúc Lâm và có nhiều tháp tổ. Sân chùa rộng; bên trái có gác chuông, bên phải và phía sau là những tháp nhỏ; cuối sân là chánh điện, phía sau là núi thông. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Vườn tháp tổ yên tĩnh', 'Núi thông mát quá', 'Tiếng chuông êm tai'],
});
