import { makeYardSite } from './yard.js';
import { yenBoats, caveMouth } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'huong',
  name: 'Chùa Hương',
  plaque: 'HƯƠNG TỰ',
  front: 'river',
  riverName: 'Suối Yến',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi', RR: 'custom' },
  wall: '#e8d9b0',
  ground: '#7fa05e',
  hill: { h: 30, color: '#8a9080' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên suối Yến',
  hint: 'qua cầu đá bắc ngang suối, ngắm thuyền trên suối Yến, ghé cửa động Hương Tích rồi vào chánh điện',
  info: 'Chùa Hương ở Mỹ Đức, Hà Nội, là quần thể chùa trong núi đá bên suối Yến, nơi có lễ hội mùa xuân rất đông người. Qua cổng tam quan là cầu đá bắc ngang suối, trên suối có những chiếc thuyền chèo chở khách; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; phía sau sân, dưới núi đá, có cửa động Hương Tích; chánh điện ở cuối sân. (Dựng phỏng theo không khí chùa, không phải bản sao; hang động thật chưa được dựng.)',
  tips: [
    ['Thuyền suối Yến', 'Từ bờ suối ngắm những chiếc thuyền chèo qua lại; qua cầu đá vào sân rồi ghé cửa động Hương Tích ở phía sau bên phải.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Suối Yến trong veo ghê', 'Núi đá xanh rêu đẹp quá', 'Mùa xuân đi chùa Hương'],
  custom: { RR: { name: 'Động Hương Tích', label: 'Động Hương Tích', r: 4.8 } },
  extraPlaces: [{ id: 'thuyen', name: 'Ngắm thuyền suối Yến', x: -12, z: 31.7, ry: Math.PI }],
  extraLabels: [['thuyen', -13, 25, 'Thuyền suối Yến']],
  extraTrips: [{ x: -12, z: 31.7, spread: 3, ry: Math.PI, say: 'Thuyền trên suối Yến thơ mộng quá' }],
  extras: (ctx) => { yenBoats(ctx); caveMouth(ctx, 'RR'); },
});
