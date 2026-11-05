// Nội dung khắc trên 32 cột kinh ở vườn kinh.
// 16 cột đầu: Bát Nhã Ba La Mật Đa Tâm Kinh theo âm Hán-Việt (bản cổ truyền).
// 16 cột sau: những lời dạy ngắn viết cho Am Mây.

const TAM_KINH = [
  'Quán Tự Tại Bồ Tát, hành thâm Bát Nhã Ba La Mật Đa thời,',
  'chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
  'Xá Lợi Tử, sắc bất dị không, không bất dị sắc,',
  'sắc tức thị không, không tức thị sắc, thọ tưởng hành thức diệc phục như thị.',
  'Xá Lợi Tử, thị chư pháp không tướng, bất sinh bất diệt,',
  'bất cấu bất tịnh, bất tăng bất giảm.',
  'Thị cố không trung vô sắc, vô thọ tưởng hành thức, vô nhãn nhĩ tỷ thiệt thân ý,',
  'vô sắc thanh hương vị xúc pháp, vô nhãn giới nãi chí vô ý thức giới.',
  'Vô vô minh diệc vô vô minh tận, nãi chí vô lão tử diệc vô lão tử tận.',
  'Vô khổ tập diệt đạo, vô trí diệc vô đắc, dĩ vô sở đắc cố.',
  'Bồ Đề Tát Đỏa y Bát Nhã Ba La Mật Đa cố, tâm vô quái ngại,',
  'vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.',
  'Tam thế chư Phật y Bát Nhã Ba La Mật Đa cố, đắc A Nậu Đa La Tam Miệu Tam Bồ Đề.',
  'Cố tri Bát Nhã Ba La Mật Đa, thị đại thần chú, thị đại minh chú,',
  'thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.',
  'Cố thuyết Bát Nhã Ba La Mật Đa chú, tức thuyết chú viết: Yết đế yết đế, ba la yết đế, ba la tăng yết đế, Bồ đề tát bà ha.',
];

const LOI_DAY = [
  'Tâm an thì cảnh an. Giữ tâm lặng như mặt hồ, trăng sẽ tự in bóng.',
  'Gieo một hạt lành hôm nay, mai sau gặt một mùa an vui.',
  'Lời nói dịu dàng như nước, lâu ngày mài mòn cả đá cứng.',
  'Nhìn người bằng mắt thương, thấy ai cũng là bạn đạo.',
  'Giận như đốm lửa nhỏ: không dập sớm, sẽ thiêu cả rừng phước.',
  'Thở vào, biết mình đang thở vào. Thở ra, mỉm cười. Phút giây này là nhà.',
  'Cho đi không cần nhiều, chỉ cần thật lòng; một nụ cười cũng là món quà.',
  'Biết đủ là giàu, biết dừng là an.',
  'Việc lành dù nhỏ đừng bỏ qua, việc dữ dù nhỏ chớ làm.',
  'Thắng được chính mình là chiến thắng lớn nhất.',
  'Mọi sự đều đổi thay; biết vậy nên càng trân quý hôm nay.',
  'Lắng nghe là món quà quý nhất ta có thể trao cho người.',
  'Đi chậm một chút, nghe tiếng lá rơi, lòng sẽ nhẹ hơn.',
  'Tha thứ cho người là cởi trói cho chính mình.',
  'Giọt nước nhỏ góp thành hồ lớn; việc lành nhỏ góp thành người hiền.',
  'Nam mô A Di Đà Phật — một câu niệm, một lần trở về.',
];

export const PILLARS = [
  ...TAM_KINH.map((text, i) => ({ title: `Tâm Kinh · đoạn ${i + 1}/16`, text })),
  ...LOI_DAY.map((text, i) => ({ title: `Lời dạy · số ${i + 1}`, text })),
];
