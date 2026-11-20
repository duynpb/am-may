import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phuluu',
  name: 'Chùa Phù Lưu',
  plaque: 'PHÙ LƯU TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng quê Kinh Bắc',
  hint: 'đi giữa hai hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Phù Lưu ở Bắc Ninh là ngôi chùa làng cổ ở Từ Sơn, hai hồ sen trước sân. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa làng bình yên', 'Hai hồ sen thơm ghê'],
});
