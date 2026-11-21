import { makeYardSite } from './yard.js';
import { statueHouse, woodStatueHall } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'giacvien',
  name: 'Chùa Giác Viên',
  plaque: 'GIÁC VIÊN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'custom' },
  wall: '#dfc48a',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên thành phố Hồ Chí Minh',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Giác Viên ở TP. Hồ Chí Minh là ngôi chùa cổ nổi tiếng với hàng trăm pho tượng gỗ thếp vàng. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có nhà tượng gỗ; chánh điện ở cuối sân, hai bên tường trong điện có kệ đầy tượng gỗ thếp vàng. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Tượng gỗ đẹp ghê', 'Chùa cổ giữa phố'],
  custom: { RL: { name: 'Nhà tượng gỗ', r: 5.3 } },
  extras: (ctx) => { statueHouse(ctx, 'RL'); woodStatueHall(ctx); },
});
