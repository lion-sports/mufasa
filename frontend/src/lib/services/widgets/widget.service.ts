import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Widget } from '../dashboards/dashboard.service'
import type { TotalServeByPlayerResult, TotalServeResult, TotalSpikeForPlayerAndPositionResult, TotalSpikeForPlayerResult, TotalSpikeForPositionResult } from '../scouts/scoutAnalysis.service'
import type { TeamFilter } from './widgetSettings.service'

export default class WidgetsService extends FetchBasedService {
  public async loadDistribution(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<{
    totalSpikeForPosition: TotalSpikeForPositionResult
    totalSpikeForPlayer: TotalSpikeForPlayerResult
    totalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPositionResult
    previousTotalSpikeForPosition: TotalSpikeForPositionResult
    previousTotalSpikeForPlayer: TotalSpikeForPlayerResult
    previousTotalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPositionResult
  }> {
    let response = await this.client.get({
      url: `/widgets/loadDistribution`,
      params: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async loadServeSummary(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<{
    totalServe: TotalServeResult
    totalServeByPlayer: TotalServeByPlayerResult
    previousTotalServeByPlayer: TotalServeByPlayerResult
  }> {
    let response = await this.client.get({
      url: `/widgets/loadServeSummary`,
      params: {
        scoutId: params.scoutId,
        sets: params.sets,
        team: params.team
      }
    })

    return response
  }

  public async get(params: {
    id: number
  }): Promise<Widget> {
    let response = await this.client.get({
      url: `/widgets/${params.id}`,
    })

    return response
  }
}
