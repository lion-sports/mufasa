import type { HttpContext } from '@adonisjs/core/http'
import EventSessionsManager from "#app/managers/eventSessions.manager";

export default class EventSessionsController {
  public async index({ params }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.list({
      data: {
        page: params.page,
        perPage: params.perPage
      }
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new EventSessionsManager()

    return await manager.create({
      data: {
        name: request.input('name'),
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
