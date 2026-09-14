import type { CollectionConfig } from 'payload'

// Địa điểm gắn với bài viết — nguồn dữ liệu cho bản đồ số.
// Mỗi địa điểm có tọa độ thật (lat/lng) nên marker ↔ bài viết luôn đồng bộ.
export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'lat', 'lng'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên địa điểm',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Tọa độ',
          fields: [
            {
              name: 'lat',
              type: 'number',
              label: 'Vĩ độ (Latitude)',
              required: true,
              admin: {
                description:
                  'Ví dụ Hà Nội: 21.0278 — mở Google Maps, bấm chuột phải vào điểm cần lấy, dòng đầu tiên là "21.0278, 105.8342".',
              },
            },
            {
              name: 'lng',
              type: 'number',
              label: 'Kinh độ (Longitude)',
              required: true,
              admin: {
                description: 'Ví dụ Hà Nội: 105.8342',
              },
            },
          ],
        },
        {
          label: 'Chi tiết',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Loại điểm',
              defaultValue: 'sight',
              options: [
                { label: 'Điểm tham quan', value: 'sight' },
                { label: 'Quán ăn / đồ ăn', value: 'food' },
                { label: 'Lưu trú', value: 'stay' },
                { label: 'Trạm/điểm dừng', value: 'stop' },
                { label: 'Khác', value: 'other' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Mô tả ngắn',
            },
            {
              name: 'cover',
              type: 'upload',
              label: 'Ảnh minh họa',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
  ],
}
