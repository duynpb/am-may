import { makeYardSite } from './yard.js';

export const SITE = makeYardSite({
  id: 'vinhnghiembg',
  name: 'Chùa Vĩnh Nghiêm (Bắc Giang)',
  plaque: 'VĨNH NGHIÊM TỰ',
  front: 'ponds',
  slots: { L: 'bell', R: 'tower', RL: 'stupa' },
  wall: '#e8d5a0',
  ground: '#86a860',
  hill: { h: 14, color: '#6a8a4c' },
  trees: 'forest',
  loading: 'Nắng sớm đang lên trên núi Yên Tử phía xa',
  hint: 'đi giữa hai hồ sen, ngắm bảo tháp và gác chuông, rồi vào chánh điện',
  info: 'Chùa Vĩnh Nghiêm ở Yên Dũng, Bắc Ninh (Bắc Giang cũ), là ngôi chùa lớn của dòng Trúc Lâm, nơi lưu giữ bộ mộc bản kinh Phật quý. Qua cổng tam quan là lối đi giữa hai hồ sen; bên trái có gác chuông, bên phải là bảo tháp, góc sân có tháp nhỏ; cuối sân là chánh điện. (Dựng phỏng theo không khí chùa; kho mộc bản thật chưa được dựng.)',
  tips: [
    ['Giữa hai hồ sen', 'Đi thẳng từ cổng theo lối giữa hai hồ sen để tới chánh điện.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Chùa lớn dòng Trúc Lâm', 'Mộc bản kinh quý lắm', 'Hai hồ sen thơm ghê'],
});
