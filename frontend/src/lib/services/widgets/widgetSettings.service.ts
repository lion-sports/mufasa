import { FetchBasedService } from '$lib/services/common/fetchBased.service'

export type TeamFilter = 'friend' | 'opponent' | 'both'

type VolleyballDistributionWidgetSetting = {
  widget: 'VolleyballDistribution',
  team?: TeamFilter
}

type VolleyballServeSummaryWidgetSetting = {
  widget: 'VolleyballServeSummary',
  team?: TeamFilter
}

type VolleyballBlockSummaryWidgetSetting = {
  widget: 'VolleyballBlockSummary',
  team?: TeamFilter
}

type VolleyballReceiveSummaryWidgetSetting = {
  widget: 'VolleyballReceiveSummary',
  team?: TeamFilter
}

type VolleyballTrendWidgetSetting = {
  widget: 'VolleyballTrend',
  team?: TeamFilter,
  window?: number
  type?: ('block' | 'serve' | 'spike' | 'receive')[]
}

export type WidgetSettingStructure =
  VolleyballDistributionWidgetSetting |
  VolleyballServeSummaryWidgetSetting |
  VolleyballBlockSummaryWidgetSetting |
  VolleyballReceiveSummaryWidgetSetting |
  VolleyballTrendWidgetSetting

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
