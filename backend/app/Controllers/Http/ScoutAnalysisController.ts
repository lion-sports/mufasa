import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InvitationsManager from 'App/managers/invitations.manager'

export default class ScoutAnalysisController {
  public async inviteUser({ request }: HttpContextContract) {
    const manager = new InvitationsManager()

    const user = request.input('user')
    const team = request.input('team')
    const group = request.input('group')

    return await manager.inviteUser({
      data: {
        user: {
          email: user.email
        },
        team: {
          id: team.id
        },
        group: group
      }
    })
  }
}
