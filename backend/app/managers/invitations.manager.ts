import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import type Invitation from 'App/Models/Invitation'
import InvitationModel from 'App/Models/Invitation'
import UserModel from 'App/Models/User'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import TeamsManager from './teams.manager'
import TeamModel from 'App/Models/Team'
import RoleModel from 'App/Models/Role'
import AuthorizationManager from './authorization.manager';


export type Context = {
  user?: {
    id: number
  },
  trx?: TransactionClientContract
}

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

  public async inviteUser(params: InviteUserParams): Promise<Invitation> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to invite')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      // check if team exits
      const team = await TeamModel.query({ client: trx }).where('id', params.data.team.id).firstOrFail()

      // check if the role exists
      let role
      if(!!params.data.role?.id) {
        role = await RoleModel.query({ client: trx }).where('id', params.data.role.id).firstOrFail()
      }
      
      // check if the team is owned by the user
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
        context: { trx: trx }
      })

      // check if the user exists
      if (!params.data.user.email) throw new Error('invited user email must be defined')
      const invitedUser = await UserModel.query()
        .useTransaction(trx)
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
            trx: trx
          }
        })

        if(invitedUserBelongs) throw new Error('invited user already exists')
      }

      // if it does not exists then send a mail to invite him

      // create the invitiation
      const invitation = new InvitationModel()
      invitation.useTransaction(trx)
      invitation.invitedEmail = params.data.user.email
      invitation.status = 'pending'
      await invitation.save()

      if (!!invitedUser) await invitation.related('invite').associate(invitedUser)
      if (!!role) await invitation.related('role').associate(role)
      await invitation.related('invitedBy').associate(user)
      await invitation.related('team').associate(team)

      if (!params.context?.trx) await trx.commit()
      if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
      if (!!invitation.teamId) await invitation.load('team')
      if (!!invitation.roleId) await invitation.load('role')
      return invitation
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async getUserInvitations(params?: GetUserInvitationsParams): Promise<ModelObject[]> {
    const user = await this._getUserFromContext(params?.context)
    if (!user) throw new Error('user must be defined to get invitations')

    let trx = params?.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      const results = await InvitationModel
        .query({ client: trx })
        .where('invitedEmail', user.email)
        .where('status', 'pending')
        .preload('invitedBy')
        .preload('team')
        .preload('role')

      if (!params?.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params?.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async acceptInvitation(params: AcceptInvitationParams): Promise<Invitation> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to invite')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      // check if invitation exists
      const invitation = await InvitationModel
        .query()
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
        context: { trx: trx }
      })

      // change status to the invitation
      invitation.status = 'accepted'
      const results = await invitation.save()

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
          trx: trx
        }
      })

      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async rejectInvitation(params: RejectInvitationParams): Promise<Invitation> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to invite')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      // check if invitation exists
      const invitation = await InvitationModel
        .query()
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
        context: { trx: trx }
      })

      invitation.status = 'rejected'
      const results = await invitation.save()

      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async discardInvitation(params: AcceptInvitationParams): Promise<Invitation> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to invite')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      // check if invitation exists
      const invitation = await InvitationModel
        .query()
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
        context: { trx: trx }
      })

      invitation.status = 'discarded'
      const results = await invitation.save()

      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }


  private async _getUserFromContext(context?: Context) {
    if (!!context?.user) {
      return await UserModel.query().where('id', context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      return ctx?.auth?.user
    }
  }
}