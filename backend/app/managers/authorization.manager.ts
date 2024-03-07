import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

import UserModel from 'App/Models/User'
import InvitationModel from 'App/Models/Invitation'
import RoleModel from 'App/Models/Role'
import EventModel from 'App/Models/Event'
import ConvocationModel from 'App/Models/Convocation'
import TeammateModel from 'App/Models/Teammate'

import type User from 'App/Models/User'
import type Team from 'App/Models/Team'
import type Invitation from 'App/Models/Invitation'
import type Event from 'App/Models/Event'
import type EventSession from 'App/Models/EventSession'
import type Convocation from 'App/Models/Convocation'
import type Role from 'App/Models/Role'
import type Teammate from 'App/Models/Teammate'

export type Resource = 
  'Team' |
  'Invitation' |
  'Event' |
  'Convocation' |
  'EventSession' |
  'Role' |
  'Teammate'

export type Action =
  'update' |
  'destroy' |
  'create' |
  'view' |
  'invite' |
  'removeUser' |
  'accept' |
  'reject' |
  'discard' |
  'convocate' |
  'confirm' |
  'deny'

export type Entities = {
  team?: Pick<Team, 'id'>,
  invitation?: Pick<Invitation, 'id'>,
  event?: Pick<Event, 'id'>,
  eventSession?: Pick<EventSession, 'id'>,
  convocation?: Pick<Convocation, 'id'>,
  invitee?: Pick<User, 'email'>
  role?: Pick<Role, 'id'>,
  user?: Pick<User, 'id'>,
  teammate?: Pick<Teammate, 'id'>
}

type CanFunction = (params: {
  actor: User,
  entities: Entities
}, context?: {
  trx?: TransactionClientContract
}) => Promise<boolean>


type CanParameters = {
  data: {
    actor: User,
    resource: Resource,
    action: Action,
    entities: Entities
  },
  context?: {
    trx?: TransactionClientContract
  }
}

export default class AuthorizationManager {
  static mapper: {
    [resource in Resource]?: {
      [action in Action]?: CanFunction
    }
  } = {
    Team: {
      update: AuthorizationManager._canUpdateTeam,
      destroy: AuthorizationManager._canDestroyTeam,
      view: AuthorizationManager._canViewTeam,
      invite: AuthorizationManager._canInviteToTeam,
      removeUser: AuthorizationManager._canRemoveUserFromTeam
    },
    Teammate: {
      update: AuthorizationManager._canUpdateTeammate
    },
    Invitation: {
      accept: AuthorizationManager._canAcceptInvitation,
      reject: AuthorizationManager._canRejectInvitation,
      discard: AuthorizationManager._canDiscardInvitation,
    },
    Role: {
      create: AuthorizationManager._canUpdateTeam,
      update: AuthorizationManager._canUpdateRole,
      destroy: AuthorizationManager._canUpdateRole,
      view: AuthorizationManager._canViewRole,
    },
    Event: {
      create: AuthorizationManager._canCreateEvent,
      update: AuthorizationManager._canUpdateEvent,
      convocate: AuthorizationManager._canConvocateToEvent,
      destroy: AuthorizationManager._canDestroyEvent
    },
    Convocation: {
      confirm: AuthorizationManager._canConfirmConvocation,
      deny: AuthorizationManager._canDenyConvocation
    }
  }

  constructor() { }

  public static async can(
    { data, context }: CanParameters
  ) {
    let canFunction = this.mapper[data.resource]?.[data.action] ?? AuthorizationManager._generalCanFunction
    return await canFunction({
      actor: data.actor, entities: data.entities
    }, context)
  }

  public static async canOrFail(params: CanParameters): Promise<boolean> {
    let results = await AuthorizationManager.can(params)
    if (!this.mapper[params.data.resource]?.[params.data.action] || !results) throw new Error(`cannot ${params.data.action} on resource ${params.data.resource} with current user`)
    else return true
  }

  private static async _generalCanFunction(
    _params: { actor: User, entities: Entities },
    _context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    return false
  }

  private static async _canUpdateTeam(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    let teamId: number = params.entities.team.id

    let userCanUpdateTeam = await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: teamId },
      action: 'update',
      resource: 'Team'
    }, context)

    return userCanUpdateTeam
  }

  private static async _canRemoveUserFromTeam(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    if (!params.entities.user?.id) throw new Error('user must be defined')
    let teamId: number = params.entities.team.id
    let userId: number = params.entities.user.id

    let userCanRemoveUser = await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: teamId },
      action: 'removeUser',
      resource: 'Team'
    }, context)

    return (userCanRemoveUser || params.actor.id == userId)
  }

  private static async _canDestroyTeam(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    let teamId: number = params.entities.team.id

    const userBelongs = await UserModel.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder.where('teams.id', teamId)
    }).where('users.id', params.actor.id)

    return userBelongs.length != 0
  }

  private static async _canViewTeam(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    let teamId: number = params.entities.team.id

    const userBelongs = await UserModel.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder.where('teams.id', teamId)
    }).where('users.id', params.actor.id)

    return userBelongs.length != 0
  }

  private static async _canInviteToTeam(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    let teamId: number = params.entities.team.id
    
    const userCanInvite = await Helpers.userCanInTeam({
      user: params.actor,
      team: {id: teamId},
      resource: 'Team',
      action: 'invite'
    }, context)

    return userCanInvite
  }

  private static async _canAcceptInvitation(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.invitation?.id) throw new Error('invitation must be defined')
    let invitationId: number = params.entities.invitation.id

    const invitationBelogs = await InvitationModel.query({ client: context?.trx })
      .whereIn('invitedEmail', UserModel.query({ client: context?.trx })
        .select('email')
        .where('id', params.actor.id)
      )
      .where('id', invitationId)

    return invitationBelogs.length != 0
  }

  private static async _canRejectInvitation(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.invitation?.id) throw new Error('invitation must be defined')
    let invitationId: number = params.entities.invitation.id

    const invitationBelogs = await InvitationModel.query({ client: context?.trx })
      .whereIn('invitedEmail', UserModel.query({ client: context?.trx })
        .select('email')
        .where('id', params.actor.id)
      )
      .where('id', invitationId)

    return invitationBelogs.length != 0
  }

  private static async _canDiscardInvitation(
    params: { actor: User, entities: Entities },
    _context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.invitation?.id) throw new Error('invitation must be defined')
    let invitationId: number = params.entities.invitation.id

    const invitationBelogs = await InvitationModel.query()
      .whereHas('invitedBy', inviteBuilder => {
        inviteBuilder.where('users.id', params.actor.id)
      })
      .where('id', invitationId)

    return invitationBelogs.length != 0
  }

  private static async _canViewRole(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.role?.id) throw new Error('role must be defined')
    let roleId: number = params.entities.role.id

    const userBelongs = await UserModel.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder.whereHas('roles', rolesBuilder => {
        rolesBuilder.where('roles.id', roleId)
      })
    }).where('users.id', params.actor.id)

    return userBelongs.length != 0
  }

  private static async _canUpdateRole(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.role?.id) throw new Error('role must be defined')
    let roleId: number = params.entities.role.id

    const userBelongs = await UserModel.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder
        .whereIn('teams.id', RoleModel.query().select('teamId').where('roles.id', roleId))
        .where(teamsBuilder => {
          teamsBuilder
            .whereHas('roles', rolesBuilder => {
              rolesBuilder.whereRaw("cast(roles.cans->'Event'->>'create' as BOOLEAN) = true")
            })
            .orWhere('ownerId', params.actor.id)
        })
    }).where('users.id', params.actor.id)

    return userBelongs.length != 0
  }

  private static async _canCreateEvent(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.team?.id) throw new Error('team must be defined')
    let teamId: number = params.entities.team.id

    return await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: teamId },
      action: 'create',
      resource: 'Event'
    }, context)
  }

  private static async _canUpdateTeammate(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.teammate?.id) throw new Error('teammate must be defined')
    let teammateId: number = params.entities.teammate.id

    let teammate = await TeammateModel.query({ client: context?.trx })
      .where('id', teammateId)
      .firstOrFail()

    return await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: teammate.teamId },
      action: 'create',
      resource: 'Event'
    }, context)
  }

  private static async _canUpdateEvent(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.event?.id) throw new Error('event must be defined')
    let eventId: number = params.entities.event.id

    let results = await EventModel.query({
      client: context?.trx
    }).where('id', eventId).first()

    let event: Event
    if (!results) return false
    else event = results

    return await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: event.teamId },
      action: 'update',
      resource: 'Event'
    }, context)
  }

  private static async _canDestroyEvent(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.event?.id) throw new Error('event must be defined')
    let eventId: number = params.entities.event.id

    let results = await EventModel.query({
      client: context?.trx
    }).where('id', eventId).first()

    let event: Event
    if (!results) return false
    else event = results

    return await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: event.teamId },
      action: 'destroy',
      resource: 'Event'
    }, context)
  }

  private static async _canConvocateToEvent(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.event?.id) throw new Error('event must be defined')
    let eventId: number = params.entities.event.id

    let results = await EventModel.query({
      client: context?.trx
    }).where('id', eventId).first()

    let event: Event
    if(!results) return false
    else event = results

    return await Helpers.userCanInTeam({
      user: params.actor,
      team: { id: event.teamId },
      action: 'convocate',
      resource: 'Event'
    }, context)
  }

  private static async _canConfirmConvocation(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if(!params.entities.convocation?.id) throw new Error('convocation must be defined')
    let convocationId: number = params.entities.convocation.id

    let convocationBelongsToUser = await ConvocationModel.query({ client: context?.trx })
      .where('id', convocationId)
      .whereHas('teammate', teammateBuilder => {
        teammateBuilder.where('userId', params.actor.id)
      })

    let convocation = await ConvocationModel.query({client: context?.trx})
      .where('id', convocationId)
      .preload('event')
      .first()
    
    if(!convocation) return false

    let canConfirmOtherConvocations = await Helpers.userCanInTeam({
      user: params.actor,
      team: {
        id: convocation.event.teamId
      },
      action: 'confirm',
      resource: 'Convocation'
    })

    return convocationBelongsToUser.length != 0 || canConfirmOtherConvocations
  }

  private static async _canDenyConvocation(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.convocation?.id) throw new Error('convocation must be defined')
    let convocationId: number = params.entities.convocation.id

    let convocationBelongsToUser = await ConvocationModel.query({ client: context?.trx })
      .where('id', convocationId)
      .whereHas('teammate', teammateBuilder => {
        teammateBuilder.where('userId', params.actor.id)
      })

    let convocation = await ConvocationModel.query({ client: context?.trx })
      .where('id', convocationId)
      .preload('event')
      .first()

    if (!convocation) return false

    let canConfirmOtherConvocations = await Helpers.userCanInTeam({
      user: params.actor,
      team: {
        id: convocation.event.teamId
      },
      action: 'deny',
      resource: 'Convocation'
    })

    return convocationBelongsToUser.length != 0 || canConfirmOtherConvocations
  }
}


class Helpers {
  public static async userCanInTeam(
    params: { 
      user: User, 
      team: { id: number } 
      action: Action,
      resource: Resource
    },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    const userHasRole = await UserModel.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder
        .where('teams.id', params.team.id)
        .where(teamsBuilder => {
          teamsBuilder
            .whereHas('roles', rolesBuilder => {
              rolesBuilder.whereRaw("cast(roles.cans->:resource->>:action as BOOLEAN) = true", {
                resource: params.resource,
                action: params.action
              })
            })
            .orWhere('ownerId', params.user.id)
        })
    }).where('users.id', params.user.id)

    return userHasRole.length != 0
  }
}