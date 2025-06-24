import Team from "#models/Team";
import User from "#models/User";
import { ModelQueryBuilderContract } from "@adonisjs/lucid/types/model";
import { Context } from "./base.manager.js";
import { HasManyQueryBuilderContract, RelationSubQueryBuilderContract } from "@adonisjs/lucid/types/relations";
import Club from "#models/Club";
import Invitation from "#models/Invitation";
import Group from "#models/Group";
import Event from "#models/Event";
import Teammate from "#models/Teammate";
import Shirt from "#models/Shirt";
import Scout from "#models/Scout";
import ScoringSystem from "#models/ScoringSystem";
import Convocation from "#models/Convocation";
import Widget from "#models/Widget";
import EventSession from "#models/EventSession";
import Place from "#models/Place";
import Booking from "#models/Booking";

export type GroupedPermissions<Type = boolean> = {
  team: {
    update: Type,
    destroy: Type,
    view: Type,
    invite: Type,
    removeUser: Type,
    create: Type
  },
  club: {
    update: Type
    destroy: Type
    view: Type,
    invite: Type
  },
  clubSettings: {
    set: Type
  },
  teammate: {
    update: Type,
  },
  invitation: {
    accept: Type,
    reject: Type,
    discard: Type,
  },
  group: {
    create: Type,
    update: Type,
    destroy: Type,
    view: Type,
  },
  event: {
    create: Type,
    update: Type,
    convocate: Type,
    destroy: Type,
  },
  shirt: {
    create: Type,
    update: Type,
    view: Type,
    destroy: Type,
  },
  place: {
    create: Type,
    update: Type,
    view: Type,
    destroy: Type,
  },
  booking: {
    request: Type,
    confirm: Type,
    update: Type,
    view: Type
  },
  scout: {
    manage: Type,
    view: Type,
  },
  scoringSystem: {
    view: Type,
    manage: Type,
    create: Type,
  },
  convocation: {
    confirm: Type,
    deny: Type,
  },
  widgetSetting: {
    set: Type
  }
}

export type Resource = keyof GroupedPermissions
export type Action<R extends Resource> = keyof GroupedPermissions[R]

export type AbilityData = {
  'team_update': {
    team: Pick<Team, 'id'>
  }
  'team_destroy': {
    team: Pick<Team, 'id'>
  }
  'team_view': {
    team: Pick<Team, 'id'>
  } | {
    club: Pick<Club, 'id'>
  }
  'team_invite': {
    team: Pick<Team, 'id'>
  }
  'team_removeUser': {
    team: Pick<Team, 'id'>,
    user: Pick<User, 'id'>,
  }
  'team_create': {
    club?: Pick<Club, 'id'>,
  }
  'club_update': {
    club: Pick<Club, 'id'>,
  }
  'club_destroy': {
    club: Pick<Club, 'id'>,
  }
  'club_view': {
    club: Pick<Club, 'id'>
  }
  'club_invite': {
    club: Pick<Club, 'id'>
  },
  'clubSetting_set': {
    club: Pick<Club, 'id'>
  },
  'teammate_update': {
    team: Pick<Team, 'id'>
  } | {
    teammate: Pick<Teammate, 'id'>
  }
  'invitation_accept': {
    invitation: Pick<Invitation, 'id'>
  }
  'invitation_reject': {
    invitation: Pick<Invitation, 'id'>
  }
  'invitation_discard': {
    invitation: Pick<Invitation, 'id'>
  }
  'group_create': {
    team?: Pick<Team, 'id'>
    club?: Pick<Club, 'id'>
  }
  'group_update': {
    group: Pick<Group, 'id'>
  }
  'group_destroy': {
    group: Pick<Group, 'id'>
  }
  'group_view': {
    group: Pick<Group, 'id'>
  },
  'place_create': {
    club: Pick<Club, 'id'>
  }
  'place_update': {
    place: Pick<Place, 'id'>
  }
  'place_destroy': {
    place: Pick<Place, 'id'>
  }
  'place_view': {
    place: Pick<Place, 'id'>
  },
  'booking_request': {
    club: Pick<Club, 'id'>
  },
  'booking_confirm': {
    club: Pick<Club, 'id'>
  },
  'booking_view': {
    booking: Pick<Booking, 'id'>
  },
  'booking_update': {
    booking: Pick<Booking, 'id'>
  },
  'event_create': {
    team: Pick<Team, 'id'>
  },
  'event_update': {
    event: Pick<Event, 'id'>
  }
  'event_convocate': {
    event: Pick<Event, 'id'>
  }
  'event_destroy': {
    event: Pick<Event, 'id'>
  }
  'shirt_create': {
    teammate: Pick<Teammate, 'id'>
  },
  'shirt_update': {
    shirt: Pick<Shirt, 'id'>
  }
  'shirt_view': {
    shirt: Pick<Shirt, 'id'>
  }
  'shirt_destroy': {
    shirt: Pick<Shirt, 'id'>
  }
  'scout_view': {
    scout: Pick<Scout, 'id'>
  }
  'scout_manage': {
    scout: Pick<Scout, 'id'>
  } | {
    event: Pick<Event, 'id'>
  }
  'scoringSystem_view': {
    scoringSystem: Pick<ScoringSystem, 'id'>
  }
  'scoringSystem_manage': {
    scoringSystem: Pick<ScoringSystem, 'id'>
  }
  'scoringSystem_create': {
    team: Pick<Team, 'id'>
  }
  'convocation_confirm': {
    convocation: Pick<Convocation, 'id'>
  }
  'convocation_deny': {
    convocation: Pick<Convocation, 'id'>
  }
  'widgetSetting_set': {
    widget: Pick<Widget, 'id'>
  }
}

export type Ability = keyof AbilityData

export type AbilityDataParameters<A extends Ability> = AbilityData[A] extends void ? {
  ability: A
  actor: User
} : {
  ability: A
  actor: User
  data: AbilityData[A]
}


const AUTHORIZATION_CALLBACKS: {
  [A in Ability]: (params: {
    data: Omit<AbilityDataParameters<A>, 'ability'>
    context?: Context
  }) => Promise<boolean>
} = {
  team_update: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: data.data.team,
        action: 'update',
        resource: 'team'
      },
      context
    })
  },
  team_destroy: async ({ data, context }) => {
    const teams = await Team.query({
      client: context?.trx
    }).whereHas('owner', (builder) => {
      builder.where('users.id', data.actor.id)
    }).where('teams.id', data.data.team.id)

    return teams.length != 0
  },
  team_view: async ({ data, context }) => {
    if('team' in data.data) {
      const teams = await Team.query({ client: context?.trx })
        .where(b => {
          return AuthorizationHelpers.viewableTeamsQuery({
            data: {
              query: b,
              user: data.actor
            },
            context
          })
        })
        .where('id', data.data.team.id)
  
      return teams.length != 0
    } else {
      return await AuthorizationHelpers.userCanInClub({
        data: {
          user: data.actor,
          club: data.data.club,
          action: 'update',
          resource: 'team'
        },
        context
      })
    }
  },
  team_invite: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: data.data.team,
        action: 'update',
        resource: 'team'
      },
      context
    })
  },
  team_removeUser: async ({ data, context }) => {
    return data.actor.id == data.data.user.id || await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: data.data.team,
        action: 'removeUser',
        resource: 'team'
      },
      context
    })
  },
  team_create: async ({ data, context }) => {
    return !data.data.club || await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        action: 'create',
        resource: 'team'
      },
      context
    })
  },
  club_update: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        action: 'update',
        resource: 'club'
      },
      context
    })
  },
  club_destroy: async ({ data, context }) => {
    const clubs = await Club.query({
      client: context?.trx
    }).whereHas('owner', (builder) => {
      builder.where('users.id', data.actor.id)
    }).where('clubs.id', data.data.club.id)

    return clubs.length != 0
  },
  club_view: async ({ data, context }) => {
    const clubs = await Club.query({ client: context?.trx })
      .where(b => {
        b.whereHas('owner', b => b.where('users.id', data.actor.id))
          .orWhereHas('members', b => b.where('userId', data.actor.id))
          .orWhereHas('teams', b => {
            b.whereHas('teammates', b => b.where('userId', data.actor.id))
              .orWhere('ownerId', data.actor.id)
          })
          .orWhere('public', true)
      })
      .where('id', data.data.club.id)

    return clubs.length != 0
  },
  club_invite: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        resource: 'club',
        action: 'invite'
      },
      context
    })
  },
  clubSetting_set: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        resource: 'clubSettings',
        action: 'set'
      },
      context
    })
  },
  teammate_update: async ({ data, context }) => {
    if('team' in data.data) {
      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: data.data.team.id },
          resource: 'teammate',
          action: 'update'
        },
        context
      })
    } else {
      let teammate = await Teammate.query({ client: context?.trx })
        .where('id', data.data.teammate.id)
        .firstOrFail()

      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: teammate.teamId },
          resource: 'teammate',
          action: 'update'
        },
        context
      })
    }
  },
  invitation_accept: async ({ data, context }) => {
    const invitationBelogs = await Invitation.query({ client: context?.trx })
      .whereIn('invitedEmail', User.query({ client: context?.trx })
        .select('email')
        .where('id', data.actor.id)
      )
      .where('id', data.data.invitation.id)

    return invitationBelogs.length != 0
  },
  invitation_reject: async ({ data, context }) => {
    const invitationBelogs = await Invitation.query({ client: context?.trx })
      .whereIn('invitedEmail', User.query({ client: context?.trx })
        .select('email')
        .where('id', data.actor.id)
      )
      .where('id', data.data.invitation.id)

    return invitationBelogs.length != 0
  },
  invitation_discard: async ({ data, context }) => {
    const invitationBelogs = await Invitation.query()
      .whereHas('invitedBy', inviteBuilder => {
        inviteBuilder.where('users.id', data.actor.id)
      })
      .where('id', data.data.invitation.id)

    return invitationBelogs.length != 0
  },
  group_create: async ({ data, context }) => {
    if (!!data.data.team?.id) {
      let teamId: number = data.data.team.id
      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: teamId },
          resource: 'group',
          action: 'create'
        },
        context
      })
    } else if(!!data.data.club?.id) {
      let clubId: number = data.data.club.id
      return await AuthorizationHelpers.userCanInClub({
        data: {
          user: data.actor,
          club: { id: clubId },
          resource: 'group',
          action: 'create'
        },
        context
      })
    } else throw new Error("team or club must be defined")
  },
  group_update: async ({ data, context }) => {
    let group = await Group.query({ client: context?.trx }).where('id', data.data.group.id).firstOrFail()

    if(!!group.teamId) {
      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: group.teamId },
          action: 'update',
          resource: 'group'
        },
        context
      })
    } else if(!!group.clubId) {
      return await AuthorizationHelpers.userCanInClub({
        data: {
          user: data.actor,
          club: { id: group.clubId },
          action: 'update',
          resource: 'group'
        },
        context
      })
    } else throw new Error('group not belonging to either a team or a club')
  },
  group_destroy: async ({ data, context }) => {
    let group = await Group.query({ client: context?.trx }).where('id', data.data.group.id).firstOrFail()

    if (!!group.teamId) {
      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: group.teamId },
          action: 'destroy',
          resource: 'group'
        },
        context
      })
    } else if (!!group.clubId) {
      return await AuthorizationHelpers.userCanInClub({
        data: {
          user: data.actor,
          club: { id: group.clubId },
          action: 'destroy',
          resource: 'group'
        },
        context
      })
    } else throw new Error('group not belonging to either a team or a club')
  },
  group_view: async ({ data, context }) => {
    let group = await Group.query({ client: context?.trx }).where('id', data.data.group.id).firstOrFail()

    if (!!group.teamId) {
      return await AuthorizationHelpers.userCanInTeam({
        data: {
          user: data.actor,
          team: { id: group.teamId },
          action: 'view',
          resource: 'group'
        },
        context
      })
    } else if (!!group.clubId) {
      return await AuthorizationHelpers.userCanInClub({
        data: {
          user: data.actor,
          club: { id: group.clubId },
          action: 'view',
          resource: 'group'
        },
        context
      })
    } else throw new Error('group not belonging to either a team or a club')
  },
  event_create: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: data.data.team.id },
        action: 'create',
        resource: 'event'
      },
      context
    })
  },
  event_update: async ({ data, context }) => {
    let event = await Event.query({ client: context?.trx })
      .where('id', data.data.event.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: event.teamId },
        action: 'update',
        resource: 'event'
      },
      context
    })
  },
  event_convocate: async ({ data, context }) => {
    let event = await Event.query({ client: context?.trx })
      .where('id', data.data.event.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: event.teamId },
        action: 'convocate',
        resource: 'event'
      },
      context
    })
  },
  event_destroy: async ({ data, context }) => {
    let event = await Event.query({ client: context?.trx })
      .where('id', data.data.event.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: event.teamId },
        action: 'destroy',
        resource: 'event'
      },
      context
    })
  },
  shirt_create: async ({ data, context }) => {
    let teammate = await Teammate.query({
        client: context?.trx
      }).where('id', data.data.teammate.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: teammate.teamId },
        action: 'create',
        resource: 'shirt'
      },
      context
    })
  },
  shirt_update: async ({ data, context }) => {
    let shirt = await Shirt.query({ client: context?.trx })
      .where('id', data.data.shirt.id)
      .preload('teammate')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: shirt.teammate.teamId },
        action: 'update',
        resource: 'shirt'
      },
      context
    })
  },
  shirt_view: async ({ data, context }) => {
    let shirt = await Shirt.query({ client: context?.trx })
      .where('id', data.data.shirt.id)
      .preload('teammate')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: shirt.teammate.teamId },
        action: 'view',
        resource: 'shirt'
      },
      context
    })
  },
  shirt_destroy: async ({ data, context }) => {
    let shirt = await Shirt.query({ client: context?.trx })
      .where('id', data.data.shirt.id)
      .preload('teammate')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: shirt.teammate.teamId },
        action: 'destroy',
        resource: 'shirt'
      },
      context
    })
  },
  place_create: async ({ data, context }) => {
    let club = await Club.query({
      client: context?.trx
    }).where('id', data.data.club?.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: club.id },
        action: 'create',
        resource: 'place'
      },
      context
    })
  },
  place_update: async ({ data, context }) => {
    let place = await Place.query({ client: context?.trx })
      .where('id', data.data.place.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: place.clubId },
        action: 'update',
        resource: 'place'
      },
      context
    })
  },
  place_view: async ({ data, context }) => {
    let place = await Place.query({ client: context?.trx })
      .where('id', data.data.place.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: place.clubId },
        action: 'view',
        resource: 'place'
      },
      context
    })
  },
  place_destroy: async ({ data, context }) => {
    let place = await Place.query({ client: context?.trx })
      .where('id', data.data.place.id)
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: place.clubId },
        action: 'destroy',
        resource: 'place'
      },
      context
    })
  },
  booking_view: async ({ data, context }) => {
    let booking = await Booking.query({ client: context?.trx })
      .where('id', data.data.booking.id)
      .preload('place')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: booking.place.clubId },
        resource: 'booking',
        action: 'view'
      },
      context
    })
  },
  booking_update: async ({ data, context }) => {
    let booking = await Booking.query({ client: context?.trx })
      .where('id', data.data.booking.id)
      .preload('place')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: booking.place.clubId },
        resource: 'booking',
        action: 'update'
      },
      context
    })
  },
  booking_request: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        resource: 'booking',
        action: 'request'
      },
      context
    })
  },
  booking_confirm: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInClub({
      data: {
        user: data.actor,
        club: { id: data.data.club.id },
        resource: 'booking',
        action: 'confirm'
      },
      context
    })
  },
  scout_view: async ({ data, context }) => {
    let scout = await Scout.query({ client: context?.trx })
      .where('id', data.data.scout.id)
      .preload('event')
      .firstOrFail()

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: scout.event.teamId },
        action: 'view',
        resource: 'scout'
      },
      context
    })
  },
  scout_manage: async ({ data, context }) => {
    let teamId: number
    if('scout' in data.data) {
      let scout = await Scout.query({ client: context?.trx })
        .where('id', data.data.scout.id)
        .preload('event')
        .firstOrFail()
      teamId = scout.event.teamId
    } else {
      let event = await Event.query({ client: context?.trx })
        .where('id', data.data.event.id)
        .firstOrFail()
      teamId = event.teamId
    }

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: teamId },
        action: 'manage',
        resource: 'scout'
      },
      context
    })
  },
  scoringSystem_view: async ({ data, context }) => {
    let scoringSystem = await ScoringSystem.query({
        client: context?.trx
      })
      .where('id', data.data.scoringSystem.id)
      .firstOrFail()

    if (scoringSystem.createdByUserId == data.actor.id) return true

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: scoringSystem.createdForTeamId },
        action: 'view',
        resource: 'scout'
      },
      context
    })
  },
  scoringSystem_manage: async ({ data, context }) => {
    let scoringSystem = await ScoringSystem.query({
        client: context?.trx
      })
      .where('id', data.data.scoringSystem.id)
      .firstOrFail()

    if (scoringSystem.createdByUserId == data.actor.id) return true

    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: scoringSystem.createdForTeamId },
        action: 'manage',
        resource: 'scout'
      },
      context
    })
  },
  scoringSystem_create: async ({ data, context }) => {
    return await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: data.data.team.id },
        action: 'manage',
        resource: 'scout'
      },
      context
    })
  },
  convocation_confirm: async ({ data, context }) => {
    let convocation = await Convocation.query({ client: context?.trx })
      .where('id', data.data.convocation.id)
      .preload('teammate')
      .preload('event')
      .firstOrFail()

    let canConfirmOtherConvocations = await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: convocation.event.teamId },
        action: 'confirm',
        resource: 'convocation'
      },
      context
    })

    return canConfirmOtherConvocations || convocation.teammate.userId == data.actor.id
  },
  convocation_deny: async ({ data, context }) => {
    let convocation = await Convocation.query({ client: context?.trx })
      .where('id', data.data.convocation.id)
      .preload('teammate')
      .preload('event')
      .firstOrFail()

    let canConfirmOtherConvocations = await AuthorizationHelpers.userCanInTeam({
      data: {
        user: data.actor,
        team: { id: convocation.event.teamId },
        action: 'deny',
        resource: 'convocation'
      },
      context
    })

    return canConfirmOtherConvocations || convocation.teammate.userId == data.actor.id
  },
  widgetSetting_set: async ({ data, context }) => {
    let usersFromWidget = await User.query({ client: context?.trx })
        .whereHas('dashboards', b => {
          b.whereHas('widgets', b => {
            b.where('id', data.data.widget.id)
          })
        })
    
    return usersFromWidget.some((ufw) => ufw.id == data.actor.id)
  },
}

export default class AuthorizationManager {
  public static async can<A extends Ability>(params: {
    data: AbilityDataParameters<A>,
    context?: Context
  }) {
    return await AUTHORIZATION_CALLBACKS[params.data.ability]({
      data: params.data,
      context: params.context
    })
  }

  public static async canOrFail<A extends Ability>(params: {
    data: AbilityDataParameters<A>,
    context?: Context
  }): Promise<boolean> {
    let results = await AuthorizationManager.can(params)
    return results
  }
}

export class AuthorizationHelpers {
  public static async userCanInTeam<R extends Resource>(
    params: {
      data: {
        user: User
        team: { id: number }
        resource: R
        action: Action<R>
      },
      context?: Context
    },
  ): Promise<boolean> {
    const userHasGroup = await User.query({
      client: params.context?.trx
    }).whereHas('teams', (builder) => {
      builder
        .where('teams.id', params.data.team.id)
        .where(teamsBuilder => {
          teamsBuilder
            .whereHas('groups', groupsBuilder => {
              groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
                resource: params.data.resource,
                action: params.data.action.toString()
              })
            })
            .orWhere('ownerId', params.data.user.id)
        })
    }).where('users.id', params.data.user.id)

    return userHasGroup.length != 0
  }

  // the query to get all the teams in which the paramter user has permission 
  // to execute the parameter action on the parameter resource
  public static userCanInTeamQuery<R extends Resource>(
    params: {
      data: {
        query: ModelQueryBuilderContract<typeof Team> | RelationSubQueryBuilderContract<typeof Team>,
        user: { id: number }
        resource: R
        action: Action<R>
      },
      context?: Context
    },
  ): ModelQueryBuilderContract<typeof Team> | RelationSubQueryBuilderContract<typeof Team> {
    return params.data.query.where(teamsBuilder => {
      teamsBuilder
        .whereHas('groups', groupsBuilder => {
          groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
            resource: params.data.resource,
            action: params.data.action.toString()
          }).whereHas('teammatesUser', memberUserBuilder => {
            memberUserBuilder.where('users.id', params.data.user.id)
          })
        })
        .orWhere('ownerId', params.data.user.id)
    })
  }

  // the query to get all the clubs in which the paramter user has permission 
  // to execute the parameter action on the parameter resource
  public static userCanInClubQuery<R extends Resource>(
    params: {
      data: {
        query: ModelQueryBuilderContract<typeof Club> | RelationSubQueryBuilderContract<typeof Club>,
        user: { id: number }
        resource: R
        action: Action<R>
      },
      context?: Context
    },
  ): ModelQueryBuilderContract<typeof Club> | RelationSubQueryBuilderContract<typeof Club> {
    return params.data.query.where(clubsBuilder => {
      clubsBuilder
        .whereHas('groups', groupsBuilder => {
          groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
            resource: params.data.resource,
            action: params.data.action.toString()
          }).whereHas('membersUser', memberUserBuilder => {
            memberUserBuilder.where('users.id', params.data.user.id)
          })
        })
        .orWhere('ownerId', params.data.user.id)
    })
  }

  // the query to get all the teams the user can see
  public static viewableTeamsQuery(
    params: {
      data: {
        query: ModelQueryBuilderContract<typeof Team> | RelationSubQueryBuilderContract<typeof Team> | HasManyQueryBuilderContract<typeof Team, any>,
        user: { id: number }
      },
      context?: Context
    },
  ): ModelQueryBuilderContract<typeof Team> | RelationSubQueryBuilderContract<typeof Team> | HasManyQueryBuilderContract<typeof Team, any>{
    return params.data.query.where(teamsBuilder => {
        teamsBuilder.where(b => {
          b.whereHas('owner', b => b.where('users.id', params.data.user.id))
            .orWhereHas('teammates', b => b.where('userId', params.data.user.id))
            .orWhereHas('club', b => {
              return AuthorizationHelpers.userCanInClubQuery({
                data: {
                  query: b,
                  resource: 'team',
                  action: 'view',
                  user: params.data.user
                }
              })
            })
        })
    })
  }

  public static async userCanInClub<R extends Resource>(
    params: {
      data: {
        user: User
        club: { id: number }
        resource: R
        action: Action<R>
      },
      context?: Context
    },
  ): Promise<boolean> {
    const userHasGroup = await User.query({
      client: params.context?.trx
    }).whereHas('clubs', (builder) => {
      builder
        .where('clubs.id', params.data.club.id)
        .where(builder => {
          builder
            .whereHas('groups', groupsBuilder => {
              groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
                resource: params.data.resource,
                action: params.data.action.toString()
              })
            })
            .orWhere('ownerId', params.data.user.id)
        })
    }).where('users.id', params.data.user.id)

    return userHasGroup.length != 0
  }

  public static viewableEventSessionsQuery(
    params: {
      data: {
        query: ModelQueryBuilderContract<typeof EventSession> | RelationSubQueryBuilderContract<typeof EventSession> | HasManyQueryBuilderContract<typeof EventSession, any>,
        user: { id: number }
      },
      context?: Context
    },
  ): ModelQueryBuilderContract<typeof EventSession> | RelationSubQueryBuilderContract<typeof EventSession> | HasManyQueryBuilderContract<typeof EventSession, any> {
    return params.data.query.where(eventSessionBuilder => {
      eventSessionBuilder.where('ownedByUserId', params.data.user.id)
        .orWhere(b => {
          b.whereHas('team', b => {
              return this.viewableTeamsQuery({
                data: {
                  query: b,
                  user: params.data.user
                },
                context: params.context
              })
            })
        })
    })
  }

  public static viewablePlacesQuery(
    params: {
      data: {
        query: ModelQueryBuilderContract<typeof Place> | RelationSubQueryBuilderContract<typeof Place> | HasManyQueryBuilderContract<typeof Place, any>,
        user?: { id: number }
      },
      context?: Context
    },
  ): ModelQueryBuilderContract<typeof Place> | RelationSubQueryBuilderContract<typeof Place> | HasManyQueryBuilderContract<typeof Place, any> {
    return params.data.query.where(placeBuilder => {
      placeBuilder.whereHas('club', b => {
        if(!!params.data.user) {
          this.userCanInClubQuery({
            data: {
              user: params.data.user,
              resource: 'place',
              action: 'view',
              query: b
            },
            context: params.context
          })
        }
        b.orWhere('public', true)
      })
    })
  }
}