import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'chucthanh',
  name: 'Chùa Chúc Thánh',
  plaque: 'CHÚC THÁNH TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa', RR: 'stupa' },
  wall: '#e6c971',
  hill: { h: 12, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên phố cổ Hội An',
  hint: 'qua cổng, bước trên cầu đá qua hồ sen, ghé gác chuông và vườn tháp, rồi vào chánh điện',
  info: 'Chùa Chúc Thánh ở Hội An, Đà Nẵng, là ngôi chùa cổ gần phố cổ. Qua cổng tam quan là hồ sen có cầu đá bắc qua; bên trái có gác chuông, bên phải và phía sau là những tháp nhỏ của các vị tổ sư; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ Hội An thanh tịnh', 'Vườn tháp yên tĩnh quá', 'Sen nở đẹp ghê', 'Tiếng chuông nghe êm tai'],
});
