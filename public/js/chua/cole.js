import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'cole',
  name: 'Chùa Cổ Lễ',
  plaque: 'CỔ LỄ TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'statue', RL: 'stupa' },
  wall: '#e8d5a0',
  ground: '#88a85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên đồng quê Nam Định',
  hint: 'qua cầu đá hồ sen, ngắm tượng Phật lớn và gác chuông, rồi vào chánh điện',
  info: 'Chùa Cổ Lễ ở Trực Ninh, Ninh Bình (Nam Định cũ), là ngôi chùa lớn của vùng đồng bằng, nổi tiếng với chiếc chuông đồng lớn. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là tượng Phật lớn, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chuông chùa vang xa lắm', 'Tượng Phật to ghê', 'Đồng quê yên bình quá'],
});
