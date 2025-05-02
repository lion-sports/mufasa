import { DateTime } from 'luxon'
import { column, belongsTo } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import Widget from './Widget.js'
import { TeamFilter } from '#app/managers/scout/analysis/scoutAnalysis.manager'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

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

export default class WidgetSetting extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public settings: WidgetSettingStructure

  @column()
  public widgetId: number

  @belongsTo(() => Widget, {
    localKey: 'id',
    foreignKey: 'widgetId',
  })
  public widget: BelongsTo<typeof Widget>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
