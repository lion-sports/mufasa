import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import Invitation from 'App/Models/Invitation'
import User from 'App/Models/User'
import TeamsManager from './teams.manager'
import Team from 'App/Models/Team'
import Role from 'App/Models/Role'
import AuthorizationManager from './authorization.manager';
import { Context, withTransaction, withUser } from './base.manager';

export type InviteUserParams = {
  data: {
    user: {
      email: string
    },
    team: {
      id: number
    },
    role?: {
      id: number
    }
  },
  context?: Context
}

export type GetUserInvitationsParams = {
  data: { },
  context?: Context
}

export type AcceptInvitationParams = {
  data: {
    invitation: {
      id: number
    }
  },
  context?: Context
}

export type RejectInvitationParams = {
  data: {
    invitation: {
      id: number
    }
  },
  context?: Context
}

export type DiscardInvitationParams = {
  data: {
    invitation: {
      id: number
    }
  },
  context?: Context
}


export default class InvitationsManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async inviteUser(params: InviteUserParams): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    const team = await Team.query({ client: trx })
      .where('id', params.data.team.id)
      .firstOrFail()

    let role
    if(!!params.data.role?.id) {
      role = await Role.query({ client: trx })
        .where('id', params.data.role.id)
        .firstOrFail()
    }
    
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'invite',
        resource: 'Team',
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
    if(!!invitedUser) {
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

      if(invitedUserBelongs) throw new Error('invited user already exists')
    }

    // if it does not exists then send a mail to invite him

    // create the invitiation
    const invitation = new Invitation()
    invitation.useTransaction(trx)
    invitation.invitedEmail = params.data.user.email
    invitation.status = 'pending'
    await invitation.save()

    if (!!invitedUser) await invitation.related('invite').associate(invitedUser)
    if (!!role) await invitation.related('role').associate(role)
    await invitation.related('invitedBy').associate(user)
    await invitation.related('team').associate(team)

    if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
    if (!!invitation.teamId) await invitation.load('team')
    if (!!invitation.roleId) await invitation.load('role')
    return invitation
  }

  @withTransaction
  @withUser
  public async getUserInvitations(params?: GetUserInvitationsParams): Promise<ModelObject[]> {
    const trx = params?.context?.trx as TransactionClientContract
    const user = params?.context?.user as User 

    return await Invitation
      .query({ client: trx })
      .where('invitedEmail', user.email)
      .where('status', 'pending')
      .preload('invitedBy')
      .preload('team')
      .preload('role')
  }

  @withTransaction
  @withUser
  public async acceptInvitation(params: AcceptInvitationParams): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    const invitation = await Invitation
      .query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'accept',
        resource: 'Invitation',
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
    let teamsManager = new TeamsManager()
    await teamsManager.addUser({
      data: {
        user: user,
        team: {
          id: invitation.teamId
        },
        role: {
          id: invitation.roleId
        }
      },
      context: {
        trx,
        user
      }
    })

    return results
  }

  @withTransaction
  @withUser
  public async rejectInvitation(params: RejectInvitationParams): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    // check if invitation exists
    const invitation = await Invitation
      .query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'reject',
        resource: 'Invitation',
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
  public async discardInvitation(params: AcceptInvitationParams): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    // check if invitation exists
    const invitation = await Invitation
      .query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'discard',
        resource: 'Invitation',
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