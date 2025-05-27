import type { HttpContext } from '@adonisjs/core/http'
import TeamsManager from "#app/managers/teams.manager";

export default class TeamsController {
  public async index({ request }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage')
      }
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.create({
      data: {
        name: request.input('name'),
        notes: request.input('notes'),
        sport: request.input('sport'),
        clubId: request.input('clubId')
      }
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        notes: request.input('notes'),
        sport: request.input('sport')
      }
    })
  }

  public async updatePreference({ request, params }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.updatePreference({
      data: {
        id: params.id,
        preference: request.input('preference'),
        value: request.input('value')
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }

  public async removeUser({ params, request }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.removeUser({
      data: {
        team: {
          id: params.id
        },
        user: request.input('user')
      }
    })
  }

  public async exit({ params, auth }: HttpContext) {
    if(!!auth.user) {
      const manager = new TeamsManager()
      return await manager.removeUser({
        data: {
          team: {
            id: params.id
          },
          user: auth.user
        }
      })
    } else {
      throw new Error('user not present in team')
    }
  }

  public async absencesInLatestEvents({ request }: HttpContext) {
    const manager = new TeamsManager()
    return await manager.absencesInLatestEvents({
      data: {
        forLastEvents: Number(request.input('forLastEvents'))
      }
    })
  }
}
