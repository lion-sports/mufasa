import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { Convocation } from '../convocations/convocations.service'
import type { Role, Scout } from '../scouts/scouts.service'
import type { Teammate } from '../teams/teams.service'

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

export type PaginatedPlayers = {
  data: Player[]
  meta: PaginationData
}

export default class PlayersService extends FetchBasedService {
  public async create(params: {
    scoutId: number
    convocationId?: number
    teammateId?: number
    aliases?: string[]
    shirtId?: number
    role?: Role
    shirtNumber?: number
    shirtPrimaryColor?: string | null
    shirtSecondaryColor?: string | null
    isOpponent?: boolean
  }): Promise<Player> {
    let response = await this.client.post({
      url: '/players',
      body: params
    })

    return response
  }

  public async list(params?: {
    page?: number
    perPage?: number
    filtersBuilder?: FilterBuilder
  }): Promise<PaginatedPlayers> {
    if (!params)
      params = {
        page: 1,
        perPage: 300
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 300

    let response = await this.client.get({
      url: '/players',
      params: params
    })

    return response
  }

  public async show(params: { id: number }): Promise<Player> {
    let response = await this.client.get({
      url: '/players/' + params.id
    })

    response.createdAt = new Date(response.createdAt)
    response.updatedAt = new Date(response.updatedAt)

    return response
  }

  public async update(params: {
    id: number
    aliases?: string[]
    shirtId?: number
    role?: Role
    shirtNumber?: number
    shirtPrimaryColor?: string | null
    shirtSecondaryColor?: string | null
    isOpponent?: boolean
  }): Promise<Player> {
    let response = await this.client.put({
      url: '/players/' + params.id,
      body: params
    })

    return response
  }

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/players/' + params.id
    })

    return response
  }
}
