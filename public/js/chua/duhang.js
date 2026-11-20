import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'duhang',
  name: 'Chùa Dư Hàng',
  plaque: 'DƯ HÀNG TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên thành phố cảng Hải Phòng',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và cây bồ đề, rồi vào chánh điện',
  info: 'Chùa Dư Hàng ở Hải Phòng là ngôi chùa cổ giữa phố cảng, nổi tiếng với những pho tượng quý. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ giữa phố cảng', 'Giữa phố mà yên tĩnh ghê', 'Sen nở trong hồ'],
});
