import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersManager from 'App/managers/user.manager'

export default class UsersController {
  public async index({ request }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new UsersManager()
    return await manager.create({
      data: {
        email: request.body().email,
        firstname: request.body().firstname,
        lastname: request.body().lastname,
        password: request.body().password,
        phoneNumber: request.body().phoneNumber,
        roleId: request.body().roleId
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
        lastname: request.input('lastname'),
        firstname: request.input('firstname'),
        phoneNumber: request.input('phoneNumber'),
        roleId: request.input('roleId')
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new UsersManager()

    return await manager.destroy({
      data: {
        id: params.id
      }
    })
  }
}
