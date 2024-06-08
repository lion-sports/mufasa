import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Event } from '../events/events.service'
import type { ScoringSystem } from '../scoringSystems/scoringSystems.service'

export const SPORTS = ['volleyball', 'basketball'] as const
export type Sport = typeof SPORTS[number]

export type Scout = {
  id: number
  sport: Sport
  name: string
  startedAt: Date
  eventId: number
  scoringSystem: ScoringSystem
  scoringSystemId: number
  event: Event
  createdAt: Date
  updatedAt: Date
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

}
