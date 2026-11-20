import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'hoangphap',
  name: 'Chùa Hoằng Pháp',
  plaque: 'HOẰNG PHÁP TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi', RR: 'statue' },
  wall: '#e8d5a0',
  ground: '#7fae5e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên thành phố Hồ Chí Minh',
  hint: 'đi giữa hai hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Hoằng Pháp ở TP. Hồ Chí Minh là ngôi chùa lớn có khuôn viên rộng ở Hóc Môn. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề, phía sau có tượng Phật lớn; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Khuôn viên rộng quá', 'Hai hồ sen thơm ghê'],
});
