import ScoringSystemsManager from '#app/managers/scoringSystems.manager'
import type { HttpContext } from '@adonisjs/core/http'

export default class ScoringSystemsController {
  public async index({ request }: HttpContext) {
    const manager = new ScoringSystemsManager()
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
    const manager = new ScoringSystemsManager()
    return await manager.create({
      data: {
        public: request.input('public'),
        name: request.input('name'),
        sport: request.input('sport'),
        config: request.input('config'),
        createdForTeamId: request.input('createdForTeamId')
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new ScoringSystemsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new ScoringSystemsManager()
    return await manager.update({
      data: {
        id: params.id,
        public: request.input('public'),
        name: request.input('name'),
        sport: request.input('sport'),
        config: request.input('config')
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new ScoringSystemsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
