import { defineConfig } from '@adonisjs/auth'
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'
import { basicAuthGuard, basicAuthUserProvider } from '@adonisjs/auth/basic_auth'
import type { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'api',
  guards: {
    api: tokensGuard({
      provider: tokensUserProvider({
        tokens: 'accessTokens',
        model: () => import('#models/User'),
      }),
    }),
    refresh: tokensGuard({
      provider: tokensUserProvider({
        tokens: 'rememberMeTokens',
        model: () => import('#models/User'),
      }),
    }),
    basic: basicAuthGuard({
      provider: basicAuthUserProvider({
        model: () => import('#models/User'),
      }),
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
