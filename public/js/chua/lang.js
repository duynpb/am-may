import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'lang',
  name: 'Chùa Láng',
  plaque: 'LÁNG TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên phố phường Hà Nội',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Láng ở Hà Nội là ngôi chùa cổ thờ thiền sư Từ Đạo Hạnh. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa Láng cổ kính quá', 'Giữa phố mà yên tĩnh ghê'],
});
