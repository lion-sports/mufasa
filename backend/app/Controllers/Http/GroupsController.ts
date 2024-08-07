import GroupsManager from 'App/managers/groups.manager'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GroupsController {
  public async index({ params, request }: HttpContextContract) {
    const manager = new GroupsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        team: {
          id: params.teamId
        }
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new GroupsManager()
    return await manager.create({
      data: {
        name: request.body().name,
        team: request.body().team,
        cans: request.input('cans'),
        convocable: request.input('convocable')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new GroupsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new GroupsManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        cans: request.input('cans'),
        convocable: request.input('convocable') 
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new GroupsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
