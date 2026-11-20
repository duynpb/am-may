import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phattich',
  name: 'Chùa Phật Tích',
  plaque: 'PHẬT TÍCH TỰ',
  front: 'none',
  slots: { L: 'stupa', R: 'bell', RL: 'bodhi' },
  wall: '#e0c590',
  ground: '#86a05e',
  hill: { h: 20, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên núi Lạn Kha',
  hint: 'đi vào sân núi, ghé gác chuông và cây bồ đề, rồi lên chánh điện',
  info: 'Chùa Phật Tích ở Bắc Ninh nằm trên núi Lạn Kha, nổi tiếng với pho tượng Phật bằng đá từ thời Lý. Sân chùa rộng; bên trái có tháp nhỏ, bên phải là gác chuông, góc sân có cây bồ đề; cuối sân là chánh điện, phía sau là núi xanh. (Dựng phỏng theo không khí chùa; tượng Phật đá thật chưa được dựng.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa trên núi yên tĩnh', 'Tượng đá cổ nghìn năm', 'Bóng bồ đề mát ghê'],
});
