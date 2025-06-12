import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID', 'some_client_id'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET', 'some_secret'),
    callbackUrl: env.get('GOOGLE_CALLBACK_URL') || 'http://127.0.0.1:3333/auth/google/callback',
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}