import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phuoclam',
  name: 'Chùa Phước Lâm',
  plaque: 'PHƯỚC LÂM TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e8cf9a',
  ground: '#86a860',
  hill: { h: 5, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên phố cổ Hội An',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Phước Lâm ở Hội An, Đà Nẵng là ngôi chùa cổ yên tĩnh gần phố cổ. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ Hội An', 'Dừa nghiêng bóng nắng'],
});
