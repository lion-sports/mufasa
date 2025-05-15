import type { HttpContext } from '@adonisjs/core/http'
import InvitationsManager from '#app/managers/invitations.manager'

export default class InvitationsController {
  public async inviteUser({ request }: HttpContext) {
    const manager = new InvitationsManager()

    const user = request.input('user')
    const team = request.input('team')
    const club = request.input('club')
    const group = request.input('group')

    return await manager.inviteUser({
      data: {
        user: {
          email: user.email
        },
        team: {
          id: team?.id
        },
        club: {
          id: club?.id
        },
        group: group
      }
    })
  }

  public async list({ request }: HttpContext) {
    const manager = new InvitationsManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder')
      }
    })
  }

  public async accept({ request }: HttpContext) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.acceptInvitation({
      data: {
        invitation: invitation
      }
    })
  }

  public async reject({ request }: HttpContext) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.rejectInvitation({
      data: {
        invitation: invitation
      }
    })
  }

  public async discard({ request }: HttpContext) {
    const manager = new InvitationsManager()

    const invitation = request.input('invitation')

    return await manager.discardInvitation({
      data: {
        invitation: invitation
      }
    })
  }

}
