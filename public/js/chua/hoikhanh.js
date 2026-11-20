import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'hoikhanh',
  name: 'Chùa Hội Khánh',
  plaque: 'HỘI KHÁNH TỰ',
  front: 'none',
  slots: { L: 'bell', R: 'bodhi', RL: 'stupa' },
  wall: '#e3c98a',
  ground: '#7fa25a',
  hill: { h: 8, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên vùng đất Thủ Dầu Một',
  hint: 'qua cổng, ghé gác chuông và cây bồ đề trong sân, rồi vào chánh điện nhiều cột gỗ',
  info: 'Chùa Hội Khánh ở Thủ Dầu Một (Bình Dương cũ, nay thuộc TP. Hồ Chí Minh) là ngôi chùa cổ nổi tiếng với những cột gỗ, hoành phi và câu đối chạm khắc. Qua cổng tam quan là sân rộng; bên trái có gác chuông, bên phải là cây bồ đề, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Sân chùa', 'Đi thẳng từ cổng vào sân rộng, ghé các điểm hai bên rồi lên chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa cổ Thủ Dầu Một', 'Cột gỗ chạm đẹp ghê', 'Sân chùa yên tĩnh quá', 'Bóng bồ đề mát ghê'],
});
