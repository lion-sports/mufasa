import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PermissionManager from 'App/managers/permission.manager'

export default class PermissionsController {
  public async index({ request }: HttpContextContract) {
    const manager = new PermissionManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new PermissionManager()

    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

}
