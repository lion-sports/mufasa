import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

import User from 'App/Models/User'
import Invitation from 'App/Models/Invitation'
import Group from 'App/Models/Group'
import Event from 'App/Models/Event'
import Convocation from 'App/Models/Convocation'
import Teammate from 'App/Models/Teammate'
import Team from 'App/Models/Team'
import EventSession from 'App/Models/EventSession'

export type Resource = 
  'Team' |
  'Invitation' |
  'Event' |
  'Convocation' |
  'EventSession' |
  'Group' |
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
  group?: Pick<Group, 'id'>,
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
    Group: {
      create: AuthorizationManager._canUpdateTeam,
      update: AuthorizationManager._canUpdateGroup,
      destroy: AuthorizationManager._canUpdateGroup,
      view: AuthorizationManager._canViewGroup,
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

    const userBelongs = await User.query({
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

    const userBelongs = await User.query({
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

    const invitationBelogs = await Invitation.query({ client: context?.trx })
      .whereIn('invitedEmail', User.query({ client: context?.trx })
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

    const invitationBelogs = await Invitation.query({ client: context?.trx })
      .whereIn('invitedEmail', User.query({ client: context?.trx })
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

    const invitationBelogs = await Invitation.query()
      .whereHas('invitedBy', inviteBuilder => {
        inviteBuilder.where('users.id', params.actor.id)
      })
      .where('id', invitationId)

    return invitationBelogs.length != 0
  }

  private static async _canViewGroup(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.group?.id) throw new Error('group must be defined')
    let groupId: number = params.entities.group.id

    const userBelongs = await User.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder.whereHas('groups', groupsBuilder => {
        groupsBuilder.where('groups.id', groupId)
      })
    }).where('users.id', params.actor.id)

    return userBelongs.length != 0
  }

  private static async _canUpdateGroup(
    params: { actor: User, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if (!params.entities.group?.id) throw new Error('group must be defined')
    let groupId: number = params.entities.group.id

    const userBelongs = await User.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder
        .whereIn('teams.id', Group.query().select('teamId').where('groups.id', groupId))
        .where(teamsBuilder => {
          teamsBuilder
            .whereHas('groups', groupsBuilder => {
              groupsBuilder.whereRaw("cast(groups.cans->'Event'->>'create' as BOOLEAN) = true")
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

    let teammate = await Teammate.query({ client: context?.trx })
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

    let results = await Event.query({
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

    let results = await Event.query({
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

    let results = await Event.query({
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

    let convocationBelongsToUser = await Convocation.query({ client: context?.trx })
      .where('id', convocationId)
      .whereHas('teammate', teammateBuilder => {
        teammateBuilder.where('userId', params.actor.id)
      })

    let convocation = await Convocation.query({client: context?.trx})
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

    let convocationBelongsToUser = await Convocation.query({ client: context?.trx })
      .where('id', convocationId)
      .whereHas('teammate', teammateBuilder => {
        teammateBuilder.where('userId', params.actor.id)
      })

    let convocation = await Convocation.query({ client: context?.trx })
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
    const userHasGroup = await User.query({
      client: context?.trx
    }).whereHas('teams', (builder) => {
      builder
        .where('teams.id', params.team.id)
        .where(teamsBuilder => {
          teamsBuilder
            .whereHas('groups', groupsBuilder => {
              groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
                resource: params.resource,
                action: params.action
              })
            })
            .orWhere('ownerId', params.user.id)
        })
    }).where('users.id', params.user.id)

    return userHasGroup.length != 0
  }
}