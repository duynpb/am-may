import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'khaidoan',
  name: 'Chùa Khải Đoan',
  plaque: 'KHẢI ĐOAN TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e8cf9a',
  ground: '#86a05e',
  hill: { h: 20, color: '#5d8a44' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đất đỏ Buôn Ma Thuột',
  hint: 'đi giữa hai hồ sen, ghé gác chuông và cây bồ đề, rồi vào chánh điện',
  info: 'Chùa Khải Đoan ở Buôn Ma Thuột, Đắk Lắk, là ngôi chùa giữa vùng đất đỏ Tây Nguyên. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là cây bồ đề cổ thụ, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Tây Nguyên nắng đẹp quá', 'Cây bồ đề mát ghê', 'Hai hồ sen đẹp ghê', 'Tiếng chuông êm tai'],
});
