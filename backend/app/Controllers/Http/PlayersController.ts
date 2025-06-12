import PlayersManager from '#app/managers/players.manager'
import type { HttpContext } from '@adonisjs/core/http'

export default class PlayersController {
  public async index({ request }: HttpContext) {
    const manager = new PlayersManager()
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
    const manager = new PlayersManager()
    return await manager.create({
      data: {
        scoutId: request.input('scoutId'),
        convocationId: request.input('convocationId'),
        teammateId: request.input('teammateId'),
        aliases: request.input('aliases'),
        shirtId: request.input('shirtId'),
        role: request.input('role'),
        shirtNumber: request.input('shirtNumber'),
        shirtPrimaryColor: request.input('shirtPrimaryColor'),
        shirtSecondaryColor: request.input('shirtSecondaryColor'),
        isOpponent: request.input('isOpponent')
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new PlayersManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new PlayersManager()
    return await manager.update({
      data: {
        id: params.id,
        aliases: request.input('aliases'),
        shirtId: request.input('shirtId'),
        role: request.input('role'),
        shirtNumber: request.input('shirtNumber'),
        shirtPrimaryColor: request.input('shirtPrimaryColor'),
        shirtSecondaryColor: request.input('shirtSecondaryColor'),
        isOpponent: request.input('isOpponent')
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new PlayersManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }

  public async lastScoutEvents({ params, request }: HttpContext) {
    const manager = new PlayersManager()
    return await manager.lastScoutEvents({
      data: {
        player: {
          id: params.id,
        },
        scout: {
          id: request.input('scoutId')
        },
        limit: request.input('limit')
      }
    })
  }
}
