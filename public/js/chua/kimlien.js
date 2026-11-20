import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'kimlien',
  name: 'Chùa Kim Liên',
  plaque: 'KIM LIÊN TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#dfc48a',
  ground: '#88a85e',
  hill: { h: 3, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên Hồ Tây Hà Nội',
  hint: 'qua cầu đá hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Chùa Kim Liên ở Hà Nội là ngôi chùa cổ gần Hồ Tây, nổi tiếng với kiến trúc gỗ. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Gần Hồ Tây gió mát quá', 'Chùa gỗ cổ kính'],
});
