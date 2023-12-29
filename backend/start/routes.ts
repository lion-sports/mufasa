/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', ({ response }) => response.redirect('/web'))

Route.group(() => {
  Route.get('/', ({ response }) => response.redirect('/web/users'))
  
  Route.get('/login/', async ({ view }) => {
    return view.render('auth/login')
  })
  Route.get('/login/:error', async ({ view, request }) => {
    return view.render('auth/login', { error: request.param('error') })
  })

  Route.get('/jobs', 'Web/JobsController.index').middleware('auth:web')

  Route.get('/users', 'Web/UsersController.index').middleware('auth:web')
  Route.get('/users/new', 'Web/UsersController.new').middleware('auth:web')
  Route.get('/users/:id/sendVerificationEmail', 'Web/UsersController.sendVerifyAccountEmail').middleware('auth:web')
  Route.get('/users/:id/edit', 'Web/UsersController.edit').middleware('auth:web')
  
  Route.post('/api/login', 'AuthController.loginWeb')
  Route.post('/api/logout', 'AuthController.logoutWeb').middleware('auth:web')
  Route.post('/api/users/store', 'Web/UsersController.store').middleware('auth:web')
  Route.post('/api/users/:id/update', 'Web/UsersController.update').middleware('auth:web')
})
.prefix('/web')



Route.get('/daemon', () => {
  return { message: 'running' }
})

Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/sendResetPassword', 'AuthController.sendResetPassword').middleware('throttle:resetPassword')
Route.post('/auth/resetPassword', 'AuthController.resetPassword').middleware('throttle:resetPassword')
Route.post('/auth/logout', 'AuthController.logout').middleware('auth:api')
Route.get('/auth/me', 'AuthController.me').middleware('auth:api')
Route.resource('users', 'UsersController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.resource('permissions', 'PermissionsController')
  .only(['index', 'show'])
  .middleware({
    '*': ['auth:api']
  })

Route.resource('roles', 'RolesController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })
