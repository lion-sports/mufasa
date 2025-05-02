import Invitation from '#app/Models/Invitation'
import User from '#app/Models/User'
import TeamsManager from './teams.manager.js'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import AuthorizationManager from './authorization.manager.js';
import { Context, withTransaction, withUser } from './base.manager.js';
import { ModelObject } from "@adonisjs/lucid/types/model";
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type InviteUserParams = {
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

    let group: Group | undefined = undefined
    if(!!params.data.group?.id) {
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
    if (!!group) {
      invitation.groupId = group.id
      await invitation.related('group').associate(group)
    }
    await invitation.related('invitedBy').associate(user)
    await invitation.related('team').associate(team)

    if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
    if (!!invitation.teamId) await invitation.load('team')
    if (!!invitation.groupId) await invitation.load('group')
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
      .preload('group')
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