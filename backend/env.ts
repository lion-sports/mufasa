/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  ADMIN_USER_SEED_PASSWORD: Env.schema.string.optional(),
  FRONTEND_URL: (_key, value) => {
    if(!value) throw new Error('FRONTEND_URL env variable is missing')
    else if(!value.startsWith('http')) throw new Error("FRONTEND_URL: bad url");
    else return value
  },
  RESET_PASSWORD_URL: Env.schema.string.optional(),
  SMTP_HOST: Env.schema.string.optional({ format: 'host' }),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  SESSION_DRIVER: Env.schema.string(),
  MAILGUN_API_KEY: Env.schema.string(),
  MAILGUN_DOMAIN: Env.schema.string(),
  TEST_EMAIL: Env.schema.string.optional(),
  REDIS_HOST: Env.schema.string(),
  REDIS_PORT: Env.schema.string(),
  REDIS_PASSWORD: Env.schema.string.optional()
})
