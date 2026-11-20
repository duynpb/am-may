import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'truclamyt',
  name: 'Thiền viện Trúc Lâm Yên Tử',
  plaque: 'TRÚC LÂM YÊN TỬ',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi', RR: 'statue' },
  wall: '#ece0b8',
  ground: '#7fae5e',
  hill: { h: 30, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên núi Yên Tử',
  hint: 'đi giữa hai hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Thiền viện Trúc Lâm Yên Tử ở Quảng Ninh là ngôi thiền viện theo dòng Trúc Lâm dưới chân núi Yên Tử. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề, phía sau có tượng Phật lớn; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Thiền viện yên tĩnh quá', 'Núi Yên Tử xanh ghê'],
});
