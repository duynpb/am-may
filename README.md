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
  js/quanam.js       Tượng Quan Âm đứng trên tòa sen ở khu cầu nguyện ngoài sân
  js/lahan.js        Tượng La Hán đá (ba tư thế, vẽ hàng loạt)
  js/sandals.js      Dép và hàng dép trên thềm
  js/leaves.js       Lá rơi trên sân và chổi tre quét lá
  js/karma.js        Quy tắc điểm phước / nghiệp
  js/avatar.js       Nhân vật chibi và các tư thế: đi, ngồi, chắp tay, lạy
  js/audio.js        Âm thanh tổng hợp bằng Web Audio (không cần file mp3)
  js/beads.js        Màn hình lần tràng hạt 108 hạt
  js/net.js          Kết nối WebSocket
  js/textures.js     Texture vẽ bằng canvas (sàn gỗ, hoành phi, hào quang…)
```

## Tính năng

| Tính năng | Cách dùng |
|---|---|
| Vào chánh điện | Nhân vật đi từ sân lên thềm, cởi dép, quay lại sắp dép ngay ngắn (mũi hướng ra sân) rồi bước vào; chạm để bỏ qua. Mỗi người trong chánh điện có một đôi dép trên thềm, khi về thì mang dép đi ra |
| Đi lại | Chạm / nhấp sàn, hoặc W A S D |
| Ngồi | Chạm vào bồ đoàn trống |
| Nhìn quanh, phóng to | Kéo; lăn chuột hoặc chụm hai ngón |
| Chat | Gõ vào ô chat ở góc dưới bên trái (máy tính: nhấn Enter để mở ô chat, Enter để gửi, Esc để thoát). Lời chat hiện thành bong bóng trên đầu mình trong 5 giây, mọi người trong cùng chánh điện đều thấy. Tối đa 80 ký tự, mỗi lần cách nhau ít nhất 1 giây |
| Chắp tay | Nút “Chắp tay” hoặc chạm vào người khác để chào |
| Lạy Phật | Nút “Lạy Phật” (có tiếng chuông) |
| Khu cầu nguyện ngoài sân | Chạm xuống sân để ra ngoài: nhân vật tự đến chỗ để dép trên thềm, mang dép rồi ra sân; chạm vào trong chánh điện để vào lại (tự cởi dép, xếp ngay ngắn). Ngoài sân có tượng Quan Âm Bồ Tát đứng trên tòa sen, lư hương đá, hồ sen có cá koi, đèn đá, bụi cây, bồn hoa, cây hoa sứ. Khi đang ở ngoài sân, nút Thắp nhang sẽ dâng nhang lên Quan Âm |
| Khuôn viên và bản đồ | Từ sân chùa có trục đường chính lát đá, hai bên đèn đá và cây xanh, dẫn ra cổng Tam Quan (cửa giữa hai tầng mái có biển AM MÂY TỰ, hai cửa bên, sư tử đá, tường bao) và sân trước cổng. Nút bản đồ ở góc phải mở sơ đồ chùa: thấy mình và mọi người đang ở đâu, chạm tên một nơi (Chánh điện, Sân Quan Âm, Tháp 13 tầng, Hành lang La Hán, Giếng Ngọc, Gác chuông, Điện Quan Âm, Cổng Tam Quan) để đi nhanh tới đó; tự mang hoặc cởi dép khi cần |
| Hành lang La Hán, hồ sen, giếng Ngọc | Hai dãy hành lang mái ngói cột son chạy dọc hai bên trục đường, mỗi dãy hai hàng tượng La Hán đá với ba tư thế (thiền định, giơ tay, chống gối cười); vào từ phía sân chùa hoặc lối ngang gần cổng. Giữa trục đường và hành lang là hai hồ sen; giữa trục đường là giếng Ngọc tròn có lan can đá, đi vòng quanh được. Nhân vật tự tìm đường giữa các khu và đi vòng qua giếng, bệ tượng Quan Âm, chân tháp. Đồ họa Nhẹ chỉ dựng hàng tượng trước |
| Gác chuông, điện Quan Âm | Từ sân chùa có lối sang hai sân bên. Sân tây có gác chuông hai tầng mái, tầng trên treo đại hồng chung: chạm vào gác chuông để đến chân gác, chắp tay rồi thỉnh chuông (chày gỗ lùi ra rồi lao vào, tiếng ngân rất trầm vang khắp chùa, càng xa càng nhỏ; tính điểm như thỉnh chuông). Sân đông có điện Quan Âm mái chồng diêm, trong điện có tượng Quan Âm dát vàng, nến, lư hương và bồ đoàn; ở trong điện thì nút Lạy Phật và Thắp nhang dâng lên Quan Âm |
| Tháp 13 tầng | Phía bên kia sân, đối diện tượng Quan Âm, có tháp bát giác 13 tầng với thảm cỏ, đường đá, đèn đá, chậu cây cảnh, cây tùng. Chạm vào tháp để vào cửa và lên tầng 13: điện thờ mở bốn phía có tượng Phật như trong chánh điện, nến và lư hương; có thể lạy Phật, thắp nhang và ngắm toàn cảnh chùa. Chạm xuống sân hoặc vào chánh điện để xuống tháp. Ban đêm cửa sổ các tầng sáng đèn |
| Quét sân chùa | Lá rụng dần trên sân, mọi người trong cùng chánh điện thấy chung. Chạm vào giá chổi tre ở góc sân (cạnh thềm, gần đèn đá) để đến lấy chổi; cầm chổi đi tới đâu lá bay đi tới đó. Chạm lại vào giá để cất chổi; đi vào chánh điện thì chổi tự được cất |
| Lấy dép (đùa vui) | Bấm vào dép của người khác trên thềm để lấy đi một chiếc. Người bị mất dép vẫn đi lại trong chánh điện bình thường; khi muốn ra sân sẽ bị chặn với thông báo "Phật tử đã bị mất dép" và phải chờ 10 giây (chỉ bắt đầu đếm khi định ra ngoài) để dép được trả lại |
| Thắp nhang | Nút “Thắp nhang”: chọn 1 hoặc 3 nén, viết lời nguyện riêng (không gửi đi). Nhân vật bước lên bàn thờ, vái lạy, cắm nhang; nhang cháy ngắn dần khoảng 3 phút, mọi người cùng thấy |
| Công đức | Nút “Công đức” hoặc chạm vào thùng công đức cạnh bàn thờ: nhân vật bước tới, chắp tay, bỏ phong bì đỏ vào thùng. Mỗi người 3 lần/ngày (theo giờ Việt Nam), có thể ẩn danh, lời hồi hướng chỉ mình mình thấy. Sổ công đức và tổng lượt trong ngày dùng chung cả chùa. Mang ý nghĩa tượng trưng, không dùng tiền thật |
| Hồ sơ Phật tử | Chạm vào pháp danh trên đầu một người (hoặc tên mình, hoặc Cài đặt → Hồ sơ của tôi) để xem điểm phước nghiệp (phước trừ nghiệp), thống kê và lịch sử. Người mới bắt đầu từ 0 điểm |
| Ngày và đêm | Bầu trời, nắng, sương và ánh sáng đổi theo giờ Việt Nam thật (UTC+7): bình minh khoảng 5 giờ 30, hoàng hôn khoảng 18 giờ, ban đêm có trăng sao, đèn lồng và đèn trong chánh điện sáng lên. Xem thử một giờ bất kỳ bằng cách thêm `?gio=20` (hoặc `&gio=5.5`) vào địa chỉ trang |
| Tràng hạt | Vuốt xuống / chạm / phím cách; đếm 108 hạt, lưu số hạt mỗi ngày |
| Tụng kinh | “Nam mô A Di Đà Phật” với mõ, chuông, chữ chạy theo nhịp |
| Thỉnh chuông, đánh trống | Chạm vào chuông (trái) hoặc trống (phải) bàn thờ |
| Nhiều phòng | 8 chánh điện, chọn ở nút tên chùa góc trái |
| Chụp ảnh | Nút máy ảnh, tải về file PNG |
| Cài đặt | Âm lượng từng loại, phát khi chuyển tab, đồ họa Nhẹ/Đẹp, đổi tên |

## Giọng tụng kinh

Khi bấm “Nghe tụng kinh”, website tự chọn giọng tốt nhất có sẵn (đổi được trong Cài đặt → Giọng tụng):

1. **Bản ghi âm**: nếu có file `public/audio/tung-kinh.mp3`, website phát lặp file này. Đây là cách cho giọng tụng thật, giống nhau trên mọi thiết bị. Nên dùng bản tự thu hoặc bản được phép sử dụng.
2. **Giọng đọc tiếng Việt của thiết bị**: đọc “Nam mô A Di Đà Phật” chậm rãi theo nhịp mõ, phụ đề sáng theo từng chữ. Có sẵn trên hầu hết điện thoại Android, iPhone/iPad, trình duyệt Edge (giọng HoaiMy, NamMinh), Safari trên Mac. Chrome trên Windows chỉ có khi máy cài gói giọng nói tiếng Việt (Cài đặt Windows → Thời gian và ngôn ngữ → Giọng nói).
3. **Giọng ngân tổng hợp**: dùng khi thiết bị không có hai lựa chọn trên.

## Điểm phước / nghiệp

Quy tắc nằm trong `public/js/karma.js` (máy chủ và trình duyệt dùng chung). Mỗi việc chỉ được tính điểm một số lần trong ngày (giờ Việt Nam):

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
- Khi chánh điện trực tuyến còn vắng (dưới 14 người), vài khách mô phỏng ngồi cùng cho ấm cúng. Họ nhường chỗ khi có người thật vào. Số người ở góc phải luôn là số người thật.
- Mỗi phòng tối đa 120 người; máy chủ giới hạn tốc độ tin nhắn và làm sạch tên hiển thị.
