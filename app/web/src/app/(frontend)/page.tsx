import { getPayload } from 'payload'
import Image from 'next/image'
import configPromise from '@payload-config'

import { Hero } from '../../components/Hero'
import { MapClient, type MapMarker } from '../../components/MapClient'
import { mediaUrl, getSiteSettings } from '../../lib/site'
import type { Post, Location, Media } from '@/payload-types'

// Nội dung lấy từ DB lúc request (bài/thiết lập đổi trong admin là hiện ngay).
// Bắt buộc dynamic — nếu không Next sẽ prerender lúc build và cần DB có sẵn bảng.
export const dynamic = 'force-dynamic'

// Trang chủ cinematic:
//  1. Hero (video hiện dần + tên blog)
//  2. Manifesto nền tối
//  3. Bài viết = những cảnh full-bleed, xen kẽ trái/phải
//  4. Bản đồ tổng hợp marker đồng bộ bài
//  5. Về tôi + footer (trong layout)

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)

  const posts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 6,
    depth: 2,
  })

  // Địa điểm của các bài đã đăng (đồng bộ bản đồ ↔ bài)
  const locationRes = await payload.find({ collection: 'locations', sort: 'name', limit: 200, depth: 2 })
  const postById = new Map(posts.docs.map((p) => [p.id, p]))
  const markers: MapMarker[] = locationRes.docs.flatMap((loc: Location) => {
    // tìm bài đã đăng nào gắn địa điểm này (quan hệ posts.locations)
    const owner = [...postById.values()].find((p) =>
      (p.locations ?? []).some((l) => (typeof l === 'object' ? l.id : l) === loc.id),
    )
    if (!owner) return []
    return [
      {
        id: loc.id,
        lat: loc.lat,
        lng: loc.lng,
        name: loc.name,
        type: loc.type,
        href: `/posts/${owner.slug}`,
        postTitle: owner.title,
        excerpt: owner.excerpt ?? undefined,
      },
    ]
  })

  const heroVideo = mediaUrl(settings?.heroVideo as Media | null | undefined)
  const heroPoster = mediaUrl(settings?.heroPoster as Media | null | undefined)

  return (
    <>
      <Hero
        siteName={settings?.siteName ?? 'Chân Trời'}
        tagline={settings?.tagline}
        videoUrl={heroVideo}
        posterUrl={heroPoster}
      />

      <section className="manifesto">
        <p className="manifesto-line">
          Cứ đi, rồi <em>viết lại</em> — như một cách nhớ đường về.
        </p>
        <div className="manifesto-meta">
          <span>Hành trình</span>
          <span className="dot" />
          <span>Ảnh thật</span>
          <span className="dot" />
          <span>Không quảng cáo</span>
        </div>
      </section>

      <section id="moi-nhat" className="latest">
        <p className="latest-label reveal-on-scroll">Mới đi về đây</p>
        <h2 className="latest-title reveal-on-scroll">
          Mỗi bài viết là một điểm đã <em>dừng chân</em>.
        </h2>

        {posts.docs.length === 0 ? (
          <p className="empty-hint">
            Chưa có bài nào được đăng. Hãy vào <a href="/admin">trang quản trị</a> viết bài đầu tiên.
          </p>
        ) : (
          <div className="scenes">
            {posts.docs.map((post: Post, i: number) => {
              const cover = post.cover as Media | null
              const coverUrl = mediaUrl(cover)
              const flipped = i % 2 === 1
              return (
                <a key={post.id} className={`scene ${flipped ? 'scene--flip' : ''}`} href={`/posts/${post.slug}`}>
                  <div className="scene-media">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={cover?.alt ?? post.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 60vw"
                        className="scene-img"
                      />
                    ) : (
                      <div className="scene-media-blank" />
                    )}
                  </div>
                  <div className="scene-text">
                    <span className="scene-kicker">
                      {String(i + 1).padStart(2, '0')} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Nháp'}
                    </span>
                    <h3 className="scene-title">{post.title}</h3>
                    {post.excerpt ? <p className="scene-desc">{post.excerpt}</p> : null}
                    <span className="scene-cta">Đọc hành trình →</span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>

      <section id="ban-do" className="map-section">
        <p className="latest-label reveal-on-scroll">Bản đồ hành trình</p>
        <h2 className="latest-title reveal-on-scroll">
          Điểm nào đã ghi trong bài là điểm <em>có thật trên bản đồ</em>.
        </h2>
        <p className="map-hint reveal-on-scroll">Rê chuột hoặc bấm vào từng điểm để xem bài viết tương ứng.</p>
        <MapClient styleUrl={settings?.mapStyleUrl || 'https://demotiles.maplibre.org/style.json'} markers={markers} />
      </section>

      <section id="ve-toi" className="about">
        <div className="about-text">
          <h2>{settings?.aboutTitle ?? 'Về tôi'}</h2>
          {settings?.aboutText ? <p>{settings.aboutText}</p> : null}
        </div>
        {settings?.avatar && mediaUrl(settings.avatar as Media) ? (
          <div className="about-avatar">
            <Image
              src={mediaUrl(settings.avatar as Media) as string}
              alt="Ảnh đại diện"
              fill
              sizes="240px"
              className="about-img"
            />
          </div>
        ) : null}
      </section>
    </>
  )
}
