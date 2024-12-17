import { DateTime } from 'luxon'
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import Widget from './Widget'
import { TeamFilter } from 'App/managers/scout/analysis/scoutAnalysis.manager'

type VolleyballDistributionWidgetSetting = {
  widget: 'VolleyballDistribution',
  team?: TeamFilter
}

export type WidgetSettingStructure = VolleyballDistributionWidgetSetting

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
