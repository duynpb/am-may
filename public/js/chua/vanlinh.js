import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'vanlinh',
  name: 'Chùa Vạn Linh',
  plaque: 'VẠN LINH TỰ',
  front: 'none',
  slots: { L: 'statue', R: 'bell', RL: 'stupa' },
  wall: '#efe0b8',
  ground: '#7fa05a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 28, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên miền Bảy Núi An Giang',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Vạn Linh ở An Giang là ngôi chùa trên núi Cấm, nhìn xuống đồng bằng. Qua cổng tam quan là sân rộng; bên trái có tượng Phật lớn, bên phải là gác chuông, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi Cấm nhìn xuống đồng bằng', 'Gió núi mát quá'],
});
