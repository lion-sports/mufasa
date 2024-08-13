import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Event } from '../events/events.service'
import type { ScoringSystem } from '../scoringSystems/scoringSystems.service'
import type { Player } from '../players/players.service'
import type { VolleyballPhase, VolleyballPlayersDynamicPosition, VolleyballPlayersPosition, VolleyballPoints } from './volleyball'
import type { Teammate } from '../teams/teams.service'
import type { User } from '../auth/auth.service'

export const SPORTS = ['volleyball', 'basketball'] as const
export type Sport = typeof SPORTS[number]

export const VOLLEYBALL_ROLES = ['setter', 'outsideHitter', 'oppositeHitter', 'middleBlocker', 'libero'] as const
export const BASKETBALL_ROLES = ['pointGuard', 'shootingGuard', 'smallForward', 'powerForward', 'center'] as const
export const ROLES = [
  ...VOLLEYBALL_ROLES,
  ...BASKETBALL_ROLES
]
export type VolleyballRole = typeof VOLLEYBALL_ROLES[number]
export type BasketballRole = typeof BASKETBALL_ROLES[number]
export type Role = typeof ROLES[number]

export type ScoutEventPlayer = {
  id: Player['id'],
  convocationId: Player['convocationId'],
  scoutId: Player['scoutId'],
  teammateId: Player['teammateId'],
  teammate: {
    alias?: Teammate['alias'],
    user: {
      firstname: User['firstname'],
      lastname: User['lastname']
    }
  },
  aliases: Player['aliases'],
  role: Player['role'],
  shirtId: Player['shirtId'],
  shirtNumber: Player['shirtNumber'],
  shirtPrimaryColor: Player['shirtPrimaryColor'],
  shirtSecondaryColor: Player['shirtSecondaryColor'],
  isOpponent: Player['isOpponent']
}

export type VolleyballScoutStash = {
  points: VolleyballPoints,
  playersServePositions?: VolleyballPlayersPosition,
  playersReceivePositions?: VolleyballPlayersDynamicPosition,
  playersDefenseBreakPositions?: VolleyballPlayersPosition,
  playersDefenseSideOutPositions?: VolleyballPlayersPosition,
  playersReceiveDynamicPositions?: VolleyballPlayersPosition,
  currentSetSubstitutionsMade: {
    friends: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
    enemy: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
  },
  currentSetTimeoutsCalled: {
    friends: number
    enemy: number
  },
  phase?: VolleyballPhase
}

export type Scout = {
  id: number
  sport: Sport
  name: string
  stash?: VolleyballScoutStash
  startedAt: Date
  eventId: number
  scoringSystem: ScoringSystem
  scoringSystemId: number
  players: Player[]
  event: Event
  scoutInfo: ScoutInfo
  createdAt: Date
  updatedAt: Date
}

export type ScoutEventJson<Type = string, S extends Sport = Sport> = {
  _id?: string
  date: Date
  scoutId: number
  teamId: number
  sport: S
  type: Type
  createdByUserId?: number
  points: any
}

export type ScoutStudio = {
  scout: Scout
}

export type ScoutInfo = {
  general: {
    opponent?: {
      name?: string
    }
  }
}

export type PaginatedScouts = {
  data: Scout[]
  meta: PaginationData
}

export default class ScoutsService extends FetchBasedService {
  public async create(params: { 
    sport: Sport
    name: string
    startedAt: Date
    eventId: number
    scoringSystemId: number
    scoutInfo?: ScoutInfo
  }): Promise<Scout> {
    let response = await this.client.post({
      url: '/scouts',
      body: params
    })

    return response
  }

  public async list(params?: { page?: number; perPage?: number }): Promise<PaginatedScouts> {
    if (!params)
      params = {
        page: 1,
        perPage: 300
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 300

    let response = await this.client.get({
      url: '/scouts',
      params: params
    })

    return response
  }

  public async show(params: { id: number }): Promise<Scout> {
    let response = await this.client.get({
      url: '/scouts/' + params.id
    })

    response.startedAt = new Date(response.startedAt)
    response.createdAt = new Date(response.createdAt)
    response.updatedAt = new Date(response.updatedAt)

    return response
  }

  public async importTeammates(params: {
    id: number
    importShirts?: boolean
    importRoles?: boolean
    importAbsents?: boolean
  }): Promise<{ success: boolean }> {
    let response = await this.client.post({
      url: '/scouts/' + params.id + '/importTeammates',
      body: params
    })

    return response
  }

  public async update(params: { 
    id: number; 
    sport?: Sport
    name?: string
    startedAt?: Date
    eventId?: number
    scoringSystemId?: number
    scoutInfo?: ScoutInfo
  }): Promise<Scout> {
    let response = await this.client.put({
      url: '/scouts/' + params.id,
      body: params
    })

    return response
  }

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/scouts/' + params.id
    })

    return response
  }

  public async studio(params: { id: number }): Promise<ScoutStudio> {
    let response = await this.client.get({
      url: '/scouts/' + params.id + '/studio'
    })

    return response
  }

}
