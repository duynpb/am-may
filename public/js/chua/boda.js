import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'boda',
  name: 'Chùa Bổ Đà',
  plaque: 'BỔ ĐÀ TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'tower', RL: 'stupa' },
  wall: '#e6d3a0',
  ground: '#86a05e',
  hill: { h: 18, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên đồng quê Kinh Bắc',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Bổ Đà ở Bắc Ninh là ngôi chùa cổ trên núi Bổ Đà, nơi lưu giữ mộc bản kinh Phật. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là bảo tháp, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Mộc bản kinh quý lắm', 'Núi Bổ Đà xanh ghê'],
});
