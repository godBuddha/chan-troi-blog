import type { CollectionConfig, PayloadRequest } from 'payload'

import { runModeration } from '../lib/ai'

// Quyền đọc công khai: chỉ thấy bình luận đã duyệt; admin thấy tất cả.
const publicRead = {
  read: ({ req }: { req: PayloadRequest }) => {
    if (req.user) return true
    return { or: [{ status: { equals: 'approved' } }, { status: { equals: 'replied' } }] }
  },
} as const

// Thư thông báo bình luận mới cho chủ blog — gửi nền, lỗi chỉ ghi log,
// không bao giờ làm hỏng việc khách gửi bình luận.
async function notifyNewComment(req: PayloadRequest, doc: { id: number; name?: string; body?: string; post?: unknown }): Promise<void> {
  try {
    const cfg = await req.payload.findGlobal({ slug: 'email-config' })
    if (!cfg?.enabled || !cfg.smtpHost || !cfg.smtpUser || !cfg.smtpPass || !cfg.notifyEmail) return

    const nodemailer = (await import('nodemailer')).default
    const transport = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort ?? 465,
      secure: (cfg.smtpPort ?? 465) === 465,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    })

    const postId = typeof doc.post === 'object' ? (doc.post as { id?: number })?.id : doc.post
    const post = postId ? await req.payload.findByID({ collection: 'posts', id: postId as number, depth: 0 }) : null
    const settings = await req.payload.findGlobal({ slug: 'site-settings' })
    const base = (settings?.siteUrl?.trim().replace(/\/+$/, '') || '') || 'http://localhost'

    const body = doc.body ?? ''
    const preview = body.length > 300 ? `${body.slice(0, 300)}…` : body
    await transport.sendMail({
      from: cfg.fromAddress || cfg.smtpUser,
      to: cfg.notifyEmail,
      subject: `Bình luận mới từ ${doc.name ?? 'khách'}${post ? ` — ${post.title}` : ''}`,
      text: [
        `${doc.name ?? '(không tên)'} vừa bình luận${post ? ` trong bài "${post.title}"` : ''}:`,
        '',
        preview,
        '',
        `Trạng thái: hàng chờ / AI đã chấm — xem và duyệt tại:`,
        `${base}/admin/collections/comments/${doc.id}`,
      ].join('\n'),
    })
    req.payload.logger.info(`Đã gửi email thông báo bình luận #${doc.id}`)
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Gửi email thông báo thất bại (bình luận vẫn được lưu)' })
  }
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['post', 'name', 'status', 'ai_verdict', 'ai_confidence', 'createdAt'],
    description:
      'Bình luận mới về là "chờ duyệt". AI sẽ đọc và đề xuất — bạn xem, sửa, trả lời, xóa hoặc duyệt/từ chối trực tiếp tại đây.',
  },
  access: {
    // Công khai chỉ đọc được bình luận đã duyệt (hoặc đã có phản hồi của chủ blog)
    ...publicRead,
    // Ai cũng gửi được bình luận (kèm kiểm duyệt)
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: 'Bài viết',
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', required: true, label: 'Tên người bình luận' },
    {
      name: 'email',
      type: 'email',
      label: 'Email (không hiển thị công khai)',
      admin: {
        position: 'sidebar',
        description: 'Chỉ chủ blog nhìn thấy — dùng để trả lời nếu cần.',
      },
    },
    { name: 'body', type: 'textarea', required: true, label: 'Nội dung' },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      label: 'Trả lời cho bình luận',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'pending',
      options: [
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đã duyệt', value: 'approved' },
        { label: 'Đã trả lời', value: 'replied' },
        { label: 'Từ chối', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'collapsible',
      label: 'Nhận xét của AI',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'ai_verdict',
          type: 'select',
          label: 'Đề xuất của AI',
          options: [
            { label: 'Duyệt', value: 'approve' },
            { label: 'Cần người xem', value: 'review' },
            { label: 'Từ chối', value: 'reject' },
            { label: 'Spam', value: 'spam' },
          ],
        },
        { name: 'ai_reason', type: 'textarea', label: 'Lý do' },
        {
          name: 'ai_confidence',
          type: 'number',
          label: 'Độ tin cậy (%)',
          min: 0,
          max: 100,
        },
        { name: 'ai_model', type: 'text', label: 'Model đã dùng', admin: { readOnly: true } },
        { name: 'ai_checked_at', type: 'date', label: 'Thời điểm kiểm', admin: { readOnly: true } },
      ],
    },
  ],
  hooks: {
    afterChange: [
      // Bình luận mới đã lưu xong → nhắc chủ blog bằng email (nếu bật trong Thiết lập email)
      ({ doc, req, operation }) => {
        if (operation === 'create') void notifyNewComment(req, doc)
      },
    ],
    beforeChange: [
      // Khi có bình luận mới: gọi AI kiểm duyệt (nếu đã bật trong Cài đặt) rồi đặt trạng thái.
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data
        const settings = await req.payload.findGlobal({ slug: 'ai-config' })
        if (!settings?.enabled) return data

        const text = `${data.name ?? ''}\n${data.body ?? ''}`
        try {
          const verdict = await runModeration({
            baseUrl: settings.baseUrl ?? 'https://openrouter.ai/api/v1',
            apiKey: settings.apiKey,
            model: settings.model ?? 'google/gemini-2.5-flash-lite',
            prompt: settings.systemPrompt,
            text,
          })
          data.ai_verdict = verdict.label
          data.ai_reason = verdict.reason
          data.ai_confidence = verdict.confidence
          data.ai_model = `${settings.provider}:${settings.model}`
          data.ai_checked_at = new Date().toISOString()

          // Bảng ngưỡng tin cậy theo từng loại đề xuất (cấu hình trong Thiết lập AI)
          const STATUS_BY_VERDICT: Record<string, string> = {
            approve: 'approved',
            reject: 'rejected',
            spam: 'spam',
            review: 'pending', // "cần người xem" → luôn vào hàng chờ, không tự áp dụng
          }
          const rule = (settings.thresholds ?? []).find((t) => t?.verdict === verdict.label)
          if (settings.autoApprove && rule && verdict.confidence >= (rule.minConfidence ?? 100)) {
            data.status = STATUS_BY_VERDICT[verdict.label] ?? 'pending'
          } else {
            data.status = 'pending' // dưới ngưỡng / chưa đặt ngưỡng / autoApprove tắt → hàng chờ
          }
        } catch (err) {
          req.payload.logger.error({ err, msg: 'AI moderation thất bại — bình luận vào hàng chờ' })
          data.status = 'pending'
        }
        return data
      },
    ],
  },
}
