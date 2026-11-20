import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'mia',
  name: 'Chùa Mía',
  plaque: 'MÍA TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#8aa85e',
  hill: { h: 6, color: '#7a9a58' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên làng cổ Đường Lâm',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và vườn tháp, rồi vào chánh điện',
  info: 'Chùa Mía ở Sơn Tây, Hà Nội, là ngôi chùa làng cổ nổi tiếng với nhiều pho tượng thờ. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa làng yên bình quá', 'Làng cổ Đường Lâm thân thương', 'Sen nở trong hồ'],
});
