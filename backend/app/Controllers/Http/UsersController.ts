import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersManager from 'App/managers/user.manager'

export default class UsersController {
  public async index({ request }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filters: request.input('filters')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.create({
      data: {
        email: request.input('email'),
        password: request.input('password'),
        firstname: request.input('firstname'),
        lastname: request.input('lastname')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.update({
      data: {
        id: params.id,
        email: request.input('email'),
        password: request.input('password'),
        firstname: request.input('firstname'),
        lastname: request.input('lastname')
      }
    })
  }

  public async destroy({ }: HttpContextContract) { }
}
