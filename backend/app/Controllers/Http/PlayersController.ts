import PlayersManager from 'App/managers/players.manager'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PlayersController {
  public async index({ request }: HttpContextContract) {
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

  public async store({ request }: HttpContextContract) {
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

  public async show({ params }: HttpContextContract) {
    const manager = new PlayersManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
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

  public async destroy({ params }: HttpContextContract) {
    const manager = new PlayersManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }

  public async lastScoutEvents({ params, request }: HttpContextContract) {
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
