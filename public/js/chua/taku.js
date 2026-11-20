import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'taku',
  name: 'Chùa Núi Tà Cú',
  plaque: 'TÀ CÚ TỰ',
  front: 'none',
  slots: { L: 'statue', R: 'bell', RR: 'stupa' },
  wall: '#efe0b8',
  ground: '#a89f7a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 30, color: '#7a8a62' },
  trees: 'pine',
  loading: 'Mây đang trôi quanh đỉnh núi Tà Cú',
  hint: 'đi vào sân núi, ngắm tượng Phật lớn và gác chuông, rồi lên chánh điện',
  info: 'Chùa Núi Tà Cú ở Lâm Đồng (Bình Thuận cũ) nằm trên núi giữa rừng cây, nổi tiếng với tượng Phật nằm rất lớn. Sân chùa rộng và nhiều đá; bên trái là tượng Phật lớn màu trắng, bên phải là gác chuông và một tháp nhỏ; cuối sân là chánh điện, phía sau là núi. (Dựng phỏng theo không khí chùa, không phải bản sao; tượng Phật nằm thật chưa được dựng.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi Tà Cú cao quá', 'Mây bay dưới chân', 'Tượng Phật to ghê', 'Gió núi mát quá'],
});
