import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vi } from '@payloadcms/translations/languages/vi'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Locations } from './collections/Locations'
import { Comments } from './collections/Comments'
import { Tags } from './collections/Tags'
import { SiteSettings } from './globals/SiteSettings'
import { AIConfig } from './globals/AIConfig'
import { EmailConfig } from './globals/EmailConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Posts, Locations, Comments, Users, Media, Tags],
  globals: [SiteSettings, AIConfig, EmailConfig],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Giao diện quản trị tiếng Việt
  i18n: {
    fallbackLanguage: 'vi',
    supportedLanguages: { vi, en },
  },
  // Hàng đợi job: chạy các bài đăng theo lịch (mỗi phút quét một lần)
  jobs: {
    autoRun: [
      {
        cron: '* * * * *',
        allQueues: true,
        limit: 10,
      },
    ],
    deleteJobOnComplete: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [],
})
