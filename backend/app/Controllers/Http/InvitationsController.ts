import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InvitationsManager from 'App/managers/invitations.manager'

export default class InvitationsController {
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

  public async list({ }: HttpContextContract) {
    const manager = new InvitationsManager()

    return await manager.getUserInvitations()
  }

  public async accept({ request }: HttpContextContract) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.acceptInvitation({
      data: {
        invitation: invitation
      }
    })
  }

  public async reject({ request }: HttpContextContract) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.rejectInvitation({
      data: {
        invitation: invitation
      }
    })
  }

  public async discard({ request }: HttpContextContract) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.discardInvitation({
      data: {
        invitation: invitation
      }
    })
  }

}
