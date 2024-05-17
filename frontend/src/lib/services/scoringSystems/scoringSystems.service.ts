import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { User } from '../auth/auth.service'
import type { Event } from '../events/events.service'
import type { Sport } from '../scouts/scouts.service'
import type { Team } from '../teams/teams.service'

export type ScoringSystemConfigPoints = {
  mode: 'totalPoints'
  totalPoints: number
} | {
  mode: 'winPoints'
  winPoints: number
  hasAdvantages: boolean
  pointsLimit?: number
}

export type ScoringSystemConfig = {
  set: {
    mode: 'totalSet'
    totalSets: number
  } | {
    mode: 'winSet'
    winSets: number
  },
  points: ScoringSystemConfigPoints,
  tieBreak?: ScoringSystemConfigPoints
}

export type ScoringSystem = {
  name: string
  public: boolean
  sport: Sport
  createdByUserId: number
  createdByUser: User
  createdForTeamId: number
  createdForTeam: Team
  config: ScoringSystemConfig
  createdAt: Date
  updatedAt: Date
}

export type PaginatedScoringSystems = {
  data: ScoringSystem[]
  meta: PaginationData
}

export default class ScoringSystemsService extends FetchBasedService {
  public async create(params: { 
    name: string
    public: boolean
    sport: Sport
    createdForTeamId: number
    config: ScoringSystemConfig
  }): Promise<ScoringSystem> {
    let response = await this.client.post({
      url: '/scoringSystems',
      body: params
    })

    return response
  }

  public async list(params?: { page?: number; perPage?: number, filtersBuilder?: FilterBuilder }): Promise<PaginatedScoringSystems> {
    if (!params)
      params = {
        page: 1,
        perPage: 100
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 100

    let response = await this.client.get({
      url: '/scoringSystems',
      params: params
    })

    return response
  }

  public async show(params: { id: number }): Promise<ScoringSystem> {
    let response = await this.client.get({
      url: '/scoringSystems/' + params.id
    })

    return response
  }

  public async update(params: { 
    id: number
    name: string
    public: boolean
    sport: Sport
    config: ScoringSystemConfig
  }): Promise<ScoringSystem> {
    let response = await this.client.put({
      url: '/scoringSystems/' + params.id,
      body: params
    })

    return response
  }

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/scoringSystems/' + params.id
    })

    return response
  }

}
