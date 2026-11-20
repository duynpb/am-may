import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phominh',
  name: 'Chùa Phổ Minh',
  plaque: 'PHỔ MINH TỰ',
  front: 'ponds',
  slots: { L: 'tower', R: 'bell', RL: 'bodhi' },
  wall: '#e6d3a0',
  ground: '#88a85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên đồng bằng Nam Định',
  hint: 'đi giữa hai hồ sen, ngắm bảo tháp cao và gác chuông, rồi vào chánh điện',
  info: 'Chùa Phổ Minh ở Nam Định (nay thuộc Ninh Bình) là ngôi chùa cổ từ thời Trần, nổi bật với một bảo tháp rất cao. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái là bảo tháp, bên phải là gác chuông, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa; tháp mười bốn tầng thật chưa được dựng.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa từ thời Trần cổ kính', 'Bảo tháp vươn cao giữa trời', 'Hai hồ sen thơm ghê'],
});
