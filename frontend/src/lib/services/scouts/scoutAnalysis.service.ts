import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { ScoutEventPlayer, VolleyballPoints, VolleyballScoutEventPosition } from 'lionn-common'
import type { TeamFilter } from '../widgets/widgetSettings.service'

export type TotalSpikeForPositionResult = {
  position: VolleyballScoutEventPosition
  opponent: boolean
  total: number
  percentage: number
  friendsPercentage: number
  opponentsPercentage: number
}[]

export type TotalSpikeForPlayerResult = {
  player: ScoutEventPlayer
  total: number
  percentage: number
  points: number
  errors: number
}[]

export type TotalSpikeForPlayerAndPositionResult = {
  playerId: number
  position: number
  player: ScoutEventPlayer
  total: number
  percentage: number
  points: number
  pointsPercentage: number
  errors: number
  errorsPercentage: number
}[]

export type TotalServeResult = {
  opponent: boolean
  total: number
  points: number
  errors: number
  pointsPercentage: number
  errorsPercentage: number
}[]


export type TotalServeByPlayerResult = {
  player: ScoutEventPlayer
  total: number
  points: number
  errors: number
  pointsPercentage: number
  errorsPercentage: number
}[]

export type TotalBlockResult = {
  opponent: boolean
  total: number
  points: number
  handsOut: number
  touch: number
  putBack: number
  pointsPercentage: number
  handsOutPercentage: number
  touchPercentage: number
  putBackPercentage: number
}[]

export type TotalBlockByPlayerResult = {
  player: ScoutEventPlayer
  total: number
  points: number
  handsOut: number
  touch: number
  putBack: number
  pointsPercentage: number
  handsOutPercentage: number
  touchPercentage: number
  putBackPercentage: number
}[]

export type TotalReceiveResult = {
  opponent: boolean
  total: number
  perfect: number
  plus: number
  minus: number
  slash: number
  error: number
  perfectPercentage: number
  plusPercentage: number
  minusPercentage: number
  slashPercentage: number
  errorPercentage: number
}[]

export type TotalReceiveByPlayerResult = {
  player: ScoutEventPlayer
  total: number
  perfect: number
  plus: number
  minus: number
  slash: number
  error: number
  perfectPercentage: number
  plusPercentage: number
  minusPercentage: number
  slashPercentage: number
  errorPercentage: number
}[]

export type TrendResult = {
  type: 'block' | 'serve' | 'spike' | 'receive'
  rating: number
  windowAverageRating: number
}[]

export default class ScoutAnalysisService extends FetchBasedService {
  public async totalSpikeForPosition(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalSpikeForPositionResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPosition`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalSpikeForPlayer(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalSpikeForPlayerResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPlayer`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalSpikeForPlayerAndPosition(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalSpikeForPlayerAndPositionResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPlayerAndPosition`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalServe(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalServeResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalServe`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalServeByPlayer(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalServeByPlayerResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalServeByPlayer`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalBlock(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalBlockResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalBlock`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalBlockByPlayer(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalBlockByPlayerResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalBlockByPlayer`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalReceive(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalReceiveResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalReceive`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async totalReceiveByPlayer(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<TotalReceiveByPlayerResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalReceiveByPlayer`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async pointsHistory(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<VolleyballPoints[]> {
    let response = await this.client.post({
      url: `/scouts/analysis/pointsHistory`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async trend(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
    type?: ('block' | 'serve' | 'spike' | 'receive')[]
    window?: number
  }): Promise<TrendResult[]> {
    let response = await this.client.post({
      url: `/scouts/analysis/trend`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team,
        type: params.type,
        window: params.window
      }
    })

    return response
  }
}
