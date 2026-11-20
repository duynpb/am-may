import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'vanhanh',
  name: 'Thiền viện Vạn Hạnh',
  plaque: 'VẠN HẠNH THIỀN VIỆN',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'bodhi' },
  wall: '#ece0b8',
  ground: '#7fae5e',
  hill: { h: 20, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên đồi thông Đà Lạt',
  hint: 'đi giữa hai hồ sen, ghé các điểm hai bên sân, rồi vào chánh điện',
  info: 'Thiền viện Vạn Hạnh ở Lâm Đồng là ngôi thiền viện trên đồi Đà Lạt, giữa vườn hoa và rừng thông. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Thiền viện yên tĩnh quá', 'Hoa nở khắp sân'],
});
