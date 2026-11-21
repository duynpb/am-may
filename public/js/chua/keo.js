import { makeYardSite } from './yard.js';
import { woodBellTower } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'keo',
  name: 'Chùa Keo',
  plaque: 'KEO TỰ',
  front: 'pond',
  slots: { L: 'custom', R: 'bodhi', RL: 'stupa', RR: 'bell' },
  wall: '#dfc48a',
  ground: '#8aa85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng lúa Thái Bình',
  hint: 'qua cầu đá hồ sen, ngắm gác chuông nhiều tầng, rồi vào chánh điện',
  info: 'Chùa Keo ở Hưng Yên (Thái Bình cũ) là ngôi chùa cổ bằng gỗ nổi tiếng, có gác chuông gỗ nhiều tầng mái cong. Qua cổng tam quan là hồ sen có cầu đá; bên trái là gác chuông gỗ ba tầng, bên phải là cây bồ đề, góc sân có tháp nhỏ và một gác chuông để thỉnh chuông; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa gỗ cổ kính quá', 'Đồng lúa xanh mát mắt', 'Tiếng chuông êm tai'],
  custom: { L: { name: 'Gác chuông gỗ ba tầng', label: 'Gác chuông gỗ', r: 4.0 } },
  extras: (ctx) => woodBellTower(ctx, 'L'),
});
