import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'tamthanh',
  name: 'Chùa Tam Thanh',
  plaque: 'TAM THANH TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'stupa', RL: 'bodhi' },
  wall: '#e0c590',
  ground: '#8a9a6a',
  hill: { h: 26, color: '#8d9484' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên núi đá Lạng Sơn',
  hint: 'đi vào sân dưới vách đá, ghé gác chuông và cây bồ đề, rồi lên chánh điện',
  info: 'Chùa Tam Thanh ở Lạng Sơn nằm trong một hang núi đá vôi, là danh thắng nổi tiếng của vùng biên giới phía Bắc. Sân chùa nằm dưới vách đá; bên trái có gác chuông, bên phải là tháp nhỏ, góc sân có cây bồ đề; cuối sân là chánh điện, phía sau là núi đá. (Dựng phỏng theo không khí chùa; hang động thật chưa được dựng.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi đá Lạng Sơn hùng vĩ', 'Chùa nép dưới vách đá', 'Gió núi mát quá'],
});
