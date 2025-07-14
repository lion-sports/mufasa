import server from '@adonisjs/core/services/server'
import router from '@adonisjs/core/services/router'

server.errorHandler(() => import('#exceptions/Handler'))

server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/vite/vite_middleware'),
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/cors/cors_middleware')
])

router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('@adonisjs/session/session_middleware'),
])

export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  silentAuth: () => import('#middleware/silent_auth')
})
