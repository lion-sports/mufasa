import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TeammatesManager from 'App/managers/teammates.manager'

export default class TeammatesController {
  public async update({ request, params }: HttpContextContract) {
    const manager = new TeammatesManager()
    return await manager.update({
      data: {
        id: params.id,
        alias: request.input('alias'),
        roleId: request.input('roleId'),
      }
    })
  }

  public async mostAbsenceForTeammates({ }: HttpContextContract) {
    const manager = new TeammatesManager()
    return await manager.mostAbsenceForTeammates()
  }
}
