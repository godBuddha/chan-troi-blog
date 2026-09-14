// Lớp gọi AI qua API của provider (chuẩn OpenAI-compatible: OpenRouter, OpenAI, Gemini, vLLM...)
// Provider nào cũng dùng chung một endpoint — đổi model/provider chỉ trong trang Cài đặt.

export type Verdict = {
  label: 'approve' | 'review' | 'reject' | 'spam'
  confidence: number
  reason: string
}

const VALID: Verdict['label'][] = ['approve', 'review', 'reject', 'spam']

export async function runModeration(opts: {
  baseUrl: string
  apiKey?: string | null
  model: string
  prompt?: string | null
  text: string
}): Promise<Verdict> {
  const base = (opts.baseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, '')
  const system =
    opts.prompt ||
    'Bạn là bộ kiểm duyệt bình luận. Trả về DUY NHẤT JSON: {"label":"approve|review|reject|spam","confidence":0-100,"reason":"lý do ngắn"}'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.apiKey ?? ''}`,
        // OpenRouter khuyến khích đặt tên ứng dụng — không bắt buộc.
        // Lưu ý: header phải là ASCII (không được dùng chuỗi có dấu tiếng Việt).
        'HTTP-Referer': 'https://chan-troi.local',
        'X-Title': 'Chan Troi blog',
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: opts.text },
        ],
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`AI HTTP ${res.status}: ${body.slice(0, 200)}`)
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = json.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(content) as Partial<Verdict>

    const label = VALID.includes(parsed.label as Verdict['label'])
      ? (parsed.label as Verdict['label'])
      : 'review'
    const confidence =
      typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.confidence))) : 50

    return { label, confidence, reason: String(parsed.reason ?? '—').slice(0, 500) }
  } finally {
    clearTimeout(timer)
  }
}
