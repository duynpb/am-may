import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'daitue',
  name: 'Chùa Đại Tuệ',
  plaque: 'ĐẠI TUỆ TỰ',
  front: 'river',
  riverName: 'Dòng sông',
  slots: { L: 'bell', R: 'tower' },
  wall: '#e3d3a4',
  hill: { h: 18, color: '#587a42' },
  trees: 'forest',
  loading: 'Sương sớm đang tan bên dòng sông xứ Nghệ',
  hint: 'qua cổng, bước trên cầu đá bắc ngang sông, ngắm bảo tháp và gác chuông rồi vào chánh điện',
  info: 'Chùa Đại Tuệ ở Nghệ An là ngôi chùa yên tĩnh của xứ Nghệ. Qua cổng tam quan là cầu đá bắc ngang một dòng sông nhỏ; trong sân bên trái có gác chuông, bên phải là bảo tháp năm tầng; cuối sân là chánh điện, phía sau là đồi xanh. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu đá qua sông', 'Đi thẳng từ cổng qua cầu đá bắc ngang sông để vào sân chùa.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Xứ Nghệ yên bình quá', 'Cầu đá qua sông đẹp ghê', 'Bảo tháp cao thiệt', 'Tiếng chuông êm tai'],
});
