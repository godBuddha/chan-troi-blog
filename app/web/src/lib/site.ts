import type { Payload } from 'payload'
import type { SiteSetting as SiteSettingsType } from '@/payload-types'

// URL công khai của file media upload (Payload REST endpoint)
export function mediaUrl(
  media: { filename?: string | null; url?: string | null } | number | null | undefined,
): string | null {
  if (!media || typeof media === 'number') return null
  if (media.url) return media.url
  if (media.filename) return `/api/media/file/${media.filename}`
  return null
}

export async function getSiteSettings(payload: Payload): Promise<SiteSettingsType | null> {
  try {
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

// Địa chỉ gốc của blog (không dấu / ở cuối) — dùng cho sitemap, RSS, OG URL.
// Lấy từ Thiết lập website → SEO & chia sẻ; chạy tại localhost thì fallback.
export function getSiteUrl(settings: SiteSettingsType | null | undefined): string {
  const raw = settings?.siteUrl?.trim().replace(/\/+$/, '')
  return raw || 'http://localhost'
}
