import type { GlobalConfig } from 'payload'

// Mọi thiết lập giao diện nằm ở đây — chỉnh trong trang quản trị, không đụng file .env
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Thiết lập website',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true, label: 'Tên blog', defaultValue: 'Chân Trời' },
    {
      name: 'tagline',
      type: 'text',
      label: 'Dòng phụ dưới tên (hero)',
      defaultValue: 'Viết bằng chân, về những nơi vừa đi qua.',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Màn hình mở trang',
          description: 'Phần đầu tiên khách truy cập nhìn thấy — video hiện dần rồi tên blog xuất hiện.',
          fields: [
            {
              name: 'heroVideo',
              type: 'upload',
              relationTo: 'media',
              label: 'Video hero',
              admin: {
                description:
                  'MP4 nén sẵn (H.264, 1080p, ~30s là đủ, âm thanh bị tắt vì tự chạy). Chưa có video thì dùng ảnh bên dưới.',
              },
            },
            {
              name: 'heroPoster',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh thay thế / poster',
              admin: { description: 'Hiện ngay lập tức trong lúc video tải; cũng dùng khi chưa có video.' },
            },
          ],
        },
        {
          label: 'Bản đồ',
          fields: [
            {
              name: 'mapStyleUrl',
              type: 'text',
              label: 'Đường dẫn style bản đồ (MapLibre)',
              admin: {
                description:
                  'Tự host: http://localhost:8080/styles/basic/style.json (qua Caddy: /map/styles/basic/style.json). Mặc định dùng bản demo online cho tới khi bạn nạp tile vào data/tiles/.',
              },
            },
          ],
        },
        {
          label: 'Giới thiệu & chân trang',
          fields: [
            {
              name: 'aboutTitle',
              type: 'text',
              label: 'Tiêu đề phần "Về tôi"',
              defaultValue: 'Một người, một ba lô, một trang blog tự host.',
            },
            { name: 'aboutText', type: 'textarea', label: 'Lời giới thiệu' },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh đại diện',
            },
            { name: 'footerNote', type: 'text', label: 'Ghi chú chân trang' },
            {
              name: 'socials',
              type: 'array',
              label: 'Liên kết mạng xã hội',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Tên (VD: Instagram)' },
                { name: 'url', type: 'text', required: true, label: 'Đường dẫn' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
