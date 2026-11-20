import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tayphuong',
  name: 'Chùa Tây Phương',
  plaque: 'TÂY PHƯƠNG TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e0c590',
  ground: '#86a05e',
  hill: { h: 24, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồi Câu Lâu',
  hint: 'đi vào sân chùa, ghé gác chuông và cây bồ đề, rồi lên chánh điện',
  info: 'Chùa Tây Phương ở Thạch Thất, Hà Nội, nằm trên đồi, nổi tiếng với bộ tượng La Hán chạm gỗ. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện, phía sau là đồi xanh. (Dựng phỏng theo không khí chùa; các tượng La Hán thật chưa được dựng.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ trên đồi yên tĩnh', 'Nghe nói tượng La Hán đẹp lắm', 'Bóng bồ đề mát ghê'],
});
