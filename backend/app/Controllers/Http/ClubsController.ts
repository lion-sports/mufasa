import type { HttpContext } from '@adonisjs/core/http'
import ClubsManager from '#app/managers/clubs.manager'

export default class ClubsController {
  public async index({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.create({
      data: {
        name: request.input('name'),
        completeName: request.input('completeName'),
        bio: request.input('bio'),
        sport: request.input('sport')
      },
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.get({
      data: {
        id: params.id,
      },
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        completeName: request.input('completeName'),
        bio: request.input('bio'),
        sport: request.input('sport')
      },
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.destroy({
      data: {
        id: params.id,
      },
    })
  }
}