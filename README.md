# Am Mây — Chùa 3D trực tuyến

Một ngôi chùa 3D trên web, dùng được trên máy tính và điện thoại. Mỗi người là một nhân vật nhỏ mặc áo tràng trong chánh điện: đi lại, ngồi bồ đoàn, chắp tay chào nhau, lạy Phật, lần tràng hạt 108 hạt, nghe tụng kinh, thỉnh chuông và đánh trống.

Ý tưởng lấy cảm hứng từ sansatemple.com, nhưng toàn bộ mã, mô hình 3D, giao diện và âm thanh đều được làm mới, theo phong cách chùa Việt (cột sơn son, hoành phi, câu đối, đèn lồng, chuông, trống, mâm ngũ quả).

## Chạy thử

Cần Node.js 18 trở lên.

```bash
npm install
```

```bash
npm start
```

Mở http://localhost:3000. Mở thêm một tab hoặc dùng điện thoại cùng mạng Wi-Fi (http://IP-máy-tính:3000) để thấy nhiều người cùng lúc.

Không có máy chủ (ví dụ mở thẳng file `public/index.html` hoặc đưa thư mục `public/` lên hosting tĩnh), trang vẫn chạy ở **chế độ ngoại tuyến**, với khách mô phỏng ngồi trong chánh điện.

## Cấu trúc

```
server.js            Máy chủ Node: phục vụ file tĩnh + WebSocket theo phòng (/ws, /api/rooms)
public/
  index.html         Giao diện (HUD, hộp thoại, tràng hạt, màn hình chờ)
  css/style.css      Kiểu dáng, responsive cho điện thoại (safe-area, bottom sheet)
  js/main.js         Khởi động, camera, điều khiển chạm/chuột/phím, mạng, giao diện
  js/world.js        Dựng chánh điện, tượng Phật, bàn thờ, chuông trống, cảnh tre núi, ánh sáng
  js/buddha.js       Tượng Phật trong chánh điện (tạc bằng SDF), công cụ tạc dùng chung
  js/quanam.js       Tượng Quan Âm đứng trên tòa sen (dát vàng, trong điện Quan Âm)
  js/lahan.js        Tượng La Hán đá (ba tư thế, vẽ hàng loạt)
  js/dog.js          Chó nhỏ của nhà chùa (dáng, đi, ngồi, vẫy đuôi)
  js/sandals.js      Dép và hàng dép trên thềm
  js/leaves.js       Lá rơi trên sân và chổi tre quét lá
  js/karma.js        Quy tắc điểm phước / nghiệp
  js/lunar.js        Âm lịch Việt Nam (UTC+7): biết hôm nay là mùng một hay ngày Rằm
  js/statues.js      Vị trí và mã tượng La Hán (máy chủ và trình duyệt dùng chung để đồng bộ bụi bám)
  js/avatar.js       Nhân vật chibi và các tư thế: đi, ngồi, chắp tay, lạy
  js/audio.js        Âm thanh tổng hợp bằng Web Audio (không cần file mp3)
  js/beads.js        Màn hình lần tràng hạt 108 hạt
  js/net.js          Kết nối WebSocket
  js/textures.js     Texture vẽ bằng canvas (sàn gỗ, hoành phi, hào quang…)
```

## Tính năng

| Tính năng | Cách dùng |
|---|---|
| Chánh điện | Bố cục chữ Đinh kiểu chùa Việt: tiền đường phía trước mái chồng diêm hai tầng, trên bờ nóc có lưỡng long chầu nguyệt; chánh điện phía sau một mái lớn. Mặt mái cong lõm lợp ngói, bốn góc đầu đao cong vút; hiên có hàng cột son, hoành phi ĐẠI HÙNG BẢO ĐIỆN, nền có bệ đá |
| Vào chánh điện | Nhân vật đi từ sân lên thềm, cởi dép, quay lại sắp dép ngay ngắn (mũi hướng ra sân) rồi bước vào; chạm để bỏ qua. Mỗi người trong chánh điện có một đôi dép trên thềm, khi về thì mang dép đi ra |
| Đi lại | Chạm / nhấp sàn, hoặc W A S D |
| Nhìn toàn cảnh | Nút ba lớp ở góc phải (hoặc phím V) đưa camera lên cao nhìn cả khuôn viên. Kéo để dời góc nhìn, chụm hai ngón / lăn chuột để phóng to, chuột phải kéo (hoặc giữ Shift) để xoay. Vẫn chạm / nhấp xuống đất để nhân vật đi tới, W A S D vẫn dùng được; mũi tên vàng chỉ chỗ mình đứng. Bấm lại nút, phím V hoặc Esc để trở về |
| Chó nhà chùa | Bốn chú chó nhỏ của các sư thầy, chú tiểu (Vàng, Mực, Bông, Lu) đi lang thang quanh các sân, nằm nghỉ, thấy người thì chạy lại ngồi vẫy đuôi, thỉnh thoảng sủa khẽ. Chạm vào chó (hoặc tên của nó) để xoa đầu. Mỗi máy tự cho chó đi lại, không đồng bộ giữa người chơi; đồ họa Nhẹ có ba chú |
| Ngồi | Chạm vào bồ đoàn trống |
| Nhìn quanh, phóng to | Kéo; lăn chuột hoặc chụm hai ngón |
| Chat | Gõ vào ô chat ở góc dưới bên trái (máy tính: nhấn Enter để mở ô chat, Enter để gửi, Esc để thoát). Lời chat hiện thành bong bóng trên đầu mình trong 5 giây, mọi người trong cùng chánh điện đều thấy. Tối đa 80 ký tự, mỗi lần cách nhau ít nhất 1 giây |
| Chắp tay | Nút “Chắp tay” hoặc chạm vào người khác để chào |
| Lạy Phật | Nút “Lạy Phật” (có tiếng chuông) |
| Sân ngoài chánh điện | Chạm xuống sân để ra ngoài: nhân vật tự đến chỗ để dép trên thềm, mang dép rồi ra sân; chạm vào trong chánh điện để vào lại (tự cởi dép, xếp ngay ngắn). Ngoài sân có hồ sen có cá koi, đèn đá, bụi cây, bồn hoa, cây hoa sứ và một cây đa cổ thụ (thân nhiều gốc quấn xoắn, rễ bạnh, rễ phụ buông, tán lá lay nhẹ; nhân vật tự đi vòng gốc cây). Khi đang ở ngoài sân, nút Thắp nhang sẽ đưa bạn vào điện Quan Âm dâng nhang |
| Khuôn viên và bản đồ | Từ sân chùa có trục đường chính lát đá, hai bên đèn đá và cây xanh, dẫn ra cổng Tam Quan (cửa giữa hai tầng mái có biển AM MÂY, hai cửa bên, sư tử đá, tường bao) và sân trước cổng. Nút bản đồ ở góc phải mở sơ đồ chùa: thấy mình và mọi người đang ở đâu, chạm tên một nơi (Chánh điện, Cây đa, Tháp 13 tầng, Hành lang La Hán, Giếng Ngọc, Gác chuông, Điện Quan Âm, Bậc thang lên đồi, Điện Tam Thế, Cổng Tam Quan) để đi nhanh tới đó; tự mang hoặc cởi dép khi cần |
| Hành lang La Hán, hồ sen, giếng Ngọc | Hai dãy hành lang mái ngói cột son chạy dọc hai bên trục đường, mỗi dãy hai hàng tượng La Hán đá với ba tư thế (thiền định, giơ tay, chống gối cười); vào từ phía sân chùa hoặc lối ngang gần cổng. Giữa trục đường và hành lang là hai hồ sen; giữa trục đường là giếng Ngọc tròn có lan can đá, đi vòng quanh được. Nhân vật tự tìm đường giữa các khu và đi vòng qua giếng, chân tháp. Đồ họa Nhẹ chỉ dựng hàng tượng trước |
| Lau tượng La Hán | Tượng hàng trước hai dãy hành lang bám bụi dần (màu xỉn tối hơn), mọi người trong cùng chánh điện thấy chung. Chạm vào một tượng còn bụi: nhân vật đi tới lối đi trước tượng, cầm khăn vàng lau vòng tròn khoảng 3 giây, tượng sáng sạch trở lại và lấp lánh. Người khác thấy bạn đang lau. Khi ngoại tuyến, khách mô phỏng dạo hành lang cũng thỉnh thoảng lau tượng |
| Cảnh xa | Quanh chùa là núi đá vôi vách dựng đứng, đỉnh phủ cây; phía nam có ruộng lúa ô bàn cờ và dòng sông uốn lượn. Khách mô phỏng thỉnh thoảng đi tham quan: dạo hành lang La Hán, ngắm giếng Ngọc, thỉnh đại hồng chung, thắp nhang ở điện Quan Âm và điện Tam Thế, lên tháp, ra cổng Tam Quan rồi về chánh điện |
| Điện Tam Thế trên đồi | Sau chánh điện có lối đi dọc hai bên dẫn ra sân sau, từ đó 24 bậc thang đá có lan can dẫn lên nền đồi cao 8 m. Trên nền đồi, cách mép bậc thang một sân rộng, là điện Tam Thế mái chồng diêm với ba tượng Phật lớn (quá khứ, hiện tại, vị lai), nến, lư hương giữa điện và bồ đoàn; lưng điện tựa vào núi đá vôi. Hai bên điện có hai thác nước đổ từ vách núi xuống hồ, chảy thành suối ra mép nền rồi đổ tiếp xuống hồ nhỏ dưới chân bậc thang; lại gần nghe rõ tiếng thác. Ở trên nền đồi thì nút Lạy Phật và Thắp nhang dâng lên Tam Thế Phật |
| Gác chuông, điện Quan Âm | Từ sân chùa có lối sang hai sân bên. Sân tây có gác chuông hai tầng mái, tầng trên treo đại hồng chung. Lên được gác chuông: trong tầng dưới có cầu thang gỗ (phía tây, có tay vịn) dẫn lên sàn gác, quanh lỗ cầu thang có lan can; trên gác đi lại quanh quả chuông được. Chạm vào gác chuông để leo cầu thang lên gác, tới đầu chày, chắp tay rồi nắm dây ngả người kéo chày lùi ra và buông cho chày lao vào chuông (tiếng ngân rất trầm vang khắp chùa, càng xa càng nhỏ; tính điểm như thỉnh chuông). Chạm xuống sân để xuống gác. Khách mô phỏng cũng lên gác thỉnh chuông hoặc đứng chắp tay ngắm chuông. Sân đông có điện Quan Âm mái chồng diêm, trong điện có tượng Quan Âm dát vàng, nến, lư hương và bồ đoàn; ở trong điện thì nút Lạy Phật và Thắp nhang dâng lên Quan Âm |
| Tháp 13 tầng | Phía bên kia sân, đối diện cây đa, có tháp bát giác 13 tầng với thảm cỏ, đường đá, đèn đá, chậu cây cảnh, cây tùng. Chạm vào tháp để vào cửa và lên tầng 13: điện thờ mở bốn phía thờ xá lợi Phật — viên ngọc tròn phát sáng đặt trên đài sen vàng, có hào quang tỏa nhịp nhàng, vòng sáng xoay chậm và đốm sáng li ti, ban đêm sáng rực cả tầng tháp; cùng nến và lư hương. Có thể lễ xá lợi, thắp nhang và ngắm toàn cảnh chùa. Chạm xuống sân hoặc vào chánh điện để xuống tháp. Ban đêm cửa sổ các tầng sáng đèn |
| Quét sân chùa | Lá đa rụng dần trên sân, mọi người trong cùng chánh điện thấy chung. Chạm vào giá chổi tre ở góc sân (cạnh thềm, gần đèn đá) để đến lấy chổi; cầm chổi đi tới đâu lá bay đi tới đó. Chạm lại vào giá để cất chổi; đi vào chánh điện thì chổi tự được cất |
| Lấy dép (đùa vui) | Bấm vào dép của người khác trên thềm để lấy đi một chiếc. Người bị mất dép vẫn đi lại trong chánh điện bình thường; khi muốn ra sân sẽ bị chặn với thông báo "Phật tử đã bị mất dép" và phải chờ 10 giây (chỉ bắt đầu đếm khi định ra ngoài) để dép được trả lại |
| Thắp nhang | Nút “Thắp nhang”: chọn 1 hoặc 3 nén, viết lời nguyện riêng (không gửi đi). Nhân vật bước lên bàn thờ, vái lạy, cắm nhang; nhang cháy ngắn dần khoảng 3 phút, mọi người cùng thấy |
| Công đức | Nút “Công đức” hoặc chạm vào thùng công đức cạnh bàn thờ: nhân vật bước tới, chắp tay, bỏ phong bì đỏ vào thùng. Mỗi người 3 lần/ngày (theo giờ Việt Nam), có thể ẩn danh, lời hồi hướng chỉ mình mình thấy. Sổ công đức và tổng lượt trong ngày dùng chung cả chùa. Mang ý nghĩa tượng trưng, không dùng tiền thật |
| Hồ sơ Phật tử | Chạm vào pháp danh trên đầu một người (hoặc tên mình, hoặc Cài đặt → Hồ sơ của tôi) để xem điểm phước nghiệp (phước trừ nghiệp), thống kê và lịch sử. Người mới bắt đầu từ 0 điểm |
| Ngày và đêm | Bầu trời, nắng, sương và ánh sáng đổi theo giờ Việt Nam thật (UTC+7): bình minh khoảng 5 giờ 30, hoàng hôn khoảng 18 giờ, ban đêm có trăng sao, đèn lồng và đèn trong chánh điện sáng lên. Xem thử một giờ bất kỳ bằng cách thêm `?gio=20` (hoặc `&gio=5.5`) vào địa chỉ trang |
| Ngày Rằm, mùng một | Theo âm lịch Việt Nam thật (giờ UTC+7). Góc trái hiện huy hiệu trăng với tên ngày lễ (Rằm tháng Giêng, Phật Đản, Vu Lan và Rằm tháng Mười có tên riêng); chạm vào để xem lời nhắc. Hoa đăng hình sen trôi chậm trên ba hồ sen, ban đêm sáng ánh nến; hai bên trục đường dựng cột cờ Phật giáo ngũ sắc tung bay, dây cờ đuôi nheo năm màu chăng ngang và dọc đường. Chùa đông hơn (khách mô phỏng lấp tới 24 người khi trực tuyến, 30–42 người khi ngoại tuyến), khách hay đi tham quan và ra bờ hồ ngắm hoa đăng. Điểm phước nhân đôi cả ngày. Xem thử bằng cách thêm `?am=15` (Rằm) hoặc `?am=1` (mùng một) vào địa chỉ trang; khi trực tuyến máy chủ vẫn tính điểm theo ngày thật |
| Tràng hạt | Vuốt xuống / chạm / phím cách; đếm 108 hạt, lưu số hạt mỗi ngày |
| Tụng kinh | “Nam mô A Di Đà Phật” với mõ, chuông, chữ chạy theo nhịp |
| Thỉnh chuông, đánh trống | Chạm vào chuông (trái) hoặc trống (phải) bàn thờ |
| Nhiều phòng | 8 chánh điện, chọn ở nút tên chùa góc trái |
| Chụp ảnh | Nút máy ảnh, tải về file PNG |
| Cài đặt | Âm lượng từng loại, phát khi chuyển tab, đồ họa Nhẹ/Đẹp, đổi tên |

## Khu Tam Chúc (đang làm, đợt 1)

Khu thứ hai, trang riêng `tamchuc.html`, phỏng theo không khí chùa Tam Chúc: hồ nước lớn giữa núi đá vôi, đảo đá nhô lên mặt hồ, bờ kè lát đá có lan can và đèn đá, cổng Tam Quan sát mép hồ (mái hai tầng, lưỡng long chầu nguyệt, biển TAM CHÚC, sư tử đá, tường bao) mở ra một sân lớn lát đá có đỉnh đồng ở giữa. Trời sáng tối theo giờ Việt Nam (xem thử bằng `?gio=20`).

- Chọn khu trong hộp chọn phòng (nút tên chùa góc trái): 8 phòng Chánh điện của khu Am Mây và 4 phòng Tam Chúc. Pháp danh, áo, dép và điểm phước dùng chung ở mọi khu.
- Đã có: đi lại (chạm đất / W A S D), chắp tay, lạy Phật, chat, gặp người cùng phòng.
- Bến thuyền và đi thuyền: bến gỗ chìa ra hồ giữa bờ kè; ba thuyền gỗ có mái che cong, cô lái đội nón lá chèo ở đuôi. Thuyền chạy theo giờ chung (mỗi vòng 150 giây: đậu bến 24 giây rồi đi một vòng quanh các đảo) nên mọi người thấy thuyền ở cùng chỗ. Đứng trên bến bấm "Lên thuyền" (hoặc chạm vào thuyền); thuyền về bến thì tự lên bờ. Người khác thấy bạn ngồi trên thuyền nào.
- Vườn kinh: phía tây sân lớn, qua cổng đá "VƯỜN KINH". 32 cột đá khắc chữ (16 cột Bát Nhã Tâm Kinh âm Hán-Việt, 16 cột lời dạy ngắn), đầu cột hoa sen; cuối vườn có phù điêu sáu cảnh đời Đức Phật. Chạm vào cột để đi tới đọc; đọc xong chắp tay hồi hướng được +1 phước (tối đa 16 lần/ngày).
- Sẽ làm ở các đợt sau: ba điện trên sườn núi (Quan Âm, Pháp Chủ, Tam Thế), bản đồ, đi nhanh, khách mô phỏng.

Mã nguồn: `public/js/tamchuc/` (cảnh và điều khiển của khu), `public/js/arch.js` (mái cong, núi đá vôi dùng chung).

## Giọng tụng kinh

Khi bấm “Nghe tụng kinh”, website tự chọn giọng tốt nhất có sẵn (đổi được trong Cài đặt → Giọng tụng):

1. **Bản ghi âm**: nếu có file `public/audio/tung-kinh.mp3`, website phát lặp file này. Đây là cách cho giọng tụng thật, giống nhau trên mọi thiết bị. Nên dùng bản tự thu hoặc bản được phép sử dụng.
2. **Giọng đọc tiếng Việt của thiết bị**: đọc “Nam mô A Di Đà Phật” chậm rãi theo nhịp mõ, phụ đề sáng theo từng chữ. Có sẵn trên hầu hết điện thoại Android, iPhone/iPad, trình duyệt Edge (giọng HoaiMy, NamMinh), Safari trên Mac. Chrome trên Windows chỉ có khi máy cài gói giọng nói tiếng Việt (Cài đặt Windows → Thời gian và ngôn ngữ → Giọng nói).
3. **Giọng ngân tổng hợp**: dùng khi thiết bị không có hai lựa chọn trên.

## Điểm phước / nghiệp

Quy tắc nằm trong `public/js/karma.js` (máy chủ và trình duyệt dùng chung). Mỗi việc chỉ được tính điểm một số lần trong ngày (giờ Việt Nam). Ngày mùng một và ngày Rằm âm lịch, điểm phước của mọi việc được nhân đôi (ghi "· ngày Rằm ×2" hoặc "· mùng một ×2" trong lịch sử); điểm nghiệp và số lần tối đa mỗi ngày giữ nguyên:

| Việc | Điểm | Tối đa mỗi ngày |
|---|---|---|
| Vào chùa | +2 phước | 1 |
| Lạy Phật | +1 phước | 20 |
| Chắp tay chào một người (bấm Chắp tay khi ở gần ai đó, hoặc chạm vào người đó) | +1 phước | 20 |
| Thắp nhang | +3 phước | 5 |
| Góp công đức | +10 phước | 3 |
| Lần tròn chuỗi 108 hạt | +5 phước | 10 |
| Nghe tụng kinh (ghi từng phút vào hồ sơ, đủ mỗi 10 phút thì cộng điểm) | +2 phước | 12 |
| Thỉnh chuông, đánh trống | +1 phước | 5 |
| Thỉnh chuông dồn dập (5 lần trong 30 giây) | +2 nghiệp | 3 |
| Quét lá sân chùa (mỗi 15 lá) | +2 phước | 10 |
| Lau sạch một tượng La Hán | +1 phước | 15 |
| Đọc một cột kinh ở vườn kinh (khu Tam Chúc) | +1 phước | 16 |
| Lấy dép của người khác | +1 nghiệp | 20 |

## Lưu trữ dữ liệu (hồ sơ, sổ công đức)

- Có biến môi trường `DATABASE_URL` → máy chủ lưu vào **Postgres** (bảng `profiles` và `kv` tự tạo khi chạy lần đầu). Dùng được với Neon, Supabase hoặc bất kỳ Postgres nào.
- Không có `DATABASE_URL` (hoặc không kết nối được) → lưu vào file trong `data/` (đổi bằng `DATA_DIR`). Trên Render gói miễn phí, file này mất mỗi khi máy chủ khởi động lại, nên khi chạy thật hãy dùng Postgres.
- Khi ngoại tuyến (không có máy chủ), hồ sơ chỉ lưu trên trình duyệt.

### Tạo cơ sở dữ liệu miễn phí trên Neon

1. Đăng ký tại https://neon.tech (có thể đăng nhập bằng GitHub).
2. Tạo project, chọn vùng **AWS Asia Pacific (Singapore)** cho gần Việt Nam.
3. Ở trang project, bấm **Connect**, sao chép chuỗi kết nối dạng `postgresql://…@….neon.tech/neondb?sslmode=require`.
4. Vào Render → dịch vụ `am-may` → **Environment** → thêm biến `DATABASE_URL` với chuỗi vừa chép → **Save**. Render tự khởi động lại.
5. Xem **Logs** trên Render, thấy dòng `Lưu trữ: cơ sở dữ liệu Postgres` là xong.

Không đưa chuỗi kết nối vào code hay GitHub — nó chứa mật khẩu cơ sở dữ liệu.

## Đưa lên mạng

Máy chủ cần hỗ trợ WebSocket, ví dụ Render, Railway, Fly.io hoặc một VPS:

- Lệnh chạy: `npm start`
- Cổng: đọc từ biến môi trường `PORT` (mặc định 3000)
- Dùng HTTPS thì trang tự kết nối `wss://`

Nếu chỉ cần bản ngoại tuyến, đưa thư mục `public/` lên GitHub Pages, Netlify hoặc Vercel là đủ.

## Ghi chú

- Three.js 0.170 được tải từ CDN jsDelivr qua import map, không cần bước build.
- Tối ưu cho điện thoại: kiến trúc đứng yên được gộp theo vật liệu lúc dựng cảnh (ít lệnh vẽ hơn); tượng nặng (tượng Phật, Quan Âm, La Hán) chỉ vẽ khi người chơi ở gần; các tượng Phật sao chép dùng bản lưới thưa hơn. Đồ họa Nhẹ (mặc định trên điện thoại) tắt bóng đổ, chỉ dựng một hàng tượng La Hán và giảm độ phân giải.
- Khi chánh điện trực tuyến còn vắng (dưới 14 người), vài khách mô phỏng ngồi cùng cho ấm cúng. Họ nhường chỗ khi có người thật vào. Số người ở góc phải luôn là số người thật.
- Mỗi phòng tối đa 120 người; máy chủ giới hạn tốc độ tin nhắn và làm sạch tên hiển thị.
