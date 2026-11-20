import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'huong',
  name: 'Chùa Hương',
  plaque: 'HƯƠNG TỰ',
  front: 'river',
  riverName: 'Suối Yến',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e8d9b0',
  ground: '#7fa05e',
  hill: { h: 30, color: '#8a9080' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên suối Yến',
  hint: 'qua cầu đá bắc ngang suối, ghé gác chuông và cây bồ đề, rồi vào chánh điện',
  info: 'Chùa Hương ở Mỹ Đức, Hà Nội, là quần thể chùa trong núi đá bên suối Yến, nơi có lễ hội mùa xuân rất đông người. Qua cổng tam quan là cầu đá bắc ngang suối; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện, phía sau là núi đá. (Dựng phỏng theo không khí chùa; chuyến đò và hang động thật chưa được dựng.)',
  tips: [
    ['Cầu đá qua sông', 'Đi thẳng từ cổng qua cầu đá bắc ngang sông để vào sân chùa.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Suối Yến trong veo ghê', 'Núi đá xanh rêu đẹp quá', 'Mùa xuân đi chùa Hương'],
});
