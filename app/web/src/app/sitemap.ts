import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSiteSettings, getSiteUrl } from '@/lib/site'

// Sitemap cho Google/Bing — sinh từ bài đã xuất bản lúc có request
// (dynamic vì nội dung đổi trong admin phải lập chỉ mục được ngay).
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)
  const base = getSiteUrl(settings)

  const posts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 1000,
    depth: 0,
  })

  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    ...posts.docs.map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: (p.updatedAt ?? p.publishedAt) ? new Date((p.updatedAt ?? p.publishedAt) as string) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
