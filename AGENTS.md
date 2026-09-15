# AGENTS.md — cẩm nang cho trợ lý AI làm việc trên repo này

> File này dành cho **AI/máy** đọc trước khi sửa code. Hướng dẫn cho **người dùng** nằm ở `README.md`, `app/README.md`, `docs/`.

## Dự án là gì

Blog du lịch cá nhân "Chân Trời", tự host 100% bằng Docker. Người dùng chủ **không biết code** — mọi thay đổi phải đi kèm hướng dẫn tiếng Việt theo kiểu "làm theo từng bước".

- Stack: Next.js 16 (Turbopack, output standalone) · Payload CMS 3 (postgresAdapter) · PostgreSQL 16 · MapLibre GL v6 · Caddy · tileserver-gl (tuỳ chọn, profile `map`)
- Mã nguồn web: `app/web/` · Hạ tầng: `app/docker-compose.yml`, `app/caddy/Caddyfile`

## Luật bất biến (đã từng gây bug, đừng vi phạm lại)

1. **Không hardcode thiết lập vào `.env`** — mọi cấu hình (tên blog, video hero, AI key, map style…) phải chỉnh được qua trang quản trị (`globals/SiteSettings.ts`, `globals/AIConfig.ts`). `.env` chỉ có 3 biến khởi tạo.
2. **`.env`, key, token tuyệt đối không commit.** Chỉ `.env.example` được vào repo. Token GitHub của user đã từng lộ trong chat — không bao giờ ghi token vào file nào trong repo.
3. **HTTP header phải ASCII** — chuỗi tiếng Việt có dấu trong header (VD `X-Title`) gây `TypeError: ... ByteString`. Dùng không dấu (`Chan Troi blog`). Xem `lib/ai.ts`.
4. **maplibre-gl v6 KHÔNG có default export** — dùng named imports: `import { Map as MapLibreMap, Marker, NavigationControl, LngLatBounds } from 'maplibre-gl'`.
5. **Route Next.js không được trùng đường dẫn REST của Payload** (`/api/...` sẽ shadow API của Payload). Endpoint công khai đặt ở `app/api/public-comments/route.ts`, không tạo `app/api/comments`.
6. **UI tiếng Việt 100%** — label, mô tả, thông báo lỗi trong collections/globals đều tiếng Việt; docs cũng vậy.
7. **Không đổi schema Payload tùy tiện** — sau khi sửa collections/globals phải chạy `npx payload generate:types` để cập nhật `src/payload-types.ts`.
8. Payload 3.89: `JobsConfig` **không có** thuộc tính `enabled`; `imageSizes` của Media **không có** `format`; type global sinh ra là `SiteSetting` (số ít).

## Cấu trúc nhanh

```
app/web/src/
├── payload.config.ts      # khai báo adapter + jobs (cron * * * * * cho đăng bài lịch)
├── collections/           # Posts, Locations, Comments, Media, Tags, Users
├── globals/               # SiteSettings, AIConfig — mọi thiết lập qua UI
├── lib/ai.ts              # gọi AI OpenAI-compatible (OpenRouter mặc định)
├── components/            # MapClient, CommentForm…
└── app/(frontend)/        # giao diện cinematic + trang bài viết
```

Hook duyệt bình luận AI nằm trong `collections/Comments.ts` (beforeChange): AI trả verdict + confidence, so với ngưỡng trong AIConfig (`thresholds` từng loại) → tự duyệt/từ chối nếu đủ chắc, không thì `pending`.

## Cách chạy dev để kiểm chứng

```bash
docker run -d --name blog-pg-dev -p 5433:5432 -e POSTGRES_USER=blog -e POSTGRES_PASSWORD=blog -e POSTGRES_DB=blog postgres:16-alpine
cd app/web
# .env dev: DATABASE_URI=postgres://blog:blog@127.0.0.1:5433/blog, PAYLOAD_SECRET=dev-secret-..., MEDIA_DIR=./media-dev
npm run dev
```

- Tạo user đầu: `POST /api/users/first-register` với `{email, password, name}`.
- Kiểm tra AI moderation không cần key thật: dựng mock server OpenAI-compatible (trả JSON verdict) rồi trỏ `baseUrl` trong AIConfig về đó.
- Build kiểm chứng: `npm run build` (cần `DATABASE_URI` + `PAYLOAD_SECRET` có mặt, không cần DB sống đến khi render).
- Browser test dùng Playwright: CJS `require` + `NODE_PATH` trỏ vào `app/web/node_modules`; `waitUntil: 'domcontentloaded'` (networkidle sẽ timeout vì map tiles); bung collapsible admin bằng selector `.collapsible__toggle`.

## Docs là một phần của tính năng

Sửa code ảnh hưởng cách dùng → phải cập nhật đồng thời: `app/README.md` (cài đặt), `docs/van-hanh.md` (vận hành), `docs/man-hinh-quan-tri.md` (màn hình quản trị). Quy ước restore/backup đã kiểm chứng bằng runtime — đừng đổi lệnh trong `docs/van-hanh.md` nếu chưa chạy thử thật (dump `.sql` không chứa DROP — restore phải `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` trước).
