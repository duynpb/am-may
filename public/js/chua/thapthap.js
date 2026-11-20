import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'thapthap',
  name: 'Chùa Thập Tháp Di Đà',
  plaque: 'THẬP THÁP DI ĐÀ TỰ',
  front: 'ponds',
  slots: { L: 'tower', R: 'tower', RL: 'bodhi' },
  wall: '#e8d9b0',
  hill: { h: 18, color: '#6a8a4c' },
  trees: 'palm',
  loading: 'Gió biển đang thổi qua đồng lúa Bình Định',
  hint: 'đi giữa hai hồ sen, ngắm hai bảo tháp hai bên sân, rồi vào chánh điện',
  info: 'Chùa Thập Tháp Di Đà ở Bình Định là ngôi chùa cổ của miền Trung. Qua cổng tam quan là lối đi giữa hai hồ sen; hai bên sân có hai bảo tháp nhiều tầng, góc sân có cây bồ đề; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa, không phải bản sao.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Hai bảo tháp đẹp quá', 'Chùa cổ Bình Định', 'Dừa nghiêng bóng nắng', 'Hồ sen thơm ghê'],
});
