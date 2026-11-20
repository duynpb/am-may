import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'hangchaudoc',
  name: 'Chùa Hang (Châu Đốc)',
  plaque: 'HANG TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e6d3a0',
  ground: '#8aa05e',
  hill: { h: 18, color: '#7a8a62' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên miền Bảy Núi An Giang',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Hang (Châu Đốc) ở An Giang là ngôi chùa cổ dưới chân núi Sam ở Châu Đốc. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi Sam xanh ghê', 'Chùa cổ miền Bảy Núi'],
});
