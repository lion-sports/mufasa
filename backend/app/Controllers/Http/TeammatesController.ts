import type { HttpContext } from '@adonisjs/core/http'
import TeammatesManager from '#app/managers/teammates.manager'

export default class TeammatesController {
  public async update({ request, params }: HttpContext) {
    const manager = new TeammatesManager()
    return await manager.update({
      data: {
        id: params.id,
        alias: request.input('alias'),
        defaultRole: request.input('defaultRole'),
        availableRoles: request.input('availableRoles'),
        groupId: request.input('groupId'),
      },
    })
  }

  public async mostAbsenceForTeammates({}: HttpContext) {
    const manager = new TeammatesManager()
    return await manager.mostAbsenceForTeammates({})
  }
}
