import GroupsManager from '#app/managers/groups.manager'
import type { HttpContext } from '@adonisjs/core/http'

export default class GroupsController {
  public async index({ params, request }: HttpContext) {
    const manager = new GroupsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder')
      }
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new GroupsManager()
    return await manager.create({
      data: {
        name: request.input('name'),
        team: request.input('team'),
        club: request.input('club'),
        cans: request.input('cans'),
        convocable: request.input('convocable')
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new GroupsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContext) {
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

  public async destroy({ params }: HttpContext) {
    const manager = new GroupsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
