# Sổ tay vận hành — Update · Backup · Restore

> Tài liệu dành cho chủ blog "Chân Trời". Không cần biết code — chỉ cần làm theo từng lệnh.
> Tất cả lệnh đều chạy trong thư mục `app/` (nơi có file `docker-compose.yml`).

## Dữ liệu của bạn nằm ở đâu?

| Thứ | Nằm ở | Backup bằng |
|---|---|---|
| Bài viết, bình luận, thiết lập, tài khoản | Database PostgreSQL (volume `pgdata`) | `pg_dump` → file `.sql` |
| Ảnh & video | Docker volume `media` | `tar` → file `.tgz` |
| Mật khẩu DB + secret | File `app/.env` | Copy file (giữ an toàn, không public) |
| Bản đồ tự host | Thư mục `app/data/tiles/` | Copy thư mục |

> **Quy tắc vàng:** có 3 thứ là đủ khôi phục toàn bộ hệ thống trên một máy mới: **file dump `.sql` + file media `.tgz` + file `.env`**.

---

## 1. Cập nhật (Update)

### 1a. Cập nhật khi có code mới (ví dụ bạn nhờ AI sửa thêm, hoặc `git pull`)

```bash
cd app
git pull                    # nếu code được quản lý bằng git
docker compose up -d --build
```

Lệnh `--build` biên dịch lại giao diện web từ mã nguồn mới; database và media **giữ nguyên** — bài viết, bình luận không mất. Quá trình chạy khoảng 2–5 phút, người dùng gần như không nhận thấy (nếu chạy downtime tối thiểu: chỉ service `web` được dựng lại).

Chỉ muốn khởi động lại web (không đổi code):

```bash
docker compose restart web
```

### 1b. Cập nhật phiên bản phần mềm nền

```bash
docker compose pull         # kéo ảnh postgres/caddy mới hơn
docker compose up -d        # áp dụng
```

> Next.js/Payload cập nhật qua `package.json` trong `app/web/` — chỉ nâng khi cần, luôn **backup DB trước** (mục 2).

### 1c. Rollback khi bản mới có lỗi

```bash
git log --oneline | head -5           # xem các phiên bản
git checkout <mã-commit-cũ>           # về phiên bản cũ
docker compose up -d --build
```

Nếu cần quay cả database về trước lúc update: dùng dump gần nhất (mục 3b).

---

## 2. Backup (sao lưu)

### 2a. Backup toàn bộ ngay bây giờ (3 lệnh)

```bash
cd app && mkdir -p backup

# 1) Database — bài viết, bình luận, mọi thiết lập
docker compose exec -T postgres pg_dump -U blog blog > backup/db-$(date +%F).sql

# 2) Ảnh & video
docker run --rm -v blog-du-lich_media:/data -v $(pwd)/backup:/backup alpine \
  tar czf /backup/media-$(date +%F).tgz -C /data .

# 3) File cấu hình
cp .env backup/env-$(date +%F)

echo "Xong — kiểm tra:" && ls -lh backup/
```

### 2b. Backup tự động hằng ngày, giữ 14 ngày gần nhất

```bash
crontab -e
```

Thêm dòng này (chạy 3h sáng mỗi ngày):

```
0 3 * * * cd /duong-dan/toi/chan-troi-blog/app && mkdir -p backup && docker compose exec -T postgres pg_dump -U blog blog > backup/db-$(date +\%F).sql && docker run --rm -v blog-du-lich_media:/data -v $(pwd)/backup:/backup alpine tar czf /backup/media-$(date +\%F).tgz -C /data . && find backup -name "*.sql" -mtime +14 -delete && find backup -name "*.tgz" -mtime +14 -delete
```

> Nhớ thay `/duong-dan/toi/chan-troi-blog/app` bằng đường dẫn thật của bạn.

### 2c. Copy backup ra ngoài VPS (rất nên làm)

Backup nằm trên chính VPS thì mất VPS là mất cả hai. Đồng bộ về nhà:

```bash
# Từ máy cá nhân của bạn (không phải VPS):
scp ten-user@IP-VPS:/duong-dan/toi/app/backup/*.sql ~/backup-blog/
scp ten-user@IP-VPS:/duong-dan/toi/app/backup/*.tgz ~/backup-blog/
```

Hoặc dùng `rclone` để đẩy lên Google Drive/S3/OneDrive:

```bash
rclone copy app/backup remote:backup-chan-troi
```

---

## 3. Restore (khôi phục)

### 3a. Khôi phục trên hệ thống đang chạy

```bash
cd app

# 1) Database — ghi đè bằng dump
cat backup/db-2026-09-15.sql | docker compose exec -T postgres psql -U blog -d blog

# 2) Ảnh & video
docker run --rm -v blog-du-lich_media:/data -v $(pwd)/backup:/backup alpine \
  sh -c "cd /data && rm -rf ./* && tar xzf /backup/media-2026-09-15.tgz"

# 3) Khởi động lại để web nạp lại dữ liệu
docker compose restart web
```

### 3b. Khôi phục toàn bộ trên một máy MỚI (VPS bị mất, chuyển nhà cung cấp)

```bash
# 1) Cài Docker: curl -fsSL https://get.docker.com | sh

# 2) Lấy code
git clone https://github.com/godBuddha/chan-troi-blog.git
cd chan-troi-blog/app

# 3) Trả lại file .env từ backup (điền mật khẩu cũ)
cp /duong-dan/backup/env-2026-09-15 .env

# 4) Bật hệ thống (database trống, schema tự tạo)
docker compose up -d --build

# 5) Nạp dữ liệu từ dump
cat /duong-dan/backup/db-2026-09-15.sql | docker compose exec -T postgres psql -U blog -d blog

# 6) Nạp ảnh & video
docker run --rm -v blog-du-lich_media:/data -v /duong-dan/backup:/backup alpine \
  sh -c "cd /data && tar xzf /backup/media-2026-09-15.tgz"

# 7) Copy lại tile bản đồ (nếu dùng)
cp -r /duong-dan/backup/tiles/* data/tiles/ 2>/dev/null

# 8) Khởi động lại web
docker compose restart web
```

Mở lại website — mọi bài viết, bình luận, thiết lập AI, video hero **giữ nguyên như trước**.

> **Lưu ý:** nếu đổi mật khẩu DB trong `.env`, phải đổi luôn trong `DATABASE_URI` cho khớp (2 chỗ cùng dùng một mật khẩu).

### 3c. Chỉ khôi phục một bài/bình luận bị xóa nhầm

```bash
# Xem dump chứa gì (grep theo tiêu đề chẳng hạn)
grep -n "Tiêu đề bài bị xóa" backup/db-2026-09-15.sql
# Mở file .sql bằng trình soạn thảo, tìm khối INSERT của bài đó, khôi phục qua /admin
# (cách đơn giản và an toàn nhất: đọc nội dung từ dump rồi tự tạo lại trong trang quản trị)
```

---

## 4. Checklist vận hành nhanh

| Việc | Tần suất | Lệnh |
|---|---|---|
| Backup DB + media | Hằng ngày (cron) | Mục 2b |
| Copy backup ra ngoài VPS | Hằng tuần | Mục 2c |
| Cập nhật code | Khi có thay đổi | Mục 1a |
| Kiểm tra dung lượng disk | Hằng tháng | `docker system df` |
| Dọn image cũ | Hằng tháng | `docker image prune -f` |
| Kiểm tra log khi có vấn đề | Khi cần | `docker compose logs -f web` |
