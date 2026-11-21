import { makeYardSite } from './yard.js';
import { lotusTower } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'butthap',
  name: 'Chùa Bút Tháp',
  plaque: 'BÚT THÁP TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'custom' },
  wall: '#e0c590',
  ground: '#88a85e',
  hill: { h: 4, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên làng quê bên sông Đuống',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và các tháp đá, rồi vào chánh điện',
  info: 'Chùa Bút Tháp ở Thuận Thành, Bắc Ninh, là ngôi chùa cổ bên hồ nước, nổi tiếng với các tháp đá và tượng chạm tinh xảo. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải và góc sân là các tháp nhỏ, phía sau có tháp đá Cửu phẩm liên hoa chín tầng cánh sen; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Tháp đá cổ đẹp quá', 'Chùa bên hồ thanh tịnh', 'Tiếng chuông êm tai'],
  custom: { RR: { name: 'Tháp Cửu phẩm liên hoa', label: 'Tháp liên hoa', r: 3.6 } },
  extras: (ctx) => lotusTower(ctx, 'RR'),
});
