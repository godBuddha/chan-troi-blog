import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSiteSettings, getSiteUrl } from '@/lib/site'
import type { Post } from '@/payload-types'

// RSS 2.0 — người đọc theo dõi blog qua Feedly/Inoreader… mà không cần mạng xã hội.
// Đặt ở (frontend) để có layout chung; đường dẫn /feed.xml không đụng API của Payload.
export const dynamic = 'force-dynamic'

function xmlEscape(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)
  const base = getSiteUrl(settings)
  const siteName = settings?.siteName ?? 'Chân Trời'

  const posts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50,
    depth: 0,
  })

  const items = (posts.docs as Post[])
    .map((p) => {
      const link = `${base}/posts/${p.slug}`
      const date = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString()
      return [
        '    <item>',
        `      <title>${xmlEscape(p.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <pubDate>${date}</pubDate>`,
        p.excerpt ? `      <description>${xmlEscape(p.excerpt)}</description>` : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(siteName)}</title>
    <link>${xmlEscape(base + '/')}</link>
    <description>${xmlEscape(settings?.tagline ?? 'Nhật ký hành trình')}</description>
    <language>vi</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
