import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'doison',
  name: 'Chùa Đọi Sơn',
  plaque: 'ĐỌI SƠN TỰ',
  front: 'none',
  slots: { L: 'tower', R: 'bell', RL: 'stupa' },
  wall: '#e6d3a0',
  ground: '#86a05e',
  hill: { h: 18, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên núi Đọi',
  hint: 'đi vào sân núi, ngắm bảo tháp và gác chuông, rồi lên chánh điện',
  info: 'Chùa Đọi Sơn ở Duy Tiên, Ninh Bình (Hà Nam cũ), nằm trên núi Đọi giữa đồng bằng, là ngôi chùa có từ thời Lý. Sân chùa rộng; bên trái là bảo tháp nhiều tầng, bên phải là gác chuông, góc sân có tháp nhỏ; cuối sân là chánh điện, phía sau là núi. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa từ thời Lý cổ kính', 'Núi Đọi giữa đồng bằng', 'Bảo tháp cao thiệt'],
});
