import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'buuphong',
  name: 'Chùa Bửu Phong',
  plaque: 'BỬU PHONG TỰ',
  front: 'pond',
  slots: { L: 'tower', R: 'bell', RL: 'stupa' },
  wall: '#ecd9a2',
  hill: { h: 22, color: '#5f8a48' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên đồi Biên Hòa',
  hint: 'qua cầu đá hồ sen, ngắm bảo tháp và gác chuông, rồi lên chánh điện dưới chân đồi',
  info: 'Chùa Bửu Phong ở Đồng Nai nằm dưới chân đồi cây xanh, là nơi tu tập yên tĩnh gần Biên Hòa. Qua cổng tam quan là hồ sen có cầu đá; bên trái có bảo tháp, bên phải là gác chuông, góc sân có tháp nhỏ; cuối sân là chánh điện, phía sau là đồi xanh. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Đồi xanh mát quá', 'Bảo tháp cao thiệt', 'Hồ sen đẹp ghê', 'Tiếng chuông êm tai'],
});
