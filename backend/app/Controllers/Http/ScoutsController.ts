import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ScoutsManager from 'App/managers/scouts.manager'

export default class ScoutsController {
  public async index({ request }: HttpContextContract) {
    const manager = new ScoutsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
        order: request.input('order')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new ScoutsManager()

    return await manager.create({
      data: {
        sport: request.input('sport'),
        name: request.input('name'),
        startedAt: request.input('startedAt'),
        eventId: request.input('eventId'),
        scoringSystemId: request.input('scoringSystemId')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new ScoutsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new ScoutsManager()
    return await manager.update({
      data: {
        id: params.id,
        sport: request.input('sport'),
        name: request.input('name'),
        startedAt: request.input('startedAt'),
        eventId: request.input('eventId'),
        scoringSystemId: request.input('scoringSystemId')
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new ScoutsManager()
    return await manager.destroy({
      data: {
        id: params.id
      }
    })
  }
}
