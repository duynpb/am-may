// Kết nối nhiều người qua WebSocket. Nếu không có máy chủ, trang chạy ở chế độ ngoại tuyến.
// Mỗi khu là một trang riêng: Am Mây, Tam Chúc, và các chùa miền Nam (chua.html?site=…)
export const SITES = {
  ammay: { name: 'Am Mây', page: './', roomLabel: 'Chánh điện', desc: 'chánh điện, tháp, hành lang La Hán' },
  tamchuc: { name: 'Tam Chúc', page: 'tamchuc.html', roomLabel: 'Tam Chúc', desc: 'hồ lớn, cổng Tam Quan sát mặt nước' },
  // các chùa miền Nam dựng kỹ: chung một trang chua.html, mỗi chùa một file cảnh (js/chua/)
  vinhnghiem: { name: 'Chùa Vĩnh Nghiêm', page: 'chua.html?site=vinhnghiem', roomLabel: 'Vĩnh Nghiêm', desc: 'tam quan gỗ, tháp bảy tầng, đại hồng chung' },
  chuadoi: { name: 'Chùa Dơi', page: 'chua.html?site=chuadoi', roomLabel: 'Chùa Dơi', desc: 'chùa Khmer mái nhọn, vườn cây cổ thụ có đàn dơi' },
  baden: { name: 'Núi Bà Đen', page: 'chua.html?site=baden', roomLabel: 'Núi Bà Đen', desc: 'chùa Bà lưng chừng núi, cáp treo lên tượng Phật Bà trên đỉnh' },
  phatdai: { name: 'Thích Ca Phật Đài', page: 'chua.html?site=phatdai', roomLabel: 'Phật Đài', desc: 'tượng Phật Thích Ca trắng trên sườn núi nhìn ra biển' },
  // các chùa miền Trung dựng kỹ
  thienmu: { name: 'Chùa Thiên Mụ', page: 'chua.html?site=thienmu', roomLabel: 'Thiên Mụ', desc: 'tháp Phước Duyên bảy tầng bên sông Hương' },
  linhungbb: { name: 'Chùa Linh Ứng Bãi Bụt', page: 'chua.html?site=linhungbb', roomLabel: 'Linh Ứng', desc: 'tượng Quan Âm trắng trên vách đá nhìn ra biển Sơn Trà' },
  longson: { name: 'Chùa Long Sơn', page: 'chua.html?site=longson', roomLabel: 'Long Sơn', desc: 'tượng Phật nằm và Kim Thân Phật Tổ trên đồi Trại Thủy' },
  truclamdl: { name: 'Thiền viện Trúc Lâm Đà Lạt', page: 'chua.html?site=truclamdl', roomLabel: 'Trúc Lâm', desc: 'thiền viện giữa rừng thông bên hồ Tuyền Lâm' },
  // các chùa miền Bắc dựng kỹ (núi thiêng)
  baidinh: { name: 'Chùa Bái Đính', page: 'chua.html?site=baidinh', roomLabel: 'Bái Đính', desc: 'hành lang La Hán, điện Pháp Chủ, bảo tháp mười ba tầng' },
  yentu: { name: 'Chùa Đồng Yên Tử', page: 'chua.html?site=yentu', roomLabel: 'Yên Tử', desc: 'cáp treo lên chùa Đồng trên đỉnh núi thiêng' },
  bavang: { name: 'Chùa Ba Vàng', page: 'chua.html?site=bavang', roomLabel: 'Ba Vàng', desc: 'chánh điện rất lớn trên sườn núi nhìn xuống đồng bằng' },
  taythien: { name: 'Thiền viện Tây Thiên', page: 'chua.html?site=taythien', roomLabel: 'Tây Thiên', desc: 'thiền viện giữa rừng Tam Đảo, cáp treo lên đền Thượng' },
  // các chùa Hà Nội
  chuaha: { name: 'Chùa Hà', page: 'chua.html?site=chuaha', roomLabel: 'Chùa Hà', desc: 'chùa cầu duyên giữa phố, cây duyên treo lụa đỏ' },
  motcot: { name: 'Chùa Một Cột', page: 'chua.html?site=motcot', roomLabel: 'Một Cột', desc: 'điện nhỏ trên một cột đá giữa hồ sen' },
  tranquoc: { name: 'Chùa Trấn Quốc', page: 'chua.html?site=tranquoc', roomLabel: 'Trấn Quốc', desc: 'chùa cổ trên bán đảo Hồ Tây, bảo tháp đỏ mười một tầng' },
  quansu: { name: 'Chùa Quán Sứ', page: 'chua.html?site=quansu', roomLabel: 'Quán Sứ', desc: 'chùa giữa phố, trụ sở Giáo hội Phật giáo Việt Nam' },
  // các chùa miền Nam — đợt hai
  buulong: { name: 'Chùa Bửu Long', page: 'chua.html?site=buulong', roomLabel: 'Bửu Long', desc: 'chùa trên đồi, bảo tháp vàng kiểu Thái' },
  vinhtrang: { name: 'Chùa Vĩnh Tràng', page: 'chua.html?site=vinhtrang', roomLabel: 'Vĩnh Tràng', desc: 'ba pho tượng Phật lớn ngoài trời giữa vườn Mỹ Tho' },
  hoquoc: { name: 'Thiền viện Trúc Lâm Hộ Quốc', page: 'chua.html?site=hoquoc', roomLabel: 'Hộ Quốc', desc: 'thiền viện trên đồi nhìn ra biển Phú Quốc' },
  tayan: { name: 'Chùa Tây An', page: 'chua.html?site=tayan', roomLabel: 'Tây An', desc: 'chùa mái vòm kiểu Ấn – Hồi dưới chân núi Sam' },
  // các chùa miền Nam — đợt ba
  giaclam: { name: 'Chùa Giác Lâm', page: 'chua.html?site=giaclam', roomLabel: 'Giác Lâm', desc: 'chùa cổ bằng gỗ, bảo tháp Phật bảy tầng' },
  ngochoang: { name: 'Chùa Ngọc Hoàng', page: 'chua.html?site=ngochoang', roomLabel: 'Ngọc Hoàng', desc: 'hồ rùa, vòng hương xoắn ốc, điện thờ Ngọc Hoàng' },
  vnquoctu: { name: 'Việt Nam Quốc Tự', page: 'chua.html?site=vnquoctu', roomLabel: 'Quốc Tự', desc: 'hai hồ sen, tượng Quan Âm, chánh điện ba tầng mái' },
  ang: { name: 'Chùa Âng', page: 'chua.html?site=ang', roomLabel: 'Chùa Âng', desc: 'chùa Khmer cổ bên ao Bà Om, cây sao cổ thụ' },
  // các chùa miền Trung và đảo — đợt hai
  linhungnn: { name: 'Chùa Linh Ứng Non Nước', page: 'chua.html?site=linhungnn', roomLabel: 'Non Nước', desc: 'chùa dưới núi đá cẩm thạch, tượng Quan Âm trắng' },
  hanglyson: { name: 'Chùa Hang (Lý Sơn)', page: 'chua.html?site=hanglyson', roomLabel: 'Chùa Hang', desc: 'chùa trong hang đá núi lửa trên đảo Lý Sơn' },
  linhphuoc: { name: 'Chùa Linh Phước', page: 'chua.html?site=linhphuoc', roomLabel: 'Linh Phước', desc: 'rồng khảm sành sứ, tháp chuông, vườn hoa Đà Lạt' },
  tuhieu: { name: 'Chùa Từ Hiếu', page: 'chua.html?site=tuhieu', roomLabel: 'Từ Hiếu', desc: 'chùa trong rừng thông, hồ sen và cầu đá' },
  hoangsa: { name: 'Chùa Hoàng Sa', page: 'chua.html?site=hoangsa', roomLabel: 'Hoàng Sa', desc: 'chùa nhỏ giữa Biển Đông, cột cờ Tổ quốc' },
  tslon: { name: 'Chùa Trường Sa Lớn', page: 'chua.html?site=tslon', roomLabel: 'Trường Sa Lớn', desc: 'chùa trên đảo san hô, hải đăng, cột cờ' },
  songtutay: { name: 'Chùa Song Tử Tây', page: 'chua.html?site=songtutay', roomLabel: 'Song Tử Tây', desc: 'chùa trên đảo xanh, hải đăng, cột cờ' },
  nuimot: { name: 'Chùa Núi Một', page: 'chua.html?site=nuimot', roomLabel: 'Núi Một', desc: 'chùa dưới chân núi Côn Đảo nhìn ra biển' },
  sinhton: { name: 'Chùa Sinh Tồn', page: 'chua.html?site=sinhton', roomLabel: 'Sinh Tồn', desc: 'chùa trên đảo Sinh Tồn, hải đăng, cột cờ' },
  thienan: { name: 'Chùa Thiên Ấn', page: 'chua.html?site=thienan', roomLabel: 'Thiên Ấn', desc: 'chùa dưới núi Thiên Ấn, cầu đá bắc ngang sông' },
  hangchaudoc: { name: 'Chùa Hang (Châu Đốc)', page: 'chua.html?site=hangchaudoc', roomLabel: 'Hang (Châu Đốc)', desc: 'chùa cổ dưới chân núi Sam ở Châu Đốc' },
  vanlinh: { name: 'Chùa Vạn Linh', page: 'chua.html?site=vanlinh', roomLabel: 'Vạn Linh', desc: 'chùa trên núi Cấm, nhìn xuống đồng bằng' },
  vanduc: { name: 'Chùa Vạn Đức', page: 'chua.html?site=vanduc', roomLabel: 'Vạn Đức', desc: 'chùa yên tĩnh ở Thủ Đức, hai hồ sen' },
  phapvan: { name: 'Chùa Pháp Vân', page: 'chua.html?site=phapvan', roomLabel: 'Pháp Vân', desc: 'chùa giữa phố nhưng yên tĩnh' },
  hoison: { name: 'Chùa Hội Sơn', page: 'chua.html?site=hoison', roomLabel: 'Hội Sơn', desc: 'chùa cổ ở phía đông thành phố, nhiều cây xanh' },
  hoangphap: { name: 'Chùa Hoằng Pháp', page: 'chua.html?site=hoangphap', roomLabel: 'Hoằng Pháp', desc: 'chùa lớn có khuôn viên rộng ở Hóc Môn' },
  giacvien: { name: 'Chùa Giác Viên', page: 'chua.html?site=giacvien', roomLabel: 'Giác Viên', desc: 'chùa cổ nổi tiếng với nhiều pho tượng gỗ' },
  xaloi: { name: 'Chùa Xá Lợi', page: 'chua.html?site=xaloi', roomLabel: 'Xá Lợi', desc: 'chùa lớn giữa thành phố, nổi tiếng với tháp chuông nhiều tầng' },
  vanhanh: { name: 'Thiền viện Vạn Hạnh', page: 'chua.html?site=vanhanh', roomLabel: 'Vạn Hạnh', desc: 'thiền viện trên đồi Đà Lạt, giữa vườn hoa và rừng thông' },
  linhsondl: { name: 'Chùa Linh Sơn', page: 'chua.html?site=linhsondl', roomLabel: 'Linh Sơn (Đà Lạt)', desc: 'chùa giữa rừng thông Đà Lạt' },
  ongnui: { name: 'Chùa Ông Núi', page: 'chua.html?site=ongnui', roomLabel: 'Ông Núi', desc: 'chùa nằm trên sườn núi giữa rừng cây' },
  longkhanh: { name: 'Chùa Long Khánh', page: 'chua.html?site=longkhanh', roomLabel: 'Long Khánh', desc: 'chùa cổ giữa phố biển, có bảo tháp' },
  linhunbana: { name: 'Chùa Linh Ứng Bà Nà', page: 'chua.html?site=linhunbana', roomLabel: 'Linh Ứng Bà Nà', desc: 'chùa trên núi Bà Nà, giữa mây và rừng' },
  haitang: { name: 'Chùa Hải Tạng', page: 'chua.html?site=haitang', roomLabel: 'Hải Tạng', desc: 'chùa cổ trên đảo, nhìn ra biển' },
  tamthai: { name: 'Chùa Tam Thai', page: 'chua.html?site=tamthai', roomLabel: 'Tam Thai', desc: 'chùa trên núi Thủy Sơn thuộc Ngũ Hành Sơn' },
  phuoclam: { name: 'Chùa Phước Lâm', page: 'chua.html?site=phuoclam', roomLabel: 'Phước Lâm', desc: 'chùa cổ yên tĩnh gần phố cổ' },
  chuacau: { name: 'Chùa Cầu', page: 'chua.html?site=chuacau', roomLabel: 'Chùa Cầu', desc: 'cây cầu có mái che nổi tiếng của phố cổ, có miếu nhỏ bên trong' },
  thienlam: { name: 'Chùa Thiền Lâm', page: 'chua.html?site=thienlam', roomLabel: 'Thiền Lâm', desc: 'chùa yên tĩnh dưới chân đồi ở ngoại ô Huế' },
  phuocduyen: { name: 'Chùa Phước Duyên', page: 'chua.html?site=phuocduyen', roomLabel: 'Phước Duyên', desc: 'chùa cổ ở ngoại ô Huế, hồ sen trước sân' },
  huyenkhong: { name: 'Chùa Huyền Không Sơn Thượng', page: 'chua.html?site=huyenkhong', roomLabel: 'Huyền Không Sơn Thượng', desc: 'chùa yên tĩnh trên đồi thông ngoại ô Huế' },
  baoquoc: { name: 'Chùa Báo Quốc', page: 'chua.html?site=baoquoc', roomLabel: 'Báo Quốc', desc: 'chùa cổ trên đồi Hàm Long' },
  huongtich: { name: 'Chùa Hương Tích', page: 'chua.html?site=huongtich', roomLabel: 'Hương Tích', desc: 'chùa cổ dưới chân núi Hồng Lĩnh ở Can Lộc' },
  truclamyt: { name: 'Thiền viện Trúc Lâm Yên Tử', page: 'chua.html?site=truclamyt', roomLabel: 'Trúc Lâm Yên Tử', desc: 'thiền viện theo dòng Trúc Lâm dưới chân núi Yên Tử' },
  hoayen: { name: 'Chùa Hoa Yên', page: 'chua.html?site=hoayen', roomLabel: 'Hoa Yên', desc: 'chùa lớn trên sườn núi Yên Tử, nơi Thiền phái Trúc Lâm có nhiều dấu tích' },
  phuluu: { name: 'Chùa Phù Lưu', page: 'chua.html?site=phuluu', roomLabel: 'Phù Lưu', desc: 'chùa làng cổ ở Từ Sơn, hai hồ sen trước sân' },
  tieuson: { name: 'Chùa Tiêu Sơn', page: 'chua.html?site=tieuson', roomLabel: 'Tiêu Sơn', desc: 'chùa cổ trên núi Tiêu ở Từ Sơn' },
  boda: { name: 'Chùa Bổ Đà', page: 'chua.html?site=boda', roomLabel: 'Bổ Đà', desc: 'chùa cổ trên núi Bổ Đà, nơi lưu giữ mộc bản kinh Phật' },
  tramgian: { name: 'Chùa Trăm Gian', page: 'chua.html?site=tramgian', roomLabel: 'Trăm Gian', desc: 'chùa cổ nổi tiếng với những dãy nhà gỗ nhiều gian' },
  bada: { name: 'Chùa Bà Đá', page: 'chua.html?site=bada', roomLabel: 'Bà Đá', desc: 'chùa cổ giữa phố cổ, gắn với một truyền thuyết về tảng đá' },
  kimlien: { name: 'Chùa Kim Liên', page: 'chua.html?site=kimlien', roomLabel: 'Kim Liên', desc: 'chùa cổ gần Hồ Tây, nổi tiếng với kiến trúc gỗ' },
  lang: { name: 'Chùa Láng', page: 'chua.html?site=lang', roomLabel: 'Láng', desc: 'chùa cổ thờ thiền sư Từ Đạo Hạnh' },
  tamthanh: { name: 'Chùa Tam Thanh', page: 'chua.html?site=tamthanh', roomLabel: 'Tam Thanh', desc: 'chùa trong hang núi đá ở Lạng Sơn' },
  duhang: { name: 'Chùa Dư Hàng', page: 'chua.html?site=duhang', roomLabel: 'Dư Hàng', desc: 'chùa cổ giữa phố Hải Phòng, hồ sen và gác chuông' },
  thanhmai: { name: 'Chùa Thanh Mai', page: 'chua.html?site=thanhmai', roomLabel: 'Thanh Mai', desc: 'chùa cổ trên núi ở Chí Linh, vườn tháp tổ' },
  conson: { name: 'Chùa Côn Sơn', page: 'chua.html?site=conson', roomLabel: 'Côn Sơn', desc: 'chùa cổ giữa rừng thông Côn Sơn, hồ nước và cầu đá' },
  caibau: { name: 'Chùa Cái Bầu', page: 'chua.html?site=caibau', roomLabel: 'Cái Bầu', desc: 'chùa trên đảo Cái Bầu, tượng Phật lớn nhìn ra vịnh' },
  tayyentu: { name: 'Chùa Tây Yên Tử', page: 'chua.html?site=tayyentu', roomLabel: 'Tây Yên Tử', desc: 'chùa trên núi cao Tây Yên Tử, rừng thông, sân núi' },
  vinhnghiembg: { name: 'Chùa Vĩnh Nghiêm (Bắc Giang)', page: 'chua.html?site=vinhnghiembg', roomLabel: 'Vĩnh Nghiêm (Bắc Giang)', desc: 'chùa cổ ở Yên Dũng, nơi lưu giữ mộc bản kinh Phật' },
  phattich: { name: 'Chùa Phật Tích', page: 'chua.html?site=phattich', roomLabel: 'Phật Tích', desc: 'chùa cổ trên núi Lạn Kha, tượng đá và sân núi' },
  butthap: { name: 'Chùa Bút Tháp', page: 'chua.html?site=butthap', roomLabel: 'Bút Tháp', desc: 'chùa cổ bên hồ ở Thuận Thành, tháp đá và gác chuông' },
  dau: { name: 'Chùa Dâu', page: 'chua.html?site=dau', roomLabel: 'Dâu', desc: 'chùa cổ nhất xứ Kinh Bắc, bảo tháp và hai hồ sen' },
  cole: { name: 'Chùa Cổ Lễ', page: 'chua.html?site=cole', roomLabel: 'Cổ Lễ', desc: 'chùa lớn ở Trực Ninh, tượng Phật lớn và gác chuông' },
  phominh: { name: 'Chùa Phổ Minh', page: 'chua.html?site=phominh', roomLabel: 'Phổ Minh', desc: 'chùa cổ ở Nam Định, bảo tháp nhiều tầng, hai hồ sen' },
  keo: { name: 'Chùa Keo', page: 'chua.html?site=keo', roomLabel: 'Keo', desc: 'chùa cổ ở Hưng Yên, gác chuông gỗ nhiều tầng bên hồ' },
  doison: { name: 'Chùa Đọi Sơn', page: 'chua.html?site=doison', roomLabel: 'Đọi Sơn', desc: 'chùa cổ trên núi Đọi ở Duy Tiên, bảo tháp nhiều tầng' },
  badanh: { name: 'Chùa Bà Đanh', page: 'chua.html?site=badanh', roomLabel: 'Bà Đanh', desc: 'chùa cổ bên núi ở Kim Bảng, hai hồ sen, bảo tháp' },
  bichdong: { name: 'Chùa Bích Động', page: 'chua.html?site=bichdong', roomLabel: 'Bích Động', desc: 'chùa dưới chân núi đá ở Ninh Bình, hồ sen' },
  huong: { name: 'Chùa Hương', page: 'chua.html?site=huong', roomLabel: 'Hương', desc: 'chùa trong núi đá, cầu đá bắc qua suối' },
  mia: { name: 'Chùa Mía', page: 'chua.html?site=mia', roomLabel: 'Mía', desc: 'chùa làng cổ ở Sơn Tây, hồ sen và vườn tháp' },
  tayphuong: { name: 'Chùa Tây Phương', page: 'chua.html?site=tayphuong', roomLabel: 'Tây Phương', desc: 'chùa cổ trên đồi ở Thạch Thất, nổi tiếng tượng La Hán' },
  thay: { name: 'Chùa Thầy', page: 'chua.html?site=thay', roomLabel: 'Thầy', desc: 'chùa cổ bên hồ ở Quốc Oai, núi đá và cầu đá' },
  taku: { name: 'Chùa Núi Tà Cú', page: 'chua.html?site=taku', roomLabel: 'Tà Cú', desc: 'chùa trên núi Tà Cú, tượng Phật lớn giữa rừng' },
  truclampn: { name: 'Thiền viện Trúc Lâm Phương Nam', page: 'chua.html?site=truclampn', roomLabel: 'Trúc Lâm Phương Nam', desc: 'thiền viện ở Cần Thơ, hai hồ sen, bảo tháp' },
  phudung: { name: 'Chùa Phù Dung', page: 'chua.html?site=phudung', roomLabel: 'Phù Dung', desc: 'chùa cổ ở Hà Tiên, bên núi và biển' },
  kleang: { name: 'Chùa Kh\'Leang', page: 'chua.html?site=kleang', roomLabel: 'Kh\'Leang', desc: 'chùa Khmer ở Sóc Trăng, màu vàng rực, nhiều tháp' },
  buuphong: { name: 'Chùa Bửu Phong', page: 'chua.html?site=buuphong', roomLabel: 'Bửu Phong', desc: 'chùa trên đồi ở Biên Hòa, bảo tháp, hồ sen' },
  hoikhanh: { name: 'Chùa Hội Khánh', page: 'chua.html?site=hoikhanh', roomLabel: 'Hội Khánh', desc: 'chùa cổ ở Thủ Dầu Một, nhiều cột gỗ chạm khắc' },
  daitue: { name: 'Chùa Đại Tuệ', page: 'chua.html?site=daitue', roomLabel: 'Đại Tuệ', desc: 'chùa xứ Nghệ, cầu đá bắc ngang sông, bảo tháp' },
  khaidoan: { name: 'Chùa Khải Đoan', page: 'chua.html?site=khaidoan', roomLabel: 'Khải Đoan', desc: 'chùa ở Buôn Ma Thuột, hai hồ sen, cây bồ đề' },
  minhthanh: { name: 'Chùa Minh Thành', page: 'chua.html?site=minhthanh', roomLabel: 'Minh Thành', desc: 'chùa trên cao nguyên Pleiku, tượng Phật lớn, hồ sen' },
  cothach: { name: 'Chùa Cổ Thạch', page: 'chua.html?site=cothach', roomLabel: 'Cổ Thạch', desc: 'chùa ven biển, tượng Phật lớn nhìn ra biển' },
  thapthap: { name: 'Chùa Thập Tháp Di Đà', page: 'chua.html?site=thapthap', roomLabel: 'Thập Tháp', desc: 'chùa cổ ở Bình Định, hai bảo tháp, hai hồ sen' },
  chucthanh: { name: 'Chùa Chúc Thánh', page: 'chua.html?site=chucthanh', roomLabel: 'Chúc Thánh', desc: 'chùa cổ ở Hội An, hồ sen và vườn tháp' },
  tudam: { name: 'Chùa Từ Đàm', page: 'chua.html?site=tudam', roomLabel: 'Từ Đàm', desc: 'Tổ đình xứ Huế, hai hồ sen, cây bồ đề cổ thụ' },
  namyet: { name: 'Chùa Nam Yết', page: 'chua.html?site=namyet', roomLabel: 'Nam Yết', desc: 'chùa trên đảo Nam Yết, hải đăng, cột cờ' },
  sonca: { name: 'Chùa Sơn Ca', page: 'chua.html?site=sonca', roomLabel: 'Sơn Ca', desc: 'chùa nhỏ trên đảo san hô, cột cờ, bia chủ quyền' },
};
// các khu dựng kỹ ở miền Nam: mỗi khu một phòng
const SOUTH = [['vinhnghiem', 'vinh-nghiem', 'Vĩnh Nghiêm'], ['chuadoi', 'chua-doi', 'Chùa Dơi'], ['baden', 'ba-den', 'Núi Bà Đen'], ['phatdai', 'phat-dai', 'Phật Đài'],
  ['thienmu', 'thien-mu', 'Thiên Mụ'], ['linhungbb', 'linh-ung', 'Linh Ứng'], ['longson', 'long-son', 'Long Sơn'], ['truclamdl', 'truc-lam', 'Trúc Lâm'],
  ['baidinh', 'bai-dinh', 'Bái Đính'], ['yentu', 'yen-tu', 'Yên Tử'], ['bavang', 'ba-vang', 'Ba Vàng'], ['taythien', 'tay-thien', 'Tây Thiên'],
  ['chuaha', 'chua-ha', 'Chùa Hà'], ['motcot', 'mot-cot', 'Một Cột'], ['tranquoc', 'tran-quoc', 'Trấn Quốc'], ['quansu', 'quan-su', 'Quán Sứ'],
  ['buulong', 'buu-long', 'Bửu Long'], ['vinhtrang', 'vinh-trang', 'Vĩnh Tràng'], ['hoquoc', 'ho-quoc', 'Hộ Quốc'], ['tayan', 'tay-an', 'Tây An'],
  ['giaclam', 'giac-lam', 'Giác Lâm'], ['ngochoang', 'ngoc-hoang', 'Ngọc Hoàng'], ['vnquoctu', 'quoc-tu', 'Quốc Tự'], ['ang', 'chua-ang', 'Chùa Âng'],
  ['linhungnn', 'non-nuoc', 'Non Nước'], ['hanglyson', 'chua-hang', 'Chùa Hang'], ['linhphuoc', 'linh-phuoc', 'Linh Phước'], ['tuhieu', 'tu-hieu', 'Từ Hiếu'], ['hoangsa', 'hoang-sa', 'Hoàng Sa'], ['tslon', 'truong-sa-lon', 'Trường Sa Lớn'], ['songtutay', 'song-tu-tay', 'Song Tử Tây'], ['nuimot', 'nui-mot', 'Núi Một'], ['sonca', 'son-ca', 'Sơn Ca'], ['namyet', 'nam-yet', 'Nam Yết'], ['sinhton', 'sinh-ton', 'Sinh Tồn'], ['tudam', 'tu-dam', 'Từ Đàm'], ['thienan', 'thien-an', 'Thiên Ấn'], ['lang', 'lang', 'Láng'], ['kimlien', 'kim-lien', 'Kim Liên'], ['bada', 'ba-da', 'Bà Đá'], ['tramgian', 'tram-gian', 'Trăm Gian'], ['boda', 'bo-da', 'Bổ Đà'], ['tieuson', 'tieu-son', 'Tiêu Sơn'], ['phuluu', 'phu-luu', 'Phù Lưu'], ['hoayen', 'hoa-yen', 'Hoa Yên'], ['truclamyt', 'truc-lam-yen-tu', 'Trúc Lâm Yên Tử'], ['huongtich', 'huong-tich', 'Hương Tích'], ['baoquoc', 'bao-quoc', 'Báo Quốc'], ['huyenkhong', 'huyen-khong', 'Huyền Không Sơn Thượng'], ['phuocduyen', 'phuoc-duyen', 'Phước Duyên'], ['thienlam', 'thien-lam', 'Thiền Lâm'], ['chuacau', 'chua-cau', 'Chùa Cầu'], ['phuoclam', 'phuoc-lam', 'Phước Lâm'], ['tamthai', 'tam-thai', 'Tam Thai'], ['haitang', 'hai-tang', 'Hải Tạng'], ['linhunbana', 'linh-ung-ba-na', 'Linh Ứng Bà Nà'], ['longkhanh', 'long-khanh', 'Long Khánh'], ['ongnui', 'ong-nui', 'Ông Núi'], ['linhsondl', 'linh-son-da-lat', 'Linh Sơn (Đà Lạt)'], ['vanhanh', 'van-hanh', 'Vạn Hạnh'], ['xaloi', 'xa-loi', 'Xá Lợi'], ['giacvien', 'giac-vien', 'Giác Viên'], ['hoangphap', 'hoang-phap', 'Hoằng Pháp'], ['hoison', 'hoi-son', 'Hội Sơn'], ['phapvan', 'phap-van', 'Pháp Vân'], ['vanduc', 'van-duc', 'Vạn Đức'], ['vanlinh', 'van-linh', 'Vạn Linh'], ['hangchaudoc', 'hang-chau-doc', 'Hang (Châu Đốc)'], ['dau', 'dau', 'Dâu'], ['butthap', 'but-thap', 'Bút Tháp'], ['phattich', 'phat-tich', 'Phật Tích'], ['vinhnghiembg', 'vinh-nghiem-bg', 'Vĩnh Nghiêm (Bắc Giang)'], ['tayyentu', 'tay-yen-tu', 'Tây Yên Tử'], ['caibau', 'cai-bau', 'Cái Bầu'], ['conson', 'con-son', 'Côn Sơn'], ['thanhmai', 'thanh-mai', 'Thanh Mai'], ['duhang', 'du-hang', 'Dư Hàng'], ['tamthanh', 'tam-thanh', 'Tam Thanh'], ['thay', 'thay', 'Thầy'], ['tayphuong', 'tay-phuong', 'Tây Phương'], ['mia', 'mia', 'Mía'], ['huong', 'huong', 'Hương'], ['bichdong', 'bich-dong', 'Bích Động'], ['badanh', 'ba-danh', 'Bà Đanh'], ['doison', 'doi-son', 'Đọi Sơn'], ['keo', 'keo', 'Keo'], ['phominh', 'pho-minh', 'Phổ Minh'], ['cole', 'co-le', 'Cổ Lễ'], ['hoikhanh', 'hoi-khanh', 'Hội Khánh'], ['buuphong', 'buu-phong', 'Bửu Phong'], ['kleang', 'kleang', 'Kh\'Leang'], ['phudung', 'phu-dung', 'Phù Dung'], ['truclampn', 'truc-lam-phuong-nam', 'Trúc Lâm Phương Nam'], ['taku', 'ta-cu', 'Tà Cú'], ['chucthanh', 'chuc-thanh', 'Chúc Thánh'], ['thapthap', 'thap-thap', 'Thập Tháp'], ['cothach', 'co-thach', 'Cổ Thạch'], ['minhthanh', 'minh-thanh', 'Minh Thành'], ['khaidoan', 'khai-doan', 'Khải Đoan'], ['daitue', 'dai-tue', 'Đại Tuệ']];
export const ROOMS = [
  ...Array.from({ length: 2 }, (_, i) => ({ id: `chanh-dien-${i + 1}`, name: `Chánh điện ${i + 1}`, site: 'ammay' })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `tam-chuc-${i + 1}`, name: `Tam Chúc ${i + 1}`, site: 'tamchuc' })),
  ...SOUTH.map(([site, id, name]) => ({ id: `${id}-1`, name: `${name} 1`, site })),
];
export const siteRooms = (site) => ROOMS.filter((r) => r.site === site);
// đường dẫn tới một phòng (sang trang của khu đó)
export const roomUrl = (r) => `${SITES[r.site].page}${SITES[r.site].page.includes('?') ? '&' : '?'}room=${r.id}`;

export async function fetchMerit() {
  try {
    const r = await fetch('/api/merit', { cache: 'no-store' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function fetchRooms() {
  try {
    const r = await fetch('/api/rooms', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

class Net {
  constructor(ws) {
    this.ws = ws;
    this.handlers = {};
    this.welcome = null;
    ws.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') this.welcome = m;
      (this.handlers[m.t] || []).forEach((f) => f(m));
    };
    ws.onclose = () => (this.handlers.close || []).forEach((f) => f());
  }
  on(type, fn) {
    (this.handlers[type] ||= []).push(fn);
  }
  send(obj) {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }
  close() {
    this.handlers = {};
    this.ws.close();
  }
}

// Trả về Net khi đã nhận 'welcome', hoặc null nếu không kết nối được
// timeout rộng: lúc mới mở trang, máy yếu còn bận dựng cảnh 3D
export function connect({ room, name, robe, sandals, uid }, timeout = 8000) {
  return new Promise((resolve) => {
    if (!/^https?:$/.test(location.protocol)) return resolve(null);
    let ws;
    try {
      ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    } catch {
      return resolve(null);
    }
    const net = new Net(ws);
    const timer = setTimeout(() => { ws.close(); resolve(null); }, timeout);
    ws.onopen = () => net.send({ t: 'hello', room, name, robe, sandals, uid });
    ws.onerror = () => { clearTimeout(timer); resolve(null); };
    net.on('welcome', () => { clearTimeout(timer); resolve(net); });
    net.on('full', () => { clearTimeout(timer); resolve(null); });
  });
}
