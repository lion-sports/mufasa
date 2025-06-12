import { DateTime } from 'luxon'
import { column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import Dashboard from './Dashboard.js'
import WidgetSetting from './WidgetSetting.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";
import { type HasOne } from "@adonisjs/lucid/types/relations";

export default class Widget extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public componentName: string

  @column()
  public dashboardId: number

  @belongsTo(() => Dashboard, {
    localKey: 'id',
    foreignKey: 'dashboardId',
  })
  public dashboard: BelongsTo<typeof Dashboard>

  @hasOne(() => WidgetSetting, {
    localKey: 'id',
    foreignKey: 'widgetId',
  })
  public widgetSetting: HasOne<typeof WidgetSetting>

  @column()
  public height: number

  @column()
  public width: number

  @column()
  public left: number

  @column()
  public top: number

  @column()
  public options?: Record<string, any>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
