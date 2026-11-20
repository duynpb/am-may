import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'butthap',
  name: 'Chùa Bút Tháp',
  plaque: 'BÚT THÁP TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'tower' },
  wall: '#e0c590',
  ground: '#88a85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên làng quê bên sông Đuống',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và các tháp đá, rồi vào chánh điện',
  info: 'Chùa Bút Tháp ở Thuận Thành, Bắc Ninh, là ngôi chùa cổ bên hồ nước, nổi tiếng với những tháp đá và các pho tượng chạm tinh xảo. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải và góc sân là các tháp nhỏ, phía sau có một tháp cao; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa; tòa tháp chín tầng hoa sen thật chưa được dựng.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Tháp đá cổ đẹp quá', 'Chùa bên hồ thanh tịnh', 'Tiếng chuông êm tai'],
});
