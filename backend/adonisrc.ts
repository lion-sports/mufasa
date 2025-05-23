import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@adonisjs/mail/commands'),
  ],
  preloads: [() => import('./start/routes.js'), () => import('./start/kernel.js')],
  providers: [
    () => import('./providers/AppProvider.js'),
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    { file: () => import('@adonisjs/core/providers/repl_provider'), environment: ['repl', 'test'] },
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/ally/ally_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('@adonisjs/vite/vite_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/drive/drive_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@adonisjs/core/providers/edge_provider')
  ],
  tests: {
    suites: [
      {
        name: 'functional',
        files: ['tests/functional/**/*.spec(.ts|.js)'],
        timeout: 60000,
      },
      {
        name: 'managers',
        files: ['tests/managers/**/*.spec(.ts|.js)'],
        timeout: 60000,
      },
    ],
  },
  assetsBundler: false,
  hooks: {
    onBuildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
  metaFiles: [{
    pattern: 'resources/views/**/*.edge',
    reloadServer: false,
  }]
})
