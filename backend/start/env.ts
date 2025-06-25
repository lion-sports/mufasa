import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum.optional(['local', 's3'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  GOOGLE_IOS_CLIENT_ID: Env.schema.string.optional(),
  GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),
  GOOGLE_CALLBACK_URL: Env.schema.string.optional(),
  FRONTEND_URL: Env.schema.string.optional(),
  MONGO_URL: Env.schema.string.optional(),
  MONGO_DB: Env.schema.string.optional(),
  TELEGRAM_FIPAV_BOT_TOKEN: Env.schema.string.optional(),
  PUBLIC_URL: Env.schema.string.optional(),
  PG_HOST: Env.schema.string({ format: 'host' }),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),
  HASH_DRIVER: Env.schema.enum.optional(['argon', 'bcrypt'] as const),
  REDIS_CONNECTION: Env.schema.enum(['local'] as const),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),
  S3_ACCESS_KEY_ID: Env.schema.string.optionalWhen(process.env.DRIVE_DISK != 's3'),
  S3_SECRET_ACCESS_KEY: Env.schema.string.optionalWhen(process.env.DRIVE_DISK != 's3'),
  S3_REGION: Env.schema.string.optionalWhen(process.env.DRIVE_DISK != 's3'),
  S3_BUCKET: Env.schema.string.optionalWhen(process.env.DRIVE_DISK != 's3'),
  S3_ENDPOINT: Env.schema.string.optionalWhen(process.env.DRIVE_DISK != 's3'),
  LOG_INTERNAL_SERVER_ERRORS: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
})
