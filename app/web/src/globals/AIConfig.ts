import type { GlobalConfig } from 'payload'

// Thiết lập AI — bạn tự điền API key trong trang quản trị, không nằm trong .env.
export const AIConfig: GlobalConfig = {
  slug: 'ai-config',
  label: 'Thiết lập AI',
  access: {
    read: ({ req }) => Boolean(req.user), // key chỉ admin thấy; công khai không đọc được
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Bật kiểm duyệt bình luận bằng AI',
      defaultValue: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          type: 'select',
          label: 'Provider',
          defaultValue: 'openrouter',
          options: [
            { label: 'OpenRouter', value: 'openrouter' },
            { label: 'OpenAI', value: 'openai' },
            { label: 'Google Gemini (OpenAI-compatible)', value: 'gemini' },
            { label: 'Anthropic', value: 'anthropic' },
            { label: 'Khác (tự điền baseUrl)', value: 'custom' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'baseUrl',
          type: 'text',
          label: 'API base URL',
          defaultValue: 'https://openrouter.ai/api/v1',
          admin: {
            width: '33%',
            description: 'OpenAI: https://api.openai.com/v1 · Gemini: https://generativelanguage.googleapis.com/v1beta/openai',
          },
        },
        {
          name: 'model',
          type: 'text',
          label: 'Model',
          defaultValue: 'google/gemini-2.5-flash-lite',
          admin: { width: '33%', description: 'Model rẻ/nhanh là đủ cho duyệt bình luận.' },
        },
      ],
    },
    {
      name: 'apiKey',
      type: 'text',
      label: 'API key',
      admin: {
        description: 'Điền key của bạn (VD: sk-or-v1-...). Nó được lưu trong database của chính bạn — không nằm trong file .env, không gửi đi đâu khác.',
      },
    },
    {
      name: 'autoApprove',
      type: 'checkbox',
      label: 'Tự áp dụng kết quả của AI theo ngưỡng tin cậy',
      defaultValue: true,
      admin: {
        description:
          'Bật = AI tự duyệt/từ chối đánh dấu spam khi đủ tin cậy theo các ngưỡng dưới đây. Tắt = mọi bình luận luôn chờ bạn duyệt.',
      },
    },
    {
      name: 'thresholds',
      type: 'array',
      label: 'Ngưỡng tin cậy cho từng loại đánh giá',
      labels: { singular: 'Ngưỡng', plural: 'Ngưỡng' },
      minRows: 1,
      defaultValue: [
        { verdict: 'approve', minConfidence: 80 },
        { verdict: 'reject', minConfidence: 85 },
        { verdict: 'spam', minConfidence: 85 },
      ],
      admin: {
        description:
          'Với mỗi loại đề xuất của AI: nếu độ tin cậy ≥ ngưỡng thì AI tự áp dụng (duyệt / từ chối / đánh dấu spam); thấp hơn ngưỡng thì đưa vào hàng chờ để bạn tự xem.',
      },
      fields: [
        {
          name: 'verdict',
          type: 'select',
          label: 'Loại đề xuất của AI',
          required: true,
          options: [
            { label: 'Duyệt (approve)', value: 'approve' },
            { label: 'Từ chối (reject)', value: 'reject' },
            { label: 'Spam', value: 'spam' },
          ],
        },
        {
          name: 'minConfidence',
          type: 'number',
          label: 'Ngưỡng tin cậy tối thiểu (%)',
          required: true,
          min: 0,
          max: 100,
          defaultValue: 80,
          admin: { description: '0–100. Đặt cao = AI ít tự quyết hơn; đặt 100 = gần như chỉ duyệt khi AI tuyệt đối chắc chắn.' },
        },
      ],
    },
    {
      name: 'systemPrompt',
      type: 'textarea',
      label: 'Prompt kiểm duyệt',
      defaultValue: `Bạn là bộ kiểm duyệt bình luận cho một blog du lịch cá nhân.
Đánh giá bình luận sau và trả về DUY NHẤT một JSON object (không kèm chữ nào khác):
{"label":"approve|review|reject|spam","confidence":0-100,"reason":"lý do ngắn bằng tiếng Việt"}

Tiêu chí:
- approve: bình luận xây dựng, liên quan đến bài, lịch sự.
- review: mập mờ, câu hỏi riêng tư, chê trách vừa phải — cần chủ blog xem.
- reject: xúc phạm, công kích, nội dung không phù hợp.
- spam: quảng cáo, link rác, lặp lại máy móc.`,
    },
  ],
}
