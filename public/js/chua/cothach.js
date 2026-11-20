import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'cothach',
  name: 'Chùa Cổ Thạch',
  plaque: 'CỔ THẠCH TỰ',
  front: 'none',
  slots: { L: 'statue', R: 'bell', RR: 'stupa' },
  wall: '#efe0b8',
  ground: '#cdbb8a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 26, color: '#9a8f72' },
  trees: 'palm',
  loading: 'Nắng gió đang thổi trên bãi đá ven biển',
  hint: 'đi vào sân rộng ven biển, ngắm tượng Phật lớn, gác chuông rồi lên chánh điện',
  info: 'Chùa Cổ Thạch ở ven biển Bình Thuận (nay thuộc Lâm Đồng) nằm giữa bãi đá và những hàng dừa. Sân chùa rộng, bên trái là tượng Phật lớn màu trắng, bên phải là gác chuông và một tháp nhỏ; cuối sân là chánh điện, phía sau là đồi đá. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Biển Cổ Thạch đẹp quá', 'Tượng Phật to ghê', 'Gió biển mát quá', 'Tiếng chuông vang xa'],
});
