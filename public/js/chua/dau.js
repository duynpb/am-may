import { makeYardSite } from './yard.js';
import { brickTower } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'dau',
  name: 'Chùa Dâu',
  plaque: 'DÂU TỰ',
  front: 'ponds',
  slots: { L: 'custom', R: 'bell', RL: 'bodhi' },
  wall: '#e3cf9a',
  ground: '#88a85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng quê Kinh Bắc',
  hint: 'đi giữa hai hồ sen, ngắm bảo tháp cổ và gác chuông, rồi vào chánh điện',
  info: 'Chùa Dâu ở Bắc Ninh là ngôi chùa rất cổ của xứ Kinh Bắc, có từ hơn một nghìn năm trước, nổi tiếng với tháp Hòa Phong bằng gạch. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái là tháp Hòa Phong chín tầng, bên phải là gác chuông, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa nghìn năm tuổi cổ kính', 'Xứ Kinh Bắc yên bình', 'Hai hồ sen thơm ghê'],
  custom: { L: { name: 'Tháp Hòa Phong', label: 'Tháp Hòa Phong', r: 3.6 } },
  extras: (ctx) => brickTower(ctx, 'L', { tiers: 9, base: 4.2, top: 2.4, h: 1.7 }),
});
