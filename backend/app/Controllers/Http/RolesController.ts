import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RoleManager from 'App/managers/role.manager'

export default class RolesController {
  public async index({ request }: HttpContextContract) {
    const manager = new RoleManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new RoleManager()

    return await manager.create({
      data: {
        name: request.input('name'),
        permissions: request.input('permissions')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new RoleManager()

    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new RoleManager()

    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        permissions: request.input('permissions')
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new RoleManager()

    return await manager.destroy({
      data: {
        id: params.id
      }
    })
  }
}
