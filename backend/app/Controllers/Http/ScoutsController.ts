import type { HttpContext } from '@adonisjs/core/http'
import ScoutExporter from '#app/managers/scout/scout.exporter'
import ScoutsManager from '#app/managers/scout/scouts.manager'

export default class ScoutsController {
  public async index({ request }: HttpContext) {
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

  public async store({ request }: HttpContext) {
    const manager = new ScoutsManager()

    return await manager.create({
      data: {
        sport: request.input('sport'),
        name: request.input('name'),
        startedAt: request.input('startedAt'),
        eventId: request.input('eventId'),
        scoringSystemId: request.input('scoringSystemId'),
        scoutInfo: request.input('scoutInfo')
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async importTeammates({ request, params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.importTeammates({
      data: {
        id: params.id,
        importShirts: request.input('importShirts'),
        importRoles: request.input('importRoles'),
        importAbsents: request.input('importAbsents')
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.update({
      data: {
        id: params.id,
        sport: request.input('sport'),
        name: request.input('name'),
        startedAt: request.input('startedAt'),
        eventId: request.input('eventId'),
        scoringSystemId: request.input('scoringSystemId'),
        scoutInfo: request.input('scoutInfo')
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.destroy({
      data: {
        id: params.id
      }
    })
  }

  public async studio({ params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.studio({
      data: {
        id: params.id
      }
    })
  }

  public async exportXlsx({ params }: HttpContext) {
    const manager = new ScoutExporter()
    return await manager.exportXlsx({
      data: {
        id: params.id
      }
    })
  }

  public async getFirstSetStartingSix({ params }: HttpContext) {
    const manager = new ScoutsManager()
    return await manager.getFirstSetStartingSix({
      data: {
        id: params.id
      }
    })
  }
}
