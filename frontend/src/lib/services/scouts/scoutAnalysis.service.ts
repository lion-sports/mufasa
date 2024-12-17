import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { ScoutEventPlayer, VolleyballScoutEventPosition } from 'lionn-common'

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

export type TotalSpikeForPlayerAndPosition = {
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

export default class ScoutAnalysisService extends FetchBasedService {
  public async totalSpikeForPosition(params: {
    scoutId?: number,
    sets?: number[]
  }): Promise<TotalSpikeForPositionResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPosition`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets
      }
    })

    return response
  }

  public async totalSpikeForPlayer(params: {
    scoutId?: number,
    sets?: number[]
  }): Promise<TotalSpikeForPlayerResult> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPlayer`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets
      }
    })

    return response
  }

  public async totalSpikeForPlayerAndPosition(params: {
    scoutId?: number,
    sets?: number[]
  }): Promise<TotalSpikeForPlayerAndPosition> {
    let response = await this.client.post({
      url: `/scouts/analysis/totalSpikeForPlayerAndPosition`,
      body: {
        scoutId: params.scoutId,
        sets: params.sets
      }
    })

    return response
  }
}
