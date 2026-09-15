# Chân Trời — Blog du lịch cá nhân, tự host bằng Docker

Toàn bộ hệ thống trong **một lệnh** `docker compose up -d`: blog + trang quản trị + bản đồ + AI duyệt bình luận. Bạn không cần biết code — chỉ cần làm theo từng bước dưới đây.

---

## 1. Chuẩn bị (5 phút)

Cần có: **Docker** (bao gồm Docker Compose v2).
- Ubuntu/Debian VPS: `curl -fsSL https://get.docker.com | sh`
- Kiểm tra: `docker compose version`

## 2. Khởi chạy lần đầu

```bash
cd app

# 1) Tạo file cấu hình tối thiểu
cp .env.example .env
nano .env        # sửa 3 dòng có chữ "doi-..." (mật khẩu DB, secret) —
                 # hoặc dùng lệnh sinh ngẫu nhiên bên dưới

# Sinh giá trị ngẫu nhiên (chạy 2 lần, dán kết quả vào .env):
openssl rand -hex 24

# 2) Bật hệ thống
docker compose up -d --build

# 3) Xem log tới khi thấy "Ready" (Ctrl+C để thoát khỏi log)
docker compose logs -f web
```

Mở **http://localhost** (hoặc http://IP-VPS-của-bạn) — trang chủ hiện ra.

## 3. Tạo tài khoản quản trị (làm 1 lần)

1. Mở **http://localhost/admin**
2. Màn hình "Create First User" hiện ra → điền email + mật khẩu + tên → **Create**
3. Vào xong trang quản trị giao diện tiếng Việt.

## 4. Thiết lập mọi thứ trong trang quản trị (không đụng file .env)

Bảng bên trái sau khi đăng nhập:

| Mục | Bạn làm gì |
|---|---|
| **Thiết lập website** | Tên blog, dòng phụ, **video hero** (MP4 tự chạy hiện dần), ảnh poster, link mạng xã hội, lời giới thiệu, đường dẫn style bản đồ |
| **Thiết lập AI** | Chọn provider (mặc định **OpenRouter**), dán **API key**, model, bật/tắt tự duyệt, ngưỡng tin cậy, chỉnh prompt kiểm duyệt |
| **Posts** | Viết bài: tiêu đề, slug, ảnh bìa, **video mở đầu**, nội dung, **địa điểm** (chọn từ Locations), thẻ. Bấm **Publish** đăng ngay, hoặc **Schedule publish** đặt giờ tự đăng |
| **Locations** | Địa điểm cho bản đồ: tên + tọa độ (mở Google Maps, chuột phải → copy "21.02, 105.83"), loại điểm, mô tả, ảnh |
| **Comments** | Hàng chờ bình luận: AI đã đọc và **đề xuất + lý do + độ tin cậy**; bạn xem/sửa/trả lời/xóa, bấm **Đã duyệt** hoặc **Từ chối/Spam**. Trong **Thiết lập AI** đặt **ngưỡng tin cậy riêng cho từng loại** (duyệt / từ chối / spam) — AI tự áp dụng khi đủ chắc, thấp hơn ngưỡng thì chờ bạn duyệt |

## 5. Nạp ảnh & video

Trong admin: **Media → Upload**. Nén video trước khi up (nếu có ffmpeg trên máy bạn):

```bash
ffmpeg -i video.goc.mp4 -vcodec libx264 -crf 23 -preset medium -vf "scale=-2:1080" -an hero.mp4
```

(Video hero nên ~30 giây, 1080p, tắt âm — trình duyệt không tự chạy video có tiếng.)

## 6. Bản đồ tự host hoàn toàn (tùy chọn nhưng bạn muốn self-host 100%)

Trang chủ dùng bản đồ demo online tới khi bạn nạp dữ liệu tile riêng:

1. Tải dữ liệu bản đồ dạng `.mbtiles` — nguồn phổ biến:
   - [Geofabrik](https://download.geofabrik.de/) (bản đồ OSM chia theo quốc gia/khu vực, miễn phí)
   - Dữ liệu OSM thô + công cụ [`tilemaker`](https://github.com/systemed/tilemaker) nếu muốn tự tạo
2. Chép file vào `app/data/tiles/` và đặt tên trong `.env`:
   ```
   TILES_FILE=map.mbtiles
   ```
3. Bật: `docker compose --profile map up -d`
4. Trong admin **Thiết lập website → Bản đồ**, điền style URL:
   - Có tên miền: `https://ten-mien-cua-ban/tiles/styles/basic/style.json`
   - Chạy tại localhost: `http://localhost/tiles/styles/basic/style.json`
   - Tên style có thể khác tùy file `.mbtiles` — mở `http://localhost/tiles/` trên trình duyệt để xem danh sách style có sẵn.

> Không nạp tile cũng vẫn chạy tốt với style demo — chỉ là chưa "self-host 100% bản đồ".

## 7. VPS + tên miền + HTTPS

1. Trỏ DNS: bản ghi **A** của `blog.example.com` → IP VPS
2. Mở firewall 80/443
3. Trong `.env` điền:
   ```
   SITE_DOMAIN=blog.example.com
   ACME_EMAIL=ban@example.com
   ```
4. `docker compose up -d` lại → Caddy **tự cấp HTTPS** (Let's Encrypt), không cần thao tác gì thêm.

## 8. Backup / Update / Restore

**Chi tiết đầy đủ (kể cả khôi phục trên máy mới, backup tự động hằng ngày): xem [`docs/van-hanh.md`](../docs/van-hanh.md).**

Tóm tắt nhanh:

```bash
mkdir -p backup
# Backup database + thiết lập:
docker compose exec -T postgres pg_dump -U blog blog > backup/db-$(date +%F).sql
# Backup ảnh & video:
docker run --rm -v blog-du-lich_media:/data -v $(pwd)/backup:/backup alpine \
  tar czf /backup/media-$(date +%F).tgz -C /data .
# Khôi phục database từ dump (xóa dữ liệu hiện tại rồi nạp bản backup):
docker compose exec -T postgres psql -U blog -d blog -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
cat backup/db-2026-09-15.sql | docker compose exec -T postgres psql -U blog -d blog
# Cập nhật khi có code mới:
git pull && docker compose up -d --build
```

Đủ 3 thứ để khôi phục toàn bộ trên máy mới: **file `.sql` + file media `.tgz` + file `.env`**.

## 9. Cập nhật sau này

```bash
cd app
git pull            # nếu dùng git quản lý code
docker compose up -d --build
```

---

## Cấu trúc thư mục

```
app/
├── docker-compose.yml   # 4 dịch vụ: web, postgres, caddy, tiles (tùy chọn)
├── .env.example         # cấu hình tối thiểu (3 biến)
├── caddy/Caddyfile      # HTTPS tự động
├── data/tiles/          # bản đồ .mbtiles tự host (tùy chọn)
└── web/                 # mã nguồn Next.js + Payload CMS
    └── src/
        ├── collections/ # Posts, Locations, Comments, Media, Tags, Users
        ├── globals/     # SiteSettings, AIConfig (mọi thiết lập qua UI)
        ├── lib/         # lớp AI (OpenAI-compatible: OpenRouter, Gemini, ...)
        └── app/(frontend)/ # giao diện cinematic + trang bài viết
```

## Vấn đề thường gặp

| Triệu chứng | Xử lý |
|---|---|
| `/admin` báo lỗi tạo user đầu | Xem `docker compose logs web` — thường do `DATABASE_URI` sai mật khẩu (mật khẩu phải giống nhau ở 2 dòng `POSTGRES_PASSWORD` và `DATABASE_URI`) |
| Mở http://localhost bị cảnh báo chứng chỉ | Đã sửa ở Caddyfile: không đặt `SITE_DOMAIN` thì hệ thống chạy HTTP thuần. Nếu bản cũ vẫn cảnh báo, `docker compose up -d --build` lại |
| Bình luận không tự duyệt | Kiểm tra **Thiết lập AI**: key đúng chưa, model còn hoạt động không (xem log web khi gửi bình luận thử) |
| Bản đồ trắng | Style URL sai — thử lại `https://demotiles.maplibre.org/style.json` |
| Video không tự chạy | Video phải tắt tiếng (đã `-an` khi nén) và định dạng MP4/H.264 |
| Quên mật khẩu admin | Xóa tài khoản để hiện lại màn "Create First User" (bài viết, bình luận **giữ nguyên**): `docker compose exec postgres psql -U blog -d blog -c 'DELETE FROM users;'` → mở lại `/admin` tạo tài khoản mới |
