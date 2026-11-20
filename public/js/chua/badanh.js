import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'badanh',
  name: 'Chùa Bà Đanh',
  plaque: 'BÀ ĐANH TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'stupa' },
  wall: '#e8d5a0',
  ground: '#86a860',
  hill: { h: 16, color: '#7a8a62' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên núi đá Kim Bảng',
  hint: 'đi giữa hai hồ sen, ngắm bảo tháp và gác chuông, rồi vào chánh điện',
  info: 'Chùa Bà Đanh ở Kim Bảng, Ninh Bình (Hà Nam cũ), nằm bên núi đá và hồ nước, là ngôi chùa cổ của vùng đất này. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ Kim Bảng thanh tịnh', 'Hai hồ sen thơm ghê', 'Bảo tháp cao thiệt'],
});
