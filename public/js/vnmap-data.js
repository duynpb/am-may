// Dữ liệu bản đồ Việt Nam (kinh độ, vĩ độ). Đường biên giới và bờ biển do Am Mây vẽ tay theo các điểm mốc
// (Lũng Cú, Móng Cái, Mũi Điện, Mũi Cà Mau, Hà Tiên…) — đủ chính xác cho bản đồ cỡ màn hình, không phải bản đồ đo đạc.

// Đất liền: đi theo biên giới phía bắc từ tây sang đông, xuống theo bờ biển tới Mũi Cà Mau, lên Hà Tiên,
// rồi theo biên giới với Campuchia và Lào trở lại điểm đầu
export const MAINLAND = [
  [102.14, 22.4], [102.3, 22.48], [102.48, 22.77], [102.73, 22.65], [102.93, 22.48], [103.17, 22.63], [103.35, 22.8],
  [103.53, 22.59], [103.7, 22.79], [103.97, 22.51], [104.12, 22.8], [104.36, 22.69], [104.62, 22.85], [104.83, 22.98],
  [104.98, 23.15], [105.27, 23.27], [105.33, 23.38], [105.55, 23.2], [105.83, 22.98], [106.05, 22.99], [106.25, 22.88],
  [106.55, 22.92], [106.71, 22.86], [106.8, 22.75], [106.66, 22.57], [106.6, 22.34], [106.73, 22.02], [107.02, 21.9],
  [107.37, 21.66], [107.65, 21.6], [107.96, 21.53], [108.05, 21.52],
  // bờ biển
  [107.85, 21.45], [107.6, 21.32], [107.4, 21.22], [107.2, 21.05], [107.05, 20.95], [106.85, 20.85], [106.75, 20.7],
  [106.6, 20.45], [106.45, 20.25], [106.2, 19.98], [106.0, 19.88], [105.9, 19.7], [105.8, 19.45], [105.73, 19.15],
  [105.62, 18.95], [105.73, 18.72], [105.95, 18.45], [106.15, 18.25], [106.42, 17.95], [106.6, 17.65], [106.8, 17.3],
  [107.08, 17.05], [107.35, 16.75], [107.65, 16.5], [107.95, 16.3], [108.2, 16.1], [108.35, 16.12], [108.3, 15.9],
  [108.5, 15.65], [108.75, 15.4], [108.9, 15.15], [109.05, 14.85], [109.15, 14.4], [109.25, 13.95], [109.3, 13.55],
  [109.32, 13.1], [109.46, 12.88], [109.3, 12.6], [109.22, 12.25], [109.2, 11.9], [109.05, 11.6], [108.95, 11.35],
  [108.7, 11.2], [108.4, 11.0], [108.1, 10.9], [107.8, 10.65], [107.4, 10.5], [107.1, 10.35], [106.8, 10.4],
  [106.75, 10.2], [106.6, 9.95], [106.45, 9.75], [106.25, 9.55], [106.05, 9.35], [105.8, 9.1], [105.5, 8.85],
  [105.2, 8.7], [104.9, 8.58], [104.72, 8.6], [104.8, 8.85], [104.82, 9.4], [104.9, 9.8], [105.05, 10.0],
  [104.85, 10.2], [104.6, 10.3], [104.45, 10.42],
  // biên giới Campuchia
  [104.55, 10.52], [104.85, 10.55], [105.05, 10.9], [105.35, 10.95], [105.7, 11.0], [105.9, 10.85], [106.15, 11.0],
  [106.0, 11.3], [106.2, 11.7], [106.45, 11.7], [106.7, 11.95], [106.95, 12.1], [107.3, 12.25], [107.55, 12.3],
  [107.55, 12.8], [107.45, 13.4], [107.55, 13.9], [107.4, 14.3], [107.5, 14.55],
  // biên giới Lào
  [107.55, 14.7], [107.7, 15.1], [107.45, 15.5], [107.25, 15.85], [107.4, 16.1], [106.95, 16.35], [106.7, 16.6],
  [106.55, 16.95], [106.3, 17.3], [105.9, 17.7], [105.65, 18.0], [105.4, 18.25], [105.15, 18.65], [104.9, 18.85],
  [104.55, 19.05], [104.2, 19.4], [104.05, 19.65], [104.45, 19.75], [104.7, 20.05], [104.55, 20.3], [104.35, 20.45],
  [104.1, 20.75], [103.75, 20.7], [103.4, 20.8], [103.2, 20.9], [103.05, 21.25], [102.85, 21.4], [102.65, 21.7],
  [102.6, 21.9], [102.45, 22.1], [102.2, 22.3],
];
// Đảo lớn vẽ thành hình (Phú Quốc, Cát Bà, Côn Sơn)
export const BIG_ISLANDS = [
  { name: 'Phú Quốc', pts: [[103.84, 10.43], [103.98, 10.45], [104.07, 10.37], [104.06, 10.2], [104.0, 10.03], [103.93, 10.02], [103.88, 10.15], [103.84, 10.3]] },
  { name: 'Cát Bà', pts: [[106.92, 20.83], [107.08, 20.85], [107.12, 20.75], [107.0, 20.7], [106.93, 20.75]] },
  { name: 'Côn Đảo', pts: [[106.56, 8.73], [106.66, 8.72], [106.68, 8.66], [106.6, 8.64], [106.55, 8.68]] },
];
// Các đảo khác (chấm nhỏ có tên)
export const ISLANDS = [
  ['Cô Tô', 107.76, 20.98], ['Bạch Long Vĩ', 107.73, 20.13], ['Cồn Cỏ', 107.34, 17.16], ['Cù Lao Chàm', 108.52, 15.95],
  ['Lý Sơn', 109.12, 15.38], ['Phú Quý', 108.94, 10.52], ['Nam Du', 104.35, 9.67], ['Thổ Chu', 103.48, 9.29],
  ['Hòn Khoai', 104.83, 8.43], ['Hòn Tre', 109.25, 12.21], ['Vân Đồn', 107.48, 21.08],
];
// Quần đảo Hoàng Sa và Trường Sa của Việt Nam (một số đảo, đá tiêu biểu)
export const HOANG_SA = {
  name: 'Quần đảo Hoàng Sa', sub: 'Đặc khu Hoàng Sa · TP. Đà Nẵng', label: [111.95, 17.25],
  isles: [['Phú Lâm', 112.34, 16.84], ['Đảo Cây', 112.26, 16.98], ['Linh Côn', 112.73, 16.67], ['Hoàng Sa', 111.61, 16.53],
    ['Quang Ảnh', 111.58, 16.45], ['Duy Mộng', 111.74, 16.45], ['Hữu Nhật', 111.57, 16.31], ['Bạch Quy', 111.78, 16.05],
    ['Tri Tôn', 111.2, 15.78], ['Đá Bông Bay', 112.52, 16.03], ['Đảo Bắc', 112.33, 16.97], ['Đảo Trung', 112.34, 16.95]],
};
export const TRUONG_SA = {
  name: 'Quần đảo Trường Sa', sub: 'Đặc khu Trường Sa · Khánh Hòa', label: [113.2, 11.95],
  isles: [['Song Tử Tây', 114.33, 11.43], ['Song Tử Đông', 114.37, 11.46], ['Thị Tứ', 114.28, 11.05], ['Loại Ta', 114.42, 10.68],
    ['Ba Bình', 114.36, 10.38], ['Sơn Ca', 114.48, 10.37], ['Nam Yết', 114.36, 10.18], ['Sinh Tồn', 114.33, 9.88],
    ['Sinh Tồn Đông', 114.56, 9.91], ['Phan Vinh', 113.7, 8.97], ['Đá Tây', 112.22, 8.85], ['Trường Sa Lớn', 111.92, 8.64],
    ['Thuyền Chài', 113.31, 8.18], ['An Bang', 112.91, 7.89], ['Đá Lát', 111.67, 8.67]],
};
export const SEA_LABELS = [
  ['Biển Đông', 112.0, 14.0, 'big'], ['Vịnh Bắc Bộ', 107.45, 19.9], ['Vịnh Thái Lan', 103.2, 9.3],
  ['Lào', 104.3, 18.2, 'land'], ['Campuchia', 105.2, 12.6, 'land'], ['Trung Quốc', 106.0, 23.55, 'land'],
];

// Chùa (tên, tỉnh/thành theo địa giới mới từ 1/7/2025 — 34 tỉnh, thành; old: tỉnh cũ trước sáp nhập, vĩ độ, kinh độ).
// built: chùa đã dựng trong Am Mây.
export const PAGODAS = [
  // Am Mây và Tam Chúc
  { id: 'ammay', name: 'Am Mây', prov: 'Ninh Bình', lat: 20.236, lon: 105.926, built: 'ammay' },
  { id: 'tamchuc', name: 'Chùa Tam Chúc', prov: 'Ninh Bình', old: 'Hà Nam', lat: 20.534, lon: 105.84, built: 'tamchuc' },
  // Miền Bắc
  { id: 'motcot', name: 'Chùa Một Cột', prov: 'Hà Nội', lat: 21.0359, lon: 105.8336, built: 'motcot' },
  { id: 'tranquoc', name: 'Chùa Trấn Quốc', prov: 'Hà Nội', lat: 21.0479, lon: 105.8368, built: 'tranquoc' },
  { id: 'quansu', name: 'Chùa Quán Sứ', prov: 'Hà Nội', lat: 21.0234, lon: 105.8455, built: 'quansu' },
  { id: 'chuaha', name: 'Chùa Hà', prov: 'Hà Nội', lat: 21.0367, lon: 105.7965, built: 'chuaha' },
  { id: 'huong', name: 'Chùa Hương', prov: 'Hà Nội', lat: 20.618, lon: 105.747 },
  { id: 'thay', name: 'Chùa Thầy', prov: 'Hà Nội', lat: 21.019, lon: 105.643 },
  { id: 'tayphuong', name: 'Chùa Tây Phương', prov: 'Hà Nội', lat: 21.039, lon: 105.61 },
  { id: 'mia', name: 'Chùa Mía', prov: 'Hà Nội', lat: 21.155, lon: 105.475 },
  { id: 'baidinh', name: 'Chùa Bái Đính', prov: 'Ninh Bình', lat: 20.275, lon: 105.864, built: 'baidinh' },
  { id: 'bichdong', name: 'Chùa Bích Động', prov: 'Ninh Bình', lat: 20.219, lon: 105.912 },
  { id: 'badanh', name: 'Chùa Bà Đanh', prov: 'Ninh Bình', old: 'Hà Nam', lat: 20.585, lon: 105.935 },
  { id: 'doison', name: 'Chùa Đọi Sơn', prov: 'Ninh Bình', old: 'Hà Nam', lat: 20.615, lon: 105.975 },
  { id: 'keo', name: 'Chùa Keo', prov: 'Hưng Yên', old: 'Thái Bình', lat: 20.385, lon: 106.365 },
  { id: 'phominh', name: 'Chùa Phổ Minh', prov: 'Ninh Bình', old: 'Nam Định', lat: 20.444, lon: 106.174 },
  { id: 'cole', name: 'Chùa Cổ Lễ', prov: 'Ninh Bình', old: 'Nam Định', lat: 20.325, lon: 106.26 },
  { id: 'dau', name: 'Chùa Dâu', prov: 'Bắc Ninh', lat: 21.041, lon: 106.057 },
  { id: 'butthap', name: 'Chùa Bút Tháp', prov: 'Bắc Ninh', lat: 21.095, lon: 106.06 },
  { id: 'phattich', name: 'Chùa Phật Tích', prov: 'Bắc Ninh', lat: 21.095, lon: 106.027 },
  { id: 'vinhnghiembg', name: 'Chùa Vĩnh Nghiêm', prov: 'Bắc Ninh', old: 'Bắc Giang', lat: 21.27, lon: 106.26 },
  { id: 'tayyentu', name: 'Chùa Tây Yên Tử', prov: 'Bắc Ninh', old: 'Bắc Giang', lat: 21.17, lon: 106.68 },
  { id: 'yentu', name: 'Chùa Đồng Yên Tử', prov: 'Quảng Ninh', lat: 21.155, lon: 106.72, built: 'yentu' },
  { id: 'bavang', name: 'Chùa Ba Vàng', prov: 'Quảng Ninh', lat: 21.07, lon: 106.74, built: 'bavang' },
  { id: 'caibau', name: 'Chùa Cái Bầu', prov: 'Quảng Ninh', lat: 21.13, lon: 107.47 },
  { id: 'conson', name: 'Chùa Côn Sơn', prov: 'Hải Phòng', old: 'Hải Dương', lat: 21.15, lon: 106.38 },
  { id: 'thanhmai', name: 'Chùa Thanh Mai', prov: 'Hải Phòng', old: 'Hải Dương', lat: 21.19, lon: 106.45 },
  { id: 'duhang', name: 'Chùa Dư Hàng', prov: 'Hải Phòng', lat: 20.84, lon: 106.685 },
  { id: 'taythien', name: 'Thiền viện Tây Thiên', prov: 'Phú Thọ', old: 'Vĩnh Phúc', lat: 21.494, lon: 105.627, built: 'taythien' },
  { id: 'tamthanh', name: 'Chùa Tam Thanh', prov: 'Lạng Sơn', lat: 21.848, lon: 106.748 },
  // Miền Trung, Tây Nguyên
  { id: 'daitue', name: 'Chùa Đại Tuệ', prov: 'Nghệ An', lat: 18.7, lon: 105.5 },
  { id: 'thienmu', name: 'Chùa Thiên Mụ', prov: 'Huế', lat: 16.4535, lon: 107.545, built: 'thienmu' },
  { id: 'tudam', name: 'Chùa Từ Đàm', prov: 'Huế', lat: 16.456, lon: 107.573 },
  { id: 'tuhieu', name: 'Chùa Từ Hiếu', prov: 'Huế', lat: 16.444, lon: 107.576 },
  { id: 'linhungbb', name: 'Chùa Linh Ứng Bãi Bụt', prov: 'Đà Nẵng', lat: 16.1, lon: 108.278, built: 'linhungbb' },
  { id: 'linhungnn', name: 'Chùa Linh Ứng Non Nước', prov: 'Đà Nẵng', lat: 16.004, lon: 108.263 },
  { id: 'chucthanh', name: 'Chùa Chúc Thánh', prov: 'Đà Nẵng', old: 'Quảng Nam', lat: 15.892, lon: 108.326 },
  { id: 'thienan', name: 'Chùa Thiên Ấn', prov: 'Quảng Ngãi', lat: 15.13, lon: 108.83 },
  { id: 'hanglyson', name: 'Chùa Hang (Lý Sơn)', prov: 'Đặc khu Lý Sơn, Quảng Ngãi', lat: 15.385, lon: 109.13 },
  { id: 'thapthap', name: 'Chùa Thập Tháp Di Đà', prov: 'Gia Lai', old: 'Bình Định', lat: 13.93, lon: 109.1 },
  { id: 'longson', name: 'Chùa Long Sơn', prov: 'Khánh Hòa', lat: 12.251, lon: 109.181, built: 'longson' },
  { id: 'taku', name: 'Chùa Núi Tà Cú', prov: 'Lâm Đồng', old: 'Bình Thuận', lat: 10.825, lon: 107.889 },
  { id: 'cothach', name: 'Chùa Cổ Thạch', prov: 'Lâm Đồng', old: 'Bình Thuận', lat: 11.255, lon: 108.735 },
  { id: 'linhphuoc', name: 'Chùa Linh Phước', prov: 'Lâm Đồng', lat: 11.945, lon: 108.498 },
  { id: 'truclamdl', name: 'Thiền viện Trúc Lâm Đà Lạt', prov: 'Lâm Đồng', lat: 11.92, lon: 108.435, built: 'truclamdl' },
  { id: 'minhthanh', name: 'Chùa Minh Thành', prov: 'Gia Lai', lat: 13.98, lon: 108.0 },
  { id: 'khaidoan', name: 'Chùa Khải Đoan', prov: 'Đắk Lắk', lat: 12.675, lon: 108.04 },
  // Miền Nam
  { id: 'vinhnghiem', name: 'Chùa Vĩnh Nghiêm', prov: 'TP. Hồ Chí Minh', lat: 10.79, lon: 106.684, built: 'vinhnghiem' },
  { id: 'giaclam', name: 'Chùa Giác Lâm', prov: 'TP. Hồ Chí Minh', lat: 10.779, lon: 106.651 },
  { id: 'ngochoang', name: 'Chùa Ngọc Hoàng', prov: 'TP. Hồ Chí Minh', lat: 10.792, lon: 106.698 },
  { id: 'vnquoctu', name: 'Việt Nam Quốc Tự', prov: 'TP. Hồ Chí Minh', lat: 10.77, lon: 106.675 },
  { id: 'buulong', name: 'Chùa Bửu Long', prov: 'TP. Hồ Chí Minh', lat: 10.88, lon: 106.835, built: 'buulong' },
  { id: 'baden', name: 'Chùa Bà Núi Bà Đen', prov: 'Tây Ninh', lat: 11.38, lon: 106.17, built: 'baden' },
  { id: 'hoikhanh', name: 'Chùa Hội Khánh', prov: 'TP. Hồ Chí Minh', old: 'Bình Dương', lat: 10.98, lon: 106.656 },
  { id: 'buuphong', name: 'Chùa Bửu Phong', prov: 'Đồng Nai', lat: 10.96, lon: 106.865 },
  { id: 'phatdai', name: 'Thích Ca Phật Đài', prov: 'TP. Hồ Chí Minh', old: 'Bà Rịa – Vũng Tàu', lat: 10.354, lon: 107.091, built: 'phatdai' },
  { id: 'nuimot', name: 'Chùa Núi Một (Côn Đảo)', prov: 'Đặc khu Côn Đảo, TP. Hồ Chí Minh', old: 'Bà Rịa – Vũng Tàu', lat: 8.68, lon: 106.61 },
  { id: 'vinhtrang', name: 'Chùa Vĩnh Tràng', prov: 'Đồng Tháp', old: 'Tiền Giang', lat: 10.36, lon: 106.383, built: 'vinhtrang' },
  { id: 'truclampn', name: 'Thiền viện Trúc Lâm Phương Nam', prov: 'Cần Thơ', lat: 10.031, lon: 105.7 },
  { id: 'tayan', name: 'Chùa Tây An', prov: 'An Giang', lat: 10.679, lon: 105.082, built: 'tayan' },
  { id: 'doi', name: 'Chùa Dơi', prov: 'Cần Thơ', old: 'Sóc Trăng', lat: 9.59, lon: 105.97, built: 'chuadoi' },
  { id: 'kleang', name: 'Chùa Kh\'Leang', prov: 'Cần Thơ', old: 'Sóc Trăng', lat: 9.605, lon: 105.98 },
  { id: 'ang', name: 'Chùa Âng', prov: 'Vĩnh Long', old: 'Trà Vinh', lat: 9.923, lon: 106.311 },
  { id: 'phudung', name: 'Chùa Phù Dung', prov: 'An Giang', old: 'Kiên Giang', lat: 10.385, lon: 104.49 },
  { id: 'hoquoc', name: 'Thiền viện Trúc Lâm Hộ Quốc', prov: 'Đặc khu Phú Quốc, An Giang', old: 'Kiên Giang', lat: 10.13, lon: 104.05, built: 'hoquoc' },
  // Hoàng Sa, Trường Sa
  { id: 'hoangsa', name: 'Chùa Hoàng Sa', prov: 'Đặc khu Hoàng Sa, TP. Đà Nẵng', lat: 16.53, lon: 111.61 },
  { id: 'tslon', name: 'Chùa Trường Sa Lớn', prov: 'Đặc khu Trường Sa, Khánh Hòa', lat: 8.646, lon: 111.92 },
  { id: 'songtutay', name: 'Chùa Song Tử Tây', prov: 'Đặc khu Trường Sa, Khánh Hòa', lat: 11.43, lon: 114.33 },
  { id: 'sonca', name: 'Chùa Sơn Ca', prov: 'Đặc khu Trường Sa, Khánh Hòa', lat: 10.37, lon: 114.48 },
  { id: 'namyet', name: 'Chùa Nam Yết', prov: 'Đặc khu Trường Sa, Khánh Hòa', lat: 10.18, lon: 114.36 },
  { id: 'sinhton', name: 'Chùa Sinh Tồn', prov: 'Đặc khu Trường Sa, Khánh Hòa', lat: 9.88, lon: 114.33 },
];
export const pagodaById = (id) => PAGODAS.find((p) => p.id === id);
