import { makeYardSite } from './yard.js';
import { bigBuddha, goldenBridge } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'linhunbana',
  name: 'Chùa Linh Ứng Bà Nà',
  plaque: 'LINH ỨNG BÀ NÀ TỰ',
  front: 'none',
  slots: { L: 'custom', R: 'bell', RL: 'stupa' },
  wall: '#efe0b8',
  ground: '#8a9a6a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 34, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên núi Bà Nà',
  hint: 'đi vào sân rộng, ghé các điểm hai bên sân, rồi lên chánh điện',
  info: 'Chùa Linh Ứng Bà Nà ở Đà Nẵng nằm trên núi Bà Nà giữa mây và rừng, nổi tiếng với tượng Phật Thích Ca lớn màu trắng trên đài sen cao. Qua cổng tam quan là sân rộng; bên trái là tượng Phật lớn, bên phải là gác chuông, góc sân có tháp nhỏ; cuối sân là chánh điện. Ngoài tường phía phải, trên sườn núi, có thể ngắm Cầu Vàng nằm trên hai bàn tay đá khổng lồ. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Mây bay dưới chân', 'Bà Nà mát quá'],
  custom: { L: { name: 'Tượng Phật Thích Ca lớn', label: 'Tượng Phật lớn', r: 5.3 } },
  extraPlaces: [{ id: 'cauvang', name: 'Ngắm Cầu Vàng', x: 24, z: -4, ry: Math.PI / 2 }],
  extraLabels: [['cauvang', 22, -8, 'Cầu Vàng']],
  extraTrips: [{ x: 24, z: -4, spread: 2, ry: Math.PI / 2, say: 'Cầu Vàng đẹp quá' }],
  extras: (ctx) => { bigBuddha(ctx, 'L'); goldenBridge(ctx); },
});
