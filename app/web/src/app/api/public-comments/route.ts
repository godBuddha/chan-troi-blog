import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

// Giới hạn đơn giản theo IP: 5 bình luận / 10 phút — chống spam cơ bản
const RATE_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function tooManyRequests(ip: string): boolean {
  const now = Date.now()
  const prev = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (prev.length >= RATE_LIMIT) {
    hits.set(ip, prev)
    return true
  }
  prev.push(now)
  hits.set(ip, prev)
  return false
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (tooManyRequests(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Bạn gửi bình luận hơi nhiều. Vui lòng đợi vài phút rồi thử lại.' },
        { status: 429 },
      )
    }

    const body = (await req.json()) as {
      post?: string
      name?: string
      email?: string
      body?: string
      parent?: string
    }
    const name = (body.name ?? '').trim()
    const text = (body.body ?? '').trim()
    if (!body.post || !name || !text) {
      return NextResponse.json(
        { ok: false, error: 'Thiếu thông tin. Vui lòng điền đủ tên và nội dung.' },
        { status: 400 },
      )
    }
    if (text.length > 2000) {
      return NextResponse.json({ ok: false, error: 'Bình luận quá dài (tối đa 2000 ký tự).' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    // Chấp nhận id hoặc slug của bài viết
    const post = /^[0-9a-fA-F-]{8,}$/.test(body.post)
      ? await payload.findByID({ collection: 'posts', id: body.post })
      : (
          await payload.find({
            collection: 'posts',
            where: { slug: { equals: body.post } },
            limit: 1,
          })
        ).docs[0]
    if (!post) {
      return NextResponse.json({ ok: false, error: 'Bài viết không tồn tại.' }, { status: 404 })
    }

    const comment = await payload.create({
      collection: 'comments',
      data: {
        post: post.id,
        name: name.slice(0, 80),
        email: body.email?.trim() || undefined,
        body: text,
        parent: body.parent ? Number(body.parent) : undefined,
        // status do hook AI quyết định; nếu AI tắt thì về 'pending'
      },
    })

    // 200 luôn — khách không cần biết bình luận mình bị chờ duyệt hay không
    return NextResponse.json({ ok: true, message: 'Đã nhận bình luận của bạn. Cảm ơn bạn!' })
  } catch (err) {
    console.error('[comments]', err)
    return NextResponse.json({ ok: false, error: 'Có lỗi khi gửi bình luận. Vui lòng thử lại.' }, { status: 500 })
  }
}
