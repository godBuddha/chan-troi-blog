import type { CollectionConfig } from 'payload'

// Thẻ chủ đề (VD: "Miền núi", "Ăn uống", "Biển đảo")
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Tên thẻ' },
    { name: 'slug', type: 'text', unique: true, index: true, label: 'Slug' },
  ],
}
