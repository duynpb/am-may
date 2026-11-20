import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'caibau',
  name: 'Chùa Cái Bầu',
  plaque: 'CÁI BẦU TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'statue', RR: 'stupa' },
  wall: '#efe0b8',
  ground: '#cdbb8a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 14, color: '#7a9a62' },
  trees: 'palm',
  loading: 'Nắng gió đang thổi trên vịnh Bái Tử Long',
  hint: 'đi vào sân rộng ven vịnh, ngắm tượng Phật lớn và gác chuông, rồi lên chánh điện',
  info: 'Chùa Cái Bầu ở Vân Đồn, Quảng Ninh, nằm trên đảo Cái Bầu nhìn ra vịnh Bái Tử Long. Sân chùa rộng, nhiều gió biển; bên trái là tượng Phật lớn màu trắng, bên phải là gác chuông, góc sân có một tháp nhỏ; cuối sân là chánh điện, phía sau là đồi cây. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Vịnh Bái Tử Long đẹp quá', 'Gió biển mát quá', 'Tượng Phật to ghê'],
});
