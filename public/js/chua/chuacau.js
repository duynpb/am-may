import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'chuacau',
  name: 'Chùa Cầu',
  plaque: 'CHÙA CẦU',
  front: 'river',
  riverName: 'Dòng sông',
  slots: { L: 'bell', R: 'bodhi' },
  wall: '#e8cf9a',
  ground: '#9a9a6a',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên phố cổ Hội An',
  hint: 'qua cầu đá bắc ngang sông, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Cầu ở Hội An, Đà Nẵng là ngôi cây cầu có mái che nổi tiếng của phố cổ, có miếu nhỏ bên trong. Qua cổng tam quan là cầu đá bắc ngang một dòng sông nhỏ; bên trái có gác chuông, bên phải là cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá qua sông', 'Đi thẳng từ cổng qua cầu đá bắc ngang sông để vào sân chùa.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Phố cổ Hội An đẹp quá', 'Cầu có mái che xinh ghê'],
});
