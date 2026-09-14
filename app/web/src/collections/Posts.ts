import type { CollectionConfig } from 'payload'

// Bài viết du lịch: draft + lịch đăng (scheduled publish) đều bật sẵn.
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'featured'],
    description:
      'Bấm "Publish" để đăng ngay, hoặc chọn "Schedule publish" đặt giờ đăng trước — hệ thống tự đăng đúng giờ.',
    livePreview: {
      url: ({ data }) => `/posts/${data.slug}`,
    },
  },
  versions: {
    drafts: {
      // schedulePublish: cho phép đặt giờ đăng trước trong bảng Publish
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 20,
  },
  access: {
    // Công khai chỉ thấy bài đã đăng; admin thấy cả bản nháp.
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tiêu đề' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Đường dẫn (slug)',
      admin: {
        position: 'sidebar',
        description: 'Chữ thường, không dấu, gạch ngang — VD: ha-giang-3-ngay',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Tóm tắt ngắn',
      admin: { description: '1-2 câu hiện ở trang chủ và thẻ chia sẻ mạng xã hội.' },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh bìa',
      admin: { position: 'sidebar' },
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Video mở đầu (tùy chọn)',
      admin: { position: 'sidebar', description: 'MP4 nén sẵn (H.264/H.265). Có video thì trang bài dùng video thay ảnh bìa.' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Nội dung',
    },
    {
      name: 'locations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      label: 'Địa điểm gắn với bài',
      admin: {
        position: 'sidebar',
        description: 'Chọn các địa điểm — chúng sẽ xuất hiện trên bản đồ của bài và bản đồ tổng.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Thẻ',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Nổi bật (hiện đầu trang chủ)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
