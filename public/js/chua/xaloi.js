import { makeYardSite } from './yard.js';
import { tieredBellTower } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'xaloi',
  name: 'Chùa Xá Lợi',
  plaque: 'XÁ LỢI TỰ',
  front: 'none',
  slots: { L: 'custom', R: 'bell', RL: 'bodhi' },
  wall: '#e8d5a0',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên thành phố Hồ Chí Minh',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Xá Lợi ở TP. Hồ Chí Minh là ngôi chùa lớn giữa thành phố, nổi tiếng với tháp chuông nhiều tầng. Qua cổng tam quan là sân rộng; bên trái có tháp chuông bảy tầng, bên phải là gác chuông, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Giữa phố mà yên tĩnh ghê', 'Tháp chuông cao thiệt'],
  custom: { L: { name: 'Tháp chuông bảy tầng', label: 'Tháp chuông', r: 3.8 } },
  extras: (ctx) => tieredBellTower(ctx, 'L', { tiers: 7 }),
});
