import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'keo',
  name: 'Chùa Keo',
  plaque: 'KEO TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#dfc48a',
  ground: '#8aa85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng lúa Thái Bình',
  hint: 'qua cầu đá hồ sen, ngắm gác chuông nhiều tầng, rồi vào chánh điện',
  info: 'Chùa Keo ở Hưng Yên (Thái Bình cũ) là ngôi chùa cổ bằng gỗ nổi tiếng, có gác chuông nhiều tầng mái cong. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa; gác chuông gỗ ba tầng thật chưa được dựng.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa gỗ cổ kính quá', 'Đồng lúa xanh mát mắt', 'Tiếng chuông êm tai'],
});
