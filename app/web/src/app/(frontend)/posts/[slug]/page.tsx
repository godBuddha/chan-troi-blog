import { getPayload } from 'payload'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { CommentForm } from '@/components/CommentForm'
import { MapClient, type MapMarker } from '@/components/MapClient'
import { getSiteSettings, mediaUrl } from '@/lib/site'
import type { Comment, Location, Media, Post } from '@/payload-types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const post = (await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1 })).docs[0]
  return { title: post?.title ?? 'Không tìm thấy' }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const settings = await getSiteSettings(payload)

  const post = (await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 2 }))
    .docs[0] as Post | undefined
  if (!post) notFound()

  const postLocations = (post.locations ?? []) as Location[]
  const markers: MapMarker[] = postLocations.map((loc) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    name: loc.name,
    type: loc.type,
    postTitle: post.title,
    excerpt: post.excerpt ?? undefined,
  }))

  const cover = post.cover as Media | null
  const heroVideo = mediaUrl(post.heroVideo as Media | null)

  const comments = await payload.find({
    collection: 'comments',
    where: { and: [{ post: { equals: post.id } }, { status: { in: ['approved', 'replied'] } }] },
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })
  const byParent = new Map<number, Comment[]>()
  for (const c of comments.docs) {
    const parentId = typeof c.parent === 'object' ? c.parent?.id : c.parent
    if (parentId) {
      const list = byParent.get(parentId) ?? []
      list.push(c)
      byParent.set(parentId, list)
    }
  }

  return (
    <article className="post-page">
      <header className="post-hero">
        {heroVideo ? (
          <video className="post-hero-media hero-fade" src={heroVideo} autoPlay muted loop playsInline />
        ) : cover && mediaUrl(cover) ? (
          <Image
            className="post-hero-media hero-fade"
            src={mediaUrl(cover) as string}
            alt={cover.alt ?? post.title}
            fill
            priority
            sizes="100vw"
          />
        ) : (
          <div className="post-hero-media post-hero-media--blank" />
        )}
        <div className="hero-veil" />
        <div className="post-hero-text">
          <span className="post-kicker reveal" style={{ '--d': '0.4s' } as React.CSSProperties}>
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''} · Nhật ký
          </span>
          <h1 className="reveal" style={{ '--d': '0.6s' } as React.CSSProperties}>
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="post-excerpt reveal" style={{ '--d': '0.85s' } as React.CSSProperties}>
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </header>

      <div className="post-body">
        <RichText data={post.content} />
      </div>

      {markers.length > 0 ? (
        <section className="post-map">
          <p className="latest-label">Các điểm trong bài này</p>
          <MapClient
            styleUrl={settings?.mapStyleUrl || 'https://demotiles.maplibre.org/style.json'}
            markers={markers}
            height={420}
          />
          <ul className="post-locations">
            {postLocations.map((loc) => (
              <li key={loc.id}>
                <strong>{loc.name}</strong>
                {loc.description ? <span> — {loc.description}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="post-comments">
        <h2>Bình luận ({comments.totalDocs})</h2>
        <CommentForm postId={post.id} />

        <ul className="comment-list">
          {comments.docs.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <strong>{c.name}</strong>
                <span>{new Date(c.createdAt ?? Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
              <p>{c.body}</p>
              {byParent.get(c.id)?.length ? (
                <ul className="comment-replies">
                  {byParent.get(c.id)!.map((r) => (
                    <li key={r.id} className="comment comment--reply">
                      <div className="comment-head">
                        <strong>{r.name}</strong>
                        <span>{new Date(r.createdAt ?? Date.now()).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p>{r.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
