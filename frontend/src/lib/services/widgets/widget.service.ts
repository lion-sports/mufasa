import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { TotalSpikeForPlayerAndPosition, TotalSpikeForPlayerResult, TotalSpikeForPositionResult } from '../scouts/scoutAnalysis.service'
import type { TeamFilter } from './widgetSettings.service'

export default class WidgetsService extends FetchBasedService {
  public async loadDistribution(params: {
    scoutId?: number
    sets?: number[]
    team?: TeamFilter
  }): Promise<{
    totalSpikeForPosition: TotalSpikeForPositionResult
    totalSpikeForPlayer: TotalSpikeForPlayerResult
    totalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPosition
    previousTotalSpikeForPosition: TotalSpikeForPositionResult
    previousTotalSpikeForPlayer: TotalSpikeForPlayerResult
    previousTotalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPosition
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
}
