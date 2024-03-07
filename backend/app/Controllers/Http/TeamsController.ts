import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TeamsManager from "App/managers/teams.manager";

export default class TeamsController {
  public async index({ request }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.create({
      data: {
        name: request.body().name,
        notes: request.body().notes
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        notes: request.input('notes')
      }
    })
  }

  public async updatePreference({ request, params }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.updatePreference({
      data: {
        id: params.id,
        preference: request.input('preference'),
        value: request.input('value')
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }

  public async removeUser({ params, request }: HttpContextContract) {
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

  public async exit({ params, auth }: HttpContextContract) {
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

  public async absencesInLatestEvents({ request }: HttpContextContract) {
    const manager = new TeamsManager()
    return await manager.absencesInLatestEvents({
      data: {
        forLastEvents: Number(request.input('forLastEvents'))
      }
    })
  }
}
