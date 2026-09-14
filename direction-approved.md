# Gate: hướng thiết kế đã được khách chọn

## Bối cảnh
- Dự án: blog du lịch cá nhân self-host (tên tạm 「Chân Trời」, đổi được trong trang quản trị).
- Đã làm 3 phương án trang chủ (mockup HTML ảnh nhúng base64, thư mục `design-demos/`):
  1. `phuong-an-1-pixel.html` — Pixel-Game Side-Scroller (xúc xắc 28 % 20, bảng "网页风格库" #9) — **không hoàn thành** (designer đứt API nhiều lần, khách không chọn).
  2. `phuong-an-2-tapchi.html` — Tạp chí du ký, tham chiếu NatGeo editorial (masthead, caption EXIF, map spread thế giới 16 tile OSM, 5 marker đúng tọa độ) — hoàn thành, không chọn.
  3. `phuong-an-3-cinematic.html` — Apple product-page cinematic (5 cảnh full-bleed, hero fade-in staggered, scroll narrative, bản đồ route nối marker) — hoàn thành, có hero/full PNG.

## Lựa chọn của khách (nguyên văn)
> "chọn phương án 3 đi nhé" — ngày 2026-09-13

## Ý nghĩa
- Hướng được duyệt: **cinematic full-bleed kiểu Apple** cho giao diện công khai (hero media hiện dần + tên blog xuất hiện theo nhịp, mỗi bài là một cảnh full-bleed, khoảng trắng đắt giá).
- Bản mockup dùng ảnh tĩnh thay video — bản thật phải là **video tự host** hiện dần đúng tiết tấu (yêu cầu cứng của khách từ đầu).
- Phương án 2 giữ lại làm tham chiếu (đặc biệt: bản đồ spread + caption EXIF có thể mang sang nền cinematic nếu khách muốn).

## Chuyển tiếp
- Trang quản trị (admin) thiết kế sau, tách bạch khỏi giao diện công khai; ưu tiên của khách cho admin: đủ thiết lập mọi thứ qua UI (không hardcode env), hàng chờ bình luận AI có xem/sửa/xóa/trả lời/duyệt-từ-chối.
- Tech stack dự kiến (đã khách duyệt hướng A): Next.js + Payload CMS + PostgreSQL + Redis + tileserver tự host + Caddy, chạy Docker Compose.
