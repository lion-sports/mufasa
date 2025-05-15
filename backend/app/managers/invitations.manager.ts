import Invitation from '#app/Models/Invitation'
import User from '#app/Models/User'
import TeamsManager from './teams.manager.js'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js';
import { Context, withTransaction, withUser } from './base.manager.js';
import { ModelObject } from "@adonisjs/lucid/types/model";
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import ClubsManager from './clubs.manager.js'
import Club from '#models/Club'
import FilterModifierApplier, { Modifier } from '#services/FilterModifierApplier'

export default class InvitationsManager {
  @withTransaction
  @withUser
  public async inviteUser(params: {
    data: {
      user: {
        email: string
      },
      team?: {
        id: number
      },
      club?: {
        id: number
      },
      group?: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 
    
    if(!!params.data.team?.id) {
      return await this.inviteUserToTeam({
        data: {
          user: params.data.user,
          team: params.data.team,
          group: params.data.group
        },
        context: { user, trx }
      })
    } else if(!!params.data.club?.id) {
      return await this.inviteUserToClub({
        data: {
          user: params.data.user,
          club: params.data.club,
          group: params.data.group
        },
        context: { user, trx }
      })
    } else throw new Error('no club or team defined')
  }

  @withTransaction
  @withUser
  public async inviteUserToTeam(params: {
    data: {
      user: {
        email: string
      },
      team: {
        id: number
      },
      group?: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    const team = await Team.query({ client: trx })
      .where('id', params.data.team.id)
      .firstOrFail()

    let group: Group | undefined = undefined
    if (!!params.data.group?.id) {
      group = await Group.query({ client: trx })
        .where('id', params.data.group.id)
        .firstOrFail()
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'invite',
        resource: 'team',
        entities: {
          team: {
            id: params.data.team.id
          },
          invitee: {
            email: params.data.user.email
          }
        }
      },
      context: { trx }
    })

    if (!params.data.user.email) throw new Error('invited user email must be defined')
    const invitedUser = await User.query({ client: trx })
      .where('email', params.data.user.email)
      .first()

    // if user exists check if he's already in the team
    if (!!invitedUser) {
      const teamsManager = new TeamsManager()
      const invitedUserBelongs = await teamsManager.userBelogsToTeam({
        data: {
          user: invitedUser,
          team: params.data.team
        },
        context: {
          trx,
          user
        }
      })

      if (invitedUserBelongs) throw new Error('invited user already exists')
    }

    // if it does not exists then send a mail to invite him

    // create the invitiation
    let invitation = await Invitation.firstOrCreate({
      invitedEmail: params.data.user.email,
      status: 'pending',
      teamId: team.id
    }, {}, { client: trx })

    if (!!invitedUser) await invitation.related('invite').associate(invitedUser)
    if (!!group) {
      invitation.groupId = group.id
      await invitation.related('group').associate(group)
    }
    await invitation.related('invitedBy').associate(user)

    if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
    if (!!invitation.teamId) await invitation.load('team')
    if (!!invitation.groupId) await invitation.load('group')
    return invitation
  }

  @withTransaction
  @withUser
  public async inviteUserToClub(params: {
    data: {
      user: {
        email: string
      },
      club: {
        id: number
      },
      group?: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const club = await Club.query({ client: trx })
      .where('id', params.data.club.id)
      .firstOrFail()

    let group: Group | undefined = undefined
    if (!!params.data.group?.id) {
      group = await Group.query({ client: trx })
        .where('id', params.data.group.id)
        .firstOrFail()
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'invite',
        resource: 'club',
        entities: {
          club: {
            id: params.data.club.id
          },
          invitee: {
            email: params.data.user.email
          }
        }
      },
      context: { trx }
    })

    if (!params.data.user.email) throw new Error('invited user email must be defined')
    const invitedUser = await User.query({ client: trx })
      .where('email', params.data.user.email)
      .first()

    // if user exists check if he's already in the club
    if (!!invitedUser) {
      const clubsManager = new ClubsManager()
      const invitedUserBelongs = await clubsManager.userBelogsToClub({
        data: {
          user: invitedUser,
          club: params.data.club
        },
        context: {
          trx,
          user
        }
      })

      if (invitedUserBelongs) throw new Error('invited user already exists')
    }

    // if it does not exists then send a mail to invite him

    // create the invitiation
    let invitation = await Invitation.firstOrCreate({
      invitedEmail: params.data.user.email,
      status: 'pending',
      clubId: club.id
    }, {}, { client: trx })

    if (!!invitedUser) await invitation.related('invite').associate(invitedUser)
    if (!!group) {
      invitation.groupId = group.id
      await invitation.related('group').associate(group)
    }
    await invitation.related('invitedBy').associate(user)

    if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
    if (!!invitation.clubId) await invitation.load('club')
    if (!!invitation.groupId) await invitation.load('group')
    return invitation
  }

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page: number
      perPage: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let query = Invitation.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    query.where(b => {
      b.where('invitedEmail', user.email)
        .orWhereHas('team', b => {
          b.orWhere(b => {
            return AuthorizationHelpers.userCanInTeamQuery({
              data: {
                query: b,
                user: user,
                resource: 'team',
                action: 'invite'
              }
            })
          })
        }).orWhereHas('club', b => {
          b.orWhere(b => {
            return AuthorizationHelpers.userCanInClubQuery({
              data: {
                query: b,
                user: user,
                resource: 'club',
                action: 'invite'
              }
            })
          })
        })
    }).preload('invitedBy')
      .orderBy('invitations.createdAt', 'desc')

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async acceptInvitation(params: {
    data: {
      invitation: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    const invitation = await Invitation
      .query({ client: trx })
      .preload('club')
      .preload('team')
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if(invitation.status != 'pending') throw new Error('cannot accept invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'accept',
        resource: 'invitation',
        entities: {
          invitation: invitation,
          invitee: user
        }
      },
      context: { trx }
    })

    // change status to the invitation
    invitation.status = 'accepted'
    const results = await invitation.useTransaction(trx).save()

    // join the team
    if(!!invitation.team) {
      let teamsManager = new TeamsManager()
      await teamsManager.addUser({
        data: {
          user: user,
          team: {
            id: invitation.teamId
          },
          group: {
            id: invitation.groupId
          }
        },
        context: {
          trx,
          user
        }
      })
    }

    // join the club
    if (!!invitation.club) {
      let clubsManager = new ClubsManager()
      await clubsManager.addUser({
        data: {
          user: user,
          club: {
            id: invitation.clubId
          },
          group: {
            id: invitation.groupId
          }
        },
        context: {
          trx,
          user
        }
      })
    }

    return results
  }

  @withTransaction
  @withUser
  public async rejectInvitation(params: {
    data: {
      invitation: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    // check if invitation exists
    const invitation = await Invitation
      .query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if (invitation.status != 'pending') throw new Error('cannot reject invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'reject',
        resource: 'invitation',
        entities: {
          invitation: invitation,
          invitee: user
        }
      },
      context: { trx }
    })

    invitation.status = 'rejected'
    return await invitation.save()
  }

  @withTransaction
  @withUser
  public async discardInvitation(params: {
    data: {
      invitation: {
        id: number
      }
    },
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    // check if invitation exists
    const invitation = await Invitation
      .query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if (invitation.status != 'pending') throw new Error('cannot discard invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'discard',
        resource: 'invitation',
        entities: {
          invitation: invitation,
        }
      },
      context: { trx }
    })

    invitation.status = 'discarded'
    return await invitation.save()
  }
}