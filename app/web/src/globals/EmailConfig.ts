import type { GlobalConfig } from 'payload'

// Thiết lập gửi email thông báo khi có bình luận mới — cấu hình qua UI,
// không nằm trong .env. Dùng SMTP bất kỳ (Gmail app-password, Resend, Mailgun...).
export const EmailConfig: GlobalConfig = {
  slug: 'email-config',
  label: 'Thiết lập email',
  access: {
    read: ({ req }) => Boolean(req.user), // mật khẩu SMTP không lộ công khai
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Gửi email khi có bình luận mới',
      defaultValue: false,
    },
    {
      name: 'smtpHost',
      type: 'text',
      label: 'Máy chủ SMTP',
      admin: {
        description: 'VD: smtp.gmail.com (Gmail), smtp.resend.com (Resend), smtp.mailgun.org (Mailgun).',
      },
    },
    { name: 'smtpPort', type: 'number', label: 'Cổng', defaultValue: 465 },
    { name: 'smtpUser', type: 'text', label: 'Tên đăng nhập SMTP' },
    {
      name: 'smtpPass',
      type: 'text',
      label: 'Mật khẩu SMTP',
      admin: {
        description:
          'Gmail: dùng "Mật khẩu ứng dụng" (App Password) chứ không phải mật khẩu đăng nhập — tạo tại myaccount.google.com/apppasswords.',
      },
    },
    {
      name: 'fromAddress',
      type: 'email',
      label: 'Địa chỉ gửi (From)',
      admin: { description: 'Thường trùng tên đăng nhập SMTP.' },
    },
    {
      name: 'notifyEmail',
      type: 'email',
      label: 'Nhận thông báo tại',
      admin: { description: 'Email của bạn — nơi nhận thông báo bình luận mới.' },
    },
  ],
}
