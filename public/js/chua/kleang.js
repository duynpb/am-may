import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'kleang',
  name: 'Chùa Kh\'Leang',
  plaque: 'CHÙA KH\'LEANG',
  front: 'none',
  slots: { L: 'bell', R: 'tower', RL: 'stupa', RR: 'stupa' },
  wall: '#e8b04a',
  ground: '#8fae5a',
  sky: ['#6fb4e6', '#f6ecd0'],
  hill: { h: 4, color: '#7fa05a' },
  trees: 'palm',
  loading: 'Nắng vàng đang chiếu trên mái chùa Khmer',
  hint: 'vào sân rộng, ngắm tháp và gác chuông màu vàng, đi dưới hàng dừa rồi lên chánh điện',
  info: 'Chùa Kh\'Leang ở Sóc Trăng (nay thuộc Cần Thơ) là một ngôi chùa Khmer cổ, nổi bật với màu vàng rực và những mái nhọn nhiều tầng. Qua cổng vào sân rộng; hai bên có gác chuông, bảo tháp và các tháp nhỏ dưới bóng dừa; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Mái vàng rực rỡ quá', 'Chùa Khmer đẹp ghê', 'Dừa nghiêng bóng nắng', 'Tháp nhỏ xinh xắn'],
});
