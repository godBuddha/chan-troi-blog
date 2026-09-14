'use client'

import { useState } from 'react'

// Form bình luận công khai → POST /api/public-comments → AI kiểm duyệt + hàng chờ
export function CommentForm({ postId }: { postId: number }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', body: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/public-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: String(postId), ...form }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; message?: string }
      if (res.ok && json.ok) {
        setState('sent')
        setMessage(json.message ?? 'Cảm ơn bạn!')
        setForm({ name: '', email: '', body: '' })
      } else {
        setState('error')
        setMessage(json.error ?? 'Có lỗi xảy ra.')
      }
    } catch {
      setState('error')
      setMessage('Không gửi được. Kiểm tra kết nối rồi thử lại.')
    }
  }

  if (state === 'sent') {
    return (
      <div className="comment-form comment-form--sent" role="status">
        <p>{message}</p>
        <button type="button" onClick={() => setState('idle')} className="comment-again">
          Viết bình luận khác
        </button>
      </div>
    )
  }

  return (
    <form className="comment-form" onSubmit={onSubmit}>
      <div className="comment-row">
        <input
          required
          placeholder="Tên của bạn"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          aria-label="Tên của bạn"
        />
        <input
          type="email"
          placeholder="Email (tùy chọn, không hiển thị)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-label="Email"
        />
      </div>
      <textarea
        required
        rows={4}
        placeholder="Chia sẻ của bạn về hành trình này…"
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
        aria-label="Nội dung bình luận"
      />
      {state === 'error' ? <p className="comment-error">{message}</p> : null}
      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Đang gửi…' : 'Gửi bình luận'}
      </button>
    </form>
  )
}
