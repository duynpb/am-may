import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'thay',
  name: 'Chùa Thầy',
  plaque: 'THẦY TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa' },
  wall: '#e6d3a0',
  hill: { h: 20, color: '#7d8a62' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên hồ dưới chân núi Sài Sơn',
  hint: 'qua cầu đá giữa hồ, ghé gác chuông và các tháp nhỏ, rồi vào chánh điện',
  info: 'Chùa Thầy ở Quốc Oai, Hà Nội, nằm bên hồ dưới chân núi Sài Sơn, gắn với thiền sư Từ Đạo Hạnh. Qua cổng tam quan là hồ nước có cầu đá; bên trái có gác chuông, bên phải và phía sau là các tháp nhỏ; cuối sân là chánh điện, sau lưng là núi đá. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa Thầy bên hồ đẹp quá', 'Núi Sài Sơn xanh ghê', 'Cầu đá soi bóng nước'],
});
