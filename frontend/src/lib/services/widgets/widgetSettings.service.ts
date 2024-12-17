import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { TotalSpikeForPlayerAndPosition, TotalSpikeForPlayerResult, TotalSpikeForPositionResult } from '../scouts/scoutAnalysis.service'

export type TeamFilter = 'friend' | 'opponent' | 'both'

type VolleyballDistributionWidgetSetting = {
  widget: 'VolleyballDistribution',
  team?: TeamFilter
}

export type WidgetSettingStructure = VolleyballDistributionWidgetSetting

export type WidgetSetting = {
  id: number
  settings?: WidgetSettingStructure
  widgetId: number
  createdAt: Date
  updatedAt: Date
}

export default class WidgetSettingsService extends FetchBasedService {
  public async set(params: {
    widgetId?: number,
    settings?: WidgetSettingStructure
  }): Promise<void> {
    let response = await this.client.post({
      url: `/widgetSettings/set`,
      body: {
        widgetId: params.widgetId,
        settings: params.settings
      }
    })

    return response
  }
}
