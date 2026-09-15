import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Be_Vietnam_Pro, Newsreader } from 'next/font/google'

import './styles.css'
import { getSiteSettings, getSiteUrl, mediaUrl } from '@/lib/site'

const sans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Newsreader({
  subsets: ['latin', 'vietnamese'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export async function generateMetadata() {
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)
  const siteName = settings?.siteName ?? 'Chân Trời'
  const siteUrl = getSiteUrl(settings)
  const ogImage = mediaUrl(settings?.ogImage as { url?: string | null; filename?: string | null } | null)

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s · ${siteName}`,
    },
    description: settings?.tagline ?? 'Nhật ký hành trình',
    alternates: {
      canonical: '/',
      types: { 'application/rss+xml': `${siteUrl}/feed.xml` },
    },
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description: settings?.tagline ?? 'Nhật ký hành trình',
      url: siteUrl,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: siteName,
      description: settings?.tagline ?? 'Nhật ký hành trình',
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)
  const siteName = settings?.siteName ?? 'Chân Trời'

  const socials: { label?: string | null; url?: string | null }[] = settings?.socials ?? []

  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <header className="site-header">
          <a className="site-brand" href="/">
            <span className="site-mark" />
            {siteName}
          </a>
          <nav>
            <a href="/#moi-nhat">Bài viết</a>
            <a href="/#ban-do">Bản đồ</a>
            <a href="/#ve-toi">Về tôi</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-brand site-brand--footer">
            <span className="site-mark" />
            {siteName}
          </div>
          {settings?.footerNote ? <span className="footer-note">{settings.footerNote}</span> : null}
          <span className="footer-links">
            {socials.map((s, i) => (
              <a key={i} href={s.url ?? undefined} rel="noopener noreferrer" target="_blank">
                {s.label}
              </a>
            ))}
            <a href="/admin">Quản trị</a>
          </span>
        </footer>
      </body>
    </html>
  )
}
