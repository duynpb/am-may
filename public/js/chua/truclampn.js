import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'truclampn',
  name: 'Thiền viện Trúc Lâm Phương Nam',
  plaque: 'TRÚC LÂM PHƯƠNG NAM',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi', RR: 'statue' },
  wall: '#ece0b8',
  ground: '#7fae5e',
  hill: { h: 5, color: '#6a9a50' },
  trees: 'palm',
  loading: 'Nắng sớm đang lên trên đồng bằng sông Cửu Long',
  hint: 'đi giữa hai hồ sen, ngắm bảo tháp và tượng Phật, rồi vào chánh điện thiền viện',
  info: 'Thiền viện Trúc Lâm Phương Nam ở Cần Thơ là thiền viện lớn của vùng đồng bằng sông Cửu Long. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề và tượng Phật; cuối sân là chánh điện. (Dựng phỏng theo không khí thiền viện, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Thiền viện yên tĩnh quá', 'Miền Tây nắng đẹp', 'Hai hồ sen thơm ghê', 'Tượng Phật hiền hòa'],
});
