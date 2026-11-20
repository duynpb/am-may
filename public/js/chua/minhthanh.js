import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'minhthanh',
  name: 'Chùa Minh Thành',
  plaque: 'MINH THÀNH TỰ',
  front: 'pond',
  slots: { L: 'statue', R: 'bell', RR: 'bodhi' },
  wall: '#efd9a0',
  ground: '#8f9a5c',
  hill: { h: 22, color: '#76904c' },
  trees: 'pine',
  loading: 'Sương sớm đang tan trên cao nguyên Pleiku',
  hint: 'qua cầu đá hồ sen, ngắm tượng Phật lớn, gác chuông và cây bồ đề, rồi vào chánh điện',
  info: 'Chùa Minh Thành ở Pleiku, Gia Lai, nằm giữa cao nguyên đất đỏ và rừng thông. Qua cổng tam quan là hồ sen có cầu đá; bên trái là tượng Phật lớn màu trắng, bên phải là gác chuông, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Cao nguyên mát quá', 'Tượng Phật trắng đẹp ghê', 'Thông reo nghe vui tai', 'Sen nở trong hồ'],
});
