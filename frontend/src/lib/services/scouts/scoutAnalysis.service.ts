import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { ScoutEventPlayer, VolleyballScoutEventPosition } from 'lionn-common'
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
}
