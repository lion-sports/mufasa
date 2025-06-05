import Invitation from '#app/Models/Invitation'
import User from '#app/Models/User'
import TeamsManager from './teams.manager.js'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import { ModelObject } from '@adonisjs/lucid/types/model'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import ClubsManager from './clubs.manager.js'
import Club from '#models/Club'
import FilterModifierApplier, { Modifier } from '#services/FilterModifierApplier'
import encryption from '@adonisjs/core/services/encryption'
import string from '@adonisjs/core/helpers/string'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'
import { DateTime } from 'luxon'
import InvitationMail from '#app/mails/InvitationMail'
import mail from '@adonisjs/mail/services/main'

export default class InvitationsManager {
  @withTransaction
  @withUser
  public async inviteUser(params: {
    data: {
      user: {
        email: string
      }
      team?: {
        id: number
      }
      club?: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract

    const user = params.context?.user as User

    let team: Team | undefined = undefined
    let club: Club | undefined = undefined
    let teamGroup: Group | undefined = undefined
    let clubGroup: Group | undefined = undefined

    if (!!params.data.team?.id) {
      team = await Team.query({ client: trx }).where('id', params.data.team.id).firstOrFail()

      if (!!params.data.group?.id) {
        teamGroup = await Group.query({ client: trx })
          .where('id', params.data.group.id)
          .whereHas('team', (b) => b.where('id', team!.id))
          .firstOrFail()
      }
    }

    if (!!params.data.club?.id) {
      club = await Club.query({ client: trx }).where('id', params.data.club.id).firstOrFail()

      if (!!params.data.group?.id) {
        clubGroup = await Group.query({ client: trx })
          .where('id', params.data.group.id)
          .whereHas('club', (b) => b.where('id', club!.id))
          .firstOrFail()
      }
    }

    if (!!club) {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          ability: 'club_invite',
          data: {
            club: {
              id: club.id,
            },
          },
        },
        context: { trx },
      })
    } else if (!!team) {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          ability: 'team_invite',
          data: {
            team: {
              id: team.id,
            },
          },
        },
        context: { trx },
      })
    }

    if (!params.data.user.email) throw new Error('invited user email must be defined')
    const invitedUser = await User.query({ client: trx })
      .where('email', params.data.user.email)
      .first()

    let invitedUserBelogsToTeam: boolean = false,
      invitedUserBelogsToClub: boolean = false

    if (!!invitedUser) {
      if (!!team) {
        const teamsManager = new TeamsManager()
        invitedUserBelogsToTeam = await teamsManager.userBelogsToTeam({
          data: {
            user: invitedUser,
            team,
          },
          context: params.context,
        })
      }

      if (!!club) {
        const clubsManager = new ClubsManager()
        invitedUserBelogsToClub = await clubsManager.userBelogsToClub({
          data: {
            user: invitedUser,
            club,
          },
          context: params.context,
        })
      }
    }

    let invitation: Invitation | undefined = undefined
    if (!invitedUserBelogsToClub && !!club) {
      if (!!invitedUser) {
        invitation = await Invitation.firstOrCreate(
          {
            invitedEmail: params.data.user.email,
            status: 'pending',
            clubId: club.id,
          },
          {},
          { client: trx }
        )

        await invitation.related('invite').associate(invitedUser)

        if (!!clubGroup) {
          invitation.groupId = clubGroup.id
        }
      }
    }

    if (!invitedUserBelogsToTeam && !!team) {
      if (!!invitedUser) {
        if (!invitation) {
          invitation = await Invitation.firstOrCreate(
            {
              invitedEmail: params.data.user.email,
              status: 'pending',
              teamId: team.id,
            },
            {},
            { client: trx }
          )
        }

        await invitation.related('invite').associate(invitedUser)

        if (!!teamGroup) {
          invitation.groupId = teamGroup.id
        }
      }
    }

    if (!invitedUser) {
      const { url, invitation: urlInvitation } = await this.inviteUserByUrl({
        data: {
          group: teamGroup,
          team,
          club,
        },
        context: params.context,
      })

      invitation = urlInvitation
      invitation.invitedEmail = params.data.user.email
      await invitation.save()

      const email = new InvitationMail({
        invitationUrl: url,
        invitedBy: user,
        invitedUserEmail: params.data.user.email,
      })
      await mail.sendLater(email)
    }

    if (!invitation) throw new Error('cannot invite either to a team or a club')

    await invitation.related('invitedBy').associate(user)
    if (!!invitation.invitedByUserId) await invitation.load('invitedBy')
    if (!!invitation.teamId) await invitation.load('team')
    if (!!invitation.clubId) await invitation.load('club')
    if (!!invitation.groupId) await invitation.load('group')

    return invitation
  }

  @withTransaction
  @withUser
  public async inviteUserToTeam(params: {
    data: {
      user: {
        email: string
      }
      team: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const team = await Team.query({ client: trx }).where('id', params.data.team.id).firstOrFail()

    let group: Group | undefined = undefined
    if (!!params.data.group?.id) {
      group = await Group.query({ client: trx }).where('id', params.data.group.id).firstOrFail()
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'team_invite',
        data: {
          team: {
            id: params.data.team.id,
          },
        },
      },
      context: { trx },
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
          team: params.data.team,
        },
        context: {
          trx,
          user,
        },
      })

      if (invitedUserBelongs) throw new Error('invited user already exists')
    }

    let invitation: Invitation
    if (!invitedUser) {
      const { url, invitation: urlInvitation } = await this.inviteUserByUrl({
        data: {
          group,
          team,
        },
        context: params.context,
      })

      invitation = urlInvitation
      invitation.invitedEmail = params.data.user.email
      await invitation.save()

      const email = new InvitationMail({
        invitationUrl: url,
        invitedBy: user,
        invitedUserEmail: params.data.user.email,
      })
      await mail.sendLater(email)
    } else {
      invitation = await Invitation.firstOrCreate(
        {
          invitedEmail: params.data.user.email,
          status: 'pending',
          teamId: team.id,
        },
        {},
        { client: trx }
      )

      await invitation.related('invite').associate(invitedUser)
    }

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
      }
      club: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const club = await Club.query({ client: trx }).where('id', params.data.club.id).firstOrFail()

    let group: Group | undefined = undefined
    if (!!params.data.group?.id) {
      group = await Group.query({ client: trx }).where('id', params.data.group.id).firstOrFail()
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'club_invite',
        data: {
          club: {
            id: params.data.club.id,
          },
        },
      },
      context: { trx },
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
          club: params.data.club,
        },
        context: {
          trx,
          user,
        },
      })

      if (invitedUserBelongs) throw new Error('invited user already exists')
    }

    let invitation: Invitation
    if (!invitedUser) {
      const { url, invitation: urlInvitation } = await this.inviteUserByUrl({
        data: {
          group,
          club,
        },
        context: params.context,
      })

      invitation = urlInvitation
      invitation.invitedEmail = params.data.user.email
      await invitation.save()

      const email = new InvitationMail({
        invitationUrl: url,
        invitedBy: user,
        invitedUserEmail: params.data.user.email,
      })
      await mail.sendLater(email)
    } else {
      invitation = await Invitation.firstOrCreate(
        {
          invitedEmail: params.data.user.email,
          status: 'pending',
          clubId: club.id,
        },
        {},
        { client: trx }
      )

      await invitation.related('invite').associate(invitedUser)
    }

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

    query
      .where((b) => {
        b.where('invitedEmail', user.email)
          .orWhereHas('team', (b) => {
            b.orWhere((b) => {
              return AuthorizationHelpers.userCanInTeamQuery({
                data: {
                  query: b,
                  user: user,
                  resource: 'team',
                  action: 'invite',
                },
              })
            })
          })
          .orWhereHas('club', (b) => {
            b.orWhere((b) => {
              return AuthorizationHelpers.userCanInClubQuery({
                data: {
                  query: b,
                  user: user,
                  resource: 'club',
                  action: 'invite',
                },
              })
            })
          })
      })
      .preload('invitedBy')
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
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const invitation = await Invitation.query({ client: trx })
      .preload('club')
      .preload('team')
      .preload('group')
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if (invitation.status != 'pending') throw new Error('cannot accept invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'invitation_accept',
        data: {
          invitation: invitation,
        },
      },
      context: { trx },
    })

    // change status to the invitation
    invitation.status = 'accepted'
    const results = await invitation.useTransaction(trx).save()

    // join the team
    if (!!invitation.team) {
      let teamsManager = new TeamsManager()
      await teamsManager.addUser({
        data: {
          user: user,
          team: {
            id: invitation.teamId,
          },
          group:
            invitation.group?.teamId == invitation.teamId
              ? {
                  id: invitation.groupId,
                }
              : undefined,
        },
        context: {
          trx,
          user,
        },
      })
    }

    // join the club
    if (!!invitation.club) {
      let clubsManager = new ClubsManager()
      await clubsManager.addUser({
        data: {
          user: user,
          club: {
            id: invitation.clubId,
          },
          group:
            invitation.group?.clubId == invitation.clubId
              ? {
                  id: invitation.groupId,
                }
              : undefined,
        },
        context: {
          trx,
          user,
        },
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
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    // check if invitation exists
    const invitation = await Invitation.query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if (invitation.status != 'pending') throw new Error('cannot reject invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'invitation_reject',
        data: {
          invitation: invitation,
        },
      },
      context: { trx },
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
    }
    context?: Context
  }): Promise<Invitation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    // check if invitation exists
    const invitation = await Invitation.query({ client: trx })
      .where('id', params.data.invitation.id)
      .firstOrFail()

    if (invitation.status != 'pending') throw new Error('cannot discard invitation')

    // check if the invitation match the user
    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'invitation_discard',
        data: {
          invitation: invitation,
        },
      },
      context: { trx },
    })

    invitation.status = 'discarded'
    return await invitation.save()
  }

  @withTransaction
  @withUser
  public async inviteUserByUrl(params: {
    data: {
      team?: {
        id?: number
      }
      club?: {
        id?: number
      }
      group?: {
        id?: number
      }
    }
    context?: Context
  }): Promise<{
    url: string
    invitation: Invitation
  }> {
    const trx = params.context?.trx!
    const user = params.context?.user!

    let team: Team | undefined = undefined
    let club: Club | undefined = undefined
    let group: Group | undefined = undefined

    if (!!params.data.team?.id) {
      await AuthorizationManager.canOrFail({
        data: {
          ability: 'team_invite',
          actor: user,
          data: {
            team: { id: params.data.team.id },
          },
        },
        context: params.context,
      })

      team = await Team.query({ client: trx }).where('id', params.data.team.id).firstOrFail()
    }

    if (!!params.data.club?.id) {
      await AuthorizationManager.canOrFail({
        data: {
          ability: 'club_invite',
          actor: user,
          data: {
            club: { id: params.data.club.id },
          },
        },
        context: params.context,
      })

      club = await Club.query({ client: trx }).where('id', params.data.club.id).firstOrFail()
    }

    if (!club && !team) throw new Error('club or team must be defined')

    if (!!params.data.group?.id && !!params.data.club?.id) {
      group = await Group.query({ client: trx })
        .where('id', params.data.group.id)
        .whereHas('club', (b) => b.where('id', params.data.club!.id!))
        .firstOrFail()
    } else if (!!params.data.group?.id && !!params.data.team?.id) {
      group = await Group.query({ client: trx })
        .where('id', params.data.group.id)
        .whereHas('team', (b) => b.where('id', params.data.team?.id!))
        .firstOrFail()
    }

    let expirationDate = DateTime.now().plus({ day: 1 })

    let token = string.random(128)
    let uid = cuid()
    let baseUrl = `${env.get('FRONTEND_URL') || 'http://localhost:5173'}/auth/signup`
    let urlToken = encryption.encrypt({
      token,
      uid,
    })
    let finalUrl = `${baseUrl}?token=${urlToken}`

    let invitation = await Invitation.create(
      {
        teamId: team?.id,
        clubId: club?.id,
        invitedByUserId: user.id,
        groupId: group?.id,
        status: 'pending',
        expirationDate,
        uid,
        token,
      },
      { client: trx }
    )

    return {
      url: finalUrl,
      invitation,
    }
  }

  @withTransaction
  public async validateInvitationToken(params: {
    data: {
      token: string
    }
    context?: Context
  }): Promise<{
    valid: boolean
    message?: string
    invitation?: Invitation
  }> {
    const trx = params.context?.trx!

    let decryptedToken: {
      uid: string
      token: string
    } | null = await encryption.decrypt(params.data.token)

    if (!decryptedToken)
      return {
        valid: false,
        message: 'invalid token',
      }

    let invitation = await Invitation.query({ client: trx })
      .where('uid', decryptedToken.uid)
      .firstOrFail()

    if (invitation.expirationDate && DateTime.now() > invitation.expirationDate) {
      return {
        valid: false,
        message: 'invitation expired',
      }
    } else if (decryptedToken.token !== invitation.token) {
      return {
        valid: false,
        message: 'invalid token',
      }
    }

    return {
      valid: true,
      invitation,
    }
  }
}
