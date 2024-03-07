import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EventSessionsManager from "App/managers/eventSessions.manager";

export default class EventSessionsController {
  public async index({ params }: HttpContextContract) {
    const manager = new EventSessionsManager()
    return await manager.list({
      data: {
        page: params.page,
        perPage: params.perPage
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new EventSessionsManager()

    return await manager.create({
      data: {
        name: request.input('name'),
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new EventSessionsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new EventSessionsManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new EventSessionsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
