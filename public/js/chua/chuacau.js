import { makeYardSite } from './yard.js';
import { coveredBridge } from './yard-extras.js';

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
  hint: 'qua cầu có mái che, xem miếu nhỏ giữa cầu và tượng chó, khỉ đá hai đầu cầu, rồi vào chánh điện',
  info: 'Chùa Cầu ở Hội An là cây cầu có mái che nổi tiếng của phố cổ, có miếu nhỏ ở giữa cầu. Qua cổng tam quan là cầu gỗ mái ngói bắc ngang một dòng sông nhỏ, có bảng "Lai Viễn Kiều", tượng chó và khỉ đá ở hai đầu cầu và miếu nhỏ giữa cầu; trong sân bên trái có gác chuông, bên phải là cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo dáng cầu, không phải bản sao.)',
  tips: [
    ['Cầu có mái che', 'Đi thẳng từ cổng qua cầu có mái che; ghé miếu nhỏ giữa cầu và xem tượng chó, khỉ đá ở hai đầu cầu.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Phố cổ Hội An đẹp quá', 'Cầu có mái che xinh ghê'],
  bridgeName: 'Cầu có mái che',
  custom: {},
  extras: (ctx) => coveredBridge(ctx),
});
