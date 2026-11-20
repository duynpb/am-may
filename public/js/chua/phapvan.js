import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'phapvan',
  name: 'Chùa Pháp Vân',
  plaque: 'PHÁP VÂN TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e8d5a0',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên thành phố Hồ Chí Minh',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Pháp Vân ở TP. Hồ Chí Minh là ngôi chùa giữa phố nhưng yên tĩnh. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Tiếng chuông êm tai', 'Giữa phố mà yên tĩnh ghê'],
});
