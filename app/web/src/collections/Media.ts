import type { CollectionConfig } from 'payload'
import path from 'path'

// MEDIA_DIR: nơi lưu file upload. Trong Docker = /app/media (volume); khi dev = ./media
export const mediaDir = process.env.MEDIA_DIR || path.resolve('media')

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // ảnh/video công khai để trình duyệt tải trực tiếp
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Mô tả ảnh/video cho người khiếm thị và SEO.',
      },
    },
  ],
  upload: {
    staticDir: mediaDir,
    // Ảnh + video (hero, cover). Video không nén lại — ưu tiên nén trước khi up (xem README).
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960 },
      { name: 'tablet', width: 1280 },
      { name: 'hero', width: 1920 },
    ],
  },
}
