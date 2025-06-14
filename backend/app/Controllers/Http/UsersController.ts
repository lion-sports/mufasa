import type { HttpContext } from '@adonisjs/core/http'
import UsersManager from '#app/managers/user.manager'

export default class UsersController {
  public async index({ request }: HttpContext) {
    const manager = new UsersManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new UsersManager()
    return await manager.get({
      data: {
        id: params.id,
      },
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new UsersManager()
    return await manager.update({
      data: {
        id: params.id,
        email: request.input('email'),
        birthday: request.input('birthday'),
        password: request.input('password'),
        firstname: request.input('firstname'),
        lastname: request.input('lastname'),
      },
    })
  }
}
