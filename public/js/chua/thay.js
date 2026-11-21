import { makeYardSite } from './yard.js';
import { coveredBridge, waterStage } from './yard-extras.js';

export const SITE = makeYardSite({
  id: 'thay',
  name: 'Chùa Thầy',
  plaque: 'THẦY TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa' },
  wall: '#e6d3a0',
  hill: { h: 20, color: '#7d8a62' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên hồ dưới chân núi Sài Sơn',
  hint: 'qua cầu có mái che giữa hồ, ngắm thủy đình, ghé các điểm hai bên sân rồi vào chánh điện',
  info: 'Chùa Thầy ở Quốc Oai, Hà Nội, nằm bên hồ dưới chân núi Sài Sơn, gắn với thiền sư Từ Đạo Hạnh, nổi tiếng với thủy đình múa rối nước. Qua cổng tam quan là hồ nước có cầu mái che bắc ngang, bên hồ có thủy đình dựng trên cọc; trong sân bên trái có gác chuông, bên phải và góc sân là các tháp nhỏ; cuối sân là chánh điện, sau lưng là núi đá. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Cầu có mái che', 'Đi thẳng từ cổng qua cầu có mái che giữa hồ; ghé ngắm thủy đình nơi diễn múa rối nước bên hồ.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa Thầy bên hồ đẹp quá', 'Núi Sài Sơn xanh ghê', 'Cầu đá soi bóng nước'],
  bridgeName: 'Cầu có mái che',
  custom: {},
  extraPlaces: [{ id: 'thuydinh', name: 'Ngắm thủy đình', x: -8.7, z: 34.5, ry: Math.PI }],
  extraLabels: [['thuydinh', -8.7, 18, 'Thủy đình']],
  extraTrips: [{ x: -8.7, z: 34.5, spread: 2, ry: Math.PI, say: 'Thủy đình đẹp quá' }],
  extras: (ctx) => { coveredBridge(ctx, { shrine: false, animals: false, label: 'NHẬT TIÊN KIỀU' }); waterStage(ctx, -8.7, 23); },
});
