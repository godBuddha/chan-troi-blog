import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSiteSettings, getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)
  const base = getSiteUrl(settings)

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Trang quản trị và API không cho bot bò
      disallow: ['/admin', '/api'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
