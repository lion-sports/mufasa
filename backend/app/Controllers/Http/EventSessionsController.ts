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
        teamId: request.input('teamId'),
        eventStatusId: request.input('eventStatusId'),
        aggregationStrategy: request.input('aggregationStrategy')
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
        eventStatusId: request.input('eventStatusId'),
        aggregationStrategy: request.input('aggregationStrategy')
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

  public async addEvents({ params, request }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.addEvents({
      data: {
        eventSession: {
          id: params.id
        },
        events: request.input('events')
      }
    })
  }

  public async removeEvents({ params, request }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.removeEvents({
      data: {
        eventSession: {
          id: params.id
        },
        events: request.input('events')
      }
    })
  }

  public async setEvents({ params, request }: HttpContext) {
    const manager = new EventSessionsManager()
    return await manager.setEvents({
      data: {
        eventSession: {
          id: params.id
        },
        events: request.input('events')
      }
    })
  }
}
