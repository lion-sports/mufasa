import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'
import app from '@adonisjs/core/services/app'
import { InferDriveDisks } from '@adonisjs/drive/types'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'local'),
  services: {
    assets: services.fs({
      visibility: 'public',
      location: app.publicPath('serve'),
      serveFiles: true,
      routeBasePath: '/public/serve',
    }),
    local: services.fs({
      visibility: 'public',
      location: app.makePath('media'),
      serveFiles: true,
      routeBasePath: '/public/media',
    }),
    tmp: services.fs({
      visibility: 'private',
      location: app.tmpPath(),
    }),
    s3: services.s3({
      visibility: 'public',
      credentials: {
        accessKeyId: env.get('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: env.get('S3_SECRET_ACCESS_KEY', ''),
      },
      region: env.get('S3_REGION'),
      bucket: env.get('S3_BUCKET', ''),
      endpoint: env.get('S3_ENDPOINT'),
    })
  },
})

export default driveConfig

declare module '@adonisjs/drive' {
  interface DisksList extends InferDriveDisks<typeof driveConfig> { }
}
