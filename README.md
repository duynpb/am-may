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
  js/avatar.js       Nhân vật chibi và các tư thế: đi, ngồi, chắp tay, lạy
  js/audio.js        Âm thanh tổng hợp bằng Web Audio (không cần file mp3)
  js/beads.js        Màn hình lần tràng hạt 108 hạt
  js/net.js          Kết nối WebSocket
  js/textures.js     Texture vẽ bằng canvas (sàn gỗ, hoành phi, hào quang…)
```

## Tính năng

| Tính năng | Cách dùng |
|---|---|
| Đi lại | Chạm / nhấp sàn, hoặc W A S D |
| Ngồi | Chạm vào bồ đoàn trống |
| Nhìn quanh, phóng to | Kéo; lăn chuột hoặc chụm hai ngón |
| Chắp tay | Nút “Chắp tay” hoặc chạm vào người khác để chào |
| Lạy Phật | Nút “Lạy Phật” (có tiếng chuông) |
| Tràng hạt | Vuốt xuống / chạm / phím cách; đếm 108 hạt, lưu số hạt mỗi ngày |
| Tụng kinh | “Nam mô A Di Đà Phật” với mõ, chuông, chữ chạy theo nhịp |
| Thỉnh chuông, đánh trống | Chạm vào chuông (trái) hoặc trống (phải) bàn thờ |
| Nhiều phòng | 8 chánh điện, chọn ở nút tên chùa góc trái |
| Chụp ảnh | Nút máy ảnh, tải về file PNG |
| Cài đặt | Âm lượng từng loại, phát khi chuyển tab, đồ họa Nhẹ/Đẹp, đổi tên |

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
