import { DateTime } from 'luxon'
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import Dashboard from './Dashboard'

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
