import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'bichdong',
  name: 'Chùa Bích Động',
  plaque: 'BÍCH ĐỘNG TỰ',
  front: 'pond',
  slots: { L: 'bell', R: 'stupa', RL: 'stupa' },
  wall: '#e6d3a0',
  ground: '#86a860',
  hill: { h: 28, color: '#8d9484' },
  trees: 'forest',
  loading: 'Sương sớm đang tan trên núi đá Ninh Bình',
  hint: 'qua cầu đá hồ sen, ghé gác chuông và các tháp nhỏ, rồi lên chánh điện dưới vách núi',
  info: 'Chùa Bích Động ở Ninh Bình nằm dưới vách núi đá, được xem là một danh thắng của vùng Tam Cốc. Qua cổng tam quan là hồ sen có cầu đá; bên trái có gác chuông, bên phải và góc sân là các tháp nhỏ; cuối sân là chánh điện, phía sau là núi đá. (Dựng phỏng theo không khí chùa; ba tầng chùa trên núi thật chưa được dựng.)',
  tips: [
    ['Cầu đá hồ sen', 'Đi thẳng từ cổng qua cầu đá giữa hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Núi đá Ninh Bình hùng vĩ', 'Hồ sen dưới chân núi đẹp ghê', 'Chùa nằm nép dưới vách đá'],
});
