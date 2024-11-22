import { DateTime } from 'luxon'
import { column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import User from './User'
import Widget from './Widget'

export default class Dashboard extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public active: boolean

  @column()
  public default: boolean

  @column()
  public userId: number

  @column()
  public name: string

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Widget, {
    localKey: 'id',
    foreignKey: 'dashboardId',
  })
  declare widgets: HasMany<typeof Widget>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
