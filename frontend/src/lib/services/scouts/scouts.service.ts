import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Convocation } from '../convocations/convocations.service'
import type { Event } from '../events/events.service'
import type { ScoringSystem } from '../scoringSystems/scoringSystems.service'
import type { Teammate } from '../teams/teams.service'

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

export type Player = {
  id: number
  convocationId: number
  convocation: Convocation
  scoutId: number
  scout: Scout
  teammateId: number
  teammate: Teammate
  aliases: string[]
  role: Role
  shirtId: number
  shirtNumber: number
  shirtPrimaryColor?: string | null
  shirtSecondaryColor?: string | null
  isOpponent: boolean
}

export type Scout = {
  id: number
  sport: Sport
  name: string
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
