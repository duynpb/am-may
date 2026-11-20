import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'thienlam',
  name: 'Chùa Thiền Lâm',
  plaque: 'THIỀN LÂM TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3cf9a',
  ground: '#7fa05a',
  hill: { h: 20, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên kinh thành Huế',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Thiền Lâm ở Huế là ngôi chùa yên tĩnh dưới chân đồi ở ngoại ô Huế. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa nhỏ yên bình', 'Bóng bồ đề mát ghê'],
});
