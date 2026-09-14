# Đặc tả thiết kế — Mockup blog du lịch cá nhân

## 1. Sản phẩm là gì?
Một **blog du lịch cá nhân** (tên tạm: **「Chân Trời」** — placeholder, người dùng sẽ đổi được trong trang quản trị, không phải brand cố định). Người dùng tự host bằng Docker, có trang quản trị, bản đồ số đồng bộ bài viết, AI duyệt bình luận. Mockup này là **trang chủ công khai** (bước đầu của lựa chọn hướng thiết kế; trang quản trị làm sau khi chọn hướng).

## 2. Đối tượng & bối cảnh
- Độc giả: người Việt yêu du lịch, bạn bè/người thân theo dõi hành trình, cộng đồng du lịch.
- Thiết bị: **đa dạng thiết bị** (desktop là chính cho mockup, nhưng bố cục phải có logic responsive rõ ràng); người dùng nhấn mạnh tốc độ vì nhiều ảnh/video.

## 3. Nội dung & các khối chính (dùng nội dung THẬT tiếng Việt, không Lorem ipsum)
1. **Hero**: màn hình đầu tiên có **video hiện dần (fade-in) + dòng chữ tên blog** hiện lên. Trong mockup: dùng ảnh hero làm stand-in cho video + overlay tên blog + dòng phụ, có animation fade-in mượt (opacity + scale nhẹ). Ghi chú nhỏ trung thực: "video thật sẽ thay thế ở bản chạy thật".
2. **Bản đồ hành trình**: khu vực bản đồ Việt Nam (dùng 3 tile OpenStreetMap đã tải: `tile_z7_102_58.png`/`59`/`60` ghép 1×3 dọc = lưới Việt Nam) với **5 marker** trỏ đến bài viết tương ứng, hover/click hiện preview bài viết (thumbnail + tiêu đề + ngày).
3. **Bài viết mới nhất**: 4-6 bài thật, ví dụ: "3 ngày Hà Giang trên cung đường Mã Pí Lèng", "Hội An lúc đèn lồng vừa lên", "Bụi bụi Đà Lạt mùa hoa dã quỳ", "Đảo Cô Tô: biển lúc chưa ai biết", "Sài Gòn ăn gì sau nửa đêm", "Đèo Pha Đin và những ngã rẽ".
4. **Về tôi** ngắn + footer.

## 4. Tông & cảm xúc
Cá nhân, ấm, khao khát viễn du (wanderlust), chất "nhật ký hành trình" chứ không phải agency du lịch thương mại. Có thể gợi góc nhìn phóng viên/du ký.

## 5. Định dạng xuất
- **Mỗi phương án = 1 file HTML đơn, tự mở được bằng double-click**: ảnh base64 nhúng trực tiếp, không phụ thuộc file ngoài (font CDN Google Fonts được phép nhưng phải fallback hệ thống).
- Màn hình chụp: **1440×900** (desktop). Coi trang là một cuộn dọc (single scroll) — KHÔNG phải deck/PPT.

## 6. Ảnh素材 có sẵn (bắt buộc dùng ảnh thật trong `assets/img/`, nhúng base64)
- `hero_nui.jpg` (1920×1280 — núi, dùng hero) 
- `vung_bien.jpg` (biển), `pho_co.jpg` (phố cổ/kiến trúc), `nha_tho.jpg` (kiến trúc sáng chiều), `duong_di.jpg` (con đường/road trip), `canh_bay.jpg` (máy bay/cánh bay — dùng cột "Về tôi" hoặc bài bay)
- `tile_z7_102_58/59/60.png` — ghép lưới bản đồ. Marker/tơ là UI vẽ bằng CSS.
- Ảnh nào không khớp chủ đề bài viết thì đặt lại tiêu đề bài cho khớp ảnh (nội dung phục vụ ảnh thật, không điền bừa).

## 7. Ràng buộc kỹ & chống AI-slop
- Cấm: emoji làm icon, gradient tím sáo rỗng, thẻ bo tròn + viền trái màu (combo Material 2020), SVG vẽ người, placeholder mờ nhòe.
- Kỹ thuật cao cấp: `text-wrap: pretty`, CSS Grid, `clamp()` cho chữ, biến CSS.
- Đọc được: thân ≥14px, ghi chú ≥12px, tương phản ≥4.5:1. Khoảng trắng phải là *bố cục* (có điểm neo thị giác), không phải nội dung vắng.
- Một chi tiết làm tới 120% (signature detail), còn lại 80% chắc tay.

## 8. Signature bắt buộc (cả 3 phương án phải có, diễn giải theo từng ngôn ngữ thiết kế)
- Animation hero: ảnh/video **hiện dần + tên blog xuất hiện** (đây là yêu cầu cứng của khách).
- Một bản đồ (từ tile OSM) **đồng bộ với bài viết** (marker ↔ bài).
- Cảm giác "đa thiết bị, nhẹ, nhanh" (trình bày tinh giản, không lòe loẹt).
