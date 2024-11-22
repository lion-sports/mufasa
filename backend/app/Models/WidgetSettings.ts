import { DateTime } from 'luxon'
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import Widget from './Widget'

type WidgetSettingStructureCustomers = {
  widget:
    | 'ReportsByCustomers'
    | 'TotalReportsByCustomerLastYear'
    | 'CustomersUboEarnings'
    | 'TotalSalesByTimespan'
  customers: string[]
  timespan?: string
}

type WidgetSettingStructureStatuses = {
  widget: 'ReportsByStatus' | 'CustomersByStatus' | 'RequestsByStatus'
  activeStatuses: string[]
}

type WidgetSettingStructureDates = {
  widget: 'date'
  fromDate: Date
  toDate: Date
}

export type WidgetSettingStructure =
  | WidgetSettingStructureStatuses
  | WidgetSettingStructureDates
  | WidgetSettingStructureCustomers

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
